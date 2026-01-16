import { useReportStore } from '@/store/reportStore';
import { FileText, CheckCircle, Clock, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

const LiveStats = () => {
  const reports = useReportStore((state) => state.reports);
  const getStats = useReportStore((state) => state.getStats);
  const stats = getStats();

  // Calculate additional statistics
  const additionalStats = useMemo(() => {
    const uniqueUsers = new Set(reports.filter(r => r.userEmail).map(r => r.userEmail)).size;
    const resolvedReports = reports.filter(r => r.status === 'resolved');
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentResolved = resolvedReports.filter(
      r => r.resolvedAt && new Date(r.resolvedAt) >= last30Days
    ).length;

    return {
      activeUsers: uniqueUsers,
      resolvedThisMonth: recentResolved,
      totalResolved: resolvedReports.length
    };
  }, [reports]);

  const statItems = [
    {
      label: 'Total Reports',
      value: stats.total,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      subtext: 'All time'
    },
    {
      label: 'Resolved',
      value: additionalStats.totalResolved,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
      subtext: `${additionalStats.resolvedThisMonth} this month`
    },
    {
      label: 'Active Users',
      value: additionalStats.activeUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
      subtext: 'Contributors'
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      subtext: 'Being fixed'
    },
  ];

  return (
    <section className="py-8 sm:py-12 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Live Statistics
          </span>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {statItems.map((item, index) => (
            <div
              key={item.label}
              className="stat-card text-center animate-fade-in group hover:scale-105 transition-transform p-3 sm:p-4"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex p-2 sm:p-3 rounded-xl ${item.bgColor} mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">
                {item.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                {item.label}
              </div>
              {item.subtext && (
                <div className="text-xs text-muted-foreground/70 mt-0.5 sm:mt-1 leading-tight">
                  {item.subtext}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Community Impact Message */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto px-4">
            Together, we've made Solapur roads safer for everyone. Thank you for being part of the change! 🙏
          </p>
        </div>
      </div>
    </section>
  );
};

export default LiveStats;
