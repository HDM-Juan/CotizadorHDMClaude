# 🚀 Guía de Implementación Completa - Sistema Avanzado

## 📌 Resumen de Funcionalidades

### Sistema de Búsqueda Automática desde Google Sheets

**Flujo:**
1. Al cargar la página → Lee último registro de Google Sheets (pestaña "Cotizaciones")
2. Auto-completa: Marca, Modelo, Refacción
3. Ejecuta 3 búsquedas simultáneas:
   - **Pieza de repuesto** con variantes
   - **Dispositivo usado** en excelente estado
   - **Dispositivo nuevo**

---

## 🎨 Diseño de Tarjetas

### Tarjeta AZUL - Dispositivos Nuevos
```
┌─────────────────────────────────────┐
│  📱 [Marca] [Modelo] Nuevo          │
│  ─────────────────────────────────  │
│  💰 Precio Mínimo:    $X,XXX MXN    │
│  📊 Precio Promedio:  $X,XXX MXN    │
│  📈 Precio Máximo:    $X,XXX MXN    │
│  ─────────────────────────────────  │
│  📉 Pieza vs Nuevo:   XX%           │
│     (% que representa la pieza)     │
└─────────────────────────────────────┘
```

### Tarjeta VERDE - Dispositivos Usados
```
┌─────────────────────────────────────┐
│  📱 [Marca] [Modelo] Usado          │
│  🌟 Excelente Estado                │
│  ─────────────────────────────────  │
│  💰 Precio Mínimo:    $X,XXX MXN    │
│  📊 Precio Promedio:  $X,XXX MXN    │
│  📈 Precio Máximo:    $X,XXX MXN    │
│  ─────────────────────────────────  │
│  📉 Pieza vs Usado:   XX%           │
│     (% que representa la pieza)     │
└─────────────────────────────────────┘
```

### Tarjeta BLANCA - Piezas de Repuesto
```
┌─────────────────────────────────────┐
│  🔧 [Tipo Pieza] para               │
│     [Marca] [Modelo]                │
│  ─────────────────────────────────  │
│  💰 Precio Mínimo:    $X,XXX MXN    │
│  📊 Precio Promedio:  $X,XXX MXN    │
│  📈 Precio 3/4:       $X,XXX MXN    │
│  💎 Precio Máximo:    $X,XXX MXN    │
│  ─────────────────────────────────  │
│  ⚡ Menor entrega:    X días         │
└─────────────────────────────────────┘
```

---

## 📊 Tabla de Resultados - Piezas

### Columnas:

| ☑️ | Plataforma | Precio Venta | Costo Envío | Impuestos | Costo Total | Rating | Tiempo | URL |
|----|-----------|--------------|-------------|-----------|-------------|--------|--------|-----|
| □  | Amazon    | $2,500       | $150        | $424      | $3,074      | 4.5★   | 5 días | 🔗  |
| □  | eBay      | $2,200       | $200        | $0        | $2,400      | 4.8★   | 7 días | 🔗  |
| □  | ML        | $2,800       | $0          | $0        | $2,800      | 4.2★   | 3 días | 🔗  |

### Funcionalidades:
- **Checkbox**: Seleccionar para cotización
- **Sorting**: Click en encabezados para ordenar
- **Filtros**: Por plataforma, rango de precio, tiempo de entrega
- **Highlight**: Menor precio total en verde claro
- **Highlight**: Menor tiempo en azul claro

---

## 📈 Gráfica de Dispersión (Scatter Plot)

### Configuración:
- **Eje X**: Tiempo de Entrega (días)
- **Eje Y**: Costo Total (MXN)
- **Puntos**: Cada opción encontrada
- **Colores por plataforma**:
  - 🟠 Amazon: Naranja
  - 🔵 eBay: Azul
  - 🟢 Mercado Libre: Verde
  - 🔴 AliExpress: Rojo

### Tooltip al pasar el mouse:
```
Plataforma: Amazon
Producto: Pantalla OLED iPhone 13
Precio: $2,500
Envío: $150
Impuestos: $424
Total: $3,074
Tiempo: 5 días
Rating: 4.5★
```

### Líneas de referencia:
- Línea horizontal: Precio promedio
- Línea vertical: Tiempo promedio

---

## 🔄 Estructura de Datos

### Datos Simulados - Pieza de Repuesto

```javascript
{
  plataforma: 'amazon',
  precioVenta: 2500,
  costoEnvio: 150,
  impuestos: 424,  // 16% IVA si aplica
  costoTotal: 3074,
  calificacionVendedor: 4.5,
  tiempoEntrega: 5,  // días
  url: 'https://amazon.com.mx/...',
  producto: 'Pantalla OLED Original iPhone 13',
  condicion: 'new',
  vendedor: 'Tech Parts MX'
}
```

### Datos Simulados - Dispositivo Usado

```javascript
{
  plataforma: 'mercadolibre',
  precioVenta: 8500,
  costoEnvio: 0,
  impuestos: 0,
  costoTotal: 8500,
  calificacionVendedor: 4.8,
  tiempoEntrega: 2,
  url: 'https://mercadolibre.com.mx/...',
  producto: 'iPhone 13 128GB Usado Excelente',
  condicion: 'used_excellent',
  estado: '9/10 - Mínimos detalles estéticos'
}
```

