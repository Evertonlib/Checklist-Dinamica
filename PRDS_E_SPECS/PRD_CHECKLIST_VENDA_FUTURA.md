# PRD — Checklist Venda Futura

**Status:** Aguardando aprovação
**Data:** 2026-10-01
**Projeto:** Checklist Dinâmica — By Arabi Planejados
**Origem:** card Trello #117 "CHECKLIST_VENDA_FUTURA" (lista "Backlog / Ideias", board "Projetos automação"), decisões fechadas pelo Everton em 30/09/2026 e 01/10/2026.

---

## Objetivo

Hoje a tela inicial (`SelecaoPerfil`) tem dois botões — "Cliente" e "Projetista" — e o botão "Projetista" leva direto ao fluxo completo do Projetista (identificação, ambientes, perguntas por ambiente, revisão, PDF). Não existe um fluxo para registrar uma **venda futura**: um cliente que compra hoje um móvel que só será encomendado daqui a alguns anos, funcionando como uma carta de crédito. Nesse caso não há ambiente, eletro, pergunta técnica nem score — só os dados cadastrais do cliente, que depois alimentam manualmente outro programa da equipe (capa, planta e vistas do projeto executivo). Esse outro programa **não faz parte** desta checklist e não é tocado por este PRD.

Este PRD cria uma **terceira ramificação dentro do botão "Projetista"**:

1. Ao clicar em "Projetista" na tela inicial, o usuário passa a ver uma **tela de escolha intermediária** com duas opções: **Checklist normal** (fluxo atual do Projetista, sem nenhuma mudança) e **Venda futura** (novo).
2. O fluxo de Venda Futura tem uma única etapa de preenchimento, em três telas: **Identificação → Revisão própria → PDF**.
   - **Identificação:** mesma aparência, campos e validações da identificação do Cliente hoje (`StepIdentificacao.jsx`) — nome, contrato (um só), telefone, CEP com busca automática via ViaCEP, logradouro, número, complemento, bairro, cidade, UF.
   - **Revisão:** tela nova e enxuta, mostrando só os dados cadastrais preenchidos, com um botão para editar a identificação e um botão "Gerar PDF". Não reaproveita a `StepRevisao` do Cliente, que é inteira de score, ambientes e Clientes Cientes (CCs) — conteúdo que não existe nesta venda.
   - **PDF:** um único PDF, só com os dados cadastrais, identificado como "VENDA FUTURA" com data e hora de emissão. Sem ambientes, sem score, sem CCs.
