import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-sidebar text-sidebar-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sidebar-primary rounded-lg">
              <MapPin className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold">Solapur Smart Road Fix</div>
              <div className="text-sm text-sidebar-foreground/70">
                Municipal Corporation Initiative
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link to="/report" className="hover:text-sidebar-primary transition-colors">
              Report Issue
            </Link>
            <Link to="/track" className="hover:text-sidebar-primary transition-colors">
              Track Status
            </Link>
            <Link to="/admin" className="hover:text-sidebar-primary transition-colors">
              Admin
            </Link>
          </div>
          
          <div className="text-sm text-sidebar-foreground/70 text-center md:text-right">
            <p>© 2024 Solapur Municipal Corporation</p>
            <p>All rights reserved</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
