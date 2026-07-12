# PRD — Tabela Compacta no Resumo Executivo do PDF

## Objetivo da Melhoria

Substituir o bloco textual de Condicionantes Contratuais (CCs) no Resumo Executivo do PDF por uma tabela compacta de três colunas, tornando a leitura mais rápida e visual. Cada linha da tabela representa um ambiente com pelo menos um gatilho ativo, exibindo o nome do ambiente, os textos curtos dos gatilhos ativados e o nível de risco com código de cor.

---

## Contexto: Como o Bloco Atual Funciona

O Resumo Executivo no PDF é gerado pela função `gerarPdf` no arquivo `src/services/pdf.js`. Atualmente, entre as linhas 212 e 218, o código:

1. Filtra todos os itens de tipo `'CC'` da lista `ccs` (excluindo os de tipo `'AVISO'`).
2. Separa em três grupos: ALTO, MÉDIO, BAIXO.
3. Chama `escreverResumoItem(cc)` para cada item, na ordem ALTO → MÉDIO → BAIXO.

A função `escreverResumoItem` (linhas 169–182) escreve duas linhas por CC:
- Um cabeçalho colorido: "RISCO [NÍVEL] — [Nome do Ambiente]"
- O texto completo do CC: "CC: CLIENTE CIENTE E DE ACORDO QUE..."

O resultado é um bloco longo de texto corrido, difícil de escanear rapidamente quando há muitos ambientes com vários CCs cada.

---

## Relação com os Arquivos Existentes

Os dados de que a tabela precisa já existem e são calculados antes do bloco do Resumo Executivo na função `gerarPdf`:

- `calcularScore(state)` retorna `scorePorAmbiente`, onde cada ambiente já possui sua `classificacao` (ALTO, MÉDIO ou BAIXO) e a lista de `gatilhos` ativados para ele — exatamente as duas informações que alimentam as colunas Risco e Ações.
- `state.ambientesSelecionados` contém as instâncias de ambiente com seus dados para `formatarNomeAmbiente`, que alimenta a coluna Ambiente.
- `state.global.g4_ambientes` contém os valores de cm por ambiente para o gatilho REBAIXO.
- `autoTable` já é importado em `pdf.js` e já é usado nas tabelas de eletrodomésticos e eletrônicos.
- `COR_NIVEL` já define as cores RGB para ALTO, MÉDIO e BAIXO, e pode ser reutilizado diretamente.

---

## Arquivos Afetados

Apenas um arquivo será modificado:

- **`src/services/pdf.js`** — único arquivo a ser alterado.

Nenhum outro arquivo será tocado.

---

## O que Será Adicionado

### 1. Mapeamento estático de gatilho → texto curto

Dentro da função `gerarPdf`, um mapeamento associa o prefixo de cada gatilho ao seu texto curto de exibição na tabela:

| Prefixo do gatilho           | Texto curto na coluna Ações               |
|------------------------------|-------------------------------------------|
| GRANITO_RETIRAR              | Remover granito                           |
| TANQUE_RETIRAR               | Remover tanque                            |
| ELETROS_NAODEF               | Eletros indefinidos                       |
| ELETRONICOS_NAODEF           | Eletrônicos indefinidos                   |
| TV_PONTO                     | Ponto fora do painel                      |
| CORTINEIRO_NAOINSTALADO      | Cortineiro 150mm                          |
| RODAPE_AUSENTE               | Instalar rodapé pós-montagem              |
| RODAPE_EXISTENTE             | Roupeiro sobre rodapé                     |
| REFORM_SEM_REVESTIMENTO      | Sem revestimento                          |
| ILUMINACAO_EXTERNA           | Iluminação por conta do cliente           |
| REFORM_SEM_REBOCO            | Reboco inacabado                          |
| PONTOS_INDEFINIDOS           | Pontos pendentes                          |
| REBAIXO                      | Rebaixo de [X]cm  (X = valor do formulário) |

