// Ida e volta dos dados escondidos no PDF do Cliente (Spec, seção 2).
//
// Formato V1 (contrato com leitores externos em Python — mudou o formato, muda a versão):
//   propriedade "Keywords" do PDF = "V1:" + Base64 de um JSON UTF-8 com SÓ estas quatro chaves.
// Sem score, CCs, avisos nem dados de navegação.

const MARCA = 'V1:'
const PREFIXO_NO_ARQUIVO = `/Keywords (${MARCA}`
const CHAVES = ['identificacao', 'ambientesSelecionados', 'global', 'respostasPorAmbiente']

function ehObjeto(valor) {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor)
}

/** Monta o valor da propriedade Keywords a partir do estado do Cliente (não altera o estado). */
export function montarDadosPdf(state) {
  const dados = {}
  CHAVES.forEach((chave) => {
    dados[chave] = state[chave]
  })

  const bytes = new TextEncoder().encode(JSON.stringify(dados))
  let binario = ''
  bytes.forEach((byte) => {
    binario += String.fromCharCode(byte)
  })
  return MARCA + btoa(binario)
}

/**
 * Lê os dados escondidos de um PDF gerado pelo app.
 * @param {ArrayBuffer|Uint8Array} bytes - conteúdo do arquivo
 * @returns {object|null} as quatro chaves, ou null em qualquer falha (nunca lança exceção)
 */
export function lerDadosPdf(bytes) {
  try {
    const arquivo = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
    // Latin-1: cada byte vira um caractere, sem interpretar o PDF. Só procuramos texto ASCII.
    const texto = new TextDecoder('latin1').decode(arquivo)

    const inicio = texto.indexOf(PREFIXO_NO_ARQUIVO)
    if (inicio === -1) return null

    const resto = texto.slice(inicio + PREFIXO_NO_ARQUIVO.length)
    const base64 = /^[A-Za-z0-9+/]*={0,2}/.exec(resto)[0]
    // O valor termina em ")": arquivo cortado no meio do campo não é aceito.
    if (!base64 || resto[base64.length] !== ')') return null

    const binario = atob(base64)
    const conteudo = new Uint8Array(binario.length)
    for (let i = 0; i < binario.length; i += 1) conteudo[i] = binario.charCodeAt(i)

    const dados = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(conteudo))

    if (
      !ehObjeto(dados) ||
      !ehObjeto(dados.identificacao) ||
      !Array.isArray(dados.ambientesSelecionados) ||
      !ehObjeto(dados.global) ||
      !ehObjeto(dados.respostasPorAmbiente)
    ) {
      return null
    }

    const resultado = {}
    CHAVES.forEach((chave) => {
      resultado[chave] = dados[chave]
    })
    return resultado
  } catch {
    return null
  }
}
