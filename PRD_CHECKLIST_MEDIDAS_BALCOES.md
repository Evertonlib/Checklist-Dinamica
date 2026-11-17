# PRD — Pergunta "balcões convencionais ou editados?" no Checklist do Projetista

> Documento de requisitos. Nenhum código foi escrito. Aguardando aprovação antes do Spec.
>
> Nome da feature: `CHECKLIST_MEDIDAS_BALCOES`. Este arquivo fica na raiz do projeto, como
> pede a metodologia; os PRDs anteriores vivem em `PRDS_E_SPECS/` e o Everton pode mover
> este para lá depois da aprovação.
>
> Tudo o que está descrito como "hoje" foi conferido no código em 17/11/2026, com
> `arquivo:linha`. As regras da Seção 2 são decisões já aprovadas pelo Everton.
>
> **Histórico:** esta é a segunda versão do PRD. A primeira previa campos numéricos de altura
> e profundidade (em mm) quando o balcão fosse "Editados". O Everton **trocou essa regra**
> (motivo na Seção 1): agora não existe nenhuma medida em lugar nenhum, só duas perguntas de
> Sim/Não. Nada da regra antiga vale.

---

## 1. Objetivo

A liberação tende a seguir a altura convencional de balcão (676 mm) por hábito. Quando o
vendedor vende um balcão de outra altura, o projeto pode sair com a medida errada — já
houve um erro real de altura de balcões.

O Checklist do Projetista (perfil Vendedor, rotas `/vendedor/*`) passa a perguntar, **por
ambiente**, se os balcões daquele ambiente serão **convencionais** ou **editados**. Quando
forem editados, o Projetista responde apenas **Sim ou Não** a duas perguntas: se a **altura**
está fora do padrão e se a **profundidade** está fora do padrão. O PDF do Projetista mostra a
resposta e, quando há algum "Sim", **destaca** a linha com a cor de alerta, para chamar a
atenção da liberação.

**Por que não há número de medida (decisão do Everton).** A medida final do balcão quase nunca
é a do vendido: por exemplo, um cliente com granito já existente obriga a reduzir a
profundidade, e a altura também pode ser ajustada no projeto. Um número assinado pelo cliente
no checklist, diferente do que for liberado, poderia ser usado juridicamente contra a
empresa. Por isso a pergunta **serve só para chamar a atenção da liberação**; a medida correta
é definida e conferida pela liberação, fora do checklist.

O perfil Cliente **não muda**.

---

## 2. Comportamento decidido pelo Everton

1. A pergunta principal é: **"Os balcões deste ambiente serão convencionais ou editados?"**
2. Entra **junto das perguntas de altura de instalação**, com três botões:
   **Convencionais**, **Editados**, **Não se aplica**. Nada vem pré-marcado e a resposta é
   obrigatória para o Projetista avançar.
3. **Convencionais** e **Não se aplica**: nada aparece abaixo da pergunta.
4. **Editados**: aparecem **duas perguntas fechadas**, ambas obrigatórias, **sem** botão "Não se
   aplica", cada uma com as opções **Sim** e **Não**:
   - **"Altura fora do padrão?"**
   - **"Profundidade fora do padrão?"**

   **Não existe texto de orientação** abaixo delas. O campo "Observações do ambiente" fica
   **exatamente como está**, sem nenhuma menção nova a balcões (para evitar que o vendedor
   escreva medidas ali).
5. **Nenhum campo numérico** de altura ou profundidade **do balcão** existe na tela, na Revisão
   ou no PDF. (Isto **não** vale para as duas perguntas de altura **do piso** — balcões e
   armários —, que continuam na mesma tela, com campo numérico em mm, e continuam a sair no PDF
   e na Revisão como hoje, por exemplo `Resposta: 850 mm`. Elas não mudam.)
6. A pergunta aparece **apenas** nos ambientes do grupo A (que já têm a pergunta de altura de
   balcão): Cozinha / Área de Serviço, Varanda / Área Gourmet, Banheiro / W.C. e Outros.
   Dormitórios (grupo B) e Home / Office (grupo C) **não recebem** a pergunta.
7. **Sem pontuação de risco**: a resposta não gera pontos nem gatilhos (o Projetista não tem
   score — esta feature não muda isso).
8. No **PDF** e na **Revisão** a pergunta **sempre aparece**, como todas as outras; não é exceção
   ao padrão (Seções 5.3 e 5.4). Só a **cor de alerta** diferencia as respostas com "Sim".

### Fora de escopo

- Perfil Cliente e Venda futura.
- Pergunta equivalente para armários.
- Qualquer valor de medida padrão do convencional: **nenhum número de 676 nem de profundidade
  padrão** pode aparecer em qualquer texto do aplicativo (tela, Revisão, PDF, mensagens).
- **Qualquer número de medida do balcão (padrão ou editado) na tela, na Revisão ou no PDF.**
  Isto se refere à medida **do corpo do balcão**. Os números das alturas de **piso**
  (alturaBalcao_mm / alturaArmario_mm) continuam existindo como hoje.
- Texto de orientação sobre balcões na tela e qualquer alteração no campo "Observações do
  ambiente".
- Pontuação de risco.
- A pergunta atual de alturas de instalação (alturaBalcao_mm / alturaArmario_mm). Ela mede a
  altura **do piso/pé de instalação**, **não** a altura do corpo do balcão, e **não deve ser
  alterada** (texto, validação, PDF, nome do campo).

---

## 3. Relação com scripts e sistemas existentes

### 3.1 Dentro do repositório

- Reaproveita o padrão **pergunta fechada com botões** do Grupo A (`FormGrupoA.jsx:55-83`), com
  um ajuste pequeno para as duas subperguntas Sim/Não (Seção 5.1).
- Segue o padrão de armazenamento do Projetista: respostas fechadas gravadas como texto e
  `"não se aplica"` como texto literal, nunca como vazio (`schemaVendedor.js:4-10`).
- Segue o `CLAUDE.md`: mudança de regra do Cliente não propaga ao Projetista e vice-versa. Aqui
  só o lado Projetista é tocado. E regra de validação deve ficar fora do componente de tela
  (Seção 5.2).

### 3.2 Leitores externos do PDF ou dos dados do Projetista (verificado)

