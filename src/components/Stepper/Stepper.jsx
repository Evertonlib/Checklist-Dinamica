import styles from './Stepper.module.css'

export function Stepper({ etapaNumero, totalEtapas, nomeEtapa }) {
  if (!etapaNumero) return null
  return (
    <div className={styles.stepper}>
      Etapa {etapaNumero} de {totalEtapas} — <strong>{nomeEtapa}</strong>
    </div>
  )
}
