# SPEC — Checklist do Vendedor (front-end: "Formulário do Projetista")

**Documento:** Especificação Técnica de Implementação
**Baseado em:** `PRDS_E_SPECS/PRD_CHECKLIST_VENDEDOR.md` (referência primária, sem pendências — Seção 15)
**Referência de estilo:** `PRDS_E_SPECS/SPEC_CHECKLIST_DINAMICA_CLIENTE.md`
**Status:** Aguardando aprovação antes do início da implementação
**Regra de conflito:** onde este Spec e o código real hoje divergem de alguma frase do PRD, o **código prevalece**; divergências estão listadas na Seção 12 ("Observações").

> **Nota de nomenclatura (obrigatória em toda a implementação):** front-end sempre
> "Projetista" (rótulos, títulos de tela, texto do PDF, nome do arquivo do PDF).
> Código/arquivos internos sempre "vendedor" (rota `/vendedor/*`, provedor de estado,
> chave de `localStorage`, nomes de componente/arquivo). A palavra "Vendedor" nunca
> aparece em texto visível nas telas **novas** desta feature — o botão de ajuda
> "Vendedor" pré-existente do `BottomBar` (falando de uma pessoa, no fluxo do cliente)
> não é afetado por esta regra e continua como está.

---

## 1. Visão Geral

Segunda "porta de entrada" do mesmo SPA React + Vite + HashRouter, sem backend, hospedado
no GitHub Pages. Uma tela de seleção na raiz (`"/"`) passa a existir com dois botões —
"Cliente" e "Projetista" — substituindo o redirecionamento automático que hoje leva
direto a `/identificacao`.

O ramo novo (`/vendedor/*`, nome interno) é um segundo formulário multi-etapas,
**totalmente independente** do fluxo do cliente (estado, `localStorage`, navegação,
regras de negócio), que coleta dados técnicos de fabricação por ambiente e gera um PDF
de relatório simples — sem score, sem CCs, sem qualquer IA — no mesmo padrão visual de
capa usado pelo PDF do cliente.

---

## 2. Stack Técnica

Idêntica à já usada no projeto (ver `SPEC_CHECKLIST_DINAMICA_CLIENTE.md`, Seção 2):
React + Vite, HashRouter, Context API + `useReducer`, CSS Modules, jsPDF +
jspdf-autotable, `localStorage`, JavaScript sem TypeScript. Nenhuma dependência nova é
introduzida por esta feature.

---

## 3. Estrutura de Pastas e Arquivos

**Hoje** (`src/`, confirmado por leitura direta do código):

```
src/
├── App.jsx                                   # HashRouter → FormProvider (sempre montado) → AppLayout
├── context/
│   ├── FormContext.js                        # createContext + useFormContext (lança erro fora do Provider)
│   └── FormProvider.jsx                      # useReducer + localStorage, chave "byarabi_checklist_rascunho"
├── domain/
│   ├── schema.js                             # estadoInicial + defaultsPorFormType
│   ├── ambientes.js                          # AMBIENTES_DISPONIVEIS + formatarNomeAmbiente
│   ├── scoreEngine.js
│   ├── ccBuilder.js
│   └── checklistTextos.js
├── services/
│   ├── cep.js
│   └── pdf.js                                # gerarPdf(state) — nome: Checklist_ByArabi_{contrato}_{data}.pdf
├── components/
│   ├── Header/Header.jsx                     # <header>{logo}{etapaAtual}</header> — sem props extras
│   ├── Stepper/Stepper.jsx                   # (etapaNumero, totalEtapas, nomeEtapa) — retorna null se !etapaNumero
│   ├── BottomBar/BottomBar.jsx               # (onVoltar, onAvancar, avancarLabel, avancarDisabled, voltarLabel, semVoltar) — SEM prop de ocultar botão "Vendedor" ainda
│   ├── Modal/Modal.jsx
│   └── FieldGroup/FieldGroup.jsx
├── steps/
│   ├── StepIdentificacao/StepIdentificacao.jsx   # nome, contrato (regex IT|SM|TA|PIN|STA + números), CEP/endereço completo, telefone
│   ├── StepAmbientes/StepAmbientes.jsx           # +/- por AMBIENTES_DISPONIVEIS, nome custom quando qtd>1 (ou "outros")
│   ├── StepPerguntasGlobais/...
│   ├── StepPerguntasPorAmbiente/...
│   ├── StepRevisao/StepRevisao.jsx
│   └── StepSucesso/StepSucesso.jsx
└── utils/scrollUtils.js
```

**Depois** (arquivos novos desta feature; nada listado acima é removido):

