import { assertSemRede } from './auxiliares/travas.js'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { validarFormularioAmbiente, limitarCm, limitarCmRebaixo } from '../src/steps/StepPerguntasPorAmbiente/formUtils.js'
import { defaultsPorFormType } from '../src/domain/schema.js'
import { eletro, eletronico, MEDIDAS } from './auxiliares/construtores.js'

after(() => assertSemRede())

const SELECIONE = 'Selecione uma opção'

// Resposta base = defaults do formType copiados, com os campos do caso por cima
function validar(formType, campos = {}) {
  return validarFormularioAmbiente(formType, { ...structuredClone(defaultsPorFormType[formType]), ...campos })
}

test('T-F01 — Cozinha só com defaults: erros exatamente em granito, tanque e eletrosDefined', () => {
  assert.deepEqual(validar('cozinha'), { eletrosDefined: SELECIONE, granito: SELECIONE, tanque: SELECIONE })
  assert.deepEqual(Object.keys(validar('cozinha')).sort(), ['eletrosDefined', 'granito', 'tanque'])
})

test('T-F02 — Dormitório com defaults: cortineiro, rodape, tamanhoCama e tv', () => {
  const erros = validar('dormitorio')
  assert.deepEqual(Object.keys(erros).sort(), ['cortineiro', 'rodape', 'tamanhoCama', 'tv'])
  assert.equal(erros.tamanhoCama, 'Selecione o tamanho da cama')
  assert.equal(erros.cortineiro, SELECIONE)
  assert.equal(erros.rodape, SELECIONE)
  assert.equal(erros.tv, SELECIONE)
})

test('T-F03 — Home com defaults: cortineiro, eletronicos e rodape', () => {
  assert.deepEqual(validar('home'), { cortineiro: SELECIONE, eletronicos: SELECIONE, rodape: SELECIONE })
  assert.deepEqual(Object.keys(validar('home')).sort(), ['cortineiro', 'eletronicos', 'rodape'])
})

test('T-F04 — Banheiro com defaults: cuba e granito', () => {
  const erros = validar('banheiro')
  assert.deepEqual(Object.keys(erros).sort(), ['cuba', 'granito'])
  assert.equal(erros.cuba, 'Selecione o tipo de cuba')
  assert.equal(erros.granito, SELECIONE)
})

test('T-F05 — Outros com defaults: cortineiro, eletrosDefined, eletronicos, granito, rodape e tanque', () => {
  assert.deepEqual(Object.keys(validar('outros')).sort(), [
    'cortineiro',
    'eletronicos',
    'eletrosDefined',
    'granito',
    'rodape',
    'tanque',
  ])
})

test('T-F06 — Cozinha e Dormitório completos não têm erro (cliente não fica bloqueado)', () => {
  assert.deepEqual(validar('cozinha', { granito: false, tanque: false, eletrosDefined: false }), {})
  assert.deepEqual(
    validar('dormitorio', { tv: false, cortineiro: false, rodape: false, tamanhoCama: 'padrao' }),
    {}
  )
})

test('T-F07 — tanque Sim exige tipo; tradicional exige móveis; embutido não exige móveis', () => {
  const base = { granito: false, eletrosDefined: false, tanque: true }
  const a = validar('cozinha', { ...base, tanqueEmbutido: null })
  assert.equal(a.tanqueEmbutido, SELECIONE)
  const b = validar('cozinha', { ...base, tanqueEmbutido: false, tanqueMoveis: null })
  assert.equal(b.tanqueMoveis, SELECIONE)
  const c = validar('cozinha', { ...base, tanqueEmbutido: true, tanqueMoveis: null })
  assert.deepEqual(c, {})
  assert.equal('tanqueMoveis' in c, false)
})

test('T-F08 — eletros e eletrônicos "Sim" com lista vazia pedem ao menos um item', () => {
  assert.equal(validar('cozinha', { eletrosDefined: true, eletros: [] }).eletros, 'Adicione ao menos um eletro')
  assert.equal(
    validar('home', { eletronicos: true, eletronicosList: [] }).eletronicosList,
    'Adicione ao menos um eletrônico'
  )
})

test('T-F09 — medidas vazias são obrigatórias por índice, em eletro e eletrônico', () => {
  const coz = validar('cozinha', {
    eletrosDefined: true,
    eletros: [eletro('Cooktop'), eletro('Cooktop', { largura_cm: '60', altura_cm: '10', profundidade_cm: '50' })],
  })
  assert.equal(coz.eletro_0_largura, 'Obrigatório')
  assert.equal(coz.eletro_0_altura, 'Obrigatório')
  assert.equal(coz.eletro_0_prof, 'Obrigatório')
  assert.deepEqual(Object.keys(coz).filter((k) => k.startsWith('eletro_1_')), [])
  const home = validar('home', { eletronicos: true, eletronicosList: [eletronico('Home Theater')] })
  assert.equal(home.eletronico_0_largura, 'Obrigatório')
  assert.equal(home.eletronico_0_altura, 'Obrigatório')
  assert.equal(home.eletronico_0_prof, 'Obrigatório')
})

