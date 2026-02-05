# 🚀 GUÍA RÁPIDA DE INICIO

## ⏱️ Tiempo total: 20 minutos

---

## ✅ PASO 1: Verificar Prerrequisitos (2 min)

### Software necesario:

- [ ] **Node.js 16+** - [Descargar](https://nodejs.org/)
- [ ] **Python 3.8+** - [Descargar](https://www.python.org/downloads/)
- [ ] **ngrok** - [Descargar](https://ngrok.com/download)

Verificar instalación:
```bash
node --version
python --version
ngrok version
```

---

## ✅ PASO 2: Configurar SerpAPI (3 min)

### 2.1 Registrarse en SerpAPI
1. Ir a: https://serpapi.com/users/sign_up
2. Crear cuenta (gratis)
3. Confirmar email
4. Copiar API key del dashboard

### 2.2 Configurar API key
```bash
cd sistema-cotizacion-profesional/scripts
python config_serpapi.py
```

Pegar tu API key cuando lo solicite.

---

## ✅ PASO 3: Instalar Dependencias (5 min)

### 3.1 Backend Node.js
```bash
cd sistema-cotizacion-profesional/backend
npm install
```

### 3.2 Scripts Python
```bash
cd ../scripts
pip install -r requirements.txt
```

---

## ✅ PASO 4: Iniciar Backend (2 min)

### 4.1 Con script automático (Recomendado)
```bash
# Doble click en:
sistema-cotizacion-profesional/INICIAR_SISTEMA.bat
```

### 4.2 Manual
```bash
cd sistema-cotizacion-profesional/backend
node backend-serpapi-bridge.js
```

**Verás:**
```
✅ Servidor corriendo en http://localhost:3000
```

**⚠️ DEJA ESTA VENTANA ABIERTA**

---

## ✅ PASO 5: Configurar ngrok (2 min)

### 5.1 Configurar authtoken (solo primera vez)
```bash
ngrok config add-authtoken TU_TOKEN_DE_NGROK
```

Obtener token en: https://dashboard.ngrok.com/get-started/your-authtoken

### 5.2 Iniciar túnel
```bash
ngrok http 3000
```

**Verás algo como:**
```
Forwarding    https://abc123xyz.ngrok-free.app -> http://localhost:3000
```

**📋 COPIAR:** `https://abc123xyz.ngrok-free.app`

**⚠️ DEJA ESTA VENTANA ABIERTA**

---

## ✅ PASO 6: Configurar Google Apps Script (5 min)

### 6.1 Abrir Google Sheet
https://docs.google.com/spreadsheets/d/1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI/edit

### 6.2 Abrir Apps Script
**Extensiones** → **Apps Script**

### 6.3 Copiar código
1. Abrir: `sistema-cotizacion-profesional/scripts/google-apps-script-serpapi.gs`
2. Copiar TODO el contenido
3. Pegar en Apps Script (reemplazar código existente)

### 6.4 Actualizar URL
Buscar línea 13:
```javascript
const BACKEND_URL = 'http://localhost:3000';
```

Cambiar por:
```javascript
const BACKEND_URL = 'https://abc123xyz.ngrok-free.app';
```
(Usar tu URL de ngrok copiada en Paso 5)

### 6.5 Guardar
**Ctrl+S** o click en 💾

### 6.6 Crear pestaña Búsqueda
1. Seleccionar función: `crearPestanaBusqueda`
2. Click: **▶️ Ejecutar**
3. Autorizar permisos cuando lo solicite

### 6.7 Crear trigger automático
1. Click en **⏰** (Activadores / Triggers)
2. **+ Agregar activador**
3. Configurar:
   - Función: `onEdit`
   - Tipo de evento: `Al editar`
4. **Guardar** y autorizar permisos

---

## ✅ PASO 7: Probar el Sistema (1 min)

### 7.1 Test manual
En Apps Script:
1. Seleccionar función: `procesarUltimaBusquedaManual`
2. Click: **▶️ Ejecutar**

### 7.2 Ver logs
**Ver** → **Registros de ejecución**

Deberías ver:
```
✅ Búsqueda exitosa!
   Piezas: 25
   Equipos nuevos: 18
   Equipos usados: 12
💾 Guardando hallazgos en Google Sheets...
```

### 7.3 Verificar resultados
1. Ir al Google Sheet
2. Verificar nueva pestaña: **"Hallazgos"**
3. Ver datos de búsqueda

---

## ✅ TODO LISTO! 🎉

Tu sistema está completo y funcionando:

✅ Backend Node.js corriendo
✅ ngrok exponiendo localhost
✅ Apps Script conectado
✅ Hallazgos guardándose en Google Sheets
✅ Frontend listo para usar

---

## 📊 FLUJO DE TRABAJO NORMAL

```
1. Usuario llena formulario en AppSheet
   ↓
2. AppSheet crea registro en Google Sheets (pestaña "Búsqueda")
   ↓
3. Apps Script detecta cambio automáticamente
   ↓
4. Apps Script llama al backend vía ngrok
   ↓
5. Backend ejecuta Python con SerpAPI
   ↓
6. Python busca en Amazon, Google Shopping, Walmart, eBay
   ↓
7. Resultados guardados en "Hallazgos"
   ↓
8. Usuario abre frontend HTML
   ↓
9. Frontend carga datos desde Google Sheets
   ↓
10. Usuario ve gráficas y genera cotizaciones
```

---

## 🎨 USAR EL FRONTEND

### Opción 1: Cargar desde Google Sheets
1. Abrir: `sistema-cotizacion-profesional/sistema-cotizador-hibrido-3.0.html`
2. Click: **"Cargar Última Cotización"**
3. Ver gráficas y análisis
4. Generar cotizaciones

### Opción 2: Búsqueda manual
1. Abrir frontend
2. Llenar formulario de búsqueda
3. Ver resultados
4. Generar cotizaciones

---

## 🔧 COMANDOS ÚTILES

```bash
# Iniciar backend
cd sistema-cotizacion-profesional
INICIAR_SISTEMA.bat

# Iniciar ngrok
ngrok http 3000

# Test búsqueda Python (modo híbrido)
cd sistema-cotizacion-profesional/scripts
python comparador_hibrido.py

# Ver estado del caché
python cache_equipos.py

# Configurar/verificar API key
python config_serpapi.py
```

---

## 🆘 PROBLEMAS COMUNES

### Backend no inicia
```bash
cd sistema-cotizacion-profesional/backend
npm install
node backend-serpapi-bridge.js
```

### Error "API key no configurada"
```bash
cd sistema-cotizacion-profesional/scripts
python config_serpapi.py
```

### ngrok muestra error de authtoken
```bash
ngrok config add-authtoken TU_TOKEN
```

### Apps Script muestra error
1. Verificar que la URL de ngrok esté actualizada
2. Verificar que backend esté corriendo
3. Revisar logs en Apps Script

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **README.md** - Documentación completa del proyecto
- **docs/INICIO_RAPIDO.md** - Guía detallada paso a paso
- **docs/README_SERPAPI.md** - Guía completa de SerpAPI
- **docs/CONECTAR_TODO.md** - Integración completa

---

## 💡 SIGUIENTE PASO

Una vez que todo funciona, puedes:

1. **Personalizar el frontend** - Cambiar colores, logo, textos
2. **Configurar AppSheet** - Crear formularios personalizados
3. **Ajustar búsquedas** - Modificar plataformas en Python
4. **Optimizar caché** - Ajustar duración en `cache_equipos.py`

---

**¡Sistema listo para usar!** 🚀

**Archivo:** GUIA_RAPIDA.md
**Fecha:** 2026-02-04
**Versión:** 3.0
