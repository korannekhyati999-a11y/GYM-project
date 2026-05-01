import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Calendar, Trophy, AlertTriangle,
  CheckCircle, Circle, LogOut, Dumbbell, Apple,
  User, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
    <div style={{ width: 32, height: 32, border: '3px solid rgba(201,168,76,0.2)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'cdSpin 0.8s linear infinite' }} />
  </div>
);

// ─── CLIENT DASHBOARD ─────────────────────────────────────────────────────────
const ClientDashboard = () => {
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]       = useState('overview');
  const [clientRecord, setClientRecord] = useState(null);
  const [membership, setMembership]     = useState(null);
  const [workoutPlan, setWorkoutPlan]   = useState(null);
  const [dietPlan, setDietPlan]         = useState(null);
  const [dataLoading, setDataLoading]   = useState(true);

  // link account: phone input state
  const [linkPhone, setLinkPhone]       = useState('');
  const [linkError, setLinkError]       = useState('');
  const [linking, setLinking]           = useState(false);

  // local tasks (togglable checklist from workout plan)
  const [completedTasks, setCompletedTasks] = useState({});

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  const loadData = useCallback(async (linkedId) => {
    setDataLoading(true);
    try {
      const [cr, wp, dp] = await Promise.all([
        supabase.from('clients').select('*').eq('id', linkedId).single(),
        supabase.from('workout_plans').select('*').eq('client_id', linkedId).eq('is_active', true).order('created_at', { ascending: false }).limit(1),
        supabase.from('diet_plans').select('*').eq('client_id', linkedId).eq('is_active', true).order('created_at', { ascending: false }).limit(1),
      ]);
      if (!cr.error && cr.data) setClientRecord(cr.data);
      if (!wp.error && wp.data?.length) setWorkoutPlan(wp.data[0]);
      if (!dp.error && dp.data?.length) setDietPlan(dp.data[0]);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && profile?.linked_id) {
      loadData(profile.linked_id);
    } else if (user && profile && !profile.linked_id) {
      setDataLoading(false);
    }
  }, [user, profile, loadData]);

  // Load membership separately once clientRecord name is known
  useEffect(() => {
    if (clientRecord?.name) {
      supabase.from('memberships')
        .select('*').eq('member_name', clientRecord.name)
        .order('created_at', { ascending: false }).limit(1)
        .then(({ data }) => { if (data?.length) setMembership(data[0]); });
    }
  }, [clientRecord]);

  const handleLinkAccount = async (e) => {
    e.preventDefault();
    setLinkError(''); setLinking(true);
    const phone = linkPhone.trim();
    const { data, error } = await supabase
      .from('clients').select('id, name').eq('mobile', phone).single();
    if (error || !data) {
      setLinkError('No member found with that mobile number. Contact the gym admin.');
      setLinking(false); return;
    }
    const { error: upErr } = await supabase
      .from('profiles').update({ linked_id: data.id, name: data.name }).eq('id', user.id);
    if (upErr) { setLinkError(upErr.message); setLinking(false); return; }
    await refreshProfile();
    setLinking(false);
  };

  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  const toggleTask = (key) => setCompletedTasks(p => ({ ...p, [key]: !p[key] }));

  const displayName = clientRecord?.name || profile?.name || user?.email || 'Member';
  const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  // Days until membership expires
  const daysLeft = membership?.end_date
    ? Math.ceil((new Date(membership.end_date) - new Date()) / 86400000)
    : null;

  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0F172A' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #334155', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'cdSpin 0.8s linear infinite' }} />
    </div>
  );

  if (!user) return null;

  const navBtn = (tab, label, NavIcon) => (
    <button onClick={() => setActiveTab(tab)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: activeTab === tab ? 'rgba(201,168,76,0.12)' : 'transparent', color: activeTab === tab ? '#C9A84C' : '#94A3B8', border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontSize: '0.92rem', transition: 'all 0.2s', width: '100%' }}>
      <NavIcon size={18} /> {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{ width: 260, background: '#1E293B', padding: '28px 20px', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.1em', color: '#C9A84C', marginBottom: 4 }}>
            SKY<span style={{ color: '#F8FAFC' }}>FIT</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#475569', letterSpacing: '0.05em' }}>MEMBER PORTAL</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {navBtn('overview',  "Today's Plan",     Activity)}
          {navBtn('plans',     'My Plans',         Dumbbell)}
          {navBtn('progress',  'Transformation',   Trophy)}
          {navBtn('membership','Membership',       Calendar)}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#0F172A', borderRadius: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#C9A84C,#10B981)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#fff', flexShrink: 0 }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Member</div>
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

        {/* Account linking prompt */}
        {!profile?.linked_id && !dataLoading && (
          <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 14, padding: '24px 28px', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <User size={24} color="#C9A84C" />
              <div>
                <div style={{ fontWeight: 600, color: '#F8FAFC', marginBottom: 2 }}>Link Your Membership</div>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Enter the mobile number used during gym registration.</div>
              </div>
            </div>
            <form onSubmit={handleLinkAccount} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <input
                type="tel" placeholder="+91 98765 43210" value={linkPhone}
                onChange={e => setLinkPhone(e.target.value)} required
                style={{ flex: 1, minWidth: 200, padding: '10px 14px', background: '#0F172A', border: `1px solid ${linkError ? '#EF4444' : '#334155'}`, borderRadius: 8, color: '#F8FAFC', outline: 'none', fontSize: '0.9rem' }}
              />
              <button type="submit" disabled={linking}
                style={{ padding: '10px 20px', background: linking ? '#7A6530' : '#C9A84C', border: 'none', borderRadius: 8, color: '#0F172A', fontWeight: 700, cursor: linking ? 'not-allowed' : 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                {linking ? 'Linking…' : 'Link Account'}
              </button>
              {linkError && <div style={{ width: '100%', color: '#FCA5A5', fontSize: '0.82rem' }}>{linkError}</div>}
            </form>
          </div>
        )}

        {/* Membership expiry alert */}
        {daysLeft !== null && daysLeft <= 10 && (
          <div style={{ background: daysLeft <= 3 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${daysLeft <= 3 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: daysLeft <= 3 ? '#FCA5A5' : '#FCD34D' }}>
              <AlertTriangle size={22} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  {daysLeft <= 0 ? 'Membership Expired' : `Membership expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
                </div>
                <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>
                  {membership?.plan_name} · Expires {membership?.end_date}
                </div>
              </div>
            </div>
            <button style={{ background: daysLeft <= 3 ? '#EF4444' : '#F59E0B', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              Renew Now
            </button>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: '0 0 6px', color: '#F8FAFC', fontSize: '1.75rem' }}>Welcome, {displayName.split(' ')[0]}</h1>
            <p style={{ margin: 0, color: '#64748B' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          {profile?.linked_id && (
            <button onClick={() => loadData(profile.linked_id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#94A3B8', cursor: 'pointer', fontSize: '0.82rem' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          )}
        </div>

        {/* ── TODAY'S PLAN ── */}
        {activeTab === 'overview' && (
          <div>
            {dataLoading ? <Spinner /> : (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Workout checklist */}
                  <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Dumbbell size={18} color="#EF4444" />
                      <span style={{ fontWeight: 600, color: '#F8FAFC' }}>Today's Workout</span>
                      {workoutPlan && <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: 4 }}>— {workoutPlan.title}</span>}
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                      {!workoutPlan ? (
                        <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>No workout plan assigned yet. Ask your trainer to assign one.</p>
                      ) : (
                        (() => {
                          const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                          const todayPlan = (workoutPlan.days || []).find(d => d.day === todayName);
                          const exercises = todayPlan?.exercises || [];
                          return exercises.length > 0 ? (
                            <div>
                              <div style={{ fontSize: '0.8rem', color: '#C9A84C', fontWeight: 600, marginBottom: 12 }}>
                                {todayName} — {todayPlan.focus}
                              </div>
                              {exercises.map((ex, i) => {
                                const key = `workout-${i}`;
                                return (
                                  <div key={i} onClick={() => toggleTask(key)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: completedTasks[key] ? 'rgba(201,168,76,0.06)' : '#0F172A', border: `1px solid ${completedTasks[key] ? '#C9A84C' : '#1E3A5F'}`, borderRadius: 8, marginBottom: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
                                    {completedTasks[key]
                                      ? <CheckCircle color="#C9A84C" size={20} />
                                      : <Circle color="#475569" size={20} />}
                                    <span style={{ color: completedTasks[key] ? '#64748B' : '#F8FAFC', textDecoration: completedTasks[key] ? 'line-through' : 'none', fontSize: '0.9rem' }}>{ex}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>Rest day or no exercises for today.</p>
                          );
                        })()
                      )}
                    </div>
                  </div>

                  {/* Diet checklist */}
                  <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Apple size={18} color="#10B981" />
                      <span style={{ fontWeight: 600, color: '#F8FAFC' }}>Dietary Plan</span>
                      {dietPlan && <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: 4 }}>— {dietPlan.title}</span>}
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                      {!dietPlan ? (
                        <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>No diet plan assigned yet.</p>
                      ) : (
                        dietPlan.content.split('\n').filter(Boolean).map((line, i) => {
                          const key = `diet-${i}`;
                          const isMeal = line.toLowerCase().includes(':');
                          return isMeal ? (
                            <div key={i} onClick={() => toggleTask(key)}
                              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: completedTasks[key] ? 'rgba(16,185,129,0.06)' : '#0F172A', border: `1px solid ${completedTasks[key] ? '#10B981' : '#1E3A5F'}`, borderRadius: 8, marginBottom: 8, cursor: 'pointer', transition: 'all 0.2s' }}>
                              {completedTasks[key]
                                ? <CheckCircle color="#10B981" size={20} />
                                : <Circle color="#475569" size={20} />}
                              <span style={{ color: completedTasks[key] ? '#64748B' : '#F8FAFC', textDecoration: completedTasks[key] ? 'line-through' : 'none', fontSize: '0.88rem' }}>{line}</span>
                            </div>
                          ) : (
                            <div key={i} style={{ fontSize: '0.8rem', color: '#64748B', padding: '2px 14px', marginBottom: 4 }}>{line}</div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Membership card */}
                  <div style={{ background: membership ? 'linear-gradient(135deg,rgba(201,168,76,0.15),rgba(16,185,129,0.05))' : '#1E293B', border: `1px solid ${membership ? 'rgba(201,168,76,0.3)' : '#334155'}`, borderRadius: 14, padding: 20 }}>
                    <Calendar color="#C9A84C" size={28} style={{ marginBottom: 12 }} />
                    <div style={{ fontWeight: 600, color: '#F8FAFC', marginBottom: 4 }}>
                      {membership?.plan_name || 'No Active Plan'}
                    </div>
                    {membership ? (
                      <>
                        <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: 6 }}>
                          {membership.start_date} → {membership.end_date}
                        </div>
                        <div style={{ display: 'inline-block', fontSize: '0.75rem', background: daysLeft > 10 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: daysLeft > 10 ? '#6EE7B7' : '#FCA5A5', padding: '3px 10px', borderRadius: 20 }}>
                          {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: '0.82rem', color: '#475569' }}>Contact the gym to activate your membership.</div>
                    )}
                  </div>

                  {/* Trainer info */}
                  {workoutPlan?.trainer_name && (
                    <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, padding: 20 }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: 8 }}>YOUR TRAINER</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#EF4444,#C9A84C)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', flexShrink: 0, fontSize: '0.9rem' }}>
                          {workoutPlan.trainer_name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{workoutPlan.trainer_name}</div>
                      </div>
                    </div>
                  )}

                  {/* Progress summary */}
                  <div style={{ background: 'linear-gradient(135deg,rgba(201,168,76,0.12),#1E293B)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 14, padding: 20 }}>
                    <Trophy color="#C9A84C" size={28} style={{ marginBottom: 12 }} />
                    <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '1.1rem', marginBottom: 4 }}>
                      {Object.values(completedTasks).filter(Boolean).length} / {Object.keys(completedTasks).length || '—'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Tasks completed today</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MY PLANS ── */}
        {activeTab === 'plans' && (
          <div>
            <h2 style={{ margin: '0 0 24px', color: '#F8FAFC' }}>My Assigned Plans</h2>
            {dataLoading ? <Spinner /> : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                {/* Workout Plan */}
                <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Dumbbell size={18} color="#EF4444" />
                    <span style={{ fontWeight: 600, color: '#F8FAFC' }}>Workout Plan</span>
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    {!workoutPlan ? (
                      <p style={{ color: '#475569', fontSize: '0.88rem' }}>No workout plan assigned yet.</p>
                    ) : (
                      <>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{workoutPlan.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{workoutPlan.week_label} · By {workoutPlan.trainer_name || 'Trainer'}</div>
                        </div>
                        {(workoutPlan.days || []).map((d, i) => (
                          d.focus || d.exercises?.length ? (
                            <div key={i} style={{ background: '#0F172A', borderRadius: 10, padding: '14px 16px', marginBottom: 10, border: '1px solid #1E293B' }}>
                              <div style={{ fontWeight: 600, color: '#C9A84C', fontSize: '0.85rem', marginBottom: 8 }}>{d.day} — {d.focus}</div>
                              {(d.exercises || []).map((ex, j) => (
                                <div key={j} style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: 4 }}>• {ex}</div>
                              ))}
                            </div>
                          ) : null
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Diet Plan */}
                <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Apple size={18} color="#10B981" />
                    <span style={{ fontWeight: 600, color: '#F8FAFC' }}>Diet Plan</span>
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    {!dietPlan ? (
                      <p style={{ color: '#475569', fontSize: '0.88rem' }}>No diet plan assigned yet.</p>
                    ) : (
                      <>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontWeight: 600, color: '#F8FAFC' }}>{dietPlan.title}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>By {dietPlan.trainer_name || 'Trainer'}</div>
                        </div>
                        <pre style={{ margin: 0, fontSize: '0.83rem', color: '#94A3B8', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.8 }}>
                          {dietPlan.content}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TRANSFORMATION ── */}
        {activeTab === 'progress' && (
          <div>
            <h2 style={{ margin: '0 0 24px', color: '#F8FAFC' }}>Transformation Report</h2>
            <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, padding: 32 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 32 }}>
                {[
                  { label: 'Start Weight', val: '—', unit: 'kg' },
                  { label: 'Current Weight', val: '—', unit: 'kg' },
                  { label: 'Goal Progress', val: '—', unit: '%' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F8FAFC' }}>
                      {s.val} <span style={{ fontSize: '0.9rem', color: '#475569' }}>{s.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ color: '#475569', fontSize: '0.88rem', textAlign: 'center', padding: '20px 0' }}>
                Progress tracking charts will be available once your trainer logs measurements.
              </p>
            </div>
          </div>
        )}

        {/* ── MEMBERSHIP ── */}
        {activeTab === 'membership' && (
          <div>
            <h2 style={{ margin: '0 0 24px', color: '#F8FAFC' }}>Membership Details</h2>
            {dataLoading ? <Spinner /> : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, padding: 28 }}>
                  <h3 style={{ margin: '0 0 20px', color: '#F8FAFC', fontSize: '1rem' }}>Current Plan</h3>
                  {membership ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {[
                        { label: 'Plan', val: membership.plan_name },
                        { label: 'Status', val: membership.status },
                        { label: 'Start Date', val: membership.start_date },
                        { label: 'End Date', val: membership.end_date },
                        { label: 'Amount Paid', val: `₹${membership.plan_price?.toLocaleString()}` },
                      ].map(({ label, val }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
                          <span style={{ color: '#64748B', fontSize: '0.88rem' }}>{label}</span>
                          <span style={{ color: '#F8FAFC', fontWeight: 500, fontSize: '0.88rem' }}>{val || '—'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#475569' }}>No membership record found. Please contact the gym admin.</p>
                  )}
                </div>

                <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, padding: 28 }}>
                  <h3 style={{ margin: '0 0 20px', color: '#F8FAFC', fontSize: '1rem' }}>Profile Info</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { label: 'Name',   val: clientRecord?.name || displayName },
                      { label: 'Mobile', val: clientRecord?.mobile || '—' },
                      { label: 'Email',  val: clientRecord?.email || user?.email },
                      { label: 'Gender', val: clientRecord?.gender || '—' },
                    ].map(({ label, val }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
                        <span style={{ color: '#64748B', fontSize: '0.88rem' }}>{label}</span>
                        <span style={{ color: '#F8FAFC', fontWeight: 500, fontSize: '0.88rem' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        @keyframes cdSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ClientDashboard;
