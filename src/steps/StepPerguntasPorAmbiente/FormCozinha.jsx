import { useFormContext } from '../../context/FormContext.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import styles from './StepPerguntasPorAmbiente.module.css'

const ELETROS_CONFIG = [
  { tipo: 'Fogão',       subtipos: ['Piso', 'Embutido'] },
  { tipo: 'Cooktop',     subtipos: [] },
  { tipo: 'Refrigerador', subtipos: ['Duplex', 'Inverse', 'Side by Side'] },
  { tipo: 'Microondas',  subtipos: ['Normal', 'Embutido'] },
  { tipo: 'Forno',       subtipos: ['Normal', 'Embutido'] },
  { tipo: 'Depurador',   subtipos: ['Normal', 'Embutido'] },
  { tipo: 'Coifa',       subtipos: ['Parede', 'Ilha'] },
  { tipo: 'Lava-louça',  subtipos: ['Piso', 'Embutido'] },
  { tipo: 'Lava-roupa',  subtipos: ['Abertura Frontal', 'Abertura Superior'] },
  { tipo: 'Outros',      subtipos: [] },
]

export function FormCozinha({ instanceId, erros = {} }) {
  const { state, dispatch } = useFormContext()
  const resp = state.respostasPorAmbiente[instanceId] || {}

  const set = (campo, valor) =>
    dispatch({ type: 'SET_RESPOSTA_AMBIENTE', instanceId, campo, valor })

  const addEletro = (tipo) => {
    const def = ELETROS_CONFIG.find((e) => e.tipo === tipo)
    dispatch({
      type: 'ADD_ELETRO',
      instanceId,
      eletro: { tipo, subtipo: def?.subtipos[0] ?? '', modelo: '', largura_cm: '', altura_cm: '', profundidade_cm: '', link: '' },
    })
  }

  const updEletro = (i, campo, valor) =>
    dispatch({ type: 'UPDATE_ELETRO', instanceId, index: i, campo, valor })

  const remEletro = (i) =>
    dispatch({ type: 'REMOVE_ELETRO', instanceId, index: i })

  const simNao = (campo, valorTrue, valorFalse, onFalse) => (
    <div className={styles.botoesSimNao}>
      <button
        className={resp[campo] === true ? styles.ativo : ''}
        onClick={() => set(campo, true)}
      >{valorTrue ?? 'Sim'}</button>
      <button
        className={resp[campo] === false ? styles.ativo : ''}
        onClick={() => { set(campo, false); onFalse?.() }}
      >{valorFalse ?? 'Não'}</button>
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
            <p className={styles.subpergunta}>Os móveis serão adaptados para este granito/pia?</p>
            {simNao('granitoadaptar')}
            {resp.granitoadaptar === false && (
              <p className={styles.aviso}>
                CC: O cliente deverá retirar o granito existente até o dia da montagem.
              </p>
            )}
          </>
        )}
      </FieldGroup>

      {/* P2 Tanque */}
      <FieldGroup titulo="Tanque">
        <p className={styles.pergunta}>Existe tanque no local?</p>
        {simNao('tanque')}
        {resp.tanque === true && (
          <>
            <p className={styles.subpergunta}>Haverá móveis na região do tanque?</p>
            {simNao('tanqueMoveis')}
            {resp.tanqueMoveis === true && (
              <p className={styles.aviso}>
                CC: O cliente deverá retirar o tanque existente até o dia da montagem.
              </p>
            )}
          </>
        )}
      </FieldGroup>

      {/* P3 Eletros */}
      <FieldGroup titulo="Eletrodomésticos">
        <p className={styles.pergunta}>
          Já possui ou tem intenção de compra específica dos eletrodomésticos?
        </p>
        {simNao('eletrosDefined')}
        {resp.eletrosDefined === false && (
          <p className={styles.aviso}>
            CC: Os eletrodomésticos não foram definidos — serão adquiridos conforme os vãos previstos.
          </p>
        )}
        {resp.eletrosDefined === true && (
          <div className={styles.eletroArea}>
            <div className={styles.eletroGrid}>
              {ELETROS_CONFIG.map((cfg) => (
                <button
                  key={cfg.tipo}
                  className={styles.btnEletro}
                  onClick={() => addEletro(cfg.tipo)}
                >
                  + {cfg.tipo}
                </button>
              ))}
            </div>

            {(resp.eletros || []).map((el, i) => {
              const cfg = ELETROS_CONFIG.find((c) => c.tipo === el.tipo) || { subtipos: [] }
              const isDepuradorEmbutido = el.tipo === 'Depurador' && el.subtipo === 'Embutido'
              return (
                <div key={i} className={styles.eletroCard}>
                  <div className={styles.eletroHeader}>
                    <strong>{el.tipo}</strong>
                    <button onClick={() => remEletro(i)} className={styles.btnRemover}>✕</button>
                  </div>
                  {cfg.subtipos.length > 0 && (
                    <div className={styles.campo}>
                      <label>Subtipo *</label>
                      <select value={el.subtipo} onChange={(e) => updEletro(i, 'subtipo', e.target.value)}>
                        {cfg.subtipos.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  )}
                  <div className={styles.linha3}>
                    <div className={styles.campo}>
                      <label>Largura (cm) *</label>
                      <input type="number" value={el.largura_cm} onChange={(e) => updEletro(i, 'largura_cm', e.target.value)} />
                      {erros[`eletro_${i}_largura`] && <span className={styles.erro}>{erros[`eletro_${i}_largura`]}</span>}
                    </div>
                    <div className={styles.campo}>
                      <label>Altura (cm) *</label>
                      <input type="number" value={el.altura_cm} onChange={(e) => updEletro(i, 'altura_cm', e.target.value)} />
                      {erros[`eletro_${i}_altura`] && <span className={styles.erro}>{erros[`eletro_${i}_altura`]}</span>}
                    </div>
                    <div className={styles.campo}>
                      <label>Profundidade (cm) *</label>
                      <input type="number" value={el.profundidade_cm} onChange={(e) => updEletro(i, 'profundidade_cm', e.target.value)} />
                      {erros[`eletro_${i}_prof`] && <span className={styles.erro}>{erros[`eletro_${i}_prof`]}</span>}
                    </div>
                  </div>
                  <div className={styles.campo}>
                    <label>Modelo {isDepuradorEmbutido ? '*' : '(opcional)'}</label>
                    <input value={el.modelo} onChange={(e) => updEletro(i, 'modelo', e.target.value)} />
                    {erros[`eletro_${i}_modelo`] && <span className={styles.erro}>{erros[`eletro_${i}_modelo`]}</span>}
                  </div>
                  <div className={styles.campo}>
                    <label>Link {isDepuradorEmbutido ? '*' : '(opcional)'}</label>
                    <input value={el.link} onChange={(e) => updEletro(i, 'link', e.target.value)} placeholder="Cole aqui o link do produto, se tiver" />
                    {erros[`eletro_${i}_link`] && <span className={styles.erro}>{erros[`eletro_${i}_link`]}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </FieldGroup>

      {/* P4 Observações */}
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
