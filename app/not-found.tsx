import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="page">
      <section className="pageHero" style={{ minHeight: '62vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span className="eyebrow">404 · PAGE NOT FOUND</span>
        <h1>This page doesn’t exist.</h1>
        <p>The link may be outdated, or the page may have moved while Barnx Studio and the portfolio continue to evolve.</p>
        <div className="heroActions">
          <Link className="button black" href="/">Back home →</Link>
          <Link className="button" href="/projects">View projects</Link>
        </div>
      </section>
    </main>
  );
}
