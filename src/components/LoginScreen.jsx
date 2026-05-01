import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';

const LoginScreen = ({ title, role, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', width: '100%', padding: '20px', background: 'var(--bg-body)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px', textAlign: 'center', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--bg-border)' }}>
        <h2 style={{ marginBottom: '10px', color: 'var(--gold)', fontFamily: 'var(--font-hero)' }}>{title}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Sign in to access {role}</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <User size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '15px 15px 15px 45px', background: 'var(--bg-body)', border: '1px solid var(--bg-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '15px 15px 15px 45px', background: 'var(--bg-body)', border: '1px solid var(--bg-border)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
            />
          </div>
          <button type="submit" style={{ padding: '15px', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: 'background 0.3s' }}>
            ACCESS SECURE PORTAL
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
