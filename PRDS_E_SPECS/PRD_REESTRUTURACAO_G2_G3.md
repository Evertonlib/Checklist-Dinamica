# PRD — Reestruturação das Perguntas G2 e G3 (Reboco e Revestimento)

**Versão:** 1.1  
**Data:** 2026-05-15  
**Status:** Aguardando aprovação

---

## 1. Objetivo

Simplificar o bloco de perguntas sobre condições das paredes, eliminando a pergunta prévia de "reforma" e tornando as perguntas de reboco e revestimento universais — aplicáveis a todos os ambientes do projeto, independentemente de haver ou não obra em andamento.

A lógica atual exige que o vendedor primeiro confirme se há reforma, para então qualificar reboco e revestimento apenas nos ambientes em reforma. Na prática, isso cria uma barreira desnecessária: ambientes sem reforma declarada podem ter paredes incompletas, e a pergunta de porta de entrada ("há reforma?") mascara esse risco. Com a reestruturação, o sistema pergunta diretamente sobre o estado das paredes em todos os ambientes.

Além disso, hoje os dois problemas (reboco ausente e revestimento ausente) compartilham o mesmo texto de CC, o que gera ambiguidade jurídica e operacional. Com a reestruturação, cada situação terá um CC próprio e preciso.

---

## 2. Estado Atual (como está hoje)

O fluxo atual para o bloco de reforma funciona assim:

- **G2:** "Algum ambiente está em reforma?" — resposta Sim/Não booleana que serve de portão. Se Não, G2.1 e G2.2 são ignorados completamente.
- **G2.1:** Exibida apenas quando G2 = Sim. Pergunta quais ambientes em reforma já têm reboco. Se nem todos tiverem, abre modal "Assumir Risco" e ativa gatilho `REFORM_SEM_REBOCO` (risco ALTO).
- **G2.2:** Exibida apenas quando G2 = Sim. Pergunta quais ambientes em reforma já têm revestimento. Se nem todos tiverem, ativa gatilho `REFORM_SEM_REVESTIMENTO` (gera CC). É suprimida se G2.1 já gerou risco (reboco ausente implica revestimento também ausente).
- **G3 atual:** "Os pontos elétricos/hidráulicos/gás já estão nas posições finais?" — permanece como está, mas será renumerado.
- **G4 atual:** "Algum ambiente terá rebaixo de teto?" — permanece como está, mas será renumerado.

---

## 3. Estado Desejado (como deve ficar)

### G2 — Nova pergunta (substitui G2 e G2.1)

**Pergunta:** "Todos os ambientes já possuem reboco (argamassa) finalizado nas paredes?"

**Fluxo quando a resposta é Sim:**
- Nada é ativado. O formulário avança normalmente para G3.

**Fluxo quando a resposta é Não:**
1. Abre o pop-up "Assumir Risco Alto" (mesmo componente Modal já existente no projeto).
2. O vendedor pode voltar ou assumir o risco.
3. Após assumir, abre a seleção de quais ambientes **não possuem** reboco (lista de todos os ambientes do projeto).
4. Os ambientes selecionados recebem classificação de risco ALTO.
5. O gatilho `REFORM_SEM_REBOCO` é ativado, gerando o CC de texto já existente:

> *CLIENTE CIENTE E DE ACORDO QUE MEDIÇÃO TÉCNICA DE AMBIENTE FOI REALIZADA COM AMBIENTE EM REFORMA INACABADA E QUE DEVERÁ RESPEITAR A ALÍNEA (I) DA CLÁUSULA TERCEIRA DO CONTRATO DE COMPRA E VENDA.*

### G3 — Nova pergunta (substitui G2.2)

**Pergunta:** "Todos os ambientes já possuem revestimento final (azulejo, porcelanato etc.) aplicado nas paredes?"

**Fluxo quando a resposta é Sim:**
- Nada é ativado. O formulário avança normalmente.

**Fluxo quando a resposta é Não:**
1. **Não há pop-up de assumir risco** para revestimento. A seleção abre diretamente.
2. O vendedor seleciona quais ambientes **não possuem** revestimento final.
3. O gatilho `REFORM_SEM_REVESTIMENTO` é ativado, gerando um **novo CC específico para revestimento** (texto diferente do CC de reboco):

> *CLIENTE CIENTE E DE ACORDO QUE A MEDIÇÃO TÉCNICA FOI REALIZADA SEM O REVESTIMENTO FINAL DAS PAREDES, E QUE A FINALIZAÇÃO DA OBRA APÓS A ELABORAÇÃO DO PROJETO PODERÁ GERAR INTERFERÊNCIAS E NECESSIDADE DE AJUSTES NA MONTAGEM.*

