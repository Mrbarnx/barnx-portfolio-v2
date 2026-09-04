'use client';

import { useActionState, useState } from 'react';
import type { ProjectActionState, ProjectRow } from '@/lib/admin/projects';
import { initialProjectActionState, projectStatuses, projectTones } from '@/lib/admin/projects';
import type { MediaAsset } from '@/lib/admin/media';
import { mediaPublicUrl } from '@/lib/admin/media';
import { createProject, updateProject } from './actions';
import styles from './projects.module.css';

type Props = {
  project?: ProjectRow;
  mediaAssets: MediaAsset[];
  currentCoverId?: string;
  currentGalleryIds?: string[];
  currentVideoPosterId?: string;
  currentPrivateVideoUrl?: string;
  supabaseUrl: string;
};

function FieldError({ state, name }: { state: ProjectActionState; name: string }) {
  const message = state.fieldErrors[name]?.[0];
  return message ? <span className={styles.fieldError}>{message}</span> : null;
}

export function ProjectForm({
  project,
  mediaAssets,
  currentCoverId = '',
  currentGalleryIds = [],
  currentVideoPosterId = '',
  currentPrivateVideoUrl = '',
  supabaseUrl,
}: Props) {
  const action = project ? updateProject.bind(null, project.id) : createProject;
  const [state, formAction, pending] = useActionState(action, initialProjectActionState);
  const [coverId, setCoverId] = useState(currentCoverId);
  const [galleryIds, setGalleryIds] = useState(currentGalleryIds);
  const [videoVisibility, setVideoVisibility] = useState(project?.demo_visibility ?? 'none');
  const [videoPosterId, setVideoPosterId] = useState(currentVideoPosterId);
  const selectedCover = mediaAssets.find((asset) => asset.id === coverId);

  function toggleGallery(mediaId: string) {
    setGalleryIds((current) => current.includes(mediaId) ? current.filter((id) => id !== mediaId) : [...current, mediaId]);
  }

  function moveGallery(mediaId: string, direction: -1 | 1) {
    setGalleryIds((current) => {
      const from = current.indexOf(mediaId);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }

  return (
    <form action={formAction} className={styles.projectForm}>
      {state.error ? <div className={styles.formError} role="alert">{state.error}</div> : null}

      <section className={styles.formSection}>
        <div className={styles.sectionHeading}>
          <span>01</span><div><h2>Identity</h2><p>How the project appears in cards, URLs and filters.</p></div>
        </div>
        <div className={styles.fieldGrid}>
          <label>Project title<input name="title" defaultValue={project?.title} required /><FieldError state={state} name="title" /></label>
          <label>Display title<input name="display_title" defaultValue={project?.display_title} required /><FieldError state={state} name="display_title" /></label>
          <label>Slug<input name="slug" defaultValue={project?.slug} placeholder="my-project" required /><FieldError state={state} name="slug" /></label>
          <label>Category<input name="category" defaultValue={project?.category} placeholder="Full-Stack Product" required /><FieldError state={state} name="category" /></label>
          <label>Status<select name="status" defaultValue={project?.status ?? 'in_development'}>{projectStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Visual tone<select name="tone" defaultValue={project?.tone ?? 'light'}>{projectTones.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Sort order<input name="sort_order" type="number" min="0" max="9999" defaultValue={project?.sort_order ?? 0} required /><FieldError state={state} name="sort_order" /></label>
          <label className={styles.checkboxLabel}><input name="featured" type="checkbox" defaultChecked={project?.featured} /><span><strong>Featured project</strong><small>Eligible for prominent placement when the public site is connected.</small></span></label>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.sectionHeading}>
          <span>02</span><div><h2>Story</h2><p>The readable case-study content behind the project.</p></div>
        </div>
        <div className={styles.stackFields}>
          <label>Short summary<textarea name="short_summary" rows={3} defaultValue={project?.short_summary} required /><FieldError state={state} name="short_summary" /></label>
          <label>Overview<textarea name="overview" rows={4} defaultValue={project?.overview} required /><FieldError state={state} name="overview" /></label>
          <label>Visual subtitle<input name="visual_subtitle" defaultValue={project?.visual_subtitle} /></label>
          <label>Problem<textarea name="problem" rows={4} defaultValue={project?.problem} required /><FieldError state={state} name="problem" /></label>
          <label>Solution<textarea name="solution" rows={4} defaultValue={project?.solution} required /><FieldError state={state} name="solution" /></label>
          <label>Your role<input name="role" defaultValue={project?.role} required /><FieldError state={state} name="role" /></label>
          <label>Challenges<textarea name="challenges" rows={3} defaultValue={project?.challenges} /></label>
          <label>Lessons<textarea name="lessons" rows={3} defaultValue={project?.lessons} /></label>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.sectionHeading}>
          <span>03</span><div><h2>Details & links</h2><p>Use one item per line or separate items with commas.</p></div>
        </div>
        <div className={styles.stackFields}>
          <label>Features<textarea name="features" rows={5} defaultValue={project?.features.join('\n')} placeholder={'Responsive dashboard\nAuthentication flow'} /></label>
          <label>Technologies<textarea name="technologies" rows={4} defaultValue={project?.technologies.join('\n')} placeholder={'Next.js\nTypeScript\nSupabase'} /></label>
          <div className={styles.fieldGrid}>
            <label>Live URL<input name="live_url" type="url" defaultValue={project?.live_url ?? ''} placeholder="https://" /><FieldError state={state} name="live_url" /></label>
            <label>GitHub URL<input name="github_url" type="url" defaultValue={project?.github_url ?? ''} placeholder="https://github.com/" /><FieldError state={state} name="github_url" /></label>
          </div>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.sectionHeading}>
          <span>04</span><div><h2>Project media</h2><p>Use one image for cards, then arrange full screenshots for the project page.</p></div>
        </div>
        <div className={styles.coverPicker}>
          <label>Card cover image
            <select name="cover_media_id" value={coverId} onChange={(event) => setCoverId(event.target.value)}>
              <option value="">No cover image — use styled fallback</option>
              {mediaAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.file_name} — {asset.alt_text}</option>)}
            </select>
            <FieldError state={state} name="cover_media_id" />
          </label>
          {selectedCover ? <div className={styles.coverPreview}><img src={mediaPublicUrl(supabaseUrl, selectedCover.storage_path)} alt={selectedCover.alt_text} /><div><strong>{selectedCover.file_name}</strong><small>Cards use a controlled wide crop. The project page keeps full screenshots visible.</small></div></div> : <div className={styles.coverFallback}><strong>{project?.display_title ?? 'PROJECT'}</strong><small>The existing styled fallback remains active.</small></div>}
        </div>

        <input name="gallery_media_ids" type="hidden" value={JSON.stringify(galleryIds)} readOnly />
        <div className={styles.galleryHeading}><div><h3>Project gallery</h3><p>Select screenshots and use the arrows to choose their viewing order.</p></div><span>{galleryIds.length} selected</span></div>
        {mediaAssets.length ? <div className={styles.galleryPicker}>
          {mediaAssets.map((asset) => {
            const selected = galleryIds.includes(asset.id);
            const position = galleryIds.indexOf(asset.id);
            return <article className={selected ? styles.gallerySelected : ''} key={asset.id}>
              <button className={styles.galleryToggle} type="button" onClick={() => toggleGallery(asset.id)} aria-pressed={selected}>
                <img src={mediaPublicUrl(supabaseUrl, asset.storage_path)} alt="" />
                <span><strong>{asset.file_name}</strong><small>{asset.alt_text}</small></span>
              </button>
              {selected ? <div className={styles.galleryOrder}>
                <span>{position + 1}</span>
                <button type="button" onClick={() => moveGallery(asset.id, -1)} disabled={position === 0} aria-label={`Move ${asset.file_name} earlier`}>↑</button>
                <button type="button" onClick={() => moveGallery(asset.id, 1)} disabled={position === galleryIds.length - 1} aria-label={`Move ${asset.file_name} later`}>↓</button>
              </div> : null}
            </article>;
          })}
        </div> : <p className={styles.emptyMedia}>Upload images in the Media Library before building a gallery.</p>}
        <FieldError state={state} name="gallery_media_ids" />
      </section>

      <section className={styles.formSection}>
        <div className={styles.sectionHeading}>
          <span>05</span><div><h2>Video demo</h2><p>Add a YouTube, Vimeo or Loom link. Video is never uploaded to this CMS.</p></div>
        </div>
        <div className={styles.stackFields}>
          <label>Visitor access
            <select name="demo_visibility" value={videoVisibility} onChange={(event) => setVideoVisibility(event.target.value as typeof videoVisibility)}>
              <option value="none">No video</option>
              <option value="public">Public external video</option>
              <option value="unlisted">Unlisted external demo</option>
              <option value="private">Private — request access</option>
            </select>
          </label>
          {videoVisibility !== 'none' ? <label>Video button title<input name="demo_video_title" defaultValue={project?.demo_video_title ?? ''} placeholder="Watch product walkthrough" /><FieldError state={state} name="demo_video_title" /></label> : <input name="demo_video_title" type="hidden" value="" />}
          {videoVisibility === 'public' || videoVisibility === 'unlisted' ? <>
            <label>External video URL<input name="demo_video_url" type="url" defaultValue={project?.demo_video_url ?? ''} placeholder="https://youtube.com/…, https://vimeo.com/… or https://loom.com/…" required /><FieldError state={state} name="demo_video_url" /></label>
            <label>Video poster image
              <select name="video_poster_media_id" value={videoPosterId} onChange={(event) => setVideoPosterId(event.target.value)}>
                <option value="">Use the project cover</option>
                {mediaAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.file_name} — {asset.alt_text}</option>)}
              </select>
            </label>
            <div className={styles.privacyNote}><strong>{videoVisibility === 'unlisted' ? 'Unlisted is not private.' : 'Public demo.'}</strong><small>The player loads only after a visitor chooses Watch video. Anyone who can view the project can share the external link.</small></div>
          </> : <><input name="demo_video_url" type="hidden" value="" /><input name="video_poster_media_id" type="hidden" value="" /></>}
          {videoVisibility === 'private' ? <>
            <label>Private external URL <span>optional, admin-only</span><input name="private_video_url" type="url" defaultValue={currentPrivateVideoUrl} placeholder="https://" /><FieldError state={state} name="private_video_url" /></label>
            <div className={styles.privateNote}><strong>Protected from the public API.</strong><small>Visitors see Request private demo. This URL is stored in an admin-only table and is never sent to the public project page.</small></div>
          </> : <input name="private_video_url" type="hidden" value="" />}
        </div>
      </section>

      <footer className={styles.formActions}>
        <p>{project?.published ? 'This project is currently published in the CMS database.' : 'This project is currently a CMS draft.'}</p>
        <div>
          <button className={styles.secondaryButton} name="intent" value="draft" type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save draft'}</button>
          <button className={styles.primaryButton} name="intent" value="publish" type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save & publish'}</button>
        </div>
      </footer>
    </form>
  );
}
