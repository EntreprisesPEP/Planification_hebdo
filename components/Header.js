export default function Header({ prefs, updatePrefs }) {
  return (
    <>
      <div className="topline" />
      <div className="header">
        <div className="header-left">
          <div className="logo">
            {/* Remplace /public/logo-pep.png par le vrai logo PEP2000 */}
            <img src="/logo-pep.png" alt="Les Entreprises PEP2000" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <div>
            <p className="h-title">PLANIFICATION HEBDOMADAIRE</p>
            <p className="h-sub">Besoins et attribution des equipes</p>
          </div>
        </div>
        <div className="header-right">
          <div className="pill-toggle">
            <button
              className={prefs.theme === 'nuit' ? 'active' : ''}
              onClick={() => updatePrefs({ theme: 'nuit' })}
            >NUIT</button>
            <button
              className={prefs.theme === 'jour' ? 'active' : ''}
              onClick={() => updatePrefs({ theme: 'jour' })}
            >JOUR</button>
          </div>
          <div className="h-meta">
            Mode <strong>{prefs.role === 'edit' ? 'animateur' : 'participant'}</strong><br />
            <a onClick={() => updatePrefs({ role: prefs.role === 'edit' ? 'view' : 'edit' })}>
              {prefs.role === 'edit' ? 'passer en mode participant' : 'passer en mode animateur'}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
