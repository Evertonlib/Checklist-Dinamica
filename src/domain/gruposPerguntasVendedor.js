import { AMBIENTES_DISPONIVEIS } from './ambientes.js'

/** Mapa próprio do Projetista — não altera nem substitui ambientes.js */
export const GRUPO_POR_AMBIENTE = {
  cozinha:              'A',
  varanda:              'A',
  banheiro:             'A',
  outros:                'A',
  dormitorio_casal:      'B',
  dormitorio_solteiro:   'B',
  home:                  'C',
  office:                'C',
}

export function obterGrupo(ambienteId) {
  return GRUPO_POR_AMBIENTE[ambienteId] ?? 'A'
}
