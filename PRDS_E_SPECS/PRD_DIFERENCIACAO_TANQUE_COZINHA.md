# PRD — Diferenciação de Tipo de Tanque na Cozinha (Tradicional vs. Cuba-Tanque)

**Status:** Aguardando aprovação
**Data:** 2026-07-16
**Projeto:** Checklist Dinâmica — By Arabi Planejados
**Autor:** Claude (gerado após pesquisa da base de código)

---

## 1. Objetivo

Corrigir um erro funcional no fluxo de perguntas da Cozinha: hoje, sempre que o cliente informa que "haverá móveis na região do tanque", o sistema gera um CC (Cliente Ciente) pedindo a remoção do tanque existente — mesmo quando o tanque em questão é uma **cuba-tanque embutida no granito/bancada**, caso em que a estrutura ao redor é intencional (serve de apoio) e não deve ser removida.

A melhoria adiciona uma pergunta de diferenciação logo após "Existe tanque no local?", perguntando se o tanque é:

1. **Tradicional** — porcelana ou plástico, com coluna que vai até o piso; ou
2. **Cuba-tanque** — embutida no granito/bancada.

Regra de negócio final:

- **Tanque tradicional** → mantém o comportamento atual do sistema: a pergunta "Haverá móveis na região do tanque?" continua sendo feita e, se a resposta for "Sim", o CC de remoção do tanque continua sendo gerado.
- **Cuba-tanque** → o sistema não deve gerar o CC de remoção nesse ponto do fluxo, pois a estrutura ao redor é intencional.

---

## 2. Nomenclatura confirmada no código (pesquisa da base de código)

Antes de detalhar a mudança, seguem as nomenclaturas exatas encontradas no projeto, para eliminar ambiguidade:

### 2.1 "CC" significa "Cliente Ciente"

O termo **CC** já é usado literalmente na base de código com o significado **"Cliente Ciente"**, confirmado em `PRDS_E_SPECS/PRD_CHECKLIST_DINAMICA_CLIENTE.md` (linha 12): *"o sistema calcula automaticamente um score de risco, gera os textos de 'Cliente Ciente' (CC) aplicáveis..."*. Não existe no código nem na documentação o termo "Comunicado de Compra". Na interface (`FormCozinha.jsx`, `FormOutros.jsx`) e no PDF (`especificacao-checklist-dinamica.md`), o rótulo usado é sempre `CC:` seguido do texto legal. No domínio (`ccBuilder.js`), cada item gerado tem um atributo `tipo` com valor `'CC'` (para itens de risco) ou `'AVISO'` (para avisos informativos que não geram risco). Este PRD usa "CC" nesse sentido em todo o documento.

### 2.2 Não existe o termo "madeiramento" no código

O pedido original descreve a pergunta problemática como sendo sobre "madeiramento na região do tanque". Uma busca em toda a base de código e na documentação (`especificacao-checklist-dinamica.md`) não encontrou nenhuma ocorrência da palavra "madeiramento". A única pergunta de acompanhamento existente após "Existe tanque no local?" é:

> **"Haverá móveis na região do tanque?"** — campo de resposta `tanqueMoveis` no estado do ambiente.

Essa é a pergunta que, quando respondida "Sim", gera o CC de remoção do tanque. Este PRD assume que **"pergunta de madeiramento" no pedido do usuário se refere a esta pergunta (o campo `tanqueMoveis`)** — é a única pergunta do fluxo de tanque que gera CC de remoção, e o cenário descrito (cuba-tanque com estrutura de apoio intencional ao redor) só faz sentido aplicado a ela. Essa suposição está registrada na seção "Premissas assumidas" para confirmação antes da implementação.

### 2.3 Estrutura de pergunta condicional já usada no projeto

O projeto não usa uma "engine" de perguntas condicionais genérica. Cada tipo de ambiente tem um componente de formulário próprio (ex.: `FormCozinha.jsx`) que segue sempre o mesmo padrão:

