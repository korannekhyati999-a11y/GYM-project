import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity, Users, Settings, ArrowRight, ChevronRight, Play } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
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

const MarketingPage = () => {
  const heroRef = useRef(null);
  const equipRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    // Hero Animations
    const ctx = gsap.context(() => {
      gsap.from('.hero-title-line', {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power4.out',
        delay: 0.2
      });

      gsap.from('.hero-action', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.8
      });

      // Equipment Scroll Trigger
      gsap.from('.equip-card', {
        scrollTrigger: {
          trigger: '.equip-grid',
          start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });

      // Chart Scroll Trigger
      gsap.from('.chart-container', {
        scrollTrigger: {
          trigger: '.chart-container',
          start: 'top 85%',
        },
        scale: 0.95,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    }, [heroRef, equipRef, chartRef]);

    return () => ctx.revert();
  }, []);

  return (
    <div className="marketing-wrapper">
      {/* Navigation */}
      <nav className="navbar scrolled">
        <div className="container nav-container">
          <div className="logo text-accent">SUMMIT</div>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#equipment">Equipment</a>
            <a href="#trainers">Trainers</a>
            <Link to="/client" className="text-gradient">Member Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
          alt="Gym Background" 
          className="hero-bg-video"
        />
        <div className="container relative">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="hero-title-line">Redefine</span>
              <span className="hero-title-line text-gradient">Your Limits.</span>
            </h1>
            <p className="hero-subtitle hero-action">
              Experience the pinnacle of fitness with elite equipment, immersive environments, and world-class trainers.
            </p>
            <div className="flex gap-4 hero-action">
              <a href="#register" className="btn btn-primary">
                Join Now <ArrowRight size={18} />
              </a>
              <a href="#tour" className="btn btn-outline">
                <Play size={18} /> Watch Video
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Showcase */}
      <section id="equipment" className="section" ref={equipRef}>
        <div className="container">
          <h2 className="section-title">Elite <span className="text-accent">Arsenal</span></h2>
          <div className="equip-grid">
            <div className="equip-card">
              <img src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=800" className="equip-card-img" alt="Cardio" />
              <div className="equip-card-content">
                <h3>Cardio Matrix</h3>
                <p className="text-secondary mt-2">Next-gen treadmills and ellipticals with immersive displays.</p>
              </div>
            </div>
            <div className="equip-card">
              <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800" className="equip-card-img" alt="Weights" />
              <div className="equip-card-content">
                <h3>Free Weights Area</h3>
                <p className="text-secondary mt-2">Premium urethane dumbbells and competitive lifting platforms.</p>
              </div>
            </div>
            <div className="equip-card">
              <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800" className="equip-card-img" alt="Machines" />
              <div className="equip-card-content">
                <h3>Selectorized Machines</h3>
                <p className="text-secondary mt-2">Biomechanically precise isolation tracking machines.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Crowd Analysis */}
      <section className="section" style={{ background: 'var(--bg-light)' }}>
        <div className="container" ref={chartRef}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
            <div>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>Smart <span className="text-accent">Timings</span></h2>
              <p className="text-secondary" style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
                Plan your workout perfectly. Our live-feel traffic analysis helps you avoid the rush or find your community.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255, 46, 46, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><Activity size={20} /></div>
                  <div>
                    <h4 style={{ margin: 0 }}>Peak Hours</h4>
                    <span className="text-secondary" style={{ fontSize: '0.9rem' }}>5:00 PM - 8:00 PM</span>
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} /></div>
                  <div>
                    <h4 style={{ margin: 0 }}>Quiet Hours</h4>
                    <span className="text-secondary" style={{ fontSize: '0.9rem' }}>11:00 AM - 3:00 PM</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="glass-panel chart-container" style={{ padding: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }}
                    itemStyle={{ color: '#FF2E2E' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Registration */}
      <section id="register" className="section">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="glass-panel" style={{ padding: '50px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px' }} className="text-gradient">Start Your Journey</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '30px' }}>Join the elite. Sign up for a 7-day trial pass.</p>
            <form>
              <div className="form-group">
                <input type="text" className="form-control" placeholder="Full Name" />
              </div>
              <div className="form-group">
                <input type="email" className="form-control" placeholder="Email Address" />
              </div>
              <div className="form-group">
                <input type="tel" className="form-control" placeholder="Phone Number" />
              </div>
              <button type="button" className="btn btn-primary" style={{ width: '100%' }}>Claim Free Trial <ChevronRight size={18} /></button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketingPage;
