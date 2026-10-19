# SPEC — Testes de regressão automatizados (Checklist Dinâmica)

**Card Trello:** #130 TESTES_REGRESSAO_CHECKLIST_DINAMICA
**PRD aprovado:** `PRDS_E_SPECS/PRD_TESTES_REGRESSAO_CHECKLIST_DINAMICA.md` (Everton, 19/10/2026, decisões 7 a 11 da seção 4)
**Base do código:** `main` em `1a6022d`
**Data:** 2026-10-19
**Status:** Aguardando aprovação. Nada foi implementado.
**Prevalência:** durante a implementação este Spec prevalece sobre o PRD e sobre o inventário (`INVENTARIO_FEATURES_CHECKLIST_DINAMICA.md`, só apoio). Onde o código de `1a6022d` difere do PRD, vale o código e a diferença está na seção 2.

---

## 1. O que este Spec entrega

Uma suíte de **111 casos** (S 29, C 16, A 3, F 16, P 37, V 10), mais o procedimento das **8 provas** (H-01, H-02, H-03, H-04, H-07, H-08, H-23, H-24) e as provas de erro dos critérios CA-03, CA-04, CA-06, CA-07 e CA-16. Roda com `npm test` (`node --test`, sem argumento de pasta), offline, sem gravar nada no repositório e sem baixar PDF.

Por que uma suíte nativa do Node e não Vitest/Jest: as regras testadas são funções puras em `.js` e o PDF é testado por captura em memória, então um executor extra só somaria dependência (decisão 1 do PRD). Por que o PDF real e não um falso: é o PDF real que o cliente assina; um falso testaria o falso.

## 2. Observações — diferenças entre o PRD e o código de `1a6022d`

O código prevalece; o PRD não foi alterado.

| # | Observação | Evidência |
|---|---|---|
| O-1 | A instância de ambiente do Cliente usa o campo **`tipo`** (id do catálogo), e não `id`. Formato real: `{ instanceId, tipo, formType, label, nome }`, com `instanceId` = `<tipo>-<índice>` (ex.: `cozinha-0`). O `replay_jules/gerar.mjs:18-19` monta instância com `id`; nada no `src/` lê esse campo, então é irrelevante, mas os construtores desta suíte seguem o formato real. O Projetista usa o mesmo formato sem `formType` | `FormProvider.jsx:79-86`; `FormProviderVendedor.jsx:109-112`; `pdfVendedor.js:114` |
| O-2 | T-P23 e T-P25 dizem "sem tabela". No código o ambiente **tem** tabela do Resumo Executivo, porque `ELETROS_NAODEF` e `ELETRONICOS_NAODEF` são gatilhos de score. O que não pode existir é a **tabela de eletros/eletrônicos** (cabeçalho começando por `Tipo`) nem o subtítulo. O Spec adota essa leitura. T-P18 (sem nenhum gatilho) continua sem tabela alguma | `scoreEngine.js:95-108`; `pdf.js:240-245`; `pdf.js:465-466, 514, 523` |
| O-3 | T-S05 e T-C04 dizem "Cozinha em G2; Dormitório só em G3". Para a supressão G2→G3 aparecer de verdade, a lista G3 contém **os dois** (Cozinha suprimida, Dormitório não). Dormitório continua "só em G3", isto é, fora de G2 | `scoreEngine.js:37`; `ccBuilder.js:29-31, 61` |
| O-4 | Todo `arquivo:linha` do PRD que foi aberto bate com o código de `1a6022d`: `scoreEngine.js:39, 67, 74, 77, 85, 145`; `ccBuilder.js:44, 56, 79, 92`; `checklistTextos.js:1-26`; `pdf.js:27-47, 91-97, 108, 126-127, 240-245, 291-311, 348-367, 378, 447, 454, 462, 511, 515, 572`; `pdfVendedor.js:50-54, 80, 114, 145-146`; `schema.js:108-113`; `package-lock.json:1423, 1919`; `CLAUDE.md:28`. Não foram abertos (não são entrada de teste): `StepAmbientes.jsx`, `StepPerguntasGlobais.jsx`, `BlocoRebaixo.jsx` | leitura direta |
| O-5 | O Spec foi escrito por leitura do código. Depois, em 19/10/2026, a mecânica da seção 4.3 e os cálculos dos casos S/P foram **medidos por protótipo descartável fora do repositório** (seção 8). O que continua só por leitura está marcado "leitura" no mapa | seção 8 |
| O-6 | `jspdf-autotable` 3.8.4 aplica um plugin ao `jspdf` no carregamento, dentro de `try/catch` (`jspdf.plugin.autotable.js:2525-2538`). O Spec já prevê isso na captura (seção 4.3). A função usada pelo `pdf.js` é `autoTable(doc, opções)` (`jspdf.plugin.autotable.js:2510-2514`), que grava `lastAutoTable` na própria instância (`:1673`) | leitura do pacote; protótipo (seção 8, item 6) |
| O-7 | O `jspdf` instalado é o 2.5.2 (`main`: `dist/jspdf.node.min.js`) e o autotable 3.8.4 (`main`: `dist/jspdf.plugin.autotable.js`) | `node_modules/jspdf/package.json:3,6`; `node_modules/jspdf-autotable/package.json:3,5` |

## 3. Arquivos afetados

| Arquivo | O que acontece |
|---|---|
| `package.json` | Alterado: script `test` = `node --test` e `"esbuild": "0.21.5"` em `devDependencies`. Nada mais |
| `package-lock.json` | Alterado só pela entrada do esbuild na raiz (`packages[""].devDependencies`, hoje `package-lock.json:17-20`). Nenhuma versão de pacote muda (o esbuild 0.21.5 já está em `:1422-1425`) |
| `testes/` (pasta nova) | Adicionado: 6 arquivos `*.test.js` + `testes/auxiliares/` |
| `CLAUDE.md` | Alterado no fim do ciclo, só a frase da linha 28 (seção 9, Task 21) |
| `src/`, `.github/workflows/deploy.yml`, `vite.config.js`, `replay_jules/`, `README.md`, `especificacao-checklist-dinamica.md`, PRDs, Specs, pareceres, `dist/` | **Não tocados** |

## 4. Decisões técnicas

### 4.1 Estrutura de pastas e arquivos

```
testes/
  A_ambientes.test.js        grupo A  (3 casos)
  F_validacao.test.js        grupo F  (16 casos)
  S_score.test.js            grupo S  (29 casos)
  C_ccs.test.js              grupo C  (16 casos)
  P_pdf_cliente.test.js      grupo P  (37 casos)
  V_pdf_projetista.test.js   grupo V  (10 casos)
  auxiliares/
    travas.js                trava de rede, de localStorage e de pasta de saída
    relogio.js               relógio fixo (mock.timers)
    construtores.js          montagem das entradas (Cliente e Projetista)
    textos_cc.js             os 13 textos de CC transcritos (só o grupo C importa)
    captura_registro.js      guarda os eventos do PDF (entra no pacote)
    captura_jspdf.js         substitui "jspdf" no pacote (entra no pacote)
    captura_autotable.js     substitui "jspdf-autotable" no pacote (entra no pacote)
    entrada_pdf.js           ponto de entrada do pacote (entra no pacote)
    carregar_pdf.js          empacota com esbuild, carrega, apaga o pacote
    leitura_pdf.js           achar seção e sequência nos eventos
```

Regras de nome, todas por causa do R-6: o `node --test` sem argumento só descobre `*.test.js`, `*-test.js`, `*_test.js`, `test-*.js`, `test.js` e pastas chamadas `test/`. Por isso a pasta se chama `testes/` (não `test/`), os seis grupos terminam em `.test.js` e **nenhum auxiliar** termina em `.test.js`, `-test.js` ou `_test.js` nem começa com `test-`. Cada arquivo de grupo importa `auxiliares/travas.js` **primeiro**.

Cada caso é **um** `test()` plano, com o ID no nome (exemplo de nome: `T-S03 — revestimento sozinho vale 4 pontos, MÉDIO, isAlto falso`). Sem `describe` e sem subtestes, para o resumo do Node mostrar exatamente `tests 111`. Por que plano: a contagem do resumo vira conferência direta do CA-01.

### 4.2 `package.json` e rede

Comando (única etapa que usa rede): `npm install --save-dev --save-exact esbuild@0.21.5`. Depois, o script `"test": "node --test"` é escrito à mão em `scripts`. Conferência obrigatória: `git diff package-lock.json` mostra só a linha do esbuild em `devDependencies` da raiz. Se o npm mexer em qualquer outra linha do lock, **parar**, registrar em Desvios e perguntar ao Everton (CA-13). O deploy faz `npm ci` e continua válido porque lock e `package.json` ficam coerentes.

### 4.3 Captura do PDF (o ponto mais delicado)

**Por quê:** o PDF é o documento que o cliente assina, então a função real roda inteira; só o último passo (gravar o arquivo) é trocado por um registro em memória. Trade-off: a suíte passa a depender do esbuild e do formato interno dos dois pacotes de PDF (R-3), em troca de testar o código verdadeiro. Esta mecânica foi medida em protótipo em 19/10/2026 (seção 8).

**Empacotamento.** `carregar_pdf.js` usa a **API de JavaScript do esbuild** (`import('esbuild')`, função `build`), e não o executável. Motivo: o caminho do repositório tem espaço (R-9) e a API recebe caminhos como dados, sem montar comando por concatenação. Opções fixas: ponto de entrada `testes/auxiliares/entrada_pdf.js`, `bundle` ligado, `platform` node, **`format` cjs** (em `esm` falha com "Dynamic require of fs", PRD seção 3), saída `.cjs` na pasta temporária, `logLevel` silencioso, `absWorkingDir` na raiz do repositório. O protótipo empacotou o `jspdf` **sem nenhum `external`**; mesmo assim, se o esbuild reclamar de módulo opcional ausente (canvg, html2canvas, dompurify), marcá-lo como `external` e registrar em Desvios.

**Armadilha de caminho (medida em 19/10/2026).** Todo cálculo de pasta ou arquivo a partir de `import.meta.url` **deve usar `fileURLToPath(import.meta.url)`** (de `node:url`). Usar `new URL(...).pathname` **quebra** neste ambiente: o `~` do `os.tmpdir()` curto virou `%7E` (`C:\Users\WINDOW%7E1\...`) e o esbuild falhou com "Could not resolve"; o espaço do caminho do repositório viraria `%20`. A regra vale para `travas.js` (inclusive o cálculo da raiz do repositório em `garantirForaDoRepo`), `carregar_pdf.js`, `relogio.js` e qualquer outro auxiliar. No sentido inverso, para **importar** um arquivo por caminho absoluto no Windows, converter com `pathToFileURL` (de `node:url`) antes do `import()`: `import 'C:/…'` dá `ERR_UNSUPPORTED_ESM_URL_SCHEME` (medido). Para carregar o `.cjs` gerado, `createRequire` aceita caminho de arquivo normal.

**Troca de "jspdf" e "jspdf-autotable".** Um plugin do esbuild com dois `onResolve` de correspondência exata (`^jspdf$` e `^jspdf-autotable$`) devolve o caminho absoluto de `captura_jspdf.js` e de `captura_autotable.js`. Por que plugin e não `alias`: caminho absoluto de Windows com espaço fica sem ambiguidade. Essa troca vale para todo o pacote, inclusive para o `require("jspdf")` interno do autotable.

**`captura_jspdf.js`** importa o `jspdf` real por caminho relativo ao arquivo real (`node_modules/jspdf/dist/jspdf.node.min.js`) e escolhe a classe como o `replay_jules/shim_jspdf.js` faz (`m.jsPDF`, senão `m.default.jsPDF`, senão `m`). Exporta, como `default` e como `jsPDF`, uma **função fabricante**. Quando o `pdf.js` faz `new jsPDF(...)`, o fabricante cria a instância **real** e a devolve com quatro métodos trocados **na própria instância** (estender a classe não serve, PRD seção 3):

| Método | O que o embrulho faz |
|---|---|
| `text` | chama o original e registra o primeiro argumento (ignorado se uma tabela estiver sendo desenhada) |
| `splitTextToSize` | chama o original, devolve o mesmo resultado e avisa o registro (ver "linhas quebradas") |
| `link` | chama o original e registra a URL de `opções.url` (registra também durante a tabela, porque os links dos eletros nascem no gancho `didDrawCell`) |
| `save` | **não** chama o original: só registra o nome do arquivo |

O fabricante copia a propriedade `API` da classe real para si, para o plugin do autotable (O-6) se aplicar sem erro (medido: não quebrou).

**`captura_autotable.js`** importa o arquivo real do autotable (`node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.js`) e escolhe a função como o `shim_autotable.js` faz (`m` se for função, senão `m.default`, senão `m.autoTable`). Exporta, como `default`, uma função que: (1) registra uma cópia por valor do cabeçalho (`head[0]`) e do corpo (`body`); (2) liga a marca "desenhando tabela"; (3) chama o autotable real; (4) desliga a marca num `finally`. Durante a marca, `text` e `splitTextToSize` não registram nada (o autotable chama os dois para escrever as células; medido: zero textos de célula vazaram para os eventos de texto).

