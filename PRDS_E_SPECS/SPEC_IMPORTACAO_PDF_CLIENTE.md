# SPEC — Importação do PDF do Cliente

**Status:** Aprovado
**PRD de origem:** `PRDS_E_SPECS/PRD_IMPORTACAO_PDF_CLIENTE.md` (aprovado; atualização de 23/10/2026)
**Critério de decisão (Everton, 02/10/2026):** a forma mais simples de implementar.

---

## 1. Observações da leitura do código (código prevalece sobre o PRD)

Foram lidos `pdf.js`, `SelecaoPerfil.jsx` e `.module.css`, `FormProvider.jsx`, `App.jsx`, `Modal.jsx`, `schema.js`, os auxiliares de `testes/` e `P_pdf_cliente.test.js`. O PRD não foi alterado; as diferenças são registradas aqui.

1. **O botão "Projetista" já vai para `/projetista`** (`SelecaoPerfil.jsx:18`), porque a Venda Futura foi implementada depois do PRD. O PRD ainda descreve `/vendedor/identificacao`. Não afeta esta melhoria; o botão "Importar PDF" só entra abaixo dos dois botões existentes.
2. **Números de linha do PRD defasados.** O `doc.save` do Cliente está em `pdf.js:572` (PRD: 570). As rotas do Cliente em `App.jsx` estão em `:164-171`, dentro de `ClienteLayoutRoute`; `SelecaoPerfil` (`:162`) continua fora do `FormProvider`. A estrutura descrita pelo PRD bate.
3. **`pdf.js` não usa `setProperties` nem define autor, título ou palavras-chave** (busca em `src/` sem ocorrência). O jsPDF 2.5.2 grava só cinco propriedades no dicionário Info do PDF: `title`, `subject`, `author`, `keywords` e `creator` (`jspdf.es.js:1877-1883`), escritas como `/Keywords (...)` em texto puro, passando por `pdfEscape` (`:3649-3652`). Não há outro campo livre nesse dicionário. Por isso o Spec usa **`keywords`** (decisão 2.1).
4. **`normalizarEstadoSalvo` aceita estado sem `_meta`** (`FormProvider.jsx:38-41`: `...(estadoSalvo?._meta || {})`), responde ao ponto 2 do PRD. Ela também recompõe `respostasPorAmbiente` a partir de `defaultsPorFormType`. Não precisa ser exportada (decisão 2.3).
5. **O `confirmarRascunho` do `FormProvider` já faz tudo o que a importação precisa** (`:316-322`): normaliza, dispara `RESTORE_STATE`, libera a árvore e navega para a etapa gravada em `_meta.etapaAtual`. A importação reaproveita esse caminho.
6. **O que o PRD chama de "chave do rascunho do Projetista" (`byarabi_checklist_vendedor`) não é lido nem escrito pela importação**; só `byarabi_checklist_rascunho` (`FormProvider.jsx:7`).
7. **A captura de PDF da suíte não enxerga propriedades nem o conteúdo do arquivo.** `testes/auxiliares/captura_jspdf.js` troca só `text`, `splitTextToSize`, `link` e `save`; `save` apenas registra o nome. Para testar a gravação e a leitura com o arquivo real, os auxiliares precisam de um acréscimo (decisão 2.6). Nenhum teste existente usa `output` ou `setProperties` (busca em `testes/` sem ocorrência).
8. **Não existe jsdom nem testing-library** (`package.json`, confirmado na Venda Futura). Os testes novos cobrem o serviço de leitura/gravação e o PDF; o que depende de tela (botão, pergunta, mensagem, navegação) é conferência manual.
9. **Regra de "há rascunho" para a pergunta de confirmação: qualquer valor presente na chave `byarabi_checklist_rascunho`** (decisão do Everton: não tornar a regra mais precisa; nenhuma mudança de código). O valor presente pode ser (a) um preenchimento em andamento, (b) um preenchimento já concluído que permanece salvo (observação 10) ou, no pior caso, (c) um rascunho de formato antigo (`g2_temReforma`), que o `FormProvider` descartaria em silêncio de qualquer forma (`:297-299`). A pergunta de confirmação aparece sempre que houver valor salvo, inclusive para preenchimento concluído; o texto "Já existe um preenchimento em andamento..." é o do PRD e fica como está.
10. **"Iniciar novo preenchimento" não apaga a chave (OBSERVADO pelo Everton no navegador).** Depois de concluir a checklist e clicar em "Iniciar novo preenchimento", a chave `byarabi_checklist_rascunho` continua salva com o preenchimento completo (nem apagada, nem vazia). Isso contradiz a afirmação do PRD (divergência 4: a chave é apagada ao concluir); o código prevalece e o PRD não é alterado. Evidência de código: `StepSucesso.jsx:9-12` faz `dispatch({type:'RESET_STATE'})` e em seguida `navigate('/')`; o `localStorage.removeItem` está dentro do reducer (`FormProvider.jsx:276-279`, no case `RESET_STATE`; a referência `:260-263` do PRD está defasada). **Causa provável, NÃO confirmada:** a rota `/` fica fora do `FormProvider`, que sai de cena na mesma ação, e por isso o reducer provavelmente não chega a executar. Contraste útil: `descartarRascunho` (`FormProvider.jsx:325`) mantém o provider montado. O Everton considera o comportamento bom e quer mantê-lo: o rascunho só some no "Não, começar do zero" ou ao confirmar a substituição pela importação. Consequência para esta melhoria: logo depois de concluir um PDF, o rascunho existe, então importar um PDF sempre mostra a pergunta de substituição, a menos que a chave seja apagada manualmente.

