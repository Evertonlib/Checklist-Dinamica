# SPEC — Diferenciação de Tipo de Tanque (Tanque Tradicional vs. Tanque Embutido na Bancada)

**Status:** Aguardando aprovação
**Data:** 2026-07-23
**PRD de referência:** `PRD_DIFERENCIACAO_TIPO_TANQUE.md`
**Regra de conflito:** onde este Spec e o código real hoje divergem de alguma frase do PRD, o **código prevalece**; divergências estão listadas na seção "Observações".

---

## 1. Escopo resumido

Sete arquivos são alterados:

| Arquivo | Natureza da mudança |
|---|---|
| `src/domain/schema.js` | Novo campo `tanqueEmbutido: null` em `defaultsPorFormType.cozinha` e `defaultsPorFormType.outros` |
| `src/steps/StepPerguntasPorAmbiente/FormCozinha.jsx` | Nova pergunta "Qual o tipo de tanque?" entre "Existe tanque no local?" e "Haverá móveis na região do tanque?", com layout de botões empilhados de largura total (reaproveitando o padrão já existente de `styles.opcoesCama`/`styles.opcaoCama`) e reset de `tanqueMoveis` ao trocar de tipo |
| `src/steps/StepPerguntasPorAmbiente/FormOutros.jsx` | Mesma alteração, independente, neste componente |
| `src/steps/StepPerguntasPorAmbiente/formUtils.js` | Validação da nova pergunta e ajuste da obrigatoriedade de `tanqueMoveis` |
| `src/domain/scoreEngine.js` | Condição adicional `tanqueEmbutido === false` no gatilho `TANQUE_RETIRAR_${instanceId}` |
| `src/services/pdf.js` | Impressão da nova pergunta/resposta e ocultação condicional de "Haverá móveis" |
| `especificacao-checklist-dinamica.md` | Acrescentar, apenas no trecho da pergunta de tanque, a nova pergunta e a condição que ela cria sobre o CC (ver seção 8) |

Nenhuma dependência nova é introduzida e **nenhum arquivo de CSS é criado, movido ou alterado**: as classes reaproveitadas na seção 4 (`styles.opcoesCama`, `styles.opcaoCama`, `styles.ativo`) já existem hoje em `StepPerguntasPorAmbiente.module.css`, módulo já importado por `FormCozinha.jsx` e `FormOutros.jsx` (ver seção 4.1). `src/domain/ccBuilder.js`, `src/domain/checklistTextos.js`, `src/domain/ambientes.js`, `src/context/FormProvider.jsx` e `src/steps/StepRevisao/StepRevisao.jsx` não são tocados (ver seção 9).

---

## 2. Nome e semântica do novo campo

Campo: **`tanqueEmbutido`**, booleano de três estados (`null` | `true` | `false`), igual nos dois blocos de `schema.js`.

| Valor | Significado |
|---|---|
| `null` | Tipo de tanque ainda não respondido |
| `false` | Tanque tradicional (de porcelana ou plástico, apoiado no chão) |
| `true` | Tanque embutido na bancada de granito |

**Detecção de "respondida" tolerante a rascunhos legados.** Rascunhos salvos antes desta melhoria não têm a chave `tanqueEmbutido` no objeto de resposta — nesse caso `resp.tanqueEmbutido` é `undefined`, não `null`. Todo ponto do código que precisa decidir "a pergunta de tipo de tanque já foi respondida?" deve usar uma comparação que trate `undefined` e `null` da mesma forma (nunca comparar apenas com `=== null`), por exemplo:

```js
const tipoTanqueRespondido = resp.tanqueEmbutido === true || resp.tanqueEmbutido === false
```

Isso é necessário em `formUtils.js` e em `pdf.js` (seções 5 e 6). Em `scoreEngine.js` isso não é necessário: o gatilho só verifica `resp.tanqueEmbutido === false`, que já é `false` para qualquer valor diferente de `false` (incluindo `undefined`), então rascunhos legados nunca disparam o CC indevidamente — consistente com CA-14.

---

## 3. `src/domain/schema.js`

### 3.1 Default `cozinha`

Localização: linhas 3–11 (bloco `cozinha` de `defaultsPorFormType`).

```js
// antes
cozinha: {
  granito: null,
  granitoadaptar: null,
  tanque: null,
  tanqueMoveis: null,
  eletrosDefined: null,
  eletros: [],
  observacoes: '',
},

// depois
cozinha: {
  granito: null,
  granitoadaptar: null,
  tanque: null,
  tanqueEmbutido: null,
  tanqueMoveis: null,
  eletrosDefined: null,
  eletros: [],
  observacoes: '',
},
```

### 3.2 Default `outros`