3. Nome do arquivo do PDF: `Checklist_Futura_{contrato}_{data}.pdf`, seguindo o padrão já usado pelos dois PDFs existentes (ver divergência registrada abaixo — a nomenclatura do card estava desatualizada em um dos dois exemplos).
4. Layout da tela de escolha: dois botões grandes no mesmo padrão visual do `.btnPerfil` de `SelecaoPerfil`, cada um com uma linha de apoio abaixo explicando a diferença, e um botão de voltar para a tela inicial (`SelecaoPerfil`).

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
- **`src/App.jsx:137-144`** — rotas do Cliente ficam sob `ClienteLayoutRoute` (linhas 70-76), que envolve as telas em `FormProvider` e calcula a numeração "etapa X de Y" (`AppLayoutCliente`, linhas 24-68) a partir da quantidade de ambientes selecionados. Esse layout não serve à Venda Futura, que tem uma etapa de preenchimento fixa e nenhum ambiente — precisa de um layout próprio, sem Stepper de "etapa X de Y" (ou com um Stepper fixo em 1 etapa, a decidir no Spec).
- **`src/App.jsx:146-152`** — mesma estrutura para o Projetista (`VendedorLayoutRoute`/`AppLayoutVendedor`), com `FormProviderVendedor` e rotas sob `/vendedor/*`.
- **`src/context/FormProviderVendedor.jsx:8`** — Provider do Projetista normal, com `STORAGE_KEY = 'byarabi_checklist_vendedor'`, **totalmente isolado** da chave do Cliente. Este é o precedente direto para a Venda Futura ter sua própria chave de `localStorage`, Context e Provider — o projeto já resolveu esse mesmo problema duas vezes (Cliente e Projetista normal) e sempre com Provider e chave próprios.
- **`src/steps/StepSucesso/StepSucesso.jsx:9-12`** e **`src/steps/vendedor/StepSucessoVendedor/StepSucessoVendedor.jsx:9-12`** — ambas as telas de sucesso existentes despacham a limpeza do próprio estado (`RESET_STATE` / `RESET_STATE_VENDEDOR`, que por sua vez remove a chave de `localStorage` correspondente — `FormProvider.jsx:260-263`, `FormProviderVendedor.jsx:184` e segs.) e **depois** navegam para `/` (tela inicial). Esse comportamento foi fixado pelo commit `31e2e7f` ("fix(navegacao): volta à SelecaoPerfil ao iniciar novo preenchimento") — antes, "Iniciar novo preenchimento" pulava a `SelecaoPerfil` e ia direto para a identificação do próprio fluxo.
- **`src/components/BottomBar/BottomBar.jsx:5-9`** — prop `mostrarBotaoVendedor` (default `true`) controla a exibição do botão "Vendedor" (que abre um modal dizendo "consulte seu vendedor projetista", linhas 38-52). As 4 telas do fluxo Projetista normal (`StepIdentificacaoVendedor.jsx:121`, `StepAmbientesVendedor.jsx:80`, `StepPerguntasAmbienteVendedor.jsx:100`, `StepRevisaoVendedor.jsx:121`) já passam `mostrarBotaoVendedor={false}` explicitamente, porque não faz sentido esse botão aparecer para quem já é o Projetista. A Venda Futura, sendo preenchida pelo Projetista, segue o mesmo padrão.
- **`src/services/pdf.js`** e **`src/services/pdfVendedor.js`** — os dois geradores de PDF seguem o mesmo padrão de capa: `jsPDF` + (no caso do Cliente) `jspdf-autotable`; título "By Arabi Planejados" em Times bold 22pt (`pdf.js:112`/`pdfVendedor.js:68`), subtítulo do tipo de checklist em Helvetica 14pt (`pdf.js:116`: "Checklist de Liberação de Projeto"; `pdfVendedor.js:72`: "Checklist do Projetista"), linha divisória dourada, dados de identificação em texto corrido, e uma linha `Data: {data}` com `formatarDataLocal`/`formatarDataArquivo` (funções idênticas duplicadas em ambos os arquivos — `pdf.js:16-25`, `pdfVendedor.js:5-14` — só formatam `dd/mm/aaaa` por extenso e `aaaa-mm-dd` para o nome do arquivo; nenhuma delas inclui hora). Nenhum dos dois PDFs hoje imprime horário de emissão — a exigência do card de "data e hora de emissão" no PDF da Venda Futura é um elemento novo, sem precedente direto a copiar, só a estrutura geral de capa.

### O que não deve ser tocado em hipótese alguma

- Aparência, campos, validações e comportamento da identificação do Cliente **quando usada pelo próprio fluxo do Cliente** — `StepIdentificacao.jsx`, `StepIdentificacao.module.css`.
- O fluxo completo do Cliente (`/identificacao` → `/sucesso`) e o fluxo completo do Projetista normal (`/vendedor/identificacao` → `/vendedor/sucesso`): nenhuma tela, rota, texto ou regra muda.
- `src/domain/scoreEngine.js`, `src/domain/ccBuilder.js`, `src/domain/checklistTextos.js`, `src/domain/gruposPerguntasVendedor.js` — nenhuma pergunta por ambiente, gatilho de score ou CC é criada, lida ou alterada para a Venda Futura.
- `src/services/pdf.js` e `src/services/pdfVendedor.js` — não recebem nenhuma função nova nem alteração; o PDF da Venda Futura é gerado por um arquivo próprio.
- O programa externo (fora deste repositório) que monta capa, planta e vistas do projeto executivo a partir dos dados cadastrais.
- Qualquer funcionalidade de anexar imagem ou arquivo de projeto ao PDF — não faz parte deste PRD.

---

## O ajuste mínimo necessário em arquivo compartilhado (aceito pelo Everton)

`StepIdentificacao.jsx` é a única peça de UI compartilhada entre o fluxo do Cliente e a Venda Futura. Hoje ela tem dois acoplamentos que impedem reaproveitá-la como está:

