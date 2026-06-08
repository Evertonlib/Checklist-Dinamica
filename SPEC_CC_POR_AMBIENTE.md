# SPEC - CCs das Perguntas Globais por Ambiente no PDF

**Status:** Aguardando aprovacao  
**PRD de referencia:** `PRD_CC_POR_AMBIENTE.md`  
**Data:** 2026-06-08  

---

## 1. Escopo da mudanca

Um unico arquivo e alterado: `src/services/pdf.js`.

`ccBuilder.js`, `scoreEngine.js`, `schema.js`, `FormProvider.jsx`,
`StepRevisao.jsx` e todos os componentes de `StepPerguntasGlobais/` nao sao
tocados.

---

## 2. O que remover de `pdf.js`

### 2.1 Declaracao de `global`

A linha 221 declara `const { global } = state`. Ela deve **permanecer** — sera
reutilizada no novo bloco dentro do forEach de ambientes.

### 2.2 Chamadas `escreverPergunta` de G1-G5 no bloco inicial

Remover as linhas 223-261 na sua totalidade:

| Linhas | Conteudo removido |
|---|---|
| 223-229 | `escreverPergunta` de G1 (iluminacao externa) |
| 231-237 | `escreverPergunta` de G2 (reboco) |
| 239-245 | `escreverPergunta` de G3 (revestimento) |
| 247-253 | `escreverPergunta` de G4 (pontos eletricos/hidraulicos/gas) |
| 255-261 | `escreverPergunta` de G5 (rebaixo de teto) |

Apos a remocao, o titulo `Checklist Completa` (linha 219) e seguido
diretamente pelo `forEach` dos ambientes (linha 263). O titulo permanece.

---

## 3. O que adicionar em `pdf.js`

### 3.1 Posicao dentro do forEach

Dentro do forEach de `state.ambientesSelecionados` (comeca na linha 263),
inserir o bloco de Gs **logo apos** o trecho que escreve o score e a linha
divisoria, imediatamente antes da primeira condicao `if (['cozinha', ...]...)`
que inicia as perguntas especificas do ambiente.

Referencia de contexto no codigo atual (nao modificar estas linhas):

```js
// linhas 291-297 — existem, nao mudam
doc.setTextColor(0, 0, 0)
if (index === 0) {
  doc.setLineWidth(0.3)
  doc.line(margemEsquerda, y, pageWidth - margemDireita, y)
}
y += 7

// <<< INSERIR BLOCO DE Gs AQUI >>>

if (['cozinha', 'banheiro', 'outros'].includes(formType)) {  // linha 298
```

### 3.2 Algoritmo do bloco de Gs

Para cada `instanceId` do ambiente atual, percorrer a lista de perguntas
globais na ordem `['G1', 'G2', 'G3', 'G4', 'G5']`. Para cada uma, buscar
na lista `ccs` (ja disponivel no escopo externo) o primeiro item cujo
`perguntaOrigem` seja a pergunta corrente e cujo `escopo` seja o `instanceId`
do ambiente. Se encontrado, chamar `escreverPergunta` com o texto da pergunta,
o texto de resposta por ambiente (ver secao 3.3) e o CC encontrado.

Pseudocodigo:

```
const PERGUNTAS_GLOBAIS = ['G1', 'G2', 'G3', 'G4', 'G5']

for (const origem of PERGUNTAS_GLOBAIS) {
  const cc = ccs.find(
    (c) => c.perguntaOrigem === origem && c.escopo === instanceId
  )
  if (!cc) continue
  escreverPergunta(
    textoPerguntaGlobal(origem),
    respostaGlobalPorAmbiente(origem, instanceId, global),
    [cc]
  )
}
```

As funcoes `textoPerguntaGlobal` e `respostaGlobalPorAmbiente` sao definidas
na secao 3.3 e 3.4 abaixo como constantes simples no escopo da funcao
`gerarPdf`, nao como funcoes exportadas.

### 3.3 Textos das perguntas globais

Manter os textos exatamente iguais aos que estao sendo removidos do bloco
inicial, sem alteracao:

| Origem | Texto da pergunta |
|---|---|
| G1 | `'G1 — O projeto terá alguma iluminação embutida na marcenaria adquirida externamente à By Arabi? (fitas de LED, spots, etc.)'` |
| G2 | `'G2 — Todos os ambientes já possuem reboco (argamassa) finalizado nas paredes?'` |
| G3 | `'G3 — Todos os ambientes já possuem revestimento final (azulejo, porcelanato etc.) aplicado nas paredes?'` |
| G4 | `'G4 — Os pontos elétricos/hidráulicos/gás já estão nas posições finais em todos os ambientes?'` |
| G5 | `'G5 — Algum ambiente terá rebaixo de teto?'` |

