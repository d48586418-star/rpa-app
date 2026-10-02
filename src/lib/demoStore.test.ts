import { DEMO_ME, DemoStore } from './demoStore';

describe('DemoStore', () => {
  it('só gera match com perfis que curtem de volta', () => {
    const s = new DemoStore();
    expect(s.swipe('d2', 'like')).toBe(false); // likesBack = false
    expect(s.swipe('d1', 'like')).toBe(true);
    expect(s.listMatches().map((m) => m.other.id)).toEqual(['d1']);
  });

  it('pular nunca gera match', () => {
    const s = new DemoStore();
    expect(s.swipe('d1', 'pass')).toBe(false);
    expect(s.listMatches()).toHaveLength(0);
  });

  it('não repete perfis já avaliados e respeita o filtro de tipo', () => {
    const s = new DemoStore();
    const before = s.candidates({ accountType: 'empresa' }).map((p) => p.id);
    expect(before).toEqual(['d1', 'd2', 'd3', 'd4']);
    s.swipe('d1', 'pass');
    expect(s.candidates({ accountType: 'empresa' }).map((p) => p.id)).toEqual(['d2', 'd3', 'd4']);
  });

  it('mensagens ficam separadas por conversa e disparam resposta automática', () => {
    jest.useFakeTimers();
    const s = new DemoStore();
    s.swipe('d1', 'like');
    s.swipe('d3', 'like');
    const [a, b] = s.listMatches();
    const got: string[] = [];
    s.onMessages(a.id, (m) => got.push(m.sender_id));
    s.send(a.id, DEMO_ME, 'oi');
    expect(got).toEqual([DEMO_ME]);
    jest.advanceTimersByTime(s.replyDelayMs + 1);
    expect(got).toEqual([DEMO_ME, a.user_b]);
    expect(s.listMessages(b.id)).toHaveLength(0);
    jest.useRealTimers();
  });

  it('rejeita mensagem em conversa inexistente e reset zera tudo', () => {
    const s = new DemoStore();
    expect(() => s.send('nope', DEMO_ME, 'x')).toThrow();
    s.swipe('d1', 'like');
    s.reset();
    expect(s.listMatches()).toHaveLength(0);
    expect(s.candidates({}).length).toBeGreaterThan(5);
  });
});
