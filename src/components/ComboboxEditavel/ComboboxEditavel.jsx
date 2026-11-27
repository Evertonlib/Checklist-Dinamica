import { useEffect, useId, useRef, useState } from 'react'
import { filtrarSugestoesPuxador } from '../../domain/puxadoresVendedor.js'
import styles from './ComboboxEditavel.module.css'

/**
 * Campo de texto editável com lista de sugestões filtrável em React puro.
 * Seleciona todo o texto ao focar, exibe setinha apenas quando há sugestões
 * e insere a lista no fluxo normal da página.
 */
export function ComboboxEditavel({
  id,
  value = '',
  onChange,
  opcoes = [],
  placeholder = '',
  temErro = false,
  ariaLabel,
}) {
  const [aberto, setAberto] = useState(false)
  const [filtrando, setFiltrando] = useState(false)
  const [indiceAtivo, setIndiceAtivo] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const acabouDeFocarRef = useRef(false)
  const listboxId = useId()

  const temOpcoes = Array.isArray(opcoes) && opcoes.length > 0
  const opcoesVisiveis = !temOpcoes
    ? []
    : filtrando
      ? filtrarSugestoesPuxador(opcoes, value)
      : opcoes
  const mostrarLista = aberto && temOpcoes && opcoesVisiveis.length > 0

  useEffect(() => {
    const aoClicarFora = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setAberto(false)
        setIndiceAtivo(-1)
      }
    }
    document.addEventListener('pointerdown', aoClicarFora)
    return () => document.removeEventListener('pointerdown', aoClicarFora)
  }, [])

  useEffect(() => {
    if (!temOpcoes && aberto) {
      setAberto(false)
      setFiltrando(false)
      setIndiceAtivo(-1)
    }
  }, [temOpcoes, aberto])

  useEffect(() => {
    if (!mostrarLista) return
    const rolar = () => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    const rafId = requestAnimationFrame(rolar)
    const timerId = setTimeout(rolar, 300)
    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(timerId)
    }
  }, [mostrarLista])

  const selecionar = (opcao) => {
    onChange?.(opcao)
    setAberto(false)
    setFiltrando(false)
    setIndiceAtivo(-1)
  }

  const handleFocus = (e) => {
    if (value) {
      e.target.select()
      acabouDeFocarRef.current = true
    } else {
      acabouDeFocarRef.current = false
    }
    if (temOpcoes) {
      setFiltrando(false)
      setAberto(true)
      setIndiceAtivo(-1)
    }
  }

  const handleMouseUp = (e) => {
    if (acabouDeFocarRef.current) {
      acabouDeFocarRef.current = false
      e.preventDefault()
    }
  }

  const handleClickInput = () => {
    if (temOpcoes && !aberto) {
      setFiltrando(false)
      setAberto(true)
      setIndiceAtivo(-1)
    }
  }

  const handleChange = (e) => {
    onChange?.(e.target.value)
    if (temOpcoes) {
      setFiltrando(true)
      setAberto(true)
      setIndiceAtivo(-1)
    }
  }

  const handleBlur = (e) => {
    if (!containerRef.current?.contains(e.relatedTarget)) {
      setAberto(false)
      setIndiceAtivo(-1)
    }
  }

  const alternarLista = () => {
    if (!temOpcoes) return
    const vaiAbrir = !aberto
    setAberto(vaiAbrir)
    setFiltrando(false)
    setIndiceAtivo(-1)
    if (vaiAbrir) inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      setAberto(false)
      setIndiceAtivo(-1)
      return
    }
    if (!temOpcoes) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!aberto) {
        setFiltrando(false)
        setAberto(true)
        setIndiceAtivo(0)
        return
      }
      if (opcoesVisiveis.length > 0) {
        setIndiceAtivo((prev) => (prev + 1) % opcoesVisiveis.length)
      }
      return
    }

    if (e.key === 'ArrowUp' && aberto && opcoesVisiveis.length > 0) {
      e.preventDefault()
      setIndiceAtivo((prev) => (prev <= 0 ? opcoesVisiveis.length - 1 : prev - 1))
      return
    }

    if (e.key === 'Enter' && aberto && indiceAtivo >= 0 && indiceAtivo < opcoesVisiveis.length) {
      e.preventDefault()
      selecionar(opcoesVisiveis[indiceAtivo])
      return
    }

    if (e.key === 'Escape' && aberto) {
      e.preventDefault()
      setAberto(false)
      setIndiceAtivo(-1)
    }
  }

  const wrapperClass = temErro
    ? `${styles.inputWrapper} ${styles.inputWrapperErro}`
    : styles.inputWrapper

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={wrapperClass}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          className={styles.input}
          value={value}
          placeholder={placeholder}
          aria-label={ariaLabel}
          role={temOpcoes ? 'combobox' : undefined}
          aria-expanded={temOpcoes ? mostrarLista : undefined}
          aria-controls={temOpcoes ? listboxId : undefined}
          aria-autocomplete={temOpcoes ? 'list' : undefined}
          onFocus={handleFocus}
          onMouseUp={handleMouseUp}
          onClick={handleClickInput}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {temOpcoes && (
          <button
            type="button"
            className={styles.botaoSeta}
            aria-label="Mostrar sugestões"
            aria-expanded={mostrarLista}
            onMouseDown={(e) => e.preventDefault()}
            onClick={alternarLista}
          >
            ▾
          </button>
        )}
      </div>

      {mostrarLista && (
        <ul id={listboxId} role="listbox" className={styles.lista}>
          {opcoesVisiveis.map((opcao, idx) => (
            <li key={opcao} className={styles.itemLista}>
              <button
                type="button"
                role="option"
                aria-selected={idx === indiceAtivo}
                className={idx === indiceAtivo ? `${styles.opcao} ${styles.opcaoAtiva}` : styles.opcao}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selecionar(opcao)}
              >
                {opcao}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
