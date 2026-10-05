# ahish-mahesh.github.io

Personal portfolio for Ahish Mahesh, a backend engineer. Live at https://ahish-mahesh.github.io.

Built with Vite, React 19 and strict TypeScript, managed with bun, tested with Vitest and React Testing Library,
and deployed to GitHub Pages by GitHub Actions. `CLAUDE.md` is the build brief.

## Setup

Requires [bun](https://bun.sh) and Node 24 (see `.nvmrc`). Run `bun install`, then `bun run dev`.
ESLint is pinned to 9.x because `eslint-plugin-jsx-a11y` does not support 10 yet.

## Scripts

| Command             | What it does                                               |
| ------------------- | ---------------------------------------------------------- |
| `bun run dev`       | Dev server                                                 |
| `bun run build`     | Typecheck and production build into `dist/`                |
| `bun run preview`   | Serve the production build locally                         |
| `bun run typecheck` | `tsc -b --noEmit`                                          |
| `bun run lint`      | ESLint, zero warnings allowed                              |
| `bun run format`    | Prettier, write                                            |
| `bun run test`      | Vitest, single run                                         |
| `bun run check`     | Typecheck, lint, format check, tests, build (what CI runs) |

## Resume

`public/resume.pdf` is added by hand. Before committing it, check that it contains no phone number
and no home address, because the site is public and indexed.

Font preloading is deferred to milestone 7.

## Deploy

Pushes to `main` run `.github/workflows/deploy.yml`: install, `bun run check`, build, then publish
`dist/` to GitHub Pages. Pull requests and other branches run `.github/workflows/ci.yml`.

## License

Code is MIT, see `LICENSE`. Personal content (bio, resume, images) is not open-licensed.

Built with [Claude Code](https://claude.com/claude-code).
