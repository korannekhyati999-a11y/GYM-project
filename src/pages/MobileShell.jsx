/**
 * MobileShell — entry point when running inside the Capacitor native app.
 * Handles auth state and routes between: Login → Home | Plans | Profile | Membership
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Home, Dumbbell, Apple, User, LogOut,
  CheckCircle, Circle, AlertTriangle,
  ChevronRight, RefreshCw, Bell,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import LoginPage from './LoginPage';

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spin = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
    <div style={{ width: 32, height: 32, border: '3px solid rgba(201,168,76,0.2)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'mSpin 0.8s linear infinite' }} />
  </div>
);

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────
const TabBar = ({ active, onChange }) => {
  const tabs = [
    { id: 'home',       label: 'Home',    Icon: Home     },
    { id: 'workout',    label: 'Workout', Icon: Dumbbell },
    { id: 'diet',       label: 'Diet',    Icon: Apple    },
    { id: 'profile',    label: 'Profile', Icon: User     },
  ];
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#1E293B', borderTop: '1px solid #334155',
      display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 100,
    }}>
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => onChange(id)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
            <Icon size={22} color={isActive ? '#C9A84C' : '#475569'} strokeWidth={isActive ? 2.5 : 1.8} />
            <span style={{ fontSize: '0.65rem', color: isActive ? '#C9A84C' : '#475569', fontWeight: isActive ? 700 : 400, letterSpacing: '0.03em' }}>{label}</span>
            {isActive && <div style={{ width: 4, height: 4, background: '#C9A84C', borderRadius: '50%', marginTop: -4 }} />}
          </button>
        );
      })}
    </nav>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, marginTop: 4 }}>{children}</div>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 14, padding: '16px 18px', marginBottom: 12, ...style }}>
    {children}
  </div>
);

// ─── HOME TAB ─────────────────────────────────────────────────────────────────
const HomeTab = ({ displayName, membership, workoutPlan, dietPlan, completedTasks, toggleTask }) => {
  const daysLeft = membership?.end_date
    ? Math.ceil((new Date(membership.end_date) - new Date()) / 86400000)
    : null;

  const todayName     = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayWorkout  = (workoutPlan?.days || []).find(d => d.day === todayName);
  const todayExercises = todayWorkout?.exercises || [];

  const totalTasks     = todayExercises.length + (dietPlan ? (dietPlan.content || '').split('\n').filter(l => l.includes(':')).length : 0);
  const doneTasks      = Object.values(completedTasks).filter(Boolean).length;
  const pct            = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div style={{ paddingBottom: 90 }}>
      {/* Greeting */}
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: 4 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
        </div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>
          Hey, {displayName.split(' ')[0]} 👋
        </h1>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* Membership expiry alert */}
        {daysLeft !== null && daysLeft <= 10 && (
          <div style={{ background: daysLeft <= 3 ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)', border: `1px solid ${daysLeft <= 3 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 12, padding: '12px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} color={daysLeft <= 3 ? '#EF4444' : '#F59E0B'} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: daysLeft <= 3 ? '#FCA5A5' : '#FCD34D' }}>
                {daysLeft <= 0 ? 'Membership Expired' : `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{membership?.plan_name}</div>
            </div>
            <ChevronRight size={16} color="#94A3B8" />
          </div>
        )}

        {/* Daily Progress Ring */}
        <Card style={{ background: 'linear-gradient(135deg,rgba(201,168,76,0.12),#1E293B)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
              <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="32" cy="32" r="26" fill="none" stroke="#334155" strokeWidth="6" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="#C9A84C" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 26 * pct / 100} ${2 * Math.PI * 26}`}
                  strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#C9A84C' }}>{pct}%</span>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '1rem' }}>Today's Progress</div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: 2 }}>
                {doneTasks} of {totalTasks || '—'} tasks done
              </div>
              {workoutPlan && <div style={{ fontSize: '0.72rem', color: '#C9A84C', marginTop: 4 }}>{todayWorkout?.focus || 'Rest Day'}</div>}
            </div>
          </div>
        </Card>

        {/* Today's Workout Preview */}
        {todayExercises.length > 0 && (
          <>
            <SectionTitle>Today's Workout — {todayWorkout?.focus}</SectionTitle>
            <Card>
              {todayExercises.slice(0, 3).map((ex, i) => {
                const key = `w-${i}`;
                return (
                  <div key={i} onClick={() => toggleTask(key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < Math.min(todayExercises.length, 3) - 1 ? '1px solid #1E3A5F' : 'none', cursor: 'pointer' }}>
                    {completedTasks[key]
                      ? <CheckCircle size={20} color="#C9A84C" />
                      : <Circle size={20} color="#334155" />}
                    <span style={{ fontSize: '0.88rem', color: completedTasks[key] ? '#64748B' : '#F8FAFC', textDecoration: completedTasks[key] ? 'line-through' : 'none' }}>{ex}</span>
                  </div>
                );
              })}
              {todayExercises.length > 3 && (
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 8, textAlign: 'center' }}>+{todayExercises.length - 3} more exercises</div>
              )}
            </Card>
          </>
        )}

        {/* No plan state */}
        {!workoutPlan && (
          <Card style={{ textAlign: 'center', padding: '28px 18px' }}>
            <Dumbbell size={32} color="#334155" style={{ marginBottom: 10 }} />
            <div style={{ color: '#64748B', fontSize: '0.88rem' }}>No workout plan assigned yet.</div>
            <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: 4 }}>Ask your trainer to assign a plan.</div>
          </Card>
        )}

        {/* Membership quick card */}
        <SectionTitle>Membership</SectionTitle>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#F8FAFC', fontSize: '0.95rem' }}>{membership?.plan_name || 'No Active Plan'}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 3 }}>
                {membership ? `Expires ${membership.end_date}` : 'Contact gym to activate'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: '0.7rem', background: membership && daysLeft > 10 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: membership && daysLeft > 10 ? '#6EE7B7' : '#FCA5A5', padding: '3px 10px', borderRadius: 20 }}>
                {membership ? (daysLeft > 0 ? `${daysLeft}d left` : 'Expired') : 'Inactive'}
              </span>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

