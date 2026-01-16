import { useState, useRef, useEffect } from 'react';
import { useReportStore } from '@/store/reportStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
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
  Mail,
  Sparkles,
  Wand2,
  PhoneCall
} from 'lucide-react';
import logoMark from '@/assets/roadrescue-logo.svg';

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
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
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
  const [conversationState, setConversationState] = useState<{
    awaitingConfirmation?: boolean;
    notFoundTicketId?: string;
    awaitingEmail?: boolean;
    userEmailForSearch?: string;
    awaitingSupportEmail?: boolean;
    awaitingSupportSummary?: boolean;
    supportEmail?: string;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { reports } = useReportStore();

  const quickPrompts = [
    'Check status for SRP-123',
    'Show my reports for email@example.com',
    'How long do repairs take?',
    'How to submit a new report?',
    'Contact a human agent'
  ];

  const quickActions = [
    { label: 'Report issue', prompt: 'I want to submit a new road issue', icon: AlertCircle },
    { label: 'Track status', prompt: 'Track status for SRP-123', icon: Search },
    { label: 'Talk to human', prompt: 'I need to talk to a human', icon: PhoneCall },
    { label: 'How to use', prompt: 'How do I use this website?', icon: MessageCircle },
  ];

  const miniGuides = [
    {
      title: 'Track by ticket',
      desc: 'Use SRP-XXX format (e.g., SRP-101) to see live status.',
      action: 'Track SRP-101'
    },
    {
      title: 'Track by email',
      desc: 'Enter your email to list all your reports and statuses.',
      action: 'My reports for your@email.com'
    },
    {
      title: 'New report help',
      desc: 'Step-by-step guide to submit with photos and GPS.',
      action: 'How to submit a report?'
    }
  ];

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

  const createSupportTicket = async (userEmail: string, ticketId?: string, summary?: string) => {
    try {
      const supportTicketId = `SUP-${Date.now().toString().slice(-6)}`;
      const issueDescription = summary
        ? summary
        : ticketId 
        ? `User cannot find report with Ticket ID: ${ticketId}. Email: ${userEmail}`
        : `User needs assistance with report search. Email: ${userEmail}`;

      // Submit support ticket via Web3Forms
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: userEmail,
          email: userEmail,
          subject: `Support Ticket ${supportTicketId} - Report Not Found`,
          message: issueDescription,
          from_name: 'Road Rescuer Support Bot',
        }),
      });

      // Send confirmation email to user via EmailJS
      const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
      const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
      
      if (EMAILJS_SERVICE_ID && EMAILJS_PUBLIC_KEY) {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          'template_otp_verify',
          {
            to_email: userEmail,
            to_name: userEmail.split('@')[0],
            otp_code: supportTicketId,
            app_name: 'Road Rescuer - Support Ticket Created',
          }
        );
      }

      return supportTicketId;
    } catch (error) {
      console.error('Failed to create support ticket:', error);
      return null;
    }
  };

  const processUserInput = async (userInput: string) => {
    const lowerInput = userInput.toLowerCase();

    // Handle conversation states
    if (conversationState.awaitingConfirmation) {
      if (lowerInput.includes('yes') || lowerInput.includes('sure') || lowerInput.includes('correct')) {
        setConversationState({ awaitingEmail: true, notFoundTicketId: conversationState.notFoundTicketId });
        return "Got it! Could you please provide your email address? I'll search for all reports associated with it. 📧";
      } else if (lowerInput.includes('no') || lowerInput.includes('wrong')) {
        setConversationState({});
        return "No problem! Please double-check your ticket ID and try again. The format should be SRP-XXX (like SRP-101, SRP-250, etc.). 🔍";
      }
    }

    if (conversationState.awaitingSupportEmail) {
      const emailMatch = userInput.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        const email = emailMatch[0];
        setConversationState({ awaitingSupportSummary: true, supportEmail: email });
        return `Thanks! Got your email: ${email}. Could you briefly describe the issue so I can create a ticket if needed? (1-2 lines is enough.)`;
      }
      return "That email doesn't look right. Please share a valid email so I can help you (e.g., you@example.com).";
    }

    if (conversationState.awaitingSupportSummary && conversationState.supportEmail) {
      const supportTicketId = await createSupportTicket(conversationState.supportEmail, conversationState.notFoundTicketId, userInput);
      setConversationState({});
      if (supportTicketId) {
        return `I've logged this for our team. 🎫 Support Ticket: ${supportTicketId}\nWe'll review and contact you at ${conversationState.supportEmail}. Anything else I can check right now?`;
      }
      return `I couldn't create the support ticket just now. Please email us at support@roadrescuer.com and include your details. Sorry about that!`;
    }

    if (conversationState.awaitingEmail) {
      const emailMatch = userInput.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        const email = emailMatch[0];
        const userReports = findReportsByEmail(email);
        
        if (userReports.length > 0) {
          setConversationState({});
          let response = `Great! 🎉 I found ${userReports.length} report(s) for ${email}:\n\n`;
          userReports.slice(0, 5).forEach((r, i) => {
            response += `${i + 1}. ${getStatusIcon(r.status)} ${r.ticketId} - ${r.status.toUpperCase()}\n   ${r.description.substring(0, 50)}...\n   📅 ${new Date(r.createdAt).toLocaleDateString()}\n\n`;
          });
          if (userReports.length > 5) {
            response += `... and ${userReports.length - 5} more reports.`;
          }
          return response;
        } else {
          // No reports found - create support ticket
          const supportTicketId = await createSupportTicket(email, conversationState.notFoundTicketId);
          setConversationState({});
          
          if (supportTicketId) {
            return `I couldn't find any reports for ${email} either. 😔\n\nNo worries! I've created a support ticket for you:\n\n🎫 **Support Ticket: ${supportTicketId}**\n\nOur customer support team will investigate and reach out to you at ${email} within 24 hours. You'll also receive a confirmation email shortly.\n\nIs there anything else I can help you with?`;
          } else {
            return `I couldn't find any reports for ${email}. I tried to create a support ticket but encountered an issue. Please contact our team directly at support@roadrescuer.com for assistance. 🙏`;
          }
        }
      } else {
        return "Hmm, that doesn't look like a valid email address. Could you please provide a valid email? (e.g., yourname@example.com) 📧";
      }
    }

    // Check for ticket ID
    const ticketMatch = userInput.match(/SRP-\d+/i);
    if (ticketMatch) {
      const ticketId = ticketMatch[0].toUpperCase();
      const report = reports.find(r => r.ticketId === ticketId);
      
      if (report) {
        setConversationState({});
        const statusText = `${getStatusIcon(report.status)} **Found it! Here's your report:**\n\n` +
          `📋 Ticket ID: ${report.ticketId}\n` +
          `📍 Location: ${report.address || 'Coordinates: ' + report.latitude + ', ' + report.longitude}\n` +
          `📝 Description: ${report.description}\n` +
          `⚠️ Severity: ${report.severity}\n` +
          `📅 Reported: ${new Date(report.createdAt).toLocaleDateString()}\n` +
          (report.resolvedAt ? `✅ Resolved: ${new Date(report.resolvedAt).toLocaleDateString()}` : `\nCurrent Status: **${report.status.toUpperCase()}**`);
        
        return statusText;
      } else {
        // Ticket not found - ask for confirmation
        setConversationState({ awaitingConfirmation: true, notFoundTicketId: ticketId });
        return `Hmm, I couldn't find a report with ticket ID **${ticketId}** in our system. 🤔\n\nAre you sure that's the correct ticket ID? Please double-check:\n• Format should be SRP-XXX (e.g., SRP-101)\n• Check your email confirmation for the exact ID\n\nIf you're certain it's correct, reply 'yes' and I'll help you search by email instead. Or reply 'no' to try a different ticket ID.`;
      }
    }

    // Check for email
    const emailMatch = userInput.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      const email = emailMatch[0];
      const userReports = findReportsByEmail(email);
      
      if (userReports.length > 0) {
        setConversationState({});
        let response = `Perfect! 📧 I found ${userReports.length} report(s) for ${email}:\n\n`;
        userReports.slice(0, 5).forEach((r, i) => {
          response += `${i + 1}. ${getStatusIcon(r.status)} ${r.ticketId} - ${r.status.toUpperCase()}\n   ${r.description.substring(0, 50)}...\n   📅 ${new Date(r.createdAt).toLocaleDateString()}\n\n`;
        });
        if (userReports.length > 5) {
          response += `... and ${userReports.length - 5} more reports.`;
        }
        return response;
      } else {
        setConversationState({});
        return `I couldn't find any reports for ${email}. 😕\n\nThis could mean:\n• No reports were submitted with this email\n• The email might be different\n\nWould you like to submit a new report? Just head to the 'Report Issue' page and I'll be here if you need help!`;
      }
    }

    // Check for contact/query intent
    if (lowerInput.includes('contact') || lowerInput.includes('help') || lowerInput.includes('query') || lowerInput.includes('question') || lowerInput.includes('human') || lowerInput.includes('agent')) {
      setConversationState({ awaitingSupportEmail: true });
      return "I'm here to help. First, drop your email so I can assist you or create a ticket if we can't solve it here. 📧";
    }

    // Use Gemini AI for general questions (free tier)
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Anvi, a friendly and helpful AI assistant for "Road Rescuer", a road repair reporting platform for Solapur city. Speak naturally like a helpful human support agent.

