import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { User, Activity, Home as HomeIcon } from 'lucide-react';

import Home from './pages/Home';
import Login from './pages/Login';
import ChapterPractice from './pages/ChapterPractice';
import YearPractice from './pages/YearPractice';
import QuizRunner from './pages/QuizRunner';
import Results from './pages/Results';
import Profile from './pages/Profile';

function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);


  // Hide nav during quiz or login
  const hideNav = location.pathname.startsWith('/quiz') || location.pathname === '/login' || !session;

  return (
    <div className="app-container">
      {!hideNav && (
        <nav className="card mb-8" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-surface)',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ fontWeight: 'bold', display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div className="icon-box" style={{ width: '32px', height: '32px', marginBottom: 0, borderRadius: '8px' }}>
              <Activity size={16} />
            </div>
            KEAM Prep
          </div>
          
          <div className="flex-row" style={{ gap: '1rem' }}>
            <Link to="/" style={{ color: 'var(--text-muted)' }}><HomeIcon size={20} /></Link>
            <Link to="/profile" style={{ color: 'var(--text-muted)' }}><User size={20} /></Link>
          </div>
        </nav>
      )}

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={session ? <Home /> : <Login />} />
          <Route path="/chapter" element={session ? <ChapterPractice /> : <Login />} />
          <Route path="/year" element={session ? <YearPractice /> : <Login />} />
          <Route path="/quiz/:mode/:id" element={session ? <QuizRunner /> : <Login />} />
          <Route path="/results/:attemptId" element={session ? <Results /> : <Login />} />
          <Route path="/profile" element={session ? <Profile /> : <Login />} />
        </Routes>
      </main>
      
      {!location.pathname.startsWith('/quiz') && (
        <footer style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <p>© {new Date().getFullYear()} KEAM Prep. Build for students.</p>
        </footer>
      )}
    </div>
  );
}

export default App;
