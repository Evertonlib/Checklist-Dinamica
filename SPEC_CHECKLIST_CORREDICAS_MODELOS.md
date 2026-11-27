# SPEC — Modelos de corrediças e opções de extração no Checklist do Projetista

> **Status: aguardando aprovação do Everton.** Nenhum código foi escrito.
>
> Base: `PRD_CHECKLIST_CORREDICAS_MODELOS.md` (decisões fechadas e critérios congelados). As
> decisões das Seções 2 e 14 do PRD são fixas e não são reabertas aqui. Este Spec só define o
> desenho técnico para implementar o que o PRD especificou. **Durante a implementação, o Spec
> prevalece sobre o PRD e sobre qualquer outro documento.** Quem implementa não precisa ler a
> conversa que gerou este arquivo.
>
> Tudo o que é descrito como "hoje" foi reconferido diretamente no código na branch
> `feat/balcoes-convencionais-editados`, com `arquivo:linha`.
> Todos os caminhos são relativos à raiz do projeto (`Checklist-Dinamica/`).

---

## 0. Conferência PRD x código (Etapa 2)

As referências citadas no PRD foram reconferidas diretamente nos arquivos e batem:

- `src/domain/schemaVendedor.js:2-34` (`defaultsPorGrupo` para `A`, `B` e `C`, com `corredicas: null` em `:12`, `:20` e `:29`).
- `src/domain/validacaoVendedor.js:1-6, 12-16, 18-22, 30-60` (`MSG_RESPONDA`, `CAMPOS_OBRIGATORIOS_POR_GRUPO`, `respostaValida` aceitando `'não se aplica'` ou qualquer valor `!== null && !== undefined` para `corredicas`, e `validarRespostasGrupo`).
- `src/domain/gruposPerguntasVendedor.js:4-17` (`GRUPO_POR_AMBIENTE`, `obterGrupo`).
- `src/domain/respostaBalcaoVendedor.js:8-26` (`descreverRespostaBalcao` retornando `{ texto, destaque, linhas }`).
- `src/domain/puxadoresVendedor.js:115-132` (`descreverRespostaPuxadores` retornando `{ texto, destaque, linhas }`).
- `src/context/FormProviderVendedor.jsx:8, 25-58, 136-144, 169-182` (`STORAGE_KEY = 'byarabi_checklist_vendedor'`, `normalizarEstadoSalvo` mesclando `defaultsPorGrupo[...]` com `salvo`, `SET_AMBIENTE_QUANTIDADE_VENDEDOR`, `SET_RESPOSTA_AMBIENTE_VENDEDOR`).
- `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.jsx:19, 32-38, 40-44, 46-57, 87-91` (estado `erros`, `scrollToFirstError()`, `validar()`, `limparErrosPuxadores` e repasse de `erros` para `FormComponent`).
- `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.module.css:7-12, 14-16, 18-40, 104-109, 131-135, 188-198` (`.pergunta`, `.campoFechado`, `.opcoes`, `.opcao`, `.opcaoAtiva`, `.erro`, `.subperguntas`).
- `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoA.jsx:10, 18-19, 58-88, 100-110, 113-124` (`OPCOES_CORREDICAS = ['Ocultas']`, `campoFechado` com `mostrarNaoSeAplica = true`, `corredicas` na `:117` antes de `<BlocoPuxadoresVendedor />`).
- `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoB.jsx:10, 16-17, 19-47, 51-62` (`OPCOES_CORREDICAS = ['Ocultas']`, `campoFechado`, `corredicas` na `:54` antes de `fechamentoTeto`).
- `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoC.jsx:9, 15-16, 18-42, 46-56` (`OPCOES_CORREDICAS = ['Ocultas']`, `campoFechado`, `corredicas` na `:49` antes de `<BlocoPuxadoresVendedor />`).
- `src/steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.jsx:12-36, 38-44, 63-75, 107-128` (`PERGUNTAS_POR_GRUPO` com `corredicas` em `:20`, `:26`, `:33`, `formatarResposta`, `handleGerarPdf` sem revalidação, aplicação de `styles.linhaDestaque` quando `destaque === true`).
- `src/steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.module.css:59-61` (`.linhaDestaque { color: var(--ba-danger); }`).
- `src/services/pdfVendedor.js:7, 20-44, 46-52, 107-123, 149-159, 161-163, 167` (`COR_ALERTA = [180, 0, 0]`, `PERGUNTAS_POR_GRUPO` com `corredicas` em `:28`, `:34`, `:41`, `escreverPergunta` aplicando `COR_ALERTA` quando `destaque === true` e resetando para `(0, 0, 0)` em `:122`).
- `src/index.css:23` (`--ba-danger: #a32f2b;`).
- `testes/auxiliares/leitura_pdf.js:5-82` (`secao`, `sequencia`, `ausencia`).
- `testes/auxiliares/construtores.js:88-100` (`montarEstadoProjetista`).
- `testes/V_pdf_projetista.test.js:31-108, 293-497` (`T-V03`–`T-V06`, `T8`, `T9`, `TP-14`, `TP-16`, `TP-17`).
- `testes/V_validacao_projetista.test.js:9-389` (`BASE_A`, `BASE_B`, `BASE_C`, `T10`–`T20`, `TP-06`–`TP-12`).

---

## 1. Decisões do Spec

### 1.1 Schema e retrocompatibilidade — `src/domain/schemaVendedor.js`

Em `src/domain/schemaVendedor.js`, nos três grupos (`defaultsPorGrupo.A`, `defaultsPorGrupo.B` e `defaultsPorGrupo.C`):

1. Atualizar o comentário da linha `corredicas: null` (`:12` no grupo A):
   `corredicas: null,             // "Ocultas" | "Hafele" | "Blum" | "não se aplica" | null`
2. Acrescentar **logo após `corredicas: null`** nos grupos A (`:12`), B (`:20`) e C (`:29`):
   `corredicasExtracao: null,     // "Extração total" | "Tip-on" | "Extração parcial" | null`

