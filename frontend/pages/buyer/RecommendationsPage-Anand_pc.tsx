import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { apiService } from '../../services/apiService';
import { FarmerRecommendation } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { UserCircleIcon, StarIcon, MapPinIcon } from '../../components/icons';
import { getCropImage } from '../../utils/imageMapper';

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
        terms: 'Standard terms from recommendation page.'
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
      {message && (
        <div className="fixed top-20 right-5 z-50 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-lg animate-fade-in-down">
          {message}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">AI-Matched Farmers</h2>
        <p className="text-gray-600 dark:text-gray-400">Based on your preferences and market trends.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recommendations.map((rec, index) => (
            <div key={rec.farmer.id + rec.crop.id + index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-md flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">

              {/* Image Section */}
              <div className="relative h-48 overflow-hidden group">
                <img
                  src={getCropImage(rec.crop.cropName)}
                  alt={rec.crop.cropName}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-0 right-0 bg-gradient-to-l from-black/60 to-transparent p-2">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center">
                    <StarIcon className="w-3 h-3 mr-1" />
                    {(rec.similarityScore * 100).toFixed(0)}% Match
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-8">
                  <h3 className="text-white font-bold text-lg">{rec.crop.cropName}</h3>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 flex-grow">
                <div className="flex items-start space-x-3 mb-4">
                  {rec.farmer.profileImageUrl ? (
                    <img src={rec.farmer.profileImageUrl} alt={rec.farmer.name} className="w-10 h-10 object-cover rounded-full ring-2 ring-gray-100 dark:ring-gray-700" />
                  ) : (
                    <UserCircleIcon className="w-10 h-10 text-gray-400" />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 leading-tight">{rec.farmer.name}</h4>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <MapPinIcon className="w-3 h-3 mr-1" />
                      {rec.crop.location || "Location N/A"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Quantity</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{rec.crop.quantity > 0 ? `${rec.crop.quantity} kg` : 'Available'}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                    <span className="text-gray-500 dark:text-gray-400">Price</span>
                    <span className="font-bold text-green-600 dark:text-green-400">₹{rec.crop.price}/kg</span>
                  </div>
                </div>
              </div>

              {/* Action Section */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => handleCreateAgreement(rec.farmer.id, rec.crop.id)}
                  className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium flex items-center justify-center group"
                >
                  <span>Request Agreement</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center justify-center text-gray-400">
            <UserCircleIcon className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium text-gray-500">No matching farmers found right now.</p>
            <p className="text-sm mt-2">Try adjusting your preferences or check back later.</p>
          </div>
        </Card>
      )}
    </Layout>
  );
};

export default RecommendationsPage;