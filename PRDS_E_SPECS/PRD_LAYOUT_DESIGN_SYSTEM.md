# PRD — Atualização Visual: Design System By Arabi

**Status:** Aguardando aprovação
**Data:** 2026-09-23
**Projeto:** Checklist Dinâmica — By Arabi Planejados

---

## Objetivo

Substituir a paleta de cores, tipografia e geometria de componentes do app (hoje um tema dourado/preto criado sem referência formal) pela identidade visual medida em `PRDS_E_SPECS/REFERENCIA_DESIGN_SYSTEM_BY_ARABI.html` — o "Design System By Arabi", extraído do CSS de produção de byarabiplanejados.com.br.

A mudança é **exclusivamente visual**: cores, tipografia, botões, campos, cards, header, stepper, bottom bar, modal e badges. Nenhuma tela, rota, pergunta, texto, regra de score/CC ou o PDF são alterados.

O próprio Design System registra esta escolha explicitamente (arquivo de referência, linhas 884-888): *"Checklist Dinâmica prevê a skill em PRD e Spec e ainda não foi estilizada — é o candidato natural para estrear o sistema sem retrabalho."*

---

## Fonte da verdade e uma divergência a registrar

A fonte da verdade visual é **exclusivamente** `PRDS_E_SPECS/REFERENCIA_DESIGN_SYSTEM_BY_ARABI.html`. O arquivo foi lido por completo (902 linhas; a única parte não lida foram duas linhas de dado base64 de uma imagem de logo — linhas 826 e 830 —, irrelevantes para o texto).

**Divergência registrada:** a skill `byarabi-design` (`C:\Users\maste\.claude\skills\byarabi-design\SKILL.md`) **não foi usada como referência** porque está desatualizada e contradiz o artefato — tema escuro como padrão, dourado `#D4A830` (o artefato usa `#e3b838`/`#a77d0b`), e fontes via Google Fonts (Cormorant/DM Sans), enquanto o artefato exige zero webfonts (Georgia + Helvetica Neue/Arial, ambas de sistema). O próprio artefato confirma isso na seção "O que já foi decidido" (linha 866-871): a skill antiga tinha valores que "não batiam com o site" e contraste ilegível (1,84:1). Onde houver conflito entre a skill e o artefato, **o artefato prevalece**.

---

## Contexto — estado atual medido no repositório

### Volume e ausência de tokens

Medido com busca por padrão de cor fixa (hex de 3-6 dígitos e `rgba(...)`) em todos os `.css` de `src/`: **183 ocorrências em 19 arquivos**. Busca por `var(--` no mesmo escopo: **zero ocorrências** — o projeto não usa nenhuma variável CSS hoje, cada cor é escrita por extenso em cada arquivo.

Os 19 arquivos são:

| Arquivo | Ocorrências de cor fixa |
|---|---|
| `src/index.css` | 9 |
| `src/components/BottomBar/BottomBar.module.css` | 9 |
| `src/components/FieldGroup/FieldGroup.module.css` | 4 |
| `src/components/Header/Header.module.css` | 3 |
| `src/components/Modal/Modal.module.css` | 3 |
| `src/components/ScoreBadge/ScoreBadge.module.css` | 3 |
| `src/components/Stepper/Stepper.module.css` | 4 |
| `src/screens/SelecaoPerfil/SelecaoPerfil.module.css` | 5 |
| `src/steps/StepAmbientes/StepAmbientes.module.css` | 8 |
| `src/steps/StepIdentificacao/StepIdentificacao.module.css` | 7 |
| `src/steps/StepPerguntasGlobais/StepPerguntasGlobais.module.css` | 24 |
| `src/steps/StepPerguntasPorAmbiente/StepPerguntasPorAmbiente.module.css` | 30 |
| `src/steps/StepRevisao/StepRevisao.module.css` | 25 |
| `src/steps/StepSucesso/StepSucesso.module.css` | 4 |
| `src/steps/vendedor/StepAmbientesVendedor/StepAmbientesVendedor.module.css` | 8 |
| `src/steps/vendedor/StepIdentificacaoVendedor/StepIdentificacaoVendedor.module.css` | 9 |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.module.css` | 16 |
| `src/steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.module.css` | 8 |
| `src/steps/vendedor/StepSucessoVendedor/StepSucessoVendedor.module.css` | 4 |

Paleta atual aproximada (repetida por extenso em vários arquivos, sem um único ponto de definição): `#c8a84b` (dourado principal), `#1a1a1a` (fundo escuro do header/botões), `#f7f5f0`/`#f5f0e8` (fundos claros), `#e0d8c8` (bordas de card), `#7a6030`/`#7a4f00`/`#b8860b` (variações de dourado escuro para texto), `#fff8e6`/`#fff8e1` (fundo de destaque dourado claro), `#c0392b` (erro/vermelho), `#1b5e20` (verde). Nenhuma dessas cores é a do Design System — não há sobreposição, exatamente como a tabela "A distância entre o que existe e o alvo" do artefato descreve para o site institucional antigo (arquivo de referência, linhas 785-801).

`src/index.css` (arquivo global, sem CSS Module) define hoje: `body` com fonte de sistema `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto` e fundo `#f7f5f0` (linhas 9-15); e o diálogo de retomada de rascunho (`.rascunho-dialog`, `.rascunho-card`, `.rascunho-acoes`, `.btn-secundario` — linhas 26-79), com cores próprias (`#fff`, `#1a1a1a`, `#c8a84b`, `#555`, `#ccc`) e um overlay em `rgba(0, 0, 0, 0.55)` (`.rascunho-dialog`, linha 30).

### Inline styles verificados — sem impacto de cor

Os três arquivos `.jsx` com `style={{...}}` foram lidos. Nenhum carrega cor:

