# PRD — Diferenciação de Tipo de Tanque (Tanque Tradicional vs. Tanque Embutido na Bancada)

**Status:** Aguardando aprovação
**Data:** 2026-07-22
**Projeto:** Checklist Dinâmica — By Arabi Planejados
**Autor:** Claude (gerado após pesquisa da base de código)
**Substitui em escopo:** `PRDS_E_SPECS/PRD_DIFERENCIACAO_TANQUE_COZINHA.md` (mantido no repositório apenas como histórico; seu escopo restrito à Cozinha foi descartado e é substituído por este documento, que cobre todos os ambientes com o fluxo de tanque)

---

## 1. Objetivo

Corrigir um erro funcional no fluxo de perguntas de tanque: hoje, sempre que o cliente informa que "haverá móveis na região do tanque", o sistema gera um CC (Cliente Ciente) pedindo a remoção do tanque existente — mesmo quando o tanque em questão está **embutido na bancada de granito**, caso em que a estrutura ao redor é intencional (serve de apoio) e não deve ser removida.

A melhoria adiciona uma nova pergunta, com o texto **"Qual o tipo de tanque?"**, logo após "Existe tanque no local?", com duas opções:

1. **"Tanque tradicional (de porcelana ou plástico, apoiado no chão)"**; ou
2. **"Tanque embutido na bancada de granito"**.

Regra de negócio final, igual para **todos os ambientes que hoje têm o fluxo de tanque**:

- **Tanque tradicional** → mantém o comportamento atual do sistema: a pergunta "Haverá móveis na região do tanque?" continua sendo feita e, se a resposta for "Sim", o CC de remoção do tanque continua sendo gerado.
- **Tanque embutido na bancada de granito** → a pergunta "Haverá móveis na região do tanque?" deixa de ser exibida, e o sistema não gera o CC de remoção nem os pontos de risco associados nesse ponto do fluxo, pois a estrutura ao redor é intencional.

Diferença em relação ao PRD anterior (`PRD_DIFERENCIACAO_TANQUE_COZINHA.md`): aquele documento restringia a correção apenas ao ambiente Cozinha e tratava o ambiente "Outros" — que tem exatamente o mesmo problema — como fora de escopo. Essa restrição foi descartada a pedido do responsável pelo projeto. Este PRD cobre **todos os ambientes que hoje possuem o fluxo "Existe tanque no local?" → "Haverá móveis na região do tanque?"**, identificados na seção 3 abaixo.

---

## 2. Nomenclatura confirmada no código (pesquisa da base de código)

### 2.1 "CC" significa "Cliente Ciente"

O termo **CC** já é usado literalmente na base de código com o significado **"Cliente Ciente"**, confirmado em `PRDS_E_SPECS/PRD_CHECKLIST_DINAMICA_CLIENTE.md`. Não existe no código nem na documentação o termo "Comunicado de Compra". Na interface (`FormCozinha.jsx`, `FormOutros.jsx`) e no PDF, o rótulo usado é sempre `CC:` seguido do texto legal. No domínio (`src/domain/ccBuilder.js`), cada item gerado tem um atributo `tipo` com valor `'CC'` (itens de risco) ou `'AVISO'` (avisos informativos sem risco). Este PRD usa "CC" nesse sentido em todo o documento.

### 2.2 "Madeiramento" no pedido do usuário = pergunta de móveis (`tanqueMoveis`)

Uma busca em toda a base de código não encontrou nenhuma ocorrência da palavra "madeiramento". A única pergunta de acompanhamento existente após "Existe tanque no local?" em qualquer ambiente é:

> **"Haverá móveis na região do tanque?"** — campo de resposta `tanqueMoveis` no estado do ambiente.

Esta é a pergunta que, quando respondida "Sim", gera o CC de remoção do tanque. Este PRD assume, como na versão anterior, que o termo "madeiramento" do pedido informal se refere a esta pergunta — é a única pergunta do fluxo de tanque que gera CC de remoção.

### 2.3 Estrutura de pergunta condicional já usada no projeto

O projeto não usa uma "engine" de perguntas condicionais genérica. Cada tipo de ambiente tem um componente de formulário próprio (`FormCozinha.jsx`, `FormOutros.jsx`, `FormBanheiro.jsx`, `FormDormitorio.jsx`, `FormHomeSalaOffice.jsx`), lido via `src/steps/StepPerguntasPorAmbiente/StepPerguntasPorAmbiente.jsx`, que mapeia o `formType` da instância do ambiente para o componente correto (`FORM_MAP`). Cada formulário segue o mesmo padrão:

- Lê a resposta atual do ambiente a partir do contexto do formulário (hook `useFormContext`, `src/context/FormContext.js`).
- Renderiza uma sub-pergunta de forma condicional, apenas quando a pergunta "pai" foi respondida de determinada forma.
- Despacha a resposta através da ação genérica `SET_RESPOSTA_AMBIENTE` do reducer em `src/context/FormProvider.jsx` (confirmado nas linhas 160-173), que grava o campo informado dentro de `respostasPorAmbiente[instanceId]` sem qualquer lógica específica de tanque.
- Usa um helper local `simNao(...)`, declarado dentro de cada formulário, que renderiza os dois botões de uma escolha binária. Em `FormCozinha.jsx` (linhas 42-56) esse helper já aceita rótulos customizados para os dois botões (parâmetros `valorTrue`/`valorFalse`), embora hoje nenhuma pergunta da Cozinha use rótulos customizados. Em `FormOutros.jsx` (linhas 30-43) o helper equivalente ainda não aceita rótulos customizados — apenas "Sim"/"Não" fixos.
- A regra de negócio que decide se um CC deve ou não ser gerado **não fica no componente de formulário** — o formulário apenas grava a resposta bruta e exibe o texto do CC localmente como pré-visualização. Quem decide se o gatilho do CC entra na lista oficial é `src/domain/scoreEngine.js`, e quem monta o texto final do CC a partir do gatilho é `src/domain/ccBuilder.js`.

---

## 3. Ambientes com o fluxo de tanque hoje — reconfirmação pela leitura do código