4. Sem classificação de risco ALTO adicional para esta pergunta isolada (comportamento idêntico ao atual de G2.2).

### G4 e G5 — Renumeração dos blocos existentes

Como G2.2 ocupa agora o lugar de G3, os blocos existentes sobem uma posição:
- O bloco atualmente chamado G3 (pontos elétricos/hidráulicos/gás) passa a ser **G4**.
- O bloco atualmente chamado G4 (rebaixo de teto) passa a ser **G5**.
- **A lógica interna desses blocos não muda** — apenas o rótulo visual e a referência nos textos de CC e PDF.

---

## 4. Arquivos Afetados

### Arquivos com mudanças substanciais

| Arquivo | Razão |
|---|---|
| `src/steps/StepPerguntasGlobais/BlocoReforma.jsx` | É o componente principal do bloco. Precisa ser reescrito para remover a pergunta G2, inverter a lógica de seleção (quem NÃO tem, não quem tem) e ajustar o fluxo do modal. |
| `src/domain/schema.js` | Deve remover os campos `g2_temReforma` e `g2_ambientes`. Os campos de G2.1 e G2.2 permanecem, mas com semântica invertida (passam a guardar "quem não tem" em vez de "quem tem"). |
| `src/domain/scoreEngine.js` | As condições que ativam `REFORM_SEM_REBOCO` e `REFORM_SEM_REVESTIMENTO` precisam ser simplificadas: a verificação de `g2_temReforma` é removida de ambas. |
| `src/domain/ccBuilder.js` | A supressão de G2.2 quando G2.1 está ativo precisa ser revisada — ver seção de Riscos. Os rótulos `perguntaOrigem` devem ser atualizados de 'G2.1'/'G2.2' para 'G2'/'G3'. O texto do CC de G3 deve ser trocado para o novo texto de revestimento. |
| `src/domain/checklistTextos.js` | Adicionar o novo texto de CC de revestimento (G3). O texto de reboco permanece. |
| `src/services/pdf.js` | Os textos das perguntas no PDF precisam ser atualizados para as novas formulações e novos rótulos. G3 e G4 precisam ter seus rótulos atualizados também. |
| `src/context/FormProvider.jsx` | Os cases do reducer que manipulam `g2_temReforma` e `g2_ambientes` devem ser removidos. Os cases de G2.1 e G2.2 continuam, possivelmente renomeados. |
| `src/steps/StepPerguntasGlobais/BlocoPontosUtilidades.jsx` | Apenas renumeração do rótulo visual: G3 → G4. Sem mudança de lógica. |
| `src/steps/StepPerguntasGlobais/BlocoRebaixo.jsx` | Apenas renumeração do rótulo visual: G4 → G5. Sem mudança de lógica. |

### Arquivos possivelmente afetados (verificar durante implementação)

| Arquivo | Razão |
|---|---|
| `src/steps/StepPerguntasGlobais/StepPerguntasGlobais.jsx` | Pode ter lógica de exibição condicional baseada em `g2_temReforma` para mostrar/esconder G2.1 e G2.2. Se sim, essa lógica deve ser removida. |
| `src/steps/StepRevisao/StepRevisao.jsx` | Pode exibir o resultado de G2/G2.1/G2.2 com rótulos específicos na tela de revisão. |

---

## 5. O Que Será Adicionado

- **Nova pergunta G2** com formulação universal (não condicional a "há reforma?").
- **Nova pergunta G3** com formulação universal.
- **Fluxo de seleção invertida:** em vez de selecionar quais ambientes têm a condição, o vendedor seleciona quais ambientes **não têm**. Isso muda a semântica da lista de checkboxes na tela.
- **Modal de risco exclusivo para reboco (G2):** o pop-up "Assumir Risco Alto" permanece apenas para a pergunta de reboco. Já para revestimento (G3), o acesso à seleção é direto, sem barreira de confirmação.
- **Novo CC exclusivo para G3 (revestimento ausente):** texto diferente e mais preciso do que o CC de reboco, eliminando a ambiguidade atual de usar o mesmo texto para dois problemas distintos. O novo texto deve ser adicionado em `checklistTextos.js`:

> *CLIENTE CIENTE E DE ACORDO QUE A MEDIÇÃO TÉCNICA FOI REALIZADA SEM O REVESTIMENTO FINAL DAS PAREDES, E QUE A FINALIZAÇÃO DA OBRA APÓS A ELABORAÇÃO DO PROJETO PODERÁ GERAR INTERFERÊNCIAS E NECESSIDADE DE AJUSTES NA MONTAGEM.*

