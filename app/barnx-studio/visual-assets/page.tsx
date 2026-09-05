import Link from 'next/link';
import { CategoryResourceGrid } from '../CategoryResourceGrid';
import { getPublishedStudioResourcesForCategory } from '@/lib/cms/publicStudio';

export const metadata = { title: 'Visual Assets | Barnx Studio' };
export const dynamic = 'force-dynamic';

export default async function VisualAssetsPage() {
  const resources = await getPublishedStudioResourcesForCategory('visual-assets');

  return <main className="page resourceDetail">
    <Link className="back" href="/barnx-studio">← Barnx Studio</Link>
    <section className="resourceHero">
      <div className="resourceIcon huge">◇</div>
      <span className="eyebrow">VISUAL ASSETS · FREE</span>
      <h1>Reusable visuals for modern interfaces.</h1>
      <p>A growing collection for 3D objects, motion assets and design resources, each with a short explanation and usage guidance.</p>
    </section>
    {resources.length
      ? <CategoryResourceGrid resources={resources} eyebrow="VISUAL ASSETS" title="Published visual resources." />
      : <section className="caseSection"><span className="eyebrow">COMING NEXT</span><h2>3D, motion and design assets.</h2><p>This category is ready for the visual resources you want developers and designers to download and reuse later.</p></section>}
    <section className="nextCase"><p>Visual assets will be added as you publish them.</p><Link href="/barnx-studio">Barnx Studio →</Link></section>
  </main>;
}
