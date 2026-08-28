import { notFound } from 'next/navigation';
import Link from 'next/link';
import { publicImpactStories, impactVisibilityLabels, impactWorkTypeLabels } from '@/data/impact';
import styles from '../impact.module.css';

export function generateStaticParams() {
  return publicImpactStories.map((story) => ({ slug: story.slug }));
}

export default async function ImpactStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = publicImpactStories.find((item) => item.slug === slug);
  if (!story) notFound();

  const publicEvidence = story.evidence.filter((item) => item.approvedForPublic);

  return (
    <main className={styles.page}>
      <Link className={styles.back} href="/impact">← All impact stories</Link>
      <section className={styles.detailHero}>
        <div className={styles.storyMeta}>
          <span>{impactWorkTypeLabels[story.workType]}</span>
          <span>{impactVisibilityLabels[story.visibility]}</span>
          <span>{story.status.replace('_', ' ')}</span>
        </div>
        <h1>{story.title}</h1>
        <p>{story.summary}</p>
      </section>

      <section className={styles.detailGrid}>
        <article><span>01</span><h2>The original request</h2><p>{story.originalRequest}</p></article>
        <article><span>02</span><h2>Business context</h2><p>{story.businessContext}</p></article>
        <article><span>03</span><h2>The real problem</h2><p>{story.discoveredProblem}</p></article>
        <article><span>04</span><h2>Recommendation</h2><p>{story.recommendation}</p></article>
        <article><span>05</span><h2>What was built</h2><p>{story.solution}</p></article>
        <article><span>06</span><h2>Capability enabled</h2><p>{story.capabilityEnabled}</p></article>
      </section>

      {story.systemFlow?.length ? <section className={styles.detailSection}><span>SYSTEM FLOW</span><ol>{story.systemFlow.map((item) => <li key={item}>{item}</li>)}</ol></section> : null}
      {story.decisions?.length ? <section className={styles.detailSection}><span>ENGINEERING DECISIONS</span><ul>{story.decisions.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}

      <section className={styles.detailGrid}>
        <article><span>OUTCOME</span><h2>{story.outcomeEvidence.replace('_', ' ')}</h2><p>{story.outcome || 'No outcome claim is published beyond the capability this system enabled.'}</p></article>
        <article><span>TECHNOLOGY</span><h2>Tools used</h2><p>{story.technologies.join(' · ')}</p></article>
      </section>

      {publicEvidence.length ? (
        <section className={styles.detailSection}>
          <span>PROOF GALLERY</span>
          <div className={styles.evidenceGrid}>
            {publicEvidence.map((item) => (
              item.href ? <a key={`${item.type}-${item.label}`} href={item.href} target="_blank" rel="noreferrer">{item.label} ↗</a> : <div key={`${item.type}-${item.label}`}>{item.label}</div>
            ))}
          </div>
        </section>
      ) : null}

      {story.lessons?.length ? <section className={styles.detailSection}><span>WHAT I LEARNED</span><ul>{story.lessons.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
      {story.nextImprovements?.length ? <section className={styles.detailSection}><span>WHAT I WOULD IMPROVE NEXT</span><ul>{story.nextImprovements.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
    </main>
  );
}
