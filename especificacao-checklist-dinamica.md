# Checklist Dinâmica — By Arabi Planejados
## Especificação Técnica do Projeto
**Atualizado em:** 18/04/2026

---

## 1. Objetivo

Sistema web de coleta guiada de informações técnicas para liberação de projetos de móveis planejados. O cliente acessa via link enviado pelo vendedor, preenche o formulário e gera um PDF estruturado enviado para a equipe de liberação. O vendedor continuará fazendo sua parte técnica separadamente. A base de código será reutilizada futuramente para a **Checklist Técnica do Vendedor**.

---

## 2. Fluxo Operacional

1. Vendedor envia o link ao cliente
2. Cliente preenche (sozinho ou com o vendedor presencialmente)
3. Sistema valida, gera clientes cientes automáticos e calcula score de risco
4. Cliente baixa o PDF
5. PDF é enviado para a liberação pelo fluxo atual

---

## 3. Estrutura do Formulário

### Etapa 1 — Identificação

- Nome completo
- Número do contrato — placeholder com siglas das lojas: `IT, SM, TA, PIN, STA` (ex.: IT01234)
- CEP — autofill via API ViaCEP (pública, sem backend, funciona no GitHub Pages)
- Endereço + complemento
- Telefone/celular

---

### Etapa 2 — Seleção de Ambientes

Cliente marca os ambientes adquiridos e define quantidades via setas ↕:

| Ambiente | QTD |
|---|---|
| Cozinha / Área de Serviço | ↕ |
| Dormitório Casal | ↕ |
| Dormitório Solteiro | ↕ |
| Banheiro / W.C. | ↕ |
| Home / Sala | ↕ |
| Office | ↕ |
| Varanda / Área Gourmet | ↕ |
| Outros (campo aberto) | ↕ |

**Regras:**
- Quantidade > 1 → gera repetições com campo de nome para distinguir (ex: "Dormitório Amélia", "Dormitório Felipe")
- Somente ambientes selecionados aparecem nas etapas seguintes
- Ambiente "Outros" recebe o mesmo conjunto completo de perguntas

---

### Etapa 3 — Perguntas Globais
> Feitas uma única vez, valem para todos os ambientes selecionados

#### G1 — Iluminação Externa
**Pergunta:** "O projeto terá alguma iluminação embutida na marcenaria adquirida externamente à By Arabi? (fitas de LED, spots, etc.)"
- Se **SIM** → "Em quais ambientes?" *(botões com os ambientes selecionados)*

> **CC:** CLIENTE CIENTE E DE ACORDO QUE FIAÇÃO ELÉTRICA, INSTALAÇÃO DE ILUMINAÇÕES E SERVIÇOS DE ELETRICISTA É POR SUA RESPONSABILIDADE, PROFISSIONAL DEVE ESTAR LOCAL NO DIA DA MONTAGEM.

🟡 **Risco: Médio +2**

---

#### G2 — Reforma
**Pergunta:** "Algum ambiente está em reforma?"
- Se **SIM** → "Quais ambientes?" *(botões)*

**G2.1** — "As paredes já possuem reboco (argamassa) finalizado?"
- Se **NÃO** → Pop-up de aviso RISCO ALTO

> **CC:** CLIENTE CIENTE E DE ACORDO QUE MEDIÇÃO TÉCNICA DE AMBIENTE FOI REALIZADA COM AMBIENTE EM REFORMA INACABADA E QUE DEVERÁ RESPEITAR A ALÍNEA (I) DA CLÁUSULA TERCEIRA DO CONTRATO DE COMPRA E VENDA.

🔴 **Risco: ALTO DIRETO** *(sozinho já classifica como alto, sem somatório de pontos)*

**G2.2** — "O revestimento final das paredes já está aplicado?"
*(exibido se G2 = SIM e G2.1 = SIM)*
- Se **NÃO** → mesmo CC de G2.1

🔴 **Risco: Alto +3**

> ⚠️ **Regra de supressão:** se G2.1 já gerou o CC, G2.2 não gera novamente. Se G2.1 = SIM mas G2.2 = NÃO, gera o CC normalmente.

---

#### G3 — Pontos Elétricos / Hidráulicos / Gás
**Pergunta:** "Os pontos elétricos/hidráulicos/gás já estão nas posições finais em todos os ambientes?"
- Se **NÃO** → "Em quais ambientes ainda não estão?" *(botões)*

> **CC:** CLIENTE CIENTE E DE ACORDO QUE DEVERÁ ALTERAR E/OU PROVIDENCIAR PONTOS ELÉTRICOS/HIDRÁULICOS/GÁS ATÉ O DIA DA MONTAGEM, PARA CORRETA ADEQUAÇÃO DO PROJETO.

🟡 **Risco: Médio +2**

---

