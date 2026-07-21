import { useEffect } from 'react'
import { HashRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom'
import { FormProvider } from './context/FormProvider.jsx'
import { useFormContext } from './context/FormContext.js'
import { FormProviderVendedor } from './context/FormProviderVendedor.jsx'
import { useFormContextVendedor } from './context/FormContextVendedor.js'
import { formatarNomeAmbiente } from './domain/ambientes.js'
import { Header } from './components/Header/Header.jsx'
import { Stepper } from './components/Stepper/Stepper.jsx'
import { SelecaoPerfil } from './screens/SelecaoPerfil/SelecaoPerfil.jsx'
import { StepIdentificacao } from './steps/StepIdentificacao/StepIdentificacao.jsx'
import { StepAmbientes } from './steps/StepAmbientes/StepAmbientes.jsx'
import { StepPerguntasGlobais } from './steps/StepPerguntasGlobais/StepPerguntasGlobais.jsx'
import { StepPerguntasPorAmbiente } from './steps/StepPerguntasPorAmbiente/StepPerguntasPorAmbiente.jsx'
import { StepRevisao } from './steps/StepRevisao/StepRevisao.jsx'
import { StepSucesso } from './steps/StepSucesso/StepSucesso.jsx'
import { StepIdentificacaoVendedor } from './steps/vendedor/StepIdentificacaoVendedor/StepIdentificacaoVendedor.jsx'
import { StepAmbientesVendedor } from './steps/vendedor/StepAmbientesVendedor/StepAmbientesVendedor.jsx'
import { StepPerguntasAmbienteVendedor } from './steps/vendedor/StepPerguntasAmbienteVendedor/StepPerguntasAmbienteVendedor.jsx'
import { StepRevisaoVendedor } from './steps/vendedor/StepRevisaoVendedor/StepRevisaoVendedor.jsx'
import { StepSucessoVendedor } from './steps/vendedor/StepSucessoVendedor/StepSucessoVendedor.jsx'
import './index.css'

function AppLayoutCliente() {
  const { state } = useFormContext()
  const location = useLocation()
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
      etapaNome = formatarNomeAmbiente(amb)
    }
  }

  const mostrarStepper = etapaNum !== null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div>
      <Header etapaAtual={etapaNome} />
      {mostrarStepper && (
        <Stepper etapaNumero={etapaNum} totalEtapas={totalEtapas} nomeEtapa={etapaNome} />
      )}
      <Outlet />
    </div>
  )
}

function ClienteLayoutRoute() {
  return (
    <FormProvider>
      <AppLayoutCliente />
    </FormProvider>
  )
}

function AppLayoutVendedor() {
  const { state } = useFormContextVendedor()
  const location = useLocation()
  const ambientes = state.ambientesSelecionados
  const totalEtapas = 2 + ambientes.length

  const ROTAS_ETAPA_VENDEDOR = {
    '/vendedor/identificacao': { num: 1, nome: 'Identificação' },
    '/vendedor/ambientes':     { num: 2, nome: 'Ambientes' },
  }

  const pathBase = location.pathname
  let etapaNum = null
  let etapaNome = ''

  if (ROTAS_ETAPA_VENDEDOR[pathBase]) {
    etapaNum = ROTAS_ETAPA_VENDEDOR[pathBase].num
    etapaNome = ROTAS_ETAPA_VENDEDOR[pathBase].nome
  } else if (pathBase.startsWith('/vendedor/ambiente/')) {
    const instanceId = pathBase.replace('/vendedor/ambiente/', '')
    const idx = ambientes.findIndex((a) => a.instanceId === instanceId)
    if (idx >= 0) {
      etapaNum = 3 + idx
      const amb = ambientes[idx]
      etapaNome = formatarNomeAmbiente(amb)
    }
  }

  const mostrarStepper = etapaNum !== null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div>
      <Header etapaAtual={etapaNome} />
      {mostrarStepper && (
        <Stepper etapaNumero={etapaNum} totalEtapas={totalEtapas} nomeEtapa={etapaNome} />
      )}
      <Outlet />
    </div>
  )
}

function VendedorLayoutRoute() {
  return (
    <FormProviderVendedor>
      <AppLayoutVendedor />
    </FormProviderVendedor>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SelecaoPerfil />} />

        <Route element={<ClienteLayoutRoute />}>
          <Route path="identificacao" element={<StepIdentificacao />} />
          <Route path="ambientes" element={<StepAmbientes />} />
          <Route path="globais" element={<StepPerguntasGlobais />} />
          <Route path="ambiente/:instanceId" element={<StepPerguntasPorAmbiente />} />
          <Route path="revisao" element={<StepRevisao />} />
          <Route path="sucesso" element={<StepSucesso />} />
        </Route>

        <Route path="vendedor" element={<VendedorLayoutRoute />}>
          <Route path="identificacao" element={<StepIdentificacaoVendedor />} />
          <Route path="ambientes" element={<StepAmbientesVendedor />} />
          <Route path="ambiente/:instanceId" element={<StepPerguntasAmbienteVendedor />} />
          <Route path="revisao" element={<StepRevisaoVendedor />} />
          <Route path="sucesso" element={<StepSucessoVendedor />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
