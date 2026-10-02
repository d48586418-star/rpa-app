import { hashString } from './shapes';
import type { Genre } from './types';

/** Chaves das fotos empacotadas (CC0, ilustrativas). O arquivo de cada uma está em src/constants/photos.ts. */
export const GENRE_PHOTOS: Record<Genre, string[]> = {
  casamento: ['casamento-lago', 'casamento-banco', 'casamento-maos'],
  publicidade: ['estudio-set', 'camera-monitor', 'camera-tripe'],
  documentario: ['steadicam', 'cinegrafista-escada', 'fotografo-penhasco', 'litoral-ilha'],
  evento: ['show-luzes', 'show-publico', 'palco-fumaca'],
  institucional: ['camera-tripe', 'edicao-estudio', 'mesa-som', 'cinegrafista-camera'],
  clipe: ['palco-camera', 'show-luzes', 'drone-mar'],
  ficcao: ['claquete', 'camera-vintage', 'projetor', 'camera-vermelha'],
};

/** Fotos extras que combinam com o tipo de função (para a galeria da vaga). */
export const ROLE_PHOTOS: { match: RegExp; keys: string[] }[] = [
  { match: /drone|aér/i, keys: ['drone-floresta', 'drone-rio', 'sol-drone'] },
  { match: /som|áudio|audio/i, keys: ['microfone-estudio', 'mesa-som'] },
  { match: /edi|montag|color/i, keys: ['edicao-laptop', 'edicao-estudio'] },
  { match: /fotograf|câmera|camera/i, keys: ['camera-monitor', 'camera-vermelha', 'cinegrafista-camera'] },
];

export const FEED_PHOTOS = [
  'steadicam', 'casamento-lago', 'drone-rio', 'estudio-set', 'show-luzes', 'edicao-laptop', 'praia-coqueiros',
  'camera-vermelha', 'palco-fumaca', 'litoral-ilha', 'gravacao-gimbal', 'equipamentos',
];

export const COVER_CHOICES = [
  'estudio-set', 'steadicam', 'casamento-lago', 'show-luzes', 'camera-vintage', 'drone-floresta', 'mesa-som',
  'edicao-estudio', 'praia-coqueiros', 'claquete', 'camera-tripe', 'palco-camera',
];

/** Foto de capa da vaga: a escolhida na criação ou uma estável por gênero + id. */
export function coverFor(job: { id: string; genre: Genre; cover?: string | null }): string {
  if (job.cover) return job.cover;
  const pool = GENRE_PHOTOS[job.genre];
  return pool[hashString(job.id) % pool.length];
}

/** Capa + 2 a 3 fotos da galeria, sem repetir. */
export function galleryFor(job: { id: string; genre: Genre; role: string; cover?: string | null }): string[] {
  const out = [coverFor(job)];
  const extra = [
    ...GENRE_PHOTOS[job.genre],
    ...(ROLE_PHOTOS.find((r) => r.match.test(job.role))?.keys ?? []),
    'equipamentos',
  ];
  for (const k of extra) if (!out.includes(k) && out.length < 4) out.push(k);
  return out;
}

/** Foto de perfil das personas de exemplo (retratos ilustrativos e capas para as empresas). */
export const PERSONA_PHOTO: Record<string, string> = {
  f1: 'marina', f2: 'caio', f3: 'joana', f4: 'theo', f5: 'bia',
  e1: 'estudio-set', e2: 'steadicam', e3: 'edicao-laptop', e4: 'show-luzes', e5: 'projetor',
};

export const PHOTO_SCHEME = 'photo:';
export const photoRef = (key: string) => `${PHOTO_SCHEME}${key}`;
export const isPhotoRef = (s: string | null | undefined): s is string => Boolean(s && s.startsWith(PHOTO_SCHEME));
export const photoKey = (ref: string) => ref.slice(PHOTO_SCHEME.length);
