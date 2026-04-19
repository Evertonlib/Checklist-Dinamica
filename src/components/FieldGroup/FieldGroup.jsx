import styles from './FieldGroup.module.css'

export function FieldGroup({ titulo, children }) {
  return (
    <div className={styles.grupo}>
      {titulo && <h3 className={styles.titulo}>{titulo}</h3>}
      {children}
    </div>
  )
}
