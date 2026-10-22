// Montagem das entradas dos testes (Spec, seção 4.6). Todo estado parte do estado inicial completo,
// copiado por valor a cada chamada: nenhum teste muta um estado compartilhado.
import { estadoInicial, defaultsPorFormType } from '../../src/domain/schema.js'
import { estadoInicialVendedor, defaultsPorGrupo } from '../../src/domain/schemaVendedor.js'

// Escrita por extenso, de propósito (regra 2 do PRD): não vem do catálogo do código.
const ROTULOS = {
  cozinha: { label: 'Cozinha / Área de Serviço', formType: 'cozinha' },
  dormitorio_casal: { label: 'Dormitório Casal', formType: 'dormitorio' },
  dormitorio_solteiro: { label: 'Dormitório Solteiro', formType: 'dormitorio' },
  banheiro: { label: 'Banheiro / W.C.', formType: 'banheiro' },
  home: { label: 'Home / Sala', formType: 'home' },
  office: { label: 'Office', formType: 'home' },
  varanda: { label: 'Varanda / Área Gourmet', formType: 'cozinha' },
  outros: { label: 'Outros', formType: 'outros' },
}

export const IDENTIFICACAO_FICTICIA = {
  nome: 'CLIENTE FICTICIO TESTE',
  contrato: 'TA9001',
  cep: '',
  logradouro: 'Rua Ficticia',
  numero: '100',
  complemento: '',
  bairro: 'Bairro Ficticio',
  cidade: 'Cidade Ficticia',
  uf: 'SP',
  telefone: '',
}

function rotulo(tipo) {
  const item = ROTULOS[tipo]
  if (!item) throw new Error(`Tipo de ambiente desconhecido nos construtores: ${tipo}`)
  return item
}

export function ambienteCliente(tipo, indice = 0, nome = '') {
  const { label, formType } = rotulo(tipo)
  return { instanceId: `${tipo}-${indice}`, tipo, formType, label, nome }
}

export function montarEstadoCliente(lista, global = {}, identificacao = {}) {
  const estado = structuredClone(estadoInicial)
  for (const { tipo, indice = 0, nome = '', resp = {} } of lista) {
    const instancia = ambienteCliente(tipo, indice, nome)
    estado.ambientesSelecionados.push(instancia)
    estado.respostasPorAmbiente[instancia.instanceId] = {
      ...structuredClone(defaultsPorFormType[instancia.formType]),
      ...structuredClone(resp),
    }
  }
  estado.global = { ...estado.global, ...structuredClone(global) }
  estado.identificacao = { ...IDENTIFICACAO_FICTICIA, ...identificacao }
  return estado
}

export function eletro(tipo, campos = {}) {
  return {
    tipo,
    subtipo: '',
    descricao: '',
    modelo: '',
    largura_cm: '',
    altura_cm: '',
    profundidade_cm: '',
    link: '',
    ...campos,
  }
}

export function eletronico(tipo, campos = {}) {
  return { ...eletro(tipo), polegadas: '', ...campos }
}

// "Com medidas preenchidas" (Spec, seção 6)
export const MEDIDAS = { largura_cm: '60', altura_cm: '10', profundidade_cm: '50' }

export function tv55() {
  return eletronico('TV', { polegadas: '55', largura_cm: '120', altura_cm: '70', profundidade_cm: '8' })
}

export function ambienteProjetista(tipo, indice = 0, nome = '') {
  const { label } = rotulo(tipo)
  return { instanceId: `${tipo}-${indice}`, tipo, label, nome }
}

// O grupo vem explícito do caso: o construtor não depende de obterGrupo (que T-V01/T-V02 testam).
export function montarEstadoProjetista(lista, contratos = ['TA9001'], nome = 'CLIENTE FICTICIO TESTE') {
  const estado = structuredClone(estadoInicialVendedor)
  for (const { tipo, grupo, indice = 0, nome: nomeAmbiente = '', resp = {} } of lista) {
    const instancia = ambienteProjetista(tipo, indice, nomeAmbiente)
    estado.ambientesSelecionados.push(instancia)
    estado.respostasPorAmbiente[instancia.instanceId] = {
      ...structuredClone(defaultsPorGrupo[grupo]),
      ...structuredClone(resp),
    }
  }
  estado.identificacao = { contratos: [...contratos], nome }
  return estado
}
