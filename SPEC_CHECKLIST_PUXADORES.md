# SPEC — Puxadores (modelo e cor por ambiente) no Checklist do Projetista

> **Status: aguardando aprovação do Everton.** Nenhum código foi escrito.
>
> Base: `PRD_CHECKLIST_PUXADORES.md` (aprovado em 26/11/2026, lido inteiro). As decisões das
> Seções 2 e 14 do PRD são fixas e não são reabertas aqui. Este Spec só define o desenho técnico
> para implementar o que o PRD especificou. **Durante a implementação, o Spec prevalece sobre o PRD
> e sobre qualquer outro documento.** Quem implementa não precisa ler a conversa que gerou este
> arquivo.
>
> Tudo o que é descrito como "hoje" foi reconferido diretamente no código da branch
> `feat/balcoes-convencionais-editados` (commit `65c8ccd`) em 26/11/2026, com `arquivo:linha`.
> Todos os caminhos são relativos à raiz do projeto (`Checklist-Dinamica/`).

---

## 0. Conferência PRD x código (Etapa 2)

As referências citadas no PRD foram reconferidas diretamente nos arquivos e batem:

- `src/domain/schemaVendedor.js:2-28` (`defaultsPorGrupo` para `A`, `B` e `C`, todos terminando com `observacoes: ''`).
- `src/domain/validacaoVendedor.js:1-2, 9-13, 15-19, 27-42` (`MSG_RESPONDA`, `MSG_RESPONDA_SIM_NAO = 'Responda sim ou não'`, `CAMPOS_OBRIGATORIOS_POR_GRUPO`, `respostaValida`, `validarRespostasGrupo`).
- `src/domain/gruposPerguntasVendedor.js:4-17` (`GRUPO_POR_AMBIENTE`, `obterGrupo`).
- `src/domain/respostaBalcaoVendedor.js:8-26` (`descreverRespostaBalcao` retornando `{ texto, destaque, linhas }`).
- `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoA.jsx:57-87, 91-110, 112-117, 119-129` (`campoFechado` com `mostrarNaoSeAplica = true`, blocos `"Alturas de instalação"`, `"Acabamento e ferragens"` e `"Observações (opcional)"`).
- `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoB.jsx:18-46, 50-55, 57-67` (`campoFechado` sem `mostrarNaoSeAplica`, bloco `"Acabamento e ferragens"` terminando em `fechamentoTeto`).
- `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoC.jsx:17-41, 45-49, 51-61` (`campoFechado` sem `mostrarNaoSeAplica`, bloco `"Acabamento e ferragens"` terminando em `corredicas`).
- `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.jsx:6, 36-38, 40-44, 57-68` (importa `validarRespostasGrupo`, usa `scrollToFirstError()`, repassa `erros` aos formulários).
- `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.module.css:24-40, 104-109, 131-135` (`.opcao`, `.opcaoAtiva`, `.erro`, `.subperguntas`).
- `src/steps/vendedor/StepIdentificacaoVendedor/StepIdentificacaoVendedor.jsx:85-113` e `StepIdentificacaoVendedor.module.css:41-71` (padrão visual de lista dinâmica com `−` em `index > 0` e botão pílula `+ Adicionar ...`).
- `src/steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.jsx:11-32, 34-40, 59-71, 103-122` (`PERGUNTAS_POR_GRUPO`, `formatarResposta`, `handleGerarPdf` sem revalidação, renderização de `linhas` com `<br />`).
- `src/services/pdfVendedor.js:19-40, 42-48, 103-119, 145-152` (`PERGUNTAS_POR_GRUPO`, `formatarResposta`, `escreverPergunta` com `linhasExtras` recuadas `+5 mm` em `:114-116`).
- `src/context/FormProviderVendedor.jsx:8, 25-50, 131, 158-171` (`STORAGE_KEY = 'byarabi_checklist_vendedor'`, `normalizarEstadoSalvo`, `SET_AMBIENTE_QUANTIDADE_VENDEDOR`, `SET_RESPOSTA_AMBIENTE_VENDEDOR`).
- `src/index.css:4-32` (tokens `--ba-*`).
- `package.json:10` (`"test": "node --test"`).
- `testes/V_pdf_projetista.test.js:31-49` (`T-V03`), `:51-64` (`T-V04`), `:66-76` (`T-V05`), `:78-101` (`T-V06`), `:286-323` (`T8`), `:325-347` (`T9`).
- `testes/V_validacao_projetista.test.js:8-15` (`BASE_A`), `:17-36` (`T17`), `:38-224` (`T10`–`T16`, `T18`, `T20`).
- `testes/auxiliares/construtores.js:88-100` (`montarEstadoProjetista`, já usa `structuredClone(defaultsPorGrupo[grupo])` na `:94`).
- `testes/I_importacao_pdf.test.js:145-153` (`T5`).

Observações (o código prevalece; o PRD não foi alterado):

1. **Cópia rasa de `defaultsPorGrupo` em `FormProviderVendedor.jsx:30-33` e `:131`:** diferente de `testes/auxiliares/construtores.js:94` (que usa `structuredClone`), `FormProviderVendedor.jsx` usa spread raso (`{ ...defaultsPorGrupo[...] }`) tanto em `normalizarEstadoSalvo` (`:31`) quanto em `SET_AMBIENTE_QUANTIDADE_VENDEDOR` (`:131`). Além disso, `structuredClone` **não é usado em nenhum arquivo de `src/`** e passaria a exigir navegador com suporte a `structuredClone` (iOS 15.4+) para criar qualquer ambiente. Ao acrescentar a lista `puxadores: []` em `defaultsPorGrupo`, uma cópia rasa faria ambientes diferentes compartilharem a mesma referência de array; por isso, este Spec acrescenta `FormProviderVendedor.jsx` à lista de arquivos afetados adotando **cópia simples explícita** (`{ ...defaultsPorGrupo[...], puxadores: [] }` em `:31` e `:131`, além de clonar cada item de `salvo.puxadores` na normalização e manter atualizações imutáveis na UI; Seção 1.1).
2. **`key={linha}` em `StepRevisaoVendedor.jsx:115`:** para balcões as duas linhas possíveis são sempre distintas, mas um ambiente pode ter dois puxadores iguais (ex.: dois `• Roma — Fendi`), o que causaria aviso de chave duplicada no React. Em `StepRevisaoVendedor.jsx:114-119`, usar `key={`${i}-${linha}`}` (com o índice do `map`).
3. **Subcomponente compartilhado vs alteração de `campoFechado` em `FormGrupoB.jsx` e `FormGrupoC.jsx`:** o PRD (`:330-333`, `:458-462`, `:628-630`) permite usar um subcomponente compartilhado que renderize diretamente `Sim` e `Não` sem `"Não se aplica"`. Adotando `BlocoPuxadoresVendedor.jsx` (Seção 1.5), as cópias locais de `campoFechado` em `FormGrupoB.jsx:18-46` e `FormGrupoC.jsx:17-41` não precisam ser modificadas, preservando todas as perguntas existentes intactas.
4. **Erros em `StepPerguntasAmbienteVendedor.jsx:19-68` só são recalculados ao clicar em `"Avançar"`:** o estado `erros` fica em `useState({})` (`:19`), limpa apenas ao trocar de ambiente (`:32-34`) e só recalcula no `validar()` (`:40-44`). Por isso, remover um puxador pelo botão `−` deixaria chaves indexadas antigas (ex.: `puxador_1_cor`) aparecendo no puxador que passou a ocupar aquela posição. Este Spec acrescenta em `StepPerguntasAmbienteVendedor.jsx` uma callback `onLimparErrosPuxadores` que apaga **somente** `puxadores` e `puxador_*`, disparada ao remover um puxador e ao alternar `temPuxador`, mantendo intactos erros de outros campos e o recálculo apenas no `"Avançar"` (Seção 1.5).
5. **Contagem em `T-V06` (`V_pdf_projetista.test.js:78-101`):** na linha `:269` o PRD menciona apenas a lista `Resposta: ...` e na `:799` detalha corretamente que `T-V06` passa de **7 para 8 respostas** (`:88-96` tem 7 itens hoje).
6. **Numeração dos testes nos arquivos JS:** `V_pdf_projetista.test.js` já possui `T-V01`–`T-V10` e `T1`–`T9`, e `V_validacao_projetista.test.js` já possui `T10`–`T18` e `T20`. Para evitar nomes duplicados dentro dos arquivos, os testes novos usam o prefixo `TP-01`, `TP-02`, ... nas chamadas `test(...)`, mapeados 1-para-1 para `T1`, `T2`, ... na Seção 3.1.
7. **Branch de trabalho:** a branch `feat/balcoes-convencionais-editados` já existe e está no commit `65c8ccd` (com `PRD_CHECKLIST_PUXADORES.md` já commitado). Nenhuma nova branch será criada.

