import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Allowed admin email
const ALLOWED_ADMIN_EMAIL = 'maheshch1094@gmail.com';

/**
 * Protects routes requiring authentication
 * Redirects to login if user is not authenticated
 * Only allows specific admin email
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, initialized, checkAuth, logout } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!initialized) {
      checkAuth();
    }
  }, [initialized, checkAuth]);

  // Show loading state while checking authentication
  if (!initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Check if user email is authorized
  if (user.email !== ALLOWED_ADMIN_EMAIL) {
    // Logout unauthorized user
    logout();
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card-elevated max-w-md w-full text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            Your account ({user.email}) is not authorized to access the admin panel.
          </p>
          <a
            href="/admin/login"
            className="btn-hero-primary inline-flex justify-center"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized, render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
