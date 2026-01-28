import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Send,
  Filter,
  Search,
  MessageSquare,
  Calendar,
  User,
  Inbox,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';

interface SupportTicket {
  id: string;
  ticket_number: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  admin_reply?: string;
  admin_id?: string;
  replied_at?: string;
  created_at: string;
  updated_at: string;
}

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, statusFilter, searchQuery]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load support tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = tickets;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.ticket_number.toLowerCase().includes(query) ||
        ticket.name.toLowerCase().includes(query) ||
        ticket.email.toLowerCase().includes(query) ||
        ticket.subject.toLowerCase().includes(query) ||
        ticket.message.toLowerCase().includes(query)
      );
    }

    setFilteredTickets(filtered);
  };

  const handleReply = async () => {
    if (!selectedTicket || !reply.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a reply message',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from('support_tickets')
        .update({
          admin_reply: reply,
          status: 'resolved',
          replied_at: new Date().toISOString(),
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Reply sent successfully',
      });

      setReply('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Ticket status updated',
      });

      fetchTickets();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const stats = {
    new: tickets.filter(t => t.status === 'new').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    total: tickets.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Support Tickets</h1>
        <p className="text-muted-foreground">
          Manage and respond to user queries
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">New Tickets</p>
              <p className="text-2xl font-bold">{stats.new}</p>
            </div>
            <Inbox className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold">{stats.resolved}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-mono">
                    {ticket.ticket_number}
                  </Badge>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('-', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">{ticket.subject}</h3>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{ticket.name}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{ticket.email}</span>
              </div>
              {ticket.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{ticket.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(ticket.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm line-clamp-3">{ticket.message}</p>
            </div>

            {ticket.admin_reply && (
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-md border border-green-200 dark:border-green-800">
                <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
                  Admin Reply:
                </p>
                <p className="text-sm">{ticket.admin_reply}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => {
                  setSelectedTicket(ticket);
                  setReply(ticket.admin_reply || '');
                }}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {ticket.admin_reply ? 'Update Reply' : 'Reply'}
              </Button>
              {ticket.status !== 'resolved' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Resolved
                </Button>
              )}
              {ticket.status !== 'closed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateTicketStatus(ticket.id, 'closed')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Close
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No support tickets have been submitted yet'}
          </p>
        </Card>
      )}

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">Reply to Ticket</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedTicket.ticket_number} - {selectedTicket.subject}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTicket(null);
                  setReply('');
                }}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-2">
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-semibold mb-2">User Message:</p>
                <p className="text-sm">{selectedTicket.message}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Your Reply:</label>
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={6}
                  className="resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleReply}
                disabled={submitting || !reply.trim()}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Sending...' : 'Send Reply & Mark Resolved'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTicket(null);
                  setReply('');
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminSupportTickets;