- `src/steps/StepIdentificacao/StepIdentificacao.jsx:186` — `style={{ maxWidth: 80 }}` (layout de um campo).
- `src/steps/StepPerguntasPorAmbiente/StepPerguntasPorAmbiente.jsx:29` — `style={{ padding: 16 }}` (mensagem "Ambiente não encontrado.").
- `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.jsx:46` — mesmo padrão, mesma mensagem.

Conclusão: **nenhum arquivo `.jsx` precisa ser modificado** nesta melhoria — a mudança fica inteiramente contida nos 19 arquivos `.css`/`.module.css` acima. Os componentes React já leem classes de CSS Module; ajustar os valores dentro dessas classes não exige tocar em nenhum componente. (Ver, no entanto, a pergunta em aberto "d", que registra uma exceção pontual candidata a esta regra.)

### "Estado nunca é dourado" — violação confirmada e duplicada

O Design System declara literalmente (linha 718-720): *"estado nunca é dourado. O ouro é identidade e ação principal. Se um status usar ouro, o operador perde a única pista visual confiável de 'isto é o botão que resolve'."* Além disso define cores de estado próprias: `--ok:#2f6b45`, `--warn:#9a5b1f` (terracota), `--danger:#a32f2b`.

O app viola essa regra hoje, e o faz em dois lugares que deveriam ser a mesma fonte:

**1. `src/domain/scoreEngine.js:164-168`** — a função `classificar()` retorna exatamente as strings `'ALTO'`, `'MÉDIO'` ou `'BAIXO'` (confirmado por leitura direta).

**2. `src/components/ScoreBadge/ScoreBadge.jsx:3-7`** mapeia essas três strings para classes CSS. Em `ScoreBadge.module.css:9-11`:
```
.alto  { background: #fde8ea; color: #c0392b; }
.medio { background: #fff8e1; color: #b8860b; }   /* dourado usado como estado */
.baixo { background: #e8f5e9; color: #1b5e20; }
```

**3. `src/steps/StepRevisao/StepRevisao.module.css`** repete o mesmo mapeamento **duas vezes a mais**, com valores idênticos, em vez de reaproveitar o badge: `.tituloAlto/.tituloMedio/.tituloBaixo` (linhas 36-38) e `.cardAlto/.cardMedio/.cardBaixo` (linhas 79-81) — `.cardMedio` também usa `#fff8e1`/`#b8860b`.

Ao tokenizar, o nível MÉDIO (tanto no badge quanto nos dois blocos duplicados de `StepRevisao`) passa a usar `--ba-warn` em vez de dourado. ALTO já está próximo de `--ba-danger` e BAIXO já está próximo de `--ba-ok` — o ajuste ali é só trocar o hex pelo token, sem mudar a intenção de cor.

**Importante — são dois mecanismos diferentes, que não coincidem sempre:** o `ScoreBadge` (score de um ambiente ou global) é calculado por **pontos acumulados** via `classificar()` (`scoreEngine.js:164-168`, que exige `pontos >= 4` para `'MÉDIO'`). Já os cards/títulos de CC em `StepRevisao` são filtrados pelo **campo `nivel` de cada CC individual** (`StepRevisao.jsx:86-114`, ex.: `ccsCC.filter((cc) => cc.nivel === 'MÉDIO')`), definido em `src/domain/ccBuilder.js` gatilho a gatilho. Um mesmo ambiente pode ter um card de CC em "Risco Médio" e, ao mesmo tempo, um badge de score BAIXO, porque o gatilho que gerou aquele CC específico vale poucos pontos. Isso já acontece hoje e não é uma regressão da mudança visual — ver CA-06a/CA-06b para dois cenários reais dessa diferença.

### Dourado também usado para "aviso" — mesma regra, ponto adicional encontrado

Além do score, o app usa uma segunda família de caixas para exibir o texto legal do "Cliente Ciente" (CC) inline, logo abaixo da pergunta que o originou (ex.: "CC: CLIENTE CIENTE E DE ACORDO QUE..."). Essas caixas também usam o par dourado, com pequenas variações entre arquivos — evidência de que a cor foi reescrita à mão em cada lugar, não reaproveitada:

| Local | Regra `.aviso`/`.avisoCard` |
|---|---|
| `StepPerguntasGlobais.module.css:163-172` | `background: #fff8e6; border: 1px solid #c8a84b; color: #7a4f00` |
| `StepPerguntasPorAmbiente.module.css:45-54` | `background: #fff8e6; border: 1px solid #c8a84b; color: #7a6030` |
| `StepRevisao.module.css:83-91` (`.avisoCard`) | `background: #f5f0e8; border-left: 3px solid #c8a84b` |
| `StepRevisaoVendedor.module.css:14-23` (`.avisoChecklist`) | `background: #fff8e6; border: 1px solid #c8a84b; color: #7a6030` |

Essas caixas de CC/aviso comunicam responsabilidade e risco — é o mesmo papel semântico do `--warn` do Design System, não um acento de marca. Este PRD trata **a caixa de aviso/CC como um só padrão visual, em `--ba-warn`**, igual nos quatro locais acima (não diferenciado por nível de risco: os componentes de formulário não recebem o nível do gatilho, só o texto — diferenciar por nível exigiria passar dado novo entre `domain/` e os componentes, o que é mudança de estrutura e está fora de escopo aqui).

**Isso é diferente do dourado usado em estado "selecionado" de chip/botão** (`.ativo`, `.chipAtivo`, `.opcaoAtiva`, presentes em `StepPerguntasGlobais.module.css`, `StepPerguntasPorAmbiente.module.css`, `StepIdentificacaoVendedor.module.css` e outros) — isso é reação a uma escolha do usuário (equivalente ao botão/chip ativo do próprio site), não um status de risco, e continua dourado.