// ─── WORKOUT TAB ──────────────────────────────────────────────────────────────
const WorkoutTab = ({ workoutPlan, completedTasks, toggleTask }) => (
  <div style={{ padding: '20px 16px 90px' }}>
    <h2 style={{ margin: '0 0 16px', color: '#F8FAFC', fontSize: '1.3rem', fontWeight: 700 }}>Workout Plan</h2>
    {!workoutPlan ? (
      <Card style={{ textAlign: 'center', padding: 32 }}>
        <Dumbbell size={40} color="#334155" style={{ marginBottom: 12 }} />
        <div style={{ color: '#64748B' }}>No workout plan assigned yet.</div>
      </Card>
    ) : (
      <>
        <div style={{ fontSize: '0.78rem', color: '#C9A84C', fontWeight: 600, marginBottom: 14 }}>
          {workoutPlan.title} · {workoutPlan.week_label}
        </div>
        {(workoutPlan.days || []).map((d, i) => {
          const hasContent = d.focus || (d.exercises || []).length;
          return (
            <Card key={i} style={{ opacity: hasContent ? 1 : 0.4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hasContent ? 10 : 0 }}>
                <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.9rem' }}>{d.day}</div>
                {d.focus && <div style={{ fontSize: '0.72rem', color: '#C9A84C', background: 'rgba(201,168,76,0.1)', padding: '3px 10px', borderRadius: 20 }}>{d.focus}</div>}
                {!hasContent && <div style={{ fontSize: '0.72rem', color: '#475569' }}>Rest</div>}
              </div>
              {(d.exercises || []).map((ex, j) => {
                const key = `wt-${i}-${j}`;
                return (
                  <div key={j} onClick={() => toggleTask(key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid #334155', cursor: 'pointer' }}>
                    {completedTasks[key]
                      ? <CheckCircle size={18} color="#C9A84C" />
                      : <Circle size={18} color="#334155" />}
                    <span style={{ fontSize: '0.85rem', color: completedTasks[key] ? '#64748B' : '#94A3B8', textDecoration: completedTasks[key] ? 'line-through' : 'none' }}>{ex}</span>
                  </div>
                );
              })}
            </Card>
          );
        })}
      </>
    )}
  </div>
);

// ─── DIET TAB ─────────────────────────────────────────────────────────────────
const DietTab = ({ dietPlan, completedTasks, toggleTask }) => {
  if (!dietPlan) return (
    <div style={{ padding: '20px 16px 90px' }}>
      <h2 style={{ margin: '0 0 16px', color: '#F8FAFC', fontSize: '1.3rem', fontWeight: 700 }}>Diet Plan</h2>
      <Card style={{ textAlign: 'center', padding: 32 }}>
        <Apple size={40} color="#334155" style={{ marginBottom: 12 }} />
        <div style={{ color: '#64748B' }}>No diet plan assigned yet.</div>
      </Card>
    </div>
  );

  const lines = (dietPlan.content || '').split('\n').filter(Boolean);
  const meals  = lines.filter(l => l.includes(':'));
  const info   = lines.filter(l => !l.includes(':'));

  return (
    <div style={{ padding: '20px 16px 90px' }}>
      <h2 style={{ margin: '0 0 4px', color: '#F8FAFC', fontSize: '1.3rem', fontWeight: 700 }}>Diet Plan</h2>
      <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: 16 }}>By {dietPlan.trainer_name || 'Trainer'} · {dietPlan.title}</div>

      {info.length > 0 && (
        <Card style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
          {info.map((line, i) => (
            <div key={i} style={{ fontSize: '0.85rem', color: '#6EE7B7', marginBottom: 4 }}>{line}</div>
          ))}
        </Card>
      )}

      <SectionTitle>Meals</SectionTitle>
      {meals.map((line, i) => {
        const key  = `dt-${i}`;
        const [label, ...rest] = line.split(':');
        const detail = rest.join(':').trim();
        return (
          <div key={i} onClick={() => toggleTask(key)}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 16px', background: '#1E293B', border: `1px solid ${completedTasks[key] ? 'rgba(16,185,129,0.4)' : '#334155'}`, borderRadius: 12, marginBottom: 8, cursor: 'pointer', transition: 'border-color 0.2s' }}>
            {completedTasks[key]
              ? <CheckCircle size={20} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
              : <Circle size={20} color="#334155" style={{ flexShrink: 0, marginTop: 2 }} />}
            <div>
              <div style={{ fontWeight: 600, color: completedTasks[key] ? '#64748B' : '#F8FAFC', fontSize: '0.88rem', textDecoration: completedTasks[key] ? 'line-through' : 'none' }}>{label}</div>
              {detail && <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>{detail}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────
const ProfileTab = ({ user, profile, clientRecord, membership, signOut, onLink }) => {
  const displayName = clientRecord?.name || profile?.name || user?.email || 'Member';
  const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const [linkPhone, setLinkPhone]     = useState('');
  const [linkError, setLinkError]     = useState('');
  const [linking, setLinking]         = useState(false);

  const handleLink = async (e) => {
    e.preventDefault();
    setLinkError(''); setLinking(true);
    const phone = linkPhone.trim();
    const { data, error } = await supabase.from('clients').select('id, name').eq('mobile', phone).single();
    if (error || !data) { setLinkError('No member found with that number. Contact gym admin.'); setLinking(false); return; }
    const { error: upErr } = await supabase.from('profiles').update({ linked_id: data.id, name: data.name }).eq('id', user.id);
    if (upErr) { setLinkError(upErr.message); setLinking(false); return; }
    onLink();
    setLinking(false);
  };

  const daysLeft = membership?.end_date
    ? Math.ceil((new Date(membership.end_date) - new Date()) / 86400000)
    : null;

  return (
    <div style={{ padding: '20px 16px 90px' }}>
      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{ width: 68, height: 68, background: 'linear-gradient(135deg,#C9A84C,#10B981)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem', color: '#fff', flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#F8FAFC' }}>{displayName}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 2 }}>{user?.email}</div>
          <div style={{ display: 'inline-block', fontSize: '0.68rem', background: 'rgba(201,168,76,0.15)', color: '#C9A84C', padding: '2px 10px', borderRadius: 20, marginTop: 4, textTransform: 'capitalize' }}>
            {profile?.role || 'Member'}
          </div>
        </div>
      </div>

      {/* Link account if not linked */}
      {!profile?.linked_id && (
        <Card style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, color: '#C9A84C', fontSize: '0.88rem', marginBottom: 8 }}>Link Your Membership</div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: 12 }}>Enter your registered mobile number to connect your gym account.</div>
          <form onSubmit={handleLink} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input type="tel" placeholder="+91 98765 43210" value={linkPhone} onChange={e => setLinkPhone(e.target.value)} required
              style={{ padding: '10px 14px', background: '#0F172A', border: `1px solid ${linkError ? '#EF4444' : '#334155'}`, borderRadius: 8, color: '#F8FAFC', outline: 'none', fontSize: '0.88rem' }} />
            {linkError && <div style={{ fontSize: '0.75rem', color: '#FCA5A5' }}>{linkError}</div>}
            <button type="submit" disabled={linking}
              style={{ padding: '10px', background: linking ? '#7A6530' : '#C9A84C', border: 'none', borderRadius: 8, color: '#0F172A', fontWeight: 700, cursor: linking ? 'not-allowed' : 'pointer', fontSize: '0.88rem' }}>
              {linking ? 'Linking…' : 'Link Account'}
            </button>
          </form>
        </Card>
      )}

      {/* Info rows */}
      <SectionTitle>Personal Info</SectionTitle>
      <Card>
        {[
          { label: 'Name',   val: clientRecord?.name  || displayName },
          { label: 'Mobile', val: clientRecord?.mobile || '—' },
          { label: 'Email',  val: clientRecord?.email  || user?.email },
          { label: 'Gender', val: clientRecord?.gender || '—' },
        ].map(({ label, val }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
            <span style={{ color: '#64748B', fontSize: '0.85rem' }}>{label}</span>
            <span style={{ color: '#F8FAFC', fontSize: '0.85rem', fontWeight: 500 }}>{val}</span>
          </div>
        ))}
      </Card>

      <SectionTitle>Membership</SectionTitle>
      <Card>
        {[
          { label: 'Plan',       val: membership?.plan_name  || '—' },
          { label: 'Status',     val: membership?.status     || '—' },
          { label: 'Start',      val: membership?.start_date || '—' },
          { label: 'Expiry',     val: membership?.end_date   || '—' },
          { label: 'Days Left',  val: daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} days` : 'Expired') : '—' },
          { label: 'Amount',     val: membership?.plan_price ? `₹${membership.plan_price.toLocaleString()}` : '—' },
        ].map(({ label, val }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #334155' }}>
            <span style={{ color: '#64748B', fontSize: '0.85rem' }}>{label}</span>
            <span style={{ color: '#F8FAFC', fontSize: '0.85rem', fontWeight: 500 }}>{val}</span>
          </div>
        ))}
      </Card>

      {/* Sign out */}
      <button onClick={signOut}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px', background: 'transparent', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#EF4444', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, marginTop: 8 }}>
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
};

// ─── MOBILE SHELL ROOT ────────────────────────────────────────────────────────
const MobileShell = () => {
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab]       = useState('home');
  const [clientRecord, setClientRecord] = useState(null);
  const [membership, setMembership]     = useState(null);
  const [workoutPlan, setWorkoutPlan]   = useState(null);
  const [dietPlan, setDietPlan]         = useState(null);
  const [dataLoading, setDataLoading]   = useState(false);
  const [completedTasks, setCompletedTasks] = useState({});

  const toggleTask = (key) => setCompletedTasks(p => ({ ...p, [key]: !p[key] }));

  const loadData = useCallback(async (linkedId) => {
    setDataLoading(true);
    try {
      const [cr, wp, dp] = await Promise.all([
        supabase.from('clients').select('*').eq('id', linkedId).single(),
        supabase.from('workout_plans').select('*').eq('client_id', linkedId).eq('is_active', true).order('created_at', { ascending: false }).limit(1),
        supabase.from('diet_plans').select('*').eq('client_id', linkedId).eq('is_active', true).order('created_at', { ascending: false }).limit(1),
      ]);
      if (!cr.error && cr.data) {
        setClientRecord(cr.data);
        // Load membership by name
        const { data: mb } = await supabase.from('memberships').select('*').eq('member_name', cr.data.name).order('created_at', { ascending: false }).limit(1);
        if (mb?.length) setMembership(mb[0]);
      }
      if (!wp.error && wp.data?.length) setWorkoutPlan(wp.data[0]);
      if (!dp.error && dp.data?.length) setDietPlan(dp.data[0]);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && profile?.linked_id) {
      loadData(profile.linked_id);
    }
  }, [user, profile, loadData]);

  const handleSignOut = async () => { await signOut(); };
  const handleLink    = async () => { await refreshProfile(); };

  const displayName = clientRecord?.name || profile?.name || user?.email || 'Member';

  // ── Auth loading ──────────────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0F172A' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '0.1em', color: '#C9A84C', marginBottom: 20 }}>SKY<span style={{ color: '#F8FAFC' }}>FIT</span></div>
        <div style={{ width: 32, height: 32, border: '3px solid rgba(201,168,76,0.2)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'mSpin 0.8s linear infinite', margin: '0 auto' }} />
      </div>
    </div>
  );

  // ── Not logged in → show login ────────────────────────────────────────────
  if (!user) return <LoginPage />;

  // ── Main app ──────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#0F172A', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', color: '#F8FAFC', paddingTop: 'env(safe-area-inset-top)' }}>

      {/* Status bar spacer for notch/island */}
      <div style={{ height: 'env(safe-area-inset-top)', background: '#0F172A' }} />

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #1E293B' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.1em', color: '#C9A84C' }}>SKY<span style={{ color: '#F8FAFC' }}>FIT</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => profile?.linked_id && loadData(profile.linked_id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}>
            <RefreshCw size={18} />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}>
            <Bell size={18} />
          </button>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#C9A84C,#10B981)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#fff' }}>
            {displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ overflowY: 'auto', height: 'calc(100vh - env(safe-area-inset-top) - 60px - 60px)' }}>
        {dataLoading ? <Spin /> : (
          <>
            {activeTab === 'home'    && <HomeTab displayName={displayName} clientRecord={clientRecord} membership={membership} workoutPlan={workoutPlan} dietPlan={dietPlan} completedTasks={completedTasks} toggleTask={toggleTask} />}
            {activeTab === 'workout' && <WorkoutTab workoutPlan={workoutPlan} completedTasks={completedTasks} toggleTask={toggleTask} />}
            {activeTab === 'diet'    && <DietTab dietPlan={dietPlan} completedTasks={completedTasks} toggleTask={toggleTask} />}
            {activeTab === 'profile' && <ProfileTab user={user} profile={profile} clientRecord={clientRecord} membership={membership} signOut={handleSignOut} onLink={handleLink} />}
          </>
        )}
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      <style>{`
        @keyframes mSpin { to { transform: rotate(360deg); } }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        input, button, textarea, select { font-family: inherit; }
      `}</style>
    </div>
  );
};

export default MobileShell;
