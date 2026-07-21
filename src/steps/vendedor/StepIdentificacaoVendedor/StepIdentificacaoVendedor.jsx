import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormContextVendedor } from '../../../context/FormContextVendedor.js'
import { FieldGroup } from '../../../components/FieldGroup/FieldGroup.jsx'
import { BottomBar } from '../../../components/BottomBar/BottomBar.jsx'
import { scrollToFirstError } from '../../../utils/scrollUtils.js'
import styles from './StepIdentificacaoVendedor.module.css'

const REGEX_CONTRATO = /^(IT|SM|TA|PIN|STA)\d+$/

function obterErrosIdentificacao(identificacao) {
  const erros = {}

  if (!identificacao.nome.trim()) erros.nome = 'Campo obrigatório'

  identificacao.contratos.forEach((contrato, index) => {
    if (!REGEX_CONTRATO.test(contrato.trim())) {
      erros[`contrato_${index}`] = 'O contrato deve começar com IT, SM, TA, PIN ou STA seguido dos números'
    }
  })

  return erros
}

export function StepIdentificacaoVendedor() {
  const { state, dispatch } = useFormContextVendedor()
  const navigate = useNavigate()
  const id = state.identificacao
  const [erros, setErros] = useState({})

  useEffect(() => {
    if (Object.keys(erros).length > 0) scrollToFirstError()
  }, [erros])

  const setNome = (valor) => {
    dispatch({ type: 'SET_IDENTIFICACAO_VENDEDOR_NOME', valor })
    if (Object.keys(erros).length > 0) {
      setErros(obterErrosIdentificacao({ ...id, nome: valor }))
    }
  }

  const setContrato = (index, valorDigitado) => {
    const valor = valorDigitado.toUpperCase()
    dispatch({ type: 'SET_IDENTIFICACAO_VENDEDOR_CONTRATO', index, valor })
    if (Object.keys(erros).length > 0) {
      const contratos = id.contratos.map((c, i) => (i === index ? valor : c))
      setErros(obterErrosIdentificacao({ ...id, contratos }))
    }
  }

  const adicionarContrato = () => dispatch({ type: 'ADD_CONTRATO_VENDEDOR' })

  const removerContrato = (index) => {
    dispatch({ type: 'REMOVE_CONTRATO_VENDEDOR', index })
    if (Object.keys(erros).length > 0) {
      const contratos = id.contratos.filter((_, i) => i !== index)
      setErros(obterErrosIdentificacao({ ...id, contratos }))
    }
  }

  const avancar = () => {
    const errosAtuais = obterErrosIdentificacao(id)
    if (Object.keys(errosAtuais).length > 0) {
      setErros(errosAtuais)
      return
    }

    dispatch({ type: 'SET_META_VENDEDOR', campo: 'etapaAtual', valor: 'ambientes' })
    navigate('/vendedor/ambientes')
  }

  return (
    <div className={styles.pagina}>
      <FieldGroup titulo="Identificação">
        <div className={styles.campo}>
          <label>Nome completo do cliente</label>
          <input
            value={id.nome}
            onChange={(e) => setNome(e.target.value)}
            autoComplete="name"
          />
          {erros.nome && <span className={`${styles.erro} erro-campo`}>{erros.nome}</span>}
        </div>

        {id.contratos.map((contrato, index) => (
          <div key={index} className={styles.linhaContrato}>
            <div className={styles.campo}>
              <label>{index === 0 ? 'Número do contrato' : `Contrato adicional ${index + 1}`}</label>
              <input
                value={contrato}
                placeholder="Ex: IT01234"
                onChange={(e) => setContrato(index, e.target.value)}
              />
              {erros[`contrato_${index}`] && (
                <span className={`${styles.erro} erro-campo`}>{erros[`contrato_${index}`]}</span>
              )}
            </div>
            {index > 0 && (
              <button
                type="button"
                className={styles.btnRemoverContrato}
                onClick={() => removerContrato(index)}
                aria-label="Remover contrato"
              >
                −
              </button>
            )}
          </div>
        ))}

        <button type="button" className={styles.btnAdicionarContrato} onClick={adicionarContrato}>
          + Adicionar contrato
        </button>
      </FieldGroup>

      <div className={styles.espacoBar} />
      <BottomBar
        semVoltar
        onAvancar={avancar}
        avancarDisabled={false}
        mostrarBotaoVendedor={false}
      />
    </div>
  )
}
