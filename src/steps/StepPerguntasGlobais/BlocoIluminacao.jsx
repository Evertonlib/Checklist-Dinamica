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
          onClick={() => {
            setGlobal('g1_temIluminacaoExterna', false)
            setGlobal('g1_ambientes', [])
          }}
        >Não</button>
      </div>

      {g1_temIluminacaoExterna === true && (
        <div className={styles.subbloco}>
          <p className={styles.aviso}>
            CC: CLIENTE CIENTE E DE ACORDO QUE FIAÇÃO ELÉTRICA, INSTALAÇÃO DE ILUMINAÇÕES E
            SERVIÇOS DE ELETRICISTA É POR SUA RESPONSABILIDADE, PROFISSIONAL DEVE ESTAR LOCAL
            NO DIA DA MONTAGEM.
          </p>
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
