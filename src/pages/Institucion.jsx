import { useEffect, useRef, useState } from 'react'
import { FaBullseye, FaEye, FaHandshake, FaBalanceScale, FaChartLine, FaSitemap } from 'react-icons/fa'
import './Institucion.css'

const tabs = [
    {
        id: 'mision',
        icon: <FaBullseye />,
        label: 'Misión',
        content: {
            title: 'Nuestra Misión',
            text: 'Garantizar la calidad del paisaje urbano y la sostenibilidad ambiental de Portoviejo, mediante la generación, mantenimiento y administración de áreas verdes, parques, plazas, piletas y monumentos, promoviendo el bienestar ciudadano y la identidad cultural de nuestra ciudad.'
        }
    },
    {
        id: 'vision',
        icon: <FaEye />,
        label: 'Visión',
        content: {
            title: 'Nuestra Visión',
            text: 'Ser la empresa pública líder en la gestión de espacios públicos y áreas verdes a nivel nacional, reconocida por su excelencia en la prestación de servicios, innovación tecnológica y compromiso con la sostenibilidad ambiental, contribuyendo activamente al desarrollo urbano de Portoviejo.'
        }
    },
    {
        id: 'valores',
        icon: <FaHandshake />,
        label: 'Valores',
        content: {
            title: 'Nuestros Valores',
            values: [
                { name: 'Responsabilidad', desc: 'Cumplimos con nuestros compromisos y obligaciones de manera oportuna y eficiente.' },
                { name: 'Transparencia', desc: 'Actuamos con honestidad y apertura en todas nuestras operaciones.' },
                { name: 'Compromiso', desc: 'Dedicamos nuestro esfuerzo al bienestar de la comunidad portovejense.' },
                { name: 'Innovación', desc: 'Buscamos constantemente nuevas formas de mejorar nuestros servicios.' },
                { name: 'Trabajo en equipo', desc: 'Colaboramos activamente entre todos los departamentos y con la comunidad.' },
                { name: 'Sostenibilidad', desc: 'Aplicamos prácticas ambientalmente responsables en todas nuestras acciones.' },
            ]
        }
    },
    {
        id: 'politicas',
        icon: <FaBalanceScale />,
        label: 'Políticas',
        content: {
            title: 'Nuestras Políticas',
            text: 'Nos regimos por políticas de calidad, transparencia, inclusión y sostenibilidad ambiental, asegurando que todos nuestros procesos y servicios cumplan con los más altos estándares y contribuyan al bienestar de la comunidad.'
        }
    },
    {
        id: 'objetivos',
        icon: <FaChartLine />,
        label: 'Objetivos',
        content: {
            title: 'Nuestros Objetivos',
            objectives: [
                'Mantener en óptimas condiciones el 100% de los parques y áreas verdes de Portoviejo.',
                'Implementar sistemas de riego eficientes para reducir el consumo de agua en un 40%.',
                'Incrementar la cobertura verde urbana en un 25% en los próximos 5 años.',
                'Desarrollar programas de educación ambiental para la comunidad.',
                'Modernizar la infraestructura de piletas y monumentos de la ciudad.',
            ]
        }
    },
    {
        id: 'organigrama',
        icon: <FaSitemap />,
        label: 'Organigrama',
        content: {
            title: 'Estructura Organizacional',
            org: true
        }
    }
]

export default function Institucion() {
    const ref = useRef(null)
    const [activeTab, setActiveTab] = useState(0)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
            { threshold: 0.1 }
        )
        ref.current?.querySelectorAll('.animate-in').forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    const tab = tabs[activeTab]

    return (
        <div ref={ref} className="institucion-page">
            <section className="page-hero">
                <div className="page-hero__bg"></div>
                <div className="container">
                    <h1 className="page-hero__title animate-in">Institución</h1>
                    <p className="page-hero__subtitle animate-in">
                        Conoce nuestra misión, visión, valores y estructura organizacional.
                        Trabajamos con transparencia y compromiso por Portoviejo.
                    </p>
                </div>
            </section>

            <section className="institucion section-padding">
                <div className="container">
                    <div className="institucion__tabs animate-in">
                        {tabs.map((t, i) => (
                            <button
                                key={i}
                                className={`institucion__tab ${activeTab === i ? 'institucion__tab--active' : ''}`}
                                onClick={() => setActiveTab(i)}
                            >
                                {t.icon}
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="institucion__content glass-card animate-in">
                        <h2 className="institucion__title">{tab.content.title}</h2>

                        {tab.content.text && (
                            <p className="institucion__text">{tab.content.text}</p>
                        )}

                        {tab.content.values && (
                            <div className="institucion__values-grid">
                                {tab.content.values.map((v, i) => (
                                    <div key={i} className="institucion__value-card">
                                        <h3>{v.name}</h3>
                                        <p>{v.desc}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {tab.content.objectives && (
                            <ul className="institucion__objectives">
                                {tab.content.objectives.map((obj, i) => (
                                    <li key={i} className="institucion__objective">
                                        <span className="institucion__obj-number">{String(i + 1).padStart(2, '0')}</span>
                                        <span>{obj}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {tab.content.org && (
                            <div className="institucion__org">
                                <div className="org-node org-node--root">
                                    <span>Gerente General</span>
                                </div>
                                <div className="org-level">
                                    <div className="org-node">
                                        <span>Dirección Técnica</span>
                                    </div>
                                    <div className="org-node">
                                        <span>Dirección Administrativa</span>
                                    </div>
                                    <div className="org-node">
                                        <span>Dirección Financiera</span>
                                    </div>
                                </div>
                                <div className="org-level">
                                    <div className="org-node org-node--small">Áreas Verdes</div>
                                    <div className="org-node org-node--small">Infraestructura</div>
                                    <div className="org-node org-node--small">Talento Humano</div>
                                    <div className="org-node org-node--small">Contabilidad</div>
                                    <div className="org-node org-node--small">Presupuesto</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
