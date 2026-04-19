import { useReducer, useEffect, useState } from 'react'
import { FormContext } from './FormContext.js'
import { estadoInicial, defaultsPorFormType } from '../domain/schema.js'
import { AMBIENTES_DISPONIVEIS } from '../domain/ambientes.js'

const STORAGE_KEY = 'byarabi_checklist_rascunho'

function reducer(state, action) {
  const now = new Date().toISOString()

  switch (action.type) {
    case 'SET_IDENTIFICACAO': {
      return {
        ...state,
        identificacao: { ...state.identificacao, [action.campo]: action.valor },
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'SET_AMBIENTE_QUANTIDADE': {
      const { ambienteId, quantidade } = action
      const def = AMBIENTES_DISPONIVEIS.find((a) => a.id === ambienteId)
      if (!def) return state

      // Instâncias existentes do tipo
      const existentes = state.ambientesSelecionados.filter((a) => a.tipo === ambienteId)
      const outras = state.ambientesSelecionados.filter((a) => a.tipo !== ambienteId)

      // Reconstrói instâncias
      const novas = []
      for (let i = 0; i < quantidade; i++) {
        const instanceId = `${ambienteId}-${i}`
        novas.push({
          instanceId,
          tipo: ambienteId,
          formType: def.formType,
          label: def.label,
          nome: quantidade === 1 ? '' : (existentes[i]?.nome ?? ''),
        })
      }

      // Mantém ordem original dos outros ambientes e adiciona/remove as instâncias do tipo
      const instanciasAntigas = state.ambientesSelecionados.filter((a) => a.tipo !== ambienteId)
      // Reinsere no mesmo índice relativo
      const todosAmbientesIds = AMBIENTES_DISPONIVEIS.map((a) => a.id)
      const novaLista = []
      const mapaNovas = new Map(novas.map((n) => [n.instanceId, n]))
      const mapaOutras = new Map()
      instanciasAntigas.forEach((a) => mapaOutras.set(a.instanceId, a))

      for (const ambDef of AMBIENTES_DISPONIVEIS) {
        if (ambDef.id === ambienteId) {
          novas.forEach((n) => novaLista.push(n))
        } else {
          instanciasAntigas.filter((a) => a.tipo === ambDef.id).forEach((a) => novaLista.push(a))
        }
      }

      // Inicializa respostasPorAmbiente para novas instâncias
      const novasRespostas = { ...state.respostasPorAmbiente }
      for (const inst of novas) {
        if (!novasRespostas[inst.instanceId]) {
          novasRespostas[inst.instanceId] = { ...defaultsPorFormType[inst.formType] }
        }
      }
      // Remove instâncias excluídas
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

    case 'SET_AMBIENTE_NOME': {
      return {
        ...state,
        ambientesSelecionados: state.ambientesSelecionados.map((a) =>
          a.instanceId === action.instanceId ? { ...a, nome: action.nome } : a
        ),
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'SET_GLOBAL': {
      return {
        ...state,
        global: { ...state.global, [action.campo]: action.valor },
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'SET_GLOBAL_G4_AMBIENTE': {
      const { instanceId, cm } = action
      const lista = state.global.g4_ambientes
      const existe = lista.find((a) => a.instanceId === instanceId)
      const nova = existe
        ? lista.map((a) => (a.instanceId === instanceId ? { ...a, cm } : a))
        : [...lista, { instanceId, cm }]
      return {
        ...state,
        global: { ...state.global, g4_ambientes: nova },
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'SET_RESPOSTA_AMBIENTE': {
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

    case 'ADD_ELETRO': {
      const { instanceId, eletro } = action
      const atual = state.respostasPorAmbiente[instanceId] || {}
      return {
        ...state,
        respostasPorAmbiente: {
          ...state.respostasPorAmbiente,
          [instanceId]: { ...atual, eletros: [...(atual.eletros || []), eletro] },
        },
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'UPDATE_ELETRO': {
      const { instanceId, index, campo, valor } = action
      const atual = state.respostasPorAmbiente[instanceId] || {}
      const eletros = (atual.eletros || []).map((e, i) =>
        i === index ? { ...e, [campo]: valor } : e
      )
      return {
        ...state,
        respostasPorAmbiente: { ...state.respostasPorAmbiente, [instanceId]: { ...atual, eletros } },
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'REMOVE_ELETRO': {
      const { instanceId, index } = action
      const atual = state.respostasPorAmbiente[instanceId] || {}
      const eletros = (atual.eletros || []).filter((_, i) => i !== index)
      return {
        ...state,
        respostasPorAmbiente: { ...state.respostasPorAmbiente, [instanceId]: { ...atual, eletros } },
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'ADD_ELETRONICO': {
      const { instanceId, eletronico } = action
      const atual = state.respostasPorAmbiente[instanceId] || {}
      return {
        ...state,
        respostasPorAmbiente: {
          ...state.respostasPorAmbiente,
          [instanceId]: { ...atual, eletronicosList: [...(atual.eletronicosList || []), eletronico] },
        },
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'UPDATE_ELETRONICO': {
      const { instanceId, index, campo, valor } = action
      const atual = state.respostasPorAmbiente[instanceId] || {}
      const eletronicosList = (atual.eletronicosList || []).map((e, i) =>
        i === index ? { ...e, [campo]: valor } : e
      )
      return {
        ...state,
        respostasPorAmbiente: { ...state.respostasPorAmbiente, [instanceId]: { ...atual, eletronicosList } },
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'REMOVE_ELETRONICO': {
      const { instanceId, index } = action
      const atual = state.respostasPorAmbiente[instanceId] || {}
      const eletronicosList = (atual.eletronicosList || []).filter((_, i) => i !== index)
      return {
        ...state,
        respostasPorAmbiente: { ...state.respostasPorAmbiente, [instanceId]: { ...atual, eletronicosList } },
        _meta: { ...state._meta, atualizadoEm: now },
      }
    }

    case 'SET_META': {
      return {
        ...state,
        _meta: { ...state._meta, [action.campo]: action.valor },
      }
    }

    case 'RESTORE_STATE': {
      return action.estadoCompleto
    }

    case 'RESET_STATE': {
      localStorage.removeItem(STORAGE_KEY)
      return { ...estadoInicial, _meta: { ...estadoInicial._meta, criadoEm: new Date().toISOString() } }
    }

    default:
      return state
  }
}

export function FormProvider({ children }) {
  const [ready, setReady] = useState(false)
  const [rascunho, setRascunho] = useState(null)
  const [state, dispatch] = useReducer(reducer, estadoInicial)

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
    dispatch({ type: 'RESTORE_STATE', estadoCompleto: rascunho })
    setRascunho(null)
    setReady(true)
  }

  const descartarRascunho = () => {
    localStorage.removeItem(STORAGE_KEY)
    setRascunho(null)
    setReady(true)
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
    <FormContext.Provider value={{ state, dispatch }}>
      {children}
    </FormContext.Provider>
  )
}
