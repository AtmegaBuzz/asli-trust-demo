// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Upload, Users, Eye, Search } from 'lucide-react';
import CreateWorkerForm from '@/components/CreateWorkerForm';
import BulkUpload from '@/components/BulkUpload';
import WorkersTable from '@/components/WorkersTable';
import { GigWorker, Stats } from '@/types';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [workers, setWorkers] = useState<GigWorker[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    verified: 0,
    pending: 0,
    active: 0
  });

  // Fetch workers and stats
  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      const [workersRes, statsRes] = await Promise.all([
        fetch('/api/workers'),
        fetch('/api/stats')
      ]);
      
      const workersData: GigWorker[] = await workersRes.json();
      const statsData: Stats = await statsRes.json();
      
      setWorkers(workersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Users },
    { id: 'create', name: 'Create Worker', icon: Plus },
    { id: 'bulk', name: 'Bulk Upload', icon: Upload },
    { id: 'workers', name: 'All Workers', icon: Eye }
  ];

  const statCards = [
    { title: 'Total Workers', value: stats.total, icon: Users, color: 'text-gray-400' },
    { title: 'Verified', value: stats.verified, icon: () => <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center"><div className="h-2 w-2 bg-green-600 rounded-full"></div></div>, color: 'text-green-600' },
    { title: 'Pending', value: stats.pending, icon: () => <div className="h-6 w-6 bg-yellow-100 rounded-full flex items-center justify-center"><div className="h-2 w-2 bg-yellow-600 rounded-full"></div></div>, color: 'text-yellow-600' },
    { title: 'Active', value: stats.active, icon: () => <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center"><div className="h-2 w-2 bg-blue-600 rounded-full"></div></div>, color: 'text-blue-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gig Worker Identity Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Manage verifiable credentials for gig economy workers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {statCards.map((stat) => (
                <div key={stat.title} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                          <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Workers */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Workers</h3>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <WorkersTable workers={workers.slice(0, 5)} showActions={false} />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Create New Gig Worker Identity</h3>
              <CreateWorkerForm onSuccess={fetchData} />
            </div>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Bulk Upload Workers</h3>
              <BulkUpload onSuccess={fetchData} />
            </div>
          </div>
        )}

        {activeTab === 'workers' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">All Workers</h3>
                <button
                  onClick={fetchData}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <WorkersTable workers={workers} showActions={true} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}