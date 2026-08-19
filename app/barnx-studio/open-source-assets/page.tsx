import Link from 'next/link';
import { resources } from '@/data/content';

export const metadata={title:'Open Source Assets | Barnx Studio'};

const assetSlugs=['frontend-release-checklist','react-async-button','vue-resource-card'];

export default function OpenSourceAssetsPage(){const assets=resources.filter(resource=>assetSlugs.includes(resource.slug));return <main className="page resourceDetail"><Link className="back" href="/barnx-studio">← Barnx Studio</Link><section className="resourceHero"><div className="resourceIcon huge">⌘</div><span className="eyebrow">OPEN SOURCE ASSETS · FREE</span><h1>Reusable code and developer assets.</h1><p>Small practical resources you can inspect, understand and adapt for your own projects.</p></section><section className="studioLibrary"><div className="sectionHead"><div><span className="eyebrow">ASSETS</span><h2>Useful building blocks.</h2></div></div><div className="resourceGrid">{assets.map(resource=><Link href={`/barnx-studio/${resource.slug}`} className="resourceCard" key={resource.slug}><div className="resourceIcon">{resource.icon}</div><div><span>{resource.type} · FREE</span><h3>{resource.title}</h3><p>{resource.short}</p><em>View asset →</em></div></Link>)}</div></section><section className="nextCase"><p>More open-source assets will be added as the library grows.</p><Link href="/barnx-studio">Barnx Studio →</Link></section></main>}
