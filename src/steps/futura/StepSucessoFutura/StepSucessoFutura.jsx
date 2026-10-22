import { useNavigate } from 'react-router-dom'
import { useFormContext } from '../../../context/FormContext.js'
import styles from '../../vendedor/StepSucessoVendedor/StepSucessoVendedor.module.css'

export function StepSucessoFutura() {
  const { dispatch } = useFormContext()
  const navigate = useNavigate()

  const reiniciar = () => {
    dispatch({ type: 'RESET_STATE_FUTURA' })
    navigate('/')
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.icone}>✅</div>
      <h2 className={styles.titulo}>PDF gerado com sucesso!</h2>
      <p className={styles.texto}>
        Encaminhe este arquivo ao e-mail da liberação com cópia ao seu gerente
      </p>
      <button className={styles.btnNovo} onClick={reiniciar}>
        Iniciar novo preenchimento
      </button>
    </div>
  )
}