---

## 1. Decisões do Spec

### 1.1 Schema e isolamento de estado por ambiente — `src/domain/schemaVendedor.js` e `src/context/FormProviderVendedor.jsx`

Em `src/domain/schemaVendedor.js`, nos três grupos (`defaultsPorGrupo.A`, `defaultsPorGrupo.B` e `defaultsPorGrupo.C`), acrescentar **logo antes de `observacoes`** (mesma ordem da tela, Revisão e PDF):

```js
temPuxador: null, // "Sim" | "Não" | null
puxadores: [],    // Array<{ modelo: string, cor: string }>
```

Por quê `puxadores: []` em vez de pré-criar `[{ modelo: '', cor: '' }]` nos defaults:
- Enquanto o usuário não marcou `Sim` (ou em rascunhos antigos), não existem itens vazios fantasma no estado;
- Permite validar o caso de lista vazia quando `temPuxador === 'Sim'` (CA-14 / Seção 16.2 do PRD);
- Ao clicar em `Sim` na tela pela primeira vez (quando `resp.puxadores` estiver vazio ou ausente), o componente inicializa `puxadores` com `[{ modelo: '', cor: '' }]`.

**Proteção contra vazamento de referência entre ambientes (sem `structuredClone` em `src/`):**
*Motivo da escolha:* `structuredClone` não é usado em nenhum arquivo de `src/` e passaria a exigir navegador com suporte a `structuredClone` (iOS 15.4+) para criar qualquer ambiente. Como `defaultsPorGrupo` só possui valores primitivos além de `puxadores: []`, a cópia simples explícita abaixo garante o mesmo isolamento de referência com compatibilidade total:
1. Em `FormProviderVendedor.jsx`:
   - Em `SET_AMBIENTE_QUANTIDADE_VENDEDOR` (`:131`), substituir `{ ...defaultsPorGrupo[obterGrupo(inst.tipo)] }` por:
     ```js
     {
       ...defaultsPorGrupo[obterGrupo(inst.tipo)],
       puxadores: [],
     }
     ```
   - Em `normalizarEstadoSalvo` (`:29-34`), fazer cópia explícita dos defaults e dos itens de `salvo.puxadores`:
     ```js
     const defaults = {
       ...(defaultsPorGrupo[obterGrupo(instancia.tipo)] || {}),
       puxadores: [],
     }
     const salvo = estadoSalvo?.respostasPorAmbiente?.[instancia.instanceId] || {}
     respostasPorAmbiente[instancia.instanceId] = {
       ...defaults,
       ...salvo,
       puxadores: Array.isArray(salvo.puxadores)
         ? salvo.puxadores.map((p) => (p && typeof p === 'object' ? { ...p } : p))
         : [],
     }
     ```
2. Em toda a camada de UI (`BlocoPuxadoresVendedor.jsx`), toda alteração em `puxadores` cria um novo array e novos objetos via `[...lista, { modelo: '', cor: '' }]`, `lista.map(...)` e `lista.filter(...)` — nunca `.push()` ou mutação in-place.
3. Em `domain/validacaoVendedor.js` e `domain/puxadoresVendedor.js`, ler `resp?.puxadores` sempre com guarda `Array.isArray(resp?.puxadores) ? resp.puxadores : []`, suportando rascunhos antigos ou entradas parciais sem lançar exceção.

### 1.2 Regras puras e catálogo de puxadores — `src/domain/puxadoresVendedor.js` (novo)

Arquivo `.js` puro em `src/domain/`, **sem importar React**, para ser reutilizado pela UI, Revisão, PDF e testado diretamente em `node --test`.

Exporta:

1. **`MODELOS_PUXADOR`**: lista na ordem exata de uso (Seção 2.7 do PRD):
   ```js
   export const MODELOS_PUXADOR = [
     'Roma',
     'Madri 150mm',
     'Madri 270mm',
     'Berlin',
     'Paris',
     'Perfil Cava',
     'Perfil Gola Fit',
     'Florença',
   ]
   ```
2. **`TEXTO_SEM_COR = 'Sem cor'`**
3. **`normalizarTextoPuxador(texto)`**:
   - Se `typeof texto !== 'string'`, devolve `''`.
   - Caso contrário: `texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()`.
   - Remove acentos, ignora caixa e remove espaços nas pontas (premissas P5 e P8 do PRD).
4. **`filtrarSugestoesPuxador(opcoes, termo)`**:
   - Se `!Array.isArray(opcoes)`, devolve `[]`.
   - `const filtro = normalizarTextoPuxador(termo)`
   - Se `!filtro`, devolve `[...opcoes]` (lista completa na ordem original).
   - Caso contrário, devolve `opcoes.filter((op) => normalizarTextoPuxador(op).includes(filtro))`.
5. **`ehModeloCorUnica(modelo)`**:
   - Compara `normalizarTextoPuxador(modelo)` contra `'madri 150mm'`, `'madri 270mm'` e `'florenca'`. Devolve booleano.
6. **`ehSemCor(cor)`**:
   - Devolve `normalizarTextoPuxador(cor) === 'sem cor'`.
7. **`obterSugestoesCor(modelo)`**:
   - Mapa interno com as paletas confirmadas (Seção 2.8 do PRD):
     - `'roma'` → `['Fendi', 'Alumínio', 'Griggio']`
     - `'berlin'` → `['Antique', 'Aço', 'Cobre']`
     - `'paris'` → `['Antique']` *(apenas `Antique` na lista suspensa)*
     - `'perfil cava'` → `['Fendi', 'Alumínio']`
     - `'perfil gola fit'` → `['Alumínio', 'Grafito']`
   - Normaliza `modelo` com `normalizarTextoPuxador(modelo)`.
   - Se vazio, cor única (`Madri 150mm`, `Madri 270mm`, `Florença`) ou qualquer outro valor fora dos 5 modelos com paleta (inclusive `'Madri'` sem medida ou modelo desconhecido como `'Zen Cup'`), devolve `[]`.
   - Quando encontra, devolve uma cópia `[...paleta]`.
8. **`resolverAlteracaoModelo(modeloAnterior, corAtual, novoModelo)`**:
   - Função pura que devolve `{ modelo: novoModelo, cor }` aplicando em conjunto as regras de autopreenchimento e limpeza de `"Sem cor"` (CA-09, CA-10, Q5, R3):
     - `const corSegura = typeof corAtual === 'string' ? corAtual : ''`
     - Se `ehModeloCorUnica(novoModelo)`:
       - Se `!ehModeloCorUnica(modeloAnterior)` **ou** `!corSegura.trim()`: devolve `{ modelo: novoModelo, cor: TEXTO_SEM_COR }`.
       - Caso contrário (já estava em cor única e o usuário havia digitado outra cor manual não vazia): devolve `{ modelo: novoModelo, cor: corSegura }`.
     - Se `!ehModeloCorUnica(novoModelo)`:
       - Se `ehModeloCorUnica(modeloAnterior)` **e** `ehSemCor(corSegura)`: devolve `{ modelo: novoModelo, cor: '' }` (limpa `"Sem cor"` ao sair para modelo com paleta, modelo desconhecido ou vazio).
       - Caso contrário: devolve `{ modelo: novoModelo, cor: corSegura }` (preserva cor digitada manualmente).
   - Por quê em função pura dedicada em vez de `useEffect` no componente: garante transição atômica `{ modelo, cor }` na mesma atualização de estado, evita efeito colateral na montagem de rascunho já salvo e permite testar todas as trocas unitariamente em `V_puxadores.test.js`.
   - *Nota:* é intencional trocar qualquer cor anterior (inclusive uma cor digitada manualmente pelo usuário) por `"Sem cor"` quando o modelo novo é de cor única e o anterior não era (por exemplo, `Roma` / `Fendi` → `Madri 150mm` vira `"Sem cor"`). A regra já coberta pelo `TP-04` permanece igual.
9. **`descreverRespostaPuxadores(resp)`**:
   - Assinatura e formato iguais a `descreverRespostaBalcao(resp)` (`src/domain/respostaBalcaoVendedor.js:8-26`): devolve `{ texto, destaque, linhas }`, onde `destaque` é **sempre `false`**.
   - Regras (Seção 6.3 e Q2 do PRD):
     - Se `resp?.temPuxador !== 'Sim' && resp?.temPuxador !== 'Não'` (inclui `null`, `undefined`, `''`): `{ texto: '—', destaque: false, linhas: [] }`.
     - Se `resp.temPuxador === 'Não'`: `{ texto: 'Não', destaque: false, linhas: [] }` (ignora eventual lista `resp.puxadores` preservada no estado).
     - Se `resp.temPuxador === 'Sim'`:
       - `const lista = Array.isArray(resp.puxadores) ? resp.puxadores : []`
       - `const linhas = lista.map((item) => { const modelo = typeof item?.modelo === 'string' ? item.modelo.trim() : ''; const cor = typeof item?.cor === 'string' ? item.cor.trim() : ''; return `• ${modelo || '—'} — ${cor || '—'}` })`
       - Devolve `{ texto: 'Sim', destaque: false, linhas }`.