- Lê a resposta atual do ambiente a partir do contexto do formulário (hook `useFormContext`).
- Renderiza uma sub-pergunta de forma condicional, apenas quando a pergunta "pai" foi respondida de determinada forma.
- Despacha a resposta através de uma ação genérica do reducer, do tipo "definir resposta do ambiente", identificando o campo alterado e o novo valor.
- Usa um helper local, presente em cada formulário, que renderiza os dois botões de uma escolha binária. Esse helper já aceita rótulos customizados para os dois botões, além do padrão "Sim"/"Não" — embora hoje nenhuma pergunta da Cozinha use rótulos customizados, todas usam o padrão "Sim"/"Não". Isso é relevante porque a nova pergunta de tipo de tanque não é um "Sim/Não" no sentido literal, mas pode reaproveitar exatamente esse mesmo helper com rótulos customizados, sem exigir um novo padrão de UI.
- A regra de negócio que decide se um CC deve ou não ser gerado **não fica no componente de formulário** — o formulário apenas grava a resposta bruta e exibe o texto do CC localmente como pré-visualização. Quem decide se o gatilho do CC entra na lista oficial é o motor de score (arquivo de cálculo de score do ambiente), e quem monta o texto final do CC a partir do gatilho é o construtor de CCs (arquivo dedicado a essa montagem).

---

## 3. Problema atual — onde a pergunta e o CC vivem hoje no código

### 3.1 Pergunta e sub-pergunta no formulário

No arquivo `src/steps/StepPerguntasPorAmbiente/FormCozinha.jsx` (bloco "Tanque", por volta das linhas 76 a 90), a pergunta "Existe tanque no local?" é exibida com os dois botões padrão de Sim/Não. Quando a resposta é "Sim", uma sub-pergunta aparece logo abaixo: "Haverá móveis na região do tanque?". Quando essa sub-pergunta é respondida "Sim", um texto de pré-visualização do CC aparece imediatamente na tela, prefixado por "CC:". Hoje, esse texto de pré-visualização aparece sempre que há tanque e há móveis na região — não importa se o tanque é tradicional ou uma cuba-tanque embutida no granito.

### 3.2 Geração do gatilho que decide o CC

No arquivo `src/domain/scoreEngine.js` (por volta das linhas 65 a 71), existe um bloco de código dedicado ao tanque, que se aplica igualmente aos ambientes do tipo Cozinha e Outros. A regra hoje é simples: sempre que a resposta "Existe tanque no local?" for "Sim" e a resposta "Haverá móveis na região do tanque?" também for "Sim", o sistema registra o gatilho de remoção de tanque para aquele ambiente, com nível de risco "Médio" e 2 pontos somados ao score do ambiente. Esse bloco trata Cozinha e Outros na mesma condição, sem qualquer diferenciação de tipo de tanque.

### 3.3 Montagem do texto final do CC

No arquivo `src/domain/ccBuilder.js` (por volta das linhas 108 a 117), quando o gatilho de remoção de tanque está presente na lista de gatilhos ativos, o sistema monta um item de CC com nível "MÉDIO", vinculado ao ambiente correspondente, usando o texto fixo de remoção de tanque e identificando a pergunta de origem como "P2.1" — a mesma numeração usada na documentação funcional do projeto (`especificacao-checklist-dinamica.md`) para a sub-pergunta de móveis na região do tanque.

O texto do CC, definido em `src/domain/checklistTextos.js` (linhas 4-5), é:

> "CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR TANQUE EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO."

Este CC só faz sentido para tanque tradicional (peça avulsa, removível). Para cuba-tanque embutida no granito, não existe um "tanque" avulso a ser retirado — a instrução como está pode confundir a equipe de liberação e o cliente.

### 3.4 Validação do formulário

No arquivo `src/steps/StepPerguntasPorAmbiente/formUtils.js` (por volta das linhas 127 a 136), dentro da função que valida o formulário antes de avançar de etapa, existe uma verificação que exige resposta para "Existe tanque no local?" e, quando a resposta for "Sim", exige também resposta para "Haverá móveis na região do tanque?". Essa verificação está dentro de um bloco compartilhado entre Cozinha e Outros — a mesma condição valida os dois tipos de ambiente.

