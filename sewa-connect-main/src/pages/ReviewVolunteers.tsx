import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Check, X, Shield, Mail, Phone, MapPin, Calendar, Search, UserCheck, Clock, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Trash2, Plus, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Volunteer {
    volunteerId: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    aadharNumber: string;
    address: string;
    city: string;
    occupation: string | null;
    skills: string | null;
    availability: string | null;
    isApproved: boolean;
    createdAt: string;
}

export default function ReviewVolunteers() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination state
    const itemsPerPage = 7;
    const [currentPage, setCurrentPage] = useState(1);

    // Add/Edit Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        aadharNumber: '',
        address: '',
        city: '',
        occupation: '',
        skills: '',
        availability: 'Flexible',
        isApproved: true
    });

    useEffect(() => {
        if (!authLoading && (!user || (user.role !== 'SuperAdmin' && user.role !== 'Admin'))) {
            navigate('/');
        }
    }, [user, authLoading, navigate]);

    const fetchVolunteers = async () => {
        setIsLoading(true);
        try {
            // Get all volunteers and we'll split them locally for the dual-view
            const response = await api.get('/volunteers/list');
            setVolunteers(response.data || []);
        } catch (error) {
            console.error('Error fetching volunteers:', error);
            toast.error('Failed to load volunteers');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'SuperAdmin' || user?.role === 'Admin') {
            fetchVolunteers();
        }
    }, [user]);

    const handleApprove = async (id: number) => {
        try {
            await api.post(`/volunteers/approve/${id}`);
            toast.success('Volunteer approved successfully');
            fetchVolunteers();
        } catch (error) {
            toast.error('Failed to approve volunteer');
        }
    };

    const handleReject = async (id: number) => {
        try {
            await api.delete(`/volunteers/delete/${id}`);
            toast.success('Volunteer removed');
            fetchVolunteers();
        } catch (error) {
            toast.error('Failed to remove volunteer');
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({
            fullName: '',
            email: '',
            phoneNumber: '',
            aadharNumber: '',
            address: '',
            city: '',
            occupation: '',
            skills: '',
            availability: 'Flexible',
            isApproved: true
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (v: Volunteer) => {
        setEditingId(v.volunteerId);
        setFormData({
            fullName: v.fullName,
            email: v.email,
            phoneNumber: v.phoneNumber,
            aadharNumber: v.aadharNumber,
            address: v.address,
            city: v.city,
            occupation: v.occupation || '',
            skills: v.skills || '',
            availability: v.availability || 'Flexible',
            isApproved: v.isApproved
        });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingId) {
                await api.put(`/volunteers/update/${editingId}`, formData);
                toast.success('Volunteer updated');
            } else {
                await api.post('/volunteers/create', formData);
                toast.success('Volunteer added');
            }
            setIsModalOpen(false);
            fetchVolunteers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filtered data
    const filtered = volunteers.filter(v =>
        v.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingVolunteers = filtered.filter(v => !v.isApproved);
    const approvedVolunteers = filtered.filter(v => v.isApproved);

    // Pagination logic for Approved Volunteers
    const totalPages = Math.ceil(approvedVolunteers.length / itemsPerPage);
    const paginatedApproved = approvedVolunteers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="flex items-center justify-center py-32">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                        <div className="flex items-center gap-3">
                            <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
                                <Shield className="w-8 h-8 text-primary" />
                                Volunteer Management
                            </h1>
                            {user?.role === 'SuperAdmin' && (
                                <Button size="sm" onClick={handleOpenAdd} className="bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none">
                                    <Plus className="w-4 h-4 mr-1" /> Add Volunteer
                                </Button>
                            )}
                        </div>

                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, city..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Pending Section */}
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <Clock className="w-5 h-5 text-amber-500" />
                            <h2 className="text-xl font-bold font-serif">Pending Review</h2>
                            {pendingVolunteers.length > 0 && (
                                <Badge variant="destructive">{pendingVolunteers.length}</Badge>
                            )}
                        </div>

                        {pendingVolunteers.length === 0 ? (
                            <div className="text-center py-12 bg-card rounded-2xl border border-dashed text-muted-foreground">
                                No pending applications found.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingVolunteers.map(volunteer => (
                                    <Card key={volunteer.volunteerId} className="border-border hover:shadow-lg transition-shadow">
                                        <CardHeader className="bg-muted/30 pb-4">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg font-serif">{volunteer.fullName}</CardTitle>
                                                <Badge variant="outline" className="bg-background text-[10px] uppercase font-bold text-amber-600 border-amber-500/20">Pending</Badge>
                                            </div>
                                            <CardDescription className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Applied on {formatDate(volunteer.createdAt)}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Mail className="w-4 h-4 shrink-0" /> {volunteer.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Phone className="w-4 h-4 shrink-0" /> {volunteer.phoneNumber}
                                                </div>
                                                <div className="flex items-start gap-2 text-muted-foreground">
                                                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                                    <span className="line-clamp-1">{volunteer.city}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-foreground font-medium pt-1">
                                                    <Shield className="w-4 h-4 text-primary shrink-0" /> {volunteer.aadharNumber}
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-4 border-t">
                                                <Button className="flex-1 bg-primary" size="sm" onClick={() => handleApprove(volunteer.volunteerId)}>
                                                    <Check className="w-4 h-4 mr-2" /> Approve
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                                                            <X className="w-4 h-4 mr-2" /> Reject
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Reject Application?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will remove <strong>{volunteer.fullName}</strong>'s application. They will be able to apply again if needed.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleReject(volunteer.volunteerId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                Confirm Reject
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* All Volunteers Table Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <UserCheck className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold font-serif">Approved Volunteers</h2>
                        </div>

                        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-muted/50 border-b border-border">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Location & Address</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Availability & Skills</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border text-sm">
                                        {paginatedApproved.map(v => (
                                            <tr key={v.volunteerId} className="hover:bg-muted/10 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold">{v.fullName}</div>
                                                    <div className="text-[10px] font-mono text-muted-foreground uppercase">{v.aadharNumber}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>{v.email}</div>
                                                    <div className="text-xs text-muted-foreground">{v.phoneNumber}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium">{v.city}</div>
                                                    <div className="text-[10px] text-muted-foreground max-w-[150px] truncate" title={v.address}>
                                                        {v.address}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant="outline" className="text-[10px] w-fit">{v.availability}</Badge>
                                                        {v.skills && (
                                                            <div className="text-[10px] text-muted-foreground max-w-[120px] truncate" title={v.skills}>
                                                                {v.skills}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenEdit(v)} title="Edit">
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Remove">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Volunteer?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to remove <strong>{v.fullName}</strong> as a volunteer? This cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleReject(v.volunteerId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {approvedVolunteers.length === 0 && (
                                <div className="px-6 py-12 text-center text-muted-foreground italic border-t">
                                    No approved volunteers found.
                                </div>
                            )}

                            {/* Pagination Footer */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">
                                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, approvedVolunteers.length)} of {approvedVolunteers.length}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <div className="flex items-center px-4 text-sm font-medium">
                                            {currentPage} / {totalPages}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add/Edit Dialog */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="font-serif text-2xl">{editingId ? 'Edit Volunteer' : 'Add New Volunteer'}</DialogTitle>
                            <DialogDescription>
                                Fill in the details to {editingId ? 'update' : 'manually add'} a volunteer to the system.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Full Name</label>
                                    <Input name="fullName" value={formData.fullName} onChange={handleFormChange} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Email</label>
                                    <Input name="email" type="email" value={formData.email} onChange={handleFormChange} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Phone Number</label>
                                    <Input name="phoneNumber" value={formData.phoneNumber} onChange={handleFormChange} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Aadhaar Number</label>
                                    <Input name="aadharNumber" value={formData.aadharNumber} onChange={handleFormChange} required maxLength={12} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Address</label>
                                <Textarea name="address" value={formData.address} onChange={handleFormChange} required rows={2} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">City</label>
                                    <Input name="city" value={formData.city} onChange={handleFormChange} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Availability</label>
                                    <Select
                                        value={formData.availability}
                                        onValueChange={(v) => setFormData(p => ({ ...p, availability: v }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Full Week">Full Week</SelectItem>
                                            <SelectItem value="Weekends Only">Weekends Only</SelectItem>
                                            <SelectItem value="Evenings Only">Evenings Only</SelectItem>
                                            <SelectItem value="Flexible">Flexible</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Skills (Comma separated)</label>
                                <Input name="skills" value={formData.skills} onChange={handleFormChange} placeholder="Cooking, First Aid, Driving..." />
                            </div>
                            <DialogFooter className="pt-6">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? 'Update Volunteer' : 'Add Volunteer')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
