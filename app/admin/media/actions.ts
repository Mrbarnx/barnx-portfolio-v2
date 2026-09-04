'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { CMS_MEDIA_BUCKET } from '@/lib/admin/media';
import { requireCmsAdmin } from '@/lib/admin/requireCmsAdmin';

export async function deleteMediaAsset(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const { supabase } = await requireCmsAdmin();
  const { data: asset, error: readError } = await supabase
    .from('media_assets')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle();

  if (readError || !asset) redirect('/admin/media?deleted=failed');

  const referenceChecks = await Promise.all([
    supabase.from('project_media').select('project_id').eq('media_id', id).limit(1),
    supabase.from('impact_evidence').select('id').eq('media_id', id).limit(1),
    supabase.from('studio_resources').select('id').eq('cover_media_id', id).limit(1),
    supabase.from('prompt_resources').select('id').eq('cover_media_id', id).limit(1),
    supabase.from('learning_paths').select('id').eq('cover_media_id', id).limit(1),
  ]);

  if (referenceChecks.some(({ data, error }) => error || (data?.length ?? 0) > 0)) {
    redirect('/admin/media?deleted=in-use');
  }

  const { error: storageError } = await supabase.storage
    .from(CMS_MEDIA_BUCKET)
    .remove([asset.storage_path]);

  if (storageError) redirect('/admin/media?deleted=failed');

  const { error: databaseError } = await supabase.from('media_assets').delete().eq('id', id);
  revalidatePath('/admin/media');
  redirect(`/admin/media?deleted=${databaseError ? 'failed' : 'true'}`);
}
