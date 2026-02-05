@echo off
chcp 65001 >nul
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                                                                   ║
echo ║   🏥 SISTEMA DE COTIZACIÓN - HOSPITAL DEL MÓVIL                  ║
echo ║                                                                   ║
echo ║   🚀 Backend SerpAPI Bridge                                      ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.
echo.

cd backend

echo [INFO] Verificando dependencias de Node.js...
if not exist "node_modules\" (
    echo [⚠️] Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo [❌] Error al instalar dependencias
        pause
        exit /b 1
    )
    echo [✅] Dependencias instaladas correctamente
) else (
    echo [✅] Dependencias ya instaladas
)

echo.
echo [INFO] Iniciando servidor backend...
echo.
echo ╔═══════════════════════════════════════════════════════════════════╗
echo ║                                                                   ║
echo ║   ✅ Servidor corriendo en http://localhost:3000                 ║
echo ║                                                                   ║
echo ║   📝 SIGUIENTE PASO:                                             ║
echo ║   1. Abre otra terminal                                          ║
echo ║   2. Ejecuta: ngrok http 3000                                    ║
echo ║   3. Copia la URL pública de ngrok                               ║
echo ║   4. Actualiza BACKEND_URL en Apps Script                        ║
echo ║                                                                   ║
echo ║   ⚠️  DEJA ESTA VENTANA ABIERTA MIENTRAS USES EL SISTEMA         ║
echo ║                                                                   ║
echo ╚═══════════════════════════════════════════════════════════════════╝
echo.
echo.

node backend-serpapi-bridge.js
