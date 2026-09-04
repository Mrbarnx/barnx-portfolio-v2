import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedLearningPath } from '@/lib/cms/publicStudio';

export const dynamic = 'force-dynamic';

export default async function CmsLearningPathPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = await getPublishedLearningPath(slug);
  if (!path) notFound();

  return <main className="page resourceDetail">
    <Link className="back" href="/barnx-studio/learning-paths">← Learning Paths</Link>
    <section className="resourceHero">
      <div className="resourceIcon huge">↗</div>
      <span className="eyebrow">{path.difficulty || 'LEARNING PATH'} · {path.estimatedDuration || 'SELF-PACED'}</span>
      <h1>{path.title}</h1><p>{path.description || path.summary}</p>
    </section>
    <section className="studioLibrary">
      <div className="sectionHead"><div><span className="eyebrow">ROADMAP</span><h2>Modules and lessons.</h2></div></div>
      <div className="resourceGrid">{path.modules.map((module,index)=><article className="resourceCard" key={module.id}>
        <div className="resourceIcon">{String(index+1).padStart(2,'0')}</div><div><span>{module.lessons.length} LESSON{module.lessons.length===1?'':'S'}</span><h3>{module.title}</h3><p>{module.summary}</p><ul>{module.lessons.map(lesson=><li key={lesson.id}><strong>{lesson.title}</strong>{lesson.summary?` — ${lesson.summary}`:''}{lesson.videoUrl?<a href={lesson.videoUrl} target="_blank" rel="noreferrer"> Watch ↗</a>:null}{lesson.repositoryUrl?<a href={lesson.repositoryUrl} target="_blank" rel="noreferrer"> Repo ↗</a>:null}{lesson.bodyMarkdown?<p style={{whiteSpace:'pre-wrap'}}>{lesson.bodyMarkdown}</p>:null}</li>)}</ul></div>
      </article>)}</div>
    </section>
  </main>;
}
