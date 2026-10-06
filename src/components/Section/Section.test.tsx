import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Section } from './Section.tsx';

describe('Section', () => {
  it('is a region named by its heading, without a prompt prefix', () => {
    render(
      <Section id="projects" title="what I've shipped">
        <p>body</p>
      </Section>,
    );
    const region = screen.getByRole('region', { name: "what I've shipped" });
    expect(region).toHaveAttribute('id', 'projects');
    expect(region).not.toHaveAttribute('data-dim');
    expect(region.textContent).not.toContain('##');
  });

  it('merges a custom className', () => {
    render(
      <Section id="x" title="t" className="extra">
        <p>body</p>
      </Section>,
    );
    expect(screen.getByRole('region', { name: 't' })).toHaveClass('extra');
  });

  it('renders an aria-hidden command line when given', () => {
    render(
      <Section id="x" title="t" command="htop">
        <p>body</p>
      </Section>,
    );
    const cmd = screen.getByText('htop', { exact: false, selector: 'p' });
    expect(cmd).toHaveAttribute('aria-hidden', 'true');
    expect(cmd.textContent).toBe('$ htop');
  });

  it('renders no command line without the prop', () => {
    const { container } = render(
      <Section id="x" title="t">
        <p>body</p>
      </Section>,
    );
    expect(container.querySelector('[aria-hidden]')).toBeNull();
  });
});
