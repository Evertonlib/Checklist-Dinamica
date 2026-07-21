import { useNavigate } from 'react-router-dom'
import { Header } from '../../components/Header/Header.jsx'
import styles from './SelecaoPerfil.module.css'

export function SelecaoPerfil() {
  const navigate = useNavigate()

  return (
    <div>
      <Header />
      <div className={styles.pagina}>
        <h1 className={styles.titulo}>Checklist Dinâmica</h1>
        <p className={styles.subtitulo}>Selecione o seu perfil para continuar</p>
        <div className={styles.botoes}>
          <button className={styles.btnPerfil} onClick={() => navigate('/identificacao')}>
            Cliente
          </button>
          <button className={styles.btnPerfil} onClick={() => navigate('/vendedor/identificacao')}>
            Projetista
          </button>
        </div>
      </div>
    </div>
  )
}
