import { User, UserRole, Crop, Agreement, FarmerRecommendation, PriceDataPoint } from '../types';

const API_URL = 'http://localhost:5000/api';
const ML_URL = 'http://localhost:8000';

// Helper to get auth headers with token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
};

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

// Map backend _id to frontend id
const mapUser = (u: any): User => {
  if (!u) return u;
  return {
    id: u._id || u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    profileImageUrl: u.profileImageUrl,
    farmDetails: u.farmDetails
  };
};

const getDefaultImage = (cropName: string) => {
  const name = (cropName || '').toLowerCase();
  if (name.includes('wheat')) return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80';
  if (name.includes('rice')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80';
  if (name.includes('corn') || name.includes('maize')) return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80';
  if (name.includes('soy')) return 'https://images.unsplash.com/photo-1599583160472-8924cb73df40?auto=format&fit=crop&w=800&q=80';
  if (name.includes('tomato')) return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80';
  if (name.includes('potato')) return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80';
  if (name.includes('sugar')) return 'https://images.unsplash.com/photo-1589134703310-467f3396c96b?auto=format&fit=crop&w=800&q=80';
  return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80'; // Generic farming image
};

const mapCrop = (c: any): Crop => {
  if (!c) return c;
  return {
    id: c._id || c.id,
    farmerId: c.farmerId?._id || c.farmerId || '', // Handle populated or unpopulated
    farmerName: c.farmerId?.name || '',
    cropName: c.name, // Backend uses 'name', frontend 'cropName'
    quantity: c.quantity,
    price: c.price,
    location: typeof c.location === 'object' ? (c.location?.city || c.location?.address || JSON.stringify(c.location)) : (c.location || ''), // Ensure string
    imageUrl: c.images && c.images.length > 0 ? `http://localhost:5000${c.images[0]}` : getDefaultImage(c.name),
  };
};

const mapAgreement = (a: any): Agreement => {
  // Backend 'Order' maps to Frontend 'Agreement'
  if (!a) return a;
  return {
    id: a._id || a.id,
    farmerId: a.farmerId?._id || a.farmerId,
    farmerName: a.farmerId?.name || '',
    buyerId: a.buyerId?._id || a.buyerId,
    buyerName: a.buyerId?.name || '',
    crop: mapCrop(a.cropId),
    status: a.status,
    terms: a.terms || 'Standard terms', // Backend order might not have terms field in same way
    createdAt: a.createdAt
  };
};

interface RegisterParams {
  name: string; email: string; password: string; role: UserRole; phone: string;
  profileImageUrl?: string;
  farmDetails?: { farmName: string; address: string; sizeInAcres: number; };
}

export const apiService = {
  login: async (email: string, password: string): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(res);
    localStorage.setItem('accessToken', data.data.accessToken);
    if (data.data.refreshToken) localStorage.setItem('refreshToken', data.data.refreshToken);
    return mapUser(data.data.user);
  },

  register: async (params: RegisterParams): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await handleResponse(res);
    localStorage.setItem('accessToken', data.data.accessToken);
    if (data.data.refreshToken) localStorage.setItem('refreshToken', data.data.refreshToken);
    return mapUser(data.data.user);
  },

  getFarmerDashboardData: async (farmerId: string) => {
    // Fetch my crops and my orders (agreements)
    // Note: getMyCrops uses token to identify farmer, so farmerId arg might be redundant if we just use token
    // But keeping signature compatible.

    // We need to fetch crops and orders.
    const [cropsRes, ordersRes] = await Promise.all([
      fetch(`${API_URL}/crops/my-crops`, { headers: getAuthHeaders() }),
      fetch(`${API_URL}/orders/farmer-orders`, { headers: getAuthHeaders() })
    ]);

    const cropsData = await handleResponse(cropsRes);
    const ordersData = await handleResponse(ordersRes);

    return {
      crops: cropsData.data.crops.map(mapCrop),
      agreements: ordersData.data.orders.map(mapAgreement) // Check if backend returns 'orders' in data
    };
  },

  sellCrop: async (cropData: Omit<Crop, 'id' | 'farmerName'>) => {
    // Current backend createCrop expects: 
    // name, quantity, price, location, description?, etc.
    // Frontend cropData has: cropName, quantity, price, location, imageUrl.

    // We need to transform frontend fields to backend fields
    const payload = {
      name: cropData.cropName,
      quantity: cropData.quantity,
      price: cropData.price,
      location: cropData.location,
      type: 'Grain', // Default or need to be added to frontend
      unit: 'kg',
      priceUnit: 'per kg',
      // imageUrl: cropData.imageUrl // Sending URL string if it's not a file upload
    };

    const res = await fetch(`${API_URL}/crops`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await handleResponse(res);
    return mapCrop(data.data.crop);
  },

  updateAgreementStatus: async (agreementId: string, status: 'accepted' | 'rejected') => {
    const res = await fetch(`${API_URL}/orders/${agreementId}/${status}`, {
      method: 'PATCH', // Backend uses PATCH /:id/accept or /:id/reject
      headers: getAuthHeaders()
    });
    const data = await handleResponse(res);
    return mapAgreement(data.data.order);
  },

  getBuyerDashboardData: async (buyerId: string) => {
    // Fetch my orders and recommendations
    const ordersRes = await fetch(`${API_URL}/orders/my-orders`, { headers: getAuthHeaders() });
    const ordersData = await handleResponse(ordersRes);

    const recommendations = await apiService.getBuyerRecommendations(buyerId);

    return {
      agreements: ordersData.data.orders.map(mapAgreement),
      recommendations
    };
  },

  createAgreement: async (agreementData: { buyerId: string; farmerId: string; cropId: string; terms: string; }) => {
    // Backend creates order
    // Backend createOrder expects: cropId, quantity. 
    // If frontend doesn't pass quantity, default to 1

    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        cropId: agreementData.cropId,
        quantity: 1, // Default
        terms: agreementData.terms
      })
    });
    const data = await handleResponse(res);
    return mapAgreement(data.data.order);
  },

  getAgreements: async (userId: string, role: UserRole): Promise<Agreement[]> => {
    let url = `${API_URL}/orders/my-orders`;
    if (role === 'farmer') {
      url = `${API_URL}/orders/farmer-orders`;
    }
    const res = await fetch(url, { headers: getAuthHeaders() });
    const data = await handleResponse(res);
    return data.data.orders.map(mapAgreement);
  },

  getBuyerRecommendations: async (buyerId: string): Promise<FarmerRecommendation[]> => {
    try {
      const res = await fetch(`${API_URL}/crops`, { headers: getAuthHeaders() });
      if (!res.ok) return [];
      const data = await handleResponse(res);
      return data.data.crops.map((c: any) => ({
        farmer: mapUser(c.farmerId),
        crop: mapCrop(c),
        similarityScore: 0.8 + Math.random() * 0.2
      }));
    } catch (e) {
      console.error("Failed to fetch recommendations", e);
      return [];
    }
  },

  getRiskPrediction: async (params: { quantity: number; weatherRisk: boolean; pastDelays: boolean; }): Promise<{ riskProbability: number }> => {
    try {
      const res = await fetch(`${ML_URL}/predict-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: params.quantity,
          weather_risk: params.weatherRisk ? 0.8 : 0.2,
          past_defaults: params.pastDelays ? 1 : 0
        })
      });
      const data = await res.json();
      return { riskProbability: data.risk_score || 0.1 };
    } catch (e) {
      console.error(e);
      return { riskProbability: 0.1 };
    }
  },

  getPriceForecast: async (cropName: string): Promise<{ history: PriceDataPoint[]; forecast: number; }> => {
    try {
      const res = await fetch(`${ML_URL}/predict-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop: cropName })
      });
      const data = await res.json();
      return {
        history: data.history || [], // Use backend returned history
        forecast: data.predicted_price || 0
      };
    } catch (e) {
      console.error(e);
      return { history: [], forecast: 0 };
    }
  },
};