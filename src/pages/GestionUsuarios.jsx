import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaTrash, FaEdit, FaUserShield } from 'react-icons/fa';

const BACKEND_URL = `${import.meta.env.VITE_NODE_BACKEND_URL}/admin`;

const GestionUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('TECNICO');

    const fetchUsuarios = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/usuarios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status === 'success') {
                setUsuarios(data.data);
            } else {
                setError(data.message);
            }
        } catch (e) {
            setError('Error al obtener usuarios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const validarPassword = (pass) => {
        if (pass.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
        if (!/[A-Z]/.test(pass)) return "La contraseña debe incluir al menos una letra mayúscula.";
        if (!/[0-9]/.test(pass)) return "La contraseña debe incluir al menos un número.";
        return null;
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const errorPass = validarPassword(password);
        if (errorPass) {
            setError(errorPass);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/usuarios`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, rol })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setSuccess(`Usuario ${username} creado exitosamente.`);
                setUsername('');
                setPassword('');
                fetchUsuarios();
            } else {
                setError(data.message);
            }
        } catch (e) {
            setError('Error de conexión');
        }
    };

    const toggleEstado = async (id, estadoActual) => {
        const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/usuarios/${id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            const data = await res.json();
            if (data.status === 'success') {
                fetchUsuarios();
            }
        } catch(e) {
            console.error(e);
        }
    };

    const cambiarPassword = async (id, username) => {
        const nuevaPassword = window.prompt(`Ingrese la nueva contraseña para el usuario ${username}:\n\nRequisitos:\n- Mínimo 8 caracteres\n- Al menos 1 mayúscula\n- Al menos 1 número`);
        if (!nuevaPassword) return;

        const errorPass = validarPassword(nuevaPassword);
        if (errorPass) {
            alert(errorPass);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND_URL}/usuarios/${id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: nuevaPassword })
            });
            const data = await res.json();
            if (data.status === 'success') {
                alert(`Contraseña de ${username} actualizada exitosamente.`);
            } else {
                alert('Error al actualizar contraseña: ' + data.message);
            }
        } catch(e) {
            console.error(e);
            alert('Error de red al actualizar contraseña.');
        }
    };

    if (loading) return <div>Cargando usuarios...</div>;

    return (
        <div style={{color: '#fff', padding: '20px'}}>
            <h2><FaUserShield /> Gestión de Usuarios y Roles</h2>
            <p>Control total de acceso a la plataforma.</p>

            <div style={{display: 'flex', gap: '30px', flexWrap: 'wrap', marginTop: '20px'}}>
                {/* Formulario de Creación */}
                <div style={{flex: '1', minWidth: '300px', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px'}}>
                    <h3>Crear Nuevo Usuario</h3>
                    {error && <div style={{color: '#f44336', background: 'rgba(244,67,54,0.1)', padding: '10px', borderRadius: '5px', marginBottom: '15px'}}>{error}</div>}
                    {success && <div style={{color: '#4caf50', background: 'rgba(76,175,80,0.1)', padding: '10px', borderRadius: '5px', marginBottom: '15px'}}>{success}</div>}
                    
                    <form onSubmit={handleCreateUser} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                            <label>Nombre de Usuario</label>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={e => setUsername(e.target.value)} 
                                required 
                                style={{padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#222', color: '#fff'}}
                            />
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                            <label>Contraseña Provisional</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required 
                                style={{padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#222', color: '#fff'}}
                            />
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                            <label>Rol de Sistema</label>
                            <select 
                                value={rol} 
                                onChange={e => setRol(e.target.value)}
                                style={{padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#222', color: '#fff'}}
                            >
                                <option value="TECNICO">Técnico de Campo (Visualización Móvil)</option>
                                <option value="JEFE_TECNICO">Jefe Técnico (Operatividad y Mapas)</option>
                                <option value="GERENTE">Gerente (Solo Lectura Estadísticas)</option>
                                <option value="ADMIN">Super Admin (Control Total)</option>
                            </select>
                        </div>
                        <button type="submit" style={{padding: '10px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>
                            <FaUserPlus /> Registrar Usuario
                        </button>
                    </form>
                </div>

                {/* Lista de Usuarios */}
                <div style={{flex: '2', minWidth: '400px'}}>
                    <h3>Usuarios Existentes</h3>
                    <div style={{overflowX: 'auto', background: 'rgba(255,255,255,0.05)', borderRadius: '12px'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                            <thead style={{background: 'rgba(0,0,0,0.5)'}}>
                                <tr>
                                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #444'}}>Usuario</th>
                                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #444'}}>Rol</th>
                                    <th style={{padding: '12px', textAlign: 'left', borderBottom: '1px solid #444'}}>Estado</th>
                                    <th style={{padding: '12px', textAlign: 'center', borderBottom: '1px solid #444'}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map(u => (
                                    <tr key={u.id}>
                                        <td style={{padding: '12px', borderBottom: '1px solid #333'}}>{u.username}</td>
                                        <td style={{padding: '12px', borderBottom: '1px solid #333'}}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem',
                                                background: u.rol === 'ADMIN' ? 'rgba(244,67,54,0.2)' : 
                                                           u.rol === 'JEFE_TECNICO' ? 'rgba(33,150,243,0.2)' : 
                                                           u.rol === 'GERENTE' ? 'rgba(156,39,176,0.2)' : 'rgba(76,175,80,0.2)',
                                                color: u.rol === 'ADMIN' ? '#f44336' : 
                                                       u.rol === 'JEFE_TECNICO' ? '#2196f3' : 
                                                       u.rol === 'GERENTE' ? '#9c27b0' : '#4caf50'
                                            }}>
                                                {u.rol}
                                            </span>
                                        </td>
                                        <td style={{padding: '12px', borderBottom: '1px solid #333'}}>
                                            <span style={{color: u.estado === 'Activo' ? '#4caf50' : '#f44336'}}>{u.estado}</span>
                                        </td>
                                        <td style={{padding: '12px', borderBottom: '1px solid #333', textAlign: 'center'}}>
                                            <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                                                <button 
                                                    onClick={() => cambiarPassword(u.id, u.username)}
                                                    style={{
                                                        background: '#ff9800',
                                                        color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'
                                                    }}
                                                    title="Cambiar Contraseña"
                                                >
                                                    <FaEdit /> Clave
                                                </button>
                                                {u.username !== 'admin' && (
                                                    <button 
                                                        onClick={() => toggleEstado(u.id, u.estado)}
                                                        style={{
                                                            background: u.estado === 'Activo' ? '#f44336' : '#4caf50',
                                                            color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        {u.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GestionUsuarios;
