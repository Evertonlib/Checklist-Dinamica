export const OPCOES_CORREDICAS = ['Ocultas', 'Hafele', 'Blum']

export const EXTRACAO_POR_MODELO = {
  Hafele: ['Extração total', 'Tip-on'],
  Blum: ['Extração total', 'Tip-on', 'Extração parcial'],
}

/**
 * Retorna a lista de subopções de extração válidas para o modelo informado.
 * @param {unknown} modelo
 * @returns {string[]}
 */
export function obterOpcoesExtracao(modelo) {
  if (typeof modelo === 'string' && Object.hasOwn(EXTRACAO_POR_MODELO, modelo)) {
    return [...EXTRACAO_POR_MODELO[modelo]]
  }
  return []
}

/**
 * Indica se o modelo escolhido exige seleção de tipo de extração (`Hafele` ou `Blum`).
 * @param {unknown} modelo
 * @returns {boolean}
 */
export function modeloExigeExtracao(modelo) {
  return modelo === 'Hafele' || modelo === 'Blum'
}

/**
 * Verifica se a opção de extração pertence ao catálogo válido do modelo informado.
 * @param {unknown} modelo
 * @param {unknown} extracao
 * @returns {boolean}
 */
export function extracaoValidaParaModelo(modelo, extracao) {
  return (
    typeof extracao === 'string' &&
    typeof modelo === 'string' &&
    Object.hasOwn(EXTRACAO_POR_MODELO, modelo) &&
    EXTRACAO_POR_MODELO[modelo].includes(extracao)
  )
}

/**
 * Resolve o próximo par `{ corredicas, corredicasExtracao }` ao clicar em um modelo.
 * Limpa a subopção apenas quando o modelo muda de fato; preserva ao clicar no modelo já ativo.
 * @param {unknown} modeloAtual
 * @param {unknown} extracaoAtual
 * @param {string} novoModelo
 * @returns {{ corredicas: string, corredicasExtracao: string | null }}
 */
export function resolverAlteracaoCorredicas(modeloAtual, extracaoAtual, novoModelo) {
  if (modeloAtual === novoModelo) {
    return { corredicas: novoModelo, corredicasExtracao: extracaoAtual ?? null }
  }
  return { corredicas: novoModelo, corredicasExtracao: null }
}

/**
 * Descreve o texto de exibição e o destaque da resposta de corrediças,
 * compartilhado entre a Revisão e o PDF do Projetista.
 * @param {Record<string, unknown> | null | undefined} resp
 * @returns {{ texto: string, destaque: boolean, linhas: string[] }}
 */
export function descreverRespostaCorredicas(resp) {
  const modelo = resp?.corredicas
  if (modelo === null || modelo === undefined || modelo === '') {
    return { texto: '—', destaque: false, linhas: [] }
  }
  if (modelo === 'não se aplica') {
    return { texto: 'Não se aplica', destaque: false, linhas: [] }
  }
  if (modeloExigeExtracao(modelo)) {
    const extracao = resp?.corredicasExtracao
    if (extracaoValidaParaModelo(modelo, extracao)) {
      return { texto: `${modelo} — ${extracao}`, destaque: true, linhas: [] }
    }
    return { texto: modelo, destaque: true, linhas: [] }
  }
  return { texto: String(modelo), destaque: false, linhas: [] }
}
