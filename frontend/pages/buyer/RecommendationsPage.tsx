import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { apiService } from '../../services/apiService';
import { FarmerRecommendation } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { UserCircleIcon } from '../../components/icons';

const RecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<FarmerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  const fetchRecommendations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await apiService.getBuyerRecommendations(user.id);
      setRecommendations(data);
    } catch (error) {
      console.error("Failed to fetch recommendations", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleCreateAgreement = async (farmerId: string, cropId: string) => {
    if (!user) return;
    try {
        await apiService.createAgreement({
            buyerId: user.id,
            farmerId,
            cropId,
            terms: 'Standard terms and conditions apply.'
        });
        setMessage('Agreement request sent successfully!');
        setTimeout(() => setMessage(''), 3000);
    } catch (error) {
        setMessage('Failed to send agreement request.');
        console.error(error);
    }
  };

  return (
    <Layout title="Farmer Recommendations">
        {message && <div className="p-3 mb-4 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg">{message}</div>}
        {loading ? (
          <div className="text-center p-8"><p>Loading recommendations...</p></div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map(rec => (
              <div key={rec.farmer.id + rec.crop.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.03]">
                <div className="relative">
                    <img src={rec.crop.imageUrl} alt={rec.crop.cropName} className="w-full h-48 object-cover"/>
                    <div className="absolute top-2 right-2 bg-green-100/80 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                      Score: {rec.similarityScore.toFixed(2)}
                    </div>
                </div>
                <div className="p-5 flex-grow">
                  <div className="flex items-center space-x-3 mb-3">
                    {rec.farmer.profileImageUrl ? (
                        <img src={rec.farmer.profileImageUrl} alt={rec.farmer.name} className="w-12 h-12 object-cover rounded-full ring-2 ring-green-500"/>
                    ) : (
                        <UserCircleIcon className="w-12 h-12 text-gray-400" />
                    )}
                    <div>
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{rec.farmer.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{rec.crop.location}</p>
                    </div>
                  </div>
                  <div className="border-t dark:border-gray-700 pt-4 mt-4 text-sm space-y-2">
                    <p className="flex justify-between"><span className="font-semibold text-gray-600 dark:text-gray-300">Crop:</span> <span className="font-medium">{rec.crop.cropName}</span></p>
                    <p className="flex justify-between"><span className="font-semibold text-gray-600 dark:text-gray-300">Quantity:</span> <span>{rec.crop.quantity} kg</span></p>
                    <p className="flex justify-between"><span className="font-semibold text-gray-600 dark:text-gray-300">Price:</span> <span className="font-bold text-green-600 dark:text-green-400">₹{rec.crop.price}/kg</span></p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                    <button
                      onClick={() => handleCreateAgreement(rec.farmer.id, rec.crop.id)} 
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                      Request Agreement
                    </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card><p className="text-center text-gray-500">No recommendations found. Please check back later.</p></Card>
        )}
    </Layout>
  );
};

export default RecommendationsPage;