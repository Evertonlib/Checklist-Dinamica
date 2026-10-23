import { assertSemRede } from './auxiliares/travas.js'
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { lerDadosPdf } from '../src/services/importacaoPdf.js'
import { carregarPdf } from './auxiliares/carregar_pdf.js'
import { montarEstadoCliente, montarEstadoProjetista, eletro, MEDIDAS } from './auxiliares/construtores.js'

after(() => assertSemRede())

// Falha alta: sem esbuild ou com empacotamento quebrado, o arquivo inteiro não carrega
const pdf = await carregarPdf()

// --- Entradas fictícias (Spec, seção "Testes"; contratos na série 9xxx) ---

// As quatro partes que o PRD manda guardar: só respostas, sem _meta, score nem CCs
function quatroPartes(estado) {
  return {
    identificacao: estado.identificacao,
    ambientesSelecionados: estado.ambientesSelecionados,
    global: estado.global,
    respostasPorAmbiente: estado.respostasPorAmbiente,
  }
}

function estadoCompleto() {
  return montarEstadoCliente(
    [
      {
        tipo: 'cozinha',
        resp: {
          granito: false,
          tanque: false,
          eletrosDefined: true,
          eletros: [
            eletro('Cooktop', { ...MEDIDAS, modelo: 'Cooktop-9001' }),
            eletro('Forno', { ...MEDIDAS, modelo: 'Forno-9001', link: 'https://exemplo.com/forno-9001' }),
          ],
        },
      },
      {
        tipo: 'dormitorio_casal',
        nome: 'Suíte',
        resp: {
          tv: true,
          tvPontoFinal: false,
          tv_polegadas: '50',
          rodape: false,
          observacoes: 'Atenção: vão de 150mm',
        },
      },
    ],
    // Pelo menos uma resposta "Sim" e um ambiente em lista (CC de iluminação ativado)
    { g1_temIluminacaoExterna: true, g1_ambientes: ['cozinha-0'], g2_temReboco: true, g3_temRevestimento: true },
    { contrato: '9001', telefone: '(00) 90000-9001' }
  )
}

// --- Manipulação de bytes, independente do código do serviço ---

const comoTexto = (bytes) => Buffer.from(bytes).toString('latin1')
const deTexto = (texto) => new Uint8Array(Buffer.from(texto, 'latin1'))
const base64 = (texto) => Buffer.from(texto, 'utf8').toString('base64')
const CAMPO = /\/Keywords \([^)]*\)/

// Troca só o conteúdo da propriedade de palavras-chave, mantendo o resto do arquivo
function comPalavrasChave(bytes, valor) {
  const texto = comoTexto(bytes)
  assert.ok(CAMPO.test(texto), 'o PDF de partida precisa ter a propriedade de palavras-chave')
  return deTexto(texto.replace(CAMPO, `/Keywords (${valor})`))
}

function semDados(bytes) {
  let resultado
  assert.doesNotThrow(() => {
    resultado = lerDadosPdf(bytes)
  })
  assert.equal(resultado, null)
}

// ---------------------------------------------------------------------------
// Gravação e ida e volta
// ---------------------------------------------------------------------------

test('T1 — ida e volta completa: PDF gerado devolve as mesmas respostas, com acentos', async () => {
  const estado = estadoCompleto()
  const captura = await pdf.cliente(estado)

  const lido = lerDadosPdf(captura.bytes)

  assert.deepEqual(lido, quatroPartes(estado))
  // Conferências por extenso, vindas do critério do PRD
  assert.equal(lido.identificacao.contrato, '9001')
  const cozinha = lido.respostasPorAmbiente['cozinha-0']
  assert.equal(cozinha.eletros.length, 2)
  assert.deepEqual(
    cozinha.eletros.map((e) => e.tipo),
    ['Cooktop', 'Forno']
  )
  const dormitorio = lido.respostasPorAmbiente['dormitorio_casal-0']
  assert.equal(dormitorio.tv_polegadas, '50')
  assert.equal(dormitorio.observacoes, 'Atenção: vão de 150mm')
})

test('T2 — nome do arquivo e conteúdo impresso continuam iguais; dados só nas propriedades', async () => {
  const captura = await pdf.cliente(estadoCompleto())

  assert.deepEqual(captura.saves, ['Checklist_Cliente_9001_2026-10-19.pdf'])

  const valor = captura.propriedades.keywords
  assert.ok(typeof valor === 'string' && valor.startsWith('V1:'), 'os dados escondidos ficam em palavras-chave')

  // Tudo o que é impresso (textos, tabelas, links) não pode conter a marca nem o conteúdo escondido
  const impresso = JSON.stringify([captura.textos, captura.tabelas, captura.links])
  assert.equal(impresso.includes('V1:'), false)
  assert.equal(impresso.includes(valor), false)
  assert.equal(impresso.includes(valor.slice(3, 43)), false)
})

