import { createContext, useContext } from 'react'

export const FormContext = createContext(null)

export function useFormContext() {
  const ctx = useContext(FormContext)
  if (!ctx) throw new Error('useFormContext deve ser usado dentro de FormProvider')
  return ctx
}
