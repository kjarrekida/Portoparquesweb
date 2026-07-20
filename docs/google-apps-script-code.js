// =============================================================================
// PORTOPARQUES EP - Backend Google Apps Script
// Formulario: Solicitud de Servicios (Poda y Tala)
// =============================================================================
// Este script recibe solicitudes del formulario web de servicios,
// guarda los datos en Google Sheets, sube la foto y resolución a Google Drive
// y envía correos de confirmación al ciudadano y a la institución.
// =============================================================================

// ===================== CONFIGURACIÓN =====================
// Instrucciones: Reemplace los valores entre comillas con sus datos reales.
// Consulte el archivo google-apps-script-setup.md para obtener ayuda.
// =========================================================

/** ID de la hoja de Google Sheets (se encuentra en la URL de la hoja) */
var SHEET_ID = '13U8oLqng-6BZ9RdYPRb8Z4VsTZGjAoXfC57YiZ5TDvY';

/** ID de la carpeta de Google Drive donde se guardarán las fotos */
var FOLDER_ID = '14lTqFojP5V_T9eDvgo-Rf_D7Gn5xn0lU';

/** ID de la carpeta de Google Drive donde se guardarán las resoluciones (PDF) */
var FOLDER_ID_RESOLUCIONES = '1ZUCW-OYdXN5ANu6i2fiscxnlP_64zebS';

/** Nombre de la pestaña/hoja dentro del Google Sheet */
var SHEET_NAME = 'Solicitudes V2';

/** Correo institucional que recibe todas las notificaciones */
var CORREO_INSTITUCIONAL = 'info@portoparques.gob.ec';

/**
 * Correo del encargado/responsable del área (opcional).
 * Déjelo vacío ('') si no desea enviar a un encargado adicional.
 */
var CORREO_ENCARGADO = 'kevin.jarre@portoparques.gob.ec';

// ===================== FIN CONFIGURACIÓN =====================


// =============================================================================
// doGet - Maneja solicitudes GET (para verificar que el script está activo)
// =============================================================================

/**
 * Responde a solicitudes GET con un mensaje de estado.
 * Útil para verificar que el Web App está desplegado correctamente.
 *
 * @param {Object} e - Evento de la solicitud GET
 * @returns {ContentService.TextOutput} Respuesta JSON con estado del servicio
 */
function doGet(e) {
  var respuesta = {
    success: true,
    servicio: 'Portoparques EP - Solicitud de Servicios',
    estado: 'Activo',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  };

  return ContentService
    .createTextOutput(JSON.stringify(respuesta))
    .setMimeType(ContentService.MimeType.JSON);
}


// =============================================================================
// doPost - Maneja las solicitudes POST del formulario
// =============================================================================

/**
 * Recibe y procesa las solicitudes POST enviadas desde el formulario web.
 * Realiza las siguientes acciones:
 *   1. Valida los datos recibidos
 *   2. Genera un ID de trámite secuencial
 *   3. Guarda la foto en Google Drive (si se incluye)
 *   4. Guarda la resolución ambiental en Google Drive (si se incluye, solo para Tala)
 *   5. Registra todos los datos en Google Sheets
 *   6. Envía correos de confirmación
 *   7. Retorna una respuesta JSON con el resultado
 *
 * @param {Object} e - Evento de la solicitud POST con los datos del formulario
 * @returns {ContentService.TextOutput} Respuesta JSON con resultado de la operación
 */
