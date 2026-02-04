// google-apps-script.gs
// Google Apps Script para Sistema de Cotización Profesional 3.0
// Despliega como Web App para recibir datos desde el frontend

// ============================================
// CONFIGURACIÓN
// ============================================

// ⚠️ IMPORTANTE: Reemplaza con tu ID de spreadsheet
const SPREADSHEET_ID = '1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI';

// Nombres de las hojas
const SHEETS = {
  BUSQUEDA: 'Búsqueda',
  HALLAZGOS: 'Hallazgos',
  COTIZACIONES: 'Cotizaciones',
  REFERENCIAS: 'Referencias Base',
  RESPUESTAS: 'Respuestas Clientes',
  LOG: 'Log de Actividad'
};

// ============================================
// FUNCIÓN PRINCIPAL - doPost
// ============================================

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    
    Logger.log('📥 Recibida acción: ' + action);
    
    let result;
    
    switch(action) {
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
        result = actualizarEstado(params.folio, params.estado);
        break;

      case 'getUltimaCotizacion':
        result = obtenerUltimaCotizacion();
        break;

      case 'saveBusqueda':
        result = guardarBusqueda(params.data);
        break;

      default:
        result = {
          success: false,
          message: 'Acción no reconocida: ' + action
        };
    }
    
    logActividad(action, result.success ? 'SUCCESS' : 'ERROR', result.message);
    
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
// FUNCIÓN GET - para pruebas
// ============================================

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'test') {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Conexión exitosa con Google Apps Script',
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput('Sistema de Cotización - API funcionando');
}

// ============================================
// FUNCIONES DE GUARDADO
// ============================================

function guardarCotizacion(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.COTIZACIONES);
    
    // Crear hoja si no existe
    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.COTIZACIONES);
      
      // Headers
      sheet.appendRow([
        'Folio',
        'Fecha',
        'Cliente',
        'Email',
        'Teléfono',
        'Dispositivo',
        'Marca',
        'Modelo',
        'Refacción',
        'Num Variantes',
        'Precio Refacción',
        'Mano de Obra',
        'Utilidad %',
        'Precio Final',
        'Notas',
        'Vencimiento',
        'Estado',
        'Fecha Actualización'
      ]);
      
      // Formato headers
      const headerRange = sheet.getRange(1, 1, 1, 18);
      headerRange.setBackground('#2563eb');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
    }
    
    // Datos a guardar
    const row = [
      data.folio,
      new Date(data.fecha),
      data.cliente.nombre,
      data.cliente.email || '',
      data.cliente.telefono || '',
      data.dispositivo.tipo,
      data.dispositivo.marca,
      data.dispositivo.modelo,
      data.dispositivo.refaccion,
      data.variantes.length,
      data.precios.refaccion,
      data.precios.manoObra,
      data.precios.utilidad,
      data.precios.final,
      data.notas || '',
      data.vencimiento || '',
      data.estado || 'Pendiente',
      new Date()
    ];
    
    sheet.appendRow(row);
    
    // Guardar variantes en hoja de referencias
    if (data.variantes && data.variantes.length > 0) {
      guardarReferencias(data.folio, data.variantes);
    }
    
    Logger.log('✅ Cotización guardada: ' + data.folio);
    
    return {
      success: true,
      message: 'Cotización guardada exitosamente',
      folio: data.folio
    };
    
  } catch (error) {
    Logger.log('❌ Error guardando cotización: ' + error.toString());
    return {
      success: false,
      message: 'Error al guardar cotización: ' + error.toString()
    };
  }
}

