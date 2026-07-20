import { useEffect, useRef, useState, useCallback } from 'react'
import { FaCalendarAlt, FaArrowRight, FaTag } from 'react-icons/fa'
import './Noticias.css'

const noticias = [
    {
        title: 'Convocatoria Pública: Deliberación Pública de Rendición de Cuentas 2025',
        excerpt: 'La Empresa Pública Municipal de Parques, Cementerios, Áreas Verdes, Zonas de Recreación y Espacios Culturales de Portoviejo convoca a la ciudadanía a la Deliberación Pública de Rendición de Cuentas del periodo fiscal 2025.',
        content: 'Conforme al Art. 13, que establece la fase 3 del proceso de Rendición de Cuentas, regulado mediante la Resolución N° CPCCS-PLE-SG-004-O-2026-0030 del Consejo de Participación Ciudadana y Control Social (CPCCS); en virtud de dar cumplimiento, la EMPRESA PÚBLICA MUNICIPAL DE PARQUES, CEMENTERIOS, ÁREAS VERDES, ZONAS DE RECREACIÓN Y ESPACIOS CULTURALES DE PORTOVIEJO convoca a la ciudadanía portovejense a la: DELIBERACIÓN PÚBLICA DE RENDICIÓN DE CUENTAS DEL PERIODO FISCAL 2025. Fecha: Lunes, 18 de mayo 2026. Hora: 11h30. Lugar: Auditorio del Cuerpo de Bomberos de Portoviejo, ubicado en las calles Ricaurte y Córdova (Esquina).',
        date: '05 May 2026',
        category: 'Rendición de Cuentas',
        image: '/images/convocatoria-deliberacion-publica.jpeg',
    },
    {
        title: 'Convocatoria Pública: Asamblea Ciudadana para Rendición de Cuentas 2025',
        excerpt: 'Se convoca a la ciudadanía portovejense a participar en la Asamblea Ciudadana para la elección de los representantes que integrarán las comisiones mixtas de Rendición de Cuentas del periodo fiscal 2025.',
        content: 'En cumplimiento con lo establecido en el literal e) del Art. 13 de la Resolución No. CPCCS-PLE-SG-004-O-2026-0030 del Consejo de Participación Ciudadana y Control Social (CPCCS), se convoca a la ciudadanía portovejense a participar en la Asamblea Ciudadana, en la cual se tratará la elección de los representantes ciudadanos que integrarán las comisiones mixtas de Rendición de Cuentas para el periodo fiscal 2025, del Gobierno Autónomo Descentralizado Municipal del cantón Portoviejo, sus Empresas Públicas Municipales y Entidades Adscritas. La cita es el jueves 19 de marzo de 2026 a las 15h00 en el Salón del Sindicato de Choferes Provincial de Manabí (Calle Colón 104 y Morales).',
        date: '11 Mar 2026',
        category: 'Participación Ciudadana',
        image: '/images/convocatoria-asamblea-ciudadana.png',
    },
    {
        title: 'Consulta Ciudadana: Mesas Temáticas para Rendición de Cuentas',
        excerpt: 'Se convoca a la ciudadanía a participar en la Consulta Ciudadana para definir los temas y requerimientos ciudadanos sobre los cuales se rendirá cuentas.',
        content: 'En cumplimiento con lo establecido en el literal b) del artículo 13 de la Resolución No. CPCCS-PLE-SG-004-O-2026-0030 del Consejo de Participación Ciudadana y Control Social (CPCCS), se convoca a la ciudadanía portovejense a participar en la Consulta Ciudadana, donde se abordarán las mesas temáticas de consulta ciudadana para el listado de temas o requerimientos ciudadanos sobre los cuales rendir cuenta. La cita es el jueves 19 de marzo de 2026 a las 16h00 en el Salón del Sindicato de Choferes Provincial de Manabí (Calle Colón 104 y Morales).',
        date: '11 Mar 2026',
        category: 'Participación Ciudadana',
        image: '/images/convocatoria-consulta-ciudadana.png',
    },
    {
        title: 'Mantenimiento integral en el Parque La Rotonda',
        excerpt: 'Equipos de Portoparques realizaron trabajos de jardinería, pintura de juegos infantiles y limpieza general en el emblemático Parque La Rotonda, beneficiando a miles de familias portovejenses.',
        date: '28 Feb 2026',
        category: 'Mantenimiento',
    },
    {
        title: 'Rehabilitación de piletas en el Parque Las Vegas',
        excerpt: 'Se completó exitosamente la rehabilitación del sistema hidráulico y eléctrico de las piletas ornamentales del Parque Las Vegas, restaurando su funcionamiento al 100%.',
        date: '22 Feb 2026',
        category: 'Infraestructura',
    },
    {
        title: 'Jornada de arborización en el Parque El Mamey',
        excerpt: 'Más de 200 árboles nativos fueron plantados en el Parque El Mamey como parte del programa de reforestación urbana "Portoviejo Verde", con participación ciudadana.',
        date: '15 Feb 2026',
        category: 'Áreas Verdes',
    },
    {
        title: 'Nuevo sistema de riego automatizado instalado',
        excerpt: 'Portoparques implementó un moderno sistema de riego automatizado en tres parques principales, optimizando el consumo de agua en un 40%.',
        date: '10 Feb 2026',
        category: 'Tecnología',
    },
    {
        title: 'Restauración de monumentos históricos',
        excerpt: 'Se iniciaron trabajos de restauración y conservación en los monumentos históricos ubicados en los parques centrales de la ciudad.',
        date: '5 Feb 2026',
        category: 'Patrimonio',
    },
    {
        title: 'Capacitación en eco-jardinería para el equipo técnico',
        excerpt: 'Personal de Portoparques participó en un taller de eco-jardinería y manejo sostenible de áreas verdes, fortaleciendo sus capacidades técnicas.',
        date: '1 Feb 2026',
        category: 'Capacitación',
    },
]

