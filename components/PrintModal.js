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
          Format 11x17 (tabloid) paysage, pense a tenir sur une seule page par feuille.
          La boite d&apos;impression du navigateur s&apos;ouvre ensuite &mdash; verifie que le
          format de papier est bien 11x17/Tabloid (Chrome le pre-selectionne
          normalement), puis choisis &laquo;Microsoft Print to PDF&raquo; pour un PDF,
          ou une imprimante qui accepte ce format de papier.
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
