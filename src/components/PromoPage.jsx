import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toPng } from 'html-to-image'
import useDocumentTitle from '../useDocumentTitle'

const INK = '#1a1612'
const PAPER = '#f3ead8'
const COPPER = '#b4532a'
const FOREST = '#2d4a3e'

const W16 = 1920
const H16 = 1080
const W9 = 1080
const H9 = 1920

// Riduce il banner alla larghezza disponibile senza toccare le sue dimensioni
// reali: l'export cattura il nodo alla risoluzione nativa, non quella scalata.
function ScaledPreview({ width, height, children }) {
  const boxRef = useRef(null)
  const [scale, setScale] = useState(0.28)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return undefined
    const update = () => setScale(Math.min(1, el.clientWidth / width))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])

  return (
    <div ref={boxRef} className="w-full">
      <div style={{ width: width * scale, height: height * scale, margin: '0 auto' }}>
        <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function GridOverlay() {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          'linear-gradient(rgba(26,22,18,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(26,22,18,0.045) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
      }}
    />
  )
}

function NoteCard({ subject, title, professor, rotate, className = '' }) {
  return (
    <div
      className={`absolute rounded-[36px] border border-white/70 bg-white/55 p-10 shadow-[0_30px_70px_-30px_rgba(26,22,18,0.55)] backdrop-blur-2xl ${className}`}
      style={{ width: 440, transform: `rotate(${rotate}deg)` }}
    >
      <span
        className="inline-block rounded-full px-5 py-2 text-[18px] font-bold uppercase tracking-[0.14em] text-white"
        style={{ background: FOREST }}
      >
        {subject}
      </span>
      <p className="mt-6 font-display text-[38px] leading-tight" style={{ color: INK }}>
        {title}
      </p>
      <div className="mt-6 space-y-3">
        <span className="block h-3 w-full rounded-full" style={{ background: 'rgba(26,22,18,0.12)' }} />
        <span className="block h-3 w-4/5 rounded-full" style={{ background: 'rgba(26,22,18,0.10)' }} />
        <span className="block h-3 w-2/3 rounded-full" style={{ background: 'rgba(26,22,18,0.08)' }} />
      </div>
      <div className="mt-8 flex items-center justify-between">
        <span
          className="rounded-full px-5 py-2 text-[17px] font-bold uppercase tracking-wide text-white"
          style={{ background: COPPER }}
        >
          {professor}
        </span>
        <span className="text-[17px] font-semibold" style={{ color: 'rgba(26,22,18,0.5)' }}>
          📄 PDF
        </span>
      </div>
    </div>
  )
}

function Badge16({ emoji, children }) {
  return (
    <div className="flex items-center gap-5 rounded-full border border-white/70 bg-white/50 px-8 py-5 backdrop-blur-xl">
      <span className="text-[40px] leading-none">{emoji}</span>
      <span className="text-[27px] font-semibold" style={{ color: INK }}>
        {children}
      </span>
    </div>
  )
}

