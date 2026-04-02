import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateUser } from '../api/client'

export default function ProfilePage() {
  const { currentUser, isAdmin } = useAuth()
  const [firstName, setFirstName] = useState(currentUser?.first_name ?? '')
  const [lastName, setLastName] = useState(currentUser?.last_name ?? '')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
          <div className="avatar avatar-lg">
            {currentUser?.first_name?.[0]}{currentUser?.last_name?.[0]}
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
              <label className="form-label">Prénom</label>
              <input className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Email <span className="form-locked">non modifiable</span>
            </label>
            <input className="form-input" value={currentUser?.email} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">
              Mot de passe <span className="form-locked">non modifiable</span>
            </label>
            <input className="form-input" type="password" value="••••••••" disabled />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Mise à jour...' : 'Mettre à jour'}
          </button>
        </form>
      </div>
    </div>
  )
}