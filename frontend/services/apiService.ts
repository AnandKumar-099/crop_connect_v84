import { User, UserRole, Crop, Agreement, FarmerRecommendation, PriceDataPoint } from '../types';

<<<<<<< HEAD
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
=======
// Backend API base URL
const API_BASE_URL = 'http://localhost:5001/api';

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Helper function to save auth tokens
const saveAuthTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

// Helper function to get absolute image URL
const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('data:')) return url;
  // Use port 5001 for backend images
  return `http://localhost:5001${url.startsWith('/') ? '' : '/'}${url}`;
};

// Helper function to clear auth tokens
const clearAuthTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

interface RegisterParams {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  profileImageUrl?: string;
  farmDetails?: { farmName: string; address: string; sizeInAcres: number };
}

export const apiService = {
  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Save tokens and user data
      saveAuthTokens(data.data.accessToken, data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      return data.data.user;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },

  /**
   * Register new user
   */
  register: async (params: RegisterParams): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save tokens and user data
      saveAuthTokens(data.data.accessToken, data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      return data.data.user;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  },

  /**
   * Get farmer dashboard data
   */
  getFarmerDashboardData: async (farmerId: string) => {
    try {
      // Get farmer's crops
      const cropsResponse = await fetchWithAuth(`${API_BASE_URL}/crops/my-crops`);

      // Get farmer's orders
      const ordersResponse = await fetchWithAuth(`${API_BASE_URL}/orders/farmer-orders`);

      return {
        crops: (cropsResponse.data?.crops || []).map((crop: any) => ({
          ...crop,
          cropName: crop.name,
          imageUrl: getImageUrl(crop.images?.[0]) || '',
          location: typeof crop.location === 'object' ? crop.location.address : crop.location
        })),
        agreements: (ordersResponse.data?.orders || []).map((order: any) => ({
          ...order,
          crop: {
            ...order.crop,
            cropName: order.crop.name,
            imageUrl: getImageUrl(order.crop.images?.[0]) || ''
          }
        })),
      };
    } catch (error: any) {
      console.error('Failed to fetch farmer dashboard data', error);
      return { crops: [], agreements: [] };
    }
  },

  /**
   * Sell a crop (create crop listing)
   */
  sellCrop: async (cropData: Omit<Crop, 'id' | 'farmerName'>) => {
    try {
      const formData = new FormData();
      formData.append('name', cropData.cropName);
      formData.append('type', 'Other'); // Default type
      formData.append('quantity', cropData.quantity.toString());
      formData.append('unit', 'kg');
      formData.append('price', cropData.price.toString());
      formData.append('location[address]', cropData.location);

      // Handle image upload
      if (cropData.imageUrl && cropData.imageUrl.startsWith('data:')) {
        // Convert base64 to blob
        const response = await fetch(cropData.imageUrl);
        const blob = await response.blob();
        formData.append('images', blob, 'crop-image.jpg');
      }

      const token = getAuthToken();
      const apiResponse = await fetch(`${API_BASE_URL}/crops`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await apiResponse.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create crop listing');
      }

      return data.data.crop;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create crop listing');
    }
  },

  /**
   * Update agreement status
   */
  updateAgreementStatus: async (agreementId: string, status: 'accepted' | 'rejected') => {
    try {
      const endpoint = status === 'accepted' ? 'accept' : 'reject';
      const response = await fetchWithAuth(`${API_BASE_URL}/orders/${agreementId}/${endpoint}`, {
        method: 'PATCH',
      });

      return response.data?.order;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update agreement status');
    }
  },

  /**
   * Get buyer dashboard data
   */
  getBuyerDashboardData: async (buyerId: string) => {
    try {
      // Get buyer's orders
      const ordersResponse = await fetchWithAuth(`${API_BASE_URL}/orders/my-orders`);

      // Get recommendations (all available crops)
      const recommendations = await apiService.getBuyerRecommendations(buyerId);

      return {
        agreements: ordersResponse.data?.orders || [],
        recommendations: recommendations,
      };
    } catch (error: any) {
      console.error('Failed to fetch buyer dashboard data', error);
      return { agreements: [], recommendations: [] };
    }
  },

  /**
   * Create agreement (place order)
   */
  createAgreement: async (agreementData: {
    buyerId: string;
    farmerId: string;
    cropId: string;
    terms: string;
  }) => {
    try {
      // First, get the crop details to calculate quantity and price
      const cropResponse = await fetchWithAuth(`${API_BASE_URL}/crops/${agreementData.cropId}`);
      const crop = cropResponse.data?.crop;

      if (!crop) {
        throw new Error('Crop not found');
      }

      // Create order with default values
      const orderData = {
        cropId: agreementData.cropId,
        quantity: 10, // Default quantity
        deliveryAddress: 'Default Address', // Should be provided by buyer
        paymentMethod: 'cash',
        buyerNotes: agreementData.terms,
      };

      const response = await fetchWithAuth(`${API_BASE_URL}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      return response.data?.order;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create agreement');
    }
  },

  /**
   * Get agreements for user
   */
  getAgreements: async (userId: string, role: UserRole): Promise<Agreement[]> => {
    try {
      const endpoint = role === 'farmer' ? 'farmer-orders' : 'my-orders';
      const response = await fetchWithAuth(`${API_BASE_URL}/orders/${endpoint}`);

      return response.data?.orders || [];
    } catch (error: any) {
      console.error('Failed to fetch agreements', error);
>>>>>>> 3ed0358b8ff785f9044a74179d5f8514fd912bca
      return [];
    }
  },

<<<<<<< HEAD
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
=======
  /**
   * Get buyer recommendations
   */
  getBuyerRecommendations: async (buyerId: string): Promise<FarmerRecommendation[]> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/crops`);
      const crops = response.data?.crops || [];

      // Transform crops into recommendations format
      return crops.map((crop: any) => ({
        farmer: crop.farmerId,
        crop: {
          id: crop._id,
          farmerId: crop.farmerId._id,
          farmerName: crop.farmerId.name,
          cropName: crop.name,
          quantity: crop.quantity,
          price: crop.price,
          location: crop.location.address,
          imageUrl: getImageUrl(crop.images?.[0]) || '',
        },
        similarityScore: Math.random() * (0.95 - 0.75) + 0.75,
      }));
    } catch (error: any) {
      console.error('Failed to fetch recommendations', error);
      return [];
    }
  },

  /**
   * Get risk prediction
   */
  getRiskPrediction: async (params: {
    quantity: number;
    weatherRisk: boolean;
    pastDelays: boolean;
  }): Promise<{ riskProbability: number }> => {
    // Mock implementation for now
    let risk = 0.1;
    if (params.quantity > 5000) risk += 0.2;
    if (params.weatherRisk) risk += 0.3;
    if (params.pastDelays) risk += 0.25;
    return { riskProbability: Math.min(risk, 0.95) };
  },

  /**
   * Get price forecast
   */
  getPriceForecast: async (
    cropName: string
  ): Promise<{ history: PriceDataPoint[]; forecast: number }> => {
    // Mock implementation for now
    const basePrice = { Wheat: 20, Rice: 45, Corn: 18, Soybean: 40 }[
      cropName as keyof typeof Object
    ] || 30;
    const history: PriceDataPoint[] = Array.from({ length: 7 }, (_, i) => ({
      date: `Day ${i + 1}`,
      price: basePrice + Math.sin(i) * 2 + (Math.random() - 0.5) * 2,
    }));
    const forecast = history[history.length - 1].price + (Math.random() - 0.4);
    return { history, forecast };
>>>>>>> 3ed0358b8ff785f9044a74179d5f8514fd912bca
  },
};