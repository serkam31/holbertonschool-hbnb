import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import PlaceDetailPage from './pages/PlaceDetailPage'
import CreatePlacePage from './pages/CreatePlacePage'
import EditPlacePage from './pages/EditPlacePage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}