---

## 2. Decisões dos "Pontos a definir no Spec"

### 2.1 Ponto 1 — Onde e como gravar os dados no PDF

- **Local:** a propriedade padrão **Keywords** do PDF (`doc.setProperties({ keywords: ... })`, chamada logo antes do `doc.save` de `gerarPdf`). É texto puro, fora do conteúdo impresso, sem compressão e sem criptografia (o projeto não liga nenhuma das duas; Risco 3 do PRD). Bibliotecas comuns de Python leem esse campo como metadado padrão (`pypdf`: `leitor.metadata.keywords`; `PyMuPDF`: `doc.metadata["keywords"]`).
- **Formato do valor:** `V1:` seguido do texto em Base64. O Base64 é de um JSON em UTF-8 (letras, números, `+`, `/`, `=`: nenhum caractere que o `pdfEscape` altere; acentos ficam protegidos, Risco 5). A marca `V1` fica no começo; o leitor Python separa no primeiro `:`, decodifica Base64, lê como UTF-8 e interpreta o JSON.
- **Conteúdo do JSON (só respostas):** exatamente quatro chaves: `identificacao`, `ambientesSelecionados`, `global`, `respostasPorAmbiente`. Sem `_meta`, score, CCs, avisos nem dados de navegação.
- **Codificação no app:** `TextEncoder` e `btoa` na gravação; `TextDecoder` e `atob` na leitura (existem no navegador e no Node usado nos testes). Sem biblioteca nova.
- **Sem compressão nesta versão.** O tamanho será medido (T10). Se o caso grande passar de 32.000 caracteres, **parar e registrar em Desvios**: aí entra a decisão de compactar (que mudaria o formato e exigiria falar com os leitores externos).
- **Comprovação em Python (CA-14):** feita na Task 9, por conferência manual, com um PDF real gerado pelo app. Só o Everton ou quem implementa roda o script; o resultado entra em Desvios (ou na própria seção, se der certo).

### 2.2 Ponto 4 — Nome e local do serviço novo

`src/services/importacaoPdf.js`, ao lado de `pdf.js`. Concentra ida e volta, para o formato ficar num só lugar. Duas funções públicas, sem tocar `src/domain/`:

- **`montarDadosPdf(state)`**: recebe o estado do Cliente e devolve a string `V1:...` (só as quatro chaves, copiadas do estado sem alterá-lo). `pdf.js` usa essa função.
- **`lerDadosPdf(bytes)`**: recebe os bytes do arquivo (`ArrayBuffer` ou `Uint8Array`). Procura no texto do arquivo (lido como Latin-1, sem decodificar o PDF) o trecho `/Keywords (V1:`, pega os caracteres Base64 seguintes até o primeiro caractere fora do alfabeto Base64, decodifica e valida. Devolve as quatro chaves ou **`null`** em qualquer falha. **Nunca lança exceção** (vazio, não-PDF, truncado, Base64 ou JSON inválido, versão diferente, estrutura errada).
- **Validação mínima ("estrutura esperada", Risco 7):** o JSON é um objeto com `identificacao` (objeto), `ambientesSelecionados` (lista), `global` (objeto) e `respostasPorAmbiente` (objeto). Qualquer outra coisa vira `null`. Chaves extras são ignoradas.
- **Limite de tamanho do arquivo escolhido:** 20 MB. Acima disso `SelecaoPerfil` nem lê o arquivo e mostra a mesma mensagem genérica (Risco 6, "arquivo enorme").

