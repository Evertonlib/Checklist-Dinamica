import { useState } from 'react'
import { Modal } from '../Modal/Modal.jsx'
import styles from './BottomBar.module.css'

export function BottomBar({ onVoltar, onAvancar, avancarLabel = 'Avançar', avancarDisabled = false, voltarLabel = 'Voltar', semVoltar = false }) {
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <>
      <div className={styles.bar}>
        {!semVoltar && (
          <button className={styles.btnSecundario} onClick={onVoltar}>
            ← {voltarLabel}
          </button>
        )}
        <button
          className={styles.btnVendedor}
          type="button"
          onClick={() => setModalAberto(true)}
        >
          Vendedor
        </button>
        <button
          className={styles.btnPrimario}
          onClick={onAvancar}
          disabled={avancarDisabled}
        >
          {avancarLabel} →
        </button>
      </div>

      <Modal aberto={modalAberto} onFechar={() => setModalAberto(false)}>
        <p>
          Precisa de ajuda com essa pergunta? Entre em contato com seu vendedor projetista para
          obter essa informação. Quando tiver a resposta, retorne aqui — seu progresso estará
          salvo.
        </p>
        <button
          className={styles.btnPrimario}
          onClick={() => setModalAberto(false)}
        >
          Entendido, vou consultar o vendedor
        </button>
      </Modal>
    </>
  )
}
