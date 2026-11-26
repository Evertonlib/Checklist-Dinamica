# PRD — Puxadores (modelo e cor por ambiente) no Checklist do Projetista

> **Status: APROVADO pelo Everton em 26/11/2026.** Documento de requisitos com as
> decisões Q1 a Q7 consolidadas. Nenhum código foi escrito. Próxima etapa: Spec (com gate de
> aprovação próprio).
>
> Nome da feature: `CHECKLIST_PUXADORES`. Este arquivo fica na raiz do projeto, seguindo a
> metodologia SDD do repositório.
>
> Tudo o que está descrito como "hoje" foi conferido diretamente no código na branch
> `feat/balcoes-convencionais-editados` (onde já está implementada a feature de balcões
> convencionais/editados), com citações `arquivo:linha`.
>
> **Nota sobre a branch:** conforme decisão do Everton, a implementação desta feature entrará na
> branch já existente `feat/balcoes-convencionais-editados`, junto com a feature de balcões.

---

## 1. Objetivo

No Checklist do Projetista (perfil Vendedor, rotas `/vendedor/*`), o setor de liberação precisa
saber com precisão quais **puxadores (modelo e cor/acabamento)** foram vendidos em cada ambiente,
ou se o ambiente não possui puxador. Hoje essa informação não é coletada de forma estruturada no
Checklist do Projetista, gerando risco de divergência, omissão ou padronização inconsistente na
liberação.

Conforme o levantamento feito em `ESTUDO_RANQUEAMENTO_PUXADORES.md` (407 capas únicas de projetos
liberados entre 20/08/2026 e 20/11/2026), apenas 8 modelos principais de puxadores de móveis
(`Roma`, `Madri 150mm`, `Madri 270mm`, `Berlin`, `Paris`, `Perfil Cava`, `Perfil Gola Fit` e
`Florença`) cobrem **95,7% das capas** com puxador, e cada família de puxador possui uma paleta
de cores própria (por exemplo, `Roma` usa `Fendi`, `Alumínio` e `Griggio`; `Berlin` usa `Antique`,
`Aço` e `Cobre`; `Madri` e `Florença` são modelos de cor única).

O objetivo desta feature é coletar, **por ambiente**, no bloco **"Acabamento e ferragens"** de
**todos os 3 grupos de ambiente (A, B e C)** do Checklist do Projetista:

1. Se o ambiente possui puxador (*"Tem puxador?"* — `Sim` ou `Não`);
2. Quando **`Sim`**, permitir cadastrar **um ou mais puxadores** por ambiente, cada um com
   **Modelo** e **Cor** obrigatórios, usando campos editáveis com autocomplete (sugestões
   ranqueadas por frequência de uso, onde a cor sugerida depende do modelo e modelos de cor única
   autopreenchem `"Sem cor"` de forma editável);
3. Exibir o resultado na **tela de Revisão** e no **PDF do Projetista**.

---

## 2. Comportamento já decidido pelo Everton

Todas as regras abaixo (incluindo as decisões Q1 a Q7 da Seção 14) são decisões fechadas pelo
Everton e não devem ser alteradas:

1. **Escopo e posição:** somente **Perfil Projetista** (`/vendedor/*`), em **todos os 3 grupos de
   ambiente (A, B e C)**, **por último dentro do bloco "Acabamento e ferragens"** (Grupo A: após
   `Corrediças`; Grupo B: após `Fechamento até o teto`; Grupo C: após `Corrediças`), mantendo a
   mesma ordem na tela, na Revisão e no PDF.
2. **Branch de trabalho:** a implementação entrará na branch já existente
   `feat/balcoes-convencionais-editados` (onde o repositório já está posicionado, junto com a
   feature de balcões).
3. **Pergunta gatilho:** *"Tem puxador?"* com **apenas** os botões **`Sim`** e **`Não`** (sem
   botão `"Não se aplica"`). Nada vem pré-marcado e a resposta é obrigatória para o Projetista
   avançar (erro `Responda sim ou não`). Se **`Não`**, não abre campos e não exige modelo nem cor
   (cobre também casos como `"Sem Puxador"`, painéis, nichos e fecho toque).
4. **Preservação ao trocar `Sim` → `Não` → `Sim`:** igual aos balcões convencionais/editados,
   trocar de `Sim` para `Não` **preserva** os puxadores já preenchidos no estado, apenas escondendo
   o bloco e fazendo validação, Revisão e PDF ignorarem a lista; ao voltar para `Sim`, os
   puxadores reaparecem como estavam.
5. **Múltiplos puxadores por ambiente (`Sim`):**
   - Ao marcar **`Sim`**, já abre o **1º puxador** (sem botão de remover), com dois campos
     obrigatórios: **Modelo** e **Cor**.
   - Logo abaixo aparece o botão **`+ Adicionar puxador`**, seguindo o mesmo padrão visual e de
     interação dos contratos adicionais em `StepIdentificacaoVendedor.jsx:85-113`.
   - Cada puxador adicional (a partir do 2º, índice maior que zero) possui botão de remover
     (**`−`**) e também exige **Modelo** e **Cor** preenchidos para avançar.
6. **Combobox editável com autocomplete (sem opção `"Outro"`):**
   - Implementado em **React puro**, sem adicionar nenhuma biblioteca externa (conforme
     `ESTUDO_RANQUEAMENTO_PUXADORES.md:199`).
   - O campo começa **em branco**.
   - Selecionar um item da lista suspensa funciona apenas como **atalho** (insere o texto no campo)
     e o texto continua **100% editável** (fácil de selecionar, apagar e reescrever).
   - Digitação livre filtra as sugestões conforme o usuário digita; não existe opção `"Outro"` nem
     campo extra condicional, pois o próprio campo aceita qualquer texto.
   - **Ao clicar/focar no texto** de um campo já preenchido, **seleciona o texto inteiro** (para que
     a primeira tecla digitada já apague e substitua o conteúdo anterior sem precisar apagar letra
     por letra) e abre a lista completa de sugestões (filtrando apenas quando o usuário
     digitar/alterar o texto).
   - O campo possui uma **setinha (`▾`) no canto direito** apenas quando houver sugestões
     disponíveis (sempre no campo Modelo; no campo Cor, apenas quando o modelo possuir sugestões):
     tocar na setinha abre ou fecha a lista suspensa mostrando **todas as sugestões** daquele campo,
     facilitando trocar com 1 toque sem precisar apagar antes.
7. **Sugestões de Modelo (em ordem de uso, com Madri separado por tamanho):**
   1. `Roma`
   2. `Madri 150mm`
   3. `Madri 270mm`
   4. `Berlin`
   5. `Paris`
   6. `Perfil Cava`
   7. `Perfil Gola Fit`
   8. `Florença`
8. **Sugestões de Cor dependente do Modelo (sempre editável):**

| Modelo escolhido ou digitado | Comportamento do campo Cor |
|---|---|
| `Roma` | Sugere: `Fendi`, `Alumínio`, `Griggio` *(editável, com setinha `▾`)* |
| `Madri 150mm` | **Autopreenche `"Sem cor"`** *(campo editável, NÃO travado)* |
| `Madri 270mm` | **Autopreenche `"Sem cor"`** *(campo editável, NÃO travado)* |
| `Florença` | **Autopreenche `"Sem cor"`** *(campo editável, NÃO travado)* |
| `Berlin` | Sugere: `Antique`, `Aço`, `Cobre` *(editável, com setinha `▾`)* |
| `Paris` | Sugere: `Antique` *(editável, com setinha `▾` — tem mais cores no catálogo)* |
| `Perfil Cava` | Sugere: `Fendi`, `Alumínio` *(editável, com setinha `▾`)* |
| `Perfil Gola Fit` | Sugere: `Alumínio`, `Grafito` *(editável, com setinha `▾`)* |
| Qualquer outro modelo digitado (fora dos 8 acima) | Campo de texto livre obrigatório, **sem sugestões e sem setinha (`▾`)** |

   - **Reconhecimento tolerante para cor única:** `Madri 150mm`, `Madri 270mm` e `Florença` devem
     ser reconhecidos ignorando diferença de maiúsculas/minúsculas e acentos (por exemplo,
     `"florenca"` ou `"MADRI 150MM"` também disparam o autopreenchimento de `"Sem cor"`).
   - **Troca posterior de modelo:** ao trocar um modelo de cor única (`Madri 150mm`, `Madri 270mm`,
     `Florença`) cujo campo Cor está com `"Sem cor"` para **qualquer outro valor** (outro modelo com
     paleta, um modelo desconhecido fora da lista, ou apagar o campo Modelo deixando-o vazio), o
     campo Cor deve **limpar `"Sem cor"` automaticamente** (`""`).