Context about Road Rescuer:
- Citizens report potholes/road damage with GPS location and photos
- Reports get unique ticket IDs (format: SRP-XXX, e.g., SRP-101, SRP-250)
- Admin team reviews, verifies, and assigns reports to repair teams
- Users track reports via ticket ID or email address
- Email/SMS notifications sent at each status change
- Typical resolution time: 3-7 days (varies by severity)
- System handles: open → in-progress → resolved workflow

Key features:
1. Report Issue: Users pin location on map, add photos, describe damage, set severity
2. Track Status: Search by ticket ID (SRP-XXX) or email to see live status
3. Email Notifications: Auto-sent when status changes
4. Admin Dashboard: For municipal team to manage and prioritize reports

Common questions you should answer confidently:
- How to submit a report (step-by-step)
- What happens after submission
- How long repairs take
- How to track report status
- What ticket ID format looks like
- How to get notifications
- What severity levels mean (low/medium/high)
- How to contact support if issues arise

User's question: "${userInput}"

Provide a helpful, conversational response (max 120 words). Be warm, clear, and actionable. Use emojis sparingly but naturally. If they need to check a specific report, guide them to provide their ticket ID or email. Sound human, not robotic.`
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 250,
            topP: 0.95,
          }
        }),
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        setConversationState({});
        return data.candidates[0].content.parts[0].text;
      }
    } catch (error) {
      console.log('Gemini AI fallback to rule-based', error);
      // Fallback to rule-based responses if AI fails
    }

    // Enhanced fallback responses with natural language
    if (lowerInput.includes('status') || lowerInput.includes('check') || lowerInput.includes('track')) {
      setConversationState({});
      return "Sure! I can help you check your report status. 🔍\n\nJust give me:\n• Your ticket ID (looks like SRP-123), or\n• The email you used when submitting\n\nGo ahead, I'm listening!";
    }

    if (lowerInput.includes('submit') || lowerInput.includes('report') || lowerInput.includes('new')) {
      setConversationState({});
      return "Great! Quick steps to report:\n1) Tap 'Report Issue'\n2) Pin location (or use Detect My Location)\n3) Describe + add a photo\n4) Pick severity\n5) Enter email for updates\nYou'll get a ticket ID instantly. Want me to guide you through any step?";
    }

    if (lowerInput.includes('hi') || lowerInput.includes('hello') || lowerInput.includes('hey') || lowerInput.includes('hii')) {
      setConversationState({});
      return "Hey there! 👋 I'm Anvi, your Road Rescuer assistant. How can I help you today?\n\nI can:\n• Find your report status (just tell me your ticket ID or email)\n• Walk you through submitting a new report\n• Answer questions about how this works\n• Connect you with our support team\n\nWhat do you need?";
    }

    if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
      setConversationState({});
      return "You're very welcome! 😊 Happy to help. If you need anything else, just ask - I'm here 24/7!";
    }

    // Default response with personality
    setConversationState({});
    return "Hmm, I'm not quite sure I got that. 🤔 Let me know if you'd like to:\n\n• Check a report status (give me a ticket ID like SRP-123 or your email)\n• Learn how to submit a new report\n• Ask about how Road Rescuer works\n• Talk to a human on our support team\n\nWhat works for you?";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setSuggestionsOpen(false);
    addMessage('user', userMessage);
    setInput('');
    setIsTyping(true);

    // Human-like response delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const response = await processUserInput(userMessage);
    addMessage('bot', response);
    setIsTyping(false);
  };

  const handleQuickPrompt = async (prompt: string) => {
    setInput('');
    setSuggestionsOpen(false);
    addMessage('user', prompt);
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    const response = await processUserInput(prompt);
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
          className="fixed bottom-6 right-6 group z-50"
        >
          <div className="relative flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white rounded-full shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.6)] transition-all duration-200">
            <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md grid place-items-center border border-white/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs opacity-80">Ask Anvi</p>
              <p className="text-sm font-semibold leading-tight">Road Rescuer AI</p>
            </div>
            <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 w-[min(95vw,380px)] h-[min(80vh,640px)] bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 border border-white/10 rounded-3xl shadow-[0_20px_80px_-30px_rgba(0,0,0,0.8)] flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="relative p-4 sm:p-5 flex items-center justify-between bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-cyan-500/80 text-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 grid place-items-center">
                <img src={logoMark} alt="Road Rescuer" className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide opacity-80">Anvi • Road Rescuer AI</p>
                <h3 className="text-base sm:text-lg font-semibold leading-tight">Human-backed assistant</h3>
                <p className="text-[11px] sm:text-xs opacity-80">Live status • How-to guides • Escalations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/15 text-[11px] border border-white/20">
                <Sparkles className="w-3 h-3" /> v2.0
              </span>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/15 p-2 rounded-full transition" aria-label="Close chatbot">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.18),transparent_30%)]" />
          </div>

          {/* Quick chips */}
          {!showContactForm && (
            <div className="px-4 pt-4 pb-2 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm border-b border-white/5">
              <div className="flex items-center justify-between text-[11px] text-white/70 mb-2 gap-2">
                <span className="uppercase tracking-wide">Quick help</span>
                <button
                  onClick={() => setSuggestionsOpen((prev) => !prev)}
                  className="px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  aria-label={suggestionsOpen ? 'Hide suggestions' : 'Show suggestions'}
                >
                  {suggestionsOpen ? 'Hide' : 'Show'}
                </button>
              </div>

              {suggestionsOpen && (
                <div className="flex flex-wrap gap-2 pb-1">
                  {quickPrompts.map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="text-xs sm:text-[13px] px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-gradient-to-b from-slate-900/70 via-slate-900 to-slate-950">
            {/* Mini guides */}
            {!showContactForm && suggestionsOpen && messages.length <= 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {miniGuides.map((guide) => (
                  <button
                    key={guide.title}
                    onClick={() => handleQuickPrompt(guide.action)}
                    className="text-left rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition p-3 text-white/90"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Wand2 className="w-4 h-4" />
                      <span className="text-sm font-semibold">{guide.title}</span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">{guide.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] p-3.5 rounded-2xl shadow-sm border ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white border-blue-500/60'
                      : 'bg-white/5 text-white border-white/10 backdrop-blur'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className="text-[11px] opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.type === 'user' && (
                  <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Contact Form */}
          {showContactForm && (
            <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-900/70 backdrop-blur">
              <div className="flex items-center gap-2 mb-3 text-white">
                <PhoneCall className="w-4 h-4" />
                <div>
                  <p className="text-sm font-semibold">Escalate to human team</p>
                  <p className="text-[11px] text-white/70">Replies in 24-48 hours</p>
                </div>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="text-sm bg-white/5 border-white/10 text-white placeholder:text-white/50"
                />
                <Input
                  type="email"
                  placeholder="Your Email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="text-sm bg-white/5 border-white/10 text-white placeholder:text-white/50"
                />
                <Input
                  placeholder="Subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="text-sm bg-white/5 border-white/10 text-white placeholder:text-white/50"
                />
                <Textarea
                  placeholder="Your message..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={3}
                  className="text-sm resize-none bg-white/5 border-white/10 text-white placeholder:text-white/50"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitQuery}
                    disabled={isTyping}
                    className="flex-1 bg-blue-600 hover:bg-blue-500"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Submit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
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
            <div className="p-4 sm:p-5 border-t border-white/10 bg-slate-900/80 backdrop-blur">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickPrompt(action.prompt)}
                    className="flex items-center justify-center gap-2 text-xs px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
                  >
                    <action.icon className="w-3.5 h-3.5" />
                    <span className="font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything: status, how-to, contact..."
                  className="flex-1 bg-white/5 border-white/15 text-white placeholder:text-white/60"
                />
                <Button onClick={handleSend} size="icon" disabled={!input.trim() || isTyping} className="bg-blue-600 hover:bg-blue-500">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[11px] text-white/60 mt-2">
                💡 Tips: "SRP-123" • "my reports for you@mail.com" • "how long do repairs take?"
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};