function guardarReferencias(folio, variantes) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.REFERENCIAS);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.REFERENCIAS);
      
      sheet.appendRow([
        'Folio Cotización',
        'Número Variante',
        'Plataforma',
        'Precio',
        'Vendedor',
        'Días Entrega',
        'Fecha Registro'
      ]);
      
      const headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setBackground('#10b981');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
    }
    
    variantes.forEach((variante, index) => {
      sheet.appendRow([
        folio,
        index + 1,
        variante.plataforma,
        variante.precio,
        variante.vendedor,
        variante.entrega,
        new Date()
      ]);
    });
    
    Logger.log('✅ Referencias guardadas para: ' + folio);
    
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
        'Dispositivo',
        'Marca',
        'Modelo',
        'Refacción',
        'Plataforma',
        'Precio',
        'URL',
        'Fecha Registro'
      ]);
      
      const headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setBackground('#10b981');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
    }
    
    sheet.appendRow([
      data.dispositivo,
      data.marca,
      data.modelo,
      data.refaccion,
      data.platform,
      data.price,
      data.url,
      new Date()
    ]);
    
    return {
      success: true,
      message: 'Referencia guardada exitosamente'
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Error al guardar referencia: ' + error.toString()
    };
  }
}

function guardarRespuestaCliente(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.RESPUESTAS);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.RESPUESTAS);
      
      sheet.appendRow([
        'Folio',
        'Tipo Respuesta',
        'Nombre Cliente',
        'Teléfono',
        'Email',
        'Mensaje',
        'Fecha Respuesta'
      ]);
      
      const headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setBackground('#8b5cf6');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
    }
    
    sheet.appendRow([
      data.folio,
      data.responseType || 'none',
      data.nombre,
      data.telefono,
      data.email || '',
      data.mensaje || '',
      new Date()
    ]);
    
    // Actualizar estado de la cotización
    actualizarEstado(data.folio, data.responseType === 'accept' ? 'Aceptada' : 'Rechazada');
    
    // Enviar notificación por email (opcional)
    enviarNotificacionEmail(data);
    
    return {
      success: true,
      message: 'Respuesta guardada exitosamente'
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Error al guardar respuesta: ' + error.toString()
    };
  }
}

// ============================================
// FUNCIONES DE CONSULTA
// ============================================

function obtenerCotizaciones(filters) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.COTIZACIONES);
    
    if (!sheet) {
      return {
        success: true,
        data: [],
        message: 'No hay cotizaciones registradas'
      };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Convertir a objetos
    const cotizaciones = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    // Aplicar filtros si existen
    let filtered = cotizaciones;
    
    if (filters) {
      if (filters.estado) {
        filtered = filtered.filter(c => c.Estado === filters.estado);
      }
      if (filters.cliente) {
        filtered = filtered.filter(c => 
          c.Cliente.toLowerCase().includes(filters.cliente.toLowerCase())
        );
      }
      if (filters.fechaDesde) {
        const desde = new Date(filters.fechaDesde);
        filtered = filtered.filter(c => new Date(c.Fecha) >= desde);
      }
    }
    
    return {
      success: true,
      data: filtered,
      total: filtered.length
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Error al obtener cotizaciones: ' + error.toString()
    };
  }
}

function actualizarEstado(folio, nuevoEstado) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.COTIZACIONES);
    
    if (!sheet) {
      return {
        success: false,
        message: 'Hoja de cotizaciones no encontrada'
      };
    }
    
    const data = sheet.getDataRange().getValues();
    
    // Buscar la fila con el folio
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === folio) {
        // Columna 17 = Estado, Columna 18 = Fecha Actualización
        sheet.getRange(i + 1, 17).setValue(nuevoEstado);
        sheet.getRange(i + 1, 18).setValue(new Date());
        
        Logger.log('✅ Estado actualizado para: ' + folio);
        
        return {
          success: true,
          message: 'Estado actualizado exitosamente'
        };
      }
    }
    
    return {
      success: false,
      message: 'Folio no encontrado: ' + folio
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Error al actualizar estado: ' + error.toString()
    };
  }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function logActividad(accion, resultado, mensaje) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.LOG);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.LOG);
      sheet.appendRow(['Timestamp', 'Acción', 'Resultado', 'Mensaje']);
      
      const headerRange = sheet.getRange(1, 1, 1, 4);
      headerRange.setBackground('#6b7280');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
    }
    
    sheet.appendRow([
      new Date(),
      accion,
      resultado,
      mensaje
    ]);
    
    // Mantener solo los últimos 1000 registros
    if (sheet.getLastRow() > 1000) {
      sheet.deleteRow(2);
    }
    
  } catch (error) {
    Logger.log('⚠️ Error en log: ' + error.toString());
  }
}

