import type { Profile } from './types.ts';

const status =
  'Open to full-time roles from January 2027 in Montreal or Ontario. Open work permit, no sponsorship needed.';

export const profile: Profile = {
  name: 'Ahish Mahesh',
  oneLiner:
    'Software engineer. LLM features on a production backend, plus the database tier underneath.',
  background:
    "Back end developer at Vffice. Software engineer at KLA from 2021 to 2024. CS master's at Concordia, finishing December 2026.",
  status,
  facts: [
    { key: 'now', value: 'back end developer, Vffice' },
    { key: 'before', value: 'software engineer, KLA, 2021 to 2024' },
    { key: 'school', value: "CS master's, Concordia, finishing December 2026" },
    { key: 'status', value: status },
  ],
  email: 'ahish.mahesh@gmail.com',
  links: {
    github: 'https://github.com/ahish-mahesh',
    linkedin: 'https://linkedin.com/in/ahish-mahesh',
    resume: '/resume.pdf',
  },
  location:
    'Open to opportunities in Montreal and Ontario. I prefer hybrid, and I am happy to move around anywhere on the east coast.',
  availability: 'Graduating December 2026, can start full time in January 2027.',
  workAuthorization:
    "Post-Graduation Work Permit from January 2027. It's an open permit, so there's no sponsorship, no LMIA, and nothing for an employer to file.",
  award: '1st place, KLA Hackathon 2024',
  signOff: 'controllers: montreal. console: india. eta: unknown.',
};
