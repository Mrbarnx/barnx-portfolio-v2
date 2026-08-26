import styles from './extra-resource.module.css';

const guideUrl='https://barnx-portfolio-v2.vercel.app/downloads/docker-practical-guide-node-postgresql-interview-prep.docx';
const previewUrl=`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(guideUrl)}`;

export default function DockerFundamentalsLayout({children}:{children:React.ReactNode}){
  return <>
    <div className={styles.wrap} id="extra-guide">
      <section className={styles.card} aria-label="Extra Docker learning resource">
        <div>
          <div className={styles.meta}><span>Extra Learning Resource</span><span>26-page reference</span><span>Free</span></div>
          <h2>Docker Practical Guide — Node.js + PostgreSQL & Interview Prep</h2>
          <p>A deeper reference for the learning path with Docker commands explained in plain English, Docker Compose, PostgreSQL, volumes, networks, debugging, the Docker Student API project, interview preparation and the skills you can honestly list.</p>
        </div>
        <div className={styles.actions}>
          <a className={styles.repo} href={previewUrl} target="_blank" rel="noreferrer">Preview guide ↗</a>
          <a className={styles.download} href="/downloads/docker-practical-guide-node-postgresql-interview-prep.docx" download>Download guide .docx ↓</a>
          <a className={styles.repo} href="https://github.com/Mrbarnx/docker-student-api" target="_blank" rel="noreferrer">Practice repo ↗</a>
        </div>
      </section>
    </div>
    {children}
  </>;
}
