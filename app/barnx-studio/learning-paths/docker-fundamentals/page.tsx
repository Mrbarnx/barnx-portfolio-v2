import Link from 'next/link';

export const metadata={title:'Docker Fundamentals | Barnx Studio'};

const steps=[
  ['01','Containers & images','Understand the difference between an image and a running container, and why containers make development environments more predictable.'],
  ['02','Dockerfiles','Learn how to describe an application image step by step and keep builds small, repeatable and understandable.'],
  ['03','Volumes','Understand how to persist data and share files without losing important state when a container stops.'],
  ['04','Networking','Learn how containers communicate with each other and how ports connect container services to your local machine.'],
  ['05','Docker Compose','Run multiple services together — for example an app, API and database — from one clear configuration.'],
  ['06','Practice','Containerize a small application, run it locally, add a database service and verify the setup can be recreated from scratch.']
];

export default function DockerFundamentalsPage(){return <main className="page resourceDetail">
  <Link className="back" href="/barnx-studio/learning-paths">← Learning Paths</Link>
  <section className="resourceHero">
    <div className="resourceIcon huge">D</div>
    <span className="eyebrow">DEVOPS · ACTIVELY LEARNING</span>
    <h1>Docker Fundamentals</h1>
    <p>A practical beginner path for understanding containers, building images and running repeatable development environments. I’ll refine this page as I learn, test and publish more Barnx notes and tutorials.</p>
  </section>

  <section className="caseColumns">
    <div><span className="eyebrow">WHAT IT IS</span><h2>A portable way to package and run software.</h2><p>Docker lets an application run with its required environment inside containers, which helps reduce differences between machines and makes local setup easier to reproduce.</p></div>
    <div><span className="eyebrow">WHY LEARN IT</span><h2>Useful beyond local development.</h2><p>It helps with consistent environments, multi-service projects, CI/CD workflows and the foundations of modern deployment infrastructure.</p></div>
  </section>

  <section className="caseSection">
    <span className="eyebrow">LEARNING ORDER</span>
    <h2>Follow these steps.</h2>
    <div className="featureGrid">{steps.map(step=><article key={step[0]}><span className="eyebrow">{step[0]}</span><h3>{step[1]}</h3><p>{step[2]}</p></article>)}</div>
  </section>

  <section className="caseColumns">
    <div><span className="eyebrow">STARTING RESOURCE</span><h2>Use the official Docker getting-started material first.</h2><p>Start with the official documentation, then return here as I add the specific videos, shorts, notes and exercises I find most useful.</p><div className="caseLinks"><a href="https://docs.docker.com/get-started/" target="_blank" rel="noreferrer">Docker Get Started ↗</a></div></div>
    <div><span className="eyebrow">BARNX CONTENT</span><h2>Short explanations will live here.</h2><p>This section is ready for TikTok shorts, YouTube tutorials, Barnx notes and social posts as they are published. The goal is to keep each addition tied to the exact learning step it helps explain.</p></div>
  </section>

  <section className="caseSection">
    <span className="eyebrow">PRACTICE</span>
    <h2>Build something small.</h2>
    <p>Take a simple web application, create a Dockerfile, run it as a container, add persistent data if needed, then use Docker Compose when you introduce another service such as a database.</p>
  </section>

  <section className="nextCase"><p>Learning path · Docker Fundamentals</p><Link href="/barnx-studio/learning-paths">Browse learning paths →</Link></section>
</main>}