1. **Duas navegações fixas, não só uma** — `StepIdentificacao.jsx:115` faz `navigate('/revisao')` dentro do caminho de edição (quando `state._meta.origemNavegacao === 'revisao'`, linhas 112-117), e `StepIdentificacao.jsx:120` faz `navigate('/ambientes')` no caminho padrão (linhas 119-120). As duas apontam para rotas do Cliente. Na Venda Futura, **as duas** precisam apontar para a revisão própria da Venda Futura — não só a de :120: se o ajuste parametrizar apenas o destino padrão e deixar o caminho de edição (:115) fixo em `/revisao`, o CA-04 (editar a identificação a partir da revisão da Venda Futura) não funciona, porque o usuário seria desviado para a revisão do Cliente.
2. **Acoplamento ao Context do Cliente** — `StepIdentificacao.jsx:50` usa `useFormContext()`, lendo e gravando diretamente o estado do `FormProvider` do Cliente, cuja chave de `localStorage` é `byarabi_checklist_rascunho` (`FormProvider.jsx:7`).

O ajuste aceito é **o mínimo necessário para resolver os dois pontos acima**, sem alterar aparência, campos ou validações, e sem alterar o comportamento do fluxo do Cliente quando `StepIdentificacao` é usada por ele. A forma exata do ajuste (ex.: tornar o destino e/ou a fonte de estado parametrizáveis por prop, por rota, ou por outro mecanismo) é uma decisão de implementação e fica para o Spec — este PRD só registra o requisito e o risco.

### Risco concreto de sobrescrita do rascunho do Cliente — ponto de atenção 1

`FormProvider.jsx:295-298` persiste o estado inteiro em `localStorage` a **cada mudança de estado**, não só ao avançar de etapa:

```
useEffect(() => {
  if (!ready) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}, [state, ready])
```

Se a tela de identificação da Venda Futura for montada de qualquer forma dentro do `FormProvider` do Cliente (por exemplo, reaproveitando a mesma árvore de rotas/provider que hoje envolve `/identificacao`), **cada tecla digitada** nos campos de nome/contrato/endereço da Venda Futura dispararia `SET_IDENTIFICACAO` nesse reducer e seria imediatamente gravada em `byarabi_checklist_rascunho` — sobrescrevendo, campo a campo, um rascunho de Cliente que porventura já estivesse salvo (de um preenchimento anterior, incompleto, da mesma pessoa que opera o app no mesmo navegador). Não existe, hoje, nenhuma trava que impeça dois fluxos diferentes de escrever na mesma chave.

Além da gravação em si, o diálogo de retomada de rascunho desse mesmo Provider também navega para rotas fixas do Cliente: `confirmarRascunho` (`FormProvider.jsx:300-306`) chama `navigate(normalizarRotaEtapa(estadoRestaurado._meta.etapaAtual), { replace: true })`, e `normalizarRotaEtapa` (`FormProvider.jsx:19-22`) cai em `/identificacao` por padrão quando `etapaAtual` está vazio; `descartarRascunho` (`FormProvider.jsx:308-313`) navega direto para `navigate('/identificacao', { replace: true })`. Ou seja, **trocar só a `STORAGE_KEY` de um `FormProvider` clonado não basta**: sem ajustar também essas duas funções, o diálogo de retomada de rascunho da Venda Futura (se implementado) levaria de volta para rotas do Cliente, não para as rotas da Venda Futura.

**Requisito (sem decidir a implementação):** o estado da Venda Futura precisa ser gravado em uma chave de `localStorage` própria, nunca na chave do Cliente (`byarabi_checklist_rascunho`) nem na do Projetista normal (`byarabi_checklist_vendedor`). O precedente do próprio projeto para isso já existe duas vezes (`FormProvider.jsx` vs. `FormProviderVendedor.jsx`, cada um com sua `STORAGE_KEY`) — o Spec deve decidir se a Venda Futura ganha um terceiro Provider completo (seguindo o mesmo padrão) ou outro mecanismo equivalente de isolamento, desde que a garantia de não escrever na chave do Cliente seja mantida mesmo reaproveitando o componente visual de `StepIdentificacao`, e desde que toda navegação interna desse Provider — inclusive o diálogo de retomada de rascunho, se implementado (`confirmarRascunho`/`descartarRascunho`, `FormProvider.jsx:300-313`) — aponte para rotas da Venda Futura, nunca para `/identificacao` ou outra rota do Cliente.

