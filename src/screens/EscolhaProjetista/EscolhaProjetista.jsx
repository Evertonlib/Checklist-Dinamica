import { Link, useNavigate } from 'react-router-dom'
import { Header } from '../../components/Header/Header.jsx'
import selecao from '../SelecaoPerfil/SelecaoPerfil.module.css'
import styles from './EscolhaProjetista.module.css'

export function EscolhaProjetista() {
  const navigate = useNavigate()

  return (
    <div>
      <Header />
      <div className={selecao.pagina}>
        <h1 className={selecao.titulo}>Projetista</h1>
        <p className={selecao.subtitulo}>Qual tipo de checklist?</p>
        <div className={selecao.botoes}>
          <div className={styles.opcao}>
            <button className={selecao.btnPerfil} onClick={() => navigate('/vendedor/identificacao')}>
              Normal
            </button>
            <p className={styles.apoio}>Checklist completo com ambientes e perguntas técnicas</p>
          </div>
          <div className={styles.opcao}>
            <button className={selecao.btnPerfil} onClick={() => navigate('/futura/identificacao')}>
              Venda futura
            </button>
            <p className={styles.apoio}>Só dados cadastrais do cliente, sem ambientes</p>
          </div>
        </div>
        <Link to="/" className={styles.voltar}>← Voltar</Link>
      </div>
    </div>
  )
}
