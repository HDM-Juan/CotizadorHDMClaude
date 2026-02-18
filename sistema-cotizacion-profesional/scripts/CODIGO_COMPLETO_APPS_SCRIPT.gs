// ============================================
// GOOGLE APPS SCRIPT - CÓDIGO COMPLETO
// Sistema de Cotización Hospital del Móvil
// Incluye: onChange, Web App, Cache
// ============================================

// ⚠️ CONFIGURACIÓN - ACTUALIZAR ESTAS VARIABLES
const SPREADSHEET_ID = '1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI';
const BACKEND_URL = 'https://unadmonitory-insupportable-keyla.ngrok-free.dev';
const CACHE_SHEET_NAME = 'Cache_Equipos';
const CACHE_DURACION_DIAS = 30;

// Nombres de pestañas
const SHEETS = {
  BUSQUEDA: 'Búsqueda',
  HALLAZGOS: 'Hallazgos'
};

// Estados posibles
const ESTADOS = {
  PENDIENTE: 'Pendiente',
  BUSCANDO: 'Buscando',
  COMPLETO: 'Completo',
  ERROR: 'Error'
};

// Índices de columnas (0-based)
const COLS = {
  ID: 0,          // A: Búsqueda_ID
  FOLIO: 1,       // B: Folio Busqueda
  TIMESTAMP: 2,   // C: Timestamp
  USUARIO: 3,     // D: Usuario
  DISPOSITIVO: 4, // E: Dispositivo
  MARCA: 5,       // F: Marca
  MODELO: 6,      // G: Modelo
  COLOR: 7,       // H: Color
  VARIANTE1: 8,   // I: Variante1
  VARIANTE2: 9,   // J: Variante2
  PIEZA: 10,      // K: Pieza
  FECHA: 11,      // L: Fecha Registro
  NOTAS: 12,      // M: Notas
  ESTADO: 13      // N: Estatus
};

// ============================================
// TRIGGER: onChange
// ============================================

function onChange(e) {
  try {
    Logger.log('📥 Trigger onChange ejecutado');

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetBusqueda = ss.getSheetByName(SHEETS.BUSQUEDA);

    if (!sheetBusqueda) {
      Logger.log('⚠️ Pestaña Búsqueda no encontrada');
      return;
    }

    const ultimaFila = sheetBusqueda.getLastRow();

    if (ultimaFila < 2) {
      Logger.log('⚠️ No hay datos para procesar');
      return;
    }

    Logger.log(`📋 Procesando última fila: ${ultimaFila}`);

    const datos = sheetBusqueda.getRange(ultimaFila, 1, 1, 14).getValues()[0];

    if (!datos[COLS.MARCA] || !datos[COLS.MODELO] || !datos[COLS.PIEZA]) {
      Logger.log('⚠️ Faltan datos requeridos (Marca, Modelo o Pieza)');
      return;
    }

    const estadoActual = datos[COLS.ESTADO];

    if (estadoActual && estadoActual !== ESTADOS.PENDIENTE && estadoActual !== '') {
      Logger.log(`ℹ️ Estado actual: ${estadoActual} - No se procesa`);
      return;
    }

    Logger.log(`✅ Iniciando búsqueda para: ${datos[COLS.MARCA]} ${datos[COLS.MODELO]} - ${datos[COLS.PIEZA]}`);

    procesarBusqueda(sheetBusqueda, ultimaFila, datos);

  } catch (error) {
    Logger.log('❌ Error en onChange: ' + error.toString());
  }
}

// ============================================
// PROCESAR BÚSQUEDA
// ============================================

