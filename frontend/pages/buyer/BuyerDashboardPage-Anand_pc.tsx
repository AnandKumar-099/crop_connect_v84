import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { apiService } from '../../services/apiService';
import { Agreement, FarmerRecommendation, Crop } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { PresentationChartLineIcon, ShieldCheckIcon, UserGroupIcon, UserCircleIcon, ShoppingCartIcon } from '../../components/icons';
import { getCropImage } from '../../utils/imageMapper';



const BuyerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [recommendations, setRecommendations] = useState<FarmerRecommendation[]>([]);
  const [marketplaceCrops, setMarketplaceCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Parallel fetch
      const [dashboardData, allCrops] = await Promise.all([
        apiService.getBuyerDashboardData(user.id),
        apiService.getAllCrops()
      ]);

      setAgreements(dashboardData.agreements);
      setRecommendations(dashboardData.recommendations);
      setMarketplaceCrops(allCrops);
    } catch (error) {
      console.error("Failed to fetch buyer dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateAgreement = async (farmerId: string, cropId: string, cropName: string) => {
    try {
      await apiService.createAgreement({
        buyerId: user!.id,
        farmerId,
        cropId,
        terms: 'Standard terms from marketplace.'
      });
      alert(`Request sent for ${cropName}!`);
      fetchData(); // Refresh to update button state if needed
    } catch (error) {
      console.error(error);
      alert('Failed to send request.');
    }
  };

  if (loading) return <Layout title="Dashboard"><div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div></Layout>;

  const activeAgreements = agreements.filter(a => a.status === 'accepted');
  const pendingAgreements = agreements.filter(a => a.status === 'pending');

  const StatCard = ({ title, value, colorClass }: { title: string, value: number, colorClass: string }) => (
    <Card className={`${colorClass} text-white`}>
      <h4 className="font-semibold text-lg">{title}</h4>
      <p className="text-4xl font-bold">{value}</p>
    </Card>
  )

  return (
    <Layout title="Buyer Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Active Agreements" value={activeAgreements.length} colorClass="bg-green-500 dark:bg-green-600" />
        <StatCard title="Pending Agreements" value={pendingAgreements.length} colorClass="bg-yellow-500 dark:bg-yellow-600" />
        <StatCard title="Recommended Farmers" value={recommendations.length} colorClass="bg-blue-500 dark:bg-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">

          {/* Marketplace Section - NEW */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
              <ShoppingCartIcon className="w-6 h-6 mr-2 text-green-600" />
              Recent Crop Listings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaceCrops.slice(0, 6).map(crop => (
                <div key={crop.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col">
                  <div className="h-48 overflow-hidden relative group">
                    <img
                      src={getCropImage(crop.cropName)}
                      alt={crop.cropName}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                      ₹{crop.price}/kg
                    </div>
                  </div>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">{crop.cropName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                        <span className="truncate">{typeof crop.location === 'object' ? (crop.location as any).address : crop.location}</span>
                      </p>
                      <div className="flex items-center space-x-2 mb-3">
                        <UserCircleIcon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {(crop as any).farmerId?.name || 'Farmer'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCreateAgreement((crop as any).farmerId?._id || (crop as any).farmerId, crop.id, crop.cropName)}
                      className="w-full mt-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 py-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors font-medium text-sm"
                    >
                      Request Deal
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {marketplaceCrops.length === 0 && (
              <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500">No crop listings found. Check back later!</p>
              </div>
            )}
          </div>

          {/* Recommendations Section */}
          <Card title="Latest Recommendations">
            <div className="space-y-3">
              {recommendations.slice(0, 3).map(rec => (
                <div key={rec.farmer.id + (rec.crop ? rec.crop.id : Math.random())} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b dark:border-gray-700 last:border-0">
                  <div className="flex items-center space-x-4">
                    <img
                      src={getCropImage(rec.crop.cropName)}
                      alt={rec.crop.cropName}
                      className="w-12 h-12 object-cover rounded-lg shadow-sm"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{rec.farmer.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{rec.crop.cropName} • Score: {rec.similarityScore.toFixed(2)}</p>
                    </div>
                  </div>
                  <Link to="/buyer/recommendations" className="text-sm text-blue-600 hover:text-blue-800">View</Link>
                </div>
              ))}
            </div>
            {recommendations.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 py-4">No AI recommendations yet.</p>}
          </Card>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="AI Tools">
            <div className="space-y-3">
              <Link to="/buyer/recommendations" className="block p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group">
                <div className="flex items-center space-x-3">
                  <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Matchmaking</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Find best farmers</p>
                  </div>
                </div>
              </Link>
              <Link to="/buyer/price-forecast" className="block p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors group">
                <div className="flex items-center space-x-3">
                  <PresentationChartLineIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-medium text-purple-900 dark:text-purple-100">Price Forecast</h4>
                    <p className="text-xs text-purple-700 dark:text-purple-300">Predict trends</p>
                  </div>
                </div>
              </Link>
              <Link to="/buyer/risk-analysis" className="block p-3 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors group">
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="w-6 h-6 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="font-medium text-red-900 dark:text-red-100">Risk Analysis</h4>
                    <p className="text-xs text-red-700 dark:text-red-300">Assess contracts</p>
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