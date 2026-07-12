# SPEC — Tabela Compacta no Resumo Executivo do PDF

## Arquivo Afetado

**`src/services/pdf.js`** — único arquivo a ser modificado.

---

## O que Será Removido

### 1. Função `escreverResumoItem` (linhas 169–182)

```js
const escreverResumoItem = (cc) => {
  garantirEspaco(16)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...COR_NIVEL[cc.nivel])
  const titulo = `RISCO ${cc.nivel} — ${nomeAmbiente(cc.escopo)}`
  escreverLinhas(doc.splitTextToSize(titulo, larguraConteudo), margemEsquerda, 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)
  escreverLinhas(doc.splitTextToSize(`CC: ${cc.textoCompleto}`, larguraConteudo), margemEsquerda, 4.5)
  y += 3
}
```

### 2. Bloco de filtragem e loop do Resumo Executivo (linhas 212–218)

```js
const ccsResumo = ccs.filter((cc) => cc.tipo === 'CC')
const ccsAlto = ccsResumo.filter((cc) => cc.nivel === 'ALTO')
const ccsMedio = ccsResumo.filter((cc) => cc.nivel === NIVEL_MEDIO)
const ccsBaixo = ccsResumo.filter((cc) => cc.nivel === 'BAIXO')

escreverTituloSecao('Resumo Executivo')
;[...ccsAlto, ...ccsMedio, ...ccsBaixo].forEach((cc) => escreverResumoItem(cc))
```

**O que permanece intacto:** `ccs` (resultado de `construirCCs`), `ccPorId`, e a variável `NIVEL_MEDIO`. Todos continuam sendo usados na seção Checklist Completa.

---

## O que Será Adicionado

O bloco removido acima é substituído integralmente pelo bloco a seguir, que ocupa as mesmas linhas (212–218 e seguintes):

### Passo 1 — Mapeamento estático de prefixo de gatilho → texto curto

Declarar dentro de `gerarPdf`, antes da chamada a `escreverTituloSecao('Resumo Executivo')`:

```js
const GATILHO_TEXTO = {
  GRANITO_RETIRAR:         'Remover granito',
  TANQUE_RETIRAR:          'Remover tanque',
  ELETROS_NAODEF:          'Eletros indefinidos',
  ELETRONICOS_NAODEF:      'Eletrônicos indefinidos',
  TV_PONTO:                'Ponto fora do painel',
  CORTINEIRO_NAOINSTALADO: 'Cortineiro 150mm',
  RODAPE_AUSENTE:          'Instalar rodapé pós-montagem',
  RODAPE_EXISTENTE:        'Roupeiro sobre rodapé',
  REFORM_SEM_REVESTIMENTO: 'Sem revestimento',
  ILUMINACAO_EXTERNA:      'Iluminação por conta do cliente',
  REFORM_SEM_REBOCO:       'Reboco inacabado',
  PONTOS_INDEFINIDOS:      'Pontos pendentes',
  REBAIXO:                 null, // texto gerado dinamicamente por ambiente
}
```

`REBAIXO` é marcado `null` para sinalizar que requer tratamento especial.

### Passo 2 — Função auxiliar para obter o texto curto de um gatilho

```js
const textoCurtoGatilho = (gatilhoId, instanceId) => {
  const prefixo = gatilhoId.replace(`_${instanceId}`, '')
  if (prefixo === 'REBAIXO') {
    const cm = (state.global.g4_ambientes ?? []).find((a) => a.instanceId === instanceId)?.cm ?? '?'
    return `Rebaixo de ${cm}cm`
  }
  return GATILHO_TEXTO[prefixo] ?? null
}
```

A função extrai o prefixo removendo o sufixo `_${instanceId}` do id completo (ex: `GRANITO_RETIRAR_abc123` → `GRANITO_RETIRAR`). Retorna `null` para prefixos sem mapeamento, que serão silenciosamente omitidos.

### Passo 3 — Construção das linhas da tabela

