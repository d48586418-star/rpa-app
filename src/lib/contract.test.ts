import { LATE_CANCEL_FEE_RATE, SERVICE_FEE_RATE, contractClauses, lateCancelFee, overtimeRate, quote, revisionsFor } from './contract';
import { STAGE_ORDER, applyAction, average, nextActionFor, weakestCriterion, waitingOn } from './engagement';
import { ALL_BADGES, LEVELS, earnedBadges, emptyProgress, levelFor } from './xp';
import type { Job } from './types';

const job: Job = {
  id: 'j1', owner_id: 'o', title: 'Casamento em Itacaré', role: 'Editor(a)', genre: 'casamento', date: '2026-10-10', days: 2,
  city: 'Itacaré', budget_per_day: 650, gear: [], description: '', status: 'open', created_at: '',
};

describe('contrato e valores', () => {
  it('a taxa é de 8% por cima e o profissional recebe a diária inteira', () => {
    expect(SERVICE_FEE_RATE).toBe(0.08);
    expect(quote(650, 2)).toEqual({ subtotal: 1300, fee: 104, total: 1404, proReceives: 1300 });
  });

  it('hora extra, multa de cancelamento e revisões por função', () => {
    expect(overtimeRate(650)).toBe(98);
    expect(lateCancelFee(650, 2)).toBe(Math.round(1300 * LATE_CANCEL_FEE_RATE));
    expect(revisionsFor('Editor(a)')).toBe(2);
    expect(revisionsFor('Operador(a) de Câmera')).toBe(0);
  });

  it('gera todas as cláusulas com os dados do job e o aviso de simulação', () => {
    const c = contractClauses(job, 'Lume Filmes', 'Caio Ribeiro');
    expect(c.map((x) => x.title)).toEqual(['Partes e objeto', 'Valor e pagamento', 'Jornada e hora extra', 'Revisões', 'Uso de imagem e créditos', 'Cancelamento', 'Aviso']);
    const all = c.map((x) => x.body).join(' ');
    expect(all).toContain('Lume Filmes');
    expect(all).toContain('Caio Ribeiro');
    expect(all).toContain('Editor(a)');
    expect(all).toContain('Itacaré');
    expect(all).toContain('1.404');
    expect(all).toContain('simulado');
    expect(c.find((x) => x.title === 'Revisões')!.body).toContain('2 rodadas');
    expect(contractClauses({ ...job, role: 'Operador(a) de Câmera' }, 'a', 'b').find((x) => x.title === 'Revisões')!.body).toContain('Não se aplica');
  });
});

describe('etapas do contrato', () => {
  it('percorre a ordem inteira com o lado certo em cada passo', () => {
    let s = STAGE_ORDER[0];
    s = applyAction(s, 'accept_contract', 'pro');
    s = applyAction(s, 'pay_escrow', 'owner');
    s = applyAction(s, 'check_in', 'pro');
    s = applyAction(s, 'check_out', 'pro');
    s = applyAction(s, 'release', 'owner');
    s = applyAction(s, 'review', 'owner');
    expect(s).toBe('concluido');
  });

  it('rejeita lado errado e etapa fora de ordem', () => {
    expect(() => applyAction('contrato_pendente', 'accept_contract', 'owner')).toThrow('profissional');
    expect(() => applyAction('aguardando_pagamento', 'pay_escrow', 'pro')).toThrow('contratante');
    expect(() => applyAction('contrato_pendente', 'pay_escrow', 'owner')).toThrow('etapa');
    expect(() => applyAction('em_custodia', 'release', 'owner')).toThrow('etapa');
    expect(() => applyAction('concluido', 'review', 'owner')).toThrow('etapa');
  });

  it('diz o que cada lado pode fazer agora e quem está esperando', () => {
    expect(nextActionFor('contrato_pendente', 'pro')).toBe('accept_contract');
    expect(nextActionFor('contrato_pendente', 'owner')).toBeNull();
    expect(nextActionFor('entregue', 'owner')).toBe('release');
    expect(nextActionFor('concluido', 'owner')).toBeNull();
    expect(waitingOn('em_custodia')).toBe('pro');
    expect(waitingOn('concluido')).toBeNull();
  });

  it('média e critério mais fraco da avaliação', () => {
    expect(average({ tecnica: 5, comunicacao: 4, prazo: 3 })).toBe(4);
    expect(weakestCriterion({ tecnica: 5, comunicacao: 4, prazo: 3 })).toBe('Prazo e pontualidade');
  });
});

describe('níveis, XP e selos', () => {
  it('encontra o nível e o progresso até o próximo', () => {
    expect(levelFor(0)).toMatchObject({ name: 'Claquete', next: 'Assistente', progress: 0 });
    expect(levelFor(149).name).toBe('Claquete');
    expect(levelFor(150).name).toBe('Assistente');
    expect(levelFor(275)).toMatchObject({ name: 'Assistente', xpInto: 125, xpSpan: 250, progress: 0.5 });
    expect(levelFor(99999)).toMatchObject({ name: 'Diretor(a) de Cena', next: null, progress: 1 });
    expect(LEVELS.map((l) => l.name)).toEqual(['Claquete', 'Assistente', 'Operador(a)', 'Chefe de Equipe', 'Diretor(a) de Cena']);
  });

  it('os 4 selos saem do progresso real', () => {
    expect(ALL_BADGES.map((b) => b.name)).toEqual(['Pontual', 'Entrega no prazo', 'Primeiro job', 'Pioneiro(a)']);
    expect(earnedBadges(emptyProgress())).toEqual([]);
    const names = (p: Partial<ReturnType<typeof emptyProgress>>) => earnedBadges({ ...emptyProgress(), ...p }).map((b) => b.name);
    expect(names({ onTimeCheckins: 9 })).toEqual([]);
    expect(names({ onTimeCheckins: 10 })).toEqual(['Pontual']);
    expect(names({ jobsDone: 1 })).toEqual(['Primeiro job']);
    expect(names({ pioneer: true, onTimeDeliveries: 10 })).toEqual(['Entrega no prazo', 'Pioneiro(a)']);
  });
});