---

## 6. O Que Será Removido

- **Pergunta G2 atual** ("Algum ambiente está em reforma?") — removida completamente da interface e do estado.
- **Campo `g2_temReforma`** no schema de estado — removido.
- **Campo `g2_ambientes`** no schema de estado — removido.
- **Toda a lógica condicional** que exibia G2.1 e G2.2 apenas quando `g2_temReforma === true` — removida do componente e do scoreEngine.
- **Verificação de `g2_temReforma`** nas condições dos gatilhos `REFORM_SEM_REBOCO` e `REFORM_SEM_REVESTIMENTO` no scoreEngine.
- **Cases do reducer** que manipulavam a antiga pergunta G2 (reforma yes/no) e seleção de ambientes em reforma.

---

## 7. O Que Não Será Tocado

- **Componente Modal genérico** (`src/components/Modal/Modal.jsx`) — é reaproveitado como está.
- **Bloco G1 — Iluminação** (`BlocoIluminacao.jsx`) — sem alterações.
- **Lógica interna de G4/G5** (pontos e rebaixo) — apenas renumeração de rótulos, sem mudança de comportamento.
- **Texto de CC de reboco** em `checklistTextos.js` — o texto do CC de reboco (G2) permanece o mesmo, sem alteração.
- **Lógica de score por ambiente** — os gatilhos de ambiente (granito, tanque, TV, cortineiro etc.) não são afetados.
- **Função de geração de PDF** (`pdf.js`) — apenas os textos de rótulo das perguntas globais são atualizados; a estrutura do PDF permanece.
- **Toda a camada de perguntas por ambiente** (`StepPerguntasPorAmbiente/`) — sem alterações.
- **Lógica de validação** (`formUtils.js`) — sem alterações.
- **Configurações de build e roteamento** (`vite.config.js`, `index.html`).
- **Estilos CSS** dos componentes que não mudam estruturalmente.

---

## 8. Premissas Assumidas

1. **A lista de ambientes para seleção em G2 e G3 é a mesma lista de ambientes já selecionados pelo cliente** no passo anterior (StepAmbientes), identificados pelos seus `instanceId`s. Não é uma lista estática — reflete exatamente o que o cliente escolheu.

2. **A seleção em G2 e G3 é de múltipla escolha**, podendo incluir nenhum, alguns ou todos os ambientes (embora selecionar todos contradiga a resposta "Não" e deva ser tratado como erro de validação — ver Riscos).

3. **G2 e G3 são perguntas independentes entre si e ambas sempre exibidas.** G3 não depende da resposta de G2 para aparecer. Um ambiente pode não ter reboco e outro não ter revestimento, e o vendedor preenche as duas perguntas em sequência, sem bloqueio.

4. **A supressão de CC é por ambiente.** Para cada ambiente marcado em G2 (sem reboco), o CC de revestimento desse mesmo ambiente é suprimido em G3. Para ambientes marcados apenas em G3, o CC de revestimento é gerado normalmente. Essa granularidade por ambiente é a correta dado que os dois CCs agora têm textos distintos.

5. **Os rótulos G4 e G5** nos blocos de pontos e rebaixo serão atualizados nos textos visíveis ao usuário. Se houver impacto em analytics ou logs externos rastreando os rótulos "G3"/"G4", isso está fora do escopo desta reestruturação.

6. **O estado existente em localStorage** de usuários com rascunho salvo ficará incompatível após a reestruturação, pois os campos `g2_temReforma` e `g2_ambientes` serão removidos. O comportamento do app ao carregar um rascunho incompatível deve ser tratado — a opção mais simples é limpar o rascunho ao detectar o campo obsoleto.

---

## 9. Riscos Identificados

### Risco 1 — Inversão da semântica dos campos de seleção (MÉDIO)

**Descrição:** Hoje `g2_1_ambientes` guarda quais ambientes **têm** reboco. Na nova versão, o campo equivalente deve guardar quais ambientes **não têm** reboco. Se o campo for reutilizado sem renomear, o código legado que lê esse campo interpretará os dados de forma invertida.

**Mitigação:** Renomear os campos no schema para nomes que reflitam a nova semântica (ex.: `g2_ambientesSemReboco`, `g3_ambientesSemRevestimento`) e atualizar todas as referências.

---

### Risco 2 — Refatoração da lógica de supressão de CC (MÉDIO)

**Descrição:** A supressão atual em `ccBuilder.js` é binária e global: se `REFORM_SEM_REBOCO` está ativo, `REFORM_SEM_REVESTIMENTO` é completamente ignorado. Na nova arquitetura, a supressão deve ser por ambiente — o CC de revestimento só é suprimido para os ambientes que também aparecem em G2. A decisão de produto confirmou esse comportamento, mas a implementação exige alterar a lógica de supressão em `ccBuilder.js` de uma verificação de gatilho global para uma comparação de listas de ambientes.

