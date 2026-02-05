# 🚀 INICIO RÁPIDO - 5 PASOS

## ⏱️ Tiempo estimado: 15 minutos

---

## ✅ PASO 1: Instalar ngrok (5 min)

### 1.1 Descargar

Ve a: **https://ngrok.com/download**

Click en **Windows (64-bit)**

### 1.2 Extraer

Extrae `ngrok.exe` a: `C:\ngrok\`

### 1.3 Registrarse (gratis)

Ve a: **https://ngrok.com/signup**

Regístrate con email o Google

### 1.4 Configurar authtoken

Copia tu authtoken de: https://dashboard.ngrok.com/get-started/your-authtoken

Abre CMD y ejecuta:
```bash
C:\ngrok\ngrok.exe config add-authtoken TU_TOKEN_AQUI
```

---

## ✅ PASO 2: Iniciar Backend (2 min)

### 2.1 Doble click en:
```
C:\CotizadorClaude\INICIAR_SISTEMA.bat
```

Debe mostrar:
```
🚀 BACKEND SERPAPI BRIDGE - INICIADO
✅ Servidor corriendo en http://localhost:3000
```

**⚠️ DEJA ESTA VENTANA ABIERTA**

---

## ✅ PASO 3: Iniciar ngrok (1 min)

### 3.1 Abrir OTRA ventana CMD

```bash
cd C:\ngrok
ngrok http 3000
```

### 3.2 Copiar URL

Verás algo como:
```
Forwarding    https://abc123xyz.ngrok-free.app -> http://localhost:3000
```

**COPIA:** `https://abc123xyz.ngrok-free.app`

**⚠️ DEJA ESTA VENTANA ABIERTA**

---

## ✅ PASO 4: Configurar Apps Script (5 min)

### 4.1 Abrir Google Sheet

https://docs.google.com/spreadsheets/d/1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI/edit

### 4.2 Abrir Apps Script

**Extensiones** → **Apps Script**

### 4.3 Copiar código

Abre: `C:\CotizadorClaude\google-apps-script-serpapi.gs`

Copia TODO el contenido

Pega en Apps Script (borra el código que viene por defecto)

### 4.4 Actualizar URL de ngrok

Busca línea 13:
```javascript
const BACKEND_URL = 'http://localhost:3000';
```

Cambia por tu URL de ngrok:
```javascript
const BACKEND_URL = 'https://abc123xyz.ngrok-free.app';
```

### 4.5 Guardar

**Ctrl+S** o click en 💾

### 4.6 Crear pestaña Búsqueda

Selecciona función: `crearPestanaBusqueda`

Click: **▶️ Ejecutar**

Autoriza permisos

### 4.7 Configurar trigger

Click en **⏰** (Activadores)

**+ Agregar activador**

Configurar:
- Función: `onEdit`
- Tipo de evento: `Al editar`

**Guardar** y autorizar permisos

---

## ✅ PASO 5: Probar (2 min)

### 5.1 Test manual

En Apps Script:

Selecciona función: `procesarUltimaBusquedaManual`

Click: **▶️ Ejecutar**

### 5.2 Ver logs

**Ver** → **Registros de ejecución**

Deberías ver:
```
✅ Búsqueda exitosa!
   Piezas: 25
   Equipos nuevos: 18
   Equipos usados: 12
💾 Guardando hallazgos en Google Sheets...
```

### 5.3 Verificar hallazgos

Ve a tu Google Sheet

Deberías ver nueva pestaña: **"Hallazgos"**

Con datos de búsqueda!

---

## ✅ TODO FUNCIONANDO!

Si llegaste aquí, el sistema está completo:

✅ Backend Node.js corriendo
✅ ngrok exponiendo localhost
✅ Apps Script conectado
✅ Hallazgos guardándose en Google Sheets

---

## 📊 FLUJO COMPLETO

```
1. Usuario edita Google Sheets → Pestaña "Búsqueda"
   ↓
2. Apps Script detecta cambio
   ↓
3. Apps Script llama a ngrok
   ↓
4. ngrok reenvía a Backend Node.js
   ↓
5. Backend ejecuta Python SerpAPI
   ↓
6. Python busca en Google Shopping, Amazon, Walmart, eBay
   ↓
7. Resultados guardados en "Hallazgos"
   ✅ LISTO!
```

---

## 🎯 PRÓXIMO PASO

**Frontend:**

Abre: `C:\Users\JUAN ANTONIO\CotizadorClaude\sistema-cotizador-avanzado.html`

Actualiza la URL del Web App (línea 712)

Click "Cargar Última Cotización"

Verás gráficas con datos reales!

---

## 🆘 ¿PROBLEMAS?

### Error en Apps Script

Ver: `SETUP_GOOGLE_APPS_SCRIPT.md`

### Error con ngrok

Ver: `SETUP_NGROK.md`

### Error con backend

Ver: `SETUP_BACKEND.md`

### Guía completa

Ver: `CONECTAR_TODO.md`

---

## 📞 ESTRUCTURA DE ARCHIVOS

```
C:\CotizadorClaude\
├── 🚀 INICIAR_SISTEMA.bat         ← Ejecutar primero
├── 📋 INICIO_RAPIDO.md             ← Estás aquí
├── 📋 SETUP_NGROK.md               ← Guía ngrok
├── 📋 SETUP_BACKEND.md             ← Guía backend
├── 📋 SETUP_GOOGLE_APPS_SCRIPT.md  ← Guía Apps Script
├── 📋 CONECTAR_TODO.md             ← Guía completa
│
├── 📄 backend-serpapi-bridge.js    ← Backend Node.js
├── 📄 comparador_serpapi_cli.py    ← Python CLI
├── 📄 google-apps-script-serpapi.gs ← Apps Script
└── 📄 test-backend.js              ← Tests
```

---

**¡El sistema está listo para usar!** 🎉

**Archivo:** `INICIO_RAPIDO.md`
**Fecha:** 2026-02-04
