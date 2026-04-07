import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, Target, Clock, Activity, AlertTriangle, BookOpen, Pencil, Check, LogOut } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    accuracy: 0,
  });
  const [subjectStats, setSubjectStats] = useState([]);
  const [weakChapters, setWeakChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setName(user?.user_metadata?.full_name || '');

      if (user) {
        // Fetch attempts with related question data
        const { data: attempts, error } = await supabase
          .from('attempts')
          .select(`
            is_correct,
            time_taken,
            questions (
              subject,
              chapter
            )
          `)
          .eq('user_id', user.id);
        
        if (attempts && attempts.length > 0) {
          // 1. Overall Stats
          const totalAttempts = attempts.length;
          const correctCount = attempts.filter(a => a.is_correct).length;
          const accuracy = Math.round((correctCount / totalAttempts) * 100);
          
          setStats({ totalAttempts, accuracy });

          // 2. Subject-wise Stats & Chapter-wise Stats
          const subData = {};
          const chapData = {};

          attempts.forEach(a => {
            const subject = a.questions?.subject || 'Unknown';
            const chapter = a.questions?.chapter || 'Unknown';
            
            // Subject aggregation
            if (!subData[subject]) subData[subject] = { total: 0, correct: 0, totalTime: 0 };
            subData[subject].total += 1;
            subData[subject].totalTime += (a.time_taken || 0);
            if (a.is_correct) subData[subject].correct += 1;

            // Chapter aggregation
            if (!chapData[chapter]) chapData[chapter] = { total: 0, correct: 0, subject };
            chapData[chapter].total += 1;
            if (a.is_correct) chapData[chapter].correct += 1;
          });

          // Format Subjects
          const formattedSubjects = ['Physics', 'Chemistry', 'Mathematics'].map(subj => {
            const data = subData[subj];
            const acc = data ? Math.round((data.correct / data.total) * 100) : 0;
            const attempted = data ? data.total : 0;
            const avgTime = data && data.total > 0 ? Math.round(data.totalTime / data.total) : 0;
            return { name: subj, accuracy: acc, attempted, avgTime };
          });
          setSubjectStats(formattedSubjects);

          // Identify Weak Chapters (e.g., Accuracy < 60% and at least 3 attempts to be statistically somewhat relevant, or just any low accuracy if total is small. We'll use < 60%)
          const formattedChapters = Object.keys(chapData).map(chap => {
            const data = chapData[chap];
            const acc = Math.round((data.correct / data.total) * 100);
            return { name: chap, subject: data.subject, accuracy: acc, attempted: data.total };
          });
          
          const weak = formattedChapters
            .filter(c => c.accuracy < 60 && c.attempted > 0)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 5); // Top 5 weakest
          
          setWeakChapters(weak);
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSaveName = async () => {
    setSavingName(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim() }
    });
    if (!error) {
      setEditingName(false);
    }
    setSavingName(false);
  };

  if (loading) return (
    <div className="flex-center" style={{ height: '50vh', flexDirection: 'column', gap: '1rem' }}>
      <div className="icon-box animate-pulse" style={{ background: 'var(--color-primary-soft)' }}>
        <User className="animate-spin" size={32} />
      </div>
      <p className="text-muted">Loading Profile...</p>
    </div>
  );

  return (
    <div className="fade-enter-active" style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* 1. User Info Section */}
      <section className="card mb-8" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
        <div style={{ 
          width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
          backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <User size={32} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                placeholder="Enter your name"
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  border: '2px solid var(--color-primary)',
                  borderRadius: '8px',
                  padding: '0.4rem 0.75rem',
                  width: '100%',
                  outline: 'none',
                  background: 'var(--bg-surface)',
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                style={{
                  background: 'var(--color-primary)', color: 'white', border: 'none',
                  borderRadius: '8px', padding: '0.5rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}
              >
                <Check size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{name || 'Student'}</h2>
              <button
                onClick={() => setEditingName(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex' }}
                aria-label="Edit name"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{user?.email}</p>
        </div>
      </section>

      {/* 2. Overall Stats */}
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity size={20} color="var(--color-primary)" /> Overall Stats
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '600' }}>Attempted</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{stats.totalAttempts}</div>
        </div>
        <div className="card" style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '600' }}>Accuracy</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: stats.accuracy >= 70 ? 'var(--color-success)' : stats.accuracy >= 40 ? 'var(--color-warning)' : 'var(--color-error)' }}>
            {stats.accuracy}%
          </div>
        </div>
      </div>

      {/* 3. Subject-wise Performance */}
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Target size={20} color="var(--color-primary)" /> Subject Performance
      </h3>
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        {subjectStats.map((sub, idx) => (
          <div key={sub.name} style={{ marginBottom: idx === subjectStats.length - 1 ? 0 : '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{sub.name}</span>
              <span style={{ fontWeight: '600', fontSize: '0.9rem', color: sub.accuracy >= 70 ? 'var(--color-success)' : sub.accuracy >= 40 ? 'var(--color-warning)' : 'var(--color-error)' }}>
                {sub.accuracy}% <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'normal' }}>({sub.attempted} Qs · {sub.avgTime}s avg)</span>
              </span>
            </div>
            <div style={{ height: '8px', background: 'var(--bg-card)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ 
                height: '100%', 
                background: sub.accuracy >= 70 ? 'var(--color-success)' : sub.accuracy >= 40 ? 'var(--color-warning)' : 'var(--color-error)', 
                width: `${sub.accuracy}%`,
                borderRadius: '10px',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
          </div>
        ))}
        {subjectStats.length === 0 && <p className="text-muted text-center" style={{ fontSize: '0.875rem' }}>Solve questions to see subject stats.</p>}
      </div>

      {/* 4. Weak Chapters */}
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertTriangle size={20} color="var(--color-error)" /> Weak Chapters
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {weakChapters.length > 0 ? (
          weakChapters.map((chap, idx) => (
            <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderLeft: '4px solid var(--color-error)' }}>
              <div>
                <h4 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.25rem' }}>{chap.name}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {chap.subject}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-error)' }}>{chap.accuracy}%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accuracy</div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center" style={{ padding: '2rem 1rem' }}>
            <BookOpen size={32} color="var(--color-success)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)' }}>No weak chapters identified yet!<br/>Keep solving questions.</p>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={() => {
          if (window.confirm('Are you sure you want to log out?')) {
            supabase.auth.signOut().then(() => navigate('/login'));
          }
        }}
        style={{
          marginTop: '2rem',
          width: '100%',
          padding: '0.875rem',
          borderRadius: '12px',
          border: '2px solid var(--color-error)',
          background: 'none',
          color: 'var(--color-error)',
          fontWeight: '600',
          fontSize: '1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s ease',
        }}
      >
        <LogOut size={18} /> Log Out
      </button>
    </div>
  );
}
