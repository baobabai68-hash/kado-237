'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function Home() {
  const router = useRouter();
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger la liste complète des sponsors au démarrage
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

  return (
    <main style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* En-tête */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', color: '#1e3a8a', fontWeight: 'bold' }}>KADO 237</h1>
        <p style={{ color: '#475569' }}>Remerciements à nos partenaires officiels</p>
      </header>

      {/* Espace Remerciements (Logos Dynamiques) */}
      <section style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '20px', 
        marginBottom: '50px',
        maxWidth: '800px',
        margin: '0 auto 50px auto'
      }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>
            Chargement des partenaires...
          </div>
        ) : sponsors.length > 0 ? (
          sponsors.map((s) => (
            <div key={s.id} style={{ 
              padding: '20px', 
              backgroundColor: '#fff', 
              borderRadius: '12px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#1e293b',
              borderTop: `4px solid ${s.bg_color || '#2563eb'}`
            }}>
              {s.logo_url ? (
                <img src={s.logo_url} alt={s.name} style={{ maxWidth: '100%', maxHeight: '50px', objectFit: 'contain' }} />
              ) : (
                <span>{s.name}</span>
              )}
            </div>
          ))
        ) : (
          // Secours si aucune ligne n'est encore créée
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
              Partenaire {i}
            </div>
          ))
        )}
      </section>

      {/* Bouton de démarrage */}
      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={() => router.push('/sponsor/1')}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '50px',
            fontSize: '18px',
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)'
          }}
        >
          Commencer ma participation
        </button>
      </div>
    </main>
  );
}
