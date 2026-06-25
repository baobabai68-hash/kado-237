'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function HomePage() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Gestion du parcours
  const [etapeSponsor, setEtapeSponsor] = useState<number>(0); // 0 = Accueil, 1 à 5 = Sponsors, 6 = Succès final
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ticketChoisi, setTicketChoisi] = useState('');
  
  // États pour la vidéo publicitaire forcée
  const [enLectureVideo, setEnLectureVideo] = useState(false);
  const [compteALebours, setCompteALebours] = useState(6);

  useEffect(() => {
    async function fetchSponsors() {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .order('id', { ascending: true });

      if (data && !error) {
        setSponsors(data);
      }
      setLoading(false);
    }
    fetchSponsors();
  }, []);

  // Déclencheur automatique de fin de vidéo
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (enLectureVideo && compteALebours > 0) {
      timer = setTimeout(() => setCompteALebours(compteALebours - 1), 1000);
    } else if (enLectureVideo && compteALebours === 0) {
      // La vidéo est finie ! Passage automatique à l'étape suivante
      setEnLectureVideo(false);
      const prochaineEtape = etapeSponsor + 1;
      
      if (prochaineEtape > 5) {
        // Fin complète du parcours -> Enregistrement en Base de données
        enregistrerParticipationFinale();
      } else {
        setEtapeSponsor(prochaineEtape);
      }
    }
    return () => clearTimeout(timer);
  }, [enLectureVideo, compteALebours]);

  const handleValiderTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.match(/^(6)(5|6|7|8|9)[0-9]{7}$/)) {
      alert("Veuillez entrer un numéro de téléphone camerounais valide (9 chiffres commençant par 6).");
      return;
    }
    if (!ticketChoisi || parseInt(ticketChoisi) < 1 || parseInt(ticketChoisi) > 100) {
      alert("Veuillez choisir un numéro de ticket entre 1 et 100.");
      return;
    }

    // Lancement de la vidéo publicitaire récompensée obligatoire
    setCompteALebours(6); // 6 secondes de publicité obligatoire pour la démo
    setEnLectureVideo(true);
  };

  const enregistrerParticipationFinale = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('participations')
        .insert([{
          phone_number: phoneNumber,
          ticket_choisi: parseInt(ticketChoisi),
          sponsor_id: 5 // Marque la validation du parcours complet
        }]);

      if (error) throw error;
      setEtapeSponsor(6); // Affiche l'écran de succès final
    } catch (err: any) {
      alert("Erreur lors de la validation : " + err.message);
      setEtapeSponsor(0); // Renvoie au début en cas de bug
    } finally {
      setLoading(false);
    }
  };

  const réinitialiserParcours = () => {
    setPhoneNumber('');
    setTicketChoisi('');
    setEtapeSponsor(0);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#0d2240', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #facc15', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 15px auto' }}></div>
          <p style={{ fontWeight: 'bold' }}>Chargement de l'univers KADO 237...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // OBTENIR LE SPONSOR ACTUEL DU PARCOURS
  const currentSponsor = sponsors.find(s => s.id === etapeSponsor);

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0d2240', color: '#ffffff', fontFamily: 'sans-serif', padding: '20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>

        {/* 1. ÉCRAN FLUIDE : LECTEUR VIDÉO DE PUBLICITÉ FORCÉE */}
        {enLectureVideo && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000', zIndex: 999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', minHeight: '90vh', borderRadius: '16px', border: '2px solid #facc15' }}>
            <div style={{ width: '100%', textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ backgroundColor: '#dc2626', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                PUBLICITÉ OBLIGATOIRE ({compteALebours}s)
              </span>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '10px' }}>Validation de votre ticket en cours... Ne quittez pas.</p>
            </div>
            
            {/* Lecteur vidéo simulé ou vidéo chargée du sponsor */}
            <div style={{ width: '100%', height: '280px', backgroundColor: '#1e293b', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '1px solid #334155' }}>
              {currentSponsor?.video ? (
                <video src={currentSponsor.video} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📺</div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#facc15' }}>{currentSponsor?.name || 'Sponsor Publicitaire'}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Espace de diffusion vidéo disponible pour l'annonceur.</p>
                </div>
              )}
            </div>

            <div style={{ width: '100%', textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '12px' }}>
              Propulsé par la régie publicitaire KADO 237
            </div>
          </div>
        )}

        {/* N'AFFICHER LE RESTE QUE SI LA VIDÉO NE TOURNE PAS */}
        {!enLectureVideo && (
          <>
            {/* 2. ÉCRAN D'ACCUEIL INITIAL (ÉTAPE 0) */}
            {etapeSponsor === 0 && (
              <div>
                <header style={{ textAlign: 'center', padding: '20px 0' }}>
                  <h1 style={{ fontSize: '42px', fontWeight: '900', margin: '0 0 5px 0', color: '#facc15', letterSpacing: '-1px' }}>🎁 KADO 237</h1>
                  <p style={{ fontSize: '16px', color: '#cbd5e1', margin: '0', fontWeight: '500' }}>Votre tombola gratuite • Des lots physiques réels à gagner</p>
                </header>

                <section style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px', borderRadius: '16px', marginBottom: '25px', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#facc15', fontSize: '15px', fontWeight: 'bold' }}>🎯 Règle de validation obligatoire</h3>
                  <p style={{ margin: 0, fontSize: '13.5px', color: '#94a3b8', lineHeight: '1.5' }}>
                    Pour valider votre présence au grand tirage, vous devez impérativement collecter votre ticket gratuit auprès de chacun de nos <strong style={{ color: '#fff' }}>5 partenaires</strong>. Le parcours complet prend moins d'une minute !
                  </p>
                </section>

                <button 
                  onClick={() => setEtapeSponsor(1)}
                  style={{ backgroundColor: '#2563eb', color: '#fff', padding: '16px', borderRadius: '12px', fontSize: '17px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.3)', width: '100%' }}
                >
                  🚀 Commencer le parcours (5 Tickets Gratuits)
                </button>

                <footer style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Nos Partenaires Officiels</span>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                    {sponsors.map(s => (
                      <div key={s.id} style={{ padding: '6px 12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '13px', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)' }}>{s.name || `Sponsor ${s.id}`}</div>
                    ))}
                  </div>
                </footer>
              </div>
            )}

            {/* 3. ÉCRAN DU TUNNEL D'ENGAGEMENT DES SPONSORS (ÉTAPES 1 À 5) */}
            {etapeSponsor >= 1 && etapeSponsor <= 5 && currentSponsor && (
              <div style={{ backgroundColor: currentSponsor.bg_color || '#1e293b', color: currentSponsor.text_color || '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                
                {/* Indicateur de Progression */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
                    🤝 Partenaire {etapeSponsor} sur 5
                  </span>
                  <span style={{ backgroundColor: '#facc15', color: '#000', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    Ticket gratuit {etapeSponsor}/5
                  </span>
                </div>

                {/* Espace Publicitaire de la Marque */}
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                  {currentSponsor.logo_url && (
                    <img src={currentSponsor.logo_url} alt={currentSponsor.name} style={{ maxHeight: '50px', maxWidth: '80%', objectFit: 'contain', marginBottom: '12px' }} />
                  )}
                  <h2 style={{ fontSize: '22px', margin: '0 0 10px 0', fontWeight: 'bold' }}>{currentSponsor.name}</h2>
                  <p style={{ fontSize: '15px', lineHeight: '1.4', margin: 0, opacity: 0.9 }}>
                    {currentSponsor.text || "Soutenez notre partenaire pour débloquer votre chance du jour !"}
                  </p>
                </div>

                {/* Formulaire Obligatoire */}
                <form onSubmit={handleValiderTicket} style={{ borderTop: '1px dashed rgba(255,255,255,0.2)', paddingTop: '20px' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', opacity: 0.9 }}>Votre numéro WhatsApp (Pour le tirage) :</label>
                    <input 
                      type="tel" 
                      placeholder="Ex: 695XXXXXX" 
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '16px', boxSizing: 'border-box' }} 
                      required 
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px', opacity: 0.9 }}>Choisissez votre numéro de chance (1 à 100) :</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100"
                      placeholder="Ex: 37" 
                      value={ticketChoisi} 
                      onChange={(e) => setTicketChoisi(e.target.value)} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '16px', boxSizing: 'border-box' }} 
                      required 
                    />
                  </div>

                  <button 
                    type="submit" 
                    style={{ width: '100%', padding: '15px', backgroundColor: '#fff', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                  >
                    🎬 Valider le ticket gratuit {etapeSponsor}
                  </button>
                </form>

              </div>
            )}

            {/* 4. ÉCRAN DE SUCCÈS GLOBAL (ÉTAPE 6) */}
            {etapeSponsor === 6 && (
              <div style={{ backgroundColor: '#10b981', color: '#fff', padding: '30px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 20px rgba(16,185,129,0.2)' }}>
                <div style={{ fontSize: '50px', marginBottom: '15px' }}>🎉</div>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>Félicitations !</h2>
                <p style={{ margin: '0 0 20px 0', fontSize: '15px', lineHeight: '1.5', color: '#ecfdf5' }}>
                  Vos 5 tickets gratuits ont été certifiés par nos sponsors. Votre numéro <strong style={{ color: '#fff' }}>{phoneNumber}</strong> est officiellement inscrit sur la liste du tirage au sort de cette semaine pour les lots physiques !
                </p>
                
                <div style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px', marginBottom: '25px', fontSize: '14px' }}>
                  🎫 Votre numéro de chance final : <strong>Ticket {ticketChoisi}</strong>
                </div>

                <button 
                  onClick={réinitialiserParcours}
                  style={{ backgroundColor: '#fff', color: '#10b981', padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', border: 'none', cursor: 'pointer', width: '100%' }}
                >
                  Fermer et revenir à l'accueil
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}