### 1.3 Regras de validação — `src/domain/validacaoVendedor.js`

Manter intactas todas as constantes e regras existentes (`MSG_RESPONDA`, `MSG_RESPONDA_SIM_NAO`, `CAMPOS_ALTURA`, `CAMPOS_SUBPERGUNTAS_BALCAO`, `CAMPOS_OBRIGATORIOS_POR_GRUPO`, `respostaValida` e validação de balcões no grupo `'A'`).

Acrescentar e exportar:
- `MSG_INFORME_MODELO = 'Informe o modelo'`
- `MSG_INFORME_COR = 'Informe a cor'`
- `MSG_ADICIONE_PUXADOR = 'Adicione pelo menos um puxador'`

Dentro de `validarRespostasGrupo(grupo, resp = {})`, **para todos os grupos (`'A'`, `'B'` e `'C'`)**:
1. Validar `temPuxador`:
   - Se `resp.temPuxador !== 'Sim' && resp.temPuxador !== 'Não'`, gravar `erros.temPuxador = MSG_RESPONDA_SIM_NAO` (`'Responda sim ou não'`).
   - *Nota:* `temPuxador` **não** entra em `CAMPOS_OBRIGATORIOS_POR_GRUPO` porque `respostaValida` aceitaria `'não se aplica'` e emitiria `MSG_RESPONDA`.
2. Se `resp.temPuxador === 'Sim'`:
   - `const lista = Array.isArray(resp.puxadores) ? resp.puxadores : []`
   - Se `lista.length === 0`: gravar `erros.puxadores = MSG_ADICIONE_PUXADOR`.
   - Para cada `(item, index)` de `lista`:
     - `const modelo = typeof item?.modelo === 'string' ? item.modelo.trim() : ''`
     - `const cor = typeof item?.cor === 'string' ? item.cor.trim() : ''`
     - Se `!modelo`: `erros[`puxador_${index}_modelo`] = MSG_INFORME_MODELO`
     - Se `!cor`: `erros[`puxador_${index}_cor`] = MSG_INFORME_COR`
3. Se `resp.temPuxador === 'Não'` (ou ausente/`null`):
   - Não valida `resp.puxadores`, mesmo que haja itens preservados ou incompletos no estado.

### 1.4 Componente `ComboboxEditavel` em React puro — `src/components/ComboboxEditavel/` (novo)

Arquivos novos:
- `src/components/ComboboxEditavel/ComboboxEditavel.jsx`
- `src/components/ComboboxEditavel/ComboboxEditavel.module.css`

Sem dependências externas, sem `<datalist>`, usando exclusivamente tokens `--ba-*` de `src/index.css`.

Props: `{ id, value = '', onChange, opcoes = [], placeholder = '', temErro = false, ariaLabel }`.

Regras de interação (Q7, CA-06 a CA-11, R1 e R2 do PRD):
1. **Estado interno:** `aberto` (`false`), `filtrando` (`false`), `indiceAtivo` (`-1`), `containerRef`, `inputRef`, `acabouDeFocarRef`.
2. **Disponibilidade de sugestões:** `const temOpcoes = Array.isArray(opcoes) && opcoes.length > 0`.
   - Quando `temOpcoes === false` (ex.: campo Cor de modelo desconhecido ou Modelo vazio): não renderiza o botão de setinha `▾` e não abre lista suspensa; o `<input>` opera como campo de texto livre normal.
3. **Seleção total ao clicar/focar e lista completa inicial:**
   - No `onFocus` do `<input>`: se `value` não estiver vazio, executa `e.target.select()` e marca `acabouDeFocarRef.current = true`; se `temOpcoes`, define `filtrando = false`, `aberto = true`, `indiceAtivo = -1`.
   - No `onMouseUp` do `<input>`: se `acabouDeFocarRef.current` for verdadeiro, define `acabouDeFocarRef.current = false` e chama `e.preventDefault()`, evitando que o clique/toque desfaça a seleção total do texto no desktop ou celular.
   - No `onClick` do `<input>`: se `temOpcoes && !aberto`, abre com `filtrando = false`, `aberto = true`, `indiceAtivo = -1`.
4. **Digitação livre e filtragem (`onChange` do `<input>`):**
   - Chama `onChange(e.target.value)` imediatamente.
   - Se `temOpcoes`: define `filtrando = true`, `aberto = true`, `indiceAtivo = -1`.
   - `opcoesVisiveis = !temOpcoes ? [] : filtrando ? filtrarSugestoesPuxador(opcoes, value) : opcoes`.
5. **Botão de setinha `▾` (somente quando `temOpcoes === true`):**
   - `<button type="button" className={styles.botaoSeta} aria-label="Mostrar sugestões" aria-expanded={aberto} onMouseDown={(e) => e.preventDefault()} onClick={alternarLista}>▾</button>`.
   - `alternarLista`: alterna `aberto` (`!prev`), sempre com `filtrando = false` e `indiceAtivo = -1`, exibindo **todas** as opções daquele campo sem exigir apagar o texto atual.
6. **Seleção resistente ao `onBlur` e ao scroll touch (R1):**
   - Cada sugestão é renderizada como `<button type="button" role="option" className={...} onMouseDown={(e) => e.preventDefault()} onClick={() => selecionar(opcao)}>`.
   - `onMouseDown` com `preventDefault()` evita que o `<input>` dispare `blur` antes do `click`; ao mesmo tempo, usar `onClick` (em vez de `onPointerDown`) permite que o usuário role a lista no celular sem selecionar um item acidentalmente ao deslizar o dedo.
   - Um `useEffect` escuta `pointerdown` em `document`: se `!containerRef.current?.contains(e.target)`, fecha o menu (`setAberto(false)`, `setIndiceAtivo(-1)`). No `onBlur` do `<input>`, fecha apenas se `!containerRef.current?.contains(e.relatedTarget)`.
   - `selecionar(opcao)` chama `onChange(opcao)`, fecha o menu (`aberto = false`, `filtrando = false`, `indiceAtivo = -1`).
7. **Teclado (`onKeyDown` no `<input>`):**
   - `ArrowDown`: abre a lista completa se estava fechada (com `indiceAtivo = 0`), ou avança ciclicamente em `opcoesVisiveis`.
   - `ArrowUp`: recua ciclicamente em `opcoesVisiveis` quando aberto.
   - `Enter`: se aberto e `indiceAtivo >= 0`, `e.preventDefault()` e seleciona `opcoesVisiveis[indiceAtivo]`.
   - `Escape`: se aberto, `e.preventDefault()` e fecha (`aberto = false`, `indiceAtivo = -1`).
   - `Tab`: fecha o menu (`aberto = false`, `indiceAtivo = -1`).
8. **Sem opção `"Outro"`** em nenhuma lista.
9. **CSS e layout da lista suspensa (`ComboboxEditavel.module.css`):**
   - A lista suspensa entra **no fluxo normal da página** (empurra o conteúdo abaixo ao abrir, **não sobrepõe** outros campos nem é cortada por `overflow`), com **altura máxima de cerca de 5 itens** (`max-height` equivalente, ex.: `220px`) e **rolagem interna** (`overflow-y: auto`).
   - Usa apenas `--ba-white`, `--ba-ink`, `--ba-line`, `--ba-gold`, `--ba-paper`, `--ba-muted-aa`, `--ba-danger`, `--ba-radius-field`, `--ba-speed`.
   - `min-height: 44px` no `<input>` e no botão `▾` (área de toque confortável no celular).

### 1.5 Bloco de UI de puxadores e formulários A, B e C

Novo subcomponente exclusivo do Projetista:
`src/steps/vendedor/StepPerguntasAmbienteVendedor/BlocoPuxadoresVendedor.jsx`

Props: `{ resp, erros = {}, onSet, onLimparErrosPuxadores }`.

