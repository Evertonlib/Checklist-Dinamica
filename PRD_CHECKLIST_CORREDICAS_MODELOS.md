# PRD — Modelos de corrediças e opções de extração no Checklist do Projetista

> **Status: DECISÕES FECHADAS — PRONTO PARA APROVAÇÃO FINAL / SPEC.** Nenhum código foi escrito.
> Todas as definições da **Seção 14** foram fechadas com o Everton e aplicadas abaixo, com os
> critérios de aceitação congelados na **Seção 15**.
>
> Nome da feature: `CHECKLIST_CORREDICAS_MODELOS`. Este arquivo fica na raiz do projeto, seguindo a
> metodologia SDD do repositório (no padrão de `PRD_CHECKLIST_PUXADORES.md` e
> `PRD_CHECKLIST_MEDIDAS_BALCOES.md`).
>
> Tudo o que está descrito como "hoje" foi conferido diretamente no código na branch
> `feat/balcoes-convencionais-editados` (onde já estão implementadas as features de balcões
> convencionais/editados e de puxadores), com citações `arquivo:linha`.
>
> **Nota sobre a branch:** conforme decisão do Everton no card Trello, a implementação desta
> feature entrará na mesma branch já existente (`feat/balcoes-convencionais-editados`), para um
> merge único e um vídeo único de orientação aos vendedores.

---

## 1. Objetivo

Hoje, no Checklist do Projetista (perfil Vendedor, rotas `/vendedor/*`), a pergunta
**"Corrediças"** — presente no bloco **"Acabamento e ferragens"** dos 3 grupos de ambiente (A, B e
C) — oferece apenas uma opção de corrediça (**`Ocultas`**), além de **`Não se aplica`**. A
opção `Telescópicas` já foi removida anteriormente do formulário (`src/domain/schemaVendedor.js:12`).

Com a entrada de novos fornecedores/modelos de corrediças para a equipe de liberação e fábrica, o
Projetista precisa indicar não apenas a corrediça padrão de hoje, mas também quando o projeto usa
**`Hafele`** ou **`Blum`**, especificando o **tipo de extração** correspondente a cada modelo:

- **`Ocultas`** *(corrediça padrão de hoje)*: continua funcionando como hoje, **sem abrir
  subopções**.
- **`Hafele`**: ao selecionar, abre o bloco recuado com o subtítulo **`Tipo de extração`** e **2
  subopções** em botões empilhados na vertical:
  1. **`Extração total`**
  2. **`Tip-on`**
- **`Blum`**: ao selecionar, abre o bloco recuado com o subtítulo **`Tipo de extração`** e **3
  subopções** em botões empilhados na vertical:
  1. **`Extração total`**
  2. **`Tip-on`**
  3. **`Extração parcial`**
- **`Não se aplica`**: continua disponível como hoje na pergunta principal, sem subopções.

Na **tela de Revisão** e no **PDF do Projetista**:

- Quando o modelo for **`Hafele`** ou **`Blum`**, a resposta exibe **modelo + extração na mesma
  linha com travessão `—`** (ex.: `Blum — Extração total`) e aparece em **vermelho (destaque de
  alerta)** — mesmo se a subopção estiver vazia. **Motivo:** a equipe de liberação usa `Ocultas`
  por hábito e quase nunca muda, então `Hafele` e `Blum` precisam chamar atenção visual para não
  passarem despercebidos (mesma lógica de viés de hábito aplicada aos balcões editados).
- **`Ocultas`**, **`Não se aplica`** e **`—`** permanecem em texto normal (sem destaque).
- Rascunhos antigos salvos antes desta mudança continuam válidos.

---

## 2. Escopo já definido e o que está fora de escopo

### Regras definidas pelo Everton

1. **Aplicação nos 3 grupos do Projetista (A, B e C):** a pergunta `"Corrediças"` existe hoje nos
   grupos A, B e C (todos os 8 ambientes de `src/domain/gruposPerguntasVendedor.js:4-17`) e
   continua presente na mesma posição nos 3 grupos.
2. **Sem lista suspensa e referência visual definida:** as subopções de extração **não** usam
   `<select>` nem lista suspensa — são **botões empilhados na vertical** (2 botões para `Hafele`
   ou 3 botões para `Blum`), dentro do bloco recuado `.subperguntas` (mesma referência visual das
   subperguntas dos balcões convencionais/editados), com o subtítulo **`Tipo de extração`** acima
   dos botões.
3. **Valor padrão único (`Ocultas`) sem subopção:** mantém-se **`Ocultas`** (plural), sem abrir
   nada abaixo.
4. **Padrão uniforme de texto nas subopções:** **`Extração total`** e **`Tip-on`** têm exatamente o
   mesmo texto tanto em `Hafele` quanto em `Blum`. Acentuação portuguesa padrão (`Extração total`,
   `Extração parcial`) e marca **`Hafele`** sem trema.
5. **Troca de modelo vs clique no mesmo modelo:** ao trocar para um modelo diferente, a subopção
   volta para `null`; tocar novamente no modelo que já está marcado **não** apaga a extração
   escolhida.
6. **Mesma branch dos puxadores:** implementação na branch `feat/balcoes-convencionais-editados`.
7. **Rascunho antigo válido:** um rascunho já salvo com `Ocultas` continua válido naturalmente,
   sem quebrar nem ser rejeitado após a publicação.
8. **Revisão e PDF com modelo + extração e destaque vermelho:** `Hafele` e `Blum` exibem
   `<Modelo> — <Extração>` na mesma linha em **vermelho** (ou apenas `<Modelo>` em vermelho se sem
   subopção); `Ocultas`, `Não se aplica` e `—` ficam em texto normal.

### Fora de escopo (intocável)

- **Perfil Cliente inteiro** (`/identificacao`, `/ambientes`, `/globais`, `/ambiente/:instanceId`,
  `/revisao`, `/sucesso`).
- **Venda futura** (`/futura/*`) e tela `/projetista`.
- **Pergunta de Puxadores** já implementada na branch (`BlocoPuxadoresVendedor.jsx`,
  `puxadoresVendedor.js`, `ComboboxEditavel`).
- **Demais perguntas do Projetista e funções `campoFechado`:** alturas do piso (`alturaBalcao_mm`,
  `alturaArmario_mm`), balcões convencionais/editados (`tipoBalcao` e suas duas subperguntas),
  `fechamentoTeto`, `caixaria`, `dobradicas` e `observacoes`, bem como as funções locais
  `campoFechado` de `FormGrupoA.jsx`, `FormGrupoB.jsx` e `FormGrupoC.jsx`.
