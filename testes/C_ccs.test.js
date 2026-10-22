import { assertSemRede } from './auxiliares/travas.js'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { calcularScore } from '../src/domain/scoreEngine.js'
import { construirCCs } from '../src/domain/ccBuilder.js'
import { montarEstadoCliente, tv55 } from './auxiliares/construtores.js'
import {
  CC_ILUMINACAO,
  CC_REBOCO,
  CC_REVESTIMENTO,
  CC_PONTOS,
  CC_REBAIXO,
  CC_GRANITO,
  CC_TANQUE,
  CC_TV,
  CC_ELETROS,
  CC_ELETRONICOS,
  CC_RODAPE_AUSENTE,
  AV_RODAPE_EXISTENTE,
  AV_CORTINEIRO,
} from './auxiliares/textos_cc.js'

after(() => assertSemRede())

// Igual ao PDF (pdf.js:93-94): os CCs nascem da saída real do score
function ccs(lista, global) {
  const estado = montarEstadoCliente(lista, global)
  return construirCCs(estado, calcularScore(estado).gatilhosAtivados)
}

function doAmbiente(lista, instanceId) {
  return lista.filter((cc) => cc.escopo === instanceId)
}

// Confere tipo, nível, escopo, texto completo e, só para G1 a G5, a origem
function conferir(cc, { tipo = 'CC', nivel, escopo, texto, origem }) {
  assert.ok(cc, 'CC esperado não existe')
  assert.equal(cc.tipo, tipo)
  assert.equal(cc.nivel, nivel)
  assert.equal(cc.escopo, escopo)
  assert.equal(cc.textoCompleto, texto)
  if (origem) assert.equal(cc.perguntaOrigem, origem)
}

test('T-C01 — G1: um CC MÉDIO, origem G1, texto completo da iluminação', () => {
  const lista = ccs([{ tipo: 'cozinha' }], { g1_ambientes: ['cozinha-0'] })
  assert.equal(lista.length, 1)
  conferir(lista[0], { nivel: 'MÉDIO', escopo: 'cozinha-0', texto: CC_ILUMINACAO, origem: 'G1' })
})

test('T-C02 — G2: um CC ALTO, origem G2, texto completo do reboco', () => {
  const lista = ccs([{ tipo: 'cozinha' }], { g2_ambientesSemReboco: ['cozinha-0'] })
  assert.equal(lista.length, 1)
  conferir(lista[0], { nivel: 'ALTO', escopo: 'cozinha-0', texto: CC_REBOCO, origem: 'G2' })
})

test('T-C03 — G3: CC de revestimento é ALTO mesmo com o ambiente MÉDIO', () => {
  const lista = ccs([{ tipo: 'cozinha' }], { g3_ambientesSemRevestimento: ['cozinha-0'] })
  assert.equal(lista.length, 1)
  conferir(lista[0], { nivel: 'ALTO', escopo: 'cozinha-0', texto: CC_REVESTIMENTO, origem: 'G3' })
})

test('T-C04 — supressão G2→G3 por ambiente; revestimento tem texto próprio', () => {
  const lista = ccs([{ tipo: 'cozinha' }, { tipo: 'dormitorio_casal' }], {
    g2_ambientesSemReboco: ['cozinha-0'],
    g3_ambientesSemRevestimento: ['cozinha-0', 'dormitorio_casal-0'],
  })
  const cozinha = doAmbiente(lista, 'cozinha-0')
  assert.equal(cozinha.length, 1)
  conferir(cozinha[0], { nivel: 'ALTO', escopo: 'cozinha-0', texto: CC_REBOCO, origem: 'G2' })
  const dormitorio = doAmbiente(lista, 'dormitorio_casal-0')
  assert.equal(dormitorio.length, 1)
  conferir(dormitorio[0], { nivel: 'ALTO', escopo: 'dormitorio_casal-0', texto: CC_REVESTIMENTO, origem: 'G3' })
  assert.notEqual(dormitorio[0].textoCompleto, CC_REBOCO)
})

test('T-C05 — G4: um CC MÉDIO, origem G4, texto completo dos pontos', () => {
  const lista = ccs([{ tipo: 'dormitorio_casal' }], { g3_ambientesPendentes: ['dormitorio_casal-0'] })
  assert.equal(lista.length, 1)
  conferir(lista[0], { nivel: 'MÉDIO', escopo: 'dormitorio_casal-0', texto: CC_PONTOS, origem: 'G4' })
})

test('T-C06 — G5: um CC BAIXO, origem G5, com a medida do rebaixo no texto', () => {
  const lista = ccs([{ tipo: 'cozinha' }], {
    g4_temRebaixo: true,
    g4_ambientes: [{ instanceId: 'cozinha-0', cm: '12' }],
  })
  assert.equal(lista.length, 1)
  conferir(lista[0], { nivel: 'BAIXO', escopo: 'cozinha-0', texto: CC_REBAIXO.replace('{cm}', '12'), origem: 'G5' })
})

test('T-C07 — granito a retirar: CC MÉDIO; com adaptar: nenhum CC', () => {
  const retirar = ccs([{ tipo: 'cozinha', resp: { granito: true, granitoadaptar: false } }])
  assert.equal(retirar.length, 1)
  conferir(retirar[0], { nivel: 'MÉDIO', escopo: 'cozinha-0', texto: CC_GRANITO })
  assert.deepEqual(ccs([{ tipo: 'cozinha', resp: { granito: true, granitoadaptar: true } }]), [])
})

