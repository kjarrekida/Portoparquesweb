import { useEffect, useRef, useState } from 'react'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaWhatsapp, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import './Contacto.css'

function sanitizeInput(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;', '/': '&#x2F;' }
    return str.replace(/[&<>"'/]/g, (char) => map[char])
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const contactInfo = [
    { icon: <FaMapMarkerAlt />, label: 'Dirección', value: 'Interior del Parque La Rotonda, Portoviejo, Ecuador', color: '#4CAF50' },
    { icon: <FaMapMarkerAlt />, label: 'Oficina', value: 'Calle 26 de Septiembre, Parque El Mamey', color: '#8BC34A' },
    { icon: <FaPhone />, label: 'Teléfono', value: '05 370 0250 ext. 9300', href: 'tel:053700250', color: '#2196F3' },
    { icon: <FaWhatsapp />, label: 'WhatsApp', value: '0978 765 189', href: 'https://wa.me/593978765189', color: '#25D366' },
    { icon: <FaEnvelope />, label: 'Correo', value: 'info@portoparques.gob.ec', href: 'mailto:info@portoparques.gob.ec', color: '#FF9800' },
    { icon: <FaClock />, label: 'Horario', value: 'Lunes a Viernes: 08:00 - 17:00', color: '#9C27B0' },
]

export default function Contacto() {
    const ref = useRef(null)
    const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' })
    const [errors, setErrors] = useState({})
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
            { threshold: 0.1 }
        )
        ref.current?.querySelectorAll('.animate-in').forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const newErrors = {}

        if (!form.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
        if (!form.email.trim()) newErrors.email = 'El correo electrónico es requerido'
        else if (!validateEmail(form.email)) newErrors.email = 'Ingrese un correo válido'
        if (!form.asunto.trim()) newErrors.asunto = 'El asunto es requerido'
        if (!form.mensaje.trim()) newErrors.mensaje = 'El mensaje es requerido'
        else if (form.mensaje.trim().length < 10) newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // Sanitize inputs
        const sanitizedData = {
            nombre: sanitizeInput(form.nombre.trim()),
            email: sanitizeInput(form.email.trim()),
            asunto: sanitizeInput(form.asunto.trim()),
            mensaje: sanitizeInput(form.mensaje.trim()),
        }

        console.log('Formulario enviado:', sanitizedData)
        setSubmitted(true)
        setForm({ nombre: '', email: '', asunto: '', mensaje: '' })
        setErrors({})

        setTimeout(() => setSubmitted(false), 5000)
    }

    return (
        <div ref={ref} className="contacto-page">
            <section className="page-hero">
                <div className="page-hero__bg"></div>
                <div className="container">
                    <h1 className="page-hero__title animate-in">Contáctenos</h1>
                    <p className="page-hero__subtitle animate-in">
                        Estamos aquí para atenderte. Comunícate con nosotros para cualquier consulta,
                        solicitud o sugerencia sobre los parques y espacios públicos de Portoviejo.
                    </p>
                </div>
            </section>

            <section className="contacto section-padding">
                <div className="container">
                    <div className="contacto__grid">
                        {/* Contact Form */}
                        <div className="contacto__form-wrapper animate-in">
                            <h2 className="contacto__form-title">Envíanos un mensaje</h2>

                            {submitted && (
                                <div className="contacto__alert contacto__alert--success">
                                    <FaCheckCircle />
                                    <span>¡Mensaje enviado exitosamente! Nos comunicaremos contigo pronto.</span>
                                </div>
                            )}

                            <form className="contacto__form" onSubmit={handleSubmit} noValidate>
                                <div className={`contacto__field ${errors.nombre ? 'contacto__field--error' : ''}`}>
                                    <label htmlFor="nombre">Nombre completo *</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={form.nombre}
                                        onChange={handleChange}
                                        placeholder="Ingrese su nombre completo"
                                        maxLength={100}
                                        autoComplete="name"
                                    />
                                    {errors.nombre && <span className="contacto__error"><FaExclamationTriangle /> {errors.nombre}</span>}
                                </div>

                                <div className={`contacto__field ${errors.email ? 'contacto__field--error' : ''}`}>
                                    <label htmlFor="email">Correo electrónico *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="ejemplo@correo.com"
                                        maxLength={150}
                                        autoComplete="email"
                                    />
                                    {errors.email && <span className="contacto__error"><FaExclamationTriangle /> {errors.email}</span>}
                                </div>

                                <div className={`contacto__field ${errors.asunto ? 'contacto__field--error' : ''}`}>
                                    <label htmlFor="asunto">Asunto *</label>
                                    <input
                                        type="text"
                                        id="asunto"
                                        name="asunto"
                                        value={form.asunto}
                                        onChange={handleChange}
                                        placeholder="Asunto de su mensaje"
                                        maxLength={200}
                                    />
                                    {errors.asunto && <span className="contacto__error"><FaExclamationTriangle /> {errors.asunto}</span>}
                                </div>

                                <div className={`contacto__field ${errors.mensaje ? 'contacto__field--error' : ''}`}>
                                    <label htmlFor="mensaje">Mensaje *</label>
                                    <textarea
                                        id="mensaje"
                                        name="mensaje"
                                        value={form.mensaje}
                                        onChange={handleChange}
                                        placeholder="Escriba su mensaje aquí..."
                                        rows={5}
                                        maxLength={2000}
                                    ></textarea>
                                    {errors.mensaje && <span className="contacto__error"><FaExclamationTriangle /> {errors.mensaje}</span>}
                                </div>

                                <button type="submit" className="btn btn-primary contacto__submit">
                                    Enviar Mensaje
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="contacto__info animate-in">
                            <h2 className="contacto__info-title">Información de Contacto</h2>
                            <div className="contacto__info-cards">
                                {contactInfo.map((item, i) => (
                                    <div key={i} className="contacto__info-card">
                                        <div className="contacto__info-icon" style={{ color: item.color, background: `${item.color}15` }}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <span className="contacto__info-label">{item.label}</span>
                                            {item.href ? (
                                                <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="contacto__info-value">
                                                    {item.value}
                                                </a>
                                            ) : (
                                                <span className="contacto__info-value">{item.value}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Map Placeholder */}
                            <div className="contacto__map glass-card">
                                <div className="contacto__map-inner">
                                    <FaMapMarkerAlt className="contacto__map-pin" />
                                    <p>Parque La Rotonda</p>
                                    <p className="contacto__map-sub">Portoviejo, Manabí, Ecuador</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
