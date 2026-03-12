import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { usePlatformStats } from '@/hooks/usePlatformStats';
import api from '@/services/api';
import { 
  Heart, HandCoins, Activity, Users, Shield, Loader2, ArrowUpRight, 
  TrendingUp, CircleDollarSign, GraduationCap, Cross, Waves, MapPin
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Transparency() {
  const { stats, loading: statsLoading } = usePlatformStats();
  const [donations, setDonations] = useState<any[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await api.get('/donations/recent?limit=50');
        setDonations(response.data);
      } catch (error) {
        console.error('Failed to fetch recent donations:', error);
      } finally {
        setDonationsLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSectorIcon = (sector: string) => {
    switch(sector?.toLowerCase()) {
      case 'animal_care': return <Heart className="w-5 h-5 text-orange-500" />;
      case 'education': return <GraduationCap className="w-5 h-5 text-blue-500" />;
      case 'medical_aid': return <Cross className="w-5 h-5 text-red-500" />;
      case 'old_age_home': return <Users className="w-5 h-5 text-purple-500" />;
      default: return <HandCoins className="w-5 h-5 text-emerald-500" />;
    }
  };

  const fundsData = stats ? [
    { name: 'General Fund', amount: stats.generalFund, icon: HandCoins, color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' },
    { name: 'Animal Welfare', amount: stats.animalFund, icon: Heart, color: 'bg-orange-100 text-orange-700', border: 'border-orange-200' },
    { name: 'Education', amount: stats.educationFund, icon: GraduationCap, color: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
    { name: 'Medical Aid', amount: stats.medicalFund, icon: Cross, color: 'bg-red-100 text-red-700', border: 'border-red-200' },
    { name: 'Elderly Care', amount: stats.oldAgeFund, icon: Users, color: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
  ] : [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          
          {/* Header Section */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge variant="outline" className="mb-4 bg-primary/5 text-primary border-primary/20 px-3 py-1">
              <Shield className="w-3.5 h-3.5 mr-1" /> Radical Transparency
            </Badge>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Live Platform <span className="text-primary italic">Impact</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every single rupee donated securely fuels real change. Track real-time live data of our platform's fundraising health, allocation, and every amazing donor right here.
            </p>
          </div>

          {/* Impact Stats Grid */}
          {statsLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="bg-white/50 dark:bg-card border-none shadow-lg !shadow-primary/5 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <TrendingUp className="w-32 h-32" />
                  </div>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-primary/10 rounded-xl">
                        <CircleDollarSign className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">Total Raised</h3>
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100">
                      {formatCurrency(stats.totalRaised)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                      <Activity className="w-4 h-4 text-emerald-500" /> Platform-wide all time
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-card border-none shadow-lg !shadow-blue-500/5 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <HandCoins className="w-32 h-32" />
                  </div>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                        <Waves className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-lg">Total Spent</h3>
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100">
                      {formatCurrency(stats.totalSpent)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                      Capital distributed to causes
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/50 dark:bg-card border-none shadow-lg !shadow-emerald-500/5 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Shield className="w-32 h-32" />
                  </div>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                        <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="font-semibold text-lg">Remaining Fund</h3>
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100">
                      {formatCurrency(stats.remainingFund)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                       Available active trust
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Fund Allocations */}
              <div className="mb-16">
                <h3 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                  Fund Distribution
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {fundsData.map((fund, idx) => {
                    const Icon = fund.icon;
                    return (
                      <div key={idx} className={`p-5 rounded-2xl border bg-white dark:bg-card shadow-sm ${fund.border} transition-transform hover:-translate-y-1`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${fund.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">{fund.name}</div>
                        <div className="text-xl font-bold text-foreground">{formatCurrency(fund.amount)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Transparency Live Feed */}
           <div className="bg-card rounded-3xl p-6 md:p-10 shadow-xl border border-border/50">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
               <div>
                 <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3">
                   <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                   Live Donation Feed
                 </h2>
                 <p className="text-muted-foreground">Every transparent contribution made across the Sewa Connect ecosystem.</p>
               </div>
             </div>

             <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative min-h-[400px]">
               {donationsLoading ? (
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Loader2 className="w-8 h-8 animate-spin text-primary" />
                 </div>
               ) : donations.length > 0 ? (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                          <th className="font-semibold p-4">Donor Name</th>
                          <th className="font-semibold p-4">Allocation</th>
                          <th className="font-semibold p-4">Date</th>
                          <th className="font-semibold p-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donations.map((donation, idx) => (
                          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-900 transition-colors">
                            <td className="p-4 font-medium text-slate-900 dark:text-slate-100">
                              {donation.donorName}
                            </td>
                            <td className="p-4">
                               <div className="flex items-center gap-2">
                                 {getSectorIcon(donation.sector)}
                                 <div className="flex flex-col">
                                   <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                     {donation.sector ? donation.sector.replace('_', ' ').replace(/\b\w/g, (l:string) => l.toUpperCase()) : 'General Fund'}
                                   </span>
                                   {donation.organizationName && (
                                     <span className="text-[10px] text-muted-foreground bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm inline-block mt-1 w-max">
                                       {donation.organizationName}
                                     </span>
                                   )}
                                 </div>
                               </div>
                            </td>
                            <td className="p-4 text-sm text-slate-500">
                               {new Date(donation.createdAt).toLocaleString()}
                            </td>
                            <td className="p-4 text-right">
                               <div className="inline-flex items-center justify-end font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">
                                  {formatCurrency(donation.amount)}
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                   <Heart className="w-16 h-16 text-slate-200 dark:text-slate-800 mb-4" />
                   <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No donations yet.</h3>
                   <p className="text-muted-foreground">The feed will populate instantly as contributions roll in.</p>
                 </div>
               )}
             </div>
           </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
