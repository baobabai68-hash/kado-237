'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function SponsorPage() {
  const { id } = useParams();
  const router = useRouter();
  const sponsorId = parseInt(id as string, 10);

  // États pour les données du sponsor
  const [sponsor, setSponsor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // États pour la logique du jeu
  const [videoFinished, setVideoFinished] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Charger les données de ce sponsor précis
  useEffect(() => {
    async function fetchSponsorData() {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('id', sponsorId)
        .single();

      if (data && !error) {
        setSponsor(data);
      }
      setLoading(false);
    }
    if (sponsorId) fetchSponsorData();
  }, [sponsorId]);

  // Gérer la fin de la vidéo
  const handleVideoEnd = () => {
    setVideoFinished(true);
  };

  // Enregistrer la participation dans Supabase
  const handleSubmitParticipation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !phoneNumber) {
      alert('Veuillez choisir un ticket et entrer votre numéro Mobile Money.');
      return;
    }

    // Validation simple du format de numéro au Cameroun (9 chiffres)
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (!/^[6][0-9]{8}$/.test(cleanPhone)) {
      alert('Veuillez entrer un numéro valide de 9 chiffres commençant par 6 (MTN, Orange, Camtel).');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from('participations')
      .insert([
        {
          sponsor_id: sponsorId,
          ticket_choisi: selectedTicket,
          phone_number: cleanPhone
        }
      ]);

    if (error) {
      alert(`Erreur lors de la validation : ${error.message}`);
    } else {
      setSuccess(true);
    }
    setSubmitting(false);
  };

  // Passer à l'étape suivante ou finir le parcours
  const handleNextStep = () => {
    if (sponsorId < 5) {
      router.push(`/sponsor/${sponsorId + 1}`);
    } else {
      router.push('/'); // Retour à l'accueil à la fin du tunnel
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>Chargement de l'étape publicitaire...</div>;
  }

  // Si le sponsor n'existe pas en BDD, sécurité de secours
  const currentBg = sponsor?.bg_color || '#0d2240';
  const currentName = sponsor?.name || `Partenaire Étape ${sponsorId}`;
  const currentText = sponsor?.text || 'Regardez la vidéo publicitaire pour débloquer vos tickets gratuits.';
  const currentVideo = sponsor?.video || 'https://www.w3schools.com/html/mov_bbb.mp4'; // Vidéo test par défaut

  return (
    <main style={{ minHeight: '100vh', backgroundColor: currentBg, color: '#ffffff', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* En-tête de l'étape */}
        <header style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
            Étape {sponsorId} / 5
          </span>
          <h2 style={{ marginTop: '14px', fontSize: '24px' }}>{currentName}</h2>
          <p style={{ color: '#cbd5e1', fontSize: '15px' }}>{currentText}</p>
        </header>

        {/* Zone Vidéo */}
        <section style={{ backgroundColor: '#000000', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', marginBottom: '30px' }}>
          <video 
            src={currentVideo} 
            controls 
            onEnded={handleVideoEnd}
            style={{ width: '100%', display: 'block' }}
            autoPlay
            playsInline
          />
        </section>

        {/* Zone interactive débloquée après la vidéo */}
        {videoFinished ? (
          <div style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
            {!success ? (
              <form onSubmit={handleSubmitParticipation} style={{ backgroundColor: '#ffffff', color: '#1e293b', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 16px 0', textAlign: 'center', color: '#1e3a8a' }}>🎉 Vidéo validée ! Choisissez 1 Ticket</h3>
                
                {/* Grille des 3 tickets */}
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
                        fontSize: '15px',
                        textAlign: 'center'
                      }}
                    >
                      🎫 Ticket {num}
                    </button>
                  ))}
                </div>

                {/* Champ Numéro Mobile Money */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', fontSize: '14px', color: '#475569' }}>
                    Votre numéro Mobile Money (pour le tirage) :
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

                {/* Bouton d'action */}
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
                  {submitting ? 'Validation en cours...' : 'Valider ce ticket gratuit'}
                </button>
              </form>
            ) : (
              /* Écran de succès pour cette étape */
              <div style={{ backgroundColor: '#10b981', color: 'white', padding: '30px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '22px' }}>✅ Participation Enregistrée !</h3>
                <p style={{ fontSize: '15px', marginBottom: '20px' }}>Votre ticket a bien été pris en compte pour ce partenaire.</p>
                <button
                  onClick={handleNextStep}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#10b981',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {sponsorId < 5 ? 'Passer au Sponsor Suivant ➡️' : 'Terminer le parcours 🏁'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Consigne d'attente pendant la vidéo */
          <div style={{ textAlign: 'center', padding: '10px', color: '#cbd5e1', fontSize: '15px', fontStyle: 'italic' }}>
            💡 Veuillez regarder l'entièreté de la vidéo publicitaire pour débloquer la sélection des tickets.
          </div>
        )}

      </div>
    </main>
  );
}
