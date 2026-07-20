import { useEffect, useRef } from 'react'
import { FaLeaf, FaTools, FaWater, FaSeedling, FaPaintBrush, FaBolt, FaTint, FaCog, FaTree, FaCheckCircle } from 'react-icons/fa'
import './Servicios.css'

const servicios = [
    {
        id: 'areas-verdes',
        icon: <FaLeaf />,
        title: 'Mantenimiento de Áreas Verdes',
        color: '#4CAF50',
        description: 'Nos encargamos de la poda ornamental, el control fitosanitario y el mantenimiento integral de todos los jardines, parques y espacios verdes de Portoviejo.',
        items: [
            { icon: <FaSeedling />, text: 'Mantenimiento de paisajismo y jardines' },
            { icon: <FaTree />, text: 'Poda ornamental y mantenimiento de árboles' },
            { icon: <FaLeaf />, text: 'Control fitosanitario y fumigación' },
            { icon: <FaCog />, text: 'Siembra y trasplante de especies' },
            { icon: <FaTint />, text: 'Sistemas de riego automatizado' },
        ]
    },
    {
        id: 'infraestructura',
        icon: <FaTools />,
        title: 'Reparación de Infraestructura',
        color: '#2196F3',
        description: 'Realizamos trabajos de reparación, mantenimiento y mejora de la infraestructura de los espacios públicos, incluyendo zonas de recreación (juegos infantiles), cementerios, monumentos, fuentes ornamentales y mobiliario urbano.',
        items: [
            { icon: <FaPaintBrush />, text: 'Pintura de juegos y mantenimiento de mobiliario' },
            { icon: <FaWater />, text: 'Mantenimiento hidráulico de fuentes y piletas' },
            { icon: <FaTools />, text: 'Soldadura y reparación de estructuras' },
            { icon: <FaBolt />, text: 'Instalaciones eléctricas y alumbrado decorativo' },
            { icon: <FaCheckCircle />, text: 'Restauración y conservación de monumentos' },
        ]
    }
]

export default function Servicios() {
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
        <div ref={ref} className="servicios-page">
            <section className="page-hero">
                <div className="page-hero__bg"></div>
                <div className="container">
                    <h1 className="page-hero__title animate-in">Nuestros Servicios</h1>
                    <p className="page-hero__subtitle animate-in">
                        Ofrecemos servicios especializados para el mantenimiento y embellecimiento
                        de los parques y espacios públicos de Portoviejo.
                    </p>
                </div>
            </section>

            <section className="servicios section-padding">
                <div className="container">
                    {servicios.map((servicio, i) => (
                        <div key={i} id={servicio.id} className={`servicios__block animate-in ${i % 2 !== 0 ? 'servicios__block--reverse' : ''}`}>
                            <div className="servicios__info">
                                <div className="servicios__icon-wrapper" style={{ color: servicio.color, borderColor: `${servicio.color}33` }}>
                                    {servicio.icon}
                                </div>
                                <h2 className="servicios__title" style={{ color: servicio.color }}>{servicio.title}</h2>
                                <p className="servicios__desc">{servicio.description}</p>
                                <ul className="servicios__list">
                                    {servicio.items.map((item, j) => (
                                        <li key={j} className="servicios__list-item">
                                            <span className="servicios__list-icon" style={{ color: servicio.color }}>{item.icon}</span>
                                            <span>{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="servicios__visual glass-card">
                                <div className="servicios__visual-bg" style={{
                                    background: `linear-gradient(135deg, ${servicio.color}22 0%, ${servicio.color}08 100%)`
                                }}>
                                    <div className="servicios__visual-icon" style={{ color: `${servicio.color}40` }}>
                                        {servicio.icon}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
