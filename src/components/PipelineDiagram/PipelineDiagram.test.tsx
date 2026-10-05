import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { mockReducedMotion } from '../../test/matchMedia.ts';
import { PipelineDiagram } from './PipelineDiagram.tsx';

const SOURCE = 'mic ──▶ AudioCapture ──▶ ring buffer';

describe('PipelineDiagram', () => {
  it('renders one figure with its caption', () => {
    render(<PipelineDiagram source={SOURCE} caption="pipeline: audio to summary" />);
    expect(screen.getAllByRole('figure')).toHaveLength(1);
    expect(screen.getByText(/^pipeline:/)).toBeInTheDocument();
  });

  it('keeps the ascii source in the DOM', () => {
    render(<PipelineDiagram source={SOURCE} />);
    expect(screen.getByText(SOURCE)).toBeInTheDocument();
  });

  it('shows final state with no animation under reduced motion', () => {
    mockReducedMotion();
    const { container } = render(<PipelineDiagram source={SOURCE} />);
    expect(container.querySelectorAll('animateMotion')).toHaveLength(0);
    expect(screen.getAllByText(/16x real-time/).length).toBeGreaterThan(0);
  });

  it('has no packets before it scrolls into view', () => {
    const { container } = render(<PipelineDiagram source={SOURCE} />);
    expect(container.querySelectorAll('animateMotion')).toHaveLength(0);
    expect(screen.queryAllByTestId('packet')).toHaveLength(0);
  });
});
