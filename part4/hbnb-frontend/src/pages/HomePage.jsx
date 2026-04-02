import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPlaces } from '../api/client'
import heroVideo from '../assets/hero.mp4'

export default function HomePage() {
  const [places, setPlaces] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchPlaces() {
      try {
        const data = await getPlaces()
        setPlaces(data)
        setFiltered(data)
      } catch {
        setError('Impossible de charger les places.')
      } finally {
        setLoading(false)
      }
    }
    fetchPlaces()
  }, [])

  function handleFilter() {
    let result = [...places]
    if (search.trim()) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (maxPrice !== '') {
      result = result.filter((p) => p.price <= parseFloat(maxPrice))
    }
    setFiltered(result)
  }

  function handleReset() {
    setSearch('')
    setMaxPrice('')
    setFiltered(places)
  }

  if (loading) return <div className="loading">Chargement...</div>
  if (error) return <div className="loading">{error}</div>

  return (
    <div className="page">
      <div className="home-hero">
        <video className="home-hero-video" autoPlay loop muted playsInline>
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <h1>Trouvez votre prochain <em>séjour</em></h1>
          <p>{places.length} place{places.length > 1 ? 's' : ''} disponible{places.length > 1 ? 's' : ''} — partout en France</p>
        </div>
      </div>

      <div className="filters">
        <input
          className="search-input"
          placeholder="🔍  Rechercher par titre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
        />
        <input
          className="search-input"
          style={{ maxWidth: '180px' }}
          placeholder="Prix max (€)"
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <button className="btn btn-secondary btn-sm" onClick={handleFilter}>
          Filtrer
        </button>
        <button className="btn btn-outline btn-sm" onClick={handleReset}>
          Réinitialiser
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏠</div>
          <h2>Aucune place trouvée</h2>
          <p>Essayez de modifier vos critères de recherche.</p>
        </div>
      ) : (
        <div className="places-grid">
          {filtered.map((place) => (
            <Link key={place.id} to={`/places/${place.id}`} className="place-card">
              <div className="place-card-img">
                <div className="place-card-img-placeholder">🏠</div>
              </div>
              <div className="place-card-body">
                <div className="place-card-title">{place.title}</div>
                <div className="place-card-sub">
                  {place.latitude.toFixed(2)}° N · {place.longitude.toFixed(2)}° E
                </div>
                <div className="place-card-price">
                  <strong>€{place.price}</strong> / nuit
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}