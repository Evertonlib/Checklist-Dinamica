import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatarNomeAmbiente } from '../domain/ambientes.js'
import { calcularScore } from '../domain/scoreEngine.js'
import { construirCCs } from '../domain/ccBuilder.js'

const NIVEL_MEDIO = 'M\u00c9DIO'

const COR_NIVEL = {
  ALTO: [180, 0, 0],
  [NIVEL_MEDIO]: [200, 120, 0],
  BAIXO: [0, 130, 0],
}

function formatarDataLocal(data) {
  return data.toLocaleDateString('pt-BR')
}

function formatarDataArquivo(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

function formatarListaAmbientes(ambientes, instanceIds, vazio = 'Nenhum') {
  if (!instanceIds?.length) return vazio

  return instanceIds
    .map((instanceId) => ambientes.find((ambiente) => ambiente.instanceId === instanceId))
    .filter(Boolean)
    .map((ambiente) => formatarNomeAmbiente(ambiente))
    .join(', ')
}

function formatarListaRebaixo(ambientes, rebaixos) {
  if (!rebaixos?.length) return 'Nenhum'

  return rebaixos
    .map((item) => {
      const ambiente = ambientes.find((amb) => amb.instanceId === item.instanceId)
      const nome = ambiente ? formatarNomeAmbiente(ambiente) : item.instanceId
      return `${nome} (${item.cm} cm)`
    })
    .join(', ')
}

function descreverEletro(eletro) {
  const partes = [eletro.tipo]

  if (eletro.descricao) {
    partes.push(eletro.descricao)
  }
  if (eletro.subtipo) {
    partes.push(eletro.subtipo)
  }

  return partes.join(' — ')
}

function descreverEletronico(eletronico) {
  const partes = [eletronico.tipo]

  if (eletronico.subtipo) {
    partes.push(eletronico.subtipo)
  }
  if (eletronico.tipo === 'TV' && eletronico.polegadas) {
    partes.push(`${eletronico.polegadas}"`)
  }

  return partes.join(' — ')
}

/**
 * Gera e dispara download do PDF.
 * @param {object} state - Estado completo do formulário
 */
export async function gerarPdf(state) {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const { scoreGlobal, scorePorAmbiente, gatilhosAtivados } = calcularScore(state)
  const ccs = construirCCs(state, gatilhosAtivados)
  const agora = new Date()
  const dataCapa = formatarDataLocal(agora)
  const dataArquivo = formatarDataArquivo(agora)
  const { nome, contrato, logradouro, numero, complemento, bairro, cidade, uf, telefone } = state.identificacao

  const margemEsquerda = 20
  const margemDireita = 20
  const margemSuperior = 20
  const margemInferior = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const larguraConteudo = pageWidth - margemEsquerda - margemDireita

  const ccPorId = new Map(ccs.map((cc) => [cc.id, cc]))

  doc.setFont('times', 'bold')
  doc.setFontSize(22)
  doc.text('By Arabi Planejados', pageWidth / 2, 40, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.text('Checklist de Liberação de Projeto', pageWidth / 2, 52, { align: 'center' })

  doc.setDrawColor(180, 150, 80)
  doc.setLineWidth(0.5)
  doc.line(margemEsquerda, 58, pageWidth - margemDireita, 58)

  doc.setFontSize(12)
  doc.text(`Cliente: ${nome}`, margemEsquerda, 72)
  doc.text(`Contrato: ${contrato}`, margemEsquerda, 82)

  const linhaEndereco1 = [logradouro, numero].filter(Boolean).join(', ') + (complemento ? ` — ${complemento}` : '')
  const linhaEndereco2 = [bairro, cidade && uf ? `${cidade}/${uf}` : cidade || uf].filter(Boolean).join(' — ')
  let yEndereco = 92
  if (linhaEndereco1) { doc.text(linhaEndereco1, margemEsquerda, yEndereco); yEndereco += 10 }
  if (linhaEndereco2) { doc.text(linhaEndereco2, margemEsquerda, yEndereco); yEndereco += 10 }
  if (telefone) { doc.text(`Telefone: ${telefone}`, margemEsquerda, yEndereco); yEndereco += 10 }

  doc.text(`Data: ${dataCapa}`, margemEsquerda, yEndereco)
  yEndereco += 18

  const corScoreCapa = COR_NIVEL[scoreGlobal.classificacao]
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Classificação de risco global:', margemEsquerda, yEndereco)
  doc.setTextColor(...corScoreCapa)
  doc.text(`RISCO ${scoreGlobal.classificacao}`, margemEsquerda, yEndereco + 12)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')

  let y = yEndereco + 26

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

  const escreverTituloSecao = (titulo) => {
    garantirEspaco(12)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text(titulo, margemEsquerda, y)
    y += 4
    doc.setLineWidth(0.3)
    doc.line(margemEsquerda, y, pageWidth - margemDireita, y)
    y += 8
  }

  const escreverInline = (item) => {
    const cor = item.nivel ? COR_NIVEL[item.nivel] : [90, 90, 90]
    const texto = item.tipo === 'CC' ? `CC: ${item.textoCompleto}` : item.textoCompleto

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8.5)
    doc.setTextColor(...cor)
    escreverLinhas(doc.splitTextToSize(texto, larguraConteudo - 4), margemEsquerda + 4, 4.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    y += 1
  }

  const escreverPergunta = (pergunta, resposta, itensRelacionados = []) => {
    garantirEspaco(14)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    escreverLinhas(doc.splitTextToSize(pergunta, larguraConteudo), margemEsquerda, 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    escreverLinhas(doc.splitTextToSize(`Resposta: ${resposta ?? '—'}`, larguraConteudo), margemEsquerda, 4.5)

    itensRelacionados.filter(Boolean).forEach((item) => escreverInline(item))
    y += 2
  }

  const GATILHO_TEXTO = {
    GRANITO_RETIRAR:         'Remover granito',
    TANQUE_RETIRAR:          'Remover tanque',
    ELETROS_NAODEF:          'Eletros indefinidos',
    ELETRONICOS_NAODEF:      'Eletrônicos indefinidos',
    TV_PONTO:                'Ponto fora do painel',
    CORTINEIRO_NAOINSTALADO: 'Cortineiro 150mm',
    RODAPE_AUSENTE:          'Instalar rodapé pós-montagem',
    RODAPE_EXISTENTE:        'Roupeiro sobre rodapé',
    REFORM_SEM_REVESTIMENTO: 'Sem revestimento',
    ILUMINACAO_EXTERNA:      'Iluminação por conta do cliente',
    REFORM_SEM_REBOCO:       'Reboco inacabado',
    PONTOS_INDEFINIDOS:      'Pontos pendentes',
    REBAIXO:                 null, // texto gerado dinamicamente por ambiente
  }

  const textoCurtoGatilho = (gatilhoId, instanceId) => {
    const prefixo = gatilhoId.replace(`_${instanceId}`, '')
    if (prefixo === 'REBAIXO') {
      const cm = (state.global.g4_ambientes ?? []).find((a) => a.instanceId === instanceId)?.cm ?? '?'
      return `Rebaixo de ${cm}cm`
    }
    return GATILHO_TEXTO[prefixo] ?? null
  }

  const linhasTabela = state.ambientesSelecionados
    .filter((instancia) => {
      const score = scorePorAmbiente[instancia.instanceId]
      return score && score.gatilhos.length > 0
    })
    .map((instancia) => {
      const { instanceId } = instancia
      const score = scorePorAmbiente[instanceId]
      const textos = score.gatilhos
        .map((id) => textoCurtoGatilho(id, instanceId))
        .filter(Boolean)
      if (ccs.some((c) => c.id === `RODAPE_EXISTENTE_${instanceId}`)) {
        textos.push('Roupeiro sobre rodapé')
      }
      const acoes = textos.join(' — ')
      return [formatarNomeAmbiente(instancia), acoes, score.classificacao]
    })

  escreverTituloSecao('Resumo Executivo')

  if (linhasTabela.length > 0) {
    autoTable(doc, {
      startY: y,
      margin: { left: margemEsquerda, right: margemDireita },
      tableWidth: larguraConteudo,
      head: [['Ambiente', 'Ações e pontos de atenção', 'Risco']],
      body: linhasTabela,
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 100 },
        2: { cellWidth: 15 },
      },
      styles: { cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.2, overflow: 'linebreak' },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [0, 0, 0] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          const cor = COR_NIVEL[data.cell.raw]
          if (cor) data.cell.styles.textColor = cor
        }
      },
    })
    y = doc.lastAutoTable.finalY + 10
  }

  escreverTituloSecao('Checklist Completa')

  const { global } = state

  const PERGUNTAS_GLOBAIS = ['G1', 'G2', 'G3', 'G4', 'G5']

  const textoPerguntaGlobal = (origem) => {
    const textos = {
      G1: 'G1 — O projeto terá alguma iluminação embutida na marcenaria adquirida externamente à By Arabi? (fitas de LED, spots, etc.)',
      G2: 'G2 — Todos os ambientes já possuem reboco (argamassa) finalizado nas paredes?',
      G3: 'G3 — Todos os ambientes já possuem revestimento final (azulejo, porcelanato etc.) aplicado nas paredes?',
      G4: 'G4 — Os pontos elétricos/hidráulicos/gás já estão nas posições finais em todos os ambientes?',
      G5: 'G5 — Algum ambiente terá rebaixo de teto?',
    }
    return textos[origem]
  }

  const respostaGlobalPorAmbiente = (origem, instanceId) => {
    if (origem === 'G5') {
      const cm = (global.g4_ambientes ?? []).find((item) => item.instanceId === instanceId)?.cm ?? '?'
      return `Sim — ${cm} cm`
    }
    const respostas = { G1: 'Sim', G2: 'Não', G3: 'Não', G4: 'Não' }
    return respostas[origem]
  }

  state.ambientesSelecionados.forEach((instancia, index) => {
    const { instanceId, formType } = instancia
    const resp = state.respostasPorAmbiente[instanceId] || {}
    const score = scorePorAmbiente[instanceId]

    garantirEspaco(18)

    if (index > 0) {
      doc.setDrawColor(180, 150, 80)
      doc.setLineWidth(0.5)
      doc.line(margemEsquerda, y, pageWidth - margemDireita, y)
      y += 5
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(0, 0, 0)
    doc.text(formatarNomeAmbiente(instancia), margemEsquerda, y)
    y += 6

    if (score) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...COR_NIVEL[score.classificacao])
      doc.text(`RISCO ${score.classificacao} (${score.pontos} pts)`, margemEsquerda, y)
      y += 5
    }

    doc.setTextColor(0, 0, 0)
    if (index === 0) {
      doc.setLineWidth(0.3)
      doc.line(margemEsquerda, y, pageWidth - margemDireita, y)
    }
    y += 7

    for (const origem of PERGUNTAS_GLOBAIS) {
      const cc = ccs.find((c) => c.perguntaOrigem === origem && c.escopo === instanceId)
      if (!cc) continue
      escreverPergunta(
        textoPerguntaGlobal(origem),
        respostaGlobalPorAmbiente(origem, instanceId),
        [cc]
      )
    }

    if (['cozinha', 'banheiro', 'outros'].includes(formType)) {
      escreverPergunta(
        'Existe granito ou pia existente no local?',
        resp.granito === true ? 'Sim' : resp.granito === false ? 'Não' : '—'
      )
      if (resp.granito === true) {
        escreverPergunta(
          'Os móveis serão adaptados?',
          resp.granitoadaptar === true ? 'Sim' : resp.granitoadaptar === false ? 'Não' : '—',
          [ccPorId.get(`GRANITO_RETIRAR_${instanceId}`)]
        )
      }
    }

    if (['cozinha', 'outros'].includes(formType)) {
      escreverPergunta(
        'Existe tanque no local?',
        resp.tanque === true ? 'Sim' : resp.tanque === false ? 'Não' : '—'
      )
      if (resp.tanque === true) {
        escreverPergunta(
          'Haverá móveis na região do tanque?',
          resp.tanqueMoveis === true ? 'Sim' : resp.tanqueMoveis === false ? 'Não' : '—',
          [ccPorId.get(`TANQUE_RETIRAR_${instanceId}`)]
        )
      }
    }

    if (['dormitorio', 'home', 'outros'].includes(formType)) {
      escreverPergunta(
        'Terá TV neste ambiente?',
        resp.tv === true ? 'Sim' : resp.tv === false ? 'Não' : '—'
      )
      if (resp.tv === true) {
        escreverPergunta(
          'O ponto elétrico da TV já está na posição final?',
          resp.tvPontoFinal === true ? 'Sim' : resp.tvPontoFinal === false ? 'Não' : '—',
          [ccPorId.get(`TV_PONTO_${instanceId}`)]
        )
        escreverPergunta('Polegadas', resp.tv_polegadas ?? '—')
        if (resp.tv_modelo) escreverPergunta('Modelo', resp.tv_modelo)
        if (resp.tv_largura_cm) escreverPergunta('Largura (cm)', resp.tv_largura_cm)
        if (resp.tv_altura_cm) escreverPergunta('Altura (cm)', resp.tv_altura_cm)
        if (resp.tv_profundidade_cm) escreverPergunta('Profundidade (cm)', resp.tv_profundidade_cm)
        if (resp.tv_link) escreverPergunta('Link', resp.tv_link)
      }
    }

    if (['dormitorio', 'outros'].includes(formType)) {
      escreverPergunta('Qual o tamanho da cama neste ambiente?', resp.tamanhoCama ?? '—')
      if (resp.tamanhoCama === 'outro') {
        escreverPergunta('Largura (cm)', resp.camaLargura_cm ?? '—')
        escreverPergunta('Comprimento (cm)', resp.camaComprimento_cm ?? '—')
      }
    }

    if (['dormitorio', 'home', 'outros'].includes(formType)) {
      escreverPergunta(
        'Haverá cortineiro neste ambiente?',
        resp.cortineiro === true ? 'Sim' : resp.cortineiro === false ? 'Não' : '—'
      )
      if (resp.cortineiro === true) {
        escreverPergunta(
          'O cortineiro já está instalado?',
          resp.cortieneiroInstalado === true ? 'Sim' : resp.cortieneiroInstalado === false ? 'Não' : '—',
          [ccPorId.get(`CORTINEIRO_NAOINSTALADO_${instanceId}`)]
        )
      }

      escreverPergunta(
        'Existe rodapé na região dos móveis?',
        resp.rodape === true ? 'Sim' : resp.rodape === false ? 'Não' : '—',
        [ccPorId.get(`RODAPE_EXISTENTE_${instanceId}`), ccPorId.get(`RODAPE_AUSENTE_${instanceId}`)]
      )
    }

    if (['cozinha', 'outros'].includes(formType)) {
      escreverPergunta(
        'Já possui ou tem intenção de compra específica dos eletrodomésticos?',
        resp.eletrosDefined === true ? 'Sim' : resp.eletrosDefined === false ? 'Não' : '—',
        [ccPorId.get(`ELETROS_NAODEF_${instanceId}`)]
      )

      if (resp.eletrosDefined === true && resp.eletros?.length > 0) {
        escreverTituloSecao('Eletrodomésticos')
        garantirEspaco(20)
        const eletrosBody = resp.eletros.map((eletro) => [
          descreverEletro(eletro) || '—',
          eletro.modelo || '—',
          eletro.largura_cm || '—',
          eletro.altura_cm || '—',
          eletro.profundidade_cm || '—',
          eletro.link ? 'Ver link' : '—',
        ])
        const eletrosUrls = resp.eletros.map((eletro) => eletro.link || null)
        autoTable(doc, {
          startY: y,
          margin: { left: margemEsquerda, right: margemDireita },
          tableWidth: larguraConteudo,
          head: [['Tipo', 'Modelo', 'Largura (cm)', 'Altura (cm)', 'Prof. (cm)', 'Link']],
          body: eletrosBody,
          columnStyles: {
            0: { cellWidth: 55 },
            1: { cellWidth: 40 },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: 22 },
            5: { cellWidth: 13 },
          },
          styles: { cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.2 },
          headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 9, textColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 5 && data.cell.raw === 'Ver link') {
              const url = eletrosUrls[data.row.index]
              if (url) doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url })
            }
          },
        })
        y = doc.lastAutoTable.finalY + 4
      }
    }

    if (['home', 'outros'].includes(formType)) {
      escreverPergunta(
        'Possui ou pretende adquirir eletrônicos para este ambiente?',
        resp.eletronicos === true ? 'Sim' : resp.eletronicos === false ? 'Não' : '—',
        [ccPorId.get(`ELETRONICOS_NAODEF_${instanceId}`)]
      )

      if (resp.eletronicos === true && resp.eletronicosList?.length > 0) {
        escreverTituloSecao('Eletrônicos')
        garantirEspaco(20)
        const eletronicoBody = resp.eletronicosList.map((eletronico) => [
          descreverEletronico(eletronico) || '—',
          eletronico.modelo || '—',
          eletronico.largura_cm || '—',
          eletronico.altura_cm || '—',
          eletronico.profundidade_cm || '—',
          eletronico.link ? 'Ver link' : '—',
        ])
        const eletronicoUrls = resp.eletronicosList.map((eletronico) => eletronico.link || null)
        autoTable(doc, {
          startY: y,
          margin: { left: margemEsquerda, right: margemDireita },
          tableWidth: larguraConteudo,
          head: [['Tipo', 'Modelo', 'Largura (cm)', 'Altura (cm)', 'Prof. (cm)', 'Link']],
          body: eletronicoBody,
          columnStyles: {
            0: { cellWidth: 55 },
            1: { cellWidth: 40 },
            2: { cellWidth: 20 },
            3: { cellWidth: 20 },
            4: { cellWidth: 22 },
            5: { cellWidth: 13 },
          },
          styles: { cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.2 },
          headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9 },
          bodyStyles: { fontSize: 9, textColor: [0, 0, 0] },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 5 && data.cell.raw === 'Ver link') {
              const url = eletronicoUrls[data.row.index]
              if (url) doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url })
            }
          },
        })
        y = doc.lastAutoTable.finalY + 4
      }
    }

    if (formType === 'banheiro' || (formType === 'outros' && resp.cuba)) {
      escreverPergunta('Tipo de cuba', resp.cuba ?? '—')
    }

    if (resp.observacoes) {
      escreverPergunta('Observações', resp.observacoes)
    }
  })

  doc.save(`Checklist_ByArabi_${contrato}_${dataArquivo}.pdf`)
}
