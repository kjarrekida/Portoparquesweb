import { useEffect, useRef, useState } from 'react';
import { FaCheckCircle, FaCloudUploadAlt, FaExclamationTriangle, FaFilePdf, FaSyncAlt } from 'react-icons/fa';
import './DesechosInfecciosos.css';

// URL del Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyOUsmL6tj2oWOAg_Dw_CFwtxmfRapyeqGmJxOji58MzAfb_Je6yv2Df-fV6ZC4azGm/exec';

// Parroquias de Portoviejo
const PARROQUIAS = [
    'Portoviejo', '18 de Octubre', '12 de Marzo', 'San Pablo',
    'Picoazá', 'Colón', 'Andrés de Vera', 'Simón Bolívar',
    'Abdón Calderón', 'Pueblo Nuevo', 'Riochico', 'Crucita',
    'Francisco Pacheco', 'Alhajuela', 'San Plácido', 'Chirijos'
];

const FRECUENCIAS = [
    'Diaria', 'Pasando un día', 'Semanal', 'Quincenal', 'Mensual'
];

export default function DesechosInfecciosos() {
    const pageRef = useRef(null);

    const [formData, setFormData] = useState({
        ruc: '', razonSocial: '', nombreComercial: '', direccion: '',
        parroquia: '', telefono: '', email: '', frecuencia: '',
        representante: '', cedulaRepresentante: '', regGenerador: '',
        licenciaAmbiental: '', autorizacion: false
    });

    const [fileData, setFileData] = useState({ name: '', mimeType: '', base64: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [globalError, setGlobalError] = useState('');

    // Animations observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
            { threshold: 0.1 }
        );
        pageRef.current?.querySelectorAll('.animate-in').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo es demasiado grande. Máximo 5MB.');
            e.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            setFileData({
                name: file.name,
                mimeType: file.type,
                base64: event.target.result.split(',')[1]
            });
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.autorizacion) {
            setGlobalError('Debe aceptar la autorización de uso de datos para continuar.');
            return;
        }
        setIsSubmitting(true);
        setGlobalError('');

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
            });
            const result = await response.json();

            if (result.status === 'success') {
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                throw new Error(result.message || 'Error al procesar la solicitud');
            }
        } catch (error) {
            console.error('Error:', error);
            setGlobalError('Ocurrió un error al enviar el formulario. Por favor, intente nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setFormData({
            ruc: '', razonSocial: '', nombreComercial: '', direccion: '',
            parroquia: '', telefono: '', email: '', frecuencia: '',
            representante: '', cedulaRepresentante: '', regGenerador: '',
            licenciaAmbiental: '', autorizacion: false
        });
        setFileData({ name: '', mimeType: '', base64: '' });
        setSubmitted(false);
        setGlobalError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div ref={pageRef} className="poda-page">
            {/* Hero — Utiliza la misma clase global page-hero */}
            <section className="page-hero desechos-hero">
                <div className="page-hero__bg desechos-hero__bg"></div>
                <div className="container">
                    <h1 className="page-hero__title animate-in">Recolección de Desechos Infecciosos</h1>
                    <p className="page-hero__subtitle animate-in">
                        Servicio especializado para el manejo seguro de residuos peligrosos generados
                        por establecimientos de salud, veterinarias y afines.
                    </p>
                </div>
            </section>

            {/* Intro */}
            <section className="poda-intro section-padding">
                <div className="container">
                    <div className="desechos-intro__content animate-in">
                        <div className="desechos-intro__accent-bar"></div>
                        <p className="desechos-intro__text">
                            <strong>Portoparques EP</strong> ofrece el servicio de <strong>recolección de desechos
                            infecciosos peligrosos</strong> para establecimientos de salud, clínicas, consultorios
                            odontológicos, veterinarias y todo generador de residuos peligrosos en el cantón Portoviejo.
                            Complete el siguiente formulario para registrar su establecimiento en nuestra ruta de
                            recolección programada.
                        </p>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section className="poda section-padding" style={{ paddingTop: 0 }}>
                <div className="container">
                    <div className="desechos__grid">
                        <div className="desechos__form-wrapper animate-in">
                            <h2 className="desechos__form-title">
                                {submitted ? '✅ Registro Exitoso' : 'Formulario de Registro'}
                            </h2>

                            {!submitted && (
                                <p className="desechos__form-subtitle">
                                    Complete todos los campos obligatorios (*) para registrar su establecimiento.
                                </p>
                            )}

                            {/* Error global */}
                            {globalError && (
                                <div className="desechos__alert desechos__alert--error">
                                    <FaExclamationTriangle /> {globalError}
                                </div>
                            )}

                            {submitted ? (
                                <div className="desechos__success-card">
                                    <div className="desechos__success-icon"><FaCheckCircle /></div>
                                    <h3 className="desechos__success-title">¡Registro completado!</h3>
                                    <p className="desechos__success-text">
                                        Su establecimiento ha sido registrado exitosamente en nuestra base de datos.
                                        Nuestro equipo se comunicará con usted para coordinar los detalles de la
                                        recolección según la frecuencia seleccionada.
                                    </p>
                                    <button className="desechos__new-btn" onClick={handleReset}>
                                        <FaSyncAlt /> Realizar otro registro
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="desechos__form">
                                    {/* Fila 1: RUC y Razón Social */}
                                    <div className="desechos__form-row">
                                        <div className="desechos__field">
                                            <label>RUC (Compañía o Persona Natural) <span className="desechos__required">*</span></label>
                                            <input type="text" name="ruc" value={formData.ruc} onChange={handleChange} required maxLength="13" placeholder="Ej: 1300000000001" />
                                        </div>
                                        <div className="desechos__field">
                                            <label>Razón Social <span className="desechos__required">*</span></label>
                                            <input type="text" name="razonSocial" value={formData.razonSocial} onChange={handleChange} required placeholder="Nombre legal de la empresa" />
                                        </div>
                                    </div>

                                    {/* Fila 2: Nombre Comercial y Dirección */}
                                    <div className="desechos__form-row">
                                        <div className="desechos__field">
                                            <label>Nombre Comercial</label>
                                            <input type="text" name="nombreComercial" value={formData.nombreComercial} onChange={handleChange} placeholder="Nombre público del negocio" />
                                        </div>
                                        <div className="desechos__field">
                                            <label>Dirección de Recolección <span className="desechos__required">*</span></label>
                                            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required placeholder="Dirección exacta del establecimiento" />
                                        </div>
                                    </div>

                                    {/* Fila 3: Parroquia y Teléfono */}
                                    <div className="desechos__form-row">
                                        <div className="desechos__field">
                                            <label>Parroquia <span className="desechos__required">*</span></label>
                                            <select name="parroquia" value={formData.parroquia} onChange={handleChange} required>
                                                <option value="">Seleccione una parroquia...</option>
                                                {PARROQUIAS.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div className="desechos__field">
                                            <label>Teléfono <span className="desechos__required">*</span></label>
                                            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required placeholder="Ej: 0991234567" />
                                        </div>
                                    </div>

                                    {/* Fila 4: Email y Frecuencia */}
                                    <div className="desechos__form-row">
                                        <div className="desechos__field">
                                            <label>Email <span className="desechos__required">*</span></label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="correo@ejemplo.com" />
                                        </div>
                                        <div className="desechos__field">
                                            <label>Frecuencia de Recolección <span className="desechos__required">*</span></label>
                                            <select name="frecuencia" value={formData.frecuencia} onChange={handleChange} required>
                                                <option value="">Seleccione frecuencia...</option>
                                                {FRECUENCIAS.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Fila 5: Representante Legal y Cédula */}
                                    <div className="desechos__form-row">
                                        <div className="desechos__field">
                                            <label>Representante Legal <span className="desechos__required">*</span></label>
                                            <input type="text" name="representante" value={formData.representante} onChange={handleChange} required placeholder="Nombre completo" />
                                        </div>
                                        <div className="desechos__field">
                                            <label>Cédula Representante Legal <span className="desechos__required">*</span></label>
                                            <input type="text" name="cedulaRepresentante" value={formData.cedulaRepresentante} onChange={handleChange} required maxLength="10" placeholder="Ej: 1300000000" />
                                        </div>
                                    </div>

                                    {/* Fila 6: Reg. Generador y Licencia */}
                                    <div className="desechos__form-row">
                                        <div className="desechos__field">
                                            <label>Reg. Generador de Desechos (En caso de contar)</label>
                                            <input type="text" name="regGenerador" value={formData.regGenerador} onChange={handleChange} placeholder="Número de registro" />
                                        </div>
                                        <div className="desechos__field">
                                            <label>Licencia o Certificado Ambiental (En caso de contar)</label>
                                            <input type="text" name="licenciaAmbiental" value={formData.licenciaAmbiental} onChange={handleChange} placeholder="Número de licencia" />
                                        </div>
                                    </div>

                                    {/* Archivo adjunto */}
                                    <div className="desechos__field">
                                        <label>Archivo de Registro de Generador o Licencia Ambiental</label>
                                        <div className="desechos__file-zone" onClick={() => document.getElementById('file-upload').click()}>
                                            <input type="file" id="file-upload" accept=".pdf,image/*" onChange={handleFileChange} />
                                            <div className="desechos__file-icon"><FaCloudUploadAlt /></div>
                                            <p className="desechos__file-text">
                                                <strong>Click aquí</strong> para seleccionar archivo
                                            </p>
                                            <p className="desechos__file-hint">PDF o imagen • Máximo 5MB</p>
                                            {fileData.name && (
                                                <p className="desechos__file-name">
                                                    <FaFilePdf /> {fileData.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Autorización */}
                                    <div className="desechos__checkbox-wrapper">
                                        <label className="desechos__checkbox-label">
                                            <input type="checkbox" name="autorizacion" checked={formData.autorizacion} onChange={handleChange} />
                                            <span>Autorizo expresamente el uso y tratamiento de los datos personales proporcionados en este formulario, con fines de registro, contacto administrativo y coordinación del servicio de recolección de desechos infecciosos.</span>
                                        </label>
                                    </div>

                                    {/* Botón de envío */}
                                    <button type="submit" className="desechos__submit-btn" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <><FaSyncAlt className="spin-icon" /> Procesando registro...</>
                                        ) : (
                                            <>Enviar Registro</>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
