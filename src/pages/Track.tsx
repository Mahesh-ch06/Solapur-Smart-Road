import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft, MapPin, Clock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useReportStore, Report, ReportStatus } from '@/store/reportStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import ThemeToggle from '@/components/ThemeToggle';

const ticketSchema = z.string()
  .trim()
  .toUpperCase()
  .regex(/^SRP-\d{3}$/, { message: "Invalid ticket format. Use format: SRP-XXX" });

const Track = () => {
  const [ticketInput, setTicketInput] = useState('');
  const [searchedTicket, setSearchedTicket] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { getReportByTicketId } = useReportStore();

  const handleSearch = () => {
    setError(null);
    setReport(null);
    
    const result = ticketSchema.safeParse(ticketInput);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    // Simulate network delay for better UX
    setTimeout(() => {
      const found = getReportByTicketId(result.data);
      setSearchedTicket(result.data);
      if (found) {
        setReport(found);
      } else {
        setError('No report found with this Ticket ID');
      }
      setLoading(false);
    }, 500);
  };

  const getStatusConfig = (status: ReportStatus) => {
    switch (status) {
      case 'open':
        return {
          icon: AlertTriangle,
          label: 'Open',
          color: 'text-destructive',
          bg: 'bg-destructive/10',
          description: 'Your report has been received and is awaiting review.',
        };
      case 'in-progress':
        return {
          icon: Clock,
          label: 'In Progress',
          color: 'text-warning',
          bg: 'bg-warning/10',
          description: 'A repair team has been assigned and work is underway.',
        };
      case 'resolved':
        return {
          icon: CheckCircle,
          label: 'Resolved',
          color: 'text-success',
          bg: 'bg-success/10',
          description: 'The issue has been fixed. Thank you for your report!',
        };
    }
  };

  const getSeverityLabel = (severity: string) => {
    const config: Record<string, { label: string; class: string }> = {
      low: { label: 'Low', class: 'bg-muted text-muted-foreground' },
      medium: { label: 'Medium', class: 'bg-warning/10 text-warning' },
      high: { label: 'High', class: 'bg-destructive/10 text-destructive' },
    };
    return config[severity] || config.low;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Track Your Report</h1>
                <p className="text-sm text-muted-foreground">Enter your Ticket ID to check status</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Search Form */}
        <div className="card-elevated p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Find Your Report</h2>
          </div>
          
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Enter Ticket ID (e.g., SRP-101)"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 uppercase"
              maxLength={7}
            />
            <Button onClick={handleSearch} disabled={loading || !ticketInput.trim()}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="ml-2 hidden sm:inline">Search</span>
            </Button>
          </div>
          
          {error && (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          )}
        </div>

        {/* Report Details */}
        {report && (
          <div className="card-elevated overflow-hidden animate-fade-in">
            {/* Status Header */}
            {(() => {
              const statusConfig = getStatusConfig(report.status);
              const StatusIcon = statusConfig.icon;
              return (
                <div className={`${statusConfig.bg} p-6`}>
                  <div className="flex items-center gap-3 mb-2">
                    <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
                    <span className={`text-lg font-semibold ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{statusConfig.description}</p>
                </div>
              );
            })()}

            {/* Report Info */}
            <div className="p-6 space-y-6">
              {/* Ticket ID and Severity */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ticket ID</p>
                  <p className="text-xl font-bold text-foreground">{report.ticketId}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityLabel(report.severity).class}`}>
                  {getSeverityLabel(report.severity).label} Priority
                </span>
              </div>

              {/* Photo */}
              {report.photo && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Photo</p>
                  <img
                    src={report.photo}
                    alt="Reported issue"
                    className="w-full h-48 object-cover rounded-xl border border-border"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-foreground">{report.description}</p>
              </div>

              {/* Location */}
              {report.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="text-foreground">{report.address}</p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-3">Timeline</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Reported</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {report.status === 'in-progress' && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Work In Progress</p>
                        <p className="text-xs text-muted-foreground">Repair team assigned</p>
                      </div>
                    </div>
                  )}
                  
                  {report.resolvedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Resolved</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.resolvedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No report found state */}
        {searchedTicket && !report && !loading && !error && (
          <div className="card-elevated p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Report Not Found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find a report with ticket ID "{searchedTicket}"
            </p>
            <Link to="/report">
              <Button variant="outline">Submit a New Report</Button>
            </Link>
          </div>
        )}

        {/* Help text */}
        {!report && !searchedTicket && (
          <div className="text-center text-muted-foreground">
            <p className="mb-4">
              Don't have a Ticket ID?{' '}
              <Link to="/report" className="text-primary hover:underline">
                Submit a new report
              </Link>
            </p>
            <p className="text-sm">
              Your Ticket ID was provided when you submitted your report.
              <br />
              It looks like: <span className="font-mono font-semibold">SRP-XXX</span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Track;