- **Fluxo de controle e momento de limpeza de erros na tela (`StepPerguntasAmbienteVendedor.jsx`)**
  e **CSS da Revisão (`StepRevisaoVendedor.module.css`)**.
- **Pontuação de risco / CCs / importação de PDF** (o Projetista não tem score, CC nem metadado
  oculto V1 no PDF).
- **Novas dependências npm** (implementação 100% em React puro com os tokens `--ba-*` de
  `src/index.css`).

---

## 3. Relação com scripts e sistemas existentes

### 3.1 Dentro do repositório (`Checklist-Dinamica`)

- Reaproveita a estrutura de grupos do Projetista (`src/domain/gruposPerguntasVendedor.js`), o
  schema por grupo (`src/domain/schemaVendedor.js`), a validação centralizada
  (`src/domain/validacaoVendedor.js`) e o padrão de formatação compartilhada entre Revisão e PDF
  usado em `src/domain/respostaBalcaoVendedor.js` e `src/domain/puxadoresVendedor.js`.
- **Reaproveitamento exato do destaque vermelho:** confirmado no código que `descreverRespostaBalcao`
  (`src/domain/respostaBalcaoVendedor.js:8-26`) devolve `{ texto, destaque, linhas }` (`destaque:
  true` na linha `:23`), e tanto `StepRevisaoVendedor.jsx:108-118` (aplicando
  `styles.linhaDestaque` de `StepRevisaoVendedor.module.css:59-61`, `color: var(--ba-danger)`)
  quanto `pdfVendedor.js:7,107-123,150-156` (aplicando `COR_ALERTA = [180, 0, 0]` via
  `doc.setTextColor(...COR_ALERTA)`) já pintam pergunta e resposta de vermelho quando `destaque` é
  verdadeiro. A nova função pura de corrediças devolverá esse mesmo formato
  `{ texto, destaque, linhas }`, reaproveitando o caminho pronto **sem alterar
  `StepRevisaoVendedor.module.css`** (compartilhado com `StepRevisaoFutura.jsx`).
- Segue o padrão visual de bloco condicional recuado `.subperguntas`
  (`src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.module.css:131-135`),
  inaugurado na feature de balcões (`FormGrupoA.jsx:100-110`) e reutilizado em puxadores
  (`BlocoPuxadoresVendedor.jsx:88-89`), usando exclusivamente os tokens `--ba-*` de
  `src/index.css:4-32`.
- Segue o `CLAUDE.md:45` e `:61`: regras de negócio e validação ficam em `src/domain/`, separadas da
  UI; mudanças no lado Projetista não propagam para Perfil Cliente nem Venda futura.
- Mantém **`Ocultas`** (plural) já existente em `FormGrupoA.jsx:10`, `FormGrupoB.jsx:10`,
  `FormGrupoC.jsx:9` e `schemaVendedor.js:12`, sem necessidade de conversão ou equivalência com
  outro rótulo.

### 3.2 Leitores externos em `c:\Users\Windows 10\AUTOMACOES` (verificado)

Foi realizada busca em todos os arquivos `.py`, `.ps1`, `.js`, `.mjs`, `.bat` fora de
`Checklist-Dinamica`, `node_modules`, `dist`, `.git` e ambientes virtuais em
`c:\Users\Windows 10\AUTOMACOES` por `Checklist_Projetista`, `byarabi_checklist_vendedor`,
`Corrediças` e `corredicas`. Resultado confirmado:

- **Nenhum script externo lê o PDF do Projetista nem a chave `localStorage` do Projetista.** O PDF
  do Projetista não grava metadados ocultos (`Keywords` `V1:`) e o importador recusa esse PDF
  (`testes/I_importacao_pdf.test.js:145-153`).
- As ocorrências de `corredicas` / `Corrediças` fora de `Checklist-Dinamica` estão apenas em
  ferramentas de leitura de XML de projeto/encomenda (`Ambiente_Claude/cmp.py`,
  `Ambiente_Claude/contador_ferragens.py`, `Ambiente_Claude/remove_ferragens_xml.py`,
  `Ambiente_Claude/revisor_listagem.py`, `CONFERENCIA_PREVENTIVA/cmp.py`,
  `Sentinela_Encomenda/ferragens_simples.py`), que não leem o PDF nem dados do Checklist Dinâmica.
- O padrão de nome do arquivo (`Checklist_Projetista_<CONTRATO>_<DATA>.pdf`, em
  `src/services/pdfVendedor.js:167`) não será alterado.

Conclusão: **nenhum script externo quebra com a mudança no texto e destaque de `Corrediças` na
Revisão e no PDF do Projetista.**

---

## 4. Como funciona hoje (conferido na branch `feat/balcoes-convencionais-editados`)

### 4.1 Telas de perguntas dos grupos A, B e C

A pergunta **`Corrediças`** existe nos três formulários separados em
`src/steps/vendedor/StepPerguntasAmbienteVendedor/`:

- `FormGrupoA.jsx:10` define `const OPCOES_CORREDICAS = ['Ocultas']` e renderiza na `:117`:
  `campoFechado('corredicas', 'Corrediças', OPCOES_CORREDICAS)` dentro de `"Acabamento e ferragens"`
  (entre `Dobradiças` e `<BlocoPuxadoresVendedor />`).
- `FormGrupoB.jsx:10` define `const OPCOES_CORREDICAS = ['Ocultas']` e renderiza na `:54`:
  `campoFechado('corredicas', 'Corrediças', OPCOES_CORREDICAS)` dentro de `"Acabamento e ferragens"`
  (entre `Dobradiças` e `Haverá fechamento até o teto?`).
- `FormGrupoC.jsx:9` define `const OPCOES_CORREDICAS = ['Ocultas']` e renderiza na `:49`:
  `campoFechado('corredicas', 'Corrediças', OPCOES_CORREDICAS)` dentro de `"Acabamento e ferragens"`
  (entre `Dobradiças` e `<BlocoPuxadoresVendedor />`).

Detalhes visuais e de código relevantes:

- A função auxiliar `campoFechado` existe em três cópias locais (`FormGrupoA.jsx:58-88`,
  `FormGrupoB.jsx:19-47`, `FormGrupoC.jsx:18-42`) e desenha também as demais perguntas fechadas de
  cada grupo (`tipoBalcao`, subperguntas de balcão, `fechamentoTeto`, `caixaria` e `dobradicas`).
  Em `FormGrupoA.jsx:58` já aceita o 4º parâmetro `mostrarNaoSeAplica = true`; em `FormGrupoB.jsx` e
  `FormGrupoC.jsx` sempre exibe o botão `"Não se aplica"`.
