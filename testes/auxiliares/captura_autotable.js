// Substitui "jspdf-autotable" dentro do pacote (Spec, seção 4.3).
import m from '../../node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.js'
import { registrarTabela, marcarTabela } from './captura_registro.js'

const autoTableReal = (typeof m === 'function' && m) || m.default || m.autoTable

export default function autoTable(doc, opcoes) {
  registrarTabela(opcoes.head[0], opcoes.body)
  marcarTabela(true)
  try {
    return autoTableReal(doc, opcoes)
  } finally {
    marcarTabela(false)
  }
}
