'use client';
import { useState } from 'react';

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');

  if (!auth) return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Accès Admin</h1>
      <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
      <button onClick={() => pass === 'KADO237' ? setAuth(true) : alert('Non !')}>Entrer</button>
    </div>
  );

  return (
    <main style={{ padding: '20px' }}>
      <h1>Tableau de Bord Admin</h1>
      <p>Ici, tu pourras modifier tes sponsors très prochainement.</p>
      {/* C'est ici que nous ajouterons les formulaires d'upload */}
    </main>
  );
}
