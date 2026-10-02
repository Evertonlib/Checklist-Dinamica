# PRD — Checklist Venda Futura

**Status:** Aguardando aprovação
**Data:** 2026-10-02
**Projeto:** Checklist Dinâmica — By Arabi Planejados
**Origem:** card Trello #117 "CHECKLIST_VENDA_FUTURA" (lista "Backlog / Ideias", board "Projetos automação"), decisões fechadas pelo Everton em 30/09/2026, 01/10/2026 e 02/10/2026.

---

## Objetivo

Hoje a tela inicial (`SelecaoPerfil`) tem dois botões — "Cliente" e "Projetista" — e o botão "Projetista" leva direto ao fluxo completo do Projetista (identificação, ambientes, perguntas por ambiente, revisão, PDF). Não existe um fluxo para registrar uma **venda futura**: um cliente que compra hoje um móvel que só será encomendado daqui a alguns anos, funcionando como uma carta de crédito. Nesse caso não há ambiente, eletro, pergunta técnica nem score — só os dados cadastrais do cliente, que depois alimentam manualmente outro programa da equipe (capa, planta e vistas do projeto executivo). Esse outro programa **não faz parte** desta checklist e não é tocado por este PRD.

Este PRD cria uma **terceira ramificação dentro do botão "Projetista"**:

1. Ao clicar em "Projetista" na tela inicial, o usuário passa a ver uma **tela de escolha intermediária** com duas opções: **Normal** (fluxo atual do Projetista, sem nenhuma mudança) e **Venda futura** (novo).
2. O fluxo de Venda Futura tem uma única etapa de preenchimento, em três telas: **Identificação → Revisão própria → PDF**.
   - **Identificação:** mesma aparência, campos e validações da identificação do Cliente hoje (`StepIdentificacao.jsx`) — nome, contrato (um só), telefone, CEP com busca automática via ViaCEP, logradouro, número, complemento, bairro, cidade, UF. Diferente do Cliente, essa tela precisa de um botão "Voltar" para a tela de escolha (decisão do Everton em 02/10/2026 — ver "O ajuste mínimo necessário").
   - **Revisão:** tela nova e enxuta, mostrando só os dados cadastrais preenchidos, com um botão para editar a identificação e um botão "Gerar PDF". Não reaproveita a `StepRevisao` do Cliente, que é inteira de score, ambientes e Clientes Cientes (CCs) — conteúdo que não existe nesta venda.
   - **PDF:** um único PDF, só com os dados cadastrais, seguindo exatamente o mesmo padrão de capa dos dois PDFs existentes (título "By Arabi Planejados" + subtítulo do tipo de checklist, aqui "Checklist Venda Futura") e com a mesma data de emissão sem horário — decisão do Everton em 02/10/2026, descartando a proposta inicial do card de incluir horário. Sem ambientes, sem score, sem CCs.
3. Nome do arquivo do PDF: `Checklist_Futura_{contrato}_{data}.pdf`, seguindo o padrão já usado pelos dois PDFs existentes (ver divergência registrada abaixo — a nomenclatura do card estava desatualizada em um dos dois exemplos).
4. Layout da tela de escolha: dois botões grandes no mesmo padrão visual do `.btnPerfil` de `SelecaoPerfil`, cada um com uma linha de apoio abaixo explicando a diferença, e um botão de voltar para a tela inicial (`SelecaoPerfil`) — um link simples para `/` (decisão do Everton em 02/10/2026).

---

## Divergência entre o card e o código medido

O card cita `pdf.js:570` como `Checklist_ByArabi_{contrato}_{data}.pdf`. Medido agora em `src/services/pdf.js:570`:

```
doc.save(`Checklist_Cliente_${contrato}_${dataArquivo}.pdf`)
```

O nome já é `Checklist_Cliente_*`, não `Checklist_ByArabi_*` — foi renomeado pelo commit `cda9fa0` (`fix: aviso do cortineiro vira "vão de aproximadamente 150mm" e PDF do Cliente passa a se chamar Checklist_Cliente_*`), posterior à redação do card. O segundo exemplo do card, `pdfVendedor.js:146` → `Checklist_Projetista_{contrato}_{data}.pdf`, continua correto:

```
doc.save(`Checklist_Projetista_${primeiroContrato}_${dataArquivo}.pdf`)
```

Este PRD usa o padrão medido no código (`Checklist_Cliente_*` e `Checklist_Projetista_*`) como referência, e define o nome do novo arquivo como `Checklist_Futura_{contrato}_{data}.pdf` — consistente com os dois nomes reais hoje em produção, não com o nome desatualizado citado no card.

---

## Relação com o código existente

A aplicação é um SPA React (Vite), `HashRouter`, sem backend, com dois fluxos paralelos hoje — Cliente e Projetista ("Vendedor" internamente) — cada um com seu próprio Context, reducer, chave de `localStorage`, conjunto de rotas e gerador de PDF. Este PRD segue exatamente esse precedente para criar um **terceiro fluxo isolado**, em vez de misturar estado com qualquer um dos dois existentes.

