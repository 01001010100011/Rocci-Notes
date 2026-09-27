import {
  doc,
  getDoc,
  increment,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { INSUFFICIENT_CREDITS_MESSAGE } from './constants'
import { buildWatermarkedFile, saveWatermarkedFile } from './watermark'

// Acquista (se serve) e scarica un appunto con watermark. Solleva Error con un
// messaggio già in italiano; il chiamante decide se mostrarlo come alert o banner.
export async function downloadNote({ note, userId, isAdmin, credits, username, email }) {
  const downloadRef = doc(db, 'users', userId, 'downloads', note.id)
  const alreadyDownloaded = (await getDoc(downloadRef)).exists()

  if (!alreadyDownloaded && !isAdmin && credits < 1) {
    throw new Error(INSUFFICIENT_CREDITS_MESSAGE)
  }

  // Il file viene preparato PRIMA dell'addebito: se il PDF è danneggiato, la rete
  // cade o il watermark fallisce, l'utente non perde alcun credito.
  const file = await buildWatermarkedFile(note.fileUrl, { title: note.title, username, email })

  if (!alreadyDownloaded) {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', userId)
      const noteRef = doc(db, 'notes', note.id)
      const userSnapshot = await transaction.get(userRef)
      const downloadSnapshot = await transaction.get(downloadRef)

      // Già acquistato tra il controllo e la transazione: niente addebito.
      if (downloadSnapshot.exists()) return

      if (!userSnapshot.exists()) {
        throw new Error(INSUFFICIENT_CREDITS_MESSAGE)
      }
      if (!isAdmin && (userSnapshot.data().credits ?? 0) < 1) {
        throw new Error(INSUFFICIENT_CREDITS_MESSAGE)
      }

      transaction.update(
        userRef,
        isAdmin
          ? { downloadsCount: increment(1) }
          : { credits: increment(-1), downloadsCount: increment(1) },
      )
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

  saveWatermarkedFile(file)
  return { charged: !alreadyDownloaded }
}
