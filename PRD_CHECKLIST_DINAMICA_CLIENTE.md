# PRD — Checklist Dinâmica do Cliente (By Arabi Planejados)

**Documento:** Product Requirements Document — Fase 1 (Cliente)
**Data:** 18/04/2026
**Fonte primária:** `especificacao-checklist-dinamica.md`
**Status:** Aguardando aprovação antes do início da implementação

---

## 1. Objetivo do Sistema

Disponibilizar uma página web única, acessível por link, onde o cliente da By Arabi Planejados preenche um formulário guiado com as informações técnicas necessárias para liberação do projeto de móveis planejados. Ao final, o sistema calcula automaticamente um score de risco, gera os textos de "Cliente Ciente" (CC) aplicáveis e produz um PDF estruturado que o cliente baixa e repassa à equipe de liberação pelo fluxo atual.

O sistema deve ser construído de forma que a mesma base de código sirva, em fase posterior, à **Checklist Técnica do Vendedor** — portanto, a lógica de perguntas, score e geração de PDF deve ser desacoplada do fluxo específico do cliente.

### Objetivos não-funcionais

- Zero backend nesta fase (hospedagem GitHub Pages).
- Funciona em celular, tablet e desktop — formulário usado majoritariamente no celular do cliente.
- Todo o estado do formulário fica no navegador até o PDF ser gerado; nenhum dado sai do dispositivo exceto a consulta de CEP à ViaCEP.
- Preparado para, no futuro, ganhar backend, login e banco sem reescrita — apenas adição de camadas.

---

## 2. Arquitetura de Componentes Proposta

A aplicação é um formulário multi-etapas (wizard) com estado global compartilhado entre as etapas.

### 2.1 Camadas

**Camada de apresentação (components):** componentes React puramente visuais, recebem dados e callbacks por props.

**Camada de estado (context + reducer):** um único `FormContext` guarda toda a resposta do cliente em um objeto serializável. Toda mutação passa por um reducer, o que facilita testar as regras condicionais e, no futuro, persistir ou sincronizar com backend sem mudar os componentes.

**Camada de domínio (lógica pura):** funções sem React — cálculo de score, geração dos textos de CC a partir das respostas, montagem da estrutura do PDF. Ficam em módulos `.js` isolados e são testáveis sem renderização.

**Camada de serviços:** wrappers finos para ViaCEP e para a geração do PDF via jsPDF. Um por arquivo, sem lógica de negócio.

### 2.2 Árvore de componentes

```
App
└── FormProvider (Context + Reducer + persistência em localStorage)
    ├── Header (logo By Arabi + nome da etapa atual)
    ├── Stepper (indicador visual de progresso, 4 etapas)
    └── Router de etapas
        ├── StepIdentificacao          → Etapa 1
        ├── StepAmbientes              → Etapa 2
        ├── StepPerguntasGlobais       → Etapa 3
        │   ├── BlocoIluminacao (G1)
        │   ├── BlocoReforma (G2, G2.1, G2.2 encadeadas)
        │   ├── BlocoPontosUtilidades (G3)
        │   └── BlocoRebaixo (G4)
        ├── StepPerguntasPorAmbiente   → Etapa 4 (itera sobre ambientes selecionados)
        │   ├── FormCozinha           (aplicado também a A.S. e Varanda)
        │   ├── FormDormitorio        (casal e solteiro)
        │   ├── FormHomeSalaOffice
        │   ├── FormBanheiro
        │   └── FormOutros            (usa o mesmo conjunto completo do spec)
        ├── StepRevisao                → tela final com resumo + score + botão "Gerar PDF"
        └── StepSucesso                → confirmação pós-download
```

### 2.3 Módulos de domínio (sem React)

