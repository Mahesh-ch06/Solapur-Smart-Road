import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import emailjs from '@emailjs/browser';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Clock,
  MessageSquare,
  CheckCircle
} from 'lucide-react';

const WEB3FORMS_ACCESS_KEY = 'f01743b9-867e-4fb9-a16e-206b3bf69f10';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  const generateTicketNumber = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_ticket_number');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating ticket number:', error);
      // Fallback to client-side generation
      return `SUP-${Math.floor(100000 + Math.random() * 900000)}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate ticket number
      const ticketNum = await generateTicketNumber();
      setTicketNumber(ticketNum);

      // Save to Supabase
      const { error: dbError } = await supabase
        .from('support_tickets')
        .insert([
          {
            ticket_number: ticketNum,
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            subject: formData.subject,
            message: formData.message,
            status: 'new',
            priority: formData.message.toLowerCase().includes('urgent') ? 'urgent' : 'medium',
          }
        ]);

      if (dbError) throw dbError;

      // Send confirmation email via EmailJS
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          'template_otp_verify', // Using the same template ID
          {
            to_email: formData.email,
            to_name: formData.name,
            otp_code: ticketNum,
            app_name: 'Solapur Road Rescuer',
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Continue even if email fails
      }

      setSubmitted(true);
      toast.success(`Support ticket created! Ticket #${ticketNum}`);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
      // Reset submitted state after 10 seconds
      setTimeout(() => {
        setSubmitted(false);
        setTicketNumber('');
      }, 10000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 35%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.25), transparent 30%)' }} />
        <div className="container mx-auto px-4 py-12 sm:py-16 relative text-primary-foreground">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-white/20">
            <Mail className="w-3.5 h-3.5" /> We're here to help
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Contact Us</h1>
          <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-3xl">
            Have questions or feedback? We'd love to hear from you. Our team responds within 24-48 hours and urgent issues are monitored 24/7.
          </p>
          <div className="mt-6 grid sm:grid-cols-3 gap-3 max-w-3xl">
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm">
              <Clock className="w-4 h-4" /> 24-48h response
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm">
              <Phone className="w-4 h-4" /> Helpline: +91 123 456 7890
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm">
              <MapPin className="w-4 h-4" /> Solapur Municipal Corp.
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 sm:py-14">
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">For general inquiries:</p>
                <a href="mailto:support@roadrescuer.com" className="text-sm sm:text-base text-primary hover:underline font-medium break-all">
                  support@roadrescuer.com
                </a>
                <p className="text-xs sm:text-sm text-muted-foreground mt-4 mb-2">For urgent issues:</p>
                <a href="mailto:urgent@roadrescuer.com" className="text-sm sm:text-base text-primary hover:underline font-medium break-all">
                  urgent@roadrescuer.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  Call Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Helpline:</p>
                <a href="tel:+911234567890" className="text-primary hover:underline font-medium text-base sm:text-lg touch-manipulation">
                  +91 123 456 7890
                </a>
                <p className="text-xs sm:text-sm text-muted-foreground mt-4 mb-2">Emergency:</p>
                <a href="tel:+911234567891" className="text-primary hover:underline font-medium text-base sm:text-lg touch-manipulation">
                  +91 123 456 7891
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  Office Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Monday - Friday:</span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Saturday:</span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">Sunday:</span>
                    <span className="font-medium">Closed</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    *Emergency reports are monitored 24/7
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Visit Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Road Rescuer Headquarters<br />
                  Solapur Municipal Corporation<br />
                  Solapur, Maharashtra<br />
                  India - 413001
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Quick Help
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 text-sm text-foreground/80">
                <Button size="sm" variant="outline" className="bg-white/80" onClick={() => window.location.href = '/report'}>
                  Report an issue
                </Button>
                <Button size="sm" variant="outline" className="bg-white/80" onClick={() => window.location.href = '/track'}>
                  Track status
                </Button>
                <Button size="sm" variant="outline" className="bg-white/80" onClick={() => window.location.href = '/dashboard'}>
                  My reports
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                    <p className="text-muted-foreground mb-2">
                      Your support ticket has been created successfully.
                    </p>
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 inline-block">
                      <p className="text-sm text-muted-foreground mb-1">Your Ticket Number:</p>
                      <p className="text-2xl font-bold text-primary font-mono">{ticketNumber}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Save this number for future reference
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      We'll review your query and get back to you within 24-48 hours via email.
                    </p>
                    <Button onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Phone (Optional)
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 1234567890"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Subject <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="What is this regarding?"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Message <span className="text-destructive">*</span>
                      </label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us how we can help you..."
                        rows={6}
                        required
                      />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2 bg-secondary/70 border border-border rounded-xl px-3 py-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>Replies in 24-48h</span>
                      </div>
                      <div className="flex items-center gap-2 bg-secondary/70 border border-border rounded-xl px-3 py-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <span>Call if urgent</span>
                      </div>
                      <div className="flex items-center gap-2 bg-secondary/70 border border-border rounded-xl px-3 py-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <span>We email updates</span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By submitting this form, you agree to our privacy policy and terms of service.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">How long does it take to get a response?</h4>
                  <p className="text-sm text-muted-foreground">
                    We typically respond to inquiries within 24-48 hours during business days.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Can I track my report status here?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! Use our AI chatbot (bottom right corner) to instantly check your report status using your ticket ID or email.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">What if I have an urgent issue?</h4>
                  <p className="text-sm text-muted-foreground">
                    For urgent road safety issues, please call our emergency hotline or submit a high-priority report through the "Report a Problem" page.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