export default function Noticias() {
    const ref = useRef(null)
    const [lightboxImg, setLightboxImg] = useState(null)

    const closeLightbox = useCallback(() => setLightboxImg(null), [])

    useEffect(() => {
        const handleEsc = (e) => e.key === 'Escape' && closeLightbox()
        if (lightboxImg) {
            document.addEventListener('keydown', handleEsc)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEsc)
            document.body.style.overflow = ''
        }
    }, [lightboxImg, closeLightbox])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
            { threshold: 0.1 }
        )
        ref.current?.querySelectorAll('.animate-in').forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={ref} className="noticias-page">
            <section className="page-hero">
                <div className="page-hero__bg"></div>
                <div className="container">
                    <h1 className="page-hero__title animate-in">Noticias</h1>
                    <p className="page-hero__subtitle animate-in">
                        Mantente informado sobre nuestras actividades, proyectos y logros en la gestión
                        de los parques y espacios públicos de Portoviejo.
                    </p>
                </div>
            </section>

            <section className="noticias section-padding">
                <div className="container">
                    <div className="noticias__grid">
                        {noticias.map((noticia, i) => (
                            <article key={i} className={`noticias__card glass-card animate-in${noticia.image ? ' noticias__card--featured' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="noticias__card-header">
                                    {noticia.image ? (
                                        <div className="noticias__card-image-area noticias__card-image-area--real">
                                            <img src={noticia.image} alt={noticia.title} className="noticias__card-img" />
                                            <span className="noticias__card-category">
                                                <FaTag /> {noticia.category}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="noticias__card-image-area">
                                            <div className="noticias__card-gradient"></div>
                                            <span className="noticias__card-category">
                                                <FaTag /> {noticia.category}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="noticias__card-body">
                                    <div className="noticias__card-meta">
                                        <FaCalendarAlt /> {noticia.date}
                                    </div>
                                    <h2 className="noticias__card-title">{noticia.title}</h2>
                                    <p className="noticias__card-text">{noticia.excerpt}</p>
                                    {noticia.content && (
                                        <p className="noticias__card-content">{noticia.content}</p>
                                    )}
                                    {noticia.image && (
                                        <div className="noticias__card-banner" onClick={() => setLightboxImg(noticia.image)}>
                                            <img src={noticia.image} alt={`Banner - ${noticia.title}`} className="noticias__card-banner-img" />
                                            <span className="noticias__card-banner-hint">Clic para ampliar</span>
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {lightboxImg && (
                <div className="noticias__lightbox" onClick={closeLightbox}>
                    <div className="noticias__lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="noticias__lightbox-close" onClick={closeLightbox} aria-label="Cerrar">&times;</button>
                        <img src={lightboxImg} alt="Convocatoria ampliada" className="noticias__lightbox-img" />
                    </div>
                </div>
            )}
        </div>
    )
}
