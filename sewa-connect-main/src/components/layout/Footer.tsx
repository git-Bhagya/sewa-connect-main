import { Heart, Mail, Phone, MapPin, HandHeart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
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
            <p className="text-background/70 text-sm leading-relaxed">
              Connecting hearts with causes. Discover, support, and make a difference with trusted non-profit organizations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <Link to="/" className="hover:text-background transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/organizations" className="hover:text-background transition-colors">Organizations</Link>
              </li>
              <li>
                <Link to="/#about" className="hover:text-background transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/#sectors" className="hover:text-background transition-colors">Sectors</Link>
              </li>
            </ul>
          </div>

          {/* Sectors */}
          <div>
            <h4 className="font-semibold mb-4">Sectors</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>Old Age Homes</li>
              <li>Cow Shelters</li>
              <li>Orphanages</li>
              <li>Education Support</li>
              <li>Medical Aid</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:bhagyapatel832002@gmail.com" className="hover:text-background transition-colors">bhagyapatel832002@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+919316025425" className="hover:text-background transition-colors">+91 93160 25425</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Ahmedabad, Gujarat, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/20 text-center text-sm text-background/50">
          <p>© {new Date().getFullYear()} Sewa. Made with ❤️ for social good.</p>
        </div>
      </div>
    </footer>
  );
}
