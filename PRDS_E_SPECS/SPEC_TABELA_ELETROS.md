# SPEC — Tabela de Eletros e Eletrônicos no PDF

**Status:** Aguardando aprovação
**Data:** 2026-06-08
**PRD de referência:** PRD_TABELA_ELETROS.md

---

## 1. Arquivo afetado

`src/services/pdf.js` — único arquivo a modificar.

---

## 2. Dependência a importar

Adicionar no topo do arquivo, após os imports existentes:

```js
import autoTable from 'jspdf-autotable'
```

`jspdf-autotable` versão 3.8.2 já está em `package.json`; nenhuma instalação é necessária.

---

## 3. Contexto do código real (leitura de pdf.js)

### Variáveis disponíveis no escopo de `gerarPdf()`

| Variável | Valor | Uso na tabela |
|---|---|---|
| `margemEsquerda` | `20` (mm) | `startX` da tabela |
| `larguraConteudo` | `pageWidth - 40` = 170 mm | `tableWidth` da tabela |
| `y` | posição Y corrente | `startY` da tabela |
| `pageHeight` | altura A4 | já usado por `garantirEspaco` |

### Funções disponíveis reutilizadas

`descreverEletro(eletro)` — linha 47:
```
tipo → descricao (se presente) → subtipo (se presente)
```

`descreverEletronico(eletronico)` — linha 60:
```
tipo → subtipo (se presente) → modelo (se presente)
```

`escreverPergunta(pergunta, resposta, itensRelacionados)` — linha 196:
chama `garantirEspaco(14)` internamente; escreve `pergunta` em bold 10pt
e `Resposta: <resposta ?? '—'>` em normal 9pt.

### Blocos afetados

| Bloco | Condição no código | Linhas a substituir |
|---|---|---|
| Eletros | `['cozinha', 'outros'].includes(formType)` | `resp.eletros.forEach` — linhas 374–381 |
| Eletrônicos | `['home', 'outros'].includes(formType)` | `resp.eletronicosList.forEach` — linhas 393–399 |

---

## 4. Divergências entre PRD e código real

> O código prevalece. As divergências estão registradas como observações.

| # | O que o PRD diz | O que o código faz | Impacto na implementação |
|---|---|---|---|
| D-01 | `descreverEletro()` "combina Tipo, Subtipo e Descrição" | Ordem real: `tipo → descricao → subtipo` | Nenhum — a função não é alterada, apenas consumida. A coluna Tipo exibirá a string na ordem produzida pelo código real. |
| D-02 | Eletrônico atual usa `Eletrônico ${index + 1}` como rótulo | Código confirma: linha 394 usa exatamente `Eletrônico ${index + 1}` | Nenhum — será removido junto com o loop. |
| D-03 | Bloco eletros: linhas 373–382 | Linhas reais: 373 (if), 374–381 (forEach), 382 (fecha forEach), 383 (fecha if) | A substituição remove as linhas 374–381 (o forEach interior); o `if` externo (linha 373) e seu fechamento permanecem intactos. |

---

## 5. Estrutura da tabela

### 5.1 Colunas

Mesma estrutura para eletros e eletrônicos:

| Coluna | Header | Campo fonte | Fallback vazio |
|---|---|---|---|
| 1 | Tipo | `descreverEletro(eletro)` / `descreverEletronico(eletronico)` | — |
| 2 | Modelo | `eletro.modelo` / sempre `null` para eletrônicos | `—` |
| 3 | Largura (cm) | `eletro.largura_cm` / `eletronico.largura_cm` | `—` |
| 4 | Altura (cm) | `eletro.altura_cm` / `eletronico.altura_cm` | `—` |
| 5 | Profundidade (cm) | `eletro.profundidade_cm` / `eletronico.profundidade_cm` | `—` |
| 6 | Link | `'Ver link'` se campo preenchido, `'—'` caso contrário | `—` |

> **Regra de campo vazio:** qualquer valor `null`, `undefined` ou string vazia (`''`)
> exibe `'—'` na célula.

> **Coluna Modelo nos eletrônicos:** sempre `'—'`, conforme premissa 3 do PRD.
> O modelo de eletrônico já está incorporado na string da coluna Tipo por
> `descreverEletronico()`.

