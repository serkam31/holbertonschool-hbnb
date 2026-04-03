import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getPlaces } from '../api/client'
import { useAuth } from '../context/AuthContext'
import parisVideo from '../assets/paris.mp4'

export default function HomePage() {
  const [places, setPlaces] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const videoRef = useRef(null)
  const { currentUser } = useAuth()

  // Transparent navbar over hero — restore on unmount
  useEffect(() => {
    const navbar = document.querySelector('.navbar')
    if (!navbar) return
    navbar.classList.add('navbar--hero')

    const onScroll = () => {
      if (window.scrollY > 60) {
        navbar.classList.remove('navbar--hero')
      } else {
        navbar.classList.add('navbar--hero')
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      navbar.classList.remove('navbar--hero')
    }
  }, [])

  // Fetch places
  useEffect(() => {
    async function fetchPlaces() {
      try {
        const data = await getPlaces()
        setPlaces(data)
        setFiltered(data)
      } catch {
        setError('Impossible de charger les annonces.')
      } finally {
        setLoading(false)
      }
    }
    fetchPlaces()
  }, [])

  // Intersection Observer — scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          observer.unobserve(e.target)
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )
    const els = document.querySelectorAll('.reveal')
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [filtered])

  // Parallax scroll on video
  useEffect(() => {
    const onScroll = () => {
      if (videoRef.current) {
        const offset = window.scrollY * 0.3
        videoRef.current.style.transform = `translateY(${offset}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Search filter
  function handleSearch(e) {
    const val = e.target.value
    setSearch(val)
    setFiltered(
      val.trim()
        ? places.filter(p => p.title.toLowerCase().includes(val.toLowerCase()))
        : places
    )
  }

  function handleSearchSubmit() {
    setFiltered(
      search.trim()
        ? places.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
        : places
    )
  }

  return (
    <div className="home-v2">

      {/* ── HERO ── */}
      <section className="hv2-hero">
        <video
          ref={videoRef}
          className="hv2-hero-video"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        >
          <source src={parisVideo} type="video/mp4" />
        </video>
        <div className="hv2-hero-overlay" />
        <div className="hv2-hero-content">
          <h1 className="hv2-hero-title">
            Trouvez votre prochain <em>séjour</em>
          </h1>
          <p className="hv2-hero-sub">
            Les plus beaux appartements parisiens, sélectionnés pour vous
          </p>
          <div className="hv2-search-bar">
            <input
              type="text"
              placeholder="Ville, quartier, type de bien…"
              value={search}
              onChange={handleSearch}
              onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
              aria-label="Rechercher un appartement"
            />
            <button className="hv2-search-btn" onClick={handleSearchSubmit}>
              Rechercher
            </button>
          </div>
        </div>
        <div className="hv2-scroll-cue" aria-hidden="true">↓</div>
      </section>

      {/* ── PLACES GRID ── */}
      <section className="hv2-section">
        <div className="hv2-section-header reveal">
          <div>
            <h2 className="hv2-section-title">Nos appartements</h2>
            <p className="hv2-section-sub">
              {loading ? 'Chargement…' : error ? error : `${filtered.length} annonce${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {currentUser && (
            <Link to="/places/create" className="btn btn-primary btn-sm">
              + Ajouter une place
            </Link>
          )}
        </div>

        {!loading && !error && filtered.length === 0 && (
          <div className="hv2-empty reveal">
            <div className="hv2-empty-icon">🏠</div>
            <h3>Aucune annonce trouvée</h3>
            <p>Essayez un autre terme de recherche.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="hv2-grid">
            {filtered.map((place, i) => (
              <Link
                key={place.id}
                to={`/places/${place.id}`}
                className="hv2-card reveal"
                style={{ transitionDelay: `${(i % 3) * 0.1}s` }}
              >
                <div className="hv2-card-img">
                  <span aria-hidden="true">🏠</span>
                </div>
                <div className="hv2-card-body">
                  <div className="hv2-card-title">{place.title}</div>
                  <div className="hv2-card-loc">
                    📍 {place.city || 'Paris'}
                  </div>
                  <div className="hv2-card-price">
                    <strong>€{place.price}</strong>
                    <span> / nuit</span>
                  </div>
                  <div className="hv2-card-cta">Voir le détail →</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── STATS BAND ── */}
      <section className="hv2-stats-band">
        <div className="hv2-stats-inner">
          <div className="hv2-stat reveal">
            <span className="hv2-stat-number">2 000<em>+</em></span>
            <span className="hv2-stat-label">voyageurs satisfaits</span>
          </div>
          <div className="hv2-stat-divider" aria-hidden="true" />
          <div className="hv2-stat reveal" style={{ transitionDelay: '0.15s' }}>
            <span className="hv2-stat-number">500<em>+</em></span>
            <span className="hv2-stat-label">annonces vérifiées</span>
          </div>
          <div className="hv2-stat-divider" aria-hidden="true" />
          <div className="hv2-stat reveal" style={{ transitionDelay: '0.30s' }}>
            <span className="hv2-stat-number">4,9<em>★</em></span>
            <span className="hv2-stat-label">de satisfaction moyenne</span>
          </div>
        </div>
      </section>

      {/* ── POURQUOI HBNB ── */}
      <section className="hv2-why-wrap">
        <div className="hv2-why">
          <div className="hv2-why-header reveal">
            <span className="hv2-eyebrow">Notre engagement</span>
            <h2 className="hv2-section-title">Pourquoi HBnB&nbsp;?</h2>
          </div>
          <div className="hv2-features">
            <div className="hv2-feature reveal">
              <span className="hv2-feature-icon" aria-hidden="true">🔒</span>
              <h3>Sécurisé</h3>
              <p>Paiements 100&nbsp;% protégés et données personnelles chiffrées à chaque étape.</p>
            </div>
            <div className="hv2-feature reveal">
              <span className="hv2-feature-icon" aria-hidden="true">✅</span>
              <h3>Vérifié</h3>
              <p>Chaque annonce est contrôlée par notre équipe avant d'être publiée.</p>
            </div>
            <div className="hv2-feature reveal">
              <span className="hv2-feature-icon" aria-hidden="true">⚡</span>
              <h3>Simple</h3>
              <p>Réservez en quelques clics. Pas de frais cachés, pas de mauvaises surprises.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITORIAL QUOTE ── */}
      <section className="hv2-editorial">
        <div className="hv2-editorial-inner">
          <div className="hv2-editorial-body reveal">
            <p className="hv2-editorial-quote">
              Paris n'est pas une destination.<br />
              C'est une façon d'habiter le monde.
            </p>
            <hr className="hv2-editorial-rule" />
            <span className="hv2-editorial-byline">
              <em>La promesse HBnB</em> — séjours d'exception dans la capitale
            </span>
          </div>
          <div className="hv2-editorial-aside reveal" style={{ transitionDelay: '0.2s' }}>
            <span className="hv2-eyebrow">Notre sélection</span>
            <p className="hv2-editorial-aside-text">
              Chaque appartement est choisi pour son caractère, son emplacement,
              et l'expérience unique qu'il offre. Nous refusons le banal.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="hv2-cta reveal">
        <div className="hv2-cta-inner">
          <span className="hv2-eyebrow hv2-eyebrow-light">Vous avez un bien&nbsp;?</span>
          <h2>Proposez votre appartement</h2>
          <p>Rejoignez notre communauté de propriétaires parisiens et commencez à louer dès aujourd'hui.</p>
          <Link to="/places/create" className="btn hv2-cta-btn">
            Commencer maintenant
          </Link>
        </div>
      </section>

    </div>
  )
}
