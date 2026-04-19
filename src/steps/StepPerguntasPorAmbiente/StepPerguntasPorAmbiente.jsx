import { useNavigate, useParams } from 'react-router-dom'
import { useFormContext } from '../../context/FormContext.js'
import { BottomBar } from '../../components/BottomBar/BottomBar.jsx'
import { FormCozinha } from './FormCozinha.jsx'
import { FormDormitorio } from './FormDormitorio.jsx'
import { FormHomeSalaOffice } from './FormHomeSalaOffice.jsx'
import { FormBanheiro } from './FormBanheiro.jsx'
import { FormOutros } from './FormOutros.jsx'
import styles from './StepPerguntasPorAmbiente.module.css'
import { useState } from 'react'

const FORM_MAP = {
  cozinha:    FormCozinha,
  dormitorio: FormDormitorio,
  home:       FormHomeSalaOffice,
  banheiro:   FormBanheiro,
  outros:     FormOutros,
}

export function StepPerguntasPorAmbiente() {
  const { instanceId } = useParams()
  const { state, dispatch } = useFormContext()
  const navigate = useNavigate()
  const [erros, setErros] = useState({})

  const instancia = state.ambientesSelecionados.find((a) => a.instanceId === instanceId)
  if (!instancia) return <p style={{ padding: 16 }}>Ambiente não encontrado.</p>

  const { formType } = instancia
  const FormComponent = FORM_MAP[formType] || FormOutros
  const resp = state.respostasPorAmbiente[instanceId] || {}

  const idx = state.ambientesSelecionados.findIndex((a) => a.instanceId === instanceId)
  const anterior = state.ambientesSelecionados[idx - 1]
  const proximo  = state.ambientesSelecionados[idx + 1]

  const validar = () => {
    const e = {}
    if (resp.tv === true && !resp.tv_polegadas) e.tv_polegadas = 'Obrigatório'
    if (formType === 'banheiro' && !resp.cuba) e.cuba = 'Selecione o tipo de cuba'
    if (formType === 'dormitorio' && !resp.tamanhoCama) e.tamanhoCama = 'Selecione o tamanho da cama'

    // Validação de eletros
    if (['cozinha', 'outros'].includes(formType) && resp.eletrosDefined === true) {
      (resp.eletros || []).forEach((el, i) => {
        if (!el.largura_cm) e[`eletro_${i}_largura`] = 'Obrigatório'
        if (!el.altura_cm) e[`eletro_${i}_altura`] = 'Obrigatório'
        if (!el.profundidade_cm) e[`eletro_${i}_prof`] = 'Obrigatório'
        if (el.tipo === 'Depurador' && el.subtipo === 'Embutido') {
          if (!el.modelo) e[`eletro_${i}_modelo`] = 'Obrigatório para Depurador Embutido'
          if (!el.link) e[`eletro_${i}_link`] = 'Obrigatório para Depurador Embutido'
        }
      })
    }

    // Validação de eletrônicos
    if (['home', 'outros'].includes(formType) && resp.eletronicos === true) {
      (resp.eletronicosList || []).forEach((el, i) => {
        if (!el.largura_cm) e[`eletronico_${i}_largura`] = 'Obrigatório'
        if (!el.altura_cm) e[`eletronico_${i}_altura`] = 'Obrigatório'
      })
    }

    setErros(e)
    return Object.keys(e).length === 0
  }

  const voltar = () => {
    if (anterior) {
      dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: `ambiente/${anterior.instanceId}` })
      navigate(`/ambiente/${anterior.instanceId}`)
    } else {
      dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: 'globais' })
      navigate('/globais')
    }
  }

  const avancar = () => {
    if (!validar()) return
    const origem = state._meta.origemNavegacao
    if (origem === 'revisao') {
      dispatch({ type: 'SET_META', campo: 'origemNavegacao', valor: null })
      navigate('/revisao')
      return
    }
    if (proximo) {
      dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: `ambiente/${proximo.instanceId}` })
      navigate(`/ambiente/${proximo.instanceId}`)
    } else {
      dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: 'revisao' })
      navigate('/revisao')
    }
  }

  const avancarLabel = state._meta.origemNavegacao === 'revisao'
    ? 'Salvar e voltar ao resumo'
    : proximo ? 'Avançar' : 'Ir para Revisão'

  return (
    <div className={styles.pagina}>
      <FormComponent instanceId={instanceId} erros={erros} />
      <div className={styles.espacoBar} />
      <BottomBar onVoltar={voltar} onAvancar={avancar} avancarLabel={avancarLabel} />
    </div>
  )
}