function doPost(e) {
  try {
    // --- Paso 1: Leer y validar los datos del formulario ---
    var datos = JSON.parse(e.postData.contents);
    Logger.log('📥 Datos recibidos: ' + JSON.stringify(datos));

    // Validar campos obligatorios
    var camposObligatorios = ['tipoServicio', 'nombre', 'direccion', 'parroquia', 'cedula', 'telefono', 'correo', 'numeroArboles'];
    for (var i = 0; i < camposObligatorios.length; i++) {
      var campo = camposObligatorios[i];
      if (!datos[campo] || datos[campo].toString().trim() === '') {
        return _crearRespuesta(false, null, 'El campo "' + campo + '" es obligatorio.');
      }
    }

    // Validar resolución ambiental si el tipo de servicio contiene 'Tala'
    var tipoServicio = datos.tipoServicio || '';
    if (tipoServicio.indexOf('Tala') !== -1) {
      if (!datos.resolucion || datos.resolucion.toString().trim() === '') {
        return _crearRespuesta(false, null, 'La resolución ambiental es obligatoria para solicitudes de Tala.');
      }
    }

    // --- Paso 2: Generar ID de trámite secuencial ---
    var idTramite = _generarIdTramite();
    Logger.log('🔖 ID de trámite generado: ' + idTramite);

    // --- Paso 3: Obtener fecha y hora actual ---
    var fechaHora = _obtenerFechaHoraActual();

    // --- Paso 4: Guardar foto en Google Drive (si existe) ---
    var enlaceFoto = '';
    if (datos.foto && datos.foto.trim() !== '') {
      enlaceFoto = _guardarFotoEnDrive(datos.foto, datos.fotoNombre || 'foto.jpg', idTramite);
      Logger.log('📷 Foto guardada en Drive: ' + enlaceFoto);
    }

    // --- Paso 5: Guardar resolución ambiental en Google Drive (si existe) ---
    var enlaceResolucion = '';
    if (datos.resolucion && datos.resolucion.trim() !== '') {
      enlaceResolucion = _guardarResolucionEnDrive(datos.resolucion, datos.resolucionNombre || 'resolucion.pdf', idTramite);
      Logger.log('📄 Resolución guardada en Drive: ' + enlaceResolucion);
    }

    // --- Paso 6: Registrar en Google Sheets ---
    _registrarEnHoja(
      idTramite,
      tipoServicio,
      fechaHora,
      datos.nombre || '',
      datos.direccion || '',
      datos.ubicacion || '',
      datos.parroquia || '',
      datos.cedula || '',
      datos.telefono || '',
      datos.correo || '',
      datos.numeroArboles || '',
      datos.comentario || '',
      enlaceFoto,
      enlaceResolucion
    );
    Logger.log('📊 Datos registrados en Google Sheets');

    // --- Paso 7: Enviar correos de confirmación ---
    _enviarCorreoCiudadano(datos, idTramite, fechaHora, tipoServicio);
    _enviarCorreoInstitucional(datos, idTramite, fechaHora, enlaceFoto, enlaceResolucion, tipoServicio);

    // Si hay correo de encargado configurado, enviar también
    if (CORREO_ENCARGADO && CORREO_ENCARGADO.trim() !== '') {
      _enviarCorreoEncargado(datos, idTramite, fechaHora, enlaceFoto, enlaceResolucion, tipoServicio);
    }

    Logger.log('✅ Solicitud procesada exitosamente: ' + idTramite);

    // --- Paso 8: Retornar respuesta exitosa ---
    return _crearRespuesta(true, idTramite, 'Su solicitud ha sido registrada exitosamente.');

  } catch (error) {
    // Registrar el error para depuración
    Logger.log('❌ Error al procesar solicitud: ' + error.message);
    Logger.log('📋 Stack trace: ' + error.stack);

    return _crearRespuesta(false, null, 'Error interno del servidor. Por favor intente nuevamente. Detalle: ' + error.message);
  }
}


// =============================================================================
// FUNCIONES AUXILIARES
// =============================================================================

/**
 * Genera un ID de trámite secuencial con formato: PP-PODA-YYYY-NNNNNN
 * Ejemplo: PP-PODA-2026-000001, PP-PODA-2026-000002, etc.
 *
 * El número secuencial se obtiene verificando la última fila de la hoja
 * y extrayendo el número del último ID registrado en el año actual.
 * El formato es compartido (secuencial) para todos los tipos de servicio.
 *
 * @returns {string} ID de trámite generado (ej: 'PP-PODA-2026-000001')
 */
function _generarIdTramite() {
  var anioActual = new Date().getFullYear().toString();
  var prefijo = 'PP-PODA-' + anioActual + '-';

  var hoja = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  var ultimaFila = hoja.getLastRow();
  var siguienteNumero = 1; // Por defecto, empezar en 1

  // Si hay datos (más allá de la fila de encabezados)
  if (ultimaFila > 1) {
    // Recorrer desde la última fila hacia arriba buscando el último ID del año actual
    var rango = hoja.getRange(2, 1, ultimaFila - 1, 1).getValues(); // Columna A, desde fila 2

    for (var i = rango.length - 1; i >= 0; i--) {
      var idExistente = rango[i][0].toString();

      // Verificar si el ID pertenece al año actual
      if (idExistente.indexOf(prefijo) === 0) {
        // Extraer el número secuencial del ID
        var parteNumerica = idExistente.replace(prefijo, '');
        var numero = parseInt(parteNumerica, 10);

        if (!isNaN(numero)) {
          siguienteNumero = numero + 1;
          break;
        }
      }
    }
  }

  // Formatear el número con ceros a la izquierda (6 dígitos)
  var numeroFormateado = _rellenarConCeros(siguienteNumero, 6);

  return prefijo + numeroFormateado;
}


/**
 * Rellena un número con ceros a la izquierda hasta alcanzar la longitud deseada.
 *
 * @param {number} numero - El número a formatear
 * @param {number} longitud - La longitud total deseada
 * @returns {string} Número formateado con ceros (ej: '000042')
 */
