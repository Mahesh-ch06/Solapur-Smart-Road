import { useState, useEffect } from 'react';
import { useReportStore, Report, ReportStatus } from '@/store/reportStore';
import { logAction } from '@/store/auditStore';
import ReportComments from './ReportComments';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ChevronDown,
  MapPin,
  Eye,
  X,
  Mail,
  Send,
  Ban,
  CheckSquare,
  Square,
  Trash2
} from 'lucide-react';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

const AdminWorkOrders = () => {
  const { reports, updateStatus } = useReportStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('all');

  // Initialize EmailJS
  useEffect(() => {
    if (EMAILJS_PUBLIC_KEY) {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }
  }, []);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showCustomEmail, setShowCustomEmail] = useState(false);
  const [customEmailSubject, setCustomEmailSubject] = useState('');
  const [customEmailMessage, setCustomEmailMessage] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Priority sort and filter
  const filteredReports = [...reports]
    .filter((report) => {
      const matchesSearch =
        report.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || report.severity === severityFilter;
      return matchesSearch && matchesStatus && matchesSeverity;
    })
    .sort((a, b) => {
      // Move rejected reports to bottom
      if (a.status === 'rejected' && b.status !== 'rejected') return 1;
      if (a.status !== 'rejected' && b.status === 'rejected') return -1;
      
      // Sort by severity (high first), then by date
      const priority = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priority[b.severity] - priority[a.severity];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleStatusChange = async (id: string, newStatus: ReportStatus) => {
    const report = reports.find(r => r.id === id);
    await updateStatus(id, newStatus);
    
    // Log the action
    if (report) {
      logAction(
        'UPDATE_STATUS',
        `Changed status from ${report.status} to ${newStatus}`,
        report.id,
        report.ticketId
      );
    }
    
    // Custom messages based on status
    const messages = {
      'in-progress': 'Work started! User notified that their requested work has begun.',
      'resolved': 'Work completed! User notified that their reported work is done.',
    };
    
    toast.success(messages[newStatus] || `Status updated to ${newStatus.replace('-', ' ')}`);
  };

  const handleReject = async (report: Report) => {
    if (!report.userEmail) {
      toast.error('Cannot send rejection - no email address');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to reject ticket ${report.ticketId}? An email will be sent to the reporter.`);
    if (!confirmed) return;

    setSendingEmail(true);
    try {
      // Validate EmailJS configuration
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        throw new Error('EmailJS configuration is incomplete. Please check environment variables.');
      }

      // Update status in database first
      await updateStatus(report.id, 'rejected');
      
      // Log the rejection
      logAction(
        'REJECT_REPORT',
        `Rejected report with reason: Does not meet criteria`,
        report.id,
        report.ticketId
      );
      
      // Send rejection email
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: report.userEmail,
          to_name: 'Valued Citizen',
          subject: 'Report Update - Request Rejected',
          message: `Your report ${report.ticketId} has been reviewed and rejected. If you believe this is an error, please contact our support team.`,
          ticket_id: report.ticketId,
          status: 'rejected',
        }
      );
      
      toast.success('Report rejected and email sent to user');
      setSelectedReport(null);
    } catch (error) {
      console.error('Rejection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject report';
      toast.error(errorMessage);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendCustomEmail = async () => {
    if (!selectedReport?.userEmail) {
      toast.error('No email address available');
      return;
    }

    if (!customEmailSubject.trim() || !customEmailMessage.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    setSendingEmail(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: selectedReport.userEmail,
          to_name: 'Valued Citizen',
          subject: customEmailSubject,
          message: customEmailMessage,
          ticket_id: selectedReport.ticketId,
          status: selectedReport.status,
        }
      );
      
      // Log the custom email
      logAction(
        'SEND_CUSTOM_EMAIL',
        `Sent custom email with subject: "${customEmailSubject}"`,
        selectedReport.id,
        selectedReport.ticketId
      );
      
      toast.success('Custom email sent successfully');
      setShowCustomEmail(false);
      setCustomEmailSubject('');
      setCustomEmailMessage('');
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  // Bulk operations
  const toggleSelectReport = (id: string) => {
    const newSelected = new Set(selectedReports);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReports(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedReports.size === filteredReports.length) {
      setSelectedReports(new Set());
    } else {
      setSelectedReports(new Set(filteredReports.map(r => r.id)));
    }
  };

  const handleBulkStatusChange = async (newStatus: ReportStatus) => {
    if (selectedReports.size === 0) {
      toast.error('No reports selected');
      return;
    }

    const confirmed = window.confirm(`Update ${selectedReports.size} report(s) to ${newStatus.replace('-', ' ')}?`);
    if (!confirmed) return;

    try {
      const reportIds = Array.from(selectedReports);
      const selectedReportObjs = reports.filter(r => reportIds.includes(r.id));
      
      await Promise.all(
        reportIds.map(id => updateStatus(id, newStatus))
      );
      
      // Log bulk operation
      logAction(
        'BULK_STATUS_UPDATE',
        `Updated ${reportIds.length} reports to status: ${newStatus}`,
        undefined,
        selectedReportObjs.map(r => r.ticketId).join(', ')
      );
      
      toast.success(`${selectedReports.size} report(s) updated to ${newStatus.replace('-', ' ')}`);
      setSelectedReports(new Set());
      setShowBulkActions(false);
    } catch (error) {
      toast.error('Failed to update some reports');
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'open':
        return <span className="status-open"><AlertTriangle className="w-3 h-3" /> Open</span>;
      case 'in-progress':
        return <span className="status-progress"><Clock className="w-3 h-3" /> In Progress</span>;
      case 'resolved':
        return <span className="status-resolved"><CheckCircle className="w-3 h-3" /> Resolved</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive flex items-center gap-1 w-fit"><Ban className="w-3 h-3" /> Rejected</span>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      high: 'bg-destructive/10 text-destructive',
      medium: 'bg-warning/10 text-warning',
      low: 'bg-muted text-muted-foreground',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colors[severity as keyof typeof colors]}`}>
        {severity}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Work Orders</h1>
          <p className="text-muted-foreground">Manage and track repair assignments</p>
        </div>
        {selectedReports.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedReports.size} selected</span>
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Bulk Actions
            </button>
            <button
              onClick={() => setSelectedReports(new Set())}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions Panel */}
      {showBulkActions && selectedReports.size > 0 && (
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Bulk Actions:</span>
            <button
              onClick={() => handleBulkStatusChange('in-progress')}
              className="px-3 py-1.5 text-xs font-medium bg-warning/10 text-warning rounded-lg hover:bg-warning/20"
            >
              Mark as In Progress
            </button>
            <button
              onClick={() => handleBulkStatusChange('resolved')}
              className="px-3 py-1.5 text-xs font-medium bg-success/10 text-success rounded-lg hover:bg-success/20"
            >
              Mark as Resolved
            </button>
            <button
              onClick={() => {
                setSelectedReports(new Set());
                setShowBulkActions(false);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-secondary text-foreground rounded-lg hover:bg-secondary/80 ml-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ticket ID or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReportStatus | 'all')}
              className="input-field pr-10 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="input-field pr-10 appearance-none cursor-pointer"
            >
              <option value="all">All Severity</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 font-medium text-muted-foreground w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="text-muted-foreground hover:text-foreground"
                    title={selectedReports.size === filteredReports.length ? 'Deselect All' : 'Select All'}
                  >
                    {selectedReports.size === filteredReports.length ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </th>
                <th className="text-left p-4 font-medium text-muted-foreground">Ticket ID</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Location</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Severity</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No reports found
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <button
                        onClick={() => toggleSelectReport(report.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {selectedReports.has(report.id) ? (
                          <CheckSquare className="w-5 h-5 text-primary" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{report.ticketId}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 md:hidden">
                          {report.description}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-xs">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate" title={report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}>
                          {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">{getSeverityBadge(report.severity)}</td>
                    <td className="p-4">{getStatusBadge(report.status)}</td>
                    <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {report.userEmail && (
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowCustomEmail(true);
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-500/20 transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        {report.status !== 'resolved' && report.status !== 'rejected' && (
                          <>
                            {report.status === 'open' && (
                              <button
                                onClick={() => handleStatusChange(report.id, 'in-progress')}
                                className="px-3 py-1.5 text-xs font-medium bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-colors"
                              >
                                Start
                              </button>
                            )}
                            <button
                              onClick={() => handleStatusChange(report.id, 'resolved')}
                              className="px-3 py-1.5 text-xs font-medium bg-success/10 text-success rounded-lg hover:bg-success/20 transition-colors"
                            >
                              Resolve
                            </button>
                            {report.status === 'open' && (
                              <button
                                onClick={() => handleReject(report)}
                                disabled={!report.userEmail || sendingEmail}
                                className="px-3 py-1.5 text-xs font-medium bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground text-center">
        Showing {filteredReports.length} of {reports.length} reports
      </p>

      {/* Quick View Modal */}
      {selectedReport && !showCustomEmail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedReport(null)}>
          <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-background border-b border-border p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold">Report Details</h2>
              <button onClick={() => setSelectedReport(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ticket ID</p>
                  <p className="font-semibold">{selectedReport.ticketId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Severity</p>
                  <div className="mt-1">{getSeverityBadge(selectedReport.severity)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedReport.userEmail && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedReport.userEmail}</p>
                </div>
              )}

              {selectedReport.userPhone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedReport.userPhone}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                {selectedReport.address ? (
                  <>
                    <p className="font-medium">{selectedReport.address}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                    </p>
                  </>
                ) : (
                  <p className="font-medium">
                    {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{selectedReport.description}</p>
              </div>

              {selectedReport.photoUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Photo Evidence</p>
                  <img 
                    src={selectedReport.photoUrl} 
                    alt="Report evidence" 
                    className="rounded-lg max-h-96 w-full object-contain border border-border"
                  />
                </div>
              )}
              
              {/* Comments Section */}
              <div className="border-t pt-4">
                <ReportComments reportId={selectedReport.id} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Email Modal */}
      {showCustomEmail && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCustomEmail(false)}>
          <div className="bg-background rounded-lg shadow-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-border p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold">Send Custom Email</h2>
              <button onClick={() => setShowCustomEmail(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">To</p>
                <p className="font-medium">{selectedReport.userEmail}</p>
                <p className="text-xs text-muted-foreground">Ticket: {selectedReport.ticketId}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Subject</label>
                <input
                  type="text"
                  value={customEmailSubject}
                  onChange={(e) => setCustomEmailSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="input-field mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Message</label>
                <textarea
                  value={customEmailMessage}
                  onChange={(e) => setCustomEmailMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={6}
                  className="input-field mt-1 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCustomEmail(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendCustomEmail}
                  disabled={sendingEmail || !customEmailSubject.trim() || !customEmailMessage.trim()}
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {sendingEmail ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWorkOrders;
