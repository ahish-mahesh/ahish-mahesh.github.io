import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { archive, projects } from '../../content/projects.ts';
import type { Project } from '../../content/types.ts';
import { cx } from '../cx.ts';
import { MigrationPanel } from '../MigrationPanel/MigrationPanel.tsx';
import { PipelineDiagram } from '../PipelineDiagram/PipelineDiagram.tsx';
import { PROJECT_HASH_PREFIX as HASH_PREFIX, projectButtonId } from '../sections.ts';
import { Section } from '../Section/Section.tsx';
import styles from './Projects.module.css';

function hashSlug(): string | undefined {
  const hash = window.location.hash;
  if (!hash.startsWith(HASH_PREFIX)) return undefined;
  const slug = hash.slice(HASH_PREFIX.length);
  return projects.some((p) => p.slug === slug) ? slug : undefined;
}

function Bullets({ project }: { project: Project }) {
  return (
    <ul className={cx('prose', styles.bullets)}>
      {project.bullets.map((b) => (
        <li key={b}>{b}</li>
      ))}
    </ul>
  );
}

function Featured({ project }: { project: Project }) {
  const headingId = projectButtonId(project.slug);
  return (
    <article id={`project-${project.slug}`} aria-labelledby={headingId} className={styles.featured}>
      <div className={styles.featuredText}>
        <p className={cx(styles.label, 'muted')}>KLA Corporation</p>
        <h3 id={headingId} tabIndex={-1} className={styles.headline}>
          {project.headline}
        </h3>
        <p className={styles.metric}>{project.metric}</p>
        <Bullets project={project} />
        <p>
          <span className="muted">stack: </span>
          {project.stack.join(' · ')}
        </p>
      </div>
      <MigrationPanel />
    </article>
  );
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
      <div className={styles.rowText}>
        <p className={cx(styles.label, 'muted')}>{project.name}</p>
        <h3 className={styles.headline}>{project.headline}</h3>
        <p className="prose">{project.summary}</p>
      </div>
      <div className={styles.rowMeta}>
        <p className={styles.metric}>{project.metric}</p>
        <p className="muted">{(project.fullStack ?? project.stack).join(' · ')}</p>
        {project.repo ? (
          <p>
            <a href={project.repo} rel="noreferrer">
              source on github
            </a>
          </p>
        ) : null}
      </div>
      <button
        type="button"
        id={projectButtonId(project.slug)}
        className={styles.button}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span aria-hidden="true">{open ? '[-] ' : '[+] '}</span>
        details <span className="visually-hidden">{`for ${project.name}`}</span>
      </button>
      <div
        id={panelId}
        ref={panelRef}
        className={cx(styles.panel, project.visual === 'pipeline' && styles.panelWithVisual)}
      >
        <Bullets project={project} />
        {project.visual === 'pipeline' && project.diagram ? (
          <PipelineDiagram source={project.diagram} caption={project.diagramCaption} />
        ) : null}
      </div>
    </li>
  );
}

export function Projects() {
  const [featured, ...rest] = projects;
  const [openSlugs, setOpenSlugs] = useState<ReadonlySet<string>>(() => {
    const slug = hashSlug();
    return new Set(slug ? [slug] : []);
  });

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
    <Section id="projects" title="what I've shipped">
      {featured ? <Featured project={featured} /> : null}
      <ul className={styles.rows}>
        {rest.map((p) => (
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
    </Section>
  );
}