*Motivo da escolha:* segue a mesma convenção de prefixo dos campos dependentes já existentes (`tipoBalcao` / `balcaoAlturaForaPadrao`), armazena valor primitivo (`string | null`) e é inicializado automaticamente como `null` em novos ambientes e em rascunhos antigos por `normalizarEstadoSalvo` (`FormProviderVendedor.jsx:30-41`) e `SET_AMBIENTE_QUANTIDADE_VENDEDOR` (`FormProviderVendedor.jsx:139-142`), **sem alterar `FormProviderVendedor.jsx`**.

### 1.2 Regras puras e catálogo de corrediças — `src/domain/corredicasVendedor.js` (novo)

Arquivo `.js` puro em `src/domain/`, **sem importar React**, reutilizado pela UI, validação, Revisão, PDF e testes unitários.

Exporta:

1. **`OPCOES_CORREDICAS`** (modelos da pergunta principal, na ordem exata da tela):
   ```js
   export const OPCOES_CORREDICAS = ['Ocultas', 'Hafele', 'Blum']
   ```
   *(O botão `"Não se aplica"` usa o valor `'não se aplica'`, no mesmo padrão das demais perguntas fechadas do Projetista.)*

2. **`EXTRACAO_POR_MODELO`** (mapa fechado de subopções válidas por modelo):
   ```js
   export const EXTRACAO_POR_MODELO = {
     Hafele: ['Extração total', 'Tip-on'],
     Blum: ['Extração total', 'Tip-on', 'Extração parcial'],
   }
   ```

3. **`obterOpcoesExtracao(modelo)`**:
   - Se `Object.hasOwn(EXTRACAO_POR_MODELO, modelo)`, devolve `[...EXTRACAO_POR_MODELO[modelo]]`.
   - Caso contrário (`'Ocultas'`, `'não se aplica'`, `null`, `undefined`, valor legado), devolve `[]`.

4. **`modeloExigeExtracao(modelo)`**:
   - Devolve `modelo === 'Hafele' || modelo === 'Blum'`.

5. **`extracaoValidaParaModelo(modelo, extracao)`**:
   - Devolve `typeof extracao === 'string' && Object.hasOwn(EXTRACAO_POR_MODELO, modelo) && EXTRACAO_POR_MODELO[modelo].includes(extracao)`.

6. **`resolverAlteracaoCorredicas(modeloAtual, extracaoAtual, novoModelo)`**:
   - Se `modeloAtual === novoModelo`: devolve `{ corredicas: novoModelo, corredicasExtracao: extracaoAtual ?? null }` (tocar no modelo já marcado preserva a extração escolhida — Q6 / CA-05).
   - Se `modeloAtual !== novoModelo`: devolve `{ corredicas: novoModelo, corredicasExtracao: null }` (troca de modelo limpa a subopção — CA-05 / R1).

7. **`descreverRespostaCorredicas(resp)`**:
   - Retorna sempre `{ texto, destaque, linhas }` (mesmo contrato de `descreverRespostaBalcao` e `descreverRespostaPuxadores`, com `linhas` sempre `[]`):
     - `const modelo = resp?.corredicas`
     - Se `modelo === null || modelo === undefined || modelo === ''`: `{ texto: '—', destaque: false, linhas: [] }`.
     - Se `modelo === 'não se aplica'`: `{ texto: 'Não se aplica', destaque: false, linhas: [] }`.
     - Se `modeloExigeExtracao(modelo)` (`'Hafele'` ou `'Blum'`):
       - Se `extracaoValidaParaModelo(modelo, resp?.corredicasExtracao)`: `{ texto: `${modelo} — ${resp.corredicasExtracao}`, destaque: true, linhas: [] }` *(travessão U+2014 com espaço antes e depois)*.
       - Caso contrário (sem subopção preenchida ou incompatível, ex.: estado incompleto aberto direto na Revisão/PDF — CA-14): `{ texto: modelo, destaque: true, linhas: [] }`.
     - Qualquer outro valor preenchido (`'Ocultas'` ou valor legado): `{ texto: String(modelo), destaque: false, linhas: [] }`.

*Por quê validar `extracaoValidaParaModelo` dentro de `descreverRespostaCorredicas`:* garante que mesmo um estado inconsistente (ex.: `Hafele` com `Extração parcial` de edição manual) nunca imprima combinação impossível como `Hafele — Extração parcial`, caindo para `Hafele` em destaque vermelho (risco R1).

### 1.3 Regras de validação — `src/domain/validacaoVendedor.js`

Manter intactas todas as constantes e regras existentes (`MSG_RESPONDA`, `MSG_RESPONDA_SIM_NAO`, `MSG_INFORME_MODELO`, `MSG_INFORME_COR`, `MSG_ADICIONE_PUXADOR`, `NAO_SE_APLICA`, `CAMPOS_ALTURA`, `CAMPOS_SUBPERGUNTAS_BALCAO`, `CAMPOS_OBRIGATORIOS_POR_GRUPO`, `respostaValida` e validações de balcões e puxadores).

Acrescentar e exportar:

- `export const MSG_SELECIONE_EXTRACAO = 'Selecione uma opção'`

Em `validarRespostasGrupo(grupo, resp = {})`:

1. A validação existente de `corredicas` via `CAMPOS_OBRIGATORIOS_POR_GRUPO[grupo]` + `respostaValida` (`:12-22, 32-36`) permanece **inalterada**:
   - Quando `resp.corredicas` for `null` ou `undefined`, grava `erros.corredicas = MSG_RESPONDA` (`'Responda esta pergunta ou marque "Não se aplica"'`).
   - Aceita `'não se aplica'`, `'Ocultas'`, `'Hafele'`, `'Blum'` ou qualquer valor preenchido em rascunho legado (sem lista fechada em `respostaValida`).
