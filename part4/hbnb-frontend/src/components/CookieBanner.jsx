import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )cookie_consent=([^;]*)/)
    if (!match) setVisible(true)
  }, [])

  function accept() {
    document.cookie = 'cookie_consent=accepted; path=/; max-age=31536000'
    setVisible(false)
  }

  function refuse() {
    document.cookie = 'cookie_consent=refused; path=/; max-age=31536000'
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="dialog" aria-label="Consentement aux cookies" aria-modal="false">
      <div className="cookie-banner-content">
        <p className="cookie-banner-text">
          🍪 Ce site utilise un cookie strictement nécessaire à l'authentification (JWT).
          Aucun cookie publicitaire ou de tracking n'est utilisé.{' '}
          <Link to="/privacy" className="cookie-banner-link">En savoir plus</Link>
        </p>
        <div className="cookie-banner-actions">
          <button className="btn btn-outline btn-sm" onClick={refuse}>
            Refuser
          </button>
          <button className="btn btn-primary btn-sm" onClick={accept}>
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}
