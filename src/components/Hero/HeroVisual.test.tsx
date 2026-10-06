import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isSlowDevice, supportsWebGL } from '../../hero3d/capabilities.ts';
import { mockMatchMedia } from '../../test/matchMedia.ts';
import { HeroVisual } from './HeroVisual.tsx';

interface MockProps {
  onFirstFrame: () => void;
  onDemote: () => void;
  resolution?: number;
}

const handlers: MockProps = {
  onFirstFrame: () => undefined,
  onDemote: () => undefined,
};

vi.mock('../../hero3d/AsciiHero.tsx', () => ({
  default: (props: MockProps) => {
    handlers.onFirstFrame = props.onFirstFrame;
    handlers.onDemote = props.onDemote;
    return <div data-testid="ascii-hero" data-resolution={props.resolution} />;
  },
}));

vi.mock('../../hero3d/capabilities.ts', () => ({
  supportsWebGL: vi.fn(() => true),
  isSlowDevice: vi.fn(() => false),
}));

function narrowViewport(narrow = true) {
  mockMatchMedia((q) => q.includes('max-width: 719.98px') && narrow);
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
    narrowViewport(false);
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

  it('mounts the 3D scene at the desktop resolution on a wide viewport', async () => {
    render(<HeroVisual />);
    await flush();
    await flush();
    expect(screen.getByTestId('ascii-hero')).toHaveAttribute('data-resolution', '0.15');
  });

  it('mounts the 3D scene on a narrow viewport too, at the finer phone resolution', async () => {
    narrowViewport();
    render(<HeroVisual />);
    await flush();
    await flush();
    expect(screen.getByTestId('ascii-hero')).toHaveAttribute('data-resolution', '0.3');
  });

  it('never mounts under reduced motion, on any width', async () => {
    mockMatchMedia(
      (q) => q.includes('max-width: 719.98px') || q.includes('prefers-reduced-motion: reduce'),
    );
    render(<HeroVisual />);
    await flush();
    expect(screen.queryByTestId('ascii-hero')).not.toBeInTheDocument();
  });

  it('never mounts without WebGL, on any width', async () => {
    narrowViewport();
    vi.mocked(supportsWebGL).mockReturnValue(false);
    render(<HeroVisual />);
    await flush();
    expect(screen.queryByTestId('ascii-hero')).not.toBeInTheDocument();
  });

  it('never mounts on a slow device, on any width', async () => {
    narrowViewport();
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
