export interface Product {
  id: string;
  user_id?: string;
  name: string;
  sku: string;
  imageUrl: string; // Base64 or Object URL
  base64Data?: string; // Pure base64 data for API (optional, used transiently)
  mimeType?: string;
  created_at?: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  promptModifier: string;
}

export interface GeneratedImage {
  id: string;
  user_id?: string;
  productId: string; // references product_id in DB
  templateId: string; // references template_id in DB
  imageUrl: string;
  createdAt: number | string; // DB uses timestamptz string
  resolution: '1K' | '2K' | '4K';
}

export type ViewState = 'landing' | 'dashboard' | 'features' | 'pricing' | 'resources' | 'privacy' | 'terms' | 'auth' | 'contact';
export type DashboardTab = 'upload' | 'generate' | 'gallery' | 'settings';

export interface User {
  id: string;
  name: string;
  role: 'owner' | 'member';
  credits: number;
}