import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SupabaseDataLoader from "./components/SupabaseDataLoader";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Report from "./pages/Report";
import Track from "./pages/Track";
import ContactUs from "./pages/ContactUs";
import NotFound from "./pages/NotFound";
import { APP_VERSION } from "./lib/version";

// Lazy load admin routes to reduce initial bundle size
const AdminLogin = lazy(() => import("./components/admin/AdminLogin"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminMap = lazy(() => import("./pages/AdminMap"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const AdminAuditLogs = lazy(() => import("./pages/AdminAuditLogs"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SupabaseDataLoader />
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/report" element={<Report />} />
          <Route path="/track" element={<Track />} />
          <Route path="/contact" element={<ContactUs />} />
          
          {/* Admin Login - Public Route */}
          <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={<Suspense fallback={<PageLoader />}><ProtectedRoute><Admin /></ProtectedRoute></Suspense>} />
          <Route path="/admin/map" element={<Suspense fallback={<PageLoader />}><ProtectedRoute><AdminMap /></ProtectedRoute></Suspense>} />
          <Route path="/admin/orders" element={<Suspense fallback={<PageLoader />}><ProtectedRoute><AdminOrders /></ProtectedRoute></Suspense>} />
          <Route path="/admin/audit-logs" element={<Suspense fallback={<PageLoader />}><ProtectedRoute><AdminAuditLogs /></ProtectedRoute></Suspense>} />
          <Route path="/admin/reset-password" element={<Suspense fallback={<PageLoader />}><ProtectedRoute><ResetPassword /></ProtectedRoute></Suspense>} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
