import { useEffect, useId, useRef, useState } from 'react';
import { animate, m, useInView, useMotionValue, useTransform } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion.ts';
import {
  ARROW,
  PACKET_R,
  edgePath,
  edges,
  nodes,
  packetPath,
  viewBox,
  x,
  y,
  type Sub,
} from './pipeline.ts';
import styles from './PipelineDiagram.module.css';

const STROKE = 0.07;
const DRAW_S = 0.45;
const STAGGER_S = 0.4;
const PACKET_S = 3;
const COUNT_S = 1.6;
const TARGET = 16;
const DRAWN_MS = ((edges.length - 1) * STAGGER_S + DRAW_S) * 1000;
const FINAL = `${String(TARGET)}x real-time`;

interface PipelineDiagramProps {
  source: string;
  caption?: string;
}

function SubLabel({ sub }: { sub: Sub }) {
  return (
    <text x={x(sub.col)} y={y(sub.row + 0.5)} dominantBaseline="central" fill="var(--muted)">
      {sub.text}
    </text>
  );
}

export function PipelineDiagram({ source, caption }: PipelineDiagramProps) {
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '_');
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.4 });
  const visible = useInView(svgRef);
  const [drawn, setDrawn] = useState(false);
  const count = useMotionValue(0);
  const text = useTransform(count, (v) => `${String(Math.round(v))}x real-time`);

  useEffect(() => {
    if (reduceMotion || !inView) return;
    const timer = window.setTimeout(() => {
      setDrawn(true);
    }, DRAWN_MS);
    const controls = animate(count, TARGET, { duration: COUNT_S, ease: 'easeOut' });
    return () => {
      window.clearTimeout(timer);
      controls.stop();
    };
  }, [reduceMotion, inView, count]);

  // Packets run on the SVG timeline, so pause it while offscreen.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (visible) {
      if (typeof svg.unpauseAnimations === 'function') svg.unpauseAnimations();
    } else if (typeof svg.pauseAnimations === 'function') {
      svg.pauseAnimations();
    }
  }, [visible, drawn]);

  const markerId = `${uid}-arrow`;
  const showPackets = drawn && !reduceMotion;

  return (
    <figure className={styles.figure}>
      <div ref={wrapRef} className={styles.scroll}>
        <svg ref={svgRef} aria-hidden="true" className={styles.svg} viewBox={viewBox}>
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerUnits="userSpaceOnUse"
              markerWidth={ARROW}
              markerHeight={ARROW}
              orient="auto"
            >
              <path d="M0 0 L10 5 L0 10 z" fill="var(--accent)" />
            </marker>
          </defs>
          {nodes.map((n) => (
            <g key={n.id}>
              <text x={x(n.col)} y={y(n.row + 0.5)} dominantBaseline="central" fill="currentColor">
                {n.label}
              </text>
              {n.sub ? <SubLabel sub={n.sub} /> : null}
            </g>
          ))}
          {edges.map((e, i) => (
            <g key={e.id}>
              <m.path
                d={edgePath(e.points)}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={STROKE}
                strokeLinejoin="round"
                markerEnd={`url(#${markerId})`}
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                animate={reduceMotion ? undefined : inView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: DRAW_S, delay: i * STAGGER_S, ease: 'easeInOut' }}
              />
              {e.label ? <SubLabel sub={e.label} /> : null}
            </g>
          ))}
          {showPackets
            ? edges.map((e, i) => (
                // No cx/cy: animateMotion translates from the origin.
                <circle key={e.id} data-testid="packet" r={PACKET_R} fill="var(--accent)">
                  <animateMotion
                    dur={`${String(PACKET_S)}s`}
                    begin={`${(i * 0.35).toFixed(2)}s`}
                    repeatCount="indefinite"
                    path={packetPath(e.points)}
                  />
                </circle>
              ))
            : null}
        </svg>
      </div>
      <p className={styles.counter}>
        <m.span aria-hidden="true">{reduceMotion ? FINAL : text}</m.span>
        <span className="visually-hidden">{`${FINAL} transcription`}</span>
      </p>
      <pre className="visually-hidden">{source}</pre>
      {caption ? <figcaption className="muted">{caption}</figcaption> : null}
    </figure>
  );
}
