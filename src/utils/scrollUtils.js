export function scrollToFirstError() {
  requestAnimationFrame(() => {
    const el = document.querySelector('.erro-campo')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

// Rola até o card recém-criado (ex.: eletro adicionado) e o centraliza na tela,
// para o cliente perceber que o clique funcionou.
export function rolarParaCard(id) {
  requestAnimationFrame(() => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}