**`captura_registro.js`** é o único lugar com estado e entra no pacote uma vez só (os dois embrulhos o importam). Guarda uma lista **ordenada** de eventos de quatro tipos: texto (valor), tabela (cabeçalho e corpo), link (URL) e save (nome). Exporta `iniciarCaptura` (zera) e `lerCaptura`, que devolve cópias: `eventos`, `textos` (só os valores dos eventos de texto, em ordem), `tabelas`, `links`, `saves`. A ordem mista de textos e tabelas é necessária para T-P19 a T-P26.

**Linhas quebradas (R-4).** O `pdf.js` e o `pdfVendedor.js` escrevem toda pergunta, resposta e CC assim: chamam `doc.splitTextToSize(texto, largura)` e depois `doc.text(linha)` para **cada** linha devolvida (`pdf.js:154-160, 193, 204, 208`; `pdfVendedor.js:91-97, 104, 108`). O registro faz o seguinte: quando `splitTextToSize` é chamado, guarda "texto original + lista de linhas devolvidas + quantas já chegaram". Quando `text` recebe uma linha igual à próxima esperada da lista, ela é absorvida; quando a última chega, **um único evento de texto com o texto original** é registrado. Qualquer outro `text` vira evento de texto simples. Por que usar o original e não juntar as linhas: o espaço que a quebra come no fim das linhas não precisa ser adivinhado. Se `lerCaptura` encontrar uma lista pela metade, **falha** com mensagem clara (nunca ignora). Assim "Resposta: Sim — 12 cm", a pergunta G1 e cada "CC: …" saem inteiros e o teste compara a frase, não o pedaço (medido: G1, `Resposta: Sim` e `CC: …` viraram um evento cada).

**`entrada_pdf.js`** reexporta `gerarPdf` (de `src/services/pdf.js`), `gerarPdfVendedor` (de `src/services/pdfVendedor.js`), `iniciarCaptura` e `lerCaptura`.

**`carregar_pdf.js`** exporta `carregarPdf()` (assíncrona). Passos: (1) tenta `import('esbuild')`; se falhar, lança erro **com a mensagem** "esbuild não encontrado: rode `npm ci` na raiz do projeto (o esbuild 0.21.5 está em devDependencies)"; (2) cria uma pasta com `mkdtemp` em `os.tmpdir()`; (3) chama a trava `garantirForaDoRepo` (seção 4.4) sobre essa pasta; (4) empacota; (5) carrega o `.cjs` com `createRequire`; (6) **apaga a pasta no `finally`**, logo depois de carregar (o pacote já está na memória, então nada fica no disco até o fim da suíte; resolve o R-12). Todos os caminhos vêm de `fileURLToPath` (armadilha acima). Devolve dois métodos, `cliente(estado, data)` e `projetista(estado, data)`, cada um: zera a captura, roda a função real dentro do relógio fixo (seção 4.5), lê a captura e **falha se `saves.length` não for 1** (regra 10 do PRD); devolve a captura. O estado é passado **como veio** (T-P21 precisa provar que a lista de eletros não foi reordenada).

**Falha alta.** Os arquivos P e V chamam `carregarPdf()` com **`await` no topo do módulo**. Se o esbuild faltar ou o empacotamento falhar, o arquivo não carrega e o Node o conta como falha com a mensagem acima, código de saída diferente de 0 (CA-06). Nunca pula.

**Quanto custa:** cada um dos dois arquivos de PDF empacota uma vez por execução (processos separados do `node --test`, pastas temporárias distintas). O esbuild é rápido; se passar de alguns segundos, registrar em Desvios sem mudar a abordagem.

### 4.4 Travas do ambiente (`travas.js`)

- **Rede:** substitui `globalThis.fetch` por uma função que lança erro "REDE PROIBIDA NA SUÍTE" e registra a chamada; exporta `assertSemRede()`, chamado no `after` de cada arquivo de grupo (falha se houve tentativa). Nada nos módulos testados chama `fetch` (só `src/services/cep.js:14`, que nenhum teste importa).
- **localStorage:** define `globalThis.localStorage` com acesso que lança erro "localStorage PROIBIDO NA SUÍTE". Nenhum módulo testado o toca (conferido por busca em `src/domain` e `src/services`).
- **Pasta de saída:** `garantirForaDoRepo(caminho)` resolve os dois lados com `realpath` (o `os.tmpdir()` do Windows pode vir em formato curto `WINDOW~1`) e **lança erro** se o caminho estiver dentro da raiz do repositório. A raiz é calculada com **`fileURLToPath(import.meta.url)`** do próprio `travas.js` (duas pastas acima); nunca com `new URL(...).pathname` (armadilha da seção 4.3: espaço vira `%20`, `~` vira `%7E`, e a comparação erraria).
- **Proibições de escrita:** `skip`, `todo` e `only` não aparecem; `--test-only` não é usado.

### 4.5 Relógio fixo (`relogio.js`)

**Escolha: `mock.timers` do `node:test`** (`enable` com `apis: ['Date']` e `now`), não substituição manual de `Date`. Por quê: é o mecanismo oficial, desfaz-se sozinho com `reset()` e não exige uma classe `Date` caseira que o `jspdf` (que também lê `new Date()` ao criar o documento) poderia estranhar. Trade-off: o suporte a `Date` no `mock.timers` foi medido no Node 24.15.0 (PRD seção 3 e protótipo de 19/10/2026) e, no Node 20, a documentação lista `Date` sem dizer desde qual versão. Isso não bloqueia: o deploy (Node 20) só roda `npm run build`, não a suíte (premissa 3 do PRD).

**Autoconferência por instante exato.** Depois de ligar o relógio, o `relogio.js` confere que `new Date().getTime() === data.getTime()` (meio-dia, 12:00:00.000), e não apenas o dia. Motivo: 19/10/2026 é a **data real de hoje**; conferir só o dia passaria mesmo com o mock desligado e não provaria nada. Se a igualdade falhar, lança erro com mensagem clara (nunca pula).

Exporta duas datas, montadas com **partes locais** antes de ligar o mock (por isso é meio-dia no fuso da máquina e o dia não vira): 19/10/2026 12:00 (`new Date(2026, 9, 19, 12, 0, 0)`) e 05/03/2026 12:00 (`new Date(2026, 2, 5, 12, 0, 0)`), e a função `comRelogio(data, função)`, que liga, executa e **sempre** desliga no `finally`. O `pdf.js:95-97` e o `pdfVendedor.js:52-54` usam `new Date()`, `toLocaleDateString('pt-BR')` e os getters locais, então o mesmo instante fixo alimenta capa e nome do arquivo.

### 4.6 Construtores de estado (`construtores.js`)

**Por quê:** `calcularScore` quebra se `global.g4_ambientes` não existir (`scoreEngine.js:51`, sem valor reserva), e a armadilha G4/G5 (seção 5) leva a erro de campo. Todo estado parte do `estadoInicial` completo, copiado por valor a cada chamada (nenhum teste muta um estado compartilhado).

Funções (sem código aqui, só o contrato):

| Função | Contrato |
|---|---|
| `ambienteCliente(tipo, indice, nome)` | devolve `{ instanceId: '<tipo>-<indice>', tipo, formType, label, nome }`. `formType` e `label` vêm de uma tabela **escrita por extenso dentro do construtor** (8 linhas, ver 4.6.1), nunca de `AMBIENTES_DISPONIVEIS` (regra 2 do PRD) |
| `montarEstadoCliente(lista, global, identificacao)` | `lista` = itens `{ tipo, indice = 0, nome = '', resp = {} }`. Devolve o estado: `estadoInicial` copiado; `ambientesSelecionados` montado; `respostasPorAmbiente[instanceId]` = cópia de `defaultsPorFormType[formType]` com `resp` por cima; `global` = `estadoInicial.global` com `global` por cima; `identificacao` = a fictícia padrão (4.6.2) com `identificacao` por cima |
| `eletro(tipo, campos)` | `{ tipo, subtipo: '', descricao: '', modelo: '', largura_cm: '', altura_cm: '', profundidade_cm: '', link: '' }` com `campos` por cima |
| `eletronico(tipo, campos)` | o mesmo molde, mais `polegadas: ''` |
| `ambienteProjetista(tipo, indice, nome)` | `{ instanceId: '<tipo>-<indice>', tipo, label, nome }` (mesma tabela de rótulos) |
| `montarEstadoProjetista(lista, contratos, nome)` | `lista` = itens `{ tipo, grupo, indice = 0, nome = '', resp = {} }`. Parte de `estadoInicialVendedor` (copiado); `respostasPorAmbiente` = cópia de `defaultsPorGrupo[grupo]` com `resp` por cima. O **grupo é passado explicitamente** pelo caso, para o construtor não depender de `obterGrupo` (que o T-V01/T-V02 testam). `contratos` padrão `['TA9001']`, `nome` padrão a fictícia |

Cada item sem `resp` usa só os defaults (tudo `null`, listas vazias, texto vazio): nenhum gatilho.

#### 4.6.1 Tabela de rótulos (escrita por extenso no construtor)

| tipo | label | formType |
|---|---|---|
| cozinha | Cozinha / Área de Serviço | cozinha |
| dormitorio_casal | Dormitório Casal | dormitorio |
| dormitorio_solteiro | Dormitório Solteiro | dormitorio |
| banheiro | Banheiro / W.C. | banheiro |
| home | Home / Sala | home |
| office | Office | home |
| varanda | Varanda / Área Gourmet | cozinha |
| outros | Outros | outros |

#### 4.6.2 Identificação fictícia padrão

nome `CLIENTE FICTICIO TESTE`; contrato `TA9001`; cep `''`; logradouro `Rua Ficticia`; numero `100`; complemento `''`; bairro `Bairro Ficticio`; cidade `Cidade Ficticia`; uf `SP`; telefone `''`. No T-P03 entram CEP `01001-000` (público, não é dado pessoal), complemento `Fundos` e telefone `(00) 90000-9001`. Projetista: contratos `['TA9001']`, nome `CLIENTE FICTICIO TESTE`. Links sempre em `https://<algo>.exemplo.invalid/...`. Contratos só `TA9xxx` ou `SM9xxx`.

### 4.7 Leitura dos eventos (`leitura_pdf.js`)

Funções de apoio, para cada caso de PDF ler como uma pessoa leria:

- **Seção do ambiente:** devolve a fatia dos eventos que começa no texto do **nome do ambiente** (ex.: `Cozinha / Área de Serviço`) e vai até o nome do próximo ambiente (ou o fim). O nome só existe como evento de texto na parte "Checklist Completa"; no Resumo Executivo ele vai dentro de uma tabela, que não gera texto.
- **Sequência contígua:** procura, nos eventos, uma subsequência **contígua** que case com um padrão e **falha mostrando o padrão e o trecho encontrado** se não achar. Cada elemento do padrão é: um texto exato; `começa com` um trecho; `contém` um trecho; ou uma tabela (cabeçalho e, quando dado, corpo exatos). Contígua porque o PRD exige "CC logo abaixo da pergunta".
- **Ausência:** afirma que nenhum texto de uma lista satisfaz uma condição (começa com, é igual a, contém).
- **Texto seguinte:** devolve o evento logo após uma sequência (usado para provar "sem linha de CC").

### 4.8 Os 13 textos de CC (`textos_cc.js`)

Transcritos **uma única vez** do código de `1a6022d`, copiando caractere por caractere (acentos, "É", "Ç", "Ô", barras e parênteses). Só `C_ccs.test.js` importa este arquivo (CA-08 vigia o resto). Nome das constantes: `CC_*` e `AV_*` — **nunca** `TEXTO_*` (a regra 2 e o CA-08 proíbem esse prefixo nos testes).

