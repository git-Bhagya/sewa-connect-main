import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Download, Home, Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const certificateRef = useRef<HTMLDivElement>(null);

    // Redirect if they somehow got here without a transaction state
    useEffect(() => {
        if (!location.state?.transaction) {
            navigate('/');
        }
    }, [location.state, navigate]);

    if (!location.state?.transaction) return null;

    const { transaction, amount, sector, orgName } = location.state;
    const dateStr = new Date(transaction.date || Date.now()).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleDownload = () => {
        // Trigger generic print window for the certificate (simplest way without huge PDF libs)
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Success Header */}
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 font-serif">
                        Thank You!
                    </h1>
                    <p className="text-lg text-slate-600">
                        Your donation of ₹{amount} was successful.
                    </p>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Transaction ID: <span className="font-mono bg-slate-100 px-2 py-1 rounded">{transaction.orderId || dummyTxId()}</span>
                    </p>
                </div>

                {/* The Certificate - This is styled explicitly so it looks like a real certificate */}
                {/* In CSS we can define a @media print to only print this div */}
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        #certificate, #certificate * { visibility: visible; }
                        #certificate { position: absolute; left: 0; top: 0; width: 100%; border: 15px solid #0f172a; border-radius: 0; box-shadow: none; }
                        .no-print { display: none !important; }
                    }
                `}</style>

                <div
                    id="certificate"
                    ref={certificateRef}
                    className="bg-white border-[12px] border-slate-900 p-8 md:p-14 rounded-xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500 delay-150"
                >
                    {/* Watermark/Background Decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                        <Heart className="w-96 h-96" />
                    </div>

                    <div className="relative text-center space-y-6">
                        <div className="flex justify-center mb-6">
                            <img src="/logo.png" alt="Sewa Connect" className="h-20 object-contain" />
                        </div>

                        <h2 className="text-sm uppercase tracking-[0.3em] font-bold text-slate-400">Certificate of Appreciation</h2>

                        <div className="py-6 border-y-2 border-slate-100 space-y-4">
                            <p className="text-slate-600 italic text-lg">This is proudly presented to</p>
                            <h3 className="text-3xl md:text-5xl font-serif text-primary">
                                {(user as any)?.name || user?.email?.split('@')[0] || "Generous Donor"}
                            </h3>
                            <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">
                                in grateful recognition of your generous contribution of <span className="font-bold text-slate-900 border-b-2 border-primary">₹{amount}</span> to {orgName || 'the General Fund'} supporting <span className="capitalize">{sector?.replace('_', ' ')}</span> initiatives.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center pt-6">
                            <div>
                                <p className="font-mono text-xs text-slate-400 mb-1">Date</p>
                                <p className="font-bold text-slate-800">{dateStr}</p>
                            </div>
                            <div>
                                <p className="font-mono text-xs text-slate-400 mb-1">Authorized</p>
                                <img src="/logo.png" alt="Seal" className="h-6 object-contain mx-auto grayscale" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 no-print pb-20">
                    <Button
                        size="lg"
                        onClick={handleDownload}
                        className="font-bold rounded-xl shadow-lg border hover:-translate-y-0.5 transition-transform"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Download Certificate
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="font-bold rounded-xl border-2 hover:-translate-y-0.5 transition-transform"
                    >
                        <Link to="/">
                            <Home className="w-5 h-5 mr-2" />
                            Return Home
                        </Link>
                    </Button>
                </div>

            </div>
        </div>
    );
}

function dummyTxId() {
    return 'pay_' + Math.random().toString(36).substring(2, 10).toUpperCase();
}
