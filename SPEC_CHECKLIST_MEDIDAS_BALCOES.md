# SPEC — Pergunta "balcões convencionais ou editados?" no Checklist do Projetista

> **Status: aguardando aprovação do Everton.** Nenhum código foi escrito.
>
> Base: `PRD_CHECKLIST_MEDIDAS_BALCOES.md` (aprovado em 17/11/2026, lido inteiro). As decisões das
> Seções 2, 5 e 13 do PRD são fixas e não são reabertas aqui. Este Spec só decide o que o PRD
> deixou para ele (Seção 1 abaixo) e descreve como implementar. **Durante a implementação, o Spec
> prevalece sobre o PRD e sobre qualquer outro documento.** Quem implementa não precisa ler a
> conversa que gerou este arquivo.
>
> Tudo o que é descrito como "hoje" foi reconferido no código em 17/11/2026, com `arquivo:linha`.
> Todos os caminhos são relativos à raiz do projeto (`Checklist-Dinamica/`).

---

## 0. Conferência PRD x código (Etapa 2)

As linhas citadas no PRD foram reconferidas e batem: `FormGrupoA.jsx:18-53, 55-83, 73-79, 87-90`,
`StepPerguntasAmbienteVendedor.jsx:14-37, 64-68, 81-92`, `pdfVendedor.js:16-36, 38-44, 74, 99-110,
120, 128, 136-142`, `StepRevisaoVendedor.jsx:10-38, 57-69, 101-108`, `schemaVendedor.js:3-11`,
`pdf.js:12` (`ALTO: [180, 0, 0]`), `index.css:23` (`--ba-danger`), `V_pdf_projetista.test.js:31-47`
(T-V03) e `:76-98` (T-V06), `StepRevisaoFutura.jsx:6` (importa o CSS da Revisão do Projetista).

Observações (o código prevalece; o PRD não foi alterado):

- **O runner de testes é `node --test`** (`package.json`, script `test`), com o módulo `node:test`
  e `node:assert/strict`. Não há Python nem pytest neste projeto. Nenhuma dependência de teste
  nova (o `esbuild` 0.21.5, já em `devDependencies`, é usado pela captura de PDF existente).
- **`COR_NIVEL` do `pdf.js` não é exportada** (`pdf.js:11`, `const COR_NIVEL`). Portanto o PDF do
  Projetista não pode importá-la; terá uma constante local com o mesmo valor (Seção 1.4). O
  `pdf.js` continua intocado.
- **O estado inicial dos testes de PDF vem dos defaults do schema** (`construtores.js:93-96` junta
  `defaultsPorGrupo[grupo]` com a resposta do caso). Por isso os campos novos entram nos testes
  automaticamente, como `null`.
- **Acréscimo do Spec que o PRD não prevê:** o arquivo `src/domain/respostaBalcaoVendedor.js` (Seção
  1.4). Ver a nota lá.
- **Estado do repositório em 18/11/2026:** o PRD e o Spec já estão commitados na `main` (commit
  `d9fe6cc`). A Task 0 do Plano só cria a branch da implementação a partir dela.
- Nada mais divergiu. Nenhum item para "Desvios" no momento (a seção abaixo continua vazia).

---

## 1. Decisões do Spec

### 1.1 Nomes e valores dos campos novos (grupo A) — `src/domain/schemaVendedor.js`

Três campos novos em `defaultsPorGrupo.A`, todos começando `null`, inseridos **logo depois de
`alturaArmario_mm`** (mesma ordem da tela), com comentário de valores no estilo dos vizinhos:

| Campo | Pergunta | Valores gravados |
|---|---|---|
| `tipoBalcao` | "Os balcões deste ambiente serão convencionais ou editados?" | `"Convencionais"` / `"Editados"` / `"não se aplica"` / `null` (não respondida) |
| `balcaoAlturaForaPadrao` | "Altura fora do padrão?" | `"Sim"` / `"Não"` / `null` |
| `balcaoProfundidadeForaPadrao` | "Profundidade fora do padrão?" | `"Sim"` / `"Não"` / `null` |

Por quê estes nomes: começam por `balcao`/`tipoBalcao` e terminam em `ForaPadrao`, sem o sufixo
`_mm`, então não se confundem com `alturaBalcao_mm` (altura do **piso**, que não muda) e deixam
claro que não guardam medida (risco R2 do PRD).

Por quê `"Sim"`/`"Não"` e não `"SIM"`/`"NAO"`: o `fechamentoTeto` guarda `{valor:'SIM'}` com rótulo
`NÃO` (`FormGrupoA.jsx:6`). As subperguntas guardam o **próprio rótulo** como texto simples
(`'Sim'`, `'Não'`), igual `caixaria` e `dobradicas` (`FormGrupoA.jsx:7-8`, opções em texto), o que
reaproveita o caminho "opção = texto" da função existente sem criar um segundo formato. As duas
convenções convivem sem se cruzar porque são campos diferentes; a regra de texto/destaque (1.4)
compara **só** com `'Sim'` e `'Editados'` (maiúsculas e acento exatos), nunca com `'SIM'`.
O `fechamentoTeto` **não muda**.

`FormProviderVendedor.jsx` **não muda**: a gravação é genérica (`:158-171`) e a restauração de
rascunho junta defaults + salvo (`:25-50`), então os três campos nascem `null` em rascunho antigo.

### 1.2 Arquivo de regras de validação — `src/domain/validacaoVendedor.js` (novo)

