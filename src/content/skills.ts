import type { SkillRow } from './types.ts';

export const neofetchTitle = 'ahish@montreal';

export const skills: readonly SkillRow[] = [
  { key: 'languages', values: ['C++', 'C#/.NET', 'Python', 'TypeScript', 'Java', 'SQL'] },
  { key: 'data', values: ['PostgreSQL', 'SQL Server', 'schema migration', 'HA', 'REST APIs'] },
  { key: 'services', values: ['Supabase', 'Firebase', 'GCP'] },
  { key: 'models', values: ['whisper.cpp', 'llama.cpp', 'Gemini API', 'on-device inference'] },
  { key: 'interfaces', values: ['React', 'React Native', 'Three.js'] },
  { key: 'tooling', values: ['Git', 'Jenkins', 'CMake', 'MSTest'] },
  { key: 'erp', values: ['Microsoft Dynamics 365 Business Central (AL)'] },
  { key: 'spoken', values: ['English', 'Tamil', 'Malayalam (conversational)', 'French (A1/A2)'] },
];
