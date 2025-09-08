'use client';

import { useState, useEffect, use } from 'react';
import { Shield, CheckCircle, Building, User, Hash, Loader2, AlertCircle, QrCode } from 'lucide-react';

interface CredentialResponse {
    credential: {
        id: string;
        credId: string;
        address: string;
        profileId: string;
        registryId: string;
        active: boolean;
        issuerDid: string;
        holderDid: string;
        vc: {
            '@context': string[];
            type: string[];
            issuer: string;
            issuanceDate: string;
            expirationDate: string;
            credentialSubject: {
                holderName: string;
                documentType: string;
                documentNumber: string;
                issuingAuthority: string;
                issueDate: string;
                expiryDate: string | null;
                verificationStatus: string;
                documentSpecificData: Record<string, any>;
                digitalSignature: string;
                isActive: boolean;
                id: string;
                '@context': string;
            };
            validFrom: string;
            validUntil: string;
            metadata: Record<string, any>;
            credentialSchema: Record<string, any>;
            credentialHash: string;
            id: string;
            proof: any[];
        };
        createdAt: string;
        updatedAt: string;
        token: string | null;
    };
}

export default function CredentialVerificationPage({ params }: { params: Promise<{ id: string }> }) {
    const [credential, setCredential] = useState<CredentialResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const resolvedParams = use(params);


    const fetchCredential = async () => {

        try {
            const resp = await fetch(`/api/credentials/${resolvedParams.id}`);

            if (resp.status !== 200) {
                setError("Invalid Credential");
                return;
            }

            const credentialJson = await resp.json();
            setCredential(credentialJson);

        } catch (e: any) {
            console.log("error fetching credential: ", e)
        }

    }

    // Mock data - replace with actual API call
    useEffect(() => {
        setLoading(true);
        fetchCredential();
        setLoading(false);
    }, [resolvedParams.id]);

    const getDocumentIcon = (documentType: string): string => {
        const icons: Record<string, string> = {
            'AadhaarCard': '🆔',
            'PANCard': '💳',
            'UAN': '👥',
            'VoterID': '🗳️',
            'DrivingLicense': '🚗',
            'Passport': '📘',
            'EducationCertificate': '🎓',
            'IncomeCertificate': '💰',
            'CasteCertificate': '📄',
            'DomicileCertificate': '🏠',
            'BirthCertificate': '👶'
        };
        return icons[documentType] || '📋';
    };

    const getDocumentDisplayName = (documentType: string): string => {
        const names: Record<string, string> = {
            'AadhaarCard': 'Aadhar Card',
            'PANCard': 'PAN Card',
            'UAN': 'UAN Number',
            'VoterID': 'Voter ID',
            'DrivingLicense': 'Driving License',
            'Passport': 'Passport',
            'EducationCertificate': 'Education Certificate',
            'IncomeCertificate': 'Income Certificate',
            'CasteCertificate': 'Caste Certificate',
            'DomicileCertificate': 'Domicile Certificate',
            'BirthCertificate': 'Birth Certificate'
        };
        return names[documentType] || documentType;
    };

    const renderDocumentDetails = () => {
        if (!credential?.credential.vc.credentialSubject.documentSpecificData) return null;

        const data = credential.credential.vc.credentialSubject.documentSpecificData;
        const documentType = credential.credential.vc.credentialSubject.documentType;

        switch (documentType) {
            case 'AadhaarCard':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.address && (
                            <div className="md:col-span-2">
                                <span className="text-sm font-medium text-gray-600">Address</span>
                                <p className="text-gray-900">{data.address}</p>
                            </div>
                        )}
                        {data.dateOfBirth && (
                            <div>
                                <span className="text-sm font-medium text-gray-600">Date of Birth</span>
                                <p className="text-gray-900">{data.dateOfBirth}</p>
                            </div>
                        )}
                        {data.gender && (
                            <div>
                                <span className="text-sm font-medium text-gray-600">Gender</span>
                                <p className="text-gray-900">{data.gender}</p>
                            </div>
                        )}
                        {data.fatherName && (
                            <div>
                                <span className="text-sm font-medium text-gray-600">Father&apos;s Name</span>
                                <p className="text-gray-900">{data.fatherName}</p>
                            </div>
                        )}
                        {data.motherName && (
                            <div>
                                <span className="text-sm font-medium text-gray-600">Mother&apos;s Name</span>
                                <p className="text-gray-900">{data.motherName}</p>
                            </div>
                        )}
                        {data.mobileNumber && (
                            <div>
                                <span className="text-sm font-medium text-gray-600">Mobile Number</span>
                                <p className="text-gray-900">{data.mobileNumber}</p>
                            </div>
                        )}
                        {data.email && (
                            <div>
                                <span className="text-sm font-medium text-gray-600">Email</span>
                                <p className="text-gray-900">{data.email}</p>
                            </div>
                        )}
                        {data.pincode && (
                            <div>
                                <span className="text-sm font-medium text-gray-600">Pincode</span>
                                <p className="text-gray-900">{data.pincode}</p>
                            </div>
                        )}
                        {data.state && (
                            <div>
                                <span className="text-sm font-medium text-gray-600">State</span>
                                <p className="text-gray-900">{data.state}</p>
                            </div>
                        )}
                        {data.district && (
                            <div>
                                <span className="text-sm font-medium text-gray-600">District</span>
                                <p className="text-gray-900">{data.district}</p>
                            </div>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(data).map(([key, value]) => (
                            <div key={key}>
                                <span className="text-sm font-medium text-gray-600">
                                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                </span>
                                <p className="text-gray-900">
                                    {Array.isArray(value) ? value.join(', ') : String(value)}
                                </p>
                            </div>
                        ))}
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Credential</h2>
                    <p className="text-gray-600">Please wait while we validate this credential...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="text-sm text-gray-500">
                        Please check the QR code or contact the document holder for assistance.
                    </div>
                </div>
            </div>
        );
    }

    if (!credential) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Credential Not Found</h2>
                    <p className="text-gray-600">The requested credential could not be located.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
            {/* Header with Verification Status */}
            <div className="bg-white shadow-sm border-b border-green-200">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-center space-x-3">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900">Verified Credential</h1>
                            <p className="text-sm text-green-600 font-medium">This document has been cryptographically verified</p>
                        </div>
                        <Shield className="h-8 w-8 text-green-600" />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Main Credential Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="text-4xl">
                                    {getDocumentIcon(credential.credential.vc.credentialSubject.documentType)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {getDocumentDisplayName(credential.credential.vc.credentialSubject.documentType)}
                                    </h2>
                                    <p className="text-green-100">
                                        {credential.credential.vc.credentialSubject.documentNumber}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-semibold">VERIFIED</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-8">
                        {/* Holder Information */}
                        <div className="mb-8">
                            <div className="flex items-center space-x-3 mb-4">
                                <User className="h-6 w-6 text-gray-400" />
                                <h3 className="text-lg font-semibold text-gray-900">Document Holder</h3>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-2xl font-bold text-gray-900">{credential.credential.vc.credentialSubject.holderName}</p>
                            </div>
                        </div>

                        {/* Document Information */}
                        <div className="mb-8">
                            <div className="flex items-center space-x-3 mb-4">
                                <Building className="h-6 w-6 text-gray-400" />
                                <h3 className="text-lg font-semibold text-gray-900">Document Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-lg p-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Document Number</span>
                                    <p className="text-lg font-semibold text-gray-900">{credential.credential.vc.credentialSubject.documentNumber}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Issuing Authority</span>
                                    <p className="text-lg font-semibold text-gray-900">{credential.credential.vc.credentialSubject.issuingAuthority}</p>
                                </div>
                                {credential.credential.vc.credentialSubject.issueDate && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Issue Date</span>
                                        <p className="text-lg font-semibold text-gray-900">{credential.credential.vc.credentialSubject.issueDate}</p>
                                    </div>
                                )}
                                {credential.credential.vc.credentialSubject.expiryDate && (
                                    <div>
                                        <span className="text-sm font-medium text-gray-600">Expiry Date</span>
                                        <p className="text-lg font-semibold text-gray-900">{credential.credential.vc.credentialSubject.expiryDate}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Document-Specific Details */}
                        {credential.credential.vc.credentialSubject.documentSpecificData && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Details</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    {renderDocumentDetails()}
                                </div>
                            </div>
                        )}

                        {/* Verification Details */}
                        <div className="border-t pt-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <Hash className="h-6 w-6 text-gray-400" />
                                <h3 className="text-lg font-semibold text-gray-900">Verification Details</h3>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Credential ID:</span>
                                        <p className="font-mono text-gray-900 break-all">{credential.credential.credId}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Verification Time:</span>
                                        <p className="text-gray-900">{new Date().toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Status:</span>
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600 font-semibold">Cryptographically Verified</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Issued:</span>
                                        <p className="text-gray-900">{new Date(credential.credential.vc.issuanceDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Valid Until:</span>
                                        <p className="text-gray-900">{new Date(credential.credential.vc.expirationDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Issuer DID:</span>
                                        <p className="font-mono text-gray-900 break-all text-xs">{credential.credential.issuerDid}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="font-medium text-gray-700">Credential Hash:</span>
                                        <p className="font-mono text-gray-900 break-all text-xs">{credential.credential.vc.credentialHash}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Notice */}
                <div className="mt-8 text-center">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">Powered by Blockchain Technology</span>
                        </div>
                        <p className="text-xs text-gray-500">
                            This credential is cryptographically secured and tamper-proof.
                            Any modifications to the original document would be immediately detectable.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}