import { assertSemRede } from './auxiliares/travas.js'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { calcularScore } from '../src/domain/scoreEngine.js'
import { montarEstadoCliente, tv55 } from './auxiliares/construtores.js'

after(() => assertSemRede())

function score(lista, global) {
  return calcularScore(montarEstadoCliente(lista, global))
}

// Ambiente comparado inteiro: { pontos, isAlto, classificacao, gatilhos }
function amb(pontos, isAlto, classificacao, gatilhos) {
  return { pontos, isAlto, classificacao, gatilhos }
}

function resumo(s) {
  return { pontos: s.pontos, isAlto: s.isAlto, classificacao: s.classificacao }
}

test('T-S01 — G1 iluminação: 2 pontos, BAIXO; global igual ao ambiente', () => {
  const s = score([{ tipo: 'cozinha' }], { g1_temIluminacaoExterna: true, g1_ambientes: ['cozinha-0'] })
  assert.deepEqual(s.scorePorAmbiente['cozinha-0'], amb(2, false, 'BAIXO', ['ILUMINACAO_EXTERNA_cozinha-0']))
  assert.deepEqual(s.scoreGlobal, { pontos: 2, isAlto: false, classificacao: 'BAIXO' })
  assert.deepEqual(s.gatilhosAtivados, ['ILUMINACAO_EXTERNA_cozinha-0'])
})

test('T-S02 — G2 sem reboco: 0 pontos, ALTO, isAlto verdadeiro', () => {
  const s = score([{ tipo: 'cozinha' }], { g2_ambientesSemReboco: ['cozinha-0'] })
  assert.deepEqual(s.scorePorAmbiente['cozinha-0'], amb(0, true, 'ALTO', ['REFORM_SEM_REBOCO_cozinha-0']))
})

test('T-S03 — revestimento sozinho vale 4 pontos, MÉDIO, isAlto falso (intencional, decisão 3)', () => {
  const s = score([{ tipo: 'cozinha' }], { g3_ambientesSemRevestimento: ['cozinha-0'] })
  assert.deepEqual(s.scorePorAmbiente['cozinha-0'], amb(4, false, 'MÉDIO', ['REFORM_SEM_REVESTIMENTO_cozinha-0']))
})

test('T-S04 — mesmo ambiente em G2 e G3: só o reboco conta', () => {
  const s = score([{ tipo: 'cozinha' }], {
    g2_ambientesSemReboco: ['cozinha-0'],
    g3_ambientesSemRevestimento: ['cozinha-0'],
  })
  assert.deepEqual(s.scorePorAmbiente['cozinha-0'], amb(0, true, 'ALTO', ['REFORM_SEM_REBOCO_cozinha-0']))
  assert.equal(s.gatilhosAtivados.some((g) => g.startsWith('REFORM_SEM_REVESTIMENTO_')), false)
})

test('T-S05 — supressão G2→G3 é por ambiente: outro ambiente só em G3 continua pontuando', () => {
  const s = score([{ tipo: 'cozinha' }, { tipo: 'dormitorio_casal' }], {
    g2_ambientesSemReboco: ['cozinha-0'],
    g3_ambientesSemRevestimento: ['cozinha-0', 'dormitorio_casal-0'],
  })
  assert.deepEqual(s.scorePorAmbiente['cozinha-0'], amb(0, true, 'ALTO', ['REFORM_SEM_REBOCO_cozinha-0']))
  assert.deepEqual(
    s.scorePorAmbiente['dormitorio_casal-0'],
    amb(4, false, 'MÉDIO', ['REFORM_SEM_REVESTIMENTO_dormitorio_casal-0'])
  )
})

test('T-S06 — G4 pontos indefinidos (campo g3_ambientesPendentes): 2 pontos', () => {
  const s = score([{ tipo: 'dormitorio_casal' }], { g3_ambientesPendentes: ['dormitorio_casal-0'] })
  assert.deepEqual(
    s.scorePorAmbiente['dormitorio_casal-0'],
    amb(2, false, 'BAIXO', ['PONTOS_INDEFINIDOS_dormitorio_casal-0'])
  )
})

test('T-S07 — G5 rebaixo (campos g4_*): 1 ponto só no ambiente da lista', () => {
  const s = score([{ tipo: 'cozinha' }, { tipo: 'banheiro' }], {
    g4_temRebaixo: true,
    g4_ambientes: [{ instanceId: 'cozinha-0', cm: '12' }],
  })
  assert.deepEqual(s.scorePorAmbiente['cozinha-0'], amb(1, false, 'BAIXO', ['REBAIXO_cozinha-0']))
  assert.deepEqual(s.scorePorAmbiente['banheiro-0'], amb(0, false, 'BAIXO', []))
})

