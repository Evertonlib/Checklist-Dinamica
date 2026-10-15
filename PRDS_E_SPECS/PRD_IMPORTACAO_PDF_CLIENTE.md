# PRD — Importação do PDF do Cliente

**Status:** Aguardando aprovação
**Data:** 2026-10-15
**Projeto:** Checklist Dinâmica — By Arabi Planejados
**Origem:** card Trello #99 "IMPORTACAO_PDF_CLIENTE" (board "Projetos automação"), decisões fechadas pelo Everton em 10/10/2026.

---

## Objetivo

Hoje, quando o cliente erra alguma informação na checklist (um eletro errado, um ambiente a mais, um telefone digitado errado), não existe forma de corrigir: o PDF gerado é só um documento de leitura, e o formulário que o produziu fica salvo apenas no navegador de quem preencheu — e é apagado assim que essa pessoa clica em "Iniciar novo preenchimento". Para corrigir um único campo, alguém precisa refazer a checklist inteira do zero.

Este PRD cria uma forma de **reabrir um PDF já gerado pelo Cliente e corrigi-lo**:

1. **Na geração (sem mudança visível):** todo PDF do Cliente passa a carregar, escondido dentro das propriedades do próprio arquivo, uma cópia completa das respostas que o geraram, marcada com uma versão ("V1"). O conteúdo impresso do PDF — capa, resumo, CCs, tabelas, nome do arquivo `Checklist_Cliente_{contrato}_{data}.pdf` — não muda em nada.
2. **Na importação (novo):** a tela inicial (`SelecaoPerfil`) ganha um botão "Importar PDF do cliente". O usuário escolhe o arquivo, o app lê as respostas escondidas, preenche o formulário do Cliente com elas e leva o usuário **direto para a tela de revisão do Cliente** (`/revisao`), de onde ele já consegue editar a identificação, os ambientes, as perguntas gerais ou qualquer ambiente pelos botões de edição que já existem ali, e gerar um PDF novo, corrigido.
3. **Rascunho em andamento:** se já houver um preenchimento do Cliente salvo e não concluído naquele navegador, o app **pergunta antes de sobrescrever** e só importa depois da confirmação (decisão 4 do Everton).
4. **PDF sem dados:** se o arquivo escolhido não tiver as respostas escondidas — PDF gerado antes desta versão, PDF do Projetista, PDF reimpresso ou "salvo como PDF" de novo, foto, ou qualquer outro arquivo — o app mostra uma única mensagem genérica: **"PDF não possui dados para importação"** (decisões 2 e 3 do Everton). A importação só funciona com o arquivo original baixado pelo app.

Quem usa, na prática, é o vendedor/projetista que recebeu o PDF do cliente. Mas, por decisão do Everton (decisão 1), o botão fica na tela inicial e leva ao fluxo do **Cliente** — o PDF importado é o do Cliente e é corrigido dentro do próprio fluxo do Cliente. O fluxo do Projetista (`/vendedor/*`) não muda nesta versão.

---

## Divergências entre o card e o código medido

O card pediu que este PRD verificasse quatro pontos no código antes de assumir. Resultado:

1. **`RESTORE_STATE` e `normalizarEstadoSalvo` existem, mas não estão "prontos para usar" a partir da tela inicial.** Ambos ficam em `src/context/FormProvider.jsx` — `normalizarEstadoSalvo` nas linhas 24-53 e o caso `RESTORE_STATE` do reducer nas linhas 256-258 (que só chama `normalizarEstadoSalvo`). Dois detalhes que o card não menciona:
   - `normalizarEstadoSalvo` é uma função **interna** do arquivo (não é exportada); hoje só o próprio `FormProvider` consegue usá-la.
   - `RESTORE_STATE` só pode ser disparado por quem está **dentro** do `FormProvider` do Cliente. Pelo `src/App.jsx:137-144`, o `FormProvider` só envolve as rotas do Cliente (`/identificacao` até `/sucesso`); a `SelecaoPerfil` (rota `/`, `App.jsx:135`) fica **fora** dele. Ou seja, o botão de importar na tela inicial não tem acesso direto a esse comando — a importação precisa "entregar" as respostas ao `FormProvider` de alguma forma (por exemplo, pelo armazenamento do navegador ou pela navegação). A forma exata fica para o Spec; o PRD só registra que o reaproveitamento do card é possível, mas não é "plugar e usar".
   - Existem gêmeos no lado do Projetista (`FormProviderVendedor.jsx:25` e `RESTORE_STATE_VENDEDOR` em `:180`), que **não** fazem parte desta versão.
