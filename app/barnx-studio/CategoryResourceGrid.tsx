import Link from 'next/link';
import type { PublicStudioResource } from '@/lib/cms/publicStudio';

type Props = {
  resources: PublicStudioResource[];
  eyebrow: string;
  title: string;
  actionLabel?: string;
};

export function CategoryResourceGrid({ resources, eyebrow, title, actionLabel = 'View resource →' }: Props) {
  if (!resources.length) return null;

  return (
    <section className="studioLibrary">
      <div className="sectionHead">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="resourceGrid">
        {resources.map((resource) => (
          <Link href={`/barnx-studio/${resource.slug}`} className="resourceCard" key={resource.slug}>
            <div className="resourceIcon">{resource.icon}</div>
            <div>
              <span>{resource.type} · {resource.free ? 'FREE' : 'PREMIUM'}</span>
              <h3>{resource.title}</h3>
              <p>{resource.short}</p>
              <em>{actionLabel}</em>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
