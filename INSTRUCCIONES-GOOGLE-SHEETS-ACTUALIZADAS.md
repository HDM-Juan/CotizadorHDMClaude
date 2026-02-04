# 📋 Instrucciones Actualizadas - Google Sheets Integration

**Fecha:** 2 de Noviembre, 2025
**Nueva URL:** `https://script.google.com/macros/s/AKfycbykah5el6qOX9IGOW9NS7EleuEgHV-Pi6hMsaRmO3WmxjbdPxkhhTWe0jlmCKNc-XCX5Q/exec`

---

## ✅ Cambios Realizados

### 1. URL Actualizada en el HTML
- ✅ Nueva URL configurada en `sistema-cotizador-avanzado.html`
- ✅ Código mejorado con `redirect: 'follow'` para manejar redirects automáticamente
- ✅ Timeout aumentado a 15 segundos
- ✅ Mejor manejo de errores

### 2. Nueva Funcionalidad: Botón de Prueba
- **Botón:** 🔌 Probar Conexión
- **Función:** Verifica que el Web App esté funcionando antes de cargar datos
- **Ubicación:** En la sección de configuración (amarillo)

### 3. Indicador de Estado Visual
- **Verde:** Conexión exitosa ✅
- **Rojo:** Error de conexión ❌
- **Azul:** Probando conexión 🔄

---

## 🔧 Verificación del Web App

### Paso 1: Probar desde el navegador

**Prueba GET (Simple):**
```
https://script.google.com/macros/s/AKfycbykah5el6qOX9IGOW9NS7EleuEgHV-Pi6hMsaRmO3WmxjbdPxkhhTWe0jlmCKNc-XCX5Q/exec?action=test
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Conexión exitosa con Google Apps Script",
  "timestamp": "2025-11-03T00:46:32.340Z",
  "version": "3.0.0"
}
```

### Paso 2: Verificar en la interfaz

1. Abre `sistema-cotizador-avanzado.html`
2. Click en **🔌 Probar Conexión**
3. Debes ver:
   - ✅ Conexión exitosa
   - 📡 Versión: 3.0.0
   - 🕐 Timestamp actual
   - 📍 URL final del redirect

---

## 📊 Preparar Datos en Google Sheets

### Opción A: Crear datos manualmente

1. **Abre tu Google Sheet:**
   - ID: `1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI`
   - URL: `https://docs.google.com/spreadsheets/d/1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI/edit`

2. **Crear pestaña "Cotizaciones"** si no existe

3. **Agregar encabezados (Fila 1):**
   ```
   | Folio | Fecha | Cliente | Email | Teléfono | Dispositivo | Marca | Modelo | Refacción | Num Variantes | Precio Refacción | Mano de Obra | Utilidad % | Precio Final | Notas | Vencimiento | Estado | Fecha Actualización |
   ```

4. **Agregar datos de ejemplo (Fila 2):**
   ```
   | HDM-2024-001 | 2024-11-02 | Juan Pérez | juan@ejemplo.com | 55-1234-5678 | Smartphone | Apple | iPhone 13 | Pantalla OLED | 1 | 2500 | 300 | 20 | 3360 | Urgente | 2024-11-15 | Pendiente | 2024-11-02 |
   ```

### Opción B: Usar función de prueba en Google Apps Script

1. **Abre el Google Apps Script**
2. **Busca la función:** `testGuardarCotizacion()`
3. **Ejecuta la función:**
   - Click en el nombre de la función
   - Click en ▶️ Ejecutar
4. **Autoriza los permisos** si es la primera vez
5. **Verifica** que se creó la fila en la pestaña "Cotizaciones"

---

## 🎯 Usar el Sistema Avanzado

### Flujo Completo

1. **Abrir sistema:**
   ```
   c:\Users\JUAN ANTONIO\CotizadorClaude\sistema-cotizador-avanzado.html
   ```

2. **Probar conexión:**
   - Click en 🔌 Probar Conexión
   - Verificar que aparezca ✅ Conexión exitosa

3. **Cargar datos:**
   - Click en 💾 Guardar URL y Cargar Última Cotización
   - Debe cargar los datos de la última fila de Google Sheets

4. **Ver resultados:**
   - Se ejecutan automáticamente 3 búsquedas:
     - 🔧 Pieza de repuesto (20 resultados)
     - 📱 Dispositivo usado (10 resultados)
     - 📱 Dispositivo nuevo (10 resultados)
   - Se muestran:
     - 📊 3 Tarjetas de resumen
     - 📋 Tabla con 40 resultados
     - 📈 Gráfica de dispersión

---

## 🐛 Solución de Problemas

