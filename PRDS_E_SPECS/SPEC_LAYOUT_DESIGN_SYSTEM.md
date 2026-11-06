# SPEC — Atualização Visual: Design System By Arabi

**Status:** Aprovado pelo Everton em 2026-11-06, com as recomendações do Spec (seção 2, notas 4, 6, 7 e 8). Implementação em branch `feat/layout-design-system`, sem merge na `main` sem ordem dele.
**Data:** 2026-11-06
**Base:** `PRDS_E_SPECS/PRD_LAYOUT_DESIGN_SYSTEM.md` (aprovado em 2026-11-06, decisões (a) a (f) fechadas e não reabertas aqui)
**Código lido em:** HEAD `c121b53`
**Fonte visual:** `PRDS_E_SPECS/REFERENCIA_DESIGN_SYSTEM_BY_ARABI.html` (citada abaixo como "ref:linha")
**Prevalência:** durante a implementação este Spec prevalece sobre o PRD. Onde o código real diferiu do PRD, o código prevaleceu e a diferença está na seção "Observações".

---

## 1. Escopo em uma frase

Só CSS (20 arquivos) mais a troca de um caractere (🟡 → 🟠) em dois `.jsx`. Em duas etapas: **Etapa 1** troca cada cor escrita por extenso por uma variável `var(--ba-*)` sem mudar a aparência de propósito; **Etapa 2** troca os valores das variáveis pelos do Design System e ajusta formato (pílula, raios, foco, fontes). Entre as duas há uma **parada** para o Everton conferir o visual.

Por quê em duas etapas: se a Etapa 1 estragar algo, o defeito é de "variável esquecida" e fácil de achar; se a Etapa 2 estragar, é de "visual novo" e é decisão de gosto. Misturar as duas esconde a causa.

---

## 2. Observações (código real × PRD)

Conferência feita contra o código em `c121b53`. **As linhas do PRD batem** (todas as citações de `arquivo:linha` conferidas por leitura). Contagem por linha de cor fixa: **191 em 19 arquivos**, igual ao PRD (conferida somando a tabela abaixo). Diferenças e decisões técnicas que o Spec toma:

1. **Gap do botão: PRD diz 18px, o artefato diz 20px.** PRD (Risco 7) cita "`gap: 18px`"; o artefato escreve `gap:20px` em `ref:580` e no texto `ref:572`. Irrelevante na prática: os botões do app não têm seta, então **não se usa gap**. Registrado só para não replicar o número errado.
2. **Barra inferior: altura real medida.** `BottomBar.module.css:8` (`padding: 10px 16px`) + botões de `min-height: 44px` (`:24`, `:40`, `:51`) + borda de 1px (`:7`) = **65px** hoje, abaixo dos 80px reservados. Com pílula de `min-height: 48px` (escolha deste Spec, em vez dos 54px do artefato `ref:571`) a barra fica com **69px**. Mesmo assim os sete `.espacoBar` sobem de 80px para **88px**, juntos, como o PRD exige (Risco 7), para deixar folga e não depender de a barra nunca quebrar linha.
3. **A Revisão do Cliente tem barra fixa própria**, não a `BottomBar`: `StepRevisao.module.css:127-137` (`.botoesBottom`, com `#fff` na linha 132 e `#ddd` na 133, ambas entram no mapa). Tem `padding-bottom: 100px` na página (`StepRevisao.module.css:5`) e o mesmo vale para `StepRevisaoVendedor.module.css:5`. É isso que torna seguros os dois `.espacoBar` de 20px (`StepRevisao.module.css:156`, `StepRevisaoVendedor.module.css:55`): **não mudam**. A barra da Revisão (padding 12px + botão 48px + borda) = 73px < 100px.
4. **Decisão (c) × CA-10 (texto do botão "contorno dourado").** A decisão (c) diz "borda e texto `--ba-gold-deep`", mas `--ba-gold-deep` (`#a77d0b`) sobre papel dá 3,3:1 (`ref:447`, citado no Risco 1 do PRD) e o CA-10 proíbe `color: var(--ba-gold-deep)` em texto pequeno. **Resolução do Spec:** nos botões contorno (`.btnVendedor`, `.btnImportar`) a **borda** é `--ba-gold-deep` e o **texto** é `--ba-gold-text` (`#8a6608`, 4,6:1). Consequência: a lista definitiva do CA-10 fica **vazia** (nenhuma ocorrência de `color: var(--ba-gold-deep)` no projeto). Nenhum título usa dourado (títulos ficam em `--ba-ink`; só o texto do `.logo` do Header é dourado, e sobre fundo escuro usa `--ba-gold`).
5. **Hover do botão contorno:** o artefato tem duas versões (`ref:139-142`). Para fundo claro usa `bg gold-deep` + texto branco (contraste ruim, 3,3:1). O Spec usa a versão de fundo escuro (`ref:140`): hover = fundo `--ba-gold` + texto `--ba-on-gold` (contraste alto).
6. **Sem tokens novos.** O PRD (CA-01) só admite os tokens do bloco do artefato (`ref:738-771`). O app precisa de fundos claros de estado (hoje `#fde8ea`, `#e8f5e9`, `#fff8e1`, `#fff8e6`) e de transparências (overlay, sombra, anel de foco) que o bloco não traz. **Decisão:** usar `color-mix(in srgb, var(--ba-X) N%, ...)` direto nos módulos, com as porcentagens da tabela "Receitas" (seção 4). Não cria token, não escreve hex nem `rgba`, e o CA-01 continua verdadeiro. Suporte: navegadores modernos (2023+); o app roda em celular e desktop atuais. Se `npm run build` reclamar de `color-mix`, **parar e registrar em Desvios** (Vite `^5.4.8`, `package.json:22`).
7. **Cinzas neutros sem token no artefato.** O PRD não diz o que fazer com `#555`, `#ccc` etc. O Spec fecha o mapa na seção 4. Na Etapa 1 vários cinzas parecidos colapsam num só token (ex.: `#444`, `#555`, `#666`, `#888`, `#999` → `--ba-muted-aa`); a mudança é pequena mas **existe**, e o Everton deve esperar "quase igual", não "idêntico", na parada 1.
8. **Interpretação coerente com a decisão (e):** os botões secundários que dividem a mesma barra ou janela com um primário em pílula também viram pílula (BottomBar `.btnSecundario`, `.btnSecundarioModal`, `.btnRisco`, os dois botões do diálogo de rascunho, `.btnAdicionarContrato`). Um primário em pílula ao lado de um secundário de 6px ficaria quebrado. O PRD lista só os primários; se o Everton não quiser isso, basta vetar na aprovação do Spec.
9. **Hover com elevação (`translateY`) e halo do artefato (`ref:585`) NÃO entram.** O PRD só pede transição padronizada (item 6 de "O que será adicionado"), não movimento. Hover muda só fundo/cor.

---

## 3. Bloco de tokens (`src/index.css`)

Copiado de `ref:738-771`. Os **nomes** e as **fontes/raios** são finais desde a Etapa 1. As **cores** entram na Etapa 1 com o valor antigo (coluna "Etapa 1") e na Etapa 2 passam ao valor do artefato (coluna "Etapa 2 = artefato"). Tokens que a Etapa 1 não usa já entram com o valor final.

