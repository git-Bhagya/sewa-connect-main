import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Camera, Loader2 } from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
        photoUrl: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData({ ...formData, photoUrl: base64String });
                setPreviewUrl(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await api.post("/Contact", formData);
            toast.success("Thank you! Your message has been sent.");
            setFormData({ name: "", email: "", message: "", photoUrl: "" });
            setPreviewUrl(null);
        } catch (error: any) {
            console.error("Submission error:", error);
            toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Contact Us</h1>
                        <p className="text-muted-foreground text-lg">
                            Have questions or want to register your organization? Reach out to us.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Email</h3>
                                    <a href="mailto:bhagyapatel832002@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                                        bhagyapatel832002@gmail.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Phone className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Phone</h3>
                                    <a href="tel:+919316025425" className="text-muted-foreground hover:text-primary transition-colors">
                                        +91 93160 25425
                                    </a>
                                    <p className="text-xs text-muted-foreground mt-1">(Mon-Fri, 9am - 6pm)</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Name</label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter name"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Email</label>
                                    <Input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Message</label>
                                    <Textarea
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Enter message"
                                        rows={4}
                                        className="resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium mb-1 block">Share Photo (Optional)</label>
                                    <div className="flex flex-col items-center gap-4">
                                        {previewUrl ? (
                                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-2 right-2"
                                                    onClick={() => {
                                                        setPreviewUrl(null);
                                                        setFormData({ ...formData, photoUrl: "" });
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="w-full border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-2 hover:bg-accent/50 transition-colors cursor-pointer relative">
                                                <Camera className="w-8 h-8 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground text-center">Click to upload or drag photo</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        "Send Message"
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </main >
        </div >
    );
}
