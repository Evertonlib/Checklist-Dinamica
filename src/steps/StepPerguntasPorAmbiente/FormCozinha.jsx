import { useFormContext } from '../../context/FormContext.js'
import {
  TEXTO_ELETROS_NAO_DEFINIDOS,
  TEXTO_GRANITO_RETIRAR,
  TEXTO_TANQUE_RETIRAR,
} from '../../domain/checklistTextos.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import { ELETROS_CONFIG } from './formUtils.js'
import styles from './StepPerguntasPorAmbiente.module.css'

export function FormCozinha({ instanceId, erros = {} }) {
  const { state, dispatch } = useFormContext()
  const resp = state.respostasPorAmbiente[instanceId] || {}

  const set = (campo, valor) =>
    dispatch({ type: 'SET_RESPOSTA_AMBIENTE', instanceId, campo, valor })

  const addEletro = (tipo) => {
    const config = ELETROS_CONFIG.find((item) => item.tipo === tipo)
    dispatch({
      type: 'ADD_ELETRO',
      instanceId,
      eletro: {
        tipo,
        subtipo: config?.subtipos[0] ?? '',
        descricao: '',
        modelo: '',
        largura_cm: '',
        altura_cm: '',
        profundidade_cm: '',
        link: '',
      },
    })
  }

  const updEletro = (index, campo, valor) =>
    dispatch({ type: 'UPDATE_ELETRO', instanceId, index, campo, valor })

  const remEletro = (index) =>
    dispatch({ type: 'REMOVE_ELETRO', instanceId, index })

  const simNao = (campo, valorTrue, valorFalse, onFalse) => (
    <div className={styles.botoesSimNao}>
      <button
        className={resp[campo] === true ? styles.ativo : ''}
        onClick={() => set(campo, true)}
      >{valorTrue ?? 'Sim'}</button>
      <button
        className={resp[campo] === false ? styles.ativo : ''}
        onClick={() => {
          set(campo, false)
          onFalse?.()
        }}
      >{valorFalse ?? 'Não'}</button>
    </div>
  )

  return (
    <div>
      <FieldGroup titulo="Granito / Pia Existente">
        <p className={styles.pergunta}>Existe granito ou pia existente no local?</p>
        {simNao('granito')}
        {erros.granito && <span className={`${styles.erro} erro-campo`}>{erros.granito}</span>}
        {resp.granito === true && (
          <>
            <p className={styles.subpergunta}>Os móveis serão adaptados para este granito/pia?</p>
            {simNao('granitoadaptar')}
            {erros.granitoadaptar && <span className={`${styles.erro} erro-campo`}>{erros.granitoadaptar}</span>}
            {resp.granitoadaptar === false && (
              <p className={styles.aviso}>CC: {TEXTO_GRANITO_RETIRAR}</p>
            )}
          </>
        )}
      </FieldGroup>

      <FieldGroup titulo="Tanque">
        <p className={styles.pergunta}>Existe tanque no local?</p>
        {simNao('tanque')}
        {erros.tanque && <span className={`${styles.erro} erro-campo`}>{erros.tanque}</span>}
        {resp.tanque === true && (
          <>
            <p className={styles.subpergunta}>Haverá móveis na região do tanque?</p>
            {simNao('tanqueMoveis')}
            {erros.tanqueMoveis && <span className={`${styles.erro} erro-campo`}>{erros.tanqueMoveis}</span>}
            {resp.tanqueMoveis === true && (
              <p className={styles.aviso}>CC: {TEXTO_TANQUE_RETIRAR}</p>
            )}
          </>
        )}
      </FieldGroup>

      <FieldGroup titulo="Eletrodomésticos">
        <p className={styles.pergunta}>
          Já possui ou tem intenção de compra específica dos eletrodomésticos?
        </p>
        {simNao('eletrosDefined')}
        {erros.eletrosDefined && <span className={`${styles.erro} erro-campo`}>{erros.eletrosDefined}</span>}
        {resp.eletrosDefined === false && (
          <p className={styles.aviso}>CC: {TEXTO_ELETROS_NAO_DEFINIDOS}</p>
        )}
        {resp.eletrosDefined === true && (
          <div className={styles.eletroArea}>
            <div className={styles.eletroGrid}>
              {ELETROS_CONFIG.map((config) => (
                <button
                  key={config.tipo}
                  className={styles.btnEletro}
                  onClick={() => addEletro(config.tipo)}
                >
                  + {config.tipo}
                </button>
              ))}
            </div>
            {erros.eletros && <span className={`${styles.erro} erro-campo`}>{erros.eletros}</span>}

            {(resp.eletros || []).map((eletro, index) => {
              const config = ELETROS_CONFIG.find((item) => item.tipo === eletro.tipo) || { subtipos: [] }
              const depuradorEmbutido = eletro.tipo === 'Depurador' && eletro.subtipo === 'Embutido'

              return (
                <div key={index} className={styles.eletroCard}>
                  <div className={styles.eletroHeader}>
                    <strong>{eletro.tipo}</strong>
                    <button onClick={() => remEletro(index)} className={styles.btnRemover}>✕</button>
                  </div>

                  {config.subtipos.length > 0 && (
                    <div className={styles.campo}>
                      <label>Subtipo *</label>
                      <select
                        value={eletro.subtipo}
                        onChange={(e) => updEletro(index, 'subtipo', e.target.value)}
                      >
                        {config.subtipos.map((subtipo) => <option key={subtipo}>{subtipo}</option>)}
                      </select>
                      {erros[`eletro_${index}_subtipo`] && (
                        <span className={`${styles.erro} erro-campo`}>{erros[`eletro_${index}_subtipo`]}</span>
                      )}
                    </div>
                  )}

                  {eletro.tipo === 'Outros' && (
                    <div className={styles.campo}>
                      <label>Qual eletro é? *</label>
                      <input
                        value={eletro.descricao || ''}
                        onChange={(e) => updEletro(index, 'descricao', e.target.value)}
                      />
                      {erros[`eletro_${index}_descricao`] && (
                        <span className={`${styles.erro} erro-campo`}>{erros[`eletro_${index}_descricao`]}</span>
                      )}
                    </div>
                  )}

                  <div className={styles.linha3}>
                    <div className={styles.campo}>
                      <label>Largura (cm) *</label>
                      <input
                        type="number"
                        value={eletro.largura_cm}
                        onChange={(e) => updEletro(index, 'largura_cm', e.target.value)}
                      />
                      {erros[`eletro_${index}_largura`] && (
                        <span className={`${styles.erro} erro-campo`}>{erros[`eletro_${index}_largura`]}</span>
                      )}
                    </div>
                    <div className={styles.campo}>
                      <label>Altura (cm) *</label>
                      <input
                        type="number"
                        value={eletro.altura_cm}
                        onChange={(e) => updEletro(index, 'altura_cm', e.target.value)}
                      />
                      {erros[`eletro_${index}_altura`] && (
                        <span className={`${styles.erro} erro-campo`}>{erros[`eletro_${index}_altura`]}</span>
                      )}
                    </div>
                    <div className={styles.campo}>
                      <label>Profundidade (cm) *</label>
                      <input
                        type="number"
                        value={eletro.profundidade_cm}
                        onChange={(e) => updEletro(index, 'profundidade_cm', e.target.value)}
                      />
                      {erros[`eletro_${index}_prof`] && (
                        <span className={`${styles.erro} erro-campo`}>{erros[`eletro_${index}_prof`]}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.campo}>
                    <label>Modelo{depuradorEmbutido ? ' *' : ''}</label>
                    <input value={eletro.modelo} onChange={(e) => updEletro(index, 'modelo', e.target.value)} />
                    {erros[`eletro_${index}_modelo`] && (
                      <span className={`${styles.erro} erro-campo`}>{erros[`eletro_${index}_modelo`]}</span>
                    )}
                  </div>

                  <div className={styles.campo}>
                    <label>Link {depuradorEmbutido ? '*' : '(opcional)'}</label>
                    <input
                      value={eletro.link}
                      onChange={(e) => updEletro(index, 'link', e.target.value)}
                      placeholder="Cole aqui o link do produto, se tiver"
                    />
                    {erros[`eletro_${index}_link`] && (
                      <span className={`${styles.erro} erro-campo`}>{erros[`eletro_${index}_link`]}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </FieldGroup>

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