2. Logo após o loop `for (const campo of CAMPOS_OBRIGATORIOS_POR_GRUPO[grupo])` (nos 3 grupos `'A'`, `'B'` e `'C'`):
   ```js
   if (
     modeloExigeExtracao(resp.corredicas) &&
     !extracaoValidaParaModelo(resp.corredicas, resp.corredicasExtracao)
   ) {
     erros.corredicasExtracao = MSG_SELECIONE_EXTRACAO
   }
   ```
   *(Importa `modeloExigeExtracao` e `extracaoValidaParaModelo` de `./corredicasVendedor.js`.)*

Consequências verificadas:
- `Ocultas`, `'não se aplica'` e qualquer valor legado diferente de `'Hafele'`/`'Blum'` não exigem `corredicasExtracao` (CA-07).
- `'Hafele'` exige exatamente `'Extração total'` ou `'Tip-on'`; `'Extração parcial'`, `null`, `undefined` ou `''` gravam `erros.corredicasExtracao = 'Selecione uma opção'` (CA-08).
- `'Blum'` exige exatamente `'Extração total'`, `'Tip-on'` ou `'Extração parcial'`; `null`, `undefined` ou `''` gravam `erros.corredicasExtracao = 'Selecione uma opção'` (CA-09).

### 1.4 Interface e CSS — `BlocoCorredicasVendedor.jsx`, `FormGrupoA/B/C.jsx` e `StepPerguntasAmbienteVendedor.module.css`

**CSS (`src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.module.css`):**
- Não alterar nenhuma classe existente (`.subperguntas` em `:131-135`, `.opcoes` em `:18-22`, `.opcao`/`.opcaoAtiva` em `:24-40`, `.erro` em `:104-109` permanecem intactas).
- Acrescentar no fim do arquivo (após `.btnAdicionarPuxador` na `:198`):
  ```css
  .opcoesVerticais {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  ```
  *Motivo:* empilha os 2 ou 3 botões de extração um abaixo do outro dentro de `.subperguntas` com largura uniforme (`align-items: stretch` padrão do flex em coluna) e altura mínima `44px` herdada de `.opcao`/`.opcaoAtiva`, evitando desalinhamento em telas estreitas (risco R3).

**Novo componente compartilhado `src/steps/vendedor/StepPerguntasAmbienteVendedor/BlocoCorredicasVendedor.jsx`:**
- Props: `{ resp = {}, erros = {}, onSet }`.
- Importa `OPCOES_CORREDICAS`, `obterOpcoesExtracao` e `resolverAlteracaoCorredicas` de `'../../../domain/corredicasVendedor.js'` e `styles` de `'./StepPerguntasAmbienteVendedor.module.css'`.
- Constante local `const NAO_SE_APLICA = 'não se aplica'`.
- Handler de seleção do modelo:
  ```js
  const selecionarModelo = (novoModelo) => {
    const proximo = resolverAlteracaoCorredicas(resp.corredicas, resp.corredicasExtracao, novoModelo)
    if (proximo.corredicas !== resp.corredicas) {
      onSet('corredicas', proximo.corredicas)
      onSet('corredicasExtracao', proximo.corredicasExtracao)
    }
  }
  ```
  *Nota:* reproduz o comportamento de `campoFechado` (`FormGrupoA.jsx:70,80`, `FormGrupoB.jsx:31,40`, `FormGrupoC.jsx:27,35`), onde tocar numa opção já marcada **mantém a marcação** (nunca desmarca para `null`). Quando o usuário toca novamente no modelo já ativo (`proximo.corredicas === resp.corredicas`), nada é sobrescrito e `resp.corredicasExtracao` permanece intacto. Quando o modelo muda, os dois `onSet` gravam o novo modelo e zeram `corredicasExtracao` para `null`. Tanto os botões de `OPCOES_CORREDICAS` quanto o botão `"Não se aplica"` chamam `selecionarModelo(...)` (garantindo limpeza de `corredicasExtracao` também ao escolher `'não se aplica'`).
- Renderização (Fragment `<>...</>`, mantendo exatamente a mesma estrutura HTML de `campoFechado` e o mesmo encaixe de `.subperguntas` como irmão de `.campoFechado` usado nos balcões em `FormGrupoA.jsx:95-110`):
  1. Bloco principal `<div className={styles.campoFechado}>`:
     - `<p className={styles.pergunta}>Corrediças</p>`
     - `<div className={styles.opcoes}>` contendo os 3 botões de `OPCOES_CORREDICAS` (`'Ocultas'`, `'Hafele'`, `'Blum'`) + botão `'Não se aplica'` (com valor `NAO_SE_APLICA`), todos com **`type="button"`**, `className={resp.corredicas === valor ? styles.opcaoAtiva : styles.opcao}`, sem atributos ARIA extras, e `onClick={() => selecionarModelo(valor)}`.
     - `{erros.corredicas && <span className={`${styles.erro} erro-campo`}>{erros.corredicas}</span>}`
  2. Bloco condicional irmão de `.campoFechado` (renderizado apenas quando `opcoesExtracao.length > 0`, onde `const opcoesExtracao = obterOpcoesExtracao(resp.corredicas)`):
     - `<div className={styles.subperguntas}>`
       - `<div className={styles.campoFechado}>`
         - `<p className={styles.pergunta}>Tipo de extração</p>`
         - `<div className={styles.opcoesVerticais}>` com cada botão de `opcoesExtracao` (sem botão `"Não se aplica"`), cada botão com **`type="button"`**, `className={resp.corredicasExtracao === op ? styles.opcaoAtiva : styles.opcao}` e `onClick={() => onSet('corredicasExtracao', op)}` (tocar de novo na extração já marcada também mantém a marcação).
         - `{erros.corredicasExtracao && <span className={`${styles.erro} erro-campo`}>{erros.corredicasExtracao}</span>}`