| Chave | Origem no código | Texto completo |
|---|---|---|
| `CC_ILUMINACAO` | `ccBuilder.js:43-44` | CLIENTE CIENTE E DE ACORDO QUE FIAÇÃO ELÉTRICA, INSTALAÇÃO DE ILUMINAÇÕES E SERVIÇOS DE ELETRICISTA É POR SUA RESPONSABILIDADE, PROFISSIONAL DEVE ESTAR LOCAL NO DIA DA MONTAGEM. |
| `CC_REBOCO` | `ccBuilder.js:55-56` | CLIENTE CIENTE E DE ACORDO QUE MEDIÇÃO TÉCNICA DE AMBIENTE FOI REALIZADA COM AMBIENTE EM REFORMA INACABADA E QUE DEVERÁ RESPEITAR A ALÍNEA (I) DA CLÁUSULA TERCEIRA DO CONTRATO DE COMPRA E VENDA. |
| `CC_REVESTIMENTO` | `checklistTextos.js:25-26` | CLIENTE CIENTE E DE ACORDO QUE A MEDIÇÃO TÉCNICA FOI REALIZADA SEM O REVESTIMENTO FINAL DAS PAREDES, E QUE A FINALIZAÇÃO DA OBRA APÓS A ELABORAÇÃO DO PROJETO PODERÁ GERAR INTERFERÊNCIAS E NECESSIDADE DE AJUSTES NA MONTAGEM. |
| `CC_PONTOS` | `ccBuilder.js:78-79` | CLIENTE CIENTE E DE ACORDO QUE DEVERÁ ALTERAR E/OU PROVIDENCIAR PONTOS ELÉTRICOS/HIDRÁULICOS/GÁS ATÉ O DIA DA MONTAGEM, PARA CORRETA ADEQUAÇÃO DO PROJETO. |
| `CC_REBAIXO` (modelo, `{cm}` troca a medida) | `ccBuilder.js:92` | CLIENTE CIENTE E DE ACORDO QUE DEVERÁ FINALIZAR O REBAIXO DE TETO EM {cm}CM ATÉ O DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO. |
| `CC_GRANITO` | `checklistTextos.js:1-2` | CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR GRANITO EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO. |
| `CC_TANQUE` | `checklistTextos.js:4-5` | CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR TANQUE EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO. |
| `CC_TV` | `checklistTextos.js:13-14` | CLIENTE CIENTE E DE ACORDO QUE DEVERÁ DESLOCAR OS PONTOS ELÉTRICOS PARA DENTRO DA POSIÇÃO DO PAINEL DE TV ATÉ O DIA DA MONTAGEM PARA OCULTAÇÃO ADEQUADA DA FIAÇÃO. |
| `CC_ELETROS` | `checklistTextos.js:7-8` | CLIENTE CIENTE E DE ACORDO QUE OS ELETRODOMÉSTICOS NÃO FORAM DEFINIDOS NO PROJETO E DEVERÃO SER ADQUIRIDOS DE ACORDO COM OS VÃOS PREVISTOS. |
| `CC_ELETRONICOS` | `checklistTextos.js:10-11` | CLIENTE CIENTE E DE ACORDO QUE OS ELETRÔNICOS NÃO FORAM DEFINIDOS NO PROJETO E DEVERÃO SER ADQUIRIDOS DE ACORDO COM OS VÃOS PREVISTOS. |
| `CC_RODAPE_AUSENTE` | `checklistTextos.js:19-20` | CLIENTE CIENTE E DE ACORDO QUE DEVERÁ INSTALAR RODAPÉ NA REGIÃO DOS MÓVEIS SOMENTE APÓS A FINALIZAÇÃO DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO. |
| `AV_RODAPE_EXISTENTE` (aviso) | `checklistTextos.js:22-23` | ROUPEIROS SERÃO INSTALADOS À FRENTE DO RODAPÉ EXISTENTE, COM ACABAMENTO EM MEIA-CANA NA PARTE DE TRÁS. |
| `AV_CORTINEIRO` (aviso) | `checklistTextos.js:16-17` | AVISO: SERÁ CONSIDERADO VÃO DE APROXIMADAMENTE 150MM PARA CORTINEIRO NÃO INSTALADO. |

Quatro dos textos (`CC_ILUMINACAO`, `CC_REBOCO`, `CC_PONTOS`, `CC_REBAIXO`) estão escritos direto no `ccBuilder.js`; os outros nove, em `checklistTextos.js`. Mudar a redação de qualquer um exige atualizar o teste com registro neste Spec do card que mudou (regra 3 do PRD). A **conferência mecânica** da transcrição é a Task 8 (fora da suíte).

## 5. Armadilhas de nome (para quem monta entrada)

| Pergunta | Campo do estado | Observação |
|---|---|---|
| G1 | `global.g1_ambientes` (lista de `instanceId`) e `g1_temIluminacaoExterna` | `scoreEngine.js:11, 25` |
| G2 | `global.g2_ambientesSemReboco` e `g2_temReboco` | `scoreEngine.js:12, 31` |
| G3 | `global.g3_ambientesSemRevestimento` e `g3_temRevestimento` | `scoreEngine.js:13, 37` |
| **G4** (pontos indefinidos) | `global.g3_ambientesPendentes` e `g3_pontosNaPosicaoFinal` | **nome com "g3"**; `scoreEngine.js:14, 43`; `schema.js:110-111` |
| **G5** (rebaixo) | `global.g4_temRebaixo` e `global.g4_ambientes` = lista de objetos `{ instanceId, cm }` | **nome com "g4"**; `scoreEngine.js:49-51`; `schema.js:112-113`. `g4_rebaixoOpcao` é só visual (`schema.js:114-117`) |
| Cortineiro instalado | `cortieneiroInstalado` | **grafia do código, com "ie" trocado**; `scoreEngine.js:120`; `schema.js:26` |
| TV do Dormitório | `tv`, `tvPontoFinal`, `tv_polegadas`, `tv_modelo`, `tv_largura_cm`, `tv_altura_cm`, `tv_profundidade_cm`, `tv_link` | `schema.js:17-24` |
| TV de Home/Outros | um item `tipo: 'TV'` em `eletronicosList` + `tvPontoFinal` (o campo `tv` fica `null`) | `scoreEngine.js:85-92` |
| Tamanho da cama | `tamanhoCama` (`solteiro`/`padrao`/`queen`/`king`/`outro`), `camaLargura_cm`, `camaComprimento_cm` | `schema.js:14-16` |

## 6. Convenções do mapa caso a caso (seção 7)

- Ambientes: `cozinha-0`, `dormitorio_casal-0`, `dormitorio_casal-1`, `banheiro-0`, `home-0`, `outros-0`. Em todo caso, ambiente sem `R{…}` usa só os defaults.
- `R{campo: valor}` = `resp` do ambiente. `G{campo: valor}` = `global`. Listas G1 a G4 contêm `instanceId`. Lista G5 contém `{instanceId, cm}`.
- Ambiente (S/C) = `scorePorAmbiente[instanceId]`, comparado inteiro: `{ pontos, isAlto, classificacao, gatilhos }` (lista de ids **na ordem do código**: G1, G2, G3, G4, rebaixo, granito, tanque, TV, eletros, eletrônicos, rodapé, cortineiro). Global = `scoreGlobal`: `{ pontos, isAlto, classificacao }`.
- Ids de gatilho: `ILUMINACAO_EXTERNA_`, `REFORM_SEM_REBOCO_`, `REFORM_SEM_REVESTIMENTO_`, `PONTOS_INDEFINIDOS_`, `REBAIXO_`, `GRANITO_RETIRAR_`, `TANQUE_RETIRAR_`, `TV_PONTO_`, `ELETROS_NAODEF_`, `ELETRONICOS_NAODEF_`, `RODAPE_AUSENTE_`, `CORTINEIRO_NAOINSTALADO_`, mais o `instanceId`. Escritos por extenso nos testes.
- Nível com acento: `'MÉDIO'`.
- `TV55` = `eletronico('TV', {polegadas:'55', largura_cm:'120', altura_cm:'70', profundidade_cm:'8'})`.
- `medidas` (eletro ou eletrônico "com medidas preenchidas") = largura `'60'`, altura `'10'`, profundidade `'50'`, para o único erro possível ser o que o caso mira.
- Perguntas do PDF (literais, escritos por extenso nos testes): **G1** `G1 — O projeto terá alguma iluminação embutida na marcenaria adquirida externamente à By Arabi? (fitas de LED, spots, etc.)`; **G2** `G2 — Todos os ambientes já possuem reboco (argamassa) finalizado nas paredes?`; **G3** `G3 — Todos os ambientes já possuem revestimento final (azulejo, porcelanato etc.) aplicado nas paredes?`; **G4** `G4 — Os pontos elétricos/hidráulicos/gás já estão nas posições finais em todos os ambientes?`; **G5** `G5 — Algum ambiente terá rebaixo de teto?` (`pdf.js:294-300`). Demais: `Existe granito ou pia existente no local?` · `Os móveis serão adaptados?` · `Existe tanque no local?` · `Qual o tipo de tanque?` · `Haverá móveis na região do tanque?` · `Terá TV neste ambiente?` · `O ponto elétrico da TV já está na posição final?` · `Qual o tamanho da cama neste ambiente?` · `Haverá cortineiro neste ambiente?` · `O cortineiro já está instalado?` · `Existe rodapé na região dos móveis?` · `Já possui ou tem intenção de compra específica dos eletrodomésticos?` · `Possui ou pretende adquirir eletrônicos para este ambiente?` · `Tipo de cuba` · `Observações` (`pdf.js:371-568`).
- `Resposta: x` é o texto da resposta; nas tabelas abaixo aparece como `Resposta: x`.
- **Trechos de identificação dos CCs no PDF** (grupo P; o texto completo só é conferido no grupo C, regra 3 do PRD). Cada trecho é o **começo** do texto já com o prefixo `CC: ` (o PDF escreve `CC: <texto>` para tipo CC, `pdf.js:188`); avisos não têm prefixo.
  - `T-ilum` = `CC: CLIENTE CIENTE E DE ACORDO QUE FIAÇÃO ELÉTRICA, INSTALAÇÃO DE ILUMINAÇÕES`
  - `T-reboco` = `CC: CLIENTE CIENTE E DE ACORDO QUE MEDIÇÃO TÉCNICA DE AMBIENTE FOI REALIZADA COM AMBIENTE EM REFORMA INACABADA`
  - `T-revest` = `CC: CLIENTE CIENTE E DE ACORDO QUE A MEDIÇÃO TÉCNICA FOI REALIZADA SEM O REVESTIMENTO FINAL DAS PAREDES`
  - `T-pontos` = `CC: CLIENTE CIENTE E DE ACORDO QUE DEVERÁ ALTERAR E/OU PROVIDENCIAR PONTOS`
  - `T-rebaixo(N)` = começa com `CC: ` e contém `REBAIXO DE TETO EM NCM`
  - `T-granito` = `CC: CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR GRANITO EXISTENTE`
  - `T-tanque` = `CC: CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR TANQUE EXISTENTE`
  - `T-tv` = `CC: CLIENTE CIENTE E DE ACORDO QUE DEVERÁ DESLOCAR OS PONTOS ELÉTRICOS PARA DENTRO DA POSIÇÃO DO PAINEL DE TV`
  - `T-eletros` = `CC: CLIENTE CIENTE E DE ACORDO QUE OS ELETRODOMÉSTICOS NÃO FORAM DEFINIDOS`
  - `T-eletronicos` = `CC: CLIENTE CIENTE E DE ACORDO QUE OS ELETRÔNICOS NÃO FORAM DEFINIDOS`
  - `T-rodape` = `CC: CLIENTE CIENTE E DE ACORDO QUE DEVERÁ INSTALAR RODAPÉ NA REGIÃO DOS MÓVEIS`
  - `A-rodape` (aviso) = `ROUPEIROS SERÃO INSTALADOS À FRENTE DO RODAPÉ EXISTENTE`
  - `A-cort` (aviso) = `AVISO: SERÁ CONSIDERADO VÃO DE APROXIMADAMENTE 150MM`
- Cabeçalhos de tabela: resumo `['Ambiente','Ações e pontos de atenção','Risco']` (`pdf.js:266`); eletros e eletrônicos `['Tipo','Modelo','Largura (cm)','Altura (cm)','Prof. (cm)','Link']` (`pdf.js:482, 538`).
- Cada caso de PDF, além do que está na tabela, passa pelo `carregar_pdf.js`, que já garante **exatamente um `save`** e nenhuma exceção. O nome do arquivo só aparece na coluna "Esperado" onde é o objeto do caso.

## 7. Mapa caso a caso (111 casos)

Nenhum caso do PRD foi retirado. A coluna "Confirmação" (grupo S) diz se o valor foi **medido** no protótipo de 19/10/2026 (seção 8) ou vem só de **leitura** do código.

### 7.1 Arquivo `testes/S_score.test.js` — 29 casos (`calcularScore`)

Cada caso monta o estado com `montarEstadoCliente` e chama `calcularScore`. A coluna Esperado traz o que o teste afirma por extenso.