Estrutura e comportamento:
1. **Pergunta gatilho:**
   - Usa `.campoFechado`, `.pergunta`, `.opcoes`, `.opcao`, `.opcaoAtiva` e `.erro` de `StepPerguntasAmbienteVendedor.module.css`.
   - Pergunta: `'Tem puxador?'`.
   - Apenas dois botões: `'Sim'` e `'Não'` (sem `"Não se aplica"`).
   - Ao clicar `'Sim'`:
     - Chama `onSet('temPuxador', 'Sim')` e `onLimparErrosPuxadores?.()`.
     - Se `!Array.isArray(resp.puxadores) || resp.puxadores.length === 0`, chama `onSet('puxadores', [{ modelo: '', cor: '' }])` (abre já o 1º puxador em branco; se já havia puxadores preservados, mantém intactos).
   - Ao clicar `'Não'`:
     - Chama `onSet('temPuxador', 'Não')` e `onLimparErrosPuxadores?.()` sem apagar `resp.puxadores` (preservação ao alternar `Sim` → `Não` → `Sim`).
   - Erro da pergunta gatilho: `{erros.temPuxador && <span className={`${styles.erro} erro-campo`}>{erros.temPuxador}</span>}`.
2. **Lista dinâmica (renderizada somente quando `resp.temPuxador === 'Sim'`):**
   - Envolvida em `<div className={styles.subperguntas}>` (mesmo recuo visual de balcões em `FormGrupoA.jsx:100`).
   - `{erros.puxadores && <span className={`${styles.erro} erro-campo`}>{erros.puxadores}</span>}`.
   - `const lista = Array.isArray(resp.puxadores) && resp.puxadores.length > 0 ? resp.puxadores : [{ modelo: '', cor: '' }]`.
   - Para cada `(puxador, index)` de `lista`:
     - Cabeçalho do card: `Puxador ${index + 1}` e, **somente quando `index > 0`**, botão circular `−` (`className={styles.btnRemoverPuxador}`, `aria-label={`Remover puxador ${index + 1}`}`) que remove o índice via `lista.filter((_, i) => i !== index)` e chama `onLimparErrosPuxadores?.()`. O 1º puxador (`index === 0`) **não** tem botão `−`.
     - Campo **Modelo**: `<label htmlFor={...}>Modelo</label>` + `<ComboboxEditavel value={puxador.modelo || ''} opcoes={MODELOS_PUXADOR} ... />` + `{erros[`puxador_${index}_modelo`] && <span className={`${styles.erro} erro-campo`}>{erros[`puxador_${index}_modelo`]}</span>}`.
       - Ao alterar o modelo: calcula `const atualizado = resolverAlteracaoModelo(puxador.modelo, puxador.cor, novoModelo)` e grava via `onSet('puxadores', lista.map((item, i) => (i === index ? atualizado : item)))`.
     - Campo **Cor**: `const opcoesCor = obterSugestoesCor(puxador.modelo)` + `<label htmlFor={...}>Cor</label>` + `<ComboboxEditavel value={puxador.cor || ''} opcoes={opcoesCor} ... />` + `{erros[`puxador_${index}_cor`] && <span className={`${styles.erro} erro-campo`}>{erros[`puxador_${index}_cor`]}</span>}`.
       - Ao alterar a cor: grava via `onSet('puxadores', lista.map((item, i) => (i === index ? { ...item, cor: novaCor } : item)))`.
   - Abaixo dos itens: botão `<button type="button" className={styles.btnAdicionarPuxador} onClick={adicionarPuxador}>+ Adicionar puxador</button>`, que grava `[...lista, { modelo: '', cor: '' }]`.

**Limpeza pontual de erros em `StepPerguntasAmbienteVendedor.jsx`:**
- Definir `limparErrosPuxadores` usando atualização funcional `setErros((prev) => ...)`, removendo **somente** `'puxadores'` e chaves que começam com `'puxador_'` (nunca removendo erros de outros campos como alturas, balcões, fechamento, caixaria, dobradiças ou corrediças). Se não houver nenhuma dessas chaves em `prev`, retornar `prev` sem alterar o estado.
- Passar `onLimparErrosPuxadores={limparErrosPuxadores}` em `<FormComponent ... />` (`:74`).
- Os demais comportamentos de `StepPerguntasAmbienteVendedor.jsx` (erros recalculados somente ao clicar em `"Avançar"`, rolagem ao primeiro erro no `validar()`, limpeza ao trocar de ambiente) permanecem iguais.

**Integração nos três formulários (último item dentro de `"Acabamento e ferragens"`):**
- `FormGrupoA.jsx`: aceita prop `onLimparErrosPuxadores` e, dentro de `<FieldGroup titulo="Acabamento e ferragens">` (`:112-117`), **após** `campoFechado('corredicas', ...)`, renderiza `<BlocoPuxadoresVendedor resp={resp} erros={erros} onSet={set} onLimparErrosPuxadores={onLimparErrosPuxadores} />`.
- `FormGrupoB.jsx`: aceita prop `onLimparErrosPuxadores` e, dentro de `<FieldGroup titulo="Acabamento e ferragens">` (`:50-55`), **após** `campoFechado('fechamentoTeto', ...)`, renderiza `<BlocoPuxadoresVendedor resp={resp} erros={erros} onSet={set} onLimparErrosPuxadores={onLimparErrosPuxadores} />`.
- `FormGrupoC.jsx`: aceita prop `onLimparErrosPuxadores` e, dentro de `<FieldGroup titulo="Acabamento e ferragens">` (`:45-49`), **após** `campoFechado('corredicas', ...)`, renderiza `<BlocoPuxadoresVendedor resp={resp} erros={erros} onSet={set} onLimparErrosPuxadores={onLimparErrosPuxadores} />`.

**CSS (`StepPerguntasAmbienteVendedor.module.css` — exclusivo do Projetista):**
Acrescentar no final do arquivo as classes `.cardPuxador`, `.cabecalhoPuxador`, `.tituloPuxador`, `.btnRemoverPuxador` (botão circular 36×36px com `−` no estilo de `StepIdentificacaoVendedor.module.css:47-58`), `.camposPuxador`, `.campoPuxador` e `.btnAdicionarPuxador` (botão pílula no estilo de `StepIdentificacaoVendedor.module.css:60-71`), usando apenas tokens `--ba-*`.

### 1.6 Revisão e PDF do Projetista — `StepRevisaoVendedor.jsx` e `pdfVendedor.js`

Em ambos os arquivos:
1. Em `PERGUNTAS_POR_GRUPO` (`StepRevisaoVendedor.jsx:11-32` e `pdfVendedor.js:19-40`), acrescentar ao final de **cada um** dos grupos `A`, `B` e `C`:
   `{ campo: 'temPuxador', label: 'Puxadores', tipo: 'puxadores' }`.
2. Importar `descreverRespostaPuxadores` de `src/domain/puxadoresVendedor.js`.
3. Nos respectivos loops (`StepRevisaoVendedor.jsx:103-122` e `pdfVendedor.js:145-152`):
   - Quando `item.tipo === 'puxadores'`, chamar `descreverRespostaPuxadores(resp)`.
   - No `StepRevisaoVendedor.jsx:114-119`, alterar `<Fragment key={linha}>` para `<Fragment key={`${i}-${linha}`}>` (usando `linhas.map((linha, i) => ...)`), evitando chave duplicada se houver dois puxadores iguais no mesmo ambiente.
   - No `pdfVendedor.js:145-152`, passar `(item.label, texto, destaque, linhas)` para `escreverPergunta` (`:103-119`), reaproveitando o recuo `+5 mm` de `linhasExtras` (`:114-116`). Como `destaque` é sempre `false`, nenhuma cor de destaque é aplicada.
   - O bloco `"Observações do ambiente"` continua sendo impresso/exibido após o loop, mantendo `Puxadores` sempre por último antes das observações.

### 1.7 Arquivos que o Spec NÃO altera

`schema.js`, `scoreEngine.js`, `ccBuilder.js`, `pdf.js`, `importacaoPdf.js`, `FormProvider.jsx`, `FormProviderFutura.jsx`, `StepRevisaoFutura.jsx`, `StepRevisaoVendedor.module.css`, `StepIdentificacaoVendedor.jsx`, `StepIdentificacaoVendedor.module.css`, `ambientes.js`, `gruposPerguntasVendedor.js`, `respostaBalcaoVendedor.js`, `index.css`, `package.json`, `testes/auxiliares/construtores.js`, `testes/I_importacao_pdf.test.js`, todo o Perfil Cliente e toda a Venda futura.

---

## 2. Arquivos afetados (resumo)

