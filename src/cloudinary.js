export const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME'

export const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'YOUR_UPLOAD_PRESET'

const isConfigured = () =>
  CLOUDINARY_CLOUD_NAME &&
  CLOUDINARY_CLOUD_NAME !== 'YOUR_CLOUD_NAME' &&
  CLOUDINARY_UPLOAD_PRESET &&
  CLOUDINARY_UPLOAD_PRESET !== 'YOUR_UPLOAD_PRESET'

export async function uploadToCloudinary(file) {
  if (!isConfigured()) {
    throw new Error(
      'Cloudinary non è configurato. Imposta VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET.',
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: 'POST', body: formData },
  )

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      payload?.error?.message || 'Caricamento su Cloudinary non riuscito.',
    )
  }

  return payload
}
