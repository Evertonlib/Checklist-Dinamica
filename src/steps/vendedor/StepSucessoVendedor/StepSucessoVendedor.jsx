import { useNavigate } from 'react-router-dom'
import { useFormContextVendedor } from '../../../context/FormContextVendedor.js'
import styles from './StepSucessoVendedor.module.css'

export function StepSucessoVendedor() {
  const { dispatch } = useFormContextVendedor()
  const navigate = useNavigate()

  const reiniciar = () => {
    dispatch({ type: 'RESET_STATE_VENDEDOR' })
    navigate('/')
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.icone}>✅</div>
      <h2 className={styles.titulo}>PDF gerado com sucesso!</h2>
      <p className={styles.texto}>
        Envie o arquivo pelo fluxo habitual da medição, junto com o restante do compactado.
      </p>
      <button className={styles.btnNovo} onClick={reiniciar}>
        Iniciar novo preenchimento
      </button>
    </div>
  )
}