Por quê em `src/domain/`: é onde o `CLAUDE.md` manda ficar regra de negócio, e já existe o par
`schemaVendedor.js` / `gruposPerguntasVendedor.js`. Arquivo `.js` puro, **sem importar React**, para
o teste carregá-lo direto.

Exporta (assinaturas):

- `MSG_RESPONDA` — texto fixo `Responda esta pergunta ou marque "Não se aplica"` (o mesmo de hoje,
  `StepPerguntasAmbienteVendedor.jsx:33`).
- `MSG_RESPONDA_SIM_NAO` — texto fixo `Responda sim ou não`.
- `validarRespostasGrupo(grupo, resp)` — **mesmo nome e mesma assinatura da função de hoje**
  (`:29`). `grupo` é `'A'`, `'B'` ou `'C'`; `resp` é o objeto de respostas do ambiente (pode ser
  `{}`). Devolve um objeto `{ [campo]: mensagem }`; objeto vazio = pode avançar.

O que a função decide:

1. **Movido sem mudança** do `.jsx`: a constante `NAO_SE_APLICA`, a lista `CAMPOS_ALTURA`, a lista
   `CAMPOS_OBRIGATORIOS_POR_GRUPO` e a regra `respostaValida` (`:14-27`), com o mesmo
   comportamento: "não se aplica" vale sempre; altura de piso vale só com número `> 0`; demais
   campos valem com qualquer valor não `null` e não `undefined`. Erro sempre `MSG_RESPONDA`.
2. **Acrescentado** à lista do grupo A, depois de `alturaArmario_mm`: `tipoBalcao` (regra e mensagem
   padrão, iguais a `caixaria`). Grupos B e C: listas inalteradas.
3. **Acrescentado** (só grupo A): se `resp.tipoBalcao === 'Editados'`, cada uma das chaves
   `balcaoAlturaForaPadrao` e `balcaoProfundidadeForaPadrao` é válida só se for exatamente `'Sim'`
   ou `'Não'`; caso contrário `erros[<chave>] = MSG_RESPONDA_SIM_NAO`. Com `tipoBalcao` diferente
   de `'Editados'` (incluindo `null`, `'Convencionais'`, `'não se aplica'`) as subperguntas **não
   são verificadas**. Cada subpergunta tem **chave de erro própria** (o próprio nome do campo).

Como o componente passa a usar (sem mudar o que a validação decide hoje):
`StepPerguntasAmbienteVendedor.jsx` apaga as linhas `:14-37` (as quatro definições locais) e
**importa** `validarRespostasGrupo` de `../../../domain/validacaoVendedor.js`. O resto do
componente (`validar`, `setErros`, `scrollToFirstError`, `avancar`) fica igual. As mesmas mensagens
e as mesmas chaves de erro de hoje continuam chegando ao `FormGrupoA/B/C` via prop `erros`.

**Remoção das definições locais é segura (verificado por busca no projeto):** `NAO_SE_APLICA`,
`CAMPOS_ALTURA`, `CAMPOS_OBRIGATORIOS_POR_GRUPO` e `respostaValida` são definidos em
`StepPerguntasAmbienteVendedor.jsx:14-27` e usados só ali (`:24-32` e `:65`); nenhum outro arquivo de
`src/` nem de `testes/` os importa. `FormGrupoA.jsx:5`, `FormGrupoB.jsx:5` e `FormGrupoC.jsx:5` têm uma
constante `NAO_SE_APLICA` **própria**, declarada localmente e não importada. Consequência registrada: a
constante `NAO_SE_APLICA` passa a existir em **dois lugares** (nos formulários e no arquivo de regras) e
**não se unifica** (R6: não refatorar duplicações existentes).

**Ordem de ligação (regra do Plano):** o componente só passa a importar este arquivo **depois** que a
pergunta nova já aparece na tela (Task 7 antes da Task 8 do Plano). Caso contrário, todo ambiente do
grupo A ficaria impossível de avançar, com erro numa pergunta que ainda não existe na tela.

### 1.3 Parâmetro novo da pergunta fechada do Grupo A — `FormGrupoA.jsx`

Nome: **`mostrarNaoSeAplica`**, quarto parâmetro posicional de `campoFechado`
(`campoFechado(campo, pergunta, opcoes, mostrarNaoSeAplica = true)`), **padrão `true`**. Por quê
posicional com padrão: segue o estilo da função (parâmetros posicionais) e deixa as quatro
chamadas atuais (`:93-96`) idênticas, sem editar nenhuma. Quando `false`, o botão "Não se aplica"
(`:73-79`) não é desenhado. **Só as duas subperguntas passam `false`.** As cópias de
`FormGrupoB.jsx:18-46` e `FormGrupoC.jsx:17-41` **não são abertas nem editadas**.

Tela, no bloco "Alturas de instalação" (`:87-90`), **logo depois** das duas chamadas
`campoAltura(...)`:

1. `campoFechado('tipoBalcao', 'Os balcões deste ambiente serão convencionais ou editados?',
   ['Convencionais', 'Editados'])` → mostra os botões Convencionais, Editados e (padrão) Não se
   aplica, nesta ordem.
2. Só quando `resp.tipoBalcao === 'Editados'`: um bloco com classe nova (1.5) contendo, nesta
   ordem, `campoFechado('balcaoAlturaForaPadrao', 'Altura fora do padrão?', ['Sim', 'Não'],
   false)` e `campoFechado('balcaoProfundidadeForaPadrao', 'Profundidade fora do padrão?',
   ['Sim', 'Não'], false)`. Sem campo numérico, sem texto de orientação.
