import type { Metadata } from 'next';
import Link from 'next/link';
import { projects } from '@/data/content';
import { ProjectStar } from '@/components/ProjectStar';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected Barnabas Mikel projects across frontend engineering, product UI, full-stack development and practical AI integrations.',
  alternates: { canonical: '/projects' },
  openGraph: {
    title: 'Projects — Barnx',
    description: 'Selected work across frontend engineering, product UI, full-stack builds and practical AI integrations.',
    url: '/projects',
  },
};

export default function ProjectsPage(){return <main className="page"><section className="pageHero"><span className="eyebrow">PROJECT ARCHIVE</span><h1>Products, interfaces<br/>and intelligent systems.</h1><p>Selected work across frontend engineering, product UI, full-stack builds and practical AI integrations.</p></section><section className="projectGrid"><div className="projectCardWrap"><Link className="projectCard automationProjectCard" href="/barnx-studio/automation-systems"><div className="projectVisual black automationProjectVisual"><div className="browser"><i/><i/><i/></div><span>AI AUTOMATION / SOFTWARE SYSTEMS</span><strong>Stop losing time<br/>to repeatable work.</strong><small>Lead response · Support · CRM · Operations</small></div><div className="projectBody"><span>BARNX STUDIO · BUSINESS SYSTEMS · IN DEVELOPMENT</span><h2>AI Automation & Software Systems</h2><p>For businesses losing hours to repetitive admin, slow follow-up and disconnected tools. Explore the systems and demos Barnx Studio is building around those bottlenecks.</p><em>Explore automation systems →</em></div></Link><ProjectStar id="automation-systems"/></div>{projects.map(p=><div className="projectCardWrap" key={p.slug}><Link className="projectCard" href={`/projects/${p.slug}`}><div className={`projectVisual ${p.tone}`}><div className="browser"><i/><i/><i/></div><strong>{p.display}</strong><small>{p.visualSubtitle}</small></div><div className="projectBody"><span>{p.category} · {p.status}</span><h2>{p.title}</h2><p>{p.short}</p><div className="tags">{p.tech.slice(0,4).map(t=><b key={t}>{t}</b>)}</div><em>Read case study →</em></div></Link><ProjectStar id={p.slug}/></div>)}</section></main>}
