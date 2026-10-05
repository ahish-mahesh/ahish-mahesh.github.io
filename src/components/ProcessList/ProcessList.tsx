import { useEffect, useState } from 'react';
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
  index: number;
  open: boolean;
  onToggle: () => void;
}

function ProcessRow({ project, index, open, onToggle }: ProcessRowProps) {
  const panelId = `panel-${project.slug}`;

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
          <span className={cx(styles.stack, 'muted')}>{project.stack.join(' ')}</span>
          <ProcessBar fill={project.barFill} index={index} />
          <span className={styles.metric}>{project.metric}</span>
        </button>
      </h3>
      <p className={styles.summary}>{project.summary}</p>
      <div id={panelId} hidden={!open} className={styles.panel}>
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

  useEffect(() => {
    const onHashChange = () => {
      const slug = hashSlug();
      if (slug) {
        setOpenSlugs((s) => new Set(s).add(slug));
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const toggle = (slug: string) => {
    setOpenSlugs((s) => {
      const next = new Set(s);
      if (!next.delete(slug)) next.add(slug);
      return next;
    });
  };

  return (
    <Section id="projects" title="what I'm building">
      <div className={styles.list}>
        <div aria-hidden="true" className={cx(styles.header, 'muted')}>
          <span>PID</span>
          <span>NAME</span>
          <span className={styles.stack}>STACK</span>
          <span className={styles.metricHead}>METRIC</span>
        </div>
        <ul>
          {projects.map((p, i) => (
            <ProcessRow
              key={p.slug}
              project={p}
              index={i}
              open={openSlugs.has(p.slug)}
              onToggle={() => {
                toggle(p.slug);
              }}
            />
          ))}
        </ul>
        <h3 className={styles.archiveHeading}>archive</h3>
        <ul className={styles.archive}>
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
      </div>
    </Section>
  );
}
