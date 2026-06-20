'use client';

export default function TemoignagesPage() {
  const temoignages = [
    { nom: 'Jean P.', ville: 'Douala', texte: 'J\'ai gagné le téléphone, incroyable !' },
    { nom: 'Marie K.', ville: 'Yaoundé', texte: 'Merci KADO 237, j\'ai reçu mon transfert.' },
  ];

  return (
    <main style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#1e293b' }}>Ils ont gagné !</h1>
      <div style={{ display: 'grid', gap: '20px', maxWidth: '600px', margin: '0 auto' }}>
        {temoignages.map((t, i) => (
          <div key={i} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <p style={{ fontStyle: 'italic' }}>"{t.texte}"</p>
            <strong style={{ display: 'block', marginTop: '10px' }}>- {t.nom}, {t.ville}</strong>
          </div>
        ))}
      </div>
    </main>
  );
}
