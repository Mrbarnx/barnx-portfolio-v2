'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  publicImpactStories,
  impactVisibilityLabels,
  impactWorkTypeLabels,
  type ImpactWorkType,
} from '@/data/impact';
import styles from './impact.module.css';

const filters: Array<{ label: string; value: 'all' | ImpactWorkType }> = [
  { label: 'All', value: 'all' },
  { label: 'Client Work', value: 'client_work' },
  { label: 'Company Work', value: 'company_work' },
  { label: 'Independent Case Studies', value: 'independent_case_study' },
  { label: 'Open Source', value: 'open_source' },
  { label: 'Public Builds', value: 'public_build' },
];

export function ImpactArchive() {
  const [filter, setFilter] = useState<'all' | ImpactWorkType>('all');
  const stories = useMemo(
    () => (filter === 'all' ? publicImpactStories : publicImpactStories.filter((story) => story.workType === filter)),
    [filter],
  );

  return (
    <>
      <div className={styles.filters} aria-label="Filter impact stories">
        {filters.map((item) => (
          <button
            type="button"
            key={item.value}
            className={filter === item.value ? styles.activeFilter : ''}
            aria-pressed={filter === item.value}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {stories.length ? (
        <div className={styles.storyGrid}>
          {stories.map((story) => (
            <article className={styles.storyCard} key={story.slug}>
              <div className={styles.storyMeta}>
                <span>{impactWorkTypeLabels[story.workType]}</span>
                <span>{impactVisibilityLabels[story.visibility]}</span>
                <span>{story.status.replace('_', ' ')}</span>
              </div>
              <p className={styles.context}>{story.businessContext}</p>
              <h2>{story.title}</h2>
              <div className={styles.problemBlock}>
                <span>Real problem</span>
                <p>{story.discoveredProblem}</p>
              </div>
              <div className={styles.evidenceLine}>
                <span>Evidence</span>
                <strong>{story.evidence.filter((item) => item.approvedForPublic).length} public item(s)</strong>
              </div>
              <Link href={`/impact/${story.slug}`}>
                Read impact story <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <section className={styles.emptyState} aria-live="polite">
          <span>STORIES IN DOCUMENTATION</span>
          <h2>Proof first. Stories second.</h2>
          <p>
            I’m building this section around work I can explain and verify properly — the request, the real problem,
            the engineering decision, what was built and the evidence behind it. I won’t publish placeholder client
            histories just to fill the page.
          </p>
          <Link href="/projects">
            Explore current projects <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      )}
    </>
  );
}
