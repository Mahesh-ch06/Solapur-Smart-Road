import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { signInWithMagicLink, resetPassword } from '@/services/authService';
import { toast } from 'sonner';
import { Lock, Mail, Eye, EyeOff, Shield, Send, KeyRound } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

// Allowed admin email
const ALLOWED_ADMIN_EMAIL = 'maheshch1094@gmail.com';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Check if email is authorized
    if (email !== ALLOWED_ADMIN_EMAIL) {
      toast.error('Access denied. Your email is not authorized for admin access.');
      return;
    }

    const success = await login(email, password);

    if (success) {
      toast.success('Welcome back!');
      navigate('/admin/orders');
    } else {
      toast.error('Invalid email or password');
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    // Check if email is authorized
    if (email !== ALLOWED_ADMIN_EMAIL) {
      toast.error('Access denied. Your email is not authorized for admin access.');
      return;
    }

    setIsSending(true);
    const { success } = await signInWithMagicLink(email);
    setIsSending(false);

    if (success) {
      toast.success('Magic link sent! Check your email to sign in.');
      setShowMagicLink(false);
    } else {
      toast.error('Failed to send magic link. Please try again.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    // Check if email is authorized
    if (email !== ALLOWED_ADMIN_EMAIL) {
      toast.error('Access denied. Your email is not authorized for admin access.');
      return;
    }

    setIsSending(true);
    const { error } = await resetPassword(email);
    setIsSending(false);

    if (!error) {
      toast.success('Password reset link sent! Check your email.');
      setShowForgotPassword(false);
    } else {
      toast.error('Failed to send reset link. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4 relative">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>
      
      <div className="card-elevated max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {showMagicLink ? 'Magic Link Login' : showForgotPassword ? 'Reset Password' : `Admin ${isSignUp ? 'Registration' : 'Login'}`}
          </h1>
          <p className="text-muted-foreground">
            {showMagicLink 
              ? 'Get a secure login link sent to your email'
              : showForgotPassword
              ? 'Enter your email to reset your password'
              : isSignUp 
              ? 'Create your admin account'
              : 'Sign in to access the admin panel'
            }
          </p>
        </div>

        {/* Magic Link Form */}
        {showMagicLink && (
          <form onSubmit={handleMagicLink} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maheshch1094@gmail.com"
                  className="input-field pl-10"
                  disabled={isSending}
                  autoComplete="email"
                />
              </div>
              {email && email !== ALLOWED_ADMIN_EMAIL && (
                <p className="text-xs text-destructive mt-1">
                  ⚠️ This email is not authorized for admin access
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="btn-hero-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Magic Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowMagicLink(false)}
              className="text-sm text-primary font-medium hover:underline w-full text-center"
            >
              Back to password login
            </button>
          </form>
        )}

        {/* Forgot Password Form */}
        {showForgotPassword && (
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maheshch1094@gmail.com"
                  className="input-field pl-10"
                  disabled={isSending}
                  autoComplete="email"
                />
              </div>
              {email && email !== ALLOWED_ADMIN_EMAIL && (
                <p className="text-xs text-destructive mt-1">
                  ⚠️ This email is not authorized for admin access
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="btn-hero-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="text-sm text-primary font-medium hover:underline w-full text-center"
            >
              Back to login
            </button>
          </form>
        )}

        {/* Regular Login Form */}
        {!showMagicLink && !showForgotPassword && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="input-field pl-10"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {email && email !== ALLOWED_ADMIN_EMAIL && (
                <p className="text-xs text-destructive mt-1">
                  ⚠️ This email is not authorized for admin access
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  disabled={loading}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 6 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-hero-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Alternate Login Options */}
        {!showMagicLink && !showForgotPassword && (
          <>
            <div className="mt-6 flex items-center justify-between text-sm">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-primary hover:underline font-medium"
              >
                Forgot password?
              </button>
              <button
                onClick={() => setShowMagicLink(true)}
                className="text-primary hover:underline font-medium"
              >
                Use magic link
              </button>
            </div>
          </>
        )}

        {/* Toggle Sign Up/Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Admin access is restricted to authorized personnel only
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-secondary/50 rounded-xl border border-border">
          <p className="text-xs text-muted-foreground text-center">
            🔒 Only <strong>maheshch1094@gmail.com</strong> is authorized for admin access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
