import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import PodaPublica from './pages/PodaPublica'
import ConsultaTramite from './pages/ConsultaTramite'
import AdminDashboard from './pages/AdminDashboard'
import RastreoCiudadano from './pages/RastreoCiudadano'
import Login from './pages/Login'
import PortalTecnico from './pages/PortalTecnico'

function ScrollToTop() {
    const { pathname } = useLocation()
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])
    return null
}

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
        return <Navigate to="/login" replace />;
    }
    
    try {
        const user = JSON.parse(userStr);
        if (allowedRoles && !allowedRoles.includes(user.rol)) {
            return <Navigate to={user.rol === 'TECNICO' ? '/tecnico' : '/'} replace />;
        }
        return children;
    } catch(e) {
        return <Navigate to="/login" replace />;
    }
}

function App() {
    const { pathname } = useLocation()
    const isNoLayoutRoute = pathname.startsWith('/admin') || pathname === '/login' || pathname.startsWith('/tecnico')

    return (
        <>
            <ScrollToTop />
            <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
            {!isNoLayoutRoute && <Navbar />}
            <main id="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/noticias" element={<Noticias />} />
                    <Route path="/servicios" element={<Servicios />} />
                    <Route path="/institucion" element={<Institucion />} />
                    <Route path="/transparencia" element={<Transparencia />} />
                    <Route path="/contacto" element={<Contacto />} />
                    <Route path="/cementerio" element={<Cementerio />} />
                    <Route path="/solicitud-servicios" element={<PodaPublica />} />
                    <Route path="/poda-publica" element={<Navigate to="/solicitud-servicios" replace />} />
                    <Route path="/consulta-tramite" element={<ConsultaTramite />} />
                    <Route path="/rastreo" element={<RastreoCiudadano />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/tecnico" element={<PortalTecnico />} />
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'JEFE_TECNICO', 'GERENTE']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
            {!isNoLayoutRoute && <Footer />}
        </>
    )
}

export default App
