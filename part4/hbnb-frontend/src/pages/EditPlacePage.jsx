import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPlace, updatePlace } from '../api/client'
import { useAuth } from '../context/AuthContext'
import PlaceForm from '../components/PlaceForm'

export default function EditPlacePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isOwner, isAdmin } = useAuth()
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchPlace() {
      try {
        const data = await getPlace(id)
        if (!isOwner(data.owner?.id) && !isAdmin) {
          navigate('/')
          return
        }
        setPlace(data)
      } catch {
        setError('Place introuvable.')
      } finally {
        setLoading(false)
      }
    }
    fetchPlace()
  }, [id])

  async function handleSubmit(data) {
    setSaving(true)
    try {
      await updatePlace(id, data)
      navigate(`/places/${id}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="loading">Chargement...</div>
  if (error) return <div className="loading">{error}</div>

  return (
    <div className="page" style={{ maxWidth: '720px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '2rem' }}>
        Modifier la place
      </h1>
      <div className="card">
        <PlaceForm initialData={place} onSubmit={handleSubmit} loading={saving} />
      </div>
    </div>
  )
}