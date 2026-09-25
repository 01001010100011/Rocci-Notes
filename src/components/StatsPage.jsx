import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

const TABS = [
  { key: 'contributors', label: 'Top Contributori', field: 'uploadsCount', unit: 'appunti approvati' },
  { key: 'downloads', label: 'Top Download', field: 'downloadsCount', unit: 'appunti scaricati' },
]

export default function StatsPage() {
  const [tab, setTab] = useState('contributors')
  const [contributors, setContributors] = useState([])
  const [downloaders, setDownloaders] = useState([])

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'users'), orderBy('uploadsCount', 'desc'), limit(10)),
        (snapshot) => setContributors(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        () => {},
      ),
    [],
  )

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'users'), orderBy('downloadsCount', 'desc'), limit(10)),
        (snapshot) => setDownloaders(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        () => {},
      ),
    [],
  )

  const active = TABS.find((item) => item.key === tab)
  const list = tab === 'contributors' ? contributors : downloaders
  const podium = list.slice(0, 3)
  const rest = list.slice(3)

  return (
    <main className="mx-auto mt-8 max-w-4xl">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-copper">
          Classifica
        </p>
        <h2 className="font-display text-4xl text-ink">Chi si dà più da fare</h2>
        <p className="mt-2 text-sm text-ink/60">
          I numeri si aggiornano automaticamente a ogni appunto approvato e a ogni download.
        </p>
      </header>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === item.key
                ? 'bg-ink text-paper'
                : 'border border-ink/10 bg-paper/70 text-ink/70'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-8 rounded-[28px] border border-dashed border-ink/20 bg-paper/50 px-6 py-16 text-center">
          <p className="font-display text-3xl text-ink">Classifica ancora vuota</p>
          <p className="mt-3 text-ink/65">
            Appena qualcuno carica o scarica appunti, comparirà qui.
          </p>
        </div>
      ) : (
        <>
          <Podium entries={podium} field={active.field} />
          {rest.length > 0 && (
            <ol className="mt-6 space-y-2">
              {rest.map((entry, index) => (
                <Row
                  key={entry.id}
                  rank={index + 4}
                  entry={entry}
                  field={active.field}
                  unit={active.unit}
                />
              ))}
            </ol>
          )}
        </>
      )}
    </main>
  )
}

function Podium({ entries, field }) {
  const seats = [
    { entry: entries[1], place: 2, block: 'h-20 sm:h-24', tone: 'border-ink/10 bg-ink/8 text-ink/70' },
    { entry: entries[0], place: 1, block: 'h-28 sm:h-32', tone: 'border-copper/30 bg-copper/15 text-copper' },
    { entry: entries[2], place: 3, block: 'h-16 sm:h-20', tone: 'border-forest/20 bg-forest/12 text-forest' },
  ].filter((seat) => seat.entry)

  return (
    <div className="mt-8 flex items-end justify-center gap-3 sm:gap-5">
      {seats.map((seat) => (
        <div key={seat.place} className="flex w-24 flex-col items-center sm:w-32">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-forest font-display text-xl text-paper">
            {(seat.entry.username || 'S').slice(0, 1).toUpperCase()}
          </span>
          <p className="mt-2 w-full truncate text-center text-sm font-semibold text-ink">
            {seat.entry.username || 'Studente'}
          </p>
          <p className="text-xs font-bold text-ink/55">{seat.entry[field] ?? 0}</p>
          <div
            className={`mt-2 grid w-full place-items-center rounded-t-2xl border ${seat.block} ${seat.tone}`}
          >
            <span className="font-display text-3xl">{seat.place}°</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function Row({ rank, entry, field, unit }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-paper/70 px-4 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/8 text-sm font-bold text-ink/60">
        {rank}
      </span>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest text-sm font-bold text-paper">
        {(entry.username || 'S').slice(0, 1).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
        {entry.username || 'Studente'}
      </span>
      <span className="shrink-0 text-sm font-bold text-copper">
        {entry[field] ?? 0}
        <span className="ml-1 hidden text-xs font-medium text-ink/45 sm:inline">{unit}</span>
      </span>
    </li>
  )
}
