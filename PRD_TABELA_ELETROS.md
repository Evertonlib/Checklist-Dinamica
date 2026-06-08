# PRD — Tabela de Eletros e Eletrônicos no PDF

**Status:** Aguardando aprovação
**Data:** 2026-06-08

---

## Objetivo

Substituir a listagem vertical de campos de cada eletrodoméstico e eletrônico no PDF por uma tabela horizontal, onde cada item ocupa uma única linha. A tabela terá as colunas: Tipo, Modelo, Largura (cm), Altura (cm), Profundidade (cm) e Link. O link deve aparecer como texto clicável "Ver link" que abre a URL no navegador ao ser clicado no PDF. Quando não houver URL informada, a célula exibe um traço ("—").

---

## Contexto e relação com o código existente

### Como funciona hoje

O arquivo `src/services/pdf.js` é o único responsável pela geração do PDF. Hoje, quando um ambiente possui eletros definidos, o código executa um laço sobre o array `resp.eletros` e chama a função `escreverPergunta()` para cada campo individualmente. O resultado no PDF é uma sequência de linhas do tipo:

- Eletro 1 → Fogão — Piso
- Modelo → Fulano XYZ
- Largura (cm) → 60
- Altura (cm) → 85
- Profundidade (cm) → 60
- Link → https://...

O mesmo padrão se repete para eletrônicos (`resp.eletronicosList`) em ambientes do tipo `home` e `outros`.

### Onde está o código afetado

- **Eletros** (cozinhas e ambientes do tipo "outros"): linhas 373 a 382 de `src/services/pdf.js`
- **Eletrônicos** (home/sala e ambientes do tipo "outros"): linhas 392 a 400 de `src/services/pdf.js`

Ambos os blocos seguem exatamente o mesmo padrão e serão substituídos cada um pela respectiva tabela.

### Tecnologia disponível para a tabela

A biblioteca `jspdf-autotable` (versão 3.8.2) já está instalada como dependência no projeto. Ela é a extensão padrão para tabelas no jsPDF e está presente no `package.json`. O projeto não faz uso dela ainda, mas está disponível sem nenhuma instalação adicional.

### Funções que serão reaproveitadas

- `descreverEletro(eletro)` — já existente no pdf.js. Combina Tipo, Subtipo e Descrição em uma única string ("Fogão — Piso", "Outros — Meu eletro", etc.). Continuará sendo usada para preencher a coluna Tipo da tabela de eletros.
- `descreverEletronico(eletronico)` — já existente no pdf.js. Combina Tipo, Subtipo e Modelo em uma única string. Continuará sendo usada para preencher a coluna Tipo da tabela de eletrônicos.

---

## Arquivos afetados

| Arquivo | Tipo de mudança |
|---|---|
| `src/services/pdf.js` | Único arquivo modificado |

---

## O que será adicionado

1. **Tabela de eletrodomésticos** no bloco de eletros (formTypes `cozinha` e `outros`), renderizada via `autoTable`, exibindo uma linha por eletro com as colunas: Tipo, Modelo, Largura (cm), Altura (cm), Profundidade (cm), Link.

2. **Tabela de eletrônicos** no bloco de eletrônicos (formTypes `home` e `outros`), renderizada via `autoTable`, com as mesmas colunas. Para eletrônicos, a coluna Modelo exibirá sempre "—" (o modelo, quando informado, já está embutido na string da coluna Tipo gerada por `descreverEletronico()`).

3. **Link clicável** na coluna Link: quando o campo `link` do item estiver preenchido, a célula exibirá o texto "Ver link" com uma anotação de link PDF apontando para a URL. Quando o campo `link` estiver vazio, a célula exibirá "—" sem anotação.

4. **Cabeçalho de seção antes da tabela**: uma linha de rótulo ("Eletrodomésticos" ou "Eletrônicos") será escrita com `escreverPergunta()` antes da tabela, para manter a consistência visual com as demais seções do PDF. Esta linha substituirá o atual rótulo "Eletro 1", "Eletro 2" etc.

---

## O que será removido

1. O laço `resp.eletros.forEach(...)` (linhas 374–381 de pdf.js) que chama `escreverPergunta()` individualmente para cada campo de cada eletro.
2. O laço `resp.eletronicosList.forEach(...)` (linhas 393–399 de pdf.js) que faz o mesmo para eletrônicos.

