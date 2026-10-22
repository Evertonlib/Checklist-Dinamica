import { assertSemRede } from './auxiliares/travas.js'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { carregarPdf } from './auxiliares/carregar_pdf.js'
import { sequencia, ausencia } from './auxiliares/leitura_pdf.js'

after(() => assertSemRede())

// Falha alta: sem esbuild ou com empacotamento quebrado, o arquivo inteiro não carrega
const pdf = await carregarPdf()

function montarEstadoFutura(identificacao = {}) {
  return {
    identificacao: {
      nome: 'CLIENTE FICTICIO TESTE',
      contrato: 'IT9001',
      telefone: '(11) 91234-5678',
      cep: '01001-000',
      logradouro: 'Rua Ficticia',
      numero: '10',
      complemento: 'Apto 5',
      bairro: 'Centro',
      cidade: 'Sao Paulo',
      uf: 'SP',
      ...identificacao,
    },
    _meta: { origemNavegacao: null },
  }
}

test('T-Q01 — nome do arquivo: Checklist_Futura_{contrato}_{data}.pdf', async () => {
  const captura = await pdf.futura(montarEstadoFutura())
  assert.deepEqual(captura.saves, ['Checklist_Futura_IT9001_2026-10-19.pdf'])
})

test('T-Q02 — capa: By Arabi Planejados e Checklist Venda Futura', async () => {
  const captura = await pdf.futura(montarEstadoFutura())
  sequencia(captura, ['By Arabi Planejados', 'Checklist Venda Futura'])
})

test('T-Q03 — corpo: cliente, contrato, endereço em linhas separadas, CEP, telefone e data (sem hora)', async () => {
  const captura = await pdf.futura(montarEstadoFutura())
  sequencia(captura, [
    'Cliente: CLIENTE FICTICIO TESTE',
    'Contrato: IT9001',
    'Rua Ficticia, 10 — Apto 5',
    'Centro — Sao Paulo/SP',
    'CEP: 01001-000',
    'Telefone: (11) 91234-5678',
    'Data: 19/10/2026',
  ])
})

test('T-Q04 — complemento vazio: endereço sai sem complemento', async () => {
  const captura = await pdf.futura(montarEstadoFutura({ complemento: '' }))
  sequencia(captura, ['Rua Ficticia, 10', 'Centro — Sao Paulo/SP'])
})

test('T-Q05 — sem ambiente, score, eletro nem CC', async () => {
  const captura = await pdf.futura(montarEstadoFutura())
  for (const palavra of ['Ambiente', 'Score', 'Eletro', 'Cliente Ciente']) {
    ausencia(captura, { contem: palavra })
  }
  assert.equal(captura.tabelas.length, 0)
})
