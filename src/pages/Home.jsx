import { Link } from 'react-router-dom';
import { BookOpen, FileText, PlayCircle, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
    });
  }, []);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="fade-enter-active">
      <header className="mb-8">
        <p className="text-muted mb-2">Welcome back,</p>
        <h1 className="font-bold" style={{ fontSize: '1.75rem' }}>Hi, {userName} 👋</h1>
      </header>

      {/* Continue Practice - Conditional mockup */}
      <section className="mb-8">
        <Link to="/chapter" className="card card-interactive mb-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--color-primary)', color: 'white', border: 'none' }}>
          <div className="icon-box" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', marginBottom: 0 }}>
            <PlayCircle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Continue Practice</p>
            <h3 style={{ fontSize: '1.125rem' }}>Physics - Kinematics</h3>
          </div>
          <ChevronRight size={20} opacity={0.7} />
        </Link>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 font-bold" style={{ fontSize: '1.25rem' }}>Start Learning</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Link to="/chapter" className="card card-interactive" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="icon-box" style={{ marginBottom: 0 }}>
              <BookOpen size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Practice by Chapter</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>Master specific topics one by one</p>
            </div>
            <ChevronRight size={20} color="var(--text-muted)" />
          </Link>

          <Link to="/year" className="card card-interactive" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="icon-box" style={{ marginBottom: 0, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <FileText size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Previous Year Papers</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>Full length mock tests from KEAM</p>
            </div>
            <ChevronRight size={20} color="var(--text-muted)" />
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-bold" style={{ fontSize: '1.25rem' }}>Your Progress</h2>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questions Solved</p>
              <p className="font-bold" style={{ fontSize: '1.5rem' }}>124</p>
            </div>
            <div>
              <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Success Rate</p>
              <p className="font-bold" style={{ fontSize: '1.5rem', color: 'var(--color-success)' }}>78%</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

