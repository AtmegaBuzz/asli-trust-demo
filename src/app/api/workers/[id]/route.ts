// app/api/credentials/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workerId } = await params;

    if (!workerId) {
      return NextResponse.json(
        { error: 'Worker profile ID is required' },
        { status: 400 }
      );
    }

    const worker = await prisma.gigWorker.findFirst({
      where: {
        workerId: workerId
      }
    })

    if (!worker) {
      return NextResponse.json(
        { error: 'Worker with this id not found.' },
        { status: 404 }
      );
    }


    const allCredentials = await prisma.vC.findMany({
      where: {
        gigWorkerId: worker.id
      }
    })

    // Return the credential with additional metadata
    return NextResponse.json({
        worker: worker,
        credentials: allCredentials
    }, {status: 200});

  } catch (error) {
    console.error('Error fetching credential:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credential', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}