| Caso | Entrada | Esperado | Confirmação |
|---|---|---|---|
| T-S01 | `cozinha-0`; G{`g1_temIluminacaoExterna`: true, `g1_ambientes`: ['cozinha-0']} | cozinha-0 = `{2, false, 'BAIXO', ['ILUMINACAO_EXTERNA_cozinha-0']}`; global `{2, false, 'BAIXO'}`; `gatilhosAtivados` = ['ILUMINACAO_EXTERNA_cozinha-0'] | leitura (`scoreEngine.js:25-28, 164-168`) |
| T-S02 | `cozinha-0`; G{`g2_ambientesSemReboco`: ['cozinha-0']} | cozinha-0 = `{0, true, 'ALTO', ['REFORM_SEM_REBOCO_cozinha-0']}` | leitura (`:31-34`) |
| T-S03 | `cozinha-0`; G{`g3_ambientesSemRevestimento`: ['cozinha-0']} | cozinha-0 = `{4, false, 'MÉDIO', ['REFORM_SEM_REVESTIMENTO_cozinha-0']}` (intencional, decisão 3) | PRD diz medido |
| T-S04 | `cozinha-0`; G{`g2_ambientesSemReboco`: ['cozinha-0'], `g3_ambientesSemRevestimento`: ['cozinha-0']} | cozinha-0 = `{0, true, 'ALTO', ['REFORM_SEM_REBOCO_cozinha-0']}`; nenhum id `REFORM_SEM_REVESTIMENTO_` em `gatilhosAtivados` | leitura (`:37`) |
| T-S05 | `cozinha-0`, `dormitorio_casal-0`; G{G2: ['cozinha-0'], G3: ['cozinha-0','dormitorio_casal-0']} (O-3) | cozinha-0 como T-S04; dormitorio_casal-0 = `{4, false, 'MÉDIO', ['REFORM_SEM_REVESTIMENTO_dormitorio_casal-0']}` | leitura |
| T-S06 | `dormitorio_casal-0`; G{`g3_ambientesPendentes`: ['dormitorio_casal-0']} | `{2, false, 'BAIXO', ['PONTOS_INDEFINIDOS_dormitorio_casal-0']}` | leitura (`:43-46`) |
| T-S07 | `cozinha-0`, `banheiro-0`; G{`g4_temRebaixo`: true, `g4_ambientes`: [{instanceId:'cozinha-0', cm:'12'}]} | cozinha-0 `{1, false, 'BAIXO', ['REBAIXO_cozinha-0']}`; banheiro-0 `{0, false, 'BAIXO', []}` | leitura (`:49-55`) |
| T-S08 | `cozinha-0`; G{`g4_temRebaixo`: false, `g4_ambientes`: [{instanceId:'cozinha-0', cm:'12'}]} | cozinha-0 `{0, false, 'BAIXO', []}`; `gatilhosAtivados` = [] | leitura |
| T-S09 | três cálculos no mesmo teste, um por ambiente: `cozinha-0`, `banheiro-0`, `outros-0`; R{`granito`: true, `granitoadaptar`: false} | cada um `{2, false, 'BAIXO', ['GRANITO_RETIRAR_<id>']}` | leitura (`:58-63`) |
| T-S10 | os mesmos três; R{`granito`: true, `granitoadaptar`: true} | cada um `{0, false, 'BAIXO', []}` | leitura |
| T-S11 | `cozinha-0` e `outros-0` (dois cálculos); R{`tanque`: true, `tanqueEmbutido`: false, `tanqueMoveis`: true} | cada um `{2, false, 'BAIXO', ['TANQUE_RETIRAR_<id>']}` | leitura (`:66-70`) |
| T-S12 | `cozinha-0`; R{`tanque`: true, `tanqueEmbutido`: true, `tanqueMoveis`: true} | `{0, false, 'BAIXO', []}` (H-07) | leitura |
| T-S13 | `dormitorio_casal-0`; R{`tv`: true, `tvPontoFinal`: false}; segundo cálculo com `tvPontoFinal`: true | primeiro `{2, false, 'BAIXO', ['TV_PONTO_dormitorio_casal-0']}`; segundo `{0, false, 'BAIXO', []}` | leitura (`:77-83`) |
| T-S14 | `home-0`; R{`eletronicos`: true, `eletronicosList`: [TV55], `tvPontoFinal`: false, `tv`: null}; segundo cálculo com `tvPontoFinal`: true | primeiro `{2, false, 'BAIXO', ['TV_PONTO_home-0']}`; segundo `{0, false, 'BAIXO', []}` (H-03) | leitura (`:85-92`) |
| T-S15 | `outros-0`; mesma entrada do T-S14 | `{2, false, 'BAIXO', ['TV_PONTO_outros-0']}` (H-04) | leitura |
| T-S16 | `dormitorio_casal-0` e `dormitorio_casal-1`, ambos R{`tv`: true, `tvPontoFinal`: false}; G{`g3_ambientesPendentes`: ['dormitorio_casal-0']} | -0 `{2, false, 'BAIXO', ['PONTOS_INDEFINIDOS_dormitorio_casal-0','TV_PONTO_dormitorio_casal-0']}` (TV existe e vale 0); -1 `{2, false, 'BAIXO', ['TV_PONTO_dormitorio_casal-1']}` (H-08) | PRD diz medido (2 e 2) |
| T-S17 | `cozinha-0`; R{`eletrosDefined`: false} | `{1, false, 'BAIXO', ['ELETROS_NAODEF_cozinha-0']}` | leitura (`:95-100`) |
| T-S18 | `home-0`; R{`eletronicos`: false, `eletronicosList`: []} | `{1, false, 'BAIXO', ['ELETRONICOS_NAODEF_home-0']}` | leitura (`:103-108`) |
| T-S19 | `outros-0`; R{`eletrosDefined`: false, `eletronicos`: false} | `{0, false, 'BAIXO', []}` (H-05) | leitura |
| T-S20 | `dormitorio_casal-0`, `home-0`, `outros-0`; R{`rodape`: false} em cada | cada um `{1, false, 'BAIXO', ['RODAPE_AUSENTE_<id>']}` | leitura (`:111-116`) |
| T-S21 | os mesmos três; R{`rodape`: true} | cada um `{0, false, 'BAIXO', []}` (H-06) | leitura |
| T-S22 | os mesmos três; R{`cortineiro`: true, `cortieneiroInstalado`: false}; segundo cálculo com `cortieneiroInstalado`: true | primeiro: cada um `{1, false, 'BAIXO', ['CORTINEIRO_NAOINSTALADO_<id>']}`; segundo: cada um `{0, false, 'BAIXO', []}` | leitura (`:119-124`) |
| T-S23 | (a) `outros-0`; G{G1: ['outros-0']}; R{`rodape`: false}. (b) `cozinha-0`; G{G3: ['cozinha-0']} | (a) `{3, false, 'BAIXO', ['ILUMINACAO_EXTERNA_outros-0','RODAPE_AUSENTE_outros-0']}`; (b) `{4, false, 'MÉDIO', ['REFORM_SEM_REVESTIMENTO_cozinha-0']}` | **medido** (a: BAIXO 3; b: MÉDIO 4) |
| T-S24 | `outros-0`; G{G1: ['outros-0'], `g3_ambientesPendentes`: ['outros-0']}; base R{`granito`: true, `granitoadaptar`: false}. (a) base + `rodape`: false. (b) base + `rodape`: false + `tanque`: true, `tanqueEmbutido`: false, `tanqueMoveis`: true. (c) base + o mesmo tanque, com `rodape` **nulo** | (a) `{7, false, 'MÉDIO', ['ILUMINACAO_EXTERNA_outros-0','PONTOS_INDEFINIDOS_outros-0','GRANITO_RETIRAR_outros-0','RODAPE_AUSENTE_outros-0']}`; (b) `{9, false, 'ALTO', [os de (a) com 'TANQUE_RETIRAR_outros-0' antes do rodapé]}`; (c) `{8, false, 'ALTO', ['ILUMINACAO_EXTERNA_outros-0','PONTOS_INDEFINIDOS_outros-0','GRANITO_RETIRAR_outros-0','TANQUE_RETIRAR_outros-0']}` com `isAlto` **falso** (ALTO por pontos, `scoreEngine.js:165`) | **medido** (a MÉDIO 7; b ALTO 9; c ALTO 8, `isAlto` falso) |
| T-S25 | `outros-0` (as entradas do T-S24a, 7 pts) e `cozinha-0` com G2: ['cozinha-0'] | outros-0 `{7, false, 'MÉDIO'}`; cozinha-0 `{0, true, 'ALTO'}`; global `{pontos: 0, classificação: 'ALTO'}` | leitura (`:145-148`) |
| T-S26 | `outros-0` (entradas do T-S24b, 9 pts) e `home-0` com R{`eletronicos`: false, `eletronicosList`: [], `rodape`: false, `cortineiro`: true, `cortieneiroInstalado`: false}; G{G1: ['outros-0','home-0'], `g3_ambientesPendentes`: ['outros-0']} | outros-0 `{9, false, 'ALTO'}`; home-0 `{5, false, 'MÉDIO', ['ILUMINACAO_EXTERNA_home-0','ELETRONICOS_NAODEF_home-0','RODAPE_AUSENTE_home-0','CORTINEIRO_NAOINSTALADO_home-0']}` (2+1+1+1); global `{pontos: 9, classificação: 'ALTO'}` (H-01) | PRD diz medido (ALTO 9 e MÉDIO 5) |
| T-S27 | `cozinha-0` com G3: ['cozinha-0']; `outros-0` com G{G1: ['outros-0'], `g3_ambientesPendentes`: ['outros-0']}, R{`rodape`: false, `cortineiro`: true, `cortieneiroInstalado`: false} | cozinha-0 `{4, false, 'MÉDIO'}`; outros-0 `{6, false, 'MÉDIO', ['ILUMINACAO_EXTERNA_outros-0','PONTOS_INDEFINIDOS_outros-0','RODAPE_AUSENTE_outros-0','CORTINEIRO_NAOINSTALADO_outros-0']}` (2+2+1+1); global `{pontos: 6, classificação: 'MÉDIO'}` | **medido** (cozinha MÉDIO 4, outros MÉDIO 6, global MÉDIO 6) |
| T-S28 | `cozinha-0` com R{`eletrosDefined`: false} (1 pt); `outros-0` com G{G1: ['outros-0']}, R{`rodape`: false} (3 pts) | global `{pontos: 3, classificação: 'BAIXO'}` | **medido** (global BAIXO 3) |
| T-S29 | lista de ambientes vazia | `scoreGlobal` = `{0, false, 'BAIXO'}`; `scorePorAmbiente` = `{}`; `gatilhosAtivados` = `[]` | leitura (`:142-143`) |

### 7.2 Arquivo `testes/C_ccs.test.js` — 16 casos (`construirCCs`)

Cada caso chama `calcularScore(estado)` e passa `gatilhosAtivados` ao `construirCCs` (igual ao `pdf.js:93-94`). Em todos: afirma `tipo`, `nivel`, `escopo` = `instanceId`, `perguntaOrigem` **só** quando for G1 a G5, e o **texto completo** (seção 4.8). O CC é localizado pelo `id` (`<gatilho>_<instanceId>`).

| Caso | Entrada | Esperado |
|---|---|---|
| T-C01 | `cozinha-0`; G{G1: ['cozinha-0']} | um CC: tipo CC, nível `'MÉDIO'`, origem G1, texto `CC_ILUMINACAO` |
| T-C02 | `cozinha-0`; G{G2: ['cozinha-0']} | um CC: nível `'ALTO'`, origem G2, texto `CC_REBOCO` |
| T-C03 | `cozinha-0`; G{G3: ['cozinha-0']} | um CC: nível **`'ALTO'`** (o ambiente é MÉDIO), origem G3, texto `CC_REVESTIMENTO` |
| T-C04 | `cozinha-0`, `dormitorio_casal-0`; G{G2: ['cozinha-0'], G3: ['cozinha-0','dormitorio_casal-0']} | cozinha-0: só o CC de reboco (`CC_REBOCO`), nenhum de revestimento; dormitorio_casal-0: um CC de revestimento com `CC_REVESTIMENTO` (e não o do reboco) |
| T-C05 | `dormitorio_casal-0`; G{`g3_ambientesPendentes`: ['dormitorio_casal-0']} | um CC: nível `'MÉDIO'`, origem G4, texto `CC_PONTOS` |
| T-C06 | `cozinha-0`; G{`g4_temRebaixo`: true, `g4_ambientes`: [{instanceId:'cozinha-0', cm:'12'}]} | um CC: nível `'BAIXO'`, origem G5, texto `CC_REBAIXO` com `12` |
| T-C07 | `cozinha-0`; R{`granito`: true, `granitoadaptar`: false}; depois com `granitoadaptar`: true | primeiro: um CC nível `'MÉDIO'`, texto `CC_GRANITO`; segundo: lista vazia |
| T-C08 | (a) `cozinha-0`; R{`tanque`: true, `tanqueEmbutido`: false, `tanqueMoveis`: true}. (b) `cozinha-0`; R{`tanque`: true, `tanqueEmbutido`: true, `tanqueMoveis`: true} | (a) um CC nível `'MÉDIO'`, texto `CC_TANQUE`; (b) lista vazia |
| T-C09 | (a) `dormitorio_casal-0` R{`tv`: true, `tvPontoFinal`: false}; `home-0` e `outros-0` R{`eletronicos`: true, `eletronicosList`: [TV55], `tvPontoFinal`: false}. (b) só o dormitório, com G{`g3_ambientesPendentes`: ['dormitorio_casal-0']} | (a) cada um tem um CC `TV_PONTO_<id>`, nível `'MÉDIO'`, texto `CC_TV`; (b) o CC `TV_PONTO_dormitorio_casal-0` **continua existindo** (com `CC_TV`) ao lado do CC de pontos indefinidos |
| T-C10 | `cozinha-0`; R{`eletrosDefined`: false} | um CC: nível `'BAIXO'`, texto `CC_ELETROS` |
| T-C11 | `home-0`; R{`eletronicos`: false} | um CC: nível `'BAIXO'`, texto `CC_ELETRONICOS` |
| T-C12 | `home-0`; R{`rodape`: false} | um CC: nível `'BAIXO'`, texto `CC_RODAPE_AUSENTE` |
| T-C13 | `dormitorio_casal-0`, `home-0`, `outros-0`; R{`rodape`: true} em cada | só dormitorio_casal-0 recebe um **AVISO** (tipo `'AVISO'`, nível **nulo**, texto `AV_RODAPE_EXISTENTE`); home-0 e outros-0: nenhum CC |
| T-C14 | `dormitorio_casal-0`; R{`cortineiro`: true, `cortieneiroInstalado`: false} | um **AVISO**: tipo `'AVISO'`, nível `'BAIXO'`, texto `AV_CORTINEIRO` (contém `APROXIMADAMENTE 150MM`) |
| T-C15 | `cozinha-0`, `dormitorio_casal-0`; G{G1: ['cozinha-0']}; R cozinha {`eletrosDefined`: false}; R dormitório {`rodape`: false} | todos os CCs têm `escopo` igual ao `instanceId` do seu ambiente; nenhum com escopo `'Global'`; o dormitório **não** recebe o CC de G1; cozinha tem 2 (iluminação e eletros), dormitório tem 1 (rodapé ausente) |
| T-C16 | `cozinha-0` e `dormitorio_casal-0` só com defaults | lista vazia |

