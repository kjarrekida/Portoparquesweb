import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaTree, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AdminMapa = ({ solicitudes }) => {
    // Portoviejo Coordinates
    const defaultCenter = [-1.0546, -80.4544]; 

    // Solo mostrar trámites que tengan coordenadas GPS extraíbles
    const validMarkers = solicitudes.map(s => {
        let coords = null;
        if (s.ubicacionMaps) {
            try {
                // Parse ubicacionMaps, which is typically "https://www.google.com/maps?q=lat,lng"
                const urlParams = new URLSearchParams(s.ubicacionMaps.split('?')[1]);
                const q = urlParams.get('q');
                if (q) {
                    const [latStr, lngStr] = q.split(',');
                    const lat = parseFloat(latStr);
                    const lng = parseFloat(lngStr);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        coords = [lat, lng];
                    }
                }
            } catch(e) {
                console.error("Error parseando GPS para", s.id);
            }
        }
        return { ...s, coords };
    }).filter(s => s.coords !== null);

    const getColorForState = (estado) => {
        switch(estado) {
            case 'Nuevo': return '#2196f3';
            case 'Ingresado': return '#ffeb3b';
            case 'Planificado': return '#ff9800';
            case 'Atendido': return '#4caf50';
            case 'Cancelado': return '#f44336';
            default: return '#fff';
        }
    };

    return (
        <div className="admin-mapa-container" style={{ height: 'calc(100vh - 120px)', width: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--white-alpha-20)' }}>
            <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, background: 'rgba(0,0,0,0.8)', padding: '10px 15px', borderRadius: '8px', border: '1px solid #333' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#fff' }}>Simbología (Estados)</h4>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '0.8rem'}}><div style={{width: 12, height: 12, borderRadius: '50%', background: '#2196f3'}}></div> Nuevo</div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '0.8rem'}}><div style={{width: 12, height: 12, borderRadius: '50%', background: '#ffeb3b'}}></div> Ingresado</div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '0.8rem'}}><div style={{width: 12, height: 12, borderRadius: '50%', background: '#ff9800'}}></div> Planificado</div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', fontSize: '0.8rem'}}><div style={{width: 12, height: 12, borderRadius: '50%', background: '#4caf50'}}></div> Atendido</div>
            </div>

            <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                {/* Dark Mode Map Layer */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {validMarkers.map(s => (
                    <CircleMarker 
                        key={s.id} 
                        center={s.coords} 
                        radius={s.estado === 'Planificado' ? 12 : 8}
                        pathOptions={{ 
                            color: getColorForState(s.estado), 
                            fillColor: getColorForState(s.estado),
                            fillOpacity: 0.7,
                            weight: 2
                        }}
                    >
                        <Popup className="dark-popup">
                            <div style={{color: '#333'}}>
                                <h3 style={{margin: '0 0 5px 0', fontSize: '1.1rem'}}>{s.id}</h3>
                                <p style={{margin: '0 0 3px 0'}}><strong>Servicio:</strong> {s.tipoServicio}</p>
                                <p style={{margin: '0 0 3px 0'}}><strong>Ciudadano:</strong> {s.nombreApellidos}</p>
                                <p style={{margin: '0 0 3px 0'}}><strong>Estado:</strong> <span style={{color: getColorForState(s.estado), fontWeight: 'bold'}}>{s.estado}</span></p>
                                {s.fechaPlanificada && <p style={{margin: '0 0 3px 0'}}><strong>Planificado:</strong> {new Date(s.fechaPlanificada).toLocaleDateString('es-EC')}</p>}
                                <p style={{margin: '0', fontSize: '0.8rem', color: '#666'}}>{s.parroquia} - {s.direccion}</p>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </div>
    );
};

export default AdminMapa;
