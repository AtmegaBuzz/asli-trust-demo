// components/CreateWorkerForm.tsx
'use client';

import { useState, FormEvent, ChangeEvent, useCallback } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { CreateWorkerInput, ServiceType, VehicleType, GigWorkerFormInput } from '@/types';

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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      // Process skills as array
      const processedData: CreateWorkerInput = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(Boolean)
      };

      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });

      if (response.ok) {
        await response.json();
        alert('Worker created successfully with DID and VC!');
        
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
            <label className="block text-sm font-medium text-gray-700">Full Name *</label>
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

      {/* Government IDs */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">Government IDs</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
            <input
              type="text"
              name="aadharNo"
              value={formData.aadharNo}
              onChange={handleChange}
              placeholder="1234-5678-9012"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">PAN Number</label>
            <input
              type="text"
              name="panNo"
              value={formData.panNo}
              onChange={handleChange}
              placeholder="ABCDE1234F"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">UAN Number</label>
            <input
              type="text"
              name="uanNumber"
              value={formData.uanNumber}
              onChange={handleChange}
              placeholder="123456789012"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Voter ID</label>
            <input
              type="text"
              name="votersId"
              value={formData.votersId}
              onChange={handleChange}
              placeholder="ABC1234567"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">Location Information</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Home Geo Location</label>
            <input
              type="text"
              name="homeGeoLocation"
              value={formData.homeGeoLocation}
              onChange={handleChange}
              placeholder="19.0760,72.8777"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Work Geo Location</label>
            <input
              type="text"
              name="workGeoLocation"
              value={formData.workGeoLocation}
              onChange={handleChange}
              placeholder="19.0760,72.8777"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
        </div>
      </div>

      {/* Work Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-900 mb-4">Work Information</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Platform</label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              <option value="">Select Platform</option>
              {platforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Service Type</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
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
            <label className="block text-sm font-medium text-gray-700">License Number</label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              placeholder="MH-DL-2020-0123456"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
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
            <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="navigation, customer service, hindi, english"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Education Certificate</label>
            <input
              type="text"
              name="educationCertificate"
              value={formData.educationCertificate}
              onChange={handleChange}
              placeholder="10th/12th/Graduate/Post Graduate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
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