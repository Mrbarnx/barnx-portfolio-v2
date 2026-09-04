import Link from 'next/link';
import { getPublishedPrompts } from '@/lib/cms/publicStudio';
import styles from './prompts.module.css';

export const metadata={title:'AI Prompt Library | Barnx Studio'};

export const dynamic = 'force-dynamic';

export default async function PromptLibraryPage(){const promptLibrary=await getPublishedPrompts();return <main className="page resourceDetail">
  <Link className="back" href="/barnx-studio">← Barnx Studio</Link>
  <section className={`resourceHero ${styles.hero}`}>
    <div className="resourceIcon huge">✦</div>
    <span className="eyebrow">AI PROMPT LIBRARY · FREE</span>
    <h1>Prompts that help you build with AI more deliberately.</h1>
    <p>Practical prompts and engineering frameworks for developers and vibe coders. Pick a prompt, understand what it does, copy it, and use the short guide to get better results.</p>
  </section>
  <section className={`studioLibrary ${styles.library}`}>
    <div className="sectionHead"><div><span className="eyebrow">PROMPTS</span><h2>Choose what you need.</h2><p className={styles.intro}>Each prompt includes a clear purpose, the full prompt, a copy action, a downloadable Markdown file and a brief usage guide.</p></div></div>
    <div className="resourceGrid">{promptLibrary.map(prompt=><Link href={`/barnx-studio/prompts/${prompt.slug}`} className="resourceCard" key={prompt.slug}>
      <div className="resourceIcon">{prompt.number}</div>
      <div><span>{prompt.category} · PROMPT</span><h3>{prompt.title}</h3><p>{prompt.short}</p><em>Open prompt →</em></div>
    </Link>)}</div>
  </section>
  <section className="nextCase"><p>More resources coming as the library grows.</p><Link href="/barnx-studio">Browse Barnx Studio →</Link></section>
</main>}