9. **Revisão e PDF do Projetista (formato uniforme, sem cor de destaque):**
   - Rótulo: **`Puxadores`**.
   - Não respondida (apenas rascunho antigo): `—` (PDF: `Resposta: —`, Revisão: `Puxadores: —`).
   - `Não`: `Não` (PDF: `Resposta: Não`, Revisão: `Puxadores: Não`).
   - `Sim` (1 ou mais puxadores): `Sim` (PDF: `Resposta: Sim`, Revisão: `Puxadores: Sim`), seguido
     de uma linha recuada por puxador com marcador `•` no formato `• <Modelo> — <Cor>` (ex.:
     `• Roma — Fendi`, `• Madri 150mm — Sem cor`), reutilizando `linhasExtras` de
     `pdfVendedor.js:114-116` e `<br />` de `StepRevisaoVendedor.jsx:114-119`.

### Fora de escopo

- **Perfil Cliente** (`/identificacao`, `/ambientes`, `/globais`, `/ambiente/:instanceId`,
  `/revisao`, `/sucesso`).
- **Venda futura** (`/futura/*`) e tela `/projetista`.
- **Portas de alumínio / vidro** dos parceiros **`Allure`** e **`Villaggio`** (Seção 5 do
  `ESTUDO_RANQUEAMENTO_PUXADORES.md`), com seus modelos (`Embutido AL2020`, `V2020`, etc.) e cores
  de perfil (`Fosco`, `Bronze`, `Preto`, etc.).
- **Pontuação de risco / CCs / importação de PDF** (o Projetista não tem score, CC nem metadado
  oculto V1 no PDF — esta feature não muda isso).
- **Refatoração das três cópias de perguntas dos grupos A, B e C em um único formulário**, ou
  unificação da lista de perguntas entre Revisão e PDF (manter o padrão atual simples e local).
- **Qualquer nova dependência npm** (como bibliotecas prontas de autocomplete/select).

---

## 3. Relação com scripts e sistemas existentes

### 3.1 Dentro do repositório (`Checklist-Dinamica`)

- Reaproveita a estrutura de grupos do Projetista (`src/domain/gruposPerguntasVendedor.js`), o
  schema por grupo (`src/domain/schemaVendedor.js`), a validação centralizada
  (`src/domain/validacaoVendedor.js`) e o padrão de formatação compartilhada entre Revisão e PDF
  inaugurado em `src/domain/respostaBalcaoVendedor.js`.
- Copia o padrão visual e estrutural de lista dinâmica (1º item fixo sem botão de remover, itens
  adicionais `index > 0` com botão `−` e botão `+ Adicionar ...` logo abaixo) de
  `src/steps/vendedor/StepIdentificacaoVendedor/StepIdentificacaoVendedor.jsx:85-113` e
  `StepIdentificacaoVendedor.module.css:41-71`.
- Segue o `CLAUDE.md:45`: mudanças no lado Projetista não propagam para Cliente nem Venda futura,
  e todas as cores da interface continuam vindo exclusivamente dos tokens `--ba-*` definidos em
  `src/index.css:4-32`.

### 3.2 Leitores externos em `c:\Users\Windows 10\AUTOMACOES` (verificado)

Foi realizada busca em todos os arquivos `.py`, `.ps1`, `.js`, `.mjs`, `.bat`, `.html` e `.md` fora
de `Checklist-Dinamica`, `node_modules` e `dist` em `c:\Users\Windows 10\AUTOMACOES` por
referências a `Checklist_Projetista`, `byarabi_checklist_vendedor`, rótulos do PDF do Projetista e
a palavra `Projetista`. Resultado confirmado:

- **Nenhum script externo lê o conteúdo do PDF do Projetista nem a chave `localStorage` do
  Projetista.** Diferente do PDF do Cliente (`src/services/importacaoPdf.js`), o `pdfVendedor.js`
  não grava metadado oculto (`Keywords` `V1:`), e o importador recusa explicitamente o PDF do
  Projetista (teste `T5` em `testes/I_importacao_pdf.test.js:145-153`).
- `ASSISTENTE DE EMAIL/assistente_email.py:864-865` verifica apenas a **extensão** dos anexos
  (`.docx`, `.doc`, `.pdf`) para marcar `email_proc.tem_checklist = True`, sem abrir ou extrair
  texto do PDF; a linha `:143` apenas cita o link do site.
- `Agente-Assinatura-Encomenda/testes/teste_limpeza_texto.py:334` contém apenas uma string
  estática de exemplo de teste de limpeza de texto (`"Qual altura do piso será instalada os
  balcões: 200"`), sem integração com o PDF do Projetista.
- `Processos-liberacao/index.html:602-606, 740` e
  `Nucleo-Liberacao/MAPA_DUPLICIDADES_BIBLIOTECA_COMUM.md:66` contêm apenas documentação descritiva
  do fluxo de envio dos dois PDFs.

Conclusão: **nenhum script ou integração externa lê ou depende da estrutura interna do PDF do
Projetista.** O consumidor real do PDF do Projetista é a equipe de liberação lendo visualmente. O
padrão de nome do arquivo (`Checklist_Projetista_<CONTRATO>_<DATA>.pdf`) não será alterado.

---

## 4. Como funciona hoje (conferido na branch `feat/balcoes-convencionais-editados`)

### 4.1 Telas de perguntas dos grupos A, B e C e padrão de lista dinâmica

- Existem três componentes de formulário separados, todos sob
  `src/steps/vendedor/StepPerguntasAmbienteVendedor/`:
  - `FormGrupoA.jsx`: tem o bloco `"Alturas de instalação"` (`:91-110`, incluindo balcões
    convencionais/editados), o bloco `"Acabamento e ferragens"` (`:112-117`: `fechamentoTeto`,
    `caixaria`, `dobradicas`, `corredicas`) e `"Observações (opcional)"` (`:119-129`).
  - `FormGrupoB.jsx`: tem o bloco `"Acabamento e ferragens"` (`:50-55`: `caixaria`, `dobradicas`,
    `corredicas`, `fechamentoTeto`) e `"Observações (opcional)"` (`:57-67`).
  - `FormGrupoC.jsx`: tem o bloco `"Acabamento e ferragens"` (`:45-49`: `caixaria`, `dobradicas`,
    `corredicas`) e `"Observações (opcional)"` (`:51-61`).
- A função auxiliar `campoFechado` existe em três cópias locais independentes:
  - Em `FormGrupoA.jsx:57-87`, já aceita o 4º parâmetro `mostrarNaoSeAplica = true` (usado pelas
    subperguntas Sim/Não dos balcões na `:101-107` com `false`).
  - Em `FormGrupoB.jsx:18-46` e `FormGrupoC.jsx:17-41`, ainda não existe o parâmetro
    `mostrarNaoSeAplica`: o botão `"Não se aplica"` é sempre exibido.
- `StepPerguntasAmbienteVendedor.module.css` é usado exclusivamente pelos componentes do Projetista
  (`FormGrupoA`, `FormGrupoB`, `FormGrupoC` e `StepPerguntasAmbienteVendedor`). Já possui classes
  `.opcao`, `.opcaoAtiva` (`:24-40`), `.erro` (`:104-109`) e `.subperguntas` (`:131-135`, com
  borda esquerda e recuo para blocos condicionais).
- Padrão de lista dinâmica existente no projeto: em
  `src/steps/vendedor/StepIdentificacaoVendedor/StepIdentificacaoVendedor.jsx:85-113` e
  `StepIdentificacaoVendedor.module.css:41-71`, o array sempre tem ao menos 1 posição, o índice `0`
  não tem botão de remover, itens com `index > 0` exibem um botão circular `−` ao lado, e logo
  abaixo da lista aparece um botão em formato pílula `+ Adicionar ...`.
- Não existe hoje nenhum componente de combobox ou autocomplete em `src/components/` nem em
  nenhum step do app.

### 4.2 Validação para avançar

- `src/domain/validacaoVendedor.js` centraliza a validação do Projetista (`validarRespostasGrupo(grupo, resp)`
  nas `:27-42`):
  - Lista `CAMPOS_OBRIGATORIOS_POR_GRUPO` (`:9-13`) para `'A'`, `'B'` e `'C'`.
  - `respostaValida` (`:15-19`): aceita `'não se aplica'`, exige número `> 0` para alturas e aceita
    qualquer valor diferente de `null` e `undefined` para os demais campos.
  - Mensagens padrão exportadas: `MSG_RESPONDA` (`:1`) e `MSG_RESPONDA_SIM_NAO` (`:2`).
  - Quando `grupo === 'A'` e `resp.tipoBalcao === 'Editados'`, valida as subperguntas em `:34-40`,
    gravando cada erro com chave própria no objeto `erros`.
- `StepPerguntasAmbienteVendedor.jsx:40-44` chama `validarRespostasGrupo(grupo, resp)` ao clicar
  em `"Avançar"` ou `"Ir para Revisão"` (`:57-68`). Quando há erros, `scrollToFirstError()` (`:36-38`,
  definido em `src/utils/scrollUtils.js:1-6`) rola a tela até o primeiro elemento com classe CSS
  `.erro-campo`.

