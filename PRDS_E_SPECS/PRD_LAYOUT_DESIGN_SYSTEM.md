# PRD — Atualização Visual: Design System By Arabi

**Status:** Aprovado pelo Everton em 2026-11-06 (incluindo as decisões de (a) a (f) registradas na seção "Decisões tomadas"). Próximo passo: gerar o Spec, somente quando o Everton pedir.
**Data:** 2026-09-23 (versão original, commit 4a2faf3) — **revisado em 2026-11-06 contra o commit HEAD c121b53**
**Projeto:** Checklist Dinâmica — By Arabi Planejados

---

## Revisão de 2026-11-06 (o que mudou desde a versão original)

Entre o commit do PRD (4a2faf3, 2026-09-24) e o HEAD (c121b53, 2026-10-23) entraram três entregas que mexem em telas e arquivos de CSS: **Importar PDF** (commit be265ff), **Projetista com Venda futura** (commit f73f2f1) e a **suíte de testes em `testes/`** (commits 5cac7d0 a efcf945 e c121b53). Nenhum CSS existente foi alterado nesse intervalo, exceto `SelecaoPerfil.module.css` (+53 linhas); foi criado um CSS novo, `EscolhaProjetista.module.css` (sem nenhuma cor). Verificado com `git diff 4a2faf3..HEAD -- '*.css'`.

Mudanças feitas neste documento nesta revisão (o que continuava correto não foi alterado):

1. Contagem de cores atualizada (183 → 191 linhas) e método de contagem fixado; tabela de arquivos corrigida (`SelecaoPerfil.module.css` de 5 para 13).
2. Números de arquivos explicitados (19 com cor, 20 no total).
3. Linhas de `StepIdentificacao.jsx` corrigidas (o commit be265ff as deslocou em 5 linhas).
4. Removida a frase "não há suíte de testes"; `npm test` passou a ser critério de aceitação (CA-16).
5. Lista de telas onde o botão "Vendedor" da BottomBar é desligado completada.
6. Referência de `transition` corrigida (o único do projeto está em `StepPerguntasGlobais.module.css:36`).
7. Novas telas e fluxos incorporados: `/projetista`, Venda futura (`/futura/*`) e Importar PDF (botão e dois modais). Novos critérios CA-11 a CA-16, novas decisões (e) e (f), novos riscos 8 e 9.
8. "O que NÃO será tocado" ampliado (`pdfFutura.js`, `importacaoPdf.js`, `FormProviderFutura.jsx`, `testes/`, contrato do formato V1).
9. Caminho de acesso ao fluxo Vendedor atualizado nos CA-03 e CA-04 (Projetista → `/projetista` → "Normal").
10. **Aprovação e decisões (2026-11-06):** o Everton aprovou todas as recomendações das antigas perguntas em aberto. A seção "Perguntas em aberto" virou "Decisões tomadas". Consequências: exceção aprovada de um caractere em dois `.jsx` (🟡 → 🟠), `EscolhaProjetista.module.css` passou a ser arquivo afetado, hierarquia do "Importar PDF" e dos botões dos modais fechada, e novo critério CA-17 (emoji 🟠).

---

## Objetivo

Substituir a paleta de cores, tipografia e geometria de componentes do app (hoje um tema dourado/preto criado sem referência formal) pela identidade visual medida em `PRDS_E_SPECS/REFERENCIA_DESIGN_SYSTEM_BY_ARABI.html` — o "Design System By Arabi", extraído do CSS de produção de byarabiplanejados.com.br.

A mudança é **exclusivamente visual**: cores, tipografia, botões, campos, cards, header, stepper, bottom bar, modal e badges, em todas as telas hoje existentes (Cliente, Projetista/Vendedor, escolha do Projetista, Venda futura e tela inicial com Importar PDF). Nenhuma tela, rota, pergunta, texto, regra de score/CC ou o PDF são alterados. **Única exceção aprovada fora de CSS (decisão d):** a troca de um emoji, 🟡 por 🟠, em `ScoreBadge.jsx:5` e `StepRevisao.jsx:100` — um caractere em cada arquivo, sem mudar texto, rota ou regra.

O próprio Design System registra esta escolha explicitamente (arquivo de referência, linhas 884-888): *"Checklist Dinâmica prevê a skill em PRD e Spec e ainda não foi estilizada — é o candidato natural para estrear o sistema sem retrabalho."*

---

## Fonte da verdade e uma divergência a registrar

A fonte da verdade visual é **exclusivamente** `PRDS_E_SPECS/REFERENCIA_DESIGN_SYSTEM_BY_ARABI.html`. O arquivo foi lido por completo (902 linhas; a única parte não lida foram duas linhas de dado base64 de uma imagem de logo — linhas 826 e 830 —, irrelevantes para o texto). O arquivo não mudou desde a versão original deste PRD (último commit: 4a2faf3).

**Divergência registrada:** a skill `byarabi-design` (`C:\Users\Windows 10\.claude\skills\byarabi-design\SKILL.md`, existência confirmada em 2026-11-06) **não foi usada como referência** porque está desatualizada e contradiz o artefato — tema escuro como padrão, dourado `#D4A830` (o artefato usa `#e3b838`/`#a77d0b`), e fontes via Google Fonts (Cormorant/DM Sans), enquanto o artefato exige zero webfonts (Georgia + Helvetica Neue/Arial, ambas de sistema). O próprio artefato confirma isso na seção "O que já foi decidido" (linha 866-871): a skill antiga tinha valores que "não batiam com o site" e contraste ilegível (1,84:1). Onde houver conflito entre a skill e o artefato, **o artefato prevalece**.

---

## Contexto — estado atual medido no repositório

### Volume e ausência de tokens

**Método de contagem (fixado nesta revisão):** contagem **por linha** de cor fixa, com o comando `grep -rEn '#[0-9a-fA-F]{3,8}\b|rgba?\(' src --include=*.css` (hex de 3 a 8 dígitos e `rgb(`/`rgba(`). Uma linha com duas cores conta uma vez. Esse é o mesmo método da primeira versão do PRD (reproduz exatamente os 183 do commit 4a2faf3). Contando cada cor individualmente (`grep -o`), o HEAD teria 197; o número de referência deste PRD é o **por linha**. Commit de referência da medição: **c121b53**.

**Resultado em c121b53: 191 linhas com cor fixa, em 19 arquivos.** Existem 20 arquivos `.css` em `src/`; o vigésimo, `src/screens/EscolhaProjetista/EscolhaProjetista.module.css` (criado no commit f73f2f1), tem **zero** cores e não entra na tabela. Na versão original (4a2faf3) eram 183 linhas em 19 arquivos; a diferença de 8 vem inteira de `SelecaoPerfil.module.css` (de 5 para 13 linhas, por causa de `.btnImportar`, `.btnModal` e `.btnModalSecundario`, `SelecaoPerfil.module.css:49-89`, commit be265ff).

Busca por `var(--` no mesmo escopo: **zero ocorrências** — o projeto não usa nenhuma variável CSS hoje, cada cor é escrita por extenso em cada arquivo.

Os 19 arquivos com cor são:

| Arquivo | Linhas com cor fixa |
|---|---|
| `src/index.css` | 9 |
| `src/components/BottomBar/BottomBar.module.css` | 9 |
| `src/components/FieldGroup/FieldGroup.module.css` | 4 |
| `src/components/Header/Header.module.css` | 3 |
| `src/components/Modal/Modal.module.css` | 3 |
| `src/components/ScoreBadge/ScoreBadge.module.css` | 3 |
| `src/components/Stepper/Stepper.module.css` | 4 |
| `src/screens/SelecaoPerfil/SelecaoPerfil.module.css` | **13** (eram 5 na versão original) |
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
| **Total** | **191** |

Paleta atual aproximada (repetida por extenso em vários arquivos, sem um único ponto de definição): `#c8a84b` (dourado principal), `#1a1a1a` (fundo escuro do header/botões), `#f7f5f0`/`#f5f0e8` (fundos claros), `#e0d8c8` (bordas de card), `#7a6030`/`#7a4f00`/`#b8860b` (variações de dourado escuro para texto), `#fff8e6`/`#fff8e1` (fundo de destaque dourado claro), `#c0392b` (erro/vermelho), `#1b5e20` (verde). Os blocos novos de `SelecaoPerfil.module.css` repetem essa mesma paleta (`#1a1a1a`, `#c8a84b`, `#000` no hover) e acrescentam um `rgba(200, 168, 75, 0.15)` no hover do `.btnImportar` (`SelecaoPerfil.module.css:64-66`). Nenhuma dessas cores é a do Design System — não há sobreposição, exatamente como a tabela "A distância entre o que existe e o alvo" do artefato descreve para o site institucional antigo (arquivo de referência, linhas 785-801).

