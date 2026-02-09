# 🌐 Configurar Google Apps Script Web App

## ✅ Solución Simple - Sin API Key

En lugar de usar API key de Google Sheets (complejo y con límites), vamos a usar **Google Apps Script Web App** que expone los datos de forma segura.

---

## 📋 Pasos de Configuración (10 minutos)

### Paso 1: Abrir Apps Script

1. Abrir tu Google Sheet:
   ```
   https://docs.google.com/spreadsheets/d/1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI/edit
   ```

2. Ir a: **Extensiones** → **Apps Script**

---

### Paso 2: Crear Nuevo Archivo

1. En Apps Script, click en **+** (junto a "Archivos")
2. Seleccionar: **Script**
3. Nombre: `WebApp`

---

### Paso 3: Copiar Código

1. Abrir archivo: `sistema-cotizacion-profesional/scripts/google-apps-script-webapp.gs`

2. Copiar TODO el contenido

3. Pegar en el archivo `WebApp` de Apps Script

4. **Guardar** (Ctrl+S)

---

### Paso 4: Deployar como Web App

1. En Apps Script, click en: **Implementar** (o **Deploy**) → **Nueva implementación**

2. Click en ⚙️ junto a "Seleccionar tipo"

3. Seleccionar: **Aplicación web**

4. Configurar:
   ```
   Descripción: Web App - Hallazgos
   Ejecutar como: Yo (tu email)
   Quién tiene acceso: Cualquier usuario
   ```

5. Click: **Implementar**

6. Autorizar permisos cuando lo solicite

7. **COPIAR LA URL** que aparece (algo como):
   ```
   https://script.google.com/macros/s/ABCD...XYZ/exec
   ```

---

### Paso 5: Probar el Web App

Abre la URL en tu navegador agregando parámetros:

```
https://script.google.com/macros/s/TU_ID/exec?action=getUltimaBusqueda
```

Deberías ver un JSON con datos de tu última búsqueda.

---

## 🔧 URLs del Web App

Una vez deployado, tendrás estos endpoints:

### Obtener última búsqueda:
```
https://script.google.com/macros/s/TU_ID/exec?action=getUltimaBusqueda
```

### Obtener hallazgos por ID:
```
https://script.google.com/macros/s/TU_ID/exec?action=getHallazgos&id=COT-001
```

### Obtener todas las búsquedas:
```
https://script.google.com/macros/s/TU_ID/exec?action=getBusquedas
```

---

## 📱 Actualizar Frontend HTML

Una vez que tengas la URL del Web App, necesitas actualizar el frontend.

**Archivo a modificar:**
```
sistema-cotizador-hibrido-3.0.html
```

**Buscar la línea (aproximadamente línea 1200-1300):**
```javascript
const GOOGLE_SHEETS_API_KEY = 'TU_API_KEY';
```

**Reemplazar con:**
```javascript
const WEB_APP_URL = 'https://script.google.com/macros/s/TU_ID/exec';
```

**Y actualizar la función de carga de datos** para usar fetch en lugar de Google Sheets API.

---

## ✅ Ventajas de esta Solución

| Aspecto | API Key | Web App |
|---------|---------|---------|
| **Configuración** | Compleja | Simple |
| **Seguridad** | Expone credenciales | Segura |
| **Límites** | 100 req/100 seg | 20,000 req/día |
| **Costos** | Requiere proyecto GCP | Gratis |
| **Mantenimiento** | Alto | Bajo |

---

## 🚀 Próximo Paso

1. **Ahora:** Configurar Web App en Apps Script (pasos arriba)
2. **Copiar URL** del Web App
3. **Yo actualizo el frontend** para usar esa URL
4. **Hacer commit y push** del frontend actualizado
5. **Listo!** El frontend cargará datos sin pedir API key

---

¿Quieres que te ayude a actualizar el frontend HTML una vez que tengas la URL del Web App?
