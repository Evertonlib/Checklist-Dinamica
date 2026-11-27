import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFormContextVendedor } from '../../../context/FormContextVendedor.js'
import { BottomBar } from '../../../components/BottomBar/BottomBar.jsx'
import { obterGrupo } from '../../../domain/gruposPerguntasVendedor.js'
import { validarRespostasGrupo } from '../../../domain/validacaoVendedor.js'
import { FormGrupoA } from './FormGrupoA.jsx'
import { FormGrupoB } from './FormGrupoB.jsx'
import { FormGrupoC } from './FormGrupoC.jsx'
import { scrollToFirstError } from '../../../utils/scrollUtils.js'
import styles from './StepPerguntasAmbienteVendedor.module.css'

const FORM_MAP = { A: FormGrupoA, B: FormGrupoB, C: FormGrupoC }

export function StepPerguntasAmbienteVendedor() {
  const { instanceId } = useParams()
  const { state, dispatch } = useFormContextVendedor()
  const navigate = useNavigate()
  const [erros, setErros] = useState({})

  const instancia = state.ambientesSelecionados.find((ambiente) => ambiente.instanceId === instanceId)
  if (!instancia) return <p style={{ padding: 16 }}>Ambiente não encontrado.</p>

  const grupo = obterGrupo(instancia.tipo)
  const FormComponent = FORM_MAP[grupo]
  const resp = state.respostasPorAmbiente[instanceId] || {}

  const idx = state.ambientesSelecionados.findIndex((ambiente) => ambiente.instanceId === instanceId)
  const anterior = state.ambientesSelecionados[idx - 1]
  const proximo = state.ambientesSelecionados[idx + 1]

  useEffect(() => {
    setErros({})
  }, [instanceId])

  useEffect(() => {
    if (Object.keys(erros).length > 0) scrollToFirstError()
  }, [erros])

  const validar = () => {
    const novosErros = validarRespostasGrupo(grupo, resp)
    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const limparErrosPuxadores = () => {
    setErros((prev) => {
      const chaves = Object.keys(prev)
      const temErroPuxador = chaves.some((k) => k === 'puxadores' || k.startsWith('puxador_'))
      if (!temErroPuxador) return prev
      const proximoErros = {}
      for (const k of chaves) {
        if (k !== 'puxadores' && !k.startsWith('puxador_')) proximoErros[k] = prev[k]
      }
      return proximoErros
    })
  }

  const voltar = () => {
    if (anterior) {
      dispatch({ type: 'SET_META_VENDEDOR', campo: 'etapaAtual', valor: `ambiente/${anterior.instanceId}` })
      navigate(`/vendedor/ambiente/${anterior.instanceId}`)
      return
    }

    dispatch({ type: 'SET_META_VENDEDOR', campo: 'etapaAtual', valor: 'ambientes' })
    navigate('/vendedor/ambientes')
  }

  const avancar = () => {
    if (!validar()) return

    if (proximo) {
      dispatch({ type: 'SET_META_VENDEDOR', campo: 'etapaAtual', valor: `ambiente/${proximo.instanceId}` })
      navigate(`/vendedor/ambiente/${proximo.instanceId}`)
      return
    }

    dispatch({ type: 'SET_META_VENDEDOR', campo: 'etapaAtual', valor: 'revisao' })
    navigate('/vendedor/revisao')
  }

  const avancarLabel = proximo ? 'Avançar' : 'Ir para Revisão'

  return (
    <div className={styles.pagina}>
      <FormComponent
        instanceId={instanceId}
        erros={erros}
        onLimparErrosPuxadores={limparErrosPuxadores}
      />
      <div className={styles.espacoBar} />
      <BottomBar onVoltar={voltar} onAvancar={avancar} avancarLabel={avancarLabel} mostrarBotaoVendedor={false} />
    </div>
  )
}
