'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // États Sponsors
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState('#0d2240');
  const [textColor, setTextColor] = useState('#ffffff');
  const [video, setVideo] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  // États Tirage & Gestion
  const [participations, setParticipations] = useState<any[]>([]);
  const [gagnantsSemaine, setGagnantsSemaine] = useState<any[]>([]);
  const [tirageJour, setTirageJour] = useState('Lundi');
  const [gagnantTire, setGagnantTire] = useState<any>(null);
  const [semaineLabel, setSemaineLabel] = useState('Semaine Prochaine');

  // États Témoignages
  const [nomGagnant, setNomGagnant] = useState('');
  const [ville, setVille] = useState('');
  const [montant, setMontant] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [listTemoignages, setListTemoignages] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingTemoignage, setUploadingTemoignage] = useState(false);
  const [message, setMessage] = useState('');

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
    // Sponsors
    const { data: spData } = await supabase.from('sponsors').select('*').order('id', { ascending: true });
    if (spData) {
      setSponsors(spData);
      const sp1 = spData.find(s => s.id === 1);
      if (sp1) loadSponsorToForm(sp1);
    }
    // Participations
    fetchParticipations();
    // Gagnants enregistrés
    fetchGagnants();
    // Témoignages
    fetchTemoignages();

    // Définir automatiquement le label de la semaine en cours
    const d = new Date();
    setSemaineLabel(`Semaine ${getWeekNumber(d)} - ${d.getFullYear()}`);
  };

  // Calcul du numéro de la semaine pour l'archivage
  function getWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  const fetchParticipations = async () => {
    const { data: partData } = await supabase.from('participations').select('*').order('created_at', { ascending: false });
    if (partData) setParticipations(partData);
  };

  const fetchGagnants = async () => {
    const { data: gData } = await supabase.from('gagnants').select('*').order('created_at', { ascending: false }).limit(20);
    if (gData) setGagnantsSemaine(gData);
  };

  const fetchTemoignages = async () => {
    const { data: tData } = await supabase.from('temoignages').select('*').order('created_at', { ascending: false });
    if (tData) setListTemoignages(tData);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'logo' | 'temoignage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'media') setUploadingMedia(true);
    if (type === 'logo') setUploadingLogo(true);
    if (type === 'temoignage') setUploadingTemoignage(true);
    setMessage('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('sponsors-assets')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('sponsors-assets').getPublicUrl(fileName);
      
      if (type === 'media') setVideo(data.publicUrl);
      if (type === 'logo') setLogoUrl(data.publicUrl);
      if (type === 'temoignage') setMediaUrl(data.publicUrl);
      
      setMessage(`Fichier ${type} téléversé avec succès !`);
    } catch (error: any) {
      setMessage(`Erreur upload : ${error.message}`);
    } finally {
      setUploadingMedia(false);
      setUploadingLogo(false);
      setUploadingTemoignage(false);
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
    if (error) setMessage(`Erreur : ${error.message}`);
    else {
      setMessage('Configuration du sponsor enregistrée !');
      const { data: spData } = await supabase.from('sponsors').select('*').order('id', { ascending: true });
      if (spData) setSponsors(spData);
    }
  };

  // FONCTION DU TIRAGE AU SORT ALÉATOIRE
  const handleLancerTirage = () => {
    if (participations.length === 0) {
      alert("Aucune participation enregistrée pour le moment. Impossible de faire un tirage.");
      return;
    }
    // Sélectionner une ligne au hasard dans le tableau des participations locales
    const randomIndex = Math.floor(Math.random() * participations.length);
    const selection = participations[randomIndex];
    setGagnantTire(selection);
  };

  // ENREGISTRER LE GAGNANT SÉLECTIONNÉ
  const handleValiderGagnant = async () => {
    if (!gagnantTire) return;

    const { error } = await supabase
      .from('gagnants')
      .insert([{
        jour_semaine: tirageJour,
        phone_number: gagnantTire.phone_number,
        ticket_choisi: gagnantTire.ticket_choisi,
        semaine_annee: semaineLabel
      }]);

    if (error) {
      alert(`Erreur lors de l'enregistrement : ${error.message}`);
    } else {
      alert(`Gagnant du ${tirageJour} enregistré avec succès !`);
      setGagnantTire(null);
      fetchGagnants();
    }
  };

  // PURGE COMPLÈTE DE FIN DE SEMAINE (SÉCURITÉ ANTI-SATURATION)
  const handlePurgeHebdomadaire = async () => {
    const confirmation = window.confirm(
      "⚠️ ATTENTION !\n\nCette action va SUPPRIMER DEFINITIVEMENT toutes les participations de la base de données pour démarrer la nouvelle semaine.\n\nAssurez-vous d'avoir bien effectué vos 6 tirages de la semaine avant de valider. Continuer ?"
    );

    if (!confirmation) return;

    // Supprimer toutes les lignes de la table participations
    const { error } = await supabase
      .from('participations')
      .delete()
      .neq('phone_number', '0000'); // Astuce SQL pour cibler toutes les lignes

    if (error) {
      alert(`Erreur lors du nettoyage : ${error.message}`);
    } else {
      alert("🧹 Base de données nettoyée avec succès ! Prête pour la nouvelle semaine.");
      fetchParticipations();
    }
  };

  // ENREGISTRER UN TÉMOIGNAGE
  const handleAddTemoignage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomGagnant || !montant) return;

    const { error } = await supabase
      .from('temoignages')
      .insert([{
        nom_gagnant: nomGagnant,
        ville,
        montant_gagne: montant,
        media_url: mediaUrl,
        commentaire
      }]);

    if (error) {
      alert(`Erreur : ${error.message}`);
    } else {
      setNomGagnant(''); setVille(''); setMontant(''); setMediaUrl(''); setCommentaire('');
      alert("Témoignage ajouté ! La base conserve uniquement les 100 derniers.");
      fetchTemoignages();
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
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <header style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#1e3a8a' }}>🛠️ Panneau Général KADO 237</h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Gestion durable, tirages et rotation de la plateforme.</p>
          </div>
          {/* BOUTON DE PURGE HEBDOMADAIRE */}
          <button onClick={handlePurgeHebdomadaire} style={{ padding: '12px 20px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(220, 38, 38, 0.2)' }}>
            🧹 Purge & Remise à Zéro (Fin de Semaine)
          </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
          
          {/* SECTION CONTROLE DES TIRAGES (HAUT DE PAGE) */}
          <section style={{ backgroundColor: '#eff6ff', padding: '24px', borderRadius: '12px', border: '2px solid #bfdbfe' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#1e40af' }}>🎲 Module de Tirage au Sort</h2>
            <p style={{ color: '#475569', marginTop: 0, marginBottom: '20px' }}>Sélectionnez un jour de la semaine pour attribuer son kado.</p>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>1. Jour Concerné :</label>
                <select value={tirageJour} onChange={(e) => setTirageJour(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '15px', fontWeight: 'bold' }}>
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Identifiant Période :</label>
                <input type="text" value={semaineLabel} onChange={(e) => setSemaineLabel(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ alignSelf: 'flex-end' }}>
                <button type="button" onClick={handleLancerTirage} style={{ padding: '11px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
                  ⚡ Lancer le Tirage Aléatoire
                </button>
              </div>
            </div>

            {/* RÉSULTAT DU TIRAGE FLASH */}
            {gagnantTire && (
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '2px dashed #2563eb', textAlign: 'center', animation: 'fadeIn 0.3s ease', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#16a34a' }}>🎉 NUMÉRO SÉLECTIONNÉ !</h3>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', margin: '10px 0' }}>{gagnantTire.phone_number}</p>
                <p style={{ color: '#64748b', margin: 0 }}>Ticket choisi : 🎫 T-{gagnantTire.ticket_choisi} | Étape franchie lors du tirage : Sponsor {gagnantTire.sponsor_id}</p>
                
                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button onClick={handleValiderGagnant} style={{ padding: '8px 16px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    ✅ Enregistrer comme Gagnant du {tirageJour}
                  </button>
                  <button onClick={() => setGagnantTire(null)} style={{ padding: '8px 16px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* AFFICHAGE DES 6 GAGNANTS DE LA SEMAINE */}
            <h4 style={{ margin: '20px 0 10px 0', color: '#1e40af' }}>🏆 Derniers gagnants officiels enregistrés :</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
              {gagnantsSemaine.slice(0, 6).map((g, idx) => (
                <div key={idx} style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #dbeafe' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' }}>{g.jour_semaine}</span>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', margin: '4px 0' }}>{g.phone_number}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{g.semaine_annee} (Ticket {g.ticket_choisi})</div>
                </div>
              ))}
            </div>
          </section>

          {/* AJOUT DE TÉMOIGNAGES (PHOTOS/VIDÉOS EN TOUTE LÉGÈRETÉ) */}
          <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#1e3a8a' }}>📸 Publier un Témoignage Reçu (Max 100)</h2>
            <p style={{ color: '#64748b', marginTop: 0, marginBottom: '20px', fontSize: '14px' }}>Permet aux visiteurs de voir les preuves en images. Les plus anciens s'effacent automatiquement au-delà de 100.</p>

            <form onSubmit={handleAddTemoignage} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Prénom / Nom du gagnant :</label>
                <input type="text" value={nomGagnant} onChange={(e) => setNomGagnant(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="Ex: Marc de Douala" required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Montant / Cadeau gagné :</label>
                <input type="text" value={montant} onChange={(e) => setMontant(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="Ex: 25 000 FCFA" required />
              </div>
              <div style={{ gridColumn: 'span 2', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Photo ou Vidéo du Gagnant :</label>
                <input type="file" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, 'temoignage')} style={{ marginBottom: '6px' }} />
                {uploadingTemoignage && <div style={{ fontSize: '13px', color: '#2563eb' }}>Téléchargement du média de preuve...</div>}
                <input type="text" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', mt: 1 }} placeholder="URL du fichier chargé" />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Commentaire ou Slogan :</label>
                <input type="text" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} placeholder="Ex: 'Merci à KADO 237, j'ai bien reçu mon dépôt Mobile Money !'" />
              </div>
              <button type="submit" style={{ gridColumn: 'span 2', padding: '12px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Posté le témoignage sur le site
              </button>
            </form>
          </section>

          {/* CONFIGURATION DES SPONSORS (ANCIEN MODULE COMBINÉ) */}
          <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1e3a8a' }}>💼 Configuration Individuelle des 5 Sponsors</h2>
            
            {message && (
              <div style={{ padding: '12px', backgroundColor: message.includes('Erreur') ? '#fee2e2' : '#dcfce7', color: message.includes('Erreur') ? '#991b1b' : '#166534', borderRadius: '6px', marginBottom: '20px' }}>
                {message}
              </div>
            )}

            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5].map((id) => (
                  <button key={id} type="button" onClick={() => handleSponsorChange(id)} style={{ padding: '10px 16px', borderRadius: '8px', border: selectedId === id ? '2px solid #2563eb' : '1px solid #cbd5e1', backgroundColor: selectedId === id ? '#2563eb' : '#fff', color: selectedId === id ? '#fff' : '#1e293b', fontWeight: 'bold', cursor: 'pointer' }}>
                    Sponsor {id}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveSponsor}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Nom de la marque :</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Logo de la marque :</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>URL Logo :</label>
                  <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px', backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '6px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Fichier Média (mp4, Image, GIF) :</label>
                  <input type="file" accept="video/mp4,image/*" onChange={(e) => handleFileUpload(e, 'media')} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Ou lien YouTube Shorts :</label>
                  <input type="text" value={video} onChange={(e) => setVideo(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Fond (Hex) :</label>
                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}>Texte (Hex) :</label>
                  <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>Texte publicitaire (Bas) :</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} required />
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Sauvegarder Sponsor {selectedId}
              </button>
            </form>
          </section>

          {/* TABLEAU DES ENTRÉES BRUTES DE LA SEMAINE (POUR VÉRIFICATION) */}
          <section style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#1e3a8a' }}>📊 Flux des participations en cours ({participations.length} entrées cette semaine)</h2>
              <button onClick={fetchParticipations} style={{ padding: '6px 12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>🔄 Rafraîchir</button>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '200px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ backgroundColor: '#f1f5f9', position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ padding: '10px' }}>Date/Heure</th>
                    <th style={{ padding: '10px' }}>Étape</th>
                    <th style={{ padding: '10px' }}>Numéro</th>
                  </tr>
                </thead>
                <tbody>
                  {participations.length === 0 ? (
                    <tr><td colSpan={3} style={{ padding: '15px', textAlign: 'center', color: '#64748b' }}>Aucun joueur enregistré pour le moment.</td></tr>
                  ) : (
                    participations.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px' }}>{new Date(p.created_at).toLocaleTimeString('fr-FR')}</td>
                        <td style={{ padding: '10px' }}>Sponsor {p.sponsor_id}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.phone_number}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
