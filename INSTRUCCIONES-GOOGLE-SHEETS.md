# 📋 Instrucciones para Integrar Google Sheets

## Spreadsheet ID Configurado
✅ **ID:** `1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI`

---

## 🔧 PASO 1: Implementar el Google Apps Script

### 1.1 Abrir el Script Editor

1. Abre tu Google Sheet: https://docs.google.com/spreadsheets/d/1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI/edit
2. Ve a **Extensiones → Apps Script**
3. Borra todo el código predeterminado

### 1.2 Copiar el código actualizado

1. Abre el archivo `google-apps-script.gs` en tu proyecto local
2. Copia **TODO** el contenido
3. Pégalo en el editor de Apps Script
4. **Guarda** el proyecto (Ctrl+S)
   - Nombre sugerido: "CotizadorAPI"

### 1.3 Implementar como Web App

1. Click en **Implementar → Nueva implementación**
2. Configurar:
   - **Tipo**: Aplicación web
   - **Ejecutar como**: Yo (tu_email@gmail.com)
   - **Quién tiene acceso**: Cualquier usuario
3. Click **Implementar**
4. **Autorizar permisos** (Google te pedirá autorización)
5. **Copiar la URL** generada (algo como):
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

---

## 📊 PASO 2: Crear las Pestañas en Google Sheets

Tu Google Sheet debe tener estas pestañas:

### Pestañas Requeridas:

1. **Cotizaciones** (ya existe probablemente)
   - Debe tener encabezados: Folio, Fecha, Cliente, Email, Teléfono, Dispositivo, Marca, Modelo, Refacción...

2. **Referencias Base** (crear si no existe)
   - Se creará automáticamente por el script

3. **Respuestas Clientes** (crear si no existe)
   - Se creará automáticamente

4. **Log de Actividad** (crear si no existe)
   - Se creará automáticamente

5. **Búsquedas** (NUEVA - crear manualmente o dejar que el script la cree)
   - Para almacenar resultados de búsquedas

### Verificar estructura de "Cotizaciones":

La pestaña "Cotizaciones" debe tener estos encabezados en la fila 1:

| Folio | Fecha | Cliente | Email | Teléfono | Dispositivo | Marca | Modelo | Refacción | ... |
|-------|-------|---------|-------|----------|-------------|-------|--------|-----------|-----|

---

## 🔗 PASO 3: Configurar la URL en el Frontend

### 3.1 Ubicar el campo de configuración

En el archivo HTML, hay un campo amarillo en la parte superior para pegar la URL del Web App.

### 3.2 Pegar la URL

1. Abre el archivo `sistema-cotizador-hibrido-3.0.html`
2. Busca el campo con id `sheetsApiUrl`
3. Pega la URL de tu Web App
4. La URL se guardará automáticamente en `localStorage`

---

## 📝 PASO 4: Probar la Conexión

### 4.1 Desde el Navegador

1. Abre el archivo HTML
2. Abre la consola del navegador (F12 → Console)
3. Ejecuta este comando:
   ```javascript
   fetch('TU_URL_AQUI?action=test')
     .then(r => r.json())
     .then(data => console.log(data))
   ```

Deberías ver:
```json
{
  "success": true,
  "message": "Conexión exitosa con Google Apps Script",
  "timestamp": "2025-11-01T...",
  "version": "3.0.0"
}
```

### 4.2 Probar lectura de última cotización

```javascript
const url = 'TU_URL_AQUI';

fetch(url, {
  method: 'POST',
  mode: 'no-cors',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    action: 'getUltimaCotizacion'
  })
})
.then(() => console.log('Solicitud enviada'))
.catch(err => console.error('Error:', err));
```

---

## 🔍 PASO 5: Funcionalidades Implementadas

El Google Apps Script ahora tiene estas funciones:

### ✅ Funciones Existentes:
- `saveCotizacion` - Guardar cotización
- `saveReferencia` - Guardar referencia de precio
- `saveResponse` - Guardar respuesta de cliente
- `getCotizaciones` - Obtener lista de cotizaciones
- `updateEstado` - Actualizar estado de cotización

### ✅ Funciones NUEVAS:
- `getUltimaCotizacion` - Obtener último registro de pestaña "Cotizaciones"
- `saveBusqueda` - Guardar resultados de búsqueda

---

## 🎯 PASO 6: Flujo de Trabajo

### Cómo funciona ahora:

1. **Usuario abre la aplicación HTML**
   - La app carga automáticamente
   - Hace una petición a Google Sheets vía Apps Script
   - Obtiene los datos del ÚLTIMO registro de "Cotizaciones"

