// ============================================
// GOOGLE APPS SCRIPT - SERPAPI CON ESTADOS
// Sistema de Cotización Hospital del Móvil
// Versión mejorada con actualización de estados
// ============================================

// ⚠️ CONFIGURACIÓN - ACTUALIZAR ESTAS VARIABLES
const SPREADSHEET_ID = '1PFBCQqju5ZQFZz1WwRNSNmjSG9_9_2XVBwNcSPUS-SI';
const BACKEND_URL = 'https://unadmonitory-insupportable-keyla.ngrok-free.dev'; // URL de ngrok

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

// Índices de columnas (0-based) - Ajustado al Sheet real
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
// Se ejecuta cuando AppSheet inserta filas
// ============================================

function onChange(e) {
  try {
    Logger.log('📥 Trigger onChange ejecutado');

    // Obtener el sheet activo
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetBusqueda = ss.getSheetByName(SHEETS.BUSQUEDA);

    if (!sheetBusqueda) {
      Logger.log('⚠️ Pestaña Búsqueda no encontrada');
      return;
    }

    // Obtener la última fila con datos
    const ultimaFila = sheetBusqueda.getLastRow();

    if (ultimaFila < 2) {
      Logger.log('⚠️ No hay datos para procesar');
      return;
    }

    Logger.log(`📋 Procesando última fila: ${ultimaFila}`);

    // Leer datos de la última fila
    const datos = sheetBusqueda.getRange(ultimaFila, 1, 1, 14).getValues()[0];

    // Verificar datos mínimos
    if (!datos[COLS.MARCA] || !datos[COLS.MODELO] || !datos[COLS.PIEZA]) {
      Logger.log('⚠️ Faltan datos requeridos (Marca, Modelo o Pieza)');
      return;
    }

    // Verificar estado actual
    const estadoActual = datos[COLS.ESTADO];

    // Solo procesar si está Pendiente o vacío
    if (estadoActual && estadoActual !== ESTADOS.PENDIENTE && estadoActual !== '') {
      Logger.log(`ℹ️ Estado actual: ${estadoActual} - No se procesa`);
      return;
    }

    Logger.log(`✅ Iniciando búsqueda para: ${datos[COLS.MARCA]} ${datos[COLS.MODELO]} - ${datos[COLS.PIEZA]}`);

    // Procesar búsqueda
    procesarBusqueda(sheetBusqueda, ultimaFila, datos);

  } catch (error) {
    Logger.log('❌ Error en onChange: ' + error.toString());
  }
}

// ============================================
// TRIGGER: onEdit
// Se ejecuta cuando se edita el sheet manualmente
// ============================================

function onEdit(e) {
  try {
    const sheet = e.source.getActiveSheet();

    // Solo procesar pestaña Búsqueda
    if (sheet.getName() !== SHEETS.BUSQUEDA) {
      return;
    }

    const fila = e.range.getRow();

    // Ignorar header (fila 1)
    if (fila === 1) {
      return;
    }

    Logger.log(`✏️ Edición detectada en fila ${fila}`);

    // Leer datos de la fila editada
    const datos = sheet.getRange(fila, 1, 1, 14).getValues()[0];

    // Verificar datos mínimos
    if (!datos[COLS.MARCA] || !datos[COLS.MODELO] || !datos[COLS.PIEZA]) {
      Logger.log('⚠️ Faltan datos requeridos (Marca, Modelo o Pieza)');
      return;
    }

    // Verificar estado actual
    const estadoActual = datos[COLS.ESTADO];

    // Solo procesar si está Pendiente o vacío
    if (estadoActual && estadoActual !== ESTADOS.PENDIENTE) {
      Logger.log(`ℹ️ Estado actual: ${estadoActual} - No se procesa`);
      return;
    }

    // Procesar búsqueda
    procesarBusqueda(sheet, fila, datos);

  } catch (error) {
    Logger.log('❌ Error en onEdit: ' + error.toString());
  }
}

// ============================================
// PROCESAR BÚSQUEDA
// ============================================

function procesarBusqueda(sheet, fila, datos) {
  try {
    // 1. Actualizar estado a "Buscando"
    actualizarEstado(sheet, fila, ESTADOS.BUSCANDO);

    // 2. Preparar payload
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

    // 3. Llamar al backend
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
      // Los datos vienen dentro de resultado.data
      const data = resultado.data || resultado;

      Logger.log('✅ Búsqueda exitosa');
      Logger.log(`   Piezas encontradas: ${data.piezas?.length || 0}`);
      Logger.log(`   Equipos nuevos: ${data.equipos_nuevos?.length || 0}`);
      Logger.log(`   Equipos usados: ${data.equipos_usados?.length || 0}`);

      // 4. Guardar hallazgos
      guardarHallazgos(datos[COLS.ID], data);

      // 5. Actualizar estado a "Completo"
      actualizarEstado(sheet, fila, ESTADOS.COMPLETO);

      // 6. Notificar al usuario (opcional)
      if (datos[COLS.USUARIO]) {
        notificarUsuario(datos[COLS.USUARIO], datos[COLS.ID], ESTADOS.COMPLETO);
      }

    } else {
      throw new Error(`Error del backend: ${code} - ${resultado.error || 'Unknown'}`);
    }

  } catch (error) {
    Logger.log('❌ Error en procesarBusqueda: ' + error.toString());

    // Actualizar estado a "Error"
    actualizarEstado(sheet, fila, ESTADOS.ERROR);

    // Agregar nota de error
    sheet.getRange(fila, COLS.NOTAS + 1).setValue(
      `Error: ${error.toString()}`
    );

    throw error;
  }
}