function procesarBusqueda(sheet, fila, datos) {
  try {
    actualizarEstado(sheet, fila, ESTADOS.BUSCANDO);

    const payload = {
      id: datos[COLS.ID],
      dispositivo: datos[COLS.DISPOSITIVO],
      marca: datos[COLS.MARCA],
      modelo: datos[COLS.MODELO],
      color: datos[COLS.COLOR],
      variante1: datos[COLS.VARIANTE1],
      variante2: datos[COLS.VARIANTE2],
      pieza: datos[COLS.PIEZA]
    };

    Logger.log('📤 Enviando al backend:');
    Logger.log(JSON.stringify(payload, null, 2));

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(BACKEND_URL + '/api/buscar-serpapi', options);
    const code = response.getResponseCode();
    const resultado = JSON.parse(response.getContentText());

    if (code === 200) {
      const data = resultado.data || resultado;

      Logger.log('✅ Búsqueda exitosa');
      Logger.log(`   Piezas encontradas: ${data.piezas?.length || 0}`);
      Logger.log(`   Equipos nuevos: ${data.equipos_nuevos?.length || 0}`);
      Logger.log(`   Equipos usados: ${data.equipos_usados?.length || 0}`);

      guardarHallazgos(datos[COLS.ID], data);
      actualizarEstado(sheet, fila, ESTADOS.COMPLETO);

    } else {
      throw new Error(`Error del backend: ${code} - ${resultado.error || 'Unknown'}`);
    }

  } catch (error) {
    Logger.log('❌ Error en procesarBusqueda: ' + error.toString());
    actualizarEstado(sheet, fila, ESTADOS.ERROR);
    sheet.getRange(fila, COLS.NOTAS + 1).setValue(`Error: ${error.toString()}`);
    throw error;
  }
}

// ============================================
// ACTUALIZAR ESTADO
// ============================================

function actualizarEstado(sheet, fila, nuevoEstado) {
  try {
    const columnaEstado = COLS.ESTADO + 1;
    sheet.getRange(fila, columnaEstado).setValue(nuevoEstado);
    Logger.log(`📝 Estado actualizado: ${nuevoEstado} (fila ${fila})`);

    const cell = sheet.getRange(fila, columnaEstado);
    switch (nuevoEstado) {
      case ESTADOS.PENDIENTE:
        cell.setBackground('#fff3cd');
        break;
      case ESTADOS.BUSCANDO:
        cell.setBackground('#cfe2ff');
        break;
      case ESTADOS.COMPLETO:
        cell.setBackground('#d1e7dd');
        break;
      case ESTADOS.ERROR:
        cell.setBackground('#f8d7da');
        break;
    }
  } catch (error) {
    Logger.log('⚠️ Error actualizando estado: ' + error.toString());
  }
}

// ============================================
// GUARDAR HALLAZGOS
// ============================================

function guardarHallazgos(idCotizador, resultado) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheetHallazgos = ss.getSheetByName(SHEETS.HALLAZGOS);

    if (!sheetHallazgos) {
      sheetHallazgos = ss.insertSheet(SHEETS.HALLAZGOS);
      sheetHallazgos.appendRow([
        'ID_Busqueda',
        'Plataforma',
        'Titulo',
        'Precio',
        'Moneda',
        'Envio',
        'Tiempo_Entrega',
        'Calificacion',
        'URL',
        'Tipo',
        'Timestamp'
      ]);
    }

    const timestamp = new Date();

    if (resultado.piezas && resultado.piezas.length > 0) {
      resultado.piezas.forEach(pieza => {
        sheetHallazgos.appendRow([
          idCotizador,
          pieza.plataforma || 'N/A',
          pieza.titulo || 'Sin título',
          pieza.precio || 0,
          pieza.moneda || 'MXN',
          pieza.envio || 'No especificado',
          pieza.tiempo_entrega || 'N/A',
          pieza.calificacion || 'N/A',
          pieza.url || '',
          'Pieza',
          timestamp
        ]);
      });
      Logger.log(`💾 Guardadas ${resultado.piezas.length} piezas`);
    }

    if (resultado.equipos_nuevos && resultado.equipos_nuevos.length > 0) {
      resultado.equipos_nuevos.forEach(equipo => {
        sheetHallazgos.appendRow([
          idCotizador,
          equipo.plataforma || 'N/A',
          equipo.titulo || 'Sin título',
          equipo.precio || 0,
          equipo.moneda || 'MXN',
          equipo.envio || 'No especificado',
          equipo.tiempo_entrega || 'N/A',
          equipo.calificacion || 'N/A',
          equipo.url || '',
          'Equipo Nuevo',
          timestamp
        ]);
      });
      Logger.log(`💾 Guardados ${resultado.equipos_nuevos.length} equipos nuevos`);
    }

    Logger.log('✅ Hallazgos guardados correctamente');

  } catch (error) {
    Logger.log('❌ Error guardando hallazgos: ' + error.toString());
    throw error;
  }
}

// ============================================
// WEB APP - doGet
// ============================================

