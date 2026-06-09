# PRD — Checklist do Vendedor (rota `/#/vendedor`)

> Documento de requisitos. Nenhum código foi escrito. Aguardando aprovação antes da implementação.

---

## 1. Objetivo da melhoria

Criar uma **segunda versão do formulário** da Checklist Dinâmica, acessível pela
rota independente `/#/vendedor`, destinada ao **vendedor projetista** preencher
durante ou após o atendimento.

Enquanto o formulário do cliente coleta informações do ponto de vista de quem
comprou (e calcula risco), o formulário do vendedor coleta **informações
técnicas de fabricação** dos ambientes que o cliente já adquiriu — alturas de
instalação, material de caixaria, ferragens e fechamento até o teto.

O resultado final é um **PDF de relatório simples** (sem pontuação de risco) que
exibe o **número do contrato**, campo que vincula este documento ao PDF do
cliente gerado separadamente.

---

## 2. Relação com os arquivos existentes

A aplicação atual é um SPA em React + Vite, publicado no GitHub Pages, usando
`HashRouter`. O fluxo do cliente hoje é:

1. **Identificação** (`/identificacao`) — nome, contrato, endereço, telefone.
2. **Ambientes** (`/ambientes`) — o usuário escolhe, dentre 8 ambientes fixos,
   quais existem no projeto e a quantidade de cada um. Cada seleção vira uma
   "instância" com `instanceId`, `tipo`, `formType`, `label` e `nome`.
3. **Perguntas Gerais** (`/globais`) — perguntas globais (iluminação, reboco,
   revestimento, pontos, rebaixo).
4. **Perguntas por Ambiente** (`/ambiente/:instanceId`) — um formulário
   diferente por `formType`.
5. **Revisão** (`/revisao`) — mostra score e dispara a geração do PDF.
6. **Sucesso** (`/sucesso`).

Pontos de contato relevantes que o formulário do vendedor vai **espelhar em
lógica, mas com implementação própria**:

- **Lista de ambientes** — `src/domain/ambientes.js` define `AMBIENTES_DISPONIVEIS`
  (Cozinha/Área de Serviço, Dormitório Casal, Dormitório Solteiro, Banheiro/W.C.,
  Home/Sala, Office, Varanda/Área Gourmet, Outros) e a função
  `formatarNomeAmbiente`. **Esta é a única fonte de ambientes e deve ser reusada
  pelo vendedor**, para garantir que os dois formulários ofereçam exatamente os
  mesmos ambientes.
- **Seleção de ambientes** — `src/steps/StepAmbientes/StepAmbientes.jsx` traz o
  padrão de incrementar/decrementar quantidade e nomear instâncias. O vendedor
  segue a mesma lógica de navegação (selecionar ambientes → preencher cada um).
- **Estado/persistência** — `src/context/FormProvider.jsx` usa `useReducer` +
  `localStorage` (chave `byarabi_checklist_rascunho`) e um diálogo "continuar de
  onde parou". É o padrão a ser replicado, com **chave de armazenamento própria**
  para não colidir com o rascunho do cliente.
- **Geração de PDF** — `src/services/pdf.js` usa `jsPDF` + `jspdf-autotable`,
  com um cabeçalho/capa ("By Arabi Planejados", Cliente, Contrato, etc.). O
  vendedor reaproveita o **estilo visual de capa e cabeçalho**, mas terá um
  gerador próprio, sem score e sem CCs.
- **Componentes compartilhados** — `Header`, `BottomBar`, `FieldGroup`,
  `Modal`, `Stepper` e os estilos em `*.module.css` podem ser reutilizados
  como estão (são genéricos e não acoplados ao cliente).

> **Observação importante:** já existe hoje um botão rotulado **"Vendedor"** no
> componente `BottomBar` (`src/components/BottomBar/BottomBar.jsx`). Esse botão
> apenas abre um modal de ajuda dizendo ao cliente para consultar o vendedor.
> **Ele não tem nenhuma relação com a nova rota `/#/vendedor`** e não deve ser
> alterado nem confundido com esta melhoria.

---

## 3. A distinção "com balcão" × "sem balcão" já existe?

