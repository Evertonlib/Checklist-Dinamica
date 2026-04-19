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

  // Regra de supressão G2.1/G2.2
  const suprimirRevestimento = tem('REFORM_SEM_REBOCO')

  // --- Globais ---
  if (tem('REFORM_SEM_REBOCO')) {
    resultado.push({
      id: 'REFORM_SEM_REBOCO',
      tipo: 'CC',
      nivel: 'ALTO',
      escopo: 'Global',
      textoCompleto:
        'CLIENTE CIENTE E DE ACORDO QUE MEDIÇÃO TÉCNICA DE AMBIENTE FOI REALIZADA COM AMBIENTE EM REFORMA INACABADA E QUE DEVERÁ RESPEITAR A ALÍNEA (I) DA CLÁUSULA TERCEIRA DO CONTRATO DE COMPRA E VENDA.',
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
        'CLIENTE CIENTE E DE ACORDO QUE MEDIÇÃO TÉCNICA DE AMBIENTE FOI REALIZADA COM AMBIENTE EM REFORMA INACABADA E QUE DEVERÁ RESPEITAR A ALÍNEA (I) DA CLÁUSULA TERCEIRA DO CONTRATO DE COMPRA E VENDA.',
      perguntaOrigem: 'G2.2',
    })
  }

  if (tem('ILUMINACAO_EXTERNA')) {
    resultado.push({
      id: 'ILUMINACAO_EXTERNA',
      tipo: 'CC',
      nivel: 'MÉDIO',
      escopo: 'Global',
      textoCompleto:
        'CLIENTE CIENTE E DE ACORDO QUE FIAÇÃO ELÉTRICA, INSTALAÇÃO DE ILUMINAÇÕES E SERVIÇOS DE ELETRICISTA É POR SUA RESPONSABILIDADE, PROFISSIONAL DEVE ESTAR LOCAL NO DIA DA MONTAGEM.',
      perguntaOrigem: 'G1',
    })
  }

  if (tem('PONTOS_INDEFINIDOS')) {
    resultado.push({
      id: 'PONTOS_INDEFINIDOS',
      tipo: 'CC',
      nivel: 'MÉDIO',
      escopo: 'Global',
      textoCompleto:
        'CLIENTE CIENTE E DE ACORDO QUE DEVERÁ ALTERAR E/OU PROVIDENCIAR PONTOS ELÉTRICOS/HIDRÁULICOS/GÁS ATÉ O DIA DA MONTAGEM, PARA CORRETA ADEQUAÇÃO DO PROJETO.',
      perguntaOrigem: 'G3',
    })
  }

  // --- Por ambiente ---
  for (const instancia of ambientesSelecionados) {
    const { instanceId, label, formType } = instancia
    const nomeAmbiente = instancia.nome || label

    // REBAIXO
    if (tem(`REBAIXO_${instanceId}`)) {
      const g4amb = global.g4_ambientes.find((a) => a.instanceId === instanceId)
      const cm = g4amb?.cm ?? '?'
      resultado.push({
        id: `REBAIXO_${instanceId}`,
        tipo: 'CC',
        nivel: 'BAIXO',
        escopo: instanceId,
        textoCompleto: `CLIENTE CIENTE E DE ACORDO QUE DEVERÁ FINALIZAR O REBAIXO DE TETO EM ${cm}CM ATÉ O DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO.`,
        perguntaOrigem: 'G4',
      })
    }

    // Granito
    if (tem(`GRANITO_RETIRAR_${instanceId}`)) {
      resultado.push({
        id: `GRANITO_RETIRAR_${instanceId}`,
        tipo: 'CC',
        nivel: 'MÉDIO',
        escopo: instanceId,
        textoCompleto:
          'CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR GRANITO EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO.',
        perguntaOrigem: 'P1.1',
      })
    }

    // Tanque
    if (tem(`TANQUE_RETIRAR_${instanceId}`)) {
      resultado.push({
        id: `TANQUE_RETIRAR_${instanceId}`,
        tipo: 'CC',
        nivel: 'MÉDIO',
        escopo: instanceId,
        textoCompleto:
          'CLIENTE CIENTE E DE ACORDO DE QUE DEVERÁ RETIRAR TANQUE EXISTENTE DO LOCAL ATÉ DIA DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO.',
        perguntaOrigem: 'P2.1',
      })
    }

    // TV ponto
    if (tem(`TV_PONTO_${instanceId}`)) {
      resultado.push({
        id: `TV_PONTO_${instanceId}`,
        tipo: 'CC',
        nivel: 'MÉDIO',
        escopo: instanceId,
        textoCompleto:
          'CLIENTE CIENTE E DE ACORDO QUE DEVERÁ DESLOCAR OS PONTOS ELÉTRICOS PARA DENTRO DA POSIÇÃO DO PAINEL DE TV ATÉ O DIA DA MONTAGEM PARA OCULTAÇÃO ADEQUADA DA FIAÇÃO.',
        perguntaOrigem: 'P2.1',
      })
    }

    // Eletros não definidos
    if (tem(`ELETROS_NAODEF_${instanceId}`)) {
      resultado.push({
        id: `ELETROS_NAODEF_${instanceId}`,
        tipo: 'CC',
        nivel: 'BAIXO',
        escopo: instanceId,
        textoCompleto:
          'CLIENTE CIENTE E DE ACORDO QUE OS ELETRODOMÉSTICOS NÃO FORAM DEFINIDOS NO PROJETO E DEVERÃO SER ADQUIRIDOS DE ACORDO COM OS VÃOS PREVISTOS.',
        perguntaOrigem: 'P3',
      })
    }

    // Eletrônicos não definidos
    if (tem(`ELETRONICOS_NAODEF_${instanceId}`)) {
      resultado.push({
        id: `ELETRONICOS_NAODEF_${instanceId}`,
        tipo: 'CC',
        nivel: 'BAIXO',
        escopo: instanceId,
        textoCompleto:
          'CLIENTE CIENTE E DE ACORDO QUE OS ELETRÔNICOS NÃO FORAM DEFINIDOS NO PROJETO E DEVERÃO SER ADQUIRIDOS DE ACORDO COM OS VÃOS PREVISTOS.',
        perguntaOrigem: 'P1',
      })
    }

    // Rodapé ausente
    if (tem(`RODAPE_AUSENTE_${instanceId}`)) {
      resultado.push({
        id: `RODAPE_AUSENTE_${instanceId}`,
        tipo: 'CC',
        nivel: 'BAIXO',
        escopo: instanceId,
        textoCompleto:
          'CLIENTE CIENTE E DE ACORDO QUE DEVERÁ INSTALAR RODAPÉ NA REGIÃO DOS MÓVEIS SOMENTE APÓS A FINALIZAÇÃO DA MONTAGEM PARA CORRETA ADEQUAÇÃO DO PROJETO.',
        perguntaOrigem: 'P4',
      })
    }

    // Rodapé existente (AVISO sem score)
    const resp = state.respostasPorAmbiente[instanceId] || {}
    if (['dormitorio', 'home', 'outros'].includes(formType) && resp.rodape === true) {
      resultado.push({
        id: `RODAPE_EXISTENTE_${instanceId}`,
        tipo: 'AVISO',
        nivel: null,
        escopo: instanceId,
        textoCompleto:
          'ROUPEIROS SERÃO INSTALADOS À FRENTE DO RODAPÉ EXISTENTE, COM ACABAMENTO EM MEIA-CANA NA PARTE DE TRÁS.',
        perguntaOrigem: 'P4',
      })
    }

    // Cortineiro não instalado (AVISO com score)
    if (tem(`CORTINEIRO_NAOINSTALADO_${instanceId}`)) {
      resultado.push({
        id: `CORTINEIRO_NAOINSTALADO_${instanceId}`,
        tipo: 'AVISO',
        nivel: 'BAIXO',
        escopo: instanceId,
        textoCompleto: 'AVISO: SERÁ CONSIDERADO VÃO DE 150MM PARA CORTINEIRO NÃO INSTALADO.',
        perguntaOrigem: 'P3.1',
      })
    }
  }

  return resultado
}
