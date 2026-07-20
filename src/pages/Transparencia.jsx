import { useEffect, useRef, useState } from 'react'
import { FaFileAlt, FaBalanceScale, FaShoppingCart, FaExternalLinkAlt, FaCalendarAlt, FaChevronDown, FaChevronRight, FaFilePdf, FaFolder, FaYoutube } from 'react-icons/fa'
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

const lotaipYears = [2026, 2025]

// Meses con contenido por año (0-indexed)
const mesesConContenido = {
    2026: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Todos los meses
    2025: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Todos los meses
}

const DOCS_BASE = '/docs/rendicion-cuentas/2025'

const rendicionData = {
    2025: {
        fases: [
            {
                nombre: 'FASE 1',
                items: [
                    {
                        numero: '1',
                        nombre: 'Plan Estratégico',
                        archivo: `${DOCS_BASE}/plan-estrategico.pdf`,
                    },
                    {
                        numero: '2',
                        nombre: 'POA 2025',
                        subItems: [
                            { numero: '2.1', nombre: 'POA 2025', archivo: `${DOCS_BASE}/poa-2025.pdf` },
                            { numero: '2.2', nombre: 'Plan de Trabajo 2025', archivo: `${DOCS_BASE}/plan-trabajo-2025.pdf` },
                            { numero: '2.3', nombre: 'Informe de Evaluación y Seguimiento del POA 2025', archivo: `${DOCS_BASE}/informe-evaluacion-poa-2025.pdf` },
                            { numero: '2.4', nombre: 'Cédula Presupuestaria 2025', archivo: `${DOCS_BASE}/cedula-presupuestaria-2025.pdf` },
                            { numero: '2.5', nombre: 'Liquidación Económica 2025', archivo: `${DOCS_BASE}/liquidacion-economica-2025.pdf` },
                        ],
                    },
                    {
                        numero: '3',
                        nombre: 'Informe de Gestión 2025',
                        archivo: `${DOCS_BASE}/informe-gestion-2025.pdf`,
                    },
                    {
                        numero: '4',
                        nombre: 'Informe LOTAIP 2025',
                        archivo: `${DOCS_BASE}/informe-lotaip-2025.pdf`,
                    },
                    {
                        numero: '5',
                        nombre: 'PAC 2025',
                        subItems: [
                            { numero: '5.1', nombre: 'Resolución de Aprobación PAC 2025', archivo: `${DOCS_BASE}/resolucion-pac-2025.pdf` },
                            { numero: '5.2', nombre: 'PAC 2025', archivo: `${DOCS_BASE}/pac-2025.pdf` },
                        ],
                    },
                    {
                        numero: '6',
                        nombre: 'Resolución Asamblea Ciudadana',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/Resoluci%C3%B3n%20Asamblea%20Ciudadana-signed.pdf',
                    },
                    {
                        numero: '7',
                        nombre: 'Consulta Ciudadana',
                        subItems: [
                            { numero: '7.1', nombre: 'Acta de Mesa Temáticas', archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/ACTA%20MESAS%20TEM%C3%81TICAS%20PORTOPARQUES%20E.P.-signed-signed-signed.pdf' },
                            { numero: '7.2', nombre: 'Mesa Temática', archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/MESA%20TEMATICA%204%20-%20EJE%20PORTOVIEJO%20CAPITAL%20EFICIENTE.pdf' },
                        ],
                    },
                    {
                        numero: '8',
                        nombre: 'Comisiones Mixtas 1 y 2',
                        subItems: [
                            { numero: '8.1', nombre: 'Convocatoria a Sesión Ordinaria del Equipo Mixto', archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/CONVOCATORIA%20A%20SES%C3%93N%20ORDINARIA%20DEL%20EQUIPO%20MIXTO_ESC.pdf' },
                            { numero: '8.2', nombre: 'Acta de Conformación Mixtas 1 y 2', archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/ACTA%20DE%20CONFORMACI%C3%93N%20DE%20COMISIONES%20MIXTAS%201%20Y%202.pdf' },
                        ],
                    },
                ],
            },
            {
                nombre: 'FASE 2',
                items: [
                    {
                        numero: '1',
                        nombre: 'FORMULARIO PRELIMINAR PORTOPARQUES',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/Fase2/FORMULARIO_PRELIMINAR_PP.pdf',
                    },
                    {
                        numero: '2',
                        nombre: 'FORMULARIO INFORME NARRATIVO 2025',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/Fase2/Portoparques_Informe_Narrativo_RC2025.pdf',
                    },
                ],
            },
            {
                nombre: 'FASE 3',
                items: [
                    {
                        numero: '1',
                        nombre: 'Rendición de Cuentas 2025',
                        tipo: 'video',
                        videoUrl: 'https://www.youtube-nocookie.com/embed/_s0v7sUr_D8',
                    },
                    {
                        numero: '2',
                        nombre: 'Mesa de Trabajo Rendición de Cuentas 2025',
                        tipo: 'video',
                        videoUrl: 'https://www.youtube-nocookie.com/embed/r1CNdrx7IYE',
                    },
                    {
                        numero: '3',
                        nombre: 'Oficio Evaluación Por Ciudadano del Consejo Cantonal de Planificacion',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/Fase3/OFICIO%20DE%20LA%20EVALUACIÓN%20POR%20CIUDADANOS%20DEL%20CONSEJO%20CANTONAL%20DE%20PLANIFICACION.pdf',
                    },
                    {
                        numero: '4',
                        nombre: 'Convocatoria Deliberación Pública',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/Fase3/CONVOCATORIA%20DE%20LA%20DELIBERACION%20PÚBLICA.jpeg',
                    },
                    {
                        numero: '5',
                        nombre: 'Registro de Asistencia',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/Fase3/REGISTRO%20DE%20ASISTENCIAS.pdf',
                    },
                    {
                        numero: '6',
                        nombre: 'Presentación Ejecutiva',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/Fase3/PRESENTACION%20EJECUTIVA.pdf',
                    },
                    {
                        numero: '7',
                        nombre: 'Certificación de No Recepción de Sugerencias y Recomendaciones de la Ciudadanía',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/Fase3/CERTIFICACION%20DE%20NO%20RECEPCION%20DE%20SUGERENCIAS%20CANAL%20VIRTUAL%20RC2025.pdf',
                    },
                    {
                        numero: '8',
                        nombre: 'Acta Deliberación Pública 2025',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/Fase3/ACTA%20DE%20DELIBERACIÓN%20PUBLICA%20RC2025.pdf',
                    },
                    {
                        numero: '9',
                        nombre: 'Acta de Mesas de Trabajo 2025',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/Fase3/ACTA%20DE%20LAS%20MESAS%20DE%20TRABAJO%20RC2025.pdf',
                    },
                ],
            },
            {
                nombre: 'FASE 4',
                items: [
                    {
                        numero: '1',
                        nombre: 'Informe CPCCS Rendición de Cuentas 2025',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/Fase4/Informe_CPCCS_PPEP_RC2025.pdf',
                    },
                    {
                        numero: '2',
                        nombre: 'Oficio de Entrega Plan de Trabajo',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/Fase4/OFICIO_DE_ENTREGA_DE_PLAN_DE_TRABAJO_PORTOPARQUES%20EP.pdf',
                    },
                    {
                        numero: '3',
                        nombre: 'Plan de Trabajo 2025',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2025/Fase4/Plan_de_trabajo_EPM_EA_RC_2025-signed-signed.pdf',
                    },
                ],
            },
        ],
    },
    2024: {
        fases: [
            {
                nombre: 'DOCUMENTOS DE RENDICIÓN 2024',
                items: [
                    {
                        numero: '1',
                        nombre: 'Formulario Rendición de Cuentas 2024',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2024/Formulario_de_rendicion_EmpresasGad2024.pdf',
                    },
                    {
                        numero: '2',
                        nombre: 'Informe Narrativo Rendición de Cuentas 2024',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2024/INFORME_NARRATIVO_INSTITUCIONAL_RC_2024.pdf',
                    },
                ],
            },
        ],
    },
    2022: {
        fases: [
            {
                nombre: 'DOCUMENTOS DE RENDICIÓN 2022',
                items: [
                    {
                        numero: '1',
                        nombre: 'Formulario Rendición de Cuentas 2022',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2022/Formulario_EmpresasGad_2022.pdf',
                    },
                    {
                        numero: '2',
                        nombre: 'Informe Narrativo Rendición de Cuentas 2022',
                        archivo: 'https://portoparques.gob.ec/docs/rendicion-cuentas/2022/INFORME_DE_GESTIÓN_2022_PORTPARQUESEP_FINAL_signed.pdf',
                    },
                ],
            },
        ],
    },
}

const rendicionYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018]
const pacYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018]

const pacData = {
    2026: 'https://portoparques.gob.ec/docs/pacpp/PAC_2026-signed.pdf',
    2025: 'https://portoparques.gob.ec/docs/pacpp/PAC_2025-signed.pdf',
    2024: 'https://portoparques.gob.ec/docs/pacpp/PAC_2024-signed.pdf',
    2023: 'https://portoparques.gob.ec/docs/pacpp/PAC_2023-signed.pdf',
    2022: 'https://portoparques.gob.ec/docs/pacpp/PAC_2022-signed.pdf',
}

/* ===================== LOTAIP DROPDOWN ===================== */
function LOTAIPDropdown() {
    const [openYear, setOpenYear] = useState(null)
    const [openMonth, setOpenMonth] = useState(null)

    return (
        <div className="lotaip-dropdown">
            {lotaipYears.map(year => (
                <div key={year} className="lotaip-dropdown__year-block">
                    <button
                        className={`lotaip-dropdown__year ${openYear === year ? 'lotaip-dropdown__year--open' : ''}`}
                        onClick={() => { setOpenYear(openYear === year ? null : year); setOpenMonth(null) }}
                    >
                        <FaCalendarAlt />
                        <span>LOTAIP {year}</span>
                        <FaChevronDown className={`lotaip-dropdown__chevron ${openYear === year ? 'lotaip-dropdown__chevron--rotated' : ''}`} />
                    </button>

                    {openYear === year && (
                        <div className="lotaip-dropdown__months">
                            {meses.map((mes, i) => {
                                const tieneContenido = mesesConContenido[year]?.includes(i)
                                return (
                                    <div key={i} className="lotaip-dropdown__month-group">
                                        <button
                                            className={`lotaip-dropdown__month ${openMonth === i ? 'lotaip-dropdown__month--open' : ''} ${!tieneContenido ? 'lotaip-dropdown__month--empty' : ''}`}
                                            onClick={() => tieneContenido && setOpenMonth(openMonth === i ? null : i)}
                                        >
                                            <FaChevronRight className={`lotaip-dropdown__month-chevron ${openMonth === i && tieneContenido ? 'lotaip-dropdown__month-chevron--rotated' : ''}`} />
                                            <span>{mes}</span>
                                            {!tieneContenido && <span className="lotaip-dropdown__empty-badge">Próximamente</span>}
                                        </button>

                                        {openMonth === i && tieneContenido && (
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
                                )
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

/* ===================== RENDICION DROPDOWN ===================== */
function RendicionCuentasDropdown() {
    const [openYear, setOpenYear] = useState(null)
    const [openFase, setOpenFase] = useState(null)
    const [openItem, setOpenItem] = useState(null)

    return (
        <div className="rendicion-dropdown">
            {rendicionYears.map(year => {
                const data = rendicionData[year]
                return (
                    <div key={year} className="rendicion-dropdown__year-block">
                        <button
                            className={`rendicion-dropdown__year ${openYear === year ? 'rendicion-dropdown__year--open' : ''}`}
                            onClick={() => { setOpenYear(openYear === year ? null : year); setOpenFase(null); setOpenItem(null) }}
                        >
                            <FaCalendarAlt />
                            <span>Rendición de Cuentas {year}</span>
                            {!data && <span className="rendicion-dropdown__empty-badge">Próximamente</span>}
                            <FaChevronDown className={`rendicion-dropdown__chevron ${openYear === year ? 'rendicion-dropdown__chevron--rotated' : ''}`} />
                        </button>

                        {openYear === year && data && (
                            <div className="rendicion-dropdown__content">
                                {data.fases.map((fase, fi) => (
                                    <div key={fi} className="rendicion-dropdown__fase-block">
                                        <button
                                            className={`rendicion-dropdown__fase ${openFase === fi ? 'rendicion-dropdown__fase--open' : ''}`}
                                            onClick={() => { setOpenFase(openFase === fi ? null : fi); setOpenItem(null) }}
                                        >
                                            <FaFolder className="rendicion-dropdown__fase-icon" />
                                            <span>{fase.nombre}</span>
                                            <FaChevronDown className={`rendicion-dropdown__fase-chevron ${openFase === fi ? 'rendicion-dropdown__fase-chevron--rotated' : ''}`} />
                                        </button>

                                        {openFase === fi && (
                                            <ul className="rendicion-dropdown__items">
                                                {fase.items.map((item, ii) => (
                                                    <li key={ii} className="rendicion-dropdown__item-group">
                                                        {item.tipo === 'video' ? (
                                                            <div className="rendicion-dropdown__video-item">
                                                                <div className="rendicion-dropdown__video-header">
                                                                    <FaYoutube className="rendicion-dropdown__video-icon" />
                                                                    <span className="rendicion-dropdown__item-num">{item.numero}.</span>
                                                                    <span className="rendicion-dropdown__item-name">{item.nombre}</span>
                                                                </div>
                                                                <div className="rendicion-dropdown__video-container">
                                                                    <iframe
                                                                        src={item.videoUrl}
                                                                        title={item.nombre}
                                                                        frameBorder="0"
                                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                        allowFullScreen
                                                                        className="rendicion-dropdown__video-iframe"
                                                                    ></iframe>
                                                                </div>
                                                            </div>
                                                        ) : item.archivo ? (
                                                            <a
                                                                href={item.archivo}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="rendicion-dropdown__item-link"
                                                            >
                                                                <FaFilePdf className="rendicion-dropdown__item-pdf" />
                                                                <span className="rendicion-dropdown__item-num">{item.numero}.</span>
                                                                <span className="rendicion-dropdown__item-name">{item.nombre}</span>
                                                                <FaExternalLinkAlt className="rendicion-dropdown__item-ext" />
                                                            </a>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    className={`rendicion-dropdown__item-toggle ${openItem === ii ? 'rendicion-dropdown__item-toggle--open' : ''}`}
                                                                    onClick={() => setOpenItem(openItem === ii ? null : ii)}
                                                                >
                                                                    <FaChevronRight className={`rendicion-dropdown__sub-chevron ${openItem === ii ? 'rendicion-dropdown__sub-chevron--rotated' : ''}`} />
                                                                    <span className="rendicion-dropdown__item-num">{item.numero}.</span>
                                                                    <span className="rendicion-dropdown__item-name">{item.nombre}</span>
                                                                </button>

                                                                {openItem === ii && item.subItems && (
                                                                    <ul className="rendicion-dropdown__subitems">
                                                                        {item.subItems.map((sub, si) => (
                                                                            <li key={si}>
                                                                                <a
                                                                                    href={sub.archivo}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="rendicion-dropdown__subitem-link"
                                                                                >
                                                                                    <FaFilePdf className="rendicion-dropdown__subitem-pdf" />
                                                                                    <span className="rendicion-dropdown__subitem-num">{sub.numero}</span>
                                                                                    <span className="rendicion-dropdown__subitem-name">{sub.nombre}</span>
                                                                                    <FaExternalLinkAlt className="rendicion-dropdown__subitem-ext" />
                                                                                </a>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {openYear === year && !data && (
                            <div className="rendicion-dropdown__no-content">
                                <p>Información no disponible aún para este período.</p>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

/* ===================== PAC DROPDOWN ===================== */
function PACDropdown() {
    const [openYear, setOpenYear] = useState(null)

    return (
        <div className="pac-dropdown">
            {pacYears.map(year => {
                const docUrl = pacData[year]
                return (
                    <div key={year} className="pac-dropdown__year-block">
                        <button
                            className={`pac-dropdown__year ${openYear === year ? 'pac-dropdown__year--open' : ''}`}
                            onClick={() => setOpenYear(openYear === year ? null : year)}
                        >
                            <FaCalendarAlt />
                            <span>PAC {year}</span>
                            {!docUrl && <span className="pac-dropdown__empty-badge">Próximamente</span>}
                            <FaChevronDown className={`pac-dropdown__chevron ${openYear === year ? 'pac-dropdown__chevron--rotated' : ''}`} />
                        </button>

                        {openYear === year && docUrl && (
                            <div className="pac-dropdown__content">
                                <ul className="rendicion-dropdown__items">
                                    <li className="rendicion-dropdown__item-group">
                                        <a
                                            href={docUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rendicion-dropdown__item-link"
                                        >
                                            <FaFilePdf className="rendicion-dropdown__item-pdf" />
                                            <span className="rendicion-dropdown__item-name">Descargar PAC {year}</span>
                                            <FaExternalLinkAlt className="rendicion-dropdown__item-ext" />
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        )}

                        {openYear === year && !docUrl && (
                            <div className="pac-dropdown__no-content">
                                <p>Información no disponible aún para este período.</p>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

/* ===================== PAGE ===================== */
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
                    {/* LOTAIP */}
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

                        <RendicionCuentasDropdown />
                    </div>

                    {/* PAC */}
                    <div className="transparencia__section animate-in">
                        <div className="transparencia__section-header">
                            <div className="transparencia__section-icon transparencia__section-icon--cyan">
                                <FaShoppingCart />
                            </div>
                            <div>
                                <h2 className="transparencia__section-title">PAC</h2>
                                <p className="transparencia__section-desc">
                                    Plan Anual de Contratación. Consulta las adquisiciones y contrataciones planificadas.
                                </p>
                            </div>
                        </div>

                        <PACDropdown />
                    </div>
                </div>
            </section>
        </div>
    )
}
