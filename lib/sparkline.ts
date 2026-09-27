// Steffen’s piecewise monotone cubic interpolation — the SVG equivalent of
// D3’s curveMonotoneX. Preserves monotonic segments between points (never
// overshoots past the real values) while producing smooth, continuous
// first-derivative bezier curves instead of angular polyline segments.

export function monotonePath(points: { x: number; y: number }[]): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  const h: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i + 1 < n; i++) {
    h[i] = points[i + 1].x - points[i].x || 1;
    slope[i] = (points[i + 1].y - points[i].y) / h[i];
  }
  const tangent: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    if (i === 0) {
      tangent[i] = slope[0];
    } else if (i === n - 1) {
      tangent[i] = slope[i - 1];
    } else if (slope[i - 1] * slope[i] > 0) {
      const harmonic =
        (h[i] * slope[i - 1] + h[i - 1] * slope[i]) / (h[i] + h[i - 1]);
      const sign = slope[i - 1] > 0 ? 1 : -1;
      tangent[i] =
        sign *
        Math.min(
          Math.abs(slope[i - 1]),
          Math.abs(slope[i]),
          0.5 * Math.abs(harmonic),
        );
    }
  }
  const d: string[] = [`M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`];
  for (let i = 0; i + 1 < n; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const c1x = p0.x + h[i] / 3;
    const c1y = p0.y + (tangent[i] * h[i]) / 3;
    const c2x = p1.x - h[i] / 3;
    const c2y = p1.y - (tangent[i + 1] * h[i]) / 3;
    d.push(
      `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`,
    );
  }
  return d.join(" ");
}