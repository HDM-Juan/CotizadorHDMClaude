// google-apps-script.gs
// Google Apps Script UNIFICADO - Sistema de Cotización Hospital del Móvil v4.0
// Combina: Web App (doGet/doPost) + onChange trigger + Cache + Cotizaciones
//
// ⚠️ INSTRUCCIONES DE DESPLIEGUE:
//   1. Copia este código en el editor de Google Apps Script
//   2. Actualiza BACKEND_URL con tu URL actual (ngrok, Railway, Render, etc.)
//   3. Despliega como Web App → "Ejecutar como: yo" → "Acceso: Cualquier usuario"
//   4. Copia la nueva URL de despliegue
//   5. Actualiza WEB_APP_URL en sistema-cotizador-hibrido-3.0.html
//   6. En Triggers: agrega onChange → onChange (tipo: On change)

// ============================================
// CONFIGURACIÓN - ⚠️ ACTUALIZAR ESTAS VARIABLES
// ============================================

const SPREADSHEET_ID = '1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI';

// URL del backend Node.js (ngrok, Railway, Render, etc.)
// Ejemplo ngrok:  'https://xxxx-xxxx.ngrok-free.app'
// Ejemplo local:  'http://localhost:3000'  (solo para pruebas en mismo entorno)
const BACKEND_URL = 'REEMPLAZAR_CON_TU_URL_DE_BACKEND';

const CACHE_SHEET_NAME = 'Cache_Equipos';
const CACHE_DURACION_DIAS = 30;

// Nombres de las hojas
const SHEETS = {
  BUSQUEDA:     'Búsqueda',
  HALLAZGOS:    'Hallazgos',
  COTIZACIONES: 'Cotizaciones',
  REFERENCIAS:  'Referencias Base',
  RESPUESTAS:   'Respuestas Clientes',
  LOG:          'Log de Actividad'
};

// Estados para la hoja Búsqueda
const ESTADOS_BUSQUEDA = {
  PENDIENTE: 'Pendiente',
  BUSCANDO:  'Buscando',
  COMPLETO:  'Completo',
  ERROR:     'Error'
};

// Índices de columnas en la hoja Búsqueda (0-based)
// Estructura esperada (14 columnas):
// A:ID_Cotizador | B:Folio | C:Timestamp | D:Usuario | E:Dispositivo |
// F:Marca | G:Modelo | H:Color | I:Variante1 | J:Variante2 |
// K:Pieza | L:Fecha Registro | M:Notas | N:Estatus
const COLS = {
  ID:          0,
  FOLIO:       1,
  TIMESTAMP:   2,
  USUARIO:     3,
  DISPOSITIVO: 4,
  MARCA:       5,
  MODELO:      6,
  COLOR:       7,
  VARIANTE1:   8,
  VARIANTE2:   9,
  PIEZA:       10,
  FECHA:       11,
  NOTAS:       12,
  ESTADO:      13
};

// ============================================
// WEB APP - doGet (maneja todas las peticiones GET)
// ============================================