### Ponto de atenção 2 — comportamento ao voltar para `SelecaoPerfil` e iniciar novo preenchimento

O padrão já estabelecido no projeto (commit `31e2e7f`, e replicado em `StepSucesso.jsx:9-12` e `StepSucessoVendedor.jsx:9-12`) é: a tela de sucesso de cada fluxo despacha a ação de reset do **próprio** estado (que limpa a **própria** chave de `localStorage`) e só depois navega para `/`. Importante: isso só limpa o estado quando o usuário **conclui** o fluxo pela tela de sucesso — se o usuário sair no meio (por exemplo, fechar a aba ou clicar em algum link de volta antes de gerar o PDF), o rascunho daquele fluxo permanece salvo em sua própria chave, e ao reabrir aquele fluxo específico o diálogo "Continuar de onde parou?" (padrão de `FormProvider.jsx:315-330`) é quem decide se retoma ou descarta.

A Venda Futura deve seguir exatamente esse mesmo padrão: uma tela de sucesso própria que limpa o estado/`localStorage` próprio da Venda Futura antes de voltar para `/`, e (se tiver diálogo de retomada de rascunho, a decidir no Spec) o mesmo mecanismo de "continuar ou começar do zero" ao reabrir o fluxo com um rascunho pendente. Isso não é um ponto em aberto sobre *se* existe reset — é sobre confirmar, no Spec, se a Venda Futura também implementa o diálogo de retomada (replicando o padrão do Cliente/Projetista) ou se, dado ser um fluxo de uma etapa só, opta por não ter esse diálogo. Ver seção "Pontos a definir no Spec".

### Ponto de atenção 3 — dependência com o PRD de redesign visual (Design System By Arabi)

Existe `PRDS_E_SPECS/PRD_LAYOUT_DESIGN_SYSTEM.md` (commit `4a2faf3`), com **status "Aguardando aprovação"** e, medido agora, sem nenhum `SPEC_LAYOUT_DESIGN_SYSTEM.md` correspondente — ou seja, **ainda não foi implementado**. Esse PRD é declaradamente só visual (CSS/tokens), sem tocar rotas, textos ou `.jsx` (exceção pontual de um emoji, fora do escopo aqui), e lista exatamente os 19 arquivos CSS que hoje têm cor fixa — entre eles `src/screens/SelecaoPerfil/SelecaoPerfil.module.css` (que define `.btnPerfil`, reaproveitado por este PRD como padrão visual dos dois novos botões da tela de escolha).

Duas implicações diretas para este PRD:

1. **Se a Venda Futura for implementada antes do redesign visual:** os novos botões da tela de escolha, se reaproveitarem literalmente a classe `.btnPerfil` existente (ex.: via o mesmo CSS Module), herdam automaticamente qualquer tokenização futura daquele arquivo — nenhum trabalho extra. Se, em vez disso, a tela de escolha ganhar um CSS Module próprio copiando os valores de `.btnPerfil` (hex fixos `#1a1a1a`/`#c8a84b` em vez de reaproveitar a classe), esse arquivo novo **não está** na lista de 19 arquivos do PRD de redesign e seria esquecido na tokenização, ficando com cor "antiga" depois que o resto do app mudar. Este é um risco de inconsistência visual a evitar — ver "Riscos identificados".
2. **Se o redesign visual for implementado antes da Venda Futura:** a tela de escolha nasce já com os valores/tokens novos do Design System, sem necessidade de qualquer ajuste adicional aqui.

Não há dependência de bloqueio dura entre os dois PRDs — podem ser aprovados e implementados em qualquer ordem — mas o Spec da Venda Futura deve registrar explicitamente qual arquivo CSS a tela de escolha usa, para que, na ordem 1 acima, o arquivo novo seja adicionado à lista de arquivos tokenizáveis do redesign quando ele for implementado.

---

## Arquivos afetados

