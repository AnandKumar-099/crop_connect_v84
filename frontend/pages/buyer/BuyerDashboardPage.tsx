import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { apiService } from '../../services/apiService';
import { Agreement, FarmerRecommendation } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { PresentationChartLineIcon, ShieldCheckIcon, UserGroupIcon, UserCircleIcon } from '../../components/icons';

const BuyerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [recommendations, setRecommendations] = useState<FarmerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await apiService.getBuyerDashboardData(user.id);
      setAgreements(data.agreements);
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error("Failed to fetch buyer dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <Layout title="Dashboard"><div className="text-center">Loading...</div></Layout>;
  
  const activeAgreements = agreements.filter(a => a.status === 'accepted');
  const pendingAgreements = agreements.filter(a => a.status === 'pending');

  const StatCard = ({ title, value, colorClass }: {title: string, value: number, colorClass: string}) => (
      <Card className={`${colorClass} text-white`}>
          <h4 className="font-semibold text-lg">{title}</h4>
          <p className="text-4xl font-bold">{value}</p>
      </Card>
  )

  return (
    <Layout title="Buyer Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Active Agreements" value={activeAgreements.length} colorClass="bg-green-500 dark:bg-green-600" />
        <StatCard title="Pending Agreements" value={pendingAgreements.length} colorClass="bg-yellow-500 dark:bg-yellow-600" />
        <StatCard title="Recommended Farmers" value={recommendations.length} colorClass="bg-blue-500 dark:bg-blue-600" />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <Card title="Latest Recommendations">
            <div className="space-y-2">
                {recommendations.slice(0, 3).map(rec => (
                <div key={rec.farmer.id + rec.crop.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center space-x-4">
                    {rec.farmer.profileImageUrl ? (
                        <img src={rec.farmer.profileImageUrl} alt={rec.farmer.name} className="w-12 h-12 object-cover rounded-full"/>
                    ) : (
                        <UserCircleIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    )}
                    <img src={rec.crop.imageUrl} alt={rec.crop.cropName} className="w-12 h-12 object-cover rounded-md"/>
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{rec.farmer.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{rec.crop.cropName} - {rec.crop.location}</p>
                    </div>
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Score: {rec.similarityScore.toFixed(2)}</span>
                </div>
                ))}
            </div>
            {recommendations.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400">No recommendations available yet.</p>}
             <Link to="/buyer/recommendations" className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium mt-4 block text-center transition-colors">
              View all recommendations
            </Link>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Card title="AI Tools">
                <div className="space-y-4">
                    <Link to="/buyer/recommendations" className="block p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all transform hover:scale-[1.02]">
                        <div className="flex items-center space-x-4">
                            <UserGroupIcon className="w-8 h-8 text-blue-600 dark:text-blue-400"/>
                            <div>
                                <h4 className="font-semibold">Farmer Matching</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Find the best farmers for your needs.</p>
                            </div>
                        </div>
                    </Link>
                    <Link to="/buyer/price-forecast" className="block p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all transform hover:scale-[1.02]">
                        <div className="flex items-center space-x-4">
                            <PresentationChartLineIcon className="w-8 h-8 text-purple-600 dark:text-purple-400"/>
                            <div>
                                <h4 className="font-semibold">Price Forecast</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Predict future crop prices.</p>
                            </div>
                        </div>
                    </Link>
                    <Link to="/buyer/risk-analysis" className="block p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all transform hover:scale-[1.02]">
                        <div className="flex items-center space-x-4">
                            <ShieldCheckIcon className="w-8 h-8 text-red-600 dark:text-red-400"/>
                            <div>
                                <h4 className="font-semibold">Contract Risk Analysis</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Assess risk before making a deal.</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BuyerDashboardPage;