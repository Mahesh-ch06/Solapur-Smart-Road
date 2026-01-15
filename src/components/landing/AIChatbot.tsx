import { useState, useRef, useEffect } from 'react';
import { useReportStore } from '@/store/reportStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const WEB3FORMS_ACCESS_KEY = 'f01743b9-867e-4fb9-a16e-206b3bf69f10';
const GEMINI_API_KEY = 'AIzaSyBVU4xnAE_q43CMqnlWxgd8zKZ7PQYOnYE';

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "👋 Hi! I'm your Road Rescuer AI assistant. I can help you:\n\n• Check report status (use ticket ID like SRP-123 or email)\n• Answer questions about our service\n• Submit queries to our team\n\nHow can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { reports } = useReportStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: 'user' | 'bot', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const findReportByTicketId = (input: string) => {
    const ticketMatch = input.match(/SRP-\d+/i);
    if (ticketMatch) {
      const ticketId = ticketMatch[0].toUpperCase();
      return reports.find(r => r.ticketId === ticketId);
    }
    return null;
  };

  const findReportsByEmail = (email: string) => {
    return reports.filter(r => r.userEmail?.toLowerCase() === email.toLowerCase());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return '🔴';
      case 'in-progress': return '🟡';
      case 'resolved': return '🟢';
      case 'rejected': return '⚫';
      default: return '⚪';
    }
  };

  const handleSubmitQuery = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsTyping(true);
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: contactForm.name,
          email: contactForm.email,
          subject: `Road Rescuer Query: ${contactForm.subject}`,
          message: contactForm.message,
          from_name: 'Road Rescuer Chatbot',
        }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage('bot', `✅ Your query has been submitted successfully! Our team will get back to you at ${contactForm.email} within 24-48 hours.\n\nReference: ${data.message || 'Query submitted'}`);
        setContactForm({ name: '', email: '', subject: '', message: '' });
        setShowContactForm(false);
        toast.success('Query submitted successfully!');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      addMessage('bot', '❌ Sorry, there was an error submitting your query. Please try again or email us directly at support@roadrescuer.com');
      toast.error('Failed to submit query');
    } finally {
      setIsTyping(false);
    }
  };

  const processUserInput = async (userInput: string) => {
    const lowerInput = userInput.toLowerCase();

    // Check for ticket ID
    const report = findReportByTicketId(userInput);
    if (report) {
      const statusText = `${getStatusIcon(report.status)} **Report Status: ${report.status.toUpperCase()}**\n\n` +
        `📋 Ticket ID: ${report.ticketId}\n` +
        `📍 Location: ${report.address || 'Coordinates: ' + report.latitude + ', ' + report.longitude}\n` +
        `📝 Description: ${report.description}\n` +
        `⚠️ Severity: ${report.severity}\n` +
        `📅 Reported: ${new Date(report.createdAt).toLocaleDateString()}\n` +
        (report.resolvedAt ? `✅ Resolved: ${new Date(report.resolvedAt).toLocaleDateString()}` : '');
      
      return statusText;
    }

    // Check for email
    const emailMatch = userInput.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      const email = emailMatch[0];
      const userReports = findReportsByEmail(email);
      
      if (userReports.length > 0) {
        let response = `📧 Found ${userReports.length} report(s) for ${email}:\n\n`;
        userReports.slice(0, 5).forEach((r, i) => {
          response += `${i + 1}. ${getStatusIcon(r.status)} ${r.ticketId} - ${r.status.toUpperCase()}\n   ${r.description.substring(0, 50)}...\n   ${new Date(r.createdAt).toLocaleDateString()}\n\n`;
        });
        if (userReports.length > 5) {
          response += `... and ${userReports.length - 5} more reports.`;
        }
        return response;
      } else {
        return `📧 No reports found for ${email}. Would you like to submit a new report?`;
      }
    }

    // Check for contact/query intent
    if (lowerInput.includes('contact') || lowerInput.includes('help') || lowerInput.includes('query') || lowerInput.includes('question')) {
      setShowContactForm(true);
      return "💬 I'll help you submit a query to our team. Please fill out the form below with your details and question. Our team will respond within 24-48 hours!";
    }

    // Use Gemini AI for general questions
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful AI assistant for "Road Rescuer", a road repair reporting system for Solapur city. 
              
Context:
- Citizens can report road issues with photos
- Admin team reviews and prioritizes reports
- Repair teams fix the issues
- Users get updates via email/SMS
- Typical resolution: 3-7 days
- Users can track reports with ticket IDs (format: SRP-XXX) or email

Available features:
- Report a problem (/report page)
- Track status (/track page)
- Contact us (/contact page)

User question: ${userInput}

Provide a helpful, concise response (max 150 words). Be friendly and professional. If they ask about specific reports, remind them they can check using ticket ID or email.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          }
        }),
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch (error) {
      // Fallback to rule-based responses if AI fails
    }

    // Fallback responses
    if (lowerInput.includes('status') || lowerInput.includes('check') || lowerInput.includes('track')) {
      return "🔍 To check your report status:\n\n1. Enter your ticket ID (format: SRP-123)\n2. Or enter your email address\n\nI'll find your report(s) and show you the current status!";
    }

    if (lowerInput.includes('submit') || lowerInput.includes('report') || lowerInput.includes('new')) {
      return "📝 To submit a new report:\n\n1. Click the 'Report a Problem' button in the menu\n2. Select the location on the map\n3. Describe the issue and add a photo\n4. Submit and get your ticket ID\n\nYou'll receive confirmation via email or SMS!";
    }

    if (lowerInput.includes('hi') || lowerInput.includes('hello') || lowerInput.includes('hey')) {
      return "👋 Hello! How can I assist you today?\n\nTry asking:\n• 'Check status for SRP-123'\n• 'My reports for email@example.com'\n• 'How does this work?'\n• 'I have a question'";
    }

    // Default response
    return "🤔 I'm not sure I understand. I can help you with:\n\n• 🔍 Checking report status (ticket ID or email)\n• ❓ Answering questions about our service\n• 💬 Submitting queries to our team\n\nWhat would you like to know?";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    addMessage('user', userMessage);
    setInput('');
    setIsTyping(true);

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const response = await processUserInput(userMessage);
    addMessage('bot', response);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50 animate-bounce"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-background border border-border rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Road Rescuer AI</h3>
                <p className="text-xs opacity-90">Always here to help</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/20 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-border'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-background border border-border p-3 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Contact Form */}
          {showContactForm && (
            <div className="p-4 border-t border-border bg-secondary/20">
              <div className="space-y-2">
                <Input
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="text-sm"
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="text-sm"
                />
                <Input
                  placeholder="Subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="text-sm"
                />
                <Textarea
                  placeholder="Your message..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={3}
                  className="text-sm resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitQuery}
                    disabled={isTyping}
                    className="flex-1"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Submit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowContactForm(false);
                      setContactForm({ name: '', email: '', subject: '', message: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          {!showContactForm && (
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button onClick={handleSend} size="icon" disabled={!input.trim() || isTyping}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Try: "SRP-123" or "check status for email@example.com"
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};