test('T3 — PDF corrigido também pode ser importado: devolve o estado corrigido, não o original', async () => {
  const original = estadoCompleto()
  const corrigido = estadoCompleto()
  corrigido.respostasPorAmbiente['cozinha-0'].eletros.pop() // um eletro removido
  corrigido.identificacao.telefone = '(00) 90000-9002'

  const lido = lerDadosPdf((await pdf.cliente(corrigido)).bytes)

  assert.deepEqual(lido, quatroPartes(corrigido))
  assert.equal(lido.respostasPorAmbiente['cozinha-0'].eletros.length, 1)
  assert.equal(lido.identificacao.telefone, '(00) 90000-9002')
  assert.notEqual(lido.identificacao.telefone, original.identificacao.telefone)
})

// ---------------------------------------------------------------------------
// Arquivos sem dados ou inválidos: sempre "sem dados", nunca exceção
// ---------------------------------------------------------------------------

test('T4 — PDF sem os dados escondidos (gerado antes desta versão) não tem dados', () => {
  const antigo = deTexto(
    '%PDF-1.3\n1 0 obj\n<< /Producer (jsPDF 2.5.2) /CreationDate (D:20260101000000) >>\nendobj\n' +
      'Checklist do cliente CLIENTE FICTICIO TESTE contrato 9001\n%%EOF\n'
  )
  semDados(antigo)
})

test('T5 — PDF do Projetista ou de outro sistema não tem dados', async () => {
  // (a) PDF do Projetista gerado pelo app, contrato 9002
  const projetista = await pdf.projetista(montarEstadoProjetista([{ tipo: 'cozinha', grupo: 'A' }], ['9002']))
  assert.ok(projetista.bytes.length > 0)
  semDados(projetista.bytes)

  // (b) PDF mínimo de outra origem
  semDados(deTexto('%PDF-1.4\n1 0 obj\n<< /Title (BOLETO FICTICIO 9003) >>\nendobj\nBOLETO FICTICIO 9003\n%%EOF\n'))
})

test('T6 — PDF reimpresso ou fotografado perde os dados', async () => {
  const { bytes } = await pdf.cliente(estadoCompleto())

  // (a) mesmo PDF, com o campo de palavras-chave renomeado ("salvar como PDF" de novo)
  const reimpresso = deTexto(comoTexto(bytes).replace('/Keywords (V1:', '/Keyworxx (V1:'))
  assert.notEqual(comoTexto(reimpresso), comoTexto(bytes))
  semDados(reimpresso)

  // (b) cabeçalho de imagem JPEG fictício
  semDados(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]))
})

test('T7 — arquivo inválido, truncado ou vazio não tem dados e não dá erro', async () => {
  const { bytes } = await pdf.cliente(estadoCompleto())

  // (a) texto comum que não é PDF
  semDados(deTexto('Isto é só um texto comum, renomeado para .pdf'))

  // (b) o PDF cortado no meio do conteúdo escondido
  const posicao = comoTexto(bytes).indexOf('/Keywords (V1:')
  assert.ok(posicao > 0)
  semDados(bytes.slice(0, posicao + 60))

  // (c) arquivo vazio
  semDados(new Uint8Array(0))
})

test('T8 — dados de versão desconhecida ou estrutura inválida não têm dados', async () => {
  const { bytes, propriedades } = await pdf.cliente(estadoCompleto())
  const valido = propriedades.keywords.slice(3) // texto Base64 sem a marca

  // (a) marca V2 no lugar de V1, conteúdo válido
  semDados(comPalavrasChave(bytes, `V2:${valido}`))
  // (b) marca V1, mas o Base64 decodifica para algo que não é JSON
  semDados(comPalavrasChave(bytes, `V1:${base64('isto nao e json')}`))
  // (c) marca V1, JSON válido que é uma lista em vez de objeto
  semDados(comPalavrasChave(bytes, `V1:${base64(JSON.stringify([1, 2, 3]))}`))
  // (d) objeto sem a chave identificacao
  semDados(
    comPalavrasChave(
      bytes,
      `V1:${base64(JSON.stringify({ ambientesSelecionados: [], global: {}, respostasPorAmbiente: {} }))}`
    )
  )
  // (e) ambientesSelecionados que não é lista
  semDados(
    comPalavrasChave(
      bytes,
      `V1:${base64(JSON.stringify({ identificacao: {}, ambientesSelecionados: {}, global: {}, respostasPorAmbiente: {} }))}`
    )
  )
})

// ---------------------------------------------------------------------------
// Formato para outros programas e tamanho
// ---------------------------------------------------------------------------

