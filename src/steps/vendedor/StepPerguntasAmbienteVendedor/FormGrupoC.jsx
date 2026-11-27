import { useFormContextVendedor } from '../../../context/FormContextVendedor.js'
import { FieldGroup } from '../../../components/FieldGroup/FieldGroup.jsx'
import { BlocoCorredicasVendedor } from './BlocoCorredicasVendedor.jsx'
import { BlocoPuxadoresVendedor } from './BlocoPuxadoresVendedor.jsx'
import styles from './StepPerguntasAmbienteVendedor.module.css'

const NAO_SE_APLICA = 'não se aplica'
const OPCOES_CAIXARIA = ['MDP', 'MDF']
const OPCOES_DOBRADICAS = ['Convencionais', 'Amortecimento']

export function FormGrupoC({ instanceId, erros = {}, onLimparErrosPuxadores }) {
  const { state, dispatch } = useFormContextVendedor()
  const resp = state.respostasPorAmbiente[instanceId] || {}

  const set = (campo, valor) =>
    dispatch({ type: 'SET_RESPOSTA_AMBIENTE_VENDEDOR', instanceId, campo, valor })

  const campoFechado = (campo, pergunta, opcoes) => (
    <div className={styles.campoFechado}>
      <p className={styles.pergunta}>{pergunta}</p>
      <div className={styles.opcoes}>
        {opcoes.map((op) => (
          <button
            key={op}
            type="button"
            className={resp[campo] === op ? styles.opcaoAtiva : styles.opcao}
            onClick={() => set(campo, op)}
          >
            {op}
          </button>
        ))}
        <button
          type="button"
          className={resp[campo] === NAO_SE_APLICA ? styles.opcaoAtiva : styles.opcao}
          onClick={() => set(campo, NAO_SE_APLICA)}
        >
          Não se aplica
        </button>
      </div>
      {erros[campo] && <span className={`${styles.erro} erro-campo`}>{erros[campo]}</span>}
    </div>
  )

  return (
    <div>
      <FieldGroup titulo="Acabamento e ferragens">
        {campoFechado('caixaria', 'Caixarias ou corpos', OPCOES_CAIXARIA)}
        {campoFechado('dobradicas', 'Dobradiças', OPCOES_DOBRADICAS)}
        <BlocoCorredicasVendedor resp={resp} erros={erros} onSet={set} />
        <BlocoPuxadoresVendedor
          resp={resp}
          erros={erros}
          onSet={set}
          onLimparErrosPuxadores={onLimparErrosPuxadores}
        />
      </FieldGroup>

      <FieldGroup titulo="Observações (opcional)">
        <textarea
          className={styles.textarea}
          value={resp.observacoes || ''}
          maxLength={300}
          onChange={(e) => set('observacoes', e.target.value)}
          placeholder="Ex: detalhes adicionais sobre o ambiente..."
          rows={3}
        />
        <span className={styles.contador}>{(resp.observacoes || '').length}/300</span>
      </FieldGroup>
    </div>
  )
}
