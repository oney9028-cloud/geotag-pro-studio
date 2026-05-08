'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapSearch from './MapSearch';
import { Layers, Maximize, Minimize, Map as MapIcon, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import L from 'leaflet';

interface MapSelectorProps {
  onLocationChange: (lat: number, lng: number) => void;
  lat: number;
  lng: number;
}

function MapController({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position && map) {
      try {
        map.flyTo(position, map.getZoom(), { animate: true, duration: 1 });
      } catch (e) {
        console.warn('Map flyTo failed:', e);
      }
    }
  }, [position, map]);
  return null;
}

function LocationMarker({ onLocationChange, position }: { 
  onLocationChange: (lat: number, lng: number) => void;
  position: [number, number] | null;
}) {
  const map = useMapEvents({
    click(e: any) {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
      try {
        map.flyTo(e.latlng, map.getZoom());
      } catch (err) {
        console.warn('Map click flyTo failed:', err);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export default function MapSelector({ onLocationChange, lat, lng }: MapSelectorProps) {
  const [mapType, setMapType] = useState<'map' | 'satellite'>('map');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fix default icon issues
    if (typeof window !== 'undefined') {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }
    
    return () => {
      setMounted(false);
    };
  }, []);

  const position = useMemo<[number, number] | null>(() => {
    if (!lat || !lng || (lat === 0 && lng === 0)) return null;
    return [lat, lng];
  }, [lat, lng]);

  if (!mounted) return <div className="h-[500px] bg-slate-900 animate-pulse rounded-3xl" />;

  return (
    <div className="w-full space-y-4">
      <div className="h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-xl relative z-0 group">
        {/* Top Controls */}
        <div className="absolute top-4 left-4 z-[1000] flex gap-px bg-white rounded-lg shadow-lg overflow-hidden border border-black/10">
          <button
            type="button"
            onClick={() => setMapType('map')}
            className={cn(
              "px-4 py-2 text-xs font-bold transition-all",
              mapType === 'map' ? "bg-blue-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
            )}
          >
            Map
          </button>
          <button
            type="button"
            onClick={() => setMapType('satellite')}
            className={cn(
              "px-4 py-2 text-xs font-bold border-l border-black/10 transition-all",
              mapType === 'satellite' ? "bg-blue-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
            )}
          >
            Satellite
          </button>
        </div>

        {/* Search Bar */}
        <div className="absolute top-4 left-32 right-4 z-[1000]">
          <MapSearch onLocationSelect={onLocationChange} />
        </div>

        <MapContainer
          key={`map-${mounted}`}
          center={position || [20, 77]}
          zoom={position ? 13 : 5}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            key={mapType}
            attribution={mapType === 'map' ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' : 'Tiles &copy; Esri &mdash; Source: Esri'}
            url={mapType === 'map' ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"}
          />
          <LocationMarker onLocationChange={onLocationChange} position={position} />
          <MapController position={position} />
        </MapContainer>

        {/* Floating Tooltip */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-lg border border-white/10 pointer-events-none">
          Click map to set marker
        </div>
      </div>
    </div>
  );
}