### 5.2 Larguras de coluna (em mm, total = 170 mm)

| Coluna | Largura |
|---|---|
| Tipo | 55 |
| Modelo | 40 |
| Largura (cm) | 20 |
| Altura (cm) | 20 |
| Profundidade (cm) | 22 |
| Link | 13 |

Texto longo é quebrado automaticamente pelo autoTable; nenhuma coluna trunca.

---

## 6. Estilos da tabela

Usando a paleta já presente em pdf.js:

| Elemento | Propriedade | Valor |
|---|---|---|
| Header background | fillColor | `[180, 150, 80]` (dourado já usado nos separadores) |
| Header text | textColor | `[255, 255, 255]` |
| Header font | fontStyle | `'bold'` |
| Header font size | fontSize | `9` |
| Body font size | fontSize | `9` |
| Body text color | textColor | `[0, 0, 0]` |
| Body alternate row | alternateRowStyles | `{ fillColor: [245, 240, 230] }` |
| Cell padding | cellPadding | `2` (mm) |
| Line color | lineColor | `[180, 150, 80]` |
| Line width | lineWidth | `0.2` |

---

## 7. Rótulo de seção antes da tabela

Chamar `escreverPergunta()` imediatamente antes do `autoTable`, com:

```js
escreverPergunta('Eletrodomésticos', null)
// ou
escreverPergunta('Eletrônicos', null)
```

`resposta = null` faz com que o render exiba `Resposta: —`, seguindo o mesmo
padrão visual das demais perguntas do PDF. Isso é consistente com o comportamento
de `escreverPergunta` para campos não preenchidos.

> **Observação:** `escreverPergunta` sempre escreve a linha `Resposta: X`. Para um
> rótulo de seção isso é aceitável — mantém a consistência visual e não requer
> modificação da função. Se futuramente for desejável um cabeçalho puro sem
> `Resposta:`, usar `escreverTituloSecao()` seria a alternativa.

---

## 8. Posicionamento e sincronização de `y`

### Antes da tabela

Após `escreverPergunta(...)`, chamar `garantirEspaco(20)` para assegurar espaço
mínimo antes do início da tabela. Se não houver espaço, uma nova página é adicionada
e `y` é resetado para `margemSuperior`.

### Chamada do autoTable

```js
autoTable(doc, {
  startY: y,
  margin: { left: margemEsquerda, right: margemDireita },
  tableWidth: larguraConteudo,
  head: [[/* colunas */]],
  body: [[/* linhas */]],
  // ... estilos e hooks
})
```

### Após a tabela

```js
y = doc.lastAutoTable.finalY + 4
```

`doc.lastAutoTable.finalY` é a coordenada Y do final da última linha renderizada.
Somar `4` mm cria margem visual antes do próximo elemento.

---

## 9. Link clicável — implementação

O link PDF é adicionado via hook `didDrawCell` do autoTable. Quando a célula
pertence à coluna Link e seu texto é `'Ver link'`, registrar uma anotação de link:

```js
didDrawCell: (data) => {
  if (data.column.index === 5 && data.cell.raw === 'Ver link') {
    const url = /* URL correspondente ao item desta linha */
    doc.link(
      data.cell.x,
      data.cell.y,
      data.cell.width,
      data.cell.height,
      { url }
    )
  }
}
```

Para que a URL esteja disponível no hook, mapear o array fonte para um array de
objetos `{ row: [...celulas], url: string|null }` antes de passar ao autoTable,
e usar o índice `data.row.index` para recuperar a URL correspondente.

---

## 10. Construção das linhas (body)

### Para eletros

```js
const body = resp.eletros.map((eletro) => [
  descreverEletro(eletro)             || '—',
  eletro.modelo                       || '—',
  eletro.largura_cm                   || '—',
  eletro.altura_cm                    || '—',
  eletro.profundidade_cm              || '—',
  eletro.link ? 'Ver link' : '—',
])
const urls = resp.eletros.map((eletro) => eletro.link || null)
```

### Para eletrônicos

