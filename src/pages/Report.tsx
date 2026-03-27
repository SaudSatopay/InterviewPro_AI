import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, Trophy, RotateCcw, CheckCircle2,
  XCircle, Code2, Mic, Download, ChevronDown, ChevronUp,
  Loader2, Sparkles, TrendingUp, AlertTriangle, Target,
  MessageSquare, Lightbulb, BarChart3, Award, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterview } from '../context/InterviewContext';
import { generateLearningPath } from '../services/aiService';

const HISTORY_KEY = 'interviewpro_history';
const MAX_SESSIONS = 50;

const ScoreRing = ({ score, size = 120, delay = 0 }: { score: number; size?: number; delay?: number }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = score >= 80 ? '#22d3ee' : score >= 60 ? '#a855f7' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth="6" fill="none"
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.5 }}
      >
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-400">/ 100</span>
      </motion.div>
    </div>
  );
};

const SmallScoreBar = ({ score, delay = 0 }: { score: number; delay?: number }) => {
  const color = score >= 80 ? 'bg-cyan-400' : score >= 60 ? 'bg-purple-400' : score >= 40 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, delay, ease: 'easeOut' }}
        />
      </div>
      <span className="text-sm font-mono text-slate-300 w-8 text-right">{score}</span>
    </div>
  );
};

