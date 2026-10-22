// Único lugar com estado da captura do PDF (Spec, seção 4.3). Entra no pacote uma vez só.

let eventos = []
let desenhandoTabela = false
// Linhas quebradas pendentes: { original, linhas, recebidas }
let pendentes = []

export function iniciarCaptura() {
  eventos = []
  desenhandoTabela = false
  pendentes = []
}

export function marcarTabela(ligada) {
  desenhandoTabela = ligada
}

export function registrarTabela(cabecalho, corpo) {
  eventos.push({ tipo: 'tabela', cabecalho: structuredClone(cabecalho), corpo: structuredClone(corpo) })
}

export function registrarQuebra(original, linhas) {
  if (desenhandoTabela) return
  pendentes.push({ original: String(original), linhas: [...linhas].map(String), recebidas: 0 })
}

export function registrarTexto(valor) {
  if (desenhandoTabela) return
  const atual = pendentes[0]
  if (atual && String(valor) === atual.linhas[atual.recebidas]) {
    atual.recebidas += 1
    if (atual.recebidas === atual.linhas.length) {
      pendentes.shift()
      eventos.push({ tipo: 'texto', valor: atual.original })
    }
    return
  }
  eventos.push({ tipo: 'texto', valor: Array.isArray(valor) ? valor.join('\n') : String(valor) })
}

export function registrarLink(url) {
  eventos.push({ tipo: 'link', url })
}

export function registrarSave(nome) {
  eventos.push({ tipo: 'save', nome })
}

export function lerCaptura() {
  if (pendentes.length > 0) {
    const p = pendentes[0]
    throw new Error(
      `Captura com texto quebrado pela metade: "${p.original}" (${p.recebidas} de ${p.linhas.length} linhas escritas)`
    )
  }
  const copia = structuredClone(eventos)
  return {
    eventos: copia,
    textos: copia.filter((e) => e.tipo === 'texto').map((e) => e.valor),
    tabelas: copia.filter((e) => e.tipo === 'tabela'),
    links: copia.filter((e) => e.tipo === 'link').map((e) => e.url),
    saves: copia.filter((e) => e.tipo === 'save').map((e) => e.nome),
  }
}