function doGet(e) {
  try {
    const params = e.parameter;
    const action = params.action || 'test';

    Logger.log('📥 GET action: ' + action);

    let response;

    switch (action) {
      case 'test':
        response = {
          success: true,
          message: 'Conexión exitosa con Google Apps Script',
          timestamp: new Date().toISOString(),
          version: '4.0.0'
        };
        break;

      case 'getHallazgos':
        // Llamado por el frontend: ?action=getHallazgos&id=COT-XXXX
        response = getHallazgos(params.id);
        break;

      case 'getUltimaBusqueda':
        // Llamado por el frontend para cargar la última búsqueda disponible
        response = getUltimaBusqueda();
        break;

      case 'getBusquedas':
        response = getBusquedas(params.estado);
        break;

      case 'obtenerCache':
        response = obtenerCacheAPI(params.marca, params.modelo, params.condicion);
        break;

      case 'listarCache':
        response = listarCacheAPI();
        break;

      default:
        response = { success: false, error: 'Acción no válida: ' + action };
    }

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('❌ Error en doGet: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// WEB APP - doPost (maneja todas las peticiones POST)
// ============================================

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    Logger.log('📥 POST action: ' + action);

    let result;

    switch (action) {
      // ── Cotizaciones ──────────────────────────────
      case 'saveCotizacion':
        result = guardarCotizacion(params.data);
        break;

      case 'saveReferencia':
        result = guardarReferencia(params.data);
        break;

      case 'saveResponse':
        result = guardarRespuestaCliente(params.data);
        break;

      case 'getCotizaciones':
        result = obtenerCotizaciones(params.filters);
        break;

      case 'updateEstado':
        result = actualizarEstadoCotizacion(params.folio, params.estado);
        break;

      case 'getUltimaCotizacion':
        // Mantener compatibilidad – delega a la función de búsqueda
        result = getUltimaBusqueda();
        break;

      case 'saveBusqueda':
        result = guardarBusquedaResultados(params.data);
        break;

      // ── Hallazgos (enviados por el backend Node.js) ───────────────────
      case 'saveHallazgos':
        // Llamado por backend-serpapi-bridge.js /api/guardar-hallazgos
        result = saveHallazgosFromBackend(params.data);
        break;

      // ── Caché ──────────────────────────────────────
      case 'guardarCache':
        result = guardarCacheAPI(params.marca, params.modelo, params.condicion, params.estadisticas);
        break;

      case 'invalidarCache':
        result = invalidarCacheAPI(params.marca, params.modelo, params.condicion);
        break;

      default:
        result = { success: false, message: 'Acción no reconocida: ' + action };
    }

    if (result && result.success !== undefined) {
      logActividad(action, result.success ? 'SUCCESS' : 'ERROR', result.message || '');
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('❌ Error en doPost: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error del servidor: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// TRIGGER: onChange
// Se activa cuando AppSheet escribe un nuevo registro en la hoja Búsqueda
// Configurar en: Triggers → onChange → onChange (tipo: On change)
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

    // Detectar número de columnas real de la hoja
    const totalColumnas = sheetBusqueda.getLastColumn();
    const datos = sheetBusqueda.getRange(ultimaFila, 1, 1, totalColumnas).getValues()[0];

    // Obtener índices correctos según las columnas disponibles
    const cols = _detectarColumnas(sheetBusqueda);

    const marca   = datos[cols.MARCA]   || '';
    const modelo  = datos[cols.MODELO]  || '';
    const pieza   = datos[cols.PIEZA]   || '';
    const estado  = datos[cols.ESTADO]  || '';

    if (!marca || !modelo || !pieza) {
      Logger.log('⚠️ Faltan datos requeridos (Marca, Modelo o Pieza)');
      return;
    }

    if (estado && estado !== ESTADOS_BUSQUEDA.PENDIENTE && estado !== '') {
      Logger.log('ℹ️ Estado actual: ' + estado + ' — No se procesa');
      return;
    }

    Logger.log('✅ Iniciando búsqueda: ' + marca + ' ' + modelo + ' - ' + pieza);
    _procesarBusqueda(sheetBusqueda, ultimaFila, datos, cols);

  } catch (error) {
    Logger.log('❌ Error en onChange: ' + error.toString());
  }
}

// Detecta la estructura de columnas de la hoja Búsqueda
function _detectarColumnas(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const cols = Object.assign({}, COLS); // copia los defaults

  // Mapeo flexible por nombre de encabezado
  const mapaHeaders = {
    'id_cotizador': 'ID',
    'folio':        'FOLIO',
    'timestamp':    'TIMESTAMP',
    'usuario':      'USUARIO',
    'dispositivo':  'DISPOSITIVO',
    'marca':        'MARCA',
    'modelo':       'MODELO',
    'color':        'COLOR',
    'variante1':    'VARIANTE1',
    'variante2':    'VARIANTE2',
    'pieza':        'PIEZA',
    'fecha registro': 'FECHA',
    'notas':        'NOTAS',
    'estado':       'ESTADO',
    'estatus':      'ESTADO'
  };

  headers.forEach((h, i) => {
    const key = mapaHeaders[(h + '').toLowerCase().trim()];
    if (key) cols[key] = i;
  });

  return cols;
}

// ============================================
// PROCESAR BÚSQUEDA (llamado por onChange)
// ============================================

function _procesarBusqueda(sheet, fila, datos, cols) {
  try {
    _actualizarEstadoBusqueda(sheet, fila, cols.ESTADO, ESTADOS_BUSQUEDA.BUSCANDO);

    if (BACKEND_URL === 'REEMPLAZAR_CON_TU_URL_DE_BACKEND' || !BACKEND_URL) {
      Logger.log('❌ BACKEND_URL no configurada. Actualiza la variable BACKEND_URL en el script.');
      _actualizarEstadoBusqueda(sheet, fila, cols.ESTADO, ESTADOS_BUSQUEDA.ERROR);
      return;
    }

    const payload = {
      id:          datos[cols.ID]          || '',
      dispositivo: datos[cols.DISPOSITIVO] || '',
      marca:       datos[cols.MARCA]       || '',
      modelo:      datos[cols.MODELO]      || '',
      color:       datos[cols.COLOR]       || '',
      variante1:   datos[cols.VARIANTE1]   || '',
      variante2:   datos[cols.VARIANTE2]   || '',
      pieza:       datos[cols.PIEZA]       || ''
    };

    Logger.log('📤 Enviando al backend: ' + JSON.stringify(payload));

    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: { 'ngrok-skip-browser-warning': 'true' },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(BACKEND_URL + '/api/buscar-serpapi', options);
    const code = response.getResponseCode();
    const resultado = JSON.parse(response.getContentText());

    if (code === 200 && resultado.success) {
      const data = resultado.data || resultado;

      Logger.log('✅ Búsqueda exitosa');
      Logger.log('   Piezas: ' + (data.piezas ? data.piezas.length : 0));
      Logger.log('   Equipos nuevos: ' + (data.equipos_nuevos ? data.equipos_nuevos.length : 0));
      Logger.log('   Equipos usados: ' + (data.equipos_usados ? data.equipos_usados.length : 0));

      guardarHallazgos(payload.id, data);
      _actualizarEstadoBusqueda(sheet, fila, cols.ESTADO, ESTADOS_BUSQUEDA.COMPLETO);

    } else {
      throw new Error('Error del backend: ' + code + ' - ' + (resultado.error || JSON.stringify(resultado)));
    }

  } catch (error) {
    Logger.log('❌ Error en _procesarBusqueda: ' + error.toString());
    _actualizarEstadoBusqueda(sheet, fila, cols.ESTADO, ESTADOS_BUSQUEDA.ERROR);
    // Escribir error en columna Notas
    try {
      sheet.getRange(fila, cols.NOTAS + 1).setValue('Error: ' + error.toString().substring(0, 200));
    } catch (e) {}
  }
}

function _actualizarEstadoBusqueda(sheet, fila, colEstado, nuevoEstado) {
  try {
    const col = colEstado + 1; // +1 porque getRange es 1-based
    sheet.getRange(fila, col).setValue(nuevoEstado);

    const colores = {
      [ESTADOS_BUSQUEDA.PENDIENTE]: '#fff3cd',
      [ESTADOS_BUSQUEDA.BUSCANDO]:  '#cfe2ff',
      [ESTADOS_BUSQUEDA.COMPLETO]:  '#d1e7dd',
      [ESTADOS_BUSQUEDA.ERROR]:     '#f8d7da'
    };

    if (colores[nuevoEstado]) {
      sheet.getRange(fila, col).setBackground(colores[nuevoEstado]);
    }

    Logger.log('📝 Estado Búsqueda → ' + nuevoEstado + ' (fila ' + fila + ')');
  } catch (error) {
    Logger.log('⚠️ Error actualizando estado búsqueda: ' + error.toString());
  }
}

// ============================================
// GUARDAR HALLAZGOS
// ============================================

function guardarHallazgos(idCotizador, resultado) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.HALLAZGOS);

    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.HALLAZGOS);
      sheet.appendRow([
        'ID_Busqueda', 'Plataforma', 'Titulo', 'Precio', 'Moneda',
        'Envio', 'Tiempo_Entrega', 'Calificacion', 'URL', 'Tipo', 'Timestamp'
      ]);
      const hr = sheet.getRange(1, 1, 1, 11);
      hr.setBackground('#1e40af');
      hr.setFontColor('#ffffff');
      hr.setFontWeight('bold');
    }

    const timestamp = new Date();

    const _agregarFila = function(item, tipo) {
      sheet.appendRow([
        idCotizador,
        item.plataforma     || item.platform || 'N/A',
        item.titulo         || item.title    || 'Sin título',
        item.precio         || item.price    || 0,
        item.moneda         || item.currency || 'MXN',
        item.envio          || (item.free_shipping ? 'Gratis' : 'No especificado'),
        item.tiempo_entrega || item.delivery_days || 'N/A',
        item.calificacion   || item.rating   || 'N/A',
        item.url_compra     || item.url      || '',
        tipo,
        timestamp
      ]);
    };

    if (resultado.piezas && resultado.piezas.length > 0) {
      resultado.piezas.forEach(function(p) { _agregarFila(p, 'Pieza'); });
      Logger.log('💾 Guardadas ' + resultado.piezas.length + ' piezas');
    }

    if (resultado.equipos_nuevos && resultado.equipos_nuevos.length > 0) {
      resultado.equipos_nuevos.forEach(function(eq) { _agregarFila(eq, 'Equipo Nuevo'); });
      Logger.log('💾 Guardados ' + resultado.equipos_nuevos.length + ' equipos nuevos');
    }

    if (resultado.equipos_usados && resultado.equipos_usados.length > 0) {
      resultado.equipos_usados.forEach(function(eq) { _agregarFila(eq, 'Equipo Usado'); });
      Logger.log('💾 Guardados ' + resultado.equipos_usados.length + ' equipos usados');
    }

    Logger.log('✅ Hallazgos guardados para: ' + idCotizador);
    return { success: true, message: 'Hallazgos guardados correctamente', id: idCotizador };

  } catch (error) {
    Logger.log('❌ Error guardando hallazgos: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

// Handler para cuando el backend llama directamente con saveHallazgos
function saveHallazgosFromBackend(data) {
  if (!data || !data.id_busqueda) {
    return { success: false, message: 'Faltan datos: id_busqueda requerido' };
  }
  const resultado = {
    piezas:         data.hallazgos || data.piezas || [],
    equipos_nuevos: data.equipos_nuevos || [],
    equipos_usados: data.equipos_usados || []
  };
  return guardarHallazgos(data.id_busqueda, resultado);
}

// ============================================
// OBTENER HALLAZGOS (llamado por el frontend)
// ============================================

function getHallazgos(idBusqueda) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.HALLAZGOS);

    if (!sheet) {
      return {
        success: false,
        error: 'La hoja Hallazgos no existe todavía. Espera a que se complete la primera búsqueda.'
      };
    }

    const data = sheet.getDataRange().getValues();
    const hallazgos = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Filtrar por ID si se proporcionó
      if (idBusqueda && String(row[0]) !== String(idBusqueda)) continue;

      hallazgos.push({
        id_busqueda:    row[0],
        plataforma:     row[1],
        titulo:         row[2],
        precio:         row[3],
        moneda:         row[4],
        envio:          row[5],
        tiempo_entrega: row[6],
        calificacion:   row[7],
        url:            row[8],
        tipo:           row[9],
        timestamp:      row[10]
      });
    }

    const piezas        = hallazgos.filter(function(h) { return h.tipo === 'Pieza'; });
    const equiposNuevos = hallazgos.filter(function(h) { return h.tipo === 'Equipo Nuevo'; });
    const equiposUsados = hallazgos.filter(function(h) { return h.tipo === 'Equipo Usado'; });

    return {
      success:       true,
      id_busqueda:   idBusqueda,
      total:         hallazgos.length,
      piezas:        piezas,
      equipos_nuevos: equiposNuevos,
      equipos_usados: equiposUsados,
      timestamp:     new Date().toISOString()
    };

  } catch (error) {
    Logger.log('❌ Error obteniendo hallazgos: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// ============================================
// OBTENER ÚLTIMA BÚSQUEDA (llamado por el frontend)
// ============================================

function getUltimaBusqueda() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.BUSQUEDA);

    if (!sheet) {
      return { success: false, error: 'Pestaña Búsqueda no encontrada' };
    }

    const ultimaFila = sheet.getLastRow();
    if (ultimaFila < 2) {
      return { success: false, error: 'No hay búsquedas registradas' };
    }

    const cols       = _detectarColumnas(sheet);
    const totalCols  = sheet.getLastColumn();
    const row        = sheet.getRange(ultimaFila, 1, 1, totalCols).getValues()[0];

    const busqueda = {
      id:          row[cols.ID]          || '',
      folio:       row[cols.FOLIO]       || '',
      timestamp:   row[cols.TIMESTAMP]   || '',
      usuario:     row[cols.USUARIO]     || '',
      dispositivo: row[cols.DISPOSITIVO] || '',
      marca:       row[cols.MARCA]       || '',
      modelo:      row[cols.MODELO]      || '',
      color:       row[cols.COLOR]       || '',
      variante1:   row[cols.VARIANTE1]   || '',
      variante2:   row[cols.VARIANTE2]   || '',
      pieza:       row[cols.PIEZA]       || '',
      estado:      row[cols.ESTADO]      || ''
    };

    const hallazgos = getHallazgos(busqueda.id);

    return {
      success:    true,
      busqueda:   busqueda,
      hallazgos:  hallazgos,
      timestamp:  new Date().toISOString()
    };

  } catch (error) {
    Logger.log('❌ Error en getUltimaBusqueda: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// ============================================
// OBTENER LISTA DE BÚSQUEDAS
// ============================================

function getBusquedas(filtroEstado) {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.BUSQUEDA);

    if (!sheet || sheet.getLastRow() < 2) {
      return { success: true, data: [], total: 0 };
    }

    const cols     = _detectarColumnas(sheet);
    const data     = sheet.getDataRange().getValues();
    const headers  = data[0];
    const rows     = data.slice(1);

    let busquedas = rows.map(function(row) {
      return {
        id:          row[cols.ID]          || '',
        folio:       row[cols.FOLIO]       || '',
        marca:       row[cols.MARCA]       || '',
        modelo:      row[cols.MODELO]      || '',
        pieza:       row[cols.PIEZA]       || '',
        dispositivo: row[cols.DISPOSITIVO] || '',
        estado:      row[cols.ESTADO]      || '',
        timestamp:   row[cols.TIMESTAMP]   || ''
      };
    });

    if (filtroEstado) {
      busquedas = busquedas.filter(function(b) {
        return b.estado === filtroEstado;
      });
    }

    return { success: true, data: busquedas, total: busquedas.length };

  } catch (error) {
    Logger.log('❌ Error en getBusquedas: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// ============================================
// GUARDAR COTIZACIÓN
// ============================================

function guardarCotizacion(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.COTIZACIONES);

    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.COTIZACIONES);
      sheet.appendRow([
        'Folio', 'Fecha', 'Cliente', 'Email', 'Teléfono',
        'Dispositivo', 'Marca', 'Modelo', 'Refacción', 'Num Variantes',
        'Precio Refacción', 'Mano de Obra', 'Utilidad %', 'Precio Final',
        'Notas', 'Vencimiento', 'Estado', 'Fecha Actualización'
      ]);
      const hr = sheet.getRange(1, 1, 1, 18);
      hr.setBackground('#2563eb');
      hr.setFontColor('#ffffff');
      hr.setFontWeight('bold');
    }

    const row = [
      data.folio,
      new Date(data.fecha),
      data.cliente.nombre,
      data.cliente.email     || '',
      data.cliente.telefono  || '',
      data.dispositivo.tipo,
      data.dispositivo.marca,
      data.dispositivo.modelo,
      data.dispositivo.refaccion,
      data.variantes ? data.variantes.length : 0,
      data.precios.refaccion,
      data.precios.manoObra,
      data.precios.utilidad,
      data.precios.final,
      data.notas      || '',
      data.vencimiento || '',
      data.estado     || 'Pendiente',
      new Date()
    ];

    sheet.appendRow(row);

    if (data.variantes && data.variantes.length > 0) {
      _guardarReferencias(data.folio, data.variantes);
    }

    Logger.log('✅ Cotización guardada: ' + data.folio);
    return { success: true, message: 'Cotización guardada exitosamente', folio: data.folio };

  } catch (error) {
    Logger.log('❌ Error guardando cotización: ' + error.toString());
    return { success: false, message: 'Error al guardar cotización: ' + error.toString() };
  }
}