| Token | Etapa 1 (valor de hoje) | Etapa 2 = artefato (`ref`) |
|---|---|---|
| `--ba-gold` | `#c8a84b` | `#e3b838` (`ref:740`) |
| `--ba-gold-hover` | `#e3b838` (não usado na E1) | `#edc94f` (`ref:741`) |
| `--ba-gold-soft` | `#f0d781` (não usado) | `#f0d781` (`ref:742`) |
| `--ba-gold-deep` | `#c8a84b` (só bordas de contorno) | `#a77d0b` (`ref:743`) |
| `--ba-on-gold` | `#17140b` (não usado na E1) | `#17140b` (`ref:744`) |
| `--ba-ink` | `#1a1a1a` | `#101411` (`ref:745`) |
| `--ba-ink-soft` | `#1a201c` (não usado) | `#1a201c` (`ref:746`) |
| `--ba-ink-deep` | `#000000` | `#080a09` (`ref:747`) |
| `--ba-paper` | `#f7f5f0` | `#f5f0e6` (`ref:748`) |
| `--ba-paper-deep` | `#e0d8c8` | `#e9e1d2` (`ref:749`) |
| `--ba-white` | `#ffffff` | `#fffef9` (`ref:750`) |
| `--ba-muted` | `#999999` | `#6d716d` (`ref:751`) |
| `--ba-line` | `#cccccc` | `rgba(16,20,17,.14)` (`ref:752`) |
| `--ba-line-dark` | `rgba(255,255,255,.16)` (não usado) | `rgba(255,255,255,.16)` (`ref:753`) |
| `--ba-gold-text` | `#7a6030` | `#8a6608` (`ref:756`) |
| `--ba-muted-aa` | `#555555` | `#5f635f` (`ref:757`) |
| `--ba-ok` | `#1b5e20` | `#2f6b45` (`ref:758`) |
| `--ba-warn` | `#b8860b` | `#9a5b1f` (`ref:759`) |
| `--ba-danger` | `#c0392b` | `#a32f2b` (`ref:760`) |
| `--ba-font-display` | `Georgia, "Times New Roman", serif` | idem (`ref:763`) |
| `--ba-font-body` | `"Helvetica Neue", Helvetica, Arial, sans-serif` | idem (`ref:764`) |
| `--ba-radius-pill` | `999px` | idem (`ref:767`) |
| `--ba-radius-card` | `14px` | idem (`ref:768`) |
| `--ba-radius-field` | `9px` | idem (`ref:769`) |
| `--ba-speed` | `.18s` | idem (`ref:770`) |

Ao fim da Etapa 2 não pode sobrar nenhum comentário ou nome com "antigo/temp/old" (CA-01). Na Etapa 1 os valores da coluna "Etapa 1" ficam em `:root` **sem** comentário "temporário": basta que a Etapa 2 os substitua.

**Regras do artefato aplicadas na Etapa 2 (com origem):**
- Foco global: `:focus-visible { outline: 3px solid var(--ba-gold); outline-offset: 4px }` (`ref:48`, texto em `ref:299`).
- Campo em foco: borda `--ba-gold` + anel de 3px (`ref:597-600`): `outline: none; border-color: var(--ba-gold); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ba-gold) 12%, transparent)`.
- Campo: raio 9px, padding `0 13px` na referência (`ref:596`); no app o `padding` vertical atual dos inputs fica (não se reescreve), só o raio, a borda e a altura mudam.
- Botão primário: fundo `--ba-gold`, borda 1px `--ba-gold`, texto `--ba-on-gold`, pílula 999px, hover `--ba-gold-hover` (`ref:576-586`, `ref:137-138`).
- Botão contorno: fundo transparente, borda dourada (`ref:139`); no papel a borda é `--ba-gold-deep` (`ref:141`).
- Transição de interface `.15s` a `.18s` (`ref:671`); o Spec usa `var(--ba-speed)`.
- Movimento reduzido: bloco de `ref:677-683`, copiado exatamente, no fim de `index.css`.
- Estado nunca é dourado (`ref:718-720`).
- Títulos em Georgia peso 400 (PRD item 3; `ref:261-266`).

---

## 4. Mapa de cores, arquivo a arquivo (Etapa 1)

### 4.1 Cores com mais de um papel, e qual token vale

| Cor atual | Papel A → token | Papel B → token | Critério de escolha |
|---|---|---|---|
| `#c8a84b` | Texto/logo dourado sobre fundo escuro (Header, texto do botão escuro) → `--ba-gold` | Borda de item **selecionado** (`.ativo`, `.chipAtivo`, `.opcaoAtiva`, `.btnEletro`) e anel/contorno de foco (`outline`, `border-color` em `:focus`) → `--ba-gold` | Ouro é identidade/ação (`ref:718`) |
| `#c8a84b` | Borda de botão **contorno** (`.btnVendedor`, `.btnImportar`, `.btnModalSecundario` atual) → `--ba-gold-deep` | Borda da **caixa de aviso/CC** (4 locais do PRD) → `--ba-warn` | Aviso comunica risco = estado, e "estado nunca é dourado" |
| `#1a1a1a` | Fundo do Header e de botões escuros → `--ba-ink` (na E2 o fundo do botão vira `--ba-gold`, o do Header continua tinta) | Cor de texto escuro (`.titulo`, `.btnImportar` etc.) → `--ba-ink` | Mesmo token nos dois; muda só a regra do botão na E2 |
| `#7a6030` | Texto de item selecionado e do `.btnVendedor` → `--ba-gold-text` | Texto de **aviso/CC** (`StepPerguntasPorAmbiente.module.css:51`, `StepRevisaoVendedor.module.css:20`) → `--ba-warn` | Mesma regra do `#c8a84b`: aviso é estado |
| `#7a4f00` | Só em `.aviso` (`StepPerguntasGlobais.module.css:165`) → `--ba-warn` | — | Aviso |
| `#b8860b` | Nível MÉDIO (badge, título, card) → `--ba-warn` | Mensagem de CEP (`StepIdentificacao.module.css:40`) → `--ba-warn` | Dois usos, mesmo token (PRD) |
| `#f5f0e8` | Fundo neutro (Stepper, botões redondos, sufixo "mm") → `--ba-paper` | Fundo de `.avisoCard` (`StepRevisao.module.css:84`) → tinta de `--ba-warn` (receita R3) | O avisoCard é caixa de CC |
| `#fff8e6` / `#fff8e1` | Fundo de item selecionado → tinta de `--ba-gold` (receita R1) | Fundo de aviso → tinta de `--ba-warn` (R3); fundo de nível MÉDIO → R2 | Pelo papel do elemento |
| `#fff` | Fundo de card/campo/barra → `--ba-white` | `color: #fff` do `.btnRisco` (`StepPerguntasGlobais.module.css:152`) → `--ba-white` | Mesmo token |
| `#000` | Hover de botão escuro (4 locais) → `--ba-ink-deep` (na E2 o hover vira `--ba-gold-hover`) | — | — |

### 4.2 Neutros sem token no artefato

| Cor atual | Token | Observação |
|---|---|---|
| `#222`, `#333`, `#444` (texto) | `--ba-ink` | texto principal |
| `#555`, `#666`, `#888`, `#999` (texto) | `--ba-muted-aa` | texto secundário que passa AA (`ref:757`) |
| `#999` em campo **desabilitado** (`StepPerguntasAmbienteVendedor.module.css:76`) | `--ba-muted` | texto desabilitado não precisa passar AA |
| `#aaa` (Header `.etapa`, texto sobre tinta) | `color-mix(in srgb, var(--ba-white) 62%, transparent)` | igual ao "texto discreto" do artefato em escuro (`ref:22`) |
| `#ccc`, `#ddd`, `#eee`, `#f0f0f0` (bordas) | `--ba-line` | linha do DS (`ref:752`) |
| `#e0d8c8` (borda de card) | `--ba-paper-deep` | |
| `#f5f5f5`, `#f9f7f3` (fundos neutros) | `--ba-paper` | |
| `#f7f5f0` (body) | `--ba-paper` | |

### 4.3 Receitas de tinta e transparência (sem hex, sem `rgba`)

| Receita | Uso | Fórmula |
|---|---|---|
| R1 | Fundo de item selecionado (era `#fff8e6`) | `color-mix(in srgb, var(--ba-gold) 14%, var(--ba-white))` |
| R2 | Fundo de nível: ALTO / MÉDIO / BAIXO (eram `#fde8ea`, `#fff8e1`, `#e8f5e9`) | `color-mix(in srgb, var(--ba-danger) 10%, var(--ba-white))`, idem com `--ba-warn`, idem com `--ba-ok` |
| R3 | Fundo de caixa de aviso/CC (eram `#fff8e6`, `#f5f0e8`) | `color-mix(in srgb, var(--ba-warn) 8%, var(--ba-white))` |
| R4 | Overlay de janela (era `rgba(0,0,0,.55)`) | `color-mix(in srgb, var(--ba-ink-deep) 55%, transparent)` |
| R5 | Sombra da caixa do Modal (era `rgba(0,0,0,.2)`) | `0 8px 32px color-mix(in srgb, var(--ba-ink-deep) 20%, transparent)` |
| R6 | Anel de foco de campo | `0 0 0 3px color-mix(in srgb, var(--ba-gold) 12%, transparent)` |
| R7 | Hover do `.btnImportar` na E1 (era `rgba(200,168,75,.15)`) | `color-mix(in srgb, var(--ba-gold) 15%, transparent)` (na E2 é substituído pelo hover de contorno, nota 5) |