3. Trocar de Editados para outra opção **não apaga** as subrespostas (basta o bloco condicional
   sumir; nenhum `set(..., null)` é chamado).

O erro de cada subpergunta aparece no próprio item pelo mecanismo que `campoFechado` já tem
(`erros[campo]` com a classe `erro-campo`, `:81`), então entra no scroll automático sem código novo.
O título do bloco, "Observações (opcional)" e o `textarea` **não mudam**.

### 1.4 Texto da resposta e destaque — regra única, compartilhada

Onde mora a lógica: novo arquivo **`src/domain/respostaBalcaoVendedor.js`**, exportando uma única
função pura **`descreverRespostaBalcao(resp)`**, que devolve `{ texto, destaque }`
(`texto`: string; `destaque`: booleano). `resp` é o objeto de respostas do ambiente.

**Nota: este arquivo NÃO está previsto no PRD** (o PRD só prevê o arquivo de regras de validação,
`PRD:349`). É um **acréscimo do Spec**, aceito pelo revisor externo, para evitar que PDF e Revisão
divirjam (risco R6 do PRD).

Por quê compartilhar só esta função e não as listas (R6): as listas de perguntas
(`StepRevisaoVendedor.jsx:10-30`, `pdfVendedor.js:16-36`) e `formatarResposta` continuam
**duplicadas como estão** (não se unifica nada). Mas o texto/destaque da pergunta nova é uma regra
com 7 situações; escrevê-la duas vezes é exatamente como PDF e Revisão divergiriam. Compartilhar uma
função pura nova, sem tocar em código existente, é trivial e seguro.

Regra (escrita por extenso; ela vem do PRD 5.3 e 5.4):

| `resp.tipoBalcao` | `texto` | `destaque` |
|---|---|---|
| `null`, ausente | `—` | não |
| `'não se aplica'` | `Não se aplica` | não |
| `'Convencionais'` | `Convencionais` | não |
| `'Editados'`, nenhuma subpergunta é `'Sim'` (inclui `'Não'`/`'Não'` e subperguntas ainda `null`) | `Editados` | não |
| `'Editados'`, só altura `'Sim'` | `Editados — altura fora do padrão` | **sim** |
| `'Editados'`, só profundidade `'Sim'` | `Editados — profundidade fora do padrão` | **sim** |
| `'Editados'`, as duas `'Sim'` | `Editados — altura e profundidade fora do padrão` | **sim** |
| qualquer outro valor desconhecido | o próprio valor, como texto | não |

Subperguntas `'Sim'` guardadas com `tipoBalcao` diferente de `'Editados'` **nunca** acendem o
destaque nem aparecem no texto. O travessão é "—" (U+2014), com espaço antes e depois, igual ao PRD.
O "Não" das subperguntas **nunca** entra no texto. Nenhum número de medida aparece.

Como cada lado usa:

- Nas duas listas do grupo A entra **uma linha nova**, entre `alturaArmario_mm` e `fechamentoTeto`:
  `{ campo: 'tipoBalcao', label: 'Balcões convencionais ou editados', tipo: 'balcao' }`.
  `formatarResposta` de cada arquivo **não é editada**. No laço que percorre a lista, quando
  `item.tipo === 'balcao'` o código chama `descreverRespostaBalcao(resp)` e usa `texto` e
  `destaque`; para os demais itens segue `formatarResposta(item, resp[item.campo])` com
  `destaque = false`, como hoje.