function enviarNotificacionEmail(data) {
  try {
    // Configura el email del negocio
    const emailDestino = 'tu-email@hospitaldelmovil.com';
    
    const asunto = `Nueva Respuesta - Cotización ${data.folio}`;
    
    const cuerpo = `
      Nueva respuesta de cliente para la cotización ${data.folio}
      
      Tipo: ${data.responseType === 'accept' ? 'ACEPTADA ✅' : 'RECHAZADA ❌'}
      
      Cliente: ${data.nombre}
      Teléfono: ${data.telefono}
      Email: ${data.email || 'No proporcionado'}
      
      Mensaje:
      ${data.mensaje || 'Sin mensaje'}
      
      ---
      Sistema de Cotización Profesional 3.0
      Hospital del Móvil
    `;
    
    MailApp.sendEmail(emailDestino, asunto, cuerpo);
    
    Logger.log('✅ Notificación email enviada');
    
  } catch (error) {
    Logger.log('⚠️ Error enviando email: ' + error.toString());
  }
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function inicializarHojas() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  Object.values(SHEETS).forEach(sheetName => {
    if (!ss.getSheetByName(sheetName)) {
      ss.insertSheet(sheetName);
      Logger.log('✅ Hoja creada: ' + sheetName);
    }
  });
  
  Logger.log('✅ Inicialización completada');
}

function limpiarDatosPrueba() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  Object.values(SHEETS).forEach(sheetName => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet && sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
      Logger.log('✅ Datos eliminados de: ' + sheetName);
    }
  });
  
  Logger.log('✅ Limpieza completada');
}

// ============================================
// CONFIGURACIÓN DE TRIGGERS
// ============================================

function crearTriggers() {
  // Eliminar triggers existentes
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Crear trigger diario para limpieza de logs
  ScriptApp.newTrigger('limpiarLogsAntiguos')
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();
  
  Logger.log('✅ Triggers creados');
}

function limpiarLogsAntiguos() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.LOG);
    
    if (sheet && sheet.getLastRow() > 1000) {
      const filasAEliminar = sheet.getLastRow() - 1000;
      sheet.deleteRows(2, filasAEliminar);
      Logger.log(`✅ Eliminadas ${filasAEliminar} filas del log`);
    }
  } catch (error) {
    Logger.log('⚠️ Error limpiando logs: ' + error.toString());
  }
}

// ============================================
// TESTING
// ============================================

function testGuardarCotizacion() {
  const dataPrueba = {
    folio: 'TEST-' + Date.now(),
    fecha: new Date().toISOString(),
    cliente: {
      nombre: 'Cliente de Prueba',
      email: 'prueba@ejemplo.com',
      telefono: '+52 123 456 7890'
    },
    dispositivo: {
      tipo: 'smartphone',
      marca: 'Apple',
      modelo: 'iPhone 13',
      refaccion: 'Pantalla'
    },
    variantes: [
      {
        plataforma: 'Amazon',
        precio: 2500,
        vendedor: 'Vendedor Test',
        entrega: 5
      }
    ],
    precios: {
      refaccion: 2500,
      manoObra: 300,
      utilidad: 20,
      final: 3360
    },
    notas: 'Cotización de prueba',
    vencimiento: '2024-12-31',
    estado: 'Pendiente'
  };

  const resultado = guardarCotizacion(dataPrueba);
  Logger.log(resultado);
}

/**
 * Crear pestaña Búsqueda con datos de prueba
 */
