// app/api/stats/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Stats } from '@/types';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [
      total,
      verified,
      pending,
      active
    ] = await Promise.all([
      prisma.gigWorker.count(),
      prisma.gigWorker.count({
        where: {
          backgroundCheckStatus: 'approved'
        }
      }),
      prisma.gigWorker.count({
        where: {
          backgroundCheckStatus: 'pending'
        }
      }),
      prisma.gigWorker.count({
        where: {
          isActive: true
        }
      })
    ]);

    const stats: Stats = {
      total,
      verified,
      pending,
      active
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}