export default function Header({ prefs, updatePrefs }) {
  async function toggleRole() {
    if (prefs.role === 'edit') {
      updatePrefs({ role: 'view' }); // repasser en participant ne demande jamais de mot de passe
      return;
    }
    const pwd = window.prompt('Mot de passe animateur :');
    if (pwd === null) return; // annule
    try {
      const res = await fetch('/api/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();
      if (data.ok) {
        updatePrefs({ role: 'edit' });
      } else {
        window.alert('Mot de passe incorrect.');
      }
    } catch (e) {
      window.alert('Impossible de verifier le mot de passe pour le moment.');
    }
  }

  return (
    <>
      <div className="topline" />
      <div className="header">
        <div className="header-left">
          <div className="logo">
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
            <a onClick={toggleRole}>
              {prefs.role === 'edit' ? 'passer en mode participant' : 'passer en mode animateur'}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