```
src/
├── App.jsx                                          # REESCRITO — ver Seção 5
│
├── screens/
│   └── SelecaoPerfil/
│       ├── SelecaoPerfil.jsx                        # NOVO — tela "/" com botões "Cliente" / "Projetista"
│       └── SelecaoPerfil.module.css                 # NOVO
│
├── context/
│   ├── FormContextVendedor.js                       # NOVO — espelha FormContext.js
│   └── FormProviderVendedor.jsx                     # NOVO — espelha FormProvider.jsx, chave própria
│
├── domain/
│   ├── schemaVendedor.js                             # NOVO — estadoInicialVendedor + defaultsPorGrupo (A/B/C)
│   └── gruposPerguntasVendedor.js                    # NOVO — mapa ambienteId → "A" | "B" | "C" (lê apenas ambientes.js)
│
├── services/
│   └── pdfVendedor.js                                # NOVO — gerarPdfVendedor(state)
│
├── steps/vendedor/
│   ├── StepIdentificacaoVendedor/
│   │   ├── StepIdentificacaoVendedor.jsx             # NOVO — contrato(s) + nome do cliente
│   │   └── StepIdentificacaoVendedor.module.css
│   ├── StepAmbientesVendedor/
│   │   ├── StepAmbientesVendedor.jsx                 # NOVO — mesma lógica de StepAmbientes.jsx, ação/estado próprios
│   │   └── StepAmbientesVendedor.module.css
│   ├── StepPerguntasAmbienteVendedor/
│   │   ├── StepPerguntasAmbienteVendedor.jsx         # NOVO — lê grupo (A/B/C) e renderiza o formulário correspondente
│   │   ├── FormGrupoA.jsx                            # NOVO — Cozinha/A.S./Varanda, Banheiro, Outros
│   │   ├── FormGrupoB.jsx                             # NOVO — Dormitório Casal, Dormitório Solteiro
│   │   ├── FormGrupoC.jsx                             # NOVO — Home/Sala, Office
│   │   └── StepPerguntasAmbienteVendedor.module.css
│   ├── StepRevisaoVendedor/
│   │   ├── StepRevisaoVendedor.jsx                   # NOVO — apenas confirmação + botão "Gerar PDF"
│   │   └── StepRevisaoVendedor.module.css
│   └── StepSucessoVendedor/
│       ├── StepSucessoVendedor.jsx                   # NOVO
│       └── StepSucessoVendedor.module.css
│
└── components/
    └── BottomBar/BottomBar.jsx                       # ALTERADO (aditivo) — ver Seção 8
```

**Arquivos explicitamente NÃO tocados** (confere com PRD Seção 10, confirmado por leitura
do código): `domain/ambientes.js`, `domain/schema.js`, `domain/scoreEngine.js`,
`domain/ccBuilder.js`, `domain/checklistTextos.js`, `services/pdf.js`,
`services/cep.js`, `context/FormContext.js`, `context/FormProvider.jsx`, todo
`steps/Step*` do cliente, `components/Header`, `components/Stepper`, `components/Modal`,
`components/FieldGroup` (usados como estão, sem alteração).

---

## 4. Domínio do Projetista

### 4.1 Classificação por grupo (`domain/gruposPerguntasVendedor.js`)

```js
import { AMBIENTES_DISPONIVEIS } from './ambientes.js'

export const GRUPO_POR_AMBIENTE = {
  cozinha:              'A',
  varanda:              'A',
  banheiro:             'A',
  outros:                'A',
  dormitorio_casal:      'B',
  dormitorio_solteiro:   'B',
  home:                  'C',
  office:                'C',
}

export function obterGrupo(ambienteId) {
  return GRUPO_POR_AMBIENTE[ambienteId] ?? 'A'
}
```

Este mapa é **novo e próprio** do Projetista; lê `AMBIENTES_DISPONIVEIS` apenas para
garantir que os 8 ids existam, nunca o modifica. Cobre CA-03 a CA-06 do PRD.

### 4.2 Schema do estado (`domain/schemaVendedor.js`)

```js
export const defaultsPorGrupo = {
  A: {
    alturaBalcao_mm: null,        // number | "não se aplica" | null (não respondido)
    alturaArmario_mm: null,       // number | "não se aplica" | null
    fechamentoTeto: null,         // "SIM" | "NAO" | "não se aplica" | null
    caixaria: null,               // "MDP" | "MDF" | "não se aplica" | null
    dobradicas: null,             // "Convencionais" | "Amortecimento" | "não se aplica" | null
    corredicas: null,             // "Telescópicas" | "Ocultas" | "não se aplica" | null
    observacoes: '',              // opcional, texto livre, máx. 300 chars
  },
  B: {
    caixaria: null,
    dobradicas: null,
    corredicas: null,
    fechamentoTeto: null,
    observacoes: '',
  },
  C: {
    caixaria: null,
    dobradicas: null,
    corredicas: null,
    observacoes: '',
  },
}

export const estadoInicialVendedor = {
  _meta: {
    etapaAtual: 'identificacao',
    origemNavegacao: null,
    criadoEm: null,
    atualizadoEm: null,
  },
  identificacao: {
    contratos: [''],   // sempre ao menos 1 posição; "+" adiciona strings vazias ao array
    nome: '',
  },
  ambientesSelecionados: [],   // mesmo formato de instância do cliente: { instanceId, tipo, label, nome }
  respostasPorAmbiente: {},    // chaveado por instanceId, valor = defaultsPorGrupo[grupo]
}
```

**Regra de "campo não respondido" (crítica para CA-09):** todo campo de escolha
fechada e todo campo de altura nasce como `null`. `null` nunca é uma resposta válida
para avançar — apenas três formas contam como resposta: (a) uma das opções fechadas,
(b) um número válido no campo de altura, (c) a string literal `"não se aplica"`. Essa
distinção elimina a ambiguidade descrita como risco 10 do PRD.

Não existe um "formType" redundante nas instâncias do Projetista — o grupo (A/B/C) é
sempre derivado on-the-fly via `obterGrupo(instancia.tipo)`, nunca persistido no
estado, para impedir divergência entre o grupo gravado e o mapa vigente.

---

## 5. `App.jsx` — Roteamento e Composição (mudança estrutural)

