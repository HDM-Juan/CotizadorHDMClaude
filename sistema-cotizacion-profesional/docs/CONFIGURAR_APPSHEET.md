# 📱 Configurar AppSheet con el Sistema

## 🎯 Arquitectura Recomendada

```
AppSheet Formulario
    ↓ (guarda automáticamente)
Google Sheets "Búsqueda"
    ↓ (trigger onEdit automático)
Apps Script
    ↓
Backend → SerpAPI
    ↓
Google Sheets "Hallazgos"
    ↓ (botón en AppSheet)
Frontend HTML (ver resultados)
```

---

## ✅ PASO 1: Configurar Google Sheet

### Estructura de la pestaña "Búsqueda"

Ya debería existir con estas columnas:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| ID_Cotizador | Key | Auto-generado |
| Timestamp | DateTime | Auto-generado |
| Usuario | Email | Email del usuario |
| Dispositivo | Enum | Celular/Tablet/Smartwatch |
| Marca | Text | Samsung, Apple, etc. |
| Modelo | Text | S22 Plus, iPhone 14, etc. |
| Color | Text | Negro, Blanco, etc. |
| Variante1 | Text | 128GB, 256GB, etc. |
| Variante2 | Text | Opcional |
| Pieza | Text | Pantalla, Batería, etc. |
| Fecha_Registro | Date | Auto |
| Estado | Text | Pendiente/Buscando/Completo/Error |
| Notas | Long Text | Opcional |

### Crear columna "Estado" si no existe:

En Google Sheets:
1. Agregar columna "Estado"
2. Fórmula por defecto: `Pendiente`

---

## ✅ PASO 2: Configurar Apps Script

### 2.1 Copiar el código

Ya está en: `scripts/google-apps-script-serpapi.gs`

### 2.2 Actualizar variables

```javascript
const BACKEND_URL = 'TU_URL_DE_NGROK';
const SHEET_ID = '1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI';
```

### 2.3 Crear trigger automático

1. En Apps Script: ⏰ (Activadores)
2. + Agregar activador
3. Configurar:
   - Función: `onEdit`
   - Tipo de evento: `Al editar`
   - Guardar y autorizar

---

## ✅ PASO 3: Configurar AppSheet

### 3.1 Crear App en AppSheet

1. Ir a: https://www.appsheet.com/
2. Crear nueva app
3. Seleccionar Google Sheet
4. Pegar URL del Sheet

### 3.2 Configurar Vista del Formulario

**Columnas visibles en el formulario:**
- Dispositivo (dropdown)
- Marca (texto)
- Modelo (texto)
- Color (texto)
- Variante1 (texto, opcional)
- Variante2 (texto, opcional)
- Pieza (texto)
- Notas (texto largo, opcional)

**Columnas ocultas (auto-generadas):**
- ID_Cotizador
- Timestamp
- Usuario (usar [_USEREMAIL])
- Fecha_Registro (usar TODAY())
- Estado (iniciar en "Pendiente")

### 3.3 Crear Vista de Tabla (Búsquedas)

**Columnas visibles:**
- ID_Cotizador
- Fecha_Registro
- Pieza
- Marca
- Modelo
- Estado

**Agregar acción "Ver Hallazgos":**
```
Nombre: Ver Hallazgos
Condición: [Estado] = "Completo"
Tipo: App: open a URL
URL: https://tu-dominio.com/sistema-cotizador-hibrido-3.0.html?id=[ID_Cotizador]
```

### 3.4 Agregar Indicador Visual de Estado

En AppSheet, formato condicional para columna "Estado":

- 🟡 Pendiente → Amarillo
- 🔵 Buscando → Azul
- 🟢 Completo → Verde
- 🔴 Error → Rojo

---

## ✅ PASO 4: Opciones de Acceso al Frontend

### Opción A: URL Pública con ngrok (Desarrollo)

```
https://abc123.ngrok-free.app/sistema-cotizador-hibrido-3.0.html?id=COT-20260204-001
```

**Pros:**
- Rápido de configurar
- Gratis

**Contras:**
- URL cambia cada vez que reinicias ngrok
- Solo para desarrollo

---

### Opción B: GitHub Pages (Producción Simple)

**Setup:**

1. Crear repositorio público en GitHub
2. Subir `sistema-cotizador-hibrido-3.0.html`
3. Activar GitHub Pages
4. URL fija: `https://usuario.github.io/proyecto/sistema-cotizador-hibrido-3.0.html`