`src/index.css` (arquivo global, sem CSS Module) define hoje: `body` com fonte de sistema `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto` e fundo `#f7f5f0` (linhas 9-15); e o diálogo de retomada de rascunho (`.rascunho-dialog`, `.rascunho-card`, `.rascunho-acoes`, `.btn-secundario` — linhas 26-79), com cores próprias (`#fff`, `#1a1a1a`, `#c8a84b`, `#555`, `#ccc`) e um overlay em `rgba(0, 0, 0, 0.55)` (`.rascunho-dialog`, linha 30). Essas classes são usadas em `src/context/FormProvider.jsx:341-347` e `src/context/FormProviderVendedor.jsx:235-241`. A Venda futura **não** tem diálogo de rascunho (`FormProviderFutura.jsx:4`: "estado só em memória, sem localStorage e sem diálogo de rascunho").

### Inline styles verificados — sem impacto de cor

Os três arquivos `.jsx` com `style={{...}}` foram lidos (re-verificado em c121b53). Nenhum carrega cor:

- `src/steps/StepIdentificacao/StepIdentificacao.jsx:191` — `style={{ maxWidth: 80 }}` (layout de um campo). *(Era a linha 186 na versão original; o commit be265ff deslocou o arquivo em 5 linhas.)*
- `src/steps/StepPerguntasPorAmbiente/StepPerguntasPorAmbiente.jsx:29` — `style={{ padding: 16 }}` (mensagem "Ambiente não encontrado.").
- `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.jsx:46` — mesmo padrão, mesma mensagem.

Conclusão: **os inline styles não exigem mexer em nenhum `.jsx`**, e a mudança de cor fica contida nos 19 arquivos `.css`/`.module.css` com cor listados acima, mais `EscolhaProjetista.module.css` (decisão f, que passa a receber regras com `var(--ba-*)`; total de 20 CSS afetados). Os componentes React já leem classes de CSS Module; ajustar os valores dentro dessas classes não exige tocar em nenhum componente. **Única exceção aprovada (decisão d):** dois arquivos `.jsx` recebem a troca de um caractere, o emoji 🟡 por 🟠 — `src/components/ScoreBadge/ScoreBadge.jsx:5` e `src/steps/StepRevisao/StepRevisao.jsx:100`. Fora isso, nenhum `.jsx` muda.

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

`StepIdentificacao.module.css:39-43` (`color: #b8860b`, sem fundo nem borda) foi retirado da tabela acima porque não é gerado por nenhum gatilho de risco de `domain/`. O elemento que usa essa classe é o estado `cepMsg`, renderizado em `StepIdentificacao.jsx:182` (`{cepMsg && <span className={styles.aviso}>{cepMsg}</span>}`), preenchido em dois cenários de falha da busca automática de CEP (função `handleCepBlur`, `StepIdentificacao.jsx:75-92`):

- CEP não encontrado (`StepIdentificacao.jsx:84`): "CEP não encontrado — você pode preencher o endereço manualmente."
- Erro na consulta (`StepIdentificacao.jsx:89`): "Não foi possível consultar o CEP agora — preencha o endereço manualmente."

*(Linhas corrigidas na revisão de 2026-11-06: na versão original constavam 177, 69-86, 79 e 84; o commit be265ff deslocou o arquivo em 5 linhas ao acrescentar props à assinatura do componente.)* Essa mesma tela de identificação é reaproveitada pela Venda futura (`App.jsx:184-194`), então a mensagem também aparece lá.

Continua recebendo `--ba-warn`, por ser também um aviso operacional — mas como texto solto de `0.82rem`, sem caixa (fundo/borda), diferente das quatro caixas de CC listadas acima. Contraste verificado: o artefato mede `--warn` (`#9a5b1f`) sobre papel em **4,8:1** (linha 709 do arquivo de referência, "Pendência — `#9a5b1f` claro... 4,8:1"), acima do mínimo de 4,5:1 exigido pelo WCAG AA para texto normal — passa sem precisar do ajuste de legibilidade que o dourado precisou (`--ba-gold-text`).

### Logo — risco do DS não se aplica

O Design System alerta que só existe versão do logo (PNG) para fundo escuro (linhas 812-839). Verificado: **nenhum componente do app carrega imagem de logo**. `src/components/Header/Header.jsx:6` renderiza apenas o texto `"By Arabi Planejados"`, estilizado via CSS (`Header.module.css:13-18`, fonte Georgia). Não há arquivo `.png`/`.svg` de logo no repositório. Risco descartado — não há PNG para adaptar. O `Header` também é o cabeçalho das telas novas (`EscolhaProjetista.jsx:10`, `App.jsx` `AppLayoutFutura`).

`Header.module.css:1-3` já usa fundo escuro `#1a1a1a` com texto dourado `#c8a84b` — isto já é estruturalmente a "faixa tinta" do artefato; a troca é de valores de token, não de abordagem. Um segundo ponto encontrado na mesma classe: `Header.module.css:13-18` (`.logo`) já usa `font-family: Georgia, serif`, mas com `font-weight: bold` — o que viola a regra do próprio artefato "serif leve, nunca negrito" (linhas 261-266: "Todo título é `Georgia, serif` com `font-weight: 400`... Título em bold quebra a marca imediatamente"). Ver item 3 de "O que será adicionado".

### O que os fluxos compartilham de CSS (atualizado na revisão de 2026-11-06)

Confirmado por leitura de imports: os arquivos `Bloco*.jsx` (`StepPerguntasGlobais/`) e `Form*.jsx` (`StepPerguntasPorAmbiente/` e `vendedor/StepPerguntasAmbienteVendedor/`) não têm CSS próprio — todos importam o `.module.css` do respectivo Step "pai" (`StepPerguntasGlobais.module.css`, `StepPerguntasPorAmbiente.module.css`, `StepPerguntasAmbienteVendedor.module.css`). Ou seja, editar esses três arquivos já cobre todos os formulários de ambiente e perguntas gerais dos dois perfis — não existem arquivos CSS extras "escondidos" por trás de cada formulário específico.

**Novo — a Venda futura reaproveita CSS do Vendedor e do Cliente.** A premissa "cada perfil tem seu próprio CSS" (CLAUDE.md, seção "Dois fluxos independentes") **deixou de valer para o CSS** depois do commit f73f2f1:

- `src/steps/futura/StepRevisaoFutura/StepRevisaoFutura.jsx:6` importa `vendedor/StepRevisaoVendedor/StepRevisaoVendedor.module.css` (usa `.pagina`, `.titulo`, `.secao`, `.linhaResumo`, `.erroPdf` e `.espacoBar`; **não** usa `.avisoChecklist`).
- `src/steps/futura/StepSucessoFutura/StepSucessoFutura.jsx:3` importa `vendedor/StepSucessoVendedor/StepSucessoVendedor.module.css` (usa `.pagina`, `.icone`, `.titulo`, `.texto`, `.btnNovo`).
- A identificação da Venda futura é o próprio `StepIdentificacao` do Cliente, com props (`App.jsx:184-194`, rotas `rotaAvancar`, `rotaRevisao`, `rotaVoltar`, `mostrarBotaoVendedor={false}`), logo usa `StepIdentificacao.module.css`.
- `EscolhaProjetista.jsx:3` importa `SelecaoPerfil.module.css` (usa `.pagina`, `.titulo`, `.subtitulo`, `.botoes`, `.btnPerfil`) além do próprio `EscolhaProjetista.module.css` (`.opcao`, `.apoio`, `.voltar`).

Consequência prática: editar `StepRevisaoVendedor.module.css`, `StepSucessoVendedor.module.css`, `StepIdentificacao.module.css` ou `SelecaoPerfil.module.css` altera também a Venda futura e a tela `/projetista`, sem aviso. Isso é desejável aqui (as telas ficam coerentes), mas obriga a conferir esses fluxos (CA-11 e CA-12).

### Campos de formulário — altura hoje

O Design System propõe campo com `height: 48px` (linha 592, "Campo de formulário"). Medido no app: os campos variam entre `min-height: 40px` (ex.: `StepAmbientes.module.css:76`) e `44px` (maioria: `StepIdentificacao.module.css:25`, `StepPerguntasGlobais.module.css:35`, `StepPerguntasPorAmbiente.module.css:151`, `StepIdentificacaoVendedor.module.css:25`, `StepPerguntasAmbienteVendedor.module.css:59-67`). O próprio artefato já sinaliza esse ponto como não resolvido (linha 729): *"O campo de 48px é confortável para 4 campos, cansativo para 40."* — relevante aqui porque `StepPerguntasPorAmbiente` e `StepPerguntasAmbienteVendedor` têm dezenas de campos em sequência. Decisão (b), abaixo: manter 44px nos formulários longos.

