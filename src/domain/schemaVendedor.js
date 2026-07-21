/** Defaults por grupo de perguntas (A/B/C) — ver domain/gruposPerguntasVendedor.js */
export const defaultsPorGrupo = {
  A: {
    alturaBalcao_mm: null,        // number | "não se aplica" | null (não respondido)
    alturaArmario_mm: null,       // number | "não se aplica" | null
    fechamentoTeto: null,         // "SIM" | "NAO" | "não se aplica" | null
    caixaria: null,               // "MDP" | "MDF" | "não se aplica" | null
    dobradicas: null,             // "Convencionais" | "Amortecimento" | "não se aplica" | null
    corredicas: null,             // "Telescópicas" | "Ocultas" | "não se aplica" | null
    observacoes: '',              // opcional, texto livre, máx. 300 chars
  },
  B: {
    caixaria: null,
    dobradicas: null,
    corredicas: null,
    fechamentoTeto: null,
    observacoes: '',
  },
  C: {
    caixaria: null,
    dobradicas: null,
    corredicas: null,
    observacoes: '',
  },
}

export const estadoInicialVendedor = {
  _meta: {
    etapaAtual: 'identificacao',
    origemNavegacao: null,
    criadoEm: null,
    atualizadoEm: null,
  },
  identificacao: {
    contratos: [''],   // sempre ao menos 1 posição; "+" adiciona strings vazias ao array
    nome: '',
  },
  ambientesSelecionados: [],   // mesmo formato de instância do cliente: { instanceId, tipo, label, nome }
  respostasPorAmbiente: {},    // chaveado por instanceId, valor = defaultsPorGrupo[grupo]
}
