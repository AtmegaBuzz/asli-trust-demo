// pages/worker/[id].tsx or app/worker/[id]/page.tsx
'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, Star, Briefcase, Shield, Eye, X, Copy, Phone, Mail } from 'lucide-react';
import { DocumentType } from '@/types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Mock data for the gig worker
const mockWorkerData = {
    id: 'worker_001',
    fullName: 'Rajesh Kumar Singh',
    email: 'rajesh.kumar@email.com',
    phoneNumber: '+91-9876543210',
    profileImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_9D-fM5-Ha-yhZBA_LxulQ6gl4iBECoyfNA&s',

    // Work Information
    workerId: 'GW2024001234',
    platform: 'Swiggy',
    serviceType: 'food_delivery',
    rating: 4.7,
    totalJobs: 1247,
    verificationLevel: 'verified',
    backgroundCheckStatus: 'approved',
    isActive: true,
    joinDate: '2023-03-15',

    // Location
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    homeGeoLocation: '19.0760,72.8777',
    workGeoLocation: '19.0856,72.8825',

    // Vehicle & License
    vehicleType: 'scooter',
    licenseNumber: 'MH-DL-2020-0123456',

    // Skills
    skills: ['navigation', 'customer_service', 'hindi', 'english', 'fast_delivery'],

    // Education
    educationCertificate: '12th Pass',

    // DID/VC Information
    profileId: '76EU8N7DbR8c1iggygfVwwbgvciR4JidYDGukn1fJTBzvsTDN4kApU',
    address: '3yfncBXKU7tcpmYFdoHqPsAf6HC9DPRSft59pi4W3fv1T6at',
    credentialId: '76EU7fFzWoMrkR6Gk7CuAXxjFe6TjPEsj6oqqu5jN3avZrN1PuXP7i'
};

// Mock government credentials data
const mockGovernmentCredentials = [
    {
        id: 'cred_001',
        holderName: 'Rajesh Kumar Singh',
        documentType: 'aadhar' as DocumentType,
        documentNumber: '1234-5678-9012',
        issuingAuthority: 'UIDAI',
        issueDate: '2018-05-15',
        verificationStatus: 'verified' as const,
        credentialId: 'AADHAR_VC_001',
        isActive: true,
        documentSpecificData: {
            address: '123 Main Street, Andheri West, Mumbai, Maharashtra 400001',
            dateOfBirth: '1985-03-10',
            gender: 'Male',
            fatherName: 'Suresh Kumar Singh',
            mobileNumber: '+91-9876543210'
        }
    },
    {
        id: 'cred_002',
        holderName: 'Rajesh Kumar Singh',
        documentType: 'pan' as DocumentType,
        documentNumber: 'ABCDE1234F',
        issuingAuthority: 'Income Tax Department',
        issueDate: '2019-08-20',
        verificationStatus: 'verified' as const,
        credentialId: 'PAN_VC_002',
        isActive: true,
        documentSpecificData: {
            fatherName: 'Suresh Kumar Singh',
            dateOfBirth: '1985-03-10',
            category: 'Individual'
        }
    },
    {
        id: 'cred_003',
        holderName: 'Rajesh Kumar Singh',
        documentType: 'driving_license' as DocumentType,
        documentNumber: 'MH-DL-2020-0123456',
        issuingAuthority: 'RTO Mumbai',
        issueDate: '2020-06-15',
        expiryDate: '2040-06-15',
        verificationStatus: 'verified' as const,
        credentialId: 'DL_VC_003',
        isActive: true,
        documentSpecificData: {
            vehicleTypes: ['LMV', 'MCWG'],
            address: '123 Main Street, Andheri West, Mumbai, Maharashtra 400001',
            bloodGroup: 'B+',
            dateOfBirth: '1985-03-10',
            emergencyContact: '+91-9876543210'
        }
    },
    {
        id: 'cred_004',
        holderName: 'Rajesh Kumar Singh',
        documentType: 'uan' as DocumentType,
        documentNumber: '123456789012',
        issuingAuthority: 'EPFO',
        issueDate: '2023-03-20',
        verificationStatus: 'verified' as const,
        credentialId: 'UAN_VC_004',
        isActive: true,
        documentSpecificData: {
            employerName: 'Swiggy Delivery Services Pvt Ltd',
            dateOfJoining: '2023-03-15',
            designation: 'Delivery Partner',
            pfNumber: 'MH/MUM/12345/001234'
        }
    },
    {
        id: 'cred_005',
        holderName: 'Rajesh Kumar Singh',
        documentType: 'education_certificate' as DocumentType,
        documentNumber: '12TH/2003/MB/001234',
        issuingAuthority: 'Maharashtra State Board',
        issueDate: '2003-06-15',
        verificationStatus: 'verified' as const,
        credentialId: 'EDU_VC_005',
        isActive: true,
        documentSpecificData: {
            qualification: 'Higher Secondary Certificate (12th)',
            passingYear: '2003',
            percentage: '78.5%',
            grade: 'First Class',
            subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Hindi'],
            schoolName: 'Mumbai Public School'
        }
    }
];

