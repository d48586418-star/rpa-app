import { norm } from './matching';

/** Todas as palavras do termo precisam aparecer em algum dos textos (sem acento e sem maiúsculas). */
export function textMatches(query: string, ...texts: string[]): boolean {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  const hay = norm(texts.join(' '));
  return words.every((w) => hay.includes(w));
}
