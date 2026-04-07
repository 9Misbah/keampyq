import { Link } from 'react-router-dom';
import { BookOpen, FileText, ChevronRight } from 'lucide-react';
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
    </div>
  );
}

