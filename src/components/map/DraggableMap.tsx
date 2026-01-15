import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Crosshair, Map as MapIcon, AlertTriangle, Eye, Info } from 'lucide-react';
import { getCurrentLocation, SOLAPUR_COORDS } from '@/utils/geolocation';
import { Badge } from '@/components/ui/badge';

// Draggable marker icon - enhanced with better visibility
const locationIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
      width: 40px;
      height: 40px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 4px solid white;
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.5), 0 0 0 4px rgba(37, 99, 235, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 18px;
        font-weight: bold;
      ">📍</div>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: rotate(-45deg) scale(1); }
        50% { transform: rotate(-45deg) scale(1.05); }
      }
    </style>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

interface DraggableMapProps {
  initialPosition?: { lat: number; lng: number };
  onPositionChange: (lat: number, lng: number) => void;
  nearbyReports?: Array<{ latitude: number; longitude: number; ticketId: string; status: string }>;
  showAccuracyCircle?: boolean;
  readOnly?: boolean;
}

// User location marker (blue dot)
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.6);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to handle map events and marker dragging
const DraggableMarker = ({
  position,
  onPositionChange,
  readOnly,
}: {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
  readOnly?: boolean;
}) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(position);
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      if (!readOnly) {
        setMarkerPosition([e.latlng.lat, e.latlng.lng]);
        onPositionChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  useEffect(() => {
    setMarkerPosition(position);
  }, [position]);

  return (
    <Marker
      position={markerPosition}
      icon={locationIcon}
      draggable={!readOnly}
      ref={markerRef}
      eventHandlers={{
        dragend() {
          if (!readOnly) {
            const marker = markerRef.current;
            if (marker) {
              const latlng = marker.getLatLng();
              setMarkerPosition([latlng.lat, latlng.lng]);
              onPositionChange(latlng.lat, latlng.lng);
            }
          }
        },
      }}
    >
      <Popup>
        <div className="text-center p-2">
          <p className="font-semibold text-sm mb-1">📍 Report Location</p>
          <p className="text-xs text-muted-foreground">
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
          {!readOnly && (
            <p className="text-xs text-primary mt-2">Drag to adjust position</p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

const DraggableMap = ({ 
  initialPosition, 
  onPositionChange, 
  nearbyReports = [],
  showAccuracyCircle = true,
  readOnly = false
}: DraggableMapProps) => {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<[number, number]>([
    initialPosition?.lat || SOLAPUR_COORDS.lat,
    initialPosition?.lng || SOLAPUR_COORDS.lng,
  ]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [showNearby, setShowNearby] = useState(true);
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    setMounted(true);
    
    // Get current location with accuracy
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPosition(coords);
          setUserLocation(coords);
          setAccuracy(pos.coords.accuracy || 0);
          onPositionChange(coords[0], coords[1]);
          setLoading(false);
        },
        () => {
          // Fallback to Solapur
          getCurrentLocation().then((coords) => {
            setPosition([coords.lat, coords.lng]);
            onPositionChange(coords.lat, coords.lng);
            setLoading(false);
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      getCurrentLocation().then((coords) => {
        setPosition([coords.lat, coords.lng]);
        onPositionChange(coords.lat, coords.lng);
        setLoading(false);
      });
    }
  }, []);

  const handleLocateMe = async () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPosition(coords);
          setUserLocation(coords);
          setAccuracy(pos.coords.accuracy || 0);
          onPositionChange(coords[0], coords[1]);
          setLoading(false);
          
          // Center map on new position
          if (mapRef.current) {
            mapRef.current.setView(coords, 16);
          }
        },
        () => {
          getCurrentLocation().then((coords) => {
            setPosition([coords.lat, coords.lng]);
            onPositionChange(coords.lat, coords.lng);
            setLoading(false);
          });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      const coords = await getCurrentLocation();
      setPosition([coords.lat, coords.lng]);
      onPositionChange(coords.lat, coords.lng);
      setLoading(false);
    }
  };

  const handleCenterOnMarker = () => {
    if (mapRef.current) {
      mapRef.current.setView(position, 16);
    }
  };

  const toggleMapType = () => {
    setMapType(prev => prev === 'street' ? 'satellite' : 'street');
  };

  const getNearbyReportMarker = (status: string) => {
    const colors: Record<string, string> = {
      'open': '#EF4444',
      'in-progress': '#F59E0B',
      'resolved': '#10B981',
      'rejected': '#6B7280'
    };
    
    const color = colors[status] || '#6B7280';
    
    return L.divIcon({
      className: 'nearby-report-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          opacity: 0.7;
        "></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-muted animate-pulse rounded-xl flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2 animate-bounce" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  const tileUrl = mapType === 'street'
    ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  const attribution = mapType === 'street'
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    : '&copy; <a href="https://www.esri.com/">Esri</a>';

  return (
    <div className="relative">
      {/* Map Container with increased height */}
      <MapContainer
        center={position}
        zoom={15}
        className="w-full h-[400px] rounded-xl z-0"
        style={{ minHeight: '400px' }}
        ref={mapRef}
      >
        <TileLayer
          attribution={attribution}
          url={tileUrl}
        />
        
        {/* Main draggable marker */}
        <DraggableMarker
          position={position}
          onPositionChange={(lat, lng) => {
            if (!readOnly) {
              setPosition([lat, lng]);
              onPositionChange(lat, lng);
            }
          }}
          readOnly={readOnly}
        />

        {/* Accuracy circle for user location */}
        {showAccuracyCircle && userLocation && accuracy > 0 && (
          <Circle
            center={userLocation}
            radius={accuracy}
            pathOptions={{
              fillColor: '#3B82F6',
              fillOpacity: 0.1,
              color: '#3B82F6',
              weight: 1,
              opacity: 0.3,
            }}
          />
        )}

        {/* User location marker (if different from main position) */}
        {userLocation && (userLocation[0] !== position[0] || userLocation[1] !== position[1]) && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>
              <div className="text-center p-2">
                <p className="font-semibold text-sm mb-1">Your Location</p>
                <p className="text-xs text-muted-foreground">
                  Accuracy: ±{Math.round(accuracy)}m
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Nearby reports */}
        {showNearby && nearbyReports.map((report, idx) => (
          <Marker
            key={idx}
            position={[report.latitude, report.longitude]}
            icon={getNearbyReportMarker(report.status)}
          >
            <Popup>
              <div className="text-center p-2">
                <p className="font-semibold text-sm mb-1">Existing Report</p>
                <p className="text-xs text-muted-foreground mb-2">
                  {report.ticketId}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {report.status}
                </Badge>
                <p className="text-xs text-amber-600 mt-2 font-medium">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  Report exists nearby
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Control buttons */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        {/* Locate me button */}
        <button
          onClick={handleLocateMe}
          disabled={loading || readOnly}
          className="bg-card p-3 rounded-full shadow-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50"
          title="Use my location"
        >
          <Navigation className={`w-5 h-5 text-primary ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Center on marker button */}
        <button
          onClick={handleCenterOnMarker}
          className="bg-card p-3 rounded-full shadow-lg border border-border hover:bg-secondary transition-colors"
          title="Center on marker"
        >
          <Crosshair className="w-5 h-5 text-primary" />
        </button>

        {/* Toggle map type */}
        <button
          onClick={toggleMapType}
          className="bg-card p-3 rounded-full shadow-lg border border-border hover:bg-secondary transition-colors"
          title={`Switch to ${mapType === 'street' ? 'satellite' : 'street'} view`}
        >
          {mapType === 'street' ? (
            <Eye className="w-5 h-5 text-primary" />
          ) : (
            <MapIcon className="w-5 h-5 text-primary" />
          )}
        </button>

        {/* Toggle nearby reports */}
        {nearbyReports.length > 0 && (
          <button
            onClick={() => setShowNearby(!showNearby)}
            className={`bg-card p-3 rounded-full shadow-lg border border-border hover:bg-secondary transition-colors ${
              !showNearby ? 'opacity-50' : ''
            }`}
            title={showNearby ? 'Hide nearby reports' : 'Show nearby reports'}
          >
            <AlertTriangle className={`w-5 h-5 ${showNearby ? 'text-amber-600' : 'text-muted-foreground'}`} />
          </button>
        )}
      </div>
      
      {/* Instructions card */}
      <div className="absolute top-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-border max-w-xs">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">
              {readOnly ? 'Location Locked' : 'Set Report Location'}
            </p>
            {!readOnly && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                • Drag the blue pin<br />
                • Tap/click on map<br />
                • Use locate button for GPS
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Accuracy indicator */}
      {accuracy > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-border">
          <p className="text-xs text-muted-foreground">
            GPS Accuracy: <span className={`font-semibold ${accuracy < 20 ? 'text-green-600' : accuracy < 50 ? 'text-amber-600' : 'text-red-600'}`}>
              ±{Math.round(accuracy)}m
            </span>
          </p>
        </div>
      )}

      {/* Coordinates display */}
      <div className="absolute top-4 right-4 z-[1000] bg-card/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md border border-border">
        <p className="text-xs font-mono text-muted-foreground">
          {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </p>
      </div>
    </div>
  );
};

export default DraggableMap;
