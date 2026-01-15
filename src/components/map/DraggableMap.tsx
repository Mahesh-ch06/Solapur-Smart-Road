import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { getCurrentLocation, SOLAPUR_COORDS } from '@/utils/geolocation';

// Draggable marker icon
const locationIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      background-color: #2563EB;
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 14px;
      ">📍</div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

interface DraggableMapProps {
  initialPosition?: { lat: number; lng: number };
  onPositionChange: (lat: number, lng: number) => void;
}

// Component to handle map events and marker dragging
const DraggableMarker = ({
  position,
  onPositionChange,
}: {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(position);
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      setMarkerPosition([e.latlng.lat, e.latlng.lng]);
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    setMarkerPosition(position);
  }, [position]);

  return (
    <Marker
      position={markerPosition}
      icon={locationIcon}
      draggable
      ref={markerRef}
      eventHandlers={{
        dragend() {
          const marker = markerRef.current;
          if (marker) {
            const latlng = marker.getLatLng();
            setMarkerPosition([latlng.lat, latlng.lng]);
            onPositionChange(latlng.lat, latlng.lng);
          }
        },
      }}
    />
  );
};

const DraggableMap = ({ initialPosition, onPositionChange }: DraggableMapProps) => {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<[number, number]>([
    initialPosition?.lat || SOLAPUR_COORDS.lat,
    initialPosition?.lng || SOLAPUR_COORDS.lng,
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    // Get current location
    getCurrentLocation().then((coords) => {
      setPosition([coords.lat, coords.lng]);
      onPositionChange(coords.lat, coords.lng);
      setLoading(false);
    });
  }, []);

  const handleLocateMe = async () => {
    setLoading(true);
    const coords = await getCurrentLocation();
    setPosition([coords.lat, coords.lng]);
    onPositionChange(coords.lat, coords.lng);
    setLoading(false);
  };

  if (!mounted) {
    return (
      <div className="w-full h-[250px] bg-muted animate-pulse rounded-xl flex items-center justify-center">
        <MapPin className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative">
      <MapContainer
        center={position}
        zoom={15}
        className="w-full h-[250px] rounded-xl"
        style={{ minHeight: '250px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker
          position={position}
          onPositionChange={(lat, lng) => {
            setPosition([lat, lng]);
            onPositionChange(lat, lng);
          }}
        />
      </MapContainer>
      
      <button
        onClick={handleLocateMe}
        disabled={loading}
        className="absolute bottom-4 right-4 z-[1000] bg-card p-3 rounded-full shadow-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50"
        title="Use my location"
      >
        <Navigation className={`w-5 h-5 text-primary ${loading ? 'animate-pulse' : ''}`} />
      </button>
      
      <div className="absolute top-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-border">
        <p className="text-xs text-muted-foreground">Drag pin or tap to set location</p>
      </div>
    </div>
  );
};

export default DraggableMap;
