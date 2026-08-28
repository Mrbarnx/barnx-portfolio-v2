import styles from './extra-resource.module.css';
import ExtraGuideRoadmapLink from './ExtraGuideRoadmapLink';

const guideUrl='/downloads/docker-practical-guide-node-postgresql-interview-prep-v2.pdf';

export default function DockerFundamentalsLayout({children}:{children:React.ReactNode}){
  return <>
    <ExtraGuideRoadmapLink/>
    <div className={styles.wrap} id="extra-guide">
      <section className={styles.card} aria-label="Extra Docker learning resource">
        <div>
          <div className={styles.meta}><span>Extra Learning Resource</span><span>26-page reference</span><span>Free</span></div>
          <h2>Docker Practical Guide — Node.js + PostgreSQL & Interview Prep</h2>
          <p>A deeper reference for the learning path with Docker commands explained in plain English, Docker Compose, PostgreSQL, volumes, networks, debugging, the Docker Student API project, interview preparation and the skills you can honestly list.</p>
        </div>
        <div className={styles.actions}>
          <a className={styles.repo} href={guideUrl} target="_blank" rel="noreferrer">Preview guide ↗</a>
          <a className={styles.download} href={guideUrl} download>Download guide .pdf ↓</a>
          <a className={styles.repo} href="https://github.com/Mrbarnx/docker-student-api" target="_blank" rel="noreferrer">Practice repo ↗</a>
        </div>
      </section>
    </div>
    {children}
  </>;
}