| Arquivo | Tipo de mudança |
|---|---|
| `src/screens/SelecaoPerfil/SelecaoPerfil.jsx` | O botão "Projetista" deixa de navegar direto para `/vendedor/identificacao` e passa a navegar para a nova tela de escolha |
| `src/steps/StepIdentificacao/StepIdentificacao.jsx` | Ajuste mínimo (destino do "Avançar" e fonte de estado), descrito acima — aparência, campos e validações não mudam |
| `src/App.jsx` | Novas rotas para a tela de escolha e para as três telas da Venda Futura, com um layout próprio (sem a numeração "etapa X de Y" dos layouts do Cliente/Projetista) |
| Arquivos novos (nomes exatos a definir no Spec) | Tela de escolha intermediária; Context/Provider/reducer isolados da Venda Futura (chave de `localStorage` própria); tela de Revisão própria; tela de Sucesso própria; gerador de PDF próprio (`services/pdfFutura.js` ou equivalente) |

Nenhum arquivo do fluxo Cliente (além do ajuste mínimo acima) ou do fluxo Projetista normal é alterado. Nenhum arquivo de `src/domain/` é alterado.

---

## O que será adicionado

1. Uma tela de escolha, acessada ao clicar em "Projetista" na `SelecaoPerfil`, com dois botões no padrão visual do `.btnPerfil` — "Checklist normal" e "Venda futura" — cada um com uma linha de apoio explicando a diferença, e um botão de voltar para a `SelecaoPerfil`.
2. Um fluxo de Venda Futura com estado, Context, Provider e chave de `localStorage` **isolados** tanto do Cliente (`byarabi_checklist_rascunho`) quanto do Projetista normal (`byarabi_checklist_vendedor`) — seguindo o precedente arquitetural já usado duas vezes no projeto.
3. Reaproveitamento da tela de identificação do Cliente (mesmos campos, mesma aparência, mesma validação), com destino de navegação e fonte de estado próprios da Venda Futura via o ajuste mínimo descrito acima.
4. Uma tela de Revisão própria e enxuta, mostrando apenas os dados cadastrais preenchidos (nome, contrato, telefone, endereço completo), com um link/botão para editar a identificação e um botão "Gerar PDF" — sem nenhum elemento de score, ambiente ou CC.
5. Um gerador de PDF novo e próprio, com capa no mesmo padrão visual de "By Arabi Planejados" dos dois PDFs existentes, identificado como "VENDA FUTURA", incluindo data **e hora** de emissão (elemento novo — nenhum dos dois geradores existentes imprime hora hoje), contendo somente os dados cadastrais.
6. Nome do arquivo gerado: `Checklist_Futura_{contrato}_{data}.pdf`.
7. Uma tela de Sucesso própria, seguindo o padrão das duas existentes (mensagem de confirmação, texto orientando o próximo passo operacional, botão "Iniciar novo preenchimento" que limpa o estado/`localStorage` da Venda Futura e volta para `/`).

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
2. **O PDF tem cabeçalho "VENDA FUTURA" com data e hora de emissão.** Decisão fechada pelo Everton em 01/10/2026 — item novo em relação ao padrão dos dois PDFs existentes, que só imprimem data.
3. O contrato da Venda Futura segue o mesmo formato e a mesma validação já usada na identificação do Cliente e do Projetista normal (prefixos `IT`, `SM`, `TA`, `PIN`, `STA` seguidos de números), e é único (não há lista de múltiplos contratos como no Projetista normal).
4. A Venda Futura, sendo preenchida pelo Projetista (não pelo cliente final), não precisa do botão "Vendedor" do `BottomBar` — segue o mesmo padrão já aplicado às 4 telas do fluxo Projetista normal (`mostrarBotaoVendedor={false}`).
5. O layout das telas da Venda Futura não precisa de Stepper "etapa X de Y" dinâmico como os fluxos Cliente/Projetista (que dependem da quantidade de ambientes) — por ter uma etapa de preenchimento fixa, pode ter Stepper simplificado, fixo, ou nenhum Stepper; a escolha exata fica para o Spec.
6. O gerador de PDF da Venda Futura é um arquivo novo e próprio (não uma função a mais dentro de `pdf.js` ou `pdfVendedor.js`), seguindo o padrão de "cada perfil tem seu próprio PDF" já estabelecido entre Cliente e Projetista normal.

---

## Riscos identificados