test('T9 — formato legível por outros programas: marca V1 e só as quatro partes de respostas', async () => {
  const { propriedades } = await pdf.cliente(estadoCompleto())
  const valor = propriedades.keywords

  // Decodificação feita aqui, sem usar o serviço: separa na primeira ":"
  const corte = valor.indexOf(':')
  assert.equal(valor.slice(0, corte), 'V1')
  const texto = valor.slice(corte + 1)
  assert.match(texto, /^[A-Za-z0-9+/]+=*$/)

  const dados = JSON.parse(Buffer.from(texto, 'base64').toString('utf8'))
  assert.deepEqual(Object.keys(dados).sort(), [
    'ambientesSelecionados',
    'global',
    'identificacao',
    'respostasPorAmbiente',
  ])
  assert.equal(dados.respostasPorAmbiente['dormitorio_casal-0'].observacoes, 'Atenção: vão de 150mm')
})

test('T10 — tamanho com o maior caso real: 17 ambientes, 9 eletros, até 32.000 caracteres', async (t) => {
  const linkFicticio = (n) => `https://exemplo.com/produto-${n}`
  const obs30 = 'Atenção: registro à esquerda.'
  const obs110 =
    'Atenção: a bancada da área gourmet fica sob a janela; o vão é de 150mm e a coifa deve respeitar a altura do cliente.'
  const obs65 = 'Atenção: ponto elétrico da copa fica atrás da geladeira antiga.'
  const semEletronicos = { eletronicos: false, eletronicosList: [] }

  const estado = montarEstadoCliente(
    [
      {
        tipo: 'cozinha',
        indice: 0,
        nome: 'Cozinha',
        resp: {
          eletrosDefined: true,
          eletros: [
            eletro('Cooktop', { ...MEDIDAS, modelo: 'Cooktop-9004', link: linkFicticio(1) }),
            eletro('Forno embutido', { ...MEDIDAS, modelo: 'Forno-9004', link: linkFicticio(2) }),
            eletro('Microondas embutido', { ...MEDIDAS, modelo: 'Micro-9004', link: linkFicticio(3) }),
            eletro('Lava-roupa frontal', { ...MEDIDAS, modelo: 'LavaRoupa-9004' }),
            eletro('Refrigerador duplex', { ...MEDIDAS, modelo: 'Refri-9004' }),
          ],
        },
      },
      { tipo: 'cozinha', indice: 1, nome: 'Lavanderia', resp: { observacoes: obs30 } },
      { tipo: 'dormitorio_casal', resp: { rodape: false } },
      { tipo: 'dormitorio_solteiro', indice: 0, resp: { rodape: false } },
      { tipo: 'dormitorio_solteiro', indice: 1, resp: { rodape: false } },
      { tipo: 'dormitorio_solteiro', indice: 2, resp: { rodape: false } },
      { tipo: 'banheiro', indice: 0 },
      { tipo: 'banheiro', indice: 1 },
      { tipo: 'banheiro', indice: 2 },
      { tipo: 'banheiro', indice: 3 },
      { tipo: 'home', indice: 0, nome: 'Living', resp: semEletronicos },
      { tipo: 'home', indice: 1, nome: 'Antesala', resp: semEletronicos },
      { tipo: 'office', nome: 'Office', resp: semEletronicos },
      {
        tipo: 'varanda',
        resp: {
          eletrosDefined: true,
          eletros: [
            eletro('Churrasqueira elétrica', { ...MEDIDAS, modelo: 'Churras-9004' }),
            eletro('Frigobar', { ...MEDIDAS, modelo: 'Frigobar-9004', link: linkFicticio(4) }),
          ],
          observacoes: obs110,
        },
      },
      { tipo: 'outros', indice: 0, nome: 'Despensa' },
      {
        tipo: 'outros',
        indice: 1,
        nome: 'Copa',
        resp: { eletrosDefined: true, eletros: [eletro('Cafeteira embutida', { ...MEDIDAS, modelo: 'Cafe-9004' })], observacoes: obs65 },
      },
      {
        tipo: 'outros',
        indice: 2,
        nome: 'Apoio academia',
        resp: { eletrosDefined: true, eletros: [eletro('Bebedouro', { ...MEDIDAS, modelo: 'Bebedouro-9004' })] },
      },
    ],
    // Vários CCs ativados: iluminação por conta do cliente e rodapé pós-montagem (nos dormitórios)
    { g1_temIluminacaoExterna: true, g1_ambientes: ['cozinha-0', 'cozinha-1'], g2_temReboco: true, g3_temRevestimento: true },
    { contrato: '9004', telefone: '(00) 90000-9004' }
  )
  assert.equal(estado.ambientesSelecionados.length, 17)

  const { bytes, propriedades } = await pdf.cliente(estado)

  // Registra o tamanho medido mesmo quando o teste passa (dá noção de folga)
  const tamanho = propriedades.keywords.length
  t.diagnostic(`T10 — tamanho medido do valor gravado: ${tamanho} caracteres (limite 32000)`)

  assert.ok(tamanho <= 32000, `valor gravado com ${tamanho} caracteres, acima do limite de 32000: registrar em Desvios`)
  assert.deepEqual(lerDadosPdf(bytes), quatroPartes(estado))
})
