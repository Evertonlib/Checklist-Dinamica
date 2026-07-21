import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormContextVendedor } from '../../../context/FormContextVendedor.js'
import { formatarNomeAmbiente } from '../../../domain/ambientes.js'
import { obterGrupo } from '../../../domain/gruposPerguntasVendedor.js'
import { gerarPdfVendedor } from '../../../services/pdfVendedor.js'
import { BottomBar } from '../../../components/BottomBar/BottomBar.jsx'
import styles from './StepRevisaoVendedor.module.css'

const PERGUNTAS_POR_GRUPO = {
  A: [
    { campo: 'alturaBalcao_mm', label: 'Altura do piso — balcões', tipo: 'altura' },
    { campo: 'alturaArmario_mm', label: 'Altura do piso — armários', tipo: 'altura' },
    { campo: 'fechamentoTeto', label: 'Fechamento até o teto', tipo: 'fechamento' },
    { campo: 'caixaria', label: 'Caixarias ou corpos', tipo: 'texto' },
    { campo: 'dobradicas', label: 'Dobradiças', tipo: 'texto' },
    { campo: 'corredicas', label: 'Corrediças', tipo: 'texto' },
  ],
  B: [
    { campo: 'caixaria', label: 'Caixarias ou corpos', tipo: 'texto' },
    { campo: 'dobradicas', label: 'Dobradiças', tipo: 'texto' },
    { campo: 'corredicas', label: 'Corrediças', tipo: 'texto' },
    { campo: 'fechamentoTeto', label: 'Fechamento até o teto', tipo: 'fechamento' },
  ],
  C: [
    { campo: 'caixaria', label: 'Caixarias ou corpos', tipo: 'texto' },
    { campo: 'dobradicas', label: 'Dobradiças', tipo: 'texto' },
    { campo: 'corredicas', label: 'Corrediças', tipo: 'texto' },
  ],
}

function formatarResposta(item, valor) {
  if (valor === null || valor === undefined) return '—'
  if (valor === 'não se aplica') return 'Não se aplica'
  if (item.tipo === 'altura') return `${valor} mm`
  if (item.tipo === 'fechamento') return valor === 'SIM' ? 'SIM' : 'NÃO'
  return valor
}

export function StepRevisaoVendedor() {
  const { state } = useFormContextVendedor()
  const navigate = useNavigate()
  const [gerando, setGerando] = useState(false)
  const [erroPdf, setErroPdf] = useState('')

  const semAmbientes = state.ambientesSelecionados.length === 0
  const ultimoAmbiente = state.ambientesSelecionados[state.ambientesSelecionados.length - 1]

  const voltar = () => {
    if (ultimoAmbiente) {
      navigate(`/vendedor/ambiente/${ultimoAmbiente.instanceId}`)
      return
    }
    navigate('/vendedor/ambientes')
  }

  const handleGerarPdf = async () => {
    if (semAmbientes) return
    setGerando(true)
    setErroPdf('')
    try {
      await gerarPdfVendedor(state)
      navigate('/vendedor/sucesso')
    } catch {
      setErroPdf('Não foi possível gerar o PDF agora — tente novamente.')
    } finally {
      setGerando(false)
    }
  }

  const avancarLabel = gerando ? 'Gerando PDF…' : erroPdf ? 'Tentar novamente' : 'Gerar PDF'

  return (
    <div className={styles.pagina}>
      <h2 className={styles.titulo}>Revisão do Preenchimento</h2>

      <div className={styles.secao}>
        <h3>Identificação</h3>
        <p className={styles.linhaResumo}><strong>Cliente:</strong> {state.identificacao.nome || '—'}</p>
        <p className={styles.linhaResumo}>
          <strong>Contrato(s):</strong> {state.identificacao.contratos.filter(Boolean).join(', ') || '—'}
        </p>
      </div>

      {semAmbientes && (
        <p className={styles.erro}>Selecione ao menos um ambiente para gerar o PDF.</p>
      )}

      {state.ambientesSelecionados.map((instancia) => {
        const grupo = obterGrupo(instancia.tipo)
        const resp = state.respostasPorAmbiente[instancia.instanceId] || {}
        return (
          <div key={instancia.instanceId} className={styles.secao}>
            <h3>{formatarNomeAmbiente(instancia)}</h3>
            {PERGUNTAS_POR_GRUPO[grupo].map((item) => (
              <p key={item.campo} className={styles.linhaResumo}>
                <strong>{item.label}:</strong> {formatarResposta(item, resp[item.campo])}
              </p>
            ))}
            {resp.observacoes && (
              <p className={styles.linhaResumo}><strong>Observações:</strong> {resp.observacoes}</p>
            )}
          </div>
        )
      })}

      {erroPdf && <p className={styles.erroPdf}>{erroPdf}</p>}

      <div className={styles.espacoBar} />
      <BottomBar
        onVoltar={voltar}
        onAvancar={handleGerarPdf}
        avancarLabel={avancarLabel}
        avancarDisabled={gerando || semAmbientes}
        mostrarBotaoVendedor={false}
      />
    </div>
  )
}