### O que existe hoje (medido no código em 01/10/2026)

- **`src/screens/SelecaoPerfil/SelecaoPerfil.jsx:15-20`** — os dois botões `.btnPerfil` navegam direto: "Cliente" → `/identificacao`, "Projetista" → `/vendedor/identificacao`. Não existe tela intermediária.
- **`src/screens/SelecaoPerfil/SelecaoPerfil.module.css:32-46`** — `.btnPerfil` é o padrão visual citado pelo card para os dois novos botões da tela de escolha: fundo `#1a1a1a`, texto dourado `#c8a84b`, `border-radius: 8px`, `padding: 16px 24px`, `min-height: 52px`.
- **`src/steps/StepIdentificacao/StepIdentificacao.jsx`** — identificação do Cliente. Campos nas linhas 140-199 (nome, contrato, telefone, CEP, logradouro, número, complemento, bairro, cidade, UF); validação em `obterErrosIdentificacao` (linhas 30-47); regex de contrato na linha 10 (`/^(IT|SM|TA|PIN|STA)\d+$/`); busca de CEP em `handleCepBlur` (linhas 69-101), usando `services/cep.js`.
- **`StepIdentificacao.jsx:106-121`** (função `avancar`) — ao avançar, se `state._meta.origemNavegacao === 'revisao'` volta para `/revisao` (fluxo de edição vindo da revisão do Cliente); caso contrário, **sempre** navega para `/ambientes` (linhas 119-120) e grava `_meta.etapaAtual = 'ambientes'`. Este é o ponto de ajuste mínimo necessário descrito abaixo.
- **`StepIdentificacao.jsx:50`** — o componente lê e grava estado via `useFormContext()` (de `src/context/FormContext.js`), ou seja, está acoplado ao Context do **Cliente**, não a um Context genérico.
- **`src/context/FormProvider.jsx`** — Provider do Cliente. `STORAGE_KEY = 'byarabi_checklist_rascunho'` (linha 7). O estado inteiro é persistido em `localStorage` a cada mudança (linhas 295-298: `useEffect` que roda sempre que `state` muda, enquanto `ready === true`). Ao montar, se existir um rascunho salvo, mostra um diálogo "Continuar de onde parou?" (linhas 315-330) antes de liberar a tela.
- **`src/steps/StepRevisao/StepRevisao.jsx`** — revisão do Cliente. Calcula `calcularScore` e `construirCCs` (linhas 23-24), renderiza badges de score por ambiente, cards de CC por nível de risco e avisos (linhas 53-132). Não serve para a Venda Futura, que não tem ambiente nem score.
- **`src/steps/vendedor/StepIdentificacaoVendedor/StepIdentificacaoVendedor.jsx:74-114`** — identificação do Projetista normal: só nome e uma lista de contratos (com "+"/"−"), sem endereço nem telefone. Não serve de base para a Venda Futura, que precisa do endereço (para a ficha cadastral) e usa contrato único, como o Cliente.
- **`src/App.jsx:137-144`** — rotas do Cliente ficam sob `ClienteLayoutRoute` (linhas 70-76), que envolve as telas em `FormProvider` e calcula a numeração "etapa X de Y" (`AppLayoutCliente`, linhas 24-68) a partir da quantidade de ambientes selecionados. Esse layout não serve à Venda Futura, que tem uma etapa de preenchimento fixa e nenhum ambiente — precisa de um layout próprio, sem nenhum Stepper (decisão do Everton em 02/10/2026).
- **`src/App.jsx:146-152`** — mesma estrutura para o Projetista (`VendedorLayoutRoute`/`AppLayoutVendedor`), com `FormProviderVendedor` e rotas sob `/vendedor/*`.
- **`src/context/FormProviderVendedor.jsx:8`** — Provider do Projetista normal, com `STORAGE_KEY = 'byarabi_checklist_vendedor'`, **totalmente isolado** da chave do Cliente. Este é o precedente direto para a Venda Futura ter sua própria chave de `localStorage`, Context e Provider — o projeto já resolveu esse mesmo problema duas vezes (Cliente e Projetista normal) e sempre com Provider e chave próprios.
- **`src/steps/StepSucesso/StepSucesso.jsx:9-12`** e **`src/steps/vendedor/StepSucessoVendedor/StepSucessoVendedor.jsx:9-12`** — ambas as telas de sucesso existentes despacham a limpeza do próprio estado (`RESET_STATE` / `RESET_STATE_VENDEDOR`, que por sua vez remove a chave de `localStorage` correspondente — `FormProvider.jsx:260-263`, `FormProviderVendedor.jsx:184` e segs.) e **depois** navegam para `/` (tela inicial). Esse comportamento foi fixado pelo commit `31e2e7f` ("fix(navegacao): volta à SelecaoPerfil ao iniciar novo preenchimento") — antes, "Iniciar novo preenchimento" pulava a `SelecaoPerfil` e ia direto para a identificação do próprio fluxo.
- **`src/components/BottomBar/BottomBar.jsx:5-9`** — prop `mostrarBotaoVendedor` (default `true`) controla a exibição do botão "Vendedor" (que abre um modal dizendo "consulte seu vendedor projetista", linhas 38-52). As 4 telas do fluxo Projetista normal (`StepIdentificacaoVendedor.jsx:121`, `StepAmbientesVendedor.jsx:80`, `StepPerguntasAmbienteVendedor.jsx:100`, `StepRevisaoVendedor.jsx:121`) já passam `mostrarBotaoVendedor={false}` explicitamente, porque não faz sentido esse botão aparecer para quem já é o Projetista. A Venda Futura, sendo preenchida pelo Projetista, segue o mesmo padrão.
- **`src/services/pdf.js`** e **`src/services/pdfVendedor.js`** — os dois geradores de PDF seguem o mesmo padrão de capa: `jsPDF` + (no caso do Cliente) `jspdf-autotable`; título "By Arabi Planejados" em Times bold 22pt (`pdf.js:112`/`pdfVendedor.js:68`), subtítulo do tipo de checklist em Helvetica 14pt (`pdf.js:116`: "Checklist de Liberação de Projeto"; `pdfVendedor.js:72`: "Checklist do Projetista"), linha divisória dourada, dados de identificação em texto corrido, e uma linha `Data: {data}` com `formatarDataLocal`/`formatarDataArquivo` (funções idênticas duplicadas em ambos os arquivos — `pdf.js:16-25`, `pdfVendedor.js:5-14` — só formatam `dd/mm/aaaa` por extenso e `aaaa-mm-dd` para o nome do arquivo; nenhuma delas inclui hora). O PDF da Venda Futura segue exatamente este mesmo padrão de capa, com o subtítulo "Checklist Venda Futura" e sem nenhum elemento novo — o card propunha incluir horário de emissão, mas o Everton reverteu essa proposta em 02/10/2026 para manter o mesmo padrão dos outros dois geradores (só data, sem hora).

