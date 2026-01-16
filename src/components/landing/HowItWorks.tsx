import { MapPin, Camera, Send, Wrench } from 'lucide-react';

const steps = [
  {
    icon: MapPin,
    title: 'Locate',
    description: 'GPS auto-detects your location or drop a pin manually',
    color: 'bg-primary text-primary-foreground',
  },
  {
    icon: Camera,
    title: 'Capture',
    description: 'Take a photo of the road damage',
    color: 'bg-primary text-primary-foreground',
  },
  {
    icon: Send,
    title: 'Submit',
    description: 'Get an instant tracking ID',
    color: 'bg-primary text-primary-foreground',
  },
  {
    icon: Wrench,
    title: 'Track',
    description: 'Monitor repair status in real-time',
    color: 'bg-success text-success-foreground',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-2">How it works</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Report in four quick steps</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
            Pin the spot, add a photo, hit submit, and track every update—built for mobile first.
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative bg-card/90 border border-border rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col gap-3 animate-fade-in"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${step.color} shadow-md`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-semibold grid place-items-center border border-primary/30">
                  {index + 1}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
