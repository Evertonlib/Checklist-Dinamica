import { assertSemRede } from './auxiliares/travas.js'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { obterGrupo } from '../src/domain/gruposPerguntasVendedor.js'
import { carregarPdf } from './auxiliares/carregar_pdf.js'
import { montarEstadoProjetista } from './auxiliares/construtores.js'
import { sequencia, ausencia, secao } from './auxiliares/leitura_pdf.js'

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

test('T-V03 — grupo A: alturas, pergunta de balcões, fechamento, caixaria, dobradiças, corrediças e puxadores, nessa ordem', async () => {
  const captura = await pdf.projetista(montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A' }]))
  assert.deepEqual(depoisDoNome(captura, 'Cozinha / Área de Serviço'), [
    'Altura do piso — balcões',
    'Resposta: —',
    'Altura do piso — armários',
    'Resposta: —',
    'Balcões convencionais ou editados',
    'Resposta: —',
    'Fechamento até o teto',
    'Resposta: —',
    'Caixarias ou corpos',
    'Resposta: —',
    'Dobradiças',
    'Resposta: —',
    'Corrediças',
    'Resposta: —',
    'Puxadores',
    'Resposta: —',
  ])
})

test('T-V04 — grupo B: fechamento e puxadores por último, sem alturas', async () => {
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
    'Puxadores',
    'Resposta: —',
  ])
  ausencia(captura, { comeca: 'Altura do piso — ' })
})