### 3.5 Exibição no PDF

No arquivo `src/services/pdf.js` (por volta das linhas 357 a 369), dentro do bloco de perguntas específicas do ambiente, o gerador de PDF escreve a pergunta "Existe tanque no local?" com a resposta registrada e, quando a resposta for "Sim", escreve também a pergunta "Haverá móveis na região do tanque?" com sua resposta, seguida do CC de remoção de tanque, se ele tiver sido gerado para aquele ambiente. Esse trecho também é compartilhado entre Cozinha e Outros.

### 3.6 Achado importante: "Outros" tem exatamente a mesma estrutura e o mesmo problema

O arquivo `src/steps/StepPerguntasPorAmbiente/FormOutros.jsx` (por volta das linhas 99 a 113) reproduz exatamente a mesma pergunta "Existe tanque no local?" seguida de "Haverá móveis na região do tanque?", usando o mesmo texto de CC de remoção de tanque e os mesmos nomes de campo de resposta do ambiente Cozinha. Ou seja, o ambiente "Outros" tem exatamente o mesmo erro funcional descrito no pedido, caso o usuário cadastre um tanque nesse tipo de ambiente.

O pedido do usuário menciona explicitamente apenas a Cozinha. Este PRD trata **somente da Cozinha**, conforme solicitado, e registra esse achado na seção "Riscos identificados" como um problema residual conhecido, não coberto por esta melhoria.

---

## 4. Relação com os arquivos e padrões existentes

- O projeto é uma SPA em React 18 + Vite, sem biblioteca de formulários ou de máquina de estados — o estado do formulário inteiro é controlado por um único reducer central (`src/context/FormProvider.jsx`), com ações despachadas por cada componente de formulário. A melhoria deve seguir esse mesmo padrão, sem introduzir dependências novas.
- O padrão de "pergunta condicional que gera CC" já está estabelecido e é repetido em várias perguntas do projeto (granito → pergunta de adaptação de móveis, tanque → pergunta de móveis na região, TV → pergunta de ponto elétrico na posição final, cortineiro → pergunta de instalação): (1) campo bruto na resposta do ambiente, (2) sub-pergunta exibida condicionalmente no formulário, (3) gatilho calculado no motor de score, (4) texto final montado pelo construtor de CCs a partir do gatilho, (5) validação no arquivo de utilitários do formulário, (6) exibição espelhada no gerador de PDF. A nova pergunta de tipo de tanque deve seguir este mesmo padrão de ponta a ponta, apenas adicionando uma condição extra ao gatilho já existente — não um gatilho novo.
- Já existe no projeto um exemplo de campo de escolha com mais de duas opções textuais: o campo de tipo de cuba do Banheiro, que usa uma lista fixa de opções selecionadas por botões no estilo "chip". Esse é um padrão alternativo já existente no projeto, mas não é o mais simples para uma escolha binária como a solicitada.
- O padrão mais simples e mais aderente ao que já existe na Cozinha é reaproveitar o helper de escolha binária já declarado dentro de `FormCozinha.jsx`, que já aceita rótulos customizados nos dois botões — hoje não utilizados com texto customizado em nenhuma pergunta da Cozinha, mas prontos para isso. Isso evita criar um novo componente de interface (como uma lista suspensa ou uma lista de "chips") só para uma escolha entre dois itens.

---

## 5. Arquivos afetados

### Arquivos a alterar na implementação futura