function crearPestanaBusqueda() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.BUSQUEDA);

    // Crear hoja si no existe
    if (!sheet) {
      sheet = ss.insertSheet(SHEETS.BUSQUEDA);

      // Headers
      sheet.appendRow([
        'ID_Cotizador',
        'Timestamp',
        'Usuario',
        'Dispositivo',
        'Marca',
        'Modelo',
        'Color',
        'Variante1',
        'Variante2',
        'Pieza',
        'Fecha Registro',
        'Estado',
        'Notas'
      ]);

      // Formato headers
      const headerRange = sheet.getRange(1, 1, 1, 13);
      headerRange.setBackground('#2563eb');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');

      Logger.log('✅ Pestaña Búsqueda creada con encabezados');
    }

    // Agregar datos de prueba
    sheet.appendRow([
      'ID_' + Date.now(),
      new Date(),
      'usuario@hospitaldelmovil.com.mx',
      'Celular',
      'Apple',
      'iPhone 13',
      'Negro',
      'OLED',
      'Original',
      'Pantalla',
      new Date(),
      'Pendiente',
      'Búsqueda urgente para cliente'
    ]);

    Logger.log('✅ Datos de prueba agregados');

    return {
      success: true,
      message: 'Pestaña Búsqueda creada con datos de prueba'
    };

  } catch (error) {
    Logger.log('❌ Error creando pestaña Búsqueda: ' + error.toString());
    return {
      success: false,
      message: 'Error: ' + error.toString()
    };
  }
}

// ============================================
// NUEVAS FUNCIONES PARA BÚSQUEDA AUTOMÁTICA
// ============================================

/**
 * Obtiene el último registro de la pestaña Búsqueda
 */
function obtenerUltimaBusqueda() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.BUSQUEDA);

    if (!sheet || sheet.getLastRow() < 2) {
      return {
        success: false,
        message: 'No hay búsquedas registradas'
      };
    }

    const lastRow = sheet.getLastRow();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const data = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Crear objeto con los datos
    const busqueda = {};
    headers.forEach((header, index) => {
      busqueda[header] = data[index];
    });

    return {
      success: true,
      data: {
        id: busqueda['ID_Cotizador'],
        timestamp: busqueda['Timestamp'],
        usuario: busqueda['Usuario'],
        dispositivo: busqueda['Dispositivo'],
        marca: busqueda['Marca'],
        modelo: busqueda['Modelo'],
        color: busqueda['Color'],
        variante1: busqueda['Variante1'],
        variante2: busqueda['Variante2'],
        pieza: busqueda['Pieza'],
        fechaRegistro: busqueda['Fecha Registro'],
        estado: busqueda['Estado'],
        notas: busqueda['Notas']
      }
    };

  } catch (error) {
    Logger.log('❌ Error obteniendo última búsqueda: ' + error.toString());
    return {
      success: false,
      message: 'Error al obtener última búsqueda: ' + error.toString()
    };
  }
}

// Mantener compatibilidad con función anterior
function obtenerUltimaCotizacion() {
  return obtenerUltimaBusqueda();
}

/**
 * Guarda los resultados de búsqueda en una nueva hoja
 */
function guardarBusqueda(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetName = 'Búsquedas';
    let sheet = ss.getSheetByName(sheetName);

    // Crear hoja si no existe
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);

      // Headers
      sheet.appendRow([
        'Fecha Búsqueda',
        'Folio Cotización',
        'Tipo Búsqueda',
        'Marca',
        'Modelo',
        'Refacción',
        'Plataforma',
        'Precio Venta',
        'Costo Envío',
        'Impuestos',
        'Costo Total',
        'Calificación Vendedor',
        'Tiempo Entrega (días)',
        'URL'
      ]);

      // Formato headers
      const headerRange = sheet.getRange(1, 1, 1, 14);
      headerRange.setBackground('#f59e0b');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
    }

    // Guardar cada resultado
    data.resultados.forEach(resultado => {
      sheet.appendRow([
        new Date(),
        data.folio,
        data.tipoBusqueda,
        data.marca,
        data.modelo,
        data.refaccion || '',
        resultado.plataforma,
        resultado.precioVenta,
        resultado.costoEnvio,
        resultado.impuestos,
        resultado.costoTotal,
        resultado.calificacionVendedor,
        resultado.tiempoEntrega,
        resultado.url
      ]);
    });

    Logger.log(`✅ Guardados ${data.resultados.length} resultados de búsqueda`);

    return {
      success: true,
      message: `${data.resultados.length} resultados guardados exitosamente`
    };

  } catch (error) {
    Logger.log('❌ Error guardando búsqueda: ' + error.toString());
    return {
      success: false,
      message: 'Error al guardar búsqueda: ' + error.toString()
    };
  }
}