test('T-V05 — grupo C: sem alturas e sem fechamento, com puxadores por último', async () => {
  const captura = await pdf.projetista(montarEstadoProjetista([{ tipo: 'home', grupo: 'C' }]))
  assert.deepEqual(depoisDoNome(captura, 'Home / Sala'), [
    'Caixarias ou corpos',
    'Resposta: —',
    'Dobradiças',
    'Resposta: —',
    'Corrediças',
    'Resposta: —',
    'Puxadores',
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
    'Resposta: —',
    'Resposta: NÃO',
    'Resposta: —',
    'Resposta: Amortecimento',
    'Resposta: —',
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

test('T1 — Convencionais', async () => {
  const captura = await pdf.projetista(
    montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A', resp: { tipoBalcao: 'Convencionais' } }], ['9001'])
  )
  sequencia(captura, [
    'Altura do piso — armários',
    'Resposta: —',
    'Balcões convencionais ou editados',
    'Resposta: Convencionais',
    'Fechamento até o teto',
  ])
})

test('T2 — Não se aplica', async () => {
  const captura = await pdf.projetista(
    montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A', resp: { tipoBalcao: 'não se aplica' } }], ['9001'])
  )
  sequencia(captura, ['Balcões convencionais ou editados', 'Resposta: Não se aplica'])
})

test('T3 — Editados, Não e Não', async () => {
  const captura = await pdf.projetista(
    montarEstadoProjetista(
      [
        {
          tipo: 'cozinha',
          grupo: 'A',
          resp: {
            tipoBalcao: 'Editados',
            balcaoAlturaForaPadrao: 'Não',
            balcaoProfundidadeForaPadrao: 'Não',
          },
        },
      ],
      ['9001']
    )
  )
  sequencia(captura, ['Balcões convencionais ou editados', 'Resposta: Editados', 'Fechamento até o teto'])
})

test('T4 — Editados, só altura Sim', async () => {
  const captura = await pdf.projetista(
    montarEstadoProjetista(
      [
        {
          tipo: 'cozinha',
          grupo: 'A',
          resp: {
            tipoBalcao: 'Editados',
            balcaoAlturaForaPadrao: 'Sim',
            balcaoProfundidadeForaPadrao: 'Não',
          },
        },
      ],
      ['9001']
    )
  )
  sequencia(captura, [
    'Balcões convencionais ou editados',
    'Resposta: Editados',
    '• Altura fora do padrão',
    'Fechamento até o teto',
  ])
  ausencia(captura, { contem: 'Profundidade fora do padrão' })
})

test('T5 — Editados, só profundidade Sim', async () => {
  const captura = await pdf.projetista(
    montarEstadoProjetista(
      [
        {
          tipo: 'cozinha',
          grupo: 'A',
          resp: {
            tipoBalcao: 'Editados',
            balcaoAlturaForaPadrao: 'Não',
            balcaoProfundidadeForaPadrao: 'Sim',
          },
        },
      ],
      ['9001']
    )
  )
  sequencia(captura, [
    'Balcões convencionais ou editados',
    'Resposta: Editados',
    '• Profundidade fora do padrão',
    'Fechamento até o teto',
  ])
  ausencia(captura, { contem: 'Altura fora do padrão' })
})

test('T6 — Editados, altura Sim e profundidade Sim', async () => {
  const captura = await pdf.projetista(
    montarEstadoProjetista(
      [
        {
          tipo: 'cozinha',
          grupo: 'A',
          resp: {
            tipoBalcao: 'Editados',
            balcaoAlturaForaPadrao: 'Sim',
            balcaoProfundidadeForaPadrao: 'Sim',
          },
        },
      ],
      ['9001']
    )
  )
  sequencia(captura, [
    'Balcões convencionais ou editados',
    'Resposta: Editados',
    '• Altura fora do padrão',
    '• Profundidade fora do padrão',
    'Fechamento até o teto',
  ])
})

test('T7 — Dois ambientes', async () => {
  const captura = await pdf.projetista(
    montarEstadoProjetista(
      [
        {
          tipo: 'cozinha',
          grupo: 'A',
          resp: {
            tipoBalcao: 'Editados',
            balcaoAlturaForaPadrao: 'Sim',
            balcaoProfundidadeForaPadrao: 'Não',
          },
        },
        {
          tipo: 'varanda',
          grupo: 'A',
          resp: {
            tipoBalcao: 'Convencionais',
          },
        },
      ],
      ['9001']
    )
  )
  const nomes = ['Cozinha / Área de Serviço', 'Varanda / Área Gourmet']
  sequencia(secao(captura, 'Cozinha / Área de Serviço', nomes), [
    'Balcões convencionais ou editados',
    'Resposta: Editados',
    '• Altura fora do padrão',
  ])
  sequencia(secao(captura, 'Varanda / Área Gourmet', nomes), [
    'Balcões convencionais ou editados',
    'Resposta: Convencionais',
  ])
})

test('T8 — Observações e ordem preservadas', async () => {
  const captura = await pdf.projetista(
    montarEstadoProjetista(
      [
        {
          tipo: 'cozinha',
          grupo: 'A',
          resp: {
            tipoBalcao: 'Editados',
            balcaoAlturaForaPadrao: 'Sim',
            balcaoProfundidadeForaPadrao: 'Não',
            observacoes: 'TESTE de observação',
          },
        },
      ],
      ['9001']
    )
  )
  assert.deepEqual(depoisDoNome(captura, 'Cozinha / Área de Serviço'), [
    'Altura do piso — balcões',
    'Resposta: —',
    'Altura do piso — armários',
    'Resposta: —',
    'Balcões convencionais ou editados',
    'Resposta: Editados',
    '• Altura fora do padrão',
    'Fechamento até o teto',
    'Resposta: —',
    'Caixarias ou corpos',
    'Resposta: —',
    'Dobradiças',
    'Resposta: —',
    'Corrediças',
    'Resposta: —',
    'Puxadores',
    'Resposta: —',
    'Observações do ambiente',
    'Resposta: TESTE de observação',
  ])
})

test('T9 — "Não" e números nunca no PDF', async () => {
  const casos = [
    { tipoBalcao: 'Convencionais' },
    { tipoBalcao: 'não se aplica' },
    { tipoBalcao: null },
    { tipoBalcao: 'Editados', balcaoAlturaForaPadrao: 'Não', balcaoProfundidadeForaPadrao: 'Não' },
    { tipoBalcao: 'Editados', balcaoAlturaForaPadrao: 'Sim', balcaoProfundidadeForaPadrao: 'Não' },
    { tipoBalcao: 'Editados', balcaoAlturaForaPadrao: 'Não', balcaoProfundidadeForaPadrao: 'Sim' },
    { tipoBalcao: 'Editados', balcaoAlturaForaPadrao: 'Sim', balcaoProfundidadeForaPadrao: 'Sim' },
  ]
  for (const resp of casos) {
    const captura = await pdf.projetista(montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A', resp }], ['9001']))
    ausencia(captura, { igual: 'Resposta: Não' })
    // o rótulo da subpergunta, sem o marcador "•", nunca aparece como linha própria
    ausencia(captura, { comeca: 'Altura fora do padrão' })
    ausencia(captura, { comeca: 'Profundidade fora do padrão' })
    ausencia(captura, { contem: '676' })
    ausencia(captura, { contem: ' mm' })
    // "Não" nunca vira linha: sem "Sim" correspondente, a linha da subpergunta não existe
    if (resp.balcaoAlturaForaPadrao !== 'Sim') ausencia(captura, { contem: 'Altura fora do padrão' })
    if (resp.balcaoProfundidadeForaPadrao !== 'Sim') ausencia(captura, { contem: 'Profundidade fora do padrão' })
  }
})

test('TP-14 — PDF dos grupos A, B e C com Tem puxador? = Não (inclusive com lista preservada)', async () => {
  const captura = await pdf.projetista(
    montarEstadoProjetista(
      [
        {
          tipo: 'cozinha',
          grupo: 'A',
          resp: { temPuxador: 'Não', puxadores: [{ modelo: 'Roma', cor: 'Fendi' }] },
        },
        { tipo: 'dormitorio_casal', grupo: 'B', resp: { temPuxador: 'Não' } },
        { tipo: 'home', grupo: 'C', resp: { temPuxador: 'Não' } },
      ],
      ['9001']
    )
  )
  const nomes = ['Cozinha / Área de Serviço', 'Dormitório Casal', 'Home / Sala']
  for (const nome of nomes) {
    sequencia(secao(captura, nome, nomes), ['Puxadores', 'Resposta: Não'])
  }
  ausencia(captura, { contem: 'Roma' })
  ausencia(captura, { igual: '• Roma — Fendi' })
})

test('TP-16 — PDF com 1 puxador e com múltiplos puxadores', async () => {
  const capturaMulti = await pdf.projetista(
    montarEstadoProjetista(
      [
        {
          tipo: 'cozinha',
          grupo: 'A',
          resp: {
            temPuxador: 'Sim',
            puxadores: [
              { modelo: 'Roma', cor: 'Fendi' },
              { modelo: 'Madri 150mm', cor: 'Sem cor' },
            ],
          },
        },
      ],
      ['9001']
    )
  )
  sequencia(capturaMulti, [
    'Corrediças',
    'Resposta: —',
    'Puxadores',
    'Resposta: Sim',
    '• Roma — Fendi',
    '• Madri 150mm — Sem cor',
  ])

  const capturaUm = await pdf.projetista(
    montarEstadoProjetista(
      [
        {
          tipo: 'dormitorio_casal',
          grupo: 'B',
          resp: {
            temPuxador: 'Sim',
            puxadores: [{ modelo: 'Zen Cup', cor: 'Gold' }],
          },
        },
      ],
      ['9001']
    )
  )
  sequencia(capturaUm, [
    'Fechamento até o teto',
    'Resposta: —',
    'Puxadores',
    'Resposta: Sim',
    '• Zen Cup — Gold',
  ])
})

test('TP-17 — Ordem preservada e Puxadores antes de Observações do ambiente nos grupos A, B e C', async () => {
  const captura = await pdf.projetista(
    montarEstadoProjetista(
      [
        {
          tipo: 'cozinha',
          grupo: 'A',
          resp: {
            temPuxador: 'Sim',
            puxadores: [{ modelo: 'Roma', cor: 'Fendi' }],
            observacoes: 'Obs ambiente 9001',
          },
        },
        {
          tipo: 'dormitorio_casal',
          grupo: 'B',
          resp: {
            temPuxador: 'Sim',
            puxadores: [{ modelo: 'Berlin', cor: 'Aço' }],
            observacoes: 'Obs ambiente 9001',
          },
        },
        {
          tipo: 'home',
          grupo: 'C',
          resp: {
            temPuxador: 'Sim',
            puxadores: [{ modelo: 'Perfil Cava', cor: 'Alumínio' }],
            observacoes: 'Obs ambiente 9001',
          },
        },
      ],
      ['9001']
    )
  )
  const nomes = ['Cozinha / Área de Serviço', 'Dormitório Casal', 'Home / Sala']

  sequencia(secao(captura, 'Cozinha / Área de Serviço', nomes), [
    'Corrediças',
    'Resposta: —',
    'Puxadores',
    'Resposta: Sim',
    '• Roma — Fendi',
    'Observações do ambiente',
    'Resposta: Obs ambiente 9001',
  ])
  sequencia(secao(captura, 'Dormitório Casal', nomes), [
    'Fechamento até o teto',
    'Resposta: —',
    'Puxadores',
    'Resposta: Sim',
    '• Berlin — Aço',
    'Observações do ambiente',
    'Resposta: Obs ambiente 9001',
  ])
  sequencia(secao(captura, 'Home / Sala', nomes), [
    'Corrediças',
    'Resposta: —',
    'Puxadores',
    'Resposta: Sim',
    '• Perfil Cava — Alumínio',
    'Observações do ambiente',
    'Resposta: Obs ambiente 9001',
  ])
})

test('TC-09 — PDF com Ocultas, Não se aplica e — sem subopção', async () => {
  const captura = await pdf.projetista(
    montarEstadoProjetista(
      [
        { tipo: 'cozinha', grupo: 'A', resp: { corredicas: 'Ocultas' } },
        { tipo: 'dormitorio_casal', grupo: 'B', resp: { corredicas: 'não se aplica' } },
        { tipo: 'home', grupo: 'C', resp: { corredicas: null } },
      ],
      ['9001']
    )
  )
  const nomes = ['Cozinha / Área de Serviço', 'Dormitório Casal', 'Home / Sala']
  sequencia(secao(captura, 'Cozinha / Área de Serviço', nomes), ['Corrediças', 'Resposta: Ocultas'])
  sequencia(secao(captura, 'Dormitório Casal', nomes), ['Corrediças', 'Resposta: Não se aplica'])
  sequencia(secao(captura, 'Home / Sala', nomes), ['Corrediças', 'Resposta: —'])
  ausencia(captura, { contem: 'Extração total' })
  ausencia(captura, { contem: 'Tip-on' })
  ausencia(captura, { contem: 'Extração parcial' })
})

test('TC-10 — PDF com Hafele e Blum nos grupos A, B e C mantendo ordem e observações', async () => {
  const captura = await pdf.projetista(
    montarEstadoProjetista(
      [
        {
          tipo: 'cozinha',
          grupo: 'A',
          resp: {
            corredicas: 'Hafele',
            corredicasExtracao: 'Extração total',
            observacoes: 'Obs ambiente 9001',
          },
        },
        {
          tipo: 'dormitorio_casal',
          grupo: 'B',
          resp: {
            corredicas: 'Hafele',
            corredicasExtracao: 'Tip-on',
            observacoes: 'Obs ambiente 9001',
          },
        },
        {
          tipo: 'home',
          grupo: 'C',
          resp: {
            corredicas: 'Blum',
            corredicasExtracao: 'Extração parcial',
            observacoes: 'Obs ambiente 9001',
          },
        },
      ],
      ['9001']
    )
  )
  const nomes = ['Cozinha / Área de Serviço', 'Dormitório Casal', 'Home / Sala']
  sequencia(secao(captura, 'Cozinha / Área de Serviço', nomes), [
    'Dobradiças',
    'Resposta: —',
    'Corrediças',
    'Resposta: Hafele — Extração total',
    'Puxadores',
    'Resposta: —',
    'Observações do ambiente',
    'Resposta: Obs ambiente 9001',
  ])
  sequencia(secao(captura, 'Dormitório Casal', nomes), [
    'Dobradiças',
    'Resposta: —',
    'Corrediças',
    'Resposta: Hafele — Tip-on',
    'Fechamento até o teto',
    'Resposta: —',
    'Puxadores',
    'Resposta: —',
    'Observações do ambiente',
    'Resposta: Obs ambiente 9001',
  ])
  sequencia(secao(captura, 'Home / Sala', nomes), [
    'Dobradiças',
    'Resposta: —',
    'Corrediças',
    'Resposta: Blum — Extração parcial',
    'Puxadores',
    'Resposta: —',
    'Observações do ambiente',
    'Resposta: Obs ambiente 9001',
  ])
})

test('TC-11 — Compatibilidade de rascunho antigo sem campo corredicasExtracao (PDF)', async () => {
  const estado = montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A', resp: { corredicas: 'Ocultas' } }], ['9001'])
  delete estado.respostasPorAmbiente['cozinha-0'].corredicasExtracao
  const captura = await pdf.projetista(estado)
  sequencia(captura, ['Corrediças', 'Resposta: Ocultas'])
})

test('TC-12 — PDF com Hafele ou Blum sem subopção preenchida exibe só o modelo e não quebra', async () => {
  const captura = await pdf.projetista(
    montarEstadoProjetista(
      [
        { tipo: 'cozinha', grupo: 'A', resp: { corredicas: 'Blum', corredicasExtracao: null } },
        { tipo: 'home', grupo: 'C', resp: { corredicas: 'Hafele', corredicasExtracao: null } },
      ],
      ['9001']
    )
  )
  const nomes = ['Cozinha / Área de Serviço', 'Home / Sala']
  sequencia(secao(captura, 'Cozinha / Área de Serviço', nomes), ['Corrediças', 'Resposta: Blum', 'Puxadores'])
  sequencia(secao(captura, 'Home / Sala', nomes), ['Corrediças', 'Resposta: Hafele', 'Puxadores'])
  ausencia(captura, { contem: 'null' })
  ausencia(captura, { contem: 'undefined' })
})