### Error: "No hay cotizaciones registradas"

**Causa:** La pestaña "Cotizaciones" está vacía o no existe.

**Solución:**
1. Verifica que exista la pestaña "Cotizaciones"
2. Verifica que haya al menos 2 filas (headers + 1 dato)
3. Ejecuta `testGuardarCotizacion()` en Apps Script

### Error: "Failed to fetch"

**Causa:** URL incorrecta o permisos no configurados.

**Solución:**
1. Verifica que la URL sea exactamente:
   ```
   https://script.google.com/macros/s/AKfycbykah5el6qOX9IGOW9NS7EleuEgHV-Pi6hMsaRmO3WmxjbdPxkhhTWe0jlmCKNc-XCX5Q/exec
   ```
2. En Google Apps Script → Implementar → Administrar implementaciones
3. Verifica que "Ejecutar como" = "Yo"
4. Verifica que "Quién tiene acceso" = "Cualquiera" o "Usuarios de tu organización"

### Error: "Timeout"

**Causa:** La respuesta tarda más de 15 segundos.

**Solución:**
1. Verifica tu conexión a Internet
2. Intenta de nuevo (puede ser lentitud temporal)
3. Si persiste, verifica que el Script no tenga errores

### Error CORS (en consola del navegador)

**Causa:** Google Apps Script maneja CORS automáticamente, pero puede haber configuración incorrecta.

**Solución:**
1. Asegúrate de usar `redirect: 'follow'` en el fetch (ya está configurado)
2. Verifica que uses el método correcto (GET para test, POST para datos)
3. No modifiques los headers en el Apps Script

---

## 📝 Estructura de Datos Esperada

### Pestaña "Cotizaciones"

```javascript
{
  Folio: 'HDM-2024-001',
  Fecha: '2024-11-02',
  Cliente: 'Juan Pérez',
  Email: 'juan@ejemplo.com',
  Teléfono: '55-1234-5678',
  Dispositivo: 'Smartphone',
  Marca: 'Apple',
  Modelo: 'iPhone 13',
  Refacción: 'Pantalla OLED',
  'Num Variantes': 1,
  'Precio Refacción': 2500,
  'Mano de Obra': 300,
  'Utilidad %': 20,
  'Precio Final': 3360,
  Notas: 'Urgente',
  Vencimiento: '2024-11-15',
  Estado: 'Pendiente',
  'Fecha Actualización': '2024-11-02'
}
```

### Respuesta de `getUltimaCotizacion()`

```javascript
{
  success: true,
  data: {
    folio: 'HDM-2024-001',
    marca: 'Apple',
    modelo: 'iPhone 13',
    refaccion: 'Pantalla OLED',
    dispositivo: 'Smartphone',
    cliente: 'Juan Pérez',
    telefono: '55-1234-5678',
    email: 'juan@ejemplo.com'
  }
}
```

---

## ✅ Checklist de Configuración

- [x] Google Apps Script desplegado como Web App
- [x] URL actualizada en `sistema-cotizador-avanzado.html`
- [x] Código mejorado con `redirect: 'follow'`
- [x] Botón de prueba de conexión agregado
- [ ] **Pendiente:** Agregar datos de prueba en Google Sheets
- [ ] **Pendiente:** Probar botón "🔌 Probar Conexión"
- [ ] **Pendiente:** Cargar última cotización desde Sheets
- [ ] **Pendiente:** Verificar que se ejecuten las 3 búsquedas

---

## 🚀 Próximos Pasos

### 1. Agregar datos de prueba (Ahora)
```
Ve a Google Sheets → Crea pestaña "Cotizaciones" → Agrega los datos de ejemplo
```

### 2. Probar conexión (1 minuto)
```
Abre sistema-cotizador-avanzado.html → Click en "🔌 Probar Conexión"
```

### 3. Cargar última cotización (1 minuto)
```
Click en "💾 Guardar URL y Cargar Última Cotización"
```

### 4. Verificar resultados (2 minutos)
```
Verificar que se muestren:
- Tarjetas de resumen
- Tabla con resultados
- Gráfica de dispersión
```

---

## 📞 Soporte

Si encuentras errores:

1. **Abre la consola del navegador** (F12)
2. **Pestaña Console** - busca errores en rojo
3. **Pestaña Network** - verifica las peticiones HTTP
4. **Copia el mensaje de error** para diagnosticar

---

**¡El sistema está listo para funcionar!** Solo falta agregar datos en Google Sheets. 🎉

---

**Última actualización:** 2 de Noviembre, 2025
**Versión:** 3.0.1 (URLs actualizadas)
**Estado:** ✅ CONFIGURADO - Listo para pruebas
