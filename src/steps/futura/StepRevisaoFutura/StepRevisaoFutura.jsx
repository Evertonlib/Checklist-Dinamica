import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormContext } from '../../../context/FormContext.js'
import { gerarPdfFutura } from '../../../services/pdfFutura.js'
import { BottomBar } from '../../../components/BottomBar/BottomBar.jsx'
import styles from '../../vendedor/StepRevisaoVendedor/StepRevisaoVendedor.module.css'

export function StepRevisaoFutura() {
  const { state, dispatch } = useFormContext()
  const navigate = useNavigate()
  const [gerando, setGerando] = useState(false)
  const [erroPdf, setErroPdf] = useState('')
  const id = state.identificacao

  const linhaEndereco1 = [id.logradouro, id.numero].filter(Boolean).join(', ') + (id.complemento ? ` — ${id.complemento}` : '')
  const linhaEndereco2 = [id.bairro, id.cidade && id.uf ? `${id.cidade}/${id.uf}` : id.cidade || id.uf].filter(Boolean).join(' — ')

  const editar = () => {
    dispatch({ type: 'SET_META', campo: 'origemNavegacao', valor: 'revisao' })
    navigate('/futura/identificacao')
  }

  const handleGerarPdf = async () => {
    setGerando(true)
    setErroPdf('')
    try {
      await gerarPdfFutura(state)
      navigate('/futura/sucesso')
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
        <h3>Dados cadastrais</h3>
        <p className={styles.linhaResumo}><strong>Cliente:</strong> {id.nome || '—'}</p>
        <p className={styles.linhaResumo}><strong>Contrato:</strong> {id.contrato || '—'}</p>
        {linhaEndereco1 && <p className={styles.linhaResumo}>{linhaEndereco1}</p>}
        {linhaEndereco2 && <p className={styles.linhaResumo}>{linhaEndereco2}</p>}
        {id.cep && <p className={styles.linhaResumo}><strong>CEP:</strong> {id.cep}</p>}
        {id.telefone && <p className={styles.linhaResumo}><strong>Telefone:</strong> {id.telefone}</p>}
      </div>

      {erroPdf && <p className={styles.erroPdf}>{erroPdf}</p>}

      <div className={styles.espacoBar} />
      <BottomBar
        voltarLabel="Editar identificação"
        onVoltar={editar}
        onAvancar={handleGerarPdf}
        avancarLabel={avancarLabel}
        avancarDisabled={gerando}
        mostrarBotaoVendedor={false}
      />
    </div>
  )
}
