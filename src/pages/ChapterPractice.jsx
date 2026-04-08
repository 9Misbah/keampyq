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

      // Define the custom order here. Add chapter names in the exact order you want them to appear.
      const customChapterOrder = [
        "Physical World",
        "Units and Measurements",
        "Motion in a Straight Line",
        "Motion in a Plane",
        "Laws of Motion",
        "Work, Energy and Power",
        "System of Particles",
        "Rotational Motion",
        "Gravitation",
        "Mechanical Properties of Solids",
        "Mechanical Properties of Fluids",
        "Thermal Properties of Matter",
        "Thermodynamics",
        "Kinetic Theory",
        "Oscillations",
        "Waves",
        "Electric Charges and Fields",
        "Electrostatic Potential and Capacitance",
        "Current Electricity",
        "Moving Charges and Magnetism",
        "Magnetism and Matter",
        "Electromagnetic Induction",
        "Alternating Current",
        "Electromagnetic Waves",
        "Ray Optics and Optical Instruments",
        "Wave Optics",
        "Dual Nature of Matter",
        "Atoms",
        "Nuclei",
        "Semiconductor",
        ///////
        "Some Basic Concepts of Chemistry",
        "Structure of Atom",
        "Classification of Elements and Periodicity",
        "Chemical Bonding and Molecular Structure",
        "States of Matter",
        "Thermodynamics",
        "Equilibrium",
        "Redox Reactions",
        "The s-Block Elements",
        "Organic Chemistry – Some Basic Principles",
        "Hydrocarbons",
        "Solutions",
        "Electrochemistry",
        "Chemical Kinetics",
        "Surface Chemistry",
        "p-Block Elements",
        "d- and f-Block Elements",
        "Coordination Compounds",
        "Haloalkanes and Haloarenes",
        "Alcohols, Phenols and Ethers",
        "Aldehydes, Ketones and Carboxylic Acids",
        "Amines",
        "Biomolecules",
        /////////
        "Sets",
        "Relations and Functions",
        "Complex Numbers",
        "Quadratic Equations",
        "Trigonometric Functions",



        "Linear Inequalities",
        "Permutations and Combinations",
        "Binomial Theorem",
        "Sequences and Series",
        "Straight Lines",
        "Conic Sections",
        "Introduction to 3D Geometry",
        "Limits and Derivatives",
        "Mathematical Reasoning",
        "Statistics",
        "Relations and Functions",
        "Inverse Trigonometric Functions",
        "Matrices",
        "Determinants",
        "Continuity and Differentiability",
        "Applications of Derivatives",
        "Integrals",
        "Applications of Integrals",
        "Differential Equations",
        "Vector Algebra",
        "Three Dimensional Geometry",
        "Linear Programming",
        "Probability"
      ];

      // 5. Compute progress per chapter  
      const chaptersWithProgress = Object.keys(chapterMap).map(chapterName => {
        const { total, questionIds } = chapterMap[chapterName];
        let attempted = 0;
        questionIds.forEach(qId => {
          if (attemptedQuestionIds.has(qId)) attempted++;
        });
        const progress = total > 0 ? Math.round((attempted / total) * 100) : 0;
        return { name: chapterName, total, attempted, progress };
      }).sort((a, b) => {
        const indexA = customChapterOrder.indexOf(a.name);
        const indexB = customChapterOrder.indexOf(b.name);

        // If a chapter is not explicitly listed in customChapterOrder, put it at the bottom.
        const finalA = indexA === -1 ? 9999 : indexA;
        const finalB = indexB === -1 ? 9999 : indexB;

        return finalA - finalB;
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

