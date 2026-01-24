import { User, UserRole, Crop, Agreement, FarmerRecommendation, PriceDataPoint } from '../types';

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
      return [];
    }
  },

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
  },
};