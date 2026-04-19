import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { calcularScore } from '../domain/scoreEngine.js'
import { construirCCs } from '../domain/ccBuilder.js'

const NIVEL_EMOJI = { ALTO: '🔴', MÉDIO: '🟡', BAIXO: '🟢' }
const COR_NIVEL = {
  ALTO:  [220, 53, 69],
  MÉDIO: [255, 193, 7],
  BAIXO: [40, 167, 69],
}

/**
 * Gera e dispara download do PDF.
 * @param {object} state - Estado completo do formulário
 */
export async function gerarPdf(state) {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const { scoreGlobal, scorePorAmbiente, gatilhosAtivados } = calcularScore(state)
  const ccs = construirCCs(state, gatilhosAtivados)
  const hoje = new Date().toLocaleDateString('pt-BR')
  const { nome, contrato } = state.identificacao

  // ── PÁGINA 1: CAPA ──────────────────────────────────────────────────────
  doc.setFont('times', 'bold')
  doc.setFontSize(22)
  doc.text('By Arabi Planejados', 105, 40, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.text('Checklist de Liberação de Projeto', 105, 52, { align: 'center' })

  doc.setDrawColor(180, 150, 80)
  doc.setLineWidth(0.5)
  doc.line(20, 58, 190, 58)

  doc.setFontSize(12)
  doc.text(`Cliente: ${nome}`, 20, 70)
  doc.text(`Contrato: ${contrato}`, 20, 80)
  doc.text(`Data: ${hoje}`, 20, 90)

  // Score badge
  const [r, g, b] = COR_NIVEL[scoreGlobal.classificacao]
  doc.setFillColor(r, g, b)
  doc.roundedRect(20, 100, 170, 20, 4, 4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(
    `${NIVEL_EMOJI[scoreGlobal.classificacao]} RISCO ${scoreGlobal.classificacao} — ${scoreGlobal.pontos} pontos`,
    105, 113, { align: 'center' }
  )
  doc.setTextColor(0, 0, 0)

  // ── PÁGINA 2: RESUMO EXECUTIVO ───────────────────────────────────────────
  doc.addPage()
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Resumo Executivo', 20, 20)
  doc.setLineWidth(0.3)
  doc.line(20, 24, 190, 24)

  let y = 32
  const margin = 20
  const largura = 170

  const ccsAlto  = ccs.filter((c) => c.tipo === 'CC' && c.nivel === 'ALTO')
  const ccsMedio = ccs.filter((c) => c.tipo === 'CC' && c.nivel === 'MÉDIO')
  const ccsBaixo = ccs.filter((c) => c.tipo === 'CC' && c.nivel === 'BAIXO')

  const escreverCC = (cc, cor) => {
    const ambLabel = cc.escopo === 'Global'
      ? 'Global'
      : (state.ambientesSelecionados.find((a) => a.instanceId === cc.escopo)?.nome ||
         state.ambientesSelecionados.find((a) => a.instanceId === cc.escopo)?.label || cc.escopo)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...cor)
    doc.setFontSize(10)
    doc.text(`${NIVEL_EMOJI[cc.nivel]} RISCO ${cc.nivel} — ${ambLabel}`, margin, y)
    doc.setTextColor(0, 0, 0)
    y += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const linhas = doc.splitTextToSize(`   ${cc.textoCompleto}`, largura)
    linhas.forEach((l) => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.text(l, margin, y)
      y += 5
    })
    y += 3
  }

  ccsAlto.forEach((cc) => escreverCC(cc, COR_NIVEL.ALTO))
  ccsMedio.forEach((cc) => escreverCC(cc, COR_NIVEL.MÉDIO))

  if (ccsBaixo.length > 0) {
    if (y > 265) { doc.addPage(); y = 20 }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...COR_NIVEL.BAIXO)
    doc.text('🟢 BAIXOS:', margin, y)
    doc.setTextColor(0, 0, 0)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const textoBaixos = ccsBaixo.map((c) => {
      const amb = c.escopo === 'Global' ? 'Global' :
        (state.ambientesSelecionados.find((a) => a.instanceId === c.escopo)?.nome ||
         state.ambientesSelecionados.find((a) => a.instanceId === c.escopo)?.label || c.escopo)
      return `[${amb}] ${c.textoCompleto}`
    }).join(' | ')
    const linhasBaixo = doc.splitTextToSize(textoBaixos, largura)
    linhasBaixo.forEach((l) => {
      if (y > 270) { doc.addPage(); y = 20 }
      doc.text(l, margin, y)
      y += 5
    })
  }

  // ── PÁGINAS SEGUINTES: CHECKLIST POR AMBIENTE ────────────────────────────
  for (const instancia of state.ambientesSelecionados) {
    doc.addPage()
    const { instanceId, label, formType } = instancia
    const nomeAmb = instancia.nome || label
    const resp = state.respostasPorAmbiente[instanceId] || {}
    const score = scorePorAmbiente[instanceId]
    const ccsAmb = ccs.filter((c) => c.escopo === instanceId)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(nomeAmb, margin, 20)

    if (score) {
      const [cr, cg, cb] = COR_NIVEL[score.classificacao]
      doc.setTextColor(cr, cg, cb)
      doc.setFontSize(10)
      doc.text(`${NIVEL_EMOJI[score.classificacao]} ${score.classificacao} (${score.pontos} pts)`, margin, 28)
      doc.setTextColor(0, 0, 0)
    }

    doc.line(margin, 32, 190, 32)
    let ay = 38

    const linha = (rotulo, valor) => {
      if (ay > 270) { doc.addPage(); ay = 20 }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.text(`${rotulo}:`, margin, ay)
      doc.setFont('helvetica', 'normal')
      const linhas = doc.splitTextToSize(String(valor ?? '—'), 130)
      doc.text(linhas, 70, ay)
      ay += linhas.length * 5 + 2
    }

    const ccInline = (id) => {
      const cc = ccsAmb.find((c) => c.id === id)
      if (!cc) return
      if (ay > 265) { doc.addPage(); ay = 20 }
      const cor = cc.nivel ? COR_NIVEL[cc.nivel] : [100, 100, 100]
      doc.setTextColor(...cor)
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      const ls = doc.splitTextToSize(`   ↳ ${cc.tipo}: ${cc.textoCompleto}`, largura)
      ls.forEach((l) => { doc.text(l, margin, ay); ay += 4.5 })
      doc.setTextColor(0, 0, 0)
      ay += 2
    }

    // Renderização por formType
    if (['cozinha', 'banheiro', 'outros'].includes(formType)) {
      linha('Granito/Pia existente', resp.granito === true ? 'Sim' : resp.granito === false ? 'Não' : '—')
      if (resp.granito === true) {
        linha('Móveis adaptados ao granito', resp.granitoadaptar === true ? 'Sim' : 'Não')
        ccInline(`GRANITO_RETIRAR_${instanceId}`)
      }
    }

    if (['cozinha', 'outros'].includes(formType)) {
      linha('Tanque existente', resp.tanque === true ? 'Sim' : resp.tanque === false ? 'Não' : '—')
      if (resp.tanque === true) {
        linha('Haverá móveis na região do tanque', resp.tanqueMoveis === true ? 'Sim' : 'Não')
        ccInline(`TANQUE_RETIRAR_${instanceId}`)
      }
    }

    if (['dormitorio', 'home', 'outros'].includes(formType)) {
      linha('TV no ambiente', resp.tv === true ? 'Sim' : resp.tv === false ? 'Não' : '—')
      if (resp.tv === true) {
        linha('Ponto elétrico na posição final', resp.tvPontoFinal === true ? 'Sim' : 'Não')
        ccInline(`TV_PONTO_${instanceId}`)
        linha('Polegadas', resp.tv_polegadas ?? '—')
        if (resp.tv_modelo) linha('Modelo', resp.tv_modelo)
        if (resp.tv_largura_cm) linha('Largura (cm)', resp.tv_largura_cm)
        if (resp.tv_altura_cm) linha('Altura (cm)', resp.tv_altura_cm)
        if (resp.tv_profundidade_cm) linha('Profundidade (cm)', resp.tv_profundidade_cm)
        if (resp.tv_link) linha('Link', resp.tv_link)
      }
    }

    if (['dormitorio', 'outros'].includes(formType)) {
      linha('Tamanho da cama', resp.tamanhoCama ?? '—')
      if (resp.tamanhoCama === 'outro') {
        linha('Largura (cm)', resp.camaLargura_cm)
        linha('Comprimento (cm)', resp.camaComprimento_cm)
      }
    }

    if (['dormitorio', 'home', 'outros'].includes(formType)) {
      linha('Cortineiro', resp.cortineiro === true ? 'Sim' : resp.cortineiro === false ? 'Não' : '—')
      if (resp.cortineiro === true) {
        linha('Cortineiro instalado', resp.cortieneiroInstalado === true ? 'Sim' : 'Não')
        ccInline(`CORTINEIRO_NAOINSTALADO_${instanceId}`)
      }
      linha('Rodapé existente', resp.rodape === true ? 'Sim' : resp.rodape === false ? 'Não' : '—')
      ccInline(`RODAPE_EXISTENTE_${instanceId}`)
      ccInline(`RODAPE_AUSENTE_${instanceId}`)
    }

    if (['cozinha', 'outros'].includes(formType)) {
      linha('Eletrodomésticos definidos', resp.eletrosDefined === true ? 'Sim' : resp.eletrosDefined === false ? 'Não' : '—')
      ccInline(`ELETROS_NAODEF_${instanceId}`)
      if (resp.eletrosDefined === true && resp.eletros?.length > 0) {
        resp.eletros.forEach((el, i) => {
          linha(`Eletro ${i + 1}`, `${el.tipo}${el.subtipo ? ' — ' + el.subtipo : ''}`)
          if (el.modelo) linha('  Modelo', el.modelo)
          if (el.largura_cm) linha('  Largura (cm)', el.largura_cm)
          if (el.altura_cm) linha('  Altura (cm)', el.altura_cm)
          if (el.profundidade_cm) linha('  Profundidade (cm)', el.profundidade_cm)
          if (el.link) linha('  Link', el.link)
        })
      }
    }

    if (['home', 'outros'].includes(formType)) {
      linha('Eletrônicos definidos', resp.eletronicos === true ? 'Sim' : resp.eletronicos === false ? 'Não' : '—')
      ccInline(`ELETRONICOS_NAODEF_${instanceId}`)
      if (resp.eletronicos === true && resp.eletronicosList?.length > 0) {
        resp.eletronicosList.forEach((el, i) => {
          linha(`Eletrônico ${i + 1}`, `${el.tipo}${el.modelo ? ' — ' + el.modelo : ''}`)
          if (el.largura_cm) linha('  Largura (cm)', el.largura_cm)
          if (el.altura_cm) linha('  Altura (cm)', el.altura_cm)
          if (el.link) linha('  Link', el.link)
        })
      }
    }

    if (formType === 'banheiro' || formType === 'outros') {
      linha('Tipo de cuba', resp.cuba ?? '—')
    }

    // Rebaixo global no ambiente
    const g4amb = state.global.g4_ambientes.find((a) => a.instanceId === instanceId)
    if (g4amb) {
      linha('Rebaixo de teto', `${g4amb.cm ?? '?'} cm`)
      ccInline(`REBAIXO_${instanceId}`)
    }

    if (resp.observacoes) {
      linha('Observações', resp.observacoes)
    }
  }

  // Nome do arquivo
  const dataStr = new Date().toISOString().slice(0, 10)
  doc.save(`Checklist_ByArabi_${contrato}_${dataStr}.pdf`)
}
