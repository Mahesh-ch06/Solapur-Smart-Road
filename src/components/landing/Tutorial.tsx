import { MapPin, FileText, Search, Mail, UserCheck, CheckCircle } from 'lucide-react';

const Tutorial = () => {
  const steps = [
    {
      number: 1,
      title: 'Report a problem',
      description: "Tap 'Report Issue' and pin the spot (use 'Detect My Location' if you're on-site).",
      icon: MapPin,
    },
    {
      number: 2,
      title: 'Add the details',
      description: 'Describe the damage, set severity, add a photo, and enter email/phone for updates.',
      icon: FileText,
    },
    {
      number: 3,
      title: 'Track with your ID',
      description: "After submitting you'll get a ticket like SRP-123. Use Track Status anytime.",
      icon: Search,
    },
    {
      number: 4,
      title: 'Watch your inbox',
      description: 'We email you when the status changes—submitted, in progress, and resolved.',
      icon: Mail,
    },
    {
      number: 5,
      title: 'We review and act',
      description: 'Admins verify location/severity and dispatch repairs. You see live status updates.',
      icon: UserCheck,
    },
    {
      number: 6,
      title: 'Issue resolved',
      description: "When fixed, we mark it 'Resolved' and confirm via email. Check the map to verify.",
      icon: CheckCircle,
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">How to use this website</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">Follow these simple steps</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">Report road issues and track their resolution without the clutter.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex gap-3 sm:gap-4 rounded-xl border border-border bg-card/70 backdrop-blur-sm p-3.5 sm:p-5 hover:-translate-y-1 transition-transform"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border grid place-items-center text-foreground/80">
                  <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="text-[11px] sm:text-xs text-muted-foreground">{step.number}</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-semibold text-foreground leading-snug">{step.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="inline-flex items-center gap-2 text-sm sm:text-base text-foreground bg-muted px-4 py-2 rounded-full">
            <CheckCircle className="w-4 h-4" />
            Ready? Start a report and we’ll keep you posted.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Tutorial;
