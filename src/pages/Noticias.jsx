import { useEffect, useRef } from 'react'
import { FaCalendarAlt, FaArrowRight, FaTag } from 'react-icons/fa'
import './Noticias.css'

const noticias = [
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
                            <article key={i} className="noticias__card glass-card animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="noticias__card-header">
                                    <div className="noticias__card-image-area">
                                        <div className="noticias__card-gradient"></div>
                                        <span className="noticias__card-category">
                                            <FaTag /> {noticia.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="noticias__card-body">
                                    <div className="noticias__card-meta">
                                        <FaCalendarAlt /> {noticia.date}
                                    </div>
                                    <h2 className="noticias__card-title">{noticia.title}</h2>
                                    <p className="noticias__card-text">{noticia.excerpt}</p>
                                    <button className="noticias__card-btn">
                                        Leer más <FaArrowRight />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
