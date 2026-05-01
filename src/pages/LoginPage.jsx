import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';

const ROLE_ROUTES = { admin: '/admin', trainer: '/trainer', client: '/client' };

const inputStyle = (focused) => ({
  width: '100%',
  boxSizing: 'border-box',
  padding: '14px 14px 14px 44px',
  background: '#0F172A',
  border: `1px solid ${focused ? '#C9A84C' : '#334155'}`,
  borderRadius: '8px',
  color: '#F8FAFC',
  outline: 'none',
  fontSize: '0.95rem',
  transition: 'border-color 0.2s',
});

const LoginPage = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode]         = useState('login');   // 'login' | 'signup'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [role, setRole]         = useState('client');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  const [focusField, setFocusField] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { data, error: err } = await signIn(email, password);
    if (err) { setError(err.message); setLoading(false); return; }

    const { data: prof } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single();
    const r = prof?.role || 'client';
    navigate(ROLE_ROUTES[r] || '/client');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const { error: err } = await signUp(email, password, { name, role });
    if (err) { setError(err.message); setLoading(false); return; }
    setSuccess('Account created! Check your email to confirm, then sign in.');
    setMode('login');
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-block', padding: '14px 28px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '0.15em', color: '#C9A84C' }}>SKY</span>
            <span style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '0.15em', color: '#F8FAFC' }}>FIT</span>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0 }}>
            {mode === 'login' ? 'Sign in to your portal' : 'Create a new account'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#1E293B', borderRadius: '16px', padding: '36px', border: '1px solid #334155' }}>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 16px', color: '#FCA5A5', fontSize: '0.85rem', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '12px 16px', color: '#6EE7B7', fontSize: '0.85rem', marginBottom: '20px' }}>
              {success}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleSignUp}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {mode === 'signup' && (
              <div style={{ position: 'relative' }}>
                <UserPlus size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
                <input
                  type="text" placeholder="Full Name" value={name}
                  onChange={e => setName(e.target.value)} required
                  onFocus={() => setFocusField('name')} onBlur={() => setFocusField('')}
                  style={inputStyle(focusField === 'name')}
                />
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
              <input
                type="email" placeholder="Email address" value={email}
                onChange={e => setEmail(e.target.value)} required
                onFocus={() => setFocusField('email')} onBlur={() => setFocusField('')}
                style={inputStyle(focusField === 'email')}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }} />
              <input
                type={showPw ? 'text' : 'password'} placeholder="Password" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={6}
                onFocus={() => setFocusField('password')} onBlur={() => setFocusField('')}
                style={{ ...inputStyle(focusField === 'password'), paddingRight: '44px' }}
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 0 }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {mode === 'signup' && (
              <div style={{ position: 'relative' }}>
                <select value={role} onChange={e => setRole(e.target.value)}
                  style={{ ...inputStyle(false), paddingLeft: '14px', appearance: 'none', cursor: 'pointer' }}>
                  <option value="client">Member / Client</option>
                  <option value="trainer">Trainer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: '15px', background: loading ? '#7A6530' : '#C9A84C',
              color: '#0F172A', border: 'none', borderRadius: '8px', fontWeight: 700,
              fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'background 0.2s', letterSpacing: '0.05em', marginTop: '8px',
            }}>
              {loading
                ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Please wait…</>
                : mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>

        {/* Toggle mode */}
        <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.85rem', marginTop: '20px' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
            style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <p style={{ textAlign: 'center', color: '#334155', fontSize: '0.75rem', marginTop: '8px' }}>
          SkyFit Gym Management Platform
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoginPage;
