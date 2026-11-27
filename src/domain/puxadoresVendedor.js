export const MODELOS_PUXADOR = [
  'Roma',
  'Madri 150mm',
  'Madri 270mm',
  'Berlin',
  'Paris',
  'Perfil Cava',
  'Perfil Gola Fit',
  'Florença',
]

export const TEXTO_SEM_COR = 'Sem cor'

const MODELOS_COR_UNICA = ['madri 150mm', 'madri 270mm', 'florenca']

const CORES_POR_MODELO = {
  roma: ['Fendi', 'Alumínio', 'Griggio'],
  berlin: ['Antique', 'Aço', 'Cobre'],
  paris: ['Antique'],
  'perfil cava': ['Fendi', 'Alumínio'],
  'perfil gola fit': ['Alumínio', 'Grafito'],
}

/**
 * Normaliza texto de puxador/cor removendo acentos, espaços nas pontas e maiúsculas.
 * @param {unknown} texto
 * @returns {string}
 */
export function normalizarTextoPuxador(texto) {
  if (typeof texto !== 'string') return ''
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

/**
 * Filtra sugestões ignorando acentos, maiúsculas/minúsculas e espaços nas pontas.
 * @param {string[]} opcoes
 * @param {string} termo
 * @returns {string[]}
 */
export function filtrarSugestoesPuxador(opcoes, termo) {
  if (!Array.isArray(opcoes)) return []
  const filtro = normalizarTextoPuxador(termo)
  if (!filtro) return [...opcoes]
  return opcoes.filter((op) => normalizarTextoPuxador(op).includes(filtro))
}

/**
 * Indica se o modelo possui cor única confirmada (`Madri 150mm`, `Madri 270mm` ou `Florença`).
 * @param {unknown} modelo
 * @returns {boolean}
 */
export function ehModeloCorUnica(modelo) {
  return MODELOS_COR_UNICA.includes(normalizarTextoPuxador(modelo))
}

/**
 * Indica se a cor equivale a "Sem cor" (ignorando acentos, caixa e espaços nas pontas).
 * @param {unknown} cor
 * @returns {boolean}
 */
export function ehSemCor(cor) {
  return normalizarTextoPuxador(cor) === 'sem cor'
}

/**
 * Retorna as sugestões de cor confirmadas para o modelo informado.
 * Retorna lista vazia para cor única, modelo desconhecido ou vazio.
 * @param {unknown} modelo
 * @returns {string[]}
 */
export function obterSugestoesCor(modelo) {
  const chave = normalizarTextoPuxador(modelo)
  if (!chave || ehModeloCorUnica(chave)) return []
  const paleta = CORES_POR_MODELO[chave]
  return paleta ? [...paleta] : []
}

/**
 * Resolve o próximo par `{ modelo, cor }` ao editar o campo Modelo,
 * aplicando autopreenchimento e limpeza automática de "Sem cor".
 * @param {unknown} modeloAnterior
 * @param {unknown} corAtual
 * @param {string} novoModelo
 * @returns {{ modelo: string, cor: string }}
 */
export function resolverAlteracaoModelo(modeloAnterior, corAtual, novoModelo) {
  const corSegura = typeof corAtual === 'string' ? corAtual : ''
  const anteriorNorm = normalizarTextoPuxador(modeloAnterior)
  const novoNorm = normalizarTextoPuxador(novoModelo)

  if (ehModeloCorUnica(novoModelo)) {
    if (anteriorNorm !== novoNorm || !corSegura.trim()) {
      return { modelo: novoModelo, cor: TEXTO_SEM_COR }
    }
    return { modelo: novoModelo, cor: corSegura }
  }

  if (anteriorNorm && anteriorNorm !== novoNorm) {
    return { modelo: novoModelo, cor: '' }
  }

  return { modelo: novoModelo, cor: corSegura }
}

/**
 * Descreve o texto de exibição e as linhas da resposta de puxadores,
 * compartilhado entre a Revisão e o PDF do Projetista.
 * @param {Record<string, unknown> | null | undefined} resp
 * @returns {{ texto: string, destaque: false, linhas: string[] }}
 */
export function descreverRespostaPuxadores(resp) {
  const temPuxador = resp?.temPuxador
  if (temPuxador !== 'Sim' && temPuxador !== 'Não') {
    return { texto: '—', destaque: false, linhas: [] }
  }
  if (temPuxador === 'Não') {
    return { texto: 'Não', destaque: false, linhas: [] }
  }

  const lista = Array.isArray(resp.puxadores) ? resp.puxadores : []
  const linhas = lista.map((item) => {
    const modelo = typeof item?.modelo === 'string' ? item.modelo.trim() : ''
    const cor = typeof item?.cor === 'string' ? item.cor.trim() : ''
    return `• ${modelo || '—'} — ${cor || '—'}`
  })

  return { texto: 'Sim', destaque: false, linhas }
}
