import { useFormContext } from '../../context/FormContext.js'
import { TEXTO_GRANITO_RETIRAR } from '../../domain/checklistTextos.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import { TIPOS_CUBA } from './formUtils.js'
import styles from './StepPerguntasPorAmbiente.module.css'

export function FormBanheiro({ instanceId, erros = {} }) {
  const { state, dispatch } = useFormContext()
  const resp = state.respostasPorAmbiente[instanceId] || {}

  const set = (campo, valor) =>
    dispatch({ type: 'SET_RESPOSTA_AMBIENTE', instanceId, campo, valor })

  const simNao = (campo) => (
    <div className={styles.botoesSimNao}>
      <button className={resp[campo] === true ? styles.ativo : ''} onClick={() => set(campo, true)}>Sim</button>
      <button className={resp[campo] === false ? styles.ativo : ''} onClick={() => set(campo, false)}>NÃ£o</button>
    </div>
  )

  return (
    <div>
      <FieldGroup titulo="Granito / Pia Existente">
        <p className={styles.pergunta}>Existe granito ou pia existente no local?</p>
        {simNao('granito')}
        {erros.granito && <span className={styles.erro}>{erros.granito}</span>}
        {resp.granito === true && (
          <>
            <p className={styles.subpergunta}>Os mÃ³veis serÃ£o adaptados?</p>
            {simNao('granitoadaptar')}
            {erros.granitoadaptar && <span className={styles.erro}>{erros.granitoadaptar}</span>}
            {resp.granitoadaptar === false && (
              <p className={styles.aviso}>CC: {TEXTO_GRANITO_RETIRAR}</p>
            )}
          </>
        )}
      </FieldGroup>

      <FieldGroup titulo="Cuba">
        <p className={styles.pergunta}>Tipo de cuba:</p>
        <div className={styles.chips}>
          {TIPOS_CUBA.map((tipo) => (
            <button
              key={tipo}
              className={resp.cuba === tipo ? styles.chipAtivo : styles.chip}
              onClick={() => set('cuba', tipo)}
            >
              {tipo}
            </button>
          ))}
        </div>
        {erros.cuba && <span className={styles.erro}>{erros.cuba}</span>}
      </FieldGroup>

      <FieldGroup titulo="ObservaÃ§Ãµes (opcional)">
        <textarea
          className={styles.textarea}
          value={resp.observacoes || ''}
          maxLength={300}
          onChange={(e) => set('observacoes', e.target.value)}
          placeholder="ObservaÃ§Ãµes adicionais..."
          rows={3}
        />
        <span className={styles.contador}>{(resp.observacoes || '').length}/300</span>
      </FieldGroup>
    </div>
  )
}