### 3.4 Texto de resposta por ambiente

No bloco por ambiente, a resposta deve refletir a condicao que gerou o CC,
sem repetir a lista de todos os ambientes afetados (ja irrelevante dentro de
um bloco individual).

| Origem | Texto de resposta no bloco do ambiente |
|---|---|
| G1 | `'Sim'` |
| G2 | `'Não'` |
| G3 | `'Não'` |
| G4 | `'Não'` |
| G5 | `` `Sim — ${cm} cm` `` onde `cm` vem de `(global.g4_ambientes ?? []).find(item => item.instanceId === instanceId)?.cm ?? '?'` |

Para G1-G4 a resposta e uma string literal constante. Para G5 e necessario
buscar o `cm` especifico do ambiente na lista `global.g4_ambientes`.

---

## 4. Invariantes que devem ser preservados

| Invariante | Como e garantido |
|---|---|
| Supressao G2/G3 no mesmo ambiente | `ccs.find(...)` retorna `undefined` para o CC suprimido; `escreverPergunta` nao e chamado |
| CCs de ambiente (granito, tanque etc.) continuam aparecendo | O trecho que os exibe nao e alterado |
| Resumo Executivo inalterado | Usa a lista `ccs` diretamente; nenhuma alteracao nessa secao |
| Tela de Revisao inalterada | Arquivo nao e tocado |
| Score e gatilhos inalterados | `scoreEngine.js` e `ccBuilder.js` nao sao tocados |

---

## 5. Observacoes — diferencas entre PRD e codigo real

### OBS-01 — Nomenclatura dos campos de estado para G4 e G5

O PRD descreve G4 como a quarta pergunta global e G5 como a quinta, sugerindo
implicitamente campos `g4_*` e `g5_*`. O codigo real usa nomenclatura
deslocada:

| Pergunta no PDF | Campo de estado real |
|---|---|
| G4 (pontos eletricos/hidraulicos/gas) | `global.g3_pontosNaPosicaoFinal`, `global.g3_ambientesPendentes` |
| G5 (rebaixo de teto) | `global.g4_temRebaixo`, `global.g4_ambientes` |

Esta nomenclatura e consistente entre `pdf.js` e `ccBuilder.js`. A
implementacao deve usar os nomes de campo reais, nao os nomes deduzidos pelo
numero da pergunta. No algoritmo deste Spec, o acesso a `global.g4_ambientes`
para G5 (secao 3.4) ja reflete isso.

### OBS-02 — Linha divisoria so existe para o primeiro ambiente

O PRD descreve a posicao de insercao como "apos o nome, score e linha
divisoria do ambiente". No codigo, a linha fina (`.line`) so existe para
`index === 0`. Para os demais ambientes, a linha dourada e desenhada **antes**
do nome, nao depois do score. O bloco de Gs sera inserido apos o `y += 7` em
ambos os casos, que e o ponto de equivalencia funcional independente do indice.

### OBS-03 — `perguntaOrigem` de G5 e `'G5'` no ccBuilder

O PRD menciona G5 como parte da melhoria, mas nao lista `'G5'` na tabela de
valores de `perguntaOrigem` ao descrever o filtro (menciona apenas G1-G4). O
codigo de `ccBuilder.js` linha 93 confirma que o CC de rebaixo e gerado com
`perguntaOrigem: 'G5'`. O algoritmo deste Spec inclui `'G5'` no array
`PERGUNTAS_GLOBAIS` para cobrir isso corretamente.

### OBS-04 — G4 no bloco inicial usa `g3_pontosNaPosicaoFinal` para a condicional

Na linha 249 de `pdf.js`, a condicional de resposta de G4 e
`global.g3_pontosNaPosicaoFinal === false`. No bloco por ambiente (secao 3.4),
a resposta e derivada da existencia do CC (nao da condicional de estado bruto),
o que e mais robusto e consistente com a premissa 3 do PRD.

---

## 6. Criterios de aceitacao

Referencia: secao **Criterios de aceitacao** do `PRD_CC_POR_AMBIENTE.md`,
CA-01 a CA-15. Nenhum criterio novo e adicionado aqui. A validacao deve cobrir
pelo menos CA-01, CA-02, CA-05 (supressao G2/G3), CA-07 (varios CCs no mesmo
ambiente), CA-08 (CCs existentes nao afetados), CA-09 (Resumo Executivo),
CA-11 (G5) e CA-15 (muitos ambientes).

---
