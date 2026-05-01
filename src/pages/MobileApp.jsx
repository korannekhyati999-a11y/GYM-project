import React, { useState, useEffect } from 'react';
import { Home, Utensils, User, Flame, Activity as ActivityIcon, CheckCircle2, Zap, Play, Calendar, Check, Circle, X, Sun, Moon, Users, Shield, Server, Database } from 'lucide-react';
import '../MobileApp.css';
import MembershipWizard from '../components/MembershipWizard';
import LoginScreen from '../components/LoginScreen';
import { supabase } from '../supabaseClient';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultWorkouts = {
  Monday: { title: "Leg Annihilation", focus: "Quads & Glutes", exercises: "Barbell Squats 4x8\nLeg Press 3x12\nRomanian Deadlift 3x10", image: "/images/leg_workout_vid.png" },
  Tuesday: { title: "Chest Demolition", focus: "Pecs & Triceps", exercises: "Bench Press 4x8\nIncline DB 3x10\nCable Flyes 3x15", image: "/images/chest_workout_vid.png" },
  Wednesday: { title: "Back Dominance", focus: "Lats & Biceps", exercises: "Deadlifts 4x5\nPull-ups 3xFailure\nBarbell Rows 3x10", image: "/images/back_workout_vid.png" },
  Thursday: null,
  Friday: null,
  Saturday: null,
  Sunday: null,
};

