# 🎯 GUÍA RÁPIDA DE IMPLEMENTACIÓN
## Sistema de Cotización v3.0 - Paso a Paso

---

## 📦 CONTENIDO DEL PAQUETE

Has recibido estos archivos:

```
📁 Sistema-Cotizacion-v3.0/
│
├── 🌐 sistema-cotizador-hibrido-3.0.html    ← APLICACIÓN PRINCIPAL
├── 🔧 backend-apis-oficiales.js             ← SERVIDOR NODE.JS
├── ☁️ google-apps-script.gs                 ← SCRIPT PARA GOOGLE SHEETS
├── 📦 package.json                          ← DEPENDENCIAS
├── ⚙️ .env.example                          ← PLANTILLA DE CONFIGURACIÓN
└── 📚 README.md                             ← DOCUMENTACIÓN COMPLETA
```

---

## ⚡ OPCIÓN 1: INICIO RÁPIDO (5 MINUTOS)

### ¿Quieres probar el sistema YA?

1. **Abre el archivo HTML en tu navegador:**
   ```
   sistema-cotizador-hibrido-3.0.html
   ```

2. **¡LISTO!** 🎉
   - Funciona con datos de ejemplo
   - Todas las funcionalidades activas
   - No necesitas configurar nada más

3. **Prueba estas acciones:**
   - Buscar refacciones
   - Ver estadísticas y gráficas
   - Comparar con dispositivos completos
   - Crear cotización
   - Exportar HTML

---

## 🏗️ OPCIÓN 2: IMPLEMENTACIÓN COMPLETA (1 HORA)

### Paso 1️⃣: Configurar Google Sheets (15 minutos)

#### A. Crear Google Sheet

