# SPEC — Checklist Venda Futura

**Status:** Aprovado (Everton, 22/10/2026)
**PRD de origem:** `PRDS_E_SPECS/PRD_CHECKLIST_VENDA_FUTURA.md` (aprovado, já corrigido: Context isolado em memória, sem `localStorage`; CA-12 com `npm test`)
**Critério de decisão (Everton, 02/10/2026):** a forma mais simples de implementar.

---

## 1. Observações da leitura do código (código prevalece sobre o PRD)

Os arquivos listados pelo PRD foram lidos. A estrutura bate com o PRD (linhas de `StepIdentificacao.jsx`, `App.jsx`, `SelecaoPerfil.jsx` conferem). Diferenças e fatos relevantes:

1. **`mostrarBotaoVendedor` também precisa de prop em `StepIdentificacao`.** O PRD lista três pontos de ajuste (destino, fonte de estado, "Voltar"), mas a Premissa 4 exige `mostrarBotaoVendedor={false}` na Venda Futura. Hoje `StepIdentificacao.jsx:202-207` não passa essa prop (usa o default `true`). Logo o ajuste tem um quarto item, mínimo e do mesmo tipo.
2. **A fonte de estado não precisa de prop.** `StepIdentificacao` usa `useFormContext()`, que apenas lê o objeto `FormContext` (`src/context/FormContext.js`, um `createContext` puro). Quem decide o valor é o `Provider` mais próximo na árvore. Um provider novo da Venda Futura, que fornece o **mesmo objeto `FormContext`**, faz a tela ler e gravar no estado da Venda Futura sem alterar o hook. Veja a decisão 2.1 e o ponto a confirmar na seção 8.
3. **O "Voltar" da identificação não é a primeira tela do fluxo na Venda Futura** (`BottomBar` recebe `semVoltar` fixo em `StepIdentificacao.jsx:203`). Basta tornar `semVoltar` condicional a uma prop.
4. **A mensagem do modal "Vendedor" do `BottomBar` fala em "progresso salvo"** (`BottomBar.jsx:40-44`). Isso reforça `mostrarBotaoVendedor={false}` na Venda Futura, que não persiste nada.
5. **Reducers existentes tratam `SET_IDENTIFICACAO` e `SET_META`** (`FormProvider.jsx:59` e `:265`) com o formato `{ type, campo, valor }`. O reducer novo deve aceitar exatamente essas duas ações, porque `StepIdentificacao` as despacha.
6. **Os testes (`testes/`, `node --test`) não importam nenhum `.jsx`** e `package.json` não tem jsdom nem testing-library. Isso pesa na avaliação da seção 6.

---

## 2. Decisões dos "Pontos a definir no Spec"

### 2.1 Ponto 1 — Mecanismo de isolamento de estado

Criar `src/context/FormProviderFutura.jsx`: um provider com `useReducer`, **só em memória** (sem `localStorage`, sem diálogo de rascunho, sem `useNavigate`). Ele fornece `{ state, dispatch }` pelo mesmo `FormContext` já existente (`FormContext.js`, que **não é alterado**).

- Não se cria `FormContextFutura.js` nem hook novo: criar um segundo Context obrigaria a trocar o hook dentro de `StepIdentificacao` (prop de fonte de estado, mais complexa).
- **Por que isso isola:** as rotas da Venda Futura ficam num layout próprio (`FuturaLayoutRoute`), irmão de `ClienteLayoutRoute` e `VendedorLayoutRoute`. Nunca estão dentro de `FormProvider` do Cliente. O `useFormContext()` dentro delas resolve para o provider da Venda Futura. Nenhum `dispatch` chega ao `FormProvider` do Cliente, então `byarabi_checklist_rascunho` e `byarabi_checklist_vendedor` nunca são tocados.
- Estado: `{ identificacao: { nome, contrato, cep, logradouro, numero, complemento, bairro, cidade, uf, telefone }, _meta: { origemNavegacao: null } }`. Os 10 campos de `identificacao` são os mesmos de `schema.js`, declarados dentro do provider (`src/domain/` não é tocado).
- Ações do reducer: `SET_IDENTIFICACAO` (`campo`, `valor`), `SET_META` (`campo`, `valor`) e `RESET_STATE_FUTURA` (volta ao estado inicial). Qualquer outra ação retorna o estado sem mudança.

### 2.2 Ponto 2 — Forma do ajuste mínimo em `StepIdentificacao.jsx`