### O que não deve ser tocado em hipótese alguma

- Aparência, campos, validações e comportamento da identificação do Cliente **quando usada pelo próprio fluxo do Cliente** — `StepIdentificacao.jsx`, `StepIdentificacao.module.css`.
- O fluxo completo do Cliente (`/identificacao` → `/sucesso`) e o fluxo completo do Projetista normal (`/vendedor/identificacao` → `/vendedor/sucesso`): nenhuma tela, rota, texto ou regra muda.
- `src/domain/scoreEngine.js`, `src/domain/ccBuilder.js`, `src/domain/checklistTextos.js`, `src/domain/gruposPerguntasVendedor.js` — nenhuma pergunta por ambiente, gatilho de score ou CC é criada, lida ou alterada para a Venda Futura.
- `src/services/pdf.js` e `src/services/pdfVendedor.js` — não recebem nenhuma função nova nem alteração; o PDF da Venda Futura é gerado por um arquivo próprio.
- O programa externo (fora deste repositório) que monta capa, planta e vistas do projeto executivo a partir dos dados cadastrais.
- Qualquer funcionalidade de anexar imagem ou arquivo de projeto ao PDF — não faz parte deste PRD.

---

## O ajuste mínimo necessário em arquivo compartilhado (aceito pelo Everton)

`StepIdentificacao.jsx` é a única peça de UI compartilhada entre o fluxo do Cliente e a Venda Futura. Hoje ela tem três pontos que impedem reaproveitá-la como está:

1. **Duas navegações fixas, não só uma** — `StepIdentificacao.jsx:115` faz `navigate('/revisao')` dentro do caminho de edição (quando `state._meta.origemNavegacao === 'revisao'`, linhas 112-117), e `StepIdentificacao.jsx:120` faz `navigate('/ambientes')` no caminho padrão (linhas 119-120). As duas apontam para rotas do Cliente. Na Venda Futura, **as duas** precisam apontar para a revisão própria da Venda Futura — não só a de :120: se o ajuste parametrizar apenas o destino padrão e deixar o caminho de edição (:115) fixo em `/revisao`, o CA-04 (editar a identificação a partir da revisão da Venda Futura) não funciona, porque o usuário seria desviado para a revisão do Cliente.
2. **Acoplamento ao Context do Cliente** — `StepIdentificacao.jsx:50` usa `useFormContext()`, lendo e gravando diretamente o estado do `FormProvider` do Cliente, cuja chave de `localStorage` é `byarabi_checklist_rascunho` (`FormProvider.jsx:7`).
3. **Ausência de botão "Voltar"** — `StepIdentificacao.jsx:203` passa `semVoltar` ao `BottomBar`. Isso é correto para o Cliente, porque a identificação é a primeira tela do fluxo (não há para onde voltar). Na Venda Futura ela **não** é a primeira tela — existe a tela de escolha antes dela — e o Everton decidiu em 02/10/2026 manter o padrão do restante do app (toda rota que não é a primeira do seu fluxo tem um "Voltar"): a identificação, quando usada pela Venda Futura, precisa de um botão "Voltar" que retorne à tela de escolha, sem alterar `semVoltar` no caminho do Cliente.

