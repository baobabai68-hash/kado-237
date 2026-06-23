'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function SponsorPage() {
  const params = useParams();
  const router = useRouter();
  const currentId = parseInt(params.id as string, 10) || 1;

  // États pour stocker les données du sponsor actif
  const [sponsor, setSponsor] = useState<any>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Charger les données du sponsor depuis Supabase au chargement de la page
  useEffect(() => {
    async function fetchSponsor() {
      setLoading(true);
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('id', currentId)
        .single();

      if (data && !error) {
        setSponsor(data);
      } else {
        // Valeurs de secours si la table est vide pour ce sponsor
        setSponsor({
          name: `Sponsor Étape ${currentId}`,
          text: 'Regardez la publicité pour valider votre ticket.',
          bg_color: '#0d2240',
          video: ''
        });
      }
      setLoading(false);
    }

    fetchSponsor();
  }, [currentId]);

  const handleValidation = async () => {
    // Validation locale stricte du numéro camerounais (9 chiffres, commence par 6)
    const phoneRegex = /^6[5-9][0-9]{7}$/;
    if (!phoneRegex.test(phone)) {
      return alert("Veuillez entrer un numéro MTN, Orange ou Nexttel valide à 9 chiffres (commençant par 6).");
    }

    setSaving(true);

    // 2. Enregistrer la participation dans la table des tickets/participations
    const { error } = await supabase
      .from('participations')
      .insert([
        { 
          phone_number: phone, 
          sponsor_id: currentId,
          ticket_choisi: selectedCard,
          date_participation: new Date().toISOString()
        }
      ]);

    if (error) {
      alert("Erreur lors de l'enregistrement : " + error.message);
      setSaving(false);
      return;
    }

    // 3. Déclenchement de la simulation de vidéo récompensée
    alert("Vidéo récompensée lancée ! Veuillez la regarder jusqu'au bout.");
    
    setTimeout(() => {
      setSaving(false);
      if (currentId < 5) {
        // Redirection vers le sponsor suivant
        router.push(`/sponsor/${currentId + 1}`);
      } else {
        // Si c'est le 5ème, direction la page de succès
        router.push('/succes');
      }
    }, 2000); // Temps de simulation de l'action
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d2240', color: 'white', fontFamily: 'sans-serif' }}>
        <h3>Chargement du sponsor publicitaire...</h3>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', padding: '20px', backgroundColor: sponsor?.bg_color || '#0d2240', color: 'white', fontFamily: 'sans-serif', transition: 'background-color 0.5s' }}>
      <h2 style={{ textAlign: 'center', margin: '10px 0 20px 0' }}>{sponsor?.name} (Étape {currentId} / 5)</h2>
      
      {/* Espace d'annonce / Short publicitaire du sponsor */}
      <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto 20px auto', backgroundColor: '#000000', borderRadius: '12px', overflow: 'hidden', aspectRatio: '16/9' }}>
        {sponsor?.video ? (
          <video src={sponsor.video} controls autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '14px' }}>
            [Aucune vidéo configurée pour ce sponsor]
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto 20px auto', fontSize: '15px', lineHeight: '1.4' }}>
        {sponsor?.text}
      </p>

      {/* Grille de sélection des tickets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '500px', margin: '0 auto 30px auto' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} 
            onClick={() => !saving && setSelectedCard(i)}
            style={{ 
              height: '110px', 
              backgroundColor: selectedCard === i ? '#f59e0b' : '#ffffff', 
              color: '#000000', 
              borderRadius: '12px', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: selectedCard === i ? '3px solid #ffffff' : 'none',
              transition: 'all 0.2s'
            }}>
            <span>🎫</span>
            <span style={{ fontSize: '14px', marginTop: '4px' }}>{selectedCard === i ? "Choisi !" : `Ticket ${i}`}</span>
          </div>
        ))}
      </div>

      {/* Saisie du numéro au dos du ticket sélectionné */}
      {selectedCard && (
        <div style={{ backgroundColor: '#ffffff', color: '#1e293b', padding: '24px', borderRadius: '16px', maxWidth: '500px', margin: '0 auto', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
            📱 Numéro Mobile Money pour vous contacter en cas de gain :
          </label>
          <input 
            type="tel" 
            placeholder="Ex: 677123456" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            disabled={saving}
            style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '16px', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' }} 
          />
          <button 
            onClick={handleValidation} 
            disabled={saving}
            style={{ width: '100%', padding: '14px', backgroundColor: saving ? '#94a3b8' : '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Enregistrement...' : '🎬 Valider la carte & Lancer la vidéo'}
          </button>
        </div>
      )}
    </main>
  );
}
