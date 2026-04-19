import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useFormContext } from '../../context/FormContext.js'
import { calcularScore } from '../../domain/scoreEngine.js'
import { construirCCs } from '../../domain/ccBuilder.js'
import { gerarPdf } from '../../services/pdf.js'
import { ScoreBadge } from '../../components/ScoreBadge/ScoreBadge.jsx'
import styles from './StepRevisao.module.css'

export function StepRevisao() {
  const { state, dispatch } = useFormContext()
  const navigate = useNavigate()
  const [gerando, setGerando] = useState(false)
  const [erroPdf, setErroPdf] = useState('')

  const { scoreGlobal, scorePorAmbiente, gatilhosAtivados } = calcularScore(state)
  const ccs = construirCCs(state, gatilhosAtivados)

  const ccsCC = ccs.filter((c) => c.tipo === 'CC')
  const avisos = ccs.filter((c) => c.tipo === 'AVISO')

  const irParaEtapa = (rota) => {
    dispatch({ type: 'SET_META', campo: 'origemNavegacao', valor: 'revisao' })
    navigate(rota)
  }

  const handleGerarPdf = async () => {
    setGerando(true)
    setErroPdf('')
    try {
      await gerarPdf(state)
      navigate('/sucesso')
    } catch (e) {
      setErroPdf('Não foi possível gerar o PDF agora — tente novamente.')
    } finally {
      setGerando(false)
    }
  }

  const nomeAmbiente = (escopo) => {
    if (escopo === 'Global') return 'Global'
    const amb = state.ambientesSelecionados.find((a) => a.instanceId === escopo)
    return amb ? (amb.nome || amb.label) : escopo
  }

  return (
    <div className={styles.pagina}>
      <h2 className={styles.titulo}>Revisão do Preenchimento</h2>

      {/* Score global */}
      <div className={styles.scoreBox}>
        <ScoreBadge classificacao={scoreGlobal.classificacao} pontos={scoreGlobal.pontos} />
        {scoreGlobal.isAlto && Object.values(scorePorAmbiente).some((s) => s.isAlto) && (
          <p className={styles.explicacaoAlto}>
            Risco global classificado como ALTO porque um ou mais ambientes apresentam condição de risco alto.
          </p>
        )}
      </div>

      {/* Score por ambiente */}
      {state.ambientesSelecionados.length > 0 && (
        <div className={styles.secao}>
          <h3>Por Ambiente</h3>
          {state.ambientesSelecionados.map((amb) => {
            const score = scorePorAmbiente[amb.instanceId]
            if (!score) return null
            return (
              <div key={amb.instanceId} className={styles.ambScore}>
                <span>{amb.nome || amb.label}</span>
                <ScoreBadge classificacao={score.classificacao} pontos={score.pontos} />
                <button className={styles.btnEditar} onClick={() => irParaEtapa(`/ambiente/${amb.instanceId}`)}>
                  Editar
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* CCs Alto */}
      {ccsCC.filter((c) => c.nivel === 'ALTO').length > 0 && (
        <div className={styles.secao}>
          <h3 className={styles.tituloAlto}>🔴 Risco Alto</h3>
          {ccsCC.filter((c) => c.nivel === 'ALTO').map((cc) => (
            <div key={cc.id} className={`${styles.ccCard} ${styles.cardAlto}`}>
              <span className={styles.ccAmbiente}>{nomeAmbiente(cc.escopo)}</span>
              <p>{cc.textoCompleto}</p>
            </div>
          ))}
        </div>
      )}

      {/* CCs Médio */}
      {ccsCC.filter((c) => c.nivel === 'MÉDIO').length > 0 && (
        <div className={styles.secao}>
          <h3 className={styles.tituloMedio}>🟡 Risco Médio</h3>
          {ccsCC.filter((c) => c.nivel === 'MÉDIO').map((cc) => (
            <div key={cc.id} className={`${styles.ccCard} ${styles.cardMedio}`}>
              <span className={styles.ccAmbiente}>{nomeAmbiente(cc.escopo)}</span>
              <p>{cc.textoCompleto}</p>
            </div>
          ))}
        </div>
      )}

      {/* CCs Baixo */}
      {ccsCC.filter((c) => c.nivel === 'BAIXO').length > 0 && (
        <div className={styles.secao}>
          <h3 className={styles.tituloBaixo}>🟢 Risco Baixo</h3>
          {ccsCC.filter((c) => c.nivel === 'BAIXO').map((cc) => (
            <div key={cc.id} className={`${styles.ccCard} ${styles.cardBaixo}`}>
              <span className={styles.ccAmbiente}>{nomeAmbiente(cc.escopo)}</span>
              <p>{cc.textoCompleto}</p>
            </div>
          ))}
        </div>
      )}

      {/* Avisos */}
      {avisos.length > 0 && (
        <div className={styles.secao}>
          <h3>Avisos</h3>
          {avisos.map((av) => (
            <div key={av.id} className={styles.avisoCard}>
              <span className={styles.ccAmbiente}>{nomeAmbiente(av.escopo)}</span>
              <p>{av.textoCompleto}</p>
            </div>
          ))}
        </div>
      )}

      {/* Links de navegação */}
      <div className={styles.linksEtapas}>
        <button className={styles.btnLink} onClick={() => irParaEtapa('/identificacao')}>
          ✏️ Editar Identificação
        </button>
        <button className={styles.btnLink} onClick={() => irParaEtapa('/ambientes')}>
          ✏️ Editar Ambientes
        </button>
        <button className={styles.btnLink} onClick={() => irParaEtapa('/globais')}>
          ✏️ Editar Perguntas Gerais
        </button>
      </div>

      {/* Erro PDF */}
      {erroPdf && <p className={styles.erroPdf}>{erroPdf}</p>}

      {/* Botão PDF */}
      <div className={styles.espacoBar} />
      <div className={styles.botoesBottom}>
        <button
          className={styles.btnGerar}
          onClick={handleGerarPdf}
          disabled={gerando}
        >
          {gerando ? 'Gerando PDF…' : '📄 Gerar PDF'}
        </button>
        {erroPdf && (
          <button className={styles.btnGerar} onClick={handleGerarPdf}>
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  )
}
