import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Phone, Users, Repeat, ClipboardList, Calendar,
  CreditCard, BarChart2, MessageSquare, UserCheck,
  Activity, Search, ChevronDown, Zap, User,
  Bell, BookOpen, CheckCircle, Star,
  Dumbbell, HelpCircle, Shield, TrendingUp, X, LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import '../AdminPanel.css';
import { supabase } from '../supabaseClient';

// ─── Nav config ───────────────────────────────────────────────────────────────
const navItems = [
  { name: 'Dashboard',        icon: Home,          color: '#06B6D4' },
  { name: 'Enquiries',        icon: Phone,         color: '#EF4444' },
  { name: 'Members',          icon: Users,         color: '#10B981' },
  { name: 'Follow Ups',       icon: Repeat,        color: '#F59E0B' },
  { name: 'Membership Plans', icon: ClipboardList, color: '#06B6D4' },
  { name: 'Schedule',         icon: Calendar,      color: '#94A3B8' },
  { name: 'Memberships',      icon: UserCheck,     color: '#22D3EE' },
  { name: 'Payments',         icon: CreditCard,    color: '#3B82F6' },
  { name: 'Reports',          icon: BarChart2,     color: '#F59E0B' },
  { name: 'Feedbacks',        icon: MessageSquare, color: '#94A3B8' },
  { name: 'Employees',        icon: Users,         color: '#10B981' },
  { name: 'Tutorial',         icon: BookOpen,      color: '#8B5CF6' },
];

// ─── useTable hook ────────────────────────────────────────────────────────────
const useTable = (table, fallback = []) => {
  const [data, setData]       = useState(fallback);
  const [loading, setLoading] = useState(true);
  const fb = useRef(fallback);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from(table).select('*').order('created_at', { ascending: false });
      setData(!error && rows?.length ? rows : fb.current);
    } catch { setData(fb.current); }
    setLoading(false);
  }, [table]);

  useEffect(() => { load(); }, [load]);

  const upsert = (form, id) =>
    id ? supabase.from(table).update(form).eq('id', id)
       : supabase.from(table).insert([form]);

  const remove = (id) => supabase.from(table).delete().eq('id', id);

  return { data, loading, load, upsert, remove };
};

// ─── useToast hook ────────────────────────────────────────────────────────────
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  }, []);
  return { toasts, show };
};

// ─── Toast display ────────────────────────────────────────────────────────────
const Toasts = ({ toasts }) => (
  <div className="toast-container">
    {toasts.map(t => (
      <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
    ))}
  </div>
);

// ─── Modal shell ──────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, onSubmit, children, wide }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal-box" style={wide ? { width: 660 } : {}}>
      <div className="modal-header">
        <span className="modal-title">{title}</span>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <form onSubmit={e => { e.preventDefault(); onSubmit(new FormData(e.target)); }}>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    </div>
  </div>
);

const Spinner = () => (
  <div className="spinner-overlay"><div className="spinner" /></div>
);

// ─── Shared helpers ───────────────────────────────────────────────────────────
const StatBox = ({ value, label, color = 'cyan', sub }) => (
  <div className="widget-stat-box">
    <div className={`stat-value ${color}`}>{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-sub-grid">{sub}</div>}
  </div>
);

const SectionHeader = ({ title, children }) => (
  <div className="widget-header">
    {title}
    {children && <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>{children}</div>}
  </div>
);

const FilterBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding:'4px 12px', borderRadius:'5px', border:'1px solid',
    borderColor: active ? '#C9A84C' : '#E5E7EB',
    background: active ? 'rgba(201,168,76,0.1)' : 'transparent',
    color: active ? '#C9A84C' : '#6B7280',
    fontSize:'0.75rem', fontWeight:600, cursor:'pointer',
  }}>{label}</button>
);

const Stars = ({ rating }) => (
  <span style={{ display:'inline-flex', gap:'2px' }}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={14} fill={i <= rating ? '#F59E0B' : 'none'} color={i <= rating ? '#F59E0B' : '#D1D5DB'} />
    ))}
  </span>
);

// form field helpers
const F = {};
F.Field = ({ label, children, span2 }) => (
  <div className={`modal-field${span2?' span2':''}`}>
    <label className="modal-label">{label}</label>
    {children}
  </div>
);
F.Input = (props) => <input className="modal-input" {...props} />;
F.Select = ({ children, ...props }) => <select className="modal-select" {...props}>{children}</select>;
F.Textarea = (props) => <textarea className="modal-textarea" {...props} />;

// ─── Main AdminPanel ──────────────────────────────────────────────────────────
const AdminPanel = () => {
  const [activeView, setActiveView] = useState('Dashboard');
  const [clients, setClients]       = useState([]);
  const { toasts, show: showToast } = useToast();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [authLoading, user, navigate]);

  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  const adminName    = profile?.name || user?.email || 'Admin';
  const adminInitials = adminName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients').select('*').order('created_at', { ascending: false });
        if (error) { loadDummy(); return; }
        if (data?.length) {
          setClients(data.map(d => ({
            personal: { name: d.name, mobile: d.mobile, gender: d.gender, email: d.email },
            ...(d.full_data || {}),
          })));
        } else { loadDummy(); }
      } catch { loadDummy(); }
    };
    fetchClients();
    const sub = supabase.channel('clients-ch')
      .on('postgres_changes', { event:'*', schema:'public', table:'clients' }, fetchClients)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const loadDummy = () => setClients([
    { personal: { name:'Arnav Totla',  mobile:'+919009452111', gender:'Male',   email:'arnav@example.com' } },
    { personal: { name:'Priya Sharma', mobile:'+919876543210', gender:'Female', email:'priya@example.com' } },
  ]);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-brand">SKY<span>FIT</span></div>
          <div className="admin-brand-sub">Making World Fitter</div>
        </div>
        <nav className="admin-nav">
          {navItems.map(item => (
            <button
              key={item.name}
              className={`admin-nav-item ${activeView === item.name ? 'active' : ''}`}
              onClick={() => setActiveView(item.name)}
            >
              <item.icon size={17} color={activeView === item.name ? '#C9A84C' : item.color} />
              {item.name}
            </button>
          ))}
          <div className="admin-nav-group-title">Portals</div>
          <button className="admin-nav-item external-link" onClick={() => navigate('/app')}>
            <Zap size={17} color="#C9A84C" /> Live Sync
          </button>
          <button className="admin-nav-item external-link" onClick={() => navigate('/trainer')}>
            <Activity size={17} color="#EF4444" /> Trainer
          </button>
          <button className="admin-nav-item external-link" onClick={() => navigate('/client')}>
            <User size={17} color="#10B981" /> Client
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-breadcrumb">
            <span className="admin-breadcrumb-parent">SkyFit</span>
            <span className="admin-breadcrumb-sep">›</span>
            <span className="admin-breadcrumb-current">{activeView}</span>
          </div>
          <div className="admin-header-actions">
            <button className="admin-bell-btn"><Bell size={20} /></button>
            <div className="admin-avatar-pill">
              <div className="admin-avatar-circle">{adminInitials}</div>
              <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminName}</span>
              <ChevronDown size={14} />
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'transparent', border: '1px solid #E5E7EB', borderRadius: 8, color: '#EF4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </header>

        <div className="admin-content">
          {activeView === 'Dashboard'        && <DashboardView        clients={clients} />}
          {activeView === 'Enquiries'        && <EnquiriesView        showToast={showToast} />}
          {activeView === 'Members'          && <MembersView          showToast={showToast} />}
          {activeView === 'Follow Ups'       && <FollowUpsView        showToast={showToast} />}
          {activeView === 'Membership Plans' && <MembershipPlansView  showToast={showToast} />}
          {activeView === 'Schedule'         && <ScheduleView         showToast={showToast} />}
          {activeView === 'Memberships'      && <MembershipsView      clients={clients} showToast={showToast} />}
          {activeView === 'Payments'         && <PaymentsView         showToast={showToast} />}
          {activeView === 'Reports'          && <ReportsView          clients={clients} />}
          {activeView === 'Feedbacks'        && <FeedbacksView        showToast={showToast} />}
          {activeView === 'Employees'        && <EmployeesView        showToast={showToast} />}
          {activeView === 'Tutorial'         && <TutorialView />}
        </div>
      </main>

      <Toasts toasts={toasts} />
    </div>
  );
};

