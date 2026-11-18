import { assertSemRede } from './auxiliares/travas.js'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { validarRespostasGrupo } from '../src/domain/validacaoVendedor.js'

after(() => assertSemRede())

const BASE_A = {
  alturaBalcao_mm: 850,
  alturaArmario_mm: 'não se aplica',
  fechamentoTeto: 'NAO',
  caixaria: 'MDP',
  dobradicas: 'Convencionais',
  corredicas: 'Ocultas',
}

test('T17 — Grupos B e C intocados', () => {
  assert.deepEqual(
    validarRespostasGrupo('B', {
      caixaria: 'MDF',
      dobradicas: 'Amortecimento',
      corredicas: 'Ocultas',
      fechamentoTeto: 'SIM',
    }),
    {}
  )

  assert.deepEqual(
    validarRespostasGrupo('C', {
      caixaria: 'MDF',
      dobradicas: 'Amortecimento',
      corredicas: 'Ocultas',
    }),
    {}
  )
})

test('T18 — Regras antigas do grupo A intactas', () => {
  const msgPadrao = 'Responda esta pergunta ou marque "Não se aplica"'

  // (a) altura do piso dos balcões null
  assert.deepEqual(
    validarRespostasGrupo('A', { ...BASE_A, tipoBalcao: 'Convencionais', alturaBalcao_mm: null }),
    { alturaBalcao_mm: msgPadrao }
  )

  // (b) altura do piso dos armários 0
  assert.deepEqual(
    validarRespostasGrupo('A', { ...BASE_A, tipoBalcao: 'Convencionais', alturaArmario_mm: 0 }),
    { alturaArmario_mm: msgPadrao }
  )

  // (c) altura do piso dos balcões negativa (-5)
  assert.deepEqual(
    validarRespostasGrupo('A', { ...BASE_A, tipoBalcao: 'Convencionais', alturaBalcao_mm: -5 }),
    { alturaBalcao_mm: msgPadrao }
  )

  // (d) fechamento null
  assert.deepEqual(
    validarRespostasGrupo('A', { ...BASE_A, tipoBalcao: 'Convencionais', fechamentoTeto: null }),
    { fechamentoTeto: msgPadrao }
  )

  // Altura do piso "não se aplica" continua válida
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...BASE_A,
      tipoBalcao: 'Convencionais',
      alturaBalcao_mm: 'não se aplica',
      alturaArmario_mm: 'não se aplica',
    }),
    {}
  )
})

test('T10 — Sem resposta principal bloqueia', () => {
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...BASE_A,
      tipoBalcao: null,
      balcaoAlturaForaPadrao: null,
      balcaoProfundidadeForaPadrao: null,
    }),
    { tipoBalcao: 'Responda esta pergunta ou marque "Não se aplica"' }
  )
})

test('T11 — Convencionais e Não se aplica liberam', () => {
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...BASE_A,
      tipoBalcao: 'Convencionais',
      balcaoAlturaForaPadrao: null,
      balcaoProfundidadeForaPadrao: null,
    }),
    {}
  )
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...BASE_A,
      tipoBalcao: 'não se aplica',
      balcaoAlturaForaPadrao: null,
      balcaoProfundidadeForaPadrao: null,
    }),
    {}
  )
})

test('T12 — Editados sem subrespostas', () => {
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...BASE_A,
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: null,
      balcaoProfundidadeForaPadrao: null,
    }),
    {
      balcaoAlturaForaPadrao: 'Responda sim ou não',
      balcaoProfundidadeForaPadrao: 'Responda sim ou não',
    }
  )
})

test('T13 — Editados com uma subresposta só', () => {
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...BASE_A,
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: 'Sim',
      balcaoProfundidadeForaPadrao: null,
    }),
    { balcaoProfundidadeForaPadrao: 'Responda sim ou não' }
  )
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...BASE_A,
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: null,
      balcaoProfundidadeForaPadrao: 'Não',
    }),
    { balcaoAlturaForaPadrao: 'Responda sim ou não' }
  )
})

test('T14 — Editados com Não e Não', () => {
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...BASE_A,
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: 'Não',
      balcaoProfundidadeForaPadrao: 'Não',
    }),
    {}
  )
})

test('T15 — Editados com algum Sim', () => {
  for (const [altura, prof] of [
    ['Sim', 'Sim'],
    ['Sim', 'Não'],
    ['Não', 'Sim'],
  ]) {
    assert.deepEqual(
      validarRespostasGrupo('A', {
        ...BASE_A,
        tipoBalcao: 'Editados',
        balcaoAlturaForaPadrao: altura,
        balcaoProfundidadeForaPadrao: prof,
      }),
      {}
    )
  }
})

test('T20 — Editados com subresposta inválida ou ausente também bloqueia', () => {
  const msg = 'Responda sim ou não'

  // valor inválido ("talvez", e "SIM" maiúsculo, que é o formato do fechamento e não destas perguntas)
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...BASE_A,
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: 'talvez',
      balcaoProfundidadeForaPadrao: 'Sim',
    }),
    { balcaoAlturaForaPadrao: msg }
  )
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...BASE_A,
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: 'Não',
      balcaoProfundidadeForaPadrao: 'SIM',
    }),
    { balcaoProfundidadeForaPadrao: msg }
  )

  // campos ausentes (nem null, nem presentes no objeto)
  assert.deepEqual(validarRespostasGrupo('A', { ...BASE_A, tipoBalcao: 'Editados' }), {
    balcaoAlturaForaPadrao: msg,
    balcaoProfundidadeForaPadrao: msg,
  })
})

test('T16 — Subrespostas antigas não são verificadas', () => {
  for (const tipoBalcao of ['Convencionais', 'não se aplica']) {
    for (const [altura, prof] of [
      [null, null],
      ['Sim', 'Não'],
      ['talvez', 'talvez'],
    ]) {
      assert.deepEqual(
        validarRespostasGrupo('A', {
          ...BASE_A,
          tipoBalcao,
          balcaoAlturaForaPadrao: altura,
          balcaoProfundidadeForaPadrao: prof,
        }),
        {}
      )
    }
  }
})
