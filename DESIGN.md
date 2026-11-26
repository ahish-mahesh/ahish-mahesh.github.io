---
name: Ahish Mahesh Portfolio
description: A working terminal session, skinned as a recruiter-first portfolio. Flat, monospace, three themes.
colors:
  phosphor-bg: '#0b0f0c'
  phosphor-fg: '#c8e6c9'
  phosphor-accent: '#39ff88'
  phosphor-num: '#d7c46a'
  phosphor-ident: '#6fc3df'
  phosphor-muted: '#7c907d'
  amber-bg: '#100c07'
  amber-fg: '#ffb347'
  amber-accent: '#ffcc66'
  amber-num: '#ffe2a8'
  amber-ident: '#e8a33d'
  amber-muted: '#ab7931'
  paper-bg: '#f4f1ea'
  paper-fg: '#1d1d1b'
  paper-accent: '#0b4f8a'
  paper-num: '#8a4b08'
  paper-ident: '#2c6e3f'
  paper-muted: '#686763'
typography:
  display:
    fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    fontSize: '56px'
    fontWeight: 400
    lineHeight: '3rem'
  headline:
    fontFamily: 'JetBrains Mono, ui-monospace, monospace'
    fontSize: '28px'
    fontWeight: 400
    lineHeight: '3rem'
  title:
    fontFamily: 'JetBrains Mono, ui-monospace, monospace'
    fontSize: '20px'
    fontWeight: 400
    lineHeight: '1.5rem'
  body:
    fontFamily: 'JetBrains Mono, ui-monospace, monospace'
    fontSize: '16px'
    fontWeight: 400
    lineHeight: '1.5rem'
  prose:
    fontFamily: 'IBM Plex Sans, system-ui, sans-serif'
    fontSize: '17px'
    fontWeight: 400
    lineHeight: '1.5rem'
  label:
    fontFamily: 'JetBrains Mono, ui-monospace, monospace'
    fontSize: '14px'
    fontWeight: 700
    lineHeight: '1.5rem'
rounded:
  none: '0px'
spacing:
  rhythm: '1.5rem'
  space-1: '0.75rem'
  space-2: '1.5rem'
  space-3: '3rem'
  space-4: '4.5rem'
  section-gap: '6rem'
  gutter: '16px'
components:
  button-text:
    textColor: '{colors.phosphor-accent}'
    rounded: '{rounded.none}'
    padding: '0'
  button-text-hover:
    textColor: '{colors.phosphor-fg}'
  nav-link-current:
    backgroundColor: '{colors.phosphor-accent}'
    textColor: '{colors.phosphor-bg}'
    rounded: '{rounded.none}'
  process-row-selected:
    backgroundColor: '{colors.phosphor-accent}'
    textColor: '{colors.phosphor-bg}'
    rounded: '{rounded.none}'
    padding: '0 1ch'
---

# Design System: Ahish Mahesh Portfolio

## Overview

**Creative North Star: "The Working Terminal"**

The site reads as a real shell session: a prompt in the header, sections introduced by the command that would produce them, projects as an `htop` process list, experience as `git log --graph`, skills as `neofetch`. It is polished like a product site and skinned like a terminal, and the skin never costs legibility. Prose that needs to be read sits in a sans; everything structural is monospace on a character grid.

Depth is flat and sharp. There are no shadows, no radii, no cards. Hierarchy comes from rules, indentation on whole-`ch` columns, colour roles, and reverse video (the htop selection bar). One wow moment (the ASCII 3D database cylinder in the hero) carries the personality; the rest stays quiet and fast.

**Key Characteristics:**

- Everything aligns to a 1.5rem vertical rhythm and whole-`ch` horizontal columns, so ASCII blocks and tables line up.
- Colour is by role (interactive, number, identifier, prose, secondary), not decoration.
- Three themes: paper (light, the default for first-time visitors), phosphor (dark), amber. A stored choice wins. Every pair passes WCAG AA.
- Motion enhances and never gates; reduced motion swaps effects for static equivalents.

## Colors

One saturated accent per theme on a near-black or off-white ground, with two quiet role colours for data.

### Primary