```js
const linhasTabela = state.ambientesSelecionados
  .filter((instancia) => {
    const score = scorePorAmbiente[instancia.instanceId]
    return score && score.gatilhos.length > 0
  })
  .map((instancia) => {
    const { instanceId } = instancia
    const score = scorePorAmbiente[instanceId]
    const textos = score.gatilhos
      .map((id) => textoCurtoGatilho(id, instanceId))
      .filter(Boolean)
    if (ccs.some((c) => c.id === `RODAPE_EXISTENTE_${instanceId}`)) {
      textos.push('Roupeiro sobre rodapé')
    }
    const acoes = textos.join(' — ')
    return [formatarNomeAmbiente(instancia), acoes, score.classificacao]
  })
```

**Fontes de dados:**
- **Coluna Ambiente:** `formatarNomeAmbiente(instancia)` — idêntico ao padrão já usado na Checklist Completa.
- **Coluna Ações:** gatilhos de `scorePorAmbiente[instanceId].gatilhos`, convertidos via `textoCurtoGatilho`, unidos por `' — '`.
- **Coluna Risco:** `scorePorAmbiente[instanceId].classificacao` — retorna `'ALTO'`, `'MÉDIO'` ou `'BAIXO'`.

> **Nota sobre `RODAPE_EXISTENTE`:** esse gatilho não existe em `scorePorAmbiente.gatilhos` (ver Observação 1). **Decisão tomada: incluir via `ccs`.** Após mapear os textos de `score.gatilhos`, verificar se existe um item em `ccs` com `id === \`RODAPE_EXISTENTE_${instanceId}\`` e, se sim, concatenar `'Roupeiro sobre rodapé'` ao array de textos antes de unir com `' — '`.

### Passo 4 — Chamada ao autoTable substituindo o loop

```js
escreverTituloSecao('Resumo Executivo')

if (linhasTabela.length > 0) {
  autoTable(doc, {
    startY: y,
    margin: { left: margemEsquerda, right: margemDireita },
    tableWidth: larguraConteudo,
    head: [['Ambiente', 'Ações e pontos de atenção', 'Risco']],
    body: linhasTabela,
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 100 },
      2: { cellWidth: 15 },
    },
    styles: { cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.2, overflow: 'linebreak' },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [0, 0, 0] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        const cor = COR_NIVEL[data.cell.raw]
        if (cor) data.cell.styles.textColor = cor
      }
    },
  })
  y = doc.lastAutoTable.finalY + 4
}
```

**Detalhes da configuração:**
- `startY: y` — posiciona a tabela imediatamente após o título da seção, usando a variável `y` corrente.
- `tableWidth: larguraConteudo` — 170 mm (210 mm − 20 mm esq − 20 mm dir).
- Larguras fixas: 55 + 100 + 15 = 170 mm.
- `overflow: 'linebreak'` declarado explicitamente em `styles` para deixar a intenção clara, embora seja o default do autoTable.
- `didParseCell` aplica cor ao texto da coluna Risco (índice 2) usando `COR_NIVEL` existente.
- `y` atualizado pelo padrão já usado nas tabelas de eletros/eletrônicos.
- O bloco `if (linhasTabela.length > 0)` garante que, sem gatilhos ativos, nenhum erro seja gerado (AC-07).

---

## Observações — Divergências entre PRD e Código Real

### Observação 1 — `RODAPE_EXISTENTE` não existe no `scoreEngine.js`

**O PRD descreve:** `RODAPE_EXISTENTE` como um dos 13 gatilhos com texto curto mapeado, afirmando que ele estará em `scorePorAmbiente[instanceId].gatilhos`.

**O código real:** No `scoreEngine.js`, **não existe nenhuma linha** que gere `RODAPE_EXISTENTE_${instanceId}` nem em `gatilhosAtivados` nem em `scorePorAmbiente[instanceId].gatilhos`. Esse item é criado diretamente no `ccBuilder.js` (linha 163–172) com condição `formType === 'dormitorio' && resp.rodape === true`, sem passar pelo mecanismo de gatilhos. Ele também tem `nivel: null` — único CC/Aviso sem nível definido.

**Impacto:** Se a implementação usar apenas `scorePorAmbiente[instanceId].gatilhos` como fonte, `RODAPE_EXISTENTE` **nunca aparecerá** na tabela nova.

