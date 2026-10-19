// Gera os PDFs dos cenarios chamando a gerarPdf REAL de cada variante (base, real, jules).
// Uso: node gerar.mjs <variante>
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const variante = process.argv[2]
const raiz = path.resolve(process.cwd())
const mod = await import(pathToFileURL(path.join(raiz, variante, 'bundle.cjs')).href)
const { gerarPdf, estadoInicial, defaultsPorFormType } = mod

const clone = (o) => JSON.parse(JSON.stringify(o))

function estadoBase() {
  const s = clone(estadoInicial)
  s.identificacao = { nome: 'CLIENTE TESTE', contrato: '999999', cep: '', logradouro: 'Rua Teste', numero: '1', complemento: '', bairro: 'Centro', cidade: 'Sao Paulo', uf: 'SP', telefone: '11999999999' }
  s.ambientesSelecionados = [
    { instanceId: 'cozinha-1', id: 'cozinha', label: 'Cozinha / Área de Serviço', formType: 'cozinha', nome: '' },
    { instanceId: 'dormitorio_casal-1', id: 'dormitorio_casal', label: 'Dormitório Casal', formType: 'dormitorio', nome: '' },
  ]
  s.respostasPorAmbiente = {
    'cozinha-1': clone(defaultsPorFormType.cozinha),
    'dormitorio_casal-1': clone(defaultsPorFormType.dormitorio),
  }
  s.global.g2_temReboco = true
  s.global.g3_temRevestimento = true
  s.global.g3_pontosNaPosicaoFinal = true
  return s
}

const cenarios = {
  c1_nao_nao: (s) => {
    s.global.g1_temIluminacaoExterna = false
    s.global.g4_temRebaixo = false; s.global.g4_rebaixoOpcao = 'nao'
  },
  c2_sim_so_cozinha: (s) => {
    s.global.g1_temIluminacaoExterna = true; s.global.g1_ambientes = ['cozinha-1']
    s.global.g4_temRebaixo = true; s.global.g4_rebaixoOpcao = 'sim'
    s.global.g4_ambientes = [{ instanceId: 'cozinha-1', cm: 10 }]
  },
  c3_ja_rebaixado: (s) => {
    s.global.g1_temIluminacaoExterna = false
    s.global.g4_temRebaixo = false; s.global.g4_rebaixoOpcao = 'ja_rebaixado'
  },
  c4_controle_nulos: () => {},
  // extra (nao vem do card): rebaixo "Sim" sem o campo cm preenchido
  c5_extra_cm_ausente: (s) => {
    s.global.g1_temIluminacaoExterna = false
    s.global.g4_temRebaixo = true; s.global.g4_rebaixoOpcao = 'sim'
    s.global.g4_ambientes = [{ instanceId: 'cozinha-1' }]
  },
}

for (const [nome, ajusta] of Object.entries(cenarios)) {
  const saida = path.join(raiz, 'out', variante, nome)
  fs.rmSync(saida, { recursive: true, force: true })
  fs.mkdirSync(saida, { recursive: true })
  process.chdir(saida)
  const estado = estadoBase()
  ajusta(estado)
  try {
    await gerarPdf(estado)
    console.log(`${variante}/${nome}: ok -> ${fs.readdirSync(saida).join(',')}`)
  } catch (e) {
    console.log(`${variante}/${nome}: ERRO ${e.message}`)
  }
  process.chdir(raiz)
}
