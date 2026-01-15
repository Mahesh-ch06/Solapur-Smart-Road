import { useReportStore } from '@/store/reportStore';
import MapView from '@/components/map/MapContainer';
import { toast } from 'sonner';

const AdminMapView = () => {
  const { reports, updateStatus } = useReportStore();

  const handleResolve = (id: string) => {
    updateStatus(id, 'resolved');
    toast.success('Report marked as resolved!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Map</h1>
          <p className="text-muted-foreground">View all reported issues on the map</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-sm text-muted-foreground">Open</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Resolved</span>
          </div>
        </div>
      </div>

      <div className="card-elevated p-0 overflow-hidden h-[calc(100vh-200px)]">
        <MapView
          reports={reports}
          zoom={13}
          onResolve={handleResolve}
          showPopups
        />
      </div>
    </div>
  );
};

export default AdminMapView;
