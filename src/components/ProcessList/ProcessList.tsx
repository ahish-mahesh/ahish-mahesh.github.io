import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { archive, projects } from '../../content/projects.ts';
import { cx } from '../cx.ts';
import type { Project } from '../../content/types.ts';
import { Section } from '../Section/Section.tsx';
import { MigrationPanel } from '../MigrationPanel/MigrationPanel.tsx';
import { PipelineDiagram } from '../PipelineDiagram/PipelineDiagram.tsx';
import { ProcessBar } from './ProcessBar.tsx';
import styles from './ProcessList.module.css';

const HASH_PREFIX = '#project-';

function hashSlug(): string | undefined {
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return undefined;
  const slug = hash.slice(HASH_PREFIX.length);
  return projects.some((p) => p.slug === slug) ? slug : undefined;
}

interface ProcessRowProps {
  project: Project;
  open: boolean;
  started: boolean;
  onToggle: () => void;
  onReveal: () => void;
}

function ProcessRow({ project, open, started, onToggle, onReveal }: ProcessRowProps) {
  const panelId = `panel-${project.slug}`;
  const panelRef = useRef<HTMLDivElement>(null);

  // React's types only allow a boolean `hidden`, so set the attribute directly.
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (open) el.removeAttribute('hidden');
    else el.setAttribute('hidden', 'until-found');
  }, [open]);

  // hidden="until-found" lets find-in-page match closed text; the browser then
  // fires `beforematch` and removes the attribute, so open the row to match.
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    el.addEventListener('beforematch', onReveal);
    return () => {
      el.removeEventListener('beforematch', onReveal);
    };
  }, [onReveal]);

  return (
    <li id={`project-${project.slug}`} className={styles.row}>
      <h3 className={styles.heading}>
        <button
          type="button"
          className={styles.button}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className={cx(styles.pid, 'muted')}>{project.pid}</span>
          <span className={styles.name}>{project.name}</span>
          <ProcessBar run={started} />
          <span className={styles.metric}>{project.metric}</span>
        </button>
      </h3>
      <div id={panelId} ref={panelRef} className={styles.panel}>
        <p className={cx(styles.label, 'muted')}>{project.title}</p>
        <ul className={styles.bullets}>
          {project.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p>
          <span className="muted">stack: </span>
          {(project.fullStack ?? project.stack).join(' · ')}
        </p>
        {project.repo ? (
          <p>
            <a href={project.repo} rel="noreferrer">
              source on github
            </a>
          </p>
        ) : null}
        {project.visual === 'pipeline' && project.diagram ? (
          <PipelineDiagram source={project.diagram} caption={project.diagramCaption} />
        ) : null}
        {project.visual === 'migration' ? <MigrationPanel /> : null}
      </div>
    </li>
  );
}

export function ProcessList() {
  const [openSlugs, setOpenSlugs] = useState<ReadonlySet<string>>(() => {
    const slug = hashSlug();
    return new Set(slug ? [slug] : []);
  });
  // Slugs opened at least once this visit; their bars stay full.
  const [started, setStarted] = useState<ReadonlySet<string>>(() => {
    const slug = hashSlug();
    return new Set(slug ? [slug] : []);
  });

  const markStarted = (slug: string) => {
    setStarted((s) => (s.has(slug) ? s : new Set(s).add(slug)));
  };

  useEffect(() => {
    const onHashChange = () => {
      const slug = hashSlug();
      if (slug) {
        setOpenSlugs((s) => new Set(s).add(slug));
        setStarted((s) => (s.has(slug) ? s : new Set(s).add(slug)));
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const reveal = (slug: string) => {
    markStarted(slug);
    setOpenSlugs((s) => (s.has(slug) ? s : new Set(s).add(slug)));
  };

  const toggle = (slug: string) => {
    if (!openSlugs.has(slug)) markStarted(slug);
    setOpenSlugs((s) => {
      const next = new Set(s);
      if (!next.delete(slug)) next.add(slug);
      return next;
    });
  };

  return (
    <Section id="projects" title="what I'm building">
      <div className={styles.list}>
        <p className={cx(styles.status, 'muted')}>
          {`Tasks: ${String(projects.length)} total, ${String(started.size)} complete; sorted by impact`}
        </p>
        <div aria-hidden="true" className={cx(styles.header, 'muted')}>
          <span>PID</span>
          <span>NAME</span>
          <span>STATE</span>
          <span>METRIC</span>
        </div>
        <ul>
          {projects.map((p) => (
            <ProcessRow
              key={p.slug}
              project={p}
              open={openSlugs.has(p.slug)}
              started={started.has(p.slug)}
              onToggle={() => {
                toggle(p.slug);
              }}
              onReveal={() => {
                reveal(p.slug);
              }}
            />
          ))}
        </ul>
        <details className={styles.archive}>
          <summary
            className={styles.archiveSummary}
          >{`archive (${String(archive.length)})`}</summary>
          <ul>
            {archive.map((a) => (
              <li key={a.name}>
                {a.repo ? (
                  <a href={a.repo} rel="noreferrer">
                    {a.name}
                  </a>
                ) : (
                  a.name
                )}
                {a.description ? <span className="muted">{` · ${a.description}`}</span> : null}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </Section>
  );
}
