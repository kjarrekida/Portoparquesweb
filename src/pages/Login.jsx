import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTree, FaLock, FaUser } from 'react-icons/fa';
import './Login.css';

const BACKEND_URL = import.meta.env.VITE_NODE_BACKEND_URL;

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar token y datos del usuario en localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.usuario));
                
                // Redirigir según rol
                if (data.usuario.rol === 'TECNICO') {
                    navigate('/tecnico');
                } else {
                    navigate('/admin');
                }
            } else {
                setError(data.message || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <FaTree className="login-logo-icon" />
                    <h2>Portoparques EP</h2>
                    <p>Acceso Restringido</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    {error && <div className="login-error">{error}</div>}

                    <div className="form-group">
                        <label><FaUser /> Usuario</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ingrese su usuario"
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label><FaLock /> Contraseña</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingrese su contraseña"
                            required 
                        />
                    </div>

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="login-footer">
                    <a href="/">Volver al Portal Ciudadano</a>
                </div>
            </div>
        </div>
    );
};

export default Login;
