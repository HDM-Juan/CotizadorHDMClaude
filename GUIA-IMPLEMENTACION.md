# 🚀 GUÍA COMPLETA DE IMPLEMENTACIÓN
## Sistema de Cotización Profesional 3.0 - Hospital del Móvil

---

## 📋 TABLA DE CONTENIDOS

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación Rápida](#instalación-rápida)
3. [Configuración de Google Sheets](#configuración-de-google-sheets)
4. [Configuración del Backend](#configuración-del-backend)
5. [Despliegue del Frontend](#despliegue-del-frontend)
6. [Configuración de APIs](#configuración-de-apis)
7. [Pruebas](#pruebas)
8. [Solución de Problemas](#solución-de-problemas)
9. [Mantenimiento](#mantenimiento)

---

## 📦 REQUISITOS PREVIOS

### Software Necesario
- ✅ **Node.js** versión 14 o superior
  - Descargar de: https://nodejs.org/
  - Verificar instalación: `node --version`

- ✅ **Git** (opcional pero recomendado)
  - Descargar de: https://git-scm.com/
  - Verificar instalación: `git --version`

- ✅ **Editor de código** (VS Code recomendado)
  - Descargar de: https://code.visualstudio.com/

### Cuentas Necesarias
- ✅ **Google Account** (para Google Sheets y Apps Script)
- ✅ **Amazon Affiliate** (opcional - para API real)
- ✅ **eBay Developer** (opcional - para API real)
- ✅ **Hosting** (Vercel, Netlify, o similar)

---

## ⚡ INSTALACIÓN RÁPIDA (15 minutos)

### Paso 1: Descargar los archivos

```bash
# Opción A: Si tienes Git
git clone [URL_DEL_REPOSITORIO]
cd sistema-cotizacion-profesional

# Opción B: Descarga manual
# 1. Descarga todos los archivos
# 2. Colócalos en una carpeta llamada "sistema-cotizacion-profesional"
```

### Paso 2: Instalar dependencias

```bash
# Navega a la carpeta del proyecto
cd sistema-cotizacion-profesional

# Instala las dependencias de Node.js
npm install
```

### Paso 3: Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita el archivo .env con tus credenciales
# Puedes usar cualquier editor de texto
```

### Paso 4: Probar localmente

```bash
# Inicia el frontend (abre en navegador)
# Simplemente abre: sistema-cotizador-hibrido-v3.html

# Inicia el backend
npm run dev
```

**✅ Si ves el mensaje "Servidor corriendo en http://localhost:3000" ¡está funcionando!**

---

## 📊 CONFIGURACIÓN DE GOOGLE SHEETS (20 minutos)

### Paso 1: Crear el Spreadsheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Clic en **+ Blank** para crear una nueva hoja
3. Nómbrala: **"Sistema Cotización - Hospital del Móvil"**
4. Copia el **ID del spreadsheet** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
   ```

### Paso 2: Configurar Apps Script

1. En tu Google Sheet, ve a: **Extensiones → Apps Script**
2. Borra todo el código que aparece por defecto
3. Copia y pega todo el contenido de `google-apps-script.gs`
4. **IMPORTANTE**: En la línea 26, reemplaza `TU_SPREADSHEET_ID_AQUI` con el ID que copiaste
5. Guarda el proyecto (Ctrl+S o Cmd+S)
6. Nómbralo: **"Cotizador API v3"**

### Paso 3: Implementar como Web App

1. Clic en el botón **Implementar** (Deploy) → **Nueva implementación**
2. Configuración:
   - **Tipo**: Aplicación web
   - **Ejecutar como**: Yo (tu cuenta de Google)
   - **Quién tiene acceso**: Cualquier usuario
3. Clic en **Implementar**
4. **Autorizar permisos** cuando se solicite
5. **Copiar la URL generada**. Se verá así:
   ```
   https://script.google.com/macros/s/AKfycbx...abc123/exec
   ```

### Paso 4: Configurar en el Frontend

1. Abre `sistema-cotizador-hibrido-v3.html` en tu navegador
2. En el panel amarillo de configuración (parte superior)
3. Pega la URL del Apps Script
4. Clic en **💾 Guardar URL**
5. Clic en **🔌 Probar Conexión**

**✅ Si ves "Conexión exitosa" ¡está configurado correctamente!**

---

## 🔧 CONFIGURACIÓN DEL BACKEND (15 minutos)

### Paso 1: Variables de Entorno

Edita el archivo `.env` que creaste anteriormente:

```env
PORT=3000

# Estas son opcionales - el sistema funciona sin ellas usando datos simulados
AMAZON_ACCESS_KEY=tu_key
AMAZON_SECRET_KEY=tu_secret
AMAZON_PARTNER_TAG=tu_tag

EBAY_APP_ID=tu_app_id
EBAY_CERT_ID=tu_cert
EBAY_DEV_ID=tu_dev_id
```

### Paso 2: Obtener credenciales de APIs (OPCIONAL)

#### Amazon Product Advertising API

1. Ve a: https://affiliate-program.amazon.com.mx/
2. Crea una cuenta de afiliado
3. Espera aprobación (puede tardar 1-3 días)
4. Una vez aprobado:
   - Ve a **Tools → Product Advertising API**
   - Crea credenciales
   - Copia: Access Key, Secret Key, Partner Tag

#### eBay Developer API

1. Ve a: https://developer.ebay.com/
2. Crea una cuenta de desarrollador
3. Ve a **My Account → Keys**
4. Genera un **App ID** para sandbox
5. Copia tus credenciales

**NOTA**: El sistema funciona perfectamente con datos simulados. Las APIs reales son opcionales.

### Paso 3: Iniciar el Backend

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# O modo producción
npm start
```

Deberías ver algo como esto:
```
╔═══════════════════════════════════════════╗
║   🏥 Hospital del Móvil - Backend API    ║
║   Sistema de Cotización Profesional 3.0  ║
╚═══════════════════════════════════════════╝

✅ Servidor corriendo en http://localhost:3000
```

---

## 🌐 DESPLIEGUE DEL FRONTEND (10 minutos)

### Opción A: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Sigue las instrucciones:
# - Set up and deploy? Yes
# - Which scope? (tu cuenta)
# - Link to existing project? No
# - Project name? sistema-cotizacion
# - Directory? ./
```

### Opción B: Netlify

1. Ve a [app.netlify.com](https://app.netlify.com)
2. Arrastra la carpeta del proyecto
3. Espera el despliegue
4. Copia la URL generada

### Opción C: GitHub Pages

1. Sube el proyecto a GitHub
2. Ve a Settings → Pages
3. Source: Deploy from branch
4. Branch: main
5. Folder: / (root)
6. Save

**✅ Copia la URL de tu deployment para usarla más tarde**

---

## 🔐 CONFIGURACIÓN DE APIS (OPCIONAL)

### MercadoLibre API

No requiere credenciales para búsqueda básica. **¡Ya está funcionando!** ✅

### AliExpress

Actualmente usa datos simulados (no tiene API oficial pública).

---

## 🧪 PRUEBAS

### Prueba 1: Frontend Solo

1. Abre `sistema-cotizador-hibrido-v3.html` en el navegador
2. Completa el formulario:
   - Dispositivo: Smartphone
   - Marca: Apple
   - Modelo: iPhone 13
   - Refacción: Pantalla
3. Clic en **🔍 Buscar Cotizaciones**
4. **✅ Deberías ver resultados simulados en menos de 3 segundos**

### Prueba 2: Integración Google Sheets

1. Asegúrate de haber configurado la URL del Apps Script
2. Ve a la pestaña **💰 Cotización**
3. Completa la información del cliente
4. Selecciona 2-3 variantes
5. Completa precios
6. Clic en **💾 Generar Cotización**
7. **✅ Abre tu Google Sheet y verifica que aparezca la cotización**

### Prueba 3: Exportar HTML

1. Después de generar una cotización
2. Clic en **📄 Exportar HTML**
3. Se descargará un archivo HTML
4. Ábrelo en el navegador
5. **✅ Deberías ver la cotización con el formulario de respuesta del cliente**

### Prueba 4: Backend

```bash
# Prueba con curl
curl http://localhost:3000/health

# Deberías ver:
# {"status":"online","timestamp":"...","version":"3.0.0"}
```

---

## 🔥 SOLUCIÓN DE PROBLEMAS COMUNES

### Problema: "Cannot find module"

**Solución**:
```bash
# Reinstalar dependencias
rm -rf node_modules
rm package-lock.json
npm install
```

### Problema: "Puerto 3000 ya está en uso"

**Solución**:
```bash
# En .env, cambia el puerto
PORT=3001

# O mata el proceso en el puerto 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NÚMERO] /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Problema: Google Sheets no guarda

**Verificar**:
1. ✅ ID del spreadsheet está correcto en el script
2. ✅ Permisos autorizados completamente
3. ✅ URL del Apps Script configurada en el frontend
4. ✅ Abre Developer Console (F12) y busca errores

**Solución**:
- Vuelve a implementar el Apps Script
- Genera una nueva URL
- Actualízala en el frontend

### Problema: CORS errors

**Solución**:

En `backend-apis-oficiales.js`, asegúrate de tener:
```javascript
app.use(cors());
```

Si el problema persiste, usa:
```javascript
app.use(cors({
  origin: '*',
  credentials: true
}));
```

### Problema: Las APIs no funcionan

**Recordatorio**: El sistema funciona perfectamente con datos simulados.

Para APIs reales:
1. ✅ Verifica que las credenciales en `.env` sean correctas
2. ✅ Verifica que tu cuenta esté aprobada
3. ✅ Revisa los logs del servidor para ver errores específicos

---

## 🔄 MANTENIMIENTO

### Actualizar el Sistema

```bash
# Descargar actualizaciones
git pull origin main

# Reinstalar dependencias
npm install

# Reiniciar servidor
npm run dev
```

### Backups de Google Sheets

1. En tu Google Sheet: **Archivo → Crear copia**
2. Programa backups automáticos:
   - **Archivo → Versión history → Ver versiones**
   - Google mantiene historial automático

### Monitoreo

Revisa el Sheet **"Log de Actividad"** para ver todas las operaciones:
- Cotizaciones creadas
- Respuestas de clientes
- Errores del sistema

---

## 📞 SOPORTE Y RECURSOS

### Documentación Adicional

- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/guide)
- [Google Apps Script](https://developers.google.com/apps-script)

### Herramientas Útiles

- **Postman**: Probar APIs
- **ngrok**: Exponer localhost para pruebas
- **PM2**: Mantener backend corriendo en producción

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN COMPLETA

```
□ Node.js instalado
□ Proyecto descargado
□ npm install ejecutado
□ .env configurado
□ Google Sheet creado
□ Apps Script desplegado
□ URL de Apps Script configurada en frontend
□ Prueba de conexión exitosa
□ Backend corriendo localmente
□ Frontend funcionando en navegador
□ Prueba de cotización completada
□ Exportación HTML funcional
□ (Opcional) Frontend desplegado en internet
□ (Opcional) APIs reales configuradas
```

---

## 🎉 ¡LISTO!

Tu sistema está completamente funcional. Ahora puedes:

- ✅ **Cotizar refacciones** en múltiples plataformas
- ✅ **Comparar precios** vs dispositivos nuevos/usados
- ✅ **Generar cotizaciones profesionales** con tu marca
- ✅ **Exportar en HTML/PDF** para compartir con clientes
- ✅ **Recibir respuestas** directamente desde la cotización
- ✅ **Dar seguimiento** a todas las cotizaciones en Google Sheets

---

## 🚀 PRÓXIMOS PASOS

1. Personaliza los colores y logos con tu marca
2. Configura las APIs reales cuando estés listo
3. Despliega en producción
4. Comparte con tu equipo
5. ¡Empieza a cotizar!

---

**Sistema desarrollado para Hospital del Móvil**
*Versión 3.0 - Octubre 2024*
