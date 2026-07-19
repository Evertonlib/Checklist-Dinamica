# PRD — Formulário do Projetista (internamente "Checklist do Vendedor")

> Documento de requisitos. Nenhum código foi escrito. Aguardando aprovação antes da implementação.
>
> **Esta é a segunda reescrita** do PRD anterior (mesmo arquivo). A base técnica das
> versões anteriores foi validada e é reaproveitada; este texto a atualiza com uma nova
> rodada de decisões fechadas pelo Everton: unidade de medida em milímetros, opção "não
> se aplica" em todas as perguntas, grupo de perguntas confirmado para Office e Outros,
> suporte a múltiplos contratos, adiamento da unificação de dobradiças/corrediças para
> uma versão futura, resolução do botão "Vendedor" do `BottomBar` por meio de uma prop
> aditiva, e a criação de uma seção própria de Critérios de Aceitação.

---

## 1. Objetivo da melhoria

Criar uma **segunda versão do formulário** da Checklist Dinâmica, destinada ao
**Projetista** preencher durante ou após a liberação técnica do projeto — enquanto o
formulário do cliente (já existente) coleta informações do ponto de vista de quem
comprou e calcula risco, o formulário do Projetista coleta **informações técnicas de
fabricação** dos ambientes já adquiridos: alturas de instalação, material de caixaria,
ferragens, fechamento até o teto e observações livres.

O acesso a este novo formulário passa a existir através de uma **tela de seleção**
exibida na entrada do app, com dois botões — **"Cliente"** e **"Projetista"** — que
direcionam para cada fluxo, hoje e daqui para frente totalmente independentes entre si.

O resultado final é um **PDF de relatório simples** (sem pontuação de risco, sem CCs,
sem qualquer processamento por IA), exibindo a identificação do cliente/contrato, que
segue **o mesmo caminho que o PDF do cliente já segue hoje**: entra no compactado da
medição e é encaminhado manualmente para o e-mail de liberação, fora deste repositório.

---

## 2. Nota de nomenclatura (ler antes de tudo)

Esta feature tem **dois nomes convivendo de propósito**, e a metodologia deste projeto
exige que essa distinção fique explícita para não gerar confusão na implementação:

| Camada | Nome a usar | Exemplos |
|---|---|---|
| **Front-end (tudo que o usuário final vê)** | **"Projetista"** | rótulo do botão na tela de seleção, títulos de tela ("Formulário do Projetista"), cabeçalho e nome do arquivo do PDF gerado, qualquer texto de interface | 
| **Interno (código, arquivos de processo, documentos técnicos)** | **"Vendedor"** | nome deste arquivo (`PRD_CHECKLIST_VENDEDOR.md`, não renomear), nome do Spec que virá depois (`SPEC_CHECKLIST_VENDEDOR.md`), rota `/vendedor/*`, provedor de estado (equivalente a `FormProviderVendedor`), chave de `localStorage` própria, nomes de componentes/pastas relacionados a este fluxo |

Nunca a palavra "Vendedor" deve aparecer em texto visível ao usuário nesta nova
funcionalidade — nem no botão da tela de seleção, nem nos títulos das telas do novo
formulário, nem no PDF gerado por ele.

