import { assertSemRede } from './auxiliares/travas.js'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { descreverRespostaBalcao } from '../src/domain/respostaBalcaoVendedor.js'

after(() => assertSemRede())

test('T19 — Texto e destaque da resposta de balcões (função pura)', () => {
  // (a) campo ausente
  assert.deepEqual(descreverRespostaBalcao({}), { texto: '—', destaque: false })
  // (b) tipoBalcao = null
  assert.deepEqual(descreverRespostaBalcao({ tipoBalcao: null }), { texto: '—', destaque: false })
  // (c) "não se aplica"
  assert.deepEqual(descreverRespostaBalcao({ tipoBalcao: 'não se aplica' }), {
    texto: 'Não se aplica',
    destaque: false,
  })
  // (d) "Convencionais"
  assert.deepEqual(descreverRespostaBalcao({ tipoBalcao: 'Convencionais' }), {
    texto: 'Convencionais',
    destaque: false,
  })
  // (e) "Editados" com subperguntas null
  assert.deepEqual(
    descreverRespostaBalcao({
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: null,
      balcaoProfundidadeForaPadrao: null,
    }),
    { texto: 'Editados', destaque: false }
  )
  // (f) "Editados" com Não e Não
  assert.deepEqual(
    descreverRespostaBalcao({
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: 'Não',
      balcaoProfundidadeForaPadrao: 'Não',
    }),
    { texto: 'Editados', destaque: false }
  )
  // (g) "Editados" só altura Sim
  assert.deepEqual(
    descreverRespostaBalcao({
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: 'Sim',
      balcaoProfundidadeForaPadrao: 'Não',
    }),
    { texto: 'Editados — altura fora do padrão', destaque: true }
  )
  // (h) "Editados" só profundidade Sim
  assert.deepEqual(
    descreverRespostaBalcao({
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: 'Não',
      balcaoProfundidadeForaPadrao: 'Sim',
    }),
    { texto: 'Editados — profundidade fora do padrão', destaque: true }
  )
  // (i) "Editados" altura Sim e profundidade Sim
  assert.deepEqual(
    descreverRespostaBalcao({
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: 'Sim',
      balcaoProfundidadeForaPadrao: 'Sim',
    }),
    { texto: 'Editados — altura e profundidade fora do padrão', destaque: true }
  )
  // (j) valor desconhecido
  assert.deepEqual(descreverRespostaBalcao({ tipoBalcao: 'Xyz' }), {
    texto: 'Xyz',
    destaque: false,
  })
  // (k) subperguntas "Sim" guardadas com tipoBalcao = "Convencionais"
  assert.deepEqual(
    descreverRespostaBalcao({
      tipoBalcao: 'Convencionais',
      balcaoAlturaForaPadrao: 'Sim',
      balcaoProfundidadeForaPadrao: 'Sim',
    }),
    { texto: 'Convencionais', destaque: false }
  )
})
