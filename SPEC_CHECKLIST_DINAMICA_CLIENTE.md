# SPEC — Checklist Dinâmica do Cliente (By Arabi Planejados)

**Documento:** Especificação Técnica de Implementação — Fase 1 (Cliente)
**Data:** 18/04/2026
**Baseado em:** `PRD_CHECKLIST_DINAMICA_CLIENTE.md` (referência primária) + `especificacao-checklist-dinamica.md` (fonte das regras de negócio)
**Status:** Aguardando aprovação antes do início da implementação
**Regra de conflito:** onde PRD e especificação de negócio divergem, o PRD prevalece. Divergências listadas na seção 18.

---

## 1. Visão Geral

Aplicação React de página única (SPA) hospedada no GitHub Pages. Um formulário multi-etapas (wizard) guia o cliente da By Arabi Planejados na coleta de informações técnicas para liberação do projeto. Ao final, gera um PDF client-side que o cliente baixa e envia à equipe de liberação.

Não existe backend nesta fase. Todo o estado fica no navegador até o download do PDF. A única chamada de rede é para a API pública ViaCEP (consulta de CEP).

---

## 2. Stack Técnica

| Item | Decisão | Observação |
|---|---|---|
| Toolchain | Vite + React | `vite.config.js` com `base` configurado para GitHub Pages |
| Estado global | Context API + useReducer | Nativo do React; sem Redux ou Zustand |
| Roteamento | HashRouter (react-router-dom v6) | Evita 404 em refresh no GitHub Pages |
| Estilização | CSS Modules (mobile-first) | Sem framework CSS; identidade By Arabi aplicada via skill `byarabi-design` em etapa posterior |
| PDF | jsPDF + jspdf-autotable | Client-side puro |
| Deploy | GitHub Actions (workflow oficial do GitHub Pages) | Trigger: push na branch `main` |
| Persistência | localStorage | Sincronizado pelo reducer a cada mutação |
| CEP | API pública ViaCEP | `https://viacep.com.br/ws/{cep}/json/` |
| Linguagem | JavaScript (sem TypeScript) | Schema documentado em JSDoc |

---

## 3. Estrutura de Pastas e Arquivos

**Antes:** repositório contém apenas arquivos de documentação.
**Depois:**

```
checklist-dinamica/
├── .github/
│   └── workflows/
│       └── deploy.yml                        # Pipeline GitHub Actions → GitHub Pages
├── src/
│   ├── main.jsx                              # Entrypoint Vite
│   ├── App.jsx                               # HashRouter + FormProvider + layout global
│   │
│   ├── domain/                               # Lógica pura (sem React, sem efeitos colaterais)
│   │   ├── schema.js                         # Objeto de estado inicial (contrato entre camadas)
│   │   ├── ambientes.js                      # Catálogo estático de tipos de ambiente
│   │   ├── scoreEngine.js                    # Cálculo de score global e por ambiente
│   │   └── ccBuilder.js                      # Geração da lista de CCs e Avisos
│   │
│   ├── services/                             # Wrappers de I/O (sem lógica de negócio)
│   │   ├── cep.js                            # buscarCep(cep) → dados de endereço ou erro
│   │   └── pdf.js                            # gerarPdf(state) → dispara download do PDF
│   │
│   ├── context/
│   │   ├── FormContext.js                    # createContext + hook useFormContext
│   │   └── FormProvider.jsx                  # Provider + useReducer + localStorage sync
│   │
│   ├── components/                           # Componentes UI reutilizáveis
│   │   ├── Header/
│   │   │   ├── Header.jsx                    # Logo By Arabi + título da etapa atual
│   │   │   └── Header.module.css
│   │   ├── Stepper/
│   │   │   ├── Stepper.jsx                   # Indicador "Etapa X de 4 — [Nome]" (CA-18B)
│   │   │   └── Stepper.module.css
│   │   ├── BottomBar/
│   │   │   ├── BottomBar.jsx                 # Botões Voltar/Avançar + botão Vendedor fixo
│   │   │   └── BottomBar.module.css
│   │   ├── Modal/
│   │   │   ├── Modal.jsx                     # Modal genérico (RiscoAlto e Vendedor)
│   │   │   └── Modal.module.css
│   │   ├── ScoreBadge/
│   │   │   ├── ScoreBadge.jsx                # Badge 🔴 ALTO / 🟡 MÉDIO / 🟢 BAIXO
│   │   │   └── ScoreBadge.module.css
│   │   └── FieldGroup/
│   │       ├── FieldGroup.jsx                # Wrapper visual para grupo de campos
│   │       └── FieldGroup.module.css
│   │
│   └── steps/                               # Componentes de etapa
│       ├── StepIdentificacao/
│       │   ├── StepIdentificacao.jsx
│       │   └── StepIdentificacao.module.css
│       ├── StepAmbientes/
│       │   ├── StepAmbientes.jsx
│       │   └── StepAmbientes.module.css
│       ├── StepPerguntasGlobais/
│       │   ├── StepPerguntasGlobais.jsx
│       │   ├── BlocoIluminacao.jsx           # G1
│       │   ├── BlocoReforma.jsx              # G2, G2.1, G2.2 + modal RiscoAlto
│       │   ├── BlocoPontosUtilidades.jsx     # G3
│       │   ├── BlocoRebaixo.jsx              # G4
│       │   └── StepPerguntasGlobais.module.css
│       ├── StepPerguntasPorAmbiente/
│       │   ├── StepPerguntasPorAmbiente.jsx  # Iterador: renderiza form pelo instanceId
│       │   ├── FormCozinha.jsx               # Cozinha / A.S. / Varanda
│       │   ├── FormDormitorio.jsx            # Dormitório Casal e Solteiro
│       │   ├── FormHomeSalaOffice.jsx        # Home / Sala / Office
│       │   ├── FormBanheiro.jsx              # Banheiro / W.C.
│       │   ├── FormOutros.jsx                # Superset completo (CA-19)
│       │   └── StepPerguntasPorAmbiente.module.css
│       ├── StepRevisao/
│       │   ├── StepRevisao.jsx               # Score + CCs + resumo + botão Gerar PDF
│       │   └── StepRevisao.module.css
│       └── StepSucesso/
│           ├── StepSucesso.jsx               # Instrução de envio + limpeza de localStorage
│           └── StepSucesso.module.css
├── vite.config.js
├── package.json
└── index.html
```

---

## 4. Catálogo de Ambientes (`domain/ambientes.js`)

**Antes:** arquivo não existe.
**Depois:** exporta o array `AMBIENTES_DISPONIVEIS`.

