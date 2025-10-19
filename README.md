# 🏥 Sistema de Cotización Profesional 3.0
## Hospital del Móvil - Implementación Completa

---

## 📋 Descripción del Proyecto

Sistema completo de cotización de refacciones para dispositivos móviles que incluye:

✅ **Búsqueda en múltiples plataformas** (Amazon, eBay, Mercado Libre, AliExpress)
✅ **Análisis y comparación de precios** con gráficas interactivas
✅ **Comparación refacción vs dispositivo completo**
✅ **Sistema de cotizaciones multi-variante** (hasta 4 opciones por cliente)
✅ **Exportación de cotizaciones** en HTML y PDF
✅ **Comunicación bidireccional** con el cliente desde la cotización
✅ **Integración con Google Sheets** para almacenamiento y seguimiento
✅ **Sistema de respuestas** automático desde la cotización exportada
✅ **Seguimiento en tiempo real** del estado de cotizaciones

---

## 🎯 Características Principales

### Para el Negocio:
- 📊 Dashboard de seguimiento de cotizaciones
- 💾 Almacenamiento automático en Google Sheets
- 📈 Análisis de referencias de precios
- ⚡ Respuestas rápidas (genera cotizaciones en minutos)
- 📱 Integración con WhatsApp Business
- 📧 Notificaciones automáticas por email
- 🔄 Actualización en tiempo real de estados

### Para el Cliente:
- 💬 Puede responder directamente desde la cotización
- 📱 Múltiples canales de comunicación (WhatsApp, Email, Teléfono)
- 🔍 Transparencia total en precios de referencia
- ⚖️ Comparación clara: reparar vs comprar usado/nuevo
- 📄 Cotización profesional en HTML
- 🖨️ Opción de imprimir/guardar como PDF

---

## 📦 Archivos del Sistema

```
sistema-cotizacion/
│
├── 🌐 FRONTEND
│   └── sistema-cotizador-hibrido-3.0.html    [Aplicación web principal]
│
├── 🔧 BACKEND
│   ├── backend-apis-oficiales.js              [Servidor Node.js con APIs]
│   ├── package.json                           [Dependencias npm]
│   └── .env.example                           [Plantilla de variables de entorno]
│
├── ☁️ GOOGLE APPS SCRIPT
│   └── google-apps-script.gs                  [Script para Google Sheets]
│
└── 📚 DOCUMENTACIÓN
    └── README.md                              [Este archivo]
```

---

## 🚀 Guía de Implementación Rápida

### ⚙️ PASO 1: Configuración del Frontend (5 minutos)

1. **Abrir el archivo HTML**
   ```bash
   # Simplemente abre en tu navegador:
   sistema-cotizador-hibrido-3.0.html
   ```

2. **Funciona inmediatamente con datos simulados**
   - No requiere configuración inicial
   - Usa datos de ejemplo para testing
   - Todas las funcionalidades están activas

---

### 🔌 PASO 2: Configuración del Backend (30 minutos)

#### 2.1 Instalar Node.js

Descarga e instala desde: https://nodejs.org/ (versión 14 o superior)

```bash
# Verificar instalación
node --version
npm --version
```

#### 2.2 Instalar Dependencias

```bash
# En la carpeta del proyecto:
npm install
```

#### 2.3 Configurar APIs

**Amazon Product Advertising API:**
1. Registrarse en: https://affiliate-program.amazon.com.mx/
2. Crear cuenta de afiliado
3. Solicitar acceso a Product Advertising API
4. Obtener: Access Key, Secret Key, Partner Tag

**eBay Developer Program:**
1. Ir a: https://developer.ebay.com/
2. Crear cuenta de desarrollador
3. Crear una aplicación
4. Generar App ID (Sandbox primero, luego Production)

**Mercado Libre:**
- No requiere credenciales para búsquedas básicas ✅

#### 2.4 Crear Archivo .env

