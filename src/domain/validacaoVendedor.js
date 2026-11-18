export const MSG_RESPONDA = 'Responda esta pergunta ou marque "Não se aplica"'
export const MSG_RESPONDA_SIM_NAO = 'Responda sim ou não'

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
  if (grupo === 'A' && resp.tipoBalcao === 'Editados') {
    for (const campo of CAMPOS_SUBPERGUNTAS_BALCAO) {
      if (resp[campo] !== 'Sim' && resp[campo] !== 'Não') {
        erros[campo] = MSG_RESPONDA_SIM_NAO
      }
    }
  }
  return erros
}