- **PDF (`pdfVendedor.js`)**: constante local `COR_ALERTA = [180, 0, 0]` com comentário "mesma cor do
  risco ALTO do PDF do Cliente (`pdf.js:12`)". `escreverPergunta(pergunta, resposta, destaque =
  false)` ganha o terceiro parâmetro (padrão `false`, então a chamada de "Observações do ambiente",
  `:141`, não muda). Dentro dela: a linha `doc.setTextColor(0, 0, 0)` (`:103`) passa a escolher a cor
  por `destaque` (alerta se verdadeiro, preto se falso), valendo para o **rótulo e a resposta**;
  e, **ao final da função** (depois do `y += 2`), o texto **volta explicitamente a preto**
  (`setTextColor(0, 0, 0)`), para a cor nunca vazar para o que vem depois (R10). Sem fundo, sem
  moldura, sem mudar tamanho de fonte ou espaçamento (o ajuste fino, se o Everton pedir, é
  conferido a olho). O nome do ambiente (`:128`) já reseta para preto; a linha dourada usa cor de
  traço, não de texto.
- **Revisão (`StepRevisaoVendedor.jsx`)**: o `<p>` da linha ganha a classe nova de destaque (1.5)
  **somente** quando `destaque` for verdadeiro. A linha continua `<strong>{label}:</strong>
  {texto}`.

**Verificações do PDF (conferidas no código):**

- `escreverPergunta` (`pdfVendedor.js:99-110`) tem **um único** `setTextColor(0, 0, 0)`, no `:103`,
  antes do rótulo; entre o rótulo e a resposta só mudam fonte e tamanho (`:106-107`), nunca a cor. A
  resposta **herda** a cor do rótulo. Por isso a abordagem acima (uma cor escolhida no `:103` serve aos
  dois textos) é suficiente.
- A quebra de página está em `garantirEspaco` (`pdfVendedor.js:85-89`): só `addPage()` e `y =
  margemSuperior`. Este PDF **não desenha cabeçalho nem rodapé**, então nenhum texto troca a cor na
  quebra. No jsPDF 2.5.2 (`node_modules/jspdf/dist/jspdf.es.js`) a cor do texto é uma variável global
  emitida em cada `text()` (`:4781`) e a criação de página (`_addPage`, `:3501`) só reaplica espessura e
  cor de **traço**, não a de texto. **Conclusão:** a cor de alerta persiste sozinha na página nova
  (inclusive se a quebra cair entre o rótulo e a resposta); não há nada a reaplicar. Por isso o **reset
  explícito para preto ao final de `escreverPergunta` continua obrigatório**. A conferência manual
  "pergunta destacada no fim de uma página" continua na lista (o teste automático não enxerga cor).

A Revisão **não** revalida nada e **não** muda de rota; a regra de rascunho antigo do PRD (Seção 9)
é consequência automática: `null` → `Balcões convencionais ou editados: —`.

### 1.5 CSS (só acrescentar)

- `StepPerguntasAmbienteVendedor.module.css` (usado só pelos três formulários do Projetista):
  **uma** classe nova para o bloco das subperguntas — recuo à esquerda de 16px, uma linha vertical
  fina à esquerda na cor `var(--ba-line)` e um pouco de espaço interno, sem alterar nenhuma classe
  existente. *Esta aparência pode ser revista depois de ver na tela.*
- `StepRevisaoVendedor.module.css` (**compartilhado com a Venda futura**, `StepRevisaoFutura.jsx:6`):
  **uma** classe nova de destaque que só define `color: var(--ba-danger)`. Nenhuma regra existente
  é editada, reordenada ou removida: a classe nova entra **no fim do arquivo**, depois de
  `.espacoBar`. Sem hex novo (token já existe, `index.css:23`).

### 1.6 Arquivos que o Spec NÃO altera

`FormGrupoB.jsx`, `FormGrupoC.jsx`, `FormProviderVendedor.jsx`, `gruposPerguntasVendedor.js`,
`construtores.js`, `pdf.js`, todo o Cliente e a Venda futura, `FieldGroup`, `scrollUtils`.

---

## 2. Arquivos afetados (resumo)

| Arquivo | Efeito |
|---|---|
| `src/domain/schemaVendedor.js` | 3 campos novos no grupo A (1.1) |
| `src/domain/validacaoVendedor.js` | **novo** — regras de validação (1.2) |
| `src/domain/respostaBalcaoVendedor.js` | **novo** — texto e destaque (1.4); acréscimo do Spec, não está no PRD |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.jsx` | apaga as regras locais (`:14-37`) e importa `validarRespostasGrupo` |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoA.jsx` | pergunta principal, subperguntas, parâmetro `mostrarNaoSeAplica` |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.module.css` | + 1 classe |
| `src/services/pdfVendedor.js` | linha nova na lista do grupo A; cor de alerta com retorno ao preto |
| `src/steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.jsx` | linha nova na lista do grupo A; classe de destaque |
| `src/steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.module.css` | + 1 classe no fim (compartilhado) |
| `testes/V_pdf_projetista.test.js` | T-V03 e T-V06 atualizados; testes novos de PDF |
| `testes/V_validacao_projetista.test.js` | **novo** — testes de validação |
| `testes/V_resposta_balcao.test.js` | **novo** — testes da função `descreverRespostaBalcao` (T19) |

---

## 3. Testes

### 3.1 Testes novos

Regras: o esperado vem do PRD, escrito por extenso no próprio teste (nunca importado do código
nem de constante/regex do `src/`, nem "o que o código devolver"). Dados fictícios: contratos e
números na série 9xxx. Sem rede, e-mail, navegador ou chamada paga; nenhum teste chama LLM. Os
testes de PDF usam o `jsPDF` real com captura só de texto (`testes/auxiliares/captura_jspdf.js`) e
o salvamento é capturado, nunca vai ao disco; `carregarPdf` já empacota em pasta temporária
(`carregar_pdf.js:33-36`). Os testes de validação e o T19 são funções puras e não tocam em arquivo.

Todos os casos de PDF usam `pdf.projetista(montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A',
resp: {...} }], ['9001']))` com os campos novos informados em `resp`; a leitura usa
`sequencia`/`ausencia`/`depoisDoNome` já existentes. Salvo onde dito, as alturas de piso ficam
`null` (sai `Resposta: —`). Texto de "Resposta" é sempre conferido por extenso.

**Arquivo `testes/V_pdf_projetista.test.js` (casos novos, em sequência a T-V10):**

- **T1 — Convencionais.** Cobre CA-18 (parte texto). Entrada: Cozinha com `tipoBalcao =
  "Convencionais"`. Esperado: o PDF contém, em sequência, `Altura do piso — armários`, `Resposta: —`,
  `Balcões convencionais ou editados`, `Resposta: Convencionais`, `Fechamento até o teto`.
- **T2 — Não se aplica.** Cobre CA-19. Entrada: Cozinha com `tipoBalcao = "não se aplica"`.
  Esperado: em sequência `Balcões convencionais ou editados`, `Resposta: Não se aplica`.
- **T3 — Editados, Não e Não.** Cobre CA-21. Entrada: `tipoBalcao = "Editados"`, altura `"Não"`,
  profundidade `"Não"`. Esperado: em sequência `Balcões convencionais ou editados`, `Resposta:
  Editados` (exatamente isso, sem complemento), seguido de `Fechamento até o teto`.
