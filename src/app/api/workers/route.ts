// app/api/workers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { CreateWorkerInput, ProfileResponse } from '@/types';

const prisma = new PrismaClient();

const API_BASE_URL = process.env.API_BASE_URL;

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

// GET - Fetch all workers
export async function GET() {
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

// POST - Create new worker with DID
export async function POST(request: NextRequest) {
  try {
    const workerData: CreateWorkerInput = await request.json();

    // Step 1: Create DID Profile
    console.log('Creating DID profile...');
    const profile = await createProfile();

    // Step 3: Save to database
    const worker = await prisma.gigWorker.create({
      data: {
        fullName: workerData.fullName,
        email: workerData.email,
        phoneNumber: workerData.phoneNumber,
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
        mnemonic: profile.mnemonic,
        publicKey: profile.publicKey,
        verificationLevel: 'basic',
        backgroundCheckStatus: 'pending',
        isActive: true
      },
    });

    return NextResponse.json({
      success: true,
      worker,
      profile,
      message: 'Worker created successfully with DID'
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