---

## O que NÃO será tocado

- Cabeçalho do PDF (capa com nome, contrato, endereço, data, score de risco)
- Resumo executivo
- Perguntas globais (G1 a G5) e suas CCs/avisos
- Perguntas específicas de cada ambiente (granito, cuba, TV no dormitório, rodapé, rebaixo, observações etc.)
- A linha que pergunta "Já possui ou tem intenção de compra específica dos eletrodomésticos?" e sua resposta Sim/Não
- A linha que pergunta "Possui ou pretende adquirir eletrônicos para este ambiente?" e sua resposta Sim/Não
- As CCs e avisos exibidos inline abaixo de cada pergunta
- Formulários React de entrada de dados (nenhum arquivo em `src/steps/` é alterado)
- Lógica de validação em `formUtils.js`
- Estrutura de dados em `schema.js`
- As funções `descreverEletro()` e `descreverEletronico()` em pdf.js (apenas consumidas, não modificadas)
- Qualquer outro comportamento visual do PDF fora dos dois blocos de eletros e eletrônicos

---

## Premissas assumidas

1. Qualquer campo não preenchido (nulo ou string vazia) exibe "—" na célula da tabela.
2. A coluna Link exibe apenas "Ver link" como texto visível; a URL completa fica apenas como destino do link, não como texto visível.
3. A coluna Modelo dos eletrônicos exibe sempre "—", pois o modelo já está incorporado na string da coluna Tipo por `descreverEletronico()`. Não há mudança nessa lógica.
4. A tabela ocupa a largura total do corpo do PDF (respeitando as margens já usadas no documento).
5. Se a tabela ultrapassar o rodapé da página, o `autoTable` cuida automaticamente da quebra e da continuação na página seguinte — esse é o comportamento padrão da biblioteca.
6. Os estilos visuais da tabela (tamanho de fonte, cor de cabeçalho, bordas) devem ser consistentes com a paleta já usada no PDF (sem introduzir cores ou fontes novas).
7. A URL só recebe anotação de link se o valor do campo `link` for uma string não vazia. Não há validação de formato de URL na camada do PDF.

---

## Riscos identificados

1. **Texto longo na coluna Tipo**: descrições geradas por `descreverEletro()` ou `descreverEletronico()` podem ser longas (ex: "Outros — Eletrodoméstico com nome bem longo"). O `autoTable` quebra texto dentro da célula, mas a linha ficará mais alta. Isso é aceitável, porém deve ser verificado visualmente.

2. **Primeira vez que `autoTable` é usado no projeto**: a integração com o objeto `doc` do jsPDF exige que o import seja feito corretamente (`import autoTable from 'jspdf-autotable'` chamado sobre o `doc`). Um erro de importação não quebraria o formulário, mas produziria um PDF com a seção de eletros em branco.

3. **Ambiente do tipo "outros"**: este formType inclui tanto eletros quanto eletrônicos no mesmo ambiente. O PDF renderizará as duas tabelas sequencialmente, uma após a outra. É preciso verificar se há espaço suficiente entre elas ou se o `autoTable` gerencia isso corretamente.

4. **Link sem protocolo**: se o usuário digitou uma URL sem "https://" (ex: "www.site.com.br"), a anotação de link PDF pode não funcionar em todos os leitores. O risco é baixo pois a validação do campo `link` não é escopo deste PRD e o comportamento atual (exibir o texto bruto) seria pior.

---

## Critérios de aceitação

Cada critério descreve um cenário com a entrada e o resultado esperado no PDF gerado.

---

### CA-01 — Eletros em linha única

**Cenário:** Um ambiente do tipo Cozinha com dois eletros cadastrados — um Fogão Piso (Largo: 60, Alt: 85, Prof: 60, sem modelo, sem link) e um Microondas Embutido (Largo: 55, Alt: 30, Prof: 35, Modelo: "Electrolux ME41S", sem link).

**Esperado:** O PDF exibe uma tabela com duas linhas de dados (uma por eletro). A primeira linha mostra: "Fogão — Piso" / "—" / "60" / "85" / "60" / "—". A segunda linha mostra: "Microondas — Embutido" / "Electrolux ME41S" / "55" / "30" / "35" / "—". Não aparecem mais linhas separadas do tipo "Eletro 1", "Largura (cm)", "Altura (cm)" etc.