### 7.3 Arquivo `testes/A_ambientes.test.js` — 3 casos

| Caso | Entrada | Esperado |
|---|---|---|
| T-A01 | `formatarNomeAmbiente({label:'Dormitório Casal', nome:' Suíte '})` | `'Dormitório Casal — Suíte'` (`ambientes.js:16-21`) |
| T-A02 | mesmo rótulo com `nome: ''` e com `nome: '   '` | `'Dormitório Casal'` nos dois |
| T-A03 | `AMBIENTES_DISPONIVEIS` (**única** importação de constante permitida, regra 2) | 8 itens; comparados em ordem alfabética de `id`, com lista por extenso (id · rótulo · formType): banheiro · Banheiro / W.C. · banheiro; cozinha · Cozinha / Área de Serviço · cozinha; dormitorio_casal · Dormitório Casal · dormitorio; dormitorio_solteiro · Dormitório Solteiro · dormitorio; home · Home / Sala · home; office · Office · home; outros · Outros · outros; varanda · Varanda / Área Gourmet · cozinha. (A ordem da tela não é travada: reordenar o catálogo não é bug.) |

### 7.4 Arquivo `testes/F_validacao.test.js` — 16 casos (`validarFormularioAmbiente`, `limitarCm`)

Chaves de erro conferidas pelo conjunto **exato** nos F01 a F05 (ordenadas); nos demais, só as chaves citadas (e, quando dito, a **ausência** de outras). Resposta base = `defaultsPorFormType[formType]` copiado, com os campos do caso por cima.

| Caso | Entrada | Esperado |
|---|---|---|
| T-F01 | `cozinha`, só defaults | chaves exatamente `eletrosDefined`, `granito`, `tanque`; todas `'Selecione uma opção'` |
| T-F02 | `dormitorio`, defaults | chaves exatamente `cortineiro`, `rodape`, `tamanhoCama`, `tv`; `tamanhoCama` = `'Selecione o tamanho da cama'`, as outras `'Selecione uma opção'` |
| T-F03 | `home`, defaults | chaves exatamente `cortineiro`, `eletronicos`, `rodape` (`'Selecione uma opção'`) |
| T-F04 | `banheiro`, defaults | chaves exatamente `cuba`, `granito`; `cuba` = `'Selecione o tipo de cuba'`, `granito` = `'Selecione uma opção'` |
| T-F05 | `outros`, defaults | chaves exatamente `cortineiro`, `eletrosDefined`, `eletronicos`, `granito`, `rodape`, `tanque` |
| T-F06 | `cozinha` {`granito`: false, `tanque`: false, `eletrosDefined`: false}; `dormitorio` {`tv`: false, `cortineiro`: false, `rodape`: false, `tamanhoCama`: 'padrao'} | objeto de erros **vazio** nos dois |
| T-F07 | `cozinha` {`granito`: false, `eletrosDefined`: false, `tanque`: true} com (a) `tanqueEmbutido`: null; (b) `tanqueEmbutido`: false, `tanqueMoveis`: null; (c) `tanqueEmbutido`: true, `tanqueMoveis`: null | (a) erro em `tanqueEmbutido`; (b) erro em `tanqueMoveis`; (c) nenhum erro e a chave `tanqueMoveis` ausente |
| T-F08 | `cozinha` {`eletrosDefined`: true, `eletros`: []}; `home` {`eletronicos`: true, `eletronicosList`: []} | `eletros` = `'Adicione ao menos um eletro'`; `eletronicosList` = `'Adicione ao menos um eletrônico'` |
| T-F09 | `cozinha` {`eletrosDefined`: true, `eletros`: [eletro('Cooktop'), eletro('Cooktop', {largura_cm:'60', altura_cm:'10', profundidade_cm:'50'})]}; `home` {`eletronicos`: true, `eletronicosList`: [eletronico('Home Theater')]} | `eletro_0_largura`, `eletro_0_altura`, `eletro_0_prof` = `'Obrigatório'`; nenhuma chave `eletro_1_*`; `eletronico_0_largura`, `eletronico_0_altura`, `eletronico_0_prof` = `'Obrigatório'` |
| T-F10 | `cozinha` {`eletrosDefined`: true, eletros: [eletro('Depurador', {subtipo:'Embutido', medidas})]}; segundo cálculo com `subtipo`: 'Normal' | Embutido: `eletro_0_modelo` e `eletro_0_link` = `'Obrigatório para Depurador Embutido'`; Normal: nenhuma das duas chaves |
| T-F11 | **três cálculos separados**, cada um com uma `cozinha` {`eletrosDefined`: true} de **um único eletro, no índice 0** (medidas preenchidas): (a) Fogão sem subtipo; (b) Cooktop sem subtipo; (c) Refrigerador com `subtipo`: '   ' | (a) `eletro_0_subtipo` = `'Obrigatório'`; (b) sem a chave `eletro_0_subtipo`; (c) `eletro_0_subtipo` = `'Obrigatório'` |
| T-F12 | `cozinha` com eletro('Outros', medidas) sem `descricao`; depois com `descricao`: 'Adega' | `eletro_0_descricao` = `'Descreva qual eletro é'`; depois a chave some |
| T-F13 | `home` e `outros`: {`eletronicos`: true, `eletronicosList`: [eletronico('TV', {medidas, polegadas:'55'})], `tvPontoFinal`: null} (a); depois com `tvPontoFinal`: false e `polegadas`: '' (b) | (a) `tvPontoFinal` = `'Selecione uma opção'` nos dois; (b) `eletronico_0_polegadas` = `'Obrigatório'` e `tvPontoFinal` ausente |
| T-F14 | `dormitorio` {`tv`: true} com (a) `tvPontoFinal`: null; (b) `tvPontoFinal`: false, `tv_polegadas`: '' | (a) `tvPontoFinal` = `'Selecione uma opção'`; (b) `tv_polegadas` = `'Obrigatório'` |
| T-F15 | `dormitorio` sem cama; `dormitorio` e `outros` com `tamanhoCama`: 'outro' sem largura/comprimento; `banheiro` com `cuba`: '   ' | `tamanhoCama` = `'Selecione o tamanho da cama'`; `camaLargura_cm` e `camaComprimento_cm` = `'Obrigatório'` nos dois; `cuba` = `'Selecione o tipo de cuba'` |
| T-F16 | `limitarCm` com `"1385.57"`, `"12a,3"`, `"12"`, `"1234"`, `null` | `"138,5"`, `"12,3"`, `"12"`, `"123"`, `""` (`formUtils.js:3-11`) |

### 7.5 Arquivo `testes/P_pdf_cliente.test.js` — 37 casos (`gerarPdf`)

Todos com identificação fictícia padrão (4.6.2) e relógio em 19/10/2026, salvo indicação. "Seção" = fatia do ambiente (4.7). Cada sequência é **contígua**.

**Capa e resumo**

| Caso | Entrada | Esperado |
|---|---|---|
| T-P01 | `cozinha-0` defaults | `saves` = ['Checklist_Cliente_TA9001_2026-10-19.pdf'] |
| T-P02 | `cozinha-0` defaults; relógio 05/03/2026 | `saves` = ['Checklist_Cliente_TA9001_2026-03-05.pdf']; textos contêm `'Data: 05/03/2026'` |
| T-P03 | `cozinha-0` defaults; identificação com `complemento`: 'Fundos', `cep`: '01001-000', `telefone`: '(00) 90000-9001' | sequência de textos: `Cliente: CLIENTE FICTICIO TESTE`, `Contrato: TA9001`, `Rua Ficticia, 100 — Fundos`, `Bairro Ficticio — Cidade Ficticia/SP`, `CEP: 01001-000`, `Telefone: (00) 90000-9001`, `Data: 19/10/2026`, `Classificação de risco global:`, `RISCO BAIXO` (`pdf.js:123-142`) |
| T-P04 | `cozinha-0` defaults; identificação padrão (sem `cep`, sem `telefone`, sem `complemento`) | sequência: `Rua Ficticia, 100`, `Bairro Ficticio — Cidade Ficticia/SP`, `Data: 19/10/2026`; nenhum texto começa com `CEP:` nem `Telefone:` (`pdf.js:126-127`) |
| T-P05 | estado do T-S26 (`outros-0` 9 pts, `home-0` 5 pts) | sequência `Classificação de risco global:`, `RISCO ALTO`; nenhum texto anterior a `Resumo Executivo` contém `pts` (H-01) |
| T-P06 | `cozinha-0` R{`granito`: true, `granitoadaptar`: false, `eletrosDefined`: false}; `dormitorio_casal-0` com nome 'Suíte' R{`cortineiro`: true, `cortieneiroInstalado`: false}; `banheiro-0`; G{`g1_temIluminacaoExterna`: true, G1: ['cozinha-0'], `g4_temRebaixo`: true, `g4_ambientes`: [{instanceId:'dormitorio_casal-0', cm:'12'}]} | sequência: texto `Resumo Executivo`, tabela de cabeçalho `['Ambiente','Ações e pontos de atenção','Risco']` e corpo **exatamente** [['Cozinha / Área de Serviço','Iluminação por conta do cliente — Remover granito — Eletros indefinidos','MÉDIO'], ['Dormitório Casal — Suíte','Rebaixo de 12cm — Cortineiro 150mm','BAIXO']], texto `Checklist Completa`. O Banheiro não aparece (cozinha 5 pts MÉDIO, dormitório 2 pts BAIXO — **medido**) |
| T-P07 | `cozinha-0`, `banheiro-0`, `dormitorio_casal-0`, só defaults (rodapé nulo) | sequência contígua `Resumo Executivo`, `Checklist Completa`; zero eventos de tabela no PDF |
| T-P08 | `dormitorio_casal-0` R{`rodape`: true, `cortineiro`: true, `cortieneiroInstalado`: false} | tabela do resumo com corpo [['Dormitório Casal','Cortineiro 150mm — Roupeiro sobre rodapé','BAIXO']] |

**Perguntas globais dentro do ambiente**

