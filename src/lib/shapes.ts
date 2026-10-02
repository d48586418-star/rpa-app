export type Pt = [number, number];

const f = (n: number) => Math.round(n * 100) / 100;

/** Polígono com cantos arredondados (inclusive os côncavos) como path SVG. */
export function roundedPolygonPath(pts: Pt[], r: number): string {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const prev = pts[(i + n - 1) % n];
    const next = pts[(i + 1) % n];
    const l1 = Math.hypot(prev[0] - p[0], prev[1] - p[1]);
    const l2 = Math.hypot(next[0] - p[0], next[1] - p[1]);
    const t1 = Math.min(r, l1 / 2) / l1;
    const t2 = Math.min(r, l2 / 2) / l2;
    const a: Pt = [p[0] + (prev[0] - p[0]) * t1, p[1] + (prev[1] - p[1]) * t1];
    const b: Pt = [p[0] + (next[0] - p[0]) * t2, p[1] + (next[1] - p[1]) * t2];
    d += `${i === 0 ? 'M' : 'L'}${f(a[0])} ${f(a[1])} Q${f(p[0])} ${f(p[1])} ${f(b[0])} ${f(b[1])} `;
  }
  return `${d}Z`;
}

/** Hash simples e estável de string → inteiro positivo. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Blob orgânico determinístico (por seed) dentro de um viewBox 0..100. */
export function blobPath(seed: string, points = 7): string {
  let h = hashString(seed);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    return (h % 1000) / 1000;
  };
  const pts: Pt[] = [];
  for (let k = 0; k < points; k++) {
    const ang = (k / points) * Math.PI * 2;
    const rad = 34 + rand() * 14;
    pts.push([50 + Math.cos(ang) * rad, 50 + Math.sin(ang) * rad]);
  }
  const n = pts.length;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i + n - 1) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])} `;
  }
  return `${d}Z`;
}
