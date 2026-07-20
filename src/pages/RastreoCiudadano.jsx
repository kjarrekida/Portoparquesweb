import React, { useState } from 'react';
import { FaSearch, FaTree, FaCheckCircle, FaCalendarAlt, FaTimesCircle, FaArrowLeft, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './RastreoCiudadano.css';

const BACKEND_URL = 'http://localhost:4000/api';

const RastreoCiudadano = () => {
    const [busqueda, setBusqueda] = useState('');
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!busqueda.trim()) return;

        setLoading(true);
        setError(null);
        setResultados([]);

        try {
            const res = await fetch(`${BACKEND_URL}/rastreo/${busqueda.trim()}`);
            const data = await res.json();

            if (data.status === 'success') {
                setResultados(data.data);
            } else {
                setError(data.message || 'No se encontraron resultados.');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión con el servidor. Intente más tarde.');
        } finally {
            setLoading(false);
        }
    };

    const getStepStatus = (solicitud, stepNumber) => {
        const { estado } = solicitud;
        if (estado === 'Cancelado') return 'error';
        
        if (stepNumber === 1) return 'completed'; // Si existe, siempre está ingresado
        
        if (stepNumber === 2) {
            if (estado === 'Atendido' || estado === 'Planificado') return 'completed';
            return 'pending';
        }
        
        if (stepNumber === 3) {
            if (estado === 'Atendido') return 'completed';
            return 'pending';
        }
        return 'pending';
    };

    return (
        <div className="rastreo-page">
            <div className="rastreo-container">
                <div className="rastreo-box">
                    <h2>Rastreo de Solicitudes</h2>
                    <p>Ingresa tu número de Cédula o el ID del trámite para consultar el estado actual.</p>

                    <form className="rastreo-form" onSubmit={handleSearch}>
                        <div className="search-wrapper">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Ej: 1312345678 o PP-PODA-2026-000001"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" disabled={loading || !busqueda.trim()} className="btn-search">
                                {loading ? 'Buscando...' : 'Buscar'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="error-message">
                            <FaExclamationCircle /> {error}
                        </div>
                    )}

                    {resultados.length > 0 && (
                        <div className="resultados-container">
                            {resultados.map((solicitud) => (
                                <div key={solicitud.id} className="tramite-card">
                                    <div className="tramite-header">
                                        <h3>Trámite: <span>{solicitud.id}</span></h3>
                                        <span className={`badge badge-${solicitud.estado.toLowerCase()}`}>
                                            {solicitud.estado}
                                        </span>
                                    </div>
                                    <div className="tramite-body">
                                        <p><strong>Servicio:</strong> {solicitud.tipoServicio}</p>
                                        <p><strong>Fecha Ingreso:</strong> {new Date(solicitud.fecha).toLocaleDateString('es-EC')}</p>
                                        {solicitud.estado === 'Cancelado' && (
                                            <div className="cancelado-box">
                                                <strong>Motivo de Cancelación:</strong>
                                                <p>{solicitud.motivoCancelacion}</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {solicitud.estado !== 'Cancelado' && (
                                        <div className="stepper-container">
                                            <div className={`step ${getStepStatus(solicitud, 1)}`}>
                                                <div className="step-icon"><FaCheckCircle /></div>
                                                <div className="step-text">Ingresado</div>
                                            </div>
                                            <div className="step-line"></div>
                                            <div className={`step ${getStepStatus(solicitud, 2)}`}>
                                                <div className="step-icon"><FaCalendarAlt /></div>
                                                <div className="step-text">
                                                    Planificado
                                                    {solicitud.fechaPlanificada && <span className="step-date">{new Date(solicitud.fechaPlanificada).toLocaleDateString('es-EC')}</span>}
                                                </div>
                                            </div>
                                            <div className="step-line"></div>
                                            <div className={`step ${getStepStatus(solicitud, 3)}`}>
                                                <div className="step-icon"><FaTree /></div>
                                                <div className="step-text">
                                                    Atendido
                                                    {solicitud.fechaAtencion && <span className="step-date">{new Date(solicitud.fechaAtencion).toLocaleDateString('es-EC')}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RastreoCiudadano;