function _rellenarConCeros(numero, longitud) {
  var texto = numero.toString();
  while (texto.length < longitud) {
    texto = '0' + texto;
  }
  return texto;
}


/**
 * Obtiene la fecha y hora actual en formato legible para Ecuador (UTC-5).
 *
 * @returns {string} Fecha y hora formateada (ej: '20/05/2026 15:30:45')
 */
function _obtenerFechaHoraActual() {
  var ahora = new Date();

  // Formatear manualmente para zona horaria de Ecuador (UTC-5)
  // Google Apps Script usa la zona horaria del proyecto, que se configura
  // en las propiedades del script. Asegúrese de configurarla a America/Guayaquil.
  var dia = _rellenarConCeros(ahora.getDate(), 2);
  var mes = _rellenarConCeros(ahora.getMonth() + 1, 2);
  var anio = ahora.getFullYear();
  var hora = _rellenarConCeros(ahora.getHours(), 2);
  var minutos = _rellenarConCeros(ahora.getMinutes(), 2);
  var segundos = _rellenarConCeros(ahora.getSeconds(), 2);

  return dia + '/' + mes + '/' + anio + ' ' + hora + ':' + minutos + ':' + segundos;
}


/**
 * Guarda una foto codificada en base64 en una carpeta de Google Drive.
 * Retorna el enlace público para compartir.
 *
 * @param {string} base64Data - Imagen codificada en base64 (puede incluir prefijo data:image/...)
 * @param {string} nombreArchivo - Nombre original del archivo (ej: 'foto.jpg')
 * @param {string} idTramite - ID del trámite para nombrar el archivo
 * @returns {string} URL pública del archivo en Google Drive
 */
function _guardarFotoEnDrive(base64Data, nombreArchivo, idTramite) {
  try {
    // Obtener la carpeta de destino en Drive
    var carpeta = DriveApp.getFolderById(FOLDER_ID);

    // Remover el prefijo data:image/...;base64, si existe
    var datosLimpios = base64Data;
    if (base64Data.indexOf(',') !== -1) {
      datosLimpios = base64Data.split(',')[1];
    }

    // Determinar el tipo MIME basado en la extensión o el prefijo
    var tipoMime = 'image/jpeg'; // Por defecto
    if (base64Data.indexOf('data:image/png') !== -1 || nombreArchivo.toLowerCase().indexOf('.png') !== -1) {
      tipoMime = 'image/png';
    } else if (base64Data.indexOf('data:image/gif') !== -1 || nombreArchivo.toLowerCase().indexOf('.gif') !== -1) {
      tipoMime = 'image/gif';
    } else if (base64Data.indexOf('data:image/webp') !== -1 || nombreArchivo.toLowerCase().indexOf('.webp') !== -1) {
      tipoMime = 'image/webp';
    }

    // Decodificar base64 a blob
    var bytesDecodificados = Utilities.base64Decode(datosLimpios);
    var blob = Utilities.newBlob(bytesDecodificados, tipoMime);

    // Crear nombre descriptivo para el archivo
    var extension = nombreArchivo.split('.').pop() || 'jpg';
    var nombreFinal = idTramite + '_foto.' + extension;
    blob.setName(nombreFinal);

    // Guardar en la carpeta de Drive
    var archivo = carpeta.createFile(blob);

    // Configurar permisos para que cualquiera con el enlace pueda ver
    archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Retornar el enlace para compartir
    var enlace = archivo.getUrl();
    Logger.log('📷 Foto guardada: ' + nombreFinal + ' -> ' + enlace);

    return enlace;

  } catch (error) {
    Logger.log('⚠️ Error al guardar foto en Drive: ' + error.message);
    // No detener el proceso si falla la foto, retornar indicador de error
    return 'Error al subir foto: ' + error.message;
  }
}


/**
 * Guarda una resolución ambiental (PDF) codificada en base64 en Google Drive.
 * Retorna el enlace público para compartir.
 *
 * @param {string} base64Data - PDF codificado en base64 (puede incluir prefijo data:application/pdf;...)
 * @param {string} nombreArchivo - Nombre original del archivo (ej: 'resolucion.pdf')
 * @param {string} idTramite - ID del trámite para nombrar el archivo
 * @returns {string} URL pública del archivo en Google Drive
 */
