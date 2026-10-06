import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { archive, projects } from '../../content/projects.ts';
import type { Project } from '../../content/types.ts';
import { cx } from '../cx.ts';
import { MigrationPanel } from '../MigrationPanel/MigrationPanel.tsx';
import { PipelineDiagram } from '../PipelineDiagram/PipelineDiagram.tsx';
import {
  PROJECT_HASH_PREFIX as HASH_PREFIX,
  projectButtonId,
  sectionPrompts,
} from '../sections.ts';
import { Section } from '../Section/Section.tsx';
import { ProcessBar } from './ProcessBar.tsx';
import styles from './Projects.module.css';

function hashSlug(): string | undefined {
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return undefined;
  const slug = hash.slice(HASH_PREFIX.length);
  return projects.some((p) => p.slug === slug) ? slug : undefined;
}

/** The first project (the KLA migration) is open on first render; a hash adds its row. */
function initialOpen(): ReadonlySet<string> {
  const open = new Set<string>();
  const [first] = projects;
  if (first) open.add(first.slug);
  const slug = hashSlug();
  if (slug) open.add(slug);
  return open;
}

interface RowProps {
  project: Project;
  open: boolean;
  onToggle: () => void;
  onReveal: () => void;
}

function Row({ project, open, onToggle, onReveal }: RowProps) {
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
      <div className={styles.head}>
        <h3 className={styles.heading}>
          <button
            type="button"
            id={projectButtonId(project.slug)}
            className={styles.button}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
          >
            <span className={cx(styles.pid, 'muted')}>{project.pid}</span>
            <span className={styles.name}>{project.name}</span>
            <span aria-hidden="true" className={styles.stack}>
              {project.stack.join(' ')}
            </span>
            <ProcessBar />
            <span className={styles.metric}>{project.metric}</span>
          </button>
        </h3>
        {/* Outside the button so the heading stays short; the button's ::after stretches over this. */}
        <div className={styles.describe}>
          <p className="prose muted">{project.headline}</p>
        </div>
      </div>
      <div
        id={panelId}
        ref={panelRef}
        className={cx(
          styles.panel,
          project.visual === 'migration' && styles.panelMigration,
          project.visual === 'pipeline' && styles.panelPipeline,
        )}
      >
        <div className={styles.panelText}>
          <ul className={cx('prose', styles.bullets)}>
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
        </div>
        {project.visual === 'migration' ? <MigrationPanel /> : null}
        {project.visual === 'pipeline' && project.diagram ? (
          <PipelineDiagram source={project.diagram} caption={project.diagramCaption} />
        ) : null}
      </div>
    </li>
  );
}

export function Projects() {
  const [openSlugs, setOpenSlugs] = useState<ReadonlySet<string>>(initialOpen);

  useEffect(() => {
    const onHashChange = () => {
      const slug = hashSlug();
      if (slug) setOpenSlugs((s) => new Set(s).add(slug));
    };
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const reveal = (slug: string) => {
    setOpenSlugs((s) => (s.has(slug) ? s : new Set(s).add(slug)));
  };

  const toggle = (slug: string) => {
    setOpenSlugs((s) => {
      const next = new Set(s);
      if (!next.delete(slug)) next.add(slug);
      return next;
    });
  };

  return (
    <Section id="projects" title="what I've shipped" command={sectionPrompts.projects}>
      <div className={styles.list}>
        <p className={cx(styles.status, 'muted')}>
          {`Tasks: ${String(projects.length)} total; sorted by impact`}
        </p>
        <div aria-hidden="true" className={cx(styles.header, 'muted')}>
          <span>PID</span>
          <span>NAME</span>
          <span className={styles.headerStack}>STACK</span>
          <span>STATE</span>
          <span>METRIC</span>
        </div>
        <ul>
          {projects.map((p) => (
            <Row
              key={p.slug}
              project={p}
              open={openSlugs.has(p.slug)}
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
          <summary className={styles.archiveSummary}>
            {`${String(archive.length)} smaller projects`}
          </summary>
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
