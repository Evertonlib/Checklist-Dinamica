import { assertSemRede } from './auxiliares/travas.js'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { formatarNomeAmbiente } from '../src/domain/ambientes.js'
import { carregarPdf } from './auxiliares/carregar_pdf.js'
import { DATA_05_03_2026 } from './auxiliares/relogio.js'
import { montarEstadoCliente, eletro, eletronico, tv55, MEDIDAS } from './auxiliares/construtores.js'
import { secao, sequencia, textoSeguinte, ausencia, tabelasCom } from './auxiliares/leitura_pdf.js'

after(() => assertSemRede())

// Falha alta: sem esbuild ou com empacotamento quebrado, o arquivo inteiro não carrega
const pdf = await carregarPdf()

// --- Perguntas do PDF, por extenso (Spec, seção 6) ---
const G1 =
  'G1 — O projeto terá alguma iluminação embutida na marcenaria adquirida externamente à By Arabi? (fitas de LED, spots, etc.)'
const G2 = 'G2 — Todos os ambientes já possuem reboco (argamassa) finalizado nas paredes?'
const G3 = 'G3 — Todos os ambientes já possuem revestimento final (azulejo, porcelanato etc.) aplicado nas paredes?'
const G4 = 'G4 — Os pontos elétricos/hidráulicos/gás já estão nas posições finais em todos os ambientes?'
const G5 = 'G5 — Algum ambiente terá rebaixo de teto?'
const P_ELETROS = 'Já possui ou tem intenção de compra específica dos eletrodomésticos?'
const P_ELETRONICOS = 'Possui ou pretende adquirir eletrônicos para este ambiente?'
const P_PONTO_TV = 'O ponto elétrico da TV já está na posição final?'
const P_TERA_TV = 'Terá TV neste ambiente?'
const P_CAMA = 'Qual o tamanho da cama neste ambiente?'
const P_RODAPE = 'Existe rodapé na região dos móveis?'

// --- Trechos de identificação dos CCs no PDF (o texto completo é conferido só no grupo C) ---
const T_ILUM = { comeca: 'CC: CLIENTE CIENTE E DE ACORDO QUE FIAÇÃO ELÉTRICA, INSTALAÇÃO DE ILUMINAÇÕES' }
const T_REBOCO = {
  comeca: 'CC: CLIENTE CIENTE E DE ACORDO QUE MEDIÇÃO TÉCNICA DE AMBIENTE FOI REALIZADA COM AMBIENTE EM REFORMA INACABADA',
}
const T_REVEST = { comeca: 'CC: CLIENTE CIENTE E DE ACORDO QUE A MEDIÇÃO TÉCNICA FOI REALIZADA SEM O REVESTIMENTO FINAL DAS PAREDES' }
const T_PONTOS = { comeca: 'CC: CLIENTE CIENTE E DE ACORDO QUE DEVERÁ ALTERAR E/OU PROVIDENCIAR PONTOS' }
const T_REBAIXO = (cm) => ({ comeca: 'CC: ', contem: `REBAIXO DE TETO EM ${cm}CM` })
const T_GRANITO = { comeca: 'CC: CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR GRANITO EXISTENTE' }
const T_TANQUE = { comeca: 'CC: CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR TANQUE EXISTENTE' }
const T_TV = {
  comeca: 'CC: CLIENTE CIENTE E DE ACORDO QUE DEVERÁ DESLOCAR OS PONTOS ELÉTRICOS PARA DENTRO DA POSIÇÃO DO PAINEL DE TV',
}
const T_ELETROS = { comeca: 'CC: CLIENTE CIENTE E DE ACORDO QUE OS ELETRODOMÉSTICOS NÃO FORAM DEFINIDOS' }
const T_ELETRONICOS = { comeca: 'CC: CLIENTE CIENTE E DE ACORDO QUE OS ELETRÔNICOS NÃO FORAM DEFINIDOS' }
const T_RODAPE = { comeca: 'CC: CLIENTE CIENTE E DE ACORDO QUE DEVERÁ INSTALAR RODAPÉ NA REGIÃO DOS MÓVEIS' }
const A_RODAPE = { comeca: 'ROUPEIROS SERÃO INSTALADOS À FRENTE DO RODAPÉ EXISTENTE' }
const A_CORT = { comeca: 'AVISO: SERÁ CONSIDERADO VÃO DE APROXIMADAMENTE 150MM' }