test('T-C08 — tanque tradicional: CC MÉDIO; tanque embutido: nenhum CC (H-07)', () => {
  const tradicional = ccs([{ tipo: 'cozinha', resp: { tanque: true, tanqueEmbutido: false, tanqueMoveis: true } }])
  assert.equal(tradicional.length, 1)
  conferir(tradicional[0], { nivel: 'MÉDIO', escopo: 'cozinha-0', texto: CC_TANQUE })
  assert.deepEqual(ccs([{ tipo: 'cozinha', resp: { tanque: true, tanqueEmbutido: true, tanqueMoveis: true } }]), [])
})

test('T-C09 — CC da TV em Dormitório, Sala e Outros; com G4 o CC continua', () => {
  const tvLista = { eletronicos: true, eletronicosList: [tv55()], tvPontoFinal: false }
  const a = ccs([
    { tipo: 'dormitorio_casal', resp: { tv: true, tvPontoFinal: false } },
    { tipo: 'home', resp: tvLista },
    { tipo: 'outros', resp: tvLista },
  ])
  for (const id of ['dormitorio_casal-0', 'home-0', 'outros-0']) {
    const doAmb = doAmbiente(a, id)
    assert.equal(doAmb.length, 1, id)
    assert.equal(doAmb[0].id, `TV_PONTO_${id}`)
    conferir(doAmb[0], { nivel: 'MÉDIO', escopo: id, texto: CC_TV })
  }
  const b = ccs([{ tipo: 'dormitorio_casal', resp: { tv: true, tvPontoFinal: false } }], {
    g3_ambientesPendentes: ['dormitorio_casal-0'],
  })
  conferir(
    b.find((cc) => cc.id === 'TV_PONTO_dormitorio_casal-0'),
    { nivel: 'MÉDIO', escopo: 'dormitorio_casal-0', texto: CC_TV }
  )
  assert.ok(b.find((cc) => cc.id === 'PONTOS_INDEFINIDOS_dormitorio_casal-0'))
})

test('T-C10 — eletros indefinidos: CC BAIXO', () => {
  const lista = ccs([{ tipo: 'cozinha', resp: { eletrosDefined: false } }])
  assert.equal(lista.length, 1)
  conferir(lista[0], { nivel: 'BAIXO', escopo: 'cozinha-0', texto: CC_ELETROS })
})

test('T-C11 — eletrônicos indefinidos: CC BAIXO', () => {
  const lista = ccs([{ tipo: 'home', resp: { eletronicos: false } }])
  assert.equal(lista.length, 1)
  conferir(lista[0], { nivel: 'BAIXO', escopo: 'home-0', texto: CC_ELETRONICOS })
})

test('T-C12 — rodapé ausente: CC BAIXO', () => {
  const lista = ccs([{ tipo: 'home', resp: { rodape: false } }])
  assert.equal(lista.length, 1)
  conferir(lista[0], { nivel: 'BAIXO', escopo: 'home-0', texto: CC_RODAPE_AUSENTE })
})

test('T-C13 — rodapé existente: AVISO sem nível só no Dormitório (H-06)', () => {
  const lista = ccs([
    { tipo: 'dormitorio_casal', resp: { rodape: true } },
    { tipo: 'home', resp: { rodape: true } },
    { tipo: 'outros', resp: { rodape: true } },
  ])
  const dormitorio = doAmbiente(lista, 'dormitorio_casal-0')
  assert.equal(dormitorio.length, 1)
  conferir(dormitorio[0], { tipo: 'AVISO', nivel: null, escopo: 'dormitorio_casal-0', texto: AV_RODAPE_EXISTENTE })
  assert.deepEqual(doAmbiente(lista, 'home-0'), [])
  assert.deepEqual(doAmbiente(lista, 'outros-0'), [])
})

test('T-C14 — cortineiro não instalado: AVISO BAIXO com "APROXIMADAMENTE 150MM"', () => {
  const lista = ccs([{ tipo: 'dormitorio_casal', resp: { cortineiro: true, cortieneiroInstalado: false } }])
  assert.equal(lista.length, 1)
  conferir(lista[0], { tipo: 'AVISO', nivel: 'BAIXO', escopo: 'dormitorio_casal-0', texto: AV_CORTINEIRO })
  assert.ok(lista[0].textoCompleto.includes('APROXIMADAMENTE 150MM'))
})

test('T-C15 — escopo de cada CC é o instanceId do seu ambiente; nenhum "Global" (H-09)', () => {
  const lista = ccs(
    [
      { tipo: 'cozinha', resp: { eletrosDefined: false } },
      { tipo: 'dormitorio_casal', resp: { rodape: false } },
    ],
    { g1_ambientes: ['cozinha-0'] }
  )
  for (const cc of lista) {
    assert.ok(cc.id.endsWith(`_${cc.escopo}`), `${cc.id} com escopo ${cc.escopo}`)
    assert.notEqual(cc.escopo, 'Global')
  }
  assert.deepEqual(
    doAmbiente(lista, 'cozinha-0').map((cc) => cc.id),
    ['ILUMINACAO_EXTERNA_cozinha-0', 'ELETROS_NAODEF_cozinha-0']
  )
  assert.deepEqual(doAmbiente(lista, 'dormitorio_casal-0').map((cc) => cc.id), ['RODAPE_AUSENTE_dormitorio_casal-0'])
  assert.equal(lista.length, 3)
})

test('T-C16 — estado limpo: lista de CCs vazia', () => {
  assert.deepEqual(ccs([{ tipo: 'cozinha' }, { tipo: 'dormitorio_casal' }]), [])
})