```js
[
  { id: "cozinha",            label: "Cozinha / Área de Serviço",  formType: "cozinha"    },
  { id: "dormitorio_casal",   label: "Dormitório Casal",           formType: "dormitorio" },
  { id: "dormitorio_solteiro",label: "Dormitório Solteiro",        formType: "dormitorio" },
  { id: "banheiro",           label: "Banheiro / W.C.",            formType: "banheiro"   },
  { id: "home",               label: "Home / Sala",                formType: "home"       },
  { id: "office",             label: "Office",                     formType: "home"       },
  { id: "varanda",            label: "Varanda / Área Gourmet",     formType: "cozinha"    },
  { id: "outros",             label: "Outros",                     formType: "outros"     }
]
```

`formType` determina qual componente é renderizado na Etapa 4. `varanda` usa `formType: "cozinha"` pois compartilha o mesmo conjunto de perguntas. `office` usa `formType: "home"`.

---

## 5. Schema do Estado do Formulário (`domain/schema.js`)

**Antes:** arquivo não existe.
**Depois:** exporta `estadoInicial` — o objeto que descreve a forma completa do estado e serve de contrato entre reducer, etapas e módulos de domínio.

### 5.1 Estrutura Raiz

```js
const estadoInicial = {

  _meta: {
    etapaAtual: "identificacao",  // última rota visitada (para recuperação de rascunho)
    criadoEm: null,               // ISO timestamp
    atualizadoEm: null
  },

  // Etapa 1
  identificacao: {
    nome: "",
    contrato: "",       // ex: "IT01234" — validado por regex no avanço
    cep: "",
    logradouro: "",
    complemento: "",    // opcional
    bairro: "",
    cidade: "",
    uf: "",
    telefone: ""
  },

  // Etapa 2
  // Array de instâncias criadas pelo cliente. instanceId = "{ambienteId}-{índice}"
  ambientesSelecionados: [],
  // ex: [{ instanceId: "dormitorio_solteiro-0", tipo: "dormitorio_solteiro",
  //         formType: "dormitorio", label: "Dormitório Solteiro", nome: "" }]

  // Etapa 3
  global: {
    g1_temIluminacaoExterna: null,   // boolean
    g1_ambientes: [],                // instanceIds afetados

    g2_temReforma: null,             // boolean
    g2_ambientes: [],                // instanceIds em reforma
    g2_1_temReboco: null,            // boolean (visível se g2_temReforma = true)
    g2_2_temRevestimento: null,      // boolean (visível se g2_temReforma = true E g2_1_temReboco = true)

    g3_pontosNaPosicaoFinal: null,   // boolean
    g3_ambientesPendentes: [],       // instanceIds sem pontos (visível se g3 = false)

    g4_temRebaixo: null,             // boolean
    g4_ambientes: []                 // [{ instanceId, cm: null }] (visível se g4 = true)
  },

  // Etapa 4 — chaveado por instanceId
  respostasPorAmbiente: {}
};
```

### 5.2 Subestados por Tipo de Ambiente

#### `formType: "cozinha"` — Cozinha, Área de Serviço, Varanda

```js
{
  granito: null,          // boolean — P1
  granitoadaptar: null,   // boolean — P1.1 (visível se granito = true)
  tanque: null,           // boolean — P2
  tanqueMoveis: null,     // boolean — P2.1 (visível se tanque = true)
  eletrosDefined: null,   // boolean — P3
  eletros: [],            // visível se eletrosDefined = true
  // eletros[i] = { tipo, subtipo, modelo, largura_cm, altura_cm, profundidade_cm, link }
  observacoes: ""         // P4 — opcional, máx. 300 chars
}
```

#### `formType: "dormitorio"` — Dormitório Casal e Solteiro

```js
{
  tamanhoCama: null,         // "solteiro"|"padrao"|"queen"|"king"|"outro" — P1
  camaLargura_cm: null,      // number (visível se tamanhoCama = "outro")
  camaComprimento_cm: null,  // number
  tv: null,                  // boolean — P2
  tvPontoFinal: null,        // boolean — P2.1 (visível se tv = true)
  tv_polegadas: null,        // number, obrigatório (visível se tv = true)
  tv_modelo: "",             // opcional
  tv_largura_cm: null,       // opcional
  tv_altura_cm: null,        // opcional
  tv_profundidade_cm: null,  // opcional
  tv_link: "",               // opcional
  cortineiro: null,          // boolean — P3
  cortieneiroInstalado: null,// boolean — P3.1 (visível se cortineiro = true)
  rodape: null,              // boolean — P4
  observacoes: ""            // P5 — opcional, máx. 300 chars
}
```

#### `formType: "home"` — Home / Sala / Office

```js
{
  eletronicos: null,         // boolean — P1
  eletronicosList: [],       // visível se eletronicos = true
  // eletronicosList[i] = { tipo, modelo, largura_cm, altura_cm, link }
  tv: null,                  // boolean — P2
  tvPontoFinal: null,
  tv_polegadas: null,        // obrigatório se tv = true
  tv_modelo: "",
  tv_largura_cm: null,
  tv_altura_cm: null,
  tv_profundidade_cm: null,
  tv_link: "",
  cortineiro: null,          // boolean — P3
  cortieneiroInstalado: null,
  rodape: null,              // boolean — P4
  observacoes: ""            // P5
}
```

#### `formType: "banheiro"`

```js
{
  granito: null,             // boolean — P1
  granitoadaptar: null,      // boolean — P1.1 (visível se granito = true)
  cuba: null,                // "embutir"|"semi-encaixe"|"sobrepor"|"esculpida" — P2
  observacoes: ""            // P3 — opcional
}
```

#### `formType: "outros"` — superset na ordem de CA-19

```js
{
  granito: null,             // 1. Granito ou pia existente
  granitoadaptar: null,
  tanque: null,              // 2. Tanque existente
  tanqueMoveis: null,
  tv: null,                  // 3. TV
  tvPontoFinal: null,
  tv_polegadas: null,
  tv_modelo: "",
  tv_largura_cm: null,
  tv_altura_cm: null,
  tv_profundidade_cm: null,
  tv_link: "",
  cortineiro: null,          // 4. Cortineiro
  cortieneiroInstalado: null,
  rodape: null,              // 5. Rodapé
  tamanhoCama: null,         // 6. Tamanho de cama
  camaLargura_cm: null,
  camaComprimento_cm: null,
  eletrosDefined: null,      // 7. Eletrodomésticos
  eletros: [],
  cuba: null,                // 8. Cuba
  eletronicos: null,         // 9. Eletrônicos
  eletronicosList: [],
  observacoes: ""            // 10. Observações
}
```

---

## 6. Camada de Estado — `FormContext` e Reducer

