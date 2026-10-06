import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { profile } from '../../content/profile.ts';
import { Contact } from './Contact.tsx';

describe('Contact', () => {
  it('has a prominent mailto link named by the address', () => {
    render(<Contact />);
    const link = screen.getByRole('link', { name: profile.email });
    expect(link).toHaveAttribute('href', `mailto:${profile.email}`);
  });

  it('shows linkedin and github as bare hostnames', () => {
    render(<Contact />);
    expect(screen.getByRole('link', { name: 'linkedin.com/in/ahish-mahesh' })).toHaveAttribute(
      'href',
      profile.links.linkedin,
    );
    expect(screen.getByRole('link', { name: 'github.com/ahish-mahesh' })).toHaveAttribute(
      'href',
      profile.links.github,
    );
  });

  it('links the resume pdf', () => {
    render(<Contact />);
    expect(screen.getByRole('link', { name: 'resume.pdf' })).toHaveAttribute('href', '/resume.pdf');
  });

  it('states work authorization', () => {
    render(<Contact />);
    expect(screen.getByText(profile.workAuthorization)).toBeInTheDocument();
  });

  it('has no tel links', () => {
    const { container } = render(<Contact />);
    expect(container.querySelector('a[href^="tel:"]')).toBeNull();
  });
});
