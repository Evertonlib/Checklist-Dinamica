// Rodada 2 (card #110, ordem dos eletros). Gera os PDFs chamando a gerarPdf REAL de cada variante.
// Cada eletro tem modelo com etiqueta unica (C-xxx = Cozinha, O-xxx = Outros) para o analisar.py
// ler a ordem das linhas e casar cada link com a linha. Tambem grava se o estado foi alterado.
// Uso: node gerar.mjs <variante>
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const variante = process.argv[2]
const raiz = path.resolve(process.cwd())
const mod = await import(pathToFileURL(path.join(raiz, variante, 'bundle.cjs')).href)
const { gerarPdf, estadoInicial, defaultsPorFormType } = mod

const clone = (o) => JSON.parse(JSON.stringify(o))

// eletro no formato que o FormCozinha/FormOutros grava (addEletro)
const el = (tag, tipo, subtipo = '', extra = {}) => ({
  tipo, subtipo, descricao: '', modelo: tag, largura_cm: '60', altura_cm: '80', profundidade_cm: '55',
  link: '', ...extra,
})
const url = (tag) => `https://exemplo.test/${tag.toLowerCase()}`

function estadoBase() {
  const s = clone(estadoInicial)
  s.identificacao = { nome: 'CLIENTE TESTE', contrato: '999999', cep: '', logradouro: 'Rua Teste', numero: '1', complemento: '', bairro: 'Centro', cidade: 'Sao Paulo', uf: 'SP', telefone: '11999999999' }
  s.ambientesSelecionados = [
    { instanceId: 'cozinha-1', id: 'cozinha', label: 'Cozinha / Área de Serviço', formType: 'cozinha', nome: '' },
    { instanceId: 'outros-1', id: 'outros', label: 'Outros', formType: 'outros', nome: '' },
  ]
  s.respostasPorAmbiente = {
    'cozinha-1': { ...clone(defaultsPorFormType.cozinha), eletrosDefined: false },
    'outros-1': { eletrosDefined: false, eletros: [], eletronicos: false, eletronicosList: [], observacoes: '' },
  }
  s.global.g1_temIluminacaoExterna = false
  s.global.g2_temReboco = true
  s.global.g3_temRevestimento = true
  s.global.g3_pontosNaPosicaoFinal = true
  s.global.g4_temRebaixo = false; s.global.g4_rebaixoOpcao = 'nao'
  return s
}

const comEletros = (s, id, eletros) => {
  s.respostasPorAmbiente[id].eletrosDefined = true
  s.respostasPorAmbiente[id].eletros = eletros
}

const cenarios = {
  // exemplo do "Pronto quando" do card, na Cozinha; links so em Lava-louca e Depurador
  c1_cozinha_card: (s) => comEletros(s, 'cozinha-1', [
    el('C-LAVA', 'Lava-louça', 'Piso', { link: url('C-LAVA') }),
    el('C-DEPU', 'Depurador', 'Normal', { link: url('C-DEPU') }),
    el('C-REFR', 'Refrigerador', 'Duplex'),
    el('C-COOK', 'Cooktop'),
  ]),
  // todos os tipos no ambiente "Outros", em ordem embaralhada; Forno Embutido; links alternados
  c2_outros_todos: (s) => comEletros(s, 'outros-1', [
    el('O-OUTR', 'Outros', '', { descricao: 'Adega', link: url('O-OUTR') }),
    el('O-COIF', 'Coifa', 'Parede'),
    el('O-FORN', 'Forno', 'Embutido', { link: url('O-FORN') }),
    el('O-MICR', 'Microondas', 'Normal'),
    el('O-FOGA', 'Fogão', 'Piso', { link: url('O-FOGA') }),
    el('O-DEPU', 'Depurador', 'Embutido', { link: url('O-DEPU') }),
    el('O-REFR', 'Refrigerador', 'Inverse'),
    el('O-COOK', 'Cooktop'),
    el('O-LAVR', 'Lava-roupa', 'Abertura Frontal', { link: url('O-LAVR') }),
  ]),
  // controle: ja na ordem de prioridade, nos dois ambientes ao mesmo tempo
  c3_controle_em_ordem: (s) => {
    comEletros(s, 'cozinha-1', [el('C-COOK', 'Cooktop'), el('C-FOGA', 'Fogão', 'Piso'), el('C-LAVA', 'Lava-louça', 'Piso', { link: url('C-LAVA') })])
    comEletros(s, 'outros-1', [el('O-REFR', 'Refrigerador', 'Duplex', { link: url('O-REFR') }), el('O-COIF', 'Coifa', 'Ilha')])
  },
  // controle: sem eletros (eletrosDefined false nos dois)
  c4_controle_sem_eletros: () => {},
  // extra (o card nao define): dois do mesmo tipo prioritario
  c5_extra_mesmo_tipo: (s) => comEletros(s, 'cozinha-1', [
    el('C-LAVR', 'Lava-roupa', 'Abertura Superior'),
    el('C-FOR1', 'Forno', 'Embutido', { link: url('C-FOR1') }),
    el('C-FOR2', 'Forno', 'Normal'),
  ]),
}

for (const [nome, ajusta] of Object.entries(cenarios)) {
  const saida = path.join(raiz, 'out', variante, nome)
  fs.rmSync(saida, { recursive: true, force: true })
  fs.mkdirSync(saida, { recursive: true })
  process.chdir(saida)
  const estado = estadoBase()
  ajusta(estado)
  const antes = JSON.stringify(estado)
  try {
    await gerarPdf(estado)
    const intacto = JSON.stringify(estado) === antes
    fs.writeFileSync('estado.txt', intacto ? 'intacto' : 'ALTERADO')
    console.log(`${variante}/${nome}: ok, estado ${intacto ? 'intacto' : 'ALTERADO'}`)
  } catch (e) {
    console.log(`${variante}/${nome}: ERRO ${e.message}`)
  }
  process.chdir(raiz)
}
