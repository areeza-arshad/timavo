export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  materials: string[];
  recommendedFor: ('fair' | 'medium' | 'dark')[];
  stock: number;           
  isSale: boolean;         
  isNewArrival: boolean;   
  sizes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: CartItem[];
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  paymentMethod: 'easypaisa' | 'bank_transfer';
  paymentStatus: 'pending' | 'advance_paid' | 'completed';
  transactionId?: string;
  paymentScreenshot?: string;
  referralCode?: string;
  commission?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
}

export interface Affiliate {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  socialLink?: string;
  referralCode: string;
  earnings: number;
  paidEarnings: number;
  totalSales: number;
  createdAt: Date;
}

export interface SkinTonePreference {
  tone: 'fair' | 'medium' | 'dark' | null;
}