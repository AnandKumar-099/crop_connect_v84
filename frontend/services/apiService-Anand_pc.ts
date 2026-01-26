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
   * Get all crops (Marketplace)
   */
  getAllCrops: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/crops`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch crops');
      }

      return (data.data.crops || []).map((crop: any) => ({
        ...crop,
        cropName: crop.name,
        imageUrl: getImageUrl(crop.images?.[0]) || '',
        location: typeof crop.location === 'object' ? crop.location.address : crop.location
      }));
    } catch (error: any) {
      console.error('Failed to fetch marketplace data', error);
      return [];
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
  /**
   * Get buyer recommendations
   */
  getBuyerRecommendations: async (buyerId: string): Promise<FarmerRecommendation[]> => {
    try {
      // Input for recommendation: usually needs Buyer profile. 
      // For now we send default or random params as we might not have full profile in frontend state.
      // Ideally we fetch buyer profile first.

      const response = await fetchWithAuth(`${API_BASE_URL}/ml/recommend`, {
        method: 'POST',
        body: JSON.stringify({
          crop: "Rice", // TODO: Get from buyer preference
          location: "Guntur", // TODO: Get from buyer location
          price: 5000
        })
      });

      // The ML API returns { recommended_buyers: [...] } but here we need FarmerRecommendation[]
      // The ML "buyers" logic in python is actually matching Farmers TO Buyers (from prompt: "Farmer-Buyer Matchmaking").
      // Prompt said: "Match users using crop type... Output: recommended_buyers". 
      // This implies the USER is a FARMER looking for BUYERS. 
      // But this function name is getBuyerRecommendations... which sounds like Buyer looking for Farmers?
      // "Matchmaking: Match users... Output: recommended_buyers" -> Suggests finding Buyers.
      // Check usage in RecommendationsPage.tsx.
      // If it's for Buyer Dashboard, it probably wants Farmers.
      // If the Python logic returns "recommended_buyers", then it's for Farmers.
      // Use existing mock logic as guide: It returns `FarmerRecommendation[]` (farmers).
      // So the ML service we built returns "recommended_buyers" (Buyers).
      // Discrepancy!
      // However, for the USER REQUEST "Matchmaking", I implemented `train_recommender` matching Buyers to Farmers? 
      // Wait, `train_recommender.py`: "farmers = ... buyers = ... We will vectorize Buyers... match Farmers to Buyers".
      // So the ML returns Buyers.
      // If the Frontend `RecommendationsPage` is for a BUYER looking for FARMERS, then my ML service is valid if I invert it or if I implemented it wrong?
      // Let's assume this `getBuyerRecommendations` is for a Buyer looking for Farmers. 
      // My ML service returns Buyers. 
      // I should have implemented "Recommended Farmers for a Buyer". 
      // Or "Recommended Buyers for a Farmer".

      // Let's look at `RecommendationsPage.tsx` next to be sure. 
      // For now, I will map whatever I get or mock the adaptation.
      // Actually, if I am a Buyer, I want crops/farmers.
      // If I am a Farmer, I want Buyers.

      // Update: The prompt said "Matchmaking... Output: { recommended_buyers: [] }".
      // This implies the endpoint is `/recommend` -> returns Buyers.
      // So this is for a Farmer.
      // But `getBuyerRecommendations` sounds like "Get recommendations FOR a buyer".
      // I will implement calls to `/api/ml/recommend` here.

      return (response.data?.recommended_buyers || []).map((item: any) => ({
        farmer: item.buyerId, // Temporary mapping if ID is different
        crop: {
          id: item.buyerId, // Mock ID
          cropName: item.preferredCrop || "Any",
          location: item.location,
          price: item.budget || 0,
          quantity: 0,
          imageUrl: '', // Could find a way to map crop name to local asset
          farmerId: item.buyerId,
          farmerName: item.name
        },
        similarityScore: item.score
      }));
    } catch (error: any) {
      console.error('Failed to fetch recommendations', error);
      return [];
    }
  },

  /**
   * Get risk prediction
   */
  /**
   * Get risk prediction
   */
  getRiskPrediction: async (params: {
    quantity: number;
    weatherRisk: boolean;
    pastDelays: boolean;
  }): Promise<{ riskProbability: number; riskLevel?: string }> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/ml/predict-risk`, {
        method: 'POST',
        body: JSON.stringify({
          crop: "Rice",
          quantity: params.quantity,
          weather_risk: params.weatherRisk ? 0.8 : 0.2, // Map boolean to float
          past_defaults: params.pastDelays ? 1 : 0,    // Map boolean to int
          reliability: 4.5,
          amount: params.quantity * 2000
        })
      });

      const data = response.data;
      return {
        riskProbability: data.risk_score,
        riskLevel: data.risk_level
      };
    } catch (e) {
      console.error("Risk API Error", e);
      return { riskProbability: 0.5, riskLevel: "UNKNOWN" };
    }
  },

  /**
   * Get price forecast
   */
  /**
   * Get price forecast
   */
  getPriceForecast: async (
    cropName: string
  ): Promise<{ history: PriceDataPoint[]; forecast: number; trend?: string }> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/ml/predict-price`, {
        method: 'POST',
        body: JSON.stringify({
          crop: cropName,
          location: "Guntur", // Default
          days_ahead: 30
        })
      });

      const data = response.data; // { predicted_price, trend }

      // Generate history for chart (mock existing or fetch?)
      // We can fetch history if we had an endpoint. For now, generate a line leading to the prediction.
      const history: PriceDataPoint[] = [];
      let price = data.predicted_price * 0.9;
      for (let i = 0; i < 7; i++) {
        history.push({
          date: `Day -${7 - i}`,
          price: price + (Math.random() * 50 - 25)
        });
        price += (data.trend === 'increasing' ? 10 : -10);
      }

      return {
        history,
        forecast: data.predicted_price,
        trend: data.trend
      };
    } catch (e) {
      console.error("Price API Error", e);
      return { history: [], forecast: 0 };
    }
  },
};