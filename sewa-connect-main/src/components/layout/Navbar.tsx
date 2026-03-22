import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Heart, LogOut, Plus, Building2, User, HandHeart, Settings, MapPin, Search, Shield, LayoutDashboard, Building, Users, Clock, ChevronDown, Bell, Mail, QrCode, ArrowUpRight, Navigation } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from '@/hooks/useAuth';
import { usePlatformStats } from '@/hooks/usePlatformStats';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/mode-toggle';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import api from '@/services/api';
import { toast } from 'sonner';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(localStorage.getItem('preferredCity') || 'Ahmedabad');
  const [cities, setCities] = useState<string[]>([]);
  const [citySearch, setCitySearch] = useState('');
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
  const { user, signOut, isSuperAdmin, isAdmin } = useAuth();
  const location = useLocation();
  const { stats, loading: loadingStats } = usePlatformStats();
  const [selectedCause, setSelectedCause] = useState('general');
  const navRef = useRef<HTMLElement>(null);

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Don't close if clicking inside a radix dropdown/dialog (portaled elements)
      if ((event.target as Element)?.closest('[role="dialog"], [role="menu"]')) {
        return;
      }
      if (isOpen && navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const { data: counts = { pendingCount: 0, volunteerPendingCount: 0, groupPendingCount: 0, inquiryPendingCount: 0 }, refetch: refetchCounts } = useQuery({
    queryKey: ['adminPendingCounts'],
    queryFn: async () => {
      try {
        const [orgsRes, inquiriesRes, volRes, groupRes] = await Promise.all([
          api.get('/organizations/pending'),
          api.get('/Contact?pendingOnly=true'),
          api.get('/volunteers/count-pending'),
          api.get('/Groups/count-pending')
        ]);
        return {
          pendingCount: orgsRes.data?.length || 0,
          inquiryPendingCount: inquiriesRes.data?.length || 0,
          volunteerPendingCount: volRes.data || 0,
          groupPendingCount: groupRes.data || 0
        };
      } catch (e) {
        console.error("Failed to fetch pending counts", e);
        return { pendingCount: 0, volunteerPendingCount: 0, groupPendingCount: 0, inquiryPendingCount: 0 };
      }
    },
    enabled: !!isSuperAdmin || user?.role === 'SuperAdmin',
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: 60000, 
  });

  const { pendingCount, volunteerPendingCount, groupPendingCount, inquiryPendingCount } = counts;

  useEffect(() => {
    // Clear manual location flag on app refresh so it auto-detects again
    localStorage.removeItem('userHasManuallySelectedCity');

    const fetchCities = async () => {
      try {
        const res = await api.get('/organizations/cities');
        const dbCities = res.data || [];
        setCities(dbCities);

        // Auto-detect location if not manually set
        if (!localStorage.getItem('userHasManuallySelectedCity')) {
          detectLocation(dbCities);
        }
      } catch (e) {
        console.error("Failed to fetch cities", e);
      }
    };
    fetchCities();
  }, []);

  const detectLocation = (dbCities: string[], silent: boolean = true) => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");
      return;
    }

    console.log("Detecting location...");
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        console.log(`Coords: ${latitude}, ${longitude}`);

        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=12&addressdetails=1`);
        const data = await response.json();
        console.log("Location Data:", data.address);

        // More robust city extraction from Nominatim
        const detectedCity = data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.suburb ||
          data.address.state_district ||
          data.address.county;

        console.log("Detected City (Raw):", detectedCity);

        if (detectedCity) {
          // Normalize for database matching
          const cleanDetected = detectedCity.replace(/\s+(City|District|Township)$/i, '').trim();

          // Find closest match in our DB
          const match = dbCities.find(c =>
            c.toLowerCase() === cleanDetected.toLowerCase() ||
            cleanDetected.toLowerCase().includes(c.toLowerCase()) ||
            c.toLowerCase().includes(cleanDetected.toLowerCase())
          );

          if (match) {
            console.log("Found match in DB:", match);
            setSelectedCity(match);
            if (!silent) toast.success(`Location detected: ${capitalize(match)}`);
          } else {
            console.log("No exact match in DB, using detected:", cleanDetected);
            setSelectedCity(cleanDetected);
            if (!silent) toast.success(`Location detected: ${capitalize(cleanDetected)}`);
          }
        }
      } catch (error) {
        console.error("Location detection failed:", error);
      }
    }, (error) => {
      console.warn("Geolocation permission denied or failed:", error.message);
      // If permission error, we don't bother the user with a toast, just use default/stored
    }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  };

  useEffect(() => {
    localStorage.setItem('preferredCity', selectedCity);
    window.dispatchEvent(new Event('cityChanged'));
  }, [selectedCity]);

  useEffect(() => {
    if (isSuperAdmin || user?.role === 'SuperAdmin') {
      const handleAdminUpdate = () => refetchCounts();
      window.addEventListener('adminCountsChanged', handleAdminUpdate);
      return () => window.removeEventListener('adminCountsChanged', handleAdminUpdate);
    }
  }, [isSuperAdmin, user, refetchCounts]);

  const handleManualReset = () => {
    localStorage.removeItem('userHasManuallySelectedCity');
    detectLocation(cities, false); // Not silent - show toast
    setIsCityDialogOpen(false);
  };

  const totalNotifications = pendingCount + volunteerPendingCount + groupPendingCount + inquiryPendingCount;

  const isActive = (path: string) => location.pathname === path;
  const getLinkClass = (path: string) =>
    `transition-colors ${isActive(path) ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`;

  const handleSignOut = () => {
    signOut();
    setIsOpen(false);
  };

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-b border-border transition-all duration-300"
      style={{
        height: 'calc(4rem + env(safe-area-inset-top, 0px))',
        paddingTop: 'env(safe-area-inset-top, 0px)'
      }}
    >
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-[4rem] gap-2 md:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform border border-border/50 bg-white p-1">
              <img src="/logo.png" alt="Sewa Connect Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold text-foreground leading-none">Sewa<span className="text-primary ml-0.5">Connect</span></span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-tight mt-0.5">Service Above Self</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/" className={getLinkClass('/')}>
              Home
            </Link>
            <Link to="/organizations" className={getLinkClass('/organizations')}>
              Organizations
            </Link>
            <Link to="/causes" className={getLinkClass('/causes')}>
              Causes
            </Link>
            <Link to="/transparency" className={getLinkClass('/transparency')}>
              Impact
            </Link>
            <Link to="/about" className={getLinkClass('/about')}>
              About
            </Link>
            <Link to="/volunteer/join" className={getLinkClass('/volunteer/join')}>
              {'Volunteer'}
            </Link>
            <Link to="/contact" className={getLinkClass('/contact')}>
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Global Donation QR */}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 gap-2 h-9 px-4 rounded-full font-bold">
                  <Heart className="w-4 h-4 fill-primary" />
                  Donate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[340px] p-8">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-bold">Support Sewa Connect</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-6 py-6 font-sans">
                  <div className="w-full space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Select a Cause (Optional)</Label>
                    <Select value={selectedCause} onValueChange={setSelectedCause}>
                      <SelectTrigger className="w-full bg-background border-border h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Sewa Fund</SelectItem>
                        <SelectItem value="animal_care">Animal Welfare</SelectItem>
                        <SelectItem value="education">Child Education</SelectItem>
                        <SelectItem value="medical_aid">Medical Relief</SelectItem>
                        <SelectItem value="old_age_home">Elderly Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-card rounded-3xl shadow-xl border border-border">
                    {stats?.upiQrImageUrl ? (
                      <img src={stats.upiQrImageUrl} alt="Platform QR" className="w-56 h-56 object-contain bg-white rounded-2xl" />
                    ) : (
                      <img src="/SewaQR.jpg" alt="Sewa General QR" className="w-56 h-56 object-contain bg-white rounded-2xl" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{stats?.upiId || 'sewaconnect@upi'}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                      {selectedCause === 'general' ? 'Platform General Fund' : `Fund for ${selectedCause.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`}
                    </p>
                  </div>
                  <Button className="w-full font-bold" onClick={() => {
                      const upi = stats?.upiId || "sewaconnect@upi";
                      const note = selectedCause === 'general' ? 'Sewa Connect Donation' : `Sewa Connect: ${selectedCause.replace('_', ' ')} donation`;
                      const params = new URLSearchParams({
                        pa: upi,
                        pn: 'Sewa Connect',
                        tn: note,
                        cu: 'INR'
                      });
                      const url = `upi://pay?${params.toString()}`;

                      if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                        toast.info("UPI App redirection works best on mobile.", {
                          description: "Please scan the QR code on desktop."
                        });
                        return;
                      }
                      window.location.href = url;
                  }}>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Pay with UPI App
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
              <DialogTrigger asChild>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border hover:bg-secondary/80 transition-colors cursor-pointer group">
                  <MapPin className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{capitalize(selectedCity)}</span>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0">
                  <DialogTitle>Select your city</DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleManualReset}
                    className="text-primary hover:text-primary/80 hover:bg-primary/5 gap-1.5 h-8 px-2 rounded-md font-bold text-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Auto Detect
                  </Button>
                </DialogHeader>
                <div className="relative my-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter city name..."
                    className="pl-10"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                  {cities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase())).sort().map(city => (
                    <div
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        localStorage.setItem('userHasManuallySelectedCity', 'true');
                        setIsCityDialogOpen(false);
                        setCitySearch('');
                      }}
                      className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${selectedCity.toLowerCase() === city.toLowerCase() ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'}`}
                    >
                      <span className="font-medium">{capitalize(city)}</span>
                      {selectedCity.toLowerCase() === city.toLowerCase() && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                  ))}
                  {cities.length === 0 && <div className="text-center py-4 text-muted-foreground">No cities found</div>}
                </div>
              </DialogContent>
            </Dialog>
            <ModeToggle />
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full relative">
                      <User className="w-5 h-5" />
                      {isSuperAdmin && totalNotifications > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold border-2 border-background animate-pulse">
                          {totalNotifications}
                        </span>
                      )}
                      <span className="sr-only">User menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    {user?.role === 'SuperAdmin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground uppercase tracking-wider">Administration</DropdownMenuLabel>

                        <DropdownMenuItem asChild>
                          <Link to="/admin/review" className="flex items-center justify-between cursor-pointer w-full">
                            <div className="flex items-center">
                              <Building2 className="w-4 h-4 mr-2" />
                              Review Organizations
                            </div>
                            {pendingCount > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full text-[10px]">
                                {pendingCount}
                              </Badge>
                            )}
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link to="/admin/volunteers" className="flex items-center justify-between cursor-pointer w-full">
                            <div className="flex items-center">
                              <Shield className="w-4 h-4 mr-2" />
                              Review Volunteers
                            </div>
                            {volunteerPendingCount > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full text-[10px]">
                                {volunteerPendingCount}
                              </Badge>
                            )}
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link to="/admin/inquiries" className="flex items-center justify-between cursor-pointer w-full">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              Manage Inquiries
                            </div>
                            {inquiryPendingCount > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full text-[10px]">
                                {inquiryPendingCount}
                              </Badge>
                            )}
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link to="/admin/groups" className="flex items-center justify-between cursor-pointer w-full">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              Review Sewa Groups
                            </div>
                            {groupPendingCount > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full text-[10px]">
                                {groupPendingCount}
                              </Badge>
                            )}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            )}
          </div>

          {/* Mobile Actions (Donate Button) */}
          <div className="lg:hidden flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 px-3 rounded-full border-primary text-primary hover:bg-primary/10 font-bold flex items-center gap-1.5 active:scale-95 transition-transform">
                  <Heart className="w-3.5 h-3.5 fill-primary" />
                  Donate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[340px] p-8">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-bold">Support Sewa Connect</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-6 py-6 font-sans">
                  <div className="w-full space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Select a Cause (Optional)</Label>
                    <Select value={selectedCause} onValueChange={setSelectedCause}>
                      <SelectTrigger className="w-full bg-background border-border h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Sewa Fund</SelectItem>
                        <SelectItem value="animal_care">Animal Welfare</SelectItem>
                        <SelectItem value="education">Child Education</SelectItem>
                        <SelectItem value="medical_aid">Medical Relief</SelectItem>
                        <SelectItem value="old_age_home">Elderly Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-card rounded-3xl shadow-xl border border-border">
                    {stats?.upiQrImageUrl ? (
                      <img src={stats.upiQrImageUrl} alt="Platform QR" className="w-56 h-56 object-contain bg-white rounded-2xl" />
                    ) : (
                      <img src="/SewaQR.jpg" alt="Sewa General QR" className="w-56 h-56 object-contain bg-white rounded-2xl" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{stats?.upiId || 'sewaconnect@upi'}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                      {selectedCause === 'general' ? 'Platform General Fund' : `Fund for ${selectedCause.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`}
                    </p>
                  </div>
                  <Button className="w-full font-bold" onClick={() => {
                      const upi = stats?.upiId || "sewaconnect@upi";
                      const note = selectedCause === 'general' ? 'Sewa Connect Donation' : `Sewa Connect: ${selectedCause.replace('_', ' ')} donation`;
                      const params = new URLSearchParams({
                        pa: upi,
                        pn: 'Sewa Connect',
                        tn: note,
                        cu: 'INR'
                      });
                      const url = `upi://pay?${params.toString()}`;

                      if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                        toast.info("UPI App redirection works best on mobile.", {
                          description: "Please scan the QR code on desktop."
                        });
                        return;
                      }
                      window.location.href = url;
                  }}>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Pay with UPI App
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <button
              className="p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-card border-b border-border py-2 animate-in slide-in-from-top duration-300 max-h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar">
          <div className="container mx-auto px-4 py-2 flex flex-col gap-1">
            {/* Mobile Location Selector */}
            <div
              onClick={() => {
                setIsCityDialogOpen(true);
                setIsOpen(false);
              }}
              className="flex items-center justify-between px-4 py-2 rounded-xl bg-secondary/50 border border-border cursor-pointer group active:scale-[0.98] transition-all mb-1"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Your Location</span>
                  <span className="text-sm font-bold text-foreground">{capitalize(selectedCity)}</span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>

            <Link
              to="/"
              className="py-1.5 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>

            <Link
              to="/causes"
              className="py-1.5 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Causes
            </Link>
            <Link
              to="/transparency"
              className="py-1.5 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Impact
            </Link>
            <Link
              to="/about"
              className="py-1.5 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>

            {isSuperAdmin && (
              <>
                <Link
                  to="/admin/review"
                  className="py-1.5 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between pl-4 border-l-2 border-primary/20"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4" /> Review Organizations
                  </div>
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full text-[10px]">
                      {pendingCount}
                    </Badge>
                  )}
                </Link>

                <Link
                  to="/admin/volunteers"
                  className="py-1.5 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between pl-4 border-l-2 border-primary/20"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4" /> Manage Volunteers
                  </div>
                  {volunteerPendingCount > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full text-[10px]">
                      {volunteerPendingCount}
                    </Badge>
                  )}
                </Link>

                <Link
                  to="/admin/inquiries"
                  className="py-1.5 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between pl-4 border-l-2 border-primary/20"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4" /> Manage Inquiries
                  </div>
                  {inquiryPendingCount > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full text-[10px]">
                      {inquiryPendingCount}
                    </Badge>
                  )}
                </Link>

                <Link
                  to="/admin/groups"
                  className="py-1.5 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-between pl-4 border-l-2 border-primary/20"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" /> Review Sewa Groups
                  </div>
                  {groupPendingCount > 0 && (
                    <Badge variant="destructive" className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full text-[10px]">
                      {groupPendingCount}
                    </Badge>
                  )}
                </Link>
              </>
            )}
            {/* Mobile Donation QR */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 gap-2 h-10 rounded-xl font-bold justify-start px-4 mt-1">
                  <Heart className="w-5 h-5 fill-primary" />
                  Support Platform
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[340px] p-8">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-bold">Support Sewa Connect</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-6 py-6 font-sans">
                  <div className="w-full space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Select a Cause (Optional)</Label>
                    <Select value={selectedCause} onValueChange={setSelectedCause}>
                      <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Sewa Fund</SelectItem>
                        <SelectItem value="animal_care">Animal Welfare</SelectItem>
                        <SelectItem value="education">Child Education</SelectItem>
                        <SelectItem value="medical_aid">Medical Relief</SelectItem>
                        <SelectItem value="old_age_home">Elderly Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-white rounded-3xl shadow-xl border border-slate-100">
                    {selectedCause === 'general' ? (
                      <img src="/SewaQR.jpg" alt="Sewa General QR" className="w-56 h-56 object-contain" />
                    ) : stats?.upiQrImageUrl ? (
                      <img src={stats.upiQrImageUrl} alt="Platform QR" className="w-56 h-56 object-contain" />
                    ) : (
                      <div className="w-56 h-56 bg-slate-100 flex items-center justify-center text-slate-400">
                        <QrCode className="w-12 h-12 mb-2" />
                        <span>QR not available</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{stats?.upiId || 'Loading...'}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                      {selectedCause === 'general' ? 'Platform General Fund' : `Fund for ${selectedCause.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`}
                    </p>
                  </div>
                  <Button className="w-full font-bold" onClick={() => {
                    if (stats?.upiId) {
                      const note = selectedCause === 'general' ? 'Sewa Connect Donation' : `Sewa Connect: ${selectedCause.replace('_', ' ')} donation`;
                      window.location.href = `upi://pay?pa=${stats.upiId}&pn=Sewa%20Connect&tn=${encodeURIComponent(note)}&cu=INR`;
                    }
                  }}>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Pay with UPI App
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Link
              to="/contact"
              className="py-1.5 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>

            <div className="flex items-center justify-between py-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <span>Theme</span>
              <ModeToggle />
            </div>

            <div className="pt-2 border-t border-border flex flex-col gap-1">
              {user ? (
                <>
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/organizations/add" onClick={() => setIsOpen(false)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Organization
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={handleSignOut} className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button asChild className="w-full">
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
