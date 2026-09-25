import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import { REJECTION_TTL_BANNER, REJECTION_TTL_DAYS } from '../constants'

const STATUS_LABEL = {
  pending: 'In attesa',
  approved: 'Approvato',
  rejected: 'Rifiutato',
}

function formatDate(value) {
  return value?.toDate ? value.toDate().toLocaleDateString('it-IT') : '—'
}

function isPdfUrl(url = '') {
  return /\.pdf(\?|#|$)/i.test(url)
}

function expiryDate() {
  return Timestamp.fromDate(new Date(Date.now() + REJECTION_TTL_DAYS * 24 * 60 * 60 * 1000))
}

async function purgeExpiredRejections() {
  const snapshot = await getDocs(query(collection(db, 'notes'), where('status', '==', 'rejected')))
  const now = new Date()
  const expired = snapshot.docs.filter((item) => {
    const expireAt = item.data().expireAt?.toDate?.()
    return expireAt && expireAt < now
  })
  for (let i = 0; i < expired.length; i += 300) {
    const batch = writeBatch(db)
    expired.slice(i, i + 300).forEach((item) => batch.delete(item.ref))
    await batch.commit()
  }
}

export default function AdminPage() {
  const [tab, setTab] = useState('queue')
  const [pending, setPending] = useState([])
  const [history, setHistory] = useState([])
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    purgeExpiredRejections().catch(() => {})
  }, [])

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'notes'), where('status', '==', 'pending')),
        (snapshot) => {
          const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
          items.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
          setPending(items)
        },
      ),
    [],
  )

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'notes'), where('status', 'in', ['approved', 'rejected'])),
        (snapshot) => {
          const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
          items.sort(
            (a, b) =>
              (b.rejectedAt?.seconds ?? b.createdAt?.seconds ?? 0) -
              (a.rejectedAt?.seconds ?? a.createdAt?.seconds ?? 0),
          )
          setHistory(items)
        },
      ),
    [],
  )

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 4000)
    return () => window.clearTimeout(timer)
  }, [notice])

  async function decide(note, nextStatus, rejectionReason = '') {
    setBusy(true)
    setError('')
    try {
      const batch = writeBatch(db)
      const patch = { status: nextStatus }
      if (nextStatus === 'rejected') {
        patch.rejectionReason = rejectionReason
        patch.rejectedAt = serverTimestamp()
        patch.expireAt = expiryDate()
      }
      batch.update(doc(db, 'notes', note.id), patch)
      if (nextStatus === 'approved' && note.status !== 'approved') {
        batch.update(doc(db, 'users', note.authorId), {
          credits: increment(1),
          uploadsCount: increment(1),
        })
      }
      await batch.commit()

      setSelected(null)
      setNotice(
        nextStatus === 'approved'
          ? `“${note.title}” approvato: +1 credito a ${note.authorName}.`
          : `“${note.title}” rifiutato: verrà eliminato tra ${REJECTION_TTL_DAYS} giorni.`,
      )
    } catch (err) {
      setError(err.message || 'Operazione non riuscita.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto mt-8 max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-forest">
            Area riservata
          </p>
          <h2 className="font-display text-4xl text-ink">Pannello Admin</h2>
        </div>
        <span className="rounded-full bg-copper/15 px-4 py-2 text-sm font-bold text-copper">
          {pending.length} in attesa
        </span>
      </header>

      <p className="mt-5 rounded-2xl border border-copper/30 bg-copper/10 px-4 py-3 text-sm font-semibold text-copper">
        {REJECTION_TTL_BANNER}
      </p>

      <div className="mt-6 flex gap-2">
        {[
          ['queue', `Da approvare (${pending.length})`],
          ['history', `Storico (${history.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === key ? 'bg-ink text-paper' : 'border border-ink/10 bg-paper/70 text-ink/70'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'queue' &&
        (pending.length === 0 ? (
          <EmptyBox title="Nessun appunto in coda" text="Quando uno studente carica un file, comparirà qui." />
        ) : (
          <NoteGrid notes={pending} onOpen={setSelected} />
        ))}

      {tab === 'history' &&
        (history.length === 0 ? (
          <EmptyBox
            title="Storico vuoto"
            text="Gli appunti approvati o rifiutati compariranno qui e potrai revisionarli di nuovo."
          />
        ) : (
          <NoteGrid notes={history} onOpen={setSelected} showStatus />
        ))}

      {notice && (
        <p className="fixed right-4 top-4 z-50 rounded-2xl bg-forest px-5 py-3 text-sm font-semibold text-paper shadow-lift">
          {notice}
        </p>
      )}

      {selected && (
        <ReviewModal
          note={selected}
          busy={busy}
          error={error}
          onClose={() => setSelected(null)}
          onApprove={() => decide(selected, 'approved')}
          onReject={(reason) => decide(selected, 'rejected', reason)}
        />
      )}
    </main>
  )
}

function EmptyBox({ title, text }) {
  return (
    <div className="mt-8 rounded-[28px] border border-dashed border-ink/20 bg-paper/50 px-6 py-16 text-center">
      <p className="font-display text-3xl text-ink">{title}</p>
      <p className="mt-3 text-ink/65">{text}</p>
    </div>
  )
}

function NoteGrid({ notes, onOpen, showStatus = false }) {
  return (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            onClick={() => onOpen(note)}
            className="flex h-full w-full flex-col rounded-[24px] border border-ink/10 bg-paper/80 p-5 text-left shadow-soft transition hover:border-copper/50"
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
              {showStatus && (
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    note.status === 'approved' ? 'bg-forest text-paper' : 'bg-copper text-paper'
                  }`}
                >
                  {STATUS_LABEL[note.status]}
                </span>
              )}
            </span>
            <h3 className="mt-3 font-display text-2xl leading-tight text-ink">{note.title}</h3>
            <p className="mt-2 text-sm text-ink/60">di {note.authorName}</p>
            {note.status === 'rejected' && note.rejectionReason && (
              <p className="mt-2 line-clamp-2 text-xs text-ink/55">Motivo: {note.rejectionReason}</p>
            )}
            <p className="mt-auto pt-4 text-xs text-ink/45">
              {note.status === 'rejected'
                ? `Rifiutato il ${formatDate(note.rejectedAt)} · eliminazione il ${formatDate(note.expireAt)}`
                : `Caricato il ${formatDate(note.createdAt)}`}
            </p>
          </button>
        </li>
      ))}
    </ul>
  )
}