### 4.3 Estado, grupos e rascunho

- `src/domain/gruposPerguntasVendedor.js:4-17` mapeia os 8 ambientes nos grupos `'A'`, `'B'` e `'C'`
  (`obterGrupo` cai em `'A'` para tipo desconhecido na `:16`).
- `src/domain/schemaVendedor.js:2-28` define `defaultsPorGrupo.A`, `defaultsPorGrupo.B` e
  `defaultsPorGrupo.C`. Todos os campos de resposta começam `null`, exceto `observacoes: ''`.
- `src/context/FormProviderVendedor.jsx`:
  - Salva na chave `byarabi_checklist_vendedor` (`:8`).
  - `SET_RESPOSTA_AMBIENTE_VENDEDOR` (`:158-171`) grava qualquer `[campo]: valor` dentro de
    `respostasPorAmbiente[instanceId]`. Portanto, campos novos adicionados por ambiente (como a
    pergunta de puxador e a lista de puxadores) funcionam sem precisar criar novas actions no
    reducer.
  - `normalizarEstadoSalvo` (`:25-50`) combina `defaultsPorGrupo[obterGrupo(instancia.tipo)]` com os
    dados salvos de cada ambiente (`:29-34`). Campos novos nos defaults são automaticamente
    preenchidos em rascunhos antigos na restauração.

### 4.4 Revisão e PDF

- A lista `PERGUNTAS_POR_GRUPO` existe duplicada em `StepRevisaoVendedor.jsx:11-32` e
  `pdfVendedor.js:19-40`, assim como `formatarResposta` (`StepRevisaoVendedor.jsx:34-40` e
  `pdfVendedor.js:42-48`).
- Para respostas compostas por título + lista de linhas abaixo, já existe o padrão criado para
  balcões:
  - `src/domain/respostaBalcaoVendedor.js:8-26` retorna `{ texto, destaque, linhas }`.
  - `StepRevisaoVendedor.jsx:103-122` exibe `<strong>{item.label}:</strong> {texto}` e renderiza
    cada item de `linhas` em uma nova linha (`<br />`).
  - `pdfVendedor.js:103-119` (`escreverPergunta(pergunta, resposta, destaque = false, linhasExtras = [])`)
    imprime o rótulo em negrito, `Resposta: ${resposta}`, e cada item de `linhasExtras` recuado em
    `+5 mm` logo abaixo (`:114-116`).
- A Revisão **não revalida** ao gerar o PDF (`StepRevisaoVendedor.jsx:59-71`).

### 4.5 Testes existentes

- `testes/V_pdf_projetista.test.js`:
  - `T-V03` (`:31-49`) verifica a lista exata de linhas do grupo A (defaults).
  - `T-V04` (`:51-64`) verifica a lista exata de linhas do grupo B (defaults).
  - `T-V05` (`:66-76`) verifica a lista exata de linhas do grupo C (defaults).
  - `T-V06` (`:78-101`) verifica a lista exata de linhas `Resposta: ...` do grupo A.
  - `T8` (`:286-323`) verifica a lista exata de linhas do grupo A com observações.
  - `T9` (`:325-347`) verifica nos casos de balcões que nenhum texto é `Resposta: Não` (`:337`).
- `testes/V_validacao_projetista.test.js`:
  - `T17` (`:17-36`) testa que grupos B e C passam validação sem campos extras.
  - `BASE_A` (`:8-15`) serve de entrada completa para `T10` a `T16`, `T18` e `T20`.
- `testes/auxiliares/construtores.js:88-100` (`montarEstadoProjetista`) cria respostas iniciais a
  partir de `defaultsPorGrupo[grupo]` mesclados com o `resp` do teste.
- Rodando `npm test` hoje nesta branch, passam 150 de 150 testes (0 falhas, 0 pulados).

---

## 5. Padrão externo pesquisado (Etapa 2 — simplicidade em React puro)

Para o combobox editável com autocomplete, há duas abordagens nativas/simples sem dependências
externas: `<datalist>` HTML nativo ou um componente controlado em React puro (`<input type="text">`
+ botão opcional de setinha `▾` + lista suspensa `<ul>`/`<div>` posicionada abaixo).

Conforme já avaliado em `ESTUDO_RANQUEAMENTO_PUXADORES.md:199`, o `<datalist>` nativo apresenta
comportamento inconsistente entre navegadores e principalmente entre desktop e celular (no Android
e iOS frequentemente esconde opções, não abre de forma previsível ao tocar no campo ou exibe
interface fora do padrão visual da aplicação).

O padrão mais simples, confiável e consistente com o restante do projeto é um **componente de
combobox editável pequeno e reutilizável em React puro**, composto por:

1. Um campo de texto normal (`<input type="text">`) ligado diretamente ao valor salvo (toda
   digitação atualiza o estado imediatamente);
2. Um botão pequeno com setinha (`▾`) no canto direito, exibido **apenas quando há sugestões
   disponíveis** para aquele campo, que abre/fecha a lista completa de sugestões com um clique ou
   toque;
3. Ao clicar/focar no texto de um campo já preenchido, o texto inteiro é selecionado
   automaticamente (permitindo substituição direta ao digitar a primeira letra) e a lista suspensa
   abre mostrando **todas as sugestões** daquele campo (filtrando apenas depois que o usuário
   digitar ou alterar o texto);
4. Uma lista suspensa exibida abaixo do campo quando aberta e houver sugestões, listando as
   sugestões (comparação de filtro sem diferenciar maiúsculas, minúsculas ou acentos);
5. Seleção por clique/toque antes da perda de foco (evitando que o `onBlur` feche a lista antes de
   registrar o toque no celular);
6. Fechamento da lista suspensa ao selecionar uma sugestão, ao clicar fora do componente ou ao
   pressionar `Escape`, com suporte básico a teclado no desktop (`ArrowDown`, `ArrowUp`, `Enter` e
   `Escape`).

Quando o campo não possui sugestões (caso do campo **Cor** para um modelo desconhecido fora dos 8
da lista), o componente funciona como um campo de texto livre normal, sem setinha `▾` e sem lista
suspensa.

Esse padrão não introduz nenhuma biblioteca externa, mantém o design system `--ba-*` de
`src/index.css` e garante a mesma experiência no celular e no computador.

---

## 6. Comportamento desejado em detalhe

### 6.1 Tela de perguntas do ambiente (grupos A, B e C)

- Em **todos os 3 grupos (A, B e C)**, **por último dentro do bloco "Acabamento e ferragens"**
  (Grupo A: após `Corrediças`; Grupo B: após `Fechamento até o teto`; Grupo C: após `Corrediças`),
  entra a pergunta **"Tem puxador?"** com **apenas** os botões **`Sim`** e **`Não`** (sem botão
  `"Não se aplica"`):
  - Nenhum botão vem pré-marcado.
  - Em `FormGrupoB.jsx` e `FormGrupoC.jsx`, `campoFechado` ganha suporte ao parâmetro
    `mostrarNaoSeAplica = true` (como em `FormGrupoA.jsx:57-87`), ou o bloco compartilhado de
    puxadores renderiza diretamente os dois botões `Sim` e `Não` sem `"Não se aplica"`, mantendo
    todas as perguntas já existentes de A, B e C inalteradas.
- **Quando `Não` (ou nada marcado):**
  - Nenhum campo de modelo ou cor aparece abaixo.
  - Se o usuário havia preenchido puxadores antes com `Sim` e trocou para `Não`, os dados
    permanecem preservados no estado (ignorados pela validação, Revisão e PDF); ao voltar para
    `Sim`, reaparecem como estavam.
