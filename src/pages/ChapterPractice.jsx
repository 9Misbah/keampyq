import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ChapterPractice() {
  const navigate = useNavigate();
  const [subjects] = useState(['Physics', 'Chemistry', 'Mathematics']);
  const [chapters, setChapters] = useState([]); // Array of { name, total, attempted, progress }
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChaptersWithProgress() {
      setLoading(true);

      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Get all questions for the selected subject
      const { data: questionsData } = await supabase
        .from('questions')
        .select('id, chapter')
        .eq('subject', selectedSubject);

      if (!questionsData) {
        setChapters([]);
        setLoading(false);
        return;
      }

      // 3. Build a map of chapter → total question count & question IDs
      const chapterMap = {};
      questionsData.forEach(q => {
        if (!chapterMap[q.chapter]) {
          chapterMap[q.chapter] = { total: 0, questionIds: new Set() };
        }
        chapterMap[q.chapter].total += 1;
        chapterMap[q.chapter].questionIds.add(q.id);
      });

      // 4. Get the user's attempts (only need question_id to count unique ones)
      let attemptedQuestionIds = new Set();
      if (user) {
        const { data: attemptsData } = await supabase
          .from('attempts')
          .select('question_id')
          .eq('user_id', user.id);

        if (attemptsData) {
          attemptsData.forEach(a => attemptedQuestionIds.add(a.question_id));
        }
      }

      // 5. Compute progress per chapter
      const chaptersWithProgress = Object.keys(chapterMap).map(chapterName => {
        const { total, questionIds } = chapterMap[chapterName];
        let attempted = 0;
        questionIds.forEach(qId => {
          if (attemptedQuestionIds.has(qId)) attempted++;
        });
        const progress = total > 0 ? Math.round((attempted / total) * 100) : 0;
        return { name: chapterName, total, attempted, progress };
      });

      setChapters(chaptersWithProgress);
      setLoading(false);
    }
    fetchChaptersWithProgress();
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
          {chapters.map((chap) => (
            <button
              key={chap.name}
              className="card card-interactive"
              onClick={() => handleStartChapter(chap.name)}
              style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', width: '100%', border: 'none' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', width: '100%' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>{chap.name}</h3>
                {chap.progress === 100 && <CheckCircle2 size={18} color="var(--color-success)" />}
              </div>
              
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                  <span className="text-muted">Progress</span>
                  <span className="font-bold">{chap.progress}%</span>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    background: 'var(--color-primary)', 
                    width: `${chap.progress}%`,
                    borderRadius: '10px',
                    transition: 'width 0.3s ease'
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