test('T-S08 — G5 desligado ignora a lista preenchida', () => {
  const s = score([{ tipo: 'cozinha' }], {
    g4_temRebaixo: false,
    g4_ambientes: [{ instanceId: 'cozinha-0', cm: '12' }],
  })
  assert.deepEqual(s.scorePorAmbiente['cozinha-0'], amb(0, false, 'BAIXO', []))
  assert.deepEqual(s.gatilhosAtivados, [])
})

test('T-S09 — granito a retirar vale 2 pontos em Cozinha, Banheiro e Outros', () => {
  for (const tipo of ['cozinha', 'banheiro', 'outros']) {
    const s = score([{ tipo, resp: { granito: true, granitoadaptar: false } }])
    assert.deepEqual(s.scorePorAmbiente[`${tipo}-0`], amb(2, false, 'BAIXO', [`GRANITO_RETIRAR_${tipo}-0`]))
  }
})

test('T-S10 — granito com móveis adaptados não pontua', () => {
  for (const tipo of ['cozinha', 'banheiro', 'outros']) {
    const s = score([{ tipo, resp: { granito: true, granitoadaptar: true } }])
    assert.deepEqual(s.scorePorAmbiente[`${tipo}-0`], amb(0, false, 'BAIXO', []))
  }
})

test('T-S11 — tanque tradicional com móveis vale 2 pontos em Cozinha e Outros', () => {
  for (const tipo of ['cozinha', 'outros']) {
    const s = score([{ tipo, resp: { tanque: true, tanqueEmbutido: false, tanqueMoveis: true } }])
    assert.deepEqual(s.scorePorAmbiente[`${tipo}-0`], amb(2, false, 'BAIXO', [`TANQUE_RETIRAR_${tipo}-0`]))
  }
})

test('T-S12 — tanque embutido não pontua, mesmo com tanqueMoveis sobrando (H-07)', () => {
  const s = score([{ tipo: 'cozinha', resp: { tanque: true, tanqueEmbutido: true, tanqueMoveis: true } }])
  assert.deepEqual(s.scorePorAmbiente['cozinha-0'], amb(0, false, 'BAIXO', []))
})

test('T-S13 — TV do Dormitório com ponto fora: 2 pontos; com ponto final: nada', () => {
  const fora = score([{ tipo: 'dormitorio_casal', resp: { tv: true, tvPontoFinal: false } }])
  assert.deepEqual(
    fora.scorePorAmbiente['dormitorio_casal-0'],
    amb(2, false, 'BAIXO', ['TV_PONTO_dormitorio_casal-0'])
  )
  const final = score([{ tipo: 'dormitorio_casal', resp: { tv: true, tvPontoFinal: true } }])
  assert.deepEqual(final.scorePorAmbiente['dormitorio_casal-0'], amb(0, false, 'BAIXO', []))
})

test('T-S14 — TV da Sala pela lista de eletrônicos: 2 pontos; com ponto final: nada (H-03)', () => {
  const resp = { eletronicos: true, eletronicosList: [tv55()], tvPontoFinal: false, tv: null }
  const fora = score([{ tipo: 'home', resp }])
  assert.deepEqual(fora.scorePorAmbiente['home-0'], amb(2, false, 'BAIXO', ['TV_PONTO_home-0']))
  const final = score([{ tipo: 'home', resp: { ...resp, tvPontoFinal: true } }])
  assert.deepEqual(final.scorePorAmbiente['home-0'], amb(0, false, 'BAIXO', []))
})

test('T-S15 — TV de Outros pela lista de eletrônicos: 2 pontos (H-04)', () => {
  const s = score([
    { tipo: 'outros', resp: { eletronicos: true, eletronicosList: [tv55()], tvPontoFinal: false, tv: null } },
  ])
  assert.deepEqual(s.scorePorAmbiente['outros-0'], amb(2, false, 'BAIXO', ['TV_PONTO_outros-0']))
})

test('T-S16 — DIV-07 vale por ambiente: TV zera só no dormitório em G4 (H-08)', () => {
  const resp = { tv: true, tvPontoFinal: false }
  const s = score(
    [
      { tipo: 'dormitorio_casal', indice: 0, resp },
      { tipo: 'dormitorio_casal', indice: 1, resp },
    ],
    { g3_ambientesPendentes: ['dormitorio_casal-0'] }
  )
  assert.deepEqual(
    s.scorePorAmbiente['dormitorio_casal-0'],
    amb(2, false, 'BAIXO', ['PONTOS_INDEFINIDOS_dormitorio_casal-0', 'TV_PONTO_dormitorio_casal-0'])
  )
  assert.deepEqual(
    s.scorePorAmbiente['dormitorio_casal-1'],
    amb(2, false, 'BAIXO', ['TV_PONTO_dormitorio_casal-1'])
  )
})

