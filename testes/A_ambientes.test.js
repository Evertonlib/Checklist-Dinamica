import { assertSemRede } from './auxiliares/travas.js'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
// AMBIENTES_DISPONIVEIS é a única constante importada da suíte: aqui ela é o objeto testado (regra 2 do PRD)
import { formatarNomeAmbiente, AMBIENTES_DISPONIVEIS } from '../src/domain/ambientes.js'

after(() => assertSemRede())

test('T-A01 — rótulo com nome personalizado vira "rótulo — nome", sem espaços nas pontas', () => {
  assert.equal(formatarNomeAmbiente({ label: 'Dormitório Casal', nome: ' Suíte ' }), 'Dormitório Casal — Suíte')
})

test('T-A02 — nome vazio ou só de espaços devolve só o rótulo', () => {
  assert.equal(formatarNomeAmbiente({ label: 'Dormitório Casal', nome: '' }), 'Dormitório Casal')
  assert.equal(formatarNomeAmbiente({ label: 'Dormitório Casal', nome: '   ' }), 'Dormitório Casal')
})

test('T-A03 — catálogo tem os 8 ambientes com rótulo e formType (Varanda → cozinha, Office → home)', () => {
  const esperado = [
    { id: 'banheiro', label: 'Banheiro / W.C.', formType: 'banheiro' },
    { id: 'cozinha', label: 'Cozinha / Área de Serviço', formType: 'cozinha' },
    { id: 'dormitorio_casal', label: 'Dormitório Casal', formType: 'dormitorio' },
    { id: 'dormitorio_solteiro', label: 'Dormitório Solteiro', formType: 'dormitorio' },
    { id: 'home', label: 'Home / Sala', formType: 'home' },
    { id: 'office', label: 'Office', formType: 'home' },
    { id: 'outros', label: 'Outros', formType: 'outros' },
    { id: 'varanda', label: 'Varanda / Área Gourmet', formType: 'cozinha' },
  ]
  // A ordem da tela não é travada: reordenar o catálogo não é bug
  const obtido = [...AMBIENTES_DISPONIVEIS]
    .map(({ id, label, formType }) => ({ id, label, formType }))
    .sort((a, b) => a.id.localeCompare(b.id))
  assert.deepEqual(obtido, esperado)
})
