import { assertSemRede } from './auxiliares/travas.js'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { obterGrupo } from '../src/domain/gruposPerguntasVendedor.js'
import { carregarPdf } from './auxiliares/carregar_pdf.js'
import { montarEstadoProjetista } from './auxiliares/construtores.js'
import { sequencia, ausencia } from './auxiliares/leitura_pdf.js'

after(() => assertSemRede())

// Falha alta: sem esbuild ou com empacotamento quebrado, o arquivo inteiro não carrega
const pdf = await carregarPdf()

// Textos depois do nome do ambiente até o fim (um ambiente por PDF nestes casos)
function depoisDoNome(captura, nome) {
  const inicio = captura.textos.indexOf(nome)
  assert.ok(inicio >= 0, `Ambiente "${nome}" não encontrado`)
  return captura.textos.slice(inicio + 1)
}

test('T-V01 — grupo por ambiente: A (cozinha, varanda, banheiro, outros), B (dormitórios), C (home, office)', () => {
  for (const id of ['cozinha', 'varanda', 'banheiro', 'outros']) assert.equal(obterGrupo(id), 'A', id)
  for (const id of ['dormitorio_casal', 'dormitorio_solteiro']) assert.equal(obterGrupo(id), 'B', id)
  for (const id of ['home', 'office']) assert.equal(obterGrupo(id), 'C', id)
})

test('T-V02 — ambiente desconhecido cai no grupo A', () => {
  assert.equal(obterGrupo('ambiente_inexistente'), 'A')
})

test('T-V03 — grupo A: alturas, fechamento, caixaria, dobradiças e corrediças, nessa ordem', async () => {
  const captura = await pdf.projetista(montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A' }]))
  assert.deepEqual(depoisDoNome(captura, 'Cozinha / Área de Serviço'), [
    'Altura do piso — balcões',
    'Resposta: —',
    'Altura do piso — armários',
    'Resposta: —',
    'Fechamento até o teto',
    'Resposta: —',
    'Caixarias ou corpos',
    'Resposta: —',
    'Dobradiças',
    'Resposta: —',
    'Corrediças',
    'Resposta: —',
  ])
})

test('T-V04 — grupo B: fechamento por último e sem alturas', async () => {
  const captura = await pdf.projetista(montarEstadoProjetista([{ tipo: 'dormitorio_casal', grupo: 'B' }]))
  assert.deepEqual(depoisDoNome(captura, 'Dormitório Casal'), [
    'Caixarias ou corpos',
    'Resposta: —',
    'Dobradiças',
    'Resposta: —',
    'Corrediças',
    'Resposta: —',
    'Fechamento até o teto',
    'Resposta: —',
  ])
  ausencia(captura, { comeca: 'Altura do piso — ' })
})

test('T-V05 — grupo C: sem alturas e sem fechamento', async () => {
  const captura = await pdf.projetista(montarEstadoProjetista([{ tipo: 'home', grupo: 'C' }]))
  assert.deepEqual(depoisDoNome(captura, 'Home / Sala'), [
    'Caixarias ou corpos',
    'Resposta: —',
    'Dobradiças',
    'Resposta: —',
    'Corrediças',
    'Resposta: —',
  ])
})

test('T-V06 — formatação das respostas: mm, "Não se aplica", NÃO/SIM e "—"', async () => {
  const resp = {
    alturaBalcao_mm: 850,
    alturaArmario_mm: 'não se aplica',
    fechamentoTeto: 'NAO',
    caixaria: null,
    dobradicas: 'Amortecimento',
  }
  const captura = await pdf.projetista(montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A', resp }]))
  const respostas = depoisDoNome(captura, 'Cozinha / Área de Serviço').filter((t) => t.startsWith('Resposta: '))
  assert.deepEqual(respostas, [
    'Resposta: 850 mm',
    'Resposta: Não se aplica',
    'Resposta: NÃO',
    'Resposta: —',
    'Resposta: Amortecimento',
    'Resposta: —',
  ])
  const sim = await pdf.projetista(
    montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A', resp: { ...resp, fechamentoTeto: 'SIM' } }])
  )
  sequencia(sim, ['Fechamento até o teto', 'Resposta: SIM'])
})

test('T-V07 — capa: cliente, contratos preenchidos e data', async () => {
  const captura = await pdf.projetista(
    montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A' }], ['TA9001', '', 'SM9002'], 'CLIENTE FICTICIO TESTE')
  )
  sequencia(captura, ['Cliente: CLIENTE FICTICIO TESTE', 'Contrato(s): TA9001, SM9002', 'Data: 19/10/2026'])
})

test('T-V08 — sem contrato: capa com "—" e arquivo SEMCONTRATO', async () => {
  const captura = await pdf.projetista(montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A' }], ['']))
  assert.ok(captura.textos.includes('Contrato(s): —'))
  assert.deepEqual(captura.saves, ['Checklist_Projetista_SEMCONTRATO_2026-10-19.pdf'])
})

test('T-V09 — nome do arquivo usa o primeiro contrato preenchido', async () => {
  const a = await pdf.projetista(montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A' }], ['TA9001', '', 'SM9002']))
  assert.deepEqual(a.saves, ['Checklist_Projetista_TA9001_2026-10-19.pdf'])
  const b = await pdf.projetista(montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A' }], ['', 'SM9002', 'TA9001']))
  assert.deepEqual(b.saves, ['Checklist_Projetista_SM9002_2026-10-19.pdf'])
})

test('T-V10 — observações do ambiente aparecem só quando preenchidas', async () => {
  const com = await pdf.projetista(
    montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A', resp: { observacoes: 'TESTE de observação' } }])
  )
  sequencia(com, ['Observações do ambiente', 'Resposta: TESTE de observação'])
  const sem = await pdf.projetista(montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A', resp: { observacoes: '' } }]))
  ausencia(sem, { igual: 'Observações do ambiente' })
})
