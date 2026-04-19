import styles from './Modal.module.css'

export function Modal({ aberto, onFechar, children }) {
  if (!aberto) return null
  return (
    <div className={styles.overlay} onClick={onFechar}>
      <div className={styles.caixa} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