### 6.1 `FormContext.js`
**Antes:** não existe.
**Depois:** exporta `FormContext` e o hook `useFormContext()`. O hook lança erro se usado fora do `FormProvider`.

### 6.2 `FormProvider.jsx`
**Antes:** não existe.
**Depois:** envolve toda a aplicação. Responsabilidades:
1. Inicializar o estado com `estadoInicial` ou com rascunho do localStorage.
2. Expor `{ state, dispatch }` via `FormContext`.
3. Sincronizar o estado com localStorage a cada mudança via `useEffect`.

### 6.3 Ações do Reducer

| Tipo | Payload | Efeito |
|---|---|---|
| `SET_IDENTIFICACAO` | `{ campo, valor }` | Atualiza campo em `state.identificacao` |
| `SET_AMBIENTE_QUANTIDADE` | `{ ambienteId, quantidade }` | Reconstrói instâncias em `ambientesSelecionados`; inicializa `respostasPorAmbiente[instanceId]` para cada nova instância |
| `SET_AMBIENTE_NOME` | `{ instanceId, nome }` | Atualiza `nome` de uma instância de ambiente |
| `SET_GLOBAL` | `{ campo, valor }` | Atualiza campo em `state.global` |
| `SET_GLOBAL_G4_AMBIENTE` | `{ instanceId, cm }` | Atualiza `cm` de um ambiente em `global.g4_ambientes` |
| `SET_RESPOSTA_AMBIENTE` | `{ instanceId, campo, valor }` | Atualiza campo em `respostasPorAmbiente[instanceId]` |
| `ADD_ELETRO` | `{ instanceId, eletro }` | Adiciona item à lista `eletros` do ambiente |
| `UPDATE_ELETRO` | `{ instanceId, index, campo, valor }` | Atualiza campo de um eletro |
| `REMOVE_ELETRO` | `{ instanceId, index }` | Remove eletro da lista |
| `ADD_ELETRONICO` | `{ instanceId, eletronico }` | Análogo para `eletronicosList` (Home) |
| `UPDATE_ELETRONICO` | `{ instanceId, index, campo, valor }` | Idem |
| `REMOVE_ELETRONICO` | `{ instanceId, index }` | Idem |
| `SET_META` | `{ campo, valor }` | Atualiza campo em `state._meta` (ex.: `etapaAtual`) |
| `RESTORE_STATE` | `estadoCompleto` | Carrega estado salvo do localStorage |
| `RESET_STATE` | — | Volta ao `estadoInicial` e limpa localStorage |

### 6.4 Geração de `instanceId`
Formato: `{ambienteId}-{índice}` (ex.: `"dormitorio_solteiro-0"`, `"dormitorio_solteiro-1"`). Índice começa em 0, relativo ao tipo. O reducer cria os IDs ao processar `SET_AMBIENTE_QUANTIDADE`.

---

## 7. Roteamento e Navegação entre Etapas

### 7.1 Rotas (HashRouter)

| Rota | Componente |
|---|---|
| `#/` | Redirect para `#/identificacao` |
| `#/identificacao` | `StepIdentificacao` — Etapa 1 |
| `#/ambientes` | `StepAmbientes` — Etapa 2 |
| `#/globais` | `StepPerguntasGlobais` — Etapa 3 |
| `#/ambiente/:instanceId` | `StepPerguntasPorAmbiente` — Etapas 4 a 3+N (uma rota por instância; N = total de ambientes selecionados) |
| `#/revisao` | `StepRevisao` |
| `#/sucesso` | `StepSucesso` |

Sequência de navegação na Etapa 4: ambientes na ordem em que aparecem em `state.ambientesSelecionados`. "Avançar" no último ambiente vai para `#/revisao`; "Voltar" no primeiro ambiente vai para `#/globais`.

### 7.2 Stepper (CA-18B)
Componente `Stepper` exibido em todas as telas de formulário. Formato: **"Etapa X de [totalEtapas] — [Nome]"**.

O total de etapas é calculado dinamicamente:
- `totalEtapas = 3 + N` (3 etapas fixas: Identificação, Ambientes, Globais; N = quantidade de ambientes selecionados).
- Cada ambiente selecionado recebe número de etapa sequencial a partir de 4. Exemplo: Cozinha + Dormitório Casal + Banheiro → etapa 4 = Cozinha, etapa 5 = Dormitório Casal, etapa 6 = Banheiro.
- `totalEtapas` é recalculado sempre que `ambientesSelecionados` muda.
- `StepRevisao` e `StepSucesso` não exibem número de etapa.

| Rota | Etapa | Nome exibido no Stepper |
|---|---|---|
| `#/identificacao` | 1 | Identificação |
| `#/ambientes` | 2 | Ambientes |
| `#/globais` | 3 | Perguntas Gerais |
| `#/ambiente/:instanceId` | 4 até 3+N | label do ambiente |

Não é barra de progresso percentual — apenas texto e número.

### 7.3 Botão "Vendedor" fixo (CA-3B)
Botão fixo na `BottomBar` em todas as etapas do formulário. Abre o `Modal` com:

> "Precisa de ajuda com essa pergunta? Entre em contato com seu vendedor projetista para obter essa informação. Quando tiver a resposta, retorne aqui — seu progresso estará salvo."

Botão no modal: **"Entendido, vou consultar o vendedor"** → fecha o modal. Nenhuma navegação ou alteração de dados ocorre.

---

## 8. Etapa 1 — Identificação (`StepIdentificacao`)

**Antes:** não existe.
**Depois:** formulário com os campos abaixo.

### 8.1 Campos e Validações

| Campo | Tipo | Obrigatório | Regra de validação |
|---|---|---|---|
| Nome completo | text | Sim | Não vazio |
| Número do contrato | text | Sim | Regex: `^(IT\|SM\|TA\|PIN\|STA)\d+$` (CA-4) |
| CEP | text (máscara `00000-000`) | Sim | 8 dígitos; dispara busca ao sair do campo (onBlur) |
| Logradouro | text | Sim | Preenchido por ViaCEP ou manual |
| Complemento | text | Não | Livre |
| Bairro | text | Sim | Preenchido por ViaCEP ou manual |
| Cidade | text | Sim | Preenchido por ViaCEP ou manual |
| UF | text (2 chars) | Sim | Preenchido por ViaCEP ou manual |
| Telefone/celular | text | Sim | Não vazio |

Botão "Avançar" habilitado apenas com todos os campos obrigatórios válidos.

### 8.2 Integração ViaCEP (`services/cep.js`)

Exporta `buscarCep(cep)` — `fetch` com timeout de 5 segundos.

