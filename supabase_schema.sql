-- Run this script in your Supabase SQL Editor to set up the database

-- 1. Create the Questions Table
CREATE TABLE public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL,
    exam TEXT DEFAULT 'KEAM',
    subject TEXT NOT NULL,
    chapter TEXT NOT NULL,
    question_text TEXT NOT NULL,
    image_url TEXT,
    options JSONB NOT NULL, -- Array of strings e.g., ["Opt A", "Opt B", "Opt C", "Opt D"]
    correct_answer TEXT NOT NULL, -- The string value of the correct option
    explanation TEXT,
    explanation_image_url TEXT,
    difficulty TEXT, -- 'easy', 'medium', 'hard'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recommended Indexes for fast querying
CREATE INDEX idx_questions_subject ON public.questions(subject);
CREATE INDEX idx_questions_chapter ON public.questions(chapter);
CREATE INDEX idx_questions_year ON public.questions(year);

-- 2. Create the Attempts Table
CREATE TABLE public.attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    time_taken INTEGER DEFAULT 0, -- time taken in seconds
    attempt_group_id UUID NOT NULL, -- to group a single quiz session
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for querying user performance
CREATE INDEX idx_attempts_user_id ON public.attempts(user_id);
CREATE INDEX idx_attempts_group ON public.attempts(attempt_group_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

-- Setup Policies
-- Questions are readable by everyone (authenticated users)
CREATE POLICY "Questions are readable by all authenticated users"
ON public.questions FOR SELECT
TO authenticated USING (true);

-- Attempts can only be read and created by the user who owns them
CREATE POLICY "Users can insert their own attempts"
ON public.attempts FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own attempts"
ON public.attempts FOR SELECT
TO authenticated USING (auth.uid() = user_id);

-- Optional: Dummy Data creation function or sample inserts
INSERT INTO public.questions (year, subject, chapter, question_text, options, correct_answer, explanation, difficulty)
VALUES 
(2022, 'Physics', 'Kinematics', 'A particle moves with a uniform velocity. Its acceleration is:', '["Positive", "Negative", "Zero", "Variable"]', 'Zero', 'Uniform velocity means no change in velocity, therefore acceleration is zero.', 'easy'),
(2022, 'Maths', 'Calculus', 'What is the derivative of sin(x)?', '["cos(x)", "-cos(x)", "sin(x)", "tan(x)"]', 'cos(x)', 'Standard derivative.', 'easy'),
(2021, 'Chemistry', 'Thermodynamics', 'Which law state that energy cannot be created or destroyed?', '["First Law", "Second Law", "Third Law", "Zeroth Law"]', 'First Law', 'The First Law of Thermodynamics is the law of conservation of energy.', 'easy');
