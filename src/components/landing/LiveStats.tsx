import { useReportStore } from '@/store/reportStore';
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const LiveStats = () => {
  const getStats = useReportStore((state) => state.getStats);
  const stats = getStats();

  const statItems = [
    {
      label: 'Total Reports',
      value: stats.total,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Fixed Today',
      value: stats.fixedToday,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Open Issues',
      value: stats.open,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <section className="py-12 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Live Statistics
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {statItems.map((item, index) => (
            <div
              key={item.label}
              className="stat-card text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex p-3 rounded-xl ${item.bgColor} mb-3`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {item.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveStats;
