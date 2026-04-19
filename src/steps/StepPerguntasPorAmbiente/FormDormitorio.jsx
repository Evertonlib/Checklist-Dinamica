import { useFormContext } from '../../context/FormContext.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import styles from './StepPerguntasPorAmbiente.module.css'

const TAMANHOS_CAMA = [
  { value: 'solteiro', label: 'Solteiro (0,88 × 1,88 m)' },
  { value: 'padrao',   label: 'Padrão (1,38 × 1,88 m)' },
  { value: 'queen',    label: 'Queen (1,58 × 1,98 m)' },
  { value: 'king',     label: 'King (2,00 × 2,03 m)' },
  { value: 'outro',    label: 'Outro' },
]

export function FormDormitorio({ instanceId, erros = {} }) {
  const { state, dispatch } = useFormContext()
  const resp = state.respostasPorAmbiente[instanceId] || {}

  const set = (campo, valor) =>
    dispatch({ type: 'SET_RESPOSTA_AMBIENTE', instanceId, campo, valor })

  const simNao = (campo, onFalse) => (
    <div className={styles.botoesSimNao}>
      <button className={resp[campo] === true ? styles.ativo : ''} onClick={() => set(campo, true)}>Sim</button>
      <button className={resp[campo] === false ? styles.ativo : ''} onClick={() => { set(campo, false); onFalse?.() }}>Não</button>
    </div>
  )

  return (
    <div>
      {/* P1 Tamanho da cama */}
      <FieldGroup titulo="Tamanho da Cama">
        <p className={styles.pergunta}>Qual o tamanho da cama neste ambiente?</p>
        <div className={styles.opcoesCama}>
          {TAMANHOS_CAMA.map((t) => (
            <button
              key={t.value}
              className={`${styles.opcaoCama} ${resp.tamanhoCama === t.value ? styles.ativo : ''}`}
              onClick={() => set('tamanhoCama', t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {erros.tamanhoCama && <span className={styles.erro}>{erros.tamanhoCama}</span>}
        {resp.tamanhoCama === 'outro' && (
          <div className={styles.linha2}>
            <div className={styles.campo}>
              <label>Largura (cm) *</label>
              <input type="number" value={resp.camaLargura_cm ?? ''} onChange={(e) => set('camaLargura_cm', e.target.value)} />
            </div>
            <div className={styles.campo}>
              <label>Comprimento (cm) *</label>
              <input type="number" value={resp.camaComprimento_cm ?? ''} onChange={(e) => set('camaComprimento_cm', e.target.value)} />
            </div>
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
              <p className={styles.aviso}>
                AVISO: Será considerado vão de 150mm para cortineiro não instalado.
              </p>
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