**Não existe hoje.** O código atual agrupa ambientes por `formType`
(`cozinha`, `dormitorio`, `home`, `banheiro`, `outros`), que define quais
perguntas o **cliente** vê. Não há, em nenhum arquivo, o conceito de "ambiente
com balcão" ou "ambiente sem balcão". Uma busca textual por "balcão" no código
não retornou nenhuma ocorrência.

Portanto, **esta classificação precisa ser criada do zero**, exclusivamente para
o formulário do vendedor. A correspondência natural com os `formType` existentes
é a seguinte:

| Ambiente (label)                | formType atual | Classificação do vendedor |
|---------------------------------|----------------|---------------------------|
| Cozinha / Área de Serviço       | `cozinha`      | **Com balcão**            |
| Varanda / Área Gourmet          | `cozinha`      | **Com balcão**            |
| Banheiro / W.C.                 | `banheiro`     | **Com balcão**            |
| Dormitório Casal                | `dormitorio`   | **Sem balcão**            |
| Dormitório Solteiro             | `dormitorio`   | **Sem balcão**            |
| Home / Sala                     | `home`         | **Sem balcão**            |
| Office                          | `home`         | **Sem balcão**            |
| Outros                          | `outros`       | **Indefinido** (ver premissas) |

A classificação será definida em um **mapa novo, próprio do vendedor** (por
`formType` ou por `id` de ambiente), **sem alterar `ambientes.js`**, de modo que
a lógica do cliente permaneça intocada.

---

## 4. Padrão externo de roteamento (simplicidade e consistência)

A pergunta da Etapa 2 é: **como adicionar uma rota independente sem quebrar a
rota do cliente, dado React + Vite + HashRouter + GitHub Pages?**

Resposta: com `HashRouter`, **a rota nova é puramente client-side** — tudo após
o `#` é resolvido no navegador, nunca chega ao servidor. No GitHub Pages isso
significa que `/#/vendedor` **não exige nenhuma configuração de servidor, nem
arquivo de fallback 404, nem mudança no `vite.config.js` ou no deploy**. Basta
declarar a rota no roteador.

A forma mais simples e consistente com o que já existe:

- Hoje o `App.jsx` é a raiz de composição: `HashRouter → FormProvider →
  AppLayout (com `<Routes>`)`.
- O formulário do vendedor terá **seu próprio provedor de estado e seu próprio
  layout** (espelhando `FormProvider`/`AppLayout`), montados em um **ramo de rota
  separado** `/vendedor/*`.
- O cliente continua montado exatamente como hoje; o provedor de estado do
  cliente **não envolve** as telas do vendedor (e vice-versa), evitando qualquer
  interferência de `localStorage`, diálogo de rascunho ou navegação.

O único arquivo compartilhado que recebe uma adição é o `App.jsx` (a raiz de
composição), que passa a ramificar entre "fluxo do cliente" e "fluxo do
vendedor". Essa adição é **aditiva**: não altera nenhum comportamento das telas
do cliente — apenas as coloca sob um ramo de rota irmão do novo.

---

## 5. O que será adicionado

### 5.1 Roteamento
- Um ramo de rotas `/vendedor/*` no roteador, com subtelas próprias:
  - seleção/identificação mínima (contrato),
  - seleção de ambientes,
  - perguntas por ambiente,
  - revisão/geração de PDF,
  - sucesso.
- O cliente continua respondendo em `/identificacao`, `/ambientes`, etc.

### 5.2 Estado do vendedor
- Um provedor de estado próprio (espelhando o padrão do `FormProvider`), com
  **chave de `localStorage` exclusiva** (ex.: `byarabi_checklist_vendedor`),
  independente do rascunho do cliente.
- Estrutura de dados própria: contrato + lista de ambientes selecionados +
  respostas por ambiente do vendedor.

### 5.3 Classificação "com balcão / sem balcão"
- Um mapa novo (próprio do vendedor) que classifica cada ambiente como
  **com balcão** ou **sem balcão**, conforme a tabela da Seção 3.

### 5.4 Perguntas por ambiente (formulário do vendedor)

**Ambientes COM balcão** (Cozinha, Área de Serviço, Varanda, Banheiro):
1. Qual altura do piso será instalada os balcões? *(medida, em cm)*
2. Qual altura do piso será instalada os armários? *(medida, em cm)*
3. Haverá fechamento até o teto? *(SIM / NÃO)*
4. Caixarias ou corpos: *(MDP / MDF)*
5. Dobradiças: *(Convencionais / Amortecimento)*
6. Corrediças: *(Telescópicas / Ocultas)*
7. Observações do ambiente *(texto livre, opcional)*

