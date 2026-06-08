# PRD - CCs das Perguntas Globais por Ambiente no PDF

**Status:** Aguardando aprovacao  
**Data:** 2026-06-05  
**Projeto:** Checklist Dinamica - By Arabi Planejados

---

## Objetivo da melhoria

Reorganizar a secao **Checklist Completa** do PDF para que o conjunto pergunta + resposta + CC gerado pelas perguntas globais G1, G2, G3 e G4 deixe de aparecer agrupado no inicio da checklist e passe a aparecer dentro do bloco de cada ambiente afetado.

Hoje, o PDF abre a Checklist Completa com as perguntas G1 a G5. As perguntas G1 a G4 exibem a resposta geral e, logo abaixo, os CCs relacionados aos ambientes selecionados. A melhoria remove da Checklist Completa a exibicao das perguntas G1 a G4 e redistribui o conjunto pergunta + resposta + CC para os blocos dos ambientes aos quais ele ja pertence.

O comportamento do restante do sistema nao deve mudar. As perguntas G1 a G4 continuam existindo no formulario, continuam pontuando, continuam gerando CCs e continuam aparecendo no Resumo Executivo do PDF e na tela de Revisao.

---

## Pesquisa da base de codigo

Foram verificados os arquivos-fonte, componentes, servicos, dominio e documentacao do projeto, excluindo dependencias instaladas (`node_modules`) e artefatos gerados (`dist`) por nao serem fontes de manutencao.

### Como as perguntas G1-G4 aparecem hoje na Checklist Completa

No arquivo `src/services/pdf.js`, a funcao `gerarPdf` monta o PDF inteiro de forma manual com jsPDF.

A secao **Checklist Completa** comeca em `pdf.js` na chamada `escreverTituloSecao('Checklist Completa')`. Logo depois, o arquivo chama `escreverPergunta` para:

- G1 - Iluminacao externa.
- G2 - Reboco.
- G3 - Revestimento.
- G4 - Pontos eletricos/hidraulicos/gas.
- G5 - Rebaixo de teto.

As perguntas G1 a G4 usam as listas do estado global para montar a resposta textual e tambem buscam os CCs no mapa `ccPorId`. Esses CCs ja sao buscados pelos IDs com sufixo do ambiente, por exemplo `ILUMINACAO_EXTERNA_{instanceId}` e `PONTOS_INDEFINIDOS_{instanceId}`.

Portanto, hoje a Checklist Completa mostra:

1. Um bloco inicial de perguntas globais G1-G5.
2. Dentro das perguntas G1-G4, CCs inline agrupados pela pergunta.
3. Depois disso, um bloco separado para cada ambiente.

### Como os CCs de G1-G4 sao gerados e vinculados

Os CCs de G1-G4 passam por `src/domain/ccBuilder.js`.

O fluxo atual e:

- `src/domain/scoreEngine.js` calcula os gatilhos por ambiente.
- Para cada ambiente selecionado, G1-G4 geram gatilhos com o padrao `{TIPO}_{instanceId}`.
- `src/domain/ccBuilder.js` percorre `ambientesSelecionados` e cria CCs individuais por ambiente.
- Cada CC de G1-G4 sai com `escopo: instanceId`.
- Cada CC tambem carrega `perguntaOrigem` com `G1`, `G2`, `G3` ou `G4`.

Isso significa que os CCs ja estao semanticamente vinculados ao ambiente correto. A melhoria nao precisa alterar o builder de CCs nem o motor de score.

### Supressao G2/G3

A regra de supressao entre G2 e G3 ja existe no `ccBuilder.js`: se um ambiente esta sem reboco, o CC de revestimento desse mesmo ambiente nao e gerado. A redistribuicao no PDF deve respeitar essa regra naturalmente usando a lista final de CCs produzida por `construirCCs`, sem recalcular nada a partir do estado bruto.

### Como o bloco de cada ambiente e montado hoje no PDF

Ainda em `src/services/pdf.js`, depois das perguntas globais, o PDF percorre `state.ambientesSelecionados`. Para cada ambiente, escreve:

