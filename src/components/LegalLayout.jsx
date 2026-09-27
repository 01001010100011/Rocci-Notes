import { Link } from 'react-router-dom'
import useDocumentTitle from '../useDocumentTitle'

// Guscio comune per le pagine legali: accessibili anche da utenti non autenticati.
export default function LegalLayout({ kicker, title, updated, children }) {
  useDocumentTitle(title)
  return (
    <div className="min-h-dvh px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-copper underline-offset-2 hover:underline"
        >
          <span aria-hidden="true">←</span> Torna alla bacheca
        </Link>

        <header className="mt-6">
          <p className="flex items-center gap-2 font-display text-2xl text-ink">
            <span aria-hidden="true">📝</span> Rocci Notes
          </p>
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-copper">
            {kicker}
          </p>
          <h1 className="mt-1 font-display text-4xl leading-tight text-ink">{title}</h1>
          {updated && <p className="mt-2 text-xs text-ink/50">Ultimo aggiornamento: {updated}</p>}
        </header>

        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink/80">{children}</div>

        <footer className="mt-10 border-t border-ink/10 pt-6 text-sm text-ink/55">
          <p>
            Per qualsiasi domanda scrivi a{' '}
            <a
              href="mailto:roccinotes@gmail.com"
              className="font-semibold text-copper underline-offset-2 hover:underline"
            >
              roccinotes@gmail.com
            </a>
            .
          </p>
          <p className="mt-3 text-xs text-ink/40">
            © {new Date().getFullYear()} Rocci Notes · Piattaforma studentesca indipendente.
          </p>
        </footer>
      </div>
    </div>
  )
}

export function Section({ heading, children }) {
  return (
    <section>
      <h2 className="font-display text-xl text-ink">{heading}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  )
}