const CAB_RESUMO = ['Ambiente', 'Ações e pontos de atenção', 'Risco']
const CAB_ITENS = ['Tipo', 'Modelo', 'Largura (cm)', 'Altura (cm)', 'Prof. (cm)', 'Link']

// Gera o PDF e devolve a captura e a fatia de cada ambiente, pelo instanceId
async function gerar(lista, global, identificacao, data) {
  const estado = montarEstadoCliente(lista, global, identificacao)
  const captura = await pdf.cliente(estado, data)
  const nomes = estado.ambientesSelecionados.map((a) => formatarNomeAmbiente(a))
  const secoes = {}
  estado.ambientesSelecionados.forEach((a, i) => {
    secoes[a.instanceId] = secao(captura, nomes[i], nomes)
  })
  return { estado, captura, secoes }
}

// ---------- Capa e resumo ----------

test('T-P01 — nome do arquivo com contrato e data fixa', async () => {
  const { captura } = await gerar([{ tipo: 'cozinha' }])
  assert.deepEqual(captura.saves, ['Checklist_Cliente_TA9001_2026-10-19.pdf'])
})

test('T-P02 — data com zero à esquerda no arquivo e na capa', async () => {
  const { captura } = await gerar([{ tipo: 'cozinha' }], {}, {}, DATA_05_03_2026)
  assert.deepEqual(captura.saves, ['Checklist_Cliente_TA9001_2026-03-05.pdf'])
  assert.ok(captura.textos.includes('Data: 05/03/2026'))
})

test('T-P03 — capa completa: endereço, CEP, telefone, data e risco sem pontos (H-12)', async () => {
  const { captura } = await gerar([{ tipo: 'cozinha' }], {}, {
    complemento: 'Fundos',
    cep: '01001-000',
    telefone: '(00) 90000-9001',
  })
  sequencia(captura, [
    'Cliente: CLIENTE FICTICIO TESTE',
    'Contrato: TA9001',
    'Rua Ficticia, 100 — Fundos',
    'Bairro Ficticio — Cidade Ficticia/SP',
    'CEP: 01001-000',
    'Telefone: (00) 90000-9001',
    'Data: 19/10/2026',
    'Classificação de risco global:',
    'RISCO BAIXO',
  ])
})

test('T-P04 — capa sem CEP, telefone e complemento omite só essas linhas', async () => {
  const { captura } = await gerar([{ tipo: 'cozinha' }])
  sequencia(captura, ['Rua Ficticia, 100', 'Bairro Ficticio — Cidade Ficticia/SP', 'Data: 19/10/2026'])
  ausencia(captura, { comeca: 'CEP:' })
  ausencia(captura, { comeca: 'Telefone:' })
})

test('T-P05 — capa mostra o pior ambiente (RISCO ALTO), sem pontos (H-01)', async () => {
  const { captura } = await gerar(
    [
      {
        tipo: 'outros',
        resp: { granito: true, granitoadaptar: false, rodape: false, tanque: true, tanqueEmbutido: false, tanqueMoveis: true },
      },
      {
        tipo: 'home',
        resp: { eletronicos: false, eletronicosList: [], rodape: false, cortineiro: true, cortieneiroInstalado: false },
      },
    ],
    { g1_ambientes: ['outros-0', 'home-0'], g3_ambientesPendentes: ['outros-0'] }
  )
  sequencia(captura, ['Classificação de risco global:', 'RISCO ALTO'])
  const antesDoResumo = captura.textos.slice(0, captura.textos.indexOf('Resumo Executivo'))
  assert.equal(antesDoResumo.some((t) => t.includes('pts')), false)
})

