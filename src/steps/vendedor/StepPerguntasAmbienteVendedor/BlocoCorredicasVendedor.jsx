import {
  OPCOES_CORREDICAS,
  obterOpcoesExtracao,
  resolverAlteracaoCorredicas,
} from '../../../domain/corredicasVendedor.js'
import styles from './StepPerguntasAmbienteVendedor.module.css'

const NAO_SE_APLICA = 'não se aplica'

/**
 * Bloco compartilhado da pergunta "Corrediças" e subopções verticais de "Tipo de extração"
 * para os formulários A, B e C do Perfil Projetista.
 */
export function BlocoCorredicasVendedor({ resp = {}, erros = {}, onSet }) {
  const opcoesExtracao = obterOpcoesExtracao(resp.corredicas)

  const selecionarModelo = (novoModelo) => {
    const proximo = resolverAlteracaoCorredicas(
      resp.corredicas,
      resp.corredicasExtracao,
      novoModelo
    )
    if (proximo.corredicas !== resp.corredicas) {
      onSet('corredicas', proximo.corredicas)
      onSet('corredicasExtracao', proximo.corredicasExtracao)
    }
  }

  return (
    <>
      <div className={styles.campoFechado}>
        <p className={styles.pergunta}>Corrediças</p>
        <div className={styles.opcoes}>
          {OPCOES_CORREDICAS.map((modelo) => (
            <button
              key={modelo}
              type="button"
              className={resp.corredicas === modelo ? styles.opcaoAtiva : styles.opcao}
              onClick={() => selecionarModelo(modelo)}
            >
              {modelo}
            </button>
          ))}
          <button
            type="button"
            className={resp.corredicas === NAO_SE_APLICA ? styles.opcaoAtiva : styles.opcao}
            onClick={() => selecionarModelo(NAO_SE_APLICA)}
          >
            Não se aplica
          </button>
        </div>
        {erros.corredicas && <span className={`${styles.erro} erro-campo`}>{erros.corredicas}</span>}
      </div>

      {opcoesExtracao.length > 0 && (
        <div className={styles.subperguntas}>
          <div className={styles.campoFechado}>
            <p className={styles.pergunta}>Tipo de extração</p>
            <div className={styles.opcoesVerticais}>
              {opcoesExtracao.map((op) => (
                <button
                  key={op}
                  type="button"
                  className={resp.corredicasExtracao === op ? styles.opcaoAtiva : styles.opcao}
                  onClick={() => onSet('corredicasExtracao', op)}
                >
                  {op}
                </button>
              ))}
            </div>
            {erros.corredicasExtracao && (
              <span className={`${styles.erro} erro-campo`}>{erros.corredicasExtracao}</span>
            )}
          </div>
        </div>
      )}
    </>
  )
}
