# PRD — Score por Ambiente (Score Global como Reflexo do Pior Ambiente)

**Status:** Aguardando aprovação  
**Data:** 2026-06-05  
**Projeto:** Checklist Dinâmica — By Arabi Planejados

---

## Objetivo

Reformular o cálculo do score global para que ele deixe de ser uma soma independente de pontos e passe a ser derivado exclusivamente do pior score entre os ambientes ativos do formulário.

Hoje o sistema acumula pontos de dois lugares diferentes — gatilhos das perguntas gerais (G1 a G4) que depositam no global diretamente, e gatilhos das perguntas por ambiente que depositam no ambiente individual. O score global final é a soma de todos esses pontos.

Após a melhoria, cada ponto de risco nasce obrigatoriamente em um ambiente. As perguntas gerais que envolvem seleção de ambientes (iluminação, reboco, revestimento, pontos elétricos/hidráulicos) passam a depositar seus pontos e seus "Clientes Cientes" nos ambientes que o usuário indicou ao responder cada pergunta. O score global passa a ser simplesmente o score do ambiente mais crítico — sem somar nada.

---

## Estado Atual do Sistema

Para entender o que muda, é preciso entender como o sistema funciona hoje:

### Como o score global é calculado hoje

No arquivo `src/domain/scoreEngine.js`, a função `calcularScore` faz dois cálculos separados:

**1. Calcula o score de cada ambiente individualmente:** Para cada ambiente selecionado, o motor avalia as perguntas daquele ambiente (granito, tanque, TV, eletros, rodapé, cortineiro, rebaixo) e acumula pontos naquele ambiente.

**2. Calcula os gatilhos globais:** Independentemente dos ambientes, o motor verifica quatro condições globais:
- **G1 — Iluminação externa:** se a resposta for Sim → ativa `ILUMINACAO_EXTERNA` → +2 pontos Médio no global
- **G2 — Sem reboco:** se a resposta for Não → ativa `REFORM_SEM_REBOCO` → risco AltoDireto no global (sem pontos, mas impõe classificação ALTO)
- **G3 — Sem revestimento:** se a resposta for Não → ativa `REFORM_SEM_REVESTIMENTO` → +3 pontos Alto no global
- **G4 — Pontos não definidos:** se a resposta for Não → ativa `PONTOS_INDEFINIDOS` → +2 pontos Médio no global

**3. Deriva o score global como soma:** `globalPontos = pontos dos gatilhos globais + soma dos pontos de todos os ambientes`. A classificação final do global resulta dessa soma total e da presença de qualquer risco Alto.

### Como os "Clientes Cientes" (CCs) são atribuídos hoje

No arquivo `src/domain/ccBuilder.js`, os CCs dos gatilhos G1, G2, G3 e G4 são criados com `escopo: 'Global'`. Isso significa que na tela de revisão e no PDF eles aparecem rotulados como "Global", sem vínculo a um ambiente específico.

Os CCs dos gatilhos por ambiente (granito, tanque, TV, rebaixo, etc.) já têm `escopo: instanceId` — ou seja, já são vinculados ao ambiente correto.

### Regra especial DIV-07

Quando G4 está ativo (pontos não definidos), o gatilho `TV_PONTO` de qualquer ambiente contribui 0 pontos em vez de 2. A lógica atual usa uma flag global `pontosIndefinidosAtivo` para aplicar essa regra a todos os ambientes de uma vez.

### O que as perguntas G1–G4 já coletam por ambiente

Todas essas perguntas já pedem ao usuário que selecione os ambientes afetados:
- G1: `g1_ambientes` — lista de instanceIds dos ambientes com iluminação externa
- G2: `g2_ambientesSemReboco` — lista de instanceIds dos ambientes sem reboco
- G3: `g3_ambientesSemRevestimento` — lista de instanceIds dos ambientes sem revestimento
- G4: `g3_ambientesPendentes` — lista de instanceIds dos ambientes com pontos pendentes

Esses dados já existem no estado do formulário. A melhoria usa essa informação para redirecionar o ponto de depósito.

---

## O que Muda

### 1. Os gatilhos globais deixam de existir como categoria separada

Os quatro gatilhos com `escopo: 'global'` na definição `GATILHOS_DEF` do scoreEngine — `REFORM_SEM_REBOCO`, `REFORM_SEM_REVESTIMENTO`, `ILUMINACAO_EXTERNA` e `PONTOS_INDEFINIDOS` — deixam de ser processados no bloco de "gatilhos globais".

Em vez disso, cada um passa a ser avaliado dentro do loop de ambientes, depositando seus pontos e flags somente nos ambientes que o usuário selecionou ao responder aquela pergunta.

### 2. Redistribuição dos pontos das perguntas gerais

