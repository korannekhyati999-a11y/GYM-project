import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity, Users, ArrowRight, ChevronRight, Play, Dumbbell, Flame, HeartPulse, Timer, Target, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import '../Marketing.css';

gsap.registerPlugin(ScrollTrigger);

const trafficData = [
  { time: '6 AM', count: 20 },
  { time: '9 AM', count: 45 },
  { time: '12 PM', count: 30 },
  { time: '3 PM', count: 25 },
  { time: '6 PM', count: 85 },
  { time: '9 PM', count: 40 },
];

const pricingTiers = [
  { id: 1, name: 'Foundation', price: '$49/mo' },
  { id: 2, name: 'Performance', price: '$89/mo' },
  { id: 3, name: 'Iron Elite', price: '$129/mo' },
  { id: 4, name: 'Apex Predator', price: '$199/mo' },
];

const muscleData = [
  { id: 'chest', name: 'Chest / Push', desc: 'Precision Benches, Incline Racks, Isolation Flys', img: '/images/media__1775286648989.jpg' },
  { id: 'back', name: 'Back / Pull', desc: 'Heavy Rows, Lat Pulldowns, Deadlift Platforms', img: '/images/media__1775286649010.jpg' },
  { id: 'legs', name: 'Legs / Core', desc: 'Elite Squat Racks, Leg Presses, Glute Drives', img: '/images/media__1775286648896.jpg' },
  { id: 'cardio', name: 'Cardio Matrix', desc: 'Speed Treadmills, Climbmills, Air Bikes', img: '/images/media__1775286648656.jpg' }
];

