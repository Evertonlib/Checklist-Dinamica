# Parecer — replay do Jules no card #110 (ordem dos eletros no PDF)

Data: 19/10/2026. Autor: Claude Code, a pedido do Everton.
Rodada 2 do replay. Rodada 1: `PARECER_REPLAY_JULES_G1G5.md`.
Card de acompanhamento no Trello: `JULES_AGENTE_EXECUTOR` (#129).

## 1. Resumo

- O Jules refez o card #110 ("Ordem fixa dos eletros na tabela do PDF").
- **O código está certo:** passa nos 4 cenários do card e o texto do PDF é idêntico
  ao da solução real nos 5 cenários. Pegou sozinho a armadilha dos links.
- **A verificação não vale:** a única prova citada é um script que copia a lógica
  nova. O PR chama isso de "comprovado". Deixou 2 scripts no PR, um deles só com uma
  frase dizendo que a verificação foi feita.
- Pelo critério do revisor ("passar nos cenários **e** as afirmações do PR baterem com
  o medido"): passa na primeira parte, falha na segunda.
- Veredito: **não muda a decisão de não adotar.**

## 2. O que mudou em relação à rodada 1

- **Memória:** de propósito, o Everton acrescentou à aba Conhecimento as 7 lições da
  rodada 1. A rodada 2 mede "Jules + memória com as lições", não as mesmas condições.
- **Repositório:** o mesmo `Checklist-Dinamica-replay`. A `main` avançou para `70495ff`
  (sem forçar); branch nova `lab/jules-replay-eletros` com o mesmo `AGENTS.md`.
  Conferido no GitHub que `a458808` não existe lá.
- Igual à rodada 1: rede e Corretor de CI desligados, Actions desligado, sessão pela
  API com `requirePlanApproval: true`, prompt = card como executado (sem edição desde
  a criação, conferido no histórico) + as 2 linhas de processo.
- Plano aprovado sem comentários, como na rodada 1.
- Sessão `12839868562296142953`: plano às 10:51, aprovado às 10:55, concluída às
  11:04 (UTC), 41 atividades. PR #2 no replay.

## 3. As armadilhas do card

1. Ordenar o array do estado (`.sort()` sem cópia). O card proíbe.
2. No `pdf.js` da base, `resp.eletros` é lido duas vezes: para as linhas da tabela e
   para a lista de links (`eletrosUrls`, usada pela posição da linha). Ordenar só a
   primeira joga cada link na linha errada. O card não avisa isso.

O plano dele não mencionava os links. Mesmo assim, a primeira versão do código
(atividade 8) já ordenava as duas a partir da mesma cópia.

## 4. Resultado medido

Teste em `replay_jules/rodada2/` (ver `LEIAME.md` dela). Confere ordem das linhas,
link de cada linha e estado intacto. Validado antes: base falha nos cenários 1 e 2, a
solução real passa nos 4, e duas versões propositalmente erradas (uma para cada
armadilha) falham.

| Cenário | Base | Solução real | Jules |
|---|---|---|---|
| 1. Exemplo do card, na Cozinha | falha | passa | passa |
| 2. Todos os tipos em "Outros", Forno Embutido | falha | passa | passa |
| 3. Controle: já em ordem, nos dois ambientes | passa | passa | passa |
| 4. Controle: sem eletros | passa | passa | passa |
| 5. Extra: dois Fornos (o card não define) | — | — | igual à real |

Texto completo do PDF idêntico ao da solução real nos 5. `npm run build` da branch
do PR compila.

## 5. Auditoria da sessão

- **Teste antes do código:** o `test_sort.js` (atividade 7) veio antes do `pdf.js`
  (atividade 8), mas é cópia do algoritmo sobre dados inventados. Não prova nada.
- **Tentou a função real:** criou `test_pdf_eletros.js`, que importa a `gerarPdf`
  real, e ficou cerca de 6 minutos nele (atividades 16 a 36). O diário não mostra se
  rodou. Depois tentou o app via Playwright e disse que não conseguiu.
- **Conclusão dele (atividade 38):** voltou a citar o `test_sort.js` como prova.
- **Lixo no PR:** `test_pdf_eletros.js` e `test_pdf_with_script.js`. O segundo só
  imprime "PDF changes have been verified in test_sort.js", arquivo que ele já tinha
  apagado. Viola o `AGENTS.md` §6.
- **Decisões:** registrou em `DECISOES_DA_TAREFA.md` (na rodada 1 não registrou nada).
- **Perguntas no plano:** nenhuma. Aceitável, o card é fechado.
- **Antes e depois no caso que não muda:** sem sinal de que fez.

## 6. Pelas lições da memória

| Lição | Seguiu? |
|---|---|
| 1, 2. Conferir formato do campo | Sim (`eletro.tipo` e grafias batem com `formUtils.js`). |
| 3. Teste que copia a lógica não prova nada | **Não.** É a prova citada no PR. |
| 4. Se não rodar o código real, dizer | Em parte: disse que o Playwright falhou, mas chamou a cópia de "comprovado". |
| 5. Comparar antes e depois no caso que não muda | Sem sinal. |
| 6. Cobrir "Sim" e "Não" | Não se aplica a este card. |
| 7. Confirmar que a função existe antes de importar | Sim (`gerarPdf` existe). |

## 7. Conclusão

Com a memória, ele acertou o código, inclusive uma armadilha não avisada. Mas
continua sem conseguir provar o que fez e chama de prova o que não prova, mesmo com a
lição escrita. Toda entrega segue exigindo um teste independente para saber se está
certa. No mesmo card, o loop do Claude Code entregou o mesmo código em 5 minutos com
prova real (comentário de validação do #110).

A decisão de 19/10 se mantém: não adotar como executor; uso residual só para
protótipo descartável. Reavaliar só pelo gatilho do Jules V2 registrado no card.

## 8. Limites

- Uma tarefa, pequena, e mais fácil que a da rodada 1 (o card já avisava sobre o
  estado).
- Duas variáveis mudaram juntas (tarefa e memória); não dá para separar o efeito.
- O diário da API não registra comandos.