function _guardarReferencias(folio, variantes) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.REFERENCIAS);

    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.REFERENCIAS);
      sheet.appendRow([
        'Folio Cotización', 'Número Variante', 'Plataforma',
        'Precio', 'Vendedor', 'Días Entrega', 'Fecha Registro'
      ]);
      const hr = sheet.getRange(1, 1, 1, 7);
      hr.setBackground('#10b981');
      hr.setFontColor('#ffffff');
      hr.setFontWeight('bold');
    }

    variantes.forEach(function(v, i) {
      sheet.appendRow([folio, i + 1, v.plataforma, v.precio, v.vendedor, v.entrega, new Date()]);
    });

  } catch (error) {
    Logger.log('⚠️ Error guardando referencias: ' + error.toString());
  }
}

function guardarReferencia(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.REFERENCIAS);

    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.REFERENCIAS);
      sheet.appendRow([
        'Dispositivo', 'Marca', 'Modelo', 'Refacción',
        'Plataforma', 'Precio', 'URL', 'Fecha Registro'
      ]);
      const hr = sheet.getRange(1, 1, 1, 8);
      hr.setBackground('#10b981');
      hr.setFontColor('#ffffff');
      hr.setFontWeight('bold');
    }

    sheet.appendRow([
      data.dispositivo, data.marca, data.modelo, data.refaccion,
      data.platform, data.price, data.url, new Date()
    ]);

    return { success: true, message: 'Referencia guardada exitosamente' };

  } catch (error) {
    return { success: false, message: 'Error al guardar referencia: ' + error.toString() };
  }
}