function _guardarResolucionEnDrive(base64Data, nombreArchivo, idTramite) {
  try {
    // Obtener la carpeta de destino en Drive para resoluciones
    var carpeta = DriveApp.getFolderById(FOLDER_ID_RESOLUCIONES);

    // Remover el prefijo data:application/pdf;base64, si existe
    var datosLimpios = base64Data;
    if (base64Data.indexOf(',') !== -1) {
      datosLimpios = base64Data.split(',')[1];
    }

    // Tipo MIME fijo para PDF
    var tipoMime = 'application/pdf';

    // Decodificar base64 a blob
    var bytesDecodificados = Utilities.base64Decode(datosLimpios);
    var blob = Utilities.newBlob(bytesDecodificados, tipoMime);

    // Crear nombre descriptivo para el archivo
    var nombreFinal = idTramite + '_resolucion.pdf';
    blob.setName(nombreFinal);

    // Guardar en la carpeta de Drive
    var archivo = carpeta.createFile(blob);

    // Configurar permisos para que cualquiera con el enlace pueda ver
    archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // Retornar el enlace para compartir
    var enlace = archivo.getUrl();
    Logger.log('📄 Resolución guardada: ' + nombreFinal + ' -> ' + enlace);

    return enlace;

  } catch (error) {
    Logger.log('⚠️ Error al guardar resolución en Drive: ' + error.message);
    // No detener el proceso si falla la resolución, retornar indicador de error
    return 'Error al subir resolución: ' + error.message;
  }
}


/**
 * Registra todos los datos de la solicitud en la hoja de Google Sheets.
 * Cada solicitud se agrega como una nueva fila al final de la hoja.
 *
 * Columnas (17 total):
 * A: ID Trámite | B: Tipo de Servicio | C: Fecha y Hora | D: Nombre y Apellidos
 * E: Dirección | F: Ubicación Google Maps | G: Parroquia | H: Cédula
 * I: Teléfono | J: Correo Electrónico | K: Número de Árboles | L: Comentario
 * M: Foto (enlace Drive) | N: Resolución Ambiental (enlace Drive) | O: Estado
 * P: Fecha Atención | Q: Observaciones
 *
 * @param {string} idTramite - ID del trámite generado
 * @param {string} tipoServicio - Tipo de servicio solicitado
 * @param {string} fechaHora - Fecha y hora de registro
 * @param {string} nombre - Nombre y apellidos del solicitante
 * @param {string} direccion - Dirección del lugar
 * @param {string} ubicacion - Enlace de Google Maps con coordenadas
 * @param {string} parroquia - Parroquia seleccionada
 * @param {string} cedula - Número de cédula del solicitante
 * @param {string} telefono - Teléfono de contacto
 * @param {string} correo - Correo electrónico del solicitante
 * @param {string} numeroArboles - Número de árboles
 * @param {string} comentario - Comentario o descripción adicional
 * @param {string} enlaceFoto - Enlace de la foto en Google Drive
 * @param {string} enlaceResolucion - Enlace de la resolución ambiental en Google Drive
 */
function _registrarEnHoja(idTramite, tipoServicio, fechaHora, nombre, direccion, ubicacion,
                          parroquia, cedula, telefono, correo, numeroArboles, comentario,
                          enlaceFoto, enlaceResolucion) {
  var hoja = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

  // Si la hoja está vacía (solo tiene encabezados o está nueva), crear encabezados
  if (hoja.getLastRow() === 0) {
    _crearEncabezados(hoja);
  }

  // Agregar la nueva fila con los datos (17 columnas)
  var nuevaFila = [
    idTramite,          // A: ID Trámite
    tipoServicio,       // B: Tipo de Servicio
    fechaHora,          // C: Fecha y Hora
    nombre,             // D: Nombre y Apellidos
    direccion,          // E: Dirección
    ubicacion,          // F: Ubicación Google Maps
    parroquia,          // G: Parroquia
    cedula,             // H: Cédula
    telefono,           // I: Teléfono
    correo,             // J: Correo Electrónico
    numeroArboles,      // K: Número de Árboles
    comentario,         // L: Comentario
    enlaceFoto,         // M: Foto (enlace Drive)
    enlaceResolucion,   // N: Resolución Ambiental (enlace Drive)
    'Ingresado',        // O: Estado (valor por defecto)
    '',                 // P: Fecha Atención (vacío inicialmente)
    ''                  // Q: Observaciones (vacío inicialmente)
  ];

  hoja.appendRow(nuevaFila);
  Logger.log('📊 Fila agregada a la hoja: ' + idTramite);
}


/**
 * Crea la fila de encabezados en la hoja de cálculo.
 * Se ejecuta automáticamente si la hoja está vacía.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} hoja - Objeto de la hoja de cálculo
 */
