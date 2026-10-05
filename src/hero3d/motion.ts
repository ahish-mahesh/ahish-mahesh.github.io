/** Target render rate for the ASCII hero. */
export const FPS = 30;
/** Mean frame cost (ms) above which the hero falls back to the static frame. */
export const DEMOTE_MS = 8;

/** True when enough time has passed for the next frame, with 1ms of slack for rAF jitter. */
export function shouldRender(now: number, last: number, fps: number = FPS): boolean {
  return now - last >= 1000 / fps - 1;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Frame-rate independent smoothing toward a target. */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/** Rolling window of the last `size` frame times. */
export class FrameStats {
  private readonly samples: number[] = [];
  private next = 0;

  private readonly size: number;

  constructor(size = 60) {
    this.size = size;
  }

  push(ms: number): void {
    if (this.samples.length < this.size) {
      this.samples.push(ms);
    } else {
      this.samples[this.next] = ms;
    }
    this.next = (this.next + 1) % this.size;
  }

  get mean(): number {
    if (this.samples.length === 0) return 0;
    let sum = 0;
    for (const s of this.samples) sum += s;
    return sum / this.samples.length;
  }

  get full(): boolean {
    return this.samples.length >= this.size;
  }

  reset(): void {
    this.samples.length = 0;
    this.next = 0;
  }
}

/** True once the window is full and the mean frame cost is over the limit. */
export function shouldDemote(stats: FrameStats, limitMs: number = DEMOTE_MS): boolean {
  return stats.full && stats.mean > limitMs;
}
