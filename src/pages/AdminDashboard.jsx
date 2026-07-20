import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell 
} from 'recharts';
import { 
    FaTree, FaMapMarkerAlt, FaClock, FaCheckCircle, FaTimesCircle,
    FaSearch, FaFilter, FaCamera, FaTimes, FaBars,
    FaTachometerAlt, FaListUl, FaFilePdf, FaSignOutAlt, FaImage, FaArrowRight,
    FaCalendarAlt, FaExclamationTriangle, FaPrint, FaChartPie, FaMapMarkedAlt, FaUserShield
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminEstadisticas from './AdminEstadisticas';
import AdminMapa from './AdminMapa';
import GestionUsuarios from './GestionUsuarios';
import './AdminDashboard.css';

const BACKEND_URL = import.meta.env.VITE_NODE_BACKEND_URL;

const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3'];

const AdminDashboard = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('Todos');
    const navigate = useNavigate();
    
    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Auth State
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Modal state for updating request
    const [selectedReq, setSelectedReq] = useState(null);
    const [updateAction, setUpdateAction] = useState(''); // 'Atender' or 'Cancelar' or 'Planificar'
    const [motivoCancelacion, setMotivoCancelacion] = useState('');
    const [fotoDespues, setFotoDespues] = useState(null);
    const [fechaPlanificadaInput, setFechaPlanificadaInput] = useState('');
    const [isVerifyingGps, setIsVerifyingGps] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/admin/solicitudes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if(data.status === 'success') {
                setSolicitudes(data.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredSolicitudes = solicitudes.filter(s => {
        const matchSearch = s.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.nombreApellidos.toLowerCase().includes(searchTerm.toLowerCase());
        const matchEstado = filterEstado === 'Todos' || s.estado === filterEstado;
        return matchSearch && matchEstado;
    });

    // Handle Updates
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        let nuevoEstado = '';
        if (updateAction === 'Ingresar') {
            nuevoEstado = motivoCancelacion.trim() ? 'Cancelado' : 'Ingresado';
        } else if (updateAction === 'Atender') {
            nuevoEstado = 'Atendido';
        } else if (updateAction === 'Cancelar') {
            nuevoEstado = 'Cancelado';
        }
        
        formData.append('estado', nuevoEstado);
        
        if (nuevoEstado === 'Cancelado') {
            if(!motivoCancelacion.trim()) return alert("Debe ingresar un motivo de cancelación");
            formData.append('motivoCancelacion', motivoCancelacion.trim());
        }
        
        if (updateAction === 'Planificar') {
            try {
                const planRes = await fetch(`${BACKEND_URL}/admin/solicitudes/${selectedReq.id}/planificar`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({ fechaPlanificada: fechaPlanificadaInput })
                });
                const planData = await planRes.json();
                if(planData.status === 'success') {
                    closeModal();
                    fetchData();
                } else {
                    alert("Error al planificar");
                }
            } catch(error) {
                console.error(error);
                alert("Error de conexión");
            }
            return;
        }

        if (updateAction === 'Atender') {
            if (!fotoDespues) return alert("Debe subir una foto del trabajo finalizado.");
            
            // Validar GPS
            if (!navigator.geolocation) {
                return alert("Su dispositivo o navegador no soporta geolocalización. No se puede validar la ubicación.");
            }

            setIsVerifyingGps(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat2 = position.coords.latitude;
                    const lon2 = position.coords.longitude;
                    
                    // Extraer coords originales de ubicacionMaps
                    try {
                        const [, coordsStr] = selectedReq.ubicacionMaps.split('q=');
                        const [lat1Str, lon1Str] = coordsStr.split(',');
                        const lat1 = parseFloat(lat1Str);
                        const lon1 = parseFloat(lon1Str);

                        const R = 6371e3; // Radio de la tierra en metros
                        const p1 = lat1 * Math.PI/180;
                        const p2 = lat2 * Math.PI/180;
                        const dp = (lat2-lat1) * Math.PI/180;
                        const dl = (lon2-lon1) * Math.PI/180;

                        const a = Math.sin(dp/2) * Math.sin(dp/2) +
                                Math.cos(p1) * Math.cos(p2) *
                                Math.sin(dl/2) * Math.sin(dl/2);
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                        const d = R * c; // Distancia en metros

                        if (d > 50) {
                            setIsVerifyingGps(false);
                            return alert(`UBICACIÓN INVÁLIDA: Estás a ${Math.round(d)} metros de distancia del punto original.\nDebes estar a máximo 50 metros para poder marcarla como atendida.`);
                        }

                        // GPS Válido -> Ejecutar submit
                        executeSubmit(formData);
                    } catch (err) {
                        console.error("Error parseando ubicación", err);
                        setIsVerifyingGps(false);
                        return alert("Error interno leyendo la ubicación original de la solicitud.");
                    }
                },
                (error) => {
                    setIsVerifyingGps(false);
                    return alert("Debes otorgar permisos de ubicación a tu navegador para poder atender la solicitud.\nRevisa la configuración de permisos e inténtalo nuevamente.");
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
            return;
        }

        executeSubmit(formData);
    };

    const executeSubmit = async (formData) => {
        try {
            const res = await fetch(`${BACKEND_URL}/admin/solicitudes/${selectedReq.id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if(data.status === 'success') {
                closeModal();
                fetchData(); // reload
            } else {
                alert("Error al actualizar");
            }
        } catch(error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setIsVerifyingGps(false);
        }
    };

    const closeModal = () => {
        setSelectedReq(null);
        setUpdateAction('');
        setMotivoCancelacion('');
        setFotoDespues(null);
        setFechaPlanificadaInput('');
        setIsVerifyingGps(false);
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredSolicitudes.map(req => ({
            "ID Trámite": req.id,
            "Fecha Solicitud": new Date(req.fecha).toLocaleDateString('es-EC'),
            "Ciudadano": req.nombreApellidos,
            "Cédula": req.cedula,
            "Teléfono": req.telefono,
            "Servicio": req.tipoServicio,
            "Árboles": req.numeroArboles,
            "Parroquia": req.parroquia,
            "Estado": req.estado,
            "Fecha Planificada": req.fechaPlanificada ? new Date(req.fechaPlanificada).toLocaleDateString('es-EC') : 'N/A'
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Solicitudes");
        XLSX.writeFile(workbook, "Portoparques_Solicitudes.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Reporte de Solicitudes - Portoparques EP", 14, 15);
        
        const tableColumn = ["ID", "Fecha", "Ciudadano", "Servicio", "Parroquia", "Estado"];
        const tableRows = [];

        filteredSolicitudes.forEach(req => {
            const reqData = [
                req.id,
                new Date(req.fecha).toLocaleDateString('es-EC'),
                req.nombreApellidos,
                req.tipoServicio,
                req.parroquia,
                req.estado
            ];
            tableRows.push(reqData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [76, 175, 80] }
        });
        
        doc.save("Portoparques_Reporte.pdf");
    };

    // Utils para Planificación
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const isOverdue = (fechaStr, estado) => {
        if (estado !== 'Planificado' || !fechaStr) return false;
        const fechaPlan = new Date(fechaStr);
        fechaPlan.setHours(0,0,0,0);
        return fechaPlan < hoy;
    };

    const solicitudesPorPlanificar = solicitudes.filter(s => s.estado === 'Ingresado');
    const solicitudesPlanificadas = solicitudes.filter(s => s.estado === 'Planificado');
    
    // Sort planificadas by date
    solicitudesPlanificadas.sort((a,b) => new Date(a.fechaPlanificada) - new Date(b.fechaPlanificada));

    if (loading) return <div className="admin-loading">Cargando Dashboard...</div>;

    return (
        <div className="admin-layout">
            {/* --- SIDEBAR --- */}
            <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2><FaTree className="logo-icon" /> PortoAdmin</h2>
                    <button className="mobile-close-btn" onClick={() => setSidebarOpen(false)}>
                        <FaTimes />
                    </button>
                </div>
                
                <ul className="sidebar-menu">
                    <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                        <FaTachometerAlt /> <span>Dashboard Analítico</span>
                    </li>
                    <li className={activeTab === 'mapa' ? 'active' : ''} onClick={() => setActiveTab('mapa')}>
                        <FaMapMarkedAlt /> <span>Mapa Operativo</span>
                    </li>
                    <li className={activeTab === 'solicitudes' ? 'active' : ''} onClick={() => setActiveTab('solicitudes')}>
                        <FaListUl /> <span>Gestión de Solicitudes</span>
                    </li>
                    <li className={activeTab === 'planificacion' ? 'active' : ''} onClick={() => setActiveTab('planificacion')}>
                        <FaCalendarAlt /> <span>Planificación</span>
                    </li>
                    {user.rol === 'ADMIN' && (
                        <li className={activeTab === 'usuarios' ? 'active' : ''} onClick={() => setActiveTab('usuarios')} style={{ borderTop: '1px solid #333', marginTop: '10px', paddingTop: '10px' }}>
                            <FaUserShield /> <span>Usuarios y Accesos</span>
                        </li>
                    )}
                </ul>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={() => { localStorage.clear(); navigate('/login'); }}>
                        <FaSignOutAlt /> Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="admin-main">
                <div className="admin-topbar">
                    <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <FaBars />
                    </button>
                    <div className="user-profile">
                        <div className="avatar">{user.username ? user.username.charAt(0).toUpperCase() : 'A'}</div>
                        <span>{user.username || 'Usuario'} <small style={{color: 'var(--green-400)', display: 'block', fontSize: '0.7rem'}}>{user.rol}</small></span>
                    </div>
                </div>

                <div className="admin-content">
                    <div className="admin-header">
                        <h1>
                            {activeTab === 'dashboard' && 'Dashboard Analítico'}
                            {activeTab === 'mapa' && 'Mapa Operativo'}
                            {activeTab === 'solicitudes' && 'Gestión de Solicitudes'}
                            {activeTab === 'planificacion' && 'Planificación de Cuadrillas'}
                            {activeTab === 'usuarios' && 'Gestión de Usuarios'}
                        </h1>
                        <p>
                            {activeTab === 'dashboard' && 'Métricas en tiempo real y estadísticas gerenciales.'}
                            {activeTab === 'mapa' && 'Visualización geoespacial de las intervenciones y puntos críticos.'}
                            {activeTab === 'solicitudes' && 'Administra, atiende y cancela las solicitudes ingresadas por los ciudadanos.'}
                            {activeTab === 'planificacion' && 'Organiza la ruta de trabajo del equipo técnico y visualiza atrasos.'}
                            {activeTab === 'usuarios' && 'Crea y administra cuentas con roles de seguridad.'}
                        </p>
                    </div>

            {activeTab === 'dashboard' && <AdminEstadisticas solicitudes={solicitudes} />}
            
            {activeTab === 'mapa' && <AdminMapa solicitudes={solicitudes} />}

            {activeTab === 'usuarios' && user.rol === 'ADMIN' && <GestionUsuarios />}


            {activeTab === 'solicitudes' && (
                /* --- TABLE SECTION --- */
                <div id="table-section" className="admin-table-section">
                    <div className="table-header">
                    <h2>Listado de Solicitudes</h2>
                    <div className="table-controls">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Buscar ID o Nombre..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-box">
                            <FaFilter className="filter-icon" />
                            <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                                <option value="Todos">Todos los Estados</option>
                                <option value="Nuevo">Nuevos</option>
                                <option value="Ingresado">Ingresados</option>
                                <option value="Planificado">Planificados</option>
                                <option value="Atendido">Atendidos</option>
                                <option value="Cancelado">Cancelados</option>
                            </select>
                        </div>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button className="btn-print" onClick={exportToExcel} title="Exportar a Excel">
                                <FaListUl style={{color: 'var(--green-400)'}} /> Excel
                            </button>
                            <button className="btn-print" onClick={exportToPDF} title="Exportar a PDF">
                                <FaFilePdf style={{color: '#f44336'}} /> PDF
                            </button>
                            <button className="btn-print" onClick={() => window.print()} title="Imprimir listado actual">
                                <FaPrint /> Imprimir
                            </button>
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID Trámite</th>
                                <th>Fecha</th>
                                <th>Ciudadano</th>
                                <th>Servicio</th>
                                <th>Evidencia</th>
                                <th>Planificación</th>
                                <th>Parroquia</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSolicitudes.map(req => (
                                <tr key={req.id} className={isOverdue(req.fechaPlanificada, req.estado) ? 'row-overdue' : ''}>
                                    <td><strong>{req.id}</strong></td>
                                    <td>{new Date(req.fecha).toLocaleDateString('es-EC')}</td>
                                    <td>{req.nombreApellidos}</td>
                                    <td>{req.tipoServicio}</td>
                                    <td>
                                        <button 
                                            className="action-btn" 
                                            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--white-alpha-20)' }}
                                            onClick={() => { setSelectedReq(req); setUpdateAction('Detalles'); }}
                                        >
                                            <FaSearch /> Ver Detalles
                                        </button>
                                    </td>
                                    <td>
                                        {req.fechaPlanificada ? (
                                            <div className="plan-date">
                                                <FaCalendarAlt className="date-icon" /> 
                                                {new Date(req.fechaPlanificada).toLocaleDateString('es-EC')}
                                                {isOverdue(req.fechaPlanificada, req.estado) && <FaExclamationTriangle className="overdue-icon" title="¡Atrasado!" />}
                                            </div>
                                        ) : (
                                            <span className="text-muted">Sin asignar</span>
                                        )}
                                    </td>
                                    <td>
                                        {req.parroquia}
                                        {req.ubicacionMaps && (
                                            <div style={{marginTop: '4px'}}>
                                                <a href={req.ubicacionMaps} target="_blank" rel="noreferrer" className="text-muted" style={{fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '3px'}}>
                                                    <FaMapMarkerAlt /> Ver ubicación
                                                </a>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${req.estado.toLowerCase()}`}>
                                            {req.estado}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        {(user.rol === 'ADMIN' || user.rol === 'JEFE_TECNICO') ? (
                                            <>
                                                {req.estado === 'Nuevo' && (
                                            <button className="action-btn btn-ingresar" onClick={() => { setSelectedReq(req); setUpdateAction('Ingresar'); }}>
                                                <FaArrowRight /> Ingresar
                                            </button>
                                        )}
                                        {req.estado === 'Ingresado' && (
                                            <>
                                                <button className="action-btn btn-planificar" onClick={() => { setSelectedReq(req); setUpdateAction('Planificar'); setFechaPlanificadaInput(''); }}>
                                                    <FaCalendarAlt /> Planificar
                                                </button>
                                                <button className="action-btn btn-cancelar" onClick={() => { setSelectedReq(req); setUpdateAction('Cancelar'); }}>
                                                    <FaTimesCircle /> Cancelar
                                                </button>
                                            </>
                                        )}
                                        {req.estado === 'Planificado' && (
                                            <>
                                                <button className="action-btn btn-atender" onClick={() => { setSelectedReq(req); setUpdateAction('Atender'); }}>
                                                    <FaCheckCircle /> Atender
                                                </button>
                                                <button className="action-btn btn-planificar" onClick={() => { setSelectedReq(req); setUpdateAction('Planificar'); setFechaPlanificadaInput(req.fechaPlanificada ? new Date(req.fechaPlanificada).toISOString().split('T')[0] : ''); }}>
                                                    <FaCalendarAlt /> Cambiar fecha
                                                </button>
                                                <button className="action-btn btn-cancelar" onClick={() => { setSelectedReq(req); setUpdateAction('Cancelar'); }}>
                                                    <FaTimesCircle /> Cancelar
                                                </button>
                                            </>
                                        )}
                                        {req.estado === 'Atendido' && (
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60px' }}>
                                                <span className="text-muted" style={{ fontWeight: 'bold', letterSpacing: '1px' }}>FINALIZADO</span>
                                            </div>
                                        )}
                                        {req.estado === 'Cancelado' && (
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60px' }}>
                                                <span className="text-muted">Cancelado</span>
                                            </div>
                                        )}
                                            </>
                                        ) : (
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60px' }}>
                                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Solo Lectura</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredSolicitudes.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center">No hay solicitudes encontradas</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            )}

            {activeTab === 'planificacion' && (
                <div id="planificacion-section" className="admin-planificacion-section">
                    <div className="plan-grid">
                        <div className="plan-col">
                            <div className="plan-header">
                                <h3>Por Planificar ({solicitudesPorPlanificar.length})</h3>
                                <p>Trámites ingresados que necesitan fecha</p>
                            </div>
                            <div className="plan-list">
                                {solicitudesPorPlanificar.map(req => (
                                    <div key={req.id} className="plan-card">
                                        <div className="plan-card-header">
                                            <strong>{req.id}</strong>
                                            <span>
                                                {req.parroquia}
                                                {req.ubicacionMaps && (
                                                    <a href={req.ubicacionMaps} target="_blank" rel="noreferrer" style={{color: 'var(--green-400)', marginLeft: '8px', textDecoration: 'none'}}>
                                                        <FaMapMarkerAlt />
                                                    </a>
                                                )}
                                            </span>
                                        </div>
                                        <p>{req.tipoServicio} ({req.numeroArboles} árboles)</p>
                                        {(user.rol === 'ADMIN' || user.rol === 'JEFE_TECNICO') && (
                                            <button className="action-btn btn-planificar mt-2" onClick={() => { setSelectedReq(req); setUpdateAction('Planificar'); setFechaPlanificadaInput(''); }}>
                                                <FaCalendarAlt /> Asignar Fecha
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {solicitudesPorPlanificar.length === 0 && (
                                    <div className="plan-empty">Todas las solicitudes han sido planificadas.</div>
                                )}
                            </div>
                        </div>

                        <div className="plan-col">
                            <div className="plan-header">
                                <h3>Planificadas ({solicitudesPlanificadas.length})</h3>
                                <p>Rutas asignadas pendientes de atención</p>
                            </div>
                            <div className="plan-list">
                                {solicitudesPlanificadas.map(req => {
                                    const overdue = isOverdue(req.fechaPlanificada, req.estado);
                                    return (
                                        <div key={req.id} className={`plan-card ${overdue ? 'overdue-card' : ''}`}>
                                            <div className="plan-card-header">
                                                <strong>{req.id}</strong>
                                                <div className="plan-date">
                                                    <FaCalendarAlt /> {new Date(req.fechaPlanificada).toLocaleDateString('es-EC')}
                                                    {overdue && <FaExclamationTriangle className="overdue-icon" title="¡Atrasado!" />}
                                                </div>
                                            </div>
                                            <p>
                                                {req.tipoServicio} - {req.parroquia}
                                                {req.ubicacionMaps && (
                                                    <a href={req.ubicacionMaps} target="_blank" rel="noreferrer" style={{color: 'var(--green-400)', marginLeft: '8px', textDecoration: 'none'}}>
                                                        <FaMapMarkerAlt />
                                                    </a>
                                                )}
                                            </p>
                                            <button className="action-btn btn-secondary mt-2" onClick={() => { setSelectedReq(req); setUpdateAction('Planificar'); setFechaPlanificadaInput(new Date(req.fechaPlanificada).toISOString().split('T')[0]); }}>
                                                Re-planificar
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL UPDATE --- */}
            {selectedReq && (
                <div className="admin-modal-overlay">
                    <div className={`admin-modal ${(updateAction === 'Ingresar' || updateAction === 'Detalles') ? 'modal-large' : ''}`}>
                        <div className="admin-modal-header">
                            <h3>
                                {updateAction === 'Ingresar' && 'Revisión Técnica de Solicitud'}
                                {updateAction === 'Planificar' && 'Planificar Cuadrilla'}
                                {updateAction === 'Atender' && 'Atender Solicitud'}
                                {updateAction === 'Cancelar' && 'Cancelar Solicitud'}
                                {updateAction === 'Detalles' && 'Detalles de la Solicitud'}
                            </h3>
                            <button className="close-btn" onClick={closeModal}><FaTimes /></button>
                        </div>
                        <div className="admin-modal-body">
                            <form onSubmit={handleUpdateSubmit}>
                                {(updateAction === 'Ingresar' || updateAction === 'Detalles') && (
                                    <div className="review-section">
                                        <div className="review-grid">
                                            <div className="review-info">
                                                <h4>Datos del Trámite: <span>{selectedReq.id}</span></h4>
                                                <p><strong>Servicio:</strong> {selectedReq.tipoServicio} ({selectedReq.numeroArboles} árboles)</p>
                                                <p><strong>Ciudadano:</strong> {selectedReq.nombreApellidos}</p>
                                                <p><strong>Cédula:</strong> {selectedReq.cedula}</p>
                                                <p><strong>Teléfono:</strong> {selectedReq.telefono}</p>
                                                <p><strong>Dirección:</strong> {selectedReq.direccion}</p>
                                                <p><strong>Parroquia:</strong> {selectedReq.parroquia}</p>
                                                <p><strong>Comentario:</strong> {selectedReq.comentario}</p>
                                            </div>
                                            <div className="review-media">
                                                {selectedReq.fotoAntes ? (
                                                    <div className="thumbnail-box">
                                                        <p><strong>Evidencia Inicial:</strong></p>
                                                        <img src={`${BACKEND_URL.replace('/api','')}/${selectedReq.fotoAntes}`} alt="Evidencia" className="review-thumbnail" />
                                                    </div>
                                                ) : (
                                                    <div className="thumbnail-box empty">Sin foto adjunta</div>
                                                )}
                                                {selectedReq.resolucionPdf && (
                                                    <div className="thumbnail-box" style={{marginTop: '15px'}}>
                                                        <p><strong>Resolución PDF:</strong></p>
                                                        <a href={`${BACKEND_URL.replace('/api','')}/${selectedReq.resolucionPdf}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{textDecoration: 'none', display: 'inline-block'}}>
                                                            <FaFilePdf /> Ver Documento
                                                        </a>
                                                    </div>
                                                )}
                                                {selectedReq.fotoDespues && (
                                                    <div className="thumbnail-box" style={{marginTop: '15px'}}>
                                                        <p><strong>Evidencia de Atención (Después):</strong></p>
                                                        <img src={`${BACKEND_URL.replace('/api','')}/${selectedReq.fotoDespues}`} alt="Evidencia de trabajo" className="review-thumbnail" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {updateAction === 'Ingresar' && (
                                            <div className="review-decision slide-down" style={{marginTop: '20px'}}>
                                                <h4>Decisión de Revisión</h4>
                                                <div className="decision-buttons">
                                                    <button type="button" className={`decision-btn ${motivoCancelacion === '' && 'active-approve'}`} onClick={() => setMotivoCancelacion('')}>
                                                        Aprobar e Ingresar
                                                    </button>
                                                    <button type="button" className={`decision-btn ${motivoCancelacion !== '' && 'active-reject'}`} onClick={() => setMotivoCancelacion(' ')}>
                                                        Rechazar / Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {motivoCancelacion !== '' && updateAction === 'Ingresar' && (
                                            <div className="form-group slide-down" style={{marginTop: '15px'}}>
                                                <label>Motivo de Cancelación (Obligatorio)</label>
                                                <textarea 
                                                    required
                                                    rows="3"
                                                    placeholder="Ej: No se puede talar porque interfieren cables de alta tensión..."
                                                    value={motivoCancelacion.trim()}
                                                    onChange={e => setMotivoCancelacion(e.target.value)}
                                                ></textarea>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {updateAction === 'Planificar' && (
                                    <div className="form-group">
                                        <p><strong>Trámite:</strong> {selectedReq.id}</p>
                                        <p>Selecciona la fecha en la que la cuadrilla deberá atender esta solicitud.</p>
                                        <label>Fecha Planificada</label>
                                        <input 
                                            type="date" 
                                            required
                                            value={fechaPlanificadaInput}
                                            onChange={e => setFechaPlanificadaInput(e.target.value)}
                                            className="form-control"
                                        />
                                    </div>
                                )}
                                
                                {updateAction === 'Atender' && (
                                    <>
                                        <p><strong>Trámite:</strong> {selectedReq.id}</p>
                                        <div className="form-group">
                                            <label>Foto de Evidencia (Después) - Opcional</label>
                                            <div className="file-upload-box">
                                                <FaCamera className="upload-icon" />
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={e => setFotoDespues(e.target.files[0])}
                                                />
                                            </div>
                                            {fotoDespues && <span className="file-name">{fotoDespues.name}</span>}
                                        </div>
                                    </>
                                )}


                            {updateAction === 'Cancelar' && (
                                <>
                                    <p><strong>Trámite:</strong> {selectedReq.id}</p>
                                    <div className="form-group">
                                        <label>Motivo de Cancelación (Obligatorio)</label>
                                        <textarea 
                                            required
                                            rows="3"
                                            placeholder="Ej: No se puede talar porque interfieren cables de alta tensión..."
                                            value={motivoCancelacion.trim()}
                                            onChange={e => setMotivoCancelacion(e.target.value)}
                                        ></textarea>
                                    </div>
                                </>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal} disabled={isVerifyingGps}>Cerrar</button>
                                {updateAction !== 'Cancelar' && updateAction !== 'Detalles' ? (
                                    <button type="submit" className="btn-primary" disabled={isVerifyingGps}>
                                        {isVerifyingGps ? 'Validando GPS...' : 'Guardar Cambios'}
                                    </button>
                                ) : updateAction === 'Cancelar' ? (
                                    <button type="submit" className="btn-cancelar" style={{padding: '10px 20px', borderRadius: '4px', border: 'none', background: '#f44336', color: 'white', cursor: 'pointer', fontWeight: 'bold'}}>
                                        Confirmar Cancelación
                                    </button>
                                ) : null}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            )}
                </div> {/* End admin-content */}
            </div> {/* End admin-main */}
        </div>
    );
};

export default AdminDashboard;
