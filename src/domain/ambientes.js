/** @type {Array<{id: string, label: string, formType: string}>} */
export const AMBIENTES_DISPONIVEIS = [
  { id: 'cozinha',             label: 'Cozinha / Área de Serviço', formType: 'cozinha'    },
  { id: 'dormitorio_casal',    label: 'Dormitório Casal',          formType: 'dormitorio' },
  { id: 'dormitorio_solteiro', label: 'Dormitório Solteiro',       formType: 'dormitorio' },
  { id: 'banheiro',            label: 'Banheiro / W.C.',           formType: 'banheiro'   },
  { id: 'home',                label: 'Home / Sala',               formType: 'home'       },
  { id: 'office',              label: 'Office',                    formType: 'home'       },
  { id: 'varanda',             label: 'Varanda / Área Gourmet',    formType: 'cozinha'    },
  { id: 'outros',              label: 'Outros',                    formType: 'outros'     },
]

export function formatarNomeAmbiente(ambiente) {
  if (!ambiente) return ''

  const nomePersonalizado = ambiente.nome?.trim()
  if (!nomePersonalizado) {
    return ambiente.label
  }

  return `${ambiente.label} — ${nomePersonalizado}`
}