function Banner16x9({ innerRef }) {
  return (
    <div
      ref={innerRef}
      className="relative overflow-hidden font-sans"
      style={{
        width: W16,
        height: H16,
        background:
          'radial-gradient(circle at 10% 15%, rgba(180,83,42,0.22), transparent 42%), radial-gradient(circle at 90% 85%, rgba(45,74,62,0.22), transparent 42%), linear-gradient(135deg, #f6efdf 0%, #e4d6bc 100%)',
      }}
    >
      <GridOverlay />
      <div
        className="absolute -left-40 top-24 h-[520px] w-[520px] rounded-full backdrop-blur-3xl"
        style={{ background: 'rgba(255,255,255,0.28)' }}
      />
      <div
        className="absolute -right-24 bottom-0 h-[420px] w-[420px] rounded-full backdrop-blur-3xl"
        style={{ background: 'rgba(255,255,255,0.22)' }}
      />

      <div className="relative z-10 flex h-full items-center gap-16 px-28">
        <div className="flex w-[1000px] shrink-0 flex-col">
          <div className="flex items-center gap-6">
            <span className="text-[86px] leading-none">📝</span>
            <span className="font-display text-[74px] leading-none" style={{ color: INK }}>
              Rocci Notes
            </span>
          </div>

          <h1
            className="mt-10 font-display text-[82px] leading-[1.04]"
            style={{ color: INK }}
          >
            La Piattaforma per lo{' '}
            <span style={{ color: COPPER }}>Scambio Appunti</span> Scolastici
          </h1>

          <div className="mt-12 flex flex-col gap-5">
            <Badge16 emoji="🎁">3 Crediti GRATIS all’iscrizione</Badge16>
            <Badge16 emoji="🔍">Filtro per Materia e Professore</Badge16>
            <Badge16 emoji="🔒">Watermark Anti-Pirateria</Badge16>
          </div>

          <div
            className="mt-12 inline-flex w-fit items-center gap-4 rounded-full px-12 py-6 text-[42px] font-bold text-white"
            style={{ background: INK }}
          >
            <span>🌐</span> roccinotes.com
          </div>
        </div>

        <div className="relative h-full flex-1">
          <NoteCard
            subject="Fisica"
            title="Lavoro ed Energia Meccanica"
            professor="Prof. Rinaldi"
            rotate={-7}
            className="left-4 top-24"
          />
          <NoteCard
            subject="Latino"
            title="Versioni e Sintassi"
            professor="Prof.ssa Sale"
            rotate={6}
            className="left-40 top-[420px]"
          />
        </div>
      </div>
    </div>
  )
}

function FeatureRow({ emoji, title, subtitle }) {
  return (
    <div className="flex items-center gap-6 rounded-[28px] border border-white/70 bg-white/50 px-8 py-7 backdrop-blur-xl">
      <span
        className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-2xl text-[38px]"
        style={{ background: 'rgba(45,74,62,0.14)' }}
      >
        {emoji}
      </span>
      <div>
        <p className="font-display text-[36px] leading-tight" style={{ color: INK }}>
          {title}
        </p>
        <p className="mt-1 text-[24px]" style={{ color: 'rgba(26,22,18,0.6)' }}>
          {subtitle}
        </p>
      </div>
    </div>
  )
}