- `domain/scoreEngine.js` — recebe o estado completo do formulário e devolve `{ scoreGlobal, scorePorAmbiente, gatilhosAtivados }`.
- `domain/ccBuilder.js` — recebe o estado e produz a lista de textos de Cliente Ciente já com as regras de supressão aplicadas (ex.: G2.1 suprime duplicata em G2.2).
- `domain/schema.js` — objeto que descreve a forma do estado do formulário, com valores iniciais. Serve de contrato entre reducer, etapas e geradores.
- `domain/ambientes.js` — catálogo estático dos ambientes disponíveis, quais perguntas cada um responde e quais gatilhos de risco podem disparar.

### 2.4 Serviços

- `services/cep.js` — função única `buscarCep(cep)` que chama `https://viacep.com.br/ws/{cep}/json/` e devolve logradouro, bairro, cidade, UF (ou erro tratado).
- `services/pdf.js` — função `gerarPdf(estadoDoFormulario)` que usa jsPDF + jspdf-autotable para montar as páginas conforme seção 5 da especificação.

### 2.5 Decisões técnicas herdadas da pesquisa

| Questão | Decisão | Justificativa |
|---|---|---|
| Toolchain | **Vite** (não Create React App) | CRA está descontinuado; Vite tem suporte nativo para variável `base` que o GitHub Pages exige. |
| Estado global | **Context + useReducer** (nativo) | Formulário é linear e de escopo único; bibliotecas como Redux/Zustand seriam exagero e adicionam dependência sem ganho. |
| Roteamento | **HashRouter** do react-router-dom | GitHub Pages não lida com rotas SPA via history API sem configuração extra; hash evita 404 em refresh. |
| Persistência local | **localStorage** sincronizado pelo reducer | Se o cliente perder conexão ou fechar a aba, recupera o progresso ao reabrir o link. |
| PDF | **jsPDF + jspdf-autotable** | Client-side puro, funciona no GitHub Pages, dá controle sobre layout da capa/resumo/detalhes. Alternativas como `@react-pdf/renderer` trariam curva de aprendizado maior sem ganho visível para este volume de conteúdo. |
| Deploy | **GitHub Actions** (workflow oficial do Pages) | Evita a dependência do pacote `gh-pages` e torna o deploy automático a cada push em `main`. |
| Estilização | CSS Modules (mobile-first) | Sem framework CSS pesado; o visual segue a identidade By Arabi a ser aplicada posteriormente via skill dedicada. |

---

## 3. Ordem de Construção Recomendada

A sequência foi definida por dependências reais: cada item só começa quando o que ele consome já existe e funciona.

1. **Setup do projeto** — Vite + React, configuração do `base` para GitHub Pages, pipeline de deploy via GitHub Actions, estrutura de pastas. Critério de saída: um "Hello World" publicado no domínio `github.io`.
2. **Schema e FormProvider** — definir o objeto de estado completo (`domain/schema.js`) e o reducer. Critério de saída: um componente de teste consegue ler e escrever qualquer campo do formulário via contexto.
3. **Etapa 1 — Identificação** — inclui integração ViaCEP. Primeiro porque é a etapa mais simples, valida o padrão de implementação das demais e já exercita o fluxo de serviço externo. Critério de saída: digitar um CEP válido preenche logradouro, bairro, cidade e UF automaticamente; CEP inválido mostra mensagem clara sem travar o formulário.
4. **Etapa 2 — Seleção de Ambientes** — dispara a lógica condicional que alimenta as etapas 3 e 4. Critério de saída: ambientes com quantidade maior que 1 aparecem listados individualmente com campo de nome; só os selecionados seguem adiante.
5. **Motor de score e builder de CCs (`domain/scoreEngine.js` e `domain/ccBuilder.js`)** — construídos antes das etapas 3 e 4 para que essas etapas apenas marquem gatilhos no estado, sem duplicar lógica. Critério de saída: dado um estado de formulário fabricado manualmente, o motor devolve o score esperado e a lista correta de CCs.
6. **Etapa 3 — Perguntas Globais** — já usa motor e builder. Inclui pop-up de risco alto na G2.1 ("sem reboco") e supressão de CC duplicado entre G2.1 e G2.2. Critério de saída: respostas que ativam gatilhos globais aparecem imediatamente refletidas no score da tela de revisão.
7. **Etapa 4 — Perguntas por Ambiente** — iteração sobre os ambientes selecionados na Etapa 2; cada tipo de ambiente renderiza o form específico. Critério de saída: dois dormitórios com nomes distintos coletam respostas independentes e pontuam separadamente.
8. **Tela de Revisão + Score Visual** — exibe score global com cor correspondente, lista de CCs gerados e botão "Gerar PDF". Permite voltar a qualquer etapa. Critério de saída: alterar uma resposta ao voltar atualiza imediatamente o score e as CCs.
9. **Serviço de PDF (`services/pdf.js`)** — é o último porque consome todo o estado já estabilizado. Gera capa, resumo executivo e detalhamento conforme seção 5 do spec. Critério de saída: PDF abre corretamente em leitores Android, iOS e desktop, com capa, resumo de 1 página e detalhamento completo.
10. **Tela de sucesso + QA final** — mensagem de instrução para o cliente enviar o PDF ao vendedor, limpeza de localStorage após download confirmado, testes em celulares reais.

