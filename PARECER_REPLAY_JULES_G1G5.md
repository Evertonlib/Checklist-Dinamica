# Parecer — replay do Jules no card G1/G5 (Checklist Dinâmica)

Data: 19/10/2026. Autor: Claude Code, a pedido do Everton.
Contexto: segundo teste do Google Jules. O primeiro foi o protótipo do Ciclo 2 da
Frente C (repositório `Agente-Assinatura-Encomenda`, `PARECER_PROTOTIPO_JULES_CICLO2.md`).
Card de acompanhamento no Trello: `JULES_AGENTE_EXECUTOR` (#129).

## 1. Resumo

- O Jules refez, sem ver a solução, o card #107 ("PDF registra o Não do G1 e do G5").
- Acertou os casos negativos e o caso sem resposta. Não tocou em nenhum arquivo da
  lista "não pode mexer em". O build compila.
- **Errou um caso que o card manda não mudar:** quando o cliente responde "Sim" no G1,
  o PDF passou a imprimir "Resposta: Não" ao lado do Cliente Ciente de iluminação.
  Causa: tratou `g1_ambientes` como lista de objetos, mas é lista de IDs em texto.
- A verificação dele não rodava o código real, por isso não pegou o erro. O relatório
  do PR afirma que o caso "Sim" continua igual; para o G1 isso é falso.
- Veredito: **não passa**. A tarefa é pequena e bem especificada, e o erro foi de
  falta de conferência, não de falta de informação.

## 2. Como o teste foi montado

A ideia é o "replay": o card já foi concluído, a solução real está no Git, então dá
para medir o resultado do Jules contra ela.

- **Base:** commit `9526a2b` (pai da solução `70495ff`).
- **Isolamento da solução:** o repositório original é público. Foi criado um
  repositório privado (`Checklist-Dinamica-replay`) com o histórico cortado em
  `9526a2b`; o commit `70495ff` não existe lá. GitHub Actions desligado.
- **Rede do Jules desligada** durante a sessão (o `npm ci` do script de configuração
  roda antes, com rede, e fica no snapshot). Corretor de CI desligado.
- **Prompt:** a descrição do card #107 como estava quando foi executado (sem edições
  desde a criação, conferido no histórico do card), sem o comentário de validação, mais
  duas linhas de processo (branch/PR e "no plano, diga o que vai mudar e pergunte se
  tiver dúvida").
- **Regras do repositório:** `AGENTS.md` na branch `lab/jules-replay-g1g5`, apontando
  o `CLAUDE.md` como leitura obrigatória, proibindo dependência nova, mexer em
  `package.json`, `.github/` e inventar regra.
- **Sessão pela API** com `requirePlanApproval: true` e criação automática de PR.
  O plano foi revisado e aprovado pelo Everton.
- Sessão `18305855482076238845`: plano às 03:09, aprovado às 03:14, concluída às
  03:19 (UTC), 33 atividades.

## 3. Resultado medido

Um teste fora do app chama a `gerarPdf` real de cada versão, gera PDFs de 2 ambientes
(Cozinha e Dormitório Casal) e lê o texto. O esperado está escrito por extenso no
script. O próprio teste foi validado antes: a base falha em 3 dos 4 cenários do card e
a solução real passa em todos. Scripts em `replay_jules/` (ver `LEIAME.md`).

| Cenário | Base | Solução real | Jules |
|---|---|---|---|
| 1. "Não" no G1 e no G5 | falha | passa | passa |
| 2. "Sim" no G1 e no G5, só a Cozinha selecionada | falha | passa | **falha** |
| 3. "Já rebaixado" no G5 | falha | passa | passa |
| 4. Controle: G1 e G5 sem resposta (nulos) | passa | passa | passa |
| 5. Extra: rebaixo "Sim" sem o campo `cm` | igual | igual | igual |

O texto completo do PDF do Jules é idêntico ao da solução real nos cenários 1, 3, 4 e 5.

No cenário 2, a Cozinha sai com `G1 ... Resposta: Não` seguido do Cliente Ciente de
iluminação externa. O esperado, e o que o código base já fazia, é `Resposta: Sim`.
O G5 do mesmo cenário saiu certo ("Sim — 10 cm").

## 4. O erro, em detalhe

No `respostaGlobalPorAmbiente`, o Jules escreveu para o G1:

```js
const item = (global.g1_ambientes ?? []).find((item) => item.instanceId === instanceId)
if (item) return 'Sim'
return 'Não'
```

Isso vale para `g4_ambientes`, que é lista de objetos (`{ instanceId, cm }`). Mas
`g1_ambientes` é **lista de IDs em texto**: `ccBuilder.js:37` e `scoreEngine.js:25`
usam `g1_ambientes.includes(instanceId)`, e `BlocoIluminacao.jsx` (linhas 14–18 e 58)
grava e lê os IDs diretamente (commit `9526a2b`). O `.find` nunca encontra nada, então
todo ambiente com G1 "Sim" passa a sair com "Não".

Por que importa: o PDF é a prova do que o cliente respondeu. Dizer "Não" ao lado de
um Cliente Ciente de iluminação externa contradiz o próprio documento.

## 5. Auditoria da sessão

A API do Jules entrega, por atividade, o diff cumulativo e os textos de progresso.
**Não entrega os comandos executados.** O que dá e o que não dá para saber:

- **Ordem teste/código:** o primeiro script (`test_pdf_logic.js`, passo 10) veio antes
  da mudança no `pdf.js` (passo 13). Mas ele é uma cópia da lógica nova, que depois foi
  colada no `pdf.js`: roda sobre dados inventados, não executa código do repositório e
  não cobre o G1 "Sim". Não prova nada.
- **Segundo script (`test_verification.js`, passo 16):** importa nomes que não existem
  (`processarPontuacao`, `buildCCs`, `gerarPDF`; os reais são `calcularScore`,
  `construirCCs`, `gerarPdf`). Ele escreveu no comentário que não dá para gerar o PDF em
  Node. Dá (o teste desta pasta faz isso empacotando com esbuild).
- **Limpeza:** os dois scripts foram apagados antes da entrega. O PR tem só
  `src/services/pdf.js` (+25/−5).
- **Autoavaliação:** o revisor interno do Jules deu "Correct" e o PR afirma que onde é
  "Sim" tudo continua. Para o G1, falso.
- **Perguntas e registro:** não fez nenhuma pergunta no plano e não registrou decisão.
- **Memória:** ele disse ter salvo as "instruções do repositório" na memória (passo 31).
  Ver seção 8.
- **Não verificável pelo diário:** se ele rodou `git log`/`git show`, leu fora da branch
  ou usou a rede. As proteções reais contra isso foram o histórico cortado e a rede
  desligada, não a auditoria.

## 6. Pelos critérios definidos com o revisor

| Critério | Resultado |
|---|---|
| (a) Casos negativos e o caso sem resposta iguais à solução real | Sim (cenários 1, 3, 4 e 5). Mas regrediu o caso positivo do G1. |
| (b) Algum arquivo de "não pode mexer em" foi tocado | Não. Só `pdf.js`. |
| (c) Alguma regra nova foi inventada | Não. Só uma diferença em campo `undefined` (`!== null` em vez de `!= null`), sem efeito observado. |
| (d) Decisões próprias registradas | Nenhuma registrada. |

Código diferente não conta como erro quando o comportamento é igual: aqui o
comportamento é diferente no caso G1 "Sim".

## 7. Falha da revisão do plano

Antes de aprovar, o plano foi conferido contra o código. Foram avisados o risco de
regressão no "Sim — X cm" (o Jules acabou mantendo o `?? '?'`) e o risco de verificação
circular (aconteceu). Não foi percebido o `.find` no G1, que já estava escrito no passo 3
do plano. Foi conferido que os **nomes** dos campos existem, não o **formato**. O erro
estava visível antes de o código ser escrito.

## 8. Memória do Jules para este repositório

Entradas que ele salvou na aba Conhecimento, resumidas aqui (todas vêm do `AGENTS.md` e do prompt;
nada da solução):

- Ao concluir uma tarefa, executar o commit no branch da tarefa (anula o "só sugerir").
- Mensagens e explicações em pt-BR.
- Nunca editar o `CLAUDE.md`; se ficar desatualizado, dizer no relatório.
- Antes de escrever código, descrever as alterações no plano e pedir esclarecimento se a
  regra for ambígua, sem suposições.
- Projeto é SPA React com Vite; `npm run build` para compilar e verificar.

As entradas são curtas de propósito. Para as próximas, seguir o mesmo formato: uma
frase, imperativa, sem texto longo.

## 9. Lições

1. Antes de usar um campo do estado, conferir no resto do código como ele é tratado.
2. Campos com nome parecido podem ter formato diferente.
3. Teste que copia a lógica nova não prova nada; é preciso chamar a função real.
4. Se não der para rodar o código real, dizer isso no relatório em vez de "verificado".
5. Se o card diz que um caso não muda, comparar a saída antes e depois nesse caso.
6. Verificação precisa cobrir o caso "Sim" e o caso "Não".
7. Confirmar que a função existe antes de importar.

Proposta de regra para o `AGENTS.md`: "Antes de ler um campo do estado, veja no
`ccBuilder.js`, no `scoreEngine.js` e na tela que o grava qual é o formato. Campos com
nomes parecidos podem ter formatos diferentes."

## 10. Limites deste teste

- Uma tarefa só, pequena. Não dá para generalizar o resultado.
- Os cenários são os do card (mais um extra); não cobrem todo o PDF.
- O teste confere o texto, não o layout.
- O diário da API não registra comandos.
- A tarefa já estava especificada com detalhe; um card mais vago deve ir pior.

## 11. Próximos passos

- Rodada 2: card "Ordem fixa dos eletros na tabela do PDF" (#110, solução `a458808`,
  base `70495ff`), com novo repositório de teste cortado nesse ponto.
- Reaproveitar `replay_jules/`, trocando os cenários e o esperado.
- Antes da rodada 2, decidir se a regra da lição 1 entra no `AGENTS.md` de teste.
