import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getUsers, getPlaces, getAmenities,
  updateAmenity, createAmenity,
  createUser, updateUser,
} from '../api/client'
import { useAuth } from '../context/AuthContext'

const TABS = ['Amenities', 'Places', 'Utilisateurs']

export default function AdminPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Amenities')

  // Amenities state
  const [amenities, setAmenities] = useState([])
  const [newAmenityName, setNewAmenityName] = useState('')
  const [editingAmenity, setEditingAmenity] = useState(null) // { id, name }
  const [amenityLoading, setAmenityLoading] = useState(false)
  const [amenityError, setAmenityError] = useState('')

  // Places state
  const [places, setPlaces] = useState([])
  const [placesLoading, setPlacesLoading] = useState(false)

  // Users state
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [newUser, setNewUser] = useState({ first_name: '', last_name: '', email: '', password: '' })
  const [userLoading, setUserLoading] = useState(false)
  const [userError, setUserError] = useState('')
  const [userSuccess, setUserSuccess] = useState('')

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return }
    loadAmenities()
    loadPlaces()
    loadUsers()
  }, [])

  async function loadAmenities() {
    try { setAmenities(await getAmenities()) } catch {}
  }

  async function loadPlaces() {
    setPlacesLoading(true)
    try { setPlaces(await getPlaces()) } catch {} finally { setPlacesLoading(false) }
  }

  async function loadUsers() {
    try { setUsers(await getUsers()) } catch {}
  }

  // ── Amenities ──────────────────────────────────────────────
  async function handleCreateAmenity(e) {
    e.preventDefault()
    if (!newAmenityName.trim()) return
    setAmenityError('')
    setAmenityLoading(true)
    try {
      await createAmenity({ name: newAmenityName.trim() })
      setNewAmenityName('')
      await loadAmenities()
    } catch (err) {
      setAmenityError(err.message)
    } finally {
      setAmenityLoading(false)
    }
  }

  async function handleUpdateAmenity(e) {
    e.preventDefault()
    if (!editingAmenity?.name.trim()) return
    setAmenityError('')
    setAmenityLoading(true)
    try {
      await updateAmenity(editingAmenity.id, { name: editingAmenity.name.trim() })
      setEditingAmenity(null)
      await loadAmenities()
    } catch (err) {
      setAmenityError(err.message)
    } finally {
      setAmenityLoading(false)
    }
  }

  // ── Users ──────────────────────────────────────────────────
  async function handleCreateUser(e) {
    e.preventDefault()
    setUserError('')
    setUserSuccess('')
    setUserLoading(true)
    try {
      await createUser(newUser)
      setNewUser({ first_name: '', last_name: '', email: '', password: '' })
      setUserSuccess('Utilisateur créé avec succès !')
      await loadUsers()
    } catch (err) {
      setUserError(err.message)
    } finally {
      setUserLoading(false)
    }
  }

  async function handleUpdateUser(e) {
    e.preventDefault()
    if (!editingUser) return
    setUserError('')
    setUserLoading(true)
    try {
      const payload = {
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        email: editingUser.email,
      }
      if (editingUser.password) payload.password = editingUser.password
      await updateUser(editingUser.id, payload)
      setEditingUser(null)
      await loadUsers()
    } catch (err) {
      setUserError(err.message)
    } finally {
      setUserLoading(false)
    }
  }

  return (
    <div className="page">
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '0.5rem' }}>
        Panneau d'administration
      </h1>
      <p style={{ color: 'var(--gray)', fontSize: '15px', marginBottom: '2rem' }}>
        Gestion des ressources de la plateforme
      </p>

      {/* Tabs */}
      <div className="admin-tabs-bar" style={{ display: 'flex', gap: '8px', marginBottom: '2rem', borderBottom: '1px solid var(--gray-border)', paddingBottom: '0' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── TAB: Amenities ── */}
      {tab === 'Amenities' && (
        <div>
          {amenityError && <div className="alert alert-error">{amenityError}</div>}

          {/* Créer */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '1rem' }}>
              Ajouter un équipement
            </h2>
            <form onSubmit={handleCreateAmenity} style={{ display: 'flex', gap: '10px' }}>
              <input
                className="form-input"
                placeholder="Nom de l'équipement..."
                value={newAmenityName}
                onChange={(e) => setNewAmenityName(e.target.value)}
                required
              />
              <button type="submit" disabled={amenityLoading} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                + Ajouter
              </button>
            </form>
          </div>

          {/* Liste */}
          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '1rem' }}>
              Équipements ({amenities.length})
            </h2>
            {amenities.length === 0 && (
              <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Aucun équipement.</p>
            )}
            {amenities.map((a) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--gray-border)' }}>
                {editingAmenity?.id === a.id ? (
                  <form onSubmit={handleUpdateAmenity} style={{ display: 'flex', gap: '8px', flex: 1 }}>
                    <input
                      className="form-input"
                      value={editingAmenity.name}
                      onChange={(e) => setEditingAmenity({ ...editingAmenity, name: e.target.value })}
                      required
                      autoFocus
                    />
                    <button type="submit" disabled={amenityLoading} className="btn btn-primary btn-sm">
                      Sauvegarder
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingAmenity(null)}>
                      Annuler
                    </button>
                  </form>
                ) : (
                  <>
                    <span style={{ flex: 1, fontSize: '15px', fontWeight: '500' }}>{a.name}</span>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setEditingAmenity({ id: a.id, name: a.name })}
                    >
                      Modifier
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Places ── */}
      {tab === 'Places' && (
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '1rem' }}>
            Toutes les places ({places.length})
          </h2>
          {placesLoading && <p style={{ color: 'var(--gray)' }}>Chargement...</p>}
          {places.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--gray-border)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', fontSize: '15px', marginBottom: '2px' }}>{p.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--gray)' }}>€{p.price} / nuit</p>
              </div>
              <Link to={`/places/${p.id}`} className="btn btn-outline btn-sm">
                Voir
              </Link>
              <Link to={`/places/${p.id}/edit`} className="btn btn-primary btn-sm">
                Modifier
              </Link>
            </div>
          ))}
          {places.length === 0 && !placesLoading && (
            <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Aucune place.</p>
          )}
        </div>
      )}

      {/* ── TAB: Utilisateurs ── */}
      {tab === 'Utilisateurs' && (
        <div>
          {userError && <div className="alert alert-error">{userError}</div>}
          {userSuccess && <div className="alert alert-success">{userSuccess}</div>}

          {/* Créer un utilisateur */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '1rem' }}>
              Créer un utilisateur
            </h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="new-user-firstname" className="form-label">Prénom</label>
                  <input
                    id="new-user-firstname"
                    className="form-input"
                    placeholder="Jean"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-user-lastname" className="form-label">Nom</label>
                  <input
                    id="new-user-lastname"
                    className="form-input"
                    placeholder="Dupont"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="new-user-email" className="form-label">Email</label>
                  <input
                    id="new-user-email"
                    className="form-input"
                    type="email"
                    placeholder="jean@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="new-user-password" className="form-label">Mot de passe</label>
                  <input
                    id="new-user-password"
                    className="form-input"
                    type="password"
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label htmlFor="new-user-consent" style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: 'var(--gray-dark)', cursor: 'pointer' }}>
                  <input id="new-user-consent" type="checkbox" required style={{ marginTop: '2px', accentColor: 'var(--green)' }} />
                  L'utilisateur a été informé que ses données (nom, email) sont traitées conformément à notre{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)' }}>
                    politique de confidentialité
                  </a>.
                </label>
              </div>
              <button type="submit" disabled={userLoading} className="btn btn-primary">
                + Créer l'utilisateur
              </button>
            </form>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '1rem' }}>
              Tous les utilisateurs ({users.length})
            </h2>
            {users.map((u) => (
              <div key={u.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-border)' }}>
                {editingUser?.id === u.id ? (
                  <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input
                        className="form-input"
                        style={{ width: '140px' }}
                        placeholder="Prénom"
                        value={editingUser.first_name}
                        onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                        required
                        autoFocus
                      />
                      <input
                        className="form-input"
                        style={{ width: '140px' }}
                        placeholder="Nom"
                        value={editingUser.last_name}
                        onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                        required
                      />
                      <input
                        className="form-input"
                        style={{ width: '200px' }}
                        type="email"
                        placeholder="Email"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                        required
                      />
                      <input
                        className="form-input"
                        style={{ width: '160px' }}
                        type="password"
                        placeholder="Nouveau mot de passe"
                        value={editingUser.password}
                        onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="submit" disabled={userLoading} className="btn btn-primary btn-sm">
                        Sauvegarder
                      </button>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingUser(null)}>
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div className="avatar avatar-sm" aria-label={`Avatar de ${u.first_name} ${u.last_name}`}>
                      <span aria-hidden="true">{u.first_name?.[0]}{u.last_name?.[0]}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
                        {u.first_name} {u.last_name}
                        {u.is_admin && <span className="badge badge-green" style={{ marginLeft: '8px' }}>Admin</span>}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--gray)' }}>{u.email}</p>
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setEditingUser({ id: u.id, first_name: u.first_name, last_name: u.last_name, email: u.email, password: '' })}
                    >
                      Modifier
                    </button>
                  </div>
                )}
              </div>
            ))}
            {users.length === 0 && (
              <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Aucun utilisateur.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
