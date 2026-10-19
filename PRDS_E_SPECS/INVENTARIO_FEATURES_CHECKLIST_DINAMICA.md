# Inventário de features vivas — Checklist Dinâmica

**Ciclo:** TESTES_REGRESSAO_CHECKLIST_DINAMICA (card Trello #130) — Etapa 1
**Data:** 2026-10-19
**Base medida:** `main` em `60152e9`
**Critério:** o código atual em `src/`, não o texto nem o campo Status dos documentos (todos os PRDs ainda dizem "Aguardando aprovação", inclusive os já em produção).
**Dados reais:** nenhum foi aberto. Os cenários citados aqui são fictícios e foram rodados contra a função real fora do repositório.

---

## 1. Classificação dos documentos

| Documento | Classe | Observação |
|---|---|---|
| PRD/SPEC_CHECKLIST_DINAMICA_CLIENTE | **PARCIAL** | Base do fluxo Cliente segue viva (wizard, gatilhos por ambiente, textos de CC, limiar 4/8). Substituído em partes: G2 "reforma" → REESTRUTURACAO_G2_G3; score global somado e CCs com escopo "Global" → SCORE_POR_AMBIENTE; resumo em texto → TABELA_RESUMO_EXECUTIVO; perguntas G1-G4 no topo da checklist → CC_POR_AMBIENTE; polegadas no ambiente (Home/Outros) → POLEGADAS_TV. |
| PRD/SPEC_REESTRUTURACAO_G2_G3 | **PARCIAL** | Perguntas G2/G3 universais, modal de risco, supressão por ambiente e texto próprio do revestimento estão vivos. A pontuação do revestimento (Alto +3) foi trocada pelo commit `6dbd195` para Médio +4, sem documento. |
| PRD/SPEC_SCORE_POR_AMBIENTE | **VIVO** | Ajustado pelo commit `30f05c4` (global = pior ambiente pela classificação, cobrindo os dois caminhos para ALTO). |
| PRD/SPEC_CC_POR_AMBIENTE | **VIVO** | Estendido pelo card #107 (commit `70495ff`, sem PRD próprio): G1 e G5 sem CC imprimem "Não" em cada ambiente. |
| PRD/SPEC_TABELA_RESUMO_EXECUTIVO | **VIVO** | Inclui avisos (decisão `fa16b6f`). Ver divergência D-05. |
| PRD/SPEC_TABELA_ELETROS | **VIVO** | Ordem das linhas alterada pelo card #110 (commit `a458808`, sem PRD): ordem fixa em vez da ordem de cadastro. |
| PRD/SPEC_POLEGADAS_TV | **VIVO** | Home/Outros: polegadas dentro de cada TV. Dormitório mantém `tv_polegadas` no ambiente (fora do escopo, de propósito). |
| PRD/SPEC_DIFERENCIACAO_TIPO_TANQUE | **VIVO** | Cozinha, Varanda (formType cozinha) e Outros. |
| PRD_DIFERENCIACAO_TANQUE_COZINHA (citado) | **SUBSTITUIDO** por DIFERENCIACAO_TIPO_TANQUE | Arquivo apagado no commit `b9aa002`; só existe como referência no PRD substituto. |
| PRD/SPEC_CHECKLIST_VENDEDOR | **VIVO** | Fluxo Projetista completo. Ver D-07. |
| PRD_LAYOUT_DESIGN_SYSTEM | **NAO IMPLEMENTADO** | Zero `var(--` em `src/index.css`; card #114 em SDD (PRD). Só visual — não muda regra. |
| PRD_CHECKLIST_VENDA_FUTURA | **NAO IMPLEMENTADO** | `SelecaoPerfil.jsx:15-20` tem só Cliente e Projetista; card #117 em SDD (PRD). |
| PRD_IMPORTACAO_PDF_CLIENTE | **NAO IMPLEMENTADO** | Sem botão de importar nem metadado no PDF; card #99 em SDD (PRD). |

Features vivas **sem PRD/Spec** (vieram pelo Loop): G1/G5 "Não" no PDF (#107), "Já rebaixado" (#100), ordem fixa dos eletros (#110), CEP no PDF (#93), ponto de TV da Sala no PDF (#85), nome `Checklist_Cliente_*` (#118), texto "aproximadamente 150mm" do cortineiro (#116).

---

## 2. Onde cada regra mora (decide o que dá para testar sem refatorar)

| Local | Tipo | Testável hoje sem mexer no código? |
|---|---|---|
| `src/domain/scoreEngine.js`, `ccBuilder.js`, `ambientes.js`, `checklistTextos.js`, `gruposPerguntasVendedor.js`, `schema*.js` | funções puras, `.js` ESM | **Sim.** Rodam direto no Node (confirmado: `calcularScore` e `construirCCs` importados e executados fora do repo). |
| `src/steps/StepPerguntasPorAmbiente/formUtils.js` (`validarFormularioAmbiente`, `limitarCm`, `TAMANHOS_CAMA`) | puro, `.js` | **Sim.** |
| `src/services/pdf.js` (`gerarPdf`), `pdfVendedor.js` (`gerarPdfVendedor`) | dependem de `jspdf`/`jspdf-autotable` e chamam `doc.save` | **Sim, com empacotamento.** Precedente: `replay_jules/` empacota com o esbuild que já vem com o Vite e troca `jspdf` por um shim. Dá para capturar o texto escrito sem ler PDF. |
| `src/services/cep.js` (`buscarCep`) | usa `fetch` global | Parcial: o ramo "CEP inválido" não usa rede; os demais exigem `fetch` falso. |
| Reducers de `FormProvider.jsx` / `FormProviderVendedor.jsx` (criação de instâncias, remoção de contrato, `normalizarEstadoSalvo`, descarte de rascunho legado `g2_temReforma`) | internos, não exportados, arquivo `.jsx` | **Não** (lista N). |
| Validações de identificação (`StepIdentificacao.jsx`, `StepIdentificacaoVendedor.jsx`: regex de contrato, telefone, CEP, UF) e do Projetista (`StepPerguntasAmbienteVendedor.jsx`: obrigatórios, altura > 0) | dentro de componente `.jsx`, não exportadas | **Não** (lista N). |
| Limpeza de respostas ao trocar Sim/Não (blocos G1-G5, `Form*.jsx`) | handlers de botão | **Não** (lista N). |

---

## 3. Regras de negócio vivas — Cliente

Entrada em linguagem de estado; "pts" = pontos no ambiente. Varanda usa formType `cozinha`; Office usa formType `home`.

### 3.1 Score e CCs (`scoreEngine.js`, `ccBuilder.js`)

| # | Regra | Entrada típica | Resultado esperado |
|---|---|---|---|
| S-01 | G1 iluminação externa | ambiente em `g1_ambientes` | +2 (Médio); CC `ILUMINACAO_EXTERNA` nível MÉDIO, origem G1 |
| S-02 | G2 sem reboco | ambiente em `g2_ambientesSemReboco` | 0 pts, mas ambiente vira **ALTO**; CC `REFORM_SEM_REBOCO` nível ALTO |
| S-03 | G3 sem revestimento | ambiente em `g3_ambientesSemRevestimento` e **não** em G2 | +4 (Médio) → sozinho dá **MÉDIO**; CC com `TEXTO_REVESTIMENTO_AUSENTE`, nível **ALTO** (vermelho no PDF). Intencional — confirmado pelo Everton em 19/10/2026 (ver D-02) |
| S-04 | Supressão G2 → G3 | mesmo ambiente em G2 e G3 | só o gatilho/CC de reboco; revestimento não pontua nem gera CC. Outro ambiente só em G3 continua pontuando |
| S-05 | G4 pontos indefinidos | ambiente em `g3_ambientesPendentes` | +2; CC `PONTOS_INDEFINIDOS` MÉDIO, origem G4 |
| S-06 | G5 rebaixo | `g4_temRebaixo = true` e ambiente em `g4_ambientes` com `cm: '12'` | +1; CC "…REBAIXO DE TETO EM 12CM…"; sem `cm` → "EM ?CM" |
| S-07 | G5 desligado | `g4_temRebaixo = false` (Não ou Já rebaixado), mesmo com lista preenchida | nenhum gatilho de rebaixo |
| S-08 | Granito | cozinha/banheiro/outros, `granito = true`, `granitoadaptar = false` | +2; CC granito. Adaptar = true → nada |
| S-09 | Tanque tradicional | cozinha/outros, `tanque = true`, `tanqueEmbutido = false`, `tanqueMoveis = true` | +2; CC tanque |
| S-10 | Tanque embutido | `tanqueEmbutido = true` (mesmo com `tanqueMoveis = true` sobrando) | nenhum gatilho de tanque |
| S-11 | TV dormitório | `tv = true`, `tvPontoFinal = false` | `TV_PONTO` +2; CC TV |
| S-12 | TV Home/Outros | `eletronicosList` contém `{tipo: 'TV'}`, `tvPontoFinal = false` | `TV_PONTO` +2; CC TV |
| S-13 | DIV-07 | S-11/S-12 em ambiente que também está em G4 | `TV_PONTO` vale **0 pts**, CC continua. Só para aquele ambiente |
| S-14 | Eletros indefinidos | **só formType cozinha**, `eletrosDefined = false` | +1; CC eletros. Em Outros: nada |
| S-15 | Eletrônicos indefinidos | **só formType home**, `eletronicos = false` | +1; CC eletrônicos. Em Outros: nada |
| S-16 | Rodapé ausente | dormitório/home/outros, `rodape = false` | +1; CC rodapé |
| S-17 | Rodapé existente | **só dormitório**, `rodape = true` | AVISO sem nível, 0 pts, fora de `gatilhos` |
| S-18 | Cortineiro | dorm/home/outros, `cortineiro = true`, `cortieneiroInstalado = false` | +1; AVISO nível BAIXO, texto "APROXIMADAMENTE 150MM" |
| S-19 | Classificação | soma do ambiente | ALTO se reboco (AltoDireto) ou ≥ 8; MÉDIO se ≥ 4; BAIXO abaixo disso |
| S-20 | Global = pior ambiente | A = 7 pts (MÉDIO), B = reboco (ALTO, 0 pts) | global **ALTO**, pontos 0. Se houver vários do mesmo nível, vale o maior número de pontos daquele nível |
| S-21 | Sem ambientes | lista vazia | global BAIXO, 0 pts |
| S-22 | Escopo dos CCs | qualquer CC | `escopo = instanceId` do ambiente; nenhum CC "Global" |

### 3.2 PDF do Cliente (`pdf.js`)

| # | Regra | Entrada típica | Resultado esperado |
|---|---|---|---|
| P-01 | Nome do arquivo | contrato `TA9001`, data 19/10/2026 | `Checklist_Cliente_TA9001_2026-10-19.pdf` |
| P-02 | Capa | identificação completa | Cliente, Contrato, endereço (logradouro, número — complemento; bairro — cidade/UF), `CEP:`, `Telefone:`, `Data:` e "RISCO {global}" **sem pontos** |
| P-03 | Resumo Executivo | ambientes com gatilho | uma linha por ambiente com ≥ 1 gatilho: nome, textos curtos unidos por " — ", classificação. Rebaixo vira "Rebaixo de 12cm" |
| P-04 | Rodapé existente no resumo | dormitório com S-17 **e** outro gatilho | acrescenta "Roupeiro sobre rodapé" (ver D-05) |
| P-05 | Globais dentro do ambiente | CC de G1-G5 no ambiente | pergunta + resposta fixa (G1 "Sim", G2/G3/G4 "Não", G5 "Sim — 12 cm") + CC logo abaixo |
| P-06 | G1/G5 sem CC (#107) | G1 respondido e ambiente sem CC de G1; G5 respondido (Não, Já rebaixado ou Sim sem este ambiente) | imprime a pergunta com "Não". G2-G4 sem CC não aparecem. Pergunta não respondida (`null`) não aparece |
| P-07 | Risco por ambiente | qualquer ambiente | "RISCO {classificação} ({pts} pts)" |
| P-08 | Tanque no PDF | tradicional / embutido | "Tanque tradicional" + pergunta de móveis com CC; "Embutido na bancada" sem pergunta de móveis |
| P-09 | Ordem dos eletros (#110) | cadastro: Lava-louça, Forno, Cooktop, Refrigerador | Cooktop, Refrigerador, Forno, Lava-louça (fixa: Cooktop, Fogão, Refrigerador, Microondas, Forno, Depurador; demais na ordem de cadastro) |
| P-10 | Tabela de eletros | `eletrosDefined = true` e lista não vazia | colunas Tipo / Modelo / Largura / Altura / Prof. / Link; Tipo = "tipo — descrição — subtipo"; vazio → "—"; com link → "Ver link" |
| P-11 | Tabela de eletrônicos | `eletronicos = true` e lista não vazia | Tipo = "tipo — subtipo — 55\"" (polegadas só em TV); Modelo em coluna própria |
| P-12 | Ponto da TV na Sala (#85) | formType home com TV na lista | pergunta "O ponto elétrico da TV…" com CC inline (ver D-04 para Outros) |
| P-13 | TV do dormitório | `tv = true` | ponto + CC, "Polegadas" (sempre), modelo/medidas/link só se preenchidos |
| P-14 | Cama | dorm/outros | rótulo completo ("Queen (1,58 × 1,98 m)"); "outro" → largura e comprimento |
| P-15 | Cuba | banheiro sempre; outros só se preenchida | "Tipo de cuba" |
| P-16 | Observações | texto preenchido | "Observações" |

### 3.3 Validação por ambiente (`formUtils.js` → `validarFormularioAmbiente`)

| # | Regra | Entrada | Resultado |
|---|---|---|---|
| F-01 | Perguntas obrigatórias por formType | resposta `null` | erro "Selecione uma opção" no campo |
| F-02 | Tanque | `tanque = true` sem tipo / tradicional sem móveis | erro em `tanqueEmbutido` / `tanqueMoveis` |
| F-03 | Eletros | `eletrosDefined = true` com lista vazia | "Adicione ao menos um eletro" |
| F-04 | Medidas de eletro/eletrônico | largura/altura/profundidade vazias | "Obrigatório" por índice |
| F-05 | Depurador embutido | sem modelo ou sem link | "Obrigatório para Depurador Embutido" |
| F-06 | Subtipo | tipo com subtipos e subtipo vazio | "Obrigatório" |
| F-07 | Outros (eletro) | sem descrição | "Descreva qual eletro é" |
| F-08 | TV | Home/Outros com TV sem `tvPontoFinal` ou sem polegadas; dormitório com TV sem polegadas | erro no campo |
| F-09 | Cama/cuba | dormitório sem cama; "outro" sem medidas; banheiro sem cuba | erro no campo |
| F-10 | `limitarCm` | `"1385.57"` / `"12a,3"` | `"138,5"` / `"12,3"` |

### 3.4 Compartilhado

| # | Regra | Entrada | Resultado |
|---|---|---|---|
| C-01 | `formatarNomeAmbiente` | `{label: 'Dormitório Casal', nome: ' Suíte '}` / nome vazio | "Dormitório Casal — Suíte" / "Dormitório Casal" |
| C-02 | Catálogo de ambientes | — | 8 ambientes; Varanda → cozinha, Office → home, Dormitório Solteiro → dormitorio |

---

## 4. Regras de negócio vivas — Projetista (Vendedor)

| # | Regra | Entrada | Resultado |
|---|---|---|---|
| V-01 | Grupo por ambiente | cozinha, varanda, banheiro, outros / dormitórios / home, office / id desconhecido | A / B / C / **A** |
| V-02 | Perguntas e ordem no PDF | grupo A | alturas balcão e armário, fechamento, caixaria, dobradiças, corrediças |
| V-03 | | grupo B | caixaria, dobradiças, corrediças, **fechamento por último** |
| V-04 | | grupo C | caixaria, dobradiças, corrediças (sem altura, sem fechamento) |
| V-05 | Formatação da resposta | `null` / `'não se aplica'` / altura `850` / fechamento `'NAO'` | "—" / "Não se aplica" / "850 mm" / "NÃO" |
| V-06 | Capa | contratos `['TA9001', '', 'SM9002']` | "Contrato(s): TA9001, SM9002" |
| V-07 | Nome do arquivo | idem, 19/10/2026 | `Checklist_Projetista_TA9001_2026-10-19.pdf` (primeiro preenchido) |
| V-08 | Observações | texto | "Observações do ambiente" |

Regras do Projetista que só existem em `.jsx` (lista N): obrigatoriedade por grupo, altura > 0, contrato com regex, primeiro contrato não removível.

---

## 5. Divergências documento × código (sem ação)

| ID | Documento diz | Código faz | Fonte |
|---|---|---|---|
| D-01 | `especificacao-checklist-dinamica.md:249`: ALTO a partir de **7** pontos | ALTO a partir de **8** (`scoreEngine.js:165`), igual ao SPEC_CHECKLIST_DINAMICA_CLIENTE:644 | macro desatualizado |
| D-02 | Revestimento Alto +3 (macro:258, SPEC_CLIENTE:626, SPEC_SCORE:96) | Médio +4 no score (`scoreEngine.js:39`); o CC sai com nível **ALTO** (`ccBuilder.js:65`). O código está certo: ambiente MÉDIO com CC vermelha é intencional (Everton, 19/10/2026); os documentos é que estão desatualizados | commit `6dbd195` |
| D-03 | Macro:261-267: granito só Cozinha/Banheiro; TV, rodapé e cortineiro em "Dorm., Home, Office" | inclui Outros e Varanda via formType | macro desatualizado |
| D-04 | SPEC_CLIENTE:631: TV_PONTO em Dormitório, Home **e Outros** | Outros pontua e gera CC (`scoreEngine.js:85`), mas o PDF só imprime a pergunta do ponto com o CC para **Home** (`pdf.js:513`). Em Outros o CC só aparece como texto curto no resumo | cards #85 e `bc9e2cf` |
| D-05 | SPEC_TABELA_RESUMO Obs. 1: "Roupeiro sobre rodapé" entra na tabela | só entra se o dormitório tiver outro gatilho: o filtro `score.gatilhos.length > 0` (`pdf.js:240-243`) descarta o ambiente cujo único item é o rodapé existente | — |
| D-06 | SPEC_CLIENTE DIV-02: cortineiro "não aparece no Resumo Executivo" | aparece ("Cortineiro 150mm") | substituído por TABELA_RESUMO (`fa16b6f`) |
| D-07 | SPEC_VENDEDOR:379: altura "número inteiro" | aceita qualquer número > 0, inclusive decimal (`StepPerguntasAmbienteVendedor.jsx:25`) | — |
| D-08 | PRD_IMPORTACAO_PDF cita `FormProviderVendedor.jsx:25` e `RESTORE_STATE_VENDEDOR` em `:180` | `normalizarEstadoSalvo` está na linha 25 ✔; `RESTORE_STATE_VENDEDOR` está na linha 180 ✔ | conferido, sem divergência |
| D-09 | — | `formatarListaAmbientes` e `formatarListaRebaixo` em `pdf.js:27-47` não são chamadas por ninguém (código morto) | — |
| D-10 | Todos os PRDs: "Status: Aguardando aprovação" | 9 deles estão em produção | campo Status nunca atualizado |

---

## 6. Comportamentos em aberto (candidatos à lista K — não viram teste)

**Atualização 19/10/2026:** K-02 (#131), K-03 (#132) e K-04 (#135) foram corrigidos no commit `1a6022d`, sem desvio dos cards. O comportamento corrigido passa a ser regra viva (P-03, P-04 e P-12 valem como corrigidos; D-04 e D-05 resolvidos). As linhas de `pdf.js` a partir da 240 andaram +2 (ex.: `pdf.js:513` → `515`). **K-01 (#133) continua aberto.**

Decisão do Everton em 19/10/2026: **K-01, K-02 e K-03 são bugs.** Não viram teste neste ciclo (o teste seguiria o comportamento errado). Cards: K-01 → #133 TV_FANTASMA_ELETRONICOS (Backlog, ciclo SDD, porque muda score/CC); K-02 → #131 e K-03 → #132 (Pronto para o Loop, só PDF). A correção de cada um chega com o teste junto. O K-04 não foi perguntado; a decisão fica para o PRD.

| ID | Situação | Efeito medido | Fonte |
|---|---|---|---|
| K-01 | Home ou Outros: cliente marca eletrônicos "Sim", adiciona TV, ponto "Não" e depois troca eletrônicos para "Não". A lista não é limpa | **Confirmado rodando o score real:** o ambiente recebe `TV_PONTO` (+2) e o CC "deslocar os pontos para o painel de TV", além do CC de eletrônicos indefinidos. O PDF não mostra a pergunta da TV (exige eletrônicos "Sim"), mas o resumo mostra "Ponto fora do painel" | nenhum `simNao` passa `onFalse` (`FormHomeSalaOffice.jsx:64`, `FormOutros.jsx:396`) |
| K-02 | = D-04 (CC de TV em Outros fora da checklist completa) | CC impresso só no resumo, sem o texto completo | `pdf.js:513` |
| K-03 | = D-05 (dormitório com só rodapé existente) | aviso some do resumo | `pdf.js:240-243` |
| K-04 | Ambiente removido (quantidade reduzida) continua nas listas globais G1-G5 | sem efeito no score/PDF (ambos percorrem só os ambientes atuais). Se o ambiente for adicionado de novo, volta já marcado (chip aparece ativo). Uma entrada de rebaixo com `cm` vazio de ambiente removido trava o G5 sem campo visível para preencher | `FormProvider.jsx:113-118` não limpa `global` |

---

## 7. Mapa do futuro (cards que mexem em regra viva)

| Card | O que muda | Regras afetadas |
|---|---|---|
| #117 CHECKLIST_VENDA_FUTURA | nova rota e novo PDF `Checklist_Futura_*` | nenhuma regra viva muda; testes do novo PDF só depois de implementado |
| #99 IMPORTACAO_PDF_CLIENTE | `gerarPdf` grava as respostas nas propriedades do PDF; `normalizarEstadoSalvo` provavelmente passa a ser exportada | P-01 a P-16 não devem mudar ("conteúdo impresso não muda"); a função exportada vira testável |
| #114 LAYOUT_DESIGN_SYSTEM | só CSS | nenhuma |
| #121 BIBLIOTECA_COMUM | unificar siglas de contrato (começa pelo Assistente de Email) | se chegar aqui, a regex `IT|SM|TA|PIN|STA` (hoje em dois `.jsx`) |
| #131 (Loop) | Outros imprime a pergunta do ponto da TV com CC | P-12 passa a valer também para Outros |
| #132 (Loop) | "Roupeiro sobre rodapé" entra no resumo mesmo sozinho | P-03/P-04 |
| #133 TV_FANTASMA_ELETRONICOS (SDD) | eletrônicos "Não" deixa de contar TV da lista | S-12 e F-08 em Home/Outros |

---

## 8. Histórico de consertos (Etapa 2)

Fonte: os 41 commits que alteraram `src/`, conferidos pelo diff (não pela mensagem), mais os incidentes dos dois pareceres do replay do Jules e do commit de acentuação. Os commits de layout puro ficaram de fora (quebra de página, linha dourada, fontes, cabeçalho "Prof. (cm)" em `51d1eac`).

**Coluna "Prova":** os seis consertos de score foram **rodados nas duas versões** (arquivo do commit pai × arquivo do commit), com a entrada da tabela, fora do repositório. A saída está transcrita como "antes → depois". Os demais foram conferidos só pela leitura do diff.

### 8.1 Score e CCs (domínio — testável direto)

| ID | Commit | Regra protegida | Entrada que distingue | Antes → depois | Prova |
|---|---|---|---|---|---|
| H-01 | `30f05c4` | Global = pior ambiente **pela classificação** (ALTO por soma também conta) | Outros com G1 + G4 + granito retirar + tanque retirar + rodapé ausente (9 pts); Home com G1 + eletrônicos indefinidos + rodapé ausente + cortineiro (5 pts) | global **MÉDIO 5** → **ALTO 9** (a capa do PDF dizia "RISCO MÉDIO" com um ambiente ALTO) | rodado |
| H-02 | `6dbd195` | Revestimento sozinho é MÉDIO +4 | Cozinha só em `g3_ambientesSemRevestimento` | ALTO 3 → MÉDIO 4 | rodado |
| H-03 | `934e18c` | TV da Sala pontua pela lista de eletrônicos | Home, `eletronicosList: [TV]`, `tvPontoFinal: false`, `tv: null` | sem gatilho → `TV_PONTO` +2 (a CC da TV da Sala nunca saía) | rodado |
| H-04 | `c50efc4` | TV de Outros pontua pela lista de eletrônicos (fim da TV duplicada) | Outros, mesma entrada de H-03 | sem gatilho → `TV_PONTO` +2 | rodado |
| H-05 | `934e18c` | Outros não gera CC de eletros nem de eletrônicos indefinidos | Outros, `eletrosDefined: false`, `eletronicos: false` | `ELETROS_NAODEF` + `ELETRONICOS_NAODEF` → nenhum | diff |
| H-06 | `934e18c` | Aviso de rodapé existente só no Dormitório | Home ou Outros, `rodape: true` | AVISO `RODAPE_EXISTENTE` → nenhum | diff |
| H-07 | `0aa8d85` | Tanque embutido não gera CC de remoção | Cozinha, `tanque: true`, `tanqueEmbutido: true`, `tanqueMoveis: true` | `TANQUE_RETIRAR` +2 → nenhum | rodado |
| H-08 | `e039db7` | DIV-07 vale **por ambiente** | G4 só no dormitório 0; dormitório 1 com TV e ponto "Não" | dormitório 1: TV 0 pts → **2 pts** (antes, G4 em qualquer ambiente zerava a TV de todos) | rodado |
| H-09 | `e039db7` | Pontos de G1-G4 nascem no ambiente marcado, não no global | G1 só na Cozinha, Dormitório sem nada | antes: +2 no global, CC escopo "Global"; depois: +2 só na Cozinha, CC com `escopo: 'cozinha-0'`, Dormitório 0 | diff |
| H-10 | `1f71630` | Revestimento tem texto próprio; supressão G2→G3 por ambiente | A em G2 e B em G3 | antes: CC de revestimento suprimido para todos, com o mesmo texto do reboco; depois: B recebe `TEXTO_REVESTIMENTO_AUSENTE` | diff |
| H-11 | `40b97a3` (incidente de `1df50f6`) | Textos e níveis com acentuação correta | qualquer CC | `1df50f6` gravou "MEDIÃ‡ÃƒO", "MÃ‰DIO" etc. Se o nível vira "MÃ‰DIO", `COR_NIVEL` (`pdf.js:10-14`) não acha a cor | diff |

### 8.2 PDF do Cliente (testável com empacotamento)

| ID | Commit | Regra protegida | Entrada que distingue | Antes → depois |
|---|---|---|---|---|
| H-12 | `b1cbf7e` (card #93) | CEP na capa | identificação com `cep: '01001-000'` | sem linha → "CEP: 01001-000" |
| H-13 | `51a5344` | Cama com rótulo completo; link da TV do Dormitório abreviado | `tamanhoCama: 'queen'`, `tv_link` preenchido | "queen" → "Queen (1,58 × 1,98 m)"; URL crua → "Ver link" |
| H-14 | `7aa8c24` | Polegadas dentro de cada TV; Tipo e Modelo separados | Home com TV `{polegadas: '55', modelo: 'X9'}` | Tipo "TV — X9", Modelo "—" → Tipo `TV — 55"`, Modelo "X9" |
| H-15 | `bc9e2cf` | "Terá TV?" não sai para Home/Outros | Home | pergunta impressa → ausente |
| H-16 | `468f3ba` (card #85) | Ponto da TV impresso na checklist da Sala | Home com TV, ponto "Não" | ausente → pergunta + CC |
| H-17 | `0aa8d85` | PDF mostra o tipo de tanque; "móveis" só no tradicional | tanque embutido | "Haverá móveis…" → "Qual o tipo de tanque? Embutido na bancada", sem pergunta de móveis |
| H-18 | `70495ff` (card #107) | G1/G5 sem CC imprimem "Não" | G1 "Não", G5 "Já rebaixado" | ausente → "Resposta: Não" nos dois |
| H-19 | incidente do replay G1/G5 (sem commit) | G1 "Sim" no ambiente marcado continua "Sim" + CC | G1 "Sim" só na Cozinha | o PR do Jules imprimiu "Resposta: Não" ao lado da CC (tratou `g1_ambientes` como lista de objetos) |
| H-20 | `a458808` (card #110) | Ordem fixa dos eletros | cadastro Lava-louça, Forno, Cooktop, Refrigerador | ordem de clique → Cooktop, Refrigerador, Forno, Lava-louça |
| H-21 | armadilhas do replay #110 (sem commit) | Cada "Ver link" fica na linha do seu eletro; o estado não é reordenado | eletros com links diferentes fora de ordem | risco medido: ordenar só as linhas joga o link na linha errada; `.sort()` sem cópia altera o estado salvo |
| H-22 | `cda9fa0` (cards #116 e #118) | Nome do arquivo e texto do cortineiro | contrato `TA9001` | `Checklist_ByArabi_*` → `Checklist_Cliente_*`; "VÃO DE 150MM" → "VÃO DE APROXIMADAMENTE 150MM" |

### 8.3 Consertos que só existem na tela (lista N — sem teste sem refatorar)

| Commit | O que protege |
|---|---|
| `c7e2885`, `2bdbb79` | máscara de telefone; "Telefone incompleto" abaixo de 10 dígitos |
| `5b5d4f0` | G3 não oferece ambientes já marcados no G2 |
| `2842d01` | CC do revestimento visível na tela do G3 |
| `934e18c` | nome do ambiente Outros aberto já com quantidade 1 (reducer interno) |
| `9526a2b` (card #100) | botão "Já rebaixado" grava o mesmo `g4_temRebaixo = false` do "Não" (o efeito no PDF está coberto por H-18) |
| `31e2e7f` | "Iniciar novo preenchimento" volta à SelecaoPerfil |
| `d87f38e` | campo de rebaixo usa `limitarCm` (a função em si é testável: F-10) |
| `FormProvider.jsx:281-283` | rascunho no formato antigo (`g2_temReforma`) é descartado em silêncio |
