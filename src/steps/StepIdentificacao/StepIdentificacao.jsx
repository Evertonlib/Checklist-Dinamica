import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormContext } from '../../context/FormContext.js'
import { buscarCep } from '../../services/cep.js'
import { FieldGroup } from '../../components/FieldGroup/FieldGroup.jsx'
import { BottomBar } from '../../components/BottomBar/BottomBar.jsx'
import styles from './StepIdentificacao.module.css'

const REGEX_CONTRATO = /^(IT|SM|TA|PIN|STA)\d+$/

export function StepIdentificacao() {
  const { state, dispatch } = useFormContext()
  const navigate = useNavigate()
  const id = state.identificacao
  const [cepMsg, setCepMsg] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [erros, setErros] = useState({})

  const set = (campo, valor) =>
    dispatch({ type: 'SET_IDENTIFICACAO', campo, valor })

  const handleCepBlur = async () => {
    const cep = id.cep.replace(/\D/g, '')
    if (cep.length !== 8) return
    setBuscando(true)
    setCepMsg('')
    const res = await buscarCep(cep)
    setBuscando(false)
    if (res.erro === 'CEP não encontrado') {
      setCepMsg('CEP não encontrado — você pode preencher o endereço manualmente.')
    } else if (res.erro) {
      setCepMsg('Não foi possível consultar o CEP agora — preencha o endereço manualmente.')
    } else {
      set('logradouro', res.logradouro)
      set('bairro', res.bairro)
      set('cidade', res.cidade)
      set('uf', res.uf)
      setCepMsg('')
    }
  }

  const validar = () => {
    const e = {}
    if (!id.nome.trim()) e.nome = 'Campo obrigatório'
    if (!REGEX_CONTRATO.test(id.contrato.trim()))
      e.contrato = 'O contrato deve começar com IT, SM, TA, PIN ou STA seguido dos números'
    if (id.cep.replace(/\D/g, '').length !== 8) e.cep = 'CEP inválido'
    if (!id.logradouro.trim()) e.logradouro = 'Campo obrigatório'
    if (!id.bairro.trim()) e.bairro = 'Campo obrigatório'
    if (!id.cidade.trim()) e.cidade = 'Campo obrigatório'
    if (!id.uf.trim()) e.uf = 'Campo obrigatório'
    if (!id.telefone.trim()) e.telefone = 'Campo obrigatório'
    setErros(e)
    return Object.keys(e).length === 0
  }

  const avancar = () => {
    if (!validar()) return
    dispatch({ type: 'SET_META', campo: 'etapaAtual', valor: 'ambientes' })
    navigate('/ambientes')
  }

  const campo = (label, campo, props = {}) => (
    <div className={styles.campo}>
      <label>{label}</label>
      <input
        value={id[campo] ?? ''}
        onChange={(e) => set(campo, e.target.value)}
        {...props}
      />
      {erros[campo] && <span className={styles.erro}>{erros[campo]}</span>}
    </div>
  )

  return (
    <div className={styles.pagina}>
      <FieldGroup titulo="Identificação">
        {campo('Nome completo', 'nome', { autoComplete: 'name' })}
        {campo('Número do contrato', 'contrato', { placeholder: 'Ex: IT01234' })}
        {campo('Telefone / celular', 'telefone', { type: 'tel', autoComplete: 'tel' })}
      </FieldGroup>

      <FieldGroup titulo="Endereço da obra">
        <div className={styles.campo}>
          <label>CEP</label>
          <input
            value={id.cep}
            onChange={(e) => set('cep', e.target.value)}
            onBlur={handleCepBlur}
            placeholder="00000-000"
            maxLength={9}
          />
          {buscando && <span className={styles.info}>Buscando CEP…</span>}
          {cepMsg && <span className={styles.aviso}>{cepMsg}</span>}
          {erros.cep && <span className={styles.erro}>{erros.cep}</span>}
        </div>
        {campo('Logradouro', 'logradouro')}
        {campo('Complemento (opcional)', 'complemento')}
        {campo('Bairro', 'bairro')}
        <div className={styles.linha}>
          {campo('Cidade', 'cidade')}
          <div className={styles.campo} style={{ maxWidth: 80 }}>
            <label>UF</label>
            <input
              value={id.uf ?? ''}
              onChange={(e) => set('uf', e.target.value.toUpperCase())}
              maxLength={2}
            />
            {erros.uf && <span className={styles.erro}>{erros.uf}</span>}
          </div>
        </div>
      </FieldGroup>

      <div className={styles.espacoBar} />
      <BottomBar semVoltar onAvancar={avancar} />
    </div>
  )
}
