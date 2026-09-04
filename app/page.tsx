import { HomeClient } from '@/components/HomeClient';
import { getPublishedProjects } from '@/lib/cms/publicProjects';

export const dynamic = 'force-dynamic';

export default async function HomePage(){
  const projects = await getPublishedProjects();
  return <HomeClient projects={projects.slice(0, 3)}/>;
}
