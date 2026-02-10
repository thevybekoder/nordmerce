import { Template } from './types';

// Updated templates with specific "output-like" thumbnails
export const TEMPLATES: Template[] = [
  {
    id: 't1',
    title: 'Studio White Minimal',
    description: 'Clean, high-key studio lighting on a seamless white background. Perfect for catalogs.',
    // Showing a clean product result
    thumbnail: '/images/headphones_after.png', 
    promptModifier: 'Place the product on a clean white infinite background. Soft, diffused studio lighting. High key photography. Minimalist composition. 4k resolution, sharp focus.'
  },
  {
    id: 't2',
    title: 'Nordic Interior',
    description: 'Warm, sunlit interior with wooden textures and soft shadows.',
    // Showing a warm interior product shot
    thumbnail: '/images/bottle_after.png',
    promptModifier: 'Place the product on a light oak wooden table in a sunlit scandinavian living room. Soft morning light casting gentle shadows. Blurry background. Cozy atmosphere.'
  },
  {
    id: 't3',
    title: 'Dark Mode',
    description: 'Dramatic, moody lighting on dark slate or charcoal textures.',
    // Showing a dark elegant shot
    thumbnail: '/images/headphones.png',
    promptModifier: 'Place the product on a dark slate stone surface. Dramatic moody lighting, rim light highlighting the edges. Dark grey background. Premium, elegant feel.'
  },
  {
    id: 't4',
    title: 'Nature Outdoor',
    description: 'Natural daylight, stone or organic surfaces, blurred greenery.',
    // Showing a nature product shot
    thumbnail: '/images/bottle.png',
    promptModifier: 'Place the product on a natural rock surface outdoors. Natural daylight. Blurred forest greenery in the background. Fresh, organic, sustainable vibe.'
  },
  {
    id: 't5',
    title: 'Marble Podium',
    description: 'Elevated luxury on a white carrera marble podium.',
    // Showing a marble podium shot
    thumbnail: '/images/lamp_after.png',
    promptModifier: 'Place the product on a white marble geometric podium. Soft luxury studio lighting. Pastel backdrop. Elegant and high-end aesthetic.'
  },
  {
    id: 't6',
    title: 'Industrial Concrete',
    description: 'Raw concrete textures with harsh shadows.',
    // Showing an industrial shot
    thumbnail: '/images/lamp.png',
    promptModifier: 'Place the product on a raw concrete surface. Hard light casting sharp shadows. Industrial loft background. Modern and edgy style.'
  }
];

export const MOCK_PRODUCTS = [
  {
    id: 'p1',
    name: 'Ceramic Vase 01',
    sku: 'VAS-001',
    imageUrl: 'https://picsum.photos/id/112/500/500'
  },
  {
    id: 'p2',
    name: 'Leather Tote',
    sku: 'BAG-992',
    imageUrl: 'https://picsum.photos/id/113/500/500'
  }
];