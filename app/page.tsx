'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* En-tête */}
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', color: '#1e3a8a', fontWeight: 'bold' }}>KADO 237</h1>
        <p style={{ color: '#475569' }}>Remerciements à nos partenaires officiels</p>
      </header>

      {/* Espace Remerciements (Logos) */}
      <section style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
        gap: '20px', 
        marginBottom: '50px',
        maxWidth: '800px',
        margin: '0 auto 50px auto'
      }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} style={{ 
            padding: '20px', 
            backgroundColor: '#fff', 
            borderRadius: '12px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            LOGO {s}
          </div>
        ))}
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
            cursor: 'pointer'
          }}
        >
          Commencer ma participation
        </button>
      </div>
    </main>
  );
}
