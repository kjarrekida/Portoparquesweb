import { useEffect, useRef } from 'react'
import { FaFileAlt, FaMapMarkerAlt, FaCross, FaBuilding, FaClipboardCheck, FaIdCard, FaPhoneAlt, FaClock } from 'react-icons/fa'
import './Cementerio.css'

const tramites = [
    {
        icon: <FaCross />,
        title: 'Permiso de Exhumación',
        description: 'Autorización para la extracción de restos mortales de una sepultura, cumpliendo con los requisitos legales y sanitarios establecidos.',
        color: '#5C6BC0',
    },
    {
        icon: <FaFileAlt />,
        title: 'Permiso de Sepultura',
        description: 'Trámite para obtener la autorización de inhumación en los cementerios municipales administrados por Portoparques EP.',
        color: '#26A69A',
    },
    {
        icon: <FaBuilding />,
        title: 'Permiso de Construcción en Cementerios',
        description: 'Autorización para la edificación o modificación de estructuras funerarias dentro de los cementerios municipales.',
        color: '#7E57C2',
    },
    {
        icon: <FaClipboardCheck />,
        title: 'Certificado de Inhumación',
        description: 'Documento oficial que certifica el acto de inhumación realizado en alguno de los cementerios municipales.',
        color: '#42A5F5',
    },
    {
        icon: <FaIdCard />,
        title: 'Certificado de Registro Civil',
        description: 'Expedición de certificados relacionados con el registro civil de defunción y otros trámites asociados.',
        color: '#EF5350',
    },
]

export default function Cementerio() {
    const ref = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
            { threshold: 0.1 }
        )
        ref.current?.querySelectorAll('.animate-in').forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={ref} className="cementerio-page">
            {/* Hero */}
            <section className="page-hero cementerio-hero">
                <div className="page-hero__bg cementerio-hero__bg"></div>
                <div className="container">
                    <h1 className="page-hero__title animate-in">Cementerios Municipales</h1>
                    <p className="page-hero__subtitle animate-in">
                        Administración y gestión de los cementerios municipales de Portoviejo
                    </p>
                </div>
            </section>

            {/* Intro */}
            <section className="cementerio-intro section-padding">
                <div className="container">
                    <div className="cementerio-intro__content animate-in">
                        <div className="cementerio-intro__accent-bar"></div>
                        <p className="cementerio-intro__text">
                            <strong>Portoparques EP</strong> se encarga también de la administración y manejo de los
                            <strong> cementerios municipales</strong> de la ciudad de Portoviejo. A través de nuestras
                            oficinas administrativas, ofrecemos diversos servicios y trámites relacionados con la
                            gestión cementerial, garantizando un servicio digno, ordenado y respetuoso para la ciudadanía.
                        </p>
                    </div>
                </div>
            </section>

            {/* Servicios / Trámites */}
            <section className="cementerio-servicios section-padding">
                <div className="container">
                    <h2 className="section-title animate-in">Servicios y Trámites</h2>
                    <p className="section-subtitle animate-in">
                        Todos nuestros servicios se realizan de manera <strong>presencial</strong> en nuestras
                        oficinas administrativas de manejo de cementerios.
                    </p>

                    <div className="cementerio-grid">
                        {tramites.map((tramite, i) => (
                            <div
                                key={i}
                                className="cementerio-card glass-card animate-in"
                                style={{ '--card-accent': tramite.color }}
                            >
                                <div className="cementerio-card__icon" style={{ background: `${tramite.color}20`, color: tramite.color }}>
                                    {tramite.icon}
                                </div>
                                <h3 className="cementerio-card__title">{tramite.title}</h3>
                                <p className="cementerio-card__desc">{tramite.description}</p>
                                <div className="cementerio-card__badge">
                                    <FaFileAlt />
                                    <span>Trámite Presencial</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Ubicación */}
            <section className="cementerio-ubicacion section-padding">
                <div className="container">
                    <div className="cementerio-ubicacion__card glass-card animate-in">
                        <div className="cementerio-ubicacion__info">
                            <h2 className="cementerio-ubicacion__title">
                                <FaMapMarkerAlt className="cementerio-ubicacion__title-icon" />
                                Oficinas Administrativas
                            </h2>
                            <p className="cementerio-ubicacion__desc">
                                Todos los trámites relacionados con los cementerios municipales se realizan de
                                manera <strong>presencial</strong> en nuestras oficinas administrativas.
                            </p>

                            <div className="cementerio-ubicacion__details">
                                <div className="cementerio-ubicacion__detail">
                                    <FaMapMarkerAlt className="cementerio-ubicacion__detail-icon" />
                                    <div>
                                        <strong>Dirección</strong>
                                        <p>Calle Coronel Sabando y 10 de Agosto, en el interior del Cementerio General Municipal de la ciudad de Portoviejo</p>
                                    </div>
                                </div>
                                <div className="cementerio-ubicacion__detail">
                                    <FaClock className="cementerio-ubicacion__detail-icon" />
                                    <div>
                                        <strong>Horario de Atención</strong>
                                        <p>Lunes a Viernes: 08:00 - 16:30</p>
                                    </div>
                                </div>
                                <div className="cementerio-ubicacion__detail">
                                    <FaPhoneAlt className="cementerio-ubicacion__detail-icon" />
                                    <div>
                                        <strong>Contacto</strong>
                                        <p>Acérquese directamente a nuestras oficinas para más información</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="cementerio-ubicacion__map">
                            <div className="cementerio-ubicacion__map-placeholder">
                                <FaMapMarkerAlt className="cementerio-ubicacion__map-icon" />
                                <span>Cementerio General Municipal</span>
                                <span className="cementerio-ubicacion__map-address">Calle Coronel Sabando y 10 de Agosto</span>
                                <span className="cementerio-ubicacion__map-city">Portoviejo, Manabí, Ecuador</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