Para o gatilho REBAIXO, o valor em cm é obtido de `state.global.g4_ambientes`, procurando a entrada cujo `instanceId` corresponde ao ambiente da linha.

### 2. Lógica de construção das linhas da tabela

Para cada ambiente em `ambientesSelecionados`, na ordem em que foram cadastrados:
- Se `scorePorAmbiente[instanceId].gatilhos` for não vazio, cria-se uma linha com:
  - **Coluna 1 (Ambiente):** nome formatado pelo `formatarNomeAmbiente` — ex: "Cozinha / Área de Serviço" ou "Outros — BAR".
  - **Coluna 2 (Ações e pontos de atenção):** os textos curtos de cada gatilho ativo para esse ambiente, unidos por " — " (travessão com espaços), em uma única string contínua.
  - **Coluna 3 (Risco):** a string "ALTO", "MÉDIO" ou "BAIXO", sem prefixo "RISCO".

### 3. Chamada ao autoTable substituindo o loop

A chamada a `autoTable` ocupa o lugar exato onde hoje está o `.forEach((cc) => escreverResumoItem(cc))`. Configurações relevantes:
- Três colunas com larguras fixas: Ambiente (~55mm), Ações e pontos de atenção (~100mm), Risco (~15mm) — totalizando 170mm de largura de conteúdo na página A4 com margens de 20mm.
- O cabeçalho da tabela exibe os rótulos: "Ambiente", "Ações e pontos de atenção", "Risco".
- O hook `didParseCell` aplica a cor correta ao texto da coluna Risco conforme o valor da célula (usando `COR_NIVEL` existente).
- `overflow: 'linebreak'` (comportamento padrão do autoTable) garante que o conteúdo da coluna Ações quebre automaticamente em múltiplas linhas dentro da célula quando ultrapassar o limite da coluna, sem necessidade de lógica manual.
- Após a tabela, a variável `y` é atualizada para `doc.lastAutoTable.finalY + 4`, mantendo o padrão já usado nas outras tabelas do PDF.

---

## O que Será Removido

1. **A função `escreverResumoItem`** (linhas 169–182 de `pdf.js`) — deixa de existir.
2. **O bloco de filtragem e loop do Resumo Executivo** (linhas 212–218 de `pdf.js`): as variáveis `ccsResumo`, `ccsAlto`, `ccsMedio`, `ccsBaixo` e o `.forEach((cc) => escreverResumoItem(cc))`.

A variável `ccs` (resultado de `construirCCs`) e o `ccPorId` **permanecem**, pois são usados na seção Checklist Completa via `escreverInline`.

---

## O que Não Será Tocado

- **`src/domain/scoreEngine.js`** — cálculo de risco e gatilhos intactos
- **`src/domain/ccBuilder.js`** — construção de CCs e avisos intacta
- **`src/domain/checklistTextos.js`** — textos completos intactos (juridicamente sensíveis)
- **`src/domain/ambientes.js`** — mapeamento de ambientes intacto
- **`src/domain/schema.js`** — estado inicial e defaults por formType intactos
- **`src/context/`** — gerenciamento de estado intacto
- **`src/steps/`** — nenhum componente de interface alterado
- **Capa do PDF** (`pdf.js` linhas 106–141) — identificação, endereço e score global intactos
- **Seção "Checklist Completa"** do PDF (`pdf.js` linhas 220–473) — sem nenhuma alteração
- **Tabelas de eletrodomésticos e eletrônicos** dentro da Checklist Completa — sem alteração
- **Funções auxiliares do PDF** (`garantirEspaco`, `escreverLinhas`, `escreverTituloSecao`, `escreverPergunta`, `escreverInline`) — sem alteração

---

## Premissas Assumidas

1. **Ambientes sem gatilhos não aparecem na tabela.** Um ambiente cujo `scorePorAmbiente[instanceId].gatilhos` seja vazio simplesmente não gera linha.

