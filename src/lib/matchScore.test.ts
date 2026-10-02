import { addDays, dateSpan, daysBetween, formatShort } from './dates';
import { distanceKm } from './geo';
import { referenceRate } from './referenceRates';
import {
  NEW_ACCOUNT_BONUS, WEIGHTS, chanceOfCall, rankingScore, scoreMatch, suggestions,
  type JobInput, type ProInput,
} from './matchScore';
import type { Credit } from './types';

const credit = (over: Partial<Credit> = {}): Credit => ({
  id: Math.random().toString(36).slice(2), title: 'x', role: 'Operador(a) de Câmera', genre: 'casamento', year: 2025, verified: true, ...over,
});

const job: JobInput = {
  role: 'Operador(a) de Câmera', genre: 'casamento', date: '2026-10-10', days: 1, city: 'Itacaré', budget_per_day: 650, gear: ['Câmera 4K', 'Estabilizador'],
};

const pro = (over: Partial<ProInput> = {}): ProInput => ({
  roles: ['Operador(a) de Câmera'],
  credits: [credit(), credit(), credit()],
  gear: 'Sony FX6 (câmera 4K), estabilizador DJI Ronin',
  blockedDates: [],
  city: 'Itacaré',
  radiusKm: 100,
  rateMin: 600,
  reputation: { ratingAvg: 5, ratingCount: 10, attendance: 1, onTime: 1 },
  trainingBadges: [],
  accountAgeDays: 400,
  ...over,
});

const factor = (b: ReturnType<typeof scoreMatch>, key: string) => b.factors.find((f) => f.key === key)!;

describe('pesos', () => {
  it('somam 100', () => {
    expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });
});

describe('scoreMatch', () => {
  it('perfil ideal chega a 100% e cada fator tem um motivo escrito', () => {
    const b = scoreMatch(job, pro());
    expect(b.total).toBe(100);
    expect(b.factors).toHaveLength(7);
    b.factors.forEach((f) => expect(f.note.length).toBeGreaterThan(5));
  });

  it('função: não declarada zera a parte da função; crédito verificado sobe', () => {
    const none = scoreMatch(job, pro({ roles: ['Editor(a)'], credits: [] }));
    const declaredOnly = scoreMatch(job, pro({ credits: [] }));
    const one = scoreMatch(job, pro({ credits: [credit()] }));
    expect(factor(none, 'skills').points).toBeLessThan(factor(declaredOnly, 'skills').points);
    expect(factor(declaredOnly, 'skills').points).toBeLessThan(factor(one, 'skills').points);
    expect(factor(one, 'skills').points).toBeLessThan(factor(scoreMatch(job, pro()), 'skills').points);
  });

  it('crédito pendente (não verificado) não conta', () => {
    const pending = scoreMatch(job, pro({ credits: [credit({ verified: false }), credit({ verified: false })] }));
    expect(factor(pending, 'experience').points).toBe(0);
  });

  it('equipamento pedido e não declarado reduz habilidades e aparece na nota', () => {
    const b = scoreMatch(job, pro({ gear: 'Sony FX6 (câmera 4K)' }));
    expect(factor(b, 'skills').points).toBeLessThan(WEIGHTS.skills);
    expect(factor(b, 'skills').note).toContain('Estabilizador');
  });

  it('experiência: 3 créditos no gênero valem nota cheia', () => {
    expect(factor(scoreMatch(job, pro({ credits: [credit()] })), 'experience').points).toBeCloseTo(WEIGHTS.experience / 3);
    expect(factor(scoreMatch(job, pro()), 'experience').points).toBe(WEIGHTS.experience);
  });

  it('data bloqueada em qualquer dia do job zera disponibilidade', () => {
    const two: JobInput = { ...job, days: 3 };
    expect(factor(scoreMatch(two, pro({ blockedDates: ['2026-10-12'] })), 'availability').points).toBe(0);
    expect(factor(scoreMatch(two, pro({ blockedDates: ['2026-10-13'] })), 'availability').points).toBe(WEIGHTS.availability);
  });

  it('distância: perto vale tudo, fora do raio zera, remoto vale tudo', () => {
    expect(factor(scoreMatch(job, pro({ city: 'Itacaré' })), 'distance').points).toBe(WEIGHTS.distance);
    expect(factor(scoreMatch(job, pro({ city: 'Ilhéus', radiusKm: 50 })), 'distance').points).toBe(0);
    const mid = factor(scoreMatch(job, pro({ city: 'Ilhéus', radiusKm: 100 })), 'distance').points;
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(WEIGHTS.distance);
    expect(factor(scoreMatch({ ...job, city: null }, pro({ city: 'Valença' })), 'distance').points).toBe(WEIGHTS.distance);
  });

  it('conta nova sem avaliações recebe nota neutra, nem punida nem premiada', () => {
    const fresh = factor(scoreMatch(job, pro({ reputation: { ratingAvg: null, ratingCount: 0, attendance: null, onTime: null } })), 'reputation');
    expect(fresh.points).toBeCloseTo(WEIGHTS.reputation / 2);
    expect(fresh.note).toContain('Conta nova');
  });

  it('faixa de valor: cobre, quase cobre, não cobre', () => {
    expect(factor(scoreMatch(job, pro({ rateMin: 600 })), 'price').points).toBe(WEIGHTS.price);
    expect(factor(scoreMatch(job, pro({ rateMin: 750 })), 'price').points).toBe(WEIGHTS.price / 2);
    expect(factor(scoreMatch(job, pro({ rateMin: 1500 })), 'price').points).toBe(0);
  });

  it('formação: função sem trilha sai da conta; função com trilha dá pontos pelo selo', () => {
    const noTrail = scoreMatch(job, pro());
    expect(factor(noTrail, 'training').applicable).toBe(false);
    expect(noTrail.total).toBe(100); // reescalada: não penaliza quem não tem trilha para fazer
    const edit: JobInput = { ...job, role: 'Editor(a)', genre: 'documentario', gear: [] };
    const editor = pro({ roles: ['Editor(a)'], credits: [credit({ role: 'Editor(a)', genre: 'documentario' }), credit({ role: 'Editor(a)', genre: 'documentario' }), credit({ role: 'Editor(a)', genre: 'documentario' })] });
    const without = scoreMatch(edit, editor);
    const withBadge = scoreMatch(edit, { ...editor, trainingBadges: ['Formado em Montagem'] });
    expect(factor(without, 'training').applicable).toBe(true);
    expect(withBadge.total).toBeGreaterThan(without.total);
  });

  it('não usa foto, gênero, idade nem bairro: só os campos profissionais mudam o resultado', () => {
    const keys = Object.keys(pro()).sort();
    expect(keys).toEqual(['accountAgeDays', 'blockedDates', 'city', 'credits', 'gear', 'radiusKm', 'rateMin', 'reputation', 'roles', 'trainingBadges']);
    // a idade da conta não entra no % (só no ordenamento)
    expect(scoreMatch(job, pro({ accountAgeDays: 5 })).total).toBe(scoreMatch(job, pro({ accountAgeDays: 900 })).total);
  });
});

