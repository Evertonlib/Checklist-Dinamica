# Teste de cenários do PDF — rodada 2 (card #110, ordem dos eletros)

Mesmo método da rodada 1 (ver `../LEIAME.md`): chama a `gerarPdf` **real** de cada
versão e confere o PDF contra o esperado escrito por extenso em `analisar.py`.
Resultado: `PARECER_REPLAY_JULES_ELETROS.md`.

## O que este teste confere

- **Ordem** das linhas da tabela de eletros. Cada eletro tem no modelo uma etiqueta
  única (`C-xxx` na Cozinha, `O-xxx` em Outros) e o teste lê a ordem delas.
- **Links**: cada link aponta para a URL da própria linha, e toda linha que mostra
  "Ver link" tem link clicável.
- **Estado intacto**: o estado passado à `gerarPdf` é comparado antes e depois.

## Como rodar

Igual à rodada 1, com duas diferenças:

- Base `70495ff`, solução real `a458808`. Os shims `shim_jspdf.js` e
  `shim_autotable.js` são os da pasta de cima.
- Use os `gerar.mjs` e `analisar.py` desta pasta. `analisar.py` aceita as variantes
  como argumento: `python -I analisar.py base real jules`.

## Validação do teste

- Base falha nos cenários 1 e 2; a solução real passa nos 4 do card.
- Duas versões propositalmente erradas da solução real também falham: uma ordena
  o array do estado (`eletros.sort` sem cópia), outra ordena as linhas e não os links.