### `.aviso` de `StepIdentificacao` NÃO é uma caixa de CC — é a mensagem de falha do CEP

`StepIdentificacao.module.css:39-43` (`color: #b8860b`, sem fundo nem borda) foi retirado da tabela acima porque não é gerado por nenhum gatilho de risco de `domain/`. O elemento que usa essa classe é o estado `cepMsg`, renderizado em `StepIdentificacao.jsx:177` (`{cepMsg && <span className={styles.aviso}>{cepMsg}</span>}`), preenchido em dois cenários de falha da busca automática de CEP (`StepIdentificacao.jsx:69-86`):

- CEP não encontrado (`StepIdentificacao.jsx:79`): "CEP não encontrado — você pode preencher o endereço manualmente."
- Erro na consulta (`StepIdentificacao.jsx:84`): "Não foi possível consultar o CEP agora — preencha o endereço manualmente."

Continua recebendo `--ba-warn`, por ser também um aviso operacional — mas como texto solto de `0.82rem`, sem caixa (fundo/borda), diferente das quatro caixas de CC listadas acima. Contraste verificado: o artefato mede `--warn` (`#9a5b1f`) sobre papel em **4,8:1** (linha 709 do arquivo de referência, "Pendência — `#9a5b1f` claro... 4,8:1"), acima do mínimo de 4,5:1 exigido pelo WCAG AA para texto normal — passa sem precisar do ajuste de legibilidade que o dourado precisou (`--ba-gold-text`).

### Logo — risco do DS não se aplica

O Design System alerta que só existe versão do logo (PNG) para fundo escuro (linhas 812-839). Verificado: **nenhum componente do app carrega imagem de logo**. `src/components/Header/Header.jsx:6` renderiza apenas o texto `"By Arabi Planejados"`, estilizado via CSS (`Header.module.css:13-18`, fonte Georgia). Não há arquivo `.png`/`.svg` de logo no repositório. Risco descartado — não há PNG para adaptar.

`Header.module.css:1-3` já usa fundo escuro `#1a1a1a` com texto dourado `#c8a84b` — isto já é estruturalmente a "faixa tinta" do artefato; a troca é de valores de token, não de abordagem. Um segundo ponto encontrado na mesma classe: `Header.module.css:13-18` (`.logo`) já usa `font-family: Georgia, serif`, mas com `font-weight: bold` — o que viola a regra do próprio artefato "serif leve, nunca negrito" (linhas 261-266: "Todo título é `Georgia, serif` com `font-weight: 400`... Título em bold quebra a marca imediatamente"). Ver item 3 de "O que será adicionado".

### O que os dois fluxos (Cliente/Vendedor) compartilham de CSS

Confirmado por leitura de imports: os arquivos `Bloco*.jsx` (`StepPerguntasGlobais/`) e `Form*.jsx` (`StepPerguntasPorAmbiente/` e `vendedor/StepPerguntasAmbienteVendedor/`) não têm CSS próprio — todos importam o `.module.css` do respectivo Step "pai" (`StepPerguntasGlobais.module.css`, `StepPerguntasPorAmbiente.module.css`, `StepPerguntasAmbienteVendedor.module.css`). Ou seja, editar esses três arquivos já cobre todos os formulários de ambiente e perguntas gerais dos dois perfis — não existem arquivos CSS extras "escondidos" por trás de cada formulário específico.

### Campos de formulário — altura hoje

O Design System propõe campo com `height: 48px` (linha 592, "Campo de formulário"). Medido no app: os campos variam entre `min-height: 40px` (ex.: `StepAmbientes.module.css:76`) e `44px` (maioria: `StepIdentificacao.module.css:25`, `StepPerguntasGlobais.module.css:35`, `StepPerguntasPorAmbiente.module.css:151`, `StepIdentificacaoVendedor.module.css:25`, `StepPerguntasAmbienteVendedor.module.css:59-67`). O próprio artefato já sinaliza esse ponto como não resolvido (linha 729): *"O campo de 48px é confortável para 4 campos, cansativo para 40."* — relevante aqui porque `StepPerguntasPorAmbiente` e `StepPerguntasAmbienteVendedor` têm dezenas de campos em sequência. Ver pergunta em aberto (b), abaixo.

### Botão "Vendedor" na BottomBar — ativo hoje, em quase todo o fluxo Cliente

`src/components/BottomBar/BottomBar.jsx:8` define `mostrarBotaoVendedor = true` como valor padrão. Ele só é explicitamente desligado (`mostrarBotaoVendedor={false}`) nas quatro telas do fluxo Vendedor (`StepAmbientesVendedor.jsx:80`, `StepIdentificacaoVendedor.jsx:121`, `StepPerguntasAmbienteVendedor.jsx:100`, `StepRevisaoVendedor.jsx:121`). Ou seja, este botão aparece hoje em **todas as telas do fluxo Cliente** que usam `BottomBar` — não é código morto: ao clicar, abre um `Modal` orientando o cliente a consultar o vendedor projetista para tirar a dúvida daquela pergunta (texto em `BottomBar.jsx:40-44`). Visualmente já é um terceiro nível de botão, distinto do primário e do secundário (`.btnVendedor` em `BottomBar.module.css:43-53`: fundo `#f5f0e8`, borda e texto dourado `#c8a84b`/`#7a6030`). Ver pergunta em aberto (c), abaixo.

### Barra inferior fixa — geometria de pílula pode não caber em 375px

`BottomBar.module.css:1-13` (`.bar`) é fixa na base da tela (`position: fixed; bottom: 0`). No fluxo Cliente ela mostra até três botões lado a lado — Voltar, Vendedor (`white-space: nowrap`) e Avançar —, hoje com `min-height: 44px` e padding entre `12px` e `20px` (`.btnPrimario` `BottomBar.module.css:15-25`, `.btnSecundario` `:32-41`, `.btnVendedor` `:43-53`). A geometria de botão em pílula do artefato (`min-height: 54px`, `padding: 0 24px`, `gap: 18px` entre rótulo e ícone — linha 572 do arquivo de referência) ocupa mais espaço horizontal e aumenta a altura da barra. Ver Risco 7 e CA-03, abaixo.

