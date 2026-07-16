# PRD — Formulário do Projetista (internamente "Checklist do Vendedor")

> Documento de requisitos. Nenhum código foi escrito. Aguardando aprovação antes da implementação.
>
> **Esta é uma reescrita** do PRD anterior (mesmo arquivo). A base técnica do documento
> anterior foi validada e é reaproveitada; este texto a atualiza com um conjunto de
> requisitos novos trazidos pelo Everton: tela de seleção na entrada, nomenclatura
> "Projetista" (front) × "Vendedor" (interno), independência total entre os dois
> formulários (sem IA, sem lógica cruzada), e o caminho do PDF gerado até a liberação.

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
> cliente (falando sobre uma pessoa, não sobre esta feature) e **não deve ser renomeado
> nem alterado** só por causa da regra de nomenclatura acima — essa regra vale para as
> telas **novas** desta melhoria, não retroage sobre o que já existe.

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
visual, com implementação própria, nunca alterando o arquivo original):

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
- **Componentes genéricos** — `Header`, `FieldGroup`, `Modal`, `Stepper` e os
  `*.module.css` são reutilizáveis como estão. **Exceção:** `BottomBar` traz embutido o
  botão de ajuda "Vendedor" citado na Seção 2, pensado para o cliente falar com o
  Projetista — reutilizá-lo cru nas telas do Projetista faria pouco sentido (o próprio
  Projetista veria um botão dizendo para "consultar o vendedor"). Isso está registrado
  como ponto de atenção na Seção 11 (riscos) e Seção 13 (decisões pendentes).

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
  (SIM/NÃO, MDP/MDF, etc.) e o sistema apenas grava a opção marcada — não há
  interpretação de conteúdo.
- Existe também um **campo de medida numérica** (altura do piso para balcões e para
  armários, em ambientes com balcão) — não é "escolha fechada" nem é "observação
  livre": é um valor numérico simples (dígitos), que também não exige nenhuma
  interpretação por parte do sistema.
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

### Grupo A — "Com balcão" (Cozinha/Área de Serviço/Varanda, Banheiro)
1. Qual altura do piso será instalada os balcões? *(medida em cm)*
2. Qual altura do piso será instalada os armários? *(medida em cm)*
3. Haverá fechamento até o teto? *(SIM / NÃO)*
4. Caixarias ou corpos: *(MDP / MDF)*
5. Dobradiças: *(Convencionais / Amortecimento)*
6. Corrediças: *(Telescópicas / Ocultas)*
7. Observações do ambiente *(texto livre, com placeholder)*

### Grupo B — "Sem balcão, com fechamento" (Dormitório Casal, Dormitório Solteiro)
1. Caixarias ou corpos: *(MDP / MDF)*
2. Dobradiças: *(Convencionais / Amortecimento)*
3. Corrediças: *(Telescópicas / Ocultas)*
4. Haverá fechamento até o teto? *(SIM / NÃO)*
5. Observações do ambiente *(texto livre, com placeholder)*

### Grupo C — "Sem balcão, sem fechamento" (Home / Sala)
1. Caixarias ou corpos: *(MDP / MDF)*
2. Dobradiças: *(Convencionais / Amortecimento)*
3. Corrediças: *(Telescópicas / Ocultas)*
4. Observações do ambiente *(texto livre, com placeholder)*

### Mapeamento por ambiente disponível

| Ambiente (label em `ambientes.js`) | Grupo de perguntas | Está no Word? |
|---|---|---|
| Cozinha / Área de Serviço          | A (com balcão)                     | Sim |
| Varanda / Área Gourmet             | A (com balcão)                     | Sim (agrupado com Cozinha/Área de Serviço) |
| Banheiro / W.C.                    | A (com balcão)                     | Sim |
| Dormitório Casal                   | B (sem balcão, com fechamento)     | Sim |
| Dormitório Solteiro                | B (sem balcão, com fechamento)     | Sim |
| Home / Sala                        | C (sem balcão, sem fechamento)     | Sim |
| Office                             | **Inferido como C** (mesmo `formType` de Home hoje) | **Não consta no Word** — pendente de confirmação |
| Outros                             | **Indefinido**                      | **Não consta no Word** — pendente de confirmação |

