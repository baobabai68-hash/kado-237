'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function GagnantsEtTemoignages() {
  const [gagnants, setGagnants] = useState<any[]>([]);
  const [temoignages, setTemoignages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [semaineActuelle, setSemaineActuelle] = useState('');

  useEffect(() => {
    fetchPublicData();
    
    const d = new Date();
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    setSemaineActuelle(`Semaine ${weekNo} - ${d.getFullYear()}`);
  }, []);

  const fetchPublicData = async () => {
    try {
      const { data: gData } = await supabase
        .from('gagnants')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);

      if (gData) setGagnants(gData);

      const { data: tData } = await supabase
        .from('temoignages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (tData) setTemoignages(tData);
    } catch (error) {
      console.error('Erreur chargement données publiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const gagnantsDeLaSemaine = gagnants.filter(g => g.semaine_annee === semaineActuelle);
  const gagnantsAAfficher = gagnantsDeLaSemaine.length > 0 ? gagnantsDeLaSemaine : gagnants;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #facc15', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 15px auto' }}></div>
          <p style={{ fontWeight: 'bold', color: '#94a3b8' }}>Chargement du tableau des kados...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif', padding: '20px 10px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '40px', marginTop: '10px' }}>
          <span style={{ backgroundColor: '#2563eb', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Vérification Officielle
          </span>
          <h1 style={{ fontSize: '32px', margin: '12px 0 6px 0', color: '#facc15', fontWeight: '800' }}>🏆 LES GAGNANTS KADO 237</h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '15px' }}>Résultats transparents des tirages du Lundi au Samedi.</p>
        </header>

        <section style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px', marginBottom: '35px', border: '1px solid #334155', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎯 Derniers Numéros Tirés au Sort
            </h2>
            <span style={{ fontSize: '13px', color: '#facc15', fontWeight: 'bold', backgroundColor: 'rgba(252, 211, 77, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
              {gagnantsDeLaSemaine.length > 0 ? 'Cette Semaine' : 'Tirages Récents'}
            </span>
          </div>

          {gagnantsAAfficher.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
              <p style={{ margin: 0, fontSize: '15px' }}>⏳ Les tirages au sort de la semaine sont en cours de validation par le commissaire.</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#64748b' }}>Revenez dès dimanche pour l'annonce officielle de l'influenceur !</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              {gagnantsAAfficher.map((g, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '14px 18px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#facc15', backgroundColor: 'rgba(250, 204, 21, 0.1)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                      {g.jour_semaine}
                    </span>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginTop: '6px', letterSpacing: '0.5px' }}>
                      {g.phone_number.replace(/.(?=.{4})/g, '*')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', color: '#4ade80', fontWeight: 'bold', display: 'block' }}>🎫 Ticket Validé</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Code: T-{g.ticket_choisi}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#fff', paddingLeft: '5px' }}>
            📸 Preuves Locales & Témoignages
          </h2>
          
          {temoignages.length === 0 ? (
            <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '30px', textAlign: 'center', border: '1px solid #334155', color: '#94a3b8' }}>
              <p style={{ margin: 0 }}>Les premières photos et captures de paiements Mobile Money des gagnants seront affichées ici très bientôt.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {temoignages.map((t, idx) => (
                <div key={idx} style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
                  
                  {t.media_url && (
                    <div style={{ backgroundColor: '#0f172a', width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderBottom: '1px solid #334155' }}>
                      {t.media_url.includes('.mp4') ? (
                        <video src={t.media_url} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <img src={t.media_url} alt="Preuve de gain" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                  )}

                  <div style={{ padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', color: '#fff' }}>{t.nom_gagnant}</h4>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{t.ville || 'Cameroun'}</span>
                      </div>
                      {t.commentaire && (
                        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', lineHeight: '1.4' }}>
                          "{t.commentaire}"
                        </p>
                      )}
                    </div>
                    <div style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)', padding: '8px 12px', borderRadius: '6px', border: '1px dashed #4ade80', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 'bold' }}>Reçu avec succès</span>
                      <span style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>{t.montant_gagne}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

        <footer style={{ textAlign: 'center', padding: '20px 0', borderTop: '1px solid #1e293b' }}>
          <a href="/" style={{ color: '#facc15', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>
            ← Retourner Tenter Ma Chance
          </a>
        </footer>

      </div>
    </main>
  );
}