Localização: linhas 50–74 (bloco `outros` de `defaultsPorFormType`). Mesma inserção, logo após `tanque: null,` e antes de `tanqueMoveis: null,`:

```js
// antes
outros: {
  granito: null,
  granitoadaptar: null,
  tanque: null,
  tanqueMoveis: null,
  tv: null,
  ...

// depois
outros: {
  granito: null,
  granitoadaptar: null,
  tanque: null,
  tanqueEmbutido: null,
  tanqueMoveis: null,
  tv: null,
  ...
```

**Observação:** `outros` já tem um campo `cuba` (tipo de cuba) mais adiante no mesmo bloco — conceito diferente, sem relação com `tanqueEmbutido` (ver PRD, Risco 6). Nenhuma alteração é necessária nesse campo.

---

## 4. Formulários — `FormCozinha.jsx` e `FormOutros.jsx`

### 4.1 Decisão de implementação (fechada): layout de botões empilhados de largura total, reaproveitando `styles.opcoesCama`/`styles.opcaoCama`

**Investigação do padrão de referência.** `src/steps/StepPerguntasPorAmbiente/FormDormitorio.jsx` (linhas 36–48), na pergunta "Qual o tamanho da cama neste ambiente?", usa hoje:

```jsx
<div className={styles.opcoesCama}>
  {TAMANHOS_CAMA.map((tamanho) => (
    <button
      key={tamanho.value}
      className={`${styles.opcaoCama} ${resp.tamanhoCama === tamanho.value ? styles.ativo : ''}`}
      onClick={() => set('tamanhoCama', tamanho.value)}
    >
      {tamanho.label}
    </button>
  ))}
</div>
```

Confirmado em `StepPerguntasPorAmbiente.module.css` (linhas 137–147): `.opcoesCama` é um container `flex-direction: column` com `gap: 8px` (empilha os botões na vertical), e `.opcaoCama` é o botão individual de largura total (`padding: 10px 14px`, `border`, `border-radius`, sem `flex: 1` lado a lado como em `.botoesSimNao`). `.ativo` é a mesma classe de estado "selecionado" já usada em todo o projeto (inclusive pelos botões Sim/Não) e **não é alterada**.

**Classe já compartilhada — nenhuma migração de CSS necessária.** `.opcoesCama`, `.opcaoCama` e `.ativo` estão definidas em `StepPerguntasPorAmbiente.module.css`, o **mesmo módulo de estilo já importado por `FormCozinha.jsx` e `FormOutros.jsx`** (`import styles from './StepPerguntasPorAmbiente.module.css'`, confirmado nos dois arquivos). Não há nada restrito ao módulo do Dormitório: o CSS já é acessível aos dois formulários afetados. Por isso a decisão é **reutilizar `styles.opcoesCama`/`styles.opcaoCama` exatamente como estão, sem criar, mover ou duplicar nenhuma classe ou arquivo CSS**.

**Por que não `styles.botoesSimNao`/o helper `simNao`.** `styles.botoesSimNao` é o container de dois botões lado a lado (`display: flex; gap: 10px`, cada `button` com `flex: 1`, confirmado em `StepPerguntasPorAmbiente.module.css` linhas 21–36) usado por todas as perguntas Sim/Não existentes no projeto — o mesmo arquivo define `.ativo` (linhas 38–43), classe de estado "selecionado" compartilhada por `.botoesSimNao button` e por `.opcaoCama`. Alterar `.botoesSimNao` ou reutilizá-lo para uma pergunta com textos longos ("Tanque tradicional (de porcelana ou plástico, apoiado no chão)" / "Tanque embutido na bancada de granito") afetaria visualmente todas as demais perguntas Sim/Não do sistema — **proibido**. O helper `simNao` também não cobre o comportamento necessário (reset condicional de `tanqueMoveis` em **ambas** as direções da troca — ver seção 4.4). A nova pergunta usa, portanto, um bloco de botões dedicado no layout de `styles.opcoesCama`/`styles.opcaoCama`, escrito diretamente no JSX de cada formulário — sem alterar `styles.botoesSimNao`, `styles.ativo` ou o helper `simNao`, e sem tocar em `FormDormitorio.jsx` (usado aqui apenas como referência de leitura, fora do escopo de alteração).

### 4.2 `FormCozinha.jsx` — bloco "Tanque" (linhas 76–90)

