import { useState } from 'react';
import { Heart, QrCode, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { PlatformStats } from '@/hooks/usePlatformStats';

interface DonationCardProps {
    stats: PlatformStats | null;
    className?: string;
    onSuccess?: () => void;
}

export function DonationCard({ stats, className, onSuccess }: DonationCardProps) {
    const navigate = useNavigate();
    const [donateSector, setDonateSector] = useState('general');

    const getUpiUrl = (sector: string, appPackage: string = '') => {
        const upi = stats?.upiId || "sewaconnect@upi";
        const note = sector === 'general' ? 'Donation to Sewa Connect' : `Donation for ${sector.replace('_', ' ')} via Sewa Connect`;
        const params = new URLSearchParams({
            pa: upi,
            pn: 'Sewa Connect',
            tn: note,
            cu: 'INR'
        });
        const isAndroid = /Android/i.test(navigator.userAgent);
        if (isAndroid && appPackage) {
            return `intent://pay?${params.toString()}#Intent;package=${appPackage};scheme=upi;end`;
        }
        return `upi://pay?${params.toString()}`;
    };

    const handlePayClick = (appPackage: string = '') => {
        const url = getUpiUrl(donateSector, appPackage);
        if (!url) {
            toast.error("Payment details not available");
            return;
        }

        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (!isMobile) {
            toast.info("UPI App redirection works best on mobile. Please use 'View QR' on desktop.", {
                description: "Scan the QR code with any UPI app like GPay, PhonePe, or Paytm."
            });
            return;
        }
        window.location.href = url;
    };

    const handleRazorpayPayment = async (amount: number) => {
        if (amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        navigate('/payment', {
            state: {
                amount: amount,
                sector: donateSector,
                organizationId: null,
                name: 'Sewa Connect Platform Fund - ' + donateSector.replace('_', ' ')
            }
        });

        if (onSuccess) onSuccess();
    };

    return (
        <Card className={`bg-card text-card-foreground backdrop-blur-2xl border-none shadow-2xl p-4 md:p-5 flex flex-col justify-center h-fit self-center ${className}`}>
            <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    Gifts of Service
                </h3>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Target Sector</Label>
                        <Select value={donateSector} onValueChange={setDonateSector}>
                            <SelectTrigger className="w-full bg-background border-input h-10 text-sm text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover text-popover-foreground">
                                <SelectItem value="general">General Sewa Fund</SelectItem>
                                <SelectItem value="animal_care">Animal Welfare</SelectItem>
                                <SelectItem value="education">Child Education</SelectItem>
                                <SelectItem value="medical_aid">Medical Relief</SelectItem>
                                <SelectItem value="old_age_home">Elderly Care</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Amount (₹)</Label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Enter amount"
                                className="bg-background border-input h-11 text-lg font-black"
                                id="donation-amount"
                                defaultValue="500"
                            />
                            <Button
                                className="h-11 bg-emerald-600 hover:bg-emerald-700 font-bold px-4"
                                onClick={() => {
                                    const input = document.getElementById('donation-amount') as HTMLInputElement;
                                    handleRazorpayPayment(Number(input.value));
                                }}
                            >
                                Donate
                            </Button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-[8px] uppercase font-bold">
                            <span className="bg-card px-2 text-muted-foreground">Fast UPI Access</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button className="flex-1 h-11 text-xs font-bold shadow-lg shadow-primary/20" onClick={() => handlePayClick('')}>
                            <ArrowUpRight className="w-4 h-4 mr-1.5" />
                            Use Any UPI App
                        </Button>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex-1 h-11 text-xs font-bold border-2 active:bg-slate-50">
                                    <QrCode className="w-4 h-4 mr-1.5" />
                                    View QR
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[340px] p-8">
                                <DialogHeader>
                                    <DialogTitle className="text-center text-xl font-bold">Scan to Support</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col items-center gap-6 py-6 border border-border rounded-xl">
                                    <div className="p-4 bg-white dark:bg-white rounded-3xl shadow-xl border border-border">
                                        {stats?.upiQrImageUrl ? (
                                            <img src={stats.upiQrImageUrl} alt="UPI QR" className="w-56 h-56 object-contain" />
                                        ) : (
                                            <img src="/SewaQR.jpg" alt="Sewa General QR" className="w-56 h-56 object-contain" />
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-foreground">{stats?.upiId || 'sewaconnect@upi'}</p>
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Platform General Fund</p>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                        <Button variant="secondary" className="h-9 text-[10px] font-bold" onClick={() => handlePayClick('com.google.android.apps.nbu.paisa.user')}>
                            GPay
                        </Button>
                        <Button variant="secondary" className="h-9 text-[10px] font-bold" onClick={() => handlePayClick('com.phonepe.app')}>
                            PhonePe
                        </Button>
                        <Button variant="secondary" className="h-9 text-[10px] font-bold" onClick={() => handlePayClick('net.one97.paytm')}>
                            Paytm
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
