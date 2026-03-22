import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, Trophy, RotateCcw, CheckCircle2,
  XCircle, Code2, Mic, Download,
  Loader2, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterview } from '../context/InterviewContext';
import { generateLearningPath } from '../services/aiService';

const HISTORY_KEY = 'interviewpro_history';
const MAX_SESSIONS = 50;

const Report: React.FC = () => {
  const navigate = useNavigate();
  const { interviewData, resetInterview } = useInterview();
  const { questions, answers, overallScore } = interviewData;
  const historySaved = useRef(false);

  const [learningPath, setLearningPath] = useState<string | null>(null);
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);

  useEffect(() => {
    if (questions.length === 0) {
      navigate('/');
    }
  }, [questions, navigate]);

  // Save session to history on first render (once)
  useEffect(() => {
    if (questions.length === 0 || historySaved.current) return;
    historySaved.current = true;

    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      const history = stored ? JSON.parse(stored) : [];

      const session = {
        id: Date.now().toString() + '-' + Math.random().toString(36).slice(2, 8),
        date: new Date().toISOString(),
        company: interviewData.company || '',
        position: interviewData.position || '',
        questionCount: questions.length,
        answeredCount: answers.filter(a => a.text !== '(Skipped)').length,
        overallScore: overallScore || 0,
        questions: questions.map(q => ({ id: q.id, text: q.text, type: q.type })),
        answers: answers.map(a => ({
          questionId: a.questionId,
          text: a.text,
          ...(a.evaluation ? { evaluation: a.evaluation } : {}),
        })),
      };

      const updated = [session, ...history].slice(0, MAX_SESSIONS);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save interview history:', err);
    }
  }, []);

  const answeredCount = answers.filter(a => a.text !== '(Skipped)').length;
  const skippedCount = answers.filter(a => a.text === '(Skipped)').length;

  const handleGenerateLearningPath = async () => {
    try {
      setIsGeneratingPath(true);
      const path = await generateLearningPath(
        questions,
        answers,
        interviewData.jobDescription || ''
      );
      setLearningPath(path);

      const blob = new Blob([path], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'learning-path.md';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating learning path:', error);
    } finally {
      setIsGeneratingPath(false);
    }
  };

  const handleRestart = () => {
    resetInterview();
    navigate('/');
  };

  if (questions.length === 0) return null;

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-4xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >

      {/* Coming Soon Banner */}
      <motion.div
        className="mb-6 p-4 rounded-xl bg-gradient-to-r from-neon-cyan/10 via-neon-purple/10 to-neon-cyan/10 border border-neon-cyan/20 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.05, duration: 0.2 }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Sparkles size={16} className="text-neon-cyan" />
          </motion.div>
          <span className="text-sm font-bold text-neon-cyan uppercase tracking-wider">Coming Soon</span>
          <motion.div animate={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Sparkles size={16} className="text-neon-cyan" />
          </motion.div>
        </div>
        <p className="text-xs text-slate-400">
          Detailed analytics, PDF export, and shareable report links are on the way!
        </p>
      </motion.div>

      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/20 items-center justify-center mb-4"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.12 }}
        >
          <Trophy size={32} className="text-neon-cyan" />
        </motion.div>
        <motion.h1
          className="text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.16 }}
        >
          Interview Complete
        </motion.h1>
        <motion.p
          className="text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          You answered {answeredCount} of {questions.length} questions
          {skippedCount > 0 && <span> &middot; {skippedCount} skipped</span>}
        </motion.p>
      </motion.div>

      {/* Questions List */}
      <motion.div
        className="glass-card p-5 sm:p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={16} className="text-neon-cyan" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Questions Asked</h2>
        </div>

        <div className="space-y-3">
          {questions.map((question, idx) => {
            const answer = answers.find(a => a.questionId === question.id);
            const isSkipped = answer?.text === '(Skipped)';
            const hasAnswer = answer && !isSkipped;

            return (
              <motion.div
                key={question.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.03, duration: 0.2 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                {hasAnswer ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.25 + idx * 0.03 }}
                  >
                    <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                  </motion.div>
                ) : isSkipped ? (
                  <XCircle size={16} className="text-red-400 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono text-slate-600">Q{idx + 1}</span>
                    <div className={`badge text-[10px] py-0 ${question.type === 'code' ? 'badge-purple' : 'badge-cyan'}`}>
                      {question.type === 'code' ? <Code2 size={9} className="mr-1" /> : <Mic size={9} className="mr-1" />}
                      {question.type}
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 truncate">{question.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Learning Path */}
      <motion.div
        className="glass-card p-5 sm:p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-neon-purple" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Personalized Learning Path</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Generate an AI-powered learning path based on your interview performance. Includes skill assessment,
          study plan, recommended resources, and progress milestones.
        </p>
        <AnimatePresence mode="wait">
          {!learningPath ? (
            <motion.button
              key="generate"
              onClick={handleGenerateLearningPath}
              disabled={isGeneratingPath}
              whileHover={!isGeneratingPath ? { scale: 1.03, boxShadow: '0 0 20px rgba(0,240,255,0.2)' } : {}}
              whileTap={!isGeneratingPath ? { scale: 0.97 } : {}}
              className="btn-neon flex items-center gap-2 text-sm"
            >
              {isGeneratingPath ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Generate & Download Learning Path
                </>
              )}
            </motion.button>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-xs text-green-400"
            >
              <CheckCircle2 size={14} />
              <span>Learning path downloaded as learning-path.md</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-3"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={handleRestart}
          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(0,240,255,0.2)' }}
          whileTap={{ scale: 0.95 }}
          className="btn-neon flex items-center gap-2 text-sm"
        >
          <RotateCcw size={16} />
          Start New Interview
        </motion.button>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            to="/history"
            className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium
              bg-dark-600 text-slate-300 border border-white/5 hover:bg-dark-500 hover:text-white transition-all"
          >
            <BookOpen size={16} />
            View History
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Report;
