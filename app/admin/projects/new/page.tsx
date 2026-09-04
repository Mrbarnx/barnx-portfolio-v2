import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requireCmsAdmin } from '@/lib/admin/requireCmsAdmin';
import type { MediaAsset } from '@/lib/admin/media';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { ProjectForm } from '../ProjectForm';
import styles from '../projects.module.css';

export const metadata: Metadata = { title: 'Add Project | Barnx Admin', robots: { index: false, follow: false } };

export default async function NewProjectPage() {
  const { supabase } = await requireCmsAdmin();
  const { data } = await supabase.from('media_assets').select('*').eq('is_public', true).order('created_at', { ascending: false });
  const { url } = getSupabaseConfig();
  return (
    <main className={styles.projectsPage}>
      <header className={styles.formPageHeader}>
        <Link className={styles.backLink} href="/admin/projects"><ArrowLeft /> All projects</Link>
        <p className={styles.eyebrow}>New CMS entry</p>
        <h1>Add project</h1>
        <p>Save it as a draft first, or publish it to the CMS database when the content is ready.</p>
      </header>
      <ProjectForm mediaAssets={(data ?? []) as MediaAsset[]} supabaseUrl={url} />
    </main>
  );
}
