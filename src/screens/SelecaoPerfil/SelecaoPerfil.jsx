import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../components/Header/Header.jsx'
import { Modal } from '../../components/Modal/Modal.jsx'
import { lerDadosPdf } from '../../services/importacaoPdf.js'
import styles from './SelecaoPerfil.module.css'

// Mesma chave do FormProvider (rascunho do Cliente). O rascunho do Projetista não é tocado.
const STORAGE_KEY_CLIENTE = 'byarabi_checklist_rascunho'
const LIMITE_BYTES = 20 * 1024 * 1024

export function SelecaoPerfil() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [aviso, setAviso] = useState(null) // null | 'erro' | 'confirmar'
  const [dadosPendentes, setDadosPendentes] = useState(null)

  const fechar = () => {
    setAviso(null)
    setDadosPendentes(null)
  }

  // Grava o rascunho do Cliente e abre a revisão; o FormProvider restaura sem perguntar (state.importado)
  const importar = (dados) => {
    try {
      localStorage.setItem(STORAGE_KEY_CLIENTE, JSON.stringify({ ...dados, _meta: { etapaAtual: 'revisao' } }))
    } catch {
      setAviso('erro')
      return
    }
    navigate('/revisao', { state: { importado: true } })
  }

  const aoEscolherArquivo = async (evento) => {
    const input = evento.target
    const arquivo = input.files?.[0]
    // Permite escolher o mesmo arquivo de novo depois
    input.value = ''
    if (!arquivo) return

    let dados = null
    if (arquivo.size <= LIMITE_BYTES) {
      try {
        dados = lerDadosPdf(await arquivo.arrayBuffer())
      } catch {
        dados = null
      }
    }

    if (!dados) {
      setAviso('erro')
      return
    }

    // Só grava depois da confirmação, para não perder o preenchimento que já existe
    let temRascunho = false
    try {
      temRascunho = Boolean(localStorage.getItem(STORAGE_KEY_CLIENTE))
    } catch {
      temRascunho = false
    }
    if (temRascunho) {
      setDadosPendentes(dados)
      setAviso('confirmar')
      return
    }
    importar(dados)
  }

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
          <button className={styles.btnPerfil} onClick={() => navigate('/projetista')}>
            Projetista
          </button>
        </div>

        <button className={styles.btnImportar} onClick={() => inputRef.current?.click()}>
          Importar PDF
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className={styles.inputArquivo}
          onChange={aoEscolherArquivo}
        />
      </div>

      <Modal aberto={aviso === 'erro'} onFechar={fechar}>
        <p>PDF não possui dados para importação</p>
        <button className={styles.btnModal} onClick={fechar}>
          Fechar
        </button>
      </Modal>

      <Modal aberto={aviso === 'confirmar'} onFechar={fechar}>
        <p>Já existe um preenchimento em andamento. Importar este PDF vai substituí-lo. Deseja continuar?</p>
        <button className={styles.btnModal} onClick={() => importar(dadosPendentes)}>
          Sim, importar
        </button>
        <button className={styles.btnModalSecundario} onClick={fechar}>
          Cancelar
        </button>
      </Modal>
    </div>
  )
}
