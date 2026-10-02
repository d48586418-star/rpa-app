import { PERSONAS, personaByKey } from '../constants/personas';
import { ROLES } from '../constants/roles';
import { DemoStore } from './demoStore';
import { addDays } from './dates';
import { levelFor } from './xp';

const TODAY = '2026-10-02';
const id = (k: string) => personaByKey(k)!.profile.id;
const fresh = () => new DemoStore(TODAY);
const factor = (b: { factors: { key: string; points: number }[] } | null, key: string) => b!.factors.find((f) => f.key === key)!.points;

describe('dados de exemplo', () => {
  it('6 jobs, de empresas, com função válida e data futura', () => {
    const s = fresh();
    const rows = PERSONAS.flatMap((p) => s.jobs.feedForOwner(p.profile.id));
    expect(rows).toHaveLength(6);
    for (const r of rows) {
      expect(ROLES).toContain(r.job.role);
      expect(r.job.date >= TODAY).toBe(true);
      expect(r.job.status).toBe('open');
    }
  });
});

describe('feed e match % do profissional', () => {
  it('lista os jobs do melhor match para o pior e nunca os próprios', () => {
    const s = fresh();
    const feed = s.jobs.feedForPro(id('f1'));
    expect(feed).toHaveLength(6);
    const scores = feed.map((c) => c.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    expect(feed[0].job.role).toMatch(/Câmera|Fotografia/);
    expect(s.jobs.feedForPro(id('e1')).every((c) => c.job.owner_id !== id('e1'))).toBe(true);
  });

  it('data ocupada zera a disponibilidade e a sugestão manda liberar a agenda', () => {
    const s = fresh();
    const d = s.jobs.detail('j1', id('f1')); // Marina tem o dia +3 ocupado e j1 cai nele
    expect(factor(d.breakdown, 'availability')).toBe(0);
    const liberar = d.suggestions.find((x) => x.text.includes('Liberar'))!;
    expect(liberar).toBeDefined();
    s.jobs.toggleBusy(id('f1'), addDays(TODAY, 3));
    const after = s.jobs.detail('j1', id('f1'));
    expect(factor(after.breakdown, 'availability')).toBe(15);
    expect(after.breakdown!.total).toBe(liberar.newTotal);
  });

  it('fora do raio zera a distância (Bia e o job de Valença)', () => {
    const d = fresh().jobs.detail('j6', id('f5'));
    expect(factor(d.breakdown, 'distance')).toBe(0);
  });

  it('o profissional vê chance (Alta, Média ou Baixa), nunca um número', () => {
    const d = fresh().jobs.detail('j3', id('f2'));
    expect(['Alta', 'Média', 'Baixa']).toContain(d.chance);
    expect(d.chance).toBe('Alta'); // Caio: editor com créditos e selo, à frente do Theo
  });

  it('crédito pendente não muda o match; confirmar sobe o match e dá XP', () => {
    const s = fresh();
    const before = s.jobs.detail('j1', id('f1')).breakdown!.total;
    const c = s.jobs.addCredit(id('f1'), { title: 'Casamento Teste', role: 'Operador(a) de Câmera', genre: 'casamento', year: 2026 });
    expect(c.verified).toBe(false);
    expect(s.jobs.detail('j1', id('f1')).breakdown!.total).toBe(before);
    const xp = s.jobs.progress(id('f1')).progress.xp;
    s.jobs.simulateConfirm(id('f1'), c.id);
    expect(s.jobs.progress(id('f1')).progress.xp).toBe(xp + 30);
    expect(s.jobs.detail('j1', id('f1')).breakdown!.total).toBeGreaterThanOrEqual(before);
    s.jobs.simulateConfirm(id('f1'), c.id); // idempotente
    expect(s.jobs.progress(id('f1')).progress.xp).toBe(xp + 30);
  });
});

describe('candidaturas e candidatos', () => {
  it('candidatura grátis, sem duplicar, e só profissional se candidata', () => {
    const s = fresh();
    s.jobs.apply('j1', id('f1'));
    expect(() => s.jobs.apply('j1', id('f1'))).toThrow('já se candidatou');
    expect(() => s.jobs.apply('j1', id('e2'))).toThrow('profissionais');
    expect(() => s.jobs.apply('j1', id('e1'))).toThrow('próprio job');
    expect(s.jobs.feedForPro(id('f1')).find((c) => c.job.id === 'j1')!.applied).toBe(true);
  });

  it('o contratante vê candidatos ordenados por match, com o detalhamento', () => {
    const s = fresh();
    s.jobs.apply('j1', id('f1'));
    const rows = s.jobs.candidates('j1', id('e1'));
    expect(rows.map((r) => r.profile.name)).toEqual(['Marina Duarte', 'Bia Camargo']);
    expect(rows[0].score).toBeGreaterThan(rows[1].score);
    expect(rows[0].breakdown.factors).toHaveLength(7);
    expect(() => s.jobs.candidates('j1', id('e2'))).toThrow('Só o contratante');
  });

  it('conta nova ganha bônus só na ordem; o % exibido continua o real', () => {
    const s = fresh();
    const rows = s.jobs.candidates('j3', id('e2')); // Theo (conta de 20 dias)
    expect(rows[0].isNew).toBe(true);
    const direct = s.jobs.detail('j3', id('f4')).breakdown!.total;
    expect(rows[0].score).toBe(direct);
  });
});

describe('fluxo completo: candidatura, contrato, custódia simulada, avaliação e XP', () => {
  it('Theo conclui o primeiro job: XP, nível, selo e reputação', () => {
    const s = fresh();
    const owner = id('e3');
    const pro = id('f4');
    expect(s.jobs.progress(pro).progress.xp).toBe(40);
    s.jobs.apply('j5', pro);
    const matchId = s.jobs.invite('j5', owner, pro);
    expect(s.listMatches(pro).map((m) => m.id)).toContain(matchId); // conversa liberada no chat

    const eng = s.jobs.select('j5', owner, pro);
    expect(eng.stage).toBe('contrato_pendente');
    expect(() => s.jobs.select('j5', owner, pro)).toThrow('já foi fechado');
    expect(s.jobs.feedForPro(id('f1')).some((c) => c.job.id === 'j5')).toBe(false); // job fechado sai do feed

    let v = s.jobs.detail('j5', pro).engagement!;
    expect(v.next).toBe('accept_contract');
    expect(v.quote).toEqual({ subtotal: 2100, fee: 168, total: 2268, proReceives: 2100 });
    expect(v.clauses.length).toBe(7);

    expect(() => s.jobs.act('j5', owner, 'accept_contract')).toThrow('profissional');
    expect(() => s.jobs.act('j5', pro, 'check_in')).toThrow('etapa');
    expect(() => s.jobs.act('j5', id('f1'), 'accept_contract')).toThrow('não participa');

    s.jobs.act('j5', pro, 'accept_contract');
    s.jobs.act('j5', owner, 'pay_escrow');
    s.jobs.act('j5', pro, 'check_in');
    s.jobs.act('j5', pro, 'check_out');
    v = s.jobs.act('j5', owner, 'release');
    expect(v.engagement.stage).toBe('liberado');
    expect(v.engagement.xp_awarded.map((x) => x.xp)).toEqual([100, 50]);

    expect(() => s.jobs.act('j5', owner, 'review', { scores: { tecnica: 6, comunicacao: 5, prazo: 5 } })).toThrow('1 a 5');
    v = s.jobs.act('j5', owner, 'review', { scores: { tecnica: 5, comunicacao: 4, prazo: 5 }, tip: 'Mande prévias mais cedo.' });
    expect(v.engagement.stage).toBe('concluido');
    expect(v.review!.tip).toBe('Mande prévias mais cedo.');
    expect(v.engagement.xp_awarded.map((x) => x.label)).toEqual(['Job concluído', 'Primeiro job pelo app', 'Avaliação positiva']);

    const p = s.jobs.progress(pro);
    expect(p.progress.xp).toBe(40 + 100 + 50 + 20);
    expect(levelFor(p.progress.xp).name).toBe('Assistente');
    expect(p.badges.map((b) => b.name)).toContain('Primeiro job');
    expect(p.reputation.ratingCount).toBe(1);
    expect(p.reputation.ratingAvg).toBeCloseTo(14 / 3);
    expect(s.jobs.feedForOwner(owner)[0].stage).toBe('concluido');
  });

  it('o décimo check-in pontual da Marina dá o selo Pontual', () => {
    const s = fresh();
    const pro = id('f1');
    expect(s.jobs.progress(pro).badges.map((b) => b.name)).not.toContain('Pontual');
    s.jobs.apply('j1', pro);
    s.jobs.select('j1', id('e1'), pro);
    s.jobs.act('j1', pro, 'accept_contract');
    s.jobs.act('j1', id('e1'), 'pay_escrow');
    s.jobs.act('j1', pro, 'check_in');
    expect(s.jobs.progress(pro).badges.map((b) => b.name)).toContain('Pontual');
  });

  it('avaliação ruim não dá XP de avaliação positiva', () => {
    const s = fresh();
    const pro = id('f2');
    s.jobs.apply('j3', pro);
    s.jobs.select('j3', id('e2'), pro);
    for (const [who, a] of [[pro, 'accept_contract'], [id('e2'), 'pay_escrow'], [pro, 'check_in'], [pro, 'check_out'], [id('e2'), 'release']] as const) s.jobs.act('j3', who, a);
    const v = s.jobs.act('j3', id('e2'), 'review', { scores: { tecnica: 2, comunicacao: 3, prazo: 2 } });
    expect(v.engagement.xp_awarded.map((x) => x.label)).toEqual(['Job concluído']);
    expect(s.jobs.progress(pro).progress.onTimeDeliveries).toBe(9); // job de edição conta como entrega
  });
});

describe('publicar job (empresa)', () => {
  const input = { title: 'Making of de casamento', role: 'Operador(a) de Câmera', genre: 'casamento' as const, date: addDays(TODAY, 5), days: 1, city: 'Ilhéus', budget_per_day: 600, gear: [' Câmera 4K ', ''], description: '' };

  it('cria, limpa os campos e aparece para os profissionais com match calculado', () => {
    const s = fresh();
    const job = s.jobs.createJob(id('e5'), input);
    expect(job.gear).toEqual(['Câmera 4K']);
    expect(s.jobs.feedForOwner(id('e5'))[0].job.id).toBe(job.id);
    const card = s.jobs.feedForPro(id('f1')).find((c) => c.job.id === job.id)!;
    expect(card.score).toBeGreaterThan(0);
  });

  it('valida empresa, título, função, orçamento, diárias e data', () => {
    const s = fresh();
    expect(() => s.jobs.createJob(id('f1'), input)).toThrow('empresa');
    expect(() => s.jobs.createJob(id('e5'), { ...input, title: 'a' })).toThrow('título');
    expect(() => s.jobs.createJob(id('e5'), { ...input, role: 'Astronauta' })).toThrow('função');
    expect(() => s.jobs.createJob(id('e5'), { ...input, budget_per_day: 0 })).toThrow('orçamento');
    expect(() => s.jobs.createJob(id('e5'), { ...input, days: 31 })).toThrow('diárias');
    expect(() => s.jobs.createJob(id('e5'), { ...input, date: '2026-09-01' })).toThrow('passado');
  });
});

describe('reinício', () => {
  it('a conta nova da demo começa do zero e reset volta ao estado inicial', () => {
    const s = fresh();
    s.saveProfile({ ...personaByKey('f1')!.profile, id: 'demo-me', name: 'Eu' });
    s.jobs.apply('j1', 'demo-me');
    s.jobs.addCredit('demo-me', { title: 'Meu primeiro trabalho', role: 'Editor(a)', genre: 'clipe', year: 2026 });
    s.resetNewUser();
    expect(s.jobs.progress('demo-me').credits).toHaveLength(0);
    s.jobs.apply('j3', id('f2'));
    s.jobs.select('j3', id('e2'), id('f2'));
    s.reset();
    expect(s.jobs.feedForOwner(id('e2'))[0].job.status).toBe('open');
    expect(s.jobs.candidates('j3', id('e2'))).toHaveLength(1);
  });
});
