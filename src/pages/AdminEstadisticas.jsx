import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { FaTree, FaMapMarkerAlt, FaClock, FaCheckCircle } from 'react-icons/fa';

const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0', '#00bcd4'];

const AdminEstadisticas = ({ solicitudes }) => {
    // --- Statistics Calculations ---
    const totalArboles = solicitudes.reduce((acc, curr) => acc + (curr.numeroArboles || 1), 0);
    const totalIngresadas = solicitudes.length;
    const totalAtendidas = solicitudes.filter(s => s.estado === 'Atendido').length;
    const tasaCompletitud = totalIngresadas > 0 ? Math.round((totalAtendidas / totalIngresadas) * 100) : 0;
    
    // Calculate Average Attention Time
    const atendidasConFechas = solicitudes.filter(s => s.estado === 'Atendido' && s.fechaAtencion && s.fecha);
    let tiempoPromedioDias = 0;
    if (atendidasConFechas.length > 0) {
        const totalDias = atendidasConFechas.reduce((acc, curr) => {
            const diffTime = Math.abs(new Date(curr.fechaAtencion) - new Date(curr.fecha));
            return acc + Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        }, 0);
        tiempoPromedioDias = Math.round(totalDias / atendidasConFechas.length);
    }

    // Top Parroquia
    const parroquiasCount = {};
    solicitudes.forEach(s => {
        if(s.parroquia) parroquiasCount[s.parroquia] = (parroquiasCount[s.parroquia] || 0) + 1;
    });
    let topParroquia = 'Ninguna';
    let topParroquiaCount = 0;
    Object.keys(parroquiasCount).forEach(p => {
        if(parroquiasCount[p] > topParroquiaCount) {
            topParroquiaCount = parroquiasCount[p];
            topParroquia = p;
        }
    });

    // Chart Data: Service Types
    const tiposCount = {};
    solicitudes.forEach(s => {
        tiposCount[s.tipoServicio] = (tiposCount[s.tipoServicio] || 0) + 1;
    });
    const pieData = Object.keys(tiposCount).map(key => ({ name: key, value: tiposCount[key] }));

    // Chart Data: Por Parroquia
    const barData = Object.keys(parroquiasCount).map(key => ({ name: key, Solicitudes: parroquiasCount[key] })).sort((a,b) => b.Solicitudes - a.Solicitudes);

    // Chart Data: Evolución por Mes
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const trendDataMap = {};
    solicitudes.forEach(s => {
        const d = new Date(s.fecha);
        const mesStr = meses[d.getMonth()];
        trendDataMap[mesStr] = (trendDataMap[mesStr] || 0) + 1;
    });
    
    // Construir arreglo ordenado de meses (simplificado para el año actual)
    const trendData = meses.map(m => ({
        name: m,
        Ingresos: trendDataMap[m] || 0
    }));

    return (
        <div className="admin-estadisticas-container">
            {/* --- STATS ROW --- */}
            <div className="admin-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><FaTree /></div>
                    <div className="stat-info">
                        <h3>Árboles Intervenidos</h3>
                        <h2>{totalArboles}</h2>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FaMapMarkerAlt /></div>
                    <div className="stat-info">
                        <h3>Top Parroquia</h3>
                        <h2>{topParroquia} <span className="stat-small">({topParroquiaCount})</span></h2>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FaClock /></div>
                    <div className="stat-info">
                        <h3>Promedio Atención</h3>
                        <h2>{tiempoPromedioDias} <span className="stat-small">días</span></h2>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FaCheckCircle /></div>
                    <div className="stat-info">
                        <h3>Tasa Completitud</h3>
                        <h2>{tasaCompletitud}%</h2>
                    </div>
                </div>
            </div>

            {/* --- CHARTS ROW 1 --- */}
            <div className="admin-charts-grid" style={{marginTop: '20px'}}>
                <div className="chart-card">
                    <h3>Tipos de Servicio (Distribución)</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{backgroundColor: '#1a1a1a', border: 'none', color: '#fff'}} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="chart-card">
                    <h3>Demanda Mensual (Evolución)</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                                <XAxis dataKey="name" tick={{fill: '#fff', fontSize: 12}} />
                                <YAxis tick={{fill: '#fff', fontSize: 12}} />
                                <Tooltip contentStyle={{backgroundColor: '#1a1a1a', border: 'none', color: '#fff'}} />
                                <Line type="monotone" dataKey="Ingresos" stroke="#2196f3" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- CHARTS ROW 2 --- */}
            <div className="admin-charts-grid" style={{marginTop: '20px', gridTemplateColumns: '1fr'}}>
                <div className="chart-card">
                    <h3>Solicitudes por Parroquia (Volumen)</h3>
                    <div className="chart-wrapper" style={{height: '350px'}}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{fill: '#fff', fontSize: 12}} />
                                <YAxis tick={{fill: '#fff', fontSize: 12}} />
                                <Tooltip contentStyle={{backgroundColor: '#1a1a1a', border: 'none', color: '#fff'}} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                                <Bar dataKey="Solicitudes" fill="#4caf50" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEstadisticas;
