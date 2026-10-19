# PRD — Testes de regressão automatizados (Checklist Dinâmica)

**Card Trello:** #130 TESTES_REGRESSAO_CHECKLIST_DINAMICA
**Data:** 2026-10-19
**Base medida:** `main` em `1a6022d` (correções dos cards #131, #132 e #135 sobre o inventário medido em `60152e9`)
**Status:** Aguardando aprovação
**Fonte principal:** `PRDS_E_SPECS/INVENTARIO_FEATURES_CHECKLIST_DINAMICA.md` (IDs S-, P-, F-, C-, V-, D-, K-, H-). Os IDs do inventário são usados aqui para rastreabilidade. Todo `arquivo:linha` citado neste PRD foi aberto e conferido no código de `1a6022d`. O inventário foi medido em `60152e9`; onde ele diverge do código de `1a6022d` (K-02, K-03, K-04 e linhas de `pdf.js`), vale este PRD.

---

## 1. Objetivo

Criar a primeira rede de testes automatizados de regressão das regras de negócio que **já estão vivas** no código:

- score e CCs (`src/domain/scoreEngine.js`, `src/domain/ccBuilder.js`);
- validação por ambiente (`src/steps/StepPerguntasPorAmbiente/formUtils.js`);
- PDF do Cliente (`src/services/pdf.js`) e PDF do Projetista (`src/services/pdfVendedor.js`).

Motivo: esses pontos decidem sozinhos o que chega impresso no documento que o cliente assina e na fábrica, sem ninguém reconferir. Hoje a única proteção é `npm run build` (só garante que compila) e teste manual. Dois incidentes reais mostram o risco: o PR do Jules que imprimiu "Não" ao lado de um CC "Sim" (H-19) e a acentuação gravada errada em `1df50f6` (H-11).

**Como será usada:** rodada à mão pela IA antes de qualquer commit ou merge na `main` que altere código em `src/`. Resultado vermelho ou pulado bloqueia. Não há CI automático neste ciclo; o deploy (`.github/workflows/deploy.yml`) não muda.

## 2. Relação com scripts existentes

- `replay_jules/` (`LEIAME.md`, `gerar.mjs`, `analisar.py`, `shim_jspdf.js`, `shim_autotable.js`, `rodada2/`) é uma **conferência manual separada**, que gera PDFs reais e os lê com Python. **Continua como está** e não é substituída. O ciclo novo só reaproveita a técnica (empacotar o PDF com o esbuild do Vite, em formato `cjs`, trocando `jspdf` por um intermediário), não os arquivos.
- Diferença central: a suíte nova **nunca gera PDF**. Ela captura o texto, as tabelas, os links e o nome do arquivo que a função real tentaria escrever e descarta o resto.
- `npm run build` e o teste manual no `npm run dev` continuam valendo; a suíte é um passo a mais, não um substituto.

## 3. Contexto e evidências

| Fato | Evidência |
|---|---|
| Score e CCs são funções puras em `.js`, sem React | `scoreEngine.js:6`, `ccBuilder.js:19`; `package.json` tem `"type": "module"`, então o Node as importa direto (medido: `calcularScore`, `construirCCs` e `validarFormularioAmbiente` rodaram em Node 24 fora do repo) |
| `gerarPdf` calcula score e CCs, lê o relógio e chama `doc.save` | `pdf.js:91-97`, `pdf.js:572` |
| `gerarPdfVendedor` idem | `pdfVendedor.js:50-54`, `pdfVendedor.js:146` |
| A data entra em dois lugares: "Data:" na capa e no nome do arquivo | `pdf.js:96-97` e `pdfVendedor.js:53-54` (hora local da máquina) |
| O PDF liga cada CC à sua pergunta pelo código do gatilho e pela origem G1-G5 | `pdf.js:108` (mapa por id), `pdf.js:291-311` e `pdf.js:348-367` |
| Armadilha de nomes: a pergunta **G4** (pontos indefinidos) grava em `g3_ambientesPendentes`; a pergunta **G5** (rebaixo) grava em `g4_temRebaixo` e `g4_ambientes` | `scoreEngine.js:14,43`, `scoreEngine.js:49-51`, `schema.js:108-113` |
| `calcularScore` quebra se `global.g4_ambientes` não existir | `scoreEngine.js:51` (sem valor reserva). Toda entrada de teste parte do `estadoInicial` completo |
| Node local 24.15.0; deploy usa Node 20 | medido; `deploy.yml` (`node-version: 20`) |
| `node_modules/.bin/esbuild` 0.21.5 é dependência transitiva do Vite, **não declarada** | `package.json` (só `vite`); `package-lock.json:1423` (esbuild 0.21.5) e `package-lock.json:1919` (Vite pede `^0.21.3`) |
| Empacotar para Node exige formato `cjs`; em `esm` falha com "Dynamic require of fs" | medido na pesquisa deste PRD; igual ao `replay_jules/LEIAME.md` passo 4 |
| Para capturar o que o `jsPDF` escreve, é preciso embrulhar **cada instância** (`text`, `link`, `save`); estender a classe não funciona, porque os métodos nascem na instância | medido: com a classe estendida o `save` real foi chamado e tentou gravar arquivo |
| Medido com embrulho sobre o `jsPDF` real e o `jspdf-autotable` real: capturou textos, cabeçalho e corpo das tabelas, URL dos links e o nome `Checklist_Cliente_TA9001_2026-10-19.pdf`; nenhum arquivo apareceu na pasta | execução de teste fora do repo (pasta temporária da sessão) |
| `node --test` sem argumento acha `*.test.js`, `test-*.js`, `*-test.js` e pastas `test/`; **nenhum arquivo do repo hoje casa** (não varre `replay_jules/` nem `dist/`) | busca feita em `60152e9` e repetida em `1a6022d` (`1a6022d` só altera `src/`) |
| `node --test <pasta>/` **falhou** no Node 24 (a pasta foi tratada como arquivo); a documentação do Node 20 diz que aceita | medido; doc do Node 20 consultada |
| `mock.timers` com `Date` funciona no Node 24 (data fixada 19/10/2026 devolveu "19/10/2026"); a doc do Node 20 lista `Date` entre as opções, sem dizer desde qual versão | medido (Node 24); doc do Node 20 |
| Wizard não deixa avançar sem ambiente | `StepAmbientes.jsx:21,93` |
| Wizard não deixa avançar com `cm` do rebaixo vazio; o campo de ambiente removido some da tela. Desde `1a6022d` o reducer também tira o ambiente removido das listas G1-G5 (`FormProvider.jsx:113-133`), então o travamento não ocorre mais | `StepPerguntasGlobais.jsx:33-37`, `BlocoRebaixo.jsx:79-81`, `FormProvider.jsx:113-133` |
| Funções mortas no PDF do Cliente | `pdf.js:27-47` (confirmado: ninguém chama `formatarListaAmbientes` nem `formatarListaRebaixo`) |
| O commit `1a6022d` (cards #131, #132, #135) alterou só `src/services/pdf.js` e `src/context/FormProvider.jsx`; `scoreEngine.js`, `ccBuilder.js`, `checklistTextos.js` e `formUtils.js` ficaram intocados. Deslocou `pdf.js` em +2 linhas a partir da 240; não mudam `pdf.js:27-47`, `91-97`, `93-94`, `96-97`, `108`, `126-127` | `git show 1a6022d --stat` e `git show 1a6022d -- src` |

## 4. Decisões fechadas (Everton)

1. **Ferramenta:** executor de testes nativo do Node (`node --test`, módulos `node:test` e `node:assert`). Nenhuma dependência nova. É **exceção consciente** à regra global "só pytest": o código é JavaScript e pytest chamando Node seria dois idiomas.
2. **PDF testado com a função real**, empacotada para Node com o esbuild que já vem com o Vite. Este PRD define **o que** conferir; o **como** capturar (intermediário que grava as chamadas de texto, tabela, link e `save`, sem ler PDF) fica para o Spec. Exigências já fixadas: nada é gravado fora de pasta temporária e nenhum PDF é baixado no repo.
3. **Revestimento (S-03, H-02):** ambiente MÉDIO +4 com CC de nível ALTO é **intencional** (Everton, 19/10/2026). Vira teste assim.
4. **K-01 é bug confirmado e não vira teste** (card #133, ainda aberto; a correção chega com o próprio teste). **K-02, K-03 e K-04 foram corrigidos em `1a6022d`** (cards #131, #132, #135). K-02 e K-03 passam a ser **regra viva e entram na suíte** no comportamento corrigido (T-P27, T-P37); K-04 foi corrigido no reducer (`.jsx`) e segue sem teste (lista N).
5. **Regras que só existem dentro de `.jsx`** (reducers não exportados, validações de tela) ficam na **lista N**, sem refatorar.
6. Comando: script `npm test` em `package.json` chamando `node --test`. Mudança em `package.json` só para isso.

## 5. Regras de construção dos testes

1. **Regra de ouro:** os testes seguem o código de **hoje**. Nenhum teste para comportamento ainda não implementado (venda futura #117, importação #99, design system #114).
2. **Valor esperado por extenso.** O teste **não importa** listas, mapas ou constantes do código para montar o esperado. Proibido importar: `ORDEM_ELETROS_PDF`, `GATILHO_TEXTO`, `PERGUNTAS_POR_GRUPO`, `GRUPO_POR_AMBIENTE`, `TAMANHOS_CAMA`, `ELETROS_CONFIG`, `ELETRONICOS_CONFIG`, `TIPOS_CUBA`, `COR_NIVEL` e qualquer `TEXTO_*` de `checklistTextos.js`. Pode importar **apenas** as funções testadas (`calcularScore`, `construirCCs`, `validarFormularioAmbiente`, `limitarCm`, `formatarNomeAmbiente`, `obterGrupo`, `gerarPdf`, `gerarPdfVendedor`) e o estado inicial e os defaults (`estadoInicial`, `defaultsPorFormType`, `estadoInicialVendedor`, `defaultsPorGrupo`) para montar a **entrada**. Única exceção, declarada: o caso T-A03 confere o catálogo `AMBIENTES_DISPONIVEIS`, que ali é o **objeto testado**, contra uma lista escrita por extenso.
3. **Texto completo dos CCs.** O texto completo é conferido **só no grupo C**, porque ali o texto jurídico assinado é o próprio objeto da regra (13 textos: 11 CCs e 2 avisos). Nos demais grupos (S, P) basta o código, o nível, a pontuação e, no PDF, um trecho de identificação do CC. Justificativa: conferir tudo em todo lugar multiplicaria o custo de manutenção sem proteger mais; conferir só trecho nos CCs seria deixar passar justamente o incidente H-11 (acentuação). Cada texto é transcrito do código **uma única vez** pelo Spec, com conferência mecânica de transcrição na tarefa (fora da suíte); depois disso o teste passa a ser a fonte da regra. Mudar a redação de um CC exige atualizar o teste com registro no Spec do card que mudou.
4. **Comportamento aberto (possível bug)** não vira teste: vai para a lista K.
5. **Regra que não dá para testar sem refatorar:** lista N.
6. **Entradas escolhidas para sobreviver aos cards planejados.** Ex.: os casos de TV de Home/Outros usam "eletrônicos = Sim" com TV na lista (o card #133 só muda o caso "Não"); os casos de TV não usam "eletrônicos = Não" com TV residual (K-01 aberto). Os cards #131 e #132 já foram corrigidos em `1a6022d`, então não há mais cuidado especial com Outros nem com rodapé existente.
7. **Renomear função interna** = corrigir o import do teste na mesma tarefa. O valor esperado só muda com registro no Spec do card que mudou a regra.
8. **Dados 100% fictícios, série reservada:** contratos `TA9xxx` / `SM9xxx`, nomes claramente falsos (ex.: "CLIENTE FICTICIO TESTE"), links em domínio `.invalid`. Nenhum dado real, nenhum `localStorage` salvo, nenhum PDF de cliente.
9. **Relógio controlado.** A data do nome do arquivo e da capa depende da hora da máquina. O teste fixa a data (sem alterar produção); mecanismo no Spec. A data fixa deve ser meio-dia no horário local, para não virar o dia por fuso. Dois valores: 19/10/2026 e 05/03/2026 (confere o zero à esquerda).
10. **Todo teste de PDF confere também:** exatamente **uma** chamada de `save` com o nome esperado; nenhuma exceção; nenhum arquivo criado.
11. **Sem rede.** A suíte roda offline. Nada chama o ViaCEP.
12. **Proibido `skip`, `todo` e `only`** nos arquivos de teste. Se faltar pré-requisito (ex.: esbuild ausente), o teste **falha** com mensagem clara; nunca pula.
13. **Codificação:** arquivos de teste em UTF-8 sem BOM; acentos conferidos exatamente (a suíte é a proteção contra o incidente H-11).
14. Os testes ficam **fora de `src/`** (o Vite só compila `src/` e `index.html`; o build e o deploy não os enxergam). Pasta sugerida: `testes/` na raiz, arquivos `*.test.js`. O script deve ser `node --test` **sem argumento de pasta** (ver risco R-6).

## 6. Filtro regra a regra

Perguntas: **(1)** existe no código de hoje? **(2)** erro nela afeta dado impresso no PDF que o cliente assina ou que vai à fábrica e passaria em silêncio? **(3)** dá para testar sem mexer em produção? **(4)** muda por card planejado?
Resultado da pergunta 1 para todas as regras vivas: **Sim**, conferido no código de `1a6022d`. Os três documentos NAO IMPLEMENTADO do inventário (venda futura, importação, design system) falham na 1 e ficam fora.

Legenda: **Sim** / **Não** / **Ind.** (indireto: o erro deixa passar uma resposta vazia que o PDF imprime como "—", ou altera o texto digitado que vai ao PDF).

### 6.1 Score e CCs

| Regra | 1 | 2 | 3 | 4 | Destino |
|---|---|---|---|---|---|
| S-01 G1 iluminação | Sim | Sim | Sim | — | T-S01, T-C01 |
| S-02 G2 sem reboco | Sim | Sim | Sim | — | T-S02, T-C02 |
| S-03 G3 revestimento (MÉDIO +4, CC ALTO) | Sim | Sim | Sim | — | T-S03, T-C03 |
| S-04 supressão G2→G3 | Sim | Sim | Sim | — | T-S04, T-S05, T-C04 |
| S-05 G4 pontos | Sim | Sim | Sim | — | T-S06, T-C05 |
| S-06 G5 rebaixo | Sim | Sim | Sim | — | T-S07, T-C06. O ramo "EM ?CM" (sem `cm`) **não entra**: a tela impede (`StepPerguntasGlobais.jsx:33-37`), logo o texto "?CM" nunca chega ao cliente; testá-lo só travaria uma rede de proteção |
| S-07 G5 desligado | Sim | Sim | Sim | — | T-S08 |
| S-08 granito | Sim | Sim | Sim | — | T-S09, T-S10, T-C07 |
| S-09 tanque tradicional | Sim | Sim | Sim | — | T-S11, T-C08 |
| S-10 tanque embutido | Sim | Sim | Sim | — | T-S12, T-C08 |
| S-11 TV dormitório | Sim | Sim | Sim | — | T-S13, T-C09 |
| S-12 TV Home/Outros | Sim | Sim | Sim | #133 (caso "eletrônicos Não" será acrescentado pelo card) | T-S14, T-S15, T-C09 |
| S-13 DIV-07 por ambiente | Sim | Sim | Sim | — | T-S16, T-C09 |
| S-14 eletros indefinidos (só cozinha) | Sim | Sim | Sim | — | T-S17, T-S19, T-C10 |
| S-15 eletrônicos indefinidos (só home) | Sim | Sim | Sim | — | T-S18, T-S19, T-C11 |
| S-16 rodapé ausente | Sim | Sim | Sim | — | T-S20, T-C12 |
| S-17 rodapé existente (só dormitório) | Sim | Sim | Sim | — | T-S21, T-C13 |
| S-18 cortineiro | Sim | Sim | Sim | — | T-S22, T-C14 |
| S-19 classificação (limiares 4 e 8) | Sim | Sim | Sim | — | T-S23, T-S24 |
| S-20 global = pior ambiente | Sim | Sim (capa do PDF) | Sim | — | T-S25 a T-S28 |
| S-21 sem ambientes | Sim | **Não**: o wizard não deixa chegar ao PDF sem ambiente (`StepAmbientes.jsx:21,93`) | Sim | — | T-S29. **Entra por ser barata e estável** (guarda contra erro de máximo em lista vazia) |
| S-22 escopo dos CCs | Sim | Sim (o PDF casa CC com ambiente por `escopo`, `pdf.js:349`; escopo errado some com todos os CCs do ambiente) | Sim | — | T-C15 |

### 6.2 PDF do Cliente

| Regra | 1 | 2 | 3 | 4 | Destino |
|---|---|---|---|---|---|
| P-01 nome do arquivo | Sim | Sim | Sim (com relógio controlado) | — | T-P01, T-P02 |
| P-02 capa | Sim | Sim | Sim | — | T-P03, T-P04, T-P05 |
| P-03 Resumo Executivo | Sim | Sim | Sim | corrigido em #132, `1a6022d` | T-P06, T-P07, T-P37 |
| P-04 rodapé existente no resumo | Sim | Sim | Sim | corrigido em #132, `1a6022d` (o caso "rodapé sozinho" agora **é** testado) | T-P08, T-P37 |
| P-05 globais dentro do ambiente | Sim | Sim | Sim | — | T-P09, T-P10 |
| P-06 G1/G5 sem CC (#107) | Sim | Sim (prova que o cliente negou) | Sim | — | T-P11 a T-P15 |
| P-07 risco por ambiente | Sim | Sim | Sim | — | T-P10, T-P16 |
| P-08 tanque no PDF | Sim | Sim | Sim | — | T-P17, T-P18 |
| P-09 ordem dos eletros (#110) | Sim | Sim (vão errado na fábrica) | Sim | — | T-P19, T-P20, T-P21 |
| P-10 tabela de eletros | Sim | Sim | Sim | — | T-P22, T-P23 |
| P-11 tabela de eletrônicos | Sim | Sim | Sim | — | T-P24, T-P25 |
| P-12 ponto da TV na Sala (#85) | Sim | Sim | Sim | corrigido em #131, `1a6022d` (Outros agora imprime; testado) | T-P26, T-P27 |
| P-13 TV do dormitório | Sim | Sim | Sim | — | T-P28, T-P29 |
| P-14 cama | Sim | Sim | Sim | — | T-P30, T-P31 |
| P-15 cuba | Sim | Sim | Sim | — | T-P32 |
| P-16 observações | Sim | Sim | Sim | — | T-P33 |
| (lacuna do inventário) CC de granito, eletros, eletrônicos, rodapé e cortineiro impressos sob a pergunta certa | Sim (`pdf.js:378,462,511,447,454`) | **Sim**: se o vínculo se perder, o CC some do documento assinado sem aviso | Sim | — | T-P34, T-P35, T-P36 |

### 6.3 Validação, compartilhado e Projetista

| Regra | 1 | 2 | 3 | 4 | Destino |
|---|---|---|---|---|---|
| F-01 obrigatórias por formType | Sim | Ind. | Sim | — | T-F01 a T-F06 |
| F-02 tanque | Sim | Ind. | Sim | — | T-F07 |
| F-03 eletros sem lista | Sim | Ind. | Sim | — | T-F08 |
| F-04 medidas | Sim | Ind. (medida vazia vira "—" no PDF) | Sim | — | T-F09 |
| F-05 depurador embutido | Sim | Ind. | Sim | — | T-F10 |
| F-06 subtipo | Sim | Ind. | Sim | — | T-F11 |
| F-07 Outros (eletro) | Sim | Ind. | Sim | — | T-F12 |
| F-08 TV | Sim | Ind. | Sim | #133 (parte Home/Outros; entradas já usam "eletrônicos Sim") | T-F13, T-F14 |
| F-09 cama e cuba | Sim | Ind. | Sim | — | T-F15 |
| F-10 `limitarCm` | Sim | Sim (formata a medida que vai ao PDF) | Sim | — | T-F16 |
| C-01 `formatarNomeAmbiente` | Sim | Sim (nome em todo o PDF) | Sim | — | T-A01, T-A02 |
| C-02 catálogo de ambientes | Sim | Sim (formType define quais perguntas o cliente vê) | Sim | — | T-A03 |
| V-01 grupo por ambiente | Sim | Sim | Sim | — | T-V01, T-V02 |
| V-02 a V-04 perguntas e ordem | Sim | Sim (vai à fábrica) | Sim | — | T-V03 a T-V05 |
| V-05 formatação da resposta | Sim | Sim | Sim | — | T-V06 |
| V-06 capa (contratos) | Sim | Sim | Sim | — | T-V07, T-V08 |
| V-07 nome do arquivo | Sim | Sim | Sim | — | T-V08, T-V09 |
| V-08 observações | Sim | Sim | Sim | — | T-V10 |
| `buscarCep`, ramo "CEP inválido" (`cep.js:8`) | Sim | **Não**: só afeta o preenchimento automático; o PDF imprime o que foi digitado | Sim (não usa rede) | — | **Não entra.** Falha na 2 e testá-lo exigiria um `fetch` falso que falhe se for chamado, para valer 1 caso. Reversível: se Everton quiser, vira o caso T-A04 |
| Reducers de `FormProvider*.jsx`, validações de identificação e do Projetista em `.jsx`, limpeza de Sim/Não nos blocos | Sim | Sim | **Não** (dentro de componente, não exportado) | #99 e #121 podem exportar/unificar | **Lista N** |
| K-01 | Sim | Sim | — | #133 (aberto) | **Lista K** (sem teste) |
| K-02, K-03 | Sim | Sim | Sim | corrigidos em #131/#132, `1a6022d` | **Entram**: T-P27 e T-P37 |
| K-04 | Sim | Não (sem efeito no PDF) | Não (reducer em `.jsx`) | corrigido em #135, `1a6022d` | **Lista N** |

## 7. Grupos de teste

Convenção: o **ID do caso** é `T-<grupo><número>` (ex.: T-S03). A coluna "Regra" usa o ID do inventário. Cada caso é um cenário próprio; o Spec pode juntar verificações dentro do mesmo caso, mas não pode retirar nenhuma. "Resultado" é o que o teste escreve por extenso. Nos casos de PDF, "textos" são os textos gravados em ordem de aparição, com as linhas quebradas pelo próprio PDF reunidas antes de comparar.

| Grupo | Conteúdo | Casos |
|---|---|---|
| S | Score (`calcularScore`): pontos, gatilhos, classificação | 29 |
| C | CCs e avisos (`construirCCs`): tipo, nível, escopo, origem, texto completo | 16 |
| A | Ambientes compartilhados (`formatarNomeAmbiente`, catálogo) | 3 |
| F | Validação por ambiente e `limitarCm` | 16 |
| P | PDF do Cliente | 37 |
| V | PDF do Projetista e grupos | 10 |
| H | Prova dos consertos (procedimento, não são casos novos; seção 8) | 8 provas |
| | **Total de casos novos** | **111** |

Nos grupos S e C, a entrada de cada caso parte do `estadoInicial` completo e dos `defaultsPorFormType`; o grupo C usa como entrada a saída real de `calcularScore`, igual ao PDF (`pdf.js:93-94`). Nomes de campo seguem o código (ver armadilha G4/G5 na seção 3). Abreviações: "dorm." = formType dormitório; ambientes de exemplo `cozinha-0`, `dormitorio_casal-0`, `home-0`, `outros-0`, `banheiro-0`.

### 7.1 Grupo S — Score

| Caso | Regra | Entrada | Resultado esperado |
|---|---|---|---|
| T-S01 | S-01 | Cozinha em `g1_ambientes` | 2 pts, gatilhos só o de iluminação, classificação BAIXO (2 < 4); global igual ao ambiente |
| T-S02 | S-02 | Cozinha em `g2_ambientesSemReboco` | 0 pts, classificação ALTO, `isAlto` verdadeiro |
| T-S03 | S-03, H-02 | Cozinha só em `g3_ambientesSemRevestimento` | 4 pts, **MÉDIO**, `isAlto` falso (intencional, decisão 3) |
| T-S04 | S-04 | Cozinha em G2 **e** em G3 | só o gatilho de reboco; 0 pts, ALTO; nenhum gatilho de revestimento |
| T-S05 | S-04, H-10 | Cozinha em G2; Dormitório só em G3 | Cozinha como T-S04; Dormitório 4 pts, MÉDIO, com gatilho de revestimento |
| T-S06 | S-05 | Dormitório em `g3_ambientesPendentes` | 2 pts, gatilho de pontos indefinidos |
| T-S07 | S-06 | `g4_temRebaixo` verdadeiro; `g4_ambientes` com Cozinha e `cm` "12" | Cozinha 1 pt, gatilho de rebaixo; outro ambiente fora da lista: 0 |
| T-S08 | S-07 | `g4_temRebaixo` falso, `g4_ambientes` preenchida com Cozinha | nenhum gatilho de rebaixo, 0 pts |
| T-S09 | S-08 | `granito` verdadeiro e `granitoadaptar` falso em Cozinha, Banheiro e Outros (um caso por formType dentro do mesmo teste) | cada um: 2 pts, gatilho de granito |
| T-S10 | S-08 | mesmo, com `granitoadaptar` verdadeiro | nenhum gatilho, 0 pts |
| T-S11 | S-09 | Cozinha e Outros: `tanque` verdadeiro, `tanqueEmbutido` falso, `tanqueMoveis` verdadeiro | cada um: 2 pts, gatilho de tanque |
| T-S12 | S-10, H-07 | Cozinha: `tanque` verdadeiro, `tanqueEmbutido` verdadeiro, `tanqueMoveis` verdadeiro (sobra) | nenhum gatilho de tanque, 0 pts |
| T-S13 | S-11 | Dorm.: `tv` verdadeiro, `tvPontoFinal` falso | 2 pts, gatilho de ponto de TV. Com `tvPontoFinal` verdadeiro: nenhum gatilho |
| T-S14 | S-12, H-03 | Home: `eletronicos` verdadeiro, lista com uma TV, `tvPontoFinal` falso, `tv` nulo | 2 pts, gatilho de ponto de TV. Com `tvPontoFinal` verdadeiro: nenhum gatilho |
| T-S15 | S-12, H-04 | Outros: mesma entrada de T-S14 | 2 pts, gatilho de ponto de TV |
| T-S16 | S-13, H-08 | Dorm. 0 em `g3_ambientesPendentes` com TV e ponto "Não"; Dorm. 1 com TV e ponto "Não", fora da lista | Dorm. 0: gatilho de TV existe e vale 0 (total 2 = só pontos indefinidos). Dorm. 1: TV vale 2 (total 2) |
| T-S17 | S-14 | Cozinha com `eletrosDefined` falso | 1 pt, gatilho de eletros indefinidos |
| T-S18 | S-15 | Home com `eletronicos` falso e lista vazia | 1 pt, gatilho de eletrônicos indefinidos |
| T-S19 | S-14, S-15, H-05 | Outros com `eletrosDefined` falso e `eletronicos` falso | nenhum gatilho, 0 pts |
| T-S20 | S-16 | Dorm., Home e Outros com `rodape` falso | cada um: 1 pt, gatilho de rodapé ausente |
| T-S21 | S-17, H-06 | Dorm. com `rodape` verdadeiro; Home e Outros com `rodape` verdadeiro | nenhum gatilho e 0 pts nos três |
| T-S22 | S-18 | Dorm., Home e Outros: `cortineiro` verdadeiro, `cortieneiroInstalado` falso (nome do campo com a grafia do código) | cada um: 1 pt, gatilho de cortineiro. Com instalado verdadeiro: nenhum |
| T-S23 | S-19 | Outros com G1 + rodapé ausente (3 pts) / Cozinha só em G3 (4 pts) | 3 pts = BAIXO; 4 pts = MÉDIO |
| T-S24 | S-19 | Outros com G1 + G4 + granito retirar + rodapé ausente (7 pts) / acrescentando tanque (9 pts) ou trocando rodapé por tanque (8 pts) | 7 = MÉDIO; 8 = **ALTO** com `isAlto` falso |
| T-S25 | S-20 | A: 7 pts (MÉDIO); B: reboco (0 pts, ALTO) | global ALTO, 0 pts |
| T-S26 | S-20, H-01 | Outros: G1 + G4 + granito + tanque + rodapé ausente (9 pts); Home: G1 + eletrônicos indefinidos + rodapé ausente + cortineiro (5 pts) | global **ALTO, 9 pts** (antes do conserto saía MÉDIO 5) |
| T-S27 | S-20 | Cozinha só em G3 (4 pts, MÉDIO); Outros com G1 + G4 + rodapé ausente + cortineiro (6 pts, MÉDIO) | global MÉDIO, 6 pts |
| T-S28 | S-20 | Dois ambientes BAIXO com 1 e 3 pts | global BAIXO, 3 pts |
| T-S29 | S-21 | lista de ambientes vazia | global BAIXO, 0 pts, `isAlto` falso, sem gatilhos |

Valores de T-S16, T-S26 e T-S03 foram conferidos rodando a função real nesta pesquisa (T-S16: 2 e 2; T-S26: ALTO 9 e MÉDIO 5; T-S03: MÉDIO 4). Os de T-S24 e T-S27 decorrem da soma das tabelas do inventário (G1 2, G4 2, granito 2, tanque 2, rodapé 1, cortineiro 1); o Spec deve rodar cada um uma vez ao escrever o teste e anotar se algum diferir.

### 7.2 Grupo C — CCs e avisos

Em todos: `tipo`, `nivel` (com acento: "MÉDIO"), `escopo` = `instanceId` do ambiente, `perguntaOrigem` **apenas** para G1 a G5 (as demais origens, como "P2.1", não são usadas pelo PDF e não são travadas) e o **texto completo**, transcrito do código de hoje.

| Caso | Regra | Entrada | Resultado esperado |
|---|---|---|---|
| T-C01 | S-01 | Cozinha em G1 | um CC, MÉDIO, origem G1, texto de `ccBuilder.js:44` completo |
| T-C02 | S-02 | Cozinha em G2 | um CC, ALTO, origem G2, texto de `ccBuilder.js:56` |
| T-C03 | S-03, H-02 | Cozinha só em G3 | um CC, **ALTO** (mesmo com ambiente MÉDIO), origem G3, texto de `checklistTextos.js:25-26` |
| T-C04 | S-04, H-10 | Cozinha em G2 e G3; Dormitório só em G3 | Cozinha: só o CC de reboco; Dormitório: CC de revestimento com o texto próprio (não o do reboco) |
| T-C05 | S-05 | Dormitório em `g3_ambientesPendentes` | um CC, MÉDIO, origem G4, texto de `ccBuilder.js:79` |
| T-C06 | S-06 | Rebaixo na Cozinha com `cm` "12" | um CC, BAIXO, origem G5, texto contendo "REBAIXO DE TETO EM 12CM" (texto completo de `ccBuilder.js:92` com 12 no lugar da medida) |
| T-C07 | S-08 | Cozinha com granito retirar | um CC, MÉDIO, texto de `checklistTextos.js:1-2`. Com adaptar verdadeiro: nenhum CC |
| T-C08 | S-09, S-10, H-07 | Cozinha com tanque tradicional e móveis / Cozinha com tanque embutido e `tanqueMoveis` verdadeiro | tradicional: um CC MÉDIO, texto de `checklistTextos.js:4-5`; embutido: nenhum CC |
| T-C09 | S-11, S-12, S-13 | TV com ponto "Não" em Dorm., Home e Outros; Dorm. também em `g3_ambientesPendentes` | cada um: um CC MÉDIO com texto de `checklistTextos.js:13-14`; no Dorm. em G4 o CC **continua existindo** (só os pontos zeram) |
| T-C10 | S-14 | Cozinha com `eletrosDefined` falso | um CC, BAIXO, texto de `checklistTextos.js:7-8` |
| T-C11 | S-15 | Home com `eletronicos` falso | um CC, BAIXO, texto de `checklistTextos.js:10-11` |
| T-C12 | S-16 | Home com `rodape` falso | um CC, BAIXO, texto de `checklistTextos.js:19-20` |
| T-C13 | S-17, H-06 | Dorm., Home e Outros com `rodape` verdadeiro | só o Dorm. recebe um **AVISO** com nível nulo e texto de `checklistTextos.js:22-23`; Home e Outros: nenhum |
| T-C14 | S-18, H-22 | Dorm. com cortineiro não instalado | um **AVISO**, nível BAIXO, texto de `checklistTextos.js:16-17` (contém "APROXIMADAMENTE 150MM") |
| T-C15 | S-22, H-09 | Cozinha em G1 e Dormitório sem nada; mais um CC em cada | todos os CCs com `escopo` igual ao `instanceId` do seu ambiente; nenhum com escopo "Global"; o Dormitório não recebe o CC de G1 |
| T-C16 | — | estado limpo, sem gatilhos | lista de CCs vazia |

### 7.3 Grupo A — Ambientes compartilhados

| Caso | Regra | Entrada | Resultado esperado |
|---|---|---|---|
| T-A01 | C-01 | rótulo "Dormitório Casal", nome " Suíte " | "Dormitório Casal — Suíte" |
| T-A02 | C-01 | mesmo rótulo com nome vazio, e com nome só de espaços | "Dormitório Casal" nos dois |
| T-A03 | C-02 | catálogo completo | 8 ambientes, escritos por extenso (id, rótulo, formType): cozinha, dormitorio_casal, dormitorio_solteiro, banheiro, home, office, varanda, outros; **Varanda → cozinha, Office → home, Dormitório Solteiro → dormitorio** |

### 7.4 Grupo F — Validação por ambiente

Valor esperado = chave do erro + mensagem, por extenso. Os testes conferem as chaves citadas; nos casos F01 a F05 conferem o conjunto **exato** de chaves.

| Caso | Regra | Entrada | Resultado esperado |
|---|---|---|---|
| T-F01 | F-01 | Cozinha, só com os defaults | erros exatamente em: granito, tanque, eletrosDefined; todos "Selecione uma opção" |
| T-F02 | F-01 | Dormitório, defaults | tv, cortineiro, rodape ("Selecione uma opção"); tamanhoCama ("Selecione o tamanho da cama") |
| T-F03 | F-01 | Home, defaults | cortineiro, rodape, eletronicos |
| T-F04 | F-01, F-09 | Banheiro, defaults | granito ("Selecione uma opção"); cuba ("Selecione o tipo de cuba") |
| T-F05 | F-01 | Outros, defaults | granito, tanque, eletrosDefined, cortineiro, rodape, eletronicos |
| T-F06 | F-01 | Cozinha completa (granito Não, tanque Não, eletros Não) e Dormitório completo (tv Não, cortineiro Não, rodapé Não, cama Padrão) | nenhum erro nos dois (guarda contra bloqueio indevido do cliente) |
| T-F07 | F-02 | Cozinha com `tanque` verdadeiro: (a) tipo nulo; (b) tradicional sem `tanqueMoveis`; (c) embutido sem `tanqueMoveis` | (a) erro em `tanqueEmbutido`; (b) erro em `tanqueMoveis`; (c) nenhum erro de tanque |
| T-F08 | F-03 | Cozinha com `eletrosDefined` verdadeiro e lista vazia; Home com `eletronicos` verdadeiro e lista vazia | "Adicione ao menos um eletro"; "Adicione ao menos um eletrônico" |
| T-F09 | F-04 | Eletro sem largura, altura e profundidade; segundo eletro completo; Home Theater sem medidas | "Obrigatório" em `eletro_0_largura`, `eletro_0_altura`, `eletro_0_prof`; nada para o índice 1; idem `eletronico_0_*` |
| T-F10 | F-05 | Depurador "Embutido" sem modelo e sem link; Depurador "Normal" sem os dois | Embutido: "Obrigatório para Depurador Embutido" em `eletro_0_modelo` e `eletro_0_link`; Normal: nenhum desses erros |
| T-F11 | F-06 | Fogão sem subtipo; Cooktop sem subtipo; Refrigerador com subtipo só de espaços | Fogão: "Obrigatório" em `eletro_0_subtipo`; Cooktop: nenhum erro; Refrigerador: "Obrigatório" |
| T-F12 | F-07 | eletro tipo "Outros" sem descrição / com descrição | "Descreva qual eletro é" em `eletro_0_descricao` / nenhum |
| T-F13 | F-08 | Home e Outros: `eletronicos` verdadeiro, lista com TV, (a) `tvPontoFinal` nulo; (b) polegadas vazias | (a) `tvPontoFinal` "Selecione uma opção"; (b) `eletronico_0_polegadas` "Obrigatório" |
| T-F14 | F-08 | Dormitório com `tv` verdadeiro: (a) `tvPontoFinal` nulo; (b) `tv_polegadas` vazio | (a) `tvPontoFinal` "Selecione uma opção"; (b) `tv_polegadas` "Obrigatório" |
| T-F15 | F-09 | Dormitório sem cama; Dormitório e Outros com cama "outro" sem largura/comprimento; Banheiro com cuba só de espaços | `tamanhoCama` "Selecione o tamanho da cama"; `camaLargura_cm` e `camaComprimento_cm` "Obrigatório"; `cuba` "Selecione o tipo de cuba" |
| T-F16 | F-10 | `"1385.57"`; `"12a,3"`; `"12"`; `"1234"`; nulo | `"138,5"`; `"12,3"`; `"12"`; `"123"`; vazio |

### 7.5 Grupo P — PDF do Cliente

Todos com a identificação fictícia e relógio fixo em 19/10/2026, salvo indicação. Entradas de tabela citam o cabeçalho **exato** `Tipo / Modelo / Largura (cm) / Altura (cm) / Prof. (cm) / Link`.

| Caso | Regra | Entrada | Resultado esperado |
|---|---|---|---|
| T-P01 | P-01 | contrato TA9001, 19/10/2026 | uma chamada de `save` com `Checklist_Cliente_TA9001_2026-10-19.pdf` |
| T-P02 | P-01 | contrato TA9001, relógio em 05/03/2026 | `Checklist_Cliente_TA9001_2026-03-05.pdf` e "Data: 05/03/2026" na capa |
| T-P03 | P-02, H-12 | identificação completa: logradouro, número, complemento "Fundos", bairro, cidade, UF, CEP "01001-000", telefone; um ambiente sem gatilho | textos na ordem: "Cliente: …", "Contrato: TA9001", "{logradouro}, {número} — Fundos", "{bairro} — {cidade}/{UF}", "CEP: 01001-000", "Telefone: …", "Data: 19/10/2026", "Classificação de risco global:", "RISCO BAIXO" (sem pontos) |
| T-P04 | P-02, H-12 | mesma identificação (logradouro "Rua Ficticia", número "100", bairro "Bairro Ficticio", cidade "Cidade Ficticia", UF "SP") sem CEP, sem telefone e sem complemento | linha 1: "Rua Ficticia, 100" (perde só o " — Fundos"); linha 2 **continua** "Bairro Ficticio — Cidade Ficticia/SP" (`pdf.js:126-127`); **nenhuma** linha "CEP:" nem "Telefone:"; "Data:" presente |
| T-P05 | P-02, H-01 | cenário de T-S26 (Outros 9 pts, Home 5 pts) | capa com "RISCO ALTO", sem "(… pts)" |
| T-P06 | P-03 | Cozinha com G1 + granito retirar + eletros indefinidos (5 pts); Dormitório "Suíte" com rebaixo de 12 cm + cortineiro não instalado (2 pts); Banheiro sem gatilho | tabela com cabeçalho `Ambiente / Ações e pontos de atenção / Risco`; duas linhas, nessa ordem: "Cozinha / Área de Serviço" · "Iluminação por conta do cliente — Remover granito — Eletros indefinidos" · "MÉDIO"; "Dormitório Casal — Suíte" · "Rebaixo de 12cm — Cortineiro 150mm" · "BAIXO"; o Banheiro **não** aparece |
| T-P07 | P-03 | todos os ambientes sem gatilho **e sem** dormitório com `rodape` verdadeiro (rodapé existente entra no resumo, ver T-P37) | título "Resumo Executivo" sem nenhuma tabela de resumo |
| T-P08 | P-04 | Dormitório com `rodape` verdadeiro **e** cortineiro não instalado | linha do resumo "Cortineiro 150mm — Roupeiro sobre rodapé" · "BAIXO" |
| T-P09 | P-05 | Cozinha em G1, G2, G4 e G5 (`cm` "12"); G3 vazio | na seção da Cozinha, nesta ordem, cada uma com pergunta, resposta e CC logo abaixo: G1 "Resposta: Sim"; G2 "Resposta: Não"; G4 "Resposta: Não"; G5 "Resposta: Sim — 12 cm"; cada CC com o prefixo "CC: " e trecho que o identifica (iluminação, reboco, pontos, "REBAIXO DE TETO EM 12CM"); G3 não aparece; "RISCO ALTO (5 pts)" |
| T-P10 | P-05, P-07 | Dormitório só em G3 | pergunta G3, "Resposta: Não", CC de revestimento ("CC: CLIENTE CIENTE E DE ACORDO QUE A MEDIÇÃO TÉCNICA FOI REALIZADA SEM O REVESTIMENTO FINAL…"); cabeçalho "RISCO MÉDIO (4 pts)" |
| T-P11 | P-06, H-18 | `g1_temIluminacaoExterna` falso, lista vazia; dois ambientes | em **cada** ambiente: pergunta G1 com "Resposta: Não" e **sem** linha de CC; G5 (nula) não aparece |
| T-P12 | P-06, H-18 | `g4_temRebaixo` falso com opção "Já rebaixado"; dois ambientes | em cada ambiente: pergunta G5 com "Resposta: Não", sem CC; G1 (nula) não aparece |
| T-P13 | P-06, H-18 | rebaixo "Sim" só na Cozinha (10 cm) | Cozinha: G5 "Sim — 10 cm" + CC "EM 10CM"; Dormitório: G5 "Resposta: Não", sem CC |
| T-P14 | P-06, H-19 | G1 "Sim" só na Cozinha | Cozinha: G1 "Resposta: **Sim**" + CC (nunca "Não" ao lado do CC); Dormitório: G1 "Resposta: Não", sem CC |
| T-P15 | P-06 | G1 e G5 nulos; G2, G3 e G4 respondidos sem nenhum ambiente marcado | nenhuma das cinco perguntas G1 a G5 aparece em nenhum ambiente |
| T-P16 | P-07 | Dormitório em G2 (reboco); Banheiro sem gatilho | cabeçalhos "RISCO ALTO (0 pts)" e "RISCO BAIXO (0 pts)" |
| T-P17 | P-08 | Cozinha: tanque Sim, tradicional, móveis Sim | "Existe tanque no local?" Sim; "Qual o tipo de tanque?" "Tanque tradicional"; "Haverá móveis na região do tanque?" Sim, com o CC do tanque abaixo |
| T-P18 | P-08, H-17 | Cozinha: tanque Sim, embutido, `tanqueMoveis` verdadeiro (sobra) | "Qual o tipo de tanque?" "Embutido na bancada"; **nenhuma** pergunta de móveis; nenhum CC de tanque; o ambiente não tem gatilho, então **não há tabela de resumo** e "Remover tanque" não aparece em lugar nenhum (é isto que fica vermelho se o conserto H-07 for desfeito) |
| T-P19 | P-09, H-20 | eletros cadastrados: Lava-louça (Piso), Forno (Normal), Cooktop, Refrigerador (Duplex) | linhas da tabela, nesta ordem, coluna Tipo: "Cooktop", "Refrigerador — Duplex", "Forno — Normal", "Lava-louça — Piso" |
| T-P20 | P-09 | cadastro: Coifa (Parede), Depurador (Normal), Lava-roupa (Abertura Frontal), Fogão (Piso) | "Fogão — Piso", "Depurador — Normal", "Coifa — Parede", "Lava-roupa — Abertura Frontal" (prioritários primeiro; demais na ordem de cadastro) |
| T-P21 | P-09, H-21 | Forno com link A cadastrado antes do Cooktop com link B (links em `.invalid`); cópia da entrada tirada antes de gerar | linhas: Cooktop, Forno; links gravados na ordem [B, A] (cada "Ver link" na linha do seu eletro); a entrada, depois da geração, é **idêntica** à cópia (lista não reordenada) |
| T-P22 | P-10 | eletros: um "Outros" com descrição "Adega" e sem modelo, sem link, medidas "60", "85", "138,5"; um Lava-roupa "Abertura Frontal" com modelo "MOD-9001" e link | Tipo "Outros — Adega" · Modelo "—" · "60" · "85" · "138,5" · Link "—"; Tipo "Lava-roupa — Abertura Frontal" · "MOD-9001" · … · Link "Ver link"; cabeçalho exato; subtítulo "Eletrodomésticos" |
| T-P23 | P-10 | Cozinha com `eletrosDefined` falso e lista residual preenchida | pergunta "Não" + CC de eletros indefinidos; **sem** subtítulo "Eletrodomésticos" e sem tabela |
| T-P24 | P-11, H-14 | Home, `eletronicos` verdadeiro: TV 55" modelo "TV-9001" com link; Home Theater sem modelo | Tipo `TV — 55"` · Modelo "TV-9001" · Link "Ver link"; Tipo "Home Theater" · Modelo "—"; polegadas só na TV; subtítulo "Eletrônicos" |
| T-P25 | P-11 | Home com `eletronicos` falso e lista residual **sem TV** (um Videogame) | pergunta "Não" + CC de eletrônicos indefinidos; sem subtítulo "Eletrônicos" e sem tabela (a lista residual com TV é o K-01 e não entra) |
| T-P26 | P-12, H-15, H-16 | Home, `eletronicos` verdadeiro, lista com TV, ponto "Não" | pergunta "Possui ou pretende adquirir eletrônicos…?" Sim; depois "O ponto elétrico da TV já está na posição final?" "Resposta: Não" com o CC de TV abaixo; depois a tabela; a pergunta "Terá TV neste ambiente?" **não** aparece |
| T-P27 | P-12, H-15, K-02 | (a) Outros com `eletronicos` verdadeiro, lista com TV, ponto "Não"; (b) Outros com `eletronicos` verdadeiro e lista sem TV (um Videogame); (c) Home com lista sem TV | (a) "O ponto elétrico da TV já está na posição final?" "Resposta: Não" com o CC de TV abaixo (`pdf.js:515`, condição sem restrição a Home, dentro do bloco `pdf.js:507`); (b) e (c) pergunta do ponto da TV **ausente**; em Home e Outros "Terá TV neste ambiente?" ausente |
| T-P28 | P-13, H-13 | Dorm.: TV Sim, ponto "Não", polegadas "50", modelo, largura, altura, profundidade e link preenchidos | em ordem: "Terá TV neste ambiente?" Sim; ponto "Não" + CC; "Polegadas" 50; "Modelo"; "Largura (cm)"; "Altura (cm)"; "Profundidade (cm)"; "Link" com "Ver link" (nunca a URL crua); um link gravado com a URL de entrada |
| T-P29 | P-13 | Dorm.: TV Sim, ponto "Sim", só polegadas | "Polegadas" presente; Modelo, Largura, Altura, Profundidade e Link **ausentes**; nenhum CC de TV |
| T-P30 | P-14, H-13 | Dorm. com cama solteiro, padrao, queen e king (um PDF cada, no mesmo teste) | "Solteiro (0,88 × 1,88 m)"; "Padrão (1,38 × 1,88 m)"; "Queen (1,58 × 1,98 m)"; "King (2,00 × 2,03 m)" |
| T-P31 | P-14 | Dorm. com cama "outro", largura "200", comprimento "210" | "Resposta: Outro"; "Largura (cm)" 200; "Comprimento (cm)" 210 |
| T-P32 | P-15 | Banheiro com cuba "Sobrepor" e com cuba nula; Outros com cuba nula e com "Apoio" | Banheiro: "Tipo de cuba" "Sobrepor" / "—"; Outros: pergunta ausente / presente com "Apoio" |
| T-P33 | P-16 | observações "TESTE de observação" e observações vazias | "Observações" com o texto / pergunta ausente |
| T-P34 | lacuna | Cozinha: granito Sim, adaptar Não; `eletrosDefined` falso | "Os móveis serão adaptados?" "Não" com o CC de granito abaixo; "Já possui ou tem intenção de compra específica dos eletrodomésticos?" "Não" com o CC de eletros abaixo |
| T-P35 | lacuna | Dorm.: cortineiro Sim e não instalado; rodapé Sim | "O cortineiro já está instalado?" "Não" com o aviso de 150MM abaixo; "Existe rodapé na região dos móveis?" "Sim" com o aviso do roupeiro abaixo; os dois avisos **sem** o prefixo "CC: " |
| T-P36 | lacuna | Home: rodapé Não; `eletronicos` falso | "Existe rodapé…?" "Não" com o CC de rodapé abaixo (com prefixo "CC: "); "Possui ou pretende adquirir eletrônicos…?" "Não" com o CC de eletrônicos abaixo |
| T-P37 | P-03, P-04, K-03 | Dormitório com `rodape` verdadeiro e **nenhum outro gatilho** (sem cortineiro, sem G1-G5, sem TV) | Resumo Executivo com tabela de uma linha: "Dormitório Casal" · "Roupeiro sobre rodapé" · "BAIXO" (`pdf.js:240-245`); na checklist, "RISCO BAIXO (0 pts)" e o aviso do roupeiro sob "Existe rodapé na região dos móveis?" |

Os casos T-P34 a T-P36 não estão no inventário (e T-P37 vem da correção K-03): nascem do critério 2 (CC que some do documento assinado). Se Everton preferir enxugar, são os primeiros a sair.

### 7.6 Grupo V — PDF do Projetista

A instância do Projetista usa o campo `tipo` (`pdfVendedor.js:114`; formato em `schemaVendedor.js:38`). Parte de `estadoInicialVendedor` e `defaultsPorGrupo`. Contratos fictícios `TA9xxx`/`SM9xxx`.

| Caso | Regra | Entrada | Resultado esperado |
|---|---|---|---|
| T-V01 | V-01 | `obterGrupo` com cozinha, varanda, banheiro, outros / dormitorio_casal, dormitorio_solteiro / home, office | A, A, A, A / B, B / C, C |
| T-V02 | V-01 | `obterGrupo` com id que não existe ("ambiente_inexistente") | A |
| T-V03 | V-02 | PDF com ambiente do grupo A | perguntas na ordem: "Altura do piso — balcões", "Altura do piso — armários", "Fechamento até o teto", "Caixarias ou corpos", "Dobradiças", "Corrediças" |
| T-V04 | V-03 | PDF com ambiente do grupo B (dormitório) | "Caixarias ou corpos", "Dobradiças", "Corrediças", "Fechamento até o teto" (**por último**); sem perguntas de altura |
| T-V05 | V-04 | PDF com ambiente do grupo C (home) | "Caixarias ou corpos", "Dobradiças", "Corrediças"; sem altura e sem fechamento |
| T-V06 | V-05 | grupo A: altura de balcão 850, altura de armário "não se aplica", fechamento "NAO", caixaria nula, dobradiças "Amortecimento"; segundo PDF com fechamento "SIM" | "Resposta: 850 mm"; "Resposta: Não se aplica"; "Resposta: NÃO"; "Resposta: —"; "Resposta: Amortecimento"; segundo PDF: "Resposta: SIM" |
| T-V07 | V-06 | contratos ["TA9001", "", "SM9002"], nome fictício | capa: "Cliente: …", "Contrato(s): TA9001, SM9002", "Data: 19/10/2026" |
| T-V08 | V-06, V-07 | contratos [""] (todos vazios) | capa "Contrato(s): —"; arquivo `Checklist_Projetista_SEMCONTRATO_2026-10-19.pdf` (acréscimo ao inventário: `pdfVendedor.js:80,145`) |
| T-V09 | V-07 | contratos ["TA9001", "", "SM9002"]; e ["", "SM9002", "TA9001"] | `Checklist_Projetista_TA9001_2026-10-19.pdf`; `Checklist_Projetista_SM9002_2026-10-19.pdf` (primeiro **preenchido**) |
| T-V10 | V-08 | observações preenchidas / vazias | "Observações do ambiente" com o texto / ausente |

As regras do Projetista que só existem em `.jsx` (obrigatoriedade por grupo, altura maior que zero, regex de contrato, primeiro contrato não removível) estão na lista N.

## 8. Prova dos consertos (grupo H)

**Para que serve:** garantir que o teste não passa "sempre". Em uma **cópia da árvore, numa pasta temporária fora do repositório**, desfaz-se só aquele conserto, roda-se a suíte e confere-se que os casos indicados ficam **vermelhos**. A cópia é descartada. O repositório não é alterado. Se nenhum caso ficar vermelho, o teste não protege e deve ser corrigido antes de aceitar o ciclo. O resultado de cada prova é registrado no Spec (seção "Desvios" ou relatório de execução).

**Como desfazer:** em cópia fora do repositório, desfazer **somente o trecho do conserto sobre o código atual**, com a mudança mínima indicada na tabela abaixo. **Não** restaurar o arquivo do commit pai: o pai de `934e18c`, `c50efc4` e `0aa8d85` é anterior a `e039db7` e ainda tem score global somado e gatilhos G1-G4 globais (`git show e039db7 -- src/domain/scoreEngine.js` remove `GATILHOS_DEF` e o bloco "Gatilhos globais"; conferido: `e039db7` não é ancestral de `934e18c`). Restaurar esses arquivos derrubaria dezenas de casos por outro motivo e a prova passaria mesmo com teste inútil. **Critério:** ficam vermelhos os casos listados; outros vermelhos só são aceitos se explicados no relatório de execução. Linhas de `scoreEngine.js` conferidas em `1a6022d` (o commit não toca esse arquivo).

**Lista proposta** — consertos que mexem em dado **impresso** de score ou CC. Os seis primeiros o inventário já **rodou** nas duas versões; H-23 e H-24 são acrescentados por este PRD (commit `1a6022d`, diff conhecido, reversão de uma linha):

| Prova | Commit | Conserto desfeito | Casos que devem ficar vermelhos |
|---|---|---|---|
| H-01 | `30f05c4` | `scoreEngine.js:145` volta a `ambientesValues.filter((s) => s.isAlto)` (diff de `30f05c4`: troca `s.isAlto` por `s.classificacao === 'ALTO'`) | T-S26, T-P05 |
| H-02 | `6dbd195` | `scoreEngine.js:39` volta a `nivel: 'Alto', pontos: 3` (diff de `6dbd195`) | T-S03, T-P10 (cabeçalho "MÉDIO (4 pts)") |
| H-03 | `934e18c` | Home sai do bloco da lista de eletrônicos (`scoreEngine.js:85`, que fica só com Outros) e entra no bloco de `resp.tv === true` (`scoreEngine.js:77`, que passa a valer para Dormitório e Home), como antes de `934e18c` | T-S14, T-C09, T-P26 |
| H-04 | `c50efc4` | idem para Outros: sai do bloco `scoreEngine.js:85` (que fica só com Home) e entra no bloco `scoreEngine.js:77` (Dormitório e Outros), como antes de `c50efc4` | T-S15, T-C09 |
| H-07 | `0aa8d85` | remover `resp.tanqueEmbutido === false &&` de `scoreEngine.js:67` (diff de `0aa8d85`) | T-S12, T-C08, T-P18 |
| H-08 | `e039db7` | `scoreEngine.js:74` vira `const div07Ativo = g3_ambientesPendentes.length > 0` (comportamento global de antes de `e039db7`) | T-S16 |
| H-23 | `1a6022d` (card #131) | `pdf.js:515` volta a `if (formType === 'home' && resp.eletronicosList.some((e) => e.tipo === 'TV')) {` | T-P27 (a) |
| H-24 | `1a6022d` (card #132) | `pdf.js:240-245`: o filtro volta a só devolver `score && score.gatilhos.length > 0` (sem a alternativa do aviso de rodapé) | T-P37 |

**Por que H-23 e H-24 entram:** o critério é dado impresso de CC no documento assinado. H-23 é o CC de TV de Outros que antes não saía na checklist; H-24 é o aviso do roupeiro que antes sumia do resumo. As duas reversões são de uma linha, o "antes" e o "depois" são conhecidos pelo diff e cada uma tem um caso próprio e único. **H-25 (card #135) não entra:** a correção é do reducer em `.jsx` (lista N), sem caso na suíte para ficar vermelho.

**Fora da lista, com motivo:**
- H-05 e H-06: só conferidos pelo diff (nunca rodados); o conserto é uma condição simples e os casos negativos T-S19 e T-S21/T-C13 já a exercitam diretamente; a prova acrescentaria pouco.
- H-09 e H-10: o "antes" tinha outro modelo de dados (score global somado); desfazer exige reescrever, não tirar uma linha. Protegidos por T-S05, T-C04 e T-C15.
- H-11 (acentuação): o "antes" é texto corrompido; os 13 textos literais e o nível "MÉDIO" com acento nos casos C já falham com qualquer corrupção.
- H-12 a H-22 (PDF): conferidos pelo diff; os casos T-P citados na seção 7 cobrem cada um. Podem entrar na lista depois, se Everton quiser.

## 9. Lista K — comportamento aberto (não vira teste)

Só o **K-01** continua aberto. K-02, K-03 e K-04 ficam na tabela como registro do que foi corrigido.

| ID | Situação | Decisão |
|---|---|---|
| K-01 | Home/Outros: eletrônicos "Sim", TV adicionada, ponto "Não", depois eletrônicos "Não": a lista não é limpa e o score ainda conta a TV (`FormHomeSalaOffice.jsx:64`, `FormOutros.jsx:396`) | **Bug confirmado, aberto → card #133** (Backlog, ciclo SDD). O teste chega com a correção. Nenhum caso deste ciclo usa lista com TV e `eletronicos` falso (ver T-P25) |
| K-02 | Outros com TV: CC só no resumo, sem a pergunta do ponto na checklist (`pdf.js:513` em `60152e9`) | **Corrigido em `1a6022d` (card #131).** Agora é regra viva, testada em T-P27 (`pdf.js:515`) |
| K-03 | Dormitório só com rodapé existente: o aviso sumia do resumo (`pdf.js:240-243` em `60152e9`) | **Corrigido em `1a6022d` (card #132).** Agora é regra viva, testada em T-P37 (`pdf.js:240-245`) |
| K-04 | Ambiente removido continuava nas listas globais G1-G5 e podia travar o avanço do G5 com `cm` vazio | **Corrigido em `1a6022d` (card #135)**: o reducer tira as instâncias removidas de G1-G5 (`FormProvider.jsx:113-133`). Sem teste neste ciclo: a correção mora no reducer (`.jsx`, lista N). Nenhum caso depende de ambiente removido |

## 10. Lista N — não testável sem refatorar (fica de fora)

| Item | Onde mora | Observação |
|---|---|---|
| Criação de instâncias, remoção de contrato, `normalizarEstadoSalvo`, descarte de rascunho antigo (`g2_temReforma`) | reducers e provider em `FormProvider.jsx` / `FormProviderVendedor.jsx` (`FormProvider.jsx:297-299`) e limpeza do `global` ao reduzir ambientes (`FormProvider.jsx:113-133`, corrigida em `1a6022d`, #135) | O card #99 deve exportar `normalizarEstadoSalvo`; vira testável então |
| Validação de identificação: regex de contrato, telefone, CEP, UF | `StepIdentificacao.jsx`, `StepIdentificacaoVendedor.jsx` | O card #121 pode unificar as siglas de contrato |
| Validação do Projetista: obrigatoriedade por grupo, altura > 0, primeiro contrato não removível | `StepPerguntasAmbienteVendedor.jsx:23-27` e `StepIdentificacaoVendedor.jsx` | — |
| Limpeza de respostas ao trocar Sim/Não nos blocos G1-G5 e formulários | handlers dos `Form*.jsx` e `Bloco*.jsx` | Origem do K-01; a correção do #133 traz o teste dela |
| Validação "pode avançar" do G1-G5 (inclui `cm` obrigatório) | `StepPerguntasGlobais.jsx:33-37` | ligada ao K-04 (corrigido em #135) |
| Consertos só de tela (seção 8.3 do inventário): máscara de telefone, G3 sem ambientes do G2, CC visível no G3, nome do ambiente Outros, botão "Já rebaixado", "Iniciar novo preenchimento" | componentes `.jsx` | `d87f38e` tem a função `limitarCm` coberta por T-F16 |

## 11. Mapa do futuro

| Card | O que muda | Efeito nesta suíte |
|---|---|---|
| #131 (feito, `1a6022d`) | Outros imprime a pergunta do ponto da TV com CC | Já refletido: T-P27 afirma a pergunta e o CC em Outros |
| #132 (feito, `1a6022d`) | "Roupeiro sobre rodapé" entra no resumo mesmo sozinho | Já refletido: T-P37; T-P06, T-P07 e T-P08 seguem válidos |
| #135 (feito, `1a6022d`) | ambiente removido sai das listas G1-G5 (K-04), corrigido no reducer | Nenhum efeito nos casos (nenhum usa ambiente removido). Item da lista N; sem teste |
| #133 (SDD, único aberto) | eletrônicos "Não" deixa de contar TV da lista | T-S14, T-S15, T-F13, T-P26, T-P27 usam "eletrônicos Sim" e seguem válidos. O card acrescenta o caso "eletrônicos Não com TV residual" (K-01) |
| #99 | `gerarPdf` grava respostas nas propriedades do PDF; `normalizarEstadoSalvo` provavelmente exportada | O texto impresso "não deve mudar": os casos P devem continuar verdes sem alteração. O embrulho sobre o `jsPDF` real aceita chamadas novas sem mudar. O card acrescenta testes do que for novo |
| #117 | nova rota e novo PDF `Checklist_Futura_*` | Nenhum efeito; testes do novo PDF só depois de implementado |
| #114 | só CSS | Nenhum |
| #121 | unifica siglas de contrato | Só se a regex for movida para `.js` exportado |

Quem corrigir um desses cards roda a suíte **antes** (para ver o que é regra viva), muda o código, e só então muda o valor esperado do caso afetado, com registro no Spec daquele card.

## 12. Arquivos afetados

| Arquivo | O que acontece |
|---|---|
| `testes/` (pasta nova, nome sugerido; arquivos `*.test.js` e eventuais auxiliares) | **Adicionado** — contém a suíte e o intermediário de captura do PDF. Nomes e divisão por arquivo: Spec |
| `package.json` | **Alterado** — apenas o script `test`, chamando `node --test` (sem pasta como argumento). Nenhuma dependência nova; `package-lock.json` não muda |
| `CLAUDE.md` | **Alterado** — a frase atual "Não há suíte de testes automatizada…" (linha 28) é **trocada** (não se acrescenta linha solta) por: rodar `npm test` antes de qualquer commit ou merge na `main` que altere código em `src/`; vermelho ou pulado bloqueia; manter a menção a `npm run build` e ao teste manual no `npm run dev`; `replay_jules/` continua como conferência manual separada. O arquivo hoje tem 75 linhas e deve ficar abaixo de ~100. Por regra do projeto, o Everton aprova essa troca ao fim do ciclo |

**Removido:** apenas a frase antiga do `CLAUDE.md`.

**Não será tocado:** tudo em `src/` (nenhuma exportação nova, nenhuma refatoração, nenhum código morto removido, incluindo `pdf.js:27-47`); `.github/workflows/deploy.yml`; `vite.config.js`; `replay_jules/`; `README.md`; `especificacao-checklist-dinamica.md`; PRDs e Specs anteriores; pareceres do Jules; `dist/`.

## 13. Premissas e riscos

**Premissas**
1. `npm ci` já foi executado (existe `node_modules`).
2. O esbuild 0.21.5 de `node_modules/.bin/esbuild` está disponível como dependência transitiva do Vite.
3. Node 24 local roda a suíte. Node 20 (deploy) não executa a suíte: o deploy só faz `npm run build`.
4. As entradas do inventário e as tabelas desta seção 7 são a fonte do esperado; onde o valor foi conferido rodando a função real, está indicado.

**Riscos**

| ID | Risco | Mitigação |
|---|---|---|
| R-1 | O esbuild é dependência **transitiva** (`package-lock.json:1919`), não declarada. Uma troca de versão do Vite pode removê-lo ou mudar o caminho do executável | A suíte falha alto, com mensagem pedindo `npm ci` / conferência do esbuild (regra 12). Declarar o esbuild em `devDependencies` seria a saída, mas é dependência nova (decisão 1): só com aprovação do Everton |
| R-2 | **Relógio:** a data do arquivo e da capa vem de `new Date()` na hora local | Data fixa ao meio-dia local, sem tocar produção (regra 9). Mecanismo no Spec: o recurso de relógio falso do `node:test` (medido no Node 24; no Node 20 a doc cita `Date`, mas a versão mínima não está clara, então o Spec confirma) ou substituição temporária de `Date` (também medida) |
| R-3 | **Embrulho do `jsPDF`:** precisa envolver cada instância (herdar da classe não funciona) e exige formato `cjs`; depende do caminho dos arquivos em `node_modules/jspdf` e `node_modules/jspdf-autotable`. Troca de versão maior dessas bibliotecas pode quebrar o embrulho | Falha alta e clara. Como o embrulho usa o `jsPDF` real, métodos novos que o card #99 chame continuam existindo |
| R-4 | **Texto quebrado em linhas:** perguntas e CCs passam pela quebra automática do PDF; comparar linha a linha é frágil | Reunir as linhas de um mesmo bloco antes de comparar (Spec). Layout, cor e fonte não são conferidos |
| R-5 | **O teste copia um erro de hoje** (regra de ouro) | Lista K sem teste; revisão do Everton nas tabelas da seção 7; provas da seção 8; conferência única de transcrição dos 13 textos (regra 3) |
| R-6 | **Descoberta de arquivos:** `node --test <pasta>/` falhou no Node 24 (medido) e o comportamento difere entre versões | Script sempre `node --test` sem argumento de pasta; arquivos `*.test.js` fora de `src/`; nenhum arquivo atual do repo casa com o padrão. O Spec confirma que o resumo final mostra `fail 0` e `skipped 0` |
| R-7 | **"Pulado bloqueia" só funciona se pulado for visível:** o próprio Node conta `skipped` no resumo | Proibido `skip`/`todo`/`only` (regra 12); o relato do resultado cita passou/pulou/falhou, com os três números |
| R-8 | **Armadilha de nomes G4/G5** (seção 3) e **estado parcial** (`g4_ambientes` ausente quebra `scoreEngine.js:51`) levam o implementador a montar entrada errada | Entradas sempre a partir do `estadoInicial`; tabela da seção 7 usa a pergunta, e o Spec deve listar o campo exato de cada caso |
| R-9 | **Caminho com espaço** (`C:\Users\Windows 10\...`) | Medido: o empacotamento e a execução funcionaram nesse caminho; o Spec evita montar comandos por concatenação de texto |
| R-10 | **Manutenção:** 111 casos, texto jurídico travado | Construtores pequenos de estado no Spec (parte do `estadoInicial`), um comportamento por caso; mudar redação de CC exige atualizar o teste (atrito desejado) |
| R-11 | Sem CI: o bloqueio depende de a IA rodar a suíte | Linha no `CLAUDE.md` (seção 12). Risco aceito nesta fase (decisão do Everton) |
| R-12 | Arquivos temporários do empacotamento não limpos | Tudo na pasta temporária do sistema, removida ao final; `git status` limpo depois da suíte (critério CA-05) |

## 14. Critérios de aceite do ciclo

| ID | Cenário (entrada) | Resultado esperado |
|---|---|---|
| CA-01 | Rodar `npm test` na `main` limpa, offline | Termina com código 0; resumo mostra todos os casos da seção 7 como passou, `fail 0`, `skipped 0`; os 111 casos aparecem pelo nome com seu ID `T-` |
| CA-02 | Em cópia fora do repo, aplicar sobre o código atual a mudança mínima de cada prova da seção 8 (H-01, H-02, H-03, H-04, H-07, H-08, H-23, H-24), uma por vez, e rodar a suíte | Em cada cópia ficam vermelhos os casos listados na tabela da seção 8; outros vermelhos só são aceitos se explicados no relatório; código de saída diferente de 0 |
| CA-03 | **Erro:** alterar na cópia um limiar (ALTO a partir de 9 em vez de 8) | T-S24 fica vermelho; mensagem mostra esperado e obtido |
| CA-04 | **Erro:** alterar na cópia o texto de um CC (tirar um acento) | O caso do grupo C daquele CC fica vermelho |
| CA-05 | Rodar `npm test` e olhar `git status` e buscar `*.pdf` e `*.cjs` no repo | Nenhum arquivo novo ou alterado fora dos listados na seção 12; nenhum PDF no repo; nenhum `localStorage` tocado |
| CA-06 | **Erro:** executar sem o esbuild disponível (simulado numa cópia) | Suíte **falha** com mensagem que manda rodar `npm ci`; não passa nem pula |
| CA-07 | Rodar a suíte com o relógio do sistema em outro dia (ou na virada do dia) | Resultado idêntico; os nomes de arquivo esperados continuam `…_2026-10-19.pdf` e `…_2026-03-05.pdf` |
| CA-08 | Buscar nos arquivos de teste os nomes proibidos da regra 2 (`ORDEM_ELETROS_PDF`, `GATILHO_TEXTO`, `PERGUNTAS_POR_GRUPO`, `GRUPO_POR_AMBIENTE`, `TAMANHOS_CAMA`, `ELETROS_CONFIG`, `ELETRONICOS_CONFIG`, `TIPOS_CUBA`, `COR_NIVEL`, `TEXTO_`) | Nenhuma ocorrência (exceção única: `AMBIENTES_DISPONIVEIS` no T-A03, comparado com lista por extenso) |
| CA-09 | Buscar nos testes por `skip`, `todo` e `only` | Nenhuma ocorrência |
| CA-10 | Conferir os testes contra a lista K (só K-01 aberto) e os casos T-P27 e T-P37 | Nenhum caso afirma o comportamento de K-01 (nem o "certo", nem o "errado"); K-02 e K-03 **são** testados no comportamento corrigido (T-P27, T-P37); nenhum caso depende de ambiente removido (K-04) |
| CA-11 | `git diff` de `src/` depois do ciclo | Vazio |
| CA-12 | Rodar `npm run build` depois do ciclo | Compila como antes; `dist/` não contém arquivos de teste |
| CA-13 | Conferir `deploy.yml`, `vite.config.js`, `replay_jules/`, `package-lock.json` | Sem alteração |
| CA-14 | Conferir `package.json` | Diferença = apenas o script `test`; nenhuma dependência nova |
| CA-15 | Procurar dado real nos testes: contratos fora de `TA9xxx`/`SM9xxx`, nomes ou telefones reais, links fora de `.invalid` | Nenhum |
| CA-16 | **Erro:** renomear uma função interna testada (numa cópia) | Suíte falha por import; corrigir o import na mesma tarefa deixa tudo verde **sem** mudar nenhum valor esperado |
| CA-17 | Conferir `CLAUDE.md` | A frase "Não há suíte de testes automatizada" não existe mais; no lugar, a regra de rodar `npm test` antes de commit/merge que altere `src/` (vermelho ou pulado bloqueia), com `npm run build`, `npm run dev` e `replay_jules/` mantidos; arquivo abaixo de ~100 linhas |
| CA-18 | Fim do ciclo: relato ao Everton | Informa os números passou/pulou/falhou; pulado por falta de material **não** conta como passou |

## 15. Fora de escopo

- ViaCEP com rede real; o ramo "CEP inválido" de `buscarCep` também fica de fora (seção 6.3).
- Navegador, layout, cores, fontes, quebra de página, telas React.
- Leitura de PDF real (continua em `replay_jules/`).
- CI automático e qualquer mudança no deploy.
- Correção do bug K-01 (card #133, único aberto; K-02, K-03 e K-04 já foram corrigidos em `1a6022d`); refatoração para tornar testáveis os itens da lista N; remoção de código morto.
- Testes de comportamento ainda não implementado (venda futura, importação do PDF, design system).
- Qualquer dependência nova, inclusive declarar o esbuild.

## 16. Pesquisa de padrões externos (resumo)

- O executor nativo do Node (`node --test`) descobre sozinho arquivos `*.test.js`, conta passou/falhou/pulado no resumo e devolve código de saída diferente de 0 em falha. Atende a "sem dependência além do necessário". Documentação: https://nodejs.org/docs/latest-v20.x/api/test.html
- Alternativas descartadas: Vitest/Jest (dependência nova e configuração para ESM/JSX, sem ganho para funções puras); pytest chamando Node (dois idiomas).
- Para o PDF, a forma mais simples é a já usada em `replay_jules/` (empacotar com esbuild em `cjs`), trocando a gravação do arquivo por uma captura em memória, sem ler PDF.