O ajuste aceito é **o mínimo necessário para resolver os três pontos acima**, sem alterar aparência, campos ou validações, e sem alterar o comportamento do fluxo do Cliente quando `StepIdentificacao` é usada por ele. A forma exata do ajuste (ex.: tornar o destino, a fonte de estado e a exibição do "Voltar" parametrizáveis por prop, por rota, ou por outro mecanismo) é uma decisão de implementação e fica para o Spec, guiada pelo critério que o Everton deu em 02/10/2026: **a forma mais simples de implementar** que cumpra os três pontos sem tocar no comportamento do Cliente.

### Risco concreto de sobrescrita do rascunho do Cliente — ponto de atenção 1

`FormProvider.jsx:295-298` persiste o estado inteiro em `localStorage` a **cada mudança de estado**, não só ao avançar de etapa:

```
useEffect(() => {
  if (!ready) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}, [state, ready])
```

Se a tela de identificação da Venda Futura for montada de qualquer forma dentro do `FormProvider` do Cliente (por exemplo, reaproveitando a mesma árvore de rotas/provider que hoje envolve `/identificacao`), **cada tecla digitada** nos campos de nome/contrato/endereço da Venda Futura dispararia `SET_IDENTIFICACAO` nesse reducer e seria imediatamente gravada em `byarabi_checklist_rascunho` — sobrescrevendo, campo a campo, um rascunho de Cliente que porventura já estivesse salvo (de um preenchimento anterior, incompleto, da mesma pessoa que opera o app no mesmo navegador). Não existe, hoje, nenhuma trava que impeça dois fluxos diferentes de escrever na mesma chave.

**Decisão do Everton em 02/10/2026 — sem persistência em `localStorage`:** a Venda Futura não precisa gravar progresso. É um preenchimento de uma etapa só; se o Projetista for interrompido no meio, refaz o preenchimento do zero — a perda é aceita e esperada nesse cenário, e isso já remove a necessidade de replicar o diálogo "Continuar de onde parou?" e todo o mecanismo de persistência completo de `FormProvider.jsx` (`confirmarRascunho`/`descartarRascunho`, `FormProvider.jsx:300-313`, que hoje navegam para rotas fixas do Cliente).

**Requisito que permanece (sem decidir a implementação):** mesmo sem persistência própria, a identificação da Venda Futura não pode, em nenhum momento, ler ou gravar estado através do `useFormContext()` do Cliente — nunca na chave `byarabi_checklist_rascunho` nem na chave do Projetista normal (`byarabi_checklist_vendedor`). O Spec decide o mecanismo exato (Context isolado em memória, sem persistência, é suficiente para cumprir a garantia; um terceiro `FormProvider.jsx` completo com `STORAGE_KEY` própria só se mostrar mais simples na prática), seguindo o critério do Everton: **a forma mais simples de implementar**.

### Ponto de atenção 2 — comportamento ao voltar para `SelecaoPerfil` e iniciar novo preenchimento

O padrão já estabelecido no projeto (commit `31e2e7f`, e replicado em `StepSucesso.jsx:9-12` e `StepSucessoVendedor.jsx:9-12`) é: a tela de sucesso de cada fluxo despacha a ação de reset do **próprio** estado (que limpa a **própria** chave de `localStorage`) e só depois navega para `/`. No Cliente e no Projetista normal, isso só limpa o estado quando o usuário **conclui** o fluxo pela tela de sucesso — se sair no meio, o rascunho permanece salvo e o diálogo "Continuar de onde parou?" (padrão de `FormProvider.jsx:315-330`) decide se retoma ou descarta.

A Venda Futura **não replica esse mecanismo**, por decisão do Everton em 02/10/2026 (ver "Risco concreto de sobrescrita", acima): sem persistência em `localStorage`, não há rascunho para retomar nem diálogo a implementar. A tela de sucesso da Venda Futura só precisa resetar o estado em memória (se houver algo a limpar) e navegar para `/`, seguindo a mesma navegação final do padrão do Cliente/Projetista — sem a parte de limpeza de `localStorage`, que não se aplica aqui.

### Ponto de atenção 3 — dependência com o PRD de redesign visual (Design System By Arabi)