```jsx
// antes
<FieldGroup titulo="Tanque">
  <p className={styles.pergunta}>Existe tanque no local?</p>
  {simNao('tanque')}
  {erros.tanque && <span className={`${styles.erro} erro-campo`}>{erros.tanque}</span>}
  {resp.tanque === true && (
    <>
      <p className={styles.subpergunta}>Haverá móveis na região do tanque?</p>
      {simNao('tanqueMoveis')}
      {erros.tanqueMoveis && <span className={`${styles.erro} erro-campo`}>{erros.tanqueMoveis}</span>}
      {resp.tanqueMoveis === true && (
        <p className={styles.aviso}>CC: {TEXTO_TANQUE_RETIRAR}</p>
      )}
    </>
  )}
</FieldGroup>

// depois
<FieldGroup titulo="Tanque">
  <p className={styles.pergunta}>Existe tanque no local?</p>
  {simNao('tanque')}
  {erros.tanque && <span className={`${styles.erro} erro-campo`}>{erros.tanque}</span>}
  {resp.tanque === true && (
    <>
      <p className={styles.subpergunta}>Qual o tipo de tanque?</p>
      <div className={styles.opcoesCama}>
        <button
          type="button"
          className={`${styles.opcaoCama} ${resp.tanqueEmbutido === false ? styles.ativo : ''}`}
          onClick={() => {
            if (resp.tanqueEmbutido !== false) set('tanqueMoveis', null)
            set('tanqueEmbutido', false)
          }}
        >
          Tanque tradicional (de porcelana ou plástico, apoiado no chão)
        </button>
        <button
          type="button"
          className={`${styles.opcaoCama} ${resp.tanqueEmbutido === true ? styles.ativo : ''}`}
          onClick={() => {
            if (resp.tanqueEmbutido !== true) set('tanqueMoveis', null)
            set('tanqueEmbutido', true)
          }}
        >
          Tanque embutido na bancada de granito
        </button>
      </div>
      {erros.tanqueEmbutido && <span className={`${styles.erro} erro-campo`}>{erros.tanqueEmbutido}</span>}

      {resp.tanqueEmbutido === false && (
        <>
          <p className={styles.subpergunta}>Haverá móveis na região do tanque?</p>
          {simNao('tanqueMoveis')}
          {erros.tanqueMoveis && <span className={`${styles.erro} erro-campo`}>{erros.tanqueMoveis}</span>}
          {resp.tanqueMoveis === true && (
            <p className={styles.aviso}>CC: {TEXTO_TANQUE_RETIRAR}</p>
          )}
        </>
      )}
    </>
  )}
</FieldGroup>
```

Nenhum import novo é necessário (`TEXTO_TANQUE_RETIRAR` já está importado; `styles.opcoesCama`/`styles.opcaoCama` já existem no mesmo `styles` já importado pelo arquivo). Ver seção 4.6 sobre o atributo `type="button"` acrescentado.

### 4.3 `FormOutros.jsx` — bloco "2. Tanque Existente" (linhas 99–113)

Mesmo diff da seção 4.2, aplicado ao trecho equivalente deste arquivo (título do `FieldGroup` continua "2. Tanque Existente", não é alterado):

```jsx
// antes
<FieldGroup titulo="2. Tanque Existente">
  <p className={styles.pergunta}>Existe tanque no local?</p>
  {simNao('tanque')}
  {erros.tanque && <span className={`${styles.erro} erro-campo`}>{erros.tanque}</span>}
  {resp.tanque === true && (
    <>
      <p className={styles.subpergunta}>Haverá móveis na região do tanque?</p>
      {simNao('tanqueMoveis')}
      {erros.tanqueMoveis && <span className={`${styles.erro} erro-campo`}>{erros.tanqueMoveis}</span>}
      {resp.tanqueMoveis === true && (
        <p className={styles.aviso}>CC: {TEXTO_TANQUE_RETIRAR}</p>
      )}
    </>
  )}
</FieldGroup>

// depois
<FieldGroup titulo="2. Tanque Existente">
  <p className={styles.pergunta}>Existe tanque no local?</p>
  {simNao('tanque')}
  {erros.tanque && <span className={`${styles.erro} erro-campo`}>{erros.tanque}</span>}
  {resp.tanque === true && (
    <>
      <p className={styles.subpergunta}>Qual o tipo de tanque?</p>
      <div className={styles.opcoesCama}>
        <button
          type="button"
          className={`${styles.opcaoCama} ${resp.tanqueEmbutido === false ? styles.ativo : ''}`}
          onClick={() => {
            if (resp.tanqueEmbutido !== false) set('tanqueMoveis', null)
            set('tanqueEmbutido', false)
          }}
        >
          Tanque tradicional (de porcelana ou plástico, apoiado no chão)
        </button>
        <button
          type="button"
          className={`${styles.opcaoCama} ${resp.tanqueEmbutido === true ? styles.ativo : ''}`}
          onClick={() => {
            if (resp.tanqueEmbutido !== true) set('tanqueMoveis', null)
            set('tanqueEmbutido', true)
          }}
        >
          Tanque embutido na bancada de granito
        </button>
      </div>
      {erros.tanqueEmbutido && <span className={`${styles.erro} erro-campo`}>{erros.tanqueEmbutido}</span>}

      {resp.tanqueEmbutido === false && (
        <>
          <p className={styles.subpergunta}>Haverá móveis na região do tanque?</p>
          {simNao('tanqueMoveis')}
          {erros.tanqueMoveis && <span className={`${styles.erro} erro-campo`}>{erros.tanqueMoveis}</span>}
          {resp.tanqueMoveis === true && (
            <p className={styles.aviso}>CC: {TEXTO_TANQUE_RETIRAR}</p>
          )}
        </>
      )}
    </>
  )}
</FieldGroup>
```