2. **"Sem dependência nova" é verdadeiro para gravar e, com uma condição, também para ler.** Verificado na versão do `jsPDF` travada no `package-lock.json` (2.5.2): a biblioteca permite gravar propriedades do documento (título, assunto, autor, palavras-chave, criador) e também um bloco de metadados extra; as propriedades são gravadas como texto puro, sem compressão e sem criptografia (o projeto não liga nenhuma das duas — `pdf.js:92` cria o documento só com orientação, unidade e formato). Porém o **jsPDF não lê PDF** — ele só escreve. Ler no navegador sem biblioteca nova é possível porque, como a propriedade fica em texto puro dentro do arquivo, basta o app abrir o arquivo escolhido, procurar a marca da versão e decodificar o que vem depois. Isso funciona **só para PDFs gerados pelo próprio app** (que é exatamente o escopo decidido). Se algum dia a leitura precisar entender PDFs de terceiros, aí sim seria necessária uma biblioteca de leitura (ex.: pdf.js da Mozilla ou pdf-lib) — registrado como premissa e risco, não como escopo.
3. **Onde o PDF é gerado:** confirmado em `src/services/pdf.js`, função `gerarPdf` (linha 91 em diante), chamada pela revisão do Cliente em `StepRevisao.jsx:33-44`, que depois navega para `/sucesso`. O download acontece em `pdf.js:570`, com o nome `Checklist_Cliente_{contrato}_{data}.pdf`.
4. **Como o rascunho do Cliente é guardado:** `FormProvider.jsx:7` usa a chave `byarabi_checklist_rascunho`; o estado **inteiro** é regravado a cada mudança (`FormProvider.jsx:295-298`). Ao abrir qualquer rota do Cliente, se houver algo salvo, aparece o diálogo "Continuar de onde parou?" (`:315-330`), cujo "Sim" leva à última etapa salva (`:300-306`) e cujo "Não" apaga o rascunho e vai para `/identificacao` (`:308-313`). Existe ainda uma trava antiga (`:280-283`) que descarta silenciosamente rascunhos de um formato anterior (os que tinham o campo `g2_temReforma`). A chave é apagada quando o usuário conclui pelo "Iniciar novo preenchimento" da tela de sucesso (`StepSucesso.jsx:9-12` → `RESET_STATE`, `FormProvider.jsx:260-263`).

Outras duas observações de alinhamento:

5. O card fala em "entrada por SelecaoPerfil/identificação". A decisão 1 do Everton fechou **só a SelecaoPerfil**; a identificação do Cliente não ganha botão de importar.
6. O card diz que o vendedor precisa "acessar e editar qualquer ambiente ou identificação". Isso já é coberto pela revisão do Cliente como ela é hoje: `StepRevisao.jsx:77` tem "Editar" por ambiente e `:135-141` tem links para identificação, ambientes e perguntas gerais. Nenhum botão de edição novo é necessário.

---

## Relação com o código existente

A aplicação é um SPA React (Vite), `HashRouter`, sem backend, com dois fluxos paralelos — Cliente e Projetista ("Vendedor" internamente) — cada um com seu próprio Context, reducer, chave de armazenamento no navegador, rotas e gerador de PDF. Esta melhoria mexe **apenas no lado do Cliente** e reaproveita o máximo possível do que já existe.

### O que existe hoje (medido no código em 15/10/2026)

