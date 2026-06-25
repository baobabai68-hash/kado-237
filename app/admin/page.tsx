'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // États pour les formulaires
  const [jour, setJour] = useState('Lundi');
  const [phoneGagnant, setPhoneGagnant] = useState('');
  const [ticketGagnant, setTicketGagnant] = useState('');
  
  const [nomTemoignage, setNomTemoignage] = useState('');
  const [villeTemoignage, setVilleTemoignage] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [lotFictif, setLotFictif] = useState('');
  
  // États pour les listes de gestion
  const [gagnants, setGagnants] = useState<any[]>([]);
  const [temoignages, setTemoignages] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [semaineActuelle, setSemaineActuelle] = useState('');

  useEffect(() => {
    // Calcul de la semaine pour le marquage des tirages
    const d = new Date();
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    setSemaineActuelle(`Semaine ${weekNo} - ${d.getFullYear()}`);
    
    if (isAuthenticated) {
      chargerDonneesGestion();
    }
  }, [isAuthenticated]);

  const chargerDonneesGestion = async () => {
    setLoadingList(true);
    const { data: gData } = await supabase.from('gagnants').select('*').order('created_at', { ascending: false });
    if (gData) setGagnants(gData);

    const { data: tData } = await supabase.from('temoignages').select('*').order('created_at', { ascending: false });
    if (tData) setTemoignages(tData);
    setLoadingList(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'KADO237') {
      setIsAuthenticated(true);
    } else {
      alert('Mot de passe incorrect');
    }
  };

  // AJOUTER UN GAGNANT
  const handleAddGagnant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneGagnant.match(/^(6)(5|6|7|8|9)[0-9]{7}$/)) {
      alert("Format de numéro WhatsApp camerounais invalide.");
      return;
    }

    const { error } = await supabase.from('gagnants').insert([{
      jour_semaine: jour,
      phone_number: phoneGagnant,
      ticket_choisi: parseInt(ticketGagnant),
      semaine_annee: semaineActuelle
    }]);

    if (!error) {
      alert('Gagnant enregistré avec succès !');
      setPhoneGagnant('');
      setTicketGagnant('');
      chargerDonneesGestion();
    } else {
      alert("Erreur : " + error.message);
    }
  };

  // AJOUTER UN TÉMOIGNAGE
  const handleAddTemoignage = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('temoignages').insert([{
      nom_gagnant: nomTemoignage,
      ville: villeTemoignage,
      commentaire: commentaire,
      montant_gagne: lotFictif // Stocke le nom du lot physique (ex: Smartphone)
    }]);

    if (!error) {
      alert('Témoignage physique ajouté !');
      setNomTemoignage('');
      setVilleTemoignage('');
      setCommentaire('');
      setLotFictif('');
      chargerDonneesGestion();
    } else {
      alert("Erreur : " + error.message);
    }
  };

  // SUPPRIMER UN GAGNANT
  const handleDeleteGagnant = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce tirage ?")) {
      const { error } = await supabase.from('gagnants').delete().eq('id', id);
      if (!error) {
        chargerDonneesGestion();
      } else {
        alert("Erreur lors de la suppression : " + error.message);
      }
    }
  };

  // SUPPRIMER UN TÉMOIGNAGE
  const handleDeleteTemoignage = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce témoignage ?")) {
      const { error } = await supabase.from('temoignages').delete().eq('id', id);
      if (!error) {
        chargerDonneesGestion();
      } else {
        alert("Erreur lors de la suppression : " + error.message);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', padding: '10px' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #334155' }}>
          <h2 style={{ color: '#facc15', margin: '0 0 20px 0', textAlign: 'center' }}>🔒 Connexion Direction KADO 237</h2>
          <input 
            type="password" 
            placeholder="Code secret admin" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box', marginBottom: '20px', fontSize: '16px' }} 
          />
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Entrer</button>
        </form>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'sans-serif', padding: '30px 15px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1e293b', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <h1 style={{ color: '#facc15', margin: 0, fontSize: '28px' }}>🛠️ Dashboard d'Administration</h1>
            <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Session active pour la gestion des lots physiques</p>
          </div>
          <button onClick={() => setIsAuthenticated(false)} style={{ backgroundColor: '#dc2626', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Déconnexion</button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '30px' }}>
          
          {/* FORMULAIRE 1 : LES GAGNANTS DU TIRAGE */}
          <section style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ color: '#facc15', margin: '0 0 20px 0' }}>📢 Publier un Numéro Gagnant</h3>
            <form onSubmit={handleAddGagnant}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Jour du Tirage :</label>
                <select value={jour} onChange={(e) => setJour(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569' }}>
                  {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Numéro WhatsApp du Gagnant :</label>
                <input type="tel" placeholder="Ex: 695001122" value={phoneGagnant} onChange={(e) => setPhoneGagnant(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Numéro du Ticket Gagnant :</label>
                <input type="number" placeholder="Ex: 45" value={ticketGagnant} onChange={(e) => setTicketGagnant(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box' }} required />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Enregistrer le Tirage</button>
            </form>
          </section>

          {/* FORMULAIRE 2 : LES TÉMOIGNAGES DE REMISE DE LOTS */}
          <section style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ color: '#facc15', margin: '0 0 20px 0' }}>📸 Ajouter une Preuve de Remise</h3>
            <form onSubmit={handleAddTemoignage}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Nom du Lauréat :</label>
                <input type="text" placeholder="Ex: Amadou Ibrahim" value={nomTemoignage} onChange={(e) => setNomTemoignage(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Ville de résidence :</label>
                <input type="text" placeholder="Ex: Douala" value={villeTemoignage} onChange={(e) => setVilleTemoignage(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Nature du Lot Physique :</label>
                <input type="text" placeholder="Ex: Smartphone / Sac de riz 50kg" value={lotFictif} onChange={(e) => setLotFictif(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Commentaire ou Citation :</label>
                <textarea placeholder="Ex: Merci à KADO 237 pour ce magnifique téléphone reçu ce matin !" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', boxSizing: 'border-box', height: '65px', resize: 'none' }} required />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Publier la Preuve</button>
            </form>
          </section>

        </div>

        {/* ZONE DE NETTOYAGE ET SUPPRESSION MANUELLE */}
        <section style={{ marginTop: '40px', backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#facc15', margin: '0 0 20px 0' }}>🗑️ Gestion et Nettoyage des Données en Base</h3>
          
          {loadingList ? (
            <p style={{ color: '#94a3b8' }}>Mise à jour de la base de données...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              
              {/* LISTE SUPPRESSION GAGNANTS */}
              <div>
                <h4 style={{ borderBottom: '1px solid #334155', paddingBottom: '5px', color: '#cbd5e1' }}>Numéros Tirés ({gagnants.length})</h4>
                {gagnants.length === 0 ? <p style={{ fontSize: '13px', color: '#64748b' }}>Aucun tirage enregistré.</p> : (
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    {gagnants.map(g => (
                      <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '14px' }}>{g.jour_semaine} - <strong>{g.phone_number}</strong> (Ticket {g.ticket_choisi})</span>
                        <button onClick={() => handleDeleteGagnant(g.id)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Supprimer</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* LISTE SUPPRESSION TÉMOIGNAGES */}
              <div>
                <h4 style={{ borderBottom: '1px solid #334155', paddingBottom: '5px', color: '#cbd5e1' }}>Témoignages & Preuves ({temoignages.length})</h4>
                {temoignages.length === 0 ? <p style={{ fontSize: '13px', color: '#64748b' }}>Aucun témoignage enregistré.</p> : (
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    {temoignages.map(t => (
                      <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '6px' }}>
                        <span style={{ fontSize: '14px' }}>{t.nom_gagnant} ({t.ville}) - Lot: <strong>{t.montant_gagne}</strong></span>
                        <button onClick={() => handleDeleteTemoignage(t.id)} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Supprimer</button>
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