- Em `StepPerguntasAmbienteVendedor.module.css`:
  - `.opcoes` (`:18-22`) usa `display: flex; flex-wrap: wrap; gap: 8px;` (botões lado a lado com
    quebra de linha).
  - `.opcao` e `.opcaoAtiva` (`:24-40`) dão altura mínima de `44px`, borda `2px`, fundo branco ou
    destaque dourado `--ba-gold`.
  - `.subperguntas` (`:131-135`) cria recuo à esquerda (`margin-left: 16px; padding-left: 12px`) e
    borda vertical esquerda (`2px solid var(--ba-line)`). Esse CSS é importado **apenas** pelos 5
    arquivos dentro de `StepPerguntasAmbienteVendedor/` (não afeta Cliente nem Venda futura).
  - `.erro` (`:104-109`) exibe mensagens de erro em `--ba-danger`, acompanhado da classe
    `erro-campo` usada por `scrollToFirstError()` (`StepPerguntasAmbienteVendedor.jsx:36-38`).
- Hoje, clicar numa opção de pergunta fechada dispara apenas `dispatch(...)` (`FormGrupoA.jsx:18-19`,
  `FormGrupoB.jsx:16-17`, `FormGrupoC.jsx:15-16`) e **não** limpa o estado `erros` de
  `StepPerguntasAmbienteVendedor.jsx:19`; o erro desaparece ao clicar novamente em `"Avançar"` /
  `"Ir para Revisão"` (`validar()`, `:40-44`) ou ao mudar de ambiente (`:32-34`).

### 4.2 Validação para avançar

- `src/domain/validacaoVendedor.js:12-16` inclui `'corredicas'` em
  `CAMPOS_OBRIGATORIOS_POR_GRUPO` para `'A'`, `'B'` e `'C'`.
- `respostaValida` (`:18-22`) aceita `'não se aplica'` ou qualquer valor diferente de `null` e
  `undefined` para `'corredicas'`, retornando `MSG_RESPONDA` (`'Responda esta pergunta ou marque
  "Não se aplica"'`, linha `:1`) quando vazia.
- `StepPerguntasAmbienteVendedor.jsx:40-44` executa `validarRespostasGrupo(grupo, resp)` ao clicar
  em `"Avançar"` ou `"Ir para Revisão"`, bloqueando o avanço e rolando até o primeiro erro se houver
  erros.

### 4.3 Estado, defaults e rascunho

- `src/domain/schemaVendedor.js` define `corredicas: null` em `defaultsPorGrupo.A` (`:12`),
  `defaultsPorGrupo.B` (`:20`) e `defaultsPorGrupo.C` (`:29`).
- `src/context/FormProviderVendedor.jsx`:
  - Salva na chave `byarabi_checklist_vendedor` (`:8`).
  - `SET_RESPOSTA_AMBIENTE_VENDEDOR` (`:169-182`) atualiza qualquer `[campo]: valor` dentro de
    `respostasPorAmbiente[instanceId]`.
  - `normalizarEstadoSalvo` (`:25-58`) mescla os `defaultsPorGrupo[obterGrupo(instancia.tipo)]`
    com os dados salvos de cada ambiente (`:30-42`). Novos campos adicionados aos defaults são
    automaticamente inicializados em rascunhos antigos na restauração.

### 4.4 Revisão e PDF do Projetista

- `StepRevisaoVendedor.jsx:12-36` e `pdfVendedor.js:20-44` definem `PERGUNTAS_POR_GRUPO`, onde
  `{ campo: 'corredicas', label: 'Corrediças', tipo: 'texto' }` aparece nos grupos A (`:20` /
  `:28`), B (`:26` / `:34`) e C (`:33` / `:41`).
- Hoje, como `tipo` é `'texto'`, `formatarResposta` (`StepRevisaoVendedor.jsx:38-44` e
  `pdfVendedor.js:46-52`) imprime exatamente o texto salvo (`Ocultas`), `'Não se aplica'` para
  `'não se aplica'` e `'—'` para `null`/`undefined`.
- Para perguntas compostas (como `balcao` e `puxadores`), ambos os arquivos já delegam para uma
  função pura em `src/domain/` (`descreverRespostaBalcao` em `respostaBalcaoVendedor.js:8-26` e
  `descreverRespostaPuxadores` em `puxadoresVendedor.js:115-132`), que devolve
  `{ texto, destaque, linhas }`. Quando `destaque` é `true`, `StepRevisaoVendedor.jsx:114-116`
  aplica `styles.linhaDestaque` (`StepRevisaoVendedor.module.css:59-61`) e `pdfVendedor.js:111`
  aplica `COR_ALERTA = [180, 0, 0]` (`:7`).
- A Revisão não revalida antes de gerar o PDF (`StepRevisaoVendedor.jsx:63-75`).
- Observação sobre fontes do PDF: `pdfVendedor.js:78` e `:115` usam a fonte padrão `helvetica` do
  `jsPDF`, que suporta normalmente caracteres acentuados do português (`ç`, `ã`, usados em
  `Corrediças` e `Extração`).

### 4.5 Testes existentes

- `testes/V_pdf_projetista.test.js`:
  - `T-V03` (`:31-51`), `T-V04` (`:53-68`), `T-V05` (`:70-82`), `T-V06` (`:84-108`) e `T8`
    (`:293-332`) verificam a ordem e o texto de `Corrediças` nos grupos A, B e C usando os defaults
    (`corredicas: null`, esperando `'Corrediças'` e `'Resposta: —'`).
  - `T9` (`:334-356`), `TP-14` (`:358-379`), `TP-16` (`:381-431`) e `TP-17` (`:433-497`) também
    passam com `corredicas: null`.
- `testes/V_validacao_projetista.test.js`:
  - `BASE_A` (`:9-17`), `BASE_B` (`:19-24`) e `BASE_C` (`:26-30`) usam `corredicas: 'Ocultas'`.
  - `T17` (`:32-48`), `T18` (`:50-87`) e `TP-12` (`:373-389`) verificam a validação dos 3 grupos.
- `testes/auxiliares/construtores.js:88-100` (`montarEstadoProjetista`) parte dos
  `defaultsPorGrupo[grupo]` mesclados com o `resp` do caso de teste.
- `npm test` hoje executa 167 testes, todos passando (0 falhas, 0 pulados).

---

## 5. Padrão externo pesquisado (Etapa 2 — simplicidade e consistência)