- **Quando `Sim`:**
  - Logo abaixo da pergunta (em bloco condicional com recuo visual, seguindo o estilo de
    `.subperguntas` em `StepPerguntasAmbienteVendedor.module.css:131-135`), abre a lista de
    puxadores do ambiente, já iniciando com o **1º puxador** (sem botão de remover).
  - Cada card/linha de puxador possui:
    - Indicação clara do item quando útil (por exemplo, `Puxador 1`, `Puxador 2`, seguindo a clareza
      de `Contrato adicional 2` em `StepIdentificacaoVendedor.jsx:88`) e, para itens com
      `index > 0`, o botão de remover **`−`** com `aria-label` descritivo (padrão de
      `StepIdentificacaoVendedor.jsx:98-107`).
    - Campo **Modelo** (combobox editável com autocomplete, começando em branco, sempre com setinha
      `▾` no canto direito):
      - Sugestões exibidas em ordem: `Roma`, `Madri 150mm`, `Madri 270mm`, `Berlin`, `Paris`,
        `Perfil Cava`, `Perfil Gola Fit`, `Florença`.
      - Ao clicar/focar no texto já preenchido, seleciona o texto inteiro e abre a lista completa de
        8 sugestões; tocar na setinha `▾` abre/fecha todas as 8 sugestões.
      - Digitar/alterar filtra as sugestões (ignorando maiúsculas/minúsculas e acentos, ex.: digitar
        `flore` sugere `Florença`; digitar `cava` sugere `Perfil Cava`).
      - Selecionar uma sugestão preenche o campo com o texto escolhido, mantendo o texto totalmente
        editável.
      - O usuário pode apagar ou digitar qualquer outro modelo livremente (ex.: `Zen Cup`,
        `Cava 45`, `Ken 192mm`, etc.) sem precisar escolher `"Outro"`.
    - Campo **Cor** (combobox editável dependente do Modelo, começando em branco):
      - Para `Roma`: sugere `Fendi`, `Alumínio`, `Griggio` (com setinha `▾`).
      - Para `Berlin`: sugere `Antique`, `Aço`, `Cobre` (com setinha `▾`).
      - Para `Paris`: sugere `Antique` (editável, com setinha `▾`, pois há outras cores no catálogo).
      - Para `Perfil Cava`: sugere `Fendi`, `Alumínio` (com setinha `▾`).
      - Para `Perfil Gola Fit`: sugere `Alumínio`, `Grafito` (com setinha `▾`).
      - Para `Madri 150mm`, `Madri 270mm` e `Florença` (reconhecidos ignorando maiúsculas/minúsculas
        e acentos, tanto ao clicar na sugestão quanto ao digitar manualmente o nome exato do
        modelo): autopreenche **`"Sem cor"`** no campo Cor, mantendo o campo **editável (não
        travado)** para que o usuário possa apagar/alterar se quiser. *(Sem sugestões extras além
        disso / sem setinha `▾`, já que o próprio campo já autopreenche `"Sem cor"`.)*
      - Para qualquer outro modelo digitado fora dos 8 da lista (ex.: `Zen Cup`), ou quando Modelo
        estiver vazio: o campo Cor funciona como **campo de texto livre obrigatório, sem sugestões e
        sem exibir o botão de setinha (`▾`)**.
      - Ao clicar/focar no texto já preenchido de um campo Cor com sugestões, seleciona o texto
        inteiro e abre todas as sugestões daquele modelo (filtrando só ao digitar/alterar); tocar na
        setinha `▾` abre/fecha todas as sugestões daquele modelo.
      - **Troca de modelo de cor única:** ao trocar um modelo de cor única (`Madri 150mm`, `Madri
        270mm` ou `Florença`) cujo campo Cor está preenchido com `"Sem cor"` (ignorando maiúsculas e
        acentos) para **qualquer outro valor** — seja outro modelo com paleta (ex.: `Roma`), um
        modelo desconhecido fora da lista (ex.: `Zen Cup`) ou apagar o campo Modelo — o campo Cor é
        **limpo automaticamente (`""`)**, voltando a exigir o preenchimento da cor. Se o usuário
        tiver digitado manualmente outra cor diferente de `"Sem cor"`, ela é preservada.
  - Logo abaixo da lista de puxadores aparece o botão **`+ Adicionar puxador`** (mesmo estilo de
    `+ Adicionar contrato` em `StepIdentificacaoVendedor.jsx:111-113`), que acrescenta um novo
    puxador em branco (com Modelo e Cor vazios) ao final da lista do ambiente.
- **Independência entre ambientes:** cada ambiente selecionado tem sua própria resposta de
  *"Tem puxador?"* e sua própria lista de puxadores (ex.: Cozinha pode ter `Sim` com `Madri 150mm`
  e `Perfil Cava`, Dormitório Casal pode ter `Sim` com `Roma — Fendi`, e Home pode ter `Não`).

### 6.2 Validação para avançar (grupos A, B e C)

- Em **todos os grupos (A, B e C)**, a pergunta **"Tem puxador?"** é obrigatória:
  - Sem `Sim` nem `Não` marcados, bloqueia o avanço ao clicar em `"Avançar"` / `"Ir para Revisão"`,
    exibindo a mensagem **`Responda sim ou não`** (`MSG_RESPONDA_SIM_NAO`, já existente em
    `validacaoVendedor.js:2`) no próprio campo e entrando no scroll automático até o primeiro erro
    (`.erro-campo`).
- Quando **"Tem puxador?" = `Não`**:
  - Libera o avanço sem exigir Modelo nem Cor, mesmo que exista uma lista de puxadores preservada no
    estado de um `Sim` anterior.
- Quando **"Tem puxador?" = `Sim`**:
  - Deve existir pelo menos 1 puxador na lista, e **cada puxador** presente na lista deve ter
    **Modelo** e **Cor** preenchidos (texto não vazio após remover espaços nas pontas).
  - Cada campo vazio (seja `Modelo` ou `Cor`, de qualquer puxador da lista, incluindo os
    adicionados com `+ Adicionar puxador`) recebe chave de erro própria, exibe mensagem de erro
    clara no próprio campo (classe `.erro-campo`) e entra no scroll automático até o primeiro erro.
  - Um puxador com `Madri 150mm`, `Madri 270mm` ou `Florença` e Cor autopreenchida com `"Sem cor"`
    passa normalmente na validação sem precisar de ação extra do usuário.
  - Se o usuário remover um puxador adicional (`−`) que estava com erro de validação, o erro
    daquele item não bloqueia mais o avanço.
- Toda regra de validação permanece centralizada em `src/domain/validacaoVendedor.js`, fora dos
  componentes React, coberta por testes automatizados.

### 6.3 PDF do Projetista e Tela de Revisão

- **Consistência entre Revisão e PDF:** a formatação dos dados de puxadores exibidos na Revisão
  (`StepRevisaoVendedor.jsx`) e impressos no PDF (`pdfVendedor.js`) vem de uma **função pura
  compartilhada em `src/domain/`** (no mesmo modelo de `src/domain/respostaBalcaoVendedor.js`),
  garantindo que Revisão e PDF nunca divirjam e possam ser testados unitariamente.
- **Posição e formato (uniforme, sem destaque colorido):** aparece sempre como último item de todos
  os ambientes (A, B e C), antes de `"Observações do ambiente"`, com rótulo **`Puxadores`**:

| Situação | Linha na Revisão | Linhas no PDF | Destaque |
|---|---|---|---|
| Não respondida (apenas rascunho antigo) | `Puxadores: —` | `Puxadores` seguido de `Resposta: —` | não |
| `Tem puxador?` = `Não` | `Puxadores: Não` | `Puxadores` seguido de `Resposta: Não` | não |
| `Tem puxador?` = `Sim` (1 ou mais puxadores) | `Puxadores: Sim` e abaixo uma linha por puxador: `• <Modelo> — <Cor>` | `Puxadores` seguido de `Resposta: Sim` e abaixo uma linha recuada (+5 mm) por puxador: `• <Modelo> — <Cor>` | não |

- Exemplo com 2 puxadores (`Roma` / `Fendi` e `Madri 150mm` / `Sem cor`):
  - `Puxadores`
  - `Resposta: Sim`
  - `• Roma — Fendi`
  - `• Madri 150mm — Sem cor`
- Reutiliza exatamente o mecanismo já existente de `linhasExtras` em `pdfVendedor.js:114-116` e de
  `<br />` por item em `StepRevisaoVendedor.jsx:114-119`.
- Se `Tem puxador?` = `Não`, eventuais puxadores preservados no estado **não** são exibidos na
  Revisão nem no PDF.

---

## 7. Arquivos afetados

