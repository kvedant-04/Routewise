import React, { useEffect, useState, memo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Info } from 'lucide-react';
import { batchGeocode, getCoordinates } from '../utils/geoUtils';

/**
 * FIX: Leaflet default icon path issues in Vite/Webpacker
 */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Premium Dark Icon (using Lucide MapPin)
const createCustomIcon = (isActive) => L.divIcon({
  className: `custom-marker ${isActive ? 'active active-marker-glow' : ''}`,
  html: `<div class="marker-blob ${isActive ? 'glow' : ''}"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/**
 * SUB-COMPONENT: Auto-centering & Zoom Layer
 */
function MapEffects({ center, bounds }) {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 1.5 });
    } else if (center) {
      map.flyTo(center, 13, { animate: true, duration: 1.5 });
    }
  }, [center, bounds, map]);
  
  return null;
}

const MapIntelligence = memo(({ data, destination, onMarkerClick, activeId }) => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState(null);

  // DEBUG LAYER
  useEffect(() => {
    if (data && data.length > 0) {
      console.log("GEOLOCATION INPUT:", data);
    }
  }, [data]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const runGeocoding = async () => {
      setLoading(true);
      
      try {
        const geoResults = await batchGeocode(data, destination);
        
        // Apply slight jitter for overlapping coordinates to prevent marker stacking
        const seenCoords = new Set();
        const jitteredPoints = geoResults.map(p => {
          const coordKey = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
          let finalLat = p.lat;
          let finalLng = p.lng;
          
          if (seenCoords.has(coordKey)) {
            finalLat += (Math.random() - 0.5) * 0.002;
            finalLng += (Math.random() - 0.5) * 0.002;
          }
          seenCoords.add(coordKey);
          
          return {
            ...p,
            lat: finalLat,
            lng: finalLng,
            name: p.place, // map back to component expectation
            activity: data.find(ev => ev.id === p.id)?.activity || ""
          };
        });

        setPoints(jitteredPoints);
      } catch (err) {
        console.error("Map Geocoding Failed:", err);
      } finally {
        setLoading(false);
      }
    };

    runGeocoding();
  }, [data, destination]);

  // PHASE 7 — MAP SYNC SAFETY (Refined with Strict Filter & Sorting)
  const validPoints = points.filter(
    p => p && p.lat && p.lng && p.place && p.place.length > 2 && p.activity
  ).sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    const timeOrder = { "Morning": 1, "Afternoon": 2, "Evening": 3, "Night": 4 };
    return (timeOrder[a.time] || 5) - (timeOrder[b.time] || 5);
  });
  const polylineCoords = validPoints.map(p => [p.lat, p.lng]);
  const defaultCenter = [48.8566, 2.3522]; // Paris default

  // Phase 10: Debug Layer
  useEffect(() => {
    if (validPoints.length > 0) {
      console.log("VALID POINTS:", validPoints);
    }
  }, [validPoints]);

  // PHASE 2 — FIX MAP REACTIVITY
  useEffect(() => {
    if (!map || validPoints.length === 0) return;

    const first = validPoints[0];
    map.setView([first.lat, first.lng], 13, {
      animate: true,
      duration: 1.2
    });
  }, [JSON.stringify(validPoints), map]);

  // PHASE 10 — MAP FLYTO SYNC ON ACTIVE ID
  useEffect(() => {
    if (!map || !activeId || validPoints.length === 0) return;

    const activePoint = validPoints.find(p => p.id === activeId);
    if (activePoint) {
      map.flyTo([activePoint.lat, activePoint.lng], 15, {
        animate: true,
        duration: 1.5
      });
    }
  }, [activeId, map, validPoints]);

  if (!data || data.length === 0) return null;

  // PHASE 3 — HANDLE GEOCODING DELAY
  if (!validPoints.length) {
    return (
      <div className="map-intelligence-wrapper glass fade-in" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="map-loading-experience">
          <div className="spinner-minimal" style={{ marginBottom: '1rem' }} />
          <div className="loading-stage-text">Mapping locations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-intelligence-wrapper glass fade-in">
      <div className="map-meta">
        <Navigation size={14} className="text-cyan-400" />
        <span>Map Intelligence</span>
        {loading && <span className="map-status-pulse">Geocoding...</span>}
      </div>
      
      <div className="map-container-inner" style={{ height: "400px", width: "100%" }}>
        {/* PHASE 4 — FORCE MAP RE-RENDER (STABLE KEY) */}
        <MapContainer 
          key={validPoints.map(p => p.id).join("-")}
          center={polylineCoords[0] || defaultCenter} 
          zoom={13} 
          scrollWheelZoom={false}
          className="leaflet-map-premium"
          ref={setMap}
        >
          {/* DARK THEME VIA CSS FILTERS (PHASE 7 FIX 2) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="osm-tiles-dark"
          />

          <MapEffects 
            center={polylineCoords[0]} 
            bounds={polylineCoords.length > 1 ? polylineCoords : null} 
          />

          {validPoints.map((point, idx) => (
            <Marker 
              key={`${point.id}-${idx}`} 
              position={[point.lat, point.lng]}
              icon={createCustomIcon(activeId === point.id)}
              eventHandlers={{
                click: () => onMarkerClick?.(point.id),
              }}
            >
              <Popup className="premium-map-popup">
                <div className="map-popup-card">
                  <div className="popup-header">
                    <span className="popup-day-badge">Day {point.day || '?'}</span>
                    <span className="popup-time">{point.time || 'Anytime'}</span>
                  </div>
                  <h4 className="popup-title">{point.place || 'Unknown Place'}</h4>
                  <p className="popup-activity">{point.activity || 'Activity details unavailable'}</p>
                  
                  {/* Phase 6 — Rich Data Popups */}
                  <div className="popup-extra">
                    {(point.cost !== undefined && point.cost !== null) && <span className="popup-cost">${point.cost}</span>}
                    {point.notes && <p className="popup-notes">“{point.notes}”</p>}
                  </div>

                  <div className="popup-footer">
                    <Navigation size={10} className="text-cyan-400" />
                    <span>Click to focus in list</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {polylineCoords.length > 1 && (
            <Polyline 
              positions={polylineCoords} 
              pathOptions={{ color: 'var(--cyan)', weight: 3, opacity: 0.6, dashArray: '8, 8' }} 
              className="route-line-animated"
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
});

export default MapIntelligence;
