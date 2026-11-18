/**
 * Descreve o texto de exibição e o destaque da pergunta de balcões (Grupo A),
 * compartilhado entre a Revisão e o PDF do Projetista.
 * @param {Record<string, unknown> | null | undefined} resp
 * @returns {{ texto: string, destaque: boolean }}
 */
export function descreverRespostaBalcao(resp) {
  const tipo = resp?.tipoBalcao
  if (tipo === null || tipo === undefined || tipo === '') {
    return { texto: '—', destaque: false }
  }
  if (tipo === 'não se aplica') {
    return { texto: 'Não se aplica', destaque: false }
  }
  if (tipo === 'Convencionais') {
    return { texto: 'Convencionais', destaque: false }
  }
  if (tipo === 'Editados') {
    const alturaSim = resp?.balcaoAlturaForaPadrao === 'Sim'
    const profSim = resp?.balcaoProfundidadeForaPadrao === 'Sim'
    if (alturaSim && profSim) {
      return { texto: 'Editados — altura e profundidade fora do padrão', destaque: true }
    }
    if (alturaSim) {
      return { texto: 'Editados — altura fora do padrão', destaque: true }
    }
    if (profSim) {
      return { texto: 'Editados — profundidade fora do padrão', destaque: true }
    }
    return { texto: 'Editados', destaque: false }
  }
  return { texto: String(tipo), destaque: false }
}
