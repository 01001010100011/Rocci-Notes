import { useState } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'rocci_storage_notice'

function shouldShow() {
  try {
    return !window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return true
  }
}

// Banner informativo sullo storage tecnico essenziale (nessun cookie di profilazione).
// Compare una sola volta: la scelta resta nel localStorage del browser.
export default function CookieBanner() {
  const [visible, setVisible] = useState(shouldShow)

  function dismiss() {
    setVisible(false)
    try {
      window.localStorage.setItem(STORAGE_KEY, 'ok')
    } catch {
      // localStorage non disponibile: il banner ricomparirà alla prossima visita.
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-16 z-50 px-4 sm:bottom-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-ink/10 bg-paper/95 p-4 shadow-lift backdrop-blur sm:flex-row sm:items-center">
        <p className="flex-1 text-xs leading-relaxed text-ink/70">
          Rocci Notes usa solo <strong>storage tecnico essenziale</strong> (nessun cookie di
          profilazione o pubblicità) per mantenerti collegato e ricordare questa scelta.{' '}
          <Link to="/privacy" className="font-semibold text-copper underline-offset-2 hover:underline">
            Leggi la Privacy Policy
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition hover:bg-forest"
        >
          Ho capito
        </button>
      </div>
    </div>
  )
}