### 2.3 Ponto 2 — Como entregar o estado importado ao `FormProvider`

Duas peças pequenas, sem exportar nada novo:

1. **`SelecaoPerfil`** (fora do Provider) lê o arquivo, chama `lerDadosPdf`. Se der certo e não houver rascunho (ou o usuário confirmar a substituição), grava em `localStorage`, na chave `byarabi_checklist_rascunho`, o objeto `{ ...dados, _meta: { etapaAtual: 'revisao' } }` e navega para `/revisao` com `state: { importado: true }`.
2. **`FormProvider`**, no mesmo `useEffect` de montagem que hoje lê o rascunho: se existe valor salvo **e** a navegação veio com `importado: true`, restaura direto (mesmo caminho do `confirmarRascunho`, sem exibir "Continuar de onde parou?"). Sem a marca, tudo continua idêntico a hoje (CA-11). A restauração navega com `replace` para `/revisao`, o que apaga a marca: depois de atualizar a página (F5), o diálogo normal aparece e o "Sim" leva à revisão com os dados importados (CA-04).

A gravação no `localStorage` só acontece depois da pergunta de confirmação (Risco 2). Normalização, defaults de cada ambiente e `_meta` ausente são tratados pelo `normalizarEstadoSalvo` existente.

### 2.4 Ponto 3 — Textos dos botões da pergunta de confirmação

- Confirmar: **"Sim, importar"**.
- Cancelar: **"Cancelar"**.
- Texto da pergunta e da mensagem de erro: exatamente os do PRD.

A pergunta e a mensagem de erro usam o `Modal` existente (sem alterá-lo). O botão "Importar PDF" fica abaixo dos dois botões atuais, centralizado, com visual secundário.

### 2.5 Ponto 5 — Testes

Ver a seção "Testes".

### 2.6 Ajuste nos auxiliares de teste (necessário para os testes novos)

Mudança só em `testes/auxiliares/`, aditiva e sem apagar nada do que existe:

- `captura_jspdf.js`: além de registrar o nome, o `save` passa a guardar os **bytes reais do arquivo** (o documento é o jsPDF verdadeiro; só o `save` é trocado) e o `setProperties` passa a registrar o que recebe.
- `captura_registro.js` e o objeto devolvido por `lerCaptura`: ganham dois campos novos, `propriedades` e `bytes`, mantendo `eventos`, `textos`, `tabelas`, `links` e `saves` como estão.

Os testes existentes não leem os campos novos, então não mudam. Se algum quebrar por causa desse acréscimo, o erro é do auxiliar e deve ser corrigido nele.

---

## 3. Especificação por arquivo

### 3.1 `src/services/importacaoPdf.js` (novo)
Conforme 2.1 e 2.2. Funções puras, sem rede, sem `localStorage`, sem importar nada de `src/domain/`.

### 3.2 `src/services/pdf.js` (alterado)
Importa `montarDadosPdf` e chama `doc.setProperties({ keywords: montarDadosPdf(state) })` imediatamente antes do `doc.save` (`:572`). Nenhuma outra linha muda: capa, tabelas, textos e nome do arquivo (`Checklist_Cliente_{contrato}_{data}.pdf`) ficam como estão. Regra a registrar em comentário curto: não ligar compressão nem criptografia no `jsPDF` sem rever a leitura (Risco 3).

### 3.3 `src/screens/SelecaoPerfil/SelecaoPerfil.jsx` (alterado)
- Botão **"Importar PDF"** abaixo do bloco `.botoes`, com um `input` de arquivo escondido (aceita `.pdf`), acionado pelo botão.
- Ao escolher o arquivo: se não houver arquivo (desistência), não faz nada e sem mensagem (CA-09c). Se o arquivo passar de 20 MB ou a leitura falhar, mostra a mensagem. Senão, lê os bytes e chama `lerDadosPdf`.
- Resultado `null`: modal com **"PDF não possui dados para importação"**, botão de fechar. Nada é gravado.
- Resultado válido e chave `byarabi_checklist_rascunho` vazia: grava e navega (2.3).
- Resultado válido e rascunho presente: modal com **"Já existe um preenchimento em andamento. Importar este PDF vai substituí-lo. Deseja continuar?"**, botões "Sim, importar" e "Cancelar". "Cancelar" fecha o modal sem gravar nada.
- Zera o valor do `input` depois de cada tentativa, para permitir escolher o mesmo arquivo de novo.
- Não toca nem lê `byarabi_checklist_vendedor` (CA-12).

