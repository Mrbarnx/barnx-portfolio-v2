export const CMS_MEDIA_BUCKET = 'cms-media';
export const MAX_MEDIA_SIZE = 8 * 1024 * 1024;
export const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'] as const;

export type MediaAsset = {
  id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  alt_text: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  is_public: boolean;
  created_at: string;
};

export function mediaPublicUrl(supabaseUrl: string, storagePath: string) {
  const encodedPath = storagePath.split('/').map(encodeURIComponent).join('/');
  return `${supabaseUrl}/storage/v1/object/public/${CMS_MEDIA_BUCKET}/${encodedPath}`;
}
