import { useState } from 'react'
import { useFormContext } from '../../context/FormContext.js'
import { formatarNomeAmbiente } from '../../domain/ambientes.js'
import { Modal } from '../../components/Modal/Modal.jsx'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import { TEXTO_REVESTIMENTO_AUSENTE } from '../../domain/checklistTextos.js'
import styles from './StepPerguntasGlobais.module.css'

export function BlocoReforma() {
  const { state, dispatch } = useFormContext()
  const {
    g2_temReboco,
    g2_ambientesSemReboco,
    g3_temRevestimento,
    g3_ambientesSemRevestimento,
  } = state.global
  const ambientes = state.ambientesSelecionados
  const [modalRisco, setModalRisco] = useState(false)

  const setGlobal = (campo, valor) => dispatch({ type: 'SET_GLOBAL', campo, valor })

  const ambientesG3 =
    g2_temReboco === false && g2_ambientesSemReboco.length > 0
      ? ambientes.filter((a) => !g2_ambientesSemReboco.includes(a.instanceId))
      : ambientes

  const handleRebocoSim = () => {
    setGlobal('g2_temReboco', true)
    setGlobal('g2_ambientesSemReboco', [])
  }

  const handleRebocoNao = () => {
    setModalRisco(true)
  }

  const handleVoltarModal = () => {
    setGlobal('g2_temReboco', null)
    setModalRisco(false)
  }

  const handleAssumirRisco = () => {
    setGlobal('g2_temReboco', false)
    setModalRisco(false)
  }

  const toggleReboco = (instanceId) => {
    const lista = g2_ambientesSemReboco.includes(instanceId)
      ? g2_ambientesSemReboco.filter((id) => id !== instanceId)
      : [...g2_ambientesSemReboco, instanceId]
    setGlobal('g2_ambientesSemReboco', lista)
  }

  const handleRevestimentoSim = () => {
    setGlobal('g3_temRevestimento', true)
    setGlobal('g3_ambientesSemRevestimento', [])
  }

  const handleRevestimentoNao = () => {
    setGlobal('g3_temRevestimento', false)
  }

  const toggleRevestimento = (instanceId) => {
    const lista = g3_ambientesSemRevestimento.includes(instanceId)
      ? g3_ambientesSemRevestimento.filter((id) => id !== instanceId)
      : [...g3_ambientesSemRevestimento, instanceId]
    setGlobal('g3_ambientesSemRevestimento', lista)
  }

  return (
    <>
      <div id="bloco-g2">
        <FieldGroup titulo="G2 — Reboco">
          <p className={styles.pergunta}>
            Todos os ambientes já possuem reboco (argamassa) finalizado nas paredes?
          </p>
          <div className={styles.botoesSimNao}>
            <button
              className={g2_temReboco === true ? styles.ativo : ''}
              onClick={handleRebocoSim}
            >Sim</button>
            <button
              className={g2_temReboco === false ? styles.ativo : ''}
              onClick={handleRebocoNao}
            >Não</button>
          </div>

          {g2_temReboco === false && (
            <div className={styles.subbloco}>
              <p className={styles.subpergunta}>Quais ambientes não possuem reboco?</p>
              <div className={styles.chipTodos}>
                <button onClick={() => setGlobal('g2_ambientesSemReboco', ambientes.map((a) => a.instanceId))}>
                  Todos
                </button>
              </div>
              <div className={styles.chips}>
                {ambientes.map((ambiente) => (
                  <button
                    key={ambiente.instanceId}
                    className={g2_ambientesSemReboco.includes(ambiente.instanceId) ? styles.chipAtivo : styles.chip}
                    onClick={() => toggleReboco(ambiente.instanceId)}
                  >
                    {formatarNomeAmbiente(ambiente)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </FieldGroup>
      </div>

      <div id="bloco-g3">
        <FieldGroup titulo="G3 — Revestimento">
          <p className={styles.pergunta}>
            Todos os ambientes já possuem revestimento final (azulejo, porcelanato etc.) aplicado nas paredes?
          </p>
          <div className={styles.botoesSimNao}>
            <button
              className={g3_temRevestimento === true ? styles.ativo : ''}
              onClick={handleRevestimentoSim}
            >Sim</button>
            <button
              className={g3_temRevestimento === false ? styles.ativo : ''}
              onClick={handleRevestimentoNao}
            >Não</button>
          </div>

          {g3_temRevestimento === false && (
            <div className={styles.subbloco}>
              <p className={styles.aviso}>CC: {TEXTO_REVESTIMENTO_AUSENTE}</p>
              <p className={styles.subpergunta}>Quais ambientes não possuem revestimento?</p>
              <div className={styles.chipTodos}>
                <button onClick={() => setGlobal('g3_ambientesSemRevestimento', ambientesG3.map((a) => a.instanceId))}>
                  Todos
                </button>
              </div>
              <div className={styles.chips}>
                {ambientesG3.map((ambiente) => (
                  <button
                    key={ambiente.instanceId}
                    className={g3_ambientesSemRevestimento.includes(ambiente.instanceId) ? styles.chipAtivo : styles.chip}
                    onClick={() => toggleRevestimento(ambiente.instanceId)}
                  >
                    {formatarNomeAmbiente(ambiente)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </FieldGroup>
      </div>

      <Modal aberto={modalRisco} onFechar={() => {}}>
        <h3 className={styles.modalTitulo}>⚠️ Risco Alto</h3>
        <p>
          Ambiente não está pronto para liberação. Os ambientes selecionados ainda não possuem
          reboco (argamassa) finalizado nas paredes. Nessa condição, o projeto não pode ser
          liberado sem adequação prévia. Seu progresso está salvo.
        </p>
        <div className={styles.modalAcoes}>
          <button className={styles.btnSecundarioModal} onClick={handleVoltarModal}>
            ← Voltar
          </button>
          <button className={styles.btnRisco} onClick={handleAssumirRisco}>
            Assumo o risco e continuar
          </button>
        </div>
      </Modal>
    </>
  )
}
