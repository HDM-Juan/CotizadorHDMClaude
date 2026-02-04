# Guía de Uso Rápido - Sistema de Cotización

## Estado Actual: ✅ FUNCIONANDO

El backend está corriendo en: **http://localhost:3000**

---

## Cómo Usar el Sistema

### 1. Abrir el Frontend

**Opción A - Desde VSCode:**
- Haz clic derecho en `sistema-cotizador-hibrido-3.0.html`
- Selecciona "Open with Live Server" (si tienes la extensión instalada)

**Opción B - Arrastrar al navegador:**
- Abre Chrome, Firefox o Edge
- Arrastra el archivo `sistema-cotizador-hibrido-3.0.html` a la ventana del navegador

**Opción C - Desde el explorador de Windows:**
1. Presiona `Ctrl+E` en VSCode (o ve a View → Explorer)
2. Haz clic derecho en `sistema-cotizador-hibrido-3.0.html`
3. Selecciona "Reveal in File Explorer"
4. Haz doble clic en el archivo

---

### 2. Hacer una Búsqueda de Prueba

Una vez abierto el archivo HTML, verás un formulario. Completa los campos:

1. **Tipo de Dispositivo**: Selecciona "Smartphone"
2. **Marca**: Selecciona "Apple"
3. **Modelo**: Escribe "iPhone 13"
4. **Tipo de Pieza**: Selecciona "Pantalla/Display"
5. **Variante** (opcional): Escribe "OLED"
6. Click en el botón **"🔍 Buscar Refacciones"**

---

### 3. Qué Esperar

Después de hacer clic en "Buscar Refacciones":

✅ **Deberías ver:**
- Un spinner de carga por 1-2 segundos
- Una notificación verde: "✅ Búsqueda completada exitosamente"
- Aparecerán 4 secciones nuevas:
  - **📊 Estadísticas**: Total resultados, precios promedio, mín/máx
  - **Filtros**: Para filtrar por plataforma, condición, precio
  - **📋 Tabla de Resultados**: 20 resultados simulados
  - **📈 Gráfica**: Comparación visual de precios

---

### 4. Qué Hacer si No Funciona

#### Problema: No aparece nada al hacer clic
**Solución:**
1. Abre la **Consola del Navegador** (F12)
2. Ve a la pestaña "Console"
3. Busca mensajes de error en rojo
4. Comparte esos mensajes conmigo

#### Problema: Aparece error de CORS
**Solución:**
- El sistema usa datos simulados, NO necesita el backend
- Los datos se generan localmente en el navegador
- NO debería haber errores de CORS

#### Problema: El formulario está vacío
**Solución:**
- Refresca la página (F5)
- Verifica que todas las librerías se cargaron (revisa la consola)

---

### 5. Otras Funciones Disponibles

#### Buscar Dispositivos Completos
1. Llena Marca y Modelo
2. Click en **"📱 Buscar Dispositivos Completos"**
3. Verás comparación: Refacción vs Dispositivo Nuevo vs Usado

#### Crear Cotización
1. Haz primero una búsqueda de refacciones
2. Selecciona algunas referencias (checkbox en la tabla)
3. Click en **"✅ Crear Cotización con Seleccionados"**
4. Llena los datos del cliente
5. Genera la cotización

#### Exportar
- **📄 Exportar HTML**: Descarga archivo HTML para enviar al cliente
- **🖨️ Exportar PDF**: Abre diálogo de impresión (Guardar como PDF)

---

## Verificación del Sistema

### Backend (Ya está corriendo)
```bash
# Para verificar que el backend está activo:
curl http://localhost:3000/health

# Deberías ver:
# {"status":"online","timestamp":"...","version":"3.0.0"}
```

### Frontend (Datos Simulados)
- El frontend NO necesita el backend para funcionar
- Usa datos de ejemplo generados automáticamente
- Los resultados son simulaciones realistas

---

## Datos de Ejemplo Generados

El sistema genera automáticamente:
- 20 resultados por búsqueda
- Precios realistas según el tipo de pieza
- Variedad de plataformas (Amazon, eBay, Mercado Libre, AliExpress)
- Condiciones (Nuevo/Usado)
- Valoraciones y envíos

---

## Próximos Pasos (Opcional)

Si quieres configurar:
- **APIs Reales**: Ver `README.md` sección "Configuración del Backend"
- **Google Sheets**: Ver `GUIA-IMPLEMENTACION.md` sección "Google Apps Script"
- **Personalización**: Editar colores, logos, datos del negocio en el HTML

---

## Contacto para Soporte

Si tienes problemas:
1. Abre la consola del navegador (F12)
2. Revisa errores en la pestaña "Console"
3. Comparte screenshots o mensajes de error
4. Revisa los archivos de documentación adicionales

---

**¡El sistema está listo para usar!** 🎉
