import { HomeClient } from '@/components/HomeClient';
import { getPublishedProjects } from '@/lib/cms/publicProjects';
import { getPublicSiteSettings } from '@/lib/cms/publicSettings';

export const dynamic = 'force-dynamic';

export default async function HomePage(){
  const [projects, settings] = await Promise.all([getPublishedProjects(), getPublicSiteSettings()]);
  return <HomeClient projects={projects.slice(0, 3)} settings={settings}/>;
}