1. Abre [sheets.google.com](https://sheets.google.com)
2. Nuevo documento: "Cotizador DB"
3. **Copia el ID** de la URL:

```
https://docs.google.com/spreadsheets/d/[AQUÍ_ESTÁ_EL_ID]/edit
                                        ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                                        Copia esto
```

#### B. Configurar Apps Script

1. En el Google Sheet: **Extensiones → Apps Script**

2. Borra todo el código que aparece

3. **Abre** el archivo: `google-apps-script.gs`

4. **Copia TODO** el contenido

5. **Pega** en Apps Script

6. **IMPORTANTE**: Busca la línea 8:
   ```javascript
   const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';
   ```

7. **Reemplaza** con tu ID:
   ```javascript
   const SPREADSHEET_ID = '1abc123def456ghi789...';
   ```

8. **Guardar**: Ctrl+S (⌘+S en Mac)

9. Ponle nombre: "Cotizador API"

#### C. Implementar Web App

1. Click en **Implementar** (arriba derecha)

2. **Nueva implementación**

3. Configurar así:
   ```
   Tipo: Aplicación web
   Ejecutar como: Yo (tu_email@gmail.com)
   Quién tiene acceso: Cualquier usuario
   ```

4. Click **Implementar**

5. **Autorizar acceso** cuando te lo pida

6. **COPIAR LA URL** que te da:
   ```
   https://script.google.com/macros/s/AKfycby...............exec
   ```

#### D. Configurar en el HTML

1. Abre `sistema-cotizador-hibrido-3.0.html`

2. Busca el **recuadro amarillo** arriba

3. **Pega la URL** del Web App

4. ✅ Se guarda automáticamente

---

### Paso 2️⃣: Configurar Backend (30 minutos)

#### A. Instalar Node.js

1. Descarga desde: [nodejs.org](https://nodejs.org)

2. Instala (siguiente, siguiente, finalizar)

3. Verifica en terminal:
   ```bash
   node --version
   npm --version
   ```

#### B. Instalar Dependencias

1. Abre terminal en la carpeta del proyecto

2. Ejecuta:
   ```bash
   npm install
   ```

3. Espera a que termine (puede tardar 2-3 minutos)

#### C. Obtener Credenciales de APIs

**Amazon:**

1. Ve a: [affiliate-program.amazon.com.mx](https://affiliate-program.amazon.com.mx)

2. Regístrate como afiliado

3. Ve a: Product Advertising API

4. Solicita acceso

5. Obtén:
   - Access Key
   - Secret Key
   - Partner Tag

**eBay:**

1. Ve a: [developer.ebay.com](https://developer.ebay.com)

2. Crea cuenta de desarrollador

3. Create App

4. Obtén: App ID

#### D. Configurar Variables de Entorno

1. **Copia** el archivo `.env.example`

2. **Renómbralo** a `.env`

3. **Abre** con editor de texto

4. **Completa** tus credenciales:
   ```env
   AMAZON_ACCESS_KEY=aqui_tu_key
   AMAZON_SECRET_KEY=aqui_tu_secret
   AMAZON_PARTNER_TAG=aqui_tu_tag
   EBAY_APP_ID=aqui_tu_app_id
   PORT=3000
   ```

5. **Guarda** el archivo

#### E. Iniciar el Backend

```bash
# Modo desarrollo (recomendado para pruebas)
npm run dev

# O modo producción
npm start
```

✅ Deberías ver:
```
🚀 Backend corriendo en http://localhost:3000
📡 Endpoints disponibles:
   POST /api/search - Buscar refacciones
   POST /api/search-devices - Buscar dispositivos completos
```

---

### Paso 3️⃣: Conectar Todo (5 minutos)

#### A. Actualizar URL del Backend

1. Abre `sistema-cotizador-hibrido-3.0.html`

2. Busca (línea ~850):
   ```javascript
   const BACKEND_URL = 'http://localhost:3000';
   ```

3. Si desplegaste en servidor, cambia por tu URL

#### B. Probar Conexión

1. Abre el HTML en navegador

2. Busca refacciones

3. Si funciona: ✅ Backend conectado

4. Si no funciona:
   - Verifica que el backend esté corriendo
   - Abre consola del navegador (F12)
   - Revisa errores

---

## 🎨 PERSONALIZACIÓN BÁSICA

### Cambiar Número de WhatsApp

En `sistema-cotizador-hibrido-3.0.html`, busca:

```javascript
// Línea ~900
const whatsappNumber = '5512345678';
```

Cambia por tu número (10 dígitos, sin espacios)

### Cambiar Email de Contacto

```javascript
// Línea ~940
const emailUrl = `mailto:contacto@hospitaldelmovil.com...`;
```

Cambia por tu email

### Cambiar Colores

Busca en `<style>`:

```css
:root {
    --primary: #2563eb;    /* Azul principal */
    --secondary: #10b981;   /* Verde */
    /* ... */
}
```

Cambia los códigos de color

---

## 🧪 PROBAR EL SISTEMA

### Flujo Completo de Prueba:

1. **Buscar refacciones**
   - Tipo: Smartphone
   - Marca: Apple
   - Modelo: iPhone 13
   - Pieza: Pantalla
   - Click "Buscar"

2. **Ver resultados**
   - Tabla con precios
   - Gráfica comparativa
   - Estadísticas

3. **Comparar con dispositivos**
   - Click "Buscar Dispositivos Completos"
   - Ver análisis de rentabilidad

4. **Crear cotización**
   - Seleccionar algunos productos (checkbox)
   - Click "Crear Cotización"
   - Llenar datos del cliente en Variante 1
   - Llenar precio y garantía

5. **Guardar**
   - Click "Guardar en Google Sheets"
   - Verificar que se guardó (ver Google Sheet)

6. **Exportar**
   - Click "Exportar HTML"
   - Se descarga archivo
   - Abrirlo en navegador
   - Verificar que funciona el formulario

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Google Sheets:
- [ ] Sheet creado
- [ ] Apps Script configurado
- [ ] SPREADSHEET_ID correcto
- [ ] Web App implementado
- [ ] URL copiada
- [ ] URL pegada en HTML

### Backend:
- [ ] Node.js instalado
- [ ] Dependencias instaladas
- [ ] Credenciales de APIs obtenidas
- [ ] Archivo .env configurado
- [ ] Backend corriendo sin errores

### Frontend:
- [ ] HTML abre en navegador
- [ ] URL de Google Sheets configurada
- [ ] Número de WhatsApp actualizado
- [ ] Email de contacto actualizado
- [ ] Búsquedas funcionan
- [ ] Cotizaciones se guardan
- [ ] Exportación funciona

---

## 🐛 PROBLEMAS COMUNES

### ❌ "Backend no responde"

**Solución:**
```bash
# 1. Verificar que está corriendo
# Deberías ver el mensaje de inicio

# 2. Si no está corriendo, iniciarlo:
npm run dev

# 3. Verificar que no haya errores de credenciales
```

### ❌ "No se guarda en Google Sheets"

**Solución:**
1. Verificar SPREADSHEET_ID es correcto
2. Verificar Web App está implementado
3. Ver logs en Apps Script:
   - Apps Script → Ver → Registros

### ❌ "Formulario de respuesta no funciona"

**Solución:**
1. Verificar URL de Apps Script en el HTML exportado
2. Abrir consola del navegador (F12)
3. Buscar errores en la consola

### ❌ "No encuentro el ID del Sheet"

**Solución:**
```
En la URL de tu Google Sheet:
https://docs.google.com/spreadsheets/d/1abc123def/edit
                                         ↑↑↑↑↑↑↑↑
                                         Este es el ID
```

---

## 📞 ¿NECESITAS AYUDA?

### Recursos:

1. **README.md completo** - Documentación detallada
2. **Comentarios en el código** - Cada función explicada
3. **Consola del navegador (F12)** - Para ver errores

### Videos tutoriales recomendados:

- "Cómo usar Google Apps Script" - YouTube
- "Node.js para principiantes" - YouTube
- "Deploy con Netlify" - YouTube

---

## 🚀 PRÓXIMOS PASOS

### Una vez que todo funcione:

1. **Personaliza** el diseño y colores

2. **Prueba** con clientes reales

3. **Ajusta** precios y márgenes

4. **Despliega** en servidor público:
   - Frontend: Netlify (gratis)
   - Backend: Railway o Render (gratis)

5. **Conecta** con tu CRM o sistema existente

6. **Analiza** métricas en Google Sheets

---

## 🎉 ¡LISTO!

Ahora tienes un sistema profesional de cotizaciones funcionando.

**Tiempo total de implementación:**
- Opción 1 (básica): 5 minutos ⚡
- Opción 2 (completa): 1 hora 🏗️

**Desarrollado con ❤️ para Hospital del Móvil**

---

## 📌 RESUMEN VISUAL

```
┌─────────────────────────────────────────┐
│  1. GOOGLE SHEETS                       │
│  ├─ Crear sheet                         │
│  ├─ Apps Script                         │
│  ├─ Configurar ID                       │
│  ├─ Implementar Web App                 │
│  └─ Copiar URL                          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. BACKEND                             │
│  ├─ Instalar Node.js                    │
│  ├─ npm install                         │
│  ├─ Obtener APIs keys                   │
│  ├─ Configurar .env                     │
│  └─ npm run dev                         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. FRONTEND                            │
│  ├─ Abrir HTML                          │
│  ├─ Pegar URL de Apps Script            │
│  ├─ Actualizar WhatsApp                 │
│  ├─ Actualizar email                    │
│  └─ ¡LISTO PARA USAR!                   │
└─────────────────────────────────────────┘
```

---

**¡Éxito con tu implementación!** 🎯