- **`src/screens/SelecaoPerfil/SelecaoPerfil.jsx`** — dois botões `.btnPerfil`: "Cliente" (vai para `/identificacao`) e "Projetista" (vai para `/vendedor/identificacao`). Não tem acesso ao estado de nenhum dos dois fluxos, porque está fora dos dois Providers.
- **`src/context/FormProvider.jsx`** — Provider do Cliente: chave `byarabi_checklist_rascunho`, gravação contínua, diálogo "Continuar de onde parou?", `normalizarEstadoSalvo` (completa o que faltar com os valores padrão de `schema.js` e recria as respostas de cada ambiente a partir de `defaultsPorFormType`) e o comando `RESTORE_STATE`. É exatamente o mecanismo que a importação deve reaproveitar, como sugere o card: ele já sabe transformar "respostas salvas" em "formulário preenchido" e já tolera respostas salvas com campos a menos.
- **`src/domain/schema.js:80-120`** — `estadoInicial` do Cliente: `_meta` (etapa atual, origem da navegação, datas), `identificacao`, `ambientesSelecionados`, `global` e `respostasPorAmbiente`. É esse conjunto, completo, que vai escondido no PDF.
- **`src/steps/StepRevisao/StepRevisao.jsx`** — revisão do Cliente: recalcula score e CCs a partir do estado (`:23-24`), mostra tudo e oferece os botões de edição. Ao abrir, limpa a "origem da navegação" (`:17-21`). Como score e CCs são sempre recalculados a partir das respostas, **não é preciso guardar score nem CCs no PDF** — só as respostas.
- **`src/services/pdf.js`** — gerador do PDF do Cliente. É o único lugar onde a gravação das respostas escondidas entra.
- **`src/App.jsx:133-155`** — rotas. A `SelecaoPerfil` é a rota `/`, fora do `FormProvider`; `/revisao` está dentro dele.
- **`src/components/Modal/Modal.jsx`** — modal já usado pelo app (ex.: botão "Vendedor" da `BottomBar`). Candidato natural para a mensagem de erro e para a pergunta de confirmação de sobrescrita, mantendo o padrão visual.

### Relação com outros cards e sistemas

- **CHECKLIST_VENDA_FUTURA (`PRDS_E_SPECS/PRD_CHECKLIST_VENDA_FUTURA.md`)** — aquele PRD fechou (Premissa 1) que o PDF da venda futura é só para leitura humana, mas registrou a dúvida sobre "layout estável ou dados embutidos" para o programa que consome o PDF. A técnica decidida aqui — guardar os dados versionados nas propriedades do próprio PDF — é a mesma que serviria àquele caso no futuro. **Fica só como relação**: a venda futura não entra no escopo deste PRD, e este PRD não altera nada do que aquele definiu.
- **Assistente de E-mail (externo a este repositório)** — hoje exige o RAR e um Word ou PDF de checklist, e vai passar a exigir o RAR e dois PDFs. Como esta melhoria não muda o conteúdo visível nem o nome do PDF do Cliente, ela não interfere no que o Assistente de E-mail recebe. Nenhuma mudança naquele sistema faz parte deste PRD.

---

## Arquivos afetados

| Arquivo | Tipo de mudança |
|---|---|
| `src/services/pdf.js` | Passa a gravar, nas propriedades do PDF, uma cópia versionada ("V1") das respostas do Cliente. Nenhuma mudança no que é impresso nem no nome do arquivo |
| `src/screens/SelecaoPerfil/SelecaoPerfil.jsx` | Ganha o botão "Importar PDF do cliente", a escolha do arquivo, a mensagem de erro genérica e a pergunta de confirmação quando houver rascunho do Cliente em andamento |
| `src/screens/SelecaoPerfil/SelecaoPerfil.module.css` | Estilo do novo botão (se não bastar reaproveitar `.btnPerfil` ou uma variação dele) |
| `src/context/FormProvider.jsx` | Ajuste mínimo para receber o estado importado e restaurá-lo pelo caminho que já existe (`normalizarEstadoSalvo` + `RESTORE_STATE`), abrindo direto em `/revisao` e **sem** mostrar o diálogo "Continuar de onde parou?" por cima da importação |
| Arquivo novo (nome a definir no Spec) | Serviço pequeno que lê o arquivo escolhido, procura o bloco escondido, confere a versão e devolve as respostas — ou avisa que não há dados |