const MarketingPage = () => {
  const heroRef = useRef(null);
  const equipRef = useRef(null);
  const chartRef = useRef(null);
  
  const [selectedTier, setSelectedTier] = useState(1);
  const [activeMuscle, setActiveMuscle] = useState(0);

  useEffect(() => {
    let isScrolling;
    const handleScroll = () => {
      const nav = document.querySelector('.navbar');
      if (nav) {
        if (window.scrollY > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
      }

      const runner = document.querySelector('.treadmill-runner');
      const belt = document.querySelector('.treadmill-belt-inner');
      if (runner && belt) {
         runner.style.animationPlayState = 'running';
         belt.style.animationPlayState = 'running';
      }
      
      clearTimeout(isScrolling);
      isScrolling = setTimeout(() => {
         if (runner && belt) {
           runner.style.animationPlayState = 'paused';
           belt.style.animationPlayState = 'paused';
         }
      }, 150);
    };
    window.addEventListener('scroll', handleScroll);

    // Chalk Dust Particle Effect for Bento Grids
    const handleChalkDust = (e) => {
      if (Math.random() > 0.85) {
        const particle = document.createElement('div');
        particle.className = 'chalk-particle';
        particle.style.left = `${e.clientX}px`;
        particle.style.top = `${e.clientY + window.scrollY}px`;
        particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 60}px`);
        particle.style.setProperty('--ty', `${-Math.random() * 80 - 20}px`);
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
      }
    };

    window.addEventListener('mousemove', handleChalkDust);

    const ctx = gsap.context(() => {
      gsap.from('.hero-title-line', { y: 120, opacity: 0, duration: 1.5, stagger: 0.15, ease: 'power4.out', delay: 0.2 });
      gsap.from('.hero-subtitle', { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.8 });
      gsap.from('.hero-action', { y: 30, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 1.1 });

      gsap.from('.iron-stat-block', {
        scrollTrigger: { trigger: '.iron-stats-section', start: 'top 85%' },
        y: 50, opacity: 0, duration: 1, stagger: 0.15, ease: 'back.out(1.7)'
      });

      gsap.from('.bento-item', {
        scrollTrigger: { trigger: '.bento-grid', start: 'top 80%' },
        y: 80, opacity: 0, rotationX: 10, duration: 1.2, stagger: 0.15, ease: 'power3.out'
      });
    }, [heroRef, equipRef, chartRef]);

    // 3D Tilt Effect
    const handleMouseMove = (e) => {
      const items = document.querySelectorAll('.bento-item');
      items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        gsap.to(item, { rotationX: rotateX, rotationY: rotateY, transformPerspective: 1500, ease: 'power2.out', duration: 0.5 });
      });
    };
    const handleMouseLeave = () => {
      const items = document.querySelectorAll('.bento-item');
      items.forEach(item => {
        gsap.to(item, { rotationX: 0, rotationY: 0, ease: 'power2.out', duration: 0.8 });
      });
    };

    const grid = document.querySelector('.bento-grid');
    if(grid){
      grid.addEventListener('mousemove', handleMouseMove);
      grid.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      ctx.revert();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleChalkDust);
      if(grid){
        grid.removeEventListener('mousemove', handleMouseMove);
        grid.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div className="marketing-wrapper">
      <div className="noise-overlay"></div>
      <div className="aurora-container">
        <div className="aurora-blob blob-1"></div>
        <div className="aurora-blob blob-2"></div>
        <div className="aurora-blob blob-3"></div>
      </div>

      <div className="treadmill-container">
        <div className="treadmill-runner">🏃‍♂️</div>
        <div className="treadmill-belt">
          <div className="treadmill-belt-inner"></div>
        </div>
      </div>

      <Dumbbell className="floating-gym-icon dumbbell-left" size={180} strokeWidth={1} />
      <Flame className="floating-gym-icon flame-right" size={200} strokeWidth={1} />
      
      <div className="bg-watermark left">LIFT</div>
      <div className="bg-watermark right">GRIND</div>

      <nav className="navbar">
        <div className="container nav-container">
          <div className="logo"><span className="text-accent">SKY</span>FIT</div>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#equipment">Equipment</a>
            <a href="#trainers">Join</a>
            <Link to="/client" className="text-gradient">Member Login</Link>
          </div>
        </div>
      </nav>

      <section className="hero-section" ref={heroRef}>
        <div className="hero-overlay"></div>
        <img src="/images/media__1775286648656.jpg" alt="Gym Background" className="hero-bg-video"/>
        <div className="container relative">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="hero-title-line">Redefine</span>
              <span className="hero-title-line text-gradient-primary">Your Limits.</span>
            </h1>
            <p className="hero-subtitle">
              Experience the pinnacle of fitness with elite iron, immersive environments, and world-class trainers dedicated to your absolute evolution.
            </p>
            <div className="flex gap-6">
              <a href="#register" className="btn btn-primary hero-action">Join Now <ArrowRight size={18} /></a>
              <a href="#tour" className="btn btn-outline hero-action"><Play size={18} /> Watch Video</a>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee-container">
        <div className="marquee-content">
          <span>STRENGTH • ENDURANCE • DISCIPLINE • POWER • FOCUS • AGILITY • HUSTLE • COMMITMENT •</span>
          <span>STRENGTH • ENDURANCE • DISCIPLINE • POWER • FOCUS • AGILITY • HUSTLE • COMMITMENT •</span>
        </div>
      </div>

      <section className="iron-stats-section">
        <div className="container">
          <div className="iron-stats-grid">
            <div className="iron-stat-block">
              <div className="iron-stat-number">120K</div>
              <div className="iron-stat-label">Lbs Lifted Daily</div>
            </div>
            <div className="iron-stat-block">
              <div className="iron-stat-number">50+</div>
              <div className="iron-stat-label">Elite Racks</div>
            </div>
            <div className="iron-stat-block">
              <div className="iron-stat-number">24/7</div>
              <div className="iron-stat-label">Absolute Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW KNURLED DIVIDER */}
      <hr className="knurled-bar" />

      <section id="equipment" className="section" ref={equipRef}>
        <div className="container">
          <h2 className="section-title">Elite <span className="text-accent">Arsenal</span></h2>
          <p className="text-secondary" style={{ marginBottom: '40px', maxWidth: '600px' }}>
            Hover over our equipment zones. Feel the grip. (Look close—you might just kick up some chalk).
          </p>
          <div className="bento-grid">
            <div className="bento-item glowing-border bento-item-large">
              <div className="bento-inner">
                <img src="/images/media__1775286648896.jpg" className="bento-bg" alt="Cardio" />
                <div className="bento-overlay">
                  <h3 className="bento-title">Cardio Matrix</h3>
                  <p className="bento-desc">Next-gen treadmills and ellipticals with immersive metric displays and auto-adjusting resistance.</p>
                </div>
              </div>
            </div>
            
            <div className="bento-item glowing-border bento-item-tall">
              <div className="bento-inner">
                <img src="/images/media__1775286648989.jpg" className="bento-bg" alt="Free Weights" />
                <div className="bento-overlay">
                  <h3 className="bento-title">Iron Zone</h3>
                  <p className="bento-desc">Premium urethane dumbbells, kettlebells, and precision lifting combo platforms.</p>
                </div>
              </div>
            </div>
            
            <div className="bento-item glowing-border">
              <div className="bento-inner">
                <img src="/images/media__1775286649010.jpg" className="bento-bg" alt="Machines" />
                <div className="bento-overlay">
                  <h3 className="bento-title">Machines</h3>
                  <p className="bento-desc">Biomechanically flawless isolation tracking for exact targeting.</p>
                </div>
              </div>
            </div>
            
            <div className="bento-item glowing-border bento-item-wide">
              <div className="bento-inner">
                <img src="/images/media__1775286648656.jpg" className="bento-bg" alt="Recovery" />
                <div className="bento-overlay">
                  <h3 className="bento-title">Recovery Lounge</h3>
                  <p className="bento-desc">Optimize your healing with hydrotherapy and advanced massage tools. Peak performance requires peak recovery.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW MUSCLE MAP SECTION */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Anatomy of <span className="text-accent">Elite Training</span></h2>
          <div className="muscle-map-container">
            <div className="muscle-nodes">
              {muscleData.map((muscle, idx) => (
                <div 
                  key={muscle.id} 
                  className={`muscle-node ${activeMuscle === idx ? 'active' : ''}`}
                  onMouseEnter={() => setActiveMuscle(idx)}
                >
                  <Target size={24} color={activeMuscle === idx ? "#FF2020" : "#555"} />
                  <div>
                    <h4>{muscle.name}</h4>
                    <p>{muscle.desc.substring(0, 30)}...</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="muscle-display">
              <img 
                src={muscleData[activeMuscle].img} 
                className="muscle-display-image" 
                key={muscleData[activeMuscle].img}
                alt={muscleData[activeMuscle].name} 
              />
              <div className="muscle-display-overlay">
                <h3>{muscleData[activeMuscle].name}</h3>
                <p><Zap size={16} style={{display:'inline', marginRight:'5px'}}/> {muscleData[activeMuscle].desc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="knurled-bar" />

      {/* Live Crowd Analysis */}
      <section className="section" style={{ position: 'relative', zIndex: 3 }}>
        <div className="container" ref={chartRef}>
          <div className="chart-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem', fontSize: '3.5rem' }}>Smart <span className="text-accent">Timings</span></h2>
              <p className="text-secondary" style={{ marginBottom: '3rem', fontSize: '1.15rem', maxWidth: '85%' }}>
                Don't guess when to train. Our live-feel traffic analysis helps you perfectly time your flow—avoid the rush or dive into the core iron club hours.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '80%' }}>
                <div className="insight-card">
                  <div className="insight-icon primary"><Dumbbell size={26} /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>Peak Iron Hours</h4>
                    <span className="text-secondary" style={{ fontSize: '1rem' }}>5:00 PM - 8:00 PM</span>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon secondary"><Timer size={26} /></div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>Deep Focus Hours</h4>
                    <span className="text-secondary" style={{ fontSize: '1rem' }}>11:00 AM - 3:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="glowing-border always-on" style={{ height: '500px', width: '100%', borderRadius: 'var(--border-radius)' }}>
              <div className="glass-panel chart-container" style={{ height: '100%', border: 'none' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#71717A" tick={{ fill: '#A1A1AA', fontSize: 13 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="#71717A" tick={{ fill: '#A1A1AA', fontSize: 13 }} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(5, 5, 5, 0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#FF2020', fontWeight: '800', fontSize: '1.1rem' }}
                      cursor={{ stroke: 'rgba(255, 32, 32, 0.3)', strokeWidth: 2, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={5} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW WEIGHT STACK PRICING */}
      <section className="section" style={{ background: '#080808' }}>
        <div className="container">
          <h2 className="section-title text-center">Select Your <span className="text-accent">Load</span></h2>
          <p className="text-secondary text-center" style={{ marginBottom: '40px' }}>Slide the pin to set your membership tier.</p>
          <div className="weight-stack-container">
            <div className="weight-stack glowing-border always-on">
              {pricingTiers.map((tier, idx) => {
                // If you click a weight, you get that weight and all lighter weights above it.
                // In a cable stack, clicking the bottom lifts everything above it.
                const isActive = idx <= selectedTier;
                return (
                  <div 
                    key={tier.id} 
                    className={`weight-plate ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedTier(idx)}
                  >
                    <span className="plate-title">{tier.name}</span>
                    <span className="plate-price">{tier.price}</span>
                  </div>
                );
              })}
              {/* Stack pin calculates vertical position based on selected index. Each plate is 80px high + 4px gap */}
              <div 
                className="stack-pin" 
                style={{ top: `${(selectedTier * 84) + 40 + 10}px` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      <hr className="knurled-bar" />

      {/* Registration */}
      <section id="register" className="section" style={{ paddingBottom: '160px' }}>
        <div className="container" style={{ maxWidth: '650px' }}>
          <div className="glowing-border always-on">
            <form className="premium-form">
              <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'radial-gradient(ellipse at top, rgba(255,32,32,0.15) 0%, transparent 60%)', pointerEvents: 'none' }}></div>
              <h2 style={{ textAlign: 'center', marginBottom: '15px', fontSize: '3rem' }} className="text-gradient">Begin Ascension</h2>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '50px', fontSize: '1.15rem' }}>The elite don't wait. Claim your ultra-premium 7-day access.</p>
              
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Full Legal Name" />
              </div>
              <div className="form-group">
                <input type="email" className="form-control" placeholder="Secure Email Address" />
              </div>
              <div className="form-group">
                <input type="tel" className="form-control" placeholder="Primary Contact Number" />
              </div>
              
              <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', padding: '20px' }}>
                Commit Now <ChevronRight size={20} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketingPage;