O projeto não utiliza bibliotecas externas de formulário ou componentes de UI (apenas React puro, CSS
Modules com tokens `--ba-*` e `src/domain/` para regras puras). Para subopções condicionais de uma
pergunta de múltipla escolha sem lista suspensa:

1. **Botões verticais simples dentro de `.subperguntas`:** em vez de adicionar componente complexo
   ou `<select>`, a forma mais simples e consistente com o restante do app é reutilizar o mesmo
   container condicional recuado `.subperguntas` (`StepPerguntasAmbienteVendedor.module.css:131-135`),
   com o subtítulo **`Tipo de extração`** no estilo `.pergunta` das subperguntas dos balcões e uma
   classe de alinhamento vertical (coluna única com espaçamento entre botões) usando os mesmos
   botões `.opcao` / `.opcaoAtiva` já existentes.
2. **Bloco compartilhado nos 3 grupos + módulo puro em `src/domain/`:** como `Corrediças` aparece de
   forma idêntica em `FormGrupoA.jsx`, `FormGrupoB.jsx` e `FormGrupoC.jsx`, seguir o mesmo padrão
   recém-adotado em `BlocoPuxadoresVendedor.jsx` + `src/domain/puxadoresVendedor.js` evita triplicar
   a lógica de troca de modelo e formatação entre os três formulários, além de manter
   `StepRevisaoVendedor.jsx` e `pdfVendedor.js` sincronizados pela mesma função pura de descrição
   `{ texto, destaque, linhas }`.

---

## 6. Comportamento desejado em detalhe

### 6.1 Tela de perguntas do ambiente (grupos A, B e C)

- Em **todos os 3 grupos (A, B e C)**, na mesma posição atual dentro de **"Acabamento e
  ferragens"** (`FormGrupoA.jsx:117`, `FormGrupoB.jsx:54`, `FormGrupoC.jsx:49`), a pergunta
  **"Corrediças"** passa a exibir **4 botões**:
  1. **`Ocultas`**
  2. **`Hafele`**
  3. **`Blum`**
  4. **`Não se aplica`** *(mantido como hoje)*
- Nenhum botão vem pré-marcado em ambiente novo (`null`).
- **Quando `Ocultas` ou `Não se aplica`:**
  - Nenhuma subopção aparece abaixo da pergunta.
- **Quando `Hafele`:**
  - Logo abaixo de `Corrediças`, dentro de um bloco recuado com borda esquerda (estilo
    `.subperguntas` dos balcões), exibe o subtítulo **`Tipo de extração`** (no estilo das
    subperguntas dos balcões) seguido de **2 botões empilhados na vertical** (um abaixo do outro,
    **sem** botão `"Não se aplica"`):
    1. `Extração total`
    2. `Tip-on`
- **Quando `Blum`:**
  - Logo abaixo de `Corrediças`, dentro do mesmo bloco recuado (estilo `.subperguntas`), exibe o
    subtítulo **`Tipo de extração`** seguido de **3 botões empilhados na vertical** (um abaixo do
    outro, **sem** botão `"Não se aplica"`):
    1. `Extração total`
    2. `Tip-on`
    3. `Extração parcial`
- **Independência entre ambientes:** cada ambiente selecionado mantém sua própria escolha de
  modelo e de extração (ex.: `Cozinha` com `Blum` / `Extração total` e `Dormitório Casal` com
  `Ocultas`).
- **Troca entre modelos vs clique no modelo já ativo (Q6):**
  - Ao **trocar** para um modelo diferente (ex.: `Blum` → `Hafele`, `Hafele` → `Ocultas` ou
    `Hafele` → `Não se aplica`), a subopção de extração volta para `null`, obrigando nova escolha
    quando o novo modelo for `Hafele` ou `Blum` e evitando misturar uma opção exclusiva de outro
    modelo (como `Extração parcial` sob `Hafele`).
  - **Importante:** tocar novamente no modelo que **já está marcado** (ex.: `Blum` já ativo com
    `Extração total`, tocar em `Blum` de novo) **não** apaga a extração escolhida — a limpeza só
    acontece quando o modelo muda de fato.
- **Momento de limpeza de erros na tela:** mantém exatamente o comportamento atual das demais
  perguntas fechadas do Projetista — selecionar um modelo ou uma extração atualiza o estado sem
  limpar `erros` na hora; os erros exibidos somem quando o usuário clica novamente em `"Avançar"` /
  `"Ir para Revisão"` (e passa na validação) ou ao trocar de ambiente.

### 6.2 Validação para avançar (grupos A, B e C)

- **Regra da pergunta principal `corredicas` preservada:** a regra atual de `corredicas` em
  `validacaoVendedor.js:18-22` (`respostaValida`) continua exatamente igual — aceita `'não se
  aplica'` ou qualquer valor diferente de `null` e `undefined`. A pergunta principal **não** passa
  a restringir a uma lista fechada de valores, garantindo que rascunhos antigos com valores fora da
  lista atual nunca sejam travados.
  - Quando `corredicas` for `null` ou `undefined`, bloqueia o avanço nos 3 grupos exibindo
    `Responda esta pergunta ou marque "Não se aplica"` (`MSG_RESPONDA` em `validacaoVendedor.js:1`),
    com classe `.erro-campo` para scroll automático.
- **Única adição na validação (subopção para `Hafele` e `Blum`):**
  - Quando **`corredicas` = `'Hafele'`** ou **`'Blum'`**, exige que a subopção de extração esteja
    preenchida **com uma das opções válidas daquele modelo** (`Extração total` ou `Tip-on` para
    `Hafele`; `Extração total`, `Tip-on` ou `Extração parcial` para `Blum`).
  - Se a subopção estiver vazia (`null`/`undefined`/inválida para o modelo), bloqueia o avanço com
    chave de erro própria no bloco da subpergunta, exibindo mensagem clara sem mencionar `"Não se
    aplica"` (ex.: `Selecione uma opção`), também com `.erro-campo` para scroll automático.
- Quando **`corredicas` = `'Ocultas'`** ou **`'não se aplica'`** (ou qualquer outro valor preenchido
  em rascunho antigo que não seja `'Hafele'` nem `'Blum'`):
  - Libera o avanço sem exigir subopção de extração.
- Toda regra de validação permanece centralizada em `src/domain/validacaoVendedor.js`, coberta por
  testes automatizados.

### 6.3 Revisão e PDF do Projetista

- **Consistência entre Revisão e PDF:** uma função pura compartilhada em `src/domain/` (no mesmo
  padrão de `descreverRespostaBalcao` e `descreverRespostaPuxadores`) devolve
  `{ texto, destaque, linhas }` para `StepRevisaoVendedor.jsx` e `pdfVendedor.js`.
