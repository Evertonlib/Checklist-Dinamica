import { useFormContext } from '../../context/FormContext.js'
import {
  TEXTO_CORTINEIRO_NAO_INSTALADO,
  TEXTO_ELETRONICOS_NAO_DEFINIDOS,
  TEXTO_RODAPE_AUSENTE,
  TEXTO_TV_PONTO_FORA,
} from '../../domain/checklistTextos.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import { ELETRONICOS_CONFIG } from './formUtils.js'
import styles from './StepPerguntasPorAmbiente.module.css'

export function FormHomeSalaOffice({ instanceId, erros = {} }) {
  const { state, dispatch } = useFormContext()
  const resp = state.respostasPorAmbiente[instanceId] || {}

  const set = (campo, valor) =>
    dispatch({ type: 'SET_RESPOSTA_AMBIENTE', instanceId, campo, valor })

  const addEletronico = (tipo) => {
    const config = ELETRONICOS_CONFIG.find((item) => item.tipo === tipo)
    dispatch({
      type: 'ADD_ELETRONICO',
      instanceId,
      eletronico: {
        tipo,
        subtipo: config?.subtipos?.[0] ?? '',
        modelo: '',
        largura_cm: '',
        altura_cm: '',
        link: '',
      },
    })
  }

  const updEletronico = (index, campo, valor) =>
    dispatch({ type: 'UPDATE_ELETRONICO', instanceId, index, campo, valor })

  const remEletronico = (index) =>
    dispatch({ type: 'REMOVE_ELETRONICO', instanceId, index })

  const simNao = (campo, onFalse) => (
    <div className={styles.botoesSimNao}>
      <button className={resp[campo] === true ? styles.ativo : ''} onClick={() => set(campo, true)}>Sim</button>
      <button
        className={resp[campo] === false ? styles.ativo : ''}
        onClick={() => {
          set(campo, false)
          onFalse?.()
        }}
      >
        Não
      </button>
    </div>
  )

  return (
    <div>
      <FieldGroup titulo="Eletrônicos">
        <p className={styles.pergunta}>
          Possui ou pretende adquirir eletrônicos para este ambiente?
        </p>
        {simNao('eletronicos')}
        {erros.eletronicos && <span className={`${styles.erro} erro-campo`}>{erros.eletronicos}</span>}
        {resp.eletronicos === false && (
          <p className={styles.aviso}>CC: {TEXTO_ELETRONICOS_NAO_DEFINIDOS}</p>
        )}
        {resp.eletronicos === true && (
          <div className={styles.eletroArea}>
            <div className={styles.eletroGrid}>
              {ELETRONICOS_CONFIG.map((config) => (
                <button key={config.tipo} className={styles.btnEletro} onClick={() => addEletronico(config.tipo)}>
                  + {config.tipo}
                </button>
              ))}
            </div>
            {erros.eletronicosList && <span className={`${styles.erro} erro-campo`}>{erros.eletronicosList}</span>}

            {(resp.eletronicosList || []).map((eletronico, index) => {
              const config = ELETRONICOS_CONFIG.find((item) => item.tipo === eletronico.tipo) || { subtipos: [] }

              return (
                <div key={index} className={styles.eletroCard}>
                  <div className={styles.eletroHeader}>
                    <strong>{eletronico.tipo}</strong>
                    <button onClick={() => remEletronico(index)} className={styles.btnRemover}>✕</button>
                  </div>

                  {config.subtipos.length > 0 && (
                    <div className={styles.campo}>
                      <label>Subtipo *</label>
                      <select
                        value={eletronico.subtipo}
                        onChange={(e) => updEletronico(index, 'subtipo', e.target.value)}
                      >
                        {config.subtipos.map((subtipo) => <option key={subtipo}>{subtipo}</option>)}
                      </select>
                      {erros[`eletronico_${index}_subtipo`] && (
                        <span className={`${styles.erro} erro-campo`}>{erros[`eletronico_${index}_subtipo`]}</span>
                      )}
                    </div>
                  )}

                  <div className={styles.campo}>
                    <label>Modelo (opcional)</label>
                    <input value={eletronico.modelo} onChange={(e) => updEletronico(index, 'modelo', e.target.value)} />
                  </div>

                  <div className={styles.linha2}>
                    <div className={styles.campo}>
                      <label>Largura (cm) *</label>
                      <input
                        type="number"
                        value={eletronico.largura_cm}
                        onChange={(e) => updEletronico(index, 'largura_cm', e.target.value)}
                      />
                      {erros[`eletronico_${index}_largura`] && (
                        <span className={`${styles.erro} erro-campo`}>{erros[`eletronico_${index}_largura`]}</span>
                      )}
                    </div>
                    <div className={styles.campo}>
                      <label>Altura (cm) *</label>
                      <input
                        type="number"
                        value={eletronico.altura_cm}
                        onChange={(e) => updEletronico(index, 'altura_cm', e.target.value)}
                      />
                      {erros[`eletronico_${index}_altura`] && (
                        <span className={`${styles.erro} erro-campo`}>{erros[`eletronico_${index}_altura`]}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.campo}>
                    <label>Link (opcional)</label>
                    <input
                      value={eletronico.link}
                      onChange={(e) => updEletronico(index, 'link', e.target.value)}
                      placeholder="Cole aqui o link do produto, se tiver"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </FieldGroup>

      <FieldGroup titulo="TV">
        <p className={styles.pergunta}>Terá TV neste ambiente?</p>
        {simNao('tv')}
        {erros.tv && <span className={`${styles.erro} erro-campo`}>{erros.tv}</span>}
        {resp.tv === true && (
          <>
            <p className={styles.subpergunta}>O ponto elétrico da TV já está na posição final?</p>
            {simNao('tvPontoFinal')}
            {erros.tvPontoFinal && <span className={`${styles.erro} erro-campo`}>{erros.tvPontoFinal}</span>}
            {resp.tvPontoFinal === false && (
              <p className={styles.aviso}>CC: {TEXTO_TV_PONTO_FORA}</p>
            )}
            <div className={styles.tvCampos}>
              <div className={styles.campo}>
                <label>Polegadas *</label>
                <input
                  type="number"
                  value={resp.tv_polegadas ?? ''}
                  onChange={(e) => set('tv_polegadas', e.target.value)}
                />
                {erros.tv_polegadas && <span className={`${styles.erro} erro-campo`}>{erros.tv_polegadas}</span>}
              </div>
              <div className={styles.campo}>
                <label>Modelo (opcional)</label>
                <input value={resp.tv_modelo || ''} onChange={(e) => set('tv_modelo', e.target.value)} />
              </div>
              <div className={styles.linha3}>
                <div className={styles.campo}>
                  <label>Largura (cm)</label>
                  <input
                    type="number"
                    value={resp.tv_largura_cm ?? ''}
                    onChange={(e) => set('tv_largura_cm', e.target.value)}
                  />
                </div>
                <div className={styles.campo}>
                  <label>Altura (cm)</label>
                  <input
                    type="number"
                    value={resp.tv_altura_cm ?? ''}
                    onChange={(e) => set('tv_altura_cm', e.target.value)}
                  />
                </div>
                <div className={styles.campo}>
                  <label>Profundidade (cm)</label>
                  <input
                    type="number"
                    value={resp.tv_profundidade_cm ?? ''}
                    onChange={(e) => set('tv_profundidade_cm', e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.campo}>
                <label>Link (opcional)</label>
                <input
                  value={resp.tv_link || ''}
                  onChange={(e) => set('tv_link', e.target.value)}
                  placeholder="Cole aqui o link do produto, se tiver"
                />
              </div>
            </div>
          </>
        )}
      </FieldGroup>

      <FieldGroup titulo="Cortineiro">
        <p className={styles.pergunta}>Haverá cortineiro neste ambiente?</p>
        {simNao('cortineiro')}
        {erros.cortineiro && <span className={`${styles.erro} erro-campo`}>{erros.cortineiro}</span>}
        {resp.cortineiro === true && (
          <>
            <p className={styles.subpergunta}>O cortineiro já está instalado?</p>
            {simNao('cortieneiroInstalado')}
            {erros.cortieneiroInstalado && (
              <span className={`${styles.erro} erro-campo`}>{erros.cortieneiroInstalado}</span>
            )}
            {resp.cortieneiroInstalado === false && (
              <p className={styles.aviso}>{TEXTO_CORTINEIRO_NAO_INSTALADO}</p>
            )}
          </>
        )}
      </FieldGroup>

      <FieldGroup titulo="Rodapé">
        <p className={styles.pergunta}>Existe rodapé na região dos móveis?</p>
        {simNao('rodape')}
        {erros.rodape && <span className={`${styles.erro} erro-campo`}>{erros.rodape}</span>}
        {resp.rodape === false && (
          <p className={styles.aviso}>CC: {TEXTO_RODAPE_AUSENTE}</p>
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
