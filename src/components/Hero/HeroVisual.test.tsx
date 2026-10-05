import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isSlowDevice, supportsWebGL } from '../../hero3d/capabilities.ts';
import { mockMatchMedia } from '../../test/matchMedia.ts';
import { HeroVisual } from './HeroVisual.tsx';

const handlers: { onFirstFrame: () => void; onDemote: () => void } = {
  onFirstFrame: () => undefined,
  onDemote: () => undefined,
};

vi.mock('../../hero3d/AsciiHero.tsx', () => ({
  default: (props: { onFirstFrame: () => void; onDemote: () => void }) => {
    handlers.onFirstFrame = props.onFirstFrame;
    handlers.onDemote = props.onDemote;
    return <div data-testid="ascii-hero" />;
  },
}));

vi.mock('../../hero3d/capabilities.ts', () => ({
  supportsWebGL: vi.fn(() => true),
  isSlowDevice: vi.fn(() => false),
}));

function wideViewport(wide = true) {
  mockMatchMedia((q) => q.includes('min-width: 720px') && wide);
}

async function flush() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(500);
  });
}

describe('HeroVisual', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(supportsWebGL).mockReturnValue(true);
    vi.mocked(isSlowDevice).mockReturnValue(false);
    // Force the setTimeout fallback path so fake timers drive it.
    Object.defineProperty(window, 'requestIdleCallback', { configurable: true, value: undefined });
    wideViewport();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the static frame immediately inside an aria-hidden wrapper', () => {
    const { container } = render(<HeroVisual />);
    expect(screen.getByTestId('static-frame')).toHaveAttribute('data-hidden', 'false');
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByTestId('ascii-hero')).not.toBeInTheDocument();
  });

  it('never mounts the 3D scene on a narrow viewport', async () => {
    wideViewport(false);
    render(<HeroVisual />);
    await flush();
    expect(screen.queryByTestId('ascii-hero')).not.toBeInTheDocument();
  });

  it('never mounts under reduced motion', async () => {
    mockMatchMedia(
      (q) => q.includes('min-width: 720px') || q.includes('prefers-reduced-motion: reduce'),
    );
    render(<HeroVisual />);
    await flush();
    expect(screen.queryByTestId('ascii-hero')).not.toBeInTheDocument();
  });

  it('never mounts without WebGL', async () => {
    vi.mocked(supportsWebGL).mockReturnValue(false);
    render(<HeroVisual />);
    await flush();
    expect(screen.queryByTestId('ascii-hero')).not.toBeInTheDocument();
  });

  it('never mounts on a slow device', async () => {
    vi.mocked(isSlowDevice).mockReturnValue(true);
    render(<HeroVisual />);
    await flush();
    expect(screen.queryByTestId('ascii-hero')).not.toBeInTheDocument();
  });

  it('mounts after idle, hides the static frame on first frame, and restores it on demote', async () => {
    render(<HeroVisual />);
    await flush();
    await flush();
    expect(screen.getByTestId('ascii-hero')).toBeInTheDocument();

    act(() => {
      handlers.onFirstFrame();
    });
    expect(screen.getByTestId('static-frame')).toHaveAttribute('data-hidden', 'true');

    act(() => {
      handlers.onDemote();
    });
    expect(screen.queryByTestId('ascii-hero')).not.toBeInTheDocument();
    expect(screen.getByTestId('static-frame')).toHaveAttribute('data-hidden', 'false');
  });
});