test('T-P06 — tabela do Resumo Executivo: uma linha por ambiente com gatilho, na ordem', async () => {
  const { captura } = await gerar(
    [
      { tipo: 'cozinha', resp: { granito: true, granitoadaptar: false, eletrosDefined: false } },
      { tipo: 'dormitorio_casal', nome: 'Suíte', resp: { cortineiro: true, cortieneiroInstalado: false } },
      { tipo: 'banheiro' },
    ],
    {
      g1_temIluminacaoExterna: true,
      g1_ambientes: ['cozinha-0'],
      g4_temRebaixo: true,
      g4_ambientes: [{ instanceId: 'dormitorio_casal-0', cm: '12' }],
    }
  )
  sequencia(captura, [
    'Resumo Executivo',
    {
      tabela: {
        cabecalho: CAB_RESUMO,
        corpo: [
          ['Cozinha / Área de Serviço', 'Iluminação por conta do cliente — Remover granito — Eletros indefinidos', 'MÉDIO'],
          ['Dormitório Casal — Suíte', 'Rebaixo de 12cm — Cortineiro 150mm', 'BAIXO'],
        ],
      },
    },
    'Checklist Completa',
  ])
})

test('T-P07 — sem gatilho e sem rodapé existente: Resumo Executivo sem tabela', async () => {
  const { captura } = await gerar([{ tipo: 'cozinha' }, { tipo: 'banheiro' }, { tipo: 'dormitorio_casal' }])
  sequencia(captura, ['Resumo Executivo', 'Checklist Completa'])
  assert.equal(captura.tabelas.length, 0)
})

test('T-P08 — rodapé existente com outro gatilho entra no resumo', async () => {
  const { captura } = await gerar([
    { tipo: 'dormitorio_casal', resp: { rodape: true, cortineiro: true, cortieneiroInstalado: false } },
  ])
  sequencia(captura, [
    {
      tabela: {
        cabecalho: CAB_RESUMO,
        corpo: [['Dormitório Casal', 'Cortineiro 150mm — Roupeiro sobre rodapé', 'BAIXO']],
      },
    },
  ])
})

// ---------- Perguntas globais dentro do ambiente ----------

test('T-P09 — G1, G2, G4 e G5 dentro do ambiente, cada uma com resposta e CC logo abaixo', async () => {
  const { secoes } = await gerar([{ tipo: 'cozinha' }], {
    g1_temIluminacaoExterna: true,
    g1_ambientes: ['cozinha-0'],
    g2_temReboco: false,
    g2_ambientesSemReboco: ['cozinha-0'],
    g3_pontosNaPosicaoFinal: false,
    g3_ambientesPendentes: ['cozinha-0'],
    g4_temRebaixo: true,
    g4_ambientes: [{ instanceId: 'cozinha-0', cm: '12' }],
  })
  const cozinha = secoes['cozinha-0']
  sequencia(cozinha, [
    G1,
    'Resposta: Sim',
    T_ILUM,
    G2,
    'Resposta: Não',
    T_REBOCO,
    G4,
    'Resposta: Não',
    T_PONTOS,
    G5,
    'Resposta: Sim — 12 cm',
    T_REBAIXO(12),
  ])
  ausencia(cozinha, { comeca: 'G3 — ' })
  sequencia(cozinha, ['RISCO ALTO (5 pts)'])
})

test('T-P10 — G3 dentro do ambiente com CC de revestimento; cabeçalho MÉDIO 4 (H-02)', async () => {
  const { secoes } = await gerar([{ tipo: 'dormitorio_casal' }], {
    g3_temRevestimento: false,
    g3_ambientesSemRevestimento: ['dormitorio_casal-0'],
  })
  const dormitorio = secoes['dormitorio_casal-0']
  sequencia(dormitorio, ['RISCO MÉDIO (4 pts)'])
  sequencia(dormitorio, [G3, 'Resposta: Não', T_REVEST])
})

