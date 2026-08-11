import { dayCellPalette, statusColor } from '../lib/statusColors';
import { JOURS, dateKey, mondayOf, today, weekDates, fmtDateLong } from '../lib/dates';

export default function Meeting2View({ board, editable, theme }) {
  const { projects, contremaitres, settings, getAssignment, setAssignment, updateSettings } = board;
  const dates = weekDates(settings.range_start);
  const pal = dayCellPalette(theme);
  const activeProjects = projects.filter((p) => p.statut !== 'Termine');

  function goToWeek(mondayDate) {
    updateSettings({ range_start: dateKey(mondayDate) });
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <h2 className="big-title">MEETING 2 - ATTRIBUTION</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <div className="weeknav">
            <span>{fmtDateLong(dates[0])} - {fmtDateLong(dates[6])}</span>
            <input
              type="date"
              value={settings.range_start || ''}
              onChange={(e) => e.target.value && goToWeek(mondayOf(new Date(e.target.value + 'T00:00:00')))}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn ghost" onClick={() => { const d = mondayOf(today()); d.setDate(d.getDate() + 7); goToWeek(d); }}>1re semaine</button>
            <button className="btn ghost" onClick={() => { const d = mondayOf(today()); d.setDate(d.getDate() + 14); goToWeek(d); }}>2e semaine</button>
          </div>
        </div>
      </div>

      <div className="needs-and-grid" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div className="needs-sidebar">
          <div className="needs-col">
            <div className="needs-col-title">Sem 1</div>
            {activeProjects.filter((p) => p.s1).length === 0 && (
              <div className="needs-empty">Aucun besoin</div>
            )}
            {activeProjects.filter((p) => p.s1).map((p) => {
              const col = statusColor(p.statut, theme);
              return (
                <div className="needs-item" key={p.id}>
                  <span className="sw" style={{ background: col ? col.border : 'var(--ink-dim)' }} />
                  <span>{p.no} - {p.projet}</span>
                </div>
              );
            })}
          </div>
          <div className="needs-col">
            <div className="needs-col-title">Sem 2</div>
            {activeProjects.filter((p) => p.s2).length === 0 && (
              <div className="needs-empty">Aucun besoin</div>
            )}
            {activeProjects.filter((p) => p.s2).map((p) => {
              const col = statusColor(p.statut, theme);
              return (
                <div className="needs-item" key={p.id}>
                  <span className="sw" style={{ background: col ? col.border : 'var(--ink-dim)' }} />
                  <span>{p.no} - {p.projet}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="scrollx" style={{ flex: 1 }}>
        <table id="cmTable">
          <thead>
            <tr>
              <th style={{ background: pal.headerBg, color: pal.headerInk }}>Contremaitre</th>
              {dates.map((d) => {
                const wknd = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <th
                    key={dateKey(d)}
                    style={{ background: wknd ? pal.headerWeekendBg : pal.headerBg, color: wknd ? pal.headerWeekendInk : pal.headerInk }}
                  >
                    {JOURS[d.getDay()]}<br />{fmtDateLong(d)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {contremaitres.length === 0 && <tr><td colSpan={8} className="empty">Aucun contremaitre. Ajoute-les dans Admin projets.</td></tr>}
            {contremaitres.map((c) => (
              <tr key={c.id}>
                <td className="cm-name" style={{ color: pal.ink }}>{c.nom}</td>
                {dates.map((d) => {
                  const dIso = dateKey(d);
                  const wknd = d.getDay() === 0 || d.getDay() === 6;
                  const bg = wknd ? pal.weekend : pal.base;
                  const bd = wknd ? pal.weekendBorder : pal.border;
                  const projectId = getAssignment(c.id, dIso);
                  const proj = activeProjects.find((p) => p.id === projectId);
                  return (
                    <td key={dIso} className="daycell" style={{ background: bg }}>
                      {editable ? (
                        <select
                          value={projectId || ''}
                          style={{ background: bg, color: pal.ink, borderColor: bd }}
                          onChange={(e) => setAssignment(c.id, dIso, e.target.value || null)}
                        >
                          <option value="">&mdash;</option>
                          {activeProjects.map((p) => <option key={p.id} value={p.id}>{p.projet}</option>)}
                        </select>
                      ) : (
                        <span style={{ color: pal.ink }}>{proj ? proj.projet : '\u2014'}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
