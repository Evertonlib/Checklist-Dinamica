# PRD — Polegadas da TV por Eletrônico

**Status:** Aguardando aprovação  
**Data:** 2026-06-08  
**Autor:** Claude (gerado após pesquisa da base de código)

---

## 1. Objetivo

Mover o campo de polegadas de cada TV do nível do ambiente para dentro do próprio objeto do eletrônico na lista `eletronicosList`. Com isso, cada TV cadastrada passa a ter suas próprias polegadas, eliminando o problema atual de dois TVs no mesmo ambiente compartilharem um único valor.

Junto a essa mudança, corrigir a tabela de eletrônicos no PDF para exibir o tipo do eletrônico na coluna Tipo e o modelo na coluna Modelo — separados, como devem estar.

---

## 2. Problema atual

### 2a. Campo `tv_polegadas` no nível do ambiente

Hoje, quando o usuário cadastra TVs no formulário de Home/Sala/Office ou Outros, as polegadas são salvas em `resp.tv_polegadas` — um campo único no nível da resposta do ambiente. Esse campo não pertence a nenhuma TV em particular; pertence ao ambiente inteiro.

Consequência: se o usuário cadastrar duas TVs no mesmo ambiente (por exemplo, uma TV de 55" e uma de 32"), o campo `tv_polegadas` armazenará apenas o último valor preenchido, e ambas as TVs parecerão ter as mesmas polegadas.

### 2b. Modelo concatenado na coluna Tipo do PDF

A função `descreverEletronico()` no arquivo `pdf.js` monta uma string com `tipo — subtipo — modelo` e joga tudo na coluna **Tipo** da tabela de eletrônicos. A coluna **Modelo** recebe sempre o valor fixo `—`.

Resultado: para uma TV Samsung Q80, a coluna Tipo exibe `"TV — Samsung Q80"` e a coluna Modelo fica vazia. Isso é incorreto: o modelo deveria estar na coluna Modelo, e o Tipo deveria mostrar `"TV — 55""`.

---

## 3. Relação com os arquivos existentes

### Formulários de cadastro de eletrônicos

Existem dois formulários que permitem adicionar TVs à lista `eletronicosList`:

- **`FormHomeSalaOffice.jsx`** — para ambientes do tipo Home/Sala/Office
- **`FormOutros.jsx`** — para ambientes do tipo Outros

Ambos exibem um cartão por eletrônico adicionado. Quando o eletrônico é uma TV (`tipo === 'TV'`), mostram o campo de polegadas. Hoje esse campo lê e escreve diretamente em `resp.tv_polegadas` (campo do ambiente), usando a função `set()`. Após a mudança, deve ler e escrever em `eletronico.polegadas` (campo do próprio objeto da TV), usando a função `updEletronico()`.

O formulário **`FormDormitorio.jsx`** não será tocado. Nele, a TV é um campo separado (`resp.tv`), com seus próprios campos no nível do ambiente (`tv_polegadas`, `tv_modelo`, etc.). Essa é uma estrutura diferente e não faz parte desta melhoria.

### Schema de dados

O arquivo `schema.js` define os valores padrão de cada ambiente. Hoje `home` e `outros` têm `tv_polegadas: null` como campo do ambiente. Esse campo deve ser removido desses dois tipos. O `dormitorio` fica intocado.

### Validação

O arquivo `formUtils.js` valida os formulários antes de avançar. Para formulários do tipo `home` e `outros`, hoje verifica se `resp.tv_polegadas` está preenchido quando há uma TV. Após a mudança, a validação deve verificar `eletronico.polegadas` dentro de cada TV na lista.

### Geração do PDF

O arquivo `pdf.js` contém a função `descreverEletronico()` (linhas 61–72) e o trecho que constrói as linhas da tabela de eletrônicos (linhas 461–499). Ambos precisam de ajuste:

- `descreverEletronico()` deve montar a string da coluna Tipo sem incluir o modelo. Para TV, o resultado deve ser `"TV — 55""` (tipo + polegadas com símbolo de polegada). Para os demais, apenas `"tipo"` ou `"tipo — subtipo"` se houver subtipo.
- O construtor de linhas da tabela hoje passa `'—'` fixo na coluna Modelo. Deve passar `eletronico.modelo` (ou `'—'` se vazio).

### Motor de pontuação e comunicados

O arquivo `scoreEngine.js` detecta se há TV em um ambiente verificando `resp.eletronicosList.some(e => e.tipo === 'TV')`. Essa lógica não depende de `tv_polegadas` e continuará funcionando sem alteração. O arquivo `ccBuilder.js` também não usa `tv_polegadas` e não será tocado.

---

## 4. O que será adicionado

