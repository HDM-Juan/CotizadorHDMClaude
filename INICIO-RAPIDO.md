# 🚀 INICIO RÁPIDO - 15 MINUTOS
## Sistema de Cotización Profesional 3.0

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN RÁPIDA

### ⏱️ Tiempo estimado: 15 minutos

---

## PASO 1: Descargar e Instalar (3 minutos)

```bash
# Navega a la carpeta del proyecto
cd sistema-cotizacion-profesional

# Instala las dependencias
npm install
```

**✅ Verificación**: Deberías ver "added X packages"

---

## PASO 2: Configurar Variables (2 minutos)

```bash
# Copia el archivo de ejemplo
cp .env.example .env
```

**ℹ️ Nota**: Por ahora déjalo sin cambios. El sistema funcionará con datos simulados.

---

## PASO 3: Iniciar el Sistema (1 minuto)

### Terminal 1: Backend

```bash
npm run dev
```

**✅ Verificación**: Deberías ver "Servidor corriendo en http://localhost:3000"

### Terminal 2: Frontend

```bash
# Simplemente abre en tu navegador:
sistema-cotizador-hibrido-v3.html
```

O arrastra el archivo a una ventana del navegador.

---

## PASO 4: Primera Búsqueda (2 minutos)

1. En el navegador, completa el formulario:
   ```
   Dispositivo: Smartphone
   Marca: Apple
   Modelo: iPhone 13
   Refacción: Pantalla
   ```

2. Click en **🔍 Buscar Cotizaciones**

3. **✅ Deberías ver resultados en 2-3 segundos**

---

## PASO 5: Crear Cotización (3 minutos)

1. Click en la pestaña **💰 Cotización**

2. Completa:
   ```
   Nombre Cliente: Juan Pérez
   Email: juan@ejemplo.com
   Teléfono: +52 123 456 7890
   ```

3. Selecciona 2-3 variantes (click en las tarjetas)

4. Completa precios:
   ```
   Precio Refacción: 2500
   Mano de Obra: 300
   Utilidad: 20
   ```

5. Click en **💾 Generar Cotización**

6. **✅ Deberías ver "Cotización generada: HM-..."**

---

## PASO 6: Exportar (2 minutos)

1. Click en **📄 Exportar HTML**

2. Se descargará un archivo HTML

3. Abre el archivo descargado

4. **✅ Deberías ver una cotización profesional con formulario de respuesta**

---

## PASO 7: Google Sheets (OPCIONAL - 2 minutos)

Si quieres que las cotizaciones se guarden automáticamente:

1. Ve a [Google Sheets](https://sheets.google.com)

2. Crea una nueva hoja

3. Copia el ID de la URL

4. En el navegador, pega el ID en el panel amarillo

5. Click **💾 Guardar**

**ℹ️ Completa este paso siguiendo la [GUIA-IMPLEMENTACION.md](GUIA-IMPLEMENTACION.md) cuando estés listo**

---

## 🎉 ¡LISTO!

Tu sistema está funcionando. Ahora puedes:

### ✅ Lo que YA funciona (sin configuración adicional):
- ✅ Buscar refacciones con datos simulados
- ✅ Ver gráficas y análisis
- ✅ Comparar precios vs dispositivos nuevos/usados
- ✅ Generar cotizaciones profesionales
- ✅ Exportar en HTML y PDF
- ✅ Compartir por WhatsApp

### 🔄 Lo que requiere configuración (opcional):
- 🔄 APIs reales (Amazon, eBay) - Requiere cuentas
- 🔄 Google Sheets automático - Requiere Apps Script
- 🔄 Despliegue en internet - Requiere hosting

---

## 📝 PRÓXIMOS PASOS

### Para Uso Inmediato
✅ Ya puedes empezar a usar el sistema localmente con datos simulados

### Para Producción
1. Configura Google Sheets (20 min) - Ver [GUIA-IMPLEMENTACION.md](GUIA-IMPLEMENTACION.md#configuración-de-google-sheets)
2. Despliega en internet (10 min) - Ver [GUIA-IMPLEMENTACION.md](GUIA-IMPLEMENTACION.md#despliegue-del-frontend)
3. Configura APIs reales (opcional) - Ver [GUIA-IMPLEMENTACION.md](GUIA-IMPLEMENTACION.md#configuración-de-apis)

---

## 🆘 PROBLEMAS COMUNES

### "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### "Puerto 3000 ya en uso"
```bash
# En .env cambia:
PORT=3001
```

### "No aparecen resultados"
- Verifica que el backend esté corriendo
- Abre la consola del navegador (F12) y busca errores
- Reinicia el backend con `npm run dev`

---

## 📖 MÁS INFORMACIÓN

- **Documentación completa**: [README.md](README.md)
- **Guía detallada**: [GUIA-IMPLEMENTACION.md](GUIA-IMPLEMENTACION.md)

---

## 💡 TIPS IMPORTANTES

1. **Datos Simulados**: El sistema funciona perfectamente sin APIs reales
2. **Google Sheets**: Es opcional pero muy recomendado para seguimiento
3. **APIs Reales**: Solo configúralas cuando estés listo para producción
4. **Personalización**: Cambia colores y logos en el HTML
5. **Soporte**: Lee la guía completa para más detalles

---

## 🎯 VERIFICACIÓN FINAL

Si completaste todos los pasos, deberías poder:

- [x] Ver el backend corriendo en http://localhost:3000
- [x] Abrir el frontend en el navegador
- [x] Buscar refacciones y ver resultados
- [x] Ver gráficas en la pestaña Análisis
- [x] Ver comparación en la pestaña Comparación
- [x] Generar una cotización
- [x] Exportar la cotización en HTML
- [x] Ver la cotización con formulario de respuesta

---

<div align="center">

**¡Felicidades! 🎉**

Tu sistema de cotización está funcionando

*Tiempo total: 15 minutos*

[Volver al README](README.md) | [Ver Guía Completa](GUIA-IMPLEMENTACION.md)

</div>