| Situação | Comportamento |
|---|---|
| Sucesso | Preenche logradouro, bairro, cidade, UF via dispatch. Campos continuam editáveis. |
| ViaCEP devolve `{ erro: true }` | Exibe "CEP não encontrado — você pode preencher o endereço manualmente". Campos editáveis e vazios. |
| Timeout ou rede indisponível | Após 5s: "Não foi possível consultar o CEP agora — preencha o endereço manualmente". Campos editáveis. |

Em nenhum caso o formulário bloqueia o avanço por falha de CEP (CA-2, CA-3).

---

## 9. Etapa 2 — Seleção de Ambientes (`StepAmbientes`)

**Antes:** não existe.
**Depois:** lista os ambientes de `domain/ambientes.js` com controle de quantidade (botões + e −).

- Quantidade mínima por ambiente: 0. Quantidade padrão ao selecionar: 1.
- Quando quantidade = 1: nenhum campo de nome é exibido. O ambiente é identificado apenas pelo seu label padrão (ex.: "Dormitório Casal"). Qualquer nome previamente digitado é descartado pelo reducer ao processar `SET_AMBIENTE_QUANTIDADE` com quantidade = 1.
- Quando quantidade > 1: exibe N campos de nome, um por instância. Nomes já digitados para instâncias existentes são preservados ao aumentar quantidade; ao reduzir, instâncias removidas perdem seus nomes (sem recuperação).
- Botão "Avançar" desabilitado se `ambientesSelecionados` estiver vazio (CA-6).
- Ao criar nova instância, o reducer inicializa `respostasPorAmbiente[instanceId]` com os defaults do `formType` correspondente.

---

## 10. Etapa 3 — Perguntas Globais (`StepPerguntasGlobais`)

**Antes:** componentes não existem.
**Depois:** quatro blocos de pergunta na mesma tela, em sequência.

### 10.1 G1 — Iluminação Externa (`BlocoIluminacao`)

| Pergunta | Condicional de exibição | CC gerado | Score |
|---|---|---|---|
| "O projeto terá alguma iluminação embutida na marcenaria adquirida externamente à By Arabi? (fitas de LED, spots, etc.)" | Sempre | — | — |
| "Em quais ambientes?" (botões com ambientes selecionados) | `g1_temIluminacaoExterna = true` | CC: "CLIENTE CIENTE E DE ACORDO QUE FIAÇÃO ELÉTRICA, INSTALAÇÃO DE ILUMINAÇÕES E SERVIÇOS DE ELETRICISTA É POR SUA RESPONSABILIDADE, PROFISSIONAL DEVE ESTAR LOCAL NO DIA DA MONTAGEM." | Médio +2 (global) |

Botões **"Todos"** e **"Nenhum"** exibidos no topo do grupo de botões de ambientes em G1: "Todos" seleciona todos os ambientes da lista; "Nenhum" desmarca todos.

### 10.2 G2 — Reforma (`BlocoReforma`)

| Pergunta | Condicional de exibição | CC gerado | Score |
|---|---|---|---|
| "Algum ambiente está em reforma?" | Sempre | — | — |
| "Quais ambientes?" (botões) | `g2_temReforma = true` | — | — |
| G2.1: "As paredes já possuem reboco (argamassa) finalizado?" | `g2_temReforma = true` | CC G2.1 se NÃO (ver abaixo) | Alto DIRETO |
| G2.2: "O revestimento final das paredes já está aplicado?" | `g2_temReforma = true` **E** `g2_1_temReboco = true` | CC G2.2 se NÃO (mesmo texto de G2.1) | Alto +3 |

**Pop-up de Risco Alto ao clicar NÃO em G2.1 (CA-7):**
Implementado como `Modal` com conteúdo fixo:

> "Ambiente não está pronto para liberação. [label(s) dos ambientes em reforma] ainda não possui(em) reboco (argamassa) finalizado nas paredes. Nessa condição, o projeto não pode ser liberado sem adequação prévia. Seu progresso está salvo."

| Botão do modal | Comportamento |
|---|---|
| **"← Voltar"** | Fecha o modal; reverte `g2_1_temReboco` para `null`; retorna à pergunta G2.1 |
| **"Assumo o risco e continuar"** | Fecha o modal; mantém `g2_1_temReboco = false`; registra gatilho ALTO; **G2.2 não é exibida** |

**Regra de supressão G2.1/G2.2:** G2.2 só aparece quando `g2_1_temReboco = true`. Quando G2.1 = NÃO (sem reboco), G2.2 é ocultada e o gatilho `REFORM_SEM_REVESTIMENTO` não é calculado. Os dois CCs compartilham o mesmo texto — apenas um pode ser gerado por preenchimento.

**Botões "Todos" e "Nenhum" em G2, G2.1 e G2.2:** disponíveis no topo do grupo de botões de ambientes. "Todos" seleciona todos os ambientes da lista; "Nenhum" desmarca todos. Em G2.1, clicar "Todos" NÃO dispara o pop-up de risco alto (CA-7). Qualquer seleção parcial (não "Todos") em G2.1 dispara o pop-up normalmente.

### 10.3 G3 — Pontos Elétricos/Hidráulicos/Gás (`BlocoPontosUtilidades`)

| Pergunta | Condicional | CC | Score |
|---|---|---|---|
| "Os pontos elétricos/hidráulicos/gás já estão nas posições finais em todos os ambientes?" | Sempre | — | — |
| "Em quais ambientes ainda não estão?" (botões) | `g3_pontosNaPosicaoFinal = false` | CC: "CLIENTE CIENTE E DE ACORDO QUE DEVERÁ ALTERAR E/OU PROVIDENCIAR PONTOS ELÉTRICOS/HIDRÁULICOS/GÁS ATÉ O DIA DA MONTAGEM, PARA CORRETA ADEQUAÇÃO DO PROJETO." | Médio +2 (global) |

Botões **"Todos"** e **"Nenhum"** exibidos no topo do grupo de botões de ambientes em G3: "Todos" seleciona todos os ambientes da lista; "Nenhum" desmarca todos.

### 10.4 G4 — Rebaixo de Teto (`BlocoRebaixo`)

| Pergunta | Condicional | CC | Score |
|---|---|---|---|
| "Algum ambiente terá rebaixo de teto?" | Sempre | — | — |
| "Quais ambientes?" (botões) | `g4_temRebaixo = true` | — | — |
| "Quantos cm será rebaixado?" (campo inline por ambiente marcado) | Ao marcar cada ambiente | CC por ambiente: "CLIENTE CIENTE E DE ACORDO QUE DEVERÁ FINALIZAR O REBAIXO DE TETO EM [Xcm] ATÉ O DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO." | Baixo +1 por ambiente |