Existe `PRDS_E_SPECS/PRD_LAYOUT_DESIGN_SYSTEM.md` (commit `4a2faf3`), com **status "Aguardando aprovação"** e, medido agora, sem nenhum `SPEC_LAYOUT_DESIGN_SYSTEM.md` correspondente — ou seja, **ainda não foi implementado**. Esse PRD é declaradamente só visual (CSS/tokens), sem tocar rotas, textos ou `.jsx` (exceção pontual de um emoji, fora do escopo aqui), e lista exatamente os 19 arquivos CSS que hoje têm cor fixa — entre eles `src/screens/SelecaoPerfil/SelecaoPerfil.module.css` (que define `.btnPerfil`, reaproveitado por este PRD como padrão visual dos dois novos botões da tela de escolha).

Duas implicações diretas para este PRD:

1. **Se a Venda Futura for implementada antes do redesign visual:** os novos botões da tela de escolha, se reaproveitarem literalmente a classe `.btnPerfil` existente (ex.: via o mesmo CSS Module), herdam automaticamente qualquer tokenização futura daquele arquivo — nenhum trabalho extra. Se, em vez disso, a tela de escolha ganhar um CSS Module próprio copiando os valores de `.btnPerfil` (hex fixos `#1a1a1a`/`#c8a84b` em vez de reaproveitar a classe), esse arquivo novo **não está** na lista de 19 arquivos do PRD de redesign e seria esquecido na tokenização, ficando com cor "antiga" depois que o resto do app mudar.
2. **Se o redesign visual for implementado antes da Venda Futura:** a tela de escolha nasce já com os valores/tokens novos do Design System, sem necessidade de qualquer ajuste adicional aqui.

Não há dependência de bloqueio dura entre os dois PRDs — podem ser aprovados e implementados em qualquer ordem. **Decisão do Everton em 02/10/2026:** a tela de escolha reaproveita diretamente a classe `.btnPerfil` existente (opção 1 acima), o que elimina o risco de inconsistência — qualquer tokenização futura daquele arquivo já cobre os novos botões automaticamente.

---

## Arquivos afetados

| Arquivo | Tipo de mudança |
|---|---|
| `src/screens/SelecaoPerfil/SelecaoPerfil.jsx` | O botão "Projetista" deixa de navegar direto para `/vendedor/identificacao` e passa a navegar para a nova tela de escolha |
| `src/steps/StepIdentificacao/StepIdentificacao.jsx` | Ajuste mínimo (destino do "Avançar", fonte de estado e botão "Voltar" exclusivo da Venda Futura), descrito acima — aparência, campos e validações não mudam |
| `src/App.jsx` | Novas rotas para a tela de escolha e para as três telas da Venda Futura, com um layout próprio (sem a numeração "etapa X de Y" dos layouts do Cliente/Projetista) |
| Arquivos novos (nomes exatos a definir no Spec) | Tela de escolha intermediária; Context/Provider/reducer isolados da Venda Futura (chave de `localStorage` própria); tela de Revisão própria; tela de Sucesso própria; gerador de PDF próprio (`services/pdfFutura.js` ou equivalente) |

Nenhum arquivo do fluxo Cliente (além do ajuste mínimo acima) ou do fluxo Projetista normal é alterado. Nenhum arquivo de `src/domain/` é alterado.

---

## O que será adicionado

1. Uma tela de escolha, acessada ao clicar em "Projetista" na `SelecaoPerfil`, com dois botões no padrão visual do `.btnPerfil` — "Normal" e "Venda futura" — cada um com uma linha de apoio explicando a diferença, e um botão de voltar para a `SelecaoPerfil` (link simples para `/`).
2. Um fluxo de Venda Futura com estado isolado tanto do Cliente (`byarabi_checklist_rascunho`) quanto do Projetista normal (`byarabi_checklist_vendedor`) — sem persistência em `localStorage` (decisão do Everton em 02/10/2026: é um preenchimento de etapa única, sem necessidade de retomar rascunho). O Spec escolhe o mecanismo mais simples de implementar que cumpra esse isolamento.
3. Reaproveitamento da tela de identificação do Cliente (mesmos campos, mesma aparência, mesma validação), com destino de navegação, fonte de estado e botão "Voltar" (para a tela de escolha) próprios da Venda Futura, via o ajuste mínimo descrito acima.
4. Uma tela de Revisão própria e enxuta, mostrando apenas os dados cadastrais preenchidos (nome, contrato, telefone, endereço completo), com um link/botão para editar a identificação e um botão "Gerar PDF" — sem nenhum elemento de score, ambiente ou CC.
5. Um gerador de PDF novo e próprio, com capa idêntica ao padrão de "By Arabi Planejados" + subtítulo do tipo de checklist ("Checklist Venda Futura") dos dois PDFs existentes, incluindo apenas a data de emissão (sem horário, mesmo padrão dos outros dois geradores), contendo somente os dados cadastrais.
6. Nome do arquivo gerado: `Checklist_Futura_{contrato}_{data}.pdf`.
7. Uma tela de Sucesso própria, seguindo o padrão das duas existentes (mensagem de confirmação, texto orientando o próximo passo operacional, botão "Iniciar novo preenchimento" que reseta o estado em memória e volta para `/` — sem limpeza de `localStorage`, já que a Venda Futura não persiste estado).