| Arquivo | Efeito |
|---|---|
| `src/domain/schemaVendedor.js` | Acrescenta `temPuxador: null` e `puxadores: []` nos grupos A, B e C, antes de `observacoes` (1.1) |
| `src/context/FormProviderVendedor.jsx` | Substitui cópia rasa de `defaultsPorGrupo` por cópia simples explícita (`{ ...defaults, puxadores: [] }` + clone dos itens salvos) em `:31` e `:131` para isolar `puxadores` entre ambientes sem depender de `structuredClone` (0.1, 1.1) |
| `src/domain/puxadoresVendedor.js` | **novo** — catálogo dos 8 modelos, paletas de cor, normalização sem acentos, autopreenchimento/limpeza de `"Sem cor"` e `descreverRespostaPuxadores` (1.2) |
| `src/domain/validacaoVendedor.js` | Passa a validar `temPuxador` (`MSG_RESPONDA_SIM_NAO`) e cada item de `puxadores` quando `Sim` nos grupos A, B e C (1.3) |
| `src/components/ComboboxEditavel/ComboboxEditavel.jsx` | **novo** — combobox editável em React puro com seleção total ao focar, setinha `▾` condicional, teclado e toque mobile (1.4) |
| `src/components/ComboboxEditavel/ComboboxEditavel.module.css` | **novo** — estilos do combobox usando apenas tokens `--ba-*`, lista no fluxo da página com ~5 itens e rolagem interna (1.4) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.jsx` | Passa callback `onLimparErrosPuxadores` que apaga apenas `puxadores` e `puxador_*`, mantendo demais erros recalculados só no `Avançar` (0.4, 1.5) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/BlocoPuxadoresVendedor.jsx` | **novo** — pergunta *"Tem puxador?"* (`Sim`/`Não`), lista dinâmica, chamada de `onLimparErrosPuxadores` ao remover/alternar `temPuxador` e integração `ComboboxEditavel` × `puxadoresVendedor` (1.5) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoA.jsx` | Recebe e repassa `onLimparErrosPuxadores` e insere `BlocoPuxadoresVendedor` por último em `"Acabamento e ferragens"` (após `Corrediças`) (1.5) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoB.jsx` | Recebe e repassa `onLimparErrosPuxadores` e insere `BlocoPuxadoresVendedor` por último em `"Acabamento e ferragens"` (após `Fechamento até o teto`) (1.5) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/FormGrupoC.jsx` | Recebe e repassa `onLimparErrosPuxadores` e insere `BlocoPuxadoresVendedor` por último em `"Acabamento e ferragens"` (após `Corrediças`) (1.5) |
| `src/steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.module.css` | Acrescenta estilos do card de puxador, botão `−` e `+ Adicionar puxador` no fim do arquivo (1.5) |
| `src/steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.jsx` | Acrescenta `Puxadores` por último nos grupos A, B e C via `descreverRespostaPuxadores` e ajusta `key` em `linhas` (1.6) |
| `src/services/pdfVendedor.js` | Acrescenta `Puxadores` por último nos grupos A, B e C via `descreverRespostaPuxadores` e `linhasExtras` (1.6) |
| `testes/V_puxadores.test.js` | **novo** — testes puros do catálogo, filtro, cor dependente, `"Sem cor"` e formatação Revisão/PDF (3.1) |
| `testes/V_validacao_projetista.test.js` | Atualiza `BASE_A` e `T17`; acrescenta casos novos de validação de puxadores nos grupos A, B e C (3.1, 3.2) |
| `testes/V_pdf_projetista.test.js` | Atualiza `T-V03`, `T-V04`, `T-V05`, `T-V06` e `T8`; acrescenta casos novos de PDF de puxadores; `T9` mantido intacto (3.1, 3.2) |

---

## 3. Testes

### 3.1 Testes novos

Regras:
- Todo esperado sai do critério do PRD e é escrito por extenso no próprio teste (nunca importado de lista, constante ou regex do `src/`, nem "o que o código devolver").
- Dados 100% fictícios (contratos e números na série 9xxx: `TA9001`, `9001`, `9002`, etc.).
- Sem rede, e-mail, navegador ou chamada paga; nenhum teste usa LLM.
- Os testes de PDF usam `jsPDF` real com captura em memória (`testes/auxiliares/captura_jspdf.js`) e `carregarPdf` empacota em pasta temporária (`testes/auxiliares/carregar_pdf.js`), sem tocar em pasta real do sistema.
- Os testes puros e de validação (`V_puxadores.test.js`, `V_validacao_projetista.test.js`) não tocam em disco.

**Arquivo novo `testes/V_puxadores.test.js`** (importa apenas funções puras e `MODELOS_PUXADOR` de `src/domain/puxadoresVendedor.js`, comparando sempre contra strings literais escritas por extenso no teste):

- **T1 (`TP-01`) — Sugestões de Modelo na ordem exata.** Cobre CA-06 (parte regra).
  - Entrada: leitura da lista `MODELOS_PUXADOR` e chamada `filtrarSugestoesPuxador(MODELOS_PUXADOR, '')`.
  - Esperado: exatamente os 8 itens nesta ordem exata: `'Roma'`, `'Madri 150mm'`, `'Madri 270mm'`, `'Berlin'`, `'Paris'`, `'Perfil Cava'`, `'Perfil Gola Fit'`, `'Florença'`. Não contém `'Outro'`.

- **T2 (`TP-02`) — Filtro de autocomplete sem acentos, caixa e com texto vazio.** Cobre CA-07 (parte filtro).
  - Entrada: chamadas a `filtrarSugestoesPuxador` sobre a lista dos 8 modelos e sobre paletas de cor com os termos: (a) `'mad'`; (b) `'florenca'` (sem acento e minúsculo); (c) `'CAVA'` (maiúsculo); (d) `'aluminio'` sobre `['Fendi', 'Alumínio', 'Griggio']`; (e) `'aco'` sobre `['Antique', 'Aço', 'Cobre']`; (f) `'   '` (só espaços); (g) `'Zen Cup'` (modelo fora da lista).
  - Esperado: (a) `['Madri 150mm', 'Madri 270mm']`; (b) `['Florença']`; (c) `['Perfil Cava']`; (d) `['Alumínio']`; (e) `['Aço']`; (f) todas as 8 sugestões na ordem original; (g) `[]` (lista vazia no filtro, permitindo digitação livre).

- **T3 (`TP-03`) — Sugestões dependentes de Cor por modelo e lista vazia para desconhecido.** Cobre CA-08 (parte regra).
  - Entrada: `obterSugestoesCor(modelo)` para `'Roma'`, `'Berlin'`, `'Paris'`, `'Perfil Cava'`, `'Perfil Gola Fit'`, `'roma'` (minúsculo), `'Madri 150mm'`, `'Madri 270mm'`, `'Florença'`, `'Zen Cup'`, `'Madri'` (sem medida) e `''` (vazio).
  - Esperado:
    - `'Roma'` e `'roma'` → `['Fendi', 'Alumínio', 'Griggio']`;
    - `'Berlin'` → `['Antique', 'Aço', 'Cobre']`;
    - `'Paris'` → `['Antique']` (apenas `Antique`);
    - `'Perfil Cava'` → `['Fendi', 'Alumínio']`;
    - `'Perfil Gola Fit'` → `['Alumínio', 'Grafito']`;
    - `'Madri 150mm'`, `'Madri 270mm'`, `'Florença'`, `'Zen Cup'`, `'Madri'` e `''` → `[]` (sem sugestões extras / sem setinha `▾`).

- **T4 (`TP-04`) — Autopreenchimento de `"Sem cor"` para modelos de cor única (tolerante a acentos, caixa e espaços).** Cobre CA-09 (parte regra).
  - Entrada: `resolverAlteracaoModelo('', '', novoModelo)` para `'Madri 150mm'`, `'Madri 270mm'`, `'Florença'`, `'florenca'`, `'MADRI 150MM'` e `'  Madri 270mm  '`; e também transição de `'Roma'` (com Cor `'Fendi'`) para `'Madri 150mm'`.
  - Esperado: em todos os casos o objeto retornado tem `cor: 'Sem cor'` e `modelo` igual ao valor informado.

- **T5 (`TP-05`) — Troca de modelo de cor única limpa `"Sem cor"` e preserva cor manual.** Cobre CA-10 (parte regra).
  - Entrada: `resolverAlteracaoModelo(modeloAnterior, corAtual, novoModelo)` para:
    - (a) `('Madri 150mm', 'Sem cor', 'Roma')`;
    - (b) `('Madri 270mm', 'Sem cor', 'Zen Cup')`;
    - (c) `('Florença', 'Sem cor', '')`;
    - (d) `('florenca', '  sem cor ', 'Paris')`;
    - (e) `('Madri 150mm', 'Preto', 'Roma')` (cor digitada manualmente pelo usuário);
    - (f) `('Madri 150mm', 'Preto', 'Madri 270mm')` (troca entre modelos de cor única mantendo cor manual);
    - (g) `('Roma', 'Fendi', 'Berlin')` (troca entre modelos com paleta).
  - Esperado: (a) `{ modelo: 'Roma', cor: '' }`; (b) `{ modelo: 'Zen Cup', cor: '' }`; (c) `{ modelo: '', cor: '' }`; (d) `{ modelo: 'Paris', cor: '' }`; (e) `{ modelo: 'Roma', cor: 'Preto' }`; (f) `{ modelo: 'Madri 270mm', cor: 'Preto' }`; (g) `{ modelo: 'Berlin', cor: 'Fendi' }`.

- **T13 (`TP-13`) — Formatação compartilhada para `Não` (inclusive com puxadores preservados no estado).** Cobre CA-19 (parte lógica compartilhada Revisão/PDF).
  - Entrada: `descreverRespostaPuxadores({ temPuxador: 'Não' })` e `descreverRespostaPuxadores({ temPuxador: 'Não', puxadores: [{ modelo: 'Roma', cor: 'Fendi' }] })`.
  - Esperado: em ambos os casos, `{ texto: 'Não', destaque: false, linhas: [] }`.

- **T15 (`TP-15`) — Formatação compartilhada para não respondido, 1 puxador e múltiplos puxadores.** Cobre CA-20 e CA-21 (parte lógica compartilhada Revisão/PDF).
  - Entrada: `descreverRespostaPuxadores(...)` para:
    - (a) `{}` e `{ temPuxador: null }` e `{ temPuxador: '' }`;
    - (b) `{ temPuxador: 'Sim', puxadores: [{ modelo: 'Roma', cor: 'Fendi' }] }`;
    - (c) `{ temPuxador: 'Sim', puxadores: [{ modelo: 'Roma', cor: 'Fendi' }, { modelo: 'Madri 150mm', cor: 'Sem cor' }] }`;
    - (d) `{ temPuxador: 'Sim', puxadores: [{ modelo: '  Zen Cup ', cor: ' Gold  ' }] }`.
  - Esperado:
    - (a) `{ texto: '—', destaque: false, linhas: [] }`;
    - (b) `{ texto: 'Sim', destaque: false, linhas: ['• Roma — Fendi'] }`;
    - (c) `{ texto: 'Sim', destaque: false, linhas: ['• Roma — Fendi', '• Madri 150mm — Sem cor'] }`;
    - (d) `{ texto: 'Sim', destaque: false, linhas: ['• Zen Cup — Gold'] }`.

**Arquivo `testes/V_validacao_projetista.test.js` (casos novos, acrescentados após `T10`–`T20`):**

Base válida do grupo A (`BASE_A`, atualizada com `temPuxador: 'Não'`) e bases válidas completas de B (`caixaria: 'MDF'`, `dobradicas: 'Amortecimento'`, `corredicas: 'Ocultas'`, `fechamentoTeto: 'SIM'`) e C (`caixaria: 'MDF'`, `dobradicas: 'Amortecimento'`, `corredicas: 'Ocultas'`).

- **T6 (`TP-06`) — Pergunta *"Tem puxador?"* sem resposta bloqueia nos grupos A, B e C.** Cobre CA-12 e CA-21 (parte validação ao retornar ao ambiente).
  - Entrada: respostas válidas completas de A (com `tipoBalcao: 'Convencionais'`), B e C com `temPuxador: null` e também com `temPuxador` ausente (`undefined`).
  - Esperado: em todos os três grupos e nos dois estados (`null` e ausente), retorna exatamente `{ temPuxador: 'Responda sim ou não' }`, sem erro nos demais campos.

- **T7 (`TP-07`) — *"Tem puxador?"* = `Não` libera o avanço nos grupos A, B e C, mesmo com lista preservada.** Cobre CA-13.
  - Entrada: ambientes válidos de A, B e C com `temPuxador: 'Não'` e (a) `puxadores: []`; (b) `puxadores: [{ modelo: '', cor: '' }]` (incompleto oculto); (c) `puxadores: [{ modelo: 'Roma', cor: 'Fendi' }]` (preservado de um `Sim` anterior).
  - Esperado: `{}` (vazio, sem erro) em todas as combinações.

- **T8 (`TP-08`) — *"Tem puxador?"* = `Sim` valida lista vazia e cada `modelo` e `cor` por índice.** Cobre CA-14.
  - Entrada (testada em A, B ou C com demais campos válidos):
    - (a) `temPuxador: 'Sim'`, `puxadores: []` (e também `puxadores` ausente);
    - (b) `temPuxador: 'Sim'`, `puxadores: [{ modelo: '', cor: '' }]`;
    - (c) `temPuxador: 'Sim'`, `puxadores: [{ modelo: 'Roma', cor: 'Fendi' }, { modelo: 'Berlin', cor: '   ' }]` (2º item com Cor só espaços);
    - (d) `temPuxador: 'Sim'`, `puxadores: [{ modelo: '   ', cor: 'Fendi' }, { modelo: '', cor: '' }]`;
    - (e) remoção do 2º item com erro do caso (c), restando `[{ modelo: 'Roma', cor: 'Fendi' }]`.
  - Esperado:
    - (a) `{ puxadores: 'Adicione pelo menos um puxador' }`;
    - (b) `{ puxador_0_modelo: 'Informe o modelo', puxador_0_cor: 'Informe a cor' }`;
    - (c) `{ puxador_1_cor: 'Informe a cor' }` (nenhum erro no 1º item nem em `puxador_1_modelo`);
    - (d) `{ puxador_0_modelo: 'Informe o modelo', puxador_1_modelo: 'Informe o modelo', puxador_1_cor: 'Informe a cor' }`;
    - (e) `{}` (avança sem erro).

- **T9 (`TP-09`) — Modelo de cor única com `"Sem cor"` autopreenchido avança.** Cobre CA-15.
  - Entrada: ambiente válido com `temPuxador: 'Sim'` e `puxadores` contendo `'Madri 150mm'`, `'Madri 270mm'` e `'Florença'` todos com `cor: 'Sem cor'`.
  - Esperado: `{}` (avança sem erro).

- **T10 (`TP-10`) — Trocar modelo de cor única limpa `"Sem cor"` e volta a exigir Cor.** Cobre CA-16.
  - Entrada: simular a troca com `resolverAlteracaoModelo('Madri 150mm', 'Sem cor', 'Roma')` e com `resolverAlteracaoModelo('Madri 150mm', 'Sem cor', 'Zen Cup')` (e também com `''`), gravar o item resultante em `puxadores` de um ambiente válido com `temPuxador: 'Sim'` e executar `validarRespostasGrupo('A', ...)`.
  - Esperado: para `'Roma'` e `'Zen Cup'`, retorna exatamente `{ puxador_0_cor: 'Informe a cor' }`; para `''`, retorna `{ puxador_0_modelo: 'Informe o modelo', puxador_0_cor: 'Informe a cor' }`.

- **T11 (`TP-11`) — Modelo livre digitado + Cor livre digitada avançam.** Cobre CA-17.
  - Entrada: ambiente válido de grupo B com `temPuxador: 'Sim'` e `puxadores: [{ modelo: 'Zen Cup', cor: 'Gold' }]`.
  - Esperado: `{}` (avança sem erro).

- **T12 (`TP-12`) — Regras existentes intactas junto com puxadores.** Cobre CA-18.
  - Entrada: grupo A com `alturaBalcao_mm: 0`, `tipoBalcao: 'Editados'`, `balcaoAlturaForaPadrao: null`, `balcaoProfundidadeForaPadrao: 'Não'` e `temPuxador: null`.
  - Esperado: retorna simultaneamente `{ alturaBalcao_mm: 'Responda esta pergunta ou marque "Não se aplica"', balcaoAlturaForaPadrao: 'Responda sim ou não', temPuxador: 'Responda sim ou não' }` (nenhuma regra antiga suprimida ou alterada).

**Arquivo `testes/V_pdf_projetista.test.js` (casos novos, acrescentados após `T9`):**

Todos os casos usam `pdf.projetista(montarEstadoProjetista([...], ['9001']))` e leitura com `sequencia`, `ausencia` e `secao` de `testes/auxiliares/leitura_pdf.js`.

- **T14 (`TP-14`) — PDF dos grupos A, B e C com `Tem puxador?` = `Não` (inclusive com lista preservada).** Cobre CA-19 (parte PDF).
  - Entrada: PDF com 3 ambientes: Cozinha (`grupo: 'A'`, `temPuxador: 'Não'`, `puxadores: [{ modelo: 'Roma', cor: 'Fendi' }]`), Dormitório Casal (`grupo: 'B'`, `temPuxador: 'Não'`), Home / Sala (`grupo: 'C'`, `temPuxador: 'Não'`).
  - Esperado: em cada seção (`secao`), `Puxadores` seguido de `Resposta: Não`; em todo o PDF, ausência de `'Roma'` e de `'• Roma — Fendi'`.

- **T16 (`TP-16`) — PDF com 1 puxador e com múltiplos puxadores.** Cobre CA-20 (parte PDF).
  - Entrada: Cozinha (`grupo: 'A'`) com `temPuxador: 'Sim'` e `puxadores: [{ modelo: 'Roma', cor: 'Fendi' }, { modelo: 'Madri 150mm', cor: 'Sem cor' }]`; e outro PDF com Dormitório Casal (`grupo: 'B'`) com `temPuxador: 'Sim'` e `puxadores: [{ modelo: 'Zen Cup', cor: 'Gold' }]`.
  - Esperado:
    - no 1º PDF: em sequência `'Corrediças'`, `'Resposta: —'`, `'Puxadores'`, `'Resposta: Sim'`, `'• Roma — Fendi'`, `'• Madri 150mm — Sem cor'`;
    - no 2º PDF: em sequência `'Fechamento até o teto'`, `'Resposta: —'`, `'Puxadores'`, `'Resposta: Sim'`, `'• Zen Cup — Gold'`.

- **T17 (`TP-17`) — Ordem preservada e `Puxadores` antes de `Observações do ambiente` nos grupos A, B e C.** Cobre CA-22 (parte PDF).
  - Entrada: um único PDF com:
    - Cozinha (`grupo: 'A'`, `temPuxador: 'Sim'`, `puxadores: [{ modelo: 'Roma', cor: 'Fendi' }]`, `observacoes: 'Obs ambiente 9001'`),
    - Dormitório Casal (`grupo: 'B'`, `temPuxador: 'Sim'`, `puxadores: [{ modelo: 'Berlin', cor: 'Aço' }]`, `observacoes: 'Obs ambiente 9001'`),
    - Home / Sala (`grupo: 'C'`, `temPuxador: 'Sim'`, `puxadores: [{ modelo: 'Perfil Cava', cor: 'Alumínio' }]`, `observacoes: 'Obs ambiente 9001'`).
  - Esperado: usando `secao` para cada um dos 3 ambientes:
    - em `Cozinha / Área de Serviço`: em sequência `'Corrediças'`, `'Resposta: —'`, `'Puxadores'`, `'Resposta: Sim'`, `'• Roma — Fendi'`, `'Observações do ambiente'`, `'Resposta: Obs ambiente 9001'`;
    - em `Dormitório Casal`: em sequência `'Fechamento até o teto'`, `'Resposta: —'`, `'Puxadores'`, `'Resposta: Sim'`, `'• Berlin — Aço'`, `'Observações do ambiente'`, `'Resposta: Obs ambiente 9001'`;
    - em `Home / Sala`: em sequência `'Corrediças'`, `'Resposta: —'`, `'Puxadores'`, `'Resposta: Sim'`, `'• Perfil Cava — Alumínio'`, `'Observações do ambiente'`, `'Resposta: Obs ambiente 9001'`.

**Conferência manual (não vira teste; motivo entre parênteses):**

- **CA-01, CA-02, CA-03, CA-04, CA-05 [Manual]** — exibição de *"Tem puxador?"* por último em *"Acabamento e ferragens"* nos grupos A, B e C sem `"Não se aplica"`, abertura do 1º puxador sem botão `−`, `+ Adicionar puxador`, botão `−` a partir do 2º item, independência entre ambientes e preservação na tela ao alternar `Sim` → `Não` → `Sim` (componentes React sem suíte de DOM/navegador na repo).
- **Remoção de puxador com erro de validação [Manual]** — com `Sim` e 3 puxadores, deixar a Cor do 2º vazia, clicar `Avançar`, remover o 2º puxador com o botão `−`; esperado: nenhuma mensagem de erro aparece no puxador que passou a ser o 2º e, ao clicar `Avançar` de novo, avança sem erro (componente React sem suíte de DOM/navegador na repo).
- **CA-06, CA-07, CA-08, CA-09, CA-10 (parte UI) e CA-11 [Manual]** — interação tátil/visual do `ComboboxEditavel` no desktop e em viewport mobile no navegador: seleção do texto inteiro ao clicar/focar em campo preenchido, abertura da lista completa sem filtrar antes de digitar, setinha `▾` exibida apenas quando há sugestões, alternância de abertura/fechamento na setinha, toque em sugestão sem falhar por `onBlur`, scroll da lista no celular, editabilidade do `"Sem cor"`, navegação por teclado (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`) e ausência de quebra de layout (exige navegador/toque real).
- **CA-12 (parte rolagem) [Manual]** — rolagem automática (`scrollToFirstError`) até o erro de *"Tem puxador?"* ou de `Modelo`/`Cor` no `ComboboxEditavel` (exige navegador).
- **CA-19, CA-20, CA-21 (parte Revisão e `localStorage` real) [Manual]** — conferência visual de `StepRevisaoVendedor` exibindo os mesmos textos do PDF (sem destaque vermelho), abertura de rascunho antigo real gravado em `byarabi_checklist_vendedor` sem crash (`Puxadores: —` na Revisão/PDF e exigência ao voltar ao ambiente) e conferência visual do PDF aberto (alinhamento de `• <Modelo> — <Cor>`, travessão e marcador `•`, ausência de destaque colorido).
- **CA-23 [Manual]** — isolamento visual e funcional do Perfil Cliente (`/identificacao` até `/sucesso`), Venda futura (`/futura/*`) e `/projetista` (exige navegador).

