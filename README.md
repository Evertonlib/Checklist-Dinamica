# Checklist Dinâmica — By Arabi Planejados

Sistema web de coleta guiada de informações técnicas para liberação de projetos de móveis planejados. O sistema calcula um score de risco automático e gera um PDF estruturado para a equipe de liberação. Tudo roda no navegador: não há backend.

## Perfis e formulários

A tela inicial (rota `/`) é a **seleção de perfil**:

- **Cliente** — preenchido pelo cliente (sozinho ou com o vendedor presente), através de um link enviado pelo vendedor. Calcula score de risco, gera os "clientes cientes" (CCs) e produz o PDF `Checklist_Cliente_{contrato}_{data}.pdf`.
- **Projetista** — leva a uma tela de escolha com dois formulários:
  - **Normal** (Checklist Técnica do Projetista) — preenchida pela equipe, com foco em medidas e informações técnicas do projeto.
  - **Venda futura** — para quando o cliente compra hoje e só encomenda daqui a anos, como uma carta de crédito. Coleta apenas os dados cadastrais.
- **Importar PDF** — reabre um PDF do Cliente já gerado para corrigi-lo (veja abaixo).

Os formulários têm estado, schema e PDF próprios, independentes entre si. No código, o fluxo do Projetista Normal usa o sufixo `Vendedor` nos nomes de arquivo.

Todos são wizards com etapas sequenciais controladas por rota (`HashRouter`).

## Fluxo Operacional (Cliente)

1. Vendedor envia o link ao cliente
2. Cliente preenche o formulário (sozinho ou com o vendedor presencialmente)
3. Sistema valida as respostas, gera os "clientes cientes" (CCs) automáticos e calcula o score de risco
4. Cliente baixa o PDF gerado
5. PDF é enviado para a liberação pelo fluxo atual da empresa
6. Se algo estiver errado, o vendedor pode reabrir o PDF pelo botão **Importar PDF**, corrigir e gerar um novo

### Formulário do Cliente

1. **Identificação** — nome, contrato, CEP (autofill via ViaCEP), endereço, telefone
2. **Ambientes** — seleção dos ambientes adquiridos e suas quantidades (cozinha, dormitórios, banheiro, home/sala/office, varanda, outros)
3. **Perguntas Globais** — perguntas únicas que valem para todos os ambientes (iluminação externa, reforma, pontos elétricos/hidráulicos/gás, rebaixo de teto)
4. **Perguntas por Ambiente** — uma etapa dinâmica por ambiente selecionado, com formulário específico ao tipo (cozinha, dormitório, banheiro, home/sala/office, outros)
5. **Revisão** — resumo de todas as respostas antes da geração do PDF, com botões para editar cada parte
6. **Sucesso** — confirmação e download do PDF

Cada etapa problemática pode gerar um **cliente ciente (CC)** — texto de responsabilidade que o cliente declara estar ciente — e contribui pontos para o **score de risco** (🟢 Baixo / 🟡 Médio / 🔴 Alto), calculado por ambiente e globalmente. As regras completas de perguntas, CCs e pontuação estão documentadas em [especificacao-checklist-dinamica.md](especificacao-checklist-dinamica.md).

O preenchimento fica salvo no navegador: ao voltar, o sistema pergunta "Continuar de onde parou?".

### Importar PDF

O botão **Importar PDF**, na tela inicial, reabre um PDF do Cliente gerado por este sistema e leva direto à **Revisão**, com tudo preenchido, para corrigir qualquer ambiente ou a identificação e gerar um PDF novo.

- Funciona só com o **arquivo original** baixado pelo sistema, gerado depois desta funcionalidade. PDF antigo, PDF do Projetista, PDF reimpresso ("salvo como PDF" de novo), foto ou qualquer outro arquivo recebe a mensagem "PDF não possui dados para importação".
- Se já houver um preenchimento salvo no navegador, o sistema **pergunta antes de substituí-lo**.
- Tudo é lido no próprio navegador; nada é enviado a servidor.

Por baixo: cada PDF do Cliente carrega as respostas (sem score nem CCs) escondidas nas propriedades do arquivo, no formato `V1`. Esse formato também é lido por programas externos da automação de liberação, por isso qualquer mudança nele exige uma nova versão e aviso aos leitores. Os detalhes técnicos estão em [PRDS_E_SPECS/SPEC_IMPORTACAO_PDF_CLIENTE.md](PRDS_E_SPECS/SPEC_IMPORTACAO_PDF_CLIENTE.md).

### Formulário do Projetista (Normal)

Checklist técnica preenchida pela equipe, sob o prefixo de rota `/vendedor`:

1. **Identificação** (`/vendedor/identificacao`)
2. **Ambientes** (`/vendedor/ambientes`) — seleção dos ambientes do projeto
3. **Perguntas por Ambiente** (`/vendedor/ambiente/:instanceId`) — uma etapa dinâmica por ambiente, com perguntas técnicas agrupadas (grupos A/B/C)
4. **Revisão** (`/vendedor/revisao`) — inclui aviso de envio conjunto
5. **Sucesso** (`/vendedor/sucesso`) — confirmação e download do PDF

