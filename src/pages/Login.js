import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, Activity } from 'lucide-react';
import { FavoritesContext } from '../context/FavoritesContext.js';
import './Login.css';

export default function Login() {
  const { loginUser, currentUser } = useContext(FavoritesContext);
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Toggle between Login & Register forms
  const [isLogin, setIsLogin] = useState(true);

  // Form Inputs
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status/Validation states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Cinematic Camera Flash wipe transition
  const [flashActive, setFlashActive] = useState(false);

  // If already logged in, redirect to profile
  useEffect(() => {
    if (currentUser) {
      navigate('/profile');
    }
  }, [currentUser, navigate]);

  // Set default accounts in localStorage for easy evaluation
  useEffect(() => {
    const registered = localStorage.getItem('cineWave_registered_users');
    if (!registered) {
      const defaultUsers = [
        { username: 'admin', email: 'admin@cinewave.com', password: 'password123' },
        { username: 'gopi', email: 'gopi@developer.com', password: 'password123' }
      ];
      localStorage.setItem('cineWave_registered_users', JSON.stringify(defaultUsers));
    }
  }, []);

  // HTML5 Canvas Action & Accident Simulation Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Canvas elements arrays
    const particles = [];
    const lines = [];
    const debris = [];
    const shockwaves = [];

    // Speed lines representing fast night cars/car chase lights
    const createLine = () => {
      return {
        x: -200,
        y: Math.random() * canvas.height,
        length: 150 + Math.random() * 300,
        speed: 12 + Math.random() * 18,
        color: Math.random() > 0.5 ? '#e94057' : '#00f2fe',
        opacity: 0.1 + Math.random() * 0.35,
        width: 1 + Math.random() * 2
      };
    };

    // Orange/Red sparks representing friction and grinding crashes
    const createSpark = (x, y, angle, speedForce) => {
      const a = angle || Math.random() * Math.PI * 2;
      const s = speedForce || (1 + Math.random() * 7);
      return {
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - (Math.random() * 1.5),
        size: 1 + Math.random() * 2.5,
        color: Math.random() > 0.45 ? '#ff5858' : '#f27121',
        alpha: 1,
        decay: 0.015 + Math.random() * 0.025
      };
    };

    // Shattering dark debris representing flying car components / glass
    const createFragment = (x, y) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        color: 'rgba(28, 25, 52, 0.95)',
        alpha: 1,
        decay: 0.01 + Math.random() * 0.015
      };
    };

    // Energy shockwave ring expanding outwards
    const createShockwave = (x, y) => {
      return {
        x,
        y,
        radius: 0,
        maxRadius: 120 + Math.random() * 120,
        width: 3,
        alpha: 1,
        color: Math.random() > 0.5 ? '233, 64, 87' : '0, 242, 254'
      };
    };

    // Pre-populate lines
    for (let i = 0; i < 15; i++) {
      lines.push(createLine());
      lines[i].x = Math.random() * canvas.width;
    }

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark cinematic vignette backdrop
      const radialGrad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 50,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.8
      );
      radialGrad.addColorStop(0, '#0c0a21');
      radialGrad.addColorStop(1, '#020107');
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw speed lines
      lines.forEach((line, index) => {
        line.x += line.speed;
        if (line.x > canvas.width + 150) {
          lines[index] = createLine();
        }
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.width;
        ctx.globalAlpha = line.opacity;
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x - line.length, line.y);
        ctx.stroke();
      });

      // Draw Sparks
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // slight gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      // Draw Debris fragments
      for (let i = debris.length - 1; i >= 0; i--) {
        const d = debris[i];
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.08;
        d.rotation += d.rotationSpeed;
        d.alpha -= d.decay;

        if (d.alpha <= 0) {
          debris.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rotation);
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = d.color;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-d.size, -d.size);
        ctx.lineTo(d.size, -d.size / 2);
        ctx.lineTo(d.size / 2, d.size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Draw Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 4;
        sw.alpha = 1 - (sw.radius / sw.maxRadius);

        if (sw.alpha <= 0) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${sw.color}, ${sw.alpha})`;
        ctx.lineWidth = sw.width;
        ctx.globalAlpha = 1;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Trigger full explosion crash sequence
    const triggerCrashExplosion = (x, y) => {
      // 1 shockwave
      shockwaves.push(createShockwave(x, y));
      // 30 sparks
      for (let i = 0; i < 30; i++) {
        particles.push(createSpark(x, y));
      }
      // 8 debris parts
      for (let i = 0; i < 8; i++) {
        debris.push(createFragment(x, y));
      }
    };

    // Click anywhere creates collisions
    const handleDocumentClick = (e) => {
      // Don't trigger explosion if clicking interactive form buttons
      if (e.target.closest('.auth-card') || e.target.closest('.navbar')) return;
      triggerCrashExplosion(e.clientX, e.clientY);
    };

    window.addEventListener('click', handleDocumentClick);

    // Save triggers globally so we can trigger them on form submissions
    window.triggerCinematicExplosion = (x, y) => triggerCrashExplosion(x, y);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  // Form toggling camera flash transition
  const toggleAuthMode = () => {
    setFlashActive(true);
    setError('');
    setSuccess('');
    
    // Simulate a crash shockwave from center of card
    const cardEl = document.querySelector('.auth-card');
    if (cardEl) {
      const rect = cardEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      if (window.triggerCinematicExplosion) {
        window.triggerCinematicExplosion(cx, cy);
      }
    }

    setTimeout(() => {
      setIsLogin(!isLogin);
      setFlashActive(false);
    }, 250);
  };

  // Form submissions
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Trigger explosion at submit button
    const btnRect = e.target.querySelector('button[type="submit"]').getBoundingClientRect();
    const bx = btnRect.left + btnRect.width / 2;
    const by = btnRect.top + btnRect.height / 2;
    if (window.triggerCinematicExplosion) {
      window.triggerCinematicExplosion(bx, by);
    }

    // Registered users list
    const registeredUsers = JSON.parse(localStorage.getItem('cineWave_registered_users')) || [];

    if (isLogin) {
      // Login Logic
      if (!username.trim() || !password.trim()) {
        setError('Please fill in all credentials.');
        return;
      }

      const matchUser = registeredUsers.find(
        (u) => (u.username === username || u.email === username) && u.password === password
      );

      if (matchUser) {
        setSuccess('Access Granted. Unlocking CineWave...');
        setTimeout(() => {
          loginUser(matchUser.username);
          navigate('/profile');
        }, 1500);
      } else {
        setError('Access Denied. Invalid username/email or password.');
      }
    } else {
      // Registration Logic
      if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
        setError('All fields are required.');
        return;
      }
      if (username.length < 3) {
        setError('Username must be at least 3 characters.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      // Check duplicates
      const usernameExists = registeredUsers.some((u) => u.username.toLowerCase() === username.toLowerCase());
      const emailExists = registeredUsers.some((u) => u.email.toLowerCase() === email.toLowerCase());

      if (usernameExists) {
        setError('Username is already taken.');
        return;
      }
      if (emailExists) {
        setError('Email is already registered.');
        return;
      }

      // Create new account
      const newUser = {
        username,
        email,
        password
      };
      const updatedList = [...registeredUsers, newUser];
      localStorage.setItem('cineWave_registered_users', JSON.stringify(updatedList));

      setSuccess('Account Registered. Initializing Login portal...');
      
      // Auto-toggle back to login after short delay
      setTimeout(() => {
        setIsLogin(true);
        setUsername(username);
        setPassword('');
        setConfirmPassword('');
        setSuccess('');
      }, 2000);
    }
  };

  return (
    <div className="login-page">
      {/* HTML5 Canvas Background */}
      <canvas ref={canvasRef} className="cinematic-canvas"></canvas>

      {/* Fullscreen Camera Wipe Flash Transition */}
      <div className={`camera-flash ${flashActive ? 'active' : ''}`}></div>

      <div className="auth-container page-container animate-fade">
        <div className="auth-grid">
          
          {/* Left Side: Cinematic Info overlay */}
          <div className="auth-side-panel glass-panel animate-scale">
            <div className="side-panel-glow"></div>
            <div className="side-panel-content">
              <span className="side-tag grad-badge">
                <Activity className="side-tag-icon" /> Live Engine Action
              </span>
              <h2 className="side-title">
                Experience Cinema <br />
                In <span className="grad-text-accent">High Velocity</span>
              </h2>
              <p className="side-description">
                Explore box office analytics, construct your ultimate watchlist, and test movie features side-by-side with high-octane visual transitions.
              </p>

              {/* Dynamic decorative film-strip simulation */}
              <div className="film-strip-teaser">
                <div className="film-frame animate-float" style={{ animationDelay: '0s' }}>
                  <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=150" alt="Frame 1" />
                  <span className="frame-num">A1</span>
                </div>
                <div className="film-frame animate-float" style={{ animationDelay: '1.2s' }}>
                  <img src="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=150" alt="Frame 2" />
                  <span className="frame-num">B7</span>
                </div>
                <div className="film-frame animate-float" style={{ animationDelay: '0.6s' }}>
                  <img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=150" alt="Frame 3" />
                  <span className="frame-num">C3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Auth Card Form */}
          <div className="auth-card-wrapper">
            <div className="auth-card glass-panel animate-slide">
              <div className="auth-header">
                <div className="auth-logo-badge">
                  <Film className="auth-logo-icon animate-float" />
                </div>
                <h3>{isLogin ? 'Mission Portal' : 'Agent Signup'}</h3>
                <p>{isLogin ? 'Login to synchronize your watchlist' : 'Register a new profile to track your movies'}</p>
              </div>

              {/* Status Alert Panels */}
              {error && (
                <div className="auth-alert error animate-scale">
                  <AlertCircle className="alert-icon" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="auth-alert success animate-scale">
                  <CheckCircle2 className="alert-icon" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="auth-form">
                
                {/* Username / Email field */}
                <div className="auth-input-group">
                  <label>{isLogin ? 'Username or Email' : 'Username'}</label>
                  <div className="input-field-wrapper">
                    <User className="input-field-icon" />
                    <input
                      type="text"
                      className="glass-input"
                      placeholder={isLogin ? 'admin' : 'movie_buff'}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email (only registration) */}
                {!isLogin && (
                  <div className="auth-input-group animate-slide">
                    <label>Email Address</label>
                    <div className="input-field-wrapper">
                      <Mail className="input-field-icon" />
                      <input
                        type="email"
                        className="glass-input"
                        placeholder="you@cinewave.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Password field */}
                <div className="auth-input-group">
                  <label>Password</label>
                  <div className="input-field-wrapper">
                    <Lock className="input-field-icon" />
                    <input
                      type="password"
                      className="glass-input"
                      placeholder={isLogin ? 'password123' : '••••••••'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password (only registration) */}
                {!isLogin && (
                  <div className="auth-input-group animate-slide">
                    <label>Confirm Password</label>
                    <div className="input-field-wrapper">
                      <Lock className="input-field-icon" />
                      <input
                        type="password"
                        className="glass-input"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button type="submit" className="glass-button submit-auth-btn">
                  {isLogin ? 'Authorize' : 'Sign Up'} <ArrowRight className="btn-arrow" />
                </button>
              </form>

              {/* Account Toggle footer */}
              <div className="auth-footer">
                <span>{isLogin ? "New to the grid?" : "Already have access?"}</span>
                <button type="button" onClick={toggleAuthMode} className="toggle-auth-link grad-text">
                  {isLogin ? "Create credentials" : "Return to portal"}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
