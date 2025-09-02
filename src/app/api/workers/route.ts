// app/api/workers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CreateWorkerInput, ProfileResponse, CredentialResponse } from '@/types';

const prisma = new PrismaClient();

const API_BASE_URL = 'http://20.193.138.24:5106/api/v1';
const BEARER_TOKEN = 'fb5fbd27fecf0ad32398b0e6b2a60853653bdc0d0c576ec976960a14882e9328';
const REGISTRY_ADDRESS = '76EU8Crvp9e7wZN77TcwAfKAKfvwYkLiU6Jd1cBQoKqzfJbxWn9GUB'; // Updated with your registry address

// Helper function to create DID profile
async function createProfile(): Promise<ProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/profile/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create profile');
  }

  return await response.json();
}

// Helper function to issue VC
async function issueCredential(workerData: CreateWorkerInput, profileAddress: string): Promise<CredentialResponse> {
  const vcPayload = {
    schema: {
      title: "gig_worker_credential_registry",
      description: "Registry for verifiable credentials of gig economy workers with comprehensive identity and work information",
      type: "object",
      properties: {
        fullName: { type: "string" },
        email: { type: "string", format: "email" },
        phoneNumber: { type: "string" },
        workerId: { type: "string" },
        platform: { type: "string" },
        serviceType: {
          type: "string",
          enum: ["ride_sharing", "food_delivery", "package_delivery", "home_services", "freelancing", "task_services"]
        },
        rating: { type: "number", minimum: 0, maximum: 5 },
        totalJobs: { type: "integer", minimum: 0 },
        verificationLevel: {
          type: "string",
          enum: ["basic", "verified", "premium"]
        },
        skills: {
          type: "array",
          items: { type: "string" }
        },
        location: {
          type: "object",
          properties: {
            city: { type: "string" },
            state: { type: "string" },
            country: { type: "string" },
            zipCode: { type: "string" }
          },
          required: ["city", "country"]
        },
        licenseNumber: { type: "string" },
        vehicleType: {
          type: "string",
          enum: ["bike", "scooter", "car", "sedan", "suv", "truck", "bicycle", "on_foot"]
        },
        backgroundCheckStatus: {
          type: "string",
          enum: ["pending", "approved", "rejected", "expired"]
        },
        joinDate: { type: "string", format: "date" },
        isActive: { type: "boolean" },
        aadharNo: { type: "string" },
        panNo: { type: "string" },
        uanNumber: { type: "string" },
        votersId: { type: "string" },
        educationCertificate: { type: "string" },
        homeGeoLocation: { type: "string" },
        workGeoLocation: { type: "string" }
      },
      required: [
        "fullName",
        "email",
        "phoneNumber",
        "workerId",
        "platform",
        "serviceType",
        "verificationLevel",
        "location",
        "backgroundCheckStatus",
        "isActive"
      ],
      additionalProperties: false
    },
    properties: {
      fullName: workerData.fullName,
      email: workerData.email,
      phoneNumber: workerData.phoneNumber,
      workerId: `GW${Date.now()}`,
      platform: workerData.platform || 'Unknown',
      serviceType: workerData.serviceType || 'general',
      rating: 0,
      totalJobs: 0,
      verificationLevel: 'basic',
      skills: workerData.skills || [],
      location: {
        city: workerData.city || 'Unknown',
        state: workerData.state || 'Unknown',
        country: workerData.country || 'India'
      },
      licenseNumber: workerData.licenseNumber || '',
      vehicleType: workerData.vehicleType || 'unknown',
      backgroundCheckStatus: 'pending',
      joinDate: new Date().toISOString().split('T')[0],
      isActive: true,
      aadharNo: workerData.aadharNo || '',
      panNo: workerData.panNo || '',
      uanNumber: workerData.uanNumber || '',
      votersId: workerData.votersId || '',
      educationCertificate: workerData.educationCertificate || '',
      homeGeoLocation: workerData.homeGeoLocation || '',
      workGeoLocation: workerData.workGeoLocation || ''
    },
    address: profileAddress
  };

  console.log('Issuing VC with payload:', JSON.stringify(vcPayload, null, 2));

  const response = await fetch(`${API_BASE_URL}/cred`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BEARER_TOKEN}`,
    },
    body: JSON.stringify(vcPayload),
  });

  console.log('VC Response status:', response.status);
  const responseData = await response.json();
  console.log('VC Response body:', responseData);

  if (!response.ok) {
    throw new Error(`Failed to issue VC: ${responseData.message || JSON.stringify(responseData)}`);
  }

  // The API returns { result: "success", credId: "...", vc: {...} }
  if (responseData.result === 'success' && responseData.credId) {
    return {
      identifier: responseData.credId, // Map credId to identifier for consistency
      credId: responseData.credId,
      status: 'issued',
      message: 'VC issued successfully',
      vc: responseData.vc
    };
  } else {
    throw new Error(`VC issuance failed: ${responseData.message || 'Unknown error'}`);
  }
}


// GET - Fetch all workers
export async function GET(_: NextRequest) {
  try {
    const workers = await prisma.gigWorker.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(workers);
  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workers' },
      { status: 500 }
    );
  }
}

// POST - Create new worker with DID and VC
export async function POST(request: NextRequest) {
  try {
    const workerData: CreateWorkerInput = await request.json();

    // Step 1: Create DID Profile
    console.log('Creating DID profile...');
    const profile = await createProfile();

    // Step 2: Issue VC
    console.log('Issuing verifiable credential...');
    const credential = await issueCredential(workerData, REGISTRY_ADDRESS);

    // Step 3: Save to database
    const worker = await prisma.gigWorker.create({
      data: {
        fullName: workerData.fullName,
        email: workerData.email,
        phoneNumber: workerData.phoneNumber,
        aadharNo: workerData.aadharNo,
        panNo: workerData.panNo,
        uanNumber: workerData.uanNumber,
        votersId: workerData.votersId,
        educationCertificate: workerData.educationCertificate,
        skills: workerData.skills,
        homeGeoLocation: workerData.homeGeoLocation,
        workGeoLocation: workerData.workGeoLocation,
        city: workerData.city,
        state: workerData.state,
        country: workerData.country || 'India',
        platform: workerData.platform,
        serviceType: workerData.serviceType,
        licenseNumber: workerData.licenseNumber,
        vehicleType: workerData.vehicleType,
        workerId: `GW${Date.now()}`,
        profileId: profile.profileId,
        address: profile.address,
        credentialId: credential.credId, // Store the actual credId from API response
        mnemonic: profile.mnemonic,
        publicKey: profile.publicKey,
        verificationLevel: 'basic',
        backgroundCheckStatus: 'pending',
        isActive: true,
        rating: 0,
        totalJobs: 0
      },
    });

    return NextResponse.json({
      success: true,
      worker,
      profile,
      credential,
      message: 'Worker created successfully with DID and VC'
    });
  } catch (error) {
    console.error('Error creating worker:', error);
    return NextResponse.json(
      { error: 'Failed to create worker', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Close Prisma connection
export async function OPTIONS() {
  await prisma.$disconnect();
  return new NextResponse(null, { status: 200 });
}