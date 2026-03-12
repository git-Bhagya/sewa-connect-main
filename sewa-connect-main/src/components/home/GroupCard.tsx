import { useState, useEffect } from 'react';
import { SewaGroup } from '@/types/organization';
import { MapPin, Phone, Mail, Users, Send, Loader2, Edit, Trash2, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface GroupCardProps {
    group: SewaGroup;
    onUpdate?: () => void;
}

export function GroupCard({ group, onUpdate }: GroupCardProps) {
    const { user } = useAuth();
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [helpFormData, setHelpFormData] = useState({
        userName: '',
        userEmail: '',
        userPhone: '',
        subject: '',
        message: '',
        imageUrl: ''
    });

    const [editFormData, setEditFormData] = useState({
        groupName: group.groupName,
        description: group.description || '',
        memberCount: group.memberCount,
        city: group.city,
        state: group.state,
        contactPhone: group.contactPhone || '',
        contactEmail: group.contactEmail || '',
        logoUrl: group.logoUrl || ''
    });

    useEffect(() => {
        setEditFormData({
            groupName: group.groupName,
            description: group.description || '',
            memberCount: group.memberCount,
            city: group.city,
            state: group.state,
            contactPhone: group.contactPhone || '',
            contactEmail: group.contactEmail || '',
            logoUrl: group.logoUrl || ''
        });
    }, [group]);

    const isOwnerOrAdmin = user && (user.role === 'SuperAdmin' || user.userId === group.createdBy);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isLogo: boolean = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        const uploadData = new FormData();
        uploadData.append('files', file);

        try {
            const response = await api.post('/Upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = response.data.urls[0];
            if (isLogo) {
                setEditFormData(prev => ({ ...prev, logoUrl: url }));
            } else {
                setHelpFormData(prev => ({ ...prev, imageUrl: url }));
            }
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleHelpRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post(`/Groups/${group.groupId}/request-help`, helpFormData);
            toast.success("Help request sent to the group!");
            setIsHelpModalOpen(false);
            setHelpFormData({ userName: '', userEmail: '', userPhone: '', subject: '', message: '', imageUrl: '' });
        } catch (error) {
            toast.error("Failed to send help request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(editFormData.contactPhone)) {
            toast.error("Phone number must be exactly 10 digits");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editFormData.contactEmail)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.put(`/Groups/${group.groupId}`, editFormData);
            toast.success("Group details updated successfully!");
            setIsEditModalOpen(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to update group", error);
            toast.error("Failed to update group. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${group.groupName}"? This action cannot be undone.`)) return;

        setIsDeleting(true);
        try {
            await api.delete(`/Groups/${group.groupId}`);
            toast.success("Group deleted successfully");
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to delete group", error);
            toast.error("Failed to delete group.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow border-primary/20 bg-gradient-to-b from-card to-primary/5 relative overflow-hidden group/card">
            {isOwnerOrAdmin && (
                <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-primary hover:text-white"
                        onClick={() => setIsEditModalOpen(true)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 bg-red-500/80 backdrop-blur-sm shadow-sm hover:bg-red-600"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                </div>
            )}

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        {group.logoUrl ? (
                            <div className="w-16 h-16 rounded-full border border-primary/20 overflow-hidden shadow-sm">
                                <img src={group.logoUrl} alt={group.groupName} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                Sewa Group
                            </Badge>
                        )}
                        {!group.isApproved && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                                Pending Approval
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
                        <Users className="w-3 h-3" />
                        <span>{group.memberCount}+ Members</span>
                    </div>
                </div>
                <CardTitle className="font-serif text-xl group-hover/card:text-primary transition-colors flex items-center gap-2">
                    {group.groupName}
                    {group.isApproved && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-grow space-y-4 pt-2">
                {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 italic">
                        "{group.description}"
                    </p>
                )}

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <span>{group.city}, {group.state}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <Phone className="w-4 h-4 text-primary shrink-0" />
                        <a href={`tel:${group.contactPhone}`} className="hover:underline">{group.contactPhone}</a>
                    </div>

                    {group.contactEmail && (
                        <div className="flex items-center gap-2 text-sm text-foreground/80">
                            <Mail className="w-4 h-4 text-primary shrink-0" />
                            <span className="truncate">{group.contactEmail}</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="pt-4 border-t gap-2">
                <Dialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full gap-2 group shadow-md shadow-primary/20" variant="default">
                            <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            Send Help Request
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Request Help from {group.groupName}</DialogTitle>
                            <DialogDescription className="text-xs">
                                Fill out this form to send an automatic help request to the group's email.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleHelpRequest} className="space-y-3 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider">Your Name</label>
                                    <Input
                                        required
                                        value={helpFormData.userName}
                                        onChange={e => setHelpFormData({ ...helpFormData, userName: e.target.value })}
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider">Phone</label>
                                    <Input
                                        required
                                        value={helpFormData.userPhone}
                                        onChange={e => setHelpFormData({ ...helpFormData, userPhone: e.target.value })}
                                        placeholder="Number"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider">Email (Optional)</label>
                                <Input
                                    type="email"
                                    value={helpFormData.userEmail}
                                    onChange={e => setHelpFormData({ ...helpFormData, userEmail: e.target.value })}
                                    placeholder="For group to reply"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider">Problem Subject</label>
                                <Input
                                    required
                                    value={helpFormData.subject}
                                    onChange={e => setHelpFormData({ ...helpFormData, subject: e.target.value })}
                                    placeholder="e.g. Injured Cow near MG Road"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider">Describe the Situation</label>
                                <Textarea
                                    required
                                    value={helpFormData.message}
                                    onChange={e => setHelpFormData({ ...helpFormData, message: e.target.value })}
                                    placeholder="Provide location details and problem..."
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-1 mt-2">
                                <label className="text-xs font-bold uppercase tracking-wider">Attach Photo (Optional)</label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => handleImageUpload(e, false)}
                                        className="text-xs h-8"
                                        disabled={uploadingImage}
                                    />
                                    {uploadingImage && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                                    {helpFormData.imageUrl && !uploadingImage && (
                                        <div className="w-8 h-8 rounded border overflow-hidden shrink-0">
                                            <img src={helpFormData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <DialogFooter className="mt-4">
                                <Button type="submit" disabled={isSubmitting || uploadingImage} className="w-full">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Request via Email"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardFooter>

            {/* Edit Group Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Group: {group.groupName}</DialogTitle>
                        <DialogDescription>
                            Update the details of your Sewa Group.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wide">Group Name</label>
                            <Input
                                required
                                value={editFormData.groupName}
                                onChange={e => setEditFormData({ ...editFormData, groupName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wide">Description</label>
                            <Textarea
                                required
                                value={editFormData.description}
                                onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wide">Members</label>
                                <Input
                                    type="number"
                                    min="1"
                                    required
                                    value={editFormData.memberCount}
                                    onChange={e => setEditFormData({ ...editFormData, memberCount: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wide">City</label>
                                <Input
                                    required
                                    value={editFormData.city}
                                    onChange={e => setEditFormData({ ...editFormData, city: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wide">Phone</label>
                                <Input
                                    required
                                    value={editFormData.contactPhone}
                                    onChange={e => setEditFormData({ ...editFormData, contactPhone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase tracking-wide">Email</label>
                                <Input
                                    type="email"
                                    required
                                    value={editFormData.contactEmail}
                                    onChange={e => setEditFormData({ ...editFormData, contactEmail: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-wide">Group Logo</label>
                            <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => handleImageUpload(e, true)}
                                    disabled={uploadingImage}
                                />
                                {uploadingImage && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                                {editFormData.logoUrl && !uploadingImage && (
                                    <div className="relative w-12 h-12 rounded-full border-2 border-primary/20 overflow-hidden shrink-0">
                                        <img src={editFormData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                                            onClick={() => setEditFormData(prev => ({ ...prev, logoUrl: '' }))}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting || uploadingImage}>
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
