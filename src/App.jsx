import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Noticias from './pages/Noticias'
import Servicios from './pages/Servicios'
import Institucion from './pages/Institucion'
import Transparencia from './pages/Transparencia'
import Contacto from './pages/Contacto'
import Cementerio from './pages/Cementerio'

function ScrollToTop() {
    const { pathname } = useLocation()
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])
    return null
}

function App() {
    return (
        <>
            <ScrollToTop />
            <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
            <Navbar />
            <main id="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/noticias" element={<Noticias />} />
                    <Route path="/servicios" element={<Servicios />} />
                    <Route path="/institucion" element={<Institucion />} />
                    <Route path="/transparencia" element={<Transparencia />} />
                    <Route path="/contacto" element={<Contacto />} />
                    <Route path="/cementerio" element={<Cementerio />} />
                </Routes>
            </main>
            <Footer />
        </>
    )
}

export default App