### 3.4 `src/screens/SelecaoPerfil/SelecaoPerfil.module.css` (alterado)
Classe do botão secundário (mais discreto que `.btnPerfil`: contorno, sem fundo cheio, na cor dourada já usada na tela) e estilo do modal. Reaproveita as cores do tema atual do arquivo.

### 3.5 `src/context/FormProvider.jsx` (alterado)
Ajuste mínimo da seção 2.3 (item 2): leitura da marca `importado` do estado de navegação e restauração direta no efeito de montagem. Não muda `normalizarEstadoSalvo`, o reducer, o diálogo "Continuar de onde parou?" (quando não há marca) nem a gravação contínua.

---

## 4. Arquivos que NÃO mudam

Fluxo do Projetista inteiro (`FormProviderVendedor.jsx`, `schemaVendedor.js`, `steps/vendedor/`, `pdfVendedor.js`), `pdfFutura.js` e as telas da Venda Futura, `src/domain/` inteiro, as telas do Cliente (`StepIdentificacao`, `StepAmbientes`, `StepPerguntasGlobais`, `StepPerguntasPorAmbiente`, `StepRevisao`, `StepSucesso`), `App.jsx`, `Modal`, `cep.js`, `package.json`. Em `testes/`, nenhum arquivo `.test.js` existente é alterado; só os dois auxiliares da 2.6 e um arquivo de teste novo.

---

## 5. Cobertura dos critérios de aceitação

| CA | Onde é atendido | Verificação |
|---|---|---|
| CA-01 | 3.1 a 3.5 | T1 (dados) + conferência manual (tela), com a pergunta de substituição e também com a chave apagada (observação 10) |
| CA-02 | 3.2 | T2 + testes P existentes + conferência manual (aparência) |
| CA-03 | 3.2 e fluxo existente de edição | T3 (dados) + conferência manual (edição na tela) |
| CA-04, CA-05 | 3.3 e 3.5 | Conferência manual (o rascunho pode ser em andamento ou concluído, observações 9 e 10) |
| CA-06 | 3.1 e 3.3 | T4 (serviço) + conferência manual (mensagem) |
| CA-07 | 3.1 e 3.3 | T5 + conferência manual |
| CA-08 | 3.1 | T6 + conferência manual |
| CA-09 | 3.1 e 3.3 | T7 (a, b) + conferência manual (a, b na tela; c) |
| CA-10 | 3.1 | T8 |
| CA-11, CA-12 | 3.5 (sem marca = igual a hoje) | Testes existentes + conferência manual |
| CA-13 | Task final | `npm run build` e `npm test` |
| CA-14 | 2.1 | T9 (decodificação independente em Node) + conferência manual em Python |

---

## 6. Riscos e cuidados de implementação

1. Se `jsPDF` passar a comprimir ou criptografar o arquivo, `lerDadosPdf` deixa de achar o trecho. T1 e T2 são a trava de regressão.
2. O pacote dos PDFs da suíte é montado de uma vez (`entrada_pdf.js`): erro de sintaxe em `pdf.js` ou no serviço novo derruba também os testes do Projetista e da Venda Futura. Por isso a Task 3 (gravação) é validada com `npm test` antes de seguir.
3. A gravação do `localStorage` na `SelecaoPerfil` só pode ocorrer depois da confirmação.
4. `lerDadosPdf` roda sobre arquivos fornecidos pelo usuário: nada dele é executado; só texto e JSON.

---

## Testes

### Testes novos

Arquivo novo previsto: `testes/I_importacao_pdf.test.js`, no padrão dos demais (pasta temporária só nos auxiliares, sem rede). Entradas 100% fictícias (contratos 9001, 9002…; clientes "CLIENTE FICTICIO TESTE"). O PDF é gerado com o `gerarPdf` real, com o jsPDF real por baixo e `save` substituído (nada vai para disco). Os resultados esperados abaixo vêm do PRD e estão escritos por extenso; nenhum vem de constante do código. Nos casos de leitura, "sem dados" significa que o serviço devolve vazio (`null`) sem lançar erro.