// ============================================
// GUARDAR RESULTADO DE BÚSQUEDA (desde frontend)
// ============================================

function guardarBusquedaResultados(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetName = 'Búsquedas';
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow([
        'Fecha Búsqueda', 'Folio Cotización', 'Tipo Búsqueda', 'Marca', 'Modelo',
        'Refacción', 'Plataforma', 'Precio Venta', 'Costo Envío', 'Impuestos',
        'Costo Total', 'Calificación Vendedor', 'Tiempo Entrega (días)', 'URL'
      ]);
      const hr = sheet.getRange(1, 1, 1, 14);
      hr.setBackground('#f59e0b');
      hr.setFontColor('#ffffff');
      hr.setFontWeight('bold');
    }

    (data.resultados || []).forEach(function(r) {
      sheet.appendRow([
        new Date(), data.folio, data.tipoBusqueda, data.marca, data.modelo,
        data.refaccion || '', r.plataforma, r.precioVenta, r.costoEnvio,
        r.impuestos, r.costoTotal, r.calificacionVendedor, r.tiempoEntrega, r.url
      ]);
    });

    return {
      success: true,
      message: (data.resultados ? data.resultados.length : 0) + ' resultados guardados'
    };

  } catch (error) {
    return { success: false, message: 'Error: ' + error.toString() };
  }
}

