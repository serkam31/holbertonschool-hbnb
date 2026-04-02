import { useState, useEffect } from 'react'
import { getAmenities } from '../api/client'

export default function PlaceForm({ initialData = {}, onSubmit, loading }) {
  const [title, setTitle] = useState(initialData.title ?? '')
  const [description, setDescription] = useState(initialData.description ?? '')
  const [price, setPrice] = useState(initialData.price ?? '')
  const [latitude, setLatitude] = useState(initialData.latitude ?? '')
  const [longitude, setLongitude] = useState(initialData.longitude ?? '')
  const [selectedAmenities, setSelectedAmenities] = useState(
    initialData.amenities?.map((a) => a.id) ?? []
  )
  const [amenities, setAmenities] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    getAmenities().then(setAmenities).catch(() => {})
  }, [])

  function toggleAmenity(id) {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await onSubmit({
        title, description,
        price: parseFloat(price),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        amenities: selectedAmenities,
      })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Titre</label>
          <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mon appartement..." required />
        </div>
        <div className="form-group">
          <label className="form-label">Prix / nuit (€)</label>
          <input className="form-input" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="100" required />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre place..." />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Latitude</label>
          <input className="form-input" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="48.8566" required />
        </div>
        <div className="form-group">
          <label className="form-label">Longitude</label>
          <input className="form-input" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="2.3522" required />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Équipements</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
          {amenities.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleAmenity(a.id)}
              className={`pill ${selectedAmenities.includes(a.id) ? 'pill-active' : ''}`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '0.5rem', opacity: loading ? 0.6 : 1 }}>
        {loading ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  )
}