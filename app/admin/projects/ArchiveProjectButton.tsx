'use client';

import { archiveProject, restoreProject } from './actions';
import styles from './projects.module.css';

export function ArchiveProjectButton({ id, isArchived }: { id: string; isArchived: boolean }) {
  if (isArchived) {
    return (
      <form action={restoreProject}>
        <input type="hidden" name="id" value={id} />
        <button className={styles.restoreButton} type="submit">Restore project</button>
      </form>
    );
  }

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
