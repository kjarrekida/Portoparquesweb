import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTree, FaMapMarkerAlt, FaSignOutAlt, FaCalendarAlt, FaClipboardList } from 'react-icons/fa';

const BACKEND_URL = 'http://localhost:4000/api';

const PortalTecnico = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!token || user.rol !== 'TECNICO') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [navigate, token, user.rol]);

    const fetchData = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/admin/solicitudes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if(data.status === 'success') {
                // Filtrar solo las solicitudes "Planificadas" (pendientes de atención) o "Ingresadas"
                const pendientes = data.data.filter(s => s.estado === 'Planificado' || s.estado === 'Ingresado');
                setSolicitudes(pendientes);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (loading) {
        return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#121212', color: '#fff'}}>Cargando portal móvil...</div>;
    }

    return (
        <div style={{minHeight: '100vh', background: '#121212', color: '#fff', paddingBottom: '20px'}}>
            {/* Navbar Móvil */}
            <div style={{background: '#1b5e20', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.3)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <FaTree style={{fontSize: '1.5rem'}} />
                    <h2 style={{margin: 0, fontSize: '1.2rem'}}>Ruta de Campo</h2>
                </div>
                <button onClick={handleLogout} style={{background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem'}}>
                    <FaSignOutAlt />
                </button>
            </div>

            <div style={{padding: '20px'}}>
                <div style={{background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <div style={{width: '50px', height: '50px', background: '#4caf50', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', fontWeight: 'bold'}}>
                        {user.username ? user.username.charAt(0).toUpperCase() : 'T'}
                    </div>
                    <div>
                        <h3 style={{margin: 0, fontSize: '1.1rem'}}>{user.username}</h3>
                        <p style={{margin: '5px 0 0', fontSize: '0.8rem', color: '#aaa'}}>Cuadrilla Operativa</p>
                    </div>
                </div>

                <h3 style={{display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0 15px', borderBottom: '1px solid #333', paddingBottom: '10px'}}>
                    <FaClipboardList style={{color: '#4caf50'}} /> Tareas Pendientes ({solicitudes.length})
                </h3>

                {solicitudes.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px'}}>
                        <FaTree style={{fontSize: '3rem', color: '#333', marginBottom: '15px'}} />
                        <p style={{color: '#aaa'}}>No hay tareas pendientes en tu ruta actual.</p>
                    </div>
                ) : (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                        {solicitudes.map(req => (
                            <div key={req.id} style={{background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', borderLeft: req.estado === 'Planificado' ? '4px solid #ff9800' : '4px solid #2196f3'}}>
                                <div style={{padding: '15px'}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                                        <h4 style={{margin: 0, fontSize: '1.1rem'}}>{req.id}</h4>
                                        <span style={{background: req.estado === 'Planificado' ? 'rgba(255,152,0,0.2)' : 'rgba(33,150,243,0.2)', color: req.estado === 'Planificado' ? '#ff9800' : '#2196f3', padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold'}}>
                                            {req.estado}
                                        </span>
                                    </div>
                                    
                                    <p style={{margin: '0 0 10px', fontSize: '0.9rem', color: '#ddd'}}><strong>Servicio:</strong> {req.tipoServicio} ({req.numeroArboles} árboles)</p>
                                    <p style={{margin: '0 0 10px', fontSize: '0.9rem', color: '#ddd', display: 'flex', gap: '8px', alignItems: 'flex-start'}}>
                                        <FaMapMarkerAlt style={{color: '#f44336', marginTop: '3px'}} />
                                        <span>{req.parroquia} - {req.direccion}</span>
                                    </p>
                                    
                                    {req.fechaPlanificada && (
                                        <p style={{margin: '0 0 15px', fontSize: '0.8rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: '8px'}}>
                                            <FaCalendarAlt /> Planificado para: {new Date(req.fechaPlanificada).toLocaleDateString('es-EC')}
                                        </p>
                                    )}

                                    {req.ubicacionMaps ? (
                                        <a href={req.ubicacionMaps} target="_blank" rel="noreferrer" style={{display: 'block', textAlign: 'center', background: '#333', color: '#fff', textDecoration: 'none', padding: '10px', borderRadius: '8px', fontSize: '0.9rem'}}>
                                            📍 Abrir en Google Maps
                                        </a>
                                    ) : (
                                        <div style={{textAlign: 'center', background: 'rgba(255,255,255,0.05)', color: '#888', padding: '10px', borderRadius: '8px', fontSize: '0.9rem'}}>
                                            Sin mapa disponible
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortalTecnico;