#### G4 — Rebaixo de Teto
**Pergunta:** "Algum ambiente terá rebaixo de teto?"
- Se **SIM** → "Quais ambientes?" *(botões com os ambientes selecionados)*
- Ao marcar cada ambiente → campo numérico inline: **"Quantos cm será rebaixado?"**

> **CC** *(por ambiente):* CLIENTE CIENTE E DE ACORDO QUE DEVERÁ FINALIZAR O REBAIXO DE TETO EM **[X]cm** ATÉ O DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO.

🟢 **Risco: Baixo +1 por ambiente**

---

### Etapa 4 — Perguntas por Ambiente

---

#### 🍳 Cozinha / A.S. / Varanda

**P1 — Granito ou pia existente?**
- Se SIM → "Os móveis serão adaptados para este granito/pia?"
  - Se NÃO:
  > **CC:** CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR GRANITO EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO.
  
  🟡 Risco: Médio +2

**P2 — Existe tanque no local?**
- Se SIM → "Haverá móveis na região do tanque?"
  - Se SIM:
  > **CC:** CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR TANQUE EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO.
  
  🟡 Risco: Médio +2

**P3 — Eletrodomésticos definidos?**
- "Já possui ou tem intenção de compra específica dos eletrodomésticos?"
- Se NÃO:
  > **CC:** CLIENTE CIENTE E DE ACORDO QUE OS ELETRODOMÉSTICOS NÃO FORAM DEFINIDOS NO PROJETO E DEVERÃO SER ADQUIRIDOS DE ACORDO COM OS VÃOS PREVISTOS.
  
  🟢 Risco: Baixo +1

- Se SIM → seleção por botões:

| Eletro | Tipos |
|---|---|
| Fogão | Piso / Embutido |
| Cooktop | — |
| Refrigerador | Duplex / Inverse / Side by Side |
| Microondas | Normal / Embutido |
| Forno | Normal / Embutido |
| Depurador | Normal / Embutido |
| Coifa | Parede / Ilha |
| Lava-louça | Piso / Embutido |
| Lava-roupa | Ab. Frontal / Ab. Superior |
| Outros | campo aberto |

Após seleção → para cada eletro: **Tipo + Modelo + Largura (cm) + Altura (cm) + Profundidade (cm) + Link (opcional)**

**P4 — Observações** *(campo livre, máx. 300 caracteres)*

---

#### 🛏 Dormitório Casal / Solteiro

**P1 — Tamanho da cama**

| Opção | Dimensões |
|---|---|
| Solteiro | 0,88 × 1,88m |
| Padrão | 1,38 × 1,88m |
| Queen | 1,58 × 1,98m |
| King | 2,00 × 2,03m |
| Outro | campos: largura e comprimento em cm |

**P2 — TV no ambiente?**
- Se SIM → "O ponto elétrico da TV já está na posição final?"
  - Se NÃO:
  > **CC:** CLIENTE CIENTE E DE ACORDO QUE DEVERÁ DESLOCAR OS PONTOS ELÉTRICOS PARA DENTRO DA POSIÇÃO DO PAINEL DE TV ATÉ O DIA DA MONTAGEM PARA OCULTAÇÃO ADEQUADA DA FIAÇÃO.
  
  🟡 Risco: Médio +2
  
  - Se SIM → Dados da TV: **Polegadas (obrigatório) / Modelo / Largura (cm) / Altura (cm) / Profundidade (cm) / Link (opcional)**

**P3 — Cortineiro no ambiente?**
- Se SIM → "O cortineiro já está instalado?"
  - Se NÃO:
  > **AVISO** CLIENTE CIENTE E DE ACORDO QUE SERÁ CONSIDERADO VÃO DE 150MM PARA CORTINEIRO NÃO INSTALADO.
  

**P4 — Rodapé na região dos móveis?**
- Se SIM:
  > **AVISO** *(não é CC):* ROUPEIROS SERÃO INSTALADOS À FRENTE DO RODAPÉ EXISTENTE, COM ACABAMENTO EM MEIA-CANA NA PARTE DE TRÁS.

- Se NÃO:
  > **CC:** CLIENTE CIENTE E DE ACORDO QUE NÃO DEVERÁ INSTALAR RODAPÉ NA REGIÃO DOS MÓVEIS ATÉ A FINALIZAÇÃO DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO.
  
  🟢 Risco: Baixo +1

**P5 — Observações** *(campo livre, máx. 300 caracteres)*

---

#### 🖥 Home / Sala / Office
*(mesmas perguntas do Dormitório, exceto cama — adiciona eletrônicos)*

**P1 — Eletrônicos no ambiente?**
- Se SIM → seleção: **TV / Home Theater / Videogame / Computador / Outros**
  - Para cada eletrônico: Tipo + Modelo + Largura (cm) + Altura (cm) + Link (opcional)
