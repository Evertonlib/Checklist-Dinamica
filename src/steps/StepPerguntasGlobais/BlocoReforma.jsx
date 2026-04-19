import { useState } from 'react'
import { useFormContext } from '../../context/FormContext.js'
import { Modal } from '../../components/Modal/Modal.jsx'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import styles from './StepPerguntasGlobais.module.css'

export function BlocoReforma() {
  const { state, dispatch } = useFormContext()
  const { g2_temReforma, g2_ambientes, g2_1_temReboco, g2_2_temRevestimento } = state.global
  const ambientes = state.ambientesSelecionados
  const [modalRisco, setModalRisco] = useState(false)

  const setGlobal = (campo, valor) => dispatch({ type: 'SET_GLOBAL', campo, valor })

  const toggleAmb = (lista, campo, instanceId) => {
    const nova = lista.includes(instanceId)
      ? lista.filter((id) => id !== instanceId)
      : [...lista, instanceId]
    setGlobal(campo, nova)
  }

  const handleG2_1_Nao = () => {
    setModalRisco(true)
  }

  const handleVoltarModal = () => {
    setModalRisco(false)
    setGlobal('g2_1_temReboco', null)
  }

  const handleAssumirRisco = () => {
    setModalRisco(false)
    setGlobal('g2_1_temReboco', false)
  }

  const labelsEmReforma = ambientes
    .filter((a) => g2_ambientes.includes(a.instanceId))
    .map((a) => a.nome || a.label)
    .join(', ') || 'os ambientes selecionados'

  return (
    <>
      <FieldGroup titulo="G2 — Reforma">
        <p className={styles.pergunta}>Algum ambiente está em reforma?</p>
        <div className={styles.botoesSimNao}>
          <button
            className={g2_temReforma === true ? styles.ativo : ''}
            onClick={() => setGlobal('g2_temReforma', true)}
          >Sim</button>
          <button
            className={g2_temReforma === false ? styles.ativo : ''}
            onClick={() => {
              setGlobal('g2_temReforma', false)
              setGlobal('g2_ambientes', [])
              setGlobal('g2_1_temReboco', null)
              setGlobal('g2_2_temRevestimento', null)
            }}
          >Não</button>
        </div>

        {g2_temReforma === true && (
          <div className={styles.subbloco}>
            <p className={styles.subpergunta}>Quais ambientes?</p>
            <div className={styles.chipTodos}>
              <button onClick={() => setGlobal('g2_ambientes', ambientes.map((a) => a.instanceId))}>
                Todos
              </button>
              <button onClick={() => setGlobal('g2_ambientes', [])}>Nenhum</button>
            </div>
            <div className={styles.chips}>
              {ambientes.map((a) => (
                <button
                  key={a.instanceId}
                  className={g2_ambientes.includes(a.instanceId) ? styles.chipAtivo : styles.chip}
                  onClick={() => toggleAmb(g2_ambientes, 'g2_ambientes', a.instanceId)}
                >
                  {a.nome || a.label}
                </button>
              ))}
            </div>

            {/* G2.1 */}
            <p className={styles.subpergunta}>
              G2.1 — As paredes já possuem reboco (argamassa) finalizado?
            </p>
            <div className={styles.botoesSimNao}>
              <button
                className={g2_1_temReboco === true ? styles.ativo : ''}
                onClick={() => {
                  setGlobal('g2_1_temReboco', true)
                }}
              >Sim</button>
              <button
                className={g2_1_temReboco === false ? styles.ativo : ''}
                onClick={handleG2_1_Nao}
              >Não</button>
            </div>

            {/* G2.2 — só aparece quando g2_1 = true */}
            {g2_1_temReboco === true && (
              <>
                <p className={styles.subpergunta}>
                  G2.2 — O revestimento final das paredes já está aplicado?
                </p>
                <div className={styles.botoesSimNao}>
                  <button
                    className={g2_2_temRevestimento === true ? styles.ativo : ''}
                    onClick={() => setGlobal('g2_2_temRevestimento', true)}
                  >Sim</button>
                  <button
                    className={g2_2_temRevestimento === false ? styles.ativo : ''}
                    onClick={() => setGlobal('g2_2_temRevestimento', false)}
                  >Não</button>
                </div>
              </>
            )}
          </div>
        )}
      </FieldGroup>

      <Modal aberto={modalRisco} onFechar={() => {}}>
        <h3 className={styles.modalTitulo}>⚠️ Risco Alto</h3>
        <p>
          Ambiente não está pronto para liberação. <strong>{labelsEmReforma}</strong> ainda não
          possui(em) reboco (argamassa) finalizado nas paredes. Nessa condição, o projeto não pode
          ser liberado sem adequação prévia. Seu progresso está salvo.
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
