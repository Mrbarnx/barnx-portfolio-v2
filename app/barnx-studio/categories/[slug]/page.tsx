import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CategoryResourceGrid } from '../../CategoryResourceGrid';
import {
  getPublishedStudioCategory,
  getPublishedStudioResourcesForCategory,
} from '@/lib/cms/publicStudio';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPublishedStudioCategory(slug);
  return category
    ? { title: `${category.title} | Barnx Studio`, description: category.short }
    : { title: 'Studio Category | Barnx Studio' };
}

export default async function StudioCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [category, resources] = await Promise.all([
    getPublishedStudioCategory(slug),
    getPublishedStudioResourcesForCategory(slug),
  ]);

  if (!category) notFound();

  return <main className="page resourceDetail">
    <Link className="back" href="/barnx-studio">← Barnx Studio</Link>
    <section className="resourceHero">
      <div className="resourceIcon huge">{category.icon}</div>
      <span className="eyebrow">{category.meta}</span>
      <h1>{category.title}</h1>
      <p>{category.short}</p>
    </section>
    {resources.length
      ? <CategoryResourceGrid resources={resources} eyebrow="RESOURCES" title={`Explore ${category.title}.`} />
      : <section className="caseSection"><span className="eyebrow">COMING NEXT</span><h2>This category is ready.</h2><p>Published resources assigned to this category will appear here automatically.</p></section>}
    <section className="nextCase"><p>Keep exploring</p><Link href="/barnx-studio">Browse Barnx Studio →</Link></section>
  </main>;
}
