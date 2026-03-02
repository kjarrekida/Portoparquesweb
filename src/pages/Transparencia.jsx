import { useEffect, useRef, useState } from 'react'
import { FaFileAlt, FaBalanceScale, FaShoppingCart, FaExternalLinkAlt, FaCalendarAlt, FaChevronDown, FaChevronRight } from 'react-icons/fa'
import './Transparencia.css'

const TRANSPARENCIA_LINK = 'https://transparencia.dpe.gob.ec/entidades/1736'

const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const tiposTransparencia = [
    { nombre: 'Transparencia Activa', desc: 'Información que la institución publica de manera obligatoria y proactiva.' },
    { nombre: 'Transparencia Pasiva', desc: 'Información entregada a solicitud de la ciudadanía.' },
    { nombre: 'Transparencia Focalizada', desc: 'Información específica dirigida a grupos de interés particular.' },
    { nombre: 'Transparencia Colaborativa', desc: 'Información generada de forma participativa con la ciudadanía.' },
]

const rendicionCuentas = [
    { year: '2024', status: 'Disponible' },
    { year: '2023', status: 'Disponible' },
    { year: '2022', status: 'Disponible' },
    { year: '2021', status: 'Disponible' },
    { year: '2020', status: 'Disponible' },
    { year: '2019', status: 'Disponible' },
    { year: '2018', status: 'Disponible' },
    { year: '2017', status: 'Disponible' },
    { year: '2016', status: 'Disponible' },
]

function LOTAIPDropdown() {
    const [yearOpen, setYearOpen] = useState(false)
    const [openMonth, setOpenMonth] = useState(null)

    return (
        <div className="lotaip-dropdown">
            {/* Year 2025 */}
            <button
                className={`lotaip-dropdown__year ${yearOpen ? 'lotaip-dropdown__year--open' : ''}`}
                onClick={() => setYearOpen(!yearOpen)}
            >
                <FaCalendarAlt />
                <span>LOTAIP 2025</span>
                <FaChevronDown className={`lotaip-dropdown__chevron ${yearOpen ? 'lotaip-dropdown__chevron--rotated' : ''}`} />
            </button>

            {yearOpen && (
                <div className="lotaip-dropdown__months">
                    {meses.map((mes, i) => (
                        <div key={i} className="lotaip-dropdown__month-group">
                            <button
                                className={`lotaip-dropdown__month ${openMonth === i ? 'lotaip-dropdown__month--open' : ''}`}
                                onClick={() => setOpenMonth(openMonth === i ? null : i)}
                            >
                                <FaChevronRight className={`lotaip-dropdown__month-chevron ${openMonth === i ? 'lotaip-dropdown__month-chevron--rotated' : ''}`} />
                                <span>{mes}</span>
                            </button>

                            {openMonth === i && (
                                <ul className="lotaip-dropdown__types">
                                    {tiposTransparencia.map((tipo, j) => (
                                        <li key={j}>
                                            <a
                                                href={TRANSPARENCIA_LINK}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="lotaip-dropdown__type-link"
                                            >
                                                <div className="lotaip-dropdown__type-dot"></div>
                                                <div>
                                                    <span className="lotaip-dropdown__type-name">{tipo.nombre}</span>
                                                    <span className="lotaip-dropdown__type-desc">{tipo.desc}</span>
                                                </div>
                                                <FaExternalLinkAlt className="lotaip-dropdown__type-ext" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function Transparencia() {
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
        <div ref={ref} className="transparencia-page">
            <section className="page-hero">
                <div className="page-hero__bg"></div>
                <div className="container">
                    <h1 className="page-hero__title animate-in">Transparencia</h1>
                    <p className="page-hero__subtitle animate-in">
                        Accede a la información pública de Portoparques EP. Trabajamos con
                        transparencia y rendición de cuentas para la ciudadanía.
                    </p>
                </div>
            </section>

            <section className="transparencia section-padding">
                <div className="container">
                    {/* LOTAIP 2025 */}
                    <div className="transparencia__section animate-in">
                        <div className="transparencia__section-header">
                            <div className="transparencia__section-icon">
                                <FaFileAlt />
                            </div>
                            <div>
                                <h2 className="transparencia__section-title">LOTAIP</h2>
                                <p className="transparencia__section-desc">
                                    Ley Orgánica de Transparencia y Acceso a la Información Pública.
                                    Consulta la información que Portoparques EP pone a disposición de la ciudadanía.
                                </p>
                            </div>
                        </div>

                        <LOTAIPDropdown />
                    </div>

                    {/* Rendición de Cuentas */}
                    <div className="transparencia__section animate-in">
                        <div className="transparencia__section-header">
                            <div className="transparencia__section-icon transparencia__section-icon--blue">
                                <FaBalanceScale />
                            </div>
                            <div>
                                <h2 className="transparencia__section-title">Rendición de Cuentas</h2>
                                <p className="transparencia__section-desc">
                                    Informes anuales de gestión y rendición de cuentas ante la ciudadanía.
                                </p>
                            </div>
                        </div>
                        <div className="transparencia__years-grid">
                            {rendicionCuentas.map((item, i) => (
                                <a
                                    key={i}
                                    href={TRANSPARENCIA_LINK}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transparencia__year-card glass-card"
                                >
                                    <FaCalendarAlt className="transparencia__year-icon" />
                                    <span className="transparencia__year">{item.year}</span>
                                    <span className="transparencia__year-status">{item.status}</span>
                                    <span className="transparencia__year-btn">
                                        <FaExternalLinkAlt />
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* PAC */}
                    <div className="transparencia__section animate-in">
                        <div className="transparencia__section-header">
                            <div className="transparencia__section-icon transparencia__section-icon--cyan">
                                <FaShoppingCart />
                            </div>
                            <div>
                                <h2 className="transparencia__section-title">PAC 2024</h2>
                                <p className="transparencia__section-desc">
                                    Plan Anual de Contratación. Consulta las adquisiciones y contrataciones planificadas.
                                </p>
                            </div>
                        </div>
                        <div className="transparencia__card glass-card">
                            <p>El Plan Anual de Contratación (PAC) contiene las adquisiciones de bienes, servicios y obras
                                planificadas por Portoparques EP para el año fiscal vigente, en cumplimiento con la normativa
                                del Sistema Nacional de Contratación Pública.</p>
                            <a href={TRANSPARENCIA_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)', display: 'inline-flex' }}>
                                <FaExternalLinkAlt /> Ver PAC 2024
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
