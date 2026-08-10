import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { dateKey, mondayOf, today } from '../lib/dates';

const uid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Math.random()));

export function useBoard() {
  const [projects, setProjects] = useState([]);
  const [contremaitres, setContremaitres] = useState([]);
  const [assignments, setAssignments] = useState([]); // {id, contremaitre_id, day, project_id}
  const [charges, setCharges] = useState([]);
  const [surintendants, setSurintendants] = useState([]);
  const [settings, setSettings] = useState({ range_start: null, notes_week_start: null });
  const [loading, setLoading] = useState(true);
  const [syncState, setSyncState] = useState('synchronise'); // 'synchronise' | 'enregistrement...' | 'erreur de sync'

  const mounted = useRef(true);

  const loadAll = useCallback(async () => {
    const [p, cm, asg, ch, su, st] = await Promise.all([
      supabase.from('projects').select('*').order('sort_order', { ascending: true }),
      supabase.from('contremaitres').select('*').order('sort_order', { ascending: true }),
      supabase.from('assignments').select('*'),
      supabase.from('charges').select('*').order('nom', { ascending: true }),
      supabase.from('surintendants').select('*').order('nom', { ascending: true }),
      supabase.from('app_settings').select('*').eq('id', 1).maybeSingle(),
    ]);
    if (!mounted.current) return;
    if (p.data) setProjects(p.data);
    if (cm.data) setContremaitres(cm.data);
    if (asg.data) setAssignments(asg.data);
    if (ch.data) setCharges(ch.data.map((c) => c.nom));
    if (su.data) setSurintendants(su.data.map((s) => s.nom));
    if (st.data) {
      setSettings(st.data);
    } else {
      const wk = dateKey(mondayOf(today()));
      await supabase.from('app_settings').upsert({ id: 1, range_start: wk, notes_week_start: wk });
      setSettings({ range_start: wk, notes_week_start: wk });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    mounted.current = true;
    loadAll();

    const channel = supabase
      .channel('board-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contremaitres' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'charges' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surintendants' }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, loadAll)
      .subscribe();

    return () => {
      mounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [loadAll]);

  async function withSync(fn) {
    setSyncState('enregistrement...');
    try {
      await fn();
      setSyncState('synchronise');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setSyncState('erreur de sync');
    }
  }

  // ---------- Projects ----------
  async function addProject({ no, projet, charge, surintendant }) {
    await withSync(async () => {
      const sortOrder = projects.length ? Math.max(...projects.map((p) => p.sort_order || 0)) + 1 : 0;
      const { error } = await supabase.from('projects').insert({
        no: no || '00-000', projet, charge: charge || '', surintendant: surintendant || '',
        statut: 'A venir', s1: false, s2: false, commentaire: '', sort_order: sortOrder,
      });
      if (error) throw error;
      await loadAll();
    });
  }
  async function updateProject(id, patch) {
    await withSync(async () => {
      const { error } = await supabase.from('projects').update(patch).eq('id', id);
      if (error) throw error;
      await loadAll();
    });
  }
  async function deleteProject(id) {
    await withSync(async () => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      await loadAll();
    });
  }

  // ---------- Charges / Surintendants (simple name lists) ----------
  async function addCharge(nom) {
    await withSync(async () => {
      const { error } = await supabase.from('charges').insert({ nom });
      if (error && error.code !== '23505') throw error; // ignore duplicate
      await loadAll();
    });
  }
  async function deleteCharge(nom) {
    await withSync(async () => {
      const { error } = await supabase.from('charges').delete().eq('nom', nom);
      if (error) throw error;
      await loadAll();
    });
  }
  async function addSurintendant(nom) {
    await withSync(async () => {
      const { error } = await supabase.from('surintendants').insert({ nom });
      if (error && error.code !== '23505') throw error;
      await loadAll();
    });
  }
  async function deleteSurintendant(nom) {
    await withSync(async () => {
      const { error } = await supabase.from('surintendants').delete().eq('nom', nom);
      if (error) throw error;
      await loadAll();
    });
  }

  // ---------- Contremaitres ----------
  async function addContremaitre(nom) {
    await withSync(async () => {
      const sortOrder = contremaitres.length ? Math.max(...contremaitres.map((c) => c.sort_order || 0)) + 1 : 0;
      const { error } = await supabase.from('contremaitres').insert({ nom, sort_order: sortOrder });
      if (error) throw error;
      await loadAll();
    });
  }
  async function updateContremaitre(id, nom) {
    await withSync(async () => {
      const { error } = await supabase.from('contremaitres').update({ nom }).eq('id', id);
      if (error) throw error;
      await loadAll();
    });
  }
  async function deleteContremaitre(id) {
    await withSync(async () => {
      const { error } = await supabase.from('contremaitres').delete().eq('id', id);
      if (error) throw error;
      await loadAll();
    });
  }

  // ---------- Assignments (Meeting 2 grid) ----------
  function getAssignment(contremaitreId, dayIso) {
    const row = assignments.find((a) => a.contremaitre_id === contremaitreId && a.day === dayIso);
    return row ? row.project_id : null;
  }
  async function setAssignment(contremaitreId, dayIso, projectId) {
    await withSync(async () => {
      if (!projectId) {
        const { error } = await supabase
          .from('assignments')
          .delete()
          .eq('contremaitre_id', contremaitreId)
          .eq('day', dayIso);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('assignments')
          .upsert({ contremaitre_id: contremaitreId, day: dayIso, project_id: projectId }, { onConflict: 'contremaitre_id,day' });
        if (error) throw error;
      }
      await loadAll();
    });
  }

  // ---------- Settings (semaine affichee en Meeting 2) ----------
  async function updateSettings(patch) {
    await withSync(async () => {
      const { error } = await supabase.from('app_settings').update(patch).eq('id', 1);
      if (error) throw error;
      await loadAll();
    });
  }

  // ---------- Notes hebdomadaires (Meeting 1) ----------
  async function switchNotesWeek(newWeekIso) {
    const oldWeekIso = settings.notes_week_start;
    if (newWeekIso === oldWeekIso) return;
    await withSync(async () => {
      // 1) archive l'etat courant de chaque projet pour la semaine qu'on quitte
      await Promise.all(
        projects.map((p) =>
          supabase.from('weekly_notes').upsert(
            {
              project_id: p.id,
              week_start: oldWeekIso,
              statut: p.statut,
              commentaire: p.commentaire,
              date_valeur: p.date_valeur,
            },
            { onConflict: 'project_id,week_start' }
          )
        )
      );
      // 2) charge (ou reinitialise) les notes pour la nouvelle semaine
      const { data: notes } = await supabase
        .from('weekly_notes')
        .select('*')
        .eq('week_start', newWeekIso);
      const noteByProject = new Map((notes || []).map((n) => [n.project_id, n]));
      await Promise.all(
        projects.map((p) => {
          const note = noteByProject.get(p.id);
          const patch = note
            ? { statut: note.statut, commentaire: note.commentaire, date_valeur: note.date_valeur }
            : { statut: 'A venir', commentaire: '', date_valeur: null };
          return supabase.from('projects').update(patch).eq('id', p.id);
        })
      );
      // 3) met a jour le parametre partage
      const { error } = await supabase.from('app_settings').update({ notes_week_start: newWeekIso }).eq('id', 1);
      if (error) throw error;
      await loadAll();
    });
  }

  async function importPreviousWeek() {
    const current = new Date(settings.notes_week_start + 'T00:00:00');
    const prev = new Date(current);
    prev.setDate(prev.getDate() - 7);
    const prevIso = dateKey(prev);
    let imported = 0;
    await withSync(async () => {
      const { data: notes } = await supabase.from('weekly_notes').select('*').eq('week_start', prevIso);
      const noteByProject = new Map((notes || []).map((n) => [n.project_id, n]));
      await Promise.all(
        projects.map((p) => {
          const note = noteByProject.get(p.id);
          if (!note) return null;
          imported++;
          return supabase
            .from('projects')
            .update({ statut: note.statut, commentaire: note.commentaire, date_valeur: note.date_valeur })
            .eq('id', p.id);
        })
      );
      await loadAll();
    });
    return imported;
  }

  return {
    projects, contremaitres, assignments, charges, surintendants, settings, loading, syncState,
    addProject, updateProject, deleteProject,
    addCharge, deleteCharge, addSurintendant, deleteSurintendant,
    addContremaitre, updateContremaitre, deleteContremaitre,
    getAssignment, setAssignment,
    updateSettings, switchNotesWeek, importPreviousWeek,
    reload: loadAll,
  };
}
