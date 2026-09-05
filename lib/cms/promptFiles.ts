import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

const promptFiles: Record<string, string> = {
  'ai-code-review-prompts': 'ai-code-review-prompt-pack.md',
  'codev-os': 'codev-os-evidence-driven-ai-software-engineering-framework.md',
};

export function readPromptSource(slug: string) {
  const fileName = promptFiles[slug];
  if (!fileName) return '';

  try {
    return fs.readFileSync(path.join(process.cwd(), 'public', 'downloads', fileName), 'utf8');
  } catch {
    return '';
  }
}
