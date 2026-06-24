'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState('#0d2240');
  const [textColor, setTextColor] = useState('#ffffff');
  const [video, setVideo] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState('');
  const [participations, setParticipations] = useState<any[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'KADO237') {
      setIsAuthenticated(true);
      fetchAdminData();
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const fetchAdminData = async () => {
    const { data: spData } = await supabase.from('sponsors').select('*').order('id', { ascending: true });
    if (spData) {
      setSponsors(spData);
      const sp1 = spData.find(s => s.id === 1);
      if (sp1) loadSponsorToForm(sp1);
    }
    fetchParticipations();
  };

  const fetchParticipations = async () => {
    const { data: partData } = await supabase.from('participations').select('*').order('created_at', { ascending: false });
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

  const handleSponsorChange = (id: number) => {
    setSelectedId(id);
    const sp = sponsors.find(s => s.id === id);
    if (sp) loadSponsorToForm(sp);
  };

  // FONCTION UNIVERSELLE POUR UPLOADER SUR SUPABASE STORAGE
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'media') setUploadingMedia(true);
    if (type === 'logo') setUploadingLogo(true);
    setMessage('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${selectedId}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Envoi dans le bucket public "sponsors-assets"
      const { error: uploadError } = await supabase.storage
        .from('sponsors-assets')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique
      const { data } = supabase.storage.from('sponsors-assets').getPublicUrl(filePath);
      
      if (type === 'media') setVideo(data.publicUrl);
      if (type === 'logo') setLogoUrl(data.publicUrl);
      
      setMessage(`${type === 'media' ? 'Média' : 'Logo'} téléversé avec succès !`);
    } catch (error: any) {
      setMessage(`Erreur upload : ${error.message}. Assurez-vous que le bucket public "sponsors-assets" existe sur Supabase.`);
    } finally {
      setUploadingMedia(false);
      setUploadingLogo(false);
    }
  };

  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('sponsors')
      .update({ name, text, bg_color: bgColor, text_color: textColor, video, logo_url: logoUrl })
      .eq('id', selectedId);

    setLoading(false);

    if (error) {
      setMessage(`Erreur : ${error.message}`);
    } else {
      setMessage('Configuration enregistrée avec succès !');
      const { data: spData } = await supabase.from('sponsors').select('*').order('id', { ascending: true });
      if (spData) setSponsors(spData);
    }
  };

  if (!isAuthenticated) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '360px' }}>
          <h2 style={{ margin: '0 0 20px 0', textAlign: 'center', color: '#facc15' }}>🔒 Connexion KADO 237</h2>
          <input type="password" placeholder="Mot de passe secret" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', marginBottom: '20px' }} required />
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Accéder</button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <header style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#1e3a8a' }}>🛠️ Panneau de Contrôle KADO 237</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Configurez vos médias (Vidéos, YouTube Shorts, Images, GIFs) et logos.</p>
        </header>

        <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1e3a8a' }}>💼 Configuration du Partenaire {selectedId}</h2>
          
          {message && (
            <div style={{ padding: '12px', backgroundColor: message.includes('Erreur') ? '#fee2e2' : '#dcfce7', color: message.includes('Erreur') ? '#991b1b' : '#166534', borderRadius: '6px', marginBottom: '20px' }}>
              {message}
            </div>
          )}

          <div style={{ marginBottom: '25px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Sélectionnez l'Étape à modifier :</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map((id) => (
                <button key={id} type="button" onClick={() => handleSponsorChange(id)} style={{ padding: '10px 20px', borderRadius: '8px', border: selectedId === id ? '2px solid #2563eb' : '1px solid #cbd5e1', backgroundColor: selectedId === id ? '#2563eb' : '#fff', color: selectedId === id ? '#fff' : '#1e293b', fontWeight: 'bold', cursor: 'pointer' }}>
                  Sponsor {id}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveSponsor}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Nom de l'entreprise :</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="Ex: Orange Cameroun" required />
            </div>

            {/* CHARGEMENT LOGO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Logo de la marque :</label>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} style={{ display: 'block', marginBottom: '8px' }} />
                {uploadingLogo && <span style={{ fontSize: '13px', color: '#2563eb' }}>Téléchargement du logo...</span>}
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Ou URL du logo :</label>
                <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} placeholder="S'affiche automatiquement après l'upload" />
              </div>
            </div>

            {/* CHARGEMENT MÉDIA PRINCIPAL (VIDÉO / GIF / IMAGE) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '8px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Fichier Publicitaire (Vidéo mp4, Image, GIF) :</label>
                <input type="file" accept="video/mp4,image/*" onChange={(e) => handleFileUpload(e, 'media')} style={{ display: 'block', marginBottom: '8px' }} />
                {uploadingMedia && <span style={{ fontSize: '13px', color: '#2563eb' }}>Téléchargement du fichier média...</span>}
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Ou lien externe (Ex: YouTube Shorts) :</label>
                <input type="text" value={video} onChange={(e) => setVideo(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} placeholder="Collez ici si c'est un lien YouTube Shorts" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Couleur de Fond :</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer' }} />
                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '6px' }}>Couleur du Texte :</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer' }} />
                  <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Annonce texte (s'affiche tout en bas) :</label>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="Ex: Regardez notre spot pour gagner des volumes internet !" required />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
              {loading ? 'Enregistrement...' : `Sauvegarder la configuration complète du Sponsor ${selectedId}`}
            </button>
          </form>
        </section>

        {/* LISTE DES PARTICIPATIONS */}
        <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#1e3a8a' }}>📊 Liste des Participations</h2>
            <button onClick={fetchParticipations} style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🔄 Actualiser</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Sponsor</th>
                  <th style={{ padding: '12px' }}>Ticket</th>
                  <th style={{ padding: '12px' }}>Numéro</th>
                </tr>
              </thead>
              <tbody>
                {participations.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Aucune participation.</td></tr>
                ) : (
                  participations.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>{new Date(p.created_at).toLocaleString('fr-FR')}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>Sponsor {p.sponsor_id}</td>
                      <td style={{ padding: '12px' }}>🎫 Ticket {p.ticket_choisi}</td>
                      <td style={{ padding: '12px', color: '#2563eb', fontWeight: 'bold' }}>{p.phone_number}</td>
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
