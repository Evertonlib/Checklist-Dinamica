import { useFormContext } from '../../context/FormContext.js'
import {
  TEXTO_CORTINEIRO_NAO_INSTALADO,
  TEXTO_ELETRONICOS_NAO_DEFINIDOS,
  TEXTO_ELETROS_NAO_DEFINIDOS,
  TEXTO_GRANITO_RETIRAR,
  TEXTO_RODAPE_AUSENTE,
  TEXTO_RODAPE_EXISTENTE,
  TEXTO_TANQUE_RETIRAR,
  TEXTO_TV_PONTO_FORA,
} from '../../domain/checklistTextos.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import {
  ELETRONICOS_CONFIG,
  ELETROS_CONFIG,
  TAMANHOS_CAMA,
  TIPOS_CUBA,
} from './formUtils.js'
import styles from './StepPerguntasPorAmbiente.module.css'

export function FormOutros({ instanceId, erros = {} }) {
  const { state, dispatch } = useFormContext()
  const resp = state.respostasPorAmbiente[instanceId] || {}

  const set = (campo, valor) =>
    dispatch({ type: 'SET_RESPOSTA_AMBIENTE', instanceId, campo, valor })

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

  return (
    <div>
      <FieldGroup titulo="1. Granito ou Pia Existente">
        <p className={styles.pergunta}>Existe granito ou pia existente no local?</p>
        {simNao('granito')}
        {erros.granito && <span className={styles.erro}>{erros.granito}</span>}
        {resp.granito === true && (
          <>
            <p className={styles.subpergunta}>Os móveis serão adaptados?</p>
            {simNao('granitoadaptar')}
            {erros.granitoadaptar && <span className={styles.erro}>{erros.granitoadaptar}</span>}
            {resp.granitoadaptar === false && (
              <p className={styles.aviso}>CC: {TEXTO_GRANITO_RETIRAR}</p>
            )}
          </>
        )}
      </FieldGroup>

      <FieldGroup titulo="2. Tanque Existente">
        <p className={styles.pergunta}>Existe tanque no local?</p>
        {simNao('tanque')}
        {erros.tanque && <span className={styles.erro}>{erros.tanque}</span>}
        {resp.tanque === true && (
          <>
            <p className={styles.subpergunta}>Haverá móveis na região do tanque?</p>
            {simNao('tanqueMoveis')}
            {erros.tanqueMoveis && <span className={styles.erro}>{erros.tanqueMoveis}</span>}
            {resp.tanqueMoveis === true && (
              <p className={styles.aviso}>CC: {TEXTO_TANQUE_RETIRAR}</p>
            )}
          </>
        )}
      </FieldGroup>

      <FieldGroup titulo="3. TV">
        <p className={styles.pergunta}>Terá TV neste ambiente?</p>
        {simNao('tv')}
        {erros.tv && <span className={styles.erro}>{erros.tv}</span>}
        {resp.tv === true && (
          <>
            <p className={styles.subpergunta}>O ponto elétrico da TV já está na posição final?</p>
            {simNao('tvPontoFinal')}
            {erros.tvPontoFinal && <span className={styles.erro}>{erros.tvPontoFinal}</span>}
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
                {erros.tv_polegadas && <span className={styles.erro}>{erros.tv_polegadas}</span>}
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

      <FieldGroup titulo="4. Cortineiro">
        <p className={styles.pergunta}>Haverá cortineiro neste ambiente?</p>
        {simNao('cortineiro')}
        {erros.cortineiro && <span className={styles.erro}>{erros.cortineiro}</span>}
        {resp.cortineiro === true && (
          <>
            <p className={styles.subpergunta}>O cortineiro já está instalado?</p>
            {simNao('cortieneiroInstalado')}
            {erros.cortieneiroInstalado && (
              <span className={styles.erro}>{erros.cortieneiroInstalado}</span>
            )}
            {resp.cortieneiroInstalado === false && (
              <p className={styles.aviso}>{TEXTO_CORTINEIRO_NAO_INSTALADO}</p>
            )}
          </>
        )}
      </FieldGroup>

      <FieldGroup titulo="5. Rodapé">
        <p className={styles.pergunta}>Existe rodapé na região dos móveis?</p>
        {simNao('rodape')}
        {erros.rodape && <span className={styles.erro}>{erros.rodape}</span>}
        {resp.rodape === true && (
          <p className={styles.aviso}>AVISO: {TEXTO_RODAPE_EXISTENTE}</p>
        )}
        {resp.rodape === false && (
          <p className={styles.aviso}>CC: {TEXTO_RODAPE_AUSENTE}</p>
        )}
      </FieldGroup>

      <FieldGroup titulo="6. Tamanho de Cama">
        <p className={styles.pergunta}>Qual o tamanho da cama? (se aplicável)</p>
        <div className={styles.opcoesCama}>
          {TAMANHOS_CAMA.map((tamanho) => (
            <button
              key={tamanho.value}
              className={`${styles.opcaoCama} ${resp.tamanhoCama === tamanho.value ? styles.ativo : ''}`}
              onClick={() => set('tamanhoCama', tamanho.value)}
            >
              {tamanho.label}
            </button>
          ))}
        </div>
        {resp.tamanhoCama === 'outro' && (
          <div className={styles.linha2}>
            <div className={styles.campo}>
              <label>Largura (cm) *</label>
              <input
                type="number"
                value={resp.camaLargura_cm ?? ''}
                onChange={(e) => set('camaLargura_cm', e.target.value)}
              />
              {erros.camaLargura_cm && <span className={styles.erro}>{erros.camaLargura_cm}</span>}
            </div>
            <div className={styles.campo}>
              <label>Comprimento (cm) *</label>
              <input
                type="number"
                value={resp.camaComprimento_cm ?? ''}
                onChange={(e) => set('camaComprimento_cm', e.target.value)}
              />
              {erros.camaComprimento_cm && (
                <span className={styles.erro}>{erros.camaComprimento_cm}</span>
              )}
            </div>
          </div>
        )}
      </FieldGroup>

      <FieldGroup titulo="7. Eletrodomésticos">
        <p className={styles.pergunta}>Já possui ou tem intenção de compra específica dos eletrodomésticos?</p>
        {simNao('eletrosDefined')}
        {erros.eletrosDefined && <span className={styles.erro}>{erros.eletrosDefined}</span>}
        {resp.eletrosDefined === false && (
          <p className={styles.aviso}>CC: {TEXTO_ELETROS_NAO_DEFINIDOS}</p>
        )}
        {resp.eletrosDefined === true && (
          <div className={styles.eletroArea}>
            <div className={styles.eletroGrid}>
              {ELETROS_CONFIG.map((config) => (
                <button key={config.tipo} className={styles.btnEletro} onClick={() => addEletro(config.tipo)}>
                  + {config.tipo}
                </button>
              ))}
            </div>
            {erros.eletros && <span className={styles.erro}>{erros.eletros}</span>}

            {(resp.eletros || []).map((eletro, index) => {
              const config = ELETROS_CONFIG.find((item) => item.tipo === eletro.tipo) || { subtipos: [] }
              const depuradorEmbutido = eletro.tipo === 'Depurador' && eletro.subtipo === 'Embutido'

              return (
                <div key={index} className={styles.eletroCard}>
                  <div className={styles.eletroHeader}>
                    <strong>{eletro.tipo}</strong>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_ELETRO', instanceId, index })}
                      className={styles.btnRemover}
                    >
                      ✕
                    </button>
                  </div>

                  {config.subtipos.length > 0 && (
                    <div className={styles.campo}>
                      <label>Subtipo *</label>
                      <select
                        value={eletro.subtipo}
                        onChange={(e) => dispatch({
                          type: 'UPDATE_ELETRO',
                          instanceId,
                          index,
                          campo: 'subtipo',
                          valor: e.target.value,
                        })}
                      >
                        {config.subtipos.map((subtipo) => <option key={subtipo}>{subtipo}</option>)}
                      </select>
                      {erros[`eletro_${index}_subtipo`] && (
                        <span className={styles.erro}>{erros[`eletro_${index}_subtipo`]}</span>
                      )}
                    </div>
                  )}

                  {eletro.tipo === 'Outros' && (
                    <div className={styles.campo}>
                      <label>Qual eletro é? *</label>
                      <input
                        value={eletro.descricao || ''}
                        onChange={(e) => dispatch({
                          type: 'UPDATE_ELETRO',
                          instanceId,
                          index,
                          campo: 'descricao',
                          valor: e.target.value,
                        })}
                      />
                      {erros[`eletro_${index}_descricao`] && (
                        <span className={styles.erro}>{erros[`eletro_${index}_descricao`]}</span>
                      )}
                    </div>
                  )}

                  <div className={styles.linha3}>
                    <div className={styles.campo}>
                      <label>Largura (cm) *</label>
                      <input
                        type="number"
                        value={eletro.largura_cm}
                        onChange={(e) => dispatch({
                          type: 'UPDATE_ELETRO',
                          instanceId,
                          index,
                          campo: 'largura_cm',
                          valor: e.target.value,
                        })}
                      />
                      {erros[`eletro_${index}_largura`] && (
                        <span className={styles.erro}>{erros[`eletro_${index}_largura`]}</span>
                      )}
                    </div>
                    <div className={styles.campo}>
                      <label>Altura (cm) *</label>
                      <input
                        type="number"
                        value={eletro.altura_cm}
                        onChange={(e) => dispatch({
                          type: 'UPDATE_ELETRO',
                          instanceId,
                          index,
                          campo: 'altura_cm',
                          valor: e.target.value,
                        })}
                      />
                      {erros[`eletro_${index}_altura`] && (
                        <span className={styles.erro}>{erros[`eletro_${index}_altura`]}</span>
                      )}
                    </div>
                    <div className={styles.campo}>
                      <label>Profundidade (cm) *</label>
                      <input
                        type="number"
                        value={eletro.profundidade_cm}
                        onChange={(e) => dispatch({
                          type: 'UPDATE_ELETRO',
                          instanceId,
                          index,
                          campo: 'profundidade_cm',
                          valor: e.target.value,
                        })}
                      />
                      {erros[`eletro_${index}_prof`] && (
                        <span className={styles.erro}>{erros[`eletro_${index}_prof`]}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.campo}>
                    <label>Modelo {depuradorEmbutido ? '*' : '(opcional)'}</label>
                    <input
                      value={eletro.modelo || ''}
                      onChange={(e) => dispatch({
                        type: 'UPDATE_ELETRO',
                        instanceId,
                        index,
                        campo: 'modelo',
                        valor: e.target.value,
                      })}
                    />
                    {erros[`eletro_${index}_modelo`] && (
                      <span className={styles.erro}>{erros[`eletro_${index}_modelo`]}</span>
                    )}
                  </div>

                  <div className={styles.campo}>
                    <label>Link {depuradorEmbutido ? '*' : '(opcional)'}</label>
                    <input
                      value={eletro.link || ''}
                      onChange={(e) => dispatch({
                        type: 'UPDATE_ELETRO',
                        instanceId,
                        index,
                        campo: 'link',
                        valor: e.target.value,
                      })}
                      placeholder="Cole aqui o link do produto, se tiver"
                    />
                    {erros[`eletro_${index}_link`] && (
                      <span className={styles.erro}>{erros[`eletro_${index}_link`]}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </FieldGroup>

      <FieldGroup titulo="8. Cuba">
        <p className={styles.pergunta}>Tipo de cuba: (se aplicável)</p>
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
      </FieldGroup>

      <FieldGroup titulo="9. Eletrônicos">
        <p className={styles.pergunta}>Possui ou pretende adquirir eletrônicos para este ambiente?</p>
        {simNao('eletronicos')}
        {erros.eletronicos && <span className={styles.erro}>{erros.eletronicos}</span>}
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
            {erros.eletronicosList && <span className={styles.erro}>{erros.eletronicosList}</span>}

            {(resp.eletronicosList || []).map((eletronico, index) => {
              const config = ELETRONICOS_CONFIG.find((item) => item.tipo === eletronico.tipo) || { subtipos: [] }

              return (
                <div key={index} className={styles.eletroCard}>
                  <div className={styles.eletroHeader}>
                    <strong>{eletronico.tipo}</strong>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_ELETRONICO', instanceId, index })}
                      className={styles.btnRemover}
                    >
                      ✕
                    </button>
                  </div>

                  {config.subtipos.length > 0 && (
                    <div className={styles.campo}>
                      <label>Subtipo *</label>
                      <select
                        value={eletronico.subtipo}
                        onChange={(e) => dispatch({
                          type: 'UPDATE_ELETRONICO',
                          instanceId,
                          index,
                          campo: 'subtipo',
                          valor: e.target.value,
                        })}
                      >
                        {config.subtipos.map((subtipo) => <option key={subtipo}>{subtipo}</option>)}
                      </select>
                      {erros[`eletronico_${index}_subtipo`] && (
                        <span className={styles.erro}>{erros[`eletronico_${index}_subtipo`]}</span>
                      )}
                    </div>
                  )}

                  <div className={styles.campo}>
                    <label>Modelo (opcional)</label>
                    <input
                      value={eletronico.modelo || ''}
                      onChange={(e) => dispatch({
                        type: 'UPDATE_ELETRONICO',
                        instanceId,
                        index,
                        campo: 'modelo',
                        valor: e.target.value,
                      })}
                    />
                  </div>

                  <div className={styles.linha2}>
                    <div className={styles.campo}>
                      <label>Largura (cm) *</label>
                      <input
                        type="number"
                        value={eletronico.largura_cm}
                        onChange={(e) => dispatch({
                          type: 'UPDATE_ELETRONICO',
                          instanceId,
                          index,
                          campo: 'largura_cm',
                          valor: e.target.value,
                        })}
                      />
                      {erros[`eletronico_${index}_largura`] && (
                        <span className={styles.erro}>{erros[`eletronico_${index}_largura`]}</span>
                      )}
                    </div>
                    <div className={styles.campo}>
                      <label>Altura (cm) *</label>
                      <input
                        type="number"
                        value={eletronico.altura_cm}
                        onChange={(e) => dispatch({
                          type: 'UPDATE_ELETRONICO',
                          instanceId,
                          index,
                          campo: 'altura_cm',
                          valor: e.target.value,
                        })}
                      />
                      {erros[`eletronico_${index}_altura`] && (
                        <span className={styles.erro}>{erros[`eletronico_${index}_altura`]}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.campo}>
                    <label>Link (opcional)</label>
                    <input
                      value={eletronico.link || ''}
                      onChange={(e) => dispatch({
                        type: 'UPDATE_ELETRONICO',
                        instanceId,
                        index,
                        campo: 'link',
                        valor: e.target.value,
                      })}
                      placeholder="Cole aqui o link do produto, se tiver"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </FieldGroup>

      <FieldGroup titulo="10. Observações (opcional)">
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
