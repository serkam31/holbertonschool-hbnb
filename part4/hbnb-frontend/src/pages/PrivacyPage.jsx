export default function PrivacyPage() {
  return (
    <div className="page" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '0.5rem' }}>
        Politique de confidentialité
      </h1>
      <p style={{ color: 'var(--gray)', fontSize: '14px', marginBottom: '2.5rem' }}>
        Dernière mise à jour : 1er avril 2026
      </p>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1rem' }}>1. Responsable du traitement</h2>
        <p style={{ color: 'var(--gray-dark)', lineHeight: 1.7 }}>
          HBnB — Projet pédagogique Holberton School.<br />
          Contact : <a href="mailto:contact@hbnb.io" style={{ color: 'var(--green)' }}>contact@hbnb.io</a>
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1rem' }}>2. Données collectées</h2>
        <p style={{ color: 'var(--gray-dark)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
          Nous collectons les données suivantes lors de la création d'un compte :
        </p>
        <ul style={{ color: 'var(--gray-dark)', lineHeight: 2, paddingLeft: '1.5rem' }}>
          <li>Prénom et nom</li>
          <li>Adresse email</li>
          <li>Mot de passe (stocké sous forme chiffrée bcrypt)</li>
        </ul>
        <p style={{ color: 'var(--gray-dark)', lineHeight: 1.7, marginTop: '0.75rem' }}>
          Nous collectons également les contenus que vous publiez (annonces de lieux, avis).
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1rem' }}>3. Finalité du traitement</h2>
        <ul style={{ color: 'var(--gray-dark)', lineHeight: 2, paddingLeft: '1.5rem' }}>
          <li>Authentification et gestion de votre compte</li>
          <li>Affichage de vos annonces et avis sur la plateforme</li>
          <li>Administration de la plateforme</li>
        </ul>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1rem' }}>4. Cookies</h2>
        <p style={{ color: 'var(--gray-dark)', lineHeight: 1.7 }}>
          Ce site utilise un seul cookie nommé <strong>token</strong>, strictement nécessaire au fonctionnement
          de l'authentification (jeton JWT). Il ne contient aucune donnée personnelle et expire à la déconnexion.
          Aucun cookie publicitaire, analytique ou de tracking tiers n'est utilisé.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1rem' }}>5. Durée de conservation</h2>
        <p style={{ color: 'var(--gray-dark)', lineHeight: 1.7 }}>
          Vos données sont conservées tant que votre compte est actif. En cas de suppression de compte,
          toutes vos données personnelles sont effacées dans un délai de 30 jours.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1rem' }}>6. Vos droits (RGPD)</h2>
        <p style={{ color: 'var(--gray-dark)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
        </p>
        <ul style={{ color: 'var(--gray-dark)', lineHeight: 2, paddingLeft: '1.5rem' }}>
          <li><strong>Droit d'accès</strong> — consulter vos données depuis votre profil</li>
          <li><strong>Droit de rectification</strong> — modifier vos données depuis votre profil</li>
          <li><strong>Droit à l'effacement</strong> — supprimer votre compte depuis votre profil</li>
          <li><strong>Droit à la portabilité</strong> — demander une copie de vos données par email</li>
          <li><strong>Droit d'opposition</strong> — s'opposer au traitement en nous contactant</li>
        </ul>
        <p style={{ color: 'var(--gray-dark)', lineHeight: 1.7, marginTop: '0.75rem' }}>
          Pour exercer ces droits : <a href="mailto:contact@hbnb.io" style={{ color: 'var(--green)' }}>contact@hbnb.io</a>
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '1rem' }}>7. Partage des données</h2>
        <p style={{ color: 'var(--gray-dark)', lineHeight: 1.7 }}>
          Vos données ne sont jamais vendues ni transmises à des tiers à des fins commerciales.
          Elles sont hébergées sur des serveurs situés en France.
        </p>
      </div>
    </div>
  )
}