Nenhum arquivo de `src/domain/`, do fluxo do Projetista ou de componentes compartilhados é alterado.

---

## O que será adicionado

1. **Dados escondidos no PDF do Cliente:** a cada geração, o PDF do Cliente passa a carregar uma cópia completa das respostas (identificação, ambientes selecionados, perguntas gerais e respostas por ambiente), com uma marca de versão "V1". Fica numa propriedade do arquivo, não no conteúdo impresso.
2. **Botão "Importar PDF do cliente" na `SelecaoPerfil`**, abaixo ou ao lado dos botões "Cliente" e "Projetista", no mesmo padrão visual da tela.
3. **Leitura do arquivo no navegador**, 100% local (nada é enviado para servidor), aceitando apenas o PDF original baixado pelo app.
4. **Confirmação antes de sobrescrever:** se já existir um rascunho do Cliente salvo naquele navegador, aparece uma pergunta (ex.: "Já existe um preenchimento em andamento. Importar este PDF vai substituí-lo. Deseja continuar?"), com opção de cancelar. Cancelando, nada muda — o rascunho continua lá. O texto exato fica para o Spec.
5. **Mensagem genérica de erro:** "PDF não possui dados para importação", para qualquer arquivo sem os dados escondidos ou com dados que não possam ser lidos.
6. **Chegada direta na revisão do Cliente** (`/revisao`), com o formulário inteiro preenchido, score e CCs recalculados como num preenchimento normal, e todos os botões de edição já existentes funcionando. Ao gerar o PDF de novo, sai um PDF corrigido — que, por sua vez, também carrega os dados escondidos e pode ser importado outra vez.

---

## O que será removido

Nada. É uma melhoria aditiva: nenhuma tela, rota, texto, validação ou regra de negócio é excluída.

---

## O que NÃO será tocado

- **Fluxo do Projetista inteiro** — `src/context/FormProviderVendedor.jsx`, `src/domain/schemaVendedor.js`, telas em `src/steps/vendedor/`, `src/services/pdfVendedor.js`. Fora de escopo explícito do card: o PDF do Projetista não ganha dados escondidos e não pode ser importado nesta versão. O Projetista continua usando o "Continuar de onde parou?" do próprio perfil.
- **Conteúdo visível do PDF do Cliente** — capa, resumo executivo, CCs, tabelas de eletros e eletrônicos, fontes, cores, paginação e o nome `Checklist_Cliente_{contrato}_{data}.pdf`.
- **`src/domain/` inteiro** — `scoreEngine.js`, `ccBuilder.js`, `schema.js`, `ambientes.js`, `checklistTextos.js`, `gruposPerguntasVendedor.js`, `schemaVendedor.js`. Score e CCs continuam sendo recalculados a partir das respostas; nada de regra muda.
- **Telas do fluxo do Cliente** (`StepIdentificacao`, `StepAmbientes`, `StepPerguntasGlobais`, `StepPerguntasPorAmbiente`, `StepRevisao`, `StepSucesso`) — reaproveitadas como estão. Os botões de edição da revisão já cobrem a correção.
- **Comportamento atual do diálogo "Continuar de onde parou?"** quando o usuário entra pelo botão "Cliente" (sem importação): continua idêntico.
- **`src/services/cep.js`**, `BottomBar`, `Header`, `FieldGroup`, `Stepper`, `Modal` — reaproveitados sem alteração.
- **`package.json`** — nenhuma dependência nova.
- **Venda Futura** — não entra neste PRD (só citada como relação).
- **Assistente de E-mail** e qualquer outro sistema externo.

---

## Premissas assumidas