Nenhum import novo é necessário (`TEXTO_TANQUE_RETIRAR` já está importado neste arquivo; `styles.opcoesCama`/`styles.opcaoCama` já existem no mesmo `styles` já importado pelo arquivo). Ver seção 4.6 sobre o atributo `type="button"` acrescentado.

### 4.4 Regra de reset (cobre CA-07 e CA-18)

O `onClick` de cada botão só zera `tanqueMoveis` quando o valor de `tanqueEmbutido` está de fato mudando (`if (resp.tanqueEmbutido !== <novo valor>) set('tanqueMoveis', null)`), evitando um reset desnecessário ao clicar novamente no botão já selecionado. Isso cobre as duas direções pedidas pelo PRD (tradicional → embutido e embutido → tradicional): em qualquer uma delas, ao entrar em um novo valor de `tanqueEmbutido`, a resposta anterior de `tanqueMoveis` é descartada, então, se o usuário voltar a "Tanque tradicional", terá que responder "Haverá móveis..." novamente antes que o CC volte a aparecer.

**Confirmação — helper `set(campo, valor)` (V1).** Confirmado por leitura direta: `FormCozinha.jsx` linha 15–16 e `FormOutros.jsx` linha 27–28 declaram, nos dois arquivos, `const set = (campo, valor) => dispatch({ type: 'SET_RESPOSTA_AMBIENTE', instanceId, campo, valor })`. O código proposto nas seções 4.2 e 4.3 depende exatamente dessa assinatura, já existente e inalterada nos dois arquivos.

**Confirmação — duas chamadas consecutivas de `set(...)` no mesmo `onClick` (V4).** Confirmado por leitura de `src/context/FormProvider.jsx`: o reducer é declarado como função pura `function reducer(state, action)` (linha 55), e o caso `'SET_RESPOSTA_AMBIENTE'` (linhas 160–168) apenas lê `instanceId`/`campo`/`valor` da própria `action` e devolve um novo objeto de estado a partir do `state` recebido como parâmetro — nunca lê uma variável de estado fechada em closure de componente. O `dispatch` retornado por `useReducer` (linha 274) segue o contrato padrão do React: cada chamada de `dispatch` dentro do mesmo `onClick` é enfileirada e processada pelo reducer em sequência, cada uma recebendo o estado já atualizado pela chamada anterior — não o estado desatualizado lido no início do render. Por isso, `set('tanqueMoveis', null)` seguido de `set('tanqueEmbutido', false)` (ou `true`) no mesmo clique aplica as duas gravações corretamente ao estado final, sem risco de a segunda sobrescrever a primeira com um valor defasado. Nenhum ajuste é necessário na regra de reset já descrita nas seções 4.2/4.3.

### 4.5 Nenhuma alteração de CSS

Como decidido na seção 4.1, a nova pergunta reaproveita exatamente `styles.opcoesCama` (container empilhado, largura total) e `styles.opcaoCama` (botão individual, já preparado para textos mais longos que "Sim"/"Não", inclusive quebra de linha) — o mesmo padrão visual já em produção na pergunta de tamanho de cama do Dormitório. `styles.botoesSimNao` e `styles.ativo` não são tocados em nenhum ponto desta melhoria, preservando o layout de todas as demais perguntas Sim/Não do sistema. `StepPerguntasPorAmbiente.module.css` não entra na lista de arquivos alterados (seção 1): nenhuma classe nova é criada, nenhuma classe existente muda de módulo.

### 4.6 Atributo `type="button"` nos dois novos botões (V3)

**Verificação feita:** os botões gerados hoje pelo helper `simNao` (em `FormCozinha.jsx`, `FormOutros.jsx`, `FormDormitorio.jsx` e `FormHomeSalaOffice.jsx`) **não** declaram o atributo `type`, ou seja, assumem o padrão HTML `type="submit"`. Uma busca em todo o diretório `src/` por `<form` não encontrou nenhuma ocorrência — não existe, hoje, nenhum elemento `<form>` envolvendo esses botões em lugar nenhum da aplicação, portanto o `type="submit"` implícito nunca dispara envio ou recarregamento de página; o clique apenas executa o `onClick`.

