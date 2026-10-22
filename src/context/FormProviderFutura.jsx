import { useReducer } from 'react'
import { FormContext } from './FormContext.js'

// Venda Futura: estado só em memória, sem localStorage e sem diálogo de rascunho.
function criarEstadoInicialFutura() {
  return {
    identificacao: {
      nome: '',
      contrato: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      telefone: '',
    },
    _meta: { origemNavegacao: null },
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_IDENTIFICACAO':
      return {
        ...state,
        identificacao: { ...state.identificacao, [action.campo]: action.valor },
      }

    case 'SET_META':
      return {
        ...state,
        _meta: { ...state._meta, [action.campo]: action.valor },
      }

    case 'RESET_STATE_FUTURA':
      return criarEstadoInicialFutura()

    default:
      return state
  }
}

export function FormProviderFutura({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, criarEstadoInicialFutura)

  return <FormContext.Provider value={{ state, dispatch }}>{children}</FormContext.Provider>
}