### 3.1 Catálogo de ambientes (`src/domain/ambientes.js`)

```
{ id: 'cozinha',             label: 'Cozinha / Área de Serviço', formType: 'cozinha'    }
{ id: 'dormitorio_casal',    label: 'Dormitório Casal',          formType: 'dormitorio' }
{ id: 'dormitorio_solteiro', label: 'Dormitório Solteiro',       formType: 'dormitorio' }
{ id: 'banheiro',            label: 'Banheiro / W.C.',           formType: 'banheiro'   }
{ id: 'home',                label: 'Home / Sala',               formType: 'home'       }
{ id: 'office',              label: 'Office',                    formType: 'home'       }
{ id: 'varanda',             label: 'Varanda / Área Gourmet',    formType: 'cozinha'    }
{ id: 'outros',              label: 'Outros',                    formType: 'outros'     }
```

E o mapeamento formulário exibido por `formType`, em `StepPerguntasPorAmbiente.jsx` (linhas 14-20):

```
cozinha:    FormCozinha
dormitorio: FormDormitorio
home:       FormHomeSalaOffice
banheiro:   FormBanheiro
outros:     FormOutros
```

**Achado relevante que o PRD anterior não registrou:** o catálogo de ambientes tem **dois itens selecionáveis pelo usuário com `formType: 'cozinha'`** — "Cozinha / Área de Serviço" **e** "Varanda / Área Gourmet". Como a renderização do formulário é feita por `formType` (não por `id` do ambiente), ambos os itens do catálogo usam exatamente o mesmo componente `FormCozinha.jsx`. Isso significa que o problema do tanque, e a correção proposta aqui, já afetam hoje — e vão passar a valer, com uma única alteração de código — tanto para "Cozinha / Área de Serviço" quanto para "Varanda / Área Gourmet". Da mesma forma, "Home / Sala" e "Office" compartilham `formType: 'home'`, mas esse `formType` não tem pergunta de tanque (ver 3.3), então não é afetado.

### 3.2 Ambientes confirmados com o fluxo de tanque

Pela leitura de cada formulário nesta pesquisa:

- **`src/steps/StepPerguntasPorAmbiente/FormCozinha.jsx`** (bloco "Tanque", linhas 76-90) — tem "Existe tanque no local?" (`tanque`) seguido de "Haverá móveis na região do tanque?" (`tanqueMoveis`), com preview do CC quando `tanqueMoveis === true`. Usado pelos ambientes de catálogo "Cozinha / Área de Serviço" **e** "Varanda / Área Gourmet".
- **`src/steps/StepPerguntasPorAmbiente/FormOutros.jsx`** (bloco "2. Tanque Existente", linhas 99-113) — reproduz exatamente a mesma estrutura: `tanque` seguido de `tanqueMoveis`, mesmo texto de CC. Usado pelo ambiente de catálogo "Outros".

### 3.3 Ambientes reconfirmados SEM o fluxo de tanque

- **`src/steps/StepPerguntasPorAmbiente/FormBanheiro.jsx`** — lido por completo (68 linhas). Contém apenas os blocos "Granito / Pia Existente", "Cuba" e "Observações". Não há nenhuma referência a `tanque` ou `tanqueMoveis` no arquivo, nem em `defaultsPorFormType.banheiro` no `schema.js`.
- **`src/steps/StepPerguntasPorAmbiente/FormDormitorio.jsx`** — lido por completo (187 linhas). Contém "Tamanho da Cama", "TV", "Cortineiro" e "Rodapé". Nenhuma referência a `tanque`.
- **`src/steps/StepPerguntasPorAmbiente/FormHomeSalaOffice.jsx`** — lido por completo (236 linhas), usado tanto por "Home / Sala" quanto por "Office" (mesmo `formType: 'home'`). Contém "Eletrônicos", "Cortineiro" e "Rodapé". Nenhuma referência a `tanque`.

Confirmação cruzada em `src/domain/schema.js`: os blocos `defaultsPorFormType.dormitorio`, `defaultsPorFormType.home` e `defaultsPorFormType.banheiro` não têm as chaves `tanque` nem `tanqueMoveis`. Apenas `defaultsPorFormType.cozinha` e `defaultsPorFormType.outros` têm essas duas chaves.

### 3.4 Lista final de ambientes afetados por este PRD

| Ambiente de catálogo | `formType` | Componente de formulário | Afetado? |
|---|---|---|---|
| Cozinha / Área de Serviço | `cozinha` | `FormCozinha.jsx` | Sim |
| Varanda / Área Gourmet | `cozinha` | `FormCozinha.jsx` | Sim (mesma alteração de `FormCozinha.jsx`) |
| Outros | `outros` | `FormOutros.jsx` | Sim |
| Dormitório Casal / Dormitório Solteiro | `dormitorio` | `FormDormitorio.jsx` | Não — sem pergunta de tanque |
| Home / Sala / Office | `home` | `FormHomeSalaOffice.jsx` | Não — sem pergunta de tanque |
| Banheiro / W.C. | `banheiro` | `FormBanheiro.jsx` | Não — sem pergunta de tanque |

---

## 4. Onde a pergunta e o CC vivem hoje no código (todos os pontos, para os dois ambientes)

### 4.1 Pergunta e sub-pergunta no formulário

Em `FormCozinha.jsx` (linhas 76-90) e em `FormOutros.jsx` (linhas 99-113), a pergunta "Existe tanque no local?" é exibida com os dois botões padrão Sim/Não. Quando a resposta é "Sim", a sub-pergunta "Haverá móveis na região do tanque?" aparece logo abaixo. Quando essa sub-pergunta é respondida "Sim", um texto de pré-visualização do CC aparece imediatamente na tela, prefixado por "CC:". Hoje esse texto aparece sempre que há tanque e há móveis na região — não importa se o tanque é tradicional ou embutido na bancada de granito.

### 4.2 Geração do gatilho que decide o CC — bloco único compartilhado

Em `src/domain/scoreEngine.js` (linhas 65-71), existe **um único bloco de código** dedicado ao tanque, já compartilhado entre os dois `formType` afetados:

