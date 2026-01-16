import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useReportStore, Report } from '@/store/reportStore';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  Calendar,
  Filter,
  Download,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/ThemeToggle';
import { toast } from 'sonner';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { reports, loadReports, deleteReport } = useReportStore();
  const [userEmail, setUserEmail] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  // Get user's reports
  const userReports = reports.filter(report => 
    report.userEmail?.toLowerCase() === userEmail.toLowerCase()
  );

  // Filter reports
  const filteredReports = userReports.filter(report => {
    const statusMatch = filterStatus === 'all' || report.status === filterStatus;
    const searchMatch = searchQuery === '' || 
      report.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const handleLogin = () => {
    if (!emailInput.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const userReportsCount = reports.filter(
      r => r.userEmail?.toLowerCase() === emailInput.toLowerCase()
    ).length;

    if (userReportsCount === 0) {
      toast.error('No reports found for this email address');
      return;
    }

    setUserEmail(emailInput);
    toast.success(`Found ${userReportsCount} report(s)`);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadReports();
    setLoading(false);
    toast.success('Reports refreshed');
  };

  const handleExport = () => {
    const csvData = filteredReports.map(report => ({
      'Ticket ID': report.ticketId,
      'Status': report.status,
      'Severity': report.severity,
      'Description': report.description.replace(/,/g, ';'),
      'Location': report.address || `${report.latitude}, ${report.longitude}`,
      'Reported Date': new Date(report.createdAt).toLocaleDateString(),
      'Resolved Date': report.resolvedAt ? new Date(report.resolvedAt).toLocaleDateString() : 'N/A',
    }));

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Reports exported successfully');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-600';
      case 'in-progress': return 'bg-yellow-500/10 text-yellow-600';
      case 'resolved': return 'bg-green-500/10 text-green-600';
      case 'rejected': return 'bg-red-500/10 text-red-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const stats = {
    total: userReports.length,
    open: userReports.filter(r => r.status === 'open').length,
    inProgress: userReports.filter(r => r.status === 'in-progress').length,
    resolved: userReports.filter(r => r.status === 'resolved').length,
  };

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="card-elevated p-8 shadow-lg">
            <div className="text-center mb-6 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">Secure lookup</p>
              <h1 className="text-2xl font-bold text-foreground">My Reports Dashboard</h1>
              <p className="text-muted-foreground text-sm">Enter the email you used while submitting. We will show all matching reports instantly.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="you@example.com"
                  className="w-full h-11"
                />
              </div>

              <Button onClick={handleLogin} className="w-full h-11" disabled={loading}>
                {loading ? 'Checking…' : 'View My Reports'}
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 bg-secondary/70 border border-border rounded-xl px-3 py-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>Must match submission email</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/70 border border-border rounded-xl px-3 py-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  <span>No OTP needed</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
              <Link to="/" className="text-primary hover:underline flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <Link to="/report" className="hover:underline">Need to file a new report?</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Header */}
      <header className="bg-card/90 backdrop-blur border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold">My reports</p>
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Signed in as {userEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setUserEmail('')}
              >
                Change Email
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-elevated p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border">
            <div className="flex items-center gap-2 mb-1 text-primary">
              <FileText className="w-4 h-4" />
              <p className="text-xs">Total</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="card-elevated p-4 bg-gradient-to-br from-blue-500/10 via-background to-background border border-border">
            <div className="flex items-center gap-2 mb-1 text-blue-600">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-xs">Open</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
          </div>
          <div className="card-elevated p-4 bg-gradient-to-br from-yellow-500/10 via-background to-background border border-border">
            <div className="flex items-center gap-2 mb-1 text-yellow-600">
              <Clock className="w-4 h-4" />
              <p className="text-xs">In Progress</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          </div>
          <div className="card-elevated p-4 bg-gradient-to-br from-green-500/10 via-background to-background border border-border">
            <div className="flex items-center gap-2 mb-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <p className="text-xs">Resolved</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="card-elevated p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ticket ID or description..."
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm h-11"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading} className="h-11">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              {filteredReports.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleExport} className="h-11">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Tip: Filters and search work together. Clear search to see all reports.</p>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Reports Found</h3>
            <p className="text-muted-foreground mb-6">
              {userReports.length === 0 
                ? "You haven't submitted any reports yet."
                : "No reports match your current filters."}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/report">
                <Button>Submit a New Report</Button>
              </Link>
              <Button variant="outline" onClick={() => {setFilterStatus('all'); setSearchQuery('');}}>
                Reset Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="card-elevated p-6 hover:shadow-lg transition-all border border-border/80">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-foreground">{report.ticketId}</h3>
                      <Badge variant={getSeverityColor(report.severity) as any}>
                        {report.severity}
                      </Badge>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {getStatusIcon(report.status)}
                        {report.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{report.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {report.address || `${report.latitude}, ${report.longitude}`}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                      {report.resolvedAt && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Resolved: {new Date(report.resolvedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/track?ticket=${report.ticketId}`)}>
                      <Search className="w-4 h-4 mr-2" />
                      Track
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/report">
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Submit New Report
            </Button>
          </Link>
          <Link to="/track">
            <Button variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Track by Ticket ID
            </Button>
          </Link>
        </div>
      </main>

      {/* Report Details Modal */}
      {selectedReport && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div 
            className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">{selectedReport.ticketId}</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={getSeverityColor(selectedReport.severity) as any}>
                    {selectedReport.severity} severity
                  </Badge>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReport.status)}`}>
                    {getStatusIcon(selectedReport.status)}
                    {selectedReport.status.replace('-', ' ')}
                  </span>
                </div>

                {selectedReport.photo && (
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img 
                      src={selectedReport.photo} 
                      alt="Report" 
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Location</h3>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span>{selectedReport.address || `${selectedReport.latitude}, ${selectedReport.longitude}`}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2">Reported</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedReport.resolvedAt && (
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-2">Resolved</h3>
                      <p className="text-sm text-green-600">
                        {new Date(selectedReport.resolvedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {selectedReport.userEmail && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2">Contact</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedReport.userEmail}
                      </div>
                      {selectedReport.userPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {selectedReport.userPhone}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
