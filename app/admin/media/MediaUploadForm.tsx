'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { acceptedImageTypes, CMS_MEDIA_BUCKET, MAX_MEDIA_SIZE } from '@/lib/admin/media';
import styles from './media.module.css';

const extensionByType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

async function imageDimensions(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    const loaded = new Promise<{ width: number; height: number }>((resolve, reject) => {
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error('The selected image could not be read.'));
    });
    image.src = url;
    return await loaded;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function MediaUploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get('file');
    const altText = String(formData.get('alt_text') ?? '').trim();
    const caption = String(formData.get('caption') ?? '').trim();

    try {
      if (!(file instanceof File) || file.size === 0) throw new Error('Choose an image to upload.');
      if (!acceptedImageTypes.includes(file.type as (typeof acceptedImageTypes)[number])) throw new Error('Use a JPG, PNG, WebP, AVIF or GIF image.');
      if (file.size > MAX_MEDIA_SIZE) throw new Error('The image must be 8 MB or smaller.');
      if (!altText) throw new Error('Add useful alt text for accessibility.');

      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Your admin session expired. Sign in again.');

      const dimensions = await imageDimensions(file);
      const extension = extensionByType[file.type];
      const storagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from(CMS_MEDIA_BUCKET)
        .upload(storagePath, file, { contentType: file.type, cacheControl: '31536000', upsert: false });

      if (uploadError) {
        if (uploadError.message.toLowerCase().includes('bucket')) throw new Error('Media Storage is not ready yet. Run the Phase 5 Storage migration first.');
        throw new Error(uploadError.message);
      }

      const { error: metadataError } = await supabase.from('media_assets').insert({
        storage_path: storagePath,
        file_name: file.name,
        mime_type: file.type,
        alt_text: altText,
        caption: caption || null,
        width: dimensions.width,
        height: dimensions.height,
        size_bytes: file.size,
        is_public: true,
        created_by: user.id,
      });

      if (metadataError) {
        await supabase.storage.from(CMS_MEDIA_BUCKET).remove([storagePath]);
        throw new Error('The image uploaded, but its CMS record failed. The uploaded file was cleaned up safely.');
      }

      formRef.current?.reset();
      setMessage('Image uploaded successfully.');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The image could not be uploaded.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.uploadForm} onSubmit={upload} ref={formRef}>
      <div className={styles.uploadHeading}><ImagePlus /><div><h2>Upload image</h2><p>JPG, PNG, WebP, AVIF or GIF · maximum 8 MB</p></div></div>
      <label>Image file<input name="file" type="file" accept={acceptedImageTypes.join(',')} required /></label>
      <label>Alt text<input name="alt_text" placeholder="Describe what the image shows" required /></label>
      <label>Caption <span>optional</span><input name="caption" placeholder="Internal or public context" /></label>
      <div className={styles.publicNotice}><strong>Public portfolio image</strong><small>Anyone with the image URL can view it. Do not upload private or sensitive files.</small></div>
      {message ? <p className={styles.uploadMessage} role="status">{message}</p> : null}
      <button className={styles.uploadButton} type="submit" disabled={pending}>{pending ? 'Uploading…' : 'Upload image'}</button>
    </form>
  );
}