**T1 — Ida e volta completa (CA-01, parte de dados).**
Entrada: estado do Cliente com contrato 9001, nome "CLIENTE FICTICIO TESTE", telefone, endereço; Cozinha com dois eletros (Cooktop e Forno, com medidas) e Dormitório Casal com TV de 50 polegadas; um CC ativado (ex.: eletros indefinidos); observação do dormitório "Atenção: vão de 150mm"; perguntas gerais com pelo menos uma resposta "Sim" e um ambiente em lista. Gera-se o PDF e entrega-se os bytes ao `lerDadosPdf`.
Esperado: o serviço devolve as quatro partes (identificação, ambientes selecionados, perguntas gerais, respostas por ambiente) exatamente iguais às de entrada, inclusive os dois eletros, a TV e a observação com "Atenção: vão de 150mm" com acentos intactos. Como as respostas são idênticas, score e CCs recalculados serão os mesmos.

**T2 — PDF do Cliente continua com o mesmo nome e conteúdo impresso (CA-02, parte automatizável).**
Entrada: o estado da T1 gerado com data fixa 19/10/2026.
Esperado: o único arquivo salvo se chama `Checklist_Cliente_9001_2026-10-19.pdf`; nenhum texto impresso (capa, resumo, perguntas, tabelas) contém a marca `V1:` nem qualquer trecho do conteúdo escondido; os dados escondidos aparecem só nas propriedades. (A comparação visual antes/depois e o número de páginas ficam na conferência manual; os 37 testes `P_pdf_cliente` seguem como prova de que o conteúdo impresso não mudou.)

**T3 — PDF corrigido também pode ser importado (CA-03, parte de dados).**
Entrada: o estado da T1 corrigido (um eletro removido da Cozinha e telefone trocado por outro fictício), gerado de novo.
Esperado: o serviço devolve o estado corrigido (um eletro a menos, telefone novo) e não o original.

**T4 — PDF sem os dados escondidos (CA-06).**
Entrada: bytes de um PDF fictício sem a propriedade de palavras-chave (cabeçalho de PDF e algumas linhas de texto simples, simulando PDF do Cliente gerado antes desta versão).
Esperado: sem dados.

**T5 — PDF do Projetista ou de outro sistema (CA-07).**
Entrada: (a) bytes de um PDF do Projetista gerado pelo `gerarPdfVendedor` real com contrato 9002; (b) bytes de um PDF fictício qualquer de outra origem (ex.: texto "BOLETO FICTICIO 9003" dentro de um PDF mínimo).
Esperado: nos dois casos, sem dados.

**T6 — PDF reimpresso ou fotografado perde os dados (CA-08).**
Entrada: (a) os bytes do PDF da T1 com a propriedade de palavras-chave removida (nome do campo trocado), simulando "salvar como PDF" de novo, mantendo todo o conteúdo impresso; (b) bytes de uma imagem (cabeçalho de arquivo JPEG fictício).
Esperado: nos dois casos, sem dados.

**T7 — Arquivo inválido ou corrompido (CA-09, itens a e b).**
Entrada: (a) bytes de texto comum que não é PDF; (b) bytes do PDF da T1 cortados no meio do conteúdo escondido (arquivo truncado); (c) arquivo vazio, de zero bytes.
Esperado: nos três casos, sem dados e sem erro lançado (o teste não deve falhar por exceção).

**T8 — Dados escondidos de versão desconhecida ou estrutura inválida (CA-10).**
Entrada: bytes derivados do PDF da T1, trocando só a propriedade: (a) marca `V2:` no lugar de `V1:` com conteúdo válido; (b) marca `V1:` com texto Base64 que decodifica para algo que não é JSON; (c) marca `V1:` com JSON válido que é uma lista em vez de objeto; (d) marca `V1:` com JSON de objeto sem a chave `identificacao`; (e) marca `V1:` com `ambientesSelecionados` que não é lista.
Esperado: nos cinco casos, sem dados.

**T9 — Formato legível por outros programas, só respostas (CA-14, parte automatizável).**
Entrada: propriedade de palavras-chave capturada na geração do PDF da T1, decodificada no próprio teste de forma independente do código do serviço: separa na primeira `:`, Base64 para texto UTF-8, interpreta como JSON.
Esperado: começa com a marca `V1`; o JSON tem exatamente as quatro chaves identificação, ambientes selecionados, perguntas gerais e respostas por ambiente, e nenhuma outra (sem `_meta`, score, CCs, avisos nem dados de navegação); a observação "Atenção: vão de 150mm" aparece com os acentos intactos. O valor da propriedade só tem letras, números, `+`, `/` e `=` após a marca.

