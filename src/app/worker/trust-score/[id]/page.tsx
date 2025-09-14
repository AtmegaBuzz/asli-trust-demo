'use client';

import { useState, useEffect, use } from 'react';
import { Shield, CheckCircle, User, Mail, Phone, MapPin, Briefcase, Star, Loader2, AlertCircle } from 'lucide-react';

interface GigWorkerData {
    id: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    platform: string;
    service: string;
    imageUrl?: string;
    trustScore: number;
    verified: boolean;
    joinDate: string;
}

export default function GigWorkerInfoPage({ params }: { params: Promise<{ id: string }> }) {
    const [workerData, setWorkerData] = useState<GigWorkerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const resolvedParams = use(params);

    useEffect(() => {
        const fetchWorkerData = async () => {
            setLoading(true);
            try {
                const resp = await fetch(`/api/workers/${resolvedParams.id}`);

                if (resp.status !== 200) {
                    setError("Worker not found");
                    return;
                }

                const workerJson = await resp.json();
                setWorkerData(workerJson);

            } catch (e: any) {
                console.log("error fetching worker data: ", e);
                setError("Failed to fetch worker data");
            } finally {
                setLoading(false);
            }
        }

        // Mock data for demo - replace with actual API call
        const mockWorkerData: GigWorkerData = {
            id: resolvedParams.id,
            name: "James Anderson",
            email: "james@gmail.com",
            phone: "+919999999999",
            location: "Bangalore, KA",
            platform: "Other",
            service: "TASK SERVICES",
            imageUrl: "/worker-avatar.jpg", // Optional: add worker image
            trustScore: Math.floor(Math.random() * 100) + 1,
            verified: true,
            joinDate: "2023-06-15"
        };

        setTimeout(() => {
            setWorkerData(mockWorkerData);
            setLoading(false);
        }, 1000);

        // Uncomment below and remove mock data when API is ready
        // fetchWorkerData();
    }, [resolvedParams.id]);

    const getTrustScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getTrustScoreText = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Poor';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Worker Profile</h2>
                    <p className="text-gray-600">Please wait while we fetch the worker information...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="text-sm text-gray-500">
                        Please check the worker ID or contact support for assistance.
                    </div>
                </div>
            </div>
        );
    }

    if (!workerData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Worker Not Found</h2>
                    <p className="text-gray-600">The requested worker profile could not be located.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
            {/* Header with Verification Status */}
            <div className="bg-white shadow-sm border-b border-blue-200">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-center space-x-3">
                        {workerData.verified && <CheckCircle className="h-8 w-8 text-green-600" />}
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900">Gig Worker Profile</h1>
                            <p className="text-sm text-blue-600 font-medium">
                                {workerData.verified ? 'Verified Worker Profile' : 'Worker Profile'}
                            </p>
                        </div>
                        <Briefcase className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Main Worker Profile Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Section with Trust Score */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                {/* Profile Image */}
                                <div className="relative">
                                    {workerData.imageUrl ? (
                                        <img 
                                            src={workerData.imageUrl} 
                                            alt={workerData.name}
                                            className="w-24 h-24 rounded-full border-4 border-white/30 object-cover"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center">
                                            <User className="h-12 w-12 text-white/80" />
                                        </div>
                                    )}
                                    {workerData.verified && (
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                                            <CheckCircle className="h-5 w-5 text-white" />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Worker Info */}
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">{workerData.name}</h2>
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4" />
                                            <span className="text-blue-100">{workerData.email}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4" />
                                            <span className="text-blue-100">{workerData.phone}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4" />
                                            <span className="text-blue-100">{workerData.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Trust Score - Large and Prominent */}
                            <div className="text-center">
                                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                                    <div className="text-sm font-medium text-blue-100 mb-2">TRUST SCORE</div>
                                    <div className="text-6xl font-bold text-white mb-2">
                                        {workerData.trustScore}
                                    </div>
                                    <div className="text-sm font-semibold text-blue-100">
                                        {getTrustScoreText(workerData.trustScore)}
                                    </div>
                                    <div className="flex justify-center mt-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={`h-4 w-4 ${
                                                    i < Math.floor(workerData.trustScore / 20) 
                                                        ? 'text-yellow-300 fill-current' 
                                                        : 'text-white/40'
                                                }`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-8">
                        {/* Service Information */}
                        <div className="mb-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <Briefcase className="h-6 w-6 text-gray-400" />
                                <h3 className="text-lg font-semibold text-gray-900">Service Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-lg p-6">
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Platform</span>
                                    <p className="text-xl font-bold text-gray-900">{workerData.platform}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Service Type</span>
                                    <p className="text-xl font-bold text-gray-900">{workerData.service}</p>
                                </div>
                            </div>
                        </div>

                        {/* Trust Score Breakdown */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Score Details</h3>
                            <div className={`rounded-xl border-2 p-6 ${getTrustScoreColor(workerData.trustScore)}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <div className="text-3xl font-bold">{workerData.trustScore}/100</div>
                                        <div className="font-semibold">{getTrustScoreText(workerData.trustScore)} Rating</div>
                                    </div>
                                    <div className="text-right">
                                        <Shield className="h-12 w-12 mx-auto mb-2" />
                                        <div className="text-sm font-medium">Verified Score</div>
                                    </div>
                                </div>
                                
                                {/* Trust Score Bar */}
                                <div className="w-full bg-white rounded-full h-3 mb-4">
                                    <div 
                                        className="h-3 rounded-full transition-all duration-1000 ease-out"
                                        style={{ 
                                            width: `${workerData.trustScore}%`,
                                            backgroundColor: workerData.trustScore >= 80 ? '#16a34a' : 
                                                           workerData.trustScore >= 60 ? '#ca8a04' :
                                                           workerData.trustScore >= 40 ? '#ea580c' : '#dc2626'
                                        }}
                                    />
                                </div>
                                
                                <p className="text-sm">
                                    This trust score is calculated based on work history, client feedback, 
                                    and platform performance metrics.
                                </p>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Worker ID:</span>
                                        <p className="font-mono text-gray-900">{workerData.id}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Profile Status:</span>
                                        <div className="flex items-center space-x-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600 font-semibold">
                                                {workerData.verified ? 'Verified' : 'Unverified'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Member Since:</span>
                                        <p className="text-gray-900">{new Date(workerData.joinDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Last Updated:</span>
                                        <p className="text-gray-900">{new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Notice */}
                <div className="mt-6 sm:mt-8 text-center">
                    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Powered by Secure Verification</span>
                        </div>
                        <p className="text-xs text-gray-500 max-w-2xl mx-auto">
                            This worker profile is verified and maintained through our secure platform.
                            Trust scores are updated regularly based on performance and feedback.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}