Busquei em todos os projetos de `AUTOMACOES` (`.py`, `.ps1`, `.js`, `.mjs`, `.bat`, fora de
`node_modules`/`dist`) por: nome do arquivo `Checklist_Projetista`, rótulos do PDF ("Altura do
piso", "Caixarias ou corpos"), nomes de campo (`alturaBalcao`), a chave de localStorage do
Projetista e a palavra "Projetista". Resultado:

- **Nenhum script lê o conteúdo do PDF do Projetista, nem os dados salvos dele.** O PDF do
  Projetista não tem os dados escondidos que o PDF do Cliente tem (`pdfVendedor.js` não grava
  Keywords) e o importador recusa esse PDF (teste T5 em `testes/I_importacao_pdf.test.js:145`).
- `ASSISTENTE DE EMAIL/assistente_email.py:507-530` só olha a **extensão** dos anexos: qualquer
  `.pdf`, `.doc` ou `.docx` faz o e-mail contar como "tem check list". Não abre o PDF. O texto
  de e-mail em `assistente_email.py:124-125` só cita o link do site. Os logs em
  `ASSISTENTE DE EMAIL/logs/` só listam **nomes de arquivo** `Checklist_Projetista_*.pdf`; o
  padrão do nome **não muda** nesta feature.
- `Agente-Assinatura-Encomenda/testes/teste_limpeza_texto.py` (o único achado do Everton)
  **confirmado como não relacionado**: o "checklist" ali é o do gov.br (`CHECKLIST_GOV`, linhas
  307-348), um texto de teste de limpeza, nada a ver com o Projetista.
- `Nucleo-Liberacao/ficha_contrato/fichas.py:295-322` guarda um "checklist" em JSON na ficha do
  contrato, mas o Projetista não produz JSON; não há caminho de dados do PDF do Projetista até
  lá.
- Só há **referências descritivas**, sem leitura de dados: `Processos-liberacao/index.html:602-609`
  (página de processo que explica que o vendedor preenche o checklist do Projetista) e
  `Nucleo-Liberacao/MAPA_DUPLICIDADES_BIBLIOTECA_COMUM.md:66`.

Conclusão: **o formato novo do PDF não quebra nenhum leitor**. O consumidor real do PDF do
Projetista é a **equipe de liberação, lendo a olho**. Nenhum contrato de formato é afetado.

---

## 4. Como funciona hoje (conferido)

### 4.1 Tela de perguntas do ambiente (grupo A)

- `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoA.jsx`
  - Bloco **"Alturas de instalação"** (`:87-90`) com duas perguntas de altura de **piso** (balcões
    e armários), cada uma com campo numérico em mm e caixa "Não se aplica" (`:18-53`). **Não
    mudam.**
  - Função de **pergunta fechada** (`:55-83`): botões das opções e, **sempre**, o botão "Não se
    aplica" no fim (`:73-79`, sem nenhuma condição). O botão marcado fica com estilo "ativo"; a
    mensagem de erro usa a classe que o scroll automático procura (`:81`).
  - Blocos "Acabamento e ferragens" (`:92-97`) e "Observações (opcional)" (`:99-109`, máximo
    300 caracteres) logo abaixo. **Observações não muda.**
- Essa função de pergunta fechada é **local a cada formulário e existe em três cópias
  independentes**: `FormGrupoA.jsx:55-83`, `FormGrupoB.jsx:18-46` e `FormGrupoC.jsx:17-41`. Cada
  uma acrescenta sempre o botão "Não se aplica".
- `FormGrupoB.jsx` (dormitórios) e `FormGrupoC.jsx` (home/office) não têm nenhuma pergunta de
  altura.
- Estilos em `StepPerguntasAmbienteVendedor.module.css`. Esse CSS só é usado pelos três
  formulários do Projetista (conferido por busca): acrescentar classe nele não afeta Cliente
  nem Venda futura.

### 4.2 Validação para avançar

- `StepPerguntasAmbienteVendedor.jsx`
  - Lista de obrigatórios por grupo (`:17-21`). O grupo A exige as duas alturas de piso,
    fechamento, caixaria, dobradiças e corrediças.
  - Regra de resposta válida (`:23-27`): "não se aplica" sempre vale; para as alturas de piso vale
    só número maior que zero; para os demais, qualquer valor não vazio.
  - Existe **uma única mensagem de erro**, aplicada a todos os campos: `Responda esta pergunta
    ou marque "Não se aplica"` (`:33`). Os erros ficam num conjunto indexado por campo, então as
    subperguntas novas precisam de **chave de erro própria** (Seção 5.2).
  - A validação roda **só ao clicar "Avançar"/"Ir para Revisão", e só para o ambiente da tela
    atual** (`:64-68`, `:81-92`).
- A tela de Revisão **não revalida nada** (`StepRevisaoVendedor.jsx:57-69` gera o PDF sem
  checar), e a rota `/vendedor/revisao` pode ser aberta direto ou por rascunho salvo (Seção 9).
- Essa validação mora dentro de um componente `.jsx`, **não exportada**, por isso a suíte atual
  não a cobre (`PRDS_E_SPECS/INVENTARIO_FEATURES_CHECKLIST_DINAMICA.md:42` e `:136`, "lista N").

### 4.3 Estado e rascunho

- Defaults do grupo A em `src/domain/schemaVendedor.js:3-11` (cada campo começa `null`).
- Grupos em `src/domain/gruposPerguntasVendedor.js:4-17`: A = cozinha, varanda, banheiro, outros;
  B = dormitórios; C = home, office; ambiente desconhecido cai em A (`:15-17`).
- Gravação de resposta: `FormProviderVendedor.jsx:158-171`. Ambiente novo nasce com os defaults
  do grupo (`:128-133`).
- Restauração de rascunho: `normalizarEstadoSalvo` (`FormProviderVendedor.jsx:25-50`) junta os
  defaults do grupo com o que estava salvo, ambiente por ambiente; `confirmarRascunho`
  (`:218-224`) leva o usuário para a etapa em que ele parou (`etapaAtual`).

### 4.4 Revisão e PDF

- A lista de perguntas por grupo (rótulo, campo, tipo) existe **duplicada**: em
  `StepRevisaoVendedor.jsx:10-30` e em `pdfVendedor.js:16-36`, assim como a função que formata a
  resposta (`StepRevisaoVendedor.jsx:32-38`, `pdfVendedor.js:38-44`). Os rótulos já usam o
  travessão "—" (por exemplo `pdfVendedor.js:18-19`, "Altura do piso — balcões").
- **Como o PDF trata hoje as respostas** (`pdfVendedor.js`): percorre **toda** a lista do grupo e
  escreve, para **cada** pergunta, o rótulo em negrito e a linha `Resposta: …`
  (`:136-138`, `:99-110`). Vazio sai `—` (`:39`); "não se aplica" sai `Não se aplica` (`:40`). A
  única coisa condicional é "Observações do ambiente" (`:140-142`). **A pergunta nova segue
  esse mesmo padrão: sempre aparece.**
- **Cor no PDF do Projetista:** `pdfVendedor.js` hoje só usa texto **preto** (`:103`, `:128`) e
  linha dourada de separação (`:74`, `:120`); **não há cor de texto, fundo ou moldura**. Negrito
  não serve para distinguir, porque o rótulo de **toda** pergunta já sai em negrito (`:101`).
  Portanto o destaque da Seção 5.3 é um **recurso novo** neste PDF.
- **Cor de alerta já usada no PDF do Cliente:** `src/services/pdf.js:11-15` define a tabela
  `COR_NIVEL`; o nível ALTO é vermelho **(180, 0, 0)** (`:12`), aplicado ao texto em `:142`,
  `:188-193` e `:337`. Essa é a "cor de alerta" de referência.
- A Revisão (`StepRevisaoVendedor.jsx:101-108`) espelha o PDF: uma linha `Rótulo: resposta` para
  cada pergunta, inclusive "Não se aplica" e "—". O CSS dela (`StepRevisaoVendedor.module.css`)
  é **compartilhado com a Venda futura** (`StepRevisaoFutura.jsx:6`). Há o token de cor
  `--ba-danger` em `src/index.css:23`.

### 4.5 Testes existentes

- `testes/V_pdf_projetista.test.js`:
  - **T-V03** (`:31-47`) confere, **linha a linha e em ordem**, o PDF do grupo A com respostas
    vazias. **Vai mudar de propósito** (a pergunta nova passa a ter linha própria).
  - **T-V04** (`:49-62`) e **T-V05** (`:64-74`) fazem o mesmo para B e C. **Não mudam.**
  - **T-V06** (`:76-98`) compara a lista **exata de 6 respostas** do grupo A (formatos mm, "Não
    se aplica", NÃO/SIM, "—"). Com a pergunta nova sempre no PDF, entra um **sétimo** `Resposta:
    —` e o teste quebra. **Vai mudar de propósito.** A segunda parte dele (fechamento "SIM")
    continua igual.
  - Observação: o pedido original citava T-V06 como o teste da ordem das linhas; a ordem é
    conferida pelo T-V03. Os dois mudam.
- `testes/auxiliares/construtores.js:88-100` monta o estado do Projetista a partir dos defaults de
  `schemaVendedor.js`, então campos novos nos defaults entram nos testes automaticamente.
- **O que o modo de captura registra** (`testes/auxiliares/captura_jspdf.js:26-29` e
  `captura_registro.js`): somente **textos escritos**, textos quebrados, links, propriedades e o
  nome do arquivo salvo. **Não registra cor** (nenhuma troca de cor de texto é interceptada),
  **nem negrito, nem fundo**. Portanto "destacado ou não destacado" **só pode ser conferido à
  mão**.

---

## 5. Comportamento desejado, em detalhe

### 5.1 Tela de perguntas do ambiente (apenas grupo A)

- Nova pergunta no bloco das alturas de instalação, **logo abaixo das duas perguntas existentes
  de altura do piso**, com o texto exato **"Os balcões deste ambiente serão convencionais ou
  editados?"**.
- Três botões, nesta ordem: **Convencionais**, **Editados**, **Não se aplica**. Nenhum vem
  marcado. Tocar em outro botão troca a resposta.
- **Convencionais** ou **Não se aplica** marcados: não aparece nada abaixo da pergunta.
- **Editados** marcado: abaixo aparecem, nesta ordem, duas perguntas fechadas, ambas
  obrigatórias:
  1. **"Altura fora do padrão?"**, botões **Sim** e **Não**;
  2. **"Profundidade fora do padrão?"**, botões **Sim** e **Não**.

  Nenhuma das duas tem o botão "Não se aplica". Nenhuma vem pré-marcada. **Não há campo numérico do balcão,
  nem texto de orientação.** (Os dois campos numéricos de altura do piso, acima dela, continuam
  como hoje.)
- **Como as subperguntas serão feitas (decisão):** a função de pergunta fechada do Grupo A
  (`FormGrupoA.jsx:55-83`) passa a aceitar **um parâmetro novo** que liga ou desliga o botão
  "Não se aplica", com **padrão "mostra o botão"**. Assim:
  - as chamadas atuais do Grupo A (fechamento, caixaria, dobradiças, corrediças e a pergunta
    principal nova) **continuam com o botão "Não se aplica"**, sem nenhuma mudança de
    comportamento;
  - só as duas subperguntas desligam o botão;
  - as cópias dos **Grupos B e C não são alteradas**.

  Os valores guardados para as subperguntas e para a pergunta principal, e como o botão "Sim"/
  "Não" se diferencia de "SIM"/"NÃO" do fechamento até o teto, ficam para o Spec.
- Os rótulos "Altura fora do padrão?" e "Profundidade fora do padrão?" aparecem apenas dentro
  do bloco condicional; não há risco de confusão com as perguntas de altura de **piso**, que
  continuam com o texto de hoje (Risco R2).
- **Trocar de Editados para outra opção não apaga** as respostas das subperguntas: elas só
  deixam de valer (validação, Revisão e PDF as ignoram). Ao voltar para Editados, reaparecem
  **como estavam**.
- Cada ambiente do grupo A tem a sua própria pergunta e suas próprias subrespostas.
- O campo **"Observações do ambiente"** permanece idêntico (título, texto de exemplo, contador,
  limite).

### 5.2 Validação para avançar (grupo A)

- A pergunta principal é **obrigatória**: sem nenhum botão marcado, bloqueia o avanço com a
  **mensagem padrão que já existe** (`Responda esta pergunta ou marque "Não se aplica"`,
  `StepPerguntasAmbienteVendedor.jsx:33`), **sem alteração**.
- Marcou **Editados**: as duas subperguntas são obrigatórias. Cada uma **sem resposta bloqueia**
  o avanço, com o erro **no próprio item** e a mensagem exata **"Responda sim ou não"**. Cada
  subpergunta tem **chave de erro própria** (hoje só há uma mensagem aplicada a todos os campos,
  `:33`) e entra no scroll automático até o primeiro erro.
- **Convencionais** e **Não se aplica** liberam o avanço; subrespostas antigas guardadas **não
  são verificadas**.
- Grupos B e C: nenhuma mudança.
- Todas as regras atuais permanecem idênticas (alturas de piso, fechamento, caixaria,
  dobradiças, corrediças), com as mesmas mensagens.
- **Organização (decisão):** as regras de validação do Projetista **saem de dentro do componente
  de tela** (`StepPerguntasAmbienteVendedor.jsx`) para um **arquivo `.js` de regras**, para
  poderem ser testadas automaticamente. O movimento é feito **sem mudar o que a validação
  decide** (garantido pelos testes de regressão CA-16 e CA-17). Alinhado ao `CLAUDE.md`:
  regra fora do componente de tela.

### 5.3 PDF do Projetista

A pergunta **segue o padrão atual do PDF e sempre aparece**, como todas as outras. Não há mais
exceção ao `PRD_CHECKLIST_VENDEDOR.md`: lá, o PDF lista pergunta e resposta de cada pergunta
(`:339-349`) e exibe "não se aplica" onde marcado (CA-13, `:460-465`), e isso **continua valendo
para esta pergunta também**.

- **Rótulo** (grupo A, em negrito como os demais): **"Balcões convencionais ou editados"**.
- **Posição:** logo depois de "Altura do piso — armários" e **antes** de "Fechamento até o teto".
- **Respostas** (linha `Resposta: …`):

| Situação | Texto escrito no PDF | Destaque |
|---|---|---|
| Convencionais | `Resposta: Convencionais` | não |
| Não se aplica | `Resposta: Não se aplica` | não |
| Não respondida | `Resposta: —` (mesmo tratamento das outras vazias) | não |
| Editados, altura **Não** e profundidade **Não** | `Resposta: Editados` (sem complemento) | **não** |
| Editados, só altura **Sim** | `Resposta: Editados — altura fora do padrão` | **sim** |
| Editados, só profundidade **Sim** | `Resposta: Editados — profundidade fora do padrão` | **sim** |
| Editados, altura **Sim** e profundidade **Sim** | `Resposta: Editados — altura e profundidade fora do padrão` | **sim** |

- **O "Não" das subperguntas nunca aparece no PDF.** Nenhum número de medida do balcão aparece
  no PDF.
- **Destaque (recurso novo no PDF do Projetista):** só quando **pelo menos uma** subpergunta for
  "Sim". O texto da **pergunta e o da resposta** saem na **cor de alerta já usada no PDF do
  Cliente** (vermelho 180, 0, 0 — `pdf.js:11-15`). **Sem fundo e sem moldura.** Como o rótulo de
  toda pergunta já sai em negrito, negrito não distingue; a cor é o que diferencia. O destaque
  **não altera** o estilo das outras perguntas: depois da pergunta destacada o texto **volta ao
  preto** (Risco R10). O ajuste fino (tamanho, espaçamento) fica para o Spec e é conferido a
  olho.
- Dormitórios e Home/Office saem iguais a hoje.
- Nome do arquivo, capa, "Observações do ambiente" e as demais perguntas: sem mudança.

### 5.4 Tela de Revisão do Projetista

A Revisão **mostra a resposta nas três situações** (e "—" se não respondida), com **o mesmo texto
do PDF** (a parte depois de "Resposta:") e **o mesmo critério de destaque**:

| Situação | Linha na Revisão | Destaque |
|---|---|---|
| Convencionais | `Balcões convencionais ou editados: Convencionais` | não |
| Não se aplica | `Balcões convencionais ou editados: Não se aplica` | não |
| Não respondida (só rascunho antigo) | `Balcões convencionais ou editados: —` | não |
| Editados, Não e Não | `Balcões convencionais ou editados: Editados` | não |
| Editados, só altura Sim | `…: Editados — altura fora do padrão` | sim |
| Editados, só profundidade Sim | `…: Editados — profundidade fora do padrão` | sim |
| Editados, as duas Sim | `…: Editados — altura e profundidade fora do padrão` | sim |

- O "Não" das subperguntas **nunca aparece na Revisão**.
- O destaque usa a cor de alerta **só quando houver "Sim"**. Como `StepRevisaoVendedor.module.css`
  é compartilhado com a Venda futura (`StepRevisaoFutura.jsx:6`), **só será acrescentada uma
  classe nova**; nenhuma regra existente é editada (Risco R8). A cor usa um token `--ba-*`
  existente (por exemplo o de perigo, `src/index.css:23`), sem hex novo fora de `index.css`.
- Ambientes dos grupos B e C: sem linha de balcões.

---

## 6. Arquivos afetados

| Arquivo | Efeito |
|---|---|
| `src/domain/schemaVendedor.js` | Grupo A ganha **três** campos novos, todos começando "não respondido" (`null`): tipo de balcão, altura fora do padrão e profundidade fora do padrão. Nomes exatos no Spec, **claramente diferentes** de `alturaBalcao_mm` |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoA.jsx` | Pergunta principal nova; subperguntas Sim/Não condicionais; **parâmetro novo na função de pergunta fechada** (padrão "mostra Não se aplica"); chamadas existentes inalteradas |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.jsx` | Passa a usar as regras de validação movidas para o arquivo `.js`; mostra o erro "Responda sim ou não" no próprio item das subperguntas |
| **Novo arquivo `.js` de regras de validação do Projetista** (local a definir no Spec, preferencialmente em `src/domain/`) | Recebe as regras hoje em `StepPerguntasAmbienteVendedor.jsx:14-37`, **sem mudar comportamento**, e acrescenta a pergunta principal e as duas subperguntas |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.module.css` | Possível classe nova (recuo/aparência das subperguntas). Usado só pelos formulários do Projetista |
| `src/services/pdfVendedor.js` | Pergunta nova na lista do grupo A, com o texto de resposta da Seção 5.3; recurso novo de cor de alerta, com retorno ao preto |
| `src/steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.jsx` | Linha nova (Seção 5.4) |
| `src/steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.module.css` | **Apenas acrescentar uma classe** de destaque. **Compartilhado com a Venda futura**: nenhuma regra existente pode ser editada; conferir `/futura/revisao` depois |
| `testes/V_pdf_projetista.test.js` | T-V03 e T-V06 **atualizados de propósito**; casos novos (Seção 15); T-V04 e T-V05 não mudam |
| Novo arquivo de teste de validação do Projetista | Casos de validação (Seção 15) |

**Não precisa mudar:** `FormProviderVendedor.jsx` (a restauração de rascunho já completa campos
novos com "não respondido", Seção 9), `gruposPerguntasVendedor.js`, `construtores.js`.

---

## 7. O que será adicionado

- A pergunta de balcões convencionais/editados no grupo A, com as duas subperguntas Sim/Não
  condicionais ao "Editados" e **sem** texto de orientação nem campo numérico do balcão.
- A regra de obrigatoriedade da pergunta principal e das duas subperguntas, com a mensagem
  "Responda sim ou não".
- O parâmetro novo da pergunta fechada do Grupo A (esconder "Não se aplica").
- A linha da pergunta no PDF e na Revisão, com o recurso de destaque em cor de alerta quando
  houver "Sim".
- O arquivo `.js` de regras de validação e os testes novos (Seção 15).

## 8. O que será removido ou alterado

- **Nada é removido.**
- **Alterado (comportamento):** o PDF e a Revisão ganham uma pergunta nova que **segue o padrão
  de sempre** (rótulo e resposta, "—" se vazia). **O PDF não ganha exceção ao padrão "toda
  pergunta sai no PDF".** A única novidade visual é a **cor de alerta** nas respostas com "Sim",
  um recurso novo que não altera as outras perguntas.
- **Alterado (testes, de propósito):** T-V03 e T-V06 passam a esperar a pergunta nova (Seção 15).
- **Alterado (organização):** a validação do Projetista muda de lugar (do componente de tela para
  um `.js`), sem mudar o que ela decide.

## 9. Retrocompatibilidade com rascunhos já salvos

O rascunho do Projetista fica na chave `byarabi_checklist_vendedor` do navegador
(`FormProviderVendedor.jsx:8`). Efeitos, conferidos no código:

1. **Não quebra.** Ao continuar o rascunho, `normalizarEstadoSalvo` (`:25-50`) mistura os
   defaults do grupo com o salvo; os três campos novos aparecem como "não respondido". Nenhum
   rascunho é perdido nem apresenta erro.
2. **Só bloqueia onde o Projetista passa de novo.** A pergunta nova é exigida no "Avançar" **do
   ambiente em que a pessoa está**:
   - Rascunho parado **num ambiente do grupo A**: a pessoa responde a nova pergunta ali (ou é
     bloqueada ao tentar avançar). Ambientes do grupo A que ela **já passou** continuam "não
     respondidos" até ela voltar neles.
   - Rascunho parado **na Revisão** (`etapaAtual = revisao`): o "Sim, continuar" abre direto a
     Revisão e **nada bloqueia a geração do PDF**, porque a Revisão não valida
     (`StepRevisaoVendedor.jsx:57-69`).
3. **Efeito visível agora:** como a pergunta **sempre** aparece, o ambiente do grupo A ainda sem
   resposta mostra **`Balcões convencionais ou editados: —`** na Revisão e **`Resposta: —`** no
   PDF, igual a qualquer outra pergunta vazia. Isso dá uma pista clara a quem revisar e a quem
   ler o PDF. Só **PDFs gerados antes desta mudança** não têm a linha.
4. Portanto "a resposta é obrigatória para ir à Revisão" vale para o **fluxo normal** (preencher
   passo a passo, igual às perguntas de hoje); **não** vale para rascunho antigo. É o **mesmo
   limite que já existe** para qualquer pergunta atual, e foi aceito pelo Everton (Seção 13,
   decisão Q2; Risco R3).
5. Quem **começa do zero** ("Não, começar do zero") não é afetado.
6. Nenhuma migração ou limpeza de dados será feita.

---

## 10. O que NÃO será tocado

- Todo o perfil Cliente (`src/steps/StepPerguntas*`, `FormProvider.jsx`, `schema.js`,
  `scoreEngine.js`, `ccBuilder.js`, `pdf.js`, `importacaoPdf.js`) e a Venda futura. O `pdf.js` é
  apenas **consultado** para identificar a cor de alerta.
- A pergunta existente de alturas de instalação (alturaBalcao_mm / alturaArmario_mm): texto,
  validação, rótulos do PDF ("Altura do piso — balcões/armários") e regras permanecem como estão.
- O campo **"Observações do ambiente"** (tela, Revisão e PDF): sem nenhuma menção nova a
  balcões.
- `FormGrupoB.jsx` e `FormGrupoC.jsx`, inclusive as cópias da função de pergunta fechada, e as
  listas de perguntas dos grupos B e C (tela, Revisão e PDF). **T-V04 e T-V05 não mudam.**
- Grupos de ambientes (`gruposPerguntasVendedor.js`) e catálogo `ambientes.js`.
- Chave de localStorage, nome do arquivo do PDF, capa, formato dos contratos.
- O estilo das demais perguntas do PDF e as regras já existentes do CSS da Revisão.
- Nenhum script externo (`assistente_email.py`, Nucleo-Liberacao etc.), conforme Seção 3.2.
- `Processos-liberacao/index.html` (documento de processo) — ver Seção 16.

---

## 11. Premissas assumidas

- **P1.** Valores da pergunta principal: "Convencionais", "Editados" e o texto padrão "não se
  aplica" já usado nas outras perguntas; vazio = não respondida. As duas subperguntas guardam
  **Sim** ou **Não** (vazio = não respondida). Os valores internos exatos ficam no Spec.
- **P2.** O PDF e a Revisão do Projetista continuam sem pontuação, CC e score.
- **P4.** Cada ambiente do grupo A tem a sua própria pergunta (uma cozinha pode ser Editados e a
  varanda Convencionais), com subrespostas próprias.
- **P5.** Trocar de Editados para outra opção **não apaga** as subrespostas; elas só deixam de
  valer. Ao voltar para Editados, reaparecem como estavam.
- **P6.** O PDF e a Revisão sempre escrevem a pergunta; o "Não" das subperguntas nunca é escrito.
- **P7.** O destaque do PDF é **texto na cor de alerta** (a de `pdf.js:12`), sem fundo e sem
  moldura, aplicado à pergunta e à resposta quando há ao menos um "Sim". O ajuste fino fica para
  o Spec e é conferido a olho. (Substitui a premissa anterior de "negrito e cor", já que
  negrito não distingue.)
- **P8.** Não existe, na tela nem no PDF, definição ou número do que é "convencional". Quem sabe
  o que é convencional, e a medida final do balcão, é a equipe de liberação, fora do app.
- **P9.** "Outros" e os demais ambientes do grupo A se comportam todos do mesmo jeito.
- **P10.** Os textos de tela, Revisão e PDF são os desta Seção 2 e 5, escritos com acentos e com
  o travessão "—" (nunca hífen), no padrão de `pdfVendedor.js:18-19`. Nenhum contém número de
  medida.

*(A premissa P3 da versão anterior — medidas numéricas — foi removida junto com a regra antiga;
a numeração das demais é mantida de propósito para facilitar a comparação.)*

## 12. Riscos identificados

- **R1. Linha ausente no PDF.** Como a pergunta sempre aparece, a **ausência da linha só
  significa PDF gerado antes desta mudança**. Não há mais silêncio ambíguo entre Convencionais e
  "não perguntado". (Risco anterior de ambiguidade deixou de existir.)
- **R2. Confusão entre "altura do piso" e as novas subperguntas.** Sem campo numérico do balcão e com os
  textos "Altura fora do padrão?" / "Profundidade fora do padrão?" só dentro do bloco de
  Editados, o risco é **pequeno**. Resta o de o Projetista ler "altura" da pergunta do piso como
  a do balcão. Mitigação: o texto da pergunta principal fala explicitamente em balcões, as
  subperguntas só aparecem depois de marcar Editados, e os nomes internos dos campos novos são
  bem diferentes de `alturaBalcao_mm`.
- **R3. Rascunho antigo na Revisão** gera PDF com `Resposta: —` na pergunta (Seção 9). Probabilidade
  baixa (só quem tem rascunho aberto no dia da publicação). Aceito pelo Everton.
- **R4. Clique por hábito em "Convencionais"** (ou em "Não" nas duas subperguntas). A resposta é
  obrigatória e nada vem marcado, mas o Projetista pode clicar sem ler. O app não consegue
  impedir; a Revisão mostra a resposta ao Projetista e a liberação confere a medida.
- **R5. Medida escrita em "Observações do ambiente".** O campo é livre; o vendedor pode digitar
  um número ali. Mitigação escolhida de propósito: **não** colocar nenhuma menção a balcões no
  campo de Observações (nem orientação nova), para não estimular. O risco é aceito.
- **R6. Lista de perguntas duplicada** em `StepRevisaoVendedor.jsx` e `pdfVendedor.js`. Esta
  feature mexe nos dois; se um for esquecido, Revisão e PDF divergem. Mitigação: critérios de
  aceite conferem os dois textos. **Não** unificar nesta feature.
- **R7. Mudança intencional de T-V03 e T-V06.** Esses dois testes precisam ser atualizados
  conscientemente (Seção 15); se ficarem como estão, quebram. T-V04 e T-V05 não podem mudar.
- **R8. CSS compartilhado.** `StepRevisaoVendedor.module.css` é usado também pela Venda futura.
  Mitigação: só acrescentar classe nova e conferir `/futura/revisao` à mão.
- **R9. Mover a validação pode mudar o comportamento sem querer.** Mitigação: os testes novos
  (CA-16, CA-17) congelam o comportamento antigo antes e depois do movimento.
- **R10. Cor vazando para as próximas perguntas.** A cor de alerta no PDF só pode valer para a
  pergunta destacada; se o texto não voltar ao preto, as perguntas seguintes ficam coloridas.
  Conferência manual (CA-35); o modo de captura de teste não registra cor.
- **R11. Três cópias da pergunta fechada.** Só a do Grupo A recebe o parâmetro novo; B e C não
  mudam. Se alguém alterar a cópia errada, o botão "Não se aplica" some de perguntas que devem
  tê-lo. Mitigação: chamadas existentes do Grupo A conferidas (CA-03, CA-04, CA-05).

---

## 13. Decisões tomadas

As seis questões do PRD anterior foram **decididas pelo Everton**. Não há questão em aberto.

- **Q1. Revisão:** mostra a resposta nas três situações e "—" se não respondida, com **o mesmo
  texto do PDF** e o **mesmo critério de destaque** (Seção 5.4).
- **Q2. Rascunho antigo na Revisão:** **sem trava nova**; a Revisão continua sem validar, igual
  a todas as perguntas de hoje. Risco R3 aceito.
- **Q3. Validação testável:** **sim**, as regras saem do `.jsx` para um `.js` sem mudar
  comportamento (Seção 5.2); novo arquivo de teste cobre a validação.
- **Q4. Pergunta não respondida no PDF:** sai `Resposta: —`, como as outras; **T-V03 é atualizado
  conscientemente** (Seção 15).
- **Q5. Textos:** os desta Seção 2, 5.3 e 5.4; **nenhum número de medida do balcão em lugar nenhum**.
- **Q6. Posição:** logo abaixo das duas perguntas de altura de piso na tela, e entre "Altura do
  piso — armários" e "Fechamento até o teto" no PDF e na Revisão. O título do bloco "Alturas de
  instalação" não muda.

---

## 14. Critérios de aceitação

Legenda: **[Auto]** coberto por teste automático; **[Manual]** conferido na tela ou no PDF aberto
com `npm run dev`. Como o modo de captura de teste só registra **textos**, **toda verificação de
"destacado ou não destacado" é [Manual]**.

**Numeração:** mantida a da versão anterior. **CA-24 foi REMOVIDO** (era "medida faltando não
quebra o PDF"; deixou de existir porque não há mais medida). CA-32 a CA-36 são novos.

**Tela — pergunta e subperguntas**

- **CA-01 [Manual] — Pergunta aparece nos ambientes do grupo A.** Entrada: abrir Cozinha, Varanda,
  Banheiro e Outros no Projetista. Esperado: em todos aparece "Os balcões deste ambiente serão
  convencionais ou editados?" com os botões Convencionais, Editados e Não se aplica, **nenhum
  marcado**, abaixo das duas perguntas de altura do piso.
- **CA-02 [Manual] — Não aparece nos demais.** Entrada: abrir Dormitório Casal, Dormitório
  Solteiro, Home e Office. Esperado: a pergunta não existe; a tela é idêntica à de hoje.
- **CA-03 [Manual] — Convencionais.** Entrada: tocar em Convencionais. Esperado: botão marcado;
  nada novo aparece abaixo.
- **CA-04 [Manual] — Não se aplica.** Entrada: tocar em Não se aplica. Esperado: idem CA-03.
- **CA-05 [Manual] — Editados mostra as duas subperguntas.** Entrada: tocar em Editados. Esperado:
  aparecem "Altura fora do padrão?" e "Profundidade fora do padrão?", cada uma com os botões Sim
  e Não, **nenhum marcado**, **sem** botão "Não se aplica", **sem campo numérico do balcão** e **sem
  texto de orientação**. As demais perguntas do Grupo A (fechamento, caixaria, dobradiças, corrediças e
  a própria pergunta principal) **continuam com** o botão "Não se aplica".
- **CA-06 [Manual] — Trocar a resposta preserva as subrespostas.** Entrada: marcar Editados,
  "Altura fora do padrão?" = Sim e "Profundidade fora do padrão?" = Não; depois tocar em
  Convencionais; depois tocar em Editados de novo. Esperado: ao marcar Convencionais as
  subperguntas somem; ao voltar para Editados reaparecem com Sim e Não, como estavam.
- **CA-07 [Manual] — Sem número do balcão e sem orientação.** Entrada: percorrer a pergunta nas
  três respostas e nas subperguntas. Esperado: **nenhum campo numérico, nenhum número de medida
  (inclusive padrão) e nenhum texto de orientação relativos ao balcão** aparecem na tela. Os dois
  campos numéricos de altura do **piso** (balcões e armários) **continuam exatamente como hoje**,
  e isso não reprova o critério. O campo de Observações do ambiente está **idêntico ao de hoje**,
  sem menção nova a balcões.
- **CA-08 [Manual] — Cada ambiente é independente.** Entrada: Cozinha = Editados (altura Sim,
  profundidade Não) e Varanda = Convencionais. Esperado: ao voltar à Cozinha ela continua Editados
  com Sim e Não; a Varanda continua Convencionais.

**Validação (erros)**

- **CA-09 [Auto] — Sem resposta bloqueia.** Entrada: ambiente do grupo A com tudo respondido,
  **menos** a pergunta principal; "Avançar". Esperado: bloqueia; mensagem padrão `Responda esta
  pergunta ou marque "Não se aplica"` na pergunta principal; nenhum outro campo com erro. [Manual]
  para a rolagem até o erro.
- **CA-10 [Auto] — Convencionais ou Não se aplica liberam.** Entrada: tudo respondido +
  Convencionais (depois Não se aplica), subperguntas vazias. Esperado: avança sem erro.
- **CA-11 [Auto] — Editados sem subrespostas.** Entrada: Editados, as duas subperguntas sem
  resposta. Esperado: bloqueia; **cada uma** mostra "Responda sim ou não" no próprio item.
- **CA-12 [Auto] — Editados com uma subresposta só.** Entrada: Editados com altura respondida e
  profundidade sem resposta (e o inverso). Esperado: bloqueia; erro "Responda sim ou não" **só**
  no item sem resposta.
- **CA-13 [Auto] — Editados com Não e Não.** Entrada: Editados, altura Não, profundidade Não.
  Esperado: **avança**.
- **CA-14 [Auto] — Editados com algum Sim.** Entrada: Editados com Sim/Sim, Sim/Não e Não/Sim.
  Esperado: avança nos três casos.
- **CA-15 [Auto] — Subrespostas antigas não são verificadas.** Entrada: pergunta principal =
  Convencionais (e depois Não se aplica), com subrespostas guardadas de antes (respondidas ou
  não). Esperado: avança; nada é exigido nem verificado nas subperguntas.
- **CA-16 [Auto] — Grupos B e C intocados.** Entrada: respostas válidas completas de B e de C,
  **sem** a pergunta nova. Esperado: avançam como hoje, sem erro novo.
- **CA-17 [Auto] — Regras antigas intactas.** Entrada: grupo A com altura do piso vazia ou zero e
  demais campos como hoje. Esperado: **mesmos erros de hoje nos mesmos campos, com a mesma
  mensagem** (`Responda esta pergunta ou marque "Não se aplica"`).

**PDF do Projetista**

- **CA-18 [Auto texto; Manual destaque] — Convencionais.** Entrada: Cozinha com Convencionais.
  Esperado: o PDF mostra "Balcões convencionais ou editados" seguido de `Resposta:
  Convencionais`, **sem destaque**, entre "Altura do piso — armários" e "Fechamento até o teto".
- **CA-19 [Auto texto; Manual destaque] — Não se aplica.** Entrada: Cozinha com Não se aplica.
  Esperado: `Resposta: Não se aplica`, sem destaque.
- **CA-20 [Auto] — Não respondida.** Entrada: Cozinha com todas as respostas vazias (T-V03
  atualizado). Esperado: `Resposta: —` na pergunta nova, e demais linhas como hoje.
- **CA-21 [Auto texto; Manual destaque] — Editados com Não e Não.** Entrada: Cozinha com Editados,
  altura Não, profundidade Não. Esperado: `Resposta: Editados`, **sem complemento e sem
  destaque**.
- **CA-22 [Auto texto; Manual destaque] — Editados só altura Sim.** Entrada: Editados, altura Sim,
  profundidade Não. Esperado: `Resposta: Editados — altura fora do padrão`, **destacada**.
- **CA-23 [Auto] — Dois ambientes.** Entrada: Cozinha = Editados (só altura Sim) e Varanda =
  Convencionais. Esperado: **o bloco aparece nos dois ambientes**, cada um com a sua resposta
  (`Resposta: Editados — altura fora do padrão` na Cozinha, `Resposta: Convencionais` na
  Varanda).
- **CA-24 — REMOVIDO** (medida faltando; deixou de existir, ver cabeçalho desta seção).
- **CA-25 [Auto] — Observações e demais perguntas preservadas.** Entrada: Editados + observação
  preenchida. Esperado: "Observações do ambiente" continua saindo no fim; todas as outras perguntas
  e a ordem são as de hoje (com a pergunta nova no lugar definido).
- **CA-26 [Auto] — Grupos B e C iguais.** Entrada: T-V04 e T-V05 **sem edição**. Esperado: passam.
- **CA-32 [Auto texto; Manual destaque] — Editados, altura Sim e profundidade Sim.** Esperado:
  `Resposta: Editados — altura e profundidade fora do padrão`, **destacada**.
- **CA-33 [Auto texto; Manual destaque] — Editados só profundidade Sim.** Entrada: altura Não,
  profundidade Sim. Esperado: `Resposta: Editados — profundidade fora do padrão`, **destacada**.
- **CA-34 [Auto] — "Não" e números nunca no PDF.** Entrada: todos os casos acima. Esperado:
  o PDF não tem nenhum texto `Resposta: Não` vindo das subperguntas (o caso Editados com Não e Não
  sai exatamente `Resposta: Editados`), nem os rótulos "Altura fora do padrão?" / "Profundidade
  fora do padrão?", nem número de medida **do balcão**. (O "Não" de "Não se aplica", o "NÃO" do
  fechamento até o teto e as respostas de altura do **piso**, como `Resposta: 850 mm`, continuam
  existindo no PDF e **não são erro**.)
- **CA-35 [Manual] — Destaque visual.** Entrada: abrir os PDFs dos casos Editados. Esperado: com
  **ao menos um "Sim"**, o rótulo e a resposta saem na cor de alerta (vermelho, como o risco alto
  do PDF do Cliente), sem fundo e sem moldura; com Não/Não, Convencionais, Não se aplica e vazia,
  **sem destaque**; as perguntas seguintes voltam ao preto; legível também quando a pergunta cai
  no fim de uma página.

**Revisão**

- **CA-27 [Manual] — Todas as respostas.** Entrada: Revisão com ambientes em Convencionais, Não se
  aplica, Editados Não/Não, Editados só altura Sim, só profundidade Sim e as duas Sim. Esperado:
  cada um mostra a linha `Balcões convencionais ou editados: …` com o **mesmo texto do PDF**
  (Seção 5.4); destaque em cor de alerta **só** quando houver "Sim"; Editados Não/Não sem
  destaque.
- **CA-28 [Manual] — Rascunho antigo.** Entrada: rascunho salvo antes da mudança, com ambiente do
  grupo A sem a pergunta nova, continuando até a Revisão. Esperado: sem erro nem tela quebrada; o
  ambiente mostra `Balcões convencionais ou editados: —` e, se o PDF for gerado, `Resposta: —`; ao
  voltar e tentar avançar nesse ambiente, a pergunta nova é exigida.
- **CA-29 [Manual] — Grupos B e C na Revisão.** Esperado: sem linha de balcões.
- **CA-36 [Manual] — "Não" e números nunca na Revisão.** Esperado: nenhum "Não" das
  subperguntas e nenhum número de medida **do balcão** na Revisão. (As alturas de **piso** continuam aparecendo
  como hoje e não são erro.)

**Isolamento**

- **CA-30 [Manual] — Cliente e Venda futura intactos.** Entrada: percorrer o Cliente e abrir
  `/futura/revisao`. Esperado: nenhuma diferença visual ou de PDF.
- **CA-31 [Auto] — Suíte inteira verde.** Entrada: `npm test` (e `npm run build`). Esperado: todos
  passam, **nenhum teste pulado** (regra do `CLAUDE.md`), com T-V03 e T-V06 já atualizados.

---

## 15. Cobertura de testes

### 15.1 Testes existentes que mudam de propósito

Escritas por extenso, a partir das regras desta feature (e não do código):

**T-V03** (`V_pdf_projetista.test.js:31-47`) — grupo A, cozinha, tudo vazio. Depois do nome do
ambiente, nesta ordem exata:

1. `Altura do piso — balcões`
2. `Resposta: —`
3. `Altura do piso — armários`
4. `Resposta: —`
5. `Balcões convencionais ou editados`
6. `Resposta: —`
7. `Fechamento até o teto`
8. `Resposta: —`
9. `Caixarias ou corpos`
10. `Resposta: —`
11. `Dobradiças`
12. `Resposta: —`
13. `Corrediças`
14. `Resposta: —`

**T-V06** (`:76-98`) — mesmo estado de hoje (altura do piso dos balcões 850; altura do piso dos
armários "não se aplica"; fechamento "NAO"; caixaria vazia; dobradiças "Amortecimento"), e a
**pergunta nova NÃO respondida**. Lista de respostas, nesta ordem:

1. `Resposta: 850 mm`
2. `Resposta: Não se aplica`
3. `Resposta: —` (balcões convencionais ou editados)
4. `Resposta: NÃO`
5. `Resposta: —` (caixaria)
6. `Resposta: Amortecimento`
7. `Resposta: —` (corrediças)

A **segunda parte** do T-V06 (fechamento "SIM" → `Fechamento até o teto` seguido de `Resposta:
SIM`) **continua igual**.

**T-V04 e T-V05 não mudam.**

### 15.2 O que será testado automaticamente

**PDF do Projetista** (`V_pdf_projetista.test.js`; dados fictícios, captura só de texto):

1. Convencionais → `Resposta: Convencionais` (CA-18).
2. Não se aplica → `Resposta: Não se aplica` (CA-19).
3. Não respondida → `Resposta: —` (CA-20, via T-V03).
4. Editados, Não e Não → `Resposta: Editados`, sem complemento (CA-21).
5. Editados, só altura Sim → `Resposta: Editados — altura fora do padrão` (CA-22).
6. Editados, só profundidade Sim → `Resposta: Editados — profundidade fora do padrão` (CA-33).
7. Editados, as duas Sim → `Resposta: Editados — altura e profundidade fora do padrão` (CA-32).
8. Dois ambientes, cada um com a sua resposta (CA-23).
9. O "Não" das subperguntas nunca no texto do PDF; nenhum número de medida **do balcão** (CA-34; as alturas de piso, como `Resposta: 850 mm`,
   continuam no PDF).
10. Observações e ordem das demais perguntas (CA-25); T-V04 e T-V05 sem edição (CA-26).

**Validação do Projetista** (novo arquivo de teste; decisão Q3 = sim): CA-09 a CA-17.

### 15.3 O que fica manual

- **Destaque colorido** (CA-18, 19, 21, 22, 32 e 33 na parte visual, e CA-35): o modo de captura
  (`captura_jspdf.js`, `captura_registro.js`) **não registra cor**, nem negrito, nem fundo —
  só textos. Logo, "destacada vs não destacada" é conferência visual no PDF aberto.
- Aparência e comportamento da tela (botões, subperguntas que aparecem e somem, ausência do botão
  "Não se aplica" nas subperguntas, rolagem até o erro, uso no celular): CA-01 a CA-08.
- Revisão (CA-27, CA-28, CA-29, CA-36), rascunho antigo real no navegador e isolamento de Cliente
  e Venda futura (CA-30).

---

## 16. Documentos a revisar depois da implementação

- `PRDS_E_SPECS/INVENTARIO_FEATURES_CHECKLIST_DINAMICA.md` (Seção 4, regras do Projetista, e a
  "lista N" de validações sem teste, linhas 42 e 136): a validação do Projetista passa a ter
  teste.
- `PRDS_E_SPECS/SPEC_TESTES_REGRESSAO_CHECKLIST_DINAMICA.md` (linhas 397 e 400, T-V03 e T-V06):
  as listas esperadas mudam.
- `PRDS_E_SPECS/PRD_CHECKLIST_VENDEDOR.md`: nenhuma edição (histórico). Esta feature **não
  contradiz** o que ele diz sobre o PDF (a pergunta sempre aparece); o Spec desta feature prevalece
  para a pergunta nova.
- `CLAUDE.md` do projeto: ao concluir, perguntar ao Everton se deve ser atualizado (por exemplo,
  o fato de a validação do Projetista ter saído do `.jsx` e de o PDF do Projetista passar a ter
  cor de alerta). Priorizar trocar uma linha existente, mantendo abaixo de ~100 linhas.
- `Processos-liberacao/index.html` (fora deste repositório, linhas 602-609): descreve o checklist
  do Projetista; **não é obrigatório** atualizar. Não será alterado por esta feature.

---

> Nenhum código será escrito antes da aprovação deste PRD e do Spec. Próximo passo, após
> aprovação: gerar `SPEC_CHECKLIST_MEDIDAS_BALCOES.md`.