// ---------------- MASTER PANEL COMPONENT ----------------
const MasterPanel = ({ workouts, sessionProgress, isSessionActive, registeredClients }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [liveLog, setLiveLog] = useState([]);
  const [adminTab, setAdminTab] = useState('overview');

  useEffect(() => {
    if (isSessionActive) {
      setLiveLog(prev => [{ time: new Date().toLocaleTimeString(), msg: "Session started by John Doe" }, ...prev].slice(0, 5));
    } else {
      setLiveLog(prev => [{ time: new Date().toLocaleTimeString(), msg: "Session inactive" }, ...prev].slice(0, 5));
    }
  }, [isSessionActive]);

  if (!isAuthenticated) {
    return (
      <div className="mobile-app-container master-device">
        <LoginScreen title="SKYFIT HQ" role="Admin System" onLogin={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="mobile-app-container master-device">
      <header className="app-header" style={{flexDirection: 'column', alignItems: 'flex-start', paddingBottom: '10px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
          <h2 style={{color: 'var(--text-primary)', fontSize: '1.2rem', margin: 0}}>SkyFit HQ</h2>
          <span className="badge-online" style={{background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', borderColor: 'rgba(201,168,76,0.3)'}}>Admin Access</span>
        </div>
        <div style={{display: 'flex', gap: '15px', marginTop: '15px', width: '100%', borderBottom: '1px solid var(--bg-border)'}}>
          <button onClick={() => setAdminTab('overview')} style={{background: 'none', border: 'none', padding: '5px 0', color: adminTab === 'overview' ? 'var(--gold)' : 'var(--text-secondary)', borderBottom: adminTab === 'overview' ? '2px solid var(--gold)' : '2px solid transparent', cursor: 'pointer', fontSize: '0.85rem'}}>Overview</button>
          <button onClick={() => setAdminTab('database')} style={{background: 'none', border: 'none', padding: '5px 0', color: adminTab === 'database' ? 'var(--gold)' : 'var(--text-secondary)', borderBottom: adminTab === 'database' ? '2px solid var(--gold)' : '2px solid transparent', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', gap: '5px', alignItems: 'center'}}><Database size={14}/> Database</button>
        </div>
      </header>

      <div className="app-content-scroll" style={{paddingTop: '20px'}}>
        {adminTab === 'overview' ? (
          <>
            <div className="stats-grid">
              <div className="stat-box">
                <Users size={20} color="var(--gold)" style={{ marginBottom: '10px' }} />
                <div className="stat-val">{1204 + registeredClients.length}</div>
                <div className="stat-sub">Active Clients</div>
              </div>
              <div className="stat-box">
                <Shield size={20} color="var(--gold)" style={{ marginBottom: '10px' }} />
                <div className="stat-val">42</div>
                <div className="stat-sub">Pro Trainers</div>
              </div>
            </div>

            <div className="app-card" style={{marginTop: '20px', background: 'var(--bg-card)', borderColor: 'var(--bg-border)'}}>
              <h3 style={{fontSize: '1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)'}}>
                <Server size={18} color="var(--gold)" /> Live Sync Network
              </h3>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--bg-border)'}}>
                <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Trainer Pro ↔ John Doe</span>
                <span style={{color: isSessionActive ? '#10B981' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600}}>
                  {isSessionActive ? 'SYNCING' : 'IDLE'}
                </span>
              </div>
              {registeredClients.length > 0 && (
                <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--bg-border)'}}>
                  <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Coach Sarah ↔ {registeredClients[0].personal.name}</span>
                  <span style={{color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600}}>NEW</span>
                </div>
              )}
            </div>

            <div className="app-card highlight" style={{marginTop: '20px'}}>
              <h3 style={{fontSize: '1rem', marginBottom: '15px', color: 'var(--text-primary)'}}>System Activity Log</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {registeredClients.length > 0 && (
                  <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '10px'}}>
                    <span style={{color: '#10B981', minWidth: '60px'}}>Just Now</span>
                    <span>New Client Reg: {registeredClients[0].personal.name}</span>
                  </div>
                )}
                {liveLog.map((log, i) => (
                  <div key={i} style={{fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '10px'}}>
                    <span style={{color: 'var(--gold)', minWidth: '60px'}}>{log.time}</span>
                    <span>{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div style={{animation: 'fadeIn 0.3s'}}>
            <h3 style={{fontSize: '1rem', marginBottom: '15px', color: 'var(--text-primary)'}}>Client Database (Excel Format)</h3>
            {registeredClients.length === 0 ? (
              <div style={{textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: '0.9rem'}}>
                No new client registrations yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '4px', border: '1px solid #ccc' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.75rem', fontFamily: 'Arial, sans-serif', color: '#333' }}>
                  <thead>
                    <tr style={{ background: '#f0f0f0', borderBottom: '2px solid #ccc' }}>
                      <th style={{ padding: '8px', borderRight: '1px solid #ccc', textAlign: 'left', fontWeight: 'bold' }}>Name</th>
                      <th style={{ padding: '8px', borderRight: '1px solid #ccc', textAlign: 'left', fontWeight: 'bold' }}>Contact No.</th>
                      <th style={{ padding: '8px', borderRight: '1px solid #ccc', textAlign: 'left', fontWeight: 'bold' }}>Email Id</th>
                      <th style={{ padding: '8px', borderRight: '1px solid #ccc', textAlign: 'left', fontWeight: 'bold' }}>Address</th>
                      <th style={{ padding: '8px', borderRight: '1px solid #ccc', textAlign: 'left', fontWeight: 'bold' }}>DOB</th>
                      <th style={{ padding: '8px', borderRight: '1px solid #ccc', textAlign: 'left', fontWeight: 'bold' }}>Mem. Start</th>
                      <th style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredClients.map((client, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                        <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{client.personal.name}</td>
                        <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{client.personal.mobile}</td>
                        <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{client.personal.email}</td>
                        <td style={{ padding: '8px', borderRight: '1px solid #eee', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={client.personal.address}>{client.personal.address}</td>
                        <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{client.personal.dob}</td>
                        <td style={{ padding: '8px', borderRight: '1px solid #eee' }}>{client.personal.durationFrom}</td>
                        <td style={{ padding: '8px', color: '#b91c1c', fontWeight: 'bold' }}>{client.personal.durationTo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------- TRAINER PANEL COMPONENT ----------------
const TrainerPanel = ({ trainerSelectedDay, setTrainerSelectedDay, editWorkout, handleEditChange, handlePushWorkout, workouts, sessionProgress, editDiet, setEditDiet, handlePushDiet }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const activeWorkout = workouts[trainerSelectedDay];
  const progressForDay = sessionProgress[trainerSelectedDay] || {};
  let totalExercises = 0;
  let completedCount = 0;
  
  if (activeWorkout && activeWorkout.exercises) {
    const exerciseList = activeWorkout.exercises.split('\n').filter(ex => ex.trim() !== '');
    totalExercises = exerciseList.length;
    completedCount = exerciseList.filter((_, i) => progressForDay[i]).length;
  }
  
  const completionPercentage = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  if (!isAuthenticated) {
    return (
      <div className="mobile-app-container trainer-device">
        <LoginScreen title="TRAINER PRO" role="Trainer Device" onLogin={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="mobile-app-container trainer-device">
      <header className="app-header" style={{flexDirection: 'column', alignItems: 'flex-start', paddingBottom: '10px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
          <h2 style={{color: 'var(--text-primary)', fontSize: '1.2rem', margin: 0}}>Trainer Pro</h2>
          <span className="badge-online" style={{background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', borderColor: 'rgba(201,168,76,0.3)'}}>Live Sync Active</span>
        </div>
        <p style={{color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '5px'}}>Assigning to: John Doe</p>
      </header>

      <div className="app-content-scroll" style={{paddingTop: '20px'}}>
        <h3 style={{fontSize: '1rem', marginBottom: '10px', color: 'var(--text-primary)'}}>Select Day</h3>
        <div className="day-selector">
          {daysOfWeek.map(day => (
            <button 
              key={day} 
              className={`day-btn ${trainerSelectedDay === day ? 'active' : ''}`}
              onClick={() => setTrainerSelectedDay(day)}
              type="button"
            >
              {day.substring(0,3)}
            </button>
          ))}
        </div>

        {/* Live Progress Tracker */}
        {activeWorkout && totalExercises > 0 && (
          <div className="app-card" style={{marginTop: '20px', background: 'var(--bg-card)', border: '1px solid var(--bg-border)'}}>
            <h4 style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between'}}>
              <span>Client Live Progress</span>
              <span style={{color: completionPercentage === 100 ? '#10B981' : 'var(--gold)'}}>{completionPercentage}%</span>
            </h4>
            <div style={{height: '6px', width: '100%', background: 'var(--bg-light)', borderRadius: '3px', overflow: 'hidden'}}>
              <div style={{height: '100%', width: `${completionPercentage}%`, background: completionPercentage === 100 ? '#10B981' : 'var(--gold)', transition: 'width 0.4s ease'}}></div>
            </div>
            
            <div style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {activeWorkout.exercises.split('\n').filter(ex => ex.trim() !== '').map((ex, i) => (
                <div key={i} style={{fontSize: '0.85rem', display: 'flex', alignItems: 'center', color: progressForDay[i] ? '#10B981' : 'var(--text-primary)', transition: 'color 0.3s'}}>
                  {progressForDay[i] ? <CheckCircle2 size={14} style={{marginRight: '8px'}} /> : <Circle size={14} style={{marginRight: '8px', color: 'var(--text-muted)'}} />}
                  <span style={{textDecoration: progressForDay[i] ? 'line-through' : 'none', opacity: progressForDay[i] ? 0.7 : 1, transition: 'all 0.3s'}}>{ex}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="app-card highlight" style={{marginTop: '20px'}}>
          <h3 style={{fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text-primary)'}}><Calendar size={18} style={{verticalAlign: 'bottom', marginRight: '5px', color: 'var(--gold)'}}/> {trainerSelectedDay} Program</h3>
          
          <form onSubmit={handlePushWorkout} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <div>
              <label className="form-label">Workout Title</label>
              <input 
                className="form-input" 
                value={editWorkout.title} 
                onChange={(e) => handleEditChange('title', e.target.value)}
                placeholder="e.g. Chest Demolition"
                required
              />
            </div>
            <div>
              <label className="form-label">Focus / Target</label>
              <input 
                className="form-input" 
                value={editWorkout.focus} 
                onChange={(e) => handleEditChange('focus', e.target.value)}
                placeholder="e.g. Pecs & Triceps"
                required
              />
            </div>
            <div>
              <label className="form-label">Exercises (Sets x Reps)</label>
              <textarea 
                className="form-input" 
                style={{height: '100px'}}
                value={editWorkout.exercises} 
                onChange={(e) => handleEditChange('exercises', e.target.value)}
                placeholder="Bench Press 4x8&#10;Incline DB 3x10"
                required
              />
            </div>
            
            <button type="submit" className="onboarding-btn" style={{marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'}}>
              <Zap size={18} /> Push Workout
            </button>
          </form>
        </div>

        <div className="app-card highlight" style={{marginTop: '20px'}}>
          <h3 style={{fontSize: '1.1rem', marginBottom: '15px', color: 'var(--text-primary)'}}><Utensils size={18} style={{verticalAlign: 'bottom', marginRight: '5px', color: 'var(--gold)'}}/> {trainerSelectedDay} Diet</h3>
          
          <form onSubmit={handlePushDiet} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <div>
              <textarea 
                className="form-input" 
                style={{height: '100px'}}
                value={editDiet} 
                onChange={(e) => setEditDiet(e.target.value)}
                placeholder="Breakfast: 4 Eggs, Oatmeal&#10;Lunch: Chicken & Rice"
                required
              />
            </div>
            
            <button type="submit" className="onboarding-btn" style={{marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'}}>
              <Zap size={18} /> Push Diet
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ---------------- CLIENT PANEL COMPONENT ----------------
const ClientPanel = ({ clientActiveDay, setClientActiveDay, workouts, diets, sessionProgress, setSessionProgress, isSessionActive, setIsSessionActive, onRegister }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [clientTab, setClientTab] = useState('home');
  
  if (!isAuthenticated) {
    return (
      <div className="mobile-app-container client-device">
        <LoginScreen title="SKYFIT CLIENT" role="Client App" onLogin={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="mobile-app-container client-device" style={{ background: 'var(--bg-body)' }}>
        <div className="app-content-scroll" style={{ padding: '0 0 40px 0' }}>
          <MembershipWizard 
            showAutoFill={true}
            onComplete={(data) => {
              onRegister(data);
              setIsRegistered(true);
            }} 
          />
        </div>
      </div>
    );
  }

  const activeWorkout = workouts[clientActiveDay];
  const progressForDay = sessionProgress[clientActiveDay] || {};

  const toggleExercise = (index) => {
    setSessionProgress(prev => ({
      ...prev,
      [clientActiveDay]: {
        ...prev[clientActiveDay],
        [index]: !prev[clientActiveDay]?.[index]
      }
    }));
  };

  const exerciseList = activeWorkout ? activeWorkout.exercises.split('\n').filter(ex => ex.trim() !== '') : [];
  const completedCount = exerciseList.filter((_, i) => progressForDay[i]).length;
  const isWorkoutFinished = exerciseList.length > 0 && completedCount === exerciseList.length;

  return (
    <div className="mobile-app-container client-device">
      <header className="app-header">
        <div className="app-user-greeting">
          <h4>Good morning,</h4>
          <h2>John</h2>
        </div>
        <img src="https://i.pravatar.cc/150?img=33" alt="User Avatar" className="app-avatar" />
      </header>

      <div className="app-content-scroll" style={{paddingTop: '10px'}}>
        {!isSessionActive && clientTab === 'home' && (
          <div className="animation-fade-in">
            <div className="client-day-slider">
              {daysOfWeek.map(day => (
                <div 
                  key={day} 
                  className={`client-day-pill ${clientActiveDay === day ? 'active' : ''} ${workouts[day] ? 'has-workout' : ''}`}
                  onClick={() => setClientActiveDay(day)}
                >
                  <span className="day-name">{day.substring(0,3)}</span>
                  <span className="day-dot"></span>
                </div>
              ))}
            </div>

            <h3 style={{ margin: '15px 0 15px 0', fontSize: '1.2rem', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {clientActiveDay}'s Protocol
              {activeWorkout && <span style={{fontSize: '0.8rem', color: 'var(--gold)', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', padding: '4px 8px', borderRadius: '10px'}}><CheckCircle2 size={12} style={{verticalAlign: 'middle', marginRight: '3px'}}/> Ready</span>}
            </h3>

            {activeWorkout ? (
              <div className="workout-showcase">
                <div className="video-thumbnail-container">
                  <img src={activeWorkout.image || '/images/media__1775286648656.jpg'} alt="Workout Video" className="video-thumbnail" />
                  <div className="video-overlay">
                    <div className="play-button-pulse">
                      <Play size={24} fill="var(--bg-body)" />
                    </div>
                  </div>
                  <div className="video-meta">
                    <span className="focus-tag">{activeWorkout.focus}</span>
                  </div>
                </div>

                <div className="app-card highlight" style={{marginTop: '-20px', borderRadius: '0 0 20px 20px', paddingTop: '35px', position: 'relative', zIndex: 1}}>
                  <h3 className="app-card-title" style={{color: 'var(--text-primary)', fontSize: '1.3rem'}}>{activeWorkout.title}</h3>
                  <div className="exercise-list" style={{marginBottom: '20px'}}>
                    {exerciseList.map((ex, i) => (
                      <div key={i} className="exercise-item">
                        <div className="exercise-circle"><Check size={14}/></div>
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>

                  <button className="start-workout-btn" type="button" onClick={() => setIsSessionActive(true)}>BEGIN SESSION</button>
                </div>
              </div>
            ) : (
              <div className="empty-workout-state">
                <ActivityIcon size={40} color="var(--text-muted)" />
                <p>Rest Day.<br/>No protocol assigned by your trainer.</p>
              </div>
            )}

            <div className="stats-grid" style={{marginTop: '30px'}}>
              <div className="stat-box">
                <Flame size={20} color="var(--gold)" style={{ marginBottom: '10px' }} />
                <div className="stat-val">2,450</div>
                <div className="stat-sub">Weekly Kcal</div>
              </div>
              <div className="stat-box">
                <CheckCircle2 size={20} color="var(--gold)" style={{ marginBottom: '10px' }} />
                <div className="stat-val">3/5</div>
                <div className="stat-sub">Days Completed</div>
              </div>
            </div>
          </div>
        )}

        {!isSessionActive && clientTab === 'diet' && (
          <div className="animation-fade-in">
            <div className="client-day-slider">
              {daysOfWeek.map(day => (
                <div 
                  key={day} 
                  className={`client-day-pill ${clientActiveDay === day ? 'active' : ''} ${diets[day] ? 'has-workout' : ''}`}
                  onClick={() => setClientActiveDay(day)}
                >
                  <span className="day-name">{day.substring(0,3)}</span>
                  <span className="day-dot"></span>
                </div>
              ))}
            </div>

            <h3 style={{ margin: '15px 0 15px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
              {clientActiveDay}'s Nutrition
            </h3>

            {diets[clientActiveDay] ? (
              <div className="app-card highlight">
                <h3 className="app-card-title" style={{color: 'var(--text-primary)', fontSize: '1.3rem'}}><Utensils size={20} style={{verticalAlign: 'middle', marginRight: '5px', color: 'var(--gold)'}}/> Diet Plan</h3>
                <div className="exercise-list" style={{marginBottom: '20px'}}>
                  {diets[clientActiveDay].split('\n').filter(d => d.trim() !== '').map((meal, i) => (
                    <div key={i} className="exercise-item">
                      <div className="exercise-circle" style={{background: 'rgba(201,168,76,0.1)', border: '1px solid var(--gold)'}}><Check size={14} color="var(--gold)"/></div>
                      <span>{meal}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-workout-state">
                <Utensils size={40} color="var(--text-muted)" />
                <p>No diet plan assigned for this day.</p>
              </div>
            )}
          </div>
        )}

        {isSessionActive && (
          /* ACTIVE SESSION VIEW */
          <div className="active-session-view" style={{animation: 'slideUp 0.3s ease-out'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 style={{fontSize: '1.4rem', margin: 0, color: 'var(--gold)'}}>Session Active</h3>
              <button 
                onClick={() => setIsSessionActive(false)} 
                style={{background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', cursor: 'pointer'}}
              >
                <X size={24} />
              </button>
            </div>
            
            <h2 style={{fontSize: '1.8rem', margin: '0 0 5px 0', color: 'var(--text-primary)'}}>{activeWorkout?.title}</h2>
            <p style={{color: 'var(--text-secondary)', fontSize: '1rem', margin: 0}}>{activeWorkout?.focus}</p>

            <div className="app-card" style={{marginTop: '20px', padding: '15px', background: 'var(--bg-card)'}}>
              <h4 style={{margin: '0 0 15px 0', borderBottom: '1px solid var(--bg-border)', paddingBottom: '10px', color: 'var(--text-primary)'}}>Workout Checklist</h4>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                {exerciseList.map((ex, i) => {
                  const isChecked = progressForDay[i];
                  return (
                    <div 
                      key={i} 
                      onClick={() => toggleExercise(i)}
                      style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        background: isChecked ? 'rgba(201,168,76,0.1)' : 'var(--bg-body)',
                        border: isChecked ? '1px solid var(--gold)' : '1px solid var(--bg-border)',
                        color: isChecked ? 'var(--gold)' : 'var(--text-primary)',
                        padding: '15px', 
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        border: isChecked ? 'none' : '2px solid var(--bg-border)',
                        background: isChecked ? 'var(--gold)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '15px',
                        flexShrink: 0
                      }}>
                        {isChecked && <Check size={16} color="var(--bg-body)" />}
                      </div>
                      <span style={{
                        fontSize: '1.05rem', 
                        textDecoration: isChecked ? 'line-through' : 'none',
                        opacity: isChecked ? 0.7 : 1,
                        transition: 'all 0.2s ease'
                      }}>
                        {ex}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{marginTop: '30px', textAlign: 'center'}}>
              <button 
                onClick={() => setIsSessionActive(false)}
                style={{
                  width: '100%', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  background: isWorkoutFinished ? 'var(--gold)' : 'var(--bg-border)', 
                  color: isWorkoutFinished ? 'var(--bg-body)' : 'var(--text-secondary)', 
                  border: 'none', 
                  fontSize: '1.1rem', 
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
              >
                {isWorkoutFinished ? 'FINISH SESSION 🎉' : 'END SESSION EARLY'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      {!isSessionActive && (
        <nav className="app-bottom-nav">
          <button type="button" className={`nav-item ${clientTab === 'home' ? 'active' : ''}`} onClick={() => setClientTab('home')}>
            <Home size={22} />
            <span>Home</span>
          </button>
          
          <button type="button" className={`nav-item ${clientTab === 'diet' ? 'active' : ''}`} onClick={() => setClientTab('diet')}>
            <Utensils size={22} />
            <span>Diet</span>
          </button>

          <button type="button" className={`nav-item ${clientTab === 'profile' ? 'active' : ''}`} onClick={() => setClientTab('profile')}>
            <User size={22} />
            <span>Profile</span>
          </button>
        </nav>
      )}
    </div>
  );
};

// ---------------- MAIN COMPONENT ----------------
const MobileApp = () => {
  const [workouts, setWorkouts] = useState(defaultWorkouts);
  const [diets, setDiets] = useState({ Monday: "Breakfast: 4 Eggs, Oatmeal\nLunch: Chicken breast, rice\nDinner: Steak & Sweet Potato" });
  const [clientActiveDay, setClientActiveDay] = useState('Monday');
  
  const [trainerSelectedDay, setTrainerSelectedDay] = useState('Monday');
  const [editWorkout, setEditWorkout] = useState({...defaultWorkouts['Monday']});
  const [editDiet, setEditDiet] = useState(diets['Monday'] || '');

  const [sessionProgress, setSessionProgress] = useState({});
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [registeredClients, setRegisteredClients] = useState(() => {
    const saved = localStorage.getItem('skyfit-clients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('skyfit-clients', JSON.stringify(registeredClients));
  }, [registeredClients]);

  // Theme State
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('skyfit-theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('skyfit-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('skyfit-theme', 'dark');
    }
  };

  useEffect(() => {
    if (workouts[trainerSelectedDay]) {
      setEditWorkout({...workouts[trainerSelectedDay]});
    } else {
      setEditWorkout({ title: '', focus: '', exercises: '', image: '/images/chest_workout_vid.png' });
    }
    setEditDiet(diets[trainerSelectedDay] || '');
  }, [trainerSelectedDay, workouts, diets]);

  const handlePushWorkout = (e) => {
    e.preventDefault();
    setWorkouts({
      ...workouts,
      [trainerSelectedDay]: { ...editWorkout }
    });
  };

  const handlePushDiet = (e) => {
    e.preventDefault();
    setDiets({
      ...diets,
      [trainerSelectedDay]: editDiet
    });
  };

  const handleEditChange = (field, value) => {
    setEditWorkout(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="dual-app-wrapper">
      <div className="dual-app-header">
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '10px'}}>
          <h1>Live Sync Prototype</h1>
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            style={{ position: 'relative', top: '-5px' }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <p>Experience the real-time connection between HQ, Trainer, and Client ecosystems.</p>
      </div>
      
      <div className="devices-container">
        <div className="device-column">
          <div className="device-label">HQ Console</div>
          <MasterPanel 
            workouts={workouts}
            sessionProgress={sessionProgress}
            isSessionActive={isSessionActive}
            registeredClients={registeredClients}
          />
        </div>

        <div className="sync-indicator">
          <div className="sync-line"></div>
          <Zap size={24} color="var(--gold)" className="sync-icon" style={{transition: 'color 0.3s'}} />
          <div className="sync-line"></div>
        </div>

        <div className="device-column">
          <div className="device-label">Trainer Device</div>
          <TrainerPanel 
            trainerSelectedDay={trainerSelectedDay} 
            setTrainerSelectedDay={setTrainerSelectedDay}
            editWorkout={editWorkout}
            handleEditChange={handleEditChange}
            handlePushWorkout={handlePushWorkout}
            workouts={workouts}
            sessionProgress={sessionProgress}
            editDiet={editDiet}
            setEditDiet={setEditDiet}
            handlePushDiet={handlePushDiet}
          />
        </div>
        
        <div className="sync-indicator">
          <div className="sync-line"></div>
          <Zap size={24} color={isSessionActive ? '#10B981' : 'var(--gold)'} className="sync-icon" style={{transition: 'color 0.3s'}} />
          <div className="sync-line"></div>
        </div>

        <div className="device-column">
          <div className="device-label">Client Device</div>
          <ClientPanel 
            clientActiveDay={clientActiveDay}
            setClientActiveDay={setClientActiveDay}
            workouts={workouts}
            diets={diets}
            sessionProgress={sessionProgress}
            setSessionProgress={setSessionProgress}
            isSessionActive={isSessionActive}
            setIsSessionActive={setIsSessionActive}
            onRegister={async (data) => {
              setRegisteredClients(prev => [...prev, data]);
              
              try {
                const { error } = await supabase.from('clients').insert([{
                  name: data.personal?.name || 'Unknown',
                  mobile: data.personal?.mobile || '',
                  gender: data.personal?.gender || 'Unknown',
                  email: data.personal?.email || '',
                  full_data: data
                }]);
                if (error) console.error("Supabase Error:", error);
              } catch (err) {
                console.error("Failed to insert to Supabase:", err);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileApp;