```js
// Tanque → Cozinha, Outros
if (['cozinha', 'outros'].includes(formType)) {
  if (resp.tanque === true && resp.tanqueMoveis === true) {
    gatilhosAtivados.push(`TANQUE_RETIRAR_${instanceId}`)
    gatilhosAmbiente.push({ id: `TANQUE_RETIRAR_${instanceId}`, nivel: 'Médio', pontos: 2 })
  }
}
```

Não há dois ramos separados por ambiente — é uma única condição que verifica se o `formType` da instância está entre `['cozinha', 'outros']`. Isso significa que **uma única alteração nesse bloco, acrescentando a condição do tipo de tanque, cobre automaticamente os dois ambientes** (e, por consequência, também "Varanda / Área Gourmet", que usa `formType: 'cozinha'`).

### 4.3 Montagem do texto final do CC

Em `src/domain/ccBuilder.js` (linhas 108-117), quando o gatilho `TANQUE_RETIRAR_${instanceId}` está presente na lista de gatilhos ativos, o sistema monta um item de CC com nível "MÉDIO", vinculado ao ambiente correspondente, usando o texto fixo de remoção de tanque e identificando a pergunta de origem como "P2.1". Este trecho **não faz nenhuma distinção por `formType`** — ele apenas verifica se o id do gatilho está na lista `gatilhosAtivados`, que já vem filtrada pelo `scoreEngine.js`. Ou seja, este arquivo já é genérico e não precisa de nenhuma alteração para cobrir os ambientes afetados.

O texto do CC, definido em `src/domain/checklistTextos.js` (`TEXTO_TANQUE_RETIRAR`, linhas 4-5), é:

> "CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR TANQUE EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO."

Este CC só faz sentido para tanque tradicional (peça avulsa, removível). Para o tanque embutido na bancada de granito, não existe um "tanque" avulso a ser retirado.

### 4.4 Validação do formulário — bloco único compartilhado

Em `src/steps/StepPerguntasPorAmbiente/formUtils.js`, dentro de `validarFormularioAmbiente()` (linhas 127-136), existe uma verificação que exige resposta para "Existe tanque no local?" e, quando a resposta for "Sim", exige também resposta para "Haverá móveis na região do tanque?":

```js
if (['cozinha', 'outros'].includes(formType)) {
  if (resp.tanque === null) erros.tanque = 'Selecione uma opção'
  if (resp.tanque === true && resp.tanqueMoveis === null) {
    erros.tanqueMoveis = 'Selecione uma opção'
  }
  ...
}
```

Assim como em `scoreEngine.js`, é **um único bloco compartilhado** por `['cozinha', 'outros']`, e não dois ramos separados. Uma única alteração cobre os dois ambientes.

### 4.5 Exibição no PDF — bloco único compartilhado

Em `src/services/pdf.js` (linhas 358-370), dentro do laço que percorre `state.ambientesSelecionados`, o gerador de PDF escreve a pergunta "Existe tanque no local?" com a resposta registrada e, quando a resposta for "Sim", escreve também "Haverá móveis na região do tanque?" com sua resposta, seguida do CC de remoção de tanque, se ele tiver sido gerado para aquele ambiente:

```js
if (['cozinha', 'outros'].includes(formType)) {
  escreverPergunta(
    'Existe tanque no local?',
    resp.tanque === true ? 'Sim' : resp.tanque === false ? 'Não' : '—'
  )
  if (resp.tanque === true) {
    escreverPergunta(
      'Haverá móveis na região do tanque?',
      resp.tanqueMoveis === true ? 'Sim' : resp.tanqueMoveis === false ? 'Não' : '—',
      [ccPorId.get(`TANQUE_RETIRAR_${instanceId}`)]
    )
  }
}
```

Também é um bloco único compartilhado, executado uma vez por ambiente dentro do laço — cobre "Cozinha / Área de Serviço", "Varanda / Área Gourmet" e "Outros" automaticamente.

### 4.6 Conclusão sobre o ponto (b) do pedido de pesquisa

O cálculo de score (`scoreEngine.js`), a validação (`formUtils.js`) e a exibição no PDF (`pdf.js`) usam, os três, **um único bloco condicional compartilhado** entre `cozinha` e `outros` — não há ramos separados por ambiente para o tanque. Uma única alteração em cada um desses três blocos, acrescentando a condição de tipo de tanque, cobre todos os ambientes afetados sem risco de esquecer um ramo. O `ccBuilder.js` é ainda mais genérico: nem verifica `formType`, apenas consome o gatilho já filtrado. O único ponto onde a alteração precisa necessariamente ser feita em dois lugares distintos é a **interface do formulário** (`FormCozinha.jsx` e `FormOutros.jsx` são componentes React separados, cada um com seu próprio JSX) e os **valores padrão do schema** (`defaultsPorFormType.cozinha` e `defaultsPorFormType.outros` são objetos distintos em `schema.js`).

---

## 5. Relação com os arquivos e padrões existentes

- O projeto é uma SPA em React 18 + Vite, sem biblioteca de formulários ou de máquina de estados — o estado do formulário inteiro é controlado por um único reducer central (`src/context/FormProvider.jsx`), com ações despachadas por cada componente de formulário. A melhoria deve seguir esse mesmo padrão, sem introduzir dependências novas.
- O padrão de "pergunta condicional que gera CC" já está estabelecido e é repetido em várias perguntas do projeto (granito → pergunta de adaptação de móveis, tanque → pergunta de móveis na região, TV → pergunta de ponto elétrico na posição final, cortineiro → pergunta de instalação): (1) campo bruto na resposta do ambiente, (2) sub-pergunta exibida condicionalmente no formulário, (3) gatilho calculado no motor de score, (4) texto final montado pelo construtor de CCs a partir do gatilho, (5) validação no arquivo de utilitários do formulário, (6) exibição espelhada no gerador de PDF. A nova pergunta de tipo de tanque deve seguir este mesmo padrão de ponta a ponta, apenas adicionando uma condição extra ao gatilho já existente — não um gatilho novo.
- Já existe no projeto um exemplo de campo de escolha com mais de duas opções textuais: o campo de tipo de cuba do Banheiro e de "Outros" (`TIPOS_CUBA` / `TIPOS_CUBA_OUTROS` em `formUtils.js`), que usa botões no estilo "chip" (`styles.chip` / `styles.chipAtivo`). É um padrão alternativo já existente, mas não é o mais simples para uma escolha binária como a solicitada.
- O padrão mais simples e mais aderente ao que já existe é reaproveitar o helper de escolha binária já declarado dentro de cada formulário (`simNao`). Em `FormCozinha.jsx` ele já aceita rótulos customizados nos dois botões (parâmetros `valorTrue`/`valorFalse`); em `FormOutros.jsx` ele hoje só aceita "Sim"/"Não" fixos e precisará ser ajustado (ou duplicado localmente para a nova pergunta) para aceitar rótulos customizados, ou a nova pergunta pode usar um bloco de dois botões próprio, sem depender do helper `simNao`. Qualquer uma das duas abordagens é simples e consistente com o restante do arquivo; a escolha exata fica para a fase de especificação técnica.

