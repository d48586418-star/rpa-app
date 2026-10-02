# Autoanálise final (2026-10-02)

## Conferido e corrigido
- **Créditos × realidade**: a página dizia "nenhuma imagem gerada por IA" e "nenhuma fotografia de pessoa real". Era falso. Agora: personagens = imagens e vídeos gerados por IA; fotos do Museu = imagens da internet (fonte específica não registrada, ver `assets/museu/creditos.json`); planos = curtas do projeto Cinema na Comunidade. Rótulos visíveis no palco do perfil, nas boas-vindas, na legenda das fotos do Museu e em Créditos.
- **Autoria**: "desenvolvido por Claude Code (Anthropic) e por Débora Augusta Alves Santos" em Créditos, no Início e na capa.
- **Fontes tipográficas** nos créditos diziam Archivo/Inter/JetBrains; o site usa DM Sans. Corrigido antes.
- **Textos internos visíveis ao aluno**: varredura por "conferir", "a confirmar", "TODO", "pendente", "fontes consultadas", "confirmada pela autora": nenhum aparece na interface (os campos `fonte` de `conceitos.json` não são exibidos). `nota_instituicoes` removida dos dados.
- **Contraste**: `tests/a11y.js` cobre 18 rotas em 5 combinações (claro/escuro, 360/390/1280) e cada um dos 5 perfis (boas-vindas, tela final, palco de Meu espaço), claro e escuro. Corrigidos: cor do texto por contraste real em cada perfil (Experimental passou a usar texto escuro), cor de interface do perfil Olhar mais escura, textos sobre cor de perfil sempre opacos, barra de abas escura, rótulos pequenos.
- **Sem localStorage** (modo privado): sem erros; o aviso do app aparece em Meu espaço; rota inexistente volta às boas-vindas; `lang="pt-BR"`.
- **Entrada das páginas**: nunca animava (começava visível). Corrigido e coberto por `tests/animacoes.js`.

## Ainda não coberto (ver `tests/LIMITES.md`)
- Safari/iOS e Android reais; áudio audível; fluidez das animações em aparelho real; teste com pessoas de 16 a 18 anos (roteiro em `tests/ROTEIRO_TESTE_JOVENS.md`).
- Fonte específica e licença de cada foto do Museu: a autora informou apenas "imagens da internet". Antes de divulgar amplamente, identificar origem e licença de cada uma.
- Citações: conferidas por busca (ver `tests/CITACOES.md`); trechos entre aspas dos livros não foram lidos nas edições.
- Qualidade dos vídeos: planos de atividades têm 320×180 (130–160 kb/s). Subir a qualidade exige os arquivos originais.