- Nome do ambiente.
- Score do ambiente, quando existe.
- Linha divisoria.
- Perguntas especificas daquele tipo de ambiente.
- CCs ou avisos inline abaixo de algumas respostas.

Hoje ja aparecem dentro do bloco do ambiente os seguintes CCs e avisos quando aplicaveis:

- `GRANITO_RETIRAR_{instanceId}`.
- `TANQUE_RETIRAR_{instanceId}`.
- `TV_PONTO_{instanceId}`.
- `CORTINEIRO_NAOINSTALADO_{instanceId}`.
- `RODAPE_EXISTENTE_{instanceId}`.
- `RODAPE_AUSENTE_{instanceId}`.
- `ELETROS_NAODEF_{instanceId}`.
- `ELETRONICOS_NAODEF_{instanceId}`.

Os CCs de G1-G4 ainda nao aparecem dentro desses blocos de ambiente, apesar de ja terem `escopo: instanceId`.

### Observacao sobre G5

O pedido descreve explicitamente G1-G4. G5/Rebaixo ja e gerado por ambiente em `ccBuilder.js`, mas hoje aparece na Checklist Completa dentro da pergunta G5, antes dos blocos de ambiente. G5 foi aprovado para fazer parte desta melhoria. A pergunta G5 tambem sera removida da Checklist Completa e o conjunto pergunta + resposta + CC sera redistribuido para os blocos dos ambientes afetados, seguindo o mesmo padrao de G1-G4.

---

## Pesquisa de padroes externos

O projeto usa React, Vite e jsPDF. A forma mais simples e consistente e manter o PDF manual em `src/services/pdf.js`, sem introduzir nova biblioteca, nova camada de dados ou refatoracao ampla.

Fontes consultadas:

- Documentacao oficial do jsPDF: `https://parallax.github.io/jsPDF/docs/index.html`
- Modulo oficial `split_text_to_size` do jsPDF: `https://parallax.github.io/jsPDF/docs/module-split_text_to_size.html`
- Documentacao oficial do React sobre listas: `https://react.dev/learn/rendering-lists`

Conclusao da pesquisa:

- jsPDF ja oferece o fluxo usado pelo projeto: criar documento, escrever texto, controlar paginas e salvar arquivo.
- O projeto ja possui helpers locais para espaco, quebra de linhas e escrita inline de CCs.
- Para redistribuir o conjunto pergunta + resposta + CC, basta filtrar a lista ja gerada por `construirCCs` usando `escopo` e `perguntaOrigem`.
- Nao ha necessidade de `jspdf-autotable`, componente React novo, mudanca no schema, nem novo builder.

---

## Relacao com os arquivos existentes

### `src/services/pdf.js`

Arquivo principal afetado.

Ele hoje:

- Calcula score e CCs.
- Cria `ccPorId`.
- Escreve Resumo Executivo.
- Escreve Checklist Completa.
- Escreve perguntas globais G1-G5.
- Escreve blocos dos ambientes.

A mudanca futura deve acontecer aqui:

- Remover a exibicao de G1-G4 da Checklist Completa.
- Inserir o conjunto pergunta + resposta + CC de G1-G4 dentro do bloco de cada ambiente afetado.
- Reaproveitar a lista `ccs` ja criada por `construirCCs`.

### `src/domain/ccBuilder.js`

Arquivo verificado, mas nao deve ser alterado para esta melhoria.

Ele ja gera os CCs de G1-G4 por ambiente, com `escopo: instanceId`, IDs individualizados e `perguntaOrigem` correta.

### `src/domain/scoreEngine.js`

Arquivo verificado, mas nao deve ser alterado.

Ele ja calcula os gatilhos de G1-G4 por ambiente. Alterar score aqui mudaria comportamento fora do PDF, o que esta fora do escopo.

### `src/steps/StepRevisao/StepRevisao.jsx`

Arquivo verificado, mas nao deve ser alterado.

