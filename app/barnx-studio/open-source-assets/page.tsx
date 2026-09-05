import Link from 'next/link';
import { CategoryResourceGrid } from '../CategoryResourceGrid';
import { getPublishedStudioResourcesForCategory } from '@/lib/cms/publicStudio';

export const metadata = { title: 'Open Source Assets | Barnx Studio' };
export const dynamic = 'force-dynamic';

const fallbackSlugs = ['frontend-release-checklist', 'react-async-button', 'vue-resource-card'];

export default async function OpenSourceAssetsPage() {
  const assets = await getPublishedStudioResourcesForCategory('open-source-assets', fallbackSlugs);

  return <main className="page resourceDetail">
    <Link className="back" href="/barnx-studio">← Barnx Studio</Link>
    <section className="resourceHero">
      <div className="resourceIcon huge">⌘</div>
      <span className="eyebrow">OPEN SOURCE ASSETS · FREE</span>
      <h1>Reusable code and developer assets.</h1>
      <p>Small practical resources you can inspect, understand and adapt for your own projects.</p>
    </section>
    <CategoryResourceGrid resources={assets} eyebrow="ASSETS" title="Useful building blocks." actionLabel="View asset →" />
    <section className="nextCase"><p>More open-source assets will be added as the library grows.</p><Link href="/barnx-studio">Barnx Studio →</Link></section>
  </main>;
}