| Caso | Entrada | Esperado |
|---|---|---|
| T-P09 | `cozinha-0` defaults; G{G1: ['cozinha-0'], `g1_temIluminacaoExterna`: true, `g2_temReboco`: false, G2: ['cozinha-0'], `g3_pontosNaPosicaoFinal`: false, `g3_ambientesPendentes`: ['cozinha-0'], `g4_temRebaixo`: true, `g4_ambientes`: [{instanceId:'cozinha-0', cm:'12'}]} | na seção da cozinha, sequência: G1, `Resposta: Sim`, começa com `T-ilum`, G2, `Resposta: Não`, começa com `T-reboco`, G4, `Resposta: Não`, começa com `T-pontos`, G5, `Resposta: Sim — 12 cm`, `T-rebaixo(12)`; nenhum texto G3 na seção; a seção contém `RISCO ALTO (5 pts)` (2+0+2+1, **medido**) |
| T-P10 | `dormitorio_casal-0`; G{`g3_temRevestimento`: false, `g3_ambientesSemRevestimento`: ['dormitorio_casal-0']} | seção contém `RISCO MÉDIO (4 pts)` (**medido**); sequência: G3, `Resposta: Não`, começa com `T-revest` (H-02) |
| T-P11 | `cozinha-0`, `dormitorio_casal-0`; G{`g1_temIluminacaoExterna`: false, G1: []} (G5 fica nula) | em **cada** seção: sequência G1, `Resposta: Não`, e o evento seguinte **não** começa com `CC: `; nenhum texto começa com `G5 — ` no PDF |
| T-P12 | `cozinha-0`, `dormitorio_casal-0`; G{`g4_temRebaixo`: false, `g4_rebaixoOpcao`: 'ja_rebaixado'} (G1 fica nula) | em cada seção: sequência G5, `Resposta: Não`, evento seguinte não começa com `CC: `; nenhum texto começa com `G1 — ` |
| T-P13 | `cozinha-0`, `dormitorio_casal-0`; G{`g4_temRebaixo`: true, `g4_ambientes`: [{instanceId:'cozinha-0', cm:'10'}]} | cozinha: G5, `Resposta: Sim — 10 cm`, `T-rebaixo(10)`; dormitório: G5, `Resposta: Não`, evento seguinte não começa com `CC: ` |
| T-P14 | `cozinha-0`, `dormitorio_casal-0`; G{`g1_temIluminacaoExterna`: true, G1: ['cozinha-0']} | cozinha: sequência G1, `Resposta: Sim`, começa com `T-ilum` (o texto entre a pergunta e o CC é `Resposta: Sim`, nunca `Não`); dormitório: G1, `Resposta: Não`, evento seguinte não começa com `CC: ` (H-19) |
| T-P15 | `cozinha-0`, `dormitorio_casal-0`; G{`g1_temIluminacaoExterna`: null, `g4_temRebaixo`: null, `g2_temReboco`: true, `g3_temRevestimento`: true, `g3_pontosNaPosicaoFinal`: true, listas vazias} | nenhum texto do PDF começa com `G1 — `, `G2 — `, `G3 — `, `G4 — ` ou `G5 — ` |
| T-P16 | `dormitorio_casal-0`, `banheiro-0`; G{`g2_temReboco`: false, G2: ['dormitorio_casal-0']} | seção do dormitório contém `RISCO ALTO (0 pts)`; seção do banheiro contém `RISCO BAIXO (0 pts)` |

**Tanque, eletros e eletrônicos**

| Caso | Entrada | Esperado |
|---|---|---|
| T-P17 | `cozinha-0` R{`tanque`: true, `tanqueEmbutido`: false, `tanqueMoveis`: true} | na seção, sequência: `Existe tanque no local?`, `Resposta: Sim`, `Qual o tipo de tanque?`, `Resposta: Tanque tradicional`, `Haverá móveis na região do tanque?`, `Resposta: Sim`, começa com `T-tanque` |
| T-P18 | `cozinha-0` R{`tanque`: true, `tanqueEmbutido`: true, `tanqueMoveis`: true} | sequência `Qual o tipo de tanque?`, `Resposta: Embutido na bancada`; nenhum texto `Haverá móveis na região do tanque?`; nenhum texto começa com `T-tanque`; **zero** eventos de tabela; nenhum texto nem célula contém `Remover tanque` (H-07, H-17) |
| T-P19 | `cozinha-0` R{`eletrosDefined`: true, `eletros`: [eletro('Lava-louça', {subtipo:'Piso'}), eletro('Forno', {subtipo:'Normal'}), eletro('Cooktop'), eletro('Refrigerador', {subtipo:'Duplex'})]} (medidas '60','85','60' em todos) | tabela de eletros: coluna Tipo, nesta ordem: `Cooktop`, `Refrigerador — Duplex`, `Forno — Normal`, `Lava-louça — Piso` (H-20) |
| T-P20 | `cozinha-0` R{`eletrosDefined`: true, `eletros`: [Coifa 'Parede', Depurador 'Normal', Lava-roupa 'Abertura Frontal', Fogão 'Piso']} (medidas preenchidas) | coluna Tipo: `Fogão — Piso`, `Depurador — Normal`, `Coifa — Parede`, `Lava-roupa — Abertura Frontal` |
| T-P21 | `cozinha-0` R{`eletrosDefined`: true, `eletros`: [eletro('Forno', {subtipo:'Normal', link:'https://a.exemplo.invalid/forno'}), eletro('Cooktop', {link:'https://b.exemplo.invalid/cooktop'})]} (medidas preenchidas); `structuredClone` da entrada **antes** de gerar | coluna Tipo: `Cooktop`, `Forno — Normal`; coluna Link: `Ver link` nas duas; `links` = ['https://b.exemplo.invalid/cooktop', 'https://a.exemplo.invalid/forno'] (cada link na linha do seu eletro; **medido**); a entrada depois de gerar é `deepStrictEqual` à cópia (lista não reordenada; **medido**) (H-21) |
| T-P22 | `cozinha-0` R{`eletrosDefined`: true, `eletros`: [eletro('Outros', {descricao:'Adega', largura_cm:'60', altura_cm:'85', profundidade_cm:'138,5'}), eletro('Lava-roupa', {subtipo:'Abertura Frontal', modelo:'MOD-9001', link:'https://c.exemplo.invalid/lr', largura_cm:'60', altura_cm:'85', profundidade_cm:'60'})]} | texto `Eletrodomésticos` seguido de tabela com cabeçalho `['Tipo','Modelo','Largura (cm)','Altura (cm)','Prof. (cm)','Link']` e corpo exato [['Outros — Adega','—','60','85','138,5','—'], ['Lava-roupa — Abertura Frontal','MOD-9001','60','85','60','Ver link']] |
| T-P23 | `cozinha-0` R{`eletrosDefined`: false, `eletros`: [eletro('Cooktop', medidas)]} (lista residual) | sequência: `Já possui ou tem intenção de compra específica dos eletrodomésticos?`, `Resposta: Não`, começa com `T-eletros`; nenhum texto `Eletrodomésticos`; nenhuma tabela com cabeçalho iniciado por `Tipo` (a do resumo existe, O-2) |
| T-P24 | `home-0` R{`eletronicos`: true, `tvPontoFinal`: true, `eletronicosList`: [eletronico('TV', {polegadas:'55', modelo:'TV-9001', link:'https://d.exemplo.invalid/tv', largura_cm:'120', altura_cm:'70', profundidade_cm:'8'}), eletronico('Home Theater', {largura_cm:'40', altura_cm:'10', profundidade_cm:'30'})]} | texto `Eletrônicos` seguido de tabela com o cabeçalho de 6 colunas e corpo exato [['TV — 55"','TV-9001','120','70','8','Ver link'], ['Home Theater','—','40','10','30','—']] (polegadas só na TV) (H-14) |
| T-P25 | `home-0` R{`eletronicos`: false, `eletronicosList`: [eletronico('Videogame', medidas)]} | sequência: `Possui ou pretende adquirir eletrônicos para este ambiente?`, `Resposta: Não`, começa com `T-eletronicos`; nenhum texto `Eletrônicos`; nenhuma tabela iniciada por `Tipo` (O-2) |

**TV, cama, cuba, observações, CCs sob a pergunta**

| Caso | Entrada | Esperado |
|---|---|---|
| T-P26 | `home-0` R{`eletronicos`: true, `eletronicosList`: [TV55], `tvPontoFinal`: false} | seção: sequência `Possui ou pretende adquirir eletrônicos para este ambiente?`, `Resposta: Sim`, `O ponto elétrico da TV já está na posição final?`, `Resposta: Não`, começa com `T-tv`, `Eletrônicos`, tabela iniciada por `Tipo`; nenhum texto `Terá TV neste ambiente?` (H-03, H-15, H-16) |
| T-P27 | (a) `outros-0` R{`eletronicos`: true, `eletronicosList`: [TV55], `tvPontoFinal`: false}; (b) `outros-0` R{`eletronicos`: true, `eletronicosList`: [eletronico('Videogame', medidas)]}; (c) `home-0` com a mesma lista do (b) | (a) sequência `O ponto elétrico da TV já está na posição final?`, `Resposta: Não`, começa com `T-tv`; (b) e (c): essa pergunta **ausente**; em (a), (b) e (c) nenhum texto `Terá TV neste ambiente?` (`pdf.js:507, 515`; H-23, K-02 corrigido) |
| T-P28 | `dormitorio_casal-0` R{`tv`: true, `tvPontoFinal`: false, `tv_polegadas`: '50', `tv_modelo`: 'TV-9001', `tv_largura_cm`: '120', `tv_altura_cm`: '70', `tv_profundidade_cm`: '8', `tv_link`: 'https://e.exemplo.invalid/tv'} | sequência: `Terá TV neste ambiente?`, `Resposta: Sim`, `O ponto elétrico da TV já está na posição final?`, `Resposta: Não`, começa com `T-tv`, `Polegadas`, `Resposta: 50`, `Modelo`, `Resposta: TV-9001`, `Largura (cm)`, `Resposta: 120`, `Altura (cm)`, `Resposta: 70`, `Profundidade (cm)`, `Resposta: 8`, `Link`, `Resposta: Ver link`; `links` = ['https://e.exemplo.invalid/tv']; nenhum texto igual à URL crua (H-13) |
| T-P29 | `dormitorio_casal-0` R{`tv`: true, `tvPontoFinal`: true, `tv_polegadas`: '50'} | seção contém `Polegadas` e `Resposta: 50`; **não** contém `Modelo`, `Largura (cm)`, `Altura (cm)`, `Profundidade (cm)` nem `Link`; nenhum texto começa com `T-tv`; `links` vazio |
| T-P30 | quatro PDFs no mesmo teste: `dormitorio_casal-0` R{`tamanhoCama`: 'solteiro'}, 'padrao', 'queen', 'king' | cada seção tem a sequência `Qual o tamanho da cama neste ambiente?` seguida de, respectivamente: `Resposta: Solteiro (0,88 × 1,88 m)`, `Resposta: Padrão (1,38 × 1,88 m)`, `Resposta: Queen (1,58 × 1,98 m)`, `Resposta: King (2,00 × 2,03 m)` (H-13) |
| T-P31 | `dormitorio_casal-0` R{`tamanhoCama`: 'outro', `camaLargura_cm`: '200', `camaComprimento_cm`: '210'} | sequência: `Qual o tamanho da cama neste ambiente?`, `Resposta: Outro`, `Largura (cm)`, `Resposta: 200`, `Comprimento (cm)`, `Resposta: 210` |
| T-P32 | quatro PDFs: `banheiro-0` R{`cuba`: 'Sobrepor'}; `banheiro-0` com `cuba` nula; `outros-0` com `cuba` nula; `outros-0` R{`cuba`: 'Apoio'} | sequências `Tipo de cuba`, `Resposta: Sobrepor` / `Tipo de cuba`, `Resposta: —`; Outros nulo: texto `Tipo de cuba` **ausente**; Outros 'Apoio': `Tipo de cuba`, `Resposta: Apoio` |
| T-P33 | `cozinha-0` R{`observacoes`: 'TESTE de observação'}; depois `observacoes`: '' | sequência `Observações`, `Resposta: TESTE de observação`; no segundo PDF o texto `Observações` é ausente |
| T-P34 | `cozinha-0` R{`granito`: true, `granitoadaptar`: false, `eletrosDefined`: false} | sequência 1: `Os móveis serão adaptados?`, `Resposta: Não`, começa com `T-granito`; sequência 2: `Já possui ou tem intenção de compra específica dos eletrodomésticos?`, `Resposta: Não`, começa com `T-eletros` |
| T-P35 | `dormitorio_casal-0` R{`cortineiro`: true, `cortieneiroInstalado`: false, `rodape`: true} | sequência 1: `O cortineiro já está instalado?`, `Resposta: Não`, começa com `A-cort`; sequência 2: `Existe rodapé na região dos móveis?`, `Resposta: Sim`, começa com `A-rodape`; os dois avisos **não** começam com `CC: ` |
| T-P36 | `home-0` R{`rodape`: false, `eletronicos`: false} | sequência 1: `Existe rodapé na região dos móveis?`, `Resposta: Não`, começa com `T-rodape`; sequência 2: `Possui ou pretende adquirir eletrônicos para este ambiente?`, `Resposta: Não`, começa com `T-eletronicos` |
| T-P37 | `dormitorio_casal-0` R{`rodape`: true}, nenhum outro gatilho | tabela do resumo com corpo exato [['Dormitório Casal','Roupeiro sobre rodapé','BAIXO']]; na seção: `RISCO BAIXO (0 pts)` e a sequência `Existe rodapé na região dos móveis?`, `Resposta: Sim`, começa com `A-rodape` (`pdf.js:240-245, 252-254`; H-24, K-03 corrigido) |

Confirmação dos itens de PDF: a mecânica de captura e os totais de pontos estão medidos (seção 8); as sequências exatas de texto são leitura do `pdf.js` e as Tasks 13 a 16 as reconfirmam.

### 7.6 Arquivo `testes/V_pdf_projetista.test.js` — 10 casos

O Projetista usa `montarEstadoProjetista` com grupo explícito. Em V03 a V06 e V10 a seção do ambiente é a fatia que vai do nome do ambiente até o fim.