---

## 6. Arquivos afetados

### Arquivos a alterar na implementação futura

| Arquivo | Tipo de alteração |
|---|---|
| `src/domain/schema.js` | Adicionar o novo campo de resposta, iniciado como não respondido, em **dois** blocos de valores padrão: `defaultsPorFormType.cozinha` e `defaultsPorFormType.outros` |
| `src/steps/StepPerguntasPorAmbiente/FormCozinha.jsx` | Adicionar a nova pergunta de tipo de tanque logo após "Existe tanque no local?" e antes de "Haverá móveis na região do tanque?"; ocultar a pergunta de móveis quando o tipo for tanque embutido na bancada de granito. Afeta os ambientes de catálogo "Cozinha / Área de Serviço" e "Varanda / Área Gourmet" |
| `src/steps/StepPerguntasPorAmbiente/FormOutros.jsx` | Mesma alteração acima, aplicada de forma independente neste componente. Afeta o ambiente de catálogo "Outros" |
| `src/steps/StepPerguntasPorAmbiente/formUtils.js` | Adicionar validação da nova pergunta (obrigatória quando há tanque) e ajustar a obrigatoriedade da pergunta de móveis para não bloquear o avanço quando o tipo for tanque embutido na bancada de granito — dentro do bloco único já compartilhado por `['cozinha', 'outros']` |
| `src/domain/scoreEngine.js` | Adicionar a condição de tipo de tanque ao gatilho de remoção de tanque, dentro do bloco único já compartilhado por `['cozinha', 'outros']` |
| `src/services/pdf.js` | Exibir a nova pergunta e resposta no bloco de tanque do PDF (dentro do bloco único já compartilhado por `['cozinha', 'outros']`), na mesma posição em que aparece no formulário, e ocultar a pergunta/CC de móveis quando o tipo for tanque embutido na bancada de granito |
| `especificacao-checklist-dinamica.md` | Acrescentar a nova pergunta de tipo de tanque e a condição que ela cria sobre o CC de remoção. **Proibido renumerar as perguntas existentes** — a numeração `P2.1` e todas as demais permanecem exatamente como estão, pois `ccBuilder.js` referencia esses códigos |

### Arquivos verificados, mas não previstos para alteração

| Arquivo | Motivo |
|---|---|
| `src/domain/ccBuilder.js` | Já monta o CC a partir do gatilho `TANQUE_RETIRAR_${instanceId}` de forma genérica, sem checar `formType`; a supressão para tanque embutido na bancada de granito acontece antes, no cálculo do gatilho em `scoreEngine.js` |
| `src/domain/checklistTextos.js` | O texto legal do CC de remoção de tanque não muda; continua válido para o caso tradicional |
| `src/steps/StepRevisao/StepRevisao.jsx` | Consome a lista final de CCs (via `construirCCs`) e o score por ambiente (via `calcularScore`) já prontos; não tem lógica própria sobre tipo de tanque |
| `src/context/FormProvider.jsx` | O reducer `SET_RESPOSTA_AMBIENTE` é genérico; não precisa de ação nova nem de lógica específica de tanque |
| `src/domain/ambientes.js` | Catálogo de ambientes não muda; nenhum ambiente novo é criado; a cobertura de "Varanda / Área Gourmet" é automática por já compartilhar `formType: 'cozinha'` com "Cozinha / Área de Serviço" |
| `src/steps/StepPerguntasPorAmbiente/FormBanheiro.jsx`, `FormDormitorio.jsx`, `FormHomeSalaOffice.jsx` | Reconfirmado nesta pesquisa (seção 3.3): não têm pergunta de tanque |
| Valores padrão de `dormitorio`, `home` e `banheiro` em `src/domain/schema.js` | Não têm os campos `tanque`/`tanqueMoveis` hoje; fora de escopo |
| `src/steps/StepPerguntasPorAmbiente/StepPerguntasPorAmbiente.jsx` | Apenas roteia para o componente de formulário certo por `formType` e chama a validação genérica; não precisa de lógica nova |

---

## 7. O que será adicionado

1. Um novo campo de resposta, adicionado tanto em `defaultsPorFormType.cozinha` quanto em `defaultsPorFormType.outros` no `schema.js`, iniciado como não respondido, representando o tipo de tanque informado pelo cliente. Sugestão de nome, seguindo a convenção de campos booleanos já usada no projeto (como os campos que registram se o granito será adaptado ou se há móveis na região do tanque): **`tanqueEmbutido`**, onde um valor representaria "Tanque embutido na bancada de granito" e o outro representaria "Tanque tradicional (de porcelana ou plástico, apoiado no chão)". O nome exato pode ser ajustado na fase de especificação técnica, desde que a semântica dos dois valores seja preservada e igual nos dois ambientes.

