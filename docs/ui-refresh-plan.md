# UI refresh plan (2026-10-06)

From a review with the ui-ux-pro-max skill plus a design pass. Goal: make the site read as
hand-made, not templated. Every phase keeps CLAUDE.md §1 (motion never gates), §6 (voice) and
§7 (quality bars). Ahish's decisions: tmux bar yes; bring back the htop table; keep IBM Plex
Sans for long prose (recruiter readability).

Each phase ends with `bun run check`, headless-Chrome screenshots of all three themes at
1440x900 and 390x844, and a reduced-motion pass.

## Phase A: hierarchy and copy

**Projects becomes an htop process table** (replaces the repeated cards).

- Status line (muted): `Tasks: 4 total; sorted by impact`.
- Column header (desktop): `PID  NAME  STACK  STATE  METRIC`. Rows are disclosure buttons
  (`aria-expanded`, `aria-controls`), reverse-video on hover/focus/open like htop's cursor.
- Each row shows a one-line plain description (`headline`) under it at every width, so a
  non-technical reader knows what `agent-goal` is without opening it.
- Bars fill once when the row scrolls into view (static full under reduced motion).
- The KLA row is open by default, so its case study (bullets + MigrationPanel) is the
  visibly heaviest thing below the hero. Others open on click. `#project-<slug>` and
  find-in-page (`hidden="until-found"`) keep working.
- Headlines rewritten plainly; no bullet repeats the headline.
- Archive stays as `[+] 4 smaller projects`.

**Hero**

- Background becomes one mono line with `·` separators.
- Status line becomes mono `status: …` with no green dot, no Plex.
- At 1440x900 the htop header and first row are visible above the fold.

## Phase B: command lines and ANSI colour roles

- `Section` gets a `command` prop rendered as a muted prompt line above the h2:
  `$ htop --sort=impact`, `$ git log --graph --oneline`, `$ neofetch`, `$ cat contact.txt`.
- New tokens per theme: `--ansi-green` (prompts/links), `--ansi-yellow` (numbers/metrics),
  `--ansi-blue` (paths/repos), plus fg/muted. Contrast script fails CI below AA.
- Weight scale: 700 headings, 500 labels/commands, 400 everything else.
- Plex only for long prose (case-study bullets, contact paragraphs), never in the hero.

## Phase C: tmux status bar (desktop, min-width 881px)

- Fixed bottom bar: `[ahish] 0:shipped* 1:worked 2:tools 3:hello` (window list doubles as
  section nav + active state), right side: live Montreal time and the deployed short git hash
  (Vite `define` at build time).
- Replaces SiteFooter on desktop; phones keep the footer. Footer landmark for screen readers.
  Reserve its height so it never covers content (CLS < 0.05).

## Phase D: section-specific details

- Git log: full `*`, `|`, `|\`, `|/` graph drawn on scroll; dates in the hash column.
- Neofetch: mini ASCII cylinder logo at every width; 8-swatch colour row from Phase B tokens.
- Contact: `cat contact.txt` framing; work permit line as a `# note:` comment.

## Phase E: polish

- Hover/focus transitions 150-200ms, `cursor: pointer` on every clickable, 44px touch audit.
