import { useId } from 'react'
import { ComboboxEditavel } from '../../../components/ComboboxEditavel/ComboboxEditavel.jsx'
import {
  MODELOS_PUXADOR,
  obterSugestoesCor,
  resolverAlteracaoModelo,
} from '../../../domain/puxadoresVendedor.js'
import styles from './StepPerguntasAmbienteVendedor.module.css'

/**
 * Bloco compartilhado da pergunta "Tem puxador?" e lista dinâmica de puxadores
 * para os formulários A, B e C do Perfil Projetista.
 */
export function BlocoPuxadoresVendedor({
  resp = {},
  erros = {},
  onSet,
  onLimparErrosPuxadores,
}) {
  const baseId = useId()
  const lista =
    Array.isArray(resp.puxadores) && resp.puxadores.length > 0
      ? resp.puxadores
      : [{ modelo: '', cor: '' }]

  const marcarSim = () => {
    onSet('temPuxador', 'Sim')
    onLimparErrosPuxadores?.()
    if (!Array.isArray(resp.puxadores) || resp.puxadores.length === 0) {
      onSet('puxadores', [{ modelo: '', cor: '' }])
    }
  }

  const marcarNao = () => {
    onSet('temPuxador', 'Não')
    onLimparErrosPuxadores?.()
  }

  const adicionarPuxador = () => {
    onSet('puxadores', [...lista, { modelo: '', cor: '' }])
  }

  const removerPuxador = (index) => {
    onSet(
      'puxadores',
      lista.filter((_, i) => i !== index)
    )
    onLimparErrosPuxadores?.()
  }

  const atualizarModelo = (index, novoModelo) => {
    const atual = lista[index] || { modelo: '', cor: '' }
    const atualizado = resolverAlteracaoModelo(atual.modelo, atual.cor, novoModelo)
    onSet(
      'puxadores',
      lista.map((item, i) => (i === index ? atualizado : item))
    )
  }

  const atualizarCor = (index, novaCor) => {
    onSet(
      'puxadores',
      lista.map((item, i) => (i === index ? { ...item, cor: novaCor } : item))
    )
  }

  return (
    <div className={styles.campoFechado}>
      <p className={styles.pergunta}>Tem puxador?</p>
      <div className={styles.opcoes}>
        <button
          type="button"
          className={resp.temPuxador === 'Sim' ? styles.opcaoAtiva : styles.opcao}
          onClick={marcarSim}
        >
          Sim
        </button>
        <button
          type="button"
          className={resp.temPuxador === 'Não' ? styles.opcaoAtiva : styles.opcao}
          onClick={marcarNao}
        >
          Não
        </button>
      </div>
      {erros.temPuxador && <span className={`${styles.erro} erro-campo`}>{erros.temPuxador}</span>}

      {resp.temPuxador === 'Sim' && (
        <div className={styles.subperguntas}>
          {erros.puxadores && <span className={`${styles.erro} erro-campo`}>{erros.puxadores}</span>}

          {lista.map((puxador, index) => {
            const modeloId = `${baseId}-modelo-${index}`
            const corId = `${baseId}-cor-${index}`
            const opcoesCor = obterSugestoesCor(puxador.modelo)
            const erroModelo = erros[`puxador_${index}_modelo`]
            const erroCor = erros[`puxador_${index}_cor`]

            return (
              <div key={index} className={styles.cardPuxador}>
                <div className={styles.cabecalhoPuxador}>
                  <span className={styles.tituloPuxador}>{`Puxador ${index + 1}`}</span>
                  {index > 0 && (
                    <button
                      type="button"
                      className={styles.btnRemoverPuxador}
                      onClick={() => removerPuxador(index)}
                      aria-label={`Remover puxador ${index + 1}`}
                    >
                      −
                    </button>
                  )}
                </div>

                <div className={styles.camposPuxador}>
                  <div className={styles.campoPuxador}>
                    <label htmlFor={modeloId}>Modelo</label>
                    <ComboboxEditavel
                      id={modeloId}
                      value={puxador.modelo || ''}
                      opcoes={MODELOS_PUXADOR}
                      placeholder="Selecione ou digite o modelo"
                      temErro={Boolean(erroModelo)}
                      onChange={(novoModelo) => atualizarModelo(index, novoModelo)}
                    />
                    {erroModelo && <span className={`${styles.erro} erro-campo`}>{erroModelo}</span>}
                  </div>

                  <div className={styles.campoPuxador}>
                    <label htmlFor={corId}>Cor</label>
                    <ComboboxEditavel
                      id={corId}
                      value={puxador.cor || ''}
                      opcoes={opcoesCor}
                      placeholder={
                        opcoesCor.length > 0 ? 'Selecione ou digite a cor' : 'Digite a cor'
                      }
                      temErro={Boolean(erroCor)}
                      onChange={(novaCor) => atualizarCor(index, novaCor)}
                    />
                    {erroCor && <span className={`${styles.erro} erro-campo`}>{erroCor}</span>}
                  </div>
                </div>
              </div>
            )
          })}

          <button
            type="button"
            className={styles.btnAdicionarPuxador}
            onClick={adicionarPuxador}
          >
            + Adicionar puxador
          </button>
        </div>
      )}
    </div>
  )
}
