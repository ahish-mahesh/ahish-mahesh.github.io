import type { ReactNode } from 'react';
import { cx } from '../cx.ts';
import styles from './Section.module.css';

interface SectionProps {
  id: string;
  title: string;
  className?: string;
  children: ReactNode;
}

export function Section({ id, title, className, children }: SectionProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={cx(styles.section, className)}>
      <h2 id={headingId} className={styles.heading}>
        {title}
      </h2>
      {children}
    </section>
  );
}
