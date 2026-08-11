import { useEffect, useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import AdminView from '../components/AdminView';
import Meeting1View from '../components/Meeting1View';
import Meeting2View from '../components/Meeting2View';
import TerminesView from '../components/TerminesView';
import PrintModal from '../components/PrintModal';
import PrintHeader from '../components/PrintHeader';
import { usePrefs } from '../hooks/usePrefs';
import { useBoard } from '../hooks/useBoard';
import { mondayOf, fmtDateLong, twoWeekDates } from '../lib/dates';

const TABS = [
  { key: 'admin', label: 'ADMIN PROJETS' },
  { key: '1', label: 'MEETING 1 - SUIVI PROJETS' },
  { key: '2', label: 'MEETING 2 - ATTRIBUTION' },
  { key: '3', label: 'PROJETS TERMINES' },
];

const SHEET_TITLES = {
  admin: 'Admin projets', '1': 'Meeting 1 - Suivi projets', '2': 'Meeting 2 - Attribution', '3': 'Projets termines',
};

// Meeting 1 (beaucoup de lignes) -> portrait. Meeting 2 (beaucoup de colonnes) -> paysage.
const SHEET_ORIENTATION = { admin: 'portrait', '1': 'portrait', '2': 'landscape', '3': 'portrait' };

function sheetSubtitle(key, board) {
  if (key === '1') {
    const start = mondayOf(new Date((board.settings.notes_week_start || '') + 'T00:00:00'));
    const end = new Date(start); end.setDate(end.getDate() + 6);
    return `Semaine du ${fmtDateLong(start)} au ${fmtDateLong(end)}`;
  }
  if (key === '2') {
    const two = twoWeekDates(board.settings.range_start);
    return `Semaine 1 : ${fmtDateLong(two[0])} - ${fmtDateLong(two[6])}   |   Semaine 2 : ${fmtDateLong(two[7])} - ${fmtDateLong(two[13])}`;
  }
  return null;
}

function renderSheet(key, board, theme) {
  if (key === 'admin') return <AdminView board={board} editable={false} />;
  if (key === '1') return <Meeting1View board={board} editable={false} theme={theme} />;
  if (key === '2') return <Meeting2View board={board} editable={false} theme={theme} printMode />;
  if (key === '3') return <TerminesView board={board} editable={false} theme={theme} />;
  return null;
}

export default function Home() {
  const { prefs, update, ready } = usePrefs();
  const board = useBoard();
  const [tab, setTab] = useState('1');
  const [printOpen, setPrintOpen] = useState(false);
  const [printSelection, setPrintSelection] = useState(null);

  useEffect(() => {
    function onAfterPrint() { setPrintSelection(null); }
    window.addEventListener('afterprint', onAfterPrint);
    return () => window.removeEventListener('afterprint', onAfterPrint);
  }, []);

  if (!ready || board.loading) {
    return <div style={{ padding: 40, fontFamily: 'Segoe UI, Arial, sans-serif' }}>Chargement...</div>;
  }

  const editable = prefs.role === 'edit';

  return (
    <>
      <Head>
        <title>Planification Hebdomadaire - PEP2000</title>
      </Head>

      <div className="no-print">
        <Header prefs={prefs} updatePrefs={update} />
      </div>

      <div className="wrap no-print">
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
            <button className="btn ghost small" onClick={() => setPrintOpen(true)}>&#128438; Imprimer</button>
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

      {printSelection && (
        <div className="print-only">
          {printSelection.map((key) => (
            <div
              className={`print-page ${SHEET_ORIENTATION[key] === 'landscape' ? 'print-page-landscape' : 'print-page-portrait'}`}
              key={key}
            >
              <div className="wrap">
                <PrintHeader title={SHEET_TITLES[key]} subtitle={sheetSubtitle(key, board)} />
                {renderSheet(key, board, prefs.theme)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="no-print">
        <PrintModal
          open={printOpen}
          onCancel={() => setPrintOpen(false)}
          onPrint={(selection) => {
            setPrintOpen(false);
            setPrintSelection(selection);
            setTimeout(() => window.print(), 200);
          }}
        />
      </div>
    </>
  );
}
