import { test } from "node:test";
import assert from "node:assert/strict";
import { monotonePath } from "./sparkline.ts";

type Pt = { x: number; y: number };

function parse(d: string): { start: Pt; segs: { c1: Pt; c2: Pt; end: Pt }[] } {
  const m = d.match(/^M([-\d.]+),([-\d.]+)/);
  assert.ok(m, "d must start with M");
  const start = { x: +m![1], y: +m![2] };
  const segs: { c1: Pt; c2: Pt; end: Pt }[] = [];
  const parts = d.match(/C([-\d.,\s]+)/g) || [];
  for (const s of parts) {
    const n = s.replace(/^C/, "").split(/[\s,]+/).map(Number);
    segs.push({
      c1: { x: n[0], y: n[1] },
      c2: { x: n[2], y: n[3] },
      end: { x: n[4], y: n[5] },
    });
  }
  return { start, segs };
}

function sample(d: string, stepsPerSeg = 400): Pt[] {
  const { start, segs } = parse(d);
  if (segs.length === 0) return [start];
  const out: Pt[] = [];
  let p0 = start;
  for (const s of segs) {
    for (let k = 0; k <= stepsPerSeg; k++) {
      const t = k / stepsPerSeg;
      const u = 1 - t;
      out.push({
        x:
          u ** 3 * p0.x +
          3 * u ** 2 * t * s.c1.x +
          3 * u * t ** 2 * s.c2.x +
          t ** 3 * s.end.x,
        y:
          u ** 3 * p0.y +
          3 * u ** 2 * t * s.c1.y +
          3 * u * t ** 2 * s.c2.y +
          t ** 3 * s.end.y,
      });
    }
    p0 = s.end;
  }
  return out;
}

function ys(points: Pt[]): number[] {
  return points.map((p) => p.y);
}

function runNoOvershootCase(yVals: number[]) {
  const pts: Pt[] = yVals.map((y, i) => ({
    x: (i / Math.max(1, yVals.length - 1)) * 100,
    y,
  }));
  const d = monotonePath(pts);
  const samples = sample(d);
  const minY = Math.min(...yVals);
  const maxY = Math.max(...yVals);
  const eps = 1e-6;
  const minCurve = Math.min(...samples.map((p) => p.y));
  const maxCurve = Math.max(...samples.map((p) => p.y));
  assert.ok(
    minCurve >= minY - eps && maxCurve <= maxY + eps,
    `curve overshot data bounds: data=[${minY},${maxY}] curve=[${minCurve},${maxCurve}] for y=${JSON.stringify(yVals)}`,
  );
  // Per-segment monotone containment: within each segment, the curve stays
  // between its two anchor y-values, so even local extrema are honest.
  const { segs } = parse(d);
  let p0 = pts[0];
  let segIndex = 0;
  for (const seg of segs) {
    const a = p0.y;
    const b = seg.end.y;
    const segPts = [];
    for (let k = 0; k <= 400; k++) {
      const t = k / 400;
      const u = 1 - t;
      segPts.push(
        u ** 3 * p0.y +
          3 * u ** 2 * t * seg.c1.y +
          3 * u * t ** 2 * seg.c2.y +
          t ** 3 * seg.end.y,
      );
    }
    const lo = Math.min(a, b) - eps;
    const hi = Math.max(a, b) + eps;
    for (const y of segPts) {
      assert.ok(
        y >= lo && y <= hi,
        `segment ${segIndex} y=${y} escaped [${lo},${hi}] (between anchors ${a},${b})`,
      );
    }
    p0 = seg.end;
    segIndex++;
  }
  // Passes exactly through each real data point.
  const anchors = [{ ...pts[0] }, ...segs.map((s) => s.end)];
  for (let i = 0; i < anchors.length; i++) {
    assert.ok(
      Math.abs(anchors[i].y - pts[i].y) < 1e-4 &&
        Math.abs(anchors[i].x - pts[i].x) < 1e-4,
      `anchor ${i} did not land on the data point ${JSON.stringify(pts[i])}`,
    );
  }
}

test("sparkline: single point", () => {
  const d = monotonePath([{ x: 50, y: 10 }]);
  assert.match(d, /^M50\.0,10\.0$/);
});

test("sparkline: two points is a straight cubic", () => {
  const d = monotonePath([
    { x: 0, y: 0 },
    { x: 100, y: 20 },
  ]);
  const { segs } = parse(d);
  assert.equal(segs.length, 1);
  // A straight segment has collinear control points.
  assert.ok(Math.abs(segs[0].c1.y - 6.7) < 0.1);
  assert.ok(Math.abs(segs[0].c2.y - 13.3) < 0.1);
});

test("sparkline: never overshoots data min/max on monotone climbs", () => {
  runNoOvershootCase([2, 4, 6, 8, 10, 12]);
});

test("sparkline: never overshoots on a peak and recovery (classic overshoot case)", () => {
  runNoOvershootCase([2, 4, 10, 3, 1]);
});

test("sparkline: never overshoots on sawtooth volatility", () => {
  runNoOvershootCase([8, 2, 9, 1, 7, 3, 10, 0, 6]);
});

test("sparkline: never overshoots on a step down then slight recovery", () => {
  runNoOvershootCase([12, 12, 4, 2, 5]);
});

test("sparkline: never overshoots with steep final segment (endpoint dot case)", () => {
  runNoOvershootCase([2, 3, 4, 6, 14]);
});

test("sparkline: flat line stays flat", () => {
  const d = monotonePath(
    [0, 1, 2, 3].map((i) => ({ x: i * 33.33, y: 9 })),
  );
  const samples = sample(d);
  for (const p of samples) assert.ok(Math.abs(p.y - 9) < 1e-9);
});