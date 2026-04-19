import { useFormContext } from '../../context/FormContext.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import styles from './StepPerguntasGlobais.module.css'

export function BlocoRebaixo() {
  const { state, dispatch } = useFormContext()
  const { g4_temRebaixo, g4_ambientes } = state.global
  const ambientes = state.ambientesSelecionados

  const setGlobal = (campo, valor) => dispatch({ type: 'SET_GLOBAL', campo, valor })

  const toggleAmb = (instanceId) => {
    const existe = g4_ambientes.find((a) => a.instanceId === instanceId)
    if (existe) {
      setGlobal('g4_ambientes', g4_ambientes.filter((a) => a.instanceId !== instanceId))
    } else {
      setGlobal('g4_ambientes', [...g4_ambientes, { instanceId, cm: '' }])
    }
  }

  const setCm = (instanceId, cm) => {
    dispatch({ type: 'SET_GLOBAL_G4_AMBIENTE', instanceId, cm })
  }

  const selecionado = (instanceId) => g4_ambientes.some((a) => a.instanceId === instanceId)

  return (
    <FieldGroup titulo="G4 — Rebaixo de Teto">
      <p className={styles.pergunta}>Algum ambiente terá rebaixo de teto?</p>
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
        >Não</button>
      </div>

      {g4_temRebaixo === true && (
        <div className={styles.subbloco}>
          <p className={styles.subpergunta}>Quais ambientes?</p>
          <div className={styles.chips}>
            {ambientes.map((a) => (
              <button
                key={a.instanceId}
                className={selecionado(a.instanceId) ? styles.chipAtivo : styles.chip}
                onClick={() => toggleAmb(a.instanceId)}
              >
                {a.nome || a.label}
              </button>
            ))}
          </div>

          {g4_ambientes.map((ga) => {
            const amb = ambientes.find((a) => a.instanceId === ga.instanceId)
            if (!amb) return null
            return (
              <div key={ga.instanceId} className={styles.campoRebaixo}>
                <label>{amb.nome || amb.label} — Quantos cm será rebaixado?</label>
                <input
                  type="number"
                  min="1"
                  value={ga.cm ?? ''}
                  onChange={(e) => setCm(ga.instanceId, e.target.value)}
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
