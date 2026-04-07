import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Activity, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Signup successful! You can now log in.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem 0.875rem 3rem',
    fontSize: '1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    outline: 'none',
    background: '#f8fafc',
    color: 'var(--text-main)',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  };

  const inputFocusHandler = (e) => {
    e.target.style.borderColor = 'var(--color-primary)';
    e.target.style.background = '#fff';
    e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
  };

  const inputBlurHandler = (e) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.background = '#f8fafc';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      background: 'linear-gradient(160deg, #f5f3ff 0%, #eef2ff 30%, #fcfaff 60%, #faf5ff 100%)',
    }}>
      {/* Logo & Branding */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ 
          width: '72px', height: '72px', borderRadius: '20px', 
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
        }}>
          <Activity size={36} color="white" />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          KEAM Prep
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Your path to engineering excellence
        </p>
      </div>

      {/* Auth Card */}
      <div style={{ 
        width: '100%', 
        maxWidth: '400px',
        background: '#ffffff',
        borderRadius: '20px',
        padding: '2rem 1.75rem',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
      }}>
        {/* Toggle Tabs */}
        <div style={{ 
          display: 'flex', 
          background: '#f1f5f9', 
          padding: '4px', 
          borderRadius: '12px', 
          marginBottom: '1.75rem' 
        }}>
          <button 
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{ 
              flex: 1, padding: '0.625rem', borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem',
              background: isLogin ? '#fff' : 'transparent',
              color: isLogin ? 'var(--color-primary)' : 'var(--text-muted)',
              boxShadow: isLogin ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{ 
              flex: 1, padding: '0.625rem', borderRadius: '10px', fontWeight: '600', fontSize: '0.9rem',
              background: !isLogin ? '#fff' : 'transparent',
              color: !isLogin ? 'var(--color-primary)' : 'var(--text-muted)',
              boxShadow: !isLogin ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ 
            padding: '0.75rem 1rem', 
            background: 'rgba(239, 68, 68, 0.08)', 
            color: '#dc2626',
            borderRadius: '10px', 
            marginBottom: '1.25rem', 
            fontSize: '0.85rem',
            fontWeight: '500',
            border: '1px solid rgba(239, 68, 68, 0.15)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Email */}
          <div style={{ position: 'relative' }}>
            <label style={{ 
              display: 'block', fontSize: '0.8rem', fontWeight: '600', 
              color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' 
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ 
              display: 'block', fontSize: '0.8rem', fontWeight: '600', 
              color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' 
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={inputFocusHandler}
                onBlur={inputBlurHandler}
                required
                minLength={6}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              marginTop: '0.5rem',
              padding: '0.9rem 1.5rem',
              borderRadius: '12px',
              background: loading ? '#a5b4fc' : 'linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%)',
              color: 'white',
              fontWeight: '700',
              fontSize: '1rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