test('T-P11 — G1 "Não" aparece em cada ambiente, sem CC; G5 nula não aparece (H-18)', async () => {
  const { captura, secoes } = await gerar([{ tipo: 'cozinha' }, { tipo: 'dormitorio_casal' }], {
    g1_temIluminacaoExterna: false,
    g1_ambientes: [],
  })
  for (const id of ['cozinha-0', 'dormitorio_casal-0']) {
    const seguinte = textoSeguinte(secoes[id], [G1, 'Resposta: Não'])
    assert.equal(seguinte?.startsWith('CC: '), false, id)
  }
  ausencia(captura, { comeca: 'G5 — ' })
})

test('T-P12 — G5 "Já rebaixado" aparece como "Não" em cada ambiente, sem CC; G1 nula não aparece', async () => {
  const { captura, secoes } = await gerar([{ tipo: 'cozinha' }, { tipo: 'dormitorio_casal' }], {
    g4_temRebaixo: false,
    g4_rebaixoOpcao: 'ja_rebaixado',
  })
  for (const id of ['cozinha-0', 'dormitorio_casal-0']) {
    const seguinte = textoSeguinte(secoes[id], [G5, 'Resposta: Não'])
    assert.equal(seguinte?.startsWith('CC: '), false, id)
  }
  ausencia(captura, { comeca: 'G1 — ' })
})

test('T-P13 — rebaixo só na Cozinha: Cozinha "Sim — 10 cm" com CC; Dormitório "Não" sem CC', async () => {
  const { secoes } = await gerar([{ tipo: 'cozinha' }, { tipo: 'dormitorio_casal' }], {
    g4_temRebaixo: true,
    g4_ambientes: [{ instanceId: 'cozinha-0', cm: '10' }],
  })
  sequencia(secoes['cozinha-0'], [G5, 'Resposta: Sim — 10 cm', T_REBAIXO(10)])
  const seguinte = textoSeguinte(secoes['dormitorio_casal-0'], [G5, 'Resposta: Não'])
  assert.equal(seguinte?.startsWith('CC: '), false)
})

test('T-P14 — G1 "Sim" só na Cozinha: nunca "Não" ao lado do CC (H-19)', async () => {
  const { secoes } = await gerar([{ tipo: 'cozinha' }, { tipo: 'dormitorio_casal' }], {
    g1_temIluminacaoExterna: true,
    g1_ambientes: ['cozinha-0'],
  })
  sequencia(secoes['cozinha-0'], [G1, 'Resposta: Sim', T_ILUM])
  const seguinte = textoSeguinte(secoes['dormitorio_casal-0'], [G1, 'Resposta: Não'])
  assert.equal(seguinte?.startsWith('CC: '), false)
})

test('T-P15 — G1 e G5 nulas e G2-G4 sem ambiente marcado: nenhuma pergunta global aparece', async () => {
  const { captura } = await gerar([{ tipo: 'cozinha' }, { tipo: 'dormitorio_casal' }], {
    g1_temIluminacaoExterna: null,
    g4_temRebaixo: null,
    g2_temReboco: true,
    g3_temRevestimento: true,
    g3_pontosNaPosicaoFinal: true,
  })
  for (const prefixo of ['G1 — ', 'G2 — ', 'G3 — ', 'G4 — ', 'G5 — ']) {
    ausencia(captura, { comeca: prefixo })
  }
})

test('T-P16 — cabeçalho de risco por ambiente com pontos', async () => {
  const { secoes } = await gerar([{ tipo: 'dormitorio_casal' }, { tipo: 'banheiro' }], {
    g2_temReboco: false,
    g2_ambientesSemReboco: ['dormitorio_casal-0'],
  })
  sequencia(secoes['dormitorio_casal-0'], ['RISCO ALTO (0 pts)'])
  sequencia(secoes['banheiro-0'], ['RISCO BAIXO (0 pts)'])
})

// ---------- Tanque, eletros e eletrônicos ----------

test('T-P17 — tanque tradicional: tipo, pergunta de móveis e CC do tanque', async () => {
  const { secoes } = await gerar([
    { tipo: 'cozinha', resp: { tanque: true, tanqueEmbutido: false, tanqueMoveis: true } },
  ])
  sequencia(secoes['cozinha-0'], [
    'Existe tanque no local?',
    'Resposta: Sim',
    'Qual o tipo de tanque?',
    'Resposta: Tanque tradicional',
    'Haverá móveis na região do tanque?',
    'Resposta: Sim',
    T_TANQUE,
  ])
})