A tela de Revisao lista os CCs por nivel e usa `escopo` para resolver o nome do ambiente. O pedido diz explicitamente que as perguntas Gs e seus CCs devem continuar aparecendo no Resumo Executivo; alterar a Revisao poderia quebrar esse comportamento.

### `src/steps/StepPerguntasGlobais/*`

Arquivos verificados, mas nao devem ser alterados.

Os componentes `BlocoIluminacao.jsx`, `BlocoReforma.jsx`, `BlocoPontosUtilidades.jsx`, `BlocoRebaixo.jsx` e `StepPerguntasGlobais.jsx` controlam a coleta das respostas. O pedido nao altera o formulario.

### `src/domain/schema.js` e `src/context/FormProvider.jsx`

Arquivos verificados, mas nao devem ser alterados.

O estado necessario para a melhoria ja existe. Nao ha necessidade de campo novo nem migracao de rascunho.

---

## Arquivos afetados

### Arquivo a alterar na implementacao futura

| Arquivo | Tipo de alteracao |
|---|---|
| `src/services/pdf.js` | Remover exibicao das perguntas G1-G5 da Checklist Completa e inserir seus CCs nos blocos dos ambientes afetados |

### Arquivo criado nesta etapa

| Arquivo | Tipo de alteracao |
|---|---|
| `PRD_CC_POR_AMBIENTE.md` | Documento de requisito para aprovacao antes da implementacao |

### Arquivos verificados, mas nao previstos para alteracao

| Arquivo | Motivo |
|---|---|
| `src/domain/ccBuilder.js` | Ja gera CCs de G1-G4 por ambiente |
| `src/domain/scoreEngine.js` | Ja gera gatilhos de G1-G4 por ambiente |
| `src/steps/StepRevisao/StepRevisao.jsx` | Resumo e Revisao devem permanecer iguais |
| `src/steps/StepPerguntasGlobais/*` | Formulario deve permanecer igual |
| `src/domain/checklistTextos.js` | Textos legais dos CCs nao devem mudar |
| `src/domain/schema.js` | Estado ja tem todos os campos necessarios |
| `src/context/FormProvider.jsx` | Persistencia/localStorage nao muda |

---

## O que sera adicionado

Na implementacao futura, dentro de `src/services/pdf.js`, sera adicionada uma forma simples de obter os CCs globais por ambiente usando a lista final `ccs`.

Regra desejada:

- Para cada ambiente em `state.ambientesSelecionados`, listar dentro do bloco daquele ambiente todos os itens de `ccs` cujo `escopo` seja o `instanceId` do ambiente e cuja `perguntaOrigem` seja `G1`, `G2`, `G3` ou `G4`.
- Cada conjunto pergunta + resposta + CC deve aparecer uma vez por ambiente afetado.
- Se um CC de G1-G4 afetar dois ambientes, deve existir o conjunto pergunta + resposta + CC duas vezes no PDF, uma dentro de cada bloco de ambiente.
- A ordem recomendada dentro do bloco e G1, G2, G3, G4, preservando a ordem logica das perguntas globais.
- A exibicao deve reutilizar o estilo inline ja existente para CCs no PDF, para manter consistencia visual.

Local recomendado de exibicao:

- Dentro do bloco do ambiente, logo apos o nome, score e linha divisoria do ambiente.
- Antes das perguntas especificas daquele ambiente.

Essa posicao garante que o conjunto pergunta + resposta + CC pertence visualmente ao ambiente.

---

## O que sera removido

Na implementacao futura, da Checklist Completa do PDF, devem ser removidas as chamadas que imprimem:

- A pergunta G1 e sua resposta, e os CCs inline atualmente exibidos dentro dessa pergunta.
- A pergunta G2 e sua resposta, e os CCs inline atualmente exibidos dentro dessa pergunta.
- A pergunta G3 e sua resposta, e os CCs inline atualmente exibidos dentro dessa pergunta.
- A pergunta G4 e sua resposta, e os CCs inline atualmente exibidos dentro dessa pergunta.
- A pergunta G5 e sua resposta, e o CC inline atualmente exibido dentro dessa pergunta.

