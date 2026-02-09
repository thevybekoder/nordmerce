export interface Product {
  id: string;
  name: string;
  sku: string;
  imageUrl: string; // Base64 or Object URL
  base64Data?: string; // Pure base64 data for API
  mimeType?: string;
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
  productId: string;
  templateId: string;
  imageUrl: string;
  createdAt: number;
  resolution: '1K' | '2K' | '4K';
}

export type ViewState = 'landing' | 'dashboard' | 'features' | 'pricing' | 'resources' | 'privacy' | 'terms';
export type DashboardTab = 'upload' | 'generate' | 'gallery' | 'settings';

export interface User {
  id: string;
  name: string;
  role: 'owner' | 'member';
  credits: number;
}