import styles from './ScoreBadge.module.css'

const CONFIG = {
  ALTO:  { emoji: '🔴', cor: styles.alto  },
  MÉDIO: { emoji: '🟡', cor: styles.medio },
  BAIXO: { emoji: '🟢', cor: styles.baixo },
}

export function ScoreBadge({ classificacao, pontos }) {
  const cfg = CONFIG[classificacao] || CONFIG.BAIXO
  return (
    <span className={`${styles.badge} ${cfg.cor}`}>
      {cfg.emoji} {classificacao}
      {pontos !== undefined && <span className={styles.pontos}> ({pontos} pts)</span>}
    </span>
  )
}