As receitas R1 a R3 já entram na **forma final** na Etapa 1 (não existe hex antigo equivalente num token); por isso essas linhas já ficam levemente diferentes na parada 1. Isso é esperado.

### 4.4 Mapa por arquivo e linha (Etapa 1)

Formato: `linha: cor atual → token`. "E2:" indica a mudança de regra da Etapa 2 sobre a mesma linha (detalhada na seção 5).

**`src/index.css` (9)**
- 12: `#f7f5f0` → `--ba-paper` · 13: `#222` → `--ba-ink`
- 30: `rgba(0,0,0,.55)` → R4
- 39: `#fff` → `--ba-white`
- 52: `#555` → `--ba-muted-aa`
- 71: `#1a1a1a` → `--ba-ink` (E2: fundo `--ba-gold`) · 72: `#c8a84b` → `--ba-gold` (E2: `--ba-on-gold`)
- 77: `#555` → `--ba-muted-aa` · 78: `#ccc` → `--ba-line`

**`src/components/Header/Header.module.css` (3)**
- 2: `#1a1a1a` → `--ba-ink` · 3: `#c8a84b` → `--ba-gold` · 22: `#aaa` → texto discreto sobre tinta (4.2)

**`src/components/FieldGroup/FieldGroup.module.css` (4)**
- 2: `#fff` → `--ba-white` · 3 e 13: `#e0d8c8` → `--ba-paper-deep` · 12: `#1a1a1a` → `--ba-ink`

**`src/components/Modal/Modal.module.css` (3)**
- 4: `rgba(0,0,0,.55)` → R4 · 13: `#fff` → `--ba-white` · 18: sombra → R5

**`src/components/ScoreBadge/ScoreBadge.module.css` (3 linhas, 6 cores)**
- 9 `.alto`: `#fde8ea`/`#c0392b` → R2(danger) / `--ba-danger`
- 10 `.medio`: `#fff8e1`/`#b8860b` → R2(warn) / `--ba-warn`
- 11 `.baixo`: `#e8f5e9`/`#1b5e20` → R2(ok) / `--ba-ok`

**`src/components/Stepper/Stepper.module.css` (4)**
- 2: `#f5f0e8` → `--ba-paper` · 4: `#ddd` → `--ba-line` · 12: `#888` → `--ba-muted-aa` · 20: `#1a1a1a` → `--ba-ink`

**`src/components/BottomBar/BottomBar.module.css` (9)**
- 6: `#fff` → `--ba-white` · 7: `#ddd` → `--ba-line`
- 16 `.btnPrimario`: `#1a1a1a` → `--ba-ink` (E2: `--ba-gold`) · 17: `#c8a84b` → `--ba-gold` (E2: `--ba-on-gold`)
- 34 `.btnSecundario`: `#555` → `--ba-muted-aa` · 35: `#ccc` → `--ba-line`
- 44 `.btnVendedor`: `#f5f0e8` → `--ba-paper` (E2: `transparent`) · 45: `#7a6030` → `--ba-gold-text` · 46: `#c8a84b` → `--ba-gold-deep`

**`src/screens/SelecaoPerfil/SelecaoPerfil.module.css` (13)**
- 15 `.titulo`: `#1a1a1a` → `--ba-ink` · 20 `.subtitulo`: `#555` → `--ba-muted-aa`
- 33 `.btnPerfil`: `#1a1a1a` → `--ba-ink` (E2 `--ba-gold`) · 34: `#c8a84b` → `--ba-gold` (E2 `--ba-on-gold`) · 45 hover: `#000` → `--ba-ink-deep` (E2 `--ba-gold-hover`)
- 52 `.btnImportar`: `#1a1a1a` → `--ba-ink` (E2 `--ba-gold-text`) · 53: `#c8a84b` → `--ba-gold-deep` · 65 hover → R7 (E2 ver 5.5)
- 74 `.btnModal`: `#1a1a1a` → `--ba-ink` (E2 `--ba-gold`) · 75: `#c8a84b` → `--ba-gold` (E2 `--ba-on-gold`) · 86 hover: `#000` → `--ba-ink-deep` (E2 `--ba-gold-hover`)
- 91 `.btnModalSecundario`: `#1a1a1a` → `--ba-ink` (E2 `--ba-muted-aa`) · 92: `#c8a84b` → `--ba-gold-deep` (E2: `1px solid var(--ba-line)`, decisão (e): neutro)

**`src/steps/StepAmbientes/StepAmbientes.module.css` (8)**
- 8: `#555` → `--ba-muted-aa` · 13: `#fff` → `--ba-white` · 14: `#e0d8c8` → `--ba-paper-deep` · 41: `#ccc` → `--ba-line` · 42: `#f5f0e8` → `--ba-paper` · 68: `#666` → `--ba-muted-aa` · 72: `#ccc` → `--ba-line` · 80: `#c0392b` → `--ba-danger`

**`src/steps/vendedor/StepAmbientesVendedor/StepAmbientesVendedor.module.css` (8)** — mesmas linhas e mesmos tokens do arquivo acima (8, 13, 14, 41, 42, 68, 72, 80).

**`src/steps/StepIdentificacao/StepIdentificacao.module.css` (7)**
- 16: `#444` → `--ba-ink` · 21: `#ccc` → `--ba-line` · 29 (`outline: 2px solid #c8a84b`) e 30 (`border-color`): `--ba-gold` · 34: `#c0392b` → `--ba-danger` · 40 (`.aviso` de CEP): `#b8860b` → `--ba-warn` · 46: `#888` → `--ba-muted-aa`

**`src/steps/vendedor/StepIdentificacaoVendedor/StepIdentificacaoVendedor.module.css` (9)**
- 16 `--ba-ink` · 21 `--ba-line` · 29/30 `--ba-gold` · 34 `--ba-danger` · 49 `#ccc` → `--ba-line` · 50 `#f5f0e8` → `--ba-paper` · 60 `#555` → `--ba-muted-aa` · 61 `#ccc` → `--ba-line`

**`src/steps/StepSucesso/StepSucesso.module.css` (4)** e **`StepSucessoVendedor.module.css` (4)** — mesmas linhas:
- 20 `.titulo`: `#1a1a1a` → `--ba-ink` · 25 `.texto`: `#555` → `--ba-muted-aa` · 31 `.btnNovo`: `#1a1a1a` → `--ba-ink` (E2 `--ba-gold`) · 32: `#c8a84b` → `--ba-gold` (E2 `--ba-on-gold`)

**`src/steps/StepPerguntasGlobais/StepPerguntasGlobais.module.css` (24)**
- 9 `#222` → ink · 16 `#333` → ink · 30 `#ccc` → line · 32 `#fff` → white
- 41 borda `.ativo`: `#c8a84b` → gold · 42: `#fff8e6` → R1 · 44: `#7a6030` → gold-text
- 61 `#ddd` → line · 72 `#ccc` → line · 74 `#f5f5f5` → paper · 88 `#ccc` → line · 90 `#fff` → white
- 98/99/100 `.chipAtivo`: gold / R1 / gold-text
- 119 `#ccc` → line · 129 `.modalTitulo`: `#c0392b` → danger · 141 `#555` → muted-aa · 142 `#ccc` → line
- 151 `.btnRisco` fundo: `#c0392b` → danger · 152 texto `#fff` → white
- 165 `.aviso` texto `#7a4f00` → **warn** · 166 fundo `#fff8e6` → **R3** · 167 borda `#c8a84b` → **warn**
(abreviações: ink = `--ba-ink`, line = `--ba-line`, white = `--ba-white`, paper = `--ba-paper`, gold = `--ba-gold`, gold-text = `--ba-gold-text`, danger = `--ba-danger`, warn = `--ba-warn`, muted-aa = `--ba-muted-aa`.)

