-- Create sectors enum type
CREATE TYPE public.organization_sector AS ENUM (
  'old_age_home',
  'cow_shelter',
  'orphanage',
  'animal_care',
  'education',
  'medical_aid',
  'other'
);

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sector organization_sector NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  upi_id TEXT,
  qr_code_url TEXT,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Everyone can view organizations (public data)
CREATE POLICY "Organizations are viewable by everyone"
ON public.organizations FOR SELECT
USING (true);

-- Only authenticated users can create organizations
CREATE POLICY "Authenticated users can create organizations"
ON public.organizations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Only creators can update their organizations
CREATE POLICY "Users can update their own organizations"
ON public.organizations FOR UPDATE
USING (auth.uid() = created_by);

-- Only creators can delete their organizations
CREATE POLICY "Users can delete their own organizations"
ON public.organizations FOR DELETE
USING (auth.uid() = created_by);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- Users can create their own profile
CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for organization images
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-images', 'organization-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to organization images
CREATE POLICY "Organization images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-images');

-- Allow authenticated users to upload organization images
CREATE POLICY "Authenticated users can upload organization images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'organization-images' AND auth.uid() IS NOT NULL);

-- Allow users to update their uploaded images
CREATE POLICY "Users can update organization images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'organization-images' AND auth.uid() IS NOT NULL);

-- Allow users to delete their uploaded images
CREATE POLICY "Users can delete organization images"
ON storage.objects FOR DELETE
USING (bucket_id = 'organization-images' AND auth.uid() IS NOT NULL);