2. Uma nova pergunta, com o texto **"Qual o tipo de tanque?"**, adicionada de forma independente em `FormCozinha.jsx` e em `FormOutros.jsx`, exibida somente quando "Existe tanque no local?" for respondida "Sim", posicionada entre essa pergunta e "Haverá móveis na região do tanque?". A pergunta apresenta duas opções com os textos completos:
   - "Tanque tradicional (de porcelana ou plástico, apoiado no chão)"
   - "Tanque embutido na bancada de granito"

   Como "Cozinha / Área de Serviço" e "Varanda / Área Gourmet" usam o mesmo componente `FormCozinha.jsx`, a alteração feita nesse arquivo aparece automaticamente para os dois ambientes de catálogo, sem exigir nenhum código adicional específico para "Varanda".

   Enquanto "Qual o tipo de tanque?" ainda não tiver sido respondida, a pergunta "Haverá móveis na região do tanque?" **não é exibida** no formulário (e, por consequência, não é impressa no PDF — ver item 5 abaixo). Ela só passa a existir depois que a opção "Tanque tradicional (de porcelana ou plástico, apoiado no chão)" for escolhida.

3. Uma condição adicional no cálculo do gatilho de remoção de tanque, no bloco único já compartilhado de `scoreEngine.js`: o gatilho (e, por consequência, o CC e os 2 pontos de risco Médio) só é gerado quando o tanque for do tipo tradicional **e** houver móveis na região. Quando o tipo for tanque embutido na bancada de granito, o gatilho não é gerado, independentemente da resposta sobre móveis — válido para todos os ambientes afetados (Cozinha, Varanda, Outros).

4. Validação obrigatória da nova pergunta: quando "Existe tanque no local?" for "Sim" em qualquer ambiente afetado, o usuário não pode avançar para a próxima etapa sem responder o tipo de tanque — seguindo o mesmo padrão de erro já usado nas demais perguntas condicionais do formulário.

5. Exibição da nova pergunta e da resposta escolhida no bloco de tanque do PDF, na mesma posição em que aparece no formulário (entre "Existe tanque no local?" e "Haverá móveis na região do tanque?"), para todos os ambientes afetados. O PDF imprime a pergunta **"Qual o tipo de tanque?"** com a resposta em texto por extenso, na versão curta: **"Tanque tradicional"** ou **"Embutido na bancada"**. O PDF nunca imprime "Sim"/"Não" para essa pergunta. Enquanto o tipo de tanque não tiver sido respondido, nem a pergunta "Qual o tipo de tanque?" nem "Haverá móveis na região do tanque?" são impressas.

6. Regra de reset ao alternar o tipo de tanque: sempre que a resposta de "Qual o tipo de tanque?" for alterada — em qualquer uma das duas direções (tradicional → embutido ou embutido → tradicional) — a resposta de "Haverá móveis na região do tanque?" volta ao estado "não respondido". Consequência: se o cliente escolher "Tanque embutido na bancada de granito" e depois voltar para "Tanque tradicional (de porcelana ou plástico, apoiado no chão)", ele precisa responder novamente "Haverá móveis na região do tanque?", e o CC de remoção só reaparece depois dessa nova resposta.

---

## 8. O que será removido

1. A obrigatoriedade de responder "Haverá móveis na região do tanque?" quando o tipo de tanque for tanque embutido na bancada de granito — essa sub-pergunta deixa de ser exibida e deixa de ser exigida nesse cenário, tanto no formulário quanto no PDF, em todos os ambientes afetados.

2. A geração do CC de remoção de tanque e dos 2 pontos de risco associados, exclusivamente para o cenário de tanque embutido na bancada de granito, em qualquer ambiente afetado. O CC continua sendo gerado normalmente para tanque tradicional, exatamente como hoje.

Nenhum texto legal existente é removido ou reescrito — o texto do CC de remoção de tanque permanece o mesmo, apenas passa a ser usado de forma condicionada ao tipo de tanque.

---

## 9. O que não será tocado

- A pergunta "Existe tanque no local?" em si — continua exatamente como está, com as mesmas opções "Sim"/"Não", em todos os ambientes afetados.
- A pergunta "Haverá móveis na região do tanque?" para o caso de tanque tradicional — continua com o mesmo texto, mesmo comportamento e mesmo CC.
- O texto legal do CC de remoção de tanque, em `checklistTextos.js`.
- As demais perguntas de Cozinha e Outros (granito, eletrodomésticos, eletrônicos, cortineiro, rodapé, tamanho de cama, cuba, observações).
- O motor de pontuação para os demais gatilhos (perguntas globais G1 a G5, granito, TV, eletros, eletrônicos, rodapé, cortineiro).
- A tela de Revisão e o Resumo Executivo do PDF — continuam consumindo a lista de CCs já pronta, sem qualquer lógica nova sobre tipo de tanque.
- O reducer genérico do `FormProvider.jsx` e o mecanismo de rascunho salvo no armazenamento local do navegador (`localStorage`, chave `byarabi_checklist_rascunho`).
- Os ambientes Banheiro, Dormitório (Casal e Solteiro) e Home/Sala/Office — reconfirmado que não têm pergunta de tanque; permanecem exatamente como estão.
- O catálogo de ambientes em `ambientes.js` — nenhum ambiente novo é criado, nenhum `formType` novo é criado.
- O conteúdo de `node_modules` e de artefatos gerados de build (`dist/`).

---

## 10. Premissas assumidas

1. **Interpretação do termo "madeiramento".** Assume-se que a pergunta problemática é a já existente "Haverá móveis na região do tanque?" (campo `tanqueMoveis`), pois é a única pergunta do fluxo de tanque que gera CC de remoção e o cenário descrito só se aplica a ela.

2. **Escopo abrange todos os ambientes com o fluxo de tanque hoje.** Diferente da versão anterior deste PRD, esta versão altera o formulário, a validação, o motor de score e o PDF tanto de Cozinha/Varanda quanto de Outros — os três pontos de catálogo que hoje compartilham o problema.

3. **Quando "Tanque embutido na bancada de granito" é selecionada, a pergunta "Haverá móveis na região do tanque?" deixa de ser exibida** (em vez de continuar aparecendo, porém sem gerar CC). Assume-se essa abordagem porque, para um tanque embutido no granito, a pergunta sobre "móveis na região do tanque" perde sentido prático — não existe um tanque avulso a ser cercado ou removido. Caso essa suposição não reflita a intenção do negócio, a alternativa (manter a pergunta visível, apenas sem gerar CC) deve ser indicada antes da implementação.

