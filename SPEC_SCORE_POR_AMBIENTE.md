# Spec Técnico — Score por Ambiente

**Status:** Aguardando aprovação
**Baseado em:** PRD_SCORE_POR_AMBIENTE.md
**Data:** 2026-06-05

---

## 1. Escopo

Dois arquivos são modificados:

| Arquivo | Papel |
|---|---|
| `src/domain/scoreEngine.js` | Principal — lógica de cálculo |
| `src/domain/ccBuilder.js` | Secundário — geração de CCs |

Dois arquivos foram verificados. As ressalvas encontradas estão documentadas na seção 5.

---

## 2. Discrepâncias entre PRD e Código Real

O PRD foi escrito com precisão, mas há quatro pontos onde a leitura do código revela divergências que precisam de decisão antes da implementação.

### D-01 — pdf.js: lookups de G1-G4 na Checklist Completa falharão silenciosamente

`pdf.js` usa `ccPorId.get('ILUMINACAO_EXTERNA')`, `ccPorId.get('REFORM_SEM_REBOCO')`, `ccPorId.get('REFORM_SEM_REVESTIMENTO')` e `ccPorId.get('PONTOS_INDEFINIDOS')` nas linhas 229, 237, 245 e 253, dentro da seção "Checklist Completa", para exibir cada CC inline com a pergunta que o gerou.

Após a mudança, esses IDs não existirão mais — serão `ILUMINACAO_EXTERNA_cozinha-0`, etc. O `ccPorId.get(...)` retornará `undefined`, que é silenciosamente removido pelo `.filter(Boolean)` (linha 208). Resultado: sem crash, mas os CCs de G1-G4 desaparecem da seção "Checklist Completa" do PDF. Continuam aparecendo no Resumo Executivo.

O PRD diz que `pdf.js` "continua funcionando" — de fato não quebra, mas há perda de conteúdo nessa seção. Ver DP-01 para decisão.

### D-02 — Exibição dos pontos do score global: item 5 do PRD conflita com a restrição de não tocar nos consumidores

O item 5 do PRD diz: "O número de pontos não é mais exibido para o score global." Porém:

- `StepRevisao.jsx` linha 58: `<ScoreBadge classificacao={scoreGlobal.classificacao} pontos={scoreGlobal.pontos} />`
- `pdf.js` linha 139: `doc.text(\`(${scoreGlobal.pontos} pontos)\`, ...)`

O mesmo PRD coloca ambos os arquivos como "não precisarão de mudança". Não há como ocultar o número de pontos nos dois consumidores sem alterar pelo menos essas duas linhas. Retornar `null` de `scoreGlobal.pontos` faria o pdf.js imprimir `"(null pontos)"`.

Ver DP-02 para decisão.

### D-03 — Supressão G2/G3 hoje existe apenas no ccBuilder, não no scoreEngine

No código atual, quando G2 e G3 são ambos ativos, o `ccBuilder` suprime o CC de G3 para ambientes que também estão em G2. Porém o `scoreEngine` não suprime: acumula pontos de `REFORM_SEM_REVESTIMENTO` no global mesmo para ambientes que já têm `REFORM_SEM_REBOCO`. Como `REFORM_SEM_REBOCO` é `AltoDireto` (0 pontos mas impõe ALTO), o score final é ALTO de qualquer forma — mas o contador de pontos sobe desnecessariamente.

Após a mudança, o scoreEngine também precisará suprimir G3 por-ambiente para ambientes que estão em `g2_ambientesSemReboco`. Essa supressão no engine é nova comportamentalmente (era apenas no ccBuilder). Está prevista no PRD (seção "Redistribuição", item G3) e é correta.

### D-04 — Campo G4 usa prefixo `g3_` no nome das variáveis (contra-intuitivo, mas confirmado)

O PRD lista corretamente `g3_ambientesPendentes` e `g3_pontosNaPosicaoFinal` como os campos de G4. O código confirma: `scoreEngine.js` linha 28 usa `global.g3_pontosNaPosicaoFinal`, e `pdf.js` linha 251 usa `global.g3_ambientesPendentes`. A Spec usa esses nomes exatos.

---

