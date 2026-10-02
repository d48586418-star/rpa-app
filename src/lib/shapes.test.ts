import { blobPath, hashString, roundedPolygonPath, type Pt } from './shapes';

describe('roundedPolygonPath', () => {
  const sq: Pt[] = [[0, 0], [100, 0], [100, 100], [0, 100]];
  it('gera um curva por vértice e fecha o path', () => {
    const d = roundedPolygonPath(sq, 10);
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    expect(d.match(/Q/g)).toHaveLength(4);
  });
  it('limita o raio à metade da aresta', () => {
    expect(roundedPolygonPath(sq, 9999)).toContain('Q');
    expect(roundedPolygonPath(sq, 9999)).not.toContain('NaN');
  });
});

describe('blobPath', () => {
  it('é determinístico por seed e varia entre seeds', () => {
    expect(blobPath('a')).toBe(blobPath('a'));
    expect(blobPath('a')).not.toBe(blobPath('b'));
    expect(blobPath('a')).not.toContain('NaN');
  });
});

describe('hashString', () => {
  it('é estável', () => {
    expect(hashString('abc')).toBe(hashString('abc'));
    expect(hashString('abc')).not.toBe(hashString('abd'));
  });
});
