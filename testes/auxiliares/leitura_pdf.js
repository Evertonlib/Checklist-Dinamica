// Leitura dos eventos capturados do PDF (Spec, seção 4.7).
import assert from 'node:assert/strict'

// Para sequência e seção valem só textos e tabelas (links e save não quebram a contiguidade).
function conteudo(eventos) {
  return eventos.filter((e) => e.tipo === 'texto' || e.tipo === 'tabela')
}

function descrever(evento) {
  if (!evento) return '(fim)'
  if (evento.tipo === 'tabela') return `[tabela ${JSON.stringify(evento.cabecalho)} ${JSON.stringify(evento.corpo)}]`
  return JSON.stringify(evento.valor)
}

// Elemento do padrão: texto exato (string) | { comeca } | { contem } | { comeca, contem } | { tabela: { cabecalho?, corpo?, cabecalhoComeca? } }
function casa(evento, elemento) {
  if (!evento) return false
  if (typeof elemento === 'string') return evento.tipo === 'texto' && evento.valor === elemento
  if (elemento.tabela) {
    if (evento.tipo !== 'tabela') return false
    const { cabecalho, corpo, cabecalhoComeca } = elemento.tabela
    if (cabecalhoComeca !== undefined && evento.cabecalho[0] !== cabecalhoComeca) return false
    if (cabecalho !== undefined && JSON.stringify(evento.cabecalho) !== JSON.stringify(cabecalho)) return false
    if (corpo !== undefined && JSON.stringify(evento.corpo) !== JSON.stringify(corpo)) return false
    return true
  }
  if (evento.tipo !== 'texto') return false
  if (elemento.comeca !== undefined && !evento.valor.startsWith(elemento.comeca)) return false
  if (elemento.contem !== undefined && !evento.valor.includes(elemento.contem)) return false
  return true
}

// Fatia que começa no texto do nome do ambiente e vai até o nome do próximo ambiente (ou o fim).
export function secao(captura, nome, nomesAmbientes) {
  const lista = conteudo(captura.eventos)
  const inicio = lista.findIndex((e) => e.tipo === 'texto' && e.valor === nome)
  assert.ok(inicio >= 0, `Seção do ambiente "${nome}" não encontrada`)
  const outros = nomesAmbientes.filter((n) => n !== nome)
  let fim = lista.findIndex((e, i) => i > inicio && e.tipo === 'texto' && outros.includes(e.valor))
  if (fim === -1) fim = lista.length
  return { eventos: lista.slice(inicio, fim) }
}

function procurar(eventos, padrao) {
  const lista = conteudo(eventos)
  for (let i = 0; i + padrao.length <= lista.length; i++) {
    if (padrao.every((el, j) => casa(lista[i + j], el))) return { lista, inicio: i }
  }
  return { lista, inicio: -1 }
}

// Afirma uma subsequência contígua; falha mostrando o padrão e o trecho encontrado.
export function sequencia(alvo, padrao) {
  const { lista, inicio } = procurar(alvo.eventos, padrao)
  if (inicio === -1) {
    const primeiro = lista.findIndex((e) => casa(e, padrao[0]))
    const trecho = primeiro === -1 ? lista : lista.slice(primeiro, primeiro + padrao.length + 2)
    assert.fail(
      `Sequência não encontrada.\nPadrão: ${JSON.stringify(padrao)}\nTrecho: ${trecho.map(descrever).join(' | ')}`
    )
  }
  return inicio
}

// Evento logo após a sequência (usado para provar "sem linha de CC").
export function textoSeguinte(alvo, padrao) {
  const inicio = sequencia(alvo, padrao)
  const evento = conteudo(alvo.eventos)[inicio + padrao.length]
  return evento && evento.tipo === 'texto' ? evento.valor : undefined
}

// Afirma que nenhum texto satisfaz a condição: { igual } | { comeca } | { contem }
export function ausencia(alvo, condicao) {
  const textos = conteudo(alvo.eventos).filter((e) => e.tipo === 'texto').map((e) => e.valor)
  const achado = textos.find(
    (t) =>
      (condicao.igual !== undefined && t === condicao.igual) ||
      (condicao.comeca !== undefined && t.startsWith(condicao.comeca)) ||
      (condicao.contem !== undefined && t.includes(condicao.contem))
  )
  assert.equal(achado, undefined, `Texto proibido presente: ${JSON.stringify(achado)} (condição ${JSON.stringify(condicao)})`)
}

// Tabelas da fatia cujo cabeçalho começa com o texto dado
export function tabelasCom(alvo, primeiraColuna) {
  return conteudo(alvo.eventos).filter((e) => e.tipo === 'tabela' && e.cabecalho[0] === primeiraColuna)
}
