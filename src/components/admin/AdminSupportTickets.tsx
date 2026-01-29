import { useState, useEffect, useRef } from 'react';
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
  XCircle,
  Headphones,
  X,
  Paperclip,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface ChatMessage {
  id: string;
  ticket_id: string;
  ticket_number: string;
  sender_type: 'user' | 'admin';
  sender_name: string;
  message: string;
  attachments?: string[];
  created_at: string;
}

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [adminIsTyping, setAdminIsTyping] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [totalAttachments, setTotalAttachments] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, statusFilter, searchQuery]);

  useEffect(() => {
    if (selectedTicket) {
      loadChatMessages(selectedTicket.id, selectedTicket.ticket_number);
      subscribeToChat(selectedTicket.ticket_number);
    }
  }, [selectedTicket]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      console.log('Fetching support tickets from Supabase...');
      
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      console.log('Successfully fetched tickets:', data?.length || 0, 'tickets');
      setTickets(data || []);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      console.error('Error message:', error.message);
      console.error('Error details:', error);
      toast({
        title: 'Error',
        description: `Failed to load support tickets: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    let filtered = tickets;
    console.log('Filtering tickets. Total tickets:', tickets.length);
    console.log('Status filter:', statusFilter);
    console.log('Search query:', searchQuery);

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
      console.log('After status filter:', filtered.length);
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
      console.log('After search filter:', filtered.length);
    }

    console.log('Final filtered tickets:', filtered.length);
    setFilteredTickets(filtered);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatMessages = async (ticketId: string, ticketNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('ticket_number', ticketNumber)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChatMessages(data || []);
      
      // Count total attachments
      const count = data?.reduce((sum, msg) => sum + (msg.attachments?.length || 0), 0) || 0;
      setTotalAttachments(count);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const subscribeToChat = (ticketNumber: string) => {
    const channel = supabase
      .channel(`admin-chat:${ticketNumber}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `ticket_number=eq.${ticketNumber}`,
        },
        (payload) => {
          setChatMessages((current) => [...current, payload.new as ChatMessage]);
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const userTyping = Object.values(state).some(
          (presence: any) => presence[0]?.typing && presence[0]?.type === 'user'
        );
        setIsUserTyping(userTyping);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ type: 'admin', typing: false });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: 'Invalid files',
        description: 'Please select only image files',
        variant: 'destructive',
      });
      return;
    }

    const remainingSlots = 3 - totalAttachments;
    if (selectedFiles.length + imageFiles.length > remainingSlots) {
      toast({
        title: 'Upload limit reached',
        description: `You can only upload ${remainingSlots} more image(s). Maximum 3 images per ticket.`,
        variant: 'destructive',
      });
      return;
    }

    setSelectedFiles(prev => [...prev, ...imageFiles].slice(0, remainingSlots));
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (selectedFiles.length === 0 || !selectedTicket) return [];

    setUploadingFiles(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${selectedTicket.ticket_number}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${selectedTicket.ticket_number}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setTotalAttachments(prev => prev + uploadedUrls.length);
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload images',
        variant: 'destructive',
      });
      return [];
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || (!newMessage.trim() && selectedFiles.length === 0)) return;

    try {
      setSubmitting(true);
      const attachmentUrls = await uploadFiles();

      const { error } = await supabase.from('chat_messages').insert([
        {
          ticket_id: selectedTicket.id,
          ticket_number: selectedTicket.ticket_number,
          sender_type: 'admin',
          sender_name: 'Support Team',
          message: newMessage.trim() || '(Image)',
          attachments: attachmentUrls,
        },
      ]);

      if (error) throw error;
      setNewMessage('');
      setSelectedFiles([]);
      setAdminIsTyping(false);

      // Broadcast typing stopped
      const channel = supabase.channel(`admin-chat:${selectedTicket.ticket_number}`);
      await channel.track({ type: 'admin', typing: false });

      toast({
        title: 'Message sent',
        description: 'Your message has been sent to the user',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!adminIsTyping && value.trim() && selectedTicket) {
      setAdminIsTyping(true);
      const channel = supabase.channel(`admin-chat:${selectedTicket.ticket_number}`);
      channel.track({ type: 'admin', typing: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(async () => {
      setAdminIsTyping(false);
      if (selectedTicket) {
        const channel = supabase.channel(`admin-chat:${selectedTicket.ticket_number}`);
        await channel.track({ type: 'admin', typing: false });
      }
    }, 1000);
  };

  const handleReply = async () => {
    if (!selectedTicket || !newMessage.trim()) {
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
          admin_reply: newMessage,
          status: 'resolved',
          replied_at: new Date().toISOString(),
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Reply sent successfully',
      });

      setNewMessage('');
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
                  setNewMessage('');
                  setChatMessages([]);
                }}
                className="flex-1"
              >
                <Headphones className="h-4 w-4 mr-2" />
                Open Live Chat
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

      {/* Live Chat Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  <Headphones className="h-6 w-6" />
                  Live Support Chat
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedTicket.ticket_number} - {selectedTicket.subject}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge className={getStatusColor(selectedTicket.status)}>
                    {selectedTicket.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedTicket.email}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTicket(null);
                  setChatMessages([]);
                  setNewMessage('');
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/30">
              {/* Initial Ticket Message */}
              <div className="flex justify-start">
                <div className="max-w-[75%] bg-white dark:bg-gray-800 border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-semibold">
                      {selectedTicket.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      (Initial Request)
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedTicket.message}
                  </p>
                  <span className="text-xs text-muted-foreground mt-2 block">
                    {new Date(selectedTicket.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Chat Messages */}
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg p-4 ${
                      msg.sender_type === 'admin'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white dark:bg-gray-800 border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {msg.sender_type === 'admin' ? (
                        <Headphones className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span className="text-xs font-semibold">
                        {msg.sender_name}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    
                    {/* Display Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.attachments.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={url}
                              alt={`Attachment ${idx + 1}`}
                              className="max-w-full h-auto rounded border hover:opacity-80 transition-opacity"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    
                    <span className="text-xs opacity-70 mt-2 block">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isUserTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span className="text-xs font-semibold">
                        {selectedTicket.name}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
              {/* File Preview */}
              {selectedFiles.length > 0 && (
                <div className="mb-3 flex gap-2 flex-wrap">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        onClick={() => removeSelectedFile(idx)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFiles || totalAttachments >= 3}
                  title={totalAttachments >= 3 ? "Maximum 3 images per ticket" : "Attach images"}
                >
                  {uploadingFiles ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                </Button>
                
                <Textarea
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder="Type your message..."
                  rows={2}
                  className="flex-1 resize-none"
                  disabled={uploadingFiles}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={submitting || uploadingFiles || (!newMessage.trim() && selectedFiles.length === 0)}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  {selectedTicket.status !== 'resolved' && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                      title="Mark as Resolved"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                {isUserTyping ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{selectedTicket.name} is typing...</span>
                  </p>
                ) : (
                  <div></div>
                )}
                <p className="text-xs text-muted-foreground">
                  <ImageIcon className="w-3 h-3 inline mr-1" />
                  {totalAttachments}/3 images
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminSupportTickets;
