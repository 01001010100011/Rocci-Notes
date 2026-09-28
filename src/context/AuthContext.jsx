import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'
import { ADMIN_EMAILS, ROLE_ADMIN, ROLE_HELPER, ROLE_USER, SUPER_ADMIN_EMAIL, normalizeRole } from '../constants'

const AuthContext = createContext(null)

function usernameFromUser(user) {
  if (user.displayName?.trim()) return user.displayName.trim()
  if (user.email) return user.email.split('@')[0]
  return 'Studente'
}

export async function ensureUserDocument(user, extras = {}) {
  const userRef = doc(db, 'users', user.uid)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(userRef)
    const username = extras.username || usernameFromUser(user)
    const role = ADMIN_EMAILS.includes(user.email) ? ROLE_ADMIN : ROLE_USER

    if (!snapshot.exists()) {
      transaction.set(userRef, {
        uid: user.uid,
        email: user.email ?? '',
        username,
        credits: 3,
        uploadsCount: 0,
        downloadsCount: 0,
        role,
        createdAt: serverTimestamp(),
      })
      return
    }

    const data = snapshot.data()
    // Utente bloccato: nessuna scrittura di manutenzione, così il login non
    // inciampa in update negati dalle regole e resta visibile la schermata di blocco.
    if (data.isBlocked === true) return

    const patch = {}
    if (extras.username && data.username !== extras.username) {
      patch.username = extras.username
    }
    if (role === 'admin' && data.role !== 'admin') {
      patch.role = 'admin'
    }
    if (typeof data.uploadsCount !== 'number') patch.uploadsCount = 0
    if (typeof data.downloadsCount !== 'number') patch.downloadsCount = 0
    if (Object.keys(patch).length > 0) {
      transaction.update(userRef, patch)
    }
  })
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let unsubscribeProfile = () => {}

    const unsubscribeAuth = onAuthStateChanged(auth, async (nextUser) => {
      unsubscribeProfile()
      setError('')

      if (!nextUser) {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      setUser(nextUser)
      setLoading(true)

      try {
        await ensureUserDocument(nextUser)
        unsubscribeProfile = onSnapshot(
          doc(db, 'users', nextUser.uid),
          (snap) => {
            setProfile(snap.exists() ? snap.data() : null)
            setLoading(false)
          },
          (err) => {
            setError(err.message)
            setLoading(false)
          },
        )
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    })

    return () => {
      unsubscribeAuth()
      unsubscribeProfile()
    }
  }, [])

  const role = user?.email === SUPER_ADMIN_EMAIL ? 'superadmin' : normalizeRole(profile?.role)

  const value = useMemo(
    () => ({
      user,
      profile,
      role,
      // Crediti infiniti e bypass spesa: solo admin e super admin.
      isAdmin: role === ROLE_ADMIN || role === 'superadmin',
      // Pannello approvazione appunti: admin, super admin e helper.
      canModerate: role === ROLE_ADMIN || role === 'superadmin' || role === ROLE_HELPER,
      isSuperAdmin: role === 'superadmin',
      isBlocked: profile?.isBlocked === true,
      loading,
      error,
      setError,
      registerWithEmail: async (email, password, username) => {
        const credential = await createUserWithEmailAndPassword(auth, email, password)
        const displayName = username.trim() || usernameFromUser(credential.user)
        await updateProfile(credential.user, { displayName })
        await ensureUserDocument(
          { ...credential.user, displayName, email },
          { username: displayName },
        )
      },
      loginWithEmail: async (email, password) => {
        const credential = await signInWithEmailAndPassword(auth, email, password)
        await ensureUserDocument(credential.user)
      },
      loginWithGoogle: async () => {
        const credential = await signInWithPopup(auth, googleProvider)
        await ensureUserDocument(credential.user)
      },
      resetPassword: async (email) => {
        await sendPasswordResetEmail(auth, email)
      },
      logout: () => signOut(auth),
    }),
    [user, profile, role, loading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider')
  }
  return context
}
