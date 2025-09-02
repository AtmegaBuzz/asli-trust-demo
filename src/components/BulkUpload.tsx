// components/BulkUpload.tsx
'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { BulkUploadData } from '@/types';

interface BulkUploadProps {
  onSuccess: () => void;
}

export default function BulkUpload({ onSuccess }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<{
    total: number;
    successful: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
      
      if (!validTypes.includes(fileExtension)) {
        alert('Please upload a CSV or Excel file');
        return;
      }
      
      setFile(selectedFile);
      setResults(null);
    }
  };

  const downloadTemplate = (): void => {
    const headers = [
      'Name',
      'MOB',
      'AADHAR NO',
      'PAN NO', 
      'UAN NO',
      'VOTERS ID',
      'ED CERTIFICATE',
      'GEOLOCATION HOME',
      'GEOLOCATION',
      'City',
      'State',
      'Platform',
      'Service Type',
      'Vehicle Type',
      'License Number',
      'Skills'
    ];

    const sampleData = [
      [
        'Rajesh Kumar',
        '+91-9876543210',
        '1234-5678-9012',
        'ABCDE1234F',
        '123456789012',
        'ABC1234567',
        '12th Pass',
        '19.0760,72.8777',
        '19.0856,72.8825',
        'Mumbai',
        'Maharashtra',
        'Swiggy',
        'food_delivery',
        'scooter',
        'MH-DL-2020-0123456',
        'navigation, customer_service, hindi'
      ]
    ];

    const csvContent = [headers, ...sampleData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gig_workers_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): BulkUploadData[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.replace(/"/g, '').trim());
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      return {
        name: row.name || '',
        mob: row.mob || '',
        aadharNo: row['aadhar no'] || '',
        panNo: row['pan no'] || '',
        uanNo: row['uan no'] || '',
        votersId: row['voters id'] || '',
        edCertificate: row['ed certificate'] || '',
        geoLocationHome: row['geolocation home'] || '',
        geoLocation: row.geolocation || '',
        city: row.city || '',
        state: row.state || '',
        platform: row.platform || '',
        serviceType: row['service type'] || '',
        vehicleType: row['vehicle type'] || '',
        licenseNumber: row['license number'] || '',
        skills: row.skills || ''
      };
    });
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Read file content
      const text = await file.text();
      const workers = parseCSV(text);

      if (workers.length === 0) {
        alert('No valid data found in the file');
        return;
      }

      // Process workers in batches
      const batchSize = 5; // Process 5 workers at a time
      let successful = 0;
      let failed = 0;
      const errors: string[] = [];

      for (let i = 0; i < workers.length; i += batchSize) {
        const batch = workers.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (workerData) => {
          try {
            const processedData = {
              fullName: workerData.name,
              email: `${workerData.name.toLowerCase().replace(/\s+/g, '.')}@temp.com`, // Generate temp email
              phoneNumber: workerData.mob,
              aadharNo: workerData.aadharNo,
              panNo: workerData.panNo,
              uanNumber: workerData.uanNo,
              votersId: workerData.votersId,
              educationCertificate: workerData.edCertificate,
              homeGeoLocation: workerData.geoLocationHome,
              workGeoLocation: workerData.geoLocation,
              city: workerData.city || '',
              state: workerData.state || '',
              country: 'India',
              platform: workerData.platform || '',
              serviceType: workerData.serviceType || '',
              vehicleType: workerData.vehicleType || '',
              licenseNumber: workerData.licenseNumber || '',
              skills: workerData.skills ? workerData.skills.split(',').map(s => s.trim()).filter(Boolean) : []
            };

            const response = await fetch('/api/workers', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(processedData),
            });

            if (response.ok) {
              const result = await response.json();
              if (result.success && result.credential && result.credential.credId) {
                successful++;
              } else {
                errors.push(`${workerData.name}: VC issuance failed - ${result.error || 'Unknown error'}`);
                failed++;
              }
            } else {
              const error = await response.json();
              errors.push(`${workerData.name}: ${error.error}`);
              failed++;
            }
          } catch (error) {
            errors.push(`${workerData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            failed++;
          }
        });

        await Promise.all(batchPromises);
        
        // Update progress
        const processed = Math.min(i + batchSize, workers.length);
        setProgress((processed / workers.length) * 100);

        // Small delay between batches to avoid overwhelming the API
        if (i + batchSize < workers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setResults({
        total: workers.length,
        successful,
        failed,
        errors
      });

      onSuccess();

    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please check the format and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Bulk Upload Instructions
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Download the template CSV file and fill in your worker data</li>
                <li>Required fields: Name, Mobile Number</li>
                <li>The system will automatically create DID profiles and issue VCs</li>
                <li>Large files will be processed in batches</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Template Download */}
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center">
          <FileText className="h-8 w-8 text-gray-400 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-gray-900">Download Template</h4>
            <p className="text-sm text-gray-500">Get the CSV template with sample data</p>
          </div>
        </div>
        <button
          onClick={downloadTemplate}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </button>
      </div>

      {/* File Upload Form */}
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload CSV/Excel File
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">CSV, XLSX up to 10MB</p>
            </div>
          </div>
          {file && (
            <div className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!file || uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>{uploading ? 'Processing...' : 'Upload & Process'}</span>
          </button>
        </div>
      </form>

      {/* Progress Bar */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Results</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{results.total}</div>
              <div className="text-sm text-gray-500">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 mr-1" />
                {results.successful}
              </div>
              <div className="text-sm text-gray-500">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 mr-1" />
                {results.failed}
              </div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
          </div>

          {results.errors.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Errors:</h4>
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <ul className="text-sm text-red-700 space-y-1">
                  {results.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {results.successful > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                ✓ {results.successful} workers have been successfully created with DID profiles and verifiable credentials.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}