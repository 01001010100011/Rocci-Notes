import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthScreen() {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, error, setError } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState('')

  const isRegister = mode === 'register'
  const message = localError || error

  async function handleSubmit(event) {
    event.preventDefault()
    setLocalError('')
    setError('')
    setBusy(true)

    try {
      if (isRegister) {
        await registerWithEmail(email.trim(), password, username)
      } else {
        await loginWithEmail(email.trim(), password)
      }
    } catch (err) {
      setLocalError(mapAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setLocalError('')
    setError('')
    setBusy(true)
    try {
      await loginWithGoogle()
    } catch (err) {
      setLocalError(mapAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-10 sm:px-6 sm:py-16 lg:px-10">
      <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-copper/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-forest/20 blur-3xl" />

      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <header className="max-w-xl">
          <p className="stamp mb-4 inline-block rotate-[-2deg] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-forest">
            Scuola · Scambio appunti
          </p>
          <h1 className="font-display text-5xl leading-[0.95] text-ink sm:text-6xl lg:text-7xl">
            Rocci Notes
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink/75 sm:text-lg">
            Carica i tuoi quaderni, sblocca quelli dei compagni. Tre crediti di benvenuto
            per iniziare lo scambio.
          </p>
          <ul className="mt-8 grid grid-cols-3 gap-3 text-center sm:max-w-md">
            {[
              ['3', 'crediti gratis'],
              ['+1', 'per ogni upload'],
              ['−1', 'per ogni download'],
            ].map(([value, label]) => (
              <li
                key={label}
                className="rounded-2xl border border-ink/10 bg-paper-2/70 px-2 py-4 shadow-soft"
              >
                <span className="font-display text-2xl text-copper sm:text-3xl">{value}</span>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-ink/60">{label}</p>
              </li>
            ))}
          </ul>
        </header>

        <section className="relative rounded-[28px] border border-ink/10 bg-paper/90 p-5 shadow-lift backdrop-blur-sm sm:p-8">
          <div className="mb-6 flex rounded-full bg-ink/5 p-1">
            <button
              type="button"
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
                !isRegister ? 'bg-ink text-paper' : 'text-ink/60'
              }`}
              onClick={() => setMode('login')}
            >
              Accedi
            </button>
            <button
              type="button"
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
                isRegister ? 'bg-ink text-paper' : 'text-ink/60'
              }`}
              onClick={() => setMode('register')}
            >
              Registrati
            </button>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {isRegister && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/55">
                  Username
                </span>
                <input
                  className="w-full rounded-2xl border border-ink/10 bg-white/50 px-4 py-3 outline-none ring-copper/40 transition focus:ring-2"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Come ti chiamano in classe"
                  autoComplete="nickname"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/55">
                Email
              </span>
              <input
                className="w-full rounded-2xl border border-ink/10 bg-white/50 px-4 py-3 outline-none ring-copper/40 transition focus:ring-2"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ivan.p@example.net"
                autoComplete="email"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/55">
                Password
              </span>
              <input
                className="w-full rounded-2xl border border-ink/10 bg-white/50 px-4 py-3 outline-none ring-copper/40 transition focus:ring-2"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Almeno 6 caratteri"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </label>

            {message && (
              <p className="rounded-2xl bg-copper/10 px-4 py-3 text-sm text-copper">{message}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 rounded-2xl bg-ink py-3.5 font-semibold text-paper transition hover:bg-forest disabled:opacity-60"
            >
              {busy ? 'Un attimo…' : isRegister ? 'Crea account' : 'Entra'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-ink/40">
            <span className="h-px flex-1 bg-ink/15" />
            oppure
            <span className="h-px flex-1 bg-ink/15" />
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={handleGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-ink/15 bg-white/70 py-3.5 font-semibold text-ink transition hover:border-ink/30 disabled:opacity-60"
          >
            <GoogleMark />
            Accedi con Google
          </button>
        </section>
      </div>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71A5.41 5.41 0 0 1 3.69 9c0-.6.1-1.17.26-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.46.35 2.84.96 4.04l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}

function mapAuthError(err) {
  const code = err?.code || ''
  if (code.includes('invalid-credential') || code.includes('wrong-password')) {
    return 'Email o password non corretti.'
  }
  if (code.includes('email-already-in-use')) {
    return 'Questa email è già registrata. Prova ad accedere.'
  }
  if (code.includes('weak-password')) {
    return 'La password è troppo corta (minimo 6 caratteri).'
  }
  if (code.includes('popup-closed')) {
    return 'Accesso Google annullato.'
  }
  if (code.includes('invalid-api-key') || code.includes('configuration-not-found')) {
    return 'Firebase non è ancora configurato. Inserisci le chiavi in src/firebase.js o nel file .env.'
  }
  return err?.message || 'Qualcosa è andato storto.'
}
