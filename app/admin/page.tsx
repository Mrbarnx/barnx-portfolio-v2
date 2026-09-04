import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BookOpen, FolderKanban, Gauge, Images, LogOut, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { signOut } from './actions';
import styles from './admin.module.css';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

const dashboardItems = [
  { label: 'Projects', description: 'Create, edit and publish portfolio projects.', icon: FolderKanban },
  { label: 'Impact Stories', description: 'Prepare evidence-led stories before publishing.', icon: Gauge },
  { label: 'Studio Resources', description: 'Manage guides, prompts and reusable assets.', icon: Sparkles },
  { label: 'Learning Paths', description: 'Organize modules, lessons and downloads.', icon: BookOpen },
  { label: 'Media Library', description: 'Media uploads arrive in the next CMS phase.', icon: Images },
];

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: isAdmin, error } = await supabase.rpc('is_cms_admin');
  if (error || !isAdmin) redirect('/admin/login');

  return (
    <main className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <div>
          <p className={styles.eyebrow}>Content management</p>
          <h1>Barnx Admin</h1>
          <p className={styles.muted}>The secure publishing workspace is ready for the Projects CMS.</p>
        </div>
        <form action={signOut}>
          <button className={styles.signOut} type="submit"><LogOut /> Sign out</button>
        </form>
      </header>

      <section className={styles.statusPanel} aria-label="Admin status">
        <span className={styles.statusDot} aria-hidden="true" />
        <div><strong>Admin access verified</strong><p>Supabase Auth and the database allowlist protect this route.</p></div>
      </section>

      <section className={styles.adminGrid} aria-label="Content areas">
        {dashboardItems.map(({ label, description, icon: Icon }) => (
          <article className={styles.adminCard} key={label}>
            <Icon aria-hidden="true" />
            <h2>{label}</h2>
            <p>{description}</p>
            <span>Coming in the next build phase</span>
          </article>
        ))}
      </section>
    </main>
  );
}
