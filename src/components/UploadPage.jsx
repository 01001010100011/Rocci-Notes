import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { uploadToCloudinary } from '../cloudinary'
import { useAuth } from '../context/AuthContext'
import {
  FILE_TOO_LARGE_MESSAGE,
  MAX_FILE_SIZE_BYTES,
  PROFESSORI,
  REQUIRED_FIELDS_MESSAGE,
  SUBJECTS,
  UPLOAD_SUCCESS_MESSAGE,
} from '../constants'

function isSupportedFile(file) {
  return file.type === 'application/pdf' || file.type.startsWith('image/')
}

export default function UploadPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [professor, setProfessor] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const canSubmit =
    title.trim().length > 0 && Boolean(subject) && Boolean(professor) && Boolean(file)

  function handleFileChange(event) {
    const nextFile = event.target.files?.[0] ?? null
    if (nextFile && nextFile.size > MAX_FILE_SIZE_BYTES) {
      event.target.value = ''
      setFile(null)
      setError(FILE_TOO_LARGE_MESSAGE)
      return
    }
    if (nextFile && !isSupportedFile(nextFile)) {
      event.target.value = ''
      setFile(null)
      setError('Puoi caricare solo file PDF o immagini.')
      return
    }
    setError('')
    setFile(nextFile)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!file) {
      setError('Seleziona un PDF o un’immagine.')
      return
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(FILE_TOO_LARGE_MESSAGE)
      return
    }
    if (!isSupportedFile(file)) {
      setError('Puoi caricare solo file PDF o immagini.')
      return
    }
    if (!title.trim()) {
      setError('Inserisci un titolo per gli appunti.')
      return
    }
    if (!subject) {
      setError('Scegli una materia dal menu.')
      return
    }
    if (!professor) {
      setError('Seleziona il professore dal menu.')
      return
    }
    if (!title.trim() || !subject || !professor || !file) {
      setError(REQUIRED_FIELDS_MESSAGE)
      return
    }

    setBusy(true)
    setError('')
    try {
      const uploaded = await uploadToCloudinary(file)
      const fileUrl = uploaded.secure_url
      if (!fileUrl) {
        throw new Error('Cloudinary non ha restituito il link del file.')
      }

      await addDoc(collection(db, 'notes'), {
        title: title.trim(),
        subject,
        professor,
        description: description.trim(),
        fileUrl,
        authorId: user.uid,
        authorName: profile?.username || user.email?.split('@')[0] || 'Studente',
        createdAt: serverTimestamp(),
        downloadsCount: 0,
        status: 'pending',
      })

      navigate('/', { state: { notice: UPLOAD_SUCCESS_MESSAGE } })
    } catch (err) {
      setError(err.message || 'Caricamento non riuscito.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto mt-8 w-full max-w-xl">
      <p className="text-sm text-ink/60">
        Carica un PDF o una foto del quaderno. Guadagni 1 credito a pubblicazione.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-[28px] border border-ink/10 bg-paper/85 p-5 shadow-soft sm:p-8"
      >
        <h2 className="font-display text-3xl text-ink">Nuovi appunti</h2>

        <label className="mt-6 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/55">
            Titolo
          </span>
          <input
            required
            className="w-full rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 outline-none focus:ring-2 focus:ring-copper/40"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Es. Verifica di analisi"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/55">
            Materia
          </span>
          <select
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 outline-none focus:ring-2 focus:ring-copper/40"
          >
            <option value="" disabled>
              Seleziona una materia
            </option>
            {SUBJECTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/55">
            Professore
          </span>
          <select
            required
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 outline-none focus:ring-2 focus:ring-copper/40"
          >
            <option value="" disabled>
              Seleziona un professore
            </option>
            {PROFESSORI.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/55">
            Descrizione breve
          </span>
          <textarea
            rows={3}
            className="w-full resize-none rounded-2xl border border-ink/10 bg-white/60 px-4 py-3 outline-none focus:ring-2 focus:ring-copper/40"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Argomenti, data della lezione, pagine del libro…"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/55">
            File (PDF o immagini, max 10 MB)
          </span>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFileChange}
            className="w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-paper"
          />
          {file && (
            <p className="mt-2 text-xs text-ink/50">
              {file.name} · {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          )}
        </label>

        {error && (
          <p className="mt-4 rounded-2xl bg-copper/10 px-4 py-3 text-sm text-copper">{error}</p>
        )}

        {!canSubmit && !error && (
          <p className="mt-4 rounded-2xl bg-ink/5 px-4 py-3 text-sm text-ink/55">
            {REQUIRED_FIELDS_MESSAGE}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !canSubmit}
          className="mt-6 w-full rounded-2xl bg-copper py-3.5 font-semibold text-paper disabled:opacity-60"
        >
          {busy ? 'Caricamento…' : 'Pubblica in bacheca'}
        </button>
      </form>
    </main>
  )
}
