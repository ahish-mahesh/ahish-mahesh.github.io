import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { profile } from '../../content/profile.ts';
import { Hero } from './Hero.tsx';

vi.mock('./HeroVisual.tsx', () => ({
  HeroVisual: () => <div data-testid="hero-visual" />,
}));

describe('Hero', () => {
  it('has the name as the heading', () => {
    render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(profile.name);
  });

  it('lists four facts with their keys and values', () => {
    const { container } = render(<Hero />);
    const dl = container.querySelector('dl');
    expect(dl).not.toBeNull();
    const terms = dl ? within(dl).getAllByRole('term') : [];
    expect(terms.map((t) => t.textContent)).toEqual(['now', 'before', 'school', 'status']);
    expect(screen.getByText(profile.status)).toBeInTheDocument();
  });

  it('renders no status dot', () => {
    const { container } = render(<Hero />);
    expect(container.textContent).not.toContain('●');
  });

  it('links email, resume and linkedin', () => {
    render(<Hero />);
    expect(screen.getByRole('link', { name: /email/ })).toHaveAttribute(
      'href',
      `mailto:${profile.email}`,
    );
    expect(screen.getByRole('link', { name: /résumé/ })).toHaveAttribute('href', '/resume.pdf');
    expect(screen.getByRole('link', { name: /linkedin/ })).toHaveAttribute(
      'href',
      profile.links.linkedin,
    );
  });
});