- **Posição:** mantém exatamente a mesma posição e o mesmo rótulo **`Corrediças`** nos grupos A, B
  e C (antes de `Puxadores` nos grupos A e C; antes de `Fechamento até o teto` no grupo B).
- **Formato e destaque por situação (Q5 = mesma linha com `—`; Q7 = vermelho para `Hafele` e
  `Blum`):**
  - Não respondida (`null` / `undefined`): `texto: '—'`, `destaque: false`, `linhas: []`.
    Revisão: `Corrediças: —` | PDF: `Corrediças` / `Resposta: —` (texto normal).
  - `Não se aplica`: `texto: 'Não se aplica'`, `destaque: false`, `linhas: []` (texto normal).
  - `Ocultas`: `texto: 'Ocultas'`, `destaque: false`, `linhas: []` (texto normal).
  - **`Hafele` ou `Blum` com subopção escolhida:** `texto: '<Modelo> — <Extração>'` (ex.:
    `Hafele — Tip-on`, `Blum — Extração total`, `Blum — Extração parcial`), `destaque: true`,
    `linhas: []`.
    Revisão: `Corrediças: Blum — Extração total` em **vermelho** (`.linhaDestaque`, já existente).
    PDF: `Corrediças` e `Resposta: Blum — Extração total` em **vermelho** (`COR_ALERTA`, já
    existente).
  - **`Hafele` ou `Blum` sem subopção preenchida** (estado incompleto aberto direto na
    Revisão/PDF): `texto: '<Modelo>'` (ex.: `Blum`), `destaque: true`, `linhas: []` — exibe apenas o
    modelo em **vermelho**, sem quebrar nem imprimir `null` / `undefined`.
- **`StepRevisaoVendedor.module.css` não é alterado** (reaproveita `.linhaDestaque` já existente).

---

## 7. Arquivos afetados