describe('suggestions ("o que falta")', () => {
  it('só sugere o que realmente aumenta o match e mostra o novo valor', () => {
    const weak = pro({ credits: [], blockedDates: ['2026-10-10'], gear: 'Sony FX6 (câmera 4K)' });
    const base = scoreMatch(job, weak);
    const s = suggestions(job, weak, base);
    expect(s.length).toBeGreaterThan(0);
    expect(s.length).toBeLessThanOrEqual(3);
    s.forEach((x) => {
      expect(x.gain).toBeGreaterThanOrEqual(1);
      expect(x.newTotal).toBeGreaterThan(base.total);
      expect(x.text).toContain(`${x.newTotal}%`);
    });
    expect(s.map((x) => x.gain)).toEqual([...s.map((x) => x.gain)].sort((a, b) => b - a));
    expect(s.some((x) => x.text.includes('Liberar'))).toBe(true);
  });

  it('perfil já completo não recebe sugestões', () => {
    expect(suggestions(job, pro())).toEqual([]);
  });

  it('nunca sugere baixar a diária', () => {
    const s = suggestions(job, pro({ rateMin: 1500 }));
    s.forEach((x) => expect(x.text.toLowerCase()).not.toMatch(/diária|baixar|cobrar menos/));
  });
});

describe('chance de ser chamado e visibilidade', () => {
  it('Alta, Média e Baixa por faixas', () => {
    expect(chanceOfCall(90, 1)).toBe('Alta');
    expect(chanceOfCall(90, 4)).toBe('Média');
    expect(chanceOfCall(70, 3)).toBe('Média');
    expect(chanceOfCall(70, 9)).toBe('Baixa');
    expect(chanceOfCall(40, 1)).toBe('Baixa');
  });

  it('bônus de conta nova só vale nos primeiros 60 dias e só para ordenar', () => {
    expect(rankingScore(70, 10)).toBe(70 + NEW_ACCOUNT_BONUS);
    expect(rankingScore(70, 59)).toBe(70 + NEW_ACCOUNT_BONUS);
    expect(rankingScore(70, 60)).toBe(70);
  });
});

describe('datas, geografia e piso', () => {
  it('somam dias e formatam sem depender do fuso', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(daysBetween('2026-10-01', '2026-10-10')).toBe(9);
    expect(dateSpan('2026-10-10', 3)).toEqual(['2026-10-10', '2026-10-11', '2026-10-12']);
    expect(formatShort('2026-10-10')).toBe('sáb 10/10');
  });

  it('distâncias plausíveis no Sul da Bahia e nulo para cidade desconhecida', () => {
    expect(distanceKm('Ilhéus', 'ilheus')).toBe(0);
    expect(distanceKm('Ilhéus', 'Itabuna')).toBeGreaterThan(15);
    expect(distanceKm('Ilhéus', 'Itabuna')).toBeLessThan(40);
    expect(distanceKm('Ilhéus', 'Porto Seguro')).toBeGreaterThan(150);
    expect(distanceKm('Ilhéus', 'Itacaré')).toBe(57);
    expect(distanceKm('Ilhéus', 'Narnia')).toBeNull();
  });

  it('piso de referência existe por função e é coerente', () => {
    const r = referenceRate('Editor(a)')!;
    expect(r.min).toBeLessThan(r.max);
    expect(referenceRate('Função inventada')).toBeNull();
  });
});
