import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import UserBadge from './UserBadge'
import Footer from './Footer'

const MOBILE_NAV = [
  { to: '/', label: 'Bacheca', Icon: HomeIcon },
  { to: '/upload', label: 'Carica', Icon: PlusIcon },
  { to: '/stats', label: 'Classifica', Icon: TrophyIcon },
  { to: '/profile', label: 'Profilo', Icon: UserIcon },
]

function usePendingCount(isAdmin) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isAdmin) return undefined
    return onSnapshot(
      query(collection(db, 'notes'), where('status', '==', 'pending')),
      (snapshot) => setCount(snapshot.size),
      () => {},
    )
  }, [isAdmin])

  return isAdmin ? count : 0
}

export default function AppShell() {
  const { pathname } = useLocation()
  const { isAdmin } = useAuth()
  const pendingCount = usePendingCount(isAdmin)
  const onUpload = pathname === '/upload'
  const onStats = pathname === '/stats'

  return (
    <div className="min-h-dvh px-4 pb-28 pt-4 sm:px-6 sm:pb-10 sm:pt-6 lg:px-10">
      <header className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-copper">
            Bacheca appunti
          </p>
          <h1 className="font-display text-4xl text-ink sm:text-5xl">Rocci Notes</h1>
        </Link>
        <div className="hidden items-center gap-3 sm:flex">
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper transition hover:opacity-90"
            >
              Pannello Admin
              {pendingCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-paper px-1 text-[11px] font-bold text-forest">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
          <Link
            to="/stats"
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              onStats ? 'bg-ink text-paper' : 'border border-ink/10 text-ink hover:border-ink/30'
            }`}
          >
            Classifica
          </Link>
          <Link
            to="/upload"
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              onUpload ? 'bg-ink text-paper' : 'border border-ink/10 text-ink hover:border-ink/30'
            }`}
          >
            Carica appunti
          </Link>
          <UserBadge />
        </div>
        <div className="flex items-center justify-end gap-2 sm:hidden">
          {isAdmin && (
            <Link
              to="/admin"
              aria-label="Pannello Admin"
              title="Pannello Admin"
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest text-paper shadow-soft transition hover:opacity-90"
            >
              <ShieldIcon />
              {pendingCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-copper px-1 text-[10px] font-bold text-paper ring-2 ring-paper">
                  {pendingCount}
                </span>
              )}
            </Link>
          )}
          <UserBadge compact />
        </div>
      </header>
      <Outlet />
      <Footer />

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 backdrop-blur sm:hidden">
        <ul className="mx-auto flex max-w-md items-stretch justify-around">
          {MOBILE_NAV.map(({ to, label, Icon }) => {
            const active = pathname === to
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                    active ? 'text-copper' : 'text-ink/55'
                  }`}
                >
                  <Icon />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3 8.5 10 3l7 5.5V16a1 1 0 0 1-1 1h-3.5v-5h-5v5H4a1 1 0 0 1-1-1V8.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 16.5c.8-2.6 3.1-4 6-4s5.2 1.4 6 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M6 3h8v4a4 4 0 0 1-8 0V3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M6 4H4v1.5A2.5 2.5 0 0 0 6.5 8M14 4h2v1.5A2.5 2.5 0 0 1 13.5 8M10 11v3M7 17h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5 4 5v5c0 3.4 2.5 6.2 6 7.5 3.5-1.3 6-4.1 6-7.5V5l-6-2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m7.4 10 1.9 1.9 3.4-3.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
