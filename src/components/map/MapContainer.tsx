import { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Report, ReportStatus } from '@/store/reportStore';
import { MapPin, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

// Fix for default marker icons in Leaflet
const createCustomIcon = (status: ReportStatus) => {
  const colors = {
    open: '#DC2626',
    'in-progress': '#EAB308',
    resolved: '#16A34A',
  };

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${colors[status]};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          font-weight: bold;
        ">!</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Draggable marker icon
export const draggableIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      background-color: #2563EB;
      width: 40px;
      height: 40px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s ease-in-out infinite;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 16px;
        font-weight: bold;
      ">📍</div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface MapViewProps {
  reports: Report[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (report: Report) => void;
  onResolve?: (id: string) => void;
  showPopups?: boolean;
}

// Map recenter component
const RecenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const MapView = ({
  reports,
  center = [17.6599, 75.9064],
  zoom = 13,
  onMarkerClick,
  onResolve,
  showPopups = true,
}: MapViewProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-muted animate-pulse rounded-xl flex items-center justify-center">
        <MapPin className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  const getSeverityLabel = (severity: string) => {
    const labels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    };
    return labels[severity as keyof typeof labels] || severity;
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  return (
    <LeafletMap
      center={center}
      zoom={zoom}
      className="w-full h-full rounded-xl"
      style={{ minHeight: '300px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap center={center} />
      
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={createCustomIcon(report.status)}
          eventHandlers={{
            click: () => onMarkerClick?.(report),
          }}
        >
          {showPopups && (
            <Popup>
              <div className="p-3 min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-foreground">
                    {report.ticketId}
                  </span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(report.status)}
                    <span className="text-xs capitalize">{report.status.replace('-', ' ')}</span>
                  </div>
                </div>
                
                {report.photo && (
                  <img
                    src={report.photo}
                    alt="Pothole"
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                )}
                
                {report.address && (
                  <div className="flex items-start gap-2 mb-2 p-2 bg-secondary/50 rounded">
                    <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground leading-tight">
                      {report.address}
                    </p>
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {report.description}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    report.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                    report.severity === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {getSeverityLabel(report.severity)}
                  </span>
                  
                  {report.status !== 'resolved' && onResolve && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolve(report.id);
                      }}
                      className="px-3 py-1 bg-success text-success-foreground rounded-full text-xs font-medium hover:bg-success/90 transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </LeafletMap>
  );
};

export default MapView;