| Arquivo | Efeito esperado |
|---|---|
| `src/domain/schemaVendedor.js` | Grupos A, B e C ganham os novos campos de puxador nos defaults (pergunta gatilho começando `null` e lista de puxadores) |
| `src/domain/puxadoresVendedor.js` *(novo)* | Lista ranqueada dos 8 modelos, mapa de cores por modelo, normalização sem acentos/maiúsculas (para filtro e reconhecimento de `Madri 150mm`/`Madri 270mm`/`Florença` e `"Sem cor"`), e função pura compartilhada de formatação para Revisão e PDF |
| `src/domain/validacaoVendedor.js` | Passa a validar *"Tem puxador?"* (`MSG_RESPONDA_SIM_NAO`) nos grupos A, B e C e, quando `Sim`, cada `modelo` e `cor` de cada puxador da lista com chave de erro própria |
| `src/components/ComboboxEditavel/` *(novo componente reutilizável simples em React puro)* | Campo de texto editável com seleção total do texto ao focar, setinha `▾` exibida apenas quando houver sugestões, e lista suspensa filtrada acessível por mouse, toque e teclado, usando tokens `--ba-*` |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoA.jsx` | Adiciona bloco de puxadores por último em `"Acabamento e ferragens"` (após `Corrediças`) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoB.jsx` | Adiciona bloco de puxadores por último em `"Acabamento e ferragens"` (após `Fechamento até o teto`) e suporte a `mostrarNaoSeAplica = true` na cópia local de `campoFechado` (ou uso de subcomponente compartilhado) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoC.jsx` | Adiciona bloco de puxadores por último em `"Acabamento e ferragens"` (após `Corrediças`) e suporte a `mostrarNaoSeAplica = true` na cópia local de `campoFechado` (ou uso de subcomponente compartilhado) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.module.css` | Estilos do bloco condicional de puxadores, linha de puxador com botão `−` e botão `+ Adicionar puxador` (seguindo `StepIdentificacaoVendedor.module.css:41-71`). Usado só pelos formulários do Projetista |
| `src/steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.jsx` | Passa a exibir `Puxadores` por último nos grupos A, B e C usando a função compartilhada de formatação e `<br />` para as linhas `• <Modelo> — <Cor>` |
| `src/services/pdfVendedor.js` | Passa a imprimir `Puxadores` por último nos grupos A, B e C usando a mesma função compartilhada e `linhasExtras` |
| `testes/V_pdf_projetista.test.js` | Atualização intencional de `T-V03`, `T-V04`, `T-V05`, `T-V06` e `T8` (por causa da nova linha `Puxadores` no fim de cada ambiente) + novos casos para puxadores (`T9` continua passando sem alteração) |
| `testes/V_validacao_projetista.test.js` | Atualização intencional de `T17` e `BASE_A` (já que puxadores passam a ser obrigatórios em A, B e C) + novos casos de validação de puxadores |
| `testes/V_puxadores.test.js` *(novo)* | Testes puros para catálogo/dependência modelo → cor, normalização sem acentos, autopreenchimento/limpeza de `"Sem cor"`, filtro e formatação Revisão/PDF |

> **Observação sobre `FormGrupoA`, `FormGrupoB` e `FormGrupoC`:** para evitar duplicação da
> interface de puxadores nos 3 formulários, o Spec poderá extrair um subcomponente pequeno
> específico do Projetista (por exemplo `BlocoPuxadoresVendedor.jsx` dentro de
> `StepPerguntasAmbienteVendedor/`) chamado pelos 3 formulários, mantendo intactas as perguntas já
> existentes de cada grupo.

---

## 8. O que será adicionado

- Pergunta obrigatória *"Tem puxador?"* (`Sim` / `Não`, sem `"Não se aplica"`) por último no bloco
  *"Acabamento e ferragens"* dos grupos A, B e C do Projetista.
- Lista dinâmica de puxadores por ambiente ao marcar `Sim`:
  - 1º puxador já aberto sem botão de remover;
  - Botão `+ Adicionar puxador` abaixo da lista;
  - Botão `−` de remoção para cada puxador adicional (`index > 0`);
  - Dois campos obrigatórios por item (**Modelo** e **Cor**) usando combobox editável em React
    puro com seleção total ao focar e setinha `▾` condicional quando houver sugestões.
- Catálogo de sugestões ordenadas de Modelo (8 itens) e sugestões dependentes de Cor, com
  autopreenchimento editável de `"Sem cor"` para `Madri 150mm`, `Madri 270mm` e `Florença`
  (tolerante a acentos e caixa) e limpeza automática ao trocar para qualquer outro valor de modelo;
  campo Cor sem sugestões e sem setinha `▾` para modelos fora dos 8 da lista.
- Regras de validação por grupo e por índice de puxador em `validacaoVendedor.js` (com
  `MSG_RESPONDA_SIM_NAO` para *"Tem puxador?"*).
- Exibição de `Puxadores` na Revisão e no PDF do Projetista via função compartilhada em
  `src/domain/`, no formato `Resposta: —` / `Resposta: Não` / `Resposta: Sim` + `• <Modelo> — <Cor>`.
- Suíte de testes automatizados cobrindo catálogo/regras de cor, validação, formatação e PDF.

---

## 9. O que será removido ou alterado

- **Nada funcional é removido** do app.
- **Alterado (comportamento):**
  - Os grupos A, B e C passam a exigir resposta em *"Tem puxador?"* para avançar de etapa.
  - A Revisão e o PDF do Projetista passam a incluir a informação `Puxadores` em todos os
    ambientes (A, B e C), por último antes das observações.
- **Alterado (testes existentes, de propósito):**
  - `T-V03`, `T-V04`, `T-V05`, `T-V06` e `T8` em `testes/V_pdf_projetista.test.js` serão
    atualizados porque verificam a lista exata de linhas impressas nos grupos A, B e C.
  - `T17` e `BASE_A` em `testes/V_validacao_projetista.test.js` serão atualizados porque grupos A,
    B e C passam a exigir resposta de puxador.

---

## 10. Retrocompatibilidade com rascunhos já salvos

O rascunho do Projetista é salvo na chave `byarabi_checklist_vendedor` do navegador
(`FormProviderVendedor.jsx:8`). Efeitos verificados no código:

1. **Não quebra nem apaga rascunhos antigos:** `normalizarEstadoSalvo`
   (`FormProviderVendedor.jsx:25-50`) mistura os `defaultsPorGrupo` de cada ambiente com o que já
   estava salvo. Os novos campos de puxador passam a existir como não respondidos (`null` / lista
   padrão) sem erro de JavaScript.
2. **Validação só ocorre ao clicar Avançar na tela do ambiente:**
   - Se o rascunho estiver parado dentro de um ambiente, o usuário responderá *"Tem puxador?"* ali
     (ou será bloqueado ao tentar avançar).
   - Se o rascunho já estiver na Revisão (`etapaAtual = 'revisao'`), o `"Sim, continuar"` abre a
     Revisão e `StepRevisaoVendedor.jsx:59-71` gera o PDF sem revalidar — exibindo `Puxadores: —`
     na Revisão e `Resposta: —` no PDF para ambientes de rascunho antigo, igual a qualquer outra
     pergunta vazia hoje.
3. **Quem começa do zero** não é afetado e responde normalmente em todos os ambientes.

---

## 11. O que NÃO será tocado

- **Perfil Cliente inteiro:** `src/steps/StepIdentificacao/`, `StepAmbientes/`,
  `StepPerguntasGlobais/`, `StepPerguntasPorAmbiente/`, `StepRevisao/`, `StepSucesso/`,
  `FormProvider.jsx`, `schema.js`, `scoreEngine.js`, `ccBuilder.js`, `pdf.js`, `importacaoPdf.js`.
- **Venda futura e telas iniciais:** `SelecaoPerfil.jsx`, `EscolhaProjetista.jsx`,
  `FormProviderFutura.jsx`, `StepRevisaoFutura.jsx`, `StepSucessoFutura.jsx`, `pdfFutura.js`.
- **CSS compartilhado com Venda futura:** `StepRevisaoVendedor.module.css` não precisa de alteração
  (a menos que seja estritamente necessária, sem editar nenhuma regra existente).
- **Perguntas já existentes do Projetista:** alturas do piso (`alturaBalcao_mm`, `alturaArmario_mm`),
  balcões convencionais/editados (`tipoBalcao` e suas duas subperguntas), `fechamentoTeto`,
  `caixaria`, `dobradicas`, `corredicas` e `observacoes`.
- **Portas de alumínio/vidro (`Allure` e `Villaggio`)** — fora de escopo.
- **Catálogo e agrupamento de ambientes:** `ambientes.js` e `gruposPerguntasVendedor.js`.
- **Identificação do Projetista** (`StepIdentificacaoVendedor.jsx`) e fluxo de contratos.
- **Nome do arquivo PDF** (`Checklist_Projetista_<CONTRATO>_<DATA>.pdf`), capa e chave de
  `localStorage`.
- **Scripts externos** em `c:\Users\Windows 10\AUTOMACOES` (`assistente_email.py`, etc.).

---

## 12. Premissas assumidas

- **P1.** Todos os 8 ambientes existentes em `ambientes.js` (distribuídos nos grupos A, B e C)
  passam a ter a pergunta *"Tem puxador?"* por último dentro de *"Acabamento e ferragens"*.
- **P2.** Não existe pontuação de risco nem Cliente Ciente no Perfil Projetista — esta feature não
  introduz score nem CCs.
- **P3.** A lista suspensa do combobox não usa `<datalist>` nativo e não instala pacote npm novo; é
  um componente simples em React puro usando os tokens `--ba-*` de `src/index.css`.
- **P4.** Os valores gravados de Modelo e Cor são texto livre (`string`), permitindo acentos,
  espaços, medidas (ex.: `150mm`) e modelos raros digitados manualmente (ex.: `Zen Cup`). Espaços
  apenas nas pontas não contam como campo preenchido na validação.
- **P5.** O reconhecimento de `Madri 150mm`, `Madri 270mm` e `Florença` para autopreencher `"Sem
  cor"` ignora maiúsculas/minúsculas, acentos (ex.: `florenca` = `Florença`) e espaços extras nas
  pontas.
