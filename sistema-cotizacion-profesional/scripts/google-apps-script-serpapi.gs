// ============================================
// GOOGLE APPS SCRIPT - SERPAPI INTEGRATION
// Sistema de Cotización Hospital del Móvil
// ============================================

// ⚠️ IMPORTANTE: Reemplaza con tu ID de spreadsheet
const SPREADSHEET_ID = '1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI';

// URL del backend Node.js
// ⚠️ CAMBIAR CUANDO DESPLIEGUES EN PRODUCCIÓN
const BACKEND_URL = 'http://localhost:3000'; // Desarrollo local
// const BACKEND_URL = 'https://tu-dominio.com'; // Producción

// Nombres de las pestañas
const SHEETS = {
  BUSQUEDA: 'Búsqueda',
  HALLAZGOS: 'Hallazgos',
  COTIZACIONES: 'Cotizaciones',
  LOG: 'Log'
};

// ============================================
// TRIGGER: onChange
// Se ejecuta cuando hay cambios en el Sheet
// ============================================

function onChange(e) {
  try {
    Logger.log('📥 Trigger onChange ejecutado');

    // Obtener el sheet activo
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const activeSheet = ss.getActiveSheet();

    // Solo procesar si es la pestaña "Búsqueda"
    if (activeSheet.getName() !== SHEETS.BUSQUEDA) {
      Logger.log('⏭️ No es pestaña Búsqueda, ignorando');
      return;
    }

    // Obtener la última fila con datos
    const ultimaFila = activeSheet.getLastRow();

    if (ultimaFila < 2) {
      Logger.log('⚠️ No hay datos para procesar');
      return;
    }

    // Leer datos de la última fila
    const datos = activeSheet.getRange(ultimaFila, 1, 1, 13).getValues()[0];

    Logger.log('📋 Datos de última fila:');
    Logger.log(`   ID: ${datos[0]}`);
    Logger.log(`   Marca: ${datos[4]}`);
    Logger.log(`   Modelo: ${datos[5]}`);
    Logger.log(`   Pieza: ${datos[9]}`);

    // Enviar al backend para búsqueda
    enviarABackendSerpAPI(datos);

  } catch (error) {
    Logger.log('❌ Error en onChange: ' + error.toString());
    registrarLog('onChange', 'ERROR', error.toString());
  }
}

// ============================================
// TRIGGER ALTERNATIVO: onEdit
// Para testing manual - detecta ediciones
// ============================================

function onEdit(e) {
  try {
    // Solo ejecutar si editamos la pestaña Búsqueda
    const sheet = e.source.getActiveSheet();

    if (sheet.getName() !== SHEETS.BUSQUEDA) {
      return;
    }

    // Solo ejecutar si editamos una celda en las primeras 13 columnas
    if (e.range.getColumn() > 13) {
      return;
    }

    Logger.log('✏️ Edición detectada en Búsqueda');

    // Procesar la última fila
    const ultimaFila = sheet.getLastRow();
    const datos = sheet.getRange(ultimaFila, 1, 1, 13).getValues()[0];

    // Verificar que tenga datos mínimos
    if (!datos[4] || !datos[5] || !datos[9]) {
      Logger.log('⚠️ Falta marca, modelo o pieza');
      return;
    }

    enviarABackendSerpAPI(datos);

  } catch (error) {
    Logger.log('❌ Error en onEdit: ' + error.toString());
  }
}

// ============================================
// FUNCIÓN: Enviar datos al backend
// ============================================

function enviarABackendSerpAPI(datos) {
  try {
    Logger.log('\n🚀 Enviando datos al backend...');

    // Preparar payload
    const payload = {
      id_busqueda: datos[0],      // A: ID_Cotizador
      timestamp: datos[1],          // B: Timestamp
      usuario: datos[2],            // C: Usuario
      dispositivo: datos[3],        // D: Dispositivo
      marca: datos[4],              // E: Marca
      modelo: datos[5],             // F: Modelo
      color: datos[6],              // G: Color
      variante1: datos[7] || '',    // H: Variante1
      variante2: datos[8] || '',    // I: Variante2
      pieza: datos[9],              // J: Pieza
      fecha_registro: datos[10],    // K: Fecha Registro
      estado: datos[11] || '',      // L: Estado
      notas: datos[12] || ''        // M: Notas
    };

    Logger.log('📦 Payload:');
    Logger.log(JSON.stringify(payload, null, 2));

    // Opciones de la request
    const options = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify(payload),
      'muteHttpExceptions': true
    };

    // Llamar al backend
    const url = BACKEND_URL + '/api/buscar-serpapi';
    Logger.log(`📡 Llamando a: ${url}`);

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    Logger.log(`📬 Response Code: ${responseCode}`);

    if (responseCode === 200) {
      const result = JSON.parse(responseText);

      Logger.log('✅ Búsqueda exitosa!');
      Logger.log(`   Piezas: ${result.data.piezas?.length || 0}`);
      Logger.log(`   Equipos nuevos: ${result.data.equipos_nuevos?.length || 0}`);
      Logger.log(`   Equipos usados: ${result.data.equipos_usados?.length || 0}`);

      // Guardar hallazgos en Google Sheets
      guardarHallazgosEnSheets(payload.id_busqueda, result.data);

      // Registrar en log
      registrarLog('buscarSerpAPI', 'SUCCESS', `${result.data.piezas?.length} piezas encontradas`);

    } else {
      Logger.log('❌ Error en backend:');
      Logger.log(responseText);

      registrarLog('buscarSerpAPI', 'ERROR', responseText);
    }

  } catch (error) {
    Logger.log('❌ Error enviando a backend: ' + error.toString());
    registrarLog('enviarBackend', 'ERROR', error.toString());
  }
}

