# 📁 ESTRUCTURA DEL PROYECTO
## Sistema de Cotización Profesional 3.0

---

## 🗂️ Organización de Archivos

```
sistema-cotizacion-profesional/
│
├── 📄 Archivos Principales
│   ├── sistema-cotizador-hibrido-v3.html    # Frontend completo (abre en navegador)
│   ├── backend-apis-oficiales.js             # Backend Node.js (APIs)
│   ├── google-apps-script.gs                 # Script para Google Sheets
│   └── package.json                          # Dependencias Node.js
│
├── ⚙️ Configuración
│   ├── .env                                  # Variables de entorno (CREAR)
│   ├── .env.example                          # Plantilla de configuración
│   └── .gitignore                            # Archivos a ignorar en Git
│
├── 📖 Documentación
│   ├── README.md                             # Documentación principal
│   ├── GUIA-IMPLEMENTACION.md                # Guía paso a paso completa
│   ├── INICIO-RAPIDO.md                      # Inicio rápido (15 min)
│   └── ESTRUCTURA-PROYECTO.md                # Este archivo
│
└── 📁 Carpetas (se crearán automáticamente)
    ├── node_modules/                         # Dependencias (npm install)
    ├── exports/                              # Cotizaciones exportadas
    └── logs/                                 # Logs del sistema (opcional)
```

---

## 📋 DESCRIPCIÓN DE ARCHIVOS

### Archivos HTML/Frontend

#### `sistema-cotizador-hibrido-v3.html` (80KB)
- **Qué es**: Aplicación web completa de una sola página
- **Tecnologías**: HTML5, CSS3, JavaScript vanilla
- **Librerías incluidas**:
  - Chart.js (gráficas)
  - html2pdf.js (exportar PDF)
  - QRCode.js (códigos QR)
- **Funcionalidades**:
  - 5 pestañas (Búsqueda, Análisis, Comparación, Cotización, Seguimiento)
  - Sistema de cotizaciones completo
  - Exportación HTML/PDF
  - Integración con Google Sheets
  - Formularios de respuesta para clientes
- **Cómo usar**: Abrir directamente en el navegador
- **Personalización**: Buscar sección `:root` en CSS para cambiar colores

---

### Archivos JavaScript/Backend

#### `backend-apis-oficiales.js` (14KB)
- **Qué es**: Servidor backend con Express.js
- **Puerto**: 3000 (configurable en .env)
- **Endpoints**:
  - `GET /health` - Verificar que el servidor funciona
  - `POST /api/search` - Buscar refacciones
  - `POST /api/search-devices` - Buscar dispositivos completos
- **APIs integradas**:
  - Amazon Product Advertising API
  - eBay Finding API
  - MercadoLibre API
  - AliExpress (simulado)
- **Características**:
  - Búsqueda en paralelo en todas las plataformas
  - Datos simulados si no hay credenciales
  - Manejo de errores robusto
  - CORS habilitado
- **Cómo iniciar**: `npm run dev`

---

### Google Apps Script

#### `google-apps-script.gs` (16KB)
- **Qué es**: Script para integrar con Google Sheets
- **Funciones principales**:
  - `doPost()` - Recibir datos del frontend
  - `guardarCotizacion()` - Guardar cotizaciones
  - `guardarRespuestaCliente()` - Guardar respuestas
  - `obtenerCotizaciones()` - Consultar cotizaciones
  - `actualizarEstado()` - Actualizar estado
- **Hojas que crea**:
  - Cotizaciones
  - Referencias Base
  - Respuestas Clientes
  - Log de Actividad
- **Seguridad**: Se despliega como Web App con tu cuenta
- **Cómo desplegar**:
  1. Abrir en Apps Script
  2. Reemplazar SPREADSHEET_ID
  3. Implementar → Nueva implementación → Aplicación web
  4. Copiar URL generada

---

### Archivos de Configuración

