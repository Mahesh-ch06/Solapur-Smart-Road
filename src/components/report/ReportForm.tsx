import { useState, useRef, useEffect } from 'react';
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
  Upload,
  Mail,
  Shield
} from 'lucide-react';
import DraggableMap from '@/components/map/DraggableMap';
import { useReportStore, Severity } from '@/store/reportStore';
import { isNearExistingReport, formatCoords, reverseGeocode } from '@/utils/geolocation';
import { validateDescription } from '@/utils/profanityFilter';
import ThemeToggle from '@/components/ThemeToggle';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
const EMAILJS_OTP_TEMPLATE_ID = 'template_otp_verify'; // Create this template in EmailJS

const steps = [
  { id: 1, label: 'Verify Email', icon: Mail },
  { id: 2, label: 'Location', icon: MapPin },
  { id: 3, label: 'Details', icon: FileText },
  { id: 4, label: 'Photo', icon: Camera },
  { id: 5, label: 'Review', icon: Send },
];

const ReportForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { reports, addReport } = useReportStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Email verification
  const [userEmail, setUserEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  
  // Initialize EmailJS
  useEffect(() => {
    if (EMAILJS_PUBLIC_KEY) {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    }
  }, []);
  
  // Form data
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
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

  // Get nearby reports within 100m radius
  const getNearbyReports = () => {
    if (!location) return [];
    
    return reports
      .filter(report => {
        const distance = getDistance(
          location.lat,
          location.lng,
          report.latitude,
          report.longitude
        );
        return distance <= 100; // 100 meters
      })
      .map(report => ({
        latitude: report.latitude,
        longitude: report.longitude,
        ticketId: report.ticketId,
        status: report.status
      }));
  };

  // Calculate distance between two points (Haversine formula)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
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

  // OTP Functions
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOTP = async () => {
    if (!userEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate EmailJS configuration
    if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY) {
      toast.error('Email service is not configured. Please contact support.');
      console.error('EmailJS configuration missing');
      return;
    }

    setSendingOtp(true);
    const newOtp = generateOTP();
    setGeneratedOtp(newOtp);

    try {
      // Send OTP via EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_OTP_TEMPLATE_ID,
        {
          to_email: userEmail,
          to_name: userEmail.split('@')[0],
          otp_code: newOtp,
          app_name: 'Solapur Road Rescuer',
        }
      );
      
      toast.success(`OTP sent to ${userEmail}`, {
        description: 'Please check your email for the verification code',
        duration: 5000,
      });
      
      setOtpSent(true);
      setSendingOtp(false);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
      setGeneratedOtp('');
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP');
      return;
    }

    setVerifyingOtp(true);

    // Simulate verification delay
    setTimeout(() => {
      if (otp === generatedOtp) {
        setIsEmailVerified(true);
        toast.success('Email verified successfully!', {
          description: 'You can now proceed with your report',
        });
        setVerifyingOtp(false);
        // Auto-advance to next step after 1 second
        setTimeout(() => {
          setCurrentStep(2);
        }, 1000);
      } else {
        toast.error('Invalid OTP', {
          description: 'Please check the code and try again',
        });
        setVerifyingOtp(false);
      }
    }, 1000);
  };

  const handleNext = () => {
    // Step 1: Email Verification
    if (currentStep === 1) {
      if (!isEmailVerified) {
        toast.error('Please verify your email to continue');
        return;
      }
    }
    
    // Step 2: Location
    if (currentStep === 2 && !location) {
      toast.error('Please set your location');
      return;
    }
    
    // Step 3: Details (Description)
    if (currentStep === 3) {
      if (!description.trim()) {
        toast.error('Please provide a description');
        return;
      }
      // Validate description (checks profanity and special characters)
      const validation = validateDescription(description, 'Description');
      if (!validation.isValid) {
        toast.error(validation.error, {
          description: 'Only letters, numbers, and basic punctuation (. , ! ? - \' ") are allowed.',
          duration: 5000,
        });
        return;
      }
    }
    
    // Step 4: Photo
    if (currentStep === 4 && !photo) {
      toast.error('Please upload a photo of the issue');
      return;
    }
    
    setCurrentStep((prev) => Math.min(prev + 1, 5));
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

    // Prevent double submission
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    toast.loading('Submitting report...', { id: 'submit-report' });

    try {
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
      toast.dismiss('submit-report');
      
      if (userEmail || userPhone) {
        toast.success('Report submitted! You will receive notifications about status updates.');
      } else {
        toast.success('Report submitted successfully!');
      }
    } catch (error) {
      toast.dismiss('submit-report');
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/40 pb-36 pt-2 sm:pt-4">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-semibold text-foreground">Report a Pothole</h1>
                <p className="text-sm text-muted-foreground">Step {currentStep} of 5</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="bg-card/90 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between max-w-lg mx-auto gap-2 overflow-x-auto">
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
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Report guide</p>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground">Finish in 5 quick steps</h2>
                <p className="text-xs text-muted-foreground">We keep you updated via verified email and Ticket ID.</p>
              </div>
              <div className="text-xs text-muted-foreground text-right hidden sm:block">
                <p>GPS required for accurate location</p>
                <p>Photo is mandatory</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-xl px-3 py-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Pin exact spot</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-xl px-3 py-2">
                <Camera className="w-4 h-4 text-primary" />
                <span>Photo required</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-xl px-3 py-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>OTP-verified email</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] sm:text-xs text-muted-foreground">
              {steps.map((step) => (
                <div key={step.id} className={`rounded-xl px-3 py-2 border ${currentStep === step.id ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-secondary/50'}`}>
                  <div className="flex items-center gap-2">
                    <step.icon className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{step.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Email Verification */}
          {currentStep === 1 && (
            <div className="animate-fade-in bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Verify Your Email</h2>
                  <p className="text-muted-foreground text-sm">We send updates and the OTP here. Use the same email for tracking later.</p>
                </div>
                <div className="text-[11px] text-muted-foreground bg-secondary/70 border border-border rounded-lg px-3 py-2">
                  <p className="font-semibold text-foreground">Why required?</p>
                  <p>Prevents duplicate/false reports and lets us notify you.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    disabled={isEmailVerified}
                    placeholder="your.email@example.com"
                    className="input-field h-11"
                  />
                  <p className="text-xs text-muted-foreground">Tip: Check spam/promotions if you do not see the code in 30 seconds.</p>
                </div>

                {!otpSent && !isEmailVerified && (
                  <button
                    onClick={handleSendOTP}
                    disabled={sendingOtp}
                    className="btn-hero-primary w-full justify-center h-11"
                  >
                    {sendingOtp ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Send OTP
                      </>
                    )}
                  </button>
                )}

                {otpSent && !isEmailVerified && (
                  <div className="grid gap-3">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Enter OTP <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit code"
                        className="input-field text-center text-lg tracking-wider h-12"
                        maxLength={6}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={handleVerifyOTP}
                        disabled={verifyingOtp || otp.length !== 6}
                        className="btn-hero-primary flex-1 justify-center h-11"
                      >
                        {verifyingOtp ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Shield className="w-5 h-5" />
                            Verify OTP
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleSendOTP}
                        disabled={sendingOtp}
                        className="flex-1 h-11 border border-border rounded-xl text-sm font-medium text-primary hover:bg-secondary"
                      >
                        Resend OTP
                      </button>
                    </div>

                    <div className="text-xs text-muted-foreground bg-secondary/60 border border-border rounded-xl px-3 py-2">
                      <p>Use the same email on the Track page to see all your reports.</p>
                    </div>
                  </div>
                )}

                {isEmailVerified && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-center gap-3">
                    <Check className="w-5 h-5 text-success" />
                    <div>
                      <p className="text-sm font-medium text-success">Email Verified!</p>
                      <p className="text-xs text-success/70">{userEmail}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="animate-fade-in bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                GPS Location
              </h2>
              <p className="text-muted-foreground mb-6">
                Using your current GPS location to report the issue
              </p>
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-xl px-3 py-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Drag the pin to the exact spot</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-xl px-3 py-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Keep GPS on for better accuracy</span>
                </div>
              </div>
              
              <DraggableMap 
                onPositionChange={handleLocationChange}
                nearbyReports={getNearbyReports()}
                showAccuracyCircle={true}
                gpsOnly={true}
              />
              
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
                  <p className="text-xs text-muted-foreground">If the address looks off, drag slightly until it matches the street.</p>
                  {getNearbyReports().length > 0 && (
                    <div className="flex items-center gap-2 mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        {getNearbyReports().length} existing {getNearbyReports().length === 1 ? 'report' : 'reports'} found nearby
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div className="animate-fade-in bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
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
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>Be specific: size, lane, nearby landmark.</span>
                    <span>{description.length}/300</span>
                  </div>
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
                  <p className="text-xs text-muted-foreground mt-2">High = deep hole or traffic risk • Medium = uneven patch • Low = cosmetic/starting wear.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Photo */}
          {currentStep === 4 && (
            <div className="animate-fade-in bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Add Photo <span className="text-destructive">*</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                A photo is required to help our team assess the damage
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-xl px-3 py-2">
                  <Camera className="w-4 h-4 text-primary" />
                  <span>Good lighting</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-xl px-3 py-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Show surrounding road</span>
                </div>
                <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-xl px-3 py-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  <span>Stay safe from traffic</span>
                </div>
              </div>
              
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
                    className="w-full h-64 object-cover rounded-xl border border-border/70"
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 text-white rounded-xl px-3 py-2 text-xs">
                    <span>Looks clear? If not, retake.</span>
                    <button
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="underline"
                    >
                      Retake
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-64 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all bg-secondary/50"
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

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="animate-fade-in bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Review & Submit
              </h2>
              <p className="text-muted-foreground mb-6">
                Verify the details before submitting
              </p>
              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                <button onClick={() => setCurrentStep(2)} className="px-3 py-2 rounded-lg border border-border hover:border-primary/40">Edit location</button>
                <button onClick={() => setCurrentStep(3)} className="px-3 py-2 rounded-lg border border-border hover:border-primary/40">Edit details</button>
                <button onClick={() => setCurrentStep(4)} className="px-3 py-2 rounded-lg border border-border hover:border-primary/40">Edit photo</button>
              </div>
              
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
                <div className="card-elevated bg-success/5 border-success/20">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    Contact Information (Verified)
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        Email Address <span className="text-success">(Verified)</span>
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        disabled
                        className="input-field text-sm bg-muted/50 cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        ✓ You will receive status updates at this email
                      </p>
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
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border p-4 z-50 safe-area-bottom shadow-lg">
        <div className="container mx-auto">
          <div className="max-w-md mx-auto flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 py-3 px-6 rounded-xl border-2 border-border font-medium text-foreground hover:bg-secondary transition-colors touch-manipulation"
              >
                Back
              </button>
            )}
            
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="flex-1 btn-hero-primary justify-center py-3 touch-manipulation"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                type="button"
                disabled={isSubmitting}
                className="flex-1 btn-hero-primary justify-center py-3 bg-success hover:bg-success/90 touch-manipulation active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Report
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;