> **Ponto a confirmar com o Everton:** o Word não trata "Office" nem "Outros"
> separadamente. A Seção 13 traz a recomendação e as alternativas para os dois casos.

### Identificação do Projetista
O Word pede, no topo do documento, dois campos de identificação: **Contrato(s)** e
**Nome completo do cliente**. Diferente da premissa do PRD anterior (que cogitava só o
contrato), fica confirmado que **ambos os campos são obrigatórios** — sem repetir
endereço/telefone do cliente. O detalhe "(S)" ao lado de "CONTRATO" no Word (sugerindo
possibilidade de mais de um contrato) é tratado como decisão pendente na Seção 13.

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
no PRD anterior (que previa apenas adicionar uma rota irmã). Por isso está detalhada
aqui, sinalizada como risco na Seção 12, e deve ser cuidadosamente revisada na
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
- O nome do arquivo do PDF do Projetista deve ser **visivelmente distinto** do nome do
  PDF do cliente (hoje `Checklist_ByArabi_{contrato}_{data}.pdf`), para que os dois
  arquivos possam conviver lado a lado no mesmo compactado da medição sem se
  sobrescreverem — por exemplo, um nome que inclua a palavra "Projetista" (front-end
  facing, portanto usa a nomenclatura da Seção 2).
- A inclusão desse PDF no compactado da medição e o encaminhamento para o e-mail de
  liberação **são processos manuais (ou automatizados em outro sistema), totalmente
  fora do alcance deste repositório**.
- **Nenhuma alteração é necessária ou permitida** em `assistente_email.py` ou em
  qualquer rota de e-mail — isso está fora do escopo desta melhoria (ver também Seção
  9, "O que NÃO será tocado").

---

## 8. O que será adicionado

### 8.1 Tela de seleção
- Uma tela na raiz da aplicação (`"/"`) com dois botões: **"Cliente"** e
  **"Projetista"**, sem estado de formulário associado.

### 8.2 Roteamento do Projetista
- Um ramo de rotas `/vendedor/*` (nome interno), com subtelas próprias: identificação
  mínima (contrato + nome do cliente), seleção de ambientes, perguntas por ambiente,
  revisão/geração de PDF, sucesso.

### 8.3 Estado do Projetista
- Um provedor de estado próprio (espelhando o padrão do `FormProvider` do cliente),
  com **chave de `localStorage` exclusiva** (nome interno, ex.:
  `byarabi_checklist_vendedor`), independente do rascunho do cliente.
- Estrutura de dados própria: identificação (contrato + nome) + lista de ambientes
  selecionados + respostas por ambiente, conforme os Grupos A/B/C da Seção 5.

### 8.4 Classificação de ambientes em grupos de perguntas
- Um mapa novo (próprio do Projetista, sem alterar `ambientes.js`) que associa cada
  ambiente a um dos três grupos (A, B ou C) descritos na Seção 5.

### 8.5 Telas do Projetista
- **Identificação mínima:** contrato (mesma máscara/validação do cliente, decisão
  sobre singular/plural pendente — Seção 13) e nome completo do cliente.
- **Seleção de ambientes:** reaproveita a lógica de `StepAmbientes` (mesmos 8
  ambientes, quantidades, nomes personalizados).
- **Perguntas por ambiente:** renderiza o Grupo A, B ou C conforme a classificação do
  ambiente (decisão sobre Office/Outros pendente).
- **Revisão + Gerar PDF** e **Sucesso**, no mesmo padrão visual do cliente, porém sem
  nenhum score ou CC — apenas confirmação dos dados preenchidos.

