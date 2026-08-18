import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PromptActions } from '@/components/PromptActions';
import { promptLibrary } from '@/data/prompts';
import styles from '../prompts.module.css';

export function generateStaticParams(){return promptLibrary.map(prompt=>({slug:prompt.slug}))}

export default async function PromptDetail({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const prompt=promptLibrary.find(item=>item.slug===slug);
  if(!prompt)notFound();

  const promptText=fs.readFileSync(path.join(process.cwd(),prompt.sourceFile),'utf8');

  return <main className="page resourceDetail">
    <Link className="back" href="/barnx-studio/prompts">← AI Prompt Library</Link>
    <section className={`resourceHero ${styles.detailHero}`}>
      <div className="resourceIcon huge">{prompt.number}</div>
      <span className="eyebrow">{prompt.category.toUpperCase()} · PROMPT</span>
      <h1>{prompt.title}</h1>
      <p>{prompt.description}</p>
      <div className={styles.actions}><PromptActions prompt={promptText} download={prompt.download}/></div>
    </section>

    <section className={`caseColumns ${styles.overview}`}>
      <div><span className="eyebrow">WHAT IT DOES</span><p>{prompt.short}</p></div>
      <div><span className="eyebrow">BEST FOR</span><p>{prompt.bestFor}</p><div className="tags large">{prompt.tools.map(tool=><b key={tool}>{tool}</b>)}</div></div>
    </section>

    <section className={styles.content}>
      <div className={styles.contentHead}><div><span className="eyebrow">THE PROMPT</span><h2>Copy it. Add your context. Build carefully.</h2></div><div className={styles.actions}><PromptActions prompt={promptText} download={prompt.download}/></div></div>
      <pre className={styles.code}><code>{promptText}</code></pre>
    </section>

    <section className={styles.tutorial}>
      <span className="eyebrow">HOW TO USE IT</span>
      <h2>A short workflow before you start.</h2>
      <div className={styles.steps}>{prompt.tutorial.map((step,index)=><article key={step}><span>{String(index+1).padStart(2,'0')}</span><p>{step}</p></article>)}</div>
    </section>

    <section className="nextCase"><p>Keep exploring</p><Link href="/barnx-studio/prompts">Browse all prompts →</Link></section>
  </main>
}
