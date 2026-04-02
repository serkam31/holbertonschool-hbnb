import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPlace } from '../api/client'
import PlaceForm from '../components/PlaceForm'

export default function CreatePlacePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(data) {
    setLoading(true)
    try {
      const place = await createPlace(data)
      navigate(`/places/${place.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: '720px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '2rem' }}>
        Ajouter une place
      </h1>
      <div className="card">
        <PlaceForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  )
}