## 3. `scoreEngine.js` — Especificação da Mudança

### 3.1 Remover `GATILHOS_DEF`

O objeto `GATILHOS_DEF` (linhas 9–14) define os quatro gatilhos globais com `escopo: 'global'`. Após a mudança, esses gatilhos não existem como categoria separada. O objeto inteiro é removido.

### 3.2 Substituir o bloco de gatilhos globais por extração das listas de ambientes

As linhas 18–32 (checagens de G2, G3, G1, G4 e criação de `pontosIndefinidosAtivo`) são removidas e substituídas pela extração das quatro listas de ambientes antes do loop:

```
const g1_ambientes              = global.g1_ambientes || []
const g2_ambientesSemReboco     = global.g2_ambientesSemReboco || []
const g3_ambientesSemRevestimento = global.g3_ambientesSemRevestimento || []
const g3_ambientesPendentes     = global.g3_ambientesPendentes || []
```

Nenhum campo novo é criado no estado — esses campos já existem.

### 3.3 Dentro do loop de ambientes: adicionar G1–G4 antes dos gatilhos existentes

Para cada `instancia` no loop de `ambientesSelecionados`, adicionar os seguintes blocos **antes** do bloco do G5 (REBAIXO) existente:

**G1 — Iluminação externa**
- Condição: `g1_ambientes.includes(instanceId)`
- Trigger: `` `ILUMINACAO_EXTERNA_${instanceId}` ``
- Nível: `'Médio'`, Pontos: `2`
- Registrar em `gatilhosAtivados` e em `gatilhosAmbiente`

**G2 — Sem reboco**
- Condição: `g2_ambientesSemReboco.includes(instanceId)`
- Trigger: `` `REFORM_SEM_REBOCO_${instanceId}` ``
- Nível: `'AltoDireto'`, Pontos: `0`
- Registrar em `gatilhosAtivados` e em `gatilhosAmbiente`

**G3 — Sem revestimento (com supressão G2)**
- Condição: `g3_ambientesSemRevestimento.includes(instanceId)` **E** `!g2_ambientesSemReboco.includes(instanceId)`
- Se o ambiente estiver em `g2_ambientesSemReboco`, G3 é totalmente suprimido para ele — nem trigger, nem pontos
- Trigger: `` `REFORM_SEM_REVESTIMENTO_${instanceId}` ``
- Nível: `'Alto'`, Pontos: `3`
- Registrar em `gatilhosAtivados` e em `gatilhosAmbiente`

**G4 — Pontos indefinidos**
- Condição: `g3_ambientesPendentes.includes(instanceId)`
- Trigger: `` `PONTOS_INDEFINIDOS_${instanceId}` ``
- Nível: `'Médio'`, Pontos: `2`
- Registrar em `gatilhosAtivados` e em `gatilhosAmbiente`

### 3.4 Regra DIV-07 — por ambiente (substituição de `pontosIndefinidosAtivo`)

A variável global `pontosIndefinidosAtivo` é removida. Em cada iteração do loop, calcular:

```
const div07Ativo = g3_ambientesPendentes.includes(instanceId)
```

Aplicar `div07Ativo` em **dois** blocos existentes do loop:

- **Dormitório** (linha 72 atual): `const pontosTv = div07Ativo ? 0 : 2`
- **Home / Outros** (linha 82 atual): `const pontosTv = div07Ativo ? 0 : 2`

Os dois blocos recebem a mesma substituição — um usa `resp.tv`, o outro usa `resp.eletronicosList` para detectar TV, mas a regra DIV-07 se aplica igualmente.

### 3.5 Nova derivação do score global (substituição das linhas 132–149)

Substituir o bloco de cálculo global pela lógica de "pior ambiente":

```
Se não há ambientes em scorePorAmbiente:
  scoreGlobal = { pontos: 0, isAlto: false, classificacao: 'BAIXO' }

Senão:
  1. Verificar se algum ambiente tem isAlto === true
     → Se sim: isAlto global = true
               pontos global = max(pontos) entre ambientes com isAlto === true
  2. Senão, verificar se algum ambiente tem classificacao === 'MÉDIO'
     → Se sim: isAlto global = false
               pontos global = max(pontos) entre ambientes com classificacao === 'MÉDIO'
  3. Senão (todos BAIXO):
               isAlto global = false
               pontos global = max(pontos) entre todos

  classificacao global = classificar(pontos global, isAlto global)
```

