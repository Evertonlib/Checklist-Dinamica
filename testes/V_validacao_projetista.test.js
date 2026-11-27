import { assertSemRede } from './auxiliares/travas.js'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { validarRespostasGrupo } from '../src/domain/validacaoVendedor.js'
import { resolverAlteracaoModelo } from '../src/domain/puxadoresVendedor.js'

after(() => assertSemRede())

const BASE_A = {
  alturaBalcao_mm: 850,
  alturaArmario_mm: 'não se aplica',
  fechamentoTeto: 'NAO',
  caixaria: 'MDP',
  dobradicas: 'Convencionais',
  corredicas: 'Ocultas',
  temPuxador: 'Não',
}

const BASE_B = {
  caixaria: 'MDF',
  dobradicas: 'Amortecimento',
  corredicas: 'Ocultas',
  fechamentoTeto: 'SIM',
}

const BASE_C = {
  caixaria: 'MDF',
  dobradicas: 'Amortecimento',
  corredicas: 'Ocultas',
}

test('T17 — Grupos B e C intocados', () => {
  assert.deepEqual(
    validarRespostasGrupo('B', {
      ...BASE_B,
      temPuxador: 'Não',
    }),
    {}
  )

  assert.deepEqual(
    validarRespostasGrupo('C', {
      ...BASE_C,
      temPuxador: 'Não',
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

test('TP-06 — Pergunta "Tem puxador?" sem resposta bloqueia nos grupos A, B e C', () => {
  const entradas = [
    ['A', { ...BASE_A, tipoBalcao: 'Convencionais', temPuxador: null }],
    ['A', { ...BASE_A, tipoBalcao: 'Convencionais', temPuxador: undefined }],
    ['B', { ...BASE_B, temPuxador: null }],
    ['B', { ...BASE_B }],
    ['C', { ...BASE_C, temPuxador: null }],
    ['C', { ...BASE_C }],
  ]
  for (const [grupo, resp] of entradas) {
    assert.deepEqual(validarRespostasGrupo(grupo, resp), { temPuxador: 'Responda sim ou não' }, grupo)
  }
})

test('TP-07 — "Tem puxador?" = Não libera o avanço nos grupos A, B e C, mesmo com lista preservada', () => {
  const bases = [
    ['A', { ...BASE_A, tipoBalcao: 'Convencionais' }],
    ['B', BASE_B],
    ['C', BASE_C],
  ]
  const listas = [[], [{ modelo: '', cor: '' }], [{ modelo: 'Roma', cor: 'Fendi' }]]
  for (const [grupo, base] of bases) {
    for (const puxadores of listas) {
      assert.deepEqual(validarRespostasGrupo(grupo, { ...base, temPuxador: 'Não', puxadores }), {}, grupo)
    }
  }
})

test('TP-08 — "Tem puxador?" = Sim valida lista vazia e cada modelo e cor por índice', () => {
  const baseA = { ...BASE_A, tipoBalcao: 'Convencionais', temPuxador: 'Sim' }
  assert.deepEqual(validarRespostasGrupo('A', { ...baseA, puxadores: [] }), {
    puxadores: 'Adicione pelo menos um puxador',
  })
  assert.deepEqual(validarRespostasGrupo('A', { ...baseA, puxadores: undefined }), {
    puxadores: 'Adicione pelo menos um puxador',
  })
  assert.deepEqual(validarRespostasGrupo('A', { ...baseA, puxadores: [{ modelo: '', cor: '' }] }), {
    puxador_0_modelo: 'Informe o modelo',
    puxador_0_cor: 'Informe a cor',
  })
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...baseA,
      puxadores: [
        { modelo: 'Roma', cor: 'Fendi' },
        { modelo: 'Berlin', cor: '   ' },
      ],
    }),
    { puxador_1_cor: 'Informe a cor' }
  )
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...baseA,
      puxadores: [
        { modelo: '   ', cor: 'Fendi' },
        { modelo: '', cor: '' },
      ],
    }),
    {
      puxador_0_modelo: 'Informe o modelo',
      puxador_1_modelo: 'Informe o modelo',
      puxador_1_cor: 'Informe a cor',
    }
  )
  assert.deepEqual(
    validarRespostasGrupo('A', { ...baseA, puxadores: [{ modelo: 'Roma', cor: 'Fendi' }] }),
    {}
  )
})

test('TP-09 — Modelo de cor única com "Sem cor" autopreenchido avança', () => {
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...BASE_A,
      tipoBalcao: 'Convencionais',
      temPuxador: 'Sim',
      puxadores: [
        { modelo: 'Madri 150mm', cor: 'Sem cor' },
        { modelo: 'Madri 270mm', cor: 'Sem cor' },
        { modelo: 'Florença', cor: 'Sem cor' },
      ],
    }),
    {}
  )
})

test('TP-10 — Trocar modelo de cor única limpa "Sem cor" e volta a exigir Cor', () => {
  const trocouRoma = resolverAlteracaoModelo('Madri 150mm', 'Sem cor', 'Roma')
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...BASE_A,
      tipoBalcao: 'Convencionais',
      temPuxador: 'Sim',
      puxadores: [trocouRoma],
    }),
    { puxador_0_cor: 'Informe a cor' }
  )

  const trocouZen = resolverAlteracaoModelo('Madri 150mm', 'Sem cor', 'Zen Cup')
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...BASE_A,
      tipoBalcao: 'Convencionais',
      temPuxador: 'Sim',
      puxadores: [trocouZen],
    }),
    { puxador_0_cor: 'Informe a cor' }
  )

  const apagouModelo = resolverAlteracaoModelo('Madri 150mm', 'Sem cor', '')
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...BASE_A,
      tipoBalcao: 'Convencionais',
      temPuxador: 'Sim',
      puxadores: [apagouModelo],
    }),
    {
      puxador_0_modelo: 'Informe o modelo',
      puxador_0_cor: 'Informe a cor',
    }
  )
})

test('TP-11 — Modelo livre digitado + Cor livre digitada avançam', () => {
  assert.deepEqual(
    validarRespostasGrupo('B', {
      ...BASE_B,
      temPuxador: 'Sim',
      puxadores: [{ modelo: 'Zen Cup', cor: 'Gold' }],
    }),
    {}
  )
})

test('TP-12 — Regras existentes intactas junto com puxadores', () => {
  assert.deepEqual(
    validarRespostasGrupo('A', {
      ...BASE_A,
      alturaBalcao_mm: 0,
      tipoBalcao: 'Editados',
      balcaoAlturaForaPadrao: null,
      balcaoProfundidadeForaPadrao: 'Não',
      temPuxador: null,
    }),
    {
      alturaBalcao_mm: 'Responda esta pergunta ou marque "Não se aplica"',
      balcaoAlturaForaPadrao: 'Responda sim ou não',
      temPuxador: 'Responda sim ou não',
    }
  )
})
