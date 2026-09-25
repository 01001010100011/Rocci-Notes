import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function UserBadge({ compact = false }) {
  const { profile, logout } = useAuth()
  const username = profile?.username || 'Studente'
  const credits = profile?.credits ?? 0

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        to="/profile"
        title="Vai al profilo"
        className="flex min-w-0 items-center gap-2 rounded-full border border-ink/10 bg-paper/80 py-1 pl-1 pr-3 shadow-soft backdrop-blur transition hover:border-ink/30 sm:pr-4"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-forest text-xs font-bold text-paper sm:h-9 sm:w-9">
          {username.slice(0, 1).toUpperCase()}
        </span>
        {!compact && (
          <>
            <span className="truncate text-sm font-semibold text-ink">{username}</span>
            <span className="hidden h-4 w-px bg-ink/15 sm:block" />
          </>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-copper/15 px-2 py-0.5 text-xs font-bold text-copper">
          <CoinIcon />
          {credits}
        </span>
      </Link>
      <button
        type="button"
        onClick={logout}
        className="rounded-full border border-ink/10 px-3 py-2 text-xs font-semibold text-ink/70 transition hover:border-ink/30 hover:text-ink"
      >
        Esci
      </button>
    </div>
  )
}

function CoinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="6" r="5.25" fill="currentColor" opacity="0.25" />
      <circle cx="6" cy="6" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}
