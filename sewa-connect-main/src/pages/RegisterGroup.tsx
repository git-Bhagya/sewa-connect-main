import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, MapPin, Phone, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterGroup() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        groupName: '',
        description: '',
        memberCount: 1,
        city: '',
        state: '',
        contactPhone: '',
        contactEmail: '',
        logoUrl: ''
    });
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        const uploadData = new FormData();
        uploadData.append('files', file);

        try {
            const response = await api.post('/Upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = response.data.urls[0];
            setFormData(prev => ({ ...prev, logoUrl: url }));
            toast.success('Logo uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const newErrors: Record<string, string> = {};

        // Validations
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.contactPhone)) {
            newErrors.contactPhone = "Phone number must be exactly 10 digits";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.contactEmail)) {
            newErrors.contactEmail = "Please enter a valid email address";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fix the validation errors");
            return;
        }

        setLoading(true);
        try {
            await api.post('/Groups/register', formData);
            toast.success("Group registered! It will be visible after SuperAdmin approval.");
            navigate('/organizations'); // Back to list
        } catch (error) {
            console.error("Failed to register group", error);
            toast.error("Failed to submit registration. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-2xl">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    <Card className="border-primary/20 shadow-xl overflow-hidden">
                        <div className="h-2 bg-primary" />
                        <CardHeader>
                            <CardTitle className="font-serif text-3xl">Register Sewa Group</CardTitle>
                            <CardDescription>
                                Create a volunteer group to help others in your city. Your group will be public after admin approval.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                                        <Users className="w-4 h-4 text-primary" /> Group Name
                                    </label>
                                    <Input
                                        required
                                        placeholder="Enter group name"
                                        value={formData.groupName}
                                        onChange={e => setFormData({ ...formData, groupName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-wide">Group Logo (Optional)</label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={uploadingLogo}
                                        />
                                        {uploadingLogo && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                                        {formData.logoUrl && !uploadingLogo && (
                                            <div className="w-12 h-12 rounded-full border-2 border-primary/20 overflow-hidden shrink-0">
                                                <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold uppercase tracking-wide">Description & Expertise</label>
                                    <Textarea
                                        required
                                        placeholder="Enter details about your group's mission and expertise..."
                                        className="min-h-[120px]"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground italic">Mention if you help animals, elderly, education, etc.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                                            <Users className="w-4 h-4 text-primary" /> Member Count
                                        </label>
                                        <Input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.memberCount}
                                            onChange={e => setFormData({ ...formData, memberCount: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                                            <MapPin className="w-4 h-4 text-primary" /> City
                                        </label>
                                        <Input
                                            required
                                            placeholder="Enter city"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                                            <Phone className="w-4 h-4 text-primary" /> Contact Phone
                                        </label>
                                        <Input
                                            required
                                            placeholder="Enter phone number"
                                            value={formData.contactPhone}
                                            onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                        />
                                        {errors.contactPhone && <p className="text-destructive text-sm mt-1 font-medium">{errors.contactPhone}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                                            <Mail className="w-4 h-4 text-primary" /> Contact Email
                                        </label>
                                        <Input
                                            type="email"
                                            required
                                            placeholder="Enter email address"
                                            value={formData.contactEmail}
                                            onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                        />
                                        {errors.contactEmail && <p className="text-destructive text-sm mt-1 font-medium">{errors.contactEmail}</p>}
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Submit for Approval"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
