import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Activity, AlertCircle } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalAttempts: 0, accuracy: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch all attempts related to user to calculate basic analytics
        const { data: attempts, error } = await supabase
          .from('attempts')
          .select('id, is_correct')
          .eq('user_id', user.id);
        
        if (attempts && attempts.length > 0) {
          const correct = attempts.filter(a => a.is_correct).length;
          setStats({
            totalAttempts: attempts.length,
            accuracy: Math.round((correct / attempts.length) * 100)
          });
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  if (loading) return <div className="flex-center" style={{ height: '50vh' }}>Loading Profile...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="flex-center" style={{ gap: '1rem', marginBottom: '2rem', flexDirection: 'column' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={40} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{user?.email}</h2>
      </div>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="glass-card flex-center" style={{ flexDirection: 'column' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Questions Attempted</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{stats.totalAttempts}</div>
        </div>
        
        <div className="glass-card flex-center" style={{ flexDirection: 'column' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Overall Accuracy</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: stats.accuracy > 70 ? 'var(--color-success)' : 'var(--color-warning)' }}>
            {stats.accuracy}%
          </div>
        </div>
      </div>

      {/* Future-Ready Placeholders */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1rem' }}>
          <AlertCircle color="var(--color-warning)" /> 
          <h3 style={{ fontSize: '1.125rem' }}>Weak Topics Tracking</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
           Our AI is currently analyzing your performance data. In future updates, topics where your accuracy is below 50% will be listed here automatically.
        </p>
        <button className="btn-secondary" style={{ width: '100%' }} disabled>
          Generate Topic Insights (Coming Soon)
        </button>
      </div>
    </div>
  );
}
