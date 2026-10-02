import type { JobCard } from '../lib/api';
import { CardDeck, DeckEmpty, type Decision } from './CardDeck';
import { JobFace } from './JobCard';

type Props = {
  cards: JobCard[];
  onDecision: (c: JobCard, d: Decision) => void;
  onOpen?: (c: JobCard) => void;
  canUndo: boolean;
  onUndo: () => void;
};

/** Deck de vagas (Tinder de trabalhos): direita candidata, esquerda pula, para cima salva. */
export function JobDeck({ cards, onDecision, onOpen, canUndo, onUndo }: Props) {
  return (
    <CardDeck
      items={cards}
      keyOf={(c) => c.job.id}
      renderCard={(c) => <JobFace c={c} />}
      onDecision={onDecision}
      onOpen={onOpen}
      labels={{ like: 'Candidatar', pass: 'Pular', save: 'Salvar' }}
      canUndo={canUndo}
      onUndo={onUndo}
      empty={<DeckEmpty title="Você viu todas as vagas" text="Novas vagas aparecem aqui. Veja as salvas ou volte mais tarde." />}
    />
  );
}