// ============================================
// RESPUESTAS DE CLIENTES
// ============================================

function guardarRespuestaCliente(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.RESPUESTAS);

    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.RESPUESTAS);
      sheet.appendRow([
        'Folio', 'Tipo Respuesta', 'Nombre Cliente',
        'Teléfono', 'Email', 'Mensaje', 'Fecha Respuesta'
      ]);
      const hr = sheet.getRange(1, 1, 1, 7);
      hr.setBackground('#8b5cf6');
      hr.setFontColor('#ffffff');
      hr.setFontWeight('bold');
    }

    sheet.appendRow([
      data.folio,
      data.responseType || 'none',
      data.nombre,
      data.telefono,
      data.email   || '',
      data.mensaje || '',
      new Date()
    ]);

    actualizarEstadoCotizacion(
      data.folio,
      data.responseType === 'accept' ? 'Aceptada' : 'Rechazada'
    );

    _enviarNotificacionEmail(data);

    return { success: true, message: 'Respuesta guardada exitosamente' };

  } catch (error) {
    return { success: false, message: 'Error al guardar respuesta: ' + error.toString() };
  }
}

// ============================================
// OBTENER Y ACTUALIZAR COTIZACIONES
// ============================================

function obtenerCotizaciones(filters) {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.COTIZACIONES);

    if (!sheet) {
      return { success: true, data: [], message: 'No hay cotizaciones registradas' };
    }

    const data    = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows    = data.slice(1);

    let cotizaciones = rows.map(function(row) {
      const obj = {};
      headers.forEach(function(h, i) { obj[h] = row[i]; });
      return obj;
    });

    if (filters) {
      if (filters.estado) {
        cotizaciones = cotizaciones.filter(function(c) { return c['Estado'] === filters.estado; });
      }
      if (filters.cliente) {
        cotizaciones = cotizaciones.filter(function(c) {
          return (c['Cliente'] + '').toLowerCase().includes(filters.cliente.toLowerCase());
        });
      }
      if (filters.fechaDesde) {
        const desde = new Date(filters.fechaDesde);
        cotizaciones = cotizaciones.filter(function(c) { return new Date(c['Fecha']) >= desde; });
      }
    }

    return { success: true, data: cotizaciones, total: cotizaciones.length };

  } catch (error) {
    return { success: false, message: 'Error al obtener cotizaciones: ' + error.toString() };
  }
}

