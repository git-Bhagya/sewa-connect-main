import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, User as UserIcon, Bell, Shield, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface UserPreferences {
    userId: number;
    notifyFood: boolean;
    notifyMoney: boolean;
    notifyClothes: boolean;
    notifyMedical: boolean;
    notifyOthers: boolean;
}

export default function Profile() {
    const { user, signOut } = useAuth();
    const [loading, setLoading] = useState(true);
    const [preferences, setPreferences] = useState<UserPreferences>({
        userId: 0,
        notifyFood: true,
        notifyMoney: true,
        notifyClothes: true,
        notifyMedical: true,
        notifyOthers: true
    });
    const [profileInfo, setProfileInfo] = useState({
        fullName: '',
        phoneNumber: ''
    });
    const [savingPrefs, setSavingPrefs] = useState(false);
    const [savingInfo, setSavingInfo] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/Profile');
                if (response.data.preference) {
                    setPreferences(response.data.preference);
                }
                setProfileInfo({
                    fullName: response.data.fullName || '',
                    phoneNumber: response.data.phoneNumber || ''
                });
            } catch (error) {
                console.error("Failed to fetch profile", error);
                toast.error("Failed to load profile settings");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleToggle = (key: keyof UserPreferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSavePrefs = async () => {
        setSavingPrefs(true);
        try {
            await api.put('/Profile/preferences', preferences);
            toast.success("Notification preferences updated");
        } catch (error) {
            console.error("Failed to save preferences", error);
            toast.error("Failed to update preferences");
        } finally {
            setSavingPrefs(false);
        }
    };

    const handleSaveInfo = async () => {
        setSavingInfo(true);
        try {
            await api.put('/Profile/update', profileInfo);
            toast.success("Account information updated");
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error("Failed to update account information");
        } finally {
            setSavingInfo(false);
        }
    };

    if (loading) {
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

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <p>Please log in.</p>
                <Button onClick={() => window.location.href = '/auth'}>Login</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 pt-24">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center gap-6 bg-card border border-border/50 p-8 rounded-3xl shadow-sm">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background ring-2 ring-primary/20">
                            <UserIcon className="h-12 w-12 text-primary" />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-serif font-black text-foreground">
                                {profileInfo.fullName || user?.email?.split('@')[0]}
                            </h1>
                            <p className="text-muted-foreground font-medium">{user?.email}</p>
                            <div className="flex justify-center md:justify-start gap-2 mt-3">
                                <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-none font-bold uppercase tracking-wider text-[10px]">
                                    {user.role}
                                </Badge>
                                <Badge variant="outline" className="px-3 py-1 border-border text-[10px] uppercase font-bold tracking-wider">
                                    Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.5fr] gap-8">
                        <div className="space-y-8">
                            {/* Account Information */}
                            <Card className="border-none shadow-xl bg-gradient-to-br from-card to-background">
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-primary" />
                                        Personal Details
                                    </CardTitle>
                                    <CardDescription>Update your public identity on Sewa Connect.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-widest opacity-60">Full Name</Label>
                                        <Input
                                            placeholder="Enter full name"
                                            value={profileInfo.fullName}
                                            onChange={(e) => setProfileInfo({ ...profileInfo, fullName: e.target.value })}
                                            className="bg-background/50 border-border/50 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-widest opacity-60">Phone Number</Label>
                                        <Input
                                            placeholder="Enter phone number"
                                            value={profileInfo.phoneNumber}
                                            onChange={(e) => setProfileInfo({ ...profileInfo, phoneNumber: e.target.value })}
                                            className="bg-background/50 border-border/50 focus:ring-primary/20"
                                        />
                                    </div>
                                    <Button onClick={handleSaveInfo} disabled={savingInfo} className="w-full mt-2 font-bold bg-primary hover:bg-primary/90">
                                        {savingInfo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Update Details
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Danger Zone */}
                            <Card className="border-destructive/10 bg-destructive/5 shadow-none">
                                <CardHeader className="py-4">
                                    <CardTitle className="text-sm font-bold text-destructive">Danger Zone</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" onClick={signOut} className="w-full border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all font-bold">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Log Out Account
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Notification Settings */}
                        <Card className="border-none shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-emerald-500" />
                                    Broadcast Alerts
                                </CardTitle>
                                <CardDescription>
                                    Get notified when organizations need urgent help in these sectors.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-1">
                                    {[
                                        { id: 'notifyFood', label: 'Food & Hunger', desc: 'Alerts when communities need food supplies.', icon: '🥘' },
                                        { id: 'notifyMoney', label: 'Financial Aid', desc: 'Secure requests for monetary relief.', icon: '💰' },
                                        { id: 'notifyMedical', label: 'Medical Care', desc: 'Emergency requirements for medicines & blood.', icon: '💊' },
                                        { id: 'notifyClothes', label: 'Clothing & Textiles', desc: 'Requirements for blankets, clothes, and more.', icon: '👕' },
                                        { id: 'notifyOthers', label: 'General Volunteering', desc: 'Miscellaneous help and logistics support.', icon: '🤝' },
                                    ].map((item, i) => (
                                        <div key={item.id}>
                                            <div className="flex items-center justify-between py-4 group">
                                                <Label htmlFor={item.id} className="flex items-center gap-4 cursor-pointer">
                                                    <span className="text-2xl bg-secondary/50 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:bg-primary/5 transition-colors">{item.icon}</span>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-bold text-base">{item.label}</span>
                                                        <span className="font-normal text-xs text-muted-foreground">{item.desc}</span>
                                                    </div>
                                                </Label>
                                                <Switch
                                                    id={item.id}
                                                    checked={preferences[item.id as keyof UserPreferences] as boolean}
                                                    onCheckedChange={() => handleToggle(item.id as keyof UserPreferences)}
                                                    className="data-[state=checked]:bg-emerald-500"
                                                />
                                            </div>
                                            {i < 4 && <Separator className="opacity-50" />}
                                        </div>
                                    ))}
                                </div>

                                <Button onClick={handleSavePrefs} disabled={savingPrefs} className="w-full font-bold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700">
                                    {savingPrefs ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Save Notification Settings
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
