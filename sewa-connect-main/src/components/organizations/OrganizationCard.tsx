import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MapPin, Phone, Building2, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Organization, SECTOR_ICONS, SECTOR_LABELS } from '@/types/organization';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { toast } from 'sonner';


interface OrganizationCardProps {
  organization: Organization;
  isFavoriteInitial?: boolean;
}

export function OrganizationCard({ organization, isFavoriteInitial }: OrganizationCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial ?? false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isDonating, setIsDonating] = useState(false);

  useEffect(() => {
    if (isFavoriteInitial !== undefined) {
      setIsFavorite(isFavoriteInitial);
    }
  }, [isFavoriteInitial]);

  useEffect(() => {
    if (user && organization.id && isFavoriteInitial === undefined) {
      checkIfFavorite();
    }
  }, [user, organization.id, isFavoriteInitial]);

  const checkIfFavorite = async () => {
    try {
      const { data: favorites } = await api.get('/Favorites');
      if (Array.isArray(favorites)) {
        setIsFavorite(favorites.includes(Number(organization.id)));
      }
    } catch (e) {
      console.error("Failed to fetch favorites", e);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/auth', { state: { from: location } });
      return;
    }

    setFavoriteLoading(true);
    try {
      const { data } = await api.post(`/Favorites/${organization.id}`);
      setIsFavorite(data.isFavorite);
      toast.success(data.isFavorite ? "Added to favorites" : "Removed from favorites");
    } catch (e) {
      toast.error("Failed to update favorite");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleDonate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/auth', { state: { from: location } });
      return;
    }

    navigate('/payment', {
      state: {
        amount: 500,
        sector: organization.sector,
        organizationId: organization.id,
        name: organization.name
      }
    });

    setIsDonating(false);
  };

  return (
    <div className="bg-card rounded-xl md:rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 border border-border group flex flex-col h-full">
      {/* Image */}
      <div className="relative h-32 md:h-48 bg-muted overflow-hidden shrink-0">
        {organization.image_url ? (
          <img
            src={organization.image_url}
            alt={organization.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <Building2 className="w-10 h-10 md:w-16 md:h-16 text-muted-foreground/40" />
          </div>
        )}

        {/* Top Badges Container */}
        <div className="absolute top-2 left-2 right-2 md:top-4 md:left-4 md:right-4 flex items-start justify-between gap-2 pointer-events-none overflow-hidden">
          {/* Sector Badge */}
          <div className="bg-card/90 backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-sm font-medium flex items-center gap-1.5 md:gap-2 shadow-sm shrink max-w-[50%]">
            <span className="text-xs md:text-base shrink-0">{SECTOR_ICONS[organization.sector]}</span>
            <span className="text-foreground truncate">{SECTOR_LABELS[organization.sector]}</span>
          </div>

          {/* Urgent Help Badge */}
          {organization.requirements?.some(r => r.isActive) && (
            <div className="bg-red-600/90 text-white backdrop-blur-sm px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-sm font-bold flex items-center gap-1 shadow-sm animate-pulse shrink max-w-[45%]">
              <span className="truncate">
                {organization.requirements.filter(r => r.isActive)[0].type} Needed
              </span>
            </div>
          )}
        </div>

        {/* City Badge (Bottom Left of Image) */}
        <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 bg-black/50 text-white backdrop-blur-sm px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[10px] md:text-xs font-semibold flex items-center gap-1 border border-white/20 pointer-events-none">
          <MapPin className="w-3 h-3" />
          <span className="truncate max-w-[80px] md:max-w-[120px]">{organization.city.charAt(0).toUpperCase() + organization.city.slice(1).toLowerCase()}</span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          disabled={favoriteLoading}
          className={`absolute bottom-2 right-2 md:bottom-4 md:right-4 h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-md ${isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-600 hover:text-red-500'}`}
        >
          {favoriteLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite ? 'fill-current' : ''}`} />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-3 md:p-6 flex flex-col flex-grow">
        <h3 className="font-serif text-sm md:text-xl font-semibold text-foreground mb-1 md:mb-2 line-clamp-1 flex items-center gap-2">
          {organization.name}
          {organization.city === localStorage.getItem('preferredCity') && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-sans uppercase tracking-wider">Local</span>
          )}
        </h3>

        {organization.description && (
          <p className="text-muted-foreground text-xs md:text-sm mb-2 md:mb-4 line-clamp-2">
            {organization.description}
          </p>
        )}

        <div className="space-y-1 md:space-y-2 mb-3 md:mb-4 flex-grow">
          {organization.contact_phone && (
            <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted-foreground">
              <Phone className="w-3 h-3 md:w-4 md:h-4 text-primary shrink-0" />
              <span>{organization.contact_phone}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-auto">
          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs md:h-9 md:text-sm px-2" asChild>
            <Link to={`/organizations/${organization.id}`}>View</Link>
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8 text-xs md:h-9 md:text-sm px-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleDonate}
            disabled={isDonating}
          >
            {isDonating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Donate
          </Button>
        </div>
      </div>
    </div>
  );
}
