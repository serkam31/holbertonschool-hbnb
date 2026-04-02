import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">HBn<span>B</span></Link>

        <div className="navbar-links">
          {currentUser ? (
            <>
              <Link to="/places/create" className="navbar-link">
                + Ajouter une place
              </Link>
              <div className="navbar-user" onClick={() => navigate('/profile')}>
                <span className="navbar-username">{currentUser.first_name}</span>
                <div className="navbar-avatar">
                  {currentUser.first_name?.[0]}{currentUser.last_name?.[0]}
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Déconnexion
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}