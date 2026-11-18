import { assertSemRede } from './auxiliares/travas.js'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { descreverRespostaBalcao } from '../src/domain/respostaBalcaoVendedor.js'

after(() => assertSemRede())

// Desvio 3 do Spec: com algum "Sim", o texto principal é só "Editados" e há UMA linha por "Sim".
test('T19 — Texto, linhas e destaque da resposta de balcões (função pura)', () => {
  // (a) campo ausente
  assert.deepEqual(descreverRespostaBalcao({}), { texto: '—', destaque: false, linhas: [] })
  // (b) tipoBalcao = null
  assert.deepEqual(descreverRespostaBalcao({ tipoBalcao: null }), { texto: '—', destaque: false, linhas: [] })
  // (c) "não se aplica"
  assert.deepEqual(descreverRespostaBalcao({ tipoBalcao: 'não se aplica' }), {
    texto: 'Não se aplica',
    destaque: false,
    linhas: [],
  })
  // (d) "Convencionais"
  assert.deepEqual(descreverRespostaBalcao({ tipoBalcao: 'Convencionais' }), {
    texto: 'Convencionais',
    destaque: false,
    linhas: [],
  })
  // (e) "Editados" com subperguntas null
  assert.deepEqual(
    descreverRespostaBalcao({
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: null,
      balcaoProfundidadeForaPadrao: null,
    }),
    { texto: 'Editados', destaque: false, linhas: [] }
  )
  // (f) "Editados" com Não e Não
  assert.deepEqual(
    descreverRespostaBalcao({
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: 'Não',
      balcaoProfundidadeForaPadrao: 'Não',
    }),
    { texto: 'Editados', destaque: false, linhas: [] }
  )
  // (g) "Editados" só altura Sim
  assert.deepEqual(
    descreverRespostaBalcao({
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: 'Sim',
      balcaoProfundidadeForaPadrao: 'Não',
    }),
    { texto: 'Editados', destaque: true, linhas: ['• Altura fora do padrão'] }
  )
  // (h) "Editados" só profundidade Sim
  assert.deepEqual(
    descreverRespostaBalcao({
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: 'Não',
      balcaoProfundidadeForaPadrao: 'Sim',
    }),
    { texto: 'Editados', destaque: true, linhas: ['• Profundidade fora do padrão'] }
  )
  // (i) "Editados" altura Sim e profundidade Sim: duas linhas, altura primeiro
  assert.deepEqual(
    descreverRespostaBalcao({
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: 'Sim',
      balcaoProfundidadeForaPadrao: 'Sim',
    }),
    {
      texto: 'Editados',
      destaque: true,
      linhas: ['• Altura fora do padrão', '• Profundidade fora do padrão'],
    }
  )
  // (j) valor desconhecido
  assert.deepEqual(descreverRespostaBalcao({ tipoBalcao: 'Xyz' }), {
    texto: 'Xyz',
    destaque: false,
    linhas: [],
  })
  // (k) subperguntas "Sim" guardadas com tipoBalcao = "Convencionais": não acendem nada
  assert.deepEqual(
    descreverRespostaBalcao({
      tipoBalcao: 'Convencionais',
      balcaoAlturaForaPadrao: 'Sim',
      balcaoProfundidadeForaPadrao: 'Sim',
    }),
    { texto: 'Convencionais', destaque: false, linhas: [] }
  )
  // (l) texto vazio conta como não respondida (Desvio 1)
  assert.deepEqual(descreverRespostaBalcao({ tipoBalcao: '' }), { texto: '—', destaque: false, linhas: [] })
})
