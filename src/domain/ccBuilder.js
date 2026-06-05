import {
  TEXTO_CORTINEIRO_NAO_INSTALADO,
  TEXTO_ELETRONICOS_NAO_DEFINIDOS,
  TEXTO_ELETROS_NAO_DEFINIDOS,
  TEXTO_GRANITO_RETIRAR,
  TEXTO_REVESTIMENTO_AUSENTE,
  TEXTO_RODAPE_AUSENTE,
  TEXTO_RODAPE_EXISTENTE,
  TEXTO_TANQUE_RETIRAR,
  TEXTO_TV_PONTO_FORA,
} from './checklistTextos.js'

/**
 * Constrói a lista de CCs e Avisos sem duplicatas.
 * @param {object} state
 * @param {string[]} gatilhosAtivados
 * @returns {Array<{id, tipo, nivel, escopo, textoCompleto, perguntaOrigem}>}
 */
export function construirCCs(state, gatilhosAtivados) {
  const { global, ambientesSelecionados } = state
  const resultado = []

  const tem = (id) => gatilhosAtivados.includes(id)

  const g1_ambientes          = state.global.g1_ambientes || []
  const ambientesSemReboco    = state.global.g2_ambientesSemReboco || []
  const ambientesSemRevestimento = state.global.g3_ambientesSemRevestimento || []
  const g3_ambientesPendentes = state.global.g3_ambientesPendentes || []
  const ambientesSemRevestimentoNaoSuprimidos = ambientesSemRevestimento.filter(
    (id) => !ambientesSemReboco.includes(id)
  )

  for (const instancia of ambientesSelecionados) {
    const { instanceId, formType } = instancia
    const resp = state.respostasPorAmbiente[instanceId] || {}

    if (tem(`ILUMINACAO_EXTERNA_${instanceId}`) && g1_ambientes.includes(instanceId)) {
      resultado.push({
        id: `ILUMINACAO_EXTERNA_${instanceId}`,
        tipo: 'CC',
        nivel: 'MÉDIO',
        escopo: instanceId,
        textoCompleto:
          'CLIENTE CIENTE E DE ACORDO QUE FIAÇÃO ELÉTRICA, INSTALAÇÃO DE ILUMINAÇÕES E SERVIÇOS DE ELETRICISTA É POR SUA RESPONSABILIDADE, PROFISSIONAL DEVE ESTAR LOCAL NO DIA DA MONTAGEM.',
        perguntaOrigem: 'G1',
      })
    }

    if (tem(`REFORM_SEM_REBOCO_${instanceId}`) && ambientesSemReboco.includes(instanceId)) {
      resultado.push({
        id: `REFORM_SEM_REBOCO_${instanceId}`,
        tipo: 'CC',
        nivel: 'ALTO',
        escopo: instanceId,
        textoCompleto:
          'CLIENTE CIENTE E DE ACORDO QUE MEDIÇÃO TÉCNICA DE AMBIENTE FOI REALIZADA COM AMBIENTE EM REFORMA INACABADA E QUE DEVERÁ RESPEITAR A ALÍNEA (I) DA CLÁUSULA TERCEIRA DO CONTRATO DE COMPRA E VENDA.',
        perguntaOrigem: 'G2',
      })
    }

    if (tem(`REFORM_SEM_REVESTIMENTO_${instanceId}`) && ambientesSemRevestimentoNaoSuprimidos.includes(instanceId)) {
      resultado.push({
        id: `REFORM_SEM_REVESTIMENTO_${instanceId}`,
        tipo: 'CC',
        nivel: 'ALTO',
        escopo: instanceId,
        textoCompleto: TEXTO_REVESTIMENTO_AUSENTE,
        perguntaOrigem: 'G3',
      })
    }

    if (tem(`PONTOS_INDEFINIDOS_${instanceId}`) && g3_ambientesPendentes.includes(instanceId)) {
      resultado.push({
        id: `PONTOS_INDEFINIDOS_${instanceId}`,
        tipo: 'CC',
        nivel: 'MÉDIO',
        escopo: instanceId,
        textoCompleto:
          'CLIENTE CIENTE E DE ACORDO QUE DEVERÁ ALTERAR E/OU PROVIDENCIAR PONTOS ELÉTRICOS/HIDRÁULICOS/GÁS ATÉ O DIA DA MONTAGEM, PARA CORRETA ADEQUAÇÃO DO PROJETO.',
        perguntaOrigem: 'G4',
      })
    }

    if (tem(`REBAIXO_${instanceId}`)) {
      const ambienteRebaixo = global.g4_ambientes.find((ambiente) => ambiente.instanceId === instanceId)
      const cm = ambienteRebaixo?.cm ?? '?'
      resultado.push({
        id: `REBAIXO_${instanceId}`,
        tipo: 'CC',
        nivel: 'BAIXO',
        escopo: instanceId,
        textoCompleto: `CLIENTE CIENTE E DE ACORDO QUE DEVERÁ FINALIZAR O REBAIXO DE TETO EM ${cm}CM ATÉ O DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO.`,
        perguntaOrigem: 'G5',
      })
    }

    if (tem(`GRANITO_RETIRAR_${instanceId}`)) {
      resultado.push({
        id: `GRANITO_RETIRAR_${instanceId}`,
        tipo: 'CC',
        nivel: 'MÉDIO',
        escopo: instanceId,
        textoCompleto: TEXTO_GRANITO_RETIRAR,
        perguntaOrigem: 'P1.1',
      })
    }

    if (tem(`TANQUE_RETIRAR_${instanceId}`)) {
      resultado.push({
        id: `TANQUE_RETIRAR_${instanceId}`,
        tipo: 'CC',
        nivel: 'MÉDIO',
        escopo: instanceId,
        textoCompleto: TEXTO_TANQUE_RETIRAR,
        perguntaOrigem: 'P2.1',
      })
    }

    if (tem(`TV_PONTO_${instanceId}`)) {
      resultado.push({
        id: `TV_PONTO_${instanceId}`,
        tipo: 'CC',
        nivel: 'MÉDIO',
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

    if (formType === 'dormitorio' && resp.rodape === true) {
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