Ainda assim, os dois botões novos desta melhoria (seções 4.2 e 4.3) declaram explicitamente `type="button"`. Isso não corrige nenhum defeito hoje existente (o comportamento atual já é seguro, pela ausência de `<form>`) e não é aplicado retroativamente ao helper `simNao` ou a nenhum outro botão já existente — é apenas uma prática defensiva adotada para o código novo, sem exigir nenhuma alteração em arquivo já existente além do próprio bloco de tanque descrito nas seções 4.2/4.3.

---

## 5. `src/steps/StepPerguntasPorAmbiente/formUtils.js`

### 5.1 Bloco único compartilhado (linhas 127–136)

```js
// antes
if (['cozinha', 'outros'].includes(formType)) {
  if (resp.tanque === null) erros.tanque = 'Selecione uma opção'
  if (resp.tanque === true && resp.tanqueMoveis === null) {
    erros.tanqueMoveis = 'Selecione uma opção'
  }
  if (resp.eletrosDefined === null) erros.eletrosDefined = 'Selecione uma opção'
  if (resp.eletrosDefined === true) {
    validarEletros(resp, erros)
  }
}

// depois
if (['cozinha', 'outros'].includes(formType)) {
  if (resp.tanque === null) erros.tanque = 'Selecione uma opção'
  if (resp.tanque === true) {
    const tipoTanqueRespondido = resp.tanqueEmbutido === true || resp.tanqueEmbutido === false
    if (!tipoTanqueRespondido) {
      erros.tanqueEmbutido = 'Selecione uma opção'
    } else if (resp.tanqueEmbutido === false && resp.tanqueMoveis === null) {
      erros.tanqueMoveis = 'Selecione uma opção'
    }
  }
  if (resp.eletrosDefined === null) erros.eletrosDefined = 'Selecione uma opção'
  if (resp.eletrosDefined === true) {
    validarEletros(resp, erros)
  }
}
```

Um único bloco compartilhado por `['cozinha', 'outros']`, exatamente como hoje — cobre Cozinha, Varanda (mesmo `formType: 'cozinha'`) e Outros com esta única edição.

### 5.2 Comportamento resultante (cobre CA-08, CA-09, CA-10, CA-14, CA-15)

| Cenário | Erro gerado |
|---|---|
| `tanque === true`, `tanqueEmbutido` não respondido (`null`/`undefined`) | Apenas `erros.tanqueEmbutido` — `tanqueMoveis` nunca é avaliado, então não gera erro para uma pergunta que não está visível (CA-08) |
| `tanque === true`, `tanqueEmbutido === false` (tradicional), `tanqueMoveis === null` | Apenas `erros.tanqueMoveis` (CA-09) |
| `tanque === true`, `tanqueEmbutido === true` (embutido) | Nenhum erro de tanque além do já resolvido; `tanqueMoveis` nunca é exigido (CA-10) |
| Rascunho legado: `tanque === true`, `tanqueEmbutido` ausente, `tanqueMoveis` já preenchido de antes da melhoria | `erros.tanqueEmbutido` (o valor legado de `tanqueMoveis` é ignorado até o tipo ser escolhido — CA-14) |
| `tanque === false` (ou `null`), com qualquer valor residual em `tanqueEmbutido` | Nenhum erro relacionado a tanque é gerado — o bloco inteiro só roda dentro do `if (resp.tanque === true)` (CA-15) |

---

## 6. `src/domain/scoreEngine.js`

### 6.1 Bloco único compartilhado (linhas 65–71)

```js
// antes
// Tanque → Cozinha, Outros
if (['cozinha', 'outros'].includes(formType)) {
  if (resp.tanque === true && resp.tanqueMoveis === true) {
    gatilhosAtivados.push(`TANQUE_RETIRAR_${instanceId}`)
    gatilhosAmbiente.push({ id: `TANQUE_RETIRAR_${instanceId}`, nivel: 'Médio', pontos: 2 })
  }
}

// depois
// Tanque → Cozinha, Outros
if (['cozinha', 'outros'].includes(formType)) {
  if (resp.tanque === true && resp.tanqueEmbutido === false && resp.tanqueMoveis === true) {
    gatilhosAtivados.push(`TANQUE_RETIRAR_${instanceId}`)
    gatilhosAmbiente.push({ id: `TANQUE_RETIRAR_${instanceId}`, nivel: 'Médio', pontos: 2 })
  }
}
```

Uma única condição extra (`resp.tanqueEmbutido === false`) cobre Cozinha, Varanda e Outros automaticamente — nenhum ramo por ambiente existe hoje neste bloco. `resp.tanqueEmbutido === false` é `false` tanto quando o valor é `true` (embutido) quanto quando é `null`/`undefined` (não respondido ou rascunho legado), portanto o CC e os 2 pontos de risco Médio nunca são somados nesses dois casos — cobre CA-06, CA-14 e CA-16.

