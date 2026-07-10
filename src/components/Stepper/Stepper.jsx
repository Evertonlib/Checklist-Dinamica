import styles from './Stepper.module.css'

export function Stepper({ etapaNumero, totalEtapas, nomeEtapa }) {
  if (!etapaNumero) return null
  return (
    <div className={styles.stepper}>
      <span className={styles.etapaInfo}>Etapa {etapaNumero} de {totalEtapas}</span>
      <span className={styles.nomeEtapa}>{nomeEtapa}</span>
    </div>
  )
}
