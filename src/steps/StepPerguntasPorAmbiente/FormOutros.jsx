import { useFormContext } from '../../context/FormContext.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import { FormCozinha } from './FormCozinha.jsx'
import { FormDormitorio } from './FormDormitorio.jsx'
import { FormHomeSalaOffice } from './FormHomeSalaOffice.jsx'
import { FormBanheiro } from './FormBanheiro.jsx'
import styles from './StepPerguntasPorAmbiente.module.css'

const TIPOS_CUBA = ['Embutir', 'Semi-encaixe', 'Sobrepor', 'Apoio', 'Esculpida']
const TAMANHOS_CAMA = [
  { value: 'solteiro', label: 'Solteiro (0,88 × 1,88 m)' },
  { value: 'padrao',   label: 'Padrão (1,38 × 1,88 m)' },
  { value: 'queen',    label: 'Queen (1,58 × 1,98 m)' },
  { value: 'king',     label: 'King (2,00 × 2,03 m)' },
  { value: 'outro',    label: 'Outro' },
]
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
const ELETRONICOS_CONFIG = [
  { tipo: 'TV' }, { tipo: 'Home Theater' }, { tipo: 'Videogame' }, { tipo: 'Computador' }, { tipo: 'Outros' },
]

export function FormOutros({ instanceId, erros = {} }) {
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
      {/* 1. Granito */}
      <FieldGroup titulo="1. Granito ou Pia Existente">
        <p className={styles.pergunta}>Existe granito ou pia existente no local?</p>
        {simNao('granito')}
        {resp.granito === true && (
          <>
            <p className={styles.subpergunta}>Os móveis serão adaptados?</p>
            {simNao('granitoadaptar')}
            {resp.granitoadaptar === false && <p className={styles.aviso}>CC: Retirada do granito até o dia da montagem.</p>}
          </>
        )}
      </FieldGroup>

      {/* 2. Tanque */}
      <FieldGroup titulo="2. Tanque Existente">
        <p className={styles.pergunta}>Existe tanque no local?</p>
        {simNao('tanque')}
        {resp.tanque === true && (
          <>
            <p className={styles.subpergunta}>Haverá móveis na região do tanque?</p>
            {simNao('tanqueMoveis')}
            {resp.tanqueMoveis === true && <p className={styles.aviso}>CC: Retirada do tanque até o dia da montagem.</p>}
          </>
        )}
      </FieldGroup>

      {/* 3. TV */}
      <FieldGroup titulo="3. TV">
        <p className={styles.pergunta}>Terá TV neste ambiente?</p>
        {simNao('tv')}
        {resp.tv === true && (
          <>
            <p className={styles.subpergunta}>O ponto elétrico da TV já está na posição final?</p>
            {simNao('tvPontoFinal')}
            {resp.tvPontoFinal === false && <p className={styles.aviso}>CC: Deslocar pontos elétricos até o dia da montagem.</p>}
            <div className={styles.tvCampos}>
              <div className={styles.campo}><label>Polegadas *</label>
                <input type="number" value={resp.tv_polegadas ?? ''} onChange={(e) => set('tv_polegadas', e.target.value)} />
                {erros.tv_polegadas && <span className={styles.erro}>{erros.tv_polegadas}</span>}
              </div>
              <div className={styles.campo}><label>Modelo (opcional)</label><input value={resp.tv_modelo || ''} onChange={(e) => set('tv_modelo', e.target.value)} /></div>
              <div className={styles.linha3}>
                <div className={styles.campo}><label>Largura (cm)</label><input type="number" value={resp.tv_largura_cm ?? ''} onChange={(e) => set('tv_largura_cm', e.target.value)} /></div>
                <div className={styles.campo}><label>Altura (cm)</label><input type="number" value={resp.tv_altura_cm ?? ''} onChange={(e) => set('tv_altura_cm', e.target.value)} /></div>
                <div className={styles.campo}><label>Profundidade (cm)</label><input type="number" value={resp.tv_profundidade_cm ?? ''} onChange={(e) => set('tv_profundidade_cm', e.target.value)} /></div>
              </div>
              <div className={styles.campo}><label>Link (opcional)</label><input value={resp.tv_link || ''} onChange={(e) => set('tv_link', e.target.value)} placeholder="Cole aqui o link do produto, se tiver" /></div>
            </div>
          </>
        )}
      </FieldGroup>

      {/* 4. Cortineiro */}
      <FieldGroup titulo="4. Cortineiro">
        <p className={styles.pergunta}>Haverá cortineiro neste ambiente?</p>
        {simNao('cortineiro')}
        {resp.cortineiro === true && (
          <>
            <p className={styles.subpergunta}>O cortineiro já está instalado?</p>
            {simNao('cortieneiroInstalado')}
            {resp.cortieneiroInstalado === false && <p className={styles.aviso}>AVISO: Vão de 150mm será considerado.</p>}
          </>
        )}
      </FieldGroup>

      {/* 5. Rodapé */}
      <FieldGroup titulo="5. Rodapé">
        <p className={styles.pergunta}>Existe rodapé na região dos móveis?</p>
        {simNao('rodape')}
        {resp.rodape === true && <p className={styles.aviso}>AVISO: Roupeiros instalados à frente do rodapé, com meia-cana.</p>}
        {resp.rodape === false && <p className={styles.aviso}>CC: Instalar rodapé somente após a montagem.</p>}
      </FieldGroup>

      {/* 6. Cama */}
      <FieldGroup titulo="6. Tamanho de Cama">
        <p className={styles.pergunta}>Qual o tamanho da cama? (se aplicável)</p>
        <div className={styles.opcoesCama}>
          {TAMANHOS_CAMA.map((t) => (
            <button key={t.value} className={`${styles.opcaoCama} ${resp.tamanhoCama === t.value ? styles.ativo : ''}`} onClick={() => set('tamanhoCama', t.value)}>{t.label}</button>
          ))}
        </div>
        {resp.tamanhoCama === 'outro' && (
          <div className={styles.linha2}>
            <div className={styles.campo}><label>Largura (cm)</label><input type="number" value={resp.camaLargura_cm ?? ''} onChange={(e) => set('camaLargura_cm', e.target.value)} /></div>
            <div className={styles.campo}><label>Comprimento (cm)</label><input type="number" value={resp.camaComprimento_cm ?? ''} onChange={(e) => set('camaComprimento_cm', e.target.value)} /></div>
          </div>
        )}
      </FieldGroup>

      {/* 7. Eletrodomésticos */}
      <FieldGroup titulo="7. Eletrodomésticos">
        <p className={styles.pergunta}>Já possui ou tem intenção de compra específica dos eletrodomésticos?</p>
        {simNao('eletrosDefined')}
        {resp.eletrosDefined === false && <p className={styles.aviso}>CC: Eletrodomésticos serão adquiridos conforme os vãos.</p>}
        {resp.eletrosDefined === true && (
          <div className={styles.eletroArea}>
            <div className={styles.eletroGrid}>
              {ELETROS_CONFIG.map((cfg) => (
                <button key={cfg.tipo} className={styles.btnEletro} onClick={() =>
                  dispatch({ type: 'ADD_ELETRO', instanceId, eletro: { tipo: cfg.tipo, subtipo: cfg.subtipos[0] ?? '', modelo: '', largura_cm: '', altura_cm: '', profundidade_cm: '', link: '' } })
                }>+ {cfg.tipo}</button>
              ))}
            </div>
            {(resp.eletros || []).map((el, i) => {
              const cfg = ELETROS_CONFIG.find((c) => c.tipo === el.tipo) || { subtipos: [] }
              return (
                <div key={i} className={styles.eletroCard}>
                  <div className={styles.eletroHeader}><strong>{el.tipo}</strong><button onClick={() => dispatch({ type: 'REMOVE_ELETRO', instanceId, index: i })} className={styles.btnRemover}>✕</button></div>
                  {cfg.subtipos.length > 0 && <div className={styles.campo}><label>Subtipo *</label><select value={el.subtipo} onChange={(e) => dispatch({ type: 'UPDATE_ELETRO', instanceId, index: i, campo: 'subtipo', valor: e.target.value })}>{cfg.subtipos.map((s) => <option key={s}>{s}</option>)}</select></div>}
                  <div className={styles.linha3}>
                    <div className={styles.campo}><label>Largura (cm) *</label><input type="number" value={el.largura_cm} onChange={(e) => dispatch({ type: 'UPDATE_ELETRO', instanceId, index: i, campo: 'largura_cm', valor: e.target.value })} /></div>
                    <div className={styles.campo}><label>Altura (cm) *</label><input type="number" value={el.altura_cm} onChange={(e) => dispatch({ type: 'UPDATE_ELETRO', instanceId, index: i, campo: 'altura_cm', valor: e.target.value })} /></div>
                    <div className={styles.campo}><label>Profundidade (cm) *</label><input type="number" value={el.profundidade_cm} onChange={(e) => dispatch({ type: 'UPDATE_ELETRO', instanceId, index: i, campo: 'profundidade_cm', valor: e.target.value })} /></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </FieldGroup>

      {/* 8. Cuba */}
      <FieldGroup titulo="8. Cuba">
        <p className={styles.pergunta}>Tipo de cuba: (se aplicável)</p>
        <div className={styles.chips}>
          {TIPOS_CUBA.map((t) => (
            <button key={t} className={resp.cuba === t ? styles.chipAtivo : styles.chip} onClick={() => set('cuba', t)}>{t}</button>
          ))}
        </div>
      </FieldGroup>

      {/* 9. Eletrônicos */}
      <FieldGroup titulo="9. Eletrônicos">
        <p className={styles.pergunta}>Possui ou pretende adquirir eletrônicos para este ambiente?</p>
        {simNao('eletronicos')}
        {resp.eletronicos === false && <p className={styles.aviso}>CC: Eletrônicos serão adquiridos conforme os vãos.</p>}
        {resp.eletronicos === true && (
          <div className={styles.eletroArea}>
            <div className={styles.eletroGrid}>
              {ELETRONICOS_CONFIG.map((cfg) => (
                <button key={cfg.tipo} className={styles.btnEletro} onClick={() =>
                  dispatch({ type: 'ADD_ELETRONICO', instanceId, eletronico: { tipo: cfg.tipo, modelo: '', largura_cm: '', altura_cm: '', link: '' } })
                }>+ {cfg.tipo}</button>
              ))}
            </div>
            {(resp.eletronicosList || []).map((el, i) => (
              <div key={i} className={styles.eletroCard}>
                <div className={styles.eletroHeader}><strong>{el.tipo}</strong><button onClick={() => dispatch({ type: 'REMOVE_ELETRONICO', instanceId, index: i })} className={styles.btnRemover}>✕</button></div>
                <div className={styles.linha2}>
                  <div className={styles.campo}><label>Largura (cm) *</label><input type="number" value={el.largura_cm} onChange={(e) => dispatch({ type: 'UPDATE_ELETRONICO', instanceId, index: i, campo: 'largura_cm', valor: e.target.value })} /></div>
                  <div className={styles.campo}><label>Altura (cm) *</label><input type="number" value={el.altura_cm} onChange={(e) => dispatch({ type: 'UPDATE_ELETRONICO', instanceId, index: i, campo: 'altura_cm', valor: e.target.value })} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </FieldGroup>

      {/* 10. Observações */}
      <FieldGroup titulo="10. Observações (opcional)">
        <textarea className={styles.textarea} value={resp.observacoes || ''} maxLength={300} onChange={(e) => set('observacoes', e.target.value)} placeholder="Observações adicionais..." rows={3} />
        <span className={styles.contador}>{(resp.observacoes || '').length}/300</span>
      </FieldGroup>
    </div>
  )
}