O formato de retorno `{ pontos, isAlto, classificacao }` permanece inalterado.

---

## 4. `ccBuilder.js` — Especificação da Mudança

### 4.1 Remover os quatro blocos globais de G1–G4

Remover as linhas 31–76: os blocos `if (tem('REFORM_SEM_REBOCO'))`, `if (tem('REFORM_SEM_REVESTIMENTO') && ...)`, `if (tem('ILUMINACAO_EXTERNA'))` e `if (tem('PONTOS_INDEFINIDOS'))`, que geram CCs com `escopo: 'Global'`.

### 4.2 Reposicionar as variáveis de listas (já existem, ajustar se necessário)

As variáveis `ambientesSemReboco` e `ambientesSemRevestimentoNaoSuprimidos` (linhas 25–29) já existem e podem ser mantidas. Adicionar as que faltam:

```
const g1_ambientes          = state.global.g1_ambientes || []
const g3_ambientesPendentes = state.global.g3_ambientesPendentes || []
```

### 4.3 Dentro do loop de ambientes: adicionar CCs de G1–G4

Para cada `instancia` no loop, adicionar **antes** do bloco de REBAIXO existente:

**G1 — Iluminação externa**
```
se tem(`ILUMINACAO_EXTERNA_${instanceId}`) e g1_ambientes.includes(instanceId):
  push {
    id: `ILUMINACAO_EXTERNA_${instanceId}`,
    tipo: 'CC', nivel: 'MÉDIO', escopo: instanceId,
    textoCompleto: 'CLIENTE CIENTE E DE ACORDO QUE FIAÇÃO ELÉTRICA, INSTALAÇÃO DE ILUMINAÇÕES
      E SERVIÇOS DE ELETRICISTA É POR SUA RESPONSABILIDADE, PROFISSIONAL DEVE ESTAR LOCAL NO DIA DA MONTAGEM.',
    perguntaOrigem: 'G1'
  }
```

**G2 — Sem reboco**
```
se tem(`REFORM_SEM_REBOCO_${instanceId}`) e ambientesSemReboco.includes(instanceId):
  push {
    id: `REFORM_SEM_REBOCO_${instanceId}`,
    tipo: 'CC', nivel: 'ALTO', escopo: instanceId,
    textoCompleto: 'CLIENTE CIENTE E DE ACORDO QUE MEDIÇÃO TÉCNICA DE AMBIENTE FOI REALIZADA COM AMBIENTE
      EM REFORMA INACABADA E QUE DEVERÁ RESPEITAR A ALÍNEA (I) DA CLÁUSULA TERCEIRA DO CONTRATO DE COMPRA E VENDA.',
    perguntaOrigem: 'G2'
  }
```

**G3 — Sem revestimento (com supressão G2)**
```
se tem(`REFORM_SEM_REVESTIMENTO_${instanceId}`) e ambientesSemRevestimentoNaoSuprimidos.includes(instanceId):
  push {
    id: `REFORM_SEM_REVESTIMENTO_${instanceId}`,
    tipo: 'CC', nivel: 'ALTO', escopo: instanceId,
    textoCompleto: TEXTO_REVESTIMENTO_AUSENTE,
    perguntaOrigem: 'G3'
  }
```

A variável `ambientesSemRevestimentoNaoSuprimidos` já filtra ambientes que estão também em G2 — a supressão é preservada automaticamente.

**G4 — Pontos indefinidos**
```
se tem(`PONTOS_INDEFINIDOS_${instanceId}`) e g3_ambientesPendentes.includes(instanceId):
  push {
    id: `PONTOS_INDEFINIDOS_${instanceId}`,
    tipo: 'CC', nivel: 'MÉDIO', escopo: instanceId,
    textoCompleto: 'CLIENTE CIENTE E DE ACORDO QUE DEVERÁ ALTERAR E/OU PROVIDENCIAR PONTOS
      ELÉTRICOS/HIDRÁULICOS/GÁS ATÉ O DIA DA MONTAGEM, PARA CORRETA ADEQUAÇÃO DO PROJETO.',
    perguntaOrigem: 'G4'
  }
```

