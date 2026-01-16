import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft, MapPin, Clock, AlertTriangle, CheckCircle, Loader2, Share2, Download, Star, Copy, Check, Printer } from 'lucide-react';
import { useReportStore, Report, ReportStatus } from '@/store/reportStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { toast } from 'sonner';
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
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
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

  const handleShare = async () => {
    if (!report) return;

    const shareData = {
      title: `Road Issue Report - ${report.ticketId}`,
      text: `Track my road issue report: ${report.ticketId}\nStatus: ${report.status}\nLocation: ${report.address || 'View on map'}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      // User cancelled or error occurred
    }
  };

  const handleCopyTicketId = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report.ticketId);
    setCopied(true);
    toast.success('Ticket ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!report) return;
    
    // Create a printable version
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Report ${report.ticketId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .status { display: inline-block; padding: 5px 10px; border-radius: 5px; font-weight: bold; }
            .status.open { background: #fee; color: #c00; }
            .status.in-progress { background: #ffc; color: #c60; }
            .status.resolved { background: #efe; color: #060; }
            img { max-width: 100%; height: auto; margin: 10px 0; }
            .detail { margin: 10px 0; }
            .label { font-weight: bold; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Road Issue Report</h1>
            <p>Solapur Municipal Corporation</p>
          </div>
          <div class="detail">
            <span class="label">Ticket ID:</span> ${report.ticketId}
          </div>
          <div class="detail">
            <span class="label">Status:</span> 
            <span class="status ${report.status}">${report.status.toUpperCase()}</span>
          </div>
          <div class="detail">
            <span class="label">Severity:</span> ${report.severity.toUpperCase()}
          </div>
          <div class="detail">
            <span class="label">Description:</span><br>${report.description}
          </div>
          <div class="detail">
            <span class="label">Location:</span><br>${report.address || `${report.latitude}, ${report.longitude}`}
          </div>
          <div class="detail">
            <span class="label">Reported Date:</span> ${new Date(report.createdAt).toLocaleString()}
          </div>
          ${report.resolvedAt ? `
            <div class="detail">
              <span class="label">Resolved Date:</span> ${new Date(report.resolvedAt).toLocaleString()}
            </div>
          ` : ''}
          ${report.photo ? `
            <div class="detail">
              <span class="label">Photo:</span><br>
              <img src="${report.photo}" alt="Report photo" />
            </div>
          ` : ''}
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
    toast.success('Report ready to download as PDF!');
  };

  const handleRating = (stars: number) => {
    if (!report || report.status !== 'resolved') return;
    setRating(stars);
    setHasRated(true);
    toast.success(`Thank you for rating! You gave ${stars} stars.`);
    // In a real app, you'd save this to the database
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Link to="/" className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0 touch-manipulation">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">Track Your Report</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden xs:block">Enter your Ticket ID to check status</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-3xl">
        {/* Guide Strip */}
        <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Track status</p>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Find your report in seconds</h2>
            <p className="text-sm text-muted-foreground">Use your ticket ID (SRP-XXX). Lost it? Ask the chatbot with your email.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-secondary/70 border border-border rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-primary" />
              <span>Ticket ID</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/70 border border-border rounded-xl px-3 py-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Location in view</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/70 border border-border rounded-xl px-3 py-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Live updates</span>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="card-elevated p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h2 className="text-sm sm:text-base font-semibold text-foreground">Find Your Report</h2>
          </div>
          
          <div className="flex gap-2 sm:gap-3 flex-col sm:flex-row">
            <Input
              type="text"
              placeholder="e.g., SRP-101"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 uppercase text-base h-11 sm:h-10"
              maxLength={7}
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading || !ticketInput.trim()}
              className="px-3 sm:px-4 h-11 sm:h-10 touch-manipulation"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="ml-2 hidden sm:inline">Search</span>
            </Button>
          </div>
          
          {error && (
            <p className="mt-3 text-xs sm:text-sm text-destructive">{error}</p>
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
              {/* Ticket ID with Action Buttons */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Ticket ID</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-foreground">{report.ticketId}</p>
                    <button
                      onClick={handleCopyTicketId}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      title="Copy Ticket ID"
                    >
                      {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    title="Share Report"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    title="Print Report"
                  >
                    <Printer className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPDF}
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Severity */}
              <div className="flex items-center justify-between">
                <div></div>
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

              {/* Feedback Rating - Only for Resolved Reports */}
              {report.status === 'resolved' && (
                <div className="border-t border-border pt-6">
                  <p className="text-sm font-medium text-foreground mb-3">
                    How satisfied are you with the resolution?
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(star)}
                        className={`transition-all ${
                          star <= rating ? 'text-yellow-500' : 'text-gray-300'
                        } hover:scale-110`}
                        disabled={hasRated}
                      >
                        <Star
                          className="w-8 h-8"
                          fill={star <= rating ? 'currentColor' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                  {hasRated && (
                    <p className="text-xs text-success mt-2">
                      ✓ Thank you for your feedback!
                    </p>
                  )}
                </div>
              )}
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