### 3.2 Testes existentes afetados

- `testes/V_pdf_projetista.test.js::T-V03` — antes: 14 linhas depois de `Cozinha / Área de Serviço` (terminando com `Corrediças` e `Resposta: —`) → depois: 16 linhas depois de `Cozinha / Área de Serviço`, acrescentando `Puxadores` e `Resposta: —` ao final.
- `testes/V_pdf_projetista.test.js::T-V04` — antes: 8 linhas depois de `Dormitório Casal` (terminando com `Fechamento até o teto` e `Resposta: —`) → depois: 10 linhas depois de `Dormitório Casal`, acrescentando `Puxadores` e `Resposta: —` ao final.
- `testes/V_pdf_projetista.test.js::T-V05` — antes: 6 linhas depois de `Home / Sala` (terminando com `Corrediças` e `Resposta: —`) → depois: 8 linhas depois de `Home / Sala`, acrescentando `Puxadores` e `Resposta: —` ao final.
- `testes/V_pdf_projetista.test.js::T-V06` — antes: lista exata de 7 strings `Resposta: ...` no grupo A → depois: lista exata de 8 strings `Resposta: ...`, acrescentando `'Resposta: —'` (referente a `Puxadores`) ao final; segunda verificação (`fechamentoTeto: 'SIM'`) permanece igual.
- `testes/V_pdf_projetista.test.js::T8` — antes: 17 linhas depois de `Cozinha / Área de Serviço` (com `Corrediças` / `Resposta: —` logo antes de `Observações do ambiente`) → depois: 19 linhas depois de `Cozinha / Área de Serviço`, acrescentando `'Puxadores'` e `'Resposta: —'` entre `Corrediças` / `Resposta: —` e `'Observações do ambiente'`.
- `testes/V_validacao_projetista.test.js::BASE_A (usada em T10–T16, T18, T20)` — antes: objeto `BASE_A` sem `temPuxador` → depois: `BASE_A` passa a incluir `temPuxador: 'Não'` para que `T10`–`T16`, `T18` e `T20` continuem isolando exatamente as regras de balcões e alturas sem alterar suas asserções.
- `testes/V_validacao_projetista.test.js::T17` — antes: passa apenas `caixaria`, `dobradicas`, `corredicas` (e `fechamentoTeto` em B) esperando `{}` → depois: inclui `temPuxador: 'Não'` nas entradas válidas de B e C esperando `{}`, mantendo a confirmação de que B e C não exigem campos de balcões/alturas.

