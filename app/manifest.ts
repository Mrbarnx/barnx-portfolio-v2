import type { MetadataRoute } from 'next';
import { site } from '@/data/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Barnx — Barnabas Mikel',
    short_name: 'Barnx',
    description: site.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
