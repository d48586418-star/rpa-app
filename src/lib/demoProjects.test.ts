import { personaByKey } from '../constants/personas';
import { AVAILABILITY_OPTIONS, availabilityLabel, availabilityTone, isAvailableToday } from './availability';
import { commonPoints } from './common';
import { upcomingCena } from './cena';
import { DemoStore } from './demoStore';
import { greeting } from './dates';
import { statusOf } from './demoProjects';

const TODAY = '2026-10-02';
const id = (k: string) => personaByKey(k)!.profile.id;
const fresh = () => new DemoStore(TODAY);

describe('projetos abertos', () => {
  it('há 3 projetos de exemplo, com funções em aberto', () => {
    const s = fresh();
    const all = s.projects.feed(id('e1'));
    expect(all.map((c) => c.project.title).sort()).toEqual(['Curta Maré Baixa', 'Documentário Mulheres do Cacau', 'Teaser para projeto cultural']);
    all.forEach((c) => expect(c.open).toBe(c.total));
  });

  it('o feed põe primeiro os projetos com função parecida com a do profissional', () => {
    const s = fresh();
    const feed = s.projects.feed(id('f2')); // Caio é editor
    expect(feed[0].matching).toContain('Editor(a)');
    expect(feed.every((c) => c.project.owner_id !== id('f2') || c.mine)).toBe(true);
    const marina = s.projects.feed(id('f1')); // DP e operadora de câmera
    expect(marina[0].matching.length).toBeGreaterThan(0);
  });

  it('qualquer pessoa cria projeto, inclusive profissional (perfil híbrido), e ele aparece primeiro para ela', () => {
    const s = fresh();
    const p = s.projects.create(id('f1'), { title: 'Curta Brisa', description: 'Ideia de curta', city: 'Ilhéus', budget_total: 4000, roles: ['Editor(a)', 'Editor(a)', 'Colorista'] });
    expect(p.roles.map((r) => r.role)).toEqual(['Editor(a)', 'Colorista']);
    const mine = s.projects.feed(id('f1'))[0];
    expect(mine.mine).toBe(true);
    expect(mine.project.id).toBe(p.id);
  });

  it('valida título, funções e orçamento', () => {
    const s = fresh();
    const ok = { title: 'Projeto X', description: '', city: null, budget_total: 100, roles: ['Editor(a)'] };
    expect(() => s.projects.create(id('f1'), { ...ok, title: 'a' })).toThrow('título');
    expect(() => s.projects.create(id('f1'), { ...ok, roles: [] })).toThrow('ao menos uma função');
    expect(() => s.projects.create(id('f1'), { ...ok, roles: ['Astronauta'] })).toThrow('inválida');
    expect(() => s.projects.create(id('f1'), { ...ok, budget_total: -1 })).toThrow('orçamento');
    expect(() => s.projects.create('ninguem', ok)).toThrow('perfil');
  });

  it('interesse alterna, não vale no próprio projeto nem para empresas', () => {
    const s = fresh();
    expect(s.projects.toggleInterest('p2', id('f2'), 'Editor(a)')).toBe(true);
    expect(s.projects.detail('p2', id('e2')).interestedProfiles['Editor(a)'].map((p) => p.name)).toEqual(['Caio Ribeiro']);
    expect(s.projects.toggleInterest('p2', id('f2'), 'Editor(a)')).toBe(false);
    expect(s.projects.detail('p2', id('e2')).interestedProfiles['Editor(a)']).toHaveLength(0);
    expect(() => s.projects.toggleInterest('p2', id('e2'), 'Editor(a)')).toThrow('próprio');
    expect(() => s.projects.toggleInterest('p2', id('e1'), 'Editor(a)')).toThrow('profissionais');
    expect(() => s.projects.toggleInterest('p2', id('f2'), 'Maquiador(a)')).toThrow('não encontrada');
  });

  it('o dono escolhe quem marcou interesse, a função fecha e a conversa abre no chat', () => {
    const s = fresh();
    s.projects.toggleInterest('p2', id('f2'), 'Editor(a)');
    s.projects.toggleInterest('p2', id('f1'), 'Editor(a)'); // interesse extra
    expect(() => s.projects.choose('p2', id('e1'), 'Editor(a)', id('f2'))).toThrow('Só quem criou');
    expect(() => s.projects.choose('p2', id('e2'), 'Editor(a)', id('f4'))).toThrow('não marcou interesse');
    const convo = s.projects.choose('p2', id('e2'), 'Editor(a)', id('f2'));
    expect(s.listMatches(id('f2')).map((m) => m.id)).toContain(convo);
    const d = s.projects.detail('p2', id('e2'));
    expect(d.filledProfiles['Editor(a)']?.name).toBe('Caio Ribeiro');
    expect(d.status).toBe('procurando');
    expect(() => s.projects.toggleInterest('p2', id('f1'), 'Editor(a)')).toThrow('já foi preenchida');
    expect(() => s.projects.choose('p2', id('e2'), 'Editor(a)', id('f1'))).toThrow('já foi preenchida');
  });

  it('conversa com interessado sem fechar a função', () => {
    const s = fresh();
    s.projects.toggleInterest('p1', id('f1'), 'Diretor(a) de Fotografia');
    const convo = s.projects.talk('p1', id('f5'), id('f1'));
    expect(s.listMatches(id('f1')).map((m) => m.id)).toContain(convo);
    expect(s.projects.detail('p1', id('f5')).filledProfiles['Diretor(a) de Fotografia']).toBeUndefined();
    expect(() => s.projects.talk('p1', id('f5'), id('f4'))).toThrow('não marcou interesse');
  });

  it('status: procurando, falta uma função, equipe completa; projeto completo sai do feed dos outros', () => {
    expect(statusOf([{ role: 'a', filledBy: null, interested: [] }, { role: 'b', filledBy: null, interested: [] }])).toBe('procurando');
    expect(statusOf([{ role: 'a', filledBy: 'x', interested: [] }, { role: 'b', filledBy: null, interested: [] }])).toBe('quase');
    expect(statusOf([{ role: 'a', filledBy: 'x', interested: [] }])).toBe('completa');
    const s = fresh();
    const p = s.projects.create(id('e1'), { title: 'Registro de evento', description: '', city: 'Ilhéus', budget_total: 1500, roles: ['Operador(a) de Câmera'] });
    s.projects.toggleInterest(p.id, id('f1'), 'Operador(a) de Câmera');
    s.projects.choose(p.id, id('e1'), 'Operador(a) de Câmera', id('f1'));
    expect(s.projects.feed(id('f2')).map((c) => c.project.id)).not.toContain(p.id);
    expect(s.projects.feed(id('e1')).map((c) => c.project.id)).toContain(p.id); // o dono ainda vê
  });

  it('reiniciar a conta nova remove os projetos dela', () => {
    const s = fresh();
    s.saveProfile({ ...personaByKey('f1')!.profile, id: 'demo-me', name: 'Eu' });
    s.projects.create('demo-me', { title: 'Meu projeto', description: '', city: null, budget_total: 0, roles: ['Editor(a)'] });
    s.projects.toggleInterest('p2', 'demo-me', 'Editor(a)');
    s.resetNewUser();
    expect(s.projects.feed(id('f2')).map((c) => c.project.title)).not.toContain('Meu projeto');
    expect(s.projects.detail('p2', id('e2')).interestedProfiles['Editor(a)']).toHaveLength(0);
  });
});

