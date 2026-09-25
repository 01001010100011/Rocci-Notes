# Rocci Notes

Piattaforma scolastica di scambio appunti a crediti. React (Vite) + Tailwind CSS, autenticazione Firebase e upload su Cloudinary.

## Avvio

```bash
npm install
cp .env.example .env
npm run dev
```

## Firebase

1. Crea un progetto su [Firebase Console](https://console.firebase.google.com/).
2. Abilita **Authentication**: Email/Password e Google.
3. Crea un database **Cloud Firestore**.
4. Copia le chiavi web in `.env` (o nei segnaposto di `src/firebase.js`).

Collezioni usate:

- `users/{uid}` — profilo (`uid`, `email`, `username`, `credits`, `createdAt`)
- `notes` — appunti in bacheca
- `users/{uid}/unlocks/{noteId}` — sblocchi pagati con crediti

Al primo accesso (email o Google) viene creato automaticamente il documento utente con **3 crediti** di benvenuto.

## Cloudinary

Imposta in `.env`:

- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET` (preset **unsigned** per l’upload dal browser)