2. **A tabela inclui todos os gatilhos de `scorePorAmbiente[instanceId].gatilhos`**, que abrangem tanto CCs de tipo `'CC'` quanto de tipo `'AVISO'` (como `CORTINEIRO_NAOINSTALADO` e `RODAPE_EXISTENTE`). O bloco atual exibia apenas os de tipo `'CC'`; a tabela nova exibe todos os gatilhos com texto curto definido na lista acima.

3. **A ordem das linhas segue a ordem de `ambientesSelecionados`**, que é a ordem em que o usuário cadastrou os ambientes. Não há reordenação por nível de risco.

4. **Múltiplos gatilhos de um mesmo ambiente ficam numa única célula**, com os textos curtos separados por " — ".

5. **O texto curto do gatilho REBAIXO é específico por ambiente**: o valor em cm é obtido de `state.global.g4_ambientes` usando o `instanceId`.

6. **As cores da coluna Risco reutilizam o mapa `COR_NIVEL` já existente** em `pdf.js` (ALTO: RGB 180,0,0 / MÉDIO: RGB 200,120,0 / BAIXO: RGB 0,130,0).

7. **Largura proposta das colunas**: Ambiente ~55mm, Ações ~100mm, Risco ~15mm. O texto da coluna Ações é o único que pode precisar de quebra automática; as colunas Ambiente e Risco devem caber sem quebra na maioria dos casos.

8. **Se nenhum ambiente tiver gatilho ativo**, a seção exibe o título "Resumo Executivo" sem tabela. Não é gerado nenhum erro.

---

## Riscos Identificados

1. **Ambiguidade sobre AVISOs na tabela.** O bloco atual filtrava `tipo === 'CC'`, excluindo `CORTINEIRO_NAOINSTALADO` e `RODAPE_EXISTENTE` (ambos `tipo === 'AVISO'`). A premissa deste PRD é incluí-los. Se isso não for desejado, a lógica de construção das linhas deve cruzar com a lista de `ccs` para excluir gatilhos cujo CC correspondente seja do tipo `'AVISO'`.

2. **Ambiente sem entrada em `scorePorAmbiente`.** Pode ocorrer em estado corrompido ou parcialmente preenchido. A construção das linhas deve verificar a existência do score antes de criar a linha, ignorando silenciosamente o ambiente ausente.

3. **Gatilho sem texto curto mapeado.** Se um novo gatilho for adicionado ao `scoreEngine.js` no futuro sem ser adicionado ao mapeamento local, ele não aparecerá na coluna Ações. Não quebra nada, mas perde cobertura silenciosamente.

4. **Célula de Ações muito longa.** Um ambiente do tipo Outros com todos os 13 gatilhos possíveis ativados gerará um texto muito longo. O autoTable gerencia isso com quebra automática de linha, mas o teste visual deve confirmar que a célula expande corretamente e não transborda.

5. **Nome de ambiente muito longo.** O tipo Outros com nome personalizado longo (ex: "Outros — ESCRITÓRIO MEZANINO") pode ultrapassar os 55mm da coluna Ambiente. O autoTable também quebrará essa coluna se necessário.

6. **Quebra de página no meio da tabela.** O autoTable por padrão divide tabelas entre páginas. Deve ser verificado visualmente se a divisão ocorre em ponto legível, sem linha cortada ao meio.

---

## Critérios de Aceitação

### AC-01 — Tabela aparece no lugar do bloco de CCs

**Entrada:** checklist com pelo menos um ambiente com um gatilho ativo (exemplo: Cozinha com granito a retirar).  
**Resultado esperado:** o PDF exibe o título "Resumo Executivo" seguido de uma tabela com cabeçalhos "Ambiente", "Ações e pontos de atenção" e "Risco". Nenhum texto no formato "RISCO [NÍVEL] — [Nome]" aparece no Resumo Executivo. Nenhum texto no formato "CC: CLIENTE CIENTE…" aparece no Resumo Executivo.