describe('disponibilidade em 4 estados', () => {
  it('opções e rótulos', () => {
    expect(AVAILABILITY_OPTIONS.map((o) => o.id)).toEqual(['now', 'open', 'busy', 'from']);
    expect(availabilityLabel('busy', null)).toBe('Estou ocupado');
    expect(availabilityLabel('from', '2026-10-20')).toBe('Disponível a partir de ter 20/10');
    expect(availabilityTone('now')).toBe('good');
    expect(availabilityTone('busy')).toBe('bad');
  });

  it('só conta como disponível hoje quem pode pegar trabalho', () => {
    expect(isAvailableToday('now', null, TODAY)).toBe(true);
    expect(isAvailableToday('open', null, TODAY)).toBe(true);
    expect(isAvailableToday('busy', null, TODAY)).toBe(false);
    expect(isAvailableToday('from', '2026-10-20', TODAY)).toBe(false);
    expect(isAvailableToday('from', '2026-10-02', TODAY)).toBe(true);
  });

  it('mudar o estado atualiza o perfil e o filtro "só disponíveis" do Descobrir', () => {
    const s = fresh();
    expect(s.candidates(id('e1'), { accountType: 'freelancer', onlyAvailable: true }).map((p) => p.name)).toContain('Marina Duarte');
    s.jobs.setAvailability(id('f1'), 'busy');
    expect(s.profileOf(id('f1'))!.available).toBe(false);
    expect(s.candidates(id('e1'), { accountType: 'freelancer', onlyAvailable: true }).map((p) => p.name)).not.toContain('Marina Duarte');
    s.jobs.setAvailability(id('f1'), 'from', '2026-10-20');
    expect(s.jobs.progress(id('f1')).availabilityText).toBe('Disponível a partir de ter 20/10');
    expect(s.profileOf(id('f1'))!.available).toBe(false);
    s.jobs.setAvailability(id('f1'), 'open');
    expect(s.profileOf(id('f1'))!.available).toBe(true);
  });

  it('"a partir de" exige uma data de hoje em diante; Joana começa disponível só depois', () => {
    const s = fresh();
    expect(() => s.jobs.setAvailability(id('f1'), 'from', null)).toThrow('data');
    expect(() => s.jobs.setAvailability(id('f1'), 'from', '2026-09-01')).toThrow('data');
    expect(s.jobs.availabilityOf(id('f3')).state).toBe('from');
    expect(s.jobs.availabilityOf(id('f3')).from).toBe('2026-10-17');
  });
});