function _crearEncabezados(hoja) {
  var encabezados = [
    'ID Trámite',
    'Tipo de Servicio',
    'Fecha y Hora',
    'Nombre y Apellidos',
    'Dirección',
    'Ubicación Google Maps',
    'Parroquia',
    'Cédula',
    'Teléfono',
    'Correo Electrónico',
    'Número de Árboles',
    'Comentario',
    'Foto (enlace Drive)',
    'Resolución Ambiental (enlace Drive)',
    'Estado',
    'Fecha Atención',
    'Observaciones'
  ];

  hoja.getRange(1, 1, 1, encabezados.length).setValues([encabezados]);

  // Formatear la fila de encabezados (negrita y color de fondo)
  var rangoEncabezados = hoja.getRange(1, 1, 1, encabezados.length);
  rangoEncabezados.setFontWeight('bold');
  rangoEncabezados.setBackground('#1a5632'); // Verde institucional
  rangoEncabezados.setFontColor('#FFFFFF');
  rangoEncabezados.setHorizontalAlignment('center');

  // Congelar la primera fila para que siempre sea visible
  hoja.setFrozenRows(1);

  Logger.log('📋 Encabezados creados en la hoja');
}


// =============================================================================
// FUNCIONES DE CORREO ELECTRÓNICO
// =============================================================================

/**
 * Obtiene el texto de la NOTA condicional según el tipo de servicio.
 *
 * @param {string} tipoServicio - Tipo de servicio solicitado
 * @returns {string} Texto de la nota para el correo del ciudadano
 */
function _obtenerNotaServicio(tipoServicio) {
  if (tipoServicio === 'Poda Pública' || tipoServicio === 'Poda Publica') {
    return 'Su solicitud sera atendida en un plazo maximo de quince (15) dias termino, contados a partir de la fecha de emision de este comprobante. Para consultas sobre el estado de su tramite, comuniquese con nosotros indicando su codigo de tramite.';
  } else if (tipoServicio === 'Poda Privada') {
    return 'Un representante de Portoparques EP se comunicara con usted en la brevedad para coordinar la inspeccion y los detalles del servicio.';
  } else if (tipoServicio === 'Tala Pública' || tipoServicio === 'Tala Publica') {
    return 'Su solicitud sera revisada junto con la resolucion ambiental adjunta. El servicio de tala se gestionara en un plazo maximo de quince (15) dias termino, contados a partir de la fecha de emision.';
  } else if (tipoServicio === 'Tala Privada') {
    return 'Su solicitud sera revisada junto con la resolucion ambiental adjunta. Un representante de Portoparques EP se comunicara con usted en la brevedad para coordinar los detalles del servicio.';
  }
  return '';
}


/**
 * Envía correo de confirmación al ciudadano solicitante.
 * Incluye un resumen amigable de la solicitud con el código de trámite.
 *
 * @param {Object} datos - Datos del formulario
 * @param {string} idTramite - Código de trámite generado
 * @param {string} fechaHora - Fecha y hora de registro
 * @param {string} tipoServicio - Tipo de servicio solicitado
 */
