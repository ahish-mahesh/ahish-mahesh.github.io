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
    pid: 101,
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
      'Led a team of three, me included, through a zero-code migration to a multi-node PostgreSQL cluster using Babelfish, translating 1,200+ queries.',
      'Product cost down 25%; opened the product to smaller customers; ~$2M annual revenue from 3 new customers.',
    ],
  },
  {
    pid: 102,
    slug: 'agent-goal',
    name: 'agent-goal',
    title: 'agent-goal (Goal Genie)',
    headline:
      'A goal tracker whose planning agent argues you down from "get fit" to something you can do on a Tuesday.',
    stack: ['React Native', 'Supabase', 'Gemini'],
    fullStack: [
      'React Native/Expo',
      'TypeScript',
      'Supabase (Auth, Edge Functions)',
      'Deno',
      'Gemini API',
    ],
    metric: 'gemini 2.5 flash',
    summary:
      'A goal tracker with a planning agent that argues you down from "get fit" to something you can do on a Tuesday. iOS and Android.',
    bullets: [
      'A Supabase Edge Function (Deno) calls Gemini 2.5 Flash with a SMART-goal mentor prompt I wrote.',
      'Each chat gets a Gemini context cache. The cache name lives in Supabase, and short chats below the token threshold send the full prompt instead.',
      'Supabase Auth with Google Sign-In, and a daily push-notification edge function. Runs on iOS and Android.',
      'Built with two other people; I was the only engineer and wrote all of the code.',
    ],
    repo: 'https://github.com/ahish-mahesh/agent-goal',
  },
  {
    pid: 103,
    slug: 'agent-notes-cpp',
    name: 'agent-notes-cpp',
    title: 'agent-notes-cpp',
    headline: 'Records a lecture or meeting and returns a summary, entirely on your laptop.',
    stack: ['C++17', 'whisper.cpp', 'llama.cpp'],
    fullStack: [
      'C++17',
      'whisper.cpp',
      'llama.cpp (server)',
      'SQLite',
      'RtAudio/PortAudio',
      'CMake',
    ],
    metric: '16x real-time',
    summary:
      'Records a lecture or meeting and returns a structured summary. Nothing leaves the machine: Whisper and Qwen 2.5 0.5B run locally.',
    bullets: [
      'Nothing leaves the machine: Whisper and Qwen 2.5 0.5B run locally.',
      'whisper.cpp transcribes microphone audio in real time on its own processing thread: 16x real-time with Whisper base.en on a MacBook Air M2.',
      'Qwen 2.5 0.5B runs in a background llama.cpp server the app manages, and writes structured summaries from a system and format prompt.',
      'SQLite stores every transcript and summary.',
    ],
    repo: 'https://github.com/ahish-mahesh/agent-notes-cpp',
    diagram: agentNotesDiagram,
    visual: 'pipeline',
    diagramCaption:
      'pipeline: mic to AudioCapture to ring buffer to WhisperTranscriber, transcript to LLMClient, summary to DBHelper to SQLite.',
  },
  {
    pid: 104,
    slug: 'project5k-bot',
    name: 'project5k-bot',
    title: 'project5k-bot',
    headline: 'A Discord bot that nags friends about the gym, with an LLM doing the nagging.',
    stack: ['Python', 'llama-cpp', 'Gemini'],
    fullStack: [
      'Python',
      'discord.py',
      'llama-cpp-python',
      'Gemini API',
      'Firebase Firestore',
      'APScheduler',
      'Google Calendar API',
    ],
    metric: 'local llm + gemini',
    summary:
      'A Discord bot that nags friends about the gym: streaks, workout plans on Google Calendar, and LLM coaching.',
    bullets: [
      'Slash commands, streak tracking on scheduled jobs (APScheduler), and workout plans scheduled to Google Calendar.',
      'Coaching comes from local models through llama-cpp-python: Mistral 7B, then TinyLlama, then Phi-2, with prompts written for small models.',
      'A separate branch swaps the local model for the Gemini API.',
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