---

## 11. Etapa 4 — Perguntas por Ambiente

`StepPerguntasPorAmbiente` lê o `instanceId` da URL e renderiza o formulário correspondente ao `formType`. Cada instância tem rota própria (`#/ambiente/:instanceId`).

### 11.1 FormCozinha — `formType: "cozinha"` (Cozinha / A.S. / Varanda)

| Pergunta | Condicional | CC / Aviso | Score |
|---|---|---|---|
| P1: "Existe granito ou pia existente no local?" | Sempre | — | — |
| P1.1: "Os móveis serão adaptados para este granito/pia?" | `granito = true` | CC se NÃO: "CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR GRANITO EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO." | Médio +2 |
| P2: "Existe tanque no local?" | Sempre | — | — |
| P2.1: "Haverá móveis na região do tanque?" | `tanque = true` | CC se SIM: "CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR TANQUE EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO." | Médio +2 |
| P3: "Já possui ou tem intenção de compra específica dos eletrodomésticos?" | Sempre | CC se NÃO: "CLIENTE CIENTE E DE ACORDO QUE OS ELETRODOMÉSTICOS NÃO FORAM DEFINIDOS NO PROJETO E DEVERÃO SER ADQUIRIDOS DE ACORDO COM OS VÃOS PREVISTOS." | Baixo +1 |
| Seleção de eletros + campos por eletro | `eletrosDefined = true` | — | — |
| P4: Observações (máx. 300 chars) | Sempre | — | — |

**Eletrodomésticos disponíveis:**

| Tipo | Subtipos disponíveis |
|---|---|
| Fogão | Piso / Embutido |
| Cooktop | — |
| Refrigerador | Duplex / Inverse / Side by Side |
| Microondas | Normal / Embutido |
| Forno | Normal / Embutido |
| Depurador | Normal / Embutido |
| Coifa | Parede / Ilha |
| Lava-louça | Piso / Embutido |
| Lava-roupa | Abertura Frontal / Abertura Superior |
| Outros | campo de texto livre |

Para cada eletro selecionado:
- **Subtipo:** obrigatório quando o eletro tiver subtipos disponíveis.
- **Largura (cm), Altura (cm), Profundidade (cm):** obrigatórios para todos os eletros selecionados.
- **Modelo:** opcional para todos, exceto Depurador com subtipo Embutido (obrigatório).
- **Link:** opcional para todos, exceto Depurador com subtipo Embutido (obrigatório).

### 11.2 FormDormitorio — `formType: "dormitorio"` (Casal e Solteiro)

| Pergunta | Condicional | CC / Aviso | Score |
|---|---|---|---|
| P1: Tamanho da cama (seleção de opções) | Sempre | — | — |
| P1.1: Largura (cm) e Comprimento (cm) | `tamanhoCama = "outro"` | — | — |
| P2: "Terá TV neste ambiente?" | Sempre | — | — |
| P2.1: "O ponto elétrico da TV já está na posição final?" | `tv = true` | CC se NÃO: "CLIENTE CIENTE E DE ACORDO QUE DEVERÁ DESLOCAR OS PONTOS ELÉTRICOS PARA DENTRO DA POSIÇÃO DO PAINEL DE TV ATÉ O DIA DA MONTAGEM PARA OCULTAÇÃO ADEQUADA DA FIAÇÃO." | Médio +2 |
| Dados da TV: Polegadas (obrigatório) / Modelo / Largura / Altura / Profundidade / Link | `tv = true` — **sempre exibido quando tv = true, independente de P2.1** (ver DIV-01) | — | — |
| P3: "Haverá cortineiro neste ambiente?" | Sempre | — | — |
| P3.1: "O cortineiro já está instalado?" | `cortineiro = true` | AVISO se NÃO (não é CC): "AVISO: SERÁ CONSIDERADO VÃO DE 150MM PARA CORTINEIRO NÃO INSTALADO." | Baixo +1 |
| P4: "Existe rodapé na região dos móveis?" | Sempre | AVISO se SIM (não é CC): "ROUPEIROS SERÃO INSTALADOS À FRENTE DO RODAPÉ EXISTENTE, COM ACABAMENTO EM MEIA-CANA NA PARTE DE TRÁS." (sem score); CC se NÃO: "CLIENTE CIENTE E DE ACORDO QUE DEVERÁ INSTALAR RODAPÉ NA REGIÃO DOS MÓVEIS SOMENTE APÓS A FINALIZAÇÃO DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO." | NÃO → Baixo +1 |
| P5: Observações (máx. 300 chars) | Sempre | — | — |

**Opções de tamanho de cama:**

| Opção | Dimensões |
|---|---|
| Solteiro | 0,88 × 1,88 m |
| Padrão | 1,38 × 1,88 m |
| Queen | 1,58 × 1,98 m |
| King | 2,00 × 2,03 m |
| Outro | campos: Largura (cm) e Comprimento (cm) |

### 11.3 FormHomeSalaOffice — `formType: "home"` (Home / Sala / Office)

| Pergunta | Condicional | CC / Aviso | Score |
|---|---|---|---|
| P1: "Possui ou pretende adquirir eletrônicos para este ambiente?" | Sempre | CC se NÃO: "CLIENTE CIENTE E DE ACORDO QUE OS ELETRÔNICOS NÃO FORAM DEFINIDOS NO PROJETO E DEVERÃO SER ADQUIRIDOS DE ACORDO COM OS VÃOS PREVISTOS." | Baixo +1 |
| Seleção de eletrônicos + campos | `eletronicos = true` | — | — |
| P2: "Terá TV neste ambiente?" | Sempre | Mesmo CC de Dormitório P2.1 (se tvPontoFinal = false) | Médio +2 |
| P2.1 + dados da TV | `tv = true` | — | — |
| P3: Cortineiro | Mesmo que Dormitório P3 | Mesmo AVISO | Baixo +1 |
| P4: Rodapé | Mesmo que Dormitório P4 | Mesmo CC / AVISO | Baixo +1 |
| P5: Observações (máx. 300 chars) | Sempre | — | — |

**Eletrônicos disponíveis:** TV / Home Theater / Videogame / Computador / Outros.
Para cada eletrônico selecionado:
- **Subtipo:** obrigatório quando disponível.
- **Largura (cm), Altura (cm):** obrigatórios.
- **Modelo, Link:** opcionais.

### 11.4 FormBanheiro — `formType: "banheiro"`