O titulo **Checklist Completa** permanece.



---

## O que nao sera tocado

Nao deve ser alterado:

- O formulario de perguntas globais.
- A validacao das perguntas globais.
- O estado global salvo no formulario.
- O motor de score.
- A geracao dos CCs no `ccBuilder.js`.
- Os textos dos CCs em `checklistTextos.js`.
- A tela de Revisao.
- O Resumo Executivo do PDF.
- A capa do PDF.
- Os CCs ja exibidos dentro dos blocos de ambiente.
- A ordem dos ambientes no PDF.
- A regra de supressao G2/G3.
- A regra DIV-07.
- O conteudo de `node_modules`.
- O conteudo de `dist`, por ser artefato gerado.
- Arquivos de configuracao de build, salvo necessidade nao prevista.

---

## Premissas assumidas

1. G1-G4 continuam sendo as unicas perguntas globais afetadas por esta melhoria.

2. G5/Rebaixo tambem faz parte desta melhoria. A pergunta G5 sera removida da Checklist Completa e o conjunto pergunta + resposta + CC sera redistribuido para os blocos dos ambientes afetados, seguindo o mesmo padrao de G1-G4.

3. A lista `ccs` gerada por `construirCCs` e a fonte de verdade. O PDF nao deve reconstruir regras de negocio a partir de `state.global`.

4. O conjunto pergunta + resposta + CC de G1-G4 deve aparecer dentro do bloco do ambiente, com o texto da pergunta global incluido.

5. Quando uma pergunta G1-G4 nao gerar CC para um ambiente, nada deve aparecer naquele bloco.

6. Quando um ambiente tiver mais de um CC de G1-G4, todos devem aparecer no bloco do ambiente.

7. A tela de Revisao e o Resumo Executivo devem continuar exibindo os CCs de G1-G4 como hoje.

8. Estados incompletos ou inconsistentes nao devem quebrar a geracao do PDF. Se nao houver CC gerado para uma selecao, nada deve ser impresso.

---

## Riscos identificados

### Risco 1 - Remover demais da Checklist Completa

Ha uma ambiguidade no termo "perguntas Gs". O pedido detalha G1-G4, mas o PDF tambem mostra G5. A decisao foi tomada: G5 tambem saira da Checklist Completa e o conjunto pergunta + resposta + CC sera redistribuido para os blocos dos ambientes afetados, seguindo o mesmo padrao de G1-G4. Este risco esta resolvido.

### Risco 2 - Duplicidade de CCs

Se o conjunto pergunta + resposta + CC de G1-G4 for adicionado aos blocos de ambiente sem remover G1-G4 do topo da Checklist Completa, o PDF passara a exibir o mesmo conjunto duas vezes. A remocao e a insercao precisam acontecer juntas.

### Risco 3 - Perda de CCs por filtro errado

Se a implementacao filtrar pelos IDs manualmente e esquecer algum padrao, um CC pode sumir do PDF. Mitigacao: filtrar por `perguntaOrigem` em `G1`, `G2`, `G3`, `G4` e por `escopo` igual ao ambiente.

### Risco 4 - Mudanca acidental no Resumo Executivo

O Resumo Executivo tambem usa a lista `ccs`. A implementacao nao deve alterar essa lista nem os filtros do resumo, apenas a forma como a Checklist Completa posiciona os itens.

### Risco 5 - Layout maior em projetos com muitos ambientes

Redistribuir CCs por ambiente pode aumentar a repeticao visual no PDF, especialmente quando G1 ou G4 afeta todos os ambientes. O gerador ja possui controle de quebra de pagina, mas a mudanca deve ser validada com muitos ambientes selecionados.

### Risco 6 - Ordem dos CCs dentro do ambiente

Se os CCs forem exibidos na ordem bruta da lista sem criterio claro, a leitura pode parecer inconsistente. A ordem G1, G2, G3, G4 e a mais previsivel.

