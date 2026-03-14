import { Heart, Mail, Phone, HandHeart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Footer() {
  const location = useLocation();

  if (location.pathname !== '/') {
    return null;
  }

  return (
    <footer className="bg-slate-50 text-foreground dark:bg-black dark:text-white py-16 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <HandHeart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-2xl font-bold">Sewa</span>
            </Link>
            <p className="text-muted-foreground dark:text-white/70 text-sm leading-relaxed">
              Connecting hearts with causes. Discover, support, and make a difference with trusted non-profit organizations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground dark:text-white/70">
              <li>
                <Link to="/" className="hover:text-primary dark:hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/organizations" className="hover:text-primary dark:hover:text-white transition-colors">Organizations</Link>
              </li>
              <li>
                <Link to="/#about" className="hover:text-primary dark:hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/#sectors" className="hover:text-primary dark:hover:text-white transition-colors">Sectors</Link>
              </li>
            </ul>
          </div>

          {/* Sectors */}
          <div>
            <h4 className="font-semibold mb-4">Sectors</h4>
            <ul className="space-y-2 text-sm text-muted-foreground dark:text-white/70">
              <li>Old Age Homes</li>
              <li>Cow Shelters</li>
              <li>Orphanages</li>
              <li>Education Support</li>
              <li>Medical Aid</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground dark:text-white/50">
          <p>© {new Date().getFullYear()} Sewa. Made with ❤️ for social good.</p>
        </div>
      </div>
    </footer>
  );
}