`src/domain/ccBuilder.js` **não é alterado**: continua consumindo `gatilhosAtivados` de forma genérica, sem checar `formType` nem o novo campo (ver PRD, seção 4.3 e 4.6).

---

## 7. `src/services/pdf.js`

### 7.1 Bloco único compartilhado (linhas 358–370)

```js
// antes
if (['cozinha', 'outros'].includes(formType)) {
  escreverPergunta(
    'Existe tanque no local?',
    resp.tanque === true ? 'Sim' : resp.tanque === false ? 'Não' : '—'
  )
  if (resp.tanque === true) {
    escreverPergunta(
      'Haverá móveis na região do tanque?',
      resp.tanqueMoveis === true ? 'Sim' : resp.tanqueMoveis === false ? 'Não' : '—',
      [ccPorId.get(`TANQUE_RETIRAR_${instanceId}`)]
    )
  }
}

// depois
if (['cozinha', 'outros'].includes(formType)) {
  escreverPergunta(
    'Existe tanque no local?',
    resp.tanque === true ? 'Sim' : resp.tanque === false ? 'Não' : '—'
  )
  if (resp.tanque === true) {
    const tipoTanqueRespondido = resp.tanqueEmbutido === true || resp.tanqueEmbutido === false
    if (tipoTanqueRespondido) {
      escreverPergunta(
        'Qual o tipo de tanque?',
        resp.tanqueEmbutido === true ? 'Embutido na bancada' : 'Tanque tradicional'
      )
      if (resp.tanqueEmbutido === false) {
        escreverPergunta(
          'Haverá móveis na região do tanque?',
          resp.tanqueMoveis === true ? 'Sim' : resp.tanqueMoveis === false ? 'Não' : '—',
          [ccPorId.get(`TANQUE_RETIRAR_${instanceId}`)]
        )
      }
    }
  }
}
```

### 7.2 Regras cobertas

- "Qual o tipo de tanque?" nunca imprime "Sim"/"Não" — sempre "Tanque tradicional" ou "Embutido na bancada" (CA-11, CA-12).
- Quando `tanqueEmbutido` ainda não foi respondido (`null`/`undefined`, incluindo rascunho legado sem o campo), nem "Qual o tipo de tanque?" nem "Haverá móveis..." são impressas — evita gerar um CC indevido por dado incompleto (CA-14).
- Quando `tanqueEmbutido === true` (embutido), "Haverá móveis..." e o CC associado não são impressos (CA-12).
- **Confirmação — filtro de itens indefinidos (V5).** Confirmado por leitura de `src/services/pdf.js`: a função `escreverPergunta(pergunta, resposta, itensRelacionados = [])` (linha 187) executa, na linha 198, exatamente `itensRelacionados.filter(Boolean).forEach((item) => escreverInline(item))`. Portanto, quando `ccPorId.get(`TANQUE_RETIRAR_${instanceId}`)` retorna `undefined` (gatilho não ativado para aquele ambiente — seção 6), o array `[undefined]` passado como terceiro argumento é filtrado antes do `forEach`, e nenhuma linha extra é escrita no PDF. Nenhuma mudança adicional é necessária nesse ponto.

---

## 8. `especificacao-checklist-dinamica.md`

### 8.1 Contexto encontrado no arquivo e limite da edição autorizada

A seção "Cozinha / A.S. / Varanda" documenta a pergunta do tanque como **"P2 — Existe tanque no local?"** (linhas 125–130), sem uma subnumeração explícita tipo "P2.1" para a sub-pergunta "Haverá móveis..." (diferente do padrão G2.1/G2.2 usado nas perguntas globais). O código de `ccBuilder.js`, por sua vez, usa o valor de string `'P2.1'` internamente no campo `perguntaOrigem` (linha 115) — um identificador interno do CC, não um título deste documento. **Não há relação direta entre a heading "P2" deste arquivo e a string `'P2.1'` do código** — são numerações independentes.

Esse achado técnico **não autoriza uma edição ampla** do arquivo. A alteração permitida neste Spec está estritamente limitada ao trecho da pergunta de tanque (linhas 125–130, seção 8.2): acrescentar a nova pergunta "Qual o tipo de tanque?" e a condição que ela cria sobre o CC de remoção. Continua **proibido**, em qualquer parte do arquivo:

- Renumerar qualquer pergunta existente (P1, P2, P3 em diante, G1–G5, ou qualquer outro código).
- Alterar qualquer outra seção do arquivo além do trecho indicado na seção 8.2.
- Reorganizar a estrutura do documento (ordem das seções, das perguntas ou da tabela de gatilhos de score).

