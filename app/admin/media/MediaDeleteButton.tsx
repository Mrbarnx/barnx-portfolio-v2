'use client';

import { Trash2 } from 'lucide-react';
import { deleteMediaAsset } from './actions';
import styles from './media.module.css';

export function MediaDeleteButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteMediaAsset}
      onSubmit={(event) => {
        if (!window.confirm(`Delete “${name}” permanently? Only continue if it is not used by a project.`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className={styles.deleteButton} type="submit"><Trash2 /> Delete</button>
    </form>
  );
}
