import {
  TEXTO_CORTINEIRO_NAO_INSTALADO,
  TEXTO_ELETRONICOS_NAO_DEFINIDOS,
  TEXTO_ELETROS_NAO_DEFINIDOS,
  TEXTO_GRANITO_RETIRAR,
  TEXTO_RODAPE_AUSENTE,
  TEXTO_RODAPE_EXISTENTE,
  TEXTO_TANQUE_RETIRAR,
  TEXTO_TV_PONTO_FORA,
} from './checklistTextos.js'

/**
 * ConstrÃ³i a lista de CCs e Avisos sem duplicatas.
 * @param {object} state
 * @param {string[]} gatilhosAtivados
 * @returns {Array<{id, tipo, nivel, escopo, textoCompleto, perguntaOrigem}>}
 */
export function construirCCs(state, gatilhosAtivados) {
  const { global, ambientesSelecionados } = state
  const resultado = []

  const tem = (id) => gatilhosAtivados.includes(id)
  const suprimirRevestimento = tem('REFORM_SEM_REBOCO')

  if (tem('REFORM_SEM_REBOCO')) {
    resultado.push({
      id: 'REFORM_SEM_REBOCO',
      tipo: 'CC',
      nivel: 'ALTO',
      escopo: 'Global',
      textoCompleto:
        'CLIENTE CIENTE E DE ACORDO QUE MEDIÃ‡ÃƒO TÃ‰CNICA DE AMBIENTE FOI REALIZADA COM AMBIENTE EM REFORMA INACABADA E QUE DEVERÃ RESPEITAR A ALÃNEA (I) DA CLÃUSULA TERCEIRA DO CONTRATO DE COMPRA E VENDA.',
      perguntaOrigem: 'G2.1',
    })
  }

  if (!suprimirRevestimento && tem('REFORM_SEM_REVESTIMENTO')) {
    resultado.push({
      id: 'REFORM_SEM_REVESTIMENTO',
      tipo: 'CC',
      nivel: 'ALTO',
      escopo: 'Global',
      textoCompleto:
        'CLIENTE CIENTE E DE ACORDO QUE MEDIÃ‡ÃƒO TÃ‰CNICA DE AMBIENTE FOI REALIZADA COM AMBIENTE EM REFORMA INACABADA E QUE DEVERÃ RESPEITAR A ALÃNEA (I) DA CLÃUSULA TERCEIRA DO CONTRATO DE COMPRA E VENDA.',
      perguntaOrigem: 'G2.2',
    })
  }

  if (tem('ILUMINACAO_EXTERNA')) {
    resultado.push({
      id: 'ILUMINACAO_EXTERNA',
      tipo: 'CC',
      nivel: 'MÃ‰DIO',
      escopo: 'Global',
      textoCompleto:
        'CLIENTE CIENTE E DE ACORDO QUE FIAÃ‡ÃƒO ELÃ‰TRICA, INSTALAÃ‡ÃƒO DE ILUMINAÃ‡Ã•ES E SERVIÃ‡OS DE ELETRICISTA Ã‰ POR SUA RESPONSABILIDADE, PROFISSIONAL DEVE ESTAR LOCAL NO DIA DA MONTAGEM.',
      perguntaOrigem: 'G1',
    })
  }

  if (tem('PONTOS_INDEFINIDOS')) {
    resultado.push({
      id: 'PONTOS_INDEFINIDOS',
      tipo: 'CC',
      nivel: 'MÃ‰DIO',
      escopo: 'Global',
      textoCompleto:
        'CLIENTE CIENTE E DE ACORDO QUE DEVERÃ ALTERAR E/OU PROVIDENCIAR PONTOS ELÃ‰TRICOS/HIDRÃULICOS/GÃS ATÃ‰ O DIA DA MONTAGEM, PARA CORRETA ADEQUAÃ‡ÃƒO DO PROJETO.',
      perguntaOrigem: 'G3',
    })
  }

  for (const instancia of ambientesSelecionados) {
    const { instanceId, formType } = instancia
    const resp = state.respostasPorAmbiente[instanceId] || {}

    if (tem(`REBAIXO_${instanceId}`)) {
      const ambienteRebaixo = global.g4_ambientes.find((ambiente) => ambiente.instanceId === instanceId)
      const cm = ambienteRebaixo?.cm ?? '?'
      resultado.push({
        id: `REBAIXO_${instanceId}`,
        tipo: 'CC',
        nivel: 'BAIXO',
        escopo: instanceId,
        textoCompleto: `CLIENTE CIENTE E DE ACORDO QUE DEVERÃ FINALIZAR O REBAIXO DE TETO EM ${cm}CM ATÃ‰ O DIA DA MONTAGEM PARA CORRETA ADEQUAÃ‡ÃƒO DO PROJETO.`,
        perguntaOrigem: 'G4',
      })
    }

    if (tem(`GRANITO_RETIRAR_${instanceId}`)) {
      resultado.push({
        id: `GRANITO_RETIRAR_${instanceId}`,
        tipo: 'CC',
        nivel: 'MÃ‰DIO',
        escopo: instanceId,
        textoCompleto: TEXTO_GRANITO_RETIRAR,
        perguntaOrigem: 'P1.1',
      })
    }

    if (tem(`TANQUE_RETIRAR_${instanceId}`)) {
      resultado.push({
        id: `TANQUE_RETIRAR_${instanceId}`,
        tipo: 'CC',
        nivel: 'MÃ‰DIO',
        escopo: instanceId,
        textoCompleto: TEXTO_TANQUE_RETIRAR,
        perguntaOrigem: 'P2.1',
      })
    }

    if (tem(`TV_PONTO_${instanceId}`)) {
      resultado.push({
        id: `TV_PONTO_${instanceId}`,
        tipo: 'CC',
        nivel: 'MÃ‰DIO',
        escopo: instanceId,
        textoCompleto: TEXTO_TV_PONTO_FORA,
        perguntaOrigem: 'P2.1',
      })
    }

    if (tem(`ELETROS_NAODEF_${instanceId}`)) {
      resultado.push({
        id: `ELETROS_NAODEF_${instanceId}`,
        tipo: 'CC',
        nivel: 'BAIXO',
        escopo: instanceId,
        textoCompleto: TEXTO_ELETROS_NAO_DEFINIDOS,
        perguntaOrigem: 'P3',
      })
    }

    if (tem(`ELETRONICOS_NAODEF_${instanceId}`)) {
      resultado.push({
        id: `ELETRONICOS_NAODEF_${instanceId}`,
        tipo: 'CC',
        nivel: 'BAIXO',
        escopo: instanceId,
        textoCompleto: TEXTO_ELETRONICOS_NAO_DEFINIDOS,
        perguntaOrigem: 'P1',
      })
    }

    if (tem(`RODAPE_AUSENTE_${instanceId}`)) {
      resultado.push({
        id: `RODAPE_AUSENTE_${instanceId}`,
        tipo: 'CC',
        nivel: 'BAIXO',
        escopo: instanceId,
        textoCompleto: TEXTO_RODAPE_AUSENTE,
        perguntaOrigem: 'P4',
      })
    }

    if (['dormitorio', 'home', 'outros'].includes(formType) && resp.rodape === true) {
      resultado.push({
        id: `RODAPE_EXISTENTE_${instanceId}`,
        tipo: 'AVISO',
        nivel: null,
        escopo: instanceId,
        textoCompleto: TEXTO_RODAPE_EXISTENTE,
        perguntaOrigem: 'P4',
      })
    }

    if (tem(`CORTINEIRO_NAOINSTALADO_${instanceId}`)) {
      resultado.push({
        id: `CORTINEIRO_NAOINSTALADO_${instanceId}`,
        tipo: 'AVISO',
        nivel: 'BAIXO',
        escopo: instanceId,
        textoCompleto: TEXTO_CORTINEIRO_NAO_INSTALADO,
        perguntaOrigem: 'P3.1',
      })
    }
  }

  return resultado
}
