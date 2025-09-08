// app/api/credentials/route.ts

import { CredentialResponse, GovernmentCredential } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import GOVERNMENT_ID_SCHEMA from "@/app/vc_schema.json"
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const API_BASE_URL = process.env.API_BASE_URL;
const BEARER_TOKEN = process.env.BEARER_TOKEN;

// Helper function to issue VC
async function issueCredential(workerData: GovernmentCredential, documentSpecificData: any, profileAddress: string): Promise<CredentialResponse> {
    const vcPayload = {
        schema: GOVERNMENT_ID_SCHEMA,
        properties: {
            holderName: workerData.holderName,
            documentType: workerData.documentType,
            documentNumber: workerData.documentNumber,
            issuingAuthority: workerData.issuingAuthority,
            issueDate: workerData.issueDate || new Date().toISOString().split('T')[0],
            expiryDate: workerData.expiryDate,
            verificationStatus: "PENDING",
            documentSpecificData: documentSpecificData,
            digitalSignature: `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2)}`,
            isActive: true
        },
        address: profileAddress
    };

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



// POST - Create new Credential
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const credentialData: GovernmentCredential = data.worker_data;
        const workerId: string = data.worker_id;

        const worker = await prisma.gigWorker.findFirst({
            where: {
                workerId: workerId
            }
        })

        if (!worker) {
            return NextResponse.json(
                { error: 'Gig Worker not found' },
                { status: 404 }
            );
        }

        const issuedCredential = await issueCredential(credentialData, credentialData.documentSpecificData, worker.address!);

        const credential = await prisma.vC.create({
            data: {
                credId: issuedCredential.credId,
                vcName: credentialData.documentType,
                vc: JSON.stringify(issuedCredential.vc),
                gigWorkerId: worker.id
            }
        })

        return NextResponse.json({
            success: true,
            worker,
            credential,
            message: 'Credential created successfully'
        });
    } catch (error) {
        console.error('Error creating Credential:', error);
        return NextResponse.json(
            { error: 'Failed to create Credential', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// Close Prisma connection
export async function OPTIONS() {
    await prisma.$disconnect();
    return new NextResponse(null, { status: 200 });
}