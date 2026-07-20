import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FaBars, FaTimes, FaFacebookF, FaTiktok, FaYoutube } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import './Navbar.css'

const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/noticias', label: 'Noticias' },
    {
        label: 'Servicios',
        path: '/servicios',
        children: [
            { path: '/solicitud-servicios', label: 'Servicio de Poda/Tala' },
            { path: '/servicios#infraestructura', label: 'Infraestructura' },
            { path: '/cementerio', label: 'Cementerio' },
        ]
    },
    { path: '/institucion', label: 'Institución' },
    { path: '/transparencia', label: 'Transparencia' },
    { path: '/contacto', label: 'Contáctenos' },
]

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [activeDropdown, setActiveDropdown] = useState(null)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    const toggleMenu = () => setIsOpen(!isOpen)
    const closeMenu = () => {
        setIsOpen(false)
        setActiveDropdown(null)
    }

    return (
        <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
            <div className="navbar__container container">
                <Link to="/" className="navbar__logo" onClick={closeMenu} aria-label="Inicio">
                    <img
                        src="/images/portoparques-logo.png"
                        alt="Portoparques EP"
                        className="navbar__logo-img"
                    />
                </Link>

                <nav className={`navbar__nav ${isOpen ? 'navbar__nav--open' : ''}`} role="navigation" aria-label="Navegación principal">
                    <ul className="navbar__links">
                        {navLinks.map((link, i) => (
                            <li
                                key={i}
                                className={`navbar__item ${link.children ? 'navbar__item--dropdown' : ''}`}
                                onMouseEnter={() => link.children && setActiveDropdown(i)}
                                onMouseLeave={() => link.children && setActiveDropdown(null)}
                            >
                                <NavLink
                                    to={link.path}
                                    className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                                    onClick={closeMenu}
                                >
                                    {link.label}
                                    {link.children && <span className="navbar__arrow">▾</span>}
                                </NavLink>
                                {link.children && (
                                    <ul className={`navbar__dropdown ${activeDropdown === i ? 'navbar__dropdown--open' : ''}`}>
                                        {link.children.map((child, j) => (
                                            <li key={j}>
                                                <Link to={child.path} className="navbar__dropdown-link" onClick={closeMenu}>
                                                    {child.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="navbar__social">
                        <a href="https://www.facebook.com/portoparques/?locale=es_LA" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <FaFacebookF />
                        </a>
                        <a href="https://tiktok.com/@portoparquesep" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                            <FaTiktok />
                        </a>
                        <a href="https://www.youtube.com/@PortoparquesEPOficial" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                            <FaYoutube />
                        </a>
                        <a href="https://twitter.com/portoparquesep" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
                            <FaXTwitter />
                        </a>
                    </div>
                </nav>

                <button
                    className={`navbar__toggle ${isOpen ? 'navbar__toggle--active' : ''}`}
                    onClick={toggleMenu}
                    aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={isOpen}
                >
                    {isOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>
        </header>
    )
}
