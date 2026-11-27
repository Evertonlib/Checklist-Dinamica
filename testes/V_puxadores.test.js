import { assertSemRede } from './auxiliares/travas.js'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import {
  MODELOS_PUXADOR,
  filtrarSugestoesPuxador,
  obterSugestoesCor,
  resolverAlteracaoModelo,
  descreverRespostaPuxadores,
} from '../src/domain/puxadoresVendedor.js'

after(() => assertSemRede())

test('TP-01 — Sugestões de Modelo na ordem exata', () => {
  const esperado = [
    'Roma',
    'Madri 150mm',
    'Madri 270mm',
    'Berlin',
    'Paris',
    'Perfil Cava',
    'Perfil Gola Fit',
    'Florença',
  ]
  assert.deepEqual(MODELOS_PUXADOR, esperado)
  assert.deepEqual(filtrarSugestoesPuxador(MODELOS_PUXADOR, ''), esperado)
  assert.equal(MODELOS_PUXADOR.includes('Outro'), false)
})

test('TP-02 — Filtro de autocomplete sem acentos, caixa e com texto vazio', () => {
  assert.deepEqual(filtrarSugestoesPuxador(MODELOS_PUXADOR, 'mad'), ['Madri 150mm', 'Madri 270mm'])
  assert.deepEqual(filtrarSugestoesPuxador(MODELOS_PUXADOR, 'florenca'), ['Florença'])
  assert.deepEqual(filtrarSugestoesPuxador(MODELOS_PUXADOR, 'CAVA'), ['Perfil Cava'])
  assert.deepEqual(filtrarSugestoesPuxador(['Fendi', 'Alumínio', 'Griggio'], 'aluminio'), ['Alumínio'])
  assert.deepEqual(filtrarSugestoesPuxador(['Antique', 'Aço', 'Cobre'], 'aco'), ['Aço'])
  assert.deepEqual(filtrarSugestoesPuxador(MODELOS_PUXADOR, '   '), [
    'Roma',
    'Madri 150mm',
    'Madri 270mm',
    'Berlin',
    'Paris',
    'Perfil Cava',
    'Perfil Gola Fit',
    'Florença',
  ])
  assert.deepEqual(filtrarSugestoesPuxador(MODELOS_PUXADOR, 'Zen Cup'), [])
})

test('TP-03 — Sugestões dependentes de Cor por modelo e lista vazia para desconhecido', () => {
  assert.deepEqual(obterSugestoesCor('Roma'), ['Fendi', 'Alumínio', 'Griggio'])
  assert.deepEqual(obterSugestoesCor('roma'), ['Fendi', 'Alumínio', 'Griggio'])
  assert.deepEqual(obterSugestoesCor('Berlin'), ['Antique', 'Aço', 'Cobre'])
  assert.deepEqual(obterSugestoesCor('Paris'), ['Antique'])
  assert.deepEqual(obterSugestoesCor('Perfil Cava'), ['Fendi', 'Alumínio'])
  assert.deepEqual(obterSugestoesCor('Perfil Gola Fit'), ['Alumínio', 'Grafito'])

  for (const semPaleta of ['Madri 150mm', 'Madri 270mm', 'Florença', 'Zen Cup', 'Madri', '']) {
    assert.deepEqual(obterSugestoesCor(semPaleta), [], semPaleta)
  }
})

test('TP-04 — Autopreenchimento de "Sem cor" para modelos de cor única', () => {
  for (const modelo of ['Madri 150mm', 'Madri 270mm', 'Florença', 'florenca', 'MADRI 150MM', '  Madri 270mm  ']) {
    assert.deepEqual(resolverAlteracaoModelo('', '', modelo), { modelo, cor: 'Sem cor' }, modelo)
  }
  assert.deepEqual(resolverAlteracaoModelo('Roma', 'Fendi', 'Madri 150mm'), {
    modelo: 'Madri 150mm',
    cor: 'Sem cor',
  })
})

