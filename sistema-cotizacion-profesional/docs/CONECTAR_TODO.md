# 🔗 CONECTAR TODO EL SISTEMA

## 📋 RESUMEN DE COMPONENTES

Tienes **3 componentes** en **2 ubicaciones**:

### Ubicación 1: `C:\CotizadorClaude\` (Python + Backend Node.js)
- ✅ Script Python con SerpAPI (`comparador_serpapi_cli.py`)
- ✅ Backend Node.js (`backend-serpapi-bridge.js`)
- ✅ Google Apps Script (`google-apps-script-serpapi.gs`)

### Ubicación 2: `C:\Users\JUAN ANTONIO\CotizadorClaude\` (Frontend)
- ✅ Frontend HTML (`sistema-cotizador-avanzado.html`)
- ✅ Frontend standalone (`sistema-cotizador-hibrido-3.0.html`)

---

## 🎯 OBJETIVO

Conectar el frontend existente para que:
1. Lea datos de la pestaña "Búsqueda" de Google Sheets
2. Muestre hallazgos de la pestaña "Hallazgos"
3. Genere gráficas con datos REALES de SerpAPI

---

## 🚀 PASOS PARA CONECTAR TODO

### Paso 1: Desplegar Google Apps Script

1. Ve a tu Google Sheet
2. Extensiones → Apps Script
3. Copia el código de `C:\CotizadorClaude\google-apps-script-serpapi.gs`
4. Guarda
5. **Implementar → Nueva implementación → Aplicación web**
6. Configurar:
   - Ejecutar como: Yo
   - Quién tiene acceso: **Cualquier usuario**
7. Click **Implementar**
8. **COPIAR LA URL DEL WEB APP** que te den

Ejemplo de URL:
```
https://script.google.com/macros/s/AKfycbzXXXXXXXXXXXXXXXX/exec
```

---

### Paso 2: Actualizar URL en el Frontend

1. Abre el archivo:
   ```
   C:\Users\JUAN ANTONIO\CotizadorClaude\sistema-cotizador-avanzado.html
   ```

2. Busca la línea **712** (aproximadamente):
   ```html
   <input type="text" id="apiUrl"
       value="https://script.google.com/macros/s/AKfycbz-VIEJA-URL/exec"
   ```

3. Reemplaza con tu nueva URL del Web App que copiaste en el Paso 1

4. Guarda el archivo

---

### Paso 3: Iniciar Backend Node.js

Abre una terminal en `C:\CotizadorClaude`:

```bash
cd C:\CotizadorClaude
npm install
npm start
```

Debe mostrar:
```
🚀 BACKEND SERPAPI BRIDGE - INICIADO
✅ Servidor corriendo en http://localhost:3000
```

**⚠️ IMPORTANTE:** Si usas Apps Script, necesitas **ngrok** porque Apps Script no puede conectarse a `localhost`:

```bash
# Instalar ngrok: https://ngrok.com/download

# En otra terminal:
ngrok http 3000
```

Ngrok te dará una URL como:
```
https://abc123.ngrok.io
```

Copia esa URL y actualiza en Google Apps Script (línea 13):
```javascript
const BACKEND_URL = 'https://abc123.ngrok.io';
```

---

### Paso 4: Configurar Trigger en Apps Script

1. En Google Apps Script
2. Click en ⏰ (Triggers/Activadores)
3. **+ Agregar activador**
4. Configurar:
   - Función: `onChange`
   - Tipo de evento: `Al cambiar`
5. Guardar y autorizar permisos

---

### Paso 5: Crear Pestaña "Búsqueda"

En Google Apps Script:
1. Selecciona función `crearPestanaBusqueda`
2. Click **▶️ Ejecutar**
3. Verifica en Google Sheet que se creó la pestaña

---

### Paso 6: Probar Flujo Completo

#### Test A: Búsqueda Automática

1. Ve a Google Sheet → Pestaña "Búsqueda"
2. Edita la última fila (cambia el modelo o la pieza)
3. Espera 5-10 segundos
4. Ve a Apps Script → Ver → Registros de ejecución
5. Deberías ver logs de la búsqueda
6. Ve a la pestaña "Hallazgos" - deberían aparecer resultados

#### Test B: Abrir Frontend

1. Abre el archivo:
   ```
   C:\Users\JUAN ANTONIO\CotizadorClaude\sistema-cotizador-avanzado.html
   ```

2. Click en botón **"🔌 Probar Conexión"**
   - Debe mostrar: ✅ Conexión exitosa

3. Click en **"💾 Guardar URL y Cargar Última Cotización"**
   - Debe cargar los datos de la última búsqueda
   - Debe mostrar las 3 tarjetas con estadísticas
   - Debe mostrar tabla con hallazgos
   - Debe mostrar gráfica

---

## 🎨 ESTRUCTURA DE DATOS

### Pestaña "Búsqueda" (Input - desde AppSheet)
```
| ID_Cotizador | Timestamp | Usuario | Dispositivo | Marca | Modelo | Color | Variante1 | Variante2 | Pieza | ... |
```

### Pestaña "Hallazgos" (Output - generado por Apps Script)
```
| ID_Hallazgo | ID_Búsqueda | Tipo | Plataforma | Título | Precio | Moneda | Envío Gratis | ... |
```

El frontend lee ambas pestañas:
- **Búsqueda**: Para mostrar qué se buscó
- **Hallazgos**: Para generar gráficas y análisis

---

## 🔧 FUNCIONES DEL FRONTEND

El frontend ya tiene implementadas estas funciones:

