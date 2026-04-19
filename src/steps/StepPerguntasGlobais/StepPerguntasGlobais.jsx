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

  const respondido = (val) => val !== null && val !== undefined

  const tudo_ok =
    respondido(g.g1_temIluminacaoExterna) &&
    respondido(g.g2_temReforma) &&
    (g.g2_temReforma === false ||
      (respondido(g.g2_1_temReboco) &&
        (g.g2_1_temReboco === false ||
          respondido(g.g2_2_temRevestimento)))) &&
    respondido(g.g3_pontosNaPosicaoFinal) &&
    respondido(g.g4_temRebaixo)

  const voltar = () => {
    dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: 'ambientes' })
    navigate('/ambientes')
  }

  const avancar = () => {
    if (!tudo_ok) return
    const origem = state._meta.origemNavegacao
    dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: `ambiente/${ambientesSelecionados[0]?.instanceId}` })
    if (origem === 'revisao') {
      dispatch({ type: 'SET_META', campo: 'origemNavegacao', valor: null })
      navigate('/revisao')
    } else {
      navigate(`/ambiente/${ambientesSelecionados[0]?.instanceId}`)
    }
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
        avancarDisabled={!tudo_ok}
        avancarLabel={avancarLabel}
      />
    </div>
  )
}