**Hoje:** `HashRouter → FormProvider (cliente, sempre montado) → AppLayout`, onde
`AppLayout` contém `<Routes>` com `"/"` → `<Navigate to="/identificacao" />` e as demais
6 rotas do cliente.

**Depois:** o `FormProvider` do cliente deixa de envolver a aplicação inteira. Vira uma
**rota de layout** (React Router v6 "pathless layout route", usando `<Outlet/>`),
irmã de uma rota de layout equivalente para o Projetista, ambas irmãs da rota `"/"`.
Isso preserva 100% do comportamento do cliente (inclusive o diálogo "continuar de onde
parou", que roda dentro do `FormProvider` antes do `<Outlet/>` montar qualquer etapa) e
evita montar qualquer estado antes de o usuário escolher um perfil na tela de seleção.

```jsx
// App.jsx (estrutura proposta)
function ClienteLayoutRoute() {
  return (
    <FormProvider>
      <AppLayoutCliente />           {/* hoje chamado "AppLayout" — mesmo conteúdo, com <Outlet/> no lugar de <Routes>...</Routes> internas às rotas do cliente */}
    </FormProvider>
  )
}

function VendedorLayoutRoute() {
  return (
    <FormProviderVendedor>
      <AppLayoutVendedor />
    </FormProviderVendedor>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SelecaoPerfil />} />

        <Route element={<ClienteLayoutRoute />}>
          <Route path="identificacao" element={<StepIdentificacao />} />
          <Route path="ambientes" element={<StepAmbientes />} />
          <Route path="globais" element={<StepPerguntasGlobais />} />
          <Route path="ambiente/:instanceId" element={<StepPerguntasPorAmbiente />} />
          <Route path="revisao" element={<StepRevisao />} />
          <Route path="sucesso" element={<StepSucesso />} />
        </Route>

        <Route path="vendedor" element={<VendedorLayoutRoute />}>
          <Route path="identificacao" element={<StepIdentificacaoVendedor />} />
          <Route path="ambientes" element={<StepAmbientesVendedor />} />
          <Route path="ambiente/:instanceId" element={<StepPerguntasAmbienteVendedor />} />
          <Route path="revisao" element={<StepRevisaoVendedor />} />
          <Route path="sucesso" element={<StepSucessoVendedor />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
```

Pontos de atenção obrigatórios na implementação (mitigação do risco 1 do PRD):
1. `AppLayoutCliente` deve ser **o mesmo componente hoje chamado `AppLayout`**, apenas
   trocando `<Routes>{...}</Routes>` (que hoje inclui a rota `"/"`) por `<Outlet/>`, e
   removendo a rota `"/"` de dentro dele — ela já não pertence a este layout.
2. Todo o cálculo de `totalEtapas`, `ROTAS_ETAPA` e `mostrarStepper` em `AppLayoutCliente`
   permanece **idêntico** ao `AppLayout` de hoje — nenhuma dessas contas muda.
3. `ClienteLayoutRoute` não recebe `path` (rota "pathless"); os filhos usam caminho
   relativo sem barra inicial (`"identificacao"`, não `"/identificacao"`), do jeito que
   o React Router v6 exige para rotas de layout aninhadas — a URL final continua
   `#/identificacao` etc., sem nenhuma mudança de link/bookmark existente.
4. `VendedorLayoutRoute` segue o mesmo padrão, mas com `path="vendedor"` (não
   pathless), então seus filhos ficam em `#/vendedor/identificacao`,
   `#/vendedor/ambientes` etc.
5. `AppLayoutVendedor` é um componente **novo**, próprio, análogo ao `AppLayoutCliente`
   — cabeçalho (`Header`), `Stepper` (reaproveitado) e `<Outlet/>` — calculando seu
   próprio `totalEtapas` (Seção 6.5) e mapa de rotas, sem tocar em `ROTAS_ETAPA` do
   cliente.

---

## 6. Telas do Projetista

### 6.1 `SelecaoPerfil` (`screens/SelecaoPerfil/SelecaoPerfil.jsx`)

- Rota `"/"`. Sem `useFormContext` de nenhum dos dois formulários — não depende de
  nenhum provedor.
- Conteúdo: logo/identidade "By Arabi Planejados" (mesma marca visual do `Header`, sem
  reaproveitar o componente `Header` em si, pois ele exige contexto de etapa) + dois
  botões: **"Cliente"** (`navigate('/identificacao')`) e **"Projetista"**
  (`navigate('/vendedor/identificacao')`). Cobre CA-01 e CA-02.

### 6.2 `StepIdentificacaoVendedor`

Campos:
- **Nome completo do cliente** — obrigatório, mesmo padrão de validação "não vazio" do
  campo `nome` do cliente.
- **Contrato(s)** — array `identificacao.contratos`. O primeiro campo é sempre
  renderizado e **nunca pode ser removido** (o array precisa ter no mínimo uma posição,
  conforme `estadoInicialVendedor` — Seção 4.2). Botão **"+ Adicionar contrato"**
  empurra uma nova string vazia no array e renderiza mais um campo. A partir do
  segundo contrato (índice ≥ 1), cada campo exibe também um botão **"−" (remover)** ao
  lado — ou seja, o botão de remover só aparece quando há mais de um contrato na
  tela. Clicar em "−" tira aquela posição do array `contratos` e re-renderiza os
  campos restantes. **Decisão revogada em relação à primeira versão deste Spec:** a
  versão anterior não previa remoção ("sem ação de remoção, fora de escopo"); isso foi
  corrigido porque, sem um botão "−", um contrato adicionado por engano ficava preso —
  o campo extra vazio bloqueia o avanço (regra abaixo) e não havia forma de apagá-lo
  a não ser digitar um contrato falso, o que sujaria o dado. Cada posição do array é
  validada com a mesma regex já usada em `StepIdentificacao.jsx` do cliente:
  `const REGEX_CONTRATO = /^(IT|SM|TA|PIN|STA)\d+$/` — **duplicada** neste novo
  arquivo (ver Seção 12, observação sobre duplicação intencional — mantida,
  reconfirmada), nunca importada de `StepIdentificacao.jsx`, para não criar
  acoplamento nem exigir alterar um arquivo do cliente listado como "não tocado".

  > **Padrão visual do botão "−" (verificado no código antes de decidir):**
  > `StepIdentificacao.jsx` do cliente não tem nenhum campo repetível — lá, contrato é
  > um único campo, sem array — logo não existe no fluxo do cliente nenhum padrão de
  > "remover item de uma lista de campos" para reaproveitar. O precedente mais próximo
  > encontrado no projeto é o controle de quantidade `+`/`−` de `StepAmbientes.jsx`
  > (classe `styles.qtdControle`, botões `<button>−</button>`/`<button>+</button>`),
  > mas ele é um **contador compartilhado** (incrementa/decrementa um número e
  > instâncias aparecem/somem conforme a contagem), não um botão de remoção por item
  > de uma lista de campos de texto — não é exatamente o mesmo caso de uso. Na
  > ausência de um precedente idêntico, o botão "−" do contrato adota o **mesmo
  > estilo visual do botão "+ Adicionar contrato"** já especificado acima (mesma
  > classe/família de botão secundário), reaproveitando apenas o **glifo "−"** já
  > estabelecido no projeto (de `StepAmbientes.jsx`) para manter consistência de
  > símbolo, posicionado inline ao lado de cada campo de contrato removível.
- Avanço bloqueado se o nome estiver vazio **ou** qualquer posição de `contratos`
  estiver vazia/inválida — mensagem de erro por campo, no padrão visual de
  `StepIdentificacao.jsx` (`erro-campo`). Cobre CA-10, CA-11 e CA-17.
- Sem campo de endereço/telefone (confirmado PRD Seção 5 — "sem repetir
  endereço/telefone do cliente").
- Usa `BottomBar` com `semVoltar` e `mostrarBotaoVendedor={false}`.

Ações no reducer: `SET_IDENTIFICACAO_VENDEDOR_NOME { valor }`,
`SET_IDENTIFICACAO_VENDEDOR_CONTRATO { index, valor }`,
`ADD_CONTRATO_VENDEDOR`, `REMOVE_CONTRATO_VENDEDOR { index }` (Seção 7.3).

### 6.3 `StepAmbientesVendedor`

Réplica funcional de `StepAmbientes.jsx` do cliente: mesmos 8 itens de
`AMBIENTES_DISPONIVEIS`, mesmos controles `+`/`−`, mesma regra de exibir campo de nome
apenas quando `qtd > 1` (ou sempre para `"outros"`, replicando a regra hoje existente
em `StepAmbientes.jsx`, linha do JSX: `qtd > 1 || (qtd === 1 && amb.id === 'outros')`).
Despacha `SET_AMBIENTE_QUANTIDADE_VENDEDOR` / `SET_AMBIENTE_NOME_VENDEDOR` no reducer
próprio. Avanço bloqueado se nenhum ambiente selecionado. `BottomBar` com
`mostrarBotaoVendedor={false}`.

### 6.4 `StepPerguntasAmbienteVendedor` + `FormGrupoA` / `FormGrupoB` / `FormGrupoC`

`StepPerguntasAmbienteVendedor` lê `instanceId` da URL (mesmo padrão de
`StepPerguntasPorAmbiente.jsx`), localiza a instância em
`state.ambientesSelecionados`, calcula `grupo = obterGrupo(instancia.tipo)` e
renderiza `FormGrupoA`, `FormGrupoB` ou `FormGrupoC` conforme o valor.

**Campos e regras comuns aos três grupos** (validação de avanço — cobre CA-07, CA-08,
CA-09):
- Toda pergunta de escolha fechada é obrigatória: renderizada como grupo de botões de
  opção (as opções do Word) **mais** um botão "Não se aplica". Exatamente uma opção
  marcada por vez. Bloqueia avanço se nenhuma estiver marcada.
- Todo campo de altura (`Grupo A` apenas) é um `<input type="number" inputMode="numeric">`
  com sufixo visível `"mm"` ao lado, mais um checkbox/botão **"Não se aplica"**
  adjacente. Quando marcado: o input é desabilitado, seu valor em memória é limpo, e o
  campo passa a valer literalmente a string `"não se aplica"`. Quando desmarcado: o
  input volta a ser exigido (`> 0`, número inteiro). Bloqueia avanço se nem número
  válido nem "não se aplica" estiverem presentes.
- "Observações do ambiente": `<textarea>` opcional, `maxLength=300`, placeholder de
  exemplo (mesmo padrão de "Observações" do cliente). Nunca bloqueia avanço.

**`FormGrupoA`** — usado por Cozinha/Área de Serviço/Varanda, Banheiro, Outros:
1. Altura do piso — balcões (mm, com "não se aplica")
2. Altura do piso — armários (mm, com "não se aplica")
3. Haverá fechamento até o teto? (SIM / NÃO / não se aplica)
4. Caixarias ou corpos (MDP / MDF / não se aplica)
5. Dobradiças (Convencionais / Amortecimento / não se aplica)
6. Corrediças (Telescópicas / Ocultas / não se aplica)
7. Observações do ambiente

**`FormGrupoB`** — Dormitório Casal, Dormitório Solteiro:
1. Caixarias ou corpos
2. Dobradiças
3. Corrediças
4. Haverá fechamento até o teto?
5. Observações do ambiente

**`FormGrupoC`** — Home/Sala, Office:
1. Caixarias ou corpos
2. Dobradiças
3. Corrediças
4. Observações do ambiente

Navegação entre instâncias segue a mesma sequência de
`state.ambientesSelecionados` do padrão do cliente (avançar no último ambiente vai
para `/vendedor/revisao`; voltar no primeiro vai para `/vendedor/ambientes`).
`BottomBar` com `mostrarBotaoVendedor={false}`.

Ação no reducer: `SET_RESPOSTA_AMBIENTE_VENDEDOR { instanceId, campo, valor }`.

### 6.5 `AppLayoutVendedor` — Stepper do Projetista

Reaproveita `components/Stepper/Stepper.jsx` sem alteração. Cálculo de etapas:
`totalEtapas = 2 + N` (2 etapas fixas — Identificação, Ambientes — mais N = quantidade
de ambientes selecionados; **não há etapa "Globais"** no Projetista, consistente com a
ausência de perguntas gerais no PRD). `StepRevisaoVendedor` e `StepSucessoVendedor` não
exibem número de etapa, mesmo padrão do cliente.

### 6.6 `StepRevisaoVendedor`

- Lista simples de conferência: identificação (nome + contratos) e, por ambiente,
  pergunta → resposta já preenchida (incluindo "não se aplica" e unidade "mm" onde
  aplicável) — **sem** `ScoreBadge`, sem CCs, sem "Resumo Executivo" (não há
  `scoreEngine`/`ccBuilder` no fluxo do Projetista, Seção 4 do PRD).
- Botão "Gerar PDF" → chama `gerarPdfVendedor(state)`.
- Geração bloqueada com mensagem de erro se `state.ambientesSelecionados` estiver vazio
  — nenhum arquivo é baixado (CA-12).
- Se `gerarPdfVendedor` lançar exceção: mesma UX do cliente — mensagem de erro +
  "Tentar novamente".
- `BottomBar` com `mostrarBotaoVendedor={false}`.

### 6.7 `StepSucessoVendedor`

- Mesma estrutura de `StepSucesso.jsx` do cliente, adaptada ao texto do Projetista
  (sem a palavra "Vendedor" em texto visível). Botão "Iniciar novo preenchimento" →
  `dispatch(RESET_STATE_VENDEDOR)` (limpa a chave própria de `localStorage`) →
  `navigate('/vendedor/identificacao')`.

---

## 7. Context e Reducer do Projetista

### 7.1 `FormContextVendedor.js`
Espelha `FormContext.js`: `createContext(null)` + `useFormContextVendedor()` que lança
erro se usado fora do `FormProviderVendedor`.

### 7.2 `FormProviderVendedor.jsx`
Espelha `FormProvider.jsx` linha a linha (mesma abordagem de `useReducer` +
sincronização por `useEffect` + diálogo "Continuar de onde parou?" com os mesmos dois
botões), com estas diferenças:
- `STORAGE_KEY = 'byarabi_checklist_vendedor'` (chave exclusiva — cobre CA-15 e risco 7
  do PRD).
- Estado inicial vem de `schemaVendedor.js` (`estadoInicialVendedor`,
  `defaultsPorGrupo`), não de `schema.js`.
- `normalizarEstadoSalvo` usa `obterGrupo(instancia.tipo)` (em vez de
  `instancia.formType`) para escolher os defaults ao reidratar
  `respostasPorAmbiente`.
- Rota de fallback ao "começar do zero" é `/vendedor/identificacao`, não
  `/identificacao`.

### 7.3 Ações do reducer (tabela)

| Tipo | Payload | Efeito |
|---|---|---|
| `SET_IDENTIFICACAO_VENDEDOR_NOME` | `{ valor }` | Atualiza `identificacao.nome` |
| `SET_IDENTIFICACAO_VENDEDOR_CONTRATO` | `{ index, valor }` | Atualiza `identificacao.contratos[index]` |
| `ADD_CONTRATO_VENDEDOR` | — | `identificacao.contratos.push('')` |
| `REMOVE_CONTRATO_VENDEDOR` | `{ index }` | Remove a posição `index` de `identificacao.contratos` (ação não disponível para `index === 0` — botão "−" não é renderizado no primeiro contrato) |
| `SET_AMBIENTE_QUANTIDADE_VENDEDOR` | `{ ambienteId, quantidade }` | Reconstrói instâncias (mesma lógica de índice `{ambienteId}-{i}` do cliente); inicializa `respostasPorAmbiente[instanceId]` com `defaultsPorGrupo[obterGrupo(ambienteId)]` |
| `SET_AMBIENTE_NOME_VENDEDOR` | `{ instanceId, nome }` | Atualiza `nome` de uma instância |
| `SET_RESPOSTA_AMBIENTE_VENDEDOR` | `{ instanceId, campo, valor }` | Atualiza campo em `respostasPorAmbiente[instanceId]` |
| `SET_META_VENDEDOR` | `{ campo, valor }` | Atualiza campo em `state._meta` |
| `RESTORE_STATE_VENDEDOR` | `estadoCompleto` | Carrega estado salvo do `localStorage` próprio |
| `RESET_STATE_VENDEDOR` | — | Volta ao `estadoInicialVendedor`, limpa a chave `byarabi_checklist_vendedor` |

---

## 8. `BottomBar.jsx` — única alteração em arquivo compartilhado

Assinatura atual (confirmada por leitura):

```js
export function BottomBar({ onVoltar, onAvancar, avancarLabel = 'Avançar', avancarDisabled = false, voltarLabel = 'Voltar', semVoltar = false })
```

Alteração aditiva:

```js
export function BottomBar({
  onVoltar, onAvancar, avancarLabel = 'Avançar', avancarDisabled = false,
  voltarLabel = 'Voltar', semVoltar = false,
  mostrarBotaoVendedor = true,          // NOVO
}) {
  ...
  {mostrarBotaoVendedor && (
    <button className={styles.btnVendedor} type="button" onClick={() => setModalAberto(true)}>
      Vendedor
    </button>
  )}
  ...
  {mostrarBotaoVendedor && (
    <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)}>
      {/* texto e botão do modal inalterados */}
    </Modal>
  )}
}
```

Os 4 call sites do cliente (`StepIdentificacao.jsx`, `StepAmbientes.jsx`,
`StepPerguntasGlobais.jsx`, `StepPerguntasPorAmbiente.jsx`) **não são modificados** —
default `true` preserva o comportamento visível hoje (cobre CA-16). Os 5 call sites
novos do Projetista (`StepIdentificacaoVendedor`, `StepAmbientesVendedor`,
`StepPerguntasAmbienteVendedor`, `StepRevisaoVendedor` — se usar `BottomBar` — e
qualquer outro que o reaproveite) passam `mostrarBotaoVendedor={false}` explicitamente.

---

## 9. PDF do Projetista (`services/pdfVendedor.js`)

Gerador **próprio**, não reaproveita `services/pdf.js` como está — reaproveita apenas o
padrão visual (jsPDF + jspdf-autotable, capa "By Arabi Planejados" em fonte serifada,
linha divisória dourada, mesmas margens/`pageWidth`/`garantirEspaco` como padrão de
paginação).

### 9.1 Capa
- "By Arabi Planejados" (título, `times bold`).
- Subtítulo: "Checklist do Projetista" (front-end facing — nunca "Vendedor").
- Cliente: `state.identificacao.nome`.
- Contrato(s): todos os itens de `state.identificacao.contratos`, unidos por vírgula.
- Data: data atual no momento do download (`toLocaleDateString('pt-BR')`).
- **Sem** bloco de classificação de risco (não existe `scoreGlobal` neste fluxo).

### 9.2 Corpo — por ambiente
Para cada instância em `state.ambientesSelecionados`, na mesma ordem em que aparecem:
- Título do ambiente via `formatarNomeAmbiente(instancia)` (reaproveitado de
  `domain/ambientes.js`, sem alteração).
- Lista pergunta → resposta, na ordem do grupo (A/B/C — Seção 6.4), incluindo:
  - "não se aplica" reproduzido literalmente onde marcado;
  - sufixo "mm" nas duas perguntas de altura, quando a resposta for numérica (ex.:
    `"850 mm"`); quando for "não se aplica", exibe apenas o texto, sem sufixo;
  - "Observações do ambiente", reproduzida tal como digitada, sem qualquer
    processamento (Seção 4 do PRD — restrição dura de zero IA).
- **Sem** `ScoreBadge`, sem trecho de CC, sem tabela de "Resumo Executivo", sem
  `scoreEngine`/`ccBuilder` importados neste arquivo.

### 9.3 Nome do arquivo
```
Checklist_Projetista_{state.identificacao.contratos[0]}_{AAAA-MM-DD}.pdf
```
Usa exclusivamente o **primeiro** item de `contratos` (CA-14); os demais aparecem
apenas no corpo do PDF (identificação da capa).

---

## 10. Persistência Local e Isolamento de Rascunho

| | Cliente (inalterado) | Projetista (novo) |
|---|---|---|
| Chave `localStorage` | `byarabi_checklist_rascunho` | `byarabi_checklist_vendedor` |
| Provedor | `FormProvider` | `FormProviderVendedor` |
| Diálogo "continuar de onde parou" | Sim, como hoje | Sim, réplica isolada |
| Rota de início após "começar do zero" | `/identificacao` | `/vendedor/identificacao` |

Como os dois provedores só montam depois de o usuário escolher um perfil na tela
`SelecaoPerfil` (Seção 5), nenhum dos dois diálogos de rascunho aparece antes dessa
escolha, e nenhum dos dois estados é lido/gravado pelo outro provedor — cobre CA-15 e
risco 7 do PRD.

---

## 11. Mapeamento de Critérios de Aceitação (PRD Seção 11)

| CA | Como fica tecnicamente verificável |
|---|---|
| CA-01 | `SelecaoPerfil` → botão "Projetista" → `navigate('/vendedor/identificacao')`, dentro de `VendedorLayoutRoute` |
| CA-02 | `SelecaoPerfil` → botão "Cliente" → `navigate('/identificacao')`, dentro de `ClienteLayoutRoute` — mesmo `AppLayoutCliente`/rotas/reducer de hoje, sem alteração de comportamento |
| CA-03 | `obterGrupo('cozinha') === 'A'` → `StepPerguntasAmbienteVendedor` renderiza `FormGrupoA` com os 2 campos de altura sufixados "mm" |
| CA-04 | `obterGrupo('dormitorio_casal'/'dormitorio_solteiro') === 'B'` → `FormGrupoB`, sem input de altura |
| CA-05 | `obterGrupo('home'/'office') === 'C'` → `FormGrupoC`, sem altura e sem "fechamento até o teto" |
| CA-06 | `obterGrupo('outros') === 'A'` → `FormGrupoA` completo |
| CA-07 | Checkbox "não se aplica" ao lado de cada input de altura desabilita o input e grava a string `"não se aplica"` no campo correspondente do reducer |
| CA-08 | Opção extra "Não se aplica" no grupo de botões de cada pergunta fechada (caixaria, dobradiças, corrediças, fechamento até o teto) |
| CA-09 | Validação de avanço em `StepPerguntasAmbienteVendedor`: bloqueia se algum campo obrigatório do grupo estiver `null` (nem opção, nem número, nem "não se aplica") |
| CA-10 | Botão "+ Adicionar contrato" em `StepIdentificacaoVendedor` → `ADD_CONTRATO_VENDEDOR`; múltiplos contratos válidos permitem avançar |
| CA-11 | Cada posição de `identificacao.contratos` validada por `REGEX_CONTRATO`; qualquer posição inválida bloqueia avanço com mensagem |
| CA-17 *(novo, decisão fechada após a primeira versão deste Spec — não estava na Seção 11 original do PRD)* | Adicionar dois contratos com "+", remover um deles com "−" → `REMOVE_CONTRATO_VENDEDOR`; o formulário volta a permitir avanço com o contrato restante válido; o primeiro contrato (`index === 0`) nunca exibe o botão "−" |
| CA-12 | `StepRevisaoVendedor` bloqueia clique em "Gerar PDF" (sem chamar `gerarPdfVendedor`) se `ambientesSelecionados.length === 0` |
| CA-13 | Conteúdo do PDF (Seção 9.2) — pergunta/resposta por ambiente, sem score/CC/Resumo Executivo, "não se aplica" literal, sufixo "mm" |
| CA-14 | `services/pdfVendedor.js` usa apenas `contratos[0]` no nome do arquivo (Seção 9.3) |
| CA-15 | Chaves de `localStorage` e provedores isolados (Seção 10) |
| CA-16 | Prop `mostrarBotaoVendedor` do `BottomBar` — `false` nas 5 telas do Projetista, default `true` preservado nas 4 telas do cliente (Seção 8) |

---

## 12. Observações

Divergências ou pontos de atenção identificados ao comparar o PRD com o código real
(código prevalece onde há diferença):

- **Endereço do cliente é mais granular do que o PRD sugere na Seção 3.** O PRD resume
  a Etapa 1 do cliente como "nome, contrato, endereço, telefone"; o código real de
  `StepIdentificacao.jsx` tem campos separados de CEP, logradouro, número,
  complemento, bairro, cidade e UF. Isso **não afeta** o formulário do Projetista, que
  o PRD já deixa explícito não deve repetir endereço/telefone — citado aqui apenas
  como confirmação de leitura, sem impacto na implementação desta feature.
- **`BottomBar.jsx` hoje não tem nenhuma prop de controle do botão "Vendedor"**,
  confirmando que a Seção 8.7 do PRD é, de fato, uma adição nova (não uma correção de
  algo já existente).
- **Duplicação intencional da regex de contrato.** `REGEX_CONTRATO` já existe em
  `StepIdentificacao.jsx` do cliente; para respeitar a restrição do PRD de não tocar
  nesse arquivo, a mesma regex é duplicada em `StepIdentificacaoVendedor.jsx` em vez de
  extraída para um módulo compartilhado. Isso é uma decisão consciente deste Spec,
  reconfirmada nesta revisão — se a regra de contrato mudar no futuro, terá que ser
  atualizada nos dois lugares.
- **Botão de remover contrato (CA-17) é uma decisão tomada no nível do Spec, não do
  PRD.** O PRD (Seção 5/7) só menciona o botão "+" para adicionar contratos; não fala
  em remover. A necessidade de um botão "−" foi identificada durante a revisão deste
  Spec (um contrato adicionado por engano ficava sem forma válida de ser desfeito) e
  foi fechada diretamente aqui. O PRD não foi alterado — se for necessário manter os
  dois documentos em sincronia total, vale um ajuste pontual na Seção 5 do PRD
  mencionando também o botão de remover, mas isso não bloqueia a implementação.
- **Fora de escopo confirmado, não implementado neste Spec:** unificação ou adição de
  novas opções de marca (ex. Blum, Hafele) às perguntas de dobradiças/corrediças
  (PRD Seção 14) — os `FormGrupoA/B/C` desta versão usam exatamente as opções fechadas
  listadas na Seção 6.4 acima, nada mais.

---

## Plano de Execução

- [x] Task 1 — Criar `domain/gruposPerguntasVendedor.js` (mapa de grupos A/B/C + `obterGrupo`) e `domain/schemaVendedor.js` (`estadoInicialVendedor` + `defaultsPorGrupo`), sem tocar em `domain/ambientes.js` nem `domain/schema.js`.
- [x] Task 2 — Criar `context/FormContextVendedor.js` e `context/FormProviderVendedor.jsx` (reducer com as ações da Seção 7.3, chave `byarabi_checklist_vendedor`, diálogo "continuar de onde parou" isolado).
- [x] Task 3 — Criar `screens/SelecaoPerfil/SelecaoPerfil.jsx` com os dois botões, sem depender de nenhum `FormContext`.
- [x] Task 4 — Reestruturar `App.jsx`: extrair `AppLayoutCliente` (hoje `AppLayout`, trocando `<Routes>` internas por `<Outlet/>` e removendo a rota `"/"`), criar `ClienteLayoutRoute`, `VendedorLayoutRoute` e `AppLayoutVendedor`, montar a árvore de rotas descrita na Seção 5. Validar manualmente que o fluxo do cliente (incluindo diálogo de rascunho) permanece idêntico ao de hoje.
- [x] Task 5 — Alterar `components/BottomBar/BottomBar.jsx` de forma aditiva (prop `mostrarBotaoVendedor`, default `true`); confirmar que os 4 call sites do cliente continuam sem alteração e com o botão "Vendedor" visível.
- [x] Task 6 — Criar `steps/vendedor/StepIdentificacaoVendedor` (nome + lista de contratos com "+" e "−" — este último ausente apenas no primeiro contrato —, validação e mensagens de erro, `BottomBar` com `mostrarBotaoVendedor={false}`).
- [x] Task 7 — Criar `steps/vendedor/StepAmbientesVendedor` (réplica funcional de `StepAmbientes.jsx` usando o reducer do Projetista).
- [x] Task 8 — Criar `steps/vendedor/StepPerguntasAmbienteVendedor` + `FormGrupoA.jsx` (com os 2 campos de altura em mm e "não se aplica"), `FormGrupoB.jsx`, `FormGrupoC.jsx`, com a validação de avanço descrita na Seção 6.4.
- [x] Task 9 — Criar `steps/vendedor/StepRevisaoVendedor` (conferência dos dados, bloqueio de PDF sem ambientes, chamada a `gerarPdfVendedor`).
- [x] Task 10 — Criar `services/pdfVendedor.js` (capa, corpo por ambiente, nome de arquivo `Checklist_Projetista_{primeiro_contrato}_{data}.pdf`).
- [x] Task 11 — Criar `steps/vendedor/StepSucessoVendedor` (texto do Projetista, `RESET_STATE_VENDEDOR`, navegação de volta a `/vendedor/identificacao`).
- [x] Task 12 — Teste manual fim a fim cobrindo CA-01 a CA-17 (Seção 11), incluindo o cenário de isolamento de rascunho (CA-15) com os dois formulários preenchidos em paralelo. Executado com `npm run build` (sem erros) + Playwright headless dirigindo o app real via `npm run dev`, com capturas de tela e checagem de console em cada critério. Nenhum erro de console em nenhuma das rodadas.

---

## Desvios

1. **`SelecaoPerfil` reaproveita o componente `Header` diretamente, em vez de recriar a
   marca visual inline.** A Seção 6.1 dizia para não reaproveitar `Header` "pois ele
   exige contexto de etapa". Ao ler `components/Header/Header.jsx` antes de implementar,
   confirmei que o componente é puramente apresentacional — recebe apenas a prop opcional
   `etapaAtual` e não usa `useFormContext` nem qualquer Context em nenhum ponto. A
   premissa da Seção 6.1 estava incorreta. Como reaproveitar o componente real é mais
   consistente do que duplicar a marcação da logo, `SelecaoPerfil.jsx` importa e usa
   `<Header />` (sem prop `etapaAtual`, que é opcional) em vez de recriar o cabeçalho.
   Nenhum comportamento do `Header` foi alterado.

2. **`services/pdfVendedor.js` não importa `jspdf-autotable`.** A Seção 9 descreve o
   gerador como reaproveitando "o padrão visual (jsPDF + jspdf-autotable, capa...)", mas
   a Seção 9.2 (conteúdo do corpo) especifica apenas uma lista simples de pergunta →
   resposta por ambiente, sem nenhuma tabela. Como não há conteúdo tabular em nenhum
   ponto do PDF do Projetista (diferente do PDF do cliente, que usa `autoTable` para o
   Resumo Executivo e listas de eletrodomésticos/eletrônicos), importar
   `jspdf-autotable` sem uso seria código morto. Interpretei a menção na Seção 9 como
   referência ao stack geral do projeto (Seção 2), não como exigência literal de
   renderizar uma tabela nesta feature. Se o Everton quiser uma tabela de resumo por
   ambiente no PDF do Projetista, é um ajuste a discutir separadamente — não implementado
   aqui por não estar descrito na Seção 9.2.

3. **`StepAmbientesVendedor` sempre avança direto para o primeiro ambiente selecionado**,
   sem a ramificação por `origemNavegacao === 'revisao'` que existe em `StepAmbientes.jsx`
   do cliente. O Spec (Seção 6.6) não descreve links de "✏️ Editar" na
   `StepRevisaoVendedor` (diferente da `StepRevisao` do cliente, que tem "Editar
   Identificação/Ambientes/Perguntas Gerais"), então não existe nenhum fluxo que force o
   usuário do Projetista a retornar à revisão a meio de uma edição pontual — a navegação
   é sempre sequencial (identificação → ambientes → cada ambiente em ordem → revisão →
   sucesso). Por não haver essa ramificação, `_meta.origemNavegacao` do Projetista nunca
   é setado como `'revisao'`, embora o campo exista no schema (Seção 4.2) para paridade
   estrutural com o cliente. Nenhum critério de aceitação exige esse fluxo de edição.