| Arquivo | Efeito esperado |
|---|---|
| `src/domain/schemaVendedor.js` | Grupos A, B e C ganham o campo de subopção da corrediça nos defaults (começando `null`) e atualização do comentário de valores válidos de `corredicas` (`"Ocultas" \| "Hafele" \| "Blum" \| "não se aplica" \| null`) |
| `src/domain/corredicasVendedor.js` *(novo)* | Catálogo dos modelos (`Ocultas`, `Hafele`, `Blum`), mapa de subopções válidas por modelo, verificação de compatibilidade modelo × extração e função pura compartilhada `{ texto, destaque, linhas }` para Revisão e PDF |
| `src/domain/validacaoVendedor.js` | Mantém inalterada a validação da pergunta principal `corredicas` (`respostaValida`) e acrescenta exigência de subopção válida quando `corredicas` for `Hafele` ou `Blum` |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/BlocoCorredicasVendedor.jsx` *(novo componente compartilhado)* | Renderiza `Corrediças` (`Ocultas`, `Hafele`, `Blum`, `Não se aplica`) e, quando `Hafele` ou `Blum`, o bloco recuado com subtítulo `Tipo de extração` e botões empilhados na vertical; limpa a subopção apenas quando o modelo muda de fato; usado em A, B e C |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoA.jsx` | Substitui a chamada `campoFechado('corredicas', ...)` por `<BlocoCorredicasVendedor />` (sem alterar `campoFechado` nem outras perguntas) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoB.jsx` | Substitui a chamada `campoFechado('corredicas', ...)` por `<BlocoCorredicasVendedor />` (sem alterar `campoFechado` nem outras perguntas) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoC.jsx` | Substitui a chamada `campoFechado('corredicas', ...)` por `<BlocoCorredicasVendedor />` (sem alterar `campoFechado` nem outras perguntas) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.module.css` | Acrescenta classe para empilhar os botões das subopções na vertical dentro de `.subperguntas`, usando os tokens `--ba-*`. Usado apenas pelo Projetista |
| `src/steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.jsx` | Passa a formatar `corredicas` nos grupos A, B e C usando a função pura compartilhada de `src/domain/`, reaproveitando `destaque` → `styles.linhaDestaque` |
| `src/services/pdfVendedor.js` | Passa a imprimir `corredicas` nos grupos A, B e C usando a mesma função pura compartilhada de `src/domain/`, reaproveitando `destaque` → `COR_ALERTA` |
| `testes/V_corredicas.test.js` *(novo)* | Testes puros para catálogo de modelos/extrações, compatibilidade, limpeza ao trocar de modelo, formatação Revisão/PDF (`Modelo — Extração`) e flag `destaque` (`true` para `Hafele`/`Blum` com ou sem subopção; `false` para `Ocultas`/`Não se aplica`/`—`) |
| `testes/V_validacao_projetista.test.js` | Novos casos de validação de corrediças (`Ocultas`, `Hafele` com 2 opções, `Blum` com 3 opções, ausência/incompatibilidade de subopção e compatibilidade com valor antigo fora da lista) |
| `testes/V_pdf_projetista.test.js` | Novos casos de PDF para `Ocultas`, `Hafele` e `Blum` nos grupos A, B e C, incluindo verificação automatizada do destaque vermelho (`COR_ALERTA`) para `Hafele`/`Blum` e texto normal para `Ocultas`/`Não se aplica` (`T-V03` a `T-V06`, `T8` e `T9` continuam passando) |

---

## 8. O que será adicionado

- Novas opções **`Hafele`** e **`Blum`** na pergunta **`Corrediças`** nos grupos A, B e C do
  Projetista.
- Bloco condicional recuado abaixo de `Corrediças` com subtítulo **`Tipo de extração`** e **botões
  empilhados na vertical** (sem lista suspensa e sem `"Não se aplica"`): 2 opções para `Hafele` e
  3 opções para `Blum`.
- Novo campo nos defaults de A, B e C em `schemaVendedor.js` para armazenar a opção de extração.
- Módulo de domínio em `src/domain/` com o catálogo de corrediças, validação de compatibilidade
  modelo × extração e formatação compartilhada `{ texto, destaque, linhas }` para Revisão e PDF.
- Validação condicional em `validacaoVendedor.js` exigindo subopção válida quando o modelo for
  `Hafele` ou `Blum`.
- **Destaque vermelho (alerta)** na Revisão e no PDF quando o modelo escolhido for `Hafele` ou
  `Blum` (inclusive sem subopção preenchida).
- Suíte de testes automatizados (`V_corredicas.test.js` + novos casos em
  `V_validacao_projetista.test.js` e `V_pdf_projetista.test.js`, incluindo verificação de destaque
  vermelho).

---

## 9. O que será removido ou alterado

- **Nada funcional existente é removido** (`Ocultas` e `Não se aplica` continuam disponíveis).
- **Alterado (comportamento):**
  - A pergunta `Corrediças` nos grupos A, B e C deixa de ter apenas `Ocultas` e passa a oferecer 3
    modelos (`Ocultas`, `Hafele`, `Blum`) + `Não se aplica`, com seleção obrigatória de extração
    quando o modelo for `Hafele` ou `Blum`.
  - A Revisão e o PDF do Projetista passam a exibir `<Modelo> — <Extração>` em **vermelho** quando
    `Hafele` ou `Blum` for selecionado (mantendo `Ocultas`, `Não se aplica` e `—` em texto normal).
- **Testes existentes preservados:**
  - `T-V03`, `T-V04`, `T-V05`, `T-V06`, `T8`, `T9`, `TP-14`, `TP-16` e `TP-17` em
    `testes/V_pdf_projetista.test.js` continuam passando, pois usam `corredicas: null` (que segue
    imprimindo `'Corrediças'` e `'Resposta: —'` sem destaque).
  - `T10` a `T20` e `TP-06` a `TP-12` em `testes/V_validacao_projetista.test.js` usam
    `corredicas: 'Ocultas'` e continuam passando naturalmente.

---

## 10. Retrocompatibilidade com rascunhos já salvos

O rascunho do Projetista é salvo na chave `byarabi_checklist_vendedor` do navegador
(`FormProviderVendedor.jsx:8`). Efeitos verificados no código:

1. **Rascunho antigo com `corredicas: 'Ocultas'`:**
   - Continua sendo restaurado por `normalizarEstadoSalvo` (`FormProviderVendedor.jsx:25-58`),
     recebendo o novo campo de extração como `null`.
   - Como o botão principal permanece **`Ocultas`**, o botão já aparece marcado normalmente na tela,
     passa na validação, e exibe `Ocultas` em texto normal na Revisão e no PDF — sem qualquer
     tratamento especial de conversão.
2. **Rascunho antigo com `corredicas: 'não se aplica'`, `null` ou valor legado fora da lista:**
   - Continua se comportando exatamente como hoje (`Não se aplica` e valores já preenchidos diferentes
     de `Hafele`/`Blum` seguem válidos sem exigir subopção; `null` exige resposta ao clicar em
     `"Avançar"` e exibe `—` na Revisão).
3. **Sem migração destrutiva:** nenhum dado já salvo em `localStorage` é apagado.

---

## 11. O que NÃO será tocado

- **Perfil Cliente inteiro:** `src/steps/StepIdentificacao/`, `StepAmbientes/`,
  `StepPerguntasGlobais/`, `StepPerguntasPorAmbiente/`, `StepRevisao/`, `StepSucesso/`,
  `FormProvider.jsx`, `schema.js`, `scoreEngine.js`, `ccBuilder.js`, `pdf.js`, `importacaoPdf.js`.
- **Venda futura e telas iniciais:** `SelecaoPerfil.jsx`, `EscolhaProjetista.jsx`,
  `FormProviderFutura.jsx`, `StepRevisaoFutura.jsx`, `StepSucessoFutura.jsx`, `pdfFutura.js`.
- **CSS compartilhado com Venda futura:** `StepRevisaoVendedor.module.css` não será alterado (o
  destaque vermelho reaproveita `.linhaDestaque` já existente na linha `:59-61`).
- **Controlador da tela de perguntas (`StepPerguntasAmbienteVendedor.jsx`):** navegação, scroll até
  `.erro-campo`, limpeza de erros de puxadores e comportamento atual de limpeza de erros das
  perguntas fechadas permanecem intocados.
- **Funções locais `campoFechado` e demais perguntas de `FormGrupoA.jsx`, `FormGrupoB.jsx` e
  `FormGrupoC.jsx`:** as funções `campoFechado` desses três arquivos e o comportamento das demais
  perguntas que as usam (`tipoBalcao`, subperguntas de balcão, `fechamentoTeto`, `caixaria` e
  `dobradicas`) não mudam; apenas a pergunta `Corrediças` passa a ser desenhada pelo novo
  `BlocoCorredicasVendedor.jsx`.
- **Pergunta de Puxadores já implementada:** `BlocoPuxadoresVendedor.jsx`, `puxadoresVendedor.js`,
  `ComboboxEditavel.jsx` e seus testes (`V_puxadores.test.js`, `TP-01` a `TP-17`).
- **Demais campos do Projetista:** `alturaBalcao_mm`, `alturaArmario_mm` e `observacoes`.
- **Catálogo e agrupamento de ambientes:** `ambientes.js` e `gruposPerguntasVendedor.js`.
- **Identificação do Projetista** (`StepIdentificacaoVendedor.jsx`), seleção de ambientes
  (`StepAmbientesVendedor.jsx`), nome do arquivo PDF (`Checklist_Projetista_<CONTRATO>_<DATA>.pdf`),
  capa e chave de `localStorage`.
- **Scripts externos** em `c:\Users\Windows 10\AUTOMACOES`.

---

## 12. Premissas assumidas

- **P1.** A pergunta `Corrediças` continuará presente nos **3 grupos (A, B e C)**, cobrindo todos os
  8 ambientes do Projetista, na mesma ordem atual dentro de `"Acabamento e ferragens"`.
- **P2.** Não existe pontuação de risco nem Cliente Ciente no Perfil Projetista — esta feature não
  introduz score nem CCs.
- **P3.** A opção `Telescópicas` permanece removida (conforme `schemaVendedor.js:12`) e não volta
  nesta feature.
- **P4.** A subpergunta de extração (`Tipo de extração`) não possui botão `"Não se aplica"` — essa
  opção existe apenas na pergunta principal `Corrediças`.
- **P5.** As subopções de extração são sempre exibidas como **botões empilhados na vertical** (uma
  opção por linha) dentro de `.subperguntas`, sem `<select>` ou lista suspensa.
- **P6.** `Extração total` e `Tip-on` possuem exatamente os mesmos textos tanto em `Hafele` quanto
  em `Blum`.
- **P7.** Rascunhos antigos salvos com `corredicas: 'Ocultas'` (ou outro valor legado não nulo)
  permanecem 100% válidos após a publicação.
- **P8.** Os caracteres acentuados do português (`ç`, `ã` em `Corrediças` e `Extração`) são
  suportados normalmente na tela e no `jsPDF` (`helvetica` em `pdfVendedor.js`).

---

## 13. Riscos identificados

- **R1. Troca de modelo deixando subopção incompatível no estado.** Se o usuário marcar `Blum` →
  `Extração parcial` e depois trocar para `Hafele` (que não tem `Extração parcial`), sem limpeza ou
  checagem de compatibilidade o estado ficaria inconsistente (ou imprimiria `Hafele — Extração
  parcial` no PDF).
  - *Mitigação:* limpar a subopção para `null` sempre que o modelo mudar de fato (preservando ao
    clicar novamente no mesmo modelo) e validar em `validacaoVendedor.js` que a subopção pertence ao
    modelo selecionado.
- **R2. Duplicação entre `FormGrupoA`, `FormGrupoB`, `FormGrupoC`, `StepRevisaoVendedor` e
  `pdfVendedor`.** Como há 3 formulários e 2 listas `PERGUNTAS_POR_GRUPO`, alterar apenas parte
  deles geraria comportamento diferente entre ambientes ou entre Revisão e PDF.
  - *Mitigação:* centralizar catálogo, lógica de troca e formatação `{ texto, destaque, linhas }` em
    `src/domain/corredicasVendedor.js` e a UI de corrediças em um único bloco compartilhado
    (`BlocoCorredicasVendedor.jsx`) usado pelos 3 formulários, além de cobrir A, B e C nos testes.
- **R3. Quebra visual no celular com botões verticais.** Textos longos ou botões sem largura
  adequada dentro do bloco recuado `.subperguntas` podem quebrar ou ficar desalinhados em telas
  estreitas.
  - *Mitigação:* aplicar estilo vertical dedicado em `StepPerguntasAmbienteVendedor.module.css`
    com altura mínima `44px` e conferir em viewport mobile via `npm run dev`.
- **R4. Convivência na mesma branch `feat/balcoes-convencionais-editados`.** Alterações em arquivos
  já modificados na branch (`schemaVendedor.js`, `validacaoVendedor.js`, `FormGrupoA/B/C.jsx`,
  `StepRevisaoVendedor.jsx`, `pdfVendedor.js`) não podem regredir balcões nem puxadores.
  - *Mitigação:* rodar toda a suíte `npm test` (atualmente 167 testes) e `npm run build` em toda
    etapa.

---

## 14. Decisões fechadas (antes do Spec)

Todas as questões levantadas na primeira versão deste PRD foram fechadas pelo Everton e pelo
Revisor Externo:

- **Q1 — Nome do botão da corrediça padrão:** **Manter `Ocultas`** (plural, único valor, como já
  está na tela, no schema e no PDF).
- **Q2 — Acentuação:** marca **`Hafele`** sem trema; subopções com acentuação portuguesa padrão
  (**`Extração total`**, **`Extração parcial`**).
- **Q3 — Texto final de `Tip-on` (corrigido do erro de ditado `"Chip on"`):** **Opção C** —
  **`Tip-on`** em ambos os modelos (`Hafele` → `Extração total` / `Tip-on`; `Blum` → `Extração total`
  / `Tip-on` / `Extração parcial`).
- **Q4 — Subtítulo e referência visual:** exibir o subtítulo **`Tipo de extração`** acima dos botões
  empilhados na vertical, no mesmo estilo dos títulos das subperguntas dos balcões dentro de
  `.subperguntas`.
- **Q5 — Formatação na Revisão e no PDF:** **Opção A** — mesma linha com travessão `—`
  (Revisão: `Corrediças: Blum — Extração total`; PDF: `Corrediças` seguido de `Resposta: Blum —
  Extração total`; quando sem subopção, exibe apenas o modelo).
- **Q6 — Troca de modelo após marcar subopção:** **Opção A** — ao trocar de modelo, a subopção volta
  a ser `null`; tocar novamente no modelo já marcado **não** apaga a extração escolhida.
- **Q7 — Cor na Revisão e no PDF:** quando o modelo for **`Hafele`** ou **`Blum`** (mesmo sem
  subopção), exibe em **vermelho** (destaque de alerta) na Revisão e no PDF, reaproveitando o fluxo
  de `destaque: true` dos balcões editados. **`Ocultas`**, **`Não se aplica`** e **`—`** ficam em
  texto normal.

---

## 15. Critérios de aceitação

Legenda: **[Auto]** coberto por teste automatizado (`npm test`); **[Manual]** conferido na tela e
no PDF aberto com `npm run dev` (incluindo viewport mobile).

**Tela — opções principais, subopções verticais e independência entre ambientes**

- **CA-01 [Manual] — Opções principais aparecem nos 3 grupos (A, B e C).** Entrada: no Projetista,
  abrir um ambiente do grupo A (`Cozinha`), um do grupo B (`Dormitório Casal`) e um do grupo C
  (`Home / Sala`). Esperado: nos três grupos, a pergunta **`Corrediças`** exibe os 4 botões
  (`Ocultas`, `Hafele`, `Blum`, `Não se aplica`), nenhum pré-marcado, na mesma posição atual dentro
  de `"Acabamento e ferragens"`.
- **CA-02 [Manual] — `Ocultas` e `Não se aplica` não abrem subopções.** Entrada: tocar em `Ocultas`
  e depois em `Não se aplica`. Esperado: o botão selecionado fica ativo e nada novo aparece abaixo
  de `Corrediças`.
- **CA-03 [Manual] — `Hafele` abre 2 subopções empilhadas na vertical.** Entrada: tocar em `Hafele`.
  Esperado: abre o bloco recuado com borda esquerda (estilo `.subperguntas` dos balcões) com o
  subtítulo **`Tipo de extração`** e **2 botões empilhados na vertical** (um abaixo do outro, sem
  lista suspensa e sem botão `"Não se aplica"`): **`Extração total`** e **`Tip-on`**, nenhum
  marcado inicialmente.
- **CA-04 [Manual] — `Blum` abre 3 subopções empilhadas na vertical.** Entrada: tocar em `Blum`.
  Esperado: abre o bloco recuado com borda esquerda (estilo `.subperguntas` dos balcões) com o
  subtítulo **`Tipo de extração`** e **3 botões empilhados na vertical** (um abaixo do outro, sem
  lista suspensa e sem botão `"Não se aplica"`): **`Extração total`**, **`Tip-on`** e **`Extração
  parcial`**, nenhum marcado inicialmente.
- **CA-05 [Auto + Manual] — Troca de modelo limpa subopção; clicar no mesmo modelo preserva.**
  Entrada: na `Cozinha`, marcar `Blum` → `Extração parcial`; tocar de novo em `Blum`; depois trocar
  para `Hafele`; e no `Dormitório Casal` marcar `Ocultas`. Esperado: tocar de novo em `Blum` **não**
  apaga `Extração parcial`; ao trocar para `Hafele`, a subopção volta para `null` e aparecem apenas
  as 2 opções da `Hafele` (`Extração total` e `Tip-on`) desmarcadas; ao voltar à `Cozinha`, ela
  mantém sua seleção independente do `Dormitório Casal`.

**Validação (erros)**

- **CA-06 [Auto] — `Corrediças` sem resposta bloqueia nos grupos A, B e C.** Entrada: ambiente
  completo do grupo A, B ou C com `corredicas` `null` (ou `undefined`); clicar em `"Avançar"`.
  Esperado: bloqueia exibindo `Responda esta pergunta ou marque "Não se aplica"` em `corredicas`;
  demais campos válidos permanecem sem erro ([Manual] para scroll automático até `.erro-campo` e
  permanência do erro até novo clique em `"Avançar"`).
- **CA-07 [Auto] — `Ocultas`, `Não se aplica` e valor legado liberam o avanço sem subopção.**
  Entrada: ambiente completo de A, B ou C com `corredicas` = `'Ocultas'`, `'não se aplica'` ou outro
  valor preenchido que não seja `'Hafele'` nem `'Blum'`, sem subopção preenchida. Esperado: avança
  sem erro (`{}`).
- **CA-08 [Auto] — `Hafele` sem subopção bloqueia; com uma das 2 opções válidas libera.** Entrada:
  - (a) `corredicas` = `'Hafele'` com subopção `null` ou vazia → bloqueia com erro específico na
    subopção de extração;
  - (b) `corredicas` = `'Hafele'` com `'Extração parcial'` (opção exclusiva da `Blum`) → bloqueia
    com erro na subopção por incompatibilidade;
  - (c) `corredicas` = `'Hafele'` com `'Extração total'` ou `'Tip-on'` → avança sem erro nos grupos
    A, B e C.
- **CA-09 [Auto] — `Blum` sem subopção bloqueia; com uma das 3 opções válidas libera.** Entrada:
  - (a) `corredicas` = `'Blum'` com subopção `null` ou vazia → bloqueia com erro específico na
    subopção de extração;
  - (b) `corredicas` = `'Blum'` com `'Extração total'`, `'Tip-on'` ou `'Extração parcial'` → avança
    sem erro nos grupos A, B e C.
- **CA-10 [Auto] — Regras existentes do Projetista intactas.** Entrada: validações anteriores do
  grupo A (alturas de piso, balcões convencionais/editados, fechamento, caixaria, dobradiças,
  puxadores) e dos grupos B e C. Esperado: mesmas mensagens e bloqueios de hoje.

**Revisão, PDF do Projetista e rascunho antigo**

- **CA-11 [Auto texto e ausência de destaque no PDF; Manual Revisão] — `Ocultas`, `Não se aplica` e
  `—` em texto normal.** Entrada: ambiente A, B ou C com `corredicas` = `'Ocultas'`, `'não se
  aplica'` ou `null`. Esperado: Revisão e PDF exibem `Ocultas`, `Não se aplica` ou `—`, sem
  subopção e **sem destaque vermelho** (`destaque: false`, cor preta no PDF).