- **T4 — Editados, só altura Sim.** Cobre CA-22. Entrada: `"Editados"`, altura `"Sim"`,
  profundidade `"Não"`. Esperado: `Resposta: Editados — altura fora do padrão`.
- **T5 — Editados, só profundidade Sim.** Cobre CA-33. Entrada: `"Editados"`, altura `"Não"`,
  profundidade `"Sim"`. Esperado: `Resposta: Editados — profundidade fora do padrão`.
- **T6 — Editados, altura Sim e profundidade Sim.** Cobre CA-32. Entrada: `"Editados"`, as duas
  `"Sim"`. Esperado: `Resposta: Editados — altura e profundidade fora do padrão`.
- **T7 — Dois ambientes.** Cobre CA-23. Entrada: Cozinha com `"Editados"`, altura `"Sim"`,
  profundidade `"Não"`, e Varanda (grupo A, tipo `varanda`) com `"Convencionais"`. Esperado: o
  bloco aparece nos dois ambientes (usar `secao` de `leitura_pdf.js` para separar): na seção
  `Cozinha / Área de Serviço` há `Balcões convencionais ou editados` seguido de `Resposta:
  Editados — altura fora do padrão`; na seção `Varanda / Área Gourmet` há `Balcões convencionais ou
  editados` seguido de `Resposta: Convencionais`.
- **T8 — Observações e ordem preservadas.** Cobre CA-25. Entrada: Cozinha com `"Editados"`, altura
  `"Sim"`, profundidade `"Não"` e `observacoes = "TESTE de observação"`. Esperado, depois do nome do
  ambiente e nesta ordem exata: `Altura do piso — balcões`, `Resposta: —`, `Altura do piso —
  armários`, `Resposta: —`, `Balcões convencionais ou editados`, `Resposta: Editados — altura fora do
  padrão`, `Fechamento até o teto`, `Resposta: —`, `Caixarias ou corpos`, `Resposta: —`,
  `Dobradiças`, `Resposta: —`, `Corrediças`, `Resposta: —`, `Observações do ambiente`, `Resposta: TESTE
  de observação`.
- **T9 — "Não" e números nunca no PDF.** Cobre CA-34. Entrada: um PDF para cada uma das situações:
  Convencionais, Não se aplica, não respondida, Editados Não/Não, só altura Sim, só profundidade Sim
  e as duas Sim (alturas de piso `null`, fechamento `null`). Esperado, em **cada** PDF: nenhum texto
  é exatamente `Resposta: Não`; nenhum texto começa com `Altura fora do padrão` nem com
  `Profundidade fora do padrão`; nenhum texto contém `676`; nenhum texto contém ` mm`.
  (`Resposta: Não se aplica`, o `NÃO` do fechamento e `Resposta: 850 mm` do piso **não** fazem parte
  deste teste e continuam permitidos.)

**CA-20** (não respondida) é coberto pelo **T-V03** atualizado (3.2). **CA-26** (grupos B e C iguais)
é coberto por T-V04 e T-V05 **sem edição**: o teste é "continuam passando", não um caso novo.

**Arquivo novo `testes/V_validacao_projetista.test.js`** (importa só `validarRespostasGrupo` de
`src/domain/validacaoVendedor.js`; as mensagens esperadas são escritas por extenso dentro do teste).
Base de "respostas válidas do grupo A" usada em todos: altura do piso dos balcões 850, altura do piso
dos armários `"não se aplica"`, fechamento `"NAO"`, caixaria `"MDP"`, dobradiças `"Convencionais"`,
corrediças `"Ocultas"` — o caso muda só os três campos novos.

- **T10 — Sem resposta principal bloqueia.** Cobre CA-09 (parte automática). Entrada: base + os três
  campos novos `null`. Esperado: o resultado tem **uma única chave**, `tipoBalcao`, com a mensagem
  `Responda esta pergunta ou marque "Não se aplica"`.
- **T11 — Convencionais e Não se aplica liberam.** Cobre CA-10. Entrada: base + `tipoBalcao =
  "Convencionais"` e subperguntas `null`; e depois `tipoBalcao = "não se aplica"` com subperguntas
  `null`. Esperado: nos dois, resultado vazio (sem erro).
- **T12 — Editados sem subrespostas.** Cobre CA-11. Entrada: base + `"Editados"`, subperguntas
  `null`. Esperado: exatamente duas chaves, `balcaoAlturaForaPadrao` e
  `balcaoProfundidadeForaPadrao`, **ambas** com `Responda sim ou não`.
- **T13 — Editados com uma subresposta só.** Cobre CA-12. Entrada A: `"Editados"`, altura `"Sim"`,
  profundidade `null`. Esperado A: só a chave `balcaoProfundidadeForaPadrao` com `Responda sim ou
  não`. Entrada B: `"Editados"`, altura `null`, profundidade `"Não"`. Esperado B: só a chave
  `balcaoAlturaForaPadrao` com `Responda sim ou não`.
- **T14 — Editados com Não e Não.** Cobre CA-13. Entrada: `"Editados"`, `"Não"`, `"Não"`. Esperado:
  resultado vazio (avança).
- **T15 — Editados com algum Sim.** Cobre CA-14. Entrada: `"Editados"` com Sim/Sim, Sim/Não e
  Não/Sim (três verificações). Esperado: resultado vazio nas três.
