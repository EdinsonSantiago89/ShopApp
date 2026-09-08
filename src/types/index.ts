export interface Company {
  id?: string;
  name: string;
  nit: string;
  phone: string;
  email: string;
  address: string;
  businessType: 'retail' | 'restaurant' | 'services';
  subscription: {
    plan: 'demo' | 'basic' | 'pro' | 'annual';
    status: 'active' | 'trial' | 'past_due' | 'expired';
    expiresAt: string;
  };
  createdAt: string;
}

export interface Product {
  id?: string;
  companyId: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id?: string;
  companyId: string;
  userId: string;
  items: SaleItem[];
  total: number;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'cashier';
  companyId: string;
  createdAt: string;
}