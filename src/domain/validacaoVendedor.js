import { modeloExigeExtracao, extracaoValidaParaModelo } from './corredicasVendedor.js'

export const MSG_RESPONDA = 'Responda esta pergunta ou marque "Não se aplica"'
export const MSG_RESPONDA_SIM_NAO = 'Responda sim ou não'
export const MSG_INFORME_MODELO = 'Informe o modelo'
export const MSG_INFORME_COR = 'Informe a cor'
export const MSG_ADICIONE_PUXADOR = 'Adicione pelo menos um puxador'
export const MSG_SELECIONE_EXTRACAO = 'Selecione uma opção'

const NAO_SE_APLICA = 'não se aplica'
const CAMPOS_ALTURA = ['alturaBalcao_mm', 'alturaArmario_mm']

const CAMPOS_SUBPERGUNTAS_BALCAO = ['balcaoAlturaForaPadrao', 'balcaoProfundidadeForaPadrao']

const CAMPOS_OBRIGATORIOS_POR_GRUPO = {
  A: ['alturaBalcao_mm', 'alturaArmario_mm', 'tipoBalcao', 'fechamentoTeto', 'caixaria', 'dobradicas', 'corredicas'],
  B: ['caixaria', 'dobradicas', 'corredicas', 'fechamentoTeto'],
  C: ['caixaria', 'dobradicas', 'corredicas'],
}

function respostaValida(campo, valor) {
  if (valor === NAO_SE_APLICA) return true
  if (CAMPOS_ALTURA.includes(campo)) return typeof valor === 'number' && valor > 0
  return valor !== null && valor !== undefined
}

/**
 * Valida as respostas obrigatórias de um ambiente do Projetista.
 * @param {'A' | 'B' | 'C'} grupo
 * @param {Record<string, unknown>} [resp]
 * @returns {Record<string, string>}
 */
export function validarRespostasGrupo(grupo, resp = {}) {
  const erros = {}
  for (const campo of CAMPOS_OBRIGATORIOS_POR_GRUPO[grupo]) {
    if (!respostaValida(campo, resp[campo])) {
      erros[campo] = MSG_RESPONDA
    }
  }
  if (
    modeloExigeExtracao(resp.corredicas) &&
    !extracaoValidaParaModelo(resp.corredicas, resp.corredicasExtracao)
  ) {
    erros.corredicasExtracao = MSG_SELECIONE_EXTRACAO
  }
  if (grupo === 'A' && resp.tipoBalcao === 'Editados') {
    for (const campo of CAMPOS_SUBPERGUNTAS_BALCAO) {
      if (resp[campo] !== 'Sim' && resp[campo] !== 'Não') {
        erros[campo] = MSG_RESPONDA_SIM_NAO
      }
    }
  }
  if (resp.temPuxador !== 'Sim' && resp.temPuxador !== 'Não') {
    erros.temPuxador = MSG_RESPONDA_SIM_NAO
  } else if (resp.temPuxador === 'Sim') {
    const lista = Array.isArray(resp.puxadores) ? resp.puxadores : []
    if (lista.length === 0) {
      erros.puxadores = MSG_ADICIONE_PUXADOR
    } else {
      lista.forEach((item, index) => {
        const modelo = typeof item?.modelo === 'string' ? item.modelo.trim() : ''
        const cor = typeof item?.cor === 'string' ? item.cor.trim() : ''
        if (!modelo) erros[`puxador_${index}_modelo`] = MSG_INFORME_MODELO
        if (!cor) erros[`puxador_${index}_cor`] = MSG_INFORME_COR
      })
    }
  }
  return erros
}