function doGet(e) {
  try {
    const params = e.parameter;
    const action = params.action || 'getHallazgos';

    let response;

    switch(action) {
      case 'getHallazgos':
        response = getHallazgos(params.id);
        break;
      case 'getBusquedas':
        response = getBusquedas();
        break;
      case 'getUltimaBusqueda':
        response = getUltimaBusqueda();
        break;
      case 'obtenerCache':
        response = obtenerCacheAPI(params.marca, params.modelo, params.condicion);
        break;
      case 'listarCache':
        response = listarCacheAPI();
        break;
      default:
        response = { error: 'Acción no válida' };
    }

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// WEB APP - doPost
// ============================================

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    let response;

    switch(action) {
      case 'guardarCache':
        response = guardarCacheAPI(params.marca, params.modelo, params.condicion, params.estadisticas);
        break;
      case 'invalidarCache':
        response = invalidarCacheAPI(params.marca, params.modelo, params.condicion);
        break;
      default:
        response = { error: 'Acción no válida' };
    }

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// OBTENER HALLAZGOS
// ============================================

function getHallazgos(idBusqueda) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetHallazgos = ss.getSheetByName('Hallazgos');

    if (!sheetHallazgos) {
      return { error: 'Pestaña Hallazgos no encontrada' };
    }

    const data = sheetHallazgos.getDataRange().getValues();
    let hallazgos = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      if (idBusqueda && row[0] !== idBusqueda) {
        continue;
      }

      const hallazgo = {
        id_busqueda: row[0],
        plataforma: row[1],
        titulo: row[2],
        precio: row[3],
        moneda: row[4],
        envio: row[5],
        tiempo_entrega: row[6],
        calificacion: row[7],
        url: row[8],
        tipo: row[9],
        timestamp: row[10]
      };

      hallazgos.push(hallazgo);
    }

    const piezas = hallazgos.filter(h => h.tipo === 'Pieza');
    const equiposNuevos = hallazgos.filter(h => h.tipo === 'Equipo Nuevo');
    const equiposUsados = hallazgos.filter(h => h.tipo === 'Equipo Usado');

    return {
      success: true,
      id_busqueda: idBusqueda,
      total: hallazgos.length,
      piezas: piezas,
      equipos_nuevos: equiposNuevos,
      equipos_usados: equiposUsados,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================
// OBTENER ÚLTIMA BÚSQUEDA
// ============================================

function getUltimaBusqueda() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetBusqueda = ss.getSheetByName('Búsqueda');

    if (!sheetBusqueda) {
      return { error: 'Pestaña Búsqueda no encontrada' };
    }

    const ultimaFila = sheetBusqueda.getLastRow();

    if (ultimaFila < 2) {
      return { error: 'No hay búsquedas' };
    }

    const row = sheetBusqueda.getRange(ultimaFila, 1, 1, 14).getValues()[0];

    const busqueda = {
      id: row[0],
      folio: row[1],
      timestamp: row[2],
      usuario: row[3],
      dispositivo: row[4],
      marca: row[5],
      modelo: row[6],
      color: row[7],
      variante1: row[8],
      variante2: row[9],
      pieza: row[10],
      fecha: row[11],
      notas: row[12],
      estado: row[13]
    };

    const hallazgos = getHallazgos(busqueda.id);

    return {
      success: true,
      busqueda: busqueda,
      hallazgos: hallazgos,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================
// FUNCIONES DE CACHE
// ============================================

function crearPestanaCache() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(CACHE_SHEET_NAME);
    
    if (sheet) {
      Logger.log('⚠️ Pestaña Cache_Equipos ya existe');
      return;
    }

    sheet = ss.insertSheet(CACHE_SHEET_NAME);

    sheet.getRange(1, 1, 1, 10).setValues([[
      'Marca',
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

    const headerRange = sheet.getRange(1, 1, 1, 10);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#34a853');
    headerRange.setFontColor('#ffffff');

    sheet.getRange('J2').setFormulaR1C1('=IF(R[0]C[-2]="","",DAYS(R[0]C[-1],TODAY()))');
    sheet.autoResizeColumns(1, 10);
    sheet.setFrozenRows(1);

    Logger.log('✅ Pestaña Cache_Equipos creada');

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
  }
}

function obtenerCacheEquipo(marca, modelo, condicion) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CACHE_SHEET_NAME);

    if (!sheet) {
      Logger.log('⚠️ Pestaña Cache_Equipos no existe');
      return null;
    }

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      if (row[0].toLowerCase() === marca.toLowerCase() &&
          row[1].toLowerCase() === modelo.toLowerCase() &&
          row[2].toLowerCase() === condicion.toLowerCase()) {

        const fechaExpiracion = new Date(row[8]);
        const ahora = new Date();

        if (ahora > fechaExpiracion) {
          Logger.log(`⏰ Cache expirado para ${marca} ${modelo} (${condicion})`);
          return null;
        }

        return {
          minimo: row[3],
          promedio: row[4],
          maximo: row[5],
          cantidad: row[6],
          fecha_creacion: row[7],
          fecha_expiracion: row[8]
        };
      }
    }

    return null;

  } catch (error) {
    Logger.log('❌ Error obteniendo cache: ' + error.toString());
    return null;
  }
}

