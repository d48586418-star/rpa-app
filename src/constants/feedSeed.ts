/** Posts de exemplo da Rede (demo). As fotos são ilustrativas e não mostram os trabalhos reais citados. */
export type SeedPost = {
  author: string; // chave da persona
  photo: string;
  caption: string;
  role: string | null;
  credit: string | null;
  daysAgo: number;
  likedBy: string[];
  comments: { author: string; body: string }[];
};

export const SEED_POSTS: SeedPost[] = [
  {
    author: 'f1', photo: 'steadicam', role: 'Diretor(a) de Fotografia', credit: 'Institucional Cacau Real', daysAgo: 0,
    caption: 'Bastidor de ontem: plano-sequência com estabilizador na fazenda. Luz natural até o fim.',
    likedBy: ['f2', 'e1', 'e2'], comments: [{ author: 'e1', body: 'Ficou lindo! Vamos conversar sobre a próxima.' }],
  },
  {
    author: 'e1', photo: 'estudio-set', role: null, credit: null, daysAgo: 1,
    caption: 'Montamos o set do comercial de hoje. Falta fechar a equipe de luz, tem vaga aberta em Vagas.',
    likedBy: ['f1', 'f4'], comments: [{ author: 'f1', body: 'Já me candidatei!' }],
  },
  {
    author: 'f2', photo: 'edicao-laptop', role: 'Editor(a)', credit: 'Documentário Maré', daysAgo: 2,
    caption: 'Corte final do documentário. Três semanas de montagem, uma timeline só.',
    likedBy: ['f1', 'e2', 'e5'], comments: [],
  },
  {
    author: 'f5', photo: 'casamento-lago', role: 'Direção de Arte', credit: null, daysAgo: 3,
    caption: 'Ambientação do casamento de sábado, tons terrosos e muita luz do fim de tarde.',
    likedBy: ['e5'], comments: [{ author: 'e5', body: 'Essa paleta é a nossa cara.' }],
  },
  {
    author: 'f4', photo: 'drone-rio', role: 'Motion Designer', credit: null, daysAgo: 4,
    caption: 'Teste de tracking em imagem aérea para a abertura do clipe.',
    likedBy: ['e3'], comments: [],
  },
  {
    author: 'e4', photo: 'show-luzes', role: null, credit: null, daysAgo: 5,
    caption: 'Fechamos a captação do festival. Obrigado a toda a equipe de som e imagem.',
    likedBy: ['f3', 'f1'], comments: [{ author: 'f3', body: 'Foi um prazer!' }],
  },
  {
    author: 'f3', photo: 'mesa-som', role: 'Técnico(a) de Som', credit: null, daysAgo: 6,
    caption: 'Mixagem ao vivo na passagem de som. Som limpo faz o resto do filme acontecer.',
    likedBy: ['e4'], comments: [],
  },
];