- **T16 — Subrespostas antigas não são verificadas.** Cobre CA-15. Entrada: `tipoBalcao =
  "Convencionais"` e depois `"não se aplica"`, cada um com (a) subperguntas `null` e (b)
  subperguntas `"Sim"`/`"Não"` guardadas, e ainda (c) valor inválido qualquer numa subpergunta
  (ex.: `"talvez"`). Esperado: resultado vazio em todas as combinações.
- **T17 — Grupos B e C intocados.** Cobre CA-16. Entrada: respostas válidas completas do grupo B
  (caixaria `"MDF"`, dobradiças `"Amortecimento"`, corrediças `"Ocultas"`, fechamento `"SIM"`) e do
  grupo C (as três primeiras), **sem** nenhum campo de balcão. Esperado: resultado vazio nos dois.
- **T18 — Regras antigas do grupo A intactas.** Cobre CA-17. Entrada (cada uma sobre a base, com
  `tipoBalcao = "Convencionais"` para isolar): (a) altura do piso dos balcões `null`; (b) altura do
  piso dos armários `0`; (c) altura do piso dos balcões negativa (`-5`); (d) fechamento `null`.
  Esperado: (a) só `alturaBalcao_mm`; (b) só `alturaArmario_mm`; (c) só `alturaBalcao_mm`; (d) só
  `fechamentoTeto`; em todos a mensagem é `Responda esta pergunta ou marque "Não se aplica"`.
  E ainda: altura do piso `"não se aplica"` continua válida (sem erro).

**Arquivo novo `testes/V_resposta_balcao.test.js`** (`node:test` + `node:assert/strict`; importa só
`descreverRespostaBalcao` de `src/domain/respostaBalcaoVendedor.js`). O esperado de cada verificação,
`{ texto, destaque }`, é escrito por extenso no teste, copiado das tabelas do **PRD** (5.3 e 5.4) e
**não** da tabela 1.4 deste Spec, nem do que a função devolver, nem de constante ou regex do `src/`.
O travessão é "—" (U+2014) com espaço antes e depois.

- **T19 — Texto e destaque da resposta de balcões (função pura).** Cobre a **parte lógica do
  destaque** de CA-18, 19, 21, 22, 32, 33 e 35 (a **cor** em si continua manual) e a regra de texto/
  destaque compartilhada com a Revisão (CA-27, parte lógica). Uma verificação por situação:
  - (a) `resp = {}` (campo ausente) → texto `—`, destaque não.
  - (b) `tipoBalcao = null` → `—`, não.
  - (c) `"não se aplica"` → `Não se aplica`, não.
  - (d) `"Convencionais"` → `Convencionais`, não.
  - (e) `"Editados"`, as duas subperguntas `null` → `Editados`, não.
  - (f) `"Editados"`, altura `"Não"` e profundidade `"Não"` → `Editados`, não.
  - (g) `"Editados"`, altura `"Sim"` e profundidade `"Não"` → `Editados — altura fora do padrão`, **sim**.
  - (h) `"Editados"`, altura `"Não"` e profundidade `"Sim"` → `Editados — profundidade fora do padrão`, **sim**.
  - (i) `"Editados"`, altura `"Sim"` e profundidade `"Sim"` → `Editados — altura e profundidade fora do padrão`, **sim**.
  - (j) valor desconhecido, por exemplo `"Xyz"` → `Xyz`, não.
  - (k) subperguntas `"Sim"` guardadas, mas `tipoBalcao = "Convencionais"` → `Convencionais`, não
    (Sim antigo não pode acender o destaque).

**Conferência manual (não vira teste; motivo entre parênteses):**

