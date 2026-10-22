// Substitui "jspdf" dentro do pacote (Spec, seção 4.3): cria a instância REAL e troca quatro métodos nela.
import m from '../../node_modules/jspdf/dist/jspdf.node.min.js'
import { registrarTexto, registrarQuebra, registrarLink, registrarSave } from './captura_registro.js'

const JsPDFReal = m.jsPDF || (m.default && m.default.jsPDF) || m

function fabricante(...args) {
  const doc = new JsPDFReal(...args)

  // Guarda de reentrada: chamadas internas da própria biblioteca não viram evento.
  let profundidade = 0
  const embrulhar = (nome, depois) => {
    const original = doc[nome].bind(doc)
    doc[nome] = (...a) => {
      profundidade += 1
      try {
        const resultado = original(...a)
        if (profundidade === 1) depois(a, resultado)
        return resultado
      } finally {
        profundidade -= 1
      }
    }
  }

  embrulhar('text', (a) => registrarTexto(a[0]))
  embrulhar('splitTextToSize', (a, linhas) => registrarQuebra(a[0], linhas))
  embrulhar('link', (a) => registrarLink(a[4] && a[4].url))

  // save não grava nada: só registra o nome do arquivo
  doc.save = (nome) => {
    registrarSave(nome)
    return doc
  }

  return doc
}

// O plugin do autotable procura API na classe (O-6)
fabricante.API = JsPDFReal.API

export { fabricante as jsPDF }
export default fabricante
