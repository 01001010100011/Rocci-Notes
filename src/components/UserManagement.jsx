import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import {
  ROLE_ADMIN,
  ROLE_HELPER,
  ROLE_LABELS,
  ROLE_USER,
  normalizeRole,
} from '../constants'
import { useAuth } from '../context/AuthContext'

const ROLE_OPTIONS = [ROLE_USER, ROLE_HELPER, ROLE_ADMIN]

function roleBadgeClasses(role) {
  if (role === ROLE_ADMIN) return 'bg-copper/15 text-copper'
  if (role === ROLE_HELPER) return 'bg-forest/15 text-forest'
  return 'bg-ink/10 text-ink/70'
}

export default function UserManagement() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  useEffect(
    () =>
      onSnapshot(collection(db, 'users'), (snapshot) => {
        const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
        items.sort((a, b) => (a.username || '').localeCompare(b.username || ''))
        setUsers(items)
      }),
    [],
  )

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return users
    return users.filter(
      (item) =>
        (item.username || '').toLowerCase().includes(needle) ||
        (item.email || '').toLowerCase().includes(needle),
    )
  }, [users, search])

  async function mutate(target, patch) {
    setBusyId(target.id)
    setError('')
    try {
      await updateDoc(doc(db, 'users', target.id), patch)
    } catch (err) {
      setError(err.message || 'Operazione non riuscita.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/55">
            Cerca utente
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nickname o email…"
            autoComplete="off"
            className="mt-1 w-full rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-copper/40"
          />
        </label>
        <span className="shrink-0 rounded-full bg-ink/10 px-4 py-2 text-sm font-bold text-ink/70">
          {filtered.length} di {users.length} utenti
        </span>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-copper/10 px-4 py-3 text-sm text-copper">{error}</p>
      )}

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-[28px] border border-dashed border-ink/20 bg-paper/50 px-6 py-12 text-center text-ink/65">
          Nessun utente corrisponde a “{search}”.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3">
          {filtered.map((item) => (
            <UserRow
              key={item.id}
              item={item}
              isSelf={item.id === me?.uid}
              busy={busyId === item.id}
              expanded={expanded === item.id}
              onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
              onRole={(role) => mutate(item, { role })}
              onBlock={() => mutate(item, { isBlocked: item.isBlocked !== true })}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

function UserRow({ item, isSelf, busy, expanded, onToggle, onRole, onBlock }) {
  const role = normalizeRole(item.role)
  const blocked = item.isBlocked === true

  return (
    <li className="overflow-hidden rounded-[24px] border border-ink/10 bg-paper/80 shadow-soft">
      <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-expanded={expanded}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest text-sm font-bold text-paper">
            {(item.username || '?').slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate font-semibold text-ink">{item.username || 'Senza nome'}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${roleBadgeClasses(role)}`}
              >
                {ROLE_LABELS[role]}
              </span>
              {blocked && (
                <span className="rounded-full bg-copper px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-paper">
                  Bloccato
                </span>
              )}
              {isSelf && (
                <span className="rounded-full bg-ink/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-ink/60">
                  Tu
                </span>
              )}
            </span>
            <span className="mt-0.5 block truncate text-xs text-ink/55">{item.email || '—'}</span>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <select
            value={role}
            disabled={isSelf || busy}
            onChange={(e) => onRole(e.target.value)}
            aria-label={`Ruolo di ${item.username || item.email}`}
            className="rounded-xl border border-ink/15 bg-white/70 px-3 py-2 text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-copper/40 disabled:opacity-50"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {ROLE_LABELS[option]}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={isSelf || busy}
            onClick={onBlock}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${
              blocked
                ? 'bg-forest text-paper hover:opacity-90'
                : 'border border-copper/40 bg-copper/10 text-copper hover:bg-copper/20'
            }`}
          >
            {busy ? '…' : blocked ? 'Sblocca' : 'Blocca'}
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-label={expanded ? 'Chiudi dettagli' : 'Apri dettagli'}
            className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink/60 transition hover:border-ink/40 hover:text-ink"
          >
            {expanded ? '▴' : '▾'}
          </button>
        </div>
      </div>

      {expanded && <UserDetail userId={item.id} item={item} />}
    </li>
  )
}

function UserDetail({ userId, item }) {
  const [vouchers, setVouchers] = useState(null)
  const role = normalizeRole(item.role)
  const infinite = role === ROLE_ADMIN

  useEffect(() => {
    let active = true
    getDocs(query(collection(db, 'vouchers'), where('usedBy', 'array-contains', userId)))
      .then((snapshot) => {
        if (active) setVouchers(snapshot.docs.map((d) => d.id))
      })
      .catch(() => {
        if (active) setVouchers([])
      })
    return () => {
      active = false
    }
  }, [userId])

  return (
    <div className="border-t border-ink/10 bg-white/40 px-4 py-4 sm:px-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Saldo crediti" value={infinite ? '∞' : item.credits ?? 0} />
        <Stat label="Appunti approvati" value={item.uploadsCount ?? 0} />
        <Stat label="Appunti scaricati" value={item.downloadsCount ?? 0} />
      </div>
      <div className="mt-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/55">
          Voucher riscattati
        </span>
        {vouchers === null ? (
          <p className="mt-2 text-sm text-ink/55">Carico i voucher…</p>
        ) : vouchers.length === 0 ? (
          <p className="mt-2 text-sm text-ink/55">Nessun voucher riscattato.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {vouchers.map((code) => (
              <li
                key={code}
                className="rounded-full bg-copper/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-copper"
              >
                {code}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper/70 px-4 py-3">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/55">
        {label}
      </span>
      <span className="mt-1 block font-display text-2xl text-ink">{value}</span>
    </div>
  )
}