### 8.2 Edição proposta (linhas 125–130)

```md
// antes
**P2 — Existe tanque no local?**
- Se SIM → "Haverá móveis na região do tanque?"
  - Se SIM:
  > **CC:** CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR TANQUE EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO.

  🟡 Risco: Médio +2

// depois
**P2 — Existe tanque no local?**
- Se SIM → **"Qual o tipo de tanque?"** (Tanque tradicional (de porcelana ou plástico, apoiado no chão) / Tanque embutido na bancada de granito)
  - Se **Tanque tradicional** → "Haverá móveis na região do tanque?"
    - Se SIM:
    > **CC:** CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR TANQUE EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO.

    🟡 Risco: Médio +2
  - Se **Tanque embutido na bancada de granito** → a pergunta "Haverá móveis na região do tanque?" não é exibida; nenhum CC é gerado.
```

Nenhuma outra parte do arquivo (numeração de P1, P3 em diante, G1–G5, tabela de gatilhos de score) é alterada. A linha 260 (tabela "Gatilhos de Score", "Tanque existente a ser retirado") permanece igual — o gatilho continua existindo, apenas passa a ter uma condição adicional já descrita no texto acima.

---

## 9. O que não muda (confirmado pela leitura do código)

- `src/domain/ccBuilder.js` — já consome `TANQUE_RETIRAR_${instanceId}` de `gatilhosAtivados` de forma genérica, sem checar `formType` nem `tanqueEmbutido`; nenhuma alteração necessária.
- `src/domain/checklistTextos.js` — `TEXTO_TANQUE_RETIRAR` permanece idêntico.
- `src/context/FormProvider.jsx` — `SET_RESPOSTA_AMBIENTE` é genérico (grava um campo por vez); os dois `set(...)` disparados pelos novos botões (seção 4.4) já são suficientes, sem exigir uma ação de reducer nova. Ver seção 4.4 para a confirmação de que chamadas consecutivas de `dispatch` no mesmo `onClick` são aplicadas corretamente em sequência.
- `src/domain/ambientes.js` — nenhum ambiente ou `formType` novo.
- `src/steps/StepPerguntasPorAmbiente/StepPerguntasPorAmbiente.jsx` — apenas roteia por `formType` e chama a validação genérica; nenhuma lógica nova.
- `src/steps/StepPerguntasPorAmbiente/FormBanheiro.jsx` — sem pergunta de tanque, não tocado.
- `src/steps/StepPerguntasPorAmbiente/FormDormitorio.jsx` — usado nesta melhoria apenas como referência de leitura do padrão visual `styles.opcoesCama`/`styles.opcaoCama` (seção 4.1); **não é modificado**.
- `src/steps/StepPerguntasPorAmbiente/FormHomeSalaOffice.jsx` — sem pergunta de tanque, não tocado.
- `src/steps/StepPerguntasPorAmbiente/StepPerguntasPorAmbiente.module.css` — nenhuma classe nova, nenhuma classe movida; `styles.opcoesCama`, `styles.opcaoCama`, `styles.ativo` e `styles.botoesSimNao` permanecem exatamente como estão.
- `src/steps/StepRevisao/StepRevisao.jsx` — consome `construirCCs`/`calcularScore` já prontos; sem lógica própria de tanque.
- Tabela de eletrodomésticos/eletrônicos, granito, cortineiro, rodapé, tamanho de cama, cuba, TV — nenhuma alteração.
- Nenhum elemento `<form>` existe em `src/` (busca confirmada) — os botões `type="button"` da seção 4.6 são uma prática defensiva adicional, não a correção de um problema hoje existente.

---

## 10. Critérios de aceitação

Referência: seção **Critérios de aceitação** do `PRD_DIFERENCIACAO_TIPO_TANQUE.md`, CA-01 a CA-18. Nenhum critério novo é adicionado aqui. Mapeamento com as seções deste Spec:

| Critério | Coberto por |
|---|---|
| CA-01, CA-02 | Seção 4.2 / 4.3 (nova pergunta em Cozinha/Varanda e Outros) |
| CA-03 | Estrutura condicional já existente (`resp.tanque === true`), não alterada |
| CA-04, CA-05 | Seção 6.1 (gatilho preservado para tradicional) |
| CA-06, CA-16, CA-17 | Seção 6.1 (`tanqueEmbutido === false` obrigatório para o gatilho) |
| CA-07, CA-18 | Seção 4.4 (reset condicional de `tanqueMoveis`) |
| CA-08, CA-09, CA-10 | Seção 5 (validação) |
| CA-11, CA-12 | Seção 7 (impressão no PDF) |
| CA-13 | Seção 9 (ambientes sem tanque não tocados) |
| CA-14, CA-15 | Seções 2, 5.2, 6.1, 7.2 (tolerância a `undefined`/rascunho legado) |

