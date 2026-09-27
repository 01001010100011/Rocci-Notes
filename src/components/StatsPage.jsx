import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { downloadNote } from '../downloadNote'
import useDocumentTitle from '../useDocumentTitle'

const TABS = [
  { key: 'notes', label: '🏆 Appunti Più Scaricati' },
  { key: 'contributors', label: '👤 Top Contributori', field: 'uploadsCount', unit: 'appunti approvati' },
  { key: 'downloads', label: '📥 Top Utenti Download', field: 'downloadsCount', unit: 'appunti scaricati' },
]

const MEDALS = ['🥇', '🥈', '🥉']

// In classifica servono solo nickname e contatori: l'email non viene mai letta.
function pickRankEntry(item) {
  const data = item.data()
  return {
    id: item.id,
    username: data.username,
    uploadsCount: data.uploadsCount,
    downloadsCount: data.downloadsCount,
  }
}

function pickNote(item) {
  const data = item.data()
  return {
    id: item.id,
    title: data.title,
    subject: data.subject || '',
    professor: data.professor || '',
    authorName: data.authorName || 'Studente',
    downloadsCount: data.downloadsCount ?? 0,
    fileUrl: data.fileUrl,
  }
}

export default function StatsPage() {
  useDocumentTitle('Classifica')
  const { user, profile, isAdmin } = useAuth()
  const [tab, setTab] = useState('notes')
  const [notes, setNotes] = useState([])
  const [contributors, setContributors] = useState([])
  const [downloaders, setDownloaders] = useState([])
  const [loading, setLoading] = useState({ notes: true, contributors: true, downloads: true })

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, 'notes'),
          where('status', '==', 'approved'),
          orderBy('downloadsCount', 'desc'),
          limit(10),
        ),
        (snapshot) => {
          setNotes(snapshot.docs.map(pickNote))
          setLoading((prev) => ({ ...prev, notes: false }))
        },
        () => setLoading((prev) => ({ ...prev, notes: false })),
      ),
    [],
  )

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'users'), orderBy('uploadsCount', 'desc'), limit(10)),
        (snapshot) => {
          setContributors(snapshot.docs.map(pickRankEntry))
          setLoading((prev) => ({ ...prev, contributors: false }))
        },
        () => setLoading((prev) => ({ ...prev, contributors: false })),
      ),
    [],
  )

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'users'), orderBy('downloadsCount', 'desc'), limit(10)),
        (snapshot) => {
          setDownloaders(snapshot.docs.map(pickRankEntry))
          setLoading((prev) => ({ ...prev, downloads: false }))
        },
        () => setLoading((prev) => ({ ...prev, downloads: false })),
      ),
    [],
  )

  const active = TABS.find((item) => item.key === tab)

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

      {tab === 'notes' ? (
        loading.notes ? (
          <SkeletonList />
        ) : notes.length === 0 ? (
          <EmptyState
            title="Nessun appunto scaricato"
            text="Appena qualcuno scarica un appunto, la classifica comparirà qui."
          />
        ) : (
          <ol className="mt-6 space-y-3">
            {notes.map((note, index) => (
              <NoteRow
                key={note.id}
                rank={index + 1}
                note={note}
                userId={user.uid}
                isAdmin={isAdmin}
                credits={profile?.credits ?? 0}
                username={profile?.username || user.displayName || 'Studente'}
                email={user.email}
              />
            ))}
          </ol>
        )
      ) : loading[tab] ? (
        <SkeletonList />
      ) : (
        <UserRanking tab={tab} active={active} contributors={contributors} downloaders={downloaders} />
      )}
    </main>
  )
}

function UserRanking({ tab, active, contributors, downloaders }) {
  const list = tab === 'contributors' ? contributors : downloaders
  if (list.length === 0) {
    return (
      <EmptyState
        title="Classifica ancora vuota"
        text="Appena qualcuno carica o scarica appunti, comparirà qui."
      />
    )
  }
  const podium = list.slice(0, 3)
  const rest = list.slice(3)
  return (
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
  )
}

function NoteRow({ rank, note, userId, isAdmin, credits, username, email }) {
  const [busy, setBusy] = useState(false)
  const medal = MEDALS[rank - 1]

  async function handleDownload() {
    setBusy(true)
    try {
      await downloadNote({ note, userId, isAdmin, credits, username, email })
    } catch (err) {
      window.alert(err.message || 'Download non riuscito.')
    } finally {
      setBusy(false)
    }
  }

  const rankTone =
    rank === 1
      ? 'border-copper/40 bg-copper/15 text-copper'
      : rank === 2
        ? 'border-ink/20 bg-ink/8 text-ink/70'
        : rank === 3
          ? 'border-forest/30 bg-forest/12 text-forest'
          : 'border-ink/10 bg-ink/5 text-ink/55'

  return (
    <li className="flex flex-col gap-4 rounded-3xl border border-ink/10 bg-paper/80 p-4 shadow-soft sm:flex-row sm:items-center sm:p-5">
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border font-display text-lg ${rankTone}`}
      >
        {medal ? <span className="text-2xl">{medal}</span> : `${rank}°`}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-xl leading-tight text-ink">{note.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {note.subject && (
            <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-forest">
              {note.subject}
            </span>
          )}
          {note.professor && (
            <span className="rounded-full bg-copper/12 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-copper">
              {note.professor}
            </span>
          )}
          <span className="text-xs text-ink/50">di {note.authorName}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2">
        <span className="rounded-full bg-copper/10 px-3 py-1 text-sm font-bold text-copper">
          🔥 {note.downloadsCount} download
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={handleDownload}
          className="rounded-2xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-forest disabled:opacity-60"
        >
          {busy ? 'Generazione…' : isAdmin ? 'Scarica (∞)' : 'Scarica'}
        </button>
      </div>
    </li>
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

function EmptyState({ title, text }) {
  return (
    <div className="mt-8 rounded-[28px] border border-dashed border-ink/20 bg-paper/50 px-6 py-16 text-center">
      <p className="font-display text-3xl text-ink">{title}</p>
      <p className="mt-3 text-ink/65">{text}</p>
    </div>
  )
}

function SkeletonList() {
  return (
    <ol className="mt-6 space-y-3">
      {[0, 1, 2, 3, 4].map((key) => (
        <li
          key={key}
          className="flex items-center gap-4 rounded-3xl border border-ink/10 bg-paper/60 p-5"
        >
          <span className="h-12 w-12 shrink-0 animate-pulse rounded-2xl bg-ink/10" />
          <span className="flex-1 space-y-2">
            <span className="block h-4 w-2/3 animate-pulse rounded-full bg-ink/10" />
            <span className="block h-3 w-1/3 animate-pulse rounded-full bg-ink/8" />
          </span>
          <span className="h-8 w-24 shrink-0 animate-pulse rounded-full bg-ink/10" />
        </li>
      ))}
    </ol>
  )
}
