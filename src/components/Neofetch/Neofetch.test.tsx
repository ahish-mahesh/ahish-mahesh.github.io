import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { neofetchTitle, skills } from '../../content/skills.ts';
import { Neofetch } from './Neofetch.tsx';

describe('Neofetch', () => {
  it('renders a dt for every skills row', () => {
    render(<Neofetch />);
    for (const s of skills) {
      expect(screen.getByText(s.key, { selector: 'dt' })).toBeInTheDocument();
    }
  });

  it('renders every value', () => {
    render(<Neofetch />);
    for (const s of skills) {
      const dd = screen.getByText(s.key, { selector: 'dt' }).nextElementSibling;
      for (const v of s.values) {
        expect(dd?.textContent).toContain(v);
      }
    }
  });

  it('hides the logo from assistive tech', () => {
    const { container } = render(<Neofetch />);
    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the title', () => {
    render(<Neofetch />);
    expect(screen.getByText(neofetchTitle)).toBeInTheDocument();
  });

  it('renders 7 colour blocks in theme order', () => {
    render(<Neofetch />);
    const kids = Array.from(screen.getByTestId('color-blocks').children) as HTMLElement[];
    expect(kids).toHaveLength(7);
    expect(kids.map((k) => k.getAttribute('style'))).toEqual(
      ['--bg', '--fg', '--muted', '--accent', '--num', '--ident', '--border'].map(
        (v) => `background: var(${v});`,
      ),
    );
  });
});