| Arquivo | Tipo de alteração |
|---|---|
| `src/domain/schema.js` | Adicionar novo campo de resposta ao objeto de valores padrão da Cozinha, iniciado como não respondido |
| `src/steps/StepPerguntasPorAmbiente/FormCozinha.jsx` | Adicionar a nova pergunta de tipo de tanque logo após "Existe tanque no local?" e antes de "Haverá móveis na região do tanque?"; ocultar a pergunta de móveis quando o tipo for cuba-tanque |
| `src/steps/StepPerguntasPorAmbiente/formUtils.js` | Adicionar validação da nova pergunta (obrigatória quando há tanque, apenas para Cozinha) e ajustar a obrigatoriedade da pergunta de móveis para não bloquear o avanço quando o tipo for cuba-tanque |
| `src/domain/scoreEngine.js` | Adicionar a condição de tipo de tanque ao gatilho de remoção de tanque, apenas para o ramo da Cozinha, preservando o comportamento atual do ramo "Outros" |
| `src/services/pdf.js` | Exibir a nova pergunta e resposta no bloco da Cozinha no PDF, na mesma posição em que aparece no formulário, e ocultar a pergunta/CC de móveis quando o tipo for cuba-tanque |

### Arquivos verificados, mas não previstos para alteração

| Arquivo | Motivo |
|---|---|
| `src/steps/StepPerguntasPorAmbiente/FormOutros.jsx` | Ambiente "Outros" está fora do escopo deste pedido, mesmo tendo a mesma estrutura de tanque (ver seção 3.6 e riscos) |
| `src/domain/ccBuilder.js` | Já monta o CC a partir do gatilho de remoção de tanque; a supressão acontece antes, no cálculo do gatilho no motor de score, então este arquivo não precisa mudar |
| `src/domain/checklistTextos.js` | O texto legal do CC de remoção de tanque não muda; continua válido para o caso tradicional |
| `src/steps/StepRevisao/StepRevisao.jsx` | Consome a lista final de CCs já filtrada; não precisa saber sobre tipo de tanque |
| `src/context/FormProvider.jsx` | O reducer é genérico; não precisa de ação nova nem de lógica específica de tanque |
| `src/domain/ambientes.js` | Catálogo de ambientes não muda; nenhum ambiente novo é criado |
| `src/steps/StepPerguntasPorAmbiente/FormBanheiro.jsx`, `FormDormitorio.jsx`, `FormHomeSalaOffice.jsx` | Não têm pergunta de tanque |
| Valores padrão do ambiente "Outros" em `src/domain/schema.js` | Fora do escopo (ver seção 3.6) |

---

## 6. O que será adicionado

1. Um novo campo de resposta no objeto do ambiente da Cozinha, iniciado como não respondido, representando o tipo de tanque informado pelo cliente. Sugestão de nome, seguindo a convenção de campos booleanos já usada no projeto (como os campos que registram se o granito será adaptado ou se há móveis na região do tanque): **`tanqueEmbutido`**, onde um valor representaria "cuba-tanque embutida no granito/bancada" e o outro representaria "tanque tradicional (porcelana/plástico, com coluna até o piso)". O nome exato pode ser ajustado na fase de especificação técnica, desde que a semântica dos dois valores seja preservada.

2. Uma nova pergunta no formulário da Cozinha, exibida somente quando "Existe tanque no local?" for respondida "Sim", posicionada entre essa pergunta e "Haverá móveis na região do tanque?". A pergunta apresenta duas opções com os textos completos:
   - "Tanque tradicional (porcelana ou plástico, com coluna até o piso)"
   - "Cuba-tanque (embutida no granito/bancada)"

3. Uma condição adicional no cálculo do gatilho de remoção de tanque, no motor de score, válida apenas para o ramo da Cozinha: o gatilho (e, por consequência, o CC e os 2 pontos de risco Médio) só é gerado quando o tanque for do tipo tradicional **e** houver móveis na região. Quando o tipo for cuba-tanque, o gatilho não é gerado, independentemente da resposta sobre móveis.

4. Validação obrigatória da nova pergunta: quando "Existe tanque no local?" for "Sim" em um ambiente de Cozinha, o usuário não pode avançar para a próxima etapa sem responder o tipo de tanque — seguindo o mesmo padrão de erro já usado nas demais perguntas condicionais do formulário.

5. Exibição da nova pergunta e da resposta escolhida no bloco da Cozinha do PDF, na mesma posição em que aparece no formulário (entre "Existe tanque no local?" e "Haverá móveis na região do tanque?").

