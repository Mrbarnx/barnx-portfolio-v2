'use client';

import { archiveProject } from './actions';
import styles from './projects.module.css';

export function ArchiveProjectButton({ id }: { id: string }) {
  return (
    <form
      action={archiveProject}
      onSubmit={(event) => {
        if (!window.confirm('Archive this project? It will be unpublished and removed from featured content.')) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className={styles.dangerButton} type="submit">Archive project</button>
    </form>
  );
}
