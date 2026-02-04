# 🔴 Solución al Error CORS con Google Apps Script

## 🔍 Problema Identificado

```
Access to fetch at 'https://script.google.com/a/macros/hospitaldelmovil.com.mx/...'
from origin 'http://localhost:8080' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Causa:** El Web App de Google Apps Script NO está devolviendo los headers CORS necesarios.

---

## ✅ Solución: Re-implementar el Web App

### PASO 1: Abrir Google Apps Script

1. Abre tu Google Sheet:
   ```
   https://docs.google.com/spreadsheets/d/1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI/edit
   ```

2. Ve a: **Extensiones → Apps Script**

---

### PASO 2: Verificar el Código

Asegúrate de que el archivo `google-apps-script.gs` tenga **EXACTAMENTE** este código al inicio:

```javascript
// Función que maneja las peticiones GET
function doGet(e) {
  const action = e.parameter.action || 'test';

  let result;

  if (action === 'test') {
    result = {
      success: true,
      message: 'Conexión exitosa con Google Apps Script',
      timestamp: new Date().toISOString(),
      version: '3.0.0'
    };
  } else {
    result = {
      success: false,
      message: 'Acción no reconocida para GET: ' + action
    };
  }

  // IMPORTANTE: Configurar headers CORS
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Función que maneja las peticiones POST
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    let result;

    switch (action) {
      case 'test':
        result = {
          success: true,
          message: 'POST exitoso',
          timestamp: new Date().toISOString()
        };
        break;

      case 'saveCotizacion':
        result = guardarCotizacion(params.data);
        break;

      case 'saveReferencia':
        result = guardarReferencia(params.data);
        break;

      case 'saveResponse':
        result = guardarRespuesta(params.data);
        break;

      case 'getCotizaciones':
        result = obtenerCotizaciones(params.filters);
        break;

      case 'updateEstado':
        result = actualizarEstado(params.folio, params.estado);
        break;

      case 'getUltimaCotizacion':
        result = obtenerUltimaCotizacion();
        break;

      case 'saveBusqueda':
        result = guardarBusqueda(params.data);
        break;

      default:
        result = {
          success: false,
          message: 'Acción no reconocida: ' + action
        };
    }

    // IMPORTANTE: Configurar headers CORS
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error en doPost: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

**Guardar** (Ctrl+S)

---

### PASO 3: Implementar como Web App (CRÍTICO)

#### Opción A: Nueva Implementación (Recomendado)

1. Click en **Implementar** (arriba a la derecha)
2. Click en **Nueva implementación**
3. Seleccionar:
   - **Tipo:** Aplicación web
   - **Descripción:** CotizadorAPI v3.0
   - **Ejecutar como:** Yo (tu_email@hospitaldelmovil.com.mx)
   - **Quién tiene acceso:** **⚠️ IMPORTANTE: Selecciona "Cualquier usuario"**
4. Click **Implementar**
5. **Autorizar permisos** (si te lo pide)
6. **Copiar la URL completa** que te da

#### Opción B: Administrar Implementaciones (Si ya existe)

1. Click en **Implementar** → **Administrar implementaciones**
2. En la implementación existente, click en el ícono de **lápiz** (editar)
3. En **Versión**, seleccionar: **Nueva versión**
4. En **Quién tiene acceso**, asegúrate de que diga: **Cualquier usuario**
5. Click **Implementar**
6. **Copiar la URL actualizada**

---

### PASO 4: ¿Por qué falla CORS?

#### ❌ Configuración INCORRECTA:
- **Quién tiene acceso:** Solo usuarios de mi organización
- **Resultado:** CORS bloqueado ❌

#### ✅ Configuración CORRECTA:
- **Quién tiene acceso:** Cualquier usuario
- **Resultado:** CORS permitido ✅

---

### PASO 5: Actualizar la URL en el Frontend

#### Opción A: Usando la interfaz web

1. Abre: http://localhost:8080/sistema-cotizador-avanzado.html
2. En el campo amarillo de configuración, **pega la nueva URL**
3. Click en **"💾 Guardar URL y Cargar Última Cotización"**

#### Opción B: Usando el archivo de test

1. Abre el archivo: `test-google-sheets-api.html`
2. En la línea 89, actualiza el valor de `API_URL` con tu nueva URL
3. Guarda el archivo
4. Abre: http://localhost:8080/test-google-sheets-api.html
5. Click en **"🔌 Probar Conexión (GET)"**

---

## 🧪 Verificar que Funciona

### Test 1: Prueba GET directa en el navegador

Pega esta URL en tu navegador (reemplaza con tu URL):
```
https://script.google.com/a/macros/hospitaldelmovil.com.mx/s/TU_ID_AQUI/exec?action=test
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Conexión exitosa con Google Apps Script",
  "timestamp": "2025-11-02T...",
  "version": "3.0.0"
}
```

### Test 2: Desde el archivo de test

1. Abre: http://localhost:8080/test-google-sheets-api.html
2. Click **"🔌 Probar Conexión (GET)"**
3. Deberías ver un cuadro **VERDE** con mensaje de éxito

### Test 3: Obtener última cotización

1. En el mismo archivo de test
2. Click **"📊 Obtener Última Cotización (POST)"**
3. Deberías ver los datos del último registro

---

## 📋 Checklist de Verificación

Antes de probar, confirma:

- [ ] El código en Apps Script tiene las funciones `doGet()` y `doPost()`
- [ ] El código retorna `ContentService.createTextOutput(...)`
- [ ] La implementación está configurada como **"Cualquier usuario"**
- [ ] Tienes una **nueva versión** implementada (no la versión vieja)
- [ ] Has **copiado la URL completa** de la implementación
- [ ] La URL en el frontend está actualizada
- [ ] Estás accediendo vía http://localhost:8080 (NO file://)

---

## 🆘 Troubleshooting

### Error: "Script function not found: doGet"
**Solución:** El nombre de la función debe ser exactamente `doGet` (con G mayúscula)

### Error: "Authorization required"
**Solución:**
1. Ve a Implementar → Administrar implementaciones
2. Edita la implementación
3. Autoriza de nuevo los permisos

### Error: "The script completed but did not return anything"
**Solución:** Verifica que estés retornando `ContentService.createTextOutput(...)`

### Error: Sigue mostrando CORS
**Solución:**
1. **Asegúrate de crear una NUEVA implementación** (no editar la vieja)
2. Usa la nueva URL generada
3. Espera 1-2 minutos para que se propague el cambio
4. Limpia la caché del navegador (Ctrl+Shift+Del)

---

## 📝 URLs de Referencia

**Google Sheet:**
https://docs.google.com/spreadsheets/d/1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI/edit

**Apps Script:**
Extensiones → Apps Script (desde el Sheet)

**Test Local:**
http://localhost:8080/test-google-sheets-api.html

**Sistema Completo:**
http://localhost:8080/sistema-cotizador-avanzado.html

---

## ✅ Próximo Paso

Una vez que tengas la nueva URL:
1. Pégala en el campo amarillo de configuración
2. Guarda
3. El sistema debería cargar automáticamente

Si todo funciona verás:
- ✅ Notificación verde: "Datos cargados desde Google Sheets"
- Las 3 tarjetas con información real
- Tabla con 40 resultados simulados
- Gráfica de dispersión

---

**Última actualización:** 2 de Noviembre, 2025
**Archivo de código:** google-apps-script.gs
