import React, { useState } from 'react';
import { Users, Activity, Calendar, Award, UserPlus, FileText, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockClients = [
  { id: 1, name: 'John Doe', goal: 'Weight Loss', progress: 85, nextSession: '10:00 AM, Today' },
  { id: 2, name: 'Sarah Smith', goal: 'Muscle Gain', progress: 60, nextSession: '2:00 PM, Tomorrow' },
  { id: 3, name: 'Michael Brown', goal: 'Endurance', progress: 92, nextSession: '7:00 AM, Friday' },
];

const mockMeasurements = [
  { month: 'Jan', weight: 190, fat: 22, bmi: 28.5 },
  { month: 'Feb', weight: 185, fat: 20, bmi: 27.8 },
  { month: 'Mar', weight: 181, fat: 18, bmi: 27.0 },
  { month: 'Apr', weight: 178, fat: 16, bmi: 26.5 },
  { month: 'May', weight: 175, fat: 15, bmi: 26.0 },
];

const TrainerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClient, setSelectedClient] = useState(mockClients[0]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: 'var(--bg-card)', padding: '30px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 className="logo text-accent" style={{ marginBottom: '40px' }}>SUMMIT <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 500 }}>PRO</span></h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: activeTab === 'overview' ? 'rgba(255,46,46,0.1)' : 'transparent', color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-secondary)', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '1rem' }}
          >
            <Activity size={20} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('clients')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: activeTab === 'clients' ? 'rgba(255,46,46,0.1)' : 'transparent', color: activeTab === 'clients' ? 'var(--primary)' : 'var(--text-secondary)', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '1rem' }}
          >
            <Users size={20} /> My Clients
          </button>
          <button 
            onClick={() => setActiveTab('assign')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: activeTab === 'assign' ? 'rgba(255,46,46,0.1)' : 'transparent', color: activeTab === 'assign' ? 'var(--primary)' : 'var(--text-secondary)', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '1rem' }}
          >
            <Calendar size={20} /> Assign Plans
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px' }}>
        {activeTab === 'overview' && (
          <div className="animation-fade-in">
            <h1 style={{ marginBottom: '30px' }}>Welcome back, Coach</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <Users color="var(--primary)" size={24} style={{ marginBottom: '15px' }} />
                <h3 style={{ fontSize: '2rem', margin: 0 }}>24</h3>
                <p className="text-secondary">Active Clients</p>
              </div>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <Calendar color="var(--primary)" size={24} style={{ marginBottom: '15px' }} />
                <h3 style={{ fontSize: '2rem', margin: 0 }}>6</h3>
                <p className="text-secondary">Sessions Today</p>
              </div>
              <div className="glass-panel" style={{ padding: '24px' }}>
                <Award color="var(--primary)" size={24} style={{ marginBottom: '15px' }} />
                <h3 style={{ fontSize: '2rem', margin: 0 }}>92%</h3>
                <p className="text-secondary">Client Retention</p>
              </div>
            </div>

            <h2>Upcoming Sessions</h2>
            <div className="glass-panel" style={{ marginTop: '20px' }}>
              {mockClients.map(client => (
                <div key={client.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <h4>{client.name}</h4>
                    <p className="text-secondary" style={{ fontSize: '0.9rem' }}>{client.goal}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--primary)', fontWeight: 600 }}>{client.nextSession}</p>
                    <p className="text-secondary" style={{ fontSize: '0.9rem' }}>{client.progress}% Goal Reached</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="animation-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h1>Client Analytics</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
              {/* Client List */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '20px' }}>Roster</h3>
                {mockClients.map(client => (
                  <div 
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    style={{ padding: '15px', background: selectedClient.id === client.id ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: '8px', cursor: 'pointer', marginBottom: '10px', transition: 'all 0.3s' }}
                  >
                    <h4>{client.name}</h4>
                    <p className="text-secondary" style={{ fontSize: '0.85rem' }}>{client.goal}</p>
                  </div>
                ))}
              </div>

              {/* Client Details */}
              <div>
                <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                    <div>
                      <h2>{selectedClient.name}</h2>
                      <p className="text-secondary">Goal: {selectedClient.goal}</p>
                    </div>
                    <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Edit Profile</button>
                  </div>

                  <h3 style={{ marginBottom: '20px' }}>Body Transformation (Weight & Fat %)</h3>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockMeasurements}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="month" stroke="var(--text-secondary)" />
                        <YAxis yAxisId="left" stroke="var(--primary)" />
                        <YAxis yAxisId="right" orientation="right" stroke="#fff" />
                        <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #333' }} />
                        <Line yAxisId="left" type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={3} />
                        <Line yAxisId="right" type="monotone" dataKey="fat" stroke="#fff" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assign' && (
          <div className="animation-fade-in" style={{ maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '30px' }}>Assign Plans</h1>
            
            <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '20px' }}><FileText size={20} style={{ verticalAlign: 'middle', marginRight: '10px' }}/> Weekly Workout Assignment</h3>
              <div className="form-group">
                <label className="text-secondary" style={{ display: 'block', marginBottom: '10px' }}>Select Client</label>
                <select className="form-control" style={{ WebkitAppearance: 'none' }}>
                  {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="text-secondary" style={{ display: 'block', marginBottom: '10px' }}>Workout JSON/Template</label>
                <textarea className="form-control" rows="5" placeholder='{"day": "Monday", "focus": "Chest & Triceps", "exercises": ["Bench Press 4x8", "Incline DB Press 3x10"]}'></textarea>
              </div>
              <button className="btn btn-primary"><CheckCircle size={18}/> Push Workout</button>
            </div>

            <div className="glass-panel" style={{ padding: '30px' }}>
              <h3 style={{ marginBottom: '20px' }}><Activity size={20} style={{ verticalAlign: 'middle', marginRight: '10px' }}/> Dietary Plan</h3>
              <div className="form-group">
                <textarea className="form-control" rows="5" placeholder='Describe macro splits (e.g., 200g P, 300g C, 70g F) or meal template here...'></textarea>
              </div>
              <button className="btn btn-outline"><CheckCircle size={18}/> Assign Diet</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrainerDashboard;