// ============================================
// ACTUALIZAR ESTADO
// ============================================

function actualizarEstado(sheet, fila, nuevoEstado) {
  try {
    // Columna Estado (ajustar según tu sheet)
    const columnaEstado = COLS.ESTADO + 1;

    sheet.getRange(fila, columnaEstado).setValue(nuevoEstado);

    Logger.log(`📝 Estado actualizado: ${nuevoEstado} (fila ${fila})`);

    // Aplicar formato condicional (opcional)
    const cell = sheet.getRange(fila, columnaEstado);

    switch (nuevoEstado) {
      case ESTADOS.PENDIENTE:
        cell.setBackground('#fff3cd'); // Amarillo claro
        break;
      case ESTADOS.BUSCANDO:
        cell.setBackground('#cfe2ff'); // Azul claro
        break;
      case ESTADOS.COMPLETO:
        cell.setBackground('#d1e7dd'); // Verde claro
        break;
      case ESTADOS.ERROR:
        cell.setBackground('#f8d7da'); // Rojo claro
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

    // Crear pestaña si no existe
    if (!sheetHallazgos) {
      sheetHallazgos = ss.insertSheet(SHEETS.HALLAZGOS);

      // Header
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

    // Guardar piezas
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

    // Guardar equipos nuevos (opcional - para comparación)
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
// NOTIFICAR USUARIO (OPCIONAL)
// ============================================

function notificarUsuario(email, idCotizador, estado) {
  try {
    if (!email) return;

    let asunto, mensaje;

    if (estado === ESTADOS.COMPLETO) {
      asunto = `✅ Búsqueda ${idCotizador} completada`;
      mensaje = `
Hola,

Tu búsqueda ${idCotizador} se completó exitosamente.

Puedes ver los hallazgos en:
https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit

O abrir la app de AppSheet para ver resultados.

Saludos,
Hospital del Móvil
      `;
    } else if (estado === ESTADOS.ERROR) {
      asunto = `⚠️ Error en búsqueda ${idCotizador}`;
      mensaje = `
Hola,

Hubo un error procesando tu búsqueda ${idCotizador}.

Por favor revisa los datos e intenta nuevamente.

Saludos,
Hospital del Móvil
      `;
    }

    MailApp.sendEmail(email, asunto, mensaje);

    Logger.log(`📧 Email enviado a: ${email}`);

  } catch (error) {
    Logger.log('⚠️ Error enviando email: ' + error.toString());
  }
}

// ============================================
// FUNCIÓN MANUAL PARA TESTING
// ============================================

function procesarUltimaBusquedaManual() {
  try {
    Logger.log('🧪 Procesando última búsqueda manualmente...');

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.BUSQUEDA);

    if (!sheet) {
      throw new Error('Pestaña Búsqueda no encontrada');
    }

    const ultimaFila = sheet.getLastRow();

    if (ultimaFila < 2) {
      throw new Error('No hay datos para procesar');
    }

    const datos = sheet.getRange(ultimaFila, 1, 1, 14).getValues()[0];

    Logger.log('📋 Datos de última fila:');
    Logger.log(`   ID: ${datos[COLS.ID]}`);
    Logger.log(`   Marca: ${datos[COLS.MARCA]}`);
    Logger.log(`   Modelo: ${datos[COLS.MODELO]}`);
    Logger.log(`   Pieza: ${datos[COLS.PIEZA]}`);

    procesarBusqueda(sheet, ultimaFila, datos);

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
  }
}

// ============================================
// CREAR PESTAÑA BÚSQUEDA (SI NO EXISTE)
// ============================================

function crearPestanaBusqueda() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEETS.BUSQUEDA);

    if (sheet) {
      Logger.log('✅ Pestaña Búsqueda ya existe');
      return;
    }

    // Crear pestaña
    sheet = ss.insertSheet(SHEETS.BUSQUEDA);

    // Header
    sheet.appendRow([
      'Búsqueda_ID',
      'Folio Busqueda',
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
      'Notas',
      'Estatus'
    ]);

    // Formato header
    const headerRange = sheet.getRange(1, 1, 1, 14);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');

    // Auto-resize columnas
    sheet.autoResizeColumns(1, 14);

    Logger.log('✅ Pestaña Búsqueda creada');

  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
  }
}