const Report: React.FC = () => {
  const navigate = useNavigate();
  const { interviewData, resetInterview } = useInterview();
  const { questions, answers, overallScore, recommendedTopics, readyForInterview } = interviewData;
  const historySaved = useRef(false);

  const [learningPath, setLearningPath] = useState<string | null>(null);
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    if (questions.length === 0) {
      navigate('/home');
    }
  }, [questions, navigate]);

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
  const evaluatedAnswers = answers.filter(a => a.evaluation && a.text !== '(Skipped)');
  const avgScore = evaluatedAnswers.length > 0
    ? Math.round(evaluatedAnswers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) / evaluatedAnswers.length)
    : overallScore || 0;

  const highScoreCount = evaluatedAnswers.filter(a => (a.evaluation?.score || 0) >= 80).length;
  const lowScoreCount = evaluatedAnswers.filter(a => (a.evaluation?.score || 0) < 50).length;

  const handleGenerateLearningPath = async () => {
    try {
      setIsGeneratingPath(true);
      const path = await generateLearningPath(questions, answers, interviewData.jobDescription || '');
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
    navigate('/home');
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
      {/* Header with Score */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <motion.div
          className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/20 items-center justify-center mb-4"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.08 }}
        >
          <Trophy size={32} className="text-neon-cyan" />
        </motion.div>
        <motion.h1
          className="text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
        >
          Interview Complete
        </motion.h1>
        <motion.p
          className="text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.16 }}
        >
          {interviewData.company && <span className="text-neon-cyan">{interviewData.company}</span>}
          {interviewData.company && interviewData.position && ' · '}
          {interviewData.position && <span>{interviewData.position}</span>}
          {!interviewData.company && !interviewData.position && 'Great job completing your practice session!'}
        </motion.p>
      </motion.div>

      {/* Score Overview */}
      <motion.div
        className="glass-card p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.2 }}
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Score Ring */}
          <div className="flex flex-col items-center">
            <ScoreRing score={avgScore} delay={0.3} />
            <motion.div
              className="mt-3 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span className="text-sm font-semibold text-white">Overall Score</span>
              <div className={`text-xs mt-1 px-3 py-1 rounded-full inline-block ${
                avgScore >= 80 ? 'bg-cyan-500/10 text-cyan-400' :
                avgScore >= 60 ? 'bg-purple-500/10 text-purple-400' :
                avgScore >= 40 ? 'bg-amber-500/10 text-amber-400' :
                'bg-red-500/10 text-red-400'
              }`}>
                {avgScore >= 80 ? 'Excellent' : avgScore >= 60 ? 'Good' : avgScore >= 40 ? 'Needs Work' : 'Keep Practicing'}
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            {[
              { icon: CheckCircle2, label: 'Answered', value: answeredCount, total: questions.length, color: 'text-green-400' },
              { icon: XCircle, label: 'Skipped', value: skippedCount, total: questions.length, color: 'text-red-400' },
              { icon: Award, label: 'High Scores', value: highScoreCount, total: evaluatedAnswers.length, color: 'text-cyan-400' },
              { icon: AlertTriangle, label: 'Needs Improvement', value: lowScoreCount, total: evaluatedAnswers.length, color: 'text-amber-400' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="p-3 rounded-xl bg-dark-700/50 border border-white/5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05, duration: 0.2 }}
                whileHover={{ borderColor: 'rgba(34,211,238,0.15)', transition: { duration: 0.15 } }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon size={14} className={stat.color} />
                  <span className="text-xs text-slate-400">{stat.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-white">{stat.value}</span>
                  <span className="text-xs text-slate-500">/ {stat.total}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Readiness Indicator */}
        {readyForInterview !== null && (
          <motion.div
            className={`mt-5 p-3 rounded-xl flex items-center gap-3 ${
              readyForInterview
                ? 'bg-green-500/5 border border-green-500/20'
                : 'bg-amber-500/5 border border-amber-500/20'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {readyForInterview ? (
              <>
                <Zap size={18} className="text-green-400" />
                <span className="text-sm text-green-300">You're showing strong readiness for this interview!</span>
              </>
            ) : (
              <>
                <TrendingUp size={18} className="text-amber-400" />
                <span className="text-sm text-amber-300">More practice recommended before the real interview.</span>
              </>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Recommended Topics */}
      {recommendedTopics && recommendedTopics.length > 0 && (
        <motion.div
          className="glass-card p-5 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Areas to Focus On</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedTopics.map((topic, i) => (
              <motion.span
                key={i}
                className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-medium border border-amber-500/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                whileHover={{ scale: 1.05, borderColor: 'rgba(245,158,11,0.4)' }}
              >
                {topic}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Question-by-Question Breakdown */}
      <motion.div
        className="glass-card p-5 sm:p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 size={16} className="text-neon-cyan" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Question Breakdown</h2>
        </div>

        <div className="space-y-3">
          {questions.map((question, idx) => {
            const answer = answers.find(a => a.questionId === question.id);
            const isSkipped = answer?.text === '(Skipped)';
            const hasAnswer = answer && !isSkipped;
            const evaluation = answer?.evaluation;
            const isExpanded = expandedQuestion === question.id;

            return (
              <motion.div
                key={question.id}
                className="rounded-xl border border-white/5 overflow-hidden bg-dark-700/30"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + idx * 0.03, duration: 0.2 }}
              >
                {/* Question Header */}
                <motion.button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors duration-150"
                  onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                  whileTap={{ scale: 0.995 }}
                >
                  {hasAnswer ? (
                    <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
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
                      {evaluation && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          evaluation.score >= 80 ? 'bg-cyan-500/10 text-cyan-400' :
                          evaluation.score >= 60 ? 'bg-purple-500/10 text-purple-400' :
                          evaluation.score >= 40 ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {evaluation.score}/100
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 truncate">{question.text}</p>
                  </div>

                  {evaluation && <SmallScoreBar score={evaluation.score} delay={0.4 + idx * 0.03} />}

                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex-shrink-0 ml-2"
                  >
                    <ChevronDown size={16} className="text-slate-500" />
                  </motion.div>
                </motion.button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                        {/* Your Answer */}
                        {hasAnswer && (
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <MessageSquare size={12} className="text-slate-400" />
                              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Answer</span>
                            </div>
                            <div className="p-3 rounded-lg bg-dark-600/50 border border-white/5">
                              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{answer?.text}</p>
                            </div>
                          </div>
                        )}

                        {isSkipped && (
                          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                            <p className="text-sm text-red-400 italic">This question was skipped.</p>
                          </div>
                        )}

                        {/* AI Feedback */}
                        {evaluation && (
                          <>
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <Sparkles size={12} className="text-neon-cyan" />
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Feedback</span>
                              </div>
                              <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                                <p className="text-sm text-slate-300 leading-relaxed">{evaluation.feedback}</p>
                              </div>
                            </div>

                            {/* Recommended Answer */}
                            {evaluation.recommendedAnswer && (
                              <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <Lightbulb size={12} className="text-purple-400" />
                                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recommended Answer</span>
                                </div>
                                <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                                  <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{evaluation.recommendedAnswer}</p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
        transition={{ delay: 0.4, duration: 0.2 }}
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
        transition={{ delay: 0.45 }}
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
