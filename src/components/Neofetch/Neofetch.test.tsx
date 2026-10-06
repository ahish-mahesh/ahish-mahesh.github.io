import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { skills } from '../../content/skills.ts';
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
      for (const v of s.values) {
        expect(screen.getAllByText(v).length).toBeGreaterThan(0);
      }
    }
  });

  it('hides the logo from assistive tech', () => {
    const { container } = render(<Neofetch />);
    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders exactly 3 colour blocks', () => {
    render(<Neofetch />);
    expect(screen.getByTestId('color-blocks').children).toHaveLength(3);
  });
});