O preenchimento também fica salvo no navegador. Não é possível importar o PDF do Projetista.

### Venda futura

Sob o prefixo de rota `/futura`, sem ambientes, eletros, score nem CCs:

1. **Identificação** (`/futura/identificacao`) — os mesmos dados cadastrais do Cliente
2. **Revisão** (`/futura/revisao`)
3. **Sucesso** (`/futura/sucesso`) — baixa o PDF `Checklist_Futura_*.pdf`, só com os dados cadastrais

O estado fica só em memória (não é salvo no navegador).

## Stack técnica

| Item | Decisão |
|---|---|
| Framework | React 18 + React Router (HashRouter) |
| Build | Vite |
| PDF | jsPDF + jspdf-autotable (geração 100% client-side) |
| CEP | API pública ViaCEP (sem backend) |
| Hospedagem | GitHub Pages, via GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) |
| Estado | Context API + `useReducer` (`FormProvider`, `FormProviderVendedor`, `FormProviderFutura`) |
| Testes | Runner nativo do Node (`node --test`), sem biblioteca de teste |

## Estrutura do projeto

```
src/
├── App.jsx                    # rotas e layout (stepper + header) dos perfis
├── screens/
│   ├── SelecaoPerfil/         # tela inicial: Cliente, Projetista e Importar PDF
│   └── EscolhaProjetista/     # escolha entre Normal e Venda futura
├── context/                   # FormProvider / FormContext (+ *Vendedor e *Futura)
├── domain/                    # regras de negócio: ambientes, score, clientes cientes, textos
│   ├── ambientes.js
│   ├── ccBuilder.js            # construção dos "clientes cientes"
│   ├── scoreEngine.js          # cálculo do score de risco
│   ├── schema.js               # estado inicial / defaults (schemaVendedor.js p/ o projetista)
│   ├── gruposPerguntasVendedor.js
│   └── checklistTextos.js
├── services/
│   ├── cep.js                  # integração ViaCEP
│   ├── pdf.js                  # geração do PDF do cliente
│   ├── pdfVendedor.js          # geração do PDF do projetista
│   ├── pdfFutura.js            # geração do PDF da venda futura
│   └── importacaoPdf.js        # grava e lê os dados escondidos no PDF do cliente (formato V1)
├── steps/                     # uma pasta por etapa do fluxo do cliente
│   ├── StepIdentificacao/
│   ├── StepAmbientes/
│   ├── StepPerguntasGlobais/
│   ├── StepPerguntasPorAmbiente/  # formulários específicos por tipo de ambiente
│   ├── StepRevisao/
│   ├── StepSucesso/
│   ├── vendedor/               # etapas do fluxo do projetista (*Vendedor)
│   └── futura/                 # revisão e sucesso da venda futura
├── components/                # componentes reutilizáveis (Header, Stepper, Modal, etc.)
└── utils/                     # utilitários de tela (rolagem)
testes/                        # suíte de regressão (regras de negócio e PDFs)
PRDS_E_SPECS/                  # PRD e Spec de cada melhoria (metodologia SDD)
replay_jules/                  # conferência manual separada (replay de casos reais)
```

## Rodando localmente

```bash
npm install
npm run dev       # ambiente de desenvolvimento
npm run build     # build de produção (saída em dist/)
npm run preview   # preview do build de produção
npm test          # suíte de regressão em testes/
```

## Testes

A pasta `testes/` tem a suíte de regressão (score, CCs, validações, ambientes, os PDFs do Cliente, do Projetista e da Venda Futura, e a importação do PDF). Ela usa só dados fictícios, não acessa rede e não grava arquivos reais. Antes de publicar uma mudança em `src/`, `npm test` precisa passar sem nenhum teste pulado. O que depende de tela (botões, janelas, navegação) é conferido à mão com `npm run dev`.

## Documentação

- [especificacao-checklist-dinamica.md](especificacao-checklist-dinamica.md) — regras de perguntas, CCs e pontuação
- [PRDS_E_SPECS/](PRDS_E_SPECS/) — um par PRD/Spec por melhoria; o Spec prevalece na hora de implementar
- [RELATORIO_FONTES_PDF.md](RELATORIO_FONTES_PDF.md) — questões de fonte e acentuação no PDF

## Deploy

O deploy é automático via GitHub Actions ao dar push na branch `main`, publicando em GitHub Pages sob o base path `/Checklist-Dinamica/` (configurado em [vite.config.js](vite.config.js)).

## Roadmap

A arquitetura é modular e escalável, preparada para futura adição de backend, login e banco de dados. Os formulários do **Cliente**, do **Projetista** e da **Venda futura**, a **importação do PDF do Cliente** e a suíte de regressão já estão implementados. Ainda ficam de fora a importação do PDF do Projetista e da Venda futura.
