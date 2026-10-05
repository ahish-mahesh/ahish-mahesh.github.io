import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App.tsx';

describe('App', () => {
  it('renders the name as the page heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /ahish mahesh/i })).toBeInTheDocument();
  });

  it('has a main landmark', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('links to the email address', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /email/i })).toHaveAttribute(
      'href',
      'mailto:ahish.mahesh@gmail.com',
    );
  });
});