- **P6.** Se o usuário digitar um modelo sem escolher da lista, ou apagar e reescrever o campo, o
  comportamento de sugestão/autopreenchimento (e limpeza de `"Sem cor"`) do campo Cor reage
  imediatamente ao texto atual do campo Modelo.
- **P7.** Quando `Madri 150mm`, `Madri 270mm` ou `Florença` autopreenche `"Sem cor"`, o campo Cor
  **permanece editável** (nunca `disabled` ou `readOnly`), permitindo ao vendedor alterar caso haja
  exceção em catálogo futuro ou caso especial.
- **P8.** A comparação de filtro no autocomplete ignora acentos e caixa (ex.: digitar `aluminio`
  encontra `Alumínio`, digitar `aco` encontra `Aço`, digitar `florenca` encontra `Florença`),
  reduzindo erros de digitação no celular.
- **P9.** Quando o modelo digitado está fora dos 8 modelos sugeridos (ou vazio), o campo Cor não
  exibe lista suspensa nem setinha `▾`, aceitando apenas digitação livre obrigatória.

---

## 13. Riscos identificados

- **R1. Uso no celular com teclado virtual e perda de foco (`onBlur`).** Em telas touch, tocar em
  uma opção da lista suspensa ou na setinha `▾` pode disparar o fechamento da lista antes de
  registrar o toque, fazendo a seleção "não pegar".
  - *Mitigação:* capturar a seleção no evento adequado antes do fechamento (ou controlar abertura
    por contêiner/clique fora), além de testar manualmente no celular / viewport mobile antes de
    concluir.
- **R2. Autocomplete atrapalhando edição de texto já preenchido.** Se o campo já tiver `"Sem cor"`
  ou `"Roma"` e filtrar apenas pelo texto atual ao receber foco, o usuário que só tocou para trocar
  veria a lista vazia ou com 1 item e teria que apagar letra por letra.
  - *Mitigação:* ao clicar/focar em campo já preenchido, selecionar o texto inteiro e abrir todas as
    sugestões (filtrando só quando o usuário digitar/alterar); além disso, a setinha `▾` abre/fecha
    todas as sugestões com 1 toque.
- **R3. Sobrescrever cor já digitada pelo usuário ao mudar o modelo.** Se o usuário digitou uma cor
  específica manualmente (ex.: `"Preto"`) e depois corrigiu o modelo, apagar qualquer cor seria
  frustrante; por outro lado, deixar `"Sem cor"` quando troca de `Madri`/`Florença` para outro
  modelo (ou apaga o modelo) causaria erro operacional na liberação.
  - *Mitigação:* limpar **apenas** quando o valor atual da Cor for `"Sem cor"` (ignorando caixa e
    acentos) ao sair de `Madri 150mm`/`Madri 270mm`/`Florença` para qualquer outro valor (modelo com
    paleta, modelo desconhecido ou vazio). Se o usuário digitou outra cor manualmente, ela é
    preservada.
- **R4. Quebra de testes existentes que afirmam lista exata de linhas no PDF e validação.**
  `T-V03`, `T-V04`, `T-V05`, `T-V06` e `T8` em `testes/V_pdf_projetista.test.js` e `T17` / `BASE_A`
  em `testes/V_validacao_projetista.test.js` vão falhar se não forem atualizados intencionalmente.
  - *Mitigação:* atualização planejada e documentada na Seção 16 (`T9` continua passando sem
    edição).
- **R5. Divergência entre Revisão e PDF.** Como `PERGUNTAS_POR_GRUPO` é duplicada entre
  `StepRevisaoVendedor.jsx` e `pdfVendedor.js`, alterar apenas um dos arquivos causaria divergência.
  - *Mitigação:* colocar toda a lógica de texto de puxadores em uma única função pura em
    `src/domain/` e conferir ambos nos critérios de aceitação.
- **R6. Rascunho antigo no `localStorage` parado na Revisão.** Gera PDF com `Resposta: —` em
  `Puxadores` por não haver revalidação na Revisão (mesmo comportamento aceito na feature de
  balcões).
  - *Mitigação:* documentado na Seção 10; `normalizarEstadoSalvo` garante que não há crash.
- **R7. Digitação manual de `"Madri"` sem tamanho (`150mm` ou `270mm`).** Como as sugestões são
  `Madri 150mm` e `Madri 270mm`, o vendedor que tentar digitar apenas `Madri` verá imediatamente as
  duas opções filtradas na lista suspensa. Caso ainda assim deixe literalmente `"Madri"` sem
  tamanho, não casará com as duas opções com medida e a Cor ficará como campo livre obrigatório
  sem sugestões e sem setinha `▾` (evitando que passe sem tamanho especificado silenciosamente).
- **R8. Convivência na mesma branch `feat/balcoes-convencionais-editados`.** Como esta feature
  entrará na mesma branch da feature de balcões, alterações em arquivos já modificados lá
  (`schemaVendedor.js`, `validacaoVendedor.js`, `FormGrupoA.jsx`, `StepRevisaoVendedor.jsx`,
  `pdfVendedor.js`, `V_pdf_projetista.test.js`, `V_validacao_projetista.test.js`) precisam preservar
  100% dos testes e regras de balcões.
  - *Mitigação:* rodar toda a suíte `npm test` (incluindo `T1`-`T20` de balcões) a cada etapa.

---

## 14. Decisões tomadas

Todas as sete questões em aberto (Q1 a Q7) foram **decididas pelo Everton**. Não há nenhuma questão
em aberto.

- **Q1. Botão `"Não se aplica"` e mensagem de erro:** *"Tem puxador?"* terá **apenas** os botões
  **`Sim`** e **`Não`** (sem `"Não se aplica"`). Mensagem de erro quando não respondida: `Responda
  sim ou não` (`MSG_RESPONDA_SIM_NAO` de `validacaoVendedor.js:2`). Em `FormGrupoB.jsx` e
  `FormGrupoC.jsx`, `campoFechado` ganha suporte a `mostrarNaoSeAplica = true` (igual a
  `FormGrupoA.jsx:57-87`) ou o bloco compartilhado renderiza `Sim`/`Não` sem `"Não se aplica"`.
- **Q2. Formatação na Revisão e no PDF (Opção A):** formato uniforme e sem destaque colorido, com
  rótulo **`Puxadores`**:
  - Não respondida (rascunho antigo): `—` (PDF: `Resposta: —`)
  - `Não`: `Não` (PDF: `Resposta: Não`)
  - `Sim` (1 ou mais puxadores): `Sim` (PDF: `Resposta: Sim`), seguido de uma linha recuada por
    puxador com marcador `•` no formato `• <Modelo> — <Cor>`, reutilizando `linhasExtras` de
    `pdfVendedor.js:114-116` e `<br />` de `StepRevisaoVendedor.jsx:114-119`.
- **Q3. Trocar `Sim` → `Não` → `Sim`:** **igual aos balcões** — marcar `Não` **preserva** os
  puxadores já preenchidos no estado, apenas escondendo o bloco e fazendo validação, Revisão e PDF
  ignorarem a lista; ao voltar para `Sim`, os puxadores reaparecem como estavam.
- **Q4. Campo Cor para modelo desconhecido (Opção A):** quando o Modelo digitado estiver fora dos 8
  da lista (ex.: `Zen Cup`), o campo **Cor** fica como **campo de texto livre obrigatório, sem
  sugestões e sem exibir o botão de setinha (`▾`)**.
- **Q5. Troca de modelo de cor única para qualquer outro valor:** ao trocar um modelo de cor única
  (`Madri 150mm`, `Madri 270mm`, `Florença`) cujo campo Cor está com `"Sem cor"` para **qualquer
  outro valor** (outro modelo com paleta, modelo desconhecido fora da lista, ou apagar o campo
  Modelo), limpar `"Sem cor"` automaticamente (`""`).
- **Q6. Posição dentro de *"Acabamento e ferragens"*:** *"Tem puxador?"* entra **por último** dentro
  do bloco *"Acabamento e ferragens"* nos 3 grupos (Grupo A: após `Corrediças`; Grupo B: após
  `Fechamento até o teto`; Grupo C: após `Corrediças`), com a mesma ordem na tela, Revisão e PDF.
- **Q7. Interação combinada do combobox editável:**
  - Ao **clicar/focar no texto** de um campo já preenchido, **seleciona o texto inteiro** e abre a
    lista completa de sugestões (filtrando apenas quando o usuário digitar/alterar o texto).
  - Possui uma **setinha (`▾`) no canto direito** apenas quando houver sugestões disponíveis (sempre
    em Modelo; em Cor, apenas quando o modelo possuir sugestões): tocar na setinha abre/fecha a
    lista suspensa mostrando **todas as sugestões** daquele campo.

---

## 15. Critérios de aceitação

