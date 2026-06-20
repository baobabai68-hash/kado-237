'use client';

import { useState } from 'react';

export default function Home() {
  const [telephone, setTelephone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérification locale du numéro (9 chiffres, commence par 6)
    const phoneRegex = /^6[5-9][0-9]{7}$/;
    if (!phoneRegex.test(telephone)) {
      setMessage({ type: 'error', text: 'Le numéro entré est invalide. Exemple: 677123456' });
      return;
    }

    if (!acceptedTerms) {
      setMessage({ type: 'error', text: 'Vous devez accepter les conditions pour participer.' });
      return;
    }

    setLoading(true);
    setMessage({ type: 'info', text: 'Vérification de votre session...' });

    // Pour l'instant, on simule la connexion pour voir le visuel
    setTimeout(() => {
      setLoading(false);
      setMessage({ type: 'success', text: 'Numéro validé ! Connexion au flux publicitaire...' });
    }, 1500);
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'sans-serif',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        width: '100%',
        maxWidth: '400px',
        boxSizing: 'border-box'
      }}>
        {/* En-tête de la page */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ color: '#1e3a8a', fontSize: '28px', margin: '0 0 8px 0', fontWeight: 'bold' }}>
            🎉 KADO 237
          </h1>
          <p style={{ color: '#4b5563', fontSize: '14px', margin: '0' }}>
            Entre ton numéro Mobile Money et tente de gagner de nombreux lots !
          </p>
        </div>

        {/* Message d'alerte (Erreur ou Succès) */}
        {message.text && (
          <div style={{
            backgroundColor: message.type === 'error' ? '#fee2e2' : message.type === 'success' ? '#dcfce7' : '#e0f2fe',
            color: message.type === 'error' ? '#991b1b' : message.type === 'success' ? '#166534' : '#0369a1',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {message.text}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="phone" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Numéro de téléphone (MTN / Orange)
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="Ex: 699001122"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
              required
            />
          </div>

          {/* Case à cocher CGU */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              disabled={loading}
              style={{ marginTop: '3px', cursor: 'pointer' }}
            />
            <label htmlFor="terms" style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.4', cursor: 'pointer' }}>
              J'accepte le règlement du tirage au sort et j'autorise KADO 237 à collecter mon numéro pour la remise des lots.
            </label>
          </div>

          {/* Bouton de validation */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: '#ffffff',
              fontWeight: 'bold',
              padding: '14px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Vérification en cours...' : '🚀 Participer au Tirage'}
          </button>
        </form>
      </div>
    </main>
  );
}