function guardarCacheEquipo(marca, modelo, condicion, estadisticas) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(CACHE_SHEET_NAME);

    if (!sheet) {
      crearPestanaCache();
      sheet = ss.getSheetByName(CACHE_SHEET_NAME);
    }

    const ahora = new Date();
    const expiracion = new Date(ahora.getTime() + (CACHE_DURACION_DIAS * 24 * 60 * 60 * 1000));

    const data = sheet.getDataRange().getValues();
    let filaExistente = -1;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toLowerCase() === marca.toLowerCase() &&
          data[i][1].toLowerCase() === modelo.toLowerCase() &&
          data[i][2].toLowerCase() === condicion.toLowerCase()) {
        filaExistente = i + 1;
        break;
      }
    }

    const nuevaFila = [
      marca,
      modelo,
      condicion,
      estadisticas.minimo || 0,
      estadisticas.promedio || 0,
      estadisticas.maximo || 0,
      estadisticas.cantidad || 0,
      ahora,
      expiracion,
      ''
    ];

    if (filaExistente > 0) {
      sheet.getRange(filaExistente, 1, 1, 9).setValues([nuevaFila.slice(0, 9)]);
      Logger.log(`♻️ Cache actualizado: ${marca} ${modelo} (${condicion})`);
    } else {
      sheet.appendRow(nuevaFila.slice(0, 9));
      const ultimaFila = sheet.getLastRow();
      sheet.getRange(ultimaFila, 10).setFormulaR1C1('=IF(R[0]C[-2]="","",DAYS(R[0]C[-1],TODAY()))');
      Logger.log(`💾 Cache guardado: ${marca} ${modelo} (${condicion})`);
    }

  } catch (error) {
    Logger.log('❌ Error guardando cache: ' + error.toString());
  }
}

function obtenerCacheAPI(marca, modelo, condicion) {
  try {
    if (!marca || !modelo || !condicion) {
      return { success: false, error: 'Faltan parámetros: marca, modelo, condicion' };
    }

    const cached = obtenerCacheEquipo(marca, modelo, condicion);

    if (cached) {
      return { success: true, cached: true, data: cached };
    } else {
      return { success: true, cached: false, data: null };
    }
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function guardarCacheAPI(marca, modelo, condicion, estadisticas) {
  try {
    if (!marca || !modelo || !condicion || !estadisticas) {
      return { success: false, error: 'Faltan parámetros requeridos' };
    }

    guardarCacheEquipo(marca, modelo, condicion, estadisticas);
    return { success: true, message: 'Cache guardado correctamente' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function listarCacheAPI() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Cache_Equipos');

    if (!sheet) {
      return { success: false, error: 'Pestaña Cache_Equipos no existe' };
    }

    const data = sheet.getDataRange().getValues();
    const cache = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      cache.push({
        marca: row[0],
        modelo: row[1],
        condicion: row[2],
        precio_minimo: row[3],
        precio_promedio: row[4],
        precio_maximo: row[5],
        cantidad: row[6],
        fecha_creacion: row[7],
        fecha_expiracion: row[8],
        dias_restantes: row[9]
      });
    }

    return { success: true, total: cache.length, cache: cache };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function invalidarCacheAPI(marca, modelo, condicion) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Cache_Equipos');

    if (!sheet) {
      return { success: false, error: 'Pestaña Cache_Equipos no existe' };
    }

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toLowerCase() === marca.toLowerCase() &&
          data[i][1].toLowerCase() === modelo.toLowerCase() &&
          data[i][2].toLowerCase() === condicion.toLowerCase()) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Cache invalidado correctamente' };
      }
    }

    return { success: false, error: 'No se encontró entrada en cache' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}