2. **Se auto-completa el formulario**
   - Marca: del último registro
   - Modelo: del último registro
   - Refacción: del último registro

3. **Se ejecutan 3 búsquedas automáticas:**
   - **Búsqueda 1:** Pieza de repuesto (con variantes)
   - **Búsqueda 2:** Dispositivo usado en excelente estado
   - **Búsqueda 3:** Dispositivo nuevo

4. **Se muestran 3 tarjetas:**
   - **Tarjeta AZUL:** Dispositivos Nuevos
     - Título: [Marca] [Modelo] Nuevo
     - Precio mínimo, promedio, máximo
     - % comparativo vs pieza

   - **Tarjeta VERDE:** Dispositivos Usados
     - Título: [Marca] [Modelo] Usado - Excelente Estado
     - Precio mínimo, promedio, máximo
     - % comparativo vs pieza

   - **Tarjeta BLANCA:** Piezas de Repuesto
     - Título: [Tipo de Pieza] para [Marca] [Modelo]
     - Precios: Mínimo, Promedio, 3/4, Máximo
     - Menor tiempo de entrega

5. **Tabla de resultados detallada:**
   - Checkbox para selección
   - Plataforma
   - Precio de compra
   - Costo de envío a CP 03023
   - Impuestos (venta/importación)
   - Calificación vendedor
   - Tiempo de entrega
   - URL de compra
   - Filtros y sorting

6. **Gráfica de dispersión:**
   - Eje X: Tiempo de entrega (días)
   - Eje Y: Costo total (precio + envío + impuestos)
   - Colores por plataforma
   - Tooltip al pasar el mouse

7. **Los resultados se guardan en Google Sheets:**
   - Pestaña "Búsquedas"
   - Con todos los detalles de cada opción encontrada

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### Datos Simulados vs Reales

**Actualmente el sistema usa datos SIMULADOS porque:**
- Las APIs reales de Amazon, eBay requieren credenciales
- El costo de envío a CP específico requiere API de shipping
- Los impuestos requieren cálculos por región

**Opciones:**

1. **Continuar con datos simulados** (más rápido)
   - Buenos para pruebas
   - Realistas
   - No requieren APIs

2. **Implementar APIs reales** (más complejo)
   - Requiere credenciales de Amazon Product API
   - Requiere credenciales de eBay Developer
   - Requiere API de cálculo de shipping
   - Requiere API de cálculo de impuestos

### Estructura de Datos Simulados

Los datos simulados generan:
- 15-20 resultados por búsqueda
- Precios realistas según tipo de producto
- Tiempos de entrega variables (1-30 días)
- Costos de envío calculados por distancia simulada
- Impuestos según plataforma (0-16%)
- Calificaciones de vendedor (3.5-5.0)

---

## 📌 PRÓXIMOS PASOS

### Opción A: Mantener datos simulados (Recomendado para MVP)

1. Implementar el Google Apps Script
2. Configurar la URL en el frontend
3. El sistema funcionará automáticamente
4. Probarlo con el último registro de tu Sheet

### Opción B: Conectar APIs reales

1. Obtener credenciales de Amazon Product API
2. Obtener credenciales de eBay API
3. Configurar API de shipping (ej: ShipEngine, EasyPost)
4. Implementar cálculo de impuestos por región
5. Actualizar backend para usar APIs reales

---

## 🆘 Troubleshooting

### Error: "Script no autorizado"
**Solución:** Vuelve a implementar el Web App y autoriza los permisos

### Error: "CORS"
**Solución:** Usa `mode: 'no-cors'` en el fetch (ya configurado)

### Error: "No se encuentra la hoja"
**Solución:** Verifica que la pestaña "Cotizaciones" existe y tiene datos

### Los datos no se cargan
**Solución:**
1. Verifica la URL del Web App
2. Revisa la consola del navegador (F12)
3. Revisa el log de Apps Script (View → Logs)

---

## ✅ Checklist de Implementación

- [ ] Apps Script copiado y guardado
- [ ] Web App implementado y autorizado
- [ ] URL del Web App copiada
- [ ] Pestañas en Google Sheets creadas
- [ ] URL configurada en el frontend
- [ ] Conexión probada (fetch de prueba)
- [ ] Última cotización se lee correctamente
- [ ] Sistema funcionando

---

**¿Listo para continuar? El siguiente paso es implementar el frontend mejorado con las 3 tarjetas y la gráfica de dispersión.**
