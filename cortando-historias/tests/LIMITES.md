# O que este ambiente NÃO consegue testar

- **Safari/iOS e Android reais**: só há Chromium. Foram emulados iPhone SE/14/Pixel (viewport, DPR 3, toque real via CDP, `isMobile`). Não testado: Safari (WebKit), barra de endereço dinâmica do iOS, vibração/áudio reais, `backdrop-filter` no WebKit antigo, política de autoplay do iOS.
- **Áudio**: o ambiente não toca som. O teste `tests/animacoes.js` comprova que 4 osciladores são criados com o som ligado e nenhum com ele desligado.
- **Animações**: verificadas por amostragem de valores computados no tempo; fluidez (fps) em aparelhos reais não foi medida.
- **Pessoas de 16 a 18 anos**: não houve teste de uso. Roteiro em `tests/ROTEIRO_TESTE_JOVENS.md`.
- **Sites de referência (Awwwards, Motionsites)**: bloqueados pela rede do ambiente.

## Capa (iPhone)
- Testada no Chromium com toque real e com "Reduzir Movimento" ligado/desligado (360/390/414). **Safari/iPhone reais não foram testados.** Se no seu iPhone a capa parecer diferente, confira Ajustes > Acessibilidade > Movimento > Reduzir Movimento: ligado = o papel esmaece e abre sem zoom; desligado = rasga e a câmera entra.