export interface WorkerDetailPageProps {
    params: {
        id: string;
    };
}

export default function WorkerDetailPage() {
    const [selectedCredential, setSelectedCredential] = useState<any>(null);
    const router = useRouter();

    const worker = mockWorkerData;
    const credentials = mockGovernmentCredentials;

    const getDocumentIcon = (docType: DocumentType): string => {
        const icons: Record<DocumentType, string> = {
            aadhar: '🆔',
            pan: '💳',
            uan: '👥',
            voters_id: '🗳️',
            driving_license: '🚗',
            passport: '📘',
            education_certificate: '🎓',
            income_certificate: '💰',
            caste_certificate: '📄',
            domicile_certificate: '🏠',
            birth_certificate: '👶',
            other: '📋'
        };
        return icons[docType] || '📄';
    };

    const getDocumentDisplayName = (docType: DocumentType): string => {
        const names: Record<DocumentType, string> = {
            aadhar: 'Aadhar Card',
            pan: 'PAN Card',
            uan: 'UAN Number',
            voters_id: 'Voter ID',
            driving_license: 'Driving License',
            passport: 'Passport',
            education_certificate: 'Education Certificate',
            income_certificate: 'Income Certificate',
            caste_certificate: 'Caste Certificate',
            domicile_certificate: 'Domicile Certificate',
            birth_certificate: 'Birth Certificate',
            other: 'Other Document'
        };
        return names[docType] || docType;
    };

    const getStatusColor = (status: string): string => {
        const colors = {
            verified: 'text-green-600 bg-green-100',
            pending: 'text-yellow-600 bg-yellow-100',
            rejected: 'text-red-600 bg-red-100',
            expired: 'text-gray-600 bg-gray-100'
        };
        return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast notification here
    };

    const renderCredentialDetails = (credential: any) => {
        const data = credential.documentSpecificData;

        switch (credential.documentType) {
            case 'aadhar':
                return (
                    <div className="space-y-3">
                        <div><strong>Address:</strong> {data.address}</div>
                        <div><strong>Date of Birth:</strong> {data.dateOfBirth}</div>
                        <div><strong>Gender:</strong> {data.gender}</div>
                        <div><strong>Father&apos;s Name:</strong> {data.fatherName}</div>
                        <div><strong>Mobile:</strong> {data.mobileNumber}</div>
                    </div>
                );
            case 'pan':
                return (
                    <div className="space-y-3">
                        <div><strong>Father&apos;s Name:</strong> {data.fatherName}</div>
                        <div><strong>Date of Birth:</strong> {data.dateOfBirth}</div>
                        <div><strong>Category:</strong> {data.category}</div>
                    </div>
                );
            case 'driving_license':
                return (
                    <div className="space-y-3">
                        <div><strong>Vehicle Types:</strong> {data.vehicleTypes.join(', ')}</div>
                        <div><strong>Address:</strong> {data.address}</div>
                        <div><strong>Blood Group:</strong> {data.bloodGroup}</div>
                        <div><strong>Date of Birth:</strong> {data.dateOfBirth}</div>
                        <div><strong>Emergency Contact:</strong> {data.emergencyContact}</div>
                    </div>
                );
            case 'uan':
                return (
                    <div className="space-y-3">
                        <div><strong>Employer:</strong> {data.employerName}</div>
                        <div><strong>Date of Joining:</strong> {data.dateOfJoining}</div>
                        <div><strong>Designation:</strong> {data.designation}</div>
                        <div><strong>PF Number:</strong> {data.pfNumber}</div>
                    </div>
                );
            case 'education_certificate':
                return (
                    <div className="space-y-3">
                        <div><strong>Qualification:</strong> {data.qualification}</div>
                        <div><strong>Passing Year:</strong> {data.passingYear}</div>
                        <div><strong>Percentage:</strong> {data.percentage}</div>
                        <div><strong>Grade:</strong> {data.grade}</div>
                        <div><strong>School:</strong> {data.schoolName}</div>
                        <div><strong>Subjects:</strong> {data.subjects.join(', ')}</div>
                    </div>
                );
            default:
                return <div>No specific details available</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => { router.back() }} className="text-gray-400 hover:text-gray-600">
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
                                <Image
                                    src={worker.profileImage}
                                    alt={worker.fullName}
                                    className="w-32 h-32 rounded-full mx-auto mb-4"
                                />
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
                                    <span className="text-sm text-gray-600">{worker.city}, {worker.state}</span>
                                </div>
                            </div>

                            {/* Work Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-center space-x-1">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        <span className="text-lg font-bold text-gray-900">{worker.rating}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">Rating</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-center space-x-1">
                                        <Briefcase className="h-4 w-4 text-blue-500" />
                                        <span className="text-lg font-bold text-gray-900">{worker.totalJobs}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">Total Jobs</p>
                                </div>
                            </div>

                            {/* Platform & Service */}
                            <div className="space-y-3 mb-6">
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Platform: </span>
                                    <span className="text-sm text-gray-900">{worker.platform}</span>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Service: </span>
                                    <span className="text-sm text-gray-900">{worker.serviceType.replace('_', ' ').toUpperCase()}</span>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Vehicle: </span>
                                    <span className="text-sm text-gray-900">{worker.vehicleType.toUpperCase()}</span>
                                </div>
                            </div>

                            {/* Skills */}
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

                            {/* DID Information */}
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Digital Identity</h3>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-xs text-gray-500">Profile ID:</span>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-mono bg-gray-100 p-1 rounded break-all">
                                                {worker.profileId.substring(0, 20)}...
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(worker.profileId)}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">VC ID:</span>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-mono bg-gray-100 p-1 rounded break-all">
                                                {worker.credentialId.substring(0, 20)}...
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(worker.credentialId)}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Government Credentials */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-medium text-gray-900">Government Credentials</h3>
                                <div className="flex items-center space-x-2">
                                    <Shield className="h-5 w-5 text-green-500" />
                                    <span className="text-sm text-green-600">{credentials.length} Verified Documents</span>
                                </div>
                            </div>

                            {/* Credentials Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {credentials.map((credential) => (
                                    <div
                                        key={credential.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => setSelectedCredential(credential)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-2xl">{getDocumentIcon(credential.documentType)}</span>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">
                                                        {getDocumentDisplayName(credential.documentType)}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">{credential.documentNumber}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end space-y-1">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(credential.verificationStatus)}`}>
                                                    {credential.verificationStatus}
                                                </span>
                                                <button className="text-blue-600 hover:text-blue-800">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-3 space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Issuing Authority:</span>
                                                <span className="text-gray-700">{credential.issuingAuthority}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-500">Issue Date:</span>
                                                <span className="text-gray-700">{credential.issueDate}</span>
                                            </div>
                                            {credential.expiryDate && (
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-500">Expiry Date:</span>
                                                    <span className="text-gray-700">{credential.expiryDate}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Credential Detail Modal */}
            {selectedCredential && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">{getDocumentIcon(selectedCredential.documentType)}</span>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {getDocumentDisplayName(selectedCredential.documentType)}
                                    </h3>
                                    <p className="text-sm text-gray-500">{selectedCredential.documentNumber}</p>
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
                                        <div className="text-gray-900">{selectedCredential.holderName}</div>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Document Number:</span>
                                        <div className="text-gray-900">{selectedCredential.documentNumber}</div>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Issuing Authority:</span>
                                        <div className="text-gray-900">{selectedCredential.issuingAuthority}</div>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Issue Date:</span>
                                        <div className="text-gray-900">{selectedCredential.issueDate}</div>
                                    </div>
                                    {selectedCredential.expiryDate && (
                                        <div>
                                            <span className="font-medium text-gray-700">Expiry Date:</span>
                                            <div className="text-gray-900">{selectedCredential.expiryDate}</div>
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-medium text-gray-700">Status:</span>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCredential.verificationStatus)}`}>
                                            {selectedCredential.verificationStatus}
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
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">Credential ID:</span>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-mono bg-white p-2 rounded break-all">
                                                {selectedCredential.credentialId}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(selectedCredential.credentialId)}
                                                className="ml-2 text-blue-600 hover:text-blue-800"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
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
        </div>
    );
}