- Se NÃO:
  > **CC:** CLIENTE CIENTE E DE ACORDO QUE OS ELETRÔNICOS NÃO FORAM DEFINIDOS NO PROJETO E DEVERÃO SER ADQUIRIDOS DE ACORDO COM OS VÃOS PREVISTOS.
  🟢 Risco: Baixo +1

**P2** — TV: mesmas perguntas e CC do Dormitório
**P3** — Cortineiro: mesmo AV do Dormitório
**P4** — Rodapé: mesmo CC do Dormitório
**P5 — Observações** *(campo livre, máx. 300 caracteres)*

---

#### 🚿 Banheiro / W.C.

**P1 — Granito ou pia existente?**
- Se SIM → "Os móveis serão adaptados?"
  - Se NÃO → mesmo CC da Cozinha *(DEVERÁ RETIRAR GRANITO EXISTENTE...)*
  
  🟡 Risco: Médio +2

**P2 — Tipo de cuba**

| Opção |
|---|
| Embutir |
| Semi-encaixe |
| Sobrepor / Apoio |
| Esculpida |


**P3 — Observações** *(campo livre, máx. 300 caracteres)*

---

## 4. Regra do Score de Risco

Score calculado **por ambiente** + **score global**.

### Classificação

| Score | Condição |
|---|---|
| 🔴 **ALTO** | Qualquer critério alto disparado **OU** pontuação total ≥ 7 |
| 🟡 **MÉDIO** | Nenhum alto + pontuação entre 3 e 6 |
| 🟢 **BAIXO** | Nenhum alto + pontuação ≤ 2 |

### Tabela de Pontos

| Gatilho | Nível | Pontos | Ambientes |
|---|---|---|---|
| Ambiente em reforma sem reboco finalizado | 🔴 Alto | DIRETO | Global |
| Revestimento de paredes não aplicado | 🔴 Alto | +3 | Global |
| Iluminação externa à By Arabi | 🟡 Médio | +2 | Global |
| Pontos elétricos/hidráulicos/gás indefinidos | 🟡 Médio | +2 | Global |
| Granito existente a ser retirado | 🟡 Médio | +2 | Cozinha, Banheiro |
| Tanque existente a ser retirado | 🟡 Médio | +2 | Cozinha |
| Ponto da TV fora da posição final | 🟡 Médio | +2 | Dorm., Home, Office |
| Rebaixo de teto previsto | 🟢 Baixo | +1 | por ambiente |
| Eletros/eletrônicos não definidos | 🟢 Baixo | +1 | Cozinha, Home |
| Rodapé ausente (aviso de não instalar) | 🟢 Baixo | +1 | Dorm., Home, Office |
| Cortineiro não instalado | 🟢 Baixo | +1 | Dorm., Home, Office |

### Regras Especiais

- Critério alto sozinho já eleva para ALTO independente da pontuação total
- Vários médios acumulados (≥ 7 pontos) também elevam para ALTO
- Se G2.1 (sem reboco) gerar CC, G2.2 (sem revestimento) suprime CC duplicado
- Score por ambiente é independente; score global reflete o pior ambiente

---

## 5. Estrutura do PDF Gerado

### Página 1 — Capa
- Logotipo By Arabi (conforme skill)
- Nome do cliente / Contrato / Data de preenchimento
- Score de risco global destacado

### Página 2 — Resumo Executivo
Exibe apenas pontos que geraram clientes cientes **Alto** e **Médio**.

```
🔴 RISCO ALTO — [AMBIENTE]
   • [Descrição do problema]
   → CC: [texto resumido]

🟡 RISCO MÉDIO — [AMBIENTE]
   • [Descrição do problema]

🟢 BAIXOS: [linha única agrupada com todos os baixos]
```

> Objetivo: triagem rápida para a equipe de liberação, máx. 1 página.
> Conteúdo exato a validar com David e Erika.

### Páginas Seguintes — Checklist Completa
- Respostas organizadas por ambiente
- Clientes Cientes aparecem imediatamente abaixo da resposta que os gerou
- Avisos (não-CC) também posicionados junto à pergunta de origem

---

## 6. Tecnologia

| Item | Decisão |
|---|---|
| Framework | React (componentes modulares por ambiente) |
| Hospedagem | GitHub Pages (sem backend inicialmente) |
| CEP | API ViaCEP (pública, sem autenticação) |
| PDF | Geração client-side (jsPDF ou similar) |
| Arquitetura | Modular e escalável — preparada para backend, login e banco de dados no futuro |
| Visão de produto | Base reutilizável para Checklist Técnica do Vendedor |

---

## 7. Pendências / Próximos Passos

- [ ] Validar Resumo Executivo com David e Erika
- [ ] Iniciar desenvolvimento — componente 1: Cabeçalho + Seleção de Ambientes
