
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrganizationSector, SECTOR_LABELS, mapSectorToTypeId } from '@/types/organization';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';
import axios from 'axios';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

const sectors: OrganizationSector[] = [
  'old_age_home',
  'cow_shelter',
  'orphanage',
  'animal_care',
  'education',
  'medical_aid',
  'other',
];

const organizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  sector: z.string().min(1, 'Please select a sector'),
  description: z.string().max(1000).optional(),
  address: z.string().max(200).optional(),
  city: z.string().min(2, 'City is required').max(50),
  state: z.string().min(2, 'State is required').max(50),
  contact_phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  contact_email: z.string().email('Invalid email').max(100).optional().or(z.literal('')),
  upi_id: z.string().max(50).optional().or(z.literal('')),
});

export default function AddOrganization() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [isCityDialogOpen, setIsCityDialogOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const capitalize = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

  const [formData, setFormData] = useState<{
    name: string;
    sector: string;
    description: string;
    address: string;
    city: string;
    state: string;
    contact_phone: string;
    contact_email: string;
    upi_id: string;
  }>({
    name: '',
    sector: '',
    description: '',
    address: '',
    city: '',
    state: '',
    contact_phone: '',
    contact_email: '',
    upi_id: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error('Please sign in to add an organization');
        navigate('/auth');
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get('/organizations/cities');
        setCities(res.data || []);
      } catch (e) {
        console.error("Failed to fetch cities", e);
      }
    };
    fetchCities();
  }, []);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSectorChange = (value: string) => {
    setFormData((prev) => ({ ...prev, sector: value }));
    setErrors((prev) => ({ ...prev, sector: '' }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length + selectedFiles.length > 5) {
      toast.error('You can upload a maximum of 5 images.');
      return;
    }

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleQrSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setQrCodeFile(file);
      setQrPreview(URL.createObjectURL(file));
    }
  };

  const removeQrCode = () => {
    setQrCodeFile(null);
    if (qrPreview) {
      URL.revokeObjectURL(qrPreview);
      setQrPreview(null);
    }
    if (qrInputRef.current) {
      qrInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]); // Cleanup
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = organizationSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload Images First
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const uploadData = new FormData();
        selectedFiles.forEach(file => {
          uploadData.append('files', file);
        });

        const uploadResponse = await api.post('/upload', uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        imageUrls = uploadResponse.data.urls;
      }

      // 1.5 Upload QR Code if exists
      let qrCodeUrl = null;
      if (qrCodeFile) {
        const qrFormData = new FormData();
        qrFormData.append('files', qrCodeFile);

        const qrUploadResponse = await api.post('/upload', qrFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (qrUploadResponse.data.urls && qrUploadResponse.data.urls.length > 0) {
          qrCodeUrl = qrUploadResponse.data.urls[0];
        }
      }

      // 2. Submit Organization Data
      const payload = {
        organizationName: formData.name,
        organizationTypeId: mapSectorToTypeId(formData.sector as OrganizationSector),
        description: formData.description || null,
        address: formData.address || null,
        city: formData.city,
        state: formData.state,
        contactPhone: formData.contact_phone || null,
        contactEmail: formData.contact_email || null,
        upiId: formData.upi_id || null,
        imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
        images: imageUrls.map(url => ({ imageUrl: url })), // Map to backend structure
        paymentQrImageUrl: qrCodeUrl,
        isActive: true
      };

      await api.post('/organizations/register', payload);

      toast.success('Organization submitted successfully! It will be visible once approved by a SuperAdmin.');
      navigate('/organizations');
    } catch (error: any) {
      console.error('Error:', error);
      const msg = error.response?.data?.title || 'Something went wrong. Please try again.';
      toast.error(msg);
    }

    setIsSubmitting(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-2">
              Add Organization
            </h1>
            <p className="text-muted-foreground">
              Phone: <a href="tel:+919316025425" className="text-primary hover:underline">+91 93160 25425</a>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Drag & Drop File Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Organization Images (Max 5)
                </label>

                <div
                  className="border-2 border-dashed border-input rounded-xl p-8 hover:bg-accent/5 transition-colors cursor-pointer flex flex-col items-center justify-center text-center group"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    SVG, PNG, JPG or GIF (max 5MB)
                  </p>
                </div>

                {/* Previews */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {previews.map((url, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                        <img
                          src={url}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* QR Code Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Donation QR Code (Optional)
                </label>

                <div className="flex items-start gap-4">
                  <div
                    className="border-2 border-dashed border-input rounded-xl p-4 hover:bg-accent/5 transition-colors cursor-pointer flex flex-col items-center justify-center text-center w-32 h-32"
                    onClick={() => qrInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      ref={qrInputRef}
                      className="hidden"
                      onChange={handleQrSelect}
                    />
                    {qrPreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={qrPreview}
                          alt="QR Preview"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeQrCode();
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Upload QR</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground pt-2">
                    <p>Upload your UPI QR code so users can scan and pay directly.</p>
                    <p className="text-xs mt-1">Recommended size: Square (1:1)</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Organization Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter organization name"
                  required
                />
                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Sector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sector / Type *
                </label>
                <Select value={formData.sector} onValueChange={handleSectorChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {SECTOR_LABELS[sector]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sector && <p className="text-destructive text-sm mt-1">{errors.sector}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the organization and its mission..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Address & City */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-foreground mb-2">
                    Address
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                    City *
                  </label>
                  <Popover open={isCityDialogOpen} onOpenChange={setIsCityDialogOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isCityDialogOpen}
                        className="w-full justify-between font-normal h-10 px-3 bg-background"
                      >
                        <div className="flex items-center truncate">
                          <MapPin className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                          {formData.city ? capitalize(formData.city) : "Select or type city"}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Enter city name..."
                          value={citySearch}
                          onValueChange={setCitySearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-primary"
                              onClick={() => {
                                handleInputChange({ target: { name: 'city', value: citySearch } } as any);
                                setIsCityDialogOpen(false);
                                setCitySearch('');
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add "{capitalize(citySearch)}"
                            </Button>
                          </CommandEmpty>
                          <CommandGroup>
                            {cities.map((city) => (
                              <CommandItem
                                key={city}
                                value={city}
                                onSelect={(currentValue) => {
                                  handleInputChange({ target: { name: 'city', value: currentValue } } as any);
                                  setIsCityDialogOpen(false);
                                  setCitySearch('');
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.city.toLowerCase() === city.toLowerCase() ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {capitalize(city)}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.city && <p className="text-destructive text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-foreground mb-2">
                    State *
                  </label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                    required
                  />
                  {errors.state && <p className="text-destructive text-sm mt-1">{errors.state}</p>}
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact_phone" className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    placeholder="Enter 10 digit phone number"
                  />
                  {errors.contact_phone && <p className="text-destructive text-sm mt-1">{errors.contact_phone}</p>}
                </div>
                <div>
                  <label htmlFor="contact_email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                  {errors.contact_email && <p className="text-destructive text-sm mt-1">{errors.contact_email}</p>}
                </div>
              </div>

              {/* UPI ID */}
              <div>
                <label htmlFor="upi_id" className="block text-sm font-medium text-foreground mb-2">
                  UPI ID (for donations)
                </label>
                <Input
                  id="upi_id"
                  name="upi_id"
                  value={formData.upi_id}
                  onChange={handleInputChange}
                  placeholder="Enter UPI ID"
                />
              </div>

              {/* Submit */}
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {selectedFiles.length > 0 ? 'Uploading & Adding...' : 'Adding Organization...'}
                  </>
                ) : (
                  'Add Organization'
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