Legenda: **[Auto]** coberto por teste automatizado (`npm test`); **[Manual]** conferido na tela e
no PDF aberto com `npm run dev` (incluindo celular / viewport mobile).

**Tela — pergunta gatilho, posição e preservação**

- **CA-01 [Manual] — Pergunta aparece por último nos 3 grupos (A, B e C), sem `"Não se aplica"`.**
  Entrada: no Projetista, abrir um ambiente do grupo A (`Cozinha`), um do grupo B (`Dormitório
  Casal`) e um do grupo C (`Home / Sala`). Esperado: em todos os três aparece *"Tem puxador?"* como
  **último item** dentro de *"Acabamento e ferragens"* (após `Corrediças` em A e C; após
  `Fechamento até o teto` em B), com **apenas** os botões `Sim` e `Não` (sem `"Não se aplica"`),
  nenhum pré-marcado. As perguntas já existentes continuam com `"Não se aplica"`.
- **CA-02 [Manual] — Opção `Não` não abre campos.** Entrada: tocar em `Não`. Esperado: botão `Não`
  marcado; nenhum campo de Modelo, Cor ou botão `+ Adicionar puxador` aparece.
- **CA-03 [Manual] — Opção `Sim` abre o 1º puxador e o botão `+ Adicionar puxador`.** Entrada:
  tocar em `Sim`. Esperado: aparece o 1º puxador com os campos **Modelo** e **Cor** em branco, **sem
  botão de remover (`−`)**, e logo abaixo o botão **`+ Adicionar puxador`**. Não existe opção
  `"Outro"` em nenhuma lista.
- **CA-04 [Manual] — Adicionar e remover puxadores adicionais.** Entrada: clicar duas vezes em
  `+ Adicionar puxador`, depois clicar em `−` no 2º puxador. Esperado: ao adicionar, surgem o 2º e
  o 3º puxadores em branco, ambos com botão `−`; o 1º continua sem botão `−`; ao remover o 2º,
  restam dois puxadores e os valores do remanescente são mantidos intactos.
- **CA-05 [Manual] — Independência por ambiente e preservação ao trocar `Sim` → `Não` → `Sim`.**
  Entrada: na `Cozinha`, marcar `Sim` e preencher `Roma` / `Fendi`; trocar para `Não`; depois voltar
  para `Sim`; e deixar `Dormitório Casal` em `Não`. Esperado: ao marcar `Não` na Cozinha o bloco
  some; ao voltar para `Sim` na Cozinha, `Roma` / `Fendi` reaparecem intactos; o `Dormitório Casal`
  mantém `Não`.

**Tela — Combobox editável e dependência Modelo × Cor**

- **CA-06 [Auto regra; Manual UI] — Sugestões de Modelo na ordem correta.** Entrada: focar no campo
  Modelo vazio (ou tocar na setinha `▾`). Esperado: lista exibe exatamente nesta ordem: `Roma`,
  `Madri 150mm`, `Madri 270mm`, `Berlin`, `Paris`, `Perfil Cava`, `Perfil Gola Fit`, `Florença`.
- **CA-07 [Auto filtro; Manual UI] — Autocomplete filtra ao digitar, permite texto livre e seleciona
  texto ao focar / abrir com setinha `▾`.** Entrada: digitar `"mad"` no Modelo; selecionar `Madri
  150mm`; clicar no texto do campo já preenchido (ou tocar na setinha `▾`); digitar `"Zen Cup"`.
  Esperado:
  - ao digitar `"mad"`, sugere `Madri 150mm` e `Madri 270mm`;
  - ao clicar no texto já preenchido `"Madri 150mm"`, o texto inteiro fica selecionado e a lista
    mostra todas as 8 sugestões; digitar a primeira letra já substitui o texto anterior;
  - ao tocar na setinha `▾`, a lista abre/fecha com todas as 8 sugestões;
  - digitar `"florenca"` sem acento encontra `Florença`;
  - digitar `"Zen Cup"` é aceito livremente sem precisar de opção `"Outro"`.
- **CA-08 [Auto regra; Manual UI] — Sugestões dependentes de Cor e ausência de setinha em modelo
  desconhecido.** Entrada: selecionar/digitar cada modelo e observar o campo Cor e a setinha `▾`.
  Esperado:
  - `Roma` → setinha `▾` visível; sugere `Fendi`, `Alumínio`, `Griggio`;
  - `Berlin` → setinha `▾` visível; sugere `Antique`, `Aço`, `Cobre`;
  - `Paris` → setinha `▾` visível; sugere `Antique` (campo editável, aceita digitar outra cor, ex.:
    `Preto`);
  - `Perfil Cava` → setinha `▾` visível; sugere `Fendi`, `Alumínio`;
  - `Perfil Gola Fit` → setinha `▾` visível; sugere `Alumínio`, `Grafito`;
  - Modelo desconhecido (ex.: `"Zen Cup"`) ou Modelo vazio → campo Cor funciona como texto livre
    obrigatório, **sem sugestões e sem exibir setinha `▾`**.
- **CA-09 [Auto regra; Manual UI] — Autopreenchimento editável de `"Sem cor"` para cor única.**
  Entrada: selecionar `Madri 150mm`, depois testar `Madri 270mm` e depois digitar `"florenca"` (sem
  acento e minúsculo) no campo Modelo. Esperado: o campo Cor é preenchido automaticamente com
  `"Sem cor"`, mas **continua editável** (não travado), permitindo selecionar/apagar/reescrever.
- **CA-10 [Auto regra; Manual UI] — Trocar modelo de cor única limpa `"Sem cor"` para qualquer novo
  valor.** Entrada: estar com `Madri 150mm` (Cor = `"Sem cor"`) e testar três trocas separadas de
  Modelo: (a) para `Roma`, (b) para `"Zen Cup"`, (c) apagar o campo Modelo deixando-o vazio.
  Esperado: nos três casos o campo Cor limpa `"Sem cor"` automaticamente (fica em branco); em (a)
  passa a sugerir `Fendi`, `Alumínio`, `Griggio` com setinha `▾`; em (b) e (c) fica livre sem
  sugestões e sem setinha `▾`.
- **CA-11 [Manual] — Usabilidade no celular.** Entrada: testar o preenchimento, filtro, seleção por
  toque na lista suspensa, toque na setinha `▾` e edição de texto no navegador em viewport
  mobile/celular. Esperado: o toque na sugestão ou na setinha funciona na primeira tentativa (sem
  falhar por `onBlur`), sem quebra de layout.

**Validação (erros)**

- **CA-12 [Auto] — Pergunta *"Tem puxador?"* sem resposta bloqueia nos grupos A, B e C.** Entrada:
  ambiente completo de A, B ou C com *"Tem puxador?"* sem resposta; clicar em `"Avançar"`.
  Esperado: bloqueia com a mensagem exata **`Responda sim ou não`** na pergunta de puxador; outros
  campos válidos ficam sem erro. ([Manual] para rolagem até o erro).
- **CA-13 [Auto] — *"Tem puxador?"* = `Não` libera o avanço.** Entrada: ambiente completo de A, B ou
  C com `Não` marcado (inclusive quando houver puxadores preservados no estado de um `Sim` anterior,
  ou com puxadores incompletos ocultos). Esperado: avança sem erro.
- **CA-14 [Auto] — *"Tem puxador?"* = `Sim` com Modelo e/ou Cor vazios bloqueia por item.** Entrada:
  - (a) 1º puxador com Modelo vazio e Cor vazia → erro nos dois campos do 1º puxador;
  - (b) 1º puxador completo (`Roma` / `Fendi`) e 2º puxador com Modelo `Berlin` e Cor vazia (ou só
    espaços `"   "`) → erro **apenas** na Cor do 2º puxador;
  - (c) remover o 2º puxador com erro → validação passa sem erro.
- **CA-15 [Auto] — Modelo de cor única com `"Sem cor"` autopreenchido avança.** Entrada: `Sim`,
  Modelo = `Madri 150mm` (ou `Madri 270mm` ou `Florença`), Cor = `"Sem cor"`. Esperado: avança sem
  erro.
- **CA-16 [Auto] — Trocar para outro modelo ou apagar limpa `"Sem cor"` e volta a exigir Cor.**
  Entrada: usuário tinha `Madri 150mm` (`"Sem cor"`), trocou para `Roma` (ou `"Zen Cup"`) e não
  preencheu a Cor; tentar avançar. Esperado: bloqueia exigindo o preenchimento da Cor.
- **CA-17 [Auto] — Modelo livre digitado + Cor livre digitada avançam.** Entrada: `Sim`, Modelo =
  `"Zen Cup"`, Cor = `"Gold"`. Esperado: avança sem erro.
- **CA-18 [Auto] — Regras existentes intactas.** Entrada: validações anteriores do grupo A (alturas
  de piso, balcões convencionais/editados, fechamento, caixaria, dobradiças, corrediças) e grupos
  B e C. Esperado: mesmas mensagens e bloqueios de hoje quando `Tem puxador?` está respondido.

