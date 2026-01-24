import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { apiService } from '../../services/apiService';
import { Agreement, AgreementStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const AgreementsPage: React.FC = () => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AgreementStatus | 'all'>('all');

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await apiService.getAgreements(user.id, user.role);
      setAgreements(data);
    } catch (error) {
      console.error("Failed to fetch agreements", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const getStatusChip = (status: AgreementStatus) => {
    const baseClasses = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`;
      case 'accepted':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`;
      case 'completed':
        return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  const filteredAgreements = agreements.filter(
    (agreement) => filter === 'all' || agreement.status === filter
  );

  return (
    <Layout title="Agreements">
      <Card>
        <div className="mb-4">
            <div className="flex space-x-2">
                {(['all', 'pending', 'accepted', 'rejected', 'completed'] as const).map(status => (
                    <button key={status} onClick={() => setFilter(status)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === status ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{user?.role === 'farmer' ? 'Buyer' : 'Farmer'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-4">Loading agreements...</td></tr>
              ) : filteredAgreements.length > 0 ? (
                filteredAgreements.map((agreement) => (
                  <tr key={agreement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{agreement.crop.cropName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user?.role === 'farmer' ? agreement.buyerName : agreement.farmerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{agreement.crop.quantity} kg</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">₹{(agreement.crop.quantity * agreement.crop.price).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(agreement.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={getStatusChip(agreement.status)}>{agreement.status}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="text-center py-4">No agreements found for this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  );
};

export default AgreementsPage;