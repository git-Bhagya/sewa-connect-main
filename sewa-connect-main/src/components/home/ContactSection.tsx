import { Mail, Phone, MapPin, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';
import api from '@/services/api';

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    photoUrl: ''
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setFormData(prev => ({ ...prev, photoUrl: url }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/Contact', formData);
      toast.success('Thank you for your message! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        photoUrl: ''
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground">
              Have questions or want to partner with us? We'd love to hear from you.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Contact Info */}
            <div className="md:col-span-2 grid grid-cols-1 gap-8">
              {/* Phone */}
              <Card className="hover:shadow-lg transition-all border-border/50">
                <CardContent className="flex flex-col items-center text-center p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-2">Call Us</h3>
                  <p className="text-muted-foreground mb-4">
                    Mon-Fri from 8am to 5pm
                  </p>
                  <a href="tel:+919316025425" className="text-primary font-medium hover:underline">
                    +91 93160 25425
                  </a>
                </CardContent>
              </Card>

              {/* Email */}
              <Card className="hover:shadow-lg transition-all border-border/50">
                <CardContent className="flex flex-col items-center text-center p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-2">Email Us</h3>
                  <p className="text-muted-foreground mb-4">
                    Speak to our team
                  </p>
                  <a href="mailto:bhagyapatel832002@gmail.com" className="text-primary font-medium hover:underline">
                    bhagyapatel832002@gmail.com
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-3">
              <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-card border border-border">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Your Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      required
                      className="bg-background"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      className="bg-background"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="How can we help?"
                    required
                    className="bg-background"
                    value={formData.subject}
                    onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={5}
                    required
                    className="bg-background resize-none"
                    value={formData.message}
                    onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Attach Image (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                      disabled={uploadingImage}
                    />
                    {uploadingImage && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
                    {formData.photoUrl && !uploadingImage && (
                      <div className="w-10 h-10 rounded border overflow-hidden shrink-0">
                        <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || uploadingImage}>
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