Testes existentes **não afetados** (não podem ser alterados na implementação):
- `testes/V_pdf_projetista.test.js::T9` (`:325-347`): continua passando sem alteração porque nos 7 casos de balcões `temPuxador` permanece `null` (`Resposta: —`, não `Resposta: Não`).
- `testes/V_pdf_projetista.test.js::T-V01`, `T-V02`, `T-V07`, `T-V08`, `T-V09`, `T-V10`, `T1`–`T7`.
- `testes/V_resposta_balcao.test.js::T19`.
- `testes/I_importacao_pdf.test.js::T5` e todos os demais arquivos em `testes/`.

---

## 4. Plano de Execução

**Regra de segurança da ordem:** a obrigatoriedade em `src/domain/validacaoVendedor.js` (Task 5) só entra **depois** que os campos já existirem na tela dos três formulários (Task 4), evitando qualquer estado intermediário onde `StepPerguntasAmbienteVendedor.jsx` bloqueie o avanço com erro em pergunta inexistente na interface.

- [x] **Task 1 — Schema e isolamento simples de estado.** Em `src/domain/schemaVendedor.js`, acrescentar `temPuxador: null` e `puxadores: []` antes de `observacoes` em `defaultsPorGrupo.A`, `defaultsPorGrupo.B` e `defaultsPorGrupo.C`. Em `src/context/FormProviderVendedor.jsx`, substituir a cópia rasa de `defaultsPorGrupo` por cópia simples explícita (`{ ...defaultsPorGrupo[...], puxadores: [] }` e clone dos itens salvos de `puxadores`) em `normalizarEstadoSalvo` (`:31`) e `SET_AMBIENTE_QUANTIDADE_VENDEDOR` (`:131`), sem usar `structuredClone` (que não existe em `src/` e exigiria iOS 15.4+). Validação: `npm test` verde (nenhum teste alterado ainda) e `npm run build` compila.
- [x] **Task 2 — Domínio puro de puxadores + testes unitários.** Criar `src/domain/puxadoresVendedor.js` (Seção 1.2) com `MODELOS_PUXADOR`, `TEXTO_SEM_COR`, `normalizarTextoPuxador`, `filtrarSugestoesPuxador`, `ehModeloCorUnica`, `ehSemCor`, `obterSugestoesCor`, `resolverAlteracaoModelo` e `descreverRespostaPuxadores`. Criar `testes/V_puxadores.test.js` com os testes **T1 (`TP-01`), T2 (`TP-02`), T3 (`TP-03`), T4 (`TP-04`), T5 (`TP-05`), T13 (`TP-13`) e T15 (`TP-15`)**, todos com esperados escritos por extenso a partir do PRD. Validação: `npm test` — todos verdes.
- [x] **Task 3 — Componente `ComboboxEditavel` em React puro.** Criar `src/components/ComboboxEditavel/ComboboxEditavel.jsx` e `ComboboxEditavel.module.css` (Seção 1.4), sem dependências externas, sem `<datalist>`, com lista no fluxo da página (altura máxima de ~5 itens e rolagem interna) e usando apenas tokens `--ba-*` de `src/index.css`. Validação: `npm run build` compila sem erros.
- [x] **Task 4 — CSS e interface nos formulários A, B e C (e limpeza de erros de puxador).** Acrescentar ao fim de `StepPerguntasAmbienteVendedor.module.css` as classes da Seção 1.5. Criar `src/steps/vendedor/StepPerguntasAmbienteVendedor/BlocoPuxadoresVendedor.jsx` (Seção 1.5). Em `StepPerguntasAmbienteVendedor.jsx`, passar a callback `onLimparErrosPuxadores` (que apaga apenas `puxadores` e `puxador_*`, mantendo erros dos demais campos recalculados somente no `Avançar`) via `FormGrupoA.jsx`, `FormGrupoB.jsx` e `FormGrupoC.jsx` até `BlocoPuxadoresVendedor.jsx` (disparada ao remover puxador e ao alternar `temPuxador`). Inserir `<BlocoPuxadoresVendedor />` por último dentro de `"Acabamento e ferragens"` em `FormGrupoA.jsx`, `FormGrupoB.jsx` e `FormGrupoC.jsx` (mantendo todas as perguntas existentes intactas). Validação: `npm run build` compila e conferência rápida no `npm run dev` (a pergunta aparece e os campos funcionam antes de ligar a validação).
- [x] **Task 5 — Regras de validação + testes de validação.** Atualizar `src/domain/validacaoVendedor.js` (Seção 1.3) para exigir `temPuxador` (`MSG_RESPONDA_SIM_NAO`) e validar `puxadores` quando `Sim` nos grupos A, B e C. Em `testes/V_validacao_projetista.test.js`, atualizar `BASE_A` e `T17` (Seção 3.2) e acrescentar **T6 (`TP-06`) a T12 (`TP-12`)**. Validação: `npm test` — todos verdes (incluindo `T10`–`T20` de balcões).
- [x] **Task 6 — PDF do Projetista + testes de PDF.** Em `src/services/pdfVendedor.js`, acrescentar `{ campo: 'temPuxador', label: 'Puxadores', tipo: 'puxadores' }` por último nos grupos A, B e C usando `descreverRespostaPuxadores` e `linhasExtras` (Seção 1.6). Em `testes/V_pdf_projetista.test.js`, atualizar `T-V03`, `T-V04`, `T-V05`, `T-V06` e `T8` (Seção 3.2), manter `T9` intacto e acrescentar **T14 (`TP-14`), T16 (`TP-16`) e T17 (`TP-17`)**. Validação: `npm test` — todos verdes (0 falhas, 0 pulados).
- [x] **Task 7 — Tela de Revisão do Projetista.** Em `src/steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.jsx`, acrescentar `{ campo: 'temPuxador', label: 'Puxadores', tipo: 'puxadores' }` por último nos grupos A, B e C usando `descreverRespostaPuxadores` e atualizar a `key` de `linhas.map` para `${i}-${linha}` (Seção 1.6). Validação: `npm run build` compila e `npm test` verde.
- [x] **Task 8 — Conferência manual completa (`npm run dev`).** Conferir no desktop e em viewport mobile/celular: CA-01 a CA-05 (posição nos 3 grupos, sem `"Não se aplica"`, adicionar/remover, preservação `Sim` → `Não` → `Sim`, independência entre ambientes), caso de limpeza de erro ao remover puxador (com `Sim` e 3 puxadores, deixar a Cor do 2º vazia, clicar `Avançar`, remover o 2º puxador com o botão `−`; esperado: nenhuma mensagem de erro aparece no puxador que passou a ser o 2º e, ao clicar `Avançar` de novo, avança sem erro), CA-06 a CA-11 (seleção total ao focar, setinha `▾` condicional, lista no fluxo com ~5 itens e rolagem interna, filtro sem acento, `"Sem cor"` editável e limpeza ao trocar, toque sem falhar por `onBlur`, teclado), CA-12 (rolagem até o erro), CA-19 a CA-21 (Revisão, PDF aberto e rascunho antigo no `localStorage`) e CA-23 (isolamento de Cliente, `/futura/*` e `/projetista`).
- [x] **Task 9 — Rodar a suíte inteira e o build:** executar `npm test` (verde e sem teste pulado) e `npm run build` (sem erros); informar o resultado exato (passou/pulou/falhou), sugerir texto de commit na branch `feat/balcoes-convencionais-editados` (sem executar commit ou push) e perguntar ao Everton se o `CLAUDE.md` deve ser atualizado (ex.: citação de `puxadoresVendedor.js` em `src/domain/`).

