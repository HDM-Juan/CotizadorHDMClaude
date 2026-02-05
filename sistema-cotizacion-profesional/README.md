# 🏥 Sistema de Cotización Profesional - Hospital del Móvil

Sistema completo de cotización de refacciones para móviles integrado con SerpAPI, Google Sheets y AppSheet.

## 🎯 Características

- ✅ Búsqueda automática en múltiples plataformas (Amazon, Google Shopping, Walmart, eBay, MercadoLibre, AliExpress)
- ✅ Integración con Google Sheets vía AppSheet
- ✅ Backend Node.js con SerpAPI
- ✅ Sistema de caché inteligente (30 días)
- ✅ Análisis comparativo: Pieza vs Equipo Completo
- ✅ Exportación de cotizaciones en HTML, PDF y JPG
- ✅ Frontend moderno y responsive

## 📁 Estructura del Proyecto

```
sistema-cotizacion-profesional/
├── backend/                          # Backend Node.js
│   ├── backend-serpapi-bridge.js    # Servidor que conecta con SerpAPI
│   └── package.json                 # Dependencias Node.js
│
├── scripts/                         # Scripts Python
│   ├── comparador_serpapi_cli.py   # CLI para búsquedas SerpAPI
│   ├── comparador_hibrido.py       # Modo híbrido (recomendado)
│   ├── serpapi_scraper.py          # Scraper SerpAPI
│   ├── cache_equipos.py            # Sistema de caché
│   ├── cotizacion_modelo.py        # Modelo de datos
│   ├── config_serpapi.py           # Configuración API
│   ├── google-apps-script-serpapi.gs # Apps Script para Google Sheets
│   └── requirements.txt            # Dependencias Python
│
├── docs/                           # Documentación
│   ├── README_SERPAPI.md          # Guía de SerpAPI
│   ├── INICIO_RAPIDO.md           # Inicio rápido (5 pasos)
│   ├── ESTADO_ACTUAL_SISTEMA.md   # Estado del sistema
│   └── CONECTAR_TODO.md           # Guía de integración completa
│
├── config/                         # Configuración (generada)
│   └── serpapi.json               # API key
│
├── cache/                          # Caché de búsquedas (generada)
│   └── equipos_cache.json
│
├── resultados/                     # Resultados de búsquedas (generada)
│   ├── *.json                     # Análisis completos
│   └── *.csv                      # Cotizaciones individuales
│
├── sistema-cotizador-hibrido-3.0.html # Frontend principal
├── INICIAR_SISTEMA.bat            # Script de inicio rápido
└── README.md                      # Este archivo
```

## 🚀 Inicio Rápido (15 minutos)

### Prerrequisitos

- Node.js 16+ instalado
- Python 3.8+ instalado
- Cuenta de SerpAPI (gratis hasta 250 búsquedas/mes)
- Cuenta de Google (para Sheets y Apps Script)
- ngrok instalado (para exponer backend localmente)

### Paso 1: Configurar SerpAPI

1. Registrarse en https://serpapi.com/users/sign_up
2. Obtener API key
3. Configurar:
```bash
cd sistema-cotizacion-profesional/scripts
python config_serpapi.py
# Pegar API key cuando lo solicite
```

### Paso 2: Instalar Dependencias

**Backend Node.js:**
```bash
cd backend
npm install
```

**Scripts Python:**
```bash
cd ../scripts
pip install -r requirements.txt
```

### Paso 3: Iniciar Backend

**Opción A - Con script (recomendado):**
```bash
# Desde la carpeta raíz del proyecto
doble click en INICIAR_SISTEMA.bat
```

**Opción B - Manual:**
```bash
cd backend
node backend-serpapi-bridge.js
```

### Paso 4: Exponer con ngrok

```bash
ngrok http 3000
```

Copiar la URL pública (ej: `https://abc123.ngrok-free.app`)

### Paso 5: Configurar Google Apps Script

1. Abrir Google Sheet: https://docs.google.com/spreadsheets/d/1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI/edit
2. Ir a **Extensiones** → **Apps Script**
3. Copiar contenido de `scripts/google-apps-script-serpapi.gs`
4. Actualizar `BACKEND_URL` con la URL de ngrok
5. Guardar y crear trigger `onEdit` para "Al editar"

### Paso 6: Usar el Sistema

**Desde AppSheet:**
1. Usuario llena formulario en AppSheet
2. AppSheet crea registro en Google Sheets (pestaña "Búsqueda")
3. Apps Script detecta nuevo registro
4. Apps Script llama al backend vía ngrok
5. Backend ejecuta búsqueda con SerpAPI
6. Resultados se guardan en pestaña "Hallazgos"

**Desde el Frontend:**
1. Abrir `sistema-cotizador-hibrido-3.0.html` en navegador
2. Cargar datos desde Google Sheets
3. Ver gráficas y análisis
4. Generar cotizaciones en HTML/PDF/JPG