### Botão "Vendedor" na BottomBar — ativo hoje, em quase todo o fluxo Cliente

`src/components/BottomBar/BottomBar.jsx:8` define `mostrarBotaoVendedor = true` como valor padrão. Ele só é explicitamente desligado (`mostrarBotaoVendedor={false}`) nas seguintes telas:

- as quatro telas do fluxo Vendedor: `StepAmbientesVendedor.jsx:80`, `StepIdentificacaoVendedor.jsx:121`, `StepPerguntasAmbienteVendedor.jsx:100`, `StepRevisaoVendedor.jsx:121`;
- **(novo)** a revisão da Venda futura, `StepRevisaoFutura.jsx:61`;
- **(novo)** a identificação da Venda futura, que reaproveita `StepIdentificacao` e recebe `mostrarBotaoVendedor={false}` por prop (`App.jsx:191`; a prop existe em `StepIdentificacao.jsx:53` e é repassada em `:210`).

Ou seja, este botão aparece hoje em **todas as telas do fluxo Cliente** que usam `BottomBar` (a Revisão do Cliente não usa `BottomBar`) — não é código morto: ao clicar, abre um `Modal` orientando o cliente a consultar o vendedor projetista para tirar a dúvida daquela pergunta (texto em `BottomBar.jsx:40-44`). Visualmente já é um terceiro nível de botão, distinto do primário e do secundário (`.btnVendedor` em `BottomBar.module.css:43-53`: fundo `#f5f0e8`, borda e texto dourado `#c8a84b`/`#7a6030`). Decisão (c), abaixo: tratar como `.btn-outline` do DS.

### Barra inferior fixa — geometria de pílula pode não caber em 375px

`BottomBar.module.css:1-13` (`.bar`) é fixa na base da tela (`position: fixed; bottom: 0`). No fluxo Cliente ela mostra até três botões lado a lado — Voltar, Vendedor (`white-space: nowrap`) e Avançar —, hoje com `min-height: 44px` e padding entre `12px` e `20px` (`.btnPrimario` `BottomBar.module.css:15-25`, `.btnSecundario` `:32-41`, `.btnVendedor` `:43-53`). A geometria de botão em pílula do artefato (`min-height: 54px`, `padding: 0 24px`, `gap: 18px` entre rótulo e ícone — linha 572 do arquivo de referência) ocupa mais espaço horizontal e aumenta a altura da barra. Ver Risco 7 e CA-03, abaixo.

### Telas e funções entregues depois da versão original deste PRD (incluídas na revisão de 2026-11-06)

**Tela inicial `SelecaoPerfil` — botão "Importar PDF" e dois modais (commit be265ff).** `SelecaoPerfil.jsx:85-87` ganhou o botão "Importar PDF" (classe `.btnImportar`, `SelecaoPerfil.module.css:49-66`: contorno `2px solid #c8a84b`, fundo transparente, texto `#1a1a1a`, `border-radius: 8px`, `min-height: 48px`, hover com `rgba(200, 168, 75, 0.15)`), um `<input type="file">` escondido (`.inputArquivo`, `:68`) e dois `Modal` (`SelecaoPerfil.jsx:97-110`):

- erro: texto "PDF não possui dados para importação" (`:98`), botão "Fechar" (`.btnModal`, `SelecaoPerfil.module.css:73-87`: fundo `#1a1a1a`, texto `#c8a84b`, `border-radius: 8px`, `min-height: 48px`);
- confirmação: texto "Já existe um preenchimento em andamento. Importar este PDF vai substituí-lo. Deseja continuar?" (`:105`), botões "Sim, importar" (`.btnModal`) e "Cancelar" (`.btnModalSecundario`, `:89-99`: contorno `2px solid #c8a84b`, fundo transparente).

O erro aparece também quando o arquivo passa de 20 MB (`SelecaoPerfil.jsx:10` `LIMITE_BYTES`, uso em `:42`) ou quando o PDF não tem os dados V1. O `Modal` só fornece a caixa (`Modal.module.css`: overlay `rgba(0, 0, 0, 0.55)`, caixa branca; `.caixa button { width: 100% }`, linhas 26-29 do arquivo, o que faz os botões dos modais ocuparem a largura inteira). Importação com sucesso: grava o rascunho do Cliente e navega para `/revisao` com `state.importado`; o `FormProvider` restaura **sem exibir** o diálogo de retomada (`FormProvider.jsx`, `importando`/`restaurar`, commit be265ff). Decisão (e) define a hierarquia desses botões; ver CA-13 a CA-15.

**Escolha do Projetista — `/projetista` (commit f73f2f1).** `SelecaoPerfil.jsx:80` agora leva o botão "Projetista" para `/projetista` (antes ia direto a `/vendedor/identificacao`). `src/screens/EscolhaProjetista/EscolhaProjetista.jsx` mostra dois botões `.btnPerfil` ("Normal", que navega para `/vendedor/identificacao` em `:17`, e "Venda futura", que navega para `/futura/identificacao` em `:23`), uma legenda por botão (`.apoio`) e um link "← Voltar" (`EscolhaProjetista.jsx:29`, classe `.voltar`). O CSS próprio (`EscolhaProjetista.module.css`, 16 linhas) tem só layout: **sem cor, sem fonte, sem transição**. Portanto o link "← Voltar" fica com a aparência padrão do navegador (link azul/roxo sublinhado) e a legenda `.apoio` herda a cor do `body`. Decisão (f): estilizar o link e a legenda (ver "Decisões tomadas" e CA-12).

**Venda futura — `/futura/identificacao`, `/futura/revisao`, `/futura/sucesso` (commit f73f2f1).** Cabeçalho sem `Stepper` (`App.jsx:135-148`, `AppLayoutFutura` só renderiza `Header` e `Outlet`), provider próprio em memória (`FormProviderFutura.jsx`), PDF próprio (`services/pdfFutura.js`). As três telas reaproveitam CSS de outros fluxos (ver seção "O que os fluxos compartilham de CSS", acima). A revisão usa `BottomBar` com dois botões (rótulos "Editar identificação" e "Gerar PDF", `StepRevisaoFutura.jsx:55-62`) e o espaço reservado `.espacoBar` de 20px de `StepRevisaoVendedor.module.css:55`.

**Testes automatizados — pasta `testes/` (commits 5cac7d0 a efcf945 e c121b53).** Existem oito arquivos de teste (`A_ambientes`, `C_ccs`, `F_validacao`, `I_importacao_pdf`, `P_pdf_cliente`, `Q_pdf_futura`, `S_score`, `V_pdf_projetista`, todos `.test.js`) mais auxiliares, executados por `npm test` (`package.json:10`, `node --test`). Verificado com busca por `.css`, `styles.`, `ScoreBadge`, `classificar` e `🟡` dentro de `testes/`: **nenhum teste toca CSS, classes de estilo, o badge ou o emoji**. Uma mudança só de CSS não deve quebrá-los, mas `CLAUDE.md` exige `npm test` verde (sem testes pulados) antes de qualquer commit ou merge que altere `src/` — o que inclui esta melhoria (ver CA-16).

---

## Relação com os comandos/scripts existentes

Nenhum comando muda. A validação é, por ordem: `npm test` (suíte de regressão em `testes/`, `package.json:10`), `npm run build` (garante que compila) e navegação manual via `npm run dev`. A suíte automatizada **não cobre aparência** (ver acima), portanto a conferência visual dos fluxos continua obrigatória; ela serve para garantir que a mudança de CSS não quebrou nada de lógica, PDF ou importação por acidente. O projeto não usa pré-processador de CSS (Sass/Less) nem CSS-in-JS — é CSS puro via CSS Modules do Vite, o que é compatível de forma direta com variáveis CSS nativas (`:root { --token: valor }` + `var(--token)`), sem adicionar nenhuma dependência nova.

---

## Abordagem em duas etapas

**Etapa 1 — Tokenizar.** Criar em `src/index.css` o bloco `:root { --ba-*: ... }` já com os **nomes finais** do artefato (seção "Bloco de tokens para colar", linhas 738-771), e trocar, um a um, os 191 valores fixos (contados por linha, ver método acima) — hex **e** `rgba(...)` — nos 19 arquivos por `var(--ba-*)` correspondente. Não se criam nomes de token temporários (como `--ba-gold-antigo`): cada cor hoje existente é mapeada direto para o token do artefato cujo papel mais se aproxima (ex.: o `#1a1a1a` do header aponta para `--ba-ink`, o `#c8a84b` aponta para `--ba-gold`). Nesta etapa o **valor** de cada token continua sendo o de hoje sempre que possível — só a Etapa 2 troca o valor pelo hex definitivo do artefato. **Nenhuma mudança visual intencional nesta etapa** — é indexação, não redesenho.

