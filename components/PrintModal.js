import { useState } from 'react';

const SHEETS = [
  { key: 'admin', label: 'Admin projets' },
  { key: '1', label: 'Meeting 1 - Suivi projets' },
  { key: '2', label: 'Meeting 2 - Attribution' },
  { key: '3', label: 'Projets termines' },
];

export default function PrintModal({ open, onCancel, onPrint }) {
  const [selected, setSelected] = useState(new Set(['1', '2']));

  if (!open) return null;

  function toggle(key) {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key); else next.add(key);
    setSelected(next);
  }

  return (
    <div className="confirm-overlay">
      <div className="confirm-box" style={{ width: 320 }}>
        <p style={{ fontWeight: 700, marginBottom: 10 }}>Choisir les feuilles a imprimer</p>
        {SHEETS.map((s) => (
          <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13 }}>
            <input type="checkbox" checked={selected.has(s.key)} onChange={() => toggle(s.key)} />
            {s.label}
          </label>
        ))}
        <p style={{ fontSize: 11, color: 'var(--ink-dim)', marginTop: 10 }}>
          Format 11x17 (tabloid), Meeting 1 en portrait et Meeting 2 en paysage automatiquement.
          Dans la boite d&apos;impression, ouvre &laquo;Plus de parametres&raquo; et
          <strong> decoche &laquo;En-tetes et pieds de page&raquo;</strong> &mdash; sinon le
          navigateur ajoute lui-meme la date, l&apos;adresse du site et le numero de page en
          haut/bas de chaque feuille. Choisis ensuite &laquo;Microsoft Print to PDF&raquo; pour
          un PDF, ou une imprimante qui accepte le format 11x17.
        </p>
        <div className="confirm-actions">
          <button className="btn ghost" onClick={onCancel}>Annuler</button>
          <button
            className="btn"
            disabled={selected.size === 0}
            onClick={() => onPrint([...selected])}
          >Imprimer</button>
        </div>
      </div>
    </div>
  );
}
