import Link from 'next/link';
import { getPublishedLearningPaths } from '@/lib/cms/publicStudio';

export const metadata={title:'Learning Paths | Barnx Studio'};

export const dynamic = 'force-dynamic';

export default async function LearningPathsPage(){const paths=await getPublishedLearningPaths();return <main className="page resourceDetail">
  <Link className="back" href="/barnx-studio">← Barnx Studio</Link>
  <section className="resourceHero">
    <div className="resourceIcon huge">↗</div>
    <span className="eyebrow">LEARNING PATHS · FREE</span>
    <h1>Learn in a clear order.</h1>
    <p>Curated resources, short Barnx notes and practical steps for skills I am actively learning, testing and applying — organized so you can follow the same path without digging through random links.</p>
  </section>
  <section className="studioLibrary">
    <div className="sectionHead"><div><span className="eyebrow">START HERE</span><h2>Current learning paths.</h2><p>Each path explains what the skill is, why it matters, what to learn first and what to practice.</p></div></div>
    <div className="resourceGrid">
      <Link href="/barnx-studio/learning-paths/docker-fundamentals" className="resourceCard">
        <div className="resourceIcon">D</div>
        <div><span>DevOps Fundamentals · BEGINNER</span><h3>Docker Fundamentals</h3><p>A simple 3-week hands-on roadmap from containers and images to Docker Compose, PostgreSQL and a real practice project.</p><em>Open learning path →</em></div>
      </Link>
      {paths.filter(path=>path.slug!=='docker-fundamentals').map(path=><Link href={`/barnx-studio/learning-paths/${path.slug}`} className="resourceCard" key={path.id}>
        <div className="resourceIcon">↗</div>
        <div><span>{path.difficulty || 'Learning path'} · {path.estimatedDuration || 'Self-paced'}</span><h3>{path.title}</h3><p>{path.summary}</p><em>Open learning path →</em></div>
      </Link>)}
    </div>
  </section>
  <section className="nextCase"><p>More learning paths will be added as I learn and apply new skills.</p><Link href="/barnx-studio">Browse Barnx Studio →</Link></section>
</main>}