### 8.6 PDF do Projetista
- Um gerador de PDF próprio (estilo de capa/cabeçalho reaproveitado do PDF do cliente:
  marca "By Arabi Planejados", identificação, data).
- Conteúdo: **somente relatório dos dados preenchidos**, agrupado por ambiente,
  listando pergunta e resposta (incluindo a observação livre, reproduzida tal como
  digitada). **Sem score, sem classificação de risco, sem CCs.**
- Nome de arquivo distinto do PDF do cliente (Seção 7).

---

## 9. O que será removido / alterado em comportamento existente

- **Removido:** o redirecionamento automático e silencioso da rota `"/"` para
  `/identificacao`. Ele é **substituído** pela tela de seleção (Seção 6/8.1) — quem
  escolhe "Cliente" chega no mesmo lugar de antes, só que com um clique a mais.
- **Alterado (reorganização interna, sem mudança de comportamento visível ao cliente):**
  o `FormProvider` do cliente deixa de envolver toda a aplicação e passa a envolver
  apenas o ramo de rotas do cliente (Seção 6).
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
- O botão "Vendedor" e o modal de ajuda já existentes no `BottomBar` (ver nota da
  Seção 2 — copy pré-existente, sem relação com esta melhoria).
- Configurações de build/deploy: `vite.config.js`, workflow do GitHub Pages,
  `index.html` (`base`, `HashRouter`).
- **Qualquer arquivo fora deste repositório**, em especial `assistente_email.py` e
  qualquer rota de envio de e-mail — confirmadamente fora do alcance e do escopo desta
  melhoria (Seção 7).
- **Qualquer uso de LLM/IA** — não haverá, em nenhum momento, chamada a serviços de
  IA neste fluxo (Seção 4).

---

## 11. Premissas assumidas

1. **Identificação do Projetista:** contrato + nome completo do cliente, ambos
   obrigatórios, sem repetir endereço/telefone (confirmado pelo Word — Seção 5).
2. **Validação do contrato** segue o mesmo formato do cliente (prefixos `IT`, `SM`,
   `TA`, `PIN`, `STA` + números), assumindo um único contrato por preenchimento — a
   possibilidade de múltiplos contratos ("CONTRATO (S)" no Word) é decisão pendente
   (Seção 13).
3. **Campos de altura** (balcões e armários, Grupo A) são medidas numéricas em
   centímetros, obrigatórias, e são tratados como **campo estruturado numérico** — não
   como "escolha fechada" nem como "observação livre" — por isso não violam a regra de
   ausência de processamento de texto (um número não exige interpretação).
4. **Perguntas de escolha fechada** (fechamento até o teto, caixaria, dobradiças,
   corrediças) são obrigatórias; **"Observações do ambiente"** é opcional, texto livre
   com placeholder de exemplo, sem limite reforçado além do padrão já usado no cliente
   (300 caracteres).
5. **Sem login/senha:** o acesso ao formulário do Projetista continua sem
   autenticação — tanto pela tela de seleção quanto por link direto à rota interna.
6. **Persistência local:** o Projetista também tem "continuar de onde parou", no mesmo
   padrão do cliente, com chave de `localStorage` separada.
7. **Reaproveitamento de quantidades e nomes** de ambiente segue o padrão atual (vários
   do mesmo tipo, com nome para identificar).
8. **Grupo de perguntas de "Office"** é assumido igual ao de "Home" (Grupo C), por
   compartilharem hoje o mesmo `formType`, mas isso não está confirmado no Word
   (Seção 13).

---

## 12. Riscos identificados

1. **Reorganização do `App.jsx` além do puramente aditivo.** Mover o `FormProvider` do
   cliente de "sempre montado" para "montado por ramo de rota" é uma mudança
   estrutural na raiz de composição — maior que a simples adição de uma rota irmã
   prevista no PRD anterior. *Mitigação:* revisar cuidadosamente para que o
   comportamento do fluxo do cliente (incluindo o diálogo de rascunho) permaneça
   idêntico ao de hoje depois de escolhido "Cliente".