**Etapa 2 — Aplicar o visual do Design System.** Com os tokens já centralizados, trocar os *valores* das variáveis de `--ba-*` pelos do artefato (dourado, tinta, papel, tipografia, geometria) e ajustar as regras que dependem de valor fixo fora de cor (`border-radius`, `min-height`, `transition`, `font-family`). **Ao final desta etapa, `src/index.css` não contém nenhum token com nome ou valor "antigo"/temporário** — todos os `--ba-*` correspondem exatamente ao "Bloco de tokens para colar" do artefato, mais os tokens de estado/legibilidade explicitados nas premissas deste PRD (`--ba-gold-text`, `--ba-muted-aa`, `--ba-ok`, `--ba-warn`, `--ba-danger`, já previstos no próprio bloco do artefato).

**Por quê nessa ordem:** depois da Etapa 1, mudar qualquer coisa do tema (por exemplo, se a By Arabi trocar o tom de dourado no futuro) é editar um único arquivo (`index.css`). Sem a Etapa 1, seria necessário caçar a mesma cor em até 19 arquivos diferentes — o que é exatamente o problema medido hoje (múltiplos hex de dourado ligeiramente diferentes espalhados pelo código, ex.: `#c8a84b` vs `#b8860b` vs `#7a6030` fazendo o mesmo papel em arquivos diferentes).

---

## Arquivos afetados

| Arquivo | Tipo de mudança |
|---|---|
| `src/index.css` | Adiciona o bloco `:root { --ba-*: ... }`; body passa a usar `--ba-font-body` e `--ba-paper`; diálogo de rascunho tokenizado (incluindo o overlay `rgba`) |
| Os demais 18 arquivos com cor (`.css`/`.module.css`) listados na tabela da seção "Estado atual medido", **incluindo `SelecaoPerfil.module.css` com seus 13 pontos de cor** (`.btnPerfil`, `.btnImportar`, `.btnModal`, `.btnModalSecundario`) | Cada valor de cor fixo (hex ou `rgba`) passa a referenciar um `var(--ba-*)`; geometria (raio, altura mínima, transição) e tipografia de título ajustadas para os valores do DS onde aplicável |
| `src/screens/EscolhaProjetista/EscolhaProjetista.module.css` | **Aprovado (decisão f):** hoje sem cor, passa a ter regras para o link "← Voltar" (`.voltar`) e a legenda (`.apoio`) com cor e tipografia via `var(--ba-*)` (link em `--ba-gold-text`, legenda em cor de texto secundário legível) e foco visível por teclado. Nenhum hex novo |
| `src/components/ScoreBadge/ScoreBadge.jsx` | **Exceção aprovada (decisão d):** troca do caractere 🟡 por 🟠 na linha 5 (nível MÉDIO). Nada mais no arquivo |
| `src/steps/StepRevisao/StepRevisao.jsx` | **Exceção aprovada (decisão d):** troca do caractere 🟡 por 🟠 na linha 100 (título "Risco Médio"). Nada mais no arquivo |

Nenhum arquivo `.jsx` precisa ser criado ou removido, e nenhuma lógica de `.jsx` é alterada; as únicas edições em `.jsx` são as duas trocas de emoji acima (decisão d). Ver "Inline styles verificados", acima. `package.json` não muda — nenhuma dependência nova é necessária.

---

## O que será adicionado

