import { useState } from 'react'
import { useFormContext } from '../../context/FormContext.js'
import { formatarNomeAmbiente } from '../../domain/ambientes.js'
import { Modal } from '../../components/Modal/Modal.jsx'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import styles from './StepPerguntasGlobais.module.css'

export function BlocoReforma() {
  const { state, dispatch } = useFormContext()
  const {
    g2_temReforma,
    g2_ambientes,
    g2_1_temReboco,
    g2_1_ambientes,
    g2_2_temRevestimento,
    g2_2_ambientes,
  } = state.global
  const ambientes = state.ambientesSelecionados
  const [modalRisco, setModalRisco] = useState(null)

  const setGlobal = (campo, valor) => dispatch({ type: 'SET_GLOBAL', campo, valor })

  const resetarDependencias = () => {
    setGlobal('g2_1_temReboco', null)
    setGlobal('g2_1_ambientes', [])
    setGlobal('g2_2_temRevestimento', null)
    setGlobal('g2_2_ambientes', [])
  }

  const ambientesEmReforma = ambientes.filter((ambiente) => g2_ambientes.includes(ambiente.instanceId))
  const idsEmReforma = ambientesEmReforma.map((ambiente) => ambiente.instanceId)

  const toggleAmbiente = (lista, campo, instanceId) => {
    const novaLista = lista.includes(instanceId)
      ? lista.filter((id) => id !== instanceId)
      : [...lista, instanceId]

    setGlobal(campo, novaLista)
    resetarDependencias()
  }

  const abrirModalRisco = (tipo, selecionados) => {
    setModalRisco({ tipo, selecionados })
  }

  const aplicarSelecaoCompleta = (campoSelecionados, campoBooleano, selecionados) => {
    setGlobal(campoSelecionados, selecionados)

    if (idsEmReforma.length > 0 && selecionados.length === idsEmReforma.length) {
      setGlobal(campoBooleano, true)
      return
    }

    setGlobal(campoBooleano, null)
    abrirModalRisco(
      campoBooleano === 'g2_1_temReboco' ? 'reboco' : 'revestimento',
      selecionados
    )
  }

  const toggleSelecaoDependente = (listaAtual, campoSelecionados, campoBooleano, instanceId) => {
    const selecionados = listaAtual.includes(instanceId)
      ? listaAtual.filter((id) => id !== instanceId)
      : [...listaAtual, instanceId]

    aplicarSelecaoCompleta(campoSelecionados, campoBooleano, selecionados)
  }

  const labelsEmRisco = ambientesEmReforma
    .filter((ambiente) => !modalRisco?.selecionados?.includes(ambiente.instanceId))
    .map((ambiente) => formatarNomeAmbiente(ambiente))
    .join(', ') || 'os ambientes selecionados'

  const handleVoltarModal = () => {
    if (modalRisco?.tipo === 'reboco') {
      setGlobal('g2_1_temReboco', null)
    }
    if (modalRisco?.tipo === 'revestimento') {
      setGlobal('g2_2_temRevestimento', null)
    }
    setModalRisco(null)
  }

  const handleAssumirRisco = () => {
    if (modalRisco?.tipo === 'reboco') {
      setGlobal('g2_1_temReboco', false)
      setGlobal('g2_2_temRevestimento', null)
      setGlobal('g2_2_ambientes', [])
    }
    if (modalRisco?.tipo === 'revestimento') {
      setGlobal('g2_2_temRevestimento', false)
    }
    setModalRisco(null)
  }

  const textoPendencia = modalRisco?.tipo === 'revestimento'
    ? 'ainda não possui(em) revestimento final aplicado nas paredes.'
    : 'ainda não possui(em) reboco (argamassa) finalizado nas paredes.'

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
              resetarDependencias()
            }}
          >Não</button>
        </div>

        {g2_temReforma === true && (
          <div className={styles.subbloco}>
            <p className={styles.subpergunta}>Quais ambientes?</p>
            <div className={styles.chipTodos}>
              <button onClick={() => {
                setGlobal('g2_ambientes', ambientes.map((ambiente) => ambiente.instanceId))
                resetarDependencias()
              }}>
                Todos
              </button>
              <button onClick={() => {
                setGlobal('g2_ambientes', [])
                resetarDependencias()
              }}>
                Nenhum
              </button>
            </div>
            <div className={styles.chips}>
              {ambientes.map((ambiente) => (
                <button
                  key={ambiente.instanceId}
                  className={g2_ambientes.includes(ambiente.instanceId) ? styles.chipAtivo : styles.chip}
                  onClick={() => toggleAmbiente(g2_ambientes, 'g2_ambientes', ambiente.instanceId)}
                >
                  {formatarNomeAmbiente(ambiente)}
                </button>
              ))}
            </div>

            <p className={styles.subpergunta}>
              G2.1 — Em quais ambientes em reforma as paredes já possuem reboco (argamassa)
              finalizado?
            </p>
            <div className={styles.chipTodos}>
              <button onClick={() => aplicarSelecaoCompleta('g2_1_ambientes', 'g2_1_temReboco', idsEmReforma)}>
                Todos
              </button>
              <button onClick={() => aplicarSelecaoCompleta('g2_1_ambientes', 'g2_1_temReboco', [])}>
                Nenhum
              </button>
            </div>
            <div className={styles.chips}>
              {ambientesEmReforma.map((ambiente) => (
                <button
                  key={ambiente.instanceId}
                  className={g2_1_ambientes.includes(ambiente.instanceId) ? styles.chipAtivo : styles.chip}
                  onClick={() => toggleSelecaoDependente(
                    g2_1_ambientes,
                    'g2_1_ambientes',
                    'g2_1_temReboco',
                    ambiente.instanceId
                  )}
                >
                  {formatarNomeAmbiente(ambiente)}
                </button>
              ))}
            </div>

            {g2_1_temReboco === true && (
              <>
                <p className={styles.subpergunta}>
                  G2.2 — Em quais ambientes em reforma o revestimento final das paredes já está
                  aplicado?
                </p>
                <div className={styles.chipTodos}>
                  <button onClick={() => aplicarSelecaoCompleta('g2_2_ambientes', 'g2_2_temRevestimento', idsEmReforma)}>
                    Todos
                  </button>
                  <button onClick={() => aplicarSelecaoCompleta('g2_2_ambientes', 'g2_2_temRevestimento', [])}>
                    Nenhum
                  </button>
                </div>
                <div className={styles.chips}>
                  {ambientesEmReforma.map((ambiente) => (
                    <button
                      key={ambiente.instanceId}
                      className={g2_2_ambientes.includes(ambiente.instanceId) ? styles.chipAtivo : styles.chip}
                      onClick={() => toggleSelecaoDependente(
                        g2_2_ambientes,
                        'g2_2_ambientes',
                        'g2_2_temRevestimento',
                        ambiente.instanceId
                      )}
                    >
                      {formatarNomeAmbiente(ambiente)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </FieldGroup>

      <Modal aberto={Boolean(modalRisco)} onFechar={() => {}}>
        <h3 className={styles.modalTitulo}>⚠️ Risco Alto</h3>
        <p>
          Ambiente não está pronto para liberação. <strong>{labelsEmRisco}</strong> {textoPendencia}
          {' '}Nessa condição, o projeto não pode ser liberado sem adequação prévia. Seu progresso
          está salvo.
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