**Formulários A, B e C:**
- `FormGrupoA.jsx`: remover `OPCOES_CORREDICAS` (`:10`) e substituir `{campoFechado('corredicas', 'Corrediças', OPCOES_CORREDICAS)}` (`:117`) por `<BlocoCorredicasVendedor resp={resp} erros={erros} onSet={set} />`.
- `FormGrupoB.jsx`: remover `OPCOES_CORREDICAS` (`:10`) e substituir `{campoFechado('corredicas', 'Corrediças', OPCOES_CORREDICAS)}` (`:54`) por `<BlocoCorredicasVendedor resp={resp} erros={erros} onSet={set} />`.
- `FormGrupoC.jsx`: remover `OPCOES_CORREDICAS` (`:9`) e substituir `{campoFechado('corredicas', 'Corrediças', OPCOES_CORREDICAS)}` (`:49`) por `<BlocoCorredicasVendedor resp={resp} erros={erros} onSet={set} />`.
- As funções locais `campoFechado` e todas as demais perguntas de A, B e C permanecem intactas.
- `StepPerguntasAmbienteVendedor.jsx` **não é alterado**: o estado `erros`, a rolagem até `.erro-campo` e o momento de limpeza de erros (ao revalidar no `"Avançar"` / `"Ir para Revisão"` ou ao trocar de ambiente) funcionam exatamente como hoje para perguntas fechadas.

### 1.5 Revisão e PDF do Projetista — `StepRevisaoVendedor.jsx` e `pdfVendedor.js`

Em ambos os arquivos:

1. Importar `descreverRespostaCorredicas` de `domain/corredicasVendedor.js`.
2. Em `PERGUNTAS_POR_GRUPO` (`StepRevisaoVendedor.jsx:20, 26, 33` e `pdfVendedor.js:28, 34, 41`), alterar `{ campo: 'corredicas', label: 'Corrediças', tipo: 'texto' }` nos grupos `A`, `B` e `C` para:
   `{ campo: 'corredicas', label: 'Corrediças', tipo: 'corredicas' }` *(mantendo posição e label exatos)*.
3. Nos respectivos loops:
   - `StepRevisaoVendedor.jsx:108-113`: quando `item.tipo === 'corredicas'`, chamar `descreverRespostaCorredicas(resp)`. Quando `destaque` for `true`, `:114-116` já aplica `${styles.linhaResumo} ${styles.linhaDestaque}` (`color: var(--ba-danger)`). `StepRevisaoVendedor.module.css` **não é alterado**.
   - `pdfVendedor.js:149-159`: acrescentar `else if (item.tipo === 'corredicas') { const { texto, destaque, linhas } = descreverRespostaCorredicas(resp); escreverPergunta(item.label, texto, destaque, linhas) }`. Quando `destaque` for `true`, `escreverPergunta` (`:107-123`) já aplica `COR_ALERTA` (`[180, 0, 0]`) ao rótulo `'Corrediças'` e à resposta `'Resposta: ...'` e reseta para `(0, 0, 0)` em `:122`.

### 1.6 Arquivos que o Spec NÃO altera

`FormProviderVendedor.jsx`, `StepPerguntasAmbienteVendedor.jsx`, `StepRevisaoVendedor.module.css`, `BlocoPuxadoresVendedor.jsx`, `puxadoresVendedor.js`, `respostaBalcaoVendedor.js`, `gruposPerguntasVendedor.js`, `ambientes.js`, `ComboboxEditavel.jsx`, `index.css`, `package.json`, `testes/auxiliares/captura_jspdf.js`, `testes/auxiliares/captura_registro.js`, `testes/auxiliares/leitura_pdf.js`, `testes/auxiliares/construtores.js`, `testes/V_puxadores.test.js`, `testes/V_resposta_balcao.test.js`, `testes/I_importacao_pdf.test.js`, todo o Perfil Cliente e toda a Venda futura.

---

## 2. Arquivos afetados (resumo)

