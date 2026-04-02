import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPlace, createReview, deleteReview } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function PlaceDetailPage() {
  const { id } = useParams()
  const { currentUser, isOwner } = useAuth()
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewError, setReviewError] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  async function fetchPlace() {
    try {
      const data = await getPlace(id)
      setPlace(data)
    } catch {
      setError('Place introuvable.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlace() }, [id])

  async function handleReviewSubmit(e) {
    e.preventDefault()
    setReviewError('')
    setReviewLoading(true)
    try {
      await createReview({ text: reviewText, rating: reviewRating, place_id: id, user_id: currentUser.id })
      setReviewText('')
      setReviewRating(5)
      await fetchPlace()
    } catch (err) {
      setReviewError(err.message)
    } finally {
      setReviewLoading(false)
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!window.confirm('Supprimer cet avis ?')) return
    try {
      await deleteReview(reviewId)
      await fetchPlace()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div className="loading">Chargement...</div>
  if (error) return <div className="loading">{error}</div>

  const owner = place.owner
  const alreadyReviewed = place.reviews?.some((r) => r.user_id === currentUser?.id)
  const isMine = isOwner(owner?.id)

  return (
    <div className="page">
      <div className="place-hero">
        <div className="place-hero-placeholder">🏠</div>
        <div className="place-hero-overlay">
          <h1 className="place-hero-title">{place.title}</h1>
          <p className="place-hero-price">€{place.price} / nuit</p>
        </div>
      </div>

      <div className="detail-layout">
        <div>
          {owner && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div className="avatar avatar-md">
                  {owner.first_name?.[0]}{owner.last_name?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--black)', margin: '0 0 2px' }}>
                    {owner.first_name} {owner.last_name}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--gray)', margin: 0 }}>{owner.email}</p>
                </div>
                {isMine && (
                  <Link to={`/places/${place.id}/edit`} className="btn btn-outline btn-sm">
                    Modifier ✎
                  </Link>
                )}
              </div>
              <hr className="divider" />
            </>
          )}

          {place.description && (
            <>
              <p style={{ fontSize: '16px', color: 'var(--gray-dark)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                {place.description}
              </p>
              <hr className="divider" />
            </>
          )}

          {place.amenities?.length > 0 && (
            <>
              <h2 className="section-title">Équipements</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '1.5rem' }}>
                {place.amenities.map((a) => (
                  <span key={a.id} className="pill" style={{ cursor: 'default' }}>{a.name}</span>
                ))}
              </div>
              <hr className="divider" />
            </>
          )}

          <h2 className="section-title">Avis ({place.reviews?.length ?? 0})</h2>

          {place.reviews?.length === 0 && (
            <p style={{ color: 'var(--gray)', fontSize: '15px', marginBottom: '1.5rem' }}>
              Aucun avis pour le moment.
            </p>
          )}

          {place.reviews?.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="avatar avatar-sm">
                  {review.user_name?.[0] ?? '?'}
                </div>
                <span className="review-name">{review.user_name}</span>
                <span className="stars">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </span>
                {currentUser?.id === review.user_id && (
                  <button className="btn btn-danger" style={{ marginLeft: 'auto' }} onClick={() => handleDeleteReview(review.id)}>
                    Supprimer
                  </button>
                )}
              </div>
              <p className="review-text">{review.text}</p>
            </div>
          ))}

          {!currentUser && (
            <p style={{ color: 'var(--gray)', fontSize: '14px', marginTop: '1.5rem' }}>
              <Link to="/login" style={{ color: 'var(--red)', fontWeight: '600' }}>Connectez-vous</Link>{' '}
              pour laisser un avis.
            </p>
          )}

          {currentUser && isMine && (
            <p style={{ color: 'var(--gray)', fontSize: '14px', fontStyle: 'italic', marginTop: '1.5rem' }}>
              Vous ne pouvez pas noter votre propre place.
            </p>
          )}

          {currentUser && !isMine && alreadyReviewed && (
            <p style={{ color: 'var(--gray)', fontSize: '14px', fontStyle: 'italic', marginTop: '1.5rem' }}>
              Vous avez déjà laissé un avis sur cette place.
            </p>
          )}

          {currentUser && !isMine && !alreadyReviewed && (
            <form onSubmit={handleReviewSubmit} style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid var(--gray-light)', borderRadius: 'var(--radius-lg)', background: 'var(--gray-bg)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1.25rem' }}>Laisser un avis</h3>
              {reviewError && <div className="alert alert-error">{reviewError}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Note</label>
                <select className="form-select" value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                  {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} ★</option>)}
                </select>
              </div>
              <div className="form-group">
                <textarea className="form-textarea" value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Partagez votre expérience..." required />
              </div>
              <button type="submit" disabled={reviewLoading} className="btn btn-primary" style={{ opacity: reviewLoading ? 0.6 : 1 }}>
                {reviewLoading ? 'Envoi...' : 'Publier'}
              </button>
            </form>
          )}
        </div>

        <div className="detail-sidebar">
          <div className="sidebar-card">
            <p className="sidebar-price">€{place.price} <span>/ nuit</span></p>
            <hr className="divider" />
            <p style={{ fontSize: '14px', color: 'var(--gray)' }}>
              📍 {place.latitude}° N, {place.longitude}° E
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}