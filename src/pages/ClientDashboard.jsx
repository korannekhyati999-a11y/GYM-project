import React, { useState } from 'react';
import { Activity, Calendar, Trophy, Bell, CheckCircle, Circle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockTransformation = [
  { week: 'W1', weight: 190, fat: 22 },
  { week: 'W2', weight: 188, fat: 21.5 },
  { week: 'W3', weight: 185, fat: 20 },
  { week: 'W4', weight: 183, fat: 19.5 },
  { week: 'W5', weight: 181, fat: 18 },
  { week: 'W6', weight: 178, fat: 16 },
];

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [tasks, setTasks] = useState([
    { id: 1, type: 'workout', text: 'Chest & Triceps Focus', completed: false },
    { id: 2, type: 'workout', text: '30 Min HIIT Cardio', completed: true },
    { id: 3, type: 'diet', text: 'Breakfast: 4 Eggs, Oatmeal', completed: true },
    { id: 4, type: 'diet', text: 'Lunch: Chicken breast, rice, greens', completed: false },
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: 'var(--bg-card)', padding: '30px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 className="logo text-accent" style={{ marginBottom: '40px' }}>SUMMIT <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 500 }}>CLIENT</span></h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            onClick={() => setActiveTab('overview')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: activeTab === 'overview' ? 'rgba(255,46,46,0.1)' : 'transparent', color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-secondary)', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '1rem' }}
          >
            <Activity size={20} /> Today's Action
          </button>
          <button 
            onClick={() => setActiveTab('progress')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: activeTab === 'progress' ? 'rgba(255,46,46,0.1)' : 'transparent', color: activeTab === 'progress' ? 'var(--primary)' : 'var(--text-secondary)', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '1rem' }}
          >
            <Trophy size={20} /> Transformation
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1>Welcome, John</h1>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ padding: '8px 16px', background: 'rgba(255,165,0,0.1)', color: 'orange', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={16} /> Membership expires in 12 days
            </div>
            <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150" alt="Avatar" style={{ width: '45px', height: '45px', borderRadius: '50%' }} />
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="animation-fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
              
              {/* Daily Checklist */}
              <div>
                <h3 style={{ marginBottom: '20px' }}>Daily Action Items</h3>
                <div className="glass-panel" style={{ padding: '30px' }}>
                  
                  <h4 style={{ color: 'var(--primary)', marginBottom: '15px' }}>Workout Plan</h4>
                  {tasks.filter(t => t.type === 'workout').map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => toggleTask(task.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: task.completed ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', transition: 'all 0.2s', opacity: task.completed ? 0.6 : 1 }}
                    >
                      {task.completed ? <CheckCircle color="var(--primary)" size={24} /> : <Circle color="var(--text-secondary)" size={24} />}
                      <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.text}</span>
                    </div>
                  ))}

                  <h4 style={{ color: 'var(--primary)', marginBottom: '15px', marginTop: '30px' }}>Dietary Compliance</h4>
                  {tasks.filter(t => t.type === 'diet').map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => toggleTask(task.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: task.completed ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', transition: 'all 0.2s', opacity: task.completed ? 0.6 : 1 }}
                    >
                      {task.completed ? <CheckCircle color="var(--primary)" size={24} /> : <Circle color="var(--text-secondary)" size={24} />}
                      <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.text}</span>
                    </div>
                  ))}
                  
                </div>
              </div>

              {/* Sidebar Stats */}
              <div>
                <h3 style={{ marginBottom: '20px' }}>Next Session</h3>
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
                  <Calendar color="var(--primary)" size={32} style={{ marginBottom: '15px' }} />
                  <h4>Personal Training</h4>
                  <p className="text-secondary" style={{ marginBottom: '15px' }}>Tomorrow, 10:00 AM</p>
                  <p style={{ fontSize: '0.9rem' }}>Trainer: Michael Smith</p>
                </div>

                <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(255,46,46,0.2) 0%, rgba(20,20,20,0.8) 100%)' }}>
                  <h4>Weekly Streak</h4>
                  <h1 style={{ fontSize: '3rem', color: 'var(--primary)', margin: '10px 0' }}>4</h1>
                  <p className="text-secondary">Days consecutive training</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="animation-fade-in">
            <h3 style={{ marginBottom: '20px' }}>Transformation Report</h3>
            
            <div className="glass-panel" style={{ padding: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div>
                  <h4 className="text-secondary">Current Weight</h4>
                  <h1 style={{ color: 'white' }}>178 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>lbs</span></h1>
                </div>
                <div>
                  <h4 className="text-secondary">Current Fat %</h4>
                  <h1 style={{ color: 'white' }}>16 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>%</span></h1>
                </div>
                <div>
                  <h4 className="text-secondary">Goal Progress</h4>
                  <h1 style={{ color: 'var(--primary)' }}>80 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>%</span></h1>
                </div>
              </div>

              <div style={{ height: '400px', marginTop: '20px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockTransformation}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week" stroke="var(--text-secondary)" />
                    <YAxis yAxisId="left" stroke="#fff" domain={['dataMin - 5', 'dataMax + 5']} />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--primary)" domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }} />
                    <Area yAxisId="left" type="monotone" dataKey="weight" stroke="#fff" fillOpacity={1} fill="url(#colorWeight)" />
                    <Area yAxisId="right" type="monotone" dataKey="fat" stroke="var(--primary)" fillOpacity={1} fill="url(#colorFat)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
