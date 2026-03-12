import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { SewaGroup } from '@/types/organization';
import { formatDate } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, X, Users, MapPin, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ReviewGroups() {
    const { user, isSuperAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [groups, setGroups] = useState<SewaGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (!user || !isSuperAdmin) {
                toast.error('Unauthorized. Only SuperAdmins can review groups.');
                navigate('/');
                return;
            }
            fetchPendingGroups();
        }
    }, [user, isSuperAdmin, authLoading, navigate]);

    const fetchPendingGroups = async () => {
        try {
            const response = await api.get('/Groups/pending');
            setGroups(response.data);
        } catch (error) {
            console.error('Error fetching pending groups:', error);
            toast.error('Failed to load pending groups');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        setProcessingId(id);
        try {
            await api.post(`/Groups/approve/${id}`);
            toast.success('Group approved successfully');
            setGroups(prev => prev.filter(g => g.groupId !== id));
            window.dispatchEvent(new Event('adminCountsChanged'));
        } catch (error) {
            console.error('Error approving group:', error);
            toast.error('Failed to approve group');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectClick = (id: number) => {
        setRejectId(id);
        setIsRejectDialogOpen(true);
    };

    const confirmReject = async () => {
        if (!rejectId) return;

        setProcessingId(rejectId);
        try {
            await api.delete(`/Groups/${rejectId}`);
            toast.info('Group registration rejected');
            setGroups(prev => prev.filter(g => g.groupId !== rejectId));
            window.dispatchEvent(new Event('adminCountsChanged'));
        } catch (error) {
            console.error('Error rejecting group:', error);
            toast.error('Failed to reject group');
        } finally {
            setProcessingId(null);
            setRejectId(null);
            setIsRejectDialogOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="font-serif text-3xl md:text-4xl font-bold flex items-center gap-3">
                                <Users className="w-8 h-8 text-primary" />
                                Review Sewa Groups
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Approve or reject new volunteer group registrations
                            </p>
                        </div>
                        <Badge variant="outline" className="text-lg py-1 px-4 border-primary/20 bg-primary/5">
                            {groups.length} Pending
                        </Badge>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground animate-pulse">Loading pending groups...</p>
                        </div>
                    ) : groups.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {groups.map((group) => (
                                <Card key={group.groupId} className="border-primary/20 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                                    <div className="h-1 bg-primary/20" />
                                    <CardHeader className="bg-muted/30 pb-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-2xl font-serif">{group.groupName}</CardTitle>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Submitted on {formatDate(group.createdAt)}
                                                </p>
                                            </div>
                                            <Badge className="bg-primary/20 text-primary border-primary/40">
                                                {group.memberCount} Members
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-6">
                                        <div>
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description & Expertise</h4>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{group.description}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Location</h4>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="w-4 h-4 text-primary" />
                                                    {group.city}, {group.state}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Info</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Phone className="w-4 h-4 text-primary" />
                                                        {group.contactPhone}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Mail className="w-4 h-4 text-primary" />
                                                        {group.contactEmail}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex gap-3">
                                            <Button
                                                className="flex-1 gap-2"
                                                onClick={() => handleApprove(group.groupId)}
                                                disabled={processingId === group.groupId}
                                            >
                                                {processingId === group.groupId ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                Approve Group
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                                onClick={() => handleRejectClick(group.groupId)}
                                            >
                                                <X className="w-4 h-4" />
                                                Reject
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                            <Users className="w-20 h-20 text-muted/40 mx-auto mb-6" />
                            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">No Pending Groups</h2>
                            <p className="text-muted-foreground">
                                Everything is up to date! There are no new group registrations to review.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the group registration
                            from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setRejectId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmReject}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Reject & Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Footer />
        </div>
    );
}
