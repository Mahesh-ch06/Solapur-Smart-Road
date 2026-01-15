import AdminLayout from '@/components/admin/AdminLayout';
import { useAuditStore, AuditLog } from '@/store/auditStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Calendar, 
  User, 
  Activity,
  Download,
  Trash2,
  Filter,
  Eye,
  X,
  Mail
} from 'lucide-react';

const AdminAuditLogs = () => {
  const { logs, clearOldLogs, loadLogs, loading } = useAuditStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [viewingEmail, setViewingEmail] = useState<AuditLog | null>(null);

  // Load logs from database on mount
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ticketId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    
    return matchesSearch && matchesAction;
  });

  // Get unique actions for filter
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  // Export logs to CSV
  const exportLogs = () => {
    const headers = ['Timestamp', 'Admin', 'Action', 'Ticket ID', 'Details', 'IP Address'];
    const rows = filteredLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.adminEmail,
      log.action,
      log.ticketId || '',
      log.details,
      log.ipAddress || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('REJECT')) return 'destructive';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'warning';
    if (action.includes('CREATE') || action.includes('ADD')) return 'success';
    if (action.includes('LOGIN')) return 'info';
    return 'default';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-8 h-8" />
              Audit Logs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track all admin actions and system activities
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (confirm('Clear logs older than 30 days?')) {
                  clearOldLogs(30);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Old Logs
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Today's Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {logs.filter(log => 
                  new Date(log.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unique Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueActions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(logs.map(log => log.adminEmail)).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="all">All Actions</option>
                  {uniqueActions.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Log ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold">Timestamp</th>
                    <th className="text-left p-3 text-sm font-semibold">Admin</th>
                    <th className="text-left p-3 text-sm font-semibold">Action</th>
                    <th className="text-left p-3 text-sm font-semibold">Ticket ID</th>
                    <th className="text-left p-3 text-sm font-semibold">Details</th>
                    <th className="text-left p-3 text-sm font-semibold">IP Address</th>
                    <th className="text-left p-3 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        No logs found
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr 
                        key={log.id}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <td className="p-3 text-sm">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.adminEmail}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={getActionColor(log.action) as any}>
                            {log.action}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm font-mono">
                          {log.ticketId || '-'}
                        </td>
                        <td className="p-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {log.details}
                        </td>
                        <td className="p-3 text-sm font-mono text-gray-500">
                          {log.ipAddress || '-'}
                        </td>
                        <td className="p-3">
                          {log.emailMetadata && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingEmail(log)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View Email
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Email View Modal */}
        {viewingEmail && viewingEmail.emailMetadata && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingEmail(null)}>
            <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-background border-b border-border p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Details
                </h2>
                <button onClick={() => setViewingEmail(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Sent At</p>
                    <p className="font-medium">{new Date(viewingEmail.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ticket ID</p>
                    <p className="font-medium font-mono">{viewingEmail.ticketId || '-'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-medium">{viewingEmail.emailMetadata.to}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-semibold text-lg">{viewingEmail.emailMetadata.subject}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Message</p>
                  <div className="bg-secondary/30 p-4 rounded-lg border border-border">
                    <p className="whitespace-pre-wrap">{viewingEmail.emailMetadata.message}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setViewingEmail(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
