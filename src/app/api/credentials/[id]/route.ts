// app/api/credentials/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'http://20.193.138.24:5106/api/v1';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: credentialId } = await params;

    if (!credentialId) {
      return NextResponse.json(
        { error: 'Credential ID is required' },
        { status: 400 }
      );
    }

    // Fetch credential from the issuer agent API
    const response = await fetch(`${API_BASE_URL}/cred/${credentialId}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Credential not found', status: response.status },
        { status: response.status }
      );
    }

    const credentialData = await response.json();

    // Return the credential with additional metadata
    return NextResponse.json({
      ...credentialData,
      fetchedAt: new Date().toISOString(),
      isValid: credentialData.result === 'success' || response.ok
    });

  } catch (error) {
    console.error('Error fetching credential:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credential', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}