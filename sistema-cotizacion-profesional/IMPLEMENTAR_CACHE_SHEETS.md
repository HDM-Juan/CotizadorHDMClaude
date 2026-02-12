# IMPLEMENTACIÓN DE CACHÉ EN GOOGLE SHEETS

## ✅ Archivos creados:

1. `scripts/google-apps-script-cache-equipos.gs` - Funciones de caché para Apps Script
2. `scripts/cache_equipos_sheets.py` - Cliente Python para acceder al caché

## 📋 Pasos para implementar:

### 1. Crear la pestaña de caché en Google Sheets

**Desde Apps Script:**
1. Abre Google Sheets
2. `Extensiones` → `Apps Script`
3. Copia el contenido de `google-apps-script-cache-equipos.gs`
4. Pégalo en un nuevo archivo en Apps Script
5. Ejecuta la función `testCache()`
6. Esto creará la pestaña "Cache_Equipos" con datos de prueba

### 2. Agregar funciones de caché al Web App

Agrega estas funciones al archivo `google-apps-script-webapp.gs`:

```javascript
// En la función doGet(), agregar estos casos:
case 'obtenerCache':
  response = obtenerCacheEquipo(params.modelo, params.condicion);
  break;
case 'listarCache':
  response = listarCache();
  break;
```

```javascript
// En la función doPost(), agregar:
case 'guardarCache':
  response = guardarCacheEquipo(body.modelo, body.condicion, body.estadisticas);
  break;
case 'invalidarCache':
  response = invalidarCacheEquipo(body.modelo, body.condicion);
  break;
```

### 3. Actualizar comparador Python

En `comparador_serpapi_cli.py`, cambiar:

```python
# ANTES:
from cache_equipos import CacheEquipos

# DESPUÉS:
from cache_equipos_sheets import CacheEquiposSheets

# En __init__:
self.cache = CacheEquiposSheets(WEB_APP_URL)
```

## 📊 Estructura de la pestaña Cache_Equipos:

```
| A              | B         | C              | D                | E             | F        | G                | H                  | I               |
|----------------|-----------|----------------|------------------|---------------|----------|------------------|--------------------|-----------------|
| Modelo         | Condicion | Precio_Minimo  | Precio_Promedio  | Precio_Maximo | Cantidad | Fecha_Creacion   | Fecha_Expiracion   | Dias_Restantes  |
| Samsung S22    | nuevo     | 12000          | 15000            | 18000         | 15       | 2026-02-12       | 2026-03-14         | 30              |
| Samsung S22    | usado     | 8000           | 10000            | 12000         | 12       | 2026-02-12       | 2026-03-14         | 30              |
```

## ✅ Ventajas vs archivo JSON local:

- ✅ Centralizado y accesible desde cualquier lugar
- ✅ No requiere archivos locales
- ✅ Visible y administrable desde Google Sheets
- ✅ Más confiable y persistente
- ✅ Fácil de limpiar manualmente
- ✅ Se puede compartir con el equipo

## 🔄 Flujo de funcionamiento:

1. **Backend pide caché** → Python llama Web App
2. **Web App busca en Sheet** → Encuentra/No encuentra
3. **Si no hay caché:**
   - Python busca en SerpAPI
   - Calcula estadísticas
   - Guarda en Sheet via Web App
4. **Si hay caché:**
   - Retorna estadísticas directamente
   - 0 búsquedas en SerpAPI

## 🧪 Para probar:

1. Ejecutar `testCache()` en Apps Script
2. Verificar que aparece pestaña "Cache_Equipos"
3. Ver datos de prueba en la pestaña
4. Ejecutar una búsqueda desde AppSheet
5. Verificar que se guardó en la pestaña
