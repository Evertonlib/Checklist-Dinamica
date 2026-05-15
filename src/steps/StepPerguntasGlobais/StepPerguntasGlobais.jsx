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
    respondido(g.g2_temReboco) &&
    (g.g2_temReboco === true || g.g2_ambientesSemReboco.length > 0)

  const g3Ok =
    respondido(g.g3_temRevestimento) &&
    (g.g3_temRevestimento === true || g.g3_ambientesSemRevestimento.length > 0)

  const g4Ok =
    respondido(g.g3_pontosNaPosicaoFinal) &&
    (g.g3_pontosNaPosicaoFinal === true || g.g3_ambientesPendentes.length > 0)

  const g5Ok =
    respondido(g.g4_temRebaixo) &&
    (g.g4_temRebaixo === false ||
      (g.g4_ambientes.length > 0 &&
        g.g4_ambientes.every((ambiente) => String(ambiente.cm ?? '').trim() !== '')))

  const tudoOk = g1Ok && g2Ok && g3Ok && g4Ok && g5Ok

  const voltar = () => {
    dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: 'ambientes' })
    navigate('/ambientes')
  }

  const avancar = () => {
    if (!tudoOk) {
      const primeiroIncompleto = !g1Ok ? 'bloco-g1'
        : !g2Ok ? 'bloco-g2'
        : !g3Ok ? 'bloco-g3'
        : !g4Ok ? 'bloco-g4'
        : 'bloco-g5'
      document.getElementById(primeiroIncompleto)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

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
      <div id="bloco-g1"><BlocoIluminacao /></div>
      <BlocoReforma />
      <div id="bloco-g4"><BlocoPontosUtilidades /></div>
      <div id="bloco-g5"><BlocoRebaixo /></div>
      <div className={styles.espacoBar} />
      <BottomBar
        onVoltar={voltar}
        onAvancar={avancar}
        avancarDisabled={false}
        avancarLabel={avancarLabel}
      />
    </div>
  )
}
