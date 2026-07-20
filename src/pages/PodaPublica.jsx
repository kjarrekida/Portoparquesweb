import { useEffect, useRef, useState, useCallback } from 'react'
import {
    FaTree, FaCheckCircle, FaExclamationTriangle, FaCloudUploadAlt,
    FaTimes, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaLeaf,
    FaSyncAlt, FaInfoCircle, FaWhatsapp, FaClipboardCheck, FaCamera,
    FaFilePdf, FaTrashAlt
} from 'react-icons/fa'
import { GiAxeInLog } from 'react-icons/gi'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './PodaPublica.css'

// ============================================================
// CONFIGURACIÓN — Backend Dinámico
// ============================================================
const IS_NODE_BACKEND = import.meta.env.VITE_USE_NODE_BACKEND === 'true';
const BACKEND_URL = IS_NODE_BACKEND 
    ? `${import.meta.env.VITE_NODE_BACKEND_URL}/solicitudes` 
    : import.meta.env.VITE_GAS_BACKEND_URL;

// Parroquias de Portoviejo
const PARROQUIAS = [
    'Portoviejo', '18 de Octubre', '12 de Marzo', 'San Pablo',
    'Picoaza', 'Colon', 'Andres de Vera', 'Simon Bolivar',
    'Abdon Calderón', 'Pueblo Nuevo', 'Riochico', 'Crucita',
    'Francisco Pacheco', 'Alhajuela', 'San Placido', 'Chirijos'
]

// Tipos de servicio disponibles
const TIPOS_SERVICIO = [
    { id: 'poda-publica', label: 'Poda Pública', icon: 'tree', description: 'Árboles en áreas públicas' },
    { id: 'poda-privada', label: 'Poda Privada', icon: 'tree', description: 'Árboles en propiedades privadas' },
    { id: 'tala-publica', label: 'Tala Pública', icon: 'axe', description: 'Árboles en áreas públicas' },
    { id: 'tala-privada', label: 'Tala Privada', icon: 'axe', description: 'Árboles en propiedades privadas' },
]

// Coordenadas centro Portoviejo
const PORTOVIEJO_CENTER = [-1.0546, -80.4545]
const PORTOVIEJO_ZOOM = 13

// Mensajes de éxito según tipo de servicio
const MENSAJES_EXITO = {
    'Poda Pública': 'Su solicitud será atendida en un plazo máximo de quince (15) días término, contados a partir de la fecha de emisión de este comprobante. Para consultas sobre el estado de su trámite, comuníquese con nosotros indicando su código de trámite.',
    'Poda Privada': 'Un representante de Portoparques EP se comunicará con usted en la brevedad para coordinar la inspección y los detalles del servicio.',
    'Tala Pública': 'Su solicitud será revisada junto con la resolución ambiental adjunta. El servicio de tala se gestionará en un plazo máximo de quince (15) días término, contados a partir de la fecha de emisión.',
    'Tala Privada': 'Su solicitud será revisada junto con la resolución ambiental adjunta. Un representante de Portoparques EP se comunicará con usted en la brevedad para coordinar los detalles del servicio.',
}

