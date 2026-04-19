import { useFormContext } from '../../context/FormContext.js'
import { formatarNomeAmbiente } from '../../domain/ambientes.js'
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
    <FieldGroup titulo="G1 â€” IluminaÃ§Ã£o">
      <p className={styles.pergunta}>
        O projeto terÃ¡ alguma iluminaÃ§Ã£o embutida na marcenaria adquirida externamente Ã  By Arabi?
        (fitas de LED, spots, etc.)
      </p>
      <div className={styles.botoesSimNao}>
        <button
          className={g1_temIluminacaoExterna === true ? styles.ativo : ''}
          onClick={() => setGlobal('g1_temIluminacaoExterna', true)}
        >Sim</button>
        <button
          className={g1_temIluminacaoExterna === false ? styles.ativo : ''}
          onClick={() => {
            setGlobal('g1_temIluminacaoExterna', false)
            setGlobal('g1_ambientes', [])
          }}
        >NÃ£o</button>
      </div>

      {g1_temIluminacaoExterna === true && (
        <div className={styles.subbloco}>
          <p className={styles.subpergunta}>Em quais ambientes?</p>
          <div className={styles.chipTodos}>
            <button onClick={() => setGlobal('g1_ambientes', ambientes.map((a) => a.instanceId))}>
              Todos
            </button>
          </div>
          <div className={styles.chips}>
            {ambientes.map((ambiente) => (
              <button
                key={ambiente.instanceId}
                className={g1_ambientes.includes(ambiente.instanceId) ? styles.chipAtivo : styles.chip}
                onClick={() => toggleAmbiente(ambiente.instanceId)}
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
