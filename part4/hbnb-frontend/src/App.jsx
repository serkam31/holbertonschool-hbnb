import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import CookieBanner from './components/CookieBanner'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import PlaceDetailPage from './pages/PlaceDetailPage'
import CreatePlacePage from './pages/CreatePlacePage'
import EditPlacePage from './pages/EditPlacePage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import PrivacyPage from './pages/PrivacyPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/places/:id" element={<PlaceDetailPage />} />
            <Route
              path="/places/create"
              element={<ProtectedRoute><CreatePlacePage /></ProtectedRoute>}
            />
            <Route
              path="/places/:id/edit"
              element={<ProtectedRoute><EditPlacePage /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
            />
            <Route
              path="/admin"
              element={<ProtectedRoute><AdminPage /></ProtectedRoute>}
            />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
        </main>
        <CookieBanner />
        <footer className="site-footer">
          <p>© 2026 HBnB. All rights reserved.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '13px', opacity: 0.7 }}>
            <Link to="/privacy" style={{ color: 'inherit' }}>Politique de confidentialité</Link>
            {' · '}
            <a href="mailto:contact@hbnb.io" style={{ color: 'inherit' }}>Contact</a>
          </p>
        </footer>
      </AuthProvider>
    </BrowserRouter>
  )
}