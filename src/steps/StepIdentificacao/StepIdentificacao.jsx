import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormContext } from '../../context/FormContext.js'
import { buscarCep } from '../../services/cep.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import { BottomBar } from '../../components/BottomBar/BottomBar.jsx'
import styles from './StepIdentificacao.module.css'

const REGEX_CONTRATO = /^(IT|SM|TA|PIN|STA)\d+$/

function mascararTelefone(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  if (digitos.length === 0) return ''
  if (digitos.length <= 2) return `(${digitos}`
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`
  if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
}

function mascararCep(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 8)
  if (digitos.length <= 5) {
    return digitos
  }

  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`
}

function obterErrosIdentificacao(identificacao) {
  const erros = {}

  if (!identificacao.nome.trim()) erros.nome = 'Campo obrigatório'
  if (!REGEX_CONTRATO.test(identificacao.contrato.trim())) {
    erros.contrato = 'O contrato deve começar com IT, SM, TA, PIN ou STA seguido dos números'
  }
  if (identificacao.cep.replace(/\D/g, '').length !== 8) erros.cep = 'CEP inválido'
  if (!identificacao.logradouro.trim()) erros.logradouro = 'Campo obrigatório'
  if (!identificacao.numero.trim()) erros.numero = 'Campo obrigatório'
  if (!identificacao.bairro.trim()) erros.bairro = 'Campo obrigatório'
  if (!identificacao.cidade.trim()) erros.cidade = 'Campo obrigatório'
  if (identificacao.uf.trim().length !== 2) erros.uf = 'UF deve ter exatamente 2 caracteres'
  const telDigitos = identificacao.telefone.replace(/\D/g, '').length
  if (telDigitos < 10) erros.telefone = telDigitos === 0 ? 'Campo obrigatório' : 'Telefone incompleto'

  return erros
}

export function StepIdentificacao() {
  const { state, dispatch } = useFormContext()
  const navigate = useNavigate()
  const id = state.identificacao
  const [cepMsg, setCepMsg] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [erros, setErros] = useState({})

  const set = (campo, valor, proximoEstado = null) => {
    dispatch({ type: 'SET_IDENTIFICACAO', campo, valor })

    if (Object.keys(erros).length > 0) {
      setErros(obterErrosIdentificacao(proximoEstado || { ...id, [campo]: valor }))
    }
  }

  const handleCepBlur = async () => {
    const cep = id.cep.replace(/\D/g, '')
    if (cep.length !== 8) return

    setBuscando(true)
    setCepMsg('')
    const res = await buscarCep(cep)
    setBuscando(false)

    if (res.erro === 'CEP não encontrado') {
      setCepMsg('CEP não encontrado — você pode preencher o endereço manualmente.')
      return
    }

    if (res.erro) {
      setCepMsg('Não foi possível consultar o CEP agora — preencha o endereço manualmente.')
      return
    }

    const proximoEstado = {
      ...id,
      logradouro: res.logradouro,
      bairro: res.bairro,
      cidade: res.cidade,
      uf: res.uf,
    }

    set('logradouro', res.logradouro, proximoEstado)
    set('bairro', res.bairro, proximoEstado)
    set('cidade', res.cidade, proximoEstado)
    set('uf', res.uf, proximoEstado)
    setCepMsg('')
  }

  const errosAtuais = obterErrosIdentificacao(id)
  const identificacaoValida = Object.keys(errosAtuais).length === 0

  const avancar = () => {
    if (!identificacaoValida) {
      setErros(errosAtuais)
      return
    }

    if (state._meta.origemNavegacao === 'revisao') {
      dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: 'revisao' })
      dispatch({ type: 'SET_META', campo: 'origemNavegacao', valor: null })
      navigate('/revisao')
      return
    }

    dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: 'ambientes' })
    navigate('/ambientes')
  }

  const campo = (label, campoNome, props = {}) => (
    <div className={styles.campo}>
      <label>{label}</label>
      <input
        value={id[campoNome] ?? ''}
        onChange={(e) => set(campoNome, e.target.value)}
        {...props}
      />
      {erros[campoNome] && <span className={styles.erro}>{erros[campoNome]}</span>}
    </div>
  )

  const avancarLabel = state._meta.origemNavegacao === 'revisao'
    ? 'Salvar e voltar ao resumo'
    : 'Avançar'

  return (
    <div className={styles.pagina}>
      <FieldGroup titulo="Identificação">
        {campo('Nome completo', 'nome', { autoComplete: 'name' })}
        {campo('Número do contrato', 'contrato', {
          placeholder: 'Ex: IT01234',
          onChange: (e) => {
            const contrato = e.target.value.toUpperCase()
            set('contrato', contrato, { ...id, contrato })
          },
        })}
        {campo('Telefone / celular', 'telefone', {
          type: 'tel',
          autoComplete: 'tel',
          placeholder: '(00) 00000-0000',
          maxLength: 16,
          onChange: (e) => {
            const tel = mascararTelefone(e.target.value)
            set('telefone', tel, { ...id, telefone: tel })
          },
        })}
      </FieldGroup>

      <FieldGroup titulo="Endereço da obra">
        <div className={styles.campo}>
          <label>CEP</label>
          <input
            value={id.cep}
            onChange={(e) => {
              const cep = mascararCep(e.target.value)
              set('cep', cep, { ...id, cep })
            }}
            onBlur={handleCepBlur}
            placeholder="00000-000"
            maxLength={9}
          />
          {buscando && <span className={styles.info}>Buscando CEP…</span>}
          {cepMsg && <span className={styles.aviso}>{cepMsg}</span>}
          {erros.cep && <span className={styles.erro}>{erros.cep}</span>}
        </div>
        {campo('Logradouro', 'logradouro')}
        {campo('Número', 'numero')}
        {campo('Complemento (opcional)', 'complemento')}
        {campo('Bairro', 'bairro')}
        <div className={styles.linha}>
          {campo('Cidade', 'cidade')}
          <div className={styles.campo} style={{ maxWidth: 80 }}>
            <label>UF</label>
            <input
              value={id.uf ?? ''}
              onChange={(e) => {
                const uf = e.target.value.replace(/\s/g, '').toUpperCase().slice(0, 2)
                set('uf', uf, { ...id, uf })
              }}
              maxLength={2}
            />
            {erros.uf && <span className={styles.erro}>{erros.uf}</span>}
          </div>
        </div>
      </FieldGroup>

      <div className={styles.espacoBar} />
      <BottomBar
        semVoltar
        onAvancar={avancar}
        avancarDisabled={!identificacaoValida}
        avancarLabel={avancarLabel}
      />
    </div>
  )
}