**Revisão e PDF do Projetista**

- **CA-19 [Auto texto PDF; Manual Revisão] — Ambiente com `Não`.** Entrada: ambiente dos grupos A,
  B e C com `Tem puxador?` = `Não` (inclusive com puxadores preservados no estado). Esperado:
  Revisão exibe `Puxadores: Não` e PDF exibe `Puxadores` seguido de `Resposta: Não`, sem listar
  nenhum modelo/cor e sem destaque colorido.
- **CA-20 [Auto texto PDF; Manual Revisão] — Ambiente com 1 puxador e com múltiplos puxadores.**
  Entrada: Cozinha com `Roma` (`Fendi`) + `Madri 150mm` (`Sem cor`). Esperado: Revisão exibe
  `Puxadores: Sim` com `• Roma — Fendi` e `• Madri 150mm — Sem cor` abaixo; PDF exibe `Puxadores`,
  `Resposta: Sim`, `• Roma — Fendi` e `• Madri 150mm — Sem cor` recuados, na ordem cadastrada, sem
  destaque vermelho.
- **CA-21 [Auto texto PDF; Manual Revisão] — Rascunho antigo / não respondido.** Entrada: ambiente
  com defaults sem resposta de puxador (e rascunho salvo antes da mudança aberto na Revisão).
  Esperado: sem crash; exibe `Puxadores: —` na Revisão e `Puxadores` seguido de `Resposta: —` no
  PDF; ao voltar no ambiente e tentar avançar, *"Tem puxador?"* passa a ser exigida.
- **CA-22 [Auto] — Grupos A, B e C e observações preservados no PDF.** Entrada: ambientes A, B e C
  com observações preenchidas. Esperado: ordem das perguntas existentes preservada, com `Puxadores`
  por último antes de `"Observações do ambiente"`, e testes atualizados verdes (inclusive `T9`).

**Isolamento e regressão**

- **CA-23 [Manual] — Perfil Cliente, Venda futura e portas Allure/Villaggio fora de escopo.**
  Entrada: percorrer o fluxo do Cliente e `/futura/*`. Esperado: nenhuma pergunta de puxador,
  nenhuma mudança visual em `/futura/revisao` nem no PDF do Cliente/Venda futura.
- **CA-24 [Auto] — Suíte completa e build verdes.** Entrada: `npm test` e `npm run build`. Esperado:
  todos os testes passam (0 falhas, 0 pulados) e o build compila sem erros.

---

## 16. Cobertura de testes

### 16.1 Testes existentes que mudam de propósito (e preservação do `T9`)

Como a pergunta de puxadores entra por último em *"Acabamento e ferragens"* nos **3 grupos (A, B e
C)** e aparece no PDF e na validação de todos os ambientes:

1. `testes/V_pdf_projetista.test.js`:
   - `T-V03` (`:31-49`, grupo A vazio) — passa a conter `Puxadores` / `Resposta: —` por último
     (após `Corrediças` / `Resposta: —`).
   - `T-V04` (`:51-64`, grupo B vazio) — passa a conter `Puxadores` / `Resposta: —` por último
     (após `Fechamento até o teto` / `Resposta: —`).
   - `T-V05` (`:66-76`, grupo C vazio) — passa a conter `Puxadores` / `Resposta: —` por último
     (após `Corrediças` / `Resposta: —`).
   - `T-V06` (`:78-101`, respostas do grupo A) — passa de 7 para 8 respostas `Resposta: ...` com o
     `Resposta: —` de `Puxadores` no final.
   - `T8` (`:286-323`, observações e ordem no grupo A) — passa a incluir `Puxadores` / `Resposta: —`
     logo após `Corrediças` / `Resposta: —` e antes de `Observações do ambiente`.
   - **Observação sobre `T9` (`:325-347`, especificamente `:337`):** hoje `T9` afirma
     `ausencia(captura, { igual: 'Resposta: Não' })` para os 7 casos de balcões. Como nesses 7 casos
     `temPuxador` fica com o default `null` (não respondido), o PDF imprime `Resposta: —` em
     `Puxadores`, e não `Resposta: Não`. Portanto **`T9` continua passando sem quebrar e não precisa
     ser alterado**.
2. `testes/V_validacao_projetista.test.js`:
   - `T17` (`:17-36`, grupos B e C) — precisa incluir resposta válida de puxador na entrada válida, e
     também ganha verificação de que B e C sem resposta de puxador bloqueiam com
     `MSG_RESPONDA_SIM_NAO`.
   - `BASE_A` (`:8-15`) — precisa incluir resposta válida padrão de puxador para que `T10`-`T16`,
     `T18` e `T20` continuem isolando apenas o campo testado em cada caso.

### 16.2 O que será testado automaticamente (`npm test`)

1. **Catálogo, filtro e dependência de Cor (`testes/V_puxadores.test.js`):**
   - Ordem exata dos 8 modelos sugeridos (`Roma` até `Florença`).
   - Sugestões corretas de Cor para `Roma`, `Berlin`, `Paris`, `Perfil Cava`, `Perfil Gola Fit`.
   - Modelo desconhecido (ex.: `"Zen Cup"`) e modelo vazio retornam lista vazia de sugestões de Cor
     (sem setinha `▾`).
   - Reconhecimento tolerante a maiúsculas/minúsculas e acentos para `Madri 150mm`, `Madri 270mm` e
     `Florença` (ex.: `"florenca"`, `"MADRI 150MM"` → autopreenche `"Sem cor"`).
   - Trocar modelo de cor única com `"Sem cor"` para `Roma`, para `"Zen Cup"` ou para vazio `""`
     limpa `"Sem cor"`, enquanto preserva outra cor digitada manualmente.
   - Filtro do autocomplete ignorando acentos e caixa.
   - Função compartilhada de formatação para Revisão e PDF (não respondida → `—`, `Não` → `Não`,
     `Sim` com 1 puxador, `Sim` com múltiplos puxadores, `Não` com lista preservada no estado não
     vazando linhas).
2. **Validação (`testes/V_validacao_projetista.test.js`):**
   - Bloqueio com `Responda sim ou não` quando *"Tem puxador?"* está `null`/ausente nos grupos A,
     B e C (CA-12).
   - Liberação com `Não`, inclusive com lista preservada no estado (CA-13).
   - Bloqueio com `Sim` e lista vazia, 1º item com Modelo ou Cor vazio/só espaços, 2º item com
     campo vazio (erro indexado apenas no campo faltante) (CA-14).
   - Liberação com `Sim` e `Madri 150mm` + `"Sem cor"`, múltiplos itens válidos e modelo/cor livre
     (CA-15, CA-17).
   - Regressão de todas as regras antigas de balcão e alturas (CA-18).
3. **PDF do Projetista (`testes/V_pdf_projetista.test.js`):**
   - Atualização intencional de `T-V03`, `T-V04`, `T-V05`, `T-V06` e `T8`; `T9` mantido intacto.
   - Novos casos para grupos A, B e C com `Não`, 1 puxador e múltiplos puxadores (`Resposta: Sim` +
     `• <Modelo> — <Cor>`) (CA-19, CA-20, CA-22).

### 16.3 O que fica para conferência manual (`npm run dev`)

- Interação visual e tátil do combobox editável no desktop e no celular: seleção do texto inteiro ao
  clicar/focar em campo preenchido, abertura da lista completa, botão de setinha `▾` exibido apenas
  quando há sugestões, toque em sugestões sem perda de foco, edição/apagamento após selecionar,
  teclado `ArrowUp`/`ArrowDown`/`Enter`/`Escape` (CA-06 a CA-11).
- Botões `+ Adicionar puxador` e `−` nos itens adicionais, além da preservação ao alternar `Sim` →
  `Não` → `Sim` (CA-03, CA-04, CA-05).
- Rolagem automática até o erro do combobox (CA-12).
- Tela de Revisão (conferência visual com os mesmos textos do PDF — CA-19, CA-20, CA-21).
- Rascunho antigo real salvo em `byarabi_checklist_vendedor` e isolamento visual de Cliente e
  `/futura/revisao` (CA-21, CA-23).

---

## 17. Documentos a revisar depois da implementação

- `CLAUDE.md` do projeto: ao concluir a implementação, verificar com o Everton se precisa atualizar
  a descrição dos arquivos de `src/domain/` (por exemplo, citando `puxadoresVendedor.js`), mantendo
  o arquivo abaixo de ~100 linhas.
- `ESTUDO_RANQUEAMENTO_PUXADORES.md`: serve de referência histórica/base de dados; não precisa ser
  alterado.
- `PRDS_E_SPECS/`: se desejado pelo Everton após a conclusão, mover os pares `PRD_*` / `SPEC_*` da
  raiz para `PRDS_E_SPECS/` conforme convenção do repositório.
