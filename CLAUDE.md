# Portfolio Site: Handoff Brief

> Drop this file into the root of the new repo as `CLAUDE.md` (or keep it as `docs/HANDOFF.md` and point `CLAUDE.md` at it). It is the source of truth for what to build, how it should look and sound, and how it ships.
>
> Written 2026-10-05 from the `ai-job-search` workspace (candidate profile, CVs, GitHub profile README) plus a design-reference review done the same day.

---

## 0. How we work: model usage

Goal: spend Opus where judgment matters, use cheaper models where the work is well specified, and never trade away quality to save tokens.

### Workflow per milestone (§10)

1. **Plan in Opus.** Each milestone starts in plan mode on Opus: read this file, design the approach, list files and acceptance criteria, and get Ahish's approval before any code is written.
2. **Build in Sonnet 5.5.** After the plan is approved, the main session switches to Sonnet 5.5 (`/model`) to implement it. Claude cannot switch its own model; Ahish runs the command.
3. **Delegate by difficulty** using the Agent tool's `model` parameter (table below).
4. **Review before accepting.** The main session reads every subagent diff and checks it against the plan, §6 (voice) and §7 (quality bars). A subagent saying "done" is not verification: run lint, typecheck, tests and build.

### Who does what

| Model | Use for | Examples in this repo |
|---|---|---|
| **Opus** (`model: "opus"`) | Planning, architecture, and anything complex or ambiguous | Milestone plans; theme/token architecture; the 3D hero render loop and perf work; terminal parser and command registry design; a11y dialog/focus management; debugging a failure whose cause is not obvious; final review of a milestone against §7 |
| **Sonnet** (`model: "sonnet"`) | Well-specified implementation from an approved plan | Components and CSS Modules; `src/content/*` typed from §5; unit and RTL tests; GitHub Actions workflows; ESLint/Vite/Vitest config |
| **Haiku** (`model: "haiku"`) | Mechanical, low-judgment tasks with a clear right answer | Scaffolding empty files/folders; renames and moves; applying lint/format fixes; running build/test and summarizing output; codebase searches; contrast-ratio checks with a script; `CREDITS.md` entries |

### Rules for subagents

- **Self-contained brief.** Subagents start cold. Every prompt names the files to touch, the acceptance criteria, and the relevant sections of this file (always include §6 voice rules for anything that writes visible text).
- **No invented content.** Subagents copy facts and numbers from §5 only. Anything not in this file goes back to Ahish as a question.
- **Escalate, don't loop.** If a Haiku task needs judgment, hand it to Sonnet; if a Sonnet task fails twice or the spec turns out ambiguous, stop and bring it to Opus (or to Ahish).
- **Don't spawn for trivia.** A change of a few lines is faster inline than a cold-start subagent.
- **Parallelize independent work** (e.g. content files and CSS tokens), but never two agents editing the same file.

---

## 1. The goal

