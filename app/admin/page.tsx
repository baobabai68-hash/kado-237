'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour la gestion et le nettoyage
  const [gagnants, setGagnants] = useState<any[]>([]);
  const [temoignages, setTemoignages] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  // État pour la modification d'un sponsor
  const [selectedSponsorId, setSelectedSponsorId] = useState<number>(1);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState('#1e293b');
  const [textColor, setTextColor] = useState('#ffffff');
  const [logoUrl, setLogoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // États pour les formulaires d'ajout
  const [jour, setJour] = useState('Lundi');
  const [phoneGagnant, setPhoneGagnant] = useState('');
  const [ticketGagnant, setTicketGagnant] = useState('');
  const [semaineTirage, setSemaineTirage] = useState('');

  const [nomTemoignage, setNomTemoignage] = useState('');
  const [villeTemoignage, setVilleTemoignage] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [lotPhysique, setLotPhysique] = useState('');
  const [mediaUrlTemoignage, setMediaUrlTemoignage] = useState('');

  useEffect(() => {
    async function initAdmin() {
      const { data, error } = await supabase.from('sponsors').select('*').order('id', { ascending: true });
      if (data && !error) {
        setSponsors(data);
        chargerSponsorDansFormulaire(1, data);
      }
      
      // Calcul auto de la semaine
      const d = new Date();
      const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const dayNum = date.getUTCDay() || 7;
      date.setUTCDate(date.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      setSemaineTirage(`Semaine ${weekNo} - ${d.getFullYear()}`);
      
      setLoading(false);
    }
    initAdmin();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      chargerListesNettoyage();
    }
  }, [isAuthenticated]);

  const chargerListesNettoyage = async () => {
    setLoadingList(true);
    const { data: gData } = await supabase.from('gagnants').select('*').order('created_at', { ascending: false });
    if (gData) setGagnants(gData);

    const { data: tData } = await supabase.from('temoignages').select('*').order('created_at', { ascending: false });
    if (tData) setTemoignages(tData);
    setLoadingList(false);
  };

  const chargerSponsorDansFormulaire = (id: number, listeSponsors = sponsors) => {
    const sp = listeSponsors.find(s => s.id === id);
    if (sp) {
      setName(sp.name || '');
      setText(sp.text || '');
      setBgColor(sp.bg_color || '#1e293b');
      setTextColor(sp.text_color || '#ffffff');
      setLogoUrl(sp.logo_url || '');
      setVideoUrl(sp.video || '');
    }
  };

  const handleSponsorChange = (id: number) => {
    setSelectedSponsorId(id);
    chargerSponsorDansFormulaire(id);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'KADO237') {
      setIsAuthenticated(true);
    } else {
      alert('Mot de passe incorrect');
    }
  };

  // UPLOAD OU LIEN DIRECT POUR LOGO/VIDEO SPONSOR
  const handleUploadSponsorFile = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${field}.${fileExt}`;
    
    const { error } = await supabase.storage.from('sponsors').upload(fileName, file);

    if (error) {
      alert("Échec de l'upload direct. Utilisez le champ texte pour coller un lien direct d'hébergeur.");
    } else {
      const { data } = supabase.storage.from('sponsors').getPublicUrl(fileName);
      if (field === 'logo') setLogoUrl(data.publicUrl);
      else setVideoUrl(data.publicUrl);
      alert('Fichier chargé avec succès sur Supabase !');
    }
  };

  // UPLOAD OU LIEN DIRECT POUR TÉMOIGNAGE
  const handleUploadTemoignageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_temoin.${fileExt}`;
    
    const { error } = await supabase.storage.from('media').upload(fileName, file);

    if (error) {
      alert("Échec de l'upload direct. Utilisez le champ texte ci-dessous pour coller votre lien direct.");
    } else {
      const { data } = supabase.storage.from('media').getPublicUrl(fileName);
      setMediaUrlTemoignage(data.publicUrl);
      alert('Média chargé avec succès sur Supabase !');
    }
  };

  // SAUVEGARDER LA CONFIGURATION DU SPONSOR
  const handleSaveSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('sponsors')
      .update({ name, text, bg_color: bgColor, text_color: textColor, logo_url: logoUrl, video: videoUrl })
      .eq('id', selectedSponsorId);

    if (!error) {
      alert(`Configuration du Sponsor ${selectedSponsorId} mise à jour !`);
      const { data } = await supabase.from('sponsors').select('*').order('id', { ascending: true });
      if (data) setSponsors(data);
    } else {
      alert("Erreur de sauvegarde : " + error.message);
    }
  };

  // ENREGISTRER UN GAGNANT
  const handleAddGagnant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneGagnant.match(/^(6)(5|6|7|8|9)[0-9]{7}$/)) {
      alert("Format de numéro camerounais invalide.");
      return;
    }

    const { error } = await supabase.from('gagnants').insert([{
      jour_semaine: jour,
      phone_number: phoneGagnant,
      ticket_choisi: parseInt(ticketGagnant),
      semaine_annee: semaineTirage
    }]);

    if (!error) {
      alert('Gagnant enregistré avec succès !');
      setPhoneGagnant('');
      setTicketGagnant('');
      chargerListesNettoyage();
    } else {
      alert("Erreur : " + error.message);
    }
  };

  // ENREGISTRER UN TÉMOIGNAGE
  const handleAddTemoignage = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('temoignages').insert([{
      nom_gagnant: nomTemoignage,
      ville: villeTemoignage,
      commentaire: commentaire,
      montant_gagne: lotPhysique,
      media_url: mediaUrlTemoignage
    }]);

    if (!error) {
      alert('Preuve physique publiée !');
      setNomTemoignage('');
      setVilleTemoignage('');
      setCommentaire('');
      setLotPhysique('');
      setMediaUrlTemoignage('');
      chargerListesNettoyage();
    } else {
      alert("Erreur : " + error.message);
    }
  };

  // SUPPRESSIONS MANUELLES
  const handleDeleteGagnant = async (id: number) => {
    if (confirm("Supprimer définitivement ce tirage ?")) {
      const { error } = await supabase.from('gagnants').delete().eq('id', id);
      if (!error) chargerListesNettoyage();
    }
  };

  const handleDeleteTemoignage = async (id: number) => {
    if (confirm("Supprimer définitivement ce témoignage ?")) {
      const { error } = await supabase.from('temoignages').delete().eq('id', id);
      if (!error) chargerListesNettoyage();
    }
  };

  if (loading) return <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Initialisation de l'espace sécurisé...</div>;

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', padding: '10px' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #334155' }}>
          <h2 style={{ color: '#facc15', margin: '0 0 20px 0', textAlign: 'center', fontSize: '20px' }}>🔒 Direction KADO 237</h2>
          <input type="password" placeholder="Code secret de l'application" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box', marginBottom: '20px' }} required />
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Se connecter</button>
        </form>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'sans-serif', padding: '20px 10px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '15px', marginBottom: '25px' }}>
          <div>
            <h1 style={{ color: '#facc15', margin: 0, fontSize: '24px' }}>🛠️ Administration Centrale KADO 237</h1>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Contrôle total du parcours publicitaire et des preuves physiques</p>
          </div>
          <button onClick={() => setIsAuthenticated(false)} style={{ backgroundColor: '#dc2626', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Quitter</button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(1fr))', gap: '25px' }}>
          
          {/* BLOC UNIQUE A : CONFIGURATEUR DES 5 SPONSORS (LE TUNNEL D'ORIGINE) */}
          <section style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ color: '#facc15', margin: '0 0 15px 0', fontSize: '16px' }}>🎨 Étape 1 : Personnalisation visuelle du Tunnel des Sponsors</h3>
            
            <div style={{ marginBottom: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5].map(id => (
                <button key={id} onClick={() => handleSponsorChange(id)} style={{ padding: '8px 16px', backgroundColor: selectedSponsorId === id ? '#2563eb' : '#0f172a', color: '#fff', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Sponsor {id}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveSponsor} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Nom de la Marque :</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Texte d'Engagement / Description :</label>
                <textarea value={text} onChange={(e) => setText(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box', height: '60px', resize: 'none' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Couleur d'Arrière-plan :</label>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: '100%', height: '38px', padding: '2px', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Couleur du Texte :</label>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: '100%', height: '38px', padding: '2px', backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer' }} />
              </div>
              
              {/* LOGO URL OU FILE */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Lien direct Logo (Hébergeur ou Auto) :</label>
                <input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box' }} placeholder="https://..." />
                <input type="file" accept="image/*" onChange={(e) => handleUploadSponsorFile(e, 'logo')} style={{ marginTop: '5px', fontSize: '11px' }} />
              </div>

              {/* VIDEO URL OU FILE */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Lien direct Vidéo Annonceur :</label>
                <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box' }} placeholder="https://..." />
                <input type="file" accept="video/*" onChange={(e) => handleUploadSponsorFile(e, 'video')} style={{ marginTop: '5px', fontSize: '11px' }} />
              </div>

              <button type="submit" style={{ gridColumn: 'span 2', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>
                💾 Sauvegarder les modifications du Sponsor {selectedSponsorId}
              </button>
            </form>
          </section>

          {/* BLOC UNIQUE B : AJOUT DU NUMÉRO GAGNANT */}
          <section style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginTop: '10px' }}>
            <h3 style={{ color: '#facc15', margin: '0 0 15px 0', fontSize: '16px' }}>📢 Étape 2 : Déclaration d'un Ticket Gagnant au Tirage</h3>
            <form onSubmit={handleAddGagnant} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Jour du Tirage :</label>
                <select value={jour} onChange={(e) => setJour(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}>
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Période de Référence :</label>
                <input type="text" value={semaineTirage} onChange={(e) => setSemaineTirage(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>WhatsApp Gagnant (9 chiffres) :</label>
                <input type="tel" placeholder="Ex: 695001122" value={phoneGagnant} onChange={(e) => setPhoneGagnant(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Numéro du Ticket Tiré (1 à 100) :</label>
                <input type="number" placeholder="Ex: 37" value={ticketGagnant} onChange={(e) => setTicketGagnant(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box' }} required />
              </div>
              <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Publier le Tirage Officiel
              </button>
            </form>
          </section>

          {/* BLOC UNIQUE C : CRÉATION DE PREUVES / TEMOIGNAGES */}
          <section style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginTop: '10px' }}>
            <h3 style={{ color: '#facc15', margin: '0 0 15px 0', fontSize: '16px' }}>📸 Étape 3 : Création d'une Preuve Photo/Vidéo (Mur des témoignages)</h3>
            <form onSubmit={handleAddTemoignage} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Nom du Lauréat :</label>
                <input type="text" placeholder="Ex: Ibrahim" value={nomTemoignage} onChange={(e) => setNomTemoignage(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Ville :</label>
                <input type="text" placeholder="Ex: Garoua" value={villeTemoignage} onChange={(e) => setVilleTemoignage(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Nature du Lot Physique Offert :</label>
                <input type="text" placeholder="Ex: Smartphone Android Camtel / Sac de Riz" value={lotPhysique} onChange={(e) => setLotPhysique(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Commentaire (Verbatim du gagnant) :</label>
                <textarea placeholder="Ex: Je ne croyais pas, mais je viens de retirer mon lot physique. Merci !" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box', height: '50px', resize: 'none' }} required />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Lien Média Preuve (Hébergeur ou direct) :</label>
                <input type="text" value={mediaUrlTemoignage} onChange={(e) => setMediaUrlTemoignage(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box' }} placeholder="https://..." />
                <input type="file" accept="image/*,video/*" onChange={handleUploadTemoignageFile} style={{ marginTop: '5px', fontSize: '11px' }} />
              </div>
              <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Publier le Témoignage Physique
              </button>
            </form>
          </section>

        </div>

        {/* SECTION INTEGRALEMENT RAJOUTÉE : LE MODULE DE NETTOYAGE MANUEL */}
        <section style={{ marginTop: '35px', backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#ef4444', margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>🗑️ Module de Suppression Manuelle des Contenus de Test</h3>
          
          {loadingList ? (
            <p style={{ color: '#94a3b8', fontSize: '13px' }}>Mise à jour en cours...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              
              {/* NETTOYAGE GAGNANTS */}
              <div>
                <h4 style={{ color: '#cbd5e1', fontSize: '14px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>Tirages Enregistrés ({gagnants.length})</h4>
                {gagnants.length === 0 ? <p style={{ fontSize: '12px', color: '#64748b' }}>Aucun élément.</p> : (
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                    {gagnants.map(g => (
                      <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '6px 10px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '13px' }}>{g.jour_semaine} - <strong>{g.phone_number}</strong> (T-{g.ticket_choisi})</span>
                        <button onClick={() => handleDeleteGagnant(g.id)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Supprimer</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* NETTOYAGE TEMOIGNAGES */}
              <div>
                <h4 style={{ color: '#cbd5e1', fontSize: '14px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>Témoignages Visibles ({temoignages.length})</h4>
                {temoignages.length === 0 ? <p style={{ fontSize: '12px', color: '#64748b' }}>Aucun élément.</p> : (
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                    {temoignages.map(t => (
                      <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '6px 10px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '13px' }}>{t.nom_gagnant} ({t.ville}) - <strong>{t.montant_gagne}</strong></span>
                        <button onClick={() => handleDeleteTemoignage(t.id)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Supprimer</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </section>

      </div>
    </main>
  );
}