---

## O que será removido

Nada é removido. Esta é uma feature aditiva: nenhuma tela, rota, texto, validação ou regra de negócio existente é excluída. O único arquivo existente que recebe uma modificação de comportamento (não remoção) é `StepIdentificacao.jsx`, pelo ajuste mínimo descrito acima — e mesmo esse ajuste deve preservar 100% do comportamento atual quando o componente é usado pelo fluxo do Cliente.

---

## O que NÃO será tocado

- Aparência, campos, validações e navegação da identificação do Cliente **no fluxo do Cliente** (fora do ajuste mínimo descrito, que não pode alterar esse comportamento).
- Fluxo completo do Cliente: rotas, telas, `scoreEngine.js`, `ccBuilder.js`, `services/pdf.js`.
- Fluxo completo do Projetista normal: rotas, telas (`StepIdentificacaoVendedor.jsx`, `StepAmbientesVendedor.jsx`, `StepPerguntasAmbienteVendedor.jsx`, `StepRevisaoVendedor.jsx`, `StepSucessoVendedor.jsx`), `services/pdfVendedor.js`.
- `src/domain/` inteiro (`scoreEngine.js`, `ccBuilder.js`, `schema.js`, `schemaVendedor.js`, `ambientes.js`, `checklistTextos.js`, `gruposPerguntasVendedor.js`).
- `src/services/cep.js` — a Venda Futura reaproveita a função existente de busca de CEP, sem alterá-la.
- `src/components/BottomBar/BottomBar.jsx`, `Header.jsx`, `FieldGroup.jsx`, `Modal.jsx`, `Stepper.jsx` — reaproveitados como estão; se a Venda Futura precisar de uma variação de `BottomBar` (ex.: `mostrarBotaoVendedor={false}`, seguindo o padrão já usado nas 4 telas do Projetista normal), é uso de prop já existente, não alteração do componente.
- O programa externo (fora deste repositório) que monta capa, planta e vistas do executivo a partir do PDF.
- Qualquer anexo de imagem ou arquivo de projeto ao PDF.
- `package.json` — nenhuma dependência nova é necessária; a Venda Futura reaproveita `jsPDF` (já usado pelos outros dois geradores).

---

## Premissas assumidas

1. **O PDF é só para leitura humana.** A equipe que opera o outro programa (capa/planta/vistas) consulta o PDF e digita os dados manualmente — não há leitura automática nem necessidade de layout estável para máquina ou dados embutidos (diferente, por exemplo, de um cenário de importação automática). Decisão fechada pelo Everton em 01/10/2026.
2. **O PDF segue exatamente o mesmo padrão de capa dos dois PDFs existentes** (título "By Arabi Planejados", subtítulo "Checklist Venda Futura", data de emissão sem horário) — sem nenhum elemento novo fora do padrão já estabelecido. Decisão do Everton em 02/10/2026, revertendo a proposta inicial do card (que pedia horário de emissão).
3. O contrato da Venda Futura segue o mesmo formato e a mesma validação já usada na identificação do Cliente e do Projetista normal (prefixos `IT`, `SM`, `TA`, `PIN`, `STA` seguidos de números), e é único (não há lista de múltiplos contratos como no Projetista normal).
4. A Venda Futura, sendo preenchida pelo Projetista (não pelo cliente final), não precisa do botão "Vendedor" do `BottomBar` — segue o mesmo padrão já aplicado às 4 telas do fluxo Projetista normal (`mostrarBotaoVendedor={false}`).
5. O layout das telas da Venda Futura não tem nenhum Stepper "etapa X de Y" — decisão do Everton em 02/10/2026 (diferente dos fluxos Cliente/Projetista, que dependem da quantidade de ambientes).
6. O gerador de PDF da Venda Futura é um arquivo novo e próprio (não uma função a mais dentro de `pdf.js` ou `pdfVendedor.js`), seguindo o padrão de "cada perfil tem seu próprio PDF" já estabelecido entre Cliente e Projetista normal.
7. **A Venda Futura não persiste estado em `localStorage`.** Decisão do Everton em 02/10/2026, pela simplicidade: por ser um preenchimento de etapa única, se o Projetista for interrompido no meio, refaz o preenchimento do início — isso elimina a necessidade do diálogo "Continuar de onde parou?" e de replicar o mecanismo completo de persistência de `FormProvider.jsx`.

---

## Riscos identificados

