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
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Report a pothole in 4 simple steps and help make Solapur's roads safer for everyone.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-border z-0" />
              )}
              
              {/* Step Icon */}
              <div className={`relative z-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.color} shadow-lg mb-4`}>
                <step.icon className="w-7 h-7" />
              </div>
              
              {/* Step Number */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-card border-2 border-primary text-primary text-xs font-bold rounded-full flex items-center justify-center z-20">
                {index + 1}
              </div>
              
              <h3 className="font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
