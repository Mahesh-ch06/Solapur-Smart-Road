import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  MapPin, 
  FileText, 
  Camera, 
  Send, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  AlertTriangle,
  Upload
} from 'lucide-react';
import DraggableMap from '@/components/map/DraggableMap';
import { useReportStore, Severity } from '@/store/reportStore';
import { isNearExistingReport, formatCoords, reverseGeocode } from '@/utils/geolocation';
import ThemeToggle from '@/components/ThemeToggle';

const steps = [
  { id: 1, label: 'Location', icon: MapPin },
  { id: 2, label: 'Details', icon: FileText },
  { id: 3, label: 'Photo', icon: Camera },
  { id: 4, label: 'Submit', icon: Send },
];

const ReportForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { reports, addReport } = useReportStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  
  // Form data
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');

  const handleLocationChange = async (lat: number, lng: number) => {
    setLocation({ lat, lng });
    
    // Fetch address
    setLoadingAddress(true);
    const fetchedAddress = await reverseGeocode(lat, lng);
    setAddress(fetchedAddress);
    setLoadingAddress(false);
    
    // Check for nearby reports
    if (isNearExistingReport(lat, lng, reports)) {
      toast.warning('Warning: A report already exists nearby', {
        description: 'Consider checking existing reports before submitting',
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhoto(base64);
        setPhotoPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !location) {
      toast.error('Please set your location');
      return;
    }
    if (currentStep === 2 && !description.trim()) {
      toast.error('Please provide a description');
      return;
    }
    if (currentStep === 3 && !photo) {
      toast.error('Please upload a photo of the issue');
      return;
    }
    if (currentStep === 4 && !userEmail.trim()) {
      toast.error('Email is required to receive status updates');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!location) return;
    
    if (!userEmail.trim()) {
      toast.error('Email is required to receive status updates');
      return;
    }
    
    if (!photo) {
      toast.error('Photo is required. Please go back and upload a photo.');
      return;
    }
    
    const ticketId = await addReport({
      latitude: location.lat,
      longitude: location.lng,
      address: address || undefined,
      description,
      severity,
      photo: photo || undefined,
      userEmail: userEmail || undefined,
      userPhone: userPhone || undefined,
    });
    
    setSubmittedTicketId(ticketId);
    
    if (userEmail || userPhone) {
      toast.success('Report submitted! You will receive notifications about status updates.');
    } else {
      toast.success('Report submitted successfully!');
    }
  };

  if (submittedTicketId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card-elevated max-w-md w-full text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-success" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Report Submitted!
          </h2>
          
          <p className="text-muted-foreground mb-6">
            Your report has been received and will be processed soon.
          </p>
          
          <div className="bg-primary/10 rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Your Ticket ID</p>
            <p className="text-2xl font-bold text-primary">#{submittedTicketId}</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/')}
              className="btn-hero-primary w-full justify-center"
            >
              Back to Home
            </button>
            <button
              onClick={() => {
                setSubmittedTicketId(null);
                setCurrentStep(1);
                setLocation(null);
                setDescription('');
                setSeverity('medium');
                setPhoto(null);
                setPhotoPreview(null);
              }}
              className="text-sm text-primary font-medium hover:underline"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-semibold text-foreground">Report Pothole</h1>
                <p className="text-sm text-muted-foreground">Step {currentStep} of 4</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={
                    currentStep > step.id
                      ? 'step-complete'
                      : currentStep === step.id
                      ? 'step-active'
                      : 'step-pending'
                  }
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-12 h-0.5 mx-1 ${
                      currentStep > step.id ? 'bg-success' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Step 1: Location */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Set Location
              </h2>
              <p className="text-muted-foreground mb-6">
                Drag the pin to mark the exact pothole location
              </p>
              
              <DraggableMap onPositionChange={handleLocationChange} />
              
              {location && (
                <div className="mt-4 p-4 bg-secondary rounded-xl space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected Location</p>
                    {loadingAddress ? (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground">Finding address...</p>
                      </div>
                    ) : (
                      <p className="font-medium text-foreground">{address}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCoords(location.lat, location.lng)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Describe the Issue
              </h2>
              <p className="text-muted-foreground mb-6">
                Provide details about the road damage
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the pothole size, location details..."
                    rows={4}
                    className="input-field resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Severity Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['low', 'medium', 'high'] as Severity[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => setSeverity(level)}
                        className={`p-3 rounded-xl border-2 transition-all capitalize font-medium ${
                          severity === level
                            ? level === 'high'
                              ? 'border-destructive bg-destructive/10 text-destructive'
                              : level === 'medium'
                              ? 'border-warning bg-warning/10 text-warning'
                              : 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                        }`}
                      >
                        {level === 'high' && <AlertTriangle className="w-4 h-4 mx-auto mb-1" />}
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Photo */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Add Photo <span className="text-destructive">*</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                A photo is required to help our team assess the damage
              </p>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
              
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Pothole preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute top-3 right-3 p-2 bg-card/90 rounded-full shadow-lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-64 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Camera className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Take or Upload Photo <span className="text-destructive">*</span></p>
                    <p className="text-sm text-muted-foreground">Required - Photo evidence needed</p>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Review & Submit
              </h2>
              <p className="text-muted-foreground mb-6">
                Verify the details before submitting
              </p>
              
              <div className="space-y-4">
                <div className="card-elevated">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Location</p>
                      {loadingAddress ? (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          <p className="text-sm text-muted-foreground">Finding address...</p>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium text-foreground">
                            {address || (location ? formatCoords(location.lat, location.lng) : 'Not set')}
                          </p>
                          {address && location && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatCoords(location.lat, location.lng)}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="card-elevated">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="font-medium text-foreground">{description || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="card-elevated">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                      severity === 'high' ? 'text-destructive' :
                      severity === 'medium' ? 'text-warning' : 'text-primary'
                    }`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Severity</p>
                      <p className="font-medium text-foreground capitalize">{severity}</p>
                    </div>
                  </div>
                </div>
                
                {photoPreview && (
                  <div className="card-elevated p-0 overflow-hidden">
                    <img
                      src={photoPreview}
                      alt="Pothole"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
                
                {/* Contact Information for Notifications */}
                <div className="card-elevated bg-primary/5 border-primary/20">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Get Status Updates <span className="text-destructive">*</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Email is required to receive notifications when your report status changes
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Email Address <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="input-field text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Phone Number (for SMS - Optional)
                      </label>
                      <input
                        type="tel"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="input-field text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="container mx-auto">
          <div className="max-w-md mx-auto flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 px-6 rounded-xl border-2 border-border font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Back
              </button>
            )}
            
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex-1 btn-hero-primary justify-center py-3"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 btn-hero-primary justify-center py-3 bg-success hover:bg-success/90"
              >
                <Send className="w-5 h-5" />
                Submit Report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;
