import { useEffect, useState } from 'react'
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

export default function VoucherPanel() {
  const [vouchers, setVouchers] = useState([])
  const [code, setCode] = useState('')
  const [credits, setCredits] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'vouchers'), orderBy('createdAt', 'desc')),
        (snapshot) =>
          setVouchers(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
        () => {},
      ),
    [],
  )

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 4000)
    return () => window.clearTimeout(timer)
  }, [notice])

  async function handleCreate(event) {
    event.preventDefault()
    const normalized = code.trim().toUpperCase().replace(/\s+/g, '')
    const creditValue = Number(credits)
    const maxUsesValue = Number(maxUses)

    if (!normalized) {
      setError('Inserisci un codice voucher.')
      return
    }
    if (!Number.isInteger(creditValue) || creditValue <= 0) {
      setError('Il valore crediti deve essere un numero intero maggiore di zero.')
      return
    }
    if (!Number.isInteger(maxUsesValue) || maxUsesValue <= 0) {
      setError('Il limite utilizzi deve essere un numero intero maggiore di zero.')
      return
    }

    setBusy(true)
    setError('')
    setNotice('')
    try {
      const voucherRef = doc(db, 'vouchers', normalized)
      if ((await getDoc(voucherRef)).exists()) {
        setError('Esiste già un voucher con questo codice.')
        return
      }
      await setDoc(voucherRef, {
        code: normalized,
        credits: creditValue,
        maxUses: maxUsesValue,
        usedCount: 0,
        usedBy: [],
        createdAt: serverTimestamp(),
      })
      setCode('')
      setCredits('')
      setMaxUses('')
      setNotice(`Voucher ${normalized} creato: +${creditValue} crediti per ${maxUsesValue} utenti.`)
    } catch (err) {
      setError(err.message || 'Creazione del voucher non riuscita.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form
        onSubmit={handleCreate}
        className="h-fit rounded-[28px] border border-ink/10 bg-paper/85 p-5 shadow-soft sm:p-6"
      >
        <h3 className="font-display text-2xl text-ink">Crea un voucher</h3>
        <p className="mt-2 text-sm text-ink/60">
          Il codice viene salvato in maiuscolo e senza spazi.
        </p>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/55">
            Codice voucher
          </span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Es. ROCCI2026"
            autoComplete="off"
            className="w-full rounded-2xl border border-ink/10 bg-white/60 px-4 py-2.5 text-sm uppercase outline-none focus:ring-2 focus:ring-copper/40"
          />
        </label>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/55">
              Valore crediti
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="5"
              className="w-full rounded-2xl border border-ink/10 bg-white/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-copper/40"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/55">
              Limite utilizzi max
            </span>
            <input
              type="number"
              min="1"
              step="1"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="5"
              className="w-full rounded-2xl border border-ink/10 bg-white/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-copper/40"
            />
          </label>
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-copper">{error}</p>}
        {notice && <p className="mt-3 text-sm font-semibold text-forest">{notice}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-2xl bg-forest py-3 text-sm font-semibold text-paper transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? 'Creo…' : 'Crea voucher'}
        </button>
      </form>

      <div className="rounded-[28px] border border-ink/10 bg-paper/85 p-5 shadow-soft sm:p-6">
        <h3 className="font-display text-2xl text-ink">Voucher attivi</h3>
        {vouchers.length === 0 ? (
          <p className="mt-4 text-sm text-ink/60">Nessun voucher creato finora.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {vouchers.map((voucher) => {
              const exhausted = (voucher.usedCount ?? 0) >= (voucher.maxUses ?? 0)
              return (
                <li
                  key={voucher.id}
                  className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-paper/70 px-4 py-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-lg text-ink">
                      {voucher.code}
                    </span>
                    <span className="block text-xs font-semibold text-copper">
                      +{voucher.credits} crediti
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      exhausted ? 'bg-ink/10 text-ink/50' : 'bg-forest/12 text-forest'
                    }`}
                  >
                    Utilizzati: {voucher.usedCount ?? 0} / {voucher.maxUses ?? 0}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
