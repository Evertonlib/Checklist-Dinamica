/**
 * Descreve o texto de exibição e o destaque da pergunta de balcões (Grupo A),
 * compartilhado entre a Revisão e o PDF do Projetista.
 * `linhas` traz uma linha por "Sim" das subperguntas (altura e profundidade fora do padrão).
 * @param {Record<string, unknown> | null | undefined} resp
 * @returns {{ texto: string, destaque: boolean, linhas: string[] }}
 */
export function descreverRespostaBalcao(resp) {
  const tipo = resp?.tipoBalcao
  if (tipo === null || tipo === undefined || tipo === '') {
    return { texto: '—', destaque: false, linhas: [] }
  }
  if (tipo === 'não se aplica') {
    return { texto: 'Não se aplica', destaque: false, linhas: [] }
  }
  if (tipo === 'Convencionais') {
    return { texto: 'Convencionais', destaque: false, linhas: [] }
  }
  if (tipo === 'Editados') {
    const linhas = []
    if (resp?.balcaoAlturaForaPadrao === 'Sim') linhas.push('• Altura fora do padrão')
    if (resp?.balcaoProfundidadeForaPadrao === 'Sim') linhas.push('• Profundidade fora do padrão')
    return { texto: 'Editados', destaque: linhas.length > 0, linhas }
  }
  return { texto: String(tipo), destaque: false, linhas: [] }
}