**T10 — Tamanho com o maior caso real (Risco 4 e Ponto 1 do PRD).**
Entrada: estado fictício no formato do MAIOR caso real já gerado pelo app (contrato 9004, "CLIENTE FICTICIO TESTE"; nada do cliente real), com 17 ambientes, usando os tipos reais de `src/domain/ambientes.js` (id → formType):
- 2 `cozinha` (uma "Cozinha" e uma "Lavanderia"; a Lavanderia é o tipo `cozinha`, "Cozinha / Área de Serviço", com nome personalizado), 1 `dormitorio_casal`, 3 `dormitorio_solteiro`, 4 `banheiro`, 3 de sala/office (Living e Antesala = `home`, Office = `office`, todos com eletrônicos respondidos como "Não"), 1 `varanda` e 3 `outros` (Despensa, Copa, Apoio academia). Total: 2+1+3+4+3+1+3 = 17.
- 9 eletros no total: 5 na Cozinha (Cooktop, Forno embutido, Microondas embutido, Lava-roupa frontal, Refrigerador duplex; 3 deles com link fictício), 2 na Varanda, 1 na Copa e 1 no Apoio academia. Nenhum eletrônico preenchido.
- 3 observações curtas com acentos: cerca de 30 caracteres (Lavanderia), 110 (Varanda) e 65 (Copa).
- Vários CCs ativados (iluminação por conta do cliente e rodapé pós-montagem).

Esperado: o valor gravado na propriedade tem no máximo 32.000 caracteres e volta idêntico à entrada pelo `lerDadosPdf`; o teste **registra (imprime) o tamanho medido** do valor gravado, mesmo quando passa. Se passar de 32.000: falha, vai para Desvios, sem compactar.
Evidência medida (pelo Claude principal, com os formatos reais de `construtores.js` e `schema.js`): cerca de 10.960 caracteres (JSON de cerca de 8.217 bytes), aproximadamente um terço do limite. O caso antigo previsto neste Spec (10 ambientes × 6 eletros × 3 eletrônicos × observação de 500 caracteres) media cerca de 37.300 caracteres e passaria do limite; foi trocado por não representar um preenchimento real.

**Conferência manual (sem teste automatizado, com o motivo):**
- **CA-01 (tela), CA-03 (edição na tela):** exigem navegador e as telas de revisão e edição; o repo não tem jsdom nem testing-library e o PRD veda dependência nova. Roteiro do CA-01: depois de concluir a checklist e clicar em "Iniciar novo preenchimento", o preenchimento concluído continua salvo (observação 10), então ao clicar em "Importar PDF" e escolher o PDF recém-baixado **aparece a pergunta de substituição**. Esperado: aparece a pergunta; ao escolher "Sim, importar", o app abre direto em `/revisao`, sem "Continuar de onde parou?", com dados, score e CCs iguais ao PDF original. Para conferir o caminho **sem pergunta**, preparar o navegador apagando a chave `byarabi_checklist_rascunho` pela aba Application (Local Storage) antes de importar; então importa direto, sem pergunta. Conferir também que identificação, ambientes (com nomes), perguntas gerais, eletros e observações com acentos aparecem como preenchidos. Roteiro do CA-03: editar ambiente e identificação volta para a revisão; o novo PDF também importa.
- **CA-02 (aparência):** comparar visualmente o PDF antes e depois (mesmo nome, mesmas páginas e conteúdo).
- **CA-04 e CA-05 (rascunho em andamento):** dependem de `localStorage`, modal e navegação. O rascunho pode ser um preenchimento parado no meio ou um concluído que permanece salvo (observações 9 e 10). Conferir a pergunta antes de qualquer mudança; "Sim, importar" abre a revisão e F5 mantém os dados (pelo "Sim" do diálogo normal); "Cancelar" não importa e o "Continuar de onde parou?" devolve o rascunho antigo intacto.
- **CA-06 a CA-09 (mensagem na tela):** a mensagem "PDF não possui dados para importação", sem mencionar versão, e a ausência de alteração do rascunho dependem do modal. Para o item (c) do CA-09 (fechar o seletor de arquivo sem escolher) nada acontece e sem mensagem; não é testável sem navegador. **CA-06, arquivo a usar:** um PDF real do Cliente gerado antes desta melhoria serve de arquivo de teste (por exemplo, um dos PDFs já enviados por vendedores; hoje há um na raiz do repo, `Checklist_ByArabi_PIN00506_2026-08-14.pdf`, já no `.gitignore` por conter dados reais de cliente). Deve resultar na mensagem "PDF não possui dados para importação". É só a indicação de qual arquivo usar na conferência, não um teste automatizado: o conteúdo desse PDF não deve ser lido nem copiado para este Spec.
- **CA-11 e CA-12 (regressão de telas):** usar "Cliente" e "Projetista" normalmente, com e sem rascunho; importar um PDF do Cliente com rascunho do Projetista salvo e confirmar que a chave `byarabi_checklist_vendedor` não muda (aba Application do navegador).
- **CA-14 (leitura em Python):** conferência de um PDF real baixado pelo app com um script curto em Python usando `pypdf` (ou `PyMuPDF`): ler o campo de palavras-chave, separar na primeira `:`, decodificar Base64 e UTF-8, interpretar o JSON. Esperado: marca `V1`, respostas idênticas às preenchidas, acentos intactos, sem score, CCs, avisos nem dados de navegação. O Python não faz parte da suíte do repo (sem dependência nova).

