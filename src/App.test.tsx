import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App.tsx';
import { ThemeProvider } from './theme/ThemeProvider.tsx';

function renderApp() {
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  );
}

describe('App', () => {
  it('has exactly one h1 with the name', () => {
    renderApp();
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveAccessibleName('Ahish Mahesh');
  });

  it('has the section headings in order', () => {
    renderApp();
    const headings = screen.getAllByRole('heading', { level: 2 });
    const expected = ["what I'm building", "where I've worked", 'what I reach for', 'saying hello'];
    expect(headings).toHaveLength(expected.length);
    headings.forEach((h, i) => {
      expect(h).toHaveAccessibleName(expected[i]);
    });
  });

  it('has landmarks', () => {
    renderApp();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'primary' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('has a working skip link', () => {
    const { container } = renderApp();
    expect(screen.getByRole('link', { name: 'skip to content' })).toHaveAttribute('href', '#main');
    expect(container.querySelector('#main')).not.toBeNull();
  });

  it('points every in-page link at an existing id', () => {
    const { container } = renderApp();
    const anchors = container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    expect(anchors.length).toBeGreaterThan(0);
    for (const a of anchors) {
      const id = a.getAttribute('href')?.slice(1) ?? '';
      expect(container.querySelector(`[id="${id}"]`), `missing #${id}`).not.toBeNull();
    }
  });

  it('links to email and resume, with no phone link', () => {
    const { container } = renderApp();
    expect(container.querySelector('a[href="mailto:ahish.mahesh@gmail.com"]')).not.toBeNull();
    expect(container.querySelector('a[href="/resume.pdf"]')).not.toBeNull();
    expect(container.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it('contains no em-dashes', () => {
    const { container } = renderApp();
    expect(container.textContent).not.toContain('—');
  });
});
