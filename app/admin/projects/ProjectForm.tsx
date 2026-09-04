'use client';

import { useActionState, useState } from 'react';
import type { ProjectActionState, ProjectRow } from '@/lib/admin/projects';
import { initialProjectActionState, projectStatuses, projectTones } from '@/lib/admin/projects';
import type { MediaAsset } from '@/lib/admin/media';
import { mediaPublicUrl } from '@/lib/admin/media';
import { createProject, updateProject } from './actions';
import styles from './projects.module.css';

type Props = { project?: ProjectRow; mediaAssets: MediaAsset[]; currentCoverId?: string; supabaseUrl: string };

function FieldError({ state, name }: { state: ProjectActionState; name: string }) {
  const message = state.fieldErrors[name]?.[0];
  return message ? <span className={styles.fieldError}>{message}</span> : null;
}

export function ProjectForm({ project, mediaAssets, currentCoverId = '', supabaseUrl }: Props) {
  const action = project ? updateProject.bind(null, project.id) : createProject;
  const [state, formAction, pending] = useActionState(action, initialProjectActionState);
  const [coverId, setCoverId] = useState(currentCoverId);
  const selectedCover = mediaAssets.find((asset) => asset.id === coverId);

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
          <span>04</span><div><h2>Cover image</h2><p>Select a public image already uploaded to the Media Library.</p></div>
        </div>
        <div className={styles.coverPicker}>
          <label>Project cover
            <select name="cover_media_id" value={coverId} onChange={(event) => setCoverId(event.target.value)}>
              <option value="">No cover image — use styled fallback</option>
              {mediaAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.file_name} — {asset.alt_text}</option>)}
            </select>
            <FieldError state={state} name="cover_media_id" />
          </label>
          {selectedCover ? <div className={styles.coverPreview}><img src={mediaPublicUrl(supabaseUrl, selectedCover.storage_path)} alt={selectedCover.alt_text} /><div><strong>{selectedCover.file_name}</strong><small>{selectedCover.alt_text}</small></div></div> : <div className={styles.coverFallback}><strong>{project?.display_title ?? 'PROJECT'}</strong><small>The existing visual design will be used.</small></div>}
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
