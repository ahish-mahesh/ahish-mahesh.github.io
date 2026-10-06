import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useInView } from 'motion/react';
import { usePageVisible } from '../hooks/usePageVisible.ts';
import { AsciiPass } from './AsciiPass.tsx';
import { DbCylinders } from './DbCylinders.tsx';
import { FrameStats, shouldDemote, shouldRender } from './motion.ts';
import styles from './AsciiHero.module.css';

/** Characters per CSS pixel across. Desktop default; HeroVisual passes a finer one on phones. */
const DEFAULT_RESOLUTION = 0.15;
const WARMUP_FRAMES = 10;
const RESUME_SKIP = 2;
const PERF_LOG_MS = 2000;

const search = window.location.search;
const PERF = search.includes('perf');
const SNAPSHOT = import.meta.env.DEV && search.includes('snapshot');

interface Callbacks {
  onFirstFrame: () => void;
  onDemote: () => void;
}

export interface AsciiHeroProps extends Callbacks {
  /** Characters per CSS pixel; must match the static frame's cell (Hero.module.css --ascii-res). */
  resolution?: number;
}

interface DriverProps extends Callbacks {
  inView: boolean;
}

function Driver({ inView, onFirstFrame, onDemote }: DriverProps) {
  const advance = useThree((s) => s.advance);
  const pageVisible = usePageVisible();
  const active = inView && pageVisible;

  const callbacks = useRef({ onFirstFrame, onDemote });
  useEffect(() => {
    callbacks.current = { onFirstFrame, onDemote };
  });

  const [stats] = useState(() => new FrameStats(60));
  const progress = useRef({ frames: 0, first: false, done: false, lastLog: 0 });

  useEffect(() => {
    const p = progress.current;
    if (!active || p.done) return;

    let raf = 0;
    let last = -Infinity;
    let skip = p.frames === 0 ? WARMUP_FRAMES : RESUME_SKIP;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!shouldRender(now, last)) return;
      last = now;

      const start = performance.now();
      // advance() takes seconds in frameloop="never"; useFrame deltas derive from it.
      advance(now / 1000);
      const ms = performance.now() - start;
      p.frames += 1;

      if (!p.first) {
        p.first = true;
        callbacks.current.onFirstFrame();
      }

      // AsciiPass logs the snapshot text during the advance above.
      if (SNAPSHOT) {
        p.done = true;
        cancelAnimationFrame(raf);
        return;
      }

      if (skip > 0) {
        skip -= 1;
        return;
      }
      stats.push(ms);

      if (PERF && now - p.lastLog >= PERF_LOG_MS && stats.full) {
        p.lastLog = now;
        console.info(`hero3d: ${stats.mean.toFixed(2)} ms/frame`);
      }

      if (shouldDemote(stats)) {
        p.done = true;
        cancelAnimationFrame(raf);
        callbacks.current.onDemote();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [active, advance, stats]);

  return null;
}

export default function AsciiHero({
  onFirstFrame,
  onDemote,
  resolution = DEFAULT_RESOLUTION,
}: AsciiHeroProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const pre = useRef<HTMLPreElement>(null);
  const inView = useInView(wrap);
  const write = useCallback((html: string) => {
    if (pre.current) pre.current.innerHTML = html;
  }, []);

  return (
    <div
      ref={wrap}
      className={styles.wrap}
      style={{ '--ascii-res': String(resolution) } as CSSProperties}
    >
      <Canvas
        frameloop="never"
        dpr={1}
        flat
        gl={{ antialias: false, powerPreference: 'low-power' }}
        camera={{ position: [0, 2, 7.4], fov: 30 }}
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.03} />
        <directionalLight position={[-4, 1.5, 3]} intensity={1.3} />
        <directionalLight position={[2, 1, -3]} intensity={0.4} />
        <DbCylinders frozen={SNAPSHOT} />
        <AsciiPass
          write={write}
          activeClass={styles.active ?? ''}
          resolution={resolution}
          snapshot={SNAPSHOT}
        />
        <Driver inView={inView} onFirstFrame={onFirstFrame} onDemote={onDemote} />
      </Canvas>
      <pre ref={pre} className={styles.ascii} />
    </div>
  );
}
