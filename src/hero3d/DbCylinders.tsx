import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, CylinderGeometry, MeshLambertMaterial, type Group } from 'three';
import { damp } from './motion.ts';

const RADIUS = 1.25;
const HEIGHT = 0.42;
const GAP = 0.55;
const SEGMENTS = 64;
const MAX_TILT = 0.35;
const SWAY = 0.08;
const TILT_LAMBDA = 3;
const GLOW_BASE = 0.04;
const TOP_BOOST = 0.55;
const MAX_DT = 0.1;

/**
 * Colour code per platter, bottom to top. G carries brightness for the ASCII pass;
 * R and B identify the platter (see pixelId in ascii.ts). The lights are white, so
 * shading scales all three channels together and the code survives.
 */
const PLATTER_CODES: readonly (readonly [number, number, number])[] = [
  [1, 1, 0],
  [0, 1, 1],
  [1, 1, 1],
];

interface DbCylindersProps {
  /** Fixed deterministic pose: no sway or tilt. */
  frozen?: boolean;
}

export function DbCylinders({ frozen = false }: DbCylindersProps) {
  const tilt = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const geometry = useMemo(() => new CylinderGeometry(RADIUS, RADIUS, HEIGHT, SEGMENTS), []);
  // CylinderGeometry groups: 0 side, 1 top, 2 bottom. Tops glow brighter so each disc reads.
  const materials = useMemo(
    () =>
      PLATTER_CODES.map(([r, g, b]) => {
        const code = new Color(r, g, b);
        const side = new MeshLambertMaterial({
          color: code,
          emissive: code,
          emissiveIntensity: GLOW_BASE,
        });
        const top = new MeshLambertMaterial({
          color: code,
          emissive: code,
          emissiveIntensity: GLOW_BASE + TOP_BOOST,
        });
        return [side, top, side];
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      for (const [side, top] of materials) {
        side?.dispose();
        top?.dispose();
      }
    },
    [geometry, materials],
  );

  useEffect(() => {
    if (frozen || window.matchMedia('(hover: none)').matches) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
    };
  }, [frozen]);

  useFrame((state, delta) => {
    const outer = tilt.current;
    if (!outer) return;

    if (frozen) {
      outer.rotation.set(0, 0, 0);
      return;
    }

    const dt = Math.min(Math.max(delta, 0), MAX_DT);
    const t = state.clock.elapsedTime;
    const swayX = Math.sin(t * 0.4) * SWAY;
    const swayZ = Math.cos(t * 0.3) * SWAY;
    const targetX = pointer.current.y * MAX_TILT + swayX;
    const targetZ = -pointer.current.x * MAX_TILT + swayZ;
    outer.rotation.x = damp(outer.rotation.x, targetX, TILT_LAMBDA, dt);
    outer.rotation.z = damp(outer.rotation.z, targetZ, TILT_LAMBDA, dt);
  });

  return (
    <group ref={tilt}>
      {materials.map((material, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={material}
          position={[0, (i - 1) * (HEIGHT + GAP), 0]}
        />
      ))}
    </group>
  );
}