---

## 7. O que será removido

1. A obrigatoriedade de responder "Haverá móveis na região do tanque?" quando o tipo de tanque for cuba-tanque — essa sub-pergunta deixa de ser exibida e deixa de ser exigida nesse cenário, tanto no formulário quanto no PDF.

2. A geração do CC de remoção de tanque e dos 2 pontos de risco associados, exclusivamente para o cenário de cuba-tanque na Cozinha. O CC continua sendo gerado normalmente para tanque tradicional, exatamente como hoje.

Nenhum texto legal existente é removido ou reescrito — o texto do CC de remoção de tanque permanece o mesmo, apenas passa a ser usado de forma condicionada ao tipo de tanque.

---

## 8. O que não será tocado

- O ambiente "Outros" (formulário próprio e os ramos correspondentes dentro do motor de score, da validação e do gerador de PDF) — mantém exatamente o comportamento atual, incluindo o mesmo erro funcional descrito na seção 3.6, que fica fora do escopo deste PRD.
- A pergunta "Existe tanque no local?" em si — continua exatamente como está, com as mesmas opções "Sim"/"Não".
- A pergunta "Haverá móveis na região do tanque?" para o caso de tanque tradicional — continua com o mesmo texto, mesmo comportamento e mesmo CC.
- O texto legal do CC de remoção de tanque, em `checklistTextos.js`.
- As demais perguntas da Cozinha (granito, eletrodomésticos, observações).
- O motor de pontuação para os demais gatilhos (perguntas globais G1 a G5, granito, TV, eletros, eletrônicos, rodapé, cortineiro).
- A tela de Revisão e o Resumo Executivo do PDF — continuam consumindo a lista de CCs já pronta, sem qualquer lógica nova sobre tipo de tanque.
- O reducer genérico do `FormProvider.jsx` e o mecanismo de rascunho salvo no armazenamento local do navegador.
- Qualquer outro tipo de ambiente (Banheiro, Dormitório, Home/Sala/Office).
- O conteúdo de `node_modules` e de artefatos gerados de build.

---

## 9. Premissas assumidas

1. **Interpretação do termo "madeiramento".** O pedido descreve a pergunta problemática como sendo sobre "madeiramento na região do tanque", mas o termo não existe no código nem na documentação. Assume-se que essa pergunta é a já existente "Haverá móveis na região do tanque?" (campo de resposta correspondente), pois é a única pergunta do fluxo de tanque que gera CC de remoção e o cenário descrito só se aplica a ela. Esta suposição deve ser confirmada antes da implementação.

2. **Escopo restrito à Cozinha.** Apesar de o ambiente "Outros" ter a mesma estrutura e o mesmo problema (seção 3.6), esta melhoria altera apenas o formulário, a validação, o motor de score e o PDF da Cozinha, conforme solicitado explicitamente no pedido.

3. **Quando cuba-tanque é selecionada, a pergunta "Haverá móveis na região do tanque?" deixa de ser exibida** (em vez de continuar aparecendo, porém sem gerar CC). Assume-se essa abordagem porque, para uma cuba-tanque embutida no granito, a pergunta sobre "móveis na região do tanque" perde sentido prático — não existe um tanque avulso a ser cercado ou removido. Caso essa suposição não reflita a intenção do negócio, a alternativa (manter a pergunta visível, apenas sem gerar CC) deve ser indicada antes da implementação.

4. O novo campo de resposta é obrigatório sempre que "Existe tanque no local?" for "Sim" na Cozinha, seguindo o mesmo padrão de obrigatoriedade das demais sub-perguntas do projeto.

5. O novo campo é do tipo booleano (duas opções fixas, mutuamente exclusivas), iniciado como não respondido, seguindo o padrão de campos como a adaptação do granito e a presença de móveis na região do tanque, e não uma lista de múltiplas opções como o tipo de cuba do Banheiro.

