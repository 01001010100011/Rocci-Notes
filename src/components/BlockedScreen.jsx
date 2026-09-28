import { ACCOUNT_SUSPENDED_MESSAGE, ACCOUNT_SUSPENDED_TITLE } from '../constants'
import { useAuth } from '../context/AuthContext'

export default function BlockedScreen() {
  const { logout } = useAuth()

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-lg rounded-[28px] border border-copper/40 bg-paper/90 p-6 text-center shadow-lift sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-copper/15 text-3xl">
          ⚠️
        </span>
        <h1 className="mt-5 font-display text-3xl text-ink">{ACCOUNT_SUSPENDED_TITLE}</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/70">{ACCOUNT_SUSPENDED_MESSAGE}</p>
        <a
          href="mailto:roccinotes@gmail.com"
          className="mt-4 inline-block text-sm font-semibold text-copper underline underline-offset-2 hover:opacity-80"
        >
          roccinotes@gmail.com
        </a>
        <button
          type="button"
          onClick={logout}
          className="mt-8 w-full rounded-2xl bg-ink py-3.5 font-semibold text-paper transition hover:opacity-90"
        >
          Esci
        </button>
      </div>
    </div>
  )
}