// ============================================
// FUNCIÓN: Guardar hallazgos en Sheets
// ============================================

function guardarHallazgosEnSheets(id_busqueda, data) {
  try {
    Logger.log('\n💾 Guardando hallazgos en Google Sheets...');

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.HALLAZGOS);

    // Crear hoja si no existe
    if (!sheet) {
      Logger.log('📄 Creando pestaña Hallazgos...');
      sheet = ss.insertSheet(SHEETS.HALLAZGOS);

      // Headers
      const headers = [
        'ID_Hallazgo',
        'ID_Búsqueda',
        'Tipo',           // Pieza, Equipo Nuevo, Equipo Usado
        'Plataforma',
        'Título',
        'Precio',
        'Moneda',
        'Envío Gratis',
        'Tiempo Entrega',
        'Vendedor',
        'Calificación',
        'Num Reseñas',
        'URL',
        'Fecha Registro'
      ];

      sheet.appendRow(headers);

      // Formato headers
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#2563eb');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
    }

    const timestamp = new Date().toISOString();
    let contador = 0;

    // Guardar piezas
    if (data.piezas && data.piezas.length > 0) {
      Logger.log(`   Guardando ${data.piezas.length} piezas...`);

      data.piezas.forEach((pieza, index) => {
        const row = [
          `${id_busqueda}-P${index + 1}`,  // ID_Hallazgo
          id_busqueda,                      // ID_Búsqueda
          'Pieza',                          // Tipo
          pieza.plataforma || '',
          pieza.titulo || '',
          pieza.precio || 0,
          pieza.moneda || 'MXN',
          pieza.envio_gratis ? 'Sí' : 'No',
          pieza.tiempo_entrega || '',
          pieza.vendedor || '',
          pieza.calificacion || '',
          pieza.num_resenas || '',
          pieza.url_compra || '',
          timestamp
        ];

        sheet.appendRow(row);
        contador++;
      });
    }

    // Guardar equipos nuevos
    if (data.equipos_nuevos && data.equipos_nuevos.length > 0) {
      Logger.log(`   Guardando ${data.equipos_nuevos.length} equipos nuevos...`);

      data.equipos_nuevos.forEach((equipo, index) => {
        const row = [
          `${id_busqueda}-N${index + 1}`,
          id_busqueda,
          'Equipo Nuevo',
          equipo.plataforma || '',
          equipo.titulo || '',
          equipo.precio || 0,
          equipo.moneda || 'MXN',
          equipo.envio_gratis ? 'Sí' : 'No',
          equipo.tiempo_entrega || '',
          equipo.vendedor || '',
          equipo.calificacion || '',
          equipo.num_resenas || '',
          equipo.url_compra || '',
          timestamp
        ];

        sheet.appendRow(row);
        contador++;
      });
    }

    // Guardar equipos usados
    if (data.equipos_usados && data.equipos_usados.length > 0) {
      Logger.log(`   Guardando ${data.equipos_usados.length} equipos usados...`);

      data.equipos_usados.forEach((equipo, index) => {
        const row = [
          `${id_busqueda}-U${index + 1}`,
          id_busqueda,
          'Equipo Usado',
          equipo.plataforma || '',
          equipo.titulo || '',
          equipo.precio || 0,
          equipo.moneda || 'MXN',
          equipo.envio_gratis ? 'Sí' : 'No',
          equipo.tiempo_entrega || '',
          equipo.vendedor || '',
          equipo.calificacion || '',
          equipo.num_resenas || '',
          equipo.url_compra || '',
          timestamp
        ];

        sheet.appendRow(row);
        contador++;
      });
    }

    Logger.log(`✅ Guardados ${contador} hallazgos en total`);

  } catch (error) {
    Logger.log('❌ Error guardando hallazgos: ' + error.toString());
  }
}

// ============================================
// FUNCIÓN: Registrar actividad en Log
// ============================================