6. Rascunhos já salvos no armazenamento local do navegador antes desta mudança não terão o novo campo preenchido. Ao reabrir um rascunho com um ambiente de Cozinha que já tenha "Existe tanque no local?" respondido "Sim", o novo campo aparecerá como não respondido e o usuário precisará escolher o tipo de tanque antes de avançar novamente por aquele ambiente — mesmo padrão de comportamento já aceito em melhorias anteriores do projeto (ver `PRDS_E_SPECS/PRD_POLEGADAS_TV.md`, risco 1).

7. Não é necessário criar um novo tipo de CC nem um novo nível de risco. A mudança é uma condição adicional sobre o gatilho já existente de remoção de tanque, mantendo o mesmo nível "Médio" e os mesmos 2 pontos quando aplicável.

---

## 10. Riscos identificados

**Risco 1 — Divergência de terminologia ("madeiramento" vs. "móveis").**
Se a pergunta que o solicitante tinha em mente não for a pergunta "Haverá móveis na região do tanque?", a implementação resolveria o problema errado. Mitigação: confirmar a Premissa 1 com o solicitante antes de iniciar a implementação.

**Risco 2 — Inconsistência entre Cozinha e Outros.**
Após esta melhoria, a Cozinha terá o comportamento corrigido, mas o ambiente "Outros" continuará gerando o CC de remoção de tanque mesmo para cuba-tanque, pois usa os mesmos nomes de campo de resposta sem o novo campo de diferenciação. Um cliente que cadastrar um ambiente "Outros" com cuba-tanque ainda receberá o CC incorreto. Mitigação: registrar este ponto como melhoria futura, fora do escopo atual.

**Risco 3 — Lógica compartilhada entre Cozinha e Outros no motor de score e na validação.**
Tanto o gatilho de score quanto a validação hoje tratam Cozinha e Outros na mesma condição. A implementação precisa adicionar a condição do novo campo apenas para o ramo da Cozinha, sem alterar o comportamento do ramo "Outros". Um descuido aqui pode quebrar a validação ou o score de "Outros", que não deveria mudar. Mitigação: revisar cuidadosamente os dois arquivos ao implementar, garantindo que o ramo "Outros" continue idêntico ao atual.

**Risco 4 — Pergunta "Haverá móveis" some sem aviso ao alternar o tipo de tanque.**
Se o usuário responder "Haverá móveis na região do tanque?" com "Sim" (gerando o CC), e depois voltar e mudar a resposta de "tradicional" para "cuba-tanque", a pergunta de móveis (e o CC) deixam de aparecer imediatamente. Isso é o comportamento correto e esperado, mas precisa ser validado visualmente para garantir que o CC não fique "preso" na tela por engano.

**Risco 5 — Rascunhos salvos no armazenamento local do navegador.**
Como descrito na Premissa 6, formulários de Cozinha já em andamento, com tanque já respondido, exigirão que o usuário responda a nova pergunta antes de conseguir avançar novamente por aquele ambiente. Impacto baixo, mesmo padrão já aceito em melhorias anteriores.

**Risco 6 — Nome do campo em conflito conceitual com o campo de cuba do Banheiro.**
O Banheiro já tem um campo que registra o tipo de cuba do banheiro (Embutir, Semi-encaixe, Sobrepor, Apoio, Esculpida), que é um conceito totalmente diferente da "cuba-tanque" desta melhoria. Não há conflito técnico, pois os campos pertencem às respostas de tipos de ambiente diferentes, mas o nome pode causar confusão para quem for implementar ou manter o código depois. Mitigação: evitar nomear o novo campo apenas como "cuba" ou similar; usar um nome que deixe claro que se trata do tipo de tanque (ex.: `tanqueEmbutido` ou `tanqueTipo`).

---

## 11. Critérios de aceitação

### CA-01 — Nova pergunta aparece após "Existe tanque no local?"

Entrada: usuário está no formulário de um ambiente de Cozinha e responde "Sim" para "Existe tanque no local?".