Se um teste novo falhar porque o código faz diferente do esperado acima, não ajuste o esperado para ficar verde: registre em Desvios e pare. Se um teste existente que não está na lista de afetados falhar, corrija o código, não o teste.

---

## 5. Desvios

Registrados após teste manual do Everton no celular em 26/11/2026:

1. **Zerar a Cor em qualquer troca de Modelo (`src/domain/puxadoresVendedor.js::resolverAlteracaoModelo` e `testes/V_puxadores.test.js::TP-05`):**
   - *O que estava especificado (Seção 1.2):* `resolverAlteracaoModelo` limpava a Cor apenas quando o modelo anterior era de cor única (`Madri 150mm`, `Madri 270mm`, `Florença`) com `"Sem cor"`, preservando a Cor em trocas entre modelos com paleta ou com cor digitada manualmente (por exemplo, `Berlin` / `Aço` → `Roma` mantinha `Aço`).
   - *O que foi feito diferente:* sempre que o modelo muda de um valor não vazio para outro modelo diferente (comparando com `normalizarTextoPuxador`), a Cor agora é zerada para `''` (ou preenchida com `'Sem cor'` se o novo modelo for de cor única). A Cor só é preservada quando o modelo anterior estava vazio ou quando a edição mantém o mesmo modelo normalizado.
   - *Por quê:* no teste real, o Everton observou que trocar de `Berlin` (`Aço`) para `Roma` mantinha `Aço` mesmo não existindo `Roma Aço`, gerando risco de envio de combinação inválida para a liberação.

2. **Rolagem automática do `ComboboxEditavel` ao abrir a lista (`ComboboxEditavel.jsx` e `ComboboxEditavel.module.css`):**
   - *O que estava especificado (Seção 1.4):* o combobox abria a lista no fluxo da página sem mover o scroll, e o botão `▾` sempre chamava `inputRef.current?.focus()` ao alternar.
   - *O que foi feito diferente:* ao abrir a lista (`mostrarLista === true`), o componente executa `containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })` com `scroll-margin-top: 40px` no `.container` e um reforço após `300ms` (acompanhando a subida do teclado virtual no celular); além disso, `alternarLista` só foca o `<input>` quando `vaiAbrir` é `true`, evitando reabrir a lista pelo `onFocus` ao tocar na setinha para fechar.
   - *Por quê:* no celular, dependendo da posição do campo na tela, o teclado virtual cobria parte da lista suspensa e exibia apenas 2 opções (`Roma` e `Madri 150mm`) sem rolar até a área visível mostrada pelo Everton.
