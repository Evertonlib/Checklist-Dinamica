import jsPDF from 'jspdf'

function formatarDataLocal(data) {
  return data.toLocaleDateString('pt-BR')
}

function formatarDataArquivo(data) {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

/**
 * Gera e dispara download do PDF da Venda Futura (só dados cadastrais).
 * @param {object} state - Estado do formulário da Venda Futura
 */
export async function gerarPdfFutura(state) {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  const agora = new Date()
  const dataCapa = formatarDataLocal(agora)
  const dataArquivo = formatarDataArquivo(agora)
  const { nome, contrato, telefone, cep, logradouro, numero, complemento, bairro, cidade, uf } =
    state.identificacao

  const margemEsquerda = 20
  const margemDireita = 20
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFont('times', 'bold')
  doc.setFontSize(22)
  doc.text('By Arabi Planejados', pageWidth / 2, 40, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.text('Checklist Venda Futura', pageWidth / 2, 52, { align: 'center' })

  doc.setDrawColor(180, 150, 80)
  doc.setLineWidth(0.5)
  doc.line(margemEsquerda, 58, pageWidth - margemDireita, 58)

  doc.setFontSize(12)
  doc.text(`Cliente: ${nome}`, margemEsquerda, 72)
  doc.text(`Contrato: ${contrato}`, margemEsquerda, 82)

  const linhaEndereco1 = [logradouro, numero].filter(Boolean).join(', ') + (complemento ? ` — ${complemento}` : '')
  const linhaEndereco2 = [bairro, cidade && uf ? `${cidade}/${uf}` : cidade || uf].filter(Boolean).join(' — ')
  let y = 92
  if (linhaEndereco1) { doc.text(linhaEndereco1, margemEsquerda, y); y += 10 }
  if (linhaEndereco2) { doc.text(linhaEndereco2, margemEsquerda, y); y += 10 }
  if (cep) { doc.text(`CEP: ${cep}`, margemEsquerda, y); y += 10 }
  if (telefone) { doc.text(`Telefone: ${telefone}`, margemEsquerda, y); y += 10 }

  doc.text(`Data: ${dataCapa}`, margemEsquerda, y)

  doc.save(`Checklist_Futura_${contrato || 'SEMCONTRATO'}_${dataArquivo}.pdf`)
}
