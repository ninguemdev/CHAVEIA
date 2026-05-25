type PageBackButtonProps = {
  fallbackHref?: string
  label?: string
}

function navigateToFallback(fallbackHref: string) {
  window.location.hash = fallbackHref.replace(/^#/, '')
}

export function PageBackButton({
  fallbackHref = '#/torneios',
  label = 'Voltar',
}: PageBackButtonProps) {
  function handleBack() {
    if (window.history.length > 1) {
      window.history.back()
      return
    }

    navigateToFallback(fallbackHref)
  }

  return (
    <nav className="back-navigation" aria-label="Navegacao de retorno">
      <button className="back-button" type="button" onClick={handleBack}>
        <span aria-hidden="true">←</span>
        <span>{label}</span>
      </button>
    </nav>
  )
}
