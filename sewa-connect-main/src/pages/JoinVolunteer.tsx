import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, User, Phone, Mail, FileText, MapPin, Briefcase, Clock, CheckCircle2, Shield, Edit2, Trash2, Star, Heart, HandHeart } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const volunteerSchema = z.object({
    fullName: z.string().min(3, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').max(15),
    aadharNumber: z.string().regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits'),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    occupation: z.string().optional(),
    skills: z.string().optional(),
    availability: z.string().min(1, 'Please select your availability'),
});

interface VolunteerData {
    volunteerId: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    aadharNumber: string;
    address: string;
    city: string;
    occupation: string;
    skills: string;
    availability: string;
    isApproved: boolean;
}

export default function JoinVolunteer() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const [status, setStatus] = useState<VolunteerData | null>(null);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        aadharNumber: '',
        address: '',
        city: '',
        occupation: '',
        skills: '',
        availability: '',
    });

    useEffect(() => {
        if (user) {
            fetchStatus();
        } else if (!authLoading) {
            setIsPageLoading(false);
        }
    }, [user, authLoading, location.key]);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/volunteers/my-status');
            if (res.data) {
                setStatus(res.data);
                setFormData({
                    fullName: res.data.fullName,
                    email: res.data.email,
                    phoneNumber: res.data.phoneNumber,
                    aadharNumber: res.data.aadharNumber,
                    address: res.data.address,
                    city: res.data.city,
                    occupation: res.data.occupation || '',
                    skills: res.data.skills || '',
                    availability: res.data.availability || '',
                });
            } else if (user) {
                // PRE-FILL from user profile if no volunteer record exists
                setFormData(prev => ({
                    ...prev,
                    fullName: user.fullName || '',
                    email: user.email || '',
                    phoneNumber: (user as any).phoneNumber || '',
                }));
            }
        } catch (e) {
            console.error("Failed to fetch volunteer status", e);
        } finally {
            setIsPageLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const result = volunteerSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            if (status && isEditing) {
                await api.put(`/volunteers/update/${status.volunteerId}`, formData);
                toast.success('Volunteer details updated!');
                setIsEditing(false);
            } else {
                await api.post('/volunteers/register', formData);
                toast.success('Application submitted successfully!');
            }
            fetchStatus();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!status) return;

        try {
            await api.delete(`/volunteers/delete/${status.volunteerId}`);
            toast.success('Volunteer registration cancelled');
            setStatus(null);
            setFormData({
                fullName: user?.fullName || '',
                email: user?.email || '',
                phoneNumber: user?.phoneNumber || '',
                aadharNumber: '',
                address: '',
                city: '',
                occupation: '',
                skills: '',
                availability: '',
            });
        } catch (e) {
            toast.error('Failed to cancel registration');
        }
    };

    if (authLoading || isPageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Case 0: Not Logged In (Show Landing / CTA)
    if (!user) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-6 font-bold tracking-wider text-xs uppercase">
                                <HandHeart className="w-4 h-4" /> Join our mission
                            </div>
                            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
                                Become a Verified Volunteer
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                                Connect with those in need, share your skills, and make a tangible difference in your community through Sewa Connect.
                            </p>
                            <Button size="lg" className="rounded-full px-10 py-6 h-auto text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all" onClick={() => navigate('/auth')}>
                                Login to Start Your Journey
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 mb-16">
                            {[
                                {
                                    icon: Heart,
                                    title: "Direct Impact",
                                    desc: "Help verified organizations reach their goals and support local causes."
                                },
                                {
                                    icon: Shield,
                                    title: "Verified Profile",
                                    desc: "Get a verified volunteer badge after Aadhaar verification by our superAdmin."
                                },
                                {
                                    icon: Star,
                                    title: "Grow Your Skills",
                                    desc: "Learn from community leaders and develop valuable social service skills."
                                }
                            ].map((item, i) => (
                                <Card key={i} className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
                                    <CardContent className="pt-8 text-center">
                                        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <item.icon className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                                        <p className="text-muted-foreground text-sm">{item.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="bg-muted/30 rounded-3xl p-8 md:p-12 border border-border flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="max-w-md">
                                <h2 className="text-2xl font-bold mb-2">How it works</h2>
                                <p className="text-muted-foreground">Log in to your account, fill out the simple volunteer form, and our team will verify your details within 24-48 hours.</p>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline" className="rounded-full" onClick={() => navigate('/about')}>Learn More</Button>
                                <Button className="rounded-full" onClick={() => navigate('/auth')}>Get Started Now</Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Case 1: Application Pending
    if (status && !status.isApproved && !isEditing) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-32 pb-16 flex flex-col items-center justify-center container mx-auto px-4">
                    <div className="max-w-md w-full bg-card p-8 rounded-3xl border border-border text-center shadow-xl">
                        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-amber-500" />
                        </div>
                        <h1 className="font-serif text-3xl font-bold mb-4">Application Pending</h1>
                        <p className="text-muted-foreground mb-8">
                            Your application is currently being reviewed by our SuperAdmin. We will verify your Aadhaar details and approve you shortly.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button className="w-full" onClick={fetchStatus}>
                                <Clock className="w-4 h-4 mr-2" /> Check Status Now
                            </Button>
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>Back Home</Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" className="text-destructive text-xs">Cancel Application</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently cancel your volunteer application. You will need to apply again if you change your mind.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Keep Application</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Confirm Cancellation
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Case 2: Already Approved (Show Profile / Edit)
    if (status && status.isApproved && !isEditing) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4 max-w-2xl">
                        <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Shield className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <h1 className="font-serif text-2xl font-bold">Verified Volunteer</h1>
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>
                                            <span className="text-xs text-muted-foreground">Volunteer ID: #{status.volunteerId}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="text-destructive">
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to cancel your volunteer registration? Your profile will be permanently removed.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Back</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleDelete}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Yes, Remove Me
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Full Name</p>
                                        <p className="font-medium">{status.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Email</p>
                                        <p className="font-medium">{status.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Phone</p>
                                        <p className="font-medium">{status.phoneNumber}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Aadhaar</p>
                                        <p className="font-medium text-muted-foreground">XXXX-XXXX-{status.aadharNumber.slice(-4)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Location</p>
                                        <p className="font-medium">{status.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Availability</p>
                                        <p className="font-medium">{status.availability}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Address</p>
                                    <p className="text-sm">{status.address}</p>
                                </div>
                                {status.skills && (
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Skills</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {status.skills.split(',').map(s => <Badge key={s} variant="secondary">{s.trim()}</Badge>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Case 3: Registration Form (or Edit Mode)
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-2xl">
                    <button
                        onClick={() => isEditing ? setIsEditing(false) : navigate(-1)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {isEditing ? 'Cancel Edit' : 'Back'}
                    </button>

                    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                                    {isEditing ? 'Update Details' : 'Join as Volunteer'}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {isEditing ? 'Modify your registration information' : 'Help those in need and make a difference'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name *</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input name="fullName" value={formData.fullName} onChange={handleInputChange} className="pl-10" placeholder="Enter full name" />
                                    </div>
                                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mobile Number *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="pl-10" placeholder="Enter mobile number" />
                                    </div>
                                    {errors.phoneNumber && <p className="text-xs text-destructive">{errors.phoneNumber}</p>}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email Address *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input name="email" type="email" value={formData.email} onChange={handleInputChange} className="pl-10" placeholder="Enter email address" />
                                    </div>
                                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Aadhaar Card Number *</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            name="aadharNumber"
                                            value={formData.aadharNumber}
                                            onChange={handleInputChange}
                                            className="pl-10"
                                            placeholder="Enter 12 digit Aadhaar number"
                                            maxLength={12}
                                            disabled={!!status && isEditing} // Disable Aadhaar edit for security
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Used for verification. Cannot be changed once submitted.</p>
                                    {errors.aadharNumber && <p className="text-xs text-destructive">{errors.aadharNumber}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Residential Address *</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <Textarea name="address" value={formData.address} onChange={handleInputChange} className="pl-10 pt-2 min-h-[80px]" placeholder="Enter residential address..." />
                                </div>
                                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">City *</label>
                                    <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter city" />
                                    {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Occupation</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input name="occupation" value={formData.occupation} onChange={handleInputChange} className="pl-10" placeholder="Enter occupation" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Skills (Optional)</label>
                                <Input name="skills" value={formData.skills} onChange={handleInputChange} placeholder="Enter your skills" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Availability *</label>
                                <Select value={formData.availability} onValueChange={(v) => handleSelectChange('availability', v)}>
                                    <SelectTrigger className="w-full">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                                            <SelectValue placeholder="When are you available?" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Full Week">Full Week</SelectItem>
                                        <SelectItem value="Weekends Only">Weekends Only</SelectItem>
                                        <SelectItem value="Evenings Only">Evenings Only</SelectItem>
                                        <SelectItem value="Flexible">Flexible</SelectItem>
                                        <SelectItem value="Emergency Response Only">Emergency Response Only</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.availability && <p className="text-xs text-destructive">{errors.availability}</p>}
                            </div>

                            <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    isEditing ? 'Save Changes' : 'Apply Now'
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