### `cargarUltimaBusqueda()`
- Lee la última fila de la pestaña "Búsqueda"
- Muestra los datos del producto buscado

### `cargarHallazgos(id_busqueda)`
- Lee hallazgos filtrados por ID
- Genera tabla de resultados

### `generarGraficas(hallazgos)`
- Crea gráfica de dispersión (Precio vs Tiempo)
- Colores por plataforma

### `calcularEstadisticas(hallazgos)`
- Calcula mínimo, promedio, máximo
- Separa por tipo (Pieza, Nuevo, Usado)

---

## 📊 FLUJO COMPLETO END-TO-END

```
1. Usuario llena formulario en AppSheet
   - Marca: Samsung
   - Modelo: Galaxy S22
   - Pieza: Pantalla OLED
   ↓

2. AppSheet guarda en Google Sheets → "Búsqueda"
   - Nueva fila agregada
   ↓

3. Apps Script detecta cambio (trigger onChange)
   - Lee última fila
   ↓

4. Apps Script llama Backend Node.js
   - POST http://localhost:3000/api/buscar-serpapi
   - (o https://abc123.ngrok.io/api/buscar-serpapi)
   ↓

5. Backend ejecuta Python
   - python comparador_serpapi_cli.py \
       --query-pieza "Pantalla OLED Samsung Galaxy S22" \
       --query-modelo "Samsung Galaxy S22" \
       --output-json
   ↓

6. Python busca en SerpAPI
   - Google Shopping (5-20 resultados)
   - Amazon MX (5-20 resultados)
   - Walmart MX (5-20 resultados)
   - eBay (5-20 resultados)
   - Equipos nuevos (usa caché si existe)
   - Equipos usados (usa caché si existe)
   ↓

7. Python devuelve JSON
   - piezas: [ {...}, {...}, ... ]
   - equipos_nuevos: [ {...}, {...}, ... ]
   - equipos_usados: [ {...}, {...}, ... ]
   - estadisticas: { ... }
   ↓

8. Backend devuelve JSON a Apps Script
   ↓

9. Apps Script guarda en "Hallazgos"
   - ID_Hallazgo: "TEST_123-P1", "TEST_123-P2", etc.
   - Tipo: "Pieza", "Equipo Nuevo", "Equipo Usado"
   - Todos los datos de cada resultado
   ↓

10. Usuario abre Frontend HTML
    ↓

11. Frontend llama Apps Script Web App
    - getUltimaBusqueda() → Obtiene datos de "Búsqueda"
    - getHallazgos(id) → Obtiene datos de "Hallazgos"
    ↓

12. Frontend muestra:
    - ✅ Datos de la búsqueda
    - ✅ 3 tarjetas con estadísticas
    - ✅ Tabla con todos los hallazgos
    - ✅ Gráfica de dispersión
    - ✅ Filtros por plataforma
```

---

## ⚠️ PUNTOS CRÍTICOS

### 1. Apps Script NO puede conectarse a localhost

**Solución:** Usar ngrok

```bash
ngrok http 3000
# Te da: https://abc123.ngrok.io

# Actualizar en Apps Script:
const BACKEND_URL = 'https://abc123.ngrok.io';
```

### 2. URL del Web App cambia al re-desplegar

Cada vez que hagas cambios en Apps Script:
1. Implementar → Administrar implementaciones
2. Editar → Nueva versión
3. La URL se mantiene (no cambia)

Si cambias permisos, sí genera nueva URL.

### 3. Triggers pueden tardar

El trigger `onChange` puede tardar 30-60 segundos en ejecutarse.

Para testing inmediato, usa `onEdit` o la función manual `procesarUltimaBusquedaManual()`.

---

## ✅ CHECKLIST FINAL

Antes de que todo funcione, verifica:

**Backend:**
- [ ] Backend Node.js corriendo (`npm start`)
- [ ] Ngrok corriendo si usas Apps Script
- [ ] Test de backend pasa (`npm test`)

**Apps Script:**
- [ ] Código copiado y guardado
- [ ] BACKEND_URL actualizado con URL de ngrok
- [ ] Web App desplegado (URL copiada)
- [ ] Trigger configurado
- [ ] Pestaña "Búsqueda" creada con datos de prueba

**Frontend:**
- [ ] URL del Web App actualizada en línea 712
- [ ] Archivo abierto en navegador
- [ ] Botón "Probar Conexión" funciona
- [ ] Carga datos correctamente

---

## 🧪 ORDEN DE TESTING

1. ✅ Backend Node.js local (sin ngrok)
   ```bash
   npm test
   ```

2. ✅ Backend con ngrok
   ```bash
   ngrok http 3000
   # Probar: https://abc123.ngrok.io/health
   ```

3. ✅ Apps Script manual
   ```javascript
   // Ejecutar: procesarUltimaBusquedaManual()
   ```

4. ✅ Apps Script automático
   ```
   // Editar celda en "Búsqueda"
   // Ver logs en Apps Script
   ```

5. ✅ Frontend lee datos
   ```
   // Abrir HTML
   // Click "Probar Conexión"
   // Click "Cargar Última Cotización"
   ```

---

## 📞 SIGUIENTE PASO

Una vez que todo funcione:

**✅ Búsquedas automáticas desde AppSheet**
**✅ Hallazgos guardados en Google Sheets**
**✅ Frontend mostrando gráficas**

**⏭️ SIGUIENTE:** Mejorar el frontend o conectar AppSheet

---

**Archivo:** `CONECTAR_TODO.md`
**Fecha:** 2026-02-04
**Estado:** Arquitectura completa lista para integración