1. **Só PDFs gerados depois desta versão podem ser importados.** Os PDFs do Cliente já existentes não têm os dados escondidos e recebem a mensagem genérica. Não há conversão de PDFs antigos.
2. **Só o arquivo original funciona.** PDF reimpresso, "salvo como PDF" de novo, editado em outro programa, escaneado ou fotografado perde os dados escondidos e recebe a mesma mensagem genérica (decisão 3). Aceito pelo Everton.
3. **A leitura não precisa de biblioteca nova** porque o app só precisa ler os PDFs que ele mesmo gerou, nos quais a propriedade fica em texto puro (verificado no jsPDF 2.5.2, sem compressão nem criptografia ligadas no projeto). Se essa condição deixar de valer, ver Risco 3.
4. **A versão "V1" identifica o formato dos dados escondidos.** Se no futuro o formato do formulário do Cliente mudar a ponto de um PDF V1 não poder ser restaurado com segurança, uma nova versão será criada e PDFs V1 passam a receber a mesma mensagem genérica — o usuário não vê a palavra "versão" (decisão 2). Mudanças pequenas (campo novo com valor padrão) continuam sendo absorvidas por `normalizarEstadoSalvo`, como já acontece hoje com rascunhos.
5. **O destino é sempre `/revisao` do Cliente**, independentemente da etapa em que o PDF original foi gerado (um PDF só é gerado a partir da revisão, então o formulário sempre está completo).
6. **Dados pessoais escondidos no PDF não criam exposição nova.** Nome, contrato, telefone e endereço já estão impressos na capa do mesmo PDF; as respostas técnicas também já estão impressas no corpo. Os dados escondidos ficam visíveis apenas para quem abrir as "propriedades do documento" num leitor de PDF, e codificados (não legíveis a olho nu).
7. **Importar não apaga nada sem confirmação.** Sem rascunho salvo, importa direto; com rascunho salvo, só importa após o "sim" (decisão 4). Após importar, o estado importado passa a ser o rascunho salvo normal do Cliente (sobrevive a atualizar a página, como hoje).
8. **O PDF corrigido é gerado pelo fluxo do Cliente**, com o mesmo nome e conteúdo de qualquer PDF do Cliente. A tela de sucesso continua com o texto atual ("Envie o arquivo para seu vendedor projetista…"), mesmo quando quem corrigiu foi o próprio vendedor — aceito como está nesta versão.

---

## Riscos identificados

1. **Diálogo duplicado ou fora de ordem.** O `FormProvider` mostra "Continuar de onde parou?" toda vez que encontra algo salvo ao abrir uma rota do Cliente (`FormProvider.jsx:275-293`). Se a importação simplesmente gravar as respostas no armazenamento e navegar para `/revisao`, esse diálogo apareceria logo depois da importação (redundante) — e o "Não, começar do zero" apagaria justamente o que acabou de ser importado. Mitigação: o Spec define um caminho em que a importação já chega restaurada, sem esse diálogo; coberto pelo CA-03.
2. **Sobrescrita acidental do rascunho do Cliente.** A gravação contínua (`FormProvider.jsx:295-298`) significa que, assim que o estado importado for restaurado, a chave `byarabi_checklist_rascunho` é regravada. Se a pergunta de confirmação não acontecer **antes** de qualquer restauração, o rascunho anterior se perde. Mitigação: a checagem do rascunho e a pergunta acontecem ainda na `SelecaoPerfil`, antes de entrar no fluxo; coberto pelos CA-04 e CA-05.
3. **Leitura depende de a propriedade estar em texto puro.** Hoje está (verificado). Se uma mudança futura em `pdf.js` ligar compressão ou criptografia do PDF, ou se o Spec escolher gravar os dados num bloco de metadados que seja comprimido, a leitura sem biblioteca deixa de funcionar e todo PDF passa a dar "não possui dados". Mitigação: o Spec escolhe um local de gravação que continue em texto puro e registra isso como regra do `pdf.js`; o CA-02 serve de teste de regressão.
4. **Tamanho dos dados escondidos.** Um preenchimento com muitos ambientes, eletros e observações longas gera um bloco grande. Há leitores de PDF antigos que limitam o tamanho de textos em propriedades (na casa de 32 mil caracteres). Isso não afeta a leitura pelo próprio app, mas o Spec deve medir o tamanho num caso grande real e, se necessário, compactar ou dividir.
5. **Acentos e caracteres especiais.** As respostas têm acentos (nomes, endereços, observações). Gravá-las direto como texto numa propriedade do PDF pode corromper caracteres. Mitigação: codificar o conteúdo num formato só com letras e números antes de gravar (o Spec define qual), e testar ida e volta com acentos (CA-01).
6. **PDF de terceiros ou malformado.** O usuário pode escolher qualquer arquivo (PDF do Projetista, PDF de outro sistema, arquivo corrompido, arquivo renomeado para ".pdf", arquivo enorme). A leitura nunca pode travar a tela nem deixar o formulário pela metade: qualquer falha resulta na mensagem genérica e em nenhum estado alterado. Coberto pelos CA-06 a CA-09.
7. **Dados escondidos adulterados.** Alguém poderia editar o bloco escondido à mão. Como não há backend e o PDF corrigido sempre é revisado por uma pessoa antes de seguir, o risco é baixo; mitigação mínima: só aceitar o bloco se ele tiver a marca "V1" e a estrutura esperada, caindo na mensagem genérica caso contrário.
8. **Divergência futura entre Cliente e Projetista.** Esta versão cria um precedente só no lado do Cliente. Quando o Projetista for incluído, a mesma ideia precisará ser replicada em `pdfVendedor.js` e `FormProviderVendedor.jsx`, como já acontece com toda regra compartilhada no projeto (ver CLAUDE.md, "Dois fluxos independentes").

