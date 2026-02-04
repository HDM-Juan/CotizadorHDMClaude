# 📊 Estructura Correcta de Google Sheets

**Basado en:** objetivo.txt
**Google Sheet ID:** `1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI`
**Fecha:** 2 de Noviembre, 2025

---

## 📋 Pestaña 1: **Búsqueda**

Esta es la pestaña principal donde se registran las solicitudes de cotización.

### Columnas:

| # | Nombre | Tipo | Descripción | Ejemplo |
|---|--------|------|-------------|---------|
| A | **ID_Cotizador** | Key | ID único autogenerado | ID_1730556789123 |
| B | **Timestamp** | Timestamp | Fecha y hora automática | 2024-11-02 10:30:00 |
| C | **Usuario** | Email | Email del usuario que solicita | usuario@hospitaldelmovil.com.mx |
| D | **Dispositivo** | Enum | Celular, Tablet, Smartwatch | Celular |
| E | **Marca** | Text | Marca del dispositivo | Apple |
| F | **Modelo** | Text | Modelo del dispositivo | iPhone 13 |
| G | **Color** | Text | Color del dispositivo | Negro |
| H | **Variante1** | Text | Primera variante de la pieza | OLED |
| I | **Variante2** | Text | Segunda variante de la pieza | Original |
| J | **Pieza** | Text | Tipo de pieza a cotizar | Pantalla |
| K | **Fecha Registro** | Fecha | Fecha de registro | 2024-11-02 |
| L | **Estado** | Text | Estado de la búsqueda | Pendiente |
| M | **Notas** | Long text | Notas adicionales | Búsqueda urgente |

### Copiar Encabezados (Para pegar en fila 1):

```
ID_Cotizador	Timestamp	Usuario	Dispositivo	Marca	Modelo	Color	Variante1	Variante2	Pieza	Fecha Registro	Estado	Notas
```

### Ejemplo de Fila 2 (Datos de prueba):

```
ID_1730556789	2024-11-02 10:30:00	usuario@hospitaldelmovil.com.mx	Celular	Apple	iPhone 13	Negro	OLED	Original	Pantalla	2024-11-02	Pendiente	Búsqueda urgente para cliente
```

---

## 📋 Pestaña 2: **Hallazgos**

Almacena los resultados de las búsquedas (las opciones encontradas que el usuario selecciona).

### Columnas:

| # | Nombre | Tipo | Descripción | Ejemplo |
|---|--------|------|-------------|---------|
| A | **ID Hallazgos** | Key | ID único autogenerado | H_1730556789 |
| B | **ID Búsqueda** | REF | Referencia a tabla Búsqueda | ID_1730556789 |
| C | **Folio Hallazgo** | Text | Concatenación del folio | HDM-001-H1 |
| D | **Plataforma** | Enum | Amazon, eBay, ML, AliExpress | Amazon |
| E | **Costo Compra** | Precio | Precio de venta | 2500 |
| F | **Costo Entrega** | Precio | Costo de envío al CP 03230 | 150 |
| G | **Impuestos** | Precio | IVA + importación si aplica | 424 |
| H | **Costo Total** | Precio | Suma total | 3074 |
| I | **Tiempo Entrega (días)** | Número | Días de entrega | 5 |
| J | **Calificación Comprador** | 1-5 estrellas | Rating del vendedor | 4.5 |
| K | **Enlace** | URL | URL del producto | https://amazon.com.mx/... |
| L | **Fecha Registro** | Fecha | Fecha del hallazgo | 2024-11-02 |
| M | **Clave Acceso** | Text | Clave interna | - |
| N | **Comentarios Cliente** | Text | Comentarios del cliente | - |
| O | **Usuario** | Email | Usuario que registró | usuario@hospitaldelmovil.com.mx |

### Colores de Plataforma:

