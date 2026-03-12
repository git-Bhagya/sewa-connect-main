import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Requirement } from '@/types/organization';
import api from '@/services/api';
import { toast } from 'sonner';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
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

interface RequirementsManagerProps {
    organizationId: string;
    initialRequirements: Requirement[];
    onUpdate: () => void; // Callback to refresh data
}

export function RequirementsManager({ organizationId, initialRequirements, onUpdate }: RequirementsManagerProps) {
    const [requirements, setRequirements] = useState<Requirement[]>(initialRequirements);
    const [newTitle, setNewTitle] = useState('');
    const [newType, setNewType] = useState('Other');
    const [loading, setLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleAdd = async () => {
        if (!newTitle.trim()) {
            toast.error("Please enter a requirement title");
            return;
        }

        setLoading(true);
        try {
            await api.post('/requirements', {
                organizationId: Number(organizationId),
                title: newTitle,
                type: newType,
                description: '', // Optional
                isActive: true
            });
            toast.success("Requirement added");
            setNewTitle('');
            onUpdate(); // Trigger refresh
        } catch (error) {
            console.error(error);
            toast.error("Failed to add requirement");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await api.delete(`/requirements/${deleteId}`);
            toast.success("Requirement removed");
            setDeleteId(null);
            onUpdate();
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove requirement");
        }
    };

    return (
        <Card className="mt-6 border-destructive/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    Urgent Help Requirements
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* List */}
                    <div className="space-y-2">
                        {requirements.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-3 bg-muted rounded-md border border-border">
                                <div>
                                    <div className="font-semibold flex items-center gap-2">
                                        {req.title}
                                        <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                                            {req.type}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Posted: {new Date(req.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setDeleteId(req.id)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        {requirements.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No active requirements posted.</p>
                        )}
                    </div>

                    {/* Add Form */}
                    <div className="pt-4 border-t border-border">
                        <h4 className="text-sm font-medium mb-3">Post New Requirement</h4>
                        <div className="grid gap-3 md:grid-cols-[2fr,1fr,auto]">
                            <Input
                                placeholder="Enter requirement title..."
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                            />
                            <Select value={newType} onValueChange={setNewType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Food">Food</SelectItem>
                                    <SelectItem value="Money">Money</SelectItem>
                                    <SelectItem value="Clothes">Clothes</SelectItem>
                                    <SelectItem value="Medical">Medical</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleAdd} disabled={loading}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                            </Button>
                        </div>
                    </div>
                </div>

                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently remove the requirement. This action cannot be undone.
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
            </CardContent>
        </Card>
    );
}