Resultado esperado: imediatamente abaixo, antes da pergunta "Haverá móveis na região do tanque?", aparece a nova pergunta com as duas opções: "Tanque tradicional (porcelana ou plástico, com coluna até o piso)" e "Cuba-tanque (embutida no granito/bancada)". Nenhuma das duas opções vem pré-selecionada.

### CA-02 — Nova pergunta não aparece quando não há tanque

Entrada: usuário responde "Não" para "Existe tanque no local?" em um ambiente de Cozinha.

Resultado esperado: nem a pergunta de tipo de tanque, nem a pergunta de móveis aparecem. O comportamento é idêntico ao atual.

### CA-03 — Tanque tradicional com móveis gera CC (comportamento preservado)

Entrada: "Existe tanque no local?" = Sim; tipo de tanque = Tradicional; "Haverá móveis na região do tanque?" = Sim.

Resultado esperado: o CC "CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR TANQUE EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO." aparece no preview do formulário, na tela de Revisão, no Resumo Executivo do PDF e no bloco da Cozinha no PDF — exatamente como acontece hoje antes desta melhoria. O score do ambiente soma os 2 pontos de risco Médio do gatilho de tanque.

### CA-04 — Tanque tradicional sem móveis não gera CC (comportamento preservado)

Entrada: "Existe tanque no local?" = Sim; tipo de tanque = Tradicional; "Haverá móveis na região do tanque?" = Não.

Resultado esperado: nenhum CC de remoção de tanque é gerado, em nenhum lugar do sistema. Comportamento idêntico ao atual.

### CA-05 — Cuba-tanque nunca gera o CC de remoção

Entrada: "Existe tanque no local?" = Sim; tipo de tanque = Cuba-tanque.

Resultado esperado: a pergunta "Haverá móveis na região do tanque?" não é exibida no formulário. Nenhum CC de remoção de tanque é gerado para este ambiente — nem no preview do formulário, nem na tela de Revisão, nem no Resumo Executivo do PDF, nem no bloco da Cozinha no PDF. O score do ambiente não soma os 2 pontos de risco Médio do gatilho de tanque.

### CA-06 — Alternância entre tradicional e cuba-tanque com CC já visível

Entrada: usuário responde tipo de tanque = Tradicional, depois "Haverá móveis" = Sim (CC aparece), e em seguida volta e muda o tipo de tanque para Cuba-tanque.

Resultado esperado: assim que "Cuba-tanque" é selecionada, a pergunta "Haverá móveis na região do tanque?" e o CC associado desaparecem imediatamente da tela, sem exigir recarregar a página.

### CA-07 — Bloqueio de avanço sem responder o tipo de tanque

Entrada: usuário responde "Sim" para "Existe tanque no local?", não seleciona nenhuma opção na nova pergunta de tipo de tanque, e tenta avançar para o próximo ambiente ou etapa.

Resultado esperado: o avanço é bloqueado, com mensagem de erro do tipo "Selecione uma opção" exibida junto à nova pergunta, seguindo o mesmo padrão visual das demais mensagens de erro do formulário.

### CA-08 — Bloqueio de avanço sem responder sobre móveis, apenas quando tradicional

Entrada: usuário responde "Sim" para "Existe tanque no local?", seleciona "Tradicional", não responde "Haverá móveis na região do tanque?", e tenta avançar.

Resultado esperado: o avanço é bloqueado com erro na pergunta de móveis — mesmo comportamento de hoje.

### CA-09 — Nenhum bloqueio sobre móveis quando cuba-tanque

Entrada: usuário responde "Sim" para "Existe tanque no local?", seleciona "Cuba-tanque", e tenta avançar sem responder nada mais sobre o tanque.

Resultado esperado: o avanço não é bloqueado por causa da pergunta de móveis, pois ela não é exibida nem exigida nesse cenário. As demais validações do formulário da Cozinha continuam se aplicando normalmente (granito, eletrodomésticos etc.).

### CA-10 — PDF reflete o tipo de tanque escolhido, sem CC para cuba-tanque