**G1 — Iluminação externa:**  
Para cada ambiente listado em `g1_ambientes`, o sistema ativa `ILUMINACAO_EXTERNA_{instanceId}` com nível Médio e +2 pontos naquele ambiente.

**G2 — Sem reboco:**  
Para cada ambiente listado em `g2_ambientesSemReboco`, o sistema ativa `REFORM_SEM_REBOCO_{instanceId}` com nível AltoDireto (0 pontos, mas impõe classificação ALTO) naquele ambiente.

**G3 — Sem revestimento:**  
Para cada ambiente listado em `g3_ambientesSemRevestimento` que não esteja também em `g2_ambientesSemReboco` (a regra de supressão existente é preservada), o sistema ativa `REFORM_SEM_REVESTIMENTO_{instanceId}` com nível Alto e +3 pontos naquele ambiente.

**G4 — Pontos indefinidos:**  
Para cada ambiente listado em `g3_ambientesPendentes`, o sistema ativa `PONTOS_INDEFINIDOS_{instanceId}` com nível Médio e +2 pontos naquele ambiente.

**G5 — Rebaixo:**  
Já funciona por ambiente (`REBAIXO_{instanceId}`). Não muda.

### 3. Regra DIV-07 passa a operar por ambiente

A supressão do ponto de TV (contribuição 0 em vez de 2) não é mais aplicada globalmente. A regra só se aplica a um ambiente específico se esse ambiente estiver listado em `g3_ambientesPendentes` — ou seja, se G4 indicou que os pontos elétricos daquele ambiente ainda não estão na posição final.

### 4. O score global passa a ser o pior ambiente

Após calcular o score de todos os ambientes (incluindo os pontos redistribuídos de G1–G4), o score global é determinado assim:

- Se algum ambiente tiver classificação ALTO → o global é ALTO, e os `pontos` exibidos são os do ambiente ALTO com mais pontos
- Se nenhum ambiente for ALTO mas algum for MÉDIO → o global é MÉDIO, e os `pontos` são os do ambiente MÉDIO com mais pontos
- Se todos os ambientes forem BAIXO → o global é BAIXO, e os `pontos` são os do pior BAIXO
- Se não houver nenhum ambiente → o global é BAIXO com 0 pontos

O objeto `scoreGlobal` retornado pela função `calcularScore` continua com a mesma forma: `{ pontos, isAlto, classificacao }`. Apenas os valores mudam — agora refletem o pior ambiente em vez da soma.

### 5. Os CCs das perguntas gerais passam a ter escopo por ambiente

No `ccBuilder.js`, os CCs de G1, G2, G3 e G4 deixam de ter `escopo: 'Global'`. Em vez disso, são criadas entradas individuais por ambiente afetado, cada uma com `escopo: instanceId`.

Isso significa que na tela de revisão e no PDF, esses CCs passam a aparecer vinculados ao nome do ambiente, em vez de "Global".

A regra de supressão G2/G3 (se um ambiente já tem CC de falta de reboco, o CC de falta de revestimento não é gerado para ele) é preservada.

---

## O que Não Será Tocado

- Textos dos CCs (`src/domain/checklistTextos.js`) — são documentos legais e não podem mudar
- Componentes de perguntas das perguntas gerais: `BlocoIluminacao.jsx`, `BlocoReforma.jsx`, `BlocoPontosUtilidades.jsx`, `BlocoRebaixo.jsx`
- Todos os componentes de perguntas por ambiente (FormCozinha, FormDormitorio, FormBanheiro, FormHomeSalaOffice, FormOutros)
- O estado do formulário (`FormProvider.jsx`, `schema.js`) — nenhum campo é adicionado, renomeado ou removido
- O formato do objeto `scoreGlobal` retornado por `calcularScore` — `{ pontos, isAlto, classificacao }` — permanece o mesmo para garantir compatibilidade com `StepRevisao.jsx` e `pdf.js`
- O formato do objeto `scorePorAmbiente[instanceId]` — `{ pontos, isAlto, classificacao, gatilhos }` — permanece o mesmo
- A função `classificar` (thresholds de 4 e 8 pontos para MÉDIO e ALTO) — não muda
- A estrutura de exibição do resumo final (`StepRevisao.jsx`) — já funciona com o formato existente
- A geração de PDF (`services/pdf.js`) — já consome `scoreGlobal` pelo formato, sem dependência do método de cálculo
- A lógica de roteamento, navegação e persistência do formulário
- Os `AVISO`s (RODAPE_EXISTENTE, CORTINEIRO_NAOINSTALADO) — não são afetados

---

## Arquivos Afetados