**Mitigação:** Em `ccBuilder.js`, substituir a verificação `suprimirRevestimento = tem('REFORM_SEM_REBOCO')` por uma comparação entre `g2_ambientesSemReboco` e `g3_ambientesSemRevestimento`. Somente os ambientes presentes em ambas as listas têm o CC de revestimento suprimido.

---

### Risco 3 — Rascunhos incompatíveis no localStorage (BAIXO)

**Descrição:** Qualquer usuário com um rascunho salvo antes do deploy terá campos `g2_temReforma` e `g2_ambientes` no estado que o novo código não reconhece. Isso pode causar comportamento indefinido ao carregar o rascunho.

**Mitigação:** Ao carregar o rascunho, verificar se o campo `g2_temReforma` existe. Se existir, tratar como versão antiga: descartar o rascunho e iniciar do zero, informando ao usuário.

---

### Risco 4 — Renumeração quebrando rastreabilidade de CCs no PDF (BAIXO)

**Descrição:** O PDF gerado inclui os rótulos das perguntas (G2, G2.1, G2.2, G3, G4). Se alguém tiver um PDF gerado antes da reestruturação e outro depois, os rótulos serão inconsistentes ao comparar documentos.

**Mitigação:** Fora do escopo técnico desta reestruturação. Documentar no changelog da versão que os rótulos foram alterados.

---

### Risco 5 — Validação de seleção obrigatória (BAIXO)

**Descrição:** Se o usuário responder "Não" em G2 ou G3 e assumir o risco, ele deve selecionar pelo menos um ambiente. Se não selecionar nenhum, o estado ficará inconsistente (resposta "Não" sem ambientes afetados).

**Mitigação:** Adicionar validação: se a resposta for "Não" e nenhum ambiente for selecionado, bloquear o avanço com mensagem de erro e rolar a tela até o campo.

---

## 10. Critérios de Aceitação

### Cenário 1 — Reboco: todos os ambientes estão OK

**Entrada:** Usuário responde "Sim" em G2 (todos têm reboco).  
**Resultado esperado:** Nenhum modal é exibido. Nenhum gatilho `REFORM_SEM_REBOCO` é ativado. Score não é afetado por G2. O formulário avança para G3.

---

### Cenário 2 — Reboco: alguns ambientes sem reboco, usuário volta do modal

**Entrada:** Usuário responde "Não" em G2. Modal "Assumir Risco Alto" é exibido. Usuário clica em "Voltar".  
**Resultado esperado:** Modal fecha. A resposta de G2 volta para o estado não respondido (null). Nenhum gatilho é ativado. Nenhum ambiente é marcado.

---

### Cenário 3 — Reboco: alguns ambientes sem reboco, usuário assume o risco

**Entrada:** Usuário responde "Não" em G2. Assume o risco. Seleciona dois ambientes (ex.: Dormitório 1 e Sala).  
**Resultado esperado:**
- Os dois ambientes selecionados são armazenados como "sem reboco".
- O gatilho `REFORM_SEM_REBOCO` é ativado.
- O CC de reforma aparece no relatório final.
- O score global é classificado como ALTO.
- No PDF, a pergunta G2 aparece como "Não", com os dois ambientes listados.

---

### Cenário 4 — Revestimento: todos os ambientes estão OK

**Entrada:** Usuário responde "Sim" em G3 (todos têm revestimento).  
**Resultado esperado:** Nenhum campo de seleção aparece. Nenhum gatilho `REFORM_SEM_REVESTIMENTO` é ativado. Formulário avança normalmente.

---

### Cenário 5 — Revestimento: alguns ambientes sem revestimento

**Entrada:** Usuário responde "Não" em G3. Nenhum modal é exibido. Seleção abre diretamente. Usuário seleciona um ambiente (ex.: Cozinha).  
**Resultado esperado:**
- Nenhum modal de risco é exibido (diferente do G2).
- O gatilho `REFORM_SEM_REVESTIMENTO` é ativado.
- O CC de **revestimento** aparece no relatório final com o novo texto específico: *"CLIENTE CIENTE E DE ACORDO QUE A MEDIÇÃO TÉCNICA FOI REALIZADA SEM O REVESTIMENTO FINAL DAS PAREDES..."*
- O CC de reboco (texto do G2) **não aparece** — são CCs distintos, e apenas o de revestimento foi ativado.
- No PDF, a pergunta G3 aparece como "Não", com a Cozinha listada.
- Score: o gatilho contribui com seus pontos (nível Alto), mas não necessariamente classifica como ALTO a menos que o total atinja o limiar.