1. **Sobrescrita do rascunho do Cliente** se a identificação da Venda Futura não estiver completamente isolada do Context do Cliente (`FormProvider`/`byarabi_checklist_rascunho`) — risco concreto e medido em `FormProvider.jsx:295-298`, detalhado na seção "Ponto de atenção 1" acima. Esse risco existe independentemente de a Venda Futura persistir ou não seu próprio estado, porque vem do acoplamento de `StepIdentificacao.jsx` ao `useFormContext()` do Cliente. Mitigação: garantir, antes de aprovar o Spec, que a implementação escolhida nunca lê nem grava estado da Venda Futura através do Context do Cliente.
2. **Duplicação de lógica de identificação.** Reaproveitar `StepIdentificacao.jsx` via ajuste mínimo evita duplicar campos/validação, mas qualquer ajuste futuro nas regras de validação do contrato/CEP/telefone (hoje só no Cliente) precisa continuar valendo também para a Venda Futura — e o inverso: o ajuste feito para viabilizar a Venda Futura não pode, por engano, mudar o comportamento percebido pelo Cliente. Mitigação: critério de aceitação de regressão explícito (ver CA-08).
3. **Inconsistência de nome de arquivo do PDF** se o padrão `Checklist_Futura_*` não seguir exatamente a mesma função de formatação de data já usada nos outros dois geradores (`formatarDataArquivo`, hoje duplicada em `pdf.js:20-25` e `pdfVendedor.js:9-14`) — risco baixo, mas relevante porque essas duas funções já estão duplicadas sem reaproveitamento entre si; um terceiro gerador copiando a mesma função pela terceira vez é consistente com o padrão atual do projeto (ainda que não seja o ideal de reaproveitamento), e não é escopo deste PRD unificar isso.

---

## Pontos a definir no Spec (não decididos neste PRD)

1. **Mecanismo exato de isolamento de estado da Venda Futura** — sem persistência em `localStorage` (ver Premissa 7), o Spec escolhe a forma mais simples de implementar que cumpra o requisito da seção "Ponto de atenção 1" (nunca ler/gravar através do Context do Cliente ou do Projetista normal). Não precisa necessariamente replicar um `FormProvider.jsx` completo.
2. **Forma exata do ajuste mínimo em `StepIdentificacao.jsx`** — por prop, por leitura de rota, ou outro mecanismo — para parametrizar o destino do "Avançar", a fonte de estado e a exibição do botão "Voltar" (ver "O ajuste mínimo necessário"), sem alterar comportamento, aparência ou validação para o Cliente. Critério: a forma mais simples de implementar.
3. **Arquivo CSS exato da nova tela de escolha** — reaproveitar diretamente a classe `.btnPerfil` existente (decisão do Everton em 02/10/2026, ver "Ponto de atenção 3"); o Spec registra como isso é feito na prática (import do mesmo CSS Module, ou equivalente).
4. **Nome exato dos arquivos/pastas novos** (ex.: nome do Context, do serviço de PDF) — este PRD não define nomenclatura de implementação.

---

## Critérios de aceitação

Cada critério é verificável rodando `npm run dev` e navegando manualmente — não há suíte de testes automatizada neste projeto. A validação de compilação continua sendo `npm run build`.

---

### CA-01 — Nova tela de escolha aparece ao clicar em "Projetista"

**Cenário:** Abrir o app (`npm run dev`), na `SelecaoPerfil`, clicar no botão "Projetista".

**Esperado:** Em vez de ir direto para a identificação do Projetista (`/vendedor/identificacao`), aparece uma tela com dois botões grandes — "Normal" e "Venda futura" — cada um com uma linha de texto de apoio abaixo, e um botão para voltar à tela inicial.

---

### CA-02 — Fluxo normal do Projetista continua idêntico

**Cenário:** Na nova tela de escolha, clicar em "Normal".

**Esperado:** O usuário é levado à identificação do Projetista (`/vendedor/identificacao`) e todo o fluxo a partir daí (ambientes, perguntas por grupo, revisão, PDF `Checklist_Projetista_*`, sucesso) se comporta exatamente como hoje, sem nenhuma diferença perceptível em tela, texto ou PDF gerado.

---

### CA-03 — Fluxo de Venda Futura completo, do início ao PDF

**Cenário:** Na nova tela de escolha, clicar em "Venda futura". Preencher nome, contrato (ex.: `IT09999`), telefone, CEP válido (confirmar que o endereço é preenchido automaticamente via ViaCEP), e avançar. Na tela de revisão, confirmar que aparecem apenas os dados cadastrais digitados (nenhum ambiente, score ou CC). Clicar em "Gerar PDF".

**Esperado:** Um arquivo é baixado com o nome `Checklist_Futura_IT09999_{data-de-hoje}.pdf` (formato `aaaa-mm-dd`). Abrindo o PDF: aparece o mesmo padrão de capa dos outros dois PDFs — título "By Arabi Planejados" e subtítulo "Checklist Venda Futura" — com a data de emissão (sem horário) e os dados cadastrais preenchidos (nome, contrato, telefone, endereço completo) — sem nenhuma menção a ambiente, score, eletro ou CC. Em seguida, uma tela de sucesso é exibida.

---

### CA-04 — Editar identificação a partir da revisão da Venda Futura

