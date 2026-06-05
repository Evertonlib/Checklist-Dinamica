import jsPDF from 'jspdf'
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
  if (eletronico.modelo) {
    partes.push(eletronico.modelo)
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

  const ambientePorId = new Map(
    state.ambientesSelecionados.map((ambiente) => [ambiente.instanceId, ambiente])
  )
  const ccPorId = new Map(ccs.map((cc) => [cc.id, cc]))

  const nomeAmbiente = (escopo) => {
    if (escopo === 'Global') return 'Global'
    const ambiente = ambientePorId.get(escopo)
    return ambiente ? formatarNomeAmbiente(ambiente) : escopo
  }

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

  const escreverResumoItem = (cc) => {
    garantirEspaco(16)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...COR_NIVEL[cc.nivel])
    const titulo = `RISCO ${cc.nivel} — ${nomeAmbiente(cc.escopo)}`
    escreverLinhas(doc.splitTextToSize(titulo, larguraConteudo), margemEsquerda, 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    escreverLinhas(doc.splitTextToSize(`CC: ${cc.textoCompleto}`, larguraConteudo), margemEsquerda, 4.5)
    y += 3
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

  const ccsResumo = ccs.filter((cc) => cc.tipo === 'CC')
  const ccsAlto = ccsResumo.filter((cc) => cc.nivel === 'ALTO')
  const ccsMedio = ccsResumo.filter((cc) => cc.nivel === NIVEL_MEDIO)
  const ccsBaixo = ccsResumo.filter((cc) => cc.nivel === 'BAIXO')

  escreverTituloSecao('Resumo Executivo')
  ;[...ccsAlto, ...ccsMedio, ...ccsBaixo].forEach((cc) => escreverResumoItem(cc))

  escreverTituloSecao('Checklist Completa')

  const { global } = state

  escreverPergunta(
    'G1 — O projeto terá alguma iluminação embutida na marcenaria adquirida externamente à By Arabi? (fitas de LED, spots, etc.)',
    global.g1_temIluminacaoExterna === true
      ? `Sim — ${formatarListaAmbientes(state.ambientesSelecionados, global.g1_ambientes)}`
      : 'Não',
    (global.g1_ambientes || []).map((id) => ccPorId.get(`ILUMINACAO_EXTERNA_${id}`))
  )

  escreverPergunta(
    'G2 — Todos os ambientes já possuem reboco (argamassa) finalizado nas paredes?',
    global.g2_temReboco === false
      ? `Não — Sem reboco: ${formatarListaAmbientes(state.ambientesSelecionados, global.g2_ambientesSemReboco)}`
      : global.g2_temReboco === true ? 'Sim' : '—',
    (global.g2_ambientesSemReboco || []).map((id) => ccPorId.get(`REFORM_SEM_REBOCO_${id}`))
  )

  escreverPergunta(
    'G3 — Todos os ambientes já possuem revestimento final (azulejo, porcelanato etc.) aplicado nas paredes?',
    global.g3_temRevestimento === false
      ? `Não — Sem revestimento: ${formatarListaAmbientes(state.ambientesSelecionados, global.g3_ambientesSemRevestimento)}`
      : global.g3_temRevestimento === true ? 'Sim' : '—',
    (global.g3_ambientesSemRevestimento || []).map((id) => ccPorId.get(`REFORM_SEM_REVESTIMENTO_${id}`))
  )

  escreverPergunta(
    'G4 — Os pontos elétricos/hidráulicos/gás já estão nas posições finais em todos os ambientes?',
    global.g3_pontosNaPosicaoFinal === false
      ? `Não — ${formatarListaAmbientes(state.ambientesSelecionados, global.g3_ambientesPendentes)}`
      : 'Sim',
    (global.g3_ambientesPendentes || []).map((id) => ccPorId.get(`PONTOS_INDEFINIDOS_${id}`))
  )

  escreverPergunta(
    'G5 — Algum ambiente terá rebaixo de teto?',
    global.g4_temRebaixo === true
      ? `Sim — ${formatarListaRebaixo(state.ambientesSelecionados, global.g4_ambientes)}`
      : 'Não',
    (global.g4_ambientes || []).map((item) => ccPorId.get(`REBAIXO_${item.instanceId}`))
  )

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
        resp.eletros.forEach((eletro, index) => {
          escreverPergunta(`Eletro ${index + 1}`, descreverEletro(eletro))
          if (eletro.modelo) escreverPergunta('Modelo', eletro.modelo)
          if (eletro.largura_cm) escreverPergunta('Largura (cm)', eletro.largura_cm)
          if (eletro.altura_cm) escreverPergunta('Altura (cm)', eletro.altura_cm)
          if (eletro.profundidade_cm) escreverPergunta('Profundidade (cm)', eletro.profundidade_cm)
          if (eletro.link) escreverPergunta('Link', eletro.link)
        })
      }
    }

    if (['home', 'outros'].includes(formType)) {
      escreverPergunta(
        'Possui ou pretende adquirir eletrônicos para este ambiente?',
        resp.eletronicos === true ? 'Sim' : resp.eletronicos === false ? 'Não' : '—',
        [ccPorId.get(`ELETRONICOS_NAODEF_${instanceId}`)]
      )

      if (resp.eletronicos === true && resp.eletronicosList?.length > 0) {
        resp.eletronicosList.forEach((eletronico, index) => {
          escreverPergunta(`Eletrônico ${index + 1}`, descreverEletronico(eletronico))
          if (eletronico.largura_cm) escreverPergunta('Largura (cm)', eletronico.largura_cm)
          if (eletronico.altura_cm) escreverPergunta('Altura (cm)', eletronico.altura_cm)
          if (eletronico.profundidade_cm) escreverPergunta('Profundidade (cm)', eletronico.profundidade_cm)
          if (eletronico.link) escreverPergunta('Link', eletronico.link)
        })
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
