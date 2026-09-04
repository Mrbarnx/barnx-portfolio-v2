import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, FilePlus2, Pencil, Upload } from 'lucide-react';
import { requireCmsAdmin } from '@/lib/admin/requireCmsAdmin';
import { statusLabel, type ProjectRow } from '@/lib/admin/projects';
import { importCurrentProjects, setProjectPublished } from './actions';
import styles from './projects.module.css';

export const metadata: Metadata = { title: 'Projects | Barnx Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function noticeFor(params: Record<string, string | string[] | undefined>) {
  if (params.created === 'published') return 'Project created and published in the CMS database.';
  if (params.created === 'draft') return 'Project saved as a CMS draft.';
  if (params.archived === 'true') return 'Project archived safely.';
  if (params.import === 'unchanged') return 'All current portfolio projects are already in the CMS. Nothing was overwritten.';
  if (params.import === 'failed') return 'The import could not be completed. No public-site content was changed.';
  if (params.import) return `${params.import} current project${params.import === '1' ? '' : 's'} imported without overwriting existing CMS records.`;
  if (params.visibility === 'published') return 'Project published in the CMS database.';
  if (params.visibility === 'draft') return 'Project unpublished and returned to draft.';
  if (params.visibility === 'failed') return 'The project visibility could not be changed.';
  return null;
}

export default async function AdminProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const { supabase } = await requireCmsAdmin();
  const params = await searchParams;
  const notice = noticeFor(params);
  const { data, error } = await supabase.from('projects').select('*').order('sort_order').order('created_at', { ascending: false });
  const projects = (data ?? []) as ProjectRow[];

  return (
    <main className={styles.projectsPage}>
      <header className={styles.pageHeader}>
        <div>
          <Link className={styles.backLink} href="/admin"><ArrowLeft /> Admin home</Link>
          <p className={styles.eyebrow}>Content management</p>
          <h1>Projects</h1>
          <p>Create, review and publish projects from one protected workspace.</p>
        </div>
        <Link className={styles.primaryButton} href="/admin/projects/new"><FilePlus2 /> Add project</Link>
      </header>

      <section className={styles.safetyNote}>
        <strong>Safe verification mode</strong>
        <p>The public portfolio still reads its original project file. Changes here affect only the CMS database until we deliberately connect it in a later step.</p>
      </section>

      {notice ? <p className={styles.notice} role="status">{notice}</p> : null}
      {error ? <p className={styles.errorNotice} role="alert">Projects could not be loaded from Supabase.</p> : null}

      {!error && projects.length === 0 ? (
        <section className={styles.emptyState}>
          <Upload aria-hidden="true" />
          <h2>Start with your current projects</h2>
          <p>This one-time import copies only missing projects into Supabase. Running it again will not replace anything you later edit here.</p>
          <form action={importCurrentProjects}><button className={styles.primaryButton} type="submit">Import current projects</button></form>
          <span>Or</span>
          <Link href="/admin/projects/new">Create a project manually</Link>
        </section>
      ) : null}

      {projects.length > 0 ? (
        <>
          <div className={styles.listToolbar}>
            <p><strong>{projects.length}</strong> project{projects.length === 1 ? '' : 's'} in CMS</p>
            <form action={importCurrentProjects}><button className={styles.textButton} type="submit">Import any missing current projects</button></form>
          </div>
          <section className={styles.projectList} aria-label="CMS projects">
            {projects.map((project) => (
              <article className={styles.projectCard} key={project.id}>
                <div className={styles.projectMain}>
                  <div className={styles.badges}>
                    <span className={project.published ? styles.publishedBadge : styles.draftBadge}>{project.published ? 'Published' : 'Draft'}</span>
                    <span>{statusLabel(project.status)}</span>
                    {project.featured ? <span>Featured</span> : null}
                  </div>
                  <h2>{project.title}</h2>
                  <p>{project.short_summary}</p>
                  <small>/{project.slug} · {project.category}</small>
                </div>
                <div className={styles.cardActions}>
                  <Link className={styles.editButton} href={`/admin/projects/${project.id}/edit`}><Pencil /> Edit</Link>
                  {project.live_url ? <a className={styles.iconButton} href={project.live_url} target="_blank" rel="noreferrer" aria-label={`Open ${project.title} live URL`}><ExternalLink /></a> : null}
                  {project.status === 'archived' ? <span className={styles.archivedText}>Edit to restore</span> : (
                    <form action={setProjectPublished}>
                      <input type="hidden" name="id" value={project.id} />
                      <input type="hidden" name="published" value={String(!project.published)} />
                      <button className={styles.textButton} type="submit">{project.published ? 'Unpublish' : 'Publish'}</button>
                    </form>
                  )}
                </div>
              </article>
            ))}
          </section>
        </>
      ) : null}
    </main>
  );
}
