import { assertSemRede } from './auxiliares/travas.js'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import {
  OPCOES_CORREDICAS,
  obterOpcoesExtracao,
  resolverAlteracaoCorredicas,
  descreverRespostaCorredicas,
} from '../src/domain/corredicasVendedor.js'

after(() => assertSemRede())

test('TC-01 — Catálogo de modelos e subopções por modelo', () => {
  assert.deepEqual(OPCOES_CORREDICAS, ['Ocultas', 'Hafele', 'Blum'])
  assert.deepEqual(obterOpcoesExtracao('Hafele'), ['Extração total', 'Tip-on'])
  assert.deepEqual(obterOpcoesExtracao('Blum'), ['Extração total', 'Tip-on', 'Extração parcial'])

  for (const semSubopcoes of ['Ocultas', 'não se aplica', null, 'Telescópicas']) {
    assert.deepEqual(obterOpcoesExtracao(semSubopcoes), [], String(semSubopcoes))
  }
})

test('TC-02 — Troca de modelo limpa subopção; clicar no mesmo modelo preserva', () => {
  assert.deepEqual(resolverAlteracaoCorredicas('Blum', 'Extração parcial', 'Blum'), {
    corredicas: 'Blum',
    corredicasExtracao: 'Extração parcial',
  })
  assert.deepEqual(resolverAlteracaoCorredicas('Hafele', 'Tip-on', 'Hafele'), {
    corredicas: 'Hafele',
    corredicasExtracao: 'Tip-on',
  })
  assert.deepEqual(resolverAlteracaoCorredicas('Blum', 'Extração parcial', 'Hafele'), {
    corredicas: 'Hafele',
    corredicasExtracao: null,
  })
  assert.deepEqual(resolverAlteracaoCorredicas('Hafele', 'Tip-on', 'Blum'), {
    corredicas: 'Blum',
    corredicasExtracao: null,
  })
  assert.deepEqual(resolverAlteracaoCorredicas('Hafele', 'Extração total', 'Ocultas'), {
    corredicas: 'Ocultas',
    corredicasExtracao: null,
  })
  assert.deepEqual(resolverAlteracaoCorredicas('Blum', 'Tip-on', 'não se aplica'), {
    corredicas: 'não se aplica',
    corredicasExtracao: null,
  })
  assert.deepEqual(resolverAlteracaoCorredicas(null, null, 'Blum'), {
    corredicas: 'Blum',
    corredicasExtracao: null,
  })
})

test('TC-03 — Formatação compartilhada e flag destaque para Revisão/PDF', () => {
  for (const vazio of [{}, { corredicas: null }, { corredicas: undefined }, { corredicas: '' }]) {
    assert.deepEqual(descreverRespostaCorredicas(vazio), { texto: '—', destaque: false, linhas: [] })
  }

  assert.deepEqual(descreverRespostaCorredicas({ corredicas: 'não se aplica' }), {
    texto: 'Não se aplica',
    destaque: false,
    linhas: [],
  })

  assert.deepEqual(descreverRespostaCorredicas({ corredicas: 'Ocultas' }), {
    texto: 'Ocultas',
    destaque: false,
    linhas: [],
  })
  assert.deepEqual(descreverRespostaCorredicas({ corredicas: 'Ocultas', corredicasExtracao: 'Tip-on' }), {
    texto: 'Ocultas',
    destaque: false,
    linhas: [],
  })

  assert.deepEqual(descreverRespostaCorredicas({ corredicas: 'Hafele', corredicasExtracao: 'Extração total' }), {
    texto: 'Hafele — Extração total',
    destaque: true,
    linhas: [],
  })
  assert.deepEqual(descreverRespostaCorredicas({ corredicas: 'Hafele', corredicasExtracao: 'Tip-on' }), {
    texto: 'Hafele — Tip-on',
    destaque: true,
    linhas: [],
  })

  assert.deepEqual(descreverRespostaCorredicas({ corredicas: 'Blum', corredicasExtracao: 'Extração total' }), {
    texto: 'Blum — Extração total',
    destaque: true,
    linhas: [],
  })
  assert.deepEqual(descreverRespostaCorredicas({ corredicas: 'Blum', corredicasExtracao: 'Tip-on' }), {
    texto: 'Blum — Tip-on',
    destaque: true,
    linhas: [],
  })
  assert.deepEqual(descreverRespostaCorredicas({ corredicas: 'Blum', corredicasExtracao: 'Extração parcial' }), {
    texto: 'Blum — Extração parcial',
    destaque: true,
    linhas: [],
  })

  assert.deepEqual(descreverRespostaCorredicas({ corredicas: 'Hafele', corredicasExtracao: null }), {
    texto: 'Hafele',
    destaque: true,
    linhas: [],
  })
  assert.deepEqual(
    descreverRespostaCorredicas({ corredicas: 'Hafele', corredicasExtracao: 'Extração parcial' }),
    { texto: 'Hafele', destaque: true, linhas: [] }
  )
  assert.deepEqual(descreverRespostaCorredicas({ corredicas: 'Blum', corredicasExtracao: null }), {
    texto: 'Blum',
    destaque: true,
    linhas: [],
  })
  assert.deepEqual(descreverRespostaCorredicas({ corredicas: 'Blum' }), {
    texto: 'Blum',
    destaque: true,
    linhas: [],
  })
})

test('TC-11 — Compatibilidade de rascunho antigo sem campo corredicasExtracao (descrição pura)', () => {
  assert.deepEqual(descreverRespostaCorredicas({ corredicas: 'Ocultas' }), {
    texto: 'Ocultas',
    destaque: false,
    linhas: [],
  })
  assert.deepEqual(descreverRespostaCorredicas({ corredicas: null }), {
    texto: '—',
    destaque: false,
    linhas: [],
  })
})
