import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ChapterPractice() {
  const navigate = useNavigate();
  const [subjects] = useState(['Physics', 'Chemistry', 'Maths']);
  const [chapters, setChapters] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChapters() {
      setLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select('chapter')
        .eq('subject', selectedSubject);
      
      if (data) {
        const uniqueChapters = [...new Set(data.map(item => item.chapter))];
        setChapters(uniqueChapters);
      }
      setLoading(false);
    }
    fetchChapters();
  }, [selectedSubject]);

  const handleStartChapter = (chapter) => {
    navigate(`/quiz/chapter/${encodeURIComponent(chapter)}`);
  };

  return (
    <div className="fade-enter-active">
      <header className="mb-8">
        <h1 className="font-bold flex-row" style={{ fontSize: '1.5rem' }}>
          <BookOpen color="var(--color-primary)" /> Practice by Chapter
        </h1>
      </header>

      <div className="tabs-container">
        {subjects.map(sub => (
          <button
            key={sub}
            className={`tab-item ${selectedSubject === sub ? 'active' : ''}`}
            onClick={() => setSelectedSubject(sub)}
          >
            {sub}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted">Loading chapters...</p>
        </div>
      ) : chapters.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {chapters.map((chap, idx) => (
            <button
              key={chap}
              className="card card-interactive"
              onClick={() => handleStartChapter(chap)}
              style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', width: '100%', border: 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', width: '100%' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{chap}</h3>
                {idx % 3 === 0 && <CheckCircle2 size={18} color="var(--color-success)" />}
              </div>
              
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  <span className="text-muted">Progress</span>
                  <span className="font-bold">{idx % 3 === 0 ? '100%' : idx % 2 === 0 ? '45%' : '0%'}</span>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    background: 'var(--color-primary)', 
                    width: idx % 3 === 0 ? '100%' : idx % 2 === 0 ? '45%' : '0%',
                    borderRadius: '10px'
                  }}></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 card">
          <p className="text-muted">No chapters found for {selectedSubject} yet.</p>
        </div>
      )}
    </div>
  );
}