**Props com default, sem ler rota e sem Context novo.** O componente passa a receber quatro props opcionais. Os defaults reproduzem o comportamento atual do Cliente, então `<StepIdentificacao />` (rota `/identificacao`) fica idêntico.

| Prop | Default (Cliente) | Uso na Venda Futura |
|---|---|---|
| `rotaAvancar` | `'/ambientes'` | `'/futura/revisao'` |
| `rotaRevisao` | `'/revisao'` | `'/futura/revisao'` |
| `rotaVoltar` | `undefined` (sem botão "Voltar") | `'/projetista'` |
| `mostrarBotaoVendedor` | `true` | `false` |

Efeito em cada ponto do componente:

- `avancar`, caminho de edição (`:115`): `navigate('/revisao')` passa a `navigate(rotaRevisao)`.
- `avancar`, caminho padrão (`:120`): `navigate('/ambientes')` passa a `navigate(rotaAvancar)`. O `SET_META etapaAtual` das linhas 113 e 119 continua sendo despachado sem mudança. O reducer da Venda Futura o aceita e o guarda sem uso.
- `BottomBar` (`:202-207`): `semVoltar={!rotaVoltar}`, `onVoltar={() => navigate(rotaVoltar)}` e `mostrarBotaoVendedor={mostrarBotaoVendedor}`.
- Nada mais muda: campos, validações, CEP, rótulos e CSS ficam intactos. `StepIdentificacao.module.css` não é tocado.
- O `avancarLabel` ("Salvar e voltar ao resumo") continua dependendo de `_meta.origemNavegacao === 'revisao'`. A revisão da Venda Futura grava esse valor ao editar (seção 3.5).
- Em `App.jsx` as rotas da Venda Futura passam as props direto no `element`, sem componente wrapper.

### 2.3 Ponto 3 — CSS da tela de escolha

Reaproveitar diretamente `.btnPerfil` importando `../SelecaoPerfil/SelecaoPerfil.module.css` na nova tela. Dela vêm `pagina`, `titulo`, `subtitulo`, `botoes` e `btnPerfil`. Qualquer tokenização futura daquele arquivo (PRD do Design System) cobre os novos botões.

Falta só estilo para a linha de apoio sob cada botão e para o link de voltar. Para não introduzir cor fixa em arquivo novo (que ficaria fora dos 19 arquivos do PRD de redesign), cria-se `EscolhaProjetista.module.css` **sem nenhum valor de cor**, só margem e tamanho de fonte. A cor é herdada.

As telas de Revisão e Sucesso da Venda Futura importam os CSS Modules já existentes de `StepRevisaoVendedor` e `StepSucessoVendedor` (mesmas classes que essas telas usam hoje). Assim não nasce CSS novo com hex fixo, e as telas ficam visualmente iguais às do Projetista.

### 2.4 Ponto 4 — Nomes dos arquivos e rotas novos

| Arquivo | Conteúdo |
|---|---|
| `src/context/FormProviderFutura.jsx` | Provider em memória (2.1) |
| `src/screens/EscolhaProjetista/EscolhaProjetista.jsx` | Tela de escolha "Normal" / "Venda futura" |
| `src/screens/EscolhaProjetista/EscolhaProjetista.module.css` | Só margem e fonte, sem cor |
| `src/steps/futura/StepRevisaoFutura/StepRevisaoFutura.jsx` | Revisão enxuta |
| `src/steps/futura/StepSucessoFutura/StepSucessoFutura.jsx` | Sucesso |
| `src/services/pdfFutura.js` | Função `gerarPdfFutura(state)` |

Rotas (`HashRouter`):

| Rota | Tela | Layout |
|---|---|---|
| `/projetista` | `EscolhaProjetista` | Nenhum provider (irmã de `/`) |
| `/futura/identificacao` | `StepIdentificacao` com props da 2.2 | `FuturaLayoutRoute` |
| `/futura/revisao` | `StepRevisaoFutura` | `FuturaLayoutRoute` |
| `/futura/sucesso` | `StepSucessoFutura` | `FuturaLayoutRoute` |

`FuturaLayoutRoute` (em `App.jsx`) = `FormProviderFutura` + um layout com `Header` e `Outlet`, **sem `Stepper`**. Ele faz `window.scrollTo(0, 0)` quando muda a rota, como os outros dois layouts. Como `/projetista` fica fora do provider, voltar da identificação para a escolha desmonta o provider. O formulário então recomeça vazio, o que é coerente com "sem persistência" (PRD, Premissa 7).

---