test('T-S17 — eletros indefinidos na Cozinha: 1 ponto', () => {
  const s = score([{ tipo: 'cozinha', resp: { eletrosDefined: false } }])
  assert.deepEqual(s.scorePorAmbiente['cozinha-0'], amb(1, false, 'BAIXO', ['ELETROS_NAODEF_cozinha-0']))
})

test('T-S18 — eletrônicos indefinidos na Sala: 1 ponto', () => {
  const s = score([{ tipo: 'home', resp: { eletronicos: false, eletronicosList: [] } }])
  assert.deepEqual(s.scorePorAmbiente['home-0'], amb(1, false, 'BAIXO', ['ELETRONICOS_NAODEF_home-0']))
})

test('T-S19 — Outros não pontua eletros nem eletrônicos indefinidos (H-05)', () => {
  const s = score([{ tipo: 'outros', resp: { eletrosDefined: false, eletronicos: false } }])
  assert.deepEqual(s.scorePorAmbiente['outros-0'], amb(0, false, 'BAIXO', []))
})

test('T-S20 — rodapé ausente vale 1 ponto em Dormitório, Sala e Outros', () => {
  for (const tipo of ['dormitorio_casal', 'home', 'outros']) {
    const s = score([{ tipo, resp: { rodape: false } }])
    assert.deepEqual(s.scorePorAmbiente[`${tipo}-0`], amb(1, false, 'BAIXO', [`RODAPE_AUSENTE_${tipo}-0`]))
  }
})

test('T-S21 — rodapé existente não pontua em nenhum ambiente (H-06)', () => {
  for (const tipo of ['dormitorio_casal', 'home', 'outros']) {
    const s = score([{ tipo, resp: { rodape: true } }])
    assert.deepEqual(s.scorePorAmbiente[`${tipo}-0`], amb(0, false, 'BAIXO', []))
  }
})

test('T-S22 — cortineiro não instalado vale 1 ponto; instalado não pontua', () => {
  for (const tipo of ['dormitorio_casal', 'home', 'outros']) {
    const nao = score([{ tipo, resp: { cortineiro: true, cortieneiroInstalado: false } }])
    assert.deepEqual(
      nao.scorePorAmbiente[`${tipo}-0`],
      amb(1, false, 'BAIXO', [`CORTINEIRO_NAOINSTALADO_${tipo}-0`])
    )
    const sim = score([{ tipo, resp: { cortineiro: true, cortieneiroInstalado: true } }])
    assert.deepEqual(sim.scorePorAmbiente[`${tipo}-0`], amb(0, false, 'BAIXO', []))
  }
})

test('T-S23 — limiar do MÉDIO: 3 pontos é BAIXO, 4 pontos é MÉDIO', () => {
  const a = score([{ tipo: 'outros', resp: { rodape: false } }], { g1_ambientes: ['outros-0'] })
  assert.deepEqual(
    a.scorePorAmbiente['outros-0'],
    amb(3, false, 'BAIXO', ['ILUMINACAO_EXTERNA_outros-0', 'RODAPE_AUSENTE_outros-0'])
  )
  const b = score([{ tipo: 'cozinha' }], { g3_ambientesSemRevestimento: ['cozinha-0'] })
  assert.deepEqual(b.scorePorAmbiente['cozinha-0'], amb(4, false, 'MÉDIO', ['REFORM_SEM_REVESTIMENTO_cozinha-0']))
})

const GLOBAL_S24 = { g1_ambientes: ['outros-0'], g3_ambientesPendentes: ['outros-0'] }
const BASE_S24 = { granito: true, granitoadaptar: false }
const TANQUE = { tanque: true, tanqueEmbutido: false, tanqueMoveis: true }

test('T-S24 — limiar do ALTO: 7 é MÉDIO; 9 e 8 são ALTO por pontos, com isAlto falso', () => {
  const a = score([{ tipo: 'outros', resp: { ...BASE_S24, rodape: false } }], GLOBAL_S24)
  assert.deepEqual(
    a.scorePorAmbiente['outros-0'],
    amb(7, false, 'MÉDIO', [
      'ILUMINACAO_EXTERNA_outros-0',
      'PONTOS_INDEFINIDOS_outros-0',
      'GRANITO_RETIRAR_outros-0',
      'RODAPE_AUSENTE_outros-0',
    ])
  )
  const b = score([{ tipo: 'outros', resp: { ...BASE_S24, rodape: false, ...TANQUE } }], GLOBAL_S24)
  assert.deepEqual(
    b.scorePorAmbiente['outros-0'],
    amb(9, false, 'ALTO', [
      'ILUMINACAO_EXTERNA_outros-0',
      'PONTOS_INDEFINIDOS_outros-0',
      'GRANITO_RETIRAR_outros-0',
      'TANQUE_RETIRAR_outros-0',
      'RODAPE_AUSENTE_outros-0',
    ])
  )
  const c = score([{ tipo: 'outros', resp: { ...BASE_S24, rodape: null, ...TANQUE } }], GLOBAL_S24)
  assert.deepEqual(
    c.scorePorAmbiente['outros-0'],
    amb(8, false, 'ALTO', [
      'ILUMINACAO_EXTERNA_outros-0',
      'PONTOS_INDEFINIDOS_outros-0',
      'GRANITO_RETIRAR_outros-0',
      'TANQUE_RETIRAR_outros-0',
    ])
  )
})