**`src/steps/StepPerguntasPorAmbiente/StepPerguntasPorAmbiente.module.css` (30)**
- 9 `#222` → ink · 16 `#333` → ink · 30 `#ccc` → line · 32 `#fff` → white
- 39 (`.ativo`, com `!important`, mantido): gold · 40: R1 (`!important` mantido) · 42: gold-text
- 46 `.aviso` fundo: R3 · 47 borda: warn · 51 texto `#7a6030`: **warn**
- 65 `#555` → muted-aa · 71 `#ccc` → line · 80 (`outline`): gold · 84 `#c0392b` → danger
- 109 `#ddd` → line · 121 `#ccc` → line · 123 `#fff` → white
- 131/132/133 `.chipAtivo`: gold / R1 / gold-text
- 145 `#ccc` → line · 147 `#fff` → white
- 167/169/170 `.btnEletro`: gold / R1 / gold-text (botão de ação dourado, não é estado)
- 176 `#f9f7f3` → paper · 177 `#e0d8c8` → paper-deep
- 193 `#c0392b` → danger · 201 `#ccc` → line · 211 `#999` → muted-aa

**`src/steps/StepRevisao/StepRevisao.module.css` (25)**
- 11 `#1a1a1a` → ink · 21 `#c0392b` → danger · 33 `#eee` → line
- 36/37/38 `.tituloAlto/Medio/Baixo`: danger / **warn** / ok
- 45 `#f0f0f0` → line
- 55/56 `.btnEditar` fundo/borda: ink (E2 gold) · 62 texto: gold (E2 on-gold) · 68 hover `#000` → ink-deep (E2 gold-hover)
- 79/80/81 `.cardAlto/Medio/Baixo`: fundo R2(danger/warn/ok) e `border-left` 3px danger / **warn** / ok
- 84 `.avisoCard` fundo: R3 · 85 `border-left`: warn
- 96 `#888` → muted-aa · 111 `#f5f5f5` → paper · 112 `#ddd` → line · 118 `#333` → ink · 122 `#c0392b` → danger
- 132 `#fff` → white · 133 `#ddd` → line
- 141 `.btnGerar` fundo: ink (E2 gold) · 142 texto: gold (E2 on-gold)

**`src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.module.css` (16)**
- 9 `#222` → ink · 27 `#ccc` → line · 29 `#fff` → white
- 36/37/39 `.opcaoAtiva`: gold / R1 / gold-text
- 56 `#ccc` → line · 71 (`outline`): gold · 75 `#f5f5f5` → paper · 76 `#999` (desabilitado) → `--ba-muted`
- 81 `#666` → muted-aa · 83 `#f5f0e8` → paper · 94 `#555` → muted-aa · 99 `#c0392b` → danger
- 107 `#ccc` → line · 117 `#999` → muted-aa

**`src/steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.module.css` (8)**
- 11 `#1a1a1a` → ink · 15 `.avisoChecklist` fundo: R3 · 16 borda: warn · 20 texto `#7a6030`: **warn**
- 33 `#eee` → line · 38 `#333` → ink · 44 `#c0392b` → danger · 50 `#c0392b` → danger

**Conferência de soma:** index 9 + BottomBar 9 + FieldGroup 4 + Header 3 + Modal 3 + ScoreBadge 3 + Stepper 4 + SelecaoPerfil 13 + StepAmbientes 8 + StepIdentificacao 7 + Globais 24 + PorAmbiente 30 + Revisao 25 + Sucesso 4 + AmbVend 8 + IdentVend 9 + PerguntasAmbVend 16 + RevisaoVend 8 + SucessoVend 4 = **191**. Todas as 191 linhas aparecem acima. `EscolhaProjetista.module.css` tem 0 cores (16 linhas, lido) e é tratado na seção 5.6.

---

## 5. Etapa 2 — regras de formato (sobre o que a Etapa 1 deixou)

### 5.1 `src/index.css`
- Valores do `:root` passam para a coluna "Etapa 2" da seção 3.
- `body` (`:9-15`): `font-family: var(--ba-font-body)` no lugar da pilha de `:11`.
- Novo: `h1, h2, h3 { font-family: var(--ba-font-display); font-weight: 400; }`.
- Novo: `:focus-visible` global (seção 3) e o bloco `prefers-reduced-motion` de `ref:677-683`.
- Diálogo de rascunho: `.rascunho-card` raio `:40` (10px) → `var(--ba-radius-card)`; botões `:62-68`: raio `:64` → `var(--ba-radius-pill)`; `:first-child` (`:70-73`) vira primário dourado (seção 5.3); `.btn-secundario` (`:75-79`) fica contorno neutro (já é; só segue os tokens).

### 5.2 Tipografia de títulos (peso 400, Georgia)
Acrescentar `font-family: var(--ba-font-display); font-weight: 400;` nas classes `.titulo` de `SelecaoPerfil.module.css:13`, `FieldGroup.module.css:9`, `StepRevisao.module.css:8`, `StepSucesso.module.css:18`, `StepSucessoVendedor.module.css:18`, `StepRevisaoVendedor.module.css:8`; em `.nomeEtapa` (`Stepper.module.css:17`, **remover** `font-weight: 700` da `:19`); em `.logo` (`Header.module.css:13-18`, trocar `font-family: Georgia, serif` por `var(--ba-font-display)` e **remover** `font-weight: bold` da `:16`); em `.modalTitulo` (`StepPerguntasGlobais.module.css:126`). Os `h3` de `.secao h3` já são cobertos pela regra global.
Não alterar `font-weight` de badges, botões e rótulos (não são títulos).

### 5.3 Botão primário (pílula dourada)
Aplica-se a: `BottomBar .btnPrimario` (`:15-25`), `SelecaoPerfil .btnPerfil` (`:32-42`) e `.btnModal` (`:73-83`), `StepRevisao .btnEditar` (`:54-65`) e `.btnGerar` (`:139-149`), `StepSucesso .btnNovo` e `StepSucessoVendedor .btnNovo` (`:30-39`), `index.css .rascunho-acoes button:first-child` (`:70-73`).
Regra: `background: var(--ba-gold)`, `color: var(--ba-on-gold)`, `border: 1px solid var(--ba-gold)`, `border-radius: var(--ba-radius-pill)`, `font-weight: 600`, `transition: background var(--ba-speed)`; hover `background: var(--ba-gold-hover)` (os hovers `#000` existentes em `SelecaoPerfil:44-46`, `:85-87` e `StepRevisao:67-69` viram isso). Tamanhos (`min-height`, `padding`, `font-size`) ficam como estão, exceto na BottomBar (5.4). `:disabled` com `opacity` continua.
Este é o botão **`.btnModal`** da decisão (e) ("Fechar", "Sim, importar").

### 5.4 BottomBar e botão "Vendedor" (decisão c, Risco 7)
- `.bar` (`:1-13`): fundo `--ba-white`, borda `--ba-line` (já na E1). Sem mudança de `padding`/`gap`.
- Os três botões: `border-radius: var(--ba-radius-pill)`, `min-height: 48px` (de 44px), `padding` vertical zero e horizontal `0 20px` (`.btnPrimario`), `0 16px` (`.btnSecundario`), `0 14px` (`.btnVendedor`, mantém `white-space: nowrap` e `font-size: 0.85rem`). Tamanhos de fonte não mudam: é isso que garante os 3 botões em 375px.
- `.btnSecundario`: contorno neutro (`transparent`, texto `--ba-muted-aa`, borda `1px solid var(--ba-line)`).
- `.btnVendedor` = botão contorno do DS: `background: transparent`, `color: var(--ba-gold-text)`, `border: 1px solid var(--ba-gold-deep)`; hover `background: var(--ba-gold)` + `color: var(--ba-on-gold)` (nota 5).
- **Os sete `.espacoBar` passam de 80px para 88px, na mesma task:** `StepPerguntasGlobais.module.css:161`, `StepPerguntasPorAmbiente.module.css:217`, `StepAmbientes.module.css:86`, `StepAmbientesVendedor.module.css:86`, `StepPerguntasAmbienteVendedor.module.css:123`, `StepIdentificacao.module.css:56-58`, `StepIdentificacaoVendedor.module.css:71-73`. Os de 20px (`StepRevisao:156`, `StepRevisaoVendedor:55`) ficam (nota 3).

