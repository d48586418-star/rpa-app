export type AccountType = 'freelancer' | 'empresa';

export type Profile = {
  id: string;
  account_type: AccountType;
  website: string | null;
  name: string;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  roles: string[];
  day_rate_min: number | null;
  day_rate_max: number | null;
  available: boolean;
  portfolio_links: string[];
  gear: string | null;
};

export type Match = {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
};

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

// ---- Jobs, match % e contrato (Fase 5) ----

export type Genre = 'casamento' | 'publicidade' | 'documentario' | 'evento' | 'institucional' | 'clipe' | 'ficcao';

export type Credit = {
  id: string;
  title: string;
  role: string;
  genre: Genre;
  year: number;
  /** Confirmado pelo contratante ou pela equipe do trabalho. */
  verified: boolean;
};

export type Reputation = {
  ratingAvg: number | null; // 1 a 5
  ratingCount: number;
  attendance: number | null; // 0 a 1
  onTime: number | null; // 0 a 1
};

export type Job = {
  id: string;
  owner_id: string;
  title: string;
  role: string;
  genre: Genre;
  date: string; // YYYY-MM-DD (primeiro dia)
  days: number;
  city: string | null; // null = remoto
  budget_per_day: number;
  gear: string[];
  description: string;
  status: 'open' | 'closed' | 'done';
  created_at: string;
  /** Chave de foto empacotada escolhida na criação (senão usa a do gênero). */
  cover?: string | null;
  requirements?: string[];
  perks?: string[];
};

export type Application = {
  job_id: string;
  pro_id: string;
  status: 'applied' | 'invited' | 'selected' | 'declined';
  created_at: string;
};

export type Stage =
  | 'contrato_pendente'
  | 'aguardando_pagamento'
  | 'em_custodia'
  | 'em_andamento'
  | 'entregue'
  | 'liberado'
  | 'concluido';

export type Engagement = {
  id: string;
  job_id: string;
  pro_id: string;
  owner_id: string;
  stage: Stage;
  check_in_at: string | null;
  check_out_at: string | null;
  xp_awarded: { label: string; xp: number }[];
};

export type ReviewScores = { tecnica: number; comunicacao: number; prazo: number };

export type Review = {
  engagement_id: string;
  reviewer_id: string;
  reviewee_id: string;
  scores: ReviewScores;
  tip: string | null;
};

// ---- Projetos abertos, disponibilidade e Cena ----

export type Availability = 'now' | 'open' | 'busy' | 'from';

export type ProjectRole = {
  role: string;
  /** Quem foi escolhido para a função (null = procurando). */
  filledBy: string | null;
  /** Profissionais que marcaram "tenho interesse" nesta função. */
  interested: string[];
};

export type OpenProject = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  city: string | null;
  budget_total: number;
  roles: ProjectRole[];
  created_at: string;
};

export type CenaKind = 'evento' | 'oficina' | 'edital' | 'chamada' | 'vaga';

export type CenaItem = {
  id: string;
  kind: CenaKind;
  title: string;
  city: string;
  /** Dias a partir de hoje. */
  offsetDays: number;
  description: string;
};

// ---- Rede (posts de trabalhos) ----

export type Comment = { id: string; author_id: string; body: string; created_at: string };

export type Post = {
  id: string;
  author_id: string;
  /** Chave de foto empacotada ou URI local escolhida pelo usuário. */
  photo: string;
  caption: string;
  role: string | null;
  /** Título do trabalho marcado como crédito (opcional). */
  credit: string | null;
  created_at: string;
  likes: string[]; // ids de quem curtiu
  saves: string[];
  comments: Comment[];
};