---

## 4. Escopo da Primeira Fase

### 4.1 Está dentro do escopo

- Formulário completo das 4 etapas descritas no spec.
- Todas as perguntas condicionais, CCs e avisos.
- Cálculo de score global e por ambiente, seguindo exatamente a tabela de pontos da seção 4 do spec.
- Integração ViaCEP.
- Geração de PDF client-side com capa, resumo executivo e checklist completa.
- Persistência do rascunho em localStorage.
- Responsividade mobile-first.
- Deploy automático no GitHub Pages via push em `main`.
- Identidade visual básica alinhada à By Arabi (tipografia, cores, logo), a ser detalhada quando a skill `byarabi-design` for aplicada na fase de estilização.

### 4.2 Fica fora desta fase (já mapeado, postergado)

- Backend, login, banco de dados.
- Envio automático do PDF por e-mail ou integração com sistema interno da By Arabi — nesta fase o cliente baixa e envia manualmente.
- Upload de fotos dos ambientes.
- Assinatura digital dos CCs.
- Versão para o vendedor (Checklist Técnica do Vendedor) — será outra fase aproveitando os módulos de domínio.
- Painel administrativo, listagem de checklists recebidas, métricas.
- Internacionalização — PT-BR apenas.
- Modo offline completo (PWA).
- Testes automatizados E2E — apenas testes unitários dos módulos de domínio na primeira fase.

---

## 5. Premissas Assumidas

1. O link da checklist é sempre gerado/enviado pelo vendedor; não há mecanismo de geração de link próprio pelo cliente.
2. Um cliente preenche uma checklist por contrato; não é necessário suportar múltiplos contratos simultaneamente no mesmo dispositivo.
3. O número do contrato é validado apenas por formato (sigla + dígitos); não há verificação de existência porque não há backend.
4. O PDF gerado é o artefato final — nenhuma etapa posterior modifica conteúdo; se o cliente perceber erro depois, refaz a checklist.
5. A API ViaCEP está disponível; sua indisponibilidade não trava o formulário (o cliente pode digitar o endereço manualmente).
6. O formulário é usado com frequência por clientes com pouca familiaridade técnica — o texto das perguntas deve ser direto, sem jargão de marcenaria.
7. Toda pergunta visível ao cliente é obrigatória salvo as marcadas como opcionais no spec (ex.: link de produto, complemento de endereço, observações).
8. O texto dos CCs é exatamente o definido na especificação — alterações só com nova versão do documento.
9. A identidade visual By Arabi (logo, cores, tipografia) será aplicada a partir de assets fornecidos via skill dedicada; até lá o visual é neutro e funcional.
10. O público-alvo usa majoritariamente navegadores atualizados (Chrome, Safari) em celulares recentes; não há suporte declarado a IE ou navegadores legados.

---