1. **Sobrescrita do rascunho do Cliente** se a identificação da Venda Futura não estiver completamente isolada do `FormProvider`/`byarabi_checklist_rascunho` do Cliente — risco concreto e medido em `FormProvider.jsx:295-298`, detalhado na seção "Ponto de atenção 1" acima. Mitigação: garantir, antes de aprovar o Spec, que a implementação escolhida nunca grava estado da Venda Futura na chave do Cliente.
2. **Duplicação de lógica de identificação.** Reaproveitar `StepIdentificacao.jsx` via ajuste mínimo evita duplicar campos/validação, mas qualquer ajuste futuro nas regras de validação do contrato/CEP/telefone (hoje só no Cliente) precisa continuar valendo também para a Venda Futura — e o inverso: o ajuste feito para viabilizar a Venda Futura não pode, por engano, mudar o comportamento percebido pelo Cliente. Mitigação: critério de aceitação de regressão explícito (ver CA-07).
3. **Esquecimento do arquivo CSS da nova tela de escolha na tokenização futura do Design System**, se esse PRD for implementado antes do redesign visual e a tela de escolha não reaproveitar diretamente a classe `.btnPerfil` existente — detalhado na seção "Ponto de atenção 3". Mitigação: o Spec deve registrar explicitamente o arquivo CSS usado pela nova tela, para inclusão manual na lista de arquivos do PRD de redesign quando ele for implementado.
4. **Inconsistência de nome de arquivo do PDF** se o padrão `Checklist_Futura_*` não seguir exatamente a mesma função de formatação de data já usada nos outros dois geradores (`formatarDataArquivo`, hoje duplicada em `pdf.js:20-25` e `pdfVendedor.js:9-14`) — risco baixo, mas relevante porque essas duas funções já estão duplicadas sem reaproveitamento entre si; um terceiro gerador copiando a mesma função pela terceira vez é consistente com o padrão atual do projeto (ainda que não seja o ideal de reaproveitamento), e não é escopo deste PRD unificar isso.
5. **Diálogo de retomada de rascunho não decidido.** Se o Spec optar por não implementar o diálogo "Continuar de onde parou?" para a Venda Futura (por ser um fluxo de uma etapa só), um usuário que saia no meio do preenchimento e volte depois começará do zero sem aviso — comportamento diferente do Cliente/Projetista normal. Risco baixo (poucos dados, re-digitar é rápido), mas deve ser uma decisão explícita, não uma omissão.
6. **Ausência de botão "Voltar" na identificação reaproveitada.** `StepIdentificacao.jsx:203` passa `semVoltar` ao `BottomBar` — a identificação do Cliente não tem botão "Voltar" hoje — e o `Header` (`Header.jsx`) não tem nenhuma navegação própria (nenhuma ocorrência de `navigate`/`Link` no arquivo). Reaproveitando `StepIdentificacao` sem mudar a aparência, como este PRD exige, o usuário da Venda Futura fica sem um botão explícito para voltar à tela de escolha a partir da identificação — só o botão voltar do navegador resolveria, a menos que o Spec decida adicionar um botão só para esse fluxo (ver "Pontos a definir no Spec", item 8).

---

## Pontos a definir no Spec (não decididos neste PRD)