| Caso | Entrada | Esperado |
|---|---|---|
| T-V01 | `obterGrupo` com 'cozinha', 'varanda', 'banheiro', 'outros'; 'dormitorio_casal', 'dormitorio_solteiro'; 'home', 'office' | `'A'` ×4; `'B'` ×2; `'C'` ×2 (`gruposPerguntasVendedor.js:4-17`) |
| T-V02 | `obterGrupo('ambiente_inexistente')` | `'A'` (`:16`) |
| T-V03 | ambiente `cozinha-0`, grupo A, defaults | depois do nome `Cozinha / Área de Serviço`, exatamente: `Altura do piso — balcões`, `Resposta: —`, `Altura do piso — armários`, `Resposta: —`, `Fechamento até o teto`, `Resposta: —`, `Caixarias ou corpos`, `Resposta: —`, `Dobradiças`, `Resposta: —`, `Corrediças`, `Resposta: —` (`pdfVendedor.js:17-24`) |
| T-V04 | ambiente `dormitorio_casal-0`, grupo B, defaults | depois do nome, exatamente: `Caixarias ou corpos`, `Resposta: —`, `Dobradiças`, `Resposta: —`, `Corrediças`, `Resposta: —`, `Fechamento até o teto`, `Resposta: —` (fechamento por último); nenhum texto `Altura do piso — …` |
| T-V05 | ambiente `home-0`, grupo C, defaults | depois do nome, exatamente: `Caixarias ou corpos`, `Resposta: —`, `Dobradiças`, `Resposta: —`, `Corrediças`, `Resposta: —`; sem altura e sem fechamento |
| T-V06 | `cozinha-0`, grupo A, R{`alturaBalcao_mm`: 850, `alturaArmario_mm`: 'não se aplica', `fechamentoTeto`: 'NAO', `caixaria`: null, `dobradicas`: 'Amortecimento'}; segundo PDF com `fechamentoTeto`: 'SIM' | respostas, nesta ordem: `Resposta: 850 mm`, `Resposta: Não se aplica`, `Resposta: NÃO`, `Resposta: —`, `Resposta: Amortecimento`, `Resposta: —` (corrediças); segundo PDF: `Resposta: SIM` na pergunta do fechamento (`pdfVendedor.js:38-44`) |
| T-V07 | contratos ['TA9001','','SM9002'], nome 'CLIENTE FICTICIO TESTE' | sequência: `Cliente: CLIENTE FICTICIO TESTE`, `Contrato(s): TA9001, SM9002`, `Data: 19/10/2026` (`pdfVendedor.js:79-81`) |
| T-V08 | contratos [''] | `Contrato(s): —`; `saves` = ['Checklist_Projetista_SEMCONTRATO_2026-10-19.pdf'] (`:80, 145`) |
| T-V09 | contratos ['TA9001','','SM9002']; depois ['','SM9002','TA9001'] | `saves` = ['Checklist_Projetista_TA9001_2026-10-19.pdf']; ['Checklist_Projetista_SM9002_2026-10-19.pdf'] (primeiro **preenchido**) |
| T-V10 | `cozinha-0`, grupo A, R{`observacoes`: 'TESTE de observação'}; depois `observacoes`: '' | sequência `Observações do ambiente`, `Resposta: TESTE de observação`; no segundo PDF o texto `Observações do ambiente` é ausente (`:140-142`) |

## 8. Confirmado em 19/10/2026 por protótipo

Um protótipo descartável, **fora do repositório** (scratchpad da sessão), reproduziu a mecânica da seção 4.3: API `build` do esbuild 0.21.5, `format: 'cjs'`, plugin `onResolve` para `^jspdf$` e `^jspdf-autotable$`, fabricante que cria a instância real de `jsPDF` e troca `text`, `splitTextToSize`, `link` e `save` na instância, `API` copiada para o fabricante, autotable embrulhado com a marca "desenhando tabela", e `mock.timers.enable({ apis: ['Date'], now })`. Rodou a `gerarPdf` real e o `calcularScore` real. Resultados medidos (Node 24.15.0):

1. **Junção das linhas quebradas:** a pergunta G1 (quebrada em linhas) virou **um único** evento igual à frase inteira; `Resposta: Sim` e o `CC: …` também.
2. **Ordem dos links (T-P21):** com o Forno cadastrado antes do Cooktop, `links` = ['https://b.exemplo.invalid/cooktop', 'https://a.exemplo.invalid/forno'].
3. **Relógio:** `mock.timers` com `Date` funciona no Node 24.15.0; a capa saiu `Data: 19/10/2026` e `Data: 05/03/2026`; o `save` foi `Checklist_Cliente_TA9001_2026-10-19.pdf` e `Checklist_Cliente_TA9001_2026-03-05.pdf`; depois do `reset()` o relógio real voltou.
4. **Empacotamento:** o `jspdf` foi empacotado sem nenhum `external`.
5. **Pontos (com `calcularScore` real):** T-S23a BAIXO 3; T-S24a MÉDIO 7; T-S24b ALTO 9; T-S24c ALTO 8 com `isAlto` falso; T-S27 cozinha MÉDIO 4, outros MÉDIO 6, global MÉDIO 6; T-S28 global BAIXO 3; T-P06 cozinha MÉDIO 5 e dormitório BAIXO 2; T-P09 ALTO 5; T-P10 MÉDIO 4.
6. **Plugin do autotable:** não quebrou com o fabricante. Tabelas capturadas: resumo [['Cozinha / Área de Serviço', …]] e eletros [['Cooktop',…,'Ver link'],['Forno — Normal',…,'Ver link']]; **zero** textos de célula vazaram para os eventos de texto.
7. **Também medido:** a entrada do T-P21 ficou idêntica depois de gerar; a pasta temporária foi apagada; o `git status` não mudou; nenhum PDF foi gravado.
8. **Armadilha de caminho:** `new URL(...).pathname` quebra (seção 4.3); `fileURLToPath` e `pathToFileURL` são obrigatórios.

As Tasks 3 e 6 **reconfirmam** os itens 1 a 3, 6 e 7 dentro da suíte real, e as Tasks 11 e 13 a 16 reconfirmam os pontos. Continua só por leitura (marcado "leitura" no mapa) tudo que não está acima. Se uma reconfirmação divergir do protótipo, registrar em Desvios e perguntar ao Everton.

## 9. Plano de Execução

Regras valem para todas as tasks:

- **Se um resultado divergir do esperado do PRD ou deste Spec: NÃO ajustar o teste para ficar verde.** Registrar em "Desvios" (seção 10) com o valor esperado, o obtido e a evidência, e perguntar ao Everton antes de continuar.
- Nenhum arquivo de `src/` é tocado em nenhuma task.
- Commits **por bloco**, não por task, e **só quando o Everton pedir**. O texto sugerido está ao fim de cada bloco. Tasks de conferência (rodar, comparar, provar) **não** geram commit.
- Comandos de shell: caminhos entre aspas (o caminho do repositório tem espaço); nada montado por concatenação de texto. Em código JS dos auxiliares, caminhos só com `fileURLToPath`/`pathToFileURL` (seção 4.3).

**Passo 0 (antes da Task 1; não é task) — ponto de partida**

- [ ] Passo 0 — Rodar `git status --short` e `git log -1 --format=%h` na raiz e **guardar a saída** no relatório (no início desta tarefa o status trazia ` M PRDS_E_SPECS/PRD_TESTES_REGRESSAO_CHECKLIST_DINAMICA.md`; este Spec aparecerá como novo). Todos os critérios "nada mudou" (CA-05, CA-11, CA-13) comparam com **esse** estado, não exigem árvore limpa. Conferir também que `node --version` mostra Node 24 e que `node_modules/esbuild` existe.

**Bloco 1 — Infraestrutura (um commit só, ao fim da Task 8)**

- [ ] Task 1 — **Única task com rede.** Rodar `npm install --save-dev --save-exact esbuild@0.21.5`; escrever à mão o script `"test": "node --test"` em `package.json`. Conferir: `git diff package.json` mostra só o script e `"esbuild": "0.21.5"` em `devDependencies` (CA-14); `git diff package-lock.json` mostra só a entrada do esbuild em `packages[""].devDependencies` (CA-13); `node_modules/esbuild/package.json` continua 0.21.5. Se o lock mudar além disso, parar e registrar em Desvios.
- [ ] Task 2 — Criar `testes/auxiliares/travas.js` (seção 4.4: rede, localStorage, `garantirForaDoRepo` com `fileURLToPath`, `assertSemRede`). Testar com um script descartável **fora do repo** (pasta do scratchpad): (a) `fetch` lança erro e é registrado; (b) `garantirForaDoRepo` aceita uma pasta de `os.tmpdir()` e **rejeita** uma pasta dentro do repositório; (c) funciona com o caminho do repositório que tem espaço.
- [ ] Task 3 — Criar `testes/auxiliares/relogio.js` (seção 4.5). Testar com script descartável: dentro de `comRelogio` com a data de 19/10/2026, `new Date().getTime()` é **igual ao instante exato** pedido (12:00:00.000), `toLocaleDateString('pt-BR')` dá `19/10/2026` e os getters dão 2026-10-19; com a de 05/03/2026 dá `05/03/2026` e `2026-03-05`; **depois** da chamada o relógio voltou ao real; vale também com `TZ` diferente. Provar que a autoconferência pega o mock desligado (comparando o instante, não o dia). Se `mock.timers` não suportar `Date` no ambiente, a falha tem de ser alta e clara. Reconfirma o item 3 da seção 8.
- [ ] Task 4 — Criar `testes/auxiliares/construtores.js` (seção 4.6). Testar com script descartável: para cada `formType` (cozinha, dormitorio, home, banheiro, outros) o estado montado sem `resp` passa por `calcularScore` sem erro, devolve 0 ponto e lista de gatilhos vazia; a mutação de um estado não vaza para outro (cópias independentes); o estado do Projetista tem `contratos` e grupos A/B/C com os campos de `defaultsPorGrupo`.
- [ ] Task 5 — Criar o conjunto que entra no pacote do PDF: `captura_registro.js`, `captura_jspdf.js`, `captura_autotable.js`, `entrada_pdf.js` (seção 4.3). Só criação; a prova vem na Task 6.
- [ ] Task 6 — Criar `testes/auxiliares/carregar_pdf.js` (com `fileURLToPath`/`pathToFileURL`) e provar o conjunto da Task 5 com script descartável fora do repo: (a) empacota e carrega, inclusive com `os.tmpdir()` em formato curto (`WINDOW~1`) e repositório com espaço; (b) `gerarPdf` com um estado de uma cozinha e `gerarPdfVendedor` com um ambiente rodam sem exceção; (c) cada chamada gera **exatamente um** `save` com o nome esperado (`Checklist_Cliente_TA9001_2026-10-19.pdf` com o relógio da Task 3) e **nenhum arquivo** aparece no repositório (`git status` igual ao do Passo 0) nem sobra a pasta temporária; (d) o texto de uma pergunta longa (G1) aparece como **um único** evento de texto igual à frase inteira, e `Resposta: …` idem; (e) a tabela do Resumo Executivo e a tabela de eletros aparecem como eventos de tabela (e o texto das células **não** vira evento de texto); (f) o `link` de um eletro com `link` é registrado, na ordem [B, A] do T-P21; (g) com o relógio de 05/03/2026 o nome tem `2026-03-05`. Reconfirma os itens 1 a 3, 6 e 7 da seção 8; qualquer divergência vai para Desvios.
- [ ] Task 7 — Criar `testes/auxiliares/leitura_pdf.js` (seção 4.7). Provar com script descartável sobre uma captura real da Task 6: acha a seção de um ambiente; acha uma sequência contígua; **falha mostrando o trecho** quando a sequência não existe; a ausência funciona.
- [ ] Task 8 — Criar `testes/auxiliares/textos_cc.js` com os 13 textos da seção 4.8 e fazer a **conferência mecânica da transcrição, fora da suíte**: script descartável fora do repo que (a) importa `textos_cc.js` (por `pathToFileURL`); (b) lê `src/domain/checklistTextos.js` e `src/domain/ccBuilder.js` como **texto** (e, para os quatro textos do `ccBuilder.js`, extrai os literais pelas linhas 43-44, 55-56, 78-79 e 92); (c) compara os 13 caractere por caractere, na forma NFC, sem BOM e sem CR/LF dentro do texto; (d) confirma que `textos_cc.js` não importa nada de `src/`. Relatório: tabela de 13 linhas igual/diferente. Qualquer "diferente" = corrigir a transcrição (nunca o `src/`) e repetir.
  - **Commit sugerido do Bloco 1 (só quando o Everton pedir):** `test: adiciona infraestrutura da suíte de regressão (esbuild declarado, npm test e auxiliares de captura do PDF)` — arquivos: `package.json`, `package-lock.json`, `testes/auxiliares/*`.

**Bloco 2 — Grupo A**

- [ ] Task 9 — Criar `testes/A_ambientes.test.js` (T-A01 a T-A03, seção 7.3). Rodar `node --test testes/A_ambientes.test.js`: 3 passam, `fail 0`, `skipped 0`. Conferir que o arquivo começa importando `auxiliares/travas.js` e que `AMBIENTES_DISPONIVEIS` é a única constante importada.
  - **Commit sugerido:** `test: adiciona testes dos ambientes compartilhados (T-A01 a T-A03)`.

