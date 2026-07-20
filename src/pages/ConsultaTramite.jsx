import React, { useState, useEffect } from 'react';
import './ConsultaTramite.css';

const BACKEND_URL = import.meta.env.VITE_NODE_BACKEND_URL;

const ConsultaTramite = () => {
    const [codigo, setCodigo] = useState('');
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!codigo.trim()) {
            setError('Por favor, ingrese un código de trámite.');
            return;
        }

        setError('');
        setLoading(true);
        setResultado(null);

        try {
            const response = await fetch(`${BACKEND_URL}/solicitudes/${codigo.trim()}`);
            const data = await response.json();

            if (data.status === 'success') {
                setResultado(data.data);
            } else {
                setError(data.message || 'No se encontró ninguna solicitud con ese código.');
            }
        } catch (err) {
            console.error(err);
            setError('Error de conexión al consultar el trámite.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="consulta-page">
            <div className="consulta-container">
                <h1 className="consulta-title">Consulta tu Trámite</h1>
                <p className="consulta-subtitle">Ingresa el código que recibiste en tu correo electrónico para conocer el estado actual de tu solicitud.</p>

                <form onSubmit={handleSearch} className="consulta-form">
                    <input 
                        type="text" 
                        className="consulta-input"
                        placeholder="Ej: PP-PODA-2025-000001"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    />
                    <button type="submit" className="consulta-btn" disabled={loading}>
                        {loading ? 'Buscando...' : 'Consultar'}
                    </button>
                </form>

                {error && <div className="consulta-error">{error}</div>}

                {resultado && (
                    <div className="consulta-resultado fade-in">
                        <div className="resultado-header">
                            <h3>Trámite: {resultado.id}</h3>
                            <span className={`estado-badge estado-${resultado.estado.toLowerCase()}`}>
                                {resultado.estado}
                            </span>
                        </div>
                        <div className="resultado-body">
                            <p><strong>Servicio:</strong> {resultado.tipoServicio}</p>
                            <p><strong>Fecha de Ingreso:</strong> {new Date(resultado.fecha).toLocaleDateString('es-EC')}</p>
                            <p><strong>Solicitante:</strong> {resultado.nombreApellidos}</p>
                            
                            {resultado.estado === 'Cancelado' && resultado.motivoCancelacion && (
                                <div className="resultado-nota error-nota">
                                    <strong>Motivo de Cancelación:</strong>
                                    <p>{resultado.motivoCancelacion}</p>
                                </div>
                            )}

                            {resultado.estado === 'Atendido' && resultado.fechaAtencion && (
                                <div className="resultado-nota success-nota">
                                    <strong>Atendido el:</strong> {new Date(resultado.fechaAtencion).toLocaleDateString('es-EC')}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConsultaTramite;