### 5.5 Tela inicial (decisão e) e demais botões
- `.btnImportar` (`SelecaoPerfil.module.css:49-62`): `.btn-outline` do DS: `background: transparent`, `color: var(--ba-gold-text)`, `border: 2px solid var(--ba-gold-deep)` (mantém 2px, mais legível), `border-radius: var(--ba-radius-pill)`, hover `--ba-gold` + `--ba-on-gold`. Mantém `margin-top: 28px`, `min-height: 48px`, `max-width: 320px`: continua **abaixo** de "Cliente" e "Projetista" e menos chamativo que os dois (decisão e).
- `.btnModalSecundario` (`:89-99`, "Cancelar"): contorno neutro, igual ao `.btnSecundario` da BottomBar: `color: var(--ba-muted-aa)`, `border: 1px solid var(--ba-line)`, pílula.
- `.btnPerfil`, `.btnModal`: seção 5.3, pílula (raio de `:37` e `:78` passam de 8px a pílula).
- Hierarquia final da tela inicial e dos modais (decisão e): **primário** = pílula dourada preenchida; **contorno dourado** = Importar PDF; **contorno neutro** = Cancelar. Largura total no modal continua vindo de `Modal.module.css:26-29` (não mexer).
- Secundários que acompanham primários, pílula neutra (nota 8): `StepPerguntasGlobais .btnSecundarioModal` (`:139-148`), `.btnAdicionarContrato` (`StepIdentificacaoVendedor.module.css:58-69`).
- `StepPerguntasGlobais .btnRisco` (`:150-159`): `background: var(--ba-danger)`, `color: var(--ba-white)`, pílula.

### 5.6 `EscolhaProjetista.module.css` (decisão f; hoje 16 linhas, 0 cores)
O arquivo tem `.opcao` (`:1-5`), `.apoio` (`:7-10`), `.voltar` (`:12-16`). Acrescentar, só com `var(--ba-*)`:
- `.apoio`: `color: var(--ba-muted-aa)`; fonte herdada do corpo.
- `.voltar`: `color: var(--ba-gold-text)`, `text-decoration: underline`, `font-weight: 600`, `border-radius: var(--ba-radius-field)`, `transition: color var(--ba-speed)`; foco visível vem do `:focus-visible` global (seção 3), que desenha o anel dourado.
- O link não pode ficar azul/roxo (CA-12). O título e os dois `.btnPerfil` vêm de `SelecaoPerfil.module.css`, que o `EscolhaProjetista.jsx:3` importa.

### 5.7 Estado (ScoreBadge, Revisão, avisos) e emoji
- `ScoreBadge.module.css:4`: `border-radius: 20px` → `var(--ba-radius-pill)`. Cores já feitas na E1 (MÉDIO = `--ba-warn`). Mesma coisa nas `.tituloMedio` e `.cardMedio` de `StepRevisao`.
- As quatro caixas de aviso/CC (`StepPerguntasGlobais.module.css:163-172`, `StepPerguntasPorAmbiente.module.css:45-54`, `StepRevisao.module.css:83-91`, `StepRevisaoVendedor.module.css:14-23`) ficam com o **mesmo** visual (`--ba-warn`; fundo R3). `StepIdentificacao.module.css:39-43` (CEP) segue só com cor, sem caixa.
- **Emoji (decisão d):** `src/components/ScoreBadge/ScoreBadge.jsx:5` (`MÉDIO: { emoji: '🟡', ...}`) e `src/steps/StepRevisao/StepRevisao.jsx:100` (`<h3 className={styles.tituloMedio}>🟡 Risco Médio</h3>`): trocar **somente** o caractere 🟡 por 🟠. Nada mais nesses arquivos. Medido: nenhum outro `.jsx` ou teste usa 🟡 (a busca em `src/` e `testes/` só acha esses dois; `README.md` e `especificacao-checklist-dinamica.md` também usam 🟡, mas são documentos fora do escopo do PRD e não são alterados).

### 5.8 Campos, cartões e raios
**Altura de campo (decisão b):**
- 48px: `StepIdentificacao.module.css:25` e `StepIdentificacaoVendedor.module.css:25` (`.campo input`, de 44px). Em `StepIdentificacaoVendedor` o botão redondo `.btnRemoverContrato` tem `margin-top: 22px` (`:55`), alinhado a um campo de 44px; com 48px passar para `24px` e conferir o alinhamento a olho.
- Formulários longos ficam em 44px: `StepPerguntasGlobais` (`:35`, `:147`, `:158`), `StepPerguntasPorAmbiente` (`:35`, `:151`), `StepPerguntasAmbienteVendedor` (`:32`, `:59`, `:67`) **não mudam**.
- Campos hoje com 40px sobem para **44px** (caso a caso, como o PRD pede): `StepPerguntasPorAmbiente.module.css:75` (`.campo input/select`), `StepPerguntasGlobais.module.css:122` (`.campoRebaixo input`), `StepAmbientes.module.css:76` e `StepAmbientesVendedor.module.css:76` (`.nomeField input`), `StepIdentificacaoVendedor.module.css:66` (botão `.btnAdicionarContrato`, vira 44px).
- **Não mudam de altura** (não são campos): chips de 36px (`PorAmbiente:126`, `Globais:93`) e botões redondos de 36px (`StepAmbientes:38-39`, `StepAmbientesVendedor:38-39`, `StepIdentificacaoVendedor:46-47`).

**Foco de campo (substitui `outline: 2px solid`):**
`StepIdentificacao.module.css:28-31`, `StepIdentificacaoVendedor.module.css:28-31`, `StepPerguntasPorAmbiente.module.css:78-81`: `outline: none; border-color: var(--ba-gold); box-shadow: R6`. Em `StepPerguntasAmbienteVendedor.module.css:70-72` o foco está no `<input>` dentro de `.inputComSufixo`: `.inputComSufixo input:focus { outline: none }` e `.inputComSufixo:focus-within { border-color: var(--ba-gold); box-shadow: R6 }`. Campos sem regra própria de foco (ex.: `.nomeField input`, `.campoRebaixo input`, `.textarea`) recebem o anel global de `:focus-visible`.

**Raios (`border-radius`), por linha medida:**
- 6px de campo, Sim/Não, opção, textarea, caixa de aviso e cartão pequeno → `var(--ba-radius-field)`: `PorAmbiente` 31, 48, 72, 146, 202; `Ident` 22; `IdentVend` 22; `StepAmbientes` 73; `StepAmbientesVendedor` 73; `Globais` 31, 120, 168; `Revisao` 72, 86, 113; `PerguntasAmbVend` 28, 57, 108; `RevisaoVend` 17.
- Botões (6px/8px) → `var(--ba-radius-pill)`: `BottomBar` 20, 37, 48; `SelecaoPerfil` 37, 55, 78, 94; `Revisao` 57, 145; `Sucesso` 35; `SucessoVend` 35; `Globais` 144, 155; `IdentVend` 63; `index.css` 64.
- Chips e badge (20px) → `var(--ba-radius-pill)`: `PorAmbiente` 122, 168; `Globais` 73, 89; `ScoreBadge` 4.
- Cartões (8px/10px) → `var(--ba-radius-card)`: `FieldGroup` 4; `StepAmbientes` 15; `StepAmbientesVendedor` 15; `PorAmbiente` 178; `Modal` 14; `index.css` 40.
- `50%` (botões redondos) não muda.

**Transição:** `StepPerguntasGlobais.module.css:36` (`transition: all 0.15s`, a única do projeto) → `transition: background var(--ba-speed), border-color var(--ba-speed), color var(--ba-speed)`. Botões e campos que não têm transição ganham `transition: background var(--ba-speed), border-color var(--ba-speed), color var(--ba-speed)` (primários, contornos, secundários, `.campo input`).

### 5.9 CSS compartilhado com a Venda futura (conferir `/futura/*`)
Medido por leitura de import: `StepRevisaoFutura.jsx:6` usa `StepRevisaoVendedor.module.css`; `StepSucessoFutura.jsx:3` usa `StepSucessoVendedor.module.css`; a identificação da Venda futura é o `StepIdentificacao` com props (`App.jsx:184-194`); `EscolhaProjetista.jsx:3` usa `SelecaoPerfil.module.css`. Portanto **qualquer edição** em `StepRevisaoVendedor`, `StepSucessoVendedor`, `StepIdentificacao` e `SelecaoPerfil` muda também `/futura/*` e `/projetista`. Regra para quem implementa: depois de cada task que toque um desses quatro arquivos, abrir `/futura/*` (ou `/projetista`) em 375px e conferir. Estes arquivos entram **só** nas tasks marcadas "(conferir /futura)" do Plano.

---

## 6. Arquivos que o Spec toca (e só eles)

