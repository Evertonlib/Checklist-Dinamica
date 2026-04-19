import { useFormContext } from '../../context/FormContext.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import styles from './StepPerguntasPorAmbiente.module.css'

const ELETRONICOS_CONFIG = [
  { tipo: 'TV',          subtipos: [] },
  { tipo: 'Home Theater', subtipos: [] },
  { tipo: 'Videogame',   subtipos: [] },
  { tipo: 'Computador',  subtipos: [] },
  { tipo: 'Outros',      subtipos: [] },
]

export function FormHomeSalaOffice({ instanceId, erros = {} }) {
  const { state, dispatch } = useFormContext()
  const resp = state.respostasPorAmbiente[instanceId] || {}

  const set = (campo, valor) =>
    dispatch({ type: 'SET_RESPOSTA_AMBIENTE', instanceId, campo, valor })

  const addEletronico = (tipo) =>
    dispatch({ type: 'ADD_ELETRONICO', instanceId, eletronico: { tipo, modelo: '', largura_cm: '', altura_cm: '', link: '' } })

  const updEletronico = (i, campo, valor) =>
    dispatch({ type: 'UPDATE_ELETRONICO', instanceId, index: i, campo, valor })

  const remEletronico = (i) =>
    dispatch({ type: 'REMOVE_ELETRONICO', instanceId, index: i })

  const simNao = (campo, onFalse) => (
    <div className={styles.botoesSimNao}>
      <button className={resp[campo] === true ? styles.ativo : ''} onClick={() => set(campo, true)}>Sim</button>
      <button className={resp[campo] === false ? styles.ativo : ''} onClick={() => { set(campo, false); onFalse?.() }}>Não</button>
    </div>
  )

  return (
    <div>
      {/* P1 Eletrônicos */}
      <FieldGroup titulo="Eletrônicos">
        <p className={styles.pergunta}>
          Possui ou pretende adquirir eletrônicos para este ambiente?
        </p>
        {simNao('eletronicos')}
        {resp.eletronicos === false && (
          <p className={styles.aviso}>
            CC: Os eletrônicos não foram definidos — serão adquiridos conforme os vãos previstos.
          </p>
        )}
        {resp.eletronicos === true && (
          <div className={styles.eletroArea}>
            <div className={styles.eletroGrid}>
              {ELETRONICOS_CONFIG.map((cfg) => (
                <button key={cfg.tipo} className={styles.btnEletro} onClick={() => addEletronico(cfg.tipo)}>
                  + {cfg.tipo}
                </button>
              ))}
            </div>
            {(resp.eletronicosList || []).map((el, i) => (
              <div key={i} className={styles.eletroCard}>
                <div className={styles.eletroHeader}>
                  <strong>{el.tipo}</strong>
                  <button onClick={() => remEletronico(i)} className={styles.btnRemover}>✕</button>
                </div>
                <div className={styles.campo}>
                  <label>Modelo (opcional)</label>
                  <input value={el.modelo} onChange={(e) => updEletronico(i, 'modelo', e.target.value)} />
                </div>
                <div className={styles.linha2}>
                  <div className={styles.campo}>
                    <label>Largura (cm) *</label>
                    <input type="number" value={el.largura_cm} onChange={(e) => updEletronico(i, 'largura_cm', e.target.value)} />
                    {erros[`eletronico_${i}_largura`] && <span className={styles.erro}>{erros[`eletronico_${i}_largura`]}</span>}
                  </div>
                  <div className={styles.campo}>
                    <label>Altura (cm) *</label>
                    <input type="number" value={el.altura_cm} onChange={(e) => updEletronico(i, 'altura_cm', e.target.value)} />
                    {erros[`eletronico_${i}_altura`] && <span className={styles.erro}>{erros[`eletronico_${i}_altura`]}</span>}
                  </div>
                </div>
                <div className={styles.campo}>
                  <label>Link (opcional)</label>
                  <input value={el.link} onChange={(e) => updEletronico(i, 'link', e.target.value)} placeholder="Cole aqui o link do produto, se tiver" />
                </div>
              </div>
            ))}
          </div>
        )}
      </FieldGroup>

      {/* P2 TV */}
      <FieldGroup titulo="TV">
        <p className={styles.pergunta}>Terá TV neste ambiente?</p>
        {simNao('tv')}
        {resp.tv === true && (
          <>
            <p className={styles.subpergunta}>O ponto elétrico da TV já está na posição final?</p>
            {simNao('tvPontoFinal')}
            {resp.tvPontoFinal === false && (
              <p className={styles.aviso}>
                CC: O cliente deverá deslocar os pontos elétricos para dentro da posição do painel de TV até o dia da montagem.
              </p>
            )}
            <div className={styles.tvCampos}>
              <div className={styles.campo}>
                <label>Polegadas *</label>
                <input type="number" value={resp.tv_polegadas ?? ''} onChange={(e) => set('tv_polegadas', e.target.value)} />
                {erros.tv_polegadas && <span className={styles.erro}>{erros.tv_polegadas}</span>}
              </div>
              <div className={styles.campo}>
                <label>Modelo (opcional)</label>
                <input value={resp.tv_modelo || ''} onChange={(e) => set('tv_modelo', e.target.value)} />
              </div>
              <div className={styles.linha3}>
                <div className={styles.campo}>
                  <label>Largura (cm)</label>
                  <input type="number" value={resp.tv_largura_cm ?? ''} onChange={(e) => set('tv_largura_cm', e.target.value)} />
                </div>
                <div className={styles.campo}>
                  <label>Altura (cm)</label>
                  <input type="number" value={resp.tv_altura_cm ?? ''} onChange={(e) => set('tv_altura_cm', e.target.value)} />
                </div>
                <div className={styles.campo}>
                  <label>Profundidade (cm)</label>
                  <input type="number" value={resp.tv_profundidade_cm ?? ''} onChange={(e) => set('tv_profundidade_cm', e.target.value)} />
                </div>
              </div>
              <div className={styles.campo}>
                <label>Link (opcional)</label>
                <input value={resp.tv_link || ''} onChange={(e) => set('tv_link', e.target.value)} placeholder="Cole aqui o link do produto, se tiver" />
              </div>
            </div>
          </>
        )}
      </FieldGroup>

      {/* P3 Cortineiro */}
      <FieldGroup titulo="Cortineiro">
        <p className={styles.pergunta}>Haverá cortineiro neste ambiente?</p>
        {simNao('cortineiro')}
        {resp.cortineiro === true && (
          <>
            <p className={styles.subpergunta}>O cortineiro já está instalado?</p>
            {simNao('cortieneiroInstalado')}
            {resp.cortieneiroInstalado === false && (
              <p className={styles.aviso}>AVISO: Será considerado vão de 150mm para cortineiro não instalado.</p>
            )}
          </>
        )}
      </FieldGroup>

      {/* P4 Rodapé */}
      <FieldGroup titulo="Rodapé">
        <p className={styles.pergunta}>Existe rodapé na região dos móveis?</p>
        {simNao('rodape')}
        {resp.rodape === true && (
          <p className={styles.aviso}>
            AVISO: Roupeiros serão instalados à frente do rodapé existente, com acabamento em meia-cana na parte de trás.
          </p>
        )}
        {resp.rodape === false && (
          <p className={styles.aviso}>
            CC: O cliente deverá instalar rodapé na região dos móveis somente após a finalização da montagem.
          </p>
        )}
      </FieldGroup>

      {/* P5 Observações */}
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