**Ambientes SEM balcão** (Dormitórios, Home):
1. Caixarias ou corpos: *(MDP / MDF)*
2. Dobradiças: *(Convencionais / Amortecimento)*
3. Corrediças: *(Telescópicas / Ocultas)*
4. Haverá fechamento até o teto? *(SIM / NÃO)*
5. Observações do ambiente *(texto livre, opcional)*

### 5.5 Telas
- **Identificação mínima do vendedor:** ao menos o campo **contrato**
  (reaproveitando o mesmo formato/validação do cliente — prefixos `IT`, `SM`,
  `TA`, `PIN`, `STA` seguidos de números). É o elo com o PDF do cliente.
- **Seleção de ambientes:** reaproveita a lógica de
  `StepAmbientes` (mesmos 8 ambientes, quantidades, nomes personalizados).
- **Perguntas por ambiente:** renderiza o conjunto "com balcão" ou "sem balcão"
  conforme a classificação.
- **Revisão + Gerar PDF** e **Sucesso**, no mesmo padrão visual do cliente.

### 5.6 PDF do vendedor
- Um gerador de PDF próprio (estilo de capa/cabeçalho reaproveitado do PDF do
  cliente: marca "By Arabi Planejados", **número do contrato**, data).
- Conteúdo: **somente relatório dos dados preenchidos**, agrupado por ambiente,
  listando pergunta e resposta. **Sem score, sem classificação de risco, sem CCs.**
- O **número do contrato** aparece com destaque (vínculo com o PDF do cliente).
- Nome do arquivo seguindo o padrão atual (ex.: incluindo contrato e data).

---

## 6. O que será removido

**Nada.** Esta melhoria é puramente aditiva. Nenhum arquivo, rota, campo,
componente ou comportamento existente é removido.

---

## 7. O que NÃO será tocado (em hipótese alguma)

- Todo o fluxo do **formulário do cliente**: `StepIdentificacao`,
  `StepAmbientes`, `StepPerguntasGlobais` (e blocos), `StepPerguntasPorAmbiente`
  (e todos os `Form*`), `StepRevisao`, `StepSucesso`.
- A lógica de **score e CCs**: `scoreEngine.js`, `ccBuilder.js`,
  `checklistTextos.js`.
- O **gerador de PDF do cliente** (`src/services/pdf.js`).
- O **estado/persistência do cliente** (`FormProvider`/reducer e a chave
  `byarabi_checklist_rascunho`).
- A definição compartilhada `AMBIENTES_DISPONIVEIS` em `ambientes.js`
  (será **lida**, mas não modificada).
- O botão "Vendedor" e o modal de ajuda já existentes no `BottomBar`.
- Configurações de build/deploy: `vite.config.js`, workflow do GitHub Pages,
  `index.html` (`base`, `HashRouter`).

> Único arquivo compartilhado que recebe **adição aditiva**: `App.jsx` (raiz de
> composição), apenas para registrar o ramo de rota do vendedor. As telas do
> cliente continuam idênticas em comportamento.

---

## 8. Premissas assumidas

1. **Identificação do vendedor é mínima.** O enunciado pede apenas que o PDF
   exiba o número do contrato. Assume-se que o formulário do vendedor coleta
   **somente o contrato** (e, opcionalmente, o nome do cliente para o cabeçalho),
   sem repetir endereço/telefone do cliente. *(Confirmar se o vendedor deve
   informar mais algum dado de identificação.)*
2. **Validação do contrato** segue o mesmo formato do cliente (prefixos `IT`,
   `SM`, `TA`, `PIN`, `STA` + números).
3. **Ambiente "Outros":** não há balcão definido para ele. Assume-se que, ao
   selecionar "Outros", o vendedor responde um **toggle "Este ambiente tem
   balcão?"** que decide qual conjunto de perguntas aparece. *(Alternativa:
   tratar "Outros" sempre como "com balcão". Decisão pendente de confirmação.)*
4. **Campos de altura** (balcões e armários) são **medidas numéricas em
   centímetros**, obrigatórias nos ambientes com balcão.
