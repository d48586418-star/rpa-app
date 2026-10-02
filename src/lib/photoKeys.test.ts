import { PHOTOS } from '../constants/photos';
import { PERSONAS } from '../constants/personas';
import { COVER_CHOICES, FEED_PHOTOS, GENRE_PHOTOS, PERSONA_PHOTO, ROLE_PHOTOS, coverFor, galleryFor, isPhotoRef, photoKey, photoRef } from './photoKeys';
import { textMatches } from './search';
import { perksFor, requirementsFor } from './jobInfo';
import type { Genre, Job } from './types';

const job = (o: Partial<Job> = {}): Job => ({
  id: 'j9', owner_id: 'o', title: 'T', role: 'Operador(a) de Câmera', genre: 'casamento', date: '2026-10-10', days: 2, city: 'Ilhéus',
  budget_per_day: 600, gear: ['Sony FX3'], description: '', status: 'open', created_at: '2026-10-01', ...o,
});

describe('fotos', () => {
  it('toda chave usada existe empacotada', () => {
    const keys = [
      ...Object.values(GENRE_PHOTOS).flat(), ...ROLE_PHOTOS.flatMap((r) => r.keys), ...FEED_PHOTOS, ...COVER_CHOICES,
      ...Object.values(PERSONA_PHOTO), 'equipamentos',
    ];
    for (const k of keys) expect(PHOTOS[k]).toBeTruthy();
  });

  it('as personas apontam para foto por "photo:chave"', () => {
    for (const p of PERSONAS) {
      expect(isPhotoRef(p.profile.avatar_url)).toBe(true);
      expect(PHOTOS[photoKey(p.profile.avatar_url!)]).toBeTruthy();
    }
    expect(photoRef('marina')).toBe('photo:marina');
    expect(isPhotoRef('https://x/y.jpg')).toBe(false);
  });

  it('a capa é estável por vaga, respeita a escolhida e fica no pool do gênero', () => {
    const j = job();
    expect(coverFor(j)).toBe(coverFor(j));
    expect(GENRE_PHOTOS.casamento).toContain(coverFor(j));
    expect(coverFor(job({ cover: 'drone-rio' }))).toBe('drone-rio');
    for (const g of Object.keys(GENRE_PHOTOS) as Genre[]) expect(GENRE_PHOTOS[g]).toContain(coverFor(job({ genre: g })));
  });

  it('a galeria começa pela capa, não repete e tem até 4 fotos', () => {
    const g = galleryFor(job({ role: 'Piloto de Drone' }));
    expect(g[0]).toBe(coverFor(job({ role: 'Piloto de Drone' })));
    expect(new Set(g).size).toBe(g.length);
    expect(g.length).toBeGreaterThanOrEqual(2);
    expect(g.length).toBeLessThanOrEqual(4);
  });
});

describe('busca e informações da vaga', () => {
  it('ignora acento e caixa e exige todas as palavras', () => {
    expect(textMatches('itacare', 'Casamento em Itacaré')).toBe(true);
    expect(textMatches('CASAMENTO itacare', 'Casamento em Itacaré')).toBe(true);
    expect(textMatches('casamento ilheus', 'Casamento em Itacaré')).toBe(false);
    expect(textMatches('   ', 'qualquer')).toBe(false);
  });

  it('requisitos derivam dos dados quando a empresa não escreveu', () => {
    const r = requirementsFor(job());
    expect(r.join(' ')).toMatch(/Sony FX3/);
    expect(r.join(' ')).toMatch(/2 diárias/);
    expect(requirementsFor(job({ requirements: ['CNH'] }))).toEqual(['CNH']);
    expect(perksFor(job()).length).toBeGreaterThan(0);
  });
});

import { profileSubtitle, rolesText } from './profileText';

describe('texto do perfil', () => {
  it('empresa mostra cidade e "Empresa"; as funções viram "Procura ..."', () => {
    const e = { account_type: 'empresa' as const, roles: ['Editor(a)', 'Colorista'], city: 'Ilhéus' };
    expect(profileSubtitle(e)).toBe('Ilhéus · Empresa');
    expect(rolesText(e)).toBe('Procura Editor(a), Colorista');
    const f = { account_type: 'freelancer' as const, roles: ['Editor(a)', 'Colorista'], city: 'Itabuna' };
    expect(profileSubtitle(f)).toBe('Editor(a) · Itabuna');
    expect(rolesText(f)).toBe('Editor(a) · Colorista');
  });
});