---

## Relação com os comandos/scripts existentes

Nenhum comando muda. A validação continua sendo `npm run build` (garante que compila) e navegação manual via `npm run dev`. Não há suíte de testes automatizada a atualizar. O projeto não usa pré-processador de CSS (Sass/Less) nem CSS-in-JS — é CSS puro via CSS Modules do Vite, o que é compatível de forma direta com variáveis CSS nativas (`:root { --token: valor }` + `var(--token)`), sem adicionar nenhuma dependência nova.

---

## Abordagem em duas etapas

**Etapa 1 — Tokenizar.** Criar em `src/index.css` o bloco `:root { --ba-*: ... }` já com os **nomes finais** do artefato (seção "Bloco de tokens para colar", linhas 738-771), e trocar, um a um, os 183 valores fixos — hex **e** `rgba(...)` — nos 19 arquivos por `var(--ba-*)` correspondente. Não se criam nomes de token temporários (como `--ba-gold-antigo`): cada cor hoje existente é mapeada direto para o token do artefato cujo papel mais se aproxima (ex.: o `#1a1a1a` do header aponta para `--ba-ink`, o `#c8a84b` aponta para `--ba-gold`). Nesta etapa o **valor** de cada token continua sendo o de hoje sempre que possível — só a Etapa 2 troca o valor pelo hex definitivo do artefato. **Nenhuma mudança visual intencional nesta etapa** — é indexação, não redesenho.

**Etapa 2 — Aplicar o visual do Design System.** Com os tokens já centralizados, trocar os *valores* das variáveis de `--ba-*` pelos do artefato (dourado, tinta, papel, tipografia, geometria) e ajustar as regras que dependem de valor fixo fora de cor (`border-radius`, `min-height`, `transition`, `font-family`). **Ao final desta etapa, `src/index.css` não contém nenhum token com nome ou valor "antigo"/temporário** — todos os `--ba-*` correspondem exatamente ao "Bloco de tokens para colar" do artefato, mais os tokens de estado/legibilidade explicitados nas premissas deste PRD (`--ba-gold-text`, `--ba-muted-aa`, `--ba-ok`, `--ba-warn`, `--ba-danger`, já previstos no próprio bloco do artefato).

**Por quê nessa ordem:** depois da Etapa 1, mudar qualquer coisa do tema (por exemplo, se a By Arabi trocar o tom de dourado no futuro) é editar um único arquivo (`index.css`). Sem a Etapa 1, seria necessário caçar a mesma cor em até 19 arquivos diferentes — o que é exatamente o problema medido hoje (múltiplos hex de dourado ligeiramente diferentes espalhados pelo código, ex.: `#c8a84b` vs `#b8860b` vs `#7a6030` fazendo o mesmo papel em arquivos diferentes).

---

## Arquivos afetados

| Arquivo | Tipo de mudança |
|---|---|
| `src/index.css` | Adiciona o bloco `:root { --ba-*: ... }`; body passa a usar `--ba-font-body` e `--ba-paper`; diálogo de rascunho tokenizado (incluindo o overlay `rgba`) |
| Os demais 18 arquivos `.css`/`.module.css` listados na tabela da seção "Estado atual medido" | Cada valor de cor fixo (hex ou `rgba`) passa a referenciar um `var(--ba-*)`; geometria (raio, altura mínima, transição) e tipografia de título ajustadas para os valores do DS onde aplicável |

Nenhum arquivo `.jsx` precisa ser criado, removido ou ter sua lógica alterada (ver "Inline styles verificados", acima, e a pergunta em aberto "d" para a única exceção candidata). `package.json` não muda — nenhuma dependência nova é necessária.

---

## O que será adicionado