### Testes existentes afetados

Nenhum. Os 37 testes de `P_pdf_cliente.test.js` (e os de `V_`, `Q_`, `S_`, `C_`, `A_`, `F_`) continuam valendo sem alteração: a mudança em `pdf.js` não altera nenhum texto, tabela, link ou nome de arquivo capturados, e o acréscimo nos auxiliares (2.6) só adiciona campos. `P_pdf_cliente.test.js` é o teste que toca `pdf.js` (o PRD o apontava como possível afetado) e precisa passar sem mudança. Qualquer teste existente que falhar é erro do código ou do auxiliar, não do teste.

Alterações de apoio em `testes/auxiliares/` (arquivos de apoio, não testes): `captura_jspdf.js` e `captura_registro.js` (seção 2.6), e um novo teste `testes/I_importacao_pdf.test.js`.

---

## Plano de Execução

- [x] Task 1 — Criar `src/services/importacaoPdf.js` com `montarDadosPdf(state)` e `lerDadosPdf(bytes)` (seção 2.1, 2.2): formato `V1:` + Base64 de JSON UTF-8 com as quatro chaves; leitura que nunca lança exceção e devolve `null` em qualquer falha.
- [x] Task 2 — Acrescentar aos auxiliares de teste (seção 2.6): `save` guarda os bytes reais do arquivo, `setProperties` registra o que recebe, e `lerCaptura` devolve `propriedades` e `bytes`. Rodar `npm test` para provar que os testes existentes seguem verdes.
- [x] Task 3 — Alterar `src/services/pdf.js`: gravar `keywords` com `montarDadosPdf(state)` antes do `doc.save`, e comentário curto sobre não ligar compressão/criptografia. Rodar `npm test` (pacote dos PDFs é montado de uma vez).
- [x] Task 4 — Criar `testes/I_importacao_pdf.test.js` com os casos T1, T2 e T3 (gravação e ida e volta).
- [x] Task 5 — Adicionar ao mesmo arquivo os casos de falha T4 a T8.
- [x] Task 6 — Adicionar T9 (formato legível, só respostas) e T10 (tamanho). O T10 imprime o tamanho medido, e quem implementa anota esse número em Desvios mesmo quando o teste passa (para dar noção de folga). Se T10 falhar, parar e registrar em Desvios.
- [x] Task 7 — Alterar `src/context/FormProvider.jsx`: restauração direta quando a navegação traz `importado: true` e há valor salvo, sem diálogo (seção 2.3, item 2). Sem a marca, comportamento idêntico ao atual.
- [x] Task 8 — Alterar `SelecaoPerfil.jsx` e `.module.css`: botão "Importar PDF", seleção de arquivo, limite de 20 MB, modal de erro, pergunta de confirmação com "Sim, importar" e "Cancelar", gravação do rascunho e navegação para `/revisao`.
- [x] Task 9 — Conferência manual no `npm run dev` (CA-01 a CA-12), incluindo a leitura em Python do CA-14 com um PDF real; anotar o resultado em Desvios.
- [x] Task 10 — Rodar `npm run build` (compila e `package.json` sem dependência nova).
- [x] Task 11 — Rodar a suíte inteira com `npm test`: verde e sem teste pulado.

