import React, { useEffect, useState, useRef } from 'react';
import {
  Dumbbell, Activity, Users, ArrowRight, Play,
  MapPin, Phone, Zap, Target, Timer, ChevronRight,
  HeartPulse, Star, Award, Share2, Globe, Sun, Moon
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import '../Marketing.css';

const trafficData = [
  { time: '6 AM', count: 22 },
  { time: '9 AM', count: 48 },
  { time: '12 PM', count: 32 },
  { time: '3 PM', count: 28 },
  { time: '6 PM', count: 90 },
  { time: '9 PM', count: 38 },
];

const programs = [
  {
    tag: 'Strength',
    title: 'Iron Zone',
    desc: 'Power racks, barbells and elite free weight zones engineered for maximum output.',
    img: '/images/media__1775286648896.jpg',
    num: '01',
  },
  {
    tag: 'Cardio',
    title: 'Cardio Matrix',
    desc: 'Speed treadmills, climbmills, air bikes and smart ellipticals for peak endurance.',
    img: '/images/media__1775286648989.jpg',
    num: '02',
  },
  {
    tag: 'Flexibility',
    title: 'Yoga & Core',
    desc: 'Dedicated studio for Yoga, Zumba, and deep mobility recovery sessions.',
    img: '/images/media__1775286649087.jpg',
    num: '03',
  },
];

const MarketingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('skyfit-theme');
    return saved ? saved === 'dark' : true; // default dark
  });

  // Apply theme to document and persist
  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', isDark ? '' : 'light');
    localStorage.setItem('skyfit-theme', theme);
  }, [isDark]);

  // Restore on mount
  useEffect(() => {
    const saved = localStorage.getItem('skyfit-theme');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <div className="marketing-wrapper">

      {/* ── NAVBAR ── */}
      <nav className={`golds-navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container nav-container">
          <div className="golds-logo">
            <span className="logo-gold">SKY</span>FIT
          </div>
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#programs">Programs</a>
            <a href="#equipment">Equipment</a>
            <a href="#trainers">Trainers</a>
            <a href="#nutrition">Nutrition</a>
            <a href="#location">Locations</a>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <a href="/admin" className="nav-join-btn" style={{background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)'}}>Admin Portal</a>
            <a href="#join" className="nav-join-btn">Join Now</a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div
          className="hero-bg"
          style={{ backgroundImage: "url('/images/gym_hero_bg.png')" }}
        />
        <div className="hero-bg-overlay" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Star size={14} fill="currentColor" />
              Est. 2022 · Ujjain's Premier Gym
            </div>
            <h1 className="hero-title">
              Rise.<br />
              <span className="line-gold">Train.</span><br />
              Conquer.
            </h1>
            <p className="hero-subtitle">
              Ujjain's most elite fitness experience. Expert coaching, pro-grade equipment, and a community built to push you beyond your limits — every single day.
            </p>
            <div className="hero-actions">
              <a href="#join" className="btn btn-gold">
                Join Now <ArrowRight size={18} />
              </a>
              <a href="#programs" className="btn btn-outline-gold">
                <Play size={18} /> Explore Programs
              </a>
            </div>
          </div>
        </div>
        <div className="hero-scroll-line">
          <span>Scroll</span>
          <div className="scroll-dot" />
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-bar">
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <span key={i}>
              STRENGTH <span className="marquee-dot">•</span>{' '}
              ENDURANCE <span className="marquee-dot">•</span>{' '}
              DISCIPLINE <span className="marquee-dot">•</span>{' '}
              POWER <span className="marquee-dot">•</span>{' '}
              FOCUS <span className="marquee-dot">•</span>{' '}
              LEGACY <span className="marquee-dot">•</span>{' '}
              HUSTLE <span className="marquee-dot">•</span>{' '}
              COMMITMENT <span className="marquee-dot">•</span>{' '}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {[
              { num: '5K+', label: 'Active Members' },
              { num: '50+', label: 'Elite Equipment' },
              { num: '24/7', label: 'Open Access' },
              { num: '15+', label: 'Expert Trainers' },
            ].map((s, i) => (
              <div className="stat-item" key={i}>
                <span className="stat-number">{s.num}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="gold-divider" />

      {/* ── ABOUT ── */}
      <section id="about" className="section about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-img-stack">
              <img src="/images/media__1775286648656.jpg" alt="SkyFit Gym" className="about-main-img" />
              <div className="about-accent-box">
                <span className="num">3+</span>
                <span className="lbl">Years of Excellence</span>
              </div>
            </div>
            <div>
              <span className="section-eyebrow">Our Story</span>
              <div className="gold-line" />
              <h2 className="section-title">Forged Since <span className="text-gold">2022</span></h2>
              <p className="section-subtitle">
                SkyFit was built to be more than a gym — it's a culture. From elite strength training to expert nutrition counseling, we engineer programs around your biology to forge the ultimate version of yourself.
              </p>
              <div className="about-info-list">
                <div className="about-info-item">
                  <div className="about-info-icon"><Activity size={22} /></div>
                  <div>
                    <h4>Programs</h4>
                    <p>Zumba, CrossFit, Yoga, Weight Training, Weight Management</p>
                  </div>
                </div>
                <div className="about-info-item">
                  <div className="about-info-icon"><MapPin size={22} /></div>
                  <div>
                    <h4>Rishi Nagar — Main Branch</h4>
                    <p>2nd Floor, Shivansh, near Rishi Nagar petrol pump, Dewas Road, Ujjain</p>
                  </div>
                </div>
                <div className="about-info-item">
                  <div className="about-info-icon"><MapPin size={22} /></div>
                  <div>
                    <h4>Nai Sadak Branch</h4>
                    <p>Siti Skyfit, Nai Sadak, Ujjain</p>
                  </div>
                </div>
                <div className="about-info-item">
                  <div className="about-info-icon"><Phone size={22} /></div>
                  <div>
                    <h4>Contact</h4>
                    <p>+91 62620 99920 &nbsp;|&nbsp; +91 62620 87800</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="gold-divider" />

      {/* ── PROGRAMS ── */}
      <section id="programs" className="section programs-section">
        <div className="container">
          <span className="section-eyebrow text-center" style={{ display: 'block', textAlign: 'center' }}>What We Offer</span>
          <div className="gold-line centered" />
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '16px' }}>
            Elite <span className="text-gold">Programs</span>
          </h2>
          <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 56px' }}>
            Every discipline. Every goal. Under one roof designed for champions.
          </p>
          <div className="programs-grid">
            {programs.map((p, i) => (
              <div className="program-card" key={i}>
                <img src={p.img} alt={p.title} />
                <div className="program-overlay">
                  <div className="program-number">{p.num}</div>
                  <span className="program-tag">{p.tag}</span>
                  <h3 className="program-title">{p.title}</h3>
                  <p className="program-desc">{p.desc}</p>
                  <span className="program-link">
                    Learn More <ChevronRight size={16} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="gold-divider" />

      {/* ── EQUIPMENT BENTO ── */}
      <section id="equipment" className="section equipment-section">
        <div className="container">
          <span className="section-eyebrow">Our Facility</span>
          <div className="gold-line" />
          <h2 className="section-title">Elite <span className="text-gold">Arsenal</span></h2>
          <p className="section-subtitle">
            Hover over our zones. Premium urethane dumbbells, biomechanical machines, and next-gen cardio waiting for you.
          </p>
          <div className="bento-grid">
            <div className="bento-item bento-span-2 bento-row-2">
              <img src="/images/media__1775286648896.jpg" alt="Cardio" />
              <div className="bento-gold-tag">Featured</div>
              <div className="bento-overlay">
                <div className="bento-label">Cardio Matrix</div>
                <div className="bento-sub">Speed treadmills, climbmills, air bikes with immersive metric displays</div>
              </div>
            </div>
            <div className="bento-item">
              <img src="/images/media__1775286648989.jpg" alt="Iron Zone" />
              <div className="bento-overlay">
                <div className="bento-label">Iron Zone</div>
                <div className="bento-sub">Premium urethane dumbbells & platforms</div>
              </div>
            </div>
            <div className="bento-item">
              <img src="/images/media__1775286649010.jpg" alt="Machines" />
              <div className="bento-overlay">
                <div className="bento-label">Machines</div>
                <div className="bento-sub">Biomechanically precise isolation</div>
              </div>
            </div>
            <div className="bento-item bento-span-2">
              <img src="/images/media__1775286648656.jpg" alt="Recovery" />
              <div className="bento-overlay">
                <div className="bento-label">Recovery Lounge</div>
                <div className="bento-sub">Peak performance requires peak recovery — hydrotherapy & massage tools</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="gold-divider" />

      {/* ── TEAM PHOTO BANNER ── */}
      <section className="team-photo-section">
        <img src="/images/team.jpg" alt="SkyFit Coaching Team" />
        <div className="team-photo-overlay">
          <div className="team-photo-text">
            <span className="section-eyebrow">The Professionals</span>
            <div className="gold-line" />
            <h2>World-Class <span className="text-gold">Coaching</span></h2>
            <p>
              Our trainers don't just guide — they transform. From form corrections to custom programming, every session is engineered for your success.
            </p>
            <a href="#trainers" className="btn btn-gold">Meet the Team <ArrowRight size={18} /></a>
          </div>
        </div>
      </section>

      {/* ── TRAINERS ── */}
      <section id="trainers" className="section trainers-section">
        <div className="container">
          <span className="section-eyebrow" style={{ display: 'block', textAlign: 'center' }}>Coaching Staff</span>
          <div className="gold-line centered" />
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '56px' }}>
            Elite <span className="text-gold">Trainers</span>
          </h2>
          <div className="trainers-grid">
            <div className="trainer-card">
              <div className="trainer-img-wrap">
                <img src="/images/general_trainer.png" alt="Floor Coaches" />
                <span className="trainer-badge">Group Coaching</span>
              </div>
              <div className="trainer-body">
                <h3 className="trainer-name">Floor Command</h3>
                <p className="trainer-role">Group & General Coaching</p>
                <p className="trainer-bio">
                  Our general trainers dominate the floor, offering form corrections, high-energy group sessions, and unyielding motivation perfect for a communal, intense environment.
                </p>
                <ul className="trainer-features">
                  <li><Target size={15} /> Accessible 24/7 on the floor</li>
                  <li><Users size={15} /> Group conditioning classes</li>
                  <li><Zap size={15} /> Form checks & spotting</li>
                </ul>
              </div>
            </div>
            <div className="trainer-card">
              <div className="trainer-img-wrap">
                <img src="/images/personal_trainer.png" alt="Personal Trainer" />
                <span className="trainer-badge">Personal Training</span>
              </div>
              <div className="trainer-body">
                <h3 className="trainer-name">Elite 1-on-1</h3>
                <p className="trainer-role">Dedicated Personal Training</p>
                <p className="trainer-bio">
                  Access bespoke training programs engineered specifically for your biology and goals. Your trainer tracks macros, forces progression, and ensures zero wasted effort.
                </p>
                <ul className="trainer-features">
                  <li><Target size={15} /> Custom tactical programming</li>
                  <li><HeartPulse size={15} /> Advanced biometric tracking</li>
                  <li><Award size={15} /> Absolute accountability</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="gold-divider" />

      {/* ── NUTRITION ── */}
      <section id="nutrition" className="section nutrition-section">
        <div className="container">
          <div className="nutrition-grid">
            <div className="nutrition-img-wrap">
              <img src="/images/nut.png" alt="Nutrition" />
              <div className="nutrition-tag">Elite Nutrition</div>
            </div>
            <div>
              <span className="section-eyebrow">Fuel Your Performance</span>
              <div className="gold-line" />
              <h2 className="section-title">Apex <span className="text-gold">Diet</span> Matrix</h2>
              <p className="section-subtitle">
                Training without optimal fuel is wasted effort. Our elite in-house sports dietician analyzes your biometrics and lifestyle to forge a nutrition protocol that guarantees relentless progression.
              </p>
              <div className="diet-cards">
                {[
                  { title: 'Pre-Workout', desc: 'Fast-acting carbs, complete aminos, vaso-dilators.' },
                  { title: 'Intra-Workout', desc: 'Electrolytes, BCAAs, cyclic dextrin to sustain ATP.' },
                  { title: 'Post-Workout', desc: 'Whey isolate, leucine spike, rapid glycogen replenishment.' },
                  { title: 'Recovery Phase', desc: 'Casein, slow-digesting complex carbs, omega-3s.' },
                ].map((d, i) => (
                  <div className="diet-card" key={i}>
                    <h5>{d.title}</h5>
                    <p>{d.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="gold-divider" />

      {/* ── SMART TIMINGS ── */}
      <section className="section timing-section">
        <div className="container">
          <div className="timing-grid">
            <div>
              <span className="section-eyebrow">Train Smarter</span>
              <div className="gold-line" />
              <h2 className="section-title">Smart <span className="text-gold">Timings</span></h2>
              <p className="section-subtitle">
                Don't guess when to train. Our crowd insights help you time your sessions perfectly — avoid the rush or dive in during core iron hours.
              </p>
              <div className="insight-card">
                <div className="insight-icon"><Dumbbell size={24} /></div>
                <div>
                  <h4>Peak Iron Hours</h4>
                  <span>5:00 PM – 8:00 PM</span>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon"><Timer size={24} /></div>
                <div>
                  <h4>Deep Focus Hours</h4>
                  <span>11:00 AM – 3:00 PM</span>
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-icon"><Activity size={24} /></div>
                <div>
                  <h4>Morning Session</h4>
                  <span>6:00 AM – 8:00 AM</span>
                </div>
              </div>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#444" tick={{ fill: '#888', fontSize: 13 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#444" tick={{ fill: '#888', fontSize: 13 }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#161616', border: '1px solid #252525', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#C9A84C', fontWeight: '700' }}
                    cursor={{ stroke: 'rgba(201,168,76,0.3)', strokeWidth: 2 }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#C9A84C" strokeWidth={3} fillOpacity={1} fill="url(#goldGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <div className="gold-divider" />

      {/* ── APP PROMO ── */}
      <section id="app" className="section app-section">
        <div className="container">
          <div className="app-promo-card">
            <div className="app-promo-left">
              <span className="section-eyebrow">Go Mobile</span>
              <div className="gold-line" />
              <h2 className="section-title">Carry the <span className="text-gold">Iron</span> With You</h2>
              <p className="section-subtitle" style={{ marginBottom: '8px' }}>
                Total domination in your pocket. Live tracking, 3D bio-sync, macro logging, and direct trainer chats.
              </p>
              <ul className="app-features-list">
                <li className="app-feature-item"><Activity size={18} /> Live gym crowd tracker</li>
                <li className="app-feature-item"><Zap size={18} /> Real-time bio-sync dashboard</li>
                <li className="app-feature-item"><Dumbbell size={18} /> Custom workout programs</li>
                <li className="app-feature-item"><Users size={18} /> 1-on-1 trainer messaging</li>
              </ul>
              <div className="app-store-btns">
                <button className="btn btn-gold" style={{ gap: '10px' }}>
                  <svg viewBox="0 0 384 512" width="18" height="18" fill="currentColor">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                  </svg>
                  App Store
                </button>
                <button className="btn btn-outline-gold" style={{ gap: '10px' }}>
                  <Play size={18} /> Google Play
                </button>
              </div>
            </div>
            <div className="app-promo-right">
              <img src="/images/mobile_app_mockup.png" alt="SkyFit App" className="app-mockup" />
            </div>
          </div>
        </div>
      </section>

      <div className="gold-divider" />

      {/* ── LOCATION ── */}
      <section id="location" className="section map-section">
        <div className="container">
          <span className="section-eyebrow" style={{ display: 'block', textAlign: 'center' }}>Find Us</span>
          <div className="gold-line centered" />
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '56px' }}>
            Our <span className="text-gold">Locations</span>
          </h2>
          <div className="map-grid">
            <div className="map-iframe-wrap">
              <iframe
                width="100%" height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) grayscale(60%) brightness(0.8)' }}
                src="https://maps.google.com/maps?q=Skyfit%20Gym,%20Ujjain&t=&z=14&ie=UTF8&iwloc=&output=embed"
                title="SkyFit Location"
                frameBorder="0" scrolling="no"
              />
            </div>
            <div className="location-cards">
              {[
                {
                  branch: 'Rishi Nagar — Main Branch',
                  addr: '2nd Floor, Shivansh, near Rishi Nagar petrol pump, Dewas Road, Ujjain - 456010',
                  hours: 'Open Daily · until 10 PM',
                },
                {
                  branch: 'Nai Sadak Branch',
                  addr: 'Siti Skyfit, Nai Sadak, Ujjain',
                  hours: 'Open Daily · until 10 PM',
                },
                {
                  branch: 'Direct Contact',
                  addr: '+91 62620 99920   |   +91 62620 87800',
                  hours: null,
                },
              ].map((loc, i) => (
                <div className="location-card" key={i}>
                  <h4>{loc.branch}</h4>
                  <p>{loc.addr}</p>
                  {loc.hours && <p className="hours">{loc.hours}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── JOIN CTA ── */}
      <section id="join" className="section cta-join-section" style={{ background: isDark ? 'linear-gradient(135deg, #111 0%, #1a1400 50%, #111 100%)' : 'linear-gradient(135deg,#f5f0e0 0%,#fdf8e8 50%,#f5f0e0 100%)', borderTop: '1px solid rgba(201,168,76,0.2)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-eyebrow" style={{ display: 'block', textAlign: 'center' }}>Start Today</span>
          <div className="gold-line centered" />
          <h2 className="section-title" style={{ fontSize: '5rem', marginBottom: '20px' }}>
            Become a <span className="text-gold">Legend</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto 48px', textAlign: 'center' }}>
            The first step is the hardest. Take it now. Your strongest self is waiting inside.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:+916262099920" className="btn btn-gold" style={{ fontSize: '1.05rem' }}>
              <Phone size={18} /> Call to Join — Free Trial
            </a>
            <a href="#location" className="btn btn-outline-gold" style={{ fontSize: '1.05rem' }}>
              <MapPin size={18} /> Find a Location
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="golds-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <span className="logo-text"><span style={{ color: 'var(--gold)' }}>SKY</span>FIT</span>
              <p>Ujjain's premier fitness destination. Building champions since 2022 through elite equipment, expert coaching, and a culture of excellence.</p>
            </div>
            <div className="footer-col">
              <h4>Programs</h4>
              <ul>
                <li><a href="#programs">Weight Training</a></li>
                <li><a href="#programs">CrossFit</a></li>
                <li><a href="#programs">Yoga & Core</a></li>
                <li><a href="#programs">Zumba</a></li>
                <li><a href="#programs">Personal Training</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#trainers">Our Trainers</a></li>
                <li><a href="#nutrition">Nutrition</a></li>
                <li><a href="#app">Mobile App</a></li>
                <li><a href="#location">Locations</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <ul>
                <li><a href="tel:+916262099920">+91 62620 99920</a></li>
                <li><a href="tel:+916262087800">+91 62620 87800</a></li>
                <li><a href="#location">Rishi Nagar, Ujjain</a></li>
                <li><a href="#location">Nai Sadak, Ujjain</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 SkyFit Gym. All rights reserved. Ujjain, Madhya Pradesh, India.</p>
            <div className="footer-social">
              {[Share2, Globe, Share2, Globe].map((Icon, i) => (
                <button className="social-btn" key={i}><Icon size={16} /></button>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default MarketingPage;