#### `package.json`
- **Qué es**: Manifiesto de Node.js
- **Dependencias principales**:
  - express (servidor web)
  - cors (permitir requests desde frontend)
  - axios (hacer peticiones HTTP)
  - dotenv (variables de entorno)
  - amazon-paapi (API de Amazon)
- **Scripts**:
  - `npm start` - Iniciar en producción
  - `npm run dev` - Iniciar en desarrollo (con nodemon)

#### `.env.example`
- **Qué es**: Plantilla de variables de entorno
- **Variables**:
  - `PORT` - Puerto del servidor
  - `AMAZON_ACCESS_KEY` - Credencial Amazon
  - `AMAZON_SECRET_KEY` - Credencial Amazon
  - `AMAZON_PARTNER_TAG` - Tag de afiliado
  - `EBAY_APP_ID` - App ID de eBay
  - `EBAY_CERT_ID` - Certificado eBay
  - `EBAY_DEV_ID` - Developer ID eBay
- **Cómo usar**:
  ```bash
  cp .env.example .env
  # Editar .env con tus credenciales
  ```

#### `.gitignore`
- **Qué es**: Archivos que Git debe ignorar
- **Incluye**:
  - node_modules/
  - .env (importante para seguridad)
  - logs/
  - archivos temporales
- **Por qué es importante**: Evita subir credenciales al repositorio

---

## 📊 FLUJO DE DATOS

```
┌─────────────────┐
│   FRONTEND      │
│   (HTML)        │
└────────┬────────┘
         │
         ├─→ Búsqueda refacciones ──→ Backend API ──→ Amazon/eBay/ML
         │
         ├─→ Generar cotización ────→ Google Apps Script ──→ Google Sheets
         │
         └─→ Exportar HTML/PDF ─────→ Download en navegador
```

---

## 🔄 CICLO DE VIDA

### 1. Desarrollo Local
```
npm install           # Instalar dependencias
npm run dev          # Iniciar backend
[Abrir HTML]         # Abrir frontend en navegador
```

### 2. Configuración
```
- Configurar .env
- Desplegar Apps Script
- Configurar URL en frontend
```

### 3. Pruebas
```
- Probar búsqueda
- Generar cotización de prueba
- Verificar guardado en Sheets
- Exportar HTML/PDF
```

### 4. Despliegue
```
Frontend → Vercel/Netlify/GitHub Pages
Backend → Railway/Heroku/VPS
Google Sheets → Ya está en la nube
```

---

## 💾 ALMACENAMIENTO

### Datos en Google Sheets

| Hoja | Propósito | Columnas Principales |
|------|-----------|---------------------|
| **Cotizaciones** | Registro de todas las cotizaciones | Folio, Cliente, Dispositivo, Precio, Estado |
| **Referencias Base** | Precios de referencia guardados | Folio, Plataforma, Precio, Vendedor |
| **Respuestas Clientes** | Feedback de los clientes | Folio, Tipo Respuesta, Nombre, Mensaje |
| **Log de Actividad** | Auditoría del sistema | Timestamp, Acción, Resultado |

### Datos en localStorage (Frontend)

- URL del Google Apps Script
- Preferencias de usuario
- Última búsqueda realizada

---

## 🔐 SEGURIDAD

### Archivos Sensibles (NUNCA subir a Git)
```
.env                    # Credenciales de APIs
credentials/           # Certificados
secrets/              # Datos sensibles
*.pem, *.key          # Claves privadas
```

### Variables de Entorno Requeridas
```
# Mínimas (funciona sin ellas)
PORT=3000

# Opcionales (para APIs reales)
AMAZON_ACCESS_KEY=...
EBAY_APP_ID=...
```

---

## 📈 ESCALABILIDAD

### Tamaño del Proyecto

