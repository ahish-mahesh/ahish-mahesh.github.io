import { profile } from './profile.ts';
import type { Education, ExperienceEntry } from './types.ts';

export const experience: readonly ExperienceEntry[] = [
  {
    id: 'vffice',
    org: 'Vffice',
    role: 'Back end developer',
    location: 'Montreal/Brossard',
    start: '2026-05',
    end: 'present',
    dateLabel: 'May 2026 to now',
    graphLabel: '2026-05',
    branch: 'main',
    note: 'started as the co-op, stayed on',
    bullets: [
      'Co-op May-Aug 2026, then part time from September.',
      'Designed a secured REST API connecting a production Microsoft Dynamics 365 Business Central ERP to external systems; extended AL modules for order sync and workflow validation.',
      "I build with Claude Code, Codex and Antigravity, and run Azure DevOps (Repos, Boards, Pipelines) daily through Microsoft's Azure DevOps MCP server.",
      '23 PRs across 3 repos, owning code review, testing and release. Piloted Graphify knowledge-graph documentation, which I now use across my projects.',
    ],
  },
  {
    id: 'concordia-ta',
    org: 'Concordia University',
    role: 'Teaching assistant',
    start: '2026-01',
    end: '2026',
    dateLabel: 'Winter 2026',
    graphLabel: '2026-01',
    branch: 'main',
    bullets: [
      'Data Structures and Algorithms (COMP 352).',
      'Programming and Problem Solving (COMP 6481).',
    ],
  },
  {
    id: 'kla-engineer',
    org: 'KLA Corporation',
    role: 'Software engineer',
    location: 'Chennai',
    start: '2021-07',
    end: '2024-11',
    dateLabel: 'Jul 2021 to Nov 2024',
    graphLabel: '2021-07',
    branch: 'main',
    bullets: [
      'C++/.NET metrology applications and the SQL Server HA tier (30% better query performance).',
      'Led the PostgreSQL migration, a team of three including me.',
      'Jenkins + MSTest pipeline: quarterly to weekly releases, -40% deployment time, -95% production bugs.',
      'Mentored four engineers; ran the division\'s weekly "Tech Junction" talks for ~80 people.',
      'On-site escalations and deployments in Korea, Japan and Singapore.',
    ],
    link: { href: '#project-kla-pg-migration', label: 'read the migration case study' },
    tag: { label: 'hackathon-2024', text: profile.award },
  },
  {
    id: 'kla-intern',
    org: 'KLA Corporation',
    role: 'Software engineering intern',
    location: 'Chennai',
    start: '2019',
    end: '2021',
    dateLabel: '2019-2021 (multiple terms)',
    graphLabel: '2019',
    branch: 'side',
    bullets: [
      'Migrated a legacy Windows data-management system to a web platform (ReactJS, Three.js, C# REST API, MSSQL): 500+ users, -25% maintenance cost.',
      'Placement offer, 8 of 70+ candidates.',
    ],
  },
  {
    id: 'code-khadi',
    org: 'Code Khadi',
    role: 'Machine learning intern',
    location: 'Coimbatore',
    start: '2018-05',
    end: '2018-07',
    dateLabel: 'May-Jul 2018',
    graphLabel: '2018-05',
    branch: 'main',
    bullets: ['Medical assistant chatbot (Dialogflow, Python, NLP).'],
  },
];

export const education: readonly Education[] = [
  {
    school: 'Concordia University',
    degree: 'Master of Applied Computer Science (Co-op)',
    dates: 'expected Dec 2026',
    gpa: 'GPA 4.03/4.30',
  },
  {
    school: 'PSG College of Technology',
    degree: 'Integrated M.Sc. Software Systems',
    dates: '2016-2021',
  },
];