5. **As perguntas de escolha** (MDP/MDF, dobradiças, corrediças, fechamento até
   o teto) são **obrigatórias**; "Observações" é **opcional** (texto livre, com
   limite de caracteres no mesmo padrão do cliente — 300).
6. **Sem login/senha:** o acesso é por link direto, conforme solicitado. Não há
   autenticação.
7. **Persistência local:** o vendedor também terá "continuar de onde parou"
   (rascunho), no mesmo padrão do cliente, mas com chave separada.
8. **Reaproveitamento de quantidades e nomes** de ambiente segue o padrão atual
   (vários do mesmo tipo, com nome para identificar).

---

## 9. Riscos identificados

1. **Acoplamento de estado via `localStorage`.** Se a chave do vendedor não for
   exclusiva, os rascunhos do cliente e do vendedor podem se sobrescrever.
   *Mitigação:* chave dedicada e provedor isolado.
2. **Provedores de estado se cruzarem.** Se as telas do vendedor forem montadas
   dentro do `FormProvider` do cliente (ou vice-versa), o diálogo de rascunho ou
   a navegação de um pode interferir no outro. *Mitigação:* ramos de rota
   separados, cada um com seu provedor.
3. **Classificação de "Outros".** Sem decisão sobre balcão, o ambiente "Outros"
   pode exibir o conjunto de perguntas errado. *Mitigação:* premissa 3
   (toggle) — pendente de confirmação.
4. **Mudança em `App.jsx`.** Embora aditiva, é um arquivo compartilhado; um erro
   de roteamento poderia, em tese, afetar o carregamento do cliente.
   *Mitigação:* manter o ramo do cliente exatamente como está e apenas
   adicionar o ramo `/vendedor/*` como irmão.
5. **Divergência futura da lista de ambientes.** Como o vendedor reusa
   `AMBIENTES_DISPONIVEIS`, qualquer alteração futura nessa lista afeta os dois
   formulários — o que é desejado (mantê-los iguais), mas precisa estar
   documentado.
6. **PDF em branco/erro de geração.** Se nenhum ambiente for selecionado, ou se
   a biblioteca de PDF falhar, o vendedor pode ficar sem feedback.
   *Mitigação:* tratamento de erro e bloqueio de geração sem ambientes (igual ao
   cliente).
7. **Compatibilidade de rascunho antigo.** O `FormProvider` do cliente já
   descarta rascunhos com formato antigo. O provedor do vendedor deve ter sua
   própria lógica de descarte para evitar quebra ao evoluir o schema.

---

## 10. Critérios de aceitação

Cada critério descreve um cenário (entrada → resultado esperado).

### Acesso e isolamento
- **CA-01 — Acesso direto à rota do vendedor.**
  Entrada: usuário abre `…/#/vendedor`.
  Resultado: carrega o formulário do vendedor (identificação/contrato), sem
  pedir senha e sem exibir nenhuma tela do cliente.

- **CA-02 — Formulário do cliente intocado.**
  Entrada: usuário abre `…/#/identificacao` (rota do cliente).
  Resultado: o formulário do cliente funciona exatamente como antes, sem nenhuma
  diferença visível de comportamento, campos, score ou PDF.

- **CA-03 — Isolamento de rascunho.**
  Entrada: usuário preenche parte do formulário do cliente, depois abre o
  formulário do vendedor e preenche parte dele.
  Resultado: cada formulário mantém seu próprio rascunho; nenhum sobrescreve o
  outro. Ao reabrir cada rota, o respectivo rascunho é oferecido para continuar.

### Seleção de ambientes
- **CA-04 — Mesmos ambientes do cliente.**
  Entrada: vendedor chega na tela de seleção de ambientes.
  Resultado: vê exatamente os mesmos 8 ambientes disponíveis no formulário do
  cliente, podendo definir quantidades e nomes personalizados.

- **CA-05 — Navegação por ambientes selecionados.**
  Entrada: vendedor seleciona "Cozinha" (1) e "Dormitório Casal" (1) e avança.
  Resultado: o fluxo apresenta primeiro as perguntas da Cozinha e depois as do
  Dormitório, uma instância por vez, no padrão do cliente.