## 6. Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Formulário longo causa abandono no celular | Alta | Alto | Stepper visível, salvamento automático em localStorage, possibilidade de retomar o preenchimento, ordem começando pelas perguntas mais curtas. |
| Cliente digita CEP errado e assume endereço preenchido sem conferir | Média | Médio | Campos de endereço continuam editáveis após autofill; tela de revisão exibe endereço completo para confirmação. |
| ViaCEP fora do ar no momento do preenchimento | Baixa | Baixo | Fallback para digitação manual; mensagem clara ao cliente sem bloquear avanço. |
| jsPDF gera PDF com layout quebrado em fontes não padrão ou textos longos de CC | Média | Alto | CCs são textos fixos e testados; quebra de linha automática do jsPDF exercitada desde o início; teste em dispositivos reais antes do release. |
| Regras de score ambíguas entre ambientes iguais em quantidade (dois dormitórios) | Média | Médio | Pontuação por ambiente é independente; global reflete o pior ambiente — comportamento testado no `scoreEngine` com casos fabricados. |
| Supressão de CC duplicado entre G2.1 e G2.2 implementada incorretamente | Alta | Médio | Casos de teste unitários específicos cobrindo as quatro combinações SIM/NÃO antes de integrar à Etapa 3. |
| Atualização do texto dos CCs pela equipe jurídica exige alteração no código | Alta (ao longo do tempo) | Baixo | Textos centralizados em `domain/ccBuilder.js` para alteração num único lugar. |
| PDF excede 1 página de resumo executivo em projetos muito grandes | Média | Baixo | Agrupamento dos itens baixos em linha única conforme spec; limite documentado — se ultrapassar, gera página extra com mesma estrutura. |
| Cliente fecha a aba antes de gerar o PDF e perde o progresso | Média | Médio | Persistência automática em localStorage a cada mudança; ao reabrir, oferece continuar de onde parou. |
| GitHub Pages com `base path` errado quebra assets/links | Baixa | Alto | Deploy via GitHub Actions com `base` configurado uma única vez no `vite.config`; validado no primeiro "Hello World". |

---

## 7. Critérios de Aceitação

Cada critério descreve **entrada** → **resultado esperado** e inclui cenários de sucesso e de erro.

### CA-1 — Etapa 1: Identificação com CEP válido
**Entrada:** o cliente digita nome "Maria Silva", contrato "IT01234", CEP "01310-100".
**Esperado:** ao sair do campo CEP, os campos logradouro (Avenida Paulista), bairro (Bela Vista), cidade (São Paulo) e UF (SP) são preenchidos automaticamente. Campos continuam editáveis. Botão "Avançar" fica habilitado.

### CA-2 — Etapa 1: CEP inválido
**Entrada:** cliente digita CEP "99999-999".
**Esperado:** ViaCEP devolve erro; formulário exibe mensagem "CEP não encontrado — você pode preencher o endereço manualmente" sem bloquear o avanço. Campos de endereço ficam editáveis e vazios.

### CA-3 — Etapa 1: ViaCEP indisponível
**Entrada:** cliente digita CEP "01310-100" e a API ViaCEP está fora do ar (ou sem conexão).
**Esperado:** após timeout de 5 segundos, formulário exibe "Não foi possível consultar o CEP agora — preencha o endereço manualmente" e libera os campos. O cliente consegue avançar normalmente.

### CA-3B — Botão de ajuda "Vendedor"
**Entrada:** cliente está em qualquer etapa do formulário e clica no botão "Vendedor" fixo na barra inferior.
**Esperado:** abre um modal com o texto "Precisa de ajuda com essa pergunta? Entre em contato com seu vendedor projetista para obter essa informação. Quando tiver a resposta, retorne aqui — seu progresso estará salvo." e um botão "Entendido, vou consultar o vendedor" que fecha o modal. Nenhuma navegação ocorre, nenhum dado é alterado. O botão deve estar visível em todas as etapas do formulário.

### CA-4 — Etapa 1: contrato com formato inválido
**Entrada:** cliente digita "ABC123" no campo contrato.
**Esperado:** ao tentar avançar, mensagem "O contrato deve começar com IT, SM, TA, PIN ou STA seguido dos números" próxima ao campo. Botão "Avançar" permanece desabilitado.

