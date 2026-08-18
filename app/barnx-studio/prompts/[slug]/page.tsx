import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PromptActions } from '@/components/PromptActions';
import { promptLibrary } from '@/data/prompts';

export function generateStaticParams(){return promptLibrary.map(prompt=>({slug:prompt.slug}))}

export default async function PromptDetail({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const prompt=promptLibrary.find(item=>item.slug===slug);
  if(!prompt)notFound();

  const promptText=fs.readFileSync(path.join(process.cwd(),prompt.sourceFile),'utf8');

  return <main className="page resourceDetail">
    <Link className="back" href="/barnx-studio/prompts">← AI Prompt Library</Link>
    <section className="resourceHero promptDetailHero">
      <div className="resourceIcon huge">{prompt.number}</div>
      <span className="eyebrow">{prompt.category.toUpperCase()} · PROMPT</span>
      <h1>{prompt.title}</h1>
      <p>{prompt.description}</p>
      <PromptActions prompt={promptText} download={prompt.download}/>
    </section>

    <section className="caseColumns promptOverview">
      <div><span className="eyebrow">WHAT IT DOES</span><p>{prompt.short}</p></div>
      <div><span className="eyebrow">BEST FOR</span><p>{prompt.bestFor}</p><div className="tags large">{prompt.tools.map(tool=><b key={tool}>{tool}</b>)}</div></div>
    </section>

    <section className="promptContentSection">
      <div className="promptContentHead"><div><span className="eyebrow">THE PROMPT</span><h2>Copy it. Add your context. Build carefully.</h2></div><PromptActions prompt={promptText} download={prompt.download}/></div>
      <pre className="promptCode"><code>{promptText}</code></pre>
    </section>

    <section className="promptTutorial">
      <span className="eyebrow">HOW TO USE IT</span>
      <h2>A short workflow before you start.</h2>
      <div className="promptSteps">{prompt.tutorial.map((step,index)=><article key={step}><span>{String(index+1).padStart(2,'0')}</span><p>{step}</p></article>)}</div>
    </section>

    <section className="nextCase"><p>Keep exploring</p><Link href="/barnx-studio/prompts">Browse all prompts →</Link></section>
  </main>
}