- **Amazon:** Azul (#0064D2)
- **eBay:** Blanco con borde
- **Mercado Libre:** Amarillo (#FFE600)
- **AliExpress:** Rojo (#E62E04)

---

## 📋 Pestaña 3: **Cotizaciones**

Almacena las cotizaciones generadas por el usuario para enviar a clientes.

### Columnas:

| # | Nombre | Tipo | Descripción |
|---|--------|------|-------------|
| A | **ID_Cotización** | Key | ID único |
| B | **Fecha_Creacion** | Fecha | Fecha de creación |
| C | **Folio Cotización** | Text | Folio con consecutivo |
| D | **Titulo** | Text | Título de la cotización |
| E | **Pieza** | Text | Pieza cotizada |
| F | **Variante 1** | Text | Primera variante |
| G | **Variante 2** | Text | Segunda variante |
| H | **Dispositivo** | Text | Tipo de dispositivo |
| I | **Marca** | Text | Marca |
| J | **Modelo** | Text | Modelo |
| K | **Cotizado_Por** | Usuario | Quien cotizó |
| L | **Precio_MXN** | Precio | Precio final |
| M | **Dias_Entrega** | Número | Días de entrega |
| N | **Vigencia** | Número | Días de vigencia |
| O | **Comentarios** | Text | Comentarios |
| P | **Notas** | Text | Notas internas |
| Q | **Estado** | Enum | Sin Enviar, Enviado, Aceptado, Rechazado |
| R | **Cliente** | Text | Nombre del cliente |
| S | **Folios_Soporte** | Lista | Máximo 3 folios de Hallazgo |
| T | **Estatus** | Text | Estatus adicional |
| U | **I_Medio Envío** | Enum | Email, Verbal, Whatsapp, Facebook |
| V | **I_Fecha_Envio** | Fecha | Fecha de envío |
| W | **I_PrecioFinal** | Precio | Precio final acordado |
| X | **I_Modificaciones** | Text | Modificaciones realizadas |

---

## 🚀 Crear Estructura en Google Apps Script

### Función Automática: `crearPestanaBusqueda()`

He agregado esta función al Google Apps Script que:

1. ✅ Crea la pestaña "Búsqueda"
2. ✅ Agrega los 13 encabezados correctos
3. ✅ Formatea headers (azul con texto blanco)
4. ✅ Agrega una fila de datos de prueba

**Cómo usar:**

1. Ve a tu Google Apps Script
2. Busca la función `crearPestanaBusqueda()`
3. Click en el nombre de la función
4. Click en ▶️ **Ejecutar**
5. Autoriza los permisos si es la primera vez
6. ¡Listo! La pestaña se crea automáticamente

---

## 📝 Flujo de Trabajo del Sistema

### 1. Registro de Búsqueda (AppSheet)

```
Usuario completa formulario en AppSheet
    ↓
Se crea nueva fila en pestaña "Búsqueda"
    ↓
AppSheet dispara URL con parámetros
    ↓
Sistema CotizadorClaude lee la última fila
```

### 2. Búsqueda Automática (Sistema Avanzado)

```
Sistema lee última fila de "Búsqueda"
    ↓
Extrae: Dispositivo, Marca, Modelo, Variante1, Variante2, Pieza
    ↓
Ejecuta 3 búsquedas simultáneas:
    - Pieza de repuesto (con variantes)
    - Dispositivo usado (excelente estado)
    - Dispositivo nuevo
    ↓
Muestra resultados en:
    - Tarjetas de indicadores
    - Tabla de hallazgos
    - Gráfica de dispersión
```

### 3. Selección y Guardado (Usuario)

```
Usuario revisa resultados
    ↓
Selecciona máximo 3 opciones (checkbox)
    ↓
Se guardan en pestaña "Hallazgos"
    ↓
Usuario genera cotización
    ↓
Se guarda en pestaña "Cotizaciones"
```

---

## 🔧 Actualización del Sistema Avanzado

El sistema avanzado ahora espera estos datos al cargar desde Google Sheets:

```javascript
{
  success: true,
  data: {
    id: 'ID_1730556789',
    timestamp: '2024-11-02 10:30:00',
    usuario: 'usuario@hospitaldelmovil.com.mx',
    dispositivo: 'Celular',
    marca: 'Apple',
    modelo: 'iPhone 13',
    color: 'Negro',
    variante1: 'OLED',
    variante2: 'Original',
    pieza: 'Pantalla',
    fechaRegistro: '2024-11-02',
    estado: 'Pendiente',
    notas: 'Búsqueda urgente'
  }
}
```

---

## ✅ Checklist de Configuración

- [ ] Abrir Google Sheets ID: `1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI`
- [ ] Copiar código actualizado de `google-apps-script.gs`
- [ ] Pegar en Google Apps Script
- [ ] Ejecutar función `crearPestanaBusqueda()`
- [ ] Autorizar permisos
- [ ] Verificar que se creó la pestaña "Búsqueda"
- [ ] Verificar que hay datos de prueba en fila 2
- [ ] Re-desplegar Web App (importante)
- [ ] Probar conexión desde sistema avanzado
- [ ] Cargar última búsqueda

---

## 🎯 Próximos Pasos

1. **Ahora mismo:**
   - Ejecutar `crearPestanaBusqueda()` en Apps Script
   - Re-desplegar el Web App

2. **Después:**
   - Probar botón "🔌 Probar Conexión"
   - Cargar última búsqueda desde sistema avanzado
   - Verificar que se ejecutan las 3 búsquedas

3. **Futuro:**
   - Integrar con AppSheet para registro automático
   - Implementar guardado de hallazgos
   - Completar flujo de cotizaciones

---

**¿Listo para ejecutar `crearPestanaBusqueda()` en Google Apps Script?**

Esta función creará automáticamente la estructura correcta con datos de prueba.
