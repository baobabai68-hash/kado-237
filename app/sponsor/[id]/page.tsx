'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function SponsorPage() {
  const { id } = useParams();
  const router = useRouter();
  const sponsorId = parseInt(id as string, 10);

  const [sponsor, setSponsor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [mediaFinished, setMediaFinished] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAdTransition, setShowAdTransition] = useState(false);
  const [countdown, setCountdown] = useState(15); // Pour les images/GIFs

  useEffect(() => {
    async function fetchSponsorData() {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('id', sponsorId)
        .single();

      if (data && !error) {
        setSponsor(data);
        // Si le média n'est pas une vidéo classique, on lance un compte à rebours
        const mediaUrl = data.video || '';
        const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be');
        if (!isVideo && mediaUrl !== '') {
          startImageTimer();
        }
      }
      setLoading(false);
    }
    if (sponsorId) fetchSponsorData();
  }, [sponsorId]);

  const startImageTimer = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setMediaFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVideoEnd = () => {
    setMediaFinished(true);
  };

  const handleSubmitParticipation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !phoneNumber) return;

    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (!/^[6][0-9]{8}$/.test(cleanPhone)) {
      alert('Veuillez entrer un numéro valide de 9 chiffres commençant par 6.');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from('participations')
      .insert([{ sponsor_id: sponsorId, ticket_choisi: selectedTicket, phone_number: cleanPhone }]);

    setSubmitting(false);

    if (error) {
      alert(`Erreur : ${error.message}`);
    } else {
      // Déclencher l'écran de transition publicitaire (Simulateur de vidéo récompensée)
      setShowAdTransition(true);
      
      // Redirection automatique après 4 secondes vers l'étape suivante ou l'accueil
      setTimeout(() => {
        if (sponsorId < 5) {
          router.push(`/sponsor/${sponsorId + 1}`);
        } else {
          router.push('/?status=completed'); // Succès total
        }
      }, 4000);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>Chargement...</div>;
  }

  const currentBg = sponsor?.bg_color || '#0d2240';
  const currentTextColor = sponsor?.text_color || '#ffffff';
  const currentName = sponsor?.name || `Sponsor ${sponsorId}`;
  const currentText = sponsor?.text || 'Découvrez notre partenaire pour débloquer votre ticket.';
  const mediaUrl = sponsor?.video || '';

  // Détection du type de média
  const isYouTube = mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be');
  const isVideo = mediaUrl.includes('.mp4');

  // Formatage des liens YouTube Shorts ou standards pour l'intégration iframe
  let embedUrl = mediaUrl;
  if (isYouTube) {
    if (mediaUrl.includes('shorts/')) {
      embedUrl = mediaUrl.replace('shorts/', 'embed/');
    } else if (mediaUrl.includes('watch?v=')) {
      embedUrl = mediaUrl.replace('watch?v=', 'embed/');
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: currentBg, color: currentTextColor, fontFamily: 'sans-serif', padding: '20px', transition: 'all 0.3s' }}>
      
      {/* ÉCRAN DE TRANSITION : PUBLICITÉ RÉCOMPENSÉE SIMULÉE */}
      {showAdTransition && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#000000', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', padding: '20px', textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ marginTop: '20px' }}>🎁 Ticket Validé !</h2>
          <p style={{ color: '#cbd5e1' }}>Chargement du sponsor suivant (Publicité bonus en cours...)</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', color: currentTextColor }}>
            Étape {sponsorId} / 5
          </span>
          <h2 style={{ marginTop: '14px', fontSize: '24px' }}>{currentName}</h2>
          <p style={{ opacity: 0.8, fontSize: '15px' }}>{currentText}</p>
        </header>

        {/* ZONE MÉDIA FLEXIBLE */}
        <section style={{ backgroundColor: '#000000', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', marginBottom: '20px', position: 'relative', width: '100%', aspectRatio: isYouTube ? '9/16' : 'auto' }}>
          {isYouTube ? (
            <iframe 
              src={`${embedUrl}?autoplay=1&mute=1&controls=1`}
              title="Publicité Sponsor"
              style={{ width: '100%', height: '100%', border: 'none', minHeight: '400px' }}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : isVideo ? (
            <video src={mediaUrl} controls autoPlay playsInline onEnded={handleVideoEnd} style={{ width: '100%', display: 'block' }} />
          ) : (
            // Mode Image / GIF
            <div style={{ position: 'relative', width: '100%', textAlign: 'center', backgroundColor: '#fff' }}>
              <img src={mediaUrl || 'https://via.placeholder.com/600x400?text=KADO+237+Partenaire'} alt="Sponsor" style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', display: 'block' }} />
              {!mediaFinished && (
                <div style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>
                  Validation dans {countdown}s
                </div>
              )}
            </div>
          )}
        </section>

        {/* Si c'est un lien YouTube, on affiche un bouton pour débloquer après un court instant, ou on se fie au timer pour les images */}
        {(isYouTube && !mediaFinished) && (
          <button onClick={() => setMediaFinished(true)} style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(255,255,255,0.2)', color: currentTextColor, border: '1px dashed', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}>
            J'ai terminé de regarder le Short 🟢
          </button>
        )}

        {/* ZONE FORMULAIRE DÉBLOQUÉE */}
        {mediaFinished && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <form onSubmit={handleSubmitParticipation} style={{ backgroundColor: '#ffffff', color: '#1e293b', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 16px 0', textAlign: 'center', color: '#1e3a8a' }}>🎉 Choisissez votre Ticket</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSelectedTicket(num)}
                    style={{
                      padding: '16px 8px',
                      borderRadius: '12px',
                      border: selectedTicket === num ? '3px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: selectedTicket === num ? '#eff6ff' : '#f8fafc',
                      color: '#1e293b',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '15px'
                    }}
                  >
                    🎫 T-{num}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px', color: '#475569' }}>
                  Votre numéro Mobile Money :
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 6XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedTicket}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: selectedTicket ? '#2563eb' : '#94a3b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: selectedTicket ? 'pointer' : 'not-allowed'
                }}
              >
                {submitting ? 'Validation...' : 'Valider ce ticket gratuit'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
