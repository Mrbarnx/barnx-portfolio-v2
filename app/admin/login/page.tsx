import type { Metadata } from 'next';
import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
import { LoginForm } from './LoginForm';
import styles from '../admin.module.css';

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className={styles.adminPage}>
      <section className={styles.loginCard} aria-labelledby="admin-login-title">
        <Link href="/" className={styles.wordmark}>Barnx</Link>
        <div className={styles.lockIcon} aria-hidden="true"><LockKeyhole /></div>
        <p className={styles.eyebrow}>Private workspace</p>
        <h1 id="admin-login-title">Barnx Admin</h1>
        <p className={styles.muted}>Sign in with the authorized owner account to manage portfolio content.</p>
        <LoginForm />
        <Link href="/" className={styles.backLink}>← Back to portfolio</Link>
      </section>
    </main>
  );
}
