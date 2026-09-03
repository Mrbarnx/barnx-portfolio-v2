import type { Metadata } from 'next';
import { ImpactArchive } from './ImpactArchive';
import styles from './impact.module.css';

export const metadata: Metadata = {
  title: 'Impact Stories',
  description: 'How Barnabas Mikel investigates business problems, chooses the right technical response and documents the evidence behind the work.',
  alternates: { canonical: '/impact' },
  openGraph: {
    title: 'Impact Stories — Barnx',
    description: 'Problem, decision, system and evidence — documented without fabricated outcomes.',
    url: '/impact',
  },
};

export default function ImpactPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span>PROBLEM → DECISION → SYSTEM → EVIDENCE</span>
        <h1>Real problems. Thoughtful systems. Verifiable outcomes.</h1>
        <p>
          A closer look at how I investigate business problems, choose the right technical response and document the proof behind the work.
        </p>
      </section>

      <section className={styles.archive}>
        <div className={styles.sectionIntro}>
          <span>IMPACT STORIES</span>
          <h2>Business context before technology.</h2>
          <p>Each published story will separate the problem, the decision, the system and the evidence instead of treating a tech stack as the outcome.</p>
        </div>
        <ImpactArchive />
      </section>
    </main>
  );
}