Se um teste novo falhar porque o código faz diferente do esperado acima, não ajuste o esperado para ficar verde: registre em Desvios e pare. Se um teste existente que não está na lista de afetados falhar, corrija o código, não o teste.

---

## Desvios

Implementação concluída em 23/10/2026. Nenhum teste novo falhou; nenhum teste existente foi alterado. Registros:

1. **Tamanho medido no T10 (maior caso real, 17 ambientes):** **11.099 caracteres** no valor gravado, cerca de um terço do limite de 32.000. O teste imprime esse número a cada rodada (linha `ℹ T10 — tamanho medido...`).
2. **Suíte final (Task 11):** 127 testes, 127 passaram, 0 pulados (antes: 117; mais os 10 novos T1 a T10). `npm run build` compila (aviso de chunk maior que 500 kB já existia). `package.json` e `package-lock.json` sem mudança.
3. **Conferência manual (Task 9), feita em `npm run dev` no Chrome, com PDF fictício (contrato 9001):**
   - CA-01 sem rascunho: abre direto em `/revisao`, sem "Continuar de onde parou?", com identificação, 2 ambientes, CCs e scores; chave gravada com `_meta.etapaAtual = revisao` e observação "Atenção: vão de 150mm" intacta.
   - CA-04: com rascunho presente aparece a pergunta (texto do PRD, botões "Sim, importar" e "Cancelar") antes de qualquer mudança; "Sim, importar" abre `/revisao` direto, sem diálogo. F5 mostra o "Continuar de onde parou?" normal e o "Sim" volta à revisão com os dados importados.
   - CA-05: "Cancelar" fecha a pergunta sem gravar nada; em seguida "Cliente" mostra o "Continuar de onde parou?" e o rascunho antigo está como estava.
   - CA-06: o PDF real antigo (`Checklist_ByArabi_PIN00506_2026-08-14.pdf`, 77.654 bytes, começa com `%PDF`) deu "PDF não possui dados para importação", sem mencionar versão, e o rascunho continuou intacto. O conteúdo desse PDF não foi lido nem copiado.
   - CA-08/CA-09: texto renomeado para .pdf, PDF válido cortado ao meio e arquivo vazio deram a mesma mensagem, sem alterar o rascunho. CA-09(c), desistência do seletor: nada acontece, sem mensagem.
   - CA-11/CA-12: "Cliente" sem rascunho vai a `/identificacao` sem diálogo; "Projetista" vai a `/projetista`; a chave `byarabi_checklist_vendedor` ficou idêntica em todo o teste, inclusive durante a importação com rascunho do Cliente.
   - Geração no navegador: o PDF gerado pela tela de revisão tem o nome `Checklist_Cliente_{contrato}_{data}.pdf` e traz `/Keywords (V1:...)` com as 4 chaves; a tela de sucesso aparece como antes.
   - Observação 10 reproduzida: depois de "Iniciar novo preenchimento" a chave `byarabi_checklist_rascunho` continua presente com o preenchimento completo (2 ambientes). O mecanismo continua sendo causa provável, não confirmada.
4. **CA-14 (Python):** lido com **PyMuPDF** (`pymupdf`), porque o `pypdf` não está instalado nesta máquina. Marca `V1`, as 4 chaves, conteúdo idêntico ao preenchido e acentos intactos ("Atenção: vão de 150mm"). O PDF lido foi gerado pelo `gerarPdf` real (mesma rota dos testes, bytes em memória), não baixado pela tela. Leitura com `pypdf` fica por conta de quem for usá-lo.
5. **Desvios de forma (sem mudar comportamento):**
   - `FormProvider.jsx`: a lógica do `confirmarRascunho` virou uma função `restaurar(estadoSalvo)` reaproveitada pelo caminho da importação (mesmo comportamento do diálogo). Leitura da marca via `useLocation`.
   - `SelecaoPerfil.jsx`: `localStorage` protegido por `try/catch`; se a gravação falhar, aparece a mesma mensagem de erro.
   - Botão "Importar PDF": contorno dourado com texto grafite (em vez de texto dourado), para manter contraste sobre o fundo claro.
   - Teste de sanidade: com a chave `respostasPorAmbiente` removida de propósito do serviço, T1, T3, T9 e T10 falharam; o serviço foi restaurado idêntico. A checagem do `)` final em `lerDadosPdf` é só uma segunda proteção (JSON cortado já falha no `JSON.parse`).
