import { useFormContext } from '../../context/FormContext.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import styles from './StepPerguntasPorAmbiente.module.css'

const TIPOS_CUBA = ['Embutir', 'Semi-encaixe', 'Sobrepor', 'Apoio', 'Esculpida']

export function FormBanheiro({ instanceId, erros = {} }) {
  const { state, dispatch } = useFormContext()
  const resp = state.respostasPorAmbiente[instanceId] || {}

  const set = (campo, valor) =>
    dispatch({ type: 'SET_RESPOSTA_AMBIENTE', instanceId, campo, valor })

  const simNao = (campo) => (
    <div className={styles.botoesSimNao}>
      <button className={resp[campo] === true ? styles.ativo : ''} onClick={() => set(campo, true)}>Sim</button>
      <button className={resp[campo] === false ? styles.ativo : ''} onClick={() => set(campo, false)}>Não</button>
    </div>
  )

  return (
    <div>
      {/* P1 Granito */}
      <FieldGroup titulo="Granito / Pia Existente">
        <p className={styles.pergunta}>Existe granito ou pia existente no local?</p>
        {simNao('granito')}
        {resp.granito === true && (
          <>
            <p className={styles.subpergunta}>Os móveis serão adaptados?</p>
            {simNao('granitoadaptar')}
            {resp.granitoadaptar === false && (
              <p className={styles.aviso}>
                CC: O cliente deverá retirar o granito existente até o dia da montagem.
              </p>
            )}
          </>
        )}
      </FieldGroup>

      {/* P2 Cuba */}
      <FieldGroup titulo="Cuba">
        <p className={styles.pergunta}>Tipo de cuba:</p>
        <div className={styles.chips}>
          {TIPOS_CUBA.map((t) => (
            <button
              key={t}
              className={resp.cuba === t ? styles.chipAtivo : styles.chip}
              onClick={() => set('cuba', t)}
            >
              {t}
            </button>
          ))}
        </div>
        {erros.cuba && <span className={styles.erro}>{erros.cuba}</span>}
      </FieldGroup>

      {/* P3 Observações */}
      <FieldGroup titulo="Observações (opcional)">
        <textarea
          className={styles.textarea}
          value={resp.observacoes || ''}
          maxLength={300}
          onChange={(e) => set('observacoes', e.target.value)}
          placeholder="Observações adicionais..."
          rows={3}
        />
        <span className={styles.contador}>{(resp.observacoes || '').length}/300</span>
      </FieldGroup>
    </div>
  )
}
