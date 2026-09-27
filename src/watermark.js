import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

// Il timbro antipirateria viene applicato lato client: il link diretto al file
// originale non viene mai esposto nell'interfaccia, il recupero avviene via fetch.

export function isPdfUrl(url = '') {
  return /\.pdf(\?|#|$)/i.test(url)
}

function currentDate() {
  return new Date().toLocaleDateString('it-IT')
}

function buildStamp(username, email) {
  return `Copia ad uso personale di: ${username} (${email}) | Data: ${currentDate()} | Rocci Notes - Diffusione vietata`
}

function sanitizeFilename(title, ext) {
  const base =
    (title || 'appunto')
      .toString()
      .trim()
      .replace(/[^\w\d\- ]+/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 60) || 'appunto'
  return `${base}.${ext}`
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 4000)
}

async function fetchArrayBuffer(fileUrl) {
  const response = await fetch(fileUrl, { mode: 'cors' })
  if (!response.ok) {
    throw new Error('Impossibile recuperare il file originale.')
  }
  return response.arrayBuffer()
}

async function watermarkPdf(fileUrl, { title, username, email }) {
  const arrayBuffer = await fetchArrayBuffer(fileUrl)
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const stamp = buildStamp(username, email)

  for (const page of pdfDoc.getPages()) {
    const { width } = page.getSize()
    let size = 8
    const maxWidth = width - 24
    while (size > 5 && font.widthOfTextAtSize(stamp, size) > maxWidth) {
      size -= 0.5
    }
    const textWidth = font.widthOfTextAtSize(stamp, size)
    page.drawText(stamp, {
      x: Math.max(12, (width - textWidth) / 2),
      y: 16,
      size,
      font,
      color: rgb(0.45, 0.1, 0.1),
    })
  }

  const bytes = await pdfDoc.save()
  triggerDownload(new Blob([bytes], { type: 'application/pdf' }), sanitizeFilename(title, 'pdf'))
}

function loadImage(fileUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Impossibile caricare l’immagine originale.'))
    image.src = fileUrl
  })
}

function fitFont(ctx, lines, startSize, maxWidth, family) {
  let size = startSize
  while (size > 6) {
    ctx.font = `${size}px ${family}`
    const widest = Math.max(...lines.map((line) => ctx.measureText(line).width))
    if (widest <= maxWidth) break
    size -= 1
  }
  ctx.font = `${size}px ${family}`
  return size
}

async function watermarkImage(fileUrl, { title, username, email }) {
  const image = await loadImage(fileUrl)
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth || image.width
  canvas.height = image.naturalHeight || image.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)

  const line1 = `Copia ad uso personale di: ${username} (${email})`
  const line2 = `Data: ${currentDate()} | Rocci Notes - Diffusione vietata`
  const lines = [line1, line2]

  const bandHeight = Math.max(40, Math.round(canvas.height * 0.08))
  const bandTop = canvas.height - bandHeight
  ctx.fillStyle = 'rgba(20, 12, 8, 0.62)'
  ctx.fillRect(0, bandTop, canvas.width, bandHeight)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
  const family = 'Helvetica, Arial, sans-serif'
  fitFont(ctx, lines, Math.round(bandHeight / 3), canvas.width - 16, family)
  ctx.fillText(line1, canvas.width / 2, bandTop + bandHeight * 0.34)
  ctx.fillText(line2, canvas.width / 2, bandTop + bandHeight * 0.7)

  const isPng = /\.png(\?|#|$)/i.test(fileUrl)
  const mime = isPng ? 'image/png' : 'image/jpeg'
  const ext = isPng ? 'png' : 'jpg'
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('Generazione dell’immagine non riuscita.'))),
      mime,
      0.92,
    )
  })
  triggerDownload(blob, sanitizeFilename(title, ext))
}

export async function downloadWatermarked(fileUrl, { title, username, email }) {
  if (!fileUrl) {
    throw new Error('File non disponibile.')
  }
  if (isPdfUrl(fileUrl)) {
    await watermarkPdf(fileUrl, { title, username, email })
  } else {
    await watermarkImage(fileUrl, { title, username, email })
  }
}
