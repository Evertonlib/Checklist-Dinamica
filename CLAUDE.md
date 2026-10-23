# CLAUDE.md

Guia para o Claude Code (claude.ai/code) ao trabalhar neste repositório.

## Como o Claude Code deve trabalhar neste repositório

- Pensamentos, mensagens e explicações exibidos na interface devem ser sempre em português do Brasil.
- Ao concluir uma task, sugerir um texto de commit (sem executar o commit).
- Ao concluir uma task que mude comportamento descrito neste arquivo (regras de negócio, armadilhas, comandos), perguntar se este CLAUDE.md deve ser atualizado. Ao propor a mudança, priorizar trocar/remover uma linha existente em vez de acrescentar — este arquivo deve permanecer abaixo de ~100 linhas.

## O que este projeto faz

SPA React (Vite) de coleta guiada de informações técnicas para liberação de projetos de móveis planejados da By Arabi. O usuário preenche um formulário em etapas (wizard), o sistema calcula um **score de risco**, gera **Clientes Cientes (CCs)** — textos de responsabilidade — e produz um **PDF** 100% client-side. Sem backend: hospedado em GitHub Pages.

**Venda futura (implementada, card Trello `CHECKLIST_VENDA_FUTURA`):** cliente compra hoje para encomendar daqui a anos, como uma carta de crédito. Não tem ambientes, eletros, score nem CCs. Botão Projetista → `/projetista` (Normal ou Venda futura) → `/futura/*`: Identificação (reusa `StepIdentificacao` por props) → Revisão → PDF só com dados cadastrais (`Checklist_Futura_*.pdf`). Estado só em memória (`FormProviderFutura`, sem `localStorage`).

**Importar PDF (implementado, `SPEC_IMPORTACAO_PDF_CLIENTE`):** todo PDF do Cliente leva as respostas escondidas na propriedade Keywords (`V1:` + Base64 de JSON, só 4 chaves: identificação, ambientes, globais, respostas). Esse formato é **contrato com leitores Python externos**: mudou o formato, muda a versão e os leitores são avisados antes. Não ligar compressão nem criptografia no jsPDF sem rever `services/importacaoPdf.js`.

Veja `README.md` para a descrição funcional completa e `especificacao-checklist-dinamica.md` para as regras de perguntas/CCs/pontuação — não repetir aqui.

## Comandos

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção (saída em dist/) — use para validar que compila
npm run preview   # preview do build de produção
```

Antes de qualquer commit ou merge na `main` que altere `src/`, rodar `npm test` (suíte de regressão em `testes/`): vermelho ou pulado bloqueia. Continua valendo `npm run build` (garante que compila) e o teste manual no `npm run dev`; `replay_jules/` segue como conferência manual separada.

## Deploy

Automático via GitHub Actions (`.github/workflows/deploy.yml`) a cada push na `main`, publicando em GitHub Pages sob o base path `/Checklist-Dinamica/` (configurado em `vite.config.js`). O `dist/` é gerado pela CI — não commitar build manual.

## Arquitetura

### Dois fluxos independentes: Cliente e Vendedor

O app tem **dois wizards paralelos**, escolhidos na tela inicial `SelecaoPerfil` (`src/App.jsx`):

- **Cliente** (`/identificacao`, `/ambientes`, `/globais`, `/ambiente/:instanceId`, `/revisao`, `/sucesso`) — provider `FormProvider`, steps em `src/steps/`, PDF em `src/services/pdf.js`.
- **Vendedor** (`/vendedor/*`) — provider `FormProviderVendedor`, steps em `src/steps/vendedor/`, PDF em `src/services/pdfVendedor.js`.

Cada perfil tem seu **próprio Context, schema e PDF** — arquivos com sufixo `Vendedor` são a variante do vendedor. Mudança em um perfil **não** propaga para o outro automaticamente; ao alterar regra compartilhada, verificar se ambos os lados precisam do ajuste.

### Roteamento e etapas dinâmicas

`HashRouter` (necessário para GitHub Pages). O número de etapas é **dinâmico**: depende de quantos ambientes o usuário selecionou. Cada ambiente selecionado vira uma rota `/ambiente/:instanceId` (uma instância por ambiente, identificada por `instanceId`). O cálculo de `totalEtapas` e do número da etapa atual fica nos layouts em `src/App.jsx`.

### Domínio (regras de negócio) — `src/domain/`

Toda a lógica de negócio vive aqui, desacoplada da UI:

- `scoreEngine.js` — calcula score global e por ambiente a partir do estado completo.
- `ccBuilder.js` — monta os Clientes Cientes / avisos a partir das respostas.
- `schema.js` / `schemaVendedor.js` — estado inicial e defaults por tipo de ambiente (`formType`) / grupo.
- `ambientes.js` — catálogo de ambientes e `formatarNomeAmbiente`.
- `checklistTextos.js`, `gruposPerguntasVendedor.js` — textos e agrupamentos.

Ao mudar comportamento de score, CC ou perguntas, editar o `domain/` — não espalhar regra pelos componentes de step.

### Estado e persistência

Context API + `useReducer` (`FormProvider*`). O estado é sincronizado com `localStorage`, então o preenchimento sobrevive a refresh. "Iniciar novo preenchimento" **não apaga** `byarabi_checklist_rascunho` (observado). A importação (botão na `SelecaoPerfil`) grava essa chave, navega para `/revisao` com `state.importado` e o `FormProvider` restaura sem diálogo; se já houver valor na chave, pergunta antes de substituir.

### Serviços externos

- `services/cep.js` — autofill de endereço via API pública ViaCEP (timeout de 5s; tratar falha silenciosamente, o usuário pode digitar manualmente).
- `services/pdf.js` / `pdfVendedor.js` — geração de PDF com `jsPDF` + `jspdf-autotable`, client-side. Ver `RELATORIO_FONTES_PDF.md` para questões de fonte/acentuação no PDF.
- `services/importacaoPdf.js` — grava (`montarDadosPdf`) e lê (`lerDadosPdf`, nunca lança exceção) o formato V1 dos dados escondidos no PDF do Cliente.

## Metodologia e documentação (SDD)

- `PRDS_E_SPECS/`: um par `PRD_*.md` / `SPEC_*.md` por feature (metodologia SDD). O **Spec prevalece** sobre outros documentos ao implementar.
- Existem subagents `prd-generator` e `spec-generator` para gerar esses documentos seguindo a metodologia.
- `especificacao-checklist-dinamica.md`: especificação funcional macro (perguntas, CCs, pontuação).
- `README.md`: descrição funcional e fluxo operacional para humanos.
