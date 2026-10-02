import { filterCandidates, formatRate, matchPair, oppositeType, otherUserId } from './matching';
import type { Profile } from './types';

const p = (over: Partial<Profile>): Profile => ({
  id: 'x', account_type: 'freelancer', website: null, name: 'Fulano', avatar_url: null, city: 'São Paulo', bio: null, roles: ['Editor(a)'],
  day_rate_min: null, day_rate_max: null, available: true, portfolio_links: [], gear: null, ...over,
});

describe('matchPair', () => {
  it('ordena o par independente da ordem', () => {
    expect(matchPair('b', 'a')).toEqual(['a', 'b']);
    expect(matchPair('a', 'b')).toEqual(['a', 'b']);
  });
});

describe('otherUserId', () => {
  it('retorna o outro participante', () => {
    const m = { user_a: 'a', user_b: 'b' };
    expect(otherUserId(m, 'a')).toBe('b');
    expect(otherUserId(m, 'b')).toBe('a');
  });
});

describe('filterCandidates', () => {
  const all = [
    p({ id: 'me' }),
    p({ id: '1', city: 'Rio de Janeiro', roles: ['Colorista'] }),
    p({ id: '2', city: 'São Paulo', available: false }),
    p({ id: '3', city: 'Sao Paulo', roles: ['Colorista'] }),
  ];
  it('exclui o próprio usuário e quem já recebeu swipe', () => {
    expect(filterCandidates(all, 'me', new Set(['2'])).map((x) => x.id)).toEqual(['1', '3']);
  });
  it('filtra por função', () => {
    expect(filterCandidates(all, 'me', new Set(), { role: 'Colorista' }).map((x) => x.id)).toEqual(['1', '3']);
  });
  it('filtra cidade ignorando acentos e caixa', () => {
    expect(filterCandidates(all, 'me', new Set(), { city: 'são paulo' }).map((x) => x.id)).toEqual(['2', '3']);
  });
  it('filtra só disponíveis', () => {
    expect(filterCandidates(all, 'me', new Set(), { onlyAvailable: true }).map((x) => x.id)).toEqual(['1', '3']);
  });
});

describe('tipo de conta', () => {
  const mix = [
    p({ id: 'f', account_type: 'freelancer' }),
    p({ id: 'e', account_type: 'empresa' }),
  ];
  it('filtra pelo tipo', () => {
    expect(filterCandidates(mix, 'me', new Set(), { accountType: 'empresa' }).map((x) => x.id)).toEqual(['e']);
  });
  it('oppositeType inverte', () => {
    expect(oppositeType('freelancer')).toBe('empresa');
    expect(oppositeType('empresa')).toBe('freelancer');
  });
});

describe('formatRate', () => {
  it('formata faixas', () => {
    expect(formatRate(null, null)).toBeNull();
    expect(formatRate(500, 500)).toContain('/dia');
    expect(formatRate(300, 800)).toContain('–');
  });
});