- Campo `polegadas` dentro de cada objeto de eletrônico do tipo TV na lista `eletronicosList`, quando o usuário cadastra uma TV nos formulários Home/Sala/Office ou Outros.
- Exibição das polegadas na coluna Tipo da tabela de eletrônicos no PDF, no formato `"TV — 55""`.
- Exibição do modelo do eletrônico na coluna Modelo do PDF (para TVs e para os demais eletrônicos também).

---

## 5. O que será removido

- O campo `tv_polegadas` do nível do ambiente (nível `resp`) nos tipos `home` e `outros`, tanto nos defaults do `schema.js` quanto nos formulários.
- A lógica de validar `resp.tv_polegadas` em `formUtils.js` para os tipos `home` e `outros`.
- A concatenação do modelo dentro de `descreverEletronico()`, que hoje o joga na coluna Tipo erroneamente.

---

## 6. O que não será tocado

- **`FormDormitorio.jsx`** — TV no dormitório tem estrutura própria, com campo `tv_polegadas` no nível do ambiente. Essa estrutura é correta para esse caso (um único TV declarado via sim/não, não via lista).
- **Defaults de dormitório em `schema.js`** — Os campos `tv_polegadas`, `tv_modelo`, `tv_largura_cm`, etc. no tipo `dormitorio` ficam intactos.
- **O bloco do PDF que exibe perguntas textuais de TV** (linhas 358–376 em `pdf.js`) — Esse bloco imprime as respostas da pergunta "Terá TV neste ambiente?" no estilo questionário, e é relevante apenas para dormitório. Não será alterado.
- **`scoreEngine.js`** e **`ccBuilder.js`** — Não dependem de `tv_polegadas`.
- **`FormProvider.jsx`** — O reducer apenas armazena os objetos que recebe; não constrói a estrutura do eletrônico.
- **Todos os outros formulários** — `FormCozinha.jsx`, `FormBanheiro.jsx`, o passo de identificação, o resumo, o passo de sucesso, os componentes de UI, etc.
- **Nenhuma outra coluna da tabela de eletrônicos** — Largura, Altura, Profundidade e Link continuam exatamente como estão.
- **A tabela de eletrodomésticos** (da cozinha) — `descreverEletro()` e a tabela de eletros não serão tocados.

---

## 7. Premissas assumidas

- O símbolo de polegada utilizado na exibição será `"` (aspas duplas), conforme convenção brasileira. Exemplo: `55"`.
- O campo `polegadas` no objeto da TV será iniciado com string vazia `''` ao adicionar uma nova TV, seguindo o mesmo padrão dos outros campos (`modelo: ''`, `link: ''`).
- O campo `polegadas` é obrigatório para eletrônicos do tipo TV (igual ao comportamento atual de `tv_polegadas`). A mensagem de erro ficará vinculada ao card da TV específica, não ao ambiente inteiro.
- A chave do erro de validação para polegadas seguirá o padrão já existente para os outros campos do card: `eletronico_${index}_polegadas`.
- Formulários salvos atualmente no localStorage (rascunhos) podem não ter o campo `polegadas` dentro dos objetos de eletrônico. Isso é aceitável — o campo simplesmente aparecerá vazio ao reabrir o rascunho, e o usuário precisará preencher novamente. Não será escrita lógica de migração de dados legados.
- O campo `tvPontoFinal` continua no nível do ambiente (não será movido para dentro do objeto da TV nesta melhoria). Isso significa que, se houver duas TVs no mesmo ambiente, ambas compartilharão a mesma resposta sobre o ponto elétrico — porém isso não faz parte do escopo solicitado.

---

## 8. Riscos identificados

**Risco 1 — Rascunhos salvos no localStorage**  
Usuários com rascunhos em andamento que já têm TVs cadastradas terão `tv_polegadas` no nível do ambiente e os objetos de TV sem o campo `polegadas`. O campo aparecerá em branco e a validação exigirá que seja preenchido novamente. Impacto baixo, mas o usuário pode estranhar se estiver com um formulário a meio.

**Risco 2 — Consistência entre FormHomeSalaOffice e FormOutros**  
Os dois formulários são independentes e muito similares. Se a mudança for feita em um e esquecida no outro, a funcionalidade ficará quebrada em um dos tipos de ambiente. Atenção redobrada ao aplicar as mudanças nos dois arquivos.

**Risco 3 — `tvPontoFinal` ainda compartilhado**  
Assim como `tv_polegadas`, o campo `tvPontoFinal` é armazenado no nível do ambiente. Com dois TVs no mesmo ambiente, ambas continuarão compartilhando o ponto elétrico. Não é um risco criado por esta melhoria (o problema já existe), mas é algo que pode ficar inconsistente visualmente: o card de uma TV pode exibir a resposta preenchida para outra TV. Vale registrar para uma melhoria futura.

