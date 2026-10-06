import type { ReactNode } from 'react';
import { useActiveSectionId } from '../../hooks/ActiveSectionContext.ts';
import styles from './Section.module.css';

interface SectionProps {
  id: string;
  title: string;
  prompt?: string;
  children: ReactNode;
}

export function Section({ id, title, prompt = '## ', children }: SectionProps) {
  const active = useActiveSectionId();
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={styles.section}
      data-dim={active === null ? undefined : String(active !== id)}
    >
      <h2 id={headingId} className={styles.heading}>
        <span aria-hidden="true" className={styles.prompt}>
          {prompt}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
