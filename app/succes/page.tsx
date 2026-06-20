'use client';

export default function SuccesPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b981', color: 'white', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', color: '#1e293b', padding: '30px', borderRadius: '16px', textAlign: 'center', maxWidth: '400px' }}>
        <h1 style={{ color: '#065f46' }}>Participation Enregistrée !</h1>
        <p>Tes tickets ont bien été validés pour le tirage au sort quotidien.</p>
        <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
          <strong>Comment savoir si tu as gagné ?</strong>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>Les résultats seront publiés chaque soir à 20h sur nos réseaux sociaux et les gagnants seront contactés par appel direct.</p>
        </div>
      </div>
    </main>
  );
}