---

### CA-02 — Link clicável

**Cenário:** Um eletro do tipo Refrigerador Inverse tem o campo Link preenchido com uma URL válida (ex: "https://loja.com/produto").

**Esperado:** Na coluna Link da linha correspondente, aparece o texto "Ver link". Ao clicar nesse texto no leitor de PDF, o navegador abre a URL informada. As demais linhas da tabela, cujos eletros não têm link, exibem "—" sem comportamento de clique.

---

### CA-03 — Eletros sem link e sem modelo

**Cenário:** Todos os eletros de um ambiente têm os campos Modelo e Link vazios.

**Esperado:** As colunas Modelo e Link da tabela exibem "—" em todas as linhas. A tabela é renderizada normalmente, sem linhas ou colunas ocultas.

---

### CA-04 — Eletrônicos em Home/Sala

**Cenário:** Um ambiente do tipo Home/Sala tem dois eletrônicos — uma TV (Largo: 120, Alt: 75, Prof: 10, sem link) e um Home Theater (Largo: 40, Alt: 20, Prof: 30, Link preenchido).

**Esperado:** O PDF exibe uma tabela de eletrônicos com duas linhas. A coluna Tipo mostra a saída de `descreverEletronico()` para cada item. A coluna Modelo exibe "—" em ambas as linhas. A linha do Home Theater exibe "Ver link" clicável na coluna Link; a linha da TV exibe "—".

---

### CA-05 — Ambiente com eletros E eletrônicos (tipo "outros")

**Cenário:** Um ambiente do tipo "Outros" tem um eletro cadastrado e um eletrônico cadastrado.

**Esperado:** O PDF exibe duas tabelas separadas nesse bloco de ambiente: primeiro a tabela de eletrodomésticos (com um linha) e depois a tabela de eletrônicos (com uma linha). Cada tabela tem seu cabeçalho de colunas próprio.

---

### CA-06 — Sem eletros definidos

**Cenário:** Um ambiente do tipo Cozinha tem a pergunta "Já possui ou tem intenção de compra?" respondida como "Não" (campo `eletrosDefined = false`).

**Esperado:** Nenhuma tabela é exibida nesse bloco. O comportamento é idêntico ao atual: apenas a linha da pergunta com a resposta "Não" aparece. Nenhuma regressão.

---

### CA-07 — Múltiplos eletros com quebra de página

**Cenário:** Um ambiente com oito eletros, suficiente para que a tabela ultrapasse o rodapé de uma página.

**Esperado:** A tabela é quebrada automaticamente e continua na página seguinte. O cabeçalho de colunas (Tipo, Modelo, Largura etc.) é repetido no topo da continuação. O conteúdo abaixo da tabela (ex: observações do ambiente) aparece após o fim da tabela na nova página.

---

### CA-08 — Resto do PDF intacto

**Cenário:** Um checklist completo com múltiplos ambientes, perguntas globais respondidas, CCs geradas e resumo executivo.

**Esperado:** O cabeçalho, o resumo executivo, as perguntas globais com suas CCs, as perguntas específicas de cada ambiente, observações e todos os demais elementos do PDF permanecem idênticos ao comportamento atual. A única diferença visível é a substituição dos blocos de eletros e eletrônicos pelas tabelas descritas acima.

---

### CA-09 — Depurador Embutido (caso com Modelo e Link obrigatórios)

**Cenário:** Um eletro do tipo Depurador Embutido com Modelo e Link preenchidos (campos obrigatórios para esse tipo segundo a validação existente).

**Esperado:** A tabela exibe o Modelo na coluna correta e "Ver link" clicável na coluna Link, igual ao comportamento dos demais eletros com esses campos preenchidos.

---

### CA-10 — Tipo "Outros" no eletro

**Cenário:** Um eletro com tipo "Outros" e o campo Descrição preenchido com "Adega climatizada".

**Esperado:** A coluna Tipo da tabela exibe "Outros — Adega climatizada" (saída de `descreverEletro()`, que já trata esse caso). O restante das colunas segue o comportamento padrão.
