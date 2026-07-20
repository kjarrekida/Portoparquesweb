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
                            <div className="org-chart">
                                <div className="org-legend">
                                    <div className="org-legend-item"><span className="org-legend-color org-gray"></span> PROCESO GOBERNANTE</div>
                                    <div className="org-legend-item"><span className="org-legend-color org-green"></span> PROCESOS ADJETIVOS DE ASESORÍA</div>
                                    <div className="org-legend-item"><span className="org-legend-color org-orange"></span> PROCESOS ADJETIVOS DE APOYO</div>
                                    <div className="org-legend-item"><span className="org-legend-color org-blue"></span> PROCESOS AGREGADORES DE VALOR</div>
                                </div>

                                <div className="org-tree">
                                    <div className="org-node org-gray">DIRECTORIO</div>
                                    <div className="org-line-vertical"></div>
                                    <div className="org-node org-gray">GERENTE GENERAL</div>
                                    
                                    <div className="org-asesorias">
                                        <div className="org-asesoria-left">
                                            <div className="org-node org-green">ASESORÍA JURÍDICA</div>
                                            <div className="org-node org-green" style={{marginTop: '20px'}}>COMUNICACIÓN SOCIAL Y RELACIONES PÚBLICAS</div>
                                        </div>
                                        <div className="org-asesoria-center">
                                            <div className="org-line-vertical-long"></div>
                                        </div>
                                        <div className="org-asesoria-right">
                                            <div className="org-node org-green">PLANIFICACIÓN Y CONTROL DE GESTIÓN</div>
                                        </div>
                                    </div>

                                    <div className="org-branches">
                                        <div className="org-branch">
                                            <div className="org-node org-orange">DIRECCIÓN ADMINISTRATIVA Y FINANCIERA</div>
                                            <div className="org-sub-branches">
                                                <div className="org-node sub org-orange">GESTIÓN FINANCIERA</div>
                                                <div className="org-node sub org-orange">GESTIÓN DE TALENTO HUMANO</div>
                                                <div className="org-node sub org-orange">GESTIÓN ADMINISTRATIVA</div>
                                            </div>
                                        </div>
                                        <div className="org-branch">
                                            <div className="org-node org-blue">DIRECCIÓN DE MANTENIMIENTO</div>
                                            <div className="org-sub-branches">
                                                <div className="org-node sub org-blue">GESTIÓN DE MANTENIMIENTO DE INFRAESTRUCTURA</div>
                                                <div className="org-node sub org-blue">GESTIÓN DE MANTENIMIENTO DE ÁREAS VERDES</div>
                                                <div className="org-node sub org-blue">GESTIÓN DE MANTENIMIENTO DE CEMENTERIOS</div>
                                            </div>
                                        </div>
                                        <div className="org-branch">
                                            <div className="org-node org-blue">DIRECCIÓN COMERCIAL</div>
                                            <div className="org-sub-branches">
                                                <div className="org-node sub org-blue">GESTIÓN DE ATRACCIÓN COMERCIAL</div>
                                                <div className="org-node sub org-blue">GESTIÓN DE INGRESOS INSTITUCIONALES</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
