import { useState, useEffect } from 'react';
import { Heart, Users, ShieldCheck, Star, HandHeart, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { usePlatformStats, PlatformStats } from '@/hooks/usePlatformStats';
import { DonationCard } from './DonationCard';

const slides = [
  {
    id: 0,
    type: 'stats',
    category: "Transparency",
    slogan: "Real-time Impact Tracking",
    bgGradient: "from-[#0f172a] via-[#1e293b] to-[#0f172a]", // Dark Slate for Stats
  }
];

export function HeroSlider() {
  const { isSuperAdmin } = useAuth();
  const { stats, loading: loadingStats, refresh: fetchStats } = usePlatformStats();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<PlatformStats>>({});

  useEffect(() => {
    if (stats) {
      setEditForm(stats);
    }
  }, [stats]);

  const totalAllocated = (editForm.generalFund || 0) +
    (editForm.educationFund || 0) +
    (editForm.animalFund || 0) +
    (editForm.medicalFund || 0) +
    (editForm.oldAgeFund || 0);

  const unallocatedAmount = (editForm.remainingFund || 0) - totalAllocated;

  const handleUpdate = async () => {
    if (unallocatedAmount < 0) {
      toast.error(`Invalid Allocation: Total allocated (₹${totalAllocated.toLocaleString()}) exceeds total fund (₹${(editForm.remainingFund || 0).toLocaleString()})`);
      return;
    }

    try {
      await api.put('/platform-stats', editForm);
      toast.success("Platform stats updated");
      setIsEditing(false);
      fetchStats();
    } catch (e) {
      toast.error("Failed to update stats");
    }
  };

  return (
    <section className="relative min-h-[450px] md:h-[400px] w-full bg-[#0f172a] md:overflow-hidden">
      <div className="absolute inset-0 opacity-100 z-10">
        <div className={`absolute inset-0 bg-gradient-to-br ${slides[0].bgGradient} opacity-90`} />

        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />

        <div className="relative min-h-full container mx-auto px-4 flex flex-col justify-center py-4 md:py-0">
          {loadingStats ? (
            <div className="flex items-center justify-center text-white">Loading Transparency Data...</div>
          ) : stats ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-6 md:gap-8 items-center">
              <div className="space-y-4 md:space-y-4">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">Transparency Dashboard</span>
                  </div>
                  <h1 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight">
                    Impact Through <span className="text-emerald-400">Transparency</span>
                  </h1>
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-xl flex flex-col justify-center text-center md:text-left transition-transform hover:scale-[1.02]">
                    <div className="text-white/60 text-[8px] md:text-[10px] uppercase tracking-wider mb-0.5 font-bold">Raised</div>
                    <div className="text-lg md:text-2xl font-black text-white">₹{stats.totalRaised.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-xl flex flex-col justify-center text-center md:text-left transition-transform hover:scale-[1.02]">
                    <div className="text-white/60 text-[8px] md:text-[10px] uppercase tracking-wider mb-0.5 font-bold">Spent</div>
                    <div className="text-lg md:text-2xl font-black text-white">₹{stats.totalSpent.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-xl flex flex-col justify-center text-center md:text-left transition-transform hover:scale-[1.02]">
                    <div className="text-white/60 text-[8px] md:text-[10px] uppercase tracking-wider mb-0.5 font-bold">Fund</div>
                    <div className="text-lg md:text-2xl font-black text-white">₹{stats.remainingFund.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div className="space-y-2 py-2">
                  <div className="flex justify-between text-[10px] text-white/80 uppercase font-black tracking-widest">
                    <span>Overall Utilization</span>
                    <span className="text-emerald-400">{((stats.totalSpent / stats.totalRaised) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.totalSpent / stats.totalRaised) * 100} className="h-2 bg-white/10 shadow-inner" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2">
                  {[
                    { label: 'General', amount: stats.generalFund, icon: HandHeart, color: 'text-blue-400' },
                    { label: 'Education', amount: stats.educationFund, icon: Star, color: 'text-yellow-400' },
                    { label: 'Animal', amount: stats.animalFund, icon: Heart, color: 'text-red-400' },
                    { label: 'Medical', amount: stats.medicalFund, icon: HandHeart, color: 'text-emerald-400' },
                    { label: 'Elderly', amount: stats.oldAgeFund, icon: HandHeart, color: 'text-purple-400' },
                  ].map((cause, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-2 rounded-lg flex items-center gap-2 group hover:bg-white/10 transition-colors">
                      <cause.icon className={`w-3 h-3 ${cause.color} group-hover:scale-110 transition-transform`} />
                      <div>
                        <p className="text-[8px] text-white/50 uppercase font-bold leading-none mb-0.5">{cause.label}</p>
                        <p className="text-[11px] font-black text-white">₹{cause.amount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {isSuperAdmin && (
                  <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-white/40 hover:text-white hover:bg-white/10 px-0 h-8 mt-4 mx-auto md:mx-0 flex">
                        <Edit3 className="w-3.5 h-3.5 mr-2" />
                        Adjust Platform Financials
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Update Dashboard Stats</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Total Raised (₹)</Label>
                            <Input type="number" placeholder="Enter amount raised" value={editForm.totalRaised} onChange={e => setEditForm({ ...editForm, totalRaised: Number(e.target.value) })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Total Spent (₹)</Label>
                            <Input type="number" placeholder="Enter amount spent" value={editForm.totalSpent} onChange={e => setEditForm({ ...editForm, totalSpent: Number(e.target.value) })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Remaining Fund (₹)</Label>
                            <Input type="number" placeholder="Enter remaining fund" value={editForm.remainingFund} onChange={e => setEditForm({ ...editForm, remainingFund: Number(e.target.value) })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Platform UPI ID</Label>
                            <Input placeholder="Enter UPI ID" value={editForm.upiId} onChange={e => setEditForm({ ...editForm, upiId: e.target.value })} />
                          </div>
                        </div>

                        <div className="border-t border-border pt-4">
                          <h4 className="text-sm font-bold mb-4">Cause-Specific Funds</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>General Fund (₹)</Label>
                              <Input type="number" placeholder="Enter amount" value={editForm.generalFund} onChange={e => setEditForm({ ...editForm, generalFund: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                              <Label>Education Fund (₹)</Label>
                              <Input type="number" placeholder="Enter amount" value={editForm.educationFund} onChange={e => setEditForm({ ...editForm, educationFund: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                              <Label>Animal Welfare Fund (₹)</Label>
                              <Input type="number" placeholder="Enter amount" value={editForm.animalFund} onChange={e => setEditForm({ ...editForm, animalFund: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                              <Label>Medical Relief Fund (₹)</Label>
                              <Input type="number" placeholder="Enter amount" value={editForm.medicalFund} onChange={e => setEditForm({ ...editForm, medicalFund: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                              <Label>Elderly Care Fund (₹)</Label>
                              <Input type="number" placeholder="Enter amount" value={editForm.oldAgeFund} onChange={e => setEditForm({ ...editForm, oldAgeFund: Number(e.target.value) })} />
                            </div>
                          </div>

                          <div className={`mt-4 p-3 rounded-lg border flex justify-between items-center transition-colors ${unallocatedAmount < 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                            <div>
                              <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest leading-none mb-1">Total Allocation Balance</p>
                              <p className="text-lg font-black font-sans">₹{unallocatedAmount.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest leading-none mb-1">Status</p>
                              <p className="text-xs font-bold uppercase">{unallocatedAmount < 0 ? 'Exceeded Fund Limit' : 'Valid Allocation'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>QR Image URL</Label>
                          <Input placeholder="Enter QR image URL" value={editForm.upiQrImageUrl || ''} onChange={e => setEditForm({ ...editForm, upiQrImageUrl: e.target.value })} />
                        </div>
                      </div>
                      <DialogFooter className="sticky bottom-0 bg-background pt-2">
                        <Button onClick={handleUpdate}>Save Changes</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="hidden lg:block">
                <DonationCard stats={stats} onSuccess={fetchStats} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center text-white">System Error: Failed to load transparency dashboard.</div>
          )}
        </div>
      </div>
    </section>
  );
}
