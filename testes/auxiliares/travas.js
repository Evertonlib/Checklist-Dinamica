// Travas do ambiente da suíte (Spec, seção 4.4). Todo arquivo de grupo importa este arquivo primeiro.
import { realpathSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Raiz do repositório: duas pastas acima deste arquivo. Sempre por fileURLToPath (espaço e "~" no caminho).
const RAIZ_REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

// --- Rede ---
const chamadasRede = []

globalThis.fetch = (...args) => {
  chamadasRede.push(String(args[0]))
  throw new Error('REDE PROIBIDA NA SUÍTE')
}

export function assertSemRede() {
  if (chamadasRede.length > 0) {
    throw new Error(`REDE PROIBIDA NA SUÍTE: houve ${chamadasRede.length} tentativa(s): ${chamadasRede.join(', ')}`)
  }
}

// --- localStorage ---
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  get() {
    throw new Error('localStorage PROIBIDO NA SUÍTE')
  },
})

// --- Pasta de saída ---
function caminhoReal(caminho) {
  const real = path.resolve(realpathSync.native(caminho))
  // No Windows o sistema de arquivos não diferencia maiúsculas de minúsculas
  return process.platform === 'win32' ? real.toLowerCase() : real
}

export function garantirForaDoRepo(caminho) {
  const alvo = caminhoReal(caminho)
  const raiz = caminhoReal(RAIZ_REPO)
  if (alvo === raiz || alvo.startsWith(raiz + path.sep)) {
    throw new Error(`Pasta de saída dentro do repositório (proibido): ${caminho}`)
  }
}