**Bloco 3 — Grupo F**

- [ ] Task 10 — Criar `testes/F_validacao.test.js` (T-F01 a T-F16, seção 7.4). Rodar o arquivo: 16 passam, 0 falham, 0 pulados.
  - **Commit sugerido:** `test: adiciona testes da validação por ambiente e do limitarCm (T-F01 a T-F16)`.

**Bloco 4 — Grupo S**

- [ ] Task 11 — Criar `testes/S_score.test.js` (T-S01 a T-S29, seção 7.1). Rodar o arquivo: 29 passam. Os valores de T-S23, T-S24, T-S27 e T-S28 já estão medidos (seção 8); se algum diferir na suíte real, é caso de Desvios (não ajustar). T-S16 (2 e 2) e T-S26 seguem "PRD diz medido".
  - **Commit sugerido:** `test: adiciona testes do score por ambiente e global (T-S01 a T-S29)`.

**Bloco 5 — Grupo C**

- [ ] Task 12 — Criar `testes/C_ccs.test.js` (T-C01 a T-C16, seção 7.2), importando só `auxiliares/textos_cc.js` para os textos. Rodar o arquivo: 16 passam. Conferir que nenhum outro arquivo de teste importa `textos_cc.js`.
  - **Commit sugerido:** `test: adiciona testes dos CCs e avisos com texto completo (T-C01 a T-C16)`.

**Bloco 6 — Grupo P (um arquivo, quatro tasks; um commit ao fim da Task 16)**

- [ ] Task 13 — Criar `testes/P_pdf_cliente.test.js` com a abertura (travas, `await carregarPdf()` no topo, `assertSemRede` no `after`) e os casos T-P01 a T-P08 (capa e resumo). Rodar o arquivo: 8 passam.
- [ ] Task 14 — Acrescentar T-P09 a T-P16 (perguntas globais dentro do ambiente). Rodar: 16 passam no acumulado.
- [ ] Task 15 — Acrescentar T-P17 a T-P25 (tanque, eletros, eletrônicos). Rodar: 25 passam no acumulado. Reconfirmar a ordem dos links do T-P21 (seção 8, item 2).
- [ ] Task 16 — Acrescentar T-P26 a T-P37 (TV, cama, cuba, observações, CCs sob a pergunta). Rodar: 37 passam, 0 falham, 0 pulados.
  - **Commit sugerido:** `test: adiciona testes do PDF do Cliente (T-P01 a T-P37)`.

**Bloco 7 — Grupo V**

- [ ] Task 17 — Criar `testes/V_pdf_projetista.test.js` (T-V01 a T-V10, seção 7.6), com `await carregarPdf()` no topo. Rodar o arquivo: 10 passam, 0 falham, 0 pulados.
  - **Commit sugerido:** `test: adiciona testes do PDF do Projetista e dos grupos de perguntas (T-V01 a T-V10)`.

**Conferências (sem commit)**

Procedimento comum às provas H (seção 8 do PRD, "Prova dos consertos"). **Por quê:** provar que o teste não passa "sempre". **Trade-off:** custa uma cópia por prova, em troca de o repositório nunca ser alterado.

1. Criar uma pasta nova (por exemplo `prova-H01-<sufixo>`) dentro de `$env:TEMP`, **fora do repositório**. (A trava de pasta de saída do `carregar_pdf.js` calcula a raiz a partir da cópia; o pacote temporário nasce em outra pasta de `$env:TEMP`, irmã da cópia, portanto fora dela.)
2. Copiar para ela **somente** `src/`, `testes/` e `package.json` (nada de `.env`, `.git`, `PRDS_E_SPECS/`, pareceres, `replay_jules/`, `dist/`, PDFs ou qualquer dado real).
3. Criar na cópia uma **junção** `node_modules` apontando para o `node_modules` do repositório (só leitura; no Windows: `New-Item -ItemType Junction`).
4. Aplicar **na cópia** a mudança mínima da prova, um arquivo e uma ou duas linhas, sobre o código atual (nunca restaurar o arquivo do commit pai: o PRD explica que isso derrubaria casos por outro motivo).
5. Dentro da cópia, rodar `node --test` e guardar a saída num arquivo da própria pasta temporária. Código de saída tem de ser diferente de 0.
6. Comparar a lista de casos vermelhos com a tabela da prova. **Outros vermelhos só são aceitos se explicados no relatório.**
7. **Limpeza, nesta ordem:** remover primeiro a junção (`cmd /c rmdir "<pasta>\node_modules"`, que apaga só o link, nunca o alvo); só então apagar a pasta da prova. Depois conferir que `node_modules\esbuild` e `node_modules\jspdf` do repositório ainda existem e que o `git status` é igual ao do Passo 0.

Para cada prova há uma cópia nova (partir sempre do código intacto).

- [ ] Task 18 — Provas H sobre `scoreEngine.js` (uma cópia por prova; linhas de `1a6022d`, o commit não toca esse arquivo). Registrar no relatório uma tabela "prova · vermelhos obtidos · vermelhos esperados · extras explicados".

| Prova | Mudança mínima na cópia | Vermelhos exigidos (PRD) | Extras previstos pela leitura do código |
|---|---|---|---|
| H-01 | `scoreEngine.js:145`: o filtro volta a `ambientesValues.filter((s) => s.isAlto)` | T-S26, T-P05 | nenhum |
| H-02 | `scoreEngine.js:39`: o gatilho volta a `nivel: 'Alto', pontos: 3` | T-S03, T-P10 | T-S05, T-S23 e T-S27 (usam G3 sozinho, que passa a valer 3 pontos e ALTO) |
| H-03 | `scoreEngine.js:85`: lista vira só `['outros']`; `scoreEngine.js:77`: a condição vira `['dormitorio', 'home'].includes(formType)` | T-S14, T-C09, T-P26 | nenhum |
| H-04 | `scoreEngine.js:85`: lista vira só `['home']`; `scoreEngine.js:77`: a condição vira `['dormitorio', 'outros'].includes(formType)` | T-S15, T-C09 | T-P27 (a) (Outros deixa de ter o CC de TV) |
| H-07 | `scoreEngine.js:67`: remover `resp.tanqueEmbutido === false &&` | T-S12, T-C08, T-P18 | nenhum |
| H-08 | `scoreEngine.js:74`: `const div07Ativo = g3_ambientesPendentes.length > 0` | T-S16 | nenhum |

- [ ] Task 19 — Provas H sobre `pdf.js` (mesmo procedimento, uma cópia por prova).

| Prova | Mudança mínima na cópia | Vermelhos exigidos (PRD) | Extras previstos |
|---|---|---|---|
| H-23 | `pdf.js:515` volta a `if (formType === 'home' && resp.eletronicosList.some((e) => e.tipo === 'TV')) {` | T-P27 (a) | nenhum |
| H-24 | `pdf.js:240-245`: o filtro volta a só devolver `score && score.gatilhos.length > 0` (sem a alternativa do aviso de rodapé) | T-P37 | nenhum |

- [ ] Task 20 — Provas de erro (mesmo procedimento de cópia, uma por cenário):

| Critério | Cenário | Esperado |
|---|---|---|
| CA-03 | na cópia, `scoreEngine.js:165` troca `pontos >= 8` por `pontos >= 9` | T-S24 (parte c, 8 pontos) fica vermelho; a mensagem mostra esperado e obtido |
| CA-04 | na cópia, `ccBuilder.js:44`: `SERVIÇOS` vira `SERVICOS` | T-C01 vermelho (o trecho de P usa só o começo `FIAÇÃO ELÉTRICA, INSTALAÇÃO DE ILUMINAÇÕES`, que não é afetado) |
| CA-06 | cópia **sem** a junção `node_modules` | os arquivos P e V falham ao carregar com a mensagem que manda rodar `npm ci`; os grupos A, F, S e C passam (não usam pacote externo); código de saída diferente de 0; nenhum "pulado" |
| CA-07 | rodar a suíte inteira no repositório com `TZ` = `Pacific/Kiritimati` e depois `TZ` = `Pacific/Pago_Pago` (opostos de 25 h) | resultado idêntico ao do fuso normal; nomes `…_2026-10-19.pdf` e `…_2026-03-05.pdf` inalterados. **Limite honesto:** não se muda o relógio real do sistema; a independência da data real vem do `mock.timers` (com autoconferência por instante exato, seção 4.5) e é confirmada por busca (nenhum teste lê `Date` fora do `relogio.js`) |
| CA-16 | na cópia, renomear `calcularScore` para `calcularPontuacao` em `scoreEngine.js` e nos imports de `src/` (busca por todas as ocorrências); rodar | `S_score` e `C_ccs` falham por import; corrigir **só os imports** dos testes e do auxiliar na mesma task deixa tudo verde **sem** mudar nenhum valor esperado |

**Task condicionada ao fim**

- [ ] Task 21 — **Só depois de o Everton ter revisado o relatório da Task 20** (a última task de testes). Trocar, em `CLAUDE.md`, a frase da linha 28 (`Não há suíte de testes automatizada. A validação é feita rodando `npm run build` (garante que compila) e testando o fluxo no `npm run dev`.`) — **trocar, não acrescentar linha** — por um texto que diga: rodar `npm test` antes de qualquer commit ou merge na `main` que altere código em `src/`; vermelho ou pulado bloqueia; manter `npm run build` e o teste manual no `npm run dev`; `replay_jules/` continua como conferência manual separada. Acrescentar `npm test` ao bloco de comandos só se couber **trocando** uma linha existente, não somando. Conferir: a frase "Não há suíte de testes automatizada" não existe mais; o arquivo continua abaixo de ~100 linhas (hoje 75); mostrar o diff ao Everton para aprovação antes de dar a task por feita (regra do projeto: perguntar antes de alterar o `CLAUDE.md`).
  - **Commit sugerido:** `docs: troca a frase de ausência de testes do CLAUDE.md pela regra de rodar npm test antes de mexer em src/`.

**Task final**

- [ ] Task 22 — Fechamento. (a) Rodar `npm test` na raiz, offline, e **reportar os três números** do resumo do Node (`pass`, `fail`, `skipped`; e `todo`): esperado `tests 111`, `pass 111`, `fail 0`, `skipped 0`, código de saída 0; **teste pulado por falta de material não conta como passou**. (b) Rodar `npm run build` e conferir que compila e que `dist/` não contém arquivos de teste (busca por `travas`, `captura_`, `testes` em `dist/`). (c) Conferir os critérios do PRD, um a um, no relatório:
  - CA-01: os 111 casos aparecem no resumo pelo ID `T-` (contagem de IDs distintos em `testes/*.test.js` = 111, com 29 S, 16 C, 3 A, 16 F, 37 P, 10 V).
  - CA-02: resultado das Tasks 18 e 19.
  - CA-03, CA-04, CA-06, CA-07, CA-16: resultado da Task 20.
  - CA-05: `git status` igual ao do Passo 0 mais os arquivos da seção 3; busca por `*.pdf` e `*.cjs` fora de `node_modules` retorna vazio; nenhuma pasta `checklist-testes-*` sobrando em `$env:TEMP`.
  - CA-08: busca nos testes por `ORDEM_ELETROS_PDF`, `GATILHO_TEXTO`, `PERGUNTAS_POR_GRUPO`, `GRUPO_POR_AMBIENTE`, `TAMANHOS_CAMA`, `ELETROS_CONFIG`, `ELETRONICOS_CONFIG`, `TIPOS_CUBA`, `COR_NIVEL`, `TEXTO_`: nenhuma ocorrência; `AMBIENTES_DISPONIVEIS` só no `A_ambientes.test.js`.
  - CA-09: busca por uso de `skip`, `todo` e `only` com a expressão `\b(skip|todo|only)\s*[:(]|\.(skip|todo|only)\b` (a palavra "todos" aparece nos textos das perguntas, por isso a busca é pelo uso da API e não pela palavra solta): nenhuma ocorrência.
  - CA-10: nenhum caso afirma o K-01 (nenhuma lista com TV e `eletronicos` falso); T-P27 e T-P37 testam o comportamento corrigido; nenhum caso usa ambiente removido.
  - CA-11: `git diff` de `src/` vazio.
  - CA-12: resultado do `npm run build` do item (b).
  - CA-13: `deploy.yml`, `vite.config.js` e `replay_jules/` sem alteração; lock só com a entrada do esbuild.
  - CA-14: diff do `package.json` = script `test` + `"esbuild": "0.21.5"`.
  - CA-15: busca por contrato fora da série (`\b(TA|SM)(?!9)\d+`), por link fora de `.invalid` (`https?://` sem `.invalid`) e por nome/telefone reais: nenhuma ocorrência.
  - CA-17: efeito da Task 21.
  - CA-18: relatório final ao Everton com os números passou/pulou/falhou.

**Total: 22 tasks numeradas (mais o Passo 0).**

## 10. Desvios
