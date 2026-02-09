# 📝 Crear Datos de Prueba en Google Sheets

## Opción A: Manualmente en Google Sheets

1. Abrir: https://docs.google.com/spreadsheets/d/1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI/edit

2. Crear pestaña "Búsqueda" (si no existe):
   - Click derecho en pestañas → Insertar hoja
   - Nombre: Búsqueda

3. Agregar estos headers en la fila 1:
   ```
   ID_Cotizador | Timestamp | Usuario | Dispositivo | Marca | Modelo | Color | Variante1 | Variante2 | Pieza | Fecha_Registro | Estado | Notas
   ```

4. Agregar fila de prueba (fila 2):
   ```
   COT-TEST-001 | [hoy] | tu@email.com | Celular | Samsung | S22 Plus | Negro | 128GB | | Pantalla OLED | [hoy] | Completo | Prueba
   ```

5. Crear pestaña "Hallazgos" (si no existe):
   - Headers:
   ```
   ID_Busqueda | Plataforma | Titulo | Precio | Moneda | Envio | Tiempo_Entrega | Calificacion | URL | Tipo | Timestamp
   ```

6. Agregar datos de prueba (3-5 filas):
   ```
   COT-TEST-001 | MercadoLibre | Pantalla Samsung S22+ | 1200 | MXN | Gratis | 3-5 días | 4.5 | https://... | Pieza | [hoy]
   COT-TEST-001 | Amazon | Pantalla OLED S22 Plus | 1500 | MXN | 150 | 5-7 días | 4.8 | https://... | Pieza | [hoy]
   ```

---

## Opción B: Con Apps Script

1. Abrir Google Sheet → Extensiones → Apps Script

2. Crear nueva función:

```javascript
function crearDatosPrueba() {
  const ss = SpreadsheetApp.openById('1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI');

  // Crear pestaña Búsqueda
  let sheetBusqueda = ss.getSheetByName('Búsqueda');
  if (!sheetBusqueda) {
    sheetBusqueda = ss.insertSheet('Búsqueda');
    sheetBusqueda.appendRow([
      'ID_Cotizador', 'Timestamp', 'Usuario', 'Dispositivo', 'Marca',
      'Modelo', 'Color', 'Variante1', 'Variante2', 'Pieza',
      'Fecha_Registro', 'Estado', 'Notas'
    ]);
  }

  // Agregar búsqueda de prueba
  sheetBusqueda.appendRow([
    'COT-TEST-001',
    new Date(),
    Session.getActiveUser().getEmail(),
    'Celular',
    'Samsung',
    'S22 Plus',
    'Negro',
    '128GB',
    '',
    'Pantalla OLED',
    new Date(),
    'Completo',
    'Datos de prueba'
  ]);

  // Crear pestaña Hallazgos
  let sheetHallazgos = ss.getSheetByName('Hallazgos');
  if (!sheetHallazgos) {
    sheetHallazgos = ss.insertSheet('Hallazgos');
    sheetHallazgos.appendRow([
      'ID_Busqueda', 'Plataforma', 'Titulo', 'Precio', 'Moneda',
      'Envio', 'Tiempo_Entrega', 'Calificacion', 'URL', 'Tipo', 'Timestamp'
    ]);
  }

  // Agregar hallazgos de prueba
  const hallazgos = [
    ['COT-TEST-001', 'MercadoLibre', 'Pantalla OLED Samsung S22+', 1200, 'MXN', 'Gratis', '3-5 días', '4.5', 'https://mercadolibre.com.mx', 'Pieza', new Date()],
    ['COT-TEST-001', 'Amazon', 'Pantalla Original S22 Plus', 1500, 'MXN', '150', '5-7 días', '4.8', 'https://amazon.com.mx', 'Pieza', new Date()],
    ['COT-TEST-001', 'AliExpress', 'Display OLED S22+', 800, 'MXN', '200', '15-20 días', '4.2', 'https://aliexpress.com', 'Pieza', new Date()],
    ['COT-TEST-001', 'Google Shopping', 'Samsung S22 Plus Nuevo', 15000, 'MXN', 'Gratis', '1-3 días', '5.0', 'https://google.com', 'Equipo Nuevo', new Date()],
    ['COT-TEST-001', 'MercadoLibre', 'Samsung S22 Plus Usado', 8000, 'MXN', 'Gratis', '2-4 días', '4.6', 'https://mercadolibre.com.mx', 'Equipo Usado', new Date()]
  ];

  hallazgos.forEach(row => sheetHallazgos.appendRow(row));

  Logger.log('✅ Datos de prueba creados');
}
```

3. Ejecutar función `crearDatosPrueba`
4. Autorizar permisos
5. Verificar que se crearon las pestañas y datos

---

## ✅ Verificar Datos Creados

Una vez creados los datos, probar:

```
https://script.google.com/macros/s/AKfycbxKvFWt6Cc4nMIa8CFXYCk08WaH5XOhjNyD7ERtJsjkDfpOV9ZCgjs1jt4BhLRjjqLKMg/exec?action=getUltimaBusqueda
```

Debería devolver los datos de prueba en JSON.
