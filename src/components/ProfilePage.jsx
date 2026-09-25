import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

const TABS = [
  ['approved', 'I Miei Appunti Approvati'],
  ['pending', 'In Approvazione'],
  ['downloads', 'Storico Acquisti'],
]

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState('approved')
  const [myNotes, setMyNotes] = useState([])
  const [downloads, setDownloads] = useState([])

  useEffect(() => {
    const notesQuery = query(
      collection(db, 'notes'),
      where('authorId', '==', user.uid),
    )
    return onSnapshot(notesQuery, (snapshot) => {
      setMyNotes(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    })
  }, [user.uid])

  useEffect(() => {
    const downloadsQuery = query(
      collection(db, 'users', user.uid, 'downloads'),
      orderBy('downloadedAt', 'desc'),
    )
    return onSnapshot(downloadsQuery, (snapshot) => {
      setDownloads(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    })
  }, [user.uid])

  const approved = myNotes.filter((note) => note.status === 'approved')
  const pending = myNotes.filter((note) => note.status === 'pending')
  const now = new Date()
  const rejected = myNotes.filter(
    (note) =>
      note.status === 'rejected' &&
      !(note.expireAt?.toDate && note.expireAt.toDate() < now),
  )
  const counts = {
    approved: approved.length,
    pending: pending.length + rejected.length,
    downloads: downloads.length,
  }

  return (
    <main className="mx-auto mt-8 max-w-4xl">
      <section className="rounded-[28px] border border-ink/10 bg-paper/85 p-5 shadow-soft sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-forest font-display text-2xl text-paper">
            {(profile?.username || 'S').slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <EditableUsername userId={user.uid} username={profile?.username || ''} />
            <p className="mt-1 truncate text-sm text-ink/60">{user.email}</p>
          </div>
          <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-copper/15 px-3 py-1.5 text-sm font-bold text-copper">
            <CoinIcon />
            {profile?.credits ?? 0} crediti
          </span>
        </div>
      </section>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === key
                ? 'bg-ink text-paper'
                : 'border border-ink/10 bg-paper/70 text-ink/70'
            }`}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      {tab === 'approved' && (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {approved.map((note) => (
            <li
              key={note.id}
              className="rounded-[24px] border border-ink/10 bg-paper/80 p-5 shadow-soft"
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-forest/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-forest">
                  {note.subject || 'Altro'}
                </span>
                {note.professor && (
                  <span className="rounded-full bg-copper/12 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-copper">
                    {note.professor}
                  </span>
                )}
              </span>
              <h3 className="mt-3 font-display text-xl leading-tight text-ink">{note.title}</h3>
              <p className="mt-2 text-sm font-semibold text-ink/60">
                {note.downloadsCount ?? 0} download ricevuti
              </p>
            </li>
          ))}
          {approved.length === 0 && <EmptyHint text="Nessun appunto approvato per ora." />}
        </ul>
      )}

      {tab === 'pending' && (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {pending.map((note) => (
            <li
              key={note.id}
              className="rounded-[24px] border border-dashed border-copper/40 bg-paper/60 p-5"
            >
              <span className="rounded-full bg-copper/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-copper">
                In attesa di revisione Admin
              </span>
              <h3 className="mt-3 font-display text-xl leading-tight text-ink">{note.title}</h3>
              <p className="mt-2 text-sm text-ink/60">
                {note.subject || 'Altro'}
                {note.professor ? ` · ${note.professor}` : ''}
              </p>
            </li>
          ))}
          {rejected.map((note) => (
            <li
              key={note.id}
              className="rounded-[24px] border border-copper/40 bg-copper/5 p-5"
            >
              <span className="rounded-full bg-copper px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-paper">
                Rifiutato dall’Admin
              </span>
              <h3 className="mt-3 font-display text-xl leading-tight text-ink">{note.title}</h3>
              <p className="mt-2 text-sm text-ink/60">
                {note.subject || 'Altro'}
                {note.professor ? ` · ${note.professor}` : ''}
              </p>
              <p className="mt-3 rounded-2xl bg-white/60 px-4 py-3 text-sm leading-relaxed text-ink/75">
                <span className="font-semibold text-copper">Motivazione: </span>
                {note.rejectionReason || 'Nessuna motivazione fornita.'}
              </p>
            </li>
          ))}
          {pending.length === 0 && rejected.length === 0 && (
            <EmptyHint text="Nessun appunto in attesa di approvazione." />
          )}
        </ul>
      )}

      {tab === 'downloads' && (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {downloads.map((item) => (
            <li
              key={item.id}
              className="flex flex-col rounded-[24px] border border-ink/10 bg-paper/80 p-5 shadow-soft"
            >
              <span className="self-start rounded-full bg-forest/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-forest">
                {item.subject || 'Altro'}
              </span>
              <h3 className="mt-3 font-display text-xl leading-tight text-ink">{item.title}</h3>
              <p className="mt-1 text-xs text-ink/45">
                Acquistato il{' '}
                {item.downloadedAt?.toDate
                  ? item.downloadedAt.toDate().toLocaleDateString('it-IT')
                  : '—'}
              </p>
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 rounded-2xl bg-ink py-3 text-center text-sm font-semibold text-paper"
              >
                Download PDF (gratis)
              </a>
            </li>
          ))}
          {downloads.length === 0 && <EmptyHint text="Non hai ancora scaricato appunti." />}
        </ul>
      )}
    </main>
  )
}

function EditableUsername({ userId, username }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(username)
  const [prevUsername, setPrevUsername] = useState(username)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (username !== prevUsername) {
    setPrevUsername(username)
    setDraft(username)
  }

  async function handleSave() {
    const next = draft.trim()
    if (!next) {
      setError('Il nickname non può essere vuoto.')
      return
    }
    if (next === username) {
      setEditing(false)
      return
    }

    setBusy(true)
    setError('')
    try {
      await updateDoc(doc(db, 'users', userId), { username: next })

      const authoredNotes = await getDocs(
        query(collection(db, 'notes'), where('authorId', '==', userId)),
      )
      if (!authoredNotes.empty) {
        const batch = writeBatch(db)
        authoredNotes.docs.forEach((noteDoc) => {
          batch.update(noteDoc.ref, { authorName: next })
        })
        await batch.commit()
      }

      setEditing(false)
    } catch (err) {
      setError(err.message || 'Aggiornamento del nickname non riuscito.')
    } finally {
      setBusy(false)
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <h2 className="truncate font-display text-2xl text-ink">{username || 'Studente'}</h2>
        <button
          type="button"
          aria-label="Modifica nickname"
          onClick={() => setEditing(true)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/15 text-ink/60 transition hover:border-ink/40 hover:text-ink"
        >
          <PencilIcon />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') {
              setDraft(username)
              setEditing(false)
            }
          }}
          maxLength={40}
          className="w-44 rounded-xl border border-ink/20 bg-white/70 px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-copper/40"
        />
        <button
          type="button"
          disabled={busy}
          onClick={handleSave}
          className="rounded-full bg-forest px-3 py-1.5 text-xs font-bold text-paper disabled:opacity-60"
        >
          {busy ? 'Salvo…' : 'Salva'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setDraft(username)
            setEditing(false)
          }}
          className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/70"
        >
          Annulla
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs font-semibold text-copper">{error}</p>}
    </div>
  )
}

function EmptyHint({ text }) {
  return (
    <li className="rounded-[24px] border border-dashed border-ink/20 bg-paper/50 px-6 py-10 text-center sm:col-span-2">
      <p className="text-ink/65">{text}</p>
      <Link to="/upload" className="mt-3 inline-block text-sm font-bold text-copper">
        Carica i tuoi appunti →
      </Link>
    </li>
  )
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M11.3 1.7a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 1 0 1.4L6 13l-3.8 1.2a.4.4 0 0 1-.5-.5L2.9 10 11.3 1.7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CoinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="6" r="5.25" fill="currentColor" opacity="0.25" />
      <circle cx="6" cy="6" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}
