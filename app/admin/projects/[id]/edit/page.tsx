import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireCmsAdmin } from '@/lib/admin/requireCmsAdmin';
import type { ProjectRow } from '@/lib/admin/projects';
import type { MediaAsset } from '@/lib/admin/media';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { ArchiveProjectButton } from '../../ArchiveProjectButton';
import { ProjectForm } from '../../ProjectForm';
import styles from '../../projects.module.css';

export const metadata: Metadata = { title: 'Edit Project | Barnx Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; restored?: string }> };

export default async function EditProjectPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { saved, restored } = await searchParams;
  const { supabase } = await requireCmsAdmin();
  const [{ data, error }, { data: mediaAssets }, { data: mediaLinks }, { data: privateDemo }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).maybeSingle(),
    supabase.from('media_assets').select('*').eq('is_public', true).order('created_at', { ascending: false }),
    supabase.from('project_media').select('media_id,usage,sort_order').eq('project_id', id).order('sort_order', { ascending: true }),
    supabase.from('project_private_demos').select('video_url').eq('project_id', id).maybeSingle(),
  ]);
  if (error || !data) notFound();
  const project = data as ProjectRow;
  const { url } = getSupabaseConfig();

  return (
    <main className={styles.projectsPage}>
      <header className={styles.formPageHeader}>
        <Link className={styles.backLink} href="/admin/projects"><ArrowLeft /> All projects</Link>
        <p className={styles.eyebrow}>Edit CMS entry</p>
        <div className={styles.editTitleRow}><div><h1>{project.title}</h1><p>Update the project content, status and links.</p></div><ArchiveProjectButton id={project.id} isArchived={project.status === 'archived'} /></div>
      </header>
      {saved ? <p className={styles.notice} role="status">Saved successfully as {saved === 'published' ? 'published' : 'a draft'}.</p> : null}
      {restored === 'true' ? <p className={styles.notice} role="status">Project restored as a draft. Review it, then use Save &amp; publish when ready.</p> : null}
      {restored === 'failed' ? <p className={styles.errorNotice} role="alert">The project could not be restored.</p> : null}
      <ProjectForm
        project={project}
        mediaAssets={(mediaAssets ?? []) as MediaAsset[]}
        currentCoverId={mediaLinks?.find((link) => link.usage === 'cover')?.media_id}
        currentGalleryIds={(mediaLinks ?? []).filter((link) => link.usage === 'screenshot').map((link) => link.media_id)}
        currentVideoPosterId={mediaLinks?.find((link) => link.usage === 'video')?.media_id}
        currentPrivateVideoUrl={privateDemo?.video_url ?? ''}
        supabaseUrl={url}
      />
    </main>
  );
}
