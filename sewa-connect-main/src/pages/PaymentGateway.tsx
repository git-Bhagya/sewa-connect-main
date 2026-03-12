import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, QrCode, ArrowLeft, ShieldCheck, Banknote, Loader2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { toast } from 'sonner';

export default function PaymentGateway() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string>('upi');

    // Fallback data if none provided
    const state = location.state || { amount: 500, sector: 'general', organizationId: null, name: 'Sewa Connect' };
    const amount = state.amount || 500;

    useEffect(() => {
        if (!user) {
            toast.error("Please log in to complete your donation");
            navigate('/auth', { state: { from: location } });
        }
    }, [user, navigate, location]);

    const handleProcessPayment = async () => {
        setIsProcessing(true);

        // Simulating processing delay like a real gateway
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // Hit our dummy backend endpoint saving it properly to database & stats
            const response = await api.post('/donations/dummy-payment', {
                amount: amount,
                sector: state.sector,
                organizationId: state.organizationId
            });

            if (response.data.status === 'success') {
                toast.success('Payment successfully captured!');
                navigate('/payment/success', {
                    state: {
                        transaction: response.data,
                        amount: amount,
                        sector: state.sector,
                        orgName: state.name
                    }
                });
            } else {
                toast.error('Payment failed: ' + response.data.message);
                setIsProcessing(false);
            }
        } catch (error: any) {
            toast.error('Error connecting to payment gateway backend');
            setIsProcessing(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Left Side / Top Mobile - Summary */}
            <div className="w-full md:w-1/3 bg-slate-900 text-white p-6 md:p-10 flex flex-col">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-slate-400 hover:text-white mb-8 w-fit transition-colors"
                    disabled={isProcessing}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>

                <div className="flex-grow">
                    <p className="text-slate-400 text-sm uppercase tracking-widest font-bold mb-2">You are paying</p>
                    <h2 className="text-4xl md:text-5xl font-black mb-8 flex items-baseline gap-2">
                        <span className="text-2xl text-slate-400">₹</span>{amount}
                    </h2>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center py-3 border-b border-slate-800">
                            <span className="text-slate-400 text-sm">To</span>
                            <span className="font-medium text-right">{state.name || 'Sewa Connect Platform'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-slate-800">
                            <span className="text-slate-400 text-sm">Cause</span>
                            <span className="font-medium capitalize">{state.sector?.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-center gap-2 text-emerald-400 text-xs font-semibold bg-emerald-400/10 p-4 rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                    100% SECURE & ENCRYPTED
                </div>
            </div>

            {/* Right Side / Bottom Mobile - Payment Options */}
            <div className="w-full md:w-2/3 p-4 md:p-10 lg:p-16 max-w-3xl mx-auto flex flex-col h-full bg-slate-50">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Select Payment Method</h3>

                <div className="grid gap-4 mb-8">
                    {/* UPI Option */}
                    <div
                        onClick={() => setSelectedMethod('upi')}
                        className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedMethod === 'upi' ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 bg-white hover:border-primary/30 hover:bg-slate-50'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${selectedMethod === 'upi' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-slate-900">UPI / QR</h4>
                            <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'upi' ? 'border-primary' : 'border-slate-300'}`}>
                            {selectedMethod === 'upi' && <div className="w-3 h-3 rounded-full bg-primary" />}
                        </div>
                    </div>

                    {/* Card Option */}
                    <div
                        onClick={() => setSelectedMethod('card')}
                        className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedMethod === 'card' ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 bg-white hover:border-primary/30 hover:bg-slate-50'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${selectedMethod === 'card' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-slate-900">Card</h4>
                            <p className="text-xs text-slate-500">Visa, MasterCard, RuPay</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'card' ? 'border-primary' : 'border-slate-300'}`}>
                            {selectedMethod === 'card' && <div className="w-3 h-3 rounded-full bg-primary" />}
                        </div>
                    </div>

                    {/* Net Banking Option */}
                    <div
                        onClick={() => setSelectedMethod('netbanking')}
                        className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedMethod === 'netbanking' ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 bg-white hover:border-primary/30 hover:bg-slate-50'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${selectedMethod === 'netbanking' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <Banknote className="w-6 h-6" />
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-bold text-slate-900">Net Banking</h4>
                            <p className="text-xs text-slate-500">All Major Indian Banks</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'netbanking' ? 'border-primary' : 'border-slate-300'}`}>
                            {selectedMethod === 'netbanking' && <div className="w-3 h-3 rounded-full bg-primary" />}
                        </div>
                    </div>
                </div>

                {/* Simulation inputs based on selection */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4">
                    {selectedMethod === 'upi' && (
                        <div className="space-y-4 text-center">
                            <QrCode className="w-24 h-24 mx-auto text-slate-800" />
                            <p className="text-sm font-medium text-slate-600">Scan QR or enter UPI ID to test</p>
                            <Input placeholder="test@ybl" className="text-center bg-slate-50 border-slate-200" />
                        </div>
                    )}

                    {selectedMethod === 'card' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Card Number</Label>
                                <Input placeholder="4111 1111 1111 1111" className="bg-slate-50 border-slate-200 font-mono" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Expiry</Label>
                                    <Input placeholder="12/28" className="bg-slate-50 border-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label>CVV</Label>
                                    <Input placeholder="123" type="password" maxLength={3} className="bg-slate-50 border-slate-200" />
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedMethod === 'netbanking' && (
                        <div className="space-y-4">
                            <Label>Select Bank</Label>
                            <select className="w-full h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                                <option>HDFC Bank</option>
                                <option>SBI</option>
                                <option>ICICI Bank</option>
                                <option>Axis Bank</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-200 pb-20 md:pb-0">
                    <Button
                        size="lg"
                        className="w-full h-14 text-lg rounded-xl font-bold group"
                        onClick={handleProcessPayment}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Processing Payment...
                            </>
                        ) : (
                            <>
                                Pay ₹{amount} Securely
                                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        By proceeding, you agree to our Terms & Conditions.
                    </p>
                </div>
            </div>
        </div>
    );
}
