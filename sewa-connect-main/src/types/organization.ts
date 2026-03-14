export type OrganizationSector =
  | 'old_age_home'
  | 'cow_shelter'
  | 'orphanage'
  | 'animal_care'
  | 'education'
  | 'medical_aid'
  | 'other';

export interface Organization {
  id: string; // Frontend uses string, backend int. We'll convert.
  name: string;
  sector: OrganizationSector;
  description: string | null;
  address: string | null;
  city: string;
  state: string;
  contact_phone: string | null;
  contact_email: string | null;
  upi_id: string | null;
  qr_code_url: string | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  images: string[];
  requirements: Requirement[];
}

export interface SewaGroup {
  groupId: number;
  groupName: string;
  description: string | null;
  memberCount: number;
  city: string;
  state: string;
  contactPhone: string | null;
  contactEmail: string | null;
  logoUrl: string | null;
  isApproved: boolean;
  createdBy: number | null;
  createdAt: string;
}

export interface Requirement {
  id: number;
  title: string;
  description: string | null;
  type: 'Food' | 'Money' | 'Clothes' | 'Medical' | 'Other';
  isActive: boolean;
  createdAt: string;
}

export interface ApiOrganization {
  organizationId: number;
  organizationName: string;
  organizationTypeId: number;
  organizationType?: {
    organizationTypeId: number;
    typeName: string;
  };
  description: string | null;
  address: string | null;
  city: string;
  state: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  imageUrl: string | null;
  paymentQrImageUrl: string | null;
  upiId: string | null;
  isActive: boolean;
  createdAt: string;
  createdBy: number | null;
  images: { id: number; imageUrl: string; }[];
  requirements?: { // Optional because older API responses might not have it yet, or depends on Include
    id: number;
    title: string;
    description: string | null;
    type: string;
    isActive: boolean;
    createdAt: string;
  }[];
}

// Map Backend Type ID to Frontend Sector
export const mapTypeIdToSector = (id: number): OrganizationSector => {
  switch (id) {
    case 1: return 'cow_shelter';
    case 2: return 'old_age_home';
    case 3: return 'orphanage';
    case 4: return 'animal_care';
    case 5: return 'education';
    case 6: return 'medical_aid';
    default: return 'other';
  }
};

export const mapSectorToTypeId = (sector: OrganizationSector): number => {
  switch (sector) {
    case 'cow_shelter': return 1;
    case 'old_age_home': return 2;
    case 'orphanage': return 3;
    case 'animal_care': return 4;
    case 'education': return 5;
    case 'medical_aid': return 6;
    default: return 7; // Assuming 7 or other for 'other'
  }
};

import { API_BASE_URL } from '../services/api';

const getFullImageUrl = (url: string | null) => {
  if (!url) return null;
  // If it's already a full external URL, return it
  if (url.startsWith('http') && !url.includes('localhost') && !url.includes('127.0.0.1')) return url;

  // Get the base API URL without /api trailing path
  const apiBase = API_BASE_URL.replace('/api', '');

  // If the stored URL is absolute localhost but with wrong port, replace it
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    const segments = url.split('/');
    // segments[0] = http:, segments[1] = '', segments[2] = localhost:XXXX
    const path = segments.slice(3).join('/');
    return `${apiBase}/${path}`;
  }

  // If it's a relative path, prefix it
  if (url.startsWith('/')) return `${apiBase}${url}`;

  return `${apiBase}/${url}`;
};

export const mapApiToOrganization = (apiOrg: ApiOrganization): Organization => {
  return {
    id: apiOrg.organizationId.toString(),
    name: apiOrg.organizationName,
    sector: mapTypeIdToSector(apiOrg.organizationTypeId),
    description: apiOrg.description,
    address: apiOrg.address,
    city: apiOrg.city || '',
    state: apiOrg.state || '',
    contact_phone: apiOrg.contactPhone,
    contact_email: apiOrg.contactEmail,
    upi_id: apiOrg.upiId,
    qr_code_url: getFullImageUrl(apiOrg.paymentQrImageUrl),
    image_url: getFullImageUrl(apiOrg.imageUrl),
    created_by: apiOrg.createdBy ? apiOrg.createdBy.toString() : null,
    created_at: apiOrg.createdAt,
    updated_at: apiOrg.createdAt, // Backend doesn't have updated_at yet
    images: apiOrg.images ? apiOrg.images.map(img => getFullImageUrl(img.imageUrl) as string) : [],
    requirements: apiOrg.requirements ? apiOrg.requirements.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type as any, // Cast to union type
      isActive: r.isActive,
      createdAt: r.createdAt
    })) : [],
  };
};

export const SECTOR_LABELS: Record<OrganizationSector, string> = {
  old_age_home: 'Old Age Home',
  cow_shelter: 'Cow Shelter (Gaushala)',
  orphanage: 'Orphanage',
  animal_care: 'Animal Care',
  education: 'Education Support',
  medical_aid: 'Medical Aid',
  other: 'Other',
};

export const SECTOR_ICONS: Record<OrganizationSector, string> = {
  old_age_home: '👴',
  cow_shelter: '🐄',
  orphanage: '👶',
  animal_care: '🐾',
  education: '📚',
  medical_aid: '🏥',
  other: '🤝',
};