**Risco 4 — PDF para rascunhos antigos sem `polegadas` no objeto**  
Se alguém gerar o PDF a partir de um rascunho salvo antes da mudança, a coluna Tipo para TV mostrará apenas `"TV"` (sem polegadas), pois `eletronico.polegadas` estará indefinido. Não é um erro crítico; o restante do PDF ficará correto.

---

## 9. Critérios de aceitação

### Formulário

**Cenário 1 — Cadastro de uma TV com polegadas**  
Entrada: usuário abre um ambiente Home, clica em "+ TV", preenche "55" no campo Polegadas e demais campos obrigatórios.  
Resultado esperado: o objeto da TV salvo na lista possui o campo `polegadas: "55"`. O campo `resp.tv_polegadas` não existe mais no estado do ambiente.

**Cenário 2 — Cadastro de duas TVs no mesmo ambiente com polegadas diferentes**  
Entrada: usuário adiciona duas TVs no mesmo ambiente Home, preenche "55" para a primeira e "32" para a segunda.  
Resultado esperado: o primeiro objeto tem `polegadas: "55"` e o segundo tem `polegadas: "32"`. Os dois valores ficam independentes; alterar um não afeta o outro.

**Cenário 3 — Tentativa de avançar sem preencher polegadas de uma TV**  
Entrada: usuário adiciona uma TV mas não preenche o campo Polegadas e tenta avançar para o próximo passo.  
Resultado esperado: o formulário bloqueia o avanço e exibe a mensagem de erro "Obrigatório" abaixo do campo Polegadas daquela TV específica.

**Cenário 4 — Tentativa de avançar sem preencher polegadas da segunda TV (quando há duas)**  
Entrada: usuário adiciona duas TVs, preenche polegadas da primeira mas não da segunda, e tenta avançar.  
Resultado esperado: o formulário bloqueia e exibe o erro apenas no card da segunda TV. O card da primeira TV não exibe erro.

**Cenário 5 — Eletrônico que não é TV não exibe campo Polegadas**  
Entrada: usuário adiciona um Home Theater.  
Resultado esperado: o card do Home Theater não exibe o campo Polegadas (campo exclusivo do tipo TV).

**Cenário 6 — Remoção de uma TV não afeta as outras**  
Entrada: usuário tem duas TVs cadastradas e remove a primeira.  
Resultado esperado: as polegadas da segunda TV permanecem intactas.

### PDF

**Cenário 7 — Coluna Tipo exibe polegadas para TV**  
Entrada: formulário com uma TV de 55" cadastrada.  
Resultado esperado: a tabela de eletrônicos no PDF exibe `"TV — 55""` na coluna Tipo para essa linha.

**Cenário 8 — Coluna Tipo exibe polegadas da TV correta quando há duas TVs**  
Entrada: formulário com duas TVs — uma de 55" e outra de 32".  
Resultado esperado: a primeira linha da tabela exibe `"TV — 55""` e a segunda exibe `"TV — 32""`, na mesma ordem em que foram cadastradas.

**Cenário 9 — Coluna Modelo exibe o modelo do eletrônico**  
Entrada: formulário com uma TV com modelo "Samsung Q80" e um Home Theater com modelo "Sony HT-S2000".  
Resultado esperado: a coluna Modelo exibe "Samsung Q80" para a TV e "Sony HT-S2000" para o Home Theater. Nenhuma das duas aparece na coluna Tipo.

**Cenário 10 — Coluna Modelo exibe traço quando modelo não foi preenchido**  
Entrada: usuário cadastra uma TV sem preencher o campo Modelo.  
Resultado esperado: a coluna Modelo da tabela exibe `—` para essa TV.

**Cenário 11 — Coluna Tipo para eletrônico sem subtipo não muda**  
Entrada: formulário com um Videogame cadastrado (tipo sem subtipos, sem polegadas).  
Resultado esperado: a coluna Tipo exibe `"Videogame"` normalmente.

**Cenário 12 — TV no dormitório não é afetada**  
Entrada: formulário com um dormitório onde TV foi declarada com 65" nos campos dedicados do formulário de dormitório.  
Resultado esperado: o PDF do dormitório exibe "Polegadas: 65" no bloco de respostas textuais, sem alteração. O formulário do dormitório continua funcionando normalmente.

### Erro

**Cenário 13 — TV adicionada em rascunho antigo (sem campo `polegadas` no objeto)**  
Entrada: rascunho salvo antes da mudança, com TV em `eletronicosList` sem o campo `polegadas`.  
Resultado esperado: o card da TV exibe o campo Polegadas em branco (não quebra a tela); a validação impede o avanço até que seja preenchido; o PDF, se gerado, exibe `"TV"` na coluna Tipo (sem polegadas), sem erro crítico.