// Actualiza el estado de una cotización (por folio)
function actualizarEstadoCotizacion(folio, nuevoEstado) {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.COTIZACIONES);

    if (!sheet) {
      return { success: false, message: 'Hoja de cotizaciones no encontrada' };
    }

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === folio) {
        sheet.getRange(i + 1, 17).setValue(nuevoEstado);
        sheet.getRange(i + 1, 18).setValue(new Date());
        Logger.log('✅ Estado cotización actualizado: ' + folio + ' → ' + nuevoEstado);
        return { success: true, message: 'Estado actualizado exitosamente' };
      }
    }

    return { success: false, message: 'Folio no encontrado: ' + folio };

  } catch (error) {
    return { success: false, message: 'Error al actualizar estado: ' + error.toString() };
  }
}

// ============================================
// LOG DE ACTIVIDAD
// ============================================

function logActividad(accion, resultado, mensaje) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.LOG);

    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.LOG);
      sheet.appendRow(['Timestamp', 'Acción', 'Resultado', 'Mensaje']);
      const hr = sheet.getRange(1, 1, 1, 4);
      hr.setBackground('#6b7280');
      hr.setFontColor('#ffffff');
      hr.setFontWeight('bold');
    }

    sheet.appendRow([new Date(), accion, resultado, mensaje]);

    // Mantener solo los últimos 1000 registros
    if (sheet.getLastRow() > 1001) {
      sheet.deleteRow(2);
    }

  } catch (error) {
    Logger.log('⚠️ Error en log: ' + error.toString());
  }
}