- CSS (20): `src/index.css`; `src/components/{BottomBar,FieldGroup,Header,Modal,ScoreBadge,Stepper}/*.module.css` (6); `src/screens/SelecaoPerfil/SelecaoPerfil.module.css`; `src/screens/EscolhaProjetista/EscolhaProjetista.module.css`; `src/steps/{StepAmbientes,StepIdentificacao,StepPerguntasGlobais,StepPerguntasPorAmbiente,StepRevisao,StepSucesso}/*.module.css` (6); `src/steps/vendedor/{StepAmbientesVendedor,StepIdentificacaoVendedor,StepPerguntasAmbienteVendedor,StepRevisaoVendedor,StepSucessoVendedor}/*.module.css` (5). Total: 1 + 6 + 1 + 1 + 6 + 5 = 20.
- JSX (2, um caractere cada): `ScoreBadge.jsx:5`, `StepRevisao.jsx:100`.
- **Nada mais.** `git diff --name-only` ao final deve listar exatamente esses 22 arquivos (mais este Spec, se ainda não commitado).

---

## Testes

### Situação

A repo tem suíte (`testes/`, oito arquivos `*.test.js`, `npm test` = `node --test`, `package.json:10`). Busca por `.css`, `styles.`, `ScoreBadge`, `🟡` e `🟠` dentro de `testes/`: **zero ocorrências**. Nenhum teste cobre aparência, e este Spec **não inventa testes visuais** nem cria arquivos de teste. Pelo método do projeto, o que usa tela é conferido na mão; a suíte serve para provar que lógica, PDF e leitura V1 não foram quebrados por acidente.

### Testes novos

Nenhum teste automatizado novo (os critérios do PRD são de aparência ou de varredura de texto no código). Cada critério abaixo é verificado por **comando** (rodar e comparar com o esperado), por **suíte** existente, ou por **olho humano** (Everton). Dados fictícios na série 9xxx: contratos 9001 e 9002, clientes "Cliente Teste 9001" e "Cliente Teste 9002". A busca de CEP (ViaCEP) só é usada na conferência manual (CEP inexistente `99999-999`); nenhum teste automatizado faz rede.

- **T1 — CA-01 (sem cor fora dos tokens). Comando.** Entrada: `grep -rEn '#[0-9a-fA-F]{3,8}\b|rgba?\(' src --include=*.css` (ou a ferramenta Grep com o mesmo padrão). Esperado: só `src/index.css` aparece; nenhuma linha em módulos, nem em `SelecaoPerfil.module.css`. Depois, abrir `index.css`: os `--ba-*` batem com a coluna "Etapa 2" da seção 3 e nenhum nome/comentário traz "antigo", "temp" ou "old". Abrir `EscolhaProjetista.module.css` e ver que `.apoio` e `.voltar` têm regras de cor e foco usando `var(--ba-*)` (a busca não prova isso).
- **T2 — CA-02 (compila). Comando.** Entrada: `npm run build`. Esperado: termina sem erro e gera `dist/` como hoje.
- **T3 — CA-03 (Cliente, 375px). Olho humano.** Entrada: `npm run dev`, janela de 375px, percorrer tela inicial → Cliente → Identificação (nome "Cliente Teste 9001", contrato 9001) → Ambientes → Perguntas gerais → um ambiente → Revisão → Sucesso. Esperado: fundo papel; títulos em Georgia sem negrito; botões em pílula com dourado como ação principal; campos com cantos arredondados e anel dourado ao clicar; header escuro; nada cortado nem sobreposto; botão "Vendedor" visível e funcional com contorno dourado, diferente do primário; "Cliente", "Projetista" e "Importar PDF" cabem sem cortar texto. Adicional (Risco 7): numa tela com os três botões (Voltar, Vendedor, Avançar) os três cabem em **uma linha**, e ao rolar até o fim o último campo de **cada** formulário que usa um dos sete `.espacoBar` não fica atrás da barra.
- **T4 — CA-04 (Projetista Normal, 375px). Olho humano.** Entrada: tela inicial → "Projetista" → "Normal" → percorrer um ambiente de cada grupo (A, B ou C) até a Revisão do Projetista. Esperado: mesmo padrão do T3; aviso "não substitui o Checklist do Cliente" em terracota, não dourado; botão "Vendedor" ausente; último elemento da Revisão visível acima da barra.
- **T5 — CA-05 (desktop ≥1200px). Olho humano.** Entrada: repetir o percurso do T3, incluindo tela inicial e `/projetista`. Esperado: formulários continuam centralizados em `max-width: 600px`; nenhuma cor antiga (dourado `#c8a84b`, fundo `#f7f5f0`) à vista; só a paleta do Design System.
- **T6 — CA-06a (Risco Médio com score BAIXO). Olho humano.** Entrada: numa Cozinha, "Existe granito ou pia existente no local?" = Sim e "Os móveis serão adaptados para este granito/pia?" = Não; nada mais. Esperado: na Revisão, o card desse CC fica em "🟠 Risco Médio" na cor terracota (não dourado) e o badge de score do ambiente mostra **BAIXO**. (Comportamento já existente, não regressão.)
- **T7 — CA-06b (badge MÉDIO). Olho humano.** Entrada: mesma Cozinha do T6, e além disso tanque tradicional com móveis na região do tanque. Esperado: o badge do ambiente mostra **MÉDIO** na cor terracota (`--ba-warn`), com 🟠; os dois CCs aparecem em "Risco Médio".
- **T8 — CA-07 (rascunho). Olho humano.** Entrada: preencher parte do Cliente (e depois do Projetista Normal), fechar a aba, reabrir. Esperado: o diálogo de retomada aparece com o visual novo (cartão claro, botão principal dourado em pílula, "secundário" neutro) e, ao continuar, os dados voltam preenchidos, sem erro no console. A Venda futura não entra (não grava rascunho).
- **T9 — CA-08 (PDF não muda). Comando + olho humano.** Entrada: (a) `git diff --name-only` e conferir que **nenhum** arquivo de `src/services/`, `src/domain/`, `src/context/` ou `testes/` aparece; (b) gerar um PDF de cada fluxo (Cliente, Projetista, Venda futura) com os dados 9001. Esperado: (a) lista vazia nessas pastas; (b) PDFs visualmente iguais aos gerados antes da mudança (o Everton compara com um PDF gerado na task 1, antes de qualquer edição). Os dados V1 escondidos ficam cobertos pelo T16.
- **T10 — CA-09 (variável não definida). Comando + olho humano.** Entrada: listar com a ferramenta Grep todos os `var(--ba-...)` usados em `src/**/*.css` e conferir que cada nome existe em `:root` de `index.css`. Esperado: nenhum nome usado sem definição (o build não avisa nisso). Os elementos "sem cor" que escapem da busca aparecem na conferência visual dos T3, T4, T5, T11 a T15.
- **T11 — CA-11 (Venda futura, 375px). Olho humano.** Entrada: tela inicial → "Projetista" → "Venda futura"; preencher nome "Cliente Teste 9002" e contrato 9002; testar CEP `99999-999` (inexistente); avançar para `/futura/revisao`, gerar o PDF, chegar a `/futura/sucesso`, clicar "Iniciar novo preenchimento". Esperado: as três telas seguem o padrão do T3; a mensagem de CEP aparece em terracota; **não** há botão "Vendedor", `Stepper` nem diálogo de rascunho; na identificação Voltar e Avançar cabem em uma linha; na Revisão "Editar identificação" e "Gerar PDF" cabem em uma linha sem cortar texto e o último bloco de dados não fica atrás da barra.
- **T12 — CA-12 (`/projetista`). Olho humano.** Entrada: tela inicial → "Projetista", em 375px e em ≥1200px; navegar com Tab até "← Voltar". Esperado: header escuro, título "Projetista" em Georgia sem negrito, "Normal" e "Venda futura" no mesmo padrão do botão da tela inicial, cada um com a legenda legível; o link "← Voltar" **não** está azul/roxo, está dourado-escuro (`--ba-gold-text`) com anel dourado ao receber foco; clicar nele volta à tela inicial.
- **T13 — CA-13 (Importar PDF, erro). Olho humano.** Entrada: em 375px e desktop, clicar "Importar PDF" e escolher (a) um PDF sem dados do Cliente (por exemplo o PDF da Venda futura gerado no T11) e (b) um arquivo PDF acima de 20 MB. Esperado: o botão "Importar PDF" é contorno dourado sem cortar texto, com foco visível e hover coerente; nos dois casos abre a janela "PDF não possui dados para importação" com "Fechar" em largura total na **pílula dourada de texto escuro**; sem erro no console; ao fechar, a chave `byarabi_checklist_rascunho` fica intacta e o usuário segue na tela inicial; overlay escuro e caixa branca sem cor fixa.
- **T14 — CA-14 (confirmação). Olho humano.** Entrada: com um rascunho do Cliente existente, importar um `Checklist_Cliente_*.pdf` válido gerado pelo app. Esperado: janela "Já existe um preenchimento em andamento. Importar este PDF vai substituí-lo. Deseja continuar?" com "Sim, importar" em pílula dourada preenchida e "Cancelar" em contorno neutro (sem dourado), um sobre o outro, largura total; "Cancelar" fecha e o rascunho permanece intacto, sem navegar.
- **T15 — CA-15 (importação válida). Olho humano.** Entrada: importar um PDF válido do Cliente sem rascunho prévio (ou "Sim, importar" do T14). Esperado: vai direto para `/revisao` **sem** o diálogo "Continuar de onde parou?", com os dados preenchidos e o visual novo (fundo papel, badges/cards nas cores de estado, "Gerar PDF" dourado). O diálogo de rascunho comum (T8) continua aparecendo ao abrir o app com rascunho sem passar pela importação.
- **T16 — CA-16 (suíte verde). Comando (suíte existente).** Entrada: `npm test`. Esperado: todos os testes passam, **nenhum pulado**; o Everton recebe o resultado em passou/pulou/falhou com os totais. Teste que falhe ou fique pulado por falta de material bloqueia a entrega e vai para Desvios.
- **T17 — CA-17 (emoji 🟠). Comando + olho humano.** Entrada: (a) busca por `🟡` em `src/` ; (b) cenário do T7 mais um ambiente ALTO e um BAIXO. Esperado: (a) zero resultados; (b) badge MÉDIO e título "🟠 Risco Médio" com 🟠; 🔴 no ALTO e 🟢 no BAIXO; nenhum 🟡 na tela.
- **T18 — CA-10 (dourado profundo só em título/ícone). Comando.** Entrada: buscar `color:\s*var\(--ba-gold-deep\)` em `src/**/*.css`. Esperado: **zero ocorrências** (a lista permitida deste Spec é vazia; a nota 4 explica). Qualquer ocorrência é defeito: trocar por `--ba-gold-text`.
- **T19 — Cenário de erro adicional do PRD (`.espacoBar`). Comando + olho humano.** Entrada: buscar `.espacoBar` em `src/**/*.css`. Esperado: sete com `height: 88px` (os arquivos da seção 5.4) e dois com `height: 20px` (`StepRevisao`, `StepRevisaoVendedor`). Nenhum com 80px. Conferência de rolagem no T3.

