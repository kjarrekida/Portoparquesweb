import { useEffect, useRef, useState, useCallback } from 'react'
import {
    FaTree, FaCheckCircle, FaExclamationTriangle,
    FaTimes, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaLeaf,
    FaSyncAlt, FaInfoCircle, FaWhatsapp, FaClipboardCheck, FaCamera,
    FaFilePdf, FaTrashAlt
} from 'react-icons/fa'
import { GiAxeInLog } from 'react-icons/gi'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { Turnstile } from '@marsidev/react-turnstile'
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
const sanitizeInput = (str) => str.replace(/[&<>"'/]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;', '/': '&#x2F;' }[char]))

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

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

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function esTala(tipo) {
    return tipo === 'Tala Pública' || tipo === 'Tala Privada'
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function PodaPublica() {
    const pageRef = useRef(null)
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
    const [errors, setErrors] = useState({})
    const [globalError, setGlobalError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [tramiteId, setTramiteId] = useState('')
    const [isDragOver, setIsDragOver] = useState(false)
    const [isDragOverPdf, setIsDragOverPdf] = useState(false)
    const [showTalaModal, setShowTalaModal] = useState(false)
    const [honeypot, setHoneypot] = useState('')
    const [turnstileToken, setTurnstileToken] = useState('')

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
            { threshold: 0.1 }
        )
        pageRef.current?.querySelectorAll('.animate-in').forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng
                setCoords({ lat: lat.toFixed(6), lng: lng.toFixed(6) })
                setErrors(prev => ({ ...prev, ubicacion: '' }))
            }
        })
        return null
    }

    useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })
    }, [])

    const handleTipoServicio = useCallback((tipo) => {
        setTipoServicio(tipo)
        setErrors(prev => ({ ...prev, tipoServicio: '' }))
        if (esTala(tipo)) setShowTalaModal(true)
        if (!esTala(tipo)) { setResolucion(null); setResolucionBase64(null) }
    }, [])

    const handleChange = useCallback((e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }, [errors])

    const handleFileChange = useCallback((file) => {
        if (!file) return
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
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

    const validate = () => {
        const e = {}
        if (!tipoServicio) e.tipoServicio = 'Seleccione un tipo de servicio'
        if (!form.nombre.trim()) e.nombre = 'El nombre es requerido'
        if (!form.direccion.trim()) e.direccion = 'La dirección es requerida'
        if (!coords) e.ubicacion = 'Haga clic en el mapa para marcar la ubicación'
        if (!form.parroquia) e.parroquia = 'Seleccione una parroquia'
        if (!validateCedula(form.cedula.trim())) e.cedula = 'Ingrese una cédula válida'
        if (!validatePhone(form.telefono.trim())) e.telefono = 'Ingrese un número válido'
        if (!validateEmail(form.correo.trim())) e.correo = 'Ingrese un correo válido'
        if (!form.numeroArboles || parseInt(form.numeroArboles) < 1) e.numeroArboles = 'Ingrese al menos 1 árbol'
        if (esTala(tipoServicio) && !resolucion) e.resolucion = 'La resolución ambiental es obligatoria'
        if (!turnstileToken) e.turnstile = 'Complete la verificación de seguridad'
        return e
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setGlobalError('')
        if (honeypot) { setSubmitted(true); return }
        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }
        setIsSubmitting(true)
        try {
            const mapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
            if (IS_NODE_BACKEND) {
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
                formData.append('turnstileToken', turnstileToken)
                if (foto) formData.append('fotoAntes', foto)
                if (resolucion) formData.append('resolucion', resolucion)
                const response = await fetch(BACKEND_URL, { method: 'POST', body: formData })
                const data = await response.json()
                if (data.status === 'success') { setTramiteId(data.idTramite); setSubmitted(true) } else setGlobalError('Error: ' + data.message)
            } else {
                const payload = {
                    tipoServicio, nombre: sanitizeInput(form.nombre.trim()), direccion: sanitizeInput(form.direccion.trim()),
                    ubicacion: mapsUrl, parroquia: form.parroquia, cedula: form.cedula.trim(), telefono: form.telefono.trim(),
                    correo: form.correo.trim().toLowerCase(), numeroArboles: form.numeroArboles, comentario: sanitizeInput(form.comentario.trim()),
                    turnstileToken
                };
                if (fotoPreview) { payload.foto = fotoPreview.split(',')[1]; payload.fotoNombre = foto.name; }
                if (resolucionBase64) { payload.resolucion = resolucionBase64.split(',')[1]; payload.resolucionNombre = resolucion.name; }
                const response = await fetch(BACKEND_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
                const data = await response.json();
                if (data.success) { setTramiteId(data.id); setSubmitted(true) } else setGlobalError('Error: ' + (data.mensaje || 'Error desconocido'))
            }
        } catch (error) { setGlobalError('Error al enviar la solicitud.') } finally { setIsSubmitting(false) }
    }

    const handleNewRequest = () => {
        setSubmitted(false); setForm({ nombre: '', direccion: '', parroquia: '', cedula: '', telefono: '', correo: '', comentario: '', numeroArboles: '' });
        setTipoServicio(''); setCoords(null); setFoto(null); setFotoPreview(null); setResolucion(null); setResolucionBase64(null); setTurnstileToken(''); setHoneypot(''); window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div ref={pageRef} className="poda-page">
            {showTalaModal && (
                <div className="tala-modal-overlay" onClick={() => setShowTalaModal(false)}>
                    <div className="tala-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="tala-modal__header"><h3>INFORMACIÓN IMPORTANTE</h3></div>
                        <div className="tala-modal__body">
                            <p>Antes de solicitar la tala, debe contar con la resolución de la Dirección de Riesgo y Sostenibilidad Ambiental del GAD Portoviejo.</p>
                        </div>
                        <div className="tala-modal__footer"><button onClick={() => setShowTalaModal(false)}>Entendido</button></div>
                    </div>
                </div>
            )}
            <section className="poda section-padding">
                <div className="container">
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
