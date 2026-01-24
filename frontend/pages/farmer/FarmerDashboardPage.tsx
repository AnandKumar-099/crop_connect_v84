import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import { apiService } from '../../services/apiService';
import { Crop, Agreement } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const FarmerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);

  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [cropImageFile, setCropImageFile] = useState<File | null>(null);
  const [cropImagePreview, setCropImagePreview] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

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
    if (!cropImageFile) {
      setFormMessage({ type: 'error', text: 'Please upload a crop image.' });
      return;
    }
    setFormMessage({ type: '', text: '' });

    try {
      const imageUrl = await fileToBase64(cropImageFile);
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

  if (loading) return <Layout title="Dashboard"><div className="text-center">Loading...</div></Layout>;

  return (
    <Layout title="Farmer Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card title="Sell a New Crop">
            <form onSubmit={handleSellCrop} className="space-y-4">
              <div>
                <label htmlFor="cropName" className={labelClasses}>Crop Name</label>
                <input type="text" id="cropName" value={cropName} onChange={e => setCropName(e.target.value)} required className={inputClasses} />
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
                <label className={labelClasses}>Crop Image</label>
                <div className="mt-1 flex items-center space-x-4">
                  <span className="h-20 w-20 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 border dark:border-gray-600">
                    {cropImagePreview ? (
                      <img src={cropImagePreview} alt="Crop preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">No Image</div>
                    )}
                  </span>
                  <label htmlFor="crop-image-upload" className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Upload Image
                  </label>
                  <input id="crop-image-upload" name="cropImage" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" required />
                </div>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all">List Crop</button>
              {formMessage.text && <p className={`text-sm text-center mt-2 ${formMessage.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{formMessage.text}</p>}
            </form>
          </Card>
          <Card title="Market Overview">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Your Active Listings</span>
                <span className="font-bold text-green-600 dark:text-green-400 text-2xl">{crops.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Pending Requests</span>
                <span className="font-bold text-yellow-500 dark:text-yellow-400 text-2xl">{agreements.filter(a => a.status === 'pending').length}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
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
                    <tr key={crop.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img src={crop.imageUrl} alt={crop.cropName} className="w-16 h-16 object-cover rounded-md" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{crop.cropName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{crop.quantity} kg</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">₹{crop.price}/kg</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {typeof crop.location === 'object' ? (crop.location as any).address : crop.location}
                      </td>
                    </tr>
                  )) : <tr><td colSpan={5} className="text-center py-4">No crops listed yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
          <Card title="Incoming Agreement Requests">
            <div className="space-y-4">
              {agreements.filter(a => a.status === 'pending').length > 0 ? agreements.filter(a => a.status === 'pending').map(agreement => (
                <div key={agreement.id} className="p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                  <div>
                    <p className="font-semibold">{agreement.crop.cropName} - {agreement.crop.quantity}kg</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">From: {agreement.buyerName}</p>
                  </div>
                  <div className="space-x-2">
                    <button onClick={() => handleAgreementAction(agreement.id, 'accepted')} className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-all">Accept</button>
                    <button onClick={() => handleAgreementAction(agreement.id, 'rejected')} className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-all">Reject</button>
                  </div>
                </div>
              )) : <p className="text-center text-gray-500 dark:text-gray-400">No new agreement requests.</p>}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default FarmerDashboardPage;