| Pergunta | Condicional | CC | Score |
|---|---|---|---|
| P1: "Existe granito ou pia existente no local?" | Sempre | — | — |
| P1.1: "Os móveis serão adaptados?" | `granito = true` | CC se NÃO: mesmo texto do CC de granito de Cozinha | Médio +2 |
| P2: Tipo de cuba (seleção) | Sempre | — | — |
| P3: Observações (máx. 300 chars) | Sempre | — | — |

**Opções de cuba:** Embutir / Semi-encaixe / Sobrepor / Apoio / Esculpida.

### 11.5 FormOutros — `formType: "outros"`

Exibe o superset de todas as perguntas de todos os tipos, na ordem definida em CA-19. As regras condicionais, CCs, avisos e scores de cada pergunta seguem as mesmas regras do formulário de origem.

**Ordem de exibição:**
1. Granito ou pia existente (→ CC de granito/retirada)
2. Tanque existente (→ CC de tanque)
3. TV (→ CC de ponto de TV + campos)
4. Cortineiro (→ AVISO de vão)
5. Rodapé (→ AVISO se SIM / CC se NÃO)
6. Tamanho de cama (seleção)
7. Eletrodomésticos (→ CC se NÃO definidos)
8. Cuba (seleção)
9. Eletrônicos (→ CC se NÃO definidos)
10. Observações

---

## 12. Motor de Score (`domain/scoreEngine.js`)

**Antes:** arquivo não existe.
**Depois:** exporta a função pura `calcularScore(state)`.

### 12.1 Saída

```js
{
  scoreGlobal: {
    pontos: number,
    isAlto: boolean,
    classificacao: "ALTO" | "MÉDIO" | "BAIXO"
  },
  scorePorAmbiente: {
    [instanceId]: {
      pontos: number,
      isAlto: boolean,
      classificacao: "ALTO" | "MÉDIO" | "BAIXO",
      gatilhos: [string]
    }
  },
  gatilhosAtivados: [string]
}
```

### 12.2 Tabela de Gatilhos

| ID do Gatilho | Condição de disparo | Nível | Pontos | Escopo |
|---|---|---|---|---|
| `REFORM_SEM_REBOCO` | `g2_temReforma = true` E `g2_1_temReboco = false` | Alto DIRETO | 0 | Global |
| `REFORM_SEM_REVESTIMENTO` | `g2_temReforma = true` E `g2_1_temReboco = true` E `g2_2_temRevestimento = false` | Alto | +3 | Global |
| `ILUMINACAO_EXTERNA` | `g1_temIluminacaoExterna = true` | Médio | +2 | Global |
| `PONTOS_INDEFINIDOS` | `g3_pontosNaPosicaoFinal = false` | Médio | +2 | Global |
| `GRANITO_RETIRAR_{instanceId}` | `granito = true` E `granitoadaptar = false` | Médio | +2 | Ambiente (Cozinha, Banheiro, Outros) |
| `TANQUE_RETIRAR_{instanceId}` | `tanque = true` E `tanqueMoveis = true` | Médio | +2 | Ambiente (Cozinha, Outros) |
| `TV_PONTO_{instanceId}` | `tv = true` E `tvPontoFinal = false` | Médio | +2 | Ambiente (Dormitório, Home, Outros) |
| `REBAIXO_{instanceId}` | `g4_temRebaixo = true` E `instanceId ∈ g4_ambientes` | Baixo | +1 | Ambiente |
| `ELETROS_NAODEF_{instanceId}` | `eletrosDefined = false` | Baixo | +1 | Ambiente (Cozinha, Outros) |
| `ELETRONICOS_NAODEF_{instanceId}` | `eletronicos = false` | Baixo | +1 | Ambiente (Home, Outros) |
| `RODAPE_AUSENTE_{instanceId}` | `rodape = false` | Baixo | +1 | Ambiente (Dormitório, Home, Outros) |
| `CORTINEIRO_NAOINSTALADO_{instanceId}` | `cortineiro = true` E `cortieneiroInstalado = false` | Baixo | +1 | Ambiente (Dormitório, Home, Outros) |

### 12.3 Classificação por Ambiente

Para cada `instanceId`:
1. Coleta gatilhos com `_{instanceId}` no ID + gatilho `REBAIXO_{instanceId}`.
2. `isAlto = gatilhos.some(nivel === "Alto" || nivel === "AltoDireto")`.
3. `pontos = sum(gatilhos.map(g => g.pontos))`.
4. Classificação: **ALTO** se `isAlto || pontos >= 8`; **MÉDIO** se `pontos >= 4`; **BAIXO** se `pontos <= 3`.

### 12.4 Classificação Global

1. Gatilhos globais: `REFORM_SEM_REBOCO`, `REFORM_SEM_REVESTIMENTO`, `ILUMINACAO_EXTERNA`, `PONTOS_INDEFINIDOS`.
2. `isAlto = gatilhosGlobais.some(alto) || scorePorAmbiente.some(s => s.isAlto)`.
3. `pontos = sum(gatilhosGlobais.map(g => g.pontos)) + sum(scorePorAmbiente.map(s => s.pontos))`.
4. Mesma regra de classificação.

### 12.5 Regras Especiais

- `REFORM_SEM_REBOCO` (Alto DIRETO): contribui 0 pontos mas `isAlto = true`.
- `REFORM_SEM_REBOCO` ativo → `REFORM_SEM_REVESTIMENTO` não é calculado (G2.2 não é exibida, condição impossível de disparar).
- Score global = ALTO quando qualquer ambiente for ALTO (CA-12). A tela de revisão exibe: "Risco global classificado como ALTO porque um ou mais ambientes apresentam condição de risco alto."
- `TV_PONTO_{instanceId}` com `PONTOS_INDEFINIDOS` ativo: o gatilho gera CC normalmente, mas contribui **0 pontos** ao score em vez de +2 (ver DIV-07).

---

## 13. Gerador de CCs (`domain/ccBuilder.js`)

**Antes:** arquivo não existe.
**Depois:** exporta a função pura `construirCCs(state, gatilhosAtivados)` → array de objetos CC/Aviso sem duplicatas.

### 13.1 Formato de cada item

```js
{
  id: "ILUMINACAO_EXTERNA",
  tipo: "CC",             // "CC" | "AVISO"
  nivel: "MÉDIO",          // "ALTO" | "MÉDIO" | "BAIXO" | null (avisos sem score)
  escopo: "Global",        // "Global" | instanceId
  textoCompleto: "...",
  perguntaOrigem: "G1"     // referência para posicionamento no PDF
}
```

### 13.2 Catálogo Completo

