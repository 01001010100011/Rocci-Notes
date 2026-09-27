import { Link } from 'react-router-dom'
import useDocumentTitle from '../useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Pagina non trovata')

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-16">
      <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-copper/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-forest/20 blur-3xl" />

      <div className="relative w-full max-w-lg rounded-3xl border border-ink/10 bg-paper/80 px-6 py-12 text-center shadow-lift backdrop-blur-sm sm:px-10">
        <p className="stamp mx-auto inline-block px-3 py-1 text-[11px] font-semibold uppercase text-copper">
          Errore 404
        </p>

        <p className="mt-6 bg-gradient-to-br from-copper via-copper to-forest bg-clip-text font-display text-[6.5rem] font-bold leading-none text-transparent sm:text-[8rem]">
          404
        </p>

        <h1 className="mt-4 font-display text-3xl text-ink sm:text-4xl">
          Ops! Pagina non trovata
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/65 sm:text-base">
          Sembra che questa pagina sia andata persa… proprio come gli appunti del giorno
          prima della verifica!
        </p>

        <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-copper px-6 py-3 text-sm font-semibold text-paper shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <HomeIcon />
            Torna alla Home
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-paper-2/60 px-6 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-forest/40 hover:text-forest"
          >
            <UserIcon />
            Vai al Profilo
          </Link>
        </div>
      </div>
    </main>
  )
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.8 8 2.5l5.5 4.3v6a.7.7 0 0 1-.7.7H9.6V10H6.4v3.5H3.2a.7.7 0 0 1-.7-.7v-6Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="5.5" r="2.6" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M3.2 13c.5-2.3 2.5-3.6 4.8-3.6S12.3 10.7 12.8 13"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}