2. **Conflito de reaproveitamento do `BottomBar`.** O botão de ajuda "Vendedor"
   embutido nesse componente genérico não faz sentido nas telas do próprio Projetista.
   *Mitigação:* decisão pendente na Seção 13 — criar uma variação sem esse botão para
   o fluxo do Projetista, ou parametrizar a exibição do botão.
3. **Confusão de nomenclatura Projetista × Vendedor.** Por serem literalmente o mesmo
   conceito de negócio, é fácil um texto "Vendedor" escapar para a interface por
   engano. *Mitigação:* seguir rigorosamente a tabela da Seção 2 e revisar toda copy
   nova antes de finalizar.
4. **Terceiro grupo de perguntas não identificado a tempo.** Se a distinção entre
   Grupo B (Dormitórios) e Grupo C (Home) não for respeitada, o PDF do Projetista pode
   sair com uma pergunta de fechamento que o Word não previa para Home (ou vice-versa).
   *Mitigação:* Seção 5 documenta a diferença de forma explícita, item a item.
5. **Ambientes sem correspondência no Word (Office, Outros).** Podem ser classificados
   no grupo errado por falta de informação do documento original. *Mitigação:*
   decisão pendente na Seção 13.
6. **Colisão de nome de arquivo do PDF.** Se o PDF do Projetista usar o mesmo padrão de
   nome do PDF do cliente, um pode sobrescrever o outro dentro do compactado da
   medição. *Mitigação:* nome de arquivo distinto (Seção 7).
7. **Acoplamento de estado via `localStorage`.** Se a chave do Projetista não for
   exclusiva, os rascunhos do cliente e do Projetista podem se sobrescrever.
   *Mitigação:* chave dedicada e provedor isolado (Seção 8.3).
8. **PDF em branco/erro de geração.** Se nenhum ambiente for selecionado, ou a
   biblioteca de PDF falhar, o Projetista pode ficar sem feedback. *Mitigação:*
   tratamento de erro e bloqueio de geração sem ambientes, igual ao cliente.
9. **Divergência futura da lista de ambientes.** Como o Projetista reusa
   `AMBIENTES_DISPONIVEIS`, qualquer alteração futura nessa lista afeta os dois
   formulários — desejado, mas precisa estar documentado.

---

## 13. Decisões pendentes (para aprovação do Everton)

1. **Contrato único ou múltiplo?** O Word mostra "CONTRATO (S)" no plural. Manter um
   único campo de contrato (mesma validação do cliente, mais simples) ou permitir mais
   de um contrato por preenchimento?
2. **Ambiente "Office":** confirma-se o mesmo grupo de perguntas de "Home" (Grupo C,
   sem fechamento até o teto), já que hoje compartilham o mesmo `formType`?
3. **Ambiente "Outros":** qual grupo de perguntas usar, já que o Word não o contempla?
   Opções sugeridas: (a) toggle "Este ambiente tem balcão?" decidindo entre Grupo A e
   um dos grupos "sem balcão"; (b) sempre tratar como Grupo A (mais completo); (c)
   sempre tratar como Grupo B (sem balcão, mas com a pergunta de fechamento, por ser
   mais abrangente que o Grupo C).
4. **Reaproveitamento do `BottomBar`:** criar uma variação das telas de rodapé sem o
   botão de ajuda "Vendedor" para o fluxo do Projetista, ou manter o componente como
   está mesmo com esse botão aparecendo (ainda que sem sentido nesse contexto)?
5. **Nome exato do arquivo do PDF do Projetista** — sugestão de padrão a confirmar
   (ex.: incluindo a palavra "Projetista", contrato e data).

> Nenhum código será escrito antes da aprovação deste PRD.
