'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Rocket, Sparkles, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { experience, type Project } from '@/data/content';
import { ImpactTeaser } from '@/components/ImpactTeaser';

const techCards = [
  { key: 'react', title: 'React', subtitle: 'UI Libraries', iconSrc: 'https://cdn.simpleicons.org/react/000000', className: 'f1' },
  { key: 'next', title: 'Next.js', subtitle: 'Full-Stack React', iconSrc: 'https://cdn.simpleicons.org/nextdotjs/000000', className: 'f2' },
  { key: 'typescript', title: 'TypeScript', subtitle: 'Type Safety', iconSrc: 'https://cdn.simpleicons.org/typescript/000000', className: 'f3' },
  { key: 'vue', title: 'Vue', subtitle: 'Progressive Framework', iconSrc: 'https://cdn.simpleicons.org/vuedotjs/000000', className: 'f4' },
  { key: 'automation', title: 'Automation', subtitle: 'Growing: n8n · APIs', iconSrc: 'https://cdn.simpleicons.org/n8n/000000', className: 'f5' },
  { key: 'ai', title: 'AI Integrations', subtitle: 'OpenAI · Claude · Gemini', className: 'f6', icon: 'sparkles' },
  { key: 'frontend', title: 'Frontend Engineering', subtitle: 'Pixel Perfect · Performant', className: 'f7', icon: 'code' }
];

const techMarqueeItems = [
  { label: 'React', iconSrc: 'https://cdn.simpleicons.org/react/000000' },
  { label: 'Vue 3', iconSrc: 'https://cdn.simpleicons.org/vuedotjs/000000' },
  { label: 'Next.js', iconSrc: 'https://cdn.simpleicons.org/nextdotjs/000000' },
  { label: 'TypeScript', iconSrc: 'https://cdn.simpleicons.org/typescript/000000' },
  { label: 'Node.js', iconSrc: 'https://cdn.simpleicons.org/nodedotjs/000000' },
  { label: 'Tailwind CSS', iconSrc: 'https://cdn.simpleicons.org/tailwindcss/000000' },
  { label: 'n8n · growing', iconSrc: 'https://cdn.simpleicons.org/n8n/000000' }
];

const stories = [
  ['01', 'The beginning', 'I started with the frontend — learning how strong interfaces turn ideas into experiences people can actually use.'],
  ['02', 'From screens to products', 'I moved from isolated pages into reusable systems, complete product flows and production-ready applications.'],
  ['03', 'Frontend Engineer · Imisi Health', 'Today I build responsive interfaces, reusable components, API-driven workflows and product improvements in a professional engineering team.'],
  ['04', 'The next layer', 'I am growing deeper into backend engineering, AI integrations and workflow automation while keeping frontend craft at the center.']
];

function TechIcon({ card }: { card: (typeof techCards)[number] }) {
  if ('iconSrc' in card && card.iconSrc) return <img src={card.iconSrc} alt="" aria-hidden="true" />;
  if ('icon' in card && card.icon === 'sparkles') return <Sparkles aria-hidden="true" />;
  return <Code2 aria-hidden="true" />;
}

