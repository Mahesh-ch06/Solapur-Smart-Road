import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon, divIcon, point } from 'leaflet';
import { useReportStore, Report } from '@/store/reportStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navigation, MapPin, AlertTriangle, CheckCircle, Clock, XCircle, Filter, Layers } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Custom markers for different statuses and severities
const createCustomIcon = (status: string, severity: string) => {
  const colors: Record<string, string> = {
    open: '#ef4444',
    'in-progress': '#f59e0b',
    resolved: '#10b981',
    rejected: '#6b7280'
  };
  
  const severitySize: Record<string, number> = {
    low: 25,
    medium: 30,
    high: 35
  };

  return divIcon({
    html: `
      <div style="
        background-color: ${colors[status]};
        width: ${severitySize[severity]}px;
        height: ${severitySize[severity]}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ${severity[0].toUpperCase()}
      </div>
    `,
    className: '',
    iconSize: [severitySize[severity], severitySize[severity]],
    iconAnchor: [severitySize[severity] / 2, severitySize[severity] / 2]
  });
};

// Component to handle map centering
const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

// Component to handle geolocation
const LocationMarker = ({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: false, maxZoom: 16 });
    
    map.on('locationfound', (e) => {
      setPosition([e.latitude, e.longitude]);
      onLocationFound(e.latitude, e.longitude);
    });

    return () => {
      map.off('locationfound');
    };
  }, [map, onLocationFound]);

  return position === null ? null : (
    <Circle
      center={position}
      radius={200}
      pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2 }}
    />
  );
};

const EnhancedAdminMap = () => {
  const { reports } = useReportStore();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [center, setCenter] = useState<[number, number]>([17.6599, 75.9064]); // Solapur coordinates
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showClusters, setShowClusters] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Filter reports based on status and severity
  const filteredReports = reports.filter(report => {
    const statusMatch = filterStatus === 'all' || report.status === filterStatus;
    const severityMatch = filterSeverity === 'all' || report.severity === filterSeverity;
    return statusMatch && severityMatch;
  });

  // Get directions to a report
  const getDirections = (lat: number, lng: number) => {
    if (userLocation) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${lat},${lng}`,
        '_blank'
      );
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
    }
  };

  // Locate user
  const locateUser = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userPos);
          setCenter(userPos);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      case 'rejected': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] relative">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="font-semibold text-sm">Filters</span>
        </div>
        
        {/* Status Filter */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Severity</label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="w-full text-sm border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Toggle Clustering */}
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-600 dark:text-gray-400">Clustering</label>
          <input
            type="checkbox"
            checked={showClusters}
            onChange={(e) => setShowClusters(e.target.checked)}
            className="rounded"
          />
        </div>

        {/* Locate User Button */}
        <Button
          onClick={locateUser}
          size="sm"
          variant="outline"
          className="w-full"
        >
          <Navigation className="w-4 h-4 mr-2" />
          My Location
        </Button>

        {/* Report Count */}
        <div className="pt-2 border-t dark:border-gray-600">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Showing {filteredReports.length} of {reports.length} reports
          </div>
        </div>
      </div>

      {/* Map Stats */}
      <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span className="font-semibold text-sm">Legend</span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Open</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Resolved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>Rejected</span>
          </div>
        </div>
        <div className="pt-2 border-t dark:border-gray-600 space-y-1 text-xs">
          <div>S: Small (Low)</div>
          <div>M: Medium</div>
          <div>L: Large (High)</div>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full rounded-lg"
        scrollWheelZoom={true}
      >
        <MapController center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location Marker */}
        {userLocation && (
          <LocationMarker onLocationFound={(lat, lng) => setUserLocation([lat, lng])} />
        )}

        {/* Report Markers with Clustering */}
        {showClusters ? (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            zoomToBoundsOnClick={true}
            iconCreateFunction={(cluster) => {
              const count = cluster.getChildCount();
              return divIcon({
                html: `<div style="
                  background-color: #3b82f6;
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 14px;
                ">${count}</div>`,
                className: '',
                iconSize: [40, 40]
              });
            }}
          >
            {filteredReports.map((report) => (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={createCustomIcon(report.status, report.severity)}
                eventHandlers={{
                  click: () => setSelectedReport(report),
                }}
              >
                <Popup maxWidth={300}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{report.ticketId}</h3>
                      <Badge variant={getStatusColor(report.status) as any}>
                        {report.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{report.severity}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {report.address && (
                      <p className="text-sm text-gray-600">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {report.address}
                      </p>
                    )}

                    <p className="text-sm">{report.description}</p>

                    {report.photo && (
                      <img 
                        src={report.photo} 
                        alt="Report" 
                        className="w-full h-32 object-cover rounded"
                      />
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => getDirections(report.latitude, report.longitude)}
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Directions
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://www.google.com/maps/@${report.latitude},${report.longitude},18z`, '_blank')}
                      >
                        Street View
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        ) : (
          // Render without clustering
          filteredReports.map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={createCustomIcon(report.status, report.severity)}
              eventHandlers={{
                click: () => setSelectedReport(report),
              }}
            >
              <Popup maxWidth={300}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{report.ticketId}</h3>
                    <Badge variant={getStatusColor(report.status) as any}>
                      {report.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{report.severity}</Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {report.address && (
                    <p className="text-sm text-gray-600">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {report.address}
                    </p>
                  )}

                  <p className="text-sm">{report.description}</p>

                  {report.photo && (
                    <img 
                      src={report.photo} 
                      alt="Report" 
                      className="w-full h-32 object-cover rounded"
                    />
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => getDirections(report.latitude, report.longitude)}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Directions
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`https://www.google.com/maps/@${report.latitude},${report.longitude},18z`, '_blank')}
                    >
                      Street View
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>
    </div>
  );
};

export default EnhancedAdminMap;