---

## Pontos a definir no Spec (não decididos neste PRD)

1. **Onde exatamente gravar os dados no PDF** — qual propriedade do documento (ou bloco de metadados) e como codificar, respeitando os Riscos 3, 4 e 5.
2. **Como entregar o estado importado ao `FormProvider`** — que hoje está fora do alcance da `SelecaoPerfil` — sem o diálogo "Continuar de onde parou?" no meio (Risco 1), reaproveitando `normalizarEstadoSalvo` e `RESTORE_STATE`. Critério: a forma mais simples de implementar.
3. **Texto exato** do botão, da pergunta de confirmação e onde o botão fica na `SelecaoPerfil`.
4. **Nome e local do novo serviço de leitura** (ex.: ao lado de `pdf.js` em `src/services/`).

---

## Critérios de aceitação

Cada critério é verificável rodando `npm run dev` e navegando manualmente — não há suíte de testes automatizada neste projeto. A validação de compilação continua sendo `npm run build`.

---

### CA-01 — Ida e volta completa (caminho feliz)

**Entrada:** Navegador sem rascunho do Cliente salvo. Pelo botão "Cliente", preencher uma checklist completa com pelo menos dois ambientes de tipos diferentes (ex.: Cozinha com dois eletros e Dormitório com TV), algum CC ativado, e observações com acentos ("Atenção: vão de 150mm"). Gerar o PDF e concluir em "Iniciar novo preenchimento". De volta à tela inicial, clicar em "Importar PDF do cliente" e escolher o PDF que acabou de ser baixado.

**Resultado esperado:** O app abre direto a revisão do Cliente (`/revisao`), sem passar pela identificação e sem mostrar "Continuar de onde parou?". Todos os dados aparecem exatamente como foram preenchidos — identificação, ambientes (com nomes), perguntas gerais, eletros, observações com acentos intactos — e o score global, o score por ambiente e os CCs são os mesmos do PDF original.

---

### CA-02 — PDF do Cliente continua visualmente idêntico

**Entrada:** Gerar um PDF do Cliente antes e depois da implementação, com as mesmas respostas.

**Resultado esperado:** As duas versões têm o mesmo nome de arquivo (`Checklist_Cliente_{contrato}_{data}.pdf`), o mesmo número de páginas e o mesmo conteúdo impresso. A única diferença está nas propriedades internas do arquivo.

---

### CA-03 — Corrigir e gerar de novo

**Entrada:** Após o CA-01, na revisão, clicar em "Editar" de um ambiente, alterar uma resposta que muda o score (ex.: tirar um eletro) e avançar; depois clicar no link de editar a identificação, trocar o telefone e avançar; então gerar o PDF.

**Resultado esperado:** Cada edição volta para a revisão (comportamento atual de edição a partir da revisão). O novo PDF baixado já reflete as duas correções. Importando esse novo PDF, a revisão mostra as respostas corrigidas — ou seja, um PDF corrigido também pode ser importado.

---

### CA-04 — Rascunho em andamento: usuário confirma

