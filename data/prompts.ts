export type PromptResource = {
  number: string;
  slug: string;
  title: string;
  category: string;
  short: string;
  description: string;
  bestFor: string;
  tools: string[];
  tutorial: string[];
  download: string;
  sourceFile: string;
};

export const promptLibrary: PromptResource[] = [
  {
    number: '01',
    slug: 'ai-code-review-prompts',
    title: 'AI Code Review Prompt Pack',
    category: 'Code Review',
    short: 'Structured prompts for sharper frontend architecture, accessibility and performance reviews.',
    description: 'A focused review pack for developers who want AI feedback that points to specific code risks instead of generic suggestions.',
    bestFor: 'Developers using AI as a second-pass reviewer before refactoring, opening a pull request or shipping frontend work.',
    tools: ['ChatGPT', 'Claude', 'Cursor', 'Codex'],
    tutorial: [
      'Choose the review angle that matches the problem: architecture, accessibility or performance.',
      'Paste the relevant component, page or diff together with enough surrounding context to understand it.',
      'Run the prompt and ask the AI to rank findings by impact rather than changing everything at once.',
      'Verify each recommendation against the actual code and runtime behavior before applying it.'
    ],
    download: '/downloads/ai-code-review-prompt-pack.md',
    sourceFile: 'public/downloads/ai-code-review-prompt-pack.md'
  },
  {
    number: '02',
    slug: 'codev-os',
    title: 'CoDev OS',
    category: 'Engineering Workflow',
    short: 'An evidence-driven AI software engineering framework for building safely with coding agents.',
    description: 'A structured AI-assisted development workflow for safely architecting, implementing, debugging, testing and shipping production software with coding agents.',
    bestFor: 'Developers and vibe coders who want an AI coding partner to inspect evidence, protect working systems, implement in small stages and verify before calling work complete.',
    tools: ['Codex', 'Claude Code', 'Cursor', 'Copilot', 'Windsurf'],
    tutorial: [
      'Start a fresh AI coding or planning chat and paste CoDev OS as the system-level working framework.',
      'Give the AI the real repository context, screenshots, API contracts, errors or runtime evidence relevant to the current task.',
      'Work in one small implementation stage at a time and keep unrelated files or working architecture protected.',
      'Require static checks and targeted runtime verification before accepting a stage as complete.'
    ],
    download: '/downloads/codev-os-evidence-driven-ai-software-engineering-framework.md',
    sourceFile: 'public/downloads/codev-os-evidence-driven-ai-software-engineering-framework.md'
  }
];