function Banner9x16({ innerRef }) {
  return (
    <div
      ref={innerRef}
      className="relative flex flex-col overflow-hidden px-16 py-20 font-sans"
      style={{
        width: W9,
        height: H9,
        background:
          'radial-gradient(circle at 15% 8%, rgba(180,83,42,0.28), transparent 45%), radial-gradient(circle at 85% 92%, rgba(45,74,62,0.28), transparent 45%), linear-gradient(160deg, #f6efdf 0%, #e2d3b6 100%)',
      }}
    >
      <GridOverlay />
      <div
        className="absolute -right-32 top-40 h-[420px] w-[420px] rounded-full backdrop-blur-3xl"
        style={{ background: 'rgba(255,255,255,0.3)' }}
      />
      <div
        className="absolute -left-28 bottom-72 h-[380px] w-[380px] rounded-full backdrop-blur-3xl"
        style={{ background: 'rgba(255,255,255,0.24)' }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-center gap-4">
          <span className="text-[70px] leading-none">📝</span>
          <span className="font-display text-[58px] leading-none" style={{ color: INK }}>
            Rocci Notes
          </span>
        </div>

        <div className="mt-16 text-center">
          <h1 className="font-display text-[86px] leading-[1.03]" style={{ color: INK }}>
            Cerchi appunti della{' '}
            <span style={{ color: COPPER }}>tua scuola</span>?
          </h1>
          <p className="mx-auto mt-8 max-w-[820px] text-[38px] leading-snug" style={{ color: 'rgba(26,22,18,0.7)' }}>
            Smetti di chiedere nei gruppi di classe. Trova tutto in un click!
          </p>
        </div>

        <div className="mt-16 flex flex-col gap-6">
          <FeatureRow emoji="🎁" title="3 crediti gratis" subtitle="Subito per te quando ti iscrivi" />
          <FeatureRow emoji="🔍" title="Cerca per professore" subtitle="Filtra per materia e docente" />
          <FeatureRow emoji="⬆️" title="Carica & guadagna" subtitle="+1 credito per ogni appunto approvato" />
        </div>

        <div className="mt-auto">
          <div
            className="rounded-[40px] px-10 py-14 text-center"
            style={{ background: INK }}
          >
            <p className="font-display text-[62px] leading-none text-white">ISCRIVITI SUBITO</p>
            <p className="mt-6 text-[54px] font-bold" style={{ color: PAPER }}>
              🌐 roccinotes.com
            </p>
          </div>
          <p className="mt-8 text-center text-[26px]" style={{ color: 'rgba(26,22,18,0.55)' }}>
            Fatto per gli studenti, dagli studenti.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PromoPage() {
  useDocumentTitle('Grafiche promo')
  const banner16Ref = useRef(null)
  const banner9Ref = useRef(null)
  const [busy, setBusy] = useState('')

  async function exportPng(node, width, height, filename, key) {
    if (!node) return
    setBusy(key)
    try {
      if (document.fonts?.ready) await document.fonts.ready
      const dataUrl = await toPng(node, {
        width,
        height,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: PAPER,
      })
      const anchor = document.createElement('a')
      anchor.href = dataUrl
      anchor.download = filename
      anchor.click()
    } catch (err) {
      window.alert('Esportazione non riuscita: ' + (err.message || err))
    } finally {
      setBusy('')
    }
  }

  return (
    <div className="min-h-dvh px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-copper underline-offset-2 hover:underline"
        >
          <span aria-hidden="true">←</span> Torna alla bacheca
        </Link>

        <header className="mt-6">
          <p className="flex items-center gap-2 font-display text-2xl text-ink">
            <span aria-hidden="true">📝</span> Rocci Notes
          </p>
          <h1 className="mt-3 font-display text-4xl text-ink">Grafiche promozionali</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink/65">
            Due layout pronti all’uso con il branding ufficiale. L’anteprima qui sotto è rimpicciolita,
            ma il download esporta alla risoluzione reale (2× per la massima nitidezza): 3840×2160 per
            il 16:9 e 2160×3840 per il 9:16.
          </p>
        </header>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-ink">Banner orizzontale 16:9</h2>
            <button
              type="button"
              disabled={busy === '16'}
              onClick={() =>
                exportPng(banner16Ref.current, W16, H16, 'rocci-notes-banner-16x9.png', '16')
              }
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:bg-forest disabled:opacity-60"
            >
              {busy === '16' ? 'Genero il PNG…' : 'Download PNG 16:9'}
            </button>
          </div>
          <div className="mt-4 overflow-hidden rounded-3xl border border-ink/10 shadow-soft">
            <ScaledPreview width={W16} height={H16}>
              <Banner16x9 innerRef={banner16Ref} />
            </ScaledPreview>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-ink">Banner verticale 9:16 (Storie)</h2>
            <button
              type="button"
              disabled={busy === '9'}
              onClick={() =>
                exportPng(banner9Ref.current, W9, H9, 'rocci-notes-storia-9x16.png', '9')
              }
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:bg-forest disabled:opacity-60"
            >
              {busy === '9' ? 'Genero il PNG…' : 'Download PNG 9:16'}
            </button>
          </div>
          <div className="mt-4 overflow-hidden rounded-3xl border border-ink/10 shadow-soft">
            <ScaledPreview width={W9} height={H9}>
              <Banner9x16 innerRef={banner9Ref} />
            </ScaledPreview>
          </div>
        </section>
      </div>
    </div>
  )
}
