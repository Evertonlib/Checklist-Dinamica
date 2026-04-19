/**
 * Calcula score global e por ambiente a partir do estado completo do formulário.
 * @param {object} state - Estado completo do formulário
 * @returns {{ scoreGlobal, scorePorAmbiente, gatilhosAtivados }}
 */
export function calcularScore(state) {
  const { global, ambientesSelecionados, respostasPorAmbiente } = state

  const GATILHOS_DEF = {
    REFORM_SEM_REBOCO:     { nivel: 'AltoDireto', pontos: 0,  escopo: 'global' },
    REFORM_SEM_REVESTIMENTO: { nivel: 'Alto',     pontos: 3,  escopo: 'global' },
    ILUMINACAO_EXTERNA:    { nivel: 'Médio',       pontos: 2,  escopo: 'global' },
    PONTOS_INDEFINIDOS:    { nivel: 'Médio',       pontos: 2,  escopo: 'global' },
  }

  const gatilhosAtivados = []

  // --- Gatilhos globais ---
  if (global.g2_temReforma === true && global.g2_1_temReboco === false) {
    gatilhosAtivados.push('REFORM_SEM_REBOCO')
  }
  if (
    global.g2_temReforma === true &&
    global.g2_1_temReboco === true &&
    global.g2_2_temRevestimento === false
  ) {
    gatilhosAtivados.push('REFORM_SEM_REVESTIMENTO')
  }
  if (global.g1_temIluminacaoExterna === true) {
    gatilhosAtivados.push('ILUMINACAO_EXTERNA')
  }
  if (global.g3_pontosNaPosicaoFinal === false) {
    gatilhosAtivados.push('PONTOS_INDEFINIDOS')
  }

  const pontosIndefinidosAtivo = gatilhosAtivados.includes('PONTOS_INDEFINIDOS')

  // --- Gatilhos por ambiente ---
  const scorePorAmbiente = {}

  for (const instancia of ambientesSelecionados) {
    const { instanceId, formType } = instancia
    const resp = respostasPorAmbiente[instanceId] || {}
    const gatilhosAmbiente = []

    // REBAIXO
    if (
      global.g4_temRebaixo === true &&
      global.g4_ambientes.some((a) => a.instanceId === instanceId)
    ) {
      gatilhosAtivados.push(`REBAIXO_${instanceId}`)
      gatilhosAmbiente.push({ id: `REBAIXO_${instanceId}`, nivel: 'Baixo', pontos: 1 })
    }

    // Granito → Cozinha, Banheiro, Outros
    if (['cozinha', 'banheiro', 'outros'].includes(formType)) {
      if (resp.granito === true && resp.granitoadaptar === false) {
        gatilhosAtivados.push(`GRANITO_RETIRAR_${instanceId}`)
        gatilhosAmbiente.push({ id: `GRANITO_RETIRAR_${instanceId}`, nivel: 'Médio', pontos: 2 })
      }
    }

    // Tanque → Cozinha, Outros
    if (['cozinha', 'outros'].includes(formType)) {
      if (resp.tanque === true && resp.tanqueMoveis === true) {
        gatilhosAtivados.push(`TANQUE_RETIRAR_${instanceId}`)
        gatilhosAmbiente.push({ id: `TANQUE_RETIRAR_${instanceId}`, nivel: 'Médio', pontos: 2 })
      }
    }

    // TV ponto → Dormitório, Home, Outros
    if (['dormitorio', 'home', 'outros'].includes(formType)) {
      if (resp.tv === true && resp.tvPontoFinal === false) {
        gatilhosAtivados.push(`TV_PONTO_${instanceId}`)
        // DIV-07: contribui 0 pontos quando PONTOS_INDEFINIDOS ativo
        const pontosTv = pontosIndefinidosAtivo ? 0 : 2
        gatilhosAmbiente.push({ id: `TV_PONTO_${instanceId}`, nivel: 'Médio', pontos: pontosTv })
      }
    }

    // Eletros não definidos → Cozinha, Outros
    if (['cozinha', 'outros'].includes(formType)) {
      if (resp.eletrosDefined === false) {
        gatilhosAtivados.push(`ELETROS_NAODEF_${instanceId}`)
        gatilhosAmbiente.push({ id: `ELETROS_NAODEF_${instanceId}`, nivel: 'Baixo', pontos: 1 })
      }
    }

    // Eletrônicos não definidos → Home, Outros
    if (['home', 'outros'].includes(formType)) {
      if (resp.eletronicos === false) {
        gatilhosAtivados.push(`ELETRONICOS_NAODEF_${instanceId}`)
        gatilhosAmbiente.push({ id: `ELETRONICOS_NAODEF_${instanceId}`, nivel: 'Baixo', pontos: 1 })
      }
    }

    // Rodapé ausente → Dormitório, Home, Outros
    if (['dormitorio', 'home', 'outros'].includes(formType)) {
      if (resp.rodape === false) {
        gatilhosAtivados.push(`RODAPE_AUSENTE_${instanceId}`)
        gatilhosAmbiente.push({ id: `RODAPE_AUSENTE_${instanceId}`, nivel: 'Baixo', pontos: 1 })
      }
    }

    // Cortineiro não instalado → Dormitório, Home, Outros
    if (['dormitorio', 'home', 'outros'].includes(formType)) {
      if (resp.cortineiro === true && resp.cortieneiroInstalado === false) {
        gatilhosAtivados.push(`CORTINEIRO_NAOINSTALADO_${instanceId}`)
        gatilhosAmbiente.push({ id: `CORTINEIRO_NAOINSTALADO_${instanceId}`, nivel: 'Baixo', pontos: 1 })
      }
    }

    const isAlto = gatilhosAmbiente.some(
      (g) => g.nivel === 'Alto' || g.nivel === 'AltoDireto'
    )
    const pontos = gatilhosAmbiente.reduce((s, g) => s + g.pontos, 0)
    scorePorAmbiente[instanceId] = {
      pontos,
      isAlto,
      classificacao: classificar(pontos, isAlto),
      gatilhos: gatilhosAmbiente.map((g) => g.id),
    }
  }

  // --- Score global ---
  const gatilhosGlobaisAtivados = gatilhosAtivados.filter((g) =>
    ['REFORM_SEM_REBOCO', 'REFORM_SEM_REVESTIMENTO', 'ILUMINACAO_EXTERNA', 'PONTOS_INDEFINIDOS'].includes(g)
  )

  const globalIsAlto =
    gatilhosGlobaisAtivados.some((g) =>
      GATILHOS_DEF[g]?.nivel === 'Alto' || GATILHOS_DEF[g]?.nivel === 'AltoDireto'
    ) || Object.values(scorePorAmbiente).some((s) => s.isAlto)

  const globalPontos =
    gatilhosGlobaisAtivados.reduce((s, g) => s + (GATILHOS_DEF[g]?.pontos ?? 0), 0) +
    Object.values(scorePorAmbiente).reduce((s, a) => s + a.pontos, 0)

  const scoreGlobal = {
    pontos: globalPontos,
    isAlto: globalIsAlto,
    classificacao: classificar(globalPontos, globalIsAlto),
  }

  return { scoreGlobal, scorePorAmbiente, gatilhosAtivados }
}

function classificar(pontos, isAlto) {
  if (isAlto || pontos >= 8) return 'ALTO'
  if (pontos >= 4) return 'MÉDIO'
  return 'BAIXO'
}
