export default function Footer() {
  return (
    <footer className="mx-auto mt-14 max-w-6xl border-t border-ink/10 pt-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-2xl text-ink">Rocci Notes</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/65">
            La bacheca dove gli studenti si scambiano appunti con i crediti: carichi i tuoi
            quaderni, sblocchi quelli dei compagni. Tre crediti di benvenuto per iniziare.
          </p>
          <a
            href="mailto:roccinotes@gmail.com"
            className="mt-3 inline-block text-sm font-semibold text-copper underline-offset-2 hover:underline"
          >
            roccinotes@gmail.com
          </a>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">Creatore</p>
          <p className="mt-2 text-sm text-ink/70">Sviluppato da Leo Riello</p>
          <a
            href="https://instagram.com/leo.riello"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-copper underline-offset-2 hover:underline"
          >
            <InstagramIcon />
            @leo.riello
          </a>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink/45">
            Progetti correlati
          </p>
          <a
            href="https://scola-mia.com"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-forest underline-offset-2 hover:underline"
          >
            Scola Mia
            <ArrowIcon />
          </a>
        </div>
      </div>

      <p className="mt-8 pb-2 text-xs text-ink/40">
        © {new Date().getFullYear()} Rocci Notes · Fatto per gli studenti, dagli studenti.
      </p>
    </footer>
  )
}

function InstagramIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.75" y="1.75" width="12.5" height="12.5" rx="3.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11.7" cy="4.3" r="0.9" fill="currentColor" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
