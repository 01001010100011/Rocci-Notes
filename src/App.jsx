import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AuthScreen from './components/AuthScreen'
import AppShell from './components/AppShell'
import Dashboard from './components/Dashboard'
import UploadPage from './components/UploadPage'
import ProfilePage from './components/ProfilePage'
import AdminPage from './components/AdminPage'
import StatsPage from './components/StatsPage'
import NotFound from './components/NotFound'
import PrivacyPolicy from './components/PrivacyPolicy'
import Terms from './components/Terms'
import CookieBanner from './components/CookieBanner'

const PUBLIC_PATHS = ['/privacy', '/terms']

function AdminRoute() {
  const { profile } = useAuth()
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return <AdminPage />
}

function Gate() {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Le pagine legali sono pubbliche: visibili anche senza accesso.
  if (PUBLIC_PATHS.includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
    )
  }

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
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminRoute />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <CookieBanner />
        <Gate />
      </HashRouter>
    </AuthProvider>
  )
}
