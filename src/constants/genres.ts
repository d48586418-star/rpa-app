import type { Genre } from '../lib/types';

export const GENRES: { id: Genre; label: string }[] = [
  { id: 'casamento', label: 'Casamento' },
  { id: 'publicidade', label: 'Publicidade' },
  { id: 'documentario', label: 'Documentário' },
  { id: 'evento', label: 'Evento' },
  { id: 'institucional', label: 'Institucional' },
  { id: 'clipe', label: 'Clipe' },
  { id: 'ficcao', label: 'Ficção' },
];

export const genreLabel = (g: Genre) => GENRES.find((x) => x.id === g)?.label ?? g;
