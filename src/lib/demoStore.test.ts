import { PERSONAS, personaByKey } from '../constants/personas';
import { DEMO_ME, DemoStore } from './demoStore';

const id = (key: string) => personaByKey(key)!.profile.id;

describe('DemoStore', () => {
  it('só gera match quando a outra pessoa já tinha curtido', () => {
    const s = new DemoStore();
    expect(s.swipe(id('f2'), id('e4'), 'like')).toBe(false); // Pulso nunca curtiu o Caio
    expect(s.swipe(id('f2'), id('e1'), 'like')).toBe(true); // Lume já tinha curtido o Caio
    expect(s.listMatches(id('f2')).map((m) => m.other.name)).toEqual(['Lume Filmes']);
    expect(s.listMatches(id('e1')).map((m) => m.other.name)).toEqual(['Caio Ribeiro']);
    expect(s.listMatches(id('f1'))).toHaveLength(0);
  });

  it('pular nunca gera match e não repete a pessoa no deck', () => {
    const s = new DemoStore();
    expect(s.swipe(id('f2'), id('e1'), 'pass')).toBe(false);
    expect(s.candidates(id('f2'), {}).map((p) => p.id)).not.toContain(id('e1'));
    expect(s.swipe(id('e1'), id('f2'), 'like')).toBe(false); // já tinha curtido antes, e o Caio passou
  });

  it('não repete o mesmo match', () => {
    const s = new DemoStore();
    expect(s.swipe(id('f2'), id('e1'), 'like')).toBe(true);
    expect(s.swipe(id('f2'), id('e1'), 'like')).toBe(false);
    expect(s.listMatches(id('f2'))).toHaveLength(1);
  });

  it('o deck mostra só o tipo oposto e respeita disponibilidade', () => {
    const s = new DemoStore();
    const deck = s.candidates(id('f1'), { accountType: 'empresa' });
    expect(deck.every((p) => p.account_type === 'empresa')).toBe(true);
    expect(deck.map((p) => p.id)).not.toContain(id('e1')); // Marina já curtiu a Lume
    const onlyAvail = s.candidates(id('f1'), { accountType: 'empresa', onlyAvailable: true });
    expect(onlyAvail.map((p) => p.name)).not.toContain('Estúdio Neon');
  });

  it('o outro lado responde na voz da persona e as conversas ficam separadas', () => {
    jest.useFakeTimers();
    const s = new DemoStore();
    s.setActive(id('f2'));
    s.swipe(id('f2'), id('e1'), 'like');
    s.swipe(id('f2'), id('e2'), 'like');
    const [m2, m1] = s.listMatches(id('f2')); // mais recente primeiro
    const got: string[] = [];
    s.onMessages(m1.id, (m) => got.push(`${m.sender_id === id('f2') ? 'eu' : 'outro'}:${m.body}`));
    s.send(m1.id, id('f2'), 'oi');
    jest.advanceTimersByTime(s.replyDelayMs + 1);
    expect(got[0]).toBe('eu:oi');
    expect(got[1]).toBe(`outro:${personaByKey('e1')!.replies[0]}`);
    expect(s.listMessages(m2.id)).toHaveLength(0);
    jest.useRealTimers();
  });

  it('rejeita mensagem em conversa inexistente ou de quem não participa', () => {
    const s = new DemoStore();
    expect(() => s.send('nope', DEMO_ME, 'x')).toThrow();
    s.swipe(id('f2'), id('e1'), 'like');
    const [m] = s.listMatches(id('f2'));
    expect(() => s.send(m.id, id('f1'), 'intruso')).toThrow();
  });

  it('a conta nova da demo recebe likes e reset volta ao início', () => {
    const s = new DemoStore();
    s.saveProfile({ ...personaByKey('f1')!.profile, id: DEMO_ME, name: 'Eu' });
    expect(s.swipe(DEMO_ME, id('e1'), 'like')).toBe(true);
    s.resetNewUser();
    expect(s.profileOf(DEMO_ME)).toBeNull();
    expect(s.listMatches(DEMO_ME)).toHaveLength(0);
    s.swipe(id('f2'), id('e1'), 'like');
    s.reset();
    expect(s.listMatches(id('f2'))).toHaveLength(0);
    expect(PERSONAS).toHaveLength(10);
  });
});
