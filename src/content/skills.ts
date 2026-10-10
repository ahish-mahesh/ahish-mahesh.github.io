import type { SkillRow } from './types.ts';

export const neofetchTitle = 'ahish@montreal';

export const neofetchLogo = String.raw`  ___  __  __
 / _ \|  \/  |
| |_| | |\/| |
|  _  | |  | |
|_| |_|_|  |_|`;

export const skills: readonly SkillRow[] = [
  { key: 'languages', values: ['Python', 'TypeScript/JavaScript', 'C#/.NET', 'C++', 'SQL', 'AL'] },
  {
    key: 'llm',
    values: [
      'Gemini API',
      'context caching',
      'prompt engineering',
      'llama.cpp',
      'llama-cpp-python',
    ],
  },
  { key: 'models', values: ['Qwen 2.5', 'TinyLlama', 'Phi-2', 'Whisper'] },
  {
    key: 'backend',
    values: [
      'REST APIs',
      'Supabase Edge Functions (Deno)',
      'Supabase Auth',
      'Google Sign-In',
      'event-driven apps',
    ],
  },
  {
    key: 'data',
    values: ['PostgreSQL', 'SQL Server (HA)', 'SQLite', 'Firestore', 'schema migration'],
  },
  { key: 'interfaces', values: ['React', 'React Native', 'Three.js'] },
  {
    key: 'devops',
    values: ['Azure DevOps', 'Google Cloud', 'Docker', 'Git', 'Jenkins', 'CI/CD', 'MSTest'],
  },
  {
    key: 'ai tooling',
    values: [
      'Claude Code',
      'Codex',
      'Antigravity',
      'MCP servers',
      'Graphify',
      'custom agent skills',
    ],
  },
  { key: 'erp', values: ['Microsoft Dynamics 365 Business Central (AL)'] },
  { key: 'spoken', values: ['English', 'Tamil', 'Malayalam (conversational)', 'French (A1/A2)'] },
];
