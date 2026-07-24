import { useEffect, useRef, useState } from 'react';
import { FaCheckCircle, FaCloudUploadAlt, FaExclamationTriangle, FaFilePdf, FaSyncAlt } from 'react-icons/fa';
import { Turnstile } from '@marsidev/react-turnstile';
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

// ============================================================
// VALIDADORES ECUATORIANOS
// ============================================================

// Validación de Cédula Ecuatoriana (Módulo 10)
function validateCedula(cedula) {
    if (!/^\d{10}$/.test(cedula)) return false;
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;
    const tercerDigito = parseInt(cedula[2]);
    if (tercerDigito >= 6) return false;

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
        let valor = parseInt(cedula[i]) * coeficientes[i];
        if (valor > 9) valor -= 9;
        suma += valor;
    }
    const verificador = suma % 10 === 0 ? 0 : 10 - (suma % 10);
    return verificador === parseInt(cedula[9]);
}

// Validación de RUC Ecuatoriano (Persona Natural, Sociedad Privada, Sociedad Pública)
function validateRUC(ruc) {
    if (!/^\d{13}$/.test(ruc)) return false;

    const provincia = parseInt(ruc.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;

    const tercerDigito = parseInt(ruc[2]);

    // Los 3 últimos dígitos deben ser 001 o más (no 000)
    const establecimiento = ruc.substring(10, 13);
    if (establecimiento === '000') return false;

    // Persona Natural (tercer dígito 0-5): Módulo 10 (misma lógica que cédula)
    if (tercerDigito >= 0 && tercerDigito <= 5) {
        const cedulaPart = ruc.substring(0, 10);
        return validateCedula(cedulaPart);
    }

    // Sociedad Pública (tercer dígito = 6): Módulo 11 con coeficientes [3,2,7,6,5,4,3,2]
    if (tercerDigito === 6) {
        const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
        let suma = 0;
        for (let i = 0; i < 8; i++) {
            suma += parseInt(ruc[i]) * coeficientes[i];
        }
        const residuo = suma % 11;
        const verificador = residuo === 0 ? 0 : 11 - residuo;
        return verificador === parseInt(ruc[8]);
    }

    // Sociedad Privada (tercer dígito = 9): Módulo 11 con coeficientes [4,3,2,7,6,5,4,3,2]
    if (tercerDigito === 9) {
        const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
        let suma = 0;
        for (let i = 0; i < 9; i++) {
            suma += parseInt(ruc[i]) * coeficientes[i];
        }
        const residuo = suma % 11;
        const verificador = residuo === 0 ? 0 : 11 - residuo;
        return verificador === parseInt(ruc[9]);
    }

    return false; // Tercer dígito 7 u 8 no son válidos
}

// Validación de teléfono ecuatoriano
function validatePhone(phone) {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    return /^0\d{9}$/.test(cleaned) || /^\+593\d{9}$/.test(cleaned);
}

// Validación de email
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function DesechosInfecciosos() {
    const pageRef = useRef(null);

    const [formData, setFormData] = useState({
        ruc: '', razonSocial: '', nombreComercial: '', direccion: '',
        parroquia: '', telefono: '', email: '', frecuencia: '',
        representante: '', cedulaRepresentante: '', regGenerador: '',
        licenciaAmbiental: '', autorizacion: false
    });

    // Honeypot — campo trampa invisible para bots
    const [honeypot, setHoneypot] = useState('');

    // Cloudflare Turnstile
    const [turnstileToken, setTurnstileToken] = useState('');

    const [fileData, setFileData] = useState({ name: '', mimeType: '', base64: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [globalError, setGlobalError] = useState('');
    const [errors, setErrors] = useState({});

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
        // Limpiar error del campo al escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
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

    // Validación completa del formulario
    const validate = () => {
        const e = {};

        if (!formData.ruc.trim()) {
            e.ruc = 'El RUC es requerido';
        } else if (!validateRUC(formData.ruc.trim())) {
            e.ruc = 'Ingrese un RUC válido (13 dígitos, verificado con algoritmo del SRI)';
        }

        if (!formData.razonSocial.trim()) e.razonSocial = 'La razón social es requerida';

        if (!formData.direccion.trim()) e.direccion = 'La dirección es requerida';

        if (!formData.parroquia) e.parroquia = 'Seleccione una parroquia';

        if (!formData.telefono.trim()) {
            e.telefono = 'El teléfono es requerido';
        } else if (!validatePhone(formData.telefono.trim())) {
            e.telefono = 'Ingrese un número válido (ej: 0991234567)';
        }

        if (!formData.email.trim()) {
            e.email = 'El correo es requerido';
        } else if (!validateEmail(formData.email.trim())) {
            e.email = 'Ingrese un correo electrónico válido';
        }

        if (!formData.frecuencia) e.frecuencia = 'Seleccione la frecuencia';

        if (!formData.representante.trim()) e.representante = 'El representante legal es requerido';

        if (!formData.cedulaRepresentante.trim()) {
            e.cedulaRepresentante = 'La cédula es requerida';
        } else if (!validateCedula(formData.cedulaRepresentante.trim())) {
            e.cedulaRepresentante = 'Ingrese una cédula ecuatoriana válida';
        }

        if (!formData.autorizacion) {
            e.autorizacion = 'Debe aceptar la autorización de uso de datos';
        }

        if (!turnstileToken) {
            e.turnstile = 'Complete la verificación de seguridad para continuar';
        }

        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Honeypot: Si el campo oculto tiene texto, es un bot → rechazar silenciosamente
        if (honeypot) {
            setSubmitted(true);
            return;
        }

        // Validar todos los campos
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setGlobalError('Por favor, corrija los errores indicados en rojo.');
            const firstErrorField = document.querySelector('.desechos__field--error');
            firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setIsSubmitting(true);
        setGlobalError('');

        try {
            const payload = {
                ...formData,
                archivoNombre: fileData.name,
                archivoMimeType: fileData.mimeType,
                archivoBase64: fileData.base64,
                // Enviar honeypot al backend para doble verificación
                _hp_field: honeypot,
                // Cloudflare Turnstile token
                turnstileToken: turnstileToken
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
        setErrors({});
        setHoneypot('');
        setTurnstileToken('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Helper para determinar si un campo tiene error
    const fieldClass = (name) => errors[name] ? 'desechos__field desechos__field--error' : 'desechos__field';

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
                                    {/* 🍯 HONEYPOT — Campo trampa invisible para bots */}
                                    <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
                                        <label htmlFor="website_url">No llene este campo</label>
                                        <input
                                            type="text"
                                            id="website_url"
                                            name="website_url"
                                            value={honeypot}
                                            onChange={(e) => setHoneypot(e.target.value)}
                                            tabIndex={-1}
                                            autoComplete="off"
                                        />
                                    </div>

                                    {/* Fila 1: RUC y Razón Social */}
                                    <div className="desechos__form-row">
                                        <div className={fieldClass('ruc')}>
                                            <label>RUC (Compañía o Persona Natural) <span className="desechos__required">*</span></label>
                                            <input type="text" name="ruc" value={formData.ruc} onChange={handleChange} required maxLength="13" placeholder="Ej: 1300000000001" />
                                            {errors.ruc && <span className="desechos__error-msg">{errors.ruc}</span>}
                                        </div>
                                        <div className={fieldClass('razonSocial')}>
                                            <label>Razón Social <span className="desechos__required">*</span></label>
                                            <input type="text" name="razonSocial" value={formData.razonSocial} onChange={handleChange} required placeholder="Nombre legal de la empresa" />
                                            {errors.razonSocial && <span className="desechos__error-msg">{errors.razonSocial}</span>}
                                        </div>
                                    </div>

                                    {/* Fila 2: Nombre Comercial y Dirección */}
                                    <div className="desechos__form-row">
                                        <div className="desechos__field">
                                            <label>Nombre Comercial</label>
                                            <input type="text" name="nombreComercial" value={formData.nombreComercial} onChange={handleChange} placeholder="Nombre público del negocio" />
                                        </div>
                                        <div className={fieldClass('direccion')}>
                                            <label>Dirección de Recolección <span className="desechos__required">*</span></label>
                                            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required placeholder="Dirección exacta del establecimiento" />
                                            {errors.direccion && <span className="desechos__error-msg">{errors.direccion}</span>}
                                        </div>
                                    </div>

                                    {/* Fila 3: Parroquia y Teléfono */}
                                    <div className="desechos__form-row">
                                        <div className={fieldClass('parroquia')}>
                                            <label>Parroquia <span className="desechos__required">*</span></label>
                                            <select name="parroquia" value={formData.parroquia} onChange={handleChange} required>
                                                <option value="">Seleccione una parroquia...</option>
                                                {PARROQUIAS.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                            {errors.parroquia && <span className="desechos__error-msg">{errors.parroquia}</span>}
                                        </div>
                                        <div className={fieldClass('telefono')}>
                                            <label>Teléfono <span className="desechos__required">*</span></label>
                                            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required placeholder="Ej: 0991234567" />
                                            {errors.telefono && <span className="desechos__error-msg">{errors.telefono}</span>}
                                        </div>
                                    </div>

                                    {/* Fila 4: Email y Frecuencia */}
                                    <div className="desechos__form-row">
                                        <div className={fieldClass('email')}>
                                            <label>Email <span className="desechos__required">*</span></label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="correo@ejemplo.com" />
                                            {errors.email && <span className="desechos__error-msg">{errors.email}</span>}
                                        </div>
                                        <div className={fieldClass('frecuencia')}>
                                            <label>Frecuencia de Recolección <span className="desechos__required">*</span></label>
                                            <select name="frecuencia" value={formData.frecuencia} onChange={handleChange} required>
                                                <option value="">Seleccione frecuencia...</option>
                                                {FRECUENCIAS.map(f => <option key={f} value={f}>{f}</option>)}
                                            </select>
                                            {errors.frecuencia && <span className="desechos__error-msg">{errors.frecuencia}</span>}
                                        </div>
                                    </div>

                                    {/* Fila 5: Representante Legal y Cédula */}
                                    <div className="desechos__form-row">
                                        <div className={fieldClass('representante')}>
                                            <label>Representante Legal <span className="desechos__required">*</span></label>
                                            <input type="text" name="representante" value={formData.representante} onChange={handleChange} required placeholder="Nombre completo" />
                                            {errors.representante && <span className="desechos__error-msg">{errors.representante}</span>}
                                        </div>
                                        <div className={fieldClass('cedulaRepresentante')}>
                                            <label>Cédula Representante Legal <span className="desechos__required">*</span></label>
                                            <input type="text" name="cedulaRepresentante" value={formData.cedulaRepresentante} onChange={handleChange} required maxLength="10" placeholder="Ej: 1300000000" />
                                            {errors.cedulaRepresentante && <span className="desechos__error-msg">{errors.cedulaRepresentante}</span>}
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
                                    <div className={`desechos__checkbox-wrapper ${errors.autorizacion ? 'desechos__checkbox-wrapper--error' : ''}`}>
                                        <label className="desechos__checkbox-label">
                                            <input type="checkbox" name="autorizacion" checked={formData.autorizacion} onChange={handleChange} />
                                            <span>Autorizo expresamente el uso y tratamiento de los datos personales proporcionados en este formulario, con fines de registro, contacto administrativo y coordinación del servicio de recolección de desechos infecciosos.</span>
                                        </label>
                                        {errors.autorizacion && <span className="desechos__error-msg" style={{ marginTop: '8px' }}>{errors.autorizacion}</span>}
                                    </div>

                                    {/* Cloudflare Turnstile */}
                                    <div className={`desechos__field ${errors.turnstile ? 'desechos__field--error' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
                                        <Turnstile 
                                            siteKey="0x4AAAAAAD837MC5ojULhvqg" 
                                            onSuccess={(token) => {
                                                setTurnstileToken(token);
                                                if (errors.turnstile) setErrors(prev => ({ ...prev, turnstile: '' }));
                                            }}
                                            onError={() => setErrors(prev => ({ ...prev, turnstile: 'Error de verificación de seguridad. Recargue la página.' }))}
                                            options={{ theme: 'dark' }}
                                        />
                                        {errors.turnstile && <span className="desechos__error-msg" style={{ marginTop: '8px' }}>{errors.turnstile}</span>}
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
