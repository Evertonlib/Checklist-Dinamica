# SPEC — Reestruturação das Perguntas G2 e G3 (Reboco e Revestimento)

**Baseado em:** PRD v1.1 (2026-05-15)  
**Status:** Aguardando aprovação  
**Regra de conflito:** onde o código diverge do PRD, o código prevalece e a divergência é anotada como observação.

---

## Índice

1. [schema.js](#1-schemajS)
2. [BlocoReforma.jsx](#2-blocoreformajsx)
3. [scoreEngine.js](#3-scoreenginejs)
4. [ccBuilder.js](#4-ccbuilderjs)
5. [checklistTextos.js](#5-checklisttextosjs)
6. [pdf.js](#6-pdfjs)
7. [FormProvider.jsx](#7-formproviderJsx)
8. [BlocoPontosUtilidades.jsx](#8-blocopontosutilidades)
9. [BlocoRebaixo.jsx](#9-blocorebaixo)
10. [StepPerguntasGlobais.jsx](#10-stepperguntasglobais)
11. [StepRevisao.jsx](#11-steprevisao)
12. [Observações — Divergências PRD vs. Código](#12-observações--divergências-prd-vs-código)

---

## 1. schema.js

**Arquivo:** `src/domain/schema.js`

### Antes — campos `global`

```js
global: {
  g1_temIluminacaoExterna: null,
  g1_ambientes: [],
  g2_temReforma: null,        // portão "Algum ambiente em reforma?"
  g2_ambientes: [],           // quais ambientes em reforma
  g2_1_temReboco: null,       // booleano: todos em reforma têm reboco?
  g2_1_ambientes: [],         // quais ambientes em reforma TÊM reboco
  g2_2_temRevestimento: null, // booleano: todos em reforma têm revestimento?
  g2_2_ambientes: [],         // quais ambientes em reforma TÊM revestimento
  g3_pontosNaPosicaoFinal: null,
  g3_ambientesPendentes: [],
  g4_temRebaixo: null,
  g4_ambientes: [],
}
```

### Depois — campos `global`

```js
global: {
  g1_temIluminacaoExterna: null,
  g1_ambientes: [],
  // G2 — Reboco (nova pergunta universal)
  g2_temReboco: null,               // null | true | false
  g2_ambientesSemReboco: [],        // instanceIds dos ambientes SEM reboco
  // G3 — Revestimento (nova pergunta universal, substitui G2.2)
  g3_temRevestimento: null,         // null | true | false
  g3_ambientesSemRevestimento: [],  // instanceIds dos ambientes SEM revestimento
  // G4 — Pontos (antes G3 — apenas rótulo visual muda, campos mantêm nomes)
  g3_pontosNaPosicaoFinal: null,
  g3_ambientesPendentes: [],
  // G5 — Rebaixo (antes G4 — apenas rótulo visual muda, campos mantêm nomes)
  g4_temRebaixo: null,
  g4_ambientes: [],
}
```

**Campos removidos:** `g2_temReforma`, `g2_ambientes`, `g2_1_temReboco`, `g2_1_ambientes`, `g2_2_temRevestimento`, `g2_2_ambientes`  
**Campos adicionados:** `g2_temReboco`, `g2_ambientesSemReboco`, `g3_temRevestimento`, `g3_ambientesSemRevestimento`  
**Campos inalterados:** `g3_pontosNaPosicaoFinal`, `g3_ambientesPendentes`, `g4_temRebaixo`, `g4_ambientes`

> **Observação 1:** Os campos de pontos e rebaixo mantêm os prefixos `g3_` e `g4_` no schema mesmo após a renumeração visual para G4/G5. O PRD confirma que é apenas renumeração de rótulo; renomear os campos de estado criaria um escopo de mudança maior sem benefício funcional.

---

## 2. BlocoReforma.jsx

**Arquivo:** `src/steps/StepPerguntasGlobais/BlocoReforma.jsx`

Este é o componente de maior mudança. Será reescrito integralmente.

### Antes — estrutura de estado lida

```js
const {
  g2_temReforma,      // portão: Sim/Não "algum em reforma?"
  g2_ambientes,       // seleção de quais ambientes estão em reforma
  g2_1_temReboco,     // null | true | false
  g2_1_ambientes,     // quais ambientes EM REFORMA têm reboco (semântica positiva)
  g2_2_temRevestimento,
  g2_2_ambientes,     // quais ambientes EM REFORMA têm revestimento (semântica positiva)
} = state.global
```

### Depois — estrutura de estado lida

```js
const {
  g2_temReboco,              // null | true | false
  g2_ambientesSemReboco,     // quais ambientes NÃO têm reboco (semântica invertida)
  g3_temRevestimento,        // null | true | false
  g3_ambientesSemRevestimento, // quais ambientes NÃO têm revestimento
} = state.global
```

### Antes — fluxo de renderização

```
FieldGroup "G2 — Reforma"
  ├─ Pergunta: "Algum ambiente está em reforma?"
  ├─ Botões Sim / Não
  └─ [se Sim]
       ├─ "Quais ambientes?" → chips de todos os ambientes → g2_ambientes
       ├─ "G2.1 — Em quais ambientes em reforma as paredes já possuem reboco?"
       │    → chips dos ambientes EM REFORMA → g2_1_ambientes (quem TEM)
       │    → se não todos selecionados: abre Modal "Assumir Risco"
       └─ [se g2_1_temReboco === true]
            └─ "G2.2 — Em quais ambientes em reforma o revestimento final já está aplicado?"
                 → chips dos ambientes EM REFORMA → g2_2_ambientes (quem TEM)
                 → se não todos selecionados: seta g2_2_temRevestimento = false (SEM modal)

Modal (tipo "reboco" | "revestimento"):
  ├─ "← Voltar" → reseta g2_1_temReboco ou g2_2_temRevestimento para null
  └─ "Assumo o risco" → seta g2_1_temReboco=false + reseta g2_2; ou seta g2_2_temRevestimento=false
```

### Depois — fluxo de renderização

```
FieldGroup "G2 — Reboco"
  ├─ Pergunta: "Todos os ambientes já possuem reboco (argamassa) finalizado nas paredes?"
  ├─ Botões Sim / Não
  │    Sim → g2_temReboco = true, g2_ambientesSemReboco = []
  │    Não → abre Modal "Assumir Risco"
  └─ [se g2_temReboco === false]  ← só após assumir o risco no modal
       ├─ botão "Todos" → g2_ambientesSemReboco = todos instanceIds
       └─ chips de TODOS os ambientes do projeto → g2_ambientesSemReboco (quem NÃO TEM)

FieldGroup "G3 — Revestimento"
  ├─ Pergunta: "Todos os ambientes já possuem revestimento final (azulejo, porcelanato etc.) aplicado nas paredes?"
  ├─ Botões Sim / Não
  │    Sim → g3_temRevestimento = true, g3_ambientesSemRevestimento = []
  │    Não → abre seleção DIRETAMENTE (sem modal)
  └─ [se g3_temRevestimento === false]
       ├─ botão "Todos" → g3_ambientesSemRevestimento = todos instanceIds
       └─ chips de TODOS os ambientes do projeto → g3_ambientesSemRevestimento (quem NÃO TEM)

Modal (único, tipo "reboco"):
  ├─ Título: "⚠️ Risco Alto"
  ├─ Corpo: mensagem sobre paredes sem reboco
  ├─ "← Voltar" → g2_temReboco = null (fecha modal, desfaz resposta)
  └─ "Assumo o risco e continuar" → g2_temReboco = false (permite seleção)
```

### Detalhes da lógica de toggle

**G2 — Reboco:**
- Clicar "Sim" → `g2_temReboco = true`, `g2_ambientesSemReboco = []`
- Clicar "Não" → abre modal (não seta o campo ainda)
- Modal "Voltar" → `g2_temReboco = null` (estado vazio)
- Quando `g2_temReboco = null`, nenhum botão (Sim/Não) aparece marcado — o estado visual reflete campo não respondido.
- Modal "Assumir" → `g2_temReboco = false` (exibe lista)
- Toggle de chip em `g2_ambientesSemReboco` → atualiza array sem resetar `g2_temReboco`

**G3 — Revestimento:**
- Clicar "Sim" → `g3_temRevestimento = true`, `g3_ambientesSemRevestimento = []`
- Clicar "Não" → `g3_temRevestimento = false` (exibe lista diretamente, sem modal)
- Toggle de chip em `g3_ambientesSemRevestimento` → atualiza array

### Estado do modal

O componente mantém o state local `modalRisco` (boolean), usado apenas para controlar abertura/fechamento do modal de reboco. O modal de revestimento não existe mais.

> **Observação 2:** No código atual, o handler `handleVoltarModal` e o texto `textoPendencia` têm ramificações para `tipo === 'revestimento'`, mas esse caminho NUNCA é atingido — `aplicarSelecaoCompleta` detecta `campoBooleano === 'g2_2_temRevestimento'` e seta o valor diretamente, sem chamar `abrirModalRisco`. Essa lógica morta será removida na reescrita.

> **Observação 3:** A lista de ambientes para G2 e G3 é `state.ambientesSelecionados` (todos os ambientes do projeto), não mais filtrada por "ambientes em reforma". Isso é a mudança semântica central do PRD.

---

## 3. scoreEngine.js

**Arquivo:** `src/domain/scoreEngine.js`

### Antes — gatilhos globais de reforma

```js
// Linha 19-27
if (global.g2_temReforma === true && global.g2_1_temReboco === false) {
  gatilhosAtivados.push('REFORM_SEM_REBOCO')
}
if (
  global.g2_temReforma === true &&
  global.g2_1_temReboco === true &&
  global.g2_2_temRevestimento === false
) {
  gatilhosAtivados.push('REFORM_SEM_REVESTIMENTO')
}
```

### Depois — gatilhos globais de reforma

```js
if (global.g2_temReboco === false) {
  gatilhosAtivados.push('REFORM_SEM_REBOCO')
}
if (global.g3_temRevestimento === false) {
  gatilhosAtivados.push('REFORM_SEM_REVESTIMENTO')
}
```

**Sem outras mudanças.** As definições de `GATILHOS_DEF`, níveis, pontos e toda a lógica de pontuação por ambiente permanecem inalterados.

> **Observação 4:** O PRD (seção 6) afirma que o scoreEngine remove "verificação de `g2_temReforma`" das condições. O código confirma: as três verificações (portão + reboco + revestimento) colapsam para duas condições simples.

---

## 4. ccBuilder.js

**Arquivo:** `src/domain/ccBuilder.js`

### Antes — lógica de supressão e CCs de reforma

```js
// linha 23
const suprimirRevestimento = tem('REFORM_SEM_REBOCO')  // supressão global

// REFORM_SEM_REBOCO (linha 25-35)
if (tem('REFORM_SEM_REBOCO')) {
  resultado.push({
    id: 'REFORM_SEM_REBOCO',
    tipo: 'CC',
    nivel: 'ALTO',
    escopo: 'Global',
    textoCompleto: 'CLIENTE CIENTE E DE ACORDO QUE MEDIÇÃO TÉCNICA DE AMBIENTE FOI REALIZADA COM AMBIENTE EM REFORMA INACABADA E QUE DEVERÁ RESPEITAR A ALÍNEA (I) DA CLÁUSULA TERCEIRA DO CONTRATO DE COMPRA E VENDA.',
    perguntaOrigem: 'G2.1',
  })
}

// REFORM_SEM_REVESTIMENTO (linha 37-47) — mesmo texto que reboco
if (!suprimirRevestimento && tem('REFORM_SEM_REVESTIMENTO')) {
  resultado.push({
    id: 'REFORM_SEM_REVESTIMENTO',
    tipo: 'CC',
    nivel: 'ALTO',
    escopo: 'Global',
    textoCompleto: 'CLIENTE CIENTE E DE ACORDO QUE MEDIÇÃO TÉCNICA DE AMBIENTE FOI REALIZADA COM AMBIENTE EM REFORMA INACABADA E QUE DEVERÁ RESPEITAR A ALÍNEA (I) DA CLÁUSULA TERCEIRA DO CONTRATO DE COMPRA E VENDA.',
    perguntaOrigem: 'G2.2',
  })
}

// PONTOS_INDEFINIDOS
// perguntaOrigem: 'G3'

// REBAIXO por ambiente
// perguntaOrigem: 'G4'
```

### Depois — lógica de supressão e CCs de reforma

A supressão deixa de ser global (binária) e passa a ser **por ambiente**. A implementação computa quais ambientes sem revestimento ainda não estão cobertos pelo CC de reboco antes de decidir se gera o CC de revestimento.

```js
// Importar o novo texto
import {
  // ... existentes ...
  TEXTO_REVESTIMENTO_AUSENTE,   // novo
} from './checklistTextos.js'

// Supressão por ambiente (substitui a linha 23)
const ambientesSemReboco = state.global.g2_ambientesSemReboco || []
const ambientesSemRevestimento = state.global.g3_ambientesSemRevestimento || []
// Ambientes que estão em G3 mas NÃO em G2 → CC de revestimento se aplica
const ambientesSemRevestimentoNaoSuprimidos = ambientesSemRevestimento.filter(
  (id) => !ambientesSemReboco.includes(id)
)

// REFORM_SEM_REBOCO
if (tem('REFORM_SEM_REBOCO')) {
  resultado.push({
    id: 'REFORM_SEM_REBOCO',
    tipo: 'CC',
    nivel: 'ALTO',
    escopo: 'Global',
    textoCompleto: 'CLIENTE CIENTE E DE ACORDO QUE MEDIÇÃO TÉCNICA DE AMBIENTE FOI REALIZADA COM AMBIENTE EM REFORMA INACABADA E QUE DEVERÁ RESPEITAR A ALÍNEA (I) DA CLÁUSULA TERCEIRA DO CONTRATO DE COMPRA E VENDA.',
    perguntaOrigem: 'G2',  // era 'G2.1'
  })
}

// REFORM_SEM_REVESTIMENTO — supressão por ambiente, novo texto
if (tem('REFORM_SEM_REVESTIMENTO') && ambientesSemRevestimentoNaoSuprimidos.length > 0) {
  resultado.push({
    id: 'REFORM_SEM_REVESTIMENTO',
    tipo: 'CC',
    nivel: 'ALTO',
    escopo: 'Global',
    textoCompleto: TEXTO_REVESTIMENTO_AUSENTE,  // novo texto distinto
    perguntaOrigem: 'G3',  // era 'G2.2'
  })
}

// PONTOS_INDEFINIDOS
// perguntaOrigem: 'G4'  ← era 'G3'

// REBAIXO por ambiente
// perguntaOrigem: 'G5'  ← era 'G4'
```

### Resumo das mudanças em ccBuilder

| Elemento | Antes | Depois |
|---|---|---|
| Supressão de revestimento | Global: se reboco ativo → suprime tudo | Por ambiente: suprime só os ambientes em ambas as listas |
| Texto CC reboco | "MEDIÇÃO TÉCNICA... EM REFORMA INACABADA..." | Mesmo texto (não muda) |
| Texto CC revestimento | Mesmo texto do reboco (duplicado) | `TEXTO_REVESTIMENTO_AUSENTE` (novo texto específico) |
| `perguntaOrigem` reboco | `'G2.1'` | `'G2'` |
| `perguntaOrigem` revestimento | `'G2.2'` | `'G3'` |
| `perguntaOrigem` pontos | `'G3'` | `'G4'` |
| `perguntaOrigem` rebaixo | `'G4'` | `'G5'` |

> **Observação 5:** A supressão por ambiente mantém os CCs como `escopo: 'Global'` (uma entrada por tipo de CC, não uma entrada por ambiente). A granularidade "por ambiente" é implementada na condição de geração: se nenhum ambiente com revestimento ausente ficou sem cobertura pelo CC de reboco, o CC de revestimento simplesmente não é gerado. Isso é consistente com a arquitetura atual de CCs globais.

---

## 5. checklistTextos.js

**Arquivo:** `src/domain/checklistTextos.js`

### Antes

```js
// Sem constante de texto para revestimento ausente.
// O CC de revestimento usa inline o mesmo texto do reboco em ccBuilder.js.
```

### Depois

Adicionar ao final do arquivo:

```js
export const TEXTO_REVESTIMENTO_AUSENTE =
  'CLIENTE CIENTE E DE ACORDO QUE A MEDIÇÃO TÉCNICA FOI REALIZADA SEM O REVESTIMENTO FINAL DAS PAREDES, E QUE A FINALIZAÇÃO DA OBRA APÓS A ELABORAÇÃO DO PROJETO PODERÁ GERAR INTERFERÊNCIAS E NECESSIDADE DE AJUSTES NA MONTAGEM.'
```

As demais constantes são mantidas sem alteração.

---

## 6. pdf.js

**Arquivo:** `src/services/pdf.js`

### Antes — seção de perguntas globais (linhas 228-275)

```js
const idsEmReforma = global.g2_ambientes || []  // variável declarada mas NÃO usada abaixo

escreverPergunta(
  'G2 — Algum ambiente está em reforma?',
  global.g2_temReforma === true
    ? `Sim — ${formatarListaAmbientes(state.ambientesSelecionados, global.g2_ambientes)}`
    : 'Não'
)

escreverPergunta(
  'G2.1 — Em quais ambientes em reforma as paredes já possuem reboco (argamassa) finalizado?',
  global.g2_temReforma === true
    ? formatarListaAmbientes(state.ambientesSelecionados, global.g2_1_ambientes)
    : 'Não se aplica',
  [ccPorId.get('REFORM_SEM_REBOCO')]
)

escreverPergunta(
  'G2.2 — Em quais ambientes em reforma o revestimento final das paredes já está aplicado?',
  global.g2_temReforma === true && global.g2_1_temReboco === true
    ? formatarListaAmbientes(state.ambientesSelecionados, global.g2_2_ambientes)
    : 'Não se aplica',
  [ccPorId.get('REFORM_SEM_REVESTIMENTO')]
)

escreverPergunta(
  'G3 — Os pontos elétricos/hidráulicos/gás já estão nas posições finais em todos os ambientes?',
  global.g3_pontosNaPosicaoFinal === false
    ? `Não — ${formatarListaAmbientes(state.ambientesSelecionados, global.g3_ambientesPendentes)}`
    : 'Sim',
  [ccPorId.get('PONTOS_INDEFINIDOS')]
)

escreverPergunta(
  'G4 — Algum ambiente terá rebaixo de teto?',
  global.g4_temRebaixo === true
    ? `Sim — ${formatarListaRebaixo(state.ambientesSelecionados, global.g4_ambientes)}`
    : 'Não',
  (global.g4_ambientes || []).map((item) => ccPorId.get(`REBAIXO_${item.instanceId}`))
)
```

### Depois — seção de perguntas globais

```js
// Remover: const idsEmReforma = global.g2_ambientes || []  (era variável morta)

escreverPergunta(
  'G2 — Todos os ambientes já possuem reboco (argamassa) finalizado nas paredes?',
  global.g2_temReboco === false
    ? `Não — Sem reboco: ${formatarListaAmbientes(state.ambientesSelecionados, global.g2_ambientesSemReboco)}`
    : global.g2_temReboco === true ? 'Sim' : '—',
  [ccPorId.get('REFORM_SEM_REBOCO')]
)

escreverPergunta(
  'G3 — Todos os ambientes já possuem revestimento final (azulejo, porcelanato etc.) aplicado nas paredes?',
  global.g3_temRevestimento === false
    ? `Não — Sem revestimento: ${formatarListaAmbientes(state.ambientesSelecionados, global.g3_ambientesSemRevestimento)}`
    : global.g3_temRevestimento === true ? 'Sim' : '—',
  [ccPorId.get('REFORM_SEM_REVESTIMENTO')]
)

escreverPergunta(
  'G4 — Os pontos elétricos/hidráulicos/gás já estão nas posições finais em todos os ambientes?',
  global.g3_pontosNaPosicaoFinal === false
    ? `Não — ${formatarListaAmbientes(state.ambientesSelecionados, global.g3_ambientesPendentes)}`
    : 'Sim',
  [ccPorId.get('PONTOS_INDEFINIDOS')]
)

escreverPergunta(
  'G5 — Algum ambiente terá rebaixo de teto?',
  global.g4_temRebaixo === true
    ? `Sim — ${formatarListaRebaixo(state.ambientesSelecionados, global.g4_ambientes)}`
    : 'Não',
  (global.g4_ambientes || []).map((item) => ccPorId.get(`REBAIXO_${item.instanceId}`))
)
```

### Resumo das mudanças em pdf.js

| Rótulo PDF | Antes | Depois |
|---|---|---|
| G2 | "Algum ambiente está em reforma?" | "Todos os ambientes já possuem reboco...?" |
| G2.1 | Pergunta removida | — |
| G2.2 | Pergunta removida | — |
| G3 | Pergunta de revestimento não existia separada | "Todos os ambientes já possuem revestimento...?" |
| G3 (pontos) | "G3 — Os pontos elétricos..." | "G4 — Os pontos elétricos..." |
| G4 (rebaixo) | "G4 — Algum ambiente terá rebaixo..." | "G5 — Algum ambiente terá rebaixo..." |

**Também:** Remover a variável `idsEmReforma` (linha 228 atual) — era código morto que nunca foi usada nas perguntas abaixo dela.

> **Observação 6:** No PDF atual, a resposta de G2 mostra "Sim — [lista]" quando reforma=true e "Não" quando reforma=false. A nova formatação para G2/G3 inverte a lógica: a lista aparece quando a resposta é "Não" (mostrando quem não tem), e a resposta "Sim" não lista nenhum ambiente. A função `formatarListaAmbientes` é reaproveitada sem modificação.

---

## 7. FormProvider.jsx

**Arquivo:** `src/context/FormProvider.jsx`

### Antes — lógica de rascunho

O `normalizarEstadoSalvo` faz merge simples do `global` salvo com `estadoInicial.global`. Não há detecção de versão de schema.

```js
global: {
  ...estadoInicial.global,
  ...(estadoSalvo?.global || {}),
},
```

Se um rascunho legado for carregado (com `g2_temReforma`), o merge vai preservar os campos obsoletos no estado normalizado — eles não causam erro mas também não são lidos por nenhum componente.

### Depois — lógica de rascunho

A detecção ocorre no `useEffect` de leitura do localStorage, antes de qualquer decisão de exibir o diálogo de rascunho. Se o campo `g2_temReforma` existir no estado salvo, o rascunho é descartado automaticamente e o app inicia do zero — sem mostrar o diálogo "Continuar de onde parou?".

```js
useEffect(() => {
  const salvo = localStorage.getItem(STORAGE_KEY)
  if (salvo) {
    try {
      const parsed = JSON.parse(salvo)
      if (parsed?.global?.g2_temReforma !== undefined) {
        // rascunho de versão anterior — descarta e inicia limpo
        localStorage.removeItem(STORAGE_KEY)
        setReady(true)
      } else {
        setRascunho(parsed)
      }
    } catch {
      setReady(true)
    }
  } else {
    setReady(true)
  }
}, [])
```

**Por que aqui e não em `confirmarRascunho`:** detectar no `useEffect` evita mostrar ao usuário um diálogo ("Deseja continuar?") que não tem resposta útil — o rascunho é irrecuperável de qualquer forma. O app simplesmente inicia como se não houvesse rascunho. Sem novo estado, sem nova mensagem, sem mudança no JSX.

> **Observação 7:** O PRD (seção 4) afirma que "os cases do reducer que manipulam `g2_temReforma` e `g2_ambientes` devem ser removidos". O código real **não possui cases dedicados** para esses campos — tudo vai por `SET_GLOBAL`. O único case relevante a remover é a referência ao `g4_ambientes` em `SET_GLOBAL_G4_AMBIENTE` (que permanece inalterada pois o rebaixo não muda). Portanto, **nenhum case do reducer precisa ser removido ou criado** para esta reestruturação; apenas a detecção de rascunho incompatível precisa ser adicionada.

---

## 8. BlocoPontosUtilidades.jsx

**Arquivo:** `src/steps/StepPerguntasGlobais/BlocoPontosUtilidades.jsx`

### Antes

```jsx
<FieldGroup titulo="G3 — Pontos Elétricos / Hidráulicos / Gás">
```

### Depois

```jsx
<FieldGroup titulo="G4 — Pontos Elétricos / Hidráulicos / Gás">
```

**Única mudança: rótulo visual.** Toda a lógica interna, campos de estado (`g3_pontosNaPosicaoFinal`, `g3_ambientesPendentes`) e comportamento permanecem idênticos.

---

## 9. BlocoRebaixo.jsx

**Arquivo:** `src/steps/StepPerguntasGlobais/BlocoRebaixo.jsx`

### Antes

```jsx
<FieldGroup titulo="G4 — Rebaixo de Teto">
```

### Depois

```jsx
<FieldGroup titulo="G5 — Rebaixo de Teto">
```

**Única mudança: rótulo visual.** Toda a lógica interna e campos de estado (`g4_temRebaixo`, `g4_ambientes`) permanecem idênticos.

---

## 10. StepPerguntasGlobais.jsx

**Arquivo:** `src/steps/StepPerguntasGlobais/StepPerguntasGlobais.jsx`

### Antes — lógica de validação

```js
// G2: pergunta portão + seleção de ambientes em reforma
const g2Ok =
  respondido(g.g2_temReforma) &&
  (g.g2_temReforma === false || g.g2_ambientes.length > 0)

// G2.1: só obrigatório se g2_temReforma = true
const g2_1Ok = g.g2_temReforma !== true || respondido(g.g2_1_temReboco)

// G2.2: só obrigatório se g2_temReforma = true E g2_1_temReboco = true
const g2_2Ok =
  g.g2_temReforma !== true ||
  g.g2_1_temReboco !== true ||
  respondido(g.g2_2_temRevestimento)

// G3: pontos elétricos
const g3Ok =
  respondido(g.g3_pontosNaPosicaoFinal) &&
  (g.g3_pontosNaPosicaoFinal === true || g.g3_ambientesPendentes.length > 0)

// G4: rebaixo
const g4Ok =
  respondido(g.g4_temRebaixo) &&
  (g.g4_temRebaixo === false ||
    (g.g4_ambientes.length > 0 &&
      g.g4_ambientes.every((ambiente) => String(ambiente.cm ?? '').trim() !== '')))

const tudoOk = g1Ok && g2Ok && g2_1Ok && g2_2Ok && g3Ok && g4Ok
```

### Depois — lógica de validação

```js
// G2: reboco (pergunta universal, sempre obrigatória)
const g2Ok =
  respondido(g.g2_temReboco) &&
  (g.g2_temReboco === true || g.g2_ambientesSemReboco.length > 0)

// G3: revestimento (pergunta universal, sempre obrigatória)
const g3Ok =
  respondido(g.g3_temRevestimento) &&
  (g.g3_temRevestimento === true || g.g3_ambientesSemRevestimento.length > 0)

// G4: pontos elétricos (campos de estado não mudam)
const g4Ok =
  respondido(g.g3_pontosNaPosicaoFinal) &&
  (g.g3_pontosNaPosicaoFinal === true || g.g3_ambientesPendentes.length > 0)

// G5: rebaixo (campos de estado não mudam)
const g5Ok =
  respondido(g.g4_temRebaixo) &&
  (g.g4_temRebaixo === false ||
    (g.g4_ambientes.length > 0 &&
      g.g4_ambientes.every((ambiente) => String(ambiente.cm ?? '').trim() !== '')))

const tudoOk = g1Ok && g2Ok && g3Ok && g4Ok && g5Ok
```

### Antes — IDs de scroll e função `avancar`

```js
const primeiroIncompleto = !g1Ok ? 'bloco-g1'
  : !g2Ok || !g2_1Ok || !g2_2Ok ? 'bloco-g2'
  : !g3Ok ? 'bloco-g3'
  : 'bloco-g4'
```

### Depois — IDs de scroll e função `avancar`

```js
const primeiroIncompleto = !g1Ok ? 'bloco-g1'
  : !g2Ok ? 'bloco-g2'
  : !g3Ok ? 'bloco-g3'
  : !g4Ok ? 'bloco-g4'
  : 'bloco-g5'
```

### Antes — JSX dos blocos

```jsx
<div id="bloco-g1"><BlocoIluminacao /></div>
<div id="bloco-g2"><BlocoReforma /></div>
<div id="bloco-g3"><BlocoPontosUtilidades /></div>
<div id="bloco-g4"><BlocoRebaixo /></div>
```

### Depois — JSX dos blocos

O `BlocoReforma` agora renderiza dois `FieldGroup` internos (G2 e G3). Para que o scroll-to-error funcione por pergunta, o componente precisa expor os dois IDs — ou o StepPerguntasGlobais os engloba separadamente.

**Opção A (recomendada) — BlocoReforma renderiza os dois FieldGroups internamente, StepPerguntasGlobais divide os wrappers:**

```jsx
<div id="bloco-g1"><BlocoIluminacao /></div>
<BlocoReforma />          {/* BlocoReforma gerencia os IDs bloco-g2 e bloco-g3 internamente */}
<div id="bloco-g4"><BlocoPontosUtilidades /></div>
<div id="bloco-g5"><BlocoRebaixo /></div>
```

BlocoReforma internamente:
```jsx
<>
  <div id="bloco-g2">
    <FieldGroup titulo="G2 — Reboco">...</FieldGroup>
  </div>
  <div id="bloco-g3">
    <FieldGroup titulo="G3 — Revestimento">...</FieldGroup>
  </div>
  <Modal .../>
</>
```

**Opção B — StepPerguntasGlobais envolve os dois blocos separadamente:**

Exigiria dividir BlocoReforma em dois componentes (`BlocoReboco` e `BlocoRevestimento`). Mais limpo a longo prazo, mas escopo maior que o PRD define. **Não recomendado para esta reestruturação.**

> **Observação 8:** O PRD (seção 2) diz que StepPerguntasGlobais "pode ter lógica de exibição condicional baseada em `g2_temReforma`". Confirmado pelo código: a validação tem três condições baseadas em `g2_temReforma`. Toda essa lógica condicional é removida e substituída pela validação simplificada acima.

---

## 11. StepRevisao.jsx

**Arquivo:** `src/steps/StepRevisao/StepRevisao.jsx`

**Sem alterações necessárias.**

O componente renderiza CCs dinamicamente a partir do resultado de `construirCCs()`. Não há referências hardcoded a rótulos G2/G2.1/G2.2 no StepRevisao. As mudanças em `ccBuilder.js` (novo texto, novo `perguntaOrigem`) já serão refletidas automaticamente na tela de revisão.

---

## 12. Observações — Divergências PRD vs. Código

As observações abaixo registram onde o estado real do código difere do que o PRD descreve. O código prevalece.

| # | Trecho do PRD | O que o código faz | Impacto no Spec |
|---|---|---|---|
| 1 | "Cases do reducer que manipulam `g2_temReforma` e `g2_ambientes` devem ser removidos" | Não existem cases dedicados — tudo usa `SET_GLOBAL` genérico | Nenhum case precisa ser removido; apenas adicionar detecção de rascunho obsoleto |
| 2 | "G2.2 atual não abre modal" (implícito: o modal existe só para reboco) | Confirmado: `aplicarSelecaoCompleta` detecta `campoBooleano === 'g2_2_temRevestimento'` e seta direto sem modal. Existe código morto de `tipo === 'revestimento'` no modal | Remover o código morto; comportamento novo é consistente com atual |
| 3 | Supressão de revestimento "por ambiente" implica CCs por ambiente | A arquitetura atual gera CCs globais (um por tipo). A supressão por ambiente é implementável filtrando a lista de ambientes antes de gerar o CC global | CCs continuam globais; a supressão por ambiente é uma condição de geração, não uma estrutura de dados nova |
| 4 | `idsEmReforma` no pdf.js como referência a ambientes em reforma | Declarado na linha 228 mas nunca usado no código abaixo | Remover a variável morta |
| 5 | "Lógica de exibição condicional em StepPerguntasGlobais baseada em `g2_temReforma`" | Confirmado: três condicionais usam `g2_temReforma` na validação; nenhuma condicional oculta os blocos no JSX | Apenas a validação muda; o JSX de renderização não tem condicionais de exibição por `g2_temReforma` |
| 6 | StepRevisao "pode exibir rótulos G2/G2.1/G2.2 específicos" | Não exibe — tudo dinâmico via `construirCCs` | Sem alterações em StepRevisao |
| 7 | Campos de pontos e rebaixo seriam renomeados para G4/G5 no schema | PRD confirma que é "apenas renumeração de rótulo visual" — os campos de estado `g3_*` e `g4_*` mantêm os nomes | Schema de pontos/rebaixo inalterado; somente rótulos visuais e `perguntaOrigem` em ccBuilder mudam |

---

## Checklist de implementação (ordem sugerida)

1. `checklistTextos.js` — adicionar `TEXTO_REVESTIMENTO_AUSENTE`
2. `schema.js` — atualizar `estadoInicial.global` com os novos campos
3. `scoreEngine.js` — simplificar condições dos gatilhos
4. `ccBuilder.js` — supressão por ambiente + novo texto + novos `perguntaOrigem`
5. `BlocoReforma.jsx` — reescrever o componente
6. `StepPerguntasGlobais.jsx` — atualizar validação e IDs de scroll
7. `BlocoPontosUtilidades.jsx` — atualizar rótulo
8. `BlocoRebaixo.jsx` — atualizar rótulo
9. `pdf.js` — atualizar perguntas globais
10. `FormProvider.jsx` — adicionar detecção de rascunho incompatível

---

*Fim do Spec. Implementação não deve iniciar sem aprovação explícita.*
