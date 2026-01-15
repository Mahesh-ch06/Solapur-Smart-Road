import { MapPin, FileText, Search, Mail, UserCheck, CheckCircle } from 'lucide-react';

const Tutorial = () => {
  const steps = [
    {
      number: 1,
      title: "Report a Problem",
      description: "Click on 'Report Issue' button and select the problem location on the interactive map. You can also use 'Detect My Location' to automatically find your current position.",
      icon: MapPin,
      color: "bg-blue-500",
      textColor: "text-blue-500"
    },
    {
      number: 2,
      title: "Fill in All Details",
      description: "Provide a clear description of the road issue, upload a photo for better understanding, select severity level (Low/Medium/High), and enter your contact details (email/phone) for updates.",
      icon: FileText,
      color: "bg-green-500",
      textColor: "text-green-500"
    },
    {
      number: 3,
      title: "Track Your Report",
      description: "After submitting, you'll receive a unique Ticket ID (e.g., SRP-123). Use the 'Track Status' page to search for your report anytime by entering your Ticket ID.",
      icon: Search,
      color: "bg-purple-500",
      textColor: "text-purple-500"
    },
    {
      number: 4,
      title: "Check Your Email",
      description: "You will receive email notifications at every stage - confirmation when submitted, updates when status changes, and final notification when resolved. Please check your inbox and spam folder.",
      icon: Mail,
      color: "bg-orange-500",
      textColor: "text-orange-500"
    },
    {
      number: 5,
      title: "Admin Reviews Report",
      description: "Our admin team reviews your report, verifies the location and severity, and assigns it for action. You'll receive email updates when status changes to 'In Progress'.",
      icon: UserCheck,
      color: "bg-indigo-500",
      textColor: "text-indigo-500"
    },
    {
      number: 6,
      title: "Issue Gets Resolved",
      description: "Once the road repair is completed, admin marks it as 'Resolved' and you'll receive a final confirmation email. You can verify the resolution status on the Track Status page.",
      icon: CheckCircle,
      color: "bg-teal-500",
      textColor: "text-teal-500"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use This Website
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Follow these simple steps to report road issues and track their resolution
          </p>
        </div>

        {/* Tutorial Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 group hover:-translate-y-1"
            >
              {/* Step Number Badge */}
              <div className={`absolute -top-4 -left-4 ${step.color} text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg`}>
                {step.number}
              </div>

              {/* Icon */}
              <div className={`${step.textColor} mb-4 mt-2`}>
                <step.icon size={48} strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {step.description}
              </p>

              {/* Connector Line (except for last item in row) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600"></div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-6 py-3 rounded-full">
            <CheckCircle size={20} />
            <span className="font-semibold">
              It's that simple! Start reporting issues and make Solapur's roads safer.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tutorial;