**Conferência manual (sem teste automatizado):** T3 a T8, T11 a T15 e parte de T9 e T17 dependem de olhar a tela; motivo: nenhum teste do projeto renderiza interface ou lê CSS, e criar infraestrutura de teste visual está fora do escopo do PRD (e do pedido do Everton: "Sem dependência de teste além do node --test").

**Quem verifica o quê (resumo):**

| Quem | Critérios |
|---|---|
| **Comando** (Claude roda e mostra a saída) | CA-01 (T1), CA-02 (T2), CA-10 (T18), CA-09 parte de varredura (T10), espacoBar (T19), CA-08 parte (a) (T9), CA-17 parte (a) (T17) |
| **Suíte existente** (`npm test`) | CA-16 (T16); também guarda a lógica de score/CC, PDFs e leitura V1 contra quebra acidental |
| **Olho humano (Everton, com o app rodando em `npm run dev`)** | CA-03, CA-04, CA-05, CA-06a, CA-06b, CA-07, CA-08 parte (b), CA-09 parte visual, CA-11, CA-12, CA-13, CA-14, CA-15, CA-17 parte (b) |

### Testes existentes afetados

**Nenhum.** Conferido: `testes/` não referencia CSS, classes de estilo, `ScoreBadge` nem o emoji. Portanto nenhum teste existente pode ser alterado na implementação; se algum falhar, corrija o código, não o teste.

---

## Plano de Execução

Cada task termina com **Como verificar**. As tasks de uma mesma etapa podem ser commitadas juntas; sugestão de texto de commit no fim de cada etapa (Claude sugere, não executa).

### Preparação

- [ ] **Task 1 — Linha de base.** No HEAD limpo (sem editar nada): rodar `npm test` e `npm run build` e anotar totais (passou/pulou/falhou); gerar um PDF de cada fluxo (Cliente, Projetista, Venda futura) com os dados 9001/9002 e guardar fora do repositório, para comparar no T9. Opcional: prints das telas principais em 375px.
  **Como verificar:** totais anotados; build sem erro. Se `npm test` já vier vermelho ou com teste pulado, parar e avisar o Everton antes de começar.

### Etapa 1 — Tokenizar (sem mudança visual intencional)

- [ ] **Task 2 — Bloco `:root` e `index.css`.** Criar o `:root` da seção 3 em `src/index.css`, com os valores da coluna "Etapa 1", e trocar as 9 linhas de cor do próprio arquivo (seção 4.4). Não mexer em fonte, raios nem foco ainda.
  **Como verificar:** `npm run build` ok; Grep do T10 mostra que os `var(--ba-*)` usados em `index.css` existem; abrir o app: fundo e diálogo de rascunho praticamente iguais.
- [ ] **Task 3 — Componentes compartilhados.** Tokenizar `Header`, `FieldGroup`, `Modal`, `ScoreBadge` (já com MÉDIO em `--ba-warn`), `Stepper` e `BottomBar` (seção 4.4).
  **Como verificar:** Grep do padrão do CA-01 nesses 6 arquivos: zero resultados; build ok; conferir no `dev` a barra inferior, o header e um badge de score.
- [ ] **Task 4 — Tela inicial e Projetista (conferir /futura).** Tokenizar `SelecaoPerfil.module.css` (13 linhas). Não mexer ainda em `EscolhaProjetista.module.css`.
  **Como verificar:** Grep do CA-01 no arquivo: zero; abrir a tela inicial e `/projetista` (usa as mesmas classes).
- [ ] **Task 5 — Passos do Cliente.** Tokenizar `StepAmbientes`, `StepIdentificacao` (conferir /futura), `StepSucesso`, `StepPerguntasGlobais`, `StepPerguntasPorAmbiente` e `StepRevisao`, incluindo a troca das caixas de aviso/CC para `--ba-warn` e dos blocos duplicados de nível (seção 4.4).
  **Como verificar:** Grep do CA-01 nesses 6 arquivos: zero; abrir o fluxo Cliente completo e uma Revisão com CCs nos três níveis.
- [ ] **Task 6 — Passos do Projetista.** Tokenizar `StepAmbientesVendedor`, `StepIdentificacaoVendedor`, `StepPerguntasAmbienteVendedor`, `StepRevisaoVendedor` (conferir /futura) e `StepSucessoVendedor` (conferir /futura).
  **Como verificar:** Grep do CA-01 nesses 5 arquivos: zero; abrir Projetista Normal até a Revisão e a Venda futura até o Sucesso.
- [ ] **Task 7 — Fechamento da Etapa 1.** Rodar T1 (só `index.css` com cor), T10 (nenhum `var(--ba-x)` sem definição), `npm run build` e `npm test`.
  **Como verificar:** saída dos três comandos; `npm test` sem pulado. Sugestão de commit: `refactor: troca cores por variáveis --ba-* (etapa 1 do design system)`.

### >>> PARADA 1 — Everton confere o visual da Etapa 1 <<<
O app deve estar **quase igual** ao de antes (cinzas parecidos colapsaram em um só; fundos de aviso e de item selecionado mudaram um pouco de tom, nota 7 e seção 4.3). Passada rápida em Cliente, Projetista Normal, Venda futura, tela inicial e `/projetista`. Procurar: elemento sem cor ou sem fundo (variável esquecida), texto sumido. Só seguir para a Etapa 2 com o "pode seguir" do Everton.

### Etapa 2 — Aplicar o visual do Design System