- **CA-12 [Auto texto e destaque vermelho no PDF; Manual Revisão] — `Hafele` e `Blum` exibem
  `<Modelo> — <Extração>` em vermelho.** Entrada: ambiente A com `Hafele` + `Extração total`,
  ambiente B com `Hafele` + `Tip-on` e ambiente C com `Blum` + `Extração parcial`. Esperado:
  - Revisão exibe `Corrediças: Hafele — Extração total`, `Corrediças: Hafele — Tip-on` e
    `Corrediças: Blum — Extração parcial` na mesma linha com `.linhaDestaque` (vermelho).
  - PDF exibe `Corrediças` e `Resposta: Hafele — Extração total`, `Resposta: Hafele — Tip-on` e
    `Resposta: Blum — Extração parcial` em vermelho (`COR_ALERTA`), mantendo a ordem das perguntas e
    `Observações do ambiente` intactas.
  - Teste automatizado dedicado confere `destaque: true` na função pura e a cor vermelha aplicada
    no PDF para `Hafele` e `Blum` (e `destaque: false` / texto preto para `Ocultas`, `Não se aplica`
    e `—`).
- **CA-13 [Auto + Manual] — Rascunho antigo com `corredicas: 'Ocultas'` continua válido.**
  Entrada: rascunho salvo antes da mudança em `byarabi_checklist_vendedor` contendo ambiente com
  `corredicas: 'Ocultas'` (sem campo de extração). Esperado: restaura sem erro de JavaScript,
  aparece marcado como `Ocultas`, permite avançar normalmente na validação, exibe na Revisão e
  imprime no PDF em texto normal; rascunho antigo com `corredicas: null` na Revisão exibe `—` sem
  erro.
