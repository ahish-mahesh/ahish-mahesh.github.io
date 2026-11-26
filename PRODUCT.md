# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: recruiters and hiring managers in Montreal and Toronto. They should learn who Ahish is, what he has shipped, and how to contact him within one second of load and thirty seconds of scrolling. Secondary: engineers who open the terminal easter egg or follow the repo links.

## Product Purpose

A personal portfolio for Ahish Mahesh, a software engineer who builds LLM features on a production backend (Gemini and local models on top of C++, C#/.NET, Python and the database tier). Success is a recruiter contacting him. It is also a learning project for front-end skills (React, TypeScript, animation, R3F, performance, testing, CI/CD), so approaches that teach are preferred over hiding everything in a dependency.

## Positioning

Every claim is backed by a real number from shipped work (a 1,200-query MSSQL to Babelfish migration, 16x real-time local transcription), told in the dry, understated voice of his GitHub README. The terminal skin and ASCII 3D database hero are the single wow moment; everything else is readable and fast.

## Operating Context

Static single-page site on GitHub Pages at https://ahish-mahesh.github.io (user site, Vite `base: '/'`), deployed by GitHub Actions. Graduates Dec 2026, available full time Jan 2027, Post-Graduation Work Permit (open permit, no sponsorship). Prefers hybrid in Montreal, open to Toronto.

## Capabilities and Constraints

- Stack: Vite, React 19, TypeScript strict, CSS Modules with custom properties, Motion, three + R3F + drei (hero only), Vitest/RTL, Playwright smoke test, Lighthouse CI.
- Motion enhances, never gates: all content is semantic HTML on first paint; heavy code (3D, terminal) lazy-loads; `prefers-reduced-motion` disables decode, scroll-drawing, background motion, boot sequence, and swaps the 3D hero for a static ASCII frame.
- Sections in order: hero, what I've shipped (htop-style projects), where I've worked (git log timeline), what I reach for (neofetch skills), saying hello (contact).
- Three user-switchable themes (paper light is the default, with phosphor dark and amber; a stored choice wins), AA contrast required in all.
- Quake-style drop-down terminal easter egg driven by the same content data as the page.
- Targets: Lighthouse mobile Performance >= 90, Accessibility 100, Best Practices >= 95, SEO 100; LCP < 2.5s with hero text as LCP; CLS < 0.05; initial JS <= ~150KB gzip.
- No phone number, no contact form, English only for v1 (French is A1/A2; do not imply working proficiency).
- Never claim: RAG/embeddings/vector search in Agent Notes, direct OpenAI/Anthropic API use, Supabase RLS, unsupported metrics listed in CLAUDE.md section 6, or bare "Azure".
- Content facts live in CLAUDE.md section 5 and `src/content/*`; no invented numbers.

## Brand Commitments

Name: Ahish Mahesh. Voice: first person, active, understated, specific, dry humor; lowercase section headings; no em-dashes; no buzzwords ("passionate", "leverage", "results-driven"). Credit collaborators (agent-goal built with two others; the migration was a team of three). If mentioning AI tooling used to build the site, name Claude Code. Terminal/monospace identity with JetBrains Mono (a later refresh moved to Plex per project notes; defer to the shipped code).

## Evidence on Hand

Real projects and metrics in CLAUDE.md section 5: KLA PostgreSQL/Babelfish migration (no public repo; use only generic illustrative queries), agent-goal, agent-notes-cpp, project5k-bot (public repos under github.com/ahish-mahesh), plus an archive list. Softchoice resume as `public/resume.pdf` (phone number stripped). No testimonials, no photo or avatar (default decision: fully typographic). Do not fabricate customers, press, or benchmarks.

## Product Principles

1. Recruiter-first: identity, proof and contact must be legible before any effect completes.
2. Motion enhances, never gates; every effect is skippable or runs once.
3. Every claim carries a number or concrete detail, and comes from the content source of truth.
4. Polished like a product site, skinned like a terminal; one wow moment, the rest fast.
5. Build choices should teach: prefer understanding over opaque dependencies where it is worth learning.

## Accessibility & Inclusion

WCAG AA contrast in all three themes, keyboard-reachable everything, visible focus ring, skip link, semantic landmarks, accessible dialog/focus handling for the terminal, decorative canvas and ASCII art `aria-hidden` with text equivalents, reduced-motion respected.
