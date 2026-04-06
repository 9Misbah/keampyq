import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, ChevronRight, FileText } from 'lucide-react';

export default function YearPractice() {
  const navigate = useNavigate();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchYears() {
      const { data } = await supabase
        .from('questions')
        .select('year');
        
      if (data) {
        const uniqueYears = [...new Set(data.map(item => item.year))].sort((a,b) => b - a);
        setYears(uniqueYears);
      }
      setLoading(false);
    }
    fetchYears();
  }, []);

  const handleStart = (year) => {
    navigate(`/quiz/year/${year}`);
  };

  return (
    <div className="fade-enter-active">
      <header className="mb-8">
        <h1 className="font-bold flex-row" style={{ fontSize: '1.5rem' }}>
          <Calendar color="var(--color-primary)" /> Previous Year Papers
        </h1>
        <p className="text-muted mt-2">Solve actual KEAM papers from previous years to build exam stamina.</p>
      </header>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted">Loading papers...</p>
        </div>
      ) : years.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {years.map(yr => (
            <button
              key={yr}
              className="card card-interactive"
              onClick={() => handleStart(yr)}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left', width: '100%', border: 'none' }}
            >
              <div className="icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', marginBottom: 0 }}>
                <FileText size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>KEAM {yr}</h3>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Original Question Paper</p>
              </div>
              <ChevronRight size={20} color="var(--text-muted)" />
            </button>
          ))}
        </div>
      ) : (
        <div className="card text-center py-8">
          <p className="text-muted">No PYQs found in the database yet.</p>
        </div>
      )}
    </div>
  );
}