1. **Mecanismo exato de isolamento de estado da Venda Futura** — terceiro Provider completo (replicando `FormProvider.jsx`/`FormProviderVendedor.jsx`) ou outro mecanismo, desde que cumpra o requisito da seção "Ponto de atenção 1" — incluindo adaptar as rotas fixas de `confirmarRascunho`/`descartarRascunho` (`FormProvider.jsx:300-313`), que hoje apontam para `/identificacao` do Cliente.
2. **Forma exata do ajuste mínimo em `StepIdentificacao.jsx`** — por prop, por leitura de rota, ou outro mecanismo — para parametrizar o destino do "Avançar" e a fonte de estado sem alterar comportamento, aparência ou validação para o Cliente.
3. **Se a Venda Futura implementa o diálogo "Continuar de onde parou?"** ao reabrir o fluxo com um rascunho pendente, replicando o padrão de `FormProvider.jsx:315-330` — e, se sim, garantindo que `confirmarRascunho`/`descartarRascunho` (`FormProvider.jsx:300-313`) sejam adaptados para navegar para rotas da Venda Futura, não para `/identificacao` do Cliente (ver "Ponto de atenção 1") — ou se opta por sempre começar do zero (ver risco 5, acima).
4. **Comportamento do botão "voltar" da nova tela de escolha intermediária** — se é um link simples para `/` ou se usa o padrão `BottomBar`/`semVoltar` de alguma forma; e confirmação de que a prop `mostrarBotaoVendedor` do `BottomBar`, quando esse componente for reaproveitado nas telas da Venda Futura, segue `false` (mesmo padrão das 4 telas do Projetista normal).
5. **Stepper (ou ausência dele)** nas telas da Venda Futura, dado que o layout atual de "etapa X de Y" (`App.jsx:24-68` e `78-121`) depende de contagem de ambientes, inexistente aqui.
6. **Arquivo CSS exato da nova tela de escolha** (reaproveitar `.btnPerfil` existente vs. CSS Module próprio) — decisão com impacto direto no risco 3 acima.
7. **Nome exato dos arquivos/pastas novos** (ex.: nome do Context, do Provider, do serviço de PDF) — este PRD não define nomenclatura de implementação.
8. **Como o usuário volta da identificação da Venda Futura para a tela de escolha.** `StepIdentificacao.jsx:203` passa `semVoltar` ao `BottomBar` (sem botão "Voltar"), e o `Header` (`Header.jsx`) não tem nenhuma navegação própria. Reaproveitar `StepIdentificacao` "sem mudar a aparência", como este PRD exige, deixa a Venda Futura sem um caminho explícito de volta à tela de escolha a partir da identificação — só o botão voltar do navegador resolveria isso hoje. O Spec decide: aceitar a navegação só pelo botão voltar do navegador, ou incluir um botão "Voltar" como parte do ajuste mínimo, mas **somente** na tela da Venda Futura, sem alterar `semVoltar` no caminho do Cliente. Decisão do Everton, não deste PRD.

---

## Critérios de aceitação

Cada critério é verificável rodando `npm run dev` e navegando manualmente — não há suíte de testes automatizada neste projeto. A validação de compilação continua sendo `npm run build`.

---

### CA-01 — Nova tela de escolha aparece ao clicar em "Projetista"

**Cenário:** Abrir o app (`npm run dev`), na `SelecaoPerfil`, clicar no botão "Projetista".

**Esperado:** Em vez de ir direto para a identificação do Projetista (`/vendedor/identificacao`), aparece uma tela com dois botões grandes — "Checklist normal" e "Venda futura" — cada um com uma linha de texto de apoio abaixo, e um botão para voltar à tela inicial.

---

### CA-02 — Checklist normal continua idêntico

**Cenário:** Na nova tela de escolha, clicar em "Checklist normal".

**Esperado:** O usuário é levado à identificação do Projetista (`/vendedor/identificacao`) e todo o fluxo a partir daí (ambientes, perguntas por grupo, revisão, PDF `Checklist_Projetista_*`, sucesso) se comporta exatamente como hoje, sem nenhuma diferença perceptível em tela, texto ou PDF gerado.

---

### CA-03 — Fluxo de Venda Futura completo, do início ao PDF

**Cenário:** Na nova tela de escolha, clicar em "Venda futura". Preencher nome, contrato (ex.: `IT09999`), telefone, CEP válido (confirmar que o endereço é preenchido automaticamente via ViaCEP), e avançar. Na tela de revisão, confirmar que aparecem apenas os dados cadastrais digitados (nenhum ambiente, score ou CC). Clicar em "Gerar PDF".

**Esperado:** Um arquivo é baixado com o nome `Checklist_Futura_IT09999_{data-de-hoje}.pdf` (formato `aaaa-mm-dd`). Abrindo o PDF: aparece "VENDA FUTURA" em destaque, junto com data e horário de emissão, e os dados cadastrais preenchidos (nome, contrato, telefone, endereço completo) — sem nenhuma menção a ambiente, score, eletro ou CC. Em seguida, uma tela de sucesso é exibida.

---

### CA-04 — Editar identificação a partir da revisão da Venda Futura

**Cenário:** No fluxo da Venda Futura, chegar até a tela de revisão e clicar no botão/link de editar a identificação. Alterar um campo (ex.: telefone) e avançar novamente.

