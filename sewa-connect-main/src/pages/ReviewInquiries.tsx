import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { formatDate } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Trash2, Calendar, User, MessageSquare, Image as ImageIcon, X, Check } from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Inquiry {
    id: number;
    name: string;
    email: string;
    message: string;
    photoUrl?: string;
    submittedAt: string;
    isCompleted: boolean;
}

export default function ReviewInquiries() {
    const { user, isSuperAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user || !isSuperAdmin) {
                toast.error('Unauthorized. Only SuperAdmins can review inquiries.');
                navigate('/');
                return;
            }
            fetchInquiries();
        }
    }, [user, isSuperAdmin, authLoading, navigate]);

    const fetchInquiries = async () => {
        try {
            const response = await api.get('/Contact');
            setInquiries(response.data);
        } catch (error) {
            console.error('Error fetching inquiries:', error);
            toast.error('Failed to load inquiries');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (deleteId === null) return;
        try {
            await api.delete(`/Contact/${deleteId}`);
            toast.success('Inquiry removed');
            setInquiries(prev => prev.filter(i => i.id !== deleteId));
        } catch (error) {
            console.error('Error deleting inquiry:', error);
            toast.error('Failed to delete inquiry');
        } finally {
            setDeleteId(null);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-16 container mx-auto px-4">
                <div className="flex items-center gap-3 mb-8">
                    <Mail className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">Contact Inquiries</h1>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        {inquiries.length} Total
                    </span>
                </div>

                {inquiries.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-2xl border border-border">
                        <p className="text-muted-foreground">No inquiries found.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {inquiries.map((inquiry) => (
                            <div key={inquiry.id} className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{inquiry.name}</h3>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {inquiry.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 bg-muted px-2 py-1 rounded">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(inquiry.submittedAt)}
                                            </div>
                                        </div>

                                        <div className="bg-muted/30 p-4 rounded-lg border border-border">
                                            <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase text-muted-foreground">
                                                <MessageSquare className="w-3 h-3" />
                                                Message
                                            </div>
                                            <p className="text-foreground whitespace-pre-wrap">{inquiry.message}</p>
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex md:flex-col gap-3 justify-end items-end">
                                        {inquiry.photoUrl && (
                                            <div className="relative group cursor-pointer" onClick={() => setViewPhotoUrl(inquiry.photoUrl!)}>
                                                <div className="w-24 h-24 rounded-lg overflow-hidden border border-border">
                                                    <img src={inquiry.photoUrl} alt="Inquiry" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                    <ImageIcon className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex md:flex-col gap-2">
                                            {!inquiry.isCompleted && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 px-3 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-medium"
                                                    onClick={async () => {
                                                        try {
                                                            await api.post(`/Contact/${inquiry.id}/complete`);
                                                            toast.success("Marked as completed");
                                                            setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, isCompleted: true } : i));
                                                        } catch (error) {
                                                            toast.error("Failed to complete");
                                                        }
                                                    }}
                                                >
                                                    <Check className="w-4 h-4 mr-1.5" />
                                                    Complete
                                                </Button>
                                            )}
                                            {inquiry.isCompleted && (
                                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> Done
                                                </span>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-9 px-3 border-destructive/30 text-destructive hover:bg-destructive/5"
                                                onClick={() => setDeleteId(inquiry.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1.5" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Photo Viewer Dialog */}
                <Dialog open={!!viewPhotoUrl} onOpenChange={(open) => !open && setViewPhotoUrl(null)}>
                    <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/90 border-none">
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-white hover:bg-white/20 z-10"
                                onClick={() => setViewPhotoUrl(null)}
                            >
                                <X className="w-6 h-6" />
                            </Button>
                            {viewPhotoUrl && (
                                <img src={viewPhotoUrl} alt="Full Size" className="w-full h-auto max-h-[85vh] object-contain mx-auto" />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this message? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </div>
    );
}
