import fs from 'fs';
import path from 'path';
import { DemoStore } from '../lib/demoStore';
import { PERSONAS, personaByEmail, personaByKey } from './personas';

const { genDoc, genSql, expectedMatches } = require('../../scripts/gen-personas');
const root = path.join(__dirname, '..', '..');

describe('personas', () => {
  it('são 10: 5 freelancers e 5 empresas, com e-mails e ids únicos', () => {
    expect(PERSONAS).toHaveLength(10);
    expect(PERSONAS.filter((p) => p.profile.account_type === 'freelancer')).toHaveLength(5);
    expect(PERSONAS.filter((p) => p.profile.account_type === 'empresa')).toHaveLength(5);
    expect(new Set(PERSONAS.map((p) => p.email)).size).toBe(10);
    expect(new Set(PERSONAS.map((p) => p.profile.id)).size).toBe(10);
    expect(personaByEmail('  MARINA.DUARTE@takeone.test ')?.key).toBe('f1');
  });

  it('todo preLike aponta para uma persona de tipo oposto', () => {
    for (const p of PERSONAS) {
      for (const k of p.preLikes) {
        const target = personaByKey(k);
        expect(target).toBeDefined();
        expect(target!.profile.account_type).not.toBe(p.profile.account_type);
      }
    }
  });

  it('cada persona tem funções válidas, personalidade e respostas', () => {
    for (const p of PERSONAS) {
      expect(p.profile.roles.length).toBeGreaterThan(0);
      expect(p.personality.length).toBeGreaterThan(20);
      expect(p.replies.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('a matriz de resultados esperados bate com o que o store faz', () => {
    const expected = expectedMatches();
    for (const me of PERSONAS) {
      const s = new DemoStore();
      const deck = s.candidates(me.profile.id, { accountType: me.profile.account_type === 'freelancer' ? 'empresa' : 'freelancer' });
      for (const target of deck) s.swipe(me.profile.id, target.id, 'like');
      const matched = s.listMatches(me.profile.id).map((m) => m.other.id).sort();
      const want = expected[me.key].map((k: string) => personaByKey(k)!.profile.id).sort();
      expect({ persona: me.key, matched }).toEqual({ persona: me.key, matched: want });
    }
  });

  it('cobre os casos de teste: vários matches, nenhum match e indisponíveis', () => {
    const e = expectedMatches();
    expect(Object.values(e).some((m: any) => m.length === 0)).toBe(true);
    expect(e.f2).toHaveLength(2);
    expect(PERSONAS.some((p) => !p.profile.available && p.profile.account_type === 'freelancer')).toBe(true);
    expect(PERSONAS.some((p) => !p.profile.available && p.profile.account_type === 'empresa')).toBe(true);
  });

  it('SQL e guia versionados estão em dia com personas.json', () => {
    expect(fs.readFileSync(path.join(root, 'supabase/seed/personas.sql'), 'utf8')).toBe(genSql());
    expect(fs.readFileSync(path.join(root, 'docs/personas-teste.md'), 'utf8')).toBe(genDoc());
  });
});