test('T-P18 — tanque embutido: sem pergunta de móveis, sem CC e sem "Remover tanque" (H-07, H-17)', async () => {
  const { captura } = await gerar([
    { tipo: 'cozinha', resp: { tanque: true, tanqueEmbutido: true, tanqueMoveis: true } },
  ])
  sequencia(captura, ['Qual o tipo de tanque?', 'Resposta: Embutido na bancada'])
  ausencia(captura, { igual: 'Haverá móveis na região do tanque?' })
  ausencia(captura, T_TANQUE)
  assert.equal(captura.tabelas.length, 0)
  ausencia(captura, { contem: 'Remover tanque' })
  const celulas = captura.tabelas.flatMap((t) => t.corpo.flat())
  assert.equal(celulas.some((c) => String(c).includes('Remover tanque')), false)
})

const COLUNA_TIPO = (alvo) => tabelasCom(alvo, 'Tipo')[0].corpo.map((linha) => linha[0])

test('T-P19 — eletros em ordem fixa: Cooktop, Refrigerador, Forno, Lava-louça (H-20)', async () => {
  const medidas = { largura_cm: '60', altura_cm: '85', profundidade_cm: '60' }
  const { secoes } = await gerar([
    {
      tipo: 'cozinha',
      resp: {
        eletrosDefined: true,
        eletros: [
          eletro('Lava-louça', { subtipo: 'Piso', ...medidas }),
          eletro('Forno', { subtipo: 'Normal', ...medidas }),
          eletro('Cooktop', medidas),
          eletro('Refrigerador', { subtipo: 'Duplex', ...medidas }),
        ],
      },
    },
  ])
  assert.deepEqual(COLUNA_TIPO(secoes['cozinha-0']), [
    'Cooktop',
    'Refrigerador — Duplex',
    'Forno — Normal',
    'Lava-louça — Piso',
  ])
})

test('T-P20 — prioritários primeiro; demais na ordem de cadastro', async () => {
  const { secoes } = await gerar([
    {
      tipo: 'cozinha',
      resp: {
        eletrosDefined: true,
        eletros: [
          eletro('Coifa', { subtipo: 'Parede', ...MEDIDAS }),
          eletro('Depurador', { subtipo: 'Normal', ...MEDIDAS }),
          eletro('Lava-roupa', { subtipo: 'Abertura Frontal', ...MEDIDAS }),
          eletro('Fogão', { subtipo: 'Piso', ...MEDIDAS }),
        ],
      },
    },
  ])
  assert.deepEqual(COLUNA_TIPO(secoes['cozinha-0']), [
    'Fogão — Piso',
    'Depurador — Normal',
    'Coifa — Parede',
    'Lava-roupa — Abertura Frontal',
  ])
})

test('T-P21 — cada link na linha do seu eletro e a entrada não é reordenada (H-21)', async () => {
  const estado = montarEstadoCliente([
    {
      tipo: 'cozinha',
      resp: {
        eletrosDefined: true,
        eletros: [
          eletro('Forno', { subtipo: 'Normal', link: 'https://a.exemplo.invalid/forno', ...MEDIDAS }),
          eletro('Cooktop', { link: 'https://b.exemplo.invalid/cooktop', ...MEDIDAS }),
        ],
      },
    },
  ])
  const copia = structuredClone(estado)
  const captura = await pdf.cliente(estado)
  const tabela = tabelasCom(captura, 'Tipo')[0]
  assert.deepEqual(tabela.corpo.map((linha) => linha[0]), ['Cooktop', 'Forno — Normal'])
  assert.deepEqual(tabela.corpo.map((linha) => linha[5]), ['Ver link', 'Ver link'])
  assert.deepEqual(captura.links, ['https://b.exemplo.invalid/cooktop', 'https://a.exemplo.invalid/forno'])
  assert.deepEqual(estado, copia)
})

