'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Détecter si l'utilisateur vient de finir tout le parcours
  const isCompleted = searchParams.get('status') === 'completed';

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

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#0d2240', color: '#fff' }}>Chargement des cadeaux du jour...</div>;
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0d2240', color: '#ffffff', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* EN-TÊTE PRINCIPAL */}
        <header style={{ textAlign: 'center', padding: '40px 0 20px 0' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#facc15' }}>🎁 KADO 237</h1>
          <p style={{ fontSize: '18px', color: '#cbd5e1', margin: '0' }}>Votre tombola 100% gratuite via Mobile Money</p>
        </header>

        {/* MESSAGE DE SUCCÈS GLOBAL (SI PARCOURS FINI) */}
        {isCompleted && (
          <div style={{ backgroundColor: '#10b981', color: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '24px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
            <h3 style={{ margin: '0 0 5px 0' }}>🎉 Félicitations !</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>Vos 5 tickets journaliers sont validés. Vous êtes officiellement éligible pour le grand tirage de ce soir !</p>
          </div>
        )}

        {/* ZONE STRATÉGIQUE : L'ENGAGEMENT SUBTIL */}
        <section style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: '16px', marginBottom: '30px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#facc15', fontSize: '16px' }}>💡 Règle d'éligibilité au tirage</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' }}>
            Pour garantir la validation de vos chances de gain, veillez à récupérer vos <strong style={{ color: '#fff' }}>5 tickets gratuits</strong> auprès de chacun de nos partenaires ci-dessous. Le système valide automatiquement votre participation globale dès la fin du parcours.
          </p>
        </section>

        {/* BOUTON D'ACTION PRINCIPAL */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <button 
            onClick={() => router.push('/sponsor/1')}
            style={{ backgroundColor: '#2563eb', color: '#fff', padding: '16px 32px', borderRadius: '50px', fontSize: '18px', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37,99,235,0.4)', width: '100%' }}
          >
            🚀 Commencer à collecter mes Tickets
          </button>
        </div>

        {/* SECTION DE REMERCIEMENT OFFICIELLE DES SPONSORS */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px' }}>
          <h3 style={{ fontSize: '15px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', marginBottom: '20px' }}>
            🤝 Propulsé avec la confiance de nos partenaires
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {sponsors.map((sp) => (
              <div 
                key={sp.id} 
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              >
                {sp.logo_url ? (
                  <img src={sp.logo_url} alt={sp.name} style={{ height: '40px', maxWidth: '100%', objectFit: 'contain', marginBottom: '10px' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: sp.bg_color || '#2563eb', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>
                    {sp.id}
                  </div>
                )}
                <span style={{ fontSize: '14px', fontWeight: 'medium', color: '#e2e8f0' }}>{sp.name || `Sponsor Étape ${sp.id}`}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
