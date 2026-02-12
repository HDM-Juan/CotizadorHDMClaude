// ============================================
// GOOGLE APPS SCRIPT - CACHÉ DE EQUIPOS
// Sistema de caché en Google Sheets
// ============================================

// ⚠️ CONFIGURACIÓN
const SPREADSHEET_ID = '1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI';
const CACHE_SHEET_NAME = 'Cache_Equipos';
const CACHE_DURACION_DIAS = 30;

// ============================================
// CREAR PESTAÑA DE CACHÉ (ejecutar una vez)
// ============================================

function crearPestanaCache() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Verificar si ya existe
    let sheet = ss.getSheetByName(CACHE_SHEET_NAME);
    if (sheet) {
      Logger.log('⚠️ Pestaña Cache_Equipos ya existe');
      return;
    }
    
    // Crear nueva pestaña
    sheet = ss.insertSheet(CACHE_SHEET_NAME);
    
    // Headers
    sheet.getRange(1, 1, 1, 9).setValues([[
      'Modelo',
      'Condicion',
      'Precio_Minimo',
      'Precio_Promedio',
      'Precio_Maximo',
      'Cantidad',
      'Fecha_Creacion',
      'Fecha_Expiracion',
      'Dias_Restantes'
    ]]);
    
    // Formato header
    const headerRange = sheet.getRange(1, 1, 1, 9);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#34a853');
    headerRange.setFontColor('#ffffff');
    
    // Fórmula para Dias_Restantes en I2
    sheet.getRange('I2').setFormulaR1C1('=IF(R[0]C[-2]="","",DAYS(R[0]C[-1],TODAY()))');
    
    // Auto-resize
    sheet.autoResizeColumns(1, 9);
    
    // Congelar header
    sheet.setFrozenRows(1);
    
    Logger.log('✅ Pestaña Cache_Equipos creada');
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
  }
}

// ============================================
// OBTENER CACHÉ DE EQUIPO
// ============================================

function obtenerCacheEquipo(modelo, condicion) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CACHE_SHEET_NAME);
    
    if (!sheet) {
      Logger.log('⚠️ Pestaña Cache_Equipos no existe');
      return null;
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Buscar entrada
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      if (row[0].toLowerCase() === modelo.toLowerCase() && 
          row[1].toLowerCase() === condicion.toLowerCase()) {
        
        const fechaExpiracion = new Date(row[7]);
        const ahora = new Date();
        
        // Verificar si expiró
        if (ahora > fechaExpiracion) {
          Logger.log(`⏰ Cache expirado para ${modelo} (${condicion})`);
          return null;
        }
        
        // Retornar estadísticas
        return {
          minimo: row[2],
          promedio: row[3],
          maximo: row[4],
          cantidad: row[5],
          fecha_creacion: row[6],
          fecha_expiracion: row[7]
        };
      }
    }
    
    return null;
    
  } catch (error) {
    Logger.log('❌ Error obteniendo cache: ' + error.toString());
    return null;
  }
}

// ============================================
// GUARDAR CACHÉ DE EQUIPO
// ============================================

function guardarCacheEquipo(modelo, condicion, estadisticas) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(CACHE_SHEET_NAME);
    
    // Crear pestaña si no existe
    if (!sheet) {
      crearPestanaCache();
      sheet = ss.getSheetByName(CACHE_SHEET_NAME);
    }
    
    const ahora = new Date();
    const expiracion = new Date(ahora.getTime() + (CACHE_DURACION_DIAS * 24 * 60 * 60 * 1000));
    
    const data = sheet.getDataRange().getValues();
    let filaExistente = -1;
    
    // Buscar si ya existe
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toLowerCase() === modelo.toLowerCase() && 
          data[i][1].toLowerCase() === condicion.toLowerCase()) {
        filaExistente = i + 1;
        break;
      }
    }
    
    const nuevaFila = [
      modelo,
      condicion,
      estadisticas.minimo || 0,
      estadisticas.promedio || 0,
      estadisticas.maximo || 0,
      estadisticas.cantidad || 0,
      ahora,
      expiracion,
      '' // Dias_Restantes (calculado por fórmula)
    ];
    
    if (filaExistente > 0) {
      // Actualizar fila existente
      sheet.getRange(filaExistente, 1, 1, 8).setValues([nuevaFila.slice(0, 8)]);
      Logger.log(`♻️ Cache actualizado: ${modelo} (${condicion})`);
    } else {
      // Agregar nueva fila
      sheet.appendRow(nuevaFila.slice(0, 8));
      
      // Copiar fórmula de Dias_Restantes
      const ultimaFila = sheet.getLastRow();
      sheet.getRange(ultimaFila, 9).setFormulaR1C1('=IF(R[0]C[-2]="","",DAYS(R[0]C[-1],TODAY()))');
      
      Logger.log(`💾 Cache guardado: ${modelo} (${condicion})`);
    }
    
  } catch (error) {
    Logger.log('❌ Error guardando cache: ' + error.toString());
  }
}

// ============================================
// LIMPIAR CACHE EXPIRADO
// ============================================

function limpiarCacheExpirado() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CACHE_SHEET_NAME);
    
    if (!sheet) {
      Logger.log('⚠️ Pestaña Cache_Equipos no existe');
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    const ahora = new Date();
    let eliminados = 0;
    
    // Recorrer de abajo hacia arriba para no afectar índices
    for (let i = data.length - 1; i > 0; i--) {
      const fechaExpiracion = new Date(data[i][7]);
      
      if (ahora > fechaExpiracion) {
        sheet.deleteRow(i + 1);
        eliminados++;
      }
    }
    
    Logger.log(`🗑️ ${eliminados} entradas expiradas eliminadas`);
    
  } catch (error) {
    Logger.log('❌ Error limpiando cache: ' + error.toString());
  }
}

// ============================================
// FUNCIÓN DE PRUEBA
// ============================================

function testCache() {
  // 1. Crear pestaña
  crearPestanaCache();
  
  // 2. Guardar datos de prueba
  guardarCacheEquipo('Samsung S22 Plus', 'nuevo', {
    minimo: 12000,
    promedio: 15000,
    maximo: 18000,
    cantidad: 15
  });
  
  guardarCacheEquipo('Samsung S22 Plus', 'usado', {
    minimo: 8000,
    promedio: 10000,
    maximo: 12000,
    cantidad: 12
  });
  
  // 3. Recuperar datos
  const cached = obtenerCacheEquipo('Samsung S22 Plus', 'nuevo');
  Logger.log('📊 Datos recuperados:');
  Logger.log(JSON.stringify(cached, null, 2));
}
