import { useFormContext } from '../../context/FormContext.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import styles from './StepPerguntasGlobais.module.css'

export function BlocoIluminacao() {
  const { state, dispatch } = useFormContext()
  const { g1_temIluminacaoExterna, g1_ambientes } = state.global
  const ambientes = state.ambientesSelecionados

  const setGlobal = (campo, valor) => dispatch({ type: 'SET_GLOBAL', campo, valor })

  const toggleAmbiente = (instanceId) => {
    const lista = g1_ambientes.includes(instanceId)
      ? g1_ambientes.filter((id) => id !== instanceId)
      : [...g1_ambientes, instanceId]
    setGlobal('g1_ambientes', lista)
  }

  return (
    <FieldGroup titulo="G1 — Iluminação">
      <p className={styles.pergunta}>
        O projeto terá alguma iluminação embutida na marcenaria adquirida externamente à By Arabi?
        (fitas de LED, spots, etc.)
      </p>
      <div className={styles.botoesSimNao}>
        <button
          className={g1_temIluminacaoExterna === true ? styles.ativo : ''}
          onClick={() => setGlobal('g1_temIluminacaoExterna', true)}
        >Sim</button>
        <button
          className={g1_temIluminacaoExterna === false ? styles.ativo : ''}
          onClick={() => setGlobal('g1_temIluminacaoExterna', false)}
        >Não</button>
      </div>

      {g1_temIluminacaoExterna === true && (
        <div className={styles.subbloco}>
          <p className={styles.subpergunta}>Em quais ambientes?</p>
          <div className={styles.chipTodos}>
            <button onClick={() => setGlobal('g1_ambientes', ambientes.map((a) => a.instanceId))}>
              Todos
            </button>
            <button onClick={() => setGlobal('g1_ambientes', [])}>Nenhum</button>
          </div>
          <div className={styles.chips}>
            {ambientes.map((a) => (
              <button
                key={a.instanceId}
                className={g1_ambientes.includes(a.instanceId) ? styles.chipAtivo : styles.chip}
                onClick={() => toggleAmbiente(a.instanceId)}
              >
                {a.nome || a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </FieldGroup>
  )
}