## 📊 Flujo de Trabajo Completo

```
┌─────────────────┐
│   AppSheet      │ Usuario llena formulario
│   (Formulario)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Google Sheets  │ Registro creado en pestaña "Búsqueda"
│  (Base de Datos)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Apps Script    │ Detecta nuevo registro (trigger onEdit)
│  (Automatización)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     ngrok       │ Redirige petición
│  (Túnel público)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend Node.js│ Ejecuta script Python
│  (Orquestador)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Python + SerpAPI│ Busca en Amazon, Google Shopping, etc.
│  (Motor búsqueda)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Google Sheets  │ Resultados en pestaña "Hallazgos"
│  (Hallazgos)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend HTML  │ Visualización, gráficas, cotizaciones
│  (Interfaz)     │
└─────────────────┘
```

## 💰 Modos de Búsqueda

### Modo 1: Solo SerpAPI (4 plataformas)
- Google Shopping, Amazon, Walmart, eBay
- 250 búsquedas/mes gratis
- Sin problemas de anti-bot

### Modo 2: Solo Scraping (2 plataformas)
- MercadoLibre, AliExpress
- Búsquedas ilimitadas gratis
- Requiere ChromeDriver

### Modo 3: Híbrido (Recomendado) 🏆
- Combina SerpAPI + Scraping
- 4-6 plataformas
- Optimiza límite de 250 búsquedas/mes
- Mejor cobertura de precios

## 🔧 Comandos Útiles

```bash
# Configurar API key
python scripts/config_serpapi.py

# Test de búsqueda SerpAPI
python scripts/comparador_serpapi_cli.py

# Búsqueda híbrida (recomendado)
python scripts/comparador_hibrido.py

# Ver estado del caché
python scripts/cache_equipos.py

# Iniciar backend
cd backend && node backend-serpapi-bridge.js

# Iniciar ngrok
ngrok http 3000
```

## 📚 Documentación Detallada

- **[INICIO_RAPIDO.md](docs/INICIO_RAPIDO.md)** - Guía paso a paso (5 pasos, 15 minutos)
- **[README_SERPAPI.md](docs/README_SERPAPI.md)** - Guía completa de SerpAPI
- **[CONECTAR_TODO.md](docs/CONECTAR_TODO.md)** - Integración completa del sistema
- **[ESTADO_ACTUAL_SISTEMA.md](docs/ESTADO_ACTUAL_SISTEMA.md)** - Estado y arquitectura

## 🎨 Características del Frontend

- Header corporativo con gradiente rojo (#B22222 → #8B1A1A)
- Logo: https://i.imgur.com/DnV7x36.png
- Tarjetas de indicadores (Refacciones, Dispositivos Usados, Dispositivos Nuevos)
- Gráfica de dispersión con Plot.js
- Tabla de hallazgos con filtros y ordenamiento
- Formulario de cotización con múltiples variantes
- Exportación HTML/PDF/JPG
- Footer con datos de contacto y iconos de redes

## 🔒 Seguridad

- API keys almacenadas localmente en `config/serpapi.json`
- No compartir archivos de configuración en repositorios públicos
- Archivo `.gitignore` incluye: `config/`, `cache/`, `resultados/`

## 📊 Optimización de Búsquedas

**Sistema de caché inteligente:**
- Búsquedas de equipos completos se cachean por 30 días
- Búsquedas de piezas siempre son frescas
- Para 150 búsquedas/mes de piezas:
  - Piezas: 150 búsquedas
  - Equipos: ~4 búsquedas (cacheadas)
  - Total: 154 búsquedas (dentro del límite de 250)

## 🆘 Troubleshooting

**Error: "API key no configurada"**
```bash
python scripts/config_serpapi.py
```

**Error: "Too Many Requests"**
- Has excedido 250 búsquedas/mes
- Usar modo solo scraping temporalmente
- Esperar al próximo mes

**Backend no inicia:**
```bash
cd backend
npm install
node backend-serpapi-bridge.js
```

**ngrok no funciona:**
- Verificar que tienes authtoken configurado
- Ver [docs/INICIO_RAPIDO.md](docs/INICIO_RAPIDO.md) paso 1

## 🔮 Roadmap

- [ ] Dashboard de métricas
- [ ] Alertas de precio
- [ ] Historial de precios
- [ ] Más plataformas (Liverpool, Sears)
- [ ] API REST propia
- [ ] Autenticación de usuarios

## 📞 Contacto

Hospital del Móvil
- 📍 Florencia 70 Local "F", Colonia Juárez, CDMX
- ☎️ +52 (55) 5207-7189
- 📧 zonarosa@hospitaldelmovil.com.mx
- 🌐 www.hospitaldelmovil.com.mx
- 🟢 WhatsApp: +52 55 7883 9360

---

**Versión:** 3.0 Integrada con SerpAPI
**Actualizado:** 2026-02-04
**Proyecto:** CotizadorHDMClaude
