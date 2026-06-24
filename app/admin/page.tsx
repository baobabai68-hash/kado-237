'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // États pour la gestion des sponsors
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState('#0d2240');
  const [textColor, setTextColor] = useState('#ffffff');
  const [video, setVideo] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // État pour les participations
  const [participations, setParticipations] = useState<any[]>([]);

  // Vérifier le mot de passe
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'KADO237') {
      setIsAuthenticated(true);
      fetchAdminData();
    } else {
      alert('Mot de passe incorrect');
    }
  };

  // Charger les données de l'admin
  const fetchAdminData = async () => {
    // 1. Charger les sponsors
    const { data: spData } = await supabase.from('sponsors').select('*').order('id', { ascending: true });
    if (spData) {
      setSponsors(spData);
      // Charger le sponsor 1 par défaut dans le formulaire
      const sp1 = spData.find(s => s.id === 1);
      if (sp1) loadSponsorToForm(sp1);
    }

    // 2. Charger les participations
    fetchParticipations();
  };

  const fetchParticipations = async () => {
    const { data: partData } = await supabase
      .from('participations')
      .select('*')
      .order('created_at', { ascending: false });
    if (partData) setParticipations(partData);
  };

  const loadSponsorToForm = (sp: any) => {
    setName(sp.name || '');
    setText(sp.text || '');
    setBgColor(sp.bg_color || '#0d2240');
    setTextColor(sp.text_color || '#ffffff');
    setVideo(sp.video || '');
    setLogoUrl(sp.logo_url || '');
  };

  // Changer de sponsor à modifier dans le sélecteur
  const handleSponsorChange = (id: number) => {
    setSelectedId(id);
    const sp = sponsors.find(s => s.id === id);
    if (sp) {
      loadSponsorToForm(sp);
    } else {
      setName('');
      setText('');
      setBgColor('#0d2240');
      setTextColor('#ffffff');
      setVideo('');
      setLogoUrl('');
    }
  };

  // Sauvegarder les modifications
  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('sponsors')
      .update({
        name,
        text,
        bg_color: bgColor,
        text_color: textColor,
        video,
        logo_url: logoUrl
      })
      .eq('id', selectedId);

    setLoading(false);

    if (error) {
      setMessage(`Erreur : ${error.message}`);
    } else {
      setMessage('Modification enregistrée avec succès !');
      // Rafraîchir la liste locale des sponsors
      const { data: spData } = await supabase.from('sponsors').select('*').order('id', { ascending: true });
      if (spData) setSponsors(spData);
    }
  };

  if (!isAuthenticated) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', width: '100%', maxWidth: '360px' }}>
          <h2 style={{ margin: '0 0 20px 0', textAlign: 'center', color: '#facc15' }}>🔒 Connexion KADO 237</h2>
          <input
            type="password"
            placeholder="Mot de passe secret"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', fontSize: '16px', boxSizing: 'border-box', marginBottom: '20px' }}
            required
          />
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
            Accéder au tableau de bord
          </button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#1e3a8a' }}>🛠️ Panneau de Contrôle KADO 237</h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Gérez vos 5 sponsors et suivez les participations en direct.</p>
          </div>
        </header>

        {/* SECTION 1 : GESTION DES SPONSORS */}
        <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1e3a8a', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>💼 Configuration des Partenaires</h2>
          
          {message && (
            <div style={{ padding: '12px', backgroundColor: message.includes('Erreur') ? '#fee2e2' : '#dcfce7', color: message.includes('Erreur') ? '#991b1b' : '#166534', borderRadius: '6px', marginBottom: '20px', fontWeight: '500' }}>
              {message}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>1. Sélectionnez l'Étape à configurer :</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSponsorChange(id)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: selectedId === id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    backgroundColor: selectedId === id ? '#2563eb' : '#fff',
                    color: selectedId === id ? '#fff' : '#1e293b',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Sponsor {id}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveSponsor}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Nom de la marque :</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="Ex: MTN Cameroun" required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Lien du Média (Lien Direct, YouTube ou Short) :</label>
                <input type="text" value={video} onChange={(e) => setVideo(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="Lien .mp4, YouTube, image ou GIF" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Couleur de Fond (Background) :</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: '50px', height: '40px', padding: '0', border: 'none', cursor: 'pointer' }} />
                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Couleur du Texte :</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: '50px', height: '40px', padding: '0', border: 'none', cursor: 'pointer' }} />
                  <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>URL du Logo de la marque :</label>
                <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="Lien de l'image du logo pour l'accueil" />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Texte d'accompagnement ou slogan :</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'sans-serif' }} placeholder="Ex: Regardez notre spot pour gagner des volumes internet !" required />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
              {loading ? 'Enregistrement...' : `Sauvegarder l'Étape ${selectedId}`}
            </button>
          </form>
        </section>

        {/* SECTION 2 : VISUALISATION DES NUMÉROS DE TÉLÉPHONE */}
        <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#1e3a8a' }}>📊 Liste des Participations en Direct</h2>
            <button onClick={fetchParticipations} style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
              🔄 Actualiser
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '12px', fontSize: '14px' }}>Date / Heure</th>
                  <th style={{ padding: '12px', fontSize: '14px' }}>Étape Sponsor</th>
                  <th style={{ padding: '12px', fontSize: '14px' }}>Ticket Choisi</th>
                  <th style={{ padding: '12px', fontSize: '14px' }}>Numéro Mobile Money</th>
                </tr>
              </thead>
              <tbody>
                {participations.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '15px' }}>Aucune participation enregistrée pour le moment.</td>
                  </tr>
                ) : (
                  participations.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(p.created_at).toLocaleString('fr-FR')}</td>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: 'bold' }}>Sponsor {p.sponsor_id}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>🎫 Ticket {p.ticket_choisi}</td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#2563eb', fontWeight: 'bold' }}>{p.phone_number}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}
