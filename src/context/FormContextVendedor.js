import { createContext, useContext } from 'react'

export const FormContextVendedor = createContext(null)

export function useFormContextVendedor() {
  const ctx = useContext(FormContextVendedor)
  if (!ctx) throw new Error('useFormContextVendedor deve ser usado dentro de FormProviderVendedor')
  return ctx
}
