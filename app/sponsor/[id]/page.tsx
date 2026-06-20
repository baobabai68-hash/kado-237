'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Données temporaires des sponsors en attendant la connexion finale à Supabase
const SPONSORS_MOCK = [
  { id: 1, name: '1XBET Cameroun', bg_color: '#0d2240', text: 'Inscrivez-vous avec le code promo de l\'influenceur pour doubler votre premier dépôt !', video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 2, name: 'MTN MoMo', bg_color: '#ffcc00', text: 'Le moyen le plus rapide et sécurisé pour envoyer et recevoir de l\'argent au pays. Gardez le contrôle !', video: 'https://www.w3schools.com/html/movie.mp4' },
  { id: 3, name: 'Orange Money', bg_color: '#f16e00', text: 'Chaque semaine, profitez de bonus exceptionnels sur vos achats de crédits et forfaits Internet.', video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 4, name: 'Sponsor Local 4', bg_color: '#16a34a', text: 'Découvrez la nouvelle marque camerounaise qui révolutionne la mode locale.', video: 'https://www.w3schools.com/html/movie.mp4' },
  { id: 5, name: 'Partenaire KADO 237', bg_color: '#dc2626', text: 'Dernière étape ! Regardez cette courte vidéo pour valider définitivement votre ticket de tombola.', video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
];

export default function SponsorPage() {
  const router = useRouter();
  const params = useParams();
  const currentId = parseInt(params.id as string, 10) || 1;
  
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(10); // 10 secondes obligatoires par vidéo
  const [canProceed, setCanProceed] = useState(false);

  // Trouver le sponsor actuel dans la liste
  const sponsor = SPONSORS_MOCK.find(s => s.id === currentId) || SPONSORS_MOCK[0];

  // Gestionnaire du compte à rebours pour bloquer la triche
  useEffect(() => {
    setCountdown(10);
    setCanProceed(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanProceed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentId]);

  const handleNextStep = () => {
    if (!canProceed) return;
    
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      if (currentId < 5) {
        // Passe au sponsor suivant
        router.push(`/sponsor/${currentId + 1}`);
      } else {
        // Si c'était le 5ème, direction la page de succès
        router.push('/succes');
      }
    }, 1000);
  };

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: sponsor.bg_color,
      color: '#ffffff',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      transition: 'background-color 0.5s ease'
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        padding: '24px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        boxSizing: 'border-box',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Barre de progression */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', fontWeight: 'bold' }}>
          <span>Progression Obligatoire</span>
          <span>Étape {currentId} / 5</span>
        </div>
        <div style={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.2)', height: '8px', borderRadius: '4px', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ width: `${(currentId / 5) * 100}%`, backgroundColor: '#ffffff', height: '100%', transition: 'width 0.3s' }}></div>
        </div>

        {/* Nom du Sponsor */}
        <h2 style={{ textAlign: 'center', margin: '0 0 16px 0', fontSize: '24px', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
          {sponsor.name}
        </h2>

        {/* Lecteur Vidéo */}
        <div style={{ width: '100%', backgroundColor: '#000000', borderRadius: '12px', overflow: 'hidden', position: 'relative', aspectRatio: '16/9', marginBottom: '16px' }}>
          <video 
            src={sponsor.video} 
            controls={false} 
            autoPlay 
            muted 
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {!canProceed && (
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              ⏱️ Regarder encore : {countdown}s
            </div>
          )}
        </div>

        {/* Texte Publicitaire */}
        <p style={{ fontSize: '15px', lineHeight: '1.5', textAlign: 'center', margin: '0 0 24px 0', minHeight: '60px' }}>
          {sponsor.text}
        </p>

        {/* Bouton Étape Suivante */}
        <button
          onClick={handleNextStep}
          disabled={!canProceed || loading}
          style={{
            width: '100%',
            backgroundColor: !canProceed ? 'rgba(255, 255, 255, 0.3)' : '#ffffff',
            color: !canProceed ? 'rgba(255, 255, 255, 0.6)' : '#000000',
            fontWeight: 'bold',
            padding: '16px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: !canProceed || loading ? 'not-allowed' : 'pointer',
            boxShadow: canProceed ? '0 4px 6px -1px rgba(0,0,0,0.2)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Chargement...' : canProceed ? '✅ Étape Suivante' : `Veuillez regarder la vidéo (${countdown}s)`}
        </button>
      </div>
    </main>
  );
}