```bash
# Copiar plantilla
cp .env.example .env

# Editar con tus credenciales
nano .env  # o usar tu editor preferido
```

Contenido del .env:
```env
AMAZON_ACCESS_KEY=tu_key_aqui
AMAZON_SECRET_KEY=tu_secret_aqui
AMAZON_PARTNER_TAG=tu_tag_aqui
EBAY_APP_ID=tu_app_id_aqui
PORT=3000
```

#### 2.5 Iniciar el Backend

```bash
# Modo desarrollo (auto-reload)
npm run dev

# Modo producción
npm start
```

✅ Deberías ver:
```
🚀 Backend corriendo en http://localhost:3000
📡 Endpoints disponibles:
   POST /api/search - Buscar refacciones
   POST /api/search-devices - Buscar dispositivos completos
   GET /health - Health check
```

---

### ☁️ PASO 3: Configuración de Google Sheets (20 minutos)

#### 3.1 Crear Google Sheet

1. Ir a [Google Sheets](https://sheets.google.com)
2. Crear nueva hoja: "Cotizador - Base de Datos"
3. Copiar el ID del spreadsheet de la URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
   ```

#### 3.2 Configurar Google Apps Script

1. En tu Google Sheet: **Extensiones → Apps Script**
2. Borrar código predeterminado
3. Pegar el contenido de `google-apps-script.gs`
4. **IMPORTANTE**: En línea 8, cambiar:
   ```javascript
   const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';
   ```
   Por tu ID real:
   ```javascript
   const SPREADSHEET_ID = '1abc123def456...';
   ```
5. Guardar proyecto (Ctrl+S): "Cotizador API"

#### 3.3 Implementar como Web App

1. Click en **Implementar → Nueva implementación**
2. Configurar:
   - **Tipo**: Aplicación web
   - **Ejecutar como**: Yo (tu_email@gmail.com)
   - **Acceso**: Cualquier usuario
3. Click **Implementar**
4. **Autorizar permisos** cuando lo solicite
5. **Copiar URL** generada (algo como):
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

#### 3.4 Configurar URL en el Frontend

1. Abrir `sistema-cotizador-hibrido-3.0.html`
2. En el **campo amarillo superior**, pegar la URL del Web App
3. La URL se guarda automáticamente en localStorage

---

## 💡 Uso del Sistema

### 1️⃣ Buscar Refacciones

1. **Seleccionar tipo de dispositivo**: Smartphone, Tablet, Laptop, etc.
2. **Elegir marca**: Apple, Samsung, Huawei, etc.
3. **Introducir modelo**: iPhone 13, Galaxy S21, etc.
4. **Seleccionar pieza**: Pantalla, Batería, Cámara, etc.
5. **Agregar variante** (opcional): OLED, LCD, Original, etc.
6. Click en **"🔍 Buscar Refacciones"**

### 2️⃣ Ver Resultados

El sistema mostrará:
- 📊 **Estadísticas**: Total, promedios, mínimos y máximos
- 🔍 **Filtros**: Por plataforma, condición, precio, ordenamiento
- 📋 **Tabla**: Resultados detallados con precios y especificaciones
- 📈 **Gráfica**: Comparación visual de precios por plataforma

### 3️⃣ Comparar con Dispositivos Completos

1. Click en **"📱 Buscar Dispositivos Completos"**
2. El sistema busca dispositivos nuevos y usados
3. Compara automáticamente: **Refacción vs Dispositivo Completo**
4. Muestra análisis de rentabilidad

### 4️⃣ Crear Cotización

1. **Seleccionar referencias** base (checkbox en tabla)
2. Click en **"✅ Crear Cotización con Seleccionados"**
3. Se abre modal con 4 **tabs para variantes**:
   - Variante 1: Premium/Original
   - Variante 2: Alta Calidad
   - Variante 3: Estándar
   - Variante 4: Económica
4. Llenar datos en cada variante que desees ofrecer:
   - Nombre del cliente
   - Teléfono
   - Email (opcional)
   - Tipo de variante
   - Precio de venta
   - Tiempo de entrega
   - Garantía
   - Notas adicionales

### 5️⃣ Guardar y Exportar

**Opciones disponibles:**

1. **💾 Guardar en Google Sheets**
   - Almacena toda la información
   - Crea folio único
   - Registra referencias base
   - Inicia seguimiento

2. **📄 Exportar HTML**
   - Genera archivo HTML completo
   - Incluye código QR para WhatsApp
   - Formulario de respuesta integrado
   - Botones de comunicación directa
   - Cliente puede responder desde ahí

3. **📄 Exportar PDF**
   - Abre diálogo de impresión
   - Guardar como PDF desde el navegador
   - Ideal para enviar por email

---

## 🔄 Comunicación Bidireccional

### Desde la Cotización HTML Exportada:

El cliente puede:

1. **📱 Contactar por WhatsApp** (botón directo)
2. **✉️ Enviar Email** (botón directo)
3. **📞 Llamar por teléfono** (botón directo)
4. **📝 Llenar formulario** integrado con:
   - Nombre
   - Teléfono
   - Email
   - Decisión (Acepto / Tengo dudas / No me interesa)
   - Mensaje personalizado

### Al enviar el formulario:

1. ✅ Se guarda automáticamente en Google Sheets
2. 📧 Se envía notificación por email al negocio
3. 🔄 Se actualiza el estado de la cotización
4. 📊 Se registra en el seguimiento
5. ⚡ El negocio recibe alerta inmediata

---

## 📊 Google Sheets - Estructura

El sistema crea automáticamente 4 hojas:

### 1. 📋 Cotizaciones
Almacena todas las cotizaciones creadas:
- Folio único
- Datos del cliente
- Información del dispositivo y pieza
- Precio, garantía, tiempos
- Estado (Pendiente/Aceptado/Rechazado/Con Dudas)

### 2. 🔖 Referencias Base
Guarda las referencias de precios consultadas:
- Producto
- Plataforma
- Precio
- Condición
- Valoración
- Envío
- Link

### 3. 💬 Respuestas Clientes
Registra todas las respuestas recibidas:
- Folio de cotización
- Datos del cliente
- Decisión tomada
- Mensaje
- Fecha de respuesta

### 4. 📈 Seguimiento
Timeline de todas las acciones:
- Fecha/Hora
- Acción realizada
- Usuario/Cliente
- Detalles

---

## 🔧 Personalización

### Cambiar Datos del Negocio

En `sistema-cotizador-hibrido-3.0.html`, buscar y modificar:

```javascript
// Línea ~900
const whatsappNumber = '5512345678'; // Tu número de WhatsApp

// Línea ~940
const emailUrl = `mailto:contacto@hospitaldelmovil.com...`; // Tu email
```

### Cambiar Colores y Estilos

En el archivo HTML, sección `<style>`, modificar variables CSS:

```css
:root {
    --primary: #2563eb;        /* Color primario */
    --secondary: #10b981;      /* Color secundario */
    --danger: #dc2626;         /* Color de peligro */
    --warning: #f59e0b;        /* Color de advertencia */
    /* ... más colores ... */
}
```

### Agregar Más Plataformas

En `backend-apis-oficiales.js`, agregar función de búsqueda:

```javascript
async function buscarEnNuevaPlataforma(query) {
    // Tu lógica aquí
}
```

---

## 🐛 Solución de Problemas

### ❌ Backend no inicia

**Problema**: Error al ejecutar `npm start`

**Solución**:
```bash
# Verificar Node.js instalado
node --version

# Reinstalar dependencias
rm -rf node_modules
npm install

# Verificar archivo .env existe y tiene valores
cat .env
```

### ❌ No se guardan cotizaciones

**Problema**: Error al guardar en Google Sheets

**Soluciones**:
1. Verificar que el SPREADSHEET_ID en el script es correcto
2. Verificar que el Web App está implementado
3. Verificar permisos otorgados al script
4. Revisar la consola de Apps Script: **Ver → Registros**

### ❌ APIs no responden

**Problema**: Las búsquedas no traen resultados

**Soluciones**:
1. Verificar credenciales en archivo .env
2. Verificar límites de API no excedidos
3. Verificar conexión a internet
4. Revisar logs del servidor: `npm run dev`

### ❌ Cotización HTML no funciona

**Problema**: Formulario de respuesta no envía datos

**Soluciones**:
1. Verificar que la URL de Google Apps Script está configurada
2. Abrir consola del navegador (F12) y revisar errores
3. Verificar que el Web App acepta peticiones POST

---

## 📈 Métricas y Reportes

### Desde Google Sheets puedes crear:

1. **📊 Dashboard de Ventas**
   - Total de cotizaciones por mes
   - Tasa de conversión
   - Ticket promedio

2. **🎯 Análisis de Comportamiento**
   - Tiempo promedio de respuesta
   - Porcentaje de aceptación
   - Motivos de rechazo

3. **💰 Análisis de Precios**
   - Comparativa de referencias
   - Margen promedio
   - Precios más competitivos

---

## 🔒 Seguridad

### Mejores Prácticas:

1. ✅ **NUNCA** subir archivo `.env` a repositorios
2. ✅ Agregar `.env` a `.gitignore`
3. ✅ Usar HTTPS en producción
4. ✅ Rotar credenciales de API periódicamente
5. ✅ Limitar permisos del Google Apps Script
6. ✅ Validar inputs del usuario
7. ✅ Implementar rate limiting en el backend

---

## 🚀 Despliegue en Producción

### Frontend (Netlify - Gratis):

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --dir=. --prod
```

### Backend (Railway/Render - Gratis):

**Opción A: Railway**
1. Crear cuenta en railway.app
2. New Project → Deploy from GitHub
3. Configurar variables de entorno
4. Deploy automático

**Opción B: Render**
1. Crear cuenta en render.com
2. New Web Service → Connect Repository
3. Configurar: `npm start`
4. Agregar variables de entorno
5. Deploy

---

## 📞 Soporte

### Recursos Adicionales:

- 📖 [Documentación Amazon API](https://webservices.amazon.com/paapi5/documentation/)
- 📖 [Documentación eBay API](https://developer.ebay.com/develop/apis)
- 📖 [Documentación Google Apps Script](https://developers.google.com/apps-script)
- 📖 [Documentación Mercado Libre API](https://developers.mercadolibre.com.mx/)

### Contacto:

- 💬 WhatsApp: +52 55 1234 5678
- 📧 Email: soporte@hospitaldelmovil.com
- 🌐 Web: www.hospitaldelmovil.com

---

## 📝 Licencia

MIT License - Libre para uso comercial y personal

---

## 🎉 ¡Listo para Usar!

El sistema está completamente funcional y listo para implementar. Sigue los pasos anteriores y tendrás un sistema profesional de cotizaciones en menos de 1 hora.

**Desarrollado con ❤️ por Hospital del Móvil**

---

## 📌 Changelog

### v3.0.0 (Actual)
- ✨ Sistema de comunicación bidireccional
- ✨ Formulario de respuesta integrado en cotizaciones
- ✨ Código QR para WhatsApp
- ✨ 4 variantes por cotización
- ✨ Sistema de seguimiento completo
- ✨ Notificaciones automáticas
- ✨ Exportación HTML mejorada

### v2.0.0
- Sistema de cotizaciones multi-variante
- Integración con Google Sheets
- Comparación con dispositivos completos

### v1.0.0
- Búsqueda en múltiples plataformas
- Análisis de precios
- Exportación básica

---

**¡Gracias por usar el Sistema de Cotización Hospital del Móvil!** 🏥📱
