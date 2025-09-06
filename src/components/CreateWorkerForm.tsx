// components/CreateWorkerForm.tsx
'use client';

import { useState, FormEvent, ChangeEvent, useCallback } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { CreateWorkerInput, ServiceType, VehicleType, GigWorkerFormInput, GovernmentDocument } from '@/types';
import GovernmentDocumentsSection from './GovernmentDocumentsSection';

interface CreateWorkerFormProps {
  onSuccess: () => void;
}

export default function CreateWorkerForm({ onSuccess }: CreateWorkerFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<GigWorkerFormInput>({
    fullName: '',
    email: '',
    phoneNumber: '',
    aadharNo: '',
    panNo: '',
    uanNumber: '',
    votersId: '',
    educationCertificate: '',
    city: '',
    state: '',
    country: 'India',
    platform: '',
    serviceType: '',
    licenseNumber: '',
    vehicleType: '',
    skills: '',
    homeGeoLocation: '',
    workGeoLocation: ''
  });

  const [governmentDocuments, setGovernmentDocuments] = useState<GovernmentDocument[]>([]);

  const serviceTypes: ServiceType[] = [
    'ride_sharing',
    'food_delivery',
    'package_delivery',
    'home_services',
    'freelancing',
    'task_services'
  ];

  const vehicleTypes: VehicleType[] = [
    'bike',
    'scooter',
    'car',
    'sedan',
    'suv',
    'bicycle',
    'on_foot'
  ];

  const platforms = [
    'Uber', 'Ola', 'Swiggy', 'Zomato', 'Dunzo', 'Urban Company', 'Other'
  ];

  const inputClassName = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border text-gray-900 bg-white placeholder-gray-500";
  
  const selectClassName = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border text-gray-900 bg-white";

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleGovernmentDocumentsChange = useCallback((documents: GovernmentDocument[]) => {
    setGovernmentDocuments(documents);
    
    // Update legacy fields for backward compatibility
    const aadhar = documents.find(doc => doc.documentType === 'aadhar');
    const pan = documents.find(doc => doc.documentType === 'pan');
    const uan = documents.find(doc => doc.documentType === 'uan');
    const voters = documents.find(doc => doc.documentType === 'voters_id');
    
    setFormData(prev => ({
      ...prev,
      aadharNo: aadhar?.documentNumber || '',
      panNo: pan?.documentNumber || '',
      uanNumber: uan?.documentNumber || '',
      votersId: voters?.documentNumber || ''
    }));
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      // Process skills as array
      const processedData: CreateWorkerInput = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
      };

      // Create the main worker first
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // If we have government documents, create credentials for each
        if (governmentDocuments.length > 0) {
          const credentialPromises = governmentDocuments.map(async (doc) => {
            try {
              const govCredResponse = await fetch('/api/government-credentials', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  holderName: doc.holderName,
                  documentType: doc.documentType,
                  customDocumentName: doc.customDocumentName,
                  documentNumber: doc.documentNumber,
                  issuingAuthority: doc.issuingAuthority,
                  issueDate: doc.issueDate,
                  profileAddress: result.profile.address, // Use the worker's DID address
                  workerId: result.worker.id // Link to the worker
                }),
              });
              
              if (govCredResponse.ok) {
                console.log(`Government credential created for ${doc.documentType}`);
              } else {
                console.error(`Failed to create credential for ${doc.documentType}`);
              }
            } catch (error) {
              console.error(`Error creating credential for ${doc.documentType}:`, error);
            }
          });

          // Wait for all government credentials to be processed
          await Promise.allSettled(credentialPromises);
        }

        alert('Worker created successfully with DID and VC! Government documents processed.');
        
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          aadharNo: '',
          panNo: '',
          uanNumber: '',
          votersId: '',
          educationCertificate: '',
          city: '',
          state: '',
          country: 'India',
          platform: '',
          serviceType: '',
          licenseNumber: '',
          vehicleType: '',
          skills: '',
          homeGeoLocation: '',
          workGeoLocation: ''
        });

        setGovernmentDocuments([]);
        onSuccess();
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating worker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">Personal Information</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-900">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Mobile Number *</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              placeholder="+91-9876543210"
              className={inputClassName}
            />
          </div>
        </div>
      </div>

      {/* Government Documents Section */}
      <GovernmentDocumentsSection
        documents={governmentDocuments}
        onDocumentsChange={handleGovernmentDocumentsChange}
        holderName={formData.fullName || 'Unknown'}
      />

      {/* Location Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">Location Information</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-900">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Home Geo Location</label>
            <input
              type="text"
              name="homeGeoLocation"
              value={formData.homeGeoLocation}
              onChange={handleChange}
              placeholder="19.0760,72.8777"
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Work Geo Location</label>
            <input
              type="text"
              name="workGeoLocation"
              value={formData.workGeoLocation}
              onChange={handleChange}
              placeholder="19.0760,72.8777"
              className={inputClassName}
            />
          </div>
        </div>
      </div>

      {/* Work Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">Work Information</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-900">Platform</label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className={selectClassName}
            >
              <option value="">Select Platform</option>
              {platforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Service Type</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className={selectClassName}
            >
              <option value="">Select Service Type</option>
              {serviceTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">License Number</label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="MH-DL-2020-0123456"
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900">Vehicle Type</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className={selectClassName}
            >
              <option value="">Select Vehicle</option>
              {vehicleTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">Skills (comma separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="navigation, customer service, hindi, english"
              className={inputClassName}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-900">Education Certificate</label>
            <input
              type="text"
              name="educationCertificate"
              value={formData.educationCertificate}
              onChange={handleChange}
              placeholder="10th/12th/Graduate/Post Graduate"
              className={inputClassName}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Create Worker & Issue VC</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}