// ============================================
// GOOGLE APPS SCRIPT - WEB APP
// Expone datos de hallazgos para el frontend
// ============================================

const SPREADSHEET_ID = '1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI';

// ============================================
// WEB APP - Endpoint GET
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
// OBTENER HALLAZGOS POR ID
// ============================================

function getHallazgos(idBusqueda) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetHallazgos = ss.getSheetByName('Hallazgos');

    if (!sheetHallazgos) {
      return { error: 'Pestaña Hallazgos no encontrada' };
    }

    const data = sheetHallazgos.getDataRange().getValues();
    const headers = data[0];

    // Si no se especifica ID, devolver todos
    let hallazgos = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Si se especifica ID, filtrar
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

    // Separar por tipo
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
// OBTENER TODAS LAS BÚSQUEDAS
// ============================================

function getBusquedas() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetBusqueda = ss.getSheetByName('Búsqueda');

    if (!sheetBusqueda) {
      return { error: 'Pestaña Búsqueda no encontrada' };
    }

    const data = sheetBusqueda.getDataRange().getValues();
    const busquedas = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      busquedas.push({
        id: row[0],
        timestamp: row[1],
        usuario: row[2],
        dispositivo: row[3],
        marca: row[4],
        modelo: row[5],
        color: row[6],
        variante1: row[7],
        variante2: row[8],
        pieza: row[9],
        fecha: row[10],
        estado: row[11],
        notas: row[12]
      });
    }

    return {
      success: true,
      total: busquedas.length,
      busquedas: busquedas,
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

    const row = sheetBusqueda.getRange(ultimaFila, 1, 1, 13).getValues()[0];

    const busqueda = {
      id: row[0],
      timestamp: row[1],
      usuario: row[2],
      dispositivo: row[3],
      marca: row[4],
      modelo: row[5],
      color: row[6],
      variante1: row[7],
      variante2: row[8],
      pieza: row[9],
      fecha: row[10],
      estado: row[11],
      notas: row[12]
    };

    // Obtener hallazgos de esta búsqueda
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
// WEB APP - Endpoint POST
// ============================================

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const data = body.data;

    let response;

    switch(action) {
      case 'saveCotizacion':
        response = saveCotizacion(data);
        break;
      case 'saveRespuesta':
        response = saveRespuesta(data);
        break;
      default:
        response = { success: false, error: 'Accion no valida: ' + action };
    }

    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// GUARDAR COTIZACION
// ============================================

function saveCotizacion(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('Cotizaciones');

    // Crear pestana si no existe
    if (!sheet) {
      sheet = ss.insertSheet('Cotizaciones');
      sheet.appendRow([
        'Folio',
        'Fecha',
        'Cliente_Nombre',
        'Cliente_Telefono',
        'Cliente_Email',
        'Dispositivo',
        'Marca',
        'Modelo',
        'Pieza',
        'Variante',
        'Tipo_Variante',
        'Precio_Venta',
        'Tiempo_Entrega',
        'Garantia',
        'Notas',
        'Referencias',
        'Estado'
      ]);

      // Formato header
      const headerRange = sheet.getRange(1, 1, 1, 17);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
    }

    // Agregar fila con datos de la cotizacion
    sheet.appendRow([
      data.folio || '',
      data.fecha || new Date().toISOString(),
      data.clienteNombre || '',
      data.clienteTelefono || '',
      data.clienteEmail || '',
      data.dispositivo || '',
      data.marca || '',
      data.modelo || '',
      data.pieza || '',
      data.variante || '',
      data.tipoVariante || '',
      data.precioVenta || 0,
      data.tiempoEntrega || '',
      data.garantia || '',
      data.notas || '',
      data.referenciasBase || '[]',
      data.estado || 'Pendiente'
    ]);

    Logger.log('Cotizacion guardada: ' + data.folio);

    return {
      success: true,
      folio: data.folio,
      message: 'Cotizacion guardada exitosamente'
    };

  } catch (error) {
    Logger.log('Error guardando cotizacion: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================
// GUARDAR RESPUESTA DE CLIENTE
// ============================================

function saveRespuesta(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('Respuestas');

    // Crear pestana si no existe
    if (!sheet) {
      sheet = ss.insertSheet('Respuestas');
      sheet.appendRow([
        'Folio_Cotizacion',
        'Fecha_Respuesta',
        'Cliente_Nombre',
        'Telefono',
        'Variante_Elegida',
        'Comentarios',
        'Estado'
      ]);

      const headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#10b981');
      headerRange.setFontColor('#ffffff');
    }

    sheet.appendRow([
      data.folio || '',
      new Date().toISOString(),
      data.nombre || '',
      data.telefono || '',
      data.varianteElegida || '',
      data.comentarios || '',
      'Nueva'
    ]);

    Logger.log('Respuesta guardada para folio: ' + data.folio);

    return {
      success: true,
      message: 'Respuesta guardada exitosamente'
    };

  } catch (error) {
    Logger.log('Error guardando respuesta: ' + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================
// TEST FUNCTION
// ============================================

function testWebApp() {
  // Test getHallazgos
  Logger.log('=== TEST GET HALLAZGOS ===');
  const result1 = getHallazgos();
  Logger.log(JSON.stringify(result1, null, 2));

  // Test getBusquedas
  Logger.log('\n=== TEST GET BUSQUEDAS ===');
  const result2 = getBusquedas();
  Logger.log(JSON.stringify(result2, null, 2));

  // Test getUltimaBusqueda
  Logger.log('\n=== TEST GET ULTIMA BUSQUEDA ===');
  const result3 = getUltimaBusqueda();
  Logger.log(JSON.stringify(result3, null, 2));
}