**Esperado:** O usuário retorna à tela de revisão da Venda Futura (não à revisão do Cliente, que não existe neste fluxo) com o campo alterado refletido nos dados exibidos.

---

### CA-05 — CEP não encontrado ou falha na consulta (cenário de erro)

**Cenário:** No campo de CEP da identificação da Venda Futura, digitar um CEP inexistente, ou simular indisponibilidade da API ViaCEP (ex.: desconectar a rede no momento da busca).

**Esperado:** Mesma mensagem já usada hoje na identificação do Cliente — "CEP não encontrado — você pode preencher o endereço manualmente." ou "Não foi possível consultar o CEP agora — preencha o endereço manualmente." — permitindo preencher o endereço manualmente e seguir o preenchimento sem bloqueio.

---

### CA-06 — Campo obrigatório ou contrato em formato inválido (cenário de erro)

**Cenário:** Na identificação da Venda Futura, deixar o nome em branco, ou digitar um contrato que não começa com `IT`, `SM`, `TA`, `PIN` ou `STA`, e tentar avançar.

**Esperado:** A tela não avança; aparece a mensagem de erro correspondente ao lado do campo, no mesmo padrão visual já usado na identificação do Cliente hoje, e o foco rola até o primeiro campo com erro.

---

### CA-07 — Regressão: rascunho do Cliente não é afetado pela Venda Futura

**Cenário:** Iniciar um preenchimento do Cliente, preencher a identificação (nome, contrato, endereço) e avançar até "Ambientes" sem concluir. Sem limpar o navegador, voltar à tela inicial — como não há botão que leve direto de "Ambientes" à tela inicial (o "Voltar" dali leva só para `/identificacao`, `StepAmbientes.jsx:23-26`), use o botão voltar do navegador até chegar à `SelecaoPerfil`, ou edite a URL para `#/` diretamente. Entre em "Projetista" → "Venda futura", preencha uma identificação **diferente** (outro nome, outro contrato) e gere o PDF da Venda Futura até a tela de sucesso. Em seguida, volte à tela inicial (pela própria tela de sucesso, que já navega para `/`) e clique em "Cliente" novamente.

**Esperado:** O diálogo "Continuar de onde parou?" do Cliente aparece oferecendo retomar o rascunho **original** do Cliente (com o nome/contrato preenchidos na primeira etapa deste cenário) — não os dados digitados na Venda Futura. Nenhum dado da Venda Futura aparece no fluxo do Cliente, e nenhum dado do rascunho do Cliente foi sobrescrito ou perdido.

---

### CA-08 — Regressão: rascunho do Projetista normal não é afetado pela Venda Futura

**Cenário:** Repetir o CA-07, mas com o fluxo do Projetista normal no lugar do Cliente: iniciar identificação do Projetista, avançar até "Ambientes" sem concluir, usar o botão voltar do navegador (ou editar a URL para `#/`) para chegar à `SelecaoPerfil`, ir para Venda Futura e concluir, depois voltar ao Projetista normal.

**Esperado:** Mesmo resultado do CA-07: o rascunho do Projetista normal (`byarabi_checklist_vendedor`) continua intacto e é oferecido para retomada sem interferência da Venda Futura.

---

### CA-09 — "Iniciar novo preenchimento" da Venda Futura volta para a tela inicial

**Cenário:** Concluir o fluxo da Venda Futura até a tela de sucesso e clicar em "Iniciar novo preenchimento".

**Esperado:** O usuário é levado à `SelecaoPerfil` (tela inicial com os botões "Cliente"/"Projetista"), não direto para a identificação de nenhum fluxo — mesmo padrão já usado pelas telas de sucesso do Cliente e do Projetista normal desde o commit `31e2e7f`. Reabrindo "Projetista" → "Venda futura" depois disso, o formulário aparece vazio (sem os dados do preenchimento anterior).

---

### CA-10 — `npm run build` continua passando

**Cenário:** Rodar `npm run build` após a implementação.

**Esperado:** O build termina sem erro, gerando `dist/` normalmente — igual ao comportamento de hoje, incluindo os dois fluxos existentes e o novo fluxo de Venda Futura.
