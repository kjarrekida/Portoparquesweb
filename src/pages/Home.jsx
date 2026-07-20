import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaLeaf, FaTools, FaWater, FaArrowRight, FaQuoteLeft, FaCalendarAlt } from 'react-icons/fa'
import './Home.css'

function useAnimateOnScroll() {
    const ref = useRef(null)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible')
                    }
                })
            },
            { threshold: 0.1 }
        )
        const elements = ref.current?.querySelectorAll('.animate-in')
        elements?.forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])
    return ref
}

const services = [
    {
        icon: <FaLeaf />,
        title: 'Áreas Verdes',
        desc: 'Paisajismo, poda ornamental, control fitosanitario y mantenimiento integral de jardines y espacios verdes de la ciudad.',
        color: '#4CAF50'
    },
    {
        icon: <FaTools />,
        title: 'Infraestructura',
        desc: 'Pintura de juegos infantiles, soldadura, sistemas de riego y mantenimiento de mobiliario urbano en parques y plazas.',
        color: '#2196F3'
    },
    {
        icon: <FaWater />,
        title: 'Piletas y Monumentos',
        desc: 'Mantenimiento eléctrico e hidráulico de fuentes ornamentales, iluminación decorativa y preservación de monumentos.',
        color: '#00BCD4'
    }
]

const newsItems = [
    {
        title: 'Convocatoria Pública: Deliberación Pública de Rendición de Cuentas 2025',
        excerpt: 'La Empresa Pública Municipal de Portoparques convoca a la ciudadanía a la Deliberación Pública de Rendición de Cuentas del periodo fiscal 2025.',
        date: '05 May 2026',
        category: 'Rendición de Cuentas'
    },
    {
        title: 'Convocatoria Pública: Asamblea Ciudadana para Rendición de Cuentas 2025',
        excerpt: 'Se convoca a la ciudadanía a participar en la Asamblea Ciudadana para la elección de representantes de las comisiones mixtas de Rendición de Cuentas 2025.',
        date: '11 Mar 2026',
        category: 'Participación Ciudadana'
    },
    {
        title: 'Consulta Ciudadana: Mesas Temáticas para Rendición de Cuentas',
        excerpt: 'Se convoca a la ciudadanía a participar en la Consulta Ciudadana para definir temas y requerimientos sobre los cuales se rendirá cuentas.',
        date: '11 Mar 2026',
        category: 'Participación Ciudadana'
    },
    {
        title: 'Mantenimiento integral en el Parque La Rotonda',
        excerpt: 'Equipos de Portoparques realizaron trabajos de jardinería, pintura y limpieza general en el Parque La Rotonda.',
        date: '28 Feb 2026',
        category: 'Mantenimiento'
    },
    {
        title: 'Rehabilitación de piletas en el Parque Las Vegas',
        excerpt: 'Se completó la rehabilitación del sistema hidráulico de las piletas ornamentales del Parque Las Vegas.',
        date: '22 Feb 2026',
        category: 'Infraestructura'
    }
]

