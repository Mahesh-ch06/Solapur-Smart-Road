import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  Map, 
  ClipboardList, 
  Menu, 
  X, 
  MapPin,
  LogOut,
  User,
  KeyRound,
  Shield,
  MessageSquare
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/map', icon: Map, label: 'Live Map' },
  { path: '/admin/orders', icon: ClipboardList, label: 'Work Orders' },
  { path: '/admin/support', icon: MessageSquare, label: 'Support Tickets' },
  { path: '/admin/audit-logs', icon: Shield, label: 'Audit Logs' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-200 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 bg-sidebar-primary rounded-lg">
                <MapPin className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold text-sidebar-foreground">Smart Road Fix</div>
                <div className="text-xs text-sidebar-foreground/60">Admin Panel</div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            {/* User Info */}
            {user && (
              <div className="px-4 py-2 bg-sidebar-accent/50 rounded-lg mb-2">
                <div className="flex items-center gap-2 text-xs text-sidebar-foreground/70">
                  <User className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            )}
            
            <Link
              to="/admin/reset-password"
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
            >
              <KeyRound className="w-5 h-5" />
              <span className="font-medium">Change Password</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
            
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
            >
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Exit to Public Site</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-secondary rounded-lg lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">System Online</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