// ============================================
// EMAIL DE NOTIFICACIÓN
// ============================================

function _enviarNotificacionEmail(data) {
  try {
    const emailDestino = 'tu-email@hospitaldelmovil.com'; // ⚠️ Actualizar

    MailApp.sendEmail(
      emailDestino,
      'Nueva Respuesta - Cotización ' + data.folio,
      'Tipo: ' + (data.responseType === 'accept' ? 'ACEPTADA' : 'RECHAZADA') +
      '\nCliente: ' + data.nombre +
      '\nTeléfono: ' + data.telefono +
      '\nEmail: ' + (data.email || 'No proporcionado') +
      '\nMensaje: ' + (data.mensaje || 'Sin mensaje')
    );

    Logger.log('✅ Email enviado');
  } catch (error) {
    Logger.log('⚠️ Error enviando email: ' + error.toString());
  }
}

// ============================================
// FUNCIONES DE CACHÉ (Google Sheets como BD)
// ============================================

function crearPestanaCache() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (ss.getSheetByName(CACHE_SHEET_NAME)) return;

    const sheet = ss.insertSheet(CACHE_SHEET_NAME);
    sheet.getRange(1, 1, 1, 9).setValues([[
      'Marca', 'Modelo', 'Condicion',
      'Precio_Minimo', 'Precio_Promedio', 'Precio_Maximo',
      'Cantidad', 'Fecha_Creacion', 'Fecha_Expiracion'
    ]]);
    const hr = sheet.getRange(1, 1, 1, 9);
    hr.setFontWeight('bold');
    hr.setBackground('#34a853');
    hr.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    Logger.log('✅ Pestaña Cache_Equipos creada');
  } catch (error) {
    Logger.log('❌ Error creando caché: ' + error.toString());
  }
}

function _obtenerCacheEquipo(marca, modelo, condicion) {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CACHE_SHEET_NAME);
    if (!sheet) return null;

    const data = sheet.getDataRange().getValues();
    const ahora = new Date();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if ((row[0] + '').toLowerCase() === marca.toLowerCase() &&
          (row[1] + '').toLowerCase() === modelo.toLowerCase() &&
          (row[2] + '').toLowerCase() === condicion.toLowerCase()) {

        const expiracion = new Date(row[8]);
        if (ahora > expiracion) {
          Logger.log('⏰ Cache expirado para ' + marca + ' ' + modelo);
          return null;
        }
        return { minimo: row[3], promedio: row[4], maximo: row[5], cantidad: row[6],
                 fecha_creacion: row[7], fecha_expiracion: row[8] };
      }
    }
    return null;
  } catch (error) {
    Logger.log('❌ Error obteniendo cache: ' + error.toString());
    return null;
  }
}