### Conjuntos de perguntas corretos
- **CA-06 — Ambiente com balcão exibe o conjunto completo.**
  Entrada: vendedor abre as perguntas de uma **Cozinha**.
  Resultado: aparecem, nesta ordem — altura de instalação dos balcões, altura de
  instalação dos armários, fechamento até o teto (SIM/NÃO), caixaria (MDP/MDF),
  dobradiças (convencionais/amortecimento), corrediças (telescópicas/ocultas) e
  observações.

- **CA-07 — Ambiente sem balcão exibe o conjunto reduzido.**
  Entrada: vendedor abre as perguntas de um **Dormitório**.
  Resultado: aparecem, nesta ordem — caixaria (MDP/MDF), dobradiças, corrediças,
  fechamento até o teto (SIM/NÃO) e observações. **Não** aparecem perguntas de
  altura de balcão/armário.

- **CA-08 — Banheiro é tratado como "com balcão".**
  Entrada: vendedor abre as perguntas de um **Banheiro**.
  Resultado: exibe o conjunto completo (com alturas), igual à Cozinha.

- **CA-09 — Home é tratado como "sem balcão".**
  Entrada: vendedor abre as perguntas de **Home/Sala**.
  Resultado: exibe o conjunto reduzido (sem alturas).

### Geração do PDF
- **CA-10 — PDF de relatório com contrato.**
  Entrada: vendedor preenche os ambientes e clica em "Gerar PDF".
  Resultado: um PDF é baixado exibindo o **número do contrato** em destaque e,
  por ambiente, a lista de perguntas e respostas preenchidas.

- **CA-11 — PDF sem pontuação de risco.**
  Entrada: PDF gerado pelo vendedor.
  Resultado: **não** contém score, classificação de risco, "Resumo Executivo"
  nem CCs — apenas o relatório dos dados.

- **CA-12 — Vínculo entre os dois PDFs.**
  Entrada: contrato `IT01234` informado no formulário do vendedor.
  Resultado: o número `IT01234` aparece no PDF do vendedor, permitindo associá-lo
  ao PDF do cliente do mesmo contrato.

### Cenários de erro
- **CA-13 — Contrato em formato inválido.**
  Entrada: vendedor digita `12345` (sem prefixo válido) e tenta avançar.
  Resultado: mensagem de erro indicando o formato esperado (IT, SM, TA, PIN ou
  STA + números); o avanço é bloqueado.

- **CA-14 — Nenhum ambiente selecionado.**
  Entrada: vendedor tenta avançar da seleção de ambientes sem escolher nenhum.
  Resultado: mensagem orientando a selecionar ao menos um ambiente; o avanço é
  bloqueado.

- **CA-15 — Tentar gerar PDF sem ambientes.**
  Entrada: estado sem ambientes selecionados.
  Resultado: a geração de PDF não ocorre (ou é bloqueada com aviso), sem gerar um
  arquivo vazio.

- **CA-16 — Campo obrigatório de ambiente não preenchido.**
  Entrada: em uma Cozinha, o vendedor deixa "altura dos balcões" em branco e
  tenta avançar.
  Resultado: mensagem de erro no campo e bloqueio do avanço, no mesmo padrão de
  validação do cliente. Observações, por ser opcional, não bloqueia.

- **CA-17 — Falha na biblioteca de PDF.**
  Entrada: ocorre um erro durante a geração do PDF.
  Resultado: mensagem amigável ("Não foi possível gerar o PDF agora — tente
  novamente") e opção de tentar de novo, sem travar a tela — igual ao cliente.

- **CA-18 — Instância de ambiente inexistente na URL.**
  Entrada: vendedor acessa manualmente uma URL de ambiente que não existe no seu
  estado.
  Resultado: mensagem de "ambiente não encontrado" (padrão atual), sem quebrar a
  aplicação.

---

## 11. Resumo das decisões pendentes (para aprovação)

1. O formulário do vendedor coleta **apenas o contrato** (e talvez o nome), ou
   precisa de mais dados de identificação?
2. Como tratar o ambiente **"Outros"**: toggle "tem balcão?" (recomendado) ou
   sempre "com balcão"?
3. As perguntas de **altura** são medidas numéricas em cm e obrigatórias?
   (assumido como sim)

> Nenhum código será escrito antes da aprovação deste PRD.
