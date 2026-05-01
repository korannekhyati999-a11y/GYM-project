import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Activity, Calendar, Award, FileText,
  LogOut, Dumbbell, Apple, ChevronDown, X, Plus, Trash2,
  Search, RefreshCw,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
    <div style={{ width: 32, height: 32, border: '3px solid rgba(255,46,46,0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'trSpin 0.8s linear infinite' }} />
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, show };
};

const COLORS = { success: '#10B981', error: '#EF4444', info: '#3B82F6' };

const Toasts = ({ toasts }) => (
  <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
    {toasts.map(t => (
      <div key={t.id} style={{ background: '#1E293B', borderLeft: `4px solid ${COLORS[t.type] || COLORS.success}`, padding: '12px 20px', borderRadius: 8, color: '#F8FAFC', fontSize: '0.88rem', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', minWidth: 260, animation: 'trSlide 0.3s ease' }}>
        {t.msg}
      </div>
    ))}
  </div>
);

// ─── WorkoutModal ─────────────────────────────────────────────────────────────
const WorkoutModal = ({ client, trainerName, trainerId, onClose, onSaved }) => {
  const [title, setTitle]     = useState('Weekly Workout');
  const [weekLabel, setWeek]  = useState('Week 1');
  const [days, setDays]       = useState([
    { day: 'Monday',    focus: '', exercises: '' },
    { day: 'Tuesday',   focus: '', exercises: '' },
    { day: 'Wednesday', focus: '', exercises: '' },
    { day: 'Thursday',  focus: '', exercises: '' },
    { day: 'Friday',    focus: '', exercises: '' },
  ]);
  const [saving, setSaving] = useState(false);

  const updateDay = (i, field, val) => {
    setDays(d => d.map((row, idx) => idx === i ? { ...row, [field]: val } : row));
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      client_id:    client.id,
      trainer_id:   trainerId,
      trainer_name: trainerName,
      title,
      week_label:   weekLabel,
      days: days.map(d => ({
        day: d.day,
        focus: d.focus,
        exercises: d.exercises.split('\n').filter(Boolean),
      })),
      is_active: true,
    };
    const { error } = await supabase.from('workout_plans').insert([payload]);
    setSaving(false);
    if (error) { alert(error.message); return; }
    onSaved();
    onClose();
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 16px' };
  const box     = { background: '#1E293B', borderRadius: 16, width: '100%', maxWidth: 700, border: '1px solid #334155' };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={box}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid #334155' }}>
          <h3 style={{ margin: 0, color: '#F8FAFC' }}>New Workout Plan — {client.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: 6 }}>Plan Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#F8FAFC', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: 6 }}>Week Label</label>
              <input value={weekLabel} onChange={e => setWeek(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#F8FAFC', outline: 'none' }} />
            </div>
          </div>
          {days.map((d, i) => (
            <div key={d.day} style={{ background: '#0F172A', borderRadius: 10, padding: 16, border: '1px solid #1E293B' }}>
              <div style={{ fontWeight: 600, color: '#C9A84C', marginBottom: 10, fontSize: '0.9rem' }}>{d.day}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: 4 }}>Focus / Muscle Group</label>
                  <input value={d.focus} onChange={e => updateDay(i, 'focus', e.target.value)}
                    placeholder="e.g. Chest & Triceps"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#1E293B', border: '1px solid #334155', borderRadius: 6, color: '#F8FAFC', outline: 'none', fontSize: '0.85rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', marginBottom: 4 }}>Exercises (one per line)</label>
                  <textarea value={d.exercises} onChange={e => updateDay(i, 'exercises', e.target.value)}
                    rows={2} placeholder={'Bench Press 4×8\nIncline DB Press 3×10'}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#1E293B', border: '1px solid #334155', borderRadius: 6, color: '#F8FAFC', outline: 'none', fontSize: '0.82rem', resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '16px 28px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#94A3B8', cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving}
            style={{ padding: '10px 24px', background: saving ? '#7A6530' : '#C9A84C', border: 'none', borderRadius: 8, color: '#0F172A', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving…' : 'Save Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── DietModal ────────────────────────────────────────────────────────────────
const DietModal = ({ client, trainerName, trainerId, onClose, onSaved }) => {
  const [title, setTitle]     = useState('Diet Plan');
  const [content, setContent] = useState('');
  const [saving, setSaving]   = useState(false);

  const save = async () => {
    if (!content.trim()) { alert('Please enter diet plan content.'); return; }
    setSaving(true);
    const { error } = await supabase.from('diet_plans').insert([{
      client_id:    client.id,
      trainer_id:   trainerId,
      trainer_name: trainerName,
      title,
      content,
      is_active:    true,
    }]);
    setSaving(false);
    if (error) { alert(error.message); return; }
    onSaved();
    onClose();
  };

  const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#1E293B', borderRadius: 16, width: '100%', maxWidth: 560, border: '1px solid #334155' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid #334155' }}>
          <h3 style={{ margin: 0, color: '#F8FAFC' }}>New Diet Plan — {client.name}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: 6 }}>Plan Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', background: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#F8FAFC', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: 6 }}>
              Plan Content — macro splits, meal templates, timing
            </label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={10}
              placeholder={'Calories: 2200 kcal/day\nProtein: 180g | Carbs: 220g | Fat: 70g\n\nBreakfast: 4 eggs, oatmeal 80g, banana\nMid-morning: Whey shake + almonds\nLunch: Chicken breast 200g, rice 150g, salad\nPre-workout: Banana + coffee\nPost-workout: Whey + dextrose\nDinner: Fish 200g, sweet potato, veggies'}
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', background: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#F8FAFC', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.88rem', lineHeight: 1.6 }} />
          </div>
        </div>
        <div style={{ padding: '16px 28px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#94A3B8', cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving}
            style={{ padding: '10px 24px', background: saving ? '#7A6530' : '#C9A84C', border: 'none', borderRadius: 8, color: '#0F172A', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving…' : 'Save Diet Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── TRAINER DASHBOARD ────────────────────────────────────────────────────────
const TrainerDashboard = () => {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toasts, show: toast } = useToast();

  const [activeTab, setActiveTab]         = useState('overview');
  const [clients, setClients]             = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [search, setSearch]               = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [workoutPlans, setWorkoutPlans]   = useState([]);
  const [dietPlans, setDietPlans]         = useState([]);
  const [plansLoading, setPlansLoading]   = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showDietModal, setShowDietModal]   = useState(false);
  const [expandedPlan, setExpandedPlan]   = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  // Load clients
  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    const { data, error } = await supabase
      .from('clients').select('id, name, mobile, gender, email, created_at')
      .order('created_at', { ascending: false });
    if (!error && data?.length) setClients(data);
    else setClients([]);
    setClientsLoading(false);
  }, []);

  useEffect(() => {
    if (user) loadClients(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [user, loadClients]);

  // Load plans for selected client
  const loadPlans = useCallback(async (clientId) => {
    setPlansLoading(true);
    const [wp, dp] = await Promise.all([
      supabase.from('workout_plans').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
      supabase.from('diet_plans').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
    ]);
    setWorkoutPlans(wp.data || []);
    setDietPlans(dp.data || []);
    setPlansLoading(false);
  }, []);

  useEffect(() => {
    if (selectedClient) loadPlans(selectedClient.id); // eslint-disable-line react-hooks/set-state-in-effect
  }, [selectedClient, loadPlans]);

  const deletePlan = async (table, id) => {
    if (!window.confirm('Delete this plan?')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) { toast(error.message, 'error'); return; }
    toast('Deleted');
    loadPlans(selectedClient.id);
  };

  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile?.includes(search)
  );

  const trainerName = profile?.name || user?.email || 'Trainer';
  const initials    = trainerName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0F172A' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #334155', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'trSpin 0.8s linear infinite' }} />
    </div>
  );

  if (!user) return null;

  const navBtn = (tab, label, NavIcon) => (
    <button onClick={() => setActiveTab(tab)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: activeTab === tab ? 'rgba(255,46,46,0.1)' : 'transparent', color: activeTab === tab ? '#EF4444' : '#94A3B8', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem', transition: 'all 0.2s', width: '100%' }}>
      <NavIcon size={18} /> {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{ width: 260, background: '#1E293B', padding: '28px 20px', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.1em', color: '#EF4444', marginBottom: 4 }}>
            SKY<span style={{ color: '#F8FAFC' }}>FIT</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#475569', letterSpacing: '0.05em' }}>TRAINER PORTAL</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navBtn('overview', 'Overview',    Activity)}
          {navBtn('clients',  'My Clients',  Users)}
          {navBtn('assign',   'Assign Plans', FileText)}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#0F172A', borderRadius: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#EF4444,#C9A84C)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#fff', flexShrink: 0 }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trainerName}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Trainer</div>
            </div>
          </div>
          <button onClick={handleSignOut}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#EF4444', cursor: 'pointer', fontSize: '0.85rem' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '36px 40px', overflowY: 'auto' }}>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ margin: '0 0 6px', color: '#F8FAFC', fontSize: '1.8rem' }}>Welcome back, {trainerName.split(' ')[0]}</h1>
              <p style={{ margin: 0, color: '#64748B' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 36 }}>
              {[
                { icon: Users,    val: clients.length, label: 'Total Members' },
                { icon: Calendar, val: '—',            label: 'Sessions Today' },
                { icon: Award,    val: '—',            label: 'Plans Assigned' },
              ].map(({ icon: StatIcon, val, label }) => (
                <div key={label} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, padding: 24 }}>
                  <StatIcon color="#EF4444" size={24} style={{ marginBottom: 14 }} />
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>{val}</div>
                  <div style={{ color: '#64748B', fontSize: '0.85rem' }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} color="#EF4444" /> Member Roster
              </h3>
              {clientsLoading ? <Spinner /> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155' }}>
                      {['#','Name','Mobile','Gender','Joined'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clients.slice(0, 8).map((c, i) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #1E3A5F20' }}
                        onClick={() => { setSelectedClient(c); setActiveTab('assign'); }}
                        onMouseEnter={e => e.currentTarget.style.background = '#0F172A'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        style={{ cursor: 'pointer', transition: 'background 0.15s' }}>
                        <td style={{ padding: '12px', color: '#475569', fontSize: '0.82rem' }}>{i + 1}</td>
                        <td style={{ padding: '12px', color: '#F8FAFC', fontWeight: 500 }}>{c.name}</td>
                        <td style={{ padding: '12px', color: '#94A3B8', fontSize: '0.85rem' }}>{c.mobile}</td>
                        <td style={{ padding: '12px' }}><span style={{ fontSize: '0.75rem', background: c.gender === 'Female' ? 'rgba(236,72,153,0.15)' : 'rgba(59,130,246,0.15)', color: c.gender === 'Female' ? '#F472B6' : '#60A5FA', padding: '3px 8px', borderRadius: 20 }}>{c.gender || '—'}</span></td>
                        <td style={{ padding: '12px', color: '#64748B', fontSize: '0.82rem' }}>{c.created_at?.slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!clientsLoading && clients.length === 0 && (
                <p style={{ textAlign: 'center', color: '#475569', padding: 24 }}>No members in the system yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ── CLIENTS ── */}
        {activeTab === 'clients' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h1 style={{ margin: 0, color: '#F8FAFC' }}>Client Roster</h1>
              <button onClick={loadClients} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#94A3B8', cursor: 'pointer', fontSize: '0.85rem' }}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or mobile…"
                style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px 11px 44px', background: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#F8FAFC', outline: 'none', fontSize: '0.9rem' }} />
            </div>

            {clientsLoading ? <Spinner /> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {filtered.map(c => (
                  <div key={c.id}
                    onClick={() => { setSelectedClient(c); setActiveTab('assign'); }}
                    style={{ background: '#1E293B', border: `1px solid ${selectedClient?.id === c.id ? '#EF4444' : '#334155'}`, borderRadius: 12, padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#EF4444'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = selectedClient?.id === c.id ? '#EF4444' : '#334155'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#EF4444,#C9A84C)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                        {c.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{c.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{c.mobile}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: '#6EE7B7', padding: '3px 8px', borderRadius: 20 }}>
                        {c.gender || 'Member'}
                      </span>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(59,130,246,0.15)', color: '#93C5FD', padding: '3px 8px', borderRadius: 20 }}>
                        {c.created_at?.slice(0, 10)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!clientsLoading && filtered.length === 0 && (
              <p style={{ textAlign: 'center', color: '#475569', padding: 40 }}>No members found.</p>
            )}
          </div>
        )}

        {/* ── ASSIGN PLANS ── */}
        {activeTab === 'assign' && (
          <div>
            <h1 style={{ margin: '0 0 24px', color: '#F8FAFC' }}>Assign Plans</h1>

            {/* Client selector */}
            <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, padding: 20, marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: 8 }}>Select Client</label>
              <select value={selectedClient?.id || ''}
                onChange={e => {
                  const c = clients.find(x => x.id === e.target.value);
                  setSelectedClient(c || null);
                }}
                style={{ width: '100%', padding: '11px 14px', background: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#F8FAFC', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}>
                <option value="">— Choose a client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} · {c.mobile}</option>)}
              </select>
            </div>

            {!selectedClient && (
              <p style={{ textAlign: 'center', color: '#475569', padding: 40 }}>Select a client to view and assign plans.</p>
            )}

            {selectedClient && (
              <>
                {/* Client info strip */}
                <div style={{ background: 'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(201,168,76,0.05))', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#EF4444,#C9A84C)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', color: '#fff', flexShrink: 0 }}>
                    {selectedClient.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '1.05rem' }}>{selectedClient.name}</div>
                    <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>{selectedClient.mobile} · {selectedClient.email || 'No email'}</div>
                  </div>
                </div>

                {plansLoading ? <Spinner /> : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                    {/* Workout Plans */}
                    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, overflow: 'hidden' }}>
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F8FAFC', fontWeight: 600 }}>
                          <Dumbbell size={18} color="#EF4444" /> Workout Plans
                        </div>
                        <button onClick={() => setShowWorkoutModal(true)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#EF4444', border: 'none', borderRadius: 7, color: '#fff', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                          <Plus size={14} /> New Plan
                        </button>
                      </div>
                      <div style={{ padding: '8px 0', maxHeight: 420, overflowY: 'auto' }}>
                        {workoutPlans.length === 0 ? (
                          <p style={{ textAlign: 'center', color: '#475569', padding: 24, fontSize: '0.88rem' }}>No workout plans assigned yet.</p>
                        ) : workoutPlans.map(p => (
                          <div key={p.id} style={{ borderBottom: '1px solid #1E3A5F30' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', cursor: 'pointer' }}
                              onClick={() => setExpandedPlan(expandedPlan === p.id ? null : p.id)}>
                              <div>
                                <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.9rem' }}>{p.title}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.week_label} · {p.created_at?.slice(0, 10)}</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ChevronDown size={16} color="#64748B" style={{ transform: expandedPlan === p.id ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                                <button onClick={e => { e.stopPropagation(); deletePlan('workout_plans', p.id); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}><Trash2 size={15} /></button>
                              </div>
                            </div>
                            {expandedPlan === p.id && (
                              <div style={{ padding: '0 20px 16px', background: '#0F172A' }}>
                                {(p.days || []).map((d, i) => d.focus || d.exercises?.length ? (
                                  <div key={i} style={{ marginBottom: 10 }}>
                                    <div style={{ fontSize: '0.78rem', color: '#C9A84C', fontWeight: 600, marginBottom: 4 }}>{d.day} — {d.focus}</div>
                                    {(d.exercises || []).map((ex, j) => (
                                      <div key={j} style={{ fontSize: '0.78rem', color: '#94A3B8', paddingLeft: 12, marginBottom: 2 }}>• {ex}</div>
                                    ))}
                                  </div>
                                ) : null)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Diet Plans */}
                    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, overflow: 'hidden' }}>
                      <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#F8FAFC', fontWeight: 600 }}>
                          <Apple size={18} color="#10B981" /> Diet Plans
                        </div>
                        <button onClick={() => setShowDietModal(true)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#10B981', border: 'none', borderRadius: 7, color: '#fff', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                          <Plus size={14} /> New Plan
                        </button>
                      </div>
                      <div style={{ padding: '8px 0', maxHeight: 420, overflowY: 'auto' }}>
                        {dietPlans.length === 0 ? (
                          <p style={{ textAlign: 'center', color: '#475569', padding: 24, fontSize: '0.88rem' }}>No diet plans assigned yet.</p>
                        ) : dietPlans.map(p => (
                          <div key={p.id} style={{ borderBottom: '1px solid #1E3A5F30' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', cursor: 'pointer' }}
                              onClick={() => setExpandedPlan(expandedPlan === p.id ? null : p.id)}>
                              <div>
                                <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.9rem' }}>{p.title}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.created_at?.slice(0, 10)}</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ChevronDown size={16} color="#64748B" style={{ transform: expandedPlan === p.id ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                                <button onClick={e => { e.stopPropagation(); deletePlan('diet_plans', p.id); }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 4 }}><Trash2 size={15} /></button>
                              </div>
                            </div>
                            {expandedPlan === p.id && (
                              <div style={{ padding: '12px 20px 16px', background: '#0F172A' }}>
                                <pre style={{ margin: 0, fontSize: '0.78rem', color: '#94A3B8', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.7 }}>{p.content}</pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showWorkoutModal && selectedClient && (
        <WorkoutModal
          client={selectedClient}
          trainerName={trainerName}
          trainerId={user?.id}
          onClose={() => setShowWorkoutModal(false)}
          onSaved={() => { toast('Workout plan saved!'); loadPlans(selectedClient.id); }}
        />
      )}
      {showDietModal && selectedClient && (
        <DietModal
          client={selectedClient}
          trainerName={trainerName}
          trainerId={user?.id}
          onClose={() => setShowDietModal(false)}
          onSaved={() => { toast('Diet plan saved!'); loadPlans(selectedClient.id); }}
        />
      )}

      <Toasts toasts={toasts} />

      <style>{`
        @keyframes trSpin  { to { transform: rotate(360deg); } }
        @keyframes trSlide { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }
      `}</style>
    </div>
  );
};

export default TrainerDashboard;
