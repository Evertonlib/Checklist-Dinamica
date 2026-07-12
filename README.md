# Checklist Dinâmica — By Arabi Planejados

Sistema web de coleta guiada de informações técnicas para liberação de projetos de móveis planejados. O cliente preenche o formulário através de um link enviado pelo vendedor, o sistema calcula um score de risco automático e gera um PDF estruturado para a equipe de liberação.

## Fluxo Operacional

1. Vendedor envia o link ao cliente
2. Cliente preenche o formulário (sozinho ou com o vendedor presencialmente)
3. Sistema valida as respostas, gera os "clientes cientes" (CCs) automáticos e calcula o score de risco
4. Cliente baixa o PDF gerado
5. PDF é enviado para a liberação pelo fluxo atual da empresa

## Como funciona o formulário

O formulário é dividido em etapas sequenciais controladas por rota (`HashRouter`):

1. **Identificação** — nome, contrato, CEP (autofill via ViaCEP), endereço, telefone
2. **Ambientes** — seleção dos ambientes adquiridos e suas quantidades (cozinha, dormitórios, banheiro, home/sala/office, varanda, outros)
3. **Perguntas Globais** — perguntas únicas que valem para todos os ambientes (iluminação externa, reforma, pontos elétricos/hidráulicos/gás, rebaixo de teto)
4. **Perguntas por Ambiente** — uma etapa dinâmica por ambiente selecionado, com formulário específico ao tipo (cozinha, dormitório, banheiro, home/sala/office, outros)
5. **Revisão** — resumo de todas as respostas antes da geração do PDF
6. **Sucesso** — confirmação e download do PDF

Cada etapa problemática pode gerar um **cliente ciente (CC)** — texto de responsabilidade que o cliente declara estar ciente — e contribui pontos para o **score de risco** (🟢 Baixo / 🟡 Médio / 🔴 Alto), calculado por ambiente e globalmente. As regras completas de perguntas, CCs e pontuação estão documentadas em [especificacao-checklist-dinamica.md](especificacao-checklist-dinamica.md).

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
├── App.jsx                    # rotas e layout (stepper + header)
├── context/                   # FormProvider / FormContext (estado global do formulário)
├── domain/                    # regras de negócio: ambientes, score, clientes cientes, textos
│   ├── ambientes.js
│   ├── ccBuilder.js            # construção dos "clientes cientes"
│   ├── scoreEngine.js          # cálculo do score de risco
│   └── checklistTextos.js
├── services/
│   ├── cep.js                  # integração ViaCEP
│   └── pdf.js                  # geração do PDF final
├── steps/                     # uma pasta por etapa do fluxo
│   ├── StepIdentificacao/
│   ├── StepAmbientes/
│   ├── StepPerguntasGlobais/
│   ├── StepPerguntasPorAmbiente/  # formulários específicos por tipo de ambiente
│   ├── StepRevisao/
│   └── StepSucesso/
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

A arquitetura é modular e escalável, preparada para futura adição de backend, login e banco de dados. A base de código foi desenhada para ser reutilizada também na **Checklist Técnica do Vendedor**, uma etapa futura do mesmo produto.