---

### AC-02 — Uma linha por ambiente com gatilho

**Entrada:** checklist com dois ambientes distintos, cada um com pelo menos um gatilho ativo.  
**Resultado esperado:** a tabela contém exatamente duas linhas de dados. A coluna Ambiente de cada linha exibe o nome formatado correspondente ao ambiente.

---

### AC-03 — Múltiplos gatilhos numa célula, separados por travessão

**Entrada:** Cozinha com granito a retirar e tanque a retirar (dois gatilhos ativos no mesmo ambiente).  
**Resultado esperado:** a célula da coluna Ações desse ambiente exibe "Remover granito — Remover tanque". A altura da linha se ajusta automaticamente ao conteúdo.

---

### AC-04 — Cores corretas na coluna Risco

**Entrada:** checklist com três ambientes em níveis diferentes: um ALTO, um MÉDIO, um BAIXO.  
**Resultado esperado:** o texto "ALTO" aparece em vermelho (RGB 180, 0, 0); o texto "MÉDIO" aparece em laranja/amarelo (RGB 200, 120, 0); o texto "BAIXO" aparece em verde (RGB 0, 130, 0). O restante do texto da tabela permanece em preto.

---

### AC-05 — Texto do REBAIXO inclui o valor em cm

**Entrada:** ambiente com rebaixo de 15 cm configurado no formulário.  
**Resultado esperado:** a célula da coluna Ações desse ambiente contém o texto "Rebaixo de 15cm". O valor em cm deve ser exatamente o mesmo informado no formulário, não um valor fixo ou genérico.

---

### AC-06 — Ambiente com nome personalizado exibe corretamente

**Entrada:** ambiente do tipo Outros com nome personalizado "BAR" cadastrado pelo usuário.  
**Resultado esperado:** a coluna Ambiente exibe "Outros — BAR", conforme o comportamento do `formatarNomeAmbiente`.

---

### AC-07 — Checklist sem nenhum gatilho ativo

**Entrada:** todos os campos respondidos de forma a não ativar nenhum gatilho (sem granito, sem tanque, eletros definidos, pontos elétricos na posição final, reboco finalizado, revestimento aplicado, sem rebaixo, etc.).  
**Resultado esperado:** o PDF exibe o título "Resumo Executivo" sem tabela abaixo (ou com tabela vazia), sem nenhum erro de geração ou renderização. A seção "Checklist Completa" continua aparecendo normalmente logo após.

---

### AC-08 — Todas as outras seções do PDF permanecem inalteradas

**Entrada:** qualquer checklist com gatilhos ativos.  
**Resultado esperado:** a Capa (nome do cliente, contrato, endereço, data, classificação de risco global), a seção "Checklist Completa" inteira, as tabelas de eletrodomésticos e eletrônicos, e todos os itens inline de CCs e Avisos dentro da Checklist Completa aparecem visualmente idênticos ao comportamento anterior. Nenhuma seção fora do Resumo Executivo é afetada.

---

### AC-09 — Célula de Ações com muitos gatilhos não ultrapassa a margem

**Entrada:** ambiente Outros com o maior número possível de gatilhos simultâneos ativos (cenário de estresse).  
**Resultado esperado:** o texto da coluna Ações quebra em múltiplas linhas dentro da célula, aumentando sua altura. Nenhum texto extravasa além da margem direita da página. A tabela permanece legível.

---

### AC-10 — Tabela com muitos ambientes quebra entre páginas corretamente

**Entrada:** checklist com 8 ambientes, todos com múltiplos gatilhos ativos.  
**Resultado esperado:** o autoTable divide a tabela entre páginas conforme necessário, sem sobreposição de conteúdo e sem linha cortada ao meio. O título "Resumo Executivo" aparece apenas uma vez, no início da seção.