---

## Plano de Execução

- [ ] Task 1 — Adicionar o campo `tanqueEmbutido: null` em `defaultsPorFormType.cozinha` e `defaultsPorFormType.outros` em `src/domain/schema.js` (seção 3)
- [ ] Task 2 — Implementar a nova pergunta "Qual o tipo de tanque?" em `FormCozinha.jsx`, usando o layout empilhado `styles.opcoesCama`/`styles.opcaoCama`, os botões com `type="button"` e o reset condicional de `tanqueMoveis` (seção 4.2, 4.4, 4.6)
- [ ] Task 3 — Implementar a mesma pergunta, de forma independente, em `FormOutros.jsx` (seção 4.3, 4.4, 4.6)
- [ ] Task 4 — Ajustar `validarFormularioAmbiente` em `formUtils.js`: validar `tanqueEmbutido` como obrigatório quando há tanque, e tornar `tanqueMoveis` obrigatório apenas quando `tanqueEmbutido === false` (seção 5)
- [ ] Task 5 — Ajustar o gatilho `TANQUE_RETIRAR_${instanceId}` em `scoreEngine.js`, acrescentando `resp.tanqueEmbutido === false` à condição (seção 6)
- [ ] Task 6 — Ajustar o bloco de tanque em `pdf.js`: imprimir "Qual o tipo de tanque?" com resposta por extenso e ocultar "Haverá móveis..."/CC quando embutido ou não respondido (seção 7)
- [ ] Task 7 — Atualizar `especificacao-checklist-dinamica.md`, estritamente no trecho "P2 — Existe tanque no local?" (linhas 125–130), com a nova pergunta e a condição sobre o CC — sem renumerar nem reorganizar nenhuma outra parte do arquivo (seção 8)
- [ ] Task 8 — Validar manualmente, rodando `npm run dev`, os cenários de CA-01 a CA-18 nos três ambientes afetados (Cozinha, Varanda, Outros), incluindo a alternância de tipo com CC já visível (CA-07/CA-18), um rascunho legado simulado no `localStorage` (CA-14) e a checagem visual de que o layout empilhado não alterou nenhuma pergunta Sim/Não existente
- [ ] Task 9 — Rodar `npm run build` para confirmar que o projeto compila sem erros após todas as alterações

## Desvios

Nenhum desvio de código encontrado nesta rodada de verificação. As cinco verificações solicitadas (V1–V5) foram confirmadas como verdadeiras por leitura direta do código, sem necessidade de correção no Spec:

- **V1** — confirmado: `set(campo, valor)` existe com essa assinatura em `FormCozinha.jsx` (linha 15–16) e `FormOutros.jsx` (linha 27–28). Ver seção 4.4.
- **V2** — confirmado: `styles.botoesSimNao` (linhas 21–36) e `styles.ativo` (linhas 38–43) existem com esses nomes exatos em `StepPerguntasPorAmbiente.module.css`; o helper `simNao` usa exatamente essas duas classes. Ver seção 4.1.
- **V3** — parcialmente diferente do pressuposto implícito do Spec anterior: os botões do helper `simNao` **não** declaram `type="button"` hoje (assumem `type="submit"` por padrão do HTML), mas isso não causa efeito colateral porque **não existe nenhum `<form>`** em `src/`. Ajuste aplicado: os dois botões novos (seções 4.2/4.3) passaram a declarar `type="button"` explicitamente, como prática defensiva, sem alterar o helper `simNao` existente. Ver seção 4.6.
- **V4** — confirmado: o reducer de `FormProvider.jsx` é uma função pura (`function reducer(state, action)`, linha 55) e o caso `SET_RESPOSTA_AMBIENTE` (linhas 160–168) não depende de closures; duas chamadas consecutivas de `dispatch` no mesmo `onClick` são processadas em sequência pelo React, cada uma sobre o estado já atualizado pela anterior. A regra de reset da seção 4.4 funciona como descrito, sem risco de sobrescrita com estado defasado. Ver seção 4.4.
- **V5** — confirmado: `escreverPergunta` em `pdf.js` (linha 187, filtro na linha 198) executa `itensRelacionados.filter(Boolean).forEach(...)`, descartando itens `undefined` sem escrever nada extra no PDF. Ver seção 7.2.

A seção 8.1 foi corrigida (D2): a conclusão de que a edição do arquivo de especificação funcional seria "livre" foi substituída por um limite explícito — apenas o trecho da pergunta de tanque pode ser alterado, mantendo proibida a renumeração ou reorganização de qualquer outra parte do documento.
