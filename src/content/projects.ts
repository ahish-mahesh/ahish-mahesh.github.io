import type { ArchiveProject, Project } from './types.ts';

const agentNotesDiagram = `mic ──▶ AudioCapture ──▶ ring buffer ──▶ WhisperTranscriber
        (RtAudio/PA)                     (whisper.cpp)
                                               │
                                          transcript
                                               │
                                               ▼
SQLite ◀── DBHelper ◀── summary ◀── LLMClient (llama.cpp, Qwen 2.5 0.5B)`;

export const projects: readonly Project[] = [
  {
    pid: 102,
    slug: 'kla-pg-migration',
    name: 'kla-pg-migration',
    title: 'KLA: MSSQL to multi-node PostgreSQL migration',
    headline: 'A zero-code move from an MSSQL high-availability cluster to multi-node PostgreSQL.',
    stack: ['PostgreSQL', 'Babelfish', 'T-SQL'],
    metric: '1,200 queries, -25% cost',
    visual: 'migration',
    summary:
      'I analysed 30+ product cost components and found the MSSQL high-availability cluster was ~20% of product cost.',
    bullets: [
      'Analysed 30+ product cost components; the MSSQL high-availability cluster was ~20% of product cost.',
      'Led three engineers through a zero-code migration to a multi-node PostgreSQL cluster using Babelfish, translating 1,200+ queries.',
      'Product cost down 25%; opened the product to smaller customers; ~$2M annual revenue from 3 new customers.',
    ],
  },
  {
    pid: 101,
    slug: 'agent-notes-cpp',
    name: 'agent-notes-cpp',
    title: 'agent-notes-cpp',
    headline: 'Records a lecture or meeting and returns a summary, entirely on your laptop.',
    stack: ['C++17', 'whisper.cpp', 'llama.cpp'],
    fullStack: ['C++17', 'whisper.cpp', 'llama.cpp', 'SQLite', 'RtAudio/PortAudio', 'CMake'],
    metric: '16x real-time',
    summary:
      'Records a lecture or meeting and returns a summary. Nothing leaves the machine: Whisper and Qwen 2.5 0.5B run locally.',
    bullets: [
      'Nothing leaves the machine: Whisper and Qwen 2.5 0.5B run locally.',
      '16x real-time transcription via a multi-threaded pipeline.',
      'Audio to summary in under 2 seconds on an M-series MacBook.',
      '92% transcription accuracy across 8 languages.',
    ],
    repo: 'https://github.com/ahish-mahesh/agent-notes-cpp',
    diagram: agentNotesDiagram,
    visual: 'pipeline',
    diagramCaption:
      'pipeline: mic to AudioCapture to ring buffer to WhisperTranscriber, transcript to LLMClient, summary to DBHelper to SQLite.',
  },
  {
    pid: 103,
    slug: 'agent-goal',
    name: 'agent-goal',
    title: 'agent-goal',
    headline:
      'A goal tracker whose planning agent argues you down from "get fit" to something you can do on a Tuesday.',
    stack: ['React Native', 'Supabase', 'Gemini'],
    fullStack: ['React Native/Expo', 'TypeScript', 'Supabase (Auth + RLS)', 'Gemini API'],
    metric: '<100ms sync',
    summary:
      'A goal tracker with a planning agent that argues you down from "get fit" to something you can do on a Tuesday. iOS and Android.',
    bullets: [
      'Runs on iOS and Android.',
      'Built with two other people; the Supabase schema, the row-level security policies and the sync layer are mine.',
      '<100ms cross-device sync for 1,000+ goals and analytics events.',
    ],
    repo: 'https://github.com/ahish-mahesh/agent-goal',
  },
  {
    pid: 104,
    slug: 'project5k-bot',
    name: 'project5k-bot',
    title: 'project5k-bot',
    headline: 'A Discord bot that nags friends about the gym, running TinyLlama on the host.',
    stack: ['Python', 'llama-cpp', 'TinyLlama'],
    fullStack: ['Python', 'discord.py', 'llama-cpp-python', 'Firebase Firestore'],
    metric: '3s -> 900ms',
    summary:
      'A Discord bot that nags friends about the gym. Runs TinyLlama on the host rather than calling an API.',
    bullets: [
      "Runs TinyLlama on the host rather than calling an API, so nobody's workout log goes anywhere.",
      'Metal acceleration on Apple Silicon took inference from 3s to 900ms.',
    ],
    repo: 'https://github.com/ahish-mahesh/project5k-bot',
  },
];

export const archive: readonly ArchiveProject[] = [
  {
    name: 'EchoNews',
    description: 'LSI/SVD news recommender',
    repo: 'https://github.com/ahish-mahesh/EchoNews',
  },
  {
    name: 'SMS-Classification',
    description: 'FIEL semi-supervised, 91% accuracy',
    repo: 'https://github.com/ahish-mahesh/SMS-Classification',
  },
  { name: 'Newsify', repo: 'https://github.com/ahish-mahesh/Newsify-Backend' },
  { name: 'Outlander', description: 'C++/Arduino rocker-bogie robot' },
];
