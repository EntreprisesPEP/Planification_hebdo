import { useMemo, useState } from 'react';
import StatusCell from './StatusCell';
import ConfirmModal from './ConfirmModal';
import { statusColor, statusPillClass } from '../lib/statusColors';

function AutoTextarea({ value, editable, onChange }) {
  if (!editable) return <span>{value || ''}</span>;
  return (
    <textarea
      defaultValue={value || ''}
      onInput={(e) => { e.target.style.height = '32px'; e.target.style.height = Math.max(32, e.target.scrollHeight) + 'px'; }}
      onBlur={(e) => e.target.value !== (value || '') && onChange(e.target.value)}
    />
  );
}

export default function ProjectsTable({ rows, editable, theme, onUpdate, onDeleteRequest, emptyLabel }) {
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [filterCharge, setFilterCharge] = useState('');
  const [filterSurint, setFilterSurint] = useState('');

  const chargeOptions = useMemo(() => [...new Set(rows.map((r) => r.charge).filter(Boolean))].sort(), [rows]);
  const surintOptions = useMemo(() => [...new Set(rows.map((r) => r.surintendant).filter(Boolean))].sort(), [rows]);

  const visible = useMemo(() => {
    let list = rows.filter((r) => (!filterCharge || r.charge === filterCharge) && (!filterSurint || r.surintendant === filterSurint));
    if (sortField) {
      list = [...list].sort((a, b) => (a[sortField] || '').localeCompare(b[sortField] || ''));
      if (sortDir === 'desc') list.reverse();
    }
    return list;
  }, [rows, filterCharge, filterSurint, sortField, sortDir]);

  function toggleSort(field) {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  }

  return (
    <div className="scrollx">
      <table className="projtable">
        <colgroup>
          <col style={{ width: '15%' }} /><col style={{ width: '14%' }} /><col style={{ width: '40%' }} />
          <col style={{ width: '6%' }} /><col style={{ width: '6%' }} /><col style={{ width: '9%' }} /><col style={{ width: '10%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>No / Projet</th>
            <th>Statut</th>
            <th>Commentaire</th>
            <th style={{ textAlign: 'right' }}>Sem 1</th>
            <th style={{ textAlign: 'right' }}>Sem 2</th>
            <th>
              Charge
              <select style={{ marginLeft: 6, fontSize: 10 }} value={filterCharge} onChange={(e) => setFilterCharge(e.target.value)}>
                <option value="">Tous</option>
                {chargeOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="filter-btn" onClick={() => toggleSort('charge')}>{sortField === 'charge' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : '\u21C5'}</span>
            </th>
            <th>
              Surintendant
              <select style={{ marginLeft: 6, fontSize: 10 }} value={filterSurint} onChange={(e) => setFilterSurint(e.target.value)}>
                <option value="">Tous</option>
                {surintOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span className="filter-btn" onClick={() => toggleSort('surintendant')}>{sortField === 'surintendant' ? (sortDir === 'asc' ? '\u2191' : '\u2193') : '\u21C5'}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {visible.length === 0 && <tr><td colSpan={7} className="empty">{emptyLabel || 'Aucun projet.'}</td></tr>}
          {visible.map((p) => {
            const col = statusColor(p.statut, theme);
            return (
              <tr key={p.id} style={col ? { background: col.bg } : undefined}>
                <td>
                  <span className="jobline" title={`${p.no} ${p.projet}`}>
                    <span className="no">{p.no}</span>{p.projet}
                  </span>
                </td>
                <td>
                  <StatusCell project={p} editable={editable} onChange={(patch) => onUpdate(p.id, patch)} />
                </td>
                <td>
                  <AutoTextarea value={p.commentaire} editable={editable} onChange={(v) => onUpdate(p.id, { commentaire: v })} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span
                    className={`need-chip ${p.s1 ? 'need-yes' : 'need-no'} ${editable ? '' : 'readonly'}`}
                    onClick={() => editable && onUpdate(p.id, { s1: !p.s1 })}
                  >{p.s1 ? 'OUI' : 'NON'}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span
                    className={`need-chip ${p.s2 ? 'need-yes' : 'need-no'} ${editable ? '' : 'readonly'}`}
                    onClick={() => editable && onUpdate(p.id, { s2: !p.s2 })}
                  >{p.s2 ? 'OUI' : 'NON'}</span>
                </td>
                <td>{p.charge}</td>
                <td>{p.surintendant}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