function registrarLog(accion, estado, mensaje) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = ss.getSheetByName(SHEETS.LOG);

    // Crear hoja si no existe
    if (!logSheet) {
      logSheet = ss.insertSheet(SHEETS.LOG);

      // Headers
      logSheet.appendRow(['Timestamp', 'Acción', 'Estado', 'Mensaje']);

      const headerRange = logSheet.getRange(1, 1, 1, 4);
      headerRange.setBackground('#6b7280');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
    }

    // Agregar registro
    logSheet.appendRow([
      new Date().toISOString(),
      accion,
      estado,
      mensaje
    ]);

  } catch (error) {
    Logger.log('❌ Error registrando log: ' + error.toString());
  }
}

// ============================================
// WEB APP ENDPOINTS - doGet / doPost
// ============================================

function doGet(e) {
  const action = e.parameter.action || 'test';

  if (action === 'test') {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Google Apps Script funcionando',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        spreadsheet_id: SPREADSHEET_ID
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput('Sistema de Cotización - Apps Script activo');
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;

    Logger.log('📥 doPost - Acción: ' + action);

    let result;

    switch(action) {
      case 'getUltimaBusqueda':
        result = obtenerUltimaBusqueda();
        break;

      case 'getHallazgos':
        result = obtenerHallazgos(params.id_busqueda);
        break;

      case 'saveHallazgos':
        guardarHallazgosEnSheets(params.data.id_busqueda, params.data);
        result = { success: true, message: 'Hallazgos guardados' };
        break;

      default:
        result = {
          success: false,
          message: 'Acción no reconocida: ' + action
        };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('❌ Error en doPost: ' + error.toString());

    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// FUNCIÓN: Obtener última búsqueda
// ============================================

function obtenerUltimaBusqueda() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.BUSQUEDA);

    if (!sheet) {
      return {
        success: false,
        message: 'Pestaña Búsqueda no existe'
      };
    }

    const ultimaFila = sheet.getLastRow();

    if (ultimaFila < 2) {
      return {
        success: false,
        message: 'No hay búsquedas registradas'
      };
    }

    const datos = sheet.getRange(ultimaFila, 1, 1, 13).getValues()[0];

    return {
      success: true,
      data: {
        id_busqueda: datos[0],
        timestamp: datos[1],
        usuario: datos[2],
        dispositivo: datos[3],
        marca: datos[4],
        modelo: datos[5],
        color: datos[6],
        variante1: datos[7],
        variante2: datos[8],
        pieza: datos[9],
        fecha_registro: datos[10],
        estado: datos[11],
        notas: datos[12]
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.toString()
    };
  }
}

// ============================================
// FUNCIÓN: Obtener hallazgos por ID
// ============================================

function obtenerHallazgos(id_busqueda) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.HALLAZGOS);

    if (!sheet) {
      return {
        success: false,
        message: 'Pestaña Hallazgos no existe'
      };
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    // Filtrar hallazgos por ID
    const hallazgos = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Column B es ID_Búsqueda (índice 1)
      if (row[1] === id_busqueda) {
        hallazgos.push({
          id_hallazgo: row[0],
          id_busqueda: row[1],
          tipo: row[2],
          plataforma: row[3],
          titulo: row[4],
          precio: row[5],
          moneda: row[6],
          envio_gratis: row[7],
          tiempo_entrega: row[8],
          vendedor: row[9],
          calificacion: row[10],
          num_resenas: row[11],
          url: row[12],
          fecha_registro: row[13]
        });
      }
    }

    return {
      success: true,
      data: {
        id_busqueda: id_busqueda,
        hallazgos: hallazgos,
        total: hallazgos.length
      }
    };

  } catch (error) {
    return {
      success: false,
      message: error.toString()
    };
  }
}

// ============================================
// FUNCIÓN UTILIDAD: Crear pestaña Búsqueda
// Para setup inicial
// ============================================

function crearPestanaBusqueda() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEETS.BUSQUEDA);

  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.BUSQUEDA);

    const headers = [
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
    ];

    sheet.appendRow(headers);

    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#2563eb');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');

    // Datos de prueba
    sheet.appendRow([
      'TEST_' + Date.now(),
      new Date().toISOString(),
      'test@hospitaldelmovil.com',
      'Celular',
      'Samsung',
      'Galaxy S22',
      'Negro',
      'OLED',
      'Original',
      'Pantalla',
      new Date().toLocaleDateString(),
      'Pendiente',
      'Prueba del sistema'
    ]);

    Logger.log('✅ Pestaña Búsqueda creada con datos de prueba');
  } else {
    Logger.log('⚠️ Pestaña Búsqueda ya existe');
  }
}

// ============================================
// FUNCIÓN MANUAL: Procesar última búsqueda
// Para testing manual
// ============================================

function procesarUltimaBusquedaManual() {
  Logger.log('🧪 TEST MANUAL - Procesando última búsqueda');

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.BUSQUEDA);

  if (!sheet) {
    Logger.log('❌ Pestaña Búsqueda no existe');
    return;
  }

  const ultimaFila = sheet.getLastRow();
  const datos = sheet.getRange(ultimaFila, 1, 1, 13).getValues()[0];

  enviarABackendSerpAPI(datos);
}
