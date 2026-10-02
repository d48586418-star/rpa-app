import type { Profile } from '../lib/types';
import { CardDeck, DeckEmpty, type Decision } from './CardDeck';
import { ProfileCard } from './ProfileCard';

type Props = { profiles: Profile[]; onSwipe: (p: Profile, dir: 'like' | 'pass') => void };

/** Deck de pessoas/empresas: direita chama, esquerda pula. */
export function SwipeDeck({ profiles, onSwipe }: Props) {
  return (
    <CardDeck
      items={profiles}
      keyOf={(p) => p.id}
      renderCard={(p) => <ProfileCard profile={p} />}
      onDecision={(p, d: Decision) => onSwipe(p, d === 'like' ? 'like' : 'pass')}
      labels={{ like: 'Chamar', pass: 'Pular' }}
      empty={<DeckEmpty title="Acabaram os perfis" text="Volte mais tarde ou ajuste os filtros." />}
    />
  );
}
