// types/index.ts
export interface GigWorker {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Basic Information
  fullName: string;
  email: string;
  phoneNumber: string;
  
  // Government IDs
  aadharNo?: string;
  panNo?: string;
  uanNumber?: string;
  votersId?: string;
  
  // Education & Skills
  educationCertificate?: string;
  skills: string[];
  
  // Location Data
  homeGeoLocation?: string;
  workGeoLocation?: string;
  city?: string;
  state?: string;
  country: string;
  
  // Platform Information
  platform?: string;
  serviceType?: string;
  workerId?: string;
  
  // Performance Metrics
  rating?: number;
  totalJobs?: number;
  
  // Verification Status
  verificationLevel: string;
  backgroundCheckStatus: string;
  
  // Vehicle Information
  licenseNumber?: string;
  vehicleType?: string;
  
  // DID and Credential Information
  profileId?: string;
  address?: string;
  credentialId?: string;
  registryId?: string;
  mnemonic?: string;
  publicKey?: string;
  
  // Status
  isActive: boolean;
  joinDate: Date;
  
  // Batch Processing
  batchId?: string;
}

export interface CreateWorkerInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  aadharNo?: string;
  panNo?: string;
  uanNumber?: string;
  votersId?: string;
  educationCertificate?: string;
  skills: string[];
  homeGeoLocation?: string;
  workGeoLocation?: string;
  city?: string;
  state?: string;
  country?: string;
  platform?: string;
  serviceType?: string;
  licenseNumber?: string;
  vehicleType?: string;
}

// Alternative: Form data with skills as string (before processing)
export interface GigWorkerFormInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  aadharNo?: string;
  panNo?: string;
  uanNumber?: string;
  votersId?: string;
  educationCertificate?: string;
  skills: string; // String before splitting into array
  homeGeoLocation?: string;
  workGeoLocation?: string;
  city?: string;
  state?: string;
  country?: string;
  platform?: string;
  serviceType?: string;
  licenseNumber?: string;
  vehicleType?: string;
}

export interface ProfileResponse {
  message: string;
  profileId: string;
  address: string;
  mnemonic: string;
  publicKey: string;
  createdAt: number;
}

export interface CredentialResponse {
  identifier: string; // For backward compatibility
  credId: string;     // Actual field from API
  status: string;
  message: string;
  vc?: Record<string, unknown>;           // The full VC object
}

export interface Stats {
  total: number;
  verified: number;
  pending: number;
  active: number;
}

export interface BulkUploadData {
  name: string;
  mob: string;
  aadharNo: string;
  panNo: string;
  uanNo: string;
  votersId: string;
  edCertificate: string;
  geoLocationHome: string;
  geoLocation: string;
  city?: string;
  state?: string;
  platform?: string;
  serviceType?: string;
  vehicleType?: string;
  licenseNumber?: string;
  skills?: string;
}

export type ServiceType = 
  | 'ride_sharing'
  | 'food_delivery'
  | 'package_delivery'
  | 'home_services'
  | 'freelancing'
  | 'task_services';

export type VerificationLevel = 'basic' | 'verified' | 'premium';

export type BackgroundCheckStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type VehicleType = 
  | 'bike'
  | 'scooter'
  | 'car'
  | 'sedan'
  | 'suv'
  | 'truck'
  | 'bicycle'
  | 'on_foot';