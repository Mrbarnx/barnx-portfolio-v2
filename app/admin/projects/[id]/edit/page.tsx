import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireCmsAdmin } from '@/lib/admin/requireCmsAdmin';
import type { ProjectRow } from '@/lib/admin/projects';
import { ArchiveProjectButton } from '../../ArchiveProjectButton';
import { ProjectForm } from '../../ProjectForm';
import styles from '../../projects.module.css';

export const metadata: Metadata = { title: 'Edit Project | Barnx Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> };

export default async function EditProjectPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { saved } = await searchParams;
  const { supabase } = await requireCmsAdmin();
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
  if (error || !data) notFound();
  const project = data as ProjectRow;

  return (
    <main className={styles.projectsPage}>
      <header className={styles.formPageHeader}>
        <Link className={styles.backLink} href="/admin/projects"><ArrowLeft /> All projects</Link>
        <p className={styles.eyebrow}>Edit CMS entry</p>
        <div className={styles.editTitleRow}><div><h1>{project.title}</h1><p>Update the project content, status and links.</p></div><ArchiveProjectButton id={project.id} /></div>
      </header>
      {saved ? <p className={styles.notice} role="status">Saved successfully as {saved === 'published' ? 'published' : 'a draft'}.</p> : null}
      <ProjectForm project={project} />
    </main>
  );
}
