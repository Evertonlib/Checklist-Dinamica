import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFormContextVendedor } from '../../../context/FormContextVendedor.js'
import { BottomBar } from '../../../components/BottomBar/BottomBar.jsx'
import { obterGrupo } from '../../../domain/gruposPerguntasVendedor.js'
import { FormGrupoA } from './FormGrupoA.jsx'
import { FormGrupoB } from './FormGrupoB.jsx'
import { FormGrupoC } from './FormGrupoC.jsx'
import { scrollToFirstError } from '../../../utils/scrollUtils.js'
import styles from './StepPerguntasAmbienteVendedor.module.css'

const FORM_MAP = { A: FormGrupoA, B: FormGrupoB, C: FormGrupoC }

const NAO_SE_APLICA = 'não se aplica'
const CAMPOS_ALTURA = ['alturaBalcao_mm', 'alturaArmario_mm']

const CAMPOS_OBRIGATORIOS_POR_GRUPO = {
  A: ['alturaBalcao_mm', 'alturaArmario_mm', 'fechamentoTeto', 'caixaria', 'dobradicas', 'corredicas'],
  B: ['caixaria', 'dobradicas', 'corredicas', 'fechamentoTeto'],
  C: ['caixaria', 'dobradicas', 'corredicas'],
}

function respostaValida(campo, valor) {
  if (valor === NAO_SE_APLICA) return true
  if (CAMPOS_ALTURA.includes(campo)) return typeof valor === 'number' && valor > 0
  return valor !== null && valor !== undefined
}

function validarRespostasGrupo(grupo, resp) {
  const erros = {}
  for (const campo of CAMPOS_OBRIGATORIOS_POR_GRUPO[grupo]) {
    if (!respostaValida(campo, resp[campo])) {
      erros[campo] = 'Responda esta pergunta ou marque "Não se aplica"'
    }
  }
  return erros
}

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
      <FormComponent instanceId={instanceId} erros={erros} />
      <div className={styles.espacoBar} />
      <BottomBar onVoltar={voltar} onAvancar={avancar} avancarLabel={avancarLabel} mostrarBotaoVendedor={false} />
    </div>
  )
}
