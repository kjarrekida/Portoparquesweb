import { useState } from 'react';
import './DesechosInfecciosos.css';

// URL del Google Apps Script (A reemplazar cuando el usuario lo genere)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyOUsmL6tj2oWOAg_Dw_CFwtxmfRapyeqGmJxOji58MzAfb_Je6yv2Df-fV6ZC4azGm/exec';

function DesechosInfecciosos() {
    const [formData, setFormData] = useState({
        ruc: '',
        razonSocial: '',
        nombreComercial: '',
        direccion: '',
        parroquia: '',
        telefono: '',
        email: '',
        frecuencia: '',
        representante: '',
        cedulaRepresentante: '',
        regGenerador: '',
        licenciaAmbiental: '',
        autorizacion: false
    });
    
    const [fileData, setFileData] = useState({
        name: '',
        mimeType: '',
        base64: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

    const parroquias = [
        "12 de Marzo", "18 de Octubre", "Andrés de Vera", "Colón", 
        "Crucita", "Francisco Pacheco", "Picoazá", "Pueblo Nuevo", 
        "Portoviejo Centro", "San Pablo", "Simón Bolívar", "Otra"
    ];

    const frecuencias = [
        "Diaria", "Pasando un día", "Semanal", "Quincenal", "Mensual"
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tamaño (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('El archivo es demasiado grande. Máximo 5MB.');
                e.target.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = event.target.result.split(',')[1];
                setFileData({
                    name: file.name,
                    mimeType: file.type,
                    base64: base64String
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.autorizacion) {
            setSubmitStatus({ type: 'error', message: 'Debe aceptar la autorización de uso de datos.' });
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus({ type: '', message: '' });

        try {
            const payload = {
                ...formData,
                archivoNombre: fileData.name,
                archivoMimeType: fileData.mimeType,
                archivoBase64: fileData.base64
            };

            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
                // No cors needed for Apps Script POST when using text/plain
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                setSubmitStatus({ 
                    type: 'success', 
                    message: '¡Registro exitoso! Sus datos han sido ingresados correctamente.' 
                });
                // Limpiar formulario
                setFormData({
                    ruc: '', razonSocial: '', nombreComercial: '', direccion: '', 
                    parroquia: '', telefono: '', email: '', frecuencia: '', 
                    representante: '', cedulaRepresentante: '', regGenerador: '', 
                    licenciaAmbiental: '', autorizacion: false
                });
                setFileData({ name: '', mimeType: '', base64: '' });
                document.getElementById('file-upload').value = '';
            } else {
                throw new Error(result.message || 'Error al procesar la solicitud');
            }
        } catch (error) {
            console.error('Error:', error);
            setSubmitStatus({ 
                type: 'error', 
                message: 'Ocurrió un error al enviar el formulario. Por favor, intente nuevamente.' 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="desechos-container">
            <header className="desechos-hero">
                <div className="hero-content">
                    <h1>Recolección de Desechos Infecciosos</h1>
                    <p>Servicio especializado para el manejo seguro de residuos peligrosos generados por establecimientos de salud, veterinarias y afines, protegiendo el bienestar de Portoviejo.</p>
                </div>
            </header>

            <main className="desechos-main">
                <section className="form-section">
                    <div className="form-header">
                        <h2>Formulario de Registro</h2>
                        <p>Complete los datos a continuación para registrar su establecimiento en nuestra ruta de recolección.</p>
                    </div>

                    {submitStatus.message && (
                        <div className={`status-alert ${submitStatus.type}`}>
                            {submitStatus.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="desechos-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>RUC (Compañía o Persona Natural) *</label>
                                <input type="text" name="ruc" value={formData.ruc} onChange={handleChange} required maxLength="13" />
                            </div>
                            <div className="form-group">
                                <label>Razón Social *</label>
                                <input type="text" name="razonSocial" value={formData.razonSocial} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Nombre Comercial</label>
                                <input type="text" name="nombreComercial" value={formData.nombreComercial} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Dirección de Recolección *</label>
                                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Parroquia *</label>
                                <select name="parroquia" value={formData.parroquia} onChange={handleChange} required>
                                    <option value="">Seleccione una parroquia...</option>
                                    {parroquias.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Teléfono *</label>
                                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Frecuencia de Recolección *</label>
                                <select name="frecuencia" value={formData.frecuencia} onChange={handleChange} required>
                                    <option value="">Seleccione frecuencia...</option>
                                    {frecuencias.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Representante Legal *</label>
                                <input type="text" name="representante" value={formData.representante} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Cédula Representante Legal *</label>
                                <input type="text" name="cedulaRepresentante" value={formData.cedulaRepresentante} onChange={handleChange} required maxLength="10" />
                            </div>
                            <div className="form-group">
                                <label>Reg. Generador de Desechos (En caso de contar)</label>
                                <input type="text" name="regGenerador" value={formData.regGenerador} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Licencia o Certificado Ambiental (En caso de contar)</label>
                                <input type="text" name="licenciaAmbiental" value={formData.licenciaAmbiental} onChange={handleChange} />
                            </div>
                            <div className="form-group full-width">
                                <label>Archivo de Registro de Generador de Desechos o Licencia Ambiental (PDF o Imagen)</label>
                                <input type="file" id="file-upload" accept=".pdf,image/*" onChange={handleFileChange} className="file-input" />
                                <small>Máximo 5MB.</small>
                            </div>
                            <div className="form-group full-width checkbox-group">
                                <label className="checkbox-label">
                                    <input type="checkbox" name="autorizacion" checked={formData.autorizacion} onChange={handleChange} required />
                                    <span>Autorizo expresamente el uso y tratamiento de los datos personales proporcionados, con fines de registro y contacto administrativo.</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Procesando registro...' : 'Enviar Registro'}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default DesechosInfecciosos;