| Arquivo | Efeito |
|---|---|
| `src/domain/schemaVendedor.js` | Atualiza comentário de `corredicas` e acrescenta `corredicasExtracao: null` após `corredicas` em `defaultsPorGrupo` (`A`, `B` e `C`) (1.1) |
| `src/domain/corredicasVendedor.js` | **novo** — `OPCOES_CORREDICAS`, `EXTRACAO_POR_MODELO`, `obterOpcoesExtracao`, `modeloExigeExtracao`, `extracaoValidaParaModelo`, `resolverAlteracaoCorredicas` e `descreverRespostaCorredicas` (1.2) |
| `src/domain/validacaoVendedor.js` | Exporta `MSG_SELECIONE_EXTRACAO`; mantém `respostaValida` intacta e exige subopção válida em `corredicasExtracao` quando `corredicas` for `'Hafele'` ou `'Blum'` nos grupos A, B e C (1.3) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.module.css` | Acrescenta `.opcoesVerticais` no fim do arquivo para empilhar botões de extração dentro de `.subperguntas` (1.4) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/BlocoCorredicasVendedor.jsx` | **novo** — bloco compartilhado para `Corrediças` e `Tipo de extração` nos grupos A, B e C, limpando a extração só quando o modelo muda de fato (1.4) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoA.jsx` | Troca `campoFechado('corredicas', ...)` por `<BlocoCorredicasVendedor />` e remove `OPCOES_CORREDICAS` (1.4) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoB.jsx` | Troca `campoFechado('corredicas', ...)` por `<BlocoCorredicasVendedor />` e remove `OPCOES_CORREDICAS` (1.4) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoC.jsx` | Troca `campoFechado('corredicas', ...)` por `<BlocoCorredicasVendedor />` e remove `OPCOES_CORREDICAS` (1.4) |
| `src/steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.jsx` | Muda `corredicas` para `tipo: 'corredicas'` em A, B e C e usa `descreverRespostaCorredicas` (reaproveitando `styles.linhaDestaque`) (1.5) |
| `src/services/pdfVendedor.js` | Muda `corredicas` para `tipo: 'corredicas'` em A, B e C e usa `descreverRespostaCorredicas` com `COR_ALERTA` (1.5) |
| `testes/V_corredicas.test.js` | **novo** — testes puros de catálogo, troca de modelo, formatação e destaque (`TC-01`, `TC-02`, `TC-03`, parte de `TC-11`) (3.1) |
| `testes/V_validacao_projetista.test.js` | Acrescenta casos de validação de corrediças (`TC-04` a `TC-08`, parte de `TC-11`) mantendo testes existentes intactos (3.1) |
| `testes/V_pdf_projetista.test.js` | Acrescenta casos de PDF para `Ocultas`, `Hafele` e `Blum` nos grupos A, B e C (`TC-09`, `TC-10`, parte de `TC-11`, `TC-12`) mantendo testes existentes intactos (3.1) |

---

## 3. Testes

### 3.1 Testes novos

Regras:
- Todo esperado sai do critério do PRD e é escrito por extenso no próprio teste (nunca importado de lista, constante ou regex do `src/`, nem "o que o código devolver").
- Dados 100% fictícios (contratos e números na série 9xxx: `'9001'`, `'9002'`, `'TA9001'`, etc.).
- Sem rede, e-mail, navegador ou chamada paga; nenhum teste chama LLM.
- Os testes de PDF usam `jsPDF` real com captura em memória (`testes/auxiliares/captura_jspdf.js`) e `carregarPdf` empacota em pasta temporária do sistema (`os.tmpdir()`, apagada no `finally` de `testes/auxiliares/carregar_pdf.js:33-51`), nunca gravando na pasta real.
- Os testes puros e de validação (`V_corredicas.test.js`, `V_validacao_projetista.test.js`) não tocam em disco.
- Nos arquivos que já têm testes (`V_validacao_projetista.test.js` e `V_pdf_projetista.test.js`), os testes novos usam o prefixo `TC-01`, `TC-02`, ... nas chamadas `test(...)` para não colidir com `T1`–`T20`, `T-V01`–`T-V10` e `TP-01`–`TP-17`.

**Arquivo novo `testes/V_corredicas.test.js`** (importa apenas funções puras e constantes de `src/domain/corredicasVendedor.js`, comparando contra literais escritos por extenso no teste):

- **TC-01 — Catálogo de modelos e subopções por modelo.** Cobre CA-01, CA-02, CA-03 e CA-04 (parte regra de domínio).
  - Entrada: leitura de `OPCOES_CORREDICAS` e chamadas `obterOpcoesExtracao(modelo)` para `'Ocultas'`, `'não se aplica'`, `'Hafele'`, `'Blum'`, `null` e `'Telescópicas'`.
  - Esperado:
    - `OPCOES_CORREDICAS` é exatamente `['Ocultas', 'Hafele', 'Blum']`;
    - `'Hafele'` devolve exatamente `['Extração total', 'Tip-on']`;
    - `'Blum'` devolve exatamente `['Extração total', 'Tip-on', 'Extração parcial']`;
    - `'Ocultas'`, `'não se aplica'`, `null` e `'Telescópicas'` devolvem `[]`.

- **TC-02 — Troca de modelo limpa subopção; clicar no mesmo modelo preserva.** Cobre CA-05 (parte regra pura).
  - Entrada: chamadas `resolverAlteracaoCorredicas(modeloAtual, extracaoAtual, novoModelo)` para:
    - (a) `('Blum', 'Extração parcial', 'Blum')` (toque repetido no mesmo modelo);
    - (b) `('Hafele', 'Tip-on', 'Hafele')` (toque repetido no mesmo modelo);
    - (c) `('Blum', 'Extração parcial', 'Hafele')` (troca entre modelos com subopção);
    - (d) `('Hafele', 'Tip-on', 'Blum')` (troca entre modelos com subopção);
    - (e) `('Hafele', 'Extração total', 'Ocultas')`;
    - (f) `('Blum', 'Tip-on', 'não se aplica')`;
    - (g) `(null, null, 'Blum')`.
  - Esperado:
    - (a) `{ corredicas: 'Blum', corredicasExtracao: 'Extração parcial' }`;
    - (b) `{ corredicas: 'Hafele', corredicasExtracao: 'Tip-on' }`;
    - (c) `{ corredicas: 'Hafele', corredicasExtracao: null }`;
    - (d) `{ corredicas: 'Blum', corredicasExtracao: null }`;
    - (e) `{ corredicas: 'Ocultas', corredicasExtracao: null }`;
    - (f) `{ corredicas: 'não se aplica', corredicasExtracao: null }`;
    - (g) `{ corredicas: 'Blum', corredicasExtracao: null }`.

- **TC-03 — Formatação compartilhada e flag `destaque` para Revisão/PDF.** Cobre CA-11, CA-12 e CA-14 (parte lógica compartilhada e cobertura automatizada do destaque vermelho).
  - Entrada: `descreverRespostaCorredicas(...)` para:
    - (a) `{}`, `{ corredicas: null }`, `{ corredicas: undefined }`, `{ corredicas: '' }`;
    - (b) `{ corredicas: 'não se aplica' }`;
    - (c) `{ corredicas: 'Ocultas' }` e `{ corredicas: 'Ocultas', corredicasExtracao: 'Tip-on' }` (subopção antiga residual);
    - (d) `{ corredicas: 'Hafele', corredicasExtracao: 'Extração total' }` e `{ corredicas: 'Hafele', corredicasExtracao: 'Tip-on' }`;
    - (e) `{ corredicas: 'Blum', corredicasExtracao: 'Extração total' }`, `{ corredicas: 'Blum', corredicasExtracao: 'Tip-on' }` e `{ corredicas: 'Blum', corredicasExtracao: 'Extração parcial' }`;
    - (f) `{ corredicas: 'Hafele', corredicasExtracao: null }`, `{ corredicas: 'Blum', corredicasExtracao: null }`, `{ corredicas: 'Blum' }` e `{ corredicas: 'Hafele', corredicasExtracao: 'Extração parcial' }` (subopção incompatível).
  - Esperado:
    - (a) `{ texto: '—', destaque: false, linhas: [] }`;
    - (b) `{ texto: 'Não se aplica', destaque: false, linhas: [] }`;
    - (c) `{ texto: 'Ocultas', destaque: false, linhas: [] }` nos dois casos;
    - (d) `{ texto: 'Hafele — Extração total', destaque: true, linhas: [] }` e `{ texto: 'Hafele — Tip-on', destaque: true, linhas: [] }`;
    - (e) `{ texto: 'Blum — Extração total', destaque: true, linhas: [] }`, `{ texto: 'Blum — Tip-on', destaque: true, linhas: [] }` e `{ texto: 'Blum — Extração parcial', destaque: true, linhas: [] }`;
    - (f) `{ texto: 'Hafele', destaque: true, linhas: [] }` para os casos de `Hafele` e `{ texto: 'Blum', destaque: true, linhas: [] }` para os casos de `Blum` (sem `'null'` ou `'undefined'`).

**Arquivo `testes/V_validacao_projetista.test.js` (casos novos acrescentados após `TP-12`):**

Usando `BASE_A` (com `tipoBalcao: 'Convencionais'`), `BASE_B` (com `temPuxador: 'Não'`) e `BASE_C` (com `temPuxador: 'Não'`):

- **TC-04 — `Corrediças` sem resposta bloqueia nos grupos A, B e C.** Cobre CA-06.
  - Entrada: ambientes completos dos grupos `'A'`, `'B'` e `'C'` com `corredicas: null` e também com `corredicas: undefined`.
  - Esperado: em todos os três grupos e nos dois estados, retorna exatamente `{ corredicas: 'Responda esta pergunta ou marque "Não se aplica"' }`, sem erro nos demais campos.

- **TC-05 — `Ocultas`, `Não se aplica` e valor legado liberam o avanço nos grupos A, B e C sem subopção.** Cobre CA-07.
  - Entrada: ambientes completos dos grupos `'A'`, `'B'` e `'C'` com `corredicasExtracao: null` (ou ausente) e `corredicas` igual a `'Ocultas'`, `'não se aplica'` e `'Telescópicas'` (valor legado fora da lista atual).
  - Esperado: `{}` (sem erros) em todas as combinações.

- **TC-06 — `Hafele` exige uma das 2 subopções válidas nos grupos A, B e C.** Cobre CA-08.
  - Entrada:
    - (a) grupos `'A'`, `'B'` e `'C'` com `corredicas: 'Hafele'` e `corredicasExtracao` igual a `null`, `undefined` ou `''`;
    - (b) grupo `'A'` com `corredicas: 'Hafele'` e `corredicasExtracao: 'Extração parcial'` (exclusiva da `Blum`) e também `'valor invalido'`;
    - (c) grupos `'A'`, `'B'` e `'C'` com `corredicas: 'Hafele'` e `corredicasExtracao` igual a `'Extração total'` e `'Tip-on'`.
  - Esperado:
    - (a) `{ corredicasExtracao: 'Selecione uma opção' }`;
    - (b) `{ corredicasExtracao: 'Selecione uma opção' }`;
    - (c) `{}` em todas as combinações de (c).

- **TC-07 — `Blum` exige uma das 3 subopções válidas nos grupos A, B e C.** Cobre CA-09.
  - Entrada:
    - (a) grupos `'A'`, `'B'` e `'C'` com `corredicas: 'Blum'` e `corredicasExtracao` igual a `null`, `undefined`, `''` ou `'valor invalido'`;
    - (b) grupos `'A'`, `'B'` e `'C'` com `corredicas: 'Blum'` e `corredicasExtracao` igual a `'Extração total'`, `'Tip-on'` e `'Extração parcial'`.
  - Esperado:
    - (a) `{ corredicasExtracao: 'Selecione uma opção' }`;
    - (b) `{}` em todas as combinações de (b).

- **TC-08 — Regras existentes do Projetista intactas junto com corrediças.** Cobre CA-10.
  - Entrada: grupo `'A'` com `alturaBalcao_mm: 0`, `tipoBalcao: 'Editados'`, `balcaoAlturaForaPadrao: null`, `balcaoProfundidadeForaPadrao: 'Não'`, `temPuxador: null`, `corredicas: 'Blum'`, `corredicasExtracao: null`.
  - Esperado: retorna simultaneamente `{ alturaBalcao_mm: 'Responda esta pergunta ou marque "Não se aplica"', balcaoAlturaForaPadrao: 'Responda sim ou não', corredicasExtracao: 'Selecione uma opção', temPuxador: 'Responda sim ou não' }`.

**Arquivo `testes/V_pdf_projetista.test.js` (casos novos acrescentados após `TP-17`):**

Todos os casos usam `pdf.projetista(montarEstadoProjetista([...], ['9001']))` e leitura com `sequencia`, `ausencia` e `secao` (no mesmo padrão adotado nos balcões editados; a cor vermelha no PDF real entra na conferência manual, enquanto o controle de `destaque` fica coberto automaticamente por `TC-03`):

- **TC-09 — PDF com `Ocultas`, `Não se aplica` e `—` sem subopção.** Cobre CA-11 (texto/ausência no PDF).
  - Entrada: PDF com Cozinha (`grupo: 'A'`, `corredicas: 'Ocultas'`), Dormitório Casal (`grupo: 'B'`, `corredicas: 'não se aplica'`) e Home / Sala (`grupo: 'C'`, `corredicas: null`).
  - Esperado:
    - em `Cozinha / Área de Serviço`: sequência `'Corrediças'`, `'Resposta: Ocultas'`;
    - em `Dormitório Casal`: sequência `'Corrediças'`, `'Resposta: Não se aplica'`;
    - em `Home / Sala`: sequência `'Corrediças'`, `'Resposta: —'`;
    - ausência de `'Extração total'`, `'Tip-on'` e `'Extração parcial'` no PDF inteiro.

- **TC-10 — PDF com `Hafele` e `Blum` nos grupos A, B e C mantendo ordem e observações.** Cobre CA-12 (texto/ordem no PDF).
  - Entrada: PDF único com:
    - Cozinha (`grupo: 'A'`, `corredicas: 'Hafele'`, `corredicasExtracao: 'Extração total'`, `observacoes: 'Obs ambiente 9001'`),
    - Dormitório Casal (`grupo: 'B'`, `corredicas: 'Hafele'`, `corredicasExtracao: 'Tip-on'`, `observacoes: 'Obs ambiente 9001'`),
    - Home / Sala (`grupo: 'C'`, `corredicas: 'Blum'`, `corredicasExtracao: 'Extração parcial'`, `observacoes: 'Obs ambiente 9001'`).
  - Esperado:
    - em `Cozinha / Área de Serviço`: sequência `'Dobradiças'`, `'Resposta: —'`, `'Corrediças'`, `'Resposta: Hafele — Extração total'`, `'Puxadores'`, `'Resposta: —'`, `'Observações do ambiente'`, `'Resposta: Obs ambiente 9001'`;
    - em `Dormitório Casal`: sequência `'Dobradiças'`, `'Resposta: —'`, `'Corrediças'`, `'Resposta: Hafele — Tip-on'`, `'Fechamento até o teto'`, `'Resposta: —'`, `'Puxadores'`, `'Resposta: —'`, `'Observações do ambiente'`, `'Resposta: Obs ambiente 9001'`;
    - em `Home / Sala`: sequência `'Dobradiças'`, `'Resposta: —'`, `'Corrediças'`, `'Resposta: Blum — Extração parcial'`, `'Puxadores'`, `'Resposta: —'`, `'Observações do ambiente'`, `'Resposta: Obs ambiente 9001'`.

- **TC-11 — Compatibilidade de rascunho antigo sem campo `corredicasExtracao` (validação + descrição + PDF).** Cobre CA-13 (parte automatizada).
  - Entrada: objeto legado construído **sem** a chave `corredicasExtracao` (simulando rascunho antigo antes da feature): (a) `{ ...BASE_A, tipoBalcao: 'Convencionais', corredicas: 'Ocultas' }` sem `corredicasExtracao` na validação; (b) `descreverRespostaCorredicas({ corredicas: 'Ocultas' })` e `descreverRespostaCorredicas({ corredicas: null })`; (c) PDF de Cozinha com `resp: { corredicas: 'Ocultas' }` (sem `corredicasExtracao` no objeto `resp`).
  - Esperado:
    - (a) `validarRespostasGrupo('A', ...)` retorna `{}`;
    - (b) `{ texto: 'Ocultas', destaque: false, linhas: [] }` e `{ texto: '—', destaque: false, linhas: [] }`;
    - (c) PDF contém sequência `'Corrediças'`, `'Resposta: Ocultas'`, sem erro.

- **TC-12 — PDF com `Hafele` ou `Blum` sem subopção preenchida exibe só o modelo e não quebra.** Cobre CA-14 (parte PDF).
  - Entrada: PDF com Cozinha (`grupo: 'A'`, `corredicas: 'Blum'`, `corredicasExtracao: null`) e Home / Sala (`grupo: 'C'`, `corredicas: 'Hafele'`, `corredicasExtracao: null`).
  - Esperado:
    - em `Cozinha / Área de Serviço`: sequência `'Corrediças'`, `'Resposta: Blum'`, `'Puxadores'`;
    - em `Home / Sala`: sequência `'Corrediças'`, `'Resposta: Hafele'`, `'Puxadores'`;
    - ausência no PDF inteiro de `'null'` e `'undefined'`.

**Conferência manual (não vira teste; motivo entre parênteses):**

- **CA-01, CA-02, CA-03, CA-04 e CA-05 (parte tela)** — exibição dos 4 botões em A (`Cozinha`), B (`Dormitório Casal`) e C (`Home / Sala`) na mesma posição em `"Acabamento e ferragens"`, abertura de `.subperguntas` com subtítulo `Tipo de extração` e 2 ou 3 botões empilhados na vertical (sem `<select>` e sem `"Não se aplica"`), limpeza na troca de modelo vs preservação ao tocar no mesmo modelo, independência entre ambientes e layout sem quebra em viewport mobile (componentes React sem suíte de DOM/navegador na repo).
- **CA-06 (parte rolagem/permanência do erro)** — scroll automático até `.erro-campo` e manutenção da mensagem de erro ao clicar na opção até o próximo `"Avançar"` / `"Ir para Revisão"` (exige navegador).
- **CA-11, CA-12 e CA-14 (parte Revisão e cor no PDF real)** — conferência visual de `StepRevisaoVendedor` exibindo `Ocultas`, `Não se aplica`, `—` em texto normal e `<Modelo> — <Extração>` (ou apenas `<Modelo>`) com `.linhaDestaque` (vermelho) para `Hafele` e `Blum`; e abrir o PDF real gerado para conferir que `"Corrediças"` e a resposta saem em vermelho para `Hafele` e `Blum` (com e sem extração) e em preto para `Ocultas`, `Não se aplica` e `—`, e que a pergunta seguinte volta ao preto (componente React sem suíte de DOM/navegador na repo; cor do PDF conferida manualmente no mesmo padrão dos balcões editados).
- **CA-13 (parte `localStorage` real)** — salvar/simular rascunho antigo na chave `byarabi_checklist_vendedor` sem `corredicasExtracao` no navegador e percorrer até Revisão e PDF (exige `localStorage` real do navegador).
- **CA-15** — isolamento funcional e visual do Perfil Cliente (`/identificacao` até `/revisao`), Venda futura (`/futura/*`), `campoFechado` das demais perguntas e bloco de Puxadores (exige navegador).

### 3.2 Testes existentes afetados

**Nenhum.** Todos os testes existentes continuam passando sem edição porque usam `corredicas: null` (`T-V03`, `T-V04`, `T-V05`, `T-V06`, `T8`, `T9`, `TP-14`, `TP-16`, `TP-17` em `testes/V_pdf_projetista.test.js`) ou `corredicas: 'Ocultas'` (`T10`–`T20`, `TP-06`–`TP-12` em `testes/V_validacao_projetista.test.js`), e `captura.textos` / `leitura_pdf.js` mantêm o mesmo formato.

Testes existentes **não afetados** (proibido alterar na implementação):
- Todos os testes existentes de `testes/V_pdf_projetista.test.js` (`T-V01` a `T-V10`, `T1` a `T9`, `TP-14`, `TP-16`, `TP-17`).
- Todos os testes existentes de `testes/V_validacao_projetista.test.js` (`T10` a `T20`, `TP-06` a `TP-12`).
- `testes/V_puxadores.test.js`, `testes/V_resposta_balcao.test.js`, `testes/I_importacao_pdf.test.js` e demais arquivos de `testes/`.

---

## 4. Plano de Execução

**Regra de segurança da ordem:** a exigência de `corredicasExtracao` em `src/domain/validacaoVendedor.js` (Task 4) só entra **depois** que os novos botões de modelo e subopções de extração já existirem na tela dos três formulários (Task 3), evitando qualquer estado intermediário onde `StepPerguntasAmbienteVendedor.jsx` bloqueie o avanço com erro em subopção inexistente na UI.

- [x] **Task 1 — Schema e domínio puro de corrediças.** Em `src/domain/schemaVendedor.js`, atualizar o comentário de `corredicas` e acrescentar `corredicasExtracao: null` logo após `corredicas` em `defaultsPorGrupo.A`, `defaultsPorGrupo.B` e `defaultsPorGrupo.C` (Seção 1.1). Criar `src/domain/corredicasVendedor.js` (Seção 1.2) com `OPCOES_CORREDICAS`, `EXTRACAO_POR_MODELO`, `obterOpcoesExtracao`, `modeloExigeExtracao`, `extracaoValidaParaModelo`, `resolverAlteracaoCorredicas` e `descreverRespostaCorredicas`. Validação: `npm test` (suíte atual continua verde) e `npm run build` compila.
- [x] **Task 2 — Testes unitários puros de corrediças.** Criar `testes/V_corredicas.test.js` com **`TC-01`**, **`TC-02`**, **`TC-03`** e a parte pura de **`TC-11`** (Seção 3.1), com todos os esperados escritos por extenso a partir do PRD. Validação: `npm test` verde.
- [x] **Task 3 — CSS e interface nos formulários A, B e C.** Acrescentar `.opcoesVerticais` ao fim de `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.module.css` (Seção 1.4). Criar `src/steps/vendedor/StepPerguntasAmbienteVendedor/BlocoCorredicasVendedor.jsx` (Seção 1.4) e substituir `campoFechado('corredicas', ...)` por `<BlocoCorredicasVendedor />` em `FormGrupoA.jsx`, `FormGrupoB.jsx` e `FormGrupoC.jsx` (mantendo `campoFechado`, `StepPerguntasAmbienteVendedor.jsx` e demais perguntas intocados). Validação: `npm run build` compila e `npm test` verde.
- [x] **Task 4 — Validação condicional e testes de validação.** Atualizar `src/domain/validacaoVendedor.js` (Seção 1.3) exportando `MSG_SELECIONE_EXTRACAO` e exigindo `extracaoValidaParaModelo` quando `modeloExigeExtracao(resp.corredicas)` nos grupos A, B e C, mantendo `respostaValida` inalterada. Em `testes/V_validacao_projetista.test.js`, acrescentar **`TC-04`**, **`TC-05`**, **`TC-06`**, **`TC-07`**, **`TC-08`** e a parte de validação de **`TC-11`** sem editar testes existentes. Validação: `npm test` verde.
- [x] **Task 5 — PDF do Projetista e testes de PDF.** Em `src/services/pdfVendedor.js`, importar `descreverRespostaCorredicas`, alterar `corredicas` para `tipo: 'corredicas'` nos grupos A, B e C e chamar `escreverPergunta(item.label, texto, destaque, linhas)` (Seção 1.5). Em `testes/V_pdf_projetista.test.js`, acrescentar **`TC-09`**, **`TC-10`**, a parte de PDF de **`TC-11`** e **`TC-12`**, mantendo todos os testes existentes e `testes/auxiliares/*` intocados. Validação: `npm test` verde.
- [x] **Task 6 — Tela de Revisão do Projetista.** Em `src/steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.jsx`, importar `descreverRespostaCorredicas`, alterar `corredicas` para `tipo: 'corredicas'` nos grupos A, B e C e usar `descreverRespostaCorredicas(resp)` no loop, reaproveitando `styles.linhaDestaque` sem editar `StepRevisaoVendedor.module.css` (Seção 1.5). Validação: `npm run build` compila e `npm test` verde.
- [ ] **Task 7 — Conferência manual (`npm run dev`).** Conferir em desktop e viewport mobile: CA-01 a CA-05 (4 botões em A, B e C, subtítulo `Tipo de extração`, botões empilhados na vertical sem `"Não se aplica"`, limpeza apenas ao trocar modelo e independência entre ambientes), CA-06 (scroll até `.erro-campo` e permanência do erro até novo `"Avançar"`), CA-11, CA-12 e CA-14 na Revisão e **abrir o PDF real gerado** conferindo que `"Corrediças"` e a resposta saem em vermelho para `Hafele` e `Blum` (com e sem extração) e em preto para `Ocultas`, `Não se aplica` e `—`, e que a pergunta seguinte volta ao preto; CA-13 (rascunho antigo simulado em `byarabi_checklist_vendedor` sem `corredicasExtracao`); e CA-15 (Cliente, `/futura/*`, `campoFechado` e Puxadores intocados).
- [x] **Task 8 — Rodar a suíte inteira: verde e sem teste pulado.** Executar `npm test` (0 falhas, 0 pulados) e `npm run build` (sem erros); informar o resultado exato (passou/pulou/falhou), sugerir texto de commit na branch `feat/balcoes-convencionais-editados` (sem executar commit ou push) e perguntar ao Everton se `CLAUDE.md:59` deve ser atualizado para citar `corredicasVendedor.js`.

Se um teste novo falhar porque o código faz diferente do esperado acima, não ajuste o esperado para ficar verde: registre em Desvios e pare. Se um teste existente que não está na lista de afetados falhar, corrija o código, não o teste.

---

## 5. Desvios

*(A preencher durante a implementação caso ocorra algum desvio.)*
