// Empacota o PDF real com o esbuild, carrega na memória e apaga o pacote (Spec, seção 4.3).
import { mkdtempSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { garantirForaDoRepo } from './travas.js'
import { comRelogio, DATA_19_10_2026 } from './relogio.js'

const PASTA_AUXILIARES = path.dirname(fileURLToPath(import.meta.url))
const RAIZ_REPO = path.resolve(PASTA_AUXILIARES, '..', '..')

const pluginCaptura = {
  name: 'captura-pdf',
  setup(build) {
    build.onResolve({ filter: /^jspdf$/ }, () => ({ path: path.join(PASTA_AUXILIARES, 'captura_jspdf.js') }))
    build.onResolve({ filter: /^jspdf-autotable$/ }, () => ({
      path: path.join(PASTA_AUXILIARES, 'captura_autotable.js'),
    }))
  },
}

export async function carregarPdf() {
  let esbuild
  try {
    esbuild = await import('esbuild')
  } catch {
    throw new Error(
      'esbuild não encontrado: rode `npm ci` na raiz do projeto (o esbuild 0.21.5 está em devDependencies)'
    )
  }

  const pasta = mkdtempSync(path.join(os.tmpdir(), 'checklist-testes-'))
  let pacote
  try {
    garantirForaDoRepo(pasta)
    const saida = path.join(pasta, 'pacote_pdf.cjs')
    await esbuild.build({
      entryPoints: [path.join(PASTA_AUXILIARES, 'entrada_pdf.js')],
      bundle: true,
      platform: 'node',
      format: 'cjs',
      outfile: saida,
      logLevel: 'silent',
      absWorkingDir: RAIZ_REPO,
      plugins: [pluginCaptura],
    })
    pacote = createRequire(import.meta.url)(saida)
  } finally {
    rmSync(pasta, { recursive: true, force: true })
  }

  const rodar = async (funcao, estado, data) => {
    pacote.iniciarCaptura()
    await comRelogio(data, () => funcao(estado))
    const captura = pacote.lerCaptura()
    if (captura.saves.length !== 1) {
      throw new Error(`Esperada exatamente uma chamada de save; houve ${captura.saves.length}`)
    }
    return captura
  }

  return {
    cliente: (estado, data = DATA_19_10_2026) => rodar(pacote.gerarPdf, estado, data),
    projetista: (estado, data = DATA_19_10_2026) => rodar(pacote.gerarPdfVendedor, estado, data),
  }
}
