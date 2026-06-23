'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminDashboard() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  
  // États pour la gestion du contenu
  const [sponsorId, setSponsorId] = useState('1');
  const [nomSponsor, setNomSponsor] = useState('');
  const [textePublicitaire, setTextePublicitaire] = useState('');
  const [couleurFond, setCouleurFond] = useState('#0d2240');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // État pour stocker la liste des numéros enregistrés
  const [participations, setParticipations] = useState<any[]>([]);

  // Vérification de sécurité locale
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === 'KADO237') {
      setAuth(true);
    } else {
      alert('Mot de passe administrateur incorrect.');
    }
  };

  // Charger les données du sponsor sélectionné depuis Supabase
  useEffect(() => {
    if (!auth) return;

    async function loadSponsorData() {
      setLoading(true);
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('id', parseInt(sponsorId, 10))
        .single();

      if (data && !error) {
        setNomSponsor(data.name || '');
        setTextePublicitaire(data.text || '');
        setCouleurFond(data.bg_color || '#0d2240');
      }
      setLoading(false);
    }

    loadSponsorData();
  }, [sponsorId, auth]);

  // Charger la liste des numéros enregistrés (Participations)
  const loadParticipations = async () => {
    const { data, error } = await supabase
      .from('participations')
      .select('*')
      .order('date_participation', { ascending: false });

    if (data && !error) {
      setParticipations(data);
    }
  };

  useEffect(() => {
    if (auth) {
      loadParticipations();
    }
  }, [auth]);

  // Sauvegarder les modifications textuelles et couleurs
  const handleSaveData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('Mise à jour en cours...');

    const { error } = await supabase
      .from('sponsors')
      .update({
        name: nomSponsor,
        text: textePublicitaire,
        bg_color: couleurFond
      })
      .eq('id', parseInt(sponsorId, 10));

    if (error) {
      setStatusMessage(`Erreur : ${error.message}`);
    } else {
      setStatusMessage('Modification enregistrée avec succès !');
    }
    setLoading(false);
  };

  // Gérer l'envoi de fichiers (Vidéo ou Logo) vers le Storage Supabase
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'video' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatusMessage(`Téléversement du ${fileType} en cours...`);

    const fileExtension = file.name.split('.').pop();
    const fileName = `sponsor_${sponsorId}_${fileType}_${Date.now()}.${fileExtension}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medias')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      setStatusMessage(`Erreur d'envoi : ${uploadError.message}`);
      setLoading(false);
      return;
    }

    const { data: linkData } = supabase.storage.from('medias').getPublicUrl(fileName);
    const publicUrl = linkData.publicUrl;

    const updatePayload = fileType === 'video' ? { video: publicUrl } : { logo_url: publicUrl };
    
    const { error: dbError } = await supabase
      .from('sponsors')
      .update(updatePayload)
      .eq('id', parseInt(sponsorId, 10));

    if (dbError) {
      setStatusMessage(`Fichier stocké mais erreur BDD : ${dbError.message}`);
    } else {
      setStatusMessage(`Le ${fileType} a été mis à jour avec succès sur le site !`);
    }
    setLoading(false);
  };

  if (!auth) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', fontFamily: 'sans-serif', padding: '20px' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '360px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#1e293b', marginTop: '0', textAlign: 'center' }}>🔒 Espace Admin KADO 237</h2>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: '#475569' }}>Mot de passe secret</label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} required />
          </div>
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Se connecter</button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* SECTION 1 : GESTION DES SPONSORS */}
        <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <header style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
            <h1 style={{ margin: '0', color: '#1e293b', fontSize: '24px' }}>🎛️ Panneau de Contrôle KADO 237</h1>
            <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '14px' }}>Modifie le contenu de ton application à la volée, sans coder.</p>
          </header>

          {statusMessage && (
            <div style={{ padding: '12px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center', fontSize: '14px' }}>
              {statusMessage}
            </div>
          )}

          <div style={{ marginBottom: '24px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>Choisir le Sponsor à modifier :</label>
            <select value={sponsorId} onChange={(e) => setSponsorId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '16px', backgroundColor: '#fff' }}>
              <option value="1">Sponsor Étape 1</option>
              <option value="2">Sponsor Étape 2</option>
              <option value="3">Sponsor Étape 3</option>
              <option value="4">Sponsor Étape 4</option>
              <option value="5">Sponsor Étape 5</option>
            </select>
          </div>

          <form onSubmit={handleSaveData} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Nom de l'entreprise / Marque</label>
              <input type="text" value={nomSponsor} onChange={(e) => setNomSponsor(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} required placeholder="Ex: MTN Cameroun" />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Texte ou Message Publicitaire</label>
              <textarea value={textePublicitaire} onChange={(e) => setTextePublicitaire(e.target.value)} rows={4} style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box' }} required placeholder="Écris l'annonce ici..." />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Couleur d'ambiance de la page</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input type="color" value={couleurFond} onChange={(e) => setCouleurFond(e.target.value)} style={{ width: '50px', height: '40px', border: 'none', cursor: 'pointer' }} />
                <span style={{ fontSize: '14px', color: '#64748b' }}>Couleur de fond pour ce sponsor</span>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ padding: '14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Traitement...' : '💾 Sauvegarder les Textes & Couleurs'}
            </button>
          </form>

          <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: '0', color: '#1e293b' }}>📁 Fichiers multimédias</h3>
            <input type="file" accept="image/*" disabled={loading} onChange={(e) => handleFileUpload(e, 'logo')} />
            <input type="file" accept="video/mp4" disabled={loading} onChange={(e) => handleFileUpload(e, 'video')} />
          </div>
        </div>

        {/* SECTION 2 : VISUALISATION DES NUMÉROS REÇUS */}
        <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: '0', color: '#1e293b', fontSize: '20px' }}>📈 Numéros enregistrés ({participations.length})</h2>
            <button onClick={loadParticipations} style={{ padding: '8px 14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>🔄 Actualiser</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', color: '#64748b' }}>Numéro Mobile</th>
                  <th style={{ padding: '12px', color: '#64748b' }}>Sponsor Étape</th>
                  <th style={{ padding: '12px', color: '#64748b' }}>Ticket Choisi</th>
                  <th style={{ padding: '12px', color: '#64748b' }}>Date / Heure</th>
                </tr>
              </thead>
              <tbody>
                {participations.length > 0 ? (
                  participations.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#1e293b' }}>{p.phone_number}</td>
                      <td style={{ padding: '12px' }}>Étape {p.sponsor_id}</td>
                      <td style={{ padding: '12px' }}>🎫 Ticket {p.ticket_choisi}</td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '12px' }}>{new Date(p.date_participation).toLocaleString('fr-FR')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Aucune participation enregistrée pour le moment.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