4. O novo campo de resposta é obrigatório sempre que "Existe tanque no local?" for "Sim", em qualquer ambiente afetado, seguindo o mesmo padrão de obrigatoriedade das demais sub-perguntas do projeto.

5. O novo campo é do tipo booleano (duas opções fixas, mutuamente exclusivas), iniciado como não respondido, seguindo o padrão de campos como a adaptação do granito e a presença de móveis na região do tanque, e não uma lista de múltiplas opções como o tipo de cuba do Banheiro/Outros.

6. **A mesma semântica e o mesmo nome de campo devem ser usados nos dois ambientes** (Cozinha/Varanda e Outros), já que ambos compartilham hoje o mesmo texto de pergunta, o mesmo texto de CC e o mesmo gatilho de score (`TANQUE_RETIRAR_${instanceId}`), diferenciados apenas pelo `instanceId`.

7. Rascunhos já salvos no armazenamento local do navegador antes desta mudança não terão o novo campo preenchido. Ao reabrir um rascunho com um ambiente afetado que já tenha "Existe tanque no local?" respondido "Sim", o novo campo aparecerá como não respondido e o usuário precisará escolher o tipo de tanque antes de avançar novamente por aquele ambiente — mesmo padrão de comportamento já aceito em melhorias anteriores do projeto (ver `PRDS_E_SPECS/PRD_POLEGADAS_TV.md`, Risco 1).

8. Não é necessário criar um novo tipo de CC nem um novo nível de risco. A mudança é uma condição adicional sobre o gatilho já existente de remoção de tanque, mantendo o mesmo nível "Médio" e os mesmos 2 pontos quando aplicável.

9. "Varanda / Área Gourmet" não exige nenhuma alteração de código própria — por compartilhar `formType: 'cozinha'` com "Cozinha / Área de Serviço", a alteração em `FormCozinha.jsx` cobre os dois automaticamente.

---

## 11. Riscos identificados

**Risco 1 — Divergência de terminologia ("madeiramento" vs. "móveis").**
Se a pergunta que o solicitante tinha em mente não for a pergunta "Haverá móveis na região do tanque?", a implementação resolveria o problema errado. Mitigação: confirmar a Premissa 1 com o solicitante antes de iniciar a implementação.

**Risco 2 — Dois componentes de formulário independentes exigem duas edições de interface.**
Diferente de `scoreEngine.js`, `formUtils.js` e `pdf.js` (que têm um único bloco condicional compartilhado — ver seção 4.6), `FormCozinha.jsx` e `FormOutros.jsx` são componentes React separados, cada um com seu próprio JSX. Um descuido pode fazer a nova pergunta aparecer em um formulário e ser esquecida no outro, deixando o comportamento inconsistente entre Cozinha/Varanda e Outros (esse mesmo tipo de risco já foi registrado antes no projeto — ver `PRD_POLEGADAS_TV.md`, Risco 2, para o par `FormHomeSalaOffice.jsx`/`FormOutros.jsx`). Mitigação: implementar e revisar visualmente os dois formulários lado a lado antes de considerar a melhoria concluída.

**Risco 3 — Nome e valores do novo campo precisam ser idênticos nos dois blocos de `schema.js`.**
`defaultsPorFormType.cozinha` e `defaultsPorFormType.outros` são objetos distintos. Se o novo campo for adicionado com nomes ou semânticas diferentes em cada bloco, o `scoreEngine.js`, o `formUtils.js` e o `pdf.js` (que leem o campo de forma genérica, sem saber o `formType`) podem se comportar de forma inconsistente entre os dois ambientes. Mitigação: usar exatamente o mesmo nome de campo e os mesmos dois valores possíveis nos dois blocos.

**Risco 4 — Pergunta "Haverá móveis" some sem aviso ao alternar o tipo de tanque.**
Se o usuário responder "Haverá móveis na região do tanque?" com "Sim" (gerando o CC), e depois voltar e mudar a resposta de "Tanque tradicional" para "Tanque embutido na bancada de granito", a pergunta de móveis (e o CC) deixam de aparecer imediatamente — e a resposta de móveis volta ao estado "não respondido" (ver seção 7, item 6). Isso é o comportamento correto e esperado, mas precisa ser validado visualmente em ambos os formulários para garantir que o CC não fique "preso" na tela por engano. Vale também no sentido inverso: se o usuário alternar de volta para "Tanque tradicional", precisará responder novamente "Haverá móveis na região do tanque?" antes que o CC possa reaparecer.

**Risco 5 — Rascunhos salvos no armazenamento local do navegador.**
Como descrito na Premissa 7, formulários de Cozinha, Varanda ou Outros já em andamento, com tanque já respondido, exigirão que o usuário responda a nova pergunta antes de conseguir avançar novamente por aquele ambiente. Impacto baixo, mesmo padrão já aceito em melhorias anteriores.

**Risco 6 — Nome do campo em conflito conceitual com o campo de cuba do Banheiro/Outros.**
O Banheiro e o "Outros" já têm um campo `cuba` que registra o tipo de cuba (Embutir, Semi-encaixe, Sobrepor, Apoio, Esculpida, e "Não se aplica" em Outros) — um conceito totalmente diferente do "tanque embutido na bancada de granito" desta melhoria. Não há conflito técnico, pois os campos pertencem a chaves diferentes dentro da mesma resposta de ambiente (em "Outros" os dois campos, `cuba` e o novo campo de tipo de tanque, conviveriam no mesmo objeto de resposta), mas o nome pode causar confusão para quem for implementar ou manter o código depois. Mitigação: evitar nomear o novo campo apenas como "cuba" ou similar; usar um nome que deixe claro que se trata do tipo de tanque (ex.: `tanqueEmbutido` ou `tanqueTipo`).