| Componente | Actual | Máximo Soportado |
|-----------|--------|------------------|
| **Frontend** | 80KB | Ilimitado (es estático) |
| **Backend** | 14KB | Escala horizontal |
| **Google Sheets** | 0-100 filas | 5 millones de celdas |
| **APIs** | 4 plataformas | Ilimitadas (agregar más) |

### Límites

- **Google Sheets**: 5M celdas por hoja
- **Apps Script**: 6 min/ejecución, 90 min/día
- **APIs**:
  - Amazon: 8,640 requests/día (gratis)
  - eBay: 5,000 requests/día (gratis)
  - MercadoLibre: Sin límite público

---

## 🛠️ MODIFICACIONES COMUNES

### Cambiar Colores
```html
<!-- En sistema-cotizador-hibrido-v3.html -->
<style>
    :root {
        --primary: #TU_COLOR;
        --secondary: #TU_COLOR;
    }
</style>
```

### Agregar Nueva API
```javascript
// En backend-apis-oficiales.js
async function searchNuevaAPI(query) {
    // Tu código aquí
    return results;
}

// Agregar a la búsqueda paralela
const [amazon, ebay, ml, nueva] = await Promise.allSettled([
    searchAmazon(query),
    searchEbay(query),
    searchMercadoLibre(query),
    searchNuevaAPI(query)
]);
```

### Personalizar Cotización HTML
```javascript
// En función generarHTMLCotizacion()
// Modificar el template HTML
```

---

## 🔍 BÚSQUEDA RÁPIDA DE CÓDIGO

### Buscar funcionalidad específica:

| Funcionalidad | Buscar en archivo | Función/Sección |
|---------------|-------------------|-----------------|
| Búsqueda de refacciones | backend-apis-oficiales.js | `app.post('/api/search')` |
| Generar cotización | sistema-cotizador-hibrido-v3.html | `function generarCotizacion()` |
| Guardar en Sheets | google-apps-script.gs | `function guardarCotizacion()` |
| Exportar HTML | sistema-cotizador-hibrido-v3.html | `function exportarHTML()` |
| Exportar PDF | sistema-cotizador-hibrido-v3.html | `function exportarPDF()` |
| Respuesta cliente | google-apps-script.gs | `function guardarRespuestaCliente()` |

---

## 📦 DEPENDENCIAS DETALLADAS

### Node.js (Backend)
```json
{
  "express": "Servidor web",
  "cors": "Cross-Origin requests",
  "axios": "HTTP client",
  "dotenv": "Variables de entorno",
  "amazon-paapi": "Amazon API",
  "nodemon": "Auto-reload en dev"
}
```

### CDN (Frontend - cargadas desde internet)
```
Chart.js - Gráficas
html2pdf.js - Exportar PDF
QRCode.js - Códigos QR
```

---

## 🎯 PRÓXIMOS PASOS

1. **Ahora mismo**: [INICIO-RAPIDO.md](INICIO-RAPIDO.md)
2. **Luego**: [GUIA-IMPLEMENTACION.md](GUIA-IMPLEMENTACION.md)
3. **Cuando esté listo**: Desplegar en producción
4. **Más adelante**: Personalizar y agregar funcionalidades

---

## 💡 TIPS FINALES

1. **Orden de implementación recomendado**:
   ```
   1. Probar frontend solo (sin backend)
   2. Agregar backend con datos simulados
   3. Configurar Google Sheets
   4. Configurar APIs reales
   5. Desplegar en producción
   ```

2. **Backups recomendados**:
   - Google Sheets: Automático por Google
   - Código: Git repository
   - Configuración: Documentar en README personal

3. **Monitoreo**:
   - Backend: Logs en consola
   - Frontend: Developer Console (F12)
   - Google Sheets: Ver "Log de Actividad"

---

<div align="center">

**Sistema de Cotización Profesional 3.0**

*Todo lo que necesitas saber sobre la estructura del proyecto*

[⬆ Volver arriba](#-estructura-del-proyecto)

</div>
