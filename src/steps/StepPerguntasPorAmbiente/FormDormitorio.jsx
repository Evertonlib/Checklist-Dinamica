import { useFormContext } from '../../context/FormContext.js'
import {
  TEXTO_CORTINEIRO_NAO_INSTALADO,
  TEXTO_RODAPE_AUSENTE,
  TEXTO_RODAPE_EXISTENTE,
  TEXTO_TV_PONTO_FORA,
} from '../../domain/checklistTextos.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import { TAMANHOS_CAMA } from './formUtils.js'
import styles from './StepPerguntasPorAmbiente.module.css'

export function FormDormitorio({ instanceId, erros = {} }) {
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
        NÃ£o
      </button>
    </div>
  )

  return (
    <div>
      <FieldGroup titulo="Tamanho da Cama">
        <p className={styles.pergunta}>Qual o tamanho da cama neste ambiente?</p>
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
        {erros.tamanhoCama && <span className={styles.erro}>{erros.tamanhoCama}</span>}
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
              {erros.camaComprimento_cm && <span className={styles.erro}>{erros.camaComprimento_cm}</span>}
            </div>
          </div>
        )}
      </FieldGroup>

      <FieldGroup titulo="TV">
        <p className={styles.pergunta}>TerÃ¡ TV neste ambiente?</p>
        {simNao('tv')}
        {erros.tv && <span className={styles.erro}>{erros.tv}</span>}
        {resp.tv === true && (
          <>
            <p className={styles.subpergunta}>O ponto elÃ©trico da TV jÃ¡ estÃ¡ na posiÃ§Ã£o final?</p>
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

      <FieldGroup titulo="Cortineiro">
        <p className={styles.pergunta}>HaverÃ¡ cortineiro neste ambiente?</p>
        {simNao('cortineiro')}
        {erros.cortineiro && <span className={styles.erro}>{erros.cortineiro}</span>}
        {resp.cortineiro === true && (
          <>
            <p className={styles.subpergunta}>O cortineiro jÃ¡ estÃ¡ instalado?</p>
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

      <FieldGroup titulo="RodapÃ©">
        <p className={styles.pergunta}>Existe rodapÃ© na regiÃ£o dos mÃ³veis?</p>
        {simNao('rodape')}
        {erros.rodape && <span className={styles.erro}>{erros.rodape}</span>}
        {resp.rodape === true && (
          <p className={styles.aviso}>AVISO: {TEXTO_RODAPE_EXISTENTE}</p>
        )}
        {resp.rodape === false && (
          <p className={styles.aviso}>CC: {TEXTO_RODAPE_AUSENTE}</p>
        )}
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
