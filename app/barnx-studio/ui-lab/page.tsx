import Link from 'next/link';
import { CategoryResourceGrid } from '../CategoryResourceGrid';
import { getPublishedStudioResourcesForCategory } from '@/lib/cms/publicStudio';

export const metadata = { title: 'Barnx UI Lab | Barnx Studio' };
export const dynamic = 'force-dynamic';

export default async function UiLabPage() {
  const resources = await getPublishedStudioResourcesForCategory('ui-lab');

  return <main className="page resourceDetail">
    <Link className="back" href="/barnx-studio">← Barnx Studio</Link>
    <section className="resourceHero">
      <div className="resourceIcon huge">◫</div>
      <span className="eyebrow">BARNX UI LAB · FREE</span>
      <h1>Interfaces you can watch, understand and rebuild.</h1>
      <p>Website, app and interface demos will live here with a short explanation, build prompt and practical tutorial instead of a public repository or preview link.</p>
    </section>
    {resources.length
      ? <CategoryResourceGrid resources={resources} eyebrow="UI LAB" title="Published interface resources." />
      : <section className="caseSection"><span className="eyebrow">COMING NEXT</span><h2>Demo → Prompt → Guide → Build your own.</h2><p>This category is ready for the websites, apps, UI experiments and reusable interface concepts you want to share next.</p></section>}
    <section className="nextCase"><p>UI Lab resources will be added as you publish them.</p><Link href="/barnx-studio">Barnx Studio →</Link></section>
  </main>;
}
