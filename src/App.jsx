import { HashRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { FormProvider } from './context/FormProvider.jsx'
import { useFormContext } from './context/FormContext.js'
import { Header } from './components/Header/Header.jsx'
import { Stepper } from './components/Stepper/Stepper.jsx'
import { StepIdentificacao } from './steps/StepIdentificacao/StepIdentificacao.jsx'
import { StepAmbientes } from './steps/StepAmbientes/StepAmbientes.jsx'
import { StepPerguntasGlobais } from './steps/StepPerguntasGlobais/StepPerguntasGlobais.jsx'
import { StepPerguntasPorAmbiente } from './steps/StepPerguntasPorAmbiente/StepPerguntasPorAmbiente.jsx'
import { StepRevisao } from './steps/StepRevisao/StepRevisao.jsx'
import { StepSucesso } from './steps/StepSucesso/StepSucesso.jsx'
import './index.css'

function AppLayout() {
  const { state } = useFormContext()
  const location = useLocation()
  const params = useParams()

  const ambientes = state.ambientesSelecionados
  const totalEtapas = 3 + ambientes.length

  const ROTAS_ETAPA = {
    '/identificacao': { num: 1, nome: 'Identificação' },
    '/ambientes':     { num: 2, nome: 'Ambientes' },
    '/globais':       { num: 3, nome: 'Perguntas Gerais' },
  }

  const pathBase = location.pathname
  let etapaNum = null
  let etapaNome = ''

  if (ROTAS_ETAPA[pathBase]) {
    etapaNum = ROTAS_ETAPA[pathBase].num
    etapaNome = ROTAS_ETAPA[pathBase].nome
  } else if (pathBase.startsWith('/ambiente/')) {
    const instanceId = pathBase.replace('/ambiente/', '')
    const idx = ambientes.findIndex((a) => a.instanceId === instanceId)
    if (idx >= 0) {
      etapaNum = 4 + idx
      const amb = ambientes[idx]
      etapaNome = amb.nome || amb.label
    }
  }

  const mostrarStepper = etapaNum !== null

  return (
    <div>
      <Header etapaAtual={etapaNome} />
      {mostrarStepper && (
        <Stepper etapaNumero={etapaNum} totalEtapas={totalEtapas} nomeEtapa={etapaNome} />
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/identificacao" replace />} />
        <Route path="/identificacao" element={<StepIdentificacao />} />
        <Route path="/ambientes" element={<StepAmbientes />} />
        <Route path="/globais" element={<StepPerguntasGlobais />} />
        <Route path="/ambiente/:instanceId" element={<StepPerguntasPorAmbiente />} />
        <Route path="/revisao" element={<StepRevisao />} />
        <Route path="/sucesso" element={<StepSucesso />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <FormProvider>
        <AppLayout />
      </FormProvider>
    </HashRouter>
  )
}
