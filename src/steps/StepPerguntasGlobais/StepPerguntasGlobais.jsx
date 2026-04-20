import { useNavigate } from 'react-router-dom'
import { useFormContext } from '../../context/FormContext.js'
import { BlocoIluminacao } from './BlocoIluminacao.jsx'
import { BlocoReforma } from './BlocoReforma.jsx'
import { BlocoPontosUtilidades } from './BlocoPontosUtilidades.jsx'
import { BlocoRebaixo } from './BlocoRebaixo.jsx'
import { BottomBar } from '../../components/BottomBar/BottomBar.jsx'
import styles from './StepPerguntasGlobais.module.css'

export function StepPerguntasGlobais() {
  const { state, dispatch } = useFormContext()
  const navigate = useNavigate()
  const { global: g, ambientesSelecionados } = state

  const respondido = (valor) => valor !== null && valor !== undefined

  const g1Ok =
    respondido(g.g1_temIluminacaoExterna) &&
    (g.g1_temIluminacaoExterna === false || g.g1_ambientes.length > 0)

  const g2Ok =
    respondido(g.g2_temReforma) &&
    (g.g2_temReforma === false || g.g2_ambientes.length > 0)

  const g2_1Ok = g.g2_temReforma !== true || respondido(g.g2_1_temReboco)
  const g2_2Ok =
    g.g2_temReforma !== true ||
    g.g2_1_temReboco !== true ||
    respondido(g.g2_2_temRevestimento)

  const g3Ok =
    respondido(g.g3_pontosNaPosicaoFinal) &&
    (g.g3_pontosNaPosicaoFinal === true || g.g3_ambientesPendentes.length > 0)

  const g4Ok =
    respondido(g.g4_temRebaixo) &&
    (g.g4_temRebaixo === false ||
      (g.g4_ambientes.length > 0 &&
        g.g4_ambientes.every((ambiente) => String(ambiente.cm ?? '').trim() !== '')))

  const tudoOk = g1Ok && g2Ok && g2_1Ok && g2_2Ok && g3Ok && g4Ok

  const voltar = () => {
    dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: 'ambientes' })
    navigate('/ambientes')
  }

  const avancar = () => {
    if (!tudoOk) return

    const origem = state._meta.origemNavegacao
    if (origem === 'revisao') {
      dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: 'revisao' })
      dispatch({ type: 'SET_META', campo: 'origemNavegacao', valor: null })
      navigate('/revisao')
      return
    }

    dispatch({
      type: 'SET_META',
      campo: 'etapaAtual',
      valor: `ambiente/${ambientesSelecionados[0]?.instanceId}`,
    })
    navigate(`/ambiente/${ambientesSelecionados[0]?.instanceId}`)
  }

  const avancarLabel = state._meta.origemNavegacao === 'revisao'
    ? 'Salvar e voltar ao resumo'
    : 'Avançar'

  return (
    <div className={styles.pagina}>
      <BlocoIluminacao />
      <BlocoReforma />
      <BlocoPontosUtilidades />
      <BlocoRebaixo />
      <div className={styles.espacoBar} />
      <BottomBar
        onVoltar={voltar}
        onAvancar={avancar}
        avancarDisabled={!tudoOk}
        avancarLabel={avancarLabel}
      />
    </div>
  )
}