export function HomeClient({ projects }: { projects: Project[] }) {
  const about = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.05 });
    let raf = 0;
    const loop = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)');
    let raf = 0;
    let currentIndex = -1;

    const updateActiveStory = () => {
      if (desktop.matches && about.current) {
        const items = Array.from(about.current.querySelectorAll<HTMLElement>('[data-story]'));

        if (items.length) {
          const targetY = window.innerHeight * 0.52;
          let nextIndex = 0;
          let nearest = Number.POSITIVE_INFINITY;

          items.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const distance = Math.abs(center - targetY);

            if (distance < nearest) {
              nearest = distance;
              nextIndex = index;
            }
          });

          if (nextIndex !== currentIndex) {
            currentIndex = nextIndex;
            setActive(nextIndex);
          }
        }
      }

      raf = requestAnimationFrame(updateActiveStory);
    };

    const handleBreakpointChange = () => {
      currentIndex = -1;
    };

    desktop.addEventListener('change', handleBreakpointChange);
    raf = requestAnimationFrame(updateActiveStory);

    return () => {
      cancelAnimationFrame(raf);
      desktop.removeEventListener('change', handleBreakpointChange);
    };
  }, []);

  const advanceMobileStory = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      setActive((current) => (current + 1) % stories.length);
    }
  };

  return <main>
    <section className="hero heroReference">
      <div className="heroGrid" />
      <motion.div className="heroCopy" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }}>
        <span className="availability"><i aria-hidden="true" />Available for new opportunities</span>
        <h1>Hi, I’m<br/><strong>Barnabas Mikel.</strong></h1>
        <p>Frontend-Focused Full-Stack Engineer building<br className="heroDesktopBreak"/>modern web applications while integrating AI-powered<br className="heroDesktopBreak"/>features and intelligent automations.</p>
        <div className="heroActions">
          <Link className="button black" href="/projects">View Projects <ArrowRight/></Link>
          <Link className="button" href="/barnx-studio">Explore Barnx Studio <ArrowRight/></Link>
        </div>
        <div className="heroStats">
          <div><Code2/><b>42</b><span>Healthcare screens built</span></div>
          <div><Rocket/><b>21</b><span>SocialFi screens designed & coded</span></div>
          <div><Sparkles/><b>3+</b><span>Years building web products</span></div>
        </div>
      </motion.div>

      <div className="heroVisual" aria-hidden="true">
        <motion.img className="heroPhotoCutout" src="/photos/hero-exact.svg" alt="" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .08, ease: [0.22, 1, 0.36, 1] }}/>
        {techCards.map((card,index)=><motion.div className={`floatCard ${card.className}`} animate={{ y: [0,index%2?3:-3,0] }} transition={{ duration:6+index*.28,repeat:Infinity,ease:'easeInOut' }} key={card.key}><span className="techIcon"><TechIcon card={card}/></span><div><b>{card.title}</b><small>{card.subtitle}</small></div></motion.div>)}
      </div>
    </section>

    <section className="techStrip techMarquee" aria-label="Technology stack">
      <div className="techMarqueeTrack">
        {[0,1].map((copyIndex)=><div className="techMarqueeGroup" aria-hidden={copyIndex === 1} key={copyIndex}>
          {techMarqueeItems.map((item)=><span className="techMarqueeItem" key={`${copyIndex}-${item.label}`}><img src={item.iconSrc} alt="" aria-hidden="true"/><b>{item.label}</b></span>)}
        </div>)}
      </div>
    </section>

    <ImpactTeaser/>

    <section className="aboutSection" ref={about}>
      <div className="aboutVisual mobileStoryTap" onClick={advanceMobileStory}>
        <div className={`aboutImage state${active}`}><Image src="/photos/hero-exact.svg" fill alt="Barnabas Mikel — engineering story" sizes="45vw"/></div>
        <div className="progress">{stories.map((_,i)=><i className={i===active?'active':''} key={i}/>)}</div>
      </div>
      <div className="aboutStories"><span className="eyebrow">ABOUT / STORY</span><h2>Building one layer deeper<br/>with every project.</h2>{stories.map((s,i)=><article data-story className={active===i?'active':''} key={s[0]}><span>{s[0]}</span><div><h3>{s[1]}</h3><p>{s[2]}</p></div></article>)}</div>
    </section>

    <section className="featured"><div className="sectionHead"><div><span className="eyebrow">FEATURED WORK</span><h2>Selected Projects</h2><p>Real builds showing frontend craft, product thinking and growing full-stack capability.</p></div><Link className="button" href="/projects">View all projects <ArrowRight/></Link></div><div className="projectGrid">{projects.slice(0,3).map(p=><Link className="projectCard" href={`/projects/${p.slug}`} key={p.slug}><div className={`projectVisual ${p.tone}${p.coverImage?' hasCover':''}`}><div className="browser"><i/><i/><i/></div>{p.coverImage?<img className="projectCoverImage" src={p.coverImage.url} alt={p.coverImage.alt}/>:<><strong>{p.display}</strong><small>{p.visualSubtitle}</small></>}</div><div className="projectBody"><span>{p.category} · {p.status}</span><h3>{p.title}</h3><p>{p.short}</p><div className="tags">{p.tech.slice(0,4).map(t=><b key={t}>{t}</b>)}</div><em>Case study →</em></div></Link>)}</div></section>
    <section className="experience"><span className="eyebrow">EXPERIENCE</span><h2>Professional progression.</h2>{experience.map(x=><article key={x.company}><time>{x.date}</time><div><h3>{x.role} · {x.company}</h3><p>{x.description}</p></div></article>)}</section>
    <section className="focus"><div><span className="eyebrow light">CURRENT FOCUS</span><h2>Frontend first.<br/>Full product next.</h2></div><div className="focusCards"><article><Code2/><h3>Strongest now</h3><p>React, Vue, Next.js, TypeScript, responsive UI, accessibility, component architecture and polished product interfaces.</p></article><article><Zap/><h3>Growing deeper</h3><p>Node.js, PostgreSQL, AI API integrations, workflow automation, n8n and cloud deployment.</p></article></div></section>
    <Newsletter/>

    <style jsx global>{`
      .navWrap{position:fixed;inset:0 0 auto 0;z-index:60;padding:30px 0 0;background:transparent;border:0}.navWrap.scrolled{background:rgba(255,255,255,.92);border-bottom:1px solid rgba(0,0,0,.05);backdrop-filter:blur(14px)}.nav{position:relative;width:min(1172px,calc(100% - 48px));max-width:1172px;min-height:54px;margin:0 auto;padding:0}.logo{display:inline-flex;align-items:center;gap:9px;font-size:28px;font-weight:800;letter-spacing:-.04em;color:#090909}.logo .logoMark{width:34px;height:42px;object-fit:contain;display:block}.logo span{display:block}.navLinks{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;gap:70px}.navLinks a{padding:10px 0 16px;color:#0b0b0b;font-size:14px;font-weight:600}.navLinks a::after{left:50%;bottom:3px;width:50px;height:1.5px;transform:translateX(-50%) scaleX(0);transform-origin:center;background:#0b0b0b}.navLinks a.active::after{transform:translateX(-50%) scaleX(1)}.navRight .resume{display:none}
      body::before{content:"";position:fixed;inset:3px;z-index:9999;pointer-events:none;border:1px solid rgba(10,10,10,.045);border-radius:14px 14px 0 0}
      .heroReference{width:min(1340px,100%);max-width:1340px;height:754px;min-height:754px;margin:0 auto;padding:0;display:block;border:0;border-radius:0;background:#fff;position:relative;overflow:hidden}.heroReference .heroGrid{position:absolute;inset:88px 40px 0;background-image:linear-gradient(rgba(0,0,0,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.025) 1px,transparent 1px);background-size:64px 64px;mask-image:linear-gradient(to bottom,transparent 0,#000 12%,#000 90%,transparent 100%);pointer-events:none}.heroReference .heroCopy{position:absolute;z-index:8;left:106px;top:194px;width:520px;padding:0}.heroReference .availability{height:40px;min-width:220px;padding:0 14px;gap:10px;border:1px solid rgba(0,0,0,.08);border-radius:999px;background:#fff;box-shadow:0 6px 20px rgba(0,0,0,.04);font-size:13px;font-weight:500}.heroReference .availability i{width:8px;height:8px;flex:0 0 8px;border-radius:999px;background:#090909}.heroReference h1{width:510px;margin:34px 0 24px;font-size:clamp(56px,4.7vw,68px);line-height:1.08;letter-spacing:-.04em;font-weight:700;color:#090909}.heroReference h1 strong{font-weight:700;white-space:nowrap}.heroReference .heroCopy>p{width:510px;max-width:510px;margin:0;color:#34383d;font-size:18px;line-height:1.55;font-weight:500}.heroReference .heroActions{display:flex;gap:24px;margin-top:38px;flex-wrap:nowrap}.heroReference .button{height:52px;min-height:52px;padding:0 22px;border-radius:13px;font-size:14px;font-weight:700;box-shadow:0 7px 20px rgba(0,0,0,.055)}.heroReference .button.black{width:166px}.heroReference .heroActions .button:not(.black){width:220px}.heroReference .button svg{width:17px;height:17px}.heroReference .heroStats{width:445px;display:grid;grid-template-columns:repeat(3,max-content);justify-content:space-between;align-items:start;gap:0;margin-top:62px}.heroReference .heroStats>div{display:grid;grid-template-columns:32px auto;grid-template-areas:"icon title" "icon sub";column-gap:9px;row-gap:1px;align-items:center}.heroReference .heroStats svg{grid-area:icon;width:27px;height:27px;stroke-width:2;color:#0b0b0b}.heroReference .heroStats b{grid-area:title;font-size:14px;line-height:1.1;font-weight:750;white-space:nowrap}.heroReference .heroStats span{grid-area:sub;color:#5d6268;font-size:12px;line-height:1.2;white-space:nowrap}
      .heroReference .heroVisual{position:absolute;inset:0;z-index:2;height:754px;pointer-events:none}.heroReference .heroPhotoCutout{position:absolute;z-index:2;left:68.4%;bottom:-2px;width:650px;height:auto;max-width:none;transform:translateX(-50%);object-fit:contain;filter:saturate(.94) contrast(1.01)}.heroReference .heroVisual::after{content:"";position:absolute;z-index:3;left:47%;right:2%;bottom:-1px;height:68px;background:linear-gradient(to bottom,transparent,rgba(255,255,255,.99));pointer-events:none}
      .heroReference .floatCard{position:absolute;z-index:5;display:flex;align-items:center;gap:14px;min-width:0;padding:14px 18px;border:1px solid rgba(10,10,10,.075);border-radius:16px;background:rgba(255,255,255,.97);box-shadow:0 10px 30px rgba(0,0,0,.045)}.heroReference .floatCard .techIcon{width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;border-radius:11px;background:transparent;color:#090909}.heroReference .floatCard .techIcon img,.heroReference .floatCard .techIcon svg{width:31px;height:31px;object-fit:contain;color:#090909}.heroReference .floatCard div{display:flex;flex-direction:column;gap:2px}.heroReference .floatCard b{color:#090909;font-size:14px;line-height:1.2;font-weight:700;white-space:nowrap}.heroReference .floatCard small{color:#5c6269;font-size:11px;line-height:1.2;white-space:nowrap}.heroReference .f1{top:180px;left:45%;width:170px;height:80px}.heroReference .f2{top:170px;right:8%;width:176px;height:74px}.heroReference .f3{top:360px;left:46.5%;width:166px;height:76px}.heroReference .f4{top:292px;right:2.2%;width:210px;height:76px}.heroReference .f5{top:430px;right:2.3%;width:190px;height:70px}.heroReference .f6{left:42%;bottom:80px;width:230px;height:73px}.heroReference .f7{right:8%;bottom:45px;width:265px;height:80px}.heroReference+.techStrip{margin-top:18px}
      .techMarquee{display:block!important;overflow:hidden!important;padding:0!important;position:relative;white-space:nowrap}.techMarqueeTrack{display:flex;width:max-content;will-change:transform;animation:techMarqueeScroll 28s linear infinite}.techMarqueeGroup{display:flex;align-items:center;flex-shrink:0;gap:68px;padding:17px 68px 17px 0}.techMarqueeItem{display:inline-flex;align-items:center;gap:10px;color:#606060;font-size:13px;font-weight:700;line-height:1}.techMarqueeItem img{width:22px;height:22px;object-fit:contain;display:block}.techMarqueeItem b{font:inherit;color:inherit;white-space:nowrap}@keyframes techMarqueeScroll{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}
      @media(max-width:1100px){.heroReference{height:auto;min-height:760px}.heroReference .heroCopy{left:54px;top:175px;width:46%}.heroReference h1{width:auto;font-size:clamp(50px,5.5vw,62px)}.heroReference .heroCopy>p{width:100%}.heroReference .heroPhotoCutout{left:73%;width:580px}.heroReference .f4,.heroReference .f5{display:none}.heroReference .f1{left:50%}.heroReference .f3{left:51%}.heroReference .f6{left:48%}.heroReference .f7{right:3%}}
      @media(max-width:900px){.heroReference{min-height:1120px;padding:130px 24px 40px}.heroReference .heroGrid{inset:90px 18px 220px}.heroReference .heroCopy{position:relative;left:auto;top:auto;width:min(100%,600px)}.heroReference h1{width:100%;margin-top:26px}.heroReference .heroCopy>p{width:100%;max-width:580px}.heroDesktopBreak{display:none}.heroReference .heroStats{width:min(100%,445px)}.heroReference .heroVisual{position:absolute;inset:auto 0 0;height:650px}.heroReference .heroPhotoCutout{left:58%;width:560px}.heroReference .f1{left:5%;top:70px}.heroReference .f3{left:7%;top:230px}.heroReference .f6{left:3%;bottom:80px}.heroReference .f2{right:3%;top:85px}.heroReference .f7{right:2%;bottom:58px}.techMarqueeTrack{animation-duration:24s}.techMarqueeGroup{gap:54px;padding-right:54px}}
      @media(max-width:767px){.mobileStoryTap{cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}.mobileStoryTap .aboutImage{transition:filter .45s ease,transform .45s ease}.techMarqueeTrack{animation-duration:20s}.techMarqueeGroup{gap:38px;padding:14px 38px 14px 0}.techMarqueeItem{gap:8px;font-size:12px}.techMarqueeItem img{width:20px;height:20px}}
      @media(max-width:620px){.navWrap{padding:18px 18px 0}.nav{width:100%}.logo{font-size:24px}.logo .logoMark{width:30px;height:36px}body::before{display:none}.heroReference{min-height:auto;padding:118px 18px 32px;overflow:hidden}.heroReference .heroGrid{inset:80px 0 210px}.heroReference .heroCopy{width:100%}.heroReference .availability{min-width:0;height:38px;font-size:12px}.heroReference h1{font-size:clamp(46px,13vw,58px);line-height:1.03;white-space:normal}.heroReference h1 strong{white-space:normal}.heroReference .heroCopy>p{font-size:16px;line-height:1.6}.heroReference .heroActions{gap:10px;flex-direction:column}.heroReference .heroActions .button,.heroReference .button.black{width:100%}.heroReference .heroStats{grid-template-columns:1fr;gap:18px;margin-top:38px}.heroReference .heroVisual{position:relative;height:600px;margin:18px -18px 0}.heroReference .heroPhotoCutout{left:50%;width:540px}.heroReference .floatCard{height:65px;padding:10px 12px;transform:scale(.88)}.heroReference .f1{left:0;top:90px}.heroReference .f2{right:-18px;top:165px}.heroReference .f3{left:-12px;top:260px}.heroReference .f4,.heroReference .f5{display:none}.heroReference .f6{left:-10px;bottom:76px}.heroReference .f7{right:-36px;bottom:18px;width:240px}.heroReference+.techStrip{margin-top:0}}
      @media(prefers-reduced-motion:reduce){.heroReference .floatCard,.heroReference .heroPhotoCutout{animation:none!important;transition:none!important}.techMarqueeTrack{animation:none!important;transform:none!important}}
    `}</style>
  </main>;
}

function Newsletter(){const[email,setEmail]=useState('');const[done,setDone]=useState(false);return <section className="newsletter"><div className="mailIcon">✉</div><div><span className="eyebrow">BARNX NOTES</span><h2>Let’s build something amazing together.</h2><p>Occasional updates on projects, lessons, resources and behind-the-scenes builds.</p></div><form onSubmit={e=>{e.preventDefault();if(email.includes('@'))setDone(true)}}><div><input aria-label="Email address" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Enter your email" type="email" required/><button>{done?'Subscribed ✓':'Subscribe →'}</button></div><small>{done?'Frontend preview complete — backend newsletter comes in the next phase.':'No spam. Unsubscribe anytime.'}</small></form></section>}
