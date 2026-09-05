import Link from 'next/link';
import { CategoryResourceGrid } from '../CategoryResourceGrid';
import { getPublishedStudioResourcesForCategory } from '@/lib/cms/publicStudio';

export const metadata = { title: 'Automation Blueprints | Barnx Studio' };
export const dynamic = 'force-dynamic';

export default async function AutomationBlueprintsPage() {
  const blueprints = await getPublishedStudioResourcesForCategory('automation-blueprints', ['n8n-lead-follow-up']);

  return <main className="page resourceDetail">
    <Link className="back" href="/barnx-studio">← Barnx Studio</Link>
    <section className="resourceHero">
      <div className="resourceIcon huge">⚡</div>
      <span className="eyebrow">AUTOMATION BLUEPRINTS · FREE</span>
      <h1>Practical workflows you can learn from and adapt.</h1>
      <p>Simple automation blueprints with clear structure, use cases and implementation notes.</p>
    </section>
    <CategoryResourceGrid resources={blueprints} eyebrow="BLUEPRINTS" title="Start with a working structure." actionLabel="View blueprint →" />
    <section className="nextCase"><p>More automation blueprints will be added as the library grows.</p><Link href="/barnx-studio">Barnx Studio →</Link></section>
  </main>;
}