---

## Criterios de aceitacao

### CA-01 - G1 removida da Checklist Completa e CC inserido no ambiente

Entrada: formulario com Cozinha e Dormitorio; G1 = Sim; somente Cozinha selecionada em G1.

Resultado esperado: na Checklist Completa do PDF, nao aparece a pergunta G1 no bloco inicial. Dentro do bloco da Cozinha aparecem, nesta ordem: o texto da pergunta G1, a resposta registrada e o CC de iluminacao externa — no mesmo formato das perguntas especificas do ambiente, ou seja, pergunta, resposta e CC em sequencia. Apenas o CC sozinho nao e suficiente. Dentro do bloco do Dormitorio nao aparece esse CC. O Resumo Executivo continua exibindo o CC da Cozinha.

### CA-02 - G1 com multiplos ambientes

Entrada: formulario com Cozinha e Dormitorio; G1 = Sim; Cozinha e Dormitorio selecionados em G1.

Resultado esperado: a pergunta G1 nao aparece na Checklist Completa. Dentro do bloco da Cozinha e dentro do bloco do Dormitorio aparecem, cada um, nesta ordem: o texto da pergunta G1, a resposta registrada e o CC de iluminacao externa — no mesmo formato das perguntas especificas do ambiente, ou seja, pergunta, resposta e CC em sequencia. Apenas o CC sozinho nao e suficiente.

### CA-03 - G2 sem reboco em um ambiente

Entrada: G2 = Nao; risco assumido; Banheiro selecionado como ambiente sem reboco.

Resultado esperado: a pergunta G2 nao aparece na Checklist Completa. Dentro do bloco do Banheiro aparecem, nesta ordem: o texto da pergunta G2, a resposta registrada e o CC de reboco — no mesmo formato das perguntas especificas do ambiente, ou seja, pergunta, resposta e CC em sequencia. Apenas o CC sozinho nao e suficiente. Nenhum outro ambiente recebe esse CC. O score e o Resumo Executivo permanecem iguais ao comportamento atual.

### CA-04 - G3 sem revestimento em ambiente diferente de G2

Entrada: G2 = Nao com Cozinha sem reboco; G3 = Nao com Dormitorio sem revestimento.

Resultado esperado: a pergunta G2 nao aparece e a pergunta G3 nao aparece na Checklist Completa. Dentro do bloco da Cozinha aparecem, nesta ordem: o texto da pergunta G2, a resposta registrada e o CC de reboco. Dentro do bloco do Dormitorio aparecem, nesta ordem: o texto da pergunta G3, a resposta registrada e o CC de revestimento. Em ambos os casos o formato e o mesmo das perguntas especificas do ambiente — pergunta, resposta e CC em sequencia. Apenas o CC sozinho nao e suficiente.

### CA-05 - Supressao G2/G3 no mesmo ambiente

Entrada: G2 = Nao com Cozinha sem reboco; G3 = Nao com Cozinha tambem marcada sem revestimento.

Resultado esperado: a pergunta G2 nao aparece e a pergunta G3 nao aparece na Checklist Completa. Dentro do bloco da Cozinha aparecem, nesta ordem: o texto da pergunta G2, a resposta registrada e o CC de reboco — no mesmo formato das perguntas especificas do ambiente, ou seja, pergunta, resposta e CC em sequencia. Apenas o CC sozinho nao e suficiente. O CC de revestimento nao aparece, respeitando a supressao ja feita por `ccBuilder.js`.

### CA-06 - G4 pontos pendentes em um ambiente

Entrada: G4 = Nao; Home selecionado como ambiente com pontos eletricos/hidraulicos/gas pendentes.

Resultado esperado: a pergunta G4 nao aparece na Checklist Completa. Dentro do bloco do Home aparecem, nesta ordem: o texto da pergunta G4, a resposta registrada e o CC de pontos indefinidos — no mesmo formato das perguntas especificas do ambiente, ou seja, pergunta, resposta e CC em sequencia. Apenas o CC sozinho nao e suficiente. Outros ambientes nao recebem esse CC.