test('T-F10 — Depurador Embutido exige modelo e link; Depurador Normal não', () => {
  const embutido = validar('cozinha', {
    eletrosDefined: true,
    eletros: [eletro('Depurador', { subtipo: 'Embutido', ...MEDIDAS })],
  })
  assert.equal(embutido.eletro_0_modelo, 'Obrigatório para Depurador Embutido')
  assert.equal(embutido.eletro_0_link, 'Obrigatório para Depurador Embutido')
  const normal = validar('cozinha', {
    eletrosDefined: true,
    eletros: [eletro('Depurador', { subtipo: 'Normal', ...MEDIDAS })],
  })
  assert.equal('eletro_0_modelo' in normal, false)
  assert.equal('eletro_0_link' in normal, false)
})

test('T-F11 — subtipo obrigatório só para tipo com subtipos (Fogão, Refrigerador); Cooktop não', () => {
  const fogao = validar('cozinha', { eletrosDefined: true, eletros: [eletro('Fogão', MEDIDAS)] })
  assert.equal(fogao.eletro_0_subtipo, 'Obrigatório')
  const cooktop = validar('cozinha', { eletrosDefined: true, eletros: [eletro('Cooktop', MEDIDAS)] })
  assert.equal('eletro_0_subtipo' in cooktop, false)
  const refrigerador = validar('cozinha', {
    eletrosDefined: true,
    eletros: [eletro('Refrigerador', { subtipo: '   ', ...MEDIDAS })],
  })
  assert.equal(refrigerador.eletro_0_subtipo, 'Obrigatório')
})

test('T-F12 — eletro "Outros" exige descrição', () => {
  const sem = validar('cozinha', { eletrosDefined: true, eletros: [eletro('Outros', MEDIDAS)] })
  assert.equal(sem.eletro_0_descricao, 'Descreva qual eletro é')
  const com = validar('cozinha', { eletrosDefined: true, eletros: [eletro('Outros', { descricao: 'Adega', ...MEDIDAS })] })
  assert.equal('eletro_0_descricao' in com, false)
})

test('T-F13 — Home e Outros com TV na lista: ponto da TV e polegadas obrigatórios', () => {
  for (const formType of ['home', 'outros']) {
    const a = validar(formType, {
      eletronicos: true,
      eletronicosList: [eletronico('TV', { ...MEDIDAS, polegadas: '55' })],
      tvPontoFinal: null,
    })
    assert.equal(a.tvPontoFinal, SELECIONE, formType)
    const b = validar(formType, {
      eletronicos: true,
      eletronicosList: [eletronico('TV', { ...MEDIDAS, polegadas: '' })],
      tvPontoFinal: false,
    })
    assert.equal(b.eletronico_0_polegadas, 'Obrigatório', formType)
    assert.equal('tvPontoFinal' in b, false, formType)
  }
})

test('T-F14 — Dormitório com TV: ponto da TV e polegadas obrigatórios', () => {
  assert.equal(validar('dormitorio', { tv: true, tvPontoFinal: null }).tvPontoFinal, SELECIONE)
  assert.equal(validar('dormitorio', { tv: true, tvPontoFinal: false, tv_polegadas: '' }).tv_polegadas, 'Obrigatório')
})

test('T-F15 — cama obrigatória no Dormitório; cama "outro" exige medidas; cuba só de espaços é vazia', () => {
  assert.equal(validar('dormitorio').tamanhoCama, 'Selecione o tamanho da cama')
  for (const formType of ['dormitorio', 'outros']) {
    const erros = validar(formType, { tamanhoCama: 'outro' })
    assert.equal(erros.camaLargura_cm, 'Obrigatório', formType)
    assert.equal(erros.camaComprimento_cm, 'Obrigatório', formType)
  }
  assert.equal(validar('banheiro', { cuba: '   ' }).cuba, 'Selecione o tipo de cuba')
})

test('T-F16 — limitarCm: até 3 inteiros e 1 decimal, com vírgula', () => {
  assert.equal(limitarCm('1385.57'), '138,5')
  assert.equal(limitarCm('12a,3'), '12,3')
  assert.equal(limitarCm('12'), '12')
  assert.equal(limitarCm('1234'), '123')
  assert.equal(limitarCm(null), '')
})

test('T-F17 — limitarCmRebaixo: até 2 inteiros e 1 decimal (máx. 99 cm)', () => {
  assert.equal(limitarCmRebaixo('123'), '12')
  assert.equal(limitarCmRebaixo('12,5'), '12,5')
  assert.equal(limitarCmRebaixo('12.57'), '12,5')
  assert.equal(limitarCmRebaixo('123,4'), '12,4')
  assert.equal(limitarCmRebaixo(null), '')
  assert.equal(limitarCm('123'), '123')
})
