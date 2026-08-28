import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './impact-teaser.module.css';

export function ImpactTeaser() {
  return (
    <section className={styles.teaser} aria-labelledby="impact-teaser-heading">
      <div className={styles.copy}>
        <span>BEYOND THE CODE</span>
        <h2 id="impact-teaser-heading">See how I turn business problems into working systems.</h2>
        <p>
          Impact Stories document the request, the real problem, the decision, the build and the evidence — including the moments when the right recommendation was not more software.
        </p>
      </div>
      <Link href="/impact">
        Explore Impact Stories <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  );
}