**Decisão tomada (A):** Incluir via `ccs`. No `.map` de construção das linhas, após resolver os textos de `score.gatilhos`, verificar `ccs.some(c => c.id === \`RODAPE_EXISTENTE_${instanceId}\`)` e, se verdadeiro, adicionar `'Roupeiro sobre rodapé'` ao array antes de unir com `' — '`.

### Observação 2 — Nível de `REFORM_SEM_REVESTIMENTO`: MÉDIO no score vs ALTO no ccBuilder

**O PRD descreve:** a coluna Risco usa `scorePorAmbiente[instanceId].classificacao`.

**O código real:** `ccBuilder.js` (linha 68) hardcoda `nivel: 'ALTO'` para `REFORM_SEM_REVESTIMENTO`. O `scoreEngine.js` (linha 39) atribui `nivel: 'Médio'` e `pontos: 4` — o que resulta em `classificacao: 'MÉDIO'` quando é o único gatilho ativo. O bloco atual do Resumo Executivo usa `cc.nivel` (ALTO do ccBuilder), portanto exibia "RISCO ALTO".

**Impacto:** A tabela nova exibirá `'MÉDIO'` na coluna Risco para um ambiente onde `REFORM_SEM_REVESTIMENTO` seja o único gatilho (ou combinado com outros que não somem 8+ pts). Isso é **mudança de comportamento visual** intencional — alinhada ao commit `6dbd195` ("ALTERAÇÃO DE LOGICA G3 DO REVESTIMENTO PARA NAO SUBIR ALTO DIRETO, SCORE ENGINE PARA MEDIO E 4 PONTOS").

### Observação 3 — Escopo de `ELETROS_NAODEF` e `ELETRONICOS_NAODEF`

**O PRD:** lista esses dois gatilhos no mapeamento sem mencionar restrição de formType.

**O código real:**
- `ELETROS_NAODEF` é gerado **somente** para `formType === 'cozinha'` (`scoreEngine.js` linha 95). Não é gerado para `outros`.
- `ELETRONICOS_NAODEF` é gerado **somente** para `formType === 'home'` (`scoreEngine.js` linha 103). Não é gerado para `outros`.

**Impacto:** zero — o mapeamento `GATILHO_TEXTO` cobre os prefixos; esses gatilhos simplesmente nunca serão gerados para `outros`. Não há erro, apenas cobertura menor que a descrita no PRD.

### Observação 4 — `CORTINEIRO_NAOINSTALADO` e `RODAPE_EXISTENTE` são do tipo `'AVISO'`

**O PRD (premissa 2):** a tabela nova inclui todos os gatilhos de `scorePorAmbiente[instanceId].gatilhos`, abrangendo tanto `tipo === 'CC'` quanto `tipo === 'AVISO'`.

**O código real:**
- `CORTINEIRO_NAOINSTALADO` é `tipo: 'AVISO'` com `nivel: 'BAIXO'` no ccBuilder, e **SIM** existe no scoreEngine — aparecerá normalmente na tabela.
- `RODAPE_EXISTENTE` é `tipo: 'AVISO'` com `nivel: null` no ccBuilder, e **NÃO** existe no scoreEngine — ver Observação 1.

### Observação 5 — Ordenação das linhas

**O PRD:** a ordem das linhas segue `ambientesSelecionados` (não há reordenação por nível de risco).

**O bloco atual:** ordena por ALTO → MÉDIO → BAIXO dentro do Resumo Executivo, agrupando CCs de mesmo nível. A tabela nova **quebra esse comportamento** e passa a exibir os ambientes na ordem de cadastro — mudança de comportamento intencional e documentada no PRD.

---

## Critérios de Aceitação

Herdados do PRD. Nenhuma alteração necessária, exceto AC-07:

**AC-07 (ajuste):** Se `linhasTabela.length === 0`, o PDF exibe o título "Resumo Executivo" sem tabela abaixo. O `if (linhasTabela.length > 0)` garante isso — nenhum `autoTable` é chamado, nenhum erro é gerado.

