import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { apiService } from '../../services/apiService';
import { Crop, Agreement } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { getCropImage } from '../../utils/imageMapper';
import { PresentationChartLineIcon } from '../../components/icons';

const FarmerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [cropImageFile, setCropImageFile] = useState<File | null>(null);
  const [cropImagePreview, setCropImagePreview] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  // Forecast state
  const [forecastCrop, setForecastCrop] = useState('Rice');
  const [forecastPrice, setForecastPrice] = useState<number | null>(null);
  const [forecastTrend, setForecastTrend] = useState<string>('');
  const [forecastLoading, setForecastLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await apiService.getFarmerDashboardData(user.id);
      setCrops(data.crops);
      setAgreements(data.agreements);
    } catch (error) {
      console.error("Failed to fetch farmer dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch forecast when crop changes
  useEffect(() => {
    const fetchForecast = async () => {
      setForecastLoading(true);
      try {
        const data = await apiService.getPriceForecast(forecastCrop);
        setForecastPrice(data.forecast);
        setForecastTrend(data.trend || 'stable');
      } catch (e) {
        console.error("Forecast failed", e);
      } finally {
        setForecastLoading(false);
      }
    };
    fetchForecast();
  }, [forecastCrop]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCropImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSellCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Optional image upload - we use static map if missing, but let's allow it if user wants
    // But per user request "Do NOT depend on uploaded images", so we rely on what the backend stores
    // or what we map in frontend. We still send it if provided.

    setFormMessage({ type: '', text: '' });

    try {
      let imageUrl = '';
      if (cropImageFile) {
        imageUrl = await fileToBase64(cropImageFile);
      }

      await apiService.sellCrop({
        farmerId: user.id,
        cropName,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        location,
        imageUrl,
      });
      setFormMessage({ type: 'success', text: 'Crop listed successfully!' });
      // Reset form
      setCropName('');
      setQuantity('');
      setPrice('');
      setLocation('');
      setCropImageFile(null);
      setCropImagePreview(null);
      fetchData();
    } catch (error) {
      setFormMessage({ type: 'error', text: 'Failed to list crop. Please try again.' });
      console.error(error);
    }
  };

  const handleAgreementAction = async (agreementId: string, status: 'accepted' | 'rejected') => {
    try {
      await apiService.updateAgreementStatus(agreementId, status);
      fetchData();
    } catch (error) {
      console.error("Failed to update agreement", error);
    }
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  if (loading) return <Layout title="Dashboard"><div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div></Layout>;

  return (
    <Layout title="Farmer Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Sell Form & Forecast */}
        <div className="lg:col-span-4 space-y-8">

          {/* Price Forecast Section - NEW */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2 mb-4">
              <PresentationChartLineIcon className="w-6 h-6 text-green-700 dark:text-green-400" />
              <h3 className="text-lg font-bold text-green-800 dark:text-green-300">Price Forecast</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Select Crop</label>
                <select
                  value={forecastCrop}
                  onChange={(e) => setForecastCrop(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md bg-white dark:bg-gray-800"
                >
                  {['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Tomato'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm text-center">
                {forecastLoading ? (
                  <p className="text-sm text-gray-500">Calculating AI prediction...</p>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Predicted Price (Next 30 Days)</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                      ₹{forecastPrice ? forecastPrice.toFixed(0) : '--'}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${forecastTrend === 'increasing' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {forecastTrend === 'increasing' ? 'Trending Up ↗' : 'Trending Down ↘'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </Card>

          <Card title="Sell a New Crop">
            <form onSubmit={handleSellCrop} className="space-y-4">
              <div>
                <label htmlFor="cropName" className={labelClasses}>Crop Name</label>
                <input type="text" id="cropName" placeholder="e.g., Rice, Tomato" value={cropName} onChange={e => setCropName(e.target.value)} required className={inputClasses} />
              </div>
              <div>
                <label htmlFor="quantity" className={labelClasses}>Quantity (kg)</label>
                <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} required className={inputClasses} />
              </div>
              <div>
                <label htmlFor="price" className={labelClasses}>Price (₹ per kg)</label>
                <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} required className={inputClasses} />
              </div>
              <div>
                <label htmlFor="location" className={labelClasses}>Location</label>
                <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} required className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Crop Image (Optional)</label>
                <div className="mt-1 flex items-center space-x-4">
                  <span className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 flex-shrink-0">
                    <img
                      src={cropImagePreview || getCropImage(cropName || 'default')}
                      alt="Crop preview"
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <label htmlFor="crop-image-upload" className="cursor-pointer text-sm text-blue-600 hover:text-blue-500">
                    Change
                  </label>
                  <input id="crop-image-upload" name="cropImage" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                </div>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all font-medium">List Crop</button>
              {formMessage.text && <p className={`text-sm text-center mt-2 ${formMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{formMessage.text}</p>}
            </form>
          </Card>

          <Card title="Market Overview">
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Your Active Listings</span>
                <span className="font-bold text-green-600 dark:text-green-400 text-2xl">{crops.length}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-600 dark:text-gray-400">Pending Requests</span>
                <span className="font-bold text-yellow-500 dark:text-yellow-400 text-2xl">{agreements.filter(a => a.status === 'pending').length}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Listings and Requests */}
        <div className="lg:col-span-8 space-y-8">
          <Card title="My Listed Crops">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Crop</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {crops.length > 0 ? crops.map(crop => (
                    <tr key={crop.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={getCropImage(crop.cropName)}
                          alt={crop.cropName}
                          className="w-12 h-12 object-cover rounded-full border border-gray-200 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{crop.cropName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{crop.quantity} kg</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">₹{crop.price}/kg</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {typeof crop.location === 'object' ? (crop.location as any).address : crop.location}
                      </td>
                    </tr>
                  )) : <tr><td colSpan={5} className="text-center py-4 text-gray-500">No crops listed yet. Use the form to add one!</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Incoming Agreement Requests">
            <div className="space-y-4">
              {agreements.filter(a => a.status === 'pending').length > 0 ? agreements.filter(a => a.status === 'pending').map(agreement => (
                <div key={agreement.id} className="p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <UserCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{agreement.buyerName} wants {agreement.crop.cropName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {agreement.crop.quantity}kg • Terms: {agreement.buyerNotes || "Standard"}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleAgreementAction(agreement.id, 'accepted')} className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition-all shadow-sm">Accept</button>
                    <button onClick={() => handleAgreementAction(agreement.id, 'rejected')} className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-all shadow-sm">Reject</button>
                  </div>
                </div>
              )) : <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/20 rounded-lg"><p className="text-gray-500 dark:text-gray-400">No new agreement requests.</p></div>}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default FarmerDashboardPage;