1. Bloco de tokens `--ba-*` em `src/index.css`, copiado do "Bloco de tokens para colar" do artefato (cores de marca, cores de estado, fontes, raios, velocidade de transição).
2. Uso de `var(--ba-*)` em todas as regras de cor hoje fixas nos 19 arquivos CSS, incluindo valores `rgba(...)` (sombras e overlays, não só cores sólidas).
3. Tipografia de sistema do DS: `Georgia, "Times New Roman", serif` (peso 400, nunca negrito) para títulos (`h1`/`h2`/`h3` e classes equivalentes como `.titulo`, `.nomeEtapa` e `.logo`), `"Helvetica Neue", Helvetica, Arial, sans-serif` para corpo — substituindo a pilha atual (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`). Inclui remover o `font-weight: bold` de `.logo` (`Header.module.css:13-18`), que hoje já usa Georgia mas em negrito — contrariando a regra "serif leve, nunca negrito" do artefato.
4. Geometria do DS: botões em pílula (`border-radius: 999px`) para os botões primários hoje quadrados de `border-radius: 6px`/`8px` (`.btnPrimario`, `.btnGerar`, `.btnPerfil`, `.btnNovo`, `.btnEditar`); campos com `border-radius: 9px`; cards com `14px`/`16px`. A altura exata dos botões da BottomBar é tratada no Risco 7, abaixo (o `min-height: 54px` do artefato pode precisar de ajuste ali). Os botões novos da tela inicial (`.btnImportar`, `.btnModal`, `.btnModalSecundario`) também entram, com a hierarquia fechada na decisão (e): "Importar PDF" como `.btn-outline`, `.btnModal` como primário (pílula dourada) e `.btnModalSecundario` como contorno neutro.
5. Anel de foco dourado de 3px (`box-shadow: 0 0 0 3px rgba(...)`) substituindo o `outline: 2px solid #c8a84b` atual nos campos, e `:focus-visible` com contorno de 3px/offset 4px nos elementos interativos que hoje não têm foco visível diferenciado.
6. Transições padronizadas em `.15s`–`.18s`. **Correção da revisão de 2026-11-06:** o app hoje tem uma única declaração de `transition` em todo `src/`, em `src/steps/StepPerguntasGlobais/StepPerguntasGlobais.module.css:36` (`transition: all 0.15s`) — verificado por busca em todos os `.css`. A versão original citava, por engano, `StepPerguntasPorAmbiente.module.css:36`, que não tem transição. Os demais botões e campos não têm transição e passam a receber a padronizada.
7. Bloco `@media (prefers-reduced-motion: reduce)` global, hoje inexistente no projeto.
8. Cores de estado (`--ba-ok`, `--ba-warn`, `--ba-danger`) substituindo o dourado usado hoje como status em `ScoreBadge.module.css` (nível MÉDIO) e nos dois blocos duplicados equivalentes em `StepRevisao.module.css`, nas quatro caixas de aviso/CC listadas acima, e na mensagem de falha de CEP (`StepIdentificacao.module.css:39-43`).
9. Cor de texto pequeno dourado sobre papel corrigida para `--ba-gold-text` (`#8a6608`, contraste 4,6:1) nos lugares em que hoje um tom próximo (`#7a6030`, `#b8860b`) já tenta resolver o mesmo problema de legibilidade sem ter sido validado.
10. **(decisão d)** Troca do emoji 🟡 por 🟠 no nível MÉDIO: `ScoreBadge.jsx:5` e `StepRevisao.jsx:100` (um caractere em cada arquivo).
11. **(decisão b)** Altura de campo: manter `min-height: 44px` nos formulários longos (`StepPerguntasPorAmbiente`, `StepPerguntasAmbienteVendedor`, `StepPerguntasGlobais`) e usar 48px apenas em telas com poucos campos, como `StepIdentificacao` (e `StepIdentificacaoVendedor`, que tem a mesma estrutura). Os campos hoje com 40px ou 36px são ajustados caso a caso no Spec.
12. **(decisão f)** Regras de cor, tipografia e foco visível em `EscolhaProjetista.module.css` para `.voltar` e `.apoio`, usando apenas tokens `var(--ba-*)`.

---

## O que será removido

1. Todos os valores de cor escritos por extenso (hex/rgba) nos 19 arquivos CSS listados — substituídos por `var(--ba-*)`. Nenhuma cor é removida sem um token equivalente a receber seu papel.
2. A duplicação de mapeamento de classificação de risco (ALTO/MÉDIO/BAIXO) hoje escrita três vezes com valores repetidos (`ScoreBadge.module.css`, `.tituloAlto/Medio/Baixo` e `.cardAlto/Medio/Baixo` em `StepRevisao.module.css`) — as três passam a referenciar os mesmos três tokens de estado, eliminando o risco de um dia divergirem entre si.
3. A pilha de fontes de sistema genérica (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`) em `src/index.css`, substituída pela pilha do DS.
4. O `font-weight: bold` de `.logo` (`Header.module.css:13-18`) — o texto "By Arabi Planejados" passa a peso 400.

---

## O que NÃO será tocado

- `src/services/pdf.js` e `src/services/pdfVendedor.js` — fora de escopo **definitivamente**, agora e no futuro. O PDF continua com a paleta/fonte que usa hoje (ver `RELATORIO_FONTES_PDF.md`).
- **(acrescentado na revisão de 2026-11-06)** `src/services/pdfFutura.js` (PDF da Venda futura) e `src/services/importacaoPdf.js` (gravação e leitura dos dados escondidos no PDF do Cliente). **O formato V1 desses dados (propriedade Keywords: `V1:` + Base64 de JSON com 4 chaves) é contrato com leitores Python externos** (`CLAUDE.md`, seção "Importar PDF"): mudou o formato, muda a versão e os leitores são avisados antes. Esta melhoria é só de CSS e não deve chegar perto disso; mesmo assim fica registrado para quem implementar.
- `src/domain/` inteiro (`scoreEngine.js`, `ccBuilder.js`, `schema.js`, `schemaVendedor.js`, `ambientes.js`, `checklistTextos.js`, `gruposPerguntasVendedor.js`) — nenhuma regra de negócio, nome de gatilho, texto de CC ou cálculo de score muda.
- Estrutura de telas, número e ordem de etapas, rotas (`HashRouter`, todas as rotas de `src/App.jsx`, **incluindo `/projetista` e `/futura/*`**), textos de perguntas, labels e mensagens de erro (**incluindo os textos dos modais de Importar PDF**).
- `src/context/` (`FormContext.js`, `FormContextVendedor.js`, `FormProvider.jsx`, `FormProviderVendedor.jsx`, **e `FormProviderFutura.jsx`**) — estado e persistência em `localStorage` (a Venda futura não usa `localStorage`).
- `src/services/cep.js` — integração com ViaCEP.
- **(acrescentado)** A pasta `testes/` e a configuração de testes (`package.json` scripts) — a suíte existente não é alterada; ela só é executada (CA-16). Não se criam testes novos de CSS.
- Qualquer arquivo `.jsx`, **com a única exceção aprovada (decisão d)**: a troca de um caractere (🟡 → 🟠) em `ScoreBadge.jsx:5` e em `StepRevisao.jsx:100`. Nenhum outro trecho desses dois arquivos muda.
- Logo em imagem — não existe no projeto; nada a adaptar.
- `package.json` — nenhuma dependência nova.
- Distinção de cor por nível de risco nas caixas de aviso/CC inline dos formulários — hoje um único visual (dourado) para todos os níveis; após a mudança, um único visual (`--ba-warn`) para todos os níveis. Diferenciar por nível exigiria levar o dado de "nível do gatilho" até cada componente de formulário, que é mudança de estrutura, fora de escopo.

---

## Premissas assumidas

1. O artefato `PRDS_E_SPECS/REFERENCIA_DESIGN_SYSTEM_BY_ARABI.html` é a fonte de verdade única; onde ele diverge da skill `byarabi-design`, o artefato prevalece (ver seção de divergência, acima).
2. "Papel é o padrão" (linha 857-862 do artefato): as telas do app nascem em modo claro (`--ba-paper` `#f5f0e6`), como o site institucional. O Header, que já é escuro hoje, é tratado como a variante "tinta" de destaque prevista pelo próprio DS — não como o padrão do app.
3. Os tokens de cor de estado (`--ba-ok`, `--ba-warn`, `--ba-danger`) usam sempre os valores "claro" da tabela do artefato (`#2f6b45`, `#9a5b1f`, `#a32f2b`), pois a Etapa 2 deste PRD não implementa modo escuro automático via `prefers-color-scheme` (decisão (a): não implementar agora, fica como melhoria futura isolada) — se um dia for implementado, os valores escuros equivalentes (`#5faa7c`, `#e2934a`, `#f0736d`) precisam ser adicionados também.
4. O dourado usado em estado "selecionado" de chip/botão (`.ativo`, `.chipAtivo`, `.opcaoAtiva`) é tratado como acento de interação (equivalente ao próprio botão/chip do site), não como status — continua dourado após a mudança.
5. As caixas de aviso/CC inline (quatro locais listados acima) recebem um único tratamento visual em `--ba-warn`, sem diferenciar por nível de risco (ver "O que NÃO será tocado"). A mensagem de falha de CEP em `StepIdentificacao` também usa `--ba-warn`, mas como texto solto, sem caixa — não é uma caixa de CC (ver seção própria acima).
6. Emojis usados hoje como indicador visual (🔴🟡🟢 no `ScoreBadge`, ✏️/📄/⚠️ em botões e avisos, ✅ na tela de sucesso) são mantidos — são conteúdo, não CSS, e o artefato não define um padrão de ícone para substituí-los. **Exceção aprovada (decisão d):** o 🟡 do nível MÉDIO é trocado por 🟠 (`ScoreBadge.jsx:5` e `StepRevisao.jsx:100`), para acompanhar a cor terracota; 🔴 e 🟢 não mudam.
7. A tipografia Georgia/Helvetica é aplicada via `font-family` nos seletores globais e nas classes de título (`.titulo`, `.nomeEtapa`, `.logo`, `h2`/`h3` onde existirem) — não é necessário nenhum arquivo de fonte, pois ambas são fontes de sistema, coerente com a regra "zero webfonts" do artefato. `.logo` também perde o `font-weight: bold` que tem hoje (ver item 3 de "O que será adicionado").
8. O botão primário do app (hoje fundo escuro `#1a1a1a` + texto dourado `#c8a84b`, ex.: `.btnGerar`, `.btnPerfil`, `.btnNovo`, e agora também `.btnModal`) passa a seguir o `.btn-primary` do DS (fundo dourado `#e3b838`, texto `#17140b`, pílula) — essa é a mudança visualmente mais perceptível da Etapa 2, prevista pelo próprio artefato ("o botão dourado é o mesmo nos dois fundos", linha 573-574). Decisão (e): `.btnImportar` é `.btn-outline`, `.btnModal` ("Fechar" e "Sim, importar") é o botão primário e `.btnModalSecundario` ("Cancelar") é contorno neutro.
9. **(nova, revisão de 2026-11-06)** Como a Venda futura e a tela `/projetista` reaproveitam CSS de outros fluxos (ver seção "O que os fluxos compartilham de CSS"), o PRD assume que **ficam visualmente idênticas ao padrão novo "de graça"**, sem arquivo CSS próprio de Venda futura. A conferência visual desses fluxos é exigida pelos CA-11 e CA-12; não se cria CSS novo para eles.

---

## Riscos identificados

1. **Contraste do dourado profundo em texto pequeno.** O artefato mede que `#a77d0b` sobre papel dá 3,3:1 — passa só para título ≥24px ou ícone, reprova em texto corrido (linha 447). Vários lugares do app hoje usam dourado em texto pequeno (rótulos de aviso, badges). Mitigação: usar `--ba-gold-text` (`#8a6608`, 4,6:1) nesses casos, nunca `--ba-gold-deep` puro — já previsto no item 9 de "O que será adicionado".

2. **Botão primário muda de "escuro com texto dourado" para "dourado com texto escuro".** É uma mudança de aparência visível em praticamente toda tela (BottomBar, StepRevisao, SelecaoPerfil, EscolhaProjetista, StepSucesso, botões dos modais) — não é um ajuste sutil de tom. Reduz risco de rejeição visual, mas deve ser conferida numa passada completa pelos três fluxos (Cliente, Projetista Normal e Venda futura) antes de aprovar o Spec.

3. **Escala de etapas do Stepper não é resolvida por este PRD.** O próprio artefato marca isso como problema em aberto (linha 875-880): a marca tem um acento só e o Stepper do app precisa comunicar a etapa atual entre até 3 + N ambientes (Cliente) ou 2 + N (Vendedor). Hoje o Stepper (`Stepper.module.css`) não usa cor por etapa, só texto — o risco é baixo porque não há cor a redesenhar, mas fica registrado que a "escala de etapas" citada no DS não é um problema deste app hoje. A Venda futura não tem Stepper (`App.jsx:135-148`).

4. **`ScoreBadge` e os blocos duplicados de `StepRevisao` podem divergir de novo no futuro** se alguém editar um sem editar o outro. A tokenização reduz mas não elimina esse risco — os três ainda são blocos de CSS separados, só passam a apontar para os mesmos nomes de variável. **Ampliado na revisão de 2026-11-06:** o mesmo risco existe agora entre os botões de `SelecaoPerfil.module.css` (`.btnPerfil` e `.btnModal` têm visual quase idêntico; `.btnImportar` e `.btnModalSecundario` também) e entre o CSS do Vendedor e a Venda futura, que o reaproveita (`StepRevisaoFutura.jsx:6`, `StepSucessoFutura.jsx:3`): alguém que edite `StepRevisaoVendedor.module.css` ou `StepSucessoVendedor.module.css` achando que mexe só no Vendedor altera também a Venda futura.

5. **`localStorage` de formulários em andamento não é afetado**, pois a mudança é só de CSS — mas vale confirmar visualmente que um rascunho salvo antes da mudança continua renderizando corretamente após o deploy (o estado não muda, só a aparência). O mesmo vale para a importação de PDF, que grava a chave `byarabi_checklist_rascunho` (`SelecaoPerfil.jsx:9`).

6. **Botão "Vendedor" some visualmente se ficar parecido demais com o botão secundário.** Como ele aparece em quase toda tela do fluxo Cliente (ver seção acima), reduzir demais seu destaque pode fazer o cliente deixar de notar essa via de ajuda. A escolha de tratá-lo como `.btn-outline` (decisão c) preserva um contorno dourado que o diferencia do secundário (cinza).

7. **Geometria de pílula do DS pode não caber nos três botões da BottomBar em 375px, e a barra pode ficar mais alta que o espaço reservado hoje.** `BottomBar.module.css:1-13` fixa a barra na base da tela. No fluxo Cliente ela mostra até três botões lado a lado — Voltar, Vendedor (`white-space: nowrap`) e Avançar —, hoje com `min-height: 44px` e padding entre `12px` e `20px` (`BottomBar.module.css:15-53`). A geometria de pílula do artefato (`min-height: 54px`, `padding: 0 24px`, `gap: 18px` entre rótulo e ícone — linha 572 do arquivo de referência) ocupa mais espaço horizontal e pode não caber nos três botões numa tela de 375px, além de aumentar a altura da barra. O espaço reservado sob o conteúdo de cada tela é um `<div className={styles.espacoBar}>` de altura fixa em `80px`, definido separadamente em sete arquivos — `StepPerguntasGlobais.module.css:161`, `StepPerguntasPorAmbiente.module.css:217`, `StepAmbientes.module.css:86`, `StepAmbientesVendedor.module.css:86`, `StepPerguntasAmbienteVendedor.module.css:123`, `StepIdentificacao.module.css:56` e `StepIdentificacaoVendedor.module.css:71`. Se a barra ficar mais alta que 80px, o último campo de cada formulário fica escondido atrás dela. **Mitigação:** ajustar a geometria dos botões dentro da barra (uma pílula com altura e padding menores que o padrão do artefato, ex.: `min-height: 48px`, `padding: 0 16px`, sem o `gap: 18px` completo) e os sete `.espacoBar` juntos, na mesma etapa — nunca um sem o outro. Ver verificação adicional em CA-03. **Acrescentado na revisão de 2026-11-06:** existem ainda dois `.espacoBar` de `20px` — `StepRevisao.module.css:156` (a Revisão do Cliente não usa `BottomBar`) e `StepRevisaoVendedor.module.css:55`, este último **usado também pela Venda futura** (`StepRevisaoFutura.jsx`, que usa `BottomBar`). Não são alterados hoje, mas a conferência visual do CA-04 e do CA-11 deve confirmar que a barra mais alta não esconde o último elemento dessas duas telas.

8. **(novo, revisão de 2026-11-06) Mudar CSS "do Vendedor" altera a Venda futura sem aviso.** `StepRevisaoVendedor.module.css`, `StepSucessoVendedor.module.css` e `StepIdentificacao.module.css` servem também à Venda futura (ver seção de CSS compartilhado). Mitigação: o CA-11 obriga a conferência visual do fluxo `/futura/*` em 375px; e esta relação fica registrada aqui para o Spec e para quem implementar. O CLAUDE.md do projeto ("mudança em um perfil não propaga para o outro") não vale mais para o CSS dessas telas.

9. **(novo, revisão de 2026-11-06; mitigado pela decisão f) Link "← Voltar" e legenda da tela `/projetista` ficariam fora do padrão.** `EscolhaProjetista.module.css` não tem cor nem fonte (`.voltar`, `.apoio`), então sem tratamento o link continuaria azul/roxo sublinhado do navegador sobre o papel novo — a única parte do app sem identidade visual. **Mitigação aprovada:** acrescentar as regras de cor, tipografia e foco nesse CSS, com tokens (ver "Arquivos afetados" e CA-12). O risco residual é esquecer esse arquivo na implementação, porque ele não aparece na busca de cores do CA-01 (não tem hex); por isso o CA-12 é conferência visual obrigatória.

---

## Decisões tomadas

Todas as recomendações das antigas perguntas em aberto foram aprovadas pelo Everton em 2026-11-06.

**(a) Modo escuro automático (`prefers-color-scheme`) — NÃO implementar agora.**
Por quê: o artefato define "papel é o padrão" para ferramentas internas, e o modo escuro automático é um comportamento a mais para testar (contraste, `ScoreBadge` em fundo escuro) sem necessidade comprovada. Os tokens da Etapa 1 já deixam a porta aberta, então pode entrar depois como melhoria futura isolada, sem retrabalho.
Alternativa descartada: implementar já o bloco `@media (prefers-color-scheme:dark)` do artefato (linhas 19-29 do arquivo de referência), que faria o app inteiro mudar para tinta conforme o aparelho do usuário.

**(b) Altura de campo — manter 44px nos formulários longos; 48px só em telas com poucos campos.**
Por quê: 44px já é o padrão predominante no app (mudança mínima) e o próprio DS admite que 48px cansa em muitos campos (linha 729). `StepPerguntasPorAmbiente` e `StepPerguntasAmbienteVendedor` têm dezenas de campos em sequência. Os 48px ficam para telas como `StepIdentificacao` (nome, contrato, endereço).
Alternativa descartada: subir todos os campos para 48px, como no artefato.

**(c) Botão "Vendedor" da BottomBar — tratar como `.btn-outline` do DS** (fundo transparente, borda e texto `--ba-gold-deep`).
Por quê: é o papel visual mais próximo do que ele já tenta ser hoje e mantém distinção clara do primário (pílula dourada preenchida) e do secundário (contorno cinza neutro), evitando o Risco 6.
Alternativa descartada: deixá-lo com visual parecido com o secundário cinza, onde o cliente deixaria de notar a via de ajuda.

**(d) Emoji 🟡 do nível MÉDIO — exceção pontual aprovada: trocar por 🟠 em `ScoreBadge.jsx:5` e `StepRevisao.jsx:100`.**
Por quê: a cor do nível MÉDIO passa de dourado/amarelo para terracota (`--ba-warn`), e o emoji amarelo ficaria ao lado de uma cor que não é mais amarela. É um caractere em cada arquivo, em elementos já listados no escopo (badges); não muda texto, pergunta, rota ou regra. Nenhum teste de `testes/` depende do emoji (confirmado em 2026-11-06).
Alternativa descartada: manter "zero `.jsx`" e aceitar o emoji amarelo ao lado do terracota como inconsistência residual, para resolver depois em um card à parte.

**(e) "Importar PDF" e botões dos modais — proposta inteira aprovada.**
- "Importar PDF" (`.btnImportar`): `.btn-outline` do DS, abaixo de "Cliente" e "Projetista" em destaque.
- `.btnModal` ("Fechar" e "Sim, importar"): botão primário do DS (pílula dourada).
- `.btnModalSecundario` ("Cancelar"): contorno neutro, igual ao secundário da BottomBar.
Por quê: "Importar PDF" é ação ocasional (mesmo papel do botão "Vendedor", decisão c); o `Modal` já força botões em largura total (`Modal.module.css:26-29`), então a diferença entre confirmar e cancelar precisa vir da hierarquia visual, e "Cancelar" neutro não compete com a ação principal.
Alternativa descartada: deixar "Cancelar" em destaque e "Sim, importar" discreto, por ser a ação que substitui o preenchimento em andamento. O Everton optou por tratar "Sim, importar" como primário; a mensagem do modal já avisa que a importação substitui o preenchimento.

**(f) Tela `/projetista` — estilizar o link "← Voltar" e a legenda `.apoio`.**
Por quê: é o único lugar do app que ficaria fora do padrão, e o custo é pequeno e isolado (algumas regras em `EscolhaProjetista.module.css`, com cor via `var(--ba-*)`, tipografia do DS e foco visível). Por isso `EscolhaProjetista.module.css` passa a ser arquivo afetado.
Alternativa descartada: manter o escopo mínimo e aceitar o link azul do navegador como inconsistência residual.

---

## Critérios de aceitação

Cada critério pode ser verificado por alguém não-técnico, sem ler código.

---

### CA-01 — Nenhuma cor fixa fora do arquivo de tokens, e nenhum token temporário

**Cenário:** Rodar `grep -rEn '#[0-9a-fA-F]{3,8}\b|rgba?\(' src --include=*.css` (o mesmo método da medição de referência) e conferir que só `src/index.css` aparece; em seguida, abrir `src/index.css` e conferir a lista de tokens `--ba-*`. Os blocos de `SelecaoPerfil.module.css` (`.btnPerfil`, `.btnImportar`, `.btnModal`, `.btnModalSecundario`, hoje 13 linhas com cor) entram nessa verificação.

**Esperado:** Zero resultados de hex e de `rgba`/`rgb` fora de `index.css` — toda cor e toda transparência usada em qualquer tela do app (incluindo sombras e overlays, como o `rgba(0, 0, 0, 0.55)` do fundo do diálogo de rascunho e do `Modal`, e o `rgba(200, 168, 75, 0.15)` do hover do `.btnImportar`) está definida uma única vez em `src/index.css` e referenciada nos demais arquivos via `var(--ba-*)`. Dentro de `index.css`, nenhum token tem nome ou comentário indicando "antigo", "temp", "old" ou equivalente — todos os `--ba-*` batem com o "Bloco de tokens para colar" do artefato (mais as extensões de estado/legibilidade previstas nas premissas). O `EscolhaProjetista.module.css` também entra na verificação: depois da decisão (f) ele passa a ter regras de cor, e todas devem usar `var(--ba-*)`, ou seja, **continua sem nenhum hex ou rgba** e portanto não aparece nessa busca. Confira o arquivo à parte, abrindo-o, para ter certeza de que as regras de `.voltar` e `.apoio` existem (a busca não prova isso).

---

### CA-02 — O projeto compila

**Cenário:** Rodar `npm run build` após a mudança.

**Esperado:** O build termina sem erro, gerando a pasta `dist/` normalmente — igual ao comportamento de hoje.

---

### CA-03 — Fluxo Cliente, celular (~375px de largura)

**Cenário:** Abrir `npm run dev`, redimensionar a janela (ou usar as ferramentas de desenvolvedor do navegador) para ~375px de largura, e percorrer o fluxo Cliente do início (`SelecaoPerfil` → botão "Cliente" → Identificação → Ambientes → Perguntas Gerais → pelo menos um ambiente → Revisão → Sucesso).

**Esperado:** Todas as telas usam fundo papel (`#f5f0e6`), títulos em Georgia sem negrito, botões em formato pílula com o dourado como cor de ação principal, campos com cantos arredondados e anel de foco dourado ao clicar. Nenhum texto corta ou sobrepõe outro elemento nessa largura. O header permanece escuro (tinta) no topo. O botão "Vendedor" continua visível e funcional, com um terceiro visual (contorno dourado), sem se confundir com o botão primário. A tela inicial (`SelecaoPerfil`), por onde o fluxo começa, também segue o padrão novo, e os botões "Cliente", "Projetista" e "Importar PDF" cabem na largura sem cortar texto (a conferência detalhada do "Importar PDF" está nos CA-13 a CA-15).

**Verificação adicional (Risco 7):** em pelo menos uma tela com os três botões da BottomBar (Voltar, Vendedor, Avançar), confirmar que os três cabem em uma única linha, sem cortar texto e sem quebrar para uma segunda linha; e que o último campo/elemento de cada formulário não fica escondido atrás da barra fixa ao rolar até o fim da página.

---

### CA-04 — Fluxo Projetista "Normal" (antigo "Vendedor"), celular (~375px de largura)

**Cenário:** Mesma verificação do CA-03, mas para o fluxo Projetista Normal. **Caminho de acesso (atualizado):** tela inicial → botão "Projetista" → tela `/projetista` → botão "Normal" (que leva a `/vendedor/identificacao`, `EscolhaProjetista.jsx:17`). Antes da entrega do commit f73f2f1 o botão "Projetista" levava direto à identificação; hoje não leva. Percorrer do início, incluindo pelo menos um ambiente de cada grupo (A, B ou C) e a tela de Revisão do Projetista.

**Esperado:** Mesmo padrão visual do CA-03. A caixa de aviso "não substitui o Checklist do Cliente" aparece com a cor de aviso (terracota), não mais dourada. O botão "Vendedor" não aparece em nenhuma tela deste fluxo (comportamento já existente, sem mudança). Na Revisão do Projetista, o último elemento da página não fica escondido atrás da barra fixa (`espacoBar` de 20px, Risco 7).

---

### CA-05 — Fluxo Cliente, desktop

**Cenário:** Repetir o percurso do CA-03 em largura de desktop (≥1200px), incluindo a tela inicial e a tela `/projetista`.

**Esperado:** Layout não estica de forma estranha (os `max-width: 600px` das páginas de formulário continuam centralizados); nenhuma cor antiga (dourado `#c8a84b`, fundo `#f7f5f0`) aparece — só as cores do Design System.

---

### CA-06a — Card de CC "Risco Médio" não depende do score do ambiente

**Cenário:** Em uma Cozinha, responder "Existe granito ou pia existente no local?" = Sim e "Os móveis serão adaptados para este granito/pia?" = Não (`FormCozinha.jsx`, pergunta de granito). Isso ativa `GRANITO_RETIRAR` — em `scoreEngine.js:61`, com `pontos: 2`; em `ccBuilder.js:97-105`, um CC com `nivel: 'MÉDIO'`. Nenhum outro gatilho é ativado nesse ambiente.

**Esperado:** Na tela de Revisão, o card desse CC aparece na seção "🟠 Risco Médio" (título com o emoji novo da decisão d, `StepRevisao.jsx:98-108`, filtro `cc.nivel === 'MÉDIO'`), com a cor `.cardMedio` — que passa a ser `--ba-warn` em vez de dourado. Como o ambiente acumula só 2 pontos no total, o **badge de score** desse mesmo ambiente mostra **BAIXO** (`classificar(2, false)` em `scoreEngine.js:164-168` exige `pontos >= 4` para `'MÉDIO'`). Ver a nota "são dois mecanismos diferentes" na seção de contexto — isso é comportamento correto e já existente hoje, não uma regressão da mudança visual.

---

### CA-06b — Badge de score "MÉDIO" quando os pontos do ambiente somam 4 ou mais

**Cenário:** Na mesma Cozinha do CA-06a, além do granito a retirar (2 pontos), também responder de forma a ativar `TANQUE_RETIRAR`: "Existe tanque no local?" = Sim → "Qual o tipo de tanque?" = "Tanque tradicional (de porcelana ou plástico, apoiado no chão)" → "Haverá móveis na região do tanque?" = Sim (`FormCozinha.jsx:77,82-91,107`; condição `tanque === true && tanqueEmbutido === false && tanqueMoveis === true` em `scoreEngine.js:66-70`, `pontos: 2`). O ambiente agora acumula 4 pontos, todos com gatilho de nível `'Médio'` (nenhum `'Alto'`/`'AltoDireto'`), então `isAlto` permanece `false`.

**Esperado:** `classificar(4, false)` (`scoreEngine.js:165-166`) retorna `'MÉDIO'` — o `ScoreBadge` desse ambiente exibe **MÉDIO** na cor de aviso (`--ba-warn`), não mais em dourado/amarelo. Os dois CCs (granito e tanque) também aparecem na seção "Risco Médio" da Revisão, já que ambos têm `nivel: 'MÉDIO'` em `ccBuilder.js` (linhas 101 e 112) — neste cenário específico, badge e cards de CC coincidem no mesmo nível.

---

### CA-07 — Rascunho salvo antes da mudança continua funcionando

**Cenário:** Preencher parcialmente um formulário (Cliente ou Projetista Normal), fechar a aba sem finalizar (simula um rascunho salvo em `localStorage`), depois reabrir o app já com a mudança visual aplicada. (A Venda futura não participa deste critério: não grava rascunho, `FormProviderFutura.jsx:4`.)

**Esperado:** O diálogo de retomada de rascunho aparece com a nova aparência (papel/dourado do DS) e, ao continuar, os dados preenchidos anteriormente aparecem corretamente nas telas — sem erro no console e sem campo em branco que deveria estar preenchido.

---

### CA-08 — PDF não muda

**Cenário:** Gerar o PDF (Cliente, Projetista e Venda futura) depois da mudança visual aplicada no app.

**Esperado:** O PDF gerado é visualmente idêntico ao gerado antes da mudança — mesma fonte, mesmas cores, mesmo layout. Nenhuma diferença perceptível, porque `pdf.js`, `pdfVendedor.js` e `pdfFutura.js` não foram tocados. Os dados escondidos nos PDFs do Cliente (formato V1) também não mudam — o CA-16 (`npm test`) confere isso automaticamente.

---

### CA-09 — Cenário de erro: build quebra por variável não definida

**Cenário:** Durante a Etapa 1 (tokenização), um arquivo `.css` referencia `var(--ba-xyz)` para um token que não foi definido em `:root`.

**Esperado:** O navegador não gera erro de build (CSS tolera variável não definida, o valor simplesmente não é aplicado), mas o elemento fica visualmente "quebrado" (sem cor de fundo ou texto). Esse é um erro a ser pego na conferência visual manual (CA-03/CA-04/CA-05/CA-11/CA-12/CA-13), não pelo `npm run build`, que não falha nesse caso — por isso a inspeção visual dos fluxos é obrigatória, não opcional.

---

### CA-10 — Cenário de erro: dourado profundo usado fora de título/ícone

**Cenário:** Buscar, em todos os arquivos `.css` de `src/`, por `color: var(--ba-gold-deep)` (ou `color:var(--ba-gold-deep)`).

**Esperado:** Cada ocorrência encontrada está aplicada exclusivamente a um seletor de título grande ou ícone — `h1`, `h2`, `h3`, `.titulo`, `.nomeEtapa`, `.logo`, ou um ícone equivalente (lista definitiva a fechar no Spec). Nenhuma ocorrência está aplicada a texto de corpo, rótulo pequeno, badge, aviso ou qualquer classe cujo texto renderizado tenha menos de 24px. Se alguma ocorrência for encontrada fora dessa lista, é defeito — deve usar `--ba-gold-text` no lugar.

---

### CA-11 — (novo) Fluxo Venda futura, celular (~375px de largura)

**Cenário:** Em 375px, tela inicial → "Projetista" → `/projetista` → botão "Venda futura" (leva a `/futura/identificacao`). Preencher nome, contrato e endereço (testar também um CEP inexistente para ver a mensagem de CEP), avançar para a Revisão (`/futura/revisao`), gerar o PDF e chegar à tela de sucesso (`/futura/sucesso`). Em seguida, clicar em "Iniciar novo preenchimento".

**Esperado:** As três telas seguem o mesmo padrão do CA-03 (fundo papel, títulos Georgia sem negrito, botões pílula com dourado como ação principal, header escuro). A mensagem de CEP aparece em terracota (`--ba-warn`), como na identificação do Cliente. **Não** aparece o botão "Vendedor" em nenhuma das três telas (`StepRevisaoFutura.jsx:61` e `App.jsx:191`). Na identificação os botões Voltar e Avançar cabem em uma linha; na Revisão, "Editar identificação" e "Gerar PDF" cabem em uma linha sem cortar texto (rótulo mais longo, `StepRevisaoFutura.jsx:55-62`) e o último bloco de dados não fica escondido atrás da barra fixa (`espacoBar` de 20px compartilhado com o Vendedor). Não existe `Stepper` nem diálogo de rascunho nessas telas (comportamento já existente). Registra-se aqui que estas telas herdam o visual de `StepRevisaoVendedor.module.css`, `StepSucessoVendedor.module.css` e `StepIdentificacao.module.css`: se qualquer um deles for alterado, este critério precisa ser refeito.

---

### CA-12 — (novo) Tela `/projetista`, celular e desktop

**Cenário:** Abrir a tela inicial → "Projetista" em 375px e em desktop (≥1200px).

**Esperado:** A tela mostra o header escuro, o título "Projetista" em Georgia sem negrito sobre fundo papel e os botões "Normal" e "Venda futura" no mesmo padrão do botão "Projetista" da tela inicial (mesma classe `.btnPerfil`), cada um com a legenda `.apoio` abaixo e legível. O link "← Voltar" leva de volta à tela inicial. Conforme a decisão (f), o link e as legendas usam a tipografia e a cor do Design System: link em `--ba-gold-text` (contraste mínimo de 4,5:1 sobre o papel), legenda em cor de texto legível, e **foco visível por teclado** no link (anel dourado, ao navegar com Tab). O link **não** pode aparecer no azul/roxo padrão do navegador; se aparecer, é defeito (Risco 9).

---

### CA-13 — (novo) Tela inicial com "Importar PDF" e caminho de erro

**Cenário:** Em 375px e em desktop, abrir a tela inicial. Conferir o botão "Importar PDF" (decisão (e): `.btn-outline` do DS, contorno dourado com fundo transparente, abaixo de "Cliente" e "Projetista" em destaque). Clicar nele e escolher um PDF **sem** os dados escondidos do Cliente (ex.: qualquer PDF externo, ou o PDF da Venda futura, que não carrega esses dados) — e, em outra tentativa, um arquivo PDF maior que 20 MB.

**Esperado:** O botão "Importar PDF" aparece sem cortar texto, com foco visível por teclado e hover coerente com o padrão novo. Ao escolher o arquivo sem dados, abre a janela com o texto exato "PDF não possui dados para importação" e o botão "Fechar" (largura total, **botão primário do DS: pílula dourada com texto escuro**), sem erro no console; ao fechar, nada foi gravado no rascunho (`byarabi_checklist_rascunho` intacta) e o usuário continua na tela inicial. O mesmo acontece com o arquivo acima de 20 MB. O overlay escuro e a caixa branca do modal usam os tokens, sem cor fixa (CA-01).

---

### CA-14 — (novo) Importar PDF com preenchimento já em andamento (confirmação)

**Cenário:** Com um preenchimento do Cliente já iniciado (rascunho existente em `byarabi_checklist_rascunho`), voltar à tela inicial e importar um PDF válido do Cliente (nome `Checklist_Cliente_*.pdf`, gerado pelo app).

**Esperado:** Abre a janela com o texto exato "Já existe um preenchimento em andamento. Importar este PDF vai substituí-lo. Deseja continuar?" e os botões "Sim, importar" e "Cancelar", com a hierarquia da decisão (e): "Sim, importar" é o **botão primário do DS (pílula dourada preenchida, texto escuro)** e "Cancelar" é **contorno neutro** (sem dourado, igual ao secundário da BottomBar). Os dois são claramente distintos e ocupam a largura da caixa, um sobre o outro. "Cancelar" fecha a janela e o rascunho existente permanece exatamente como estava, sem navegação. "Sim, importar" segue o CA-15.

---

### CA-15 — (novo) Importar PDF válido leva à Revisão, sem diálogo de rascunho, com o visual novo

**Cenário:** Sem rascunho prévio (ou após "Sim, importar" do CA-14), importar um PDF válido do Cliente.

**Esperado:** O app vai direto para `/revisao` (Revisão do Cliente) **sem exibir** o diálogo "Continuar de onde parou?" (`FormProvider.jsx`, `importando`/`restaurar`), com os dados do PDF preenchidos e com o visual novo (fundo papel, badges e cards de CC nas cores de estado, botão "Gerar PDF" em dourado). O diálogo de rascunho comum (CA-07) continua aparecendo quando se abre o app com rascunho existente sem passar pela importação.

---

### CA-16 — (novo) A suíte de testes continua verde

**Cenário:** Rodar `npm test` depois da mudança, na raiz do projeto.

**Esperado:** Todos os testes passam e **nenhum aparece como pulado** (regra do `CLAUDE.md`: vermelho ou pulado bloqueia commit/merge que altere `src/`). O resultado (passou/pulou/falhou, com os totais) é informado ao Everton ao fechar o ciclo. Como nenhum teste atual cobre CSS (ver seção "Testes automatizados"), este critério serve para provar que a mudança não afetou lógica, PDF (Cliente, Projetista e Venda futura) nem a leitura V1 da importação — não substitui a conferência visual dos CA-03, CA-04, CA-05 e CA-11 a CA-15. **Cenário de erro:** se algum teste falhar ou ficar pulado por falta de material, a entrega fica bloqueada e o motivo é registrado em "Desvios" no Spec.

---

### CA-17 — (novo) Emoji do nível MÉDIO trocado para 🟠

**Cenário:** Reproduzir o CA-06b (Cozinha com granito a retirar e tanque a retirar, 4 pontos) e abrir a Revisão. Em outro ambiente ou em outra rodada, deixar um ambiente com nível ALTO e outro com nível BAIXO, para ver os três níveis.

**Esperado:** O badge de score do ambiente com nível MÉDIO mostra 🟠 antes da palavra MÉDIO (`ScoreBadge.jsx:5`); o título da seção na Revisão aparece como "🟠 Risco Médio" (`StepRevisao.jsx:100`). Nenhum 🟡 aparece em lugar nenhum da interface. Os emojis 🔴 (ALTO) e 🟢 (BAIXO) permanecem como estão. Textos, rotas e cálculo do score não mudam (os testes do CA-16 seguem passando). **Cenário de erro:** se o 🟡 ainda aparecer em qualquer um dos dois lugares, ou se o 🟠 aparecer em outro nível (ALTO ou BAIXO), é defeito de implementação.

---

**Cenário de erro adicional — `.espacoBar` desatualizado após mudar a altura da BottomBar**

**Cenário:** A geometria dos botões da BottomBar é ajustada (Risco 7) mas um dos sete arquivos com `.espacoBar { height: 80px; }` é esquecido.

**Esperado:** Na tela correspondente a esse arquivo esquecido, o último campo ou botão do formulário fica parcial ou totalmente coberto pela barra fixa ao rolar até o fim — visível na verificação adicional do CA-03. Isso é tratado como defeito de implementação, não como variação aceitável entre telas.
