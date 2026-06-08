# SPEC — Polegadas da TV por Eletrônico

**Status:** Aguardando aprovação  
**Data:** 2026-06-08  
**PRD de referência:** PRD_POLEGADAS_TV.md

---

## 1. Escopo resumido

Cinco arquivos serão alterados:

| Arquivo | Natureza da mudança |
|---|---|
| `src/steps/StepPerguntasPorAmbiente/FormHomeSalaOffice.jsx` | Campo polegadas migra de `resp` para `eletronico` |
| `src/steps/StepPerguntasPorAmbiente/FormOutros.jsx` | Idem |
| `src/domain/schema.js` | Remove `tv_polegadas` dos defaults de `home` e `outros` |
| `src/steps/StepPerguntasPorAmbiente/formUtils.js` | Validação de polegadas migra de ambiente para eletrônico |
| `src/services/pdf.js` | Coluna Tipo passa a mostrar polegadas; coluna Modelo passa a mostrar `eletronico.modelo` |

---

## 2. FormHomeSalaOffice.jsx

### 2.1 Objeto criado em `addEletronico`

Localização: linhas 20–34.

Atualmente o objeto não contém `polegadas`. Adicionar o campo condicionalmente, somente quando `tipo === 'TV'`:

```
// antes
eletronico: {
  tipo,
  subtipo: config?.subtipos?.[0] ?? '',
  modelo: '',
  largura_cm: '',
  altura_cm: '',
  profundidade_cm: '',
  link: '',
}

// depois
eletronico: {
  tipo,
  subtipo: config?.subtipos?.[0] ?? '',
  ...(tipo === 'TV' ? { polegadas: '' } : {}),
  modelo: '',
  largura_cm: '',
  altura_cm: '',
  profundidade_cm: '',
  link: '',
}
```

### 2.2 Campo Polegadas no card da TV

Localização: linhas 107–115 (dentro do bloco `{isTV && (...)}`).

Substituir a leitura/escrita de `resp.tv_polegadas` por `eletronico.polegadas` e `updEletronico`:

```
// antes
<input
  type="number"
  value={resp.tv_polegadas ?? ''}
  onChange={(e) => set('tv_polegadas', e.target.value)}
/>
{erros.tv_polegadas && <span ...>{erros.tv_polegadas}</span>}

// depois
<input
  type="number"
  value={eletronico.polegadas ?? ''}
  onChange={(e) => updEletronico(index, 'polegadas', e.target.value)}
/>
{erros[`eletronico_${index}_polegadas`] && (
  <span ...>{erros[`eletronico_${index}_polegadas`]}</span>
)}
```

O helper `updEletronico` já existe (linha 36–38) e não precisa ser criado.

---

## 3. FormOutros.jsx

As mesmas alterações de §2, porém adaptadas ao padrão do arquivo.

### 3.1 Objeto criado em `addEletronico`

Localização: linhas 62–77. Mesmo diff de §2.1.

### 3.2 Campo Polegadas no card da TV

Localização: linhas 408–416 (dentro do bloco `{isTV && (...)}`).

**Observação — divergência de padrão interno (código prevalece):** `FormOutros.jsx` não define um helper local `updEletronico`. Os campos dos cards de eletrônico usam `dispatch` diretamente (ex: linhas 425–432). O campo polegadas deve seguir o mesmo padrão do arquivo:

```
// antes
<input
  type="number"
  value={resp.tv_polegadas ?? ''}
  onChange={(e) => set('tv_polegadas', e.target.value)}
/>
{erros.tv_polegadas && <span ...>{erros.tv_polegadas}</span>}

// depois
<input
  type="number"
  value={eletronico.polegadas ?? ''}
  onChange={(e) => dispatch({
    type: 'UPDATE_ELETRONICO',
    instanceId,
    index,
    campo: 'polegadas',
    valor: e.target.value,
  })}
/>
{erros[`eletronico_${index}_polegadas`] && (
  <span ...>{erros[`eletronico_${index}_polegadas`]}</span>
)}
```

---

## 4. schema.js

### 4.1 Default `home` — remover `tv_polegadas`

Localização: linha 34.

```
// remover esta linha:
tv_polegadas: null,
```

### 4.2 Default `outros` — remover `tv_polegadas`

Localização: linha 58.

```
// remover esta linha:
tv_polegadas: null,
```

**Observação — campos legados fora de escopo (código prevalece):** Além de `tv_polegadas`, os defaults de `home` (linhas 33–39) e `outros` (linhas 57–63) contêm `tv`, `tv_modelo`, `tv_largura_cm`, `tv_altura_cm`, `tv_profundidade_cm` e `tv_link`. Nenhum desses campos é preenchido pelos formulários correspondentes (ambos usam `eletronicosList`). O PRD menciona apenas `tv_polegadas` para remoção. Os demais campos legados ficam fora do escopo desta melhoria.

---

## 5. formUtils.js

### 5.1 Adicionar validação de polegadas em `validarEletronicos`

Localização: função `validarEletronicos`, linhas 76–100. Adicionar a verificação após a de `profundidade_cm` (linha 98):