function _enviarCorreoCiudadano(datos, idTramite, fechaHora, tipoServicio) {
  try {
    var asunto = 'Solicitud de ' + tipoServicio + ' Recibida - ' + idTramite;

    // Obtener texto de la nota condicional
    var textoNota = _obtenerNotaServicio(tipoServicio);

    var cuerpoHtml = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">'
      + '<div style="background-color: #1a5632; padding: 20px; text-align: center;">'
      + '<h1 style="color: #FFFFFF; margin: 0; font-size: 22px;">PORTOPARQUES EP</h1>'
      + '<p style="color: #c8e6c9; margin: 5px 0 0 0; font-size: 13px;">Empresa Publica de Parques y Espacios Publicos de Portoviejo</p>'
      + '</div>'

      + '<div style="padding: 25px; background-color: #f9f9f9;">'
      + '<p style="font-size: 15px;">Estimado/a <strong>' + _escaparHtml(datos.nombre) + '</strong>,</p>'

      + '<p style="font-size: 15px;">Le informamos que su solicitud de servicio de <strong>' + _escaparHtml(tipoServicio) + '</strong> ha sido <strong style="color: #1a5632;">registrada exitosamente</strong>.</p>'

      + '<div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0;">'
      + '<h2 style="color: #1a5632; font-size: 17px; margin-top: 0;">Detalles de su solicitud:</h2>'
      + '<table style="width: 100%; border-collapse: collapse;">'
      + '<tr><td style="padding: 8px 0; font-size: 14px;"><strong>Codigo de tramite:</strong></td><td style="padding: 8px 0; font-size: 14px; color: #1a5632; font-weight: bold;">' + idTramite + '</td></tr>'
      + '<tr><td style="padding: 8px 0; font-size: 14px;"><strong>Tipo de Servicio:</strong></td><td style="padding: 8px 0; font-size: 14px;">' + _escaparHtml(tipoServicio) + '</td></tr>'
      + '<tr><td style="padding: 8px 0; font-size: 14px;"><strong>Fecha de ingreso:</strong></td><td style="padding: 8px 0; font-size: 14px;">' + fechaHora + '</td></tr>'
      + '<tr><td style="padding: 8px 0; font-size: 14px;"><strong>Direccion:</strong></td><td style="padding: 8px 0; font-size: 14px;">' + _escaparHtml(datos.direccion || '') + '</td></tr>'
      + '<tr><td style="padding: 8px 0; font-size: 14px;"><strong>Parroquia:</strong></td><td style="padding: 8px 0; font-size: 14px;">' + _escaparHtml(datos.parroquia || '') + '</td></tr>'
      + '<tr><td style="padding: 8px 0; font-size: 14px;"><strong>Numero de Arboles:</strong></td><td style="padding: 8px 0; font-size: 14px;">' + _escaparHtml(datos.numeroArboles || '') + '</td></tr>'
      + '<tr><td style="padding: 8px 0; font-size: 14px;"><strong>Comentario:</strong></td><td style="padding: 8px 0; font-size: 14px;">' + _escaparHtml(datos.comentario || 'Sin comentario') + '</td></tr>'
      + '</table>'
      + '</div>'

      // NOTA condicional según tipo de servicio
      + '<div style="background-color: #e8f5e9; border-left: 4px solid #2e7d32; padding: 14px 18px; margin: 18px 0; border-radius: 4px;">'
      + '<p style="margin: 0; font-size: 14px;"><strong>NOTA:</strong> ' + textoNota + '</p>'
      + '</div>'

      + '<div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 12px 16px; margin: 15px 0; border-radius: 4px;">'
      + '<p style="margin: 0; font-size: 14px;"><strong>Importante:</strong> Conserve su codigo de tramite <strong>' + idTramite + '</strong> para futuras consultas sobre el estado de su solicitud.</p>'
      + '</div>'

      + '<p style="font-size: 14px; color: #666;">Si tiene alguna pregunta, puede comunicarse con nosotros:</p>'
      + '</div>'

      + '<div style="background-color: #1a5632; padding: 20px; text-align: center; color: #ffffff;">'
      + '<p style="margin: 0; font-size: 14px;"><strong>Atentamente,</strong></p>'
      + '<p style="margin: 5px 0; font-size: 16px; font-weight: bold;">PORTOPARQUES EP</p>'
      + '<p style="margin: 3px 0; font-size: 12px; color: #c8e6c9;">Empresa Publica de Parques y Espacios Publicos de Portoviejo</p>'
      + '<p style="margin: 8px 0 3px 0; font-size: 13px;">Telf: 0978793338</p>'
      + '<p style="margin: 3px 0; font-size: 13px;">Correo: info@portoparques.gob.ec</p>'
      + '</div>'
      + '</div>';

    GmailApp.sendEmail(datos.correo, asunto, '', { 
      htmlBody: cuerpoHtml,
      name: 'Portoparques EP',
      replyTo: CORREO_INSTITUCIONAL
    });
    Logger.log('📧 Correo de confirmación enviado al ciudadano: ' + datos.correo);

  } catch (error) {
    Logger.log('⚠️ Error al enviar correo al ciudadano: ' + error.message);
    // No detener el proceso si falla el envío del correo
  }
}


/**
 * Envía correo de notificación al correo institucional con TODOS los datos
 * de la solicitud, incluyendo el enlace a la foto y resolución ambiental.
 *
 * @param {Object} datos - Datos del formulario
 * @param {string} idTramite - Código de trámite generado
 * @param {string} fechaHora - Fecha y hora de registro
 * @param {string} enlaceFoto - Enlace de la foto en Google Drive
 * @param {string} enlaceResolucion - Enlace de la resolución ambiental en Google Drive
 * @param {string} tipoServicio - Tipo de servicio solicitado
 */
function _enviarCorreoInstitucional(datos, idTramite, fechaHora, enlaceFoto, enlaceResolucion, tipoServicio) {
  try {
    var asunto = 'Nueva Solicitud de ' + tipoServicio + ' - ' + idTramite;

    var cuerpoHtml = _construirCorreoInterno(datos, idTramite, fechaHora, enlaceFoto, enlaceResolucion, tipoServicio);

    GmailApp.sendEmail(CORREO_INSTITUCIONAL, asunto, '', { 
      htmlBody: cuerpoHtml,
      name: 'Portoparques EP',
      replyTo: CORREO_INSTITUCIONAL
    });
    Logger.log('📧 Correo de notificación enviado a: ' + CORREO_INSTITUCIONAL);

  } catch (error) {
    Logger.log('⚠️ Error al enviar correo institucional: ' + error.message);
  }
}


/**
 * Envía correo de notificación al encargado del área (si está configurado).
 *
 * @param {Object} datos - Datos del formulario
 * @param {string} idTramite - Código de trámite generado
 * @param {string} fechaHora - Fecha y hora de registro
 * @param {string} enlaceFoto - Enlace de la foto en Google Drive
 * @param {string} enlaceResolucion - Enlace de la resolución ambiental en Google Drive
 * @param {string} tipoServicio - Tipo de servicio solicitado
 */
