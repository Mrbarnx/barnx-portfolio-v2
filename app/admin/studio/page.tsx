import Link from 'next/link';
import { requireCmsAdmin } from '@/lib/admin/requireCmsAdmin';
import {
  importCurrentPrompts,
  importCurrentStudioCategories,
  importCurrentStudioResources,
} from '../content-actions';
import styles from '../content.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Studio CMS | Barnx Admin', robots: { index: false, follow: false } };

type Query = { error?: string; import?: string };

export default async function StudioAdminPage({ searchParams }: { searchParams: Promise<Query> }) {
  const { supabase } = await requireCmsAdmin();
  const [{ data: categories, error: categoryError }, { data: resources }, { data: prompts }] = await Promise.all([
    supabase.from('studio_categories').select('id,slug,title,label,access_type,published,updated_at').order('sort_order'),
    supabase.from('studio_resources').select('id,slug,title,resource_type,published,updated_at').order('updated_at', { ascending: false }),
    supabase.from('prompt_resources').select('id,slug,title,category,published,updated_at').order('updated_at', { ascending: false }),
  ]);
  const query = await searchParams;

  return <main className={styles.page}><div className={styles.wrap}>
    <Link className={styles.back} href="/admin">← Admin home</Link>
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>Phase 6</p><h1>Studio CMS</h1><p>Manage public categories and the resources placed inside them.</p></div>
      <div className={styles.actions}>
        <Link className={styles.secondary} href="/admin/studio/categories/new">Add category</Link>
        <Link className={styles.secondary} href="/admin/studio/prompts/new">Add prompt</Link>
        <Link className={styles.button} href="/admin/studio/resources/new">Add resource</Link>
      </div>
    </header>

    {categoryError ? <p className={styles.error}>Category management needs the new Studio Categories migration.</p> : null}
    {query.error || query.import === 'failed' ? <p className={styles.error}>The item could not be saved or imported.</p> : null}
    {query.import === 'prompt-files' ? <p className={styles.error}>The prompt source files were unavailable in the deployment. The importer has now been corrected.</p> : null}
    {query.import === 'category-migration' ? <p className={styles.error}>Run the Studio Categories migration before importing categories.</p> : null}
    {query.import === 'categories' ? <p className={styles.notice}>Current Studio categories imported and existing resources assigned.</p> : null}
    {query.import === 'resources' ? <p className={styles.notice}>Current Studio resources imported successfully.</p> : null}
    {query.import === 'prompts' ? <p className={styles.notice}>Current prompts imported successfully.</p> : null}
    {query.import === 'unchanged' ? <p className={styles.notice}>Everything in that section is already imported.</p> : null}

    <div className={styles.tabs}>
      <a href="#categories">Categories ({categories?.length || 0})</a>
      <a href="#resources">Resources ({resources?.length || 0})</a>
      <a href="#prompts">Prompts ({prompts?.length || 0})</a>
      <Link href="/admin/learning-paths">Learning paths</Link>
    </div>

    <section id="categories">
      <div className={styles.header}><div><h2>Studio categories</h2><p>The top-level cards shown in your reference.</p></div>{!categories?.length && !categoryError ? <form action={importCurrentStudioCategories}><button className={styles.secondary}>Import current categories</button></form> : null}</div>
      <div className={styles.grid}>{categories?.map(item => <article className={styles.card} key={item.id}>
        <div className={styles.badges}><span className={item.published ? styles.live : ''}>{item.published ? 'Published' : 'Draft'}</span><span>{item.access_type}</span></div>
        <h3>{item.title}</h3><p>{item.label}</p><small>/{item.slug}</small>
        <div className={styles.actions}><Link className={styles.secondary} href={`/admin/studio/categories/${item.id}`}>Edit category</Link></div>
      </article>)}</div>
      {!categories?.length && !categoryError ? <p className={styles.empty}>Import the seven current category cards once, or add a new category.</p> : null}
    </section>

    <section id="resources" style={{ marginTop: 36 }}>
      <div className={styles.header}><div><h2>Studio resources</h2><p>Individual downloads, components, workflows and templates.</p></div>{!resources?.length ? <form action={importCurrentStudioResources}><button className={styles.secondary}>Import current resources</button></form> : null}</div>
      <div className={styles.grid}>{resources?.map(item => <article className={styles.card} key={item.id}>
        <div className={styles.badges}><span className={item.published ? styles.live : ''}>{item.published ? 'Published' : 'Draft'}</span><span>{item.resource_type.replaceAll('_', ' ')}</span></div>
        <h3>{item.title}</h3><small>/{item.slug}</small>
        <div className={styles.actions}><Link className={styles.secondary} href={`/admin/studio/resources/${item.id}`}>Edit resource</Link></div>
      </article>)}</div>
    </section>

    <section id="prompts" style={{ marginTop: 36 }}>
      <div className={styles.header}><div><h2>Prompt library</h2><p>Full copy-ready prompt entries inside the Prompt Library category.</p></div>{!prompts?.length ? <form action={importCurrentPrompts}><button className={styles.secondary}>Import current prompts</button></form> : null}</div>
      <div className={styles.grid}>{prompts?.map(item => <article className={styles.card} key={item.id}>
        <div className={styles.badges}><span className={item.published ? styles.live : ''}>{item.published ? 'Published' : 'Draft'}</span><span>{item.category}</span></div>
        <h3>{item.title}</h3><small>/{item.slug}</small>
        <div className={styles.actions}><Link className={styles.secondary} href={`/admin/studio/prompts/${item.id}`}>Edit prompt</Link></div>
      </article>)}</div>
    </section>
  </div></main>;
}
