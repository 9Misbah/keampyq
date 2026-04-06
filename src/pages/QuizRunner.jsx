import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Timer, AlertCircle, ChevronLeft, ChevronRight, Check, X, ShieldAlert } from 'lucide-react';

export default function QuizRunner() {
  const { mode, id } = useParams();
  const navigate = useNavigate();

  const isPractice = mode === 'chapter';

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // Stores the chosen option
  const [feedback, setFeedback] = useState({}); // Stores if it was correct/wrong (only for practice)
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [attemptGroupId, setAttemptGroupId] = useState('');
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTaken(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      let query = supabase.from('questions').select('*');
      if (mode === 'chapter') query = query.eq('chapter', id);
      else if (mode === 'year') query = query.eq('year', parseInt(id));
      
      const { data } = await query;
      if (data) {
        setQuestions(data);
        setAttemptGroupId(crypto.randomUUID ? crypto.randomUUID() : Math.random().toString());
      }
      setLoading(false);
    }
    getQuestions();
  }, [mode, id]);

  const handleSelectOption = (option) => {
    // In practice mode, lock the answer once selected to show feedback
    if (isPractice && selectedAnswers[currentIndex]) return;

    const correct = questions[currentIndex].correct_answer === option;
    
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: option }));
    
    if (isPractice) {
      setFeedback(prev => ({ ...prev, [currentIndex]: correct ? 'correct' : 'wrong' }));
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const attemptsDbPayload = questions.map((q, idx) => ({
      user_id: user.id,
      question_id: q.id,
      selected_answer: selectedAnswers[idx] || null,
      is_correct: selectedAnswers[idx] === q.correct_answer,
      time_taken: Math.floor(timeTaken / questions.length),
      attempt_group_id: attemptGroupId
    }));

    const { error } = await supabase.from('attempts').insert(attemptsDbPayload);
    if (!error) navigate(`/results/${attemptGroupId}`);
    else {
      alert('Failed to submit: ' + error.message);
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '1rem' }}>
      <div className="icon-box animate-pulse" style={{ background: 'var(--color-primary-soft)' }}>
        <Timer className="animate-spin" size={32} />
      </div>
      <p className="text-muted">Preparing your {isPractice ? 'practice' : 'exam'}...</p>
    </div>
  );

  if (!questions.length) return (
    <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '1rem' }}>
      <AlertCircle size={48} color="var(--color-error)" />
      <p>No questions found.</p>
      <button className="btn-outline" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  const currentQ = questions[currentIndex];
  let optionsList = [];
  try {
    optionsList = typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options;
  } catch (e) {
    console.error("Failed to parse options", currentQ.options);
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Header */}
      <nav className="card" style={{ 
        position: 'sticky', 
        top: '1rem', 
        zIndex: 10, 
        marginBottom: '2rem',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="icon-box" style={{ width: '32px', height: '32px', marginBottom: 0, borderRadius: '8px' }}>
            <Timer size={16} />
          </div>
          <span className="font-bold" style={{ fontSize: '0.875rem' }}>{formatTime(timeTaken)}</span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <span style={{ 
            fontSize: '0.7rem', 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            background: isPractice ? 'var(--color-primary-soft)' : '#fee2e2',
            color: isPractice ? 'var(--color-primary)' : '#ef4444',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            {isPractice ? 'Practice' : 'Exam'}
          </span>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>QUESTION</p>
          <p className="font-bold" style={{ fontSize: '1rem' }}>{currentIndex + 1} of {questions.length}</p>
        </div>
      </nav>

      <div style={{ height: '4px', width: '100%', background: '#f1f5f9', borderRadius: '10px', marginBottom: '2rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: isPractice ? 'var(--color-primary)' : '#ef4444', width: `${progressPercent}%`, transition: 'width 0.3s ease' }}></div>
      </div>

      <main className="fade-enter-active" key={currentIndex} style={{ flex: 1 }}>
        <section className="mb-8">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', lineHeight: '1.5', marginBottom: '2rem' }}>
            {currentQ.question_text}
          </h2>

          {currentQ.image_url && (
            <div className="card mb-8" style={{ padding: '0.5rem', textAlign: 'center', background: '#f8fafc' }}>
              <img src={currentQ.image_url} alt="Question figure" style={{ maxWidth: '100%', borderRadius: 'var(--radius-sm)' }} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {optionsList.map((opt, i) => {
              const isSelected = selectedAnswers[currentIndex] === opt;
              const status = isPractice ? feedback[currentIndex] : null; 
              const isCorrectOpt = isPractice && currentQ.correct_answer === opt;
              
              let classes = 'option-button';
              if (isSelected) {
                if (!isPractice) {
                  classes += ' selected'; // Plain purple selection for exams
                } else {
                  if (status === 'correct') classes += ' correct';
                  else classes += ' wrong';
                }
              } else if (isPractice && status && isCorrectOpt) {
                classes += ' correct'; 
              }

              return (
                <button 
                  key={i} 
                  className={classes}
                  onClick={() => handleSelectOption(opt)}
                >
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    background: isSelected ? 'rgba(255,255,255,0.3)' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                  }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {isPractice && isSelected && status === 'correct' && <Check size={18} />}
                  {isPractice && isSelected && status === 'wrong' && <X size={18} />}
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: '1rem', 
        background: 'rgba(252, 250, 255, 0.9)', 
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', width: '100%', maxWidth: 'var(--max-width-app)', gap: '1rem' }}>
          <button 
            className="btn-outline" 
            style={{ flex: 1, display: 'flex', justifyContent: 'center' }} 
            onClick={handlePrev} 
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={20} /> Prev
          </button>
          
          {currentIndex === questions.length - 1 ? (
            <button 
              className="btn-primary" 
              style={{ flex: 2, background: isPractice ? 'var(--color-primary)' : '#ef4444' }} 
              onClick={handleSubmit} 
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : `Finish ${isPractice ? 'Practice' : 'Exam'}`}
            </button>
          ) : (
            <button 
              className="btn-primary" 
              style={{ flex: 2, display: 'flex', justifyContent: 'center', background: isPractice ? 'var(--color-primary)' : '#1e293b' }} 
              onClick={handleNext}
            >
              Next <ChevronRight size={20} />
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}


