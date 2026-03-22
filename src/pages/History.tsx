import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, ChevronDown, Trash2, Building2, Briefcase,
  ArrowLeft, Sparkles, Code2, Mic, CheckCircle2, XCircle, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InterviewSession {
  id: string;
  date: string;
  company: string;
  position: string;
  questionCount: number;
  answeredCount: number;
  questions: Array<{ id: number; text: string; type: 'voice' | 'code' }>;
  answers: Array<{
    questionId: number;
    text: string;
    evaluation?: { score: number; feedback: string; recommendedAnswer: string };
  }>;
}

const STORAGE_KEY = 'interviewpro_history';

const History: React.FC = () => {
  const [sessions, setSessions] = useState<InterviewSession[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all interview history? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      setSessions([]);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-4xl"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/20 flex items-center justify-center"
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.1 }}
            >
              <Clock size={20} className="text-neon-cyan" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">Interview History</h1>
          </div>
          <p className="text-slate-500 text-sm ml-[52px]">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded
          </p>
        </div>

        {sessions.length > 0 && (
          <motion.button
            onClick={clearHistory}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12 }}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(248,113,113,0.1)' }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium
              text-red-400/70 border border-red-400/10 hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
            Clear All
          </motion.button>
        )}
      </motion.div>

      {/* Empty state */}
      {sessions.length === 0 && (
        <motion.div
          className="glass-card p-10 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <motion.div
            className="inline-flex w-16 h-16 rounded-2xl bg-dark-700 items-center justify-center mb-4"
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.12 }}
          >
            <FileText size={28} className="text-slate-600" />
          </motion.div>
          <h2 className="text-lg font-semibold text-slate-300 mb-2">No History Yet</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Complete an interview to see your past sessions here. Your answers and performance will be saved automatically.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/"
              className="btn-neon inline-flex items-center gap-2 text-sm"
            >
              <Sparkles size={14} />
              Start Your First Interview
            </Link>
          </motion.div>
        </motion.div>
      )}

      {/* Sessions list */}
      <div className="space-y-3">
        {sessions.map((session, i) => {
          const isExpanded = expandedId === session.id;

          return (
            <motion.div
              key={session.id}
              className="glass-card overflow-hidden"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 + i * 0.03, duration: 0.2 }}
              layout
            >
              {/* Session header */}
              <motion.button
                onClick={() => setExpandedId(isExpanded ? null : session.id)}
                className="w-full p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-all text-left"
                whileTap={{ scale: 0.995 }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {session.company && (
                      <span className="badge badge-purple text-[10px]">
                        <Building2 size={10} className="mr-1" />
                        {session.company}
                      </span>
                    )}
                    {session.position && (
                      <span className="badge badge-cyan text-[10px]">
                        <Briefcase size={10} className="mr-1" />
                        {session.position}
                      </span>
                    )}
                    {!session.company && !session.position && (
                      <span className="badge badge-cyan text-[10px]">General Interview</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatDate(session.date)} &middot; {session.questionCount} questions &middot; {session.answeredCount} answered
                  </p>
                </div>

                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                >
                  <ChevronDown size={16} className="text-slate-600 flex-shrink-0" />
                </motion.div>
              </motion.button>

              {/* Expanded Q&A */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/5 p-4 space-y-2">
                      {session.questions.map((q, idx) => {
                        const answer = session.answers.find(a => a.questionId === q.id);
                        const isSkipped = answer?.text === '(Skipped)';
                        const hasAnswer = answer && !isSkipped;

                        return (
                          <motion.div
                            key={q.id}
                            className="p-3 rounded-lg bg-dark-700/50"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.04, duration: 0.3 }}
                          >
                            <div className="flex items-start gap-2 mb-1.5">
                              {hasAnswer ? (
                                <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                              ) : (
                                <XCircle size={14} className="text-slate-600 mt-0.5 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-mono text-slate-600">Q{idx + 1}</span>
                                  <div className={`badge text-[10px] py-0 ${q.type === 'code' ? 'badge-purple' : 'badge-cyan'}`}>
                                    {q.type === 'code' ? <Code2 size={9} className="mr-1" /> : <Mic size={9} className="mr-1" />}
                                    {q.type}
                                  </div>
                                </div>
                                <p className="text-sm text-slate-300 mb-1">{q.text}</p>
                                {hasAnswer && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 }}
                                    className="mt-2 p-2 rounded bg-dark-800/50 border border-white/5"
                                  >
                                    <p className="text-xs text-slate-500 mb-0.5">Your answer:</p>
                                    <p className="text-xs text-slate-400 whitespace-pre-wrap">{answer.text}</p>
                                  </motion.div>
                                )}
                                {isSkipped && (
                                  <p className="text-xs text-slate-600 italic mt-1">Skipped</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Back button */}
      {sessions.length > 0 && (
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium
                bg-dark-600 text-slate-300 border border-white/5 hover:bg-dark-500 hover:text-white transition-all"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default History;