function ReviewModal({ note, busy, error, onClose, onApprove, onReject }) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')

  function handleRejectClick() {
    if (!rejecting) {
      setRejecting(true)
      return
    }
    if (!reason.trim()) {
      setReasonError('Inserisci una motivazione per il rifiuto: l’autore la vedrà nel suo profilo.')
      return
    }
    onReject(reason.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[88dvh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-ink/10 bg-paper p-5 shadow-lift sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-forest/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-forest">
                {note.subject || 'Altro'}
              </span>
              {note.professor && (
                <span className="rounded-full bg-copper/12 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-copper">
                  {note.professor}
                </span>
              )}
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                  note.status === 'approved'
                    ? 'bg-forest text-paper'
                    : note.status === 'rejected'
                      ? 'bg-copper text-paper'
                      : 'bg-ink/10 text-ink/70'
                }`}
              >
                {STATUS_LABEL[note.status] || note.status}
              </span>
            </span>
            <h3 className="mt-3 font-display text-3xl leading-tight text-ink">{note.title}</h3>
            <p className="mt-1 text-sm text-ink/60">
              di {note.authorName} · caricato il {formatDate(note.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi anteprima"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/15 text-ink/60 transition hover:border-ink/40 hover:text-ink"
          >
            ✕
          </button>
        </div>

        {note.description && (
          <p className="mt-4 whitespace-pre-line rounded-2xl bg-white/50 px-4 py-3 text-sm leading-relaxed text-ink/75">
            {note.description}
          </p>
        )}

        <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white/60">
          {isPdfUrl(note.fileUrl) ? (
            <iframe src={note.fileUrl} title={`Anteprima di ${note.title}`} className="h-80 w-full" />
          ) : (
            <img
              src={note.fileUrl}
              alt={`Anteprima di ${note.title}`}
              className="max-h-96 w-full object-contain"
            />
          )}
        </div>
        <a
          href={note.fileUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-2 inline-block text-xs font-semibold text-ink/55 underline underline-offset-2 hover:text-ink"
        >
          Apri il file originale in una nuova scheda
        </a>

        {error && (
          <p className="mt-4 rounded-2xl bg-copper/10 px-4 py-3 text-sm text-copper">{error}</p>
        )}

        {rejecting && (
          <div className="mt-5 rounded-2xl border border-copper/40 bg-copper/5 p-4">
            <span className="block text-xs font-semibold uppercase tracking-wider text-copper">
              Motivazione del rifiuto (obbligatoria)
            </span>
            <textarea
              autoFocus
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setReasonError('')
              }}
              placeholder="Es. Le pagine sono sfocate e non si legge la seconda metà…"
              className="mt-2 w-full resize-none rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-copper/40"
            />
            {reasonError && <p className="mt-1.5 text-xs font-semibold text-copper">{reasonError}</p>}
            <p className="mt-2 text-xs text-ink/55">{REJECTION_TTL_BANNER}</p>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={busy}
            onClick={onApprove}
            className="rounded-2xl bg-forest py-3.5 font-semibold text-paper transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? 'Un attimo…' : note.status === 'approved' ? 'Conferma approvazione' : 'Approva Appunto'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleRejectClick}
            className={`rounded-2xl py-3.5 font-semibold text-paper transition hover:opacity-90 disabled:opacity-60 ${
              rejecting ? 'bg-copper' : 'bg-copper/80'
            }`}
          >
            {busy ? 'Un attimo…' : rejecting ? 'Conferma rifiuto' : 'Rifiuta Appunto'}
          </button>
        </div>
        {rejecting && !busy && (
          <button
            type="button"
            onClick={() => {
              setRejecting(false)
              setReason('')
              setReasonError('')
            }}
            className="mt-3 w-full rounded-2xl border border-ink/15 py-2.5 text-sm font-semibold text-ink/70 transition hover:border-ink/40"
          >
            Annulla rifiuto
          </button>
        )}
      </div>
    </div>
  )
}