**Risco 7 — Helper `simNao` de `FormOutros.jsx` não aceita rótulos customizados hoje.**
Ao contrário de `FormCozinha.jsx`, cujo helper `simNao` já aceita `valorTrue`/`valorFalse` customizados, o helper equivalente em `FormOutros.jsx` (linhas 30-43) só produz botões fixos "Sim"/"Não". Implementar a nova pergunta de tipo de tanque em `FormOutros.jsx` exigirá adaptar esse helper (para aceitar rótulos customizados, replicando o padrão de `FormCozinha.jsx`) ou criar um bloco de botões específico só para essa pergunta, sem usar o helper genérico. Qualquer uma das duas opções é simples, mas a divergência precisa ser observada para não gerar um padrão de código diferente entre os dois arquivos sem necessidade.

---

## 12. Critérios de aceitação

### CA-01 — Nova pergunta aparece após "Existe tanque no local?" (Cozinha e Varanda)

Entrada: usuário está no formulário de um ambiente "Cozinha / Área de Serviço" ou "Varanda / Área Gourmet" e responde "Sim" para "Existe tanque no local?".

Resultado esperado: imediatamente abaixo, antes da pergunta "Haverá móveis na região do tanque?", aparece a nova pergunta com o texto **"Qual o tipo de tanque?"** e as duas opções: "Tanque tradicional (de porcelana ou plástico, apoiado no chão)" e "Tanque embutido na bancada de granito". Nenhuma das duas opções vem pré-selecionada. Enquanto nenhuma opção for escolhida, a pergunta "Haverá móveis na região do tanque?" não é exibida.

### CA-02 — Nova pergunta aparece após "Existe tanque no local?" (Outros)

Entrada: usuário está no formulário de um ambiente "Outros" e responde "Sim" para "Existe tanque no local?".

Resultado esperado: o mesmo comportamento do CA-01 ocorre também neste ambiente, de forma independente — incluindo o texto exato da pergunta, **"Qual o tipo de tanque?"**, e das duas opções.

### CA-03 — Nova pergunta não aparece quando não há tanque

Entrada: usuário responde "Não" para "Existe tanque no local?" em qualquer ambiente afetado (Cozinha, Varanda ou Outros).

Resultado esperado: nem a pergunta de tipo de tanque, nem a pergunta de móveis aparecem. O comportamento é idêntico ao atual.

### CA-04 — Tanque tradicional com móveis gera CC (comportamento preservado, todos os ambientes afetados)

Entrada: "Existe tanque no local?" = Sim; tipo de tanque = Tradicional; "Haverá móveis na região do tanque?" = Sim — testado em Cozinha, Varanda e Outros.

Resultado esperado: o CC "CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR TANQUE EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO." aparece no preview do formulário, na tela de Revisão, no Resumo Executivo do PDF e no bloco do ambiente no PDF — exatamente como acontece hoje antes desta melhoria. O score do ambiente soma os 2 pontos de risco Médio do gatilho de tanque.

### CA-05 — Tanque tradicional sem móveis não gera CC (comportamento preservado)

Entrada: "Existe tanque no local?" = Sim; tipo de tanque = Tradicional; "Haverá móveis na região do tanque?" = Não.

Resultado esperado: nenhum CC de remoção de tanque é gerado, em nenhum lugar do sistema. Comportamento idêntico ao atual, em qualquer ambiente afetado.

### CA-06 — Tanque embutido na bancada de granito nunca gera o CC de remoção (todos os ambientes afetados)

Entrada: "Existe tanque no local?" = Sim; tipo de tanque = Tanque embutido na bancada de granito — testado em Cozinha, Varanda e Outros.

Resultado esperado: a pergunta "Haverá móveis na região do tanque?" não é exibida no formulário. Nenhum CC de remoção de tanque é gerado para este ambiente — nem no preview do formulário, nem na tela de Revisão, nem no Resumo Executivo do PDF, nem no bloco do ambiente no PDF. O score do ambiente não soma os 2 pontos de risco Médio do gatilho de tanque.

### CA-07 — Alternância entre tradicional e tanque embutido com CC já visível

Entrada: usuário responde tipo de tanque = Tradicional, depois "Haverá móveis" = Sim (CC aparece), e em seguida volta e muda o tipo de tanque para Tanque embutido na bancada de granito.

Resultado esperado: assim que "Tanque embutido na bancada de granito" é selecionada, a pergunta "Haverá móveis na região do tanque?" e o CC associado desaparecem imediatamente da tela, sem exigir recarregar a página. A resposta anterior de "Haverá móveis" não fica apenas oculta — ela volta ao estado "não respondido" (ver CA-18). Válido em qualquer ambiente afetado.

### CA-08 — Bloqueio de avanço sem responder o tipo de tanque

Entrada: usuário responde "Sim" para "Existe tanque no local?", não seleciona nenhuma opção na nova pergunta de tipo de tanque, e tenta avançar para o próximo ambiente ou etapa.

Resultado esperado: o avanço é bloqueado, com mensagem de erro do tipo "Selecione uma opção" exibida junto à nova pergunta, seguindo o mesmo padrão visual das demais mensagens de erro do formulário. Válido em qualquer ambiente afetado.

### CA-09 — Bloqueio de avanço sem responder sobre móveis, apenas quando tradicional

Entrada: usuário responde "Sim" para "Existe tanque no local?", seleciona "Tradicional", não responde "Haverá móveis na região do tanque?", e tenta avançar.

Resultado esperado: o avanço é bloqueado com erro na pergunta de móveis — mesmo comportamento de hoje, em qualquer ambiente afetado.

### CA-10 — Nenhum bloqueio sobre móveis quando tanque embutido

Entrada: usuário responde "Sim" para "Existe tanque no local?", seleciona "Tanque embutido na bancada de granito", e tenta avançar sem responder nada mais sobre o tanque.

Resultado esperado: o avanço não é bloqueado por causa da pergunta de móveis, pois ela não é exibida nem exigida nesse cenário. As demais validações do formulário continuam se aplicando normalmente (granito, eletrodomésticos, cortineiro, rodapé, etc., conforme o ambiente).

### CA-11 — PDF reflete o tipo de tanque escolhido, sem CC para tanque embutido

Entrada: PDF gerado para um ambiente afetado (Cozinha, Varanda ou Outros) com tanque tradicional e móveis = Sim.

