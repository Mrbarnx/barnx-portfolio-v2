'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import {Github,Linkedin,Mail,Menu,X as Close} from 'lucide-react';

const nav=[['Home','/'],['Projects','/projects'],['Impact','/impact'],['Barnx Studio','/barnx-studio']];

function XSocial(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.26-8.3L2.98 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.84h1.73L8.44 4.05H6.58L17.8 19.84Z"/></svg>}
function TikTokSocial(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.1 2h3.25c.28 1.72 1.24 3.16 2.65 4.15V9.4a8.28 8.28 0 0 1-2.62-.66v6.35A6.91 6.91 0 1 1 12.4 8.2v3.3a3.67 3.67 0 1 0 2.7 3.54V2Z"/></svg>}

export function Logo(){return <Link href="/" className="logo"><img className="logoMark" src="/brand/barnx-mark-exact.svg" alt="" aria-hidden="true"/><span>Barnx</span></Link>}

export function SiteShell({children}:{children:React.ReactNode}){
  const path=usePathname();
  const[open,setOpen]=useState(false);
  const[scrolled,setScrolled]=useState(false);
  useEffect(()=>{const f=()=>setScrolled(scrollY>20);addEventListener('scroll',f);f();return()=>removeEventListener('scroll',f)},[]);
  return <>
    <header className={`navWrap ${scrolled?'scrolled':''}`}>
      <nav className="nav">
        <Logo/>
        <div className="navLinks">{nav.map(([n,h])=><Link className={(h==='/'?path===h:path.startsWith(h))?'active':''} href={h} key={h}>{n}</Link>)}</div>
        <div className="navRight"><a className="resume" href="/Barnabas-Mikel-Resume.pdf" download>Résumé ↓</a><button className="mobileButton" onClick={()=>setOpen(!open)} aria-label="Toggle navigation">{open?<Close/>:<Menu/>}</button></div>
      </nav>
      {open&&<div className="mobileMenu">{nav.map(([n,h])=><Link onClick={()=>setOpen(false)} href={h} key={h}>{n}</Link>)}<a href="/Barnabas-Mikel-Resume.pdf" download>Download résumé ↓</a></div>}
    </header>
    {children}
    <footer>
      <div className="footerGrid">
        <div>
          <Logo/>
          <p>Frontend-focused product engineering, thoughtful interfaces and practical AI integrations.</p>
          <div className="socials">
            <a href="https://github.com/Mrbarnx" target="_blank" rel="noreferrer" aria-label="GitHub"><Github/></a>
            <a href="https://www.linkedin.com/in/mrbarns?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin/></a>
            <a href="https://x.com/MRBARNX" target="_blank" rel="noreferrer" aria-label="X"><XSocial/></a>
            <a href="https://tiktok.com/@mrbarnx" target="_blank" rel="noreferrer" aria-label="TikTok"><TikTokSocial/></a>
            <a href="mailto:mrbarnx@gmail.com" aria-label="Email"><Mail/></a>
          </div>
        </div>
        <div><b>Navigation</b><Link href="/">Home</Link><Link href="/projects">Projects</Link><Link href="/impact">Impact</Link><Link href="/barnx-studio">Barnx Studio</Link></div>
        <div><b>Resources</b><a href="/Barnabas-Mikel-Resume.pdf" download>Résumé</a><Link href="/barnx-studio">Free resources</Link><a href="mailto:mrbarnx@gmail.com">Consultation</a></div>
        <div><b>Let's connect</b><a href="mailto:mrbarnx@gmail.com">mrbarnx@gmail.com</a><span>Remote · Nigeria</span></div>
      </div>
      <div className="copyright">© 2026 Barnx. Built with Next.js.</div>
    </footer>
    <style jsx global>{`
      .techMarquee::before {
        content: 'SKILLS / TOOLS I WORK WITH';
        display: block;
        width: 100%;
        padding: 0 0 10px 4px;
        color: #777;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .12em;
        line-height: 1.2;
      }
      @media (min-width: 768px) {
        .navWrap .navRight .resume { display: inline-flex !important; }
      }
      @media (max-width: 767px) {
        .navWrap .navLinks { display: none !important; }
        .navWrap .navRight .resume { display: none !important; }
        .navWrap .mobileButton { display: grid !important; place-items: center; }
        .navWrap .nav { justify-content: space-between !important; }
      }
    `}</style>
  </>;
}
