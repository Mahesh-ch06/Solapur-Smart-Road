import { useReportStore } from '@/store/reportStore';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Map,
  Download,
  Calendar,
  BarChart3,
  Activity,
  Timer,
  MapPin,
  Zap,
  Ban
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';

const AdminDashboard = () => {
  const { reports, getStats } = useReportStore();
  const stats = getStats();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  // Filter reports by date range
  const filteredReports = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return reports.filter(report => {
      const reportDate = new Date(report.createdAt);
      
      switch (dateRange) {
        case 'today':
          return reportDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return reportDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return reportDate >= monthAgo;
        default:
          return true;
      }
    });
  }, [reports, dateRange]);

  // Calculate advanced statistics
  const advancedStats = useMemo(() => {
    const resolved = filteredReports.filter(r => r.status === 'resolved');
    const inProgress = filteredReports.filter(r => r.status === 'in-progress');
    const rejected = filteredReports.filter(r => r.status === 'rejected');
    
    // Calculate average resolution time
    const resolvedWithTime = resolved.filter(r => r.resolvedAt);
    const totalResolutionTime = resolvedWithTime.reduce((acc, report) => {
      const created = new Date(report.createdAt).getTime();
      const resolved = new Date(report.resolvedAt!).getTime();
      return acc + (resolved - created);
    }, 0);
    
    const avgResolutionHours = resolvedWithTime.length > 0 
      ? Math.round(totalResolutionTime / resolvedWithTime.length / (1000 * 60 * 60))
      : 0;
    
    // Completion rate
    const completionRate = filteredReports.length > 0
      ? Math.round((resolved.length / filteredReports.length) * 100)
      : 0;
    
    // Severity breakdown
    const severityCount = {
      high: filteredReports.filter(r => r.severity === 'high').length,
      medium: filteredReports.filter(r => r.severity === 'medium').length,
      low: filteredReports.filter(r => r.severity === 'low').length,
    };
    
    return {
      avgResolutionHours,
      completionRate,
      severityCount,
      rejectedCount: rejected.length,
      activeCount: inProgress.length,
    };
  }, [filteredReports]);

  // Get recent reports
  const recentReports = [...filteredReports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Priority sorted (high first)
  const prioritySorted = [...filteredReports]
    .filter((r) => r.status !== 'resolved' && r.status !== 'rejected')
    .sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      return priority[b.severity] - priority[a.severity];
    })
    .slice(0, 5);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Ticket ID', 'Status', 'Severity', 'Description', 'Location', 'Email', 'Phone', 'Created At', 'Resolved At'];
    const csvData = filteredReports.map(report => [
      report.ticketId,
      report.status,
      report.severity,
      report.description.replace(/,/g, ';'),
      report.address || `${report.latitude},${report.longitude}`,
      report.userEmail || '',
      report.userPhone || '',
      new Date(report.createdAt).toLocaleString(),
      report.resolvedAt ? new Date(report.resolvedAt).toLocaleString() : '',
    ]);
    
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `road-reports-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statCards = [
    {
      label: 'Total Reports',
      value: filteredReports.length,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: `${reports.length} all-time`,
    },
    {
      label: 'Open Issues',
      value: filteredReports.filter(r => r.status === 'open').length,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      trend: advancedStats.severityCount.high > 0 ? `${advancedStats.severityCount.high} high priority` : 'No high priority',
    },
    {
      label: 'In Progress',
      value: advancedStats.activeCount,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      trend: `${advancedStats.avgResolutionHours}h avg resolution`,
    },
    {
      label: 'Resolved',
      value: filteredReports.filter(r => r.status === 'resolved').length,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
      trend: `${advancedStats.completionRate}% completion rate`,
    },
    {
      label: 'Rejected',
      value: advancedStats.rejectedCount,
      icon: Ban,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      trend: 'Declined requests',
    },
    {
      label: 'Response Time',
      value: `${advancedStats.avgResolutionHours}h`,
      icon: Timer,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: 'Average resolution',
    },
    {
      label: 'High Severity',
      value: advancedStats.severityCount.high,
      icon: Zap,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: `${advancedStats.severityCount.medium} medium, ${advancedStats.severityCount.low} low`,
    },
    {
      label: 'Performance',
      value: `${advancedStats.completionRate}%`,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: 'Completion rate',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-background p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Operations</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Command Center</h1>
            <p className="text-sm text-muted-foreground">Monitor reports, unblock crews, and keep SLAs on track.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['today','week','month','all'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as any)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${dateRange === range ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:bg-secondary'}`}
              >
                {range === 'today' ? 'Today' : range === 'week' ? 'Last 7 days' : range === 'month' ? 'Last 30 days' : 'All time'}
              </button>
            ))}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary text-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <Link
              to="/admin/map"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
            >
              <Map className="w-4 h-4" />
              Live Map
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="rounded-xl border border-white/10 bg-white/50 dark:bg-white/5 p-3">
            <p className="text-xs text-muted-foreground">Open</p>
            <p className="text-xl font-semibold text-foreground">{filteredReports.filter(r => r.status === 'open').length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/50 dark:bg-white/5 p-3">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-xl font-semibold text-foreground">{advancedStats.activeCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/50 dark:bg-white/5 p-3">
            <p className="text-xs text-muted-foreground">Resolved</p>
            <p className="text-xl font-semibold text-foreground">{filteredReports.filter(r => r.status === 'resolved').length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/50 dark:bg-white/5 p-3">
            <p className="text-xs text-muted-foreground">Avg Resolution</p>
            <p className="text-xl font-semibold text-foreground">{advancedStats.avgResolutionHours}h</p>
          </div>
        </div>
      </div>

      {/* Stats Grid - 4 columns on large screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className="card-elevated animate-fade-in hover:shadow-lg transition-shadow min-h-[140px]"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.trend}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Severity Distribution Chart */}
      <div className="card-elevated">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Severity Distribution</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: 'High Priority', count: advancedStats.severityCount.high, color: 'bg-red-500', total: filteredReports.length },
            { label: 'Medium Priority', count: advancedStats.severityCount.medium, color: 'bg-yellow-500', total: filteredReports.length },
            { label: 'Low Priority', count: advancedStats.severityCount.low, color: 'bg-green-500', total: filteredReports.length },
          ].map(item => {
            const percentage = item.total > 0 ? (item.count / item.total) * 100 : 0;
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className="text-sm text-muted-foreground">{item.count} ({percentage.toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Overview Chart */}
        <div className="card-elevated">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Status Overview</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Open', count: filteredReports.filter(r => r.status === 'open').length, color: 'bg-blue-500' },
              { label: 'In Progress', count: advancedStats.activeCount, color: 'bg-yellow-500' },
              { label: 'Resolved', count: filteredReports.filter(r => r.status === 'resolved').length, color: 'bg-green-500' },
              { label: 'Rejected', count: advancedStats.rejectedCount, color: 'bg-gray-500' },
            ].map(item => {
              const percentage = filteredReports.length > 0 ? (item.count / filteredReports.length) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className="text-sm text-muted-foreground">{item.count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Priority Issues */}
        <div className="card-elevated">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="text-lg font-semibold text-foreground">Priority Issues</h2>
          </div>
          <div className="space-y-3">
            {prioritySorted.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No pending issues</p>
            ) : (
              prioritySorted.map((report) => (
                <Link
                  key={report.id}
                  to="/admin/orders"
                  className="block p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground">{report.ticketId}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            report.severity === 'high'
                              ? 'bg-destructive/10 text-destructive'
                              : report.severity === 'medium'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {report.severity}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {report.description}
                      </p>
                      {report.address && (
                        <p className="text-[11px] text-muted-foreground/80 truncate mt-1">{report.address}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                        report.status === 'open'
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'bg-yellow-500/10 text-yellow-600'
                      }`}
                    >
                      {report.status === 'in-progress' ? 'In Progress' : 'Open'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-elevated">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent reports</p>
            ) : (
              recentReports.map((report) => (
                <Link
                  key={report.id}
                  to="/admin/orders"
                  className="block p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground">{report.ticketId}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {report.description}
                      </p>
                      {report.address && (
                        <p className="text-[11px] text-muted-foreground/80 truncate mt-1">{report.address}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                        report.status === 'open'
                          ? 'bg-blue-500/10 text-blue-600'
                          : report.status === 'in-progress'
                          ? 'bg-yellow-500/10 text-yellow-600'
                          : report.status === 'resolved'
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-gray-500/10 text-gray-600'
                      }`}
                    >
                      {report.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="card-elevated">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-success" />
            <h2 className="text-lg font-semibold text-foreground">Performance Metrics</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Completion Rate</p>
                  <p className="text-xs text-muted-foreground">Resolved vs Total</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{advancedStats.completionRate}%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Timer className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Avg. Resolution Time</p>
                  <p className="text-xs text-muted-foreground">Hours to complete</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{advancedStats.avgResolutionHours}h</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Activity className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Active Work Orders</p>
                  <p className="text-xs text-muted-foreground">Currently in progress</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{advancedStats.activeCount}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-elevated">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/orders"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-center"
            >
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">All Reports</span>
            </Link>
            <Link
              to="/admin/map"
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-center"
            >
              <MapPin className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Heat Map</span>
            </Link>
            <button
              onClick={() => setDateRange('today')}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-center"
            >
              <Calendar className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Today's Reports</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-center"
            >
              <Download className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Export Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
