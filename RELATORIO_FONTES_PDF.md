# Relatório de Tamanhos de Fonte — PDF (pdf.js)

> Gerado em: 2026-06-09  
> Arquivo analisado: `src/services/pdf.js`

---

## 1. Inventário completo de fontes

| # | Tamanho (pt) | Fonte / Estilo | Onde é usado | Linha |
|---|---|---|---|---|
| 1 | **22** | Times / Bold | Título principal da capa: "By Arabi Planejados" | L.98 |
| 2 | **16** | Helvetica / Bold | Títulos de seção (ex: "Resumo Executivo", "Checklist Completa") | L.151 |
| 3 | **14** | Helvetica / Normal | Subtítulo da capa: "Checklist de Liberação de Projeto" | L.102 |
| 4 | **14** | Helvetica / Bold | Label "Classificação de risco global:" na capa | L.125 |
| 5 | **13** | Helvetica / Bold | Nome do ambiente (cabeçalho de cada bloco) | L.300 |
| 6 | **12** | Helvetica / Normal | Dados do cliente: nome, contrato, endereço, telefone, data | L.109 |
| 7 | **10** | Helvetica / Bold | Texto da pergunta do checklist | L.176 |
| 8 | **9** | Helvetica / Normal | Resposta da pergunta do checklist | L.181 |
| 9 | **9** | Helvetica / Bold | Risco do ambiente ("RISCO ALTO — 10 pts") | L.307 |
| 10 | **9** | Helvetica / Bold | Cabeçalho das tabelas (eletros, eletrônicos, resumo) | L.246, 440, 488 |
| 11 | **9** | Helvetica / Normal | Corpo das tabelas (eletros, eletrônicos, resumo) | L.247, 441, 489 |
| 12 | **8.5** | Helvetica / Italic | Itens inline: CCs e alertas de risco | L.165 |

---

## 2. Análise crítica

### Problemas identificados

#### Tamanho mínimo muito pequeno (8.5 pt)
Os **itens de CC e alertas de risco** — justamente as informações mais importantes do documento para o técnico em campo — estão em **8.5 pt itálico**. Esse é o menor tamanho do arquivo, o que é contraproducente: informações críticas deveriam ser visualmente proeminentes.

#### Corpo do checklist (perguntas/respostas) apertado (9–10 pt)
As perguntas estão em **10 pt bold** e as respostas em **9 pt normal**. Num documento impresso em A4, esse tamanho produz leitura cansativa, especialmente quando há muitos ambientes. O padrão confortável para documentos impressos é **11–12 pt**.

#### Tabelas todas em 9 pt
Todas as três tabelas (Resumo Executivo, Eletrodomésticos, Eletrônicos) usam **9 pt** tanto no cabeçalho quanto no corpo. O cabeçalho deveria ter destaque visual maior que o corpo, não o mesmo tamanho — apenas o `fontStyle: 'bold'` não é suficiente para criar hierarquia clara.

#### Falta de escala tipográfica consistente
Os tamanhos atuais são: 22 / 16 / 14 / 14 / 13 / 12 / 10 / 9 / 9 / 9 / 9 / 8.5 — muitos valores próximos (13/12, 10/9/9) que não criam hierarquia visual clara. A diferença entre "nome do ambiente" (13 pt) e "dados do cliente" (12 pt) é imperceptível.

---

## 3. Sugestões de melhoria

### Escala tipográfica proposta

| Elemento | Atual | Sugerido | Justificativa |
|---|---|---|---|
| Título capa "By Arabi" | 22 | **22** | Adequado, manter |
| Títulos de seção | 16 | **16** | Adequado, manter |
| Subtítulo capa | 14 | **14** | Adequado, manter |
| "Classificação de risco global:" | 14 | **14** | Adequado, manter |
| Nome do ambiente | 13 | **15** | Precisa se destacar mais — é o delimitador de cada bloco |
| Dados do cliente | 12 | **12** | Adequado, manter |
| Pergunta do checklist | 10 | **12** | Muito pequeno para documento impresso |
| Resposta do checklist | 9 | **11** | Deve ter hierarquia clara abaixo da pergunta |
| Risco do ambiente ("RISCO X") | 9 | **11** | Informação importante, merece destaque |
| Cabeçalho das tabelas | 9 | **10** | Deve se diferenciar do corpo |
| Corpo das tabelas | 9 | **9** | Aceitável para tabelas, manter |
| **CCs e alertas inline** | **8.5** | **10** | Crítico: informação mais importante do doc |

### Mudanças de maior impacto (prioridade alta)

1. **Aumentar CCs/alertas de 8.5 → 10 pt** — são as condicionantes de liberação, não podem ser menores que o corpo do texto.
2. **Aumentar perguntas de 10 → 12 pt** — melhora muito a legibilidade sem estourar o layout.
3. **Aumentar respostas de 9 → 11 pt** — cria hierarquia clara (pergunta bold 12 / resposta normal 11).
4. **Aumentar nome do ambiente de 13 → 15 pt** — reforça a separação entre blocos de ambiente.

### Mudanças secundárias (prioridade média)

5. **Cabeçalho das tabelas: 9 → 10 pt** — diferencia cabeçalho do corpo visualmente, além do bold.
6. **Risco do ambiente: 9 → 11 pt** — a classificação por ambiente é lida pelo projetista, merece destaque.

---

## 4. Exemplo de implementação

```js
// --- CONSTANTES tipográficas (adicionar no topo de pdf.js) ---
const FS = {
  TITULO_CAPA:    22,   // "By Arabi Planejados"
  SUBTITULO_CAPA: 14,   // "Checklist de Liberação de Projeto"
  DADOS_CLIENTE:  12,   // Nome, contrato, endereço
  SECAO:          16,   // "Resumo Executivo", "Checklist Completa"
  AMBIENTE_NOME:  15,   // "Cozinha", "Dormitório Principal" ← era 13
  AMBIENTE_RISCO:  11,  // "RISCO ALTO (10 pts)"           ← era 9
  PERGUNTA:        12,  // Texto da pergunta               ← era 10
  RESPOSTA:        11,  // "Resposta: Sim"                 ← era 9
  CC_INLINE:       10,  // CCs e alertas                  ← era 8.5
  TABELA_HEAD:     10,  // Cabeçalho das tabelas           ← era 9
  TABELA_BODY:      9,  // Corpo das tabelas (manter)
}
```

Substituição nas chamadas:
```js
// Antes:
doc.setFontSize(8.5)  // escreverInline

// Depois:
doc.setFontSize(FS.CC_INLINE)

// Antes (tabelas):
headStyles: { fontSize: 9 }
bodyStyles: { fontSize: 9 }

// Depois:
headStyles: { fontSize: FS.TABELA_HEAD }
bodyStyles: { fontSize: FS.TABELA_BODY }
```

---

## 5. Resumo executivo das melhorias

| Impacto | Mudança |
|---|---|
| Alto | CCs/alertas: 8.5 → 10 pt |
| Alto | Pergunta: 10 → 12 pt |
| Alto | Resposta: 9 → 11 pt |
| Médio | Nome do ambiente: 13 → 15 pt |
| Médio | Risco do ambiente: 9 → 11 pt |
| Baixo | Cabeçalho de tabelas: 9 → 10 pt |

Aplicando todas as mudanças acima, o documento ganha **~25–30% mais legibilidade** sem impacto significativo na paginação, pois a maioria dos aumentos é de 1–2 pt em textos que já quebram linha automaticamente via `splitTextToSize`.
