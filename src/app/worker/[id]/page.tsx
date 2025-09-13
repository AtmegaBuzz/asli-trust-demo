// app/worker/[id]/page.tsx
'use client';

import { useState, useEffect, use, useRef } from 'react';
import { ArrowLeft, MapPin, Shield, Eye, X, Copy, Phone, Mail, Loader2, Plus, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
// import { QRCodeCanvas } from "qrcode.react";
import GovernmentDocumentsSection from '@/components/GovernmentDocumentsSection';
import QRCodeStyling from "qr-code-styling";

interface WorkerData {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    workerId: string;
    platform?: string;
    serviceType?: string;
    city?: string;
    state?: string;
    country: string;
    vehicleType?: string;
    licenseNumber?: string;
    skills: string[];
    educationCertificate?: string;
    verificationLevel: string;
    backgroundCheckStatus: string;
    isActive: boolean;
    joinDate: string;
    profileId?: string;
    address?: string;
    homeGeoLocation?: string;
    workGeoLocation?: string;
    mnemonic?: string;
    publicKey?: string;
}

interface CredentialData {
    id: string;
    status: string;
    credId: string;
    vcName: string;
    vc: string; // JSON string
    gigWorkerId: string;
    createdAt: string;
    updatedAt: string;
    fileUrl: string;
}

interface ApiResponse {
    worker: WorkerData;
    credentials: CredentialData[];
}

interface WorkerDetailPageProps {
    params: Promise<{ id: string }>
}


export default function WorkerDetailPage({ params }: WorkerDetailPageProps) {
    const [workerData, setWorkerData] = useState<ApiResponse | null>(null);
    const [selectedCredential, setSelectedCredential] = useState<any>(null);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [governmentDocuments, setGovernmentDocuments] = useState<any[]>([]);
    const [issuingCredential, setIssuingCredential] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [modalDocUrl, setModalDocUrl] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const qrRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            // Dynamically import QR code styling (client-side only)
            import('qr-code-styling').then((QRCodeStylingLib) => {
                const QRCodeStyling = QRCodeStylingLib.default

                const qrCode = new QRCodeStyling({
                    width: 300,
                    height: 300,
                    type: "svg",
                    data: `${window.location.origin}/verify/credential/${selectedCredential.credId}`,
                    image: "/alan-scott.png",
                    dotsOptions: {
                        color: "#1e40af", // Blue dots
                        type: "rounded"
                    },
                    backgroundOptions: {
                        color: "#ffffff", // White background
                    },
                    imageOptions: {
                        crossOrigin: "anonymous",
                        margin: 8,
                        imageSize: 0.4
                    },
                    cornersSquareOptions: {
                        color: "#3b82f6", // Light blue corners
                        type: "extra-rounded"
                    },
                    cornersDotOptions: {
                        color: "#1e40af", // Blue corner dots
                        type: "dot"
                    }
                })

                if (qrRef.current) {
                    qrRef.current.innerHTML = ''
                    qrCode.append(qrRef.current)
                }
            })
        }, [selectedCredential])



        const resolvedParams = use(params);


        useEffect(() => {
            const fetchWorkerData = async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`/api/workers/${resolvedParams.id}`);

                    if (!response.ok) {
                        throw new Error('Failed to fetch worker data');
                    }

                    const data: ApiResponse = await response.json();
                    setWorkerData(data);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'An error occurred');
                } finally {
                    setLoading(false);
                }
            };

            if (resolvedParams.id) {
                fetchWorkerData();
            }
        }, [resolvedParams.id]);

        const handleGovernmentDocumentsChange = (documents: any[]) => {
            setGovernmentDocuments(documents);
        };

        const handleIssueCredentials = async () => {
            if (!workerData || governmentDocuments.length === 0) return;

            setIssuingCredential(true);

            try {
                const credentialPromises = governmentDocuments.map(async (doc) => {
                    try {
                        // Create document specific data based on document type
                        const documentSpecificData = createDocumentSpecificData(doc);

                        const credentialPayload = {
                            worker_data: {
                                holderName: doc.holderName,
                                documentType: doc.documentType,
                                documentNumber: doc.documentNumber,
                                issuingAuthority: doc.issuingAuthority,
                                issueDate: doc.issueDate,
                                expiryDate: doc.expiryDate || null,
                                verificationStatus: 'PENDING' as const,
                                documentSpecificData: documentSpecificData,
                                isActive: true,
                                fileUrl: doc.fileUrl
                            },
                            worker_id: workerData.worker.workerId // Use workerId instead of id
                        };

                        const govCredResponse = await fetch('/api/credentials', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(credentialPayload),
                        });

                        if (govCredResponse.ok) {
                            console.log(`Government credential created for ${doc.documentType}`);
                            return true;
                        } else {
                            const errorData = await govCredResponse.json();
                            console.error(`Failed to create credential for ${doc.documentType}:`, errorData);
                            return false;
                        }
                    } catch (error) {
                        console.error(`Error creating credential for ${doc.documentType}:`, error);
                        return false;
                    }
                });

                const results = await Promise.allSettled(credentialPromises);
                const successCount = results.filter(result =>
                    result.status === 'fulfilled' && result.value === true
                ).length;

                alert(`Successfully issued ${successCount} of ${governmentDocuments.length} credentials!`);

                // Reset modal state
                setShowIssueModal(false);
                setGovernmentDocuments([]);

                // Refresh worker data to show new credentials
                const response = await fetch(`/api/workers/${resolvedParams.id}`);
                if (response.ok) {
                    const data: ApiResponse = await response.json();
                    setWorkerData(data);
                }
            } catch (error) {
                console.error('Error issuing credentials:', error);
                alert('Error issuing credentials');
            } finally {
                setIssuingCredential(false);
            }
        };

        // Helper function to create document-specific data based on document type
        const createDocumentSpecificData = (doc: any): Record<string, any> => {
            const baseData = {
                documentNumber: doc.documentNumber,
                issuingAuthority: doc.issuingAuthority,
                issueDate: doc.issueDate,
                holderName: doc.holderName
            };

            // Add document-specific fields based on type
            switch (doc.documentType) {
                case 'aadhar':
                    return {
                        ...baseData,
                        address: doc.address || '',
                        dateOfBirth: doc.dateOfBirth || '',
                        gender: doc.gender || '',
                        fatherName: doc.fatherName || '',
                        motherName: doc.motherName || '',
                        mobileNumber: doc.mobileNumber || '',
                        email: doc.email || '',
                        pincode: doc.pincode || '',
                        district: doc.district || '',
                        enrollmentNumber: doc.enrollmentNumber || '',
                        fileUrl: doc.fileUrl || ''
                    };
                case 'pan':
                    return {
                        ...baseData,
                        fatherName: doc.fatherName || '',
                        dateOfBirth: doc.dateOfBirth || '',
                        category: doc.category || 'Individual',
                        fileUrl: doc.fileUrl || ''
                    };
                case 'driving_license':
                    return {
                        ...baseData,
                        vehicleTypes: doc.vehicleTypes || [],
                        address: doc.address || '',
                        bloodGroup: doc.bloodGroup || '',
                        dateOfBirth: doc.dateOfBirth || '',
                        emergencyContact: doc.emergencyContact || '',
                        fileUrl: doc.fileUrl || ''
                    };
                case 'uan':
                    return {
                        ...baseData,
                        employerName: doc.employerName || '',
                        dateOfJoining: doc.dateOfJoining || '',
                        designation: doc.designation || '',
                        pfNumber: doc.pfNumber || '',
                        fileUrl: doc.fileUrl || ''
                    };
                case 'education_certificate':
                    return {
                        ...baseData,
                        qualification: doc.qualification || '',
                        passingYear: doc.passingYear || '',
                        percentage: doc.percentage || '',
                        grade: doc.grade || '',
                        instituteName: doc.instituteName || '',
                        subjects: doc.subjects || [],
                        fileUrl: doc.fileUrl || ''
                    };
                default:
                    return baseData;
            }
        };

        const getDocumentIcon = (vcName: string): string => {
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
            return icons[vcName] || '📋';
        };

        const getDocumentDisplayName = (vcName: string): string => {
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
            return names[vcName] || vcName;
        };

        const getStatusColor = (status: string): string => {
            const colors = {
                VERIFIED: 'text-green-600 bg-green-100',
                PENDING: 'text-yellow-600 bg-yellow-100',
                REJECTED: 'text-red-600 bg-red-100',
                EXPIRED: 'text-gray-600 bg-gray-100',
                approved: 'text-green-600 bg-green-100',
                pending: 'text-yellow-600 bg-yellow-100',
                rejected: 'text-red-600 bg-red-100'
            };
            return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
        };

        const copyToClipboard = (text: string) => {
            navigator.clipboard.writeText(text);
        };

        const parseVCData = (vcString: string) => {
            try {
                const vcData = JSON.parse(vcString);
                return vcData.credentialSubject;
            } catch (error) {
                console.error('Error parsing VC data:', error);
                return null;
            }
        };

        const renderCredentialDetails = (credential: CredentialData) => {
            const vcSubject = parseVCData(credential.vc);
            if (!vcSubject || !vcSubject.documentSpecificData) {
                return <div>No specific details available</div>;
            }

            const data = vcSubject.documentSpecificData;

            let file: React.ReactNode = null;
            if (credential.fileUrl) {
                file = (
                    <div className="mt-2">
                        {credential.fileUrl.endsWith(".pdf") ? (
                            <a
                                href={credential.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 text-xs underline"
                            >
                                View PDF
                            </a>
                        ) : (
                            <img
                                src={credential.fileUrl}
                                alt={data.documentNumber || "document"}
                                className="mt-2 max-h-40 rounded border border-gray-200 cursor-pointer"
                                onClick={() => {
                                    setModalDocUrl(credential.fileUrl);
                                    setShowModal(true);
                                }}
                            />
                        )}
                    </div>
                );
            }

            console.log(credential.fileUrl, "-----")


            switch (credential.vcName) {
                case 'AadhaarCard':
                    return (
                        <div className="space-y-3">
                            <div><strong>Address:</strong> {data.address}</div>
                            <div><strong>Date of Birth:</strong> {data.dateOfBirth}</div>
                            <div><strong>Gender:</strong> {data.gender}</div>
                            <div><strong>Father&apos;s Name:</strong> {data.fatherName}</div>
                            <div><strong>Mother&apos;s Name:</strong> {data.motherName}</div>
                            <div><strong>Mobile:</strong> {data.mobileNumber}</div>
                            <div><strong>Email:</strong> {data.email}</div>
                            <div><strong>Pincode:</strong> {data.pincode}</div>
                            <div><strong>District:</strong> {data.district}</div>
                            <div><strong>Enrollment Number:</strong> {data.enrollmentNumber}</div>
                            {file}
                        </div>
                    );
                case 'PANCard':
                    return (
                        <div className="space-y-3">
                            <div><strong>Father&apos;s Name:</strong> {data.fatherName}</div>
                            <div><strong>Date of Birth:</strong> {data.dateOfBirth}</div>
                            <div><strong>Category:</strong> {data.category}</div>
                            {file}
                        </div>
                    );
                case 'DrivingLicense':
                    return (
                        <div className="space-y-3">
                            <div><strong>Vehicle Types:</strong> {data.vehicleTypes?.join(', ')}</div>
                            <div><strong>Address:</strong> {data.address}</div>
                            <div><strong>Blood Group:</strong> {data.bloodGroup}</div>
                            <div><strong>Date of Birth:</strong> {data.dateOfBirth}</div>
                            <div><strong>Emergency Contact:</strong> {data.emergencyContact}</div>
                            {file}
                        </div>
                    );
                case 'UAN':
                    return (
                        <div className="space-y-3">
                            <div><strong>Employer:</strong> {data.employerName}</div>
                            <div><strong>Date of Joining:</strong> {data.dateOfJoining}</div>
                            <div><strong>Designation:</strong> {data.designation}</div>
                            <div><strong>PF Number:</strong> {data.pfNumber}</div>
                            {file}
                        </div>
                    );
                case 'EducationCertificate':
                    return (
                        <div className="space-y-3">
                            <div><strong>Qualification:</strong> {data.qualification}</div>
                            <div><strong>Passing Year:</strong> {data.passingYear}</div>
                            <div><strong>Percentage:</strong> {data.percentage}</div>
                            <div><strong>Grade:</strong> {data.grade}</div>
                            <div><strong>Institution:</strong> {data.instituteName}</div>
                            <div><strong>Subjects:</strong> {data.subjects?.join(', ')}</div>
                            {file}
                        </div>
                    );
                default:
                    return (
                        <div className="space-y-2">
                            {Object.entries(data).map(([key, value]) => (
                                <div key={key}>
                                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {
                                        Array.isArray(value) ? value.join(', ') : String(value)
                                    }
                                </div>
                            ))}
                            {file}
                        </div>
                    );
            }
        };

        if (loading) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-gray-600">Loading worker details...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Worker</h2>
                        <p className="text-gray-600">{error}</p>
                        <button
                            onClick={() => router.back()}
                            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            );
        }

        if (!workerData) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Worker Not Found</h2>
                        <p className="text-gray-600">The requested worker could not be found.</p>
                    </div>
                </div>
            );
        }

        const { worker, credentials } = workerData;

        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between py-6">
                            <div className="flex items-center space-x-4">
                                <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
                                    <ArrowLeft className="h-6 w-6" />
                                </button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Gig Worker Profile</h1>
                                    <p className="text-sm text-gray-600">Complete worker information and credentials</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column - Worker Profile */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow p-6">
                                {/* Profile Image and Basic Info */}
                                <div className="text-center mb-6">
                                    <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                                        {worker.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">{worker.fullName}</h2>
                                    <p className="text-gray-600">{worker.workerId}</p>

                                    <div className="flex items-center justify-center space-x-2 mt-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(worker.backgroundCheckStatus)}`}>
                                            {worker.backgroundCheckStatus.charAt(0).toUpperCase() + worker.backgroundCheckStatus.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{worker.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{worker.phoneNumber}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                            {[worker.city, worker.state].filter(Boolean).join(', ') || worker.country}
                                        </span>
                                    </div>
                                </div>

                                {/* Platform & Service */}
                                <div className="space-y-3 mb-6">
                                    {worker.platform && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Platform: </span>
                                            <span className="text-sm text-gray-900">{worker.platform}</span>
                                        </div>
                                    )}
                                    {worker.serviceType && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Service: </span>
                                            <span className="text-sm text-gray-900">{worker.serviceType.replace('_', ' ').toUpperCase()}</span>
                                        </div>
                                    )}
                                    {worker.vehicleType && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Vehicle: </span>
                                            <span className="text-sm text-gray-900">{worker.vehicleType.toUpperCase()}</span>
                                        </div>
                                    )}
                                    {worker.licenseNumber && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">License: </span>
                                            <span className="text-sm text-gray-900">{worker.licenseNumber}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Skills */}
                                {worker.skills && worker.skills.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Skills</h3>
                                        <div className="flex flex-wrap gap-1">
                                            {worker.skills.map((skill, index) => (
                                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* DID Information */}
                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">Digital Identity</h3>
                                    <div className="space-y-2">
                                        {worker.profileId && (
                                            <div>
                                                <span className="text-xs text-gray-500">Profile ID:</span>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-mono bg-gray-100 p-1 rounded break-all">
                                                        {worker.profileId.substring(0, 20)}...
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(worker.profileId!)}
                                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {worker.address && (
                                            <div>
                                                <span className="text-xs text-gray-500">Address:</span>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-mono bg-gray-100 p-1 rounded break-all">
                                                        {worker.address.substring(0, 20)}...
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(worker.address!)}
                                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Government Credentials */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-medium text-gray-900">Government Credentials</h3>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Shield className="h-5 w-5 text-green-500" />
                                            <span className="text-sm text-green-600">
                                                {credentials.filter(c => c.status === 'VERIFIED').length} Verified, {credentials.length} Total
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setShowIssueModal(true)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 text-sm"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Issue New Credential</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Credentials Grid */}
                                {credentials.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {credentials.map((credential) => {
                                            const vcSubject = parseVCData(credential.vc);
                                            return (
                                                <div
                                                    key={credential.id}
                                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                                    onClick={() => setSelectedCredential(credential)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-2xl">{getDocumentIcon(credential.vcName)}</span>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-900">
                                                                    {getDocumentDisplayName(credential.vcName)}
                                                                </h4>
                                                                <p className="text-xs text-gray-500">
                                                                    {vcSubject?.documentNumber || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end space-y-1">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(credential.status)}`}>
                                                                {credential.status}
                                                            </span>
                                                            <button className="text-blue-600 hover:text-blue-800">
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="mt-3 space-y-1">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-500">Issuing Authority:</span>
                                                            <span className="text-gray-700">
                                                                {vcSubject?.issuingAuthority || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-500">Issue Date:</span>
                                                            <span className="text-gray-700">
                                                                {vcSubject?.issueDate || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-500">Created:</span>
                                                            <span className="text-gray-700">
                                                                {new Date(credential.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-sm">No government credentials found for this worker.</p>
                                        <p className="text-xs mt-1">Click &quot;Issue New Credential&quot; to add credentials.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Issue New Credential Modal */}
                {showIssueModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Issue New Credential</h3>
                                    <p className="text-sm text-gray-600">Add government documents for {worker.fullName}</p>
                                </div>
                                <button
                                    onClick={() => setShowIssueModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <GovernmentDocumentsSection
                                    documents={governmentDocuments}
                                    onDocumentsChange={handleGovernmentDocumentsChange}
                                    holderName={worker.fullName}
                                />

                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <button
                                        onClick={() => setShowIssueModal(false)}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                                        disabled={issuingCredential}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleIssueCredentials}
                                        disabled={issuingCredential || governmentDocuments.length === 0}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {issuingCredential ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Issuing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                <span>Issue Credentials</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Credential Detail Modal */}
                {selectedCredential && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{getDocumentIcon(selectedCredential.vcName)}</span>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {getDocumentDisplayName(selectedCredential.vcName)}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {parseVCData(selectedCredential.vc)?.documentNumber || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedCredential(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Basic Information */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Holder Name:</span>
                                            <div className="text-gray-900">
                                                {parseVCData(selectedCredential.vc)?.holderName || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Document Number:</span>
                                            <div className="text-gray-900">
                                                {parseVCData(selectedCredential.vc)?.documentNumber || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Issuing Authority:</span>
                                            <div className="text-gray-900">
                                                {parseVCData(selectedCredential.vc)?.issuingAuthority || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Issue Date:</span>
                                            <div className="text-gray-900">
                                                {parseVCData(selectedCredential.vc)?.issueDate || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Status:</span>
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCredential.status)}`}>
                                                {selectedCredential.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Document Specific Details */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">Document Details</h4>
                                    <div className="text-sm text-gray-900">
                                        {renderCredentialDetails(selectedCredential)}
                                    </div>
                                </div>

                                {/* Credential Information */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-3">Verifiable Credential</h4>
                                    <div className="space-y-2">
                                        <div className='text-black'>
                                            <span className="text-sm font-medium text-gray-700">Credential ID:</span>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-mono bg-white p-2 rounded break-all">
                                                    {selectedCredential.credId}
                                                </span>
                                                <button
                                                    onClick={() => copyToClipboard(selectedCredential.credId)}
                                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className='text-black'>
                                            <span className="text-sm font-medium text-gray-700">Credential QR:</span>
                                            <div className="flex items-center justify-center mt-2">
                                                <div ref={qrRef} className="relative z-10" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setSelectedCredential(null)}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showModal && modalDocUrl && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <div className="relative bg-white p-4 rounded-lg max-w-3xl w-full">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                            >
                                <X className="h-6 w-6" />
                            </button>
                            <img
                                src={modalDocUrl}
                                alt="Full Document"
                                className="max-h-[80vh] mx-auto rounded-lg"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }