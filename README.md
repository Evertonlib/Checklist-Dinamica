# Checklist Dinâmica — By Arabi Planejados

Sistema web de coleta guiada de informações técnicas para liberação de projetos de móveis planejados. O sistema calcula um score de risco automático e gera um PDF estruturado para a equipe de liberação.

A aplicação oferece **dois formulários** a partir da tela inicial de seleção de perfil:

- **Cliente** — preenchido pelo cliente (sozinho ou com o vendedor presente), através de um link enviado pelo vendedor.
- **Vendedor** (Checklist Técnica do Vendedor) — preenchido pela equipe, com foco em medidas e informações técnicas do projeto.

## Fluxo Operacional (Cliente)

1. Vendedor envia o link ao cliente
2. Cliente preenche o formulário (sozinho ou com o vendedor presencialmente)
3. Sistema valida as respostas, gera os "clientes cientes" (CCs) automáticos e calcula o score de risco
4. Cliente baixa o PDF gerado
5. PDF é enviado para a liberação pelo fluxo atual da empresa

## Como funciona o formulário

A tela inicial (rota `/`) é a **seleção de perfil**, onde se escolhe entre o formulário do **Cliente** e o do **Vendedor**. Ambos são wizards com etapas sequenciais controladas por rota (`HashRouter`).

### Formulário do Cliente

1. **Identificação** — nome, contrato, CEP (autofill via ViaCEP), endereço, telefone
2. **Ambientes** — seleção dos ambientes adquiridos e suas quantidades (cozinha, dormitórios, banheiro, home/sala/office, varanda, outros)
3. **Perguntas Globais** — perguntas únicas que valem para todos os ambientes (iluminação externa, reforma, pontos elétricos/hidráulicos/gás, rebaixo de teto)
4. **Perguntas por Ambiente** — uma etapa dinâmica por ambiente selecionado, com formulário específico ao tipo (cozinha, dormitório, banheiro, home/sala/office, outros)
5. **Revisão** — resumo de todas as respostas antes da geração do PDF
6. **Sucesso** — confirmação e download do PDF

Cada etapa problemática pode gerar um **cliente ciente (CC)** — texto de responsabilidade que o cliente declara estar ciente — e contribui pontos para o **score de risco** (🟢 Baixo / 🟡 Médio / 🔴 Alto), calculado por ambiente e globalmente. As regras completas de perguntas, CCs e pontuação estão documentadas em [especificacao-checklist-dinamica.md](especificacao-checklist-dinamica.md).

### Formulário do Vendedor

Checklist técnica preenchida pela equipe, sob o prefixo de rota `/vendedor`:

1. **Identificação** (`/vendedor/identificacao`)
2. **Ambientes** (`/vendedor/ambientes`) — seleção dos ambientes do projeto
3. **Perguntas por Ambiente** (`/vendedor/ambiente/:instanceId`) — uma etapa dinâmica por ambiente, com perguntas técnicas agrupadas (grupos A/B/C)
4. **Revisão** (`/vendedor/revisao`) — inclui aviso de envio conjunto
5. **Sucesso** (`/vendedor/sucesso`) — confirmação e download do PDF

O fluxo do vendedor tem estado, schema e PDF próprios (arquivos com sufixo `Vendedor`), independentes do fluxo do cliente.

## Stack técnica

| Item | Decisão |
|---|---|
| Framework | React 18 + React Router (HashRouter) |
| Build | Vite |
| PDF | jsPDF + jspdf-autotable (geração 100% client-side) |
| CEP | API pública ViaCEP (sem backend) |
| Hospedagem | GitHub Pages, via GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)) |
| Estado | Context API (`FormProvider`) |

## Estrutura do projeto

```
src/
├── App.jsx                    # rotas e layout (stepper + header) dos dois perfis
├── screens/SelecaoPerfil/     # tela inicial de escolha entre Cliente e Vendedor
├── context/                   # FormProvider / FormContext (+ variantes *Vendedor)
├── domain/                    # regras de negócio: ambientes, score, clientes cientes, textos
│   ├── ambientes.js
│   ├── ccBuilder.js            # construção dos "clientes cientes"
│   ├── scoreEngine.js          # cálculo do score de risco
│   ├── schema.js               # estado inicial / defaults (schemaVendedor.js p/ o vendedor)
│   ├── gruposPerguntasVendedor.js
│   └── checklistTextos.js
├── services/
│   ├── cep.js                  # integração ViaCEP
│   ├── pdf.js                  # geração do PDF do cliente
│   └── pdfVendedor.js          # geração do PDF do vendedor
├── steps/                     # uma pasta por etapa do fluxo do cliente
│   ├── StepIdentificacao/
│   ├── StepAmbientes/
│   ├── StepPerguntasGlobais/
│   ├── StepPerguntasPorAmbiente/  # formulários específicos por tipo de ambiente
│   ├── StepRevisao/
│   ├── StepSucesso/
│   └── vendedor/               # etapas do fluxo do vendedor (*Vendedor)
└── components/                # componentes reutilizáveis (Header, Stepper, Modal, etc.)
```

## Rodando localmente

```bash
npm install
npm run dev       # ambiente de desenvolvimento
npm run build     # build de produção (saída em dist/)
npm run preview   # preview do build de produção
```

## Deploy

O deploy é automático via GitHub Actions ao dar push na branch `main`, publicando em GitHub Pages sob o base path `/Checklist-Dinamica/` (configurado em [vite.config.js](vite.config.js)).

## Roadmap

A arquitetura é modular e escalável, preparada para futura adição de backend, login e banco de dados. A **Checklist Técnica do Vendedor** já está implementada (fluxo `/vendedor`), reaproveitando a base de código do formulário do cliente.
