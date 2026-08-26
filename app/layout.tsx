import type { Metadata } from 'next';
import './globals.css';
import './layout-repair.css';
import { SiteShell } from '@/components/SiteShell';
import { TechMarqueeEnhancer } from '@/components/TechMarqueeEnhancer';

export const metadata: Metadata = {
  metadataBase: new URL('https://barnx.dev'),
  title: { default: 'Barnx — Barnabas Mikel', template: '%s | Barnx' },
  description: 'Frontend-Focused Full-Stack Engineer building modern web applications while integrating AI-powered features and intelligent automations.',
  icons: { icon: '/favicon.svg' },
  openGraph: { title: 'Barnx — Barnabas Mikel', description: 'Frontend-focused product engineering, AI integrations and intelligent automations.', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><SiteShell>{children}</SiteShell><TechMarqueeEnhancer/></body></html>;
}
