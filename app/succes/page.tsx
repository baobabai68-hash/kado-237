'use client';

export default function SuccesPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#10b981', // Un beau vert succès
      fontFamily: 'sans-serif',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px 30px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        {/* Icône de validation géante */}
        <div style={{
          fontSize: '64px',
          marginBottom: '16px',
          animation: 'bounce 2s infinite'
        }}>
          ✅
        </div>

        <h1 style={{
          color: '#065f46',
          fontSize: '26px',
          margin: '0 0 12px 0',
          fontWeight: 'bold'
        }}>
          Inscription Validée !
        </h1>

        <p style={{
          color: '#374151',
          fontSize: '15px',
          lineHeight: '1.6',
          margin: '0 0 24px 0'
        }}>
          Félicitations, ton numéro de téléphone a été enregistré avec succès dans notre base de données. Tu participes officiellement au grand tirage au sort KADO 237 !
        </p>

        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#4b5563',
          lineHeight: '1.4',
          marginBottom: '24px'
        }}>
          💡 <strong>Rappel :</strong> Les gagnants seront contactés directement par appel sur le numéro enregistré. Reste connecté !
        </div>

        {/* Bouton pour revenir ou fermer */}
        <p style={{
          fontSize: '12px',
          color: '#9ca3af',
          margin: '0'
        }}>
          Tu peux maintenant fermer cette page en toute sécurité.
        </p>
      </div>
    </main>
  );
}