- **CA-14 [Auto] — Ambiente com `Hafele` ou `Blum` sem subopção (estado incompleto na Revisão/PDF)
  exibe só o modelo em vermelho e não quebra.** Entrada: estado com `corredicas: 'Blum'` (ou
  `'Hafele'`) e subopção `null` aberto direto na Revisão/PDF. Esperado: sem crash e sem texto
  `'null'` ou `'undefined'` — exibe apenas `'Blum'` (ou `'Hafele'`), com `destaque: true`
  (vermelho).

**Isolamento e regressão**

- **CA-15 [Manual] — Perfil Cliente, Venda futura, `campoFechado` de outras perguntas e Puxadores
  intocados.** Entrada: percorrer o fluxo Cliente (`/identificacao` até `/revisao`), `/futura/*` e
  testar `Dobradiças`, `Caixaria`, `Fechamento até o teto`, `Balcões` e `Tem puxador?` no
  Projetista. Esperado: nenhuma alteração fora de `Corrediças`.
- **CA-16 [Auto] — Suíte completa e build verdes.** Entrada: `npm test` e `npm run build`. Esperado:
  todos os testes passam (0 falhas, 0 pulados) e o build compila sem erros.

---

## 16. Documentos a revisar depois da implementação

- `CLAUDE.md` do projeto: ao concluir a implementação, perguntar ao Everton se deseja atualizar a
  linha de `src/domain/` (`CLAUDE.md:59`) para citar `corredicasVendedor.js`, mantendo o arquivo
  abaixo de ~100 linhas.
- `PRDS_E_SPECS/`: se desejado pelo Everton após a conclusão, mover os pares `PRD_*` / `SPEC_*` da
  raiz para `PRDS_E_SPECS/`.
