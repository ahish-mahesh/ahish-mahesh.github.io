import type { ReactNode } from 'react';
import { cx } from '../cx.ts';
import styles from './Section.module.css';

interface SectionProps {
  id: string;
  title: string;
  command?: string;
  className?: string;
  children: ReactNode;
}

export function Section({ id, title, command, className, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={cx(styles.section, className)}>
      {command ? (
        <p className={styles.command} aria-hidden="true">
          <span className={styles.prompt}>$</span> {command}
        </p>
      ) : null}
      <h2 id={headingId} className={styles.heading}>
        {title}
      </h2>
      {children}
    </section>
  );
}
