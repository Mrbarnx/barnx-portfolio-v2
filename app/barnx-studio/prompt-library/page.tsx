import Link from 'next/link';
import { promptLibrary } from '@/data/prompts';
import styles from './prompt-library.module.css';

export const metadata={title:'AI Prompt Library | Barnx Studio',description:'Practical AI prompts and engineering frameworks for developers and vibe coders.'};

export default function PromptLibraryPage(){
  return <main className="page">
    <Link className="back" href="/barnx-studio">← Barnx Studio</Link>
    <section className={styles.libraryHero}>
      <span className="eyebrow">AI PROMPT LIBRARY</span>
      <h1>Useful prompts.<br/>Clear instructions.<br/>Better AI work.</h1>
      <p>A practical library for developers and vibe coders who want prompts they can understand, copy, use and adapt — with a short guide for each one instead of a wall of unexplained text.</p>
      <div className={styles.libraryIntro}><span>Code Review</span><span>Engineering Workflow</span><span>More categories coming</span></div>
    </section>

    <section>
      <div className="sectionHead"><div><span className="eyebrow">PROMPTS</span><h2>Choose what you need.</h2><p>Open a prompt to see what it does, when to use it, the full prompt and a short usage guide.</p></div></div>
      <div className={styles.promptGrid}>
        {promptLibrary.map(prompt=><Link className={styles.promptCard} href={`/barnx-studio/prompt-library/${prompt.slug}`} key={prompt.slug}>
          <span className={styles.promptNumber}>{prompt.number}</span>
          <span className={styles.promptCategory}>{prompt.category}</span>
          <h2>{prompt.title}</h2>
          <p>{prompt.short}</p>
          <strong>Open prompt →</strong>
        </Link>)}
      </div>
    </section>
  </main>;
}
