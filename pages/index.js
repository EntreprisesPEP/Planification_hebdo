import { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import AdminView from '../components/AdminView';
import Meeting1View from '../components/Meeting1View';
import Meeting2View from '../components/Meeting2View';
import TerminesView from '../components/TerminesView';
import { usePrefs } from '../hooks/usePrefs';
import { useBoard } from '../hooks/useBoard';

const TABS = [
  { key: 'admin', label: 'ADMIN PROJETS' },
  { key: '1', label: 'SUIVI PROJETS' },
  { key: '2', label: 'MEETING 2 - ATTRIBUTION' },
  { key: '3', label: 'PROJETS TERMINES' },
];

export default function Home() {
  const { prefs, update, ready } = usePrefs();
  const board = useBoard();
  const [tab, setTab] = useState('1');

  if (!ready || board.loading) {
    return <div style={{ padding: 40, fontFamily: 'Segoe UI, Arial, sans-serif' }}>Chargement...</div>;
  }

  const editable = prefs.role === 'edit';

  return (
    <>
      <Head>
        <title>Planification Hebdomadaire - PEP2000</title>
      </Head>
      <Header prefs={prefs} updatePrefs={update} />
      <div className="wrap">
        <div className="toolbar">
          <div className="left">
            <span className="eyebrow">Vue</span>
            <div className="pill-toggle">
              {TABS.map((t) => (
                <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn ghost small" disabled={!board.canUndo} onClick={board.undo} title="Annuler">&#8630; Annuler</button>
              <button className="btn ghost small" disabled={!board.canRedo} onClick={board.redo} title="Retablir">&#8631; Retablir</button>
            </div>
            <div className="sync">
              <span className="dot" style={{ background: board.syncState === 'synchronise' ? '#2E9F58' : board.syncState === 'erreur de sync' ? '#C41230' : '#D69614' }} />
              <span>{board.syncState}</span>
            </div>
          </div>
        </div>

        {tab === 'admin' && <AdminView board={board} editable={editable} />}
        {tab === '1' && <Meeting1View board={board} editable={editable} theme={prefs.theme} />}
        {tab === '2' && <Meeting2View board={board} editable={editable} theme={prefs.theme} />}
        {tab === '3' && <TerminesView board={board} editable={editable} theme={prefs.theme} />}

        <div className="footnote">
          Donnee partagee en temps reel via Supabase entre tous ceux qui ouvrent ce site.
          Mode participant en lecture seule. Aucun compte requis pour l&apos;instant &mdash; usage interne d&apos;equipe
          (voir le README pour ajouter une vraie authentification plus tard).
        </div>
      </div>
    </>
  );
}
