import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'


export default function Navbar() {
  const { currentUser, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo logo">HBn<span>B</span></Link>

        <div className="navbar-links">
          {currentUser ? (
            <>
              <Link to="/places/create" className="navbar-link">
                + Ajouter une place
              </Link>
              {isAdmin && (
                <Link to="/admin" className="navbar-link" style={{ color: 'var(--green)', fontWeight: '600' }}>
                  ⚙ Admin
                </Link>
              )}
              <button className="navbar-user" onClick={() => navigate('/profile')} aria-label="Voir mon profil">
                <span className="navbar-username">{currentUser.first_name}</span>
                <div className="navbar-avatar" aria-hidden="true">
                  {currentUser.first_name?.[0]}{currentUser.last_name?.[0]}
                </div>
              </button>
              <button onClick={handleLogout} className="btn btn-outline btn-sm login-button">
                Déconnexion
              </button>
            </>
          ) : (
            <Link to="/login" id="login-link" className="btn btn-primary btn-sm login-button">
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}