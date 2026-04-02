import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateUser, deleteUser } from '../api/client'

export default function ProfilePage() {
  const { currentUser, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState(currentUser?.first_name ?? '')
  const [lastName, setLastName] = useState(currentUser?.last_name ?? '')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleDeleteAccount() {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.')) return
    try {
      await deleteUser(currentUser.id)
      logout()
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSuccess('')
    setError('')
    setLoading(true)
    try {
      await updateUser(currentUser.id, { first_name: firstName, last_name: lastName })
      setSuccess('Profil mis à jour avec succès !')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: '640px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '2rem' }}>Mon profil</h1>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="avatar avatar-lg" aria-label={`Avatar de ${currentUser?.first_name} ${currentUser?.last_name}`}>
            <span aria-hidden="true">{currentUser?.first_name?.[0]}{currentUser?.last_name?.[0]}</span>
          </div>
          <div>
            <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--black)', marginBottom: '4px' }}>
              {currentUser?.first_name} {currentUser?.last_name}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--gray)', marginBottom: '6px' }}>
              {currentUser?.email}
            </p>
            {isAdmin && <span className="badge badge-red">Administrateur</span>}
          </div>
        </div>

        <hr className="divider" />

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="profile-firstname" className="form-label">Prénom</label>
              <input id="profile-firstname" className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="profile-lastname" className="form-label">Nom</label>
              <input id="profile-lastname" className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="profile-email" className="form-label">
              Email <span className="form-locked">non modifiable</span>
            </label>
            <input id="profile-email" className="form-input" value={currentUser?.email} disabled />
          </div>

          <div className="form-group">
            <label htmlFor="profile-password" className="form-label">
              Mot de passe <span className="form-locked">non modifiable</span>
            </label>
            <input id="profile-password" className="form-input" type="password" value="••••••••" disabled />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Mise à jour...' : 'Mettre à jour'}
          </button>
        </form>

        <hr className="divider" style={{ marginTop: '2rem' }} />

        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--black)', marginBottom: '0.5rem' }}>
            Zone de danger
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--gray)', marginBottom: '1rem' }}>
            La suppression de votre compte est définitive. Toutes vos données (annonces, avis) seront effacées.
          </p>
          <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount}>
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  )
}