import { useFormContext } from '../../context/FormContext.js'
import { formatarNomeAmbiente } from '../../domain/ambientes.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import styles from './StepPerguntasGlobais.module.css'

export function BlocoPontosUtilidades() {
  const { state, dispatch } = useFormContext()
  const { g3_pontosNaPosicaoFinal, g3_ambientesPendentes } = state.global
  const ambientes = state.ambientesSelecionados

  const setGlobal = (campo, valor) => dispatch({ type: 'SET_GLOBAL', campo, valor })

  const toggleAmb = (instanceId) => {
    const lista = g3_ambientesPendentes.includes(instanceId)
      ? g3_ambientesPendentes.filter((id) => id !== instanceId)
      : [...g3_ambientesPendentes, instanceId]

    setGlobal('g3_ambientesPendentes', lista)
  }

  return (
    <FieldGroup titulo="G3 — Pontos Elétricos / Hidráulicos / Gás">
      <p className={styles.pergunta}>
        Os pontos elétricos/hidráulicos/gás já estão nas posições finais em todos os ambientes?
      </p>
      <div className={styles.botoesSimNao}>
        <button
          className={g3_pontosNaPosicaoFinal === true ? styles.ativo : ''}
          onClick={() => {
            setGlobal('g3_pontosNaPosicaoFinal', true)
            setGlobal('g3_ambientesPendentes', [])
          }}
        >Sim</button>
        <button
          className={g3_pontosNaPosicaoFinal === false ? styles.ativo : ''}
          onClick={() => setGlobal('g3_pontosNaPosicaoFinal', false)}
        >Não</button>
      </div>

      {g3_pontosNaPosicaoFinal === false && (
        <div className={styles.subbloco}>
          <p className={styles.subpergunta}>Em quais ambientes ainda não estão?</p>
          <div className={styles.chipTodos}>
            <button onClick={() => setGlobal('g3_ambientesPendentes', ambientes.map((a) => a.instanceId))}>
              Todos
            </button>
          </div>
          <div className={styles.chips}>
            {ambientes.map((ambiente) => (
              <button
                key={ambiente.instanceId}
                className={g3_ambientesPendentes.includes(ambiente.instanceId) ? styles.chipAtivo : styles.chip}
                onClick={() => toggleAmb(ambiente.instanceId)}
              >
                {formatarNomeAmbiente(ambiente)}
              </button>
            ))}
          </div>
        </div>
      )}
    </FieldGroup>
  )
}