## 3. Especificação por arquivo

### 3.1 `src/screens/SelecaoPerfil/SelecaoPerfil.jsx` (alterado)

O `onClick` do botão "Projetista" passa de `navigate('/vendedor/identificacao')` para `navigate('/projetista')`. O botão "Cliente" não muda.

### 3.2 `src/screens/EscolhaProjetista/EscolhaProjetista.jsx` (novo)

- Usa `Header` e as classes de `SelecaoPerfil.module.css` (2.3).
- Título e subtítulo no padrão da `SelecaoPerfil` (texto exato fica a critério da implementação, por exemplo "Projetista" e "Qual tipo de checklist?").
- Dois botões `.btnPerfil`, cada um com uma linha de apoio abaixo:
  - "Normal" navega para `/vendedor/identificacao`. Apoio sugerido: "Checklist completo com ambientes e perguntas técnicas".
  - "Venda futura" navega para `/futura/identificacao`. Apoio sugerido: "Só dados cadastrais do cliente, sem ambientes".
- Um `Link` "← Voltar" para `/`.

### 3.3 `src/context/FormProviderFutura.jsx` (novo)

Conforme 2.1. Exporta `FormProviderFutura({ children })`, que usa `FormContext.Provider` com `value={{ state, dispatch }}`. Não usa `useEffect` de persistência e não lê nem escreve `localStorage`.

### 3.4 `src/steps/StepIdentificacao/StepIdentificacao.jsx` (alterado)

Conforme 2.2. Alteração mínima (assinatura da função, duas chamadas `navigate` e a `BottomBar`).

### 3.5 `src/steps/futura/StepRevisaoFutura/StepRevisaoFutura.jsx` (novo)

- Lê `state` com `useFormContext()`, que aqui resolve para o provider da Venda Futura.
- Mostra numa seção "Dados cadastrais": nome, contrato, telefone e endereço completo (logradouro, número, complemento se houver, bairro, cidade/UF, CEP). Usa as classes `secao`, `linhaResumo` e `titulo` do CSS de `StepRevisaoVendedor`. Não mostra score, ambiente nem CC.
- `BottomBar` com:
  - `voltarLabel="Editar identificação"`. Ao clicar: `dispatch SET_META origemNavegacao='revisao'` e depois `navigate('/futura/identificacao')`.
  - `avancarLabel` com a mesma lógica do `StepRevisaoVendedor`: 'Gerar PDF', 'Gerando PDF…' ou 'Tentar novamente'.
  - `avancarDisabled` enquanto gera.
  - `mostrarBotaoVendedor={false}`.
- Ao gerar: `await gerarPdfFutura(state)`, depois `navigate('/futura/sucesso')`. Em falha, mostra "Não foi possível gerar o PDF agora — tente novamente." (mesma mensagem da revisão do Projetista).
- Como `StepIdentificacao` zera `origemNavegacao` ao salvar na edição (`:114`), o rótulo volta a "Avançar" depois.

### 3.6 `src/steps/futura/StepSucessoFutura/StepSucessoFutura.jsx` (novo)

- Mesma estrutura de `StepSucessoVendedor`: ícone, título "PDF gerado com sucesso!", texto e botão "Iniciar novo preenchimento".
- O botão despacha `RESET_STATE_FUTURA` e depois `navigate('/')` (CA-10; sem limpeza de `localStorage`).
- Texto de orientação (aprovado pelo Everton): "Encaminhe este arquivo ao e-mail da liberação com cópia ao seu gerente". O PRD pede um texto "orientando o próximo passo operacional" sem fixar a redação.

### 3.7 `src/services/pdfFutura.js` (novo)

Exporta `async function gerarPdfFutura(state)` com `jsPDF` (`import jsPDF from 'jspdf'`), no mesmo padrão de `pdfVendedor.js`:

- `formatarDataLocal` e `formatarDataArquivo` copiadas (terceira cópia, aceita pelo PRD, Risco 3). Nenhuma inclui hora.
- Capa: "By Arabi Planejados" em Times bold 22pt centralizado na altura 40; subtítulo "Checklist Venda Futura" em Helvetica 14pt na altura 52; linha dourada na altura 58 (`setDrawColor(180, 150, 80)`).
- Corpo em texto corrido, Helvetica 12pt, margem esquerda 20: `Cliente`, `Contrato`, `Data` (data de emissão sem hora), e abaixo `Telefone` e `Endereço` (logradouro, número, complemento se houver, bairro, cidade/UF, CEP). Linhas longas passam por `splitTextToSize`. Nada de ambiente, score, eletro ou CC.
- Arquivo: `doc.save(\`Checklist_Futura_${contrato || 'SEMCONTRATO'}_${dataArquivo}.pdf\`)`. O fallback `SEMCONTRATO` segue `pdfVendedor.js:145`; na prática o contrato é sempre válido, porque a identificação bloqueia o avanço sem ele.
- Não altera `pdf.js` nem `pdfVendedor.js`. Sem dependência nova.

