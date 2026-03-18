export type UserRole = 'farmer' | 'buyer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  profileImageUrl?: string;
  farmDetails?: {
    farmName: string;
    address: string;
    sizeInAcres: number;
  };
}

export interface Crop {
  id:string;
  farmerId: string;
  farmerName: string;
  cropName: string;
  quantity: number; // in kgs
  price: number; // per kg
  location: string;
  imageUrl: string;
}

export type AgreementStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface Agreement {
  id: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  crop: Crop;
  status: AgreementStatus;
  terms: string;
  createdAt: string;
  riskScore?: number;
  riskLevel?: string;
}

export interface FarmerRecommendation {
  farmer: User;
  crop: Crop;
  similarityScore: number;
}

export interface PriceDataPoint {
  date: string;
  price: number;
}

export interface ChatMessage {
  _id?: string;
  id?: string;
  senderId: string | any;
  receiverId: string | any;
  content: string;
  isRead: boolean;
  createdAt: string;
}