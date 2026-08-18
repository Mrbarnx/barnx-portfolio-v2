import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PromptActions } from '@/components/PromptActions';
import { promptLibrary } from '@/data/prompts';
import styles from '../prompt-library.module.css';

export function generateStaticParams(){return promptLibrary.map(prompt=>({slug:prompt.slug}))}

export default async function PromptDetailPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const prompt=promptLibrary.find(item=>item.slug===slug);
  if(!prompt)notFound();

  const promptText=await readFile(path.join(process.cwd(),prompt.sourceFile),'utf8');

  return <main className="page">
    <Link className="back" href="/barnx-studio/prompt-library">← AI Prompt Library</Link>

    <section className={styles.detailHero}>
      <div className={styles.detailMeta}><span>{prompt.number}</span><span>•</span><span>{prompt.category}</span><span>•</span><span>FREE</span></div>
      <h1>{prompt.title}</h1>
      <p>{prompt.description}</p>
      <div className={styles.toolTags}>{prompt.tools.map(tool=><b key={tool}>{tool}</b>)}</div>
    </section>

    <section className={styles.guideGrid}>
      <div>
        <span className="eyebrow">BEST FOR</span>
        <h2>When to use it.</h2>
        <p>{prompt.bestFor}</p>
      </div>
      <div>
        <span className="eyebrow">HOW TO USE IT</span>
        <h2>Four simple steps.</h2>
        <div className={styles.steps}>{prompt.tutorial.map((step,index)=><div className={styles.step} key={step}><span>0{index+1}</span><div>{step}</div></div>)}</div>
      </div>
    </section>

    <section className={styles.promptSection}>
      <div className={styles.promptHeading}>
        <div><span className="eyebrow">THE PROMPT</span><h2>Copy it. Adapt it. Use it.</h2></div>
        <p>The prompt below is shown from the same markdown file used by the download action.</p>
      </div>
      <PromptActions prompt={promptText} download={prompt.download}/>
      <div className={styles.promptBox}><pre>{promptText}</pre></div>
      <p className={styles.note}>AI output still needs your judgment. Review generated changes before using them in production.</p>
    </section>

    <div className={styles.backRow}><Link href="/barnx-studio/prompt-library">← Browse all prompts</Link><Link href="/barnx-studio">Barnx Studio →</Link></div>
  </main>;
}
