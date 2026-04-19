/**
 * Busca dados de endereço pelo CEP via ViaCEP.
 * @param {string} cep - CEP com ou sem máscara
 * @returns {Promise<{logradouro, bairro, cidade, uf}|{erro: string}>}
 */
export async function buscarCep(cep) {
  const cepLimpo = cep.replace(/\D/g, '')
  if (cepLimpo.length !== 8) return { erro: 'CEP inválido' }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)
    const data = await res.json()
    if (data.erro) return { erro: 'CEP não encontrado' }
    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      uf: data.uf || '',
    }
  } catch (e) {
    clearTimeout(timeout)
    if (e.name === 'AbortError') return { erro: 'timeout' }
    return { erro: 'rede' }
  }
}