// ============================================================
// UTILIDADES
// ============================================================
function sanitizeInput(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;', '/': '&#x2F;' }
    return str.replace(/[&<>"'/]/g, (char) => map[char])
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Validación de cédula ecuatoriana (algoritmo módulo 10)
function validateCedula(cedula) {
    if (!/^\d{10}$/.test(cedula)) return false
    const provincia = parseInt(cedula.substring(0, 2))
    if (provincia < 1 || provincia > 24) return false
    const tercerDigito = parseInt(cedula[2])
    if (tercerDigito >= 6) return false

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2]
    let suma = 0
    for (let i = 0; i < 9; i++) {
        let valor = parseInt(cedula[i]) * coeficientes[i]
        if (valor > 9) valor -= 9
        suma += valor
    }
    const verificador = suma % 10 === 0 ? 0 : 10 - (suma % 10)
    return verificador === parseInt(cedula[9])
}

function validatePhone(phone) {
    const cleaned = phone.replace(/[\s\-()]/g, '')
    return /^0\d{9}$/.test(cleaned) || /^\+593\d{9}$/.test(cleaned)
}

function generateCaptcha() {
    const a = Math.floor(Math.random() * 20) + 1
    const b = Math.floor(Math.random() * 15) + 1
    const ops = ['+', '-']
    const op = ops[Math.floor(Math.random() * ops.length)]
    const question = op === '-' && a < b ? `${b} ${op} ${a}` : `${a} ${op} ${b}`
    const answer = op === '+' ? (op === '-' && a < b ? b - a : a + b) : (op === '-' && a < b ? b - a : a - b)
    return { question, answer }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Helpers para tipo de servicio
function esTala(tipo) {
    return tipo === 'Tala Pública' || tipo === 'Tala Privada'
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function PodaPublica() {
    const pageRef = useRef(null)
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markerRef = useRef(null)

    // Form state
    const [tipoServicio, setTipoServicio] = useState('')
    const [form, setForm] = useState({
        nombre: '', direccion: '', parroquia: '', cedula: '',
        telefono: '', correo: '', comentario: '', numeroArboles: ''
    })
    const [coords, setCoords] = useState(null)
    const [foto, setFoto] = useState(null)
    const [fotoPreview, setFotoPreview] = useState(null)
    const [resolucion, setResolucion] = useState(null)
    const [resolucionBase64, setResolucionBase64] = useState(null)
    const [captcha, setCaptcha] = useState(generateCaptcha())
    const [captchaInput, setCaptchaInput] = useState('')
    const [errors, setErrors] = useState({})
    const [globalError, setGlobalError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [tramiteId, setTramiteId] = useState('')
    const [isDragOver, setIsDragOver] = useState(false)
    const [isDragOverPdf, setIsDragOverPdf] = useState(false)
    const [showTalaModal, setShowTalaModal] = useState(false)

    // Animations observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
            { threshold: 0.1 }
        )
        pageRef.current?.querySelectorAll('.animate-in').forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    // Componente interno para manejar clics en el mapa
    const MapClickHandler = () => {
        const map = useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng
                setCoords({ lat: lat.toFixed(6), lng: lng.toFixed(6) })
                if (errors.ubicacion) {
                    setErrors(prev => ({ ...prev, ubicacion: '' }))
                }
            }
        })
        
        // Fix for blank map issue when container dimensions aren't immediately ready
        useEffect(() => {
            const timeout = setTimeout(() => {
                map.invalidateSize();
            }, 250);
            return () => clearTimeout(timeout);
        }, [map]);
        
        return null;
    }

    // Fix Leaflet default icon issue globally
    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })
    }, [])

    // Reseteamos el formulario cuando cambia el tipo de servicio
    useEffect(() => {
        // ... lógica si fuera necesario
    }, [])

    // Handle service type selection
    const handleTipoServicio = useCallback((tipo) => {
        setTipoServicio(tipo)
        if (errors.tipoServicio) {
            setErrors(prev => ({ ...prev, tipoServicio: '' }))
        }
        // Show tala modal if selecting a tala service
        if (esTala(tipo)) {
            setShowTalaModal(true)
        }
        // Clear resolution if switching away from tala
        if (!esTala(tipo)) {
            setResolucion(null)
            setResolucionBase64(null)
        }
    }, [errors.tipoServicio])

    // Close tala modal
    const closeTalaModal = useCallback(() => {
        setShowTalaModal(false)
    }, [])

    // Handle form field changes
    const handleChange = useCallback((e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }, [errors])

    // Handle image upload
    const handleFileChange = useCallback((file) => {
        if (!file) return

        const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
        if (!validTypes.includes(file.type)) {
            setErrors(prev => ({ ...prev, foto: 'Solo se permiten archivos PNG o JPEG' }))
            return
        }
        if (file.size > 3 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, foto: 'La imagen no debe superar los 3MB' }))
            return
        }

        setFoto(file)
        setErrors(prev => ({ ...prev, foto: '' }))

        const reader = new FileReader()
        reader.onload = (e) => setFotoPreview(e.target.result)
        reader.readAsDataURL(file)
    }, [])

    // Handle PDF resolution upload
    const handleResolucionChange = useCallback((file) => {
        if (!file) return

        if (file.type !== 'application/pdf') {
            setErrors(prev => ({ ...prev, resolucion: 'Solo se permiten archivos PDF' }))
            return
        }
        if (file.size > 1 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, resolucion: 'El archivo no debe superar 1MB' }))
            return
        }

        setResolucion(file)
        setErrors(prev => ({ ...prev, resolucion: '' }))

        const reader = new FileReader()
        reader.onload = (e) => setResolucionBase64(e.target.result)
        reader.readAsDataURL(file)
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setIsDragOver(false)
        const file = e.dataTransfer?.files?.[0]
        if (file) handleFileChange(file)
    }, [handleFileChange])

    const handleDropPdf = useCallback((e) => {
        e.preventDefault()
        setIsDragOverPdf(false)
        const file = e.dataTransfer?.files?.[0]
        if (file) handleResolucionChange(file)
    }, [handleResolucionChange])

    const removePhoto = useCallback(() => {
        setFoto(null)
        setFotoPreview(null)
    }, [])

    const removeResolucion = useCallback(() => {
        setResolucion(null)
        setResolucionBase64(null)
    }, [])

    const refreshCaptcha = useCallback(() => {
        setCaptcha(generateCaptcha())
        setCaptchaInput('')
    }, [])

    // Validate all fields
    const validate = () => {
        const e = {}

        if (!tipoServicio) e.tipoServicio = 'Seleccione un tipo de servicio'

        if (!form.nombre.trim()) e.nombre = 'El nombre es requerido'
        else if (form.nombre.trim().length < 3) e.nombre = 'Ingrese un nombre válido'

        if (!form.direccion.trim()) e.direccion = 'La dirección es requerida'
        else if (form.direccion.trim().length < 5) e.direccion = 'Ingrese una dirección válida'

        if (!coords) e.ubicacion = 'Haga clic en el mapa para marcar la ubicación'

        if (!form.parroquia) e.parroquia = 'Seleccione una parroquia'

        if (!form.cedula.trim()) e.cedula = 'La cédula es requerida'
        else if (!validateCedula(form.cedula.trim())) e.cedula = 'Ingrese una cédula válida'

        if (!form.telefono.trim()) e.telefono = 'El teléfono es requerido'
        else if (!validatePhone(form.telefono.trim())) e.telefono = 'Ingrese un número válido (ej: 0978793338)'

        if (!form.correo.trim()) e.correo = 'El correo es requerido'
        else if (!validateEmail(form.correo.trim())) e.correo = 'Ingrese un correo válido'

        if (!form.numeroArboles || parseInt(form.numeroArboles) < 1) e.numeroArboles = 'Ingrese al menos 1 árbol'
        else if (parseInt(form.numeroArboles) > 99) e.numeroArboles = 'Máximo 99 árboles'

        if (form.comentario.length > 200) e.comentario = 'Máximo 200 caracteres'

        // Validar resolución ambiental obligatoria para Tala
        if (esTala(tipoServicio) && !resolucion) {
            e.resolucion = 'La resolución ambiental es obligatoria para solicitudes de tala'
        }

        if (!captchaInput.trim()) e.captcha = 'Complete la verificación'
        else if (parseInt(captchaInput) !== captcha.answer) {
            e.captcha = 'Respuesta incorrecta'
            refreshCaptcha()
        }

        return e
    }

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault()
        setGlobalError('')

        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            // Scroll to first error
            const firstErrorField = document.querySelector('.poda__field--error, .poda__map-container--error, .poda__captcha--error, .service-type-selector--error')
            firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            return
        }

        setIsSubmitting(true)

        try {
            // Build Google Maps URL from coords
            const mapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`

            if (IS_NODE_BACKEND) {
                // LÓGICA NUEVA: BACKEND NODE.JS (FormData)
                const formData = new FormData()
                formData.append('tipoServicio', tipoServicio)
                formData.append('nombreApellidos', sanitizeInput(form.nombre.trim()))
                formData.append('direccion', sanitizeInput(form.direccion.trim()))
                formData.append('ubicacionMaps', mapsUrl)
                formData.append('parroquia', form.parroquia)
                formData.append('cedula', form.cedula.trim())
                formData.append('telefono', form.telefono.trim())
                formData.append('correo', form.correo.trim().toLowerCase())
                formData.append('numeroArboles', form.numeroArboles)
                formData.append('comentario', sanitizeInput(form.comentario.trim()))
                
                if (foto) formData.append('fotoAntes', foto)
                if (resolucion) formData.append('resolucion', resolucion)

                const response = await fetch(BACKEND_URL, {
                    method: 'POST',
                    body: formData
                })

                const data = await response.json()
                if (data.status === 'success') {
                    setTramiteId(data.idTramite)
                    setSubmitted(true)
                } else {
                    setGlobalError('Error: ' + data.message)
                }

            } else {
                // LÓGICA ORIGINAL: GOOGLE APPS SCRIPT (JSON)
                const payload = {
                    tipoServicio,
                    nombre: sanitizeInput(form.nombre.trim()),
                    direccion: sanitizeInput(form.direccion.trim()),
                    ubicacion: mapsUrl,
                    parroquia: form.parroquia,
                    cedula: form.cedula.trim(),
                    telefono: form.telefono.trim(),
                    correo: form.correo.trim().toLowerCase(),
                    numeroArboles: form.numeroArboles,
                    comentario: sanitizeInput(form.comentario.trim()),
                };

                if (fotoPreview) {
                    payload.foto = fotoPreview.split(',')[1]; // Extraer base64
                    payload.fotoNombre = foto.name;
                }
                
                if (resolucionBase64) {
                    payload.resolucion = resolucionBase64.split(',')[1];
                    payload.resolucionNombre = resolucion.name;
                }

                // Usamos fetch con redirect 'follow' para Google Scripts
                const response = await fetch(BACKEND_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    setTramiteId(data.id);
                    setSubmitted(true);
                } else {
                    setGlobalError('Error: ' + (data.mensaje || 'Error desconocido del servidor'));
                }
            }

        } catch (error) {
            console.error('Error al enviar:', error)
            setGlobalError('Error al enviar la solicitud. Por favor, intente nuevamente.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle new request after success
    const handleNewRequest = () => {
        setTipoServicio('')
        setForm({
            nombre: '', direccion: '', parroquia: '', cedula: '',
            telefono: '', correo: '', comentario: '', numeroArboles: ''
        })
        setCoords(null)
        setFoto(null)
        setFotoPreview(null)
        setResolucion(null)
        setResolucionBase64(null)
        setCaptcha(generateCaptcha())
        setCaptchaInput('')
        setErrors({})
        setGlobalError('')
        setSubmitted(false)
        setTramiteId('')

        // Reset map marker
        if (markerRef.current && mapInstanceRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current)
            markerRef.current = null
            mapInstanceRef.current.setView(PORTOVIEJO_CENTER, PORTOVIEJO_ZOOM)
        }

        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const charCount = form.comentario.length

    return (
        <div ref={pageRef} className="poda-page">
            {/* ===== MODAL TALA ===== */}
            {showTalaModal && (
                <div className="tala-modal-overlay" onClick={closeTalaModal}>
                    <div className="tala-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="tala-modal__header">
                            <h3 className="tala-modal__title">INFORMACIÓN IMPORTANTE</h3>
                            <p className="tala-modal__subtitle">Trámite de Tala de Árboles</p>
                        </div>
                        <div className="tala-modal__body">
                            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '20px' }}>
                                Antes de realizar su solicitud de tala, tenga en cuenta los siguientes pasos:
                            </p>
                            <div className="tala-modal__steps">
                                <div className="tala-modal__step">
                                    <div className="tala-modal__step-number">1</div>
                                    <div className="tala-modal__step-text">
                                        Ingresar el trámite en la <strong style={{ color: '#fff' }}>Dirección de Riesgo y Sostenibilidad Ambiental</strong> del GAD Portoviejo.
                                    </div>
                                </div>
                                <div className="tala-modal__step">
                                    <div className="tala-modal__step-number">2</div>
                                    <div className="tala-modal__step-text">
                                        Con la resolución en digital de dicha dirección, ingresar el trámite en la dirección web{' '}
                                        <a href="/solicitud-servicios" onClick={(e) => e.preventDefault()}>
                                            portoparques.gob.ec/solicitud-servicios
                                        </a>, llenando el formulario con todos los campos solicitados.
                                    </div>
                                </div>
                                <div className="tala-modal__step">
                                    <div className="tala-modal__step-number">3</div>
                                    <div className="tala-modal__step-text">
                                        Si es <strong style={{ color: '#fff' }}>pública</strong> la tala, en un término máximo de 8 días se gestionará el servicio de tala. Si es <strong style={{ color: '#fff' }}>privada</strong>, un agente de Portoparques EP se comunicará con usted en la brevedad.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="tala-modal__footer">
                            <button className="tala-modal__btn" onClick={closeTalaModal}>
                                Entendido, continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero */}
            <section className="page-hero poda-hero">
                <div className="page-hero__bg poda-hero__bg"></div>
                <div className="container">
                    <h1 className="page-hero__title animate-in">Solicitud de Servicios</h1>
                    <p className="page-hero__subtitle animate-in">
                        Solicite el servicio de poda o tala de árboles en áreas públicas y privadas
                        del cantón Portoviejo. Su solicitud será atendida por nuestro equipo técnico.
                    </p>
                </div>
            </section>

            {/* Intro */}
            <section className="poda-intro section-padding">
                <div className="container">
                    <div className="poda-intro__content animate-in">
                        <div className="poda-intro__accent-bar"></div>
                        <p className="poda-intro__text">
                            <strong>Portoparques EP</strong> ofrece servicios de <strong>poda y tala de árboles</strong> en
                            áreas públicas y privadas del cantón Portoviejo, contribuyendo al mantenimiento y embellecimiento
                            de nuestros espacios verdes. Seleccione el tipo de servicio que necesita y complete el formulario
                            a continuación. Nuestro equipo técnico evaluará su solicitud y coordinará la
                            intervención correspondiente.
                        </p>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section className="poda section-padding">
                <div className="container">
                    <div className="poda__grid">
                        {/* Form */}
                        <div className="poda__form-wrapper animate-in">
                            <h2 className="poda__form-title">
                                {submitted ? '✅ Solicitud Registrada' : 'Formulario de Solicitud'}
                            </h2>
                            {!submitted && (
                                <p className="poda__form-subtitle">
                                    Seleccione el tipo de servicio y complete todos los campos obligatorios (*) para registrar su solicitud.
                                </p>
                            )}

                            {submitted ? (
                                /* ===== SUCCESS SCREEN ===== */
                                <div className="poda__success">
                                    <div className="poda__success-icon">
                                        <FaCheckCircle />
                                    </div>
                                    <h3 className="poda__success-title">¡Solicitud Registrada Exitosamente!</h3>
                                    <p className="poda__success-text">
                                        Su solicitud ha sido registrada y se ha enviado un correo de confirmación
                                        a su dirección de correo electrónico. Conserve su código de trámite.
                                    </p>

                                    <div className="poda__success-code">
                                        <span className="poda__success-code-label">Código de trámite</span>
                                        <span className="poda__success-code-value">{tramiteId}</span>
                                    </div>

                                    <div className="poda__success-details">
                                        <div className="poda__success-detail">
                                            <span className="poda__success-detail-label">Tipo de Servicio</span>
                                            <span className="poda__success-detail-value">{tipoServicio}</span>
                                        </div>
                                        <div className="poda__success-detail">
                                            <span className="poda__success-detail-label">Solicitante</span>
                                            <span className="poda__success-detail-value">{form.nombre}</span>
                                        </div>
                                        <div className="poda__success-detail">
                                            <span className="poda__success-detail-label">Parroquia</span>
                                            <span className="poda__success-detail-value">{form.parroquia}</span>
                                        </div>
                                        <div className="poda__success-detail">
                                            <span className="poda__success-detail-label">Fecha</span>
                                            <span className="poda__success-detail-value">
                                                {new Date().toLocaleString('es-EC', {
                                                    dateStyle: 'long', timeStyle: 'short'
                                                })}
                                            </span>
                                        </div>
                                        <div className="poda__success-detail">
                                            <span className="poda__success-detail-label">Estado</span>
                                            <span className="poda__success-detail-value" style={{ color: 'var(--green-400)' }}>
                                                Ingresado
                                            </span>
                                        </div>
                                    </div>

                                    {/* Nota adaptativa según tipo de servicio */}
                                    <div style={{
                                        background: 'rgba(255, 152, 0, 0.1)',
                                        border: '1px solid rgba(255, 152, 0, 0.3)',
                                        borderRadius: '10px',
                                        padding: '16px 20px',
                                        margin: '20px 0',
                                        fontSize: '0.88rem',
                                        color: '#ffcc80',
                                        lineHeight: '1.6'
                                    }}>
                                        <strong style={{ color: '#ffb74d' }}>Nota importante: </strong>
                                        {MENSAJES_EXITO[tipoServicio] || ''}
                                    </div>

                                    <button
                                        className="btn btn-primary poda__success-btn"
                                        onClick={handleNewRequest}
                                    >
                                        Nueva Solicitud
                                    </button>
                                </div>
                            ) : (
                                /* ===== FORM ===== */
                                <>
                                    {globalError && (
                                        <div className="poda__alert poda__alert--error">
                                            <FaExclamationTriangle />
                                            <span>{globalError}</span>
                                        </div>
                                    )}

                                    <form className="poda__form" onSubmit={handleSubmit} noValidate>
                                        {/* ===== Tipo de Servicio ===== */}
                                        <div className="poda__field">
                                            <label>
                                                Tipo de Servicio <span className="poda__required">*</span>
                                            </label>
                                            <div className={`service-type-selector ${errors.tipoServicio ? 'service-type-selector--error' : ''}`}>
                                                {TIPOS_SERVICIO.map(tipo => (
                                                    <div
                                                        key={tipo.id}
                                                        className={`service-type-card ${tipoServicio === tipo.label ? 'active' : ''}`}
                                                        onClick={() => handleTipoServicio(tipo.label)}
                                                    >
                                                        <div className="service-type-card__icon">
                                                            {tipo.icon === 'tree' ? <FaTree /> : <GiAxeInLog />}
                                                        </div>
                                                        <div className="service-type-card__label">{tipo.label}</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#888' }}>{tipo.description}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.tipoServicio && <span className="poda__error"><FaExclamationTriangle /> {errors.tipoServicio}</span>}
                                        </div>

                                        {/* Nombre y Apellidos */}
                                        <div className={`poda__field ${errors.nombre ? 'poda__field--error' : ''}`}>
                                            <label htmlFor="poda-nombre">
                                                Nombre y Apellidos <span className="poda__required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="poda-nombre"
                                                name="nombre"
                                                value={form.nombre}
                                                onChange={handleChange}
                                                placeholder="Ingrese su nombre completo"
                                                maxLength={100}
                                                autoComplete="name"
                                            />
                                            {errors.nombre && <span className="poda__error"><FaExclamationTriangle /> {errors.nombre}</span>}
                                        </div>

                                        {/* Dirección */}
                                        <div className={`poda__field ${errors.direccion ? 'poda__field--error' : ''}`}>
                                            <label htmlFor="poda-direccion">
                                                Dirección <span className="poda__required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="poda-direccion"
                                                name="direccion"
                                                value={form.direccion}
                                                onChange={handleChange}
                                                placeholder="Calle principal y secundaria, sector"
                                                maxLength={200}
                                                autoComplete="street-address"
                                            />
                                            {errors.direccion && <span className="poda__error"><FaExclamationTriangle /> {errors.direccion}</span>}
                                        </div>

                                        {/* Mapa interactivo */}
                                        <div className="poda__field">
                                            <label className="poda__map-label">
                                                Ubicación en el mapa <span className="poda__required">*</span>
                                            </label>
                                            <div className={`poda__map-container ${errors.ubicacion ? 'poda__map-container--error' : ''}`}>
                                                <div className="poda__map" style={{ height: '280px', width: '100%', zIndex: 1 }}>
                                                    <MapContainer 
                                                        center={PORTOVIEJO_CENTER} 
                                                        zoom={PORTOVIEJO_ZOOM} 
                                                        style={{ height: '100%', width: '100%' }}
                                                    >
                                                        <TileLayer
                                                            attribution='&copy; Esri'
                                                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                                                        />
                                                        <MapClickHandler />
                                                        {coords && <Marker position={[coords.lat, coords.lng]} />}
                                                    </MapContainer>
                                                </div>
                                                {coords ? (
                                                    <div className="poda__map-coords">
                                                        <FaMapMarkerAlt />
                                                        <span>Ubicación seleccionada: {coords.lat}, {coords.lng}</span>
                                                    </div>
                                                ) : (
                                                    <div className="poda__map-hint">
                                                        <FaInfoCircle />
                                                        <span>Haga clic en el mapa para marcar la ubicación del árbol</span>
                                                    </div>
                                                )}
                                            </div>
                                            {errors.ubicacion && <span className="poda__error"><FaExclamationTriangle /> {errors.ubicacion}</span>}
                                        </div>

                                        {/* Parroquia + Cédula */}
                                        <div className="poda__form-row">
                                            <div className={`poda__field ${errors.parroquia ? 'poda__field--error' : ''}`}>
                                                <label htmlFor="poda-parroquia">
                                                    Parroquia <span className="poda__required">*</span>
                                                </label>
                                                <select
                                                    id="poda-parroquia"
                                                    name="parroquia"
                                                    value={form.parroquia}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Seleccione una parroquia</option>
                                                    {PARROQUIAS.map(p => (
                                                        <option key={p} value={p}>{p}</option>
                                                    ))}
                                                </select>
                                                {errors.parroquia && <span className="poda__error"><FaExclamationTriangle /> {errors.parroquia}</span>}
                                            </div>

                                            <div className={`poda__field ${errors.cedula ? 'poda__field--error' : ''}`}>
                                                <label htmlFor="poda-cedula">
                                                    Cédula de Ciudadanía <span className="poda__required">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="poda-cedula"
                                                    name="cedula"
                                                    value={form.cedula}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                                        setForm(prev => ({ ...prev, cedula: val }))
                                                        if (errors.cedula) setErrors(prev => ({ ...prev, cedula: '' }))
                                                    }}
                                                    placeholder="1234567890"
                                                    maxLength={10}
                                                    inputMode="numeric"
                                                />
                                                {errors.cedula && <span className="poda__error"><FaExclamationTriangle /> {errors.cedula}</span>}
                                            </div>
                                        </div>

                                        {/* Teléfono + Correo */}
                                        <div className="poda__form-row">
                                            <div className={`poda__field ${errors.telefono ? 'poda__field--error' : ''}`}>
                                                <label htmlFor="poda-telefono">
                                                    Teléfono de Contacto <span className="poda__required">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="poda-telefono"
                                                    name="telefono"
                                                    value={form.telefono}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^\d+\-\s()]/g, '').slice(0, 15)
                                                        setForm(prev => ({ ...prev, telefono: val }))
                                                        if (errors.telefono) setErrors(prev => ({ ...prev, telefono: '' }))
                                                    }}
                                                    placeholder="0978793338"
                                                    maxLength={15}
                                                    inputMode="tel"
                                                    autoComplete="tel"
                                                />
                                                {errors.telefono && <span className="poda__error"><FaExclamationTriangle /> {errors.telefono}</span>}
                                            </div>

                                            <div className={`poda__field ${errors.correo ? 'poda__field--error' : ''}`}>
                                                <label htmlFor="poda-correo">
                                                    Correo Electrónico <span className="poda__required">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    id="poda-correo"
                                                    name="correo"
                                                    value={form.correo}
                                                    onChange={handleChange}
                                                    placeholder="ejemplo@correo.com"
                                                    maxLength={150}
                                                    autoComplete="email"
                                                />
                                                {errors.correo && <span className="poda__error"><FaExclamationTriangle /> {errors.correo}</span>}
                                            </div>
                                        </div>

                                        {/* Número de Árboles */}
                                        <div className={`poda__field ${errors.numeroArboles ? 'poda__field--error' : ''}`}>
                                            <label htmlFor="poda-num-arboles">
                                                Número de Árboles a Intervenir <span className="poda__required">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                id="poda-num-arboles"
                                                name="numeroArboles"
                                                value={form.numeroArboles}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                                                    setForm(prev => ({ ...prev, numeroArboles: val }))
                                                    if (errors.numeroArboles) setErrors(prev => ({ ...prev, numeroArboles: '' }))
                                                }}
                                                placeholder="1"
                                                min={1}
                                                max={99}
                                                className="poda-form__trees-input"
                                                inputMode="numeric"
                                            />
                                            {errors.numeroArboles && <span className="poda__error"><FaExclamationTriangle /> {errors.numeroArboles}</span>}
                                        </div>

                                        {/* Comentario */}
                                        <div className={`poda__field ${errors.comentario ? 'poda__field--error' : ''}`}>
                                            <label htmlFor="poda-comentario">
                                                Comentario
                                            </label>
                                            <textarea
                                                id="poda-comentario"
                                                name="comentario"
                                                value={form.comentario}
                                                onChange={handleChange}
                                                placeholder="Describa brevemente la situación del árbol que requiere intervención..."
                                                maxLength={200}
                                                rows={3}
                                            ></textarea>
                                            <span className={`poda__char-count ${charCount > 180 ? (charCount >= 200 ? 'poda__char-count--limit' : 'poda__char-count--warning') : ''}`}>
                                                {charCount}/200 caracteres
                                            </span>
                                            {errors.comentario && <span className="poda__error"><FaExclamationTriangle /> {errors.comentario}</span>}
                                        </div>

                                        {/* Foto */}
                                        <div className="poda__field">
                                            <label>
                                                Foto <span style={{ color: 'var(--dark-400)', fontWeight: 'var(--fw-regular)' }}>(opcional — PNG o JPEG, máx 3MB)</span>
                                            </label>
                                            {fotoPreview ? (
                                                <div className="poda__upload-area poda__upload-area--has-file">
                                                    <div className="poda__preview">
                                                        <img src={fotoPreview} alt="Preview" className="poda__preview-img" />
                                                        <div className="poda__preview-info">
                                                            <div className="poda__preview-name">{foto?.name}</div>
                                                            <div className="poda__preview-size">{formatFileSize(foto?.size || 0)}</div>
                                                        </div>
                                                        <button type="button" className="poda__preview-remove" onClick={removePhoto}>
                                                            <FaTimes /> Quitar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    className={`poda__upload-area ${isDragOver ? 'poda__upload-area--dragover' : ''} ${errors.foto ? 'poda__upload-area--error' : ''}`}
                                                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                                                    onDragLeave={() => setIsDragOver(false)}
                                                    onDrop={handleDrop}
                                                >
                                                    <FaCamera className="poda__upload-icon" />
                                                    <div className="poda__upload-text">
                                                        Arrastre una imagen o haga clic para seleccionar
                                                    </div>
                                                    <div className="poda__upload-hint">
                                                        PNG o JPEG • Máximo 3MB
                                                    </div>
                                                    <input
                                                        type="file"
                                                        className="poda__upload-input"
                                                        accept="image/png,image/jpeg,image/jpg"
                                                        onChange={(e) => handleFileChange(e.target.files?.[0])}
                                                    />
                                                </div>
                                            )}
                                            {errors.foto && <span className="poda__error"><FaExclamationTriangle /> {errors.foto}</span>}
                                        </div>

                                        {/* ===== Resolución Ambiental (solo Tala) ===== */}
                                        {esTala(tipoServicio) && (
                                            <div className={`poda__field conditional-field-enter ${errors.resolucion ? 'poda__field--error' : ''}`}>
                                                <label>
                                                    Resolución Ambiental <span className="poda__required">*</span>
                                                    <span style={{ color: 'var(--dark-400)', fontWeight: 'var(--fw-regular)', fontSize: '0.82rem' }}>
                                                        {' '}(PDF, máx 1MB)
                                                    </span>
                                                </label>
                                                <p style={{ color: '#78909c', fontSize: '0.82rem', margin: '0 0 10px' }}>
                                                    Suba la resolución de la Dirección de Riesgo y Sostenibilidad Ambiental del GAD Portoviejo.
                                                </p>
                                                {resolucion ? (
                                                    <div className="poda-form__pdf-preview">
                                                        <FaFilePdf className="poda-form__pdf-preview-icon" />
                                                        <div className="poda-form__pdf-preview-info">
                                                            <div className="poda-form__pdf-preview-name">{resolucion.name}</div>
                                                            <div className="poda-form__pdf-preview-size">{formatFileSize(resolucion.size)}</div>
                                                        </div>
                                                        <button type="button" className="poda-form__pdf-remove" onClick={removeResolucion}>
                                                            <FaTrashAlt /> Quitar
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`poda-form__pdf-zone ${isDragOverPdf ? 'drag-over' : ''}`}
                                                        onDragOver={(e) => { e.preventDefault(); setIsDragOverPdf(true) }}
                                                        onDragLeave={() => setIsDragOverPdf(false)}
                                                        onDrop={handleDropPdf}
                                                    >
                                                        <FaFilePdf className="poda-form__pdf-icon" />
                                                        <div className="poda-form__pdf-text">
                                                            Arrastre el PDF o haga clic para seleccionar
                                                        </div>
                                                        <div className="poda-form__pdf-hint">
                                                            Solo PDF • Máximo 1MB
                                                        </div>
                                                        <input
                                                            type="file"
                                                            className="poda__upload-input"
                                                            accept="application/pdf"
                                                            onChange={(e) => handleResolucionChange(e.target.files?.[0])}
                                                        />
                                                    </div>
                                                )}
                                                {errors.resolucion && <span className="poda__error"><FaExclamationTriangle /> {errors.resolucion}</span>}
                                            </div>
                                        )}

                                        {/* Captcha */}
                                        <div className="poda__field">
                                            <label>
                                                Verificación de seguridad <span className="poda__required">*</span>
                                            </label>
                                            <div className={`poda__captcha ${errors.captcha ? 'poda__captcha--error' : ''}`}>
                                                <span className="poda__captcha-question">{captcha.question}</span>
                                                <span className="poda__captcha-equals">=</span>
                                                <input
                                                    type="text"
                                                    value={captchaInput}
                                                    onChange={(e) => {
                                                        setCaptchaInput(e.target.value.replace(/[^\d-]/g, '').slice(0, 3))
                                                        if (errors.captcha) setErrors(prev => ({ ...prev, captcha: '' }))
                                                    }}
                                                    placeholder="?"
                                                    inputMode="numeric"
                                                    maxLength={3}
                                                    id="poda-captcha"
                                                />
                                                <button
                                                    type="button"
                                                    className="poda__captcha-refresh"
                                                    onClick={refreshCaptcha}
                                                    aria-label="Cambiar operación"
                                                    title="Cambiar operación"
                                                >
                                                    <FaSyncAlt />
                                                </button>
                                            </div>
                                            {errors.captcha && <span className="poda__error"><FaExclamationTriangle /> {errors.captcha}</span>}
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            className="btn btn-primary poda__submit"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <span className="poda__submit-loading">
                                                    <span className="poda__spinner"></span>
                                                    Enviando solicitud...
                                                </span>
                                            ) : (
                                                <>
                                                    <FaClipboardCheck /> Enviar Solicitud
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="poda__sidebar animate-in">
                            {/* Info Card */}
                            <div className="poda__info-card">
                                <div className="poda__info-icon-header">
                                    <div className="poda__info-icon-circle" style={{ background: 'rgba(76, 175, 80, 0.15)', color: '#4CAF50' }}>
                                        <FaTree />
                                    </div>
                                    <span className="poda__info-title">Nuestros Servicios</span>
                                </div>
                                <p className="poda__info-text">
                                    <strong>Portoparques EP</strong> ofrece servicios de <strong>poda y tala de árboles</strong> en
                                    áreas públicas y privadas del cantón Portoviejo, garantizando la seguridad ciudadana
                                    y preservando la estética de los espacios verdes.
                                </p>
                                <div className="poda__info-list">
                                    <div className="poda__info-list-item">
                                        <FaLeaf className="poda__info-list-icon" />
                                        <span>Poda de ramas que afectan el cableado eléctrico o estructuras</span>
                                    </div>
                                    <div className="poda__info-list-item">
                                        <FaLeaf className="poda__info-list-icon" />
                                        <span>Reducción de copa para árboles con crecimiento excesivo</span>
                                    </div>
                                    <div className="poda__info-list-item">
                                        <FaLeaf className="poda__info-list-icon" />
                                        <span>Tala de árboles con resolución ambiental aprobada</span>
                                    </div>
                                    <div className="poda__info-list-item">
                                        <FaLeaf className="poda__info-list-icon" />
                                        <span>Poda ornamental y de mantenimiento preventivo</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Card */}
                            <div className="poda__info-card">
                                <div className="poda__info-icon-header">
                                    <div className="poda__info-icon-circle" style={{ background: 'rgba(33, 150, 243, 0.15)', color: '#2196F3' }}>
                                        <FaPhoneAlt />
                                    </div>
                                    <span className="poda__info-title">Contáctenos</span>
                                </div>
                                <div className="poda__info-list" style={{ gap: 'var(--space-sm)' }}>
                                    <a href="tel:0978793338" className="poda__contact-item">
                                        <div className="poda__contact-icon" style={{ background: 'rgba(33, 150, 243, 0.15)', color: '#2196F3' }}>
                                            <FaPhoneAlt />
                                        </div>
                                        <div>
                                            <div className="poda__contact-label">Teléfono</div>
                                            <div className="poda__contact-value">0978793338</div>
                                        </div>
                                    </a>
                                    <a href="https://wa.me/593978793338" target="_blank" rel="noopener noreferrer" className="poda__contact-item">
                                        <div className="poda__contact-icon" style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25D366' }}>
                                            <FaWhatsapp />
                                        </div>
                                        <div>
                                            <div className="poda__contact-label">WhatsApp</div>
                                            <div className="poda__contact-value">0978793338</div>
                                        </div>
                                    </a>
                                    <a href="mailto:info@portoparques.gob.ec" className="poda__contact-item">
                                        <div className="poda__contact-icon" style={{ background: 'rgba(255, 152, 0, 0.15)', color: '#FF9800' }}>
                                            <FaEnvelope />
                                        </div>
                                        <div>
                                            <div className="poda__contact-label">Correo</div>
                                            <div className="poda__contact-value">info@portoparques.gob.ec</div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
