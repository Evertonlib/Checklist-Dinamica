import { useNavigate } from 'react-router-dom'
import { useFormContext } from '../../context/FormContext.js'
import { AMBIENTES_DISPONIVEIS } from '../../domain/ambientes.js'
import { BottomBar } from '../../components/BottomBar/BottomBar.jsx'
import styles from './StepAmbientes.module.css'

export function StepAmbientes() {
  const { state, dispatch } = useFormContext()
  const navigate = useNavigate()

  const getQtd = (ambienteId) =>
    state.ambientesSelecionados.filter((a) => a.tipo === ambienteId).length

  const setQtd = (ambienteId, qtd) => {
    dispatch({ type: 'SET_AMBIENTE_QUANTIDADE', ambienteId, quantidade: Math.max(0, qtd) })
  }

  const setNome = (instanceId, nome) =>
    dispatch({ type: 'SET_AMBIENTE_NOME', instanceId, nome })

  const semAmbientes = state.ambientesSelecionados.length === 0

  const voltar = () => {
    dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: 'identificacao' })
    navigate('/identificacao')
  }

  const avancar = () => {
    if (semAmbientes) return
    dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: 'globais' })
    navigate('/globais')
  }

  return (
    <div className={styles.pagina}>
      <p className={styles.instrucao}>
        Selecione os ambientes que farão parte do projeto e a quantidade de cada um.
      </p>

      {AMBIENTES_DISPONIVEIS.map((amb) => {
        const qtd = getQtd(amb.id)
        const instancias = state.ambientesSelecionados.filter((a) => a.tipo === amb.id)

        return (
          <div key={amb.id} className={styles.ambCard}>
            <div className={styles.ambTopo}>
              <span className={styles.ambLabel}>{amb.label}</span>
              <div className={styles.qtdControle}>
                <button onClick={() => setQtd(amb.id, qtd - 1)} disabled={qtd === 0}>−</button>
                <span>{qtd}</span>
                <button onClick={() => setQtd(amb.id, qtd + 1)}>+</button>
              </div>
            </div>

            {qtd > 1 && instancias.map((inst) => (
              <div key={inst.instanceId} className={styles.nomeField}>
                <label>Nome para identificar ({inst.label} {inst.instanceId.split('-')[1] * 1 + 1})</label>
                <input
                  value={inst.nome}
                  onChange={(e) => setNome(inst.instanceId, e.target.value)}
                  placeholder={`Ex: Quarto da Joana`}
                />
              </div>
            ))}
          </div>
        )
      })}

      {semAmbientes && (
        <p className={styles.erro}>Selecione ao menos um ambiente para continuar.</p>
      )}

      <div className={styles.espacoBar} />
      <BottomBar onVoltar={voltar} onAvancar={avancar} avancarDisabled={semAmbientes} />
    </div>
  )
}
