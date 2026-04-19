import styles from './Header.module.css'

export function Header({ etapaAtual }) {
  return (
    <header className={styles.header}>
      <span className={styles.logo}>By Arabi Planejados</span>
      {etapaAtual && <span className={styles.etapa}>{etapaAtual}</span>}
    </header>
  )
}
