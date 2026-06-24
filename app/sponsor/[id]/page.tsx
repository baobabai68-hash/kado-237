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
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    async function fetchSponsorData() {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('id', sponsorId)
        .single();

      if (data && !error) {
        setSponsor(data);
        const mediaUrl = data.video || '';
        const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') || mediaUrl.includes('video_');
        if (!isVideo && mediaUrl !== '') {
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
          return () => clearInterval(timer);
        }
      }
      setLoading(false);
    }
    if (sponsorId) fetchSponsorData();
  }, [sponsorId]);

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
      setShowAdTransition(true);
      setTimeout(() => {
        if (sponsorId < 5) {
          router.push(`/sponsor/${sponsorId + 1}`);
        } else {
          router.push('/?status=completed');
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
  const logoUrl = sponsor?.logo_url || '';

  const isYouTube = mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be');
  const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('video_');

  let embedUrl = mediaUrl;
  if (isYouTube) {
    if (mediaUrl.includes('shorts/')) {
      embedUrl = mediaUrl.replace('shorts/', 'embed/');
    } else if (mediaUrl.includes('watch?v=')) {
      embedUrl = mediaUrl.replace('watch?v=', 'embed/');
    }
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: currentBg, color: currentTextColor, fontFamily: 'sans-serif', padding: '20px' }}>
      
      {showAdTransition && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#000000', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff', padding: '20px', textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <h2 style={{ marginTop: '20px' }}>🎁 Ticket Validé !</h2>
          <p style={{ color: '#cbd5e1' }}>Chargement du sponsor suivant...</p>
        </div>
      )}

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* EN-TÊTE : LOGO EN HAUT PUIS NOM */}
        <header style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', color: currentTextColor }}>
            Étape {sponsorId} / 5
          </span>
          
          {logoUrl && (
            <div style={{ marginTop: '16px', marginBottom: '8px' }}>
              <img src={logoUrl} alt="Logo Partenaire" style={{ height: '50px', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
          )}
          
          <h2 style={{ marginTop: '5px', fontSize: '24px', fontWeight: 'bold' }}>{currentName}</h2>
        </header>

        {/* ZONE MÉDIA UNIQUE ET INTELLIGENTE */}
        <section style={{ backgroundColor: '#000000', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', marginBottom: '16px', position: 'relative' }}>
          {isYouTube ? (
            <div style={{ width: '100%', aspectRatio: '9/16', minHeight: '400px' }}>
              <iframe src={`${embedUrl}?autoplay=1&mute=1`} title="Sponsor" style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay" allowFullScreen />
            </div>
          ) : isVideo ? (
            <video src={mediaUrl} controls autoPlay playsInline onEnded={handleVideoEnd} style={{ width: '100%', display: 'block' }} />
          ) : (
            <div style={{ position: 'relative', width: '100%', backgroundColor: '#fff' }}>
              <img src={mediaUrl || 'https://via.placeholder.com/600x400?text=KADO+237'} alt="Sponsor" style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', display: 'block' }} />
              {!mediaFinished && (
                <div style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>
                  Validation dans {countdown}s
                </div>
              )}
            </div>
          )}
        </section>

        {/* TEXTE DE L'ANNONCE EN BAS DU MÉDIA */}
        <div style={{ textAlign: 'center', marginBottom: '24px', padding: '0 10px' }}>
          <p style={{ opacity: 0.9, fontSize: '16px', lineHeight: '1.4', margin: 0 }}>{currentText}</p>
        </div>

        {isYouTube && !mediaFinished && (
          <button onClick={() => setMediaFinished(true)} style={{ width: '100%', padding: '12px', backgroundColor: 'rgba(255,255,255,0.2)', color: currentTextColor, border: '1px dashed', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', fontWeight: 'bold' }}>
            J'ai terminé de regarder le Short 🟢
          </button>
        )}

        {/* FORMULAIRE TICKET */}
        {mediaFinished && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <form onSubmit={handleSubmitParticipation} style={{ backgroundColor: '#ffffff', color: '#1e293b', padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', textAlign: 'center', color: '#1e3a8a' }}>🎉 Choisissez votre Ticket</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[1, 2, 3].map((num) => (
                  <button key={num} type="button" onClick={() => setSelectedTicket(num)} style={{ padding: '16px 8px', borderRadius: '12px', border: selectedTicket === num ? '3px solid #2563eb' : '1px solid #cbd5e1', backgroundColor: selectedTicket === num ? '#eff6ff' : '#f8fafc', color: '#1e293b', fontWeight: 'bold' }}>
                    🎫 T-{num}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px', color: '#475569' }}>Votre numéro Mobile Money :</label>
                <input type="tel" placeholder="Ex: 6XXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} required />
              </div>
              <button type="submit" disabled={submitting || !selectedTicket} style={{ width: '100%', padding: '14px', backgroundColor: selectedTicket ? '#2563eb' : '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                {submitting ? 'Validation...' : 'Valider ce ticket gratuit'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
