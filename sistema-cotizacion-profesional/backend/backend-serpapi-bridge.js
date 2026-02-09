#!/usr/bin/env node
// backend-serpapi-bridge.js
// Puente entre Google Apps Script y Python SerpAPI

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración
const PYTHON_PATH = 'python'; // o 'python3' según tu sistema
const SCRIPT_DIR = __dirname;
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID || '1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI';

// ============================================
// ENDPOINTS
// ============================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: 'SerpAPI Bridge'
    });
});

// Endpoint principal: Buscar con SerpAPI
app.post('/api/buscar-serpapi', async (req, res) => {
    try {
        console.log('\n' + '='.repeat(80));
        console.log('📥 NUEVA SOLICITUD DE BÚSQUEDA');
        console.log('='.repeat(80));

        const {
            id,
            id_busqueda,
            dispositivo,
            marca,
            modelo,
            color,
            variante1,
            variante2,
            pieza
        } = req.body;

        // Usar 'id' o 'id_busqueda' (el que venga)
        const busqueda_id = id_busqueda || id || 'COT-' + Date.now();

        console.log('📋 Datos recibidos:');
        console.log(`   ID Búsqueda: ${busqueda_id}`);
        console.log(`   Dispositivo: ${dispositivo}`);
        console.log(`   Marca: ${marca}`);
        console.log(`   Modelo: ${modelo}`);
        console.log(`   Pieza: ${pieza}`);
        console.log(`   Variante1: ${variante1 || 'N/A'}`);
        console.log(`   Variante2: ${variante2 || 'N/A'}`);

        // Construir queries
        const query_pieza = [pieza, variante1, variante2, marca, modelo]
            .filter(Boolean)
            .join(' ')
            .trim();

        const query_modelo = `${marca} ${modelo}`.trim();

        console.log('\n🔍 Queries construidos:');
        console.log(`   Pieza: "${query_pieza}"`);
        console.log(`   Modelo: "${query_modelo}"`);

        // Ejecutar script Python
        console.log('\n🐍 Ejecutando script Python...');

        const resultado = await ejecutarPython(query_pieza, query_modelo, busqueda_id);

        console.log('\n✅ Búsqueda completada exitosamente');
        console.log(`   Total piezas: ${resultado.piezas?.length || 0}`);
        console.log(`   Total equipos nuevos: ${resultado.equipos_nuevos?.length || 0}`);
        console.log(`   Total equipos usados: ${resultado.equipos_usados?.length || 0}`);

        res.json({
            success: true,
            message: 'Búsqueda completada exitosamente',
            data: resultado,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);

        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Endpoint para guardar hallazgos en Google Sheets
app.post('/api/guardar-hallazgos', async (req, res) => {
    try {
        const { id_busqueda, hallazgos } = req.body;

        console.log(`\n💾 Guardando ${hallazgos.length} hallazgos para búsqueda ${id_busqueda}`);

        // Aquí llamaremos al Web App de Google Apps Script
        // o usaremos Google Sheets API

        const url_webapp = process.env.GOOGLE_WEBAPP_URL;

        if (!url_webapp) {
            console.warn('⚠️ GOOGLE_WEBAPP_URL no configurado. Los hallazgos no se guardaron en Sheets.');
            return res.json({
                success: false,
                message: 'Configurar GOOGLE_WEBAPP_URL para guardar en Sheets',
                data: { hallazgos }
            });
        }

        // Llamar al Web App de Google
        const response = await fetch(url_webapp, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'saveHallazgos',
                data: {
                    id_busqueda,
                    hallazgos
                }
            })
        });

        const result = await response.json();

        res.json({
            success: true,
            message: 'Hallazgos guardados en Google Sheets',
            data: result
        });

    } catch (error) {
        console.error('❌ Error guardando hallazgos:', error.message);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// FUNCIÓN PARA EJECUTAR PYTHON
// ============================================

function ejecutarPython(query_pieza, query_modelo, id_busqueda) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(SCRIPT_DIR, '..', 'scripts', 'comparador_serpapi_cli.py');

        // Verificar que el script existe
        if (!fs.existsSync(scriptPath)) {
            return reject(new Error(`Script no encontrado: ${scriptPath}`));
        }

        // Argumentos para el script Python
        const args = [
            scriptPath,
            '--query-pieza', query_pieza,
            '--query-modelo', query_modelo,
            '--id-busqueda', id_busqueda,
            '--output-json'
        ];

        console.log(`   Ejecutando: ${PYTHON_PATH} ${args.join(' ')}`);

        // Spawn proceso Python con codificación UTF-8
        const python = spawn(PYTHON_PATH, args, {
            env: {
                ...process.env,
                PYTHONIOENCODING: 'utf-8'
            }
        });

        let stdout_data = '';
        let stderr_data = '';

        python.stdout.on('data', (data) => {
            const chunk = data.toString();
            stdout_data += chunk;

            // Mostrar progreso en consola (líneas que no son JSON)
            const lines = chunk.split('\n');
            lines.forEach(line => {
                if (line.trim() && !line.trim().startsWith('{')) {
                    console.log(`   [Python] ${line}`);
                }
            });
        });

        python.stderr.on('data', (data) => {
            const chunk = data.toString();
            stderr_data += chunk;
            console.error(`   [Python Error] ${chunk}`);
        });

        python.on('close', (code) => {
            if (code === 0) {
                try {
                    // Extraer JSON del output
                    const lines = stdout_data.trim().split('\n');
                    let jsonData = null;

                    // Método 1: Buscar línea completa con JSON
                    for (let i = lines.length - 1; i >= 0; i--) {
                        const line = lines[i].trim();
                        if (line.startsWith('{')) {
                            try {
                                jsonData = JSON.parse(line);
                                break;
                            } catch (e) {
                                continue;
                            }
                        }
                    }

                    // Método 2: Reconstruir JSON fragmentado
                    if (!jsonData) {
                        let jsonLines = [];
                        let capturing = false;

                        for (const line of lines) {
                            const trimmed = line.trim();

                            // Detectar inicio de JSON (líneas con "campo": valor)
                            if (trimmed.includes('"id_busqueda":') || trimmed.includes('"query_pieza":')) {
                                capturing = true;
                                jsonLines = ['{'];
                            }

                            if (capturing) {
                                // Agregar línea sin prefijos de logging
                                const cleaned = trimmed.replace(/^\[Python\]\s*/, '');
                                if (cleaned) {
                                    jsonLines.push(cleaned);
                                }

                                // Detectar fin de JSON
                                if (cleaned === '}') {
                                    break;
                                }
                            }
                        }

                        if (jsonLines.length > 1) {
                            const jsonStr = jsonLines.join('\n');
                            try {
                                jsonData = JSON.parse(jsonStr);
                            } catch (e) {
                                console.log('   ⚠️ Error parseando JSON reconstruido:', e.message);
                            }
                        }
                    }

                    if (jsonData) {
                        resolve(jsonData);
                    } else {
                        reject(new Error('No se encontró JSON válido en la salida de Python'));
                    }

                } catch (error) {
                    reject(new Error(`Error parseando JSON: ${error.message}\nOutput: ${stdout_data}`));
                }
            } else {
                reject(new Error(`Python terminó con código ${code}\nError: ${stderr_data}`));
            }
        });

        python.on('error', (error) => {
            reject(new Error(`Error ejecutando Python: ${error.message}`));
        });
    });
}

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 BACKEND SERPAPI BRIDGE - INICIADO');
    console.log('='.repeat(80));
    console.log(`\n✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log('\n📡 Endpoints disponibles:');
    console.log(`   GET  /health                   - Health check`);
    console.log(`   POST /api/buscar-serpapi       - Ejecutar búsqueda SerpAPI`);
    console.log(`   POST /api/guardar-hallazgos    - Guardar en Google Sheets`);
    console.log('\n⚙️  Configuración:');
    console.log(`   Python: ${PYTHON_PATH}`);
    console.log(`   Script Dir: ${SCRIPT_DIR}`);
    console.log(`   Google Sheets ID: ${GOOGLE_SHEETS_ID}`);
    console.log(`   Web App URL: ${process.env.GOOGLE_WEBAPP_URL || 'NO CONFIGURADO'}`);
    console.log('\n💡 Esperando solicitudes...\n');
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error global:', err);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: err.message
    });
});

// Manejo de shutdown graceful
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM recibido. Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT recibido. Cerrando servidor...');
    process.exit(0);
});