test('T-P22 — tabela de eletros: Tipo com descrição e subtipo, vazio vira "—", link vira "Ver link"', async () => {
  const { secoes } = await gerar([
    {
      tipo: 'cozinha',
      resp: {
        eletrosDefined: true,
        eletros: [
          eletro('Outros', { descricao: 'Adega', largura_cm: '60', altura_cm: '85', profundidade_cm: '138,5' }),
          eletro('Lava-roupa', {
            subtipo: 'Abertura Frontal',
            modelo: 'MOD-9001',
            link: 'https://c.exemplo.invalid/lr',
            largura_cm: '60',
            altura_cm: '85',
            profundidade_cm: '60',
          }),
        ],
      },
    },
  ])
  sequencia(secoes['cozinha-0'], [
    'Eletrodomésticos',
    {
      tabela: {
        cabecalho: CAB_ITENS,
        corpo: [
          ['Outros — Adega', '—', '60', '85', '138,5', '—'],
          ['Lava-roupa — Abertura Frontal', 'MOD-9001', '60', '85', '60', 'Ver link'],
        ],
      },
    },
  ])
})

test('T-P23 — eletros "Não" com lista residual: CC e nenhuma tabela de eletros', async () => {
  const { captura, secoes } = await gerar([
    { tipo: 'cozinha', resp: { eletrosDefined: false, eletros: [eletro('Cooktop', MEDIDAS)] } },
  ])
  sequencia(secoes['cozinha-0'], [P_ELETROS, 'Resposta: Não', T_ELETROS])
  ausencia(captura, { igual: 'Eletrodomésticos' })
  // A tabela do Resumo Executivo existe (O-2); a de eletros, não
  assert.equal(tabelasCom(captura, 'Tipo').length, 0)
})

test('T-P24 — tabela de eletrônicos: polegadas só na TV, modelo em coluna própria (H-14)', async () => {
  const { secoes } = await gerar([
    {
      tipo: 'home',
      resp: {
        eletronicos: true,
        tvPontoFinal: true,
        eletronicosList: [
          eletronico('TV', {
            polegadas: '55',
            modelo: 'TV-9001',
            link: 'https://d.exemplo.invalid/tv',
            largura_cm: '120',
            altura_cm: '70',
            profundidade_cm: '8',
          }),
          eletronico('Home Theater', { largura_cm: '40', altura_cm: '10', profundidade_cm: '30' }),
        ],
      },
    },
  ])
  sequencia(secoes['home-0'], [
    'Eletrônicos',
    {
      tabela: {
        cabecalho: CAB_ITENS,
        corpo: [
          ['TV — 55"', 'TV-9001', '120', '70', '8', 'Ver link'],
          ['Home Theater', '—', '40', '10', '30', '—'],
        ],
      },
    },
  ])
})

test('T-P25 — eletrônicos "Não" com lista residual sem TV: CC e nenhuma tabela de eletrônicos', async () => {
  const { captura, secoes } = await gerar([
    { tipo: 'home', resp: { eletronicos: false, eletronicosList: [eletronico('Videogame', MEDIDAS)] } },
  ])
  sequencia(secoes['home-0'], [P_ELETRONICOS, 'Resposta: Não', T_ELETRONICOS])
  ausencia(captura, { igual: 'Eletrônicos' })
  assert.equal(tabelasCom(captura, 'Tipo').length, 0)
})

// ---------- TV, cama, cuba, observações, CCs sob a pergunta ----------

test('T-P26 — Sala: ponto da TV com CC antes da tabela; sem "Terá TV" (H-03, H-15, H-16)', async () => {
  const { secoes } = await gerar([
    { tipo: 'home', resp: { eletronicos: true, eletronicosList: [tv55()], tvPontoFinal: false } },
  ])
  const sala = secoes['home-0']
  sequencia(sala, [
    P_ELETRONICOS,
    'Resposta: Sim',
    P_PONTO_TV,
    'Resposta: Não',
    T_TV,
    'Eletrônicos',
    { tabela: { cabecalhoComeca: 'Tipo' } },
  ])
  ausencia(sala, { igual: P_TERA_TV })
})

