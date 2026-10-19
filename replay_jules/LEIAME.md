# Teste de cenários do PDF (replay do Jules, card G1/G5)

Gera PDFs chamando a `gerarPdf` **real** de cada versão do código e confere o
texto contra o resultado esperado, escrito por extenso em `analisar.py` (nunca
calculado pelo código testado). Foi usado para comparar o PR do Jules com a
solução real. Detalhes e resultado: `PARECER_REPLAY_JULES_G1G5.md`.

Esta pasta não faz parte do app: o Vite só compila `src/` e `index.html`.

## O que tem aqui

- `gerar.mjs` — monta o estado de cada cenário e chama a `gerarPdf`.
- `analisar.py` — lê os PDFs (pdfplumber) e compara com o esperado e entre versões.
- `shim_jspdf.js`, `shim_autotable.js` — ajustam a importação de `jspdf` e
  `jspdf-autotable` para rodar em Node.

## Como rodar

Pré-requisitos: Node, `npm ci` feito na raiz da repo (o `esbuild` vem junto com o
Vite) e Python com `pdfplumber`.

Trabalhe numa pasta **fora da repo** (exemplo: `cenarios/`):

1. Copie para ela os 4 arquivos desta pasta e uma cópia (ou link) do `node_modules` da repo.
2. Para cada versão a comparar (`base`, `real`, `jules`), extraia o código:
   `git archive <commit> src package.json | tar -x -C <versao>`
   (para o PR do Jules: extraia a base e aplique o diff do PR com `git apply`).
3. Em cada `<versao>/`, crie `entry.js` com duas linhas:
   ```js
   export { gerarPdf } from './src/services/pdf.js'
   export { estadoInicial, defaultsPorFormType } from './src/domain/schema.js'
   ```
4. Empacote para Node (formato `cjs`, não `esm`):
   ```
   node_modules/.bin/esbuild <versao>/entry.js --bundle --platform=node --format=cjs \
     --alias:jspdf=./shim_jspdf.js --alias:jspdf-autotable=./shim_autotable.js \
     --outfile=<versao>/bundle.cjs
   ```
5. `node gerar.mjs <versao>` para cada versão, depois `python -I analisar.py`.

Antes de confiar no resultado, valide o teste: a versão **base** deve falhar nos
cenários 1 a 3 e a **solução real** deve passar em todos.

## Limites

- Confere o texto do PDF, não o layout.
- Os cenários 1 a 4 vêm do card; o 5 é extra (rebaixo "Sim" sem `cm`).
- `analisar.py` tem os nomes dos ambientes e o esperado deste card fixos; para
  outro card, troque o bloco `ESPERADO` e `cenarios` em `gerar.mjs`.