```
// adicionar dentro do forEach, após a verificação de profundidade_cm:
if (eletronico.tipo === 'TV' && !preenchido(eletronico.polegadas)) {
  erros[`eletronico_${index}_polegadas`] = 'Obrigatório'
}
```

A chave de erro `eletronico_${index}_polegadas` é consistente com o padrão já usado pelos outros campos do card (`eletronico_${index}_subtipo`, `eletronico_${index}_largura`, etc.).

### 5.2 Remover validação de `tv_polegadas` no nível do ambiente

Localização: linhas 131–137.

```
// antes
if (['home', 'outros'].includes(formType)) {
  const hasTv = (resp.eletronicosList || []).some((e) => e.tipo === 'TV')
  if (hasTv) {
    if (resp.tvPontoFinal === null) erros.tvPontoFinal = 'Selecione uma opção'
    if (!preenchido(resp.tv_polegadas)) erros.tv_polegadas = 'Obrigatório'
  }
}

// depois (manter tvPontoFinal, remover tv_polegadas)
if (['home', 'outros'].includes(formType)) {
  const hasTv = (resp.eletronicosList || []).some((e) => e.tipo === 'TV')
  if (hasTv) {
    if (resp.tvPontoFinal === null) erros.tvPontoFinal = 'Selecione uma opção'
  }
}
```

**Observação:** A validação de `tvPontoFinal` permanece no nível do ambiente porque o campo `tvPontoFinal` continua sendo armazenado em `resp` (não no objeto do eletrônico), conforme premissa do PRD §7.

---

## 6. pdf.js

### 6.1 Função `descreverEletronico`

Localização: linhas 61–72.

Atualmente inclui `eletronico.modelo` na string, jogando-o na coluna Tipo. Deve ser substituído por `eletronico.polegadas` para TVs, com o símbolo `"`.

```
// antes
function descreverEletronico(eletronico) {
  const partes = [eletronico.tipo]
  if (eletronico.subtipo) partes.push(eletronico.subtipo)
  if (eletronico.modelo) partes.push(eletronico.modelo)
  return partes.join(' — ')
}

// depois
function descreverEletronico(eletronico) {
  const partes = [eletronico.tipo]
  if (eletronico.subtipo) partes.push(eletronico.subtipo)
  if (eletronico.tipo === 'TV' && eletronico.polegadas) partes.push(`${eletronico.polegadas}"`)
  return partes.join(' — ')
}
```

Resultado esperado por tipo:
- TV com 55": `"TV — 55""`
- Home Theater sem subtipo: `"Home Theater"`
- Eletrônico com subtipo (caso futuro): `"Tipo — Subtipo"`

### 6.2 Construtor de linhas da tabela de eletrônicos — coluna Modelo

Localização: linha 466 (dentro do `eletronicoBody` map, linhas 464–471).

```
// antes
const eletronicoBody = resp.eletronicosList.map((eletronico) => [
  descreverEletronico(eletronico) || '—',
  '—',                              // ← linha 466
  eletronico.largura_cm || '—',
  ...
])

// depois
const eletronicoBody = resp.eletronicosList.map((eletronico) => [
  descreverEletronico(eletronico) || '—',
  eletronico.modelo || '—',         // ← linha 466 alterada
  eletronico.largura_cm || '—',
  ...
])
```

### 6.3 Bloco de TV textual (linhas 358–376) — não alterar

**Observação — divergência documentada (código prevalece):** O PRD afirma que esse bloco "é relevante apenas para dormitório". No código, a condicional abrange `['dormitorio', 'home', 'outros']`. Para `home` e `outros`, `resp.tv` nunca é definido pela UI (nenhum campo o preenche), portanto o bloco imprime `"—"` para esses tipos e nunca entra no `if (resp.tv === true)`. É código morto para home/outros, mas o PRD instrui a não tocar — mantido sem alteração.

---

## 7. O que não muda

Confirmado pela leitura do código:

- `FormDormitorio.jsx` — não lido, não tocado.
- `scoreEngine.js` — detecta TV via `eletronicosList.some(e => e.tipo === 'TV')`, sem dependência de `tv_polegadas`.
- `ccBuilder.js` — não usa `tv_polegadas`.
- `FormProvider.jsx` — reducer genérico; não constrói estrutura de eletrônico.
- Tabela de eletrodomésticos (`descreverEletro`, tabela de `eletros`) — não alterada.
- Demais colunas da tabela de eletrônicos (Largura, Altura, Profundidade, Link) — não alteradas.

---

## 8. Ordem de implementação sugerida

1. `schema.js` — remover `tv_polegadas` de `home` e `outros`.
2. `formUtils.js` — mover validação de polegadas para dentro de `validarEletronicos`.
3. `FormHomeSalaOffice.jsx` — adicionar `polegadas` ao objeto e migrar o campo no card.
4. `FormOutros.jsx` — idem, usando `dispatch` direto.
5. `pdf.js` — corrigir `descreverEletronico` e a coluna Modelo.