function _enviarCorreoEncargado(datos, idTramite, fechaHora, enlaceFoto, enlaceResolucion, tipoServicio) {
  try {
    var asunto = 'Nueva Solicitud de ' + tipoServicio + ' - ' + idTramite;

    var cuerpoHtml = _construirCorreoInterno(datos, idTramite, fechaHora, enlaceFoto, enlaceResolucion, tipoServicio);

    GmailApp.sendEmail(CORREO_ENCARGADO, asunto, '', {
      htmlBody: cuerpoHtml,
      name: 'Portoparques EP',
      replyTo: CORREO_INSTITUCIONAL
    });
    Logger.log('📧 Correo de notificación enviado al encargado: ' + CORREO_ENCARGADO);

  } catch (error) {
    Logger.log('⚠️ Error al enviar correo al encargado: ' + error.message);
  }
}


/**
 * Construye el cuerpo HTML del correo interno (institucional y encargado).
 * Incluye TODOS los campos del formulario y los enlaces de foto y resolución.
 *
 * @param {Object} datos - Datos del formulario
 * @param {string} idTramite - Código de trámite generado
 * @param {string} fechaHora - Fecha y hora de registro
 * @param {string} enlaceFoto - Enlace de la foto en Google Drive
 * @param {string} enlaceResolucion - Enlace de la resolución ambiental en Google Drive
 * @param {string} tipoServicio - Tipo de servicio solicitado
 * @returns {string} HTML del correo
 */
function _construirCorreoInterno(datos, idTramite, fechaHora, enlaceFoto, enlaceResolucion, tipoServicio) {
  var filasFoto = '';
  if (enlaceFoto && enlaceFoto !== '') {
    filasFoto = '<tr><td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold; width: 200px;">Foto adjunta</td>'
      + '<td style="padding: 10px; border: 1px solid #ddd;"><a href="' + enlaceFoto + '" style="color: #1a5632;" target="_blank">Ver foto en Google Drive</a></td></tr>';
  }

  var filasResolucion = '';
  if (enlaceResolucion && enlaceResolucion !== '') {
    filasResolucion = '<tr><td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold; width: 200px;">Resolucion Ambiental</td>'
      + '<td style="padding: 10px; border: 1px solid #ddd;"><a href="' + enlaceResolucion + '" style="color: #1a5632;" target="_blank">Ver resolucion en Google Drive</a></td></tr>';
  }

  var cuerpoHtml = '<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #333;">'
    + '<div style="background-color: #1a5632; padding: 15px; text-align: center;">'
    + '<h1 style="color: #FFFFFF; margin: 0; font-size: 20px;">NUEVA SOLICITUD DE ' + _escaparHtml(tipoServicio).toUpperCase() + '</h1>'
    + '</div>'

    + '<div style="padding: 20px;">'
    + '<div style="background-color: #e8f5e9; padding: 12px 16px; border-radius: 6px; margin-bottom: 15px;">'
    + '<p style="margin: 0; font-size: 16px;"><strong>Codigo de tramite:</strong> <span style="color: #1a5632; font-size: 18px; font-weight: bold;">' + idTramite + '</span></p>'
    + '<p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Registrado:</strong> ' + fechaHora + '</p>'
    + '</div>'

    + '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">'
    + '<tr style="background-color: #1a5632; color: white;"><th style="padding: 10px; text-align: left;" colspan="2">Datos del Solicitante y la Solicitud</th></tr>'

    + '<tr><td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold; width: 200px;">ID Tramite</td>'
    + '<td style="padding: 10px; border: 1px solid #ddd;">' + idTramite + '</td></tr>'

    + '<tr><td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Tipo de Servicio</td>'
    + '<td style="padding: 10px; border: 1px solid #ddd;">' + _escaparHtml(tipoServicio) + '</td></tr>'

    + '<tr><td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Fecha y Hora</td>'
    + '<td style="padding: 10px; border: 1px solid #ddd;">' + fechaHora + '</td></tr>'

    + '<tr><td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Nombre y Apellidos</td>'
    + '<td style="padding: 10px; border: 1px solid #ddd;">' + _escaparHtml(datos.nombre || '') + '</td></tr>'

    + '<tr><td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Cedula</td>'
    + '<td style="padding: 10px; border: 1px solid #ddd;">' + _escaparHtml(datos.cedula || '') + '</td></tr>'

    + '<tr><td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Telefono</td>'
    + '<td style="padding: 10px; border: 1px solid #ddd;">' + _escaparHtml(datos.telefono || '') + '</td></tr>'

    + '<tr><td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Correo</td>'
    + '<td style="padding: 10px; border: 1px solid #ddd;">' + _escaparHtml(datos.correo || '') + '</td></tr>'

    + '<tr><td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Direccion</td>'
    + '<td style="padding: 10px; border: 1px solid #ddd;">' + _escaparHtml(datos.direccion || '') + '</td></tr>'

    + '<tr><td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Ubicacion Maps</td>'
    + '<td style="padding: 10px; border: 1px solid #ddd;"><a href="' + (datos.ubicacion || '#') + '" style="color: #1a5632;" target="_blank">Ver en Google Maps</a></td></tr>'

    + '<tr><td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Parroquia</td>'
    + '<td style="padding: 10px; border: 1px solid #ddd;">' + _escaparHtml(datos.parroquia || '') + '</td></tr>'

    + '<tr><td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Numero de Arboles</td>'
    + '<td style="padding: 10px; border: 1px solid #ddd;">' + _escaparHtml(datos.numeroArboles || '') + '</td></tr>'

    + '<tr><td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Comentario</td>'
    + '<td style="padding: 10px; border: 1px solid #ddd;">' + _escaparHtml(datos.comentario || 'Sin comentario') + '</td></tr>'

    + filasFoto

    + filasResolucion

    + '<tr><td style="padding: 10px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">Estado</td>'
    + '<td style="padding: 10px; border: 1px solid #ddd;"><span style="background-color: #fff3e0; padding: 3px 10px; border-radius: 12px; font-weight: bold; color: #e65100;">Ingresado</span></td></tr>'
    + '</table>'

    + '<p style="font-size: 13px; color: #999; margin-top: 20px;">Este correo fue generado automaticamente por el sistema web de Portoparques EP.</p>'
    + '</div>'
    + '</div>';

  return cuerpoHtml;
}


