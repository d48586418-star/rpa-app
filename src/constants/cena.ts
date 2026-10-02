import type { CenaItem, CenaKind } from '../lib/types';

export const CENA_KINDS: { id: CenaKind; label: string }[] = [
  { id: 'evento', label: 'Eventos' },
  { id: 'oficina', label: 'Oficinas' },
  { id: 'edital', label: 'Editais' },
  { id: 'chamada', label: 'Chamadas' },
  { id: 'vaga', label: 'Vagas' },
];

export const KIND_LABEL: Record<CenaKind, string> = { evento: 'EVENTO', oficina: 'OFICINA', edital: 'EDITAL', chamada: 'CHAMADA', vaga: 'VAGA' };

/**
 * DADOS DE EXEMPLO. Nomes, datas e locais são inventados para mostrar como a Cena funciona.
 * Nenhum item aqui é um evento, edital ou vaga real.
 */
export const CENA_ITEMS: CenaItem[] = [
  { id: 'c1', kind: 'evento', title: 'Mostra de curtas do cacau', city: 'Itabuna', offsetDays: 1, description: 'Sessões de curtas feitos na região, seguidas de conversa com as equipes.' },
  { id: 'c2', kind: 'oficina', title: 'Oficina de montagem para iniciantes', city: 'Ilhéus', offsetDays: 3, description: 'Uma tarde prática de corte, ritmo e organização de projeto no computador.' },
  { id: 'c3', kind: 'chamada', title: 'Chamada de elenco para curta de época', city: 'Valença', offsetDays: 5, description: 'Testes para três papéis. Não é preciso experiência anterior.' },
  { id: 'c4', kind: 'edital', title: 'Edital de apoio a produção audiovisual regional', city: 'Salvador', offsetDays: 12, description: 'Exemplo de edital estadual com inscrições online. Confira sempre o texto oficial.' },
  { id: 'c5', kind: 'evento', title: 'Encontro de profissionais do audiovisual', city: 'Ilhéus', offsetDays: 8, description: 'Roda de conversa para conhecer quem trabalha com vídeo na região.' },
  { id: 'c6', kind: 'vaga', title: 'Vaga de assistente de edição', city: 'Itabuna', offsetDays: 2, description: 'Produtora local procura apoio em pós-produção, presencial, meio período.' },
  { id: 'c7', kind: 'oficina', title: 'Como precificar a diária', city: 'Porto Seguro', offsetDays: 9, description: 'Conversa prática sobre orçamento, contrato e como apresentar uma proposta.' },
  { id: 'c8', kind: 'chamada', title: 'Chamada de portfólios para vitrine regional', city: 'Itacaré', offsetDays: 14, description: 'Envie até três trabalhos para entrar numa vitrine online da cena local.' },
];