**Entrada:** Pelo botão "Cliente", começar outro preenchimento e parar no meio (ex.: na etapa de ambientes). Voltar para a tela inicial, clicar em "Importar PDF do cliente" e escolher um PDF válido.

**Resultado esperado:** Antes de qualquer mudança, aparece uma pergunta avisando que já existe um preenchimento em andamento e que a importação vai substituí-lo. Ao confirmar, o app abre a revisão com os dados do PDF importado. Atualizando a página (F5), os dados importados continuam lá.

---

### CA-05 — Rascunho em andamento: usuário cancela (cenário de erro)

**Entrada:** Mesmo cenário do CA-04, mas escolher "cancelar" na pergunta.

**Resultado esperado:** Nada é importado e o usuário continua na tela inicial. Clicando em "Cliente" em seguida, aparece o "Continuar de onde parou?" e, ao confirmar, o rascunho anterior está exatamente como foi deixado.

---

### CA-06 — PDF gerado antes desta versão (cenário de erro)

**Entrada:** Escolher um PDF do Cliente gerado antes da implementação (sem os dados escondidos).

**Resultado esperado:** Mensagem "PDF não possui dados para importação". O usuário continua na tela inicial e nenhum rascunho existente é alterado. A mensagem não menciona versão.

---

### CA-07 — PDF do Projetista ou de outro sistema (cenário de erro)

**Entrada:** Escolher um `Checklist_Projetista_*.pdf` gerado pelo app, ou um PDF qualquer de outra origem (ex.: um boleto).

**Resultado esperado:** Mesma mensagem genérica do CA-06; nada é alterado.

---

### CA-08 — PDF reimpresso ou fotografado (cenário de erro)

**Entrada:** Abrir um PDF do Cliente válido num leitor de PDF, usar "Imprimir → Salvar como PDF" e importar o arquivo resultante; ou importar uma foto/escaneamento do PDF convertido em PDF.

**Resultado esperado:** Mesma mensagem genérica; nada é alterado. (Comportamento aceito pela decisão 3 — só o arquivo original funciona.)

---

### CA-09 — Arquivo inválido, corrompido ou desistência (cenário de erro)

**Entrada:** (a) Escolher um arquivo que não é PDF renomeado para ".pdf"; (b) escolher um PDF corrompido/truncado; (c) abrir a janela de escolha de arquivo e fechá-la sem escolher nada.

**Resultado esperado:** Em (a) e (b), mensagem genérica, sem travar a tela e sem alterar nada. Em (c), nada acontece — sem mensagem de erro, usuário continua na tela inicial.

---

### CA-10 — Dados escondidos de versão desconhecida (cenário de erro)

**Entrada:** Um PDF cujo bloco escondido tenha marca diferente de "V1" ou estrutura inválida (simulado no teste editando a propriedade do arquivo).

**Resultado esperado:** Mesma mensagem genérica "PDF não possui dados para importação", sem mencionar versão; nada é alterado.

---

### CA-11 — Regressão: fluxo do Cliente sem importação

**Entrada:** Usar o botão "Cliente" normalmente, com e sem rascunho salvo, até gerar o PDF e concluir.

**Resultado esperado:** Tudo se comporta como hoje: diálogo "Continuar de onde parou?" quando há rascunho, mesma sequência de etapas, mesma revisão, mesmo PDF impresso, mesma tela de sucesso.

---

### CA-12 — Regressão: fluxo do Projetista intocado

**Entrada:** Usar o botão "Projetista" até gerar o PDF do Projetista, com e sem rascunho do Projetista salvo; e, em paralelo, ter um rascunho do Projetista salvo ao importar um PDF do Cliente.

**Resultado esperado:** O fluxo do Projetista se comporta exatamente como hoje, o PDF do Projetista não muda, e a importação de um PDF do Cliente não pergunta nem altera nada sobre o rascunho do Projetista (chave `byarabi_checklist_vendedor`).

---

### CA-13 — Build

**Entrada:** Rodar `npm run build`.

**Resultado esperado:** Compila sem erros, e o `package.json` não tem nenhuma dependência nova.
