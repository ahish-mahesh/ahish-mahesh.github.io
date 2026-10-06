import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ActiveSectionContext } from '../../hooks/ActiveSectionContext.ts';
import { Section } from './Section.tsx';

function renderSection(active: 'projects' | 'work' | null) {
  render(
    <ActiveSectionContext value={active}>
      <Section id="projects" title="what I'm building">
        <p>body</p>
      </Section>
    </ActiveSectionContext>,
  );
  return screen.getByRole('region', { name: "what I'm building" });
}

describe('Section', () => {
  it('is dimmed when another section is active', () => {
    expect(renderSection('work')).toHaveAttribute('data-dim', 'true');
  });

  it('is not dimmed when it is the active section', () => {
    expect(renderSection('projects')).toHaveAttribute('data-dim', 'false');
  });

  it('has no data-dim before the active section is known', () => {
    expect(renderSection(null)).not.toHaveAttribute('data-dim');
  });
});