**Cenário:** No fluxo da Venda Futura, chegar até a tela de revisão e clicar no botão/link de editar a identificação. Alterar um campo (ex.: telefone) e avançar novamente.

**Esperado:** O usuário retorna à tela de revisão da Venda Futura (não à revisão do Cliente, que não existe neste fluxo) com o campo alterado refletido nos dados exibidos.

---

### CA-05 — Botão "Voltar" na identificação da Venda Futura

**Cenário:** Na tela de escolha, clicar em "Venda futura". Na tela de identificação (reaproveitada do Cliente), clicar no botão "Voltar".

**Esperado:** O usuário retorna à tela de escolha ("Normal" / "Venda futura"), não à `SelecaoPerfil` nem a nenhuma outra tela. Repetir o mesmo fluxo pelo caminho do Cliente (`/identificacao`) confirma que ali **não** aparece nenhum botão "Voltar" novo — o comportamento do Cliente continua sem esse botão, como hoje.

---

### CA-06 — CEP não encontrado ou falha na consulta (cenário de erro)

**Cenário:** No campo de CEP da identificação da Venda Futura, digitar um CEP inexistente, ou simular indisponibilidade da API ViaCEP (ex.: desconectar a rede no momento da busca).

**Esperado:** Mesma mensagem já usada hoje na identificação do Cliente — "CEP não encontrado — você pode preencher o endereço manualmente." ou "Não foi possível consultar o CEP agora — preencha o endereço manualmente." — permitindo preencher o endereço manualmente e seguir o preenchimento sem bloqueio.

---

### CA-07 — Campo obrigatório ou contrato em formato inválido (cenário de erro)

**Cenário:** Na identificação da Venda Futura, deixar o nome em branco, ou digitar um contrato que não começa com `IT`, `SM`, `TA`, `PIN` ou `STA`, e tentar avançar.

**Esperado:** A tela não avança; aparece a mensagem de erro correspondente ao lado do campo, no mesmo padrão visual já usado na identificação do Cliente hoje, e o foco rola até o primeiro campo com erro.

---

### CA-08 — Regressão: rascunho do Cliente não é afetado pela Venda Futura

**Cenário:** Iniciar um preenchimento do Cliente, preencher a identificação (nome, contrato, endereço) e avançar até "Ambientes" sem concluir. Sem limpar o navegador, voltar à tela inicial — como não há botão que leve direto de "Ambientes" à tela inicial (o "Voltar" dali leva só para `/identificacao`, `StepAmbientes.jsx:23-26`), use o botão voltar do navegador até chegar à `SelecaoPerfil`, ou edite a URL para `#/` diretamente. Entre em "Projetista" → "Venda futura", preencha uma identificação **diferente** (outro nome, outro contrato) e gere o PDF da Venda Futura até a tela de sucesso. Em seguida, volte à tela inicial (pela própria tela de sucesso, que já navega para `/`) e clique em "Cliente" novamente.

**Esperado:** O diálogo "Continuar de onde parou?" do Cliente aparece oferecendo retomar o rascunho **original** do Cliente (com o nome/contrato preenchidos na primeira etapa deste cenário) — não os dados digitados na Venda Futura. Nenhum dado da Venda Futura aparece no fluxo do Cliente, e nenhum dado do rascunho do Cliente foi sobrescrito ou perdido.

---

### CA-09 — Regressão: rascunho do Projetista normal não é afetado pela Venda Futura

**Cenário:** Repetir o CA-08, mas com o fluxo do Projetista normal no lugar do Cliente: iniciar identificação do Projetista, avançar até "Ambientes" sem concluir, usar o botão voltar do navegador (ou editar a URL para `#/`) para chegar à `SelecaoPerfil`, ir para Venda Futura e concluir, depois voltar ao Projetista normal.

**Esperado:** Mesmo resultado do CA-08: o rascunho do Projetista normal (`byarabi_checklist_vendedor`) continua intacto e é oferecido para retomada sem interferência da Venda Futura.

---

### CA-10 — "Iniciar novo preenchimento" da Venda Futura volta para a tela inicial

**Cenário:** Concluir o fluxo da Venda Futura até a tela de sucesso e clicar em "Iniciar novo preenchimento".

**Esperado:** O usuário é levado à `SelecaoPerfil` (tela inicial com os botões "Cliente"/"Projetista"), não direto para a identificação de nenhum fluxo — mesmo padrão já usado pelas telas de sucesso do Cliente e do Projetista normal desde o commit `31e2e7f`. Reabrindo "Projetista" → "Venda futura" depois disso, o formulário aparece vazio — sem persistência de estado (decisão do Everton em 02/10/2026), um formulário novo é sempre o ponto de partida.

---

### CA-11 — `npm run build` continua passando

**Cenário:** Rodar `npm run build` após a implementação.

**Esperado:** O build termina sem erro, gerando `dist/` normalmente — igual ao comportamento de hoje, incluindo os dois fluxos existentes e o novo fluxo de Venda Futura.