| Arquivo | Tipo de mudança |
|---|---|
| `src/domain/scoreEngine.js` | Principal — redistribuição dos gatilhos globais e nova derivação do score global |
| `src/domain/ccBuilder.js` | Secundário — CCs de G1–G4 passam de escopo Global para escopo por ambiente |

---

## Arquivos que Serão Verificados mas Não Devem Precisar de Mudança

| Arquivo | Motivo da verificação |
|---|---|
| `src/steps/StepRevisao/StepRevisao.jsx` | Consome `scoreGlobal` pelo formato — deve continuar funcionando sem alteração |
| `src/services/pdf.js` | Consome `scoreGlobal` e `scorePorAmbiente` pelo formato — deve continuar funcionando |

---

## Premissas Assumidas

1. **Quando G1, G2, G3 ou G4 são respondidos com a condição ativa mas nenhum ambiente é selecionado,** os pontos e CCs correspondentes simplesmente não são depositados em nenhum lugar. O comportamento atual (que ativa o gatilho global mesmo sem seleção de ambiente) é considerado um caso inválido de estado e não precisa ser preservado.

2. **A identificação do "pior ambiente" usa a ordem de prioridade:** ALTO > MÉDIO > BAIXO. Dentro do mesmo nível de classificação, o ambiente com mais pontos é considerado o pior. Em caso de empate exato de pontos e classificação, o primeiro ambiente encontrado na lista dita o global — o resultado para o liberador é idêntico nos dois casos.

3. **A exibição de `pontos` no score global** passará a mostrar os pontos do pior ambiente, não a soma total de todos os pontos. Isso é intencionalmente diferente do comportamento atual e está alinhado com a nova lógica.

4. **A regra de supressão G2/G3** no `ccBuilder.js` continua funcionando: se um ambiente está em `g2_ambientesSemReboco` E em `g3_ambientesSemRevestimento`, somente o CC de G2 é gerado para aquele ambiente — o CC de G3 é suprimido.

5. **G5 (rebaixo) não muda.** Já funciona com `REBAIXO_{instanceId}` por ambiente e não precisa ser alterado.

6. **Os nomes dos IDs dos gatilhos de G1–G4 serão modificados** para seguir o padrão `{NOME_GATILHO}_{instanceId}` (ex: `REFORM_SEM_REBOCO_cozinha-0`), mantendo consistência com o padrão já usado pelos gatilhos por ambiente (GRANITO_RETIRAR, REBAIXO, etc.).

---

## Riscos Identificados

**Risco 1 — Estado incompleto de G1–G4**  
Se o usuário respondeu à pergunta (ex.: "há iluminação externa" = Sim) mas não selecionou os ambientes, a lista `g1_ambientes` estará vazia. Nesse cenário, nenhum ponto seria depositado após a mudança. O comportamento atual depositaria no global de qualquer forma. Impacto: possível subnotificação de risco em formulários com estado incompleto. Mitigação: verificar se as validações de etapa impedem avançar sem selecionar ambientes nessas perguntas.

**Risco 2 — Regra DIV-07 por ambiente**  
A mudança da regra DIV-07 de global para por-ambiente é mais precisa, mas é uma mudança de comportamento observável. Antes, qualquer TV em qualquer ambiente tinha 0 pontos quando G4 estava ativo. Depois, somente os ambientes especificamente listados em `g3_ambientesPendentes` têm seus pontos de TV zerados. Isso pode resultar em scores ligeiramente mais altos em alguns cenários. O novo comportamento é mais correto semanticamente, mas precisa ser validado.

**Risco 3 — Exibição de pontos no score global**  
A tela de revisão e a capa do PDF exibem `scoreGlobal.pontos`. Antes esse número era a soma de tudo (poderia ser 10, 15 pontos). Depois será o total do pior ambiente (provavelmente 2–8 pontos). Visualmente o número pode parecer menor. Isso é correto semanticamente, mas pode causar estranhamento inicial.

**Risco 4 — Formulários preenchidos em versão anterior**  
Se houver formulários salvos em `localStorage` que foram preenchidos com a lógica antiga, o recálculo automático usará a nova lógica ao abrir a revisão. O resultado pode ser diferente. Não há risco de dados corrompidos, mas o score exibido pode mudar.

---

## Critérios de Aceitação

Cada critério descreve um cenário completo com entrada e resultado esperado.

---

**AC-01 — Score global reflete o pior ambiente (ALTO)**  
Entrada: formulário com dois ambientes — Cozinha sem reboco (G2 = Não, Cozinha selecionada) e Dormitório sem rodapé (1 ponto Baixo).  
Esperado: score global = ALTO, correspondendo ao score da Cozinha. O score do Dormitório é BAIXO e não altera o global.

---

