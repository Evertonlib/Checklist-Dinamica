import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormContext } from '../../context/FormContext.js'
import { formatarNomeAmbiente } from '../../domain/ambientes.js'
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

  useEffect(() => {
    if (state._meta.origemNavegacao) {
      dispatch({ type: 'SET_META', campo: 'origemNavegacao', valor: null })
    }
  }, [dispatch, state._meta.origemNavegacao])

  const { scoreGlobal, scorePorAmbiente, gatilhosAtivados } = calcularScore(state)
  const ccs = construirCCs(state, gatilhosAtivados)

  const ccsCC = ccs.filter((cc) => cc.tipo === 'CC')
  const avisos = ccs.filter((cc) => cc.tipo === 'AVISO')

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
    } catch {
      setErroPdf('Não foi possível gerar o PDF agora — tente novamente.')
    } finally {
      setGerando(false)
    }
  }

  const nomeAmbiente = (escopo) => {
    if (escopo === 'Global') return 'Global'
    const ambiente = state.ambientesSelecionados.find((item) => item.instanceId === escopo)
    return ambiente ? formatarNomeAmbiente(ambiente) : escopo
  }

  return (
    <div className={styles.pagina}>
      <h2 className={styles.titulo}>Revisão do Preenchimento</h2>

      <div className={styles.scoreBox}>
        <ScoreBadge classificacao={scoreGlobal.classificacao} pontos={scoreGlobal.pontos} />
        {scoreGlobal.isAlto && Object.values(scorePorAmbiente).some((score) => score.isAlto) && (
          <p className={styles.explicacaoAlto}>
            Risco global classificado como ALTO porque um ou mais ambientes apresentam condição de risco alto.
          </p>
        )}
      </div>

      {state.ambientesSelecionados.length > 0 && (
        <div className={styles.secao}>
          <h3>Por Ambiente</h3>
          {state.ambientesSelecionados.map((ambiente) => {
            const score = scorePorAmbiente[ambiente.instanceId]
            if (!score) return null

            return (
              <div key={ambiente.instanceId} className={styles.ambScore}>
                <span>{formatarNomeAmbiente(ambiente)}</span>
                <ScoreBadge classificacao={score.classificacao} pontos={score.pontos} />
                <button className={styles.btnEditar} onClick={() => irParaEtapa(`/ambiente/${ambiente.instanceId}`)}>
                  Editar
                </button>
              </div>
            )
          })}
        </div>
      )}

      {ccsCC.filter((cc) => cc.nivel === 'ALTO').length > 0 && (
        <div className={styles.secao}>
          <h3 className={styles.tituloAlto}>🔴 Risco Alto</h3>
          {ccsCC.filter((cc) => cc.nivel === 'ALTO').map((cc) => (
            <div key={cc.id} className={`${styles.ccCard} ${styles.cardAlto}`}>
              <span className={styles.ccAmbiente}>{nomeAmbiente(cc.escopo)}</span>
              <p>{cc.textoCompleto}</p>
            </div>
          ))}
        </div>
      )}

      {ccsCC.filter((cc) => cc.nivel === 'MÉDIO').length > 0 && (
        <div className={styles.secao}>
          <h3 className={styles.tituloMedio}>🟡 Risco Médio</h3>
          {ccsCC.filter((cc) => cc.nivel === 'MÉDIO').map((cc) => (
            <div key={cc.id} className={`${styles.ccCard} ${styles.cardMedio}`}>
              <span className={styles.ccAmbiente}>{nomeAmbiente(cc.escopo)}</span>
              <p>{cc.textoCompleto}</p>
            </div>
          ))}
        </div>
      )}

      {ccsCC.filter((cc) => cc.nivel === 'BAIXO').length > 0 && (
        <div className={styles.secao}>
          <h3 className={styles.tituloBaixo}>🟢 Risco Baixo</h3>
          {ccsCC.filter((cc) => cc.nivel === 'BAIXO').map((cc) => (
            <div key={cc.id} className={`${styles.ccCard} ${styles.cardBaixo}`}>
              <span className={styles.ccAmbiente}>{nomeAmbiente(cc.escopo)}</span>
              <p>{cc.textoCompleto}</p>
            </div>
          ))}
        </div>
      )}

      {avisos.length > 0 && (
        <div className={styles.secao}>
          <h3>Avisos</h3>
          {avisos.map((aviso) => (
            <div key={aviso.id} className={styles.avisoCard}>
              <span className={styles.ccAmbiente}>{nomeAmbiente(aviso.escopo)}</span>
              <p>{aviso.textoCompleto}</p>
            </div>
          ))}
        </div>
      )}

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

      {erroPdf && <p className={styles.erroPdf}>{erroPdf}</p>}

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