1. Bloco de tokens `--ba-*` em `src/index.css`, copiado do "Bloco de tokens para colar" do artefato (cores de marca, cores de estado, fontes, raios, velocidade de transição).
2. Uso de `var(--ba-*)` em todas as regras de cor hoje fixas nos 19 arquivos CSS, incluindo valores `rgba(...)` (sombras e overlays, não só cores sólidas).
3. Tipografia de sistema do DS: `Georgia, "Times New Roman", serif` (peso 400, nunca negrito) para títulos (`h1`/`h2`/`h3` e classes equivalentes como `.titulo`, `.nomeEtapa` e `.logo`), `"Helvetica Neue", Helvetica, Arial, sans-serif` para corpo — substituindo a pilha atual (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`). Inclui remover o `font-weight: bold` de `.logo` (`Header.module.css:13-18`), que hoje já usa Georgia mas em negrito — contrariando a regra "serif leve, nunca negrito" do artefato.
4. Geometria do DS: botões em pílula (`border-radius: 999px`) para os botões primários hoje quadrados de `border-radius: 6px`/`8px` (`.btnPrimario`, `.btnGerar`, `.btnPerfil`, `.btnNovo`, `.btnEditar`); campos com `border-radius: 9px`; cards com `14px`/`16px`. A altura exata dos botões da BottomBar é tratada no Risco 7, abaixo (o `min-height: 54px` do artefato pode precisar de ajuste ali).
5. Anel de foco dourado de 3px (`box-shadow: 0 0 0 3px rgba(...)`) substituindo o `outline: 2px solid #c8a84b` atual nos campos, e `:focus-visible` com contorno de 3px/offset 4px nos elementos interativos que hoje não têm foco visível diferenciado.
6. Transições padronizadas em `.15s`–`.18s` (o app já usa `0.15s` em `StepPerguntasPorAmbiente.module.css:36`; padronizar os que não têm transição ou usam outro valor).
7. Bloco `@media (prefers-reduced-motion: reduce)` global, hoje inexistente no projeto.
8. Cores de estado (`--ba-ok`, `--ba-warn`, `--ba-danger`) substituindo o dourado usado hoje como status em `ScoreBadge.module.css` (nível MÉDIO) e nos dois blocos duplicados equivalentes em `StepRevisao.module.css`, nas quatro caixas de aviso/CC listadas acima, e na mensagem de falha de CEP (`StepIdentificacao.module.css:39-43`).
9. Cor de texto pequeno dourado sobre papel corrigida para `--ba-gold-text` (`#8a6608`, contraste 4,6:1) nos lugares em que hoje um tom próximo (`#7a6030`, `#b8860b`) já tenta resolver o mesmo problema de legibilidade sem ter sido validado.

---

## O que será removido

1. Todos os valores de cor escritos por extenso (hex/rgba) nos 19 arquivos CSS listados — substituídos por `var(--ba-*)`. Nenhuma cor é removida sem um token equivalente a receber seu papel.
2. A duplicação de mapeamento de classificação de risco (ALTO/MÉDIO/BAIXO) hoje escrita três vezes com valores repetidos (`ScoreBadge.module.css`, `.tituloAlto/Medio/Baixo` e `.cardAlto/Medio/Baixo` em `StepRevisao.module.css`) — as três passam a referenciar os mesmos três tokens de estado, eliminando o risco de um dia divergirem entre si.
3. A pilha de fontes de sistema genérica (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`) em `src/index.css`, substituída pela pilha do DS.
4. O `font-weight: bold` de `.logo` (`Header.module.css:13-18`) — o texto "By Arabi Planejados" passa a peso 400.

---

## O que NÃO será tocado

- `src/services/pdf.js` e `src/services/pdfVendedor.js` — fora de escopo **definitivamente**, agora e no futuro. O PDF continua com a paleta/fonte que usa hoje (ver `RELATORIO_FONTES_PDF.md`).
- `src/domain/` inteiro (`scoreEngine.js`, `ccBuilder.js`, `schema.js`, `schemaVendedor.js`, `ambientes.js`, `checklistTextos.js`, `gruposPerguntasVendedor.js`) — nenhuma regra de negócio, nome de gatilho, texto de CC ou cálculo de score muda.
- Estrutura de telas, número e ordem de etapas, rotas (`HashRouter`, todas as rotas de `src/App.jsx`), textos de perguntas, labels e mensagens de erro.
- `src/context/` (`FormContext.js`, `FormContextVendedor.js`, `FormProvider.jsx`, `FormProviderVendedor.jsx`) — estado e persistência em `localStorage`.
- `src/services/cep.js` — integração com ViaCEP.
- Qualquer arquivo `.jsx`, com a possível exceção pontual descrita na pergunta em aberto "d" (troca de um emoji, sujeita à sua confirmação).
- Logo em imagem — não existe no projeto; nada a adaptar.
- `package.json` — nenhuma dependência nova.
- Distinção de cor por nível de risco nas caixas de aviso/CC inline dos formulários — hoje um único visual (dourado) para todos os níveis; após a mudança, um único visual (`--ba-warn`) para todos os níveis. Diferenciar por nível exigiria levar o dado de "nível do gatilho" até cada componente de formulário, que é mudança de estrutura, fora de escopo.

---

## Premissas assumidas

1. O artefato `PRDS_E_SPECS/REFERENCIA_DESIGN_SYSTEM_BY_ARABI.html` é a fonte de verdade única; onde ele diverge da skill `byarabi-design`, o artefato prevalece (ver seção de divergência, acima).
2. "Papel é o padrão" (linha 857-862 do artefato): as telas do app nascem em modo claro (`--ba-paper` `#f5f0e6`), como o site institucional. O Header, que já é escuro hoje, é tratado como a variante "tinta" de destaque prevista pelo próprio DS — não como o padrão do app.
3. Os tokens de cor de estado (`--ba-ok`, `--ba-warn`, `--ba-danger`) usam sempre os valores "claro" da tabela do artefato (`#2f6b45`, `#9a5b1f`, `#a32f2b`), pois a Etapa 2 deste PRD não implementa modo escuro automático via `prefers-color-scheme` (ver pergunta em aberto "a", abaixo) — se a resposta a essa pergunta for "sim, implementar", os valores escuros equivalentes (`#5faa7c`, `#e2934a`, `#f0736d`) precisam ser adicionados também.
4. O dourado usado em estado "selecionado" de chip/botão (`.ativo`, `.chipAtivo`, `.opcaoAtiva`) é tratado como acento de interação (equivalente ao próprio botão/chip do site), não como status — continua dourado após a mudança.
5. As caixas de aviso/CC inline (quatro locais listados acima) recebem um único tratamento visual em `--ba-warn`, sem diferenciar por nível de risco (ver "O que NÃO será tocado"). A mensagem de falha de CEP em `StepIdentificacao` também usa `--ba-warn`, mas como texto solto, sem caixa — não é uma caixa de CC (ver seção própria acima).
6. Emojis usados hoje como indicador visual (🔴🟡🟢 no `ScoreBadge`, ✏️/📄/⚠️ em botões e avisos) são mantidos — são conteúdo, não CSS, e o artefato não define um padrão de ícone para substituí-los. Exceção candidata: o 🟡 do nível MÉDIO, tratado na pergunta em aberto "d".
7. A tipografia Georgia/Helvetica é aplicada via `font-family` nos seletores globais e nas classes de título (`.titulo`, `.nomeEtapa`, `.logo`, `h2`/`h3` onde existirem) — não é necessário nenhum arquivo de fonte, pois ambas são fontes de sistema, coerente com a regra "zero webfonts" do artefato. `.logo` também perde o `font-weight: bold` que tem hoje (ver item 3 de "O que será adicionado").
8. O botão primário do app (hoje fundo escuro `#1a1a1a` + texto dourado `#c8a84b`, ex.: `.btnGerar`, `.btnPerfil`, `.btnNovo`) passa a seguir o `.btn-primary` do DS (fundo dourado `#e3b838`, texto `#17140b`, pílula) — essa é a mudança visualmente mais perceptível da Etapa 2, prevista pelo próprio artefato ("o botão dourado é o mesmo nos dois fundos", linha 573-574).

---

## Riscos identificados

1. **Contraste do dourado profundo em texto pequeno.** O artefato mede que `#a77d0b` sobre papel dá 3,3:1 — passa só para título ≥24px ou ícone, reprova em texto corrido (linha 447). Vários lugares do app hoje usam dourado em texto pequeno (rótulos de aviso, badges). Mitigação: usar `--ba-gold-text` (`#8a6608`, 4,6:1) nesses casos, nunca `--ba-gold-deep` puro — já previsto no item 9 de "O que será adicionado".

2. **Botão primário muda de "escuro com texto dourado" para "dourado com texto escuro".** É uma mudança de aparência visível em praticamente toda tela (BottomBar, StepRevisao, SelecaoPerfil, StepSucesso) — não é um ajuste sutil de tom. Reduz risco de rejeição visual, mas deve ser conferida numa passada completa pelos dois fluxos antes de aprovar o Spec.

3. **Escala de etapas do Stepper não é resolvida por este PRD.** O próprio artefato marca isso como problema em aberto (linha 875-880): a marca tem um acento só e o Stepper do app precisa comunicar a etapa atual entre até 3 + N ambientes (Cliente) ou 2 + N (Vendedor). Hoje o Stepper (`Stepper.module.css`) não usa cor por etapa, só texto — o risco é baixo porque não há cor a redesenhar, mas fica registrado que a "escala de etapas" citada no DS não é um problema deste app hoje.

4. **`ScoreBadge` e os blocos duplicados de `StepRevisao` podem divergir de novo no futuro** se alguém editar um sem editar o outro. A tokenização reduz mas não elimina esse risco — os três ainda são blocos de CSS separados, só passam a apontar para os mesmos nomes de variável.

5. **`localStorage` de formulários em andamento não é afetado**, pois a mudança é só de CSS — mas vale confirmar visualmente que um rascunho salvo antes da mudança continua renderizando corretamente após o deploy (o estado não muda, só a aparência).

6. **Botão "Vendedor" some visualmente se ficar parecido demais com o botão secundário.** Como ele aparece em quase toda tela do fluxo Cliente (ver seção acima), reduzir demais seu destaque pode fazer o cliente deixar de notar essa via de ajuda. A escolha de tratá-lo como `.btn-outline` (ver pergunta em aberto "c") preserva um contorno dourado que o diferencia do secundário (cinza).

7. **Geometria de pílula do DS pode não caber nos três botões da BottomBar em 375px, e a barra pode ficar mais alta que o espaço reservado hoje.** `BottomBar.module.css:1-13` fixa a barra na base da tela. No fluxo Cliente ela mostra até três botões lado a lado — Voltar, Vendedor (`white-space: nowrap`) e Avançar —, hoje com `min-height: 44px` e padding entre `12px` e `20px` (`BottomBar.module.css:15-53`). A geometria de pílula do artefato (`min-height: 54px`, `padding: 0 24px`, `gap: 18px` entre rótulo e ícone — linha 572 do arquivo de referência) ocupa mais espaço horizontal e pode não caber nos três botões numa tela de 375px, além de aumentar a altura da barra. O espaço reservado sob o conteúdo de cada tela é um `<div className={styles.espacoBar}>` de altura fixa em `80px`, definido separadamente em sete arquivos — `StepPerguntasGlobais.module.css:161`, `StepPerguntasPorAmbiente.module.css:217`, `StepAmbientes.module.css:86`, `StepAmbientesVendedor.module.css:86`, `StepPerguntasAmbienteVendedor.module.css:123`, `StepIdentificacao.module.css:56` e `StepIdentificacaoVendedor.module.css:71`. Se a barra ficar mais alta que 80px, o último campo de cada formulário fica escondido atrás dela. **Mitigação:** ajustar a geometria dos botões dentro da barra (uma pílula com altura e padding menores que o padrão do artefato, ex.: `min-height: 48px`, `padding: 0 16px`, sem o `gap: 18px` completo) e os sete `.espacoBar` juntos, na mesma etapa — nunca um sem o outro. Ver verificação adicional em CA-03.

---

## Perguntas em aberto para o Everton

**(a) Modo escuro automático via `prefers-color-scheme` — entra ou fica só papel?**
O artefato já traz o bloco `@media (prefers-color-scheme:dark)` pronto (linhas 19-29 do arquivo de referência) trocando `--bg`, `--text`, `--card` etc. para a variante tinta. Implementar isso no app significaria que quem usa celular/navegador em modo escuro veria o Checklist Dinâmica inteiro em tinta automaticamente, sem nenhum controle manual do usuário.
**Minha recomendação:** não implementar agora. O artefato mesmo diz "papel é o padrão" para ferramentas internas; o modo escuro automático é um comportamento a mais para testar (contraste, ScoreBadge em fundo escuro, etc.) sem necessidade comprovada — dá para adicionar depois como melhoria isolada, sem retrabalho, porque os tokens já ficam prontos na Etapa 1.

**(b) Altura de campo — 48px do DS ou variante compacta para os formulários longos?**
`StepPerguntasPorAmbiente` e `StepPerguntasAmbienteVendedor` (vendedor) têm sequências longas de campos por ambiente. O DS mede 48px como confortável para poucos campos e cansativo para muitos (linha 729), mas não define o valor da variante compacta.
**Minha recomendação:** manter os 44px que a maioria dos campos já usa hoje (mudança mínima, já é o padrão predominante no app) em vez de subir para 48px — os 48px do artefato ficam reservados para telas com poucos campos (ex.: `StepIdentificacao`, que tem só nome/contrato/endereço).

**(c) Botão "Vendedor" da BottomBar — que hierarquia ele deve ter na nova paleta?**
Confirmado (ver seção "Botão Vendedor" acima): ele é ativo hoje em quase todo o fluxo Cliente, não é código morto. Visualmente já é um terceiro nível de botão (nem primário, nem secundário cinza) — preciso confirmar que papel ele deve ter na nova paleta.
**Minha recomendação:** tratá-lo como `.btn-outline` do DS (fundo transparente, borda `--ba-gold-deep`, texto `--ba-gold-deep`) — é visualmente o papel mais próximo do que ele já tenta ser hoje, e mantém distinção clara do botão primário (pílula dourada preenchida) e do secundário (contorno cinza neutro).

**(d) Emoji 🟡 ao lado de texto MÉDIO, agora terracota — trocar é um caractere em `.jsx`, o que esbarra em "nenhum `.jsx` muda".**
`ScoreBadge.jsx:5` e `StepRevisao.jsx:100` usam 🟡 para o nível MÉDIO. Com a cor desse nível passando de dourado/amarelo para terracota (`--ba-warn`), o emoji amarelo fica ao lado de uma cor que não é mais amarela — uma inconsistência pequena, mas real. Corrigi-la (ex.: 🟡 → 🟠) é uma troca de conteúdo dentro de um arquivo `.jsx`, algo que este PRD registrou como fora de escopo.
**Minha recomendação:** abrir uma exceção pontual e explícita para esses dois emojis — é a troca de um caractere dentro do próprio badge/título, que já são elementos visuais listados em escopo no Objetivo (badges), não uma mudança de texto, pergunta, rota ou regra de negócio. Se preferir manter a regra "zero `.jsx`" sem exceção nenhuma, a alternativa é aceitar o emoji amarelo ao lado do terracota como inconsistência residual documentada aqui, resolvida depois em um card à parte.

---

## Critérios de aceitação

Cada critério pode ser verificado por alguém não-técnico, sem ler código.

---

### CA-01 — Nenhuma cor fixa fora do arquivo de tokens, e nenhum token temporário

**Cenário:** Buscar por hex de cor (`#` seguido de 3 ou 6 dígitos) **e** por `rgba(`/`rgb(` em todos os arquivos `.css` de `src/`, excluindo `src/index.css`. Em seguida, abrir `src/index.css` e conferir a lista de tokens `--ba-*`.

**Esperado:** Zero resultados de hex e de `rgba`/`rgb` fora de `index.css` — toda cor e toda transparência usada em qualquer tela do app (incluindo sombras e overlays, como o `rgba(0, 0, 0, 0.55)` do fundo do diálogo de rascunho) está definida uma única vez em `src/index.css` e referenciada nos demais arquivos via `var(--ba-*)`. Dentro de `index.css`, nenhum token tem nome ou comentário indicando "antigo", "temp", "old" ou equivalente — todos os `--ba-*` batem com o "Bloco de tokens para colar" do artefato (mais as extensões de estado/legibilidade previstas nas premissas).

---

### CA-02 — O projeto compila

**Cenário:** Rodar `npm run build` após a mudança.

**Esperado:** O build termina sem erro, gerando a pasta `dist/` normalmente — igual ao comportamento de hoje.

---

### CA-03 — Fluxo Cliente, celular (~375px de largura)

**Cenário:** Abrir `npm run dev`, redimensionar a janela (ou usar as ferramentas de desenvolvedor do navegador) para ~375px de largura, e percorrer o fluxo Cliente do início (`SelecaoPerfil` → Identificação → Ambientes → Perguntas Gerais → pelo menos um ambiente → Revisão → Sucesso).

**Esperado:** Todas as telas usam fundo papel (`#f5f0e6`), títulos em Georgia sem negrito, botões em formato pílula com o dourado como cor de ação principal, campos com cantos arredondados e anel de foco dourado ao clicar. Nenhum texto corta ou sobrepõe outro elemento nessa largura. O header permanece escuro (tinta) no topo. O botão "Vendedor" continua visível e funcional, com um terceiro visual (contorno dourado), sem se confundir com o botão primário.

**Verificação adicional (Risco 7):** em pelo menos uma tela com os três botões da BottomBar (Voltar, Vendedor, Avançar), confirmar que os três cabem em uma única linha, sem cortar texto e sem quebrar para uma segunda linha; e que o último campo/elemento de cada formulário não fica escondido atrás da barra fixa ao rolar até o fim da página.

---

### CA-04 — Fluxo Vendedor, celular (~375px de largura)

**Cenário:** Mesma verificação do CA-03, mas para o fluxo Vendedor (`/vendedor/identificacao` em diante), incluindo pelo menos um ambiente de cada grupo (A, B ou C) e a tela de Revisão do Vendedor.

**Esperado:** Mesmo padrão visual do CA-03. A caixa de aviso "não substitui o Checklist do Cliente" aparece com a cor de aviso (terracota), não mais dourada. O botão "Vendedor" não aparece em nenhuma tela deste fluxo (comportamento já existente, sem mudança).

---

### CA-05 — Fluxo Cliente, desktop

**Cenário:** Repetir o percurso do CA-03 em largura de desktop (≥1200px).

**Esperado:** Layout não estica de forma estranha (os `max-width: 600px` das páginas de formulário continuam centralizados); nenhuma cor antiga (dourado `#c8a84b`, fundo `#f7f5f0`) aparece — só as cores do Design System.

---

### CA-06a — Card de CC "Risco Médio" não depende do score do ambiente

**Cenário:** Em uma Cozinha, responder "Existe granito ou pia existente no local?" = Sim e "Os móveis serão adaptados para este granito/pia?" = Não (`FormCozinha.jsx`, pergunta de granito). Isso ativa `GRANITO_RETIRAR` — em `scoreEngine.js:61`, com `pontos: 2`; em `ccBuilder.js:97-105`, um CC com `nivel: 'MÉDIO'`. Nenhum outro gatilho é ativado nesse ambiente.

**Esperado:** Na tela de Revisão, o card desse CC aparece na seção "🟡 Risco Médio" (`StepRevisao.jsx:98-108`, filtro `cc.nivel === 'MÉDIO'`), com a cor `.cardMedio` — que passa a ser `--ba-warn` em vez de dourado. Como o ambiente acumula só 2 pontos no total, o **badge de score** desse mesmo ambiente mostra **BAIXO** (`classificar(2, false)` em `scoreEngine.js:164-168` exige `pontos >= 4` para `'MÉDIO'`). Ver a nota "são dois mecanismos diferentes" na seção de contexto — isso é comportamento correto e já existente hoje, não uma regressão da mudança visual.

---

### CA-06b — Badge de score "MÉDIO" quando os pontos do ambiente somam 4 ou mais

**Cenário:** Na mesma Cozinha do CA-06a, além do granito a retirar (2 pontos), também responder de forma a ativar `TANQUE_RETIRAR`: "Existe tanque no local?" = Sim → "Qual o tipo de tanque?" = "Tanque tradicional (de porcelana ou plástico, apoiado no chão)" → "Haverá móveis na região do tanque?" = Sim (`FormCozinha.jsx:77,82-91,107`; condição `tanque === true && tanqueEmbutido === false && tanqueMoveis === true` em `scoreEngine.js:66-70`, `pontos: 2`). O ambiente agora acumula 4 pontos, todos com gatilho de nível `'Médio'` (nenhum `'Alto'`/`'AltoDireto'`), então `isAlto` permanece `false`.

**Esperado:** `classificar(4, false)` (`scoreEngine.js:165-166`) retorna `'MÉDIO'` — o `ScoreBadge` desse ambiente exibe **MÉDIO** na cor de aviso (`--ba-warn`), não mais em dourado/amarelo. Os dois CCs (granito e tanque) também aparecem na seção "Risco Médio" da Revisão, já que ambos têm `nivel: 'MÉDIO'` em `ccBuilder.js` (linhas 101 e 112) — neste cenário específico, badge e cards de CC coincidem no mesmo nível.

---

### CA-07 — Rascunho salvo antes da mudança continua funcionando

**Cenário:** Preencher parcialmente um formulário (Cliente ou Vendedor), fechar a aba sem finalizar (simula um rascunho salvo em `localStorage`), depois reabrir o app já com a mudança visual aplicada.

**Esperado:** O diálogo de retomada de rascunho aparece com a nova aparência (papel/dourado do DS) e, ao continuar, os dados preenchidos anteriormente aparecem corretamente nas telas — sem erro no console e sem campo em branco que deveria estar preenchido.

---

### CA-08 — PDF não muda

**Cenário:** Gerar o PDF (Cliente e Vendedor) depois da mudança visual aplicada no app.

**Esperado:** O PDF gerado é visualmente idêntico ao gerado antes da mudança — mesma fonte, mesmas cores, mesmo layout. Nenhuma diferença perceptível, porque `pdf.js`/`pdfVendedor.js` não foram tocados.

---

### CA-09 — Cenário de erro: build quebra por variável não definida

**Cenário:** Durante a Etapa 1 (tokenização), um arquivo `.css` referencia `var(--ba-xyz)` para um token que não foi definido em `:root`.

**Esperado:** O navegador não gera erro de build (CSS tolera variável não definida, o valor simplesmente não é aplicado), mas o elemento fica visualmente "quebrado" (sem cor de fundo ou texto). Esse é um erro a ser pego na conferência visual manual (CA-03/CA-04/CA-05), não pelo `npm run build`, que não falha nesse caso — por isso a inspeção visual dos dois fluxos é obrigatória, não opcional.

---

### CA-10 — Cenário de erro: dourado profundo usado fora de título/ícone

**Cenário:** Buscar, em todos os arquivos `.css` de `src/`, por `color: var(--ba-gold-deep)` (ou `color:var(--ba-gold-deep)`).

**Esperado:** Cada ocorrência encontrada está aplicada exclusivamente a um seletor de título grande ou ícone — `h1`, `h2`, `h3`, `.titulo`, `.nomeEtapa`, `.logo`, ou um ícone equivalente (lista definitiva a fechar no Spec). Nenhuma ocorrência está aplicada a texto de corpo, rótulo pequeno, badge, aviso ou qualquer classe cujo texto renderizado tenha menos de 24px. Se alguma ocorrência for encontrada fora dessa lista, é defeito — deve usar `--ba-gold-text` no lugar.

---

**Cenário de erro adicional — `.espacoBar` desatualizado após mudar a altura da BottomBar**

**Cenário:** A geometria dos botões da BottomBar é ajustada (Risco 7) mas um dos sete arquivos com `.espacoBar { height: 80px; }` é esquecido.

**Esperado:** Na tela correspondente a esse arquivo esquecido, o último campo ou botão do formulário fica parcial ou totalmente coberto pela barra fixa ao rolar até o fim — visível na verificação adicional do CA-03. Isso é tratado como defeito de implementação, não como variação aceitável entre telas.