**AC-02 — Score global reflete o pior ambiente (MÉDIO)**  
Entrada: formulário com dois ambientes — Dormitório sem rodapé (1 ponto) e Home com TV sem ponto final (2 pontos), nenhum ambiente com risco ALTO.  
Esperado: score global = MÉDIO (4+ pontos) somente se o pior ambiente atingir 4 pontos. Se o pior tiver 2 pontos, o global é BAIXO. O global nunca é a soma dos dois ambientes juntos.

---

**AC-03 — G1 deposita no ambiente selecionado**  
Entrada: G1 = Sim, somente "Cozinha" selecionada como ambiente com iluminação externa.  
Esperado: score da Cozinha inclui +2 pontos Médio. Score do Dormitório (se houver) não é afetado por G1. CC de iluminação aparece com escopo "Cozinha", não "Global".

---

**AC-04 — G1 com múltiplos ambientes selecionados**  
Entrada: G1 = Sim, "Cozinha" e "Dormitório Casal" selecionados.  
Esperado: ambos os ambientes recebem +2 pontos Médio de G1. CCs de iluminação aparecem uma vez para cada ambiente.

---

**AC-05 — G2 deposita risco ALTO no ambiente sem reboco**  
Entrada: G2 = Não, "Banheiro" selecionado como ambiente sem reboco.  
Esperado: score do Banheiro = ALTO (via AltoDireto). Score global = ALTO (pior ambiente). CC de reboco aparece com escopo "Banheiro".

---

**AC-06 — G3 deposita no ambiente sem revestimento, respeitando supressão**  
Entrada: G2 = Não (Cozinha sem reboco) e G3 = Não (Cozinha e Dormitório sem revestimento).  
Esperado: Cozinha recebe risco ALTO de G2 e não recebe CC de G3 (suprimido). Dormitório recebe +3 pontos Alto de G3 e CC de revestimento com escopo "Dormitório". O CC de G3 aparece para o Dormitório, não para a Cozinha.

---

**AC-07 — G4 deposita no ambiente com pontos pendentes**  
Entrada: G4 = Não, "Home" selecionado como ambiente com pontos pendentes.  
Esperado: score do Home inclui +2 pontos Médio de G4. CC de pontos indefinidos aparece com escopo "Home".

---

**AC-08 — Regra DIV-07 opera por ambiente**  
Entrada: G4 = Não, somente "Dormitório" em `g3_ambientesPendentes`. Formulário tem também "Home" com TV sem ponto final.  
Esperado: TV do Dormitório (se houver TV sem ponto) contribui 0 pontos (DIV-07 ativo para esse ambiente). TV do Home contribui 2 pontos normalmente (DIV-07 não se aplica ao Home nesse cenário).

---

**AC-09 — G5 (rebaixo) continua funcionando sem mudança**  
Entrada: G5 = Sim, "Dormitório" com rebaixo de 12 cm.  
Esperado: comportamento idêntico ao atual — +1 ponto Baixo no Dormitório, CC com "12CM" no texto, escopo "Dormitório".

---

**AC-10 — Score global com apenas um ambiente**  
Entrada: formulário com apenas "Cozinha" e sem nenhum risco.  
Esperado: score global = BAIXO (0 pontos), idêntico ao score da Cozinha.

---

**AC-11 — Score global sem ambientes**  
Entrada: formulário sem nenhum ambiente selecionado (caso de borda).  
Esperado: score global = BAIXO (0 pontos). Nenhum CC gerado.

---

**AC-12 — PDF continua funcionando**  
Entrada: qualquer formulário com G1–G4 ativos.  
Esperado: o PDF é gerado sem erros. A capa exibe o score global com a classificação correta. O Resumo Executivo lista os CCs de alto e médio risco com os nomes dos ambientes (não "Global"). A Checklist Completa mostra os CCs inline com os ambientes corretos.

---

**AC-13 — Nenhuma mudança visível quando nenhum gatilho está ativo**  
Entrada: formulário com G1=Não, G2=Sim, G3=Sim, G4=Sim e nenhum risco por ambiente.  
Esperado: score global = BAIXO (0 pontos), idêntico ao comportamento atual.

---

**Cenário de erro — G1 ativo sem ambientes selecionados**  
Entrada: `g1_temIluminacaoExterna = true` mas `g1_ambientes = []`.  
Esperado: nenhum gatilho de iluminação é ativado, nenhum CC é gerado. O score não é afetado. O sistema não lança erro.

---

**Cenário de erro — G2 ativo sem ambientes selecionados**  
Entrada: `g2_temReboco = false` mas `g2_ambientesSemReboco = []`.  
Esperado: nenhum gatilho de reboco é ativado, nenhum CC é gerado. O score não é afetado. O sistema não lança erro.
