# Análise visual e de usabilidade (fase de redesign)

Texto de trabalho. Tudo aqui vem da leitura das 13 referências e do uso do app na demo, **sem teste com pessoas reais**. As hipóteses abaixo precisam ser validadas com profissionais da região antes de virarem regra.

## O que as referências ensinam

| Referência | O que levamos | O que deixamos |
|---|---|---|
| Chats (cartões em balão, adesivos, pastas, barra preta, grade) | Cartões de conversa, vaga, projeto e Cena como **balões coloridos** com canto superior esquerdo reto; foto como "adesivo" inclinado; fundo off-white com grade fina; barra inferior preta em pílula | Ilustrações e textos da imagem |
| Eyewear (cartas em leque) | Deck com 2 cartas atrás, inclinadas; abertura com 3 fotos em leque | Produto e marca |
| digupAI (busca de vidro sobre mosaico) | Busca de vidro fosco no Início sobre um mosaico de fotos | Chips e prompts de IA |
| CircleUp (blobs) | Blob colorido com a inicial, só para perfis sem foto | Blob como padrão |
| As 9 anteriores | Squircles grandes, vidro, títulos grandes e leves em dois tons, barra de pílula com item central | Lima e laranja (cor trocada por azul elétrico a pedido) |

## Problemas do app antes desta fase

1. **Laranja carregado** em todo botão, aba e chip; o usuário não gostou.
2. **Início denso**: cinco seções em lista, vários carrosséis com cartões do mesmo peso. Quem abre o app não sabe o que fazer primeiro.
3. **Sete abas**, duas delas (Cena e Projetos) pouco usadas. O "+" ficava sobre a barra e levava a uma tela de formulário, não a uma escolha.
4. **Swipe só de pessoas**. Quem procura trabalho precisava abrir cartões de vaga em lista; não havia o "ficar escolhendo" do Tinder.
5. **Emoji e glifos de texto** (✕ → ✓ ★ ←) com pesos e tamanhos diferentes em cada tela.
6. **Vaga sem rosto**: só texto; sem foto, sem galeria, sem informações de empresa, sem requisitos.
7. **Sem rede social**: o profissional só mostrava trabalho como crédito de texto.

## Decisões e por quê

| Decisão | Motivo |
|---|---|
| Claro primeiro, azul elétrico `#2F5BFF` como única cor de ação | Pedido do usuário. Texto branco sobre o azul dá contraste 5,2:1; azul sobre o fundo claro 4,7:1; texto muted `#62626D` sobre `#F6F4F1` 5,5:1 (medidos por script) |
| Barra inferior: 4 itens + "+" dentro da barra | O "+" fora de lugar era o erro apontado. Agora tem 58 px, borda da cor do fundo e rótulo acessível; cada item tem ícone **e** texto, o ativo vira pílula branca |
| "+" abre folha com 3 ações | Reconhecimento em vez de lembrança: o usuário vê o que pode criar. Vaga fica desabilitada com o motivo para quem não é empresa |
| Swipe de vagas com 3 gestos (direita, esquerda, cima) e 4 botões | Cada gesto tem o botão equivalente (acessibilidade) e um aviso curto com **Desfazer**. Candidatar é grátis e reversível até a empresa responder |
| Carta com só 4 informações (empresa, match, título, data/cidade/diária) | Carga cognitiva: o resto aparece ao tocar. Divulgação progressiva |
| Detalhe com abas Sobre · Requisitos · Empresa | Evita uma página longa; o match explicado fica em Sobre, onde a decisão acontece |
| Início com 3 blocos (vagas, gente, conversas) e 2 linhas de atalho | Menos de uma tela e meia; "Cena" e "Projetos" viram atalhos |
| Perfil com seções recolhíveis (Meus posts, Conquistas, Agenda) | O perfil acumulava cinco blocos; quem quer editar disponibilidade ainda encontra de primeira |
| Rede com foto, curtir, comentar, salvar | Mistura com rede social sem virar feed infinito: poucos posts, cada um com crédito marcável |
| Ícones SVG de traço único no lugar de emojis | Mesmo peso, herdam cor, funcionam em temas claro e escuro |
| Fotos CC0 marcadas como ilustrativas | Vaga e perfil sem foto parecem vazios; a marcação evita fingir que a foto é da pessoa ou da empresa |

## Heurísticas aplicadas

- **Visibilidade do estado**: avisos de candidatura, salva e pulada; estágio do contrato em passos; passos 1 a 4 na criação de vaga.
- **Controle e liberdade**: Desfazer no deck, cancelar candidatura, fechar a folha do "+".
- **Reconhecimento acima de lembrança**: rótulos junto aos ícones; cartas com dica "Toque para ver os detalhes".
- **Lei de Fitts**: botões de ação 60 a 68 px, nunca menos de 44 px de toque.
- **Prevenção de erro**: "Continuar" desabilitado até o passo estar válido; piso de referência ao definir diária.
- **Contraste**: texto sobre foto fica sobre degradê escuro mais painel de vidro; estado nunca só por cor.

## O que ainda precisa de teste com pessoas

1. O gesto "para cima = salvar" é descoberto? Hoje o botão de marcador é o caminho visível.
2. Profissionais querem **candidatar com um gesto** ou preferem confirmar antes? Há desfazer, mas não há confirmação.
3. A Rede atrai quem posta, ou só quem olha? Falta moderação e denúncia antes de abrir ao público.
4. Fotos ilustrativas: a faixa de aviso é clara o bastante?
5. Modo escuro: tokens prontos em `palette.dark`, sem tela revisada.

## Limites desta versão

- Blur e gestos na web diferem do nativo; foi testado no navegador (390x844), não em aparelho.
- Rede, vagas, salvas e comentários rodam só na demo, sem backend Supabase.
- Upload de fotos na demo usa o arquivo local; não há armazenamento real nem moderação.
