import { useFormContext } from '../../context/FormContext.js'
import { formatarNomeAmbiente } from '../../domain/ambientes.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import styles from './StepPerguntasGlobais.module.css'

export function BlocoRebaixo() {
  const { state, dispatch } = useFormContext()
  const { g4_temRebaixo, g4_ambientes } = state.global
  const ambientes = state.ambientesSelecionados

  const setGlobal = (campo, valor) => dispatch({ type: 'SET_GLOBAL', campo, valor })

  const toggleAmb = (instanceId) => {
    const existe = g4_ambientes.find((ambiente) => ambiente.instanceId === instanceId)

    if (existe) {
      setGlobal('g4_ambientes', g4_ambientes.filter((ambiente) => ambiente.instanceId !== instanceId))
      return
    }

    setGlobal('g4_ambientes', [...g4_ambientes, { instanceId, cm: '' }])
  }

  const setCm = (instanceId, cm) => {
    dispatch({ type: 'SET_GLOBAL_G4_AMBIENTE', instanceId, cm })
  }

  const selecionado = (instanceId) => g4_ambientes.some((ambiente) => ambiente.instanceId === instanceId)

  return (
    <FieldGroup titulo="G4 â€” Rebaixo de Teto">
      <p className={styles.pergunta}>Algum ambiente terÃ¡ rebaixo de teto?</p>
      <div className={styles.botoesSimNao}>
        <button
          className={g4_temRebaixo === true ? styles.ativo : ''}
          onClick={() => setGlobal('g4_temRebaixo', true)}
        >Sim</button>
        <button
          className={g4_temRebaixo === false ? styles.ativo : ''}
          onClick={() => {
            setGlobal('g4_temRebaixo', false)
            setGlobal('g4_ambientes', [])
          }}
        >NÃ£o</button>
      </div>

      {g4_temRebaixo === true && (
        <div className={styles.subbloco}>
          <p className={styles.subpergunta}>Quais ambientes?</p>
          <div className={styles.chips}>
            {ambientes.map((ambiente) => (
              <button
                key={ambiente.instanceId}
                className={selecionado(ambiente.instanceId) ? styles.chipAtivo : styles.chip}
                onClick={() => toggleAmb(ambiente.instanceId)}
              >
                {formatarNomeAmbiente(ambiente)}
              </button>
            ))}
          </div>

          {g4_ambientes.map((ambienteRebaixo) => {
            const ambiente = ambientes.find((item) => item.instanceId === ambienteRebaixo.instanceId)
            if (!ambiente) return null

            return (
              <div key={ambienteRebaixo.instanceId} className={styles.campoRebaixo}>
                <label>{formatarNomeAmbiente(ambiente)} â€” Quantos cm serÃ¡ rebaixado?</label>
                <input
                  type="number"
                  min="1"
                  value={ambienteRebaixo.cm ?? ''}
                  onChange={(e) => setCm(ambienteRebaixo.instanceId, e.target.value)}
                  placeholder="cm"
                />
              </div>
            )
          })}
        </div>
      )}
    </FieldGroup>
  )
}