describe('Cena', () => {
  it('lista os próximos itens em ordem de data e filtra por tipo e cidade', () => {
    const all = upcomingCena(TODAY);
    expect(all.length).toBeGreaterThanOrEqual(6);
    const dates = all.map((c) => c.date);
    expect(dates).toEqual([...dates].sort());
    expect(all[0].date).toBe('2026-10-03');
    expect(upcomingCena(TODAY, { kind: 'oficina' }).every((c) => c.kind === 'oficina')).toBe(true);
    expect(upcomingCena(TODAY, { city: 'Ilhéus' }).every((c) => c.city === 'Ilhéus')).toBe(true);
    expect(upcomingCena(TODAY, { limit: 3 })).toHaveLength(3);
  });
});

describe('saudação e pontos em comum', () => {
  it('muda ao longo do dia', () => {
    expect(greeting(3)).toBe('Boa noite');
    expect(greeting(8)).toBe('Bom dia');
    expect(greeting(12)).toBe('Boa tarde');
    expect(greeting(17)).toBe('Boa tarde');
    expect(greeting(19)).toBe('Boa noite');
  });

  it('lista pontos em comum entre duas pessoas e nunca passa de 4', () => {
    const marina = personaByKey('f1')!.profile;
    const lume = personaByKey('e1')!.profile; // as duas em Ilhéus; Lume procura DP e câmera
    const pts = commonPoints(marina, lume);
    expect(pts).toContain('Função em comum: Diretor(a) de Fotografia');
    expect(pts).toContain('Os dois estão em Ilhéus');
    expect(pts).toContain('Os dois estão disponíveis agora');
    expect(pts.length).toBeLessThanOrEqual(4);
    const neon = personaByKey('e3')!.profile; // Itacaré, sem vagas
    expect(commonPoints(marina, neon).join(' ')).not.toContain('Os dois estão em');
  });
});