test('T-S25 — global = pior ambiente: reboco (ALTO, 0 pts) vence MÉDIO de 7 pts', () => {
  const s = score(
    [
      { tipo: 'outros', resp: { ...BASE_S24, rodape: false } },
      { tipo: 'cozinha' },
    ],
    { ...GLOBAL_S24, g2_ambientesSemReboco: ['cozinha-0'] }
  )
  assert.deepEqual(resumo(s.scorePorAmbiente['outros-0']), { pontos: 7, isAlto: false, classificacao: 'MÉDIO' })
  assert.deepEqual(resumo(s.scorePorAmbiente['cozinha-0']), { pontos: 0, isAlto: true, classificacao: 'ALTO' })
  assert.equal(s.scoreGlobal.pontos, 0)
  assert.equal(s.scoreGlobal.classificacao, 'ALTO')
})

test('T-S26 — global ALTO 9 quando um ambiente é ALTO por soma (H-01)', () => {
  const s = score(
    [
      { tipo: 'outros', resp: { ...BASE_S24, rodape: false, ...TANQUE } },
      {
        tipo: 'home',
        resp: { eletronicos: false, eletronicosList: [], rodape: false, cortineiro: true, cortieneiroInstalado: false },
      },
    ],
    { g1_ambientes: ['outros-0', 'home-0'], g3_ambientesPendentes: ['outros-0'] }
  )
  assert.deepEqual(resumo(s.scorePorAmbiente['outros-0']), { pontos: 9, isAlto: false, classificacao: 'ALTO' })
  assert.deepEqual(
    s.scorePorAmbiente['home-0'],
    amb(5, false, 'MÉDIO', [
      'ILUMINACAO_EXTERNA_home-0',
      'ELETRONICOS_NAODEF_home-0',
      'RODAPE_AUSENTE_home-0',
      'CORTINEIRO_NAOINSTALADO_home-0',
    ])
  )
  assert.equal(s.scoreGlobal.pontos, 9)
  assert.equal(s.scoreGlobal.classificacao, 'ALTO')
})

test('T-S27 — dois MÉDIOS: global fica com o maior (6 pts)', () => {
  const s = score(
    [
      { tipo: 'cozinha' },
      { tipo: 'outros', resp: { rodape: false, cortineiro: true, cortieneiroInstalado: false } },
    ],
    {
      g3_ambientesSemRevestimento: ['cozinha-0'],
      g1_ambientes: ['outros-0'],
      g3_ambientesPendentes: ['outros-0'],
    }
  )
  assert.deepEqual(resumo(s.scorePorAmbiente['cozinha-0']), { pontos: 4, isAlto: false, classificacao: 'MÉDIO' })
  assert.deepEqual(
    s.scorePorAmbiente['outros-0'],
    amb(6, false, 'MÉDIO', [
      'ILUMINACAO_EXTERNA_outros-0',
      'PONTOS_INDEFINIDOS_outros-0',
      'RODAPE_AUSENTE_outros-0',
      'CORTINEIRO_NAOINSTALADO_outros-0',
    ])
  )
  assert.equal(s.scoreGlobal.pontos, 6)
  assert.equal(s.scoreGlobal.classificacao, 'MÉDIO')
})

test('T-S28 — dois BAIXOS (1 e 3 pts): global BAIXO 3', () => {
  const s = score(
    [
      { tipo: 'cozinha', resp: { eletrosDefined: false } },
      { tipo: 'outros', resp: { rodape: false } },
    ],
    { g1_ambientes: ['outros-0'] }
  )
  assert.equal(s.scoreGlobal.pontos, 3)
  assert.equal(s.scoreGlobal.classificacao, 'BAIXO')
})

test('T-S29 — sem ambientes: global BAIXO 0, sem gatilhos', () => {
  const s = score([])
  assert.deepEqual(s.scoreGlobal, { pontos: 0, isAlto: false, classificacao: 'BAIXO' })
  assert.deepEqual(s.scorePorAmbiente, {})
  assert.deepEqual(s.gatilhosAtivados, [])
})
