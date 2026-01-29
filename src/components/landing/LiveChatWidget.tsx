import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Send, User, Headphones, Paperclip, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

export const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userIsTyping, setUserIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [totalAttachments, setTotalAttachments] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      // Count total attachments
      const count = data?.reduce((sum, msg) => sum + (msg.attachments?.length || 0), 0) || 0;
      setTotalAttachments(count);
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
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const adminTyping = Object.values(state).some(
          (presence: any) => presence[0]?.typing && presence[0]?.type === 'admin'
        );
        setIsTyping(adminTyping);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ type: 'user', typing: false });
        }
      });

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

      // Send automated welcome message
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 'welcome-msg',
            ticket_id: ticket.id,
            ticket_number: ticketNumber.toUpperCase(),
            sender_type: 'admin',
            sender_name: 'Support Bot',
            message: `👋 Hi ${ticket.name || 'there'}! Thanks for reaching out. Our support team typically responds within 5-15 minutes during business hours. We've received your query and will be with you shortly!`,
            created_at: new Date().toISOString(),
          } as ChatMessage,
        ]);
      }, 500);
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Failed to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Please select only image files');
      return;
    }

    const remainingSlots = 3 - totalAttachments;
    if (selectedFiles.length + imageFiles.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more image(s). Maximum 3 images per ticket.`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...imageFiles].slice(0, remainingSlots));
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];

    setUploadingFiles(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${ticketNumber}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${ticketNumber}/${fileName}`;

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
      toast.error('Failed to upload images');
      return [];
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;

    try {
      const attachmentUrls = await uploadFiles();

      const { error } = await supabase.from('chat_messages').insert([
        {
          ticket_id: ticketId,
          ticket_number: ticketNumber.toUpperCase(),
          sender_type: 'user',
          sender_name: userName,
          message: newMessage.trim() || '(Image)',
          attachments: attachmentUrls,
        },
      ]);

      if (error) throw error;
      setNewMessage('');
      setSelectedFiles([]);
      setUserIsTyping(false);

      // Broadcast typing stopped
      const channel = supabase.channel(`chat:${ticketNumber}`);
      await channel.track({ type: 'user', typing: false });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!userIsTyping && value.trim()) {
      setUserIsTyping(true);
      const channel = supabase.channel(`chat:${ticketNumber}`);
      channel.track({ type: 'user', typing: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(async () => {
      setUserIsTyping(false);
      const channel = supabase.channel(`chat:${ticketNumber}`);
      await channel.track({ type: 'user', typing: false });
    }, 1000);
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
                setTicketNumber('');
                setMessages([]);
              }}
              className="text-primary-foreground hover:opacity-80"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          {!isConnected ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center">
              <Headphones className="w-16 h-16 text-primary/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Connect to Support</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Enter your ticket number to start chatting with our support team
              </p>
              <Input
                placeholder="Enter ticket number (e.g., SUP-123456)"
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="mb-4"
              />
              <Button onClick={handleConnect} disabled={isLoading} className="w-full">
                {isLoading ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                {messages.length === 0 ? (
                  <div className="text-center">
                    <div className="mb-4">
                      <Headphones className="w-12 h-12 mx-auto text-primary/50 mb-2" />
                      <p className="font-semibold">Connected to Support!</p>
                      <p className="text-xs mt-2">
                        Our team typically responds within 5-15 minutes
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
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
                              : msg.sender_name === 'Support Bot'
                              ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800'
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
                          
                          {/* Display Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
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
                          
                          <span className="text-xs opacity-70 mt-1 block">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 border rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <Headphones className="w-3 h-3" />
                            <span className="text-xs font-semibold">Support Team</span>
                          </div>
                          <div className="flex gap-1 mt-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
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
                          className="w-16 h-16 object-cover rounded border"
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
                  
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                    disabled={uploadingFiles}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    size="icon"
                    disabled={uploadingFiles}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    ⏱️ Response: 5-15 min
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <ImageIcon className="w-3 h-3 inline mr-1" />
                    {totalAttachments}/3 images
                  </p>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  );
};
