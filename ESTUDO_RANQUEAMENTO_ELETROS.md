# Estudo e Ranqueamento de Eletrodomésticos — Checklists Dinâmicas de Clientes

**Objetivo:** Levantar os tipos, subtipos, marcas e modelos de eletrodomésticos mais informados nas **Checklists Dinâmicas de Clientes** desde o início da implantação (piloto em jul/2026 até nov/2026), para embasar padronizações, sugestões de preenchimento e melhorias na **Checklist Dinâmica**.

---

## 1. Resumo da Base Analisada

- **Período:** `06/07/2026` a `23/11/2026` *(sem limite fixo de meses — toda a produção histórica da Checklist Dinâmica desde o piloto)*.
- **Fontes escaneadas (`E:\` — pastas dos 3 liberadores):**
  - **David (`E:\LIBERADOR 2`):** **48 checklists**
  - **Erika (`E:\LIBERADOR 1`):** **47 checklists** *(48 arquivos menos 1 cópia duplicada de `SM1994`)*
  - **Everton (`E:\COMPRADOR\PROJETOS PARA LIBERAÇÃO`):** **21 checklists** *(22 arquivos menos 1 cópia duplicada de `TA1337` em `ALT VEND 07.10`)*
  - *(Conferido também `E:\COMPRADOR\ENCOMENDAS`: 0 checklists exclusivos; o contrato `PIN506` aparecia duplicado em Everton e David e foi contabilizado 1 vez.)*
- **Total auditado:** **116 checklists dinâmicas únicas de clientes** (de **119 arquivos** encontrados).
  - **39 checklists (33,6%)** já possuem metadados estruturados **`V1:`** no campo `Keywords` do PDF (extração direta do JSON).
  - **77 checklists (66,4%)** são versões anteriores à gravação do `V1:` (extração via tabelas e hyperlinks embarcados `Ver link` do PDF).
  - *Obs. 1:* Um contrato digitado repetido (`SM02188`) pertencia a duas clientes diferentes (`Débora Luchiari` e `Jéssica Neves / SM2198`), por isso ambos foram mantidos.
  - *Obs. 2:* Foi localizado ainda 1 PDF impresso como imagem sem texto (`IT2926\chec list (1).pdf`), que marca `"Eletros indefinidos"` (sem tabela de eletros), não contabilizado nos 116 extraíveis.
- **Distribuição por loja:** São Miguel (52), Tatuapé (28), Itaquera (17), Pinheiros (13), Santo André (6). *(Confirma São Miguel como piloto desde julho.)*
- **Distribuição por mês (data no PDF):** Jul/2026 (5), Ago/2026 (20), Set/2026 (31), Out/2026 (33), Nov/2026 (27, até o dia 23).
- **Situação dos eletrodomésticos nas 116 checklists:**
  - **83 checklists (71,6%)** informaram eletrodomésticos — total de **337 eletros** (média de **4,06 itens por checklist**).
  - **22 checklists (19,0%)** responderam **`Não`** (*"Eletros indefinidos"* — 0 itens).
  - **11 checklists (9,5%)** não possuíam ambiente com pergunta de eletros (ex.: apenas dormitórios, banheiros ou home).

---

## 2. Ranking de Tipos e Subtipos de Eletrodomésticos

### 2.1 Ranking por Tipo (Agregado)

Base: **337 itens** em **83 checklists com eletros**.

| Pos. | Tipo | Qtd. de itens | % dos 337 itens | Checklists que possuem | % dos 83 checklists c/ eletros |
|---:|---|---:|---:|---:|---:|
| 1 | **Microondas** | **60** | 17,8% | **60** | 72,3% |
| 2 | **Cooktop** | **54** | 16,0% | **52** | 62,7% |
| 3 | **Forno** | **49** | 14,5% | **47** | 56,6% |
| 4 | **Refrigerador** | **48** | 14,2% | **48** | 57,8% |
| 5 | **Depurador** | **41** | 12,2% | **40** | 48,2% |
| 6 | **Lava-louça** | **29** | 8,6% | **26** | 31,3% |
| 7 | **Lava-roupa** | **22** | 6,5% | **21** | 25,3% |
| 8 | **Fogão** | **19** | 5,6% | **19** | 22,9% |
| 9 | **Outros** *(especificados)* | **12** | 3,6% | **9** | 10,8% |
| 10 | **Coifa** | **3** | 0,9% | **3** | 3,6% |

### 2.2 Ranking Detalhado por Tipo + Subtipo

| Pos. | Tipo — Subtipo | Qtd. de itens | % dos 337 itens | Checklists | % dos 83 checklists |
|---:|---|---:|---:|---:|---:|
| 1 | **Cooktop** *(sem subtipo no formulário)* | **54** | 16,0% | 52 | 62,7% |
| 2 | **Microondas — Normal** | **48** | 14,2% | 48 | 57,8% |
| 3 | **Forno — Embutido** | **36** | 10,7% | 34 | 41,0% |
| 4 | **Refrigerador — Duplex** | **26** | 7,7% | 26 | 31,3% |
| 5 | **Depurador — Normal** | **23** | 6,8% | 22 | 26,5% |
| 6 | **Lava-roupa — Abertura Frontal** | **20** | 5,9% | 19 | 22,9% |
| 7 | **Lava-louça — Piso** | **20** | 5,9% | 20 | 24,1% |
| 8 | **Depurador — Embutido** | **18** | 5,3% | 18 | 21,7% |
| 9 | **Refrigerador — Inverse** | **16** | 4,7% | 16 | 19,3% |
| 10 | **Forno — Normal** | **13** | 3,9% | 13 | 15,7% |
| 11 | **Microondas — Embutido** | **12** | 3,6% | 12 | 14,5% |
| 12 | **Outros** | **12** | 3,6% | 9 | 10,8% |
| 13 | **Fogão — Piso** | **12** | 3,6% | 12 | 14,5% |
| 14 | **Lava-louça — Embutido** | **9** | 2,7% | 6 | 7,2% |
| 15 | **Fogão — Embutido** | **7** | 2,1% | 7 | 8,4% |
| 16 | **Refrigerador — Side by Side** | **6** | 1,8% | 6 | 7,2% |
| 17 | **Coifa — Parede** | **2** | 0,6% | 2 | 2,4% |
| 18 | **Lava-roupa — Abertura Superior** | **2** | 0,6% | 2 | 2,4% |
| 19 | **Coifa — Ilha** | **1** | 0,3% | 1 | 1,2% |

> **Itens informados dentro de `Outros` (12 ocorrências):** Frigobar (2), Aquecedor a gás (2 + 1 digitado `"Aquecerdo"`), Air fryer / Fritadeira elétrica (3), Cervejeira (2), Adega (1) e 1 `"Geladeira"` lançada em `Outros`.

### 2.3 Padrões de Cozinha Observados

- **Cooktop domina sobre Fogão:** `Cooktop` aparece em **52 checklists (62,7%)** contra **19 com `Fogão` (22,9%)** *(2 checklists traziam ambos)*.
- **Combinação clássica (`Cooktop + Forno + Depurador/Coifa`):** presente em **25 checklists (30,1%)**; `Cooktop + Forno` sem depurador aparece em mais **14 checklists (16,9%)**.
- **Microondas:** **80%** são de bancada/nicho (`Normal`: 48 vs `Embutido`: 12).
- **Forno:** **73,5%** são `Embutido` (`36` vs `13` Normal).
- **Depurador vs. Coifa:** `Depurador` responde por **93,2%** da exaustão (`41` vs `3` Coifas) — e quase metade dos depuradores já é **Embutido** (`18` de `41`, **43,9%**), justamente o item mais crítico para medidas de nicho.
- **Lava-roupa:** **90,9%** são `Abertura Frontal` / Lava e Seca (`20` de `22`).

---

## 3. Ranking de Marcas Mais Usadas

A marca foi identificada em **277 dos 337 itens (82,2%)**, combinando o texto do campo `Modelo` e a URL do produto em `Link` *(nos demais 60 itens, o campo estava em branco ou genérico como `"a definir"`, `"4 boca"`, `"Usar tamanho padrão"` ou link encurtado sem nome)*.

### 3.1 Ranking Geral de Marcas

| Pos. | Marca | Ocorrências | % dos 277 identificados | Principais categorias onde aparece |
|---:|---|---:|---:|---|
| 1 | **Electrolux** | **128** | 46,2% | Forno (27), Microondas (23), Cooktop (20), Refrigerador (20), Lava-louça (19), Depurador (8), Fogão (7) |
| 2 | **Brastemp** | **37** | 13,4% | Refrigerador (13), Microondas (7), Cooktop (6), Lava-louça (6), Fogão (4), Forno (1) |
| 3 | **Suggar** | **25** | 9,0% | Depurador (23), Cooktop (1), Forno (1) |
| 4 | **Consul** | **12** | 4,3% | Fogão (3), Refrigerador (3), Microondas (2), Forno (2), Cooktop (1), Cervejeira (1) |
| 5 | **LG** | **10** | 3,6% | Lava-roupa (8), Microondas (1), Refrigerador (1) |
| 6 | **Samsung** | **8** | 2,9% | Lava-roupa (7), Refrigerador (1) |
| 7 | **Midea** | **8** | 2,9% | Microondas (3), Lava-roupa (2), Cooktop (1), Forno (1), Lava-louça (1) |
| 8 | **Philco** | **8** | 2,9% | Microondas (4), Forno (3), Depurador (1) |
| 9 | **Dako** | **7** | 2,5% | Cooktop (5), Fogão (2) |
| 10 | **Panasonic** | **6** | 2,2% | Microondas (3), Refrigerador (2), Lava-roupa (1) |
| 11 | **Continental** | **5** | 1,8% | Forno (4), Refrigerador (1) |
| 12 | **Oster** | **5** | 1,8% | Cooktop (3), Coifa (2) |
| 13 | **Fischer** | **5** | 1,8% | Cooktop (3), Forno (1), Depurador (1) |
| 14 | **Itatiaia** | **3** | 1,1% | Cooktop (3) |
| 15 | **Mondial** | **3** | 1,1% | Microondas (2), Air fryer (1) |
| 16 | **Britânia** | **2** | 0,7% | Forno (1), Air fryer (1) |
| 17 | **Rinnai** | **2** | 0,7% | Aquecedor a gás (2) |
| 18 | **Toshiba** | **1** | 0,4% | Microondas (1) |
| 19 | **Venax** | **1** | 0,4% | Forno (1) |
| 20 | **Hisense** | **1** | 0,4% | Lava-roupa (1) |

> **Concentração de mercado:** **Electrolux + Brastemp + Suggar** somam **68,6%** de todas as marcas especificadas; somando **Consul**, **LG**, **Samsung**, **Midea** e **Philco**, o Top 8 cobre **84,8%**.

### 3.2 Liderança de Marcas por Categoria

| Categoria | Itens c/ marca | Ranking de Marcas |
|---|---:|---|
| **Forno** | 42 | **Electrolux (27 — 64,3%)**, Continental (4), Philco (3), Consul (2), Brastemp/Midea/Fischer/Britânia/Suggar/Venax (1 cada) |
| **Microondas** | 46 | **Electrolux (23 — 50,0%)**, Brastemp (7), Philco (4), Midea (3), Panasonic (3), Consul (2), Mondial (2), LG (1), Toshiba (1) |
| **Cooktop** | 43 | **Electrolux (20 — 46,5%)**, Brastemp (6), Dako (5), Itatiaia (3), Oster (3), Fischer (3), Suggar/Midea/Consul (1 cada) |
| **Refrigerador** | 41 | **Electrolux (20 — 48,8%)**, Brastemp (13 — 31,7%), Consul (3), Panasonic (2), Samsung/LG/Continental (1 cada) |
| **Depurador** | 33 | **Suggar (23 — 69,7%)**, Electrolux (8 — 24,2%), Fischer (1), Philco (1) |
| **Lava-louça** | 26 | **Electrolux (19 — 73,1%)**, Brastemp (6 — 23,1%), Midea (1) |
| **Lava-roupa** | 21 | **LG (8 — 38,1%)**, **Samsung (7 — 33,3%)**, Electrolux (2), Midea (2), Panasonic (1), Hisense (1) |
| **Fogão** | 16 | **Electrolux (7 — 43,8%)**, Brastemp (4), Consul (3), Dako (2) |
| **Coifa** | 3 | **Oster (2)**, Electrolux (1) |

---

## 4. Ranking de Modelos / Códigos (SKU) Mais Informados

Como os clientes digitam os modelos em texto livre (às vezes só a marca, às vezes o código exato ou o título copiado do site), os códigos exatos ficam bem mais pulverizados do que as marcas. Ainda assim, vários SKUs aparecem com clara recorrência por categoria:

### 4.1 Top Modelos Específicos Identificados (2+ ocorrências)

| Pos. | Marca e Modelo (SKU) | Categoria | Ocorrências |
|---:|---|---|---:|
| 1 | **Electrolux KE4GR** *(inclui KED4GR)* | Cooktop Gás 4 Bocas | **6** *(5 KE4GR + 1 KED4GR)* |
| 2 | **Suggar DE61IX** | Depurador Embutir 60cm Inox | **5** |
| 3 | **Electrolux ME3EP** | Microondas Embutir 34L | **5** *(4 em Microondas + 1 lançado errado em Forno)* |
| 4 | **Electrolux OE5EA** *(+1 OE5EOA)* | Forno Embutir Elétrico 50L | **5** *(+1 variante OE5EOA)* |
| 5 | **Electrolux OE8EA** | Forno Embutir Elétrico 80L | **4** |
| 6 | **Continental OC4GM** | Forno Embutir a Gás 50L | **3** |
| 7 | **Electrolux MI41S** | Microondas Normal 31L Inox | **3** |
| 8 | **Electrolux LP10E** | Lava-louça 10 Serviços Preta | **3** |
| 9 | **Electrolux LS10E** | Lava-louça 10 Serviços Prata | **3** |
| 10 | **Electrolux OE8GH** | Forno Embutir a Gás 80L | **3** |
| 11 | **Electrolux DE6RB** | Depurador Embutir Retrátil 60cm | **3** |
| 12 | **Brastemp BRO85MK** *(French Door)* | Refrigerador Side by Side / 3 Portas | **3** |
| 13 | **Brastemp BDD61BE** | Cooktop Gás 4 Bocas | **2** |
| 14 | **Electrolux KE4GC** | Cooktop Gás 4 Bocas | **2** |
| 15 | **Electrolux IE60P** | Cooktop Indução 4 Zonas | **2** |
| 16 | **Electrolux MT30S** *(+1 MTO30)* | Microondas Normal 20L | **2** *(+1 MTO30)* |
| 17 | **Electrolux ME23S** | Microondas Normal 23L Prata | **2** |
| 18 | **Philco PME25** | Microondas Normal 20L | **2** |
| 19 | **Suggar DI601PT / DI602PT** | Depurador Slim Normal 60cm Preto | **2** |
| 20 | **Electrolux DE6SB** | Depurador Normal 60cm Preto | **2** |
| 21 | **Electrolux DE6RS** | Depurador Embutir 60cm Inox | **2** |
| 22 | **Electrolux IM7S** | Refrigerador 3 Portas 484L | **2** |
| 23 | **Electrolux IB51S** | Refrigerador Inverse 490L | **2** |
| 24 | **Electrolux ES40B** | Refrigerador Side by Side 431L | **2** |
| 25 | **Electrolux LL10X** | Lava-louça 10 Serviços Inox | **2** |
| 26 | **Brastemp BLF60AR** | Lava-louça 14 Serviços Inox | **2** |
| 27 | **Consul CFO4VAR** | Fogão Piso 4 Bocas | **2** |

### 4.2 Perfil Técnico por Categoria (Capacidades e Especificações)

- **Cooktop (54 itens):**
  - **Bocas:** **4 bocas** domina (**29** identificados), seguido de **5 bocas** (**7**) e **2 bocas** (**1**); 17 não especificaram bocas.
  - **Tipo:** **Gás** (**24**) vs **Indução** (**13** — já representa ~35% dos cooktops identificados, com destaque para Electrolux `IE60P`/`IE4TW`/`IE6LP`/`IE80P`, Dako `Supreme`/`Diplomata` e Oster); 17 sem indicação de gás/indução.
- **Depurador (41 itens):**
  - **Largura:** **60 cm** é absoluta maioria (**37 de 41 = 90,2%**, somando modelo + medida informada); **80 cm** apareceu 3 vezes e **90 cm** apenas 1 vez (`DE9RB`).
- **Lava-louça (29 itens):**
  - **Capacidade (19 identificados):** **10 serviços** (8), **8 serviços** (5), **14 serviços** (5) e **9 serviços** (1).

### 4.3 Medidas Mais Comuns (`L × A × P` em cm)

Desconsiderando erros de unidade (convertendo para **cm** valores digitados em **mm** `>250` e alturas em **m** `<=2,5`; remover essas linhas em vez de converter mantém exatamente os mesmos líderes):

| Categoria | Medidas mais frequentes (`L × A × P` em cm) | Faixas predominantes |
|---|---|---|
| **Cooktop** *(53 c/ medida)* | `60 × 13,1 × 45` (8x)<br>`56,5 × 8,6 × 46` (2x)<br>`59 × 4,4 × 52` (2x) | **Largura:** `55–60 cm` (**37/53** = 4 bocas, pico em `59` e `60`); `70–76 cm` (**8/53** = 5 bocas); `78–85 cm` (4x).<br>**Profundidade:** `45–46 cm` (22x) e `49–53 cm` (21x). *(Há casos com A × P invertidos.)* |
| **Microondas — Normal** *(46)* | `46,1 × 29 × 35,2` (4x)<br>`45,5 × 26,2 × 34,8` (2x)<br>`52,1 × 32,6 × 42,5` (2x)<br>`55,3 × 31,1 × 46,7` (2x) | **Compacto (~20 L):** L `45–46,5 cm` (16x) × A `26–30 cm` × P `34–36 cm`<br>**Grande (~30–35 L):** L `51–56 cm` (21x) × A `31–34 cm` × P `38–47 cm` |
| **Microondas — Embutido** *(12)* | `59,4 × 37,3 × 40` (2x)<br>Padrão `59,4–59,5 × 37,3–38,9 × 40–48` | **Largura:** `56–60 cm` (**9/12**, pico `59,4–59,5`)<br>**Altura:** `37–39 cm` (**10/12**) · **Prof.:** `40–48 cm` (pico `40 cm`, 4x) |
| **Forno — Embutido** *(36)* | `59,6 × 59,6 × 61,3` (10x — 80 L)<br>`59,6 × 45,6 × 61,3` (8x — 50 L)<br>`60 × 60 × 60` (3x)<br>`59,6 × 45,6 × 57,5` (2x) | **Largura:** `59–60 cm` (**32/36** = 88,9%)<br>**Altura:** `59–60 cm` (**19/36** = 80 L) ou `45–47 cm` (**13/36** = 50 L)<br>**Profundidade:** `57–62 cm` (**31/36**, pico `61,3 cm`) |
| **Forno — Normal** *(12)* | `60 × 60 × 60` (2x)<br>Bancada ~`54–61 × 32–37 × 40–53` | **Largura:** `54–61 cm` (pico `60 cm`, 4x). Mistura fornos de bancada (A `32–37 cm`) com modelos de 60 cm. |
| **Depurador — Normal** *(23)* | `60 × 8,5 × 48` (12x) | **Largura:** `60 cm` (**22/23** = 95,7%) · **Altura:** `8–8,5 cm` (16x) · **Prof.:** `48–50 cm` (16x) |
| **Depurador — Embutido** *(18)* | `60 × 17,6 × 48,8` (3x)<br>`60 × 17,6 × 28,4` (2x)<br>`60,5 × 21,5 × 29,8` (2x) | **Largura:** `60 cm` (**15/18**, pico `60–60,5`); `80 cm` (2x); `90 cm` (1x)<br>**Profundidade:** retráteis fechados (`28,4–29,8 cm`, 6x) vs embutidos fundos (`45–48,8 cm`, 6x) |
| **Refrigerador — Duplex** *(26)* | `62,1 × 176,6 × 72,1` (2x)<br>Comuns: `60–62 × 176–180 × 70–74` | **Largura:** `59–63 cm` (**12/26**) e `68–72 cm` (**9/26**)<br>**Altura:** `175–190 cm` · **Prof.:** `68–75 cm` (**24/26**) |
| **Refrigerador — Inverse** *(16)* | `69,9 × 189,5 × 74,9` (2x) | **Largura:** `69–72 cm` (**10/16**); `60–62 cm` (3x); `83–84 cm` (3x)<br>**Altura:** `184–195 cm` (pico `189–190 cm`) · **Prof.:** `70–75 cm` |
| **Refrigerador — Side by Side** *(6)* | `83,6 × 185,7 × 79,3` (3x) | **Largura:** `83,5–89,5 cm` (**6/6**) · **Altura:** `178–195 cm` · **Prof.:** `73–79,3 cm` (5/6) |
| **Lava-louça — Piso** *(20)* | `44,8 × 84,5 × 60` (6x) | **Largura:** `45 cm` / 8–9 serv. (**9/20**); `55 cm` / 10 serv. (**4/20**); `60 cm` / 14 serv. (**4/20**)<br>**Altura:** `84–85 cm` (13/20) · **Prof.:** `58–61 cm` (13/20) |
| **Lava-louça — Embutido** *(9)* | `55 × 60 × 50` (3x)<br>`55 × 60,9 × 50` (2x) | **Largura:** `55 cm` (**6/9**) · **Altura:** `59,5–61 cm` (6/9) · **Prof.:** `50 cm` (6/9) |
| **Lava-roupa — Frontal** *(20)* | `60 × 85 × 60` (3x)<br>`60 × 85 × 65` (3x)<br>`60 × 85 × 56,5` (2x)<br>`58 × 84 × 61` (2x) | **Largura:** `58–60 cm` (**17/20** = 85%)<br>**Altura:** `84–85 cm` (**18/20** = 90%)<br>**Profundidade:** `56–66 cm` (**19/20** = 95%) |
| **Fogão — Piso** *(12)* | `51,8 × 94,8 × 60,3` (2x) | **Largura:** `50–53 cm` (4x, 4 bocas); `57–60 cm` (2x); `76 cm` (2x, 5 bocas)<br>**Altura:** `86–95,5 cm` · **Prof.:** `57–65 cm` |
| **Fogão — Embutido** *(7)* | `55,5 × 64 × 65` (2x) | **Largura:** `55,5–60 cm` (4/7, 4 bocas) e `77,8–81,3 cm` (2/7, 5 bocas)<br>**Altura:** `64–68,5 cm` · **Prof.:** `61–68,3 cm` |

---

## 5. Qualidade do Preenchimento e Anomalias Observadas

A análise direta das 337 linhas preenchidas revelou gargalos práticos no uso atual da Checklist Dinâmica pelos clientes/vendedores:

1. **Completude dos campos:**
   - **L×A×P preenchidos:** `333 / 337` (**98,8%**).
   - **Modelo preenchido:** `285 / 337` (**84,6%**) — porém muitos vêm apenas com o nome da marca (`"Electrolux"`, `"Suggar"`) ou frase genérica (`"Usar tamanho padrão"`, `"a definir"`).
   - **Link informado:** `191 / 337` (**56,7%**), sendo **181 com URL válida** (`http...`). Em vários casos, o cliente deixou o `Modelo` em branco mas colocou o link completo do produto.
2. **Medidas fora de escala (risco de erro na marcenaria):**
   - **86 campos de medida `> 250`** (digitados provavelmente em **milímetros** em vez de **centímetros** — ex.: cooktop `565 x 450`, forno `595 x 595 x 575`, geladeira `695 x 195 x 751`).
   - **4 alturas `<= 2,5`** em geladeira/lavadora (digitadas em **metros** em vez de cm — ex.: `1,8` e `1,9` para geladeira, `1,1` para lavadora).
   - **Inversão de eixos:** ex. cooktop com `5,0 (L) x 536,0 (A) x 350,0 (P)`.
3. **Colagem de página inteira / URL no campo `Modelo`:**
   - **8 itens** com texto acima de 100 caracteres (antes ou em versões sem o corte de `limitarModelo`, incluindo 1 página inteira da Consul e 1 lista de nomes de imagens da Electrolux) e **4 itens** onde a URL foi colada direto dentro de `Modelo`.
4. **Inconsistência entre `Tipo` selecionado e o produto real (`4 casos` encontrados):**
   - Um cooktop de indução Dako Diplomata foi lançado como **`Fogão — Embutido`**.
   - Uma lava-louça Electrolux `LL10X` foi lançada como **`Lava-roupa — Abertura Frontal`**.
   - Um depurador Electrolux `DE6SB` foi lançado como **`Coifa — Parede`**.
   - Um micro-ondas Electrolux `ME3EP` foi lançado também como **`Forno — Normal`**.

---

## 6. Recomendações Práticas para a Checklist Dinâmica

Sem alterar a simplicidade do formulário (seguindo a mesma ideia do combobox editável pensado para os puxadores):

1. **Sugestões de Marca / Modelo (opcional, combobox editável):**
   - Se for adicionar autocomplete no campo **Modelo** (ou um campo auxiliar **Marca**), priorizar por tipo:
     - **Geral / Cozinha:** `Electrolux`, `Brastemp`, `Consul`, `Midea`, `Philco`, `Continental`, `Dako`, `Fischer`, `Oster`, `Panasonic`.
     - **Depurador:** `Suggar`, `Electrolux`, `Fischer`, `Philco`.
     - **Lava-roupa:** `LG`, `Samsung`, `Electrolux`, `Midea`.
   - Para **Depurador Embutido**, que já é **43,9%** dos depuradores e exige modelo+link obrigatórios, o `Suggar DE61IX` e os `Electrolux DE6RB`/`DE6RS` sozinhos já cobrem boa parte dos casos.
2. **Alerta de unidade em centímetros (L×A×P):**
   - Como **86 medidas** vieram em milímetros (`> 250`) e **4 alturas** vieram em metros (`<= 2,5`), um aviso visual leve (*"Confirme: a medida é em cm, não em mm/m"*) quando `valor > 250` (ou `< 3` em altura de refrigerador/fogão) evitaria o erro mais comum do preenchimento atual.
