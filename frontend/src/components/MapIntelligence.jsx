import React, { useEffect, useState, memo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Info } from 'lucide-react';
import { batchGeocode, extractLocationsFromMarkdown } from '../utils/geoUtils';

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
  className: `custom-marker ${isActive ? 'active' : ''}`,
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

const MapIntelligence = memo(({ itinerary, destination, onMarkerClick, activeId }) => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!itinerary) return;

    const runGeocoding = async () => {
      setLoading(true);
      const placeNames = extractLocationsFromMarkdown(itinerary);
      
      // Batch geocoding handles rate limits and caching
      const geoPoints = await batchGeocode(placeNames, destination);
      setPoints(geoPoints);
      setLoading(false);
    };

    runGeocoding();
  }, [itinerary, destination]);

  const polylineCoords = points.map(p => [p.lat, p.lng]);
  const defaultCenter = [48.8566, 2.3522]; // Paris default

  if (!itinerary && !loading) return null;

  return (
    <div className="map-intelligence-wrapper glass fade-in">
      <div className="map-meta">
        <Navigation size={14} className="text-cyan-400" />
        <span>Map Intelligence</span>
        {loading && <span className="map-status-pulse">Geocoding...</span>}
      </div>
      
      <div className="map-container-inner">
        <MapContainer 
          center={polylineCoords[0] || defaultCenter} 
          zoom={13} 
          scrollWheelZoom={false}
          className="leaflet-map-premium"
          ref={mapRef}
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

          {points.map((point, idx) => (
            <Marker 
              key={`${point.lat}-${point.lng}-${idx}`} 
              position={[point.lat, point.lng]}
              icon={createCustomIcon(activeId === point.name)}
              eventHandlers={{
                click: () => onMarkerClick?.(point.name),
              }}
            >
              <Popup>
                <div className="map-popup-card">
                  <strong>{point.name}</strong>
                  <p>{point.displayName?.split(',')[0]}</p>
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
