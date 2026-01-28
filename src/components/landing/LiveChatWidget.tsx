import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Send, User, Headphones } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  ticket_id: string;
  ticket_number: string;
  sender_type: 'user' | 'admin';
  sender_name: string;
  message: string;
  created_at: string;
}

export const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [ticketId, setTicketId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected && ticketNumber) {
      loadMessages();
      subscribeToMessages();
    }
  }, [isConnected, ticketNumber]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('ticket_number', ticketNumber)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat:${ticketNumber}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `ticket_number=eq.${ticketNumber}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleConnect = async () => {
    if (!ticketNumber.trim()) {
      toast.error('Please enter your ticket number');
      return;
    }

    setIsLoading(true);
    try {
      // Verify ticket exists
      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('ticket_number', ticketNumber.toUpperCase())
        .single();

      if (error || !ticket) {
        toast.error('Ticket not found. Please check your ticket number.');
        setIsLoading(false);
        return;
      }

      setTicketId(ticket.id);
      setUserName(ticket.name || ticket.email.split('@')[0]);
      setIsConnected(true);
      toast.success('Connected to support chat!');
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Failed to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase.from('chat_messages').insert([
        {
          ticket_id: ticketId,
          ticket_number: ticketNumber.toUpperCase(),
          sender_type: 'user',
          sender_name: userName,
          message: newMessage.trim(),
        },
      ]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isConnected) {
        handleSendMessage();
      } else {
        handleConnect();
      }
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-50 flex items-center gap-2"
        >
          <Headphones className="w-6 h-6" />
          <span className="hidden sm:inline text-sm font-semibold">Live Support</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 left-6 w-96 h-[500px] shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Live Support Chat</h3>
                {isConnected && (
                  <p className="text-xs opacity-90">Ticket: {ticketNumber}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsConnected(false);
                setMessages([]);
                setTicketNumber('');
              }}
              className="hover:bg-white/20 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isConnected ? (
            /* Connection Screen */
            <div className="flex-1 p-6 flex flex-col justify-center">
              <div className="text-center mb-6">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">
                  Connect to Support
                </h3>
                <p className="text-sm text-muted-foreground">
                  Enter your support ticket number to start chatting with our team
                </p>
              </div>
              <Input
                placeholder="Enter ticket number (e.g., SUP-123456)"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="mb-4"
              />
              <Button
                onClick={handleConnect}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Connecting...' : 'Connect to Chat'}
              </Button>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_type === 'user'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg p-3 ${
                          msg.sender_type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white dark:bg-gray-800 border'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {msg.sender_type === 'admin' ? (
                            <Headphones className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          <span className="text-xs font-semibold">
                            {msg.sender_name}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.message}
                        </p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  );
};
