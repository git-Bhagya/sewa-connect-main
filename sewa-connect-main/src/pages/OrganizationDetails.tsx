
import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Globe, Share2, Heart, Loader2, Search, X } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Organization, mapApiToOrganization, SECTOR_LABELS, SECTOR_ICONS } from '@/types/organization';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { RequirementsManager } from '@/components/organizations/RequirementsManager';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function OrganizationDetails() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [donors, setDonors] = useState<any[]>([]);
    const [donorsLoading, setDonorsLoading] = useState(true);
    const [donorSearchTerm, setDonorSearchTerm] = useState('');

    const fetchOrganization = async () => {
        try {
            const response = await api.get(`/organizations/${id}`);
            const orgData = mapApiToOrganization(response.data);
            setOrganization(orgData);
            if (user) {
                checkIfFavorite();
            }
            fetchDonors();
        } catch (error) {
            console.error('Error fetching organization details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDonors = async () => {
        try {
            const response = await api.get(`/donations/organization/${id}`);
            setDonors(response.data);
        } catch (error) {
            console.error('Error fetching donors:', error);
        } finally {
            setDonorsLoading(false);
        }
    };

    const checkIfFavorite = async () => {
        try {
            const { data: favorites } = await api.get('/Favorites');
            if (Array.isArray(favorites) && id) {
                setIsFavorite(favorites.includes(Number(id)));
            }
        } catch (e) {
            console.error("Failed to fetch favorites", e);
        }
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) {
            navigate('/auth', { state: { from: location } });
            return;
        }

        setFavoriteLoading(true);
        try {
            const { data } = await api.post(`/Favorites/${id}`);
            setIsFavorite(data.isFavorite);
            toast.success(data.isFavorite ? "Added to favorites" : "Removed from favorites");
        } catch (e) {
            toast.error("Failed to update favorite");
        } finally {
            setFavoriteLoading(false);
        }
    };

    const handleRazorpayPayment = async (amount: number) => {
        if (!user) {
            toast.error("Please login to donate");
            navigate('/auth', { state: { from: location } });
            return;
        }

        navigate('/payment', {
            state: {
                amount: amount,
                sector: organization?.sector,
                organizationId: organization?.id,
                name: organization?.name
            }
        });
    };

    useEffect(() => {
        if (id) {
            fetchOrganization();
        }
    }, [id, user]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <h2 className="text-2xl font-bold mb-4">Organization Not Found</h2>
                    <Button asChild>
                        <Link to="/organizations">Back to Organizations</Link>
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    const allImages = organization.image_url
        ? [organization.image_url, ...organization.images]
        : organization.images;

    // Deduplicate images just in case
    const uniqueImages = [...new Set(allImages)];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4">
                    {/* Back Button */}
                    <Link
                        to="/organizations"
                        className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Organizations
                    </Link>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Image Carousel */}
                            <div className="rounded-2xl overflow-hidden bg-card border border-border">
                                {uniqueImages.length > 0 ? (
                                    <Carousel
                                        className="w-full"
                                        plugins={[
                                            Autoplay({
                                                delay: 4000,
                                            }),
                                        ]}
                                    >
                                        <CarouselContent>
                                            {uniqueImages.map((img, index) => (
                                                <CarouselItem key={index}>
                                                    <div className="aspect-video relative overflow-hidden">
                                                        <img
                                                            src={img}
                                                            alt={`${organization.name} - Image ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        {uniqueImages.length > 1 && (
                                            <>
                                                <CarouselPrevious className="left-4" />
                                                <CarouselNext className="right-4" />
                                            </>
                                        )}
                                    </Carousel>
                                ) : (
                                    <div className="aspect-video bg-muted flex items-center justify-center">
                                        <span className="text-muted-foreground">No images available</span>
                                    </div>
                                )}
                            </div>
                            {/* Title & Description */}
                            <div>
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <Badge variant="secondary" className="mb-3">
                                            <span className="mr-2">{SECTOR_ICONS[organization.sector]}</span>
                                            {SECTOR_LABELS[organization.sector]}
                                        </Badge>
                                        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                                            {organization.name}
                                        </h1>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={toggleFavorite}
                                            disabled={favoriteLoading}
                                            className={`transition-all ${isFavorite ? 'bg-red-50 text-red-500 border-red-200' : ''}`}
                                        >
                                            {favoriteLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                                            )}
                                        </Button>
                                        <Button variant="outline" size="icon">
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
                                    {organization.city && (
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1 stroke-[1.5]" />
                                            {organization.city}, {organization.state}
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                                        Verified Organization
                                    </div>
                                </div>

                                <div className="prose prose-stone dark:prose-invert max-w-none">
                                    <h3 className="text-xl font-semibold mb-2">About</h3>
                                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                        {organization.description || "No description provided."}
                                    </p>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="bg-card rounded-2xl p-6 border border-border">
                                <h3 className="font-serif text-xl font-bold mb-4">Contact Information</h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {organization.contact_phone && (
                                        <div className="flex items-center p-3 bg-background rounded-lg border border-border/50">
                                            <Phone className="w-5 h-5 text-primary mr-3" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">Phone</div>
                                                <div className="font-medium">{organization.contact_phone}</div>
                                            </div>
                                        </div>
                                    )}
                                    {organization.contact_email && (
                                        <div className="flex items-center p-3 bg-background rounded-lg border border-border/50">
                                            <Mail className="w-5 h-5 text-primary mr-3" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">Email</div>
                                                <div className="font-medium truncate">{organization.contact_email}</div>
                                            </div>
                                        </div>
                                    )}
                                    {organization.address && (
                                        <div className="sm:col-span-2 flex items-center p-3 bg-background rounded-lg border border-border/50">
                                            <MapPin className="w-5 h-5 text-primary mr-3" />
                                            <div>
                                                <div className="text-xs text-muted-foreground">Address</div>
                                                <div className="font-medium">{organization.address}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Requirements Section */}
                            {(organization.requirements?.some(r => r.isActive) || (user && (user.userId.toString() === organization.created_by || user.role === 'SuperAdmin'))) && (
                                <div className="space-y-6">
                                    {/* Public View of Requirements */}
                                    {organization.requirements?.length > 0 && (
                                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-red-100 p-2 rounded-full">
                                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-serif font-bold text-red-700 dark:text-red-400">Current Needs</h3>
                                                    <p className="text-sm text-red-600/80 dark:text-red-400/80">Support by fulfilling these specific requests</p>
                                                </div>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {organization.requirements.filter(r => r.isActive).map(req => (
                                                    <div key={req.id} className="bg-white dark:bg-card p-4 rounded-xl border border-red-100 dark:border-red-900/50 shadow-sm flex items-start gap-3">
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-foreground">{req.title}</div>
                                                            <div className="text-xs text-muted-foreground mt-1 flex gap-2">
                                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-red-200 text-red-600">
                                                                    {req.type}
                                                                </Badge>
                                                                <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Manager (Owner Only) */}
                                    {user && (user.userId.toString() === organization.created_by || user.role === 'SuperAdmin') && (
                                        <RequirementsManager
                                            organizationId={organization.id}
                                            initialRequirements={organization.requirements || []}
                                            onUpdate={fetchOrganization}
                                        />
                                    )}
                                </div>
                            )}
                            
                            {/* Donors List */}
                            <div className="rounded-2xl bg-card border border-border shadow-soft flex flex-col">
                                <div className="p-4 sm:p-6 border-b border-border bg-emerald-50 rounded-t-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <h3 className="font-serif text-xl font-bold text-emerald-800 flex items-center">
                                        <Heart className="w-5 h-5 mr-2 text-emerald-600 fill-current" />
                                        Recent Donors
                                    </h3>
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/50" />
                                        <Input 
                                            placeholder="Search donors..."
                                            value={donorSearchTerm}
                                            onChange={(e) => setDonorSearchTerm(e.target.value)}
                                            className="pl-9 pr-9 bg-white border-emerald-200 focus-visible:ring-emerald-500"
                                        />
                                        {donorSearchTerm && (
                                            <button 
                                                onClick={() => setDonorSearchTerm('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600/50 hover:text-emerald-700"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6 custom-scrollbar max-h-[400px] overflow-y-auto">
                                    {donorsLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        </div>
                                    ) : donors.filter(d => d.donorName.toLowerCase().includes(donorSearchTerm.toLowerCase())).length > 0 ? (
                                        <div className="space-y-4">
                                            {donors.filter(d => d.donorName.toLowerCase().includes(donorSearchTerm.toLowerCase())).map((donor, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0 gap-2">
                                                    <div>
                                                        <div className="font-semibold text-foreground text-lg">{donor.donorName}</div>
                                                        <div className="text-sm text-muted-foreground">{new Date(donor.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                    <div className="font-bold text-emerald-600 text-xl bg-emerald-50 px-4 py-1.5 rounded-full inline-block">
                                                        ₹{donor.amount.toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-center py-12">
                                            <Heart className="w-12 h-12 text-muted-foreground/20 mb-3" />
                                            <p className="text-muted-foreground">
                                                {donorSearchTerm ? "No donors found for this search." : "No donations yet. Be the first to support!"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Donation & Actions */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">

                                {/* Donation Card */}
                                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
                                    <div className="text-center mb-6">
                                        <h3 className="font-serif text-2xl font-bold mb-2">Support this Cause</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Your contribution acts as a stepping stone for their growth.
                                        </p>
                                    </div>

                                    {/* QR Code */}
                                    <div className="bg-white p-4 rounded-xl border-2 border-dashed border-border mb-6 flex flex-col items-center">
                                        {organization.qr_code_url ? (
                                            <img
                                                src={organization.qr_code_url}
                                                alt="Donation QR Code"
                                                className="w-48 h-48 object-contain mb-2"
                                            />
                                        ) : (
                                            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                                                <span className="text-xs">No QR Code</span>
                                            </div>
                                        )}
                                        <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                            Scan to Pay via UPI
                                        </span>
                                    </div>

                                    {/* UPI ID */}
                                    {organization.upi_id && (
                                        <div className="mb-6">
                                            <div className="text-xs text-center text-muted-foreground mb-1">UPI ID</div>
                                            <div className="flex items-center justify-center p-2 bg-muted rounded-lg border border-border font-mono font-medium text-sm">
                                                {organization.upi_id}
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        className="w-full text-lg h-12 gap-2"
                                        size="lg"
                                        onClick={() => {
                                            // Triggerting a dummy 500 INR payment
                                            handleRazorpayPayment(500);
                                        }}
                                    >
                                        <Heart className="w-5 h-5 fill-current" />
                                        Donate ₹500 Now
                                    </Button>
                                </div>

                                {/* Additional Actions */}
                                <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
                                    <h4 className="font-semibold mb-2">Transparency</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        This organization is verified by Sewa Connect. Donations go directly to the organization's account.
                                    </p>
                                    <Button variant="link" className="p-0 h-auto text-primary">
                                        Report this listing
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
