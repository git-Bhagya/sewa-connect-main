import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, Users, User, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function BottomNav() {
    const location = useLocation();
    const { user } = useAuth();

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const navItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Organization', path: '/organizations', icon: Building2 },
        { name: 'Impact', path: '/transparency', icon: Heart },
        { name: 'Volunteer', path: '/volunteer/join', icon: Users },
        { name: 'Profile', path: user ? '/profile' : '/auth', icon: User },
    ];

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-[100] w-full bg-card/95 backdrop-blur-lg border-t border-border flex justify-around items-center lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
            style={{
                height: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)'
            }}
        >
            {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center justify-center w-full h-[4rem] transition-colors ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <div className="flex flex-col items-center justify-center space-y-1 w-full">
                            <Icon className={`w-6 h-6 ${active ? 'fill-primary/20 bg-primary/10 rounded-full p-1 shadow-sm' : 'p-1'}`} />
                            <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide mt-1">{item.name}</span>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
