export function scrollToFirstError() {
  requestAnimationFrame(() => {
    const el = document.querySelector('.erro-campo')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}
