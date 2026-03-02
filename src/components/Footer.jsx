import { Link } from 'react-router-dom'
import { FaFacebookF, FaTiktok, FaYoutube, FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import './Footer.css'

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer__wave">
                <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
                    <path d="M0,40 C360,100 720,0 1080,60 C1260,90 1380,40 1440,50 L1440,120 L0,120 Z" fill="var(--dark-800)" />
                </svg>
            </div>

            <div className="footer__content">
                <div className="container">
                    <div className="footer__grid">
                        {/* Brand */}
                        <div className="footer__brand">
                            <div className="footer__logo">
                                <img
                                    src="/images/portoparques-logo-full.png"
                                    alt="Portoparques EP — Empresa Pública Municipal de Parques, Cementerios, Áreas Verdes, Zonas de Recreación y Espacios Culturales de Portoviejo"
                                    className="footer__logo-img"
                                />
                            </div>
                            <p className="footer__desc">
                                Empresa Pública de Parques Urbanos y Espacios Públicos de Portoviejo.
                                Manteniendo áreas verdes para una ciudad más saludable.
                            </p>
                            <div className="footer__social">
                                <a href="https://facebook.com/portoparquesep" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF /></a>
                                <a href="https://tiktok.com/@portoparquesep" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><FaTiktok /></a>
                                <a href="https://youtube.com/@portoparquesep" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><FaYoutube /></a>
                                <a href="https://twitter.com/portoparquesep" target="_blank" rel="noopener noreferrer" aria-label="X"><FaXTwitter /></a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer__section">
                            <h3 className="footer__heading">Enlaces Rápidos</h3>
                            <ul className="footer__links">
                                <li><Link to="/">Inicio</Link></li>
                                <li><Link to="/noticias">Noticias</Link></li>
                                <li><Link to="/servicios">Servicios</Link></li>
                                <li><Link to="/institucion">Institución</Link></li>
                                <li><Link to="/transparencia">Transparencia</Link></li>
                                <li><Link to="/contacto">Contáctenos</Link></li>
                            </ul>
                        </div>

                        {/* Services */}
                        <div className="footer__section">
                            <h3 className="footer__heading">Nuestros Servicios</h3>
                            <ul className="footer__links">
                                <li><Link to="/servicios#areas-verdes">Áreas Verdes</Link></li>
                                <li><Link to="/servicios#infraestructura">Infraestructura</Link></li>
                                <li><Link to="/servicios#piletas">Piletas y Monumentos</Link></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="footer__section">
                            <h3 className="footer__heading">Contacto</h3>
                            <ul className="footer__contact">
                                <li>
                                    <FaMapMarkerAlt className="footer__contact-icon" />
                                    <span>Parque La Rotonda, Portoviejo, Ecuador</span>
                                </li>
                                <li>
                                    <FaPhone className="footer__contact-icon" />
                                    <a href="tel:053700250">05 370 0250 ext. 9300</a>
                                </li>
                                <li>
                                    <FaWhatsapp className="footer__contact-icon" />
                                    <a href="https://wa.me/593978765189" target="_blank" rel="noopener noreferrer">0978 765 189</a>
                                </li>
                                <li>
                                    <FaEnvelope className="footer__contact-icon" />
                                    <a href="mailto:info@portoparques.gob.ec">info@portoparques.gob.ec</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer__bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Portoparques EP. Todos los derechos reservados.</p>
                    <p>Portoviejo Alcaldía — <em>Crecemos Juntos</em></p>
                </div>
            </div>
        </footer>
    )
}