> **Atenção a um ponto de confusão pré-existente:** o app já tem, hoje, um botão
> rotulado **"Vendedor"** no `BottomBar` (fluxo do cliente), que abre um modal dizendo
> "consulte seu vendedor projetista". Esse botão **não tem nenhuma relação** com esta
> melhoria, é anterior a ela, usa a palavra "Vendedor" como copy legítima do fluxo do
> cliente (falando sobre uma pessoa, não sobre esta feature). Seu **texto, comportamento
> e modal continuam exatamente iguais** nas telas do cliente — nada disso é renomeado ou
> alterado por causa da regra de nomenclatura acima, que vale para as telas **novas**
> desta melhoria, não retroage sobre o que já existe. A única mudança prevista
> relacionada a esse botão é fazê-lo **não aparecer nas telas do Projetista** (onde não
> faz sentido, pois o próprio Projetista veria um botão dizendo para "consultar o
> vendedor projetista"), através de uma nova prop opcional em `BottomBar.jsx` — decisão
> já fechada e detalhada nas Seções 3 e 8.7.

---

## 3. Relação com os arquivos e padrões existentes

A aplicação é um SPA em React + Vite, publicado no GitHub Pages, usando `HashRouter`,
sem backend. O fluxo do cliente hoje é:

1. **Identificação** (`/identificacao`) — nome, contrato, endereço, telefone.
2. **Ambientes** (`/ambientes`) — o usuário escolhe, dentre 8 ambientes fixos
   (`src/domain/ambientes.js` → `AMBIENTES_DISPONIVEIS`), quais existem no projeto e a
   quantidade de cada um. Cada seleção vira uma "instância" com `instanceId`, `tipo`,
   `formType`, `label` e `nome`.
3. **Perguntas Gerais** (`/globais`).
4. **Perguntas por Ambiente** (`/ambiente/:instanceId`).
5. **Revisão** (`/revisao`) — mostra score (`scoreEngine.js`), CCs (`ccBuilder.js`,
   `checklistTextos.js`) e dispara a geração do PDF (`services/pdf.js`).
6. **Sucesso** (`/sucesso`).

Hoje, `App.jsx` monta `HashRouter → FormProvider (cliente) → AppLayout`, e a rota `"/"`
apenas redireciona (`<Navigate to="/identificacao" />`) — não existe nenhuma tela
intermediária.

Pontos de contato reaproveitados pelo formulário do Projetista (lógica e padrão
visual, com implementação própria, nunca alterando o arquivo original, exceto onde
explicitamente indicado abaixo):

- **Lista de ambientes** — `AMBIENTES_DISPONIVEIS` e `formatarNomeAmbiente` em
  `src/domain/ambientes.js` continuam sendo a **única fonte de ambientes**, lida (nunca
  modificada) pelo novo formulário, garantindo que os dois ofereçam exatamente os
  mesmos 8 ambientes.
- **Seleção de ambientes** — `StepAmbientes.jsx` traz o padrão de
  incrementar/decrementar quantidade e nomear instâncias; o Projetista segue a mesma
  lógica de navegação.
- **Estado/persistência** — `FormProvider.jsx` (useReducer + `localStorage`, chave
  `byarabi_checklist_rascunho`, diálogo "continuar de onde parou") é o padrão a ser
  replicado, com **provedor e chave de `localStorage` próprios**, para não colidir com
  o rascunho do cliente.
- **Geração de PDF** — `services/pdf.js` (jsPDF + jspdf-autotable, capa com "By Arabi
  Planejados", nome, contrato, data) é reaproveitado como **padrão visual de capa e
  cabeçalho**, mas com um gerador próprio, sem score e sem CCs.
- **Validação de contrato** — o mesmo formato já usado hoje na identificação do cliente
  (prefixos `IT`, `SM`, `TA`, `PIN`, `STA` + números) é reaplicado a **cada** contrato
  informado pelo Projetista, já que agora é possível informar mais de um (Seção 5 e
  8.5).
- **Componentes genéricos** — `Header`, `FieldGroup`, `Modal`, `Stepper` e os
  `*.module.css` são reutilizáveis como estão, **sem nenhuma alteração**. `BottomBar`
  também é reaproveitado, mas recebe uma **única alteração aditiva**: uma nova prop
  opcional `mostrarBotaoVendedor` (default `true`) que envolve a renderização do botão
  de ajuda "Vendedor" num condicional. Como o valor padrão preserva 100% do
  comportamento atual, as 4 telas do cliente que hoje chamam `BottomBar`
  (`StepIdentificacao.jsx`, `StepAmbientes.jsx`, `StepPerguntasGlobais.jsx`,
  `StepPerguntasPorAmbiente.jsx`) continuam funcionando exatamente como hoje, **sem
  precisar alterar nenhuma delas** — apenas as telas novas do Projetista passam
  explicitamente `mostrarBotaoVendedor={false}`. Detalhado na Seção 8.7 e confirmado
  como critério de aceitação (Seção 11, CA-16).

---

## 4. Independência entre os formulários e ausência de IA (restrição dura)

Este ponto é um requisito não-negociável do Everton e vale mais do que qualquer
otimização de reaproveitamento de código:

- Os formulários **Cliente** e **Projetista** são **totalmente independentes**: sem
  integração entre eles, sem validação cruzada de dados (o sistema **não** verifica se
  o que o Projetista preencheu bate com o que o cliente preencheu), e sem qualquer
  lógica condicional que dependa de dados de um formulário para decidir o
  comportamento do outro.
- **Nenhum uso de LLM/IA em nenhum ponto** deste fluxo — nem para gerar textos, nem
  para interpretar, classificar ou resumir qualquer resposta.
- O formulário do Projetista é **100% determinístico**: as perguntas técnicas
  (fechamento até o teto, caixaria, dobradiças, corrediças) são de **escolha fechada**
  (SIM/NÃO, MDP/MDF, etc.), agora sempre acompanhadas também da opção **"não se
  aplica"** (Seção 5), e o sistema apenas grava a opção marcada — não há interpretação
  de conteúdo em nenhum dos casos.
- Existe também um **campo de medida numérica** (altura do piso para balcões e para
  armários, em ambientes com balcão, medida em **milímetros/mm**) — não é "escolha
  fechada" nem é "observação livre": é um valor numérico simples (dígitos), que também
  não exige nenhuma interpretação por parte do sistema. Esse campo também passa a ter
  uma opção **"não se aplica"** ao lado dele: quando marcada, substitui a exigência de
  número pelo valor fixo "não se aplica" — continua sendo uma resposta fechada e
  determinística, não texto livre.
- O único campo verdadeiramente de **texto livre** é **"Observações do Ambiente"**,
  com placeholder de exemplo — o sistema **apenas armazena e reproduz esse texto tal
  como digitado** no PDF, sem processá-lo, classificá-lo ou usá-lo para acionar
  qualquer regra. Qualquer julgamento técnico sobre o conteúdo dessa observação (ou
  sobre qualquer resposta do formulário) é feito por humanos na liberação, fora do
  app.
- Isso estende (não contradiz) o que já valia no PRD anterior — "sem score, sem CCs" —
  deixando explícito que **não haverá nenhum motor de regras/decisão** no fluxo do
  Projetista, além da simples exibição condicional de qual conjunto de perguntas
  aparece conforme o **tipo de ambiente escolhido** (não conforme respostas dadas —
  ver Seção 5).

---

## 5. Conteúdo do formulário do Projetista (baseado no documento "CHECK LIST PROJETISTA.docx")

O documento Word fornecido pelo Everton confirma que a distinção não é simplesmente
binária ("com balcão" × "sem balcão"): existem **três conjuntos de perguntas**, porque
Dormitórios e Home — ambos hoje classificados como "sem balcão" — não fazem exatamente
as mesmas perguntas entre si (Home não pergunta sobre fechamento até o teto).

Em **todas** as perguntas abaixo (numéricas e de escolha fechada) foi adicionada a
opção **"não se aplica"**, além das opções já previstas no Word. Nos dois campos de
altura (numéricos), "não se aplica" aparece como uma caixa/botão ao lado do campo: ao
ser marcada, o campo numérico deixa de ser exigido para o usuário avançar, e o valor
registrado passa a ser literalmente o texto "não se aplica" (nunca um número, nunca um
campo vazio). Nas perguntas de escolha fechada, "não se aplica" é simplesmente mais uma
opção de resposta, ao lado das já existentes. "Observações do ambiente" permanece
opcional e não recebe essa opção adicional, por já não ser de resposta obrigatória.

> **Requisito de UI:** os dois campos de altura devem exibir visivelmente a unidade
> **"mm"** junto ao campo (por exemplo, como sufixo dentro ou ao lado do input), pois
> tanto o vendedor quanto a equipe de liberação trabalham em milímetros — este é um
> requisito de interface, não apenas de formato interno do dado.

### Grupo A — "Com balcão" (Cozinha/Área de Serviço/Varanda, Banheiro, Outros)
1. Qual altura do piso será instalada os balcões? *(medida em mm, campo numérico com
   opção "não se aplica")*
2. Qual altura do piso será instalada os armários? *(medida em mm, campo numérico com
   opção "não se aplica")*
3. Haverá fechamento até o teto? *(SIM / NÃO / não se aplica)*
4. Caixarias ou corpos: *(MDP / MDF / não se aplica)*
5. Dobradiças: *(Convencionais / Amortecimento / não se aplica)*
6. Corrediças: *(Telescópicas / Ocultas / não se aplica)*
7. Observações do ambiente *(texto livre, opcional, com placeholder)*

### Grupo B — "Sem balcão, com fechamento" (Dormitório Casal, Dormitório Solteiro)
1. Caixarias ou corpos: *(MDP / MDF / não se aplica)*
2. Dobradiças: *(Convencionais / Amortecimento / não se aplica)*
3. Corrediças: *(Telescópicas / Ocultas / não se aplica)*
4. Haverá fechamento até o teto? *(SIM / NÃO / não se aplica)*
5. Observações do ambiente *(texto livre, opcional, com placeholder)*

### Grupo C — "Sem balcão, sem fechamento" (Home / Sala, Office)
1. Caixarias ou corpos: *(MDP / MDF / não se aplica)*
2. Dobradiças: *(Convencionais / Amortecimento / não se aplica)*
3. Corrediças: *(Telescópicas / Ocultas / não se aplica)*
4. Observações do ambiente *(texto livre, opcional, com placeholder)*

### Mapeamento por ambiente disponível (confirmado)

| Ambiente (label em `ambientes.js`) | Grupo de perguntas | Está no Word? |
|---|---|---|
| Cozinha / Área de Serviço          | A (com balcão)                     | Sim |
| Varanda / Área Gourmet             | A (com balcão)                     | Sim (agrupado com Cozinha/Área de Serviço) |
| Banheiro / W.C.                    | A (com balcão)                     | Sim |
| Dormitório Casal                   | B (sem balcão, com fechamento)     | Sim |
| Dormitório Solteiro                | B (sem balcão, com fechamento)     | Sim |
| Home / Sala                        | C (sem balcão, sem fechamento)     | Sim |
| Office                             | **C** — mesmo grupo de Home, decisão confirmada pelo Everton | Não consta no Word, decisão fechada |
| Outros                             | **A** — sempre o grupo mais completo, decisão confirmada pelo Everton | Não consta no Word, decisão fechada |

Não há mais pendência sobre a classificação de nenhum dos 8 ambientes.

### Identificação do Projetista
O Word pede, no topo do documento, dois campos de identificação: **Contrato(s)** e
**Nome completo do cliente**. O nome completo do cliente é um campo único e
obrigatório, sem repetir endereço/telefone do cliente. Quanto ao contrato — o detalhe
"(S)" ao lado de "CONTRATO" no Word, que sugeria a possibilidade de mais de um
contrato, fica **confirmado**: a tela de identificação do Projetista oferece um campo
inicial de contrato e um **botão "+"** para adicionar quantos campos de contrato forem
necessários. Cada contrato informado (o primeiro e os adicionais) é validado no mesmo
formato já usado na identificação do cliente (prefixos `IT`, `SM`, `TA`, `PIN`, `STA` +
números); um contrato em formato inválido, em qualquer posição, bloqueia o avanço.
Todos os contratos informados aparecem no conteúdo do PDF gerado, mas **apenas o
primeiro contrato informado** é usado para compor o nome do arquivo do PDF (Seção 7).

---

## 6. Padrão de roteamento e composição do app (tela de seleção na raiz)

Com `HashRouter`, toda rota é resolvida no navegador (após o `#`), sem exigir nenhuma
configuração de servidor, fallback 404, ou mudança em `vite.config.js`/deploy — isso
continua valendo e é a razão pela qual a rota nova pode ser adicionada com segurança.

O que muda em relação ao PRD anterior: antes, a rota `"/"` apenas redirecionava
silenciosamente para `/identificacao`, e o `FormProvider` do cliente envolvia
incondicionalmente toda a árvore de telas. Agora:

- A rota `"/"` deixa de redirecionar automaticamente e passa a renderizar uma **tela de
  seleção** própria, com dois botões — "Cliente" e "Projetista" — sem depender de
  nenhum estado de formulário (nem do cliente, nem do Projetista) para ser exibida.
- Escolher **"Cliente"** leva ao fluxo hoje existente em `/identificacao` — idêntico em
  comportamento, campos, score e PDF; muda apenas o ponto de entrada, que passa a ser
  precedido por essa tela de seleção.
- Escolher **"Projetista"** leva ao novo ramo de rotas `/vendedor/*` (nome interno —
  ver Seção 2).
- Como consequência direta, o `FormProvider` do cliente **deixa de envolver a
  aplicação inteira** e passa a envolver **apenas o ramo de rotas do cliente**
  (`/identificacao`, `/ambientes`, `/globais`, `/ambiente/:instanceId`, `/revisao`,
  `/sucesso`). Isso evita que o diálogo "continuar de onde parou" do cliente apareça
  antes mesmo de o usuário escolher "Cliente" na tela de seleção, e evita que o estado
  do cliente seja inicializado sem necessidade.
- O ramo `/vendedor/*` é envolvido pelo **provedor de estado próprio** do Projetista,
  isolado do provedor do cliente.

Essa reorganização do `App.jsx` (mover o `FormProvider` de "sempre montado" para
"montado por ramo de rota") é **mais ampla do que a mudança puramente aditiva** descrita
no PRD original (que previa apenas adicionar uma rota irmã). Por isso está detalhada
aqui, sinalizada como risco na Seção 13, e deve ser cuidadosamente revisada na
implementação para que o comportamento do fluxo do cliente permaneça idêntico depois
de escolhido "Cliente" na tela de seleção.

---

## 7. Caminho do PDF até a liberação (sem alteração fora deste repositório)

Confirmação de pesquisa: **não existe nenhum arquivo `assistente_email.py` neste
repositório** (`Checklist-Dinamica`). Esse script vive em um projeto separado, fora
deste repo. Este app é 100% client-side (sem backend), hospedado no GitHub Pages, e
**não tem, nem nunca teve, nenhuma integração de envio de e-mail**.

Portanto, para esta melhoria:

- A única responsabilidade deste app é **gerar o PDF do Projetista**, no mesmo padrão
  visual (capa "By Arabi Planejados", identificação, data) e mesmo mecanismo de
  download (arquivo local, via `jsPDF`, disparado por um clique) que o PDF do cliente
  já usa hoje.
- O nome do arquivo do PDF do Projetista segue o padrão **confirmado**
  `Checklist_Projetista_{primeiro_contrato}_{data}.pdf` (ex.:
  `Checklist_Projetista_SM1234_2026-06-09.pdf`) — visivelmente distinto do nome do PDF
  do cliente (hoje `Checklist_ByArabi_{contrato}_{data}.pdf`), para que os dois
  arquivos possam conviver lado a lado no mesmo compactado da medição sem se
  sobrescreverem. Usa a palavra "Projetista" (front-end facing, nomenclatura da
  Seção 2).
- Quando mais de um contrato é informado na identificação (Seção 5), **apenas o
  primeiro contrato informado** entra no nome do arquivo — os demais aparecem somente
  no conteúdo do PDF (na identificação), nunca no nome do arquivo.
- A inclusão desse PDF no compactado da medição e o encaminhamento para o e-mail de
  liberação **são processos manuais (ou automatizados em outro sistema), totalmente
  fora do alcance deste repositório**.
- **Nenhuma alteração é necessária ou permitida** em `assistente_email.py` ou em
  qualquer rota de e-mail — isso está fora do escopo desta melhoria (ver também Seção
  10, "O que NÃO será tocado").

---

## 8. O que será adicionado

### 8.1 Tela de seleção
- Uma tela na raiz da aplicação (`"/"`) com dois botões: **"Cliente"** e
  **"Projetista"**, sem estado de formulário associado.

### 8.2 Roteamento do Projetista
- Um ramo de rotas `/vendedor/*` (nome interno), com subtelas próprias: identificação
  mínima (contrato(s) + nome do cliente), seleção de ambientes, perguntas por ambiente,
  revisão/geração de PDF, sucesso.

### 8.3 Estado do Projetista
- Um provedor de estado próprio (espelhando o padrão do `FormProvider` do cliente),
  com **chave de `localStorage` exclusiva** (nome interno, ex.:
  `byarabi_checklist_vendedor`), independente do rascunho do cliente.
- Estrutura de dados própria: identificação (**lista de um ou mais contratos** + nome)
  + lista de ambientes selecionados + respostas por ambiente, conforme os Grupos A/B/C
  da Seção 5, incluindo o valor "não se aplica" como resposta válida em qualquer campo
  aplicável.

### 8.4 Classificação de ambientes em grupos de perguntas
- Um mapa novo (próprio do Projetista, sem alterar `ambientes.js`) que associa cada
  ambiente a um dos três grupos (A, B ou C) descritos na Seção 5, já com a
  classificação de Office (C) e Outros (A) confirmada.

### 8.5 Telas do Projetista
- **Identificação mínima:** um ou mais contratos (o primeiro sempre presente, com
  botão "+" para adicionar outros, cada um com a mesma máscara/validação do cliente) e
  nome completo do cliente.
- **Seleção de ambientes:** reaproveita a lógica de `StepAmbientes` (mesmos 8
  ambientes, quantidades, nomes personalizados).
- **Perguntas por ambiente:** renderiza o Grupo A, B ou C conforme a classificação
  confirmada do ambiente (Seção 5), com a opção "não se aplica" disponível em toda
  pergunta numérica ou de escolha fechada, e os campos de altura exibindo a unidade
  "mm" visivelmente.
- **Revisão + Gerar PDF** e **Sucesso**, no mesmo padrão visual do cliente, porém sem
  nenhum score ou CC — apenas confirmação dos dados preenchidos.

### 8.6 PDF do Projetista
- Um gerador de PDF próprio (estilo de capa/cabeçalho reaproveitado do PDF do cliente:
  marca "By Arabi Planejados", identificação, data).
- Conteúdo: **somente relatório dos dados preenchidos**, agrupado por ambiente,
  listando pergunta e resposta (incluindo a observação livre, reproduzida tal como
  digitada, o texto "não se aplica" onde marcado, e a unidade "mm" junto às alturas
  informadas). **Sem score, sem classificação de risco, sem CCs, sem "Resumo
  Executivo".**
- Nome de arquivo no padrão confirmado `Checklist_Projetista_{primeiro_contrato}_{data}.pdf`,
  distinto do PDF do cliente, usando apenas o primeiro contrato quando houver mais de
  um (Seção 7).

### 8.7 Ocultação do botão "Vendedor" nas telas do Projetista
- Nova prop opcional em `BottomBar.jsx`: `mostrarBotaoVendedor` (default `true`).
  Quando `false`, o botão de ajuda "Vendedor" (e seu modal) simplesmente não é
  renderizado.
- É uma alteração **aditiva e retrocompatível** no único arquivo compartilhado — os 4
  call sites do fluxo do cliente (`StepIdentificacao.jsx`, `StepAmbientes.jsx`,
  `StepPerguntasGlobais.jsx`, `StepPerguntasPorAmbiente.jsx`) **não precisam ser
  alterados**, pois o default `true` preserva o comportamento atual.
- As telas novas do Projetista passam explicitamente `mostrarBotaoVendedor={false}`
  ao usar o mesmo `BottomBar`.

---

## 9. O que será removido / alterado em comportamento existente

- **Removido:** o redirecionamento automático e silencioso da rota `"/"` para
  `/identificacao`. Ele é **substituído** pela tela de seleção (Seção 6/8.1) — quem
  escolhe "Cliente" chega no mesmo lugar de antes, só que com um clique a mais.
- **Alterado (reorganização interna, sem mudança de comportamento visível ao cliente):**
  o `FormProvider` do cliente deixa de envolver toda a aplicação e passa a envolver
  apenas o ramo de rotas do cliente (Seção 6).
- **Alterado (aditivo, sem mudança de comportamento visível ao cliente):** `BottomBar.jsx`
  ganha a prop opcional `mostrarBotaoVendedor` (Seção 8.7); nenhuma das 4 telas do
  cliente que já o utilizam muda de comportamento, pois o valor padrão mantém o botão
  "Vendedor" visível exatamente como hoje.
- **Nada mais é removido.** Nenhum campo, componente, cálculo de score, CC ou
  comportamento do formulário do cliente é eliminado.

---

## 10. O que NÃO será tocado (em hipótese alguma)

- Todo o **conteúdo e comportamento** do formulário do cliente depois de escolhido
  "Cliente" na tela de seleção: `StepIdentificacao`, `StepAmbientes`,
  `StepPerguntasGlobais` (e blocos), `StepPerguntasPorAmbiente` (e todos os `Form*`),
  `StepRevisao`, `StepSucesso`.
- A lógica de **score e CCs**: `scoreEngine.js`, `ccBuilder.js`, `checklistTextos.js`.
- O **gerador de PDF do cliente** (`src/services/pdf.js`).
- O **reducer/estrutura de dados do cliente** (`FormProvider`/`schema.js`) e a chave
  `byarabi_checklist_rascunho`.
- A definição compartilhada `AMBIENTES_DISPONIVEIS` em `ambientes.js` (será **lida**,
  nunca modificada).
- O **texto, copy e comportamento** do botão "Vendedor" e do modal de ajuda existentes
  no `BottomBar` para as telas do **cliente** (ver nota da Seção 2 — copy pré-existente,
  sem relação com esta melhoria). O único ajuste permitido em `BottomBar.jsx` é a nova
  prop aditiva `mostrarBotaoVendedor` (Seção 8.7), que não altera o texto, o modal, nem
  o comportamento do botão quando ele é exibido — apenas controla se ele é renderizado
  ou não.
- Configurações de build/deploy: `vite.config.js`, workflow do GitHub Pages,
  `index.html` (`base`, `HashRouter`).
- **Qualquer arquivo fora deste repositório**, em especial `assistente_email.py` e
  qualquer rota de envio de e-mail — confirmadamente fora do alcance e do escopo desta
  melhoria (Seção 7).
- **Qualquer uso de LLM/IA** — não haverá, em nenhum momento, chamada a serviços de
  IA neste fluxo (Seção 4).

---

## 11. Critérios de aceitação

Cada critério descreve um cenário de entrada e o resultado esperado, para validação
manual depois da implementação.

- **CA-01 — Escolha de perfil "Projetista".** Entrada: na tela de seleção inicial
  (`"/"`), o usuário clica em "Projetista". Resultado esperado: é levado ao formulário
  do Projetista (rota interna `/vendedor/*`), iniciando pela tela de identificação
  mínima.
- **CA-02 — Escolha de perfil "Cliente".** Entrada: na tela de seleção inicial, o
  usuário clica em "Cliente". Resultado esperado: é levado a `/identificacao` e todo o
  fluxo se comporta exatamente como hoje (mesmos campos, score e PDF), sem nenhuma
  diferença além do clique inicial.
- **CA-03 — Ambiente do Grupo A.** Entrada: no formulário do Projetista, o usuário
  seleciona um ambiente com balcão (ex.: Cozinha) e abre a tela de perguntas desse
  ambiente. Resultado esperado: aparecem as 7 perguntas do Grupo A, incluindo os dois
  campos de altura (balcão e armário), cada um exibindo visivelmente a unidade "mm".
- **CA-04 — Ambiente do Grupo B.** Entrada: o usuário seleciona "Dormitório Casal" (ou
  "Dormitório Solteiro"). Resultado esperado: aparecem as perguntas do Grupo B
  (caixaria, dobradiças, corrediças, fechamento até o teto, observações), sem nenhum
  campo de altura.
- **CA-05 — Ambiente do Grupo C (Home ou Office).** Entrada: o usuário seleciona "Home
  / Sala" ou "Office". Resultado esperado: aparecem as perguntas do Grupo C (caixaria,
  dobradiças, corrediças, observações), sem altura e sem pergunta de fechamento até o
  teto.
- **CA-06 — Ambiente "Outros".** Entrada: o usuário seleciona "Outros". Resultado
  esperado: aparecem as perguntas completas do Grupo A, incluindo os dois campos de
  altura em mm.
- **CA-07 — "Não se aplica" em campo de altura.** Entrada: em um campo de altura
  (Grupo A), o usuário marca a caixa/botão "não se aplica" ao lado do campo, sem
  digitar nenhum número. Resultado esperado: o sistema permite avançar; a resposta
  registrada para esse campo é literalmente "não se aplica".
- **CA-08 — "Não se aplica" em pergunta de escolha fechada.** Entrada: em uma pergunta
  de caixaria (ou dobradiças, corrediças, fechamento até o teto), o usuário marca "não
  se aplica" em vez de escolher uma das opções. Resultado esperado: o sistema permite
  avançar; a resposta registrada é "não se aplica".
- **CA-09 — Bloqueio por ausência total de resposta.** Entrada: o usuário tenta
  avançar numa pergunta sem escolher nenhuma opção e sem marcar "não se aplica" (e, no
  caso de campo de altura, sem digitar número). Resultado esperado: o avanço é
  bloqueado e uma mensagem de erro é exibida pedindo para responder a pergunta.
- **CA-10 — Adição de múltiplos contratos.** Entrada: na identificação do Projetista,
  o usuário preenche o primeiro contrato, clica no botão "+" e adiciona um segundo
  contrato em formato válido. Resultado esperado: os dois contratos ficam registrados
  e o avanço é permitido.
- **CA-11 — Contrato em formato inválido.** Entrada: o usuário digita, em qualquer um
  dos campos de contrato (o primeiro ou um adicional), um valor que não segue o
  formato esperado (prefixo `IT`/`SM`/`TA`/`PIN`/`STA` + números). Resultado esperado:
  o avanço é bloqueado e uma mensagem de erro de formato é exibida.
- **CA-12 — Geração de PDF sem ambientes.** Entrada: o usuário chega à tela de revisão
  do Projetista sem ter selecionado nenhum ambiente e tenta gerar o PDF. Resultado
  esperado: a geração é bloqueada, com mensagem de erro, e nenhum arquivo é baixado.
- **CA-13 — Conteúdo do PDF gerado.** Entrada: o usuário preenche ao menos um ambiente
  completo, incluindo um campo marcado como "não se aplica", e gera o PDF. Resultado
  esperado: o PDF mostra apenas o relatório dos dados preenchidos (pergunta e resposta
  por ambiente), sem pontuação de risco, sem CCs e sem "Resumo Executivo"; onde "não se
  aplica" foi marcado, o PDF exibe literalmente "não se aplica"; os campos de altura
  aparecem com a unidade "mm".
- **CA-14 — Nome do arquivo usa só o primeiro contrato.** Entrada: o usuário preenche
  dois ou mais contratos na identificação e gera o PDF. Resultado esperado: o nome do
  arquivo baixado contém apenas o primeiro contrato informado; os demais contratos
  aparecem no conteúdo do PDF, não no nome do arquivo.
- **CA-15 — Isolamento de rascunho entre Cliente e Projetista.** Entrada: o usuário
  preenche parcialmente o formulário do Cliente, sai sem finalizar, depois abre o
  formulário do Projetista e preenche dados diferentes, também sem finalizar.
  Resultado esperado: ao reabrir cada formulário separadamente, cada um oferece
  "continuar de onde parou" com os próprios dados, sem que um sobrescreva ou misture
  dados com o outro.
- **CA-16 — Botão "Vendedor" oculto no Projetista, visível no Cliente.** Entrada: o
  usuário navega por qualquer tela do formulário do Projetista (identificação,
  ambientes, perguntas, revisão). Resultado esperado: o botão "Vendedor" do rodapé não
  aparece em nenhuma dessas telas. Ao navegar pelas telas equivalentes do formulário do
  Cliente, o botão "Vendedor" continua aparecendo e funcionando exatamente como hoje.

---

## 12. Premissas assumidas

1. **Identificação do Projetista:** um ou mais contratos (confirmado — Seção 5) +
   nome completo do cliente, ambos obrigatórios, sem repetir endereço/telefone
   (confirmado pelo Word — Seção 5).
2. **Validação de cada contrato** segue o mesmo formato do cliente (prefixos `IT`,
   `SM`, `TA`, `PIN`, `STA` + números), aplicada individualmente a todos os contratos
   informados, sejam eles o primeiro ou adicionais pelo botão "+".
3. **Campos de altura** (balcões e armários, Grupo A) são medidas numéricas em
   **milímetros (mm)**, exibidas com a unidade visível na interface (Seção 5), e são
   tratados como **campo estruturado numérico** — não como "escolha fechada" nem como
   "observação livre" — por isso não violam a regra de ausência de processamento de
   texto (um número não exige interpretação). Cada um também aceita "não se aplica"
   como resposta alternativa ao número.
4. **Todas as perguntas do formulário do Projetista são de resposta obrigatória**, no
   sentido de que o usuário precisa fornecer alguma resposta para avançar — mas essa
   resposta pode ser uma opção de escolha fechada, um número (nos campos de altura) ou
   "não se aplica", que conta como resposta válida em qualquer uma delas. Deixar o
   campo em branco, sem nenhuma dessas três formas de resposta, bloqueia o avanço.
   "Observações do ambiente" continua sendo a única exceção, opcional, texto livre com
   placeholder de exemplo, sem limite reforçado além do padrão já usado no cliente
   (300 caracteres).
5. **Sem login/senha:** o acesso ao formulário do Projetista continua sem
   autenticação — tanto pela tela de seleção quanto por link direto à rota interna.
6. **Persistência local:** o Projetista também tem "continuar de onde parou", no mesmo
   padrão do cliente, com chave de `localStorage` separada.
7. **Reaproveitamento de quantidades e nomes** de ambiente segue o padrão atual (vários
   do mesmo tipo, com nome para identificar).
8. **Grupo de perguntas de "Office"** é o mesmo de "Home" (Grupo C, sem fechamento até
   o teto) — decisão confirmada pelo Everton, não é mais uma suposição (Seção 5).
9. **Grupo de perguntas de "Outros"** é sempre o Grupo A (com balcão, o mais completo)
   — decisão confirmada pelo Everton (Seção 5).
10. **Prop `mostrarBotaoVendedor` do `BottomBar`** assume valor padrão `true`,
    justamente para que nenhum dos 4 call sites existentes do fluxo do cliente precise
    ser alterado; presume-se que a implementação respeitará esse default (Seção 8.7).

---

## 13. Riscos identificados

1. **Reorganização do `App.jsx` além do puramente aditivo.** Mover o `FormProvider` do
   cliente de "sempre montado" para "montado por ramo de rota" é uma mudança
   estrutural na raiz de composição — maior que a simples adição de uma rota irmã
   prevista no PRD original. *Mitigação:* revisar cuidadosamente para que o
   comportamento do fluxo do cliente (incluindo o diálogo de rascunho) permaneça
   idêntico ao de hoje depois de escolhido "Cliente".
2. **Conflito de reaproveitamento do `BottomBar` — mitigado.** O botão de ajuda
   "Vendedor" embutido nesse componente genérico não fazia sentido nas telas do
   próprio Projetista. *Mitigação aplicada:* nova prop opcional
   `mostrarBotaoVendedor` (default `true`), usada como `false` apenas nas telas do
   Projetista, sem exigir alteração nos 4 call sites existentes do cliente (Seção
   8.7). Risco mantido no documento apenas como registro histórico da decisão.
3. **Confusão de nomenclatura Projetista × Vendedor.** Por serem literalmente o mesmo
   conceito de negócio, é fácil um texto "Vendedor" escapar para a interface por
   engano. *Mitigação:* seguir rigorosamente a tabela da Seção 2 e revisar toda copy
   nova antes de finalizar.
4. **Terceiro grupo de perguntas não identificado a tempo.** Se a distinção entre
   Grupo B (Dormitórios) e Grupo C (Home/Office) não for respeitada, o PDF do
   Projetista pode sair com uma pergunta de fechamento que o Word não previa para
   Home/Office (ou vice-versa). *Mitigação:* Seção 5 documenta a diferença de forma
   explícita, item a item, com a classificação de todos os 8 ambientes já confirmada.
5. **Ambientes sem correspondência no Word (Office, Outros) — mitigado.** Podiam ser
   classificados no grupo errado por falta de informação do documento original.
   *Mitigação aplicada:* decisão fechada pelo Everton — Office segue o Grupo C, Outros
   segue o Grupo A (Seção 5). Risco mantido apenas como registro histórico.
6. **Colisão de nome de arquivo do PDF.** Se o PDF do Projetista usar o mesmo padrão de
   nome do PDF do cliente, um pode sobrescrever o outro dentro do compactado da
   medição. *Mitigação:* nome de arquivo distinto, usando sempre apenas o primeiro
   contrato mesmo quando há vários (Seção 7).
7. **Acoplamento de estado via `localStorage`.** Se a chave do Projetista não for
   exclusiva, os rascunhos do cliente e do Projetista podem se sobrescrever.
   *Mitigação:* chave dedicada e provedor isolado (Seção 8.3), validado pelo CA-15.
8. **PDF em branco/erro de geração.** Se nenhum ambiente for selecionado, ou a
   biblioteca de PDF falhar, o Projetista pode ficar sem feedback. *Mitigação:*
   tratamento de erro e bloqueio de geração sem ambientes, igual ao cliente, validado
   pelo CA-12.
9. **Divergência futura da lista de ambientes.** Como o Projetista reusa
   `AMBIENTES_DISPONIVEIS`, qualquer alteração futura nessa lista afeta os dois
   formulários — desejado, mas precisa estar documentado.
10. **Confusão entre "não se aplica" e campo vazio.** Se a implementação não
    distinguir claramente esses dois estados (por exemplo, salvando `null` em vez do
    texto "não se aplica", ou permitindo avançar com o campo realmente vazio),
    o PDF pode ficar ambíguo sobre se a pergunta foi respondida ou simplesmente
    ignorada. *Mitigação:* Seção 5 define que o valor registrado é literalmente o
    texto "não se aplica", nunca `null`/vazio, e o CA-09 valida o bloqueio de avanço
    sem nenhuma forma de resposta.

---

## 14. Melhorias futuras (fora do escopo desta versão)

- **Adição de opções de marca às perguntas de dobradiças e corrediças.** Nesta v1,
  dobradiças (Convencional / Amortecimento) e corrediças (Telescópicas / Ocultas)
  permanecem **duas perguntas separadas** — isso não muda em nenhuma versão futura —,
  cada uma com exatamente as opções atuais, em todos os Grupos A/B/C. Uma versão
  futura vai **adicionar novas opções de marca a cada uma dessas duas perguntas**,
  além das opções já existentes (por exemplo, Blum e Hafele), sem unificá-las numa
  pergunta só. **Esta adição de opções está fora do escopo desta versão e não deve
  ser implementada agora.**

---

## 15. Decisões pendentes (para aprovação do Everton)

Nenhuma decisão pendente restante. Todas as decisões (contrato único ou múltiplo,
grupo de perguntas de "Office" e "Outros", tratamento do botão "Vendedor" no
`BottomBar`, e o padrão de nome do arquivo do PDF do Projetista —
`Checklist_Projetista_{primeiro_contrato}_{data}.pdf`) foram fechadas pelo Everton e
já estão refletidas neste documento.

> Nenhum código será escrito antes da aprovação deste PRD.
