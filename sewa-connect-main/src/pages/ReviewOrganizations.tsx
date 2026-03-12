import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Organization, mapApiToOrganization } from '@/types/organization';
import { formatDate } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, Building2, Pencil, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SECTOR_LABELS, OrganizationSector } from '@/types/organization';

export default function ReviewOrganizations() {
    const { user, isSuperAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [rejectId, setRejectId] = useState<string | null>(null);

    // Form state for editing
    const [editForm, setEditForm] = useState<Partial<Organization>>({});

    useEffect(() => {
        if (!authLoading) {
            if (!user || !isSuperAdmin) {
                toast.error('Unauthorized. Only SuperAdmins can review organizations.');
                navigate('/');
                return;
            }
            fetchPendingOrganizations();
        }
    }, [user, isSuperAdmin, authLoading, navigate]);

    const fetchPendingOrganizations = async () => {
        try {
            const response = await api.get('/organizations/pending');
            // Assuming backend returns ApiOrganization list, map it
            const mappedOrgs = response.data.map((org: any) => mapApiToOrganization(org));
            setOrganizations(mappedOrgs);
        } catch (error) {
            console.error('Error fetching pending organizations:', error);
            toast.error('Failed to load pending organizations');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        try {
            await api.post(`/organizations/${id}/approve`);
            toast.success('Organization approved successfully');
            setOrganizations(prev => prev.filter(org => org.id !== id));
        } catch (error) {
            console.error('Error approving organization:', error);
            toast.error('Failed to approve organization');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectClick = (id: string) => {
        setRejectId(id);
    };

    const confirmReject = async () => {
        if (!rejectId) return;

        setProcessingId(rejectId);
        try {
            await api.delete(`/organizations/${rejectId}`);
            toast.success('Organization rejected/removed');
            setOrganizations(prev => prev.filter(org => org.id !== rejectId));
        } catch (error) {
            console.error('Error rejecting organization:', error);
            toast.error('Failed to reject organization');
        } finally {
            setProcessingId(null);
            setRejectId(null);
        }
    };

    const handleEditClick = (org: Organization) => {
        setEditingOrg(org);
        setEditForm({
            name: org.name,
            description: org.description,
            city: org.city,
            state: org.state,
            sector: org.sector,
            contact_phone: org.contact_phone,
            contact_email: org.contact_email,
            upi_id: org.upi_id
        });
        setIsDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingOrg) return;

        // Basic validation
        if (!editForm.name || !editForm.city || !editForm.state) {
            toast.error("Name, City, and State are required");
            return;
        }

        try {
            // Construct the complete organization object to avoid 400 or data loss
            // We must map sector string back to ID.
            const organizationTypeId = getSectorId(editForm.sector || editingOrg.sector);

            // Merge existing org with edit form
            // Remove frontend-only fields that might confuse backend if it uses strict binding, 
            // though backend C# model binding typically ignores extra JSON fields unless strict.
            // Our backend Controller takes "Organization" model.
            // The Organization model has "OrganizationId", "OrganizationName", etc. 
            // My 'payload' construction above uses mismatched keys (frontend "name" vs backend "OrganizationName").
            // "editingOrg" is the frontend mapped version. sending IT back is wrong if keys differ.
            // I need to send the BACKEND casing/structure expected by `PostOrganization` (DTO).
            // Actually, `PutOrganization` takes `Organization` entity.

            const apiPayload = {
                organizationId: Number(editingOrg.id),
                organizationName: editForm.name,
                description: editForm.description,
                city: editForm.city,
                state: editForm.state,
                contactPhone: editForm.contact_phone,
                contactEmail: editForm.contact_email,
                upiId: editForm.upi_id,
                organizationTypeId: organizationTypeId,
                // Preserve other fields
                imageUrl: editingOrg.image_url,
                paymentQrImageUrl: editingOrg.qr_code_url, // Fix property name to match backend
                createdBy: editingOrg.created_by, // if needed
                isApproved: false, // Pending orgs are not approved yet
                isActive: true // preserve or default
            };

            await api.put(`/organizations/${editingOrg.id}`, apiPayload);

            toast.success("Organization updated");
            setIsDialogOpen(false);
            // Refresh list
            fetchPendingOrganizations();
        } catch (error) {
            console.error("Update failed", error);
            // Log response data for debugging
            // @ts-ignore
            if (error.response?.data) console.error("Server error details:", error.response.data);
            toast.error("Failed to update organization");
        }
    };

    // Helper (temporary/duplicate to avoid import mess in this single tool call)
    const getSectorId = (sector: OrganizationSector) => {
        const map: Record<string, number> = {
            'cow_shelter': 1, 'old_age_home': 2, 'orphanage': 3,
            'animal_care': 4, 'education': 5, 'medical_aid': 6, 'other': 7
        };
        return map[sector] || 7;
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
                    <Building2 className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">Review Organizations</h1>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        {organizations.length} Pending
                    </span>
                </div>

                {organizations.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-2xl border border-border">
                        <p className="text-muted-foreground">No pending organizations to review.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {organizations.map((org) => (
                            <div key={org.id} className="bg-card rounded-xl p-6 border border-border flex flex-col md:flex-row gap-6 items-start">
                                {/* Image Preview */}
                                <div className="w-full md:w-48 aspect-video bg-muted rounded-lg overflow-hidden shrink-0">
                                    {org.image_url ? (
                                        <img src={org.image_url} alt={org.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No Image</div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold">{org.name}</h3>
                                            <p className="text-sm text-primary font-medium capitalize">{org.sector.replace('_', ' ')}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                            ID: {org.id}
                                        </span>
                                    </div>

                                    <p className="text-muted-foreground text-sm line-clamp-2">
                                        {org.description || "No description"}
                                    </p>

                                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                        <span>{org.city}, {org.state}</span>
                                        {org.contact_email && <span>{org.contact_email}</span>}
                                        {org.contact_phone && <span>{org.contact_phone}</span>}
                                    </div>

                                    {/* Payment Details */}
                                    {(org.upi_id || org.qr_code_url) && (
                                        <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Payment Verification</h4>
                                            <div className="flex flex-wrap gap-6 items-center">
                                                {org.upi_id && (
                                                    <div className="text-sm">
                                                        <span className="text-muted-foreground mr-2">UPI ID:</span>
                                                        <span className="font-medium font-mono bg-background px-2 py-1 rounded border">{org.upi_id}</span>
                                                    </div>
                                                )}
                                                {org.qr_code_url && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">QR Code:</span>
                                                        <a href={org.qr_code_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">View Full</a>
                                                        <img src={org.qr_code_url} alt="QR" className="w-12 h-12 object-cover rounded border bg-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-xs mt-3">
                                        Created: {formatDate(org.created_at)}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                                    <Button
                                        onClick={() => handleApprove(org.id)}
                                        disabled={processingId === org.id}
                                        className="w-full md:w-32 bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {processingId === org.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                        Approve
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleRejectClick(org.id)}
                                        disabled={processingId === org.id}
                                        className="w-full md:w-32"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleEditClick(org)}
                                        className="w-full md:w-32"
                                    >
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        ))
                        }
                    </div >
                )}

                {/* Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Organization</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Organization Name</Label>
                                <Input
                                    id="name"
                                    value={editForm.name || ''}
                                    placeholder="Enter organization name"
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="sector">Sector</Label>
                                    <Select
                                        value={editForm.sector}
                                        onValueChange={(val) => setEditForm({ ...editForm, sector: val as OrganizationSector })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select sector" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(SECTOR_LABELS).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={editForm.city || ''}
                                        placeholder="Enter city"
                                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        value={editForm.state || ''}
                                        placeholder="Enter state"
                                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={editForm.contact_phone || ''}
                                        placeholder="Enter phone number"
                                        onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={editForm.contact_email || ''}
                                        placeholder="Enter email"
                                        onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="upi">UPI ID</Label>
                                    <Input
                                        id="upi"
                                        value={editForm.upi_id || ''}
                                        placeholder="Enter UPI ID"
                                        onChange={(e) => setEditForm({ ...editForm, upi_id: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Textarea
                                    id="description"
                                    value={editForm.description || ''}
                                    placeholder="Enter organization description"
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveEdit}>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={!!rejectId} onOpenChange={(open) => !open && setRejectId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Reject Organization</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to reject and remove this organization? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmReject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Reject
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main >
        </div >
    );
}
