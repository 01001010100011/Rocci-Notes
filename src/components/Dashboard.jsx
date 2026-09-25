import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { INSUFFICIENT_CREDITS_MESSAGE, PROFESSORI, SUBJECTS } from '../constants'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [downloadedIds, setDownloadedIds] = useState(() => new Set())
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('')
  const [professor, setProfessor] = useState('')
  const [notice, setNotice] = useState(location.state?.notice || '')

  useEffect(() => {
    if (location.state?.notice) {
      navigate('.', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 5000)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    const notesQuery = query(
      collection(db, 'notes'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
    )
    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      setNotes(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'downloads'),
      (snapshot) => {
        setDownloadedIds(new Set(snapshot.docs.map((item) => item.id)))
      },
      () => {},
    )
    return unsubscribe
  }, [user.uid])

  const trimmedSearch = search.trim().toLowerCase()
  const visibleNotes = notes.filter((note) => {
    if (subject && note.subject !== subject) return false
    if (professor && note.professor !== professor) return false
    if (trimmedSearch) {
      const haystack =
        `${note.title || ''} ${note.description || ''} ${note.subject || ''} ${note.professor || ''}`.toLowerCase()
      if (!haystack.includes(trimmedSearch)) return false
    }
    return true
  })
  const filtersActive = Boolean(subject || professor || trimmedSearch)

  function resetFilters() {
    setSearch('')
    setSubject('')
    setProfessor('')
  }

  return (
    <div className="mx-auto mt-8 max-w-6xl">
      {notice && (
        <p className="mb-6 rounded-2xl bg-forest/12 px-4 py-3 text-sm font-semibold text-forest">
          {notice}
        </p>
      )}

      <div className="rounded-[24px] border border-ink/10 bg-paper/70 p-4 shadow-soft sm:p-5">
        <div className="grid gap-3 lg:grid-cols-4">
          <label className="lg:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/55">
              Cerca
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Titolo, descrizione o argomento…"
              className="w-full rounded-2xl border border-ink/10 bg-white/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-copper/40"
            />
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/55">
              Materia
            </span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-ink/10 bg-white/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-copper/40"
            >
              <option value="">Tutte le materie</option>
              {SUBJECTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/55">
              Professore
            </span>
            <select
              value={professor}
              onChange={(e) => setProfessor(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-ink/10 bg-white/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-copper/40"
            >
              <option value="">Tutti i professori</option>
              {PROFESSORI.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-ink/50">
            {visibleNotes.length} {visibleNotes.length === 1 ? 'appunto trovato' : 'appunti trovati'}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            disabled={!filtersActive}
            className="rounded-full border border-ink/15 px-4 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-ink/40 disabled:opacity-40"
          >
            Azzera filtri
          </button>
        </div>
      </div>

      {visibleNotes.length === 0 ? (
        notes.length === 0 ? (
          <EmptyState />
        ) : (
          <NoMatchState onReset={resetFilters} />
        )
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibleNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isOwner={note.authorId === user.uid}
              alreadyDownloaded={downloadedIds.has(note.id)}
              credits={profile?.credits ?? 0}
              userId={user.uid}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mt-10 rounded-[28px] border border-dashed border-ink/20 bg-paper/50 px-6 py-16 text-center">
      <p className="font-display text-3xl text-ink">La bacheca è ancora vuota</p>
      <p className="mx-auto mt-3 max-w-md text-ink/65">
        Carica il primo file: PDF o foto del quaderno. Guadagni 1 credito a pubblicazione.
      </p>
      <Link
        to="/upload"
        className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper"
      >
        Carica i tuoi appunti
      </Link>
    </div>
  )
}

function NoMatchState({ onReset }) {
  return (
    <div className="mt-10 rounded-[28px] border border-dashed border-ink/20 bg-paper/50 px-6 py-16 text-center">
      <p className="font-display text-3xl text-ink">Nessun appunto trovato</p>
      <p className="mx-auto mt-3 max-w-md text-ink/65">
        Prova a cambiare ricerca, materia o professore.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper"
      >
        Azzera filtri
      </button>
    </div>
  )
}

function NoteCard({ note, isOwner, alreadyDownloaded, credits, userId }) {
  const [busy, setBusy] = useState(false)

  async function handleDownload() {
    // Aprire una scheda durante il click evita che i browser blocchino il download
    // dopo l'operazione asincrona su Firestore.
    const downloadWindow = window.open('', '_blank')
    setBusy(true)
    try {
      const downloadRef = doc(db, 'users', userId, 'downloads', note.id)
      const alreadyDownloaded = (await getDoc(downloadRef)).exists()

      if (!alreadyDownloaded && credits < 1) {
        downloadWindow?.close()
        window.alert(INSUFFICIENT_CREDITS_MESSAGE)
        return
      }

      if (!alreadyDownloaded) {
        await runTransaction(db, async (transaction) => {
          const userRef = doc(db, 'users', userId)
          const noteRef = doc(db, 'notes', note.id)
          const userSnapshot = await transaction.get(userRef)
          const downloadSnapshot = await transaction.get(downloadRef)

          // Già acquistato tra il controllo e la transazione: niente addebito.
          if (downloadSnapshot.exists()) return

          if (!userSnapshot.exists() || (userSnapshot.data().credits ?? 0) < 1) {
            throw new Error(INSUFFICIENT_CREDITS_MESSAGE)
          }

          transaction.update(userRef, { credits: increment(-1), downloadsCount: increment(1) })
          transaction.update(noteRef, { downloadsCount: increment(1) })
          transaction.set(downloadRef, {
            noteId: note.id,
            title: note.title,
            subject: note.subject || '',
            fileUrl: note.fileUrl,
            downloadedAt: serverTimestamp(),
          })
        })
      }

      if (downloadWindow) {
        downloadWindow.opener = null
        downloadWindow.location.replace(note.fileUrl)
      } else {
        window.alert('Download autorizzato, ma il browser ha bloccato la nuova scheda.')
      }
    } catch (err) {
      downloadWindow?.close()
      window.alert(err.message || 'Download non riuscito.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="flex flex-col rounded-[24px] border border-ink/10 bg-paper/80 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
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
        <span className="text-xs font-semibold text-ink/45">
          {note.downloadsCount ?? 0} download
        </span>
      </div>
      <h2 className="mt-4 font-display text-2xl leading-tight text-ink">{note.title}</h2>
      {note.description && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/65">{note.description}</p>
      )}
      <p className="mt-4 text-xs text-ink/45">
        di {note.authorName}
        {isOwner ? ' · i tuoi appunti' : ''}
      </p>

      <button
        type="button"
        disabled={busy}
        onClick={handleDownload}
        className="mt-5 rounded-2xl bg-ink py-3 text-sm font-semibold text-paper disabled:opacity-60"
      >
        {busy
          ? 'Apertura…'
          : alreadyDownloaded
            ? 'Riscarica gratis'
            : 'Scarica (1 Credito)'}
      </button>
    </li>
  )
}