**En AppSheet:**
```
URL: https://usuario.github.io/CotizadorHDM/sistema-cotizador-hibrido-3.0.html?id=[ID_Cotizador]
```

**Pros:**
- ✅ URL fija (no cambia)
- ✅ Gratis
- ✅ HTTPS automático
- ✅ Perfecto para frontend estático

**Contras:**
- ❌ Solo HTML estático (no backend)
- ❌ Frontend debe cargar datos desde Google Sheets API

---

### Opción C: Hosting Compartido / VPS (Producción Completa)

Para sistema completo con backend:

**Servicios recomendados:**
- Heroku (gratis con límites)
- Railway (gratis con límites)
- DigitalOcean ($5/mes)
- Vercel (frontend gratis)

---

## ✅ PASO 5: Flujo Completo en Acción

### Desde el Usuario:

1. **Crear nueva búsqueda:**
   - Abrir app AppSheet
   - Llenar formulario
   - Guardar

2. **Sistema automático:**
   - Apps Script detecta nuevo registro
   - Cambia estado a "Buscando..."
   - Llama al backend → SerpAPI
   - Guarda hallazgos
   - Cambia estado a "Completo"

3. **Ver resultados:**
   - En AppSheet, ver tabla de búsquedas
   - Click en "Ver Hallazgos" (solo si Completo)
   - Se abre HTML con gráficas y resultados
   - Generar cotizaciones en PDF/JPG/HTML

---

## 🎨 Mejoras Opcionales

### 1. Notificaciones

Agregar en Apps Script:

```javascript
function notificarUsuario(email, folio, estado) {
  const subject = `Búsqueda ${folio} - ${estado}`;
  const body = `Tu búsqueda está ${estado}. Ver resultados en AppSheet.`;
  MailApp.sendEmail(email, subject, body);
}
```

### 2. Webhook de AppSheet

En lugar de trigger onEdit, usar Webhook de AppSheet:

**En AppSheet:**
1. Crear Bot
2. Trigger: cuando se crea nuevo registro
3. Action: Call a webhook
4. URL: `[BACKEND_URL]/buscar`

**Ventaja:** Más confiable que onEdit

### 3. Caché de Resultados

Frontend puede cachear resultados en localStorage:

```javascript
localStorage.setItem(`hallazgos_${id}`, JSON.stringify(datos));
```

---

## 🔧 Scripts de Apoyo

### Script para limpiar búsquedas antiguas

```javascript
function limpiarBusquedasAntiguas() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Búsqueda');
  const data = sheet.getDataRange().getValues();

  const hoy = new Date();
  const diasMax = 30; // Eliminar búsquedas mayores a 30 días

  for (let i = data.length - 1; i > 0; i--) {
    const fechaRegistro = new Date(data[i][8]); // Columna Fecha_Registro
    const diasTranscurridos = (hoy - fechaRegistro) / (1000 * 60 * 60 * 24);

    if (diasTranscurridos > diasMax) {
      sheet.deleteRow(i + 1);
    }
  }

  Logger.log('Búsquedas antiguas eliminadas');
}
```

---

## 📊 Resumen de Configuración

| Componente | Estado | Acción Requerida |
|------------|--------|------------------|
| Google Sheet | ✅ Existe | Agregar columna "Estado" |
| Apps Script | ✅ Código listo | Actualizar URL y crear trigger |
| Backend | ✅ Funcionando | Mantener corriendo o usar servicio |
| Frontend HTML | ✅ Listo | Subir a GitHub Pages u hosting |
| AppSheet | ⚠️ Pendiente | Crear app y configurar acciones |

---

## 🚀 Inicio Rápido AppSheet

**Opción más simple (5 minutos):**

1. Apps Script con trigger onEdit ✅ (ya está)
2. Frontend en GitHub Pages (subir HTML)
3. AppSheet con botón:
   ```
   Ver Hallazgos →
   URL: https://usuario.github.io/.../sistema-cotizador-hibrido-3.0.html?id=[ID_Cotizador]
   ```

**Listo!** El usuario llena formulario → búsqueda automática → ve resultados en HTML.

---

## 📞 Siguiente Paso

¿Qué prefieres configurar primero?

**A) GitHub Pages** (frontend con URL fija)
**B) AppSheet** (crear app y botones)
**C) Apps Script mejorado** (con notificaciones y estado)
**D) Hosting completo** (backend permanente)

---

**Archivo:** CONFIGURAR_APPSHEET.md
**Fecha:** 2026-02-04
