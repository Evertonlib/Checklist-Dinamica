import { useReducer, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormContextVendedor } from './FormContextVendedor.js'
import { estadoInicialVendedor, defaultsPorGrupo } from '../domain/schemaVendedor.js'
import { AMBIENTES_DISPONIVEIS } from '../domain/ambientes.js'
import { obterGrupo } from '../domain/gruposPerguntasVendedor.js'

const STORAGE_KEY = 'byarabi_checklist_vendedor'

function criarEstadoInicial() {
  return {
    ...estadoInicialVendedor,
    _meta: {
      ...estadoInicialVendedor._meta,
      criadoEm: new Date().toISOString(),
    },
  }
}

function normalizarRotaEtapa(etapaAtual) {
  if (!etapaAtual) return '/vendedor/identificacao'
  return etapaAtual.startsWith('/') ? etapaAtual : `/vendedor/${etapaAtual}`
}

function normalizarEstadoSalvo(estadoSalvo) {
  const ambientesSelecionados = estadoSalvo?.ambientesSelecionados || []
  const respostasPorAmbiente = {}

  ambientesSelecionados.forEach((instancia) => {
    respostasPorAmbiente[instancia.instanceId] = {
      ...(defaultsPorGrupo[obterGrupo(instancia.tipo)] || {}),
      ...(estadoSalvo?.respostasPorAmbiente?.[instancia.instanceId] || {}),
    }
  })

  return {
    ...criarEstadoInicial(),
    ...estadoSalvo,
    _meta: {
      ...criarEstadoInicial()._meta,
      ...(estadoSalvo?._meta || {}),
    },
    identificacao: {
      ...estadoInicialVendedor.identificacao,
      ...(estadoSalvo?.identificacao || {}),
    },
    ambientesSelecionados,
    respostasPorAmbiente,
  }
}

function reducer(state, action) {
  const now = new Date().toISOString()

  switch (action.type) {
    case 'SET_IDENTIFICACAO_VENDEDOR_NOME': {
      return {
        ...state,
        identificacao: { ...state.identificacao, nome: action.valor },
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'SET_IDENTIFICACAO_VENDEDOR_CONTRATO': {
      const { index, valor } = action
      return {
        ...state,
        identificacao: {
          ...state.identificacao,
          contratos: state.identificacao.contratos.map((c, i) => (i === index ? valor : c)),
        },
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'ADD_CONTRATO_VENDEDOR': {
      return {
        ...state,
        identificacao: {
          ...state.identificacao,
          contratos: [...state.identificacao.contratos, ''],
        },
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'REMOVE_CONTRATO_VENDEDOR': {
      const { index } = action
      if (index === 0) return state
      return {
        ...state,
        identificacao: {
          ...state.identificacao,
          contratos: state.identificacao.contratos.filter((_, i) => i !== index),
        },
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'SET_AMBIENTE_QUANTIDADE_VENDEDOR': {
      const { ambienteId, quantidade } = action
      const def = AMBIENTES_DISPONIVEIS.find((a) => a.id === ambienteId)
      if (!def) return state

      const existentes = state.ambientesSelecionados.filter((a) => a.tipo === ambienteId)

      const novas = []
      for (let i = 0; i < quantidade; i++) {
        const instanceId = `${ambienteId}-${i}`
        novas.push({
          instanceId,
          tipo: ambienteId,
          label: def.label,
          nome: (quantidade === 1 && ambienteId !== 'outros') ? '' : (existentes[i]?.nome ?? ''),
        })
      }

      const instanciasAntigas = state.ambientesSelecionados.filter((a) => a.tipo !== ambienteId)
      const novaLista = []
      for (const ambDef of AMBIENTES_DISPONIVEIS) {
        if (ambDef.id === ambienteId) {
          novas.forEach((n) => novaLista.push(n))
        } else {
          instanciasAntigas.filter((a) => a.tipo === ambDef.id).forEach((a) => novaLista.push(a))
        }
      }

      const novasRespostas = { ...state.respostasPorAmbiente }
      for (const inst of novas) {
        if (!novasRespostas[inst.instanceId]) {
          novasRespostas[inst.instanceId] = { ...defaultsPorGrupo[obterGrupo(inst.tipo)] }
        }
      }
      for (const old of existentes) {
        if (!novas.find((n) => n.instanceId === old.instanceId)) {
          delete novasRespostas[old.instanceId]
        }
      }

      return {
        ...state,
        ambientesSelecionados: novaLista,
        respostasPorAmbiente: novasRespostas,
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'SET_AMBIENTE_NOME_VENDEDOR': {
      return {
        ...state,
        ambientesSelecionados: state.ambientesSelecionados.map((a) =>
          a.instanceId === action.instanceId ? { ...a, nome: action.nome } : a
        ),
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'SET_RESPOSTA_AMBIENTE_VENDEDOR': {
      const { instanceId, campo, valor } = action
      return {
        ...state,
        respostasPorAmbiente: {
          ...state.respostasPorAmbiente,
          [instanceId]: {
            ...state.respostasPorAmbiente[instanceId],
            [campo]: valor,
          },
        },
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'SET_META_VENDEDOR': {
      return {
        ...state,
        _meta: { ...state._meta, [action.campo]: action.valor },
      }
    }

    case 'RESTORE_STATE_VENDEDOR': {
      return normalizarEstadoSalvo(action.estadoCompleto)
    }

    case 'RESET_STATE_VENDEDOR': {
      localStorage.removeItem(STORAGE_KEY)
      return criarEstadoInicial()
    }

    default:
      return state
  }
}

export function FormProviderVendedor({ children }) {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [rascunho, setRascunho] = useState(null)
  const [state, dispatch] = useReducer(reducer, undefined, criarEstadoInicial)

  useEffect(() => {
    const salvo = localStorage.getItem(STORAGE_KEY)
    if (salvo) {
      try {
        setRascunho(JSON.parse(salvo))
      } catch {
        setReady(true)
      }
    } else {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, ready])

  const confirmarRascunho = () => {
    const estadoRestaurado = normalizarEstadoSalvo(rascunho)
    dispatch({ type: 'RESTORE_STATE_VENDEDOR', estadoCompleto: estadoRestaurado })
    setRascunho(null)
    setReady(true)
    navigate(normalizarRotaEtapa(estadoRestaurado._meta.etapaAtual), { replace: true })
  }

  const descartarRascunho = () => {
    dispatch({ type: 'RESET_STATE_VENDEDOR' })
    setRascunho(null)
    setReady(true)
    navigate('/vendedor/identificacao', { replace: true })
  }

  if (!ready && rascunho) {
    return (
      <div className="rascunho-dialog">
        <div className="rascunho-card">
          <h2>Continuar de onde parou?</h2>
          <p>Encontramos um preenchimento salvo. Deseja continuar?</p>
          <div className="rascunho-acoes">
            <button onClick={confirmarRascunho}>Sim, continuar</button>
            <button onClick={descartarRascunho} className="btn-secundario">
              Não, começar do zero
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!ready) return null

  return (
    <FormContextVendedor.Provider value={{ state, dispatch }}>
      {children}
    </FormContextVendedor.Provider>
  )
}