| ID | Tipo | Nível | Texto |
|---|---|---|---|
| `ILUMINACAO_EXTERNA` | CC | MÉDIO | "CLIENTE CIENTE E DE ACORDO QUE FIAÇÃO ELÉTRICA, INSTALAÇÃO DE ILUMINAÇÕES E SERVIÇOS DE ELETRICISTA É POR SUA RESPONSABILIDADE, PROFISSIONAL DEVE ESTAR LOCAL NO DIA DA MONTAGEM." |
| `REFORM_SEM_REBOCO` | CC | ALTO | "CLIENTE CIENTE E DE ACORDO QUE MEDIÇÃO TÉCNICA DE AMBIENTE FOI REALIZADA COM AMBIENTE EM REFORMA INACABADA E QUE DEVERÁ RESPEITAR A ALÍNEA (I) DA CLÁUSULA TERCEIRA DO CONTRATO DE COMPRA E VENDA." |
| `REFORM_SEM_REVESTIMENTO` | CC | ALTO | Mesmo texto de `REFORM_SEM_REBOCO` (ver regra de supressão) |
| `PONTOS_INDEFINIDOS` | CC | MÉDIO | "CLIENTE CIENTE E DE ACORDO QUE DEVERÁ ALTERAR E/OU PROVIDENCIAR PONTOS ELÉTRICOS/HIDRÁULICOS/GÁS ATÉ O DIA DA MONTAGEM, PARA CORRETA ADEQUAÇÃO DO PROJETO." |
| `REBAIXO_{instanceId}` | CC | BAIXO | "CLIENTE CIENTE E DE ACORDO QUE DEVERÁ FINALIZAR O REBAIXO DE TETO EM [Xcm] ATÉ O DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO." — `X` vem de `global.g4_ambientes[instanceId].cm` |
| `GRANITO_RETIRAR_{instanceId}` | CC | MÉDIO | "CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR GRANITO EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO." |
| `TANQUE_RETIRAR_{instanceId}` | CC | MÉDIO | "CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR TANQUE EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO." |
| `TV_PONTO_{instanceId}` | CC | MÉDIO | "CLIENTE CIENTE E DE ACORDO QUE DEVERÁ DESLOCAR OS PONTOS ELÉTRICOS PARA DENTRO DA POSIÇÃO DO PAINEL DE TV ATÉ O DIA DA MONTAGEM PARA OCULTAÇÃO ADEQUADA DA FIAÇÃO." |
| `ELETROS_NAODEF_{instanceId}` | CC | BAIXO | "CLIENTE CIENTE E DE ACORDO QUE OS ELETRODOMÉSTICOS NÃO FORAM DEFINIDOS NO PROJETO E DEVERÃO SER ADQUIRIDOS DE ACORDO COM OS VÃOS PREVISTOS." |
| `ELETRONICOS_NAODEF_{instanceId}` | CC | BAIXO | "CLIENTE CIENTE E DE ACORDO QUE OS ELETRÔNICOS NÃO FORAM DEFINIDOS NO PROJETO E DEVERÃO SER ADQUIRIDOS DE ACORDO COM OS VÃOS PREVISTOS." |
| `RODAPE_AUSENTE_{instanceId}` | CC | BAIXO | "CLIENTE CIENTE E DE ACORDO QUE DEVERÁ INSTALAR RODAPÉ NA REGIÃO DOS MÓVEIS SOMENTE APÓS A FINALIZAÇÃO DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO." |
| `CORTINEIRO_NAOINSTALADO_{instanceId}` | **AVISO** | BAIXO | "AVISO: SERÁ CONSIDERADO VÃO DE 150MM PARA CORTINEIRO NÃO INSTALADO." — contribui +1 ao score mas não aparece no Resumo Executivo |
| `RODAPE_EXISTENTE_{instanceId}` | **AVISO** | null | "ROUPEIROS SERÃO INSTALADOS À FRENTE DO RODAPÉ EXISTENTE, COM ACABAMENTO EM MEIA-CANA NA PARTE DE TRÁS." — sem score, aparece apenas nas páginas de checklist |

### 13.3 Regra de Supressão G2.1/G2.2

```
se REFORM_SEM_REBOCO ∈ gatilhosAtivados:
  → não incluir REFORM_SEM_REVESTIMENTO na saída (mesmo que o gatilho estivesse ativo)
se REFORM_SEM_REBOCO ∉ gatilhosAtivados E REFORM_SEM_REVESTIMENTO ∈ gatilhosAtivados:
  → incluir REFORM_SEM_REVESTIMENTO normalmente
```

Na prática, a UI impede que ambos sejam ativos simultaneamente. A verificação no `ccBuilder` é uma salvaguarda.

---

## 14. Tela de Revisão (`StepRevisao`)

**Antes:** não existe.
**Depois:** tela final antes do PDF. Exibe:

1. `ScoreBadge` com score global (cor: vermelho / amarelo / verde).
2. Linha explicativa quando global = ALTO por ambiente: "Risco global classificado como ALTO porque um ou mais ambientes apresentam condição de risco alto." (CA-12).
3. Score por ambiente, listado individualmente.
4. Lista de CCs gerados por `ccBuilder`, agrupados por nível.
5. Links para voltar a cada etapa. Ao clicar em qualquer link de etapa a partir do resumo, o estado registra `_meta.origemNavegacao = 'revisao'`. Nas etapas de formulário, se `origemNavegacao = 'revisao'`, o botão "Avançar" é substituído por "Salvar e voltar ao resumo", que navega diretamente para `#/revisao` após gravar as respostas, sem percorrer etapas intermediárias. Ao chegar ao resumo, `_meta.origemNavegacao` é limpo.
6. Botão "Gerar PDF" → chama `services/pdf.js`.
7. Se `gerarPdf` lançar exceção: "Não foi possível gerar o PDF agora — tente novamente" + botão "Tentar Novamente" (CA-15).

Score e CCs são recalculados toda vez que o componente monta (inclui retorno de etapa anterior — CA-13).

---

## 15. Serviço de PDF (`services/pdf.js`)

**Antes:** arquivo não existe.
**Depois:** exporta `gerarPdf(state)` — função assíncrona que usa jsPDF + jspdf-autotable e dispara o download via `doc.save(nomeArquivo)`.

**Nome do arquivo:** `Checklist_ByArabi_{contrato}_{AAAA-MM-DD}.pdf`

### 15.1 Página 1 — Capa

| Elemento | Fonte |
|---|---|
| Cabeçalho da capa | Texto "By Arabi Planejados" em fonte serifada, sem imagem |
| Nome do cliente | `state.identificacao.nome` |
| Número do contrato | `state.identificacao.contrato` |
| Data de preenchimento | Data atual gerada no momento do download |
| Score de risco global | `scoreGlobal.classificacao` com destaque colorido (🔴/🟡/🟢) |