- **Phosphor Green** (#39ff88): the interactive colour in the phosphor theme: links, buttons, the prompt, selection bars, focus ring. Amber uses Bright Amber (#ffcc66); paper uses Deep Ink Blue (#0b4f8a).

### Secondary

- **Metric Gold** (#d7c46a): numbers and metrics only (query counts, percentages). Amber: #ffe2a8. Paper: Burnt Umber (#8a4b08).
- **Identifier Cyan** (#6fc3df): names and identifiers (project names, commands). Amber: #e8a33d. Paper: Forest Green (#2c6e3f).

### Neutral

- **Phosphor Black** (#0b0f0c): page ground, slightly green. Amber ground #100c07 (warm). Paper ground #f4f1ea (off-white).
- **Soft Green-White** (#c8e6c9): prose. Amber prose #ffb347. Paper prose Ink (#1d1d1b).
- **Dim Phosphor** (#7c907d): secondary text, borders, the static ASCII frame. Amber #ab7931; paper #686763.

### Named Rules

**The Role Rule.** accent = interactive, `--num` = numbers, `--ident` = names, `--fg` = prose, `--muted` = secondary. A colour is never used outside its role.

**The Contrast Rule.** Every foreground and background pair passes AA in all three themes (4.5:1 body, 3:1 large). Check before adding or changing a token.

## Typography

**Display / Body / Label Font:** JetBrains Mono (with ui-monospace, Menlo, Consolas fallbacks)
**Prose Font:** IBM Plex Sans (with system-ui fallback)

**Character:** Monospace carries structure, headings and chrome; Plex carries paragraphs that people actually read. Plex's smaller x-height means prose is set at 17px to match 16px mono.

### Hierarchy

- **Display** (400, 56px desktop / min(48px, 13vw) mobile, 3rem line): the name in the hero only.
- **Headline** (400, 28px, 3rem line; 20px on mobile): section headings, always lowercase.
- **Title** (400, 20px, 1.5rem): case-study and entry headings.
- **Body** (400, 16px, 1.5rem): all structural text, tables, lists.
- **Prose** (Plex 400, 17px, 1.5rem, max 72ch): paragraphs and case-study copy.
- **Label** (700, 14px): header prompt, nav, terminal button, section command lines.

### Named Rules

**The Lowercase Rule.** Headings are lowercase, matching the GitHub README voice.

**The Grid Rule.** Line-height is always a multiple of 1.5rem; widths are in `ch`. Nothing sits between grid lines.

## Layout

Single page, anchor-linked sections, content column max 1200px with a 16px gutter, aligned to the same left edge as the sticky header. Sections are separated by 6rem (3rem on phones) and introduced by a muted command line with an accent `$` prompt. The hero is two columns from 720px (text 1.3fr, ASCII visual 1fr) and collapses on mobile to the name beside a small cylinder, so projects start on the first screen.

The projects list uses whole-`ch` columns (pid 4, name 21, stack 28) and container queries: stacked below 64ch, table from 64ch, with the stack column from 88ch. Header nav collapses to a menu at 880px; touch targets reach 44px; stacked controls take real 44px rows so hit areas never overlap.

## Elevation & Depth

Flat. No shadows. Depth is conveyed by 1px rules in the muted colour, indentation, and reverse video on selection. The optional CRT layer (off by default, `crt on`) adds a faint text glow and a 2px scanline overlay; it is static and never flickers. Theme switching uses a 350ms stepped scanline wipe (view transitions), disabled under reduced motion.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at all times. State is shown by colour fade (150ms) or reverse video, never by shadow, lift or scale.

## Shapes

Sharp. Border radius is 0 everywhere. Borders are 1px in the muted colour; the only filled shapes are the reverse-video selection bars and the current-nav highlight. Buttons are bracketed text (`[ view projects ]`), not boxes; the one primary action (the hero email) is set in reverse video. ASCII is the ornament: the hero cylinder, the pipeline diagram, the git-log graph.

## Components

### Text Buttons

- **Shape:** unboxed accent text, bracketed in the copy, 0 radius.
- **Hover:** colour shifts from accent to prose colour; underline on nav links. Colour fades only, 150ms.
- **Focus:** 2px accent outline, 2px offset, visible in all themes.
- **Mobile:** padding with matching negative margin gives 44px hit areas.

### Process List (signature)

- **Style:** htop table on whole-`ch` columns; highlights in Metric Gold, names in Identifier Cyan, each followed by an accent `[+]` / `[-]` marker.
- **State:** hover, focus and expanded invert the whole row to accent background with the page colour as text. On mobile only the pid and name line inverts.
- **Behavior:** each row is a `button` with `aria-expanded` that opens a case-study panel.

### Navigation

- **Style:** sticky 1.5rem bar with a 1px bottom rule; a typed prompt (`ahish@montreal:~$`) with a blinking cursor, then section links in accent, `resume` in prose colour, theme switch and a bold `>_` terminal button.
- **Current section:** reverse video (accent background, page-colour text).
- **Mobile:** below 880px the links fold into a right-aligned bordered menu; the prompt and `>_` stay visible.

### ASCII Hero Visual

- **Style:** a stack of database cylinders rendered through an ASCII effect in theme colours, with a pre-rendered `<pre>` frame in muted colour as the static fallback laid on the same character cell so the swap does not shift.

## Do's and Don'ts

### Do:

- **Do** keep every effect optional: plain semantic HTML on first paint, reduced-motion fallbacks for decode, scroll drawing, and the 3D hero.
- **Do** use colour by role and verify AA contrast in all three themes.
- **Do** set widths in `ch` and line-heights in multiples of 1.5rem so ASCII aligns.
- **Do** write headings lowercase and copy in the README voice: specific, dry, numbers over adjectives.
- **Do** show interaction with reverse video or a colour fade.

### Don't:

- **Don't** add shadows, border radius, cards, gradients or glassmorphism.
- **Don't** put content only in a canvas, animation or the terminal.
- **Don't** use accent on non-interactive text or reuse number and identifier colours decoratively.
- **Don't** use em-dashes or buzzwords in visible copy.
- **Don't** add a photo, a contact form, or a phone number.