export default function Home() {
    const animRef = useAnimateOnScroll()

    return (
        <div ref={animRef}>
            {/* === HERO === */}
            <section className="hero">
                <div className="hero__bg">
                    <div className="hero__gradient"></div>
                    <div className="hero__particles">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="hero__particle" style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${3 + Math.random() * 4}s`
                            }}></div>
                        ))}
                    </div>
                </div>

                <div className="hero__content container">
                    <div className="hero__badge animate-in">
                        <FaLeaf /> Empresa Pública
                    </div>
                    <h1 className="hero__title animate-in">
                        <span className="hero__title-line">PORTO</span>
                        <span className="hero__title-line hero__title-line--accent">PARQUES</span>
                        <span className="hero__title-ep">EP</span>
                    </h1>
                    <p className="hero__slogan animate-in">¡Crecemos Juntos, Portoviejo!</p>
                    <p className="hero__subtitle animate-in">
                        Manteniendo áreas verdes, infraestructura y espacios públicos
                        para construir una ciudad más saludable y hermosa.
                    </p>
                    <div className="hero__actions animate-in">
                        <Link to="/servicios" className="btn btn-primary">
                            Nuestros Servicios <FaArrowRight />
                        </Link>
                        <Link to="/contacto" className="btn btn-secondary">
                            Contáctenos
                        </Link>
                    </div>
                </div>

                <div className="hero__scroll-indicator">
                    <div className="hero__scroll-mouse">
                        <div className="hero__scroll-wheel"></div>
                    </div>
                    <span>Scroll</span>
                </div>
            </section>

            {/* === SERVICES === */}
            <section className="services section-padding" id="servicios">
                <div className="container">
                    <h2 className="section-title animate-in">Nuestros Servicios</h2>
                    <p className="section-subtitle animate-in">
                        Trabajamos cada día para mantener y embellecer los espacios públicos de Portoviejo,
                        garantizando una mejor calidad de vida para todos los ciudadanos.
                    </p>

                    <div className="services__grid">
                        {services.map((service, i) => (
                            <div key={i} className="services__card glass-card animate-in" style={{ animationDelay: `${i * 0.15}s` }}>
                                <div className="services__icon" style={{ color: service.color, boxShadow: `0 0 30px ${service.color}33` }}>
                                    {service.icon}
                                </div>
                                <h3 className="services__title">{service.title}</h3>
                                <p className="services__desc">{service.desc}</p>
                                <Link to="/servicios" className="services__link" style={{ color: service.color }}>
                                    Más información <FaArrowRight />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* === MISSION BAND === */}
            <section className="mission">
                <div className="mission__bg"></div>
                <div className="container">
                    <div className="mission__content animate-in">
                        <h2 className="mission__title">Nuestra Misión</h2>
                        <p className="mission__text">
                            Garantizar la calidad del paisaje urbano y la sostenibilidad ambiental de Portoviejo,
                            mediante la generación, mantenimiento y administración de áreas verdes, parques,
                            plazas, piletas y monumentos, promoviendo el bienestar ciudadano y la identidad
                            cultural de nuestra ciudad.
                        </p>
                        <Link to="/institucion" className="btn btn-primary">
                            Conoce Más <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* === PARALLAX TESTIMONIAL === */}
            <section className="testimonial section-padding">
                <div className="container">
                    <div className="testimonial__content animate-in">
                        <FaQuoteLeft className="testimonial__quote-icon" />
                        <blockquote className="testimonial__text">
                            "Los parques y espacios públicos son el corazón de nuestra ciudad. En Portoparques
                            trabajamos con pasión para que cada portovejense disfrute de áreas verdes de calidad,
                            porque una ciudad con parques hermosos es una ciudad con ciudadanos felices."
                        </blockquote>
                        <div className="testimonial__author">
                            <div className="testimonial__author-line"></div>
                            <span>Portoparques EP</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* === NEWS === */}
            <section className="news section-padding" id="noticias">
                <div className="container">
                    <h2 className="section-title animate-in">Últimas Noticias</h2>
                    <p className="section-subtitle animate-in">
                        Mantente informado sobre nuestras actividades y proyectos en los parques de Portoviejo.
                    </p>

                    <div className="news__grid">
                        {newsItems.map((item, i) => (
                            <article key={i} className="news__card glass-card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="news__card-image">
                                    <div className="news__card-overlay"></div>
                                    <span className="news__card-category">{item.category}</span>
                                </div>
                                <div className="news__card-body">
                                    <div className="news__card-date">
                                        <FaCalendarAlt /> {item.date}
                                    </div>
                                    <h3 className="news__card-title">{item.title}</h3>
                                    <p className="news__card-excerpt">{item.excerpt}</p>
                                    <Link to="/noticias" className="news__card-link">
                                        Leer más <FaArrowRight />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="news__cta animate-in">
                        <Link to="/noticias" className="btn btn-secondary">
                            Ver Todas las Noticias <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* === CTA === */}
            <section className="cta">
                <div className="container">
                    <div className="cta__content animate-in">
                        <h2 className="cta__title">¿Tienes alguna solicitud o sugerencia?</h2>
                        <p className="cta__text">
                            Estamos aquí para atenderte. Comunícate con nosotros y trabajemos juntos
                            por una Portoviejo más verde y hermosa.
                        </p>
                        <Link to="/contacto" className="btn btn-primary">
                            Contáctenos <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    )
}
