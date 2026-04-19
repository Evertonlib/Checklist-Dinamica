import { useNavigate } from 'react-router-dom'
import { useFormContext } from '../../context/FormContext.js'
import styles from './StepSucesso.module.css'

export function StepSucesso() {
  const { dispatch } = useFormContext()
  const navigate = useNavigate()

  const reiniciar = () => {
    dispatch({ type: 'RESET_STATE' })
    navigate('/identificacao')
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.icone}>✅</div>
      <h2 className={styles.titulo}>PDF gerado com sucesso!</h2>
      <p className={styles.texto}>
        Envie o arquivo para seu vendedor projetista pelo fluxo habitual.
      </p>
      <button className={styles.btnNovo} onClick={reiniciar}>
        Iniciar novo preenchimento
      </button>
    </div>
  )
}