- **Cor do destaque** no PDF e na Revisão — CA-18, 19, 21, 22, 32, 33 (parte visual) e CA-35 (o modo de
  captura não registra cor, negrito nem fundo; confirmado em `captura_jspdf.js:26-29`; a decisão "tem
  ou não tem destaque" já é testada pelo T19, mas a cor aplicada só se vê no arquivo aberto). Abrir os
  PDFs gerados no `npm run dev` para os 7 casos: com ao menos um "Sim", rótulo e resposta em
  vermelho, sem fundo e sem moldura; nos demais casos preto; a pergunta seguinte volta ao preto; legível
  quando a pergunta destacada cai no fim de uma página (inclusive se a quebra cair entre o rótulo e a
  resposta).
- **Telas** — CA-01 a CA-08 e rolagem até o erro de CA-09 (exigem navegador; componente React sem
  teste na suíte).
- **Revisão** — CA-27, CA-29, CA-36 (aparência, cor e posição; componente React).
- **Rascunho antigo** — CA-28 (exige `localStorage` real do navegador).
- **Cliente e Venda futura** — CA-30 (abrir `/futura/revisao` e percorrer o Cliente; CSS compartilhado).
- **Suíte e build** — CA-31 é a última task do Plano.

### 3.2 Testes existentes afetados

- `testes/V_pdf_projetista.test.js::T-V03` — antes: 12 linhas depois do nome do ambiente (alturas, fechamento, caixaria, dobradiças, corrediças) → depois: 14 linhas, com a pergunta nova entre
  "Altura do piso — armários" e "Fechamento até o teto". Lista esperada (copiada do PRD, 15.1), depois
  de `Cozinha / Área de Serviço`, nesta ordem:
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

  O título do teste pode ganhar "pergunta de balcões" no texto.
- `testes/V_pdf_projetista.test.js::T-V06` — antes: lista exata de 6 respostas → depois: 7 respostas.
  Entrada igual à de hoje (altura do piso dos balcões 850; armários `"não se aplica"`; fechamento
  `"NAO"`; caixaria `null`; dobradiças `"Amortecimento"`; corrediças ausente) e a pergunta nova **não
  respondida**. Lista esperada (copiada do PRD, 15.1), na ordem:
  1. `Resposta: 850 mm`
  2. `Resposta: Não se aplica`
  3. `Resposta: —` (balcões convencionais ou editados)
  4. `Resposta: NÃO`
  5. `Resposta: —` (caixaria)
  6. `Resposta: Amortecimento`
  7. `Resposta: —` (corrediças)

  A **segunda parte** (fechamento `"SIM"` → `Fechamento até o teto` seguido de `Resposta: SIM`) fica
  igual.

Não afetados (**não podem ser editados**): `T-V04`, `T-V05`, `T-V01`, `T-V02`, `T-V07` a `T-V10` de
`V_pdf_projetista.test.js`; `I_importacao_pdf.test.js::T5` (usa o PDF do Projetista só para provar
que não há dados escondidos; não depende da lista de perguntas); todos os demais arquivos em
`testes/`.

---

## 4. Plano de Execução

**Regra do Plano: nenhum estado intermediário deixa o grupo A impossível de avançar; o arquivo de
validação só é importado pelo componente depois que a pergunta existe na tela.**

Cada task é feita e conferida sozinha, na ordem abaixo. Rodar `npm test` ao fim das tasks que mexem em
`src/` ou em `testes/`; a suíte inteira só precisa estar verde na última task, mas nenhuma task pode
deixar teste existente vermelho (exceto T-V03 e T-V06 entre o início da Task 9 e a sua própria edição,
que acontecem na mesma task).

- [ ] **Task 0 — Branch da implementação.** Toda a implementação é feita numa **branch própria criada a
  partir da `main`**, antes da primeira task. O PRD e o Spec **já estão commitados na `main`** (o Everton
  os commitou em 18/11/2026), então a branch já nasce com eles e **não há commit de documentos nesta
  task**. Nada vai para a `main` durante o Plano; o merge será feito pelo Everton depois, junto com outras
  melhorias do Checklist do Projetista (o deploy é automático a cada push na `main`, `CLAUDE.md` do
  projeto). Criar a branch (nome sugerido: `feat/balcoes-convencionais-editados`) a partir da `main`
  atualizada. **Sem push, sem merge.** Commit de código continua só quando o Everton pedir. Validação:
  `git branch --show-current` mostra a branch nova; `git status` limpo; `git log` mostra, no topo, o
  commit dos documentos que já veio da `main`, e nenhum commit novo.
- [ ] **Task 1 — Schema.** Em `src/domain/schemaVendedor.js`, acrescentar ao grupo A, logo depois de
  `alturaArmario_mm`, `tipoBalcao`, `balcaoAlturaForaPadrao` e `balcaoProfundidadeForaPadrao`, todos
  `null`, com comentário de valores (1.1). Validação: `npm test` — T-V03 e T-V06 ainda não mudaram e
  ainda passam (a pergunta nova só aparece no PDF na Task 9), e `npm run build` compila.
- [ ] **Task 2 — Regra compartilhada de texto/destaque + T19.** Criar
  `src/domain/respostaBalcaoVendedor.js` com `descreverRespostaBalcao(resp)` conforme a tabela de 1.4
  (arquivo acrescentado pelo Spec; ver a nota em 1.4). Criar `testes/V_resposta_balcao.test.js` com o
  **T19** (11 verificações, esperado escrito por extenso a partir do PRD). Validação: `npm test` — **T19
  verde**. O texto dentro do PDF é coberto depois, pelos T1 a T9 da Task 9; a **cor** no PDF é conferência
  manual da Task 10.
- [ ] **Task 3 — Regras de validação (movimento sem mudar comportamento).** Criar
  `src/domain/validacaoVendedor.js` com `MSG_RESPONDA`, `MSG_RESPONDA_SIM_NAO` e
  `validarRespostasGrupo`; primeiro só com o conteúdo movido de `StepPerguntasAmbienteVendedor.jsx:
  14-37` (sem a regra nova), **mantendo o componente como está** (ainda não importa o arquivo novo; a
  constante `NAO_SE_APLICA` fica nos dois lugares, ver 1.2). Validação: `npm run build`; a cobertura
  vem na Task 4.
- [ ] **Task 4 — Testes de regressão da validação (congelar o comportamento antigo).** Criar
  `testes/V_validacao_projetista.test.js` com **T17 e T18** (e a base do grupo A) e rodar contra o
  arquivo da Task 3 **antes** de acrescentar a regra nova. Validação: `npm test` — T17 e T18 verdes.
  (T18 usa `tipoBalcao = "Convencionais"` na entrada; por enquanto a regra nova ainda não existe e o
  campo é ignorado, então o resultado é o mesmo.)
- [ ] **Task 5 — Regra nova na validação.** Em `validacaoVendedor.js`, acrescentar `tipoBalcao` à lista
  do grupo A (depois de `alturaArmario_mm`) e a verificação das duas subperguntas quando `tipoBalcao`
  for `'Editados'` (1.2). Acrescentar a `V_validacao_projetista.test.js` os casos **T10 a T16**.
  Validação: `npm test` — T10 a T18 verdes. O componente **ainda não importa** este arquivo, então a
  tela continua avançando como hoje.
- [ ] **Task 6 — CSS das subperguntas.** Acrescentar ao fim de
  `StepPerguntasAmbienteVendedor.module.css` a classe nova do bloco das subperguntas (1.5). Validação:
  `npm run build` (compila; nenhuma regra existente editada).
- [ ] **Task 7 — Tela do grupo A.** Em `FormGrupoA.jsx`: parâmetro `mostrarNaoSeAplica` (padrão `true`)
  em `campoFechado`; pergunta principal logo depois das duas alturas; bloco condicional com as duas
  subperguntas (`false`), usando a classe da Task 6. Conferência manual (com o componente ainda usando a
  validação antiga, portanto o avanço não trava): CA-01 a CA-08 com `npm run dev`; conferir que
  fechamento, caixaria, dobradiças e corrediças **continuam** com "Não se aplica", que Dormitório/Home/
  Office não mudam (CA-02) e que não há campo numérico nem texto de orientação do balcão (CA-07).
- [ ] **Task 8 — Ligar o componente ao arquivo de regras.** Em `StepPerguntasAmbienteVendedor.jsx`,
  apagar as definições locais `:14-37` e importar `validarRespostasGrupo` de
  `../../../domain/validacaoVendedor.js`. Só agora, com a pergunta já visível na tela (Task 7).
  Validação: `npm run build` e `npm test`; conferência manual no `npm run dev`: (a) ambiente do grupo A
  vazio → "Avançar" mostra os erros de sempre com a mesma mensagem, **incluindo o erro da pergunta nova**
  (`Responda esta pergunta ou marque "Não se aplica"`) com rolagem até o primeiro erro (CA-09); (b)
  Editados sem subrespostas → `Responda sim ou não` em cada subpergunta, no próprio item (CA-11); (c)
  Convencionais/Não se aplica avançam (CA-10); (d) Dormitório, Home e Office avançam como hoje (CA-16).
- [ ] **Task 9 — Pergunta nova no PDF (texto).** Em `pdfVendedor.js`: acrescentar a linha `{ campo:
  'tipoBalcao', label: 'Balcões convencionais ou editados', tipo: 'balcao' }` ao grupo A entre
  `alturaArmario_mm` e `fechamentoTeto`; no laço (`:136-138`) usar `descreverRespostaBalcao(resp)` para
  `tipo === 'balcao'`; **ainda sem cor**. Atualizar **T-V03** e **T-V06** (3.2) e acrescentar **T1 a
  T9**. Validação: `npm test` — T-V03, T-V06, T-V04, T-V05, T1 a T9 verdes.
- [ ] **Task 10 — Cor de alerta no PDF.** Em `pdfVendedor.js`: constante local `COR_ALERTA = [180, 0,
  0]`; `escreverPergunta(pergunta, resposta, destaque = false)` aplica a cor ao rótulo e à resposta e
  **volta a preto ao final** (1.4); o laço passa `destaque`. Validação: `npm test` (nada deve mudar: a
  captura não registra cor) e **conferência manual** do PDF dos 7 casos (CA-35), incluindo uma pergunta
  destacada no fim de uma página.
- [ ] **Task 11 — CSS do destaque da Revisão (compartilhado).** Acrescentar **no fim** de
  `StepRevisaoVendedor.module.css` a classe nova com `color: var(--ba-danger)`; nenhuma regra
  existente editada. Validação: `npm run build`.
- [ ] **Task 12 — Revisão.** Em `StepRevisaoVendedor.jsx`: mesma linha nova no grupo A e uso de
  `descreverRespostaBalcao`; aplicar a classe de destaque (Task 11) só quando `destaque`. Conferência
  manual: CA-27, CA-29, CA-36 (texto idêntico ao do PDF).
- [ ] **Task 13 — Rascunho antigo.** Conferência manual de CA-28: salvar um rascunho com ambiente do
  grupo A **sem** os campos novos (por exemplo antes da Task 1, ou editando a chave
  `byarabi_checklist_vendedor` no navegador), continuar até a Revisão: sem erro; linha `Balcões
  convencionais ou editados: —`; PDF com `Resposta: —`; ao voltar ao ambiente, a pergunta nova é exigida
  (validação ligada na Task 8).
- [ ] **Task 14 — Isolamento.** Conferência manual de CA-30: percorrer o Cliente e abrir
  `/futura/revisao`; nenhuma diferença visual. Conferir `/projetista`.
- [ ] **Task 15 — Revisão de textos.** Conferir à mão que nenhum texto do aplicativo (tela, Revisão,
  PDF, mensagens) contém número de medida do balcão (nem `676`) nem orientação sobre balcões no campo
  Observações (CA-07).
- [ ] **Task 16 — Rodar a suíte inteira e o build:** `npm test` verde e sem teste pulado; `npm run
  build` compila; conferir à mão `/vendedor/revisao` (Revisão do Projetista), `/futura/revisao` e
  `/projetista` no `npm run dev`. Dizer o resultado (passou/pulou/falhou). **Sugerir** (sem executar
  commit, merge ou push) o nome da branch (`feat/balcoes-convencionais-editados`) e o texto de commit,
  com prefixo em inglês, resto em português e linha final `Co-Authored-By: Claude Sonnet 5.5
  <noreply@anthropic.com>`. Perguntar ao Everton se o `CLAUDE.md` deve ser atualizado (validação do
  Projetista fora do `.jsx`; PDF do Projetista com cor de alerta).

Se um teste novo falhar porque o código faz diferente do esperado acima, não ajuste o esperado para ficar verde: registre em Desvios e pare. Se um teste existente que não está na lista de afetados falhar, corrija o código, não o teste.

---

## 5. Desvios

*(vazia — será preenchida durante a implementação)*