Resultado esperado: o bloco do ambiente no PDF exibe, nesta ordem: a pergunta e resposta "Existe tanque no local? — Sim", a pergunta **"Qual o tipo de tanque?"** com a resposta impressa por extenso como **"Tanque tradicional"** (nunca "Sim"/"Não"), a pergunta e resposta "Haverá móveis na região do tanque? — Sim" e o CC de remoção logo abaixo.

### CA-12 — PDF sem a pergunta de móveis quando tanque embutido

Entrada: PDF gerado para um ambiente afetado com "Existe tanque no local?" = Sim e tipo de tanque = Tanque embutido na bancada de granito.

Resultado esperado: o bloco do ambiente no PDF exibe a pergunta e resposta "Existe tanque no local? — Sim" e a pergunta **"Qual o tipo de tanque?"** com a resposta impressa por extenso como **"Embutido na bancada"** (nunca "Sim"/"Não"). A pergunta "Haverá móveis na região do tanque?" e qualquer CC de remoção de tanque não aparecem nesse bloco.

### CA-13 — Ambientes sem pergunta de tanque permanecem inalterados

Entrada: um ambiente de Banheiro, Dormitório (Casal ou Solteiro) ou Home/Sala/Office qualquer, com todas as demais perguntas respondidas normalmente.

Resultado esperado: nenhuma pergunta sobre tanque (nem a atual, nem a nova de tipo) aparece em nenhum desses formulários, no preview, na Revisão ou no PDF — comportamento idêntico ao atual, pois estes ambientes nunca tiveram o fluxo de tanque.

### CA-14 — Rascunho salvo antes da melhoria (cenário de erro/estado legado)

Entrada: rascunho salvo no armazenamento local do navegador antes desta mudança, com um ambiente afetado (Cozinha, Varanda ou Outros) em que "Existe tanque no local?" já está respondido como "Sim" (o novo campo de tipo de tanque não existe nesse rascunho).

Resultado esperado: ao reabrir o rascunho, o ambiente é carregado sem erro. A nova pergunta "Qual o tipo de tanque?" aparece como não respondida. Enquanto ela permanecer não respondida, a pergunta "Haverá móveis na região do tanque?" **não é exibida no formulário nem impressa no PDF**, mesmo que o rascunho legado tenha essa resposta de móveis preenchida de antes desta melhoria — o valor legado de móveis é ignorado até que o tipo de tanque seja escolhido. Se o usuário tentar avançar por aquele ambiente sem escolher o tipo, o avanço é bloqueado com a mensagem de erro padrão (CA-08). A geração do PDF a partir de um rascunho nesse estado intermediário não deve quebrar — se o campo de tipo de tanque não estiver preenchido, nem a pergunta de móveis nem nenhum CC de remoção de tanque são impressos, evitando gerar um CC indevido por dado incompleto.

### CA-15 — Estado inconsistente sem tanque, mas com tipo preenchido (cenário de erro)

Entrada: por qualquer inconsistência de rascunho, o estado tem "Existe tanque no local?" = Não, mas o campo de tipo de tanque contém um valor de uma resposta anterior, em um ambiente afetado.

Resultado esperado: nem a pergunta de tipo de tanque, nem a pergunta de móveis, nem qualquer CC de remoção de tanque aparecem — o valor do campo de tipo de tanque é ignorado sempre que "Existe tanque no local?" não for "Sim", tanto no formulário quanto no PDF e no cálculo de score. Nenhum erro é lançado.

### CA-16 — Score do ambiente não é afetado pelo tanque embutido na bancada de granito

Entrada: ambiente afetado (Cozinha, Varanda ou Outros) com tanque embutido na bancada de granito e nenhum outro gatilho de risco ativo.

Resultado esperado: o gatilho de remoção de tanque não entra na lista de gatilhos do ambiente, os 2 pontos de risco Médio não são somados, e a classificação de risco do ambiente reflete apenas os demais gatilhos eventualmente ativos (ou fica "Baixo", se nenhum outro gatilho existir).

### CA-17 — Consistência entre Cozinha, Varanda e Outros com a mesma resposta

Entrada: dois ambientes distintos no mesmo checklist — um "Cozinha / Área de Serviço" e um "Outros" — ambos com "Existe tanque no local?" = Sim, tipo de tanque = Tanque embutido na bancada de granito.

Resultado esperado: nenhum dos dois ambientes gera o CC de remoção de tanque nem os 2 pontos de risco; o comportamento é idêntico entre os dois ambientes, sem depender de qual `formType` está sendo avaliado.

### CA-18 — Ida e volta do tipo de tanque exige responder móveis novamente

Entrada: usuário seleciona tipo de tanque = Tanque tradicional, responde "Haverá móveis na região do tanque?" = Sim (CC aparece), depois muda o tipo de tanque para "Tanque embutido na bancada de granito" (pergunta de móveis e CC desaparecem), e em seguida muda o tipo de tanque de volta para "Tanque tradicional".

Resultado esperado: ao voltar para "Tanque tradicional", a pergunta "Haverá móveis na região do tanque?" reaparece, porém no estado "não respondido" — a resposta "Sim" dada anteriormente não é reaproveitada. O CC de remoção não aparece nesse momento. O usuário precisa responder à pergunta de móveis novamente; somente depois dessa nova resposta ser "Sim" o CC volta a ser gerado. Válido em qualquer ambiente afetado, nas duas direções da troca (tradicional → embutido → tradicional e embutido → tradicional → embutido).

---

## 13. Fora do escopo

- Alterar o texto legal do CC de remoção de tanque.
- Criar um novo nível de risco ou uma nova pontuação para tanque embutido na bancada de granito.
- Alterar qualquer outra pergunta de Cozinha, Varanda ou Outros (granito, eletrodomésticos, eletrônicos, cortineiro, rodapé, tamanho de cama, cuba, observações).
- Alterar a tela de Revisão ou o Resumo Executivo do PDF além do reflexo natural de o CC não ser mais gerado para tanque embutido na bancada de granito.
- Adicionar pergunta de tanque a ambientes que hoje não a têm (Banheiro, Dormitório, Home/Sala/Office).
- Migração automática de rascunhos salvos antes desta mudança.
- Criar testes automatizados.
