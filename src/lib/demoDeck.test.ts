import { personaByKey } from '../constants/personas';
import { DemoStore } from './demoStore';

const TODAY = '2026-10-02';
const id = (k: string) => personaByKey(k)!.profile.id;
const fresh = () => new DemoStore(TODAY);

describe('deck de vagas (swipe)', () => {
  it('mostra as vagas abertas por match e não repete as que já foram decididas', () => {
    const s = fresh();
    const me = id('f1');
    const first = s.jobs.deckForPro(me);
    expect(first.length).toBe(6);
    const [a, b, c] = first;
    s.jobs.apply(a.job.id, me);
    s.jobs.skip(b.job.id, me);
    s.jobs.save(c.job.id, me);
    const left = s.jobs.deckForPro(me).map((x) => x.job.id);
    expect(left).toHaveLength(3);
    for (const x of [a, b, c]) expect(left).not.toContain(x.job.id);
  });

  it('salvar põe a vaga em Salvas e candidatar tira de lá', () => {
    const s = fresh();
    const me = id('f1');
    const job = s.jobs.deckForPro(me)[0].job.id;
    s.jobs.save(job, me);
    expect(s.jobs.savedForPro(me).map((c) => c.job.id)).toEqual([job]);
    s.jobs.apply(job, me);
    expect(s.jobs.savedForPro(me)).toHaveLength(0);
  });

  it('desfazer devolve a vaga ao deck, inclusive a candidatura ainda não respondida', () => {
    const s = fresh();
    const me = id('f1');
    const [a, b] = s.jobs.deckForPro(me);
    s.jobs.skip(a.job.id, me);
    s.jobs.undo(a.job.id, me);
    expect(s.jobs.deckForPro(me).map((x) => x.job.id)).toContain(a.job.id);
    s.jobs.apply(b.job.id, me);
    s.jobs.undo(b.job.id, me);
    expect(s.jobs.deckForPro(me).map((x) => x.job.id)).toContain(b.job.id);
    expect(s.jobs.candidates(b.job.id, b.job.owner_id).some((r) => r.profile.id === me)).toBe(false);
  });

  it('não desfaz candidatura que a empresa já respondeu', () => {
    const s = fresh();
    const f5 = id('f5');
    // j1 já tem candidatura seed de f5 (status "applied"); o convite muda o status.
    s.jobs.invite('j1', id('e1'), f5);
    expect(() => s.jobs.undo('j1', f5)).toThrow(/respondeu/);
  });

  it('não salva vaga já candidatada e empresa não vê deck de vagas', () => {
    const s = fresh();
    const me = id('f1');
    const job = s.jobs.deckForPro(me)[0].job.id;
    s.jobs.apply(job, me);
    expect(() => s.jobs.save(job, me)).toThrow(/já se candidatou/);
  });

  it('vagas parecidas têm a mesma função ou gênero e não incluem a própria', () => {
    const s = fresh();
    const me = id('f1');
    const base = s.jobs.deckForPro(me)[0].job;
    const similar = s.jobs.similarTo(base.id, me);
    for (const c of similar) {
      expect(c.job.id).not.toBe(base.id);
      expect(c.job.role === base.role || c.job.genre === base.genre).toBe(true);
    }
  });

  it('o detalhe informa se a vaga está salva e traz parecidas', () => {
    const s = fresh();
    const me = id('f1');
    const job = s.jobs.deckForPro(me)[0].job.id;
    s.jobs.save(job, me);
    expect(s.jobs.detail(job, me).saved).toBe(true);
  });

  it('cria vaga com capa escolhida e requisitos', () => {
    const s = fresh();
    const owner = id('e1');
    const j = s.jobs.createJob(owner, {
      title: 'Teste de capa', role: 'Operador(a) de Câmera', genre: 'evento', date: '2026-10-20', days: 1, city: 'Ilhéus',
      budget_per_day: 700, gear: [], description: 'x', cover: 'show-luzes', requirements: ['CNH'],
    });
    expect(j.cover).toBe('show-luzes');
    expect(s.jobs.feedForOwner(owner)[0].job.requirements).toEqual(['CNH']);
  });
});