test('T-P27 — Outros com TV imprime o ponto da TV com CC; sem TV, a pergunta some (H-23, K-02 corrigido)', async () => {
  const a = await gerar([
    { tipo: 'outros', resp: { eletronicos: true, eletronicosList: [tv55()], tvPontoFinal: false } },
  ])
  sequencia(a.secoes['outros-0'], [P_PONTO_TV, 'Resposta: Não', T_TV])
  const listaSemTv = { eletronicos: true, eletronicosList: [eletronico('Videogame', MEDIDAS)] }
  const b = await gerar([{ tipo: 'outros', resp: listaSemTv }])
  const c = await gerar([{ tipo: 'home', resp: listaSemTv }])
  ausencia(b.captura, { igual: P_PONTO_TV })
  ausencia(c.captura, { igual: P_PONTO_TV })
  for (const { captura } of [a, b, c]) {
    ausencia(captura, { igual: P_TERA_TV })
  }
})

test('T-P28 — TV do Dormitório: ponto com CC, medidas e "Ver link" (nunca a URL crua) (H-13)', async () => {
  const url = 'https://e.exemplo.invalid/tv'
  const { captura, secoes } = await gerar([
    {
      tipo: 'dormitorio_casal',
      resp: {
        tv: true,
        tvPontoFinal: false,
        tv_polegadas: '50',
        tv_modelo: 'TV-9001',
        tv_largura_cm: '120',
        tv_altura_cm: '70',
        tv_profundidade_cm: '8',
        tv_link: url,
      },
    },
  ])
  sequencia(secoes['dormitorio_casal-0'], [
    P_TERA_TV,
    'Resposta: Sim',
    P_PONTO_TV,
    'Resposta: Não',
    T_TV,
    'Polegadas',
    'Resposta: 50',
    'Modelo',
    'Resposta: TV-9001',
    'Largura (cm)',
    'Resposta: 120',
    'Altura (cm)',
    'Resposta: 70',
    'Profundidade (cm)',
    'Resposta: 8',
    'Link',
    'Resposta: Ver link',
  ])
  assert.deepEqual(captura.links, [url])
  ausencia(captura, { contem: url })
})

test('T-P29 — TV do Dormitório só com polegadas: sem modelo, medidas, link nem CC', async () => {
  const { captura, secoes } = await gerar([
    { tipo: 'dormitorio_casal', resp: { tv: true, tvPontoFinal: true, tv_polegadas: '50' } },
  ])
  const dormitorio = secoes['dormitorio_casal-0']
  sequencia(dormitorio, ['Polegadas', 'Resposta: 50'])
  for (const pergunta of ['Modelo', 'Largura (cm)', 'Altura (cm)', 'Profundidade (cm)', 'Link']) {
    ausencia(dormitorio, { igual: pergunta })
  }
  ausencia(dormitorio, T_TV)
  assert.deepEqual(captura.links, [])
})

test('T-P30 — cama com rótulo completo nos quatro tamanhos (H-13)', async () => {
  const casos = [
    ['solteiro', 'Resposta: Solteiro (0,88 × 1,88 m)'],
    ['padrao', 'Resposta: Padrão (1,38 × 1,88 m)'],
    ['queen', 'Resposta: Queen (1,58 × 1,98 m)'],
    ['king', 'Resposta: King (2,00 × 2,03 m)'],
  ]
  for (const [tamanhoCama, resposta] of casos) {
    const { secoes } = await gerar([{ tipo: 'dormitorio_casal', resp: { tamanhoCama } }])
    sequencia(secoes['dormitorio_casal-0'], [P_CAMA, resposta])
  }
})

test('T-P31 — cama "outro" mostra largura e comprimento', async () => {
  const { secoes } = await gerar([
    { tipo: 'dormitorio_casal', resp: { tamanhoCama: 'outro', camaLargura_cm: '200', camaComprimento_cm: '210' } },
  ])
  sequencia(secoes['dormitorio_casal-0'], [
    P_CAMA,
    'Resposta: Outro',
    'Largura (cm)',
    'Resposta: 200',
    'Comprimento (cm)',
    'Resposta: 210',
  ])
})

