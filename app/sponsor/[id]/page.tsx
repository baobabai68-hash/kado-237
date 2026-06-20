'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function SponsorPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [phone, setPhone] = useState('');

  const handleValidation = () => {
    if (phone.length < 9) return alert("Saisissez un numéro valide");
    // Lancement de la "Vidéo récompensée" (simulation)
    alert("Vidéo récompensée lancée !");
    router.push('/sponsor/' + (parseInt(params.id as string) + 1));
  };

  return (
    <main style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#0d2240', color: 'white' }}>
      <h2 style={{ textAlign: 'center' }}>Sponsor Étape {params.id}</h2>
      
      {/* Espace Shorts/Annonces du sponsor */}
      <div style={{ height: '200px', backgroundColor: '#333', marginBottom: '20px', borderRadius: '10px' }} />

      {/* Grille de tickets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '30px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} 
            onClick={() => setSelectedCard(i)}
            style={{ height: '100px', backgroundColor: '#fff', color: '#000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {selectedCard === i ? "Gratte-moi !" : "Ticket"}
          </div>
        ))}
      </div>

      {/* Saisie numéro au dos du ticket choisi */}
      {selectedCard && (
        <div style={{ backgroundColor: 'white', color: 'black', padding: '20px', borderRadius: '10px' }}>
          <input type="tel" placeholder="Numéro Mobile Money" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
          <button onClick={handleValidation} style={{ width: '100%', padding: '15px', backgroundColor: 'green', color: 'white', border: 'none' }}>Valider la carte</button>
        </div>
      )}
    </main>
  );
}