### 3.8 `src/App.jsx` (alterado)

- Imports de `FormProviderFutura`, `EscolhaProjetista`, `StepRevisaoFutura` e `StepSucessoFutura`.
- `AppLayoutFutura`: `Header` + `Outlet` + `useEffect` de `scrollTo(0, 0)` por `location.pathname`, sem `Stepper`.
- `FuturaLayoutRoute`: `FormProviderFutura` envolvendo `AppLayoutFutura`.
- Novas rotas conforme a tabela da 2.4. A rota de identificação da Venda Futura é:
  `<StepIdentificacao rotaAvancar="/futura/revisao" rotaRevisao="/futura/revisao" rotaVoltar="/projetista" mostrarBotaoVendedor={false} />`
- Rotas existentes sem nenhuma mudança.

---

## 4. Arquivos que NÃO mudam

`FormProvider.jsx`, `FormProviderVendedor.jsx`, `FormContext.js`, `FormContextVendedor.js`, `StepIdentificacao.module.css`, `pdf.js`, `pdfVendedor.js`, `cep.js`, `BottomBar`, `Header`, `FieldGroup`, `Modal`, `Stepper`, todo `src/domain/`, e `package.json`. Em `testes/`, só mudam os três arquivos da seção 6, item 4; os testes existentes não são alterados.

---

## 5. Cobertura dos critérios de aceitação

| CA | Onde é atendido |
|---|---|
| CA-01, CA-02 | 3.1 e 3.2 (o "Normal" leva a `/vendedor/identificacao`; o fluxo do Projetista não é alterado) |
| CA-03 | 3.2, 3.4, 3.5, 3.6 e 3.7 |
| CA-04 | `rotaRevisao` da 2.2 e botão "Editar identificação" da 3.5 |
| CA-05 | `rotaVoltar` da 2.2; sem a prop, o Cliente segue com `semVoltar` |
| CA-06, CA-07 | Reuso do componente sem mudança de lógica |
| CA-08, CA-09 | Isolamento da 2.1 (rotas fora dos providers do Cliente e do Projetista; sem escrita em `localStorage`) |
| CA-10 | 3.6 |
| CA-11, CA-12 | Tasks 4 e 10 do plano |

---

## 6. Avaliação: o ajuste em `StepIdentificacao.jsx` merece testes novos em `testes/`?

**Recomendação: não criar casos de teste novos para esse ajuste.**

1. A suíte (`node --test`) só exercita módulos de lógica pura e os PDFs empacotados via esbuild. Nenhum teste importa `.jsx` (verificado por busca em `testes/`). Testar o componente exigiria jsdom e testing-library, ou um empacotador com mock de React Router. Isso pede dependência nova em `package.json`, que o PRD veda (seção "O que NÃO será tocado").
2. O ajuste é só de props com default e de dois `navigate`. Não há lógica extraída que dê para testar isoladamente. A validação (`obterErrosIdentificacao`) não é alterada e não é exportada.
3. A garantia de "Cliente não regride" vem de três coisas: os defaults reproduzem o comportamento atual; `npm test` verde (CA-12) prova que o domínio e os dois PDFs não mudaram; e a conferência manual do CA-05 (sem "Voltar" no Cliente) e do CA-08 fecha o resto.
4. **Decisão do Everton (22/10/2026): o `pdfFutura.js` ganha testes.** O PRD é anterior à suíte e não previu isso. A mudança é só em `testes/` e aditiva: uma linha de `export` em `testes/auxiliares/entrada_pdf.js`, uma linha `futura` em `testes/auxiliares/carregar_pdf.js` e um arquivo novo `testes/Q_pdf_futura.test.js`, no padrão de `V_pdf_projetista.test.js`. Nenhuma dependência nova. Casos (Task 4 do plano):
   1. O nome do arquivo sai `Checklist_Futura_{contrato}_{data}.pdf`.
   2. A capa tem "By Arabi Planejados" e "Checklist Venda Futura".
   3. O corpo traz nome, contrato, telefone e endereço, e a data não tem hora.
   4. Com complemento vazio, o endereço sai sem o complemento.
   5. O PDF não contém ambiente, score, eletro nem CC.

   Cuidado: o pacote dos PDFs é montado de uma vez, então erro de sintaxe no `pdfFutura.js` derruba também os testes do Cliente e do Projetista. Por isso a Task 4 vem logo depois da Task 3.