// ─── DASHBOARD — real stats from DB ──────────────────────────────────────────
const DashboardView = ({ clients }) => {
  const [stats, setStats]         = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setStatsLoading(true);
      const today = new Date().toISOString().slice(0, 10);
      const [enq, mem, pay, fup, att] = await Promise.all([
        supabase.from('enquiries').select('id, status'),
        supabase.from('clients').select('id'),
        supabase.from('payments').select('amount, mode').eq('payment_date', today),
        supabase.from('follow_ups').select('*').gte('follow_up_date', today).order('follow_up_date').limit(10),
        supabase.from('attendance').select('id').eq('check_in_date', today),
      ]);

      const enqData  = enq.data  || [];
      const payData  = pay.data  || [];
      const totalPay = payData.reduce((s, p) => s + (p.amount || 0), 0);

      setStats({
        totalMembers:    (mem.data || []).length,
        todayAttendance: (att.data || []).length,
        enquiriesOpen:   enqData.filter(e => e.status === 'Hot' || e.status === 'Warm').length,
        enquiriesClosed: enqData.filter(e => e.status === 'Cold').length,
        todayRevenue:    totalPay,
        todayPayments:   payData.length,
      });
      setFollowUps(fup.data || []);
      setStatsLoading(false);
    };
    load();
  }, []);

  const s = stats || {};

  return (
    <div style={{ animation:'fadeIn 0.25s' }}>
      <div className="admin-controls">
        <div className="admin-date-picker">
          <Calendar size={15} />{new Date().toLocaleDateString('en-GB')}<ChevronDown size={13} />
        </div>
        <div className="admin-search-bar">
          <Search size={15} />
          <input type="text" placeholder="Search by Name / Mobile No." />
        </div>
      </div>

      {/* Today's Follow-ups from DB */}
      <div className="admin-widget-section">
        <div className="widget-header dark">
          Today's Follow Ups
          {statsLoading && <span style={{ marginLeft:8,fontSize:'0.75rem',color:'#94A3B8' }}>Loading…</span>}
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead><tr><th>Type</th><th>Name &amp; Number</th><th>Follow Up Date</th><th>Convertibility</th><th>Comment</th></tr></thead>
            <tbody>
              {followUps.length === 0 && !statsLoading && (
                <tr><td colSpan={5} style={{ textAlign:'center',color:'#94A3B8',padding:'20px' }}>No follow-ups scheduled.</td></tr>
              )}
              {followUps.map((r) => (
                <tr key={r.id}>
                  <td>{r.type}</td>
                  <td><div style={{ fontWeight:600,color:'#1E293B' }}>{r.name}</div><div style={{ fontSize:'0.78rem',color:'#94A3B8',marginTop:2 }}>{r.phone}</div></td>
                  <td>{r.follow_up_date} {r.follow_up_time}</td>
                  <td><span className={`conv-badge ${(r.convertibility||'warm').toLowerCase()}`}>{r.convertibility}</span></td>
                  <td style={{ color:'#64748B' }}>{r.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-grid-row">
        <div className="admin-widget-section border-top-cyan" style={{ marginBottom:0 }}>
          <SectionHeader title="Enquiries" />
          <div className="widget-body-grid" style={{ gridTemplateColumns:'1fr 1fr' }}>
            <StatBox value={statsLoading ? '…' : s.enquiriesOpen}   label="Open"   color="cyan" />
            <StatBox value={statsLoading ? '…' : s.enquiriesClosed} label="Closed" color="red"  />
          </div>
        </div>
        <div className="admin-widget-section border-top-orange" style={{ marginBottom:0 }}>
          <SectionHeader title="Active Members" />
          <div className="widget-body-grid" style={{ gridTemplateColumns:'1fr 1fr' }}>
            <StatBox value={statsLoading ? '…' : s.totalMembers}    label="Total"              color="orange" />
            <StatBox value={statsLoading ? '…' : s.todayAttendance} label="Today's Attendance" color="orange" />
          </div>
        </div>
        <div className="admin-widget-section border-top-teal" style={{ marginBottom:0 }}>
          <SectionHeader title="Today's Revenue" />
          <div className="widget-body-grid" style={{ gridTemplateColumns:'1fr 1fr' }}>
            <StatBox value={statsLoading ? '…' : `₹${(s.todayRevenue||0).toLocaleString()}`} label="Collected"  color="teal" />
            <StatBox value={statsLoading ? '…' : s.todayPayments} label="Transactions" color="teal" />
          </div>
        </div>
      </div>

      <div className="admin-widget-section border-top-teal" style={{ marginTop:20 }}>
        <SectionHeader title="Sales" />
        <div className="widget-body-grid" style={{ gridTemplateColumns:'repeat(5,1fr)' }}>
          <StatBox value="₹1,24,000" label="Total Paid"         color="teal" />
          <StatBox value="₹45,000"   label="Personal Training"  color="teal" />
          <StatBox value="₹60,000"   label="Gym Workout"        color="teal" />
          <StatBox value="₹12,000"   label="Group Class"        color="teal" />
          <StatBox value="₹7,000"    label="Liberty"            color="teal" />
        </div>
      </div>

      <div className="dashboard-grid-sales">
        <div className="admin-widget-section border-top-teal" style={{ marginBottom:0 }}>
          <SectionHeader title="Renewal Sales" />
          <div className="widget-body-grid" style={{ gridTemplateColumns:'repeat(5,1fr)' }}>
            <StatBox value="₹56,000" label="Total Paid"        color="teal" />
            <StatBox value="₹25,000" label="Personal Training" color="teal" />
            <StatBox value="₹31,000" label="Gym Workout"       color="teal" />
            <StatBox value="₹0"      label="Group Class"       color="teal" />
            <StatBox value="₹0"      label="Liberty"           color="teal" />
          </div>
        </div>
        <div className="admin-widget-section border-top-teal" style={{ marginBottom:0 }}>
          <SectionHeader title="Balance Amount" />
          <div className="widget-body-grid" style={{ gridTemplateColumns:'1fr', gridTemplateRows:'1fr 1fr' }}>
            <div className="widget-stat-box" style={{ borderBottom:'1px solid #F3F4F6' }}>
              <div className="stat-value teal">₹7,000</div><div className="stat-label">Due</div>
            </div>
            <div className="widget-stat-box">
              <div className="stat-value teal">₹12,500</div><div className="stat-label">Recovered</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ fontSize:'0.73rem',color:'#94A3B8',marginTop:'-8px',marginBottom:10 }}>All values inclusive of taxes</div>
    </div>
  );
};

// ─── ENQUIRIES ────────────────────────────────────────────────────────────────
const DUMMY_ENQUIRIES = [
  { id:'e1', name:'Rahul Sharma',  phone:'+91 98765 11111', enquiry_date:'2026-04-30', source:'Walk-in',   status:'Hot',  assigned_to:'Khushi B.', follow_up_date:'2026-05-01', comment:'Wants weight loss program' },
  { id:'e2', name:'Neha Gupta',    phone:'+91 87654 22222', enquiry_date:'2026-04-29', source:'Instagram', status:'Warm', assigned_to:'Priya S.',  follow_up_date:'2026-05-02', comment:'Personal training sessions' },
  { id:'e3', name:'Vikas Patel',   phone:'+91 76543 33333', enquiry_date:'2026-04-28', source:'Referral',  status:'Hot',  assigned_to:'Khushi B.', follow_up_date:'2026-04-30', comment:'Referred by Arnav Totla' },
  { id:'e4', name:'Sunita Joshi',  phone:'+91 65432 44444', enquiry_date:'2026-04-27', source:'Walk-in',   status:'Cold', assigned_to:'Priya S.',  follow_up_date:'2026-05-05', comment:'Group yoga only' },
  { id:'e5', name:'Manish Tiwari', phone:'+91 54321 55555', enquiry_date:'2026-04-26', source:'Facebook',  status:'Warm', assigned_to:'Khushi B.', follow_up_date:'2026-05-03', comment:'Couple membership discount' },
];

const EnquiriesView = ({ showToast }) => {
  const { data, loading, load, upsert, remove } = useTable('enquiries', DUMMY_ENQUIRIES);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(null);

  const filtered = data.filter(e => {
    const ms = filter === 'All' || e.status === filter;
    const mq = e.name?.toLowerCase().includes(search.toLowerCase()) || e.phone?.includes(search);
    return ms && mq;
  });

  const save = async (fd) => {
    const form = {
      name:           fd.get('name'),
      phone:          fd.get('phone'),
      enquiry_date:   fd.get('enquiry_date') || new Date().toISOString().slice(0,10),
      source:         fd.get('source'),
      status:         fd.get('status'),
      assigned_to:    fd.get('assigned_to'),
      follow_up_date: fd.get('follow_up_date'),
      comment:        fd.get('comment'),
    };
    const { error } = await upsert(form, modal?.id && !modal.id.startsWith('e') ? modal.id : null);
    if (error) { showToast(error.message, 'error'); return; }
    showToast(modal?.id && !modal.id.startsWith('e') ? 'Enquiry updated!' : 'Enquiry added!');
    setModal(null); load();
  };

  const del = async (row) => {
    if (row.id?.startsWith('e')) { showToast('Cannot delete demo data', 'info'); return; }
    if (!window.confirm(`Delete enquiry for ${row.name}?`)) return;
    const { error } = await remove(row.id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Deleted!'); load();
  };

  const counts = {
    Hot:  data.filter(e=>e.status==='Hot').length,
    Warm: data.filter(e=>e.status==='Warm').length,
    Cold: data.filter(e=>e.status==='Cold').length,
  };

  return (
    <div style={{ animation:'fadeIn 0.25s' }}>
      <div className="admin-page-title">Enquiries</div>

      <div className="dashboard-grid-row" style={{ marginBottom:20 }}>
        <div className="admin-widget-section border-top-cyan" style={{ marginBottom:0 }}>
          <div className="widget-body-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
            <StatBox value={data.length}  label="Total" color="cyan"   />
            <StatBox value={counts.Hot}   label="Hot"   color="red"    />
            <StatBox value={counts.Warm}  label="Warm"  color="orange" />
            <StatBox value={counts.Cold}  label="Cold"  color="blue"   />
          </div>
        </div>
        <div /><div />
      </div>

      <div className="admin-widget-section">
        <SectionHeader title="All Enquiries">
          {['All','Hot','Warm','Cold'].map(f => <FilterBtn key={f} label={f} active={filter===f} onClick={()=>setFilter(f)} />)}
          <div style={{ position:'relative' }}>
            <Search size={14} style={{ position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',color:'#9CA3AF' }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{ padding:'5px 10px 5px 28px',border:'1px solid #E5E7EB',borderRadius:5,fontSize:'0.8rem',outline:'none',width:160 }} />
          </div>
          <button className="btn-primary" onClick={()=>setModal({})}>+ Add</button>
        </SectionHeader>
        {loading ? <Spinner /> : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>#</th><th>Name &amp; Phone</th><th>Date</th><th>Source</th><th>Status</th><th>Assigned</th><th>Follow Up</th><th>Comment</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((e,i) => (
                  <tr key={e.id}>
                    <td style={{ color:'#94A3B8' }}>{i+1}</td>
                    <td><div style={{ fontWeight:600,color:'#1E293B' }}>{e.name}</div><div style={{ fontSize:'0.78rem',color:'#94A3B8' }}>{e.phone}</div></td>
                    <td style={{ fontSize:'0.82rem' }}>{e.enquiry_date}</td>
                    <td><span style={{ fontSize:'0.75rem',background:'#F1F5F9',padding:'3px 8px',borderRadius:4,color:'#475569' }}>{e.source}</span></td>
                    <td><span className={`conv-badge ${e.status?.toLowerCase()}`}>{e.status}</span></td>
                    <td style={{ color:'#64748B',fontSize:'0.82rem' }}>{e.assigned_to}</td>
                    <td style={{ fontSize:'0.82rem' }}>{e.follow_up_date}</td>
                    <td style={{ color:'#64748B',fontSize:'0.8rem',maxWidth:160 }}>{e.comment}</td>
                    <td style={{ display:'flex',gap:6 }}>
                      <button className="action-btn" onClick={()=>setModal(e)}>Edit</button>
                      <button className="btn-danger" style={{ padding:'5px 10px',fontSize:'0.73rem' }} onClick={()=>del(e)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal.id && !modal.id.startsWith('e') ? 'Edit Enquiry' : 'Add Enquiry'} onClose={()=>setModal(null)} onSubmit={save}>
          <div className="modal-grid">
            <F.Field label="Name"><F.Input name="name" defaultValue={modal.name||''} required /></F.Field>
            <F.Field label="Phone"><F.Input name="phone" defaultValue={modal.phone||''} /></F.Field>
            <F.Field label="Date"><F.Input type="date" name="enquiry_date" defaultValue={modal.enquiry_date||''} /></F.Field>
            <F.Field label="Source">
              <F.Select name="source" defaultValue={modal.source||'Walk-in'}>
                {['Walk-in','Instagram','Facebook','Google','Referral','WhatsApp','Other'].map(s=><option key={s}>{s}</option>)}
              </F.Select>
            </F.Field>
            <F.Field label="Status">
              <F.Select name="status" defaultValue={modal.status||'Warm'}>
                <option>Hot</option><option>Warm</option><option>Cold</option>
              </F.Select>
            </F.Field>
            <F.Field label="Assigned To"><F.Input name="assigned_to" defaultValue={modal.assigned_to||''} /></F.Field>
            <F.Field label="Follow Up Date"><F.Input type="date" name="follow_up_date" defaultValue={modal.follow_up_date||''} /></F.Field>
            <F.Field label="Comment" span2><F.Textarea name="comment" defaultValue={modal.comment||''} rows={2} /></F.Field>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── MEMBERS ──────────────────────────────────────────────────────────────────
const DUMMY_CLIENTS = [
  { id:'cli1', name:'Arnav Totla',  mobile:'+91 90094 52111', gender:'Male',   email:'arnav@example.com',  created_at:'2026-01-01' },
  { id:'cli2', name:'Priya Sharma', mobile:'+91 98765 43210', gender:'Female', email:'priya@example.com',  created_at:'2026-02-01' },
  { id:'cli3', name:'Rohan Mehra',  mobile:'+91 77654 32100', gender:'Male',   email:'rohan@example.com',  created_at:'2026-02-15' },
  { id:'cli4', name:'Anjali Verma', mobile:'+91 66543 21000', gender:'Female', email:'anjali@example.com', created_at:'2026-03-01' },
  { id:'cli5', name:'Vikram Singh', mobile:'+91 33210 11111', gender:'Male',   email:'vikram@example.com', created_at:'2026-04-01' },
];

const MB_SERVICES = ['Gym Membership / Complete Health','Personal Training','Massage and Steam','Weight Loss','Weight Gain'];

const MB_GEN_QS = [
  'Suffering from asthma?','Suffering from Rheumatic fever?','Do you drink alcohol?',
  'Recent surgery (last 12 months)?','Pregnancy (now or within last 3 months)?',
  'Any gynaecological disorders?','Are you under a lot of stress?',
  'History of breathing difficulty or lung problems?','Muscle injury?',
  'Joint or back disorder?','Any previous injury?','Diabetes or thyroid condition?',
  'Cigarette smoking habit?','Obesity (more than 20% over ideal body weight)?','Hernia?',
  'Any condition that has been aggravated by lifting weights?',
  'Any surgery or fracture of bone, muscle pull, sprain, back pain?',
  'Impairment or disability, including a joint?','Bone or muscle problem?',
  'Do you engage in regular exercise?','Do you take dietary supplements?',
  'Taking steroids in the past or currently?','Do you have frequent falls/lose consciousness/balance?',
];

const MB_SYMPTOMS = {
  'Head and neck':       ['Headache','Neck pain/stiffness','Lump or swelling'],
  'Heart/Circulation':   ['High Blood Pressure','Low Blood Pressure','Swelling in feet or ankles','Leg cramps','Varicose/spider veins'],
  'Digestive':           ['Bloating','Constipation','Diarrhoea'],
  'Eyes':                ['Blurred vision','Wear contacts','Wear glasses','Excessive/little tearing'],
  'Female Genito/Urinary':['Late Period','Pregnant','Lump/pain in breasts','Menstrual cramps','Urinary Tract Infection','Pain in genitals/groin'],
  'Skin':                ['Bruise easily','Open cuts/sores','Skin allergies','Tender areas on skin','Infection/inflammation'],
  'Musculoskeletal':     ['Aching Muscles','Muscles sore to touch','Aching joints','Chronic low back problems'],
  'Male Genito/Urinary': ['Painful/Slow Urination','Nighttime Urinary frequency','Urinary Tract Infection','Pain in genitals/groin'],
  'Nervous System':      ['Difficulty in relaxing','Difficulty in sleeping'],
  'Respiratory System':  ['Easily out of breath','Airborne allergies'],
};

const MB_DIAGNOSES = [
  'Abdominal hernia','Heart Disease','Severe neurological disorder','Arthritis/Rheumatism',
  'Hypertension','Severe venous or arterial circulatory disorder','Asthma','Bleeding tendency, haemophilia',
  'Sprains/dislocations','Broken bones','Infection or inflammation','Stroke/CVA/TIA','Bursitis',
  'Lupus Erythematosus','Thrombosis/Phlebitis','Cancer','Lactating','TMJ (Jaw) Dysfunction',
  'Carpel Tunnel Syndrome','Migraine headaches','Tuberculosis','Diabetes','Multiple Sclerosis',
  'Disk problem (slipped, herniated)','Muscular Dystrophy','Ulcer/Colitis/Diverticulitis','Emphysema',
  'Osteoporosis','Vertigo','Epilepsy','Parkinson\'s Disease','A pacemaker','Fibrositis / Fibromyalgia','Sciatica',
];

// ─── MemberModal (multi-tab) ──────────────────────────────────────────────────
const MemberModal = ({ row, onClose, onSave }) => {
  const isEdit = row?.id && !String(row.id).startsWith('cli');
  const fd     = row?.full_data || {};
  const fp     = fd.personal || {};

  const [tab,  setTab]  = useState(0);
  const [p,    setP]    = useState({
    name:          row?.name          || fp.name          || '',
    mobile:        row?.mobile        || fp.mobile        || '',
    email:         row?.email         || fp.email         || '',
    gender:        row?.gender        || fp.gender        || 'Male',
    bloodGroup:    fp.bloodGroup      || '',
    address:       fp.address         || '',
    pincode:       fp.pincode         || '',
    phone:         fp.phone           || '',
    dob:           fp.dob             || '',
    occupation:    fp.occupation      || '',
    nationality:   fp.nationality     || '',
    maritalStatus: fp.maritalStatus   || 'Unmarried',
    durationFrom:  fp.durationFrom    || '',
    durationTo:    fp.durationTo      || '',
  });
  const [emg,      setEmg]      = useState(fd.emergency       || { name:'', relationship:'', phone:'' });
  const [services, setServices] = useState(fd.services        || []);
  const [gqAns,    setGqAns]    = useState(fd.generalQuestions|| {});
  const [symptoms, setSymptoms] = useState(fd.symptoms        || []);
  const [diagnoses,setDiagnoses]= useState(fd.diagnoses       || []);
  const [decl,     setDecl]     = useState({
    name:       fd.declarationName || '',
    parentName: fd.parentName      || '',
    agreed:     fd.agreed          || false,
  });

  const toggleArr = (arr, setArr, item) =>
    setArr(arr.includes(item) ? arr.filter(x=>x!==item) : [...arr, item]);

  const handleSave = () => {
    if (!p.name.trim()) { alert('Full Name is required'); setTab(0); return; }
    onSave({
      name:      p.name,
      mobile:    p.mobile,
      email:     p.email,
      gender:    p.gender,
      full_data: {
        personal:         p,
        emergency:        emg,
        services,
        generalQuestions: gqAns,
        symptoms,
        diagnoses,
        declarationName:  decl.name,
        parentName:       decl.parentName,
        agreed:           decl.agreed,
      },
    });
  };

  const TABS = ['Personal','Emergency & Services','Medical History','Declaration'];

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal-box" style={{ width:700 }}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Member' : 'Add New Member'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Tab bar */}
        <div style={{ display:'flex', borderBottom:'1px solid #E5E7EB', padding:'0 22px', overflowX:'auto' }}>
          {TABS.map((t,i) => (
            <button key={i} onClick={()=>setTab(i)} style={{
              padding:'10px 16px', background:'none', border:'none', whiteSpace:'nowrap',
              borderBottom: tab===i ? '2px solid #C9A84C' : '2px solid transparent',
              color: tab===i ? '#C9A84C' : '#6B7280',
              fontWeight:600, fontSize:'0.82rem', cursor:'pointer',
            }}>{i+1}. {t}</button>
          ))}
        </div>

        <div className="modal-body" style={{ maxHeight:'62vh', overflowY:'auto' }}>

          {/* ── Tab 0: Personal ── */}
          {tab === 0 && (
            <div className="modal-grid">
              <F.Field label="Full Name *">
                <F.Input value={p.name} onChange={e=>setP({...p,name:e.target.value})} placeholder="e.g. Arnav Totla" required />
              </F.Field>
              <F.Field label="Mobile *">
                <F.Input value={p.mobile} onChange={e=>setP({...p,mobile:e.target.value})} placeholder="+91 98765 43210" />
              </F.Field>
              <F.Field label="Email">
                <F.Input type="email" value={p.email} onChange={e=>setP({...p,email:e.target.value})} placeholder="name@example.com" />
              </F.Field>
              <F.Field label="Blood Group">
                <F.Input value={p.bloodGroup} onChange={e=>setP({...p,bloodGroup:e.target.value})} placeholder="e.g. O+" />
              </F.Field>
              <F.Field label="Gender">
                <F.Select value={p.gender} onChange={e=>setP({...p,gender:e.target.value})}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </F.Select>
              </F.Field>
              <F.Field label="Marital Status">
                <F.Select value={p.maritalStatus} onChange={e=>setP({...p,maritalStatus:e.target.value})}>
                  <option>Unmarried</option><option>Married</option>
                </F.Select>
              </F.Field>
              <F.Field label="Date of Birth">
                <F.Input type="date" value={p.dob} onChange={e=>setP({...p,dob:e.target.value})} />
              </F.Field>
              <F.Field label="Phone (Landline)">
                <F.Input value={p.phone} onChange={e=>setP({...p,phone:e.target.value})} placeholder="Landline number" />
              </F.Field>
              <F.Field label="Occupation">
                <F.Input value={p.occupation} onChange={e=>setP({...p,occupation:e.target.value})} />
              </F.Field>
              <F.Field label="Nationality">
                <F.Input value={p.nationality} onChange={e=>setP({...p,nationality:e.target.value})} defaultValue="Indian" />
              </F.Field>
              <F.Field label="Address" span2>
                <F.Input value={p.address} onChange={e=>setP({...p,address:e.target.value})} placeholder="Full address" />
              </F.Field>
              <F.Field label="Pincode">
                <F.Input value={p.pincode} onChange={e=>setP({...p,pincode:e.target.value})} placeholder="e.g. 400001" />
              </F.Field>
              <F.Field label="Membership From">
                <F.Input type="date" value={p.durationFrom} onChange={e=>setP({...p,durationFrom:e.target.value})} />
              </F.Field>
              <F.Field label="Membership To">
                <F.Input type="date" value={p.durationTo} onChange={e=>setP({...p,durationTo:e.target.value})} />
              </F.Field>
            </div>
          )}

          {/* ── Tab 1: Emergency & Services ── */}
          {tab === 1 && (
            <div>
              <div style={{ fontWeight:700, color:'#1E293B', fontSize:'0.88rem', marginBottom:12, paddingBottom:8, borderBottom:'2px solid #F3F4F6' }}>Emergency Contact</div>
              <div className="modal-grid" style={{ marginBottom:24 }}>
                <F.Field label="Contact Name">
                  <F.Input value={emg.name} onChange={e=>setEmg({...emg,name:e.target.value})} />
                </F.Field>
                <F.Field label="Relationship">
                  <F.Input value={emg.relationship} onChange={e=>setEmg({...emg,relationship:e.target.value})} placeholder="e.g. Spouse, Parent" />
                </F.Field>
                <F.Field label="Contact Phone">
                  <F.Input value={emg.phone} onChange={e=>setEmg({...emg,phone:e.target.value})} />
                </F.Field>
              </div>

              <div style={{ fontWeight:700, color:'#1E293B', fontSize:'0.88rem', marginBottom:12, paddingBottom:8, borderBottom:'2px solid #F3F4F6' }}>Interested Services</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {MB_SERVICES.map(s => (
                  <label key={s} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontSize:'0.85rem', color:'#374151', padding:'8px 12px', borderRadius:6, background: services.includes(s) ? 'rgba(201,168,76,0.08)' : '#F9FAFB', border:`1px solid ${services.includes(s)?'#C9A84C':'#E5E7EB'}`, transition:'all 0.12s' }}>
                    <input type="checkbox" checked={services.includes(s)} onChange={()=>toggleArr(services,setServices,s)} style={{ accentColor:'#C9A84C', width:15, height:15 }} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab 2: Medical ── */}
          {tab === 2 && (
            <div>
              <div style={{ fontWeight:700, color:'#1E293B', fontSize:'0.88rem', marginBottom:12, paddingBottom:8, borderBottom:'2px solid #F3F4F6' }}>General Medical Questions</div>
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {MB_GEN_QS.map((q,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 4px', borderBottom:'1px solid #F3F4F6' }}>
                    <span style={{ fontSize:'0.81rem', color:'#374151', flex:1, paddingRight:12 }}>{q}</span>
                    <div style={{ display:'flex', gap:14, flexShrink:0 }}>
                      {['Yes','No'].map(v => (
                        <label key={v} style={{ display:'flex', alignItems:'center', gap:5, cursor:'pointer', fontSize:'0.82rem', color: gqAns[q]===v ? '#C9A84C' : '#6B7280', fontWeight: gqAns[q]===v ? 700 : 400 }}>
                          <input type="radio" checked={gqAns[q]===v} onChange={()=>setGqAns({...gqAns,[q]:v})} style={{ accentColor:'#C9A84C' }} />
                          {v}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontWeight:700, color:'#1E293B', fontSize:'0.88rem', margin:'20px 0 12px', paddingBottom:8, borderBottom:'2px solid #F3F4F6' }}>Observed Symptoms</div>
              {Object.entries(MB_SYMPTOMS).map(([cat, items]) => (
                <div key={cat} style={{ marginBottom:10, background:'#F9FAFB', padding:'10px 14px', borderRadius:6 }}>
                  <div style={{ fontWeight:600, color:'#C9A84C', fontSize:'0.76rem', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8 }}>{cat}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                    {items.map(item => (
                      <label key={item} style={{ display:'flex', alignItems:'center', gap:5, cursor:'pointer', fontSize:'0.79rem', color: symptoms.includes(item) ? '#C9A84C' : '#374151', fontWeight: symptoms.includes(item) ? 600 : 400 }}>
                        <input type="checkbox" checked={symptoms.includes(item)} onChange={()=>toggleArr(symptoms,setSymptoms,item)} style={{ accentColor:'#C9A84C' }} />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ fontWeight:700, color:'#1E293B', fontSize:'0.88rem', margin:'20px 0 12px', paddingBottom:8, borderBottom:'2px solid #F3F4F6' }}>Doctor Diagnosed Conditions</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px 16px', background:'#F9FAFB', padding:'12px 14px', borderRadius:6 }}>
                {MB_DIAGNOSES.map(item => (
                  <label key={item} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:'0.79rem', color: diagnoses.includes(item) ? '#C9A84C' : '#374151', fontWeight: diagnoses.includes(item) ? 600 : 400, padding:'3px 0' }}>
                    <input type="checkbox" checked={diagnoses.includes(item)} onChange={()=>toggleArr(diagnoses,setDiagnoses,item)} style={{ accentColor:'#C9A84C' }} />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Tab 3: Declaration ── */}
          {tab === 3 && (
            <div>
              <div className="modal-grid" style={{ marginBottom:20 }}>
                <F.Field label="Member Full Name">
                  <F.Input value={decl.name} onChange={e=>setDecl({...decl,name:e.target.value})} placeholder="As it appears on ID" />
                </F.Field>
                <F.Field label="Son / Daughter / Wife of">
                  <F.Input value={decl.parentName} onChange={e=>setDecl({...decl,parentName:e.target.value})} placeholder="Parent / Guardian name" />
                </F.Field>
              </div>
              <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:8, padding:16, fontSize:'0.83rem', color:'#78350F', lineHeight:1.7 }}>
                I hereby declare that all the information furnished by me in this form is correct to the best of my knowledge and nothing here is being concealed from SkyFit. I agree to follow all terms and conditions and understand that providing false information can lead to immediate termination of membership without refund. I understand that the reaction of the heart, lung, and blood vessel system cannot always be predicted during exercise and SkyFit shall not be liable for any injury or damage.
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:12, marginTop:16, cursor:'pointer', background: decl.agreed ? 'rgba(201,168,76,0.08)' : '#F9FAFB', padding:'14px 16px', borderRadius:8, border:`1px solid ${decl.agreed?'#C9A84C':'#E5E7EB'}`, transition:'all 0.15s' }}>
                <input type="checkbox" checked={decl.agreed} onChange={e=>setDecl({...decl,agreed:e.target.checked})} style={{ width:18, height:18, accentColor:'#C9A84C', flexShrink:0 }} />
                <span style={{ fontSize:'0.84rem', color:'#374151', fontWeight: decl.agreed ? 600 : 400 }}>
                  I agree to the terms and conditions above.
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          {tab > 0 && (
            <button className="btn-secondary" onClick={()=>setTab(t=>t-1)}>← Back</button>
          )}
          {tab < TABS.length - 1 ? (
            <button className="btn-primary" onClick={()=>setTab(t=>t+1)}>Next →</button>
          ) : (
            <button className="btn-primary" onClick={handleSave}>
              {isEdit ? 'Update Member' : 'Save Member'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MembersView = ({ showToast }) => {
  const [data,      setData]     = useState(DUMMY_CLIENTS);
  const [loading,   setLoading]  = useState(true);
  const [search,    setSearch]   = useState('');
  const [gender,    setGender]   = useState('');
  const [dropOpen,  setDropOpen] = useState(false);
  const [modal,     setModal]    = useState(null);
  const [selected,  setSelected] = useState(new Set());
  const [activeBox, setActiveBox]= useState('All Members');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from('clients').select('*').order('created_at', { ascending: false });
      setData(!error && rows?.length ? rows : DUMMY_CLIENTS);
    } catch { setData(DUMMY_CLIENTS); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // derive sub-counts for stat boxes
  const now           = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 86400000);
  const sixMonthsAgo  = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  const attendedIds   = new Set(data.slice(0, Math.max(1, Math.floor(data.length * 0.4))).map(c => c.id));

  const filtered = data.filter(c => {
    const mq = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.mobile?.includes(search);
    const mg = !gender || c.gender?.toLowerCase() === gender.toLowerCase();

    let boxMatch = true;
    if      (activeBox === 'Upcoming')           boxMatch = new Date(c.created_at) >= thirtyDaysAgo;
    else if (activeBox === 'Past Members')        boxMatch = new Date(c.created_at) < sixMonthsAgo;
    else if (activeBox === "Today's Attendance") boxMatch = attendedIds.has(c.id);
    // 'All Members' and 'Active Members' show all

    return mq && mg && boxMatch;
  });

  const save = async (formData) => {
    const isDemo = !modal?.id || String(modal.id).startsWith('cli');
    const { error } = isDemo
      ? await supabase.from('clients').insert([formData])
      : await supabase.from('clients').update(formData).eq('id', modal.id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast(isDemo ? 'Member added!' : 'Member updated!');
    setModal(null); load();
  };

  const del = async (row) => {
    if (String(row.id).startsWith('cli')) { showToast('Cannot delete demo data', 'info'); return; }
    if (!window.confirm(`Delete member ${row.name}?`)) return;
    const { error } = await supabase.from('clients').delete().eq('id', row.id);
    if (error) { showToast(error.message, 'error'); return; }
    showToast('Member deleted!'); load();
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = (e) => setSelected(e.target.checked ? new Set(filtered.map(c=>c.id)) : new Set());

  const statBoxes = [
    { lbl:'All Members',        val: data.length,                                                               cls:'' },
    { lbl:'Active Members',     val: data.length,                                                               cls:'active' },
    { lbl:'Upcoming',           val: data.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length,         cls:'' },
    { lbl:'Past Members',       val: data.filter(c => new Date(c.created_at) < sixMonthsAgo).length,           cls:'' },
    { lbl:'Potential Leads',    val: 0,                                                                         cls:'' },
    { lbl:"Today's Attendance", val: attendedIds.size,                                                          cls:'' },
  ];

  return (
    <div style={{ animation:'fadeIn 0.25s' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div className="admin-page-title" style={{ marginBottom:0 }}>Members</div>
        <button className="btn-primary" onClick={()=>setModal({})}>+ Add Member</button>
      </div>

      <div className="members-top-boxes">
        {statBoxes.map((b,i) => {
          const isActive  = b.cls === 'active';
          const isSelected= activeBox === b.lbl && !isActive;
          return (
            <div
              key={i}
              className={`member-box ${isActive ? 'active' : ''} ${isSelected ? 'selected-box' : ''}`}
              onClick={() => setActiveBox(b.lbl)}
              title={`Filter by ${b.lbl}`}
            >
              <div className="member-box-val">{b.val}</div>
              <div className="member-box-label">{b.lbl}</div>
            </div>
          );
        })}
      </div>

      <div className="admin-widget-section">
        <div style={{ padding:'14px 18px', borderBottom:'1px solid #F3F4F6', display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
          <div className="admin-search-bar" style={{ maxWidth:280, flex:'0 0 auto' }}>
            <Search size={15} />
            <input type="text" placeholder="Search by Name / Mob. No." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div style={{ position:'relative', flex:'0 0 auto' }}>
            <div className="admin-date-picker" style={{ width:180, justifyContent:'space-between', cursor:'pointer' }} onClick={()=>setDropOpen(!dropOpen)}>
              {gender || 'Filter By Gender'}<ChevronDown size={13} />
            </div>
            {dropOpen && (
              <div style={{ position:'absolute',top:'100%',left:0,width:'100%',background:'white',border:'1px solid #CBD5E1',borderRadius:6,zIndex:10,marginTop:4,boxShadow:'0 4px 10px rgba(0,0,0,0.08)' }}>
                {['All Genders','Male','Female','Other'].map(g => (
                  <div key={g} style={{ padding:'8px 15px',cursor:'pointer',fontSize:'0.85rem',borderBottom:'1px solid #F1F5F9' }}
                    onClick={()=>{ setGender(g==='All Genders'?'':g); setDropOpen(false); }}>{g}</div>
                ))}
              </div>
            )}
          </div>
          {selected.size > 0 && (
            <span style={{ fontSize:'0.8rem', color:'#64748B', marginLeft:'auto' }}>
              {selected.size} selected
            </span>
          )}
          <div style={{ marginLeft: selected.size > 0 ? 0 : 'auto', display:'flex', gap:8 }}>
            <span style={{ fontSize:'0.82rem', color:'#3B82F6', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
              SMS Remaining <span style={{ background:'#3B82F6',color:'white',padding:'2px 7px',borderRadius:10,fontSize:'0.73rem' }}>2450</span>
            </span>
          </div>
        </div>

        {loading ? <Spinner /> : (
          <>
            {activeBox !== 'All Members' && activeBox !== 'Active Members' && (
              <div style={{ padding:'8px 18px', background:'#FFFBEB', borderBottom:'1px solid #FEF3C7', fontSize:'0.8rem', color:'#92400E', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontWeight:700 }}>Filter:</span> {activeBox}
                <button onClick={()=>setActiveBox('All Members')} style={{ marginLeft:4, background:'none', border:'none', color:'#92400E', cursor:'pointer', fontWeight:700, fontSize:'0.8rem' }}>× Clear</button>
              </div>
            )}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" onChange={toggleAll} checked={selected.size === filtered.length && filtered.length > 0} /></th>
                    <th>Name &amp; Mob. No.</th>
                    <th>Gender</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? filtered.map((c,i) => (
                    <tr key={c.id} style={{ background: selected.has(c.id) ? 'rgba(201,168,76,0.04)' : undefined }}>
                      <td><input type="checkbox" checked={selected.has(c.id)} onChange={()=>toggleSelect(c.id)} /></td>
                      <td>
                        <div style={{ fontWeight:600, color:'#1E293B' }}>{c.name || 'Unknown'}</div>
                        <div style={{ fontSize:'0.78rem', color:'#94A3B8', marginTop:2 }}>{c.mobile || '—'}</div>
                      </td>
                      <td style={{ fontSize:'0.83rem' }}>{c.gender || '—'}</td>
                      <td style={{ fontSize:'0.82rem', color:'#3B82F6' }}>{c.email || '—'}</td>
                      <td><span className="status-badge active">Active</span></td>
                      <td style={{ fontSize:'0.82rem', color:'#64748B' }}>{c.created_at?.slice(0,10) || '—'}</td>
                      <td style={{ display:'flex', gap:5 }}>
                        <button className="action-btn" onClick={()=>setModal(c)}>Edit</button>
                        <button className="btn-danger" style={{ padding:'5px 10px', fontSize:'0.73rem' }} onClick={()=>del(c)}>Del</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" style={{ textAlign:'center', padding:30, color:'#94A3B8' }}>No members found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 18px', fontSize:'0.83rem', color:'#64748B', borderTop:'1px solid #F3F4F6' }}>
              <div>Showing <strong>{filtered.length}</strong> of <strong>{data.length}</strong> members</div>
              <div style={{ display:'flex', gap:10, color:'#3B82F6', cursor:'pointer' }}>
                <span>« First</span><span>‹ Prev</span>
                <span style={{ color:'#1E293B', fontWeight:700 }}>1</span>
                <span>Next ›</span><span>Last »</span>
              </div>
            </div>
          </>
        )}
      </div>

      {modal !== null && (
        <MemberModal row={modal} onClose={()=>setModal(null)} onSave={save} />
      )}
    </div>
  );
};

// ─── FOLLOW UPS ───────────────────────────────────────────────────────────────
const DUMMY_FOLLOWUPS = [
  { id:'f1', type:'Call',  name:'Amit Singh',    phone:'+91 98765 12345', follow_up_date:'2026-04-30', follow_up_time:'5:00 PM',  convertibility:'WARM', comment:'Pricing for PT',         assigned_to:'Khushi B.', completed:false },
  { id:'f2', type:'Visit', name:'Riya Patel',    phone:'+91 87654 09876', follow_up_date:'2026-05-01', follow_up_time:'11:00 AM', convertibility:'HOT',  comment:'Interested in annual',   assigned_to:'Priya S.',  completed:false },
  { id:'f3', type:'Call',  name:'Vikas Patel',   phone:'+91 76543 33333', follow_up_date:'2026-04-30', follow_up_time:'2:00 PM',  convertibility:'HOT',  comment:'After trial session',    assigned_to:'Priya S.',  completed:false },
  { id:'f4', type:'SMS',   name:'Neha Gupta',    phone:'+91 87654 22222', follow_up_date:'2026-05-02', follow_up_time:'10:00 AM', convertibility:'WARM', comment:'Send plan brochure',     assigned_to:'Khushi B.', completed:false },
  { id:'f5', type:'Call',  name:'Deepak Verma',  phone:'+91 32109 77777', follow_up_date:'2026-04-15', follow_up_time:'3:00 PM',  convertibility:'COLD', comment:'No answer – rescheduled',assigned_to:'Khushi B.', completed:true  },
];

const FollowUpsView = ({ showToast }) => {
  const { data, loading, load, upsert, remove } = useTable('follow_ups', DUMMY_FOLLOWUPS);
  const [tab,   setTab]   = useState('today');
  const [modal, setModal] = useState(null);
  const today = new Date().toISOString().slice(0,10);

  const classify = (row) => {
    if (row.completed) return 'past';
    if (row.follow_up_date === today) return 'today';
    if (row.follow_up_date > today)   return 'upcoming';
    return 'past';
  };

  const items = data.filter(f => classify(f) === tab);
  const counts = { today: data.filter(f=>classify(f)==='today').length, upcoming: data.filter(f=>classify(f)==='upcoming').length, past: data.filter(f=>classify(f)==='past').length };

  const save = async (fd) => {
    const form = {
      type:           fd.get('type'),
      name:           fd.get('name'),
      phone:          fd.get('phone'),
      follow_up_date: fd.get('follow_up_date'),
      follow_up_time: fd.get('follow_up_time'),
      convertibility: fd.get('convertibility'),
      comment:        fd.get('comment'),
      assigned_to:    fd.get('assigned_to'),
      completed:      false,
    };
    const { error } = await upsert(form, modal?.id && !modal.id.startsWith('f') ? modal.id : null);
    if (error) { showToast(error.message, 'error'); return; }
    showToast(modal?.id && !modal.id.startsWith('f') ? 'Updated!' : 'Added!');
    setModal(null); load();
  };

  const del = async (row) => {
    if (row.id?.startsWith('f')) { showToast('Cannot delete demo data','info'); return; }
    if (!window.confirm(`Delete follow-up for ${row.name}?`)) return;
    const { error } = await remove(row.id);
    if (error) { showToast(error.message,'error'); return; }
    showToast('Deleted!'); load();
  };

  const markDone = async (row) => {
    if (row.id?.startsWith('f')) { showToast('Cannot update demo data','info'); return; }
    const { error } = await supabase.from('follow_ups').update({ completed:true }).eq('id', row.id);
    if (error) { showToast(error.message,'error'); return; }
    showToast('Marked complete!'); load();
  };

  return (
    <div style={{ animation:'fadeIn 0.25s' }}>
      <div className="admin-page-title">Follow Ups</div>

      <div className="dashboard-grid-row" style={{ marginBottom:20 }}>
        <div className="admin-widget-section border-top-orange" style={{ marginBottom:0 }}>
          <div className="widget-body-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
            <StatBox value={data.length}         label="Total"     color="orange" />
            <StatBox value={counts.today}        label="Today"     color="red"    />
            <StatBox value={counts.upcoming}     label="Upcoming"  color="cyan"   />
            <StatBox value={data.filter(f=>f.convertibility==='HOT').length} label="HOT Leads" color="red" />
          </div>
        </div>
        <div /><div />
      </div>

      <div className="admin-widget-section">
        <div className="widget-header">
          <div style={{ display:'flex', gap:0 }}>
            {[['today',`Today (${counts.today})`],['upcoming',`Upcoming (${counts.upcoming})`],['past',`Past (${counts.past})`]].map(([id,lbl]) => (
              <button key={id} onClick={()=>setTab(id)} style={{ padding:'0 16px 12px',background:'none',border:'none',borderBottom: tab===id?'2px solid #C9A84C':'2px solid transparent',color:tab===id?'#C9A84C':'#6B7280',fontSize:'0.85rem',fontWeight:600,cursor:'pointer',marginBottom:'-1px' }}>{lbl}</button>
            ))}
          </div>
          <button className="btn-primary" onClick={()=>setModal({})}>+ Add Follow Up</button>
        </div>
        {loading ? <Spinner /> : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>Type</th><th>Name &amp; Phone</th><th>Date &amp; Time</th><th>Convertibility</th><th>Comment</th><th>Assigned</th><th>Actions</th></tr></thead>
              <tbody>
                {items.length > 0 ? items.map((r,i) => (
                  <tr key={r.id}>
                    <td><span style={{ fontSize:'0.78rem',background:'#EFF6FF',color:'#1E40AF',padding:'3px 9px',borderRadius:4,fontWeight:600 }}>{r.type}</span></td>
                    <td><div style={{ fontWeight:600,color:'#1E293B' }}>{r.name}</div><div style={{ fontSize:'0.78rem',color:'#94A3B8' }}>{r.phone}</div></td>
                    <td><div style={{ fontWeight:500 }}>{r.follow_up_date}</div><div style={{ fontSize:'0.78rem',color:'#94A3B8' }}>{r.follow_up_time}</div></td>
                    <td><span className={`conv-badge ${r.convertibility?.toLowerCase()}`}>{r.convertibility}</span></td>
                    <td style={{ color:'#64748B',fontSize:'0.82rem' }}>{r.comment}</td>
                    <td style={{ color:'#64748B',fontSize:'0.82rem' }}>{r.assigned_to}</td>
                    <td style={{ display:'flex',gap:5 }}>
                      {!r.completed && <button className="action-btn" style={{ fontSize:'0.7rem',color:'#10B981' }} onClick={()=>markDone(r)}>✓ Done</button>}
                      <button className="action-btn" onClick={()=>setModal(r)}>Edit</button>
                      <button className="btn-danger" style={{ padding:'5px 10px',fontSize:'0.73rem' }} onClick={()=>del(r)}>Del</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" style={{ textAlign:'center',padding:30,color:'#94A3B8' }}>No follow-ups for this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal.id && !modal.id.startsWith('f') ? 'Edit Follow Up' : 'Add Follow Up'} onClose={()=>setModal(null)} onSubmit={save}>
          <div className="modal-grid">
            <F.Field label="Type">
              <F.Select name="type" defaultValue={modal.type||'Call'}>
                <option>Call</option><option>Visit</option><option>SMS</option><option>Email</option>
              </F.Select>
            </F.Field>
            <F.Field label="Convertibility">
              <F.Select name="convertibility" defaultValue={modal.convertibility||'WARM'}>
                <option>HOT</option><option>WARM</option><option>COLD</option>
              </F.Select>
            </F.Field>
            <F.Field label="Name"><F.Input name="name" defaultValue={modal.name||''} required /></F.Field>
            <F.Field label="Phone"><F.Input name="phone" defaultValue={modal.phone||''} /></F.Field>
            <F.Field label="Date"><F.Input type="date" name="follow_up_date" defaultValue={modal.follow_up_date||''} /></F.Field>
            <F.Field label="Time"><F.Input name="follow_up_time" defaultValue={modal.follow_up_time||'10:00 AM'} placeholder="e.g. 3:00 PM" /></F.Field>
            <F.Field label="Assigned To"><F.Input name="assigned_to" defaultValue={modal.assigned_to||''} /></F.Field>
            <F.Field label="Comment" span2><F.Textarea name="comment" defaultValue={modal.comment||''} rows={2} /></F.Field>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── MEMBERSHIP PLANS ─────────────────────────────────────────────────────────
const DUMMY_PLANS = [
  { id:'p1', name:'Basic',            price:1200, duration:'Monthly', features:['Gym Access (6AM–10PM)','Locker Facility','Free Wi-Fi','2 Guest Passes/month'], is_active:true },
  { id:'p2', name:'Standard',         price:2500, duration:'Monthly', features:['Everything in Basic','Pool Access','Steam Room','Fitness Assessment'], is_active:true },
  { id:'p3', name:'Premium',          price:4000, duration:'Monthly', features:['Everything in Standard','1 PT Session/week','Nutrition Consultation','Priority Booking'], is_active:true },
  { id:'p4', name:'Personal Training',price:8000, duration:'Monthly', features:['Dedicated Trainer','Custom Workout Plan','Weekly Progress Review','Diet Planning'], is_active:true },
];
const PLAN_COLORS = ['#06B6D4','#10B981','#C9A84C','#EF4444','#8B5CF6','#F97316'];
const PLAN_SUBS   = [142, 118, 76, 35, 20, 10];

const MembershipPlansView = ({ showToast }) => {
  const { data, loading, load, upsert, remove } = useTable('membership_plans', DUMMY_PLANS);
  const [modal, setModal] = useState(null);

  const save = async (fd) => {
    const rawFeatures = fd.get('features') || '';
    const form = {
      name:      fd.get('name'),
      price:     parseInt(fd.get('price')) || 0,
      duration:  fd.get('duration'),
      features:  rawFeatures.split('\n').map(f=>f.trim()).filter(Boolean),
      is_active: true,
    };
    const { error } = await upsert(form, modal?.id && !modal.id.startsWith('p') ? modal.id : null);
    if (error) { showToast(error.message,'error'); return; }
    showToast(modal?.id && !modal.id.startsWith('p') ? 'Plan updated!' : 'Plan added!');
    setModal(null); load();
  };

  const del = async (row) => {
    if (row.id?.startsWith('p')) { showToast('Cannot delete demo data','info'); return; }
    if (!window.confirm(`Delete plan "${row.name}"?`)) return;
    const { error } = await remove(row.id);
    if (error) { showToast(error.message,'error'); return; }
    showToast('Deleted!'); load();
  };

  return (
    <div style={{ animation:'fadeIn 0.25s' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div className="admin-page-title" style={{ marginBottom:0 }}>Membership Plans</div>
        <button className="btn-primary" onClick={()=>setModal({})}>+ Add New Plan</button>
      </div>

      {loading ? <Spinner /> : (
        <>
          <div className="plan-cards-grid">
            {data.map((p,idx) => {
              const color = PLAN_COLORS[idx % PLAN_COLORS.length];
              const subs  = PLAN_SUBS[idx] || 10;
              const feats = Array.isArray(p.features) ? p.features : [];
              return (
                <div key={p.id} className="plan-card">
                  <div className="plan-name" style={{ color }}>{p.name}</div>
                  <div className="plan-price" style={{ color }}>₹{Number(p.price).toLocaleString('en-IN')}</div>
                  <div className="plan-price-sub">/ {p.duration?.toLowerCase() || 'month'}</div>
                  <ul className="plan-features">
                    {feats.map((f,i) => <li key={i}><CheckCircle size={13} color={color} />{f}</li>)}
                  </ul>
                  <div style={{ borderTop:'1px solid #F1F5F9',paddingTop:12,marginTop:4 }}>
                    <div className="plan-subscribers" style={{ color }}>{subs}</div>
                    <div className="plan-sub-label">Active Subscribers</div>
                  </div>
                  <div style={{ display:'flex',gap:6,marginTop:12,justifyContent:'center' }}>
                    <button className="action-btn" onClick={()=>setModal(p)}>Edit</button>
                    <button className="btn-danger" style={{ padding:'5px 10px',fontSize:'0.73rem' }} onClick={()=>del(p)}>Del</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="admin-widget-section">
            <SectionHeader title="Plan Summary" />
            <div className="admin-table-container">
              <table className="admin-table">
                <thead><tr><th>Plan Name</th><th>Price</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {data.map((p,idx) => {
                    const color = PLAN_COLORS[idx % PLAN_COLORS.length];
                    return (
                      <tr key={p.id}>
                        <td><div style={{ fontWeight:600,color:'#1E293B',display:'flex',alignItems:'center',gap:8 }}><span style={{ width:10,height:10,borderRadius:'50%',background:color,display:'inline-block' }}/>{p.name}</div></td>
                        <td style={{ fontWeight:600,color }}> ₹{Number(p.price).toLocaleString('en-IN')}</td>
                        <td>{p.duration || 'Monthly'}</td>
                        <td><span className="status-badge active">{p.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td style={{ display:'flex',gap:6 }}>
                          <button className="action-btn" onClick={()=>setModal(p)}>Edit</button>
                          <button className="btn-danger" style={{ padding:'5px 10px',fontSize:'0.73rem' }} onClick={()=>del(p)}>Del</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {modal !== null && (
        <Modal title={modal.id && !modal.id.startsWith('p') ? 'Edit Plan' : 'Add Plan'} onClose={()=>setModal(null)} onSubmit={save}>
          <div className="modal-grid">
            <F.Field label="Plan Name"><F.Input name="name" defaultValue={modal.name||''} required /></F.Field>
            <F.Field label="Price (₹)"><F.Input type="number" name="price" defaultValue={modal.price||''} required /></F.Field>
            <F.Field label="Duration">
              <F.Select name="duration" defaultValue={modal.duration||'Monthly'}>
                <option>Monthly</option><option>Quarterly</option><option>Half-Yearly</option><option>Yearly</option>
              </F.Select>
            </F.Field>
            <F.Field label="Features (one per line)" span2>
              <F.Textarea name="features" defaultValue={Array.isArray(modal.features) ? modal.features.join('\n') : ''} rows={4} placeholder="Feature 1&#10;Feature 2" />
            </F.Field>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── SCHEDULE ─────────────────────────────────────────────────────────────────
const DUMMY_CLASSES = [
  { id:'sc1', class_name:'Yoga',        class_type:'yoga',     trainer_name:'Smita M.',  day_of_week:'Mon', time_slot:'6:00 AM',  capacity:20, is_active:true },
  { id:'sc2', class_name:'Strength',    class_type:'strength', trainer_name:'Arjun S.',  day_of_week:'Mon', time_slot:'7:00 AM',  capacity:15, is_active:true },
  { id:'sc3', class_name:'Zumba',       class_type:'zumba',    trainer_name:'Kavya R.',  day_of_week:'Tue', time_slot:'9:00 AM',  capacity:25, is_active:true },
  { id:'sc4', class_name:'Cardio Blast',class_type:'cardio',   trainer_name:'Raj K.',    day_of_week:'Tue', time_slot:'6:00 PM',  capacity:20, is_active:true },
  { id:'sc5', class_name:'Boxing',      class_type:'boxing',   trainer_name:'Suresh V.', day_of_week:'Mon', time_slot:'5:00 PM',  capacity:12, is_active:true },
  { id:'sc6', class_name:'Pilates',     class_type:'pilates',  trainer_name:'Meera P.',  day_of_week:'Sat', time_slot:'9:00 AM',  capacity:15, is_active:true },
  { id:'sc7', class_name:'Swimming',    class_type:'swim',     trainer_name:'Open Pool', day_of_week:'Mon', time_slot:'8:00 AM',  capacity:30, is_active:true },
];

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const ScheduleView = ({ showToast }) => {
  const { data, loading, load, upsert, remove } = useTable('schedule_classes', DUMMY_CLASSES);
  const [modal,     setModal]     = useState(null);
  const [activeDay, setActiveDay] = useState(null);

  const save = async (fd) => {
    const form = {
      class_name:   fd.get('class_name'),
      class_type:   fd.get('class_type'),
      trainer_name: fd.get('trainer_name'),
      day_of_week:  fd.get('day_of_week'),
      time_slot:    fd.get('time_slot'),
      capacity:     parseInt(fd.get('capacity')) || 20,
      is_active:    true,
    };
    const { error } = await upsert(form, modal?.id && !modal.id.startsWith('sc') ? modal.id : null);
    if (error) { showToast(error.message,'error'); return; }
    showToast(modal?.id && !modal.id.startsWith('sc') ? 'Class updated!' : 'Class added!');
    setModal(null); load();
  };

  const del = async (row) => {
    if (row.id?.startsWith('sc')) { showToast('Cannot delete demo data','info'); return; }
    if (!window.confirm(`Delete class "${row.class_name}"?`)) return;
    const { error } = await remove(row.id);
    if (error) { showToast(error.message,'error'); return; }
    showToast('Deleted!'); load();
  };

  const visibleDays = activeDay ? [activeDay] : DAYS;
  const slots = [...new Set(data.map(c=>c.time_slot))].sort();

  return (
    <div style={{ animation:'fadeIn 0.25s' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div className="admin-page-title" style={{ marginBottom:0 }}>Weekly Schedule</div>
        <button className="btn-primary" onClick={()=>setModal({})}>+ Add Class</button>
      </div>

      <div className="dashboard-grid-row" style={{ marginBottom:20 }}>
        <div className="admin-widget-section border-top-blue" style={{ marginBottom:0 }}>
          <div className="widget-body-grid" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
            <StatBox value={data.filter(c=>c.is_active).length} label="Active Classes" color="blue"   />
            <StatBox value={[...new Set(data.map(c=>c.trainer_name))].length}           label="Trainers"       color="green"  />
            <StatBox value={[...new Set(data.map(c=>c.class_type))].length}             label="Class Types"    color="orange" />
          </div>
        </div>
        <div /><div />
      </div>

      <div style={{ display:'flex',gap:8,marginBottom:16 }}>
        <FilterBtn label="All Days" active={activeDay===null} onClick={()=>setActiveDay(null)} />
        {DAYS.map(d => <FilterBtn key={d} label={d} active={activeDay===d} onClick={()=>setActiveDay(activeDay===d?null:d)} />)}
      </div>

      {loading ? <Spinner /> : (
        <div className="admin-widget-section">
          <div className="admin-table-container">
            <table className="schedule-grid">
              <thead>
                <tr>
                  <th style={{ minWidth:80 }}>Time</th>
                  {visibleDays.map(d=><th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {slots.map(slot => (
                  <tr key={slot}>
                    <td className="schedule-time">{slot}</td>
                    {visibleDays.map(day => {
                      const cls = data.find(c=>c.time_slot===slot&&c.day_of_week===day);
                      return (
                        <td key={day}>
                          {cls ? (
                            <div className={`class-card ${cls.class_type}`} style={{ cursor:'pointer' }} onClick={()=>setModal(cls)}>
                              <div style={{ fontWeight:700 }}>{cls.class_name}</div>
                              <div style={{ opacity:0.8 }}>{cls.trainer_name}</div>
                            </div>
                          ) : (
                            <div style={{ color:'#E5E7EB',textAlign:'center',paddingTop:8,fontSize:'0.7rem' }}>—</div>
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
      )}

      <div className="admin-widget-section" style={{ marginTop:16 }}>
        <SectionHeader title="All Classes">
        </SectionHeader>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead><tr><th>#</th><th>Class</th><th>Type</th><th>Trainer</th><th>Day</th><th>Time</th><th>Capacity</th><th>Actions</th></tr></thead>
            <tbody>
              {data.map((c,i) => (
                <tr key={c.id}>
                  <td style={{ color:'#94A3B8' }}>{i+1}</td>
                  <td style={{ fontWeight:600,color:'#1E293B' }}>{c.class_name}</td>
                  <td><span className={`class-card ${c.class_type}`} style={{ display:'inline-block',padding:'3px 8px',fontSize:'0.72rem' }}>{c.class_type}</span></td>
                  <td>{c.trainer_name}</td>
                  <td>{c.day_of_week}</td>
                  <td>{c.time_slot}</td>
                  <td>{c.capacity}</td>
                  <td style={{ display:'flex',gap:5 }}>
                    <button className="action-btn" onClick={()=>setModal(c)}>Edit</button>
                    <button className="btn-danger" style={{ padding:'5px 10px',fontSize:'0.73rem' }} onClick={()=>del(c)}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal !== null && (
        <Modal title={modal.id && !modal.id.startsWith('sc') ? 'Edit Class' : 'Add Class'} onClose={()=>setModal(null)} onSubmit={save}>
          <div className="modal-grid">
            <F.Field label="Class Name"><F.Input name="class_name" defaultValue={modal.class_name||''} required /></F.Field>
            <F.Field label="Class Type">
              <F.Select name="class_type" defaultValue={modal.class_type||'yoga'}>
                {['yoga','zumba','cardio','strength','swim','pilates','boxing'].map(t=><option key={t}>{t}</option>)}
              </F.Select>
            </F.Field>
            <F.Field label="Trainer Name"><F.Input name="trainer_name" defaultValue={modal.trainer_name||''} /></F.Field>
            <F.Field label="Day of Week">
              <F.Select name="day_of_week" defaultValue={modal.day_of_week||'Mon'}>
                {DAYS.map(d=><option key={d}>{d}</option>)}
              </F.Select>
            </F.Field>
            <F.Field label="Time Slot"><F.Input name="time_slot" defaultValue={modal.time_slot||'6:00 AM'} placeholder="e.g. 6:00 AM" /></F.Field>
            <F.Field label="Capacity"><F.Input type="number" name="capacity" defaultValue={modal.capacity||20} /></F.Field>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── MEMBERSHIPS ──────────────────────────────────────────────────────────────
const DUMMY_MEMBERSHIPS = [
  { id:'m1', member_name:'Arnav Totla',  member_phone:'+91 90094 52111', plan_name:'Standard', plan_price:2500, start_date:'2026-01-01', end_date:'2026-04-30', status:'Expired'  },
  { id:'m2', member_name:'Priya Sharma', member_phone:'+91 98765 43210', plan_name:'Basic',    plan_price:1200, start_date:'2026-03-01', end_date:'2026-05-31', status:'Active'   },
  { id:'m3', member_name:'Rohan Mehra',  member_phone:'+91 77654 32100', plan_name:'Premium',  plan_price:4000, start_date:'2026-02-15', end_date:'2026-05-14', status:'Expiring' },
  { id:'m4', member_name:'Anjali Verma', member_phone:'+91 66543 21000', plan_name:'Standard', plan_price:2500, start_date:'2026-04-01', end_date:'2026-06-30', status:'Active'   },
  { id:'m5', member_name:'Vikram Singh', member_phone:'+91 33210 11111', plan_name:'Premium',  plan_price:4000, start_date:'2026-05-01', end_date:'2026-07-31', status:'Upcoming' },
];

const MembershipsView = ({ clients, showToast }) => {
  const { data, loading, load, upsert, remove } = useTable('memberships', DUMMY_MEMBERSHIPS);
  const [filter, setFilter] = useState('All');
  const [modal,  setModal]  = useState(null);

  const filtered = filter === 'All' ? data : data.filter(m => m.status === filter);

  const statusColor = { Active:'#10B981', Expiring:'#F59E0B', Expired:'#EF4444', Upcoming:'#3B82F6' };
  const statusBg    = { Active:'#D1FAE5', Expiring:'#FEF3C7', Expired:'#FEE2E2', Upcoming:'#DBEAFE' };

  const daysLeft = (end) => {
    if (!end) return 0;
    const diff = Math.ceil((new Date(end) - new Date()) / 86400000);
    return diff > 0 ? diff : 0;
  };

  const save = async (fd) => {
    const form = {
      member_name:  fd.get('member_name'),
      member_phone: fd.get('member_phone'),
      plan_name:    fd.get('plan_name'),
      plan_price:   parseInt(fd.get('plan_price')) || 0,
      start_date:   fd.get('start_date'),
      end_date:     fd.get('end_date'),
      status:       fd.get('status'),
    };
    const { error } = await upsert(form, modal?.id && !modal.id.startsWith('m') ? modal.id : null);
    if (error) { showToast(error.message,'error'); return; }
    showToast(modal?.id && !modal.id.startsWith('m') ? 'Membership updated!' : 'Membership added!');
    setModal(null); load();
  };

  const del = async (row) => {
    if (row.id?.startsWith('m')) { showToast('Cannot delete demo data','info'); return; }
    if (!window.confirm(`Delete membership for ${row.member_name}?`)) return;
    const { error } = await remove(row.id);
    if (error) { showToast(error.message,'error'); return; }
    showToast('Deleted!'); load();
  };

  return (
    <div style={{ animation:'fadeIn 0.25s' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div className="admin-page-title" style={{ marginBottom:0 }}>Memberships</div>
        <button className="btn-primary" onClick={()=>setModal({})}>+ Add Membership</button>
      </div>

      <div className="dashboard-grid-row" style={{ marginBottom:20 }}>
        <div className="admin-widget-section border-top-cyan" style={{ marginBottom:0 }}>
          <div className="widget-body-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
            <StatBox value={data.length}                                   label="Total"         color="cyan"   />
            <StatBox value={data.filter(m=>m.status==='Active').length}    label="Active"        color="green"  />
            <StatBox value={data.filter(m=>m.status==='Expiring').length}  label="Expiring Soon" color="orange" />
            <StatBox value={data.filter(m=>m.status==='Expired').length}   label="Expired"       color="red"    />
          </div>
        </div>
        <div /><div />
      </div>

      <div className="admin-widget-section">
        <SectionHeader title="All Memberships">
          {['All','Active','Expiring','Expired','Upcoming'].map(f=><FilterBtn key={f} label={f} active={filter===f} onClick={()=>setFilter(f)} />)}
        </SectionHeader>
        {loading ? <Spinner /> : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>#</th><th>Member</th><th>Plan</th><th>Start</th><th>End</th><th>Days Left</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((m,i) => {
                  const dl = daysLeft(m.end_date);
                  return (
                    <tr key={m.id}>
                      <td style={{ color:'#94A3B8' }}>{i+1}</td>
                      <td><div style={{ fontWeight:600,color:'#1E293B' }}>{m.member_name}</div><div style={{ fontSize:'0.78rem',color:'#94A3B8' }}>{m.member_phone}</div></td>
                      <td style={{ fontWeight:600 }}>{m.plan_name}</td>
                      <td style={{ fontSize:'0.82rem' }}>{m.start_date}</td>
                      <td style={{ fontSize:'0.82rem' }}>{m.end_date}</td>
                      <td><span style={{ fontWeight:700,color:dl===0?'#EF4444':dl<=14?'#F59E0B':'#10B981' }}>{dl===0?'Expired':`${dl}d`}</span></td>
                      <td><span style={{ padding:'4px 10px',borderRadius:5,fontSize:'0.73rem',fontWeight:700,background:statusBg[m.status]||'#F3F4F6',color:statusColor[m.status]||'#374151' }}>{m.status}</span></td>
                      <td style={{ display:'flex',gap:5 }}>
                        <button className="action-btn" onClick={()=>setModal(m)}>Edit</button>
                        <button className="btn-danger" style={{ padding:'5px 10px',fontSize:'0.73rem' }} onClick={()=>del(m)}>Del</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal.id && !modal.id.startsWith('m') ? 'Edit Membership' : 'Add Membership'} onClose={()=>setModal(null)} onSubmit={save}>
          <div className="modal-grid">
            <F.Field label="Member Name"><F.Input name="member_name" defaultValue={modal.member_name||''} required /></F.Field>
            <F.Field label="Phone"><F.Input name="member_phone" defaultValue={modal.member_phone||''} /></F.Field>
            <F.Field label="Plan Name"><F.Input name="plan_name" defaultValue={modal.plan_name||''} /></F.Field>
            <F.Field label="Plan Price (₹)"><F.Input type="number" name="plan_price" defaultValue={modal.plan_price||''} /></F.Field>
            <F.Field label="Start Date"><F.Input type="date" name="start_date" defaultValue={modal.start_date||''} /></F.Field>
            <F.Field label="End Date"><F.Input type="date" name="end_date" defaultValue={modal.end_date||''} /></F.Field>
            <F.Field label="Status">
              <F.Select name="status" defaultValue={modal.status||'Active'}>
                <option>Active</option><option>Expiring</option><option>Expired</option><option>Upcoming</option>
              </F.Select>
            </F.Field>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
const DUMMY_PAYMENTS = [
  { id:'pay1', member_name:'Arnav Totla',  member_phone:'+91 90094 52111', plan_name:'Standard',          amount:2500, mode:'UPI',  status:'Paid',    payment_date:'2026-04-30' },
  { id:'pay2', member_name:'Priya Sharma', member_phone:'+91 98765 43210', plan_name:'Basic',             amount:1200, mode:'Cash', status:'Paid',    payment_date:'2026-04-29' },
  { id:'pay3', member_name:'Rohan Mehra',  member_phone:'+91 77654 32100', plan_name:'Premium',           amount:4000, mode:'Card', status:'Paid',    payment_date:'2026-04-28' },
  { id:'pay4', member_name:'Kavita Singh', member_phone:'+91 43210 66666', plan_name:'Premium',           amount:4000, mode:'Card', status:'Pending', payment_date:'2026-04-25' },
  { id:'pay5', member_name:'Deepak Verma', member_phone:'+91 32109 77777', plan_name:'Standard',          amount:2500, mode:'UPI',  status:'Pending', payment_date:'2026-04-24' },
];

const PaymentsView = ({ showToast }) => {
  const { data, loading, load, upsert, remove } = useTable('payments', DUMMY_PAYMENTS);
  const [filter, setFilter] = useState('All');
  const [modal,  setModal]  = useState(null);

  const filtered   = filter === 'All' ? data : data.filter(p => p.status === filter);
  const totalPaid  = data.filter(p=>p.status==='Paid').reduce((s,p)=>s+(p.amount||0),0);
  const pending    = data.filter(p=>p.status==='Pending').reduce((s,p)=>s+(p.amount||0),0);

  const save = async (fd) => {
    const form = {
      member_name:  fd.get('member_name'),
      member_phone: fd.get('member_phone'),
      plan_name:    fd.get('plan_name'),
      amount:       parseInt(fd.get('amount')) || 0,
      mode:         fd.get('mode'),
      status:       fd.get('status'),
      payment_date: fd.get('payment_date') || new Date().toISOString().slice(0,10),
    };
    const { error } = await upsert(form, modal?.id && !String(modal.id).startsWith('pay') ? modal.id : null);
    if (error) { showToast(error.message,'error'); return; }
    showToast(modal?.id && !String(modal.id).startsWith('pay') ? 'Payment updated!' : 'Payment recorded!');
    setModal(null); load();
  };

  const del = async (row) => {
    if (String(row.id).startsWith('pay')) { showToast('Cannot delete demo data','info'); return; }
    if (!window.confirm(`Delete payment by ${row.member_name}?`)) return;
    const { error } = await remove(row.id);
    if (error) { showToast(error.message,'error'); return; }
    showToast('Deleted!'); load();
  };

  return (
    <div style={{ animation:'fadeIn 0.25s' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div className="admin-page-title" style={{ marginBottom:0 }}>Payments</div>
        <button className="btn-primary" onClick={()=>setModal({})}>+ Record Payment</button>
      </div>

      <div className="dashboard-grid-row" style={{ marginBottom:20 }}>
        <div className="admin-widget-section border-top-teal" style={{ marginBottom:0 }}>
          <div className="widget-body-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
            <StatBox value={`₹${totalPaid.toLocaleString('en-IN')}`}  label="Total Collected"      color="teal"   />
            <StatBox value={`₹${pending.toLocaleString('en-IN')}`}    label="Pending"              color="orange" />
            <StatBox value={data.filter(p=>p.status==='Paid').length}    label="Paid Transactions"    color="green"  />
            <StatBox value={data.filter(p=>p.status==='Pending').length} label="Pending Transactions" color="red"    />
          </div>
        </div>
        <div /><div />
      </div>

      <div className="admin-widget-section">
        <SectionHeader title="Transaction History">
          {['All','Paid','Pending'].map(f=><FilterBtn key={f} label={f} active={filter===f} onClick={()=>setFilter(f)} />)}
        </SectionHeader>
        {loading ? <Spinner /> : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>#</th><th>Date</th><th>Member</th><th>Plan</th><th>Amount</th><th>Mode</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((p,i) => (
                  <tr key={p.id}>
                    <td style={{ color:'#94A3B8' }}>{i+1}</td>
                    <td style={{ fontSize:'0.82rem' }}>{p.payment_date}</td>
                    <td><div style={{ fontWeight:600,color:'#1E293B' }}>{p.member_name}</div><div style={{ fontSize:'0.78rem',color:'#94A3B8' }}>{p.member_phone}</div></td>
                    <td style={{ fontSize:'0.82rem' }}>{p.plan_name}</td>
                    <td style={{ fontWeight:700,color:'#14B8A6' }}>₹{Number(p.amount).toLocaleString('en-IN')}</td>
                    <td><span style={{ fontSize:'0.75rem',background:'#F1F5F9',padding:'3px 8px',borderRadius:4,color:'#475569' }}>{p.mode}</span></td>
                    <td><span style={{ padding:'4px 10px',borderRadius:5,fontSize:'0.73rem',fontWeight:700,background:p.status==='Paid'?'#D1FAE5':'#FEF3C7',color:p.status==='Paid'?'#065F46':'#92400E' }}>{p.status}</span></td>
                    <td style={{ display:'flex',gap:5 }}>
                      <button className="action-btn" onClick={()=>setModal(p)}>Edit</button>
                      <button className="btn-danger" style={{ padding:'5px 10px',fontSize:'0.73rem' }} onClick={()=>del(p)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal.id && !String(modal.id).startsWith('pay') ? 'Edit Payment' : 'Record Payment'} onClose={()=>setModal(null)} onSubmit={save}>
          <div className="modal-grid">
            <F.Field label="Member Name"><F.Input name="member_name" defaultValue={modal.member_name||''} required /></F.Field>
            <F.Field label="Phone"><F.Input name="member_phone" defaultValue={modal.member_phone||''} /></F.Field>
            <F.Field label="Plan Name"><F.Input name="plan_name" defaultValue={modal.plan_name||''} /></F.Field>
            <F.Field label="Amount (₹)"><F.Input type="number" name="amount" defaultValue={modal.amount||''} required /></F.Field>
            <F.Field label="Mode">
              <F.Select name="mode" defaultValue={modal.mode||'Cash'}>
                <option>Cash</option><option>UPI</option><option>Card</option><option>NEFT</option><option>Cheque</option>
              </F.Select>
            </F.Field>
            <F.Field label="Status">
              <F.Select name="status" defaultValue={modal.status||'Paid'}>
                <option>Paid</option><option>Pending</option><option>Refunded</option>
              </F.Select>
            </F.Field>
            <F.Field label="Payment Date"><F.Input type="date" name="payment_date" defaultValue={modal.payment_date||''} /></F.Field>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── REPORTS (charts, no CRUD needed) ────────────────────────────────────────
const revenueData   = [{ month:'Jan',revenue:98000,target:90000 },{ month:'Feb',revenue:112000,target:100000 },{ month:'Mar',revenue:105000,target:110000 },{ month:'Apr',revenue:124000,target:115000 }];
const memberData    = [{ month:'Jan',new:28,left:5 },{ month:'Feb',new:35,left:8 },{ month:'Mar',new:31,left:6 },{ month:'Apr',new:42,left:9 }];
const attendData    = [{ day:'Mon',count:132 },{ day:'Tue',count:118 },{ day:'Wed',count:145 },{ day:'Thu',count:109 },{ day:'Fri',count:138 },{ day:'Sat',count:163 },{ day:'Sun',count:71 }];

const ReportsView = ({ clients }) => (
  <div style={{ animation:'fadeIn 0.25s' }}>
    <div className="admin-page-title">Reports &amp; Analytics</div>
    <div className="dashboard-grid-row" style={{ marginBottom:20 }}>
      {[
        { val:'₹4,39,000', lbl:'Total Revenue (2026)', color:'teal'   },
        { val:'136',        lbl:'New Members (2026)',   color:'cyan'   },
        { val:373+clients.length, lbl:'Active Members', color:'orange' },
      ].map((s,i) => (
        <div key={i} className="admin-widget-section border-top-teal" style={{ marginBottom:0 }}>
          <div className="widget-body-grid">
            <StatBox value={s.val} label={s.lbl} color={s.color} />
          </div>
        </div>
      ))}
    </div>

    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:18 }}>
      <div className="admin-widget-section">
        <SectionHeader title="Monthly Revenue vs Target" />
        <div style={{ padding:'16px 18px' }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} margin={{ top:5,right:10,bottom:0,left:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize:12,fill:'#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11,fill:'#6B7280' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v=>`₹${v.toLocaleString('en-IN')}`} />
              <Legend wrapperStyle={{ fontSize:12 }} />
              <Bar dataKey="revenue" fill="#14B8A6" radius={[4,4,0,0]} name="Revenue" />
              <Bar dataKey="target"  fill="#E5E7EB" radius={[4,4,0,0]} name="Target"  />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="admin-widget-section">
        <SectionHeader title="New Members vs Churn" />
        <div style={{ padding:'16px 18px' }}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={memberData} margin={{ top:5,right:10,bottom:0,left:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize:12,fill:'#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11,fill:'#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize:12 }} />
              <Line type="monotone" dataKey="new"  stroke="#10B981" strokeWidth={2} dot={{ r:4 }} name="New Members" />
              <Line type="monotone" dataKey="left" stroke="#EF4444" strokeWidth={2} dot={{ r:4 }} name="Churned"     />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    <div className="admin-widget-section">
      <SectionHeader title="Attendance by Day (This Week)" />
      <div style={{ padding:'16px 18px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={attendData} margin={{ top:5,right:10,bottom:0,left:0 }}>
            <defs>
              <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#06B6D4" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize:12,fill:'#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11,fill:'#6B7280' }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="count" stroke="#06B6D4" strokeWidth={2} fill="url(#attGrad)" name="Attendance" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

// ─── FEEDBACKS ────────────────────────────────────────────────────────────────
const DUMMY_FEEDBACKS = [
  { id:'fb1', member_name:'Arnav Totla',  member_phone:'+91 90094 52111', rating:5, category:'Trainer',  comment:'Arjun sir is an excellent trainer. Best decision joining SkyFit!', feedback_date:'2026-04-29' },
  { id:'fb2', member_name:'Priya Sharma', member_phone:'+91 98765 43210', rating:4, category:'Facility', comment:'Gym equipment is top-notch. Changing rooms could be cleaner.', feedback_date:'2026-04-28' },
  { id:'fb3', member_name:'Rohan Mehra',  member_phone:'+91 77654 32100', rating:5, category:'Classes',  comment:'Zumba classes with Kavya ma\'am are super fun!', feedback_date:'2026-04-27' },
  { id:'fb4', member_name:'Anjali Verma', member_phone:'+91 66543 21000', rating:3, category:'Staff',    comment:'Front desk staff needs to be more responsive.', feedback_date:'2026-04-26' },
  { id:'fb5', member_name:'Deepa Sharma', member_phone:'+91 22109 22222', rating:2, category:'Staff',    comment:'Had issues with billing. Not resolved even after 3 visits.', feedback_date:'2026-04-23' },
];

const FeedbacksView = ({ showToast }) => {
  const { data, loading, load, upsert, remove } = useTable('feedbacks', DUMMY_FEEDBACKS);
  const [filter, setFilter] = useState('All');
  const [modal,  setModal]  = useState(null);

  const avg       = data.length ? (data.reduce((s,f)=>s+(f.rating||0),0)/data.length).toFixed(1) : 0;
  const dist      = [5,4,3,2,1].map(r=>({ r, count: data.filter(f=>f.rating===r).length }));
  const categories= ['All', ...new Set(data.map(f=>f.category))];
  const filtered  = filter === 'All' ? data : data.filter(f=>f.category===filter);

  const save = async (fd) => {
    const form = {
      member_name:  fd.get('member_name'),
      member_phone: fd.get('member_phone'),
      rating:       parseInt(fd.get('rating')) || 5,
      category:     fd.get('category'),
      comment:      fd.get('comment'),
      feedback_date:fd.get('feedback_date') || new Date().toISOString().slice(0,10),
    };
    const { error } = await upsert(form, modal?.id && !String(modal.id).startsWith('fb') ? modal.id : null);
    if (error) { showToast(error.message,'error'); return; }
    showToast(modal?.id && !String(modal.id).startsWith('fb') ? 'Feedback updated!' : 'Feedback added!');
    setModal(null); load();
  };

  const del = async (row) => {
    if (String(row.id).startsWith('fb')) { showToast('Cannot delete demo data','info'); return; }
    if (!window.confirm(`Delete feedback from ${row.member_name}?`)) return;
    const { error } = await remove(row.id);
    if (error) { showToast(error.message,'error'); return; }
    showToast('Deleted!'); load();
  };

  return (
    <div style={{ animation:'fadeIn 0.25s' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div className="admin-page-title" style={{ marginBottom:0 }}>Feedbacks</div>
        <button className="btn-primary" onClick={()=>setModal({})}>+ Add Feedback</button>
      </div>

      <div style={{ display:'grid',gridTemplateColumns:'1fr 2fr',gap:18,marginBottom:18 }}>
        <div className="admin-widget-section border-top-orange" style={{ marginBottom:0 }}>
          <SectionHeader title="Rating Overview" />
          <div style={{ padding:'20px 18px',textAlign:'center' }}>
            <div style={{ fontSize:'3.5rem',fontWeight:900,color:'#F59E0B',lineHeight:1 }}>{avg}</div>
            <Stars rating={Math.round(avg)} />
            <div style={{ fontSize:'0.8rem',color:'#94A3B8',marginTop:8 }}>{data.length} total reviews</div>
            <div style={{ marginTop:16,display:'flex',flexDirection:'column',gap:6 }}>
              {dist.map(({r,count}) => (
                <div key={r} style={{ display:'flex',alignItems:'center',gap:8,fontSize:'0.8rem' }}>
                  <span style={{ color:'#6B7280',width:8 }}>{r}</span>
                  <Star size={12} fill="#F59E0B" color="#F59E0B" />
                  <div style={{ flex:1,height:6,background:'#F1F5F9',borderRadius:3,overflow:'hidden' }}>
                    <div style={{ height:'100%',width:`${data.length?(count/data.length)*100:0}%`,background:'#F59E0B',borderRadius:3 }} />
                  </div>
                  <span style={{ color:'#94A3B8',width:16 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="admin-widget-section" style={{ marginBottom:0 }}>
          <SectionHeader title="Recent Feedbacks">
            {categories.map(c=><FilterBtn key={c} label={c} active={filter===c} onClick={()=>setFilter(c)} />)}
          </SectionHeader>
          {loading ? <Spinner /> : (
            <div style={{ maxHeight:340,overflowY:'auto' }}>
              {filtered.map((f,i) => (
                <div key={f.id} className="feedback-card">
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6 }}>
                    <div>
                      <span style={{ fontWeight:700,color:'#1E293B',fontSize:'0.88rem' }}>{f.member_name}</span>
                      <span style={{ marginLeft:8,fontSize:'0.72rem',background:'#EFF6FF',color:'#1E40AF',padding:'2px 8px',borderRadius:4,fontWeight:600 }}>{f.category}</span>
                    </div>
                    <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2 }}>
                      <Stars rating={f.rating} />
                      <span style={{ fontSize:'0.72rem',color:'#94A3B8' }}>{f.feedback_date}</span>
                      <div style={{ display:'flex',gap:4,marginTop:4 }}>
                        <button className="action-btn" style={{ padding:'3px 8px',fontSize:'0.7rem' }} onClick={()=>setModal(f)}>Edit</button>
                        <button className="btn-danger" style={{ padding:'3px 8px',fontSize:'0.7rem' }} onClick={()=>del(f)}>Del</button>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize:'0.83rem',color:'#64748B',margin:0,lineHeight:1.5 }}>{f.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <Modal title={modal.id && !String(modal.id).startsWith('fb') ? 'Edit Feedback' : 'Add Feedback'} onClose={()=>setModal(null)} onSubmit={save}>
          <div className="modal-grid">
            <F.Field label="Member Name"><F.Input name="member_name" defaultValue={modal.member_name||''} required /></F.Field>
            <F.Field label="Phone"><F.Input name="member_phone" defaultValue={modal.member_phone||''} /></F.Field>
            <F.Field label="Rating (1-5)"><F.Input type="number" name="rating" min="1" max="5" defaultValue={modal.rating||5} /></F.Field>
            <F.Field label="Category">
              <F.Select name="category" defaultValue={modal.category||'General'}>
                {['General','Trainer','Facility','Classes','Staff','Management'].map(c=><option key={c}>{c}</option>)}
              </F.Select>
            </F.Field>
            <F.Field label="Date"><F.Input type="date" name="feedback_date" defaultValue={modal.feedback_date||''} /></F.Field>
            <F.Field label="Comment" span2><F.Textarea name="comment" defaultValue={modal.comment||''} rows={3} /></F.Field>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── EMPLOYEES ────────────────────────────────────────────────────────────────
const DUMMY_EMPLOYEES = [
  { id:'emp1', name:'Arjun Sharma',   role:'Head Trainer',     phone:'+91 98765 00001', email:'arjun@skyfit.com',   shift:'Morning', joined_date:'2023-01-01', status:'Active'   },
  { id:'emp2', name:'Smita Mehta',    role:'Yoga Instructor',  phone:'+91 87654 00002', email:'smita@skyfit.com',   shift:'Morning', joined_date:'2023-03-15', status:'Active'   },
  { id:'emp3', name:'Kavya Rao',      role:'Zumba Instructor', phone:'+91 76543 00003', email:'kavya@skyfit.com',   shift:'Evening', joined_date:'2023-06-01', status:'Active'   },
  { id:'emp4', name:'Suresh Vyas',    role:'Boxing Coach',     phone:'+91 65432 00004', email:'suresh@skyfit.com',  shift:'Evening', joined_date:'2023-08-01', status:'Active'   },
  { id:'emp5', name:'Khushi Bamniya', role:'CSE / Front Desk', phone:'+91 32109 00007', email:'khushi@skyfit.com',  shift:'Morning', joined_date:'2024-04-01', status:'Active'   },
  { id:'emp6', name:'Anjali Das',     role:'Accountant',       phone:'+91 09876 00010', email:'anjali@skyfit.com',  shift:'Morning', joined_date:'2025-01-01', status:'On Leave' },
];

const EmployeesView = ({ showToast }) => {
  const { data, loading, load, upsert, remove } = useTable('employees', DUMMY_EMPLOYEES);
  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState(null);

  const shiftColor = { Morning:'#D1FAE5', Evening:'#FEF3C7', Both:'#EDE9FE' };
  const shiftText  = { Morning:'#065F46', Evening:'#92400E', Both:'#5B21B6'  };

  const filtered = data.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.role?.toLowerCase().includes(search.toLowerCase())
  );

  const save = async (fd) => {
    const form = {
      name:        fd.get('name'),
      role:        fd.get('role'),
      phone:       fd.get('phone'),
      email:       fd.get('email'),
      shift:       fd.get('shift'),
      joined_date: fd.get('joined_date'),
      status:      fd.get('status'),
    };
    const { error } = await upsert(form, modal?.id && !String(modal.id).startsWith('emp') ? modal.id : null);
    if (error) { showToast(error.message,'error'); return; }
    showToast(modal?.id && !String(modal.id).startsWith('emp') ? 'Employee updated!' : 'Employee added!');
    setModal(null); load();
  };

  const del = async (row) => {
    if (String(row.id).startsWith('emp')) { showToast('Cannot delete demo data','info'); return; }
    if (!window.confirm(`Delete employee ${row.name}?`)) return;
    const { error } = await remove(row.id);
    if (error) { showToast(error.message,'error'); return; }
    showToast('Deleted!'); load();
  };

  return (
    <div style={{ animation:'fadeIn 0.25s' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
        <div className="admin-page-title" style={{ marginBottom:0 }}>Employees</div>
        <button className="btn-primary" onClick={()=>setModal({})}>+ Add Employee</button>
      </div>

      <div className="dashboard-grid-row" style={{ marginBottom:20 }}>
        <div className="admin-widget-section border-top-green" style={{ marginBottom:0 }}>
          <div className="widget-body-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
            <StatBox value={data.length}                                                                      label="Total Staff"  color="green"  />
            <StatBox value={data.filter(e=>e.role?.includes('Trainer')||e.role?.includes('Instructor')||e.role?.includes('Coach')).length} label="Trainers"     color="cyan"   />
            <StatBox value={data.filter(e=>e.role?.includes('Front Desk')||e.role?.includes('Receptionist')).length}                       label="Front Desk"   color="orange" />
            <StatBox value={data.filter(e=>e.status==='On Leave').length}                                     label="On Leave"     color="red"    />
          </div>
        </div>
        <div /><div />
      </div>

      <div className="admin-widget-section">
        <SectionHeader title="Staff Directory">
          <div style={{ position:'relative' }}>
            <Search size={14} style={{ position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',color:'#9CA3AF' }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or role…" style={{ padding:'5px 10px 5px 28px',border:'1px solid #E5E7EB',borderRadius:5,fontSize:'0.8rem',outline:'none',width:220 }} />
          </div>
        </SectionHeader>
        {loading ? <Spinner /> : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead><tr><th>#</th><th>Name</th><th>Role</th><th>Phone</th><th>Email</th><th>Shift</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((e,i) => (
                  <tr key={e.id}>
                    <td style={{ color:'#94A3B8' }}>{i+1}</td>
                    <td style={{ fontWeight:600,color:'#1E293B' }}>{e.name}</td>
                    <td style={{ fontSize:'0.82rem',color:'#475569' }}>{e.role}</td>
                    <td style={{ fontSize:'0.82rem' }}>{e.phone}</td>
                    <td style={{ fontSize:'0.82rem',color:'#3B82F6' }}>{e.email}</td>
                    <td><span style={{ padding:'3px 9px',borderRadius:4,fontSize:'0.72rem',fontWeight:700,background:shiftColor[e.shift]||'#F1F5F9',color:shiftText[e.shift]||'#475569' }}>{e.shift}</span></td>
                    <td style={{ fontSize:'0.82rem' }}>{e.joined_date}</td>
                    <td><span style={{ padding:'4px 10px',borderRadius:5,fontSize:'0.73rem',fontWeight:700,background:e.status==='Active'?'#D1FAE5':'#FEF3C7',color:e.status==='Active'?'#065F46':'#92400E' }}>{e.status}</span></td>
                    <td style={{ display:'flex',gap:5 }}>
                      <button className="action-btn" onClick={()=>setModal(e)}>Edit</button>
                      <button className="btn-danger" style={{ padding:'5px 10px',fontSize:'0.73rem' }} onClick={()=>del(e)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <Modal title={modal.id && !String(modal.id).startsWith('emp') ? 'Edit Employee' : 'Add Employee'} onClose={()=>setModal(null)} onSubmit={save}>
          <div className="modal-grid">
            <F.Field label="Name"><F.Input name="name" defaultValue={modal.name||''} required /></F.Field>
            <F.Field label="Role"><F.Input name="role" defaultValue={modal.role||''} /></F.Field>
            <F.Field label="Phone"><F.Input name="phone" defaultValue={modal.phone||''} /></F.Field>
            <F.Field label="Email"><F.Input type="email" name="email" defaultValue={modal.email||''} /></F.Field>
            <F.Field label="Shift">
              <F.Select name="shift" defaultValue={modal.shift||'Morning'}>
                <option>Morning</option><option>Evening</option><option>Both</option>
              </F.Select>
            </F.Field>
            <F.Field label="Joined Date"><F.Input type="date" name="joined_date" defaultValue={modal.joined_date||''} /></F.Field>
            <F.Field label="Status">
              <F.Select name="status" defaultValue={modal.status||'Active'}>
                <option>Active</option><option>On Leave</option><option>Resigned</option>
              </F.Select>
            </F.Field>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── TUTORIAL ─────────────────────────────────────────────────────────────────
const tutorialCards = [
  { icon:Users,      bg:'#EFF6FF', ic:'#3B82F6', title:'Member Management',      desc:'Learn how to add, edit, and manage member profiles, memberships, and attendance records.' },
  { icon:CreditCard, bg:'#F0FDF4', ic:'#10B981', title:'Payments & Billing',     desc:'Process payments, generate invoices, track dues, and set up automatic renewal reminders.' },
  { icon:Calendar,   bg:'#FEF3C7', ic:'#F59E0B', title:'Class Scheduling',       desc:'Create and manage weekly class schedules, assign trainers, and track class attendance.' },
  { icon:BarChart2,  bg:'#FDF4FF', ic:'#8B5CF6', title:'Reports & Analytics',    desc:'Generate revenue reports, member growth charts, and attendance analytics for insights.' },
  { icon:UserCheck,  bg:'#FFF7ED', ic:'#F97316', title:'Staff Management',       desc:'Add employees, set shifts, track performance, and manage trainer-client assignments.' },
  { icon:Shield,     bg:'#FEF2F2', ic:'#EF4444', title:'Settings & Permissions', desc:'Configure role-based access, update gym settings, and manage notification preferences.' },
];

const faqs = [
  { q:'How do I add a new member?',            a:'Go to Members → click "Add Member" in the top right, fill in the form, and assign a membership plan.' },
  { q:'How do I record a payment?',            a:'Navigate to Payments, click "+ Record Payment", select the member, enter amount and mode, then save.' },
  { q:'How do I add a class to the schedule?', a:'Go to Schedule → "+ Add Class", choose the day, time, trainer, and class type, then confirm.' },
  { q:'How do I generate a monthly report?',   a:'Visit the Reports section, select the month range, choose the report type, and click "Export PDF".' },
  { q:'How do I add an enquiry?',              a:'In the Enquiries tab, click "+ Add", fill in the lead details, assign to a CSE, and set status.' },
];

const TutorialView = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ animation:'fadeIn 0.25s' }}>
      <div className="admin-page-title">Help &amp; Tutorial</div>

      <div className="tutorial-grid">
        {tutorialCards.map((c,i) => (
          <div key={i} className="tutorial-card">
            <div className="tutorial-icon" style={{ background:c.bg }}>
              <c.icon size={22} color={c.ic} />
            </div>
            <div className="tutorial-title">{c.title}</div>
            <div className="tutorial-desc">{c.desc}</div>
            <div style={{ marginTop:14,fontSize:'0.8rem',color:'#C9A84C',fontWeight:600,cursor:'pointer' }}>View Guide →</div>
          </div>
        ))}
      </div>

      <div className="admin-widget-section">
        <SectionHeader title="Frequently Asked Questions" />
        <div style={{ padding:'0 0 8px' }}>
          {faqs.map((f,i) => (
            <div key={i} style={{ borderBottom:i<faqs.length-1?'1px solid #F3F4F6':'none' }}>
              <div onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{ padding:'15px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',color:'#1E293B',fontWeight:600,fontSize:'0.88rem' }}>
                <span style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <HelpCircle size={16} color="#C9A84C" />{f.q}
                </span>
                <ChevronDown size={16} color="#94A3B8" style={{ transform:openFaq===i?'rotate(180deg)':'none',transition:'transform 0.2s' }} />
              </div>
              {openFaq===i && (
                <div style={{ padding:'0 20px 16px 46px',fontSize:'0.85rem',color:'#64748B',lineHeight:1.6 }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
