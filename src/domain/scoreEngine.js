/**
 * Calcula score global e por ambiente a partir do estado completo do formulário.
 * @param {object} state - Estado completo do formulário
 * @returns {{ scoreGlobal, scorePorAmbiente, gatilhosAtivados }}
 */
export function calcularScore(state) {
  const { global, ambientesSelecionados, respostasPorAmbiente } = state

  const gatilhosAtivados = []

  const g1_ambientes                = global.g1_ambientes || []
  const g2_ambientesSemReboco       = global.g2_ambientesSemReboco || []
  const g3_ambientesSemRevestimento = global.g3_ambientesSemRevestimento || []
  const g3_ambientesPendentes       = global.g3_ambientesPendentes || []

  // --- Gatilhos por ambiente ---
  const scorePorAmbiente = {}

  for (const instancia of ambientesSelecionados) {
    const { instanceId, formType } = instancia
    const resp = respostasPorAmbiente[instanceId] || {}
    const gatilhosAmbiente = []

    // G1 — Iluminação externa
    if (g1_ambientes.includes(instanceId)) {
      gatilhosAtivados.push(`ILUMINACAO_EXTERNA_${instanceId}`)
      gatilhosAmbiente.push({ id: `ILUMINACAO_EXTERNA_${instanceId}`, nivel: 'Médio', pontos: 2 })
    }

    // G2 — Sem reboco
    if (g2_ambientesSemReboco.includes(instanceId)) {
      gatilhosAtivados.push(`REFORM_SEM_REBOCO_${instanceId}`)
      gatilhosAmbiente.push({ id: `REFORM_SEM_REBOCO_${instanceId}`, nivel: 'AltoDireto', pontos: 0 })
    }

    // G3 — Sem revestimento (com supressão G2)
    if (g3_ambientesSemRevestimento.includes(instanceId) && !g2_ambientesSemReboco.includes(instanceId)) {
      gatilhosAtivados.push(`REFORM_SEM_REVESTIMENTO_${instanceId}`)
      gatilhosAmbiente.push({ id: `REFORM_SEM_REVESTIMENTO_${instanceId}`, nivel: 'Alto', pontos: 3 })
    }

    // G4 — Pontos indefinidos
    if (g3_ambientesPendentes.includes(instanceId)) {
      gatilhosAtivados.push(`PONTOS_INDEFINIDOS_${instanceId}`)
      gatilhosAmbiente.push({ id: `PONTOS_INDEFINIDOS_${instanceId}`, nivel: 'Médio', pontos: 2 })
    }

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

    // DIV-07: suprime o ponto de TV somente se este ambiente está em g3_ambientesPendentes
    const div07Ativo = g3_ambientesPendentes.includes(instanceId)

    // TV ponto → Dormitório (baseado em resp.tv)
    if (formType === 'dormitorio') {
      if (resp.tv === true && resp.tvPontoFinal === false) {
        gatilhosAtivados.push(`TV_PONTO_${instanceId}`)
        const pontosTv = div07Ativo ? 0 : 2
        gatilhosAmbiente.push({ id: `TV_PONTO_${instanceId}`, nivel: 'Médio', pontos: pontosTv })
      }
    }
    // TV ponto → Home, Outros (baseado em eletronicosList)
    if (['home', 'outros'].includes(formType)) {
      const hasTv = (resp.eletronicosList || []).some((e) => e.tipo === 'TV')
      if (hasTv && resp.tvPontoFinal === false) {
        gatilhosAtivados.push(`TV_PONTO_${instanceId}`)
        const pontosTv = div07Ativo ? 0 : 2
        gatilhosAmbiente.push({ id: `TV_PONTO_${instanceId}`, nivel: 'Médio', pontos: pontosTv })
      }
    }

    // Eletros não definidos → Cozinha
    if (formType === 'cozinha') {
      if (resp.eletrosDefined === false) {
        gatilhosAtivados.push(`ELETROS_NAODEF_${instanceId}`)
        gatilhosAmbiente.push({ id: `ELETROS_NAODEF_${instanceId}`, nivel: 'Baixo', pontos: 1 })
      }
    }

    // Eletrônicos não definidos → Home
    if (formType === 'home') {
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

  // --- Score global (pior ambiente) ---
  const ambientesValues = Object.values(scorePorAmbiente)

  let scoreGlobal
  if (ambientesValues.length === 0) {
    scoreGlobal = { pontos: 0, isAlto: false, classificacao: 'BAIXO' }
  } else {
    const altos = ambientesValues.filter((s) => s.isAlto)
    if (altos.length > 0) {
      const pontos = Math.max(...altos.map((s) => s.pontos))
      scoreGlobal = { pontos, isAlto: true, classificacao: classificar(pontos, true) }
    } else {
      const medios = ambientesValues.filter((s) => s.classificacao === 'MÉDIO')
      if (medios.length > 0) {
        const pontos = Math.max(...medios.map((s) => s.pontos))
        scoreGlobal = { pontos, isAlto: false, classificacao: classificar(pontos, false) }
      } else {
        const pontos = Math.max(...ambientesValues.map((s) => s.pontos))
        scoreGlobal = { pontos, isAlto: false, classificacao: classificar(pontos, false) }
      }
    }
  }

  return { scoreGlobal, scorePorAmbiente, gatilhosAtivados }
}

function classificar(pontos, isAlto) {
  if (isAlto || pontos >= 8) return 'ALTO'
  if (pontos >= 4) return 'MÉDIO'
  return 'BAIXO'
}
