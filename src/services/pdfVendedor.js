import jsPDF from 'jspdf'
import { formatarNomeAmbiente } from '../domain/ambientes.js'
import { obterGrupo } from '../domain/gruposPerguntasVendedor.js'
import { descreverRespostaBalcao } from '../domain/respostaBalcaoVendedor.js'
import { descreverRespostaCorredicas } from '../domain/corredicasVendedor.js'
import { descreverRespostaPuxadores } from '../domain/puxadoresVendedor.js'

const COR_ALERTA = [180, 0, 0] // mesma cor do risco ALTO do PDF do Cliente (pdf.js:12)

function formatarDataLocal(data) {
  return data.toLocaleDateString('pt-BR')
}

function formatarDataArquivo(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

const PERGUNTAS_POR_GRUPO = {
  A: [
    { campo: 'alturaBalcao_mm', label: 'Altura do piso — balcões', tipo: 'altura' },
    { campo: 'alturaArmario_mm', label: 'Altura do piso — armários', tipo: 'altura' },
    { campo: 'tipoBalcao', label: 'Balcões convencionais ou editados', tipo: 'balcao' },
    { campo: 'fechamentoTeto', label: 'Fechamento até o teto', tipo: 'fechamento' },
    { campo: 'caixaria', label: 'Caixarias ou corpos', tipo: 'texto' },
    { campo: 'dobradicas', label: 'Dobradiças', tipo: 'texto' },
    { campo: 'corredicas', label: 'Corrediças', tipo: 'corredicas' },
    { campo: 'temPuxador', label: 'Puxadores', tipo: 'puxadores' },
  ],
  B: [
    { campo: 'caixaria', label: 'Caixarias ou corpos', tipo: 'texto' },
    { campo: 'dobradicas', label: 'Dobradiças', tipo: 'texto' },
    { campo: 'corredicas', label: 'Corrediças', tipo: 'corredicas' },
    { campo: 'fechamentoTeto', label: 'Fechamento até o teto', tipo: 'fechamento' },
    { campo: 'temPuxador', label: 'Puxadores', tipo: 'puxadores' },
  ],
  C: [
    { campo: 'caixaria', label: 'Caixarias ou corpos', tipo: 'texto' },
    { campo: 'dobradicas', label: 'Dobradiças', tipo: 'texto' },
    { campo: 'corredicas', label: 'Corrediças', tipo: 'corredicas' },
    { campo: 'temPuxador', label: 'Puxadores', tipo: 'puxadores' },
  ],
}

function formatarResposta(item, valor) {
  if (valor === null || valor === undefined) return '—'
  if (valor === 'não se aplica') return 'Não se aplica'
  if (item.tipo === 'altura') return `${valor} mm`
  if (item.tipo === 'fechamento') return valor === 'SIM' ? 'SIM' : 'NÃO'
  return valor
}

/**
 * Gera e dispara download do PDF do Projetista.
 * @param {object} state - Estado completo do formulário do Projetista
 */
export async function gerarPdfVendedor(state) {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const agora = new Date()
  const dataCapa = formatarDataLocal(agora)
  const dataArquivo = formatarDataArquivo(agora)
  const { nome, contratos } = state.identificacao
  const contratosPreenchidos = contratos.filter(Boolean)

  const margemEsquerda = 20
  const margemDireita = 20
  const margemSuperior = 20
  const margemInferior = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const larguraConteudo = pageWidth - margemEsquerda - margemDireita

  doc.setFont('times', 'bold')
  doc.setFontSize(22)
  doc.text('By Arabi Planejados', pageWidth / 2, 40, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.text('Checklist do Projetista', pageWidth / 2, 52, { align: 'center' })

  doc.setDrawColor(180, 150, 80)
  doc.setLineWidth(0.5)
  doc.line(margemEsquerda, 58, pageWidth - margemDireita, 58)

  doc.setFontSize(12)
  doc.text(`Cliente: ${nome}`, margemEsquerda, 72)
  doc.text(`Contrato(s): ${contratosPreenchidos.join(', ') || '—'}`, margemEsquerda, 82)
  doc.text(`Data: ${dataCapa}`, margemEsquerda, 92)

  let y = 110

  const garantirEspaco = (alturaNecessaria = 8) => {
    if (y + alturaNecessaria <= pageHeight - margemInferior) return
    doc.addPage()
    y = margemSuperior
  }

  const escreverLinhas = (linhas, x, incremento = 5) => {
    linhas.forEach((linha) => {
      garantirEspaco(incremento)
      doc.text(linha, x, y)
      y += incremento
    })
  }

  const escreverPergunta = (pergunta, resposta, destaque = false, linhasExtras = []) => {
    garantirEspaco(14)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    if (destaque) doc.setTextColor(...COR_ALERTA)
    else doc.setTextColor(0, 0, 0)
    escreverLinhas(doc.splitTextToSize(pergunta, larguraConteudo), margemEsquerda, 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    escreverLinhas(doc.splitTextToSize(`Resposta: ${resposta}`, larguraConteudo), margemEsquerda, 4.5)
    for (const extra of linhasExtras) {
      escreverLinhas(doc.splitTextToSize(extra, larguraConteudo - 5), margemEsquerda + 5, 4.5)
    }
    y += 2
    doc.setTextColor(0, 0, 0)
  }

  state.ambientesSelecionados.forEach((instancia, index) => {
    const { instanceId } = instancia
    const grupo = obterGrupo(instancia.tipo)
    const resp = state.respostasPorAmbiente[instanceId] || {}

    garantirEspaco(18)

    if (index > 0) {
      doc.setDrawColor(180, 150, 80)
      doc.setLineWidth(0.5)
      doc.line(margemEsquerda, y, pageWidth - margemDireita, y)
      y += 5
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(formatarNomeAmbiente(instancia), margemEsquerda, y)
    y += 6

    doc.setLineWidth(0.3)
    doc.line(margemEsquerda, y, pageWidth - margemDireita, y)
    y += 7

    for (const item of PERGUNTAS_POR_GRUPO[grupo]) {
      if (item.tipo === 'balcao') {
        const { texto, destaque, linhas } = descreverRespostaBalcao(resp)
        escreverPergunta(item.label, texto, destaque, linhas)
      } else if (item.tipo === 'corredicas') {
        const { texto, destaque, linhas } = descreverRespostaCorredicas(resp)
        escreverPergunta(item.label, texto, destaque, linhas)
      } else if (item.tipo === 'puxadores') {
        const { texto, destaque, linhas } = descreverRespostaPuxadores(resp)
        escreverPergunta(item.label, texto, destaque, linhas)
      } else {
        escreverPergunta(item.label, formatarResposta(item, resp[item.campo]))
      }
    }

    if (resp.observacoes) {
      escreverPergunta('Observações do ambiente', resp.observacoes)
    }
  })

  const primeiroContrato = contratosPreenchidos[0] || 'SEMCONTRATO'
  doc.save(`Checklist_Projetista_${primeiroContrato}_${dataArquivo}.pdf`)
}
