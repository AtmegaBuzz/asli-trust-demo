'use client';

import { useState } from 'react';
import { Eye, ExternalLink, Copy, CheckCircle, XCircle, Clock } from 'lucide-react';
import { GigWorker } from '@/types';
import { useRouter } from 'next/navigation';

interface WorkersTableProps {
  workers: GigWorker[];
  showActions: boolean;
}

export default function WorkersTable({ workers, showActions }: WorkersTableProps) {
  const [selectedWorker, setSelectedWorker] = useState<GigWorker | null>(null);

  const router = useRouter();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const checkVCStatus = async (credentialId: string) => {
    try {
      const response = await fetch(`http://20.193.138.24:5106/api/v1/cred/${credentialId}`);

      if (response.ok) {
        const data = await response.json();
        alert(`✅ VC Status: Active\n📄 Credential ID: ${credentialId}\n🏢 Issuer: ${data.vc?.issuer || 'N/A'}\n📅 Issued: ${data.vc?.issuanceDate || 'N/A'}\n📅 Expires: ${data.vc?.expirationDate || 'N/A'}`);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        alert(`❌ VC Status: Error\n🔍 Details: ${errorData.message || 'Credential not found'}`);
      }
    } catch (error) {
      console.error('Error checking VC status:', error);
      alert('❌ Error checking VC status - Network or server error');
    }
  };

  const viewCredential = async (credentialId: string) => {
    try {
      const response = await fetch(`http://20.193.138.24:5106/api/v1/cred/${credentialId}`);

      if (response.ok) {
        const data = await response.json();
        // Create a formatted view of the credential
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>Verifiable Credential - ${credentialId}</title></head>
              <body style="font-family: monospace; margin: 20px; background: #f5f5f5;">
                <h2>🎫 Verifiable Credential Details</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h3>📋 Basic Info</h3>
                  <p><strong>Credential ID:</strong> ${data.credId || credentialId}</p>
                  <p><strong>Status:</strong> ${data.result || 'Active'}</p>
                  <p><strong>Issued:</strong> ${data.vc?.issuanceDate || 'N/A'}</p>
                  <p><strong>Expires:</strong> ${data.vc?.expirationDate || 'N/A'}</p>
                  <p><strong>Issuer:</strong> ${data.vc?.issuer || 'N/A'}</p>
                  
                  <h3>👤 Subject Details</h3>
                  <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(data.vc?.credentialSubject, null, 2)}</pre>
                  
                  <h3>🔍 Full Credential</h3>
                  <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; max-height: 400px; overflow-y: auto;">${JSON.stringify(data, null, 2)}</pre>
                </div>
              </body>
            </html>
          `);
        }
      } else {
        alert('Error fetching credential details');
      }
    } catch (error) {
      console.error('Error fetching credential:', error);
      alert('Error fetching credential details');
    }
  };

  if (workers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No workers found</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Worker
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DID/VC Status
              </th>
              {showActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workers.map((worker) => (
              <tr key={worker.id} className="hover:bg-gray-50" onClick={() => { router.push(`worker/${worker.workerId}`) }}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {worker.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {worker.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {worker.phoneNumber}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{worker.platform || 'N/A'}</div>
                  <div className="text-sm text-gray-500">
                    {worker.serviceType?.replace('_', ' ').toUpperCase() || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">{worker.workerId || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(worker.backgroundCheckStatus)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(worker.backgroundCheckStatus)}`}>
                      {worker.backgroundCheckStatus}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {worker.verificationLevel}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{worker.city || 'N/A'}</div>
                  <div className="text-gray-500">{worker.state || 'N/A'}</div>
                  <div className="text-gray-500">{worker.country}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${worker.profileId ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-xs">DID: {worker.profileId ? 'Created' : 'Pending'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${worker.credentialId ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-xs">VC: {worker.credentialId ? 'Issued' : 'Pending'}</span>
                      {worker.credentialId && (
                        <button
                          onClick={() => checkVCStatus(worker.credentialId!)}
                          className="text-blue-500 hover:text-blue-700 text-xs underline"
                          title="Check VC Status"
                        >
                          (Check Status)
                        </button>
                      )}
                    </div>
                  </div>
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedWorker(worker)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {worker.credentialId && (
                        <button
                          onClick={() => viewCredential(worker.credentialId!)}
                          className="text-green-600 hover:text-green-900"
                          title="View Credential"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Worker Details Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Worker Details: {selectedWorker.fullName}
                </h3>
                <button
                  onClick={() => setSelectedWorker(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm text-gray-900">
                    <div><strong className="text-gray-900">Name:</strong> {selectedWorker.fullName}</div>
                    <div><strong className="text-gray-900">Email:</strong> {selectedWorker.email}</div>
                    <div><strong className="text-gray-900">Phone:</strong> {selectedWorker.phoneNumber}</div>
                    <div><strong className="text-gray-900">Aadhar:</strong> {selectedWorker.aadharNo || 'N/A'}</div>
                    <div><strong className="text-gray-900">PAN:</strong> {selectedWorker.panNo || 'N/A'}</div>
                    <div><strong className="text-gray-900">UAN:</strong> {selectedWorker.uanNumber || 'N/A'}</div>
                    <div><strong className="text-gray-900">Voter ID:</strong> {selectedWorker.votersId || 'N/A'}</div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Work Information</h4>
                  <div className="space-y-2 text-sm text-gray-900">
                    <div><strong className="text-gray-900">Worker ID:</strong> {selectedWorker.workerId || 'N/A'}</div>
                    <div><strong className="text-gray-900">Platform:</strong> {selectedWorker.platform || 'N/A'}</div>
                    <div><strong className="text-gray-900">Service:</strong> {selectedWorker.serviceType || 'N/A'}</div>
                    <div><strong className="text-gray-900">Vehicle:</strong> {selectedWorker.vehicleType || 'N/A'}</div>
                    <div><strong className="text-gray-900">License:</strong> {selectedWorker.licenseNumber || 'N/A'}</div>
                    <div><strong className="text-gray-900">Rating:</strong> {selectedWorker.rating || 0}/5</div>
                    <div><strong className="text-gray-900">Total Jobs:</strong> {selectedWorker.totalJobs || 0}</div>
                  </div>
                </div>

                {/* DID/VC Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">DID & Credential Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <strong className="text-gray-900">Profile ID:</strong>
                      {selectedWorker.profileId && (
                        <button
                          onClick={() => copyToClipboard(selectedWorker.profileId!)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs font-mono bg-white p-2 rounded break-all text-gray-900">
                      {selectedWorker.profileId || 'Not created'}
                    </div>

                    <div className="flex items-center justify-between">
                      <strong className="text-gray-900">Blockchain Address:</strong>
                      {selectedWorker.address && (
                        <button
                          onClick={() => copyToClipboard(selectedWorker.address!)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs font-mono bg-white p-2 rounded break-all text-gray-900">
                      {selectedWorker.address || 'Not created'}
                    </div>

                    <div className="flex items-center justify-between">
                      <strong className="text-gray-900">Credential ID:</strong>
                      {selectedWorker.credentialId && (
                        <button
                          onClick={() => copyToClipboard(selectedWorker.credentialId!)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-xs font-mono bg-white p-2 rounded break-all text-gray-900">
                      {selectedWorker.credentialId || 'Not issued'}
                    </div>
                  </div>
                </div>

                {/* Skills & Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Skills & Status</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong className="text-gray-900">Skills:</strong></div>
                    <div className="flex flex-wrap gap-1">
                      {selectedWorker.skills.length > 0 ? (
                        selectedWorker.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No skills listed</span>
                      )}
                    </div>
                    <div><strong className="text-gray-900">Verification:</strong> <span className="text-gray-900">{selectedWorker.verificationLevel}</span></div>
                    <div><strong className="text-gray-900">Background Check:</strong> <span className="text-gray-900">{selectedWorker.backgroundCheckStatus}</span></div>
                    <div><strong className="text-gray-900">Status:</strong> <span className="text-gray-900">{selectedWorker.isActive ? 'Active' : 'Inactive'}</span></div>
                    <div><strong className="text-gray-900">Join Date:</strong> <span className="text-gray-900">{new Date(selectedWorker.joinDate).toLocaleDateString()}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                {selectedWorker.credentialId && (
                  <button
                    onClick={() => viewCredential(selectedWorker.credentialId!)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View Credential</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedWorker(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}