A personal portfolio for **Ahish Mahesh**, a software engineer who builds LLM features on a production backend (Gemini and local models on top of C++, C#/.NET, Python and the database tier underneath), hosted on **GitHub Pages** at `https://ahish-mahesh.github.io`.

- **Primary job: recruiter-first showcase.** A hiring manager in Montreal or Toronto should see who Ahish is, what he has shipped, and how to contact him within **one second** of load and **thirty seconds** of scrolling. Everything else is secondary.
- **Secondary job: a learning project.** Ahish is building this in React to grow front-end skills (React + TypeScript, animation, WebGL via React Three Fiber, performance work, testing, CI/CD). Prefer approaches that teach something over approaches that hide everything in a dependency, but do not reinvent things that are not worth learning.
- **Aesthetic: terminal / monospace, "balanced" flash level.** Polished like a well-designed product site, skinned like a terminal. One genuine wow moment (the ASCII 3D hero), the rest readable and fast.

### Non-negotiable rule: motion enhances, never gates

1. All real content is plain semantic HTML, rendered on first paint. No content lives only inside a canvas, an animation, or the terminal.
2. Every effect either runs once, or reacts to the visitor. Anything over ~1.5s is skippable.
3. `prefers-reduced-motion: reduce` disables decode/scramble effects, scroll-driven drawing, background motion, and the boot sequence, and replaces the 3D hero with a static ASCII frame.
4. Heavy code (three.js, R3F, the terminal) is lazy-loaded after first paint.

---

## 2. Tech stack (decided)

| Concern | Choice | Notes |
|---|---|---|
| Build | **Vite** | `base: '/'` because this is a *user* site (`<user>.github.io`), served from the domain root |
| UI | **React 19 + TypeScript (strict)** | Function components, hooks, no class components |
| Styling | **CSS Modules + CSS custom properties** | Theme tokens on `:root[data-theme=…]`. No Tailwind (keeps the CSS learning explicit, matches HamishMW's approach) |
| Animation | **Motion** (formerly Framer Motion; `import { motion } from 'motion/react'`) | Section reveals, timeline drawing, diagram arrows |
| 3D | **three + @react-three/fiber + @react-three/drei** | Hero only. drei's `AsciiRenderer` wraps three's `AsciiEffect`; verify its current props in the drei docs before use |
| Effects | **react-bits** components, copied in (see §8 licensing) | `DecryptedText`, `CursorGrid` or `DotGrid`, optionally `LetterGlitch` |
| Diagrams | **ascii2svg** (Python, run locally) *or* hand-built SVG + Motion | See §5.4 |
| Fonts | **JetBrains Mono** (body + headings), self-hosted via `@fontsource/jetbrains-mono` | `font-display: swap`; preload the regular weight |
| Tests | **Vitest + React Testing Library**; **Playwright** for one smoke test | Terminal command parser gets real unit tests |
| Lint/format | ESLint (typescript-eslint, react-hooks, jsx-a11y) + Prettier | |
| Perf/a11y gate | **Lighthouse CI** in GitHub Actions | Budgets in §7 |
| Package manager | npm (or pnpm, pick one and commit the lockfile) | |
| Hosting | **GitHub Pages via GitHub Actions** | §9 |

---

## 3. Design references (verified 2026-10-05)

Use these for **ideas and structure**. Copy code only where the license column says you may, and record it in `CREDITS.md`.

| Role | Reference | License | What to take |
|---|---|---|---|
| Overall polish | [HamishMW/portfolio](https://github.com/HamishMW/portfolio) · [hamishw.com](https://hamishw.com) | MIT | Section transitions, theme provider pattern, `decoder-text` component, the "3D hero that never blocks the text" approach (`displacement-sphere.jsx`). Built on Remix: port ideas to Vite, do not copy the routing |
| Terminal easter egg | [satnaing/terminal-portfolio](https://github.com/satnaing/terminal-portfolio) · [demo](https://terminal.satnaing.dev/) | MIT | Command registry, autocomplete, history, theme commands, and its test approach |
| Drop-down console UX | [1j01/simple-console](https://github.com/1j01/simple-console) · [demo](https://1j01.github.io/simple-console/) | MIT | Quake-style backtick drop-down behavior |
| ASCII 3D look | [hosseinb1111/ASCII-Character](https://github.com/hosseinb1111/ASCII-Character) · [demo](https://hosseinb1111.github.io/ASCII-Character/) | MIT | How `AsciiEffect` looks on an interactive model |
| ASCII 3D, GPU approach | [egorshest/webgl-ascii-hero](https://github.com/egorshest/webgl-ascii-hero) · [demo](https://v0-webgl-ascii-hero.vercel.app) | unclear | **Look only.** Upgrade path if `AsciiEffect` is too slow (§5.1) |
| Effects library | [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) · [reactbits.dev](https://reactbits.dev) | MIT + Commons Clause | `DecryptedText`, `ScrambledText`, `CursorGrid`, `DotGrid`, `LetterGlitch`, `FaultyTerminal` |
| Shader backgrounds (optional) | [paper-design/shaders](https://github.com/paper-design/shaders) · [gallery](https://shaders.paper.design) | Apache-2.0 | Subtle dither/grain if `CursorGrid` feels too busy |
| Animated diagrams | [SatyadipPaul/ascii2svg](https://github.com/SatyadipPaul/ascii2svg) · [playground](https://satyadippaul.github.io/ascii2svg/) | MIT | Scroll-drawn SVG from the existing ASCII pipeline diagram |
| Grid discipline | [owickstrom/the-monospace-web](https://github.com/owickstrom/the-monospace-web) | MIT | Character-grid spacing rules (line-height and widths in whole `ch` units) so ASCII art aligns |
| Recruiter-first layout | [bchiang7/v4](https://github.com/bchiang7/v4) | MIT | Section order and the tabbed "where I've worked" pattern. Do not copy its look; it is widely recognized |

**Do not copy code from** repos without a license (e.g. `rajrathod-1/portfolio`, `mohcinelamtanez/portfolio.me`, `emilwidlund/ASCII`). Ideas only.

---

## 4. Visual system

### Themes (three, user-switchable, system default)

| Token | `phosphor` (default dark) | `amber` (alt dark) | `paper` (light) |
|---|---|---|---|
| `--bg` | near-black, slightly green (`#0b0f0c`) | near-black, warm (`#100c07`) | off-white (`#f4f1ea`) |
| `--fg` | soft green-white (`#c8e6c9`) | amber (`#ffb347`) | ink (`#1d1d1b`) |
| `--accent` | phosphor green (`#39ff88`) | bright amber (`#ffcc66`) | deep blue or green, AA on paper |
| `--muted` | 60% fg | 60% fg | 55% fg |

Values are starting points. **Every fg/bg pair must pass WCAG AA (4.5:1 body, 3:1 large).** Check with a contrast tool before committing.

- Default: `paper` if `prefers-color-scheme: light`, else `phosphor`. Persist the choice in `localStorage` (wrap in try/catch). Set `data-theme` before React hydrates (inline script in `index.html`) to avoid a flash.
- Theme switch animates: a quick scanline wipe or character-dissolve across the viewport (≤400ms, disabled under reduced motion).
- Optional CRT layer (scanlines + faint glow) is **off by default**, toggleable from the terminal (`crt on`).

### Typography and grid

- JetBrains Mono everywhere. Sizes on a small scale (e.g. 14 / 16 / 20 / 28 / 40px). Headings are lowercase, matching the GitHub README voice.
- Layout widths in `ch`; vertical rhythm in multiples of the line height so ASCII blocks align.
- Max content width ~80-100ch. Generous whitespace. Mobile: 16px gutter, no horizontal scroll, ASCII blocks scroll horizontally *inside their own container* if needed.

---

## 5. Page structure and effects

Single page, anchor-linked sections. Order matters (recruiter-first):

```
[ nav: ahish@montreal:~$  · work · projects · about · resume · theme ]
1. hero
2. what I've shipped     (projects, htop-style)
3. where I've worked     (git log timeline)
4. what I reach for      (neofetch skills)
5. saying hello          (contact + work authorization)
[ footer: credits · source link ]
```

### 5.1 Hero

- **Left / top (HTML, renders instantly):**
  - Name: `Ahish Mahesh`, revealed with a **decode effect** (react-bits `DecryptedText` or HamishMW's `decoder-text`). Plain text is in the DOM from the start so screen readers and crawlers see it.
  - One-liner: *Software engineer. LLM features on a production backend, plus the database tier underneath.*
  - Sub-line: *Back end developer at Vffice · CS master's at Concordia, Dec 2026 · Montreal*
  - Buttons: `[ view projects ]` `[ resume.pdf ]` `[ email ]`
- **Right / behind (lazy, decorative, `aria-hidden`):** **an ASCII-rendered 3D database cylinder stack.**
  - Three stacked `CylinderGeometry` "platters" with small gaps (the classic database icon), built from primitives, no model file needed.
  - Rendered through drei `AsciiRenderer` / three `AsciiEffect`, characters along the lines of `' .:-=+*#%@'`, colors from theme tokens (re-read on theme change).
  - Slow idle rotation; tilts toward the cursor (lerped). On touch devices: idle rotation only.
  - Optional detail: platters subtly pulse in sequence like a replica set syncing (a nod to the HA cluster work).
  - **Performance:** `AsciiEffect` writes DOM text every frame, so keep the canvas small, use a low `resolution`, cap to ~30fps, pause when offscreen (IntersectionObserver) or the tab is hidden. If it costs over ~4ms/frame on a mid-range laptop, move to a GPU shader approach (see egorshest/emilwidlund references).
  - **Fallbacks:** no WebGL, reduced motion, or slow device: show a pre-rendered static ASCII frame in a `<pre>`.
- **Background:** subtle cursor-reactive character/dot grid (react-bits `CursorGrid` or `DotGrid`), low contrast, behind hero only or fixed behind the page. Disabled under reduced motion.
- **Boot sequence (optional, first visit only):** ~1.2s fake boot log (`[ ok ] mounting postgres cluster`, `[ ok ] loading whisper.cpp`, `[ ok ] ahish.service started`) overlaid on the hero, skippable with any key or click, never shown again (localStorage flag), never shown under reduced motion. **The hero content must already be rendered underneath it.**

### 5.2 Projects: "what I've shipped" as an `htop` process list

Each project is a row like a running process, with bars that animate in (once, on scroll into view) to the project's **real** metric. Click/Enter expands a case study panel (accessible disclosure: `button` + `aria-expanded`).

```
PID  NAME              STACK                         METRIC
101  kla-pg-migration  PostgreSQL Babelfish T-SQL     [||||||||||||||    ] 1,200 queries, -25% cost
102  agent-goal        React Native Supabase Gemini   [|||||||||||||||   ] gemini 2.5 flash
103  agent-notes-cpp   C++17 whisper.cpp llama.cpp   [||||||||||||||||  ] 16x real-time
104  project5k-bot     Python llama-cpp Gemini        [||||||||||||      ] local llm + gemini
```

Featured (expanded case studies, in this order). Every project fact below was checked against the repo code on 2026-10-10 and matches the Softchoice resume (`ai-job-search/cv/main_softchoice_software_engineer_ai.tex`, fact-check commit `683f416`). See the "never claim" list in §6.

1. **KLA: MSSQL to multi-node PostgreSQL migration** (no public repo; this is the strongest story)
   - Analysed 30+ product cost components; the MSSQL high-availability cluster was ~20% of product cost.
   - Led a three-person team (Ahish included) through a zero-code migration to a multi-node PostgreSQL cluster using Babelfish, translating 1,200+ queries.
   - Product cost down 25%; opened the product to smaller customers; ~$2M annual revenue from 3 new customers.
   - **Signature animation:** a scroll-driven panel where a query counter runs to 1,200 while a T-SQL snippet morphs into PL/pgSQL, then a cost bar drops by 25%. Use a *generic illustrative* query, never real KLA code.
2. **agent-goal** (Goal Genie) ([repo](https://github.com/ahish-mahesh/agent-goal))
   - A goal tracker with a planning agent that argues you down from "get fit" to something you can do on a Tuesday. iOS and Android (Expo).
   - A Supabase Edge Function (Deno) calls Gemini 2.5 Flash with an engineered SMART-goal mentor prompt.
   - Per-chat Gemini context caching: the cache name is saved in Supabase, with a full-prompt fallback below a token threshold.
   - Supabase Auth with Google Sign-In; a daily push-notification edge function.
   - Built with two other people; Ahish was the only engineer and wrote all of the code. (Do not name the collaborators or their roles.)
   - Stack: React Native/Expo · TypeScript · Supabase (Auth, Edge Functions) · Deno · Gemini API
3. **agent-notes-cpp** ([repo](https://github.com/ahish-mahesh/agent-notes-cpp))
   - Records a lecture or meeting and returns a structured summary. Nothing leaves the machine: Whisper and Qwen 2.5 0.5B run locally.
   - whisper.cpp transcribes microphone audio in real time on a dedicated processing thread; 16x real-time (Whisper base.en on a MacBook Air M2, the README benchmark).
   - Qwen 2.5 0.5B runs through a background llama.cpp server that the app manages, and writes structured summaries from an engineered system and format prompt.
   - SQLite stores transcripts and summaries.
   - Stack: C++17 · whisper.cpp · llama.cpp (server) · SQLite · RtAudio/PortAudio · CMake
   - **Animated pipeline diagram** (see §5.4), from the README:
     ```
      mic ──▶ AudioCapture ──▶ ring buffer ──▶ WhisperTranscriber
              (RtAudio/PA)                     (whisper.cpp)
                                                     │
                                                transcript
                                                     │
                                                     ▼
      SQLite ◀── DBHelper ◀── summary ◀── LLMClient (llama.cpp, Qwen 2.5 0.5B)
     ```
4. **project5k-bot** ([repo](https://github.com/ahish-mahesh/project5k-bot))
   - A Discord bot that nags friends about the gym: slash commands, streak tracking on scheduled jobs (APScheduler), and workout plans scheduled to Google Calendar.
   - LLM coaching from local models through llama-cpp-python (Mistral 7B, then TinyLlama, then Phi-2 on the `v1` branch), with prompts written for small models. A separate branch swaps in the Gemini API.
   - Stack: Python · discord.py · llama-cpp-python · Gemini API · Firebase Firestore · APScheduler · Google Calendar API

Archive (compact list, no animation): EchoNews (LSI/SVD news recommender), SMS-Classification (FIEL semi-supervised, 91% accuracy), Newsify, Outlander (C++/Arduino rocker-bogie robot). Optional "coming soon" row: the job-application workflow (private until his own data is untangled from it).

Agent Notes is presented through the C++ repo only; the Swift, Tauri and Rust variants are not listed (decided 2026-10-10). The portfolio site itself is not listed as a project.

> **Ask Ahish before publishing:** whether any Concordia coursework repos (`multi-modal-detection-framework`, `notilytics-hufflebuffers`) belong in the archive.

### 5.3 Experience: "where I've worked" as `git log --graph`

The branch line draws itself as you scroll (Motion `pathLength`); commits fade in. Newest first. Each entry is a real `<article>` with heading, dates, and 2-3 lines.

```
* 2026-05  vffice (HEAD -> main)   back end developer, montreal
|          started as the co-op, stayed on
* 2026-01  concordia               teaching assistant
* 2021-07  kla                     software engineer, chennai
|\
| * 2019   kla                     software engineering intern (3 terms)
|/
* 2018-05  code khadi              machine learning intern
```

Content:

- **Vffice**, Montreal/Brossard. Back end developer, May 2026 to now (co-op May-Aug 2026, then part time from September).
  - Designed a secured REST API connecting a production Microsoft Dynamics 365 Business Central ERP to external systems; extended AL modules for order sync and workflow validation.
  - Builds with Claude Code, Codex and Antigravity, and runs Azure DevOps (Repos, Boards, Pipelines) daily through Microsoft's Azure DevOps MCP server.
  - 23 PRs across 3 repos, owning code review, testing and release; piloted Graphify knowledge-graph documentation, now used across his projects.
- **Concordia University**. Teaching assistant, Winter 2026: Data Structures and Algorithms (COMP 352), Programming and Problem Solving (COMP 6481).
- **KLA Corporation**, Chennai. Software engineer, Jul 2021 to Nov 2024. C++/.NET metrology applications and the SQL Server HA tier (30% better query performance). Led the PostgreSQL migration (link to case study). Jenkins + MSTest pipeline: quarterly to weekly releases, -40% deployment time, -95% production bugs. Mentored four engineers; ran the division's weekly "Tech Junction" talks for ~80 people. On-site escalations and deployments in Korea, Japan and Singapore.
- **KLA Corporation**. Software engineering intern, 2019-2021 (multiple terms). Migrated a legacy Windows data-management system to a web platform (ReactJS, Three.js, C# REST API, MSSQL): 500+ users, -25% maintenance cost. Placement offer, 8 of 70+ candidates.
- **Code Khadi**, Coimbatore. ML intern, May-Jul 2018. Medical assistant chatbot (Dialogflow, Python, NLP).

Education (small block under the timeline): Master of Applied Computer Science (Co-op), Concordia, expected Dec 2026, GPA 4.03/4.30 · Integrated M.Sc. Software Systems, PSG College of Technology, 2016-2021.

Awards (one line): 1st place, KLA Hackathon 2024.

### 5.4 Animated diagrams

Two acceptable approaches; pick one per diagram:

- **ascii2svg (fast):** paste the ASCII diagram into the playground or run the Python CLI locally, export SVG, commit it under `src/assets/diagrams/`. Wrap it in a component that respects the theme (use `currentColor` / CSS variables) and reduced motion. Do **not** add Python to CI; generated SVGs are committed artifacts. Keep a `scripts/diagrams/README.md` with the exact command used.
- **Hand-built (more learning):** an SVG on the character grid; arrows drawn with Motion `pathLength`, small "packets" (`●`) travelling along paths on a loop while in view; a metric counter ticks up to "16x real-time".

Either way, the ASCII source stays in the DOM as a visually hidden `<pre>` or `figcaption` description for screen readers.

### 5.5 Skills: "what I reach for" as `neofetch`

Left: small ASCII logo (initials `AM` or a mini cylinder). Right: key/value list, matching the Skills section of the Softchoice resume:

```
ahish@montreal
--------------
languages   Python · TypeScript/JavaScript · C#/.NET · C++ · SQL · AL
llm         Gemini API · context caching · prompt engineering · llama.cpp · llama-cpp-python
models      Qwen 2.5 · TinyLlama · Phi-2 · Whisper
backend     REST APIs · Supabase Edge Functions (Deno) · Supabase Auth · Google Sign-In · event-driven apps
data        PostgreSQL · SQL Server (HA) · SQLite · Firestore · schema migration
interfaces  React · React Native · Three.js
devops      Azure DevOps · Google Cloud · Docker · Git · Jenkins · CI/CD · MSTest
ai tooling  Claude Code · Codex · Antigravity · MCP servers · Graphify · custom agent skills
erp         Microsoft Dynamics 365 Business Central (AL)
spoken      English · Tamil · Malayalam (conversational) · French (A1/A2)
```

Optional: the classic neofetch color-block row, using theme colors.

### 5.6 Contact: "saying hello"

- Montreal; prefers hybrid; happy to look at Toronto. Graduates December 2026, can start full time in January 2027.
- Work authorization, stated plainly (this removes a real recruiter question): *Post-Graduation Work Permit from January 2027. It's an open permit, so there's no sponsorship, no LMIA, and nothing for an employer to file.*
- Links: email `ahish.mahesh@gmail.com` (mailto), [LinkedIn](https://linkedin.com/in/ahish-mahesh), [GitHub](https://github.com/ahish-mahesh), `resume.pdf`.
- **No phone number on the site.** No contact form (static hosting; mailto is enough).
- Sign-off line from the README voice (e.g. the PS5-controllers-without-the-console joke) as a small footer aside.

### 5.7 Terminal easter egg (Quake-style drop-down)

- **Open:** backtick `` ` ``, `Ctrl/⌘ + K`, or a small `>_` button in the nav (so touch users can reach it). **Close:** `Esc`, the same key, or `exit`.
- Slides down over the top ~60% of the viewport; page stays scrollable underneath. Focus moves into the input on open and returns to the trigger on close (focus trap while open, `role="dialog"`, `aria-modal="true"`, labelled).
- Lazy-loaded (`React.lazy`) on first open or on idle.
- Command registry pattern (`src/terminal/commands/*.ts`, one file per command, each `{ name, description, hidden?, run(args, ctx) }`), autocomplete on Tab, history on ↑/↓, "did you mean" for typos. **All output is generated from the same `src/content/*` data the page uses**, so the two never drift.

| Command | Output |
|---|---|
| `help` | list of non-hidden commands |
| `whoami` | one-paragraph bio |
| `ls` / `ls projects` | project names |
| `cat <project>` | project summary + links; `open <project>` scrolls page to it and closes the terminal |
| `experience` / `git log` | timeline in plain text |
| `skills` / `neofetch` | the neofetch block |
| `resume` | downloads `resume.pdf` |
| `contact` / `email` | links; `email` opens mailto |
| `theme <phosphor\|amber\|paper>` | switch theme |
| `crt on\|off` | toggle CRT layer |
| `clear`, `history`, `exit` | the usual |
| hidden: `sudo hire ahish` | `[sudo] password for recruiter: ******** ... access granted. ahish.mahesh@gmail.com` |
| hidden: `psql` | a fake `postgres=#` prompt where `\q` exits and `SELECT * FROM skills;` prints a table |
| hidden: `ps5` | `controllers: montreal. console: india. eta: unknown.` |

Hidden commands do not appear in `help` or autocomplete. A hero hint ("Press ` to skip the frontend. I usually do." plus a "(kidding. I built this one in React.)" aside) tells people it exists; the whole line is a button so touch users can open it too.

---

## 6. Voice and content rules

The site should sound like Ahish's GitHub README: understated, specific, dry humor, every claim backed by a number or a concrete detail.

- **No em-dashes.** Use commas, periods, or restructure.
- **No buzzwords or filler**: "passionate", "leverage", "synergy", "results-driven", "cutting-edge", "rockstar", "ninja".
- Lowercase section headings ("what I've shipped", "where I've worked", "what I reach for", "saying hello").
- First person, active voice. Collaborative, not solo-hero: credit collaborators where they exist (agent-goal was built with two others; the migration was a team of three, Ahish included).
- **No invented facts.** Every number on the site comes from §5 of this document. If a new claim is needed, ask Ahish.
- **Never claim** (checked against the repo code on 2026-10-10 and not supported; fact-check commit `683f416` in `ai-job-search`): RAG, embeddings, vector or semantic search, or Q&A in Agent Notes (planning docs only); direct OpenAI or Anthropic API use; Supabase row-level security; <100ms sync or 1,000+ goals; 92% accuracy, 8 languages, 100+ hours, or audio-to-summary under 2s; Metal acceleration or 3s to 900ms in Project5K; "Azure" on its own (Azure DevOps is fine). Do not bring these back without new evidence from Ahish.
- If the site mentions AI tooling used to build it (e.g. a "built with" footer line), name **Claude Code** explicitly.
- English only for v1. An `fr` toggle is a possible later addition (Montreal market) but Ahish's French is A1/A2, so the site must not imply French working proficiency.

---

## 7. Quality bars (CI-enforced where possible)

| Area | Target |
|---|---|
| Lighthouse (mobile) | Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO 100 |
| LCP | < 2.5s on simulated mobile; the LCP element is hero **text**, never the canvas |
| CLS | < 0.05 (reserve space for the hero canvas) |
| Initial JS (gzip) | ≤ ~150KB excluding the lazy 3D and terminal chunks |
| 3D chunk | Loaded after first paint; paused offscreen; ≤ ~4ms/frame |
| Accessibility | Keyboard-reachable everything, visible focus ring in all themes, skip link, semantic landmarks, alt text, AA contrast in all three themes, reduced-motion respected |
| SEO / sharing | `<title>`, meta description, Open Graph + Twitter card image (an ASCII-styled 1200×630 PNG), `sitemap.xml`, `robots.txt`, JSON-LD `Person` schema |
| Tests | Unit tests for the terminal parser and every command; RTL tests for theme switching and the project disclosure; one Playwright smoke test (page loads, terminal opens with backtick, `help` lists commands, `theme paper` switches theme) |

---

## 8. Licensing and credits

- Add a `CREDITS.md` listing every borrowed component/idea with its source URL and license.
- **MIT** sources (HamishMW, satnaing, simple-console, ASCII-Character, ascii2svg, the-monospace-web, three, R3F, drei): keep their copyright notice in any file that contains copied code.
- **react-bits** (MIT + Commons Clause): fine to use in this site; do not redistribute the components as a library or template. Keep the notice in copied files.
- **paper-design/shaders** (Apache-2.0): keep the notice; note modifications.
- **No-license repos:** ideas only, zero copied code.
- The site's own repo: MIT for code. Personal content (bio, resume PDF, images) is not open-licensed; say so in the README.

---

## 9. Repo, hosting, and deploy

### Repo

- Name: **`ahish-mahesh.github.io`** (public). This makes it a *user site* served at `https://ahish-mahesh.github.io/` with Vite `base: '/'`.
- Default branch `main`. Protect it lightly (require CI to pass).

### Suggested structure

```
.
├── .github/workflows/
│   ├── ci.yml            # lint, typecheck, test, build, lighthouse-ci on PRs
│   └── deploy.yml        # build + deploy to Pages on push to main
├── public/
│   ├── resume.pdf        # Ahish provides; see note below
│   ├── og.png
│   ├── robots.txt
│   └── favicon.svg
├── scripts/diagrams/     # ascii sources + the exact ascii2svg command used
├── src/
│   ├── content/          # profile.ts, projects.ts, experience.ts, skills.ts  (single source of truth)
│   ├── components/       # Hero/, DecodeText/, ProcessList/, GitLogTimeline/, Neofetch/, Diagram/, ThemeSwitch/ ...
│   ├── hero3d/           # lazy R3F scene: DbCylinders.tsx, AsciiHero.tsx, StaticFallback.tsx
│   ├── terminal/         # Terminal.tsx, parser.ts, commands/*.ts, *.test.ts
│   ├── theme/            # tokens.css, ThemeProvider.tsx
│   ├── hooks/            # useReducedMotion, useInView, usePageVisible
│   ├── styles/           # global.css, grid.css
│   ├── App.tsx
│   └── main.tsx
├── CREDITS.md
├── CLAUDE.md             # this handoff
└── README.md
```

### Deploy (GitHub Actions)

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. `deploy.yml`, on push to `main`: checkout → setup Node (LTS) → install with lockfile → `npm run build` → `actions/configure-pages` → `actions/upload-pages-artifact` (path `dist`) → `actions/deploy-pages`. Use the job-level `permissions: { pages: write, id-token: write, contents: read }` and a `concurrency` group so deploys do not overlap. Follow Vite's official guide: https://vite.dev/guide/static-deploy#github-pages and use the current major versions of each action.
3. Single-page app with anchor navigation, so no client-side router and no 404 redirect hacks are needed. If routes are added later, copy `index.html` to `404.html` at build time.

### Custom domain (later, not v1)

Launch on `ahish-mahesh.github.io` first. When a domain is bought:

1. Add the domain in **Settings → Pages → Custom domain** (this writes a `CNAME`; also commit `public/CNAME` so builds keep it).
2. DNS: apex `A` records to GitHub Pages' IPs (`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`) and matching `AAAA` records; `www` `CNAME` → `ahish-mahesh.github.io`. Confirm the current values in GitHub's docs before setting them.
3. **Verify the domain** in GitHub account settings (Pages → verified domains) to prevent takeover.
4. Enable **Enforce HTTPS** once the certificate is issued.

### Resume PDF

The site serves the Softchoice resume: source `ai-job-search/cv/main_softchoice_software_engineer_ai.tex` (LaTeX, sb2nov template). **The source has a phone number; the site copy must not** (the site is public and indexed). To build the web copy: copy the `.tex` to a scratch folder, delete the `Mobile: \href{tel:...}{...}` cell from the header (leave the `& \\`), compile twice with `pdflatex`, then check that it is still one page, that `pdftotext` finds no phone number or home address, and that the text below the header matches the original PDF. Copy the result to `public/resume.pdf`. When the resume changes, update §5 to match before changing the site.

---

## 10. Build plan (milestones)

Each milestone ends with a deploy to Pages and a short self-review against §7.

1. **Skeleton and deploy pipeline.** Vite + React + TS, lint/format, Vitest, `deploy.yml` live, a "hello" page on `ahish-mahesh.github.io`. *Learning: Vite, GitHub Actions, Pages.*
2. **Content and layout, zero effects.** `src/content/*` filled from §5, all five sections as plain semantic HTML, character-grid CSS, three themes + switcher, resume link. **The site is already shippable to recruiters at this point.** *Learning: CSS Modules, custom properties, typed content models.*
3. **Motion layer.** Decode text on the name, process-list bars, git-log timeline drawing, reduced-motion hook throughout. *Learning: Motion, IntersectionObserver.*
4. **Diagrams.** agent-notes pipeline and the KLA migration panel. *Learning: SVG, scroll-driven animation.*
5. **3D hero.** DB cylinder stack in R3F, ASCII rendering, cursor tilt, lazy loading, offscreen pause, static fallback. *Learning: three.js, R3F, render loops, perf profiling.*
6. **Terminal.** Drop-down console, command registry, autocomplete, history, hidden commands, full tests. *Learning: parsers, focus management, a11y dialogs, unit testing.*
7. **Polish and gates.** Cursor-reactive background, optional boot sequence and CRT, OG image, JSON-LD, sitemap, Lighthouse CI budgets enforced, Playwright smoke test, `CREDITS.md`.
8. **Later:** custom domain (§9), optional writing section, optional `fr` toggle.

---

## 11. Open questions for Ahish (resolve as they come up)

- Whether any Concordia coursework repos belong in the archive.
- A photo/avatar, or keep the site fully typographic? (Default: no photo; ASCII cylinder is the visual identity.)
- Exact domain name when the time comes.
- Whether to include the boot sequence at all, after seeing it in practice.