---

## 7. Riscos e cuidados de implementação

1. O `FuturaLayoutRoute` nunca pode ser aninhado dentro de `ClienteLayoutRoute` nem de `VendedorLayoutRoute` (é o que garante o isolamento).
2. As rotas da Venda Futura usam o prefixo `/futura/`, para não colidir com `/identificacao` e `/revisao` do Cliente.
3. A rota `/projetista` não usa `/vendedor`, porque `vendedor` é um layout com provider que carregaria o diálogo de rascunho do Projetista.
4. Ao implementar, conferir que o reducer da Venda Futura aceita `SET_META` com qualquer `campo`, porque `StepIdentificacao` despacha `etapaAtual` e `origemNavegacao`.

---

## 8. Ponto a confirmar na aprovação

O PRD diz que a identificação "não pode ler ou gravar estado através do `useFormContext()` do Cliente". Este Spec mantém a chamada ao hook `useFormContext()` dentro de `StepIdentificacao`, porque o hook só lê o `FormContext` e o valor vem do provider da Venda Futura. O que o PRD proíbe, o estado do `FormProvider` do Cliente, nunca é alcançado. Se o Everton preferir um Context com nome próprio (`FormContextFutura` + hook), é preciso uma prop a mais em `StepIdentificacao` para trocar o hook. Fica mais complexo, por isso não foi adotado.

---

## Plano de Execução

- [ ] Task 1 — Criar `src/context/FormProviderFutura.jsx` (provider em memória, `FormContext` existente, ações `SET_IDENTIFICACAO`, `SET_META` e `RESET_STATE_FUTURA`, sem `localStorage`).
- [ ] Task 2 — Ajustar `src/steps/StepIdentificacao/StepIdentificacao.jsx`: props `rotaAvancar`, `rotaRevisao`, `rotaVoltar` e `mostrarBotaoVendedor`, com defaults que preservam o Cliente. Conferir com `npm run dev` que `/identificacao` não mudou (sem "Voltar", botão "Vendedor" presente, avançar para `/ambientes`, edição volta para `/revisao`).
- [ ] Task 3 — Criar `src/services/pdfFutura.js` (`gerarPdfFutura`, capa no padrão dos outros PDFs, só dados cadastrais, arquivo `Checklist_Futura_{contrato}_{data}.pdf`).
- [ ] Task 4 — Testes do `pdfFutura.js` (seção 6, item 4): exportar `gerarPdfFutura` em `testes/auxiliares/entrada_pdf.js`, adicionar `futura` em `testes/auxiliares/carregar_pdf.js` e criar `testes/Q_pdf_futura.test.js` com os 5 casos. Rodar `npm test`: os testes novos e os do Cliente e do Projetista passam.
- [ ] Task 5 — Criar `src/steps/futura/StepRevisaoFutura/StepRevisaoFutura.jsx` (dados cadastrais, "Editar identificação", "Gerar PDF", tratamento de erro).
- [ ] Task 6 — Criar `src/steps/futura/StepSucessoFutura/StepSucessoFutura.jsx` (reset em memória e `navigate('/')`).
- [ ] Task 7 — Criar `src/screens/EscolhaProjetista/EscolhaProjetista.jsx` e `.module.css` (reuso de `.btnPerfil`, linhas de apoio e link "Voltar" para `/`).
- [ ] Task 8 — Alterar `src/App.jsx`: `FuturaLayoutRoute` sem `Stepper`, rotas `/projetista` e `/futura/*`. Alterar o botão "Projetista" em `SelecaoPerfil.jsx` para `/projetista`.
- [ ] Task 9 — Validação manual no `npm run dev`: CA-01 a CA-10, incluindo as regressões de rascunho do Cliente e do Projetista (CA-08 e CA-09), com a aba Application do navegador mostrando que as chaves de `localStorage` não mudam durante a Venda Futura.
- [ ] Task 10 — Rodar `npm run build` (CA-11) e `npm test` (CA-12, tudo verde e nada pulado).

---

## Desvios

*(Seção vazia — será preenchida durante a implementação.)*