### CA-07 - Ambiente com varios CCs de G1-G4

Entrada: Cozinha selecionada em G1, G2 e G4.

Resultado esperado: dentro do bloco da Cozinha aparecem todos os grupos gerados por essas perguntas, cada um uma unica vez, em ordem previsivel (G1, G2, G4). Para cada pergunta G com CC gerado, o bloco exibe, nesta sequencia: o texto da pergunta G correspondente, a resposta registrada e o CC — no mesmo formato das perguntas especificas do ambiente, ou seja, pergunta, resposta e CC em sequencia. Apenas o CC sozinho nao e suficiente. As perguntas G1, G2 e G4 nao aparecem no bloco inicial da Checklist Completa.

### CA-08 - CCs existentes por ambiente continuam aparecendo

Entrada: Cozinha com G1 ativo e tambem com granito existente que nao sera adaptado.

Resultado esperado: dentro do bloco da Cozinha aparece o CC de G1 e tambem o CC de retirada de granito. O CC de granito nao e removido, alterado nem duplicado.

### CA-09 - Resumo Executivo preservado

Entrada: qualquer formulario com CCs de G1-G4.

Resultado esperado: o Resumo Executivo do PDF continua listando os CCs de G1-G4 por nivel de risco e ambiente, como antes. A mudanca afeta somente a Checklist Completa.

### CA-10 - Tela de Revisao preservada

Entrada: qualquer formulario com CCs de G1-G4.

Resultado esperado: a tela de Revisao continua exibindo os CCs de G1-G4 por nivel. Nenhuma mudanca visual ou funcional ocorre fora do PDF.

### CA-11 - G5 redistribuido para o bloco do ambiente

Entrada: G5 = Sim; Home/Sala com rebaixo de 15 cm.

Resultado esperado: a pergunta G5 nao aparece na Checklist Completa. Dentro do bloco do Home/Sala aparecem, nesta ordem: o texto da pergunta G5, a resposta registrada e o CC de rebaixo — no mesmo formato das perguntas especificas do ambiente, ou seja, pergunta, resposta e CC em sequencia. Apenas o CC sozinho nao e suficiente.

### CA-12 - Nenhum CC de G1-G4

Entrada: G1 = Nao, G2 = Sim, G3 = Sim, G4 = Sim.

Resultado esperado: a Checklist Completa nao mostra perguntas G1-G4 e nenhum CC global e inserido nos blocos dos ambientes. Os blocos dos ambientes continuam exibindo suas perguntas especificas normalmente.

### CA-13 - Estado inconsistente sem CC gerado

Entrada: estado salvo com `g1_temIluminacaoExterna = true`, mas `g1_ambientes = []`.

Resultado esperado: o PDF e gerado sem erro. A pergunta G1 nao aparece na Checklist Completa e nenhum CC de G1 aparece nos blocos de ambiente.

### CA-14 - Ambiente removido ou ID inexistente

Entrada: lista de CCs contem, por qualquer inconsistencia de rascunho, um `escopo` que nao existe mais em `ambientesSelecionados`.

Resultado esperado: o PDF e gerado sem erro. Esse CC nao e inserido em nenhum bloco de ambiente da Checklist Completa, pois nao ha ambiente correspondente.

### CA-15 - Projeto com muitos ambientes

Entrada: formulario com varios ambientes e G1/G4 afetando todos eles.

Resultado esperado: o PDF e gerado sem sobreposicao de textos. Os CCs aparecem dentro de cada bloco de ambiente correspondente, respeitando quebras de pagina.

---

## Fora do escopo

- Alterar textos legais de CC.
- Alterar pontuacao.
- Alterar perguntas do formulario.
- Alterar labels G1-G5 na interface.
- Alterar o Resumo Executivo.
- Alterar a tela de Revisao.
- Criar testes automatizados neste PRD.
- Refatorar o gerador de PDF inteiro.
- Migrar para outra biblioteca de PDF.

---