// =============================================================================
// FUNCIONES UTILITARIAS
// =============================================================================

/**
 * Escapa caracteres HTML especiales para prevenir inyección de código.
 *
 * @param {string} texto - Texto a escapar
 * @returns {string} Texto con caracteres HTML escapados
 */
function _escaparHtml(texto) {
  if (!texto) return '';
  return texto.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


/**
 * Crea una respuesta JSON estandarizada para el cliente.
 * Incluye cabeceras CORS para permitir solicitudes desde el sitio web.
 *
 * @param {boolean} exito - Indica si la operación fue exitosa
 * @param {string|null} idTramite - ID del trámite generado (null si hubo error)
 * @param {string} mensaje - Mensaje descriptivo del resultado
 * @returns {ContentService.TextOutput} Respuesta JSON formateada
 */
function _crearRespuesta(exito, idTramite, mensaje) {
  var respuesta = {
    success: exito,
    id: idTramite || null,
    mensaje: mensaje
  };

  // Nota sobre CORS: Google Apps Script desplegado como Web App maneja
  // automáticamente las cabeceras CORS cuando se accede mediante
  // el modo "Cualquier persona" y se usa la URL de ejecución.
  // Si necesita respuestas personalizadas, ContentService.TextOutput
  // no permite configurar cabeceras HTTP directamente.
  // La solución recomendada es usar el modo "no-cors" en fetch o
  // enviar como formulario desde el frontend.

  return ContentService
    .createTextOutput(JSON.stringify(respuesta))
    .setMimeType(ContentService.MimeType.JSON);
}


// =============================================================================
// FUNCIÓN DE PRUEBA (para verificar que todo funciona desde el editor)
// =============================================================================

/**
 * Función de prueba que simula el envío de un formulario.
 * Ejecute esta función desde el editor de Apps Script para verificar
 * que la hoja, la carpeta de Drive y los correos están configurados.
 *
 * ⚠️ IMPORTANTE: Antes de ejecutar, asegúrese de haber configurado
 * SHEET_ID y FOLDER_ID con valores reales.
 */
function pruebaEnvioFormulario() {
  var datosPrueba = {
    postData: {
      contents: JSON.stringify({
        tipoServicio: 'Poda Publica',
        nombre: 'Juan Pérez García',
        direccion: 'Av. Metropolitana y Calle 10, frente al parque central',
        ubicacion: 'https://www.google.com/maps?q=-1.0547,-80.4545',
        parroquia: 'Andrés de Vera',
        cedula: '1312345678',
        telefono: '0991234567',
        correo: 'prueba@ejemplo.com', // ⚠️ Cambie esto por un correo real de prueba
        numeroArboles: '3',
        comentario: 'Hay un árbol de mango que tiene ramas que están tocando los cables eléctricos. Necesita poda urgente.',
        foto: '',  // Dejar vacío para prueba sin foto
        fotoNombre: '',
        resolucion: '',  // Dejar vacío para prueba sin resolución (solo requerido para Tala)
        resolucionNombre: ''
      })
    }
  };

  var resultado = doPost(datosPrueba);
  Logger.log('Resultado de prueba: ' + resultado.getContent());
}