```js
const body = resp.eletronicosList.map((eletronico) => [
  descreverEletronico(eletronico)     || '—',
  '—',
  eletronico.largura_cm               || '—',
  eletronico.altura_cm                || '—',
  eletronico.profundidade_cm          || '—',
  eletronico.link ? 'Ver link' : '—',
])
const urls = resp.eletronicosList.map((eletronico) => eletronico.link || null)
```

---

## 11. Pseudocódigo da substituição

### Bloco eletros (substitui linhas 374–381)

```
// ANTES (a remover):
resp.eletros.forEach((eletro, index) => {
  escreverPergunta(`Eletro ${index + 1}`, descreverEletro(eletro))
  if (eletro.modelo) escreverPergunta('Modelo', eletro.modelo)
  if (eletro.largura_cm) escreverPergunta('Largura (cm)', eletro.largura_cm)
  if (eletro.altura_cm) escreverPergunta('Altura (cm)', eletro.altura_cm)
  if (eletro.profundidade_cm) escreverPergunta('Profundidade (cm)', eletro.profundidade_cm)
  if (eletro.link) escreverPergunta('Link', eletro.link)
})

// DEPOIS (substituto):
escreverPergunta('Eletrodomésticos', null)
garantirEspaco(20)
const eletrosBody = /* mapeamento descrito na seção 10 */
const eletrosUrls = /* mapeamento de urls */
autoTable(doc, {
  startY: y,
  margin: { left: margemEsquerda },
  tableWidth: larguraConteudo,
  head: [['Tipo', 'Modelo', 'Largura (cm)', 'Altura (cm)', 'Profundidade (cm)', 'Link']],
  body: eletrosBody,
  columnStyles: { /* larguras da seção 5.2 */ },
  headStyles: { /* estilos da seção 6 */ },
  bodyStyles: { /* estilos da seção 6 */ },
  alternateRowStyles: { fillColor: [245, 240, 230] },
  didDrawCell: (data) => { /* anotação de link — seção 9 */ },
})
y = doc.lastAutoTable.finalY + 4
```

### Bloco eletrônicos (substitui linhas 393–399)

Idêntico ao bloco de eletros, com:
- Rótulo: `escreverPergunta('Eletrônicos', null)`
- `body` e `urls` construídos a partir de `resp.eletronicosList`
- Coluna Modelo sempre `'—'`

---

## 12. O que NÃO mudar

Tudo o que o PRD lista como intocado permanece inalterado. Resumindo as partes
adjacentes ao bloco afetado:

- Linha 366–371: `if (['cozinha', 'outros'].includes(formType))` → pergunta
  `eletrosDefined` com CC — **intocado**.
- Linha 373: `if (resp.eletrosDefined === true && resp.eletros?.length > 0)` —
  **intocado** (guarda o bloco que será modificado internamente).
- Linha 385–391: `if (['home', 'outros'].includes(formType))` → pergunta
  `eletronicos` com CC — **intocado**.
- Linha 392: `if (resp.eletronicos === true && resp.eletronicosList?.length > 0)` —
  **intocado**.
- Linhas 403–409: cuba e observações — **intocados**.
- Funções `descreverEletro` e `descreverEletronico` — **intocadas**.

---

## 13. Critérios de verificação pós-implementação

Os 10 critérios de aceitação do PRD (CA-01 a CA-10) são o critério definitivo.
Pontos de atenção técnica durante a verificação:

1. `y` após a tabela aponta para após `finalY + 4` — validar que "Observações" e
   "cuba" aparecem imediatamente após a tabela sem sobreposição.
2. Verificar que `garantirEspaco` não é chamado com valor negativo ou zero após
   setar `y = doc.lastAutoTable.finalY + 4`.
3. Em ambiente tipo `outros` com eletros e eletrônicos, confirmar que as duas
   tabelas são independentes e que `y` é corretamente sincronizado entre elas.
4. Clicar no link "Ver link" num leitor de PDF (Acrobat, Chrome, Edge) para validar
   CA-02.
5. Gerar um PDF sem eletros (`eletrosDefined = false`) e confirmar que nenhuma
   tabela aparece (CA-06 — nenhuma regressão).