---

### Cenário 6 — Combinação: reboco ausente em alguns ambientes, revestimento ausente em ambientes diferentes

**Entrada:** G2 = Não, risco assumido, Dormitório 1 selecionado. G3 = Não, Cozinha selecionada.  
**Resultado esperado:**
- Dois CCs são gerados, com textos distintos: o CC de reboco (texto existente) referente ao Dormitório 1, e o CC de revestimento (texto novo) referente à Cozinha.
- A supressão de CC **não ocorre** neste caso, pois os ambientes são diferentes.
- Score global é ALTO (gatilho de reboco é AltoDireto).

---

### Cenário 7 — Combinação: reboco e revestimento ausentes no mesmo ambiente

**Entrada:** G2 = Não, risco assumido, Sala selecionada. G3 = Não, Sala selecionada também.  
**Resultado esperado:**
- Apenas um CC é gerado: o **CC de reboco** (G2), que é o mais grave.
- O CC de revestimento (G3) é suprimido para esse ambiente, pois sem reboco é óbvio que o revestimento também está ausente — o CC de revestimento seria redundante e menos informativo.
- Score global é ALTO.

---

### Cenário 8 — Renumeração: verificar blocos G4 e G5

**Entrada:** Qualquer checklist completo.  
**Resultado esperado:**
- O bloco de pontos elétricos exibe o rótulo "G4" (não mais "G3").
- O bloco de rebaixo de teto exibe o rótulo "G5" (não mais "G4").
- O comportamento desses blocos é idêntico ao atual.
- No PDF, as perguntas aparecem com os novos rótulos G4 e G5.

---

## 11. Cenários de Erro

### Erro 1 — Usuário responde "Não" em G2, assume risco, mas não seleciona nenhum ambiente

**Resultado esperado:** O botão "Avançar" do formulário está bloqueado (ou exibe mensagem de validação). A mensagem indica que é necessário selecionar ao menos um ambiente sem reboco. A tela rola automaticamente até o campo com erro (comportamento já existente no projeto com `scrollUtils.js`).

---

### Erro 2 — Usuário responde "Não" em G3, mas não seleciona nenhum ambiente

**Resultado esperado:** Mesmo comportamento do Erro 1, mas para a seleção de revestimento.

---

### Erro 3 — Rascunho legado carregado no localStorage

**Resultado esperado:** O sistema detecta a presença de `g2_temReforma` no rascunho (campo obsoleto). Exibe a mensagem de rascunho incompatível e oferece opção de começar do zero. O rascunho incompatível é descartado sem causar erros visuais ou de lógica.

---

### Erro 4 — Ambientes removidos do projeto após responder G2 ou G3

**Contexto:** O usuário volta ao passo de seleção de ambientes e remove um ambiente que estava marcado como "sem reboco" ou "sem revestimento".  
**Resultado esperado:** Os `instanceId`s removidos são automaticamente limpos das listas `g2_ambientesSemReboco` e `g3_ambientesSemRevestimento`. Se a lista ficar vazia após a remoção, a resposta da pergunta (G2 ou G3) deve ser redefinida para null, forçando o vendedor a responder novamente. Esse comportamento provavelmente já existe para outros blocos — confirmar durante implementação.

---

## 12. Decisões de Produto (confirmadas)

### Decisão 1 — Renumeração: sim, G4 e G5

Os blocos de pontos elétricos e rebaixo de teto serão renumerados visualmente e no PDF: o atual G3 passa a G4, e o atual G4 passa a G5. Essa renumeração é obrigatória para manter a coerência da sequência após a inserção do novo G3.

### Decisão 2 — Supressão de CC: por ambiente, não global

A supressão do CC de revestimento se aplica apenas aos ambientes que também estão marcados como "sem reboco" em G2. Se um ambiente aparece em G2 (sem reboco) e também em G3 (sem revestimento), apenas o CC de reboco é gerado para ele — o de revestimento é suprimido por ser redundante. Para ambientes que aparecem somente em G3, o CC de revestimento é gerado normalmente.

### Decisão 3 — G3 aparece sempre, independente de G2

G3 (revestimento) é sempre exibido ao vendedor, sem nenhuma condição sobre a resposta de G2. O vendedor responde G2 e G3 de forma sequencial e independente. A resposta de G2 não oculta, pré-preenche, nem bloqueia G3.

---

*Fim do PRD. Implementação não deve iniciar sem aprovação explícita.*