### Datos Simulados - Dispositivo Nuevo

```javascript
{
  plataforma: 'amazon',
  precioVenta: 14999,
  costoEnvio: 0,
  impuestos: 2400,
  costoTotal: 17399,
  calificacionVendedor: 4.9,
  tiempoEntrega: 3,
  url: 'https://amazon.com.mx/...',
  producto: 'iPhone 13 128GB Nuevo Sellado',
  condicion: 'new',
  garantia: '1 año Apple'
}
```

---

## 🎯 Cálculos Especiales

### Precio 3/4 (Tercer Cuartil)
```javascript
function calcularCuartil3(precios) {
  const sorted = precios.sort((a, b) => a - b);
  const pos = Math.floor(sorted.length * 0.75);
  return sorted[pos];
}
```

### Porcentaje Pieza vs Dispositivo
```javascript
const porcentajePieza = (precioPieza / precioDispositivo) * 100;
// Ejemplo: $3,000 / $15,000 * 100 = 20%
// "La pieza representa el 20% del precio del dispositivo nuevo"
```

### Costo de Envío a CP 03023 (Ciudad de México)
```javascript
function calcularEnvio(origen, plataforma) {
  const basePorPlataforma = {
    amazon: 99,    // Amazon Prime: gratis o $99
    ebay: 250,     // Internacional
    mercadolibre: 0, // Envío gratis común
    aliexpress: 0   // Envío incluido
  };

  // Agregar variación aleatoria ±30%
  const base = basePorPlataforma[plataforma];
  return Math.round(base * (0.7 + Math.random() * 0.6));
}
```

### Cálculo de Impuestos
```javascript
function calcularImpuestos(precio, plataforma) {
  const tasas = {
    amazon: 0.16,      // IVA México
    ebay: 0.16,        // IVA + posible importación
    mercadolibre: 0,   // Ya incluido
    aliexpress: 0      // Usualmente exento <$50 USD
  };

  const tasa = tasas[plataforma];
  return Math.round(precio * tasa);
}
```

---

## 🔗 Integración con Google Sheets

### Al cargar la página:

```javascript
async function cargarUltimaCotizacion() {
  const apiUrl = localStorage.getItem('sheetsApiUrl');

  const response = await fetch(apiUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      action: 'getUltimaCotizacion'
    })
  });

  // Nota: mode: 'no-cors' no permite leer response
  // Necesitas usar mode: 'cors' y configurar CORS en Apps Script
  // O usar JSONP
}
```

### Guardar resultados de búsqueda:

```javascript
async function guardarResultados(resultados) {
  const apiUrl = localStorage.getItem('sheetsApiUrl');

  await fetch(apiUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      action: 'saveBusqueda',
      data: {
        folio: folioActual,
        marca: 'Apple',
        modelo: 'iPhone 13',
        refaccion: 'Pantalla',
        tipoBusqueda: 'pieza',
        resultados: resultados
      }
    })
  });
}
```

---

## 📝 Próximos Pasos de Implementación

### Fase 1: HTML Estructura (Completar primero)
- [x] Google Apps Script configurado
- [ ] Crear archivo HTML base
- [ ] Implementar sección de configuración API
- [ ] Crear estructura de 3 tarjetas
- [ ] Crear tabla de resultados

### Fase 2: JavaScript Lógica
- [ ] Función para leer última cotización
- [ ] Generador de datos simulados
- [ ] Función de búsqueda 3 en 1
- [ ] Cálculos de precios y porcentajes
- [ ] Sorting y filtros de tabla

### Fase 3: Gráficas
- [ ] Implementar Chart.js scatter plot
- [ ] Configurar colores por plataforma
- [ ] Implementar tooltips
- [ ] Líneas de referencia

### Fase 4: Integración Final
- [ ] Conectar con Google Sheets
- [ ] Guardar resultados automáticamente
- [ ] Sistema de selección de opciones
- [ ] Exportar cotización final

---

## 🎨 Paleta de Colores

```css
:root {
  /* Tarjetas */
  --card-nuevo: #3b82f6;      /* Azul */
  --card-usado: #10b981;       /* Verde */
  --card-pieza: #ffffff;       /* Blanco */

  /* Plataformas */
  --amazon: #FF9900;
  --ebay: #0064D2;
  --mercadolibre: #FFE600;
  --aliexpress: #E62E04;

  /* Estados */
  --mejor-precio: #d1fae5;     /* Verde claro */
  --mejor-tiempo: #dbeafe;     /* Azul claro */
}
```

---

## ✅ Checklist de Testing

- [ ] Google Apps Script implementado
- [ ] URL configurada en frontend
- [ ] Última cotización se carga automáticamente
- [ ] 3 búsquedas se ejecutan correctamente
- [ ] Tarjetas muestran datos correctos
- [ ] Cálculos de porcentajes correctos
- [ ] Tabla se ordena y filtra
- [ ] Gráfica renderiza correctamente
- [ ] Tooltips funcionan
- [ ] Selección de opciones funciona
- [ ] Datos se guardan en Google Sheets

---

**Estado:** Listo para implementación
**Tiempo estimado:** 2-3 horas de desarrollo
**Dificultad:** Media-Alta