Entrada: PDF gerado para um ambiente de Cozinha com tanque tradicional e móveis = Sim.

Resultado esperado: o bloco da Cozinha no PDF exibe, nesta ordem: a pergunta e resposta "Existe tanque no local? — Sim", a pergunta e resposta do tipo de tanque escolhido, a pergunta e resposta "Haverá móveis na região do tanque? — Sim" e o CC de remoção logo abaixo.

### CA-11 — PDF sem a pergunta de móveis quando cuba-tanque

Entrada: PDF gerado para um ambiente de Cozinha com "Existe tanque no local?" = Sim e tipo de tanque = Cuba-tanque.

Resultado esperado: o bloco da Cozinha no PDF exibe a pergunta e resposta "Existe tanque no local? — Sim" e a pergunta e resposta do tipo de tanque escolhido (Cuba-tanque). A pergunta "Haverá móveis na região do tanque?" e qualquer CC de remoção de tanque não aparecem nesse bloco.

### CA-12 — Ambiente "Outros" permanece com o comportamento atual

Entrada: um ambiente do tipo "Outros" com "Existe tanque no local?" = Sim e "Haverá móveis na região do tanque?" = Sim.

Resultado esperado: o CC de remoção de tanque continua sendo gerado normalmente para esse ambiente, exatamente como antes desta melhoria — o ambiente "Outros" não exibe a nova pergunta de tipo de tanque em nenhuma hipótese.

### CA-13 — Rascunho salvo antes da melhoria (cenário de erro/estado legado)

Entrada: rascunho salvo no armazenamento local do navegador antes desta mudança, com um ambiente de Cozinha em que "Existe tanque no local?" já está respondido como "Sim" (o novo campo de tipo de tanque não existe nesse rascunho).

Resultado esperado: ao reabrir o rascunho, o ambiente é carregado sem erro. A nova pergunta de tipo de tanque aparece como não respondida. Se o usuário tentar avançar por aquele ambiente sem escolher o tipo, o avanço é bloqueado com a mensagem de erro padrão (CA-07). A geração do PDF a partir de um rascunho nesse estado intermediário não deve quebrar — se o campo de tipo de tanque não estiver preenchido, nenhum CC de remoção de tanque é impresso, evitando gerar um CC indevido por dado incompleto.

### CA-14 — Estado inconsistente sem tanque, mas com tipo preenchido (cenário de erro)

Entrada: por qualquer inconsistência de rascunho, o estado tem "Existe tanque no local?" = Não, mas o campo de tipo de tanque contém um valor de uma resposta anterior.

Resultado esperado: nem a pergunta de tipo de tanque, nem a pergunta de móveis, nem qualquer CC de remoção de tanque aparecem — o valor do campo de tipo de tanque é ignorado sempre que "Existe tanque no local?" não for "Sim", tanto no formulário quanto no PDF e no cálculo de score. Nenhum erro é lançado.

### CA-15 — Score do ambiente não é afetado pela cuba-tanque

Entrada: ambiente de Cozinha com cuba-tanque e nenhum outro gatilho de risco ativo.

Resultado esperado: o gatilho de remoção de tanque não entra na lista de gatilhos do ambiente, os 2 pontos de risco Médio não são somados, e a classificação de risco do ambiente reflete apenas os demais gatilhos eventualmente ativos (ou fica "Baixo", se nenhum outro gatilho existir).

---

## 12. Fora do escopo

- Corrigir o mesmo problema no ambiente "Outros" (ver Risco 2) — recomenda-se um PRD futuro dedicado, caso aprovado.
- Alterar o texto legal do CC de remoção de tanque.
- Criar um novo nível de risco ou uma nova pontuação para cuba-tanque.
- Alterar qualquer outra pergunta da Cozinha (granito, eletrodomésticos, observações).
- Alterar a tela de Revisão ou o Resumo Executivo do PDF além do reflexo natural de o CC não ser mais gerado para cuba-tanque.
- Migração automática de rascunhos salvos antes desta mudança.
- Criar testes automatizados.
