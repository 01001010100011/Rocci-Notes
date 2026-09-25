import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'
import { ADMIN_EMAILS } from '../constants'

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
    const role = ADMIN_EMAILS.includes(user.email) ? 'admin' : 'student'

    if (!snapshot.exists()) {
      transaction.set(userRef, {
        uid: user.uid,
        email: user.email ?? '',
        username,
        credits: 3,
        role,
        createdAt: serverTimestamp(),
      })
      return
    }

    const patch = {}
    if (extras.username && snapshot.data().username !== extras.username) {
      patch.username = extras.username
    }
    if (role === 'admin' && snapshot.data().role !== 'admin') {
      patch.role = 'admin'
    }
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

  const value = useMemo(
    () => ({
      user,
      profile,
      isAdmin: profile?.role === 'admin',
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
      logout: () => signOut(auth),
    }),
    [user, profile, loading, error],
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