test('TP-05 — Troca de modelo zera a cor anterior e mantém cor apenas sem mudança real de modelo', () => {
  assert.deepEqual(resolverAlteracaoModelo('Madri 150mm', 'Sem cor', 'Roma'), { modelo: 'Roma', cor: '' })
  assert.deepEqual(resolverAlteracaoModelo('Madri 270mm', 'Sem cor', 'Zen Cup'), { modelo: 'Zen Cup', cor: '' })
  assert.deepEqual(resolverAlteracaoModelo('Florença', 'Sem cor', ''), { modelo: '', cor: '' })
  assert.deepEqual(resolverAlteracaoModelo('florenca', '  sem cor ', 'Paris'), { modelo: 'Paris', cor: '' })
  assert.deepEqual(resolverAlteracaoModelo('Berlin', 'Aço', 'Roma'), { modelo: 'Roma', cor: '' })
  assert.deepEqual(resolverAlteracaoModelo('Roma', 'Fendi', 'Berlin'), { modelo: 'Berlin', cor: '' })
  assert.deepEqual(resolverAlteracaoModelo('Madri 150mm', 'Preto', 'Roma'), { modelo: 'Roma', cor: '' })
  assert.deepEqual(resolverAlteracaoModelo('Madri 150mm', 'Preto', 'Madri 270mm'), {
    modelo: 'Madri 270mm',
    cor: 'Sem cor',
  })
  assert.deepEqual(resolverAlteracaoModelo('Madri 150mm', 'Preto', 'madri 150mm'), {
    modelo: 'madri 150mm',
    cor: 'Preto',
  })
  assert.deepEqual(resolverAlteracaoModelo('', 'Gold', 'Zen Cup'), { modelo: 'Zen Cup', cor: 'Gold' })
})

test('TP-13 — Formatação compartilhada para Não (inclusive com puxadores preservados)', () => {
  assert.deepEqual(descreverRespostaPuxadores({ temPuxador: 'Não' }), {
    texto: 'Não',
    destaque: false,
    linhas: [],
  })
  assert.deepEqual(
    descreverRespostaPuxadores({
      temPuxador: 'Não',
      puxadores: [{ modelo: 'Roma', cor: 'Fendi' }],
    }),
    { texto: 'Não', destaque: false, linhas: [] }
  )
})

test('TP-15 — Formatação compartilhada para não respondido, 1 puxador e múltiplos puxadores', () => {
  assert.deepEqual(descreverRespostaPuxadores({}), { texto: '—', destaque: false, linhas: [] })
  assert.deepEqual(descreverRespostaPuxadores({ temPuxador: null }), { texto: '—', destaque: false, linhas: [] })
  assert.deepEqual(descreverRespostaPuxadores({ temPuxador: '' }), { texto: '—', destaque: false, linhas: [] })

  assert.deepEqual(
    descreverRespostaPuxadores({
      temPuxador: 'Sim',
      puxadores: [{ modelo: 'Roma', cor: 'Fendi' }],
    }),
    { texto: 'Sim', destaque: false, linhas: ['• Roma — Fendi'] }
  )

  assert.deepEqual(
    descreverRespostaPuxadores({
      temPuxador: 'Sim',
      puxadores: [
        { modelo: 'Roma', cor: 'Fendi' },
        { modelo: 'Madri 150mm', cor: 'Sem cor' },
      ],
    }),
    { texto: 'Sim', destaque: false, linhas: ['• Roma — Fendi', '• Madri 150mm — Sem cor'] }
  )

  assert.deepEqual(
    descreverRespostaPuxadores({
      temPuxador: 'Sim',
      puxadores: [{ modelo: '  Zen Cup ', cor: ' Gold  ' }],
    }),
    { texto: 'Sim', destaque: false, linhas: ['• Zen Cup — Gold'] }
  )
})
