import type { Metadata } from 'next';
import Link from 'next/link';
import { BarChart3, BookOpen, FolderKanban, Gauge, Images, LogOut, Settings, Sparkles } from 'lucide-react';
import { requireCmsAdmin } from '@/lib/admin/requireCmsAdmin';
import { signOut } from './actions';
import styles from './admin.module.css';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

const dashboardItems = [
  { label: 'Projects', description: 'Create, edit and publish portfolio projects.', icon: FolderKanban, href: '/admin/projects' },
  { label: 'Impact Stories', description: 'Prepare evidence-led stories before publishing.', icon: Gauge, href: '/admin/impact' },
  { label: 'Studio Resources', description: 'Manage guides, prompts and reusable assets.', icon: Sparkles, href: '/admin/studio' },
  { label: 'Learning Paths', description: 'Organize modules, lessons and downloads.', icon: BookOpen, href: '/admin/learning-paths' },
  { label: 'Media Library', description: 'Upload reusable project and content images.', icon: Images, href: '/admin/media' },
  { label: 'Analytics', description: 'Review anonymous visits, pages and useful actions.', icon: BarChart3, href: '/admin/analytics' },
  { label: 'Site Settings', description: 'Update public identity, links and SEO defaults.', icon: Settings, href: '/admin/settings' },
];

export default async function AdminPage() {
  await requireCmsAdmin();

  return (
    <main className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <div>
          <p className={styles.eyebrow}>Content management</p>
          <h1>Barnx Admin</h1>
          <p className={styles.muted}>Manage projects, Studio content, Impact stories, learning paths, analytics and public settings.</p>
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
        {dashboardItems.map(({ label, description, icon: Icon, href }) => {
          const content = <>
            <Icon aria-hidden="true" />
            <h2>{label}</h2>
            <p>{description}</p>
            <span>{href ? `Open ${label.toLowerCase()}` : 'Coming in a later build phase'}</span>
          </>;

          return href ? <Link className={`${styles.adminCard} ${styles.adminCardLink}`} href={href} key={label}>{content}</Link> : <article className={styles.adminCard} key={label}>{content}</article>;
        })}
      </section>
    </main>
  );
}