### CA-5 — Etapa 2: seleção com quantidade maior que 1
**Entrada:** cliente marca "Dormitório Solteiro" com quantidade 2.
**Esperado:** aparecem dois blocos com campos de nome ("Dormitório Solteiro 1" e "Dormitório Solteiro 2") pedindo um rótulo para diferenciar. Na Etapa 4, cada dormitório abre seu próprio formulário.

### CA-6 — Etapa 2: nenhum ambiente selecionado
**Entrada:** cliente tenta avançar sem marcar nada.
**Esperado:** mensagem "Selecione ao menos um ambiente para continuar" e botão "Avançar" desabilitado.

### CA-7 — Etapa 3: gatilho de risco alto direto (G2.1)
**Entrada:** na pergunta G2, cliente responde SIM (há reforma); em G2.1 responde NÃO (sem reboco).
**Esperado:** exibe imediatamente um pop-up de risco alto com o texto: "Ambiente não está pronto para liberação. [nome do ambiente] ainda não possui reboco (argamassa) finalizado nas paredes. Nessa condição, o projeto não pode ser liberado sem adequação prévia. Seu progresso está salvo."
O pop-up oferece dois botões:
- "← Voltar" — fecha o pop-up e retorna à pergunta G2.1 para o cliente corrigir a resposta.
- "Assumo o risco e continuar" — fecha o pop-up e permite avançar normalmente; o gatilho de risco alto permanece ativo e o CC correspondente é adicionado à lista; a pergunta G2.2 não aparece (regra de supressão).

O formulário não encerra neste ponto em nenhuma das opções.

### CA-8 — Etapa 3: G2.1 SIM e G2.2 NÃO
**Entrada:** G2 = SIM, G2.1 = SIM, G2.2 = NÃO.
**Esperado:** CC da G2.2 (sem revestimento) é gerado; score soma +3 (alto); como há um gatilho alto, a classificação é ALTO.

### CA-9 — Etapa 3: rebaixo com cm por ambiente
**Entrada:** cliente tem Cozinha e Dormitório Casal selecionados; na G4 marca ambos e informa 10cm na cozinha e 15cm no dormitório.
**Esperado:** dois CCs distintos são gerados, cada um com sua medida, e cada ambiente recebe +1 de pontuação.

### CA-10 — Etapa 4 Cozinha: granito existente a ser retirado
**Entrada:** cliente responde SIM para granito existente e NÃO para "os móveis serão adaptados".
**Esperado:** CC de retirada de granito é adicionado; cozinha recebe +2 de pontuação; score visível na tela de revisão.

### CA-11 — Etapa 4 Dormitório: TV com ponto fora da posição final
**Entrada:** cliente marca SIM para TV, NÃO para ponto elétrico na posição final.
**Esperado:** CC de deslocamento de ponto é gerado ("CLIENTE CIENTE E DE ACORDO QUE DEVERÁ DESLOCAR OS PONTOS ELÉTRICOS PARA DENTRO DA POSIÇÃO DO PAINEL DE TV ATÉ O DIA DA MONTAGEM PARA OCULTAÇÃO ADEQUADA DA FIAÇÃO"); +2 pontos no ambiente.
Em seguida, os campos de dados da TV são exibidos normalmente: Polegadas (obrigatório), Modelo (opcional — sem aviso visível ao cliente, apenas não bloqueia o avanço), Largura cm (opcional), Altura cm (opcional), Profundidade cm (opcional), Link (opcional — exibir placeholder "Cole aqui o link do produto, se tiver"). O cliente pode avançar sem preencher os campos opcionais.

### CA-12 — Etapa 4: dois dormitórios com scores diferentes
**Entrada:** "Dormitório Amélia" com todos os itens em risco; "Dormitório Felipe" com nada em risco.
**Esperado:** score de Amélia é ALTO, de Felipe é BAIXO, e o global é ALTO (reflete o pior ambiente). A tela de revisão exibe abaixo do score global uma linha explicativa: "Risco global classificado como ALTO porque um ou mais ambientes apresentam condição de risco alto."

