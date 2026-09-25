import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthScreen from './components/AuthScreen'
import AppShell from './components/AppShell'
import Dashboard from './components/Dashboard'
import UploadPage from './components/UploadPage'
import ProfilePage from './components/ProfilePage'
import AdminPage from './components/AdminPage'

function AdminRoute() {
  const { profile } = useAuth()
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return <AdminPage />
}

function Gate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p className="font-display text-2xl text-ink/70">Apro il quaderno…</p>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminRoute />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Gate />
      </HashRouter>
    </AuthProvider>
  )
}