- [ ] **Task 8 — Valores finais e regras globais em `index.css`.** `:root` passa para a coluna "Etapa 2"; `body` com `--ba-font-body`; regra `h1, h2, h3`; `:focus-visible` global; bloco `prefers-reduced-motion` de `ref:677-683`; diálogo de rascunho (raios, botão primário dourado, secundário neutro) — seção 5.1.
  **Como verificar:** build ok; fundo papel novo e fonte nova visíveis; Tab mostra anel dourado; T1 parte de `index.css`: nenhum comentário "antigo/temp/old".
- [ ] **Task 9 — BottomBar, botão Vendedor e os sete `.espacoBar` (juntos).** Seção 5.4: pílula de 48px, primário dourado, secundário neutro, Vendedor contorno; os sete `.espacoBar` para 88px **na mesma task** (conferir /futura, pois a Revisão da Venda futura usa a barra).
  **Como verificar:** T19 (sete com 88px, dois com 20px); em 375px os três botões em uma linha (T3 adicional); rolar até o fim de cada formulário sem campo escondido; `/futura/revisao` com "Editar identificação" e "Gerar PDF" em uma linha.
- [ ] **Task 10 — Tela inicial, modais e `/projetista` (conferir /futura).** Seções 5.3, 5.5 e 5.6: `.btnPerfil`, `.btnImportar` (contorno), `.btnModal` (primário), `.btnModalSecundario` (neutro); regras de `.apoio` e `.voltar` em `EscolhaProjetista.module.css`.
  **Como verificar:** T12, T13 e T14 (abrindo as janelas de erro e de confirmação); `EscolhaProjetista.module.css` continua sem hex nem `rgba` (T1).
- [ ] **Task 11 — Estado, emoji e caixas de aviso.** Seção 5.7: raio de pílula no badge, `.cardMedio`/`.tituloMedio` conferidos, e a troca 🟡 → 🟠 em `ScoreBadge.jsx:5` e `StepRevisao.jsx:100` (só o caractere).
  **Como verificar:** T6, T7 e T17; `git diff` desses dois `.jsx` mostra uma linha cada, só com o emoji trocado; `npm test`.
- [ ] **Task 12 — Títulos e tipografia.** Seção 5.2: `.titulo`, `.nomeEtapa`, `.logo` (sem negrito) e `.modalTitulo` em Georgia peso 400.
  **Como verificar:** olhar o Header ("By Arabi Planejados" sem negrito), o título de cada tela e o `nomeEtapa` do Stepper.
- [ ] **Task 13 — Campos, foco, cartões e raios (conferir /futura).** Seção 5.8: 48px na identificação (Cliente e Projetista; ajustar `margin-top` do `.btnRemoverContrato` para 24px), 40px→44px nos campos listados, foco com anel (R6), raios por linha, transições.
  **Como verificar:** abrir Identificação do Cliente, da Venda futura e do Projetista (clicar nos campos: borda dourada e anel); um ambiente de cada fluxo (campos de 44px, chips e botões Sim/Não com raio novo); linha de contratos adicionais do Projetista com o botão redondo alinhado ao campo.
- [ ] **Task 14 — Botões restantes (conferir /futura).** Seção 5.3 e 5.5: `.btnEditar`, `.btnGerar`, os dois `.btnNovo`, `.btnSecundarioModal`, `.btnRisco`, `.btnAdicionarContrato`.
  **Como verificar:** Revisão do Cliente (botões "Editar" e "Gerar PDF" dourados); Sucesso do Cliente, do Projetista e da Venda futura; janela de reforma em `StepPerguntasGlobais` com "Cancelar" neutro e botão de risco vermelho em pílula.
- [ ] **Task 15 — Varreduras da Etapa 2.** Rodar T1 (zero cor fora de `index.css`), T18 (zero `color: var(--ba-gold-deep)`), T10 (nenhuma variável indefinida), T19 (`.espacoBar`), busca de `🟡` em `src/` (zero), `npm run build` e `npm test`.
  **Como verificar:** saída de cada comando; `git diff --name-only` lista só os 22 arquivos da seção 6 (nenhum de `src/services/`, `src/domain/`, `src/context/`, `testes/`, `package.json`). Sugestão de commit: `feat: aplica visual do design system By Arabi (etapa 2)`.

### >>> PARADA 2 — Everton confere o visual final <<<
Passada completa com o app em `npm run dev`: T3, T4, T5, T6, T7, T8, T11, T12, T13, T14, T15, T17 (parte b) e a comparação de PDFs do T9(b). Preencher "Desvios" com qualquer coisa que ficou diferente do esperado.

### Fechamento

- [ ] **Task 16 — Pergunta sobre o CLAUDE.md.** Perguntar ao Everton se o `CLAUDE.md` deve ser atualizado: a frase "Mudança em um perfil **não** propaga para o outro" deixou de valer para o CSS de Revisão/Sucesso do Projetista e Identificação do Cliente, que a Venda futura reaproveita (seção 5.9). Se sim, **trocar** essa linha por uma que cite o CSS compartilhado, sem acrescentar linhas (limite ~100).
  **Como verificar:** resposta do Everton registrada.
- [ ] **Task 17 — Rodar a suíte inteira: verde e sem teste pulado.** `npm test` e `npm run build` no estado final; informar ao Everton o resultado em passou/pulou/falhou, com totais, comparado com a Task 1.
  **Como verificar:** saída do `npm test` sem falha e sem pulado.

Se um teste novo falhar porque o código faz diferente do esperado acima, não ajuste o esperado para ficar verde: registre em Desvios e pare. Se um teste existente que não está na lista de afetados falhar, corrija o código, não o teste.

*(Aqui "teste novo" inclui as varreduras e conferências T1 a T19: se o código fizer diferente do esperado, registrar e parar, não mudar o esperado.)*

---

## Desvios

Registrados durante a implementação (2026-11-06, branch `feat/layout-design-system`).

1. **Fundo da página e cards invertidos (pedido do Everton após ver o app rodando).**
   - **Spec/PRD previa:** fundo da página em papel (`--ba-paper`, `#f5f0e6`) e cards em branco (`--ba-white`, `#fffef9`) (PRD, premissa 2, "papel é o padrão"; Spec, seção 4.2, `#f7f5f0` → `--ba-paper`).
   - **Foi feito:** fundo da página em `--ba-white` (`src/index.css`, regra do `body`) e cards em `--ba-paper`: `FieldGroup.module.css` (`.grupo`), `StepAmbientes.module.css` e `StepAmbientesVendedor.module.css` (`.ambCard`).
   - **Ajustes de consequência, para os elementos de dentro do card não sumirem:** botões de quantidade `.qtdControle button` (Cliente e Projetista) passam a `--ba-white`; `.chipTodos button` (`StepPerguntasGlobais`) passa a `--ba-white`; `.eletroCard` (`StepPerguntasPorAmbiente`) passa a `--ba-white`; campo desabilitado `.inputComSufixo input:disabled` (`StepPerguntasAmbienteVendedor`) passa a `--ba-paper-deep`.
   - **Por quê:** o Everton achou melhor o tom mais claro por fora e o mais escuro por dentro. Sem novo token e sem cor fixa (T1 continua com zero resultados fora do `index.css`).
   - **Reverter:** trocar de volta essas mesmas linhas (`body` para `--ba-paper`, cards para `--ba-white`).
2. **Etapas 1 e 2 implementadas numa passada só, sem a Parada 1.** O Everton pediu para ver o resultado final no `npm run dev`. Cada arquivo foi escrito já com tokens e formato novos, e o `:root` entrou direto com os valores da Etapa 2. Perde-se a isolação "variável esquecida × visual novo"; a varredura T10 (nenhum `var(--ba-*)` sem definição) cobre o primeiro tipo de defeito.
3. **Comparação de PDFs (Task 1 / T9b) e conferência visual (T3 a T8, T11 a T15) não foram executadas pelo Claude.** Ficam com o Everton, no `npm run dev` e no celular. Linha de base e fechamento de `npm test`: 130 testes, 130 passaram, 0 pulados, antes e depois.
4. **Texto das caixas de aviso/CC em `--ba-warn`** ficou pouco legível nas telas (feedback do Everton). A sugestão de passar só o texto para `--ba-ink`, mantendo borda e fundo terracota, aguarda a decisão dele; nada foi alterado.
