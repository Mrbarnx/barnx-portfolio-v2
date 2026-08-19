import { redirect } from 'next/navigation';

export default async function LegacyPromptDetailPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  redirect(`/barnx-studio/prompts/${slug}`);
}