test('T-P32 — cuba: Banheiro sempre; Outros só se preenchida', async () => {
  const banheiroSobrepor = await gerar([{ tipo: 'banheiro', resp: { cuba: 'Sobrepor' } }])
  sequencia(banheiroSobrepor.secoes['banheiro-0'], ['Tipo de cuba', 'Resposta: Sobrepor'])
  const banheiroNula = await gerar([{ tipo: 'banheiro', resp: { cuba: null } }])
  sequencia(banheiroNula.secoes['banheiro-0'], ['Tipo de cuba', 'Resposta: —'])
  const outrosNula = await gerar([{ tipo: 'outros', resp: { cuba: null } }])
  ausencia(outrosNula.captura, { igual: 'Tipo de cuba' })
  const outrosApoio = await gerar([{ tipo: 'outros', resp: { cuba: 'Apoio' } }])
  sequencia(outrosApoio.secoes['outros-0'], ['Tipo de cuba', 'Resposta: Apoio'])
})

test('T-P33 — observações aparecem só quando preenchidas', async () => {
  const com = await gerar([{ tipo: 'cozinha', resp: { observacoes: 'TESTE de observação' } }])
  sequencia(com.secoes['cozinha-0'], ['Observações', 'Resposta: TESTE de observação'])
  const sem = await gerar([{ tipo: 'cozinha', resp: { observacoes: '' } }])
  ausencia(sem.captura, { igual: 'Observações' })
})

test('T-P34 — CC de granito e de eletros impressos sob a pergunta certa', async () => {
  const { secoes } = await gerar([
    { tipo: 'cozinha', resp: { granito: true, granitoadaptar: false, eletrosDefined: false } },
  ])
  const cozinha = secoes['cozinha-0']
  sequencia(cozinha, ['Os móveis serão adaptados?', 'Resposta: Não', T_GRANITO])
  sequencia(cozinha, [P_ELETROS, 'Resposta: Não', T_ELETROS])
})

test('T-P35 — avisos de cortineiro e de rodapé existente sob a pergunta, sem prefixo "CC: "', async () => {
  const { secoes } = await gerar([
    { tipo: 'dormitorio_casal', resp: { cortineiro: true, cortieneiroInstalado: false, rodape: true } },
  ])
  const dormitorio = secoes['dormitorio_casal-0']
  sequencia(dormitorio, ['O cortineiro já está instalado?', 'Resposta: Não', A_CORT])
  sequencia(dormitorio, [P_RODAPE, 'Resposta: Sim', A_RODAPE])
  ausencia(dormitorio, { comeca: 'CC: AVISO' })
  ausencia(dormitorio, { comeca: 'CC: ROUPEIROS' })
})

test('T-P36 — CC de rodapé ausente e de eletrônicos impressos sob a pergunta certa', async () => {
  const { secoes } = await gerar([{ tipo: 'home', resp: { rodape: false, eletronicos: false } }])
  const sala = secoes['home-0']
  sequencia(sala, [P_RODAPE, 'Resposta: Não', T_RODAPE])
  sequencia(sala, [P_ELETRONICOS, 'Resposta: Não', T_ELETRONICOS])
})

test('T-P37 — rodapé existente sozinho entra no resumo (H-24, K-03 corrigido)', async () => {
  const { captura, secoes } = await gerar([{ tipo: 'dormitorio_casal', resp: { rodape: true } }])
  sequencia(captura, [
    { tabela: { cabecalho: CAB_RESUMO, corpo: [['Dormitório Casal', 'Roupeiro sobre rodapé', 'BAIXO']] } },
  ])
  const dormitorio = secoes['dormitorio_casal-0']
  sequencia(dormitorio, ['RISCO BAIXO (0 pts)'])
  sequencia(dormitorio, [P_RODAPE, 'Resposta: Sim', A_RODAPE])
})