### 15.2 Página 2 — Resumo Executivo

Exibe apenas CCs de nível ALTO e MÉDIO. AVISOs não aparecem nesta página.

```
🔴 RISCO ALTO — [AMBIENTE ou "Global"]
   • [Descrição resumida do problema]
   → CC: [texto do CC]

🟡 RISCO MÉDIO — [AMBIENTE ou "Global"]
   • [Descrição resumida]

🟢 BAIXOS: [todos os CCs de nível Baixo em uma única linha separada por " | "]
```

Objetivo: máx. 1 página. Se ultrapassar: continua na página seguinte com mesma estrutura.

### 15.3 Páginas Seguintes — Checklist Completa

- Organizada por ambiente, na ordem de `state.ambientesSelecionados`.
- Para cada pergunta: rótulo → resposta do cliente.
- CC imediatamente abaixo da resposta que o originou.
- AVISO também posicionado junto à pergunta de origem (mesma posição dos CCs na página).

---

## 16. Tela de Sucesso e Recuperação de Rascunho

### 16.1 Tela de Sucesso (`StepSucesso`) — CA-17

Exibida após download. Conteúdo:
- "Seu PDF foi gerado com sucesso! Envie o arquivo para seu vendedor projetista pelo fluxo habitual."
- Botão "Iniciar novo preenchimento" → `dispatch(RESET_STATE)` → navega para `#/identificacao`.
- `RESET_STATE` remove a chave `byarabi_checklist_rascunho` do localStorage.

### 16.2 Recuperação de Rascunho (CA-16)

Ao montar o `FormProvider`:
1. Verifica `localStorage.getItem("byarabi_checklist_rascunho")`.
2. Se existir: exibe diálogo (antes de renderizar qualquer etapa):
   - **"Sim, continuar"** → `dispatch(RESTORE_STATE, dadosSalvos)` → navega para `state._meta.etapaAtual`.
   - **"Não, começar do zero"** → `dispatch(RESET_STATE)` → navega para `#/identificacao`.

---

## 17. Deploy — GitHub Pages + GitHub Actions

**Antes:** sem pipeline de CI/CD.
**Depois:** `.github/workflows/deploy.yml` com:
- Trigger: `push` em `main`.
- Steps: `checkout` → `setup-node` → `npm ci` → `npm run build` → `actions/deploy-pages`.
- `vite.config.js`: `base: '/{nome-do-repositório}/'` — configurado no setup inicial.
- HashRouter: rotas funcionam após refresh sem configuração adicional no servidor.

---

## 18. Observações sobre Conflitos e Divergências

As divergências abaixo foram identificadas entre `especificacao-checklist-dinamica.md` e `PRD_CHECKLIST_DINAMICA_CLIENTE.md`. **O PRD prevalece em todos os casos.**

### DIV-01 — Exibição dos campos de dados da TV

- **Spec:** campos da TV (Polegadas, Modelo, Largura, Altura, Profundidade, Link) aparecem apenas quando `tvPontoFinal = true`.
- **PRD CA-11:** "Em seguida, os campos de dados da TV são exibidos normalmente" — os campos aparecem após o registro do CC de ponto, ou seja, sempre que `tv = true`, independente do valor de `tvPontoFinal`.
- **Resolução:** campos da TV exibidos sempre que `tv = true` (seção 11.2 deste SPEC).
- **Justificativa:** a equipe de liberação precisa das dimensões da TV independentemente da posição do ponto elétrico.

### DIV-02 — Cortineiro: AVISO com score

- **Spec:** cortineiro não instalado é marcado como "AVISO" (não CC), mas aparece na tabela de score como "+1 Baixo".
- **PRD:** não classifica explicitamente, mas o critério de aceitação CA-9 menciona apenas o score de rebaixo (+1); nenhum CA cobre cortineiro isoladamente.
- **Resolução:** cortineiro não instalado gera AVISO (não CC), contribui +1 ao score do ambiente, não aparece no Resumo Executivo, aparece apenas nas páginas de checklist (seção 13.2 deste SPEC).

### DIV-03 — Rodapé existente: AVISO sem score

- **Spec:** Rodapé = SIM → "AVISO (não é CC): ROUPEIROS SERÃO INSTALADOS À FRENTE DO RODAPÉ..."
- **PRD:** não menciona score para esta condição.
- **Resolução:** Rodapé = SIM → AVISO sem score (seção 13.2). Rodapé = NÃO → CC + Baixo +1. Conforme spec.

### DIV-04 — Campo Telefone na Etapa 1

- **Spec:** "Telefone/celular" listado na Etapa 1.
- **PRD:** campo não mencionado nos CAs da Etapa 1 (CA-1 a CA-4), mas também não é excluído.
- **Resolução:** campo incluído como obrigatório, conforme a premissa 7 do PRD ("toda pergunta visível ao cliente é obrigatória salvo as marcadas como opcionais").

### DIV-05 — Texto e botões do pop-up G2.1

- **Spec:** menciona apenas "Pop-up de aviso RISCO ALTO" sem detalhar texto ou botões.
- **PRD CA-7:** especifica texto completo e os dois botões ("← Voltar" e "Assumo o risco e continuar") com comportamento exato.
- **Resolução:** implementar conforme PRD CA-7, descrito na seção 10.2 deste SPEC.

### DIV-06 — Ordem das perguntas em "Outros"

- **Spec:** menciona que "Outros recebe o mesmo conjunto completo de perguntas" sem definir ordem.
- **PRD CA-19:** define a ordem: granito → tanque → TV → cortineiro → rodapé → cama → eletros → cuba → eletrônicos → observações.
- **Resolução:** seguir ordem do PRD CA-19 (seção 11.5 deste SPEC).

### DIV-07 — Supressão de score de TV quando PONTOS_INDEFINIDOS ativo

- **Comportamento anterior:** `TV_PONTO_{instanceId}` sempre contribui +2 ao score do ambiente.
- **Decisão:** quando `PONTOS_INDEFINIDOS` está ativo (`g3_pontosNaPosicaoFinal = false`), o gatilho `TV_PONTO_{instanceId}` continua gerando CC normalmente, mas contribui **0 pontos** ao score.
- **Justificativa:** o CC de G3 (pontos indefinidos) já cobre a pendência elétrica; pontuar TV duplamente seria redundante nesse contexto.

### DIV-08 — Logo na capa do PDF

- **Spec original:** previa `public/logo-byarabi.png` como logotipo na capa do PDF.
- **Decisão:** usar texto "By Arabi Planejados" em fonte serifada, sem imagem.
- **Justificativa:** o CSS da marca não é renderizável por jsPDF; texto simples é mais robusto para a Fase 1.
