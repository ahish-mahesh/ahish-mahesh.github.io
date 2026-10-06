import { useEffect, useRef, useState } from 'react';
import { profile } from '../../content/profile.ts';
import { useActiveSectionId } from '../../hooks/ActiveSectionContext.ts';
import { sectionCommands } from '../sections.ts';
import { ThemeSwitch } from '../ThemeSwitch/ThemeSwitch.tsx';
import styles from './SiteHeader.module.css';
import { TypedCommand } from './TypedCommand.tsx';

// Keep in sync with the `@media (max-width: 880px)` breakpoint in SiteHeader.module.css.
const MOBILE_QUERY = '(max-width: 880px)';

const links = [
  { id: 'projects', label: 'projects/', href: '#projects', command: 'cd projects' },
  { id: 'work', label: 'work/', href: '#work', command: 'cd work' },
  { id: 'about', label: 'about/', href: '#about', command: 'cd about' },
  { id: 'contact', label: 'contact/', href: '#contact', command: 'cd contact' },
  { id: 'resume', label: 'resume.pdf', href: profile.links.resume, command: 'open resume.pdf' },
] as const;

export function SiteHeader() {
  const active = useActiveSectionId() ?? 'top';
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const cwd = active === 'top' ? '~' : `~/${active}`;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = () => {
      if (!mql.matches) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    mql.addEventListener('change', onChange);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      mql.removeEventListener('change', onChange);
    };
  }, [open]);

  return (
    <header className={styles.header} ref={headerRef}>
      <nav aria-label="primary" className={styles.nav}>
        <div className={styles.promptArea}>
          <a href="#top" className={styles.prompt}>
            ahish@montreal
          </a>
          <span aria-hidden="true">:{cwd}$ </span>
          <TypedCommand text={hovered ?? sectionCommands[active]} />
        </div>
        <button
          type="button"
          ref={toggleRef}
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => {
            setOpen((o) => !o);
          }}
        >
          <span aria-hidden="true">[</span>ls
          <span aria-hidden="true"> {open ? '▴' : '▾'}]</span>
        </button>
        <div id="site-menu" className={styles.menu} data-open={open ? 'true' : 'false'}>
          <ul className={styles.links}>
            {links.map((l) => {
              const isActive = l.id === active;
              return (
                <li key={l.id}>
                  <a
                    href={l.href}
                    className={l.id === 'resume' ? styles.fileLink : styles.link}
                    aria-current={isActive ? 'location' : undefined}
                    onClick={() => {
                      setOpen(false);
                    }}
                    onMouseEnter={() => {
                      setHovered(l.command);
                    }}
                    onFocus={() => {
                      setHovered(l.command);
                    }}
                    onMouseLeave={() => {
                      setHovered(null);
                    }}
                    onBlur={() => {
                      setHovered(null);
                    }}
                  >
                    {l.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <ThemeSwitch />
        </div>
      </nav>
    </header>
  );
}