function _guardarCacheEquipo(marca, modelo, condicion, estadisticas) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(CACHE_SHEET_NAME);
    if (!sheet) { crearPestanaCache(); sheet = ss.getSheetByName(CACHE_SHEET_NAME); }

    const ahora      = new Date();
    const expiracion = new Date(ahora.getTime() + CACHE_DURACION_DIAS * 24 * 60 * 60 * 1000);
    const data       = sheet.getDataRange().getValues();
    let filaExistente = -1;

    for (let i = 1; i < data.length; i++) {
      if ((data[i][0] + '').toLowerCase() === marca.toLowerCase() &&
          (data[i][1] + '').toLowerCase() === modelo.toLowerCase() &&
          (data[i][2] + '').toLowerCase() === condicion.toLowerCase()) {
        filaExistente = i + 1;
        break;
      }
    }

    const nuevaFila = [
      marca, modelo, condicion,
      estadisticas.minimo   || estadisticas.precio_minimo   || 0,
      estadisticas.promedio || estadisticas.precio_promedio || 0,
      estadisticas.maximo   || estadisticas.precio_maximo   || 0,
      estadisticas.cantidad || 0,
      ahora, expiracion
    ];

    if (filaExistente > 0) {
      sheet.getRange(filaExistente, 1, 1, 9).setValues([nuevaFila]);
      Logger.log('♻️ Cache actualizado: ' + marca + ' ' + modelo);
    } else {
      sheet.appendRow(nuevaFila);
      Logger.log('💾 Cache guardado: ' + marca + ' ' + modelo);
    }
  } catch (error) {
    Logger.log('❌ Error guardando cache: ' + error.toString());
  }
}

function obtenerCacheAPI(marca, modelo, condicion) {
  if (!marca || !modelo || !condicion) {
    return { success: false, error: 'Faltan parámetros: marca, modelo, condicion' };
  }
  const cached = _obtenerCacheEquipo(marca, modelo, condicion);
  return cached
    ? { success: true, cached: true,  data: cached }
    : { success: true, cached: false, data: null   };
}

function guardarCacheAPI(marca, modelo, condicion, estadisticas) {
  if (!marca || !modelo || !condicion || !estadisticas) {
    return { success: false, error: 'Faltan parámetros requeridos' };
  }
  _guardarCacheEquipo(marca, modelo, condicion, estadisticas);
  return { success: true, message: 'Cache guardado correctamente' };
}

function listarCacheAPI() {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CACHE_SHEET_NAME);
    if (!sheet) return { success: false, error: 'Pestaña Cache_Equipos no existe' };

    const data  = sheet.getDataRange().getValues();
    const cache = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      cache.push({
        marca:           row[0],
        modelo:          row[1],
        condicion:       row[2],
        precio_minimo:   row[3],
        precio_promedio: row[4],
        precio_maximo:   row[5],
        cantidad:        row[6],
        fecha_creacion:  row[7],
        fecha_expiracion: row[8]
      });
    }

    return { success: true, total: cache.length, cache: cache };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function invalidarCacheAPI(marca, modelo, condicion) {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CACHE_SHEET_NAME);
    if (!sheet) return { success: false, error: 'Pestaña Cache_Equipos no existe' };

    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if ((data[i][0] + '').toLowerCase() === marca.toLowerCase() &&
          (data[i][1] + '').toLowerCase() === modelo.toLowerCase() &&
          (data[i][2] + '').toLowerCase() === condicion.toLowerCase()) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Cache invalidado correctamente' };
      }
    }
    return { success: false, error: 'No se encontró entrada en cache' };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ============================================
// UTILIDADES
// ============================================

function inicializarHojas() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Object.values(SHEETS).forEach(function(nombre) {
    if (!ss.getSheetByName(nombre)) {
      ss.insertSheet(nombre);
      Logger.log('✅ Hoja creada: ' + nombre);
    }
  });
  Logger.log('✅ Inicialización completada');
}

function limpiarLogsAntiguos() {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.LOG);
    if (sheet && sheet.getLastRow() > 1001) {
      sheet.deleteRows(2, sheet.getLastRow() - 1000);
    }
  } catch (error) {
    Logger.log('⚠️ Error limpiando logs: ' + error.toString());
  }
}

// ============================================
// PRUEBA RÁPIDA (ejecutar manualmente en el editor)
// ============================================

function testConexion() {
  Logger.log('=== TEST DE CONEXIÓN ===');
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log('Spreadsheet: ' + ss.getName());
  Logger.log('Hojas: ' + ss.getSheets().map(function(s) { return s.getName(); }).join(', '));

  const ultimaBusqueda = getUltimaBusqueda();
  Logger.log('Última búsqueda: ' + JSON.stringify(ultimaBusqueda));

  Logger.log('BACKEND_URL configurada: ' + (BACKEND_URL !== 'REEMPLAZAR_CON_TU_URL_DE_BACKEND'));
}