### CA-13 — Revisão: voltar e alterar resposta
**Entrada:** cliente na tela de revisão com score MÉDIO volta à Etapa 3 e muda G2.1 de SIM para NÃO.
**Esperado:** ao voltar para a revisão, o score é recalculado e exibido como ALTO; lista de CCs é atualizada sem duplicatas.

### CA-14 — Geração de PDF: estrutura correta
**Entrada:** formulário completo, score MÉDIO, três CCs médios e dois baixos.
**Esperado:** PDF gerado com capa (logo, nome, contrato, data, score MÉDIO destacado em amarelo); página 2 com resumo executivo listando os três médios em bloco e os baixos em linha única agrupada; páginas seguintes com checklist completa organizada por ambiente, cada CC imediatamente abaixo da resposta que o originou.

### CA-15 — Geração de PDF: falha de geração
**Entrada:** por qualquer motivo jsPDF lança exceção.
**Esperado:** mensagem "Não foi possível gerar o PDF agora — tente novamente" e botão para retentar; o formulário preenchido continua intacto no localStorage.

### CA-16 — Recuperação de rascunho
**Entrada:** cliente preenche até a Etapa 3, fecha a aba e reabre o link 10 minutos depois no mesmo dispositivo.
**Esperado:** ao entrar, aparece "Deseja continuar de onde parou?"; se sim, volta à Etapa 3 com todos os campos anteriores preservados; se não, inicia do zero e limpa o localStorage.

### CA-17 — Pós-download: limpeza
**Entrada:** cliente clica em "Gerar PDF", PDF é baixado, cliente confirma na tela de sucesso.
**Esperado:** localStorage é limpo; se o cliente reabrir o link, começa um novo preenchimento.

### CA-18 — Responsividade mobile
**Entrada:** formulário aberto em celular com tela de 360px de largura.
**Esperado:** todos os campos legíveis sem rolagem horizontal; botões com área de toque adequada; stepper visível; pop-ups adaptados à tela.

### CA-18B — Indicador de progresso por etapa
**Entrada:** cliente navega pelo formulário.
**Esperado:** a barra superior exibe o formato "Etapa X de 4 — [Nome da etapa]", onde X é o número da etapa atual e o nome é: Identificação, Ambientes, Perguntas Gerais, ou o nome do ambiente em preenchimento na Etapa 4. O indicador avança a cada etapa concluída. Não é uma barra de porcentagem contínua.

### CA-19 — Ambiente "Outros"
**Entrada:** cliente marca "Outros" na Etapa 2 e nomeia como "Lavanderia Externa".
**Esperado:** na Etapa 4, o ambiente recebe o conjunto completo (superset) de todas as perguntas por ambiente, na seguinte ordem: granito ou pia existente, tanque existente, TV, cortineiro, rodapé, tamanho de cama, eletrodomésticos, cuba, eletrônicos, observações. O cliente responde apenas o que for aplicável — perguntas condicionais seguem as mesmas regras dos outros ambientes. Score calculado separadamente.

### CA-20 — Deploy GitHub Pages
**Entrada:** commit na branch `main`.
**Esperado:** workflow executa e publica a versão atualizada no domínio `github.io`; rotas internas (via HashRouter) continuam funcionando após refresh.

---

## 8. O que esperar para aprovação

Antes do início da implementação, por favor confirme:

1. **Escopo da Fase 1** está correto (seção 4)?
2. **Ordem de construção** faz sentido para seu cronograma (seção 3)?
3. **Premissas** da seção 5 estão alinhadas com a expectativa do negócio?
4. Há algum **risco** adicional não mapeado na seção 6?
5. Algum **critério de aceitação** precisa ser ajustado, removido ou adicionado antes do início?

Com essas respostas, avançamos para a **Etapa 1 — Setup do projeto** (Vite + GitHub Actions + "Hello World" publicado).
