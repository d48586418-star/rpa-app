# Relatório de integração — pacote de takes, personas e Museu

Estado: out/2026. Motor (`js/engine.js`, `js/leituras.js`) **inalterado**. As atividades novas têm regras próprias em `js/novas.js`, com o mesmo formato de retorno do motor.

## Mapa de atividades (antigo → novo)
| Pacote / pedido | Situação | ID no laboratório |
|---|---|---|
| EX_KULESHOV_001 | **MANTIDO** (não mexi em regra nem takes) | EX_KULESHOV_001 |
| Corte direto (pacote EX_CORTE_001) | **NOVO** — ID trocado para não colidir com o EX_CORTE_001 que já existia | EX_CORTEDIRETO_001 |
| Corte em ação / “O copo” | **MANTIDO** (já existia como EX_CONTINU_DF01) | EX_CONTINU_DF01 |
| Match cut | **COMPLEMENTADO** — takes TAKE_008_001/002 e exemplo Lawrence da Arábia | EX_MATCHCUT_MC01 |
| Jump cut | **MANTIDO** | EX_JUMPCUT_NL01 |
| Elipse | **MANTIDO** | EX_ELIPSE_NL01 |
| Eixo / mesmo lado da linha | **NOVO** | EX_EIXO_001 |
| Experimentação (mesma história, outra ordem) | **NOVO** | EX_EXPERIMENTO_001 |
| J-cut | **NOVO** — áudio real separável | EX_JCUT_001 |
| L-cut | **NOVO** — áudio real separável | EX_LCUT_001 |
| Cross-cut (parte 3, TAKE_010) | **NOVO** — clipes curtos recortados do TAKE_010_033 de “Do meu lado” (Boitui, 2018), que já alterna duas linhas | EX_CROSSCUT_001 |
| Ritmo, legendas, transições | **PENDENTE** — sem atividade; entram só no Museu (ritmo via Murch) |  |
| G-cut | **DESCARTADO** — não existe nos dados |  |
| `capa.psd` | **DESCARTADO** — não incluído |  |
| Print da capa | **SUBSTITUÍDO** por recriação em CSS (vermelho #E90005, matriz de letras, faixa de filme); a imagem não é colada |  |
| Exportar/importar `.json` na interface | **SUBSTITUÍDO** por “Salvar minha jornada” (PDF). O JSON ficou na rota oculta `#/tecnico` |  |

Takes: 29 novos (WebM + MP4 + miniatura) e 4 áudios (ogg + m4a), registrados por `scripts/import-pack.py` em `data/novos-takes.json`.

## Relatório por atividade
- **Kuleshov** — preservada. Ganhou frase de descoberta (“Você mudou o sentido sem mudar a primeira imagem.”).
- **Corte direto** — o aluno junta dois planos; a descoberta chega pelo corte seco, sem efeito.
- **Corte em ação (O copo)** — preservada.
- **Match cut** — complementada com o par TAKE_008 e a referência a Lawrence da Arábia (trecho usado como exemplo educativo; ver créditos).
- **Jump cut / Elipse** — preservadas; a pergunta e o bloco de descoberta continuam diferentes entre as duas.
- **Eixo** — o aluno monta com planos do mesmo lado; vê o espaço inteiro. *Limite:* o pacote não trouxe contraexemplo (cruzar a linha).
- **Experimentação** — vê a ordem original e depois monta a sua; a descoberta é “a ordem importa”.
- **J-cut** — o aluno toca em **Separar**, arrasta o som para antes da imagem; regra mínima de 0,6 s de diferença. O áudio toca de verdade, sincronizado.
- **L-cut** — o som de A continua sobre B; o aluno estica o som. No L-cut, o áudio de B (022) não é ligado automaticamente porque o áudio estendido do pacote (17,01 s) já é contínuo com ele.
- **Cross-cut** — o aluno descobre quais planos são de cada casa (telefone/altar × mesa/lampião) e alterna entre elas. Dois ou mais retornos = montagem paralela; só uma casa ou “uma, depois a outra” recebe outra leitura. Os cinco takes brutos do pacote (62 a 226 s) não entraram: eram longos demais e o TAKE_010_033 já tinha a alternância; os clipes (6 a 8 s) foram cortados com `scripts/import-take010.py`.

## O que há de novo na interface
Boas-vindas (nome → editor → início); 5 personas oficiais (textos da ficha, sem invenção); capa vermelha com CORTANDO / HISTÓRIAS empilhados e sem símbolo; timeline com arrastar, tesoura, excluir, playhead e faixas V1/A1; momento de descoberta tipográfico (300–500 ms, `aria-live`, respeita movimento reduzido, som opcional em Meu espaço); Passaporte em PDF; Museu da Edição.

## Museu da Edição
`data/museu.json`: 10 paradas (Méliès 1896, Porter 1903, Griffith 1908–1915, Kuleshov, Eisenstein 1925, Vertov/Svilova 1929, Godard/Decugis 1960, Lean/Coates 1962, Murch, J/L-cut), cada uma em 3 níveis (frase / parágrafo / aprofundar + o que as fontes não resolvem + links). Seis critérios de Murch, 6 montadoras e montadores, mapa de conceitos. Cada parada liga às atividades; atividades e conceitos ligam de volta. O termo “efeito Douton” era erro de digitação e foi removido.

Fontes: busca na web em out/2026 (Wikipédia não abre neste ambiente; usei Britannica, BFI, Washington Post, PMC e outras, listadas em cada entrada). Pesquisa de apoio, não bibliografia acadêmica.

## Pendências e limites
- Cartilha integrada (ver `AUDITORIA_CARTILHA.md`). Itens da cartilha sem atividade ficam fora por decisão da autora.
- Museu: Pudovkin e Eisenstein agora têm parada, mas só por fontes secundárias. Anne Bauchens, Margaret Booth e Dede Allen não foram verificados, portanto fora.
- Nomes das personas estão no feminino/masculino conforme a ficha; confirmar com a autora (`nota_nomes` em `data/personas.json`). A persona “Ritmo” tem campo `pendente`.
- PDF: em `file://` as imagens são omitidas (o navegador bloqueia o canvas). Em servidor (http/https) elas entram. Dentro de um artifact com CSP o download pode ser bloqueado.
- Safari/iOS real não testado (MP4 fallback implementado).
- Sem atividade e sem material: ritmo, legendas, transições e o contraexemplo do eixo (nenhum plano cruza a linha).
