import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useFormContext } from '../../context/FormContext.js'
import { BottomBar } from '../../components/BottomBar/BottomBar.jsx'
import { FormCozinha } from './FormCozinha.jsx'
import { FormDormitorio } from './FormDormitorio.jsx'
import { FormHomeSalaOffice } from './FormHomeSalaOffice.jsx'
import { FormBanheiro } from './FormBanheiro.jsx'
import { FormOutros } from './FormOutros.jsx'
import { validarFormularioAmbiente } from './formUtils.js'
import styles from './StepPerguntasPorAmbiente.module.css'

const FORM_MAP = {
  cozinha: FormCozinha,
  dormitorio: FormDormitorio,
  home: FormHomeSalaOffice,
  banheiro: FormBanheiro,
  outros: FormOutros,
}

export function StepPerguntasPorAmbiente() {
  const { instanceId } = useParams()
  const { state, dispatch } = useFormContext()
  const navigate = useNavigate()
  const [erros, setErros] = useState({})

  const instancia = state.ambientesSelecionados.find((ambiente) => ambiente.instanceId === instanceId)
  if (!instancia) return <p style={{ padding: 16 }}>Ambiente nÃ£o encontrado.</p>

  const { formType } = instancia
  const FormComponent = FORM_MAP[formType] || FormOutros
  const resp = state.respostasPorAmbiente[instanceId] || {}

  const idx = state.ambientesSelecionados.findIndex((ambiente) => ambiente.instanceId === instanceId)
  const anterior = state.ambientesSelecionados[idx - 1]
  const proximo = state.ambientesSelecionados[idx + 1]

  useEffect(() => {
    setErros({})
  }, [instanceId])

  const validar = () => {
    const novosErros = validarFormularioAmbiente(formType, resp)
    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const voltar = () => {
    if (anterior) {
      dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: `ambiente/${anterior.instanceId}` })
      navigate(`/ambiente/${anterior.instanceId}`)
      return
    }

    dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: 'globais' })
    navigate('/globais')
  }

  const avancar = () => {
    if (!validar()) return

    const origem = state._meta.origemNavegacao
    if (origem === 'revisao') {
      dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: 'revisao' })
      dispatch({ type: 'SET_META', campo: 'origemNavegacao', valor: null })
      navigate('/revisao')
      return
    }

    if (proximo) {
      dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: `ambiente/${proximo.instanceId}` })
      navigate(`/ambiente/${proximo.instanceId}`)
      return
    }

    dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: 'revisao' })
    navigate('/revisao')
  }

  const avancarLabel = state._meta.origemNavegacao === 'revisao'
    ? 'Salvar e voltar ao resumo'
    : proximo ? 'AvanÃ§ar' : 'Ir para RevisÃ£o'

  return (
    <div className={styles.pagina}>
      <FormComponent instanceId={instanceId} erros={erros} />
      <div className={styles.espacoBar} />
      <BottomBar onVoltar={voltar} onAvancar={avancar} avancarLabel={avancarLabel} />
    </div>
  )
}