### 4.4 Textos dos CCs

Os textos de G1, G2 e G4 estavam inline no código atual (não importados de `checklistTextos.js`) — permanecem assim. O texto de G3 (`TEXTO_REVESTIMENTO_AUSENTE`) já é importado e continua sendo usado. Nenhum texto é alterado.

---

## 5. Arquivos de Verificação — Observações

### `StepRevisao.jsx`

- `calcularScore` e `construirCCs` continuam sendo chamadas da mesma forma — sem mudança na assinatura.
- A função `nomeAmbiente(escopo)` (linha 47–51) trata `'Global'` como caso especial e faz fallback para `instanceId`. Após a mudança, os CCs de G1–G4 terão `escopo: instanceId`, que será resolvido corretamente para o nome do ambiente.
- As seções de risco Alto/Médio/Baixo iteram todos os CCs por `cc.nivel` — continuarão funcionando com os novos CCs per-ambiente.
- **Ressalva D-02:** Linha 58 passa `pontos={scoreGlobal.pontos}` ao `ScoreBadge` global. Se o item 5 do PRD for implementado (DP-02), esta linha precisará ser alterada para não passar o `pontos`.

### `pdf.js`

- `calcularScore` e `construirCCs` continuam sendo chamadas da mesma forma.
- O Resumo Executivo (iteração de `ccsAlto`, `ccsMedio`, `ccsBaixo`) funcionará corretamente com os novos CCs per-ambiente, exibindo o nome do ambiente.
- **Ressalva D-01:** Linhas 229, 237, 245 e 253 fazem `ccPorId.get('ILUMINACAO_EXTERNA')` etc. — retornarão `undefined` após a mudança. Nenhum crash ocorre (`.filter(Boolean)`), mas os CCs deixam de aparecer inline nas perguntas G1–G4 da seção Checklist Completa. Ver DP-01.
- **Ressalva D-02:** Linha 139 imprime `(${scoreGlobal.pontos} pontos)` na capa. Se o item 5 do PRD for implementado (DP-02), esta linha deve ser removida.

---

## 6. Decisões Pendentes

Dois pontos do PRD geram conflito interno e requerem confirmação antes da implementação.

### DP-01 — CCs de G1–G4 na seção Checklist Completa do PDF

Após a mudança, os CCs de G1–G4 não aparecerão inline com as perguntas G1–G4 na Checklist Completa do PDF.

Opções:
- **(a) Aceitar o comportamento atual do pdf.js** — CCs de G1–G4 aparecem apenas no Resumo Executivo. A Checklist Completa exibe as perguntas sem CC inline. Nenhuma mudança no pdf.js.
- **(b) Atualizar pdf.js para iterar os novos IDs** — Para cada pergunta G1–G4, construir a lista de CCs per-ambiente e passá-los para `escreverPergunta`. Requer adicionar pdf.js à lista de arquivos afetados (mudança pequena).

### DP-02 — Exibição do número de pontos do score global (item 5 do PRD)

Para implementar "não exibir pontos do score global", dois arquivos precisam de mudança mínima:

- `StepRevisao.jsx` linha 58: substituir `pontos={scoreGlobal.pontos}` por nada (ou `pontos={null}` se `ScoreBadge` tratar null sem exibir)
- `pdf.js` linha 139: remover a linha que imprime `(${scoreGlobal.pontos} pontos)`

Opções:
- **(a) Implementar o item 5** — Adicionar StepRevisao.jsx e pdf.js à lista de arquivos afetados com essas duas mudanças mínimas.
- **(b) Adiar o item 5** — Manter a exibição de pontos do score global sem alteração por ora. O PRD aprovado inclui o item 5, mas sua implementação conflita com a restrição de "não tocar" nesses arquivos.

---

## 7. Critérios de Aceitação

AC-01 a AC-13 e os dois cenários de erro do PRD aplicam-se integralmente. Nenhuma alteração nos critérios.
