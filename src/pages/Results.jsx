import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, XCircle, Clock, Award, Home, ChevronDown, ChevronUp } from 'lucide-react';
import Latex from '../components/Latex';

export default function Results() {
  const { attemptId } = useParams();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [searchParams] = useSearchParams();
  const isPractice = searchParams.get('mode') === 'chapter';

  useEffect(() => {
    async function fetchResults() {
      const { data } = await supabase
        .from('attempts')
        .select(`
          *,
          questions (
            question_text,
            options,
            correct_answer,
            explanation,
            explanation_image_url
          )
        `)
        .eq('attempt_group_id', attemptId);
        
      if (data) setAttempts(data);
      setLoading(false);
    }
    fetchResults();
  }, [attemptId]);

  if (loading) return (
    <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '1rem' }}>
      <p className="text-muted">Calculating your score...</p>
    </div>
  );

  const correctCount = attempts.filter(a => a.is_correct).length;
  const totalCount = attempts.length;
  const accuracy = Math.round((correctCount / totalCount) * 100);
  const totalTime = attempts.reduce((acc, curr) => acc + (curr.time_taken || 0), 0);

  return (
    <div className="fade-enter-active">
      <section className="card text-center mb-8" style={{ padding: '3rem 1.5rem' }}>
        <div className="icon-box" style={{ margin: '0 auto 1.5rem', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-primary-soft)' }}>
          <Award size={40} />
        </div>
        <h1 className="font-bold mb-2" style={{ fontSize: '2rem' }}>{isPractice ? 'Practice Completed!' : 'Exam Completed!'}</h1>
        <p className="text-muted mb-8">{isPractice ? 'Nice work! Here\'s your practice summary.' : 'Great effort! Here\'s how you performed.'}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ background: '#f8fafc', border: 'none' }}>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{correctCount}/{totalCount}</p>
            <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Score</p>
          </div>
          <div className="card" style={{ background: '#f8fafc', border: 'none' }}>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: accuracy > 70 ? '#10b981' : '#f59e0b' }}>{accuracy}%</p>
            <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Accuracy</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn-outline" style={{ flex: 1, minWidth: '120px' }}>
            <Home size={18} /> Home
          </Link>
          {isPractice && (
             <Link 
              to={`/practice?subject=${encodeURIComponent(searchParams.get('subject') || 'Physics')}`} 
              className="btn-primary" 
              style={{ flex: 1, minWidth: '160px' }}
            >
              Back to Chapters
            </Link>
          )}
          <button 
            className="btn-outline" 
            style={{ flex: 1, minWidth: '120px' }}
            onClick={() => setShowReview(!showReview)}
          >
            Review {showReview ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </section>

      {showReview && (
        <section className="fade-enter-active">
          <h2 className="font-bold mb-4" style={{ fontSize: '1.25rem' }}>Detailed Review</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {attempts.map((attempt, i) => (
              <div key={attempt.id} className="card" style={{ borderLeft: `4px solid ${attempt.is_correct ? '#10b981' : '#ef4444'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: '600', fontSize: '1rem', flex: 1 }}>
                    <div style={{ display: 'inline-flex', marginRight: '0.5rem' }}>{i + 1}.</div>
                    <Latex style={{ display: 'inline' }}>{attempt.questions.question_text}</Latex>
                  </div>
                  {attempt.is_correct ? <CheckCircle2 size={24} color="#10b981" /> : <XCircle size={24} color="#ef4444" />}
                </div>
                
                <div style={{ padding: '1rem', background: '#f1f5f9', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className="text-muted" style={{ fontSize: '0.875rem' }}>Your Answer: </span>
                    <span style={{ fontWeight: '600', color: attempt.is_correct ? '#10b981' : '#ef4444' }}>
                      <Latex style={{ display: 'inline-block' }}>{attempt.selected_answer || 'Skipped'}</Latex>
                    </span>
                  </div>
                  {!attempt.is_correct && (
                    <div>
                      <span className="text-muted" style={{ fontSize: '0.875rem' }}>Correct: </span>
                      <span style={{ fontWeight: '600', color: '#10b981' }}>
                        <Latex style={{ display: 'inline-block' }}>{attempt.questions.correct_answer}</Latex>
                      </span>
                    </div>
                  )}
                </div>
                
                {(attempt.questions.explanation || attempt.questions.explanation_image_url) && (
                  <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
                    <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Explanation</p>
                    {attempt.questions.explanation && (
                      <div style={{ fontSize: '0.875rem', lineHeight: '1.6', marginBottom: attempt.questions.explanation_image_url ? '1rem' : 0 }}>
                        <Latex>{attempt.questions.explanation}</Latex>
                      </div>
                    )}
                    {attempt.questions.explanation_image_url && (
                      <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <img 
                          src={attempt.questions.explanation_image_url} 
                          alt="Explanation diagram" 
                          style={{ maxWidth: '100%', display: 'block', margin: '0 auto', borderRadius: '4px' }} 
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

