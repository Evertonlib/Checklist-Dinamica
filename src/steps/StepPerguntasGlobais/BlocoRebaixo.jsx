import { useFormContext } from '../../context/FormContext.js'
import { formatarNomeAmbiente } from '../../domain/ambientes.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import { limitarCm } from '../StepPerguntasPorAmbiente/formUtils.js'
import styles from './StepPerguntasGlobais.module.css'

export function BlocoRebaixo() {
  const { state, dispatch } = useFormContext()
  const { g4_temRebaixo, g4_ambientes, g4_rebaixoOpcao } = state.global

  // Rascunhos salvos antes do botao "Ja rebaixado" nao tem g4_rebaixoOpcao:
  // deriva do valor de negocio para nao perder o destaque do botao.
  const opcaoAtiva = g4_rebaixoOpcao ?? (g4_temRebaixo === true ? 'sim' : g4_temRebaixo === false ? 'nao' : null)
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
    <FieldGroup titulo="G5 — Rebaixo de Teto">
      <p className={styles.pergunta}>Algum ambiente terá rebaixo de teto?</p>
      <div className={`${styles.botoesSimNao} ${styles.botoesRebaixo}`}>
        <button
          className={opcaoAtiva === 'sim' ? styles.ativo : ''}
          onClick={() => {
            setGlobal('g4_temRebaixo', true)
            setGlobal('g4_rebaixoOpcao', 'sim')
          }}
        >Sim</button>
        <button
          className={opcaoAtiva === 'nao' ? styles.ativo : ''}
          onClick={() => {
            setGlobal('g4_temRebaixo', false)
            setGlobal('g4_ambientes', [])
            setGlobal('g4_rebaixoOpcao', 'nao')
          }}
        >Não</button>
        <button
          className={opcaoAtiva === 'ja_rebaixado' ? styles.ativo : ''}
          onClick={() => {
            setGlobal('g4_temRebaixo', false)
            setGlobal('g4_ambientes', [])
            setGlobal('g4_rebaixoOpcao', 'ja_rebaixado')
          }}
        >Já rebaixado</button>
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
                <label>{formatarNomeAmbiente(ambiente)} — Quantos cm será rebaixado?</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={ambienteRebaixo.cm ?? ''}
                  onChange={(e) => setCm(ambienteRebaixo.instanceId, limitarCm